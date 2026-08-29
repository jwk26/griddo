import "@testing-library/jest-dom/vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  TriageDragItem,
  TriageTargetFeedback,
} from "@/hooks/use-dnd";
import type { TriagePlacementSnapshot } from "@/hooks/use-triage-placement";
import type { TriageNewlyPlacedProvenance } from "@/hooks/use-triage-newly-placed";
import {
  TriageOperationLockContext,
  type TriageOperationLock,
} from "@/hooks/use-triage-operation-lock";
import {
  createScratchTitleBlockerHandle,
  ScratchTitleBlockerContext,
} from "@/hooks/use-scratch-breakdowns";
import { getTriageHierarchyDropId } from "@/lib/grid-dnd";
import { useTriageStore } from "@/stores/triage-store";
import type { Bit, Node } from "@/types";
import type { GridExplorerSearchResult } from "@/lib/utils/grid-explorer-search";
import { HierarchyExplorer } from "./hierarchy-explorer";

const globalsCss = readFileSync(
  join(process.cwd(), "src/app/globals.css"),
  "utf8",
);

const useExplorerRemoteStatusMock = vi.hoisted(() => vi.fn());
const undoRepository = vi.hoisted(() => ({
  reconcileDirectPlacementUndo: vi.fn(),
  reconcileStagedPlacementUndo: vi.fn(),
  undoDirectPlacement: vi.fn(),
  undoStagedPlacement: vi.fn(),
}));

vi.mock("@/lib/db/datastore", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/db/datastore")>()),
  getDataStore: vi.fn(async () => undoRepository),
}));

vi.mock("dexie", async (importOriginal) => ({
  ...(await importOriginal<typeof import("dexie")>()),
  liveQuery: (query: () => Promise<unknown>) => ({
    subscribe: ({ next, error }: {
      next: (value: unknown) => void;
      error?: (reason: unknown) => void;
    }) => {
      let active = true;
      void query().then(
        (value) => {
          if (active) next(value);
        },
        (reason) => {
          if (active) error?.(reason);
        },
      );
      return { unsubscribe: () => { active = false; } };
    },
  }),
}));
const explorerSearchState = vi.hoisted(() => ({
  mode: "closed" as "closed" | "active" | "interrupted",
  activeQuery: null as string | null,
  interruptedQuery: null as string | null,
  results: [] as GridExplorerSearchResult[],
  status: "idle" as "idle" | "loading" | "refreshing" | "ready" | "error",
  isLoading: false,
  isRefreshing: false,
  error: null as string | null,
  resultScrollTop: 0,
  focusTarget: { kind: "input" } as
    | { kind: "input" }
    | { kind: "result"; resultKey: GridExplorerSearchResult["key"] },
  feedback: null as "stale-selection" | null,
  revealPresentation: null as
    | null
    | { kind: "revealed"; result: GridExplorerSearchResult }
    | { kind: "selection-cleared"; id: string; title: string; nodePathIds: readonly string[] },
  openSearch: vi.fn(),
  setQuery: vi.fn(),
  interruptForDnd: vi.fn(),
  closeSearch: vi.fn(),
  retry: vi.fn(),
  setResultScrollTop: vi.fn(),
  focusInput: vi.fn(),
  focusResult: vi.fn(),
  selectResult: vi.fn(),
  invalidatePendingSelection: vi.fn(),
  clearReveal: vi.fn(),
}));

vi.mock("@dnd-kit/core", () => ({
  useDroppable: vi.fn().mockReturnValue({ setNodeRef: vi.fn() }),
}));

vi.mock("@/hooks/use-grid-data", () => ({
  useGridData: vi.fn(),
}));

vi.mock("@/hooks/use-explorer-remote-status", () => ({
  useExplorerRemoteStatus: useExplorerRemoteStatusMock,
}));

vi.mock("@/hooks/use-grid-explorer-search", () => ({
  useGridExplorerSearch: () => explorerSearchState,
}));

const departureState = vi.hoisted(() => ({
  destination: null as null | {
    id: string;
    focus?: () => void;
    kind: "path";
    perform: () => void;
  },
  requestDeparture: vi.fn(),
}));

vi.mock("@/hooks/use-triage-departure", () => ({
  useTriageDepartureContext: () => ({
    requestDeparture: departureState.requestDeparture,
  }),
}));

type GridSnapshot = { nodes: Node[]; bits: Bit[]; isLoading: boolean };

const EMPTY_GRID: GridSnapshot = { nodes: [], bits: [], isLoading: false };
let gridByParent = new Map<string | null, GridSnapshot>();

function createNode(overrides: Partial<Node> = {}): Node {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Node",
    color: overrides.color ?? "hsl(221, 83%, 53%)",
    icon: overrides.icon ?? "Folder",
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
    systemRole: overrides.systemRole ?? null,
    hiddenFromGrid: overrides.hiddenFromGrid ?? false,
    version: overrides.version ?? 1,
    pastDeadlineDismissed: overrides.pastDeadlineDismissed ?? false,
  };
}

function createBit(overrides: Partial<Bit> = {}): Bit {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Bit",
    description: overrides.description ?? "",
    icon: overrides.icon ?? "Box",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    priority: overrides.priority ?? null,
    status: overrides.status ?? "active",
    mtime: overrides.mtime ?? 1,
    createdAt: overrides.createdAt ?? 1,
    parentId: overrides.parentId ?? "node-1",
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
    archivedAt: overrides.archivedAt ?? null,
    version: overrides.version ?? 1,
    pastDeadlineDismissed: overrides.pastDeadlineDismissed ?? false,
  };
}

function setGrid(parentId: string | null, nodes: Node[], bits: Bit[] = []) {
  gridByParent.set(parentId, { nodes, bits, isLoading: false });
}

function newlyPlacedEntry(
  result: Node | Bit,
  resultType: "node" | "bit",
  completedOrder: number,
): TriageNewlyPlacedProvenance {
  return {
    operationId: `operation-${completedOrder}`,
    resultId: result.id,
    resultType,
    resultVersion: result.version,
    resultSnapshot: { ...result },
    source: {
      scratchBitId: "scratch-1",
      breakdownId: `source-${completedOrder}`,
      expectedVersion: completedOrder,
      snapshot: {
        id: `source-${completedOrder}`,
        scratchBitId: "scratch-1",
        content: `Source ${completedOrder}`,
        order: completedOrder,
        createdAt: completedOrder,
        consumedAt: null,
        version: completedOrder,
      },
    },
    candidate: null,
    destination: {
      parentId: result.parentId,
      pathIds: result.parentId === null ? [] : [result.parentId],
      x: result.x,
      y: result.y,
    },
    completedOrder,
  };
}

function searchResult(
  key: GridExplorerSearchResult["key"],
  overrides: Partial<GridExplorerSearchResult> = {},
): GridExplorerSearchResult {
  const [type, id] = key.split(":") as ["node" | "bit", string];
  return {
    key,
    id,
    type,
    title: type === "node" ? "Projects" : "Project note",
    icon: type === "node" ? "Folder" : "ListTodo",
    color: type === "node" ? "hsl(221, 83%, 53%)" : null,
    breadcrumb: "Home",
    ancestorIds: [],
    nodePathIds: type === "node" ? [id] : [],
    hierarchyOrder: 0,
    relevance: "title-prefix",
    rank: 1,
    duplicate: null,
    ...overrides,
  };
}

function explorerSearchResultRow(): HTMLButtonElement {
  const row = document.querySelector<HTMLButtonElement>(
    '[data-triage-role="explorer-search-result"]',
  );
  if (row === null) throw new Error("Explorer search result row not rendered");
  return row;
}

const defaultProps: {
  activeDragItem: TriageDragItem;
  onPendingPlacementInvalidated: (
    dropId: string,
    focusAfterClose: () => void,
  ) => void;
  onPointerGeometryChange: (point: { x: number; y: number }) => void;
  overTargetId: string | null;
  pendingPlacementDropId: string | null;
  localPlacementResult: null;
  targetFeedback: TriageTargetFeedback;
} = {
  activeDragItem: null,
  onPendingPlacementInvalidated: vi.fn(),
  onPointerGeometryChange: vi.fn(),
  overTargetId: null,
  pendingPlacementDropId: null,
  localPlacementResult: null,
  targetFeedback: null,
};

function placementSnapshot(
  overrides: Partial<TriagePlacementSnapshot> = {},
): TriagePlacementSnapshot {
  return {
    release: {
      kind: "direct",
      scratchBitId: "scratch-1",
      source: { id: "source-1", title: "Project", version: 2 },
      target: {
        dropId: getTriageHierarchyDropId("target-1"),
        parentId: "target-1",
        level: 0,
        title: "Target",
        path: ["Home", "Target"],
        expectedAncestorIds: ["target-1"],
        cell: { x: 0, y: 0 },
        isFull: false,
      },
    },
    phase: "direct-selection",
    resultType: null,
    operationId: "operation-1",
    resultId: "result-1",
    command: null,
    terminalStatus: null,
    terminalKind: null,
    resultTitleDraft: null,
    ...overrides,
  };
}

function seedDeepGrid() {
  const home = createNode({ id: "home-a", title: "Personal Projects", level: 0 });
  const level1 = createNode({
    id: "level-1-a",
    parentId: home.id,
    title: "Long Running Research",
    level: 1,
  });
  const level2 = createNode({
    id: "level-2-a",
    parentId: level1.id,
    title: "Quarterly Evidence Review",
    level: 2,
  });
  const level3 = createNode({
    id: "level-3-a",
    parentId: level2.id,
    title: "Final Source Notes",
    level: 3,
  });

  setGrid(null, [home]);
  setGrid(home.id, [level1]);
  setGrid(level1.id, [level2]);
  setGrid(level2.id, [level3]);
  return { home, level1, level2, level3 };
}

