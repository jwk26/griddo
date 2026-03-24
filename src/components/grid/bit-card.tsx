"use client";

import { format } from "date-fns";
import { NODE_ICON_MAP } from "@/lib/constants/node-icons";
import { cn } from "@/lib/utils";
import { getAgingSaturation, getAgingState } from "@/lib/utils/aging";
import { getUrgencyLevel, isPastDeadline } from "@/lib/utils/urgency";
import { useEditModeStore } from "@/stores/edit-mode-store";
import type { Bit } from "@/types";

type BitCardProps = {
  bit: Bit;
  parentColor: string;
  chunkStats: { completed: number; total: number };
  onClick: () => void;
};

export function BitCard({ bit, parentColor, chunkStats, onClick }: BitCardProps) {
  const saturation = getAgingSaturation(getAgingState(bit.mtime));
  const urgencyLevel = getUrgencyLevel(bit.deadline);
  const pastDeadline = isPastDeadline(bit.deadline);
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  const Icon = NODE_ICON_MAP[bit.icon] ?? NODE_ICON_MAP.Box;
  const formattedDeadline = bit.deadline ? format(new Date(bit.deadline), "MMM d") : null;

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm transition-colors hover:bg-accent/50",
        "cursor-pointer",
        urgencyLevel === 1 && "animate-urgency-blink-1",
        urgencyLevel === 2 && "animate-urgency-blink-2",
        urgencyLevel === 3 && "animate-urgency-blink-3",
        isEditMode && "motion-safe:animate-jiggle",
      )}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      role="button"
      style={{ filter: `saturate(${saturation})` }}
      tabIndex={0}
    >
      <div
        className="w-1 flex-shrink-0 self-stretch rounded-full"
        style={{ backgroundColor: parentColor }}
      />
      <Icon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-medium text-foreground",
            pastDeadline && "line-through text-muted-foreground",
          )}
        >
          {bit.title}
        </p>
        {formattedDeadline ? (
          <p
            className={cn(
              "mt-0.5 text-xs text-muted-foreground",
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
            "inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium",
            bit.priority === "high" && "bg-priority-high-bg text-priority-high",
            bit.priority === "mid" && "bg-priority-mid-bg text-priority-mid",
            bit.priority === "low" && "bg-priority-low-bg text-priority-low",
          )}
        >
          {bit.priority}
        </span>
      ) : null}
      {chunkStats.total > 0 ? (
        <div className="h-1.5 w-16 flex-shrink-0 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.round((chunkStats.completed / chunkStats.total) * 100)}%` }}
          />
        </div>
      ) : null}
      {pastDeadline ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-[2px]">
          <span className="text-xs font-medium text-muted-foreground">Done?</span>
        </div>
      ) : null}
    </div>
  );
}
