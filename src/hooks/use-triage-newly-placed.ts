"use client";

import { liveQuery } from "dexie";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TriagePlacementCommand } from "@/hooks/use-triage-placement";
import type { TriageOperationLock } from "@/hooks/use-triage-operation-lock";
import {
  getDataStore,
  type DirectPlacementUndoCommand,
  type PlacementUndoResult,
  type StagedPlacementUndoCommand,
} from "@/lib/db/datastore";
import type { RepositoryOperationStatus } from "@/lib/db/schema";
import type { ScratchBreakdown, StagedCandidate } from "@/lib/db/schema";
import type { Bit, Node } from "@/types";

export type NewlyPlacedResultType = "node" | "bit";

export type TriageNewlyPlacedProvenance = Readonly<{
  operationId: string;
  resultId: string;
  resultType: NewlyPlacedResultType;
  resultVersion: number;
  resultSnapshot: Node | Bit;
  source: Readonly<{
    scratchBitId: string;
    breakdownId: string;
    expectedVersion: number;
    snapshot: ScratchBreakdown;
  }>;
  candidate: Readonly<{
    id: string;
    expectedVersion: number;
    snapshot: StagedCandidate;
  }> | null;
  destination: Readonly<{
    parentId: string | null;
    pathIds: readonly string[];
    x: number;
    y: number;
  }>;
  completedOrder: number;
}>;

export type TriagePlacementUndoCommand =
  | DirectPlacementUndoCommand
  | StagedPlacementUndoCommand;

export type TriageNewlyPlacedUndoReason =
  | "checking"
  | "available"
  | "active-owner"
  | "placement-open"
  | "dirty-edit"
  | "result-mutated"
  | "source-mutated"
  | "candidate-mutated"
  | "dependencies"
  | "already-undone"
  | "invalid-provenance"
  | "truth-unknown";

export type TriageNewlyPlacedUndoState = Readonly<{
  phase:
    | "checking"
    | "available"
    | "blocked"
    | "pending"
    | "unknown"
    | "reconciling"
    | "terminal"
    | "success";
  reason: TriageNewlyPlacedUndoReason;
  command: TriagePlacementUndoCommand | null;
  terminalStatus: RepositoryOperationStatus | null;
}>;

type PlacementUndoInvoker = (
  command: TriagePlacementUndoCommand,
) => Promise<PlacementUndoResult>;

type PlacementUndoTruthObserver = (
  entries: readonly TriageNewlyPlacedProvenance[],
  publish: (truth: ReadonlyMap<string, PlacementUndoResult>) => void,
) => () => void;

type UseTriageNewlyPlacedUndoOptions = Readonly<{
  entries: readonly TriageNewlyPlacedProvenance[];
  operationLock: TriageOperationLock;
  placementOpen: boolean;
  hasDirtyEdit: () => boolean;
  createId?: () => string;
  observeTruth?: PlacementUndoTruthObserver;
  dispatchUndo?: PlacementUndoInvoker;
  reconcileUndo?: PlacementUndoInvoker;
}>;

type TriageNewlyPlacedRegistration = Readonly<{
  result: Node | Bit;
  command: TriagePlacementCommand;
  sourceSnapshot: ScratchBreakdown;
  candidateSnapshot: StagedCandidate | null;
}>;

function placementKey(type: NewlyPlacedResultType, id: string): string {
  return `${type}:${id}`;
}

function isStagedUndoCommand(
  command: TriagePlacementUndoCommand,
): command is StagedPlacementUndoCommand {
  return "candidateSnapshot" in command;
}

function sameFlatRecord<T extends object>(actual: T, expected: T): boolean {
  const actualRecord = actual as Record<string, unknown>;
  const expectedRecord = expected as Record<string, unknown>;
  const actualKeys = Object.keys(actualRecord);
  const expectedKeys = Object.keys(expectedRecord);
  return (
    actualKeys.length === expectedKeys.length &&
    expectedKeys.every((key) => actualRecord[key] === expectedRecord[key])
  );
}

