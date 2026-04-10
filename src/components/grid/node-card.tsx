"use client";

import { X } from "lucide-react";
import { NODE_ICON_MAP } from "@/lib/constants/node-icons";
import { getAgingFilter, getAgingState } from "@/lib/utils/aging";
import { cn } from "@/lib/utils";
import type { Node } from "@/types";

export function NodeCard({
  node,
  onClick,
  onDelete,
  isEditMode = false,
  isDragging = false,
}: {
  node: Node;
  onClick: () => void;
  onDelete?: () => void;
  isEditMode?: boolean;
  isDragging?: boolean;
}) {
  const Icon = NODE_ICON_MAP[node.icon] ?? NODE_ICON_MAP.Box;
  const agingFilter = getAgingFilter(getAgingState(node.mtime));

  return (
    <div className="relative flex h-full items-center justify-center">
      <button
        type="button"
        className={cn(
          "grid h-[var(--grid-node-size)] w-[var(--grid-node-size)] max-h-full max-w-full cursor-grab grid-rows-[1fr_var(--grid-node-title-height)] justify-items-center rounded-3xl bg-card px-[var(--grid-node-padding-x)] pb-[var(--grid-node-padding-bottom)] pt-[var(--grid-node-padding-top)] shadow-[0_4px_14px_rgba(15,23,42,0.10)] transition-[transform,box-shadow,background-color] hover:scale-[1.02] hover:bg-muted/40 hover:shadow-[0_10px_24px_rgba(15,23,42,0.14)] active:cursor-grabbing active:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isDragging && "cursor-grabbing scale-[1.02] bg-muted/60 shadow-[0_10px_24px_rgba(15,23,42,0.14)]",
          isEditMode && "motion-safe:animate-jiggle",
        )}
        onClick={onClick}
        style={{ filter: agingFilter }}
      >
        {/* Fixed icon slot so title length never shifts or scales the icon */}
        <div className="flex min-h-0 items-center justify-center self-center pb-[var(--grid-node-icon-lift)]">
          <Icon
            className="h-[var(--grid-node-icon-size)] w-[var(--grid-node-icon-size)] shrink-0"
            style={{ color: node.color }}
          />
        </div>
        {/* Fixed title slot so short titles remain visible and long ones ellipsize */}
        <div className="h-[var(--grid-node-title-height)] w-full overflow-hidden self-start">
          <p className="truncate whitespace-nowrap text-center text-[11px] font-semibold leading-[var(--grid-node-title-height)] text-foreground">
            {node.title}
          </p>
        </div>
      </button>

      {isEditMode ? (
        <button
          type="button"
          aria-label={`Delete ${node.title}`}
          className="absolute right-1 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
          onClick={(event) => {
            event.stopPropagation();
            onDelete?.();
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