beforeEach(async () => {
  gridByParent = new Map();
  useTriageStore.setState({
    selectedScratchId: null,
    explorerPathIds: [],
    explorerOpenColumnIds: [],
    explorerColumnScroll: {},
  });
  const { useGridData } = await import("@/hooks/use-grid-data");
  vi.mocked(useGridData).mockImplementation(
    (parentId) => gridByParent.get(parentId) ?? EMPTY_GRID,
  );
  useExplorerRemoteStatusMock.mockReset();
  useExplorerRemoteStatusMock.mockImplementation(({ pathIds }) => {
    const validPathIds: string[] = [];
    let parentId: string | null = null;
    for (const id of pathIds as string[]) {
      const match = (gridByParent.get(parentId)?.nodes ?? []).find(
        (node) => node.id === id,
      );
      if (match === undefined) break;
      validPathIds.push(id);
      parentId = id;
    }
    return { isReady: true, validPathIds };
  });
  const { useDroppable } = await import("@dnd-kit/core");
  vi.mocked(useDroppable).mockClear();
  departureState.destination = null;
  departureState.requestDeparture.mockReset();
  departureState.requestDeparture.mockImplementation((destination) => {
    departureState.destination = destination;
    destination.perform();
    destination.focus?.();
    return "performed";
  });
  for (const mock of Object.values(undoRepository)) mock.mockReset();
  const inspectUndo = vi.fn(async (command) => ({
    operationId: command.operationId,
    status: "not_applied" as const,
    result: command.resultSnapshot,
    source: command.sourceSnapshot,
    candidate: null,
  }));
  undoRepository.reconcileDirectPlacementUndo.mockImplementation(inspectUndo);
  undoRepository.reconcileStagedPlacementUndo.mockImplementation(inspectUndo);
  Object.assign(explorerSearchState, {
    mode: "closed",
    activeQuery: null,
    interruptedQuery: null,
    results: [],
    status: "idle",
    isLoading: false,
    isRefreshing: false,
    error: null,
    resultScrollTop: 0,
    focusTarget: { kind: "input" },
    feedback: null,
    revealPresentation: null,
  });
  for (const callback of [
    explorerSearchState.openSearch,
    explorerSearchState.setQuery,
    explorerSearchState.interruptForDnd,
    explorerSearchState.closeSearch,
    explorerSearchState.retry,
    explorerSearchState.setResultScrollTop,
    explorerSearchState.focusInput,
    explorerSearchState.focusResult,
    explorerSearchState.selectResult,
    explorerSearchState.invalidatePendingSelection,
    explorerSearchState.clearReveal,
  ]) {
    callback.mockReset();
  }
  explorerSearchState.openSearch.mockImplementation(() => {
    explorerSearchState.mode = "active";
    explorerSearchState.activeQuery = explorerSearchState.interruptedQuery ?? "";
    explorerSearchState.interruptedQuery = null;
    explorerSearchState.revealPresentation = null;
  });
  explorerSearchState.closeSearch.mockImplementation(() => {
    explorerSearchState.mode = "closed";
    explorerSearchState.activeQuery = null;
    explorerSearchState.interruptedQuery = null;
    explorerSearchState.results = [];
    explorerSearchState.resultScrollTop = 0;
    explorerSearchState.feedback = null;
    explorerSearchState.revealPresentation = null;
  });
  explorerSearchState.interruptForDnd.mockImplementation(() => {
    if (explorerSearchState.mode !== "active") return;
    explorerSearchState.mode = "interrupted";
    explorerSearchState.interruptedQuery = explorerSearchState.activeQuery;
    explorerSearchState.activeQuery = null;
    explorerSearchState.revealPresentation = null;
  });
  explorerSearchState.clearReveal.mockImplementation(() => {
    explorerSearchState.revealPresentation = null;
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("HierarchyExplorer Task 134 base", () => {
  it("renders distinct valid, invalid, and full target feedback", () => {
    const { home } = seedDeepGrid();
    const activeDragItem: TriageDragItem = {
      kind: "triage-staged-node",
      id: "candidate-1",
      label: "Project",
    };
    const dropId = getTriageHierarchyDropId(home.id);
    const view = render(
      <HierarchyExplorer
        {...defaultProps}
        activeDragItem={activeDragItem}
        targetFeedback={{ dropId, state: "valid" }}
      />,
    );
    const target = screen.getByRole("button", {
      name: `Select Node: ${home.title}`,
    });
    expect(target).toHaveAttribute("data-triage-target-state", "valid");

    view.rerender(
      <HierarchyExplorer
        {...defaultProps}
        activeDragItem={activeDragItem}
        targetFeedback={{ dropId, state: "full" }}
      />,
    );
    expect(target).toHaveAttribute("data-triage-target-state", "full");

    view.rerender(
      <HierarchyExplorer
        {...defaultProps}
        activeDragItem={{ ...activeDragItem, kind: "triage-staged-bit" }}
        targetFeedback={{
          dropId: getTriageHierarchyDropId("body-home"),
          state: "invalid",
        }}
      />,
    );
    expect(screen.getByTestId("hierarchy-section-body-home")).toHaveAttribute(
      "data-triage-target-state",
      "invalid",
    );
  });

  it("progressively scrolls only the valid pointer-under Explorer column and stops for full feedback", () => {
    let frame: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frame = callback;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    const { home } = seedDeepGrid();
    const dropId = getTriageHierarchyDropId(home.id);
    const activeDragItem: TriageDragItem = {
      kind: "triage-staged-node",
      id: "candidate-1",
      label: "Project",
    };
    const view = render(
      <HierarchyExplorer
        {...defaultProps}
        activeDragItem={activeDragItem}
        targetFeedback={{ dropId, state: "valid" }}
      />,
    );
    const body = screen.getByTestId("hierarchy-section-body-home");
    const target = screen.getByRole("button", {
      name: `Select Node: ${home.title}`,
    });
    Object.defineProperties(body, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 600 },
    });
    vi.spyOn(body, "getBoundingClientRect").mockReturnValue({
      top: 100,
      bottom: 300,
      left: 0,
      right: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 100,
      toJSON() {},
    });
    Object.defineProperty(document, "elementsFromPoint", {
      configurable: true,
      value: vi.fn(() => [target, body]),
    });

    fireEvent.mouseMove(document, { clientX: 100, clientY: 294 });
    act(() => frame?.(0));
    expect(body.scrollTop).toBeGreaterThan(0);
    const afterValidFrame = body.scrollTop;

    view.rerender(
      <HierarchyExplorer
        {...defaultProps}
        activeDragItem={activeDragItem}
        targetFeedback={{ dropId, state: "full" }}
      />,
    );
    act(() => frame?.(16));
    expect(body.scrollTop).toBe(afterValidFrame);
  });

  it("reclassifies pointer-under geometry on every stationary edge-scroll frame", () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    const first = createNode({ id: "first", title: "First" });
    const second = createNode({ id: "second", title: "Second" });
    setGrid(null, [first, second]);
    const activeDragItem: TriageDragItem = {
      kind: "triage-staged-node",
      id: "candidate-1",
      label: "Project",
    };
    const onPointerGeometryChange = vi.fn();
    const props = {
      ...defaultProps,
      activeDragItem,
      onPointerGeometryChange,
      targetFeedback: {
        dropId: getTriageHierarchyDropId(first.id),
        state: "valid" as const,
      },
    };
    const view = render(
      <HierarchyExplorer {...(props as typeof defaultProps)} />,
    );
    const body = screen.getByTestId("hierarchy-section-body-home");
    const firstTarget = screen.getByRole("button", {
      name: `Select Node: ${first.title}`,
    });
    const secondTarget = screen.getByRole("button", {
      name: `Select Node: ${second.title}`,
    });
    Object.defineProperties(body, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 600 },
    });
    vi.spyOn(body, "getBoundingClientRect").mockReturnValue({
      top: 100,
      bottom: 300,
      left: 0,
      right: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 100,
      toJSON() {},
    });
    let pointerTarget: Element = firstTarget;
    Object.defineProperty(document, "elementsFromPoint", {
      configurable: true,
      value: vi.fn(() => [pointerTarget, body]),
    });

    fireEvent.mouseMove(document, { clientX: 100, clientY: 294 });
    act(() => frames.shift()?.(0));
    expect(onPointerGeometryChange).toHaveBeenLastCalledWith({
      x: 100,
      y: 294,
    });
    const firstFrameScroll = body.scrollTop;

    pointerTarget = secondTarget;
    view.rerender(
      <HierarchyExplorer
        {...(props as typeof defaultProps)}
        targetFeedback={{
          dropId: getTriageHierarchyDropId(second.id),
          state: "valid",
        }}
      />,
    );
    act(() => frames.shift()?.(16));

    expect(onPointerGeometryChange).toHaveBeenCalledTimes(2);
    expect(body.scrollTop).toBeGreaterThan(firstFrameScroll);
  });

  it("captures one complete Explorer path change before either path mutation", () => {
    const { home } = seedDeepGrid();
    departureState.requestDeparture.mockImplementation((destination) => {
      departureState.destination = destination;
      return "decision-required";
    });
    render(<HierarchyExplorer {...defaultProps} />);

    const destinationButton = screen.getByRole("button", {
      name: `Select Node: ${home.title}`,
    });
    const beforePath = useTriageStore.getState().explorerPathIds;
    const beforeOpenColumns = useTriageStore.getState().explorerOpenColumnIds;
    destinationButton.focus();
    fireEvent.click(destinationButton);

    expect(useTriageStore.getState()).toMatchObject({
      explorerPathIds: beforePath,
      explorerOpenColumnIds: beforeOpenColumns,
    });
    expect(departureState.destination).toMatchObject({
      id: home.id,
      kind: "path",
    });

    departureState.destination?.perform();
    expect(useTriageStore.getState()).toMatchObject({
      explorerPathIds: [home.id],
      explorerOpenColumnIds: ["home", home.id],
    });

    screen.getByRole("button", { name: "Home" }).focus();
    departureState.destination?.focus?.();
    expect(destinationButton).toHaveFocus();
  });

  it("does not request departure for the current Explorer path", () => {
    const { home } = seedDeepGrid();
    useTriageStore.setState({
      explorerOpenColumnIds: ["home", home.id],
      explorerPathIds: [home.id],
    });
    render(<HierarchyExplorer {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", { name: `Select Node: ${home.title}` }),
    );

    expect(departureState.requestDeparture).not.toHaveBeenCalled();
    expect(useTriageStore.getState().explorerPathIds).toEqual([home.id]);
  });

  it("renders full column and path labels with no abbreviated or dedicated search body", async () => {
    const { home, level1 } = seedDeepGrid();
    render(<HierarchyExplorer {...defaultProps} />);

    expect(
      screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(["Home", "Level 1", "Level 2", "Level 3"]);
    expect(screen.queryByText(/^L[123]$/)).not.toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: `Select Node: ${home.title}` }));
    fireEvent.click(screen.getByRole("button", { name: `Select Node: ${level1.title}` }));

    const path = screen.getByRole("navigation", { name: "Explorer path" });
    expect(within(path).getByText("Home")).toBeInTheDocument();
    expect(within(path).getByText(home.title)).toBeInTheDocument();
    expect(within(path).getByText(level1.title)).toBeInTheDocument();

    const { useDroppable } = await import("@dnd-kit/core");
    const level2BodyCalls = vi
      .mocked(useDroppable)
      .mock.calls.filter(
        ([options]) =>
          options.id === getTriageHierarchyDropId("body-l2"),
      );
    expect(level2BodyCalls.at(-1)?.[0].data).toMatchObject({
      targetParentPath: ["Home", home.title],
      targetTitle: level1.title,
    });
  });

  it("keeps the shared Explorer context across Scratch switches", () => {
    const { home, level1 } = seedDeepGrid();
    render(<HierarchyExplorer {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: `Select Node: ${home.title}` }));
    fireEvent.click(screen.getByRole("button", { name: `Select Node: ${level1.title}` }));
    useTriageStore.getState().selectScratch("scratch-other");

    expect(useTriageStore.getState()).toMatchObject({
      explorerPathIds: [home.id, level1.id],
      explorerOpenColumnIds: ["home", home.id, level1.id],
    });
    expect(screen.getByText("Quarterly Evidence Review")).toBeInTheDocument();
  });

  it("validates and restores a deep path on same-session re-entry", async () => {
    const { home, level1, level2 } = seedDeepGrid();
    useTriageStore.setState({
      explorerPathIds: [home.id, level1.id, level2.id],
      explorerOpenColumnIds: ["home", home.id, level1.id, level2.id],
    });

    const first = render(<HierarchyExplorer {...defaultProps} />);
    expect(await screen.findByText("Final Source Notes")).toBeInTheDocument();
    first.unmount();

    render(<HierarchyExplorer {...defaultProps} />);
    expect(await screen.findByText("Final Source Notes")).toBeInTheDocument();
    expect(useTriageStore.getState().explorerPathIds).toEqual([
      home.id,
      level1.id,
      level2.id,
    ]);
  });

  it("does not discard a saved child-column anchor while re-entry data is loading", async () => {
    const home = createNode({ id: "home-a", title: "Personal Projects" });
    const child = createNode({
      id: "level-1-a",
      parentId: home.id,
      title: "Long Running Research",
      level: 1,
    });
    setGrid(null, [home]);
    gridByParent.set(home.id, { nodes: [], bits: [], isLoading: true });
    useTriageStore.setState({
      explorerPathIds: [home.id],
      explorerOpenColumnIds: ["home", home.id],
      explorerColumnScroll: {
        [home.id]: { anchorId: child.id, offset: -7 },
      },
    });

    const view = render(<HierarchyExplorer {...defaultProps} />);
    expect(useTriageStore.getState().explorerColumnScroll[home.id]).toEqual({
      anchorId: child.id,
      offset: -7,
    });

    setGrid(home.id, [child]);
    view.rerender(<HierarchyExplorer {...defaultProps} />);

    await waitFor(() => {
      expect(useTriageStore.getState().explorerColumnScroll[home.id]).toEqual({
        anchorId: child.id,
        offset: -7,
      });
    });
  });

  it("restores a column by first visible stable ID and offset after a remote insertion", async () => {
    const remote = createNode({ id: "remote", title: "Remote New" });
    const first = createNode({ id: "first", title: "First" });
    const anchor = createNode({ id: "anchor", title: "Anchor" });
    setGrid(null, [first, anchor]);

    let afterInsertion = false;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function (this: HTMLElement) {
        if (this.dataset.testid === "hierarchy-section-body-home") {
          return { top: 100, bottom: 300, left: 0, right: 200, width: 200, height: 200, x: 0, y: 100, toJSON() {} };
        }
        if (this.dataset.explorerItemId === "first") {
          return { top: 60, bottom: 90, left: 0, right: 200, width: 200, height: 30, x: 0, y: 60, toJSON() {} };
        }
        if (this.dataset.explorerItemId === "anchor") {
          const top = afterInsertion ? 130 : 91;
          return { top, bottom: top + 30, left: 0, right: 200, width: 200, height: 30, x: 0, y: top, toJSON() {} };
        }
        return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {} };
      },
    );

    const view = render(<HierarchyExplorer {...defaultProps} />);
    const body = screen.getByTestId("hierarchy-section-body-home");
    fireEvent.scroll(body);
    expect(useTriageStore.getState().explorerColumnScroll.home).toEqual({
      anchorId: anchor.id,
      offset: -9,
    });

    afterInsertion = true;
    setGrid(null, [remote, first, anchor]);
    view.rerender(<HierarchyExplorer {...defaultProps} />);

    await waitFor(() => expect(body.scrollTop).toBe(39));
    expect(useTriageStore.getState().explorerPathIds).toEqual([]);
    expect(document.activeElement).toBe(document.body);
  });

  it("falls back only to the nearest valid ancestor and restores its focus after remote delete", async () => {
    const { home, level1, level2 } = seedDeepGrid();
    const sibling = createNode({
      id: "sibling",
      parentId: home.id,
      title: "Sibling Must Not Substitute",
      level: 1,
    });
    useTriageStore.setState({
      explorerPathIds: [home.id, level1.id, level2.id],
      explorerOpenColumnIds: ["home", home.id, level1.id, level2.id],
    });

    const view = render(<HierarchyExplorer {...defaultProps} />);
    setGrid(home.id, [sibling]);
    view.rerender(<HierarchyExplorer {...defaultProps} />);

    await waitFor(() => {
      expect(useTriageStore.getState().explorerPathIds).toEqual([home.id]);
    });
    expect(useTriageStore.getState().explorerOpenColumnIds).toEqual(["home", home.id]);
    expect(screen.getByRole("button", { name: `Select Node: ${sibling.title}` })).not.toHaveAttribute("aria-current");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: `Select Node: ${home.title}` }),
    );
  });

  it("falls back to and focuses the Home heading when a root moves away", async () => {
    const { home } = seedDeepGrid();
    useTriageStore.setState({
      explorerPathIds: [home.id],
      explorerOpenColumnIds: ["home", home.id],
    });

    const view = render(<HierarchyExplorer {...defaultProps} />);
    setGrid(null, [createNode({ id: "other", title: "Other Root" })]);
    view.rerender(<HierarchyExplorer {...defaultProps} />);

    await waitFor(() => expect(useTriageStore.getState().explorerPathIds).toEqual([]));
    expect(document.activeElement).toBe(screen.getByTestId("hierarchy-column-heading-home"));
  });

  it("closes stale placement through the owner callback without selecting a sibling or writing", async () => {
    const { home, level1 } = seedDeepGrid();
    useTriageStore.setState({
      explorerPathIds: [home.id],
      explorerOpenColumnIds: ["home", home.id],
    });
    const pendingPlacementDropId = getTriageHierarchyDropId(level1.id);
    const onPendingPlacementInvalidated = vi.fn(
      (_dropId: string, focusAfterClose: () => void) => focusAfterClose(),
    );

    const view = render(
      <HierarchyExplorer
        {...defaultProps}
        onPendingPlacementInvalidated={onPendingPlacementInvalidated}
        pendingPlacementDropId={pendingPlacementDropId}
      />,
    );
    expect(document.querySelector('[class*="animate-pulse"]')).not.toBeNull();

    setGrid(home.id, []);
    view.rerender(
      <HierarchyExplorer
        {...defaultProps}
        onPendingPlacementInvalidated={onPendingPlacementInvalidated}
        pendingPlacementDropId={pendingPlacementDropId}
      />,
    );

    await waitFor(() => {
      expect(document.querySelector('[class*="animate-pulse"]')).toBeNull();
    });
    expect(onPendingPlacementInvalidated).toHaveBeenCalledOnce();
    expect(onPendingPlacementInvalidated).toHaveBeenCalledWith(
      pendingPlacementDropId,
      expect.any(Function),
    );
    expect(useTriageStore.getState().explorerPathIds).toEqual([home.id]);
  });
});

