import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DataStore } from "@/lib/db/datastore";
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
    createScratchBreakdown: vi.fn().mockResolvedValue(undefined),
    deleteScratchBreakdown: vi.fn().mockResolvedValue(undefined),
    deleteScratchBreakdownsByScratch: vi.fn().mockResolvedValue(undefined),
  } as unknown as DataStore & {
    getScratchBreakdowns: ReturnType<typeof vi.fn>;
    getScratchArchiveEligibility: ReturnType<typeof vi.fn>;
    createScratchBreakdown: ReturnType<typeof vi.fn>;
    deleteScratchBreakdown: ReturnType<typeof vi.fn>;
    deleteScratchBreakdownsByScratch: ReturnType<typeof vi.fn>;
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

  it("creates the first breakdown at order zero", async () => {
    const { result } = renderHook(() => useScratchBreakdowns("scratch-1"));

    await waitFor(() => {
      expect(dataStore.getScratchBreakdowns).toHaveBeenCalledWith("scratch-1");
    });

    await act(async () => {
      await result.current.createBreakdown("first note");
    });

    expect(dataStore.createScratchBreakdown).toHaveBeenCalledWith({
      scratchBitId: "scratch-1",
      content: "first note",
      order: 0,
    });
  });

  it("creates the next breakdown after the current max order", async () => {
    const rows = [
      createScratchBreakdown({ id: "row-1", order: 0 }),
      createScratchBreakdown({ id: "row-2", order: 2 }),
    ];
    const { result } = renderHook(() => useScratchBreakdowns("scratch-1"));

    await waitFor(() => {
      expect(dataStore.getScratchBreakdowns).toHaveBeenCalledWith("scratch-1");
    });
    emitBreakdowns(rows);

    await act(async () => {
      await result.current.createBreakdown("third note");
    });

    expect(dataStore.createScratchBreakdown).toHaveBeenCalledWith({
      scratchBitId: "scratch-1",
      content: "third note",
      order: 3,
    });
  });

  it("deletes a single breakdown by id", async () => {
    const { result } = renderHook(() => useScratchBreakdowns("scratch-1"));

    await act(async () => {
      await result.current.deleteBreakdown("row-2");
    });

    expect(dataStore.deleteScratchBreakdown).toHaveBeenCalledWith("row-2");
    expect(dataStore.deleteScratchBreakdownsByScratch).not.toHaveBeenCalled();
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
