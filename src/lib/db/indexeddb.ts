import Dexie, { type Table } from "dexie";
import { GRID_COLS, GRID_ROWS, TRASH_RETENTION_DAYS } from "@/lib/constants";
import type { DataStore } from "@/lib/db/datastore";
import {
  bitSchema,
  chunkSchema,
  createBitSchema,
  createChunkSchema,
  createNodeSchema,
  nodeSchema,
  type Bit,
  type Chunk,
  type CreateBit,
  type CreateChunk,
  type CreateNode,
  type Node,
} from "@/lib/db/schema";
import { findNearestEmptyCell } from "@/lib/utils/bfs";

type MutableNodeInput = Omit<Node, "id" | "createdAt" | "deletedAt" | "mtime">;
type MutableBitInput = Omit<Bit, "id" | "createdAt" | "deletedAt" | "mtime">;

type SearchResult = {
  type: "node" | "bit" | "chunk";
  item: Node | Bit | Chunk;
  parentPath: string[];
  parentNodeId?: string;
  parentBitId?: string;
  grandparentNodeId?: string;
};

type TableLike<T extends { id: string }> = {
  get(id: string): Promise<T | undefined>;
  put(value: T): Promise<unknown>;
  bulkPut(values: T[]): Promise<unknown>;
  delete(id: string): Promise<unknown>;
  bulkDelete(ids: string[]): Promise<unknown>;
  toArray(): Promise<T[]>;
};

type DatabaseLike = {
  nodes: TableLike<Node>;
  bits: TableLike<Bit>;
  chunks: TableLike<Chunk>;
};

const ROOT_PARENT_KEY = "__root__";
const DEFAULT_PROMOTED_NODE_COLOR = "hsl(221, 83%, 53%)";

/**
 * Thrown when a deadline write would violate the parent–child deadline constraint.
 * Consumers can catch this and surface DeadlineConflictModal or DeadlineConflictOverlay.
 */
export class DeadlineConflictError extends Error {
  constructor(
    /** "child_exceeds_parent" — bit/chunk deadline > parent deadline */
    public readonly conflictType: "child_exceeds_parent",
    /** IDs of the conflicting items */
    public readonly conflictingIds: string[],
  ) {
    super("Deadline conflict");
    this.name = "DeadlineConflictError";
  }
}

const nodeUpdateSchema = nodeSchema
  .omit({ id: true, createdAt: true, deletedAt: true, mtime: true })
  .partial();
const bitUpdateSchema = bitSchema
  .omit({ id: true, createdAt: true, deletedAt: true, mtime: true })
  .partial();
const chunkUpdateSchema = chunkSchema.omit({ id: true, parentId: true }).partial();

export class GridDODatabase extends Dexie {
  nodes!: Table<Node, string>;
  bits!: Table<Bit, string>;
  chunks!: Table<Chunk, string>;

  constructor() {
    super("GridDO");

    this.version(1).stores({
      nodes: "id,parentId,deletedAt,[parentId+deletedAt],level",
      bits: "id,parentId,deletedAt,[parentId+deletedAt],status,deadline,[parentId+status]",
      chunks: "id,parentId,[parentId+order],time,status",
    });
  }
}

export class IndexedDBDataStore implements DataStore {
  constructor(private readonly database: DatabaseLike) {}

  async getNode(id: string): Promise<Node | undefined> {
    return this.database.nodes.get(id);
  }

  async getNodes(parentId: string | null): Promise<Node[]> {
    const nodes = await this.database.nodes.toArray();
    return sortGridItems(nodes.filter((node) => node.parentId === parentId && node.deletedAt === null));
  }

  async createNode(data: CreateNode): Promise<Node> {
    const parsed = createNodeSchema.parse(data);

    await this.ensureGridCellAvailable(parsed.parentId, parsed.x, parsed.y);

    const timestamp = Date.now();
    const node = nodeSchema.parse({
      ...parsed,
      id: crypto.randomUUID(),
      mtime: timestamp,
      createdAt: timestamp,
      deletedAt: null,
    });

    await this.write(async () => {
      await this.database.nodes.put(node);

      if (node.parentId) {
        await this.touchNodeIds([node.parentId], timestamp);
      }
    });

    return node;
  }

