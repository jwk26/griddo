import Dexie, { type DexieOptions, type Table } from "dexie";
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { describe, expect, it } from "vitest";
import { GridDODatabase } from "@/lib/db/indexeddb";

const UUID = {
  inbox: "00000000-0000-4000-8000-000000000100",
  scratch: "00000000-0000-4000-8000-000000000101",
  source: "00000000-0000-4000-8000-000000000102",
  candidateA: "00000000-0000-4000-8000-000000000103",
  candidateB: "00000000-0000-4000-8000-000000000104",
  auditA: "00000000-0000-4000-8000-000000000105",
  auditB: "00000000-0000-4000-8000-000000000106",
  preservedBit: "00000000-0000-4000-8000-000000000108",
  preservedBreakdown: "00000000-0000-4000-8000-000000000109",
} as const;

type LegacyVersion = 1 | 2 | 3;

class LegacyGridDO extends Dexie {
  nodes!: Table<Record<string, unknown>, string>;
  bits!: Table<Record<string, unknown>, string>;
  chunks!: Table<Record<string, unknown>, string>;
  settings!: Table<Record<string, unknown>, string>;
  scratchBreakdowns!: Table<Record<string, unknown>, string>;

  constructor(version: LegacyVersion, options: DexieOptions) {
    super("GridDO", options);
    this.version(1).stores({
      nodes: "id,parentId,deletedAt,[parentId+deletedAt],level",
      bits: "id,parentId,deletedAt,[parentId+deletedAt],status,deadline,[parentId+status]",
      chunks: "id,parentId,[parentId+order],time,status",
    });
    if (version >= 2) this.version(2).stores({ settings: "key" });
    if (version >= 3) {
      this.version(3).stores({
        nodes:
          "id,parentId,deletedAt,[parentId+deletedAt],level,systemRole,archivedAt,[parentId+deletedAt+archivedAt]",
        bits:
          "id,parentId,deletedAt,[parentId+deletedAt],status,deadline,[parentId+status],archivedAt,[parentId+deletedAt+archivedAt]",
        scratchBreakdowns: "id,scratchBitId,[scratchBitId+order]",
      });
    }
  }
}

const legacyInboxNode = {
  id: UUID.inbox,
  title: "Inbox",
  color: "hsl(221, 83%, 53%)",
  icon: "inbox",
  deadline: null,
  deadlineAllDay: false,
  mtime: 1_700_000_000_001,
  createdAt: 1_700_000_000_000,
  version: 7,
  parentId: null,
  level: 0,
  x: 0,
  y: 0,
  deletedAt: null,
  archivedAt: null,
  systemRole: "inbox",
  hiddenFromGrid: true,
  pastDeadlineDismissed: true,
  legacyMarker: "preserve-me",
};

const legacyScratchBit = {
  id: UUID.scratch,
  title: "Scratch",
  description: "legacy content",
  icon: "sticky-note",
  deadline: null,
  deadlineAllDay: false,
  priority: null,
  status: "active",
  mtime: 1_700_000_000_003,
  createdAt: 1_700_000_000_002,
  parentId: UUID.inbox,
  x: 1,
  y: 0,
  deletedAt: null,
  archivedAt: null,
};

const legacyChunk = {
  id: "00000000-0000-4000-8000-000000000107",
  title: "Chunk",
  description: "unchanged",
  time: null,
  timeAllDay: false,
  status: "incomplete",
  order: 0,
  parentId: UUID.scratch,
};

const legacyPreservedBit = {
  ...legacyScratchBit,
  id: UUID.preservedBit,
  title: "Preserved Scratch",
  x: 2,
  version: 9,
  pastDeadlineDismissed: true,
  legacyBitMarker: "preserve-me-too",
};

const legacyBreakdown = {
  id: UUID.source,
  scratchBitId: UUID.scratch,
  content: "Break this down",
  order: 3,
  createdAt: 1_700_000_000_004,
  consumedAt: null,
};

const legacyPreservedBreakdown = {
  ...legacyBreakdown,
  id: UUID.preservedBreakdown,
  scratchBitId: UUID.preservedBit,
  order: 4,
  version: 11,
  legacyBreakdownMarker: "preserve-me-three",
};

async function seedLegacyDatabase(version: LegacyVersion, options: DexieOptions): Promise<void> {
  const db = new LegacyGridDO(version, options);
  await db.open();
  await db.nodes.put(legacyInboxNode);
  await db.bits.bulkPut([legacyScratchBit, legacyPreservedBit]);
  await db.chunks.put(legacyChunk);
  if (version >= 2) await db.settings.put({ key: "theme", value: "dark" });
  if (version >= 3) {
    await db.scratchBreakdowns.bulkPut([legacyBreakdown, legacyPreservedBreakdown]);
  }
  db.close();
}

