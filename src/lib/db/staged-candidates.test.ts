import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { describe, expect, it } from "vitest";
import type {
  StageCandidateCommand,
  UnstageCandidateCommand,
} from "@/lib/db/datastore";
import {
  TRANSACTION_TEST_IDS,
  createSevenStoreSeed,
  seedSevenStores,
  snapshotSevenStores,
  transactionTestUuid,
} from "@/lib/db/indexeddb.test-utils";
import { GridDODatabase, IndexedDBDataStore } from "@/lib/db/indexeddb";

const IDS = {
  stageOperation: transactionTestUuid(12101),
  candidate: transactionTestUuid(12102),
  unstageOperation: transactionTestUuid(12103),
  replacementOperation: transactionTestUuid(12104),
  replacementCandidate: transactionTestUuid(12105),
} as const;

type CheckpointHook = (name: string) => undefined;

const commandTypeContract = {
  stage: {
    operationId: IDS.stageOperation,
    candidateId: IDS.candidate,
    scratchBitId: TRANSACTION_TEST_IDS.scratchBit,
    sourceBreakdownId: TRANSACTION_TEST_IDS.sourceBreakdown,
    sourceExpectedVersion: 2,
    resultType: "node",
  } satisfies StageCandidateCommand,
  unstage: {
    operationId: IDS.unstageOperation,
    candidateId: IDS.candidate,
    candidateExpectedVersion: 1,
    sourceBreakdownId: TRANSACTION_TEST_IDS.sourceBreakdown,
    sourceExpectedVersion: 3,
  } satisfies UnstageCandidateCommand,
};
void commandTypeContract;

describe("durable staged candidate commands", () => {
  it("persists candidate truth across reopen without a copied label and advances only the source", async () => {
    const indexedDB = new IDBFactory();
    const options = { indexedDB, IDBKeyRange };
    const database = new GridDODatabase(options);
    await database.open();

    const seed = createSevenStoreSeed();
    seed.stagedCandidates = [];
    await seedSevenStores(database, seed);
    const store = new IndexedDBDataStore(database);

    await expect(store.stageCandidate(stageCommand())).resolves.toMatchObject({
      status: "applied",
      candidate: {
        id: IDS.candidate,
        sourceBreakdownId: TRANSACTION_TEST_IDS.sourceBreakdown,
        resultType: "node",
        lifecycle: "staged",
        version: 1,
      },
      source: { version: 3, consumedAt: null },
      scratch: { version: 4 },
    });
    database.close();

    const reopened = new GridDODatabase(options);
    await reopened.open();
    try {
      const candidate = await reopened.stagedCandidates.get(IDS.candidate);
      expect(candidate).toMatchObject({
        id: IDS.candidate,
        scratchBitId: TRANSACTION_TEST_IDS.scratchBit,
        sourceBreakdownId: TRANSACTION_TEST_IDS.sourceBreakdown,
        resultType: "node",
        lifecycle: "staged",
        version: 1,
      });
      expect(candidate).not.toHaveProperty("label");
      expect(await reopened.scratchBreakdowns.get(TRANSACTION_TEST_IDS.sourceBreakdown))
        .toEqual({ ...seed.scratchBreakdowns[0]!, version: 3 });
      expect(await reopened.bits.get(TRANSACTION_TEST_IDS.scratchBit)).toEqual(
        seed.bits[0],
      );
    } finally {
      reopened.close();
    }
  });

  it("requires Unstage and a new identity before changing candidate type", async () => {
    await withStore((seed) => {
      seed.stagedCandidates = [];
    }, async (database, store) => {
      const stage = stageCommand();
      await expect(store.stageCandidate(stage)).resolves.toMatchObject({
        status: "applied",
      });

      const replacement = stageCommand({
        operationId: IDS.replacementOperation,
        candidateId: IDS.replacementCandidate,
        sourceExpectedVersion: 3,
        resultType: "bit",
      });
      const staged = await snapshotSevenStores(database);
      await expect(store.stageCandidate(replacement)).resolves.toMatchObject({
        status: "rejected",
        candidate: { id: IDS.candidate, resultType: "node" },
      });
      expect(await snapshotSevenStores(database)).toEqual(staged);

      await expect(store.unstageCandidate(unstageCommand())).resolves.toMatchObject({
        status: "applied",
        candidate: null,
        source: { version: 4 },
      });
      await expect(store.stageCandidate({
        ...replacement,
        sourceExpectedVersion: 4,
      })).resolves.toMatchObject({
        status: "applied",
        candidate: {
          id: IDS.replacementCandidate,
          resultType: "bit",
          version: 1,
        },
        source: { version: 5 },
      });
    });
  });

  it("rolls Stage back when failure is injected after candidate creation", async () => {
    await withStore(
      (seed) => {
        seed.stagedCandidates = [];
      },
      async (database, store) => {
        const before = await snapshotSevenStores(database);
        await expect(store.stageCandidate(stageCommand())).rejects.toThrow(
          "inbox.stage.after.candidate",
        );
        expect(await snapshotSevenStores(database)).toEqual(before);
      },
      failAt("inbox.stage.after.candidate"),
    );
  });

  it("rolls Unstage back when failure is injected after candidate deletion", async () => {
    await withStore(undefined, async (database, store) => {
      const before = await snapshotSevenStores(database);
      await expect(store.unstageCandidate(unstageSeedCommand())).rejects.toThrow(
        "inbox.unstage.after.candidate",
      );
      expect(await snapshotSevenStores(database)).toEqual(before);
    }, failAt("inbox.unstage.after.candidate"));
  });
});

