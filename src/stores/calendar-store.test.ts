import { addWeeks, startOfWeek } from "date-fns";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCalendarStore } from "./calendar-store";

describe("useCalendarStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15, 9, 0));
    useCalendarStore.setState({
      currentMonth: new Date(2026, 3, 1),
      currentWeekStart: startOfWeek(new Date(2026, 3, 15), { weekStartsOn: 1 }),
      drillDownPath: [],
      expandedDay: null,
      isPoolCollapsed: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    useCalendarStore.setState({
      currentMonth: new Date(),
      currentWeekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
      drillDownPath: [],
      isPoolCollapsed: false,
    });
  });

  it("stores an explicit expanded day index", () => {
    useCalendarStore.getState().setExpandedDay(3);

    expect(useCalendarStore.getState().expandedDay).toBe(3);
  });

  it("resets the expanded day when navigating weeks", () => {
    const initialWeek = useCalendarStore.getState().currentWeekStart;
    useCalendarStore.getState().setExpandedDay(4);

    useCalendarStore.getState().navigateWeek(1);

    expect(useCalendarStore.getState().currentWeekStart).toEqual(addWeeks(initialWeek, 1));
    expect(useCalendarStore.getState().expandedDay).toBeNull();
  });
});
