"use client";

import { liveQuery } from "dexie";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  phase: "pending" | "unknown" | "reconciling";
  resultType?: StagedCandidate["resultType"];
}>;

export type CandidateCommandOutcome<TResult> =
  | TResult
  | UnknownRepositoryOperationOutcome;

export type CandidateIntegrityProjection = Readonly<{
  candidate: StagedCandidate;
  status: "source-unresolved";
  reason:
    | "subscription-miss"
    | "source-owner-mismatch"
    | "source-consumed";
}>;

export type CandidateIntegrityNotDispatched = Readonly<{
  outcome: "not_dispatched";
  reason:
    | "proof_not_confirmed"
    | "identity_mismatch"
    | "reconciliation_required"
    | "terminal_no_retry";
}>;

type CandidateIntegrityCommandOutcome =
  | CandidateCommandOutcome<ConfirmedCandidateOrphanCleanupResult>
  | CandidateIntegrityNotDispatched;

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
  isReady: boolean;
  candidates: StagedCandidateProjection[];
  unresolvedCandidates: StagedCandidate[];
  integrityCandidates: CandidateIntegrityProjection[];
  pendingOperations: CandidateOperationProjection[];
  unknownOperations: CandidateOperationProjection[];
  reconcilingOperations: CandidateOperationProjection[];
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
  ) => Promise<CandidateIntegrityCommandOutcome>;
  reconcileConfirmedCandidateOrphanCleanup: (
    command: ConfirmedCandidateOrphanCleanupCommand,
  ) => Promise<CandidateIntegrityCommandOutcome>;
}>;

const EMPTY_CANDIDATES: StagedCandidate[] = [];
const EMPTY_SOURCES: ScratchBreakdown[] = [];

