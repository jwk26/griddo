import Dexie from "dexie";
import { describe, expect, it, vi } from "vitest";
import type {
  ConfirmedCandidateOrphanCleanupCommand,
  ConfirmedCandidateOrphanProof,
} from "@/lib/db/datastore";
import type {
  CandidateOrphanAuditEvent,
  StagedCandidate,
} from "@/lib/db/schema";
import type { SevenStoreSnapshot } from "@/lib/db/indexeddb.test-utils";
import {
  TRANSACTION_TEST_IDS,
  createSevenStoreSeed,
  openTransactionTestDatabase,
  seedSevenStores,
  snapshotSevenStores,
  transactionTestUuid,
} from "@/lib/db/indexeddb.test-utils";
import {
  type GridDODatabase,
  IndexedDBDataStore,
} from "@/lib/db/indexeddb";

const IDS = {
  operation: transactionTestUuid(12201),
  auditEvent: transactionTestUuid(12202),
  competingAuditEvent: transactionTestUuid(12203),
  mismatchedSource: transactionTestUuid(12204),
  mismatchedScratch: transactionTestUuid(12205),
} as const;

type CheckpointHook = (name: string) => undefined;

const commandTypeContract = {
  operationId: IDS.operation,
  auditEventId: IDS.auditEvent,
  candidateId: TRANSACTION_TEST_IDS.stagedCandidate,
  candidateExpectedVersion: 2,
  sourceBreakdownId: TRANSACTION_TEST_IDS.sourceBreakdown,
  scratchBitId: TRANSACTION_TEST_IDS.scratchBit,
  resultType: "bit",
  proof: {
    status: "confirmed",
    cause: "source_deleted",
    sourceBreakdownId: TRANSACTION_TEST_IDS.sourceBreakdown,
  },
} satisfies ConfirmedCandidateOrphanCleanupCommand;
void commandTypeContract;

