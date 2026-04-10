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

function makeNode(id: string, overrides: Partial<Node> = {}): Node {
  return { id, title: "Node", color: "hsl(210, 80%, 55%)", icon: "Folder", deadline: null, deadlineAllDay: false, mtime: BASE_TS, createdAt: BASE_TS, parentId: null, level: 0, x: 0, y: 0, deletedAt: null, ...overrides };
}
function makeBit(id: string, parentId: string, overrides: Partial<Bit> = {}): Bit {
  return { id, title: "Bit", description: "", icon: "Box", deadline: null, deadlineAllDay: false, priority: null, status: "active", mtime: BASE_TS, createdAt: BASE_TS, parentId, x: 0, y: 0, deletedAt: null, ...overrides } as Bit;
}
function makeChunk(id: string, parentId: string, overrides: Partial<Chunk> = {}): Chunk {
  return { id, title: "Chunk", description: "", time: null, timeAllDay: false, status: "incomplete", order: 0, parentId, ...overrides } as Chunk;
}
function makeStore(nodes: Node[], bits: Bit[], chunks: Chunk[]) {
  return new IndexedDBDataStore({ nodes: new FakeTable(nodes), bits: new FakeTable(bits), chunks: new FakeTable(chunks) });
}

describe("Hook 1 — mtime cascade", () => {
  it("chunk status change cascades mtime to parent Bit and parent Node", async () => {
    const nId = crypto.randomUUID();
    const bId = crypto.randomUUID();
    const cId = crypto.randomUUID();

    const node = makeNode(nId, { mtime: BASE_TS });
    const bit = makeBit(bId, nId, { mtime: BASE_TS });
    const chunk = makeChunk(cId, bId, { status: "incomplete" });

    const store = makeStore([node], [bit], [chunk]);
    const before = Date.now();
    await store.updateChunk(cId, { status: "complete" });
    const after = Date.now();

    const updatedBit = await store.getBit(bId);
    const updatedNodes = await store.getNodes(null);
    const updatedNode = updatedNodes.find((n) => n.id === nId)!;

    expect(updatedBit!.mtime).toBeGreaterThanOrEqual(before);
    expect(updatedBit!.mtime).toBeLessThanOrEqual(after);
    expect(updatedNode.mtime).toBeGreaterThanOrEqual(before);
    expect(updatedNode.mtime).toBeLessThanOrEqual(after);
  });

  it("grid reposition does NOT update mtime", async () => {
    const nId = crypto.randomUUID();
    const bId = crypto.randomUUID();

    const node = makeNode(nId);
    const bit = makeBit(bId, nId, { x: 0, y: 0, mtime: BASE_TS });

    const store = makeStore([node], [bit], []);
    await store.updateBit(bId, { x: 0, y: 1 });

    const updatedBit = await store.getBit(bId);
    expect(updatedBit!.mtime).toBe(BASE_TS);
  });

  it("bit change cascades mtime to parent Node", async () => {
    const nId = crypto.randomUUID();
    const bId = crypto.randomUUID();

    const node = makeNode(nId, { mtime: BASE_TS });
    const bit = makeBit(bId, nId, { mtime: BASE_TS });

    const store = makeStore([node], [bit], []);
    const before = Date.now();
    await store.updateBit(bId, { title: "Updated" });
    const after = Date.now();

    const updatedNodes = await store.getNodes(null);
    const updatedNode = updatedNodes.find((n) => n.id === nId)!;
    expect(updatedNode.mtime).toBeGreaterThanOrEqual(before);
    expect(updatedNode.mtime).toBeLessThanOrEqual(after);
  });
});
