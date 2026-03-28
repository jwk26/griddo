"use client";

import { useDroppable } from "@dnd-kit/core";
import { AnimatePresence, motion } from "motion/react";
import { format } from "date-fns";
import { Clock, MoreHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { NODE_ICON_MAP } from "@/lib/constants/node-icons";
import { dayColumnExpandVariants } from "@/lib/animations/calendar";
import { getCalendarDateDropId } from "@/lib/calendar-dnd";
import { getDataStore } from "@/lib/db/datastore";
import { cn } from "@/lib/utils";
import { CompactBitItem } from "./compact-bit-item";
import type { Bit, Chunk, Node } from "@/types";

const COLLAPSED_ITEM_LIMIT = 5;

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
  const Icon = NODE_ICON_MAP[node.icon] ?? NODE_ICON_MAP.Box;

  return (
    <div className="flex items-center gap-2 rounded-r-md border-l-4 border-transparent bg-background/70 px-3 py-1.5 text-sm hover:bg-accent/60">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
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
        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        onClick={(event) => {
          event.stopPropagation();
          onUnschedule();
        }}
      >
        ✕
      </button>
    </div>
  );
}

export function DayColumn({
  date,
  expanded,
  items,
  onExpandedChange,
  parentColorMap,
}: {
  date: Date;
  expanded: boolean;
  items: (Node | Bit | Chunk)[];
  onExpandedChange: (expanded: boolean) => void;
  parentColorMap: Map<string, string>;
}) {
  const router = useRouter();
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
  const visibleItems = expanded ? sortedItems : sortedItems.slice(0, COLLAPSED_ITEM_LIMIT);
  const hiddenCount = sortedItems.length - visibleItems.length;

  function openBit(bitId: string) {
    const next = new URLSearchParams(window.location.search);
    next.set("bit", bitId);
    router.push(`?${next.toString()}`);
  }

  function renderSingleItem(item: Node | Bit | Chunk) {
    if ("color" in item) {
      const Icon = NODE_ICON_MAP[item.icon] ?? NODE_ICON_MAP.Box;

      return (
        <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              className="flex min-w-0 items-center gap-3 text-left"
              onClick={() => router.push(`/grid/${item.id}`)}
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-2xl"
                style={{ backgroundColor: item.color }}
              >
                <Icon className="h-5 w-5 text-white" />
              </span>
              <span className="truncate text-sm font-medium text-foreground">{item.title}</span>
            </button>
            <button
              type="button"
              aria-label={`Unschedule ${item.title}`}
              className="text-muted-foreground transition-colors hover:text-foreground"
              onClick={async () => {
                const ds = await getDataStore();
                await ds.updateNode(item.id, { deadline: null, deadlineAllDay: false });
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }

    if ("priority" in item) {
      const itemColor = resolveItemColor(item, parentColorMap);
      const itemTime =
        item.deadline && !item.deadlineAllDay
          ? format(new Date(item.deadline), "h:mm a")
          : null;

      return (
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-stretch">
            <div
              className="w-[3px] flex-shrink-0 rounded-l-[14px]"
              style={{ backgroundColor: itemColor }}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2 px-3 py-3">
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => openBit(item.id)}
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
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  onClick={async () => {
                    const ds = await getDataStore();
                    await ds.updateBit(item.id, { deadline: null, deadlineAllDay: false });
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

    return (
      <CompactBitItem
        item={item}
        onClick={() => openBit(item.parentId)}
        onUnschedule={async () => {
          const ds = await getDataStore();
          await ds.updateChunk(item.id, { time: null });
        }}
        parentColor={resolveItemColor(item, parentColorMap)}
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-w-[var(--calendar-day-min-width)] flex-1 flex-col rounded-3xl border border-border bg-card/80 p-3 shadow-sm transition-colors",
        isOver && "border-primary bg-accent/60",
      )}
      onMouseDown={(event) => {
        if (expanded && event.target === event.currentTarget) {
          onExpandedChange(false);
        }
      }}
    >
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
            {format(date, "EEE")}
          </p>
          <p className="text-lg font-semibold text-foreground">{format(date, "d")}</p>
        </div>
        <span className="text-xs text-muted-foreground">{sortedItems.length} items</span>
      </div>

      {sortedItems.length === 0 ? (
        <div className="flex min-h-40 flex-1 items-center justify-center rounded-2xl border border-dashed border-border text-center text-sm text-muted-foreground">
          Drop items here
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <motion.div
            animate={expanded ? "expanded" : "collapsed"}
            className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto"
            initial={false}
            variants={dayColumnExpandVariants}
          >
            {visibleItems.map((item) => (
              <div key={item.id}>
                {"color" in item && sortedItems.length > 1 ? (
                  <CompactNodeItem
                    node={item}
                    onClick={() => router.push(`/grid/${item.id}`)}
                    onUnschedule={async () => {
                      const ds = await getDataStore();
                      await ds.updateNode(item.id, { deadline: null, deadlineAllDay: false });
                    }}
                  />
                ) : (
                  renderSingleItem(item)
                )}
              </div>
            ))}
            {hiddenCount > 0 ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 self-start rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={() => onExpandedChange(true)}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />+{hiddenCount} more
              </button>
            ) : null}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
