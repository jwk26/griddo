import { describe, expect, it, vi } from "vitest";
import type {
  ArchiveScratchCommand,
  ArchiveScratchResult,
  ScratchArchiveEligibility,
} from "@/lib/db/datastore";
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

type ArchiveScratchStore = {
  getScratchArchiveEligibility(scratchBitId: string): Promise<ScratchArchiveEligibility>;
  archiveScratch(command: ArchiveScratchCommand): Promise<ArchiveScratchResult>;
};

type CheckpointHook = (name: string) => undefined;

const IDS = {
  operation: transactionTestUuid(12501),
  extraBreakdown: transactionTestUuid(12502),
  raceCandidate: transactionTestUuid(12503),
  ordinaryNode: transactionTestUuid(12504),
} as const;

describe("authoritative Scratch Archive command", () => {
  it.each([
    ["one consumed row", configureEligible, true, 1, 0, 0],
    ["no rows", (seed: SevenStoreSnapshot) => {
      seed.scratchBreakdowns = [];
      seed.stagedCandidates = [];
    }, false, 0, 0, 0],
    ["only an unconsumed row", (seed: SevenStoreSnapshot) => {
      seed.stagedCandidates = [];
    }, false, 0, 1, 0],
    ["consumed and unconsumed rows", (seed: SevenStoreSnapshot) => {
      configureEligible(seed);
      seed.scratchBreakdowns.push({
        ...seed.scratchBreakdowns[0]!,
        id: IDS.extraBreakdown,
        consumedAt: null,
      });
    }, false, 1, 1, 0],
    ["an all-staged active row", (seed: SevenStoreSnapshot) => {
      seed.scratchBreakdowns[0] = {
        ...seed.scratchBreakdowns[0]!,
        consumedAt: null,
      };
    }, false, 0, 1, 1],
  ] as const)(
    "reports exact durable eligibility for %s",
    async (_label, configure, eligible, consumedCount, unconsumedCount, stagedCandidateCount) => {
      await withArchiveStore(configure, async (_database, store) => {
        await expect(
          store.getScratchArchiveEligibility(TRANSACTION_TEST_IDS.scratchBit),
        ).resolves.toMatchObject({
          eligible,
          scratch: { id: TRANSACTION_TEST_IDS.scratchBit, version: 4 },
          consumedCount,
          unconsumedCount,
          stagedCandidateCount,
        });
      });
    },
  );

  it.each([
    ["missing caller assertion", (command: Record<string, unknown>) => {
      delete command.callerAssertion;
    }],
    ["unclear Add draft", (command: Record<string, unknown>) => {
      command.callerAssertion = { addDraftClear: false, titleBlockerClear: true };
    }],
    ["unclear title blocker", (command: Record<string, unknown>) => {
      command.callerAssertion = { addDraftClear: true, titleBlockerClear: false };
    }],
  ] as const)("rejects %s before any write", async (_label, mutate) => {
    await withArchiveStore(configureEligible, async (database, store) => {
      const invalid = structuredClone(command()) as unknown as Record<string, unknown>;
      mutate(invalid);
      const before = await snapshotSevenStores(database);

      await expect(
        store.archiveScratch(invalid as unknown as ArchiveScratchCommand),
      ).rejects.toThrow();
      expect(await snapshotSevenStores(database)).toEqual(before);
    });
  });

  it("archives only the exact eligible Scratch and retains all related durable rows", async () => {
    await withArchiveStore(configureEligible, async (database, store) => {
      vi.spyOn(Date, "now").mockReturnValue(500);
      const before = await snapshotSevenStores(database);

      await expect(store.archiveScratch(command())).resolves.toMatchObject({
        operationId: IDS.operation,
        status: "applied",
        scratch: {
          id: TRANSACTION_TEST_IDS.scratchBit,
          archivedAt: 500,
          mtime: 500,
          version: 5,
        },
      });

      const after = await snapshotSevenStores(database);
      expect(after).toEqual({
        ...before,
        bits: before.bits.map((bit) =>
          bit.id === TRANSACTION_TEST_IDS.scratchBit
            ? { ...bit, archivedAt: 500, mtime: 500, version: 5 }
            : bit,
        ),
      });
      expect(after.scratchBreakdowns).toEqual(before.scratchBreakdowns);
      expect(after.stagedCandidates).toEqual(before.stagedCandidates);
    });
  });

  it.each([
    ["an unconsumed row appears", (seed: SevenStoreSnapshot) => {
      seed.scratchBreakdowns.push({
        ...seed.scratchBreakdowns[0]!,
        id: IDS.extraBreakdown,
        consumedAt: null,
      });
    }, "rejected"],
    ["a staged candidate appears", (seed: SevenStoreSnapshot) => {
      seed.stagedCandidates = [{
        ...createSevenStoreSeed().stagedCandidates[0]!,
        id: IDS.raceCandidate,
        sourceBreakdownId: seed.scratchBreakdowns[0]!.id,
      }];
    }, "rejected"],
    ["the Scratch version advances", (seed: SevenStoreSnapshot) => {
      seed.bits[0] = { ...seed.bits[0]!, version: 5 };
    }, "conflict"],
  ] as const)("rechecks inside the transaction when %s after eligibility read", async (_label, race, status) => {
    await withArchiveStore(configureEligible, async (database, store) => {
      await expect(
        store.getScratchArchiveEligibility(TRANSACTION_TEST_IDS.scratchBit),
      ).resolves.toMatchObject({ eligible: true });

      const changed = await snapshotSevenStores(database);
      race(changed);
      await replaceArchiveStores(database, changed);
      const before = await snapshotSevenStores(database);

      await expect(store.archiveScratch(command())).resolves.toMatchObject({ status });
      expect(await snapshotSevenStores(database)).toEqual(before);
    });
  });

  it("treats same-command replay as already applied and performs no second write", async () => {
    await withArchiveStore(configureEligible, async (database, store) => {
      await expect(store.archiveScratch(command())).resolves.toMatchObject({ status: "applied" });
      const committed = await snapshotSevenStores(database);

      await expect(store.archiveScratch(command())).resolves.toMatchObject({
        operationId: IDS.operation,
        status: "already_applied",
        scratch: { archivedAt: committed.bits[0]!.archivedAt, version: 5 },
      });
      expect(await snapshotSevenStores(database)).toEqual(committed);
    });
  });

  it("does not misclassify an archived ordinary Bit as an applied Scratch command", async () => {
    await withArchiveStore((seed) => {
      configureEligible(seed);
      seed.nodes.push({
        ...seed.nodes[0]!,
        id: IDS.ordinaryNode,
        title: "Ordinary",
        systemRole: null,
        x: 1,
      });
      seed.bits[0] = {
        ...seed.bits[0]!,
        parentId: IDS.ordinaryNode,
        archivedAt: 400,
        version: 5,
      };
    }, async (database, store) => {
      const before = await snapshotSevenStores(database);

      await expect(store.archiveScratch(command())).resolves.toMatchObject({
        operationId: IDS.operation,
        status: "rejected",
      });
      expect(await snapshotSevenStores(database)).toEqual(before);
    });
  });

  it("rolls the Scratch write back at the named transaction checkpoint", async () => {
    await withArchiveStore(
      configureEligible,
      async (database, store) => {
        const before = await snapshotSevenStores(database);

        await expect(store.archiveScratch(command())).rejects.toThrow(
          "inbox.archive-scratch.after.scratch",
        );
        expect(await snapshotSevenStores(database)).toEqual(before);
      },
      failAt("inbox.archive-scratch.after.scratch"),
    );
  });
});

