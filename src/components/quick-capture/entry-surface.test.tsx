import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EntrySurface } from "./entry-surface";

type MotionDivProps = ComponentProps<"div"> & {
  animate?: unknown;
  exit?: unknown;
  initial?: unknown;
  variants?: unknown;
};

vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    div: ({ animate, exit, initial, variants, ...props }: MotionDivProps) => (
      <div
        data-motion-animate={String(animate)}
        data-motion-exit={String(exit)}
        data-motion-initial={String(initial)}
        data-motion-variants={variants ? "present" : "absent"}
        {...props}
      />
    ),
  },
  useReducedMotion: () => false,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("EntrySurface", () => {
  it("renders scratch, create actions, and a non-interactive command palette hint", () => {
    render(
      <EntrySurface
        canCreateNode={true}
        onClose={vi.fn()}
        onCreateBit={vi.fn()}
        onCreateNode={vi.fn()}
        onScratch={vi.fn()}
        open={true}
      />,
    );

    expect(screen.getByRole("button", { name: "New Scratch" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New Node" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New Bit" })).toBeInTheDocument();
    expect(screen.getByText("Command palette").closest("div")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(screen.getByText("⌘K")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /command palette/i })).not.toBeInTheDocument();
  });

  it("omits the node row when node creation is unavailable", () => {
    render(
      <EntrySurface
        canCreateNode={false}
        onClose={vi.fn()}
        onCreateBit={vi.fn()}
        onCreateNode={vi.fn()}
        onScratch={vi.fn()}
        open={true}
      />,
    );

    expect(screen.queryByRole("button", { name: "New Node" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New Bit" })).toBeInTheDocument();
  });

  it("closes on Escape and outside mouse down", () => {
    const onClose = vi.fn();

    render(
      <div>
        <EntrySurface
          canCreateNode={true}
          onClose={onClose}
          onCreateBit={vi.fn()}
          onCreateNode={vi.fn()}
          onScratch={vi.fn()}
          open={true}
        />
        <button type="button">Outside</button>
      </div>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.mouseDown(screen.getByRole("button", { name: "Outside" }));
    fireEvent.mouseDown(screen.getByRole("button", { name: "New Bit" }));

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
