import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TriageDragItem } from "@/hooks/use-dnd";
import type { StagedCandidateProjection } from "@/hooks/use-staged-candidates";
import { StagingZone } from "./staging-zone";

const useDroppableMock = vi.hoisted(() => vi.fn());
const useDraggableMock = vi.hoisted(() => vi.fn());
const useStagedCandidatesMock = vi.hoisted(() => vi.fn());
const operationLockState = vi.hoisted(() => ({
  activeOperation: null as null | { kind: string; operationId: string },
}));

vi.mock("@dnd-kit/core", () => ({
  useDraggable: useDraggableMock,
  useDroppable: useDroppableMock,
}));

const triageStoreState = vi.hoisted(() => ({
  selectedScratchId: "scratch-1" as string | null,
  stagedCandidates: {},
}));
const useTriageStoreMock = vi.hoisted(() => vi.fn());

vi.mock("@/stores/triage-store", () => ({
  useTriageStore: useTriageStoreMock,
}));

vi.mock("@/hooks/use-staged-candidates", () => ({
  useStagedCandidates: useStagedCandidatesMock,
}));

vi.mock("@/hooks/use-triage-operation-lock", () => ({
  useTriageOperationLockContext: () => operationLockState,
}));

function createCandidate(
  overrides: Partial<StagedCandidateProjection> = {},
): StagedCandidateProjection {
  const id = overrides.id ?? crypto.randomUUID();
  const sourceBreakdownId =
    overrides.sourceBreakdownId ?? `breakdown-${id}`;
  const content = overrides.content ?? "Candidate";
  return {
    id,
    scratchBitId: overrides.scratchBitId ?? "scratch-1",
    sourceBreakdownId,
    resultType: overrides.resultType ?? "node",
    lifecycle: "staged",
    createdAt: overrides.createdAt ?? 1,
    updatedAt: overrides.updatedAt ?? 1,
    version: overrides.version ?? 1,
    content,
    source: overrides.source ?? {
      id: sourceBreakdownId,
      scratchBitId: overrides.scratchBitId ?? "scratch-1",
      content,
      order: 0,
      createdAt: 1,
      consumedAt: null,
      version: 1,
    },
  };
}

