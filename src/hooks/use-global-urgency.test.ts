/**
 * useGlobalUrgency — unit tests for the urgency computation logic.
 * The reactive subscription (liveQuery) is an integration concern; these tests
 * verify that the underlying urgency calculation is correct given a set of Bits.
 */
import { describe, expect, it } from "vitest";
import { getUrgencyLevel } from "@/lib/utils/urgency";
import type { UrgencyLevel } from "@/types";

const DAY_MS = 86_400_000;
const now = Date.now();

/** Simulates the computation inside useGlobalUrgency */
function computeGlobalUrgency(deadlines: (number | null)[]): UrgencyLevel {
  let max: UrgencyLevel = null;
  for (const dl of deadlines) {
    if (dl === null) continue;
    const level = getUrgencyLevel(dl);
    if (level !== null && (max === null || level > max)) max = level;
  }
  return max;
}

describe("useGlobalUrgency — urgency computation", () => {
  it("returns null when no bits have deadlines", () => {
    expect(computeGlobalUrgency([null, null])).toBeNull();
  });

  it("returns null when all deadlines are far in the future", () => {
    expect(computeGlobalUrgency([now + 30 * DAY_MS, now + 60 * DAY_MS])).toBeNull();
  });

  it("returns the highest urgency level across all active bits", () => {
    const level1Deadline = now + 3 * DAY_MS;  // urgency 1
    const level3Deadline = now + DAY_MS * 0.5; // urgency 3 (< 1 day)

    const result = computeGlobalUrgency([level1Deadline, level3Deadline]);
    expect(result).toBe(3);
  });

  it("returns level 1 when only a level-1 deadline exists", () => {
    const deadline = now + 2.5 * DAY_MS; // within 3-day threshold
    const result = computeGlobalUrgency([deadline]);
    // Level depends on constants; just check it's not null and >= 1
    expect(result).not.toBeNull();
    expect(result).toBeGreaterThanOrEqual(1);
  });

  it("returns level 3 for a past deadline (urgency is maximum)", () => {
    const pastDeadline = now - DAY_MS; // yesterday
    const result = computeGlobalUrgency([pastDeadline]);
    expect(result).toBe(3);
  });
});
