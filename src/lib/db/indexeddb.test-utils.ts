import { isDeepStrictEqual } from "node:util";
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import type {
  Bit,
  CandidateOrphanAuditEvent,
  Chunk,
  Node,
  ScratchBreakdown,
  StagedCandidate,
} from "@/lib/db/schema";
import { GridDODatabase } from "@/lib/db/indexeddb";

export const TEST_TRANSACTION_STORE_NAMES = [
  "nodes",
  "bits",
  "chunks",
  "settings",
  "scratchBreakdowns",
  "stagedCandidates",
  "candidateOrphanAuditEvents",
] as const;

export const TRANSACTION_TEST_IDS = {
  inboxNode: transactionTestUuid(1),
  scratchBit: transactionTestUuid(2),
  chunk: transactionTestUuid(3),
  sourceBreakdown: transactionTestUuid(4),
  stagedCandidate: transactionTestUuid(5),
  auditEvent: transactionTestUuid(6),
  auditedCandidate: transactionTestUuid(7),
  auditedSource: transactionTestUuid(8),
  newAuditEvent: transactionTestUuid(9),
  newAuditedCandidate: transactionTestUuid(10),
  newAuditedSource: transactionTestUuid(11),
} as const;

export function transactionTestUuid(sequence: number): string {
  if (
    !Number.isSafeInteger(sequence) ||
    sequence < 0 ||
    sequence > 0xffffffffffff
  ) {
    throw new Error(`Invalid transaction-test UUID sequence: ${sequence}`);
  }

  return `00000000-0000-4000-8000-${sequence.toString(16).padStart(12, "0")}`;
}

type SettingRow = { key: string; value: unknown };

export type SevenStoreSnapshot = {
  nodes: Node[];
  bits: Bit[];
  chunks: Chunk[];
  settings: SettingRow[];
  scratchBreakdowns: ScratchBreakdown[];
  stagedCandidates: StagedCandidate[];
  candidateOrphanAuditEvents: CandidateOrphanAuditEvent[];
};

export type CompleteStateClassification =
  | "precondition"
  | "postcondition"
  | "conflict";

export async function openTransactionTestDatabase(): Promise<GridDODatabase> {
  const database = new GridDODatabase({
    indexedDB: new IDBFactory(),
    IDBKeyRange,
  });
  await database.open();
  return database;
}

export function createSevenStoreSeed(): SevenStoreSnapshot {
  const node: Node = {
    id: TRANSACTION_TEST_IDS.inboxNode,
    title: "Inbox",
    color: "hsl(221, 83%, 53%)",
    icon: "inbox",
    deadline: null,
    deadlineAllDay: false,
    mtime: 100,
    createdAt: 100,
    version: 3,
    parentId: null,
    level: 0,
    x: 0,
    y: 0,
    deletedAt: null,
    archivedAt: null,
    systemRole: "inbox",
    hiddenFromGrid: false,
    pastDeadlineDismissed: false,
  };
  const bit: Bit = {
    id: TRANSACTION_TEST_IDS.scratchBit,
    title: "Scratch",
    description: "",
    icon: "circle",
    deadline: null,
    deadlineAllDay: false,
    priority: null,
    status: "active",
    mtime: 100,
    createdAt: 100,
    version: 4,
    parentId: node.id,
    x: 0,
    y: 0,
    deletedAt: null,
    archivedAt: null,
    pastDeadlineDismissed: false,
  };
  const chunk: Chunk = {
    id: TRANSACTION_TEST_IDS.chunk,
    title: "Existing chunk",
    description: "",
    time: null,
    timeAllDay: false,
    status: "incomplete",
    order: 0,
    parentId: bit.id,
  };
  const source: ScratchBreakdown = {
    id: TRANSACTION_TEST_IDS.sourceBreakdown,
    scratchBitId: bit.id,
    content: "Existing source",
    order: 0,
    createdAt: 100,
    consumedAt: null,
    version: 2,
  };
  const candidate: StagedCandidate = {
    id: TRANSACTION_TEST_IDS.stagedCandidate,
    scratchBitId: bit.id,
    sourceBreakdownId: source.id,
    resultType: "bit",
    lifecycle: "staged",
    createdAt: 100,
    updatedAt: 100,
    version: 2,
  };
  const auditEvent: CandidateOrphanAuditEvent = {
    id: TRANSACTION_TEST_IDS.auditEvent,
    cause: "source_deleted",
    candidateId: TRANSACTION_TEST_IDS.auditedCandidate,
    sourceBreakdownId: TRANSACTION_TEST_IDS.auditedSource,
    scratchBitId: bit.id,
    occurredAt: 100,
  };

  return {
    nodes: [node],
    bits: [bit],
    chunks: [chunk],
    settings: [{ key: "seed", value: { enabled: true } }],
    scratchBreakdowns: [source],
    stagedCandidates: [candidate],
    candidateOrphanAuditEvents: [auditEvent],
  };
}

export async function seedSevenStores(
  database: GridDODatabase,
  seed: SevenStoreSnapshot = createSevenStoreSeed(),
): Promise<void> {
  await database.nodes.bulkPut(seed.nodes);
  await database.bits.bulkPut(seed.bits);
  await database.chunks.bulkPut(seed.chunks);
  await database.settings.bulkPut(seed.settings);
  await database.scratchBreakdowns.bulkPut(seed.scratchBreakdowns);
  await database.stagedCandidates.bulkPut(seed.stagedCandidates);
  await database.candidateOrphanAuditEvents.bulkPut(
    seed.candidateOrphanAuditEvents,
  );
}

export async function snapshotSevenStores(
  database: GridDODatabase,
): Promise<SevenStoreSnapshot> {
  return database.transaction(
    "r",
    [
      database.nodes,
      database.bits,
      database.chunks,
      database.settings,
      database.scratchBreakdowns,
      database.stagedCandidates,
      database.candidateOrphanAuditEvents,
    ],
    async () => {
      const [
        nodes,
        bits,
        chunks,
        settings,
        scratchBreakdowns,
        stagedCandidates,
        candidateOrphanAuditEvents,
      ] = await Promise.all([
        database.nodes.toArray(),
        database.bits.toArray(),
        database.chunks.toArray(),
        database.settings.toArray(),
        database.scratchBreakdowns.toArray(),
        database.stagedCandidates.toArray(),
        database.candidateOrphanAuditEvents.toArray(),
      ]);

      return {
        nodes: sortBy(nodes, "id"),
        bits: sortBy(bits, "id"),
        chunks: sortBy(chunks, "id"),
        settings: sortBy(settings, "key"),
        scratchBreakdowns: sortBy(scratchBreakdowns, "id"),
        stagedCandidates: sortBy(stagedCandidates, "id"),
        candidateOrphanAuditEvents: sortBy(candidateOrphanAuditEvents, "id"),
      };
    },
  );
}

export function classifyCompleteState(
  current: SevenStoreSnapshot,
  precondition: SevenStoreSnapshot,
  postcondition: SevenStoreSnapshot,
): CompleteStateClassification {
  if (isDeepStrictEqual(current, precondition)) {
    return "precondition";
  }
  if (isDeepStrictEqual(current, postcondition)) {
    return "postcondition";
  }
  return "conflict";
}

function sortBy<T, K extends keyof T>(rows: T[], key: K): T[] {
  return [...rows].sort((left, right) =>
    String(left[key]).localeCompare(String(right[key])),
  );
}
