"use client";

import { useEffect, useEffectEvent } from "react";
import { getDataStore } from "@/lib/db/datastore";

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

export function useTrashAutoCleanup(): void {
  const runCleanup = useEffectEvent(async () => {
    const dataStore = await getDataStore();
    await dataStore.cleanupExpiredTrash();
  });

  useEffect(() => {
    void runCleanup();

    const intervalId = window.setInterval(() => {
      void runCleanup();
    }, CLEANUP_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);
}