  async updateNode(id: string, data: Partial<Node>): Promise<void> {
    const existing = await this.getRequiredNode(id);
    const parsed = nodeUpdateSchema.parse(data);
    const next = {
      ...existing,
      ...parsed,
    };

    if (
      next.parentId !== existing.parentId ||
      next.x !== existing.x ||
      next.y !== existing.y
    ) {
      await this.ensureGridCellAvailable(next.parentId, next.x, next.y, {
        excludedNodeIds: new Set([existing.id]),
      });
    }

    const timestamp = Date.now();
    if (touchesNodeMtime(parsed)) {
      next.mtime = timestamp;
    }

    await this.write(async () => {
      await this.database.nodes.put(nodeSchema.parse(next));

      if (next.parentId !== existing.parentId) {
        await this.touchNodeIds(
          [existing.parentId, next.parentId].filter(isDefined),
          timestamp,
        );
      }
    });
  }

  async softDeleteNode(id: string): Promise<void> {
    const node = await this.getRequiredNode(id);
    const { nodes, bits } = await this.collectNodeSubtree(id);
    const timestamp = Date.now();

    await this.write(async () => {
      await this.saveNodes(
        nodes.map((item) => ({
          ...item,
          deletedAt: timestamp,
        })),
      );
      await this.saveBits(
        bits.map((item) => ({
          ...item,
          deletedAt: timestamp,
        })),
      );

      if (node.parentId) {
        await this.touchNodeIds([node.parentId], timestamp);
      }
    });
  }

  async restoreNode(id: string): Promise<void> {
    const node = await this.getRequiredNode(id);

    if (node.parentId) {
      const parentNode = await this.database.nodes.get(node.parentId);
      if (parentNode && parentNode.deletedAt !== null) {
        await this.restoreNode(parentNode.id);
      }
    }

    const refreshedNode = await this.getRequiredNode(id);
    if (refreshedNode.deletedAt === null) {
      return;
    }

    const [allNodes, allBits] = await Promise.all([
      this.database.nodes.toArray(),
      this.database.bits.toArray(),
    ]);
    const nodesById = new Map(allNodes.map((candidate) => [candidate.id, candidate]));
    const restoreAnchor = refreshedNode.deletedAt;
    const subtreeIds = collectDescendantNodeIds(id, allNodes);
    const subtreeIdSet = new Set(subtreeIds);
    const occupiedByParent = buildOccupiedByParent(
      allNodes.filter((item) => item.deletedAt === null),
      allBits.filter((item) => item.deletedAt === null),
    );
    const restoredNodes: Node[] = [];
    const restorableNodeIds = new Set<string>();

    for (const nodeId of subtreeIds) {
      const current = nodesById.get(nodeId);
      if (!current) {
        continue;
      }

      if (current.deletedAt === null) {
        restorableNodeIds.add(current.id);
        continue;
      }

      if (!isWithinRestoreWindow(current.deletedAt, restoreAnchor)) {
        continue;
      }

      const restored = placeRestoredGridItem(
        { ...current, deletedAt: null },
        occupiedByParent,
      );
      restoredNodes.push(restored);
      restorableNodeIds.add(restored.id);
    }

    const restoredBits = sortGridItems(
      allBits.filter(
        (bit) =>
          subtreeIdSet.has(bit.parentId) &&
          bit.deletedAt !== null &&
          isWithinRestoreWindow(bit.deletedAt, restoreAnchor) &&
          restorableNodeIds.has(bit.parentId),
      ),
    ).map((bit) => placeRestoredGridItem({ ...bit, deletedAt: null }, occupiedByParent));

    await this.write(async () => {
      await this.saveNodes(restoredNodes);
      await this.saveBits(restoredBits);

      if (refreshedNode.parentId) {
        await this.touchNodeIds([refreshedNode.parentId], Date.now());
      }
    });
  }

