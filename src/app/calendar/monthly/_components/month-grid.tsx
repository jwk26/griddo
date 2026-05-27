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
import { useState } from "react";
import { DateCellPopover } from "@/app/calendar/monthly/_components/date-cell-popover";
import { CalendarViewHeader } from "@/components/calendar/calendar-view-header";
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
      aria-label={`Open ${node.title} details or drag to reschedule`}
      className={cn(
        "flex h-6 w-6 flex-shrink-0 cursor-grab items-center justify-center shadow-sm ring-1 ring-inset ring-black/5 transition-[opacity,box-shadow,filter] dark:ring-white/10",
        "hover:ring-1 hover:ring-primary/50 hover:brightness-110",
        isDragging && "cursor-grabbing opacity-40",
      )}
      style={{
        backgroundColor: node.color,
        borderRadius: "var(--theme-radius, 6px)",
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
      aria-label={`Open ${item.title} details or drag to reschedule`}
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
  nodeMap,
  onOpenChange,
}: {
  bitMap: Map<string, Bit>;
  colorMap: Map<string, string>;
  currentMonth: Date;
  date: Date;
  isSelected: boolean;
  items: Map<string, (Node | Bit | Chunk)[]>;
  nodeMap: Map<string, Node>;
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
  const isFirstOfMonth = date.getDate() === 1;
  const previewItems = getPreviewItems(dayItems);
  const overflowCount = dayItems.length - PREVIEW_ITEM_LIMIT;

  return (
    <div
      ref={setNodeRef}
      aria-label={`${format(date, "EEEE, MMMM d, yyyy")}, ${dayItems.length} ${dayItems.length === 1 ? "item" : "items"}`}
      role="group"
      className={cn(
        "flex min-h-32 cursor-pointer flex-col p-2 text-left backdrop-blur-sm transition-all hover:brightness-105",
        !isSameMonth(date, currentMonth) && "opacity-40 grayscale-[0.5]",
        isOver && "ring-2 ring-primary/40",
        isSelected && "z-10 ring-2 ring-primary",
      )}
      style={{
        background: "var(--calendar-cell-bg)",
        borderColor: isToday
          ? "var(--calendar-today-border-color)"
          : "var(--calendar-border-color)",
        borderRadius: "var(--calendar-cell-radius)",
        borderStyle: isToday
          ? "var(--calendar-today-border-style)"
          : "var(--calendar-border-style)",
        borderWidth: isToday
          ? "var(--calendar-today-border-width)"
          : "var(--calendar-border-width)",
        boxShadow: isToday
          ? "var(--calendar-today-shadow)"
          : "var(--calendar-cell-shadow)",
      }}
      onClick={() => onOpenChange(true)}
    >
      <DateCellPopover
        bitMap={bitMap}
        date={date}
        items={dayItems}
        nodeMap={nodeMap}
        onOpenChange={onOpenChange}
        open={isSelected}
      >
        <button
          aria-label={`Open details for ${format(date, "EEEE, MMMM d, yyyy")}, ${dayItems.length} ${dayItems.length === 1 ? "item" : "items"}`}
          className="flex w-full items-start justify-end gap-1 rounded-sm text-right transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          type="button"
          onClick={(e) => e.stopPropagation()}
        >
          <span
            className={cn(
              "text-xs font-medium",
              isToday
                ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                : "text-muted-foreground",
              isFirstOfMonth && !isToday && "font-semibold text-foreground",
            )}
          >
            {isFirstOfMonth ? format(date, "MMM d") : format(date, "d")}
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const currentMonth = useCalendarStore((state) => state.currentMonth);
  const navigateMonth = useCalendarStore((state) => state.navigateMonth);
  const { bitMap, colorMap, monthlyItems, nodeMap } = useCalendarData();
  const items = monthlyItems(currentMonth);
  const gridStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
  const dates = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weekdayLabels = Array.from({ length: 7 }, (_, index) =>
    format(addDays(startOfWeek(startOfToday(), { weekStartsOn: 1 }), index), "EEE"),
  );

  const handleToday = () => {
    const today = startOfMonth(new Date());
    const diff =
      (today.getFullYear() - currentMonth.getFullYear()) * 12 +
      (today.getMonth() - currentMonth.getMonth());

    if (diff !== 0) {
      navigateMonth(diff);
    }

    setSelectedDate(null);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <CalendarViewHeader
        activeView="monthly"
        nextLabel="Next month"
        onNext={() => {
          setSelectedDate(null);
          navigateMonth(1);
        }}
        onPrevious={() => {
          setSelectedDate(null);
          navigateMonth(-1);
        }}
        onToday={handleToday}
        previousLabel="Previous month"
        subtitle={format(currentMonth, "yyyy")}
        title={format(currentMonth, "MMMM")}
      />
      <div
        className="grid grid-cols-7 border-b border-border transition-colors"
        style={{ background: "var(--calendar-header-bg)" }}
      >
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70"
          >
            {label}
          </div>
        ))}
      </div>
      <div
        className="grid min-h-0 flex-1 grid-cols-7 gap-px overflow-y-auto pb-px transition-colors"
        style={{ backgroundColor: "var(--calendar-grid-line-color)" }}
      >
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
              nodeMap={nodeMap}
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
