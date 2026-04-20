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
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

  return (
    <DateCellPopover
      bitMap={bitMap}
      date={date}
      items={dayItems}
      onOpenChange={onOpenChange}
      open={isSelected}
    >
      <button
        ref={setNodeRef}
        aria-label={`${format(date, "EEEE, MMMM d, yyyy")}, ${dayItems.length} ${dayItems.length === 1 ? "item" : "items"}`}
        type="button"
        className={cn(
          "flex min-h-28 flex-col rounded border border-border bg-card/80 p-3 text-left backdrop-blur-sm transition-colors hover:border-accent hover:bg-accent/40",
          isToday && "border-primary/50 ring-2 ring-primary/40",
          !isSameMonth(date, currentMonth) && "opacity-40 grayscale-[0.5]",
          isOver && "border-primary bg-primary/5",
          isSelected && "bg-accent/60 ring-2 ring-primary/20",
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className={cn("text-sm font-semibold text-foreground", isToday && "text-primary")}>
            {format(date, "d")}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
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