  async hardDeleteNode(id: string): Promise<void> {
    const node = await this.getRequiredNode(id);
    const { nodeIds, bitIds } = await this.collectNodeSubtreeIds(id);
    const chunks = await this.database.chunks.toArray();
    const chunkIds = chunks
      .filter((chunk) => bitIds.has(chunk.parentId))
      .map((chunk) => chunk.id);
    const timestamp = Date.now();

    await this.write(async () => {
      await this.database.chunks.bulkDelete(chunkIds);
      await this.database.bits.bulkDelete([...bitIds]);
      await this.database.nodes.bulkDelete([...nodeIds]);

      if (node.parentId) {
        await this.touchNodeIds([node.parentId], timestamp);
      }
    });
  }

  async cleanupExpiredTrash(): Promise<void> {
    const expirationCutoff = Date.now() - TRASH_RETENTION_DAYS * 86_400_000;
    const [nodes, bits] = await Promise.all([
      this.database.nodes.toArray(),
      this.database.bits.toArray(),
    ]);
    const expiredNodeIds = nodes
      .filter((node) => node.deletedAt !== null && node.deletedAt < expirationCutoff)
      .map((node) => node.id);
    const expiredBitIds = bits
      .filter((bit) => bit.deletedAt !== null && bit.deletedAt < expirationCutoff)
      .map((bit) => bit.id);

    for (const nodeId of expiredNodeIds) {
      const existingNode = await this.database.nodes.get(nodeId);
      if (!existingNode) {
        continue;
      }

      await this.hardDeleteNode(nodeId);
    }

    for (const bitId of expiredBitIds) {
      const existingBit = await this.database.bits.get(bitId);
      if (!existingBit) {
        continue;
      }

      const parentNode = await this.database.nodes.get(existingBit.parentId);
      if (!parentNode) {
        continue;
      }

      await this.hardDeleteBit(bitId);
    }
  }

  async getBit(id: string): Promise<Bit | undefined> {
    return this.database.bits.get(id);
  }

  async getBits(parentId: string): Promise<Bit[]> {
    const bits = await this.database.bits.toArray();
    return sortGridItems(bits.filter((bit) => bit.parentId === parentId && bit.deletedAt === null));
  }

  async getBitsForNode(nodeId: string): Promise<Bit[]> {
    const bits = await this.database.bits.toArray();
    return bits.filter((b) => b.parentId === nodeId && b.deletedAt === null);
  }

  async getAllActiveNodes(): Promise<Node[]> {
    const nodes = await this.database.nodes.toArray();
    return nodes.filter((n) => n.deletedAt === null);
  }

  async getAllActiveBits(): Promise<Bit[]> {
    const bits = await this.database.bits.toArray();
    return bits.filter((b) => b.deletedAt === null);
  }

  async createBit(data: CreateBit): Promise<Bit> {
    const parsed = createBitSchema.parse(data);

    await this.ensureGridCellAvailable(parsed.parentId, parsed.x, parsed.y);
    await this.assertBitDeadlineFitsParent(parsed.parentId, parsed.deadline);

    const timestamp = Date.now();
    const bit = bitSchema.parse({
      ...parsed,
      id: crypto.randomUUID(),
      status: "active",
      mtime: timestamp,
      createdAt: timestamp,
      deletedAt: null,
    });

    await this.write(async () => {
      await this.database.bits.put(bit);
      await this.touchNodeIds([bit.parentId], timestamp);
    });

    return bit;
  }

  async updateBit(id: string, data: Partial<Bit>): Promise<void> {
    const existing = await this.getRequiredBit(id);
    const parsed = bitUpdateSchema.parse(data);
    const next = {
      ...existing,
      ...parsed,
    };

    if (
      next.parentId !== existing.parentId ||
      next.x !== existing.x ||
      next.y !== existing.y
    ) {
      await this.ensureGridCellAvailable(next.parentId, next.x, next.y, {
        excludedBitIds: new Set([existing.id]),
      });
    }

    await this.assertBitDeadlineFitsParent(next.parentId, next.deadline, existing.id);

    const timestamp = Date.now();
    const statusChanged = parsed.status !== undefined && parsed.status !== existing.status;
    if (touchesBitMtime(parsed)) {
      next.mtime = timestamp;
    }

    const mtimeTouched = touchesBitMtime(parsed);

    await this.write(async () => {
      await this.database.bits.put(bitSchema.parse(next));

      const parentIds = new Set<string>();

      if (next.parentId !== existing.parentId) {
        parentIds.add(existing.parentId);
        parentIds.add(next.parentId);
      }
      if (statusChanged || mtimeTouched) {
        parentIds.add(next.parentId);
      }

      if (parentIds.size > 0) {
        await this.touchNodeIds([...parentIds], timestamp);
      }
    });
  }

