import { describe, expect, it } from "vitest";
import { GRID_COLS, GRID_ROWS } from "@/lib/constants";
import type { Bit, Chunk, Node, ScratchBreakdown } from "@/lib/db/schema";
import { IndexedDBDataStore } from "@/lib/db/indexeddb";

type StoredRecord = { id: string };
type StoredSetting = { key: string; value: unknown };
type SystemRole = NonNullable<Node["systemRole"]>;

const SYSTEM_NODE_SEEDS: Record<SystemRole, Pick<Node, "title" | "icon" | "color">> = {
  inbox: {
    title: "Inbox",
    icon: "inbox",
    color: "hsl(221, 83%, 53%)",
  },
  archive_view: {
    title: "Archive",
    icon: "layers",
    color: "hsl(240, 4%, 46%)",
  },
};

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

function getSystemNodes(nodes: Node[], role: SystemRole): Node[] {
  return nodes.filter((node) => node.systemRole === role);
}

function expectSingleSystemNode(nodes: Node[], role: SystemRole): Node {
  const matches = getSystemNodes(nodes, role);
  expect(matches).toHaveLength(1);
  return matches[0];
}

function expectValidL0Coordinate(node: Node): void {
  expect(node.x).toBeGreaterThanOrEqual(0);
  expect(node.x).toBeLessThan(GRID_COLS);
  expect(node.y).toBeGreaterThanOrEqual(0);
  expect(node.y).toBeLessThan(GRID_ROWS);
}

function expectSeedFields(node: Node, role: SystemRole): void {
  expect(node).toMatchObject({
    ...SYSTEM_NODE_SEEDS[role],
    systemRole: role,
    level: 0,
    parentId: null,
    hiddenFromGrid: false,
    archivedAt: null,
    deletedAt: null,
    deadline: null,
    deadlineAllDay: false,
  });
  expectValidL0Coordinate(node);
}

function fillRootGrid(startId: number): Node[] {
  const nodes: Node[] = [];

  for (let y = 0; y < GRID_ROWS; y += 1) {
    for (let x = 0; x < GRID_COLS; x += 1) {
      nodes.push(createNode({
        id: testUuid(startId + nodes.length),
        title: `User ${x},${y}`,
        x,
        y,
      }));
    }
  }

  return nodes;
}

function activeVisibleRootNodes(nodes: Node[]): Node[] {
  return nodes.filter(
    (node) =>
      node.parentId === null &&
      node.deletedAt === null &&
      node.archivedAt === null &&
      !node.hiddenFromGrid,
  );
}