async function snapshotV4(db: GridDODatabase): Promise<Record<string, unknown[]>> {
  const entries = await Promise.all(
    db.tables.map(async (table) => [table.name, await table.toArray()] as const),
  );
  return Object.fromEntries(entries);
}

type LegacyRows = {
  nodes: Record<string, unknown>[];
  bits: Record<string, unknown>[];
  chunks: Record<string, unknown>[];
  settings: Record<string, unknown>[];
  scratchBreakdowns: Record<string, unknown>[];
};

async function snapshotLegacy(db: LegacyGridDO): Promise<LegacyRows> {
  return {
    nodes: await db.nodes.toArray(),
    bits: await db.bits.toArray(),
    chunks: await db.chunks.toArray(),
    settings: await db.settings.toArray(),
    scratchBreakdowns: await db.scratchBreakdowns.toArray(),
  };
}

async function seedInvalidV3(
  options: DexieOptions,
  mutate: (rows: LegacyRows) => void,
): Promise<LegacyRows> {
  const rows: LegacyRows = {
    nodes: [structuredClone(legacyInboxNode)],
    bits: [structuredClone(legacyScratchBit)],
    chunks: [structuredClone(legacyChunk)],
    settings: [{ key: "theme", value: "dark" }],
    scratchBreakdowns: [structuredClone(legacyBreakdown)],
  };
  mutate(rows);

  const db = new LegacyGridDO(3, options);
  await db.open();
  await db.nodes.bulkPut(rows.nodes);
  await db.bits.bulkPut(rows.bits);
  await db.chunks.bulkPut(rows.chunks);
  await db.settings.bulkPut(rows.settings);
  await db.scratchBreakdowns.bulkPut(rows.scratchBreakdowns);
  const snapshot = await snapshotLegacy(db);
  db.close();
  return snapshot;
}

const invalidMigrationCases = [
  {
    name: "invalid Node",
    store: "nodes",
    id: UUID.inbox,
    reason: "invalid_row",
    mutate: (rows: LegacyRows) => {
      rows.nodes[0] = { ...rows.nodes[0], version: 0 };
    },
  },
  {
    name: "Node missing a persisted defaulted field",
    store: "nodes",
    id: UUID.inbox,
    reason: "invalid_row",
    mutate: (rows: LegacyRows) => {
      delete rows.nodes[0].deadlineAllDay;
    },
  },
  {
    name: "invalid Bit",
    store: "bits",
    id: UUID.scratch,
    reason: "invalid_row",
    mutate: (rows: LegacyRows) => {
      rows.bits[0] = { ...rows.bits[0], version: 0 };
    },
  },
  {
    name: "Bit missing a persisted defaulted field",
    store: "bits",
    id: UUID.scratch,
    reason: "invalid_row",
    mutate: (rows: LegacyRows) => {
      delete rows.bits[0].description;
    },
  },
  {
    name: "invalid Breakdown",
    store: "scratchBreakdowns",
    id: UUID.source,
    reason: "invalid_row",
    mutate: (rows: LegacyRows) => {
      rows.scratchBreakdowns[0] = { ...rows.scratchBreakdowns[0], order: -1 };
    },
  },
  {
    name: "Breakdown missing a persisted defaulted field",
    store: "scratchBreakdowns",
    id: UUID.source,
    reason: "invalid_row",
    mutate: (rows: LegacyRows) => {
      delete rows.scratchBreakdowns[0].consumedAt;
    },
  },
  {
    name: "missing Scratch owner Bit",
    store: "scratchBreakdowns",
    id: UUID.source,
    reason: "missing_scratch_owner",
    mutate: (rows: LegacyRows) => {
      rows.scratchBreakdowns[0] = {
        ...rows.scratchBreakdowns[0],
        scratchBitId: "00000000-0000-4000-8000-000000000199",
      };
    },
  },
  {
    name: "Scratch owner outside Inbox",
    store: "scratchBreakdowns",
    id: UUID.source,
    reason: "scratch_owner_not_in_inbox",
    mutate: (rows: LegacyRows) => {
      rows.nodes[0] = { ...rows.nodes[0], systemRole: null };
    },
  },
] as const;

function schemaSource(table: Table): string {
  return [table.schema.primKey.src, ...table.schema.indexes.map((index) => index.src)].join(
    ",",
  );
}

