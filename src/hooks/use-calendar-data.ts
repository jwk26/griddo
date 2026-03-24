"use client";

import { liveQuery } from "dexie";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { db } from "@/lib/db/indexeddb";
import type { Bit, Chunk, Node } from "@/types";

type CalendarItem = Node | Bit | Chunk;
type PoolItem = Bit | Chunk;

type CalendarDataState = {
  nodes: Node[];
  bits: Bit[];
  chunks: Chunk[];
  isLoading: boolean;
};

const DAY_IN_MS = 86_400_000;

const INITIAL_CALENDAR_DATA: CalendarDataState = {
  nodes: [],
  bits: [],
  chunks: [],
  isLoading: true,
};

function getCalendarTimestamp(item: CalendarItem): number | null {
  if ("deadline" in item) {
    return item.deadline;
  }

  return item.time;
}

function getPoolTimestamp(item: PoolItem): number | null {
  if ("deadline" in item) {
    return item.deadline;
  }

  return item.time;
}

function getPriorityRank(item: PoolItem): number {
  if (!("priority" in item) || item.priority === null) {
    return 4;
  }

  switch (item.priority) {
    case "high":
      return 1;
    case "mid":
      return 2;
    case "low":
      return 3;
  }
}

function groupItemsByDay(
  items: CalendarItem[],
  predicate: (timestamp: number) => boolean,
): Map<string, CalendarItem[]> {
  const grouped = new Map<string, CalendarItem[]>();

  const visibleItems = items
    .filter((item) => {
      const timestamp = getCalendarTimestamp(item);
      return timestamp !== null && predicate(timestamp);
    })
    .toSorted((left, right) => {
      const leftTimestamp = getCalendarTimestamp(left) ?? 0;
      const rightTimestamp = getCalendarTimestamp(right) ?? 0;
      return leftTimestamp - rightTimestamp;
    });

  for (const item of visibleItems) {
    const timestamp = getCalendarTimestamp(item);

    if (timestamp === null) {
      continue;
    }

    const key = format(timestamp, "yyyy-MM-dd");
    const dayItems = grouped.get(key) ?? [];
    dayItems.push(item);
    grouped.set(key, dayItems);
  }

  return grouped;
}

export function useCalendarData(): {
  weeklyItems: (weekStart: Date) => Map<string, (Node | Bit | Chunk)[]>;
  monthlyItems: (month: Date) => Map<string, (Node | Bit | Chunk)[]>;
  poolItems: (Bit | Chunk)[];
  isLoading: boolean;
} {
  const [state, setState] = useState<CalendarDataState>(INITIAL_CALENDAR_DATA);

  useEffect(() => {
    const subscription = liveQuery(() =>
      Promise.all([db.nodes.toArray(), db.bits.toArray(), db.chunks.toArray()]),
    ).subscribe({
      next: ([nodes, bits, chunks]) => {
        setState({
          nodes,
          bits,
          chunks,
          isLoading: false,
        });
      },
      error: (error) => {
        console.error("liveQuery error:", error);
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  const activeNodes = state.nodes.filter((node) => node.deletedAt === null);
  const activeBits = state.bits.filter((bit) => bit.deletedAt === null);
  const activeBitIds = new Set(activeBits.map((bit) => bit.id));
  const calendarItems: CalendarItem[] = [
    ...activeNodes.filter((node) => node.deadline !== null),
    ...activeBits.filter((bit) => bit.deadline !== null),
    ...state.chunks.filter((chunk) => chunk.time !== null && activeBitIds.has(chunk.parentId)),
  ];

  const weeklyItems = (weekStart: Date) => {
    const weekStartTime = new Date(
      weekStart.getFullYear(),
      weekStart.getMonth(),
      weekStart.getDate(),
    ).getTime();
    const weekEndTime = weekStartTime + 7 * DAY_IN_MS;

    return groupItemsByDay(
      calendarItems,
      (timestamp) => timestamp >= weekStartTime && timestamp < weekEndTime,
    );
  };

  const monthlyItems = (month: Date) => {
    const monthYear = month.getFullYear();
    const monthIndex = month.getMonth();

    return groupItemsByDay(calendarItems, (timestamp) => {
      const date = new Date(timestamp);
      return date.getFullYear() === monthYear && date.getMonth() === monthIndex;
    });
  };

  const poolItems = [...activeBits, ...state.chunks.filter((chunk) => activeBitIds.has(chunk.parentId))].toSorted(
    (left, right) => {
      const leftTimestamp = getPoolTimestamp(left);
      const rightTimestamp = getPoolTimestamp(right);

      if (leftTimestamp === null && rightTimestamp !== null) {
        return 1;
      }

      if (leftTimestamp !== null && rightTimestamp === null) {
        return -1;
      }

      if (leftTimestamp !== null && rightTimestamp !== null) {
        const priorityDifference = getPriorityRank(left) - getPriorityRank(right);

        if (priorityDifference !== 0) {
          return priorityDifference;
        }

        return leftTimestamp - rightTimestamp;
      }

      return 0;
    },
  );

  return {
    weeklyItems,
    monthlyItems,
    poolItems,
    isLoading: state.isLoading,
  };
}
