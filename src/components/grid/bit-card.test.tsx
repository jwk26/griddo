import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useArchiveActions } from "@/hooks/use-archive";
import { useEditModeStore } from "@/stores/edit-mode-store";
import type { Bit } from "@/types";
import { BitCard } from "./bit-card";

vi.mock("@/hooks/use-archive", () => ({
  useArchiveActions: vi.fn(() => ({ archive: vi.fn() })),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <>{children}</>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode; asChild?: boolean }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>{children}</button>
  ),
}));

function createBit(overrides: Partial<Bit>): Bit {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Bit",
    description: overrides.description ?? "",
    icon: overrides.icon ?? "Folder",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    priority: overrides.priority ?? null,
    status: overrides.status ?? "active",
    mtime: overrides.mtime ?? Date.now(),
    createdAt: overrides.createdAt ?? Date.now(),
    parentId: overrides.parentId ?? "parent-node",
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
    archivedAt: overrides.archivedAt ?? null,
    version: overrides.version ?? 1,
    pastDeadlineDismissed: overrides.pastDeadlineDismissed ?? false,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-03-25T00:00:00.000Z"));
  useEditModeStore.setState({ isEditMode: false });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
  useEditModeStore.setState({ isEditMode: false });
});

describe("BitCard", () => {
  it("layers an independent semantic Newly Placed marker on the actual card", () => {
    const bit = createBit({ title: "Placed bit" });
    const { rerender } = render(
      <BitCard
        bit={bit}
        chunkStats={{ completed: 0, total: 0 }}
        isNewlyPlaced={true}
        onClick={vi.fn()}
        parentColor="hsl(221, 83%, 53%)"
      />,
    );

    const marker = screen.getByText("Newly placed");
    expect(marker).toHaveAttribute("data-card-marker", "newly-placed");
    expect(marker.closest('[data-newly-placed="true"]')).not.toBeNull();
    expect(screen.getByText("Placed bit")).toBeInTheDocument();

    rerender(
      <BitCard
        bit={bit}
        chunkStats={{ completed: 0, total: 0 }}
        onClick={vi.fn()}
        parentColor="hsl(221, 83%, 53%)"
      />,
    );
    expect(screen.queryByText("Newly placed")).not.toBeInTheDocument();
  });

  it("keeps marker and Undo eligibility independent and never bubbles Undo into navigation", () => {
    const bit = createBit({ title: "Undo bit" });
    const navigate = vi.fn();
    const activateUndo = vi.fn();
    render(
      <BitCard
        bit={bit}
        chunkStats={{ completed: 0, total: 0 }}
        isNewlyPlaced={true}
        onClick={navigate}
        parentColor="hsl(221, 83%, 53%)"
        undo={{ disabled: false, onActivate: activateUndo, reason: "available" }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Undo placement of Undo bit" }));
    expect(activateUndo).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByText("Newly placed")).toBeInTheDocument();
  });

  it("renders deadline, priority, progress, and aging saturation", () => {
    const handleClick = vi.fn();
    const bit = createBit({
      title: "Ship Phase 4",
      priority: "high",
      deadline: new Date("2026-03-27T00:00:00.000Z").getTime(),
      mtime: new Date("2026-03-18T00:00:00.000Z").getTime(),
    });
    const { container } = render(
      <BitCard
        bit={bit}
        chunkStats={{ completed: 1, total: 4 }}
        onClick={handleClick}
        parentColor="hsl(120, 100%, 40%)"
      />,
    );

    const card = screen.getByText("Ship Phase 4").closest('[role="button"]');

    expect(card).not.toBeNull();
    expect(card).toHaveStyle({ filter: "saturate(0.5) brightness(0.9)" });
    expect(screen.getByText("Mar 27")).toBeInTheDocument();
    expect(screen.getByText("high")).toBeInTheDocument();
    expect(container.querySelector('[style*="width: 25%"]')).not.toBeNull();

    fireEvent.click(card!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows overdue overlay with check and dismiss buttons on past-deadline bits", () => {
    const bit = createBit({
      title: "Overdue bit",
      deadline: new Date("2026-03-24T00:00:00.000Z").getTime(),
    });
    render(
      <BitCard
        bit={bit}
        chunkStats={{ completed: 0, total: 0 }}
        onClick={vi.fn()}
        parentColor="hsl(221, 83%, 53%)"
      />,
    );

    expect(screen.getByText("Overdue bit")).toHaveClass("line-through");
    expect(screen.getByText("Done?")).toBeInTheDocument();
    expect(screen.getByLabelText("Mark as done")).toBeInTheDocument();
    expect(screen.getByLabelText("Dismiss")).toBeInTheDocument();
  });

  it("shows delete overlay in edit mode", () => {
    useEditModeStore.setState({ isEditMode: true });
    const bit = createBit({ title: "Active bit" });
    render(
      <BitCard
        bit={bit}
        chunkStats={{ completed: 0, total: 0 }}
        onClick={vi.fn()}
        parentColor="hsl(221, 83%, 53%)"
      />,
    );

    const card = screen.getByText("Active bit").closest('[role="button"]');

    expect(card).not.toBeNull();
    expect(card).toHaveClass("motion-safe:animate-jiggle");
    expect(screen.getByLabelText("Delete Active bit")).toBeInTheDocument();
  });

  it("keeps the card-root drag cursor contract without forcing full-cell sizing", () => {
    const bit = createBit({
      title: "Cursor probe",
      deadline: new Date("2026-03-27T00:00:00.000Z").getTime(),
      priority: "high",
    });

    render(
      <BitCard
        bit={bit}
        chunkStats={{ completed: 1, total: 4 }}
        onClick={vi.fn()}
        parentColor="hsl(221, 83%, 53%)"
      />,
    );

    const card = screen.getByText("Cursor probe").closest('[role="button"]');

    expect(card).not.toBeNull();
    expect(card).toHaveClass(
      "inline-flex",
      "shrink-0",
      "z-10",
      "cursor-grab",
      "active:cursor-grabbing",
      "select-none",
    );
    expect(card).not.toHaveClass("h-full", "w-full", "overflow-hidden");
  });

  it("keeps passive content layers pointer-enabled while the card stays the drag owner", () => {
    const bit = createBit({
      title: "Pointer target probe",
      deadline: new Date("2026-03-27T00:00:00.000Z").getTime(),
      priority: "high",
    });

    render(
      <BitCard
        bit={bit}
        chunkStats={{ completed: 1, total: 4 }}
        onClick={vi.fn()}
        parentColor="hsl(221, 83%, 53%)"
      />,
    );

    const card = screen.getByText("Pointer target probe").closest('[role="button"]');

    expect(card).not.toBeNull();
    expect(card?.children[0]).not.toHaveClass("pointer-events-none");
    expect(card?.children[1]).not.toHaveClass("pointer-events-none");
  });
});

describe("B2b — archive context menu (BitCard)", () => {
  const mockArchive = vi.fn();

  beforeEach(() => {
    vi.mocked(useArchiveActions).mockReturnValue({ archive: mockArchive });
  });

  it("shows the options trigger in normal mode", () => {
    const bit = createBit({ title: "Design sprint" });
    render(
      <BitCard bit={bit} chunkStats={{ completed: 0, total: 0 }} onClick={vi.fn()} parentColor="hsl(221, 83%, 53%)" />,
    );
    expect(screen.getByLabelText("Design sprint options")).toBeInTheDocument();
  });

  it("shows the Archive menu item", () => {
    const bit = createBit({ title: "Design sprint" });
    render(
      <BitCard bit={bit} chunkStats={{ completed: 0, total: 0 }} onClick={vi.fn()} parentColor="hsl(221, 83%, 53%)" />,
    );
    expect(screen.getByRole("button", { name: "Archive" })).toBeInTheDocument();
  });

  it("calls archive('bit', id) when Archive is clicked", () => {
    const bit = createBit({ title: "Design sprint" });
    render(
      <BitCard bit={bit} chunkStats={{ completed: 0, total: 0 }} onClick={vi.fn()} parentColor="hsl(221, 83%, 53%)" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Archive" }));
    expect(mockArchive).toHaveBeenCalledWith("bit", bit.id);
  });

  it("hides the options trigger in edit mode", () => {
    useEditModeStore.setState({ isEditMode: true });
    const bit = createBit({ title: "Design sprint" });
    render(
      <BitCard bit={bit} chunkStats={{ completed: 0, total: 0 }} onClick={vi.fn()} parentColor="hsl(221, 83%, 53%)" />,
    );
    expect(screen.queryByLabelText("Design sprint options")).not.toBeInTheDocument();
  });
});
