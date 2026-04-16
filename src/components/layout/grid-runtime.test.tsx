import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GRID_COLS } from "@/lib/constants";
import { useBreadcrumbZoneStore } from "@/stores/breadcrumb-zone-store";
import type { Bit, Node } from "@/types";
import { useAddFlow } from "./add-flow-context";
import { GridRuntime, useDeleteFlow } from "./grid-runtime";

const useParamsMock = vi.hoisted(() => vi.fn());
const useNodeMock = vi.hoisted(() => vi.fn());
const useDndMock = vi.hoisted(() => vi.fn());
const getDataStoreMock = vi.hoisted(() => vi.fn());
const runBreadcrumbZoneMigrationMock = vi.hoisted(() => vi.fn());
const getGridOccupancyMock = vi.hoisted(() => vi.fn());
const createNodeMock = vi.hoisted(() => vi.fn());
const createBitMock = vi.hoisted(() => vi.fn());
const softDeleteNodeMock = vi.hoisted(() => vi.fn());
const softDeleteBitMock = vi.hoisted(() => vi.fn());
const createNodeDialogSubmission = vi.hoisted(() => ({
  current: {
    title: "  New node  ",
    icon: "Folder",
    colorHex: "#ff0000",
    deadline: null as number | null,
    deadlineAllDay: false,
  },
}));

vi.mock("next/navigation", () => ({
  useParams: useParamsMock,
}));

vi.mock("@/hooks/use-node", () => ({
  useNode: useNodeMock,
}));

vi.mock("@/hooks/use-dnd", () => ({
  useDnd: useDndMock,
}));

vi.mock("@/hooks/use-grid-actions", () => ({
  useGridActions: () => ({
    getGridOccupancy: getGridOccupancyMock,
    createNode: createNodeMock,
    createBit: createBitMock,
    softDeleteNode: softDeleteNodeMock,
    softDeleteBit: softDeleteBitMock,
    runBreadcrumbZoneMigration: runBreadcrumbZoneMigrationMock,
  }),
}));

vi.mock("@/lib/db/datastore", () => ({
  getDataStore: getDataStoreMock,
}));

vi.mock("@/lib/utils/bfs", () => ({
  findNearestEmptyCell: vi.fn(),
}));

vi.mock("@/components/layout/sidebar", () => ({
  Sidebar: ({ onAddClick }: { onAddClick?: () => void }) => (
    <div>
      <button aria-label="sidebar-add" onClick={onAddClick} type="button">
        Add
      </button>
    </div>
  ),
}));

vi.mock("@/components/layout/breadcrumbs", async () => {
  const { forwardRef } = await import("react");

  return {
    Breadcrumbs: forwardRef<HTMLDivElement, { nodeId: string | null }>(
      function BreadcrumbsMock({ nodeId }, ref) {
        return (
          <div data-testid="breadcrumbs" ref={ref}>
            {nodeId ?? "root"}
          </div>
        );
      },
    ),
  };
});

vi.mock("@/components/grid/create-item-chooser", () => ({
  CreateItemChooser: ({
    open,
    onChooseBit,
    onChooseNode,
  }: {
    open: boolean;
    onChooseNode: () => void;
    onChooseBit: () => void;
  }) =>
    open ? (
      <div data-testid="create-item-chooser">
        <button aria-label="choose-node" onClick={onChooseNode} type="button">
          Choose node
        </button>
        <button aria-label="choose-bit" onClick={onChooseBit} type="button">
          Choose bit
        </button>
      </div>
    ) : null,
}));

vi.mock("@/components/grid/create-node-dialog", () => ({
  CreateNodeDialog: ({
    open,
    onSubmit,
    error,
  }: {
    open: boolean;
    onSubmit: (values: {
      title: string;
      icon: string;
      colorHex: string;
      deadline: number | null;
      deadlineAllDay: boolean;
    }) => Promise<void>;
    error?: string;
  }) =>
    open ? (
      <div>
        <button
          aria-label="submit-node"
          onClick={() => void onSubmit(createNodeDialogSubmission.current)}
          type="button"
        >
          Submit node
        </button>
        {error ? <div role="alert">{error}</div> : null}
      </div>
    ) : null,
}));

