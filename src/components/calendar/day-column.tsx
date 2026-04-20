"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { format } from "date-fns";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Clock, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { NODE_ICON_MAP } from "@/lib/constants/node-icons";
import { dayColumnExpandVariants } from "@/lib/animations/calendar";
import { useCalendarActions } from "@/hooks/use-calendar-actions";
import { getCalendarDateDropId } from "@/lib/calendar-dnd";
import { cn } from "@/lib/utils";
import { CompactBitItem } from "./compact-bit-item";
import type { Bit, Chunk, Node } from "@/types";

function getItemTimestamp(item: Node | Bit | Chunk) {
  if ("deadline" in item) {
    return item.deadline;
  }

  return item.time;
}

function isAllDayItem(item: Node | Bit | Chunk) {
  if ("deadlineAllDay" in item) {
    return item.deadlineAllDay;
  }

  return item.timeAllDay;
}

function sortCalendarItems(items: (Node | Bit | Chunk)[]) {
  return items.toSorted((left, right) => {
    const leftTimestamp = getItemTimestamp(left);
    const rightTimestamp = getItemTimestamp(right);
    const leftAllDay = leftTimestamp === null || isAllDayItem(left);
    const rightAllDay = rightTimestamp === null || isAllDayItem(right);

    if (leftAllDay && !rightAllDay) {
      return -1;
    }

    if (!leftAllDay && rightAllDay) {
      return 1;
    }

    return (leftTimestamp ?? 0) - (rightTimestamp ?? 0);
  });
}

function resolveItemColor(item: Node | Bit | Chunk, parentColorMap: Map<string, string>) {
  if ("color" in item) {
    return item.color;
  }

  return parentColorMap.get(item.id) ?? "hsl(var(--border))";
}

