"use client";

import { DndContext } from "@dnd-kit/core";
import { ThemeProvider } from "next-themes";
import { createContext, useContext, type ReactNode } from "react";
import type { DataStore } from "@/lib/db/datastore";
import { indexedDBStore } from "@/lib/db/indexeddb";

const DataStoreContext = createContext<DataStore | null>(null);

export function useDataStore(): DataStore {
  const store = useContext(DataStoreContext);

  if (store === null) {
    throw new Error("useDataStore must be used within Providers");
  }

  return store;
}

export default function Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <DataStoreContext.Provider value={indexedDBStore}>
        <DndContext>{children}</DndContext>
      </DataStoreContext.Provider>
    </ThemeProvider>
  );
}
