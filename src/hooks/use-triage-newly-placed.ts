"use client";

import { useCallback, useRef, useState } from "react";
import type { TriagePlacementCommand } from "@/hooks/use-triage-placement";
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

type TriageNewlyPlacedRegistration = Readonly<{
  result: Node | Bit;
  command: TriagePlacementCommand;
  sourceSnapshot: ScratchBreakdown;
  candidateSnapshot: StagedCandidate | null;
}>;

function placementKey(type: NewlyPlacedResultType, id: string): string {
  return `${type}:${id}`;
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
