import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Bit, Node } from "@/types";

const usePathnameMock = vi.hoisted(() => vi.fn());
const navigateWeekMock = vi.hoisted(() => vi.fn());
const navigateMonthMock = vi.hoisted(() => vi.fn());
const setExpandedDayMock = vi.hoisted(() => vi.fn());
const weeklyItemsMock = vi.hoisted(() => vi.fn(() => new Map()));
const monthlyItemsMock = vi.hoisted(() => vi.fn(() => new Map()));
const renderedDayColumns = vi.hoisted(
  () =>
    [] as Array<{
      date: Date;
      isExpanded: boolean;
      isToday: boolean;
      onExpand: () => void;
    }>,
);
const calendarStoreState = vi.hoisted(() => ({
  expandedDay: null as number | null,
  currentMonth: new Date(2026, 3, 1),
  currentWeekStart: new Date(2026, 3, 13),
  navigateMonth: navigateMonthMock,
  navigateWeek: navigateWeekMock,
  setExpandedDay: setExpandedDayMock,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
}));

vi.mock("motion/react", () => ({
  LayoutGroup: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@dnd-kit/core", () => ({
  useDraggable: () => ({
    attributes: {},
    isDragging: false,
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
  }),
  useDroppable: () => ({ isOver: false, setNodeRef: vi.fn() }),
}));

vi.mock("@/components/calendar/day-column", () => ({
  DayColumn: ({
    date,
    isExpanded,
    isToday,
    onExpand,
  }: {
    date: Date;
    isExpanded: boolean;
    isToday: boolean;
    onExpand: () => void;
  }) => {
    renderedDayColumns.push({ date, isExpanded, isToday, onExpand });
    return (
      <button data-testid="day-column" type="button" onClick={onExpand}>
        {date.toISOString()}
      </button>
    );
  },
}));

vi.mock("@/app/calendar/monthly/_components/date-cell-popover", () => ({
  DateCellPopover: ({ children, open }: { children: ReactNode; open: boolean }) => (
    <div data-open={String(open)}>{children}</div>
  ),
}));

vi.mock("@/hooks/use-calendar-data", () => ({
  useCalendarData: () => ({
    bitMap: new Map(),
    colorMap: new Map(),
    monthlyItems: monthlyItemsMock,
    nodeMap: new Map(),
    weeklyItems: weeklyItemsMock,
  }),
}));

vi.mock("@/stores/calendar-store", () => ({
  useCalendarStore: (selector: (state: typeof calendarStoreState) => unknown) =>
    selector(calendarStoreState),
}));

const { MonthGrid } = await import("@/app/calendar/monthly/_components/month-grid");
const { default: WeeklyCalendarPage } = await import("@/app/calendar/weekly/page");

function findNavRow(container: HTMLElement) {
  return Array.from(container.querySelectorAll("div")).find((element) =>
    typeof element.className === "string" && element.className.includes("grid-cols-[1fr_auto_1fr]"),
  );
}

function createNode(overrides: Partial<Node> = {}): Node {
  return {
    id: "node-1",
    title: "Roadmap",
    color: "hsl(210, 80%, 55%)",
    icon: "Box",
    deadline: new Date(2026, 3, 15, 9, 0).getTime(),
    deadlineAllDay: false,
    mtime: 0,
    createdAt: 0,
    parentId: null,
    level: 1,
    x: 0,
    y: 0,
    deletedAt: null,
    ...overrides,
  };
}

function createBit(overrides: Partial<Bit> = {}): Bit {
  return {
    id: "bit-1",
    title: "Ship spec",
    description: "",
    icon: "Box",
    deadline: new Date(2026, 3, 15, 10, 0).getTime(),
    deadlineAllDay: false,
    priority: "mid",
    status: "active",
    mtime: 0,
    createdAt: 0,
    parentId: "node-1",
    x: 0,
    y: 0,
    deletedAt: null,
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 3, 15, 9, 0));
  usePathnameMock.mockReturnValue("/calendar/weekly");
  calendarStoreState.expandedDay = null;
  calendarStoreState.currentMonth = new Date(2026, 3, 1);
  calendarStoreState.currentWeekStart = new Date(2026, 3, 13);
  monthlyItemsMock.mockReturnValue(new Map());
  weeklyItemsMock.mockReturnValue(new Map());
  renderedDayColumns.length = 0;
});

