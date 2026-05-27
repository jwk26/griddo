"use client";

import { X } from "lucide-react";
import { motion } from "motion/react";
import { NODE_ICON_MAP } from "@/lib/constants/node-icons";
import {
  nodeCardTransition,
  nodeCardVariants,
} from "@/lib/animations/grid";
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
      <motion.button
        type="button"
        animate={isDragging ? "dragging" : "rest"}
        className={cn(
          "theme-node-card group relative grid h-[var(--grid-node-size)] w-[var(--grid-node-size)] max-h-full max-w-full cursor-grab grid-rows-[1fr_var(--grid-node-title-height)] justify-items-center overflow-hidden px-[var(--grid-node-padding-x)] pb-[var(--grid-node-padding-bottom)] pt-[var(--grid-node-padding-top)] transition-[box-shadow,background-color,filter] hover:bg-muted/40 active:cursor-grabbing active:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isDragging && "cursor-grabbing bg-muted/60",
          isEditMode && "motion-safe:animate-jiggle",
        )}
        initial={false}
        onClick={onClick}
        style={{ filter: agingFilter }}
        transition={nodeCardTransition}
        variants={nodeCardVariants}
        whileHover={isDragging ? undefined : "hover"}
      >
        {/* Fixed icon slot so title length never shifts or scales the icon */}
        <div className="flex min-h-0 items-center justify-center self-center pb-[var(--grid-node-icon-lift)]">
          <Icon
            className="h-[var(--grid-node-icon-size)] w-[var(--grid-node-icon-size)] shrink-0 opacity-80 transition-opacity group-hover:opacity-100"
            style={{ color: node.color }}
          />
        </div>
        {/* Fixed title slot so short titles remain visible and long ones ellipsize */}
        <div className="h-[var(--grid-node-title-height)] w-full overflow-hidden self-start">
          <p className="truncate whitespace-nowrap text-center text-[11px] font-semibold leading-[var(--grid-node-title-height)] text-foreground transition-colors group-hover:text-primary">
            {node.title}
          </p>
        </div>
      </motion.button>

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
