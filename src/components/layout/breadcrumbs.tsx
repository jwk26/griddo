"use client";

import { useDroppable } from "@dnd-kit/core";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useBreadcrumbChain } from "@/hooks/use-breadcrumb-chain";
import { getGridBreadcrumbDropId } from "@/lib/grid-dnd";
import { cn } from "@/lib/utils";
import { useEditModeStore } from "@/stores/edit-mode-store";

function BreadcrumbSegmentButton({
  label,
  nodeId,
  onClick,
}: {
  label: string;
  nodeId: string | null;
  onClick: () => void;
}) {
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  const { isOver, setNodeRef } = useDroppable({
    id: getGridBreadcrumbDropId(nodeId),
    data: { kind: "grid-breadcrumb-drop", targetNodeId: nodeId },
    disabled: !isEditMode,
  });

  return (
    <button
      ref={setNodeRef}
      className={cn(
        "rounded-md px-1.5 py-0.5 text-muted-foreground transition-colors hover:text-foreground",
        isOver && "bg-accent text-foreground",
      )}
      data-drop-zone={nodeId ? "breadcrumb-node" : "breadcrumb-root"}
      data-node-id={nodeId ?? undefined}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

export function Breadcrumbs({ nodeId }: { nodeId: string | null }) {
  const router = useRouter();
  const segments = useBreadcrumbChain(nodeId ?? "");

  if (nodeId === null) {
    return (
      <nav
        aria-label="Breadcrumb"
        className="flex h-breadcrumb items-center border-b border-border px-4"
      >
        <div className="flex items-center gap-1.5 overflow-x-auto text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <BreadcrumbSegmentButton
            label="Home"
            nodeId={null}
            onClick={() => router.push("/")}
          />
        </div>
      </nav>
    );
  }

  const currentNode = segments.at(-1) ?? null;
  const ancestors = currentNode ? segments.slice(0, -1) : [];

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex h-breadcrumb items-center border-b border-border px-4"
    >
      <div className="flex items-center gap-1.5 overflow-x-auto text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <BreadcrumbSegmentButton label="Home" nodeId={null} onClick={() => router.push("/")} />
        {ancestors.map((segment) => (
          <div key={segment.id} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <BreadcrumbSegmentButton
              label={segment.title}
              nodeId={segment.id}
              onClick={() => router.push(`/grid/${segment.id}`)}
            />
          </div>
        ))}
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        <span aria-current="page" className="font-medium text-foreground">
          {currentNode?.title ?? "..."}
        </span>
      </div>
    </nav>
  );
}
