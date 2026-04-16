import { addDays, startOfDay } from "date-fns";
import { describe, expect, it } from "vitest";
import { isDeadlineAfter } from "@/lib/utils/deadline";

describe("isDeadlineAfter", () => {
  it("uses raw timestamps when neither deadline is all-day", () => {
    const parentDeadline = new Date(2026, 3, 11, 14, 0).getTime();
    const childDeadline = new Date(2026, 3, 11, 14, 1).getTime();

    expect(
      isDeadlineAfter(childDeadline, false, parentDeadline, false),
    ).toBe(true);
  });

  it("treats an all-day parent as the end of its day", () => {
    const parentDeadline = startOfDay(new Date(2026, 3, 11)).getTime();
    const childDeadline = new Date(2026, 3, 11, 18, 30).getTime();

    expect(
      isDeadlineAfter(childDeadline, false, parentDeadline, true),
    ).toBe(false);
  });

  it("treats an all-day child as the end of its day", () => {
    const parentDeadline = new Date(2026, 3, 11, 9, 0).getTime();
    const childDeadline = startOfDay(new Date(2026, 3, 11)).getTime();

    expect(
      isDeadlineAfter(childDeadline, true, parentDeadline, false),
    ).toBe(true);
  });

  it("does not flag equal all-day deadlines on the same day", () => {
    const parentDeadline = startOfDay(new Date(2026, 3, 11)).getTime();
    const childDeadline = startOfDay(new Date(2026, 3, 11)).getTime();

    expect(
      isDeadlineAfter(childDeadline, true, parentDeadline, true),
    ).toBe(false);
  });

  it("flags an all-day child on the next day after an all-day parent", () => {
    const parentDate = startOfDay(new Date(2026, 3, 11));
    const childDate = addDays(parentDate, 1);

    expect(
      isDeadlineAfter(childDate.getTime(), true, parentDate.getTime(), true),
    ).toBe(true);
  });
});
