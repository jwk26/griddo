"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Folder, ListTodo } from "lucide-react";
import type { TriageDragItem } from "@/hooks/use-dnd";
import {
  getTriageBitZoneDropId,
  getTriageNodeZoneDropId,
  type TriageDropData,
} from "@/lib/grid-dnd";
import { cn } from "@/lib/utils";
import { useTriageStore, type StagedCandidate } from "@/stores/triage-store";

interface StagingZoneProps {
  type: StagedCandidate["type"];
  activeDragItem?: TriageDragItem;
  overTargetId?: string | null;
}

type DropZoneState =
  | "default"
  | "idle-valid"
  | "idle-invalid"
  | "valid"
  | "invalid"
  | "pending-confirmation";

const DROP_ZONE_BASE_CLASS =
  "min-h-full w-full rounded-lg border border-transparent transition-[background-color,border-color,box-shadow,color]";

const DROP_ZONE_STATE_CLASSES: Record<DropZoneState, string> = {
  default: "",
  "idle-valid": "border-dashed border-muted",
  "idle-invalid": "",
  valid: "border-solid border-primary bg-accent ring-1 ring-primary",
  invalid:
    "border-solid border-muted bg-muted/10 text-muted-foreground/50 cursor-not-allowed [&_*]:!text-muted-foreground/50",
  "pending-confirmation": "animate-pulse border-dashed border-ring bg-popover",
};

function getDropZoneState({
  activeDragItem,
  isOver,
  isValidTarget,
}: {
  activeDragItem: TriageDragItem;
  isOver: boolean;
  isValidTarget: boolean;
}): DropZoneState {
  const isDragActive = activeDragItem !== null;

  if (!isDragActive) return "default";
  if (isOver && isValidTarget) return "valid";
  if (isOver && !isValidTarget) return "invalid";
  if (isValidTarget) return "idle-valid";
  return "idle-invalid";
}

export function StagingZone({
  type,
  activeDragItem = null,
  overTargetId = null,
}: StagingZoneProps) {
  const selectedScratchId = useTriageStore((state) => state.selectedScratchId);
  const stagedCandidates = useTriageStore((state) => state.stagedCandidates);
  const candidates = (stagedCandidates[selectedScratchId ?? ""] ?? []).filter(
    (candidate) => candidate.type === type,
  );

  if (type === "node") {
    return (
      <NodeStagingZone
        activeDragItem={activeDragItem}
        candidates={candidates}
        overTargetId={overTargetId}
      />
    );
  }

  return (
    <BitStagingZone
      activeDragItem={activeDragItem}
      candidates={candidates}
      overTargetId={overTargetId}
    />
  );
}