  async softDeleteBit(id: string): Promise<void> {
    const bit = await this.getRequiredBit(id);
    const timestamp = Date.now();

    await this.write(async () => {
      await this.database.bits.put({
        ...bit,
        deletedAt: timestamp,
      });
      await this.touchNodeIds([bit.parentId], timestamp);
    });
  }

  async restoreBit(id: string): Promise<void> {
    const bit = await this.getRequiredBit(id);
    const parentNode = await this.getRequiredNode(bit.parentId);

    if (parentNode.deletedAt !== null) {
      await this.restoreNode(parentNode.id);
    }

    const refreshedBit = await this.getRequiredBit(id);
    if (refreshedBit.deletedAt === null) {
      return;
    }

    const [allNodes, allBits] = await Promise.all([
      this.database.nodes.toArray(),
      this.database.bits.toArray(),
    ]);
    const occupiedByParent = buildOccupiedByParent(
      allNodes.filter((item) => item.deletedAt === null),
      allBits.filter((item) => item.deletedAt === null),
    );
    const restoredBit = placeRestoredGridItem(
      { ...refreshedBit, deletedAt: null },
      occupiedByParent,
    );

    await this.write(async () => {
      await this.database.bits.put(bitSchema.parse(restoredBit));
      await this.touchNodeIds([restoredBit.parentId], Date.now());
    });
  }

  async hardDeleteBit(id: string): Promise<void> {
    const bit = await this.getRequiredBit(id);
    const chunks = await this.database.chunks.toArray();
    const chunkIds = chunks
      .filter((chunk) => chunk.parentId === id)
      .map((chunk) => chunk.id);
    const timestamp = Date.now();

    await this.write(async () => {
      await this.database.chunks.bulkDelete(chunkIds);
      await this.database.bits.delete(id);
      await this.touchNodeIds([bit.parentId], timestamp);
    });
  }

  async getChunks(bitId: string): Promise<Chunk[]> {
    const chunks = await this.database.chunks.toArray();
    return sortChunks(chunks.filter((chunk) => chunk.parentId === bitId));
  }

  async createChunk(data: CreateChunk): Promise<Chunk> {
    const parsed = createChunkSchema.parse(data);
    const bit = await this.getRequiredBit(parsed.parentId);

    await this.assertChunkTimeFitsBit(bit, parsed.time);

    const timestamp = Date.now();
    const chunk = chunkSchema.parse({
      ...parsed,
      id: crypto.randomUUID(),
      status: "incomplete",
    });

    await this.write(async () => {
      await this.database.chunks.put(chunk);
      await this.database.bits.put({
        ...bit,
        status: "active",
        mtime: timestamp,
      });
      await this.touchNodeIds([bit.parentId], timestamp);
    });

    return chunk;
  }

  async updateChunk(id: string, data: Partial<Chunk>): Promise<void> {
    const existing = await this.getRequiredChunk(id);
    const parsed = chunkUpdateSchema.parse(data);
    const bit = await this.getRequiredBit(existing.parentId);
    const next = { ...existing, ...parsed };

    await this.assertChunkTimeFitsBit(bit, next.time);

    const timestamp = Date.now();
    // Detect uncheck: complete → incomplete triggers sticky force-complete rule
    const isUnchecking = existing.status === "complete" && next.status === "incomplete";

    await this.write(async () => {
      await this.database.chunks.put(chunkSchema.parse(next));
      await this.updateBitCompletionAndCascade(bit.id, timestamp, {
        stickyIfForceCompleted: isUnchecking,
      });
    });
  }

