import { afterEach, describe, expect, it, vi } from "vitest";
import { GRID_COLS, GRID_ROWS } from "@/lib/constants";
import type { Bit, Node } from "@/lib/db/schema";
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
const CASCADE_TS = BASE_TS + 20_000;

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

function makeStore(seed: { nodes?: Node[]; bits?: Bit[] }) {
  return new IndexedDBDataStore({
    nodes: new FakeTable(seed.nodes),
    bits: new FakeTable(seed.bits),
    chunks: new FakeTable([]),
  });
}

afterEach(() => {
  vi.useRealTimers();
});

describe("cascade restore", () => {
  it("restoreNode restores the parent chain and uses BFS fallback for occupied cells", async () => {
    const activeOccupant = makeNode("00000000-0000-4000-8000-000000000001", { x: 0, y: 0 });
    const trashedParent = makeNode("00000000-0000-4000-8000-000000000002", {
      deletedAt: CASCADE_TS,
      x: 0,
      y: 0,
    });
    const trashedChild = makeNode("00000000-0000-4000-8000-000000000003", {
      parentId: trashedParent.id,
      level: 1,
      deletedAt: CASCADE_TS,
      x: 0,
      y: 0,
    });
    const activeBitInChildGrid = makeBit("00000000-0000-4000-8000-000000000004", trashedChild.id, { x: 0, y: 0 });
    const trashedBit = makeBit("00000000-0000-4000-8000-000000000005", trashedChild.id, {
      deletedAt: CASCADE_TS,
      x: 0,
      y: 0,
    });
    const independentlyDeletedDescendant = makeNode("00000000-0000-4000-8000-000000000006", {
      parentId: trashedChild.id,
      level: 2,
      deletedAt: CASCADE_TS + 10_000,
      x: 1,
      y: 0,
    });
    const store = makeStore({
      nodes: [
        activeOccupant,
        trashedParent,
        trashedChild,
        independentlyDeletedDescendant,
      ],
      bits: [activeBitInChildGrid, trashedBit],
    });

    await store.restoreNode(trashedChild.id);

    const restoredParent = await store.getNode(trashedParent.id);
    const restoredChild = await store.getNode(trashedChild.id);
    const restoredBit = await store.getBit(trashedBit.id);
    const untouchedDescendant = await store.getNode(independentlyDeletedDescendant.id);

    expect(restoredParent?.deletedAt).toBeNull();
    expect(restoredParent?.x).toBe(1);
    expect(restoredParent?.y).toBe(0);
    expect(restoredChild?.deletedAt).toBeNull();
    expect(restoredBit?.deletedAt).toBeNull();
    expect(restoredBit?.x).toBe(1);
    expect(restoredBit?.y).toBe(0);
    expect(untouchedDescendant?.deletedAt).toBe(CASCADE_TS + 10_000);
  });

  it("restoreBit auto-restores its trashed parent chain", async () => {
    const activeOccupant = makeNode("00000000-0000-4000-8000-000000000011", { x: 0, y: 0 });
    const trashedParent = makeNode("00000000-0000-4000-8000-000000000012", {
      deletedAt: CASCADE_TS,
      x: 0,
      y: 0,
    });
    const trashedBit = makeBit("00000000-0000-4000-8000-000000000013", trashedParent.id, {
      deletedAt: CASCADE_TS,
      x: 0,
      y: 0,
    });
    const store = makeStore({
      nodes: [activeOccupant, trashedParent],
      bits: [trashedBit],
    });

    await store.restoreBit(trashedBit.id);

    const restoredParent = await store.getNode(trashedParent.id);
    const restoredBit = await store.getBit(trashedBit.id);

    expect(restoredParent?.deletedAt).toBeNull();
    expect(restoredParent?.x).toBe(1);
    expect(restoredBit?.deletedAt).toBeNull();
  });

  it("restoreNode throws GRID_FULL when no cell is available in the target grid", async () => {
    const occupiedNodes = Array.from({ length: GRID_COLS * GRID_ROWS }, (_, index) =>
      makeNode(`00000000-0000-4000-8000-${String(index + 100).padStart(12, "0")}`, {
        x: index % GRID_COLS,
        y: Math.floor(index / GRID_COLS),
      }),
    );
    const trashedNode = makeNode("00000000-0000-4000-8000-000000000999", {
      deletedAt: CASCADE_TS,
      x: 0,
      y: 0,
    });
    const store = makeStore({
      nodes: [...occupiedNodes, trashedNode],
      bits: [],
    });

    await expect(store.restoreNode(trashedNode.id)).rejects.toThrow("GRID_FULL");
  });
});