export function createTriagePlacementUndoCommand(
  provenance: TriageNewlyPlacedProvenance,
  operationId: string,
): TriagePlacementUndoCommand {
  const base: DirectPlacementUndoCommand = {
    operationId,
    resultSnapshot: { ...provenance.resultSnapshot },
    sourceSnapshot: {
      ...provenance.source.snapshot,
      consumedAt: provenance.resultSnapshot.createdAt,
      version: provenance.source.expectedVersion + 1,
    },
  };
  return provenance.candidate === null
    ? base
    : { ...base, candidateSnapshot: { ...provenance.candidate.snapshot } };
}

function classifyUndoTruth(
  provenance: TriageNewlyPlacedProvenance,
  truth: PlacementUndoResult | undefined,
): TriageNewlyPlacedUndoReason {
  if (truth === undefined) return "checking";
  if (truth.status === "not_applied") return "available";
  if (truth.status === "applied" || truth.status === "already_applied") {
    return "already-undone";
  }
  if (truth.status === "rejected") return "invalid-provenance";
  if (truth.result === null) return "result-mutated";
  if (!sameFlatRecord(truth.result, provenance.resultSnapshot)) {
    return "result-mutated";
  }
  const expectedSource = createTriagePlacementUndoCommand(
    provenance,
    truth.operationId,
  ).sourceSnapshot;
  if (
    truth.source === null ||
    !sameFlatRecord(truth.source, expectedSource)
  ) {
    return "source-mutated";
  }
  if (truth.candidate !== null) return "candidate-mutated";
  return truth.status === "conflict" ? "dependencies" : "truth-unknown";
}

async function dispatchUndoToRepository(
  command: TriagePlacementUndoCommand,
): Promise<PlacementUndoResult> {
  const dataStore = await getDataStore();
  return isStagedUndoCommand(command)
    ? dataStore.undoStagedPlacement(command)
    : dataStore.undoDirectPlacement(command);
}

async function reconcileUndoWithRepository(
  command: TriagePlacementUndoCommand,
): Promise<PlacementUndoResult> {
  const dataStore = await getDataStore();
  return isStagedUndoCommand(command)
    ? dataStore.reconcileStagedPlacementUndo(command)
    : dataStore.reconcileDirectPlacementUndo(command);
}

function observeUndoTruth(
  entries: readonly TriageNewlyPlacedProvenance[],
  publish: (truth: ReadonlyMap<string, PlacementUndoResult>) => void,
): () => void {
  if (entries.length === 0) {
    publish(new Map());
    return () => undefined;
  }
  const subscription = liveQuery(async () => {
    const results = await Promise.all(
      entries.map(async (entry) => {
        const command = createTriagePlacementUndoCommand(
          entry,
          entry.operationId,
        );
        const result = await reconcileUndoWithRepository(command);
        return [placementKey(entry.resultType, entry.resultId), result] as const;
      }),
    );
    return new Map(results);
  }).subscribe({
    next: publish,
    error: () => publish(new Map()),
  });
  return () => subscription.unsubscribe();
}

const CHECKING_UNDO_STATE: TriageNewlyPlacedUndoState = {
  phase: "checking",
  reason: "checking",
  command: null,
  terminalStatus: null,
};

