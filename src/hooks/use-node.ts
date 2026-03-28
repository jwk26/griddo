"use client";

import { liveQuery } from "dexie";
import { useEffect, useState } from "react";
import { getDataStore } from "@/lib/db/datastore";
import type { Node } from "@/types";

export function useNode(nodeId: string): Node | null {
  const [node, setNode] = useState<Node | null>(null);

  useEffect(() => {
    const subscription = liveQuery(async () => {
      const dataStore = await getDataStore();
      return dataStore.getNode(nodeId);
    }).subscribe({
      next: (value) => setNode(value ?? null),
      error: (err) => console.error(err),
    });

    return () => subscription.unsubscribe();
  }, [nodeId]);

  return node;
}