  async deleteChunk(id: string): Promise<void> {
    const chunk = await this.getRequiredChunk(id);
    const timestamp = Date.now();

    await this.write(async () => {
      await this.database.chunks.delete(id);
      await this.updateBitCompletionAndCascade(chunk.parentId, timestamp);
    });
  }

  async getActiveGridContents(parentId: string | null): Promise<{ nodes: Node[]; bits: Bit[] }> {
    const [nodes, bits] = await Promise.all([
      this.getNodes(parentId),
      parentId === null ? Promise.resolve([]) : this.getBits(parentId),
    ]);

    return { nodes, bits };
  }

  async getCalendarItems(): Promise<{ bits: Bit[]; chunks: Chunk[] }> {
    const [bits, chunks] = await Promise.all([
      this.database.bits.toArray(),
      this.database.chunks.toArray(),
    ]);
    const activeBits = bits.filter((bit) => bit.deletedAt === null);
    const activeBitIds = new Set(activeBits.map((bit) => bit.id));

    return {
      bits: [...activeBits]
        .filter((bit) => bit.deadline !== null)
        .sort((left, right) => (left.deadline ?? 0) - (right.deadline ?? 0)),
      chunks: [...chunks]
        .filter((chunk) => chunk.time !== null && activeBitIds.has(chunk.parentId))
        .sort((left, right) => (left.time ?? 0) - (right.time ?? 0)),
    };
  }

  async getTrashedItems(): Promise<{ nodes: Node[]; bits: Bit[] }> {
    const [nodes, bits] = await Promise.all([
      this.database.nodes.toArray(),
      this.database.bits.toArray(),
    ]);

    return {
      nodes: nodes.filter((node) => node.deletedAt !== null),
      bits: bits.filter((bit) => bit.deletedAt !== null),
    };
  }

  async searchAll(query: string): Promise<SearchResult[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    const [nodes, bits, chunks] = await Promise.all([
      this.database.nodes.toArray(),
      this.database.bits.toArray(),
      this.database.chunks.toArray(),
    ]);
    const activeNodes = nodes.filter((node) => node.deletedAt === null);
    const activeBits = bits.filter((bit) => bit.deletedAt === null);
    const activeBitIds = new Set(activeBits.map((bit) => bit.id));
    const nodesById = new Map(nodes.map((node) => [node.id, node]));
    const bitsById = new Map(bits.map((bit) => [bit.id, bit]));
    const results: SearchResult[] = [];

    for (const node of activeNodes) {
      if (node.title.toLowerCase().includes(normalized)) {
        results.push({
          type: "node",
          item: node,
          parentPath: buildNodeTitlePath(node.parentId, nodesById),
        });
      }
    }

    for (const bit of activeBits) {
      if (bit.title.toLowerCase().includes(normalized)) {
        results.push({
          type: "bit",
          item: bit,
          parentPath: buildNodeTitlePath(bit.parentId, nodesById),
          parentNodeId: bit.parentId,
        });
      }
    }

    for (const chunk of chunks) {
      if (!activeBitIds.has(chunk.parentId) || !chunk.title.toLowerCase().includes(normalized)) {
        continue;
      }

      const parentBit = bitsById.get(chunk.parentId);

      results.push({
        type: "chunk",
        item: chunk,
        parentPath: parentBit
          ? [...buildNodeTitlePath(parentBit.parentId, nodesById), parentBit.title]
          : [],
        parentBitId: chunk.parentId,
        grandparentNodeId: parentBit?.parentId,
      });
    }

    return results;
  }

  async getGridOccupancy(parentId: string | null): Promise<Set<string>> {
    const [nodes, bits] = await Promise.all([
      this.database.nodes.toArray(),
      this.database.bits.toArray(),
    ]);
    const occupancy = new Set<string>();

    for (const node of nodes) {
      if (node.parentId === parentId && node.deletedAt === null) {
        occupancy.add(gridKey(node.x, node.y));
      }
    }

    for (const bit of bits) {
      if (bit.parentId === parentId && bit.deletedAt === null) {
        occupancy.add(gridKey(bit.x, bit.y));
      }
    }

    return occupancy;
  }

