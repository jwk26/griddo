import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { startOfDay, startOfToday } from "date-fns";
import type { ComponentPropsWithoutRef, PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type DivProps = PropsWithChildren<ComponentPropsWithoutRef<"div">>;

function MockFragment({ children }: PropsWithChildren) {
  return <>{children}</>;
}

function MockDiv({ children, ...props }: DivProps) {
  return <div {...props}>{children}</div>;
}

vi.mock("@/components/ui/popover", () => ({
  Popover: MockFragment,
  PopoverTrigger: MockFragment,
  PopoverContent: MockDiv,
}));

vi.mock("@/components/ui/calendar", () => ({
  Calendar: ({
    onSelect,
  }: {
    onSelect?: (date: Date | undefined) => void;
  }) => (
    <button onClick={() => onSelect?.(new Date(2026, 9, 24))} type="button">
      Choose October 24
    </button>
  ),
}));

const { DateFirstDeadlinePicker } = await import(
  "@/components/shared/date-first-deadline-picker"
);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 3, 11, 8, 0));
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("DateFirstDeadlinePicker", () => {
  it("sets the Today shortcut as an all-day deadline", () => {
    const onChange = vi.fn();

    render(
      <DateFirstDeadlinePicker
        value={{ deadline: null, deadlineAllDay: false }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Today" }));

    expect(onChange).toHaveBeenCalledWith({
      deadline: startOfToday().getTime(),
      deadlineAllDay: true,
    });
  });

  it("selects a custom date as an all-day deadline", () => {
    const onChange = vi.fn();

    render(
      <DateFirstDeadlinePicker
        value={{ deadline: null, deadlineAllDay: false }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Choose October 24" }));

    expect(onChange).toHaveBeenCalledWith({
      deadline: startOfDay(new Date(2026, 9, 24)).getTime(),
      deadlineAllDay: true,
    });
  });

  it("uses the current deadline date when applying a time", () => {
    const onChange = vi.fn();
    const baseDeadline = startOfDay(new Date(2026, 9, 24)).getTime();

    render(
      <DateFirstDeadlinePicker
        value={{ deadline: baseDeadline, deadlineAllDay: true }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pick time" }));
    fireEvent.change(screen.getByLabelText("Hour"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Minute"), {
      target: { value: "30" },
    });

    expect(onChange).toHaveBeenLastCalledWith({
      deadline: new Date(2026, 9, 24, 2, 30).getTime(),
      deadlineAllDay: false,
    });
  });

  it("prefers onClear when provided", () => {
    const onChange = vi.fn();
    const onClear = vi.fn();

    render(
      <DateFirstDeadlinePicker
        value={{
          deadline: new Date(2026, 9, 24, 14, 30).getTime(),
          deadlineAllDay: false,
        }}
        onChange={onChange}
        onClear={onClear}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear deadline" }));

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });
});
