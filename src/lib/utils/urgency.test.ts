import { afterEach, describe, expect, it, vi } from "vitest";
import { getUrgencyLevel, isPastDeadline } from "@/lib/utils/urgency";

describe("urgency utilities", () => {
  const now = 1_700_000_000_000;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("derives urgency levels from the deadline offset", () => {
    vi.spyOn(Date, "now").mockReturnValue(now);

    expect(getUrgencyLevel(null)).toBeNull();
    expect(getUrgencyLevel(now + 4 * 86_400_000)).toBeNull();
    expect(getUrgencyLevel(now + 3 * 86_400_000)).toBe(1);
    expect(getUrgencyLevel(now + 2 * 86_400_000)).toBe(2);
    expect(getUrgencyLevel(now + 86_400_000)).toBe(3);
    expect(getUrgencyLevel(now - 1)).toBe(3);
  });

  it("detects whether a deadline is already in the past", () => {
    vi.spyOn(Date, "now").mockReturnValue(now);

    expect(isPastDeadline(null)).toBe(false);
    expect(isPastDeadline(now)).toBe(false);
    expect(isPastDeadline(now - 1)).toBe(true);
  });
});
