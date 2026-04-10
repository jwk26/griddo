import { describe, expect, it } from "vitest";
import type { Bit, Chunk, Node } from "@/lib/db/schema";
import { IndexedDBDataStore } from "@/lib/db/indexeddb";

type StoredRecord = { id: string };

class FakeTable<T extends StoredRecord> {
  private readonly records = new Map<string, T>();

  constructor(initial: T[] = []) {
    for (const item of initial) {
      this.records.set(item.id, structuredClone(item));
    }
  }

  async get(id: string): Promise<T | undefined> {
    const record = this.records.get(id);
    return record ? structuredClone(record) : undefined;
  }

  async put(value: T): Promise<string> {
    this.records.set(value.id, structuredClone(value));
    return value.id;
  }

  async bulkPut(values: T[]): Promise<void> {
    for (const value of values) {
      this.records.set(value.id, structuredClone(value));
    }
  }

  async delete(id: string): Promise<void> {
    this.records.delete(id);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    for (const id of ids) {
      this.records.delete(id);
    }
  }

  async toArray(): Promise<T[]> {
    return Array.from(this.records.values(), (value) => structuredClone(value));
  }
}

function createNode(overrides: Partial<Node> = {}): Node {
  const now = overrides.createdAt ?? 1_700_000_000_000;

  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Node",
    color: overrides.color ?? "hsl(210, 80%, 55%)",
    icon: overrides.icon ?? "folder",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    mtime: overrides.mtime ?? now,
    createdAt: now,
    parentId: overrides.parentId ?? null,
    level: overrides.level ?? 0,
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
  };
}

function createBit(overrides: Partial<Bit> = {}): Bit {
  const now = overrides.createdAt ?? 1_700_000_000_000;

  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Bit",
    description: overrides.description ?? "",
    icon: overrides.icon ?? "circle",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    priority: overrides.priority ?? null,
    status: overrides.status ?? "active",
    mtime: overrides.mtime ?? now,
    createdAt: now,
    parentId: overrides.parentId ?? crypto.randomUUID(),
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
  };
}

function createChunk(overrides: Partial<Chunk> = {}): Chunk {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Chunk",
    description: overrides.description ?? "",
    time: overrides.time ?? null,
    timeAllDay: overrides.timeAllDay ?? false,
    status: overrides.status ?? "incomplete",
    order: overrides.order ?? 0,
    parentId: overrides.parentId ?? crypto.randomUUID(),
  };
}

function createStore(seed?: { nodes?: Node[]; bits?: Bit[]; chunks?: Chunk[] }) {
  const database = {
    nodes: new FakeTable<Node>(seed?.nodes),
    bits: new FakeTable<Bit>(seed?.bits),
    chunks: new FakeTable<Chunk>(seed?.chunks),
  };

  return {
    database,
    store: new IndexedDBDataStore(database),
  };
}

