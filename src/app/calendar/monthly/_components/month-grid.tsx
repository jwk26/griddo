"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfToday,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DateCellPopover } from "@/app/calendar/monthly/_components/date-cell-popover";
import { Button } from "@/components/ui/button";
import { useCalendarData } from "@/hooks/use-calendar-data";
import { NODE_ICON_MAP } from "@/lib/constants/node-icons";
import { getCalendarDateDropId } from "@/lib/calendar-dnd";
import { cn } from "@/lib/utils";
import { useCalendarStore } from "@/stores/calendar-store";
import type { Bit, Chunk, Node } from "@/types";

const PREVIEW_ITEM_LIMIT = 4;

function isNode(item: Node | Bit | Chunk): item is Node {
  return "color" in item;
}

function isBit(item: Node | Bit | Chunk): item is Bit {
  return "priority" in item;
}

function getPreviewItems(items: (Node | Bit | Chunk)[]) {
  const nodes: Node[] = [];
  const details: (Bit | Chunk)[] = [];

  for (const item of items) {
    if (isNode(item)) {
      nodes.push(item);
    } else {
      details.push(item);
    }
  }

  return [...nodes, ...details].slice(0, PREVIEW_ITEM_LIMIT);
}

function getItemColor(item: Node | Bit | Chunk, colorMap: Map<string, string>) {
  if (isNode(item)) {
    return item.color;
  }

  return colorMap.get(item.id) ?? "hsl(var(--muted-foreground))";
}

