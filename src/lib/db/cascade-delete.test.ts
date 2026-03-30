import { describe, expect, it, vi } from "vitest";
import type { Bit, Chunk, Node } from "@/lib/db/schema";
import { IndexedDBDataStore } from "@/lib/db/indexeddb";

type StoredRecord = { id: string };

class FakeTable<T extends StoredRecord> {
  readonly records = new Map<string, T>();

  constructor(initial: T[] = []) {
    for (const item of initial) {
      this.records.set(item.id, structuredClone(item));
    }
  }

  async get(id: string) {
    return this.records.has(id) ? structuredClone(this.records.get(id)!) : undefined;
  }

  async put(value: T) {
    this.records.set(value.id, structuredClone(value));
    return value.id;
  }

  async bulkPut(values: T[]) {
    for (const value of values) {
      this.records.set(value.id, structuredClone(value));
    }
  }

  async delete(id: string) {
    this.records.delete(id);
  }

  async bulkDelete(ids: string[]) {
    for (const id of ids) {
      this.records.delete(id);
    }
  }

  async toArray() {
    return Array.from(this.records.values(), (value) => structuredClone(value));
  }
}

const BASE_TS = 1_700_000_000_000;

function makeNode(id: string, overrides: Partial<Node> = {}): Node {
  return {
    id,
    title: "Node",
    description: "",
    color: "hsl(210, 80%, 55%)",
    icon: "Folder",
    deadline: null,
    deadlineAllDay: false,
    mtime: BASE_TS,
    createdAt: BASE_TS,
    parentId: null,
    level: 0,
    x: 0,
    y: 0,
    deletedAt: null,
    ...overrides,
  };
}

function makeBit(id: string, parentId: string, overrides: Partial<Bit> = {}): Bit {
  return {
    id,
    title: "Bit",
    description: "",
    icon: "Box",
    deadline: null,
    deadlineAllDay: false,
    priority: null,
    status: "active",
    mtime: BASE_TS,
    createdAt: BASE_TS,
    parentId,
    x: 0,
    y: 0,
    deletedAt: null,
    ...overrides,
  };
}

function makeChunk(id: string, parentId: string, overrides: Partial<Chunk> = {}): Chunk {
  return {
    id,
    title: "Chunk",
    description: "",
    time: null,
    timeAllDay: false,
    status: "incomplete",
    order: 0,
    parentId,
    ...overrides,
  };
}

function makeStore(seed: { nodes?: Node[]; bits?: Bit[]; chunks?: Chunk[] }) {
  const tables = {
    nodes: new FakeTable(seed.nodes),
    bits: new FakeTable(seed.bits),
    chunks: new FakeTable(seed.chunks),
  };

  return {
    tables,
    store: new IndexedDBDataStore(tables),
  };
}

describe("cascade delete", () => {
  it("softDeleteNode marks descendant nodes and their bits as trashed", async () => {
    const root = makeNode("root");
    const child = makeNode("child", { parentId: root.id, level: 1, x: 1 });
    const grandchild = makeNode("grandchild", { parentId: child.id, level: 2, x: 2 });
    const childBit = makeBit("child-bit", child.id, { x: 3 });
    const grandchildBit = makeBit("grandchild-bit", grandchild.id, { x: 4 });
    const unrelatedBit = makeBit("unrelated-bit", root.id, { x: 5 });
    const { store } = makeStore({
      nodes: [root, child, grandchild],
      bits: [childBit, grandchildBit, unrelatedBit],
    });

    await store.softDeleteNode(child.id);

    const deletedChild = await store.getNode(child.id);
    const deletedGrandchild = await store.getNode(grandchild.id);
    const deletedChildBit = await store.getBit(childBit.id);
    const deletedGrandchildBit = await store.getBit(grandchildBit.id);
    const untouchedRoot = await store.getNode(root.id);
    const untouchedBit = await store.getBit(unrelatedBit.id);

    expect(deletedChild?.deletedAt).toBeTypeOf("number");
    expect(deletedGrandchild?.deletedAt).toBe(deletedChild?.deletedAt);
    expect(deletedChildBit?.deletedAt).toBe(deletedChild?.deletedAt);
    expect(deletedGrandchildBit?.deletedAt).toBe(deletedChild?.deletedAt);
    expect(untouchedRoot?.deletedAt).toBeNull();
    expect(untouchedBit?.deletedAt).toBeNull();
  });

  it("softDeleteBit only trashes the target bit and leaves its chunks intact", async () => {
    vi.useRealTimers();

    const parent = makeNode("parent");
    const targetBit = makeBit("bit-1", parent.id);
    const siblingBit = makeBit("bit-2", parent.id, { x: 1 });
    const targetChunk = makeChunk("chunk-1", targetBit.id);
    const { store, tables } = makeStore({
      nodes: [parent],
      bits: [targetBit, siblingBit],
      chunks: [targetChunk],
    });

    await store.softDeleteBit(targetBit.id);

    const deletedBit = await store.getBit(targetBit.id);
    const untouchedBit = await store.getBit(siblingBit.id);
    const remainingChunks = await tables.chunks.toArray();

    expect(deletedBit?.deletedAt).toBeTypeOf("number");
    expect(untouchedBit?.deletedAt).toBeNull();
    expect(remainingChunks).toEqual([targetChunk]);
  });
});
