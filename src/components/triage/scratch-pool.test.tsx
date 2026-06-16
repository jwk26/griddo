import "@testing-library/jest-dom/vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Bit } from "@/types";
import { useTriageStore } from "@/stores/triage-store";
import { ScratchPool } from "./scratch-pool";

const useInboxMock = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-inbox", () => ({
  useInbox: useInboxMock,
}));

function createBit(overrides: Partial<Bit> = {}): Bit {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Scratch",
    description: overrides.description ?? "",
    icon: overrides.icon ?? "sparkles",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    priority: overrides.priority ?? null,
    status: overrides.status ?? "active",
    mtime: overrides.mtime ?? Date.now(),
    createdAt: overrides.createdAt ?? Date.now(),
    parentId: overrides.parentId ?? "inbox-node",
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
    archivedAt: overrides.archivedAt ?? null,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 5, 17, 12, 0, 0));
  window.matchMedia = vi.fn().mockReturnValue({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    matches: false,
  });
  useTriageStore.setState({ selectedScratchId: null });
  useInboxMock.mockReturnValue({ activeScratchBits: [] });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
  useTriageStore.setState({ selectedScratchId: null });
});

describe("ScratchPool", () => {
  it("renders active Scratch rows newest-first with relative-time labels", () => {
    useInboxMock.mockReturnValue({
      activeScratchBits: [
        createBit({
          id: "older",
          title: "Older scratch",
          createdAt: new Date(2026, 5, 17, 10, 0, 0).getTime(),
        }),
        createBit({
          id: "newer",
          title: "Newer scratch",
          createdAt: new Date(2026, 5, 17, 11, 15, 0).getTime(),
        }),
      ],
    });

    render(<ScratchPool />);

    const rows = [
      screen.getByText("Newer scratch").closest("button"),
      screen.getByText("Older scratch").closest("button"),
    ];

    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Newer scratch");
    expect(rows[0]).toHaveTextContent("45m ago");
    expect(rows[1]).toHaveTextContent("Older scratch");
    expect(rows[1]).toHaveTextContent("2h ago");
  });

  it("renders the expanded empty state", () => {
    render(<ScratchPool />);

    expect(screen.getByText("No active scratches")).toBeInTheDocument();
    expect(screen.getByText("Captured items will appear here.")).toBeInTheDocument();
  });

  it("manual toggle collapses to the rail and expands back", () => {
    useInboxMock.mockReturnValue({
      activeScratchBits: [createBit({ id: "scratch-1", title: "Scratch one" })],
    });

    render(<ScratchPool />);

    const pool = screen.getByTestId("scratch-pool");
    expect(pool).toHaveClass("w-72");

    fireEvent.click(screen.getByLabelText("Collapse Scratch Pool"));

    expect(pool).toHaveClass("w-12");
    expect(screen.getByLabelText("Expand Scratch Pool")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Expand Scratch Pool"));

    expect(pool).toHaveClass("w-72");
  });

  it("selects a Scratch row and auto-collapses after 150ms", () => {
    const scratch = createBit({
      id: "scratch-1",
      title: "Scratch one",
      createdAt: new Date(2026, 5, 17, 11, 0, 0).getTime(),
    });
    const selectScratchSpy = vi.spyOn(useTriageStore.getState(), "selectScratch");
    useInboxMock.mockReturnValue({ activeScratchBits: [scratch] });

    render(<ScratchPool />);

    const pool = screen.getByTestId("scratch-pool");

    fireEvent.click(screen.getByRole("button", { name: /Scratch one/i }));

    expect(selectScratchSpy).toHaveBeenCalledWith("scratch-1");
    expect(useTriageStore.getState().selectedScratchId).toBe("scratch-1");
    expect(pool).toHaveClass("w-72");

    act(() => {
      vi.advanceTimersByTime(149);
    });
    expect(pool).toHaveClass("w-72");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(pool).toHaveClass("w-12");
  });

  it("does not render the selected Scratch title in the collapsed rail", () => {
    const scratch = createBit({
      id: "scratch-1",
      title: "Selected scratch",
    });
    useTriageStore.setState({ selectedScratchId: "scratch-1" });
    useInboxMock.mockReturnValue({ activeScratchBits: [scratch] });

    render(<ScratchPool />);

    fireEvent.click(screen.getByLabelText("Collapse Scratch Pool"));

    expect(screen.queryByText("Selected scratch")).not.toBeInTheDocument();
  });

  it("shows a collapsed count badge when items exist", () => {
    useInboxMock.mockReturnValue({
      activeScratchBits: [
        createBit({ id: "scratch-1" }),
        createBit({ id: "scratch-2" }),
      ],
    });

    render(<ScratchPool />);

    fireEvent.click(screen.getByLabelText("Collapse Scratch Pool"));

    const rail = screen.getByLabelText("Expand Scratch Pool");
    expect(within(rail).getByText("2")).toHaveClass("bg-primary");
  });

  it("does not show a collapsed count badge when the pool is empty", () => {
    render(<ScratchPool />);

    fireEvent.click(screen.getByLabelText("Collapse Scratch Pool"));

    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(screen.queryByText("No active scratches")).not.toBeInTheDocument();
  });
});
