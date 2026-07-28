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
    version: overrides.version ?? 1,
    pastDeadlineDismissed: overrides.pastDeadlineDismissed ?? false,
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
    version: overrides.version ?? 1,
    pastDeadlineDismissed: overrides.pastDeadlineDismissed ?? false,
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
    version: overrides.version ?? 1,
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
    const scratchBit = createBit({
      id: scratchBitId,
      parentId: testUuid(302),
      title: "Scratch",
      version: 4,
    });
    const rows: CreateScratchBreakdown[] = [
      { scratchBitId, content: "order 2", order: 2 },
      { scratchBitId, content: "order 0", order: 0 },
      { scratchBitId, content: "order 1", order: 1 },
    ];
    const { database, store } = createStore({ bits: [scratchBit] });

    for (const row of rows) {
      await store.createScratchBreakdown(row);
    }

    const listedRows = await store.getScratchBreakdowns(scratchBitId);

    expect(listedRows).toHaveLength(3);
    expect(listedRows.map((row) => row.order)).toEqual([0, 1, 2]);
    expect(listedRows.map((row) => row.content)).toEqual(["order 0", "order 1", "order 2"]);
    expect(listedRows.every((row) => row.version === 1)).toBe(true);
    expect(await database.bits.get(scratchBit.id)).toMatchObject({
      version: 7,
      mtime: scratchBit.mtime,
    });
  });

  it("advances the surviving Scratch version across legacy Add then Delete", async () => {
    const scratchBit = createBit({
      id: testUuid(303),
      parentId: testUuid(304),
      title: "Scratch",
      version: 10,
    });
    const { database, store } = createStore({ bits: [scratchBit] });

    const row = await store.createScratchBreakdown({
      scratchBitId: scratchBit.id,
      content: "temporary row",
      order: 0,
    });
    await store.deleteScratchBreakdown(row.id);

    expect(await database.scratchBreakdowns.get(row.id)).toBeUndefined();
    expect((await database.bits.get(scratchBit.id))?.version).toBe(12);
  });

  it("does not advance the Scratch version when deleting a missing row", async () => {
    const scratchBit = createBit({
      id: testUuid(305),
      parentId: testUuid(306),
      title: "Scratch",
      version: 15,
    });
    const { database, store } = createStore({ bits: [scratchBit] });

    await store.deleteScratchBreakdown(testUuid(307));

    expect((await database.bits.get(scratchBit.id))?.version).toBe(15);
  });

  it("updates scratch breakdown content and order", async () => {
    const row = createScratchBreakdown({
      id: testUuid(102),
      scratchBitId: testUuid(103),
      content: "original",
      order: 0,
      version: 4,
    });
    const { database, store } = createStore({ scratchBreakdowns: [row] });

    await store.updateScratchBreakdown(row.id, {
      content: "updated",
      order: 5,
    });

    expect(expectRecord(await database.scratchBreakdowns.get(row.id))).toMatchObject({
      content: "updated",
      order: 5,
      version: 5,
    });

    await store.updateScratchBreakdown(row.id, {
      content: "updated",
      order: 5,
    });
    expect((await database.scratchBreakdowns.get(row.id))?.version).toBe(5);
  });

  it("marks scratch breakdowns consumed and unconsumed", async () => {
    const row = createScratchBreakdown({
      id: testUuid(104),
      scratchBitId: testUuid(105),
      consumedAt: null,
      version: 6,
    });
    const { database, store } = createStore({ scratchBreakdowns: [row] });

    await store.markScratchBreakdownConsumed(row.id);

    const consumedRow = expectRecord(await database.scratchBreakdowns.get(row.id));
    expect(consumedRow.consumedAt).toEqual(expect.any(Number));
    expect(consumedRow.version).toBe(7);

    await store.markScratchBreakdownConsumed(row.id);
    expect((await database.scratchBreakdowns.get(row.id))?.version).toBe(7);

    await store.unconsumeScratchBreakdown(row.id);

    const unconsumedRow = expectRecord(await database.scratchBreakdowns.get(row.id));
    expect(unconsumedRow.consumedAt).toBeNull();
    expect(unconsumedRow.version).toBe(8);

    await store.unconsumeScratchBreakdown(row.id);
    expect((await database.scratchBreakdowns.get(row.id))?.version).toBe(8);
  });

  it("markScratchBreakdownConsumed sets consumedAt without altering content or order", async () => {
    const row = createScratchBreakdown({
      id: testUuid(300),
      scratchBitId: testUuid(301),
      content: "original content",
      order: 7,
      consumedAt: null,
      version: 9,
    });
    const { database, store } = createStore({ scratchBreakdowns: [row] });

    await store.markScratchBreakdownConsumed(row.id);

    const result = expectRecord(await database.scratchBreakdowns.get(row.id));
    expect(result.consumedAt).toEqual(expect.any(Number));
    expect(result.content).toBe("original content");
    expect(result.order).toBe(7);
    expect(result.version).toBe(10);
  });

  it("bulk deletes scratch breakdowns by scratch bit", async () => {
    const scratchBitA = testUuid(106);
    const scratchBitB = testUuid(107);
    const ownerA = createBit({
      id: scratchBitA,
      parentId: testUuid(308),
      title: "Scratch A",
      version: 20,
    });
    const ownerB = createBit({
      id: scratchBitB,
      parentId: testUuid(309),
      title: "Scratch B",
      version: 30,
    });
    const rows = [
      createScratchBreakdown({
        id: testUuid(108),
        scratchBitId: scratchBitA,
        order: 0,
      }),
      createScratchBreakdown({
        id: testUuid(109),
        scratchBitId: scratchBitA,
        order: 1,
      }),
      createScratchBreakdown({
        id: testUuid(110),
        scratchBitId: scratchBitA,
        order: 2,
      }),
      createScratchBreakdown({
        id: testUuid(111),
        scratchBitId: scratchBitB,
        order: 0,
      }),
      createScratchBreakdown({
        id: testUuid(112),
        scratchBitId: scratchBitB,
        order: 1,
      }),
    ];
    const { database, store } = createStore({
      bits: [ownerA, ownerB],
      scratchBreakdowns: rows,
    });

    await store.deleteScratchBreakdownsByScratch(scratchBitA);

    expect(await store.getScratchBreakdowns(scratchBitA)).toEqual([]);
    expect(await store.getScratchBreakdowns(scratchBitB)).toHaveLength(2);
    expect((await database.bits.get(scratchBitA))?.version).toBe(21);
    expect((await database.bits.get(scratchBitB))?.version).toBe(30);

    await store.deleteScratchBreakdownsByScratch(scratchBitA);
    expect((await database.bits.get(scratchBitA))?.version).toBe(21);
  });

  it("deletes a single scratch breakdown by id without affecting others", async () => {
    const scratchBitId = testUuid(200);
    const scratchBit = createBit({
      id: scratchBitId,
      parentId: testUuid(310),
      title: "Scratch",
      version: 40,
    });
    const rows = [
      createScratchBreakdown({
        id: testUuid(201),
        scratchBitId,
        content: "row A",
        order: 0,
      }),
      createScratchBreakdown({
        id: testUuid(202),
        scratchBitId,
        content: "row B",
        order: 1,
      }),
      createScratchBreakdown({
        id: testUuid(203),
        scratchBitId,
        content: "row C",
        order: 2,
      }),
    ];
    const { database, store } = createStore({
      bits: [scratchBit],
      scratchBreakdowns: rows,
    });

    await store.deleteScratchBreakdown(testUuid(202));

    const remaining = await store.getScratchBreakdowns(scratchBitId);
    expect(remaining).toHaveLength(2);
    expect(remaining.map((r) => r.id)).not.toContain(testUuid(202));
    expect(remaining.map((r) => r.content)).toEqual(["row A", "row C"]);
    expect((await database.bits.get(scratchBit.id))?.version).toBe(41);

    await store.deleteScratchBreakdown(testUuid(202));
    expect((await database.bits.get(scratchBit.id))?.version).toBe(41);
  });

  it("preserves rows when their Scratch owner is missing", async () => {
    const scratchBitId = testUuid(311);
    const row = createScratchBreakdown({ id: testUuid(312), scratchBitId });
    const { database, store } = createStore({ scratchBreakdowns: [row] });

    await expect(store.deleteScratchBreakdown(row.id)).rejects.toThrow(`Bit not found: ${scratchBitId}`);
    expect(await database.scratchBreakdowns.get(row.id)).toEqual(row);
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
      createScratchBreakdown({
        id: testUuid(116),
        scratchBitId: scratchBit.id,
      }),
      createScratchBreakdown({
        id: testUuid(117),
        scratchBitId: scratchBit.id,
      }),
      createScratchBreakdown({
        id: testUuid(118),
        scratchBitId: scratchBit.id,
      }),
      createScratchBreakdown({
        id: testUuid(119),
        scratchBitId: unrelatedScratchBitId,
      }),
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
      version: 12,
    });
    const rows = [
      createScratchBreakdown({
        id: testUuid(122),
        scratchBitId: scratchBit.id,
      }),
      createScratchBreakdown({
        id: testUuid(123),
        scratchBitId: scratchBit.id,
      }),
    ];
    const { database, store } = createStore({
      bits: [scratchBit],
      scratchBreakdowns: rows,
    });

    await store.archiveBit(scratchBit.id);

    const archivedScratchBit = expectRecord(await database.bits.get(scratchBit.id));
    expect(archivedScratchBit.archivedAt).not.toBeNull();
    expect(archivedScratchBit.version).toBe(13);
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
