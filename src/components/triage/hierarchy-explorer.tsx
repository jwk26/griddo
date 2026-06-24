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
    "border-muted bg-muted/10 text-muted-foreground/50 cursor-not-allowed",
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
  const [searchQuery, setSearchQuery] = useState("");
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

  const activeSection: "home" | "l1" | "l2" | "l3" =
    selectedL2Id !== null
      ? "l3"
      : selectedL1Id !== null
        ? "l2"
        : selectedHomeId !== null
          ? "l1"
          : "home";

  const normalizedQuery = searchQuery.trim().toLowerCase();

  function filterByTitle<T extends { title: string }>(items: T[]): T[] {
    if (!normalizedQuery) return items;
    return items.filter((item) =>
      item.title.toLowerCase().includes(normalizedQuery),
    );
  }

  const displayRootNodes =
    activeSection === "home" ? filterByTitle(rootNodes) : rootNodes;
  const displayL1Nodes =
    activeSection === "l1" ? filterByTitle(l1Nodes) : l1Nodes;
  const displayL1Bits =
    activeSection === "l1" ? filterByTitle(l1Bits) : l1Bits;
  const displayL2Nodes =
    activeSection === "l2" ? filterByTitle(l2Nodes) : l2Nodes;
  const displayL2Bits =
    activeSection === "l2" ? filterByTitle(l2Bits) : l2Bits;
  const displayL3Nodes =
    activeSection === "l3" ? filterByTitle(l3Nodes) : l3Nodes;
  const displayL3Bits =
    activeSection === "l3" ? filterByTitle(l3Bits) : l3Bits;

  const activeSectionLabel =
    activeSection === "home"
      ? "Home"
      : activeSection === "l1"
        ? (selectedHomeTitle ?? "L1")
        : activeSection === "l2"
          ? (selectedL1Title ?? "L2")
          : (selectedL2Title ?? "L3");

  const activeResultCount =
    activeSection === "home"
      ? displayRootNodes.length
      : activeSection === "l1"
        ? displayL1Nodes.length + displayL1Bits.length
        : activeSection === "l2"
          ? displayL2Nodes.length + displayL2Bits.length
          : displayL3Nodes.length + displayL3Bits.length;

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
      className="flex min-h-0 w-full flex-col rounded-md border border-border/50 bg-card"
      data-testid="hierarchy-explorer"
    >
      {/* Search bar */}
      <div className="flex flex-col gap-1 border-b border-border/50 px-2 py-1.5">
        <input
          aria-label="Search hierarchy"
          className="h-7 w-full rounded-md border border-border/50 bg-background px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="Search hierarchy"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {normalizedQuery && (
          <div
            aria-label={`Filtering ${activeSectionLabel} for ${searchQuery}, ${activeResultCount} ${activeResultCount === 1 ? "result" : "results"}`}
            aria-live="polite"
            className="flex min-w-0 items-center gap-1 text-[10px] text-muted-foreground/70"
            data-testid="hierarchy-search-indicator"
          >
            <span className="sr-only">{activeSectionLabel}:</span>

            <span className="truncate font-mono" data-testid="hierarchy-search-query">
              &ldquo;{searchQuery}&rdquo;
            </span>
            <span className="flex-shrink-0">·</span>
            <span
              className="flex-shrink-0"
              data-testid="hierarchy-search-result-count"
            >
              {activeResultCount}{" "}
              {activeResultCount === 1 ? "result" : "results"}
            </span>
            <button
              aria-label="Clear search"
              className="ml-auto flex-shrink-0 rounded px-1 py-0.5 text-muted-foreground/60 hover:bg-muted hover:text-foreground"
              data-testid="hierarchy-search-clear"
              type="button"
              onClick={() => setSearchQuery("")}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Columns — active section gets scope-highlight, inactive sections de-emphasized */}
      <div className="flex min-h-0 flex-1 flex-row overflow-x-hidden">
        <HierarchyColumn
          label="Home"
          selectedTitle="Home"
          hasRightBorder
          isScopeActive={normalizedQuery !== "" && activeSection === "home"}
          isScopeInactive={normalizedQuery !== "" && activeSection !== "home"}
          bodyRef={setHomeSectionRef}
          bodyStateClass={CELL_STATE_CLASSES[homeSectionBodyState]}
          bodyTestId="hierarchy-section-body-home"
        >
          <HierarchyItemList
            activeDragItem={activeDragItem}
            bits={[]}
            hasActiveQuery={normalizedQuery !== "" && activeSection === "home"}
            nodes={displayRootNodes}
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
          isScopeActive={normalizedQuery !== "" && activeSection === "l1"}
          isScopeInactive={normalizedQuery !== "" && activeSection !== "l1"}
          bodyRef={setL1SectionRef}
          bodyStateClass={CELL_STATE_CLASSES[l1SectionBodyState]}
          bodyTestId="hierarchy-section-body-l1"
        >
          {selectedHomeId === null ? null : (
            <HierarchyItemList
              activeDragItem={activeDragItem}
              bits={displayL1Bits}
              hasActiveQuery={normalizedQuery !== "" && activeSection === "l1"}
              nodes={displayL1Nodes}
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
          isScopeActive={normalizedQuery !== "" && activeSection === "l2"}
          isScopeInactive={normalizedQuery !== "" && activeSection !== "l2"}
          bodyRef={setL2SectionRef}
          bodyStateClass={CELL_STATE_CLASSES[l2SectionBodyState]}
          bodyTestId="hierarchy-section-body-l2"
        >
          {selectedL1Id === null ? null : (
            <HierarchyItemList
              activeDragItem={activeDragItem}
              bits={displayL2Bits}
              hasActiveQuery={normalizedQuery !== "" && activeSection === "l2"}
              nodes={displayL2Nodes}
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
          isScopeActive={normalizedQuery !== "" && activeSection === "l3"}
          isScopeInactive={normalizedQuery !== "" && activeSection !== "l3"}
          bodyRef={setL3SectionRef}
          bodyStateClass={CELL_STATE_CLASSES[l3SectionBodyState]}
          bodyTestId="hierarchy-section-body-l3"
        >
          {selectedL2Id === null ? null : (
            <HierarchyItemList
              activeDragItem={activeDragItem}
              bits={displayL3Bits}
              hasActiveQuery={normalizedQuery !== "" && activeSection === "l3"}
              nodes={displayL3Nodes}
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
  isScopeActive = false,
  isScopeInactive = false,
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
  isScopeActive?: boolean;
  isScopeInactive?: boolean;
  label: string;
  selectedTitle: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col bg-background",
        hasRightBorder && "border-r border-border/50",
        isDimmed && "bg-muted/30 border-border/50",
        isScopeActive && "ring-1 ring-primary/40",
        isScopeInactive && "opacity-50",
      )}
      data-scope-active={isScopeActive || undefined}
      data-scope-inactive={isScopeInactive || undefined}
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
  hasActiveQuery,
  nodes,
  onSelectNode,
  overTargetId,
  parentPath,
  pendingPlacementDropId,
  selectedNodeId,
}: {
  activeDragItem: TriageDragItem;
  bits: Bit[];
  hasActiveQuery?: boolean;
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
          {hasActiveQuery ? "No matches" : "No items in this grid"}
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