function stageCommand(
  overrides: Partial<StageCandidateCommand> = {},
): StageCandidateCommand {
  return {
    operationId: IDS.stageOperation,
    candidateId: IDS.candidate,
    scratchBitId: TRANSACTION_TEST_IDS.scratchBit,
    sourceBreakdownId: TRANSACTION_TEST_IDS.sourceBreakdown,
    sourceExpectedVersion: 2,
    resultType: "node",
    ...overrides,
  };
}

function unstageCommand(
  overrides: Partial<UnstageCandidateCommand> = {},
): UnstageCandidateCommand {
  return {
    operationId: IDS.unstageOperation,
    candidateId: IDS.candidate,
    candidateExpectedVersion: 1,
    sourceBreakdownId: TRANSACTION_TEST_IDS.sourceBreakdown,
    sourceExpectedVersion: 3,
    ...overrides,
  };
}

function unstageSeedCommand(): UnstageCandidateCommand {
  return {
    operationId: IDS.unstageOperation,
    candidateId: TRANSACTION_TEST_IDS.stagedCandidate,
    candidateExpectedVersion: 2,
    sourceBreakdownId: TRANSACTION_TEST_IDS.sourceBreakdown,
    sourceExpectedVersion: 2,
  };
}

function failAt(expectedCheckpoint: string): CheckpointHook {
  return (checkpoint) => {
    if (checkpoint === expectedCheckpoint) {
      throw new Error(checkpoint);
    }
    return undefined;
  };
}

async function withStore(
  configureSeed: ((seed: ReturnType<typeof createSevenStoreSeed>) => void) | undefined,
  run: (database: GridDODatabase, store: IndexedDBDataStore) => Promise<void>,
  onCheckpoint?: CheckpointHook,
): Promise<void> {
  const indexedDB = new IDBFactory();
  const database = new GridDODatabase({ indexedDB, IDBKeyRange });
  await database.open();

  try {
    const seed = createSevenStoreSeed();
    configureSeed?.(seed);
    await seedSevenStores(database, seed);
    await run(database, new IndexedDBDataStore(database, onCheckpoint));
  } finally {
    database.close();
  }
}
