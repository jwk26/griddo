import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ScratchBreakdown } from "@/lib/db/schema";
import { useCanArchiveScratch } from "@/hooks/use-can-archive-scratch";

const stagedCandidatesMock = vi.hoisted(
  () =>
    ({} as Record<
      string,
      {
        id: string;
        type: "node" | "bit";
        sourceBreakdownId: string;
        label: string;
      }[]
    >),
);

vi.mock("@/stores/triage-store", () => ({
  useTriageStore: (selector: (state: { stagedCandidates: typeof stagedCandidatesMock }) => unknown) =>
    selector({ stagedCandidates: stagedCandidatesMock }),
}));

function createBreakdown(
  id: string,
  consumedAt: ScratchBreakdown["consumedAt"],
): ScratchBreakdown {
  return {
    id,
    scratchBitId: "scratch-1",
    content: "Breakdown row",
    order: 0,
    createdAt: 1,
    consumedAt,
    version: 1,
  };
}

describe("useCanArchiveScratch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const key of Object.keys(stagedCandidatesMock)) {
      delete stagedCandidatesMock[key];
    }
  });

  it("returns false when scratchId is null", () => {
    const { result } = renderHook(() =>
      useCanArchiveScratch(null, [createBreakdown("row-1", 1)]),
    );

    expect(result.current).toBe(false);
  });

  it("returns false when there are no breakdown rows", () => {
    const { result } = renderHook(() => useCanArchiveScratch("scratch-1", []));

    expect(result.current).toBe(false);
  });

  it("returns false when any breakdown row is unconsumed", () => {
    const { result } = renderHook(() =>
      useCanArchiveScratch("scratch-1", [
        createBreakdown("row-1", 1),
        createBreakdown("row-2", null),
      ]),
    );

    expect(result.current).toBe(false);
  });

  it("returns false when all breakdowns are consumed but staged candidates remain", () => {
    stagedCandidatesMock["scratch-1"] = [
      {
        id: "candidate-1",
        type: "node",
        sourceBreakdownId: "row-1",
        label: "Project",
      },
    ];

    const { result } = renderHook(() =>
      useCanArchiveScratch("scratch-1", [
        createBreakdown("row-1", 1),
        createBreakdown("row-2", 2),
      ]),
    );

    expect(result.current).toBe(false);
  });

  it("returns true when all breakdowns are consumed and no staged candidates remain", () => {
    stagedCandidatesMock["scratch-1"] = [];

    const { result } = renderHook(() =>
      useCanArchiveScratch("scratch-1", [
        createBreakdown("row-1", 1),
        createBreakdown("row-2", 2),
      ]),
    );

    expect(result.current).toBe(true);
  });
});
