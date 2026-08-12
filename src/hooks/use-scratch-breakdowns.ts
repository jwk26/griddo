"use client";

import { liveQuery } from "dexie";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getDataStore,
  type AddBreakdownCommand,
  type AddBreakdownResult,
  type DeleteBreakdownCommand,
  type DeleteBreakdownResult,
} from "@/lib/db/datastore";
import type {
  RepositoryOperationStatus,
  ScratchBreakdown,
  UnknownRepositoryOperationOutcome,
} from "@/lib/db/schema";
import type { CreatedAtSortDirection } from "@/stores/triage-preferences-store";

type BreakdownSnapshot = Readonly<{
  scratchBitId: string;
  rows: ScratchBreakdown[];
  archiveEligible: boolean;
}>;

const EMPTY_BREAKDOWNS: ScratchBreakdown[] = [];

export type BreakdownOperationProjection = Readonly<{
  kind: "add" | "delete";
  operationId: string;
  scratchBitId: string;
  breakdownId: string;
  phase: "pending" | "unknown" | "reconciling" | "terminal";
  status?: RepositoryOperationStatus;
  sourceSnapshot?: ScratchBreakdown;
}>;

export type BreakdownCommandOutcome<TResult> =
  | TResult
  | UnknownRepositoryOperationOutcome;

