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
import { HierarchyExplorer } from "./hierarchy-explorer";

const globalsCss = readFileSync(
  join(process.cwd(), "src/app/globals.css"),
  "utf8",
);

const useExplorerRemoteStatusMock = vi.hoisted(() => vi.fn());

vi.mock("@dnd-kit/core", () => ({
  useDroppable: vi.fn().mockReturnValue({ setNodeRef: vi.fn() }),
}));

vi.mock("@/hooks/use-grid-data", () => ({
  useGridData: vi.fn(),
}));

vi.mock("@/hooks/use-explorer-remote-status", () => ({
  useExplorerRemoteStatus: useExplorerRemoteStatusMock,
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

const defaultProps: {
  activeDragItem: TriageDragItem;
  onPendingPlacementInvalidated: (dropId: string) => void;
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
    const onPendingPlacementInvalidated = vi.fn();

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
      explorerRemoteArrivalIds: { home: [remote.id] },
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
      explorerRemoteArrivalIds: { home: [remote.id] },
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
      explorerRemoteArrivalIds: { [home.id]: [remoteBit.id] },
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
    setGrid(null, [home]);
    setGrid(home.id, []);
    useTriageStore.setState({
      explorerPathIds: [home.id],
      explorerOpenColumnIds: ["home", home.id],
    });
    render(
      <HierarchyExplorer
        {...defaultProps}
        pendingPlacementDropId={getTriageHierarchyDropId("missing")}
      />,
    );

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Placement closed because this Explorer path changed.",
      ),
    );
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
    }
    expect(globalsCss).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.explorer-remote-count[\s\S]*transition: none/,
    );
  });
});
