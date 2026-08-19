import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  ConfirmedCandidateOrphanCleanupCommand,
  DataStore,
  StageCandidateCommand,
  UnstageCandidateCommand,
} from "@/lib/db/datastore";
import type {
  RepositoryOperationStatus,
  ScratchBreakdown,
  StagedCandidate,
} from "@/lib/db/schema";
import { useStagedCandidates } from "./use-staged-candidates";

const getDataStoreMock = vi.hoisted(() => vi.fn());
const liveQueryMock = vi.hoisted(() => vi.fn());
const candidateRows = vi.hoisted(() => [] as StagedCandidate[]);
const sourceRows = vi.hoisted(() => [] as ScratchBreakdown[]);

vi.mock("@/lib/db/datastore", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/db/datastore")>();
  return { ...original, getDataStore: getDataStoreMock };
});

vi.mock("@/lib/db/indexeddb", () => ({
  db: {
    stagedCandidates: {
      where: () => ({
        equals: (scratchBitId: string) => ({
          toArray: async () =>
            candidateRows.filter((row) => row.scratchBitId === scratchBitId),
        }),
      }),
    },
    scratchBreakdowns: {
      where: () => ({
        equals: (scratchBitId: string) => ({
          toArray: async () =>
            sourceRows.filter((row) => row.scratchBitId === scratchBitId),
        }),
      }),
    },
  },
}));

vi.mock("dexie", () => ({
  liveQuery: liveQueryMock,
}));

type LiveQueryObserver = {
  next: (value: unknown) => void;
  error: (error: unknown) => void;
};

type LiveQuerySubscription = {
  observer?: LiveQueryObserver;
  query: () => Promise<unknown>;
  unsubscribe: ReturnType<typeof vi.fn>;
};

const subscriptions: LiveQuerySubscription[] = [];

const IDS = {
  scratch: "00000000-0000-4000-8000-000000000131",
  otherScratch: "00000000-0000-4000-8000-000000000132",
  sourceNode: "00000000-0000-4000-8000-000000000133",
  sourceBit: "00000000-0000-4000-8000-000000000134",
  sourceMissing: "00000000-0000-4000-8000-000000000135",
  candidateNode: "00000000-0000-4000-8000-000000000136",
  candidateBit: "00000000-0000-4000-8000-000000000137",
  candidateMissing: "00000000-0000-4000-8000-000000000138",
  pendingCandidate: "00000000-0000-4000-8000-000000000139",
  operation: "00000000-0000-4000-8000-000000000140",
  audit: "00000000-0000-4000-8000-000000000141",
} as const;

function breakdown(
  id: string,
  content: string,
  overrides: Partial<ScratchBreakdown> = {},
): ScratchBreakdown {
  return {
    id,
    scratchBitId: IDS.scratch,
    content,
    order: 0,
    createdAt: 1,
    consumedAt: null,
    version: 2,
    ...overrides,
  };
}

function candidate(
  id: string,
  sourceBreakdownId: string,
  resultType: StagedCandidate["resultType"],
  overrides: Partial<StagedCandidate> = {},
): StagedCandidate {
  return {
    id,
    scratchBitId: IDS.scratch,
    sourceBreakdownId,
    resultType,
    lifecycle: "staged",
    createdAt: 2,
    updatedAt: 2,
    version: 1,
    ...overrides,
  };
}

function stageCommand(
  overrides: Partial<StageCandidateCommand> = {},
): StageCandidateCommand {
  return {
    operationId: IDS.operation,
    candidateId: IDS.pendingCandidate,
    scratchBitId: IDS.scratch,
    sourceBreakdownId: IDS.sourceNode,
    sourceExpectedVersion: 2,
    resultType: "node",
    ...overrides,
  };
}

function unstageCommand(): UnstageCandidateCommand {
  return {
    operationId: IDS.operation,
    candidateId: IDS.candidateNode,
    candidateExpectedVersion: 1,
    sourceBreakdownId: IDS.sourceNode,
    sourceExpectedVersion: 2,
  };
}

function orphanCommand(): ConfirmedCandidateOrphanCleanupCommand {
  return {
    operationId: IDS.operation,
    auditEventId: IDS.audit,
    candidateId: IDS.candidateMissing,
    candidateExpectedVersion: 1,
    sourceBreakdownId: IDS.sourceMissing,
    scratchBitId: IDS.scratch,
    resultType: "node",
    proof: {
      status: "confirmed",
      cause: "source_deleted",
      sourceBreakdownId: IDS.sourceMissing,
    },
  };
}

function createDataStore() {
  return {
    stageCandidate: vi.fn(),
    reconcileStageCandidate: vi.fn(),
    unstageCandidate: vi.fn(),
    reconcileUnstageCandidate: vi.fn(),
    cleanupConfirmedCandidateOrphan: vi.fn(),
    reconcileConfirmedCandidateOrphanCleanup: vi.fn(),
  } as unknown as DataStore & Record<
    | "stageCandidate"
    | "reconcileStageCandidate"
    | "unstageCandidate"
    | "reconcileUnstageCandidate"
    | "cleanupConfirmedCandidateOrphan"
    | "reconcileConfirmedCandidateOrphanCleanup",
    ReturnType<typeof vi.fn>
  >;
}

