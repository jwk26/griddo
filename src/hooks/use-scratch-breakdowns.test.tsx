import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DataStore } from "@/lib/db/datastore";
import type { ScratchBreakdown } from "@/lib/db/schema";
import { useScratchBreakdowns } from "./use-scratch-breakdowns";

const getDataStoreMock = vi.hoisted(() => vi.fn());
const liveQueryMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/datastore", () => ({
  getDataStore: getDataStoreMock,
}));

vi.mock("dexie", () => ({
  liveQuery: liveQueryMock,
}));

type LiveQueryObserver = {
  next: (value: ScratchBreakdown[]) => void;
  error: (error: unknown) => void;
};

type LiveQuerySubscription = {
  observer?: LiveQueryObserver;
  query: () => Promise<ScratchBreakdown[]>;
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
  };
}

function createDataStore() {
  return {
    getScratchBreakdowns: vi.fn().mockResolvedValue([]),
    createScratchBreakdown: vi.fn().mockResolvedValue(undefined),
    deleteScratchBreakdown: vi.fn().mockResolvedValue(undefined),
    deleteScratchBreakdownsByScratch: vi.fn().mockResolvedValue(undefined),
  } as unknown as DataStore & {
    getScratchBreakdowns: ReturnType<typeof vi.fn>;
    createScratchBreakdown: ReturnType<typeof vi.fn>;
    deleteScratchBreakdown: ReturnType<typeof vi.fn>;
    deleteScratchBreakdownsByScratch: ReturnType<typeof vi.fn>;
  };
}

function emitBreakdowns(value: ScratchBreakdown[]) {
  act(() => {
    subscriptions.at(-1)?.observer?.next(value);
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
      (query: () => Promise<ScratchBreakdown[]>) => {
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
});
