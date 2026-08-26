"use client";

import { liveQuery } from "dexie";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getDataStore } from "@/lib/db/datastore";
import {
  runGridExplorerSearch,
  searchGridExplorer,
  type GridExplorerSearchResult,
  type GridExplorerSearchRunner,
} from "@/lib/utils/grid-explorer-search";
import type { Bit, Node } from "@/types";

export type GridExplorerSearchMode = "closed" | "active" | "interrupted";
export type GridExplorerSearchStatus =
  | "idle"
  | "loading"
  | "refreshing"
  | "ready"
  | "error";
export type GridExplorerSearchFocusTarget =
  | Readonly<{ kind: "input" }>
  | Readonly<{ kind: "result"; resultKey: GridExplorerSearchResult["key"] }>;
export type GridExplorerSearchFeedback = "stale-selection" | null;
export type GridExplorerSearchSelectionOutcome =
  | Readonly<{ kind: "selected"; result: GridExplorerSearchResult }>
  | Readonly<{ kind: "stale" }>;
export type GridExplorerRevealPresentation =
  | Readonly<{ kind: "revealed"; result: GridExplorerSearchResult }>
  | Readonly<{
      kind: "selection-cleared";
      id: string;
      title: string;
      nodePathIds: readonly string[];
    }>;

type SearchSession = Readonly<{
  mode: GridExplorerSearchMode;
  query: string;
}>;

type SearchSnapshot = Readonly<{
  nodes: Node[];
  bits: Bit[];
  revision: number;
}>;

type SearchProjection = Readonly<{
  results: GridExplorerSearchResult[];
  resultQuery: string | null;
  status: GridExplorerSearchStatus;
  error: string | null;
}>;

export type UseGridExplorerSearchOptions = Readonly<{
  runner?: GridExplorerSearchRunner;
}>;

export type UseGridExplorerSearchResult = Readonly<{
  mode: GridExplorerSearchMode;
  activeQuery: string | null;
  interruptedQuery: string | null;
  results: GridExplorerSearchResult[];
  status: GridExplorerSearchStatus;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  resultScrollTop: number;
  focusTarget: GridExplorerSearchFocusTarget;
  feedback: GridExplorerSearchFeedback;
  revealPresentation: GridExplorerRevealPresentation | null;
  openSearch: () => void;
  setQuery: (query: string) => void;
  interruptForDnd: () => void;
  closeSearch: () => void;
  retry: () => void;
  setResultScrollTop: (scrollTop: number) => void;
  focusInput: () => void;
  focusResult: (resultKey: GridExplorerSearchResult["key"]) => void;
  selectResult: (
    result: GridExplorerSearchResult,
  ) => Promise<GridExplorerSearchSelectionOutcome>;
  clearReveal: () => void;
}>;

