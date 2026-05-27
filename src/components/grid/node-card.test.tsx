import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Node } from "@/types";

vi.mock("motion/react", async () => {
  const React = await import("react");

  const MotionButton = React.forwardRef<
    HTMLButtonElement,
    ComponentProps<"button"> & {
      animate?: unknown;
      transition?: unknown;
      variants?: unknown;
      whileHover?: unknown;
    }
  >(function MotionButton(
    { animate, transition, variants, whileHover, ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        data-motion-animate={String(animate)}
        data-motion-transition={JSON.stringify(transition)}
        data-motion-variants={JSON.stringify(variants)}
        data-motion-while-hover={String(whileHover)}
        {...props}
      />
    );
  });

  return {
    motion: {
      button: MotionButton,
    },
  };
});

const { NodeCard } = await import("./node-card");

function createNode(overrides: Partial<Node> = {}): Node {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Node",
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

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("NodeCard", () => {
  it("uses a fixed square footprint with a non-shrinking icon and truncating title slot", () => {
    const node = createNode({ title: "Very long node title that should truncate" });
    const { container } = render(
      <NodeCard node={node} onClick={vi.fn()} />,
    );

    const card = screen.getByRole("button", {
      name: "Very long node title that should truncate",
    });
    const title = screen.getByText("Very long node title that should truncate");
    const icon = container.querySelector("svg");

    expect(card).toHaveClass(
      "grid",
      "h-[var(--grid-node-size)]",
      "w-[var(--grid-node-size)]",
      "max-h-full",
      "max-w-full",
      "grid-rows-[1fr_var(--grid-node-title-height)]",
      "theme-node-card",
      "transition-[box-shadow,background-color,filter]",
    );
    expect(title.tagName).toBe("P");
    expect(title).toHaveClass("truncate", "whitespace-nowrap", "text-center");
    expect(title.parentElement).toHaveClass("h-[var(--grid-node-title-height)]");
    expect(icon?.parentElement).toHaveClass("pb-[var(--grid-node-icon-lift)]");
    expect(icon).toHaveClass(
      "h-[var(--grid-node-icon-size)]",
      "w-[var(--grid-node-icon-size)]",
      "shrink-0",
    );
  });

  it("keeps short titles visible and retains the edit-mode delete button", () => {
    const onDelete = vi.fn();
    const node = createNode({ title: "Mail" });

    render(
      <NodeCard isEditMode={true} node={node} onClick={vi.fn()} onDelete={onDelete} />,
    );

    expect(screen.getByText("Mail")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Delete Mail"));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("uses grab cursors by default and a darker grabbing state while dragging", () => {
    const node = createNode({ title: "Health" });

    const { rerender } = render(
      <NodeCard node={node} onClick={vi.fn()} />,
    );

    const restingCard = screen.getByRole("button", { name: "Health" });
    expect(restingCard).toHaveClass(
      "cursor-grab",
      "hover:bg-muted/40",
      "active:bg-muted/60",
    );
    expect(restingCard).toHaveAttribute("data-motion-animate", "rest");
    expect(restingCard).toHaveAttribute("data-motion-while-hover", "hover");
    expect(restingCard).toHaveAttribute("data-motion-variants", expect.stringContaining('"rest":{"scale":1}'));
    expect(restingCard).toHaveAttribute("data-motion-variants", expect.stringContaining('"hover":{"scale":1.05,"zIndex":40}'));
    expect(restingCard).not.toHaveAttribute("data-motion-variants", expect.stringContaining('"nodeRest"'));
    expect(restingCard).not.toHaveClass("cursor-grabbing", "bg-muted/60");

    rerender(
      <NodeCard isDragging={true} node={node} onClick={vi.fn()} />,
    );

    const draggingCard = screen.getByRole("button", { name: "Health" });
    expect(draggingCard).toHaveClass(
      "cursor-grabbing",
      "bg-muted/60",
    );
    expect(draggingCard).toHaveAttribute("data-motion-animate", "dragging");
    expect(draggingCard).toHaveAttribute("data-motion-variants", expect.stringContaining('"dragging":{"scale":1.1,"zIndex":50}'));
  });
});
