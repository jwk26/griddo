import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ComponentPropsWithoutRef, PropsWithChildren } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Bit, Chunk, Node } from "@/types";

const closeMock = vi.hoisted(() => vi.fn());
const useBitDetailMock = vi.hoisted(() => vi.fn());
const updateBitMock = vi.hoisted(() => vi.fn(async () => undefined));
const updateNodeMock = vi.hoisted(() => vi.fn(async () => undefined));
const softDeleteBitMock = vi.hoisted(() => vi.fn(async () => undefined));
const promoteBitToNodeMock = vi.hoisted(() => vi.fn(async () => undefined));

type DivProps = PropsWithChildren<ComponentPropsWithoutRef<"div">>;
type ButtonProps = PropsWithChildren<ComponentPropsWithoutRef<"button">>;

function MockFragment({ children }: PropsWithChildren) {
  return <>{children}</>;
}

function MockDiv({ children, ...props }: DivProps) {
  return <div {...props}>{children}</div>;
}

function MockButton({ children, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} {...props}>
      {children}
    </button>
  );
}

vi.mock("motion/react", () => ({
  AnimatePresence: MockFragment,
  motion: {
    div: MockDiv,
  },
}));

vi.mock("@/hooks/use-bit-detail", () => ({
  useBitDetail: useBitDetailMock,
}));

vi.mock("@/hooks/use-bit-detail-actions", () => ({
  useBitDetailActions: () => ({
    updateBit: updateBitMock,
    updateNode: updateNodeMock,
    softDeleteBit: softDeleteBitMock,
    promoteBitToNode: promoteBitToNodeMock,
  }),
}));

vi.mock("@/components/shared/deadline-conflict-modal", () => ({
  DeadlineConflictModal: ({
    open,
    onKeepChild,
    onUpdateParent,
  }: {
    open: boolean;
    onKeepChild: () => void;
    onUpdateParent: () => void;
  }) =>
    open ? (
      <div data-testid="deadline-conflict-modal">
        <button aria-label="Cancel change" onClick={onKeepChild} type="button">
          Cancel change
        </button>
        <button aria-label="Update parent" onClick={onUpdateParent} type="button">
          Update parent
        </button>
      </div>
    ) : null,
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: MockFragment,
  DropdownMenuTrigger: MockFragment,
  DropdownMenuContent: MockDiv,
  DropdownMenuItem: MockButton,
  DropdownMenuSeparator: MockDiv,
}));

vi.mock("@/components/ui/popover", () => ({
  Popover: MockFragment,
  PopoverTrigger: MockFragment,
  PopoverContent: MockDiv,
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: MockDiv,
}));

const { BitDetailPopup } = await import("@/components/bit-detail/bit-detail-popup");

function createBit(overrides: Partial<Bit> = {}): Bit {
  return {
    id: overrides.id ?? "bit-1",
    title: overrides.title ?? "Refine detail surface",
    description: overrides.description ?? "",
    icon: overrides.icon ?? "Box",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    priority: overrides.priority ?? null,
    status: overrides.status ?? "active",
    mtime: overrides.mtime ?? Date.now(),
    createdAt: overrides.createdAt ?? Date.now(),
    parentId: overrides.parentId ?? "node-1",
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
  };
}

function createChunk(overrides: Partial<Chunk> = {}): Chunk {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Chunk",
    description: overrides.description ?? "",
    time: overrides.time ?? null,
    timeAllDay: overrides.timeAllDay ?? false,
    status: overrides.status ?? "incomplete",
    order: overrides.order ?? 0,
    parentId: overrides.parentId ?? "bit-1",
  };
}

function createNode(overrides: Partial<Node> = {}): Node {
  return {
    id: overrides.id ?? "node-1",
    title: overrides.title ?? "Parent node",
    color: overrides.color ?? "hsl(221, 83%, 53%)",
    icon: overrides.icon ?? "Folder",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    mtime: overrides.mtime ?? Date.now(),
    createdAt: overrides.createdAt ?? Date.now(),
    parentId: overrides.parentId ?? null,
    level: overrides.level ?? 0,
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
  };
}

