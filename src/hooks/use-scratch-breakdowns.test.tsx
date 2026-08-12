import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AddBreakdownCommand,
  DataStore,
  DeleteBreakdownCommand,
} from "@/lib/db/datastore";
import type { ScratchBreakdown } from "@/lib/db/schema";
import type { CreatedAtSortDirection } from "@/stores/triage-preferences-store";
import { useScratchBreakdowns } from "./use-scratch-breakdowns";

const getDataStoreMock = vi.hoisted(() => vi.fn());
const liveQueryMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/datastore", () => ({
  getDataStore: getDataStoreMock,
}));

vi.mock("dexie", () => ({
  liveQuery: liveQueryMock,
}));

type BreakdownQueryResult = {
  scratchBitId: string;
  rows: ScratchBreakdown[];
  archiveEligible: boolean;
};

type LiveQueryObserver = {
  next: (value: BreakdownQueryResult) => void;
  error: (error: unknown) => void;
};

type LiveQuerySubscription = {
  observer?: LiveQueryObserver;
  query: () => Promise<BreakdownQueryResult>;
  unsubscribe: ReturnType<typeof vi.fn>;
};

const subscriptions: LiveQuerySubscription[] = [];

function createScratchBreakdown(
  overrides: Partial<ScratchBreakdown> = {},
): ScratchBreakdown {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    scratchBitId: overrides.scratchBitId ?? "scratch-bit-1",
    content: overrides.content ?? "breakdown content",
    order: overrides.order ?? 0,
    createdAt: overrides.createdAt ?? 1,
    consumedAt: overrides.consumedAt ?? null,
    version: overrides.version ?? 1,
  };
}

function createDataStore() {
  return {
    getScratchBreakdowns: vi.fn().mockResolvedValue([]),
    getScratchArchiveEligibility: vi.fn().mockResolvedValue({
      eligible: false,
      scratch: null,
      consumedCount: 0,
      unconsumedCount: 0,
      stagedCandidateCount: 0,
    }),
    addBreakdown: vi.fn(),
    reconcileAddBreakdown: vi.fn(),
    deleteBreakdown: vi.fn(),
    reconcileDeleteBreakdown: vi.fn(),
  } as unknown as DataStore & {
    getScratchBreakdowns: ReturnType<typeof vi.fn>;
    getScratchArchiveEligibility: ReturnType<typeof vi.fn>;
    addBreakdown: ReturnType<typeof vi.fn>;
    reconcileAddBreakdown: ReturnType<typeof vi.fn>;
    deleteBreakdown: ReturnType<typeof vi.fn>;
    reconcileDeleteBreakdown: ReturnType<typeof vi.fn>;
  };
}

function addCommand(): AddBreakdownCommand {
  return {
    operationId: "11111111-1111-4111-8111-111111111111",
    breakdownId: "22222222-2222-4222-8222-222222222222",
    scratchBitId: "33333333-3333-4333-8333-333333333333",
    scratchExpectedVersion: 4,
    content: "first note",
  };
}

function deleteCommand(): DeleteBreakdownCommand {
  return {
    operationId: "44444444-4444-4444-8444-444444444444",
    breakdownId: "55555555-5555-4555-8555-555555555555",
    expectedVersion: 2,
    scratchBitId: "33333333-3333-4333-8333-333333333333",
    scratchExpectedVersion: 4,
  };
}

function emitBreakdowns(
  value: ScratchBreakdown[],
  archiveEligible = false,
  scratchBitId = "scratch-1",
) {
  act(() => {
    subscriptions.at(-1)?.observer?.next({
      scratchBitId,
      rows: value,
      archiveEligible,
    });
  });
}

