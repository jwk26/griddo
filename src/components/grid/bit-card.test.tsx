import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEditModeStore } from "@/stores/edit-mode-store";
import type { Bit } from "@/types";
import { BitCard } from "./bit-card";

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
    expect(card).toHaveStyle({ filter: "saturate(0.5)" });
    expect(screen.getByText("Mar 27")).toBeInTheDocument();
    expect(screen.getByText("high")).toBeInTheDocument();
    expect(container.querySelector('[style*="width: 25%"]')).not.toBeNull();

    fireEvent.click(card!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows overdue styling and edit mode affordances for past-deadline bits", () => {
    useEditModeStore.setState({ isEditMode: true });
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

    const card = screen.getByText("Overdue bit").closest('[role="button"]');

    expect(card).not.toBeNull();
    expect(card).toHaveClass("motion-safe:animate-jiggle");
    expect(screen.getByText("Overdue bit")).toHaveClass("line-through");
    expect(screen.getByText("Done?")).toBeInTheDocument();
  });
});
