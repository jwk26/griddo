import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
  DateCellPopover: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/hooks/use-calendar-data", () => ({
  useCalendarData: () => ({
    bitMap: new Map(),
    colorMap: new Map(),
    monthlyItems: monthlyItemsMock,
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
});

afterEach(() => {
  vi.useRealTimers();
});
