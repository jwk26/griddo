"use client";

import { addDays, endOfWeek, format, startOfToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DayColumn } from "@/components/calendar/day-column";
import { Button } from "@/components/ui/button";
import { useCalendarData } from "@/hooks/use-calendar-data";
import { cn } from "@/lib/utils";
import { useCalendarStore } from "@/stores/calendar-store";

export default function WeeklyCalendarPage() {
  const [expandedDateKey, setExpandedDateKey] = useState<string | null>(null);
  const pathname = usePathname();
  const currentWeekStart = useCalendarStore((state) => state.currentWeekStart);
  const navigateWeek = useCalendarStore((state) => state.navigateWeek);
  const { colorMap, weeklyItems } = useCalendarData();
  const todayKey = format(startOfToday(), "yyyy-MM-dd");
  const itemsByDay = weeklyItems(currentWeekStart);
  const isMonthlyRoute = pathname === "/calendar/monthly";

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
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-4">
        <div className="flex items-center justify-start gap-3">
          <Button size="icon-sm" variant="outline" onClick={() => navigateWeek(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="inline-flex items-center rounded-lg border border-border bg-muted/50 p-1">
            <Button
              asChild
              className={cn(
                "h-7 rounded-md px-3 text-xs font-medium transition-all",
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
                "h-7 rounded-md px-3 text-xs font-medium transition-all",
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
            {format(currentWeekStart, "MMM d")} –{" "}
            {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), "MMM d, yyyy")}
          </span>
        </div>
        <div className="flex justify-end">
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
