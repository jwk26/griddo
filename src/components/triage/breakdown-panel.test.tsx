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
const clearSelectionMock = vi.hoisted(() => vi.fn());
const triageStoreState = vi.hoisted(() => ({
  selectedScratchId: null as string | null,
  stagedCandidates: {} as Record<
    string,
    Array<{
      id: string;
      type: "node" | "bit";
      sourceBreakdownId: string;
      label: string;
    }>
  >,
  clearSelection: clearSelectionMock,
}));
const useScratchBreakdownsMock = vi.hoisted(() => vi.fn());
const useTriageStoreMock = vi.hoisted(() => vi.fn());
const getDataStoreMock = vi.hoisted(() => vi.fn());
const archiveBitMock = vi.hoisted(() => vi.fn());
const currentTime = new Date(2026, 5, 17, 12, 0, 0).getTime();

vi.mock("@/hooks/use-scratch-breakdowns", () => ({
  useScratchBreakdowns: useScratchBreakdownsMock,
}));

vi.mock("@/stores/triage-store", () => ({
  useTriageStore: useTriageStoreMock,
}));

vi.mock("@/lib/db/datastore", () => ({
  getDataStore: getDataStoreMock,
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
  triageStoreState.stagedCandidates = {};
  useTriageStoreMock.mockImplementation(
    (selector: (state: typeof triageStoreState) => unknown) =>
      selector(triageStoreState),
  );
  useScratchBreakdownsMock.mockImplementation((scratchBitId: string | null) => ({
    breakdowns:
      scratchBitId === null
        ? []
        : (hookState.breakdownsByScratch[scratchBitId] ?? []),
    createBreakdown: hookState.createBreakdown,
    deleteBreakdown: hookState.deleteBreakdown,
  }));
  getDataStoreMock.mockResolvedValue({
    archiveBit: archiveBitMock,
  });
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

  it("replaces the add-note bar with the archive affordance when every breakdown is consumed and no candidates are staged", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({
        id: "row-1",
        content: "Processed note",
        consumedAt: currentTime,
      }),
    ];

    render(<BreakdownPanel />);

    expect(screen.getByText("All items processed")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Archive Scratch" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Add a note...")).not.toBeInTheDocument();
  });

  it("keeps the add-note bar when consumed breakdowns still have staged candidates", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    triageStoreState.stagedCandidates = {
      "scratch-1": [
        {
          id: "candidate-1",
          type: "node",
          sourceBreakdownId: "row-1",
          label: "Processed note",
        },
      ],
    };
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({
        id: "row-1",
        content: "Processed note",
        consumedAt: currentTime,
      }),
    ];

    render(<BreakdownPanel />);

    expect(screen.queryByText("All items processed")).not.toBeInTheDocument();
    expect(screen.getByText("Add a note...")).toBeInTheDocument();
  });

  it("archives the selected Scratch after confirmation", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({
        id: "row-1",
        content: "Processed note",
        consumedAt: currentTime,
      }),
    ];

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Archive Scratch" }));

    const dialog = await screen.findByRole("alertdialog");
    expect(
      within(dialog).getByText(
        "This Scratch and its processed breakdown rows will be moved to your archive. You can access, view, or restore them at any time from the Archive View.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Archive Scratch" }),
    );

    await waitFor(() => {
      expect(archiveBitMock).toHaveBeenCalledWith("scratch-1");
    });
    expect(clearSelectionMock).toHaveBeenCalledTimes(1);
  });

  it("leaves the selected Scratch active when archive confirmation is cancelled", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({
        id: "row-1",
        content: "Processed note",
        consumedAt: currentTime,
      }),
    ];

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Archive Scratch" }));
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    expect(archiveBitMock).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("prevents archiveBit from being called twice when confirm is clicked rapidly", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", consumedAt: currentTime }),
    ];

    let resolveArchive!: () => void;
    archiveBitMock.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveArchive = resolve;
      }),
    );

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Archive Scratch" }));
    const dialog = await screen.findByRole("alertdialog");

    const confirmButton = within(dialog).getByRole("button", {
      name: "Archive Scratch",
    });
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(archiveBitMock).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    resolveArchive();

    await waitFor(() => {
      expect(clearSelectionMock).toHaveBeenCalledTimes(1);
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

  it("de-emphasises a breakdown row whose id matches a staged candidate sourceBreakdownId", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    triageStoreState.stagedCandidates = {
      "scratch-1": [
        {
          id: "candidate-1",
          type: "node",
          sourceBreakdownId: "row-1",
          label: "Staged note",
        },
      ],
    };
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Staged note" }),
    ];

    render(<BreakdownPanel />);

    const text = screen.getByText("Staged note");
    const row = text.closest(".group");
    const grip = within(row as HTMLElement).getByTestId("breakdown-grip");

    expect(row).toHaveClass("opacity-50", "transition-opacity", "duration-200");
    expect(text).toHaveClass("text-muted-foreground");
    expect(grip).toHaveClass("text-muted-foreground/20");
    expect(screen.getByText("45m ago")).toHaveClass("text-muted-foreground/40");
  });

  it("does not add line-through styling to a staged row", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    triageStoreState.stagedCandidates = {
      "scratch-1": [
        {
          id: "candidate-1",
          type: "bit",
          sourceBreakdownId: "row-1",
          label: "Staged note",
        },
      ],
    };
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Staged note" }),
    ];

    render(<BreakdownPanel />);

    const text = screen.getByText("Staged note");
    const row = text.closest(".group");

    expect(row).not.toHaveClass("line-through");
    expect(text).not.toHaveClass("line-through");
  });

  it("does not de-emphasise a non-staged row", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    triageStoreState.stagedCandidates = {
      "scratch-1": [
        {
          id: "candidate-1",
          type: "node",
          sourceBreakdownId: "row-2",
          label: "Other staged note",
        },
      ],
    };
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Active note" }),
    ];

    render(<BreakdownPanel />);

    const text = screen.getByText("Active note");
    const row = text.closest(".group");
    const grip = within(row as HTMLElement).getByTestId("breakdown-grip");

    expect(row).not.toHaveClass("opacity-50");
    expect(text).toHaveClass("text-foreground");
    expect(text).not.toHaveClass("text-muted-foreground");
    expect(grip).toHaveClass("text-muted-foreground/45");
    expect(screen.getByText("45m ago")).toHaveClass("text-muted-foreground/70");
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
