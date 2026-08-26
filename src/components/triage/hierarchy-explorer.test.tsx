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

  it("replaces a path fallback with the exact stale-placement strip when the pending target disappears", async () => {
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
      (_dropId: string, focusAfterClose: () => void) => focusAfterClose(),
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

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Placement closed because this Explorer path changed.",
      ),
    );
    expect(homeButton).toHaveFocus();
  });

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
