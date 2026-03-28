"use client";

import { liveQuery } from "dexie";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDataStore } from "@/lib/db/datastore";
import type { Node } from "@/types";

export function Breadcrumbs({ nodeId }: { nodeId: string }) {
  const router = useRouter();
  const [segments, setSegments] = useState<Node[]>([]);
  const currentNode = segments.at(-1) ?? null;
  const ancestors = currentNode ? segments.slice(0, -1) : [];

  useEffect(() => {
    const subscription = liveQuery(async () => {
      const dataStore = await getDataStore();
      const chain: Node[] = [];
      let current = await dataStore.getNode(nodeId);

      while (current) {
        chain.unshift(current);
        current = current.parentId ? await dataStore.getNode(current.parentId) : undefined;
      }

      return chain;
    }).subscribe({
      next: (chain) => setSegments(chain),
      error: (err) => console.error(err),
    });

    return () => subscription.unsubscribe();
  }, [nodeId]);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex h-breadcrumb flex-col justify-center gap-0.5 border-b border-border px-4"
    >
      <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-sm">
        <button
          className="text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => router.push("/")}
          type="button"
        >
          Home
        </button>
        {ancestors.map((seg) => (
          <div key={seg.id} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <button
              className="text-muted-foreground transition-colors hover:text-foreground"
              data-drop-zone="breadcrumb-node"
              data-node-id={seg.id}
              onClick={() => router.push(`/grid/${seg.id}`)}
              type="button"
            >
              {seg.title}
            </button>
          </div>
        ))}
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        <span aria-current="page" className="font-medium text-foreground">{currentNode?.title ?? "..."}</span>
      </div>
      {currentNode?.description ? (
        <p className="truncate pl-0.5 text-xs text-muted-foreground">
          {currentNode.description}
        </p>
      ) : null}
    </nav>
  );
}
