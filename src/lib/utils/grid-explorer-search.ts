import type { Bit, Node } from "@/types";

export type GridExplorerSearchRelevance =
  | "title-exact"
  | "title-prefix"
  | "title-substring"
  | "title-breadcrumb-split"
  | "breadcrumb-only";

export type GridExplorerSearchResult = Readonly<{
  key: `node:${string}` | `bit:${string}`;
  id: string;
  type: "node" | "bit";
  title: string;
  icon: string;
  color: string | null;
  breadcrumb: string;
  ancestorIds: readonly string[];
  nodePathIds: readonly string[];
  hierarchyOrder: number;
  relevance: GridExplorerSearchRelevance;
  rank: 0 | 1 | 2 | 3 | 4;
  duplicate: Readonly<{ index: number; total: number }> | null;
}>;

export type GridExplorerSearchInput = Readonly<{
  nodes: readonly Node[];
  bits: readonly Bit[];
  query: string;
}>;

export type GridExplorerSearchRequest = GridExplorerSearchInput &
  Readonly<{ signal: AbortSignal }>;

export type GridExplorerSearchRunner = (
  request: GridExplorerSearchRequest,
) => Promise<GridExplorerSearchResult[]>;

type TraversedItem = Readonly<{
  item: Node | Bit;
  type: "node" | "bit";
  breadcrumb: string;
  ancestorIds: readonly string[];
  nodePathIds: readonly string[];
  hierarchyOrder: number;
}>;

type Match = Readonly<{
  relevance: GridExplorerSearchRelevance;
  rank: 0 | 1 | 2 | 3 | 4;
}>;