function command(): ArchiveScratchCommand {
  return {
    operationId: IDS.operation,
    scratchBitId: TRANSACTION_TEST_IDS.scratchBit,
    expectedVersion: 4,
    callerAssertion: {
      addDraftClear: true,
      titleBlockerClear: true,
    },
  };
}

function configureEligible(seed: SevenStoreSnapshot): void {
  seed.scratchBreakdowns[0] = {
    ...seed.scratchBreakdowns[0]!,
    consumedAt: 200,
  };
  seed.stagedCandidates = [];
}

async function replaceArchiveStores(
  database: Awaited<ReturnType<typeof openTransactionTestDatabase>>,
  state: SevenStoreSnapshot,
): Promise<void> {
  await database.transaction(
    "rw",
    [database.bits, database.scratchBreakdowns, database.stagedCandidates],
    async () => {
      await database.bits.clear();
      await database.scratchBreakdowns.clear();
      await database.stagedCandidates.clear();
      await database.bits.bulkPut(state.bits);
      await database.scratchBreakdowns.bulkPut(state.scratchBreakdowns);
      await database.stagedCandidates.bulkPut(state.stagedCandidates);
    },
  );
}

function failAt(expectedCheckpoint: string): CheckpointHook {
  return (checkpoint) => {
    if (checkpoint === expectedCheckpoint) throw new Error(checkpoint);
    return undefined;
  };
}

async function withArchiveStore(
  configure: (seed: SevenStoreSnapshot) => void,
  run: (
    database: Awaited<ReturnType<typeof openTransactionTestDatabase>>,
    store: ArchiveScratchStore,
  ) => Promise<void>,
  onCheckpoint?: CheckpointHook,
): Promise<void> {
  const database = await openTransactionTestDatabase();
  try {
    const seed = createSevenStoreSeed();
    configure(seed);
    await seedSevenStores(database, seed);
    const store = new IndexedDBDataStore(database, onCheckpoint) as unknown as ArchiveScratchStore;
    await run(database, store);
  } finally {
    database.close();
    vi.restoreAllMocks();
  }
}
