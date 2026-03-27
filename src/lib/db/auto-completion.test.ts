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

function makeNode(id: string): Node {
  return { id, title: "Node", description: "", color: "hsl(210, 80%, 55%)", icon: "Folder", deadline: null, deadlineAllDay: false, mtime: BASE_TS, createdAt: BASE_TS, parentId: null, level: 0, x: 0, y: 0, deletedAt: null };
}
function makeBit(id: string, parentId: string, overrides: Partial<Bit> = {}): Bit {
  return { id, title: "Bit", description: "", icon: "Box", deadline: null, deadlineAllDay: false, priority: null, status: "active", mtime: BASE_TS, createdAt: BASE_TS, parentId, x: 0, y: 0, deletedAt: null, ...overrides } as Bit;
}
function makeChunk(id: string, parentId: string, overrides: Partial<Chunk> = {}): Chunk {
  return { id, title: "Chunk", description: "", time: null, timeAllDay: false, status: "incomplete", order: 0, parentId, ...overrides } as Chunk;
}
function makeStore(nodes: Node[], bits: Bit[], chunks: Chunk[]) {
  return new IndexedDBDataStore({ nodes: new FakeTable(nodes) as any, bits: new FakeTable(bits) as any, chunks: new FakeTable(chunks) as any });
}

describe("Hook 3 — auto-completion", () => {
  it("completing last chunk auto-completes the Bit", async () => {
    const nId = crypto.randomUUID();
    const bId = crypto.randomUUID();
    const c1Id = crypto.randomUUID();
    const c2Id = crypto.randomUUID();

    const store = makeStore(
      [makeNode(nId)],
      [makeBit(bId, nId, { status: "active" })],
      [makeChunk(c1Id, bId, { status: "complete" }), makeChunk(c2Id, bId, { status: "incomplete", order: 1 })],
    );

    await store.updateChunk(c2Id, { status: "complete" });
    const updated = await store.getBit(bId);
    expect(updated!.status).toBe("complete");
  });

  it("unchecking a chunk reverts an auto-completed Bit to active", async () => {
    const nId = crypto.randomUUID();
    const bId = crypto.randomUUID();
    const c1Id = crypto.randomUUID();
    const c2Id = crypto.randomUUID();

    const store = makeStore(
      [makeNode(nId)],
      [makeBit(bId, nId, { status: "complete" })],
      [makeChunk(c1Id, bId, { status: "complete" }), makeChunk(c2Id, bId, { status: "complete", order: 1 })],
    );

    await store.updateChunk(c2Id, { status: "incomplete" });
    const updated = await store.getBit(bId);
    expect(updated!.status).toBe("active");
  });

  it("sticky force-complete: unchecking does NOT revert a force-completed Bit (2+ incomplete)", async () => {
    const nId = crypto.randomUUID();
    const bId = crypto.randomUUID();
    const c1Id = crypto.randomUUID();
    const c2Id = crypto.randomUUID();

    // c1 was already incomplete when the bit was force-completed
    const store = makeStore(
      [makeNode(nId)],
      [makeBit(bId, nId, { status: "complete" })],
      [makeChunk(c1Id, bId, { status: "incomplete" }), makeChunk(c2Id, bId, { status: "complete", order: 1 })],
    );

    // Uncheck c2 → now 2 incomplete chunks → force-completed → keep complete
    await store.updateChunk(c2Id, { status: "incomplete" });
    const updated = await store.getBit(bId);
    expect(updated!.status).toBe("complete");
  });

  it("completing all chunks via the last incomplete chunk auto-completes the Bit", async () => {
    const nId = crypto.randomUUID();
    const bId = crypto.randomUUID();
    const c1Id = crypto.randomUUID();

    const store = makeStore(
      [makeNode(nId)],
      [makeBit(bId, nId, { status: "active" })],
      [makeChunk(c1Id, bId, { status: "incomplete" })],
    );

    await store.updateChunk(c1Id, { status: "complete" });
    const updated = await store.getBit(bId);
    expect(updated!.status).toBe("complete");
  });
});
