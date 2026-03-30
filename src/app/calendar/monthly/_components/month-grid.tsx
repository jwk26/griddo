"use client";

import { useDroppable } from "@dnd-kit/core";
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
import { DateCellPopover } from "@/app/calendar/monthly/_components/date-cell-popover";
import { Button } from "@/components/ui/button";
import { useCalendarData } from "@/hooks/use-calendar-data";
import { getCalendarDateDropId } from "@/lib/calendar-dnd";
import { cn } from "@/lib/utils";
import { useCalendarStore } from "@/stores/calendar-store";
import type { Bit, Chunk, Node } from "@/types";

function MonthDateCell({
  bitMap,
  colorMap,
  currentMonth,
  date,
  items,
}: {
  bitMap: Map<string, Bit>;
  colorMap: Map<string, string>;
  currentMonth: Date;
  date: Date;
  items: Map<string, (Node | Bit | Chunk)[]>;
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

  return (
    <DateCellPopover bitMap={bitMap} date={date} items={dayItems}>
      <button
        ref={setNodeRef}
        type="button"
        className={cn(
          "flex min-h-28 flex-col rounded-2xl border border-border bg-card/80 p-3 text-left transition-colors hover:bg-accent/40",
          !isSameMonth(date, currentMonth) && "opacity-50",
          isOver && "border-primary bg-accent/60",
          isToday && "ring-2 ring-primary/30",
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-foreground">{format(date, "d")}</span>
          <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {format(date, "EEE")}
          </span>
        </div>
        <div className="mt-auto flex flex-wrap gap-1.5">
          {dayItems.slice(0, 6).map((item) => (
            <span
              key={item.id}
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor:
                  "color" in item
                    ? item.color
                    : colorMap.get(item.id) ?? "hsl(var(--muted-foreground))",
              }}
            />
          ))}
        </div>
      </button>
    </DateCellPopover>
  );
}

export function MonthGrid() {
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

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Monthly view</p>
          <h2 className="text-lg font-semibold text-foreground">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon-sm" variant="outline" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="icon-sm" variant="outline" onClick={() => navigateMonth(1)}>
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
        {dates.map((date) => (
          <MonthDateCell
            key={format(date, "yyyy-MM-dd")}
            bitMap={bitMap}
            colorMap={colorMap}
            currentMonth={currentMonth}
            date={date}
            items={items}
          />
        ))}
      </div>
    </div>
  );
}
