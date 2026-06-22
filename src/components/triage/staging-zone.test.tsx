import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TriageDragItem } from "@/hooks/use-dnd";
import type { StagedCandidate } from "@/stores/triage-store";
import { StagingZone } from "./staging-zone";

const useDroppableMock = vi.hoisted(() => vi.fn());
const useDraggableMock = vi.hoisted(() => vi.fn());

vi.mock("@dnd-kit/core", () => ({
  useDraggable: useDraggableMock,
  useDroppable: useDroppableMock,
}));

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
  useDroppableMock.mockReturnValue({ setNodeRef: vi.fn() });
  useDraggableMock.mockReturnValue({
    setNodeRef: vi.fn(),
    setActivatorNodeRef: vi.fn(),
    attributes: {},
    listeners: {},
    isDragging: false,
  });
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

function makeDragItem(kind: TriageDragItem extends null ? never : NonNullable<TriageDragItem>["kind"]): NonNullable<TriageDragItem> {
  return { kind, id: "drag-1", label: "Dragged item" };
}

describe("StagingZone — drop zone state classes", () => {
  it("Node Zone shows valid state when a breakdown row hovers over it", () => {
    render(
      <StagingZone
        type="node"
        activeDragItem={makeDragItem("triage-breakdown")}
        overTargetId="triage-node-zone-drop"
      />,
    );
    const zone = screen.getByTestId("node-staging-zone");
    expect(zone).toHaveClass("border-primary");
    expect(zone).toHaveClass("bg-accent");
  });

  it("Bit Zone shows valid state when a breakdown row hovers over it", () => {
    render(
      <StagingZone
        type="bit"
        activeDragItem={makeDragItem("triage-breakdown")}
        overTargetId="triage-bit-zone-drop"
      />,
    );
    const zone = screen.getByTestId("bit-staging-zone");
    expect(zone).toHaveClass("border-primary");
    expect(zone).toHaveClass("bg-accent");
  });

  it("Bit Zone shows invalid state when a staged-node hovers over it", () => {
    render(
      <StagingZone
        type="bit"
        activeDragItem={makeDragItem("triage-staged-node")}
        overTargetId="triage-bit-zone-drop"
      />,
    );
    const zone = screen.getByTestId("bit-staging-zone");
    expect(zone).toHaveClass("border-destructive");
    expect(zone).toHaveClass("cursor-not-allowed");
  });

  it("Node Zone shows invalid state when a staged-bit hovers over it", () => {
    render(
      <StagingZone
        type="node"
        activeDragItem={makeDragItem("triage-staged-bit")}
        overTargetId="triage-node-zone-drop"
      />,
    );
    const zone = screen.getByTestId("node-staging-zone");
    expect(zone).toHaveClass("border-destructive");
    expect(zone).toHaveClass("cursor-not-allowed");
  });

  it("Node Zone shows idle-valid hint when a breakdown drag is active but not hovering", () => {
    render(
      <StagingZone
        type="node"
        activeDragItem={makeDragItem("triage-breakdown")}
        overTargetId={null}
      />,
    );
    const zone = screen.getByTestId("node-staging-zone");
    expect(zone).toHaveClass("border-dashed");
    expect(zone).toHaveClass("border-muted");
  });

  it("Bit Zone shows no hint when an incompatible drag is active but not hovering (idle-invalid)", () => {
    render(
      <StagingZone
        type="bit"
        activeDragItem={makeDragItem("triage-staged-node")}
        overTargetId={null}
      />,
    );
    const zone = screen.getByTestId("bit-staging-zone");
    expect(zone).not.toHaveClass("border-dashed");
    expect(zone).not.toHaveClass("border-destructive");
  });
});