  async getChildDeadlineConflicts(nodeId: string, deadline: number): Promise<Bit[]> {
    const bits = await this.database.bits.toArray();
    return bits.filter(
      (bit) => bit.parentId === nodeId && bit.deletedAt === null && bit.deadline !== null && bit.deadline > deadline,
    );
  }

  async promoteBitToNode(bitId: string): Promise<Node> {
    const [bit, parentNode, chunks] = await Promise.all([
      this.getRequiredBit(bitId),
      this.database.nodes.toArray(),
      this.getChunks(bitId),
    ]);
    const parent = parentNode.find((node) => node.id === bit.parentId);

    if (!parent) {
      throw new Error(`Parent node not found for bit: ${bitId}`);
    }

    await this.ensureGridCellAvailable(bit.parentId, bit.x, bit.y, {
      excludedBitIds: new Set([bit.id]),
    });

    const promotedLevel = parent.level + 1;
    if (promotedLevel > 2) {
      throw new Error("Cannot promote Bit to Node — maximum nesting depth reached");
    }

    const timestamp = Date.now();
    const newNode = nodeSchema.parse({
      id: crypto.randomUUID(),
      title: bit.title,
      color: DEFAULT_PROMOTED_NODE_COLOR,
      icon: bit.icon,
      deadline: bit.deadline,
      deadlineAllDay: bit.deadlineAllDay,
      mtime: timestamp,
      createdAt: timestamp,
      parentId: bit.parentId,
      level: promotedLevel,
      x: bit.x,
      y: bit.y,
      deletedAt: null,
    });

    const occupancy = new Set<string>();
    const promotedBits = chunks.map((chunk) => {
      const position = findFirstAvailableCell(occupancy);

      if (!position) {
        throw new Error("No grid cells available for promoted chunk bits");
      }

      occupancy.add(gridKey(position.x, position.y));

      return bitSchema.parse({
        id: crypto.randomUUID(),
        title: chunk.title,
        description: chunk.description,
        icon: bit.icon,
        deadline: chunk.time,
        deadlineAllDay: chunk.timeAllDay,
        priority: null,
        status: chunk.status === "complete" ? "complete" : "active",
        mtime: timestamp,
        createdAt: timestamp,
        parentId: newNode.id,
        x: position.x,
        y: position.y,
        deletedAt: null,
      });
    });

    await this.write(async () => {
      await this.database.nodes.put(newNode);
      await this.saveBits(promotedBits);
      await this.database.chunks.bulkDelete(chunks.map((chunk) => chunk.id));
      await this.database.bits.delete(bit.id);
      await this.touchNodeIds([parent.id], timestamp);
    });

    return newNode;
  }

  private async write<T>(scope: () => Promise<T>): Promise<T> {
    if (this.database instanceof GridDODatabase) {
      return this.database.transaction(
        "rw",
        this.database.nodes,
        this.database.bits,
        this.database.chunks,
        scope,
      );
    }

    return scope();
  }

  private async getRequiredNode(id: string): Promise<Node> {
    const node = await this.database.nodes.get(id);

    if (!node) {
      throw new Error(`Node not found: ${id}`);
    }

    return node;
  }

  private async getRequiredBit(id: string): Promise<Bit> {
    const bit = await this.database.bits.get(id);

    if (!bit) {
      throw new Error(`Bit not found: ${id}`);
    }

    return bit;
  }

  private async getRequiredChunk(id: string): Promise<Chunk> {
    const chunk = await this.database.chunks.get(id);

    if (!chunk) {
      throw new Error(`Chunk not found: ${id}`);
    }

    return chunk;
  }

  private async saveNodes(nodes: Node[]): Promise<void> {
    if (nodes.length > 0) {
      await this.database.nodes.bulkPut(nodes);
    }
  }

  private async saveBits(bits: Bit[]): Promise<void> {
    if (bits.length > 0) {
      await this.database.bits.bulkPut(bits);
    }
  }

  private async touchNodeIds(nodeIds: string[], timestamp: number): Promise<void> {
    if (nodeIds.length === 0) {
      return;
    }

    const ids = new Set(nodeIds);
    const nodes = await this.database.nodes.toArray();
    const updated = nodes
      .filter((node) => ids.has(node.id))
      .map((node) => ({
        ...node,
        mtime: timestamp,
      }));

    await this.saveNodes(updated);
  }

