import { afterEach, describe, expect, it, vi } from "vitest";
import { TRASH_RETENTION_DAYS } from "@/lib/constants";
import type { Bit, Chunk, Node } from "@/lib/db/schema";
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

const NOW = new Date("2026-03-29T00:00:00.000Z").getTime();
const DAY = 86_400_000;

function makeNode(id: string, overrides: Partial<Node> = {}): Node {
  return {
    id,
    title: "Node",
    description: "",
    color: "hsl(210, 80%, 55%)",
    icon: "Folder",
    deadline: null,
    deadlineAllDay: false,
    mtime: NOW,
    createdAt: NOW,
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
    mtime: NOW,
    createdAt: NOW,
    parentId,
    x: 0,
    y: 0,
    deletedAt: null,
    ...overrides,
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

afterEach(() => {
  vi.useRealTimers();
});

describe("trash cleanup", () => {
  it("cleanupExpiredTrash permanently deletes items older than the retention window", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    const expirationThreshold = NOW - TRASH_RETENTION_DAYS * DAY;
    const expiredNode = makeNode("expired-node", {
      deletedAt: expirationThreshold - DAY,
    });
    const expiredNodeBit = makeBit("expired-node-bit", expiredNode.id, {
      deletedAt: expirationThreshold - DAY,
    });
    const expiredNodeChunk = makeChunk("expired-node-chunk", expiredNodeBit.id);

    const activeParent = makeNode("active-parent");
    const expiredStandaloneBit = makeBit("expired-standalone-bit", activeParent.id, {
      deletedAt: expirationThreshold - DAY,
      x: 1,
    });
    const expiredStandaloneChunk = makeChunk("expired-standalone-chunk", expiredStandaloneBit.id);

    const freshNode = makeNode("fresh-node", {
      deletedAt: expirationThreshold + DAY,
      x: 2,
    });
    const freshBit = makeBit("fresh-bit", activeParent.id, {
      deletedAt: expirationThreshold + DAY,
      x: 3,
    });
    const freshChunk = makeChunk("fresh-chunk", freshBit.id);

    const { store, tables } = makeStore({
      nodes: [expiredNode, activeParent, freshNode],
      bits: [expiredNodeBit, expiredStandaloneBit, freshBit],
      chunks: [expiredNodeChunk, expiredStandaloneChunk, freshChunk],
    });

    await store.cleanupExpiredTrash();

    const remainingNodes = await tables.nodes.toArray();
    const remainingBits = await tables.bits.toArray();
    const remainingChunks = await tables.chunks.toArray();

    expect(remainingNodes.map((node) => node.id).sort()).toEqual(
      [activeParent.id, freshNode.id].sort(),
    );
    expect(remainingBits.map((bit) => bit.id).sort()).toEqual(
      [freshBit.id].sort(),
    );
    expect(remainingChunks.map((chunk) => chunk.id)).toEqual([freshChunk.id]);
  });
});
