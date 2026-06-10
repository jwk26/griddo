import { describe, expect, it } from "vitest";
import type { Bit, Chunk, CreateScratchBreakdown, Node, ScratchBreakdown } from "@/lib/db/schema";
import { IndexedDBDataStore } from "@/lib/db/indexeddb";

type StoredRecord = { id: string };
type StoredSetting = { key: string; value: unknown };

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

class FakeSettingsTable {
  private readonly records = new Map<string, StoredSetting>();

  constructor(initial: StoredSetting[] = []) {
    for (const item of initial) {
      this.records.set(item.key, structuredClone(item));
    }
  }

  async get(key: string): Promise<StoredSetting | undefined> {
    const record = this.records.get(key);
    return record ? structuredClone(record) : undefined;
  }

  async put(value: StoredSetting): Promise<string> {
    this.records.set(value.key, structuredClone(value));
    return value.key;
  }
}

function createNode(overrides: Partial<Node> = {}): Node {
  const timestamp = overrides.createdAt ?? 1_700_000_000_000;
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Node",
    color: overrides.color ?? "hsl(210, 80%, 55%)",
    icon: overrides.icon ?? "folder",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    mtime: overrides.mtime ?? timestamp,
    createdAt: timestamp,
    parentId: overrides.parentId ?? null,
    level: overrides.level ?? 0,
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
    archivedAt: overrides.archivedAt ?? null,
    systemRole: overrides.systemRole ?? null,
    hiddenFromGrid: overrides.hiddenFromGrid ?? false,
  };
}

function createBit(overrides: Partial<Bit> = {}): Bit {
  const timestamp = overrides.createdAt ?? 1_700_000_000_000;
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Bit",
    description: overrides.description ?? "",
    icon: overrides.icon ?? "circle",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    priority: overrides.priority ?? null,
    status: overrides.status ?? "active",
    mtime: overrides.mtime ?? timestamp,
    createdAt: timestamp,
    parentId: overrides.parentId ?? "parent-1",
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
    archivedAt: overrides.archivedAt ?? null,
  };
}

function createScratchBreakdown(overrides: Partial<ScratchBreakdown> = {}): ScratchBreakdown {
  const timestamp = overrides.createdAt ?? 1_700_000_000_000;
  return {
    id: overrides.id ?? crypto.randomUUID(),
    scratchBitId: overrides.scratchBitId ?? "scratch-bit-1",
    content: overrides.content ?? "breakdown content",
    order: overrides.order ?? 0,
    createdAt: timestamp,
    consumedAt: overrides.consumedAt ?? null,
  };
}

function createStore(seed?: {
  nodes?: Node[];
  bits?: Bit[];
  chunks?: Chunk[];
  settings?: StoredSetting[];
  scratchBreakdowns?: ScratchBreakdown[];
}) {
  const database = {
    nodes: new FakeTable<Node>(seed?.nodes),
    bits: new FakeTable<Bit>(seed?.bits),
    chunks: new FakeTable<Chunk>(seed?.chunks),
    settings: new FakeSettingsTable(seed?.settings),
    scratchBreakdowns: new FakeTable<ScratchBreakdown>(seed?.scratchBreakdowns),
  };
  return { database, store: new IndexedDBDataStore(database) };
}

function createStoreWithoutScratch(seed?: { nodes?: Node[]; bits?: Bit[]; chunks?: Chunk[] }) {
  const database = {
    nodes: new FakeTable<Node>(seed?.nodes),
    bits: new FakeTable<Bit>(seed?.bits),
    chunks: new FakeTable<Chunk>(seed?.chunks),
  };
  return { database, store: new IndexedDBDataStore(database) };
}

function expectRecord<T>(record: T | undefined): T {
  expect(record).toBeDefined();
  return record as T;
}

function testUuid(index: number): string {
  return `00000000-0000-4000-8000-${index.toString().padStart(12, "0")}`;
}

