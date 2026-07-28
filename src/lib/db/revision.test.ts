import Dexie from "dexie";
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { describe, expect, it, vi } from "vitest";
import type { Bit, Chunk, Node, ScratchBreakdown } from "@/lib/db/schema";
import { GridDODatabase, IndexedDBDataStore } from "@/lib/db/indexeddb";

type StoredRecord = { id: string };

class FakeTable<T extends StoredRecord> {
  private readonly records = new Map<string, T>();

  constructor(initial: T[] = []) {
    for (const item of initial) this.records.set(item.id, structuredClone(item));
  }

  async get(id: string): Promise<T | undefined> {
    const item = this.records.get(id);
    return item ? structuredClone(item) : undefined;
  }

  async put(value: T): Promise<string> {
    this.records.set(value.id, structuredClone(value));
    return value.id;
  }

  async bulkPut(values: T[]): Promise<void> {
    for (const value of values) this.records.set(value.id, structuredClone(value));
  }

  async delete(id: string): Promise<void> {
    this.records.delete(id);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    for (const id of ids) this.records.delete(id);
  }

  async toArray(): Promise<T[]> {
    return Array.from(this.records.values(), (item) => structuredClone(item));
  }
}

function createNode(overrides: Partial<Node> = {}): Node {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Node A",
    color: overrides.color ?? "hsl(210, 80%, 55%)",
    icon: overrides.icon ?? "folder",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    mtime: overrides.mtime ?? 100,
    createdAt: overrides.createdAt ?? 100,
    version: overrides.version ?? 1,
    parentId: overrides.parentId ?? null,
    level: overrides.level ?? 0,
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
    archivedAt: overrides.archivedAt ?? null,
    systemRole: overrides.systemRole ?? null,
    hiddenFromGrid: overrides.hiddenFromGrid ?? false,
    pastDeadlineDismissed: overrides.pastDeadlineDismissed ?? false,
  };
}

