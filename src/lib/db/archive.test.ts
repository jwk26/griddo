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

function expectRecord<T>(record: T | undefined): T {
  expect(record).toBeDefined();
  return record as T;
}

function testUuid(index: number): string {
  return `00000000-0000-4000-8000-${index.toString().padStart(12, "0")}`;
}

describe("IndexedDBDataStore archive lifecycle", () => {
  it("archives a node with one shared timestamp across descendant nodes and bits", async () => {
    const rootNode = createNode({ id: testUuid(1) });
    const childNode = createNode({ id: testUuid(2), parentId: rootNode.id, level: 1 });
    const bit1 = createBit({ id: testUuid(3), parentId: childNode.id });
    const bit2 = createBit({ id: testUuid(4), parentId: childNode.id });
    const { database, store } = createStore({
      nodes: [rootNode, childNode],
      bits: [bit1, bit2],
    });

    await store.archiveNode(rootNode.id);

    const archivedRoot = expectRecord(await database.nodes.get(rootNode.id));
    const archivedChild = expectRecord(await database.nodes.get(childNode.id));
    const archivedBit1 = expectRecord(await database.bits.get(bit1.id));
    const archivedBit2 = expectRecord(await database.bits.get(bit2.id));

    expect(archivedRoot.archivedAt).not.toBeNull();
    expect(archivedChild.archivedAt).toBe(archivedRoot.archivedAt);
    expect(archivedBit1.archivedAt).toBe(archivedRoot.archivedAt);
    expect(archivedBit2.archivedAt).toBe(archivedRoot.archivedAt);
    expect([
      archivedRoot.deletedAt,
      archivedChild.deletedAt,
      archivedBit1.deletedAt,
      archivedBit2.deletedAt,
    ]).toEqual([null, null, null, null]);
  });

  it("rejects archiving system nodes and leaves archivedAt unchanged", async () => {
    const inboxNode = createNode({ id: testUuid(5), systemRole: "inbox" });
    const { database, store } = createStore({ nodes: [inboxNode] });

    await expect(store.archiveNode(inboxNode.id)).rejects.toThrow();

    const unchangedNode = expectRecord(await database.nodes.get(inboxNode.id));
    expect(unchangedNode.archivedAt).toBeNull();
  });

  it("archives only the target bit", async () => {
    const node = createNode({ id: testUuid(6) });
    const bit1 = createBit({ id: testUuid(7), parentId: node.id });
    const bit2 = createBit({ id: testUuid(8), parentId: node.id });
    const { database, store } = createStore({ nodes: [node], bits: [bit1, bit2] });

    await store.archiveBit(bit1.id);

    const archivedBit = expectRecord(await database.bits.get(bit1.id));
    const untouchedBit = expectRecord(await database.bits.get(bit2.id));
    const untouchedNode = expectRecord(await database.nodes.get(node.id));

    expect(archivedBit.archivedAt).not.toBeNull();
    expect(untouchedBit.archivedAt).toBeNull();
    expect(untouchedNode.archivedAt).toBeNull();
    expect(archivedBit.deletedAt).toBeNull();
  });

  it("unarchives a node with same-window descendants and keeps independently archived descendants archived", async () => {
    const archiveTimestamp = 1_700_000_100_000;
    const independentArchiveTimestamp = archiveTimestamp - 10_000;
    const rootNode = createNode({ id: testUuid(9), archivedAt: archiveTimestamp });
    const childNode = createNode({
      id: testUuid(10),
      parentId: rootNode.id,
      level: 1,
      archivedAt: archiveTimestamp,
    });
    const independentNode = createNode({
      id: testUuid(11),
      parentId: childNode.id,
      level: 2,
      archivedAt: independentArchiveTimestamp,
    });
    const bit1 = createBit({
      id: testUuid(12),
      parentId: childNode.id,
      archivedAt: archiveTimestamp,
    });
    const bit2 = createBit({
      id: testUuid(13),
      parentId: independentNode.id,
      archivedAt: independentArchiveTimestamp,
    });
    const { database, store } = createStore({
      nodes: [rootNode, childNode, independentNode],
      bits: [bit1, bit2],
    });

    await store.unarchiveNode(rootNode.id);

    const restoredRoot = expectRecord(await database.nodes.get(rootNode.id));
    const restoredChild = expectRecord(await database.nodes.get(childNode.id));
    const stillArchivedNode = expectRecord(await database.nodes.get(independentNode.id));
    const restoredBit = expectRecord(await database.bits.get(bit1.id));
    const stillArchivedBit = expectRecord(await database.bits.get(bit2.id));

    expect(restoredRoot.archivedAt).toBeNull();
    expect(restoredChild.archivedAt).toBeNull();
    expect(stillArchivedNode.archivedAt).toBe(independentArchiveTimestamp);
    expect(restoredBit.archivedAt).toBeNull();
    expect(stillArchivedBit.archivedAt).toBe(independentArchiveTimestamp);
    expect([
      restoredRoot.deletedAt,
      restoredChild.deletedAt,
      stillArchivedNode.deletedAt,
      restoredBit.deletedAt,
      stillArchivedBit.deletedAt,
    ]).toEqual([
      rootNode.deletedAt,
      childNode.deletedAt,
      independentNode.deletedAt,
      bit1.deletedAt,
      bit2.deletedAt,
    ]);
  });

  it("unarchives an archived bit and its archived parent chain", async () => {
    const archiveTimestamp = 1_700_000_100_000;
    const parentNode = createNode({ id: testUuid(14), archivedAt: archiveTimestamp });
    const bit = createBit({
      id: testUuid(15),
      parentId: parentNode.id,
      archivedAt: archiveTimestamp,
    });
    const { database, store } = createStore({ nodes: [parentNode], bits: [bit] });

    await store.unarchiveBit(bit.id);

    const restoredParent = expectRecord(await database.nodes.get(parentNode.id));
    const restoredBit = expectRecord(await database.bits.get(bit.id));

    expect(restoredParent.archivedAt).toBeNull();
    expect(restoredBit.archivedAt).toBeNull();
    expect(restoredParent.deletedAt).toBe(parentNode.deletedAt);
    expect(restoredBit.deletedAt).toBe(bit.deletedAt);
  });

  it("does not set deletedAt when archiving nodes or bits", async () => {
    const node = createNode({ id: testUuid(16), deletedAt: null });
    const nodeStore = createStore({ nodes: [node] });

    await nodeStore.store.archiveNode(node.id);

    expect(expectRecord(await nodeStore.database.nodes.get(node.id)).deletedAt).toBeNull();

    const bit = createBit({ id: testUuid(17), parentId: testUuid(18), deletedAt: null });
    const bitStore = createStore({ bits: [bit] });

    await bitStore.store.archiveBit(bit.id);

    expect(expectRecord(await bitStore.database.bits.get(bit.id)).deletedAt).toBeNull();
  });

  it("does not restore a Bit whose parent Node stays archived (outside restore window)", async () => {
    // Regression: the Bit is inside the ±5s window (would otherwise be restored),
    // but its parent Node is outside the window and must stay archived. The Bit
    // must NOT be un-archived, or we get an archived-Node-with-active-Bit state.
    const archiveTimestamp = 1_700_000_100_000;
    const outsideWindowTimestamp = archiveTimestamp - 10_000;

    const rootNode = createNode({ id: testUuid(19), archivedAt: archiveTimestamp });
    const childNode = createNode({
      id: testUuid(20),
      parentId: rootNode.id,
      level: 1,
      archivedAt: outsideWindowTimestamp, // outside window → stays archived
    });
    const childBit = createBit({
      id: testUuid(21),
      parentId: childNode.id,
      archivedAt: archiveTimestamp, // inside window, but parent stays archived
    });
    const { database, store } = createStore({
      nodes: [rootNode, childNode],
      bits: [childBit],
    });

    await store.unarchiveNode(rootNode.id);

    const restoredRoot = expectRecord(await database.nodes.get(rootNode.id));
    const stillArchivedChild = expectRecord(await database.nodes.get(childNode.id));
    const stillArchivedBit = expectRecord(await database.bits.get(childBit.id));

    expect(restoredRoot.archivedAt).toBeNull();
    expect(stillArchivedChild.archivedAt).toBe(outsideWindowTimestamp);
    expect(stillArchivedBit.archivedAt).toBe(archiveTimestamp);
  });
});