function getDragTransform(
  transform: ReturnType<typeof useDraggable>["transform"],
  isDragging: boolean,
) {
  return transform
    ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${isDragging ? 0.95 : 1})`
    : isDragging
      ? "scale(0.95)"
      : undefined;
}

function DraggableNodeTile({
  node,
  onOpenDetails,
}: {
  node: Node;
  onOpenDetails: () => void;
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: `placed:${node.id}`,
    data: { id: node.id, type: "node", title: node.title },
  });
  const Icon = NODE_ICON_MAP[node.icon] ?? NODE_ICON_MAP.Box;

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`Reschedule ${node.title}`}
      className={cn(
        "flex h-6 w-6 flex-shrink-0 cursor-grab items-center justify-center rounded-md shadow-sm ring-1 ring-inset ring-black/5 transition-[opacity,box-shadow,filter] dark:ring-white/10",
        "hover:ring-1 hover:ring-primary/50 hover:brightness-110",
        isDragging && "cursor-grabbing opacity-40",
      )}
      style={{
        backgroundColor: node.color,
        transform: getDragTransform(transform, isDragging),
      }}
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onOpenDetails();
      }}
    >
      <Icon className="h-3.5 w-3.5 text-white" />
    </button>
  );
}

function DraggableDot({
  color,
  item,
  onOpenDetails,
}: {
  color: string;
  item: Bit | Chunk;
  onOpenDetails: () => void;
}) {
  const itemType = isBit(item) ? "bit" : "chunk";
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: `placed:${item.id}`,
    data: { id: item.id, type: itemType, title: item.title, parentId: item.parentId },
  });

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`Reschedule ${item.title}`}
      className={cn(
        "h-2.5 w-2.5 flex-shrink-0 cursor-grab rounded-full transition-[opacity,box-shadow,filter]",
        "hover:ring-1 hover:ring-primary/50 hover:brightness-110",
        isDragging && "cursor-grabbing opacity-40",
      )}
      style={{
        backgroundColor: color,
        transform: getDragTransform(transform, isDragging),
      }}
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onOpenDetails();
      }}
    />
  );
}

function MonthDateCell({
  bitMap,
  colorMap,
  currentMonth,
  date,
  isSelected,
  items,
  onOpenChange,
}: {
  bitMap: Map<string, Bit>;
  colorMap: Map<string, string>;
  currentMonth: Date;
  date: Date;
  isSelected: boolean;
  items: Map<string, (Node | Bit | Chunk)[]>;
  onOpenChange: (open: boolean) => void;
}) {
  const dateKey = format(date, "yyyy-MM-dd");
  const dayItems = items.get(dateKey) ?? [];
  const { isOver, setNodeRef } = useDroppable({
    id: getCalendarDateDropId(dateKey),
    data: {
      kind: "calendar-date",
      timestamp: date.getTime(),
      dateKey,
    },
  });
  const isToday = isSameDay(date, startOfToday());
  const previewItems = getPreviewItems(dayItems);
  const overflowCount = dayItems.length - PREVIEW_ITEM_LIMIT;

  return (
    <div
      ref={setNodeRef}
      aria-label={`${format(date, "EEEE, MMMM d, yyyy")}, ${dayItems.length} ${dayItems.length === 1 ? "item" : "items"}`}
      role="group"
      className={cn(
        "flex min-h-28 flex-col rounded border border-border bg-card/80 p-3 text-left backdrop-blur-sm transition-colors hover:border-accent hover:bg-accent/40",
        isToday && "border-primary/50 ring-2 ring-primary/40",
        !isSameMonth(date, currentMonth) && "opacity-40 grayscale-[0.5]",
        isOver && "border-primary bg-primary/5",
        isSelected && "bg-accent/60 ring-2 ring-primary/20",
      )}
    >
      <DateCellPopover
        bitMap={bitMap}
        date={date}
        items={dayItems}
        onOpenChange={onOpenChange}
        open={isSelected}
      >
        <button
          aria-label={`Open details for ${format(date, "EEEE, MMMM d, yyyy")}, ${dayItems.length} ${dayItems.length === 1 ? "item" : "items"}`}
          className="mb-3 flex w-full items-center justify-between gap-2 rounded-sm text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          type="button"
        >
          <span className={cn("text-sm font-semibold text-foreground", isToday && "text-primary")}>
            {format(date, "d")}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {format(date, "EEE")}
          </span>
        </button>
      </DateCellPopover>
      <div
        className="mt-auto flex items-center gap-1"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        {previewItems.map((item) =>
          isNode(item) ? (
            <DraggableNodeTile
              key={item.id}
              node={item}
              onOpenDetails={() => onOpenChange(true)}
            />
          ) : (
            <DraggableDot
              key={item.id}
              color={getItemColor(item, colorMap)}
              item={item}
              onOpenDetails={() => onOpenChange(true)}
            />
          ),
        )}
        {overflowCount > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-sm bg-muted px-1 text-[10px] font-bold text-muted-foreground">
            +{overflowCount}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function MonthGrid() {
  const pathname = usePathname();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const currentMonth = useCalendarStore((state) => state.currentMonth);
  const navigateMonth = useCalendarStore((state) => state.navigateMonth);
  const { bitMap, colorMap, monthlyItems } = useCalendarData();
  const items = monthlyItems(currentMonth);
  const gridStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
  const dates = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weekdayLabels = Array.from({ length: 7 }, (_, index) =>
    format(addDays(startOfWeek(startOfToday(), { weekStartsOn: 1 }), index), "EEE"),
  );
  const isMonthlyRoute = pathname === "/calendar/monthly";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-4">
        <div className="flex items-center justify-start gap-3">
          <Button size="icon-sm" variant="outline" onClick={() => { setSelectedDate(null); navigateMonth(-1); }}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="inline-flex items-center rounded-lg border border-border bg-muted/50 p-1">
            <Button
              asChild
              className={cn(
                "h-7 rounded-md px-3 text-xs font-medium transition-colors",
                isMonthlyRoute
                  ? "text-muted-foreground hover:bg-transparent hover:text-foreground"
                  : "bg-background text-foreground shadow-sm hover:bg-background hover:text-foreground",
              )}
              size="sm"
              variant="ghost"
            >
              <Link href="/calendar/weekly">Weekly</Link>
            </Button>
            <Button
              asChild
              className={cn(
                "h-7 rounded-md px-3 text-xs font-medium transition-colors",
                isMonthlyRoute
                  ? "bg-background text-foreground shadow-sm hover:bg-background hover:text-foreground"
                  : "text-muted-foreground hover:bg-transparent hover:text-foreground",
              )}
              size="sm"
              variant="ghost"
            >
              <Link href="/calendar/monthly">Monthly</Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-center">
          <span className="text-lg font-semibold tracking-tight tabular-nums">
            {format(currentMonth, "MMMM yyyy")}
          </span>
        </div>
        <div className="flex justify-end">
          <Button size="icon-sm" variant="outline" onClick={() => { setSelectedDate(null); navigateMonth(1); }}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-3 px-6 py-4">
        {weekdayLabels.map((label) => (
          <div key={label} className="px-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7 gap-3 overflow-y-auto px-6 pb-6">
        {dates.map((date) => {
          const dateKey = format(date, "yyyy-MM-dd");

          return (
            <MonthDateCell
              key={dateKey}
              bitMap={bitMap}
              colorMap={colorMap}
              currentMonth={currentMonth}
              date={date}
              isSelected={selectedDate === dateKey}
              items={items}
              onOpenChange={(open) => {
                if (open) {
                  setSelectedDate(dateKey);
                  return;
                }

                setSelectedDate(null);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
