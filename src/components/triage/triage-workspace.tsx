"use client";

import { DndContext, DragOverlay, useDroppable, type Modifier } from "@dnd-kit/core";
import { AlertTriangle, Folder, ListTodo, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BreakdownPanel } from "@/components/triage/breakdown-panel";
import { HierarchyExplorer } from "@/components/triage/hierarchy-explorer";
import { ScratchPool } from "@/components/triage/scratch-pool";
import { TriageDragToken } from "@/components/triage/triage-drag-token";
import { StagingZone } from "@/components/triage/staging-zone";
import {
  useTriageDnd,
  type PendingPlacement,
  type TriageDragItem,
} from "@/hooks/use-dnd";
import { useStagedCandidates } from "@/hooks/use-staged-candidates";
import {
  TriageOperationLockContext,
  useTriageOperationLock,
} from "@/hooks/use-triage-operation-lock";
import {
  getTriageRemoveDropId,
  triageCollisionDetection,
  type TriageDropData,
} from "@/lib/grid-dnd";
import { INBOX_TRIAGE_COPY } from "@/lib/copy/inbox-triage";
import { cn } from "@/lib/utils";
import { useTriageStore } from "@/stores/triage-store";
import type { Node } from "@/types";

function formatStagingHeading(label: string, count: number) {
  return count >= 2 ? `${count} ${label}` : label;
}

// Positions the compact drag token center at the cursor rather than the
// original draggable element's top-left. Without this, grabbing a staged
// Node card or Bit row away from the top-left leaves the token visually
// detached from the pointer (ISSUE-18-10).
const snapDragTokenToCursor: Modifier = ({
  activatorEvent,
  draggingNodeRect,
  overlayNodeRect,
  transform,
}) => {
  if (!draggingNodeRect || !activatorEvent) return transform;

  let clientX: number | undefined;
  let clientY: number | undefined;

  if ("touches" in activatorEvent) {
    const { touches } = activatorEvent as TouchEvent;
    if (touches.length > 0) {
      clientX = touches[0].clientX;
      clientY = touches[0].clientY;
    }
  } else if ("clientX" in activatorEvent) {
    clientX = (activatorEvent as MouseEvent).clientX;
    clientY = (activatorEvent as MouseEvent).clientY;
  }

  if (clientX === undefined || clientY === undefined) return transform;

  const tokenWidth = overlayNodeRect?.width ?? 0;
  const tokenHeight = overlayNodeRect?.height ?? 0;

  return {
    ...transform,
    x: transform.x + clientX - draggingNodeRect.left - tokenWidth / 2,
    y: transform.y + clientY - draggingNodeRect.top - tokenHeight / 2,
  };
};

function TriageRemoveDropTarget({
  activeDragItem,
  overTargetId,
}: {
  activeDragItem: TriageDragItem;
  overTargetId: string | null;
}) {
  const id = getTriageRemoveDropId();
  const dropData = { kind: "triage-remove-drop" } satisfies TriageDropData;
  const { setNodeRef } = useDroppable({
    id,
    data: dropData,
  });
  const isStagedDrag =
    activeDragItem?.kind === "triage-staged-node" ||
    activeDragItem?.kind === "triage-staged-bit";
  const isOver = overTargetId === id;

  if (!isStagedDrag) return null;

  return (
    <div
      ref={setNodeRef}
      aria-label="Drop staged item here to remove from staging"
      className={cn(
        "flex h-12 w-full items-center justify-center gap-2 border-t bg-transparent px-3 text-xs font-medium transition-[background-color,border-color,color] motion-reduce:transition-none",
        isOver
          ? "border-solid border-border bg-muted text-foreground"
          : "border-dashed border-border text-muted-foreground motion-safe:animate-jiggle",
      )}
    >
      <X aria-hidden="true" className="h-4 w-4 flex-shrink-0" />
      <span>Remove from staging</span>
    </div>
  );
}

export function TriageWorkspace({ node }: { node: Node }) {
  const operationLock = useTriageOperationLock();

  return (
    <TriageOperationLockContext.Provider value={operationLock}>
      <TriageWorkspaceContent node={node} operationLock={operationLock} />
    </TriageOperationLockContext.Provider>
  );
}

