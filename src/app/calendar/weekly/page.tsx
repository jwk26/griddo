"use client";

import { addDays, endOfWeek, format, startOfToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DayColumn } from "@/components/calendar/day-column";
import { Button } from "@/components/ui/button";
import { useCalendarData } from "@/hooks/use-calendar-data";
import { useCalendarStore } from "@/stores/calendar-store";

export default function WeeklyCalendarPage() {
  const [expandedDateKey, setExpandedDateKey] = useState<string | null>(null);
  const currentWeekStart = useCalendarStore((state) => state.currentWeekStart);
  const navigateWeek = useCalendarStore((state) => state.navigateWeek);
  const { colorMap, weeklyItems } = useCalendarData();
  const todayKey = format(startOfToday(), "yyyy-MM-dd");
  const itemsByDay = weeklyItems(currentWeekStart);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = addDays(currentWeekStart, index);
        return {
          date,
          key: format(date, "yyyy-MM-dd"),
        };
      }),
    [currentWeekStart],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      const activeBit = new URLSearchParams(window.location.search).get("bit");
      if (!activeBit) {
        setExpandedDateKey(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Weekly view</p>
          <h2 className="text-lg font-semibold text-foreground">
            {format(currentWeekStart, "MMM d")} -{" "}
            {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), "MMM d, yyyy")}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon-sm" variant="outline" onClick={() => navigateWeek(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="icon-sm" variant="outline" onClick={() => navigateWeek(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto px-6 py-4">
        {days.map(({ date, key }) => (
          <div
            key={key}
            className={key === todayKey ? "rounded-[1.75rem] ring-2 ring-primary/30" : undefined}
          >
            <DayColumn
              date={date}
              expanded={expandedDateKey === key}
              items={itemsByDay.get(key) ?? []}
              onExpandedChange={(next) => setExpandedDateKey(next ? key : null)}
              parentColorMap={colorMap}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
