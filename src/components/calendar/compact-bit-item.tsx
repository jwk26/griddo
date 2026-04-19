"use client";

import { useDraggable } from "@dnd-kit/core";
import { format } from "date-fns";
import { Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Bit, Chunk } from "@/types";

type CompactBitItemProps = {
  item: Bit | Chunk;
  parentColor: string;
  onClick: () => void;
  onUnschedule?: () => void;
  variant: "pool" | "placed";
};

function getItemTimestamp(item: Bit | Chunk) {
  return "deadline" in item ? item.deadline : item.time;
}

function isAllDayItem(item: Bit | Chunk) {
  return "deadlineAllDay" in item ? item.deadlineAllDay : item.timeAllDay;
}

export function CompactBitItem({
  item,
  parentColor,
  onClick,
  onUnschedule,
  variant,
}: CompactBitItemProps) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: {
      id: item.id,
      type: "deadline" in item ? "bit" : "chunk",
      title: item.title,
      parentId: "parentId" in item ? item.parentId : undefined,
    },
  });
  const timestamp = getItemTimestamp(item);
  const isComplete = item.status === "complete";

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center gap-2 border-l-4 px-3 py-1.5 text-sm transition-opacity",
        "rounded-r-md bg-background/70 hover:bg-accent/60",
        "cursor-grab",
        isDragging && "cursor-grabbing",
        isDragging && "opacity-40",
        isComplete && "opacity-50",
      )}
      style={{
        borderLeftColor: parentColor,
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      }}
    >
      <button
        type="button"
        aria-label={`Open ${item.title}`}
        className="flex min-w-0 flex-1 items-center gap-2 cursor-pointer text-left"
        onClick={onClick}
      >
        <span
          className={cn(
            "flex-1 truncate text-foreground",
            isComplete && "line-through text-muted-foreground",
          )}
        >
          {item.title}
        </span>
        {timestamp !== null && !isAllDayItem(item) ? (
          <span className="flex-shrink-0 text-xs text-muted-foreground">
            {format(new Date(timestamp), "h:mm a")}
          </span>
        ) : null}
      </button>
      {onUnschedule ? (
        <button
          type="button"
          aria-label={`Unschedule ${item.title}`}
          className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md transition-colors cursor-pointer",
            variant === "pool"
              ? "text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
          onClick={(event) => {
            event.stopPropagation();
            onUnschedule();
          }}
        >
          {variant === "pool" ? (
            <Trash2 className="h-3.5 w-3.5" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </button>
      ) : null}
    </div>
  );
}
