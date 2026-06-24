import "@testing-library/jest-dom/vitest";
import {
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
  useTriageStore.setState({
    selectedScratchId: null,
    scratchPoolExpanded: true,
    scratchPoolManualExpandedForId: null,
  });
  useInboxMock.mockReturnValue({ activeScratchBits: [] });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
  useTriageStore.setState({
    selectedScratchId: null,
    scratchPoolExpanded: true,
    scratchPoolManualExpandedForId: null,
  });
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
    expect(screen.getByRole("button", { name: "Selected scratch" })).toBeInTheDocument();
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

    expect(screen.getByLabelText("2 scratches")).toHaveClass("bg-primary");
  });

  it("does not show a collapsed count badge when the pool is empty", () => {
    render(<ScratchPool />);

    fireEvent.click(screen.getByLabelText("Collapse Scratch Pool"));

    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(screen.queryByText("No active scratches")).not.toBeInTheDocument();
  });

  it("shows total count in expanded header", () => {
    useInboxMock.mockReturnValue({
      activeScratchBits: [
        createBit({ id: "scratch-1" }),
        createBit({ id: "scratch-2" }),
      ],
    });

    render(<ScratchPool />);

    expect(screen.getByLabelText("2 scratches")).toBeInTheDocument();
  });

  it("search filters scratch titles", () => {
    useInboxMock.mockReturnValue({
      activeScratchBits: [
        createBit({ id: "alpha", title: "Alpha task" }),
        createBit({ id: "beta", title: "Beta task" }),
      ],
    });

    render(<ScratchPool />);

    fireEvent.change(screen.getByLabelText("Search scratches"), {
      target: { value: "alpha" },
    });

    expect(screen.getByText("Alpha task")).toBeInTheDocument();
    expect(screen.queryByText("Beta task")).not.toBeInTheDocument();
  });

  it("search shows No matches when nothing matches", () => {
    useInboxMock.mockReturnValue({
      activeScratchBits: [
        createBit({ id: "alpha", title: "Alpha task" }),
        createBit({ id: "beta", title: "Beta task" }),
      ],
    });

    render(<ScratchPool />);

    fireEvent.change(screen.getByLabelText("Search scratches"), {
      target: { value: "zzz" },
    });

    expect(screen.getByText("No matches")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Alpha task" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Beta task" })).not.toBeInTheDocument();
  });

  it("clear search restores full list", () => {
    useInboxMock.mockReturnValue({
      activeScratchBits: [
        createBit({ id: "alpha", title: "Alpha task" }),
        createBit({ id: "beta", title: "Beta task" }),
      ],
    });

    render(<ScratchPool />);

    fireEvent.change(screen.getByLabelText("Search scratches"), {
      target: { value: "alpha" },
    });
    fireEvent.click(screen.getByLabelText("Clear search"));

    expect(screen.getByText("Alpha task")).toBeInTheDocument();
    expect(screen.getByText("Beta task")).toBeInTheDocument();
  });

  it("sort toggle switches to oldest-first then back", () => {
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

    const rowTitles = () =>
      screen
        .getAllByRole("button", { name: /^(Older|Newer) scratch$/ })
        .map((row) => row.textContent);

    expect(rowTitles()).toEqual(["Newer scratch45m ago", "Older scratch2h ago"]);

    fireEvent.click(screen.getByRole("button", { name: /Sort:/ }));

    expect(rowTitles()).toEqual(["Older scratch2h ago", "Newer scratch45m ago"]);

    fireEvent.click(screen.getByRole("button", { name: /Sort:/ }));

    expect(rowTitles()).toEqual(["Newer scratch45m ago", "Older scratch2h ago"]);
  });

  it("collapsed mode has no search or sort controls", () => {
    useInboxMock.mockReturnValue({
      activeScratchBits: [createBit({ id: "scratch-1", title: "Scratch one" })],
    });

    render(<ScratchPool />);

    fireEvent.click(screen.getByLabelText("Collapse Scratch Pool"));

    expect(screen.queryByLabelText("Search scratches")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Sort:/ })).not.toBeInTheDocument();
  });

  it("collapsed mode renders a pill button per scratch", () => {
    useInboxMock.mockReturnValue({
      activeScratchBits: [
        createBit({ id: "scratch-1", title: "Scratch one" }),
        createBit({ id: "scratch-2", title: "Scratch two" }),
      ],
    });

    render(<ScratchPool />);

    fireEvent.click(screen.getByLabelText("Collapse Scratch Pool"));

    const switcher = screen.getByRole("group", { name: "Switch scratch" });
    expect(within(switcher).getAllByRole("button")).toHaveLength(2);
  });

  it("clicking collapsed pill selects scratch and does not expand pool", () => {
    useInboxMock.mockReturnValue({
      activeScratchBits: [
        createBit({ id: "scratch-1", title: "Scratch one" }),
        createBit({ id: "scratch-2", title: "Scratch two" }),
      ],
    });

    render(<ScratchPool />);

    const pool = screen.getByTestId("scratch-pool");
    fireEvent.click(screen.getByLabelText("Collapse Scratch Pool"));
    fireEvent.click(screen.getByRole("button", { name: "Scratch two" }));

    expect(pool).toHaveClass("w-12");
    expect(useTriageStore.getState().selectedScratchId).toBe("scratch-2");
  });

  it("selecting scratch in expanded mode does not collapse pool", () => {
    useInboxMock.mockReturnValue({
      activeScratchBits: [createBit({ id: "scratch-1", title: "Scratch one" })],
    });

    render(<ScratchPool />);

    const pool = screen.getByTestId("scratch-pool");
    fireEvent.click(screen.getByRole("button", { name: "Scratch one" }));

    expect(pool).toHaveClass("w-72");
  });

  it("collapsed pills have accessible labels with scratch titles", () => {
    useInboxMock.mockReturnValue({
      activeScratchBits: [createBit({ id: "scratch-1", title: "My scratch" })],
    });

    render(<ScratchPool />);

    fireEvent.click(screen.getByLabelText("Collapse Scratch Pool"));

    expect(screen.getByRole("button", { name: "My scratch" })).toBeInTheDocument();
  });

  it("ScratchRow button has focus-visible ring classes", () => {
    useInboxMock.mockReturnValue({
      activeScratchBits: [createBit({ id: "scratch-1", title: "Scratch one" })],
    });

    render(<ScratchPool />);

    const row = screen.getByRole("button", { name: "Scratch one" });
    expect(row).toHaveClass("focus-visible:ring-2");
    expect(row).toHaveClass("focus-visible:ring-ring");
  });

  it("collapsed pill button has focus-visible ring classes", () => {
    useInboxMock.mockReturnValue({
      activeScratchBits: [createBit({ id: "scratch-1", title: "Scratch one" })],
    });

    render(<ScratchPool />);

    fireEvent.click(screen.getByLabelText("Collapse Scratch Pool"));

    const pill = screen.getByRole("button", { name: "Scratch one" });
    expect(pill).toHaveClass("focus-visible:ring-2");
    expect(pill).toHaveClass("focus-visible:ring-ring");
  });

  it("sort toggle button has focus-visible ring classes", () => {
    render(<ScratchPool />);

    const sortButton = screen.getByRole("button", { name: /Sort:/ });
    expect(sortButton).toHaveClass("focus-visible:ring-2");
    expect(sortButton).toHaveClass("focus-visible:ring-ring");
  });

  it("search input has focus-visible ring classes", () => {
    render(<ScratchPool />);

    const searchInput = screen.getByLabelText("Search scratches");
    expect(searchInput).toHaveClass("focus-visible:ring-2");
    expect(searchInput).toHaveClass("focus-visible:ring-ring");
  });
});