describe("confirmed candidate orphan cleanup", () => {
  it.each(["source_deleted", "source_tombstoned"] as const)(
    "atomically removes the exact candidate, appends one %s audit, and reconciles retries",
    async (cause) => {
      await withStore(orphanSeed, async (database, store) => {
        const command = cleanupCommand({
          proof: confirmedProof(cause),
        });
        const before = await snapshotSevenStores(database);

        await expect(
          store.reconcileConfirmedCandidateOrphanCleanup(command),
        ).resolves.toMatchObject({
          operationId: command.operationId,
          status: "not_applied",
          candidate: {
            id: command.candidateId,
            version: command.candidateExpectedVersion,
          },
          source: null,
          auditEvent: null,
        });
        await expect(
          store.cleanupConfirmedCandidateOrphan(command),
        ).resolves.toMatchObject({
          operationId: command.operationId,
          status: "applied",
          candidate: null,
          source: null,
          auditEvent: {
            id: command.auditEventId,
            cause,
            candidateId: command.candidateId,
            sourceBreakdownId: command.sourceBreakdownId,
            scratchBitId: command.scratchBitId,
          },
        });

        const committed = await snapshotSevenStores(database);
        expect(committed.stagedCandidates).toEqual([]);
        expect(committed.candidateOrphanAuditEvents).toHaveLength(
          before.candidateOrphanAuditEvents.length + 1,
        );
        expect(committed.candidateOrphanAuditEvents).toContainEqual(
          before.candidateOrphanAuditEvents[0],
        );
        expect(
          committed.candidateOrphanAuditEvents.find(
            ({ id }) => id === command.auditEventId,
          )?.occurredAt,
        ).toEqual(expect.any(Number));

        await expect(
          store.cleanupConfirmedCandidateOrphan(command),
        ).resolves.toMatchObject({ status: "already_applied" });
        await expect(
          store.reconcileConfirmedCandidateOrphanCleanup(command),
        ).resolves.toMatchObject({ status: "already_applied" });
        expect(await snapshotSevenStores(database)).toEqual(committed);
      });
    },
  );

  it.each(["cache_miss", "offline", "delayed_subscription"] as const)(
    "rejects unresolved %s evidence without treating a local source miss as proof",
    async (reason) => {
      await withStore(orphanSeed, async (database, store) => {
        const before = await snapshotSevenStores(database);
        const command = cleanupCommand({
          proof: { status: "unresolved", reason },
        });

        await expect(
          store.cleanupConfirmedCandidateOrphan(command),
        ).resolves.toMatchObject({ status: "rejected" });
        await expect(
          store.reconcileConfirmedCandidateOrphanCleanup(command),
        ).resolves.toMatchObject({ status: "rejected" });
        expect(await snapshotSevenStores(database)).toEqual(before);
      });
    },
  );

  it("rejects planned-aggregate evidence instead of routing it through orphan cleanup", async () => {
    await withStore(orphanSeed, async (database, store) => {
      const before = await snapshotSevenStores(database);
      const command = cleanupCommand({
        proof: {
          status: "planned_aggregate",
          sourceBreakdownId: TRANSACTION_TEST_IDS.sourceBreakdown,
        },
      });

      await expect(
        store.cleanupConfirmedCandidateOrphan(command),
      ).resolves.toMatchObject({ status: "rejected" });
      await expect(
        store.reconcileConfirmedCandidateOrphanCleanup(command),
      ).resolves.toMatchObject({ status: "rejected" });
      expect(await snapshotSevenStores(database)).toEqual(before);
    });
  });

  it("returns conflict when confirmed deletion contradicts a still-present source", async () => {
    await withStore(undefined, async (database, store) => {
      const before = await snapshotSevenStores(database);

      await expect(
        store.cleanupConfirmedCandidateOrphan(cleanupCommand()),
      ).resolves.toMatchObject({
        status: "conflict",
        source: { id: TRANSACTION_TEST_IDS.sourceBreakdown },
      });
      expect(await snapshotSevenStores(database)).toEqual(before);
    });
  });

  it("returns conflict for proof naming a different source", async () => {
    await withStore(orphanSeed, async (database, store) => {
      const before = await snapshotSevenStores(database);
      const command = cleanupCommand({
        proof: {
          status: "confirmed",
          cause: "source_deleted",
          sourceBreakdownId: IDS.mismatchedSource,
        },
      });

      await expect(
        store.cleanupConfirmedCandidateOrphan(command),
      ).resolves.toMatchObject({ status: "conflict" });
      expect(await snapshotSevenStores(database)).toEqual(before);
    });
  });

  it.each([
    ["version", (candidate: StagedCandidate) => ({ ...candidate, version: 3 })],
    [
      "source",
      (candidate: StagedCandidate) => ({
        ...candidate,
        sourceBreakdownId: IDS.mismatchedSource,
      }),
    ],
    [
      "Scratch",
      (candidate: StagedCandidate) => ({
        ...candidate,
        scratchBitId: IDS.mismatchedScratch,
      }),
    ],
    [
      "type",
      (candidate: StagedCandidate) => ({ ...candidate, resultType: "node" as const }),
    ],
  ] as const)("returns conflict for changed candidate %s", async (_field, change) => {
    await withStore((seed) => {
      orphanSeed(seed);
      seed.stagedCandidates[0] = change(seed.stagedCandidates[0]!);
    }, async (database, store) => {
      const before = await snapshotSevenStores(database);

      await expect(
        store.reconcileConfirmedCandidateOrphanCleanup(cleanupCommand()),
      ).resolves.toMatchObject({ status: "conflict" });
      await expect(
        store.cleanupConfirmedCandidateOrphan(cleanupCommand()),
      ).resolves.toMatchObject({ status: "conflict" });
      expect(await snapshotSevenStores(database)).toEqual(before);
    });
  });

  it("returns conflict for a different audit already claiming the candidate", async () => {
    await withStore((seed) => {
      orphanSeed(seed);
      seed.candidateOrphanAuditEvents.push(
        auditForCommand({ id: IDS.competingAuditEvent }),
      );
    }, async (database, store) => {
      const before = await snapshotSevenStores(database);

      await expect(
        store.cleanupConfirmedCandidateOrphan(cleanupCommand()),
      ).resolves.toMatchObject({
        status: "conflict",
        auditEvent: { id: IDS.competingAuditEvent },
      });
      expect(await snapshotSevenStores(database)).toEqual(before);
    });
  });

  it("returns conflict for candidate absence without the exact audit", async () => {
    await withStore((seed) => {
      orphanSeed(seed);
      seed.stagedCandidates = [];
    }, async (database, store) => {
      const before = await snapshotSevenStores(database);

      await expect(
        store.reconcileConfirmedCandidateOrphanCleanup(cleanupCommand()),
      ).resolves.toMatchObject({ status: "conflict", auditEvent: null });
      expect(await snapshotSevenStores(database)).toEqual(before);
    });
  });

  it("returns conflict for an exact audit while the candidate still exists", async () => {
    await withStore((seed) => {
      orphanSeed(seed);
      seed.candidateOrphanAuditEvents.push(auditForCommand());
    }, async (database, store) => {
      const before = await snapshotSevenStores(database);

      await expect(
        store.reconcileConfirmedCandidateOrphanCleanup(cleanupCommand()),
      ).resolves.toMatchObject({
        status: "conflict",
        candidate: { id: TRANSACTION_TEST_IDS.stagedCandidate },
        auditEvent: { id: IDS.auditEvent },
      });
      expect(await snapshotSevenStores(database)).toEqual(before);
    });
  });

  it("rolls candidate deletion back when audit append fails at the named checkpoint", async () => {
    await withStore(
      orphanSeed,
      async (database, store) => {
        const before = await snapshotSevenStores(database);

        await expect(
          store.cleanupConfirmedCandidateOrphan(cleanupCommand()),
        ).rejects.toThrow("inbox.orphan-cleanup.after.candidate");
        expect(await snapshotSevenStores(database)).toEqual(before);
      },
      failAt("inbox.orphan-cleanup.after.candidate"),
    );
  });

  it("reads candidate, source, and audit from one read-only reconciliation snapshot", async () => {
    await withStore(orphanSeed, async (database, store) => {
      await expectSingleReconcileSnapshot(database, () =>
        store.reconcileConfirmedCandidateOrphanCleanup(cleanupCommand()),
      );
    });
  });

  it("keeps planned aggregate deletion audit-free and retains prior audit history", async () => {
    await withStore(undefined, async (database, store) => {
      const before = await snapshotSevenStores(database);

      await expect(store.hardDeleteBit(TRANSACTION_TEST_IDS.scratchBit)).resolves.toEqual({
        status: "deleted",
      });
      const after = await snapshotSevenStores(database);
      expect(after.candidateOrphanAuditEvents).toEqual(
        before.candidateOrphanAuditEvents,
      );
    });
  });
});