describe("HierarchyExplorer Task 152 target-column placement", () => {
  it("focuses the exact placed card when its authoritative render arrives after the initial frames", () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    setGrid(null, []);
    const result = createNode({ id: "placed-node", title: "Placed node" });
    const localPlacementResult = {
      id: result.id,
      type: "node" as const,
      pathIds: [] as const,
    };
    const view = render(
      <HierarchyExplorer
        {...defaultProps}
        localPlacementResult={localPlacementResult}
      />,
    );

    act(() => {
      while (frames.length > 0) frames.shift()?.(performance.now());
    });
    expect(
      document.querySelector(`[data-explorer-item-id="${result.id}"]`),
    ).not.toBeInTheDocument();

    setGrid(null, [result]);
    view.rerender(
      <HierarchyExplorer
        {...defaultProps}
        localPlacementResult={localPlacementResult}
      />,
    );

    expect(
      document.querySelector(`[data-explorer-item-id="${result.id}"]`),
    ).toHaveFocus();

    const unrelatedFocus = screen.getByRole("button", { name: "Home" });
    unrelatedFocus.focus();
    setGrid(null, [result, createNode({ id: "unrelated", title: "Unrelated" })]);
    view.rerender(
      <HierarchyExplorer
        {...defaultProps}
        localPlacementResult={localPlacementResult}
      />,
    );
    expect(unrelatedFocus).toHaveFocus();
  });

  it.each([
    ["direct", "node"],
    ["direct", "bit"],
    ["staged", "node"],
    ["staged", "bit"],
  ] as const)(
    "reveals only the %s %s destination and focuses the exact authoritative card",
    async (kind, type) => {
      const target = createNode({ id: "target-1", title: "Target" });
      const resultId = `placed-${kind}-${type}`;
      const result =
        type === "node"
          ? createNode({ id: resultId, parentId: target.id, title: "Placed Node" })
          : createBit({ id: resultId, parentId: target.id, title: "Placed Bit" });
      setGrid(null, [target]);
      setGrid(
        target.id,
        type === "node" ? [result as Node] : [],
        type === "bit" ? [result as Bit] : [],
      );

      render(
        <HierarchyExplorer
          {...defaultProps}
          localPlacementResult={{ id: resultId, type, pathIds: [target.id] }}
          placementSnapshot={placementSnapshot({
            phase: "success",
            resultType: type,
            terminalStatus: "applied",
            release: {
              ...placementSnapshot().release,
              kind,
              ...(kind === "staged"
                ? {
                    candidate: {
                      id: "candidate-1",
                      version: 1,
                      resultType: type,
                    },
                  }
                : {}),
            },
          })}
        />,
      );

      await waitFor(() =>
        expect(useTriageStore.getState().explorerPathIds).toEqual([target.id]),
      );
      await waitFor(() =>
        expect(
          document.querySelector(
            `[data-explorer-item-id="${resultId}"][data-explorer-item-type="${type}"]`,
          ),
        ).toHaveFocus(),
      );
    },
  );

  it("rejects a same-ID card with the wrong result type", async () => {
    const target = createNode({ id: "target-1", title: "Target" });
    const sameId = "same-result-id";
    const node = createNode({ id: sameId, parentId: target.id, title: "Node result" });
    const bit = createBit({ id: sameId, parentId: target.id, title: "Bit result" });
    setGrid(null, [target]);
    setGrid(target.id, [node], [bit]);

    render(
      <HierarchyExplorer
        {...defaultProps}
        localPlacementResult={{ id: sameId, type: "node", pathIds: [target.id] }}
      />,
    );

    await waitFor(() =>
      expect(
        document.querySelector(
          `[data-explorer-item-id="${sameId}"][data-explorer-item-type="node"]`,
        ),
      ).toHaveFocus(),
    );
    expect(
      document.querySelector(
        `[data-explorer-item-id="${sameId}"][data-explorer-item-type="bit"]`,
      ),
    ).not.toHaveFocus();
  });

  it.each(["direct", "staged"] as const)(
    "resets only the owning column to its complete top spacing when a %s affordance opens",
    (kind) => {
      const target = createNode({ id: "target-1", title: "Target" });
      setGrid(null, [target]);
      const view = render(<HierarchyExplorer {...defaultProps} />);
      const body = screen.getByTestId("hierarchy-section-body-home");
      body.scrollTop = 80;
      const documentScroll = window.scrollY;
      vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
        function (this: HTMLElement) {
          if (this === body) {
            return {
              top: 100,
              bottom: 300,
              left: 0,
              right: 300,
              width: 300,
              height: 200,
              x: 0,
              y: 100,
              toJSON() {},
            };
          }
          if (this.closest('[data-triage-role="placement-affordance"]')) {
            return {
              top: 40,
              bottom: 70,
              left: 0,
              right: 300,
              width: 300,
              height: 30,
              x: 0,
              y: 40,
              toJSON() {},
            };
          }
          return {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            width: 0,
            height: 0,
            x: 0,
            y: 0,
            toJSON() {},
          };
        },
      );
      const snapshot =
        kind === "direct"
          ? placementSnapshot()
          : placementSnapshot({
              phase: "result-title",
              resultType: "bit",
              resultTitleDraft: "",
              release: {
                ...placementSnapshot().release,
                kind: "staged",
                source: {
                  ...placementSnapshot().release.source,
                  title: "s".repeat(201),
                },
                candidate: {
                  id: "candidate-1",
                  version: 1,
                  resultType: "bit",
                },
              },
            });

      view.rerender(
        <HierarchyExplorer {...defaultProps} placementSnapshot={snapshot} />,
      );

      const focusOwner =
        kind === "direct"
          ? screen.getByText("Choose a result type")
          : screen.getByRole("textbox", { name: "Result title" });
      expect(focusOwner).toHaveFocus();
      expect(body.scrollTop).toBe(0);
      expect(window.scrollY).toBe(documentScroll);
    },
  );

  it("preserves document and unrelated-column scroll when placement opens", () => {
    const parent = createNode({ id: "parent-1", title: "Parent" });
    const target = createNode({
      id: "target-1",
      parentId: parent.id,
      title: "Target",
    });
    setGrid(null, [parent]);
    setGrid(parent.id, [target]);
    useTriageStore.setState({
      explorerPathIds: [parent.id],
      explorerOpenColumnIds: ["home", parent.id],
    });
    const view = render(<HierarchyExplorer {...defaultProps} />);
    const homeBody = screen.getByTestId("hierarchy-section-body-home");
    const targetBody = screen.getByTestId("hierarchy-section-body-l1");
    homeBody.scrollTop = 37;
    targetBody.scrollTop = 80;
    const documentScroll = window.scrollY;

    view.rerender(
      <HierarchyExplorer
        {...defaultProps}
        placementSnapshot={placementSnapshot({
          release: {
            ...placementSnapshot().release,
            target: {
              ...placementSnapshot().release.target,
              dropId: getTriageHierarchyDropId(target.id),
              parentId: target.id,
              level: 1,
              title: target.title,
              path: ["Home", parent.title, target.title],
              expectedAncestorIds: [parent.id, target.id],
            },
          },
        })}
      />,
    );

    expect(screen.getByText("Choose a result type")).toHaveFocus();
    expect(targetBody.scrollTop).toBe(0);
    expect(homeBody.scrollTop).toBe(37);
    expect(window.scrollY).toBe(documentScroll);
  });

  it("keeps successful-card focus on minimum owning-column reveal instead of resetting to top", () => {
    const placed = createNode({ id: "placed-node", title: "Placed node" });
    setGrid(null, [placed]);
    const view = render(<HierarchyExplorer {...defaultProps} />);
    const body = screen.getByTestId("hierarchy-section-body-home");
    body.scrollTop = 80;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function (this: HTMLElement) {
        if (this === body) {
          return {
            top: 100,
            bottom: 300,
            left: 0,
            right: 300,
            width: 300,
            height: 200,
            x: 0,
            y: 100,
            toJSON() {},
          };
        }
        if (this.dataset.explorerItemId === placed.id) {
          return {
            top: 290,
            bottom: 330,
            left: 0,
            right: 300,
            width: 300,
            height: 40,
            x: 0,
            y: 290,
            toJSON() {},
          };
        }
        return {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          width: 0,
          height: 0,
          x: 0,
          y: 0,
          toJSON() {},
        };
      },
    );

    body.scrollTop = 80;
    view.rerender(
      <HierarchyExplorer
        {...defaultProps}
        localPlacementResult={{ id: placed.id, type: "node", pathIds: [] }}
      />,
    );

    expect(
      document.querySelector(`[data-explorer-item-id="${placed.id}"]`),
    ).toHaveFocus();
    expect(body.scrollTop).toBe(110);
  });

  it("closes headless Search, renders the direct step inside the exact target column, and focuses the step heading", async () => {
    const target = createNode({ id: "target-1", title: "Target" });
    setGrid(null, [target]);
    explorerSearchState.mode = "active";
    explorerSearchState.activeQuery = "target";
    const onPlacementSelectType = vi.fn();

    render(
      <HierarchyExplorer
        {...defaultProps}
        placementSnapshot={placementSnapshot()}
        onPlacementSelectType={onPlacementSelectType}
      />,
    );

    expect(explorerSearchState.closeSearch).toHaveBeenCalledOnce();
    const placement = screen.getByRole("region", { name: "Placement" });
    expect(
      screen.getByTestId("hierarchy-column-heading-home").closest("section"),
    ).toContainElement(placement);
    expect(screen.getByText("Choose a result type")).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "Node" }));
    expect(onPlacementSelectType).toHaveBeenCalledWith("node");
  });

  it("returns pre-dispatch Escape to the placement owner and suppresses it while pending", () => {
    const target = createNode({ id: "target-1", title: "Target" });
    setGrid(null, [target]);
    const onPlacementCancel = vi.fn();
    const view = render(
      <HierarchyExplorer
        {...defaultProps}
        placementSnapshot={placementSnapshot()}
        onPlacementCancel={onPlacementCancel}
      />,
    );

    fireEvent.keyDown(screen.getByRole("region", { name: "Placement" }), {
      key: "Escape",
    });
    expect(onPlacementCancel).toHaveBeenCalledOnce();

    view.rerender(
      <HierarchyExplorer
        {...defaultProps}
        placementSnapshot={placementSnapshot({
          phase: "confirmation",
          resultType: "node",
        })}
        onPlacementCancel={onPlacementCancel}
      />,
    );
    screen.getByRole("button", { name: "Confirm" }).focus();

    view.rerender(
      <HierarchyExplorer
        {...defaultProps}
        placementSnapshot={placementSnapshot({ phase: "pending", resultType: "node" })}
        onPlacementCancel={onPlacementCancel}
      />,
    );
    expect(screen.getByRole("button", { name: "Confirm" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("region", { name: "Placement" }), {
      key: "Escape",
    });
    expect(onPlacementCancel).toHaveBeenCalledOnce();
  });
});

