import { describe, expect, it } from "vitest";
import type { Bit, Node } from "@/lib/db/schema";
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
  return { id, title: "Node", description: "", color: "hsl(210, 80%, 55%)", icon: "Folder", deadline: null, deadlineAllDay: false, mtime: BASE_TS, createdAt: BASE_TS, parentId: null, level: 0, x: 0, y: 0, deletedAt: null, ...overrides };
}
function makeBit(id: string, parentId: string, overrides: Partial<Bit> = {}): Bit {
  return { id, title: "Bit", description: "", icon: "Box", deadline: null, deadlineAllDay: false, priority: null, status: "active", mtime: BASE_TS, createdAt: BASE_TS, parentId, x: 0, y: 0, deletedAt: null, ...overrides } as Bit;
}
function makeStore(nodes: Node[], bits: Bit[]) {
  return new IndexedDBDataStore({ nodes: new FakeTable(nodes) as any, bits: new FakeTable(bits) as any, chunks: new FakeTable([]) as any });
}

describe("Hook 8 — grid cell uniqueness", () => {
  it("moving a Bit to an occupied cell throws", async () => {
    const nId = crypto.randomUUID();
    const aId = crypto.randomUUID();
    const bId = crypto.randomUUID();

    const store = makeStore(
      [makeNode(nId)],
      [makeBit(aId, nId, { x: 0, y: 0 }), makeBit(bId, nId, { x: 1, y: 0 })],
    );

    await expect(store.updateBit(bId, { x: 0, y: 0 })).rejects.toThrow();
  });

  it("moving a Bit to its own cell succeeds (excluded from occupancy check)", async () => {
    const nId = crypto.randomUUID();
    const bId = crypto.randomUUID();

    const store = makeStore([makeNode(nId)], [makeBit(bId, nId, { x: 0, y: 0 })]);

    await expect(store.updateBit(bId, { x: 0, y: 0 })).resolves.toBeUndefined();
  });

  it("creating a Bit at an occupied cell throws", async () => {
    const nId = crypto.randomUUID();
    const existingId = crypto.randomUUID();

    const store = makeStore([makeNode(nId)], [makeBit(existingId, nId, { x: 0, y: 0 })]);

    await expect(
      store.createBit({ title: "New", description: "", icon: "Box", parentId: nId, x: 0, y: 0, deadline: null, deadlineAllDay: false, priority: null }),
    ).rejects.toThrow();
  });

  it("creating a Bit at an empty cell succeeds", async () => {
    const nId = crypto.randomUUID();
    const store = makeStore([makeNode(nId)], []);

    const bit = await store.createBit({ title: "New", description: "", icon: "Box", parentId: nId, x: 0, y: 0, deadline: null, deadlineAllDay: false, priority: null });
    expect(bit.x).toBe(0);
    expect(bit.y).toBe(0);
  });
});
