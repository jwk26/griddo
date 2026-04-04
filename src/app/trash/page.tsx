"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { TrashList } from "@/components/trash/trash-list";
import { useTrashData } from "@/hooks/use-trash-data";

export default function TrashPage() {
  const { items, isLoading } = useTrashData();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="ml-12 flex flex-1 flex-col overflow-auto p-6">
        <h1 className="sr-only">Trash</h1>
        {isLoading ? null : <TrashList items={items} />}
      </main>
    </div>
  );
}
