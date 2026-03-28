export const CALENDAR_UNSCHEDULE_DROP_ID = "calendar-unschedule";

export type CalendarDropData =
  | {
      kind: "calendar-date";
      timestamp: number;
      dateKey: string;
    }
  | {
      kind: "calendar-unschedule";
    };

export function getCalendarDateDropId(dateKey: string) {
  return `calendar-date:${dateKey}`;
}

export function isCalendarDropData(value: unknown): value is CalendarDropData {
  if (typeof value !== "object" || value === null || !("kind" in value)) {
    return false;
  }

  return (
    (value.kind === "calendar-date" &&
      "timestamp" in value &&
      typeof value.timestamp === "number" &&
      "dateKey" in value &&
      typeof value.dateKey === "string") ||
    value.kind === "calendar-unschedule"
  );
}
