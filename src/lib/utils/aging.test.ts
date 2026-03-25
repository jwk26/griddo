import { afterEach, describe, expect, it, vi } from "vitest";
import { getAgingFilter, getAgingState } from "@/lib/utils/aging";

describe("aging utilities", () => {
  const now = 1_700_000_000_000;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps mtime age buckets to the expected aging state", () => {
    vi.spyOn(Date, "now").mockReturnValue(now);

    expect(getAgingState(now)).toBe("fresh");
    expect(getAgingState(now - 5 * 86_400_000)).toBe("fresh");
    expect(getAgingState(now - 6 * 86_400_000)).toBe("stagnant");
    expect(getAgingState(now - 11 * 86_400_000)).toBe("stagnant");
    expect(getAgingState(now - 12 * 86_400_000)).toBe("neglected");
  });

  it("maps aging states to the expected filter strings", () => {
    expect(getAgingFilter("fresh")).toBe("saturate(1)");
    expect(getAgingFilter("stagnant")).toBe("saturate(0.5) brightness(0.9)");
    expect(getAgingFilter("neglected")).toBe("saturate(0.2) brightness(0.75)");
  });
});
