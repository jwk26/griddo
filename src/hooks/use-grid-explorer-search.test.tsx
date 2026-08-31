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

function bit(id: string, title: string, parentId: string, overrides: Partial<Bit> = {}): Bit {
  return {
    id,
    title,
    description: "",
    icon: "list",
    deadline: null,
    deadlineAllDay: false,
    priority: null,
    status: "active",
    mtime: 1,
    createdAt: 1,
    version: 1,
    parentId,
    x: 0,
    y: 0,
    deletedAt: null,
    archivedAt: null,
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

  it("projects matching mounted-page additions into the current query without reopening Search", async () => {
    nodes = [];
    const { result } = renderHook(() => useGridExplorerSearch());
    act(() => {
      result.current.openSearch();
      result.current.setQuery("alpha");
    });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    act(() => result.current.setResultScrollTop(31));

    nodes = [node("alpha", "Alpha")];
    await emit();

    await waitFor(() => expect(result.current.results.map(({ key }) => key)).toEqual(["node:alpha"]));
    expect(result.current.mode).toBe("active");
    expect(result.current.activeQuery).toBe("alpha");
    expect(result.current.resultScrollTop).toBe(31);
  });

  it("removes only a terminally undone result and focuses the same surviving row index", async () => {
    nodes = [node("alpha", "Alpha"), node("alpine", "Alpine"), node("alto", "Alto")];
    const { result } = renderHook(() => useGridExplorerSearch());
    act(() => {
      result.current.openSearch();
      result.current.setQuery("al");
    });
    await waitFor(() => expect(result.current.results).toHaveLength(3));
    act(() => {
      result.current.setResultScrollTop(73);
      result.current.focusResult("node:alpine");
      result.current.completeResultUndo({
        removedIndex: 1,
        resultKey: "node:alpine",
        source: "Breakdown source",
        title: "Alpine",
      });
    });

    expect(result.current.results.map(({ key }) => key)).toEqual([
      "node:alpha",
      "node:alto",
    ]);
    expect(result.current).toMatchObject({
      activeQuery: "al",
      feedback: {
        kind: "undo-success",
        source: "Breakdown source",
        title: "Alpine",
      },
      focusTarget: { kind: "result", resultKey: "node:alto" },
      mode: "active",
      resultScrollTop: 73,
    });
  });

  it("focuses the search input after last-row Undo without a previous-result fallback", async () => {
    nodes = [
      node("alpha", "Alpha", { x: 0 }),
      node("alpine", "Alpine", { x: 1 }),
    ];
    const { result } = renderHook(() => useGridExplorerSearch());
    act(() => {
      result.current.openSearch();
      result.current.setQuery("al");
    });
    await waitFor(() => expect(result.current.results).toHaveLength(2));
    act(() => {
      result.current.focusResult("node:alpine");
      result.current.completeResultUndo({
        removedIndex: 1,
        resultKey: "node:alpine",
        source: "Breakdown source",
        title: "Alpine",
      });
    });

    expect(result.current.results.map(({ key }) => key)).toEqual(["node:alpha"]);
    expect(result.current.focusTarget).toEqual({ kind: "input" });
  });

  it("uses the latest surviving result order when Search refreshes during pending Undo", async () => {
    nodes = [
      node("alpha", "Alpha", { x: 0 }),
      node("alpine", "Alpine", { x: 2 }),
      node("alto", "Alto", { x: 3 }),
    ];
    const { result } = renderHook(() => useGridExplorerSearch());
    act(() => {
      result.current.openSearch();
      result.current.setQuery("al");
    });
    await waitFor(() => expect(result.current.results).toHaveLength(3));
    const completePendingUndo = result.current.completeResultUndo;

    nodes = [
      node("alpha", "Alpha", { x: 0 }),
      node("albatross", "Albatross", { x: 1 }),
      node("alpine", "Alpine", { x: 2 }),
      node("alto", "Alto", { x: 3 }),
    ];
    await emit();
    await waitFor(() =>
      expect(result.current.results.map(({ key }) => key)).toEqual([
        "node:alpha",
        "node:albatross",
        "node:alpine",
        "node:alto",
      ]),
    );

    act(() => completePendingUndo({
      removedIndex: 1,
      resultKey: "node:alpine",
      source: "Breakdown source",
      title: "Alpine",
    }));

    expect(result.current.results.map(({ key }) => key)).toEqual([
      "node:alpha",
      "node:albatross",
      "node:alto",
    ]);
    expect(result.current.focusTarget).toEqual({
      kind: "result",
      resultKey: "node:alto",
    });
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

  it("ends stale-selection feedback on query edit and retry before the next request status", async () => {
    const { result } = renderHook(() => useGridExplorerSearch());
    act(() => {
      result.current.openSearch();
      result.current.setQuery("alpha");
    });
    await waitFor(() => expect(result.current.results).toHaveLength(1));
    const selected = result.current.results[0]!;
    nodes = [];
    await act(async () => {
      await result.current.selectResult(selected);
    });
    expect(result.current.feedback).toBe("stale-selection");

    act(() => result.current.retry());
    expect(result.current.feedback).toBeNull();

    act(() => result.current.setQuery("beta"));
    expect(result.current.feedback).toBeNull();
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

  it("revalidates a reachable result at activation and clears active and interrupted state", async () => {
    const { result } = renderHook(() => useGridExplorerSearch());
    act(() => {
      result.current.openSearch();
      result.current.setQuery("alpha");
    });
    await waitFor(() => expect(result.current.results).toHaveLength(1));
    const selected = result.current.results[0]!;

    let outcome: Awaited<ReturnType<typeof result.current.selectResult>> | undefined;
    await act(async () => {
      outcome = await result.current.selectResult(selected);
    });

    expect(outcome).toEqual({ kind: "selected", result: selected });
    expect(result.current.revealPresentation).toEqual({
      kind: "revealed",
      result: selected,
    });
    expect(result.current).toMatchObject({
      mode: "closed",
      activeQuery: null,
      interruptedQuery: null,
      results: [],
      resultScrollTop: 0,
      feedback: null,
    });
    act(() => result.current.interruptForDnd());
    expect(result.current.revealPresentation).toBeNull();
  });

  it.each([
    ["query edit", (current: ReturnType<typeof useGridExplorerSearch>) => current.setQuery("beta")],
    ["close", (current: ReturnType<typeof useGridExplorerSearch>) => current.closeSearch()],
    ["DnD start", (current: ReturnType<typeof useGridExplorerSearch>) => current.interruptForDnd()],
    ["Scratch switch", (current: ReturnType<typeof useGridExplorerSearch>) => current.invalidatePendingSelection()],
  ])("ignores a pending selection completion after %s", async (_name, invalidate) => {
    const { result } = renderHook(() => useGridExplorerSearch());
    act(() => {
      result.current.openSearch();
      result.current.setQuery("alpha");
    });
    await waitFor(() => expect(result.current.results).toHaveLength(1));
    const selected = result.current.results[0]!;
    const pendingNodes = deferred<Node[]>();
    getDataStoreMock.mockResolvedValue({
      getAllActiveNodes: vi.fn(() => pendingNodes.promise),
      getAllActiveBits: vi.fn(async () => bits),
    } as unknown as DataStore);

    let outcomePromise!: ReturnType<typeof result.current.selectResult>;
    act(() => {
      outcomePromise = result.current.selectResult(selected);
    });
    act(() => invalidate(result.current));
    if (_name === "query edit") {
      await waitFor(() => expect(result.current.status).toBe("ready"));
    }
    const stateAfterInvalidation = {
      feedback: result.current.feedback,
      focusTarget: result.current.focusTarget,
      mode: result.current.mode,
      query: result.current.activeQuery ?? result.current.interruptedQuery,
      results: result.current.results.map(({ key }) => key),
      reveal: result.current.revealPresentation,
      scroll: result.current.resultScrollTop,
      status: result.current.status,
    };

    await act(async () => pendingNodes.resolve(nodes));
    await expect(outcomePromise).resolves.toEqual({ kind: "stale" });
    expect({
      feedback: result.current.feedback,
      focusTarget: result.current.focusTarget,
      mode: result.current.mode,
      query: result.current.activeQuery ?? result.current.interruptedQuery,
      results: result.current.results.map(({ key }) => key),
      reveal: result.current.revealPresentation,
      scroll: result.current.resultScrollTop,
      status: result.current.status,
    }).toEqual(stateAfterInvalidation);
  });

  it("invalidates selection revalidation when the hook unmounts", async () => {
    const view = renderHook(() => useGridExplorerSearch());
    act(() => {
      view.result.current.openSearch();
      view.result.current.setQuery("alpha");
    });
    await waitFor(() => expect(view.result.current.results).toHaveLength(1));
    const selected = view.result.current.results[0]!;
    const pendingNodes = deferred<Node[]>();
    getDataStoreMock.mockResolvedValue({
      getAllActiveNodes: vi.fn(() => pendingNodes.promise),
      getAllActiveBits: vi.fn(async () => bits),
    } as unknown as DataStore);
    const outcome = view.result.current.selectResult(selected);

    view.unmount();
    pendingNodes.resolve(nodes);

    await expect(outcome).resolves.toEqual({ kind: "stale" });
  });

  it.each([
    ["removed", () => { nodes = []; }],
    ["hidden", () => { nodes = [node("alpha", "Alpha", { hiddenFromGrid: true })]; }],
    ["unreachable", () => {
      nodes = [node("alpha", "Alpha", { parentId: "missing", level: 1 })];
    }],
    ["moved", () => {
      nodes = [
        node("parent", "Parent"),
        node("alpha", "Alpha", { parentId: "parent", level: 1 }),
      ];
    }],
  ])("keeps search state and refreshes when selection is %s", async (_case, mutate) => {
    const { result } = renderHook(() => useGridExplorerSearch());
    act(() => {
      result.current.openSearch();
      result.current.setQuery("alpha");
    });
    await waitFor(() => expect(result.current.results).toHaveLength(1));
    const selected = result.current.results[0]!;
    act(() => {
      result.current.setResultScrollTop(64);
      result.current.focusResult(selected.key);
    });
    mutate();

    let outcome: Awaited<ReturnType<typeof result.current.selectResult>> | undefined;
    await act(async () => {
      outcome = await result.current.selectResult(selected);
    });

    expect(outcome).toEqual({ kind: "stale" });
    expect(result.current.mode).toBe("active");
    expect(result.current.activeQuery).toBe("alpha");
    expect(result.current.resultScrollTop).toBe(64);
    expect(result.current.feedback).toBe("stale-selection");
    expect(result.current.results).not.toContainEqual(selected);
    if (_case !== "moved") {
      expect(result.current.focusTarget).toEqual({ kind: "input" });
    }
  });

  it("revalidates Bits against their reachable active parent chain", async () => {
    nodes = [node("parent", "Projects")];
    bits = [bit("alpha-bit", "Alpha note", "parent")];
    const { result } = renderHook(() => useGridExplorerSearch());
    act(() => {
      result.current.openSearch();
      result.current.setQuery("alpha");
    });
    await waitFor(() => expect(result.current.results[0]?.type).toBe("bit"));

    const selected = result.current.results[0]!;
    let outcome: Awaited<ReturnType<typeof result.current.selectResult>> | undefined;
    await act(async () => {
      outcome = await result.current.selectResult(selected);
    });
    expect(outcome).toEqual({ kind: "selected", result: selected });
    expect(result.current.revealPresentation).toEqual({
      kind: "revealed",
      result: selected,
    });

    bits = [];
    await emit();
    await waitFor(() =>
      expect(result.current.revealPresentation).toEqual({
        kind: "selection-cleared",
        id: "alpha-bit",
        title: "Alpha note",
        nodePathIds: ["parent"],
      }),
    );

    act(() => result.current.clearReveal());
    expect(result.current.revealPresentation).toBeNull();
  });

  it("leaves an invalid parent path to the existing path-fallback owner instead of reporting Bit-only disappearance", async () => {
    nodes = [node("parent", "Projects")];
    bits = [bit("alpha-bit", "Alpha note", "parent")];
    const { result } = renderHook(() => useGridExplorerSearch());
    act(() => {
      result.current.openSearch();
      result.current.setQuery("alpha");
    });
    await waitFor(() => expect(result.current.results[0]?.type).toBe("bit"));
    const selected = result.current.results[0]!;
    await act(async () => {
      await result.current.selectResult(selected);
    });

    nodes = [];
    bits = [];
    await emit();

    await waitFor(() => expect(result.current.revealPresentation).toBeNull());
  });

  it("treats a Bit moved away from its still-valid parent as selection disappearance", async () => {
    nodes = [node("parent", "Projects"), node("other", "Elsewhere", { x: 1 })];
    bits = [bit("alpha-bit", "Alpha note", "parent")];
    const { result } = renderHook(() => useGridExplorerSearch());
    act(() => {
      result.current.openSearch();
      result.current.setQuery("alpha");
    });
    await waitFor(() => expect(result.current.results[0]?.type).toBe("bit"));
    const selected = result.current.results[0]!;
    await act(async () => {
      await result.current.selectResult(selected);
    });

    bits = [bit("alpha-bit", "Alpha note", "other")];
    await emit();

    await waitFor(() =>
      expect(result.current.revealPresentation).toEqual({
        kind: "selection-cleared",
        id: "alpha-bit",
        title: "Alpha note",
        nodePathIds: ["parent"],
      }),
    );
  });
});
