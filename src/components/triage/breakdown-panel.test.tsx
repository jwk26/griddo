import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ScratchBreakdown } from "@/lib/db/schema";
import { BreakdownPanel } from "./breakdown-panel";

const hookState = vi.hoisted(() => ({
  breakdownsByScratch: {} as Record<string, unknown[]>,
  createBreakdown: vi.fn(),
  deleteBreakdown: vi.fn(),
}));
const triageStoreState = vi.hoisted(() => ({
  selectedScratchId: null as string | null,
}));
const useScratchBreakdownsMock = vi.hoisted(() => vi.fn());
const useTriageStoreMock = vi.hoisted(() => vi.fn());
const currentTime = new Date(2026, 5, 17, 12, 0, 0).getTime();

vi.mock("@/hooks/use-scratch-breakdowns", () => ({
  useScratchBreakdowns: useScratchBreakdownsMock,
}));

vi.mock("@/stores/triage-store", () => ({
  useTriageStore: useTriageStoreMock,
}));

function createScratchBreakdown(
  overrides: Partial<ScratchBreakdown> = {},
): ScratchBreakdown {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    scratchBitId: overrides.scratchBitId ?? "scratch-1",
    content: overrides.content ?? "breakdown content",
    order: overrides.order ?? 0,
    createdAt:
      overrides.createdAt ?? new Date(2026, 5, 17, 11, 15, 0).getTime(),
    consumedAt: overrides.consumedAt ?? null,
  };
}

beforeEach(() => {
  vi.spyOn(Date, "now").mockReturnValue(currentTime);
  hookState.breakdownsByScratch = {};
  hookState.createBreakdown.mockResolvedValue(undefined);
  hookState.deleteBreakdown.mockResolvedValue(undefined);
  triageStoreState.selectedScratchId = null;
  useTriageStoreMock.mockImplementation(
    (selector: (state: { selectedScratchId: string | null }) => unknown) =>
      selector({ selectedScratchId: triageStoreState.selectedScratchId }),
  );
  useScratchBreakdownsMock.mockImplementation((scratchBitId: string | null) => ({
    breakdowns:
      scratchBitId === null
        ? []
        : (hookState.breakdownsByScratch[scratchBitId] ?? []),
    createBreakdown: hookState.createBreakdown,
    deleteBreakdown: hookState.deleteBreakdown,
  }));
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("BreakdownPanel", () => {
  it("renders the empty state when no Scratch is selected", () => {
    render(<BreakdownPanel />);

    expect(
      screen.getByText("Select a Scratch to view breakdowns"),
    ).toBeInTheDocument();
  });

  it("renders breakdown content with relative-time labels", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({
        id: "row-1",
        content: "First note",
        createdAt: new Date(2026, 5, 17, 11, 15, 0).getTime(),
      }),
      createScratchBreakdown({
        id: "row-2",
        content: "Older note",
        createdAt: new Date(2026, 5, 17, 10, 0, 0).getTime(),
      }),
    ];

    render(<BreakdownPanel />);

    expect(screen.getByText("First note")).toBeInTheDocument();
    expect(screen.getByText("45m ago")).toBeInTheDocument();
    expect(screen.getByText("Older note")).toBeInTheDocument();
    expect(screen.getByText("2h ago")).toBeInTheDocument();
  });

  it("activates the input when clicking the add-note placeholder", () => {
    triageStoreState.selectedScratchId = "scratch-1";

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Add a note..." }));

    expect(screen.getByPlaceholderText("Add a note...")).toHaveFocus();
  });

  it("creates a trimmed breakdown when pressing Enter", async () => {
    triageStoreState.selectedScratchId = "scratch-1";

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Add a note..." }));
    const input = screen.getByPlaceholderText("Add a note...");
    fireEvent.change(input, { target: { value: "  Follow up  " } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(hookState.createBreakdown).toHaveBeenCalledWith("Follow up");
    });
  });

  it("does not create a breakdown for empty blur or Escape cancels", () => {
    triageStoreState.selectedScratchId = "scratch-1";

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Add a note..." }));
    fireEvent.blur(screen.getByPlaceholderText("Add a note..."));

    fireEvent.click(screen.getByRole("button", { name: "Add a note..." }));
    fireEvent.keyDown(screen.getByPlaceholderText("Add a note..."), {
      key: "Escape",
    });

    expect(hookState.createBreakdown).not.toHaveBeenCalled();
  });

  it("opens a confirmation dialog when the delete button is clicked", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Delete me" }),
    ];

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Delete breakdown" }));

    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    expect(hookState.deleteBreakdown).not.toHaveBeenCalled();
  });

  it("deletes the selected row when confirming the dialog", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Delete me" }),
    ];

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Delete breakdown" }));
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(hookState.deleteBreakdown).toHaveBeenCalledWith("row-1");
    });
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("does not delete when cancelling the confirmation dialog", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Keep me" }),
    ];

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Delete breakdown" }));
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    expect(hookState.deleteBreakdown).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("updates the breakdown list when the selected Scratch changes", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Scratch one note" }),
    ];
    hookState.breakdownsByScratch["scratch-2"] = [
      createScratchBreakdown({
        id: "row-2",
        scratchBitId: "scratch-2",
        content: "Scratch two note",
      }),
    ];

    const { rerender } = render(<BreakdownPanel />);

    expect(screen.getByText("Scratch one note")).toBeInTheDocument();

    triageStoreState.selectedScratchId = "scratch-2";
    rerender(<BreakdownPanel />);

    expect(screen.queryByText("Scratch one note")).not.toBeInTheDocument();
    expect(screen.getByText("Scratch two note")).toBeInTheDocument();
  });

  it("renders the grip as a visual-only non-draggable handle", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Has grip" }),
    ];

    render(<BreakdownPanel />);

    const grip = screen.getByTestId("breakdown-grip");
    expect(grip).toHaveAttribute("aria-hidden", "true");
    expect(grip).not.toHaveAttribute("draggable");
    expect(grip).not.toHaveAttribute("ondragstart");
    expect(grip).not.toHaveAttribute("ondragend");
    expect(grip).not.toHaveAttribute("data-dnd-kit");
  });

  it("clears the confirmation dialog on Escape without deleting", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Keep me" }),
    ];

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Delete breakdown" }));
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(hookState.deleteBreakdown).not.toHaveBeenCalled();
  });

  it("closes the confirmation dialog without deleting when the selected Scratch changes", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Keep me" }),
    ];

    const { rerender } = render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Delete breakdown" }));
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();

    triageStoreState.selectedScratchId = "scratch-2";
    rerender(<BreakdownPanel />);

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(hookState.deleteBreakdown).not.toHaveBeenCalled();
  });
});
