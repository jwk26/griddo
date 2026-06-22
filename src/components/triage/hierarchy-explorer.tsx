"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Folder, ListTodo } from "lucide-react";
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
): "node" | "bit" | "breakdown" | null {
  if (activeDragItem?.kind === "triage-staged-node") return "node";
  if (activeDragItem?.kind === "triage-staged-bit") return "bit";
  if (activeDragItem?.kind === "triage-breakdown") return "breakdown";
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

  if (candidateType === "breakdown") {
    return true;
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
  const [selectedHomeId, setSelectedHomeId] = useState<string | null>(null);
  const [selectedL1Id, setSelectedL1Id] = useState<string | null>(null);
  const [selectedL2Id, setSelectedL2Id] = useState<string | null>(null);
  const { nodes: rootGridNodes } = useGridData(null);
  const { nodes: rawL1Nodes, bits: rawL1Bits } = useGridData(selectedHomeId);
  const { nodes: rawL2Nodes, bits: rawL2Bits } = useGridData(selectedL1Id);
  const { nodes: rawL3Nodes, bits: rawL3Bits } = useGridData(selectedL2Id);

  const rootNodes = useMemo(
    () => rootGridNodes.filter((node) => node.systemRole === null),
    [rootGridNodes],
  );
  const l1Nodes = selectedHomeId === null ? [] : rawL1Nodes;
  const l1Bits = selectedHomeId === null ? [] : rawL1Bits;
  const l2Nodes = selectedL1Id === null ? [] : rawL2Nodes;
  const l2Bits = selectedL1Id === null ? [] : rawL2Bits;
  const l3Nodes = selectedL2Id === null ? [] : rawL3Nodes;
  const l3Bits = selectedL2Id === null ? [] : rawL3Bits;
  const selectedHomeNode =
    rootNodes.find((node) => node.id === selectedHomeId) ?? null;
  const selectedL1Node =
    l1Nodes.find((node) => node.id === selectedL1Id) ?? null;
  const selectedL2Node =
    l2Nodes.find((node) => node.id === selectedL2Id) ?? null;
  const selectedHomeTitle = selectedHomeNode?.title ?? null;
  const selectedL1Title = selectedL1Node?.title ?? null;
  const selectedL2Title = selectedL2Node?.title ?? null;

  const homeSectionDropId = getTriageHierarchyDropId("body-home");
  const { setNodeRef: setHomeSectionRef } = useDroppable({
    id: homeSectionDropId,
    data: {
      kind: "triage-hierarchy-drop",
      dropId: homeSectionDropId,
      parentNodeId: null,
      targetNodeLevel: null,
      targetTitle: "Home",
      targetParentPath: [],
    } satisfies TriageDropData,
  });

  const l1SectionDropId = getTriageHierarchyDropId("body-l1");
  const { setNodeRef: setL1SectionRef } = useDroppable({
    id: l1SectionDropId,
    disabled: selectedHomeId === null,
    data: {
      kind: "triage-hierarchy-drop",
      dropId: l1SectionDropId,
      parentNodeId: selectedHomeId,
      targetNodeLevel: selectedHomeNode?.level ?? null,
      targetTitle: selectedHomeTitle ?? "Unknown",
      targetParentPath: ["Home"],
    } satisfies TriageDropData,
  });

  const l2SectionDropId = getTriageHierarchyDropId("body-l2");
  const { setNodeRef: setL2SectionRef } = useDroppable({
    id: l2SectionDropId,
    disabled: selectedL1Id === null,
    data: {
      kind: "triage-hierarchy-drop",
      dropId: l2SectionDropId,
      parentNodeId: selectedL1Id,
      targetNodeLevel: selectedL1Node?.level ?? null,
      targetTitle: selectedL1Title ?? "Unknown",
      targetParentPath: ["Home", selectedHomeTitle ?? "Unknown"],
    } satisfies TriageDropData,
  });

  const l3SectionDropId = getTriageHierarchyDropId("body-l3");
  const { setNodeRef: setL3SectionRef } = useDroppable({
    id: l3SectionDropId,
    disabled: selectedL2Id === null,
    data: {
      kind: "triage-hierarchy-drop",
      dropId: l3SectionDropId,
      parentNodeId: selectedL2Id,
      targetNodeLevel: selectedL2Node?.level ?? null,
      targetTitle: selectedL2Title ?? "Unknown",
      targetParentPath: [
        "Home",
        selectedHomeTitle ?? "Unknown",
        selectedL1Title ?? "Unknown",
      ],
    } satisfies TriageDropData,
  });

  const homeSectionBodyState = getCellState({
    activeDragItem,
    dropId: homeSectionDropId,
    isAccepted: acceptsCandidate({
      activeDragItem,
      parentNodeId: null,
      targetNodeLevel: null,
    }),
    overTargetId,
    pendingPlacementDropId,
  });

  const l1SectionBodyState =
    selectedHomeId === null
      ? "default"
      : getCellState({
          activeDragItem,
          dropId: l1SectionDropId,
          isAccepted: acceptsCandidate({
            activeDragItem,
            parentNodeId: selectedHomeId,
            targetNodeLevel: selectedHomeNode?.level ?? null,
          }),
          overTargetId,
          pendingPlacementDropId,
        });

  const l2SectionBodyState =
    selectedL1Id === null
      ? "default"
      : getCellState({
          activeDragItem,
          dropId: l2SectionDropId,
          isAccepted: acceptsCandidate({
            activeDragItem,
            parentNodeId: selectedL1Id,
            targetNodeLevel: selectedL1Node?.level ?? null,
          }),
          overTargetId,
          pendingPlacementDropId,
        });

  const l3SectionBodyState =
    selectedL2Id === null
      ? "default"
      : getCellState({
          activeDragItem,
          dropId: l3SectionDropId,
          isAccepted: acceptsCandidate({
            activeDragItem,
            parentNodeId: selectedL2Id,
            targetNodeLevel: selectedL2Node?.level ?? null,
          }),
          overTargetId,
          pendingPlacementDropId,
        });

  return (
    <div
      className="flex min-h-0 w-full flex-row overflow-x-hidden rounded-md border border-border/50 bg-card"
      data-testid="hierarchy-explorer"
    >
      <HierarchyColumn
        label="Home"
        selectedTitle="Home"
        hasRightBorder
        bodyRef={setHomeSectionRef}
        bodyStateClass={CELL_STATE_CLASSES[homeSectionBodyState]}
        bodyTestId="hierarchy-section-body-home"
      >
        <HierarchyItemList
          activeDragItem={activeDragItem}
          bits={[]}
          nodes={rootNodes}
          onSelectNode={(nodeId) => {
            setSelectedHomeId(nodeId);
            setSelectedL1Id(null);
            setSelectedL2Id(null);
          }}
          overTargetId={overTargetId}
          parentPath={["Home"]}
          pendingPlacementDropId={pendingPlacementDropId}
          selectedNodeId={selectedHomeId}
        />
      </HierarchyColumn>

      <HierarchyColumn
        label="L1"
        selectedTitle={selectedHomeTitle ?? "None selected"}
        hasRightBorder
        isDimmed={selectedHomeId === null}
        bodyRef={setL1SectionRef}
        bodyStateClass={CELL_STATE_CLASSES[l1SectionBodyState]}
        bodyTestId="hierarchy-section-body-l1"
      >
        {selectedHomeId === null ? null : (
          <HierarchyItemList
            activeDragItem={activeDragItem}
            bits={l1Bits}
            nodes={l1Nodes}
            onSelectNode={(nodeId) => {
              setSelectedL1Id(nodeId);
              setSelectedL2Id(null);
            }}
            overTargetId={overTargetId}
            parentPath={["Home", selectedHomeTitle ?? "Unknown"]}
            pendingPlacementDropId={pendingPlacementDropId}
            selectedNodeId={selectedL1Id}
          />
        )}
      </HierarchyColumn>

      <HierarchyColumn
        label="L2"
        selectedTitle={selectedL1Title ?? "None selected"}
        hasRightBorder
        isDimmed={selectedL1Id === null}
        bodyRef={setL2SectionRef}
        bodyStateClass={CELL_STATE_CLASSES[l2SectionBodyState]}
        bodyTestId="hierarchy-section-body-l2"
      >
        {selectedL1Id === null ? null : (
          <HierarchyItemList
            activeDragItem={activeDragItem}
            bits={l2Bits}
            nodes={l2Nodes}
            onSelectNode={setSelectedL2Id}
            overTargetId={overTargetId}
            parentPath={[
              "Home",
              selectedHomeTitle ?? "Unknown",
              selectedL1Title ?? "Unknown",
            ]}
            pendingPlacementDropId={pendingPlacementDropId}
            selectedNodeId={selectedL2Id}
          />
        )}
      </HierarchyColumn>

      <HierarchyColumn
        label="L3"
        selectedTitle={selectedL2Title ?? "None selected"}
        isDimmed={selectedL2Id === null}
        bodyRef={setL3SectionRef}
        bodyStateClass={CELL_STATE_CLASSES[l3SectionBodyState]}
        bodyTestId="hierarchy-section-body-l3"
      >
        {selectedL2Id === null ? null : (
          <HierarchyItemList
            activeDragItem={activeDragItem}
            bits={l3Bits}
            nodes={l3Nodes}
            overTargetId={overTargetId}
            parentPath={[
              "Home",
              selectedHomeTitle ?? "Unknown",
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
  bodyRef,
  bodyStateClass,
  bodyTestId,
  children,
  hasRightBorder = false,
  isDimmed = false,
  label,
  selectedTitle,
}: {
  bodyClassName?: string;
  bodyRef?: (node: HTMLElement | null) => void;
  bodyStateClass?: string;
  bodyTestId?: string;
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
        ref={bodyRef}
        data-testid={bodyTestId}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto p-2",
          isDimmed && "bg-muted/30",
          bodyClassName,
          bodyStateClass,
        )}
      >
        {children}
      </div>
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
