import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatRelativeTime } from "@/lib/utils/relative-time";

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 17, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats timestamps under 60 minutes as minutes ago", () => {
    const timestamp = new Date(2026, 5, 17, 11, 15, 0).getTime();

    expect(formatRelativeTime(timestamp)).toBe("45m ago");
  });

  it("formats exactly 60 minutes and same-day timestamps as hours ago", () => {
    const exactly60Minutes = new Date(2026, 5, 17, 11, 0, 0).getTime();
    const sameDayHours = new Date(2026, 5, 17, 10, 0, 0).getTime();

    expect(formatRelativeTime(exactly60Minutes)).toBe("1h ago");
    expect(formatRelativeTime(sameDayHours)).toBe("2h ago");
  });

  it("formats timestamps at least 24 hours and under 48 hours as yesterday", () => {
    const exactly24Hours = new Date(2026, 5, 16, 12, 0, 0).getTime();
    const under48Hours = new Date(2026, 5, 15, 12, 1, 0).getTime();

    expect(formatRelativeTime(exactly24Hours)).toBe("yesterday");
    expect(formatRelativeTime(under48Hours)).toBe("yesterday");
  });

  it("formats timestamps from 2 through 6 days old as days ago", () => {
    const twoDays = new Date(2026, 5, 15, 12, 0, 0).getTime();
    const sixDays = new Date(2026, 5, 11, 12, 0, 0).getTime();

    expect(formatRelativeTime(twoDays)).toBe("2 days ago");
    expect(formatRelativeTime(sixDays)).toBe("6 days ago");
  });

  it("formats timestamps at least 7 days old as m/dd/yy", () => {
    const exactlySevenDays = new Date(2026, 5, 10, 12, 0, 0).getTime();
    const olderDate = new Date(2026, 0, 5, 9, 30, 0).getTime();

    expect(formatRelativeTime(exactlySevenDays)).toBe("6/10/26");
    expect(formatRelativeTime(olderDate)).toBe("1/5/26");
  });
});
