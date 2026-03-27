import { describe, expect, it } from "vitest";
import type { Bit, Chunk, Node } from "@/lib/db/schema";
import { IndexedDBDataStore } from "@/lib/db/indexeddb";

type StoredRecord = { id: string };

class FakeTable<T extends StoredRecord> {
  readonly records = new Map<string, T>();
  constructor(initial: T[] = []) { for (const item of initial) this.records.set(item.id, structuredClone(item)); }
  async get(id: string) { return this.records.has(id) ? structuredClone(this.records.get(id)!) : undefined; }
  async put(value: T) { this.records.set(value.id, structuredClone(value)); return value.id; }
  async bulkPut(values: T[]) { for (const v of values) this.records.set(v.id, structuredClone(v)); }
  async delete(id: string) { this.records.delete(id); }
  async bulkDelete(ids: string[]) { for (const id of ids) this.records.delete(id); }
  async toArray() { return Array.from(this.records.values(), (v) => structuredClone(v)); }
}

const BASE_TS = 1_700_000_000_000;
const CHUNK_TIME = BASE_TS + 2 * 86_400_000;

function makeNode(id: string, overrides: Partial<Node> = {}): Node {
  return { id, title: "Node", description: "", color: "hsl(210, 80%, 55%)", icon: "Folder", deadline: null, deadlineAllDay: false, mtime: BASE_TS, createdAt: BASE_TS, parentId: null, level: 0, x: 0, y: 0, deletedAt: null, ...overrides };
}
function makeBit(id: string, parentId: string, overrides: Partial<Bit> = {}): Bit {
  return { id, title: "Bit", description: "", icon: "Box", deadline: null, deadlineAllDay: false, priority: null, status: "active", mtime: BASE_TS, createdAt: BASE_TS, parentId, x: 2, y: 3, deletedAt: null, ...overrides } as Bit;
}
function makeChunk(id: string, parentId: string, overrides: Partial<Chunk> = {}): Chunk {
  return { id, title: "Chunk", description: "", time: null, timeAllDay: false, status: "incomplete", order: 0, parentId, ...overrides } as Chunk;
}

type FakeTables = {
  nodes: FakeTable<Node>;
  bits: FakeTable<Bit>;
  chunks: FakeTable<Chunk>;
};

function makeStore(nodes: Node[], bits: Bit[], chunks: Chunk[] = []): { store: IndexedDBDataStore; tables: FakeTables } {
  const tables: FakeTables = {
    nodes: new FakeTable(nodes),
    bits: new FakeTable(bits),
    chunks: new FakeTable(chunks),
  };
  const store = new IndexedDBDataStore({ nodes: tables.nodes as any, bits: tables.bits as any, chunks: tables.chunks as any });
  return { store, tables };
}

describe("Hook 9 — bit-to-node promotion", () => {
  it("promotes a Bit with 3 chunks to a new Node with 3 child Bits", async () => {
    const nId = crypto.randomUUID();
    const bId = crypto.randomUUID();
    const c1Id = crypto.randomUUID();
    const c2Id = crypto.randomUUID();
    const c3Id = crypto.randomUUID();

    const { store, tables } = makeStore(
      [makeNode(nId)],
      [makeBit(bId, nId, { title: "My Bit", icon: "Star" })],
      [
        makeChunk(c1Id, bId, { title: "Step A", time: CHUNK_TIME, timeAllDay: false, order: 0 }),
        makeChunk(c2Id, bId, { title: "Step B", time: null, timeAllDay: false, order: 1 }),
        makeChunk(c3Id, bId, { title: "Step C", time: CHUNK_TIME + 86_400_000, timeAllDay: true, order: 2 }),
      ],
    );

    const newNode = await store.promoteBitToNode(bId);

    // New node inherits bit properties
    expect(newNode.title).toBe("My Bit");
    expect(newNode.icon).toBe("Star");
    expect(newNode.parentId).toBe(nId);
    expect(newNode.level).toBe(1);
    expect(newNode.x).toBe(2);
    expect(newNode.y).toBe(3);

    // Original bit deleted
    expect(await store.getBit(bId)).toBeUndefined();

    // Original chunks deleted
    const remainingChunks = await tables.chunks.toArray();
    expect(remainingChunks).toHaveLength(0);

    // 3 new bits created inside new node
    const promotedBits = await store.getBits(newNode.id);
    expect(promotedBits).toHaveLength(3);

    // Titles match chunk titles
    const titles = promotedBits.map((b) => b.title).sort();
    expect(titles).toEqual(["Step A", "Step B", "Step C"]);

    // Deadlines match chunk times
    const bitA = promotedBits.find((b) => b.title === "Step A")!;
    expect(bitA.deadline).toBe(CHUNK_TIME);
    expect(bitA.deadlineAllDay).toBe(false);

    const bitB = promotedBits.find((b) => b.title === "Step B")!;
    expect(bitB.deadline).toBeNull();

    const bitC = promotedBits.find((b) => b.title === "Step C")!;
    expect(bitC.deadline).toBe(CHUNK_TIME + 86_400_000);
    expect(bitC.deadlineAllDay).toBe(true);

    // BFS places bits at distinct cells
    const cells = promotedBits.map((b) => `${b.x},${b.y}`);
    expect(new Set(cells).size).toBe(3);
  });

  it("promoted Bits are placed at BFS-sequential cells starting from (0,0)", async () => {
    const nId = crypto.randomUUID();
    const bId = crypto.randomUUID();
    const c1Id = crypto.randomUUID();
    const c2Id = crypto.randomUUID();

    const { store } = makeStore(
      [makeNode(nId)],
      [makeBit(bId, nId)],
      [
        makeChunk(c1Id, bId, { order: 0 }),
        makeChunk(c2Id, bId, { order: 1 }),
      ],
    );

    const newNode = await store.promoteBitToNode(bId);
    const bits = await store.getBits(newNode.id);

    const cells = bits.map((b) => `${b.x},${b.y}`).sort();
    expect(cells).toEqual(["0,0", "1,0"]);
  });

  it("blocking: Bit inside Level-3 Node throws max-depth error", async () => {
    const nId = crypto.randomUUID();
    const bId = crypto.randomUUID();
    const cId = crypto.randomUUID();

    const { store } = makeStore(
      [makeNode(nId, { level: 3 })],
      [makeBit(bId, nId)],
      [makeChunk(cId, bId)],
    );

    await expect(store.promoteBitToNode(bId)).rejects.toThrow();
  });

  it("blocking: level-3 guard error message mentions depth", async () => {
    const nId = crypto.randomUUID();
    const bId = crypto.randomUUID();
    const cId = crypto.randomUUID();

    const { store } = makeStore(
      [makeNode(nId, { level: 3 })],
      [makeBit(bId, nId)],
      [makeChunk(cId, bId)],
    );

    await expect(store.promoteBitToNode(bId)).rejects.toThrow(/depth/i);
  });

  it("blocking: Bit inside Level-2 Node is also blocked (max level is 2)", async () => {
    const nId = crypto.randomUUID();
    const bId = crypto.randomUUID();
    const cId = crypto.randomUUID();

    const { store } = makeStore(
      [makeNode(nId, { level: 2 })],
      [makeBit(bId, nId)],
      [makeChunk(cId, bId)],
    );

    await expect(store.promoteBitToNode(bId)).rejects.toThrow();
  });
});