export function useScratchBreakdowns(
  scratchBitId: string | null,
  sort: CreatedAtSortDirection = "DESC",
): {
  breakdowns: ScratchBreakdown[];
  consumedBreakdownCount: number;
  hasObservedBreakdownHistory: boolean;
  isArchiveEligible: boolean;
  operations: BreakdownOperationProjection[];
  addBreakdown: (
    command: AddBreakdownCommand,
  ) => Promise<BreakdownCommandOutcome<AddBreakdownResult>>;
  reconcileAddBreakdown: (
    command: AddBreakdownCommand,
  ) => Promise<BreakdownCommandOutcome<AddBreakdownResult>>;
  deleteBreakdown: (
    command: DeleteBreakdownCommand,
  ) => Promise<BreakdownCommandOutcome<DeleteBreakdownResult>>;
  reconcileDeleteBreakdown: (
    command: DeleteBreakdownCommand,
  ) => Promise<BreakdownCommandOutcome<DeleteBreakdownResult>>;
} {
  const [snapshot, setSnapshot] = useState<BreakdownSnapshot | null>(null);
  const [operations, setOperations] = useState<BreakdownOperationProjection[]>([]);
  const [observedHistoryByScratch, setObservedHistoryByScratch] = useState<
    ReadonlySet<string>
  >(new Set());

  useEffect(() => {
    if (scratchBitId === null) return;

    const subscription = liveQuery(async () => {
      const dataStore = await getDataStore();
      const [rows, archiveEligibility] = await Promise.all([
        dataStore.getScratchBreakdowns(scratchBitId),
        dataStore.getScratchArchiveEligibility(scratchBitId),
      ]);
      return {
        scratchBitId,
        rows,
        archiveEligible: archiveEligibility.eligible,
      };
    }).subscribe({
      next: (nextSnapshot) => {
        if (nextSnapshot.rows.length > 0) {
          setObservedHistoryByScratch((current) => {
            if (current.has(scratchBitId)) return current;
            return new Set(current).add(scratchBitId);
          });
        }
        setSnapshot(nextSnapshot);
      },
      error: (err) => console.error("breakdowns liveQuery error:", err),
    });

    return () => subscription.unsubscribe();
  }, [scratchBitId]);

  const currentSnapshot =
    snapshot?.scratchBitId === scratchBitId ? snapshot : null;
  const currentOperations = useMemo(
    () =>
      scratchBitId === null
        ? []
        : operations.filter(
            (operation) => operation.scratchBitId === scratchBitId,
          ),
    [operations, scratchBitId],
  );
  const allRows = currentSnapshot?.rows ?? EMPTY_BREAKDOWNS;
  const authoritativeBreakdowns = useMemo(
    () =>
      allRows
        .filter((row) => row.consumedAt === null)
        .toSorted((left, right) => {
          const createdAtDifference =
            sort === "ASC"
              ? left.createdAt - right.createdAt
              : right.createdAt - left.createdAt;
          if (createdAtDifference !== 0) return createdAtDifference;

          const orderDifference = left.order - right.order;
          return orderDifference !== 0
            ? orderDifference
            : left.id.localeCompare(right.id);
        }),
    [allRows, sort],
  );
  const retainedDeleteRows = useMemo(
    () =>
      currentOperations.flatMap((operation) =>
        operation.kind === "delete" &&
        operation.phase !== "terminal" &&
        operation.sourceSnapshot !== undefined &&
        !authoritativeBreakdowns.some(
          (row) => row.id === operation.sourceSnapshot?.id,
        )
          ? [operation.sourceSnapshot]
          : [],
      ),
    [authoritativeBreakdowns, currentOperations],
  );
  const breakdowns = useMemo(
    () =>
      [...authoritativeBreakdowns, ...retainedDeleteRows].toSorted(
        (left, right) => {
          const createdAtDifference =
            sort === "ASC"
              ? left.createdAt - right.createdAt
              : right.createdAt - left.createdAt;
          if (createdAtDifference !== 0) return createdAtDifference;

          const orderDifference = left.order - right.order;
          return orderDifference !== 0
            ? orderDifference
            : left.id.localeCompare(right.id);
        },
      ),
    [authoritativeBreakdowns, retainedDeleteRows, sort],
  );
  const consumedBreakdownCount =
    allRows.length - authoritativeBreakdowns.length;

  const dispatch = useCallback(
    async <TResult,>(
      kind: BreakdownOperationProjection["kind"],
      command: AddBreakdownCommand | DeleteBreakdownCommand,
      phase: "pending" | "reconciling",
      invoke: () => Promise<TResult>,
      sourceSnapshot?: ScratchBreakdown,
    ): Promise<BreakdownCommandOutcome<TResult>> => {
      const projection: BreakdownOperationProjection = {
        kind,
        operationId: command.operationId,
        scratchBitId: command.scratchBitId,
        breakdownId: command.breakdownId,
        phase,
        ...(sourceSnapshot === undefined ? {} : { sourceSnapshot }),
      };
      setOperations((current) => {
        const previous = current.find(
          (operation) => operation.operationId === command.operationId,
        );
        const nextProjection =
          projection.sourceSnapshot === undefined &&
          previous?.sourceSnapshot !== undefined
            ? { ...projection, sourceSnapshot: previous.sourceSnapshot }
            : projection;
        return [
          ...current.filter(
            (operation) =>
              operation.operationId !== command.operationId &&
              (kind === "add"
                ? operation.kind !== "add"
                : operation.kind !== "delete" ||
                  operation.breakdownId !== command.breakdownId),
          ),
          nextProjection,
        ];
      });

      try {
        const result = await invoke();
        const status = (result as { status: RepositoryOperationStatus }).status;
        setOperations((current) =>
          current.map((operation) =>
            operation.operationId === command.operationId
              ? { ...operation, phase: "terminal", status }
              : operation,
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

  const addBreakdown = useCallback(
    (command: AddBreakdownCommand) =>
      dispatch("add", command, "pending", async () => {
        const dataStore = await getDataStore();
        return dataStore.addBreakdown(command);
      }),
    [dispatch],
  );
  const reconcileAddBreakdown = useCallback(
    (command: AddBreakdownCommand) =>
      dispatch("add", command, "reconciling", async () => {
        const dataStore = await getDataStore();
        return dataStore.reconcileAddBreakdown(command);
      }),
    [dispatch],
  );
  const deleteBreakdown = useCallback(
    (command: DeleteBreakdownCommand) =>
      dispatch("delete", command, "pending", async () => {
        const dataStore = await getDataStore();
        return dataStore.deleteBreakdown(command);
      }, authoritativeBreakdowns.find((row) => row.id === command.breakdownId)),
    [authoritativeBreakdowns, dispatch],
  );
  const reconcileDeleteBreakdown = useCallback(
    (command: DeleteBreakdownCommand) =>
      dispatch("delete", command, "reconciling", async () => {
        const dataStore = await getDataStore();
        return dataStore.reconcileDeleteBreakdown(command);
      }, authoritativeBreakdowns.find((row) => row.id === command.breakdownId)),
    [authoritativeBreakdowns, dispatch],
  );

  return {
    breakdowns,
    consumedBreakdownCount,
    hasObservedBreakdownHistory:
      scratchBitId !== null && observedHistoryByScratch.has(scratchBitId),
    isArchiveEligible: currentSnapshot?.archiveEligible ?? false,
    operations: currentOperations,
    addBreakdown,
    reconcileAddBreakdown,
    deleteBreakdown,
    reconcileDeleteBreakdown,
  };
}
