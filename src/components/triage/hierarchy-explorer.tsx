"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Folder, Home, ListTodo } from "lucide-react";
import type { TriageDragItem } from "@/hooks/use-dnd";
import {
  getTriageHierarchyDropId,
  type TriageDropData,
} from "@/lib/grid-dnd";
import { cn } from "@/lib/utils";
import { useGridData } from "@/hooks/use-grid-data";
import type { Bit, Node } from "@/types";

interface HierarchyExplorerProps {
  activeDragItem: TriageDragItem;
  overTargetId: string | null;
  pendingPlacementDropId: string | null;
}

type HierarchyCellState =
  | "default"
  | "idle-valid"
  | "valid"
  | "pending-confirmation"
  | "invalid";

const CELL_BASE_CLASS =
  "flex w-full items-center gap-2 rounded-md border border-transparent px-3 py-2 text-left transition-[background-color,border-color,box-shadow,color] touch-action-manipulation cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

const CELL_DROP_ONLY_CLASS =
  "flex w-full items-center gap-2 rounded-md border border-transparent px-3 py-2 text-left transition-[background-color,border-color,box-shadow,color]";

const CELL_STATE_CLASSES: Record<HierarchyCellState, string> = {
  default: "",
  "idle-valid": "ring-1 ring-primary border-border/80 text-foreground",
  valid: "ring-1 ring-primary border-primary bg-accent text-foreground",
  "pending-confirmation":
    "border-ring bg-popover text-foreground motion-safe:animate-pulse",
  invalid:
    "border-destructive bg-background text-muted-foreground/50 cursor-not-allowed",
};

function getCandidateType(
  activeDragItem: TriageDragItem,
): "node" | "bit" | null {
  if (activeDragItem?.kind === "triage-staged-node") return "node";
  if (activeDragItem?.kind === "triage-staged-bit") return "bit";
  return null;
}

function acceptsCandidate({
  activeDragItem,
  parentNodeId,
  targetNodeLevel,
}: {
  activeDragItem: TriageDragItem;
  parentNodeId: string | null;
  targetNodeLevel: number | null;
}): boolean {
  const candidateType = getCandidateType(activeDragItem);

  if (candidateType === "node") {
    return targetNodeLevel === null || targetNodeLevel < 2;
  }

  if (candidateType === "bit") {
    return parentNodeId !== null;
  }

  return false;
}

function getCellState({
  activeDragItem,
  dropId,
  isAccepted,
  overTargetId,
  pendingPlacementDropId,
}: {
  activeDragItem: TriageDragItem;
  dropId: string;
  isAccepted: boolean;
  overTargetId: string | null;
  pendingPlacementDropId: string | null;
}): HierarchyCellState {
  if (pendingPlacementDropId === dropId) return "pending-confirmation";
  if (activeDragItem === null) return "default";
  if (!isAccepted) return "invalid";
  if (overTargetId === dropId) return "valid";
  return "idle-valid";
}

