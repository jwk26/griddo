import {
  URGENCY_LEVEL_1_DAYS,
  URGENCY_LEVEL_2_DAYS,
  URGENCY_LEVEL_3_DAYS,
} from "@/lib/constants";
import type { UrgencyLevel } from "@/types";

const DAY_IN_MS = 86_400_000;

export function getUrgencyLevel(deadline: number | null): UrgencyLevel {
  if (deadline === null) {
    return null;
  }

  const daysUntil = Math.ceil((deadline - Date.now()) / DAY_IN_MS);

  if (daysUntil <= URGENCY_LEVEL_3_DAYS) {
    return 3;
  }

  if (daysUntil <= URGENCY_LEVEL_2_DAYS) {
    return 2;
  }

  if (daysUntil <= URGENCY_LEVEL_1_DAYS) {
    return 1;
  }

  return null;
}

export function isPastDeadline(deadline: number | null): boolean {
  return deadline !== null && deadline < Date.now();
}
