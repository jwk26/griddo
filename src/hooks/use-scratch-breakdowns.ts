"use client";

import { liveQuery } from "dexie";
import { useEffect, useMemo, useState } from "react";
import { getDataStore } from "@/lib/db/datastore";
import type { ScratchBreakdown } from "@/lib/db/schema";
import type { CreatedAtSortDirection } from "@/stores/triage-preferences-store";

type BreakdownSnapshot = Readonly<{
  scratchBitId: string;
  rows: ScratchBreakdown[];
  archiveEligible: boolean;
}>;

const EMPTY_BREAKDOWNS: ScratchBreakdown[] = [];

export function useScratchBreakdowns(
  scratchBitId: string | null,
  sort: CreatedAtSortDirection = "DESC",
): {
  breakdowns: ScratchBreakdown[];
  consumedBreakdownCount: number;
  hasObservedBreakdownHistory: boolean;
  isArchiveEligible: boolean;
  createBreakdown: (content: string) => Promise<void>;
  deleteBreakdown: (id: string) => Promise<void>;
} {
  const [snapshot, setSnapshot] = useState<BreakdownSnapshot | null>(null);
  const [observedHistoryByScratch, setObservedHistoryByScratch] = useState<
    ReadonlySet<string>
  >(new Set());

  useEffect(() => {
    if (scratchBitId === null) return;

    const subscription = liveQuery(async () => {
      const dataStore = await getDataStore();
      const [rows, archiveEligibility] = await Promise.all([
        dataStore.getScratchBreakdowns(scratchBitId),
        dataStore.getScratchArchiveEligibility(scratchBitId),
      ]);
      return {
        scratchBitId,
        rows,
        archiveEligible: archiveEligibility.eligible,
      };
    }).subscribe({
      next: (nextSnapshot) => {
        if (nextSnapshot.rows.length > 0) {
          setObservedHistoryByScratch((current) => {
            if (current.has(scratchBitId)) return current;
            return new Set(current).add(scratchBitId);
          });
        }
        setSnapshot(nextSnapshot);
      },
      error: (err) => console.error("breakdowns liveQuery error:", err),
    });

    return () => subscription.unsubscribe();
  }, [scratchBitId]);

  const currentSnapshot =
    snapshot?.scratchBitId === scratchBitId ? snapshot : null;
  const allRows = currentSnapshot?.rows ?? EMPTY_BREAKDOWNS;
  const breakdowns = useMemo(
    () =>
      allRows
        .filter((row) => row.consumedAt === null)
        .toSorted((left, right) => {
          const createdAtDifference =
            sort === "ASC"
              ? left.createdAt - right.createdAt
              : right.createdAt - left.createdAt;
          if (createdAtDifference !== 0) return createdAtDifference;

          const orderDifference = left.order - right.order;
          return orderDifference !== 0
            ? orderDifference
            : left.id.localeCompare(right.id);
        }),
    [allRows, sort],
  );
  const consumedBreakdownCount = allRows.length - breakdowns.length;

  async function createBreakdown(content: string): Promise<void> {
    if (scratchBitId === null) return;
    const nextOrder =
      allRows.length === 0
        ? 0
        : Math.max(...allRows.map((row) => row.order)) + 1;
    const dataStore = await getDataStore();
    await dataStore.createScratchBreakdown({
      scratchBitId,
      content,
      order: nextOrder,
    });
  }

  async function deleteBreakdown(id: string): Promise<void> {
    const dataStore = await getDataStore();
    await dataStore.deleteScratchBreakdown(id);
  }

  return {
    breakdowns,
    consumedBreakdownCount,
    hasObservedBreakdownHistory:
      scratchBitId !== null && observedHistoryByScratch.has(scratchBitId),
    isArchiveEligible: currentSnapshot?.archiveEligible ?? false,
    createBreakdown,
    deleteBreakdown,
  };
}
