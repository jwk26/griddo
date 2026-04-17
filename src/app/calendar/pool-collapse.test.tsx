import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCalendarStore } from "@/stores/calendar-store";

type MotionAsideProps = ComponentPropsWithoutRef<"aside"> & {
  animate?: unknown;
  initial?: unknown;
  transition?: unknown;
};

const dndState = vi.hoisted(() => ({
  conflictState: {
    open: false,
    parentDeadline: 0,
    parentDeadlineAllDay: false,
  },
  handleConflictKeepChild: vi.fn(),
  handleConflictUpdateParent: vi.fn(),
  handleDragEnd: vi.fn(),
  handleDragOver: vi.fn(),
  handleDragStart: vi.fn(),
  overTargetId: null as string | null,
  sensors: [],
}));

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: ReactNode }) => <>{children}</>,
  closestCorners: vi.fn(),
}));

vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    aside: ({ animate, children, initial, transition, ...props }: MotionAsideProps) => (
      <aside {...props}>{children}</aside>
    ),
  },
}));

vi.mock("@/components/calendar/node-pool", () => ({
  NodePool: () => <div>Node pool</div>,
}));

vi.mock("@/components/calendar/items-pool", () => ({
  ItemsPool: () => <div>Items pool</div>,
}));

vi.mock("@/components/layout/sidebar", () => ({
  Sidebar: () => <div data-testid="sidebar" />,
}));

vi.mock("@/components/shared/deadline-conflict-modal", () => ({
  DeadlineConflictModal: () => null,
}));

vi.mock("@/hooks/use-dnd", () => ({
  useDnd: () => dndState,
}));

const { default: CalendarLayout } = await import("@/app/calendar/layout");

describe("calendar pool collapse", () => {
  beforeEach(() => {
    useCalendarStore.setState({ isPoolCollapsed: false });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("toggles the pool collapse state in the store", () => {
    expect(useCalendarStore.getState().isPoolCollapsed).toBe(false);

    useCalendarStore.getState().togglePool();
    expect(useCalendarStore.getState().isPoolCollapsed).toBe(true);

    useCalendarStore.getState().togglePool();
    expect(useCalendarStore.getState().isPoolCollapsed).toBe(false);
  });

  it("keeps the collapse state across calendar-internal navigation", () => {
    const firstRender = render(
      <CalendarLayout>
        <div>Weekly view</div>
      </CalendarLayout>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Collapse pool" }));
    expect(useCalendarStore.getState().isPoolCollapsed).toBe(true);

    firstRender.unmount();

    render(
      <CalendarLayout>
        <div>Monthly view</div>
      </CalendarLayout>,
    );

    expect(useCalendarStore.getState().isPoolCollapsed).toBe(true);
    expect(screen.getByRole("button", { name: "Expand pool" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("unmounts the pool content when the pool is collapsed", () => {
    useCalendarStore.setState({ isPoolCollapsed: true });

    render(
      <CalendarLayout>
        <div>Calendar</div>
      </CalendarLayout>,
    );

    expect(document.getElementById("calendar-pool-content")).not.toBeInTheDocument();
  });

  it("only wires aria-controls while the pool content is mounted", () => {
    render(
      <CalendarLayout>
        <div>Calendar</div>
      </CalendarLayout>,
    );

    const collapseButton = screen.getByRole("button", { name: "Collapse pool" });
    expect(collapseButton).toHaveAttribute("aria-controls", "calendar-pool-content");

    fireEvent.click(collapseButton);

    const expandButton = screen.getByRole("button", { name: "Expand pool" });
    expect(expandButton).not.toHaveAttribute("aria-controls");
  });
});