  private async assertBitDeadlineFitsParent(
    parentId: string,
    deadline: number | null,
    bitId?: string,
  ): Promise<void> {
    const parent = await this.getRequiredNode(parentId);
    if (deadline !== null && parent.deadline !== null && deadline > parent.deadline) {
      throw new DeadlineConflictError("child_exceeds_parent", bitId ? [bitId] : []);
    }
  }

  private async assertChunkTimeFitsBit(
    bit: Bit,
    time: number | null,
  ): Promise<void> {
    if (time !== null && bit.deadline !== null && time > bit.deadline) {
      throw new Error("Chunk time cannot exceed parent bit deadline");
    }
  }

  private async ensureGridCellAvailable(
    parentId: string | null,
    x: number,
    y: number,
    options?: {
      excludedNodeIds?: Set<string>;
      excludedBitIds?: Set<string>;
    },
  ): Promise<void> {
    const [nodes, bits] = await Promise.all([
      this.database.nodes.toArray(),
      this.database.bits.toArray(),
    ]);

    const occupiedByNode = nodes.some(
      (node) =>
        node.parentId === parentId &&
        node.deletedAt === null &&
        node.x === x &&
        node.y === y &&
        !(options?.excludedNodeIds?.has(node.id) ?? false),
    );
    const occupiedByBit = bits.some(
      (bit) =>
        bit.parentId === parentId &&
        bit.deletedAt === null &&
        bit.x === x &&
        bit.y === y &&
        !(options?.excludedBitIds?.has(bit.id) ?? false),
    );

    if (occupiedByNode || occupiedByBit) {
      throw new Error(`Grid cell ${gridKey(x, y)} is already occupied`);
    }
  }

  private async collectNodeSubtree(id: string): Promise<{ nodes: Node[]; bits: Bit[] }> {
    const [allNodes, allBits] = await Promise.all([
      this.database.nodes.toArray(),
      this.database.bits.toArray(),
    ]);
    const nodeIds = collectDescendantNodeIds(id, allNodes);
    const nodeIdSet = new Set(nodeIds);

    return {
      nodes: nodeIds
        .map((nodeId) => allNodes.find((node) => node.id === nodeId))
        .filter(isDefined),
      bits: allBits.filter((bit) => nodeIdSet.has(bit.parentId)),
    };
  }

  private async collectNodeSubtreeIds(
    id: string,
  ): Promise<{ nodeIds: Set<string>; bitIds: Set<string> }> {
    const { nodes, bits } = await this.collectNodeSubtree(id);
    return {
      nodeIds: new Set(nodes.map((node) => node.id)),
      bitIds: new Set(bits.map((bit) => bit.id)),
    };
  }

  private async updateBitCompletionAndCascade(
    bitId: string,
    timestamp: number,
    options?: {
      /**
       * When true, applies the sticky force-complete rule:
       * only revert a complete Bit to active if it was auto-completed
       * (i.e. exactly one chunk is now incomplete — the one just unchecked).
       * If 2+ chunks are incomplete, the Bit was force-completed → keep complete.
       */
      stickyIfForceCompleted?: boolean;
    },
  ): Promise<void> {
    const [bit, chunks] = await Promise.all([
      this.getRequiredBit(bitId),
      this.getChunks(bitId),
    ]);

    const allComplete = chunks.length > 0 && chunks.every((c) => c.status === "complete");
    let nextStatus: "active" | "complete";

    if (allComplete) {
      nextStatus = "complete";
    } else if (options?.stickyIfForceCompleted && bit.status === "complete") {
      // Sticky rule: if only 1 chunk is now incomplete, the bit was auto-completed → revert.
      // If 2+ incomplete, the bit was force-completed → remain complete.
      const incompleteCount = chunks.filter((c) => c.status === "incomplete").length;
      nextStatus = incompleteCount <= 1 ? "active" : "complete";
    } else {
      nextStatus = "active";
    }

    await this.database.bits.put({ ...bit, status: nextStatus, mtime: timestamp });
    await this.touchNodeIds([bit.parentId], timestamp);
  }
}

