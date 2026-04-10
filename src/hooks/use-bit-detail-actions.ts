"use client";

import { useCallback } from "react";
import { getDataStore } from "@/lib/db/datastore";
import type { Bit, Node } from "@/types";

export function useBitDetailActions() {
  const updateBit = useCallback(async (id: string, data: Partial<Bit>): Promise<void> => {
    const dataStore = await getDataStore();
    await dataStore.updateBit(id, data);
  }, []);

  const updateNode = useCallback(async (id: string, data: Partial<Node>): Promise<void> => {
    const dataStore = await getDataStore();
    await dataStore.updateNode(id, data);
  }, []);

  const softDeleteBit = useCallback(async (id: string): Promise<void> => {
    const dataStore = await getDataStore();
    await dataStore.softDeleteBit(id);
  }, []);

  const promoteBitToNode = useCallback(async (bitId: string): Promise<Node> => {
    const dataStore = await getDataStore();
    return dataStore.promoteBitToNode(bitId);
  }, []);

  return { updateBit, updateNode, softDeleteBit, promoteBitToNode };
}