describe("IndexedDBDataStore", () => {
  it("creates nodes with generated metadata and tracks occupancy", async () => {
    const { store } = createStore();

    const node = await store.createNode({
      title: "Inbox",
      color: "hsl(210, 80%, 55%)",
      icon: "inbox",
      deadline: null,
      deadlineAllDay: false,
      parentId: null,
      level: 0,
      x: 2,
      y: 3,
    });

    expect(node.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(node.deletedAt).toBeNull();
    expect(node.createdAt).toBeGreaterThan(0);
    expect(node.mtime).toBeGreaterThan(0);

    const occupancy = await store.getGridOccupancy(null);
    expect(occupancy.has("2,3")).toBe(true);
  });

  it("soft-deletes descendant nodes and bits with one cascade timestamp", async () => {
    const root = createNode({ title: "Root" });
    const child = createNode({ title: "Child", parentId: root.id, level: 1 });
    const grandchild = createNode({ title: "Grandchild", parentId: child.id, level: 2 });
    const childBit = createBit({ title: "Child bit", parentId: child.id });
    const grandchildBit = createBit({ title: "Grandchild bit", parentId: grandchild.id });
    const { store } = createStore({
      nodes: [root, child, grandchild],
      bits: [childBit, grandchildBit],
    });

    await store.softDeleteNode(child.id);

    const deletedChild = await store.getNode(child.id);
    const deletedGrandchild = await store.getNode(grandchild.id);
    const deletedChildBit = await store.getBit(childBit.id);
    const deletedGrandchildBit = await store.getBit(grandchildBit.id);

    expect(deletedChild?.deletedAt).toBeTypeOf("number");
    expect(deletedGrandchild?.deletedAt).toBe(deletedChild?.deletedAt);
    expect(deletedChildBit?.deletedAt).toBe(deletedChild?.deletedAt);
    expect(deletedGrandchildBit?.deletedAt).toBe(deletedChild?.deletedAt);
  });

  it("restores parent chains and relocates conflicted restores with BFS nearest-cell", async () => {
    const activeOccupant = createNode({ title: "Occupant", x: 0, y: 0 });
    const trashedParent = createNode({
      title: "Trashed parent",
      x: 0,
      y: 0,
      deletedAt: 1_700_000_000_100,
    });
    const trashedChild = createNode({
      title: "Trashed child",
      parentId: trashedParent.id,
      level: 1,
      x: 1,
      y: 0,
      deletedAt: 1_700_000_000_100,
    });
    const { store } = createStore({
      nodes: [activeOccupant, trashedParent, trashedChild],
    });

    await store.restoreNode(trashedChild.id);

    const restoredParent = await store.getNode(trashedParent.id);
    const restoredChild = await store.getNode(trashedChild.id);

    expect(restoredParent?.deletedAt).toBeNull();
    expect(restoredParent?.x).toBe(1);
    expect(restoredParent?.y).toBe(0);
    expect(restoredChild?.deletedAt).toBeNull();
  });

  it("cascades chunk completion state and mtime updates to the bit and node", async () => {
    const node = createNode({ mtime: 100, createdAt: 100 });
    const bit = createBit({ parentId: node.id, mtime: 100, createdAt: 100 });
    const firstChunk = createChunk({ parentId: bit.id, order: 0 });
    const secondChunk = createChunk({ parentId: bit.id, order: 1 });
    const { store } = createStore({
      nodes: [node],
      bits: [bit],
      chunks: [firstChunk, secondChunk],
    });

    await store.updateChunk(firstChunk.id, { status: "complete" });
    expect((await store.getBit(bit.id))?.status).toBe("active");

    await store.updateChunk(secondChunk.id, { status: "complete" });
    const completedBit = await store.getBit(bit.id);
    const updatedNode = await store.getNode(node.id);
    expect(completedBit?.status).toBe("complete");
    expect(completedBit?.mtime).toBeGreaterThan(100);
    expect(updatedNode?.mtime).toBeGreaterThan(100);

    await store.updateChunk(firstChunk.id, { status: "incomplete" });
    expect((await store.getBit(bit.id))?.status).toBe("active");
  });

  it("promotes a bit into a node and converts its chunks into child bits", async () => {
    const parent = createNode({ title: "Projects", level: 0 });
    const bit = createBit({
      title: "Ship release",
      description: "Wrap the launch checklist",
      icon: "rocket",
      deadline: 1_700_000_100_000,
      deadlineAllDay: true,
      parentId: parent.id,
      x: 4,
      y: 2,
    });
    const firstChunk = createChunk({
      title: "Write changelog",
      time: 1_700_000_050_000,
      timeAllDay: true,
      order: 0,
      parentId: bit.id,
    });
    const secondChunk = createChunk({
      title: "Post announcement",
      time: 1_700_000_060_000,
      order: 1,
      parentId: bit.id,
    });
    const { store } = createStore({
      nodes: [parent],
      bits: [bit],
      chunks: [firstChunk, secondChunk],
    });

    const promotedNode = await store.promoteBitToNode(bit.id);
    const childBits = await store.getBits(promotedNode.id);

    expect(promotedNode.title).toBe("Ship release");
    expect(promotedNode.icon).toBe("rocket");
    expect(promotedNode.deadline).toBe(1_700_000_100_000);
    expect(promotedNode.parentId).toBe(parent.id);
    expect(promotedNode.level).toBe(parent.level + 1);
    expect(promotedNode.x).toBe(4);
    expect(promotedNode.y).toBe(2);
    expect(childBits).toHaveLength(2);
    expect(childBits.map((item) => item.title)).toEqual([
      "Write changelog",
      "Post announcement",
    ]);
    expect(childBits[0]?.deadline).toBe(1_700_000_050_000);
    expect(childBits[0]?.deadlineAllDay).toBe(true);
    expect(await store.getBit(bit.id)).toBeUndefined();
    expect(await store.getChunks(bit.id)).toEqual([]);
  });
});
