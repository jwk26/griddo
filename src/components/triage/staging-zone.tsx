"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Folder } from "lucide-react";
import type { TriageDragItem } from "@/hooks/use-dnd";
import {
  useStagedCandidates,
  type StagedCandidateProjection,
} from "@/hooks/use-staged-candidates";
import {
  getTriageBitZoneDropId,
  getTriageNodeZoneDropId,
  type TriageDropData,
} from "@/lib/grid-dnd";
import { cn } from "@/lib/utils";
import { useTriageStore } from "@/stores/triage-store";

interface StagingZoneProps {
  type: StagedCandidateProjection["resultType"];
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
  "h-full min-h-0 max-h-full w-full overflow-y-auto rounded-lg border border-transparent [contain:size] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-[background-color,border-color,box-shadow,color] motion-reduce:transition-none";

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
  const { candidates: stagedCandidates } =
    useStagedCandidates(selectedScratchId);
  const candidates = stagedCandidates
    .filter((candidate) => candidate.resultType === type)
    .toSorted((left, right) => {
      const createdAtDifference = right.createdAt - left.createdAt;
      return createdAtDifference !== 0
        ? createdAtDifference
        : left.id.localeCompare(right.id);
    });

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
  candidates: StagedCandidateProjection[];
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
      data-empty={candidates.length === 0}
      data-testid="node-staging-zone"
    >
      {candidates.length > 0 ? (
        <div className="grid w-full grid-cols-2 gap-2 pb-1">
          {candidates.map((candidate) => (
            <NodeCandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function BitStagingZone({
  activeDragItem,
  candidates,
  overTargetId,
}: {
  activeDragItem: TriageDragItem;
  candidates: StagedCandidateProjection[];
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
      data-empty={candidates.length === 0}
      data-testid="bit-staging-zone"
    >
      {candidates.length > 0 ? (
        <div className="flex w-full flex-col gap-1.5 pb-1">
          {candidates.map((candidate) => (
            <BitCandidateRow key={candidate.id} candidate={candidate} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NodeCandidateCard({
  candidate,
}: {
  candidate: StagedCandidateProjection;
}) {
  const { attributes, isDragging, listeners, setNodeRef } = useDraggable({
    id: `triage-staged-node:${candidate.id}`,
    data: {
      kind: "triage-staged-node",
      id: candidate.id,
      label: candidate.content,
      sourceBreakdownId: candidate.sourceBreakdownId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      aria-label={`Drag ${candidate.content} staged node`}
      className={cn(
        "mx-auto aspect-square h-auto w-full max-w-[80px] touch-none cursor-grab select-none overflow-hidden rounded-lg border border-border/80 bg-background transition-[background-color,border-color,color,opacity] active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
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
          {candidate.content}
        </div>
      </div>
    </div>
  );
}

function BitCandidateRow({
  candidate,
}: {
  candidate: StagedCandidateProjection;
}) {
  const { attributes, isDragging, listeners, setNodeRef } = useDraggable({
    id: `triage-staged-bit:${candidate.id}`,
    data: {
      kind: "triage-staged-bit",
      id: candidate.id,
      label: candidate.content,
      sourceBreakdownId: candidate.sourceBreakdownId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      aria-label={`Drag ${candidate.content} staged bit`}
      className={cn(
        "flex min-h-[2rem] w-full touch-none cursor-grab select-none items-center rounded-lg border border-border/60 bg-background px-3 py-1.5 transition-[background-color,border-color,color,opacity] active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
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
        {candidate.content}
      </div>
    </div>
  );
}
