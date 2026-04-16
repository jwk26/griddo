import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const usePathnameMock = vi.hoisted(() => vi.fn());
const navigateWeekMock = vi.hoisted(() => vi.fn());
const navigateMonthMock = vi.hoisted(() => vi.fn());
const weeklyItemsMock = vi.hoisted(() => vi.fn(() => new Map()));
const monthlyItemsMock = vi.hoisted(() => vi.fn(() => new Map()));
const calendarStoreState = vi.hoisted(() => ({
  currentMonth: new Date(2026, 3, 1),
  currentWeekStart: new Date(2026, 3, 13),
  navigateMonth: navigateMonthMock,
  navigateWeek: navigateWeekMock,
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

vi.mock("@dnd-kit/core", () => ({
  useDroppable: () => ({ isOver: false, setNodeRef: vi.fn() }),
}));

vi.mock("@/components/calendar/day-column", () => ({
  DayColumn: ({ date }: { date: Date }) => (
    <div data-testid="day-column">{date.toISOString()}</div>
  ),
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
  usePathnameMock.mockReturnValue("/calendar/weekly");
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