describe("HierarchyExplorer Task 155 actual-card Newly Placed projection", () => {
  it("renders actual cards and pins multiple local results newest-first within each type", () => {
    const ordinaryNode = createNode({ id: "ordinary-node", title: "Ordinary node", x: 1, y: 2 });
    const firstNode = createNode({ id: "first-node", title: "First placed node", x: 30, y: 40 });
    const secondNode = createNode({ id: "second-node", title: "Second placed node", x: 50, y: 60 });
    const parent = createNode({ id: "parent-1", title: "Parent" });
    const ordinaryBit = createBit({ id: "ordinary-bit", parentId: parent.id, title: "Ordinary bit" });
    const localBit = createBit({ id: "local-bit", parentId: parent.id, title: "Placed bit", x: 70, y: 80 });
    setGrid(null, [ordinaryNode, firstNode, secondNode, parent]);
    setGrid(parent.id, [], [ordinaryBit, localBit]);
    useTriageStore.setState({
      explorerPathIds: [parent.id],
      explorerOpenColumnIds: ["home", parent.id],
    });

    render(
      <HierarchyExplorer
        {...defaultProps}
        newlyPlacedEntries={[
          newlyPlacedEntry(firstNode, "node", 1),
          newlyPlacedEntry(localBit, "bit", 2),
          newlyPlacedEntry(secondNode, "node", 3),
        ]}
      />,
    );

    const home = screen.getByTestId("hierarchy-section-body-home");
    expect(
      Array.from(home.querySelectorAll('[data-explorer-item-type="node"]')).map(
        (element) => element.getAttribute("data-explorer-item-id"),
      ),
    ).toEqual([secondNode.id, firstNode.id, ordinaryNode.id, parent.id]);
    const levelOne = screen.getByTestId("hierarchy-section-body-l1");
    expect(
      Array.from(levelOne.querySelectorAll('[data-explorer-item-type="bit"]')).map(
        (element) => element.getAttribute("data-explorer-item-id"),
      ),
    ).toEqual([localBit.id, ordinaryBit.id]);
    expect(home.querySelector(".theme-node-card")).not.toBeNull();
    expect(levelOne.querySelector(".group\\/bit")).not.toBeNull();
    expect(document.querySelectorAll('[data-card-marker="newly-placed"]')).toHaveLength(3);
    expect(secondNode).toMatchObject({ x: 50, y: 60 });
    expect(localBit).toMatchObject({ x: 70, y: 80 });
  });

  it("keeps marker semantics independent from selection and theme rerenders", () => {
    const placed = createNode({ id: "placed-node", title: "Placed node" });
    setGrid(null, [placed]);
    useTriageStore.setState({
      explorerPathIds: [placed.id],
      explorerOpenColumnIds: ["home", placed.id],
    });
    const entry = newlyPlacedEntry(placed, "node", 1);
    const view = render(
      <HierarchyExplorer {...defaultProps} newlyPlacedEntries={[entry]} />,
    );

    const card = screen.getByRole("button", { name: "Select Node: Placed node" });
    expect(card).toHaveAttribute("aria-current", "true");
    expect(card).toHaveAttribute("data-newly-placed", "true");
    expect(card).toContainElement(screen.getByText("NEW"));

    document.documentElement.dataset.colorTheme = "terminal";
    view.rerender(
      <HierarchyExplorer {...defaultProps} newlyPlacedEntries={[entry]} />,
    );
    expect(screen.getByText("NEW")).toBeInTheDocument();
    delete document.documentElement.dataset.colorTheme;
  });
});

describe("HierarchyExplorer Task 156 ordinary-card Undo", () => {
  function renderWithUndo(
    entries: readonly TriageNewlyPlacedProvenance[],
  ) {
    let activeOperation: { kind: "undo"; operationId: string } | null = null;
    const operationLock: TriageOperationLock = {
      activeOperation: null,
      acquire: (kind, operationId) => {
        if (activeOperation !== null || kind !== "undo") return false;
        activeOperation = { kind, operationId };
        return true;
      },
      isLocked: () => activeOperation !== null,
      release: (operationId, status) => {
        if (
          activeOperation?.operationId !== operationId ||
          !["applied", "already_applied", "not_applied", "rejected", "conflict"].includes(status)
        ) {
          return false;
        }
        activeOperation = null;
        return true;
      },
    };
    const titleBlocker = createScratchTitleBlockerHandle();
    const view = render(
      <TriageOperationLockContext.Provider value={operationLock}>
        <ScratchTitleBlockerContext.Provider value={titleBlocker}>
          <HierarchyExplorer
            {...defaultProps}
            newlyPlacedEntries={entries}
          />
        </ScratchTitleBlockerContext.Provider>
      </TriageOperationLockContext.Provider>,
    );
    return { ...view, titleBlocker };
  }

  it("reactively blocks dirty Edit intent without dispatch or navigation and re-enables after resolution", async () => {
    const target = createNode({ id: "undo-target", title: "Undo target" });
    const entry = newlyPlacedEntry(target, "node", 1);
    setGrid(null, [target]);
    useTriageStore.setState({
      explorerPathIds: [target.id],
      explorerOpenColumnIds: ["home", target.id],
    });

    const { titleBlocker } = renderWithUndo([entry]);
    const undoButton = await screen.findByRole("button", {
      name: "Undo placement of Undo target",
    });
    await waitFor(() => expect(undoButton).toBeEnabled());

    act(() => titleBlocker.setSnapshot("dirty"));
    await waitFor(() => expect(undoButton).toHaveAttribute("aria-disabled", "true"));
    fireEvent.click(undoButton);
    expect(undoRepository.undoDirectPlacement).not.toHaveBeenCalled();
    expect(useTriageStore.getState().explorerPathIds).toEqual([target.id]);

    act(() => titleBlocker.setSnapshot("open"));
    await waitFor(() => expect(undoButton).toBeEnabled());
  });

  it("blocks conflicted Edit intent while leaving pristine open Edit eligible", async () => {
    const target = createNode({ id: "undo-target", title: "Undo target" });
    const entry = newlyPlacedEntry(target, "node", 1);
    setGrid(null, [target]);
    useTriageStore.setState({
      explorerPathIds: [target.id],
      explorerOpenColumnIds: ["home", target.id],
    });
    const titleBlocker = createScratchTitleBlockerHandle();
    titleBlocker.setSnapshot("conflicted");
    let activeOperation: { kind: "undo"; operationId: string } | null = null;
    const operationLock: TriageOperationLock = {
      activeOperation: null,
      acquire: (kind, operationId) => {
        if (activeOperation !== null || kind !== "undo") return false;
        activeOperation = { kind, operationId };
        return true;
      },
      isLocked: () => activeOperation !== null,
      release: () => false,
    };
    render(
      <TriageOperationLockContext.Provider value={operationLock}>
        <ScratchTitleBlockerContext.Provider value={titleBlocker}>
          <HierarchyExplorer {...defaultProps} newlyPlacedEntries={[entry]} />
        </ScratchTitleBlockerContext.Provider>
      </TriageOperationLockContext.Provider>,
    );
    const undoButton = await screen.findByRole("button", {
      name: "Undo placement of Undo target",
    });
    await waitFor(() => expect(undoButton).toHaveAttribute("aria-disabled", "true"));
    fireEvent.click(undoButton);
    expect(undoRepository.undoDirectPlacement).not.toHaveBeenCalled();
    expect(activeOperation).toBeNull();
    expect(useTriageStore.getState().explorerPathIds).toEqual([target.id]);

    act(() => titleBlocker.setSnapshot("open"));
    await waitFor(() => expect(undoButton).toBeEnabled());
    expect(undoRepository.undoDirectPlacement).not.toHaveBeenCalled();
  });

  it.each([
    ["next card", "next"],
    ["previous card", "previous"],
    ["column heading", "heading"],
  ] as const)("focuses the canonical %s after terminal success", async (_label, expected) => {
    const target = createNode({ id: "undo-target", title: "Undo target" });
    const next = createNode({ id: "next-node", title: "Next node" });
    const previous = createNode({ id: "previous-node", title: "Previous node" });
    const targetEntry = newlyPlacedEntry(target, "node", 1);
    const previousEntry = newlyPlacedEntry(previous, "node", 2);
    const initialNodes =
      expected === "next"
        ? [target, next]
        : expected === "previous"
          ? [previous, target]
          : [target];
    const entries = expected === "previous"
      ? [targetEntry, previousEntry]
      : [targetEntry];
    setGrid(null, initialNodes);
    if (expected === "next") {
      useTriageStore.setState({
        explorerPathIds: [target.id],
        explorerOpenColumnIds: ["home", target.id],
      });
    }
    undoRepository.undoDirectPlacement.mockImplementation(async (command) => {
      setGrid(
        null,
        initialNodes.filter((node) => node.id !== command.resultSnapshot.id),
      );
      return {
        operationId: command.operationId,
        status: "applied" as const,
        result: null,
        source: {
          ...command.sourceSnapshot,
          consumedAt: null,
          version: command.sourceSnapshot.version + 1,
        },
        candidate: null,
      };
    });

    renderWithUndo(entries);
    const undoButton = await screen.findByRole("button", {
      name: "Undo placement of Undo target",
    });
    await waitFor(() => {
      expect(undoRepository.reconcileDirectPlacementUndo).toHaveBeenCalled();
    });
    await waitFor(() => expect(undoButton).toBeEnabled());
    fireEvent.click(undoButton);

    const expectedTarget =
      expected === "next"
        ? screen.getByRole("button", { name: "Select Node: Next node" })
        : expected === "previous"
          ? screen.getByRole("button", { name: "Select Node: Previous node" })
          : screen.getByTestId("hierarchy-column-heading-home");
    await waitFor(() => expect(expectedTarget).toHaveFocus());
    expect(useTriageStore.getState().explorerPathIds).toEqual([]);
    expect(undoRepository.undoDirectPlacement).toHaveBeenCalledTimes(1);
  });

  it("retains the exact card and selected path while an ambiguous Undo is unknown", async () => {
    const target = createNode({ id: "undo-target", title: "Undo target" });
    const next = createNode({ id: "next-node", title: "Next node" });
    const entry = newlyPlacedEntry(target, "node", 1);
    setGrid(null, [target, next]);
    useTriageStore.setState({
      explorerPathIds: [target.id],
      explorerOpenColumnIds: ["home", target.id],
    });
    undoRepository.undoDirectPlacement.mockImplementation(async () => {
      setGrid(null, [next]);
      throw new Error("ambiguous transport");
    });

    renderWithUndo([entry]);
    const undoButton = await screen.findByRole("button", {
      name: "Undo placement of Undo target",
    });
    await waitFor(() => expect(undoButton).toBeEnabled());
    fireEvent.click(undoButton);

    await waitFor(() => {
      expect(undoButton).toHaveAttribute("aria-disabled", "false");
      expect(undoButton).toHaveAccessibleName("Check again");
    });
    expect(
      screen.getByRole("button", { name: "Select Node: Undo target" }),
    ).toBeInTheDocument();
    expect(useTriageStore.getState().explorerPathIds).toEqual([target.id]);
    expect(
      screen.getByRole("button", { name: "Select Node: Next node" }),
    ).not.toHaveFocus();
    expect(undoRepository.undoDirectPlacement).toHaveBeenCalledTimes(1);
  });

  it("routes staged Undo with the exact candidate provenance and never invents it for direct Undo", async () => {
    const parent = createNode({ id: "parent", title: "Parent" });
    const bit = createBit({ id: "staged-bit", parentId: parent.id, title: "Staged bit" });
    const candidate = {
      id: "candidate-1",
      scratchBitId: "scratch-1",
      sourceBreakdownId: "source-1",
      resultType: "bit" as const,
      lifecycle: "staged" as const,
      createdAt: 1,
      updatedAt: 1,
      version: 11,
    };
    const entry: TriageNewlyPlacedProvenance = {
      ...newlyPlacedEntry(bit, "bit", 1),
      candidate: { id: candidate.id, expectedVersion: 11, snapshot: candidate },
    };
    setGrid(null, [parent]);
    setGrid(parent.id, [], [bit]);
    useTriageStore.setState({
      explorerPathIds: [parent.id],
      explorerOpenColumnIds: ["home", parent.id],
    });
    undoRepository.undoStagedPlacement.mockImplementation(async (command) => {
      setGrid(parent.id, [], []);
      return {
        operationId: command.operationId,
        status: "applied" as const,
        result: null,
        source: {
          ...command.sourceSnapshot,
          consumedAt: null,
          version: command.sourceSnapshot.version + 1,
        },
        candidate: command.candidateSnapshot,
      };
    });

    renderWithUndo([entry]);
    const undoButton = await screen.findByRole("button", {
      name: "Undo placement of Staged bit",
    });
    await waitFor(() => expect(undoButton).toBeEnabled());
    fireEvent.click(undoButton);

    await waitFor(() => expect(undoRepository.undoStagedPlacement).toHaveBeenCalledOnce());
    expect(undoRepository.undoStagedPlacement).toHaveBeenCalledWith(
      expect.objectContaining({ candidateSnapshot: candidate }),
    );
    expect(undoRepository.undoDirectPlacement).not.toHaveBeenCalled();
  });
});

