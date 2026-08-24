"use client";

import { useDroppable } from "@dnd-kit/core";
import { Folder, ListTodo } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
  type UIEvent,
} from "react";
import { useGridData } from "@/hooks/use-grid-data";
import { useTriageDepartureContext } from "@/hooks/use-triage-departure";
import type {
  TriageDragItem,
  TriageTargetFeedback,
} from "@/hooks/use-dnd";
import {
  getTriageHierarchyDropId,
  type TriageDropData,
} from "@/lib/grid-dnd";
import { cn } from "@/lib/utils";
import {
  type TriageSessionScrollPosition,
  useTriageStore,
} from "@/stores/triage-store";
import type { Bit, Node } from "@/types";

interface HierarchyExplorerProps {
  activeDragItem: TriageDragItem;
  onPendingPlacementInvalidated: (dropId: string) => void;
  onPointerGeometryChange: (point: { x: number; y: number }) => void;
  overTargetId: string | null;
  pendingPlacementDropId: string | null;
  targetFeedback: TriageTargetFeedback;
}

type HierarchyCellState =
  | "default"
  | "idle-valid"
  | "valid"
  | "full"
  | "pending-confirmation"
  | "invalid";

const COLUMN_LABELS = ["Home", "Level 1", "Level 2", "Level 3"] as const;
const EMPTY_SCROLL_POSITION: TriageSessionScrollPosition = {
  anchorId: null,
  offset: 0,
};

const CELL_BASE_CLASS =
  "flex w-full items-center gap-2 rounded-md border border-transparent px-3 py-2 text-left transition-[background-color,border-color,box-shadow,color] touch-action-manipulation cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

const CELL_DROP_ONLY_CLASS =
  "flex w-full items-center gap-2 rounded-md border border-transparent px-3 py-2 text-left transition-[background-color,border-color,box-shadow,color]";

const CELL_STATE_CLASSES: Record<HierarchyCellState, string> = {
  default: "",
  "idle-valid": "ring-1 ring-primary border-border/80 text-foreground",
  valid: "ring-1 ring-primary border-primary bg-accent text-foreground",
  full: "ring-1 ring-muted-foreground border-muted-foreground bg-muted text-muted-foreground",
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
  if (candidateType === "bit") return parentNodeId !== null;
  if (candidateType === "breakdown") return true;
  return false;
}

function getCellState({
  activeDragItem,
  dropId,
  isAccepted,
  overTargetId,
  pendingPlacementDropId,
  targetFeedback,
}: {
  activeDragItem: TriageDragItem;
  dropId: string;
  isAccepted: boolean;
  overTargetId: string | null;
  pendingPlacementDropId: string | null;
  targetFeedback: TriageTargetFeedback;
}): HierarchyCellState {
  if (pendingPlacementDropId === dropId) return "pending-confirmation";
  if (activeDragItem === null) return "default";
  if (!isAccepted) return "invalid";
  if (targetFeedback?.dropId === dropId) return targetFeedback.state;
  if (overTargetId === dropId) return "valid";
  return "idle-valid";
}

function idsForColumn(nodes: Node[], bits: Bit[] = []): string[] {
  return [...nodes.map(({ id }) => id), ...bits.map(({ id }) => id)];
}

function focusFallback(validPathIds: string[]) {
  const ancestorId = validPathIds.at(-1);
  if (ancestorId !== undefined) {
    const ancestor = Array.from(
      document.querySelectorAll<HTMLElement>("[data-explorer-item-id]"),
    ).find((element) => element.dataset.explorerItemId === ancestorId);
    if (ancestor !== undefined) {
      ancestor.focus();
      return;
    }
  }

  const headingIndex = validPathIds.length;
  document
    .querySelector<HTMLElement>(
      `[data-testid="hierarchy-column-heading-${headingIndex === 0 ? "home" : `level-${headingIndex}`}"]`,
    )
    ?.focus();
}