const CLOSED_SESSION: SearchSession = { mode: "closed", query: "" };
const INPUT_FOCUS: GridExplorerSearchFocusTarget = { kind: "input" };
const EMPTY_PROJECTION: SearchProjection = {
  results: [],
  resultQuery: null,
  status: "idle",
  error: null,
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Search request failed";
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function sameResult(
  previous: GridExplorerSearchResult,
  current: GridExplorerSearchResult,
): boolean {
  return (
    previous.key === current.key &&
    previous.title === current.title &&
    previous.breadcrumb === current.breadcrumb &&
    previous.ancestorIds.length === current.ancestorIds.length &&
    previous.ancestorIds.every((id, index) => id === current.ancestorIds[index]) &&
    previous.nodePathIds.length === current.nodePathIds.length &&
    previous.nodePathIds.every((id, index) => id === current.nodePathIds[index])
  );
}

function reconcileReveal(
  result: GridExplorerSearchResult,
  nodes: readonly Node[],
  bits: readonly Bit[],
): "reachable" | "bit-disappeared" | "unreachable" {
  const activeNodes = new Map(
    nodes
      .filter(
        (node) =>
          node.deletedAt === null &&
          node.archivedAt === null &&
          node.systemRole === null &&
          !node.hiddenFromGrid,
      )
      .map((node) => [node.id, node]),
  );
  let expectedParentId: string | null = null;
  for (const nodeId of result.nodePathIds) {
    const node = activeNodes.get(nodeId);
    if (node === undefined || node.parentId !== expectedParentId) {
      return "unreachable";
    }
    expectedParentId = node.id;
  }

  if (result.type === "node") {
    return result.nodePathIds.at(-1) === result.id
      ? "reachable"
      : "unreachable";
  }

  const bit = bits.find(
    (candidate) =>
      candidate.id === result.id &&
      candidate.deletedAt === null &&
      candidate.archivedAt === null,
  );
  return bit !== undefined && bit.parentId === expectedParentId
    ? "reachable"
    : "bit-disappeared";
}

export function useGridExplorerSearch(
  options: UseGridExplorerSearchOptions = {},
): UseGridExplorerSearchResult {
  const runner = options.runner ?? runGridExplorerSearch;
  const [session, setSession] = useState<SearchSession>(CLOSED_SESSION);
  const [snapshot, setSnapshot] = useState<SearchSnapshot | null>(null);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [projection, setProjection] =
    useState<SearchProjection>(EMPTY_PROJECTION);
  const [resultScrollTop, setResultScrollTopState] = useState(0);
  const [focusTarget, setFocusTarget] =
    useState<GridExplorerSearchFocusTarget>(INPUT_FOCUS);
  const [feedback, setFeedback] =
    useState<GridExplorerSearchFeedback>(null);
  const [revealPresentation, setRevealPresentation] =
    useState<GridExplorerRevealPresentation | null>(null);
  const [retryRevision, setRetryRevision] = useState(0);
  const requestIdRef = useRef(0);
  const searchEnabled = session.mode !== "closed";

  useEffect(() => {
    let revision = 0;
    const subscription = liveQuery(async () => {
      const dataStore = await getDataStore();
      const [nodes, bits] = await Promise.all([
        dataStore.getAllActiveNodes(),
        dataStore.getAllActiveBits(),
      ]);
      return { nodes, bits };
    }).subscribe({
      next: ({ nodes, bits }) => {
        revision += 1;
        setSnapshot({ nodes, bits, revision });
        setSnapshotError(null);
        setRevealPresentation((current) => {
          if (current?.kind !== "revealed") return current;
          const reconciliation = reconcileReveal(current.result, nodes, bits);
          if (reconciliation === "reachable") return current;
          return reconciliation === "bit-disappeared"
            ? {
                kind: "selection-cleared",
                id: current.result.id,
                title: current.result.title,
                nodePathIds: current.result.nodePathIds,
              }
            : null;
        });
      },
      error: (error) => setSnapshotError(errorMessage(error)),
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const controller = new AbortController();
    const normalizedQuery = session.query.trim().replace(/\s+/g, " ");

    if (!searchEnabled || normalizedQuery.length === 0) {
      return () => controller.abort();
    }
    if (snapshotError !== null) {
      void Promise.resolve().then(() => {
        if (controller.signal.aborted || requestIdRef.current !== requestId) return;
        setProjection((current) => ({
          ...current,
          status: "error",
          error: snapshotError,
        }));
      });
      return () => controller.abort();
    }
    if (snapshot === null) {
      void Promise.resolve().then(() => {
        if (controller.signal.aborted || requestIdRef.current !== requestId) return;
        setProjection((current) => ({
          results:
            current.resultQuery === normalizedQuery ? current.results : [],
          resultQuery:
            current.resultQuery === normalizedQuery ? current.resultQuery : null,
          status: "loading",
          error: null,
        }));
      });
      return () => controller.abort();
    }

    void Promise.resolve().then(() => {
      if (controller.signal.aborted || requestIdRef.current !== requestId) return;
      setProjection((current) => ({
        results: current.resultQuery === normalizedQuery ? current.results : [],
        resultQuery:
          current.resultQuery === normalizedQuery ? current.resultQuery : null,
        status:
          current.resultQuery === normalizedQuery ? "refreshing" : "loading",
        error: null,
      }));
    });

    void runner({
      nodes: snapshot.nodes,
      bits: snapshot.bits,
      query: normalizedQuery,
      signal: controller.signal,
    })
      .then((results) => {
        if (
          controller.signal.aborted ||
          requestIdRef.current !== requestId
        ) {
          return;
        }
        setProjection({
          results,
          resultQuery: normalizedQuery,
          status: "ready",
          error: null,
        });
        setFocusTarget((current) => {
          if (current.kind !== "result") return current;
          return results.some(({ key }) => key === current.resultKey)
            ? current
            : INPUT_FOCUS;
        });
      })
      .catch((error: unknown) => {
        if (
          controller.signal.aborted ||
          requestIdRef.current !== requestId ||
          isAbortError(error)
        ) {
          return;
        }
        setProjection((current) => ({
          results:
            current.resultQuery === normalizedQuery ? current.results : [],
          resultQuery:
            current.resultQuery === normalizedQuery
              ? current.resultQuery
              : normalizedQuery,
          status: "error",
          error: errorMessage(error),
        }));
      });

    return () => controller.abort();
  }, [retryRevision, runner, searchEnabled, session.query, snapshot, snapshotError]);

  const openSearch = useCallback(() => {
    setSession((current) => ({
      mode: "active",
      query: current.query,
    }));
    setFocusTarget(INPUT_FOCUS);
    setRevealPresentation(null);
  }, []);

  const setQuery = useCallback((query: string) => {
    setSession({ mode: "active", query });
    setProjection(EMPTY_PROJECTION);
    setResultScrollTopState(0);
    setFocusTarget(INPUT_FOCUS);
    setFeedback(null);
  }, []);

  const interruptForDnd = useCallback(() => {
    setSession((current) =>
      current.mode === "active"
        ? { mode: "interrupted", query: current.query }
        : current,
    );
    setRevealPresentation(null);
  }, []);

  const closeSearch = useCallback(() => {
    requestIdRef.current += 1;
    setSession(CLOSED_SESSION);
    setProjection(EMPTY_PROJECTION);
    setResultScrollTopState(0);
    setFocusTarget(INPUT_FOCUS);
    setFeedback(null);
    setRevealPresentation(null);
  }, []);

  const retry = useCallback(() => {
    setRetryRevision((current) => current + 1);
  }, []);

  const setResultScrollTop = useCallback((scrollTop: number) => {
    setResultScrollTopState(
      Number.isFinite(scrollTop) ? Math.max(0, scrollTop) : 0,
    );
  }, []);

  const focusInput = useCallback(() => setFocusTarget(INPUT_FOCUS), []);
  const focusResult = useCallback(
    (resultKey: GridExplorerSearchResult["key"]) => {
      if (projection.results.some(({ key }) => key === resultKey)) {
        setFocusTarget({ kind: "result", resultKey });
      }
    },
    [projection.results],
  );

  const selectResult = useCallback(
    async (
      selected: GridExplorerSearchResult,
    ): Promise<GridExplorerSearchSelectionOutcome> => {
      const normalizedQuery = session.query.trim().replace(/\s+/g, " ");
      try {
        const dataStore = await getDataStore();
        const [nodes, bits] = await Promise.all([
          dataStore.getAllActiveNodes(),
          dataStore.getAllActiveBits(),
        ]);
        const refreshedResults = searchGridExplorer({
          nodes,
          bits,
          query: normalizedQuery,
        });
        const refreshed = refreshedResults.find(({ key }) => key === selected.key);
        const revision = (snapshot?.revision ?? 0) + 1;
        setSnapshot({ nodes, bits, revision });

        if (refreshed === undefined || !sameResult(selected, refreshed)) {
          setProjection({
            results: refreshedResults,
            resultQuery: normalizedQuery,
            status: "ready",
            error: null,
          });
          setFeedback("stale-selection");
          if (refreshed === undefined) setFocusTarget(INPUT_FOCUS);
          return { kind: "stale" };
        }

        requestIdRef.current += 1;
        setSession(CLOSED_SESSION);
        setProjection(EMPTY_PROJECTION);
        setResultScrollTopState(0);
        setFocusTarget(INPUT_FOCUS);
        setFeedback(null);
        setRevealPresentation({ kind: "revealed", result: refreshed });
        return { kind: "selected", result: refreshed };
      } catch (error) {
        setProjection((current) => ({
          ...current,
          status: "error",
          error: errorMessage(error),
        }));
        return { kind: "stale" };
      }
    },
    [session.query, snapshot?.revision],
  );
  const clearReveal = useCallback(() => setRevealPresentation(null), []);

  return useMemo(
    () => ({
      mode: session.mode,
      activeQuery: session.mode === "active" ? session.query : null,
      interruptedQuery:
        session.mode === "interrupted" ? session.query : null,
      results: projection.results,
      status: projection.status,
      isLoading: projection.status === "loading",
      isRefreshing: projection.status === "refreshing",
      error: projection.error,
      resultScrollTop,
      focusTarget,
      feedback,
      revealPresentation,
      openSearch,
      setQuery,
      interruptForDnd,
      closeSearch,
      retry,
      setResultScrollTop,
      focusInput,
      focusResult,
      selectResult,
      clearReveal,
    }),
    [
      closeSearch,
      focusInput,
      focusResult,
      focusTarget,
      feedback,
      revealPresentation,
      interruptForDnd,
      openSearch,
      projection.error,
      projection.results,
      projection.status,
      resultScrollTop,
      retry,
      session.mode,
      session.query,
      selectResult,
      clearReveal,
      setQuery,
      setResultScrollTop,
    ],
  );
}
