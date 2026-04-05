import { closestCenter, pointerWithin, type CollisionDetection } from "@dnd-kit/core";

export type GridDropData =
  | {
      kind: "grid-cell";
      parentId: string | null;
      x: number;
      y: number;
    }
  | {
      kind: "grid-node-drop";
      targetNodeId: string;
      targetNodeTitle?: string;
    }
  | {
      kind: "grid-breadcrumb-drop";
      targetNodeId: string | null;
    };

export function isGridDropData(value: unknown): value is GridDropData {
  if (typeof value !== "object" || value === null || !("kind" in value)) {
    return false;
  }

  return (
    (value.kind === "grid-cell" &&
      "parentId" in value &&
      (typeof value.parentId === "string" || value.parentId === null) &&
      "x" in value &&
      typeof value.x === "number" &&
      "y" in value &&
      typeof value.y === "number") ||
    (value.kind === "grid-node-drop" &&
      "targetNodeId" in value &&
      typeof value.targetNodeId === "string") ||
    (value.kind === "grid-breadcrumb-drop" &&
      "targetNodeId" in value &&
      (typeof value.targetNodeId === "string" || value.targetNodeId === null))
  );
}

export function getGridCellDropId(parentId: string | null, x: number, y: number): string {
  return `grid-cell:${parentId ?? "root"}:${x}:${y}`;
}

export function getGridNodeDropId(nodeId: string): string {
  return `grid-node-drop:${nodeId}`;
}

export function getGridBreadcrumbDropId(nodeId: string | null): string {
  return `grid-breadcrumb:${nodeId ?? "root"}`;
}

export const gridCollisionDetection: CollisionDetection = (args) => {
  const pointerCandidates = pointerWithin(args).filter(
    (candidate) =>
      typeof candidate.id === "string" &&
      (candidate.id.startsWith("grid-node-drop:") ||
        candidate.id.startsWith("grid-breadcrumb:")),
  );

  if (pointerCandidates.length > 0) {
    return pointerCandidates;
  }

  return closestCenter(args).filter(
    (candidate) =>
      typeof candidate.id === "string" &&
      candidate.id.startsWith("grid-cell:"),
  );
};
