"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  ArrowDownUp,
  CheckCircle2,
  GripVertical,
  Inbox,
  Lightbulb,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useInbox } from "@/hooks/use-inbox";
import { useScratchBreakdowns } from "@/hooks/use-scratch-breakdowns";
import { useStagedCandidates } from "@/hooks/use-staged-candidates";
import { useTriageOperationLockContext } from "@/hooks/use-triage-operation-lock";
import { INBOX_TRIAGE_COPY } from "@/lib/copy/inbox-triage";
import type {
  AddBreakdownCommand,
  DeleteBreakdownCommand,
} from "@/lib/db/datastore";
import type {
  RepositoryOperationStatus,
  ScratchBreakdown,
} from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { useTriagePreferencesStore } from "@/stores/triage-preferences-store";
import { useTriageStore } from "@/stores/triage-store";

function BreakdownRow({
  row,
  isStaged,
  isOperationLocked,
  onDelete,
  onRowRef,
}: {
  row: ScratchBreakdown;
  isStaged: boolean;
  isOperationLocked: boolean;
  onDelete: (id: string) => void;
  onRowRef: (id: string, element: HTMLDivElement | null) => void;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
  } = useDraggable({
    id: `triage-breakdown:${row.id}`,
    data: { kind: "triage-breakdown", id: row.id, label: row.content },
    disabled: isStaged,
  });
  const isMuted = isStaged || isDragging;
  const gripColorClass =
    isStaged && !isDragging
      ? "text-muted-foreground/20"
      : isMuted
        ? "text-muted-foreground"
        : "text-muted-foreground/45";

  return (
    <div
      ref={(element) => {
        setNodeRef(element);
        onRowRef(row.id, element);
      }}
      data-testid="breakdown-row"
      data-triage-role={isStaged ? "breakdown-staged-row" : "breakdown-active-row"}
      data-triage-state={isStaged ? "staged" : "active"}
      role="listitem"
      className={cn(
        "group flex min-h-12 items-center gap-2 border-b border-border/30 py-2 transition-[background-color,border-color,color,opacity] last:border-b-0 motion-reduce:transition-none",
        isStaged && !isDragging && "opacity-50 transition-opacity duration-200",
        isDragging &&
          "opacity-30 border border-dashed border-muted bg-transparent",
      )}
    >
      <button
        ref={setActivatorNodeRef}
        aria-label="Drag breakdown"
        disabled={isStaged || isOperationLocked}
        className={cn(
          "mt-0.5 flex h-7 w-7 flex-shrink-0 cursor-grab items-center justify-center rounded-md border border-transparent text-muted-foreground/60 hover:border-border hover:bg-muted hover:text-foreground active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        )}
        type="button"
        {...attributes}
        {...listeners}
      >
        <GripVertical
          aria-hidden="true"
          className={cn("h-4 w-4 transition-colors", gripColorClass)}
          data-testid="breakdown-grip"
        />
      </button>
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "whitespace-pre-wrap break-words text-sm leading-5 transition-colors",
            isMuted ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {row.content}
        </div>
      </div>
      <button
        aria-label={INBOX_TRIAGE_COPY.baseActions.edit}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        data-triage-role="breakdown-row-action"
        disabled
        title={INBOX_TRIAGE_COPY.baseActions.edit}
        type="button"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <button
        aria-label={INBOX_TRIAGE_COPY.baseActions.delete}
        className={cn(
          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isDragging && "text-muted-foreground",
        )}
        data-triage-role="breakdown-row-action"
        disabled={isStaged || isOperationLocked}
        title={INBOX_TRIAGE_COPY.baseActions.delete}
        type="button"
        onClick={() => onDelete(row.id)}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

function formatScratchTimestamp(createdAt: number): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(createdAt);
}

export function BreakdownPanel() {
  const operationLock = useTriageOperationLockContext();
  const selectedScratchId = useTriageStore((state) => state.selectedScratchId);
  const scratchPoolExpanded = useTriageStore(
    (state) => state.scratchPoolExpanded,
  );
  const scratchPoolManualExpandedForId = useTriageStore(
    (state) => state.scratchPoolManualExpandedForId,
  );
  const setScratchPoolExpanded = useTriageStore(
    (state) => state.setScratchPoolExpanded,
  );
  const breakdownCreatedAtSort = useTriagePreferencesStore(
    (state) => state.breakdownCreatedAtSort,
  );
  const setBreakdownCreatedAtSort = useTriagePreferencesStore(
    (state) => state.setBreakdownCreatedAtSort,
  );
  const { activeScratchBits } = useInbox();
  const {
    breakdowns,
    consumedBreakdownCount,
    hasObservedBreakdownHistory,
    isArchiveEligible,
    addBreakdown,
    deleteBreakdown,
  } = useScratchBreakdowns(
    selectedScratchId,
    breakdownCreatedAtSort,
  );
  const { counts: stagedCandidateCounts, eligibility: stagedEligibility } =
    useStagedCandidates(selectedScratchId);
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const addEntryRef = useRef<HTMLInputElement | HTMLDivElement | null>(null);
  const contextRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const pendingAddedRowIdRef = useRef<string | null>(null);
  const pendingDeleteFocusRef = useRef<{
    deletedId: string;
    nextId: string | null;
    previousId: string | null;
  } | null>(null);
  const failedDeleteFocusIdRef = useRef<string | null>(null);
  const isComposingRef = useRef(false);
  const [pendingDelete, setPendingDelete] = useState<{
    scratchBitId: string;
    breakdownId: string;
  } | null>(null);
  if (
    pendingDelete !== null &&
    pendingDelete.scratchBitId !== selectedScratchId
  ) {
    setPendingDelete(null);
  }
  const pendingDeleteId =
    pendingDelete?.scratchBitId === selectedScratchId
      ? pendingDelete.breakdownId
      : null;
  const selectedScratch =
    activeScratchBits.find((bit) => bit.id === selectedScratchId) ?? null;
  const isConsumedCompletion =
    selectedScratch !== null &&
    isArchiveEligible &&
    breakdowns.length === 0;
  const emptyState = isConsumedCompletion
    ? "consumed-completion"
    : consumedBreakdownCount > 0 || stagedCandidateCounts.authoritative > 0
      ? "ordinary"
      : hasObservedBreakdownHistory
        ? "all-deleted"
        : "never-used";

  useEffect(() => {
    if (!isAdding) return;
    inputRef.current?.focus();
  }, [isAdding]);

  useEffect(() => {
    const addedRowId = pendingAddedRowIdRef.current;
    if (addedRowId === null) return;
    const row = rowRefs.current.get(addedRowId);
    if (row === undefined) return;

    pendingAddedRowIdRef.current = null;
    row.scrollIntoView({
      block: breakdownCreatedAtSort === "DESC" ? "start" : "end",
    });
  }, [breakdownCreatedAtSort, breakdowns, newContent]);

  useEffect(() => {
    const focusTarget = pendingDeleteFocusRef.current;
    if (
      focusTarget === null ||
      breakdowns.some((row) => row.id === focusTarget.deletedId)
    ) {
      return;
    }

    pendingDeleteFocusRef.current = null;
    const nextRow =
      focusTarget.nextId === null
        ? undefined
        : rowRefs.current.get(focusTarget.nextId);
    const previousRow =
      focusTarget.previousId === null
        ? undefined
        : rowRefs.current.get(focusTarget.previousId);
    const rowAction = (nextRow ?? previousRow)?.querySelector<HTMLButtonElement>(
      'button[aria-label="Delete"]',
    );

    if (rowAction !== undefined && rowAction !== null) {
      rowAction.focus();
    } else if (isConsumedCompletion) {
      contextRef.current?.focus();
    } else {
      addEntryRef.current?.focus();
    }
  }, [breakdowns, isConsumedCompletion, pendingDeleteId]);

  useEffect(() => {
    if (pendingDeleteId !== null || failedDeleteFocusIdRef.current === null) return;
    const failedRowId = failedDeleteFocusIdRef.current;
    failedDeleteFocusIdRef.current = null;
    rowRefs.current
      .get(failedRowId)
      ?.querySelector<HTMLButtonElement>('button[aria-label="Delete"]')
      ?.focus();
  }, [pendingDeleteId]);

  function collapsePoolIfArmed() {
    if (
      selectedScratchId !== null &&
      scratchPoolExpanded === true &&
      scratchPoolManualExpandedForId !== selectedScratchId
    ) {
      setScratchPoolExpanded(false);
    }
  }

  async function handleAdd({
    keepInputOpen = false,
  }: { keepInputOpen?: boolean } = {}): Promise<void> {
    const trimmed = newContent.trim();
    if (!trimmed) {
      if (!keepInputOpen) {
        setIsAdding(false);
        setNewContent("");
      }
      return;
    }

    if (selectedScratch === null) return;
    const command: AddBreakdownCommand = {
      operationId: crypto.randomUUID(),
      breakdownId: crypto.randomUUID(),
      scratchBitId: selectedScratch.id,
      scratchExpectedVersion: selectedScratch.version,
      content: trimmed,
    };
    if (!operationLock.acquire("add", command.operationId)) return;

    const outcome = await addBreakdown(command);
    if ("outcome" in outcome) return;

    operationLock.release(command.operationId, outcome.status);
    if (isConfirmedSuccess(outcome.status)) {
      pendingAddedRowIdRef.current = command.breakdownId;
      setNewContent("");
      if (keepInputOpen) {
        setIsAdding(true);
        inputRef.current?.focus();
      } else {
        setIsAdding(false);
      }
    }
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      if (isComposingRef.current || event.nativeEvent.isComposing) return;
      event.preventDefault();
      void handleAdd({ keepInputOpen: true });
      return;
    }

    if (event.key === "Escape") {
      if (operationLock.isLocked()) return;
      setIsAdding(false);
      setNewContent("");
      return;
    }

    // First-keystroke collapse: printable single characters only, no modifiers, not composing
    if (
      event.key.length === 1 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !isComposingRef.current &&
      !event.nativeEvent.isComposing
    ) {
      collapsePoolIfArmed();
    }
  }

  function handlePlaceholderKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (operationLock.isLocked()) return;
    setIsAdding(true);
  }

  async function handleConfirmDelete(): Promise<void> {
    if (pendingDeleteId === null || selectedScratch === null) return;
    const rowIndex = breakdowns.findIndex((row) => row.id === pendingDeleteId);
    const row = breakdowns[rowIndex];
    if (row === undefined) return;
    const command: DeleteBreakdownCommand = {
      operationId: crypto.randomUUID(),
      breakdownId: row.id,
      expectedVersion: row.version,
      scratchBitId: selectedScratch.id,
      scratchExpectedVersion: selectedScratch.version,
    };
    if (!operationLock.acquire("delete", command.operationId)) return;

    const outcome = await deleteBreakdown(command);
    if ("outcome" in outcome) return;

    operationLock.release(command.operationId, outcome.status);
    if (isConfirmedSuccess(outcome.status)) {
      pendingDeleteFocusRef.current = {
        deletedId: row.id,
        nextId: breakdowns[rowIndex + 1]?.id ?? null,
        previousId: breakdowns[rowIndex - 1]?.id ?? null,
      };
    } else {
      failedDeleteFocusIdRef.current = row.id;
    }
    setPendingDelete(null);
  }

  if (selectedScratchId === null) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex min-h-0 flex-1 items-center justify-center px-4 text-center text-sm text-muted-foreground">
          Select a Scratch to view breakdowns
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        <div
          ref={contextRef}
          aria-label={`Selected Scratch: ${selectedScratch?.title ?? "Unknown Scratch"}`}
          className="mt-2 flex min-h-[104px] min-w-0 items-center gap-3 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card px-4 py-4 shadow-sm"
          data-testid="selected-scratch-context"
          data-triage-role="context-signature-plate"
          data-triage-state="working"
          tabIndex={-1}
        >
          <Inbox
            aria-hidden="true"
            className="h-5 w-5 flex-shrink-0 text-primary/70"
          />
          <div className="min-w-0 flex-1">
            <div
              className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              data-triage-role="context-eyebrow-meta"
            >
              Selected Scratch
            </div>
            <div
              className="mt-1 whitespace-pre-wrap break-words text-lg font-semibold text-foreground"
              data-triage-role="context-title"
            >
              {selectedScratch?.title ?? "Unknown Scratch"}
            </div>
            {selectedScratch !== null && (
              <div className="mt-1 text-xs tabular-nums text-muted-foreground">
                {formatScratchTimestamp(selectedScratch.createdAt)}
              </div>
            )}
          </div>
          <div className="flex flex-shrink-0 items-center gap-2" data-triage-role="context-action-cluster">
            <Button
              disabled
              size="sm"
              type="button"
              variant="outline"
            >
              <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
              {INBOX_TRIAGE_COPY.baseActions.edit}
            </Button>
            <Button
              aria-label={
                breakdownCreatedAtSort === "DESC"
                  ? INBOX_TRIAGE_COPY.baseActions.sortNewestFirst
                  : INBOX_TRIAGE_COPY.baseActions.sortOldestFirst
              }
              data-triage-role="context-sort-control"
              size="sm"
              type="button"
              variant="outline"
              onClick={() =>
                setBreakdownCreatedAtSort(
                  breakdownCreatedAtSort === "DESC" ? "ASC" : "DESC",
                )
              }
            >
              <ArrowDownUp aria-hidden="true" className="h-3.5 w-3.5" />
              {breakdownCreatedAtSort}
            </Button>
          </div>
        </div>

        {breakdowns.length > 0 ? (
          <div className="mt-2" role="list">
            {breakdowns.map((row) => (
              <BreakdownRow
                key={row.id}
                isStaged={stagedEligibility.stagedSourceIds.has(row.id)}
                isOperationLocked={operationLock.activeOperation !== null}
                row={row}
                onDelete={(breakdownId) =>
                  setPendingDelete({
                    scratchBitId: selectedScratchId,
                    breakdownId,
                  })
                }
                onRowRef={(id, element) => {
                  if (element === null) rowRefs.current.delete(id);
                  else rowRefs.current.set(id, element);
                }}
              />
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "mt-3 flex min-h-24 flex-col items-center justify-center rounded-xl border px-4 py-5 text-center",
              isConsumedCompletion
                ? "border-primary/25 bg-primary/5"
                : "border-dashed border-border bg-muted/20",
            )}
            data-testid="breakdown-empty-state"
            data-triage-role={
              isConsumedCompletion
                ? "breakdown-consumed-completion"
                : "breakdown-ordinary-empty"
            }
            data-triage-state={emptyState}
          >
            {isConsumedCompletion ? (
              <CheckCircle2 aria-hidden="true" className="h-6 w-6 text-primary/70" />
            ) : emptyState === "all-deleted" ? (
              <RotateCcw aria-hidden="true" className="h-6 w-6 text-muted-foreground/55" />
            ) : (
              <Lightbulb aria-hidden="true" className="h-6 w-6 text-muted-foreground/55" />
            )}
            <span className="mt-2 text-xs font-medium text-muted-foreground">
              {isConsumedCompletion ? "All items processed" : "Add a note..."}
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-border px-3 py-2">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          {isAdding ? (
            <input
              ref={(element) => {
                inputRef.current = element;
                addEntryRef.current = element;
              }}
              className="block h-8 w-full appearance-none rounded-md border border-border bg-background px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
              data-triage-role="breakdown-add-field"
              maxLength={500}
              onChange={(event) => setNewContent(event.target.value)}
              onCompositionEnd={() => {
                isComposingRef.current = false;
              }}
              onCompositionStart={() => {
                isComposingRef.current = true;
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Add a note..."
              readOnly={operationLock.activeOperation !== null}
              type="text"
              value={newContent}
            />
          ) : (
            <div
              ref={(element) => {
                addEntryRef.current = element;
              }}
              className="flex h-8 cursor-text items-center rounded-md border border-transparent px-2 text-sm text-muted-foreground hover:border-border hover:bg-accent/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-triage-role="breakdown-add-field"
              role="button"
              tabIndex={0}
              onClick={() => {
                if (operationLock.activeOperation === null) setIsAdding(true);
              }}
              onKeyDown={handlePlaceholderKeyDown}
            >
              Add a note...
            </div>
          )}
          <Button
            data-triage-role="breakdown-add-control"
            disabled={
              operationLock.activeOperation !== null ||
              !isAdding ||
              newContent.trim().length === 0
            }
            size="sm"
            type="button"
            onClick={() => void handleAdd({ keepInputOpen: true })}
          >
            {INBOX_TRIAGE_COPY.baseActions.add}
          </Button>
        </div>
      </div>

      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open && !operationLock.isLocked()) {
            setPendingDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete breakdown?</AlertDialogTitle>
            <AlertDialogDescription>
              This note will be removed from the selected Scratch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={operationLock.activeOperation !== null}
              onClick={() => {
                if (!operationLock.isLocked()) {
                  setPendingDelete(null);
                }
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={operationLock.activeOperation !== null}
              variant="destructive"
              onClick={() => void handleConfirmDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function isConfirmedSuccess(status: RepositoryOperationStatus): boolean {
  return status === "applied" || status === "already_applied";
}
