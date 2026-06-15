import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useQuickCaptureStore } from "@/stores/quick-capture-store";
import { useSearchStore } from "@/stores/search-store";
import { CommandPalette } from "./command-palette";

type MotionDivProps = ComponentProps<"div"> & {
  animate?: unknown;
  exit?: unknown;
  initial?: unknown;
  transition?: unknown;
  variants?: unknown;
};

type MotionButtonProps = ComponentProps<"button"> & {
  whileTap?: unknown;
};

vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    button: ({ whileTap, ...props }: MotionButtonProps) => (
      <button data-motion-while-tap={whileTap ? "present" : "absent"} {...props} />
    ),
    div: ({ animate, exit, initial, transition, variants, ...props }: MotionDivProps) => (
      <div
        data-motion-animate={String(animate)}
        data-motion-exit={String(exit)}
        data-motion-initial={String(initial)}
        data-motion-transition={transition ? "present" : "absent"}
        data-motion-variants={variants ? "present" : "absent"}
        {...props}
      />
    ),
  },
  useReducedMotion: () => false,
}));

function resetStores() {
  useQuickCaptureStore.setState({ activeOverlay: null });
  useSearchStore.setState({ isOpen: false, query: "" });
}

afterEach(() => {
  cleanup();
  resetStores();
  vi.clearAllMocks();
});

describe("CommandPalette", () => {
  it("opens from Cmd+K without opening Search directly", () => {
    render(<CommandPalette />);

    fireEvent.keyDown(window, { key: "k", metaKey: true });

    expect(useQuickCaptureStore.getState().activeOverlay).toBe("palette");
    expect(useSearchStore.getState().isOpen).toBe(false);
    expect(screen.getByRole("dialog", { name: "Command palette" })).toBeInTheDocument();
  });

  it("opens from Ctrl+K", () => {
    render(<CommandPalette />);

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });

    expect(useQuickCaptureStore.getState().activeOverlay).toBe("palette");
  });

  it("switches to Scratch when key 1 is pressed while open", () => {
    useQuickCaptureStore.setState({ activeOverlay: "palette" });
    render(<CommandPalette />);

    fireEvent.keyDown(window, { key: "1" });

    expect(useQuickCaptureStore.getState().activeOverlay).toBe("scratch");
    expect(useSearchStore.getState().isOpen).toBe(false);
  });

  it("closes the palette before opening Search when key 2 is pressed", () => {
    useQuickCaptureStore.setState({ activeOverlay: "palette" });
    render(<CommandPalette />);

    fireEvent.keyDown(window, { key: "2" });

    expect(useQuickCaptureStore.getState().activeOverlay).toBe(null);
    expect(useSearchStore.getState().isOpen).toBe(true);
  });

  it("closes an already-open Search overlay before opening the palette", () => {
    useSearchStore.setState({ isOpen: true, query: "open" });
    render(<CommandPalette />);

    fireEvent.keyDown(window, { key: "k", metaKey: true });

    expect(useQuickCaptureStore.getState().activeOverlay).toBe("palette");
    expect(useSearchStore.getState().isOpen).toBe(false);
  });

  it("keeps Palette and Search from being open at the same time", () => {
    render(<CommandPalette />);

    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(useQuickCaptureStore.getState().activeOverlay).toBe("palette");
    expect(useSearchStore.getState().isOpen).toBe(false);

    fireEvent.keyDown(window, { key: "2" });
    expect(useQuickCaptureStore.getState().activeOverlay).toBe(null);
    expect(useSearchStore.getState().isOpen).toBe(true);

    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(useQuickCaptureStore.getState().activeOverlay).toBe("palette");
    expect(useSearchStore.getState().isOpen).toBe(false);
  });

  it("does not filter command rows when typing in the input", () => {
    useQuickCaptureStore.setState({ activeOverlay: "palette" });
    render(<CommandPalette />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "foo" } });

    expect(screen.getByRole("menuitem", { name: /Open Scratch Capture/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Search/ })).toBeInTheDocument();
  });
});
