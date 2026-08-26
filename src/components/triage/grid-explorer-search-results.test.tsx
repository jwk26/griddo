import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GridExplorerSearchResult } from "@/lib/utils/grid-explorer-search";
import { GridExplorerSearchResults } from "./grid-explorer-search-results";

function result(
  key: GridExplorerSearchResult["key"],
  overrides: Partial<GridExplorerSearchResult> = {},
): GridExplorerSearchResult {
  const [type, id] = key.split(":") as ["node" | "bit", string];
  return {
    key,
    id,
    type,
    title: type === "node" ? "Alpha" : "Alpha note",
    icon: type === "node" ? "folder" : "list",
    color: type === "node" ? "hsl(210, 50%, 50%)" : null,
    breadcrumb: "Home / Projects",
    ancestorIds: ["projects"],
    nodePathIds: type === "node" ? ["projects", id] : ["projects"],
    hierarchyOrder: 0,
    relevance: "title-prefix",
    rank: 1,
    duplicate: null,
    ...overrides,
  };
}

const defaultProps = {
  feedback: null,
  focusTarget: { kind: "input" } as const,
  query: "",
  resultScrollTop: 0,
  results: [] as GridExplorerSearchResult[],
  status: "idle" as const,
  onClose: vi.fn(),
  onFocusInput: vi.fn(),
  onFocusResult: vi.fn(),
  onQueryChange: vi.fn(),
  onRetry: vi.fn(),
  onScrollTopChange: vi.fn(),
  onSelectResult: vi.fn(),
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("GridExplorerSearchResults", () => {
  it("renders the fixed input, fixed pre-search state, and close action", () => {
    render(<GridExplorerSearchResults {...defaultProps} />);

    expect(screen.getByPlaceholderText("Search all Nodes and Bits")).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Search the entire Grid Explorer.",
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Clear and close Explorer search",
      }),
    );
    expect(defaultProps.onClose).toHaveBeenCalledOnce();
  });

  it("renders typed flat results and exact duplicate text without drag semantics", () => {
    render(
      <GridExplorerSearchResults
        {...defaultProps}
        query="alpha"
        status="ready"
        results={[
          result("node:alpha", {
            duplicate: { index: 1, total: 2 },
          }),
          result("bit:alpha-note", { hierarchyOrder: 1 }),
        ]}
      />,
    );

    expect(screen.getByText("Node")).toBeVisible();
    expect(screen.getByText("Bit")).toBeVisible();
    expect(screen.getAllByText("Home / Projects")).toHaveLength(2);
    expect(screen.getByText("Duplicate 1 of 2")).toBeVisible();
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getAllByRole("option")[0]).not.toHaveAttribute("draggable");
  });

  it("moves focus with arrows and activates the focused result with Enter", () => {
    const onFocusResult = vi.fn();
    const onSelectResult = vi.fn();
    render(
      <GridExplorerSearchResults
        {...defaultProps}
        query="alpha"
        status="ready"
        results={[result("node:alpha"), result("bit:alpha-note")]}
        onFocusResult={onFocusResult}
        onSelectResult={onSelectResult}
      />,
    );

    const input = screen.getByPlaceholderText("Search all Nodes and Bits");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(onFocusResult).toHaveBeenCalledWith("node:alpha");

    const first = screen.getAllByRole("option")[0];
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(onFocusResult).toHaveBeenLastCalledWith("bit:alpha-note");
    fireEvent.keyDown(first, { key: "Enter" });
    expect(onSelectResult).toHaveBeenCalledWith(expect.objectContaining({ key: "node:alpha" }));
  });

  it("renders loading, stale, no-result, error, and stale-selection states", () => {
    const view = render(
      <GridExplorerSearchResults {...defaultProps} query="alpha" status="loading" />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Searching Grid Explorer…");
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-busy", "true");

    view.rerender(
      <GridExplorerSearchResults
        {...defaultProps}
        query="alpha"
        status="refreshing"
        results={[result("node:alpha")]}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Updating results…");
    expect(screen.getAllByRole("option")).toHaveLength(1);

    view.rerender(
      <GridExplorerSearchResults {...defaultProps} query="alpha" status="ready" />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("No results for “alpha”.");

    view.rerender(
      <GridExplorerSearchResults {...defaultProps} query="alpha" status="error" />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Search couldn’t be updated.");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(defaultProps.onRetry).toHaveBeenCalled();

    view.rerender(
      <GridExplorerSearchResults
        {...defaultProps}
        feedback="stale-selection"
        query="alpha"
        status="ready"
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "That item is no longer available. Results were updated.",
    );
  });
});
