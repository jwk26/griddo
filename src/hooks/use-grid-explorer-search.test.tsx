import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DataStore } from "@/lib/db/datastore";
import {
  searchGridExplorer,
  type GridExplorerSearchRunner,
} from "@/lib/utils/grid-explorer-search";
import type { Bit, Node } from "@/types";
import { useGridExplorerSearch } from "./use-grid-explorer-search";

const getDataStoreMock = vi.hoisted(() => vi.fn());
const liveQueryMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/datastore", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/db/datastore")>();
  return { ...original, getDataStore: getDataStoreMock };
});

vi.mock("dexie", () => ({ liveQuery: liveQueryMock }));

type Observer = { next: (value: unknown) => void; error: (error: unknown) => void };
type Subscription = {
  observer?: Observer;
  query: () => Promise<unknown>;
  unsubscribe: ReturnType<typeof vi.fn>;
};

const subscriptions: Subscription[] = [];
let nodes: Node[] = [];
let bits: Bit[] = [];

function node(id: string, title: string, overrides: Partial<Node> = {}): Node {
  return {
    id,
    title,
    color: "hsl(210, 50%, 50%)",
    icon: "folder",
    deadline: null,
    deadlineAllDay: false,
    mtime: 1,
    createdAt: 1,
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
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

async function emit(index = subscriptions.length - 1) {
  const subscription = subscriptions[index];
  if (!subscription?.observer) throw new Error("subscription not ready");
  const value = await subscription.query();
  act(() => subscription.observer?.next(value));
}

describe("useGridExplorerSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    subscriptions.length = 0;
    nodes = [node("alpha", "Alpha")];
    bits = [];
    getDataStoreMock.mockResolvedValue({
      getAllActiveNodes: vi.fn(async () => nodes),
      getAllActiveBits: vi.fn(async () => bits),
    } as unknown as DataStore);
    liveQueryMock.mockImplementation((query: () => Promise<unknown>) => {
      const subscription: Subscription = { query, unsubscribe: vi.fn() };
      subscriptions.push(subscription);
      return {
        subscribe(observer: Observer) {
          subscription.observer = observer;
          void query().then(observer.next).catch(observer.error);
          return { unsubscribe: subscription.unsubscribe };
        },
      };
    });
  });

  it("starts closed and separates active from DnD-interrupted query state", async () => {
    const { result } = renderHook(() => useGridExplorerSearch());
    expect(result.current).toMatchObject({
      mode: "closed",
      activeQuery: null,
      interruptedQuery: null,
      results: [],
      resultScrollTop: 0,
      focusTarget: { kind: "input" },
    });

    act(() => result.current.openSearch());
    act(() => result.current.setQuery("alpha"));
    await waitFor(() => expect(result.current.status).toBe("ready"));
    act(() => result.current.setResultScrollTop(42));
    act(() => result.current.focusResult("node:alpha"));

    act(() => result.current.interruptForDnd());
    expect(result.current).toMatchObject({
      mode: "interrupted",
      activeQuery: null,
      interruptedQuery: "alpha",
      resultScrollTop: 42,
      focusTarget: { kind: "result", resultKey: "node:alpha" },
    });

    act(() => result.current.openSearch());
    expect(result.current).toMatchObject({
      mode: "active",
      activeQuery: "alpha",
      interruptedQuery: null,
      resultScrollTop: 42,
    });
  });

  it("cancels superseded requests and ignores a stale completion", async () => {
    const alpha = deferred<Awaited<ReturnType<GridExplorerSearchRunner>>>();
    const beta = deferred<Awaited<ReturnType<GridExplorerSearchRunner>>>();
    const signals: AbortSignal[] = [];
    const runner = vi.fn<GridExplorerSearchRunner>((request) => {
      signals.push(request.signal);
      return request.query === "alpha" ? alpha.promise : beta.promise;
    });
    const { result } = renderHook(() => useGridExplorerSearch({ runner }));
    await waitFor(() => expect(subscriptions[0]?.observer).toBeDefined());

    act(() => {
      result.current.openSearch();
      result.current.setQuery("alpha");
    });
    await waitFor(() => expect(runner).toHaveBeenCalledTimes(1));
    act(() => result.current.setQuery("beta"));
    await waitFor(() => expect(runner).toHaveBeenCalledTimes(2));
    expect(signals[0]?.aborted).toBe(true);

    await act(async () => {
      beta.resolve([{
        key: "node:beta",
        id: "beta",
        type: "node",
        title: "Beta",
        icon: "folder",
        color: "hsl(210, 50%, 50%)",
        breadcrumb: "Home",
        ancestorIds: [],
        nodePathIds: ["beta"],
        hierarchyOrder: 0,
        relevance: "title-exact",
        rank: 0,
        duplicate: null,
      }]);
    });
    await waitFor(() => expect(result.current.results.map(({ id }) => id)).toEqual(["beta"]));

    await act(async () => alpha.resolve([]));
    expect(result.current.results.map(({ id }) => id)).toEqual(["beta"]);
  });

  it("reactively refreshes while retaining scroll/focus and returns focus to input when a result disappears", async () => {
    const refresh = deferred<Awaited<ReturnType<GridExplorerSearchRunner>>>();
    let requestCount = 0;
    const runner = vi.fn<GridExplorerSearchRunner>(async (request) => {
      requestCount += 1;
      if (requestCount === 2) return refresh.promise;
      return searchGridExplorer(request);
    });
    const { result } = renderHook(() => useGridExplorerSearch({ runner }));
    act(() => {
      result.current.openSearch();
      result.current.setQuery("alpha");
    });
    await waitFor(() => expect(result.current.results).toHaveLength(1));
    act(() => {
      result.current.setResultScrollTop(70);
      result.current.focusResult("node:alpha");
    });

    nodes = [node("alpha", "Alpha updated")];
    await emit();
    await waitFor(() => expect(result.current.status).toBe("refreshing"));
    expect(result.current.results[0]?.title).toBe("Alpha");
    expect(result.current.resultScrollTop).toBe(70);
    await act(async () => refresh.resolve(searchGridExplorer({
      nodes,
      bits,
      query: "alpha",
    })));
    await waitFor(() => expect(result.current.results[0]?.title).toBe("Alpha updated"));
    expect(result.current.resultScrollTop).toBe(70);
    expect(result.current.focusTarget).toEqual({ kind: "result", resultKey: "node:alpha" });

    nodes = [];
    await emit();
    await waitFor(() => expect(result.current.results).toEqual([]));
    expect(result.current.focusTarget).toEqual({ kind: "input" });
    expect(result.current.resultScrollTop).toBe(70);
  });

  it("reports request failure and retries the current query", async () => {
    const runner = vi.fn<GridExplorerSearchRunner>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce([]);
    const { result } = renderHook(() => useGridExplorerSearch({ runner }));

    act(() => {
      result.current.openSearch();
      result.current.setQuery("alpha");
    });
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("offline");

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(runner).toHaveBeenCalledTimes(2);
  });

  it("clears active/interrupted state and cancels work on close or route unmount", async () => {
    const pending = deferred<Awaited<ReturnType<GridExplorerSearchRunner>>>();
    const signals: AbortSignal[] = [];
    const runner = vi.fn<GridExplorerSearchRunner>((request) => {
      signals.push(request.signal);
      return pending.promise;
    });
    const first = renderHook(() => useGridExplorerSearch({ runner }));
    act(() => {
      first.result.current.openSearch();
      first.result.current.setQuery("alpha");
    });
    await waitFor(() => expect(runner).toHaveBeenCalledTimes(1));
    act(() => first.result.current.interruptForDnd());
    act(() => first.result.current.closeSearch());
    expect(signals[0]?.aborted).toBe(true);
    expect(first.result.current).toMatchObject({
      mode: "closed",
      activeQuery: null,
      interruptedQuery: null,
      results: [],
      resultScrollTop: 0,
    });

    act(() => {
      first.result.current.openSearch();
      first.result.current.setQuery("alpha");
    });
    await waitFor(() => expect(runner).toHaveBeenCalledTimes(2));
    first.unmount();
    expect(signals[1]?.aborted).toBe(true);
    expect(subscriptions[0]?.unsubscribe).toHaveBeenCalledTimes(1);

    const second = renderHook(() => useGridExplorerSearch({ runner }));
    expect(second.result.current).toMatchObject({
      mode: "closed",
      activeQuery: null,
      interruptedQuery: null,
      results: [],
      resultScrollTop: 0,
    });
  });
});
