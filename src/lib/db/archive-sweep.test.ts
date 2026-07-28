import { describe, expect, it } from "vitest";
import type { Bit, Chunk, Node, ScratchBreakdown } from "@/lib/db/schema";
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

function testUuid(index: number): string {
  return `00000000-0000-4000-8000-${index.toString().padStart(12, "0")}`;
}

describe("archive sweep — active-item queries", () => {
  it("getNodes excludes archived nodes", async () => {
    const parentId = testUuid(1);
    const activeNode = createNode({ id: testUuid(2), parentId, archivedAt: null });
    const archivedNode = createNode({ id: testUuid(3), parentId, archivedAt: Date.now(), x: 1 });
    const { store } = createStore({ nodes: [activeNode, archivedNode] });

    const nodes = await store.getNodes(parentId);

    expect(nodes.map((node) => node.id)).toEqual([activeNode.id]);
  });

  it("getBits excludes archived bits", async () => {
    const parentId = testUuid(4);
    const activeBit = createBit({ id: testUuid(5), parentId, archivedAt: null });
    const archivedBit = createBit({ id: testUuid(6), parentId, archivedAt: Date.now(), x: 1 });
    const { store } = createStore({ bits: [activeBit, archivedBit] });

    const bits = await store.getBits(parentId);

    expect(bits.map((bit) => bit.id)).toEqual([activeBit.id]);
  });

  it("getAllActiveNodes excludes archived nodes", async () => {
    const activeNode = createNode({ id: testUuid(7), archivedAt: null });
    const archivedNode = createNode({ id: testUuid(8), archivedAt: Date.now(), x: 1 });
    const { store } = createStore({ nodes: [activeNode, archivedNode] });

    const nodes = await store.getAllActiveNodes();

    expect(nodes.map((node) => node.id)).toEqual([activeNode.id]);
  });

  it("getAllActiveBits excludes archived bits", async () => {
    const activeBit = createBit({ id: testUuid(9), archivedAt: null });
    const archivedBit = createBit({ id: testUuid(10), archivedAt: Date.now(), x: 1 });
    const { store } = createStore({ bits: [activeBit, archivedBit] });

    const bits = await store.getAllActiveBits();

    expect(bits.map((bit) => bit.id)).toEqual([activeBit.id]);
  });

  it("getActiveGridContents excludes archived items", async () => {
    const parentId = testUuid(11);
    const activeNode = createNode({ id: testUuid(12), parentId, archivedAt: null });
    const archivedNode = createNode({ id: testUuid(13), parentId, archivedAt: Date.now(), x: 1 });
    const activeBit = createBit({ id: testUuid(14), parentId, archivedAt: null, x: 2 });
    const archivedBit = createBit({ id: testUuid(15), parentId, archivedAt: Date.now(), x: 3 });
    const { store } = createStore({
      nodes: [activeNode, archivedNode],
      bits: [activeBit, archivedBit],
    });

    const contents = await store.getActiveGridContents(parentId);

    expect(contents.nodes.map((node) => node.id)).toEqual([activeNode.id]);
    expect(contents.bits.map((bit) => bit.id)).toEqual([activeBit.id]);
  });

  it("getActiveGridContents(null) excludes hiddenFromGrid nodes; getNodes(null) DOES include them", async () => {
    const visibleNode = createNode({
      id: testUuid(16),
      parentId: null,
      archivedAt: null,
      hiddenFromGrid: false,
    });
    const hiddenNode = createNode({
      id: testUuid(17),
      parentId: null,
      archivedAt: null,
      hiddenFromGrid: true,
      x: 1,
    });
    const { store } = createStore({ nodes: [visibleNode, hiddenNode] });

    const contents = await store.getActiveGridContents(null);
    const nodes = await store.getNodes(null);

    expect(contents.nodes.map((node) => node.id)).toEqual([visibleNode.id]);
    expect(nodes.map((node) => node.id)).toEqual([visibleNode.id, hiddenNode.id]);
  });

  it("getCalendarItems excludes archived bits", async () => {
    const deadline = Date.now();
    const activeBit = createBit({ id: testUuid(18), archivedAt: null, deadline });
    const archivedBit = createBit({
      id: testUuid(19),
      archivedAt: Date.now(),
      deadline,
      x: 1,
    });
    const { store } = createStore({ bits: [activeBit, archivedBit] });

    const calendarItems = await store.getCalendarItems();

    expect(calendarItems.bits.map((bit) => bit.id)).toEqual([activeBit.id]);
  });

  it("getCalendarItems excludes chunks whose parent bit is archived", async () => {
    const archivedBit = createBit({ id: testUuid(20), archivedAt: Date.now() });
    const chunk: Chunk = {
      id: testUuid(21),
      title: "Chunk",
      description: "",
      time: Date.now(),
      timeAllDay: false,
      status: "incomplete",
      order: 0,
      parentId: archivedBit.id,
    };
    const { store } = createStore({ bits: [archivedBit], chunks: [chunk] });

    const calendarItems = await store.getCalendarItems();

    expect(calendarItems.chunks).toEqual([]);
  });

  it("searchAll excludes archived items", async () => {
    const activeNode = createNode({ id: testUuid(22), title: "find-me-node" });
    const archivedNode = createNode({
      id: testUuid(23),
      title: "find-me-node",
      archivedAt: Date.now(),
      x: 1,
    });
    const activeBit = createBit({ id: testUuid(24), title: "find-me-bit" });
    const archivedBit = createBit({
      id: testUuid(25),
      title: "find-me-bit",
      archivedAt: Date.now(),
      x: 1,
    });
    const { store } = createStore({
      nodes: [activeNode, archivedNode],
      bits: [activeBit, archivedBit],
    });

    const nodeResults = await store.searchAll("find-me-node");
    const bitResults = await store.searchAll("find-me-bit");

    expect(nodeResults.map((result) => result.item.id)).toEqual([activeNode.id]);
    expect(bitResults.map((result) => result.item.id)).toEqual([activeBit.id]);
  });

  it("getGridOccupancy excludes archived items", async () => {
    const parentId = testUuid(26);
    const activeNode = createNode({ id: testUuid(27), parentId, x: 0, y: 0 });
    const archivedNode = createNode({
      id: testUuid(28),
      parentId,
      archivedAt: Date.now(),
      x: 1,
      y: 1,
    });
    const activeBit = createBit({ id: testUuid(29), parentId, x: 2, y: 2 });
    const archivedBit = createBit({
      id: testUuid(30),
      parentId,
      archivedAt: Date.now(),
      x: 3,
      y: 3,
    });
    const { store } = createStore({
      nodes: [activeNode, archivedNode],
      bits: [activeBit, archivedBit],
    });

    const occupancy = await store.getGridOccupancy(parentId);

    expect(occupancy.has("0,0")).toBe(true);
    expect(occupancy.has("2,2")).toBe(true);
    expect(occupancy.has("1,1")).toBe(false);
    expect(occupancy.has("3,3")).toBe(false);
  });

  it("getGridOccupancy(null) excludes hiddenFromGrid root nodes", async () => {
    const visibleNode = createNode({
      id: testUuid(31),
      parentId: null,
      hiddenFromGrid: false,
      archivedAt: null,
      x: 0,
      y: 0,
    });
    const hiddenNode = createNode({
      id: testUuid(32),
      parentId: null,
      hiddenFromGrid: true,
      archivedAt: null,
      x: 1,
      y: 1,
    });
    const { store } = createStore({ nodes: [visibleNode, hiddenNode] });

    const occupancy = await store.getGridOccupancy(null);

    expect(occupancy.has("0,0")).toBe(true);
    expect(occupancy.has("1,1")).toBe(false);
  });

  it("createNode succeeds at a cell occupied only by an archived node", async () => {
    const archivedNode = createNode({
      id: testUuid(33),
      parentId: null,
      archivedAt: Date.now(),
      x: 0,
      y: 0,
    });
    const { store } = createStore({ nodes: [archivedNode] });

    const newNode = await store.createNode({
      title: "New",
      parentId: null,
      color: "hsl(210, 80%, 55%)",
      icon: "folder",
      level: 0,
      x: 0,
      y: 0,
      deadline: null,
      deadlineAllDay: false,
    });
    const nodes = await store.getNodes(null);

    expect(nodes.map((node) => node.id)).toContain(newNode.id);
  });

  it("createNode succeeds at a cell occupied only by a hiddenFromGrid root node", async () => {
    const hiddenNode = createNode({
      id: testUuid(34),
      parentId: null,
      hiddenFromGrid: true,
      archivedAt: null,
      x: 0,
      y: 0,
    });
    const { store } = createStore({ nodes: [hiddenNode] });

    const newNode = await store.createNode({
      title: "New",
      parentId: null,
      color: "hsl(210, 80%, 55%)",
      icon: "folder",
      level: 0,
      x: 0,
      y: 0,
      deadline: null,
      deadlineAllDay: false,
    });
    const nodes = await store.getNodes(null);

    expect(nodes.map((node) => node.id)).toContain(newNode.id);
  });
});
