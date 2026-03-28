"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useBreadcrumbChain } from "@/hooks/use-breadcrumb-chain";

export function Breadcrumbs({ nodeId }: { nodeId: string }) {
  const router = useRouter();
  const segments = useBreadcrumbChain(nodeId);
  const currentNode = segments.at(-1) ?? null;
  const ancestors = currentNode ? segments.slice(0, -1) : [];

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
