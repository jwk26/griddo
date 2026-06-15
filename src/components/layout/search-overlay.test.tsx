import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSearchStore } from "@/stores/search-store";
import { SearchOverlay } from "./search-overlay";

type MotionDivProps = ComponentProps<"div"> & {
  animate?: unknown;
  exit?: unknown;
  initial?: unknown;
  variants?: unknown;
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/hooks/use-search", () => ({
  useSearch: () => ({ results: [] }),
}));

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
}));

function resetSearchStore() {
  useSearchStore.setState({ isOpen: false, query: "" });
}

afterEach(() => {
  cleanup();
  resetSearchStore();
  vi.clearAllMocks();
});

describe("SearchOverlay", () => {
  it("does not handle Cmd+K globally", () => {
    render(<SearchOverlay />);

    fireEvent.keyDown(window, { key: "k", metaKey: true });

    expect(useSearchStore.getState().isOpen).toBe(false);
  });
});
