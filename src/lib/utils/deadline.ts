import { endOfDay } from "date-fns";

export function normalizeDeadlineForComparison(
  deadline: number,
  allDay: boolean,
): number {
  if (!allDay) {
    return deadline;
  }

  return endOfDay(new Date(deadline)).getTime();
}

/**
 * Compares two deadlines accounting for all-day normalization.
 * All-day deadlines are stored at 00:00:00.000 but treated as 23:59:59.999
 * for comparison purposes (they represent "end of day").
 *
 * Returns true if childDeadline is after parentDeadline (conflict).
 */
export function isDeadlineAfter(
  childDeadline: number,
  childAllDay: boolean,
  parentDeadline: number,
  parentAllDay: boolean,
): boolean {
  return normalizeDeadlineForComparison(childDeadline, childAllDay) >
    normalizeDeadlineForComparison(parentDeadline, parentAllDay);
}