describe("GridDO IndexedDB schema version 4 upgrade", () => {
  it("creates the exact v4 stores and enforces both unique indexes", async () => {
    const indexedDB = new IDBFactory();
    const db = new GridDODatabase({ indexedDB, IDBKeyRange });

    await db.open();

    expect(db.verno).toBe(4);
    expect(
      Object.fromEntries(db.tables.map((table) => [table.name, schemaSource(table)])),
    ).toEqual({
      nodes:
        "id,parentId,deletedAt,[parentId+deletedAt],level,systemRole,archivedAt,[parentId+deletedAt+archivedAt]",
      bits:
        "id,parentId,deletedAt,[parentId+deletedAt],status,deadline,[parentId+status],archivedAt,[parentId+deletedAt+archivedAt]",
      chunks: "id,parentId,[parentId+order],time,status",
      settings: "key",
      scratchBreakdowns:
        "id,scratchBitId,[scratchBitId+order],[scratchBitId+createdAt]",
      stagedCandidates:
        "id,&sourceBreakdownId,scratchBitId,lifecycle,[scratchBitId+lifecycle],[scratchBitId+resultType+createdAt]",
      candidateOrphanAuditEvents:
        "id,&candidateId,sourceBreakdownId,scratchBitId,occurredAt,[scratchBitId+occurredAt]",
    });

    const candidates = db.table("stagedCandidates");
    const audits = db.table("candidateOrphanAuditEvents");

    expect(await candidates.toArray()).toEqual([]);
    expect(await audits.toArray()).toEqual([]);

    await candidates.add({
      id: UUID.candidateA,
      scratchBitId: UUID.scratch,
      sourceBreakdownId: UUID.source,
      resultType: "node",
      lifecycle: "staged",
      createdAt: 1,
      updatedAt: 1,
      version: 1,
    });
    await expect(
      candidates.add({
        id: UUID.candidateB,
        scratchBitId: UUID.scratch,
        sourceBreakdownId: UUID.source,
        resultType: "bit",
        lifecycle: "staged",
        createdAt: 2,
        updatedAt: 2,
        version: 1,
      }),
    ).rejects.toMatchObject({ name: "ConstraintError" });

    await audits.add({
      id: UUID.auditA,
      cause: "source_deleted",
      candidateId: UUID.candidateA,
      sourceBreakdownId: UUID.source,
      scratchBitId: UUID.scratch,
      occurredAt: 3,
    });
    await expect(
      audits.add({
        id: UUID.auditB,
        cause: "source_tombstoned",
        candidateId: UUID.candidateA,
        sourceBreakdownId: UUID.source,
        scratchBitId: UUID.scratch,
        occurredAt: 4,
      }),
    ).rejects.toMatchObject({ name: "ConstraintError" });

    db.close();
  });

  it.each([1, 2, 3] as const)(
    "upgrades v%s data with narrow backfills and remains idempotent",
    async (legacyVersion) => {
      const indexedDB = new IDBFactory();
      const options: DexieOptions = { indexedDB, IDBKeyRange };
      await seedLegacyDatabase(legacyVersion, options);

      const db = new GridDODatabase(options);
      await db.open();

      expect(db.verno).toBe(4);
      expect(await db.table("nodes").get(UUID.inbox)).toEqual(legacyInboxNode);
      expect(await db.table("bits").get(UUID.scratch)).toEqual({
        ...legacyScratchBit,
        version: 1,
        pastDeadlineDismissed: false,
      });
      expect(await db.table("bits").get(UUID.preservedBit)).toEqual(legacyPreservedBit);
      expect(await db.table("chunks").get(legacyChunk.id)).toEqual(legacyChunk);
      expect(await db.table("settings").toArray()).toEqual(
        legacyVersion >= 2 ? [{ key: "theme", value: "dark" }] : [],
      );
      expect(await db.table("scratchBreakdowns").get(UUID.source)).toEqual(
        legacyVersion >= 3 ? { ...legacyBreakdown, version: 1 } : undefined,
      );
      expect(await db.table("scratchBreakdowns").get(UUID.preservedBreakdown)).toEqual(
        legacyVersion >= 3 ? legacyPreservedBreakdown : undefined,
      );
      expect(await db.table("stagedCandidates").toArray()).toEqual([]);
      expect(await db.table("candidateOrphanAuditEvents").toArray()).toEqual([]);

      const firstSnapshot = await snapshotV4(db);
      db.close();

      const reopened = new GridDODatabase(options);
      await reopened.open();
      expect(reopened.verno).toBe(4);
      expect(await snapshotV4(reopened)).toEqual(firstSnapshot);
      reopened.close();
    },
  );

  it.each(invalidMigrationCases)(
    "rolls back every write for $name",
    async ({ store, id, reason, mutate }) => {
      const indexedDB = new IDBFactory();
      const options: DexieOptions = { indexedDB, IDBKeyRange };
      const before = await seedInvalidV3(options, mutate);

      const db = new GridDODatabase(options);
      const error = await db.open().then(
        () => undefined,
        (cause: unknown) => cause,
      );

      expect(error).toMatchObject({
        name: "IndexedDBMigrationError",
        store,
        id,
        reason,
      });
      db.close();

      const inspector = new LegacyGridDO(3, options);
      await inspector.open();
      expect(inspector.verno).toBe(3);
      expect(await snapshotLegacy(inspector)).toEqual(before);
      expect(inspector.tables.map((table) => table.name)).not.toContain("stagedCandidates");
      expect(inspector.tables.map((table) => table.name)).not.toContain(
        "candidateOrphanAuditEvents",
      );
      inspector.close();
    },
  );
});
