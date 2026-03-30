"use client";

import { useCallback } from "react";
import { getDataStore } from "@/lib/db/datastore";

export function useCalendarActions() {
  const unscheduleNode = useCallback(async (id: string) => {
    const dataStore = await getDataStore();
    await dataStore.updateNode(id, { deadline: null, deadlineAllDay: false });
  }, []);

  const unscheduleBit = useCallback(async (id: string) => {
    const dataStore = await getDataStore();
    await dataStore.updateBit(id, { deadline: null, deadlineAllDay: false });
  }, []);

  const unscheduleChunk = useCallback(async (id: string) => {
    const dataStore = await getDataStore();
    await dataStore.updateChunk(id, { time: null });
  }, []);

  return { unscheduleNode, unscheduleBit, unscheduleChunk };
}