export function useStagedCandidates(
  scratchBitId: string | null,
): UseStagedCandidatesResult {
  const [snapshot, setSnapshot] = useState<CandidateSnapshot | null>(null);
  const [operations, setOperations] = useState<CandidateOperationProjection[]>([]);
  const confirmedOrphanCommandsRef = useRef(
    new Map<string, ConfirmedCandidateOrphanCleanupCommand>(),
  );
  const terminalConfirmedOrphanOperationsRef = useRef(new Set<string>());

  useEffect(() => {
    // Operation projections belong only to the currently selected Scratch.
    setOperations([]);
    confirmedOrphanCommandsRef.current.clear();
    terminalConfirmedOrphanOperationsRef.current.clear();

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
  const isReady = scratchBitId !== null && currentSnapshot !== null;
  const authoritativeCandidates =
    currentSnapshot?.candidates ?? EMPTY_CANDIDATES;
  const sources = currentSnapshot?.sources ?? EMPTY_SOURCES;

  const { candidates, integrityCandidates, unresolvedCandidates } = useMemo(() => {
    const sourcesById = new Map(sources.map((source) => [source.id, source]));
    const joined: StagedCandidateProjection[] = [];
    const integrity: CandidateIntegrityProjection[] = [];

    for (const candidate of authoritativeCandidates) {
      const source = sourcesById.get(candidate.sourceBreakdownId);
      if (!source) {
        integrity.push({
          candidate,
          status: "source-unresolved",
          reason: "subscription-miss",
        });
        continue;
      }
      if (source.scratchBitId !== candidate.scratchBitId) {
        integrity.push({
          candidate,
          status: "source-unresolved",
          reason: "source-owner-mismatch",
        });
        continue;
      }
      if (source.consumedAt !== null) {
        integrity.push({
          candidate,
          status: "source-unresolved",
          reason: "source-consumed",
        });
        continue;
      }
      joined.push({ ...candidate, source, content: source.content });
    }

    return {
      candidates: joined,
      integrityCandidates: integrity,
      unresolvedCandidates: integrity.map(({ candidate }) => candidate),
    };
  }, [authoritativeCandidates, sources]);

  const pendingOperations = useMemo(
    () => operations.filter((operation) => operation.phase === "pending"),
    [operations],
  );
  const unknownOperations = useMemo(
    () => operations.filter((operation) => operation.phase === "unknown"),
    [operations],
  );
  const reconcilingOperations = useMemo(
    () => operations.filter((operation) => operation.phase === "reconciling"),
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
      phase: CandidateOperationProjection["phase"] = "pending",
    ): Promise<CandidateCommandOutcome<TResult>> => {
      const pending: CandidateOperationProjection = {
        operationId: command.operationId,
        candidateId: command.candidateId,
        sourceBreakdownId: command.sourceBreakdownId,
        kind,
        phase,
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
      }, "reconciling"),
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
      }, "reconciling"),
    [dispatch],
  );
  const cleanupConfirmedCandidateOrphan = useCallback(
    async (
      command: ConfirmedCandidateOrphanCleanupCommand,
    ): Promise<CandidateIntegrityCommandOutcome> => {
      if (command.proof.status !== "confirmed") {
        return {
          outcome: "not_dispatched",
          reason: "proof_not_confirmed",
        };
      }
      const existingCommand = confirmedOrphanCommandsRef.current.get(
        command.operationId,
      );
      if (existingCommand !== undefined) {
        return {
          outcome: "not_dispatched",
          reason: !isSameConfirmedOrphanCommand(existingCommand, command)
            ? "identity_mismatch"
            : terminalConfirmedOrphanOperationsRef.current.has(
                  command.operationId,
                )
              ? "terminal_no_retry"
              : "reconciliation_required",
        };
      }
      const integrityCandidate = integrityCandidates.find(
        ({ candidate }) => candidate.id === command.candidateId,
      )?.candidate;
      if (
        integrityCandidate === undefined ||
        command.proof.sourceBreakdownId !== command.sourceBreakdownId ||
        integrityCandidate.version !== command.candidateExpectedVersion ||
        integrityCandidate.sourceBreakdownId !== command.sourceBreakdownId ||
        integrityCandidate.scratchBitId !== command.scratchBitId ||
        integrityCandidate.resultType !== command.resultType ||
        integrityCandidate.lifecycle !== "staged"
      ) {
        return { outcome: "not_dispatched", reason: "identity_mismatch" };
      }

      confirmedOrphanCommandsRef.current.set(command.operationId, command);
      const outcome = await dispatch("orphan_cleanup", command, async () => {
        const dataStore = await getDataStore();
        return dataStore.cleanupConfirmedCandidateOrphan(command);
      });
      if (!("outcome" in outcome) && outcome.status === "not_applied") {
        confirmedOrphanCommandsRef.current.delete(command.operationId);
      } else if (!("outcome" in outcome)) {
        terminalConfirmedOrphanOperationsRef.current.add(command.operationId);
      }
      return outcome;
    },
    [dispatch, integrityCandidates],
  );
  const reconcileConfirmedCandidateOrphanCleanup = useCallback(
    async (
      command: ConfirmedCandidateOrphanCleanupCommand,
    ): Promise<CandidateIntegrityCommandOutcome> => {
      const approvedCommand = confirmedOrphanCommandsRef.current.get(
        command.operationId,
      );
      if (
        (approvedCommand !== undefined &&
          !isSameConfirmedOrphanCommand(approvedCommand, command)) ||
        (approvedCommand === undefined &&
          (command.scratchBitId !== scratchBitId ||
            !isSelfConsistentConfirmedOrphanCommand(command)))
      ) {
        return { outcome: "not_dispatched", reason: "identity_mismatch" };
      }
      if (
        terminalConfirmedOrphanOperationsRef.current.has(command.operationId)
      ) {
        return { outcome: "not_dispatched", reason: "terminal_no_retry" };
      }

      confirmedOrphanCommandsRef.current.set(command.operationId, command);
      const outcome = await dispatch("orphan_cleanup", command, async () => {
        const dataStore = await getDataStore();
        return dataStore.reconcileConfirmedCandidateOrphanCleanup(command);
      }, "reconciling");
      if (!("outcome" in outcome) && outcome.status === "not_applied") {
        confirmedOrphanCommandsRef.current.delete(command.operationId);
      } else if (!("outcome" in outcome)) {
        terminalConfirmedOrphanOperationsRef.current.add(command.operationId);
      }
      return outcome;
    },
    [dispatch, scratchBitId],
  );

  return {
    isReady,
    candidates,
    unresolvedCandidates,
    integrityCandidates,
    pendingOperations,
    unknownOperations,
    reconcilingOperations,
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

function isSameConfirmedOrphanCommand(
  left: ConfirmedCandidateOrphanCleanupCommand,
  right: ConfirmedCandidateOrphanCleanupCommand,
): boolean {
  return (
    left.operationId === right.operationId &&
    left.auditEventId === right.auditEventId &&
    left.candidateId === right.candidateId &&
    left.candidateExpectedVersion === right.candidateExpectedVersion &&
    left.sourceBreakdownId === right.sourceBreakdownId &&
    left.scratchBitId === right.scratchBitId &&
    left.resultType === right.resultType &&
    left.proof.status === "confirmed" &&
    right.proof.status === "confirmed" &&
    left.proof.cause === right.proof.cause &&
    left.proof.sourceBreakdownId === right.proof.sourceBreakdownId
  );
}

function isSelfConsistentConfirmedOrphanCommand(
  command: ConfirmedCandidateOrphanCleanupCommand,
): boolean {
  return (
    command.proof.status === "confirmed" &&
    command.proof.sourceBreakdownId === command.sourceBreakdownId
  );
}
