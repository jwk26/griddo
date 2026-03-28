"use client";

import { format } from "date-fns";
import { CalendarRange, FolderKanban, ListTodo } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Bit, Chunk, Node } from "@/types";

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
}: {
  bitMap: Map<string, Bit>;
  children: ReactNode;
  date: Date;
  items: (Node | Bit | Chunk)[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const sortedItems = items.toSorted(
    (left, right) => (getTimestamp(left) ?? 0) - (getTimestamp(right) ?? 0),
  );

  function navigate(item: Node | Bit | Chunk) {
    setOpen(false);

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
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-3">
        <PopoverHeader className="mb-3">
          <PopoverTitle>{format(date, "EEEE, MMM d")}</PopoverTitle>
        </PopoverHeader>
        <div className="space-y-1">
          {sortedItems.map((item) => {
            const Icon = "color" in item ? FolderKanban : "priority" in item ? CalendarRange : ListTodo;

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
                </div>
                {getTimeLabel(item) ? (
                  <span className="text-xs text-muted-foreground">{getTimeLabel(item)}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
