"use client";

import { addMonths, addWeeks, startOfMonth, startOfWeek } from "date-fns";
import { create } from "zustand";

interface CalendarState {
  drillDownPath: string[];
  currentWeekStart: Date;
  currentMonth: Date;
  isPoolCollapsed: boolean;
  pushDrillDown: (nodeId: string) => void;
  popDrillDown: () => void;
  resetDrillDown: () => void;
  navigateWeek: (direction: 1 | -1) => void;
  navigateMonth: (direction: 1 | -1) => void;
  setPoolCollapsed: (collapsed: boolean) => void;
  togglePool: () => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  drillDownPath: [],
  currentWeekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
  currentMonth: startOfMonth(new Date()),
  isPoolCollapsed: false,
  pushDrillDown: (nodeId) =>
    set((state) => ({ drillDownPath: [...state.drillDownPath, nodeId] })),
  popDrillDown: () =>
    set((state) => ({ drillDownPath: state.drillDownPath.slice(0, -1) })),
  resetDrillDown: () => set({ drillDownPath: [] }),
  navigateWeek: (direction) =>
    set((state) => ({
      currentWeekStart: addWeeks(state.currentWeekStart, direction),
    })),
  navigateMonth: (direction) =>
    set((state) => ({
      currentMonth: addMonths(state.currentMonth, direction),
    })),
  setPoolCollapsed: (collapsed) => set({ isPoolCollapsed: collapsed }),
  togglePool: () =>
    set((state) => ({ isPoolCollapsed: !state.isPoolCollapsed })),
}));
