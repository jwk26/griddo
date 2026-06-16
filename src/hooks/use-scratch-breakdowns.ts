"use client";

import { liveQuery } from "dexie";
import { useEffect, useState } from "react";
import { getDataStore } from "@/lib/db/datastore";
import type { ScratchBreakdown } from "@/lib/db/schema";

export function useScratchBreakdowns(scratchBitId: string | null): {
  breakdowns: ScratchBreakdown[];
  createBreakdown: (content: string) => Promise<void>;
  deleteBreakdown: (id: string) => Promise<void>;
} {
  const [breakdowns, setBreakdowns] = useState<ScratchBreakdown[]>([]);

  useEffect(() => {
    if (scratchBitId === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBreakdowns([]);
      return;
    }

    const subscription = liveQuery(async () => {
      const dataStore = await getDataStore();
      return dataStore.getScratchBreakdowns(scratchBitId);
    }).subscribe({
      next: (value) => setBreakdowns(value),
      error: (err) => console.error("breakdowns liveQuery error:", err),
    });

    return () => subscription.unsubscribe();
  }, [scratchBitId]);

  async function createBreakdown(content: string): Promise<void> {
    if (scratchBitId === null) return;
    const nextOrder =
      breakdowns.length === 0
        ? 0
        : Math.max(...breakdowns.map((row) => row.order)) + 1;
    const dataStore = await getDataStore();
    await dataStore.createScratchBreakdown({
      scratchBitId,
      content,
      order: nextOrder,
    });
  }

  async function deleteBreakdown(id: string): Promise<void> {
    const dataStore = await getDataStore();
    await dataStore.deleteScratchBreakdown(id);
  }

  return { breakdowns, createBreakdown, deleteBreakdown };
}
