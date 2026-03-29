"use client";

import { useEffect, useState } from "react";
import { getDataStore } from "@/lib/db/datastore";
import { useSearchStore } from "@/stores/search-store";

export type SearchResult = {
  id: string;
  type: "node" | "bit" | "chunk";
  title: string;
  parentPath: string[];
  deadline: number | null;
  parentNodeId?: string;
  parentBitId?: string;
  grandparentNodeId?: string;
};

type SearchState = {
  query: string;
  results: SearchResult[];
};

export function useSearch(): {
  results: SearchResult[];
  isLoading: boolean;
} {
  const [state, setState] = useState<SearchState>({
    query: "",
    results: [],
  });
  const query = useSearchStore((state) => state.query);
  const normalizedQuery = query.trim();

  useEffect(() => {
    if (!normalizedQuery) {
      return;
    }

    let isCancelled = false;

    void getDataStore().then((dataStore) => dataStore.searchAll(normalizedQuery)).then((value) => {
      if (isCancelled) {
        return;
      }

      setState({
        query: normalizedQuery,
        results: value.map((result) => ({
          id: result.item.id,
          type: result.type,
          title: result.item.title,
          parentPath: result.parentPath,
          parentNodeId: result.parentNodeId,
          parentBitId: result.parentBitId,
          grandparentNodeId: result.grandparentNodeId,
          deadline:
            "deadline" in result.item
              ? result.item.deadline
              : "time" in result.item
                ? result.item.time
                : null,
        })),
      });
    }).catch((error) => {
      if (isCancelled) {
        return;
      }

      console.error("search error:", error);
      setState({
        query: normalizedQuery,
        results: [],
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [normalizedQuery]);

  if (!normalizedQuery) {
    return { results: [], isLoading: false };
  }

  if (state.query !== normalizedQuery) {
    return { results: state.results, isLoading: true };
  }

  return { results: state.results, isLoading: false };
}
