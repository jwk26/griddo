import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TriageDragItem } from "@/hooks/use-dnd";
import type { Node, Bit } from "@/types";
import { HierarchyExplorer } from "./hierarchy-explorer";

vi.mock("@dnd-kit/core", () => ({
  useDroppable: vi.fn().mockReturnValue({ setNodeRef: vi.fn() }),
}));

vi.mock("@/hooks/use-grid-data", () => ({
  useGridData: vi.fn(),
}));

function createNode(overrides: Partial<Node> = {}): Node {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Node",
    color: overrides.color ?? "hsl(221, 83%, 53%)",
    icon: overrides.icon ?? "Folder",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    mtime: overrides.mtime ?? 1,
    createdAt: overrides.createdAt ?? 1,
    parentId: overrides.parentId ?? null,
    level: overrides.level ?? 0,
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
    archivedAt: overrides.archivedAt ?? null,
    systemRole: overrides.systemRole ?? null,
    hiddenFromGrid: overrides.hiddenFromGrid ?? false,
    version: overrides.version ?? 1,
    pastDeadlineDismissed: overrides.pastDeadlineDismissed ?? false,
  };
}

function createBit(overrides: Partial<Bit> = {}): Bit {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Bit",
    description: overrides.description ?? "",
    icon: overrides.icon ?? "Folder",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    priority: overrides.priority ?? null,
    status: overrides.status ?? "active",
    mtime: overrides.mtime ?? 1,
    createdAt: overrides.createdAt ?? 1,
    parentId: overrides.parentId ?? "parent-node",
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
    archivedAt: overrides.archivedAt ?? null,
    version: overrides.version ?? 1,
    pastDeadlineDismissed: overrides.pastDeadlineDismissed ?? false,
  };
}

const defaultProps: HierarchyExplorerProps = {
  activeDragItem: null,
  overTargetId: null,
  pendingPlacementDropId: null,
};

interface HierarchyExplorerProps {
  activeDragItem: TriageDragItem;
  overTargetId: string | null;
  pendingPlacementDropId: string | null;
}

