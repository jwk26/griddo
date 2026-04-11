import { describe, expect, it } from "vitest";
import type { Bit, Chunk, Node } from "@/lib/db/schema";
import { IndexedDBDataStore, DeadlineConflictError } from "@/lib/db/indexeddb";

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
const PARENT_DEADLINE = BASE_TS + 7 * 86_400_000;
const CHILD_DEADLINE_OK = BASE_TS + 5 * 86_400_000;
const CHILD_DEADLINE_OVER = BASE_TS + 10 * 86_400_000;

function makeNode(id: string, overrides: Partial<Node> = {}): Node {
  return { id, title: "Node", color: "hsl(210, 80%, 55%)", icon: "Folder", deadline: null, deadlineAllDay: false, mtime: BASE_TS, createdAt: BASE_TS, parentId: null, level: 0, x: 0, y: 0, deletedAt: null, ...overrides };
}
function makeBit(id: string, parentId: string, overrides: Partial<Bit> = {}): Bit {
  return { id, title: "Bit", description: "", icon: "Box", deadline: null, deadlineAllDay: false, priority: null, status: "active", mtime: BASE_TS, createdAt: BASE_TS, parentId, x: 0, y: 0, deletedAt: null, ...overrides } as Bit;
}
function makeStore(nodes: Node[], bits: Bit[], chunks: Chunk[] = []) {
  return new IndexedDBDataStore({ nodes: new FakeTable(nodes), bits: new FakeTable(bits), chunks: new FakeTable(chunks) });
}

describe("Hook 2 — deadline hierarchy", () => {
  it("setting child deadline within parent deadline succeeds", async () => {
    const nId = crypto.randomUUID();
    const bId = crypto.randomUUID();
    const node = makeNode(nId, { deadline: PARENT_DEADLINE });
    const bit = makeBit(bId, nId);
    const store = makeStore([node], [bit]);

    await expect(store.updateBit(bId, { deadline: CHILD_DEADLINE_OK })).resolves.toBeUndefined();
  });

  it("child deadline past parent deadline throws DeadlineConflictError", async () => {
    const nId = crypto.randomUUID();
    const bId = crypto.randomUUID();
    const node = makeNode(nId, { deadline: PARENT_DEADLINE });
    const bit = makeBit(bId, nId);
    const store = makeStore([node], [bit]);

    await expect(store.updateBit(bId, { deadline: CHILD_DEADLINE_OVER })).rejects.toBeInstanceOf(DeadlineConflictError);
  });

  it("allows a timed child on the same day when the parent deadline is all-day", async () => {
    const nId = crypto.randomUUID();
    const bId = crypto.randomUUID();
    const parentDeadline = new Date(2026, 3, 12, 0, 0).getTime();
    const childDeadline = new Date(2026, 3, 12, 18, 0).getTime();
    const node = makeNode(nId, { deadline: parentDeadline, deadlineAllDay: true });
    const bit = makeBit(bId, nId);
    const store = makeStore([node], [bit]);

    await expect(
      store.updateBit(bId, { deadline: childDeadline, deadlineAllDay: false }),
    ).resolves.toBeUndefined();
  });

  it("rejects an all-day chunk when a timed bit deadline is earlier that same day", async () => {
    const nId = crypto.randomUUID();
    const bId = crypto.randomUUID();
    const node = makeNode(nId);
    const bitDeadline = new Date(2026, 3, 12, 10, 0).getTime();
    const bit = makeBit(bId, nId, {
      deadline: bitDeadline,
      deadlineAllDay: false,
    });
    const store = makeStore([node], [bit]);

    await expect(
      store.createChunk({
        title: "Chunk",
        description: "",
        time: new Date(2026, 3, 12, 0, 0).getTime(),
        timeAllDay: true,
        order: 0,
        parentId: bId,
      }),
    ).rejects.toThrow("Chunk time cannot exceed parent bit deadline");
  });

  it("DeadlineConflictError carries conflictType and conflictingIds", async () => {
    const nId = crypto.randomUUID();
    const bId = crypto.randomUUID();
    const node = makeNode(nId, { deadline: PARENT_DEADLINE });
    const bit = makeBit(bId, nId);
    const store = makeStore([node], [bit]);

    let caught: DeadlineConflictError | null = null;
    try {
      await store.updateBit(bId, { deadline: CHILD_DEADLINE_OVER });
    } catch (e) {
      caught = e as DeadlineConflictError;
    }

    expect(caught).not.toBeNull();
    expect(caught!.conflictType).toBe("child_exceeds_parent");
    expect(caught!.conflictingIds).toContain(bId);
  });

  it("getChildDeadlineConflicts returns bits whose deadlines exceed new node deadline", async () => {
    const nId = crypto.randomUUID();
    const bOkId = crypto.randomUUID();
    const bOverId = crypto.randomUUID();
    const node = makeNode(nId, { deadline: PARENT_DEADLINE });
    const bitOk = makeBit(bOkId, nId, { x: 0, y: 0, deadline: CHILD_DEADLINE_OK });
    const bitOver = makeBit(bOverId, nId, { x: 1, y: 0, deadline: CHILD_DEADLINE_OVER });
    const store = makeStore([node], [bitOk, bitOver]);

    const newShorterDeadline = BASE_TS + 4 * 86_400_000;
    const conflicts = await store.getChildDeadlineConflicts(nId, newShorterDeadline);

    expect(conflicts.map((b) => b.id)).toContain(bOkId);
    expect(conflicts.map((b) => b.id)).toContain(bOverId);
  });

  it("getChildDeadlineConflicts returns empty when no bits exceed new deadline", async () => {
    const nId = crypto.randomUUID();
    const bId = crypto.randomUUID();
    const node = makeNode(nId, { deadline: PARENT_DEADLINE });
    const bit = makeBit(bId, nId, { deadline: CHILD_DEADLINE_OK });
    const store = makeStore([node], [bit]);

    const conflicts = await store.getChildDeadlineConflicts(nId, BASE_TS + 6 * 86_400_000);
    expect(conflicts).toHaveLength(0);
  });
});
