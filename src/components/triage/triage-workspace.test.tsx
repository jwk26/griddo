import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTriageStore } from "@/stores/triage-store";
import type { Node } from "@/types";
import { TriageWorkspace } from "./triage-workspace";

const useTriageDndMock = vi.hoisted(() => vi.fn());
const handlePlacementConfirmMock = vi.hoisted(() => vi.fn());
const handlePlacementCancelMock = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-dnd", () => ({
  useTriageDnd: useTriageDndMock,
}));

vi.mock("@/components/triage/scratch-pool", () => ({
  ScratchPool: () => <div data-testid="scratch-pool" />,
}));

vi.mock("@/components/triage/breakdown-panel", () => ({
  BreakdownPanel: () => <div data-testid="breakdown-panel" />,
}));

vi.mock("@/components/triage/staging-zone", () => ({
  StagingZone: ({ type }: { type: string }) => (
    <div data-testid={`${type}-staging-zone`} />
  ),
}));

function createNode(overrides: Partial<Node> = {}): Node {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Inbox",
    color: overrides.color ?? "hsl(221, 83%, 53%)",
    icon: overrides.icon ?? "inbox",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    mtime: overrides.mtime ?? 1,
    createdAt: overrides.createdAt ?? 1,
    parentId: overrides.parentId ?? null,
    level: overrides.level ?? 0,
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
    archivedAt: overrides.archivedAt ?? null,
    systemRole: overrides.systemRole ?? "inbox",
    hiddenFromGrid: overrides.hiddenFromGrid ?? false,
  };
}

function createDndState(
  overrides: Partial<ReturnType<typeof useTriageDndMock>> = {},
) {
  return {
    sensors: [],
    activeDragItem: null,
    overTargetId: null,
    pendingPlacement: null,
    handleDragStart: vi.fn(),
    handleDragEnd: vi.fn(),
    handleDragOver: vi.fn(),
    handlePlacementConfirm: handlePlacementConfirmMock,
    handlePlacementCancel: handlePlacementCancelMock,
    ...overrides,
  };
}

function createDirectPendingPlacement(
  overrides: Partial<
    NonNullable<ReturnType<typeof createDndState>["pendingPlacement"]>
  > = {},
): NonNullable<ReturnType<typeof createDndState>["pendingPlacement"]> {
  return {
    candidateId: "breakdown-1",
    candidateType: null,
    candidateLabel: "Project",
    sourceBreakdownId: "breakdown-1",
    dropId: "triage-hierarchy:parent-1",
    parentNodeId: "parent-1",
    targetNodeLevel: 0,
    targetTitle: "Parent",
    targetParentPath: ["Home"],
    isFull: false,
    isDirectBreakdown: true,
    ...overrides,
  };
}

beforeEach(() => {
  handlePlacementConfirmMock.mockReset();
  handlePlacementConfirmMock.mockResolvedValue(undefined);
  handlePlacementCancelMock.mockReset();
  useTriageStore.setState({
    selectedScratchId: "scratch-1",
    stagedCandidates: {},
  });
  useTriageDndMock.mockReset();
  useTriageDndMock.mockReturnValue(createDndState());
});

afterEach(() => {
  cleanup();
});

