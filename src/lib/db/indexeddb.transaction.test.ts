import Dexie from "dexie";
import { describe, expect, it } from "vitest";
import type { CandidateOrphanAuditEvent } from "@/lib/db/schema";
import { GridDODatabase, IndexedDBDataStore } from "@/lib/db/indexeddb";
import {
  TEST_TRANSACTION_STORE_NAMES,
  TRANSACTION_TEST_IDS,
  classifyCompleteState,
  openTransactionTestDatabase,
  seedSevenStores,
  snapshotSevenStores,
  type SevenStoreSnapshot,
} from "@/lib/db/indexeddb.test-utils";

const CHECKPOINTS = [
  "probe.after.nodes",
  "probe.after.bits",
  "probe.after.chunks",
  "probe.after.settings",
  "probe.after.scratchBreakdowns",
  "probe.after.stagedCandidates",
  "probe.after.candidateOrphanAuditEvents",
] as const;

type CheckpointHook = (name: string) => undefined;

class InjectedCheckpointError extends Error {
  constructor(public readonly checkpoint: string) {
    super(`Injected failure at ${checkpoint}`);
    this.name = "InjectedCheckpointError";
  }
}

class AtomicProbeStore extends IndexedDBDataStore {
  constructor(
    private readonly testDatabase: GridDODatabase,
    onTransactionCheckpoint: CheckpointHook,
  ) {
    super(testDatabase, onTransactionCheckpoint);
  }

  async mutateAllSeven(): Promise<void> {
    await this.runTransactionCheckpointProbe(async (checkpoint) => {
      assertRealSevenStoreTransaction(this.testDatabase);
      await mutateAllSeven(this.testDatabase, checkpoint);
    });
  }
}

describe("real IndexedDB transaction fault harness", () => {
  it.each(CHECKPOINTS)(
    "rolls all seven stores back when %s throws",
    async (failAt) => {
      const database = await openTransactionTestDatabase();

      try {
        await seedSevenStores(database);
        const precondition = await snapshotSevenStores(database);
        const observedTransactions: string[][] = [];
        const store = new AtomicProbeStore(database, (checkpoint) => {
          observedTransactions.push(
            [...(Dexie.currentTransaction?.storeNames ?? [])].sort(),
          );
          if (checkpoint === failAt) {
            throw new InjectedCheckpointError(checkpoint);
          }
          return undefined;
        });

        await expect(store.mutateAllSeven()).rejects.toMatchObject({
          name: "InjectedCheckpointError",
          checkpoint: failAt,
        });

        expect(observedTransactions.length).toBeGreaterThan(0);
        for (const storeNames of observedTransactions) {
          expect(storeNames).toEqual([...TEST_TRANSACTION_STORE_NAMES].sort());
        }
        expect(await snapshotSevenStores(database)).toEqual(precondition);
      } finally {
        database.close();
      }
    },
  );

  it("asserts complete precondition, postcondition, and conflict snapshots", async () => {
    const database = await openTransactionTestDatabase();

    try {
      await seedSevenStores(database);
      const precondition = await snapshotSevenStores(database);
      const postcondition = expectedPostcondition(precondition);
      const store = new AtomicProbeStore(database, () => undefined);

      expect(
        classifyCompleteState(precondition, precondition, postcondition),
      ).toBe("precondition");

      await store.mutateAllSeven();
      const committed = await snapshotSevenStores(database);
      expect(committed).toEqual(postcondition);
      expect(
        classifyCompleteState(committed, precondition, postcondition),
      ).toBe("postcondition");

      const conflict = structuredClone(postcondition);
      conflict.bits[0]!.version += 1;
      expect(
        classifyCompleteState(conflict, precondition, postcondition),
      ).toBe("conflict");
    } finally {
      database.close();
    }
  });

  it("control exposes a partial conflict when the same sequence runs outside a transaction", async () => {
    const database = await openTransactionTestDatabase();

    try {
      await seedSevenStores(database);
      const precondition = await snapshotSevenStores(database);
      const postcondition = expectedPostcondition(precondition);

      await expect(
        mutateAllSeven(database, (checkpoint) => {
          if (checkpoint === CHECKPOINTS[0]) {
            throw new InjectedCheckpointError(checkpoint);
          }
          return undefined;
        }),
      ).rejects.toMatchObject({
        name: "InjectedCheckpointError",
        checkpoint: CHECKPOINTS[0],
      });

      const partial = await snapshotSevenStores(database);
      expect(partial.nodes[0]?.version).toBe(precondition.nodes[0]!.version + 1);
      expect(partial.bits).toEqual(precondition.bits);
      expect(
        classifyCompleteState(partial, precondition, postcondition),
      ).toBe("conflict");
    } finally {
      database.close();
    }
  });
});

