"use client";

import { useCallback } from "react";
import { getDataStore } from "@/lib/db/datastore";
import type { Node } from "@/types";

export function useNodeActions() {
  const updateNode = useCallback(async (id: string, data: Partial<Node>): Promise<void> => {
    const dataStore = await getDataStore();
    await dataStore.updateNode(id, data);
  }, []);

  return { updateNode };
}
