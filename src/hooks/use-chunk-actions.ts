"use client";

import { useCallback } from "react";
import { getDataStore } from "@/lib/db/datastore";
import type { CreateChunk } from "@/lib/db/schema";
import type { Chunk } from "@/types";

export function useChunkActions() {
  const createChunk = useCallback(async (data: CreateChunk): Promise<void> => {
    const dataStore = await getDataStore();
    await dataStore.createChunk(data);
  }, []);

  const updateChunk = useCallback(async (id: string, data: Partial<Chunk>): Promise<void> => {
    const dataStore = await getDataStore();
    await dataStore.updateChunk(id, data);
  }, []);

  const deleteChunk = useCallback(async (id: string): Promise<void> => {
    const dataStore = await getDataStore();
    await dataStore.deleteChunk(id);
  }, []);

  return { createChunk, updateChunk, deleteChunk };
}