export function HierarchyExplorer({
  activeDragItem,
  onPendingPlacementInvalidated,
  onPointerGeometryChange,
  overTargetId,
  pendingPlacementDropId,
  targetFeedback,
}: HierarchyExplorerProps) {
  const targetFeedbackRef = useRef(targetFeedback);
  useEffect(() => {
    targetFeedbackRef.current = targetFeedback;
  }, [targetFeedback]);

  useEffect(() => {
    if (
      activeDragItem === null ||
      activeDragItem.integrity === "invalidated"
    ) {
      return;
    }
    let pointer: { x: number; y: number } | null = null;
    let frame = 0;
    let cancelled = false;
    const trackMouse = (event: MouseEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
    };
    const trackTouch = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch !== undefined) {
        pointer = { x: touch.clientX, y: touch.clientY };
      }
    };
    const clearPointer = () => {
      pointer = null;
    };
    const clearPointerOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") clearPointer();
    };
    const scrollAtEdge = () => {
      if (pointer !== null) onPointerGeometryChange(pointer);
      const feedback = targetFeedbackRef.current;
      if (
        pointer !== null &&
        feedback?.state === "valid" &&
        typeof document.elementsFromPoint === "function"
      ) {
        const pointerTarget = document
          .elementsFromPoint(pointer.x, pointer.y)
          .map((element) =>
            element.closest<HTMLElement>("[data-triage-drop-id]"),
          )
          .find((element) => element !== null);
        const body = pointerTarget?.closest<HTMLElement>(
          "[data-triage-explorer-column]",
        );
        if (
          pointerTarget?.dataset.triageDropId === feedback.dropId &&
          body !== null &&
          body !== undefined &&
          body.scrollHeight > body.clientHeight
        ) {
          const bounds = body.getBoundingClientRect();
          const edge = Math.min(48, bounds.height / 4);
          const topDistance = pointer.y - bounds.top;
          const bottomDistance = bounds.bottom - pointer.y;
          if (topDistance >= 0 && topDistance < edge) {
            body.scrollTop -= Math.ceil(2 + 10 * (1 - topDistance / edge));
          } else if (bottomDistance >= 0 && bottomDistance < edge) {
            body.scrollTop += Math.ceil(
              2 + 10 * (1 - bottomDistance / edge),
            );
          }
        }
      }
    };
    const scheduleFrame = () => {
      let callbackWasSynchronous = true;
      frame = window.requestAnimationFrame(() => {
        if (cancelled) return;
        scrollAtEdge();
        if (!callbackWasSynchronous && !cancelled) scheduleFrame();
      });
      callbackWasSynchronous = false;
    };

    document.addEventListener("mousemove", trackMouse);
    document.addEventListener("mouseleave", clearPointer);
    document.addEventListener("keydown", clearPointerOnEscape);
    document.addEventListener("touchmove", trackTouch, { passive: true });
    document.addEventListener("touchcancel", clearPointer);
    window.addEventListener("blur", clearPointer);
    scheduleFrame();
    return () => {
      cancelled = true;
      pointer = null;
      document.removeEventListener("mousemove", trackMouse);
      document.removeEventListener("mouseleave", clearPointer);
      document.removeEventListener("keydown", clearPointerOnEscape);
      document.removeEventListener("touchmove", trackTouch);
      document.removeEventListener("touchcancel", clearPointer);
      window.removeEventListener("blur", clearPointer);
      window.cancelAnimationFrame(frame);
    };
  }, [activeDragItem, onPointerGeometryChange]);

  const departure = useTriageDepartureContext();
  const explorerPathIds = useTriageStore((state) => state.explorerPathIds);
  const explorerColumnScroll = useTriageStore(
    (state) => state.explorerColumnScroll,
  );
  const setExplorerPathIds = useTriageStore(
    (state) => state.setExplorerPathIds,
  );
  const setExplorerOpenColumnIds = useTriageStore(
    (state) => state.setExplorerOpenColumnIds,
  );
  const setExplorerColumnScroll = useTriageStore(
    (state) => state.setExplorerColumnScroll,
  );
  const reconcileExplorerContext = useTriageStore(
    (state) => state.reconcileExplorerContext,
  );

  const selectedHomeId = explorerPathIds[0] ?? null;
  const selectedL1Id = explorerPathIds[1] ?? null;
  const selectedL2Id = explorerPathIds[2] ?? null;
  const rootGrid = useGridData(null);
  const level1Grid = useGridData(selectedHomeId);
  const level2Grid = useGridData(selectedL1Id);
  const level3Grid = useGridData(selectedL2Id);

  const rootNodes = useMemo(
    () => rootGrid.nodes.filter((node) => node.systemRole === null),
    [rootGrid.nodes],
  );
  const level1Nodes = useMemo(
    () => (selectedHomeId === null ? [] : level1Grid.nodes),
    [level1Grid.nodes, selectedHomeId],
  );
  const level1Bits = useMemo(
    () => (selectedHomeId === null ? [] : level1Grid.bits),
    [level1Grid.bits, selectedHomeId],
  );
  const level2Nodes = useMemo(
    () => (selectedL1Id === null ? [] : level2Grid.nodes),
    [level2Grid.nodes, selectedL1Id],
  );
  const level2Bits = useMemo(
    () => (selectedL1Id === null ? [] : level2Grid.bits),
    [level2Grid.bits, selectedL1Id],
  );
  const level3Nodes = useMemo(
    () => (selectedL2Id === null ? [] : level3Grid.nodes),
    [level3Grid.nodes, selectedL2Id],
  );
  const level3Bits = useMemo(
    () => (selectedL2Id === null ? [] : level3Grid.bits),
    [level3Grid.bits, selectedL2Id],
  );

  const selectedHomeNode =
    rootNodes.find(({ id }) => id === selectedHomeId) ?? null;
  const selectedL1Node =
    level1Nodes.find(({ id }) => id === selectedL1Id) ?? null;
  const selectedL2Node =
    level2Nodes.find(({ id }) => id === selectedL2Id) ?? null;

  const validation = useMemo(() => {
    if (rootGrid.isLoading) return null;

    const validPathIds: string[] = [];
    if (selectedHomeId === null) return validPathIds;
    if (selectedHomeNode === null) return validPathIds;
    validPathIds.push(selectedHomeId);

    if (level1Grid.isLoading) return null;
    if (selectedL1Id === null) return validPathIds;
    if (selectedL1Node === null) return validPathIds;
    validPathIds.push(selectedL1Id);

    if (level2Grid.isLoading) return null;
    if (selectedL2Id === null) return validPathIds;
    if (selectedL2Node === null) return validPathIds;
    validPathIds.push(selectedL2Id);
    if (level3Grid.isLoading) return null;
    return validPathIds;
  }, [
    level1Grid.isLoading,
    level2Grid.isLoading,
    level3Grid.isLoading,
    rootGrid.isLoading,
    selectedHomeId,
    selectedHomeNode,
    selectedL1Id,
    selectedL1Node,
    selectedL2Id,
    selectedL2Node,
  ]);

  const visibleItemIdsByColumn = useMemo(() => {
    const columns: Record<string, string[]> = {
      home: idsForColumn(rootNodes),
    };
    if (selectedHomeId !== null) {
      columns[selectedHomeId] = idsForColumn(level1Nodes, level1Bits);
    }
    if (selectedL1Id !== null) {
      columns[selectedL1Id] = idsForColumn(level2Nodes, level2Bits);
    }
    if (selectedL2Id !== null) {
      columns[selectedL2Id] = idsForColumn(level3Nodes, level3Bits);
    }
    return columns;
  }, [
    level1Bits,
    level1Nodes,
    level2Bits,
    level2Nodes,
    level3Bits,
    level3Nodes,
    rootNodes,
    selectedHomeId,
    selectedL1Id,
    selectedL2Id,
  ]);

  useEffect(() => {
    if (validation === null) return;
    const pathWasTrimmed = validation.length < explorerPathIds.length;
    reconcileExplorerContext({
      validPathIds: validation,
      visibleItemIdsByColumn,
    });
    if (pathWasTrimmed) focusFallback(validation);
  }, [
    explorerPathIds,
    reconcileExplorerContext,
    validation,
    visibleItemIdsByColumn,
  ]);

  function selectPath(pathIds: string[]) {
    if (
      pathIds.length === explorerPathIds.length &&
      pathIds.every((id, index) => id === explorerPathIds[index])
    ) {
      return;
    }
    const focusTarget =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    departure.requestDeparture({
      id: pathIds.join("/") || "home",
      focus: () => focusTarget?.focus(),
      kind: "path",
      perform: () => {
        setExplorerPathIds(pathIds);
        setExplorerOpenColumnIds(["home", ...pathIds]);
      },
    });
  }

  const visibleDropIds = useMemo(() => {
    const ids = new Set<string>([
      getTriageHierarchyDropId("body-home"),
      ...rootNodes.map(({ id }) => getTriageHierarchyDropId(id)),
    ]);
    if (selectedHomeNode !== null) {
      ids.add(getTriageHierarchyDropId("body-l1"));
      level1Nodes.forEach(({ id }) => ids.add(getTriageHierarchyDropId(id)));
    }
    if (selectedL1Node !== null) {
      ids.add(getTriageHierarchyDropId("body-l2"));
      level2Nodes.forEach(({ id }) => ids.add(getTriageHierarchyDropId(id)));
    }
    if (selectedL2Node !== null) {
      ids.add(getTriageHierarchyDropId("body-l3"));
      level3Nodes.forEach(({ id }) => ids.add(getTriageHierarchyDropId(id)));
    }
    return ids;
  }, [
    level1Nodes,
    level2Nodes,
    level3Nodes,
    rootNodes,
    selectedHomeNode,
    selectedL1Node,
    selectedL2Node,
  ]);
  const effectivePendingPlacementDropId =
    pendingPlacementDropId !== null && visibleDropIds.has(pendingPlacementDropId)
      ? pendingPlacementDropId
      : null;
  const invalidatedPendingDropIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      pendingPlacementDropId === null ||
      visibleDropIds.has(pendingPlacementDropId)
    ) {
      invalidatedPendingDropIdRef.current = null;
      return;
    }
    if (
      validation !== null &&
      invalidatedPendingDropIdRef.current !== pendingPlacementDropId
    ) {
      invalidatedPendingDropIdRef.current = pendingPlacementDropId;
      onPendingPlacementInvalidated(pendingPlacementDropId);
    }
  }, [
    onPendingPlacementInvalidated,
    pendingPlacementDropId,
    validation,
    visibleDropIds,
  ]);

  const pathNodes = [selectedHomeNode, selectedL1Node, selectedL2Node].filter(
    (node): node is Node => node !== null,
  );

  const columns = [
    {
      bits: [] as Bit[],
      columnId: "home",
      isLoading: rootGrid.isLoading,
      nodes: rootNodes,
      parentNode: null,
      selectedNodeId: selectedHomeId,
    },
    {
      bits: level1Bits,
      columnId: selectedHomeId ?? "level-1-closed",
      isLoading: level1Grid.isLoading,
      nodes: level1Nodes,
      parentNode: selectedHomeNode,
      selectedNodeId: selectedL1Id,
    },
    {
      bits: level2Bits,
      columnId: selectedL1Id ?? "level-2-closed",
      isLoading: level2Grid.isLoading,
      nodes: level2Nodes,
      parentNode: selectedL1Node,
      selectedNodeId: selectedL2Id,
    },
    {
      bits: level3Bits,
      columnId: selectedL2Id ?? "level-3-closed",
      isLoading: level3Grid.isLoading,
      nodes: level3Nodes,
      parentNode: selectedL2Node,
      selectedNodeId: null,
    },
  ] as const;

  return (
    <div
      className="flex min-h-0 w-full flex-col rounded-md border border-border/50 bg-card"
      data-testid="hierarchy-explorer"
    >
      <nav
        aria-label="Explorer path"
        className="flex min-w-0 flex-wrap items-center gap-x-1 border-b border-border/50 px-3 py-1.5 text-xs text-muted-foreground"
      >
        <button className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" type="button" onClick={() => selectPath([])}>
          Home
        </button>
        {pathNodes.map((node, index) => (
          <span className="contents" key={node.id}>
            <span aria-hidden="true">/</span>
            <button
              className="rounded text-left font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              type="button"
              onClick={() => selectPath(explorerPathIds.slice(0, index + 1))}
            >
              {node.title}
            </button>
          </span>
        ))}
      </nav>

      <div className="flex min-h-0 flex-1 flex-row overflow-x-hidden">
        {columns.map((column, index) => {
          const parentPath = ["Home", ...pathNodes.slice(0, index).map(({ title }) => title)];
          const targetParentPath =
            index === 0 ? [] : parentPath.slice(0, -1);
          return (
            <ExplorerColumn
              key={COLUMN_LABELS[index]}
              bodyState={getSectionBodyState({
                activeDragItem,
                index,
                overTargetId,
                parentNode: column.parentNode,
                pendingPlacementDropId: effectivePendingPlacementDropId,
                targetFeedback,
              })}
              columnId={column.columnId}
              hasRightBorder={index < COLUMN_LABELS.length - 1}
              isDimmed={index > 0 && column.parentNode === null}
              itemIds={idsForColumn(column.nodes, column.bits)}
              label={COLUMN_LABELS[index]}
              scrollPosition={
                explorerColumnScroll[column.columnId] ?? EMPTY_SCROLL_POSITION
              }
              onScrollPositionChange={setExplorerColumnScroll}
              parentNode={column.parentNode}
              targetParentPath={targetParentPath}
            >
              {index > 0 && column.parentNode === null ? null : (
                <HierarchyItemList
                  activeDragItem={activeDragItem}
                  bits={column.bits}
                  isLoading={column.isLoading}
                  nodes={column.nodes}
                  onSelectNode={
                    index < 3
                      ? (nodeId) =>
                          selectPath([
                            ...explorerPathIds.slice(0, index),
                            nodeId,
                          ])
                      : undefined
                  }
                  overTargetId={overTargetId}
                  parentPath={parentPath}
                  pendingPlacementDropId={effectivePendingPlacementDropId}
                  selectedNodeId={column.selectedNodeId}
                  targetFeedback={targetFeedback}
                />
              )}
            </ExplorerColumn>
          );
        })}
      </div>
    </div>
  );
}

