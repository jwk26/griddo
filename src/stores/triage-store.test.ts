import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
    scratchPoolExpanded: true,
    scratchPoolManualExpandedForId: null,
    scratchPoolQuery: "",
    scratchPoolResultIds: [],
    scratchPoolScroll: { anchorId: null, offset: 0 },
    explorerPathIds: [],
    explorerOpenColumnIds: [],
    explorerColumnScroll: {},
    stagedCandidates: {},
  });
});

afterEach(() => {
  useTriageStore.setState({
    selectedScratchId: null,
    scratchPoolExpanded: true,
    scratchPoolManualExpandedForId: null,
    scratchPoolQuery: "",
    scratchPoolResultIds: [],
    scratchPoolScroll: { anchorId: null, offset: 0 },
    explorerPathIds: [],
    explorerOpenColumnIds: [],
    explorerColumnScroll: {},
    stagedCandidates: {},
  });
});

describe("useTriageStore app-session ownership", () => {
  it("owns exactly the approved session state plus deprecated candidate compatibility", () => {
    expect(Object.keys(useTriageStore.getState()).sort()).toEqual([
      "addStagedCandidate",
      "clearScratchCandidates",
      "clearSelection",
      "explorerColumnScroll",
      "explorerOpenColumnIds",
      "explorerPathIds",
      "reconcileScratchPoolContext",
      "removeStagedCandidate",
      "scratchPoolExpanded",
      "scratchPoolManualExpandedForId",
      "scratchPoolQuery",
      "scratchPoolResultIds",
      "scratchPoolScroll",
      "selectScratch",
      "selectedScratchId",
      "setExplorerColumnScroll",
      "setExplorerOpenColumnIds",
      "setExplorerPathIds",
      "setScratchPoolExpanded",
      "setScratchPoolManualExpandedForId",
      "setScratchPoolQuery",
      "setScratchPoolResultIds",
      "setScratchPoolScroll",
      "stagedCandidates",
    ]);
  });

  it("retains Pool and Explorer context for same-session route re-entry", () => {
    const store = useTriageStore.getState();

    store.selectScratch("scratch-1");
    store.setScratchPoolExpanded(false);
    store.setScratchPoolQuery("project");
    store.setScratchPoolResultIds(["scratch-2"]);
    store.setScratchPoolScroll({ anchorId: "scratch-2", offset: 18 });
    store.setExplorerPathIds(["node-1", "node-2"]);
    store.setExplorerOpenColumnIds(["home", "node-1", "node-2"]);
    store.setExplorerColumnScroll("node-1", {
      anchorId: "node-3",
      offset: 24,
    });

    expect(useTriageStore.getState()).toMatchObject({
      selectedScratchId: "scratch-1",
      scratchPoolExpanded: false,
      scratchPoolQuery: "project",
      scratchPoolResultIds: ["scratch-2"],
      scratchPoolScroll: { anchorId: "scratch-2", offset: 18 },
      explorerPathIds: ["node-1", "node-2"],
      explorerOpenColumnIds: ["home", "node-1", "node-2"],
      explorerColumnScroll: {
        "node-1": { anchorId: "node-3", offset: 24 },
      },
    });
  });

  it("reconciles invalid selection, result context, and scroll against visible active Scratches", () => {
    useTriageStore.setState({
      selectedScratchId: "removed",
      scratchPoolQuery: "project",
      scratchPoolScroll: { anchorId: "removed", offset: 18 },
      scratchPoolManualExpandedForId: "removed",
    });

    useTriageStore.getState().reconcileScratchPoolContext({
      activeIds: ["scratch-new", "scratch-project"],
      visibleIds: ["scratch-project"],
    });

    expect(useTriageStore.getState()).toMatchObject({
      selectedScratchId: "scratch-project",
      scratchPoolManualExpandedForId: null,
      scratchPoolResultIds: ["scratch-project"],
      scratchPoolScroll: { anchorId: "scratch-project", offset: 0 },
    });
  });

  it("uses null instead of a hidden mismatch when a non-empty query has no result", () => {
    useTriageStore.setState({
      selectedScratchId: "removed",
      scratchPoolQuery: "missing",
    });

    useTriageStore.getState().reconcileScratchPoolContext({
      activeIds: ["scratch-new"],
      visibleIds: [],
    });

    expect(useTriageStore.getState().selectedScratchId).toBeNull();
  });

  it("retains a valid search-hidden selection and its manual-reopen exception", () => {
    useTriageStore.setState({
      selectedScratchId: "scratch-hidden",
      scratchPoolQuery: "visible",
      scratchPoolManualExpandedForId: "scratch-hidden",
    });

    useTriageStore.getState().reconcileScratchPoolContext({
      activeIds: ["scratch-hidden", "scratch-visible"],
      visibleIds: ["scratch-visible"],
    });

    expect(useTriageStore.getState()).toMatchObject({
      selectedScratchId: "scratch-hidden",
      scratchPoolManualExpandedForId: "scratch-hidden",
      scratchPoolResultIds: ["scratch-visible"],
    });
  });

  it("clears the per-Scratch manual-reopen exception only when selection changes", () => {
    useTriageStore.setState({
      selectedScratchId: "scratch-1",
      scratchPoolManualExpandedForId: "scratch-1",
    });

    useTriageStore.getState().selectScratch("scratch-1");
    expect(useTriageStore.getState().scratchPoolManualExpandedForId).toBe(
      "scratch-1",
    );

    useTriageStore.getState().selectScratch("scratch-2");
    expect(useTriageStore.getState().scratchPoolManualExpandedForId).toBeNull();
  });

  it("starts a new app session with deterministic Pool and Explorer defaults", async () => {
    useTriageStore.setState({
      selectedScratchId: "scratch-1",
      scratchPoolExpanded: false,
      scratchPoolQuery: "project",
      scratchPoolResultIds: ["scratch-1"],
      scratchPoolScroll: { anchorId: "scratch-1", offset: 12 },
      explorerPathIds: ["node-1"],
      explorerOpenColumnIds: ["home", "node-1"],
      explorerColumnScroll: {
        home: { anchorId: "node-1", offset: 8 },
      },
    });

    vi.resetModules();
    const { useTriageStore: reloadedStore } = await import("./triage-store");

    expect(reloadedStore.getState()).toMatchObject({
      selectedScratchId: null,
      scratchPoolExpanded: true,
      scratchPoolManualExpandedForId: null,
      scratchPoolQuery: "",
      scratchPoolResultIds: [],
      scratchPoolScroll: { anchorId: null, offset: 0 },
      explorerPathIds: [],
      explorerOpenColumnIds: [],
      explorerColumnScroll: {},
    });
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
