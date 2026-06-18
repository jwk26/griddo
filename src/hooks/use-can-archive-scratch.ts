"use client";

import type { ScratchBreakdown } from "@/lib/db/schema";
import { useTriageStore } from "@/stores/triage-store";

export function useCanArchiveScratch(
  scratchId: string | null,
  breakdowns: ScratchBreakdown[],
): boolean {
  const stagedCandidates = useTriageStore((state) => state.stagedCandidates);
  if (scratchId === null || breakdowns.length === 0) return false;
  if (breakdowns.some((b) => b.consumedAt === null)) return false;
  return (stagedCandidates[scratchId] ?? []).length === 0;
}