describe("IndexedDBDataStore scratchBreakdowns CRUD", () => {
  it("creates and lists scratch breakdowns ordered by order", async () => {
    const scratchBitId = testUuid(101);
    const rows: CreateScratchBreakdown[] = [
      { scratchBitId, content: "order 2", order: 2 },
      { scratchBitId, content: "order 0", order: 0 },
      { scratchBitId, content: "order 1", order: 1 },
    ];
    const { store } = createStore();

    for (const row of rows) {
      await store.createScratchBreakdown(row);
    }

    const listedRows = await store.getScratchBreakdowns(scratchBitId);

    expect(listedRows).toHaveLength(3);
    expect(listedRows.map((row) => row.order)).toEqual([0, 1, 2]);
    expect(listedRows.map((row) => row.content)).toEqual(["order 0", "order 1", "order 2"]);
  });

  it("updates scratch breakdown content and order", async () => {
    const row = createScratchBreakdown({
      id: testUuid(102),
      scratchBitId: testUuid(103),
      content: "original",
      order: 0,
    });
    const { database, store } = createStore({ scratchBreakdowns: [row] });

    await store.updateScratchBreakdown(row.id, { content: "updated", order: 5 });

    expect(expectRecord(await database.scratchBreakdowns.get(row.id))).toMatchObject({
      content: "updated",
      order: 5,
    });
  });

  it("marks scratch breakdowns consumed and unconsumed", async () => {
    const row = createScratchBreakdown({
      id: testUuid(104),
      scratchBitId: testUuid(105),
      consumedAt: null,
    });
    const { database, store } = createStore({ scratchBreakdowns: [row] });

    await store.markScratchBreakdownConsumed(row.id);

    const consumedRow = expectRecord(await database.scratchBreakdowns.get(row.id));
    expect(consumedRow.consumedAt).toEqual(expect.any(Number));

    await store.unconsumeScratchBreakdown(row.id);

    const unconsumedRow = expectRecord(await database.scratchBreakdowns.get(row.id));
    expect(unconsumedRow.consumedAt).toBeNull();
  });

  it("bulk deletes scratch breakdowns by scratch bit", async () => {
    const scratchBitA = testUuid(106);
    const scratchBitB = testUuid(107);
    const rows = [
      createScratchBreakdown({ id: testUuid(108), scratchBitId: scratchBitA, order: 0 }),
      createScratchBreakdown({ id: testUuid(109), scratchBitId: scratchBitA, order: 1 }),
      createScratchBreakdown({ id: testUuid(110), scratchBitId: scratchBitA, order: 2 }),
      createScratchBreakdown({ id: testUuid(111), scratchBitId: scratchBitB, order: 0 }),
      createScratchBreakdown({ id: testUuid(112), scratchBitId: scratchBitB, order: 1 }),
    ];
    const { store } = createStore({ scratchBreakdowns: rows });

    await store.deleteScratchBreakdownsByScratch(scratchBitA);

    expect(await store.getScratchBreakdowns(scratchBitA)).toEqual([]);
    expect(await store.getScratchBreakdowns(scratchBitB)).toHaveLength(2);
  });
});

describe("IndexedDBDataStore scratchBreakdowns lifecycle integration", () => {
  it("hard-deletes scratch breakdown rows when hard-deleting their scratch bit", async () => {
    const scratchBit = createBit({
      id: testUuid(113),
      parentId: testUuid(114),
      title: "Scratch",
    });
    const unrelatedScratchBitId = testUuid(115);
    const rows = [
      createScratchBreakdown({ id: testUuid(116), scratchBitId: scratchBit.id }),
      createScratchBreakdown({ id: testUuid(117), scratchBitId: scratchBit.id }),
      createScratchBreakdown({ id: testUuid(118), scratchBitId: scratchBit.id }),
      createScratchBreakdown({ id: testUuid(119), scratchBitId: unrelatedScratchBitId }),
    ];
    const { database, store } = createStore({
      bits: [scratchBit],
      scratchBreakdowns: rows,
    });

    await store.hardDeleteBit(scratchBit.id);

    expect(await store.getScratchBreakdowns(scratchBit.id)).toEqual([]);
    expect(await store.getScratchBreakdowns(unrelatedScratchBitId)).toHaveLength(1);
    expect(await database.bits.get(scratchBit.id)).toBeUndefined();
  });

  it("keeps scratch breakdown rows when archiving their scratch bit", async () => {
    const scratchBit = createBit({
      id: testUuid(120),
      parentId: testUuid(121),
      title: "Scratch",
      archivedAt: null,
    });
    const rows = [
      createScratchBreakdown({ id: testUuid(122), scratchBitId: scratchBit.id }),
      createScratchBreakdown({ id: testUuid(123), scratchBitId: scratchBit.id }),
    ];
    const { database, store } = createStore({
      bits: [scratchBit],
      scratchBreakdowns: rows,
    });

    await store.archiveBit(scratchBit.id);

    const archivedScratchBit = expectRecord(await database.bits.get(scratchBit.id));
    expect(archivedScratchBit.archivedAt).not.toBeNull();
    expect(await store.getScratchBreakdowns(scratchBit.id)).toHaveLength(2);
  });

  it("hard-deletes bits and chunks without a scratchBreakdowns table", async () => {
    const parentNode = createNode({ id: testUuid(124) });
    const bit = createBit({ id: testUuid(125), parentId: parentNode.id });
    const chunk: Chunk = {
      id: testUuid(126),
      parentId: bit.id,
      title: "chunk content",
      description: "",
      time: null,
      timeAllDay: false,
      status: "incomplete",
      order: 0,
    };
    const { database, store } = createStoreWithoutScratch({
      nodes: [parentNode],
      bits: [bit],
      chunks: [chunk],
    });

    await expect(store.hardDeleteBit(bit.id)).resolves.toBeUndefined();

    expect(await database.bits.get(bit.id)).toBeUndefined();
    expect(await database.chunks.get(chunk.id)).toBeUndefined();
  });
});
