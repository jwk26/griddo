"use client";

import { useEffect, useEffectEvent } from "react";
import { getDataStore } from "@/lib/db/datastore";

export function useSystemNodeSeeding(): void {
  const run = useEffectEvent(async () => {
    const dataStore = await getDataStore();
    await dataStore.ensureSystemNodes();
  });

  useEffect(() => {
    void run();
  }, []);
  // Mount-once. React StrictMode double-invocation is safe because ensureSystemNodes is idempotent.
}
