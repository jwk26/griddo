import { describe, expect, it } from "vitest";
import type {
  DirectPlacementCommand,
  PlacementResult,
  StagedPlacementCommand,
} from "@/lib/db/datastore";
import type { Bit, Node } from "@/lib/db/schema";
import { bitSchema, nodeSchema } from "@/lib/db/schema";
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

type PlacementType = "node" | "bit";
type PlacementStore = {
  placeStagedCandidate(command: StagedPlacementCommand): Promise<PlacementResult>;
  reconcileStagedPlacement(command: StagedPlacementCommand): Promise<PlacementResult>;
  placeDirectBreakdown(command: DirectPlacementCommand): Promise<PlacementResult>;
  reconcileDirectPlacement(command: DirectPlacementCommand): Promise<PlacementResult>;
};

type CheckpointHook = (name: string) => undefined;

const IDS = {
  operation: transactionTestUuid(12301),
  result: transactionTestUuid(12302),
  targetRoot: transactionTestUuid(12303),
  targetChild: transactionTestUuid(12304),
  targetMid: transactionTestUuid(12307),
  occupant: transactionTestUuid(12305),
  otherCandidate: transactionTestUuid(12306),
} as const;

describe("authoritative Inbox/Triage placement", () => {
  it.each([
    ["staged Node", true, "node"],
    ["staged Bit", true, "bit"],
    ["direct Node", false, "node"],
    ["direct Bit", false, "bit"],
  ] as const)(
    "%s creates one stable, fully parsed result with placement defaults and the complete postcondition",
    async (_label, staged, resultType) => {
      await withPlacementStore(
        (seed) => configurePlacementSeed(seed, { staged, resultType }),
        async (database, store) => {
          const command = placementCommand({ staged, resultType });
          const reconcile = staged
            ? () => store.reconcileStagedPlacement(command as StagedPlacementCommand)
            : () => store.reconcileDirectPlacement(command);
          const execute = staged
            ? () => store.placeStagedCandidate(command as StagedPlacementCommand)
            : () => store.placeDirectBreakdown(command);

          await expect(reconcile()).resolves.toMatchObject({
            operationId: command.operationId,
            status: "not_applied",
            result: null,
            source: {
              id: command.sourceBreakdownId,
              consumedAt: null,
              version: command.sourceExpectedVersion,
            },
            candidate: staged
              ? {
                  id: (command as StagedPlacementCommand).candidateId,
                  version: (command as StagedPlacementCommand).candidateExpectedVersion,
                }
              : null,
          });

          const applied = await execute();
          expect(applied).toMatchObject({
            operationId: command.operationId,
            status: "applied",
            result: {
              id: command.resultId,
              title: command.title,
              parentId: command.targetParentId,
              x: command.x,
              y: command.y,
              version: 1,
              pastDeadlineDismissed: false,
              deletedAt: null,
              archivedAt: null,
            },
            source: {
              id: command.sourceBreakdownId,
              version: command.sourceExpectedVersion + 1,
            },
            candidate: null,
          });
          expect(applied.result).not.toBeNull();
          expect(applied.source?.consumedAt).toBe(applied.result?.createdAt);
          if (resultType === "node") {
            expect(nodeSchema.parse(applied.result)).toEqual(applied.result);
          } else {
            expect(bitSchema.parse(applied.result)).toEqual(applied.result);
            const target = await database.nodes.get(command.targetParentId!);
            expect(target?.mtime).toBe(applied.result?.createdAt);
          }

          const committed = await snapshotSevenStores(database);
          await expect(execute()).resolves.toMatchObject({ status: "already_applied" });
          await expect(reconcile()).resolves.toMatchObject({ status: "already_applied" });
          expect(await snapshotSevenStores(database)).toEqual(committed);
          expect(committed.stagedCandidates).toEqual([]);
        },
      );
    },
  );

  it.each([
    ["source version changed", (seed: SevenStoreSnapshot) => {
      seed.scratchBreakdowns[0] = { ...seed.scratchBreakdowns[0]!, version: 3 };
    }, "conflict"],
    ["source was consumed", (seed: SevenStoreSnapshot) => {
      seed.scratchBreakdowns[0] = { ...seed.scratchBreakdowns[0]!, consumedAt: 200 };
    }, "rejected"],
    ["Scratch was archived", (seed: SevenStoreSnapshot) => {
      seed.bits[0] = { ...seed.bits[0]!, archivedAt: 200 };
    }, "rejected"],
    ["target moved to a different path", (seed: SevenStoreSnapshot) => {
      const target = seed.nodes.find(({ id }) => id === IDS.targetRoot)!;
      target.parentId = TRANSACTION_TEST_IDS.inboxNode;
      target.level = 1;
    }, "rejected"],
    ["target was archived", (seed: SevenStoreSnapshot) => {
      const target = seed.nodes.find(({ id }) => id === IDS.targetRoot)!;
      target.archivedAt = 200;
    }, "rejected"],
    ["exact cell became occupied", (seed: SevenStoreSnapshot) => {
      seed.bits.push(makeBit({ id: IDS.occupant, parentId: IDS.targetRoot, x: 2, y: 3 }));
    }, "rejected"],
  ] as const)("%s writes nothing", async (_label, mutate, status) => {
    await withPlacementStore((seed) => {
      configurePlacementSeed(seed, { staged: true, resultType: "bit" });
      mutate(seed);
    }, async (database, store) => {
      const before = await snapshotSevenStores(database);
      await expect(store.placeStagedCandidate(stagedCommand())).resolves.toMatchObject({ status });
      expect(await snapshotSevenStores(database)).toEqual(before);
    });
  });

  it.each([
    ["a Node at Home with a nonempty ancestor path", directCommand({
      resultType: "node",
      title: "Home Node",
      targetParentId: null,
      expectedAncestorIds: [IDS.targetRoot],
    })],
    ["a Bit at Home", directCommand({
      resultType: "bit",
      title: "Home Bit",
      targetParentId: null,
      expectedAncestorIds: [],
    })],
    ["a Node below a level-2 target", directCommand({
      resultType: "node",
      title: "Too deep",
      targetParentId: IDS.targetChild,
      expectedAncestorIds: [IDS.targetRoot, IDS.targetMid, IDS.targetChild],
    })],
    ["a direct Node title above 100 characters", directCommand({ resultType: "node", title: "n".repeat(101) })],
    ["a direct Bit title above 200 characters", directCommand({ resultType: "bit", title: "b".repeat(201) })],
  ] as const)("rejects %s without truncation, heuristic conversion, or alternate target", async (_label, command) => {
    await withPlacementStore((seed) => {
      configurePlacementSeed(seed, {
        staged: false,
        resultType: command.resultType,
      });
      seed.scratchBreakdowns[0] = {
        ...seed.scratchBreakdowns[0]!,
        content: command.title,
      };
    }, async (database, store) => {
      const before = await snapshotSevenStores(database);
      await expect(store.placeDirectBreakdown(command)).resolves.toMatchObject({ status: "rejected" });
      expect(await snapshotSevenStores(database)).toEqual(before);
    });
  });

  it("rejects direct placement when any candidate owns the source", async () => {
    await withPlacementStore((seed) => configurePlacementSeed(seed, {
      staged: true,
      resultType: "bit",
    }), async (database, store) => {
      const before = await snapshotSevenStores(database);
      await expect(store.placeDirectBreakdown(directCommand({ resultType: "bit" })))
        .resolves.toMatchObject({ status: "rejected", candidate: { id: TRANSACTION_TEST_IDS.stagedCandidate } });
      expect(await snapshotSevenStores(database)).toEqual(before);
    });
  });

  it.each([
    "inbox.place-staged.after.result",
    "inbox.place-staged.after.source",
    "inbox.place-staged.after.candidate",
  ])("rolls staged placement back at %s", async (checkpoint) => {
    await withPlacementStore(
      (seed) => configurePlacementSeed(seed, { staged: true, resultType: "bit" }),
      async (database, store) => {
        const before = await snapshotSevenStores(database);
        await expect(store.placeStagedCandidate(stagedCommand())).rejects.toThrow(checkpoint);
        expect(await snapshotSevenStores(database)).toEqual(before);
      },
      failAt(checkpoint),
    );
  });

  it.each([
    "inbox.place-direct.after.result",
    "inbox.place-direct.after.source",
  ])("rolls direct placement back at %s", async (checkpoint) => {
    await withPlacementStore(
      (seed) => configurePlacementSeed(seed, { staged: false, resultType: "bit" }),
      async (database, store) => {
        const before = await snapshotSevenStores(database);
        await expect(store.placeDirectBreakdown(directCommand({ resultType: "bit" })))
          .rejects.toThrow(checkpoint);
        expect(await snapshotSevenStores(database)).toEqual(before);
      },
      failAt(checkpoint),
    );
  });

  it("classifies every partial staged postcondition as conflict and never compensates", async () => {
    await withPlacementStore((seed) => {
      configurePlacementSeed(seed, { staged: true, resultType: "bit" });
      seed.stagedCandidates = [];
    }, async (database, store) => {
      const before = await snapshotSevenStores(database);
      await expect(store.reconcileStagedPlacement(stagedCommand())).resolves.toMatchObject({
        status: "conflict",
      });
      expect(await snapshotSevenStores(database)).toEqual(before);
    });
  });

  it("recognizes the complete committed postcondition by stable result/source IDs after the target path later changes", async () => {
    await withPlacementStore(
      (seed) => configurePlacementSeed(seed, { staged: false, resultType: "bit" }),
      async (database, store) => {
        const command = directCommand({ resultType: "bit" });
        await expect(store.placeDirectBreakdown(command)).resolves.toMatchObject({
          status: "applied",
        });
        const target = await database.nodes.get(IDS.targetRoot);
        await database.nodes.put({
          ...target!,
          parentId: TRANSACTION_TEST_IDS.inboxNode,
          level: 1,
          version: target!.version + 1,
        });
        const committedAfterMove = await snapshotSevenStores(database);

        await expect(store.reconcileDirectPlacement(command)).resolves.toMatchObject({
          status: "already_applied",
        });
        expect(await snapshotSevenStores(database)).toEqual(committedAfterMove);
      },
    );
  });

  it("does not recompute a committed Node result level from a later target move", async () => {
    await withPlacementStore(
      (seed) => configurePlacementSeed(seed, { staged: true, resultType: "node" }),
      async (database, store) => {
        const command = stagedCommand({
          resultType: "node",
          title: "Placed Node",
          targetParentId: IDS.targetRoot,
          expectedAncestorIds: [IDS.targetRoot],
        });
        await expect(store.placeStagedCandidate(command)).resolves.toMatchObject({
          status: "applied",
          result: { level: 1 },
        });
        const target = await database.nodes.get(IDS.targetRoot);
        await database.nodes.put({
          ...target!,
          parentId: TRANSACTION_TEST_IDS.inboxNode,
          level: 1,
          version: target!.version + 1,
        });

        await expect(store.reconcileStagedPlacement(command)).resolves.toMatchObject({
          status: "already_applied",
          result: { level: 1 },
        });
      },
    );
  });
});

