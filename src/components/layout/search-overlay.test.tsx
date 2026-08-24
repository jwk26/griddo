import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSearchStore } from "@/stores/search-store";
import { SearchOverlay } from "./search-overlay";

const pushMock = vi.hoisted(() => vi.fn());
const searchState = vi.hoisted(() => ({
  results: [] as Array<{
    deadline: number | null;
    id: string;
    parentPath: string[];
    title: string;
    type: "node" | "bit" | "chunk";
  }>,
}));
const departureState = vi.hoisted(() => ({
  focus: vi.fn(),
  destination: null as null | {
    focus?: () => void;
    id: string;
    kind: "route";
    perform: () => void;
  },
  requestDeparture: vi.fn(),
}));

type MotionDivProps = ComponentProps<"div"> & {
  animate?: unknown;
  exit?: unknown;
  initial?: unknown;
  variants?: unknown;
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/hooks/use-search", () => ({
  useSearch: () => ({ results: searchState.results }),
}));

vi.mock("@/hooks/use-triage-departure", () => ({
  captureTriageRouteFocus: vi.fn(() => departureState.focus),
  requestActiveTriageDeparture: departureState.requestDeparture,
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
  searchState.results = [];
  departureState.destination = null;
});

describe("SearchOverlay", () => {
  it("does not handle Cmd+K globally", () => {
    render(<SearchOverlay />);

    fireEvent.keyDown(window, { key: "k", metaKey: true });

    expect(useSearchStore.getState().isOpen).toBe(false);
  });

  it.each(["mouse", "keyboard"] as const)(
    "captures a %s result route before router mutation",
    (input) => {
      searchState.results = [
        {
          deadline: null,
          id: "node-2",
          parentPath: ["Home"],
          title: "Destination",
          type: "node",
        },
      ];
      departureState.requestDeparture.mockImplementation((destination) => {
        departureState.destination = destination;
        return "decision-required";
      });
      useSearchStore.setState({ isOpen: true, query: "destination" });
      render(<SearchOverlay />);

      const option = screen.getByRole("option", { name: /Destination/ });
      if (input === "mouse") {
        fireEvent.click(option);
      } else {
        const searchbox = screen.getByRole("textbox");
        fireEvent.keyDown(searchbox, { key: "ArrowDown" });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      }

      expect(pushMock).not.toHaveBeenCalled();
      expect(departureState.destination).toMatchObject({
        id: "/grid/node-2",
        kind: "route",
      });
      expect(departureState.destination?.focus).toBe(departureState.focus);
      expect(useSearchStore.getState().isOpen).toBe(false);

      departureState.destination?.perform();
      expect(pushMock).toHaveBeenCalledOnce();
      expect(pushMock).toHaveBeenCalledWith("/grid/node-2");
    },
  );
});