describe("HierarchyExplorer Task 157 DP-VQ10 Newly and Undo rail", () => {
  it("composes selected, Newly, available Undo, and the visible rail independently", async () => {
    const target = createNode({ id: "undo-target", title: "Undo target" });
    const entry = newlyPlacedEntry(target, "node", 1);
    setGrid(null, [target]);
    useTriageStore.setState({
      explorerPathIds: [target.id],
      explorerOpenColumnIds: ["home", target.id],
    });

    render(
      <TriageOperationLockContext.Provider
        value={{
          activeOperation: null,
          acquire: vi.fn(() => true),
          isLocked: () => false,
          release: vi.fn(() => true),
        }}
      >
        <HierarchyExplorer {...defaultProps} newlyPlacedEntries={[entry]} />
      </TriageOperationLockContext.Provider>,
    );

    const card = screen.getByRole("button", { name: "Select Node: Undo target" });
    const undoButton = await screen.findByRole("button", {
      name: "Undo placement of Undo target",
    });
    const rail = await screen.findByText("Undo this placement.");
    await waitFor(() => expect(undoButton).toHaveAttribute("aria-disabled", "false"));

    expect(card).toHaveAttribute("aria-current", "true");
    expect(card).toHaveAttribute("data-newly-placed", "true");
    expect(screen.getByText("NEW")).toHaveAttribute(
      "data-card-marker",
      "newly-placed",
    );
    expect(rail.closest("[data-undo-state='available']")).not.toBeNull();
    expect(undoButton).toHaveAttribute("aria-describedby", rail.id);
  });

  it("keeps Retry on the same operation and preserves ordinary success focus", async () => {
    const target = createNode({ id: "undo-target", title: "Undo target" });
    const next = createNode({ id: "next-node", title: "Next node" });
    const entry = newlyPlacedEntry(target, "node", 1);
    setGrid(null, [target, next]);
    useTriageStore.setState({
      explorerPathIds: [target.id],
      explorerOpenColumnIds: ["home", target.id],
    });
    let activeOperationId: string | null = null;
    const operationLock: TriageOperationLock = {
      activeOperation: null,
      acquire: (_kind, operationId) => {
        if (activeOperationId !== null) return false;
        activeOperationId = operationId;
        return true;
      },
      isLocked: () => activeOperationId !== null,
      release: (operationId) => {
        if (activeOperationId !== operationId) return false;
        activeOperationId = null;
        return true;
      },
    };
    undoRepository.undoDirectPlacement
      .mockImplementationOnce(async (command) => ({
        operationId: command.operationId,
        status: "not_applied" as const,
        result: command.resultSnapshot,
        source: command.sourceSnapshot,
        candidate: null,
      }))
      .mockImplementationOnce(async (command) => {
        setGrid(null, [next]);
        return {
          operationId: command.operationId,
          status: "applied" as const,
          result: null,
          source: {
            ...command.sourceSnapshot,
            consumedAt: null,
            version: command.sourceSnapshot.version + 1,
          },
          candidate: null,
        };
      });

    render(
      <TriageOperationLockContext.Provider value={operationLock}>
        <HierarchyExplorer {...defaultProps} newlyPlacedEntries={[entry]} />
      </TriageOperationLockContext.Provider>,
    );
    const undoButton = await screen.findByRole("button", {
      name: "Undo placement of Undo target",
    });
    await waitFor(() => expect(undoButton).toHaveAttribute("aria-disabled", "false"));
    fireEvent.click(undoButton);

    const retry = await screen.findByRole("button", { name: "Retry" });
    expect(retry).toHaveFocus();
    expect(screen.getByText("“Undo target” wasn’t undone. Nothing changed.")).toBeInTheDocument();
    const firstOperationId = undoRepository.undoDirectPlacement.mock.calls[0]![0].operationId;
    fireEvent.click(retry);

    const nextCard = screen.getByRole("button", { name: "Select Node: Next node" });
    await waitFor(() => expect(nextCard).toHaveFocus());
    expect(undoRepository.undoDirectPlacement.mock.calls[1]![0].operationId).toBe(
      firstOperationId,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Restored “Source 1”.");
  });

  it("defines static reduced-motion parity and all eight Newly rail theme families", () => {
    for (const role of [
      "newly-card-shell",
      "newly-marker",
      "newly-undo-action",
      "newly-status-rail",
      "newly-status-mark",
      "newly-status-reason",
    ]) {
      expect(globalsCss).toContain(`.${role}`);
    }
    for (const theme of [
      "tiny-desk",
      "neumorphism",
      "claymorphism",
      "origami",
      "terminal",
      "retro-mac",
      "graphite",
    ]) {
      expect(globalsCss).toContain(
        `:root[data-color-theme="${theme}"] .newly-status-rail`,
      );
    }
    expect(globalsCss).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.newly-status-rail[\s\S]*transition: none/,
    );
    const newlyBlocks = [
      ...globalsCss.matchAll(/[^{}]*\.newly-(?:marker|undo|status)[^{}]*\{([^}]*)\}/g),
    ];
    for (const [, block] of newlyBlocks) {
      for (const [, value] of block.matchAll(
        /(?:animation|transition):\s*([^;]+);/g,
      )) {
        expect(value.trim()).toMatch(/^none(?:\s*!important)?$/);
      }
    }
  });
});

describe("HierarchyExplorer Task 153 placement reliability rail", () => {
  it.each([
    ["pending", null, "Placing “Project” in Home → Target…", "Confirm"],
    [
      "unknown",
      null,
      "We couldn’t confirm whether “Project” was placed.",
      "Check again",
    ],
    [
      "reconciling",
      null,
      "Checking whether “Project” was placed…",
      "Check again",
    ],
    [
      "terminal",
      "not-applied",
      "“Project” wasn’t placed. Your source is unchanged.",
      "Retry",
    ],
    [
      "terminal",
      "stale-source",
      "The source changed. Nothing was placed. Cancel and drag it again.",
      "Cancel",
    ],
    [
      "terminal",
      "stale-target",
      "The destination changed. Nothing was placed. Cancel and drag to the current destination.",
      "Cancel",
    ],
  ] as const)(
    "renders %s / %s with exact atomic copy and current-action focus",
    (phase, terminalKind, copy, focusedAction) => {
      const target = createNode({ id: "target-1", title: "Target" });
      setGrid(null, [target]);
      const view = render(
        <HierarchyExplorer
          {...defaultProps}
          placementSnapshot={placementSnapshot({
            phase,
            resultType: "node",
            terminalKind,
            terminalStatus:
              terminalKind === "not-applied"
                ? "not_applied"
                : terminalKind === null
                  ? null
                  : "conflict",
          })}
        />,
      );
      const rail = screen.getByRole("status", { name: "Placement status" });
      expect(rail).toHaveAttribute("aria-atomic", "true");
      expect(rail).toHaveAttribute("aria-live", "polite");
      expect(rail).toHaveTextContent(copy);
      expect(screen.getByRole("button", { name: focusedAction })).toHaveFocus();
      if (terminalKind !== "not-applied") {
        expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
      }
      view.unmount();
    },
  );

  it("announces the edited result title after authoritative success", async () => {
    const placed = createBit({
      id: "result-1",
      title: "Exact Bit result",
      parentId: "target-1",
    });
    setGrid(null, [createNode({ id: "target-1", title: "Target" })]);
    setGrid("target-1", [], [placed]);
    const onPlacementConfirm = vi.fn();
    render(
      <HierarchyExplorer
        {...defaultProps}
        localPlacementResult={{ id: placed.id, type: "bit", pathIds: ["target-1"] }}
        placementSnapshot={{
          ...placementSnapshot({
            release: {
              ...placementSnapshot().release,
              kind: "staged",
              source: {
                ...placementSnapshot().release.source,
                title: "s".repeat(201),
              },
              candidate: {
                id: "candidate-1",
                version: 3,
                resultType: "bit",
              },
            },
            resultType: "bit",
            resultTitleDraft: "Exact Bit result",
          }),
          phase: "success",
          terminalStatus: "applied",
        }}
        onPlacementConfirm={onPlacementConfirm}
      />,
    );

    expect(
      screen.getByRole("status", { name: "Placement result status" }),
    ).toHaveTextContent("Placed “Exact Bit result” in Home → Target.");
    await waitFor(() => expect(onPlacementConfirm).toHaveBeenCalledOnce());
  });

  it("acknowledges success once without a visible affordance and leaves focus to the actual card", async () => {
    const placed = createNode({ id: "result-1", title: "Project" });
    setGrid(null, [placed]);
    const onPlacementConfirm = vi.fn();
    render(
      <HierarchyExplorer
        {...defaultProps}
        localPlacementResult={{ id: placed.id, type: "node", pathIds: [] }}
        placementSnapshot={placementSnapshot({
          phase: "success",
          resultType: "node",
          terminalStatus: "applied",
        })}
        onPlacementConfirm={onPlacementConfirm}
      />,
    );

    expect(screen.queryByRole("region", { name: "Placement" })).toBeNull();
    expect(screen.getByRole("status", { name: "Placement result status" })).toHaveTextContent(
      "Placed “Project” in Home → Target.",
    );
    expect(
      screen.getByRole("button", { name: "Select Node: Project" }),
    ).toHaveFocus();
    await waitFor(() => expect(onPlacementConfirm).toHaveBeenCalledOnce());
  });

  it("omits the empty reliability rail while preserving ordinary confirmation actions", () => {
    const target = createNode({ id: "target-1", title: "Target" });
    setGrid(null, [target]);

    render(
      <HierarchyExplorer
        {...defaultProps}
        placementSnapshot={placementSnapshot({
          phase: "confirmation",
          resultType: "node",
        })}
      />,
    );

    expect(document.querySelector(".placement-reliability-rail")).toBeNull();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("defines fixed geometry, static reduced-motion parity, and all eight placement theme families", () => {
    for (const role of [
      "placement-reliability-rail",
      "placement-reliability-mark",
      "placement-reliability-actions",
      "placement-reliability-retry",
    ]) {
      expect(globalsCss).toContain(`.${role}`);
    }
    for (const theme of [
      "tiny-desk",
      "neumorphism",
      "claymorphism",
      "origami",
      "terminal",
      "retro-mac",
      "graphite",
    ]) {
      expect(globalsCss).toContain(
        `:root[data-color-theme="${theme}"] .placement-reliability-rail`,
      );
    }
    expect(globalsCss).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.placement-reliability-rail[\s\S]*transition: none/,
    );
    const placementBlocks = [
      ...globalsCss.matchAll(
        /[^{}]*\.placement-reliability[^{}]*\{([^}]*)\}/g,
      ),
    ];
    for (const [, block] of placementBlocks) {
      for (const [, value] of block.matchAll(
        /(?:animation|transition):\s*([^;]+);/g,
      )) {
        expect(value.trim()).toMatch(/^none(?:\s*!important)?$/);
      }
    }
  });
});