export function HierarchyExplorer({
  activeDragItem,
  overTargetId,
  pendingPlacementDropId,
}: HierarchyExplorerProps) {
  const [selectedL1Id, setSelectedL1Id] = useState<string | null>(null);
  const [selectedL2Id, setSelectedL2Id] = useState<string | null>(null);
  const { nodes: rootGridNodes } = useGridData(null);
  const { nodes: rawL2Nodes, bits: rawL2Bits } = useGridData(selectedL1Id);
  const { nodes: rawL3Nodes, bits: rawL3Bits } = useGridData(selectedL2Id);

  const rootNodes = useMemo(
    () => rootGridNodes.filter((node) => node.systemRole === null),
    [rootGridNodes],
  );
  const l2Nodes = selectedL1Id === null ? [] : rawL2Nodes;
  const l2Bits = selectedL1Id === null ? [] : rawL2Bits;
  const l3Nodes = selectedL2Id === null ? [] : rawL3Nodes;
  const l3Bits = selectedL2Id === null ? [] : rawL3Bits;
  const selectedL1Title =
    rootNodes.find((node) => node.id === selectedL1Id)?.title ?? null;
  const selectedL2Title =
    l2Nodes.find((node) => node.id === selectedL2Id)?.title ?? null;
  const homeIsInvalidForBit =
    activeDragItem?.kind === "triage-staged-bit";

  return (
    <div
      className="flex min-h-0 w-full flex-row overflow-x-hidden rounded-md border border-border/50 bg-card"
      data-testid="hierarchy-explorer"
    >
      <HierarchyColumn
        label="Home"
        selectedTitle="Home"
        hasRightBorder
        bodyClassName={cn(
          "border border-transparent",
          homeIsInvalidForBit &&
            "border-destructive bg-background cursor-not-allowed",
        )}
      >
        <div className="p-2">
          <HomeDropCell
            activeDragItem={activeDragItem}
            overTargetId={overTargetId}
            pendingPlacementDropId={pendingPlacementDropId}
          />
        </div>
      </HierarchyColumn>

      <HierarchyColumn
        label="L1"
        selectedTitle={selectedL1Title ?? "None selected"}
        hasRightBorder
      >
        <HierarchyItemList
          activeDragItem={activeDragItem}
          bits={[]}
          nodes={rootNodes}
          onSelectNode={(nodeId) => {
            setSelectedL1Id(nodeId);
            setSelectedL2Id(null);
          }}
          overTargetId={overTargetId}
          parentPath={["Home"]}
          pendingPlacementDropId={pendingPlacementDropId}
          selectedNodeId={selectedL1Id}
        />
      </HierarchyColumn>

      <HierarchyColumn
        label="L2"
        selectedTitle={selectedL2Title ?? "None selected"}
        hasRightBorder
        isDimmed={selectedL1Id === null}
      >
        {selectedL1Id === null ? null : (
          <HierarchyItemList
            activeDragItem={activeDragItem}
            bits={l2Bits}
            nodes={l2Nodes}
            onSelectNode={setSelectedL2Id}
            overTargetId={overTargetId}
            parentPath={["Home", selectedL1Title ?? "Unknown"]}
            pendingPlacementDropId={pendingPlacementDropId}
            selectedNodeId={selectedL2Id}
          />
        )}
      </HierarchyColumn>

      <HierarchyColumn
        label="L3"
        selectedTitle={selectedL2Title ?? "None selected"}
        isDimmed={selectedL2Id === null}
      >
        {selectedL2Id === null ? null : (
          <HierarchyItemList
            activeDragItem={activeDragItem}
            bits={l3Bits}
            nodes={l3Nodes}
            overTargetId={overTargetId}
            parentPath={[
              "Home",
              selectedL1Title ?? "Unknown",
              selectedL2Title ?? "Unknown",
            ]}
            pendingPlacementDropId={pendingPlacementDropId}
          />
        )}
      </HierarchyColumn>
    </div>
  );
}

function HierarchyColumn({
  bodyClassName,
  children,
  hasRightBorder = false,
  isDimmed = false,
  label,
  selectedTitle,
}: {
  bodyClassName?: string;
  children: ReactNode;
  hasRightBorder?: boolean;
  isDimmed?: boolean;
  label: string;
  selectedTitle: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col bg-background",
        hasRightBorder && "border-r border-border/50",
        isDimmed && "bg-muted/30 border-border/50",
      )}
    >
      <div className="border-b border-border/50 bg-muted/30 px-3 py-2">
        <div className="truncate font-mono text-[10px] font-medium uppercase text-muted-foreground/50">
          {label}
        </div>
        <div className="min-w-0 truncate text-xs font-semibold text-foreground">
          {selectedTitle}
        </div>
      </div>
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto p-2",
          isDimmed && "bg-muted/30",
          bodyClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

function HomeDropCell({
  activeDragItem,
  overTargetId,
  pendingPlacementDropId,
}: {
  activeDragItem: TriageDragItem;
  overTargetId: string | null;
  pendingPlacementDropId: string | null;
}) {
  const dropId = getTriageHierarchyDropId("root");
  const { setNodeRef } = useDroppable({
    id: dropId,
    data: {
      kind: "triage-hierarchy-drop",
      dropId,
      parentNodeId: null,
      targetNodeLevel: null,
      targetTitle: "Home",
      targetParentPath: [],
    } satisfies TriageDropData,
  });
  const isAccepted = acceptsCandidate({
    activeDragItem,
    parentNodeId: null,
    targetNodeLevel: null,
  });
  const state = getCellState({
    activeDragItem,
    dropId,
    isAccepted,
    overTargetId,
    pendingPlacementDropId,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        CELL_DROP_ONLY_CLASS,
        activeDragItem === null && "hover:bg-muted hover:text-foreground",
        CELL_STATE_CLASSES[state],
      )}
      data-testid="hierarchy-home-drop"
    >
      <Home
        aria-hidden="true"
        className="h-4 w-4 flex-shrink-0 text-muted-foreground/80"
      />
      <span className="min-w-0 truncate text-sm font-medium text-foreground">
        Home
      </span>
    </div>
  );
}

