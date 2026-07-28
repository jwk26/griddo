import Dexie, { type DexieOptions, type Table } from "dexie";
import { GRID_COLS, GRID_ROWS, TRASH_RETENTION_DAYS } from "@/lib/constants";
import type { DataStore } from "@/lib/db/datastore";
import {
  bitSchema,
  chunkSchema,
  createBitSchema,
  createChunkSchema,
  createScratchBreakdownSchema,
  createNodeSchema,
  nodeSchema,
  scratchBreakdownSchema,
  updateBitSchema,
  updateNodeSchema,
  updateScratchBreakdownSchema,
  type Bit,
  type CandidateOrphanAuditEvent,
  type Chunk,
  type CreateBit,
  type CreateChunk,
  type CreateNode,
  type CreateScratchBreakdown,
  type Node,
  type ScratchBreakdown,
  type StagedCandidate,
} from "@/lib/db/schema";
import { findNearestEmptyCell } from "@/lib/utils/bfs";
import { findItemsInBlockedZone } from "@/lib/utils/breadcrumb-zone";
import { isDeadlineAfter } from "@/lib/utils/deadline";

type MutableNodeInput = Omit<Node, "id" | "createdAt" | "deletedAt" | "mtime">;
type MutableBitInput = Omit<Bit, "id" | "createdAt" | "deletedAt" | "mtime">;
type SystemNodeRole = NonNullable<Node["systemRole"]>;

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

type SettingsTableLike = {
  get(key: string): Promise<{ key: string; value: unknown } | undefined>;
  put(value: { key: string; value: unknown }): Promise<unknown>;
};

type DatabaseLike = {
  nodes: TableLike<Node>;
  bits: TableLike<Bit>;
  chunks: TableLike<Chunk>;
  settings?: SettingsTableLike;
  scratchBreakdowns?: TableLike<ScratchBreakdown>;
};

const ROOT_PARENT_KEY = "__root__";
const DEFAULT_PROMOTED_NODE_COLOR = "hsl(221, 83%, 53%)";
const SYSTEM_NODE_ROLES = ["inbox", "archive_view"] as const satisfies readonly SystemNodeRole[];
const SYSTEM_NODE_SEEDS: Record<SystemNodeRole, Pick<Node, "title" | "icon" | "color">> = {
  inbox: {
    title: "Inbox",
    icon: "inbox",
    color: "hsl(221, 83%, 53%)",
  },
  archive_view: {
    title: "Archive",
    icon: "layers",
    color: "hsl(240, 4%, 46%)",
  },
};

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

type IndexedDBMigrationStore = "nodes" | "bits" | "scratchBreakdowns";
type IndexedDBMigrationReason =
  | "invalid_row"
  | "missing_scratch_owner"
  | "scratch_owner_not_in_inbox";

export class IndexedDBMigrationError extends Error {
  constructor(
    public readonly store: IndexedDBMigrationStore,
    public readonly id: string,
    public readonly reason: IndexedDBMigrationReason,
  ) {
    super(`IndexedDB v4 migration failed for ${store}/${id}: ${reason}`);
    this.name = "IndexedDBMigrationError";
  }
}

const NODE_PERSISTED_FIELDS = nodeSchema.keyof().options;
const BIT_PERSISTED_FIELDS = bitSchema.keyof().options;
const BREAKDOWN_PERSISTED_FIELDS = scratchBreakdownSchema.keyof().options;

const chunkUpdateSchema = chunkSchema.omit({ id: true, parentId: true }).partial();

export class GridDODatabase extends Dexie {
  nodes!: Table<Node, string>;
  bits!: Table<Bit, string>;
  chunks!: Table<Chunk, string>;
  scratchBreakdowns!: Table<ScratchBreakdown, string>;
  stagedCandidates!: Table<StagedCandidate, string>;
  candidateOrphanAuditEvents!: Table<CandidateOrphanAuditEvent, string>;
  settings!: Table<{ key: string; value: unknown }, string>;