describe("useScratchBreakdowns", () => {
  let dataStore: ReturnType<typeof createDataStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    subscriptions.length = 0;
    dataStore = createDataStore();
    getDataStoreMock.mockResolvedValue(dataStore);
    liveQueryMock.mockImplementation(
      (query: () => Promise<BreakdownQueryResult>) => {
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
      },
    );
  });

  it("returns an empty list without subscribing when scratchBitId is null", () => {
    const { result } = renderHook(() => useScratchBreakdowns(null));

    expect(result.current.breakdowns).toEqual([]);
    expect(result.current.isArchiveEligible).toBe(false);
    expect(liveQueryMock).not.toHaveBeenCalled();
    expect(getDataStoreMock).not.toHaveBeenCalled();
  });

  it("subscribes to scratch breakdowns for the selected scratch bit", async () => {
    const rows = [
      createScratchBreakdown({
        id: "row-1",
        scratchBitId: "scratch-1",
        content: "first row",
      }),
    ];

    const { result } = renderHook(() => useScratchBreakdowns("scratch-1"));

    await waitFor(() => {
      expect(dataStore.getScratchBreakdowns).toHaveBeenCalledWith("scratch-1");
      expect(dataStore.getScratchArchiveEligibility).toHaveBeenCalledWith(
        "scratch-1",
      );
    });

    emitBreakdowns(rows);

    expect(liveQueryMock).toHaveBeenCalledTimes(1);
    expect(result.current.breakdowns).toEqual(rows);
  });

  it("dispatches the authoritative Add command and retains its terminal state slot", async () => {
    const command = addCommand();
    dataStore.addBreakdown.mockResolvedValue({
      operationId: command.operationId,
      status: "applied",
      breakdown: null,
      scratch: null,
    });
    const { result } = renderHook(() =>
      useScratchBreakdowns(command.scratchBitId),
    );

    await waitFor(() => {
      expect(dataStore.getScratchBreakdowns).toHaveBeenCalledWith(
        command.scratchBitId,
      );
    });

    await act(async () => {
      await expect(result.current.addBreakdown(command)).resolves.toMatchObject({
        status: "applied",
      });
    });

    expect(dataStore.addBreakdown).toHaveBeenCalledWith(command);
    expect(result.current.operations).toEqual([
      expect.objectContaining({
        kind: "add",
        operationId: command.operationId,
        phase: "terminal",
        status: "applied",
      }),
    ]);
  });

  it("preserves an unknown Add identity and reconciles without resending Add", async () => {
    const command = addCommand();
    dataStore.addBreakdown.mockRejectedValue(new Error("unknown transport outcome"));
    dataStore.reconcileAddBreakdown.mockResolvedValue({
      operationId: command.operationId,
      status: "not_applied",
      breakdown: null,
      scratch: null,
    });
    const { result } = renderHook(() =>
      useScratchBreakdowns(command.scratchBitId),
    );

    await act(async () => {
      await expect(result.current.addBreakdown(command)).resolves.toEqual({
        operationId: command.operationId,
        outcome: "unknown",
      });
    });
    expect(result.current.operations).toEqual([
      expect.objectContaining({ phase: "unknown", operationId: command.operationId }),
    ]);

    await act(async () => {
      await expect(
        result.current.reconcileAddBreakdown(command),
      ).resolves.toMatchObject({ status: "not_applied" });
    });

    expect(dataStore.addBreakdown).toHaveBeenCalledTimes(1);
    expect(dataStore.reconcileAddBreakdown).toHaveBeenCalledWith(command);
    expect(result.current.operations).toEqual([
      expect.objectContaining({ phase: "terminal", status: "not_applied" }),
    ]);
  });

  it("dispatches and reconciles the authoritative Delete command identity", async () => {
    const command = deleteCommand();
    dataStore.deleteBreakdown.mockRejectedValue(new Error("unknown transport outcome"));
    dataStore.reconcileDeleteBreakdown.mockResolvedValue({
      operationId: command.operationId,
      status: "applied",
      breakdown: null,
      candidate: null,
      scratch: null,
    });
    const { result } = renderHook(() => useScratchBreakdowns("scratch-1"));

    await act(async () => {
      await expect(result.current.deleteBreakdown(command)).resolves.toEqual({
        operationId: command.operationId,
        outcome: "unknown",
      });
      await expect(
        result.current.reconcileDeleteBreakdown(command),
      ).resolves.toMatchObject({ status: "applied" });
    });

    expect(dataStore.deleteBreakdown).toHaveBeenCalledWith(command);
    expect(dataStore.reconcileDeleteBreakdown).toHaveBeenCalledWith(command);
  });

  it("retains the Delete source snapshot when reactive truth disappears during an unknown outcome", async () => {
    const command = deleteCommand();
    const source = createScratchBreakdown({
      id: command.breakdownId,
      scratchBitId: command.scratchBitId,
      content: "Retained source",
      version: command.expectedVersion,
    });
    dataStore.deleteBreakdown.mockRejectedValue(
      new Error("commit may have applied before transport failed"),
    );
    const { result } = renderHook(() =>
      useScratchBreakdowns(command.scratchBitId),
    );
    emitBreakdowns([source], false, command.scratchBitId);

    await act(async () => {
      await expect(result.current.deleteBreakdown(command)).resolves.toEqual({
        operationId: command.operationId,
        outcome: "unknown",
      });
    });
    emitBreakdowns([], false, command.scratchBitId);

    expect(result.current.operations).toEqual([
      expect.objectContaining({
        kind: "delete",
        phase: "unknown",
        sourceSnapshot: source,
      }),
    ]);
    expect(result.current.breakdowns).toEqual([source]);
  });

  it.each([
    ["DESC", ["newer-low-order-a", "newer-low-order-b", "newer-high-order", "older"]],
    ["ASC", ["older", "newer-low-order-a", "newer-low-order-b", "newer-high-order"]],
  ] as const)(
    "sorts active rows by createdAt %s then order and stable id",
    (sort, expectedIds) => {
      const { result } = renderHook(() =>
        useScratchBreakdowns("scratch-1", sort as CreatedAtSortDirection),
      );
      emitBreakdowns([
        createScratchBreakdown({
          id: "newer-high-order",
          createdAt: 20,
          order: 2,
        }),
        createScratchBreakdown({ id: "older", createdAt: 10, order: 8 }),
        createScratchBreakdown({
          id: "newer-low-order-b",
          createdAt: 20,
          order: 1,
        }),
        createScratchBreakdown({
          id: "newer-low-order-a",
          createdAt: 20,
          order: 1,
        }),
      ]);

      expect(result.current.breakdowns.map(({ id }) => id)).toEqual(
        expectedIds,
      );
    },
  );

  it("removes consumed rows from the active projection while retaining completion evidence", () => {
    const { result } = renderHook(() =>
      useScratchBreakdowns("scratch-1", "DESC"),
    );

    emitBreakdowns([
      createScratchBreakdown({ id: "active", consumedAt: null }),
      createScratchBreakdown({ id: "consumed", consumedAt: 25 }),
    ]);

    expect(result.current.breakdowns.map(({ id }) => id)).toEqual(["active"]);
    expect(result.current.consumedBreakdownCount).toBe(1);
    expect(result.current.hasObservedBreakdownHistory).toBe(true);
  });

  it("distinguishes an observed all-deleted history from a never-used empty snapshot", () => {
    const { result } = renderHook(() =>
      useScratchBreakdowns("scratch-1", "DESC"),
    );

    emitBreakdowns([], false, "scratch-a");
    expect(result.current.hasObservedBreakdownHistory).toBe(false);

    emitBreakdowns([createScratchBreakdown({ id: "row-1" })]);
    emitBreakdowns([], false, "scratch-b");

    expect(result.current.breakdowns).toEqual([]);
    expect(result.current.consumedBreakdownCount).toBe(0);
    expect(result.current.hasObservedBreakdownHistory).toBe(true);
  });

  it("retains observed deletion history per Scratch across selection switches", () => {
    const { result, rerender } = renderHook(
      ({ scratchBitId }: { scratchBitId: string }) =>
        useScratchBreakdowns(scratchBitId, "DESC"),
      { initialProps: { scratchBitId: "scratch-a" } },
    );

    emitBreakdowns(
      [createScratchBreakdown({ id: "row-a", scratchBitId: "scratch-a" })],
      false,
      "scratch-a",
    );
    emitBreakdowns([], false, "scratch-a");
    expect(result.current.hasObservedBreakdownHistory).toBe(true);

    rerender({ scratchBitId: "scratch-b" });
    emitBreakdowns([]);
    expect(result.current.hasObservedBreakdownHistory).toBe(false);

    rerender({ scratchBitId: "scratch-a" });
    emitBreakdowns([]);
    expect(result.current.hasObservedBreakdownHistory).toBe(true);
  });

  it("fails completion closed until repository archive eligibility is authoritative", () => {
    const { result } = renderHook(() =>
      useScratchBreakdowns("scratch-1", "DESC"),
    );

    expect(result.current.isArchiveEligible).toBe(false);

    emitBreakdowns(
      [createScratchBreakdown({ id: "consumed", consumedAt: 25 })],
      true,
    );

    expect(result.current.isArchiveEligible).toBe(true);
  });
});