describe("HierarchyExplorer", () => {
  beforeEach(async () => {
    const { useGridData } = await import("@/hooks/use-grid-data");
    vi.mocked(useGridData).mockReturnValue({ nodes: [], bits: [], isLoading: false });
  });

  afterEach(() => {
    cleanup();
  });

  describe("Test 1: Home-only — search filters Home/Grid0 Nodes only", () => {
    it("filters only the Home column nodes when typing a query", async () => {
      const { useGridData } = await import("@/hooks/use-grid-data");
      vi.mocked(useGridData).mockImplementation((parentId) => {
        if (parentId === null) {
          return {
            nodes: [
              createNode({ title: "Alpha", systemRole: null }),
              createNode({ title: "Beta", systemRole: null }),
              createNode({ title: "Gamma", systemRole: null }),
            ],
            bits: [],
            isLoading: false,
          };
        }
        return { nodes: [], bits: [], isLoading: false };
      });

      render(<HierarchyExplorer {...defaultProps} />);

      const input = screen.getByRole("searchbox", { name: /search hierarchy/i }) ||
        screen.getByPlaceholderText(/search hierarchy/i);

      fireEvent.change(input, { target: { value: "alp" } });

      expect(screen.getByText("Alpha")).toBeInTheDocument();
      expect(screen.queryByText("Beta")).not.toBeInTheDocument();
      expect(screen.queryByText("Gamma")).not.toBeInTheDocument();
    });
  });

  describe("Test 2: Level 2 active — search filters L2 Nodes and Bits only", () => {
    it("filters only L2 column nodes; Home and L1 remain unfiltered", async () => {
      const { useGridData } = await import("@/hooks/use-grid-data");

      const rootNode = createNode({ id: "home-a", title: "Home-A", systemRole: null });
      const l1Node = createNode({ id: "l1-work", title: "L1-Work" });
      const l2NodeProject = createNode({ id: "l2-proj", title: "L2-Project" });
      const l2NodeResearch = createNode({ id: "l2-res", title: "L2-Research" });

      vi.mocked(useGridData).mockImplementation((parentId) => {
        if (parentId === null) return { nodes: [rootNode], bits: [], isLoading: false };
        if (parentId === "home-a") return { nodes: [l1Node], bits: [], isLoading: false };
        if (parentId === "l1-work") return { nodes: [l2NodeProject, l2NodeResearch], bits: [], isLoading: false };
        return { nodes: [], bits: [], isLoading: false };
      });

      render(<HierarchyExplorer {...defaultProps} />);

      fireEvent.click(screen.getByRole("button", { name: "Select Node: Home-A" }));
      fireEvent.click(screen.getByRole("button", { name: "Select Node: L1-Work" }));

      const input = screen.getByRole("searchbox", { name: /search hierarchy/i }) ||
        screen.getByPlaceholderText(/search hierarchy/i);

      fireEvent.change(input, { target: { value: "project" } });

      expect(screen.getByText("L2-Project")).toBeInTheDocument();
      expect(screen.queryByText("L2-Research")).not.toBeInTheDocument();
      expect(screen.getAllByText("Home-A").length).toBeGreaterThan(0);
      expect(screen.getAllByText("L1-Work").length).toBeGreaterThan(0);
    });
  });

  describe("Test 3: Search query persists when active section changes", () => {
    it("retains search value and indicator after selecting a node", async () => {
      const { useGridData } = await import("@/hooks/use-grid-data");

      vi.mocked(useGridData).mockImplementation((parentId) => {
        if (parentId === null) {
          return {
            nodes: [
              createNode({ id: "alpha-id", title: "Alpha", systemRole: null }),
              createNode({ title: "Beta", systemRole: null }),
            ],
            bits: [],
            isLoading: false,
          };
        }
        return { nodes: [], bits: [], isLoading: false };
      });

      render(<HierarchyExplorer {...defaultProps} />);

      const input = screen.getByRole("searchbox", { name: /search hierarchy/i }) ||
        screen.getByPlaceholderText(/search hierarchy/i);

      fireEvent.change(input, { target: { value: "alp" } });

      expect(screen.getByText("Alpha")).toBeInTheDocument();
      expect(screen.queryByText("Beta")).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Select Node: Alpha" }));

      const searchInput = screen.getByRole("searchbox", { name: /search hierarchy/i }) ||
        screen.getByPlaceholderText(/search hierarchy/i);
      expect(searchInput).toHaveValue("alp");
      expect(screen.getByTestId("hierarchy-search-indicator")).toBeInTheDocument();
    });
  });

  describe("Test 4a: Visible filter indicator shows query and result count", () => {
    it("shows indicator with query and count when typing, hides when no query", async () => {
      const { useGridData } = await import("@/hooks/use-grid-data");

      vi.mocked(useGridData).mockImplementation((parentId) => {
        if (parentId === null) {
          return {
            nodes: [
              createNode({ title: "Alpha", systemRole: null }),
              createNode({ title: "Beta", systemRole: null }),
            ],
            bits: [],
            isLoading: false,
          };
        }
        return { nodes: [], bits: [], isLoading: false };
      });

      render(<HierarchyExplorer {...defaultProps} />);

      expect(screen.queryByTestId("hierarchy-search-indicator")).not.toBeInTheDocument();

      const input = screen.getByRole("searchbox", { name: /search hierarchy/i }) ||
        screen.getByPlaceholderText(/search hierarchy/i);

      fireEvent.change(input, { target: { value: "al" } });

      const indicator = screen.getByTestId("hierarchy-search-indicator");
      expect(indicator).toBeInTheDocument();

      const queryEl = screen.getByTestId("hierarchy-search-query");
      expect(queryEl.textContent).toContain("al");

      const countEl = screen.getByTestId("hierarchy-search-result-count");
      expect(countEl.textContent).toContain("1 result");

      const clearBtn =
        screen.queryByRole("button", { name: /clear hierarchy search/i }) ??
        screen.queryByTestId("hierarchy-search-clear");
      expect(clearBtn).toBeInTheDocument();
    });
  });

  describe("Test 4b: Visible filter pill does NOT show scope label text inside indicator", () => {
    it("indicator pill visible parts do not contain scope labels; column headers remain visible", async () => {
      const { useGridData } = await import("@/hooks/use-grid-data");

      vi.mocked(useGridData).mockImplementation((parentId) => {
        if (parentId === null) {
          return {
            nodes: [createNode({ title: "Alpha", systemRole: null })],
            bits: [],
            isLoading: false,
          };
        }
        return { nodes: [], bits: [], isLoading: false };
      });

      render(<HierarchyExplorer {...defaultProps} />);

      const input = screen.getByRole("searchbox", { name: /search hierarchy/i }) ||
        screen.getByPlaceholderText(/search hierarchy/i);
      fireEvent.change(input, { target: { value: "al" } });

      const indicator = screen.getByTestId("hierarchy-search-indicator");

      const queryEl = within(indicator).getByTestId("hierarchy-search-query");
      const countEl = within(indicator).getByTestId("hierarchy-search-result-count");

      expect(queryEl.textContent).not.toContain("Home");
      expect(queryEl.textContent).not.toContain("L1");
      expect(queryEl.textContent).not.toContain("L2");
      expect(queryEl.textContent).not.toContain("L3");

      expect(countEl.textContent).not.toContain("Home");
      expect(countEl.textContent).not.toContain("L1");
      expect(countEl.textContent).not.toContain("L2");
      expect(countEl.textContent).not.toContain("L3");

      // Column headers remain visible
      expect(screen.getAllByText(/^home$/i).length).toBeGreaterThan(0);
    });
  });

  describe("Test 4c: Accessible label or sr-only text exposes the active scope", () => {
    it("indicator container has aria-label or sr-only text containing the active scope name", async () => {
      const { useGridData } = await import("@/hooks/use-grid-data");

      vi.mocked(useGridData).mockImplementation((parentId) => {
        if (parentId === null) {
          return {
            nodes: [createNode({ title: "Alpha", systemRole: null })],
            bits: [],
            isLoading: false,
          };
        }
        return { nodes: [], bits: [], isLoading: false };
      });

      render(<HierarchyExplorer {...defaultProps} />);

      const input = screen.getByRole("searchbox", { name: /search hierarchy/i }) ||
        screen.getByPlaceholderText(/search hierarchy/i);
      fireEvent.change(input, { target: { value: "al" } });

      const indicator = screen.getByTestId("hierarchy-search-indicator");

      const hasAriaLabel = indicator.getAttribute("aria-label")?.includes("Home");
      const srOnlyEl = indicator.querySelector(".sr-only");
      const hasSrOnly = srOnlyEl?.textContent?.includes("Home");

      expect(hasAriaLabel || hasSrOnly).toBe(true);
    });
  });

  describe("Test 4d: Active hierarchy section receives scope-highlight, inactive are de-emphasized", () => {
    it("applies data-scope-active to Home column and data-scope-inactive to others when query active", async () => {
      const { useGridData } = await import("@/hooks/use-grid-data");

      vi.mocked(useGridData).mockImplementation((parentId) => {
        if (parentId === null) {
          return {
            nodes: [
              createNode({ title: "Alpha", systemRole: null }),
              createNode({ title: "Beta", systemRole: null }),
            ],
            bits: [],
            isLoading: false,
          };
        }
        return { nodes: [], bits: [], isLoading: false };
      });

      render(<HierarchyExplorer {...defaultProps} />);

      expect(document.querySelector("[data-scope-active]")).toBeNull();

      const input = screen.getByRole("searchbox", { name: /search hierarchy/i }) ||
        screen.getByPlaceholderText(/search hierarchy/i);
      fireEvent.change(input, { target: { value: "al" } });

      const sectionBody = screen.getByTestId("hierarchy-section-body-home");
      const homeColumn = sectionBody.closest("[data-scope-active]");
      expect(homeColumn).not.toBeNull();

      expect(document.querySelector("[data-scope-inactive]")).not.toBeNull();
    });
  });

  describe("Test 5: Clear button empties the query", () => {
    it("clears search input and hides indicator when clear button is clicked", async () => {
      const { useGridData } = await import("@/hooks/use-grid-data");

      vi.mocked(useGridData).mockImplementation((parentId) => {
        if (parentId === null) {
          return {
            nodes: [createNode({ title: "Alpha", systemRole: null })],
            bits: [],
            isLoading: false,
          };
        }
        return { nodes: [], bits: [], isLoading: false };
      });

      render(<HierarchyExplorer {...defaultProps} />);

      const input = screen.getByRole("searchbox", { name: /search hierarchy/i }) ||
        screen.getByPlaceholderText(/search hierarchy/i);
      fireEvent.change(input, { target: { value: "alp" } });

      expect(screen.getByTestId("hierarchy-search-indicator")).toBeInTheDocument();

      const clearBtn =
        screen.getByRole("button", { name: /clear hierarchy search/i }) ??
        screen.getByTestId("hierarchy-search-clear");
      fireEvent.click(clearBtn);

      const searchInput = screen.getByRole("searchbox", { name: /search hierarchy/i }) ||
        screen.getByPlaceholderText(/search hierarchy/i);
      expect(searchInput).toHaveValue("");
      expect(screen.queryByTestId("hierarchy-search-indicator")).not.toBeInTheDocument();
      expect(screen.getByText("Alpha")).toBeInTheDocument();
    });
  });

  describe("Test 6: Invalid drop state uses muted classes, not destructive", () => {
    it("applies cursor-not-allowed and border-muted — not border-destructive — to invalid Home section body", async () => {
      const { useGridData } = await import("@/hooks/use-grid-data");

      vi.mocked(useGridData).mockImplementation((parentId) => {
        if (parentId === null) {
          return {
            nodes: [createNode({ title: "Alpha", systemRole: null })],
            bits: [],
            isLoading: false,
          };
        }
        return { nodes: [], bits: [], isLoading: false };
      });

      render(
        <HierarchyExplorer
          {...defaultProps}
          activeDragItem={{
            kind: "triage-staged-bit",
            id: "cand-1",
            label: "Todo",
            sourceBreakdownId: "bd-1",
          }}
        />
      );

      const homeBody = screen.getByTestId("hierarchy-section-body-home");
      expect(homeBody).not.toHaveClass("border-destructive");
      expect(homeBody).toHaveClass("cursor-not-allowed");
      expect(homeBody).toHaveClass("border-muted");
    });
  });

  describe("Test 7: Level 0 system nodes are excluded from Home/Grid0", () => {
    it("hides system-role nodes and shows only regular nodes", async () => {
      const { useGridData } = await import("@/hooks/use-grid-data");

      vi.mocked(useGridData).mockImplementation((parentId) => {
        if (parentId === null) {
          return {
            nodes: [
              createNode({ title: "Inbox", systemRole: "inbox" }),
              createNode({ title: "Archive", systemRole: "archive_view" }),
              createNode({ title: "My Work", systemRole: null }),
            ],
            bits: [],
            isLoading: false,
          };
        }
        return { nodes: [], bits: [], isLoading: false };
      });

      render(<HierarchyExplorer {...defaultProps} />);

      expect(screen.getByText("My Work")).toBeInTheDocument();
      expect(screen.queryByText("Inbox")).not.toBeInTheDocument();
      expect(screen.queryByText("Archive")).not.toBeInTheDocument();
    });
  });

  describe("Test 8: Nodes render before Bits in the active section (DOM order)", () => {
    it("nodes appear before bits in the L1 section body", async () => {
      const { useGridData } = await import("@/hooks/use-grid-data");

      const rootNode = createNode({ id: "home-a", title: "Home-A", systemRole: null });

      vi.mocked(useGridData).mockImplementation((parentId) => {
        if (parentId === null) return { nodes: [rootNode], bits: [], isLoading: false };
        if (parentId === "home-a") {
          return {
            nodes: [createNode({ id: "n1", title: "Node-First" })],
            bits: [createBit({ id: "b1", title: "Bit-Second", parentId: "home-a" })],
            isLoading: false,
          };
        }
        return { nodes: [], bits: [], isLoading: false };
      });

      render(<HierarchyExplorer {...defaultProps} />);

      fireEvent.click(screen.getByRole("button", { name: "Select Node: Home-A" }));

      const l1Body = screen.getByTestId("hierarchy-section-body-l1");
      const nodeEl = within(l1Body).getByText("Node-First");
      const bitEl = within(l1Body).getByText("Bit-Second");

      expect(nodeEl.compareDocumentPosition(bitEl)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
  });
});