function HierarchyItemList({
  activeDragItem,
  bits,
  nodes,
  onSelectNode,
  overTargetId,
  parentPath,
  pendingPlacementDropId,
  selectedNodeId,
}: {
  activeDragItem: TriageDragItem;
  bits: Bit[];
  nodes: Node[];
  onSelectNode?: (nodeId: string) => void;
  overTargetId: string | null;
  parentPath: string[];
  pendingPlacementDropId: string | null;
  selectedNodeId?: string | null;
}) {
  if (nodes.length === 0 && bits.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="font-sans text-xs text-muted-foreground/50">
          No items in this grid
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {nodes.map((node) => (
        <NodeDropCell
          key={node.id}
          activeDragItem={activeDragItem}
          isSelected={selectedNodeId === node.id}
          node={node}
          onSelectNode={onSelectNode}
          overTargetId={overTargetId}
          parentPath={parentPath}
          pendingPlacementDropId={pendingPlacementDropId}
        />
      ))}

      {bits.length > 0 ? (
        <div className="my-1 border-t border-border/50 pt-1">
          <div className="px-3 py-0.5 font-mono text-[10px] font-medium uppercase text-muted-foreground/50">
            Bits
          </div>
          <div className="flex flex-col gap-0.5">
            {bits.map((bit) => (
              <BitContextRow key={bit.id} bit={bit} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NodeDropCell({
  activeDragItem,
  isSelected,
  node,
  onSelectNode,
  overTargetId,
  parentPath,
  pendingPlacementDropId,
}: {
  activeDragItem: TriageDragItem;
  isSelected: boolean;
  node: Node;
  onSelectNode?: (nodeId: string) => void;
  overTargetId: string | null;
  parentPath: string[];
  pendingPlacementDropId: string | null;
}) {
  const dropId = getTriageHierarchyDropId(node.id);
  const { setNodeRef } = useDroppable({
    id: dropId,
    data: {
      kind: "triage-hierarchy-drop",
      dropId,
      parentNodeId: node.id,
      targetNodeLevel: node.level,
      targetTitle: node.title,
      targetParentPath: parentPath,
    } satisfies TriageDropData,
  });
  const isAccepted = acceptsCandidate({
    activeDragItem,
    parentNodeId: node.id,
    targetNodeLevel: node.level,
  });
  const state = getCellState({
    activeDragItem,
    dropId,
    isAccepted,
    overTargetId,
    pendingPlacementDropId,
  });

  if (onSelectNode) {
    return (
      <button
        ref={setNodeRef}
        type="button"
        aria-disabled={state === "invalid"}
        aria-label={`Select Node: ${node.title}`}
        className={cn(
          CELL_BASE_CLASS,
          activeDragItem === null && "hover:bg-muted hover:text-foreground",
          isSelected && "bg-accent text-foreground ring-1 ring-primary",
          CELL_STATE_CLASSES[state],
        )}
        onClick={() => onSelectNode(node.id)}
      >
        <Folder
          aria-hidden="true"
          className="h-4 w-4 flex-shrink-0 text-muted-foreground/80"
        />
        <span className="min-w-0 truncate text-sm font-medium text-foreground">
          {node.title}
        </span>
      </button>
    );
  }

  return (
    <div
      ref={setNodeRef}
      aria-disabled={state === "invalid"}
      className={cn(
        CELL_DROP_ONLY_CLASS,
        CELL_STATE_CLASSES[state],
      )}
    >
      <Folder
        aria-hidden="true"
        className="h-4 w-4 flex-shrink-0 text-muted-foreground/80"
      />
      <span className="min-w-0 truncate text-sm font-medium text-foreground">
        {node.title}
      </span>
    </div>
  );
}

function BitContextRow({ bit }: { bit: Bit }) {
  return (
    <div className="flex items-center gap-2 rounded-md px-3 py-1.5">
      <ListTodo
        aria-hidden="true"
        className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/60"
      />
      <span className="min-w-0 truncate text-xs text-muted-foreground/80">
        {bit.title}
      </span>
    </div>
  );
}
