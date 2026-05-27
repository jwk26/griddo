"use client";

import { addDays, format, startOfToday, startOfWeek } from "date-fns";
import { LayoutGroup } from "motion/react";
import { useMemo } from "react";
import { CalendarViewHeader } from "@/components/calendar/calendar-view-header";
import { DayColumn } from "@/components/calendar/day-column";
import { useCalendarData } from "@/hooks/use-calendar-data";
import { useCalendarStore } from "@/stores/calendar-store";

export default function WeeklyCalendarPage() {
  const currentWeekStart = useCalendarStore((state) => state.currentWeekStart);
  const expandedDay = useCalendarStore((state) => state.expandedDay);
  const navigateWeek = useCalendarStore((state) => state.navigateWeek);
  const setExpandedDay = useCalendarStore((state) => state.setExpandedDay);
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
  const todayDayIndex = days.findIndex(({ key }) => key === todayKey);
  const resolvedExpandedIndex = expandedDay ?? (todayDayIndex >= 0 ? todayDayIndex : 0);

  const handleToday = () => {
    const today = startOfWeek(new Date(), { weekStartsOn: 1 });
    const diff = Math.round(
      (today.getTime() - currentWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000),
    );

    if (diff !== 0) {
      navigateWeek(diff);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <CalendarViewHeader
        activeView="weekly"
        nextLabel="Next week"
        onNext={() => navigateWeek(1)}
        onPrevious={() => navigateWeek(-1)}
        onToday={handleToday}
        previousLabel="Previous week"
        subtitle={format(currentWeekStart, "yyyy")}
        title={format(currentWeekStart, "MMMM")}
      />

      <LayoutGroup>
        <div className="flex min-h-0 w-full flex-1 gap-3 overflow-x-auto px-6 py-4">
          {days.map(({ date, key }, index) => (
            <DayColumn
              key={key}
              date={date}
              isExpanded={index === resolvedExpandedIndex}
              isToday={key === todayKey}
              items={itemsByDay.get(key) ?? []}
              onExpand={() => setExpandedDay(index)}
              parentColorMap={colorMap}
            />
          ))}
        </div>
      </LayoutGroup>
    </div>
  );
}