function placementCommand(options: { staged: boolean; resultType: PlacementType }): DirectPlacementCommand | StagedPlacementCommand {
  const command = options.staged
    ? stagedCommand({ resultType: options.resultType })
    : directCommand({ resultType: options.resultType });
  if (options.resultType === "node") {
    return {
      ...command,
      title: options.staged ? "Placed Node" : "Existing source",
      targetParentId: null,
      expectedAncestorIds: [],
    };
  }
  return command;
}

function stagedCommand(overrides: Partial<StagedPlacementCommand> = {}): StagedPlacementCommand {
  return {
    ...directCommand(),
    candidateId: TRANSACTION_TEST_IDS.stagedCandidate,
    candidateExpectedVersion: 2,
    ...overrides,
  };
}

function directCommand(overrides: Partial<DirectPlacementCommand> = {}): DirectPlacementCommand {
  return {
    operationId: IDS.operation,
    resultId: IDS.result,
    scratchBitId: TRANSACTION_TEST_IDS.scratchBit,
    sourceBreakdownId: TRANSACTION_TEST_IDS.sourceBreakdown,
    sourceExpectedVersion: 2,
    resultType: "bit",
    title: "Existing source",
    targetParentId: IDS.targetRoot,
    expectedAncestorIds: [IDS.targetRoot],
    x: 2,
    y: 3,
    ...overrides,
  };
}