export function useTriageNewlyPlacedUndo({
  entries,
  operationLock,
  placementOpen,
  hasDirtyEdit,
  createId = () => crypto.randomUUID(),
  observeTruth = observeUndoTruth,
  dispatchUndo = dispatchUndoToRepository,
  reconcileUndo = reconcileUndoWithRepository,
}: UseTriageNewlyPlacedUndoOptions) {
  const [truth, setTruth] = useState<ReadonlyMap<string, PlacementUndoResult>>(
    new Map(),
  );
  const truthRef = useRef(truth);
  const [operations, setOperations] = useState<
    ReadonlyMap<string, TriageNewlyPlacedUndoState>
  >(new Map());
  const operationsRef = useRef(operations);
  const entriesRef = useRef(entries);
  const observeTruthRef = useRef(observeTruth);
  const entryFingerprint = entries
    .map((entry) =>
      placementKey(entry.resultType, `${entry.resultId}:${entry.operationId}`),
    )
    .join("|");

  useEffect(() => {
    entriesRef.current = entries;
    observeTruthRef.current = observeTruth;
  }, [entries, observeTruth]);

  const commitOperation = useCallback(
    (key: string, state: TriageNewlyPlacedUndoState) => {
      const next = new Map(operationsRef.current).set(key, state);
      operationsRef.current = next;
      setOperations(next);
    },
    [],
  );

  useEffect(() => {
    return observeTruthRef.current(entriesRef.current, (next) => {
      truthRef.current = next;
      setTruth(next);
      let changed = false;
      const nextOperations = new Map(operationsRef.current);
      for (const [key, operation] of nextOperations) {
        if (
          operation.phase === "terminal" &&
          next.get(key)?.status === "not_applied"
        ) {
          nextOperations.delete(key);
          changed = true;
        }
      }
      if (changed) {
        operationsRef.current = nextOperations;
        setOperations(nextOperations);
      }
    });
  }, [entryFingerprint]);

  const findEntry = useCallback((type: NewlyPlacedResultType, id: string) => {
    return (
      entriesRef.current.find(
        (entry) => entry.resultType === type && entry.resultId === id,
      ) ?? null
    );
  }, []);

  const getState = useCallback(
    (type: NewlyPlacedResultType, id: string): TriageNewlyPlacedUndoState => {
      const key = placementKey(type, id);
      const operation = operationsRef.current.get(key);
      if (operation !== undefined) return operation;
      const provenance = findEntry(type, id);
      if (provenance === null) return CHECKING_UNDO_STATE;
      if (operationLock.isLocked()) {
        return { ...CHECKING_UNDO_STATE, phase: "blocked", reason: "active-owner" };
      }
      if (placementOpen) {
        return { ...CHECKING_UNDO_STATE, phase: "blocked", reason: "placement-open" };
      }
      if (hasDirtyEdit()) {
        return { ...CHECKING_UNDO_STATE, phase: "blocked", reason: "dirty-edit" };
      }
      const reason = classifyUndoTruth(provenance, truthRef.current.get(key));
      if (reason === "checking") return CHECKING_UNDO_STATE;
      return {
        phase: reason === "available" ? "available" : "blocked",
        reason,
        command: null,
        terminalStatus: null,
      };
    },
    [findEntry, hasDirtyEdit, operationLock, placementOpen],
  );

  const applyTerminal = useCallback(
    (
      key: string,
      command: TriagePlacementUndoCommand,
      result: PlacementUndoResult,
    ): boolean => {
      operationLock.release(command.operationId, result.status);
      commitOperation(key, {
        phase:
          result.status === "applied" || result.status === "already_applied"
            ? "success"
            : "terminal",
        reason:
          result.status === "applied" || result.status === "already_applied"
            ? "already-undone"
            : "truth-unknown",
        command,
        terminalStatus: result.status,
      });
      return result.status === "applied" || result.status === "already_applied";
    },
    [commitOperation, operationLock],
  );

  const activate = useCallback(
    async (type: NewlyPlacedResultType, id: string): Promise<boolean> => {
      const key = placementKey(type, id);
      const provenance = findEntry(type, id);
      if (provenance === null || getState(type, id).reason !== "available") {
        return false;
      }
      const command = createTriagePlacementUndoCommand(provenance, createId());
      if (!operationLock.acquire("undo", command.operationId)) return false;
      const pending: TriageNewlyPlacedUndoState = {
        phase: "pending",
        reason: "available",
        command,
        terminalStatus: null,
      };
      commitOperation(key, pending);
      try {
        const result = await dispatchUndo(command);
        return applyTerminal(key, command, result);
      } catch {
        commitOperation(key, { ...pending, phase: "unknown" });
        return false;
      }
    },
    [applyTerminal, commitOperation, createId, dispatchUndo, findEntry, getState, operationLock],
  );

  const reconcile = useCallback(
    async (type: NewlyPlacedResultType, id: string): Promise<boolean> => {
      const key = placementKey(type, id);
      const current = operationsRef.current.get(key);
      if (current?.phase !== "unknown" || current.command === null) return false;
      const reconciling = { ...current, phase: "reconciling" } as const;
      commitOperation(key, reconciling);
      try {
        const result = await reconcileUndo(current.command);
        return applyTerminal(key, current.command, result);
      } catch {
        commitOperation(key, { ...reconciling, phase: "unknown" });
        return false;
      }
    },
    [applyTerminal, commitOperation, reconcileUndo],
  );

  return { truth, operations, getState, activate, reconcile } as const;
}