function CompactNodeItem({
  node,
  onClick,
  onUnschedule,
}: {
  node: Node;
  onClick: () => void;
  onUnschedule: () => void;
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: `placed:${node.id}`,
    data: { id: node.id, type: "node", title: node.title },
  });
  const Icon = NODE_ICON_MAP[node.icon] ?? NODE_ICON_MAP.Box;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center gap-2 rounded-r-md border-l-4 border-transparent bg-background/70 px-3 py-1.5 text-sm hover:bg-accent/60 transition-opacity",
        "cursor-grab",
        isDragging && "cursor-grabbing",
        isDragging && "opacity-40",
      )}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      }}
    >
      <button
        type="button"
        aria-label={`Open ${node.title}`}
        className="flex min-w-0 flex-1 items-center gap-2 cursor-pointer text-left"
        onClick={onClick}
      >
        <span
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: node.color }}
        >
          <Icon className="h-3.5 w-3.5 text-white" />
        </span>
        <span className="truncate text-foreground">{node.title}</span>
      </button>
      <button
        type="button"
        aria-label={`Unschedule ${node.title}`}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
        onClick={(event) => {
          event.stopPropagation();
          onUnschedule();
        }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function PlacedNodeCard({
  node,
  onClick,
  onUnschedule,
}: {
  node: Node;
  onClick: () => void;
  onUnschedule: () => void;
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: `placed:${node.id}`,
    data: { id: node.id, type: "node", title: node.title },
  });
  const Icon = NODE_ICON_MAP[node.icon] ?? NODE_ICON_MAP.Box;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "rounded-2xl border border-border bg-card p-3 shadow-sm transition-opacity",
        "cursor-grab",
        isDragging && "cursor-grabbing",
        isDragging && "opacity-40",
      )}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          aria-label={`Open ${node.title}`}
          className="flex min-w-0 items-center gap-3 cursor-pointer text-left"
          onClick={onClick}
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{ backgroundColor: node.color }}
          >
            <Icon className="h-5 w-5 text-white" />
          </span>
          <span className="truncate text-sm font-medium text-foreground">{node.title}</span>
        </button>
        <button
          type="button"
          aria-label={`Unschedule ${node.title}`}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md cursor-pointer text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          onClick={(event) => {
            event.stopPropagation();
            onUnschedule();
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function PlacedBitCard({
  item,
  itemColor,
  onClick,
  onUnschedule,
}: {
  item: Bit;
  itemColor: string;
  onClick: () => void;
  onUnschedule: () => void;
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: `placed:${item.id}`,
    data: { id: item.id, type: "bit", title: item.title, parentId: item.parentId },
  });
  const itemTime =
    item.deadline && !item.deadlineAllDay
      ? format(new Date(item.deadline), "h:mm a")
      : null;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "rounded-2xl border border-border bg-card shadow-sm transition-opacity",
        "cursor-grab",
        isDragging && "cursor-grabbing",
        isDragging && "opacity-40",
      )}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      }}
    >
      <div className="flex items-stretch">
        <div
          className="w-[3px] flex-shrink-0 rounded-l-[14px]"
          style={{ backgroundColor: itemColor }}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2 px-3 py-3">
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              aria-label={`Open ${item.title}`}
              className="min-w-0 flex-1 cursor-pointer text-left"
              onClick={onClick}
            >
              <p
                className={cn(
                  "truncate text-sm font-medium text-foreground",
                  item.status === "complete" && "line-through text-muted-foreground opacity-60",
                )}
              >
                {item.title}
              </p>
            </button>
            <button
              type="button"
              aria-label={`Unschedule ${item.title}`}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md cursor-pointer text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={(event) => {
                event.stopPropagation();
                onUnschedule();
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{item.deadline ? format(new Date(item.deadline), "MMM d") : "No date"}</span>
            {itemTime ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {itemTime}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DayColumn({
  date,
  isExpanded,
  isToday,
  items,
  onExpand,
  parentColorMap,
}: {
  date: Date;
  isExpanded: boolean;
  isToday: boolean;
  items: (Node | Bit | Chunk)[];
  onExpand: () => void;
  parentColorMap: Map<string, string>;
}) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { unscheduleNode, unscheduleBit, unscheduleChunk } = useCalendarActions();
  const dateKey = format(date, "yyyy-MM-dd");
  const { isOver, setNodeRef } = useDroppable({
    id: getCalendarDateDropId(dateKey),
    data: {
      kind: "calendar-date",
      timestamp: date.getTime(),
      dateKey,
    },
  });
  const sortedItems = sortCalendarItems(items);

  function openBit(bitId: string) {
    const next = new URLSearchParams(window.location.search);
    next.set("bit", bitId);
    router.push(`?${next.toString()}`);
  }

  function renderSingleItem(item: Node | Bit | Chunk) {
    if ("color" in item) {
      return (
        <PlacedNodeCard
          node={item}
          onClick={() => router.push(`/grid/${item.id}`)}
          onUnschedule={() => unscheduleNode(item.id)}
        />
      );
    }

    if ("priority" in item) {
      const itemColor = resolveItemColor(item, parentColorMap);

      return (
        <PlacedBitCard
          item={item}
          itemColor={itemColor}
          onClick={() => openBit(item.id)}
          onUnschedule={() => unscheduleBit(item.id)}
        />
      );
    }

    return (
      <CompactBitItem
        item={item}
        onClick={() => openBit(item.parentId)}
        onUnschedule={() => unscheduleChunk(item.id)}
        parentColor={resolveItemColor(item, parentColorMap)}
        variant="placed"
      />
    );
  }

  return (
    <motion.div
      ref={setNodeRef}
      layout="size"
      transition={
        reducedMotion ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.45 }
      }
      className={cn(
        "flex min-w-[var(--calendar-day-min-width)] flex-col rounded-3xl border p-3 shadow-sm transition-colors",
        isExpanded
          ? "flex-[3] border-border/80 bg-card shadow-md"
          : "flex-1 border-border/40 bg-muted/30 dark:bg-card/40",
        isToday && isExpanded && "ring-2 ring-primary",
        isToday && !isExpanded && "ring-2 ring-primary/40",
        isOver && "border-primary bg-primary/5",
      )}
    >
      <button
        type="button"
        className={cn(
          "mb-3 flex w-full items-baseline justify-between gap-2 rounded-xl px-1 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          !isExpanded && "cursor-pointer hover:bg-accent/80",
        )}
        onClick={() => {
          if (!isExpanded) {
            onExpand();
          }
        }}
      >
        <div>
          <p
            className={cn(
              "text-xs uppercase tracking-[0.12em]",
              isExpanded ? "font-bold text-foreground" : "text-muted-foreground/80",
            )}
          >
            {format(date, "EEE")}
          </p>
          <p
            className={cn(
              "text-lg font-semibold",
              isToday ? "text-primary" : isExpanded ? "text-foreground" : "text-muted-foreground/80",
            )}
          >
            {format(date, "d")}
          </p>
        </div>
        <span className={cn("text-xs", isExpanded ? "text-foreground" : "text-muted-foreground")}>
          {sortedItems.length} items
        </span>
      </button>

      {sortedItems.length === 0 ? (
        <div className="flex min-h-40 flex-1 items-center justify-center rounded-2xl border border-dashed border-border text-center text-sm text-muted-foreground">
          Drop items here
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <motion.div
            animate={isExpanded ? "expanded" : "collapsed"}
            className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto"
            initial={false}
            variants={dayColumnExpandVariants}
          >
            {sortedItems.map((item) => (
              <div key={item.id}>
                {"color" in item && sortedItems.length > 1 ? (
                  <CompactNodeItem
                    node={item}
                    onClick={() => router.push(`/grid/${item.id}`)}
                    onUnschedule={() => unscheduleNode(item.id)}
                  />
                ) : (
                  renderSingleItem(item)
                )}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
