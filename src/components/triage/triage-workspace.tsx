"use client";

import { DndContext, DragOverlay } from "@dnd-kit/core";
import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
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
import { useTriageDnd, type PendingPlacement } from "@/hooks/use-dnd";
import { triageCollisionDetection } from "@/lib/grid-dnd";
import { cn } from "@/lib/utils";
import { useTriageStore } from "@/stores/triage-store";
import type { Node } from "@/types";

function PanelHeader({ title }: { title: string }) {
  return (
    <div className="flex h-8 items-center justify-between border-b border-border bg-muted/30 px-3 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
      <span>{title}</span>
    </div>
  );
}

export function TriageWorkspace({ node }: { node: Node }) {
  const selectedScratchId = useTriageStore((state) => state.selectedScratchId);
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
  } = useTriageDnd(selectedScratchId);

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

            <div className="flex min-w-0 basis-2/5 bg-card">
              <div className="flex min-w-0 basis-[35%] flex-col">
                <PanelHeader title="Staging: Nodes" />
                <div className="flex min-h-0 flex-1 overflow-y-auto p-3">
                  <StagingZone
                    activeDragItem={activeDragItem}
                    overTargetId={overTargetId}
                    type="node"
                  />
                </div>
              </div>

              <div className="flex min-w-0 basis-[65%] flex-col border-l border-dashed border-border/80">
                <PanelHeader title="Staging: Bits" />
                <div className="flex min-h-0 flex-1 overflow-y-auto p-3">
                  <StagingZone
                    activeDragItem={activeDragItem}
                    overTargetId={overTargetId}
                    type="bit"
                  />
                </div>
              </div>
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
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
  onConfirm: (scratchId: string) => Promise<void>;
  pendingPlacement: PendingPlacement;
  selectedScratchId: string | null;
}) {
  const destinationPath =
    pendingPlacement === null
      ? []
      : [...pendingPlacement.targetParentPath, pendingPlacement.targetTitle];

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
              <span
                className={cn(
                  pendingPlacement?.candidateType === "node"
                    ? "bg-accent text-foreground border border-primary/50 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    : "bg-muted text-muted-foreground/80 border border-border/50 text-[10px] font-semibold px-2 py-0.5 rounded-md",
                )}
              >
                {pendingPlacement?.candidateType === "node" ? "Node" : "Bit"}
              </span>
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
                {pendingPlacement?.candidateType === "node"
                  ? `Create a node in ${pendingPlacement.targetTitle}`
                  : `Create a bit in ${pendingPlacement?.targetTitle}`}
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
            disabled={
              (pendingPlacement?.isFull ?? false) || selectedScratchId === null
            }
            onClick={() => {
              if (selectedScratchId) {
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
