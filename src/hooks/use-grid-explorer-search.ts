"use client";

import { liveQuery } from "dexie";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getDataStore } from "@/lib/db/datastore";
import {
  runGridExplorerSearch,
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
  openSearch: () => void;
  setQuery: (query: string) => void;
  interruptForDnd: () => void;
  closeSearch: () => void;
  retry: () => void;
  setResultScrollTop: (scrollTop: number) => void;
  focusInput: () => void;
  focusResult: (resultKey: GridExplorerSearchResult["key"]) => void;
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
  }, []);

  const setQuery = useCallback((query: string) => {
    setSession({ mode: "active", query });
    setProjection(EMPTY_PROJECTION);
    setResultScrollTopState(0);
    setFocusTarget(INPUT_FOCUS);
  }, []);

  const interruptForDnd = useCallback(() => {
    setSession((current) =>
      current.mode === "active"
        ? { mode: "interrupted", query: current.query }
        : current,
    );
  }, []);

  const closeSearch = useCallback(() => {
    requestIdRef.current += 1;
    setSession(CLOSED_SESSION);
    setProjection(EMPTY_PROJECTION);
    setResultScrollTopState(0);
    setFocusTarget(INPUT_FOCUS);
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
      openSearch,
      setQuery,
      interruptForDnd,
      closeSearch,
      retry,
      setResultScrollTop,
      focusInput,
      focusResult,
    }),
    [
      closeSearch,
      focusInput,
      focusResult,
      focusTarget,
      interruptForDnd,
      openSearch,
      projection.error,
      projection.results,
      projection.status,
      resultScrollTop,
      retry,
      session.mode,
      session.query,
      setQuery,
      setResultScrollTop,
    ],
  );
}