function configurePlacementSeed(
  seed: SevenStoreSnapshot,
  options: { staged: boolean; resultType: PlacementType },
): void {
  seed.nodes.push(
    makeNode({ id: IDS.targetRoot, title: "Target", x: 1, y: 0 }),
    makeNode({ id: IDS.targetMid, title: "Middle", parentId: IDS.targetRoot, level: 1, x: 1, y: 1 }),
    makeNode({ id: IDS.targetChild, title: "Deep target", parentId: IDS.targetMid, level: 2, x: 1, y: 2 }),
  );
  seed.stagedCandidates = options.staged
    ? [{ ...seed.stagedCandidates[0]!, resultType: options.resultType }]
    : [];
}

function makeNode(overrides: Partial<Node>): Node {
  return nodeSchema.parse({
    id: transactionTestUuid(12350),
    title: "Node",
    color: "hsl(210, 80%, 55%)",
    icon: "Folder",
    deadline: null,
    deadlineAllDay: false,
    mtime: 100,
    createdAt: 100,
    version: 1,
    parentId: null,
    level: 0,
    x: 0,
    y: 0,
    deletedAt: null,
    archivedAt: null,
    systemRole: null,
    hiddenFromGrid: false,
    pastDeadlineDismissed: false,
    ...overrides,
  });
}

function makeBit(overrides: Partial<Bit>): Bit {
  return bitSchema.parse({
    id: transactionTestUuid(12351),
    title: "Bit",
    description: "",
    icon: "ListTodo",
    deadline: null,
    deadlineAllDay: false,
    priority: null,
    status: "active",
    mtime: 100,
    createdAt: 100,
    version: 1,
    parentId: IDS.targetRoot,
    x: 0,
    y: 0,
    deletedAt: null,
    archivedAt: null,
    pastDeadlineDismissed: false,
    ...overrides,
  });
}

function failAt(expectedCheckpoint: string): CheckpointHook {
  return (checkpoint) => {
    if (checkpoint === expectedCheckpoint) throw new Error(checkpoint);
    return undefined;
  };
}

async function withPlacementStore(
  configureSeed: (seed: SevenStoreSnapshot) => void,
  run: (database: Awaited<ReturnType<typeof openTransactionTestDatabase>>, store: PlacementStore) => Promise<void>,
  onCheckpoint?: CheckpointHook,
): Promise<void> {
  const database = await openTransactionTestDatabase();
  try {
    const seed = createSevenStoreSeed();
    configureSeed(seed);
    await seedSevenStores(database, seed);
    const store = new IndexedDBDataStore(database, onCheckpoint) as unknown as PlacementStore;
    await run(database, store);
  } finally {
    database.close();
  }
}
