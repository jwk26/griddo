import { describe, expect, it } from "vitest";
import type { Bit, Node } from "@/types";
import { searchGridExplorer } from "./grid-explorer-search";

function node(id: string, title: string, overrides: Partial<Node> = {}): Node {
  return {
    id,
    title,
    color: "hsl(210, 50%, 50%)",
    icon: "folder",
    deadline: null,
    deadlineAllDay: false,
    mtime: 1,
    createdAt: 1,
    version: 1,
    parentId: null,
    level: 0,
    x: 0,
    y: 0,
    deletedAt: null,
    archivedAt: null,
    systemRole: null,
    hiddenFromGrid: false,
    pastDeadlineDismissed: false,
    ...overrides,
  };
}

function bit(id: string, title: string, parentId: string, overrides: Partial<Bit> = {}): Bit {
  return {
    id,
    title,
    description: "",
    icon: "circle",
    deadline: null,
    deadlineAllDay: false,
    priority: null,
    status: "active",
    mtime: 1,
    createdAt: 1,
    version: 1,
    parentId,
    x: 0,
    y: 0,
    deletedAt: null,
    archivedAt: null,
    pastDeadlineDismissed: false,
    ...overrides,
  };
}

describe("searchGridExplorer", () => {
  it("traverses every visible Home root and only active reachable Node/Bit descendants", () => {
    const nodes = [
      node("root-b", "Root B", { x: 1 }),
      node("root-a", "Root A"),
      node("child", "Reachable child", { parentId: "root-a", level: 1 }),
      node("grandchild", "Reachable grandchild", { parentId: "child", level: 2 }),
      node("hidden", "Hidden root", { hiddenFromGrid: true, x: 2 }),
      node("hidden-child", "Hidden descendant", { parentId: "hidden", level: 1 }),
      node("system", "System root", { systemRole: "inbox", hiddenFromGrid: true, x: 3 }),
      node("system-child", "System descendant", { parentId: "system", level: 1 }),
      node("trashed", "Trashed", { deletedAt: 2, x: 4 }),
      node("archived", "Archived", { archivedAt: 2, x: 5 }),
      node("orphan", "Orphan", { parentId: "missing", level: 1 }),
    ];
    const bits = [
      bit("reachable-bit", "Reachable bit", "grandchild"),
      bit("hidden-bit", "Hidden bit", "hidden"),
      bit("orphan-bit", "Orphan bit", "missing"),
      bit("trashed-bit", "Trashed bit", "root-a", { deletedAt: 2 }),
      bit("archived-bit", "Archived bit", "root-a", { archivedAt: 2 }),
    ];

    const results = searchGridExplorer({ nodes, bits, query: "root reachable" });

    expect(results.map(({ id }) => id)).toEqual(["child", "grandchild", "reachable-bit"]);
    expect(results.at(-1)).toMatchObject({
      type: "bit",
      breadcrumb: "Home / Root A / Reachable child / Reachable grandchild",
      ancestorIds: ["root-a", "child", "grandchild"],
      nodePathIds: ["root-a", "child", "grandchild"],
    });
    expect(searchGridExplorer({ nodes, bits, query: "hidden" })).toEqual([]);
    expect(searchGridExplorer({ nodes, bits, query: "orphan" })).toEqual([]);
  });

  it("uses normalized whitespace AND matching and the exact canonical relevance order", () => {
    const nodes = [
      node("exact", "Alpha Beta", { x: 0 }),
      node("prefix", "Alpha Beta Notes", { x: 1 }),
      node("substring", "Notes Alpha Beta Today", { x: 2 }),
      node("split-parent", "Beta Parent", { x: 3 }),
      node("split", "Alpha Child", { parentId: "split-parent", level: 1 }),
      node("breadcrumb-parent", "Alpha Beta Parent", { x: 4 }),
      node("breadcrumb", "Unrelated", { parentId: "breadcrumb-parent", level: 1 }),
      node("one-token", "Alpha only", { x: 5 }),
    ];

    const results = searchGridExplorer({ nodes, bits: [], query: "  ALPHA\t beta  " });

    expect(results.map(({ id, relevance }) => [id, relevance])).toEqual([
      ["exact", "title-exact"],
      ["prefix", "title-prefix"],
      ["breadcrumb-parent", "title-prefix"],
      ["substring", "title-substring"],
      ["split", "title-breadcrumb-split"],
      ["breadcrumb", "breadcrumb-only"],
    ]);
  });

  it("breaks equal-rank ties by deterministic Grid hierarchy order", () => {
    const nodes = [
      node("later-root", "Match later", { x: 5, y: 0 }),
      node("first-root", "Match first", { x: 0, y: 0 }),
      node("lower-root", "Match lower", { x: 0, y: 1 }),
      node("later-child", "Match later child", { parentId: "first-root", level: 1, x: 4 }),
      node("first-child", "Match first child", { parentId: "first-root", level: 1, x: 1 }),
    ];
    const bits = [
      bit("later-bit", "Match later bit", "first-root", { x: 3 }),
      bit("first-bit", "Match first bit", "first-root", { x: 0 }),
    ];

    expect(searchGridExplorer({ nodes, bits, query: "match" }).map(({ id }) => id)).toEqual([
      "first-root",
      "first-child",
      "later-child",
      "first-bit",
      "later-bit",
      "later-root",
      "lower-root",
    ]);
  });

  it("retains typed item, path, ancestor, and duplicate-group identity", () => {
    const nodes = [
      node("root-a", "Same", { x: 0 }),
      node("root-b", "Same", { x: 1 }),
      node("parent-a", "Parent", { parentId: "root-a", level: 1 }),
      node("parent-b", "Parent", { parentId: "root-b", level: 1 }),
    ];
    const bits = [
      bit("bit-a", "Duplicate", "parent-a"),
      bit("bit-b", "Duplicate", "parent-b"),
    ];

    const results = searchGridExplorer({ nodes, bits, query: "duplicate" });

    expect(results).toHaveLength(2);
    expect(results.map(({ key, type, ancestorIds, breadcrumb, duplicate }) => ({
      key,
      type,
      ancestorIds,
      breadcrumb,
      duplicate,
    }))).toEqual([
      {
        key: "bit:bit-a",
        type: "bit",
        ancestorIds: ["root-a", "parent-a"],
        breadcrumb: "Home / Same / Parent",
        duplicate: { index: 1, total: 2 },
      },
      {
        key: "bit:bit-b",
        type: "bit",
        ancestorIds: ["root-b", "parent-b"],
        breadcrumb: "Home / Same / Parent",
        duplicate: { index: 2, total: 2 },
      },
    ]);
  });

  it("returns no results for an empty normalized query", () => {
    expect(searchGridExplorer({ nodes: [node("root", "Root")], bits: [], query: " \n " })).toEqual([]);
  });
});
