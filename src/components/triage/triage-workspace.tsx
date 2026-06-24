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
import {
  getTriageRemoveDropId,
  triageCollisionDetection,
  type TriageDropData,
} from "@/lib/grid-dnd";
import { cn } from "@/lib/utils";
import { useTriageStore } from "@/stores/triage-store";
import type { Node } from "@/types";

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

function PanelHeader({ title }: { title: string }) {
  return (
    <div className="flex h-8 items-center justify-between border-b border-border bg-muted/30 px-3 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
      <span>{title}</span>
    </div>
  );
}

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
  const selectedScratchId = useTriageStore((state) => state.selectedScratchId);
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
      className="flex h-full min-h-0 w-full overflow-hidden bg-background"
      data-testid="triage-workspace"
    >
      <ScratchPool />

      <div className="flex h-full min-w-0 flex-1 flex-col bg-background">
        <DndContext
          autoScroll={false}
          collisionDetection={triageCollisionDetection}
          sensors={sensors}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
        >
          <div className="flex min-h-0 basis-3/5 border-b border-border">
            <div className="flex min-w-0 basis-3/5 flex-col border-r border-border bg-card">
              <PanelHeader title="Breakdown / Scribble" />
              <div className="min-h-0 flex-1 overflow-hidden">
                <BreakdownPanel />
              </div>
            </div>

            <div className="flex min-w-0 basis-2/5 flex-col bg-card">
              <div className="flex min-h-0 flex-1">
                <div className="flex min-w-0 basis-[35%] flex-col">
                  <div
                    className="flex h-8 items-center border-b border-border bg-muted/30 px-3 py-1.5"
                    aria-hidden="true"
                  />
                  <div className="flex min-h-0 flex-1 overflow-y-auto p-3">
                    <StagingZone
                      activeDragItem={activeDragItem}
                      overTargetId={overTargetId}
                      type="node"
                    />
                  </div>
                </div>

                <div className="flex min-w-0 basis-[65%] flex-col border-l border-dashed border-border/80">
                  <div
                    className="flex h-8 items-center border-b border-border bg-muted/30 px-3 py-1.5"
                    aria-hidden="true"
                  />
                  <div className="flex min-h-0 flex-1 overflow-y-auto p-3">
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
            </div>
          </div>

          <DragOverlay dropAnimation={null} modifiers={[snapDragTokenToCursor]}>
            {activeDragItem ? <TriageDragToken item={activeDragItem} /> : null}
          </DragOverlay>

          <div className="flex min-h-0 basis-2/5 flex-col bg-background">
            <PanelHeader title="Hierarchy Explorer" />
            <div className="flex min-h-0 flex-1 overflow-hidden p-3">
              <HierarchyExplorer
                activeDragItem={activeDragItem}
                overTargetId={overTargetId}
                pendingPlacementDropId={pendingPlacement?.dropId ?? null}
              />
            </div>
          </div>

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
            <div className="flex items-center gap-2 rounded-md border border-destructive bg-muted p-3">
              <AlertTriangle
                aria-hidden="true"
                className="h-4 w-4 flex-shrink-0 text-destructive"
              />
              <p className="text-xs font-semibold text-destructive">
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