export function isTriageNewlyPlaced(
  entries: readonly TriageNewlyPlacedProvenance[],
  type: NewlyPlacedResultType,
  id: string,
): boolean {
  return entries.some(
    (entry) => entry.resultType === type && entry.resultId === id,
  );
}

export function projectTriageNewlyPlaced<T extends Node | Bit>(
  entries: readonly TriageNewlyPlacedProvenance[],
  type: NewlyPlacedResultType,
  records: readonly T[],
): T[] {
  const orderById = new Map(
    entries
      .filter((entry) => entry.resultType === type)
      .map((entry) => [entry.resultId, entry.completedOrder]),
  );
  const newlyPlaced: T[] = [];
  const ordinary: T[] = [];
  for (const record of records) {
    if (orderById.has(record.id)) newlyPlaced.push(record);
    else ordinary.push(record);
  }
  newlyPlaced.sort(
    (left, right) => orderById.get(right.id)! - orderById.get(left.id)!,
  );
  return [...newlyPlaced, ...ordinary];
}

export function useTriageNewlyPlaced() {
  const [entries, setEntries] = useState<readonly TriageNewlyPlacedProvenance[]>([]);
  const entriesRef = useRef(entries);
  const completedOrderRef = useRef(0);

  const registerPlacement = useCallback(
    ({
      result,
      command,
      sourceSnapshot,
      candidateSnapshot,
    }: TriageNewlyPlacedRegistration): boolean => {
      if (result.id !== command.resultId) return false;
      if (
        sourceSnapshot.id !== command.sourceBreakdownId ||
        sourceSnapshot.scratchBitId !== command.scratchBitId ||
        sourceSnapshot.version !== command.sourceExpectedVersion ||
        sourceSnapshot.consumedAt !== null
      ) {
        return false;
      }
      if (
        "candidateId" in command
          ? candidateSnapshot === null ||
            candidateSnapshot.id !== command.candidateId ||
            candidateSnapshot.sourceBreakdownId !== command.sourceBreakdownId ||
            candidateSnapshot.scratchBitId !== command.scratchBitId ||
            candidateSnapshot.resultType !== command.resultType ||
            candidateSnapshot.version !== command.candidateExpectedVersion ||
            candidateSnapshot.lifecycle !== "staged"
          : candidateSnapshot !== null
      ) {
        return false;
      }
      const key = placementKey(command.resultType, result.id);
      if (
        entriesRef.current.some(
          (entry) =>
            entry.operationId === command.operationId ||
            placementKey(entry.resultType, entry.resultId) === key,
        )
      ) {
        return false;
      }

      completedOrderRef.current += 1;
      const provenance: TriageNewlyPlacedProvenance = {
        operationId: command.operationId,
        resultId: result.id,
        resultType: command.resultType,
        resultVersion: result.version,
        resultSnapshot: { ...result },
        source: {
          scratchBitId: command.scratchBitId,
          breakdownId: command.sourceBreakdownId,
          expectedVersion: command.sourceExpectedVersion,
          snapshot: { ...sourceSnapshot },
        },
        candidate:
          "candidateId" in command
            ? {
                id: command.candidateId,
                expectedVersion: command.candidateExpectedVersion,
                snapshot: { ...candidateSnapshot! },
              }
            : null,
        destination: {
          parentId: command.targetParentId,
          pathIds: [...command.expectedAncestorIds],
          x: command.x,
          y: command.y,
        },
        completedOrder: completedOrderRef.current,
      };
      const next = [provenance, ...entriesRef.current];
      entriesRef.current = next;
      setEntries(next);
      return true;
    },
    [],
  );

  const getProvenance = useCallback(
    (type: NewlyPlacedResultType, id: string) =>
      entriesRef.current.find(
        (entry) => entry.resultType === type && entry.resultId === id,
      ) ?? null,
    [],
  );

  const isNewlyPlaced = useCallback(
    (type: NewlyPlacedResultType, id: string) =>
      isTriageNewlyPlaced(entriesRef.current, type, id),
    [],
  );

  const project = useCallback(
    <T extends Node | Bit>(type: NewlyPlacedResultType, records: readonly T[]) =>
      projectTriageNewlyPlaced(entriesRef.current, type, records),
    [],
  );

  return {
    entries,
    registerPlacement,
    getProvenance,
    isNewlyPlaced,
    project,
  } as const;
}