function TriageWorkspaceContent({
  node,
  operationLock,
}: {
  node: Node;
  operationLock: ReturnType<typeof useTriageOperationLock>;
}) {
  const selectedScratchId = useTriageStore((state) => state.selectedScratchId);
  const { counts: stagedCandidateCounts } =
    useStagedCandidates(selectedScratchId);
  const addStagedCandidate = useTriageStore(
    (state) => state.addStagedCandidate,
  );
  const removeStagedCandidate = useTriageStore(
    (state) => state.removeStagedCandidate,
  );
  const {
    activeDragItem,
    handleDragEnd,
    handleDragOver,
    handlePlacementCancel,
    handlePlacementConfirm,
    handleDragStart,
    overTargetId,
    pendingPlacement,
    sensors,
  } = useTriageDnd(selectedScratchId, {
    addStagedCandidate,
    removeStagedCandidate,
  });

  return (
    <section
      aria-label={`${node.title} triage workspace`}
      className="triage-shell flex h-full min-h-0 w-full overflow-hidden bg-background"
      data-min-viewport="1024px"
      data-testid="triage-workspace"
      data-triage-operation-kind={operationLock.activeOperation?.kind}
      data-triage-role="shell-background"
      data-triage-state="default"
    >
      <section
        aria-labelledby="triage-scratch-pool-heading"
        className="triage-shell__pool relative flex h-full min-h-0 shrink-0"
        data-triage-role="section-surface"
        data-triage-state="default"
      >
        <h2
          className="triage-shell__pool-heading"
          data-triage-role="section-header"
          id="triage-scratch-pool-heading"
          tabIndex={-1}
        >
          {INBOX_TRIAGE_COPY.sectionNames.scratchPool}
        </h2>
        <div
          className="min-h-0"
          data-triage-role="internal-scroll-viewport"
        >
          <ScratchPool />
        </div>
      </section>

      <div
        className="triage-shell__main h-full min-w-0 flex-1 bg-background"
        data-layout-ratio="60/40"
        data-testid="triage-main-work-area"
      >
        <DndContext
          autoScroll={false}
          collisionDetection={triageCollisionDetection}
          sensors={sensors}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
        >
          <div
            className="triage-shell__top min-h-0 border-b border-border"
            data-layout-ratio="60/40"
            data-testid="triage-top-work-area"
          >
            <section
              aria-labelledby="triage-breakdown-heading"
              className="flex min-h-0 min-w-0 flex-col border-r border-border bg-card"
              data-triage-role="section-surface"
              data-triage-state="default"
            >
              <h2
                className="triage-shell__section-heading"
                data-triage-role="section-header"
                id="triage-breakdown-heading"
                tabIndex={-1}
              >
                {INBOX_TRIAGE_COPY.sectionNames.breakdown}
              </h2>
              <div
                className="min-h-0 flex-1 overflow-hidden"
                data-triage-role="internal-scroll-viewport"
              >
                <BreakdownPanel />
              </div>
            </section>

            <section
              aria-labelledby="triage-staging-heading"
              className="flex min-h-0 min-w-0 flex-col bg-card"
              data-triage-role="section-surface"
              data-triage-state="default"
            >
              <h2
                className="triage-shell__section-heading"
                data-triage-role="section-header"
                id="triage-staging-heading"
                tabIndex={-1}
              >
                {INBOX_TRIAGE_COPY.sectionNames.staging}
              </h2>
              <div
                className="triage-shell__staging min-h-0 flex-1"
                data-layout-ratio="35/65"
                data-testid="triage-staging-columns"
              >
                <div className="flex min-w-0 basis-[35%] flex-col">
                  <h3 className="triage-shell__subsection-heading">
                    {formatStagingHeading(
                      INBOX_TRIAGE_COPY.sectionNames.stagingNodes,
                      stagedCandidateCounts.nodes,
                    )}
                  </h3>
                  <div
                    className="flex min-h-0 flex-1 overflow-y-auto p-3"
                    data-triage-role="internal-scroll-viewport"
                  >
                    <StagingZone
                      activeDragItem={activeDragItem}
                      overTargetId={overTargetId}
                      type="node"
                    />
                  </div>
                </div>

                <div className="flex min-w-0 basis-[65%] flex-col border-l border-dashed border-border/80">
                  <h3 className="triage-shell__subsection-heading">
                    {formatStagingHeading(
                      INBOX_TRIAGE_COPY.sectionNames.stagingBits,
                      stagedCandidateCounts.bits,
                    )}
                  </h3>
                  <div
                    className="flex min-h-0 flex-1 overflow-y-auto p-3"
                    data-triage-role="internal-scroll-viewport"
                  >
                    <StagingZone
                      activeDragItem={activeDragItem}
                      overTargetId={overTargetId}
                      type="bit"
                    />
                  </div>
                </div>
              </div>
              <TriageRemoveDropTarget
                activeDragItem={activeDragItem}
                overTargetId={overTargetId}
              />
            </section>
          </div>

          <DragOverlay dropAnimation={null} modifiers={[snapDragTokenToCursor]}>
            {activeDragItem ? <TriageDragToken item={activeDragItem} /> : null}
          </DragOverlay>

          <section
            aria-labelledby="triage-grid-explorer-heading"
            className="flex min-h-0 flex-col bg-background"
            data-triage-role="section-surface"
            data-triage-state="default"
          >
            <h2
              className="triage-shell__section-heading"
              data-triage-role="section-header"
              id="triage-grid-explorer-heading"
              tabIndex={-1}
            >
              {INBOX_TRIAGE_COPY.sectionNames.gridExplorer}
            </h2>
            <div
              className="flex min-h-0 flex-1 overflow-hidden"
              data-triage-role="internal-scroll-viewport"
            >
              <HierarchyExplorer
                activeDragItem={activeDragItem}
                onPendingPlacementInvalidated={handlePlacementCancel}
                overTargetId={overTargetId}
                pendingPlacementDropId={pendingPlacement?.dropId ?? null}
              />
            </div>
          </section>

          <PlacementConfirmationDialog
            key={pendingPlacement?.dropId ?? "none"}
            pendingPlacement={pendingPlacement}
            selectedScratchId={selectedScratchId}
            onCancel={handlePlacementCancel}
            onConfirm={handlePlacementConfirm}
          />
        </DndContext>
      </div>
    </section>
  );
}