async function refreshSubscription(index = subscriptions.length - 1) {
  const subscription = subscriptions[index];
  if (!subscription?.observer) throw new Error("subscription not ready");
  const value = await subscription.query();
  act(() => subscription.observer?.next(value));
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe("useStagedCandidates", () => {
  let dataStore: ReturnType<typeof createDataStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    candidateRows.length = 0;
    sourceRows.length = 0;
    subscriptions.length = 0;
    dataStore = createDataStore();
    getDataStoreMock.mockResolvedValue(dataStore);
    liveQueryMock.mockImplementation((query: () => Promise<unknown>) => {
      const subscription: LiveQuerySubscription = {
        query,
        unsubscribe: vi.fn(),
      };
      subscriptions.push(subscription);
      return {
        subscribe: (observer: LiveQueryObserver) => {
          subscription.observer = observer;
          void query().then(observer.next).catch(observer.error);
          return { unsubscribe: subscription.unsubscribe };
        },
      };
    });
  });

  it("does not subscribe without a selected Scratch", () => {
    const { result } = renderHook(() => useStagedCandidates(null));

    expect(result.current.candidates).toEqual([]);
    expect(result.current.unresolvedCandidates).toEqual([]);
    expect(result.current.counts.authoritative).toBe(0);
    expect(result.current.eligibility.archiveCandidateClear).toBe(true);
    expect(liveQueryMock).not.toHaveBeenCalled();
  });

  it("reconstructs durable candidates on mount and refreshes labels from remote source edits", async () => {
    candidateRows.push(candidate(IDS.candidateNode, IDS.sourceNode, "node"));
    sourceRows.push(breakdown(IDS.sourceNode, "Original source text"));

    const first = renderHook(() => useStagedCandidates(IDS.scratch));
    await waitFor(() => {
      expect(first.result.current.candidates[0]?.content).toBe(
        "Original source text",
      );
    });
    first.unmount();

    const second = renderHook(() => useStagedCandidates(IDS.scratch));
    await waitFor(() => expect(second.result.current.candidates).toHaveLength(1));

    sourceRows[0] = breakdown(IDS.sourceNode, "Remote source text", { version: 3 });
    await refreshSubscription();

    expect(second.result.current.candidates[0]).toMatchObject({
      content: "Remote source text",
      source: { version: 3 },
    });
  });

  it("keeps a delayed source miss unresolved and never treats it as a renderable candidate or cleanup proof", async () => {
    candidateRows.push(candidate(IDS.candidateMissing, IDS.sourceMissing, "node"));

    const { result } = renderHook(() => useStagedCandidates(IDS.scratch));
    await waitFor(() => {
      expect(result.current.unresolvedCandidates).toHaveLength(1);
    });

    expect(result.current.candidates).toEqual([]);
    expect(result.current.counts).toMatchObject({
      authoritative: 1,
      renderable: 0,
    });
    expect(result.current.eligibility.archiveCandidateClear).toBe(false);
    expect(dataStore.cleanupConfirmedCandidateOrphan).not.toHaveBeenCalled();

    sourceRows.push(breakdown(IDS.sourceMissing, "Arrived later"));
    await refreshSubscription();

    expect(result.current.unresolvedCandidates).toEqual([]);
    expect(result.current.candidates[0]?.content).toBe("Arrived later");
    expect(dataStore.cleanupConfirmedCandidateOrphan).not.toHaveBeenCalled();
  });

  it("exposes authoritative, renderable, type, and staged-source eligibility inputs", async () => {
    candidateRows.push(
      candidate(IDS.candidateNode, IDS.sourceNode, "node", { createdAt: 4 }),
      candidate(IDS.candidateBit, IDS.sourceBit, "bit", { createdAt: 3 }),
      candidate(IDS.candidateMissing, IDS.sourceMissing, "node", { createdAt: 2 }),
    );
    sourceRows.push(
      breakdown(IDS.sourceNode, "Node source"),
      breakdown(IDS.sourceBit, "Bit source"),
    );

    const { result } = renderHook(() => useStagedCandidates(IDS.scratch));
    await waitFor(() => expect(result.current.counts.authoritative).toBe(3));

    expect(result.current.counts).toEqual({
      authoritative: 3,
      renderable: 2,
      nodes: 1,
      bits: 1,
      visibleNodes: 1,
      visibleBits: 1,
    });
    expect(result.current.eligibility.archiveCandidateClear).toBe(false);
    expect(result.current.eligibility.stagedSourceIds).toEqual(
      new Set([IDS.sourceNode, IDS.sourceBit, IDS.sourceMissing]),
    );
    expect(result.current.eligibility.isSourceStaged(IDS.sourceMissing)).toBe(true);
  });

  it.each<RepositoryOperationStatus>([
    "applied",
    "already_applied",
    "not_applied",
    "rejected",
    "conflict",
  ])("returns the authoritative Stage %s result without copying it into durable truth", async (status) => {
    const command = stageCommand();
    dataStore.stageCandidate.mockResolvedValue({
      operationId: command.operationId,
      status,
      candidate: null,
      source: null,
      scratch: null,
    });

    const { result } = renderHook(() => useStagedCandidates(IDS.scratch));
    let outcome: Awaited<ReturnType<typeof result.current.stageCandidate>> | undefined;
    await act(async () => {
      outcome = await result.current.stageCandidate(command);
    });

    expect(outcome).toMatchObject({ operationId: command.operationId, status });
    expect(dataStore.stageCandidate).toHaveBeenCalledWith(command);
    expect(result.current.candidates).toEqual([]);
    expect(result.current.pendingOperations).toEqual([]);
    expect(result.current.unknownOperations).toEqual([]);
  });

  it("projects pending Stage separately, then preserves an unknown identity until reconciliation is terminal", async () => {
    const command = stageCommand();
    const pending = deferred<never>();
    const reconciling = deferred<{
      operationId: string;
      status: "not_applied";
      candidate: null;
      source: ScratchBreakdown | undefined;
      scratch: null;
    }>();
    dataStore.stageCandidate.mockReturnValue(pending.promise);
    dataStore.reconcileStageCandidate.mockReturnValue(reconciling.promise);
    liveQueryMock.mockImplementationOnce((query: () => Promise<unknown>) => {
      const subscription: LiveQuerySubscription = {
        query,
        unsubscribe: vi.fn(),
      };
      subscriptions.push(subscription);
      return {
        subscribe: (observer: LiveQueryObserver) => {
          subscription.observer = observer;
          return { unsubscribe: subscription.unsubscribe };
        },
      };
    });

    const { result } = renderHook(() => useStagedCandidates(IDS.scratch));
    await waitFor(() => expect(subscriptions).toHaveLength(1));

    let dispatch!: Promise<unknown>;
    act(() => {
      dispatch = result.current.stageCandidate(command);
    });
    await waitFor(() => expect(result.current.pendingOperations).toHaveLength(1));
    expect(result.current.candidates).toEqual([]);
    expect(result.current.counts.visibleNodes).toBe(1);

    pending.reject(new Error("transport outcome unknown"));
    await act(async () => {
      await expect(dispatch).resolves.toEqual({
        operationId: command.operationId,
        outcome: "unknown",
      });
    });
    expect(result.current.pendingOperations).toEqual([]);
    expect(result.current.unknownOperations).toHaveLength(1);

    let reconciliation!: Promise<unknown>;
    act(() => {
      reconciliation = result.current.reconcileStageCandidate(command);
    });
    await waitFor(() =>
      expect(result.current.reconcilingOperations).toEqual([
        expect.objectContaining({
          kind: "stage",
          operationId: command.operationId,
          phase: "reconciling",
        }),
      ]),
    );
    reconciling.resolve({
      operationId: command.operationId,
      status: "not_applied",
      candidate: null,
      source: sourceRows[0],
      scratch: null,
    });
    await act(async () => {
      await expect(reconciliation).resolves.toMatchObject({
        status: "not_applied",
      });
    });
    expect(dataStore.reconcileStageCandidate).toHaveBeenCalledWith(command);
    expect(result.current.unknownOperations).toEqual([]);
    expect(result.current.reconcilingOperations).toEqual([]);
  });

  it("dispatches Unstage and exact confirmed-orphan commands through the repository", async () => {
    const unstage = unstageCommand();
    const cleanup = orphanCommand();
    dataStore.unstageCandidate.mockResolvedValue({
      operationId: unstage.operationId,
      status: "applied",
      candidate: null,
      source: null,
    });
    dataStore.cleanupConfirmedCandidateOrphan.mockResolvedValue({
      operationId: cleanup.operationId,
      status: "applied",
      candidate: null,
      source: null,
      auditEvent: { id: cleanup.auditEventId },
    });

    const { result } = renderHook(() => useStagedCandidates(IDS.scratch));
    await act(async () => {
      await expect(result.current.unstageCandidate(unstage)).resolves.toMatchObject({
        status: "applied",
      });
      await expect(
        result.current.cleanupConfirmedCandidateOrphan(cleanup),
      ).resolves.toMatchObject({ status: "applied" });
    });

    expect(dataStore.unstageCandidate).toHaveBeenCalledWith(unstage);
    expect(dataStore.cleanupConfirmedCandidateOrphan).toHaveBeenCalledWith(cleanup);
  });

  it("unsubscribes on Scratch change and unmount", async () => {
    const { rerender, unmount } = renderHook(
      ({ scratchBitId }) => useStagedCandidates(scratchBitId),
      { initialProps: { scratchBitId: IDS.scratch as string | null } },
    );
    await waitFor(() => expect(subscriptions).toHaveLength(1));

    rerender({ scratchBitId: IDS.otherScratch });
    await waitFor(() => expect(subscriptions).toHaveLength(2));
    expect(subscriptions[0]?.unsubscribe).toHaveBeenCalledTimes(1);

    unmount();
    expect(subscriptions[1]?.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
