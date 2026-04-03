import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentPropsWithoutRef, PropsWithChildren } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Bit, Chunk } from "@/types";

const closeMock = vi.hoisted(() => vi.fn());
const useBitDetailMock = vi.hoisted(() => vi.fn());
const updateBitMock = vi.hoisted(() => vi.fn(async () => undefined));
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
    softDeleteBit: softDeleteBitMock,
    promoteBitToNode: promoteBitToNodeMock,
  }),
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

function mockBitDetail(bit: Bit, chunks: Chunk[] = []) {
  useBitDetailMock.mockReturnValue({
    bit,
    chunks,
    parentNode: null,
    isOpen: true,
    close: closeMock,
  });
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("BitDetailPopup", () => {
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
});
