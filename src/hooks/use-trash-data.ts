"use client";

import { liveQuery } from "dexie";
import { useEffect, useState } from "react";
import { getDataStore } from "@/lib/db/datastore";
import type { Bit, Node } from "@/types";

type TrashDataSnapshot = {
  nodes: Node[];
  bits: Bit[];
  hasLoaded: boolean;
};

export function useTrashData(): {
  items: { nodes: Node[]; bits: Bit[] };
  isLoading: boolean;
} {
  const [state, setState] = useState<TrashDataSnapshot>({
    nodes: [],
    bits: [],
    hasLoaded: false,
  });

  useEffect(() => {
    const subscription = liveQuery(async () => {
      const dataStore = await getDataStore();
      return dataStore.getTrashedItems();
    }).subscribe({
      next: (value) => {
        setState({
          nodes: value.nodes,
          bits: value.bits,
          hasLoaded: true,
        });
      },
      error: (error) => {
        console.error("trash liveQuery error:", error);
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    items: {
      nodes: state.nodes,
      bits: state.bits,
    },
    isLoading: !state.hasLoaded,
  };
}
