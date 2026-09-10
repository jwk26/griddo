import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentPropsWithoutRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TriageDragItem } from "@/hooks/use-dnd";
import type { Bit, Node } from "@/types";
import { BitCard } from "@/components/grid/bit-card";
import { NodeCard } from "@/components/grid/node-card";
import { ArchiveOperationCard } from "./breakdown-panel";
import { TriageDragToken } from "./triage-drag-token";

vi.mock("motion/react", () => ({
  motion: {
    button: ({
      animate: _animate,
      initial: _initial,
      transition: _transition,
      variants: _variants,
      whileHover: _whileHover,
      ...props
    }: ComponentPropsWithoutRef<"button"> & Record<string, unknown>) => (
      <>
        {void _animate}
        {void _initial}
        {void _transition}
        {void _variants}
        {void _whileHover}
        <button {...props} />
      </>
    ),
  },
}));

vi.mock("@/hooks/use-archive", () => ({
  useArchiveActions: () => ({ archive: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("data-color-theme");
  document.documentElement.classList.remove("dark");
});

const node = {
  id: "node-1",
  title: "Projects",
  color: "#5577cc",
  icon: "folder",
  deadline: null,
  deadlineAllDay: false,
  mtime: 1,
  createdAt: 1,
  parentId: null,
  level: 0,
  x: 0,
  y: 0,
  deletedAt: null,
  archivedAt: null,
  systemRole: null,
  hiddenFromGrid: false,
  version: 1,
  pastDeadlineDismissed: false,
} as Node;

const bit = {
  id: "bit-1",
  title: "Review visual evidence",
  description: "",
  icon: "file",
  parentId: "node-1",
  x: 0,
  y: 0,
  status: "active",
  priority: null,
  deadline: null,
  deadlineAllDay: false,
  mtime: 1,
  createdAt: 1,
  deletedAt: null,
  archivedAt: null,
  version: 1,
  pastDeadlineDismissed: false,
} as Bit;

describe("Inbox/Triage Stage A semantic conformance", () => {
  it.each([
    ["triage-breakdown", "Break down the release"],
    ["triage-staged-node", "Release"],
    ["triage-staged-bit", "Review evidence"],
  ] as const)("exposes a non-color source identity for %s drag previews", (kind, label) => {
    const item = {
      kind,
      id: "source-1",
      label,
      scratchId: "scratch-1",
      sourceBreakdownId: "breakdown-1",
      sourceVersion: 1,
      sourceLifecycle: "active",
      candidateVersion: kind === "triage-breakdown" ? undefined : 2,
      resultType:
        kind === "triage-staged-node"
          ? "node"
          : kind === "triage-staged-bit"
            ? "bit"
            : undefined,
    } as NonNullable<TriageDragItem>;

    const { container } = render(<TriageDragToken item={item} />);
    const token = container.firstElementChild;

    expect(token).toHaveAttribute("data-triage-role", "drag-token");
    expect(token).toHaveAttribute("data-triage-state", `source ${kind}`);
    expect(token).toHaveAttribute("data-triage-drag-token", kind);
  });

  it("keeps the actual Node card and separate Undo action identifiable across theme changes", () => {
    document.documentElement.dataset.colorTheme = "neumorphism";
    const view = render(
      <NodeCard
        data-triage-role="explorer-node-card"
        data-triage-state="newly-placed"
        isNewlyPlaced
        node={node}
        undo={{ disabled: false, onActivate: vi.fn(), reason: "available" }}
        onClick={vi.fn()}
      />,
    );
    const card = screen.getByRole("button", { name: "Projects" });
    const undo = screen.getByRole("button", { name: "Undo placement of Projects" });

    expect(card).toHaveAttribute("data-triage-role", "explorer-node-card");
    expect(card).toHaveAttribute("data-triage-state", "newly-placed");
    expect(undo).toHaveAttribute("data-triage-role", "newly-undo-action");

    document.documentElement.dataset.colorTheme = "retro-mac";
    document.documentElement.classList.add("dark");
    view.rerender(
      <NodeCard
        data-triage-role="explorer-node-card"
        data-triage-state="newly-placed"
        isNewlyPlaced
        node={node}
        undo={{ disabled: false, onActivate: vi.fn(), reason: "available" }}
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Projects" })).toBe(card);
    expect(screen.getByRole("button", { name: "Undo placement of Projects" })).toBe(undo);
  });

  it("keeps the keyboard-operable Bit card and separate Undo action non-color identifiable", () => {
    render(
      <BitCard
        aria-label="Review visual evidence"
        bit={bit}
        chunkStats={{ completed: 0, total: 0 }}
        data-triage-role="explorer-bit-card"
        data-triage-state="newly-placed"
        isNewlyPlaced
        parentColor="#5577cc"
        undo={{ disabled: true, onActivate: vi.fn(), reason: "pending" }}
        onClick={vi.fn()}
      />,
    );

    const card = screen.getByRole("button", { name: "Review visual evidence" });
    const undo = screen.getByRole("button", {
      name: "Undo placement of Review visual evidence",
    });
    expect(card).toHaveAttribute("data-triage-role", "explorer-bit-card");
    expect(card).toHaveAttribute("data-triage-state", "newly-placed");
    expect(undo).toHaveAttribute("aria-disabled", "true");
    expect(undo).toHaveAttribute("data-triage-role", "newly-undo-action");
    expect(undo).toHaveAttribute("data-undo-reason", "pending");
  });

  it("keeps Archive state, status, and actions in one labelled in-section surface", () => {
    render(<ArchiveOperationCard onCancel={vi.fn()} onArchive={vi.fn()} />);

    const card = screen.getByText("Scratch complete").closest("[data-triage-role]");
    expect(card).toHaveAttribute("data-triage-role", "archive-status");
    expect(screen.getByRole("button", { name: "Archive Scratch" })).toHaveAttribute(
      "data-triage-role",
      "archive-current-action",
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveAttribute(
      "data-triage-role",
      "archive-cancel",
    );
  });
});
