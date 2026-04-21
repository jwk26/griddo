"use client";

import { format } from "date-fns";
import { CalendarRange, FolderKanban, ListTodo, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Bit, Chunk, Node } from "@/types";

function getParentLabel(
  item: Node | Bit | Chunk,
  nodeMap: Map<string, Node>,
  bitMap: Map<string, Bit>,
): string | null {
  if ("color" in item) {
    return item.parentId ? (nodeMap.get(item.parentId)?.title ?? null) : null;
  }
  if ("priority" in item) {
    return nodeMap.get(item.parentId)?.title ?? null;
  }
  return bitMap.get(item.parentId)?.title ?? null;
}

function getTimestamp(item: Node | Bit | Chunk) {
  if ("deadline" in item) {
    return item.deadline;
  }

  return item.time;
}

function getTimeLabel(item: Node | Bit | Chunk) {
  if ("deadlineAllDay" in item) {
    return item.deadlineAllDay || item.deadline === null
      ? null
      : format(new Date(item.deadline), "h:mm a");
  }

  return item.timeAllDay || item.time === null ? null : format(new Date(item.time), "h:mm a");
}

export function DateCellPopover({
  bitMap,
  children,
  date,
  items,
  nodeMap,
  onOpenChange,
  open,
}: {
  bitMap: Map<string, Bit>;
  children: ReactNode;
  date: Date;
  items: (Node | Bit | Chunk)[];
  nodeMap: Map<string, Node>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const router = useRouter();
  const sortedItems = items.toSorted(
    (left, right) => (getTimestamp(left) ?? 0) - (getTimestamp(right) ?? 0),
  );

  function navigate(item: Node | Bit | Chunk) {
    onOpenChange(false);

    if ("color" in item) {
      router.push(`/grid/${item.id}`);
      return;
    }

    if ("priority" in item) {
      router.push(`/grid/${item.parentId}?bit=${item.id}`);
      return;
    }

    const parentBit = bitMap.get(item.parentId);
    if (parentBit) {
      router.push(`/grid/${parentBit.parentId}?bit=${parentBit.id}`);
    }
  }

  return (
    <Popover onOpenChange={onOpenChange} open={open}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="start"
        aria-label={format(date, "EEEE, MMMM d, yyyy")}
        avoidCollisions={true}
        className="flex max-h-96 w-80 flex-col rounded-2xl bg-popover p-3 shadow-xl duration-150 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none"
        side="right"
        sideOffset={12}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-bold text-foreground">{format(date, "EEEE, MMM d")}</div>
          <button
            aria-label="Close day details"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 space-y-1 overflow-y-auto">
          {sortedItems.map((item) => {
            const Icon = "color" in item ? FolderKanban : "priority" in item ? CalendarRange : ListTodo;
            const parentLabel = getParentLabel(item, nodeMap, bitMap);

            return (
              <button
                key={item.id}
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent"
                onClick={() => navigate(item)}
              >
                <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm text-foreground",
                      "status" in item && item.status === "complete" && "line-through text-muted-foreground opacity-60",
                    )}
                  >
                    {item.title}
                  </p>
                  {parentLabel ? (
                    <p className="truncate text-xs text-muted-foreground">{parentLabel}</p>
                  ) : null}
                </div>
                {getTimeLabel(item) ? (
                  <span className="flex-shrink-0 text-xs tabular-nums text-muted-foreground">{getTimeLabel(item)}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