describe("HierarchyExplorer Task 154 Result Title and direct limits", () => {
  function stagedTitleSnapshot(
    draft: string,
    resultType: "node" | "bit" = "node",
  ): TriagePlacementSnapshot {
    return placementSnapshot({
      release: {
        ...placementSnapshot().release,
        kind: "staged",
        source: {
          ...placementSnapshot().release.source,
          title: "s".repeat(resultType === "node" ? 101 : 201),
        },
        candidate: {
          id: "candidate-1",
          version: 3,
          resultType,
        },
      },
      phase: "result-title",
      resultType,
      resultTitleDraft: draft,
    });
  }

  it("renders the staged over-limit step with exact copy, empty draft, validation, and input-first focus", () => {
    const target = createNode({ id: "target-1", title: "Target" });
    setGrid(null, [target]);
    const onPlacementResultTitleChange = vi.fn();

    render(
      <HierarchyExplorer
        {...defaultProps}
        placementSnapshot={stagedTitleSnapshot("")}
        onPlacementResultTitleChange={onPlacementResultTitleChange}
      />,
    );

    const placement = screen.getByRole("region", { name: "Placement" });
    expect(placement).toHaveAttribute(
      "data-placement-title-step",
      "staged-result-title",
    );
    expect(screen.getByText("RESULT TITLE")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Name this Node" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "The source is 101 characters. A Node title can be up to 100. The source won’t change.",
      ),
    ).toBeInTheDocument();
    const source = screen.getByText("s".repeat(101));
    expect(source).not.toHaveClass("truncate");
    const input = screen.getByRole("textbox", { name: "Result title" });
    expect(input).toHaveValue("");
    expect(input).not.toHaveAttribute("maxlength");
    expect(input).toHaveFocus();
    expect(screen.getByText("0 / 100")).toBeInTheDocument();
    expect(screen.getByText("Enter a result title.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();

    fireEvent.change(input, { target: { value: "x".repeat(101) } });
    expect(onPlacementResultTitleChange).toHaveBeenCalledWith("x".repeat(101));
  });

  it("enables exact valid draft Continue and focuses the next placement heading", () => {
    const target = createNode({ id: "target-1", title: "Target" });
    setGrid(null, [target]);
    const onPlacementResultTitleContinue = vi.fn();
    const view = render(
      <HierarchyExplorer
        {...defaultProps}
        placementSnapshot={stagedTitleSnapshot("Exact title")}
        onPlacementResultTitleContinue={onPlacementResultTitleContinue}
      />,
    );

    const continueButton = screen.getByRole("button", { name: "Continue" });
    expect(continueButton).toBeEnabled();
    expect(screen.queryByText("Enter a result title.")).toBeNull();
    fireEvent.click(continueButton);
    expect(onPlacementResultTitleContinue).toHaveBeenCalledOnce();

    view.rerender(
      <HierarchyExplorer
        {...defaultProps}
        placementSnapshot={placementSnapshot({
          release: stagedTitleSnapshot("Exact title").release,
          phase: "confirmation",
          resultType: "node",
          resultTitleDraft: "Exact title",
        })}
      />,
    );
    expect(screen.getByRole("heading", { name: "Confirm placement" })).toHaveFocus();
    expect(screen.getByText("Exact title")).toBeInTheDocument();
    expect(screen.getByText(`Source: ${"s".repeat(101)}`)).toBeInTheDocument();
  });

  it.each([
    ["pending", "Placing “Exact Bit result” in Home → Target…"],
    ["terminal", "“Exact Bit result” wasn’t placed. Your source is unchanged."],
  ] as const)(
    "keeps source truth visible and names the edited result during %s reliability",
    (phase, expectedCopy) => {
      const target = createNode({ id: "target-1", title: "Target" });
      setGrid(null, [target]);
      const snapshot = stagedTitleSnapshot("Exact Bit result");
      render(
        <HierarchyExplorer
          {...defaultProps}
          placementSnapshot={{
            ...snapshot,
            phase,
            terminalKind: phase === "terminal" ? "not-applied" : null,
            terminalStatus: phase === "terminal" ? "not_applied" : null,
          }}
        />,
      );

      expect(screen.getByText(expectedCopy)).toBeInTheDocument();
      expect(screen.getByText(`Source: ${snapshot.release.source.title}`)).toBeInTheDocument();
    },
  );

  it.each([
    [1, false, false, false],
    [100, false, false, false],
    [101, true, false, false],
    [200, true, false, false],
    [201, true, true, true],
    [1000, true, true, true],
  ] as const)(
    "renders direct length %i with native Node=%s Bit=%s unavailability and no editor",
    (length, nodeDisabled, bitDisabled, neither) => {
      const target = createNode({ id: "target-1", title: "Target" });
      setGrid(null, [target]);
      render(
        <HierarchyExplorer
          {...defaultProps}
          placementSnapshot={placementSnapshot({
            release: {
              ...placementSnapshot().release,
              source: {
                ...placementSnapshot().release.source,
                title: "d".repeat(length),
              },
            },
          })}
        />,
      );

      const placement = screen.getByRole("region", { name: "Placement" });
      expect(placement).toHaveAttribute(
        "data-placement-title-step",
        "direct-type-limit",
      );
      expect(screen.getByText("DIRECT PLACEMENT")).toBeInTheDocument();
      expect(screen.queryByRole("textbox", { name: "Result title" })).toBeNull();
      const node = screen.getByRole("button", { name: "Node" });
      const bit = screen.getByRole("button", { name: "Bit" });
      const cancel = screen.getByRole("button", { name: "Cancel" });
      expect(node).toHaveProperty("disabled", nodeDisabled);
      expect(bit).toHaveProperty("disabled", bitDisabled);
      expect(cancel).toBeEnabled();
      expect(node.compareDocumentPosition(bit)).toBe(
        globalThis.Node.DOCUMENT_POSITION_FOLLOWING,
      );
      expect(bit.compareDocumentPosition(cancel)).toBe(
        globalThis.Node.DOCUMENT_POSITION_FOLLOWING,
      );
      expect(
        screen.queryByText(
          "This source is too long for direct placement. Cancel and stage it first.",
        ) !== null,
      ).toBe(neither);
      if (nodeDisabled) {
        expect(
          screen.getByText(
            `Node titles can be up to 100 characters. This source has ${length}.`,
          ),
        ).toBeInTheDocument();
        expect(node).toHaveAttribute("aria-describedby");
      }
      if (bitDisabled) {
        expect(
          screen.getByText(
            `Bit titles can be up to 200 characters. This source has ${length}.`,
          ),
        ).toBeInTheDocument();
        expect(bit).toHaveAttribute("aria-describedby");
      }
    },
  );

  it("defines static reduced-motion parity and all eight compact-step theme mappings", () => {
    for (const role of [
      "placement-result-title-shell",
      "placement-result-title-input",
      "placement-result-title-error",
      "placement-direct-type-option",
      "placement-direct-type-reason",
      "placement-direct-limit-summary",
    ]) {
      expect(globalsCss).toContain(`.${role}`);
    }
    for (const theme of [
      "tiny-desk",
      "neumorphism",
      "claymorphism",
      "origami",
      "terminal",
      "retro-mac",
      "graphite",
    ]) {
      expect(globalsCss).toContain(
        `:root[data-color-theme="${theme}"] .placement-result-title-shell`,
      );
      expect(globalsCss).toContain(
        `:root[data-color-theme="${theme}"] .placement-direct-type-option`,
      );
    }
    expect(globalsCss).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.placement-result-title-shell[\s\S]*transition: none/,
    );
  });
});

