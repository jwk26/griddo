"use client";

import { liveQuery } from "dexie";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getDataStore,
  type ConfirmedCandidateOrphanCleanupCommand,
  type ConfirmedCandidateOrphanCleanupResult,
  type StageCandidateCommand,
  type StageCandidateResult,
  type UnstageCandidateCommand,
  type UnstageCandidateResult,
} from "@/lib/db/datastore";
import type {
  ScratchBreakdown,
  StagedCandidate,
  UnknownRepositoryOperationOutcome,
} from "@/lib/db/schema";

export type StagedCandidateProjection = Readonly<
  StagedCandidate & {
    content: string;
    source: ScratchBreakdown;
  }
>;

export type CandidateOperationKind = "stage" | "unstage" | "orphan_cleanup";

export type CandidateOperationProjection = Readonly<{
  operationId: string;
  candidateId: string;
  sourceBreakdownId: string;
  kind: CandidateOperationKind;
  phase: "pending" | "unknown";
  resultType?: StagedCandidate["resultType"];
}>;

export type CandidateCommandOutcome<TResult> =
  | TResult
  | UnknownRepositoryOperationOutcome;

export type StagedCandidateCounts = Readonly<{
  authoritative: number;
  renderable: number;
  nodes: number;
  bits: number;
  visibleNodes: number;
  visibleBits: number;
}>;

export type StagedCandidateEligibility = Readonly<{
  archiveCandidateClear: boolean;
  stagedSourceIds: ReadonlySet<string>;
  isSourceStaged: (sourceBreakdownId: string) => boolean;
}>;

type CandidateSnapshot = Readonly<{
  scratchBitId: string;
  candidates: StagedCandidate[];
  sources: ScratchBreakdown[];
}>;

type OperationInput = Readonly<{
  operationId: string;
  candidateId: string;
  sourceBreakdownId: string;
  resultType?: StagedCandidate["resultType"];
}>;

type UseStagedCandidatesResult = Readonly<{
  candidates: StagedCandidateProjection[];
  unresolvedCandidates: StagedCandidate[];
  pendingOperations: CandidateOperationProjection[];
  unknownOperations: CandidateOperationProjection[];
  counts: StagedCandidateCounts;
  eligibility: StagedCandidateEligibility;
  stageCandidate: (
    command: StageCandidateCommand,
  ) => Promise<CandidateCommandOutcome<StageCandidateResult>>;
  reconcileStageCandidate: (
    command: StageCandidateCommand,
  ) => Promise<CandidateCommandOutcome<StageCandidateResult>>;
  unstageCandidate: (
    command: UnstageCandidateCommand,
  ) => Promise<CandidateCommandOutcome<UnstageCandidateResult>>;
  reconcileUnstageCandidate: (
    command: UnstageCandidateCommand,
  ) => Promise<CandidateCommandOutcome<UnstageCandidateResult>>;
  cleanupConfirmedCandidateOrphan: (
    command: ConfirmedCandidateOrphanCleanupCommand,
  ) => Promise<CandidateCommandOutcome<ConfirmedCandidateOrphanCleanupResult>>;
  reconcileConfirmedCandidateOrphanCleanup: (
    command: ConfirmedCandidateOrphanCleanupCommand,
  ) => Promise<CandidateCommandOutcome<ConfirmedCandidateOrphanCleanupResult>>;
}>;

const EMPTY_CANDIDATES: StagedCandidate[] = [];
const EMPTY_SOURCES: ScratchBreakdown[] = [];