const HOME_BREADCRUMB = "Home";

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function compareGridPosition(
  left: Readonly<{ id: string; x: number; y: number }>,
  right: Readonly<{ id: string; x: number; y: number }>,
): number {
  return left.y - right.y || left.x - right.x || compareText(left.id, right.id);
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function isActiveNode(node: Node): boolean {
  return (
    node.deletedAt === null &&
    node.archivedAt === null &&
    node.systemRole === null &&
    !node.hiddenFromGrid
  );
}

function isActiveBit(bit: Bit): boolean {
  return bit.deletedAt === null && bit.archivedAt === null;
}

function rankMatch(title: string, breadcrumb: string, query: string): Match | null {
  const normalizedTitle = normalize(title);
  const normalizedBreadcrumb = normalize(breadcrumb);
  const tokens = query.split(" ");
  const tokenInTitle = tokens.map((token) => normalizedTitle.includes(token));
  const tokenInBreadcrumb = tokens.map((token) =>
    normalizedBreadcrumb.includes(token),
  );

  if (
    !tokens.every(
      (_, index) => tokenInTitle[index] || tokenInBreadcrumb[index],
    )
  ) {
    return null;
  }
  if (normalizedTitle === query) {
    return { relevance: "title-exact", rank: 0 };
  }
  if (normalizedTitle.startsWith(query)) {
    return { relevance: "title-prefix", rank: 1 };
  }
  if (tokenInTitle.every(Boolean)) {
    return { relevance: "title-substring", rank: 2 };
  }
  if (tokenInTitle.some(Boolean)) {
    return { relevance: "title-breadcrumb-split", rank: 3 };
  }
  return { relevance: "breadcrumb-only", rank: 4 };
}

function traverseReachableItems(
  nodes: readonly Node[],
  bits: readonly Bit[],
): TraversedItem[] {
  const childrenByParent = new Map<string | null, Node[]>();
  const bitsByParent = new Map<string, Bit[]>();

  for (const node of nodes) {
    if (!isActiveNode(node)) continue;
    const siblings = childrenByParent.get(node.parentId) ?? [];
    siblings.push(node);
    childrenByParent.set(node.parentId, siblings);
  }
  for (const bit of bits) {
    if (!isActiveBit(bit)) continue;
    const siblings = bitsByParent.get(bit.parentId) ?? [];
    siblings.push(bit);
    bitsByParent.set(bit.parentId, siblings);
  }
  for (const siblings of childrenByParent.values()) {
    siblings.sort(compareGridPosition);
  }
  for (const siblings of bitsByParent.values()) {
    siblings.sort(compareGridPosition);
  }

  const traversed: TraversedItem[] = [];
  const visited = new Set<string>();

  function visitNode(
    current: Node,
    ancestorIds: readonly string[],
    ancestorTitles: readonly string[],
  ) {
    if (visited.has(current.id)) return;
    visited.add(current.id);

    const breadcrumb = [HOME_BREADCRUMB, ...ancestorTitles].join(" / ");
    const nodePathIds = [...ancestorIds, current.id];
    traversed.push({
      item: current,
      type: "node",
      breadcrumb,
      ancestorIds,
      nodePathIds,
      hierarchyOrder: traversed.length,
    });

    const nextTitles = [...ancestorTitles, current.title];
    for (const child of childrenByParent.get(current.id) ?? []) {
      visitNode(child, nodePathIds, nextTitles);
    }
    for (const childBit of bitsByParent.get(current.id) ?? []) {
      traversed.push({
        item: childBit,
        type: "bit",
        breadcrumb: [HOME_BREADCRUMB, ...nextTitles].join(" / "),
        ancestorIds: nodePathIds,
        nodePathIds,
        hierarchyOrder: traversed.length,
      });
    }
  }

  for (const root of childrenByParent.get(null) ?? []) {
    visitNode(root, [], []);
  }

  return traversed;
}

export function searchGridExplorer({
  nodes,
  bits,
  query,
}: GridExplorerSearchInput): GridExplorerSearchResult[] {
  const normalizedQuery = normalize(query);
  if (normalizedQuery.length === 0) return [];

  const ranked = traverseReachableItems(nodes, bits)
    .map((entry) => {
      const match = rankMatch(
        entry.item.title,
        entry.breadcrumb,
        normalizedQuery,
      );
      if (match === null) return null;
      return {
        key: `${entry.type}:${entry.item.id}` as const,
        id: entry.item.id,
        type: entry.type,
        title: entry.item.title,
        icon: entry.item.icon,
        color: entry.type === "node" ? (entry.item as Node).color : null,
        breadcrumb: entry.breadcrumb,
        ancestorIds: entry.ancestorIds,
        nodePathIds: entry.nodePathIds,
        hierarchyOrder: entry.hierarchyOrder,
        relevance: match.relevance,
        rank: match.rank,
        duplicate: null,
      } satisfies GridExplorerSearchResult;
    })
    .filter((result): result is NonNullable<typeof result> => result !== null)
    .sort(
      (left, right) =>
        left.rank - right.rank || left.hierarchyOrder - right.hierarchyOrder,
    );

  const duplicateIndexes = new Map<string, number[]>();
  ranked.forEach((result, index) => {
    const identity = `${result.type}\u0000${normalize(result.title)}\u0000${normalize(result.breadcrumb)}`;
    const indexes = duplicateIndexes.get(identity) ?? [];
    indexes.push(index);
    duplicateIndexes.set(identity, indexes);
  });

  return ranked.map((result, index) => {
    const identity = `${result.type}\u0000${normalize(result.title)}\u0000${normalize(result.breadcrumb)}`;
    const indexes = duplicateIndexes.get(identity) ?? [index];
    if (indexes.length === 1) return result;
    return {
      ...result,
      duplicate: {
        index: indexes.indexOf(index) + 1,
        total: indexes.length,
      },
    };
  });
}

export const runGridExplorerSearch: GridExplorerSearchRunner = async ({
  signal,
  ...input
}) => {
  if (signal.aborted) throw new DOMException("Search cancelled", "AbortError");
  const results = searchGridExplorer(input);
  if (signal.aborted) throw new DOMException("Search cancelled", "AbortError");
  return results;
};
