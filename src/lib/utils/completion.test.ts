import { describe, expect, it } from "vitest";
import type { Bit } from "@/types";
import { isNodeComplete } from "@/lib/utils/completion";

function createBit(status: Bit["status"]): Bit {
  const now = 1_700_000_000_000;

  return {
    id: crypto.randomUUID(),
    title: "Bit",
    description: "",
    icon: "circle",
    deadline: null,
    deadlineAllDay: false,
    priority: null,
    status,
    mtime: now,
    createdAt: now,
    parentId: crypto.randomUUID(),
    x: 0,
    y: 0,
    deletedAt: null,
  };
}

describe("isNodeComplete", () => {
  it("returns false for an empty array", () => {
    expect(isNodeComplete([])).toBe(false);
  });

  it("returns false when there is one active bit", () => {
    expect(isNodeComplete([createBit("active")])).toBe(false);
  });

  it("returns false when any bit is still active", () => {
    expect(isNodeComplete([createBit("active"), createBit("complete")])).toBe(false);
  });

  it("returns true when every bit is complete", () => {
    expect(isNodeComplete([createBit("complete"), createBit("complete")])).toBe(true);
  });
});