export function useStagedCandidates(
  scratchBitId: string | null,
): UseStagedCandidatesResult {
  const [snapshot, setSnapshot] = useState<CandidateSnapshot | null>(null);
  const [operations, setOperations] = useState<CandidateOperationProjection[]>([]);

  useEffect(() => {
    // Operation projections belong only to the currently selected Scratch.
    setOperations([]);

    if (scratchBitId === null) return;

    const subscription = liveQuery(async (): Promise<CandidateSnapshot> => {
      const { db } = await import("@/lib/db/indexeddb");
      const [candidates, sources] = await Promise.all([
        db.stagedCandidates.where("scratchBitId").equals(scratchBitId).toArray(),
        db.scratchBreakdowns.where("scratchBitId").equals(scratchBitId).toArray(),
      ]);
      return { scratchBitId, candidates, sources };
    }).subscribe({
      next: (value) => setSnapshot(value),
      error: (error) => console.error("staged candidates liveQuery error:", error),
    });

    return () => subscription.unsubscribe();
  }, [scratchBitId]);

  const currentSnapshot =
    snapshot?.scratchBitId === scratchBitId ? snapshot : null;
  const authoritativeCandidates =
    currentSnapshot?.candidates ?? EMPTY_CANDIDATES;
  const sources = currentSnapshot?.sources ?? EMPTY_SOURCES;

  const { candidates, unresolvedCandidates } = useMemo(() => {
    const sourcesById = new Map(sources.map((source) => [source.id, source]));
    const joined: StagedCandidateProjection[] = [];
    const unresolved: StagedCandidate[] = [];

    for (const candidate of authoritativeCandidates) {
      const source = sourcesById.get(candidate.sourceBreakdownId);
      if (
        !source ||
        source.scratchBitId !== candidate.scratchBitId ||
        source.consumedAt !== null
      ) {
        unresolved.push(candidate);
        continue;
      }
      joined.push({ ...candidate, source, content: source.content });
    }

    return { candidates: joined, unresolvedCandidates: unresolved };
  }, [authoritativeCandidates, sources]);

  const pendingOperations = useMemo(
    () => operations.filter((operation) => operation.phase === "pending"),
    [operations],
  );
  const unknownOperations = useMemo(
    () => operations.filter((operation) => operation.phase === "unknown"),
    [operations],
  );

  const counts = useMemo<StagedCandidateCounts>(() => {
    const nodes = candidates.filter(({ resultType }) => resultType === "node").length;
    const bits = candidates.length - nodes;
    const projectedStageOperations = operations.filter(
      (operation) =>
        operation.kind === "stage" &&
        !authoritativeCandidates.some(
          (candidate) => candidate.id === operation.candidateId,
        ),
    );

    return {
      authoritative: authoritativeCandidates.length,
      renderable: candidates.length,
      nodes,
      bits,
      visibleNodes:
        nodes +
        projectedStageOperations.filter(({ resultType }) => resultType === "node")
          .length,
      visibleBits:
        bits +
        projectedStageOperations.filter(({ resultType }) => resultType === "bit")
          .length,
    };
  }, [authoritativeCandidates, candidates, operations]);

  const stagedSourceIds = useMemo(
    () =>
      new Set(
        authoritativeCandidates.map((candidate) => candidate.sourceBreakdownId),
      ),
    [authoritativeCandidates],
  );
  const isSourceStaged = useCallback(
    (sourceBreakdownId: string) => stagedSourceIds.has(sourceBreakdownId),
    [stagedSourceIds],
  );
  const eligibility = useMemo<StagedCandidateEligibility>(
    () => ({
      archiveCandidateClear: authoritativeCandidates.length === 0,
      stagedSourceIds,
      isSourceStaged,
    }),
    [authoritativeCandidates.length, isSourceStaged, stagedSourceIds],
  );

  const dispatch = useCallback(
    async <TResult,>(
      kind: CandidateOperationKind,
      command: OperationInput,
      invoke: () => Promise<TResult>,
    ): Promise<CandidateCommandOutcome<TResult>> => {
      const pending: CandidateOperationProjection = {
        operationId: command.operationId,
        candidateId: command.candidateId,
        sourceBreakdownId: command.sourceBreakdownId,
        kind,
        phase: "pending",
        ...(command.resultType === undefined
          ? {}
          : { resultType: command.resultType }),
      };
      setOperations((current) => [
        ...current.filter(
          (operation) => operation.operationId !== command.operationId,
        ),
        pending,
      ]);

      try {
        const result = await invoke();
        setOperations((current) =>
          current.filter(
            (operation) => operation.operationId !== command.operationId,
          ),
        );
        return result;
      } catch {
        setOperations((current) =>
          current.map((operation) =>
            operation.operationId === command.operationId
              ? { ...operation, phase: "unknown" }
              : operation,
          ),
        );
        return { operationId: command.operationId, outcome: "unknown" };
      }
    },
    [],
  );

  const stageCandidate = useCallback(
    async (command: StageCandidateCommand) =>
      dispatch("stage", command, async () => {
        const dataStore = await getDataStore();
        return dataStore.stageCandidate(command);
      }),
    [dispatch],
  );
  const reconcileStageCandidate = useCallback(
    async (command: StageCandidateCommand) =>
      dispatch("stage", command, async () => {
        const dataStore = await getDataStore();
        return dataStore.reconcileStageCandidate(command);
      }),
    [dispatch],
  );
  const unstageCandidate = useCallback(
    async (command: UnstageCandidateCommand) =>
      dispatch("unstage", command, async () => {
        const dataStore = await getDataStore();
        return dataStore.unstageCandidate(command);
      }),
    [dispatch],
  );
  const reconcileUnstageCandidate = useCallback(
    async (command: UnstageCandidateCommand) =>
      dispatch("unstage", command, async () => {
        const dataStore = await getDataStore();
        return dataStore.reconcileUnstageCandidate(command);
      }),
    [dispatch],
  );
  const cleanupConfirmedCandidateOrphan = useCallback(
    async (command: ConfirmedCandidateOrphanCleanupCommand) =>
      dispatch("orphan_cleanup", command, async () => {
        const dataStore = await getDataStore();
        return dataStore.cleanupConfirmedCandidateOrphan(command);
      }),
    [dispatch],
  );
  const reconcileConfirmedCandidateOrphanCleanup = useCallback(
    async (command: ConfirmedCandidateOrphanCleanupCommand) =>
      dispatch("orphan_cleanup", command, async () => {
        const dataStore = await getDataStore();
        return dataStore.reconcileConfirmedCandidateOrphanCleanup(command);
      }),
    [dispatch],
  );

  return {
    candidates,
    unresolvedCandidates,
    pendingOperations,
    unknownOperations,
    counts,
    eligibility,
    stageCandidate,
    reconcileStageCandidate,
    unstageCandidate,
    reconcileUnstageCandidate,
    cleanupConfirmedCandidateOrphan,
    reconcileConfirmedCandidateOrphanCleanup,
  };
}