function mockBitDetail(bit: Bit, chunks: Chunk[] = [], parentNode: Node | null = null) {
  useBitDetailMock.mockReturnValue({
    bit,
    chunks,
    parentNode,
    isOpen: true,
    close: closeMock,
  });
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("BitDetailPopup", () => {
  it("keeps a stable description shell when entering edit mode", () => {
    mockBitDetail(createBit({ description: "" }));

    render(<BitDetailPopup />);

    const shell = screen.getByTestId("description-shell");
    expect(within(shell).getByRole("button", { name: "Add description" })).toBeInTheDocument();

    fireEvent.click(within(shell).getByRole("button", { name: "Add description" }));

    const sameShell = screen.getByTestId("description-shell");
    expect(sameShell).toBe(shell);
    expect(within(sameShell).getByLabelText("Description")).toBeInTheDocument();
  });

  it("starts collapsed for an empty description and collapses again on blur", () => {
    mockBitDetail(createBit({ description: "" }));

    render(<BitDetailPopup />);

    fireEvent.click(screen.getByRole("button", { name: "Add description" }));

    const textarea = screen.getByLabelText("Description");
    expect(textarea).toBeInTheDocument();

    fireEvent.blur(textarea);

    expect(screen.getByRole("button", { name: "Add description" })).toBeInTheDocument();
    expect(updateBitMock).not.toHaveBeenCalled();
  });

  it("shows the completion ring in the steps header row instead of the timeline step counter", () => {
    mockBitDetail(createBit(), [
      createChunk({
        id: "chunk-1",
        title: "Timed step",
        status: "complete",
        time: new Date(2026, 3, 10, 9, 0).getTime(),
        order: 0,
      }),
      createChunk({
        id: "chunk-2",
        title: "Untimed step",
        status: "incomplete",
        time: null,
        order: 1,
      }),
    ]);

    render(<BitDetailPopup />);

    expect(screen.getByRole("img", { name: "1 of 2 steps complete" })).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.queryByText("1/2 steps")).not.toBeInTheDocument();
    expect(screen.getAllByText("Timed step")).toHaveLength(1);
    expect(screen.getAllByText("Untimed step")).toHaveLength(1);
  });

  it("opens deadline editing from the formatted label and escapes without closing the popup", () => {
    mockBitDetail(createBit({ deadline: new Date(2026, 3, 10, 9, 30).getTime() }));

    render(<BitDetailPopup />);

    fireEvent.click(screen.getByRole("button", { name: "Edit deadline date" }));

    const dateInput = screen.getByLabelText("Deadline date");
    expect(dateInput).toBeInTheDocument();

    fireEvent.keyDown(dateInput, { key: "Escape" });

    expect(closeMock).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("Deadline date")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit deadline date" })).toBeInTheDocument();
  });

  it("surfaces a deadline conflict modal and can update the parent deadline", async () => {
    const parentDeadline = new Date(2026, 3, 12, 9, 30).getTime();
    const nextDateStr = "2026-04-13";
    const nextDeadline = new Date(`${nextDateStr}T09:30`).getTime();
    const conflict = Object.assign(new Error("Deadline conflict"), {
      name: "DeadlineConflictError",
    });

    updateBitMock.mockRejectedValueOnce(conflict).mockResolvedValueOnce(undefined);
    mockBitDetail(
      createBit({ deadline: new Date(2026, 3, 10, 9, 30).getTime() }),
      [],
      createNode({ deadline: parentDeadline }),
    );

    render(<BitDetailPopup />);

    fireEvent.click(screen.getByRole("button", { name: "Edit deadline date" }));
    fireEvent.change(screen.getByLabelText("Deadline date"), {
      target: { value: nextDateStr },
    });

    expect(await screen.findByTestId("deadline-conflict-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Update parent" }));

    await waitFor(() => {
      expect(updateNodeMock).toHaveBeenCalledWith("node-1", {
        deadline: nextDeadline,
        deadlineAllDay: false,
      });
    });
    await waitFor(() => {
      expect(updateBitMock).toHaveBeenCalledTimes(2);
    });
    expect(updateBitMock).toHaveBeenLastCalledWith("bit-1", {
      deadline: nextDeadline,
      deadlineAllDay: false,
    });
  });
});