async function mutateAllSeven(
  database: GridDODatabase,
  checkpoint: CheckpointHook,
): Promise<void> {
  const [node, bit, chunk, setting, breakdown, candidate] = await Promise.all([
    database.nodes.get(TRANSACTION_TEST_IDS.inboxNode),
    database.bits.get(TRANSACTION_TEST_IDS.scratchBit),
    database.chunks.get(TRANSACTION_TEST_IDS.chunk),
    database.settings.get("seed"),
    database.scratchBreakdowns.get(TRANSACTION_TEST_IDS.sourceBreakdown),
    database.stagedCandidates.get(TRANSACTION_TEST_IDS.stagedCandidate),
  ]);

  const [auditById, auditByCandidate] = await Promise.all([
    database.candidateOrphanAuditEvents.get(TRANSACTION_TEST_IDS.newAuditEvent),
    database.candidateOrphanAuditEvents
      .where("candidateId")
      .equals(TRANSACTION_TEST_IDS.newAuditedCandidate)
      .first(),
  ]);

  if (
    !node ||
    !bit ||
    !chunk ||
    !setting ||
    !breakdown ||
    !candidate ||
    auditById ||
    auditByCandidate
  ) {
    throw new Error("Seven-store probe fixture is incomplete");
  }

  await database.nodes.put({
    ...node,
    title: "Inbox updated",
    version: node.version + 1,
  });
  checkpoint("probe.after.nodes");

  await database.bits.put({
    ...bit,
    title: "Scratch updated",
    version: bit.version + 1,
  });
  checkpoint("probe.after.bits");

  await database.chunks.put({ ...chunk, title: "Chunk updated" });
  checkpoint("probe.after.chunks");

  await database.settings.put({
    ...setting,
    value: { enabled: false },
  });
  checkpoint("probe.after.settings");

  await database.scratchBreakdowns.put({
    ...breakdown,
    content: "Source updated",
    version: breakdown.version + 1,
  });
  checkpoint("probe.after.scratchBreakdowns");

  await database.stagedCandidates.put({
    ...candidate,
    updatedAt: 200,
    version: candidate.version + 1,
  });
  checkpoint("probe.after.stagedCandidates");

  await database.candidateOrphanAuditEvents.put(newAuditEvent());
  checkpoint("probe.after.candidateOrphanAuditEvents");
}

function expectedPostcondition(
  precondition: SevenStoreSnapshot,
): SevenStoreSnapshot {
  const postcondition = structuredClone(precondition);
  postcondition.nodes[0] = {
    ...postcondition.nodes[0]!,
    title: "Inbox updated",
    version: postcondition.nodes[0]!.version + 1,
  };
  postcondition.bits[0] = {
    ...postcondition.bits[0]!,
    title: "Scratch updated",
    version: postcondition.bits[0]!.version + 1,
  };
  postcondition.chunks[0] = {
    ...postcondition.chunks[0]!,
    title: "Chunk updated",
  };
  postcondition.settings[0] = {
    ...postcondition.settings[0]!,
    value: { enabled: false },
  };
  postcondition.scratchBreakdowns[0] = {
    ...postcondition.scratchBreakdowns[0]!,
    content: "Source updated",
    version: postcondition.scratchBreakdowns[0]!.version + 1,
  };
  postcondition.stagedCandidates[0] = {
    ...postcondition.stagedCandidates[0]!,
    updatedAt: 200,
    version: postcondition.stagedCandidates[0]!.version + 1,
  };
  postcondition.candidateOrphanAuditEvents.push(newAuditEvent());
  return postcondition;
}

function newAuditEvent(): CandidateOrphanAuditEvent {
  return {
    id: TRANSACTION_TEST_IDS.newAuditEvent,
    cause: "source_deleted",
    candidateId: TRANSACTION_TEST_IDS.newAuditedCandidate,
    sourceBreakdownId: TRANSACTION_TEST_IDS.newAuditedSource,
    scratchBitId: TRANSACTION_TEST_IDS.scratchBit,
    occurredAt: 200,
  };
}

function assertRealSevenStoreTransaction(database: GridDODatabase): void {
  const transaction = Dexie.currentTransaction;
  if (
    !transaction ||
    transaction.db !== database ||
    transaction.mode !== "readwrite"
  ) {
    throw new Error("Probe validation must run inside the real rw transaction");
  }
  expect([...transaction.storeNames].sort()).toEqual(
    [...TEST_TRANSACTION_STORE_NAMES].sort(),
  );
}
