import Dexie, { type DexieOptions, type Table } from "dexie";
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { describe, expect, it } from "vitest";
import { GridDODatabase } from "@/lib/db/indexeddb";

class GridDOV2 extends Dexie {
  nodes!: Table<Record<string, unknown>, string>;
  bits!: Table<Record<string, unknown>, string>;
  chunks!: Table<Record<string, unknown>, string>;
  settings!: Table<Record<string, unknown>, string>;

  constructor(options: DexieOptions) {
    super("GridDO", options);
    this.version(1).stores({
      nodes: "id,parentId,deletedAt,[parentId+deletedAt],level",
      bits: "id,parentId,deletedAt,[parentId+deletedAt],status,deadline,[parentId+status]",
      chunks: "id,parentId,[parentId+order],time,status",
    });
    this.version(2).stores({ settings: "key" });
  }
}

const v2NodeMissing = {
  id: "node-missing",
  title: "Node Missing Fields",
  color: "hsl(210, 80%, 55%)",
  icon: "folder",
  deadline: null,
  deadlineAllDay: false,
  mtime: 1700000000000,
  createdAt: 1700000000000,
  parentId: null,
  level: 0,
  x: 0,
  y: 0,
  deletedAt: null,
};

const v2BitMissing = {
  id: "bit-missing",
  title: "Bit Missing Fields",
  description: "",
  icon: "circle",
  deadline: null,
  deadlineAllDay: false,
  priority: null,
  status: "active",
  mtime: 1700000000000,
  createdAt: 1700000000000,
  parentId: "node-missing",
  x: 0,
  y: 0,
  deletedAt: null,
};

describe("GridDO IndexedDB schema version 3 upgrade", () => {
  it("backfills undefined v3 fields on nodes", async () => {
    const indexedDB = new IDBFactory();
    const options: DexieOptions = { indexedDB, IDBKeyRange };

    const seederDb = new GridDOV2(options);
    await seederDb.nodes.put(v2NodeMissing);
    seederDb.close();

    const db = new GridDODatabase(options);
    await db.open();

    const node = await db.nodes.get("node-missing");

    expect(node?.archivedAt).toBeNull();
    expect(node?.systemRole).toBeNull();
    expect(node?.hiddenFromGrid).toBe(false);

    db.close();
  });

  it("backfills undefined archivedAt on bits", async () => {
    const indexedDB = new IDBFactory();
    const options: DexieOptions = { indexedDB, IDBKeyRange };

    const seederDb = new GridDOV2(options);
    await seederDb.bits.put(v2BitMissing);
    seederDb.close();

    const db = new GridDODatabase(options);
    await db.open();

    const bit = await db.bits.get("bit-missing");

    expect(bit?.archivedAt).toBeNull();

    db.close();
  });

  it("does not overwrite existing v3 field values during backfill", async () => {
    const indexedDB = new IDBFactory();
    const options: DexieOptions = { indexedDB, IDBKeyRange };
    const archivedAt = 1700000009000;

    const seederDb = new GridDOV2(options);
    await seederDb.nodes.put({
      ...v2NodeMissing,
      id: "node-archived",
      archivedAt,
      systemRole: "inbox",
      hiddenFromGrid: true,
    });
    await seederDb.bits.put({
      ...v2BitMissing,
      id: "bit-archived",
      parentId: "node-archived",
      archivedAt,
    });
    seederDb.close();

    const db = new GridDODatabase(options);
    await db.open();

    const node = await db.nodes.get("node-archived");
    const bit = await db.bits.get("bit-archived");

    expect(node?.archivedAt).toBe(archivedAt);
    expect(node?.systemRole).toBe("inbox");
    expect(node?.hiddenFromGrid).toBe(true);
    expect(bit?.archivedAt).toBe(archivedAt);

    db.close();
  });

  it("creates the scratchBreakdowns store", async () => {
    const indexedDB = new IDBFactory();
    const options: DexieOptions = { indexedDB, IDBKeyRange };

    const seederDb = new GridDOV2(options);
    await seederDb.open();
    seederDb.close();

    const db = new GridDODatabase(options);
    await db.open();

    const rows = await db.scratchBreakdowns.toArray();

    expect(rows).toEqual([]);

    db.close();
  });
});
