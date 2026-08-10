import { describe, expect, it, vi } from "vitest";
import type { PendingOperationRecovery } from "@/lib/db/schema";
import type { SevenStoreSnapshot } from "@/lib/db/indexeddb.test-utils";
import {
  TRANSACTION_TEST_IDS,
  createSevenStoreSeed,
  openTransactionTestDatabase,
  seedSevenStores,
  snapshotSevenStores,
  transactionTestUuid,
} from "@/lib/db/indexeddb.test-utils";
import { IndexedDBDataStore } from "@/lib/db/indexeddb";

type RecoveryClassification =
  | {
      operationId: string;
      status: "applied" | "not_applied" | "conflict";
      scratch: unknown;
    }
  | { operationId: string; outcome: "unknown" };

type ArchiveRecoveryStore = {
  classifyArchiveScratchRecovery(
    recovery: PendingOperationRecovery,
  ): Promise<RecoveryClassification>;
};

const IDS = {
  operation: transactionTestUuid(12601),
  ordinaryParent: transactionTestUuid(12602),
  missingScratch: transactionTestUuid(12603),
} as const;

describe("Archive Scratch recovery classification", () => {
  it("classifies the complete active eligible precondition as not_applied without writes", async () => {
    await withRecoveryStore(configureEligible, async (database, store) => {
      const before = await snapshotSevenStores(database);

      await expect(store.classifyArchiveScratchRecovery(recovery())).resolves.toMatchObject({
        operationId: IDS.operation,
        status: "not_applied",
        scratch: {
          id: TRANSACTION_TEST_IDS.scratchBit,
          archivedAt: null,
          version: 4,
        },
      });

      expect(await snapshotSevenStores(database)).toEqual(before);
    });
  });

  it("classifies only the complete retained Archive postcondition as applied without writes", async () => {
    await withRecoveryStore((seed) => {
      configureEligible(seed);
      seed.bits[0] = {
        ...seed.bits[0]!,
        archivedAt: 250,
        mtime: 250,
        version: 5,
      };
    }, async (database, store) => {
      const before = await snapshotSevenStores(database);

      await expect(store.classifyArchiveScratchRecovery(recovery())).resolves.toMatchObject({
        operationId: IDS.operation,
        status: "applied",
        scratch: {
          id: TRANSACTION_TEST_IDS.scratchBit,
          archivedAt: 250,
          mtime: 250,
          version: 5,
        },
      });

      expect(await snapshotSevenStores(database)).toEqual(before);
    });
  });

  it.each([
    ["advanced active version", (seed: SevenStoreSnapshot) => {
      configureEligible(seed);
      seed.bits[0] = { ...seed.bits[0]!, version: 5 };
    }],
    ["partial archived state", (seed: SevenStoreSnapshot) => {
      configureEligible(seed);
      seed.bits[0] = { ...seed.bits[0]!, archivedAt: 250, version: 5 };
    }],
    ["changed lifecycle", (seed: SevenStoreSnapshot) => {
      configureEligible(seed);
      seed.bits[0] = { ...seed.bits[0]!, deletedAt: 220 };
    }],
    ["changed durable eligibility", (seed: SevenStoreSnapshot) => {
      configureEligible(seed);
      seed.scratchBreakdowns[0] = { ...seed.scratchBreakdowns[0]!, consumedAt: null };
    }],
    ["partial archived aggregate", (seed: SevenStoreSnapshot) => {
      configureEligible(seed);
      seed.bits[0] = {
        ...seed.bits[0]!,
        archivedAt: 250,
        mtime: 250,
        version: 5,
      };
      seed.stagedCandidates = [createSevenStoreSeed().stagedCandidates[0]!];
    }],
    ["stale descriptor", (seed: SevenStoreSnapshot) => {
      configureEligible(seed);
      seed.bits[0] = {
        ...seed.bits[0]!,
        archivedAt: 150,
        mtime: 150,
        version: 5,
      };
    }],
    ["foreign ordinary Bit", (seed: SevenStoreSnapshot) => {
      configureEligible(seed);
      seed.nodes.push({
        ...seed.nodes[0]!,
        id: IDS.ordinaryParent,
        title: "Ordinary",
        systemRole: null,
        x: 1,
      });
      seed.bits[0] = { ...seed.bits[0]!, parentId: IDS.ordinaryParent };
    }],
    ["missing Scratch", (seed: SevenStoreSnapshot) => {
      configureEligible(seed);
      seed.bits = [];
    }],
  ] as const)("classifies %s as conflict and performs no mutation", async (_label, configure) => {
    await withRecoveryStore(configure, async (database, store) => {
      const before = await snapshotSevenStores(database);
      const descriptor = _label === "missing Scratch"
        ? recovery({ scratchBitId: IDS.missingScratch })
        : recovery();

      await expect(store.classifyArchiveScratchRecovery(descriptor)).resolves.toMatchObject({
        operationId: IDS.operation,
        status: "conflict",
      });
      expect(await snapshotSevenStores(database)).toEqual(before);
    });
  });

  it.each([
    ["invalid operation identity", { operationId: "not-a-uuid" }],
    ["foreign operation kind", { kind: "delete_scratch" }],
    ["invalid expected version", { expectedVersion: 0 }],
    ["invalid start timestamp", { startedAt: 0 }],
  ] as const)("fails closed for %s before any read or write", async (_label, override) => {
    await withRecoveryStore(configureEligible, async (database, store) => {
      const before = await snapshotSevenStores(database);
      const invalid = { ...recovery(), ...override };

      await expect(
        store.classifyArchiveScratchRecovery(
          invalid as unknown as PendingOperationRecovery,
        ),
      ).rejects.toThrow();
      expect(await snapshotSevenStores(database)).toEqual(before);
    });
  });

  it("returns unknown when repository authority is unavailable and invokes no mutation", async () => {
    const mutation = vi.fn(() => Promise.resolve());
    const unavailable = vi.fn(() => Promise.reject(new Error("authority unavailable")));
    const table = {
      get: unavailable,
      toArray: unavailable,
      put: mutation,
      bulkPut: mutation,
      delete: mutation,
      bulkDelete: mutation,
    };
    const store = new IndexedDBDataStore({
      nodes: table,
      bits: table,
      chunks: table,
      scratchBreakdowns: table,
      stagedCandidates: table,
    } as never) as unknown as ArchiveRecoveryStore;

    await expect(store.classifyArchiveScratchRecovery(recovery())).resolves.toEqual({
      operationId: IDS.operation,
      outcome: "unknown",
    });
    expect(mutation).not.toHaveBeenCalled();
  });
});

function recovery(
  override: Partial<PendingOperationRecovery> = {},
): PendingOperationRecovery {
  return {
    operationId: IDS.operation,
    kind: "archive_scratch",
    scratchBitId: TRANSACTION_TEST_IDS.scratchBit,
    expectedVersion: 4,
    startedAt: 200,
    ...override,
  };
}

function configureEligible(seed: SevenStoreSnapshot): void {
  seed.scratchBreakdowns[0] = {
    ...seed.scratchBreakdowns[0]!,
    consumedAt: 180,
  };
  seed.stagedCandidates = [];
}

async function withRecoveryStore(
  configure: (seed: SevenStoreSnapshot) => void,
  run: (
    database: Awaited<ReturnType<typeof openTransactionTestDatabase>>,
    store: ArchiveRecoveryStore,
  ) => Promise<void>,
): Promise<void> {
  const database = await openTransactionTestDatabase();
  try {
    const seed = createSevenStoreSeed();
    configure(seed);
    await seedSevenStores(database, seed);
    const store = new IndexedDBDataStore(database) as unknown as ArchiveRecoveryStore;
    await run(database, store);
  } finally {
    database.close();
  }
}
