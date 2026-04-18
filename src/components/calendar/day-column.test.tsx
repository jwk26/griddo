import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Bit, Node } from "@/types";
import { DayColumn } from "./day-column";

const pushMock = vi.hoisted(() => vi.fn());
const unscheduleBitMock = vi.hoisted(() => vi.fn());
const unscheduleChunkMock = vi.hoisted(() => vi.fn());
const unscheduleNodeMock = vi.hoisted(() => vi.fn());

type MotionDivProps = React.ComponentProps<"div"> & {
  animate?: unknown;
  initial?: unknown;
  layout?: unknown;
  transition?: unknown;
  variants?: unknown;
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: MotionDivProps) => {
      const divProps = { ...props };
      delete divProps.animate;
      delete divProps.initial;
      delete divProps.layout;
      delete divProps.transition;
      delete divProps.variants;
      return <div {...divProps}>{children}</div>;
    },
  },
  useReducedMotion: () => false,
}));

vi.mock("@dnd-kit/core", () => ({
  useDroppable: () => ({ isOver: false, setNodeRef: vi.fn() }),
}));

vi.mock("@/hooks/use-calendar-actions", () => ({
  useCalendarActions: () => ({
    unscheduleBit: unscheduleBitMock,
    unscheduleChunk: unscheduleChunkMock,
    unscheduleNode: unscheduleNodeMock,
  }),
}));

vi.mock("./compact-bit-item", () => ({
  CompactBitItem: ({ item }: { item: { title: string } }) => <div>{item.title}</div>,
}));

function createNode(overrides: Partial<Node> = {}): Node {
  const timestamp = overrides.createdAt ?? 1_700_000_000_000;

  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Node",
    color: overrides.color ?? "hsl(221, 83%, 53%)",
    icon: overrides.icon ?? "Folder",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    mtime: overrides.mtime ?? timestamp,
    createdAt: timestamp,
    parentId: overrides.parentId ?? null,
    level: overrides.level ?? 1,
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
  };
}

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

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("DayColumn", () => {
  it("renders every item in collapsed mode and uses the header button to expand", () => {
    const onExpand = vi.fn();
    const items = [
      createNode({ title: "Node A" }),
      createNode({ title: "Node B" }),
      createNode({ title: "Node C" }),
      createNode({ title: "Node D" }),
      createNode({ title: "Node E" }),
      createBit({ title: "Bit F", priority: "high" }),
    ];

    render(
      <DayColumn
        date={new Date(2026, 3, 15)}
        isExpanded={false}
        isToday={false}
        items={items}
        onExpand={onExpand}
        parentColorMap={new Map()}
      />,
    );

    expect(screen.queryByText(/\+\d+ more/i)).not.toBeInTheDocument();
    expect(screen.getByText("Node E")).toBeInTheDocument();
    expect(screen.getByText("Bit F")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /wed 15 6 items/i }));

    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it("keeps today emphasized in both expanded and collapsed states", () => {
    const { rerender } = render(
      <DayColumn
        date={new Date(2026, 3, 15)}
        isExpanded={false}
        isToday
        items={[]}
        onExpand={vi.fn()}
        parentColorMap={new Map()}
      />,
    );

    expect(screen.getByText("15")).toHaveClass("text-primary");
    expect(screen.getByRole("button", { name: /wed 15 0 items/i }).parentElement).toHaveClass(
      "ring-primary/40",
    );

    rerender(
      <DayColumn
        date={new Date(2026, 3, 15)}
        isExpanded
        isToday
        items={[]}
        onExpand={vi.fn()}
        parentColorMap={new Map()}
      />,
    );

    expect(screen.getByText("15")).toHaveClass("text-primary");
    expect(screen.getByRole("button", { name: /wed 15 0 items/i }).parentElement).toHaveClass(
      "ring-primary",
    );
  });
});
