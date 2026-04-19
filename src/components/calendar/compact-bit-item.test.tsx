import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Bit, Chunk } from "@/types";
import { CompactBitItem } from "./compact-bit-item";

const setNodeRefMock = vi.hoisted(() => vi.fn());
const useDraggableMock = vi.hoisted(() => vi.fn());

vi.mock("@dnd-kit/core", () => ({
  useDraggable: useDraggableMock,
}));

vi.mock("lucide-react", () => {
  function createIcon(name: string) {
    return ({ className }: { className?: string }) => (
      <svg
        className={className}
        data-icon={name}
      />
    );
  }

  return {
    GripVertical: createIcon("GripVertical"),
    Trash2: createIcon("Trash2"),
    X: createIcon("X"),
  };
});

function createBit(overrides: Partial<Bit> = {}): Bit {
  const timestamp = overrides.createdAt ?? 1_700_000_000_000;

  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Bit",
    description: overrides.description ?? "",
    icon: overrides.icon ?? "Box",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    priority: overrides.priority ?? null,
    status: overrides.status ?? "active",
    mtime: overrides.mtime ?? timestamp,
    createdAt: timestamp,
    parentId: overrides.parentId ?? "node-1",
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
  };
}

function createChunk(overrides: Partial<Chunk> = {}): Chunk {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Chunk",
    description: overrides.description ?? "",
    time: overrides.time ?? null,
    timeAllDay: overrides.timeAllDay ?? false,
    status: overrides.status ?? "incomplete",
    order: overrides.order ?? 0,
    parentId: overrides.parentId ?? "bit-1",
  };
}

beforeEach(() => {
  useDraggableMock.mockReturnValue({
    attributes: { "data-drag-source": "true" },
    listeners: {},
    setNodeRef: setNodeRefMock,
    transform: null,
    isDragging: false,
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("CompactBitItem", () => {
  it("renders the pool variant as the full drag surface with the trash icon action", () => {
    const bit = createBit({ id: "bit-1", title: "Pool Bit" });
    const onUnschedule = vi.fn();

    render(
      <CompactBitItem
        item={bit}
        onClick={vi.fn()}
        onUnschedule={onUnschedule}
        parentColor="hsl(221, 83%, 53%)"
        variant="pool"
      />,
    );

    const openButton = screen.getByRole("button", { name: "Open Pool Bit" });
    const root = openButton.closest('[data-drag-source="true"]');
    const unscheduleButton = screen.getByRole("button", { name: "Unschedule Pool Bit" });

    expect(useDraggableMock).toHaveBeenCalledWith({
      id: "bit-1",
      data: {
        id: "bit-1",
        type: "bit",
        title: "Pool Bit",
        parentId: "node-1",
      },
    });
    expect(root).toHaveAttribute("data-drag-source", "true");
    expect(root).toHaveClass("cursor-grab");
    expect(openButton).toHaveClass("cursor-pointer");
    expect(root?.querySelector('[data-icon="GripVertical"]')).toBeNull();
    expect(unscheduleButton).toHaveClass(
      "h-8",
      "w-8",
      "rounded-md",
      "cursor-pointer",
      "text-muted-foreground/40",
      "transition-colors",
      "hover:bg-destructive/10",
      "hover:text-destructive",
    );
    expect(unscheduleButton.querySelector('[data-icon="Trash2"]')).toBeInTheDocument();
    expect(screen.queryByText("✕")).not.toBeInTheDocument();

    fireEvent.click(unscheduleButton);

    expect(onUnschedule).toHaveBeenCalledTimes(1);
  });

  it("renders the placed variant with the x action and dragging affordances", () => {
    useDraggableMock.mockReturnValue({
      attributes: { "data-drag-source": "true" },
      listeners: {},
      setNodeRef: setNodeRefMock,
      transform: { x: 12, y: 8 },
      isDragging: true,
    });

    const chunk = createChunk({ id: "chunk-1", title: "Placed Chunk" });

    render(
      <CompactBitItem
        item={chunk}
        onClick={vi.fn()}
        onUnschedule={vi.fn()}
        parentColor="hsl(142, 76%, 36%)"
        variant="placed"
      />,
    );

    const openButton = screen.getByRole("button", { name: "Open Placed Chunk" });
    const root = openButton.closest('[data-drag-source="true"]');
    const unscheduleButton = screen.getByRole("button", {
      name: "Unschedule Placed Chunk",
    });

    expect(useDraggableMock).toHaveBeenCalledWith({
      id: "chunk-1",
      data: {
        id: "chunk-1",
        type: "chunk",
        title: "Placed Chunk",
        parentId: "bit-1",
      },
    });
    expect(root).toHaveClass("cursor-grabbing", "opacity-40");
    expect(root).toHaveStyle({ transform: "translate3d(12px, 8px, 0)" });
    expect(root?.querySelector('[data-icon="GripVertical"]')).toBeNull();
    expect(unscheduleButton).toHaveClass("h-8", "w-8", "rounded-md", "cursor-pointer");
    expect(unscheduleButton.querySelector('[data-icon="X"]')).toBeInTheDocument();
    expect(unscheduleButton.querySelector('[data-icon="Trash2"]')).toBeNull();
  });
});