beforeEach(() => {
  operationLockState.activeOperation = null;
  triageStoreState.selectedScratchId = "scratch-1";
  triageStoreState.stagedCandidates = {};
  useTriageStoreMock.mockImplementation(
    (
      selector: (state: {
        selectedScratchId: string | null;
        stagedCandidates: Record<string, unknown[]>;
      }) => unknown,
    ) => selector(triageStoreState),
  );
  useStagedCandidatesMock.mockReturnValue({ candidates: [] });
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

  it("renders a quiet Node well without a large empty placeholder", () => {
    render(<StagingZone type="node" />);

    const zone = screen.getByTestId("node-staging-zone");
    expect(zone).toHaveAttribute("data-empty", "true");
    expect(within(zone).queryByText(/no node candidates/i)).not.toBeInTheDocument();
    expect(within(zone).queryByTestId("node-empty-card")).not.toBeInTheDocument();
  });

  it("renders a quiet Bit well without a large empty placeholder", () => {
    render(<StagingZone type="bit" />);

    const zone = screen.getByTestId("bit-staging-zone");
    expect(zone).toHaveAttribute("data-empty", "true");
    expect(within(zone).queryByText(/no bit candidates/i)).not.toBeInTheDocument();
    expect(within(zone).queryByTestId("bit-empty-card")).not.toBeInTheDocument();
  });

  it("renders Task 131 Node projections in createdAt DESC then ID order", () => {
    useStagedCandidatesMock.mockReturnValue({
      candidates: [
        createCandidate({ id: "node-b", content: "Newer B", createdAt: 3 }),
        createCandidate({ id: "bit-a", content: "Bit", resultType: "bit", createdAt: 4 }),
        createCandidate({ id: "node-old", content: "Older", createdAt: 2 }),
        createCandidate({ id: "node-a", content: "Newer A", createdAt: 3 }),
      ],
    });

    render(<StagingZone type="node" />);

    const zone = screen.getByTestId("node-staging-zone");
    const cards = within(zone).getAllByTestId("node-candidate-card");

    expect(useStagedCandidatesMock).toHaveBeenCalledWith("scratch-1");
    expect(cards.map((card) => card.textContent)).toEqual([
      "Newer A",
      "Newer B",
      "Older",
    ]);
    expect(within(zone).queryByText("Bit")).not.toBeInTheDocument();
  });

  it("renders Task 131 Bit projections as text rows", () => {
    useStagedCandidatesMock.mockReturnValue({
      candidates: [
        createCandidate({ id: "node-1", content: "Project outline" }),
        createCandidate({ id: "bit-1", content: "Call Sam", resultType: "bit", createdAt: 3 }),
        createCandidate({ id: "bit-2", content: "Draft the note", resultType: "bit", createdAt: 2 }),
      ],
    });

    render(<StagingZone type="bit" />);

    const zone = screen.getByTestId("bit-staging-zone");
    const rows = within(zone).getAllByTestId("bit-candidate-row");

    expect(rows).toHaveLength(2);
    expect(within(zone).getByText("Call Sam")).toBeInTheDocument();
    expect(within(zone).getByText("Draft the note")).toBeInTheDocument();
    expect(within(zone).queryByText("Project outline")).not.toBeInTheDocument();
  });

  it("uses the whole candidate root as the only pointer drag activator", () => {
    const onPointerDown = vi.fn();
    useStagedCandidatesMock.mockReturnValue({
      candidates: [createCandidate({ content: "Whole root" })],
    });
    useDraggableMock.mockReturnValue({
      setNodeRef: vi.fn(),
      attributes: { role: "button", tabIndex: 0 },
      listeners: { onPointerDown },
      isDragging: false,
    });

    render(<StagingZone type="node" />);

    const root = screen.getByTestId("node-candidate-card");
    expect(root).toHaveAttribute("role", "button");
    expect(root).toHaveAttribute("tabindex", "0");
    expect(root).toHaveClass(
      "touch-none",
      "focus-visible:ring-2",
      "motion-reduce:transition-none",
    );
    expect(root.querySelector("button, [data-dnd-handle]")).toBeNull();
    expect(root).not.toHaveAttribute("onclick");
    expect(root).toHaveAttribute("data-triage-drag-source", "staged-root");
    expect(root).toHaveAttribute("data-candidate-version", "1");
    expect(root).toHaveAttribute("data-source-version", "1");
    root.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(onPointerDown).toHaveBeenCalledOnce();

    expect(useDraggableMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          candidateLifecycle: "staged",
          candidateVersion: 1,
          resultType: "node",
          scratchId: "scratch-1",
          sourceLifecycle: "active",
          sourceVersion: 1,
        }),
      }),
    );
  });

  it("keeps the durable candidate rendered but disables it throughout an Unstage lock", () => {
    operationLockState.activeOperation = {
      kind: "unstage",
      operationId: "unstage-1",
    };
    useStagedCandidatesMock.mockReturnValue({
      candidates: [createCandidate({ id: "candidate-1", content: "Returning" })],
    });

    render(<StagingZone type="node" />);

    expect(screen.getByText("Returning")).toBeInTheDocument();
    expect(useDraggableMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "triage-staged-node:candidate-1",
        disabled: true,
      }),
    );
  });

  it("keeps overflow candidates in an independently scrollable hidden-scroll well", () => {
    useStagedCandidatesMock.mockReturnValue({
      candidates: Array.from({ length: 8 }, (_, index) =>
        createCandidate({
          id: `bit-${index}`,
          content: `Bit ${index}`,
          resultType: "bit",
          createdAt: index,
        }),
      ),
    });

    render(<StagingZone type="bit" />);

    const zone = screen.getByTestId("bit-staging-zone");
    expect(zone).toHaveClass(
      "h-full",
      "min-h-0",
      "max-h-full",
      "overflow-y-auto",
      "[contain:size]",
    );
    expect(zone).toHaveClass("[scrollbar-width:none]");
    expect(within(zone).getByText("Bit 0")).toBeInTheDocument();
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
    expect(zone).toHaveClass("border-muted");
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
    expect(zone).toHaveClass("border-muted");
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
    expect(zone).not.toHaveClass("border-muted");
  });
});
