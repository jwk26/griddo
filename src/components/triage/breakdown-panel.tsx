"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
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
import { invalidateTriageDragSource } from "@/hooks/use-dnd";
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
import {
  useScratchBreakdowns,
  useScratchTitleBlockerContext,
  type BreakdownOperationProjection,
  type ConditionalEditor,
  type ConditionalEditorSnapshot,
} from "@/hooks/use-scratch-breakdowns";
import { useStagedCandidates } from "@/hooks/use-staged-candidates";
import { useTriageDepartureContext } from "@/hooks/use-triage-departure";
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

type OpenEditorSnapshot = NonNullable<ConditionalEditorSnapshot>;

const SCRATCH_TITLE_INLINE_LIMIT = 60;
const BREAKDOWN_CONTENT_INLINE_LIMIT = 120;

function subscribeToBrowserConnectivity(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function getBrowserOnlineSnapshot() {
  return navigator.onLine;
}

function InlineEditor({
  contentAfter,
  contentBefore,
  contentClassName,
  contentRole,
  contentTestId,
  editor,
  onSave,
  onUseMine,
  snapshot,
  actionRole,
  actionTestId,
}: {
  contentAfter?: ReactNode;
  contentBefore?: ReactNode;
  contentClassName: string;
  contentRole: string;
  contentTestId: string;
  editor: ConditionalEditor;
  onSave: () => Promise<boolean>;
  onUseMine: () => Promise<boolean>;
  snapshot: OpenEditorSnapshot;
  actionRole: string;
  actionTestId: string;
}) {
  const copy = INBOX_TRIAGE_COPY.inlineEditor;
  const isScratchTitle = snapshot.target.kind === "scratch-title";
  const surface = isScratchTitle ? "scratch-title" : "breakdown-content";
  const surfaceRole = isScratchTitle
    ? "context-inline-editor"
    : "breakdown-inline-editor";
  const fieldLabel = isScratchTitle ? "Scratch title" : "Breakdown content";
  const validationCopy = isScratchTitle
    ? INBOX_TRIAGE_COPY.validation.scratchTitleRequired
    : INBOX_TRIAGE_COPY.validation.breakdownContentRequired;
  const fieldId = useId();
  const statusId = `${fieldId}-status`;
  const fieldRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);
  const latestVersionRef = useRef(snapshot.latest?.version ?? null);
  const [copyStatus, setCopyStatus] = useState("");
  const [latestStatus, setLatestStatus] = useState("");
  const isBrowserOnline = useSyncExternalStore(
    subscribeToBrowserConnectivity,
    getBrowserOnlineSnapshot,
    () => true,
  );

  useEffect(() => {
    const field = fieldRef.current;
    if (field === null || snapshot.phase === "invalidated") return;
    if (snapshot.focusIntent !== "field" && snapshot.focusIntent !== "field-end") {
      return;
    }
    field.focus();
    if (snapshot.focusIntent === "field-end") {
      const end = field.value.length;
      field.setSelectionRange(end, end);
    }
  }, [snapshot.focusIntent, snapshot.phase, snapshot.target.id]);

  useEffect(() => {
    const nextVersion = snapshot.latest?.version ?? null;
    if (
      latestVersionRef.current !== null &&
      nextVersion !== null &&
      latestVersionRef.current !== nextVersion
    ) {
      setLatestStatus(copy.conflict.latestUpdated);
    }
    latestVersionRef.current = nextVersion;
  }, [copy.conflict.latestUpdated, snapshot.latest?.version]);

  const statusCopy =
    snapshot.phase === "validation"
      ? validationCopy
      : snapshot.phase === "not_applied"
        ? copy.status.notApplied
        : snapshot.phase === "saving" && snapshot.pendingIntent
          ? copy.status.savingBeforeContinuing
          : snapshot.phase === "pristine" ||
              snapshot.phase === "dirty" ||
              snapshot.phase === "saving" ||
              snapshot.phase === "offline" ||
              snapshot.phase === "reconciling"
            ? copy.status[snapshot.phase]
            : snapshot.phase === "conflict"
              ? copy.conflict.heading
              : copy.recovery.heading;

  function handleFieldBlur(
    event: FocusEvent<HTMLInputElement>,
  ) {
    if (isComposingRef.current) return;
    const nextTarget = event.relatedTarget;
    const sourceSurface = event.currentTarget.closest(
      '[data-triage-layout="fixed-inline-editor"]',
    );
    if (nextTarget instanceof Node && sourceSurface?.contains(nextTarget)) {
      return;
    }
    if (
      nextTarget instanceof HTMLElement &&
      (nextTarget.getAttribute("aria-label") === "Toggle theme" ||
        nextTarget.getAttribute("aria-label") === "Change color theme" ||
        (nextTarget.matches('button[aria-pressed]') &&
          nextTarget.closest('[role="dialog"]') !== null))
    ) {
      return;
    }
    if (
      snapshot.phase !== "saving" &&
      snapshot.phase !== "reconciling" &&
      snapshot.phase !== "conflict"
    ) {
      void onSave();
    }
  }

  function handleFieldKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (isComposingRef.current || event.nativeEvent.isComposing) return;

    if (event.key === "Enter") {
      event.preventDefault();
      void onSave();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      editor.cancel();
    }
  }

  async function copyDraft() {
    const draft = snapshot.copyableDraft ?? snapshot.draft;
    try {
      await navigator.clipboard.writeText(draft);
      setCopyStatus(copy.recovery.copied);
    } catch {
      setCopyStatus("");
    }
  }

  const commonFieldProps = {
    "aria-describedby":
      snapshot.phase === "pristine" || snapshot.phase === "dirty"
        ? undefined
        : statusId,
    "aria-invalid": snapshot.phase === "validation" || undefined,
    "aria-label": fieldLabel,
    className: "triage-inline-editor__field",
    "data-triage-role": "inline-editor-field",
    id: fieldId,
    onBlur: handleFieldBlur,
    maxLength: isScratchTitle
      ? SCRATCH_TITLE_INLINE_LIMIT
      : BREAKDOWN_CONTENT_INLINE_LIMIT,
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      editor.changeDraft(event.target.value),
    onCompositionEnd: () => {
      isComposingRef.current = false;
    },
    onCompositionStart: () => {
      isComposingRef.current = true;
    },
    onKeyDown: handleFieldKeyDown,
    readOnly:
      snapshot.phase === "saving" || snapshot.phase === "reconciling",
    value: snapshot.draft,
  };
  const isIssuePhase =
    snapshot.phase === "offline" ||
    snapshot.phase === "not_applied" ||
    snapshot.phase === "conflict" ||
    snapshot.phase === "invalidated";

  return (
    <>
      <div
        className={contentClassName}
        data-testid={contentTestId}
        data-triage-block-slot="stretch"
        data-triage-role={contentRole}
      >
        <div
          className="triage-inline-editor__content-layer"
          data-testid="inline-editor-content-layer"
          data-triage-obscured={isIssuePhase ? "true" : "false"}
        >
          {contentBefore}
          <div
            className="triage-inline-editor"
            data-triage-editor-state={snapshot.phase.replace("_", "-")}
            data-triage-editor-surface={surface}
            data-triage-role={surfaceRole}
          >
            {snapshot.phase === "invalidated" ? (
              <p data-triage-role="inline-editor-protected-draft">
                {snapshot.copyableDraft ?? snapshot.draft}
              </p>
            ) : (
              <>
                <label className="sr-only" htmlFor={fieldId}>
                  {fieldLabel}
                </label>
                <input ref={fieldRef} type="text" {...commonFieldProps} />
              </>
            )}
            {snapshot.phase === "validation" ? (
              <span
                id={statusId}
                aria-live="polite"
                className="triage-inline-editor__required"
                data-triage-role="inline-editor-required"
              >
                {validationCopy}
              </span>
            ) : (snapshot.phase === "saving" ||
                snapshot.phase === "reconciling") ? (
              <div
                id={statusId}
                aria-atomic="true"
                aria-live="polite"
                className="sr-only"
                data-triage-role="inline-editor-announcement"
              >
                {statusCopy}
              </div>
            ) : null}
          </div>
          {contentAfter}
        </div>
      </div>
      <div
        className="triage-fixed-action-slot"
        data-testid={actionTestId}
        data-triage-block-slot="stretch"
        data-triage-role={actionRole}
      >
        {!isIssuePhase && (
          <div
            className="triage-inline-editor__actions"
            data-triage-role="inline-editor-actions"
          >
            {(snapshot.phase === "pristine" ||
              snapshot.phase === "dirty" ||
              snapshot.phase === "validation") && (
              <>
                <Button
                  className={cn(
                    snapshot.phase === "dirty" &&
                      "hover:bg-destructive/10",
                  )}
                  data-triage-contrast={
                    snapshot.phase === "dirty" ? "adaptive" : undefined
                  }
                  data-triage-emphasis={
                    snapshot.phase === "dirty" ? "destructive" : undefined
                  }
                  disabled={snapshot.phase !== "dirty"}
                  size="xs"
                  type="button"
                  variant="ghost"
                  onClick={() => void onSave()}
                >
                  {INBOX_TRIAGE_COPY.baseActions.save}
                </Button>
                <Button
                  data-triage-treatment="text"
                  size="xs"
                  type="button"
                  variant="ghost"
                  onClick={() => editor.cancel()}
                >
                  {INBOX_TRIAGE_COPY.baseActions.cancel}
                </Button>
              </>
            )}
            {snapshot.phase === "saving" && (
              <>
                <span data-triage-role="inline-editor-progress">
                  {snapshot.pendingIntent
                    ? copy.status.savingBeforeContinuing
                    : copy.status.saving}
                </span>
                {snapshot.pendingIntent && (
                  <Button
                    size="xs"
                    type="button"
                    variant="outline"
                    onClick={editor.stayHere}
                  >
                    {copy.actions.stayHere}
                  </Button>
                )}
              </>
            )}
            {snapshot.phase === "reconciling" && (
              <>
                <span data-triage-role="inline-editor-progress">
                  {copy.status.reconciling}
                </span>
                {snapshot.pendingIntent && (
                  <Button
                    size="xs"
                    type="button"
                    variant="outline"
                    onClick={editor.stayHere}
                  >
                    {copy.actions.stayHere}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {isIssuePhase && (
        <div
          className="triage-inline-editor__issue-overlay"
          data-testid="inline-editor-issue-overlay"
          data-triage-role="inline-editor-issue-overlay"
        >
          <span
            id={statusId}
            aria-atomic="true"
            aria-live="polite"
            data-triage-role="inline-editor-issue-status"
          >
            {statusCopy}
            {latestStatus && <span> {latestStatus}</span>}
            {copyStatus && (
              <span data-triage-role="inline-editor-copy-status">
                {" "}
                {copyStatus}
              </span>
            )}
          </span>
          <div data-triage-role="inline-editor-issue-actions">
            {(snapshot.phase === "offline" ||
              snapshot.phase === "not_applied") && (
              <>
                <Button
                  disabled={
                    snapshot.phase === "offline" && !isBrowserOnline
                  }
                  size="xs"
                  type="button"
                  onClick={() => void onSave()}
                >
                  {copy.actions.retrySave}
                </Button>
                <Button
                  size="xs"
                  type="button"
                  variant="outline"
                  onClick={() => editor.cancel()}
                >
                  {INBOX_TRIAGE_COPY.baseActions.cancel}
                </Button>
              </>
            )}
            {snapshot.phase === "conflict" && (
              <>
                <Button size="xs" type="button" onClick={() => void onUseMine()}>
                  {copy.conflict.useMine}
                </Button>
                <Button
                  size="xs"
                  type="button"
                  variant="outline"
                  onClick={editor.useLatest}
                >
                  {copy.conflict.useLatest}
                </Button>
                <Button
                  size="xs"
                  type="button"
                  variant="ghost"
                  onClick={() => void copyDraft()}
                >
                  {copy.conflict.copyDraft}
                </Button>
              </>
            )}
            {snapshot.phase === "invalidated" && (
              <>
                <Button size="xs" type="button" onClick={() => void copyDraft()}>
                  {copy.conflict.copyDraft}
                </Button>
                <Button
                  size="xs"
                  type="button"
                  variant="outline"
                  onClick={() => editor.cancel()}
                >
                  {copy.recovery.close}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

type ReliabilityState =
  | "pending"
  | "unknown"
  | "reconciling"
  | "not-applied"
  | "rejected"
  | "conflict";

function getReliabilityState(
  operation: BreakdownOperationProjection | null,
): ReliabilityState | null {
  if (operation === null) return null;
  if (operation.phase !== "terminal") return operation.phase;
  if (operation.status === "not_applied") return "not-applied";
  if (operation.status === "rejected" || operation.status === "conflict") {
    return operation.status;
  }
  return null;
}

function ReliabilityLine({
  action,
  actionRef,
  copy,
  isReconciling,
  onAction,
  surface,
  state,
}: {
  action: string | null;
  actionRef?: (element: HTMLButtonElement | null) => void;
  copy: string;
  isReconciling: boolean;
  onAction?: () => void;
  surface: "add" | "delete";
  state: ReliabilityState;
}) {
  return (
    <div
      className={cn(
        "breakdown-reliability",
        surface === "add"
          ? "breakdown-add-reliability"
          : "breakdown-delete-reliability",
      )}
      data-triage-role="breakdown-reliability"
    >
      <span
        aria-atomic="true"
        aria-live="polite"
        className="breakdown-reliability__status"
        data-triage-reliability-state={state}
        role="status"
      >
        {copy}
      </span>
      {action !== null ? (
        <Button
          ref={actionRef}
          aria-disabled={isReconciling ? "true" : undefined}
          className="breakdown-reliability__action"
          data-triage-role="breakdown-reliability-action"
          size="xs"
          type="button"
          variant={
            action === INBOX_TRIAGE_COPY.reliability.actions.retryAdd
              ? "default"
              : "ghost"
          }
          onClick={() => {
            if (!isReconciling) onAction?.();
          }}
        >
          {action}
        </Button>
      ) : null}
    </div>
  );
}

function BreakdownRow({
  row,
  isStaged,
  isOperationLocked,
  editor,
  onEdit,
  onDelete,
  onEditRef,
  onSave,
  onUseMine,
  onRowRef,
  deleteOperation,
  onDeleteReliabilityActionRef,
  onReconcileDelete,
}: {
  row: ScratchBreakdown;
  isStaged: boolean;
  isOperationLocked: boolean;
  editor: ConditionalEditor;
  onEdit: (row: ScratchBreakdown, isStaged: boolean) => void;
  onDelete: (id: string) => void;
  onEditRef: (id: string, element: HTMLButtonElement | null) => void;
  onSave: () => Promise<boolean>;
  onUseMine: () => Promise<boolean>;
  onRowRef: (id: string, element: HTMLDivElement | null) => void;
  deleteOperation: BreakdownOperationProjection | null;
  onDeleteReliabilityActionRef: (
    id: string,
    element: HTMLButtonElement | null,
  ) => void;
  onReconcileDelete: (operationId: string) => void;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
  } = useDraggable({
    id: `triage-breakdown:${row.id}`,
    data: {
      kind: "triage-breakdown",
      id: row.id,
      label: row.content,
      scratchId: row.scratchBitId,
      sourceBreakdownId: row.id,
      sourceVersion: row.version,
      sourceLifecycle: "active",
    },
    disabled: isStaged,
  });
  useEffect(
    () => () =>
      invalidateTriageDragSource({
        kind: "triage-breakdown",
        id: row.id,
        label: row.content,
        scratchId: row.scratchBitId,
        sourceBreakdownId: row.id,
        sourceVersion: row.version,
        sourceLifecycle: "active",
      }),
    [isStaged, row.content, row.id, row.scratchBitId, row.version],
  );
  const isMuted = isStaged || isDragging;
  const gripColorClass =
    isStaged && !isDragging
      ? "text-muted-foreground/20"
      : isMuted
        ? "text-muted-foreground"
        : "text-muted-foreground/45";
  const editorSnapshot =
    editor.snapshot?.target.kind === "breakdown" &&
    editor.snapshot.target.id === row.id
      ? editor.snapshot
      : null;
  const deleteReliabilityState = getReliabilityState(deleteOperation);
  const deleteReliabilityCopy =
    deleteReliabilityState === null
      ? null
      : INBOX_TRIAGE_COPY.reliability.delete[
          deleteReliabilityState === "not-applied"
            ? "notApplied"
            : deleteReliabilityState
        ];
  const deleteReliabilityAction =
    deleteReliabilityState === null || deleteReliabilityState === "pending"
      ? null
      : INBOX_TRIAGE_COPY.reliability.actions.checkAgain;
  const isDeleteInFlight =
    deleteOperation !== null && deleteOperation.phase !== "terminal";

  return (
    <div
      ref={(element) => {
        setNodeRef(element);
        onRowRef(row.id, element);
      }}
      data-testid="breakdown-row"
      data-triage-layout="fixed-inline-editor"
      data-triage-role={isStaged ? "breakdown-staged-row" : "breakdown-active-row"}
      data-triage-state={isStaged ? "staged" : "active"}
      data-triage-reliability-state={deleteReliabilityState ?? undefined}
      data-triage-reliability-surface={
        deleteReliabilityState === null ? undefined : "delete"
      }
      role="listitem"
      className={cn(
        "group triage-fixed-breakdown-row border-b border-border/30 transition-[background-color,border-color,color,opacity] last:border-b-0 motion-reduce:transition-none",
        deleteReliabilityState !== null && "triage-fixed-breakdown-row--reliability",
        isStaged && !isDragging && "opacity-50 transition-opacity duration-200",
        isDragging &&
          "opacity-30 border border-dashed border-muted bg-transparent",
      )}
    >
      <div
        className="triage-fixed-breakdown-row__drag"
        data-testid="breakdown-drag-slot"
        data-triage-block-slot="stretch"
        data-triage-role="breakdown-drag-slot"
      >
        <button
          ref={setActivatorNodeRef}
          aria-label="Drag breakdown"
          data-source-version={row.version}
          data-triage-drag-source="breakdown-grip"
          disabled={isStaged || isOperationLocked || isDeleteInFlight}
          className={cn(
            "flex h-7 w-7 flex-shrink-0 cursor-grab items-center justify-center rounded-md border border-transparent text-muted-foreground/60 hover:border-border hover:bg-muted hover:text-foreground active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
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
      </div>
      {editorSnapshot !== null ? (
        <InlineEditor
          actionRole="breakdown-action-slot"
          actionTestId="breakdown-action-slot"
          contentClassName="triage-fixed-breakdown-row__content"
          contentRole="breakdown-content-slot"
          contentTestId="breakdown-content-slot"
          editor={editor}
          onSave={onSave}
          onUseMine={onUseMine}
          snapshot={editorSnapshot}
        />
      ) : (
        <>
          <div
            className="triage-fixed-breakdown-row__content"
            data-testid="breakdown-content-slot"
            data-triage-block-slot="stretch"
            data-triage-role="breakdown-content-slot"
          >
            <div
              className={cn(
                "text-sm leading-5 transition-colors",
                isMuted ? "text-muted-foreground" : "text-foreground",
              )}
              data-triage-role="breakdown-view-text"
            >
              {row.content}
            </div>
          </div>
          <div
            className="triage-fixed-action-slot"
            data-testid="breakdown-action-slot"
            data-triage-block-slot="stretch"
            data-triage-role="breakdown-action-slot"
          >
            <button
              ref={(element) => onEditRef(row.id, element)}
              aria-label={INBOX_TRIAGE_COPY.baseActions.edit}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              data-triage-role="breakdown-row-action"
              disabled={
                isStaged ||
                isOperationLocked ||
                isDeleteInFlight ||
                editor.snapshot !== null
              }
              title={INBOX_TRIAGE_COPY.baseActions.edit}
              type="button"
              onClick={() => onEdit(row, isStaged)}
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
              disabled={
                isStaged ||
                isOperationLocked ||
                isDeleteInFlight ||
                editor.snapshot !== null
              }
              title={INBOX_TRIAGE_COPY.baseActions.delete}
              type="button"
              onClick={() => onDelete(row.id)}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </>
      )}
      {deleteReliabilityState !== null && deleteReliabilityCopy !== null ? (
        <ReliabilityLine
          action={deleteReliabilityAction}
          actionRef={(element) =>
            onDeleteReliabilityActionRef(row.id, element)
          }
          copy={deleteReliabilityCopy}
          isReconciling={deleteReliabilityState === "reconciling"}
          state={deleteReliabilityState}
          surface="delete"
          onAction={() => {
            if (deleteOperation !== null) {
              onReconcileDelete(deleteOperation.operationId);
            }
          }}
        />
      ) : null}
    </div>
  );
}

function InvalidatedBreakdownRecoveryRow({
  editor,
  onSave,
  onUseMine,
  snapshot,
}: {
  editor: ConditionalEditor;
  onSave: () => Promise<boolean>;
  onUseMine: () => Promise<boolean>;
  snapshot: OpenEditorSnapshot;
}) {
  return (
    <div
      className="group triage-fixed-breakdown-row border-b border-border/30 last:border-b-0"
      data-testid="breakdown-row"
      data-triage-layout="fixed-inline-editor"
      data-triage-role="breakdown-active-row"
      data-triage-state="invalidated"
      role="listitem"
    >
      <div
        className="triage-fixed-breakdown-row__drag"
        data-testid="breakdown-drag-slot"
        data-triage-block-slot="stretch"
        data-triage-role="breakdown-drag-slot"
      >
        <button
          aria-label="Drag breakdown"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground/20"
          disabled
          type="button"
        >
          <GripVertical aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
      <InlineEditor
        actionRole="breakdown-action-slot"
        actionTestId="breakdown-action-slot"
        contentClassName="triage-fixed-breakdown-row__content"
        contentRole="breakdown-content-slot"
        contentTestId="breakdown-content-slot"
        editor={editor}
        onSave={onSave}
        onUseMine={onUseMine}
        snapshot={snapshot}
      />
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
  const departure = useTriageDepartureContext();
  const { registerAddDraftOwner, setAddDraft } = departure;
  const isDepartureDecision = departure.pendingDestination !== null;
  const departureHeadingId = useId();
  const departureDescriptionId = `${departureHeadingId}-departure-description`;
  const departureContinueRef = useRef<HTMLButtonElement>(null);
  const departureDiscardRef = useRef<HTMLButtonElement>(null);
  const departureSheetRef = useRef<HTMLDivElement>(null);
  const lastDepartureActionRef = useRef<HTMLButtonElement | null>(null);
  const isResolvingDepartureRef = useRef(false);
  const restoreAddFocusAfterDecisionRef = useRef(false);
  const titleBlockerHandle = useScratchTitleBlockerContext();
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
    operations,
    editor,
    addBreakdown,
    reconcileAddBreakdown,
    deleteBreakdown,
    reconcileDeleteBreakdown,
  } = useScratchBreakdowns(
    selectedScratchId,
    breakdownCreatedAtSort,
    { operationLock, titleBlockerHandle },
  );
  const { counts: stagedCandidateCounts, eligibility: stagedEligibility } =
    useStagedCandidates(selectedScratchId);
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const addEntryRef = useRef<HTMLInputElement | HTMLDivElement | null>(null);
  const addCommandRef = useRef<AddBreakdownCommand | null>(null);
  const deleteCommandRefs = useRef(new Map<string, DeleteBreakdownCommand>());
  const addReliabilityActionRef = useRef<HTMLButtonElement>(null);
  const deleteReliabilityActionRefs = useRef(
    new Map<string, HTMLButtonElement>(),
  );
  const contextRef = useRef<HTMLDivElement>(null);
  const contextEditRef = useRef<HTMLButtonElement>(null);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const rowEditRefs = useRef(new Map<string, HTMLButtonElement>());
  const lastEditorTargetRef = useRef<OpenEditorSnapshot["target"] | null>(null);
  const [invalidatedRowPosition, setInvalidatedRowPosition] = useState<{
    id: string;
    index: number;
  } | null>(null);
  const [editorAnnouncement, setEditorAnnouncement] = useState("");
  const pendingAddedRowIdRef = useRef<string | null>(null);
  const pendingDeleteFocusRef = useRef<{
    deletedId: string;
    nextId: string | null;
    previousId: string | null;
  } | null>(null);
  const failedDeleteFocusIdRef = useRef<string | null>(null);
  const pendingReliabilityFocusRef = useRef<
    | { target: "add-input" | "add-action" }
    | { target: "delete-action" | "delete-trash"; rowId: string }
    | null
  >(null);
  const [reliabilityFocusRevision, setReliabilityFocusRevision] = useState(0);
  const [hiddenReliabilityOperationIds, setHiddenReliabilityOperationIds] =
    useState<ReadonlySet<string>>(() => new Set());
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
  const rawAddOperation =
    operations.find((operation) => operation.kind === "add") ?? null;
  const addOperation =
    rawAddOperation !== null &&
    hiddenReliabilityOperationIds.has(rawAddOperation.operationId)
      ? null
      : rawAddOperation;
  const addReliabilityState = getReliabilityState(addOperation);
  const addReliabilityCopy =
    addReliabilityState === null
      ? null
      : INBOX_TRIAGE_COPY.reliability.add[
          addReliabilityState === "not-applied"
            ? "notApplied"
            : addReliabilityState
        ];
  const addReliabilityAction =
    addReliabilityState === "unknown" ||
    addReliabilityState === "reconciling"
      ? INBOX_TRIAGE_COPY.reliability.actions.checkAgain
      : addReliabilityState === "not-applied"
        ? INBOX_TRIAGE_COPY.reliability.actions.retryAdd
        : null;
  const deleteOperationsByBreakdownId = new Map(
    operations
      .filter(
        (operation) =>
          operation.kind === "delete" &&
          !hiddenReliabilityOperationIds.has(operation.operationId),
      )
      .map((operation) => [operation.breakdownId, operation] as const),
  );

  useEffect(
    () =>
      registerAddDraftOwner({
        clearDraft: () => {
          setAddDraft("");
          setNewContent("");
        },
        focusDraft: () => inputRef.current?.focus(),
      }),
    [registerAddDraftOwner, setAddDraft],
  );

  const reliabilityScopeRef = useRef({
    scratchBitId: selectedScratchId,
    operationIds: operations.map((operation) => operation.operationId),
  });
  useLayoutEffect(() => {
    const previousScope = reliabilityScopeRef.current;
    if (previousScope.scratchBitId !== selectedScratchId) {
      setHiddenReliabilityOperationIds((current) => {
        const next = new Set(current);
        for (const operationId of previousScope.operationIds) {
          next.add(operationId);
        }
        return next;
      });
      addCommandRef.current = null;
      deleteCommandRefs.current.clear();
    }
    reliabilityScopeRef.current = {
      scratchBitId: selectedScratchId,
      operationIds: operations.map((operation) => operation.operationId),
    };
  }, [operations, selectedScratchId]);

  useLayoutEffect(() => {
    const focusIntent = pendingReliabilityFocusRef.current;
    if (focusIntent === null) return;
    pendingReliabilityFocusRef.current = null;
    if (focusIntent.target === "add-input") {
      inputRef.current?.focus();
    } else if (focusIntent.target === "add-action") {
      addReliabilityActionRef.current?.focus();
    } else if (focusIntent.target === "delete-action") {
      deleteReliabilityActionRefs.current.get(focusIntent.rowId)?.focus();
    } else if ("rowId" in focusIntent) {
      rowRefs.current
        .get(focusIntent.rowId)
        ?.querySelector<HTMLButtonElement>('button[aria-label="Delete"]')
        ?.focus();
    }
  }, [operations, reliabilityFocusRevision]);

  function requestReliabilityFocus(
    intent: NonNullable<typeof pendingReliabilityFocusRef.current>,
  ) {
    pendingReliabilityFocusRef.current = intent;
    setReliabilityFocusRevision((current) => current + 1);
  }

  function hideReliabilityOperation(operationId: string) {
    setHiddenReliabilityOperationIds((current) => {
      if (current.has(operationId)) return current;
      const next = new Set(current);
      next.add(operationId);
      return next;
    });
  }

  useLayoutEffect(() => {
    if (isDepartureDecision) {
      lastDepartureActionRef.current = departureContinueRef.current;
      departureContinueRef.current?.focus();
      const containDepartureFocus = (event: globalThis.FocusEvent) => {
        if (
          isResolvingDepartureRef.current ||
          !(event.target instanceof Node) ||
          departureSheetRef.current?.contains(event.target)
        ) {
          return;
        }
        lastDepartureActionRef.current?.focus();
      };
      document.addEventListener("focusin", containDepartureFocus);
      return () => {
        document.removeEventListener("focusin", containDepartureFocus);
      };
    }

    isResolvingDepartureRef.current = false;
    lastDepartureActionRef.current = null;
    if (restoreAddFocusAfterDecisionRef.current) {
      restoreAddFocusAfterDecisionRef.current = false;
      inputRef.current?.focus();
    }
  }, [isDepartureDecision]);

  function continueWriting() {
    isResolvingDepartureRef.current = true;
    if (departure.continueWriting()) {
      restoreAddFocusAfterDecisionRef.current = true;
    } else {
      isResolvingDepartureRef.current = false;
    }
  }

  function discardAndMove() {
    isResolvingDepartureRef.current = true;
    if (!departure.discardAndMove()) {
      isResolvingDepartureRef.current = false;
    }
  }

  function handleDepartureKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      continueWriting();
      return;
    }
    if (event.key !== "Tab") return;

    if (event.shiftKey && document.activeElement === departureContinueRef.current) {
      event.preventDefault();
      departureDiscardRef.current?.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === departureDiscardRef.current
    ) {
      event.preventDefault();
      departureContinueRef.current?.focus();
    }
  }

  function updateAddDraft(draft: string) {
    if (
      rawAddOperation?.phase === "terminal" &&
      getReliabilityState(rawAddOperation) !== null &&
      draft !== newContent
    ) {
      hideReliabilityOperation(rawAddOperation.operationId);
    }
    setAddDraft(draft);
    setNewContent(draft);
  }

  async function handleEditorSave(): Promise<boolean> {
    const snapshot = editor.snapshot;
    const changed = snapshot !== null && snapshot.draft !== snapshot.base.value;
    const applied = await editor.save();
    if (applied && changed) {
      setEditorAnnouncement(INBOX_TRIAGE_COPY.inlineEditor.status.saved);
    }
    return applied;
  }

  async function handleEditorUseMine(): Promise<boolean> {
    const applied = await editor.useMine();
    if (applied) {
      setEditorAnnouncement(INBOX_TRIAGE_COPY.inlineEditor.status.saved);
    }
    return applied;
  }

  function handleOpenScratchTitle() {
    if (selectedScratch === null || !editor.openScratchTitle(selectedScratch)) return;
    setEditorAnnouncement("");
  }

  function handleOpenBreakdown(row: ScratchBreakdown, isStaged: boolean) {
    if (!editor.openBreakdown(row, isStaged)) return;
    const deleteOperation = operations.find(
      (operation) =>
        operation.kind === "delete" && operation.breakdownId === row.id,
    );
    if (
      deleteOperation?.phase === "terminal" &&
      getReliabilityState(deleteOperation) !== null
    ) {
      hideReliabilityOperation(deleteOperation.operationId);
    }
    setInvalidatedRowPosition({
      id: row.id,
      index: breakdowns.findIndex((candidate) => candidate.id === row.id),
    });
    setEditorAnnouncement("");
  }

  useEffect(() => {
    if (editor.snapshot !== null) {
      lastEditorTargetRef.current = editor.snapshot.target;
      return;
    }
    const lastTarget = lastEditorTargetRef.current;
    if (lastTarget === null) return;
    if (editor.focusIntent === "edit-trigger") {
      if (lastTarget.kind === "scratch-title") contextEditRef.current?.focus();
      else rowEditRefs.current.get(lastTarget.id)?.focus();
    } else if (editor.focusIntent === "active-scratch-fallback") {
      if (lastTarget.kind === "scratch-title") contextRef.current?.focus();
      else {
        const rowIndex = breakdowns.findIndex((row) => row.id === lastTarget.id);
        const nextRow = breakdowns[rowIndex + 1] ?? breakdowns[rowIndex - 1];
        if (nextRow !== undefined) rowEditRefs.current.get(nextRow.id)?.focus();
        else addEntryRef.current?.focus();
      }
    }
    lastEditorTargetRef.current = null;
  }, [breakdowns, editor.focusIntent, editor.snapshot]);

  useEffect(() => {
    const editorSnapshot = editor.snapshot;
    if (editorSnapshot === null || editorSnapshot.phase === "invalidated") return;
    if (
      editorSnapshot.target.kind === "scratch-title" &&
      editorSnapshot.target.id !== selectedScratch?.id
    ) {
      editor.invalidate();
      return;
    }
    if (
      editorSnapshot.target.kind === "breakdown" &&
      (!breakdowns.some((row) => row.id === editorSnapshot.target.id) ||
        stagedEligibility.stagedSourceIds.has(editorSnapshot.target.id))
    ) {
      editor.invalidate();
    }
  }, [breakdowns, editor, selectedScratch?.id, stagedEligibility.stagedSourceIds]);
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

  async function finishAddCommand(
    command: AddBreakdownCommand,
    outcome: Awaited<ReturnType<typeof addBreakdown>>,
    keepInputOpen: boolean,
  ): Promise<void> {
    if ("outcome" in outcome) return;

    operationLock.release(command.operationId, outcome.status);
    if (isConfirmedSuccess(outcome.status)) {
      addCommandRef.current = null;
      pendingAddedRowIdRef.current = command.breakdownId;
      updateAddDraft("");
      if (keepInputOpen) {
        setIsAdding(true);
        requestReliabilityFocus({ target: "add-input" });
      } else {
        setIsAdding(false);
      }
    } else if (outcome.status === "not_applied") {
      requestReliabilityFocus({ target: "add-action" });
    } else {
      requestReliabilityFocus({ target: "add-input" });
    }
  }

  async function dispatchAddCommand(
    command: AddBreakdownCommand,
    keepInputOpen: boolean,
  ): Promise<void> {
    addCommandRef.current = command;
    const outcome = await addBreakdown(command);
    await finishAddCommand(command, outcome, keepInputOpen);
  }

  async function handleAdd({
    keepInputOpen = false,
  }: { keepInputOpen?: boolean } = {}): Promise<void> {
    const trimmed = newContent.trim();
    if (!trimmed) {
      if (!keepInputOpen) {
        setIsAdding(false);
        updateAddDraft("");
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
    await dispatchAddCommand(command, keepInputOpen);
  }

  async function handleReconcileAdd(): Promise<void> {
    const command = addCommandRef.current;
    if (
      command === null ||
      addOperation === null ||
      command.operationId !== addOperation.operationId ||
      addOperation.phase === "reconciling"
    ) {
      return;
    }
    const activeOperation = operationLock.activeOperation;
    if (activeOperation === null) {
      if (!operationLock.acquire("add", command.operationId)) return;
    } else if (activeOperation.operationId !== command.operationId) return;

    addReliabilityActionRef.current?.focus();
    const outcome = await reconcileAddBreakdown(command);
    await finishAddCommand(command, outcome, true);
  }

  async function handleRetryAdd(): Promise<void> {
    const command = addCommandRef.current;
    if (
      command === null ||
      addOperation?.operationId !== command.operationId ||
      addOperation.phase !== "terminal" ||
      addOperation.status !== "not_applied"
    ) {
      return;
    }
    inputRef.current?.focus();
    if (!operationLock.acquire("add", command.operationId)) return;
    await dispatchAddCommand(command, true);
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
      updateAddDraft("");
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
    deleteCommandRefs.current.set(command.operationId, command);
    setPendingDelete(null);
    requestReliabilityFocus({ target: "delete-trash", rowId: row.id });
    const outcome = await deleteBreakdown(command);
    await finishDeleteCommand(command, outcome, {
      deletedId: row.id,
      nextId: breakdowns[rowIndex + 1]?.id ?? null,
      previousId: breakdowns[rowIndex - 1]?.id ?? null,
    });
  }

  async function finishDeleteCommand(
    command: DeleteBreakdownCommand,
    outcome: Awaited<ReturnType<typeof deleteBreakdown>>,
    focusTarget: NonNullable<typeof pendingDeleteFocusRef.current>,
  ): Promise<void> {
    if ("outcome" in outcome) {
      requestReliabilityFocus({
        target: "delete-action",
        rowId: command.breakdownId,
      });
      return;
    }

    operationLock.release(command.operationId, outcome.status);
    if (isConfirmedSuccess(outcome.status)) {
      deleteCommandRefs.current.delete(command.operationId);
      pendingDeleteFocusRef.current = {
        deletedId: focusTarget.deletedId,
        nextId: focusTarget.nextId,
        previousId: focusTarget.previousId,
      };
    } else {
      failedDeleteFocusIdRef.current = command.breakdownId;
      requestReliabilityFocus({
        target: "delete-trash",
        rowId: command.breakdownId,
      });
    }
  }

  async function handleReconcileDelete(operationId: string): Promise<void> {
    const command = deleteCommandRefs.current.get(operationId);
    const operation = operations.find(
      (candidate) =>
        candidate.kind === "delete" && candidate.operationId === operationId,
    );
    if (
      command === undefined ||
      operation === undefined ||
      operation.phase === "reconciling"
    ) {
      return;
    }
    const activeOperation = operationLock.activeOperation;
    if (activeOperation === null) {
      if (!operationLock.acquire("delete", command.operationId)) return;
    } else if (activeOperation.operationId !== command.operationId) return;

    deleteReliabilityActionRefs.current
      .get(command.breakdownId)
      ?.focus();
    const rowIndex = breakdowns.findIndex(
      (row) => row.id === command.breakdownId,
    );
    const focusTarget = {
      deletedId: command.breakdownId,
      nextId: breakdowns[rowIndex + 1]?.id ?? null,
      previousId: breakdowns[rowIndex - 1]?.id ?? null,
    };
    const outcome = await reconcileDeleteBreakdown(command);
    await finishDeleteCommand(command, outcome, focusTarget);
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

  const missingInvalidatedBreakdown =
    editor.snapshot?.phase === "invalidated" &&
    editor.snapshot.target.kind === "breakdown" &&
    !breakdowns.some((row) => row.id === editor.snapshot?.target.id)
      ? editor.snapshot
      : null;
  const invalidatedInsertIndex =
    missingInvalidatedBreakdown === null
      ? -1
      : Math.min(
          invalidatedRowPosition?.id === missingInvalidatedBreakdown.target.id
            ? invalidatedRowPosition.index
            : breakdowns.length,
          breakdowns.length,
        );
  const breakdownRenderItems: Array<
    | { kind: "row"; row: ScratchBreakdown }
    | { kind: "recovery"; snapshot: OpenEditorSnapshot }
  > = breakdowns.map((row) => ({ kind: "row", row }));
  if (missingInvalidatedBreakdown !== null) {
    breakdownRenderItems.splice(invalidatedInsertIndex, 0, {
      kind: "recovery",
      snapshot: missingInvalidatedBreakdown,
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div aria-atomic="true" aria-live="polite" className="sr-only">
        {editorAnnouncement}
      </div>
      <div
        className="min-h-0 flex-1 overflow-y-auto px-3 py-2"
        data-testid="breakdown-content-region"
        inert={isDepartureDecision ? true : undefined}
      >
        <div
          ref={contextRef}
          aria-label={`Selected Scratch: ${selectedScratch?.title ?? "Unknown Scratch"}`}
          className="triage-fixed-context mt-2 min-h-[104px] min-w-0 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card px-4 py-4 shadow-sm"
          data-testid="selected-scratch-context"
          data-triage-layout="fixed-inline-editor"
          data-triage-role="context-signature-plate"
          data-triage-state="working"
          tabIndex={-1}
        >
          <Inbox
            aria-hidden="true"
            className="h-5 w-5 flex-shrink-0 text-primary/70"
          />
          {editor.snapshot?.target.kind === "scratch-title" ? (
            <InlineEditor
              actionRole="context-action-slot"
              actionTestId="context-action-slot"
              contentBefore={
                <div
                  className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                  data-triage-role="context-eyebrow-meta"
                >
                  Selected Scratch
                </div>
              }
              contentAfter={
                selectedScratch !== null ? (
                  <div className="mt-1 text-xs tabular-nums text-muted-foreground">
                    {formatScratchTimestamp(selectedScratch.createdAt)}
                  </div>
                ) : null
              }
              contentClassName="triage-fixed-context__content"
              contentRole="context-content-slot"
              contentTestId="context-content-slot"
              editor={editor}
              onSave={handleEditorSave}
              onUseMine={handleEditorUseMine}
              snapshot={editor.snapshot}
            />
          ) : (
            <>
              <div
                className="triage-fixed-context__content"
                data-testid="context-content-slot"
                data-triage-block-slot="stretch"
                data-triage-role="context-content-slot"
              >
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
              <div
                className="triage-fixed-action-slot"
                data-testid="context-action-slot"
                data-triage-block-slot="stretch"
                data-triage-role="context-action-slot"
              >
                <div className="flex items-center gap-2" data-triage-role="context-action-cluster">
                  <Button
                    ref={contextEditRef}
                    disabled={
                      selectedScratch === null ||
                      operationLock.activeOperation !== null ||
                      editor.snapshot !== null
                    }
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={handleOpenScratchTitle}
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
                    disabled={operationLock.activeOperation !== null}
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
            </>
          )}
        </div>

        {breakdownRenderItems.length > 0 ? (
          <div className="mt-2" role="list">
            {breakdownRenderItems.map((item) =>
              item.kind === "recovery" ? (
                <InvalidatedBreakdownRecoveryRow
                  key={`recovery:${item.snapshot.target.id}`}
                  editor={editor}
                  onSave={handleEditorSave}
                  onUseMine={handleEditorUseMine}
                  snapshot={item.snapshot}
                />
              ) : (
                <BreakdownRow
                  key={item.row.id}
                  deleteOperation={
                    deleteOperationsByBreakdownId.get(item.row.id) ?? null
                  }
                  isStaged={stagedEligibility.stagedSourceIds.has(item.row.id)}
                  isOperationLocked={operationLock.activeOperation !== null}
                  editor={editor}
                  onEdit={handleOpenBreakdown}
                  onSave={handleEditorSave}
                  onUseMine={handleEditorUseMine}
                  row={item.row}
                  onDelete={(breakdownId) => {
                    const previousOperation =
                      deleteOperationsByBreakdownId.get(breakdownId);
                    if (previousOperation?.phase === "terminal") {
                      hideReliabilityOperation(previousOperation.operationId);
                    }
                    setPendingDelete({
                      scratchBitId: selectedScratchId,
                      breakdownId,
                    });
                  }}
                  onDeleteReliabilityActionRef={(id, element) => {
                    if (element === null) {
                      deleteReliabilityActionRefs.current.delete(id);
                    } else {
                      deleteReliabilityActionRefs.current.set(id, element);
                    }
                  }}
                  onReconcileDelete={(operationId) =>
                    void handleReconcileDelete(operationId)
                  }
                  onEditRef={(id, element) => {
                    if (element === null) rowEditRefs.current.delete(id);
                    else rowEditRefs.current.set(id, element);
                  }}
                  onRowRef={(id, element) => {
                    if (element === null) rowRefs.current.delete(id);
                    else rowRefs.current.set(id, element);
                  }}
                />
              ),
            )}
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
        <div
          className="breakdown-add-region grid grid-cols-[minmax(0,1fr)_auto] gap-2"
          data-testid="breakdown-add-row"
          data-triage-reliability-state={addReliabilityState ?? undefined}
          data-triage-reliability-surface={
            addReliabilityState === null ? undefined : "add"
          }
          inert={isDepartureDecision ? true : undefined}
        >
          {isAdding || addReliabilityState !== null ? (
            <input
              ref={(element) => {
                inputRef.current = element;
                addEntryRef.current = element;
              }}
              className="block h-8 w-full appearance-none rounded-md border border-border bg-background px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
              data-triage-role="breakdown-add-field"
              maxLength={500}
              onChange={(event) => updateAddDraft(event.target.value)}
              onCompositionEnd={() => {
                isComposingRef.current = false;
              }}
              onCompositionStart={() => {
                isComposingRef.current = true;
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Add a note..."
              readOnly={
                operationLock.activeOperation !== null ||
                addReliabilityState === "pending" ||
                addReliabilityState === "unknown" ||
                addReliabilityState === "reconciling"
              }
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
          {addReliabilityState !== null && addReliabilityCopy !== null ? (
            <ReliabilityLine
              action={addReliabilityAction}
              actionRef={(element) => {
                addReliabilityActionRef.current = element;
              }}
              copy={addReliabilityCopy}
              isReconciling={addReliabilityState === "reconciling"}
              state={addReliabilityState}
              surface="add"
              onAction={
                addReliabilityState === "not-applied"
                  ? () => void handleRetryAdd()
                  : () => void handleReconcileAdd()
              }
            />
          ) : null}
        </div>
        {isDepartureDecision ? (
          <div
            ref={departureSheetRef}
            aria-describedby={departureDescriptionId}
            aria-labelledby={departureHeadingId}
            aria-modal="true"
            className="breakdown-departure-sheet"
            data-triage-role="breakdown-departure-sheet"
            data-triage-state="departure-decision"
            role="alertdialog"
            onKeyDown={handleDepartureKeyDown}
          >
            <p
              className="breakdown-departure-sheet__eyebrow"
              data-triage-role="breakdown-departure-eyebrow"
            >
              {INBOX_TRIAGE_COPY.departure.eyebrow}
            </p>
            <h3
              className="breakdown-departure-sheet__heading"
              data-triage-role="breakdown-departure-heading"
              id={departureHeadingId}
            >
              {INBOX_TRIAGE_COPY.departure.heading}
            </h3>
            <p
              className="breakdown-departure-sheet__description"
              data-triage-role="breakdown-departure-description"
              id={departureDescriptionId}
            >
              {INBOX_TRIAGE_COPY.departure.description}
            </p>
            <div
              className="breakdown-departure-sheet__actions"
              data-triage-role="breakdown-departure-actions"
            >
              <Button
                ref={departureContinueRef}
                data-triage-role="breakdown-departure-continue"
                type="button"
                onClick={continueWriting}
                onFocus={(event) => {
                  lastDepartureActionRef.current = event.currentTarget;
                }}
              >
                {INBOX_TRIAGE_COPY.departure.continueAction}
              </Button>
              <Button
                ref={departureDiscardRef}
                className="breakdown-departure-sheet__discard"
                data-triage-role="breakdown-departure-discard"
                type="button"
                variant="ghost"
                onClick={discardAndMove}
                onFocus={(event) => {
                  lastDepartureActionRef.current = event.currentTarget;
                }}
              >
                {INBOX_TRIAGE_COPY.departure.discardAction}
              </Button>
            </div>
          </div>
        ) : null}
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
