import { describe, expect, it, vi } from "vitest";
import type { Bit, Chunk, Node } from "@/lib/db/schema";
import { IndexedDBDataStore } from "@/lib/db/indexeddb";
import {
  TRANSACTION_TEST_IDS,
  createSevenStoreSeed,
  openTransactionTestDatabase,
  seedSevenStores,
  snapshotSevenStores,
} from "@/lib/db/indexeddb.test-utils";

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
    archivedAt: null,
    systemRole: null,
    hiddenFromGrid: false,
    ...overrides,
    version: overrides.version ?? 1,
    pastDeadlineDismissed: overrides.pastDeadlineDismissed ?? false,
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
    archivedAt: null,
    ...overrides,
    version: overrides.version ?? 1,
    pastDeadlineDismissed: overrides.pastDeadlineDismissed ?? false,
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

describe("cascade hard delete", () => {
  it("hardDeleteNode removes descendant nodes, their bits, and all related chunks", async () => {
    vi.useRealTimers();

    const root = makeNode("root", { version: 9 });
    const child = makeNode("child", { parentId: root.id, level: 1, x: 1 });
    const grandchild = makeNode("grandchild", { parentId: child.id, level: 2, x: 2 });
    const childBit = makeBit("child-bit", child.id);
    const grandchildBit = makeBit("grandchild-bit", grandchild.id, { x: 1 });
    const unrelatedBit = makeBit("unrelated-bit", root.id, { x: 3, version: 7 });
    const childChunk = makeChunk("child-chunk", childBit.id);
    const grandchildChunk = makeChunk("grandchild-chunk", grandchildBit.id);
    const unrelatedChunk = makeChunk("unrelated-chunk", unrelatedBit.id);
    const { store, tables } = makeStore({
      nodes: [root, child, grandchild],
      bits: [childBit, grandchildBit, unrelatedBit],
      chunks: [childChunk, grandchildChunk, unrelatedChunk],
    });

    await store.hardDeleteNode(child.id);

    expect(await store.getNode(child.id)).toBeUndefined();
    expect(await store.getNode(grandchild.id)).toBeUndefined();
    expect(await store.getBit(childBit.id)).toBeUndefined();
    expect(await store.getBit(grandchildBit.id)).toBeUndefined();
    expect(await store.getNode(root.id)).toMatchObject({
      id: root.id,
      title: root.title,
      deletedAt: null,
      version: 9,
    });
    expect(await store.getBit(unrelatedBit.id)).toMatchObject({
      id: unrelatedBit.id,
      title: unrelatedBit.title,
      deletedAt: null,
      version: 7,
    });

    const remainingChunks = await tables.chunks.toArray();
    expect(remainingChunks).toEqual([unrelatedChunk]);
  });

  it("deletes a Node closure's Scratch source and candidate without deleting audit history", async () => {
    const database = await openTransactionTestDatabase();

    try {
      await seedSevenStores(database, createSevenStoreSeed());
      const before = await snapshotSevenStores(database);
      const store = new IndexedDBDataStore(database);

      const result = await store.hardDeleteNode(
        TRANSACTION_TEST_IDS.inboxNode,
      );
      const after = await snapshotSevenStores(database);

      expect(result).toEqual({ status: "deleted" });
      expect(after.nodes).toEqual([]);
      expect(after.bits).toEqual([]);
      expect(after.chunks).toEqual([]);
      expect(after.scratchBreakdowns).toEqual([]);
      expect(after.stagedCandidates).toEqual([]);
      expect(after.candidateOrphanAuditEvents).toEqual(
        before.candidateOrphanAuditEvents,
      );
      expect(after.settings).toEqual(before.settings);
    } finally {
      database.close();
    }
  });

  it("rolls the actual hardDeleteNode path back when the Node-store checkpoint throws", async () => {
    const database = await openTransactionTestDatabase();

    try {
      await seedSevenStores(database, createSevenStoreSeed());
      const before = await snapshotSevenStores(database);
      const store = new IndexedDBDataStore(database, (checkpoint) => {
        if (checkpoint === "aggregate-delete.after.nodes") {
          throw new Error(checkpoint);
        }
        return undefined;
      });

      await expect(
        store.hardDeleteNode(TRANSACTION_TEST_IDS.inboxNode),
      ).rejects.toThrow("aggregate-delete.after.nodes");
      expect(await snapshotSevenStores(database)).toEqual(before);
    } finally {
      database.close();
    }
  });
});