function getSectionBodyState({
  activeDragItem,
  index,
  overTargetId,
  parentNode,
  pendingPlacementDropId,
  targetFeedback,
}: {
  activeDragItem: TriageDragItem;
  index: number;
  overTargetId: string | null;
  parentNode: Node | null;
  pendingPlacementDropId: string | null;
  targetFeedback: TriageTargetFeedback;
}): HierarchyCellState {
  if (index > 0 && parentNode === null) return "default";
  const dropId = getTriageHierarchyDropId(
    index === 0 ? "body-home" : `body-l${index}`,
  );
  return getCellState({
    activeDragItem,
    dropId,
    isAccepted: acceptsCandidate({
      activeDragItem,
      parentNodeId: parentNode?.id ?? null,
      targetNodeLevel: parentNode?.level ?? null,
    }),
    overTargetId,
    pendingPlacementDropId,
    targetFeedback,
  });
}

function ExplorerColumn({
  bodyState,
  children,
  columnId,
  hasRightBorder,
  isDimmed,
  itemIds,
  label,
  onScrollPositionChange,
  parentNode,
  scrollPosition,
  targetParentPath,
}: {
  bodyState: HierarchyCellState;
  children: ReactNode;
  columnId: string;
  hasRightBorder: boolean;
  isDimmed: boolean;
  itemIds: string[];
  label: (typeof COLUMN_LABELS)[number];
  onScrollPositionChange: (
    columnId: string,
    position: TriageSessionScrollPosition,
  ) => void;
  parentNode: Node | null;
  scrollPosition: TriageSessionScrollPosition;
  targetParentPath: string[];
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const sectionIndex = COLUMN_LABELS.indexOf(label);
  const sectionDropId = getTriageHierarchyDropId(
    sectionIndex === 0 ? "body-home" : `body-l${sectionIndex}`,
  );
  const { setNodeRef } = useDroppable({
    id: sectionDropId,
    disabled: sectionIndex > 0 && parentNode === null,
    data: {
      kind: "triage-hierarchy-drop",
      dropId: sectionDropId,
      parentNodeId: parentNode?.id ?? null,
      targetNodeLevel: parentNode?.level ?? null,
      targetTitle: parentNode?.title ?? "Home",
      targetParentPath,
    } satisfies TriageDropData,
  });
  const sectionDropData = {
    kind: "triage-hierarchy-drop",
    dropId: sectionDropId,
    parentNodeId: parentNode?.id ?? null,
    targetNodeLevel: parentNode?.level ?? null,
    targetTitle: parentNode?.title ?? "Home",
    targetParentPath,
  } satisfies TriageDropData;
  const itemIdsKey = itemIds.join("\u0000");

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (body === null || scrollPosition.anchorId === null) return;
    const anchor = Array.from(
      body.querySelectorAll<HTMLElement>("[data-explorer-item-id]"),
    ).find(
      (element) =>
        element.dataset.explorerItemId === scrollPosition.anchorId,
    );
    if (anchor === undefined) return;

    const delta =
      anchor.getBoundingClientRect().top -
      body.getBoundingClientRect().top -
      scrollPosition.offset;
    if (delta !== 0) body.scrollTop += delta;
  }, [itemIdsKey, scrollPosition.anchorId, scrollPosition.offset]);

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const body = event.currentTarget;
    const bodyTop = body.getBoundingClientRect().top;
    const firstVisible = Array.from(
      body.querySelectorAll<HTMLElement>("[data-explorer-item-id]"),
    ).find((element) => element.getBoundingClientRect().bottom > bodyTop);
    const nextPosition =
      firstVisible === undefined
        ? EMPTY_SCROLL_POSITION
        : {
            anchorId: firstVisible.dataset.explorerItemId ?? null,
            offset: firstVisible.getBoundingClientRect().top - bodyTop,
          };
    if (
      nextPosition.anchorId !== scrollPosition.anchorId ||
      nextPosition.offset !== scrollPosition.offset
    ) {
      onScrollPositionChange(columnId, nextPosition);
    }
  }

  const headingTestId =
    sectionIndex === 0
      ? "hierarchy-column-heading-home"
      : `hierarchy-column-heading-level-${sectionIndex}`;

  return (
    <section
      aria-labelledby={`${headingTestId}-label`}
      className={cn(
        "flex min-w-0 flex-1 flex-col bg-background",
        hasRightBorder && "border-r border-border/50",
        isDimmed && "bg-muted/30 border-border/50",
      )}
    >
      <div className="border-b border-border/50 bg-muted/30 px-3 py-2">
        <h3
          className="font-mono text-[10px] font-medium uppercase text-muted-foreground"
          data-testid={headingTestId}
          id={`${headingTestId}-label`}
          tabIndex={-1}
        >
          {label}
        </h3>
      </div>
      <div
        ref={(node) => {
          bodyRef.current = node;
          setNodeRef(node);
        }}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto p-2",
          isDimmed && "bg-muted/30",
          CELL_STATE_CLASSES[bodyState],
        )}
        data-testid={`hierarchy-section-body-${sectionIndex === 0 ? "home" : `l${sectionIndex}`}`}
        data-triage-drop-id={sectionDropId}
        data-triage-explorer-column="true"
        data-triage-hierarchy-drop={JSON.stringify(sectionDropData)}
        data-triage-target-state={bodyState}
        onScroll={handleScroll}
      >
        {children}
      </div>
    </section>
  );
}

