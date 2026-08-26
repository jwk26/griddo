import "@testing-library/jest-dom/vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTriageStore } from "@/stores/triage-store";
import type {
  PendingPlacement,
  TriageDragItem,
  TriageTargetFeedback,
} from "@/hooks/use-dnd";
import type { ScratchTitleBlockerHandle } from "@/hooks/use-scratch-breakdowns";
import {
  requestActiveTriageDeparture,
  type TriageDepartureController,
} from "@/hooks/use-triage-departure";
import type { Node } from "@/types";
import { TriageWorkspace } from "./triage-workspace";

const globalsCss = readFileSync(
  join(process.cwd(), "src/app/globals.css"),
  "utf8",
);
const workspaceSource = readFileSync(
  join(process.cwd(), "src/components/triage/triage-workspace.tsx"),
  "utf8",
);

const useTriageDndMock = vi.hoisted(() => vi.fn());
const useStagedCandidatesMock = vi.hoisted(() => vi.fn());
const stageCandidateMock = vi.hoisted(() => vi.fn());
const reconcileStageCandidateMock = vi.hoisted(() => vi.fn());
const unstageCandidateMock = vi.hoisted(() => vi.fn());
const reconcileUnstageCandidateMock = vi.hoisted(() => vi.fn());
const handlePlacementConfirmMock = vi.hoisted(() => vi.fn());
const handlePlacementCancelMock = vi.hoisted(() => vi.fn());
const stagingZoneRenderMock = vi.hoisted(() => vi.fn());
const useGridDataMock = vi.hoisted(() => vi.fn());
const useExplorerRemoteStatusMock = vi.hoisted(() => vi.fn());
const useInboxMock = vi.hoisted(() => vi.fn());
const getBitMock = vi.hoisted(() => vi.fn());
const getBitsMock = vi.hoisted(() => vi.fn());
const getDataStoreMock = vi.hoisted(() => vi.fn());
const placeDirectBreakdownMock = vi.hoisted(() => vi.fn());
const placeStagedCandidateMock = vi.hoisted(() => vi.fn());
const reconcileDirectPlacementMock = vi.hoisted(() => vi.fn());
const reconcileStagedPlacementMock = vi.hoisted(() => vi.fn());
const inboxState = vi.hoisted(() => ({ activeScratchBits: [] as Array<{ id: string; title: string }> }));
const breakdownSurfaceState = vi.hoisted(() => ({
  addDraft: "",
  editorDrafts: [] as Array<{ kind: "scratch-title" | "breakdown"; value: string }>,
}));
const titleBlockerHandleState = vi.hoisted(() => ({
  handle: null as ScratchTitleBlockerHandle | null,
}));
const departureControllerState = vi.hoisted(() => ({
  controller: null as TriageDepartureController | null,
}));

vi.mock("@/hooks/use-dnd", () => ({
  useTriageDnd: useTriageDndMock,
}));

vi.mock("@/hooks/use-staged-candidates", () => ({
  useStagedCandidates: useStagedCandidatesMock,
}));

vi.mock("@/hooks/use-grid-data", () => ({
  useGridData: useGridDataMock,
}));

vi.mock("@/hooks/use-explorer-remote-status", () => ({
  useExplorerRemoteStatus: useExplorerRemoteStatusMock,
}));

vi.mock("@/hooks/use-inbox", () => ({
  useInbox: useInboxMock,
}));

vi.mock("@/lib/db/datastore", () => ({
  getDataStore: getDataStoreMock,
}));