vi.mock("@/components/grid/create-bit-dialog", () => ({
  CreateBitDialog: ({
    open,
    onSubmit,
  }: {
    open: boolean;
    onSubmit: (values: {
      title: string;
      icon: string;
      deadline: number | null;
      deadlineAllDay: boolean;
      priority: Bit["priority"];
      description: string;
    }) => Promise<void>;
  }) =>
    open ? (
      <button
        aria-label="submit-bit"
        onClick={() =>
          void onSubmit({
            title: "  New bit  ",
            icon: "Box",
            deadline: null,
            deadlineAllDay: false,
            priority: "high",
            description: "Bit description",
          })
        }
        type="button"
      >
        Submit bit
      </button>
    ) : null,
}));

vi.mock("@/components/grid/edit-mode-overlay", () => ({
  EditModeOverlay: () => <div data-testid="edit-mode-overlay" />,
}));

vi.mock("@/components/grid/edit-node-dialog", () => ({
  EditNodeDialog: ({
    open,
    node,
  }: {
    open: boolean;
    node: Node | null;
  }) => (open ? <div data-testid="edit-node-dialog">{node?.id}</div> : null),
}));

function createNode(overrides: Partial<Node>): Node {
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
  };
}

function RuntimeProbe() {
  const { openAddAtCell } = useAddFlow();
  const { requestDelete } = useDeleteFlow();

  return (
    <div>
      <button
        aria-label="add-at-cell"
        onClick={() => openAddAtCell(4, 3)}
        type="button"
      >
        Add at cell
      </button>
      <button
        aria-label="add-at-blocked-cell"
        onClick={() => openAddAtCell(0, 0)}
        type="button"
      >
        Add at blocked cell
      </button>
      <button
        aria-label="request-bit-delete"
        onClick={() => requestDelete({ id: "bit-1", type: "bit", title: "Ship launch" })}
        type="button"
      >
        Delete bit
      </button>
      <button
        aria-label="request-node-delete"
        onClick={() => requestDelete({ id: "node-1", type: "node", title: "Roadmap" })}
        type="button"
      >
        Delete node
      </button>
    </div>
  );
}

function createRect(left: number, top: number, width: number, height: number): DOMRect {
  return new DOMRect(left, top, width, height);
}