function createBit(overrides: Partial<Bit> = {}): Bit {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Bit A",
    description: overrides.description ?? "",
    icon: overrides.icon ?? "circle",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    priority: overrides.priority ?? null,
    status: overrides.status ?? "active",
    mtime: overrides.mtime ?? 100,
    createdAt: overrides.createdAt ?? 100,
    version: overrides.version ?? 1,
    parentId: overrides.parentId ?? crypto.randomUUID(),
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
    archivedAt: overrides.archivedAt ?? null,
    pastDeadlineDismissed: overrides.pastDeadlineDismissed ?? false,
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

function createStore(seed: { nodes?: Node[]; bits?: Bit[]; chunks?: Chunk[] } = {}) {
  const database = {
    nodes: new FakeTable<Node>(seed.nodes),
    bits: new FakeTable<Bit>(seed.bits),
    chunks: new FakeTable<Chunk>(seed.chunks),
    scratchBreakdowns: new FakeTable<ScratchBreakdown>(),
  };

  return { database, store: new IndexedDBDataStore(database) };
}

type ReadableTable<T> = {
  get(id: string): Promise<T | undefined>;
};

async function withRealStore(
  seed: {
    nodes?: Node[];
    bits?: Bit[];
    scratchBreakdowns?: ScratchBreakdown[];
  },
  run: (database: GridDODatabase, store: IndexedDBDataStore) => Promise<void>,
): Promise<void> {
  const database = new GridDODatabase({
    indexedDB: new IDBFactory(),
    IDBKeyRange,
  });

  await database.open();

  try {
    await database.nodes.bulkPut(seed.nodes ?? []);
    await database.bits.bulkPut(seed.bits ?? []);
    await database.scratchBreakdowns.bulkPut(seed.scratchBreakdowns ?? []);
    await run(database, new IndexedDBDataStore(database));
  } finally {
    database.close();
  }
}

async function runWithConcurrentOutsideReadBarrier<T>(
  table: ReadableTable<T>,
  targetId: string,
  run: () => Promise<void>,
): Promise<void> {
  const originalGet = table.get.bind(table);
  let outsideReadCount = 0;
  let releaseOutsideReads!: () => void;
  const bothOutsideReads = new Promise<void>((resolve) => {
    releaseOutsideReads = resolve;
  });
  const getSpy = vi.spyOn(table, "get").mockImplementation(async (id: string) => {
    const startedInsideTransaction = Dexie.currentTransaction !== null;
    const record = await originalGet(id);

    if (id === targetId && !startedInsideTransaction) {
      outsideReadCount += 1;
      if (outsideReadCount === 2) releaseOutsideReads();
      await bothOutsideReads;
    }

    return record;
  });

  try {
    await run();
    expect(outsideReadCount).toBe(0);
  } finally {
    getSpy.mockRestore();
  }
}

describe("monotonic record revisions", () => {
  it("serializes concurrent Node patches without losing either field or revision", async () => {
    const node = createNode({ title: "A", icon: "folder", version: 4 });

    await withRealStore({ nodes: [node] }, async (database, store) => {
      await runWithConcurrentOutsideReadBarrier(database.nodes, node.id, async () => {
        await Promise.all([store.updateNode(node.id, { title: "B" }), store.updateNode(node.id, { icon: "star" })]);
      });

      expect(await database.nodes.get(node.id)).toMatchObject({
        title: "B",
        icon: "star",
        version: 6,
      });

      await store.updateNode(node.id, { title: "A" });
      expect(await database.nodes.get(node.id)).toMatchObject({
        title: "A",
        icon: "star",
        version: 7,
      });
    });
  });

  it("serializes concurrent Bit patches without losing either field or revision", async () => {
    const parent = createNode();
    const bit = createBit({
      parentId: parent.id,
      title: "A",
      priority: null,
      version: 4,
    });

    await withRealStore({ nodes: [parent], bits: [bit] }, async (database, store) => {
      await runWithConcurrentOutsideReadBarrier(database.bits, bit.id, async () => {
        await Promise.all([store.updateBit(bit.id, { title: "B" }), store.updateBit(bit.id, { priority: "high" })]);
      });

      expect(await database.bits.get(bit.id)).toMatchObject({
        title: "B",
        priority: "high",
        version: 6,
      });

      await store.updateBit(bit.id, { title: "A" });
      expect(await database.bits.get(bit.id)).toMatchObject({
        title: "A",
        priority: "high",
        version: 7,
      });
    });
  });

  it("serializes concurrent Breakdown patches without losing either field or revision", async () => {
    const inbox = createNode({ systemRole: "inbox" });
    const scratch = createBit({ parentId: inbox.id });
    const breakdown: ScratchBreakdown = {
      id: crypto.randomUUID(),
      scratchBitId: scratch.id,
      content: "A",
      order: 0,
      createdAt: 100,
      consumedAt: null,
      version: 4,
    };

    await withRealStore(
      { nodes: [inbox], bits: [scratch], scratchBreakdowns: [breakdown] },
      async (database, store) => {
        await runWithConcurrentOutsideReadBarrier(database.scratchBreakdowns, breakdown.id, async () => {
          await Promise.all([
            store.updateScratchBreakdown(breakdown.id, { content: "B" }),
            store.updateScratchBreakdown(breakdown.id, { order: 3 }),
          ]);
        });

        expect(await database.scratchBreakdowns.get(breakdown.id)).toMatchObject({
          content: "B",
          order: 3,
          version: 6,
        });

        await store.updateScratchBreakdown(breakdown.id, { content: "A" });
        expect(await database.scratchBreakdowns.get(breakdown.id)).toMatchObject({
          content: "A",
          order: 3,
          version: 7,
        });
      },
    );
  });

  it("increments a Node once per logical patch and keeps no-op and ABA distinguishable", async () => {
    const node = createNode({ title: "A", version: 4 });
    const { database, store } = createStore({ nodes: [node] });

    await store.updateNode(node.id, { title: "B", icon: "star" });
    expect(await database.nodes.get(node.id)).toMatchObject({
      title: "B",
      icon: "star",
      version: 5,
    });

    await store.updateNode(node.id, { title: "B", icon: "star" });
    expect((await database.nodes.get(node.id))?.version).toBe(5);

    await expect(store.updateNode(node.id, { title: undefined })).rejects.toThrow();
    expect((await database.nodes.get(node.id))?.version).toBe(5);

    await store.updateNode(node.id, { title: "A" });
    expect(await database.nodes.get(node.id)).toMatchObject({
      title: "A",
      version: 6,
    });
  });

  it("increments a Bit once for a position-only patch without changing mtime", async () => {
    const parent = createNode();
    const bit = createBit({
      parentId: parent.id,
      version: 8,
      mtime: 123,
      x: 0,
      y: 0,
    });
    const { database, store } = createStore({ nodes: [parent], bits: [bit] });

    await store.updateBit(bit.id, { x: 2, y: 3 });

    expect(await database.bits.get(bit.id)).toMatchObject({
      x: 2,
      y: 3,
      mtime: 123,
      version: 9,
    });
  });

  it("derives mtime from fields that actually changed", async () => {
    const node = createNode({ title: "Same", version: 2, mtime: 222, x: 0 });
    const { database, store } = createStore({ nodes: [node] });

    await store.updateNode(node.id, { title: "Same", x: 3 });

    expect(await database.nodes.get(node.id)).toMatchObject({
      title: "Same",
      x: 3,
      mtime: 222,
      version: 3,
    });
  });

  it("increments a Bit only when Chunk membership changes its status", async () => {
    const parent = createNode({ version: 6 });
    const bit = createBit({
      parentId: parent.id,
      status: "complete",
      version: 4,
    });
    const existingChunk = createChunk({
      parentId: bit.id,
      status: "incomplete",
    });
    const { database, store } = createStore({
      nodes: [parent],
      bits: [bit],
      chunks: [existingChunk],
    });

    await store.createChunk({
      title: "New child",
      description: "",
      time: null,
      timeAllDay: false,
      order: 1,
      parentId: bit.id,
    });

    expect(await database.bits.get(bit.id)).toMatchObject({
      status: "active",
      version: 5,
    });
    expect((await database.nodes.get(parent.id))?.version).toBe(6);

    await store.deleteChunk(existingChunk.id);
    expect((await database.bits.get(bit.id))?.version).toBe(5);
    expect((await database.nodes.get(parent.id))?.version).toBe(6);
  });
});
