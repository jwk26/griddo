import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StagedCandidate } from "@/stores/triage-store";
import { StagingZone } from "./staging-zone";

const triageStoreState = vi.hoisted(() => ({
  selectedScratchId: "scratch-1" as string | null,
  stagedCandidates: {} as Record<string, StagedCandidate[]>,
}));
const useTriageStoreMock = vi.hoisted(() => vi.fn());

vi.mock("@/stores/triage-store", () => ({
  useTriageStore: useTriageStoreMock,
}));

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
  triageStoreState.selectedScratchId = "scratch-1";
  triageStoreState.stagedCandidates = {};
  useTriageStoreMock.mockImplementation(
    (
      selector: (state: {
        selectedScratchId: string | null;
        stagedCandidates: Record<string, StagedCandidate[]>;
      }) => unknown,
    ) => selector(triageStoreState),
  );
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("StagingZone", () => {
  it("renders the node zone container when type is node", () => {
    render(<StagingZone type="node" />);

    expect(screen.getByTestId("node-staging-zone")).toBeInTheDocument();
  });

  it("renders the bit zone container when type is bit", () => {
    render(<StagingZone type="bit" />);

    expect(screen.getByTestId("bit-staging-zone")).toBeInTheDocument();
  });

  it("shows the node empty-state indicator when stagedCandidates is empty", () => {
    render(<StagingZone type="node" />);

    expect(screen.getByText("No node candidates")).toBeInTheDocument();
  });

  it("shows the bit empty-state indicator when stagedCandidates is empty", () => {
    render(<StagingZone type="bit" />);

    expect(screen.getByText("No bit candidates")).toBeInTheDocument();
  });

  it("renders a candidate card for each node candidate for the current scratch", () => {
    triageStoreState.stagedCandidates = {
      "scratch-1": [
        createCandidate({ id: "node-1", label: "Project outline" }),
        createCandidate({ id: "bit-1", type: "bit", label: "Call Sam" }),
        createCandidate({ id: "node-2", label: "Research folder" }),
      ],
      "scratch-2": [
        createCandidate({ id: "node-3", label: "Other scratch node" }),
      ],
    };

    render(<StagingZone type="node" />);

    const zone = screen.getByTestId("node-staging-zone");
    const cards = within(zone).getAllByTestId("node-candidate-card");

    expect(cards).toHaveLength(2);
    expect(within(zone).getByText("Project outline")).toBeInTheDocument();
    expect(within(zone).getByText("Research folder")).toBeInTheDocument();
    expect(within(zone).queryByText("Call Sam")).not.toBeInTheDocument();
    expect(
      within(zone).queryByText("Other scratch node"),
    ).not.toBeInTheDocument();
  });

  it("renders a candidate row for each bit candidate for the current scratch", () => {
    triageStoreState.stagedCandidates = {
      "scratch-1": [
        createCandidate({ id: "node-1", label: "Project outline" }),
        createCandidate({ id: "bit-1", type: "bit", label: "Call Sam" }),
        createCandidate({
          id: "bit-2",
          type: "bit",
          label: "Draft the note",
        }),
      ],
      "scratch-2": [
        createCandidate({
          id: "bit-3",
          type: "bit",
          label: "Other scratch bit",
        }),
      ],
    };

    render(<StagingZone type="bit" />);

    const zone = screen.getByTestId("bit-staging-zone");
    const rows = within(zone).getAllByTestId("bit-candidate-row");

    expect(rows).toHaveLength(2);
    expect(within(zone).getByText("Call Sam")).toBeInTheDocument();
    expect(within(zone).getByText("Draft the note")).toBeInTheDocument();
    expect(within(zone).queryByText("Project outline")).not.toBeInTheDocument();
    expect(
      within(zone).queryByText("Other scratch bit"),
    ).not.toBeInTheDocument();
  });
});
