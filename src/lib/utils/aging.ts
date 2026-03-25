import { AGING_FRESH_DAYS, AGING_STAGNANT_DAYS } from "@/lib/constants";
import type { AgingState } from "@/types";

const DAY_IN_MS = 86_400_000;

export function getAgingState(mtime: number): AgingState {
  const daysSinceMtime = Math.floor((Date.now() - mtime) / DAY_IN_MS);

  if (daysSinceMtime <= AGING_FRESH_DAYS) {
    return "fresh";
  }

  if (daysSinceMtime <= AGING_STAGNANT_DAYS) {
    return "stagnant";
  }

  return "neglected";
}

export function getAgingFilter(state: AgingState): string {
  switch (state) {
    case "fresh":
      return "saturate(1)";
    case "stagnant":
      return "saturate(0.5) brightness(0.9)";
    case "neglected":
      return "saturate(0.2) brightness(0.75)";
  }
}
