"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { format } from "date-fns";
import { Check, MoreHorizontal, X } from "lucide-react";
import { NODE_ICON_MAP } from "@/lib/constants/node-icons";
import { cn } from "@/lib/utils";
import { getAgingFilter, getAgingState } from "@/lib/utils/aging";
import { getUrgencyLevel, isPastDeadline } from "@/lib/utils/urgency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useArchiveActions } from "@/hooks/use-archive";
import { useEditModeStore } from "@/stores/edit-mode-store";
import type { Bit } from "@/types";

type BitCardProps = {
  bit: Bit;
  parentColor: string;
  chunkStats: { completed: number; total: number };
  onClick: () => void;
  onDelete?: () => void;
  isDragging?: boolean;
  isNewlyPlaced?: boolean;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "onClick">;

export const BitCard = forwardRef<HTMLDivElement, BitCardProps>(function BitCard(
  {
    bit,
    parentColor,
    chunkStats,
    onClick,
    onDelete,
    isDragging = false,
    isNewlyPlaced = false,
    className,
    onKeyDown,
    role,
    style,
    tabIndex,
    ...divProps
  },
  ref,
) {
  const agingFilter = getAgingFilter(getAgingState(bit.mtime));
  const urgencyLevel = getUrgencyLevel(bit.deadline);
  const pastDeadline = isPastDeadline(bit.deadline);
  const isComplete = bit.status === "complete";
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  const Icon = NODE_ICON_MAP[bit.icon] ?? NODE_ICON_MAP.Box;
  const { archive } = useArchiveActions();
  const formattedDeadline = bit.deadline ? format(new Date(bit.deadline), "MMM d") : null;

  return (
    <div
      {...divProps}
      data-newly-placed={isNewlyPlaced ? "true" : undefined}
      className={cn(
        "group/bit relative z-10 inline-flex shrink-0 cursor-grab select-none items-stretch rounded-[10px] border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-colors hover:bg-accent/50 active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        isDragging && "z-20 cursor-grabbing",
        urgencyLevel === 1 && "animate-urgency-blink-1",
        urgencyLevel === 2 && "animate-urgency-blink-2",
        urgencyLevel === 3 && "animate-urgency-blink-3",
        isEditMode && "motion-safe:animate-jiggle",
        isComplete && "opacity-50",
        className,
      )}
      ref={ref}
      onClick={onClick}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) {
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      role={role ?? "button"}
      style={{ ...style, filter: agingFilter }}
      tabIndex={tabIndex ?? 0}
    >
      {/* Color accent — spans full card height */}
      <div
        className="w-[3px] flex-shrink-0 rounded-l-[2px]"
        style={{ backgroundColor: parentColor }}
      />

      {/* Card content */}
      <div className="flex flex-1 flex-col gap-2 py-[10px] pl-3 pr-[14px]">

        {/* Row 1: icon + title/meta + priority badge */}
        <div className="flex items-start gap-3">
          <Icon className="h-[18px] w-[18px] flex-shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate text-[13px] font-medium text-foreground",
                (pastDeadline || isComplete) && "line-through text-muted-foreground",
              )}
            >
              {bit.title}
            </p>
            {formattedDeadline ? (
              <p
                className={cn(
                  "mt-0.5 text-[11px] text-muted-foreground",
                  pastDeadline && "text-destructive",
                )}
              >
                {formattedDeadline}
              </p>
            ) : null}
          </div>
          {bit.priority ? (
            <span
              className={cn(
                "inline-flex flex-shrink-0 items-center rounded-full px-[7px] py-[2px] text-[10px] font-semibold uppercase tracking-[0.05em]",
                bit.priority === "high" && "bg-priority-high-bg text-priority-high",
                bit.priority === "mid" && "bg-priority-mid-bg text-priority-mid",
                bit.priority === "low" && "bg-priority-low-bg text-priority-low",
              )}
            >
              {bit.priority}
            </span>
          ) : null}
        </div>

        {/* Row 2: progress bar + chunk count (conditional) */}
        {chunkStats.total > 0 ? (
          <div className="flex items-center gap-2">
            <div
              className="h-[5px] overflow-hidden rounded-full bg-secondary"
              style={{ flex: "0 0 80%" }}
            >
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.round((chunkStats.completed / chunkStats.total) * 100)}%`,
                }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground">
              {chunkStats.completed}/{chunkStats.total}
            </span>
          </div>
        ) : null}
      </div>

      {isNewlyPlaced ? (
        <span
          className="absolute left-0 top-0 z-20 text-[10px] font-semibold"
          data-card-marker="newly-placed"
        >
          Newly placed
        </span>
      ) : null}

      {/* Past-deadline overlay */}
      {pastDeadline ? (
        <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-[10px] bg-background/50 backdrop-blur-[3px]">
          <span className="text-[13px] font-semibold text-foreground">Done?</span>
          <button
            type="button"
            aria-label="Mark as done"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Dismiss"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {/* Edit mode delete overlay */}
      {isEditMode ? (
        <button
          type="button"
          aria-label={`Delete ${bit.title}`}
          className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
          onClick={(event) => {
            event.stopPropagation();
            onDelete?.();
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}

      {!isEditMode ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`${bit.title} options`}
              className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover/bit:opacity-60"
              onClick={(event) => event.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom" sideOffset={4}>
            <DropdownMenuItem onClick={() => void archive("bit", bit.id)}>
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
});