vi.mock("@/components/triage/scratch-pool", async () => {
  const { useTriageStore } = await import("@/stores/triage-store");
  return {
    ScratchPool: () => (
      <div data-testid="scratch-pool">
        {[
          ["scratch-2", "Second Scratch"],
          ["scratch-3", "Third Scratch"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => useTriageStore.getState().selectScratch(id)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                useTriageStore.getState().selectScratch(id);
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>
    ),
  };
});

vi.mock("@/components/triage/breakdown-panel", async () => {
  const { useScratchTitleBlockerContext } = await import(
    "@/hooks/use-scratch-breakdowns"
  );
  const { useTriageDepartureContext } = await import(
    "@/hooks/use-triage-departure"
  );
  const { useTriageStore } = await import("@/stores/triage-store");
  return {
    BreakdownPanel: ({
      activeDragItem,
      overTargetId,
      successSignal,
    }: {
      activeDragItem?: TriageDragItem;
      overTargetId?: string | null;
      successSignal?: {
        kind: "add" | "unstage";
        operationId: string;
        rowId: string;
      } | null;
    }) => {
      titleBlockerHandleState.handle = useScratchTitleBlockerContext();
      departureControllerState.controller = useTriageDepartureContext();
      const selectedScratchId = useTriageStore((state) => state.selectedScratchId);
      return (
        <div
          data-active-drag-kind={activeDragItem?.kind}
          data-over-target-id={overTargetId ?? undefined}
          data-success-kind={successSignal?.kind}
          data-success-operation-id={successSignal?.operationId}
          data-success-row-id={successSignal?.rowId}
          data-testid="breakdown-panel"
        >
          <div data-breakdown-id="breakdown-1">
            <button aria-label="Drag breakdown" type="button">
              Source grip
            </button>
          </div>
          <div data-testid="selected-scratch-context" tabIndex={-1}>
            Context for {selectedScratchId ?? "none"}
            {breakdownSurfaceState.editorDrafts
              .filter((draft) => draft.kind === "scratch-title")
              .map((draft) => (
                <div className="triage-inline-editor" data-triage-editor-state="dirty" key={draft.value}>
                  <input data-triage-role="inline-editor-field" readOnly value={draft.value} />
                </div>
              ))}
          </div>
          {breakdownSurfaceState.editorDrafts
            .filter((draft) => draft.kind === "breakdown")
            .map((draft) => (
              <div data-testid="breakdown-row" key={draft.value}>
                <div className="triage-inline-editor" data-triage-editor-state="dirty">
                  <input data-triage-role="inline-editor-field" readOnly value={draft.value} />
                </div>
              </div>
            ))}
          {breakdownSurfaceState.addDraft ? (
            <input
              data-triage-role="breakdown-add-field"
              readOnly
              value={breakdownSurfaceState.addDraft}
            />
          ) : null}
        </div>
      );
    },
  };
});

vi.mock("@/components/triage/staging-zone", () => ({
  StagingAlertBand: ({
    copy,
    onDismiss,
  }: {
    copy: string;
    onDismiss: () => void;
  }) => (
    <div data-triage-role="staging-local-alert">
      <span>{copy}</span>
      <button aria-label="Dismiss Staging alert" type="button" onClick={onDismiss}>
        X
      </button>
    </div>
  ),
  StagingZone: (props: {
    type: "node" | "bit";
    newCandidateIds?: ReadonlySet<string>;
    projection?: { candidates?: Array<{ id: string; content: string }> };
    onObservedTop?: () => void;
  }) => {
    stagingZoneRenderMock(props);
    return (
      <div
        data-testid={`${props.type}-staging-zone`}
        data-triage-role={`staging-${props.type}-well`}
      >
        {props.projection?.candidates?.map((candidate) => (
          <button data-candidate-id={candidate.id} key={candidate.id} type="button">
            {candidate.content}
          </button>
        ))}
      </div>
    );
  },
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
    version: overrides.version ?? 1,
    pastDeadlineDismissed: overrides.pastDeadlineDismissed ?? false,
  };
}

type DndState = {
  sensors: unknown[];
  activeDragItem: TriageDragItem;
  overTargetId: string | null;
  pendingPlacement: PendingPlacement;
  localPlacementResult: null | { id: string; type: "node" | "bit" };
  handleDragStart: ReturnType<typeof vi.fn>;
  handleDragEnd: ReturnType<typeof vi.fn>;
  handleDragCancel: ReturnType<typeof vi.fn>;
  handleDragOver: ReturnType<typeof vi.fn>;
  handlePlacementConfirm: ReturnType<typeof vi.fn>;
  handlePlacementCancel: ReturnType<typeof vi.fn>;
  clearPendingPlacement: ReturnType<typeof vi.fn>;
  refreshRenderedTarget: ReturnType<typeof vi.fn>;
  targetFeedback: TriageTargetFeedback;
};

function createDndState(overrides: Partial<DndState> = {}): DndState {
  return {
    sensors: [],
    activeDragItem: null,
    overTargetId: null,
    pendingPlacement: null,
    localPlacementResult: null,
    handleDragStart: vi.fn(),
    handleDragEnd: vi.fn(),
    handleDragCancel: vi.fn(),
    handleDragOver: vi.fn(),
    handlePlacementConfirm: handlePlacementConfirmMock,
    handlePlacementCancel: handlePlacementCancelMock,
    clearPendingPlacement: vi.fn(),
    refreshRenderedTarget: vi.fn(),
    targetFeedback: null,
    ...overrides,
  };
}

function createDirectPendingPlacement(
  overrides: Partial<NonNullable<PendingPlacement>> = {},
): NonNullable<PendingPlacement> {
  return {
    scratchBitId: "scratch-1",
    candidateId: "breakdown-1",
    candidateType: null,
    candidateVersion: null,
    candidateLabel: "Project",
    sourceBreakdownId: "breakdown-1",
    sourceVersion: 1,
    dropId: "triage-hierarchy:parent-1",
    parentNodeId: "parent-1",
    targetNodeLevel: 0,
    targetTitle: "Parent",
    targetParentPath: ["Home"],
    expectedAncestorIds: ["parent-1"],
    cell: { x: 0, y: 0 },
    isFull: false,
    isDirectBreakdown: true,
    ...overrides,
  };
}

beforeEach(() => {
  titleBlockerHandleState.handle = null;
  departureControllerState.controller = null;
  handlePlacementConfirmMock.mockReset();
  handlePlacementConfirmMock.mockResolvedValue(undefined);
  handlePlacementCancelMock.mockReset();
  stagingZoneRenderMock.mockReset();
  stageCandidateMock.mockReset();
  reconcileStageCandidateMock.mockReset();
  unstageCandidateMock.mockReset();
  reconcileUnstageCandidateMock.mockReset();
  useGridDataMock.mockReset();
  useGridDataMock.mockReturnValue({ nodes: [], bits: [], isLoading: false });
  useExplorerRemoteStatusMock.mockReset();
  useExplorerRemoteStatusMock.mockImplementation(({ pathIds }) => ({
    isReady: true,
    validPathIds: [...pathIds],
  }));
  inboxState.activeScratchBits = [
    { id: "scratch-2", title: "Second Scratch" },
    { id: "scratch-3", title: "Third Scratch" },
  ];
  getBitMock.mockReset();
  getBitMock.mockResolvedValue({
    id: "scratch-1",
    archivedAt: null,
    deletedAt: null,
  });
  getBitsMock.mockReset();
  getBitsMock.mockImplementation(async () =>
    inboxState.activeScratchBits.map((scratch, index) => ({
      ...scratch,
      createdAt: index + 1,
    })),
  );
  placeDirectBreakdownMock.mockReset();
  placeStagedCandidateMock.mockReset();
  reconcileDirectPlacementMock.mockReset();
  reconcileStagedPlacementMock.mockReset();
  placeDirectBreakdownMock.mockImplementation(async (command) => ({
    operationId: command.operationId,
    status: "applied",
    result: { id: command.resultId, title: command.title },
    source: null,
    candidate: null,
  }));
  placeStagedCandidateMock.mockImplementation(async (command) => ({
    operationId: command.operationId,
    status: "applied",
    result: { id: command.resultId, title: command.title },
    source: null,
    candidate: null,
  }));
  reconcileDirectPlacementMock.mockImplementation(placeDirectBreakdownMock);
  reconcileStagedPlacementMock.mockImplementation(placeStagedCandidateMock);
  getDataStoreMock.mockReset();
  getDataStoreMock.mockResolvedValue({
    getBit: getBitMock,
    getBits: getBitsMock,
    placeDirectBreakdown: placeDirectBreakdownMock,
    placeStagedCandidate: placeStagedCandidateMock,
    reconcileDirectPlacement: reconcileDirectPlacementMock,
    reconcileStagedPlacement: reconcileStagedPlacementMock,
  });
  useInboxMock.mockReset();
  useInboxMock.mockImplementation(() => inboxState);
  breakdownSurfaceState.addDraft = "";
  breakdownSurfaceState.editorDrafts = [];
  useTriageStore.setState({
    selectedScratchId: "scratch-1",
    externalScratchRemoval: null,
    scratchPoolQuery: "",
    scratchPoolActiveIds: ["scratch-1", "scratch-2", "scratch-3"],
    scratchPoolResultIds: ["scratch-1", "scratch-2", "scratch-3"],
    stagedCandidates: {},
  });
  useTriageDndMock.mockReset();
  useTriageDndMock.mockReturnValue(createDndState());
  useStagedCandidatesMock.mockReset();
  useStagedCandidatesMock.mockReturnValue({
    isReady: true,
    candidates: [],
    integrityCandidates: [],
    pendingOperations: [],
    unknownOperations: [],
    reconcilingOperations: [],
    counts: { nodes: 0, bits: 0 },
    eligibility: { stagedSourceIds: new Set<string>() },
    stageCandidate: stageCandidateMock,
    reconcileStageCandidate: reconcileStageCandidateMock,
    unstageCandidate: unstageCandidateMock,
    reconcileUnstageCandidate: reconcileUnstageCandidateMock,
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("TriageWorkspace", () => {
  it("keeps library auto-scroll disabled and wires explicit drag cancellation", () => {
    expect(workspaceSource).toContain("autoScroll={false}");
    expect(workspaceSource).toContain("onDragCancel={handleDragCancel}");
  });

  it("keeps reactive DataStore reads behind the dedicated hook boundary", () => {
    expect(workspaceSource).not.toContain('from "dexie"');
    expect(workspaceSource).not.toContain("getDataStore");
    expect(workspaceSource).toContain(
      'from "@/hooks/use-external-scratch-removal-data"',
    );
  });

  it("wires the durable candidate commands and shared operation lock into the one DnD owner", () => {
    render(<TriageWorkspace node={createNode()} />);

    expect(useTriageDndMock).toHaveBeenCalledWith(
      "scratch-1",
      expect.objectContaining({
        stageCandidate: expect.any(Function),
        reconcileStageCandidate: expect.any(Function),
        unstageCandidate: expect.any(Function),
        reconcileUnstageCandidate: expect.any(Function),
        operationLock: expect.objectContaining({
          acquire: expect.any(Function),
          release: expect.any(Function),
        }),
        focusUnstagedSource: expect.any(Function),
      }),
    );
  });

  it("projects the mounted authoritative candidate state into both Staging zones", () => {
    const candidate = {
      id: "candidate-1",
      scratchBitId: "scratch-1",
      sourceBreakdownId: "breakdown-1",
      resultType: "node",
      lifecycle: "staged",
      createdAt: 1,
      updatedAt: 1,
      version: 1,
      content: "Project",
      source: {
        id: "breakdown-1",
        scratchBitId: "scratch-1",
        content: "Project",
        order: 0,
        createdAt: 1,
        consumedAt: null,
        version: 1,
      },
    };
    useStagedCandidatesMock.mockReturnValue({
      isReady: true,
      candidates: [candidate],
      integrityCandidates: [],
      pendingOperations: [],
      unknownOperations: [
        {
          operationId: "unstage-1",
          candidateId: candidate.id,
          sourceBreakdownId: candidate.sourceBreakdownId,
          kind: "unstage",
          phase: "unknown",
        },
      ],
      reconcilingOperations: [],
      counts: { nodes: 1, bits: 0 },
      eligibility: { stagedSourceIds: new Set(["breakdown-1"]) },
      stageCandidate: stageCandidateMock,
      reconcileStageCandidate: reconcileStageCandidateMock,
      unstageCandidate: unstageCandidateMock,
      reconcileUnstageCandidate: reconcileUnstageCandidateMock,
    });

    render(<TriageWorkspace node={createNode()} />);

    expect(stagingZoneRenderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "node",
        projection: expect.objectContaining({
          candidates: [candidate],
          operations: [
            expect.objectContaining({
              operationId: "unstage-1",
              title: "Project",
              resultType: "node",
            }),
          ],
        }),
      }),
    );
  });

  it("projects only an authoritative local Unstage success identity into Breakdown", async () => {
    unstageCandidateMock.mockResolvedValue({
      operationId: "unstage-1",
      status: "applied",
    });
    render(<TriageWorkspace node={createNode()} />);
    const options = useTriageDndMock.mock.calls[0]?.[1] as {
      unstageCandidate: (command: Record<string, unknown>) => Promise<unknown>;
    };

    await act(async () => {
      await options.unstageCandidate({
        operationId: "unstage-1",
        candidateId: "candidate-1",
        candidateExpectedVersion: 1,
        sourceBreakdownId: "breakdown-1",
        sourceExpectedVersion: 1,
      });
    });

    expect(screen.getByTestId("breakdown-panel")).toHaveAttribute(
      "data-success-kind",
      "unstage",
    );
    expect(screen.getByTestId("breakdown-panel")).toHaveAttribute(
      "data-success-operation-id",
      "unstage-1",
    );
    expect(screen.getByTestId("breakdown-panel")).toHaveAttribute(
      "data-success-row-id",
      "breakdown-1",
    );
    expect(
      screen.queryByRole("button", { name: "Dismiss Staging alert" }),
    ).toBeNull();
  });

  it("waits for authoritative reconciliation and projects its stable Unstage identity once", async () => {
    unstageCandidateMock.mockResolvedValue({
      operationId: "unstage-1",
      outcome: "unknown",
    });
    reconcileUnstageCandidateMock.mockResolvedValue({
      operationId: "unstage-1",
      status: "already_applied",
    });
    render(<TriageWorkspace node={createNode()} />);
    const options = useTriageDndMock.mock.calls[0]?.[1] as {
      unstageCandidate: (command: Record<string, unknown>) => Promise<unknown>;
      reconcileUnstageCandidate: (
        command: Record<string, unknown>,
      ) => Promise<unknown>;
    };
    const command = {
      operationId: "unstage-1",
      candidateId: "candidate-1",
      candidateExpectedVersion: 1,
      sourceBreakdownId: "breakdown-1",
      sourceExpectedVersion: 1,
    };

    await act(async () => {
      await options.unstageCandidate(command);
    });
    expect(screen.getByTestId("breakdown-panel")).not.toHaveAttribute(
      "data-success-operation-id",
    );

    await act(async () => {
      await options.reconcileUnstageCandidate(command);
    });
    expect(screen.getByTestId("breakdown-panel")).toHaveAttribute(
      "data-success-operation-id",
      "unstage-1",
    );
  });

  it("clears mounted Unstage success authority across a Scratch switch without replay", async () => {
    unstageCandidateMock.mockResolvedValue({
      operationId: "unstage-1",
      status: "applied",
    });
    render(<TriageWorkspace node={createNode()} />);
    const options = useTriageDndMock.mock.calls[0]?.[1] as {
      unstageCandidate: (command: Record<string, unknown>) => Promise<unknown>;
    };
    await act(async () => {
      await options.unstageCandidate({
        operationId: "unstage-1",
        candidateId: "candidate-1",
        candidateExpectedVersion: 1,
        sourceBreakdownId: "breakdown-1",
        sourceExpectedVersion: 1,
      });
    });

    act(() => useTriageStore.getState().selectScratch("scratch-2"));
    expect(screen.getByTestId("breakdown-panel")).not.toHaveAttribute(
      "data-success-operation-id",
    );
    act(() => useTriageStore.getState().selectScratch("scratch-1"));
    expect(screen.getByTestId("breakdown-panel")).not.toHaveAttribute(
      "data-success-operation-id",
    );
  });

  it("uses the ready empty snapshot as baseline and reports a later remote Node arrival without stealing focus", async () => {
    const initial = {
      isReady: true,
      candidates: [],
      integrityCandidates: [],
      pendingOperations: [],
      unknownOperations: [],
      reconcilingOperations: [],
      counts: { nodes: 0, bits: 0 },
      eligibility: { stagedSourceIds: new Set<string>() },
      stageCandidate: stageCandidateMock,
      reconcileStageCandidate: reconcileStageCandidateMock,
      unstageCandidate: unstageCandidateMock,
      reconcileUnstageCandidate: reconcileUnstageCandidateMock,
    };
    useStagedCandidatesMock.mockReturnValue(initial);
    const view = render(<TriageWorkspace node={createNode()} />);
    const existingFocus = screen.getByRole("button", { name: "Drag breakdown" });
    existingFocus.focus();

    useStagedCandidatesMock.mockReturnValue({
      ...initial,
      candidates: [
        {
          id: "remote-node",
          scratchBitId: "scratch-1",
          sourceBreakdownId: "breakdown-remote",
          resultType: "node",
          lifecycle: "staged",
          createdAt: 2,
          updatedAt: 2,
          version: 1,
          content: "Remote node",
          source: {
            id: "breakdown-remote",
            scratchBitId: "scratch-1",
            content: "Remote node",
            order: 0,
            createdAt: 2,
            consumedAt: null,
            version: 1,
          },
        },
      ],
      counts: { nodes: 1, bits: 0 },
    });
    view.rerender(<TriageWorkspace node={createNode()} />);

    const indicator = await screen.findByRole("button", { name: "Show new Nodes" });
    expect(indicator).toHaveTextContent("1 new");
    expect(existingFocus).toHaveFocus();

    const nodeWell = screen.getByTestId("node-staging-zone");
    nodeWell.scrollTop = 40;
    fireEvent.click(indicator);
    expect(nodeWell.scrollTop).toBe(0);
    expect(screen.getByText("Remote node")).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Show new Nodes" })).not.toBeInTheDocument();
  });

  it("excludes a local Stage identity from the remote-arrival indicator", async () => {
    const initial = {
      isReady: true,
      candidates: [],
      integrityCandidates: [],
      pendingOperations: [],
      unknownOperations: [],
      reconcilingOperations: [],
      counts: { nodes: 0, bits: 0 },
      eligibility: { stagedSourceIds: new Set<string>() },
      stageCandidate: stageCandidateMock,
      reconcileStageCandidate: reconcileStageCandidateMock,
      unstageCandidate: unstageCandidateMock,
      reconcileUnstageCandidate: reconcileUnstageCandidateMock,
    };
    stageCandidateMock.mockResolvedValue({
      operationId: "stage-local",
      status: "applied",
      candidate: null,
      source: null,
      scratch: null,
    });
    useStagedCandidatesMock.mockReturnValue(initial);
    const view = render(<TriageWorkspace node={createNode()} />);
    const options = useTriageDndMock.mock.calls[0]?.[1] as {
      stageCandidate: (command: Record<string, unknown>) => Promise<unknown>;
    };

    await act(async () => {
      await options.stageCandidate({
        operationId: "stage-local",
        candidateId: "local-node",
        scratchBitId: "scratch-1",
        sourceBreakdownId: "breakdown-local",
        sourceExpectedVersion: 1,
        resultType: "node",
      });
    });
    useStagedCandidatesMock.mockReturnValue({
      ...initial,
      candidates: [
        {
          id: "local-node",
          resultType: "node",
          content: "Local node",
          source: { version: 1 },
        },
      ],
      counts: { nodes: 1, bits: 0 },
    });
    view.rerender(<TriageWorkspace node={createNode()} />);

    expect(
      screen.queryByRole("button", { name: "Show new Nodes" }),
    ).not.toBeInTheDocument();
  });

  it("renders and dismisses a terminal Stage alert without a Retry action", async () => {
    stageCandidateMock.mockResolvedValue({
      operationId: "stage-1",
      status: "not_applied",
      candidate: null,
      source: null,
      scratch: null,
    });
    useTriageDndMock.mockReturnValue(
      createDndState({
        activeDragItem: {
          kind: "triage-breakdown",
          id: "breakdown-1",
          label: "Project",
          scratchId: "scratch-1",
          sourceBreakdownId: "breakdown-1",
          sourceVersion: 1,
          sourceLifecycle: "active",
        },
      }),
    );
    render(<TriageWorkspace node={createNode()} />);
    const options = useTriageDndMock.mock.calls[0]?.[1] as {
      stageCandidate: (command: Record<string, unknown>) => Promise<unknown>;
    };

    await act(async () => {
      await options.stageCandidate({
        operationId: "stage-1",
        candidateId: "candidate-1",
        scratchBitId: "scratch-1",
        sourceBreakdownId: "breakdown-1",
        sourceExpectedVersion: 1,
        resultType: "node",
      });
    });

    expect(
      within(screen.getByRole("button", { name: "Dismiss Staging alert" }).parentElement!)
        .getByText("“Project” was not staged. Drag it again to retry."),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("staging-live-region"),
    ).toHaveTextContent("“Project” was not staged. Drag it again to retry.");
    expect(screen.getByTestId("staging-live-region")).toHaveAttribute(
      "aria-live",
      "polite",
    );
    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss Staging alert" }));
    expect(screen.queryByText(/was not staged/)).not.toBeInTheDocument();
  });

  it("projects only the explicit invalidated drag signal after snapshot release", () => {
    let activeDragItem: TriageDragItem = {
      kind: "triage-staged-node",
      id: "candidate-1",
      label: "Project",
      integrity: "invalidated",
    };
    useTriageDndMock.mockImplementation(() =>
      createDndState({ activeDragItem }),
    );
    const view = render(<TriageWorkspace node={createNode()} />);

    expect(screen.queryByText("“Project” changed elsewhere. Drop canceled.")).not.toBeInTheDocument();

    activeDragItem = null;
    view.rerender(<TriageWorkspace node={createNode()} />);

    expect(
      within(screen.getByRole("button", { name: "Dismiss Staging alert" }).parentElement!)
        .getByText("“Project” changed elsewhere. Drop canceled."),
    ).toBeInTheDocument();
  });

  it("clears an Unstage failure only after the authoritative candidate disappears", async () => {
    const candidate = {
      id: "candidate-1",
      scratchBitId: "scratch-1",
      sourceBreakdownId: "breakdown-1",
      resultType: "bit" as const,
      lifecycle: "staged" as const,
      createdAt: 1,
      updatedAt: 1,
      version: 1,
      content: "Project",
      source: {
        id: "breakdown-1",
        scratchBitId: "scratch-1",
        content: "Project",
        order: 0,
        createdAt: 1,
        consumedAt: null,
        version: 1,
      },
    };
    const projection = {
      isReady: true,
      candidates: [candidate],
      integrityCandidates: [],
      pendingOperations: [],
      unknownOperations: [],
      reconcilingOperations: [],
      counts: { nodes: 0, bits: 1 },
      eligibility: { stagedSourceIds: new Set(["breakdown-1"]) },
      stageCandidate: stageCandidateMock,
      reconcileStageCandidate: reconcileStageCandidateMock,
      unstageCandidate: unstageCandidateMock,
      reconcileUnstageCandidate: reconcileUnstageCandidateMock,
    };
    unstageCandidateMock.mockResolvedValue({
      operationId: "unstage-1",
      status: "conflict",
      candidate,
      source: candidate.source,
    });
    useStagedCandidatesMock.mockReturnValue(projection);
    useTriageDndMock.mockReturnValue(
      createDndState({
        activeDragItem: {
          kind: "triage-staged-bit",
          id: candidate.id,
          label: candidate.content,
        },
      }),
    );
    const view = render(<TriageWorkspace node={createNode()} />);
    const options = useTriageDndMock.mock.calls[0]?.[1] as {
      unstageCandidate: (command: Record<string, unknown>) => Promise<unknown>;
    };

    await act(async () => {
      await options.unstageCandidate({
        operationId: "unstage-1",
        candidateId: candidate.id,
        candidateExpectedVersion: 1,
        sourceBreakdownId: candidate.sourceBreakdownId,
        sourceExpectedVersion: 1,
      });
    });
    expect(screen.getByRole("button", { name: "Dismiss Staging alert" })).toBeInTheDocument();

    useStagedCandidatesMock.mockReturnValue({
      ...projection,
      candidates: [],
      counts: { nodes: 0, bits: 0 },
    });
    view.rerender(<TriageWorkspace node={createNode()} />);

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "Dismiss Staging alert" }),
      ).not.toBeInTheDocument();
    });
  });

  it("binds the static Staging status family to reduced motion and all eight themes", () => {
    expect(globalsCss).toContain(".staging-operation-status");
    expect(globalsCss).toContain(".staging-arrival-count");
    expect(globalsCss).toContain(".staging-local-alert");
    expect(globalsCss).toContain("@media (prefers-reduced-motion: reduce)");
    expect(globalsCss).toContain('[data-triage-role^="staging-"]');
    for (const theme of [
      "tiny-desk",
      "neumorphism",
      "claymorphism",
      "origami",
      "terminal",
      "retro-mac",
      "graphite",
    ]) {
      expect(globalsCss).toContain(`:root[data-color-theme="${theme}"]\n  .staging-local-alert`);
    }
  });

  it("passes the staged drag snapshot to the transient Breakdown drop-back surface", () => {
    useTriageDndMock.mockReturnValue(
      createDndState({
        activeDragItem: {
          kind: "triage-staged-bit",
          id: "candidate-1",
          label: "Return me",
        },
        overTargetId: "triage-remove-drop:breakdown",
      }),
    );

    render(<TriageWorkspace node={createNode()} />);

    expect(screen.getByTestId("breakdown-panel")).toHaveAttribute(
      "data-active-drag-kind",
      "triage-staged-bit",
    );
    expect(screen.getByTestId("breakdown-panel")).toHaveAttribute(
      "data-over-target-id",
      "triage-remove-drop:breakdown",
    );
  });

  it("restores focus to the surviving source grip after confirmed Unstage", () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    render(<TriageWorkspace node={createNode()} />);
    const options = useTriageDndMock.mock.calls[0]?.[1] as {
      focusUnstagedSource: (sourceBreakdownId: string) => void;
    };

    options.focusUnstagedSource("breakdown-1");

    expect(screen.getByRole("button", { name: "Drag breakdown" })).toHaveFocus();
  });

  it("renders ScratchPool in the left panel and wires in BreakdownPanel", () => {
    render(<TriageWorkspace node={createNode()} />);

    const workspace = screen.getByTestId("triage-workspace");

    expect(within(workspace).getByTestId("scratch-pool")).toBeInTheDocument();
    expect(within(workspace).getByTestId("breakdown-panel")).toBeInTheDocument();
    expect(workspace).not.toHaveAttribute("data-triage-operation-kind");
  });

  it("owns one mounted-page synchronous Scratch-title blocker handle", () => {
    render(<TriageWorkspace node={createNode()} />);

    expect(titleBlockerHandleState.handle?.getSnapshot()).toBeNull();
    titleBlockerHandleState.handle?.setSnapshot("dirty");
    expect(titleBlockerHandleState.handle?.getSnapshot()).toBe("dirty");
  });

  it("keeps the DP-VQ03 realization scoped out without a pending destination", () => {
    render(<TriageWorkspace node={createNode()} />);

    expect(departureControllerState.controller).not.toBeNull();
    expect(
      document.querySelector('[data-triage-state="departure-decision"]'),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector('[data-triage-role^="breakdown-departure"]'),
    ).not.toBeInTheDocument();
  });

  it("marks the workspace decision state and makes non-Breakdown areas inert", () => {
    render(<TriageWorkspace node={createNode()} />);

    act(() => {
      departureControllerState.controller?.setAddDraft("Protected Add draft");
      requestActiveTriageDeparture({
        id: "scratch-2",
        kind: "scratch",
        perform: vi.fn(),
      });
    });

    const workspace = screen.getByTestId("triage-workspace");
    expect(workspace).toHaveAttribute(
      "data-triage-state",
      "departure-decision",
    );
    expect(
      screen.getByRole("region", { name: "Scratch Pool" }),
    ).toHaveAttribute("inert");
    expect(screen.getByRole("region", { name: "Staging" })).toHaveAttribute(
      "inert",
    );
    expect(
      screen.getByRole("region", { name: "Grid Explorer" }),
    ).toHaveAttribute("inert");
    expect(screen.getByRole("region", { name: "Breakdown" })).not.toHaveAttribute(
      "inert",
    );
  });

  it("registers the mounted controller for Inbox route owners outside the Workspace", () => {
    const perform = vi.fn();
    render(<TriageWorkspace node={createNode()} />);

    act(() => {
      departureControllerState.controller?.setAddDraft("Protected Add draft");
      expect(
        requestActiveTriageDeparture({
          id: "/trash",
          kind: "route",
          perform,
        }),
      ).toBe("decision-required");
    });

    expect(perform).not.toHaveBeenCalled();
    expect(departureControllerState.controller?.pendingDestination).toEqual({
      id: "/trash",
      kind: "route",
    });
  });

  it("renders the dedicated DP-VQ01 surface paused with every full source-labeled draft", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    breakdownSurfaceState.addDraft = "Complete Add draft";
    breakdownSurfaceState.editorDrafts = [
      { kind: "scratch-title", value: "Complete title draft" },
      { kind: "breakdown", value: "Complete row draft" },
    ];
    render(<TriageWorkspace node={createNode()} />);
    act(() => {
      useTriageStore.setState({ externalScratchRemoval: {
        scratchId: "scratch-1",
        lifecycle: "delete",
        destinationId: "scratch-2",
        destinationKind: "scratch",
        removalOrder: ["scratch-1", "scratch-2", "scratch-3"],
      } });
    });
    const dialog = screen.getByRole("alertdialog", {
      name: "This Scratch was deleted elsewhere",
    });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveTextContent(
      "Movement paused. Destination: “Second Scratch”.",
    );
    expect(screen.getByText("Complete Add draft")).toBeInTheDocument();
    expect(screen.getByText("Complete title draft")).toBeInTheDocument();
    expect(screen.getByText("Complete row draft")).toBeInTheDocument();
    expect(screen.getByText("New Breakdown draft")).toBeInTheDocument();
    expect(screen.getByText("Scratch title draft")).toBeInTheDocument();
    expect(screen.getByText("Breakdown draft")).toBeInTheDocument();
    const copyActions = screen.getAllByRole("button", { name: "Copy full draft" });
    expect(copyActions[0]).toHaveFocus();

    fireEvent.click(copyActions[0]!);
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("Complete Add draft"));
    expect(copyActions[0]).toHaveFocus();
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
    expect(screen.getByText("Complete Add draft")).toBeInTheDocument();

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("binds every exact DP-VQ01 theme role family without JSX branches", () => {
    for (const requiredBinding of [
      'data-color-theme="tiny-desk"]\n  [data-triage-role="external-removal-countdown-track"]',
      'data-color-theme="tiny-desk"]\n  [data-triage-role^="external-removal-"][data-triage-role$="action"]',
      'data-color-theme="neumorphism"]\n  .external-removal-panel__actions button',
      'data-color-theme="claymorphism"]\n  [data-triage-role="external-removal-countdown-track"]',
      'data-color-theme="claymorphism"]\n  .external-removal-panel__actions button',
      'data-color-theme="origami"]\n  [data-triage-role="external-removal-countdown-track"]',
      'data-color-theme="origami"]\n  [data-triage-role="external-removal-secondary-action"]',
      'data-color-theme="terminal"]\n  [data-triage-role="external-removal-countdown-fill"]',
      'data-color-theme="retro-mac"] .external-removal-panel__title',
      'data-color-theme="retro-mac"]\n  [data-triage-role="external-removal-draft-card"]',
      'data-color-theme="retro-mac"]\n  .external-removal-panel__actions button',
      'data-color-theme="graphite"]\n  [data-triage-role="external-removal-draft-card"]',
      'data-color-theme="graphite"]\n  [data-triage-role="external-removal-countdown-track"]',
    ]) {
      expect(globalsCss).toContain(requiredBinding);
    }
    expect(globalsCss).not.toMatch(/colorTheme\s*[=!]=/);
  });

  it("pauses and resumes the exact remainder before terminal destination focus", async () => {
    vi.useFakeTimers();
    render(<TriageWorkspace node={createNode()} />);
    act(() => {
      useTriageStore.setState({ externalScratchRemoval: {
        scratchId: "scratch-1",
        lifecycle: "archive",
        destinationId: "scratch-2",
        destinationKind: "scratch",
        removalOrder: ["scratch-1", "scratch-2", "scratch-3"],
      } });
    });
    getBitMock.mockResolvedValue({
      id: "scratch-1",
      archivedAt: 100,
      deletedAt: null,
    });
    expect(
      document.querySelector('[data-triage-role="external-removal-destination"]'),
    ).toHaveTextContent("Moving to “Second Scratch” in 5 seconds.");
    const pause = screen.getByRole("button", { name: "Pause" });
    expect(pause).toHaveFocus();

    act(() => vi.advanceTimersByTime(2100));
    expect(
      document.querySelector('[data-triage-role="external-removal-destination"]'),
    ).toHaveTextContent("Moving to “Second Scratch” in 3 seconds.");
    fireEvent.click(pause);
    expect(
      document.querySelector('[data-triage-role="external-removal-destination"]'),
    ).toHaveTextContent("Movement paused. Destination: “Second Scratch”.");
    const frozenWidth = screen.getByTestId("external-removal-countdown-fill").getAttribute("style");

    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByTestId("external-removal-countdown-fill")).toHaveAttribute(
      "style",
      frozenWidth,
    );
    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    await act(async () => {
      vi.advanceTimersByTime(3000);
      await Promise.resolve();
    });

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(useTriageStore.getState().selectedScratchId).toBe("scratch-2");
    expect(screen.getByTestId("selected-scratch-context")).toHaveFocus();
    vi.useRealTimers();
  });

  it("rereads the authoritative destination immediately before terminal handoff", async () => {
    const node = createNode({ id: "inbox-node" });
    render(<TriageWorkspace node={node} />);
    act(() => {
      useTriageStore.setState({
        externalScratchRemoval: {
          scratchId: "scratch-1",
          lifecycle: "delete",
          destinationId: "scratch-2",
          destinationKind: "scratch",
          removalOrder: ["scratch-1", "scratch-2", "scratch-3"],
        },
      });
    });
    getBitMock.mockResolvedValue(undefined);
    getBitsMock.mockResolvedValue([
      { id: "scratch-1", title: "Stale Source", createdAt: 4 },
      { id: "scratch-3", title: "Third Scratch", createdAt: 3 },
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Move now" }));

    await waitFor(() =>
      expect(useTriageStore.getState().selectedScratchId).toBe("scratch-3"),
    );
    expect(getBitsMock).toHaveBeenLastCalledWith("inbox-node");
    expect(screen.getByTestId("selected-scratch-context")).toHaveFocus();
  });

  it("honors an authoritative archive restore discovered at terminal validation", async () => {
    breakdownSurfaceState.addDraft = "Retained terminal draft";
    const node = createNode({ id: "inbox-node" });
    render(<TriageWorkspace node={node} />);
    const context = screen.getByTestId("selected-scratch-context");
    context.focus();
    act(() => {
      useTriageStore.setState({
        externalScratchRemoval: {
          scratchId: "scratch-1",
          lifecycle: "archive",
          destinationId: "scratch-2",
          destinationKind: "scratch",
          removalOrder: ["scratch-1", "scratch-2", "scratch-3"],
        },
      });
    });
    getBitMock.mockResolvedValue({
      id: "scratch-1",
      archivedAt: null,
      deletedAt: null,
    });
    getBitsMock.mockResolvedValue([
      { id: "scratch-2", title: "Second Scratch", createdAt: 2 },
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Move now" }));

    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    expect(useTriageStore.getState().selectedScratchId).toBe("scratch-1");
    expect(screen.getByDisplayValue("Retained terminal draft")).toBeInTheDocument();
    expect(context).toHaveFocus();
  });

  it("excludes a stale active projection when the final source read is archived", async () => {
    render(<TriageWorkspace node={createNode({ id: "inbox-node" })} />);
    act(() => {
      useTriageStore.setState({
        externalScratchRemoval: {
          scratchId: "scratch-1",
          lifecycle: "archive",
          destinationId: "scratch-2",
          destinationKind: "scratch",
          removalOrder: ["scratch-1", "scratch-2", "scratch-3"],
        },
      });
    });
    getBitsMock.mockResolvedValue([
      { id: "scratch-1", title: "Stale Source", createdAt: 4 },
      { id: "scratch-3", title: "Third Scratch", createdAt: 3 },
    ]);
    getBitMock.mockResolvedValue({
      id: "scratch-1",
      archivedAt: 100,
      deletedAt: null,
    });

    fireEvent.click(screen.getByRole("button", { name: "Move now" }));

    await waitFor(() =>
      expect(useTriageStore.getState().selectedScratchId).toBe("scratch-3"),
    );
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("selected-scratch-context")).toHaveFocus();
  });

  it("restarts only a running countdown when the destination changes", () => {
    vi.useFakeTimers();
    render(<TriageWorkspace node={createNode()} />);
    act(() => {
      useTriageStore.setState({ externalScratchRemoval: {
        scratchId: "scratch-1",
        lifecycle: "delete",
        destinationId: "scratch-2",
        destinationKind: "scratch",
        removalOrder: ["scratch-1", "scratch-2", "scratch-3"],
      } });
    });
    act(() => vi.advanceTimersByTime(2200));
    expect(
      document.querySelector('[data-triage-role="external-removal-destination"]'),
    ).toHaveTextContent("Moving to “Second Scratch” in 3 seconds.");

    inboxState.activeScratchBits = [{ id: "scratch-3", title: "Third Scratch" }];
    act(() => {
      useTriageStore.getState().reconcileScratchPoolContext({
        activeIds: ["scratch-3"],
        visibleIds: ["scratch-3"],
      });
    });
    act(() => vi.runAllTicks());

    expect(
      document.querySelector('[data-triage-role="external-removal-destination"]'),
    ).toHaveTextContent("Moving to “Third Scratch” in 5 seconds.");
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    inboxState.activeScratchBits = [{ id: "scratch-2", title: "Second Scratch" }];
    act(() => {
      useTriageStore.getState().reconcileScratchPoolContext({
        activeIds: ["scratch-2"],
        visibleIds: ["scratch-2"],
      });
    });
    expect(
      document.querySelector('[data-triage-role="external-removal-destination"]'),
    ).toHaveTextContent("Movement paused. Destination: “Second Scratch”.");
    vi.useRealTimers();
  });

  it("cancels only on authoritative archive restore and retains page-memory drafts", () => {
    breakdownSurfaceState.addDraft = "Retained Add draft";
    inboxState.activeScratchBits = [{ id: "scratch-1", title: "Restored Scratch" }];
    render(<TriageWorkspace node={createNode()} />);
    const context = screen.getByTestId("selected-scratch-context");
    context.focus();

    inboxState.activeScratchBits = [{ id: "scratch-2", title: "Second Scratch" }];
    act(() => {
      useTriageStore.getState().reconcileScratchPoolContext({
        activeIds: ["scratch-2"],
        visibleIds: ["scratch-2"],
      });
      useTriageStore
        .getState()
        .setExternalScratchRemovalLifecycle("scratch-1", "archive");
    });
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    inboxState.activeScratchBits = [{ id: "scratch-1", title: "Restored Scratch" }];
    act(() => {
      useTriageStore.getState().reconcileScratchPoolContext({
        activeIds: ["scratch-1"],
        visibleIds: ["scratch-1"],
      });
    });

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(useTriageStore.getState().selectedScratchId).toBe("scratch-1");
    expect(screen.getByDisplayValue("Retained Add draft")).toBeInTheDocument();
    expect(context).toHaveFocus();
  });

  it("renders one semantic shell with visible identities for all four areas", () => {
    render(<TriageWorkspace node={createNode()} />);

    const workspace = screen.getByRole("region", {
      name: "Inbox triage workspace",
    });

    expect(workspace).toHaveAttribute(
      "data-triage-role",
      "shell-background",
    );
    expect(workspace).toHaveAttribute("data-triage-state", "default");

    for (const name of [
      "Scratch Pool",
      "Breakdown",
      "Staging",
      "Grid Explorer",
    ]) {
      const region = within(workspace).getByRole("region", { name });
      const heading = within(region).getByRole("heading", { name });

      expect(region).toHaveAttribute("data-triage-role", "section-surface");
      expect(region).toHaveAttribute("data-triage-state", "default");
      expect(heading).toHaveAttribute("tabindex", "-1");
      expect(heading).toHaveAttribute("data-triage-role", "section-header");
    }

    expect(screen.getByTestId("hierarchy-explorer")).toBeInTheDocument();
    expect(screen.getByTestId("node-staging-zone")).toBeInTheDocument();
    expect(screen.getByTestId("bit-staging-zone")).toBeInTheDocument();
  });

  it("declares the approved shell ratios, desktop minimum, and hidden-scroll viewports", () => {
    render(<TriageWorkspace node={createNode()} />);

    const workspace = screen.getByTestId("triage-workspace");

    expect(workspace).toHaveClass("triage-shell");
    expect(workspace).toHaveAttribute("data-min-viewport", "1024px");
    expect(screen.getByTestId("triage-main-work-area")).toHaveAttribute(
      "data-layout-ratio",
      "60/40",
    );
    expect(screen.getByTestId("triage-top-work-area")).toHaveAttribute(
      "data-layout-ratio",
      "60/40",
    );
    expect(screen.getByTestId("triage-staging-columns")).toHaveAttribute(
      "data-layout-ratio",
      "35/65",
    );

    expect(
      workspace.querySelectorAll(
        '[data-triage-role="internal-scroll-viewport"]',
      ),
    ).toHaveLength(5);
  });

  it("prefixes subsection headings only when authoritative type counts reach two", () => {
    useStagedCandidatesMock.mockReturnValue({
      counts: { nodes: 2, bits: 3 },
    });

    render(<TriageWorkspace node={createNode()} />);

    expect(useStagedCandidatesMock).toHaveBeenCalledWith("scratch-1");
    expect(screen.getByRole("heading", { level: 3, name: "2 Nodes" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "3 Bits" })).toBeInTheDocument();
    expect(screen.getByTestId("triage-staging-columns")).toHaveAttribute(
      "data-layout-ratio",
      "35/65",
    );
  });

  it("keeps bare subsection headings at zero or one authoritative candidate", () => {
    useStagedCandidatesMock.mockReturnValue({
      counts: { nodes: 1, bits: 0 },
    });

    render(<TriageWorkspace node={createNode()} />);

    expect(screen.getByRole("heading", { level: 3, name: "Nodes" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Bits" })).toBeInTheDocument();
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

  it("applies neutral hover styling while the staged remove target is hovered", () => {
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
    ).toHaveClass("bg-muted", "border-solid");
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

  it("projects only the successful coordinator result identity into Explorer", async () => {
    const target = {
      ...createNode({ id: "parent-1", title: "Parent" }),
      systemRole: null,
    };
    useGridDataMock.mockImplementation((parentId) => ({
      nodes: parentId === null ? [target] : [],
      bits: [],
      isLoading: false,
    }));
    useTriageDndMock.mockReturnValue(
      createDndState({
        pendingPlacement: createDirectPendingPlacement(),
      }),
    );

    render(<TriageWorkspace node={createNode()} />);

    fireEvent.click(await screen.findByRole("button", { name: "Node" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() =>
      expect(useExplorerRemoteStatusMock).toHaveBeenCalledWith(
        expect.objectContaining({
          localPlacementResult: expect.objectContaining({ type: "node" }),
        }),
      ),
    );
    expect(placeDirectBreakdownMock).toHaveBeenCalledOnce();
  });

  it("closes the actual placement owner when Explorer validation invalidates its target", async () => {
    const target = {
      ...createNode({ id: "parent-1", title: "Parent" }),
      systemRole: null,
    };
    let rootNodes = [target];
    useGridDataMock.mockImplementation((parentId) => ({
      nodes: parentId === null ? rootNodes : [],
      bits: [],
      isLoading: false,
    }));
    useTriageDndMock.mockReturnValue(
      createDndState({
        pendingPlacement: createDirectPendingPlacement(),
      }),
    );

    const view = render(<TriageWorkspace node={createNode()} />);
    expect(await screen.findByRole("region", { name: "Placement" })).toBeInTheDocument();

    rootNodes = [];
    view.rerender(<TriageWorkspace node={createNode()} />);

    await vi.waitFor(() => {
      expect(screen.queryByRole("region", { name: "Placement" })).not.toBeInTheDocument();
    });
    expect(
      within(screen.getByRole("button", { name: "Dismiss Staging alert" }).parentElement!)
        .getByText("Placement closed because “Project” changed elsewhere."),
    ).toBeInTheDocument();
  });

  it("retains focus on the nearest valid ancestor after the stale placement dialog closes", async () => {
    const ancestor = {
      ...createNode({ id: "ancestor", title: "Ancestor" }),
      systemRole: null,
    };
    const target = {
      ...createNode({
        id: "parent-1",
        parentId: ancestor.id,
        level: 1,
        title: "Target",
      }),
      systemRole: null,
    };
    const sibling = {
      ...createNode({
        id: "sibling",
        parentId: ancestor.id,
        level: 1,
        title: "Sibling",
      }),
      systemRole: null,
    };
    let childNodes = [target, sibling];
    let pendingPlacement: PendingPlacement = createDirectPendingPlacement({
      dropId: "triage-hierarchy:parent-1",
      targetParentPath: [ancestor.title],
    });
    const cancelPlacement = vi.fn(() => {
      pendingPlacement = null;
      handlePlacementCancelMock();
    });
    useGridDataMock.mockImplementation((parentId) => ({
      nodes:
        parentId === null
          ? [ancestor]
          : parentId === ancestor.id
            ? childNodes
            : [],
      bits: [],
      isLoading: false,
    }));
    useTriageDndMock.mockImplementation(() =>
      createDndState({
        handlePlacementCancel: cancelPlacement,
        pendingPlacement,
      }),
    );
    useTriageStore.setState({
      explorerPathIds: [ancestor.id],
      explorerOpenColumnIds: ["home", ancestor.id],
    });

    const view = render(<TriageWorkspace node={createNode()} />);
    expect(await screen.findByRole("region", { name: "Placement" })).toBeInTheDocument();

    childNodes = [sibling];
    view.rerender(<TriageWorkspace node={createNode()} />);

    await waitFor(() =>
      expect(screen.queryByRole("region", { name: "Placement" })).not.toBeInTheDocument(),
    );
    expect(handlePlacementCancelMock).not.toHaveBeenCalled();
    expect(handlePlacementConfirmMock).not.toHaveBeenCalled();
    expect(useTriageStore.getState().explorerPathIds).toEqual([ancestor.id]);
    expect(
      screen.getByRole("button", { name: `Select Node: ${sibling.title}` }),
    ).not.toHaveAttribute("aria-current");
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: `Select Node: ${ancestor.title}` }),
      ).toHaveFocus(),
    );
  });

  it("retains focus on the destination full-label heading when no ancestor row survives", async () => {
    const target = {
      ...createNode({ id: "parent-1", title: "Target" }),
      systemRole: null,
    };
    const sibling = {
      ...createNode({ id: "sibling", title: "Sibling" }),
      systemRole: null,
    };
    let rootNodes = [target, sibling];
    let pendingPlacement: PendingPlacement = createDirectPendingPlacement({
      targetParentPath: [],
    });
    const cancelPlacement = vi.fn(() => {
      pendingPlacement = null;
      handlePlacementCancelMock();
    });
    useGridDataMock.mockImplementation((parentId) => ({
      nodes: parentId === null ? rootNodes : [],
      bits: [],
      isLoading: false,
    }));
    useTriageDndMock.mockImplementation(() =>
      createDndState({
        handlePlacementCancel: cancelPlacement,
        pendingPlacement,
      }),
    );
    useTriageStore.setState({
      explorerPathIds: [],
      explorerOpenColumnIds: ["home"],
    });

    const view = render(<TriageWorkspace node={createNode()} />);
    expect(await screen.findByRole("region", { name: "Placement" })).toBeInTheDocument();

    rootNodes = [sibling];
    view.rerender(<TriageWorkspace node={createNode()} />);

    await waitFor(() =>
      expect(screen.queryByRole("region", { name: "Placement" })).not.toBeInTheDocument(),
    );
    expect(handlePlacementCancelMock).not.toHaveBeenCalled();
    expect(handlePlacementConfirmMock).not.toHaveBeenCalled();
    expect(useTriageStore.getState().explorerPathIds).toEqual([]);
    expect(
      screen.getByRole("button", { name: `Select Node: ${sibling.title}` }),
    ).not.toHaveAttribute("aria-current");
    await waitFor(() =>
      expect(screen.getByTestId("hierarchy-column-heading-home")).toHaveFocus(),
    );
  });

  it("requires a distinct direct type step before target-column confirmation and dispatches once", async () => {
    const target = {
      ...createNode({ id: "parent-1", title: "Parent" }),
      systemRole: null,
    };
    useGridDataMock.mockImplementation((parentId) => ({
      nodes: parentId === null ? [target] : [],
      bits: [],
      isLoading: false,
    }));
    useTriageDndMock.mockReturnValue(
      createDndState({
        pendingPlacement: createDirectPendingPlacement(),
      }),
    );

    render(<TriageWorkspace node={createNode()} />);

    expect(await screen.findByText("Choose a result type")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirm" })).not.toBeInTheDocument();
    const nodeOption = screen.getByRole("button", { name: "Node" });

    fireEvent.click(nodeOption);

    expect(screen.getByText("Confirm placement")).toBeInTheDocument();
    const confirmButton = screen.getByRole("button", { name: "Confirm" });

    fireEvent.click(confirmButton);

    await waitFor(() => expect(placeDirectBreakdownMock).toHaveBeenCalledOnce());
    expect(placeDirectBreakdownMock).toHaveBeenCalledWith(
      expect.objectContaining({ resultType: "node", targetParentId: "parent-1" }),
    );
    expect(handlePlacementConfirmMock).not.toHaveBeenCalled();
  });

  it("returns pre-dispatch Cancel to the exact direct source without any write", async () => {
    const target = {
      ...createNode({ id: "parent-1", title: "Parent" }),
      systemRole: null,
    };
    useGridDataMock.mockImplementation((parentId) => ({
      nodes: parentId === null ? [target] : [],
      bits: [],
      isLoading: false,
    }));
    useTriageDndMock.mockReturnValue(
      createDndState({ pendingPlacement: createDirectPendingPlacement() }),
    );

    render(<TriageWorkspace node={createNode()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(screen.queryByRole("region", { name: "Placement" })).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Drag breakdown" })).toHaveFocus(),
    );
    expect(placeDirectBreakdownMock).not.toHaveBeenCalled();
    expect(placeStagedCandidateMock).not.toHaveBeenCalled();
  });

  it("shows disabled direct type choices for invalid target types", async () => {
    useTriageDndMock.mockReturnValue(
      createDndState({
        pendingPlacement: createDirectPendingPlacement({
          dropId: "triage-hierarchy:body-home",
          parentNodeId: null,
          targetNodeLevel: null,
          targetTitle: "Home",
          targetParentPath: [],
        }),
      }),
    );

    render(<TriageWorkspace node={createNode()} />);

    const nodeOption = await screen.findByRole("button", { name: "Node" });
    const bitOption = screen.getByRole("button", { name: "Bit" });

    expect(nodeOption).toBeEnabled();
    expect(bitOption).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Confirm" })).not.toBeInTheDocument();
  });

  it("rejects a competing release while the first direct placement remains open", async () => {
    const firstTarget = {
      ...createNode({ id: "parent-1", title: "Parent" }),
      systemRole: null,
    };
    const secondTarget = {
      ...createNode({ id: "parent-2", title: "Next Parent" }),
      systemRole: null,
    };
    useGridDataMock.mockImplementation((parentId) => ({
      nodes: parentId === null ? [firstTarget, secondTarget] : [],
      bits: [],
      isLoading: false,
    }));
    let pendingPlacement = createDirectPendingPlacement({
      dropId: "triage-hierarchy:parent-1",
    });
    useTriageDndMock.mockImplementation(() =>
      createDndState({ pendingPlacement }),
    );

    const { rerender } = render(<TriageWorkspace node={createNode()} />);

    fireEvent.click(await screen.findByRole("button", { name: "Node" }));
    expect(screen.getByText("Project")).toBeInTheDocument();

    pendingPlacement = createDirectPendingPlacement({
      candidateId: "breakdown-2",
      candidateLabel: "Next Project",
      sourceBreakdownId: "breakdown-2",
      dropId: "triage-hierarchy:parent-2",
    });
    rerender(<TriageWorkspace node={createNode()} />);

    expect(screen.getByText("Project")).toBeInTheDocument();
    expect(screen.queryByText("Next Project")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("shows isFull warning with muted styling, not destructive, when target is full", async () => {
    useTriageDndMock.mockReturnValue(
      createDndState({
        pendingPlacement: createDirectPendingPlacement({ isFull: true, cell: null }),
      }),
    );
    const target = {
      ...createNode({ id: "parent-1", title: "Parent" }),
      systemRole: null,
    };
    useGridDataMock.mockImplementation((parentId) => ({
      nodes: parentId === null ? [target] : [],
      bits: [],
      isLoading: false,
    }));

    render(<TriageWorkspace node={createNode()} />);

    fireEvent.click(await screen.findByRole("button", { name: "Node" }));
    const warning = screen.getByText("No available grid cell in this target");
    expect(warning).toBeInTheDocument();
    expect(warning).not.toHaveClass("text-destructive");
    expect(warning).toHaveClass("text-muted-foreground");
    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();
  });
});