describe("TriageWorkspace", () => {
  it("renders ScratchPool in the left panel and wires in BreakdownPanel", () => {
    render(<TriageWorkspace node={createNode()} />);

    const workspace = screen.getByTestId("triage-workspace");

    expect(within(workspace).getByTestId("scratch-pool")).toBeInTheDocument();
    expect(within(workspace).getByTestId("breakdown-panel")).toBeInTheDocument();
  });

  it("keeps staging zones and the hierarchy explorer visible", () => {
    render(<TriageWorkspace node={createNode()} />);

    expect(screen.getByText("Staging: Nodes")).toBeInTheDocument();
    expect(screen.getByText("Staging: Bits")).toBeInTheDocument();
    expect(screen.getByText("Hierarchy Explorer")).toBeInTheDocument();
    expect(screen.getByTestId("hierarchy-explorer")).toBeInTheDocument();
    expect(screen.getByTestId("node-staging-zone")).toBeInTheDocument();
    expect(screen.getByTestId("bit-staging-zone")).toBeInTheDocument();
  });

  it("shows the remove-from-staging strip only while dragging a staged candidate", () => {
    const { rerender } = render(<TriageWorkspace node={createNode()} />);

    expect(screen.queryByText("Remove from staging")).not.toBeInTheDocument();

    useTriageDndMock.mockReturnValue(
      createDndState({
        activeDragItem: {
          kind: "triage-staged-node",
          id: "candidate-1",
          label: "Project",
          sourceBreakdownId: "breakdown-1",
        },
      }),
    );

    rerender(<TriageWorkspace node={createNode()} />);

    expect(screen.getByText("Remove from staging")).toBeInTheDocument();
    expect(
      document.querySelector(
        '[aria-label="Drop staged item here to remove from staging"]',
      ),
    ).toHaveClass("h-12", "motion-safe:animate-jiggle");
  });

  it("applies destructive styling while the staged remove target is hovered", () => {
    useTriageDndMock.mockReturnValue(
      createDndState({
        activeDragItem: {
          kind: "triage-staged-bit",
          id: "candidate-2",
          label: "Todo",
          sourceBreakdownId: "breakdown-2",
        },
        overTargetId: "triage-remove-drop",
      }),
    );

    render(<TriageWorkspace node={createNode()} />);

    expect(
      document.querySelector(
        '[aria-label="Drop staged item here to remove from staging"]',
      ),
    ).toHaveClass("bg-destructive/10", "text-destructive", "border-solid");
  });

  it("shows hierarchy cells as valid while a breakdown row is dragged", () => {
    useTriageDndMock.mockReturnValue(
      createDndState({
        activeDragItem: {
          kind: "triage-breakdown",
          id: "breakdown-1",
          label: "Project",
        },
      }),
    );

    render(<TriageWorkspace node={createNode()} />);

    expect(screen.getByTestId("hierarchy-section-body-home")).toHaveClass(
      "ring-1",
    );
    expect(screen.getByTestId("hierarchy-section-body-home")).not.toHaveClass(
      "cursor-not-allowed",
    );
  });

  it("shows Home section body as invalid while a staged Bit is dragged", () => {
    useTriageDndMock.mockReturnValue(
      createDndState({
        activeDragItem: {
          kind: "triage-staged-bit",
          id: "candidate-2",
          label: "Todo",
          sourceBreakdownId: "breakdown-2",
        },
      }),
    );

    render(<TriageWorkspace node={createNode()} />);

    expect(screen.getByTestId("hierarchy-section-body-home")).toHaveClass(
      "cursor-not-allowed",
    );
  });

  it("renders all four hierarchy section body drop zones", () => {
    render(<TriageWorkspace node={createNode()} />);

    expect(screen.getByTestId("hierarchy-section-body-home")).toBeInTheDocument();
    expect(screen.getByTestId("hierarchy-section-body-l1")).toBeInTheDocument();
    expect(screen.getByTestId("hierarchy-section-body-l2")).toBeInTheDocument();
    expect(screen.getByTestId("hierarchy-section-body-l3")).toBeInTheDocument();
  });

  it("requires a type choice for direct breakdown placement and passes the selected type on confirm", () => {
    useTriageDndMock.mockReturnValue(
      createDndState({
        pendingPlacement: createDirectPendingPlacement(),
      }),
    );

    render(<TriageWorkspace node={createNode()} />);

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    const nodeOption = screen.getByRole("radio", {
      name: "Select Node type",
    });
    const bitOption = screen.getByRole("radio", {
      name: "Select Bit type",
    });

    expect(confirmButton).toBeDisabled();
    expect(nodeOption).toHaveAttribute("aria-checked", "false");
    expect(bitOption).toHaveAttribute("aria-checked", "false");

    fireEvent.click(nodeOption);

    expect(nodeOption).toHaveAttribute("aria-checked", "true");
    expect(confirmButton).toBeEnabled();

    fireEvent.click(confirmButton);

    expect(handlePlacementConfirmMock).toHaveBeenCalledWith(
      "scratch-1",
      "node",
    );
  });

  it("shows disabled direct type choices for invalid target types", () => {
    useTriageDndMock.mockReturnValue(
      createDndState({
        pendingPlacement: createDirectPendingPlacement({
          dropId: "triage-hierarchy:root",
          parentNodeId: null,
          targetNodeLevel: null,
          targetTitle: "Home",
          targetParentPath: [],
        }),
      }),
    );

    render(<TriageWorkspace node={createNode()} />);

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    const nodeOption = screen.getByRole("radio", {
      name: "Select Node type",
    });
    const bitOption = screen.getByRole("radio", {
      name: "Select Bit type",
    });

    expect(nodeOption).toBeEnabled();
    expect(bitOption).toBeDisabled();

    fireEvent.click(bitOption);

    expect(bitOption).toHaveAttribute("aria-checked", "false");
    expect(confirmButton).toBeDisabled();
  });

  it("resets the direct type choice when a new placement opens", () => {
    let pendingPlacement = createDirectPendingPlacement({
      dropId: "triage-hierarchy:parent-1",
    });
    useTriageDndMock.mockImplementation(() =>
      createDndState({ pendingPlacement }),
    );

    const { rerender } = render(<TriageWorkspace node={createNode()} />);

    fireEvent.click(
      screen.getByRole("radio", { name: "Select Node type" }),
    );
    expect(screen.getByRole("button", { name: "Confirm" })).toBeEnabled();

    pendingPlacement = createDirectPendingPlacement({
      candidateId: "breakdown-2",
      candidateLabel: "Next Project",
      sourceBreakdownId: "breakdown-2",
      dropId: "triage-hierarchy:parent-2",
    });
    rerender(<TriageWorkspace node={createNode()} />);

    expect(
      screen.getByRole("radio", { name: "Select Node type" }),
    ).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();
  });
});
