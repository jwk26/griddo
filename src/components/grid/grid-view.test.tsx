import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GRID_COLS, GRID_ROWS } from "@/lib/constants";
import { useEditModeStore } from "@/stores/edit-mode-store";
import type { Bit, Node } from "@/types";
import { GridView } from "./grid-view";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/grid/parent-node",
  useRouter: () => ({ push }),
}));

vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      animate,
      children,
      ...props
    }: {
      animate?: string;
      children?: React.ReactNode;
      className?: string;
      style?: React.CSSProperties;
    }) => (
      <div data-motion-animate={animate} {...props}>
        {children}
      </div>
    ),
  },
}));

vi.mock("@/hooks/use-grid-data", () => ({
  useGridData: vi.fn(),
}));

const { useGridData } = await import("@/hooks/use-grid-data");

function createBit(overrides: Partial<Bit>): Bit {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Bit",
    description: overrides.description ?? "",
    icon: overrides.icon ?? "Folder",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    priority: overrides.priority ?? null,
    status: overrides.status ?? "active",
    mtime: overrides.mtime ?? Date.now(),
    createdAt: overrides.createdAt ?? Date.now(),
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
    color: overrides.color ?? "hsl(221, 83%, 53%)",
    icon: overrides.icon ?? "Folder",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    mtime: overrides.mtime ?? Date.now(),
    createdAt: overrides.createdAt ?? Date.now(),
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
  useEditModeStore.setState({ isEditMode: false });
});

describe("GridView", () => {
  it("renders bits as clickable bit cards and applies the level background token", () => {
    vi.mocked(useGridData).mockReturnValue({
      nodes: [],
      bits: [
        createBit({
          id: "bit-1",
          title: "Ship Phase 4",
          deadline: new Date("2027-01-01T00:00:00.000Z").getTime(),
        }),
      ],
      isLoading: false,
    });
    const { container } = render(
      <GridView
        level={2}
        onAddAtCell={vi.fn()}
        parentColor="hsl(12, 78%, 55%)"
        parentId="parent-node"
      />,
    );

    fireEvent.click(screen.getByText("Ship Phase 4").closest('[role="button"]')!);

    expect(push).toHaveBeenCalledWith("/grid/parent-node?bit=bit-1");
    expect(container.firstChild).toHaveStyle({
      backgroundColor: "hsl(var(--grid-bg-l2))",
    });
  });

  it("routes delete requests from node and bit cards", () => {
    useEditModeStore.setState({ isEditMode: true });
    const handleDelete = vi.fn();
    const node = createNode({
      id: "node-1",
      title: "Roadmap",
      level: 1,
    });
    const bit = createBit({
      id: "bit-1",
      title: "Ship Phase 4",
      x: 1,
    });

    vi.mocked(useGridData).mockReturnValue({
      nodes: [node],
      bits: [bit],
      isLoading: false,
    });

    render(
      <GridView
        level={1}
        onAddAtCell={vi.fn()}
        onDelete={handleDelete}
        parentColor="hsl(12, 78%, 55%)"
        parentId="parent-node"
      />,
    );

    fireEvent.click(screen.getByLabelText("Delete Roadmap"));
    fireEvent.click(screen.getByLabelText("Delete Ship Phase 4"));

    expect(handleDelete).toHaveBeenNthCalledWith(1, {
      id: "node-1",
      type: "node",
      title: "Roadmap",
    });
    expect(handleDelete).toHaveBeenNthCalledWith(2, {
      id: "bit-1",
      type: "bit",
      title: "Ship Phase 4",
    });
  });

  it("renders grid-cell-container class on every cell wrapper", () => {
    vi.mocked(useGridData).mockReturnValue({
      nodes: [],
      bits: [],
      isLoading: false,
    });

    const { container } = render(
      <GridView
        level={0}
        onAddAtCell={vi.fn()}
        parentId={null}
      />,
    );

    const cellWrappers = container.querySelectorAll(".grid-cell-container");
    expect(cellWrappers).toHaveLength(GRID_COLS * GRID_ROWS);
  });

  it("puts the draggable contract on the visible bit-card surface", () => {
    vi.mocked(useGridData).mockReturnValue({
      nodes: [],
      bits: [
        createBit({
          id: "bit-1",
          title: "Ship Phase 4",
        }),
      ],
      isLoading: false,
    });

    render(
      <GridView
        level={1}
        onAddAtCell={vi.fn()}
        parentColor="hsl(12, 78%, 55%)"
        parentId="parent-node"
      />,
    );

    const bitCard = screen.getByText("Ship Phase 4").closest('[role="button"]');

    expect(bitCard).not.toBeNull();
    expect(bitCard).toHaveAttribute("data-grid-item", "true");
    expect(bitCard).toHaveClass("cursor-grab", "active:cursor-grabbing", "select-none");
  });
});
