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

export function getAgingSaturation(state: AgingState): number {
  switch (state) {
    case "fresh":
      return 1;
    case "stagnant":
      return 0.5;
    case "neglected":
      return 0.2;
  }
}