function cleanupCommand(
  overrides: Partial<ConfirmedCandidateOrphanCleanupCommand> = {},
): ConfirmedCandidateOrphanCleanupCommand {
  return {
    operationId: IDS.operation,
    auditEventId: IDS.auditEvent,
    candidateId: TRANSACTION_TEST_IDS.stagedCandidate,
    candidateExpectedVersion: 2,
    sourceBreakdownId: TRANSACTION_TEST_IDS.sourceBreakdown,
    scratchBitId: TRANSACTION_TEST_IDS.scratchBit,
    resultType: "bit",
    proof: confirmedProof("source_deleted"),
    ...overrides,
  };
}

function confirmedProof(
  cause: "source_deleted" | "source_tombstoned",
): ConfirmedCandidateOrphanProof {
  return {
    status: "confirmed",
    cause,
    sourceBreakdownId: TRANSACTION_TEST_IDS.sourceBreakdown,
  };
}

function auditForCommand(
  overrides: Partial<CandidateOrphanAuditEvent> = {},
): CandidateOrphanAuditEvent {
  return {
    id: IDS.auditEvent,
    cause: "source_deleted",
    candidateId: TRANSACTION_TEST_IDS.stagedCandidate,
    sourceBreakdownId: TRANSACTION_TEST_IDS.sourceBreakdown,
    scratchBitId: TRANSACTION_TEST_IDS.scratchBit,
    occurredAt: 200,
    ...overrides,
  };
}

function orphanSeed(seed: SevenStoreSnapshot): void {
  seed.scratchBreakdowns = [];
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
  configureSeed: ((seed: SevenStoreSnapshot) => void) | undefined,
  run: (database: GridDODatabase, store: IndexedDBDataStore) => Promise<void>,
  onCheckpoint?: CheckpointHook,
): Promise<void> {
  const database = await openTransactionTestDatabase();

  try {
    const seed = createSevenStoreSeed();
    configureSeed?.(seed);
    await seedSevenStores(database, seed);
    await run(database, new IndexedDBDataStore(database, onCheckpoint));
  } finally {
    database.close();
  }
}

async function expectSingleReconcileSnapshot(
  database: GridDODatabase,
  reconcile: () => Promise<unknown>,
): Promise<void> {
  const observedTransactions: Array<typeof Dexie.currentTransaction> = [];
  const observeTransaction = () => {
    observedTransactions.push(Dexie.currentTransaction);
  };
  const sourceGet = database.scratchBreakdowns.get.bind(
    database.scratchBreakdowns,
  );
  const candidateGet = database.stagedCandidates.get.bind(
    database.stagedCandidates,
  );
  const auditGet = database.candidateOrphanAuditEvents.get.bind(
    database.candidateOrphanAuditEvents,
  );
  const auditsToArray = database.candidateOrphanAuditEvents.toArray.bind(
    database.candidateOrphanAuditEvents,
  );
  const spies = [
    vi.spyOn(database.scratchBreakdowns, "get").mockImplementation((id) => {
      observeTransaction();
      return sourceGet(id);
    }),
    vi.spyOn(database.stagedCandidates, "get").mockImplementation((id) => {
      observeTransaction();
      return candidateGet(id);
    }),
    vi.spyOn(database.candidateOrphanAuditEvents, "get").mockImplementation((id) => {
      observeTransaction();
      return auditGet(id);
    }),
    vi.spyOn(database.candidateOrphanAuditEvents, "toArray").mockImplementation(() => {
      observeTransaction();
      return auditsToArray();
    }),
  ];

  try {
    await reconcile();

    expect(observedTransactions.length).toBeGreaterThan(0);
    const transaction = observedTransactions[0];
    expect(transaction).not.toBeNull();
    expect(transaction?.mode).toBe("readonly");
    expect(
      observedTransactions.every((observed) => observed === transaction),
    ).toBe(true);
    expect([...(transaction?.storeNames ?? [])].sort()).toEqual(
      [
        "candidateOrphanAuditEvents",
        "scratchBreakdowns",
        "stagedCandidates",
      ].sort(),
    );
  } finally {
    for (const spy of spies) {
      spy.mockRestore();
    }
  }
}