  constructor(options?: DexieOptions) {
    super("GridDO", options);

    this.version(1).stores({
      nodes: "id,parentId,deletedAt,[parentId+deletedAt],level",
      bits: "id,parentId,deletedAt,[parentId+deletedAt],status,deadline,[parentId+status]",
      chunks: "id,parentId,[parentId+order],time,status",
    });

    this.version(2).stores({
      settings: "key",
    });

    this.version(3)
      .stores({
        nodes: "id,parentId,deletedAt,[parentId+deletedAt],level,systemRole,archivedAt,[parentId+deletedAt+archivedAt]",
        bits: "id,parentId,deletedAt,[parentId+deletedAt],status,deadline,[parentId+status],archivedAt,[parentId+deletedAt+archivedAt]",
        scratchBreakdowns: "id,scratchBitId,[scratchBitId+order]",
      })
      .upgrade(async (tx) => {
        await tx.table("nodes").toCollection().modify((node) => {
          if (node.archivedAt === undefined) node.archivedAt = null;
          if (node.systemRole === undefined) node.systemRole = null;
          if (node.hiddenFromGrid === undefined) node.hiddenFromGrid = false;
        });
        await tx.table("bits").toCollection().modify((bit) => {
          if (bit.archivedAt === undefined) bit.archivedAt = null;
        });
      });

    this.version(4)
      .stores({
        nodes:
          "id,parentId,deletedAt,[parentId+deletedAt],level,systemRole,archivedAt,[parentId+deletedAt+archivedAt]",
        bits:
          "id,parentId,deletedAt,[parentId+deletedAt],status,deadline,[parentId+status],archivedAt,[parentId+deletedAt+archivedAt]",
        chunks: "id,parentId,[parentId+order],time,status",
        settings: "key",
        scratchBreakdowns:
          "id,scratchBitId,[scratchBitId+order],[scratchBitId+createdAt]",
        stagedCandidates:
          "id,&sourceBreakdownId,scratchBitId,lifecycle,[scratchBitId+lifecycle],[scratchBitId+resultType+createdAt]",
        candidateOrphanAuditEvents:
          "id,&candidateId,sourceBreakdownId,scratchBitId,occurredAt,[scratchBitId+occurredAt]",
      })
      .upgrade(async (tx) => {
        await tx.table("nodes").toCollection().modify((node) => {
          if (node.version === undefined) node.version = 1;
          if (node.pastDeadlineDismissed === undefined) {
            node.pastDeadlineDismissed = false;
          }
        });
        await tx.table("bits").toCollection().modify((bit) => {
          if (bit.version === undefined) bit.version = 1;
          if (bit.pastDeadlineDismissed === undefined) {
            bit.pastDeadlineDismissed = false;
          }
        });
        await tx.table("scratchBreakdowns").toCollection().modify((breakdown) => {
          if (breakdown.version === undefined) breakdown.version = 1;
        });

        const nodes = await tx.table("nodes").toArray();
        const bits = await tx.table("bits").toArray();
        const breakdowns = await tx.table("scratchBreakdowns").toArray();

        for (const node of nodes) {
          const parsed = nodeSchema.safeParse(node);
          if (!hasPersistedFields(node, NODE_PERSISTED_FIELDS) || !parsed.success) {
            throw new IndexedDBMigrationError("nodes", migrationRowId(node), "invalid_row");
          }
        }
        for (const bit of bits) {
          const parsed = bitSchema.safeParse(bit);
          if (!hasPersistedFields(bit, BIT_PERSISTED_FIELDS) || !parsed.success) {
            throw new IndexedDBMigrationError("bits", migrationRowId(bit), "invalid_row");
          }
        }

        const nodeById = new Map(nodes.map((node) => [migrationRowId(node), node]));
        const bitById = new Map(bits.map((bit) => [migrationRowId(bit), bit]));

        for (const breakdown of breakdowns) {
          const parsed = scratchBreakdownSchema.safeParse(breakdown);
          const breakdownId = migrationRowId(breakdown);
          if (
            !hasPersistedFields(breakdown, BREAKDOWN_PERSISTED_FIELDS) ||
            !parsed.success
          ) {
            throw new IndexedDBMigrationError(
              "scratchBreakdowns",
              breakdownId,
              "invalid_row",
            );
          }

          const owner = bitById.get(parsed.data.scratchBitId);
          if (!owner) {
            throw new IndexedDBMigrationError(
              "scratchBreakdowns",
              breakdownId,
              "missing_scratch_owner",
            );
          }
          const ownerParentId = typeof owner.parentId === "string" ? owner.parentId : "";
          const ownerParent = nodeById.get(ownerParentId);
          if (!ownerParent || ownerParent.systemRole !== "inbox") {
            throw new IndexedDBMigrationError(
              "scratchBreakdowns",
              breakdownId,
              "scratch_owner_not_in_inbox",
            );
          }
        }
      });
  }
}

