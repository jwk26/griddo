import "@testing-library/jest-dom/vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTriageStore } from "@/stores/triage-store";
import type { PendingPlacement, TriageDragItem } from "@/hooks/use-dnd";
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

const useTriageDndMock = vi.hoisted(() => vi.fn());
const useStagedCandidatesMock = vi.hoisted(() => vi.fn());
const handlePlacementConfirmMock = vi.hoisted(() => vi.fn());
const handlePlacementCancelMock = vi.hoisted(() => vi.fn());
const useGridDataMock = vi.hoisted(() => vi.fn());
const useInboxMock = vi.hoisted(() => vi.fn());
const getBitMock = vi.hoisted(() => vi.fn());
const getBitsMock = vi.hoisted(() => vi.fn());
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

vi.mock("@/hooks/use-inbox", () => ({
  useInbox: useInboxMock,
}));

vi.mock("@/lib/db/datastore", () => ({
  getDataStore: vi.fn().mockResolvedValue({
    getBit: getBitMock,
    getBits: getBitsMock,
  }),
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
    BreakdownPanel: () => {
      titleBlockerHandleState.handle = useScratchTitleBlockerContext();
      departureControllerState.controller = useTriageDepartureContext();
      const selectedScratchId = useTriageStore((state) => state.selectedScratchId);
      return (
        <div data-testid="breakdown-panel">
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
    version: overrides.version ?? 1,
    pastDeadlineDismissed: overrides.pastDeadlineDismissed ?? false,
  };
}

type DndState = {
  sensors: unknown[];
  activeDragItem: TriageDragItem;
  overTargetId: string | null;
  pendingPlacement: PendingPlacement;
  handleDragStart: ReturnType<typeof vi.fn>;
  handleDragEnd: ReturnType<typeof vi.fn>;
  handleDragOver: ReturnType<typeof vi.fn>;
  handlePlacementConfirm: ReturnType<typeof vi.fn>;
  handlePlacementCancel: ReturnType<typeof vi.fn>;
};

function createDndState(overrides: Partial<DndState> = {}): DndState {
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
  overrides: Partial<NonNullable<PendingPlacement>> = {},
): NonNullable<PendingPlacement> {
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
  titleBlockerHandleState.handle = null;
  departureControllerState.controller = null;
  handlePlacementConfirmMock.mockReset();
  handlePlacementConfirmMock.mockResolvedValue(undefined);
  handlePlacementCancelMock.mockReset();
  useGridDataMock.mockReset();
  useGridDataMock.mockReturnValue({ nodes: [], bits: [], isLoading: false });
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
    counts: { nodes: 0, bits: 0 },
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("TriageWorkspace", () => {
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
    expect(handlePlacementCancelMock).not.toHaveBeenCalled();

    rootNodes = [];
    view.rerender(<TriageWorkspace node={createNode()} />);

    await vi.waitFor(() => {
      expect(handlePlacementCancelMock).toHaveBeenCalledOnce();
    });
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

  it("shows isFull warning with muted styling, not destructive, when target is full", () => {
    useTriageDndMock.mockReturnValue(
      createDndState({
        pendingPlacement: createDirectPendingPlacement({ isFull: true }),
      }),
    );

    render(<TriageWorkspace node={createNode()} />);

    const warning = screen.getByText("No available grid cell in this target");
    expect(warning).toBeInTheDocument();
    expect(warning).not.toHaveClass("text-destructive");
    expect(warning).toHaveClass("text-muted-foreground");
  });
});