describe("system node seeding", () => {
  it("seeds exactly one Inbox and one Archive View in a fresh DB", async () => {
    const { database, store } = createStore();

    await store.ensureSystemNodes();

    const nodes = await database.nodes.toArray();
    expect(nodes).toHaveLength(2);
    expectSeedFields(expectSingleSystemNode(nodes, "inbox"), "inbox");
    expectSeedFields(expectSingleSystemNode(nodes, "archive_view"), "archive_view");
  });

  it("does not duplicate clean existing system nodes on re-run", async () => {
    const { database, store } = createStore();

    await store.ensureSystemNodes();
    await store.ensureSystemNodes();

    const nodes = await database.nodes.toArray();
    expect(getSystemNodes(nodes, "inbox")).toHaveLength(1);
    expect(getSystemNodes(nodes, "archive_view")).toHaveLength(1);
  });

  it("creates only Inbox when Archive View is already present", async () => {
    const archive = createNode({
      id: testUuid(1),
      title: "Custom Archive",
      color: "hsl(240, 4%, 46%)",
      icon: "archive",
      systemRole: "archive_view",
      x: 3,
      y: 2,
    });
    const { database, store } = createStore({ nodes: [archive] });

    await store.ensureSystemNodes();

    const nodes = await database.nodes.toArray();
    expectSingleSystemNode(nodes, "inbox");
    expect(expectSingleSystemNode(nodes, "archive_view")).toEqual(archive);
  });

  it("creates only Archive View when Inbox is already present", async () => {
    const inbox = createNode({
      id: testUuid(2),
      title: "Custom Inbox",
      color: "hsl(221, 83%, 53%)",
      icon: "tray",
      systemRole: "inbox",
      x: 4,
      y: 1,
    });
    const { database, store } = createStore({ nodes: [inbox] });

    await store.ensureSystemNodes();

    const nodes = await database.nodes.toArray();
    expect(expectSingleSystemNode(nodes, "inbox")).toEqual(inbox);
    expectSingleSystemNode(nodes, "archive_view");
  });

  it("seeds both missing roles with non-colliding L0 coordinates", async () => {
    const { database, store } = createStore();

    await store.ensureSystemNodes();

    const nodes = await database.nodes.toArray();
    const inbox = expectSingleSystemNode(nodes, "inbox");
    const archive = expectSingleSystemNode(nodes, "archive_view");
    expect(`${inbox.x},${inbox.y}`).not.toBe(`${archive.x},${archive.y}`);
  });

  it("does not disturb existing user L0 nodes", async () => {
    const userNode = createNode({
      id: testUuid(3),
      title: "User Node",
      x: 5,
      y: 4,
    });
    const { database, store } = createStore({ nodes: [userNode] });

    await store.ensureSystemNodes();

    expect(await database.nodes.get(userNode.id)).toEqual(userNode);
  });

  it("avoids coordinates occupied by existing user L0 nodes", async () => {
    const occupant = createNode({ id: testUuid(4), x: 0, y: 0 });
    const { database, store } = createStore({ nodes: [occupant] });

    await store.ensureSystemNodes();

    const nodes = await database.nodes.toArray();
    for (const role of ["inbox", "archive_view"] as const) {
      const systemNode = expectSingleSystemNode(nodes, role);
      expect(`${systemNode.x},${systemNode.y}`).not.toBe("0,0");
    }
  });

  it("updates occupancy between seeded roles", async () => {
    const occupant = createNode({ id: testUuid(5), x: 0, y: 0 });
    const { database, store } = createStore({ nodes: [occupant] });

    await store.ensureSystemNodes();

    const nodes = await database.nodes.toArray();
    const inbox = expectSingleSystemNode(nodes, "inbox");
    const archive = expectSingleSystemNode(nodes, "archive_view");
    expect(`${inbox.x},${inbox.y}`).not.toBe("0,0");
    expect(`${archive.x},${archive.y}`).not.toBe("0,0");
    expect(`${inbox.x},${inbox.y}`).not.toBe(`${archive.x},${archive.y}`);
  });

  it("preserves custom fields and hiddenFromGrid on existing system nodes", async () => {
    const inbox = createNode({
      id: testUuid(6),
      title: "My Work",
      icon: "star",
      color: "hsl(0,0%,50%)",
      hiddenFromGrid: true,
      systemRole: "inbox",
      x: 7,
      y: 3,
    });
    const { database, store } = createStore({ nodes: [inbox] });

    await store.ensureSystemNodes();

    const nodes = await database.nodes.toArray();
    const storedInbox = expectSingleSystemNode(nodes, "inbox");
    expect(storedInbox).toMatchObject({
      title: "My Work",
      icon: "star",
      color: "hsl(0,0%,50%)",
      hiddenFromGrid: true,
    });
  });

  it("throws GRID_FULL without writing when no cell is available for creation", async () => {
    const fullGrid = fillRootGrid(100);
    const { database, store } = createStore({ nodes: fullGrid });

    await expect(store.ensureSystemNodes()).rejects.toThrow(/GRID_FULL/);

    expect(await database.nodes.toArray()).toEqual(fullGrid);
  });

  it("normalizes deleted lifecycle drift without creating a duplicate", async () => {
    const deletedAt = 1_700_000_100_000;
    const inbox = createNode({
      id: testUuid(7),
      title: "My Work",
      icon: "star",
      color: "hsl(0,0%,50%)",
      systemRole: "inbox",
      deletedAt,
      x: 0,
      y: 0,
    });
    const { database, store } = createStore({ nodes: [inbox] });

    await store.ensureSystemNodes();

    const nodes = await database.nodes.toArray();
    const storedInbox = expectSingleSystemNode(nodes, "inbox");
    expect(storedInbox.id).toBe(inbox.id);
    expect(storedInbox.deletedAt).toBeNull();
    expect(storedInbox.archivedAt).toBeNull();
    expect(storedInbox.title).toBe("My Work");
    expect(storedInbox.icon).toBe("star");
    expect(storedInbox.color).toBe("hsl(0,0%,50%)");
  });

  it("normalizes partial archived lifecycle drift while leaving clean Inbox unchanged", async () => {
    const inbox = createNode({
      id: testUuid(8),
      systemRole: "inbox",
      x: 1,
      y: 0,
    });
    const archive = createNode({
      id: testUuid(9),
      systemRole: "archive_view",
      archivedAt: 1_700_000_100_000,
      x: 2,
      y: 0,
    });
    const { database, store } = createStore({ nodes: [inbox, archive] });

    await store.ensureSystemNodes();

    const nodes = await database.nodes.toArray();
    expect(expectSingleSystemNode(nodes, "inbox")).toEqual(inbox);
    const storedArchive = expectSingleSystemNode(nodes, "archive_view");
    expect(storedArchive.id).toBe(archive.id);
    expect(storedArchive.archivedAt).toBeNull();
    expect(storedArchive.deletedAt).toBeNull();
  });

  it("relocates a drifted system node when its previous cell is now occupied", async () => {
    const inbox = createNode({
      id: testUuid(10),
      systemRole: "inbox",
      deletedAt: 1_700_000_100_000,
      x: 0,
      y: 0,
    });
    const occupant = createNode({
      id: testUuid(11),
      title: "Occupant",
      x: 0,
      y: 0,
    });
    const { database, store } = createStore({ nodes: [inbox, occupant] });

    await store.ensureSystemNodes();

    const nodes = await database.nodes.toArray();
    const storedInbox = expectSingleSystemNode(nodes, "inbox");
    expect(storedInbox.id).toBe(inbox.id);
    expect(storedInbox.deletedAt).toBeNull();
    expect(storedInbox.archivedAt).toBeNull();
    expect(`${storedInbox.x},${storedInbox.y}`).not.toBe("0,0");

    const activeCoordinates = activeVisibleRootNodes(nodes).map((node) => `${node.x},${node.y}`);
    expect(new Set(activeCoordinates).size).toBe(activeCoordinates.length);
  });
});
