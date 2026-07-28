import { describe, expect, it } from "vitest";
import type {
  Bit,
  CandidateOrphanAuditEvent,
  Chunk,
  ScratchBreakdown,
  StagedCandidate,
} from "@/lib/db/schema";
import { IndexedDBDataStore } from "@/lib/db/indexeddb";
import {
  TRANSACTION_TEST_IDS,
  createSevenStoreSeed,
  openTransactionTestDatabase,
  seedSevenStores,
  snapshotSevenStores,
  transactionTestUuid,
} from "@/lib/db/indexeddb.test-utils";

const HARD_DELETE_BIT_CHECKPOINTS = [
  "aggregate-delete.after.stagedCandidates",
  "aggregate-delete.after.scratchBreakdowns",
  "aggregate-delete.after.chunks",
  "aggregate-delete.after.bits",
  "aggregate-delete.after.parentNodes",
] as const;

class InjectedAggregateDeleteError extends Error {
  constructor(public readonly checkpoint: string) {
    super(`Injected failure at ${checkpoint}`);
    this.name = "InjectedAggregateDeleteError";
  }
}

describe("Scratch aggregate hard delete", () => {
  it("deletes the complete planned aggregate without creating or deleting audit history", async () => {
    const database = await openTransactionTestDatabase();

    try {
      const seed = createAggregateSeed();
      await seedSevenStores(database, seed);
      const before = await snapshotSevenStores(database);
      const store = new IndexedDBDataStore(database);

      const result = await store.hardDeleteBit(
        TRANSACTION_TEST_IDS.scratchBit,
      );
      const after = await snapshotSevenStores(database);

      expect(result).toEqual({ status: "deleted" });
      expect(after.bits).toEqual(
        before.bits.filter(({ id }) => id === AGGREGATE_IDS.unrelatedScratch),
      );
      expect(after.chunks).toEqual(
        before.chunks.filter(({ id }) => id === AGGREGATE_IDS.unrelatedChunk),
      );
      expect(after.scratchBreakdowns).toEqual(
        before.scratchBreakdowns.filter(
          ({ id }) => id === AGGREGATE_IDS.unrelatedBreakdown,
        ),
      );
      expect(after.stagedCandidates).toEqual(
        before.stagedCandidates.filter(
          ({ id }) => id === AGGREGATE_IDS.unrelatedCandidate,
        ),
      );
      expect(after.candidateOrphanAuditEvents).toEqual(
        before.candidateOrphanAuditEvents,
      );
      expect(after.settings).toEqual(before.settings);
      expect(after.nodes[0]).toMatchObject({
        id: TRANSACTION_TEST_IDS.inboxNode,
        version: before.nodes[0]!.version,
      });
    } finally {
      database.close();
    }
  });

  it("returns integrity_cleanup_required and writes nothing when a targeted candidate already lacks its source", async () => {
    const database = await openTransactionTestDatabase();

    try {
      const seed = createAggregateSeed();
      seed.stagedCandidates[0] = {
        ...seed.stagedCandidates[0]!,
        sourceBreakdownId: AGGREGATE_IDS.missingBreakdown,
      };
      await seedSevenStores(database, seed);
      const before = await snapshotSevenStores(database);
      const store = new IndexedDBDataStore(database);

      const result = await store.hardDeleteBit(
        TRANSACTION_TEST_IDS.scratchBit,
      );

      expect(result).toEqual({
        status: "integrity_cleanup_required",
        candidates: [seed.stagedCandidates[0]],
      });
      expect(await snapshotSevenStores(database)).toEqual(before);
    } finally {
      database.close();
    }
  });

  it("ignores an unrelated pre-existing orphan while preserving it byte-for-byte", async () => {
    const database = await openTransactionTestDatabase();

    try {
      const seed = createAggregateSeed();
      seed.stagedCandidates[1] = {
        ...seed.stagedCandidates[1]!,
        sourceBreakdownId: AGGREGATE_IDS.missingBreakdown,
      };
      await seedSevenStores(database, seed);
      const before = await snapshotSevenStores(database);
      const store = new IndexedDBDataStore(database);

      const result = await store.hardDeleteBit(
        TRANSACTION_TEST_IDS.scratchBit,
      );
      const after = await snapshotSevenStores(database);

      expect(result).toEqual({ status: "deleted" });
      expect(after.stagedCandidates).toEqual(
        before.stagedCandidates.filter(
          ({ id }) => id === AGGREGATE_IDS.unrelatedCandidate,
        ),
      );
    } finally {
      database.close();
    }
  });

  it.each(HARD_DELETE_BIT_CHECKPOINTS)(
    "rolls the actual hardDeleteBit path back when %s throws",
    async (failAt) => {
      const database = await openTransactionTestDatabase();

      try {
        await seedSevenStores(database, createAggregateSeed());
        const before = await snapshotSevenStores(database);
        const store = new IndexedDBDataStore(database, (checkpoint) => {
          if (checkpoint === failAt) {
            throw new InjectedAggregateDeleteError(checkpoint);
          }
          return undefined;
        });

        await expect(
          store.hardDeleteBit(TRANSACTION_TEST_IDS.scratchBit),
        ).rejects.toMatchObject({
          name: "InjectedAggregateDeleteError",
          checkpoint: failAt,
        });
        expect(await snapshotSevenStores(database)).toEqual(before);
      } finally {
        database.close();
      }
    },
  );
});

