"use client";

import { MoreHorizontal, X } from "lucide-react";
import { motion, type HTMLMotionProps } from "motion/react";
import type { Ref } from "react";
import { NODE_ICON_MAP } from "@/lib/constants/node-icons";
import {
  nodeCardTransition,
  nodeCardVariants,
} from "@/lib/animations/grid";
import { getAgingFilter, getAgingState } from "@/lib/utils/aging";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useArchiveActions } from "@/hooks/use-archive";
import type { Node } from "@/types";

type NodeCardProps = {
  node: Node;
  onClick: () => void;
  onDelete?: () => void;
  isEditMode?: boolean;
  isDragging?: boolean;
  isNewlyPlaced?: boolean;
  ref?: Ref<HTMLButtonElement>;
} & Omit<
  HTMLMotionProps<"button">,
  | "animate"
  | "children"
  | "initial"
  | "onClick"
  | "transition"
  | "variants"
  | "whileHover"
>;

export function NodeCard({
  node,
  onClick,
  onDelete,
  isEditMode = false,
  isDragging = false,
  isNewlyPlaced = false,
  className,
  ref,
  style,
  ...buttonProps
}: NodeCardProps) {
  const Icon = NODE_ICON_MAP[node.icon] ?? NODE_ICON_MAP.Box;
  const agingFilter = getAgingFilter(getAgingState(node.mtime));
  const { archive } = useArchiveActions();

  return (
    <div
      className="group/card relative flex h-full items-center justify-center"
      data-newly-placed={isNewlyPlaced ? "true" : undefined}
    >
      <motion.button
        {...buttonProps}
        ref={ref}
        type="button"
        aria-label={buttonProps["aria-label"] ?? node.title}
        animate={isDragging ? "dragging" : "rest"}
        className={cn(
          "theme-node-card relative grid h-[var(--grid-node-size)] w-[var(--grid-node-size)] max-h-full max-w-full cursor-grab grid-rows-[1fr_var(--grid-node-title-height)] justify-items-center px-[var(--grid-node-padding-x)] pb-[var(--grid-node-padding-bottom)] pt-[var(--grid-node-padding-top)] transition-[box-shadow,background-color] hover:bg-muted/40 active:cursor-grabbing active:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isDragging && "cursor-grabbing bg-muted/60 [box-shadow:var(--theme-shadow-hover)]",
          isEditMode && "motion-safe:animate-jiggle",
          className,
        )}
        data-newly-placed={isNewlyPlaced ? "true" : undefined}
        initial={false}
        onClick={onClick}
        style={{ ...style, filter: agingFilter }}
        transition={nodeCardTransition}
        variants={nodeCardVariants}
        whileHover={isDragging ? undefined : "hover"}
      >
        {isNewlyPlaced ? (
          <span
            className="absolute left-0 top-0 z-20 text-[10px] font-semibold"
            data-card-marker="newly-placed"
          >
            Newly placed
          </span>
        ) : null}
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

      {!isEditMode && node.systemRole === null ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`${node.title} options`}
              className="absolute right-1 top-0 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover/card:opacity-60"
              onClick={(event) => event.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom" sideOffset={4}>
            <DropdownMenuItem onClick={() => void archive("node", node.id)}>
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
