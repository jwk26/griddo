import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { indexedDBStore } from "@/lib/db/indexeddb";
import { findNearestEmptyCell } from "@/lib/utils/bfs";
import type { Bit, Node } from "@/types";
import { NodeGridShell } from "./node-grid-shell";

vi.mock("@/components/layout/sidebar", () => ({
  Sidebar: ({
    level,
    onAddClick,
  }: {
    level?: number;
    onAddClick?: () => void;
  }) => (
    <div>
      <div data-testid="sidebar-level">{level ?? 0}</div>
      {onAddClick ? (
        <button aria-label="sidebar-add" onClick={onAddClick} type="button">
          Add
        </button>
      ) : null}
    </div>
  ),
}));

vi.mock("@/components/layout/breadcrumbs", () => ({
  Breadcrumbs: ({ nodeId }: { nodeId: string }) => (
    <div data-testid="breadcrumbs">{nodeId}</div>
  ),
}));

vi.mock("@/components/grid/grid-view", () => ({
  GridView: ({
    level,
    onAddAtCell,
    parentColor,
  }: {
    level: number;
    onAddAtCell?: (x: number, y: number) => void;
    parentColor?: string;
  }) => (
    <div data-level={level} data-parent-color={parentColor} data-testid="grid-view">
      {onAddAtCell ? (
        <button
          aria-label="grid-add"
          onClick={() => onAddAtCell(5, 6)}
          type="button"
        >
          Add at cell
        </button>
      ) : null}
    </div>
  ),
}));

vi.mock("@/components/grid/create-bit-dialog", () => ({
  CreateBitDialog: ({
    open,
    onSubmit,
  }: {
    open: boolean;
    onSubmit: (values: { title: string; icon: string }) => Promise<void>;
  }) =>
    open ? (
      <button
        aria-label="bit-dialog-submit"
        onClick={() => void onSubmit({ title: "New bit", icon: "Box" })}
        type="button"
      >
        Submit
      </button>
    ) : null,
}));

vi.mock("@/components/grid/create-node-dialog", () => ({
  CreateNodeDialog: ({
    open,
    onSubmit,
  }: {
    open: boolean;
    onSubmit: (values: { title: string; icon: string; colorHex: string }) => Promise<void>;
  }) =>
    open ? (
      <button
        aria-label="dialog-submit"
        onClick={() => void onSubmit({ title: "Child node", icon: "Folder", colorHex: "#ff0000" })}
        type="button"
      >
        Submit
      </button>
    ) : null,
}));

vi.mock("@/components/grid/edit-mode-overlay", () => ({
  EditModeOverlay: () => <div data-testid="edit-mode-overlay" />,
}));

vi.mock("@/lib/db/indexeddb", () => ({
  indexedDBStore: {
    getGridOccupancy: vi.fn(),
    getNode: vi.fn(),
    createNode: vi.fn(),
    createBit: vi.fn(),
  },
}));

vi.mock("@/lib/utils/bfs", () => ({
  findNearestEmptyCell: vi.fn(),
}));

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
    parentId: overrides.parentId ?? "parent-node",
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
  };
}

function createNode(overrides: Partial<Node>): Node {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Node",
    description: overrides.description ?? "",
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

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("NodeGridShell", () => {
  it("creates a child node from a selected grid cell on non-leaf levels", async () => {
    const node = createNode({
      id: "parent-node",
      level: 0,
      color: "hsl(140, 70%, 45%)",
    });
    const getNodeMock = vi.mocked(indexedDBStore.getNode);
    const getGridOccupancyMock = vi.mocked(indexedDBStore.getGridOccupancy);
    const createNodeMock = vi.mocked(indexedDBStore.createNode);
    const findNearestEmptyCellMock = vi.mocked(findNearestEmptyCell);

    getNodeMock.mockResolvedValue(node);
    getGridOccupancyMock.mockResolvedValue(new Set(["0,0"]));
    createNodeMock.mockResolvedValue(
      createNode({
        id: "created-node",
        parentId: node.id,
        level: 1,
      }),
    );
    findNearestEmptyCellMock.mockReturnValue({ x: 7, y: 1 });

    render(<NodeGridShell nodeId={node.id} />);

    await waitFor(() => {
      expect(screen.getByTestId("grid-view")).toHaveAttribute("data-level", "1");
    });
    expect(screen.getByTestId("grid-view")).toHaveAttribute(
      "data-parent-color",
      "hsl(140, 70%, 45%)",
    );
    expect(screen.getByLabelText("sidebar-add")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("grid-add"));
    fireEvent.click(await screen.findByLabelText("dialog-submit"));

    await waitFor(() => {
      expect(createNodeMock).toHaveBeenCalledWith({
        color: "hsl(0, 100%, 50%)",
        deadline: null,
        deadlineAllDay: false,
        description: "",
        icon: "Folder",
        level: 1,
        parentId: node.id,
        title: "Child node",
        x: 7,
        y: 1,
      });
    });
    expect(getGridOccupancyMock).toHaveBeenCalledWith(node.id);
    expect(findNearestEmptyCellMock).toHaveBeenCalledWith(new Set(["0,0"]), 5, 6);
  });

  it("shows bit creation controls at leaf level, not node creation", async () => {
    vi.mocked(indexedDBStore.getNode).mockResolvedValue(
      createNode({ id: "leaf-node", level: 2 }),
    );

    render(<NodeGridShell nodeId="leaf-node" />);

    await waitFor(() => {
      expect(screen.getByTestId("grid-view")).toHaveAttribute("data-level", "3");
    });

    expect(screen.getByLabelText("sidebar-add")).toBeInTheDocument();
    expect(screen.getByLabelText("grid-add")).toBeInTheDocument();
    expect(screen.queryByLabelText("dialog-submit")).not.toBeInTheDocument();
  });

  it("creates a bit with explicit payload at leaf level", async () => {
    const node = createNode({ id: "leaf-node", level: 2 });
    vi.mocked(indexedDBStore.getNode).mockResolvedValue(node);
    vi.mocked(indexedDBStore.getGridOccupancy).mockResolvedValue(new Set(["0,0"]));
    vi.mocked(indexedDBStore.createBit).mockResolvedValue(createBit({ parentId: node.id }));
    vi.mocked(findNearestEmptyCell).mockReturnValue({ x: 3, y: 4 });

    render(<NodeGridShell nodeId={node.id} />);

    await waitFor(() => {
      expect(screen.getByTestId("grid-view")).toHaveAttribute("data-level", "3");
    });

    fireEvent.click(screen.getByLabelText("grid-add"));
    fireEvent.click(await screen.findByLabelText("bit-dialog-submit"));

    await waitFor(() => {
      expect(vi.mocked(indexedDBStore.createBit)).toHaveBeenCalledWith({
        title: "New bit",
        description: "",
        icon: "Box",
        deadline: null,
        deadlineAllDay: false,
        priority: null,
        parentId: node.id,
        x: 3,
        y: 4,
      });
    });
    expect(vi.mocked(findNearestEmptyCell)).toHaveBeenCalledWith(new Set(["0,0"]), 5, 6);
  });
});
