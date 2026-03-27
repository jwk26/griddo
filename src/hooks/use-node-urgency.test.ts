/**
 * useNodeUrgency — unit tests for the urgency computation logic scoped to a Node.
 * Mirrors the logic inside the hook: filters bits by parentId and computes max urgency.
 */
import { describe, expect, it } from "vitest";
import { getUrgencyLevel } from "@/lib/utils/urgency";
import type { UrgencyLevel } from "@/types";

const DAY_MS = 86_400_000;
const now = Date.now();

type BitLike = { parentId: string; deadline: number | null; deletedAt: number | null };

/** Simulates the computation inside useNodeUrgency(nodeId) */
function computeNodeUrgency(nodeId: string, bits: BitLike[]): UrgencyLevel {
  const nodeBits = bits.filter((b) => b.parentId === nodeId && b.deletedAt === null && b.deadline !== null);
  let max: UrgencyLevel = null;
  for (const bit of nodeBits) {
    const level = getUrgencyLevel(bit.deadline);
    if (level !== null && (max === null || level > max)) max = level;
  }
  return max;
}

describe("useNodeUrgency — urgency computation scoped to a Node", () => {
  it("returns null when node has no child bits", () => {
    expect(computeNodeUrgency("node-1", [])).toBeNull();
  });

  it("ignores bits from other nodes", () => {
    const bits: BitLike[] = [
      { parentId: "node-2", deadline: now + DAY_MS * 0.5, deletedAt: null },
    ];
    expect(computeNodeUrgency("node-1", bits)).toBeNull();
  });

  it("ignores trashed bits", () => {
    const bits: BitLike[] = [
      { parentId: "node-1", deadline: now + DAY_MS * 0.5, deletedAt: Date.now() },
    ];
    expect(computeNodeUrgency("node-1", bits)).toBeNull();
  });

  it("returns the highest urgency level among node's child bits", () => {
    const bits: BitLike[] = [
      { parentId: "node-1", deadline: now + 3 * DAY_MS, deletedAt: null }, // level 1
      { parentId: "node-1", deadline: now + 0.5 * DAY_MS, deletedAt: null }, // level 3
    ];
    const result = computeNodeUrgency("node-1", bits);
    expect(result).toBe(3);
  });

  it("returns correct urgency for child Bits of a given Node", () => {
    const bits: BitLike[] = [
      { parentId: "node-1", deadline: now + 60 * DAY_MS, deletedAt: null }, // no urgency
      { parentId: "node-1", deadline: now + 2 * DAY_MS, deletedAt: null }, // some urgency
    ];
    const result = computeNodeUrgency("node-1", bits);
    expect(result).not.toBeNull();
  });
});