const AGGREGATE_IDS = {
  unrelatedScratch: transactionTestUuid(101),
  unrelatedChunk: transactionTestUuid(102),
  unrelatedBreakdown: transactionTestUuid(103),
  unrelatedCandidate: transactionTestUuid(104),
  unrelatedAudit: transactionTestUuid(105),
  unrelatedAuditedCandidate: transactionTestUuid(106),
  missingBreakdown: transactionTestUuid(107),
} as const;

function createAggregateSeed() {
  const seed = createSevenStoreSeed();
  const unrelatedScratch: Bit = {
    ...seed.bits[0]!,
    id: AGGREGATE_IDS.unrelatedScratch,
    title: "Unrelated Scratch",
    createdAt: 110,
    mtime: 110,
  };
  const unrelatedChunk: Chunk = {
    ...seed.chunks[0]!,
    id: AGGREGATE_IDS.unrelatedChunk,
    parentId: unrelatedScratch.id,
    title: "Unrelated chunk",
  };
  const unrelatedBreakdown: ScratchBreakdown = {
    ...seed.scratchBreakdowns[0]!,
    id: AGGREGATE_IDS.unrelatedBreakdown,
    scratchBitId: unrelatedScratch.id,
    content: "Unrelated source",
    createdAt: 110,
  };
  const unrelatedCandidate: StagedCandidate = {
    ...seed.stagedCandidates[0]!,
    id: AGGREGATE_IDS.unrelatedCandidate,
    scratchBitId: unrelatedScratch.id,
    sourceBreakdownId: unrelatedBreakdown.id,
    createdAt: 110,
    updatedAt: 110,
  };
  const unrelatedAudit: CandidateOrphanAuditEvent = {
    ...seed.candidateOrphanAuditEvents[0]!,
    id: AGGREGATE_IDS.unrelatedAudit,
    candidateId: AGGREGATE_IDS.unrelatedAuditedCandidate,
    sourceBreakdownId: unrelatedBreakdown.id,
    scratchBitId: unrelatedScratch.id,
    occurredAt: 110,
  };

  seed.bits.push(unrelatedScratch);
  seed.chunks.push(unrelatedChunk);
  seed.scratchBreakdowns.push(unrelatedBreakdown);
  seed.stagedCandidates.push(unrelatedCandidate);
  seed.candidateOrphanAuditEvents.push(unrelatedAudit);
  return seed;
}