function PlacementConfirmationDialog({
  onCancel,
  onConfirm,
  pendingPlacement,
  selectedScratchId,
}: {
  onCancel: () => void;
  onConfirm: (
    scratchId: string,
    confirmedType?: "node" | "bit",
  ) => Promise<void>;
  pendingPlacement: PendingPlacement;
  selectedScratchId: string | null;
}) {
  const [selectedType, setSelectedType] =
    useState<"node" | "bit" | null>(null);
  const destinationPath =
    pendingPlacement === null
      ? []
      : [...pendingPlacement.targetParentPath, pendingPlacement.targetTitle];
  const isDirectPlacement = pendingPlacement?.candidateType === null;
  const resultType = pendingPlacement?.candidateType ?? selectedType;
  const isNodeValid =
    pendingPlacement !== null &&
    (pendingPlacement.targetNodeLevel === null ||
      pendingPlacement.targetNodeLevel < 2);
  const isBitValid =
    pendingPlacement !== null && pendingPlacement.parentNodeId !== null;
  const confirmDisabled =
    (pendingPlacement?.isFull ?? false) ||
    selectedScratchId === null ||
    (isDirectPlacement && selectedType === null);

  return (
    <Dialog
      open={pendingPlacement !== null}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-md w-full overflow-y-hidden border border-border bg-popover p-6 rounded-lg"
      >
        <DialogHeader>
          <DialogTitle>Place item?</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="divide-y divide-border/50">
            <PlacementField label="Candidate">
              <div className="truncate text-sm font-medium text-foreground">
                {pendingPlacement?.candidateLabel}
              </div>
            </PlacementField>

            <PlacementField label="Type">
              {pendingPlacement !== null &&
              pendingPlacement.candidateType === null ? (
                <TypeChoiceSelector
                  isBitValid={isBitValid}
                  isNodeValid={isNodeValid}
                  selectedType={selectedType}
                  onSelect={setSelectedType}
                />
              ) : (
                <span
                  className={cn(
                    pendingPlacement?.candidateType === "node"
                      ? "bg-accent text-foreground border border-primary/50 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      : "bg-muted text-muted-foreground/80 border border-border/50 text-[10px] font-semibold px-2 py-0.5 rounded-md",
                  )}
                >
                  {pendingPlacement?.candidateType === "node" ? "Node" : "Bit"}
                </span>
              )}
            </PlacementField>

            <PlacementField label="Destination">
              <div className="flex min-w-0 items-center gap-1.5 truncate text-sm font-medium text-foreground">
                {destinationPath.map((segment, index) => (
                  <span
                    key={`${segment}-${index}`}
                    className="min-w-0 truncate"
                  >
                    {index > 0 ? "→ " : ""}
                    {segment}
                  </span>
                ))}
              </div>
            </PlacementField>

            <PlacementField label="Result">
              <div className="text-sm font-semibold text-foreground">
                {pendingPlacement === null
                  ? null
                  : resultType === "node"
                    ? `Create a node in ${pendingPlacement.targetTitle}`
                    : resultType === "bit"
                      ? `Create a bit in ${pendingPlacement.targetTitle}`
                      : "Choose a type"}
              </div>
            </PlacementField>
          </div>

          {pendingPlacement?.isFull && (
            <div className="flex items-center gap-2 rounded-md border border-muted-foreground/30 bg-muted/40 p-3">
              <AlertTriangle
                aria-hidden="true"
                className="h-4 w-4 flex-shrink-0 text-muted-foreground"
              />
              <p className="text-xs font-semibold text-muted-foreground">
                No available grid cell in this target
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            disabled={confirmDisabled}
            onClick={() => {
              if (selectedScratchId) {
                if (isDirectPlacement) {
                  void onConfirm(selectedScratchId, selectedType ?? undefined);
                  return;
                }

                void onConfirm(selectedScratchId);
              }
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TypeChoiceSelector({
  isBitValid,
  isNodeValid,
  onSelect,
  selectedType,
}: {
  isBitValid: boolean;
  isNodeValid: boolean;
  onSelect: (type: "node" | "bit") => void;
  selectedType: "node" | "bit" | null;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div
        aria-label="Select placement type"
        className="flex min-w-0 items-center gap-1.5 rounded-md border border-border/50 bg-muted/30 p-0.5"
        role="radiogroup"
      >
        <TypeChoiceOption
          disabled={!isNodeValid}
          icon={<Folder aria-hidden="true" className="h-4 w-4" />}
          label="Node"
          selected={selectedType === "node"}
          type="node"
          onSelect={onSelect}
        />
        <TypeChoiceOption
          disabled={!isBitValid}
          icon={<ListTodo aria-hidden="true" className="h-4 w-4" />}
          label="Bit"
          selected={selectedType === "bit"}
          type="bit"
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}

function TypeChoiceOption({
  disabled,
  icon,
  label,
  onSelect,
  selected,
  type,
}: {
  disabled: boolean;
  icon: ReactNode;
  label: string;
  onSelect: (type: "node" | "bit") => void;
  selected: boolean;
  type: "node" | "bit";
}) {
  return (
    <button
      aria-checked={selected ? "true" : "false"}
      aria-label={`Select ${label} type`}
      className={cn(
        "group flex min-w-0 items-center gap-1.5 rounded-md border border-transparent bg-transparent px-2 py-1 text-[10px] font-semibold text-muted-foreground/80 transition-opacity touch-action-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        disabled
          ? "cursor-not-allowed border-transparent text-muted-foreground/50 opacity-40"
          : selected
            ? "cursor-pointer border-primary bg-accent text-foreground ring-1 ring-primary"
            : "cursor-pointer hover:bg-muted hover:text-foreground",
      )}
      disabled={disabled}
      role="radio"
      type="button"
      onClick={() => onSelect(type)}
    >
      <span
        className={cn(
          "flex h-4 w-4 flex-shrink-0 items-center justify-center text-muted-foreground/50",
          disabled
            ? "text-muted-foreground/50"
            : selected
              ? "text-foreground"
              : "group-hover:text-muted-foreground/80",
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          "min-w-0 truncate text-muted-foreground/80",
          disabled
            ? "text-muted-foreground/50"
            : selected
              ? "text-foreground"
              : "group-hover:text-foreground",
        )}
      >
        {label}
      </span>
    </button>
  );
}

function PlacementField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="py-3">
      <div className="mb-1 font-mono text-[10px] font-medium uppercase text-muted-foreground/50">
        {label}
      </div>
      {children}
    </div>
  );
}
