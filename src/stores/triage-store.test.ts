import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  type StagedCandidate,
  useTriageStore,
} from "@/stores/triage-store";

function createCandidate(
  overrides: Partial<StagedCandidate> = {},
): StagedCandidate {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    type: overrides.type ?? "node",
    sourceBreakdownId: overrides.sourceBreakdownId ?? "breakdown-1",
    label: overrides.label ?? "Candidate",
  };
}

beforeEach(() => {
  useTriageStore.setState({
    selectedScratchId: null,
    stagedCandidates: {},
  });
});

afterEach(() => {
  useTriageStore.setState({
    selectedScratchId: null,
    stagedCandidates: {},
  });
});

describe("useTriageStore staged candidates", () => {
  it("initialises stagedCandidates as an empty record", () => {
    expect(useTriageStore.getState().stagedCandidates).toEqual({});
  });

  it("adds staged candidates to the correct scratch bucket", () => {
    const scratchOneCandidate = createCandidate({ id: "candidate-1" });
    const scratchTwoCandidate = createCandidate({
      id: "candidate-2",
      sourceBreakdownId: "breakdown-2",
    });

    useTriageStore
      .getState()
      .addStagedCandidate("scratch-1", scratchOneCandidate);
    useTriageStore
      .getState()
      .addStagedCandidate("scratch-2", scratchTwoCandidate);

    expect(useTriageStore.getState().stagedCandidates).toEqual({
      "scratch-1": [scratchOneCandidate],
      "scratch-2": [scratchTwoCandidate],
    });
  });

  it("removes staged candidates by candidateId from the correct bucket only", () => {
    const scratchOneCandidate = createCandidate({ id: "candidate-1" });
    const scratchOneRemainingCandidate = createCandidate({
      id: "candidate-2",
      sourceBreakdownId: "breakdown-2",
    });
    const scratchTwoCandidate = createCandidate({
      id: "candidate-3",
      sourceBreakdownId: "breakdown-3",
    });

    useTriageStore.setState({
      stagedCandidates: {
        "scratch-1": [scratchOneCandidate, scratchOneRemainingCandidate],
        "scratch-2": [scratchTwoCandidate],
      },
    });

    useTriageStore.getState().removeStagedCandidate("scratch-1", "candidate-1");

    expect(useTriageStore.getState().stagedCandidates).toEqual({
      "scratch-1": [scratchOneRemainingCandidate],
      "scratch-2": [scratchTwoCandidate],
    });
  });

  it("clears staged candidates for only the given scratchId", () => {
    const scratchOneCandidate = createCandidate({ id: "candidate-1" });
    const scratchTwoCandidate = createCandidate({
      id: "candidate-2",
      sourceBreakdownId: "breakdown-2",
    });

    useTriageStore.setState({
      stagedCandidates: {
        "scratch-1": [scratchOneCandidate],
        "scratch-2": [scratchTwoCandidate],
      },
    });

    useTriageStore.getState().clearScratchCandidates("scratch-1");

    expect(useTriageStore.getState().stagedCandidates).toEqual({
      "scratch-2": [scratchTwoCandidate],
    });
  });

  it("keeps staged candidates when selectedScratchId changes", () => {
    const scratchOneCandidate = createCandidate({ id: "candidate-1" });

    useTriageStore.setState({
      selectedScratchId: "scratch-1",
      stagedCandidates: {
        "scratch-1": [scratchOneCandidate],
      },
    });

    useTriageStore.getState().selectScratch("scratch-2");

    expect(useTriageStore.getState().selectedScratchId).toBe("scratch-2");
    expect(useTriageStore.getState().stagedCandidates).toEqual({
      "scratch-1": [scratchOneCandidate],
    });
  });
});