describe("GridRuntime", () => {
  beforeEach(() => {
    useBreadcrumbZoneStore.setState({ blockedCells: new Set() });
    getDataStoreMock.mockResolvedValue({
      runBreadcrumbZoneMigration: runBreadcrumbZoneMigrationMock,
    });
    runBreadcrumbZoneMigrationMock.mockResolvedValue({ relocated: 0 });
    createNodeDialogSubmission.current = {
      title: "  New node  ",
      icon: "Folder",
      colorHex: "#ff0000",
      deadline: null,
      deadlineAllDay: false,
    };
    vi.stubGlobal(
      "ResizeObserver",
      class ResizeObserver {
        constructor(private readonly callback: ResizeObserverCallback) {}

        disconnect() {}

        observe() {
          this.callback([], this);
        }

        unobserve() {}
      },
    );
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this instanceof HTMLDivElement && this.dataset.testid === "breadcrumbs") {
        return createRect(12, 12, 90, 50);
      }

      if (
        this instanceof HTMLDivElement &&
        typeof this.className === "string" &&
        this.className.includes("h-full overflow-x-hidden")
      ) {
        return createRect(0, 0, 1936, 964);
      }

      return createRect(0, 0, 0, 0);
    });
    useDndMock.mockReturnValue({
      sensors: [],
      handleDragStart: vi.fn(),
      handleDragEnd: vi.fn(),
      handleDragOver: vi.fn(),
      handleConflictUpdateParent: vi.fn(),
      handleConflictKeepChild: vi.fn(),
      handleNodeMoveConfirm: vi.fn(),
      handleNodeMoveCancel: vi.fn(),
      handleAncestorMoveConfirm: vi.fn(),
      handleAncestorMoveCancel: vi.fn(),
      activeItem: null,
      overTargetId: null,
      conflictState: {
        open: false,
        parentBitId: null,
        parentDeadline: Date.now(),
        parentDeadlineAllDay: false,
        pendingChunkId: null,
        pendingTimestamp: null,
      },
      pendingNodeMove: null,
      pendingAncestorMove: null,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("creates a root node from sidebar add and confirms bit deletion through context", async () => {
    const { findNearestEmptyCell } = await import("@/lib/utils/bfs");

    useParamsMock.mockReturnValue({});
    useNodeMock.mockReturnValue(null);
    getGridOccupancyMock.mockResolvedValue(new Set(["0,0"]));
    createNodeMock.mockResolvedValue(createNode({ id: "created-root" }));
    vi.mocked(findNearestEmptyCell).mockReturnValue({ x: 1, y: 1 });

    render(
      <GridRuntime>
        <RuntimeProbe />
      </GridRuntime>,
    );

    expect(screen.getByTestId("breadcrumbs").parentElement).toHaveClass(
      "pointer-events-none",
      "w-full",
    );
    expect(screen.getByTestId("breadcrumbs").parentElement?.parentElement).toHaveClass(
      "pointer-events-none",
      "absolute",
      "top-3",
      "left-3",
      "right-3",
      "z-30",
      "flex",
      "flex-col",
      "gap-1.5",
      "items-start",
    );
    expect(screen.getByTestId("display-level")).toHaveAttribute("data-level", "0");
    expect(screen.getByTestId("breadcrumbs")).toHaveTextContent("root");
    expect(screen.getByLabelText("add-at-cell").parentElement?.parentElement).toHaveClass(
      "h-full",
      "overflow-y-auto",
      "overflow-x-hidden",
    );

    fireEvent.click(screen.getByLabelText("sidebar-add"));
    fireEvent.click(screen.getByLabelText("submit-node"));

    await waitFor(() => {
      expect(createNodeMock).toHaveBeenCalledWith({
        title: "New node",
        color: "hsl(0, 100%, 50%)",
        icon: "Folder",
        deadline: null,
        deadlineAllDay: false,
        parentId: null,
        level: 0,
        x: 1,
        y: 1,
      });
    });
    expect(getGridOccupancyMock).toHaveBeenCalledWith(null);
    expect(vi.mocked(findNearestEmptyCell)).toHaveBeenCalledWith(
      new Set(["0,0"]),
      2,
      2,
      new Set(["0,0"]),
    );

    fireEvent.click(screen.getByLabelText("request-bit-delete"));
    expect(
      screen.getByText("This action cannot be undone."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(softDeleteBitMock).toHaveBeenCalledWith("bit-1");
    });
  });

  it("runs breadcrumb migration once per parent and refreshes the parent id on navigation", async () => {
    useParamsMock.mockReturnValue({});
    useNodeMock.mockReturnValue(null);

    const { rerender } = render(
      <GridRuntime>
        <RuntimeProbe />
      </GridRuntime>,
    );

    await waitFor(() => {
      expect(runBreadcrumbZoneMigrationMock).toHaveBeenCalledTimes(1);
    });
    expect(runBreadcrumbZoneMigrationMock).toHaveBeenNthCalledWith(
      1,
      null,
      new Set(["0,0"]),
    );

    const parentNode = createNode({ id: "parent-node", level: 0 });
    useParamsMock.mockReturnValue({ nodeId: parentNode.id });
    useNodeMock.mockReturnValue(parentNode);

    rerender(
      <GridRuntime>
        <RuntimeProbe />
      </GridRuntime>,
    );

    await waitFor(() => {
      expect(runBreadcrumbZoneMigrationMock).toHaveBeenCalledTimes(2);
    });
    expect(runBreadcrumbZoneMigrationMock).toHaveBeenNthCalledWith(
      2,
      parentNode.id,
      new Set(["0,0"]),
    );
  });

  it("uses chooser and cell placement when creating a child node inside a non-leaf grid", async () => {
    const { findNearestEmptyCell } = await import("@/lib/utils/bfs");
    const parentNode = createNode({
      id: "parent-node",
      level: 0,
      color: "hsl(140, 70%, 45%)",
    });

    useParamsMock.mockReturnValue({ nodeId: parentNode.id });
    useNodeMock.mockReturnValue(parentNode);
    getGridOccupancyMock.mockResolvedValue(new Set(["1,1"]));
    createNodeMock.mockResolvedValue(createNode({ id: "child-node", parentId: parentNode.id }));
    vi.mocked(findNearestEmptyCell).mockReturnValue({ x: 5, y: 6 });

    render(
      <GridRuntime>
        <RuntimeProbe />
      </GridRuntime>,
    );

    expect(screen.getByTestId("display-level")).toHaveAttribute("data-level", "1");
    expect(screen.getByTestId("breadcrumbs")).toHaveTextContent(parentNode.id);
    expect(screen.getByTestId("breadcrumbs").parentElement?.parentElement).toHaveClass(
      "pointer-events-none",
      "absolute",
      "top-3",
      "left-3",
      "z-30",
    );

    fireEvent.click(screen.getByLabelText("add-at-cell"));
    fireEvent.click(screen.getByLabelText("choose-node"));
    fireEvent.click(screen.getByLabelText("submit-node"));

    await waitFor(() => {
      expect(createNodeMock).toHaveBeenCalledWith({
        title: "New node",
        color: "hsl(0, 100%, 50%)",
        icon: "Folder",
        deadline: null,
        deadlineAllDay: false,
        parentId: parentNode.id,
        level: 1,
        x: 5,
        y: 6,
      });
    });
    expect(vi.mocked(findNearestEmptyCell)).toHaveBeenCalledWith(
      new Set(["1,1"]),
      4,
      3,
      new Set(["0,0"]),
    );
  });

  it("passes create-node deadline values through to createNode", async () => {
    const { findNearestEmptyCell } = await import("@/lib/utils/bfs");
    const parentNode = createNode({
      id: "parent-node",
      level: 0,
      deadline: new Date(2026, 3, 30, 0, 0).getTime(),
      deadlineAllDay: true,
    });
    const childDeadline = new Date(2026, 3, 24, 9, 30).getTime();

    createNodeDialogSubmission.current = {
      title: "  New node  ",
      icon: "Folder",
      colorHex: "#ff0000",
      deadline: childDeadline,
      deadlineAllDay: false,
    };
    useParamsMock.mockReturnValue({ nodeId: parentNode.id });
    useNodeMock.mockReturnValue(parentNode);
    getGridOccupancyMock.mockResolvedValue(new Set(["2,2"]));
    createNodeMock.mockResolvedValue(createNode({ id: "child-node", parentId: parentNode.id }));
    vi.mocked(findNearestEmptyCell).mockReturnValue({ x: 6, y: 4 });

    render(
      <GridRuntime>
        <RuntimeProbe />
      </GridRuntime>,
    );

    fireEvent.click(screen.getByLabelText("add-at-cell"));
    fireEvent.click(screen.getByLabelText("choose-node"));
    fireEvent.click(screen.getByLabelText("submit-node"));

    await waitFor(() => {
      expect(createNodeMock).toHaveBeenCalledWith({
        title: "New node",
        color: "hsl(0, 100%, 50%)",
        icon: "Folder",
        deadline: childDeadline,
        deadlineAllDay: false,
        parentId: parentNode.id,
        level: 1,
        x: 6,
        y: 4,
      });
    });
  });

  it("blocks child node creation when the deadline exceeds the parent deadline", async () => {
    const parentNode = createNode({
      id: "parent-node",
      level: 0,
      deadline: new Date(2026, 3, 20, 0, 0).getTime(),
      deadlineAllDay: true,
    });

    createNodeDialogSubmission.current = {
      title: "  New node  ",
      icon: "Folder",
      colorHex: "#ff0000",
      deadline: new Date(2026, 3, 21, 10, 0).getTime(),
      deadlineAllDay: false,
    };
    useParamsMock.mockReturnValue({ nodeId: parentNode.id });
    useNodeMock.mockReturnValue(parentNode);

    render(
      <GridRuntime>
        <RuntimeProbe />
      </GridRuntime>,
    );

    fireEvent.click(screen.getByLabelText("add-at-cell"));
    fireEvent.click(screen.getByLabelText("choose-node"));
    fireEvent.click(screen.getByLabelText("submit-node"));

    expect(createNodeMock).not.toHaveBeenCalled();
    expect(getGridOccupancyMock).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Node deadline cannot exceed parent deadline.",
    );
  });

  it("creates a bit directly on leaf grids and uses the updated top-right inset origin", async () => {
    const { findNearestEmptyCell } = await import("@/lib/utils/bfs");
    const leafNode = createNode({ id: "leaf-node", level: 2 });

    useParamsMock.mockReturnValue({ nodeId: leafNode.id });
    useNodeMock.mockReturnValue(leafNode);
    getGridOccupancyMock.mockResolvedValue(new Set(["10,1"]));
    createBitMock.mockResolvedValue({
      id: "created-bit",
      title: "New bit",
      description: "Bit description",
      icon: "Box",
      deadline: null,
      deadlineAllDay: false,
      priority: "high",
      status: "active",
      mtime: 1,
      createdAt: 1,
      parentId: leafNode.id,
      x: 9,
      y: 1,
      deletedAt: null,
    });
    vi.mocked(findNearestEmptyCell).mockReturnValue({ x: 9, y: 1 });

    render(
      <GridRuntime>
        <RuntimeProbe />
      </GridRuntime>,
    );

    expect(screen.getByTestId("display-level")).toHaveAttribute("data-level", "3");

    fireEvent.click(screen.getByLabelText("sidebar-add"));
    fireEvent.click(screen.getByLabelText("submit-bit"));

    await waitFor(() => {
      expect(createBitMock).toHaveBeenCalledWith({
        title: "New bit",
        description: "Bit description",
        icon: "Box",
        deadline: null,
        deadlineAllDay: false,
        priority: "high",
        parentId: leafNode.id,
        x: 9,
        y: 1,
      });
    });
    expect(vi.mocked(findNearestEmptyCell)).toHaveBeenCalledWith(
      new Set(["10,1"]),
      GRID_COLS - 3,
      2,
      new Set(["0,0"]),
    );
  });

  it("clips the grid scroll wrapper while a drag is active", () => {
    useParamsMock.mockReturnValue({});
    useNodeMock.mockReturnValue(null);

    useDndMock.mockReturnValue({
      sensors: [],
      handleDragStart: vi.fn(),
      handleDragEnd: vi.fn(),
      handleDragOver: vi.fn(),
      handleConflictUpdateParent: vi.fn(),
      handleConflictKeepChild: vi.fn(),
      handleNodeMoveConfirm: vi.fn(),
      handleNodeMoveCancel: vi.fn(),
      handleAncestorMoveConfirm: vi.fn(),
      handleAncestorMoveCancel: vi.fn(),
      activeItem: {
        id: "bit-1",
        type: "bit",
        title: "Ship launch",
      },
      overTargetId: null,
      conflictState: {
        open: false,
        parentBitId: null,
        parentDeadline: Date.now(),
        parentDeadlineAllDay: false,
        pendingChunkId: null,
        pendingTimestamp: null,
      },
      pendingNodeMove: null,
      pendingAncestorMove: null,
    });

    render(
      <GridRuntime>
        <RuntimeProbe />
      </GridRuntime>,
    );

    const scrollWrapper = screen.getByLabelText("add-at-cell").parentElement?.parentElement;
    expect(scrollWrapper).toHaveAttribute("data-dragging", "true");
    expect(scrollWrapper).toHaveClass("overflow-hidden");
    expect(scrollWrapper).not.toHaveClass("overflow-y-auto");
  });

  it("makes openAddAtCell a no-op for blocked cells", () => {
    useParamsMock.mockReturnValue({});
    useNodeMock.mockReturnValue(null);
    useBreadcrumbZoneStore.setState({ blockedCells: new Set(["0,0"]) });

    render(
      <GridRuntime>
        <RuntimeProbe />
      </GridRuntime>,
    );

    fireEvent.click(screen.getByLabelText("add-at-blocked-cell"));

    expect(screen.queryByLabelText("submit-node")).not.toBeInTheDocument();
    expect(screen.queryByTestId("create-item-chooser")).not.toBeInTheDocument();
  });

  it("shows a move confirmation dialog when a pending node move exists", () => {
    useParamsMock.mockReturnValue({});
    useNodeMock.mockReturnValue(null);

    const handleNodeMoveConfirm = vi.fn();
    const handleNodeMoveCancel = vi.fn();

    useDndMock.mockReturnValue({
      sensors: [],
      handleDragStart: vi.fn(),
      handleDragEnd: vi.fn(),
      handleDragOver: vi.fn(),
      handleConflictUpdateParent: vi.fn(),
      handleConflictKeepChild: vi.fn(),
      handleNodeMoveConfirm,
      handleNodeMoveCancel,
      handleAncestorMoveConfirm: vi.fn(),
      handleAncestorMoveCancel: vi.fn(),
      activeItem: null,
      overTargetId: null,
      conflictState: {
        open: false,
        parentBitId: null,
        parentDeadline: Date.now(),
        parentDeadlineAllDay: false,
        pendingChunkId: null,
        pendingTimestamp: null,
      },
      pendingNodeMove: {
        itemId: "node-1",
        itemType: "node",
        itemTitle: "Roadmap",
        targetNodeId: "node-2",
        targetNodeTitle: "Q2",
      },
      pendingAncestorMove: null,
    });

    render(
      <GridRuntime>
        <RuntimeProbe />
      </GridRuntime>,
    );

    expect(screen.getByText("Move into 'Q2'?")).toBeInTheDocument();
    expect(screen.getByText("'Roadmap' will be moved into this node.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Move" }));
    expect(handleNodeMoveConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(handleNodeMoveCancel).toHaveBeenCalledTimes(1);
  });
});
