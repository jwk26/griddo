import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentPropsWithoutRef, PropsWithChildren } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Node } from "@/types";

type DivProps = PropsWithChildren<ComponentPropsWithoutRef<"div">>;

function MockDialog({
  children,
  open,
}: PropsWithChildren<{ open: boolean }>) {
  return open ? <div>{children}</div> : null;
}

function MockDiv({ children, ...props }: DivProps) {
  return <div {...props}>{children}</div>;
}

vi.mock("@/components/ui/dialog", () => ({
  Dialog: MockDialog,
  DialogContent: MockDiv,
  DialogDescription: MockDiv,
  DialogFooter: MockDiv,
  DialogHeader: MockDiv,
  DialogTitle: MockDiv,
}));

vi.mock("@/components/shared/date-first-deadline-picker", () => ({
  DateFirstDeadlinePicker: () => <div data-testid="deadline-picker" />,
}));

vi.mock("@/hooks/use-node-actions", () => ({
  useNodeActions: () => ({
    updateNode: vi.fn(),
  }),
}));

const { EditNodeDialog } = await import("@/components/grid/edit-node-dialog");

function createNode(overrides: Partial<Node> = {}): Node {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Node",
    color: overrides.color ?? "hsl(221, 83%, 53%)",
    icon: overrides.icon ?? "Folder",
    deadline: overrides.deadline ?? new Date(2026, 3, 22, 9, 0).getTime(),
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    mtime: overrides.mtime ?? 1,
    createdAt: overrides.createdAt ?? 1,
    parentId: overrides.parentId ?? null,
    level: overrides.level ?? 0,
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("EditNodeDialog", () => {
  it("omits the deadline section for level-0 nodes", () => {
    render(
      <EditNodeDialog
        level={0}
        node={createNode({ level: 0 })}
        onOpenChange={vi.fn()}
        open={true}
      />,
    );

    expect(screen.queryByText("Deadline")).not.toBeInTheDocument();
    expect(screen.queryByTestId("deadline-picker")).not.toBeInTheDocument();
  });

  it("shows the deadline section for nested nodes", () => {
    render(
      <EditNodeDialog
        level={1}
        node={createNode({ level: 1 })}
        onOpenChange={vi.fn()}
        open={true}
      />,
    );

    expect(screen.getByText("Deadline")).toBeInTheDocument();
    expect(screen.getByTestId("deadline-picker")).toBeInTheDocument();
  });
});