describe("HierarchyExplorer Task 150 remote/path statuses", () => {
  it("renders an affected-column count, preserves focus, and shows the first surviving new row on activation", () => {
    const first = createNode({ id: "first", title: "First" });
    const remote = createNode({ id: "remote", title: "Remote" });
    setGrid(null, [first, remote]);
    useTriageStore.setState({
      explorerRemoteArrivalIds: {
        home: [{ id: remote.id, type: "node" }],
      },
    });
    render(<HierarchyExplorer {...defaultProps} />);

    const firstButton = screen.getByRole("button", {
      name: `Select Node: ${first.title}`,
    });
    firstButton.focus();
    const count = screen.getByRole("button", { name: "Show new in Home" });
    expect(count).toHaveTextContent("1 new");
    expect(firstButton).toHaveFocus();

    const body = screen.getByTestId("hierarchy-section-body-home");
    body.scrollTop = 80;
    fireEvent.click(count);

    expect(body.scrollTop).toBe(0);
    expect(
      screen.getByRole("button", { name: `Select Node: ${remote.title}` }),
    ).toHaveFocus();
    expect(useTriageStore.getState().explorerRemoteArrivalIds).toEqual({});
  });

  it("clears an observed-top count without moving focus", () => {
    const remote = createNode({ id: "remote", title: "Remote" });
    setGrid(null, [remote]);
    useTriageStore.setState({
      explorerRemoteArrivalIds: {
        home: [{ id: remote.id, type: "node" }],
      },
    });
    render(<HierarchyExplorer {...defaultProps} />);
    const row = screen.getByRole("button", {
      name: `Select Node: ${remote.title}`,
    });
    row.focus();
    const body = screen.getByTestId("hierarchy-section-body-home");
    body.scrollTop = 0;
    expect(
      screen.getByRole("button", { name: "Show new in Home" }),
    ).toBeInTheDocument();

    fireEvent.scroll(body);

    expect(screen.queryByRole("button", { name: "Show new in Home" })).not.toBeInTheDocument();
    expect(row).toHaveFocus();
  });

  it("focuses a newly arrived Bit only when its affected-column action is activated", () => {
    const home = createNode({ id: "home-a", title: "Projects" });
    const remoteBit = createBit({
      id: "remote-bit",
      parentId: home.id,
      title: "Remote note",
    });
    setGrid(null, [home]);
    setGrid(home.id, [], [remoteBit]);
    useTriageStore.setState({
      explorerPathIds: [home.id],
      explorerOpenColumnIds: ["home", home.id],
      explorerRemoteArrivalIds: {
        [home.id]: [{ id: remoteBit.id, type: "bit" }],
      },
    });
    render(<HierarchyExplorer {...defaultProps} />);

    const homeButton = screen.getByRole("button", {
      name: `Select Node: ${home.title}`,
    });
    homeButton.focus();
    expect(homeButton).toHaveFocus();

    fireEvent.click(
      screen.getByRole("button", { name: "Show new in Level 1" }),
    );

    expect(
      document.querySelector(`[data-explorer-item-id="${remoteBit.id}"]`),
    ).toHaveFocus();
  });

  it("focuses only the exact typed arrival when a Node and Bit share a raw ID", () => {
    const home = createNode({ id: "home-a", title: "Projects" });
    const sharedNode = createNode({
      id: "shared",
      parentId: home.id,
      level: 1,
      title: "Shared Node",
    });
    const sharedBit = createBit({
      id: "shared",
      parentId: home.id,
      title: "Shared Bit",
    });
    setGrid(null, [home]);
    setGrid(home.id, [sharedNode], [sharedBit]);
    useTriageStore.setState({
      explorerPathIds: [home.id],
      explorerOpenColumnIds: ["home", home.id],
      explorerRemoteArrivalIds: {
        [home.id]: [{ id: sharedBit.id, type: "bit" }],
      },
    });
    render(<HierarchyExplorer {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Show new in Level 1" }),
    );

    expect(
      document.querySelector(
        '[data-explorer-item-id="shared"][data-explorer-item-type="bit"]',
      ),
    ).toHaveFocus();
    expect(
      document.querySelector(
        '[data-explorer-item-id="shared"][data-explorer-item-type="node"]',
      ),
    ).not.toHaveFocus();
  });

  it("renders one exact destination-column fallback and returns focus on Dismiss", async () => {
    const home = createNode({ id: "home", title: "Projects" });
    setGrid(null, [home]);
    setGrid(home.id, []);
    useTriageStore.setState({
      explorerPathIds: [home.id],
      explorerOpenColumnIds: ["home", home.id],
      explorerPathStatus: {
        kind: "archived",
        title: "Research",
        destination: home.title,
        columnId: home.id,
        fallbackPathIds: [home.id],
      },
    });
    render(<HierarchyExplorer {...defaultProps} />);

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(
      "“Research” was archived. Returned to Projects.",
    );
    expect(within(status).getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
    expect(screen.getAllByRole("status")).toHaveLength(1);

    fireEvent.click(within(status).getByRole("button", { name: "Dismiss" }));
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
    expect(
      screen.getByRole("button", { name: `Select Node: ${home.title}` }),
    ).toHaveFocus();
  });

  it("keeps a successfully replaced stale-placement announcement silent across later placement props", async () => {
    const home = createNode({ id: "home", title: "Projects" });
    const target = createNode({
      id: "target",
      parentId: home.id,
      level: 1,
      title: "Target",
    });
    setGrid(null, [home]);
    setGrid(home.id, [target]);
    useTriageStore.setState({
      explorerPathIds: [home.id],
      explorerOpenColumnIds: ["home", home.id],
    });
    const onPendingPlacementInvalidated = vi.fn(
      (_dropId: string, focusAfterClose: () => void) => {
        focusAfterClose();
        return true;
      },
    );
    const view = render(
      <HierarchyExplorer
        {...defaultProps}
        onPendingPlacementInvalidated={onPendingPlacementInvalidated}
        pendingPlacementDropId={getTriageHierarchyDropId(target.id)}
      />,
    );

    const homeButton = screen.getByRole("button", {
      name: `Select Node: ${home.title}`,
    });
    screen.getByRole("button", { name: "Home" }).focus();
    setGrid(home.id, []);
    view.rerender(
      <HierarchyExplorer
        {...defaultProps}
        onPendingPlacementInvalidated={onPendingPlacementInvalidated}
        pendingPlacementDropId={getTriageHierarchyDropId(target.id)}
      />,
    );

    const stalePlacement = await waitFor(() => {
      const status = document.querySelector<HTMLElement>(".explorer-path-status");
      expect(status).toHaveTextContent(
        "Placement closed because this Explorer path changed.",
      );
      return status!;
    });
    expect(stalePlacement).not.toHaveAttribute("role");
    expect(stalePlacement).not.toHaveAttribute("aria-live");
    expect(homeButton).toHaveFocus();

    view.rerender(
      <HierarchyExplorer
        {...defaultProps}
        onPendingPlacementInvalidated={onPendingPlacementInvalidated}
        pendingPlacementDropId={getTriageHierarchyDropId(target.id)}
        placementSnapshot={placementSnapshot({ phase: "pending" })}
      />,
    );
    expect(stalePlacement).not.toHaveAttribute("role");
    expect(stalePlacement).not.toHaveAttribute("aria-live");
  });

  it.each(["pending", "unknown", "reconciling"] as const)(
    "retains the live stale-placement status when %s target-loss cancellation is refused",
    async (phase) => {
      const target = createNode({ id: "target-1", title: "Target" });
      setGrid(null, [target]);
      const onPendingPlacementInvalidated = vi.fn(() => false);
      const view = render(
        <HierarchyExplorer
          {...defaultProps}
          onPendingPlacementInvalidated={onPendingPlacementInvalidated}
          pendingPlacementDropId={getTriageHierarchyDropId(target.id)}
          placementSnapshot={placementSnapshot({ phase, resultType: "node" })}
        />,
      );

      setGrid(null, []);
      view.rerender(
        <HierarchyExplorer
          {...defaultProps}
          onPendingPlacementInvalidated={onPendingPlacementInvalidated}
          pendingPlacementDropId={getTriageHierarchyDropId(target.id)}
          placementSnapshot={placementSnapshot({ phase, resultType: "node" })}
        />,
      );

      const status = await screen.findByRole("status");
      expect(status).toHaveAttribute("aria-live", "polite");
      expect(status).toHaveTextContent(
        "Placement closed because this Explorer path changed.",
      );
      expect(onPendingPlacementInvalidated).toHaveReturnedWith(false);
    },
  );

  it("defines static reduced-motion parity and all eight Explorer theme role families", () => {
    expect(globalsCss).toContain(".explorer-remote-count");
    expect(globalsCss).toContain(".explorer-path-status");
    expect(globalsCss).toContain(".explorer-status-action");
    for (const theme of [
      "tiny-desk",
      "neumorphism",
      "claymorphism",
      "origami",
      "terminal",
      "retro-mac",
      "graphite",
    ]) {
      expect(globalsCss).toContain(
        `:root[data-color-theme="${theme}"] .explorer-path-status`,
      );
      expect(globalsCss).toContain(
        `:root[data-color-theme="${theme}"] .explorer-remote-count`,
      );
    }
    expect(globalsCss).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.explorer-remote-count[\s\S]*transition: none/,
    );
  });
});

describe("HierarchyExplorer Task 151 dedicated search and reveal", () => {
  it("retains Explorer chrome and replaces the complete four-column body", () => {
    setGrid(null, [createNode({ id: "projects", title: "Projects" })]);
    explorerSearchState.mode = "active";
    explorerSearchState.activeQuery = "";
    render(<HierarchyExplorer {...defaultProps} />);

    expect(screen.getByRole("navigation", { name: "Explorer path" })).toBeVisible();
    expect(screen.getByTestId("explorer-search-body")).toBeVisible();
    expect(screen.queryByTestId("hierarchy-section-body-home")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search Explorer" })).toHaveAttribute(
      "data-triage-role",
      "explorer-search-entry",
    );
    expect(screen.getByRole("status")).toHaveAttribute(
      "data-triage-role",
      "explorer-search-status",
    );
    expect(screen.getByRole("list")).toHaveAttribute(
      "data-triage-role",
      "explorer-search-results",
    );
  });

  it("revalidates a valid result, reconstructs its path, reveals it, and focuses its real row", async () => {
    const projects = createNode({ id: "projects", title: "Projects" });
    setGrid(null, [projects]);
    const selected = searchResult("node:projects");
    explorerSearchState.mode = "active";
    explorerSearchState.activeQuery = "projects";
    explorerSearchState.results = [selected];
    explorerSearchState.status = "ready";
    explorerSearchState.selectResult.mockImplementation(async () => {
      explorerSearchState.mode = "closed";
      explorerSearchState.activeQuery = null;
      explorerSearchState.results = [];
      explorerSearchState.revealPresentation = { kind: "revealed", result: selected };
      return { kind: "selected", result: selected };
    });
    render(<HierarchyExplorer {...defaultProps} />);

    fireEvent.click(explorerSearchResultRow());

    await waitFor(() => expect(useTriageStore.getState().explorerPathIds).toEqual([projects.id]));
    const row = screen.getByRole("button", { name: "Select Node: Projects" });
    expect(row).toHaveClass("explorer-revealed-row");
    expect(row).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Revealed “Projects” in Home.",
    );
    expect(screen.getByRole("status")).toHaveAttribute(
      "data-triage-role",
      "explorer-reveal-status",
    );
  });

  it("keeps search and navigation untouched when selection-time validation is stale", async () => {
    const selected = searchResult("node:projects");
    explorerSearchState.mode = "active";
    explorerSearchState.activeQuery = "projects";
    explorerSearchState.results = [selected];
    explorerSearchState.status = "ready";
    explorerSearchState.selectResult.mockResolvedValue({ kind: "stale" });
    render(<HierarchyExplorer {...defaultProps} />);

    fireEvent.click(explorerSearchResultRow());

    await waitFor(() => expect(explorerSearchState.selectResult).toHaveBeenCalledWith(selected));
    expect(screen.getByTestId("explorer-search-body")).toBeVisible();
    expect(useTriageStore.getState().explorerPathIds).toEqual([]);
    expect(screen.queryByText(/Revealed/)).not.toBeInTheDocument();
  });

  it.each([
    { target: "Home", expectedPath: [] as string[] },
    { target: "Personal Projects", expectedPath: ["home-a"] },
  ])(
    "invalidates pending result selection when the $target path intent wins",
    async ({ target, expectedPath }) => {
      const { home, level1, level2 } = seedDeepGrid();
      useTriageStore.setState({
        explorerPathIds: [home.id, level1.id],
        explorerOpenColumnIds: ["home", home.id, level1.id],
      });
      const selected = searchResult(`node:${level2.id}`, {
        title: level2.title,
        ancestorIds: [home.id, level1.id],
        nodePathIds: [home.id, level1.id, level2.id],
      });
      explorerSearchState.mode = "active";
      explorerSearchState.activeQuery = "evidence";
      explorerSearchState.results = [selected];
      explorerSearchState.status = "ready";
      let invalidated = false;
      let completeSelection!: () => void;
      explorerSearchState.invalidatePendingSelection.mockImplementation(() => {
        invalidated = true;
      });
      explorerSearchState.selectResult.mockImplementation(
        () =>
          new Promise((resolve) => {
            completeSelection = () =>
              resolve(
                invalidated
                  ? { kind: "stale" }
                  : { kind: "selected", result: selected },
              );
          }),
      );
      render(<HierarchyExplorer {...defaultProps} />);

      fireEvent.click(explorerSearchResultRow());
      fireEvent.click(screen.getByRole("button", { name: target }));

      expect(explorerSearchState.invalidatePendingSelection).toHaveBeenCalledOnce();
      expect(useTriageStore.getState().explorerPathIds).toEqual(expectedPath);
      await act(async () => completeSelection());
      expect(useTriageStore.getState().explorerPathIds).toEqual(expectedPath);
    },
  );

  it("uses DnD start as the only preserving close and requires explicit reopen", () => {
    explorerSearchState.mode = "active";
    explorerSearchState.activeQuery = "projects";
    explorerSearchState.resultScrollTop = 48;
    const view = render(<HierarchyExplorer {...defaultProps} />);
    expect(screen.getByTestId("explorer-search-body")).toBeVisible();

    view.rerender(
      <HierarchyExplorer
        {...defaultProps}
        activeDragItem={{ kind: "triage-staged-node", id: "candidate", label: "Candidate" }}
      />,
    );
    expect(explorerSearchState.interruptForDnd).toHaveBeenCalledOnce();
    view.rerender(<HierarchyExplorer {...defaultProps} />);
    expect(screen.queryByTestId("explorer-search-body")).not.toBeInTheDocument();
    expect(explorerSearchState.interruptedQuery).toBe("projects");
    expect(explorerSearchState.resultScrollTop).toBe(48);

    fireEvent.click(screen.getByRole("button", { name: "Search Explorer" }));
    view.rerender(<HierarchyExplorer {...defaultProps} />);
    expect(explorerSearchState.openSearch).toHaveBeenCalledOnce();
    expect(screen.getByTestId("explorer-search-body")).toBeVisible();
  });

  it("clears active and interrupted search with X and returns focus to the entry", async () => {
    explorerSearchState.mode = "active";
    explorerSearchState.activeQuery = "projects";
    explorerSearchState.interruptedQuery = "older";
    render(<HierarchyExplorer {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Clear and close Explorer search",
      }),
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Search Explorer" })).toHaveFocus(),
    );
    expect(explorerSearchState.closeSearch).toHaveBeenCalledOnce();
    expect(explorerSearchState.activeQuery).toBeNull();
    expect(explorerSearchState.interruptedQuery).toBeNull();
    expect(screen.queryByTestId("explorer-search-body")).not.toBeInTheDocument();
  });

  it.each(["input", "result", "close", "retry", "entry"])(
    "clears active search with Escape from the %s control",
    async (target) => {
      explorerSearchState.mode = "active";
      explorerSearchState.activeQuery = "projects";
      explorerSearchState.interruptedQuery = "older";
      explorerSearchState.results = [searchResult("node:projects")];
      explorerSearchState.status = target === "retry" ? "error" : "ready";
      explorerSearchState.resultScrollTop = 44;
      explorerSearchState.feedback = "stale-selection";
      const view = render(<HierarchyExplorer {...defaultProps} />);
      const control =
        target === "input"
          ? screen.getByRole("searchbox")
          : target === "result"
            ? explorerSearchResultRow()
            : target === "close"
              ? screen.getByRole("button", { name: "Clear and close Explorer search" })
              : target === "retry"
                ? screen.getByRole("button", { name: "Try again" })
                : screen.getByRole("button", { name: "Search Explorer" });
      fireEvent.keyDown(control, { key: "Escape" });
      view.rerender(<HierarchyExplorer {...defaultProps} />);

      expect(explorerSearchState.closeSearch).toHaveBeenCalledOnce();
      expect(explorerSearchState).toMatchObject({
        mode: "closed",
        activeQuery: null,
        interruptedQuery: null,
        results: [],
        resultScrollTop: 0,
        feedback: null,
        revealPresentation: null,
      });
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Search Explorer" })).toHaveFocus(),
      );
    },
  );

  it("clears interrupted search with Escape from an ordinary column without changing DnD focus ownership", () => {
    setGrid(null, [createNode({ id: "projects", title: "Projects" })]);
    explorerSearchState.mode = "interrupted";
    explorerSearchState.interruptedQuery = "projects";
    explorerSearchState.results = [searchResult("node:projects")];
    explorerSearchState.resultScrollTop = 31;
    const view = render(<HierarchyExplorer {...defaultProps} />);
    const row = screen.getByRole("button", { name: "Select Node: Projects" });
    row.focus();
    fireEvent.keyDown(row, { key: "Escape" });
    view.rerender(<HierarchyExplorer {...defaultProps} />);

    expect(explorerSearchState.closeSearch).toHaveBeenCalledOnce();
    expect(explorerSearchState.interruptedQuery).toBeNull();
    expect(screen.getByRole("button", { name: "Search Explorer" })).toHaveFocus();
  });

  it("lets DnD retain focus ownership when Escape clears interrupted search", () => {
    setGrid(null, [createNode({ id: "projects", title: "Projects" })]);
    explorerSearchState.mode = "interrupted";
    explorerSearchState.interruptedQuery = "projects";
    const drag: TriageDragItem = {
      kind: "triage-staged-node",
      id: "candidate",
      label: "Candidate",
    };
    const view = render(
      <HierarchyExplorer {...defaultProps} activeDragItem={drag} />,
    );
    const row = screen.getByRole("button", { name: "Select Node: Projects" });
    row.focus();
    fireEvent.keyDown(row, { key: "Escape" });
    view.rerender(<HierarchyExplorer {...defaultProps} activeDragItem={drag} />);

    expect(explorerSearchState.closeSearch).toHaveBeenCalledOnce();
    expect(row).toHaveFocus();
    expect(screen.getByRole("button", { name: "Search Explorer" })).not.toHaveFocus();
  });

  it.each([
    {
      label: "Scratch outside Explorer",
      mode: "active" as const,
      drag: null,
      shouldRestoreEntryFocus: true,
    },
    {
      label: "Staging DnD source outside Explorer",
      mode: "interrupted" as const,
      drag: {
        kind: "triage-staged-node" as const,
        id: "candidate",
        label: "Candidate",
      },
      shouldRestoreEntryFocus: false,
    },
  ])(
    "clears $mode search with Escape from $label",
    async ({ label, mode, drag, shouldRestoreEntryFocus }) => {
      explorerSearchState.mode = mode;
      explorerSearchState.activeQuery = mode === "active" ? "projects" : null;
      explorerSearchState.interruptedQuery =
        mode === "interrupted" ? "projects" : null;
      const view = render(
        <>
          <button type="button">{label}</button>
          <HierarchyExplorer {...defaultProps} activeDragItem={drag} />
        </>,
      );
      const outsideControl = screen.getByRole("button", { name: label });
      outsideControl.focus();

      fireEvent.keyDown(outsideControl, { key: "Escape" });
      view.rerender(
        <>
          <button type="button">{label}</button>
          <HierarchyExplorer {...defaultProps} activeDragItem={drag} />
        </>,
      );

      expect(explorerSearchState.closeSearch).toHaveBeenCalledOnce();
      if (shouldRestoreEntryFocus) {
        await waitFor(() =>
          expect(
            screen.getByRole("button", { name: "Search Explorer" }),
          ).toHaveFocus(),
        );
      } else {
        expect(outsideControl).toHaveFocus();
      }
    },
  );

  it("does not write Explorer path after pending selection completes post-unmount", async () => {
    explorerSearchState.mode = "active";
    explorerSearchState.activeQuery = "projects";
    const selected = searchResult("node:projects");
    explorerSearchState.results = [selected];
    explorerSearchState.status = "ready";
    let resolveSelection!: (value: { kind: "selected"; result: GridExplorerSearchResult }) => void;
    explorerSearchState.selectResult.mockReturnValue(
      new Promise((resolve) => {
        resolveSelection = resolve;
      }),
    );
    const view = render(<HierarchyExplorer {...defaultProps} />);
    fireEvent.click(explorerSearchResultRow());
    view.unmount();

    await act(async () => resolveSelection({ kind: "selected", result: selected }));

    expect(useTriageStore.getState().explorerPathIds).toEqual([]);
  });

  it("ends reveal on path change, DnD start, and search restart without a timer", async () => {
    const projects = createNode({ id: "projects", title: "Projects" });
    setGrid(null, [projects]);
    const selected = searchResult("node:projects");
    explorerSearchState.mode = "active";
    explorerSearchState.activeQuery = "projects";
    explorerSearchState.results = [selected];
    explorerSearchState.status = "ready";
    explorerSearchState.selectResult.mockImplementation(async () => {
      explorerSearchState.mode = "closed";
      explorerSearchState.activeQuery = null;
      explorerSearchState.results = [];
      explorerSearchState.revealPresentation = { kind: "revealed", result: selected };
      return { kind: "selected", result: selected };
    });
    const view = render(<HierarchyExplorer {...defaultProps} />);
    fireEvent.click(explorerSearchResultRow());
    await waitFor(() => expect(screen.getByText(/Revealed/)).toBeVisible());

    fireEvent.click(screen.getByRole("button", { name: "Search Explorer" }));
    view.rerender(<HierarchyExplorer {...defaultProps} />);
    expect(screen.queryByText(/Revealed/)).not.toBeInTheDocument();

    explorerSearchState.mode = "closed";
    view.rerender(<HierarchyExplorer {...defaultProps} />);
    useTriageStore.getState().setExplorerPathIds([projects.id]);
    view.rerender(
      <HierarchyExplorer
        {...defaultProps}
        activeDragItem={{ kind: "triage-staged-node", id: "candidate", label: "Candidate" }}
      />,
    );
    expect(screen.queryByText(/Revealed/)).not.toBeInTheDocument();
  });

  it("preserves search and reveal state across a Scratch switch without forcing focus", () => {
    explorerSearchState.mode = "active";
    explorerSearchState.activeQuery = "projects";
    explorerSearchState.resultScrollTop = 72;
    render(<HierarchyExplorer {...defaultProps} />);
    const home = screen.getByRole("button", { name: "Home" });
    home.focus();

    act(() => {
      useTriageStore.getState().selectScratch("scratch-2");
      expect(explorerSearchState.invalidatePendingSelection).toHaveBeenCalledOnce();
    });

    expect(explorerSearchState.mode).toBe("active");
    expect(explorerSearchState.activeQuery).toBe("projects");
    expect(explorerSearchState.resultScrollTop).toBe(72);
    expect(home).toHaveFocus();
  });

  it("preserves an existing reveal across a Scratch switch without restoring row focus", () => {
    const projects = createNode({ id: "projects", title: "Projects" });
    setGrid(null, [projects]);
    useTriageStore.setState({
      explorerPathIds: [projects.id],
      explorerOpenColumnIds: ["home", projects.id],
    });
    const revealed = searchResult("node:projects");
    explorerSearchState.revealPresentation = {
      kind: "revealed",
      result: revealed,
    };
    const view = render(<HierarchyExplorer {...defaultProps} />);
    const entry = screen.getByRole("button", { name: "Search Explorer" });
    entry.focus();

    useTriageStore.getState().selectScratch("scratch-2");
    view.rerender(<HierarchyExplorer {...defaultProps} />);

    expect(screen.getByText("Revealed “Projects” in Home.")).toBeVisible();
    expect(entry).toHaveFocus();
  });

  it("clears only a vanished revealed Bit, preserves its parent path, and focuses the parent row", async () => {
    const projects = createNode({ id: "projects", title: "Projects" });
    const note = createBit({ id: "note", parentId: projects.id, title: "Project note" });
    setGrid(null, [projects]);
    setGrid(projects.id, [], [note]);
    const selected = searchResult("bit:note", {
      title: note.title,
      breadcrumb: "Home / Projects",
      ancestorIds: [projects.id],
      nodePathIds: [projects.id],
    });
    explorerSearchState.mode = "active";
    explorerSearchState.activeQuery = "note";
    explorerSearchState.results = [selected];
    explorerSearchState.status = "ready";
    explorerSearchState.selectResult.mockImplementation(async () => {
      explorerSearchState.mode = "closed";
      explorerSearchState.activeQuery = null;
      explorerSearchState.results = [];
      explorerSearchState.revealPresentation = { kind: "revealed", result: selected };
      return { kind: "selected", result: selected };
    });
    const view = render(<HierarchyExplorer {...defaultProps} />);
    fireEvent.click(explorerSearchResultRow());
    await waitFor(() =>
      expect(document.querySelector('[data-explorer-item-id="note"]')).toHaveFocus(),
    );

    setGrid(projects.id, [], []);
    explorerSearchState.revealPresentation = {
      kind: "selection-cleared",
      id: note.id,
      title: note.title,
      nodePathIds: [projects.id],
    };
    view.rerender(<HierarchyExplorer {...defaultProps} />);

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "“Project note” is no longer available. Selection cleared.",
      ),
    );
    expect(useTriageStore.getState().explorerPathIds).toEqual([projects.id]);
    expect(screen.getByRole("button", { name: "Select Node: Projects" })).toHaveFocus();
    expect(screen.queryByText(/Revealed/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    view.rerender(<HierarchyExplorer {...defaultProps} />);
    expect(screen.queryByText(/Selection cleared/)).not.toBeInTheDocument();
  });

  it("defines static reduced-motion parity and all eight search theme role families", () => {
    for (const role of [
      "explorer-search-body",
      "explorer-search-field",
      "explorer-search-status",
      "explorer-search-results",
      "explorer-search-result",
      "explorer-revealed-row",
    ]) {
      expect(globalsCss).toContain(`.${role}`);
    }
    for (const theme of [
      "tiny-desk",
      "neumorphism",
      "claymorphism",
      "origami",
      "terminal",
      "retro-mac",
      "graphite",
    ]) {
      for (const role of [
        "explorer-search-entry",
        "explorer-search-field",
        "explorer-search-status",
        "explorer-search-result",
        "explorer-reveal-status",
      ]) {
        expect(globalsCss).toContain(
          `:root[data-color-theme="${theme}"] .${role}`,
        );
      }
    }
    expect(globalsCss).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.explorer-search-body[\s\S]*transition: none/,
    );
  });
});