describe("calendar navigation rows", () => {
  it("renders the weekly page with the shared toggle layout", () => {
    usePathnameMock.mockReturnValue("/calendar/weekly");

    const { container } = render(<WeeklyCalendarPage />);
    const navRow = findNavRow(container);

    expect(navRow).toBeTruthy();
    expect(screen.queryByText("Weekly view")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Weekly" })).toHaveAttribute(
      "href",
      "/calendar/weekly",
    );
    expect(screen.getByRole("link", { name: "Monthly" })).toHaveAttribute(
      "href",
      "/calendar/monthly",
    );

    const [backButton, forwardButton] = within(navRow as HTMLElement).getAllByRole("button");

    fireEvent.click(backButton);
    fireEvent.click(forwardButton);

    expect(navigateWeekMock).toHaveBeenNthCalledWith(1, -1);
    expect(navigateWeekMock).toHaveBeenNthCalledWith(2, 1);
  });

  it("expands today by default when no explicit expanded day is stored", () => {
    render(<WeeklyCalendarPage />);

    expect(renderedDayColumns).toHaveLength(7);
    expect(renderedDayColumns[2]).toMatchObject({
      isExpanded: true,
      isToday: true,
    });
    expect(renderedDayColumns.filter((column) => column.isExpanded)).toHaveLength(1);
  });

  it("uses the stored expanded day index when present", () => {
    calendarStoreState.expandedDay = 4;

    render(<WeeklyCalendarPage />);

    expect(renderedDayColumns[4]).toMatchObject({
      isExpanded: true,
      isToday: false,
    });
    expect(renderedDayColumns[2]).toMatchObject({
      isExpanded: false,
      isToday: true,
    });
    expect(renderedDayColumns.filter((column) => column.isExpanded)).toHaveLength(1);
  });

  it("writes the clicked day index back to the store", () => {
    render(<WeeklyCalendarPage />);

    fireEvent.click(screen.getAllByTestId("day-column")[5]);

    expect(setExpandedDayMock).toHaveBeenCalledWith(5);
  });

  it("renders the month grid with the shared toggle layout", () => {
    usePathnameMock.mockReturnValue("/calendar/monthly");

    const { container } = render(<MonthGrid />);
    const navRow = findNavRow(container);

    expect(navRow).toBeTruthy();
    expect(screen.queryByText("Monthly view")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Weekly" })).toHaveAttribute(
      "href",
      "/calendar/weekly",
    );
    expect(screen.getByRole("link", { name: "Monthly" })).toHaveAttribute(
      "href",
      "/calendar/monthly",
    );

    const [backButton, forwardButton] = within(navRow as HTMLElement).getAllByRole("button");

    fireEvent.click(backButton);
    fireEvent.click(forwardButton);

    expect(navigateMonthMock).toHaveBeenNthCalledWith(1, -1);
    expect(navigateMonthMock).toHaveBeenNthCalledWith(2, 1);
  });

  it("opens monthly day details when the cell area is clicked", () => {
    usePathnameMock.mockReturnValue("/calendar/monthly");
    monthlyItemsMock.mockReturnValue(new Map([["2026-04-15", []]]));

    render(<MonthGrid />);

    fireEvent.click(
      screen.getByRole("group", { name: "Wednesday, April 15, 2026, 0 items" }),
    );

    expect(
      screen.getByRole("button", {
        name: "Open details for Wednesday, April 15, 2026, 0 items",
      }).parentElement,
    ).toHaveAttribute("data-open", "true");
  });

  it("opens monthly day details when a node preview tile is clicked", () => {
    usePathnameMock.mockReturnValue("/calendar/monthly");
    monthlyItemsMock.mockReturnValue(new Map([["2026-04-15", [createNode()]]]));

    render(<MonthGrid />);

    fireEvent.click(screen.getByRole("button", { name: "Open Roadmap details or drag to reschedule" }));

    expect(
      screen.getByRole("button", {
        name: "Open details for Wednesday, April 15, 2026, 1 item",
      }).parentElement,
    ).toHaveAttribute("data-open", "true");
  });

  it("opens monthly day details when a bit preview dot is clicked", () => {
    usePathnameMock.mockReturnValue("/calendar/monthly");
    monthlyItemsMock.mockReturnValue(new Map([["2026-04-15", [createBit()]]]));

    render(<MonthGrid />);

    fireEvent.click(screen.getByRole("button", { name: "Open Ship spec details or drag to reschedule" }));

    expect(
      screen.getByRole("button", {
        name: "Open details for Wednesday, April 15, 2026, 1 item",
      }).parentElement,
    ).toHaveAttribute("data-open", "true");
  });
});

afterEach(() => {
  vi.useRealTimers();
});
