"use client";

import { useDroppable } from "@dnd-kit/core";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, forwardRef } from "react";
import type { DragActiveItem } from "@/hooks/use-dnd";
import { useBreadcrumbChain } from "@/hooks/use-breadcrumb-chain";
import { getGridBreadcrumbDropId } from "@/lib/grid-dnd";
import { cn } from "@/lib/utils";
import { BreadcrumbDeadline } from "./breadcrumb-deadline";

function BreadcrumbSegmentButton({
  label,
  nodeId,
  onClick,
  dragActiveItem,
}: {
  label: string;
  nodeId: string | null;
  onClick: () => void;
  dragActiveItem?: DragActiveItem;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: getGridBreadcrumbDropId(nodeId),
    data: {
      kind: "grid-breadcrumb-drop",
      targetNodeId: nodeId,
      targetNodeTitle: label,
    },
    disabled: nodeId === null && dragActiveItem?.type === "bit",
  });

  return (
    <button
      ref={setNodeRef}
      className={cn(
        "rounded-md px-1.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground shrink-0 whitespace-nowrap",
        isOver && "bg-accent text-accent-foreground",
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

export const Breadcrumbs = forwardRef<
  HTMLDivElement,
  { nodeId: string | null; dragActiveItem?: DragActiveItem }
>(function Breadcrumbs({ nodeId, dragActiveItem }, ref) {
  const router = useRouter();
  const segments = useBreadcrumbChain(nodeId ?? "");
  const navClassName = cn(
    "pointer-events-auto flex h-8 w-fit items-center gap-0.5 rounded-lg border border-border/40 pl-2 pr-3 shadow-sm backdrop-blur-md max-w-[calc(100%-2rem)] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    dragActiveItem
      ? "bg-background/95 ring-2 ring-primary/20"
      : "bg-background/80",
  );

  if (nodeId === null) {
    return (
      <div className="flex flex-col items-start gap-2" ref={ref}>
        <nav aria-label="Breadcrumb" className={navClassName}>
          <BreadcrumbSegmentButton
            dragActiveItem={dragActiveItem}
            label="Home"
            nodeId={null}
            onClick={() => router.push("/")}
          />
        </nav>
      </div>
    );
  }

  const currentNode = segments.at(-1) ?? null;
  const ancestors = currentNode ? segments.slice(0, -1) : [];

  return (
    <div className="flex flex-col items-start gap-2" ref={ref}>
      <nav aria-label="Breadcrumb" className={navClassName}>
        <BreadcrumbSegmentButton
          dragActiveItem={dragActiveItem}
          label="Home"
          nodeId={null}
          onClick={() => router.push("/")}
        />
        {ancestors.map((segment) => (
          <Fragment key={segment.id}>
            <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />
            <BreadcrumbSegmentButton
              dragActiveItem={dragActiveItem}
              label={segment.title}
              nodeId={segment.id}
              onClick={() => router.push(`/grid/${segment.id}`)}
            />
          </Fragment>
        ))}
        <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />
        <span
          aria-current="page"
          className="px-1.5 text-xs font-semibold text-foreground whitespace-nowrap shrink-0"
        >
          {currentNode?.title ?? "..."}
        </span>
      </nav>
      <BreadcrumbDeadline nodeId={nodeId} />
    </div>
  );
});
