"use client";

import { Folder, ListTodo } from "lucide-react";
import { useTriageStore, type StagedCandidate } from "@/stores/triage-store";

interface StagingZoneProps {
  type: StagedCandidate["type"];
}

export function StagingZone({ type }: StagingZoneProps) {
  const selectedScratchId = useTriageStore((state) => state.selectedScratchId);
  const stagedCandidates = useTriageStore((state) => state.stagedCandidates);
  const candidates = (stagedCandidates[selectedScratchId ?? ""] ?? []).filter(
    (candidate) => candidate.type === type,
  );

  if (type === "node") {
    return (
      <div
        aria-label="Node staging zone"
        className="w-full"
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

  return (
    <div
      aria-label="Bit staging zone"
      className="w-full"
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
  return (
    <div
      className="mx-auto h-auto aspect-square w-full max-w-[80px] overflow-hidden rounded-lg border border-border/80 bg-background"
      data-testid="node-candidate-card"
    >
      <div className="flex h-full w-full flex-col items-center justify-center p-2">
        <Folder
          aria-hidden="true"
          className="h-6 w-6 flex-shrink-0 text-muted-foreground"
        />
        <div className="mt-auto w-full truncate px-1 pb-1 text-center text-[10px] font-semibold text-foreground">
          {candidate.label}
        </div>
      </div>
    </div>
  );
}

function BitCandidateRow({ candidate }: { candidate: StagedCandidate }) {
  return (
    <div
      className="flex min-h-[2rem] w-full items-center rounded-lg border border-border/60 bg-background px-3 py-1.5"
      data-testid="bit-candidate-row"
    >
      <div className="min-w-0 flex-1 truncate text-left text-xs font-medium text-foreground">
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
