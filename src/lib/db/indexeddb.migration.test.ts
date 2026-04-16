import { describe, expect, it } from "vitest";
import type { Bit, Chunk, Node } from "@/lib/db/schema";
import { IndexedDBDataStore } from "@/lib/db/indexeddb";
import { GRID_COLS, GRID_ROWS } from "@/lib/constants";

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
  };
}

function createStore(seed?: {
  nodes?: Node[];
  bits?: Bit[];
  chunks?: Chunk[];
  settings?: StoredSetting[];
}) {
  const database = {
    nodes: new FakeTable<Node>(seed?.nodes),
    bits: new FakeTable<Bit>(seed?.bits),
    chunks: new FakeTable<Chunk>(seed?.chunks),
    settings: new FakeSettingsTable(seed?.settings),
  };

  return {
    database,
    store: new IndexedDBDataStore(database),
  };
}

describe("IndexedDBDataStore breadcrumb zone migration", () => {
  it("writes the marker and leaves items untouched when there is no overlap", async () => {
    const parentId = "parent-1";
    const node = createNode({ id: "node-1", parentId, level: 1, x: 4, y: 4 });
    const bit = createBit({ id: "bit-1", parentId, x: 5, y: 4 });
    const { database, store } = createStore({ nodes: [node], bits: [bit] });

    const result = await store.runBreadcrumbZoneMigration(parentId, new Set(["0,0", "1,0"]));

    expect(result).toEqual({ relocated: 0 });
    expect(await database.nodes.get(node.id)).toMatchObject({ x: 4, y: 4 });
    expect(await database.bits.get(bit.id)).toMatchObject({ x: 5, y: 4 });
    expect(await database.settings.get(`bzMigration_${parentId}`)).toEqual({
      key: `bzMigration_${parentId}`,
      value: true,
    });
  });

  it("relocates overlapping items outside the blocked zone and writes the marker", async () => {
    const parentId = "parent-1";
    const overlappingNode = createNode({
      id: "node-overlap",
      title: "Node overlap",
      parentId,
      level: 1,
      x: 0,
      y: 0,
    });
    const overlappingBit = createBit({
      id: "bit-overlap",
      title: "Bit overlap",
      parentId,
      x: 1,
      y: 0,
    });
    const occupant = createNode({
      id: "node-occupant",
      title: "Occupant",
      parentId,
      level: 1,
      x: 0,
      y: 1,
    });
    const { database, store } = createStore({
      nodes: [overlappingNode, occupant],
      bits: [overlappingBit],
    });
    const blockedCells = new Set(["0,0", "1,0"]);

    const result = await store.runBreadcrumbZoneMigration(parentId, blockedCells);

    expect(result).toEqual({ relocated: 2 });
    expect(await database.nodes.get(overlappingNode.id)).toMatchObject({ x: 1, y: 1 });
    expect(await database.bits.get(overlappingBit.id)).toMatchObject({ x: 2, y: 0 });
    expect(blockedCells.has("1,1")).toBe(false);
    expect(blockedCells.has("2,0")).toBe(false);
    expect(await database.settings.get(`bzMigration_${parentId}`)).toEqual({
      key: `bzMigration_${parentId}`,
      value: true,
    });
  });

  it("runs only once per parent after the marker is written", async () => {
    const parentId = "parent-1";
    const overlappingNode = createNode({
      id: "node-overlap",
      parentId,
      level: 1,
      x: 0,
      y: 0,
    });
    const { database, store } = createStore({ nodes: [overlappingNode] });
    const blockedCells = new Set(["0,0"]);

    const first = await store.runBreadcrumbZoneMigration(parentId, blockedCells);
    const afterFirst = await database.nodes.get(overlappingNode.id);
    const second = await store.runBreadcrumbZoneMigration(parentId, blockedCells);
    const afterSecond = await database.nodes.get(overlappingNode.id);

    expect(first).toEqual({ relocated: 1 });
    expect(second).toEqual({ relocated: 0 });
    expect(afterFirst).toEqual(afterSecond);
    expect(await database.settings.get(`bzMigration_${parentId}`)).toEqual({
      key: `bzMigration_${parentId}`,
      value: true,
    });
  });

  it("aborts without writes when no legal destination exists outside the blocked zone", async () => {
    const parentId = "parent-1";
    const overlappingNode = createNode({
      id: "node-overlap",
      parentId,
      level: 1,
      x: 0,
      y: 0,
    });
    const occupiedNodes: Node[] = [];

    for (let y = 0; y < GRID_ROWS; y += 1) {
      for (let x = 0; x < GRID_COLS; x += 1) {
        if (x === 0 && y === 0) {
          continue;
        }

        occupiedNodes.push(createNode({
          id: `occupant-${x}-${y}`,
          title: `Occupant ${x},${y}`,
          parentId,
          level: 1,
          x,
          y,
        }));
      }
    }

    const { database, store } = createStore({
      nodes: [overlappingNode, ...occupiedNodes],
    });

    const result = await store.runBreadcrumbZoneMigration(parentId, new Set(["0,0"]));

    expect(result).toEqual({ relocated: 0 });
    expect(await database.nodes.get(overlappingNode.id)).toMatchObject({ x: 0, y: 0 });
    expect(await database.settings.get(`bzMigration_${parentId}`)).toBeUndefined();
  });

  it("processes nodes and bits in one row-major queue across both types", async () => {
    const parentId = "parent-1";
    const bit = createBit({
      id: "bit-overlap",
      title: "Earlier bit",
      parentId,
      x: 0,
      y: 1,
    });
    const node = createNode({
      id: "node-overlap",
      title: "Later node",
      parentId,
      level: 1,
      x: 1,
      y: 1,
    });
    const occupied = [
      createNode({ id: "occ-0-0", parentId, level: 1, x: 0, y: 0 }),
      createNode({ id: "occ-0-2", parentId, level: 1, x: 0, y: 2 }),
    ];
    const { database, store } = createStore({
      nodes: [node, ...occupied],
      bits: [bit],
    });

    const result = await store.runBreadcrumbZoneMigration(
      parentId,
      new Set(["0,1", "1,1"]),
    );

    expect(result).toEqual({ relocated: 2 });
    expect(await database.bits.get(bit.id)).toMatchObject({ x: 1, y: 0 });
    expect(await database.nodes.get(node.id)).toMatchObject({ x: 2, y: 1 });
  });

  it("uses the root marker key when parentId is null", async () => {
    const rootNode = createNode({ id: "root-node", parentId: null, level: 0, x: 4, y: 4 });
    const { database, store } = createStore({ nodes: [rootNode] });

    const result = await store.runBreadcrumbZoneMigration(null, new Set(["0,0"]));

    expect(result).toEqual({ relocated: 0 });
    expect(await database.settings.get("bzMigration___root__")).toEqual({
      key: "bzMigration___root__",
      value: true,
    });
  });
});