function NodeStagingZone({
  activeDragItem,
  candidates,
  overTargetId,
}: {
  activeDragItem: TriageDragItem;
  candidates: StagedCandidate[];
  overTargetId: string | null;
}) {
  const dropId = getTriageNodeZoneDropId();
  const { setNodeRef } = useDroppable({
    id: dropId,
    data: { kind: "triage-node-zone-drop" } satisfies TriageDropData,
  });
  const state = getDropZoneState({
    activeDragItem,
    isOver: overTargetId === dropId,
    isValidTarget:
      activeDragItem?.kind === "triage-breakdown" ||
      activeDragItem?.kind === "triage-staged-node",
  });

  return (
    <div
      ref={setNodeRef}
      aria-label="Node staging zone"
      className={cn(DROP_ZONE_BASE_CLASS, DROP_ZONE_STATE_CLASSES[state])}
      data-testid="node-staging-zone"
    >
      {candidates.length === 0 ? (
        <NodeEmptyState />
      ) : (
        <div className="grid w-full grid-cols-2 gap-2">
          {candidates.map((candidate) => (
            <NodeCandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      )}
    </div>
  );
}

function BitStagingZone({
  activeDragItem,
  candidates,
  overTargetId,
}: {
  activeDragItem: TriageDragItem;
  candidates: StagedCandidate[];
  overTargetId: string | null;
}) {
  const dropId = getTriageBitZoneDropId();
  const { setNodeRef } = useDroppable({
    id: dropId,
    data: { kind: "triage-bit-zone-drop" } satisfies TriageDropData,
  });
  const state = getDropZoneState({
    activeDragItem,
    isOver: overTargetId === dropId,
    isValidTarget:
      activeDragItem?.kind === "triage-breakdown" ||
      activeDragItem?.kind === "triage-staged-bit",
  });

  return (
    <div
      ref={setNodeRef}
      aria-label="Bit staging zone"
      className={cn(DROP_ZONE_BASE_CLASS, DROP_ZONE_STATE_CLASSES[state])}
      data-testid="bit-staging-zone"
    >
      {candidates.length === 0 ? (
        <BitEmptyState />
      ) : (
        <div className="flex w-full flex-col gap-1.5">
          {candidates.map((candidate) => (
            <BitCandidateRow key={candidate.id} candidate={candidate} />
          ))}
        </div>
      )}
    </div>
  );
}

function NodeCandidateCard({ candidate }: { candidate: StagedCandidate }) {
  const { attributes, isDragging, listeners, setNodeRef } = useDraggable({
    id: `triage-staged-node:${candidate.id}`,
    data: {
      kind: "triage-staged-node",
      id: candidate.id,
      label: candidate.label,
      sourceBreakdownId: candidate.sourceBreakdownId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      aria-label={`Drag ${candidate.label} staged node`}
      className={cn(
        "mx-auto aspect-square h-auto w-full max-w-[80px] cursor-grab select-none overflow-hidden rounded-lg border border-border/80 bg-background transition-[background-color,border-color,color,opacity] active:cursor-grabbing",
        isDragging && "opacity-30 border-dashed border-muted bg-transparent",
      )}
      data-testid="node-candidate-card"
      {...attributes}
      {...listeners}
    >
      <div className="flex h-full w-full flex-col items-center justify-center p-2">
        <Folder
          aria-hidden="true"
          className={cn(
            "h-6 w-6 flex-shrink-0 text-muted-foreground transition-colors",
            isDragging && "text-muted-foreground",
          )}
        />
        <div
          className={cn(
            "mt-auto w-full truncate px-1 pb-1 text-center text-[10px] font-semibold transition-colors",
            isDragging ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {candidate.label}
        </div>
      </div>
    </div>
  );
}

function BitCandidateRow({ candidate }: { candidate: StagedCandidate }) {
  const { attributes, isDragging, listeners, setNodeRef } = useDraggable({
    id: `triage-staged-bit:${candidate.id}`,
    data: {
      kind: "triage-staged-bit",
      id: candidate.id,
      label: candidate.label,
      sourceBreakdownId: candidate.sourceBreakdownId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      aria-label={`Drag ${candidate.label} staged bit`}
      className={cn(
        "flex min-h-[2rem] w-full cursor-grab select-none items-center rounded-lg border border-border/60 bg-background px-3 py-1.5 transition-[background-color,border-color,color,opacity] active:cursor-grabbing",
        isDragging && "opacity-30 border-dashed border-muted bg-transparent",
      )}
      data-testid="bit-candidate-row"
      {...attributes}
      {...listeners}
    >
      <div
        className={cn(
          "min-w-0 flex-1 truncate text-left text-xs font-medium transition-colors",
          isDragging ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {candidate.label}
      </div>
    </div>
  );
}

function NodeEmptyState() {
  return (
    <div className="flex min-h-[96px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-transparent p-4">
      <Folder
        aria-hidden="true"
        className="h-5 w-5 text-muted-foreground/30"
      />
      <div className="mt-1 text-center text-[10px] text-pretty text-muted-foreground/50">
        No node candidates
      </div>
    </div>
  );
}

function BitEmptyState() {
  return (
    <div className="flex min-h-[64px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-transparent p-4">
      <ListTodo
        aria-hidden="true"
        className="h-5 w-5 text-muted-foreground/30"
      />
      <div className="mt-1 text-center text-[10px] text-muted-foreground/50">
        No bit candidates
      </div>
    </div>
  );
}