function HierarchyItemList({
  activeDragItem,
  bits,
  isLoading,
  nodes,
  onSelectNode,
  overTargetId,
  parentPath,
  pendingPlacementDropId,
  selectedNodeId,
  targetFeedback,
}: {
  activeDragItem: TriageDragItem;
  bits: Bit[];
  isLoading: boolean;
  nodes: Node[];
  onSelectNode?: (nodeId: string) => void;
  overTargetId: string | null;
  parentPath: string[];
  pendingPlacementDropId: string | null;
  selectedNodeId?: string | null;
  targetFeedback: TriageTargetFeedback;
}) {
  if (!isLoading && nodes.length === 0 && bits.length === 0) {
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
          targetFeedback={targetFeedback}
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
  targetFeedback,
}: {
  activeDragItem: TriageDragItem;
  isSelected: boolean;
  node: Node;
  onSelectNode?: (nodeId: string) => void;
  overTargetId: string | null;
  parentPath: string[];
  pendingPlacementDropId: string | null;
  targetFeedback: TriageTargetFeedback;
}) {
  const dropId = getTriageHierarchyDropId(node.id);
  const dropData = {
    kind: "triage-hierarchy-drop",
    dropId,
    parentNodeId: node.id,
    targetNodeLevel: node.level,
    targetTitle: node.title,
    targetParentPath: parentPath,
  } satisfies TriageDropData;
  const { setNodeRef } = useDroppable({
    id: dropId,
    data: dropData,
  });
  const state = getCellState({
    activeDragItem,
    dropId,
    isAccepted: acceptsCandidate({
      activeDragItem,
      parentNodeId: node.id,
      targetNodeLevel: node.level,
    }),
    overTargetId,
    pendingPlacementDropId,
    targetFeedback,
  });
  const content = (
    <>
      <Folder
        aria-hidden="true"
        className="h-4 w-4 flex-shrink-0 text-muted-foreground/80"
      />
      <span className="min-w-0 truncate text-sm font-medium text-foreground">
        {node.title}
      </span>
    </>
  );

  if (onSelectNode !== undefined) {
    return (
      <button
        ref={setNodeRef}
        aria-current={isSelected ? "true" : undefined}
        aria-disabled={state === "invalid"}
        aria-label={`Select Node: ${node.title}`}
        className={cn(
          CELL_BASE_CLASS,
          activeDragItem === null && "hover:bg-muted hover:text-foreground",
          isSelected && "bg-accent text-foreground ring-1 ring-primary",
          CELL_STATE_CLASSES[state],
        )}
        data-explorer-item-id={node.id}
        data-triage-drop-id={dropId}
        data-triage-hierarchy-drop={JSON.stringify(dropData)}
        data-triage-target-state={state}
        type="button"
        onClick={() => onSelectNode(node.id)}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      ref={setNodeRef}
      aria-disabled={state === "invalid"}
      className={cn(CELL_DROP_ONLY_CLASS, CELL_STATE_CLASSES[state])}
      data-explorer-item-id={node.id}
      data-triage-drop-id={dropId}
      data-triage-hierarchy-drop={JSON.stringify(dropData)}
      data-triage-target-state={state}
    >
      {content}
    </div>
  );
}

function BitContextRow({ bit }: { bit: Bit }) {
  return (
    <div
      className="flex items-center gap-2 rounded-md px-3 py-1.5"
      data-explorer-item-id={bit.id}
    >
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