function sortGridItems<T extends { x: number; y: number }>(items: T[]): T[] {
  return [...items].sort((left, right) => left.y - right.y || left.x - right.x);
}

function sortChunks(items: Chunk[]): Chunk[] {
  return [...items].sort((left, right) => left.order - right.order);
}

function touchesNodeMtime(update: Partial<MutableNodeInput>): boolean {
  return Object.keys(update).some((key) => !["parentId", "x", "y"].includes(key));
}

function touchesBitMtime(update: Partial<MutableBitInput>): boolean {
  return Object.keys(update).some((key) => !["parentId", "x", "y"].includes(key));
}

function gridKey(x: number, y: number): string {
  return `${x},${y}`;
}

function parentKey(parentId: string | null): string {
  return parentId ?? ROOT_PARENT_KEY;
}

function buildOccupiedByParent(
  nodes: Node[],
  bits: Bit[],
): Map<string, Set<string>> {
  const occupiedByParent = new Map<string, Set<string>>();

  for (const node of nodes) {
    addOccupiedCell(occupiedByParent, node.parentId, node.x, node.y);
  }

  for (const bit of bits) {
    addOccupiedCell(occupiedByParent, bit.parentId, bit.x, bit.y);
  }

  return occupiedByParent;
}

function addOccupiedCell(
  occupiedByParent: Map<string, Set<string>>,
  parentId: string | null,
  x: number,
  y: number,
): void {
  const key = parentKey(parentId);
  const occupied = occupiedByParent.get(key) ?? new Set<string>();
  occupied.add(gridKey(x, y));
  occupiedByParent.set(key, occupied);
}

function placeRestoredGridItem<T extends { parentId: string | null; x: number; y: number }>(
  item: T,
  occupiedByParent: Map<string, Set<string>>,
): T {
  const occupied = occupiedByParent.get(parentKey(item.parentId)) ?? new Set<string>();
  let nextX = item.x;
  let nextY = item.y;

  if (occupied.has(gridKey(item.x, item.y))) {
    const fallback = findNearestEmptyCell(occupied, item.x, item.y);

    if (!fallback) {
      throw new Error("GRID_FULL");
    }

    nextX = fallback.x;
    nextY = fallback.y;
  }

  occupied.add(gridKey(nextX, nextY));
  occupiedByParent.set(parentKey(item.parentId), occupied);

  return {
    ...item,
    x: nextX,
    y: nextY,
  };
}

function collectDescendantNodeIds(rootId: string, allNodes: Node[]): string[] {
  const nodesByParent = new Map<string | null, Node[]>();

  for (const node of allNodes) {
    const siblings = nodesByParent.get(node.parentId) ?? [];
    siblings.push(node);
    nodesByParent.set(node.parentId, siblings);
  }

  const result: string[] = [];

  function visit(nodeId: string) {
    result.push(nodeId);

    for (const child of sortGridItems(nodesByParent.get(nodeId) ?? [])) {
      visit(child.id);
    }
  }

  visit(rootId);
  return result;
}

function buildNodeTitlePath(
  parentId: string | null,
  nodesById: Map<string, Node>,
): string[] {
  const path: string[] = [];
  let currentId = parentId;

  while (currentId) {
    const current = nodesById.get(currentId);
    if (!current) {
      break;
    }

    path.unshift(current.title);
    currentId = current.parentId;
  }

  return path;
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== undefined && value !== null;
}

function isWithinRestoreWindow(
  deletedAt: number | null,
  anchorDeletedAt: number | null,
): deletedAt is number {
  return deletedAt !== null && anchorDeletedAt !== null && Math.abs(deletedAt - anchorDeletedAt) <= 5_000;
}

function findFirstAvailableCell(
  occupied: Set<string>,
): { x: number; y: number } | null {
  for (let y = 0; y < GRID_ROWS; y += 1) {
    for (let x = 0; x < GRID_COLS; x += 1) {
      if (!occupied.has(gridKey(x, y))) {
        return { x, y };
      }
    }
  }

  return null;
}

export const db = new GridDODatabase();
export const indexedDBStore: DataStore = new IndexedDBDataStore(db);