function migrationRowId(row: unknown): string {
  if (
    typeof row === "object" &&
    row !== null &&
    "id" in row &&
    typeof row.id === "string"
  ) {
    return row.id;
  }
  return "<unknown>";
}

function hasPersistedFields(row: unknown, fields: readonly string[]): boolean {
  return (
    typeof row === "object" &&
    row !== null &&
    fields.every((field) => Object.prototype.hasOwnProperty.call(row, field))
  );
}

export class IndexedDBDataStore implements DataStore {
  constructor(private readonly database: DatabaseLike) {}

  async getNode(id: string): Promise<Node | undefined> {
    return this.database.nodes.get(id);
  }

  async getNodes(parentId: string | null): Promise<Node[]> {
    const nodes = await this.database.nodes.toArray();
    return sortGridItems(
      nodes.filter(
        (node) =>
          node.parentId === parentId && node.deletedAt === null && node.archivedAt === null,
      ),
    );
  }

  async createNode(data: CreateNode): Promise<Node> {
    const parsed = createNodeSchema.parse(data);

    await this.ensureGridCellAvailable(parsed.parentId, parsed.x, parsed.y);
    if (parsed.parentId !== null) {
      await this.assertNodeDeadlineFitsParent(
        parsed.parentId,
        parsed.deadline,
        parsed.deadlineAllDay,
      );
    }

    const timestamp = Date.now();
    const node = nodeSchema.parse({
      ...parsed,
      id: crypto.randomUUID(),
      mtime: timestamp,
      createdAt: timestamp,
      version: 1,
      deletedAt: null,
      pastDeadlineDismissed: false,
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
    const parsed = updateNodeSchema.parse(data);
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
      allNodes.filter(
        (item) =>
          item.deletedAt === null &&
          item.archivedAt === null &&
          !(item.parentId === null && item.hiddenFromGrid),
      ),
      allBits.filter((item) => item.deletedAt === null && item.archivedAt === null),
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
    return sortGridItems(
      bits.filter(
        (bit) => bit.parentId === parentId && bit.deletedAt === null && bit.archivedAt === null,
      ),
    );
  }

  async getBitsForNode(nodeId: string): Promise<Bit[]> {
    const bits = await this.database.bits.toArray();
    return bits.filter((b) => b.parentId === nodeId && b.deletedAt === null && b.archivedAt === null);
  }

  async getAllActiveNodes(): Promise<Node[]> {
    const nodes = await this.database.nodes.toArray();
    return nodes.filter((n) => n.deletedAt === null && n.archivedAt === null);
  }

  async getAllActiveBits(): Promise<Bit[]> {
    const bits = await this.database.bits.toArray();
    return bits.filter((b) => b.deletedAt === null && b.archivedAt === null);
  }

  async createBit(data: CreateBit): Promise<Bit> {
    const parsed = createBitSchema.parse(data);

    await this.ensureGridCellAvailable(parsed.parentId, parsed.x, parsed.y);
    await this.assertBitDeadlineFitsParent(
      parsed.parentId,
      parsed.deadline,
      parsed.deadlineAllDay,
    );

    const timestamp = Date.now();
    const bit = bitSchema.parse({
      ...parsed,
      id: crypto.randomUUID(),
      status: "active",
      mtime: timestamp,
      createdAt: timestamp,
      version: 1,
      deletedAt: null,
      pastDeadlineDismissed: false,
    });

    await this.write(async () => {
      await this.database.bits.put(bit);
      await this.touchNodeIds([bit.parentId], timestamp);
    });

    return bit;
  }

  async updateBit(id: string, data: Partial<Bit>): Promise<void> {
    const existing = await this.getRequiredBit(id);
    const parsed = updateBitSchema.parse(data);
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

    await this.assertBitDeadlineFitsParent(
      next.parentId,
      next.deadline,
      next.deadlineAllDay,
      existing.id,
    );

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
      allNodes.filter(
        (item) =>
          item.deletedAt === null &&
          item.archivedAt === null &&
          !(item.parentId === null && item.hiddenFromGrid),
      ),
      allBits.filter((item) => item.deletedAt === null && item.archivedAt === null),
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

    const scratchRowIds: string[] = [];
    if (this.database.scratchBreakdowns) {
      const rows = await this.database.scratchBreakdowns.toArray();
      for (const row of rows) {
        if (row.scratchBitId === id) scratchRowIds.push(row.id);
      }
    }

    const timestamp = Date.now();

    await this.write(async () => {
      if (this.database.scratchBreakdowns && scratchRowIds.length > 0) {
        await this.database.scratchBreakdowns.bulkDelete(scratchRowIds);
      }
      await this.database.chunks.bulkDelete(chunkIds);
      await this.database.bits.delete(id);
      await this.touchNodeIds([bit.parentId], timestamp);
    });
  }

  async archiveNode(id: string): Promise<void> {
    const node = await this.getRequiredNode(id);

    if (node.systemRole !== null) {
      throw new Error("Cannot archive a system node");
    }

    const { nodes, bits } = await this.collectNodeSubtree(id);
    const archiveTimestamp = Date.now();
    const updatedNodes = nodes.map((item) => ({
      ...item,
      archivedAt: archiveTimestamp,
    }));
    const updatedBits = bits.map((item) => ({
      ...item,
      archivedAt: archiveTimestamp,
    }));

    await this.write(async () => {
      await this.saveNodes(updatedNodes);
      await this.saveBits(updatedBits);
    });

    if (node.parentId) {
      await this.touchNodeIds([node.parentId], archiveTimestamp);
    }
  }

  async archiveBit(id: string): Promise<void> {
    const bit = await this.getRequiredBit(id);
    const archivedAt = Date.now();

    await this.write(async () => {
      await this.database.bits.put(bitSchema.parse({ ...bit, archivedAt }));
      await this.touchNodeIds([bit.parentId], archivedAt);
    });
  }

  async unarchiveNode(id: string): Promise<void> {
    const node = await this.getRequiredNode(id);

    if (node.parentId) {
      const parentNode = await this.database.nodes.get(node.parentId);
      if (parentNode && parentNode.archivedAt !== null) {
        await this.unarchiveNode(parentNode.id);
      }
    }

    const refreshedNode = await this.getRequiredNode(id);
    if (refreshedNode.archivedAt === null) {
      return;
    }

    const [allNodes, allBits] = await Promise.all([
      this.database.nodes.toArray(),
      this.database.bits.toArray(),
    ]);
    const nodesById = new Map(allNodes.map((candidate) => [candidate.id, candidate]));
    const restoreAnchor = refreshedNode.archivedAt;
    const subtreeIds = collectDescendantNodeIds(id, allNodes);
    const subtreeIdSet = new Set(subtreeIds);
    const occupiedByParent = buildOccupiedByParent(
      allNodes.filter((item) => item.deletedAt === null && item.archivedAt === null),
      allBits.filter((item) => item.deletedAt === null && item.archivedAt === null),
    );
    const restoredNodes: Node[] = [];
    // Mirrors trash `restoreNode`: only restore a Bit when its parent Node is
    // itself being restored (or already active). Without this guard a Bit whose
    // archivedAt happens to fall inside the ±5s window could be un-archived while
    // its parent Node stays archived (parent archived outside the window),
    // producing an archived-Node-with-active-Bit state that violates the
    // archive/restore data-layer invariant.
    const restorableNodeIds = new Set<string>();

    for (const nodeId of subtreeIds) {
      const current = nodesById.get(nodeId);
      if (!current) {
        continue;
      }

      if (current.archivedAt === null) {
        restorableNodeIds.add(current.id);
        continue;
      }

      if (!isWithinRestoreWindow(current.archivedAt, restoreAnchor)) {
        continue;
      }

      const restored = placeRestoredGridItem(
        { ...current, archivedAt: null },
        occupiedByParent,
      );
      restoredNodes.push(restored);
      restorableNodeIds.add(restored.id);
    }

    const restoredBits = sortGridItems(
      allBits.filter(
        (bit) =>
          subtreeIdSet.has(bit.parentId) &&
          bit.archivedAt !== null &&
          isWithinRestoreWindow(bit.archivedAt, restoreAnchor) &&
          restorableNodeIds.has(bit.parentId),
      ),
    ).map((bit) => placeRestoredGridItem({ ...bit, archivedAt: null }, occupiedByParent));

    await this.write(async () => {
      await this.saveNodes(restoredNodes);
      await this.saveBits(restoredBits);

      if (refreshedNode.parentId) {
        await this.touchNodeIds([refreshedNode.parentId], Date.now());
      }
    });
  }

  async unarchiveBit(id: string): Promise<void> {
    const bit = await this.getRequiredBit(id);

    if (bit.parentId) {
      const parentNode = await this.database.nodes.get(bit.parentId);
      if (parentNode && parentNode.archivedAt !== null) {
        await this.unarchiveNode(parentNode.id);
      }
    }

    const refreshedBit = await this.getRequiredBit(id);
    if (refreshedBit.archivedAt === null) {
      return;
    }

    const [allNodes, allBits] = await Promise.all([
      this.database.nodes.toArray(),
      this.database.bits.toArray(),
    ]);
    const occupiedByParent = buildOccupiedByParent(
      allNodes.filter((item) => item.deletedAt === null && item.archivedAt === null),
      allBits.filter((item) => item.deletedAt === null && item.archivedAt === null),
    );
    const restoredBit = placeRestoredGridItem(
      { ...refreshedBit, archivedAt: null },
      occupiedByParent,
    );

    await this.write(async () => {
      await this.database.bits.put(bitSchema.parse(restoredBit));
      await this.touchNodeIds([restoredBit.parentId], Date.now());
    });
  }

  async ensureSystemNodes(): Promise<void> {
    const allNodes = await this.database.nodes.toArray();
    const missingRoles: SystemNodeRole[] = [];
    const driftedRows: Array<{ role: SystemNodeRole; node: Node }> = [];

    for (const role of SYSTEM_NODE_ROLES) {
      const existing = allNodes.find((node) => node.systemRole === role);

      if (!existing) {
        missingRoles.push(role);
      } else if (existing.deletedAt !== null || existing.archivedAt !== null) {
        driftedRows.push({ role, node: existing });
      }
    }

    if (missingRoles.length === 0 && driftedRows.length === 0) {
      return;
    }

    const occupancy = new Set<string>();

    for (const node of allNodes) {
      if (
        node.parentId === null &&
        node.deletedAt === null &&
        node.archivedAt === null &&
        !node.hiddenFromGrid
      ) {
        occupancy.add(gridKey(node.x, node.y));
      }
    }

    const normalizePlan: Array<{ node: Node; x: number; y: number }> = [];
    const seedPlan: Array<{ role: SystemNodeRole; x: number; y: number }> = [];

    for (const { role, node } of driftedRows) {
      if (node.hiddenFromGrid) {
        normalizePlan.push({ node, x: node.x, y: node.y });
        continue;
      }

      if (!occupancy.has(gridKey(node.x, node.y))) {
        occupancy.add(gridKey(node.x, node.y));
        normalizePlan.push({ node, x: node.x, y: node.y });
        continue;
      }

      const cell = findFirstAvailableCell(occupancy);

      if (!cell) {
        throw new Error(
          `GRID_FULL: Cannot normalize system node "${role}" — no L0 cell available`,
        );
      }

      occupancy.add(gridKey(cell.x, cell.y));
      normalizePlan.push({ node, x: cell.x, y: cell.y });
    }

    for (const role of missingRoles) {
      const cell = findFirstAvailableCell(occupancy);

      if (!cell) {
        throw new Error(`GRID_FULL: Cannot seed system node "${role}" — no L0 cell available`);
      }

      occupancy.add(gridKey(cell.x, cell.y));
      seedPlan.push({ role, x: cell.x, y: cell.y });
    }

    const seedTimestamp = Date.now();
    const seedNodes = seedPlan.map(({ role, x, y }) =>
      nodeSchema.parse({
        id: crypto.randomUUID(),
        mtime: seedTimestamp,
        createdAt: seedTimestamp,
        version: 1,
        title: SYSTEM_NODE_SEEDS[role].title,
        icon: SYSTEM_NODE_SEEDS[role].icon,
        color: SYSTEM_NODE_SEEDS[role].color,
        systemRole: role,
        hiddenFromGrid: false,
        archivedAt: null,
        deletedAt: null,
        parentId: null,
        level: 0,
        x,
        y,
        deadline: null,
        deadlineAllDay: false,
        pastDeadlineDismissed: false,
      }),
    );

    const timestamp = Date.now();

    await this.write(async () => {
      for (const { node, x, y } of normalizePlan) {
        await this.database.nodes.put({
          ...node,
          x,
          y,
          deletedAt: null,
          archivedAt: null,
          mtime: timestamp,
        });
      }

      if (seedNodes.length > 0) {
        await this.database.nodes.bulkPut(seedNodes);
      }
    });
  }

  async createScratchBreakdown(data: CreateScratchBreakdown): Promise<ScratchBreakdown> {
    const table = this.requireScratchBreakdowns();
    const parsed = createScratchBreakdownSchema.parse(data);
    const row = scratchBreakdownSchema.parse({
      ...parsed,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      consumedAt: null,
      version: 1,
    });

    await table.put(row);

    return row;
  }

  async getScratchBreakdowns(scratchBitId: string): Promise<ScratchBreakdown[]> {
    const table = this.requireScratchBreakdowns();
    const all = await table.toArray();
    return all
      .filter((row) => row.scratchBitId === scratchBitId)
      .sort((left, right) => left.order - right.order);
  }

  async updateScratchBreakdown(
    id: string,
    data: Partial<Pick<ScratchBreakdown, "content" | "order">>,
  ): Promise<void> {
    const table = this.requireScratchBreakdowns();
    const row = await table.get(id);

    if (!row) {
      throw new Error(`Scratch breakdown not found: ${id}`);
    }

    const parsed = updateScratchBreakdownSchema.parse(data);
    await table.put(scratchBreakdownSchema.parse({ ...row, ...parsed }));
  }

  async markScratchBreakdownConsumed(id: string): Promise<void> {
    const table = this.requireScratchBreakdowns();
    const row = await table.get(id);

    if (!row) {
      throw new Error(`Scratch breakdown not found: ${id}`);
    }

    await table.put(scratchBreakdownSchema.parse({ ...row, consumedAt: Date.now() }));
  }

  async unconsumeScratchBreakdown(id: string): Promise<void> {
    const table = this.requireScratchBreakdowns();
    const row = await table.get(id);

    if (!row) {
      throw new Error(`Scratch breakdown not found: ${id}`);
    }

    await table.put(scratchBreakdownSchema.parse({ ...row, consumedAt: null }));
  }

  async deleteScratchBreakdownsByScratch(scratchBitId: string): Promise<void> {
    const table = this.requireScratchBreakdowns();
    const all = await table.toArray();
    const ids = all
      .filter((row) => row.scratchBitId === scratchBitId)
      .map((row) => row.id);

    await table.bulkDelete(ids);
  }

  async deleteScratchBreakdown(id: string): Promise<void> {
    const table = this.requireScratchBreakdowns();
    await table.delete(id);
  }

  async getChunks(bitId: string): Promise<Chunk[]> {
    const chunks = await this.database.chunks.toArray();
    return sortChunks(chunks.filter((chunk) => chunk.parentId === bitId));
  }

  async createChunk(data: CreateChunk): Promise<Chunk> {
    const parsed = createChunkSchema.parse(data);
    const bit = await this.getRequiredBit(parsed.parentId);

    await this.assertChunkTimeFitsBit(bit, parsed.time, parsed.timeAllDay);

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

    await this.assertChunkTimeFitsBit(bit, next.time, next.timeAllDay);

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

    const filteredNodes = parentId === null ? nodes.filter((n) => !n.hiddenFromGrid) : nodes;
    return { nodes: filteredNodes, bits };
  }

  async getCalendarItems(): Promise<{ bits: Bit[]; chunks: Chunk[] }> {
    const [bits, chunks] = await Promise.all([
      this.database.bits.toArray(),
      this.database.chunks.toArray(),
    ]);
    const activeBits = bits.filter((bit) => bit.deletedAt === null && bit.archivedAt === null);
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

  async getArchivedItems(): Promise<{ nodes: Node[]; bits: Bit[] }> {
    const [nodes, bits] = await Promise.all([
      this.database.nodes.toArray(),
      this.database.bits.toArray(),
    ]);

    return {
      nodes: nodes.filter(
        (node) =>
          node.archivedAt !== null &&
          node.deletedAt === null &&
          node.systemRole === null,
      ),
      bits: bits.filter((bit) => bit.archivedAt !== null && bit.deletedAt === null),
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
    const activeNodes = nodes.filter(
      (node) => node.deletedAt === null && node.archivedAt === null,
    );
    const activeBits = bits.filter((bit) => bit.deletedAt === null && bit.archivedAt === null);
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
      if (
        node.parentId === parentId &&
        node.deletedAt === null &&
        node.archivedAt === null &&
        !(parentId === null && node.hiddenFromGrid)
      ) {
        occupancy.add(gridKey(node.x, node.y));
      }
    }

    for (const bit of bits) {
      if (bit.parentId === parentId && bit.deletedAt === null && bit.archivedAt === null) {
        occupancy.add(gridKey(bit.x, bit.y));
      }
    }

    return occupancy;
  }

  async getChildDeadlineConflicts(
    nodeId: string,
    deadline: number,
    deadlineAllDay: boolean,
  ): Promise<Bit[]> {
    const bits = await this.database.bits.toArray();
    return bits.filter(
      (bit) =>
        bit.parentId === nodeId &&
        bit.deletedAt === null &&
        bit.archivedAt === null &&
        bit.deadline !== null &&
        isDeadlineAfter(bit.deadline, bit.deadlineAllDay, deadline, deadlineAllDay),
    );
  }

  async runBreadcrumbZoneMigration(
    parentId: string | null,
    blockedCells: Set<string>,
  ): Promise<{ relocated: number }> {
    if (!this.database.settings) {
      return { relocated: 0 };
    }

    const markerKey = `bzMigration_${parentKey(parentId)}`;
    const existing = await this.database.settings.get(markerKey);

    if (existing !== undefined) {
      return { relocated: 0 };
    }

    if (blockedCells.size === 0) {
      await this.database.settings.put({ key: markerKey, value: true });
      return { relocated: 0 };
    }

    const [allNodes, allBits] = await Promise.all([
      this.database.nodes.toArray(),
      this.database.bits.toArray(),
    ]);
    const activeNodes = allNodes.filter(
      (node) =>
        node.parentId === parentId &&
        node.deletedAt === null &&
        node.archivedAt === null &&
        !(parentId === null && node.hiddenFromGrid),
    );
    const activeBits = allBits.filter(
      (bit) => bit.parentId === parentId && bit.deletedAt === null && bit.archivedAt === null,
    );
    const overlappingNodes = findItemsInBlockedZone(activeNodes, blockedCells);
    const overlappingBits = findItemsInBlockedZone(activeBits, blockedCells);

    if (overlappingNodes.length === 0 && overlappingBits.length === 0) {
      await this.database.settings.put({ key: markerKey, value: true });
      return { relocated: 0 };
    }

    const overlappingNodeIds = new Set(overlappingNodes.map((node) => node.id));
    const overlappingBitIds = new Set(overlappingBits.map((bit) => bit.id));
    const occupancy = new Set<string>();

    for (const node of activeNodes) {
      if (!overlappingNodeIds.has(node.id)) {
        occupancy.add(gridKey(node.x, node.y));
      }
    }

    for (const bit of activeBits) {
      if (!overlappingBitIds.has(bit.id)) {
        occupancy.add(gridKey(bit.x, bit.y));
      }
    }

    type QueueEntry =
      | { kind: "node"; item: Node }
      | { kind: "bit"; item: Bit };

    const queue: QueueEntry[] = [
      ...overlappingNodes.map((item): QueueEntry => ({ kind: "node", item })),
      ...overlappingBits.map((item): QueueEntry => ({ kind: "bit", item })),
    ].sort((a, b) => a.item.y - b.item.y || a.item.x - b.item.x);

    const relocatedNodes: Node[] = [];
    const relocatedBits: Bit[] = [];

    for (const entry of queue) {
      const cell = findNearestEmptyCell(
        occupancy,
        entry.item.x,
        entry.item.y,
        blockedCells,
      );

      if (!cell) {
        return { relocated: 0 };
      }

      occupancy.add(gridKey(cell.x, cell.y));

      if (process.env.NODE_ENV === "development") {
        console.log(
          `[bzMigration] ${entry.kind} "${entry.item.title}" (${entry.item.x},${entry.item.y}) → (${cell.x},${cell.y})`,
        );
      }

      if (entry.kind === "node") {
        relocatedNodes.push({ ...entry.item, x: cell.x, y: cell.y });
      } else {
        relocatedBits.push({ ...entry.item, x: cell.x, y: cell.y });
      }
    }

    await this.write(async () => {
      if (relocatedNodes.length > 0) {
        await this.database.nodes.bulkPut(relocatedNodes);
      }
      if (relocatedBits.length > 0) {
        await this.database.bits.bulkPut(relocatedBits);
      }
      await this.database.settings!.put({ key: markerKey, value: true });
    });

    return { relocated: relocatedNodes.length + relocatedBits.length };
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
      version: 1,
      parentId: bit.parentId,
      level: promotedLevel,
      x: bit.x,
      y: bit.y,
      deletedAt: null,
      pastDeadlineDismissed: false,
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
        version: 1,
        parentId: newNode.id,
        x: position.x,
        y: position.y,
        deletedAt: null,
        pastDeadlineDismissed: false,
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
        [
          this.database.nodes,
          this.database.bits,
          this.database.chunks,
          this.database.settings,
          this.database.scratchBreakdowns,
        ],
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

  private requireScratchBreakdowns(): TableLike<ScratchBreakdown> {
    if (!this.database.scratchBreakdowns) {
      throw new Error("scratchBreakdowns store not available");
    }

    return this.database.scratchBreakdowns;
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
    deadlineAllDay: boolean,
    bitId?: string,
  ): Promise<void> {
    const parent = await this.getRequiredNode(parentId);
    if (
      deadline !== null &&
      parent.deadline !== null &&
      isDeadlineAfter(deadline, deadlineAllDay, parent.deadline, parent.deadlineAllDay)
    ) {
      throw new DeadlineConflictError("child_exceeds_parent", bitId ? [bitId] : []);
    }
  }

  private async assertNodeDeadlineFitsParent(
    parentId: string,
    deadline: number | null,
    deadlineAllDay: boolean,
  ): Promise<void> {
    const parent = await this.getRequiredNode(parentId);
    if (
      deadline !== null &&
      parent.deadline !== null &&
      isDeadlineAfter(deadline, deadlineAllDay, parent.deadline, parent.deadlineAllDay)
    ) {
      throw new DeadlineConflictError("child_exceeds_parent", []);
    }
  }

  private async assertChunkTimeFitsBit(
    bit: Bit,
    time: number | null,
    timeAllDay: boolean,
  ): Promise<void> {
    if (
      time !== null &&
      bit.deadline !== null &&
      isDeadlineAfter(time, timeAllDay, bit.deadline, bit.deadlineAllDay)
    ) {
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
    // Hook 8: Inbox Scratch Bits use the (0,0) sentinel and are uniqueness-exempt.
    if (x === 0 && y === 0 && parentId !== null) {
      const parentNode = await this.database.nodes.get(parentId);
      if (parentNode?.systemRole === "inbox") {
        return;
      }
    }

    const [nodes, bits] = await Promise.all([
      this.database.nodes.toArray(),
      this.database.bits.toArray(),
    ]);

    const occupiedByNode = nodes.some(
      (node) =>
        node.parentId === parentId &&
        node.deletedAt === null &&
        node.archivedAt === null &&
        !(parentId === null && node.hiddenFromGrid) &&
        node.x === x &&
        node.y === y &&
        !(options?.excludedNodeIds?.has(node.id) ?? false),
    );
    const occupiedByBit = bits.some(
      (bit) =>
        bit.parentId === parentId &&
        bit.deletedAt === null &&
        bit.archivedAt === null &&
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
