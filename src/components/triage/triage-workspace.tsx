"use client";

import { DndContext, DragOverlay, useDroppable, type Modifier } from "@dnd-kit/core";
import { AlertTriangle, Folder, ListTodo, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BreakdownPanel,
  type BreakdownSuccessSignal,
} from "@/components/triage/breakdown-panel";
import { HierarchyExplorer } from "@/components/triage/hierarchy-explorer";
import { ScratchPool } from "@/components/triage/scratch-pool";
import { TriageDragToken } from "@/components/triage/triage-drag-token";
import {
  StagingAlertBand,
  StagingZone,
  type StagingOperationView,
  type StagingZoneProjection,
} from "@/components/triage/staging-zone";
import {
  useTriageDnd,
  type PendingPlacement,
  type TriageDragItem,
} from "@/hooks/use-dnd";
import { useExternalScratchRemovalData } from "@/hooks/use-external-scratch-removal-data";
import {
  useStagedCandidates,
  type CandidateCommandOutcome,
} from "@/hooks/use-staged-candidates";
import { useInbox } from "@/hooks/use-inbox";
import {
  registerActiveTriageDeparture,
  TriageDepartureContext,
  useTriageDeparture,
} from "@/hooks/use-triage-departure";
import {
  TriageOperationLockContext,
  useTriageOperationLock,
} from "@/hooks/use-triage-operation-lock";
import {
  createScratchTitleBlockerHandle,
  ScratchTitleBlockerContext,
} from "@/hooks/use-scratch-breakdowns";
import {
  getTriageRemoveDropId,
  type TriageDropData,
} from "@/lib/grid-dnd";
import { INBOX_TRIAGE_COPY } from "@/lib/copy/inbox-triage";
import {
  type StageCandidateCommand,
  type StageCandidateResult,
  type UnstageCandidateCommand,
  type UnstageCandidateResult,
} from "@/lib/db/datastore";
import type { RepositoryOperationStatus } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { useTriagePreferencesStore } from "@/stores/triage-preferences-store";
import { useTriageStore } from "@/stores/triage-store";
import type { ExternalScratchRemovalState } from "@/stores/triage-store";
import type { Node } from "@/types";

function formatStagingHeading(label: string, count: number) {
  return count >= 2 ? `${count} ${label}` : label;
}

type StagingAlertKind =
  | "stage-not-applied"
  | "stage-rejected"
  | "stage-conflict"
  | "unstage-not-applied"
  | "unstage-rejected"
  | "unstage-conflict"
  | "invalidated-drag"
  | "invalidated-placement";

type StagingAlertState = Readonly<{
  kind: StagingAlertKind;
  copy: string;
  candidateId: string | null;
  sourceBreakdownId: string | null;
  clearOnCandidateDisappearance: boolean;
}>;

type StagingOperationMeta = Readonly<{
  title: string;
  resultType: "node" | "bit";
  candidateId: string;
  sourceBreakdownId: string;
}>;

type UnstageSuccessProjection = Readonly<{
  kind: "unstage";
  operationId: string;
  sourceBreakdownId: string;
}>;

function stagingTemplate(template: string, title: string): string {
  return template.replace("{title}", title);
}

function stagingTerminalAlert(
  kind: "stage" | "unstage",
  status: RepositoryOperationStatus,
  meta: StagingOperationMeta,
): StagingAlertState | null {
  if (status === "applied" || status === "already_applied") return null;
  const suffix =
    status === "not_applied"
      ? "NotApplied"
      : status === "rejected"
        ? "Rejected"
        : status === "conflict"
          ? "Conflict"
          : null;
  if (suffix === null) return null;
  const key = `${kind}${suffix}` as keyof typeof INBOX_TRIAGE_COPY.stagingStatus.alert;
  return {
    kind: `${kind}-${status.replace("_", "-")}` as StagingAlertKind,
    copy: stagingTemplate(INBOX_TRIAGE_COPY.stagingStatus.alert[key], meta.title),
    candidateId: meta.candidateId,
    sourceBreakdownId: meta.sourceBreakdownId,
    clearOnCandidateDisappearance: kind === "unstage",
  };
}

function stagingOperationSentence(operation: StagingOperationView): string {
  const suffix =
    operation.phase === "pending"
      ? "Pending"
      : operation.phase === "unknown"
        ? "Unknown"
        : "Reconciling";
  const key = `${operation.kind}${suffix}` as keyof typeof INBOX_TRIAGE_COPY.stagingStatus.operation;
  return stagingTemplate(
    INBOX_TRIAGE_COPY.stagingStatus.operation[key],
    operation.title,
  );
}

type ExternalRemovalDraft = Readonly<{
  id: string;
  label: string;
  value: string;
}>;

function collectExternalRemovalDrafts(root: HTMLElement | null): ExternalRemovalDraft[] {
  if (root === null) return [];
  const drafts: ExternalRemovalDraft[] = [];
  const addField = root.querySelector<HTMLInputElement>(
    'input[data-triage-role="breakdown-add-field"]',
  );
  if (addField?.value) {
    drafts.push({
      id: "add",
      label: INBOX_TRIAGE_COPY.externalRemoval.drafts.add,
      value: addField.value,
    });
  }
  const editorSurfaces = root.querySelectorAll<HTMLElement>(
    '.triage-inline-editor[data-triage-editor-state]:not([data-triage-editor-state="pristine"])',
  );
  let breakdownIndex = 0;
  for (const surface of editorSurfaces) {
    const field = surface.querySelector<HTMLInputElement>(
      '[data-triage-role="inline-editor-field"]',
    );
    const protectedDraft = surface.querySelector<HTMLElement>(
      '[data-triage-role="inline-editor-protected-draft"]',
    );
    const value = field?.value ?? protectedDraft?.textContent ?? "";
    if (value.length === 0) continue;
    const isScratchTitle = surface.closest(
      '[data-testid="selected-scratch-context"]',
    );
    drafts.push({
      id: isScratchTitle ? "scratch-title" : `breakdown-${breakdownIndex++}`,
      label: isScratchTitle
        ? INBOX_TRIAGE_COPY.externalRemoval.drafts.scratchTitle
        : INBOX_TRIAGE_COPY.externalRemoval.drafts.breakdown,
      value,
    });
  }
  return drafts;
}

const EXTERNAL_REMOVAL_DURATION_MS = 5000;

function replaceExternalRemovalTemplate(
  template: string,
  replacements: Readonly<Record<string, string | number>>,
): string {
  return Object.entries(replacements).reduce(
    (copy, [key, value]) => copy.replace(`{${key}}`, String(value)),
    template,
  );
}

function formatExternalRemovalDestination(
  removal: ExternalScratchRemovalState,
  destinationTitle: string | null,
  paused: boolean,
  seconds: number,
): string {
  const copy = INBOX_TRIAGE_COPY.externalRemoval.destination;
  if (removal.destinationKind === "scratch" && destinationTitle !== null) {
    return replaceExternalRemovalTemplate(
      paused ? copy.paused : copy.running,
      { title: destinationTitle, seconds },
    );
  }
  if (removal.destinationKind === "search-empty") {
    return replaceExternalRemovalTemplate(
      paused ? copy.pausedSearchEmpty : copy.runningSearchEmpty,
      { seconds },
    );
  }
  return replaceExternalRemovalTemplate(
    paused ? copy.pausedInboxEmpty : copy.runningInboxEmpty,
    { seconds },
  );
}

function ExternalScratchRemovalTransition({
  destinationTitle,
  drafts,
  onFinish,
  removal,
}: {
  destinationTitle: string | null;
  drafts: ExternalRemovalDraft[];
  onFinish: () => void | Promise<void>;
  removal: ExternalScratchRemovalState;
}) {
  const headingId = useId();
  const descriptionId = `${headingId}-destination`;
  const panelRef = useRef<HTMLDivElement>(null);
  const pauseRef = useRef<HTMLButtonElement>(null);
  const copyRefs = useRef(new Map<string, HTMLButtonElement>());
  const lastFocusedRef = useRef<HTMLButtonElement | null>(null);
  const remainingRef = useRef(EXTERNAL_REMOVAL_DURATION_MS);
  const runningStartedAtRef = useRef<number | null>(null);
  const runningStartRemainingRef = useRef(EXTERNAL_REMOVAL_DURATION_MS);
  const destinationKeyRef = useRef("");
  const finishRef = useRef(false);
  const [remainingMs, setRemainingMs] = useState(EXTERNAL_REMOVAL_DURATION_MS);
  const [paused, setPaused] = useState(drafts.length > 0);
  const pausedRef = useRef(paused);
  const [copiedIds, setCopiedIds] = useState<ReadonlySet<string>>(new Set());
  const destinationKey = `${removal.destinationKind}:${removal.destinationId ?? "none"}`;
  const seconds = Math.max(1, Math.ceil(remainingMs / 1000));
  const message = formatExternalRemovalDestination(
    removal,
    destinationTitle,
    paused,
    seconds,
  );
  const [announcement, setAnnouncement] = useState(message);

  const requestFinish = useCallback(() => {
    if (finishRef.current) return;
    finishRef.current = true;
    void Promise.resolve(onFinish()).catch((error) => {
      finishRef.current = false;
      console.error("external Scratch terminal validation error:", error);
    });
  }, [onFinish]);

  useLayoutEffect(() => {
    const initialFocus =
      drafts.length > 0
        ? copyRefs.current.get(drafts[0]!.id) ?? null
        : pauseRef.current;
    lastFocusedRef.current = initialFocus;
    initialFocus?.focus();
  }, [drafts]);

  useEffect(() => {
    return useTriageStore.subscribe((state, previousState) => {
      const current = state.externalScratchRemoval;
      const previous = previousState.externalScratchRemoval;
      if (
        current?.scratchId !== removal.scratchId ||
        previous?.scratchId !== removal.scratchId ||
        (current.destinationId === previous.destinationId &&
          current.destinationKind === previous.destinationKind) ||
        pausedRef.current
      ) {
        return;
      }
      remainingRef.current = EXTERNAL_REMOVAL_DURATION_MS;
      setRemainingMs(EXTERNAL_REMOVAL_DURATION_MS);
    });
  }, [removal.scratchId]);

  useEffect(() => {
    const containFocus = (event: globalThis.FocusEvent) => {
      if (
        !(event.target instanceof globalThis.Node) ||
        panelRef.current?.contains(event.target)
      ) {
        return;
      }
      (lastFocusedRef.current ?? pauseRef.current)?.focus();
    };
    document.addEventListener("focusin", containFocus);
    return () => document.removeEventListener("focusin", containFocus);
  }, []);

  useEffect(() => {
    if (destinationKeyRef.current === "") {
      destinationKeyRef.current = destinationKey;
      return;
    }
    if (destinationKeyRef.current === destinationKey) return;
    destinationKeyRef.current = destinationKey;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (!paused) {
        remainingRef.current = EXTERNAL_REMOVAL_DURATION_MS;
        setRemainingMs(EXTERNAL_REMOVAL_DURATION_MS);
        setAnnouncement(
          formatExternalRemovalDestination(
            removal,
            destinationTitle,
            false,
            5,
          ),
        );
      } else {
        setAnnouncement(
          formatExternalRemovalDestination(
            removal,
            destinationTitle,
            true,
            Math.max(1, Math.ceil(remainingRef.current / 1000)),
          ),
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [destinationKey, destinationTitle, paused, removal]);

  useEffect(() => {
    if (paused) return;
    const startedAt = Date.now();
    const startingRemaining = remainingRef.current;
    runningStartedAtRef.current = startedAt;
    runningStartRemainingRef.current = startingRemaining;
    const timer = window.setInterval(() => {
      const next = Math.max(0, startingRemaining - (Date.now() - startedAt));
      remainingRef.current = next;
      setRemainingMs(next);
      if (next === 0 && !finishRef.current) {
        window.clearInterval(timer);
        requestFinish();
      }
    }, 100);
    return () => {
      window.clearInterval(timer);
      runningStartedAtRef.current = null;
    };
  }, [destinationKey, paused, requestFinish]);

  const handlePause = () => {
    if (!paused && runningStartedAtRef.current !== null) {
      const exactRemaining = Math.max(
        0,
        runningStartRemainingRef.current -
          (Date.now() - runningStartedAtRef.current),
      );
      remainingRef.current = exactRemaining;
      setRemainingMs(exactRemaining);
    }
    const nextPaused = !pausedRef.current;
    pausedRef.current = nextPaused;
    setPaused(nextPaused);
  };

  const handleCopy = async (draft: ExternalRemovalDraft) => {
    try {
      await navigator.clipboard.writeText(draft.value);
      setCopiedIds((current) => new Set(current).add(draft.id));
    } catch {
      // Full selectable text remains available for manual copy.
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      panelRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [],
    );
    if (focusable.length === 0) return;
    const currentIndex = focusable.indexOf(document.activeElement as HTMLButtonElement);
    const nextIndex = event.shiftKey
      ? currentIndex <= 0
        ? focusable.length - 1
        : currentIndex - 1
      : currentIndex === focusable.length - 1
        ? 0
        : currentIndex + 1;
    event.preventDefault();
    focusable[nextIndex]?.focus();
  };

  const title =
    INBOX_TRIAGE_COPY.externalRemoval.title[removal.lifecycle ?? "delete"];

  return (
    <div
      className="external-removal-scrim"
      data-triage-role="external-removal-scrim"
      data-triage-state={`external-removal${paused ? " paused" : ""}${drafts.length > 0 ? " draft-copy-ready" : ""}`}
    >
      <div
        ref={panelRef}
        aria-describedby={descriptionId}
        aria-labelledby={headingId}
        aria-modal="true"
        className="external-removal-panel"
        data-triage-role="external-removal-panel"
        role="alertdialog"
        onKeyDown={handleKeyDown}
      >
        <h2
          className="external-removal-panel__title"
          data-triage-role="external-removal-title"
          id={headingId}
        >
          {title}
        </h2>
        <p
          className="external-removal-panel__destination"
          data-triage-role="external-removal-destination"
          id={descriptionId}
        >
          {message}
        </p>
        <div
          className="external-removal-panel__track"
          data-triage-role="external-removal-countdown-track"
        >
          <span
            data-testid="external-removal-countdown-fill"
            data-triage-role="external-removal-countdown-fill"
            style={{
              transform: `scaleX(${remainingMs / EXTERNAL_REMOVAL_DURATION_MS})`,
            }}
          />
        </div>
        <div aria-atomic="true" aria-live="polite" className="sr-only">
          {announcement}
        </div>
        {drafts.length > 0 ? (
          <section className="external-removal-panel__draft-region">
            <h3>{INBOX_TRIAGE_COPY.externalRemoval.drafts.heading}</h3>
            <p>{INBOX_TRIAGE_COPY.externalRemoval.drafts.explanation}</p>
            <div className="external-removal-panel__draft-list">
              {drafts.map((draft) => {
                const copied = copiedIds.has(draft.id);
                return (
                  <article
                    data-triage-role="external-removal-draft-card"
                    data-triage-state={copied ? "copied" : "draft-copy-ready"}
                    key={draft.id}
                  >
                    <h4>{draft.label}</h4>
                    <pre>{draft.value}</pre>
                    <button
                      ref={(element) => {
                        if (element === null) copyRefs.current.delete(draft.id);
                        else copyRefs.current.set(draft.id, element);
                      }}
                      data-triage-role="external-removal-copy-status"
                      type="button"
                      onClick={() => void handleCopy(draft)}
                      onFocus={(event) => {
                        lastFocusedRef.current = event.currentTarget;
                      }}
                    >
                      {copied
                        ? INBOX_TRIAGE_COPY.externalRemoval.drafts.copied
                        : INBOX_TRIAGE_COPY.externalRemoval.drafts.copy}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
        <div className="external-removal-panel__actions">
          <button
            data-triage-role="external-removal-primary-action"
            type="button"
            onClick={requestFinish}
            onFocus={(event) => {
              lastFocusedRef.current = event.currentTarget;
            }}
          >
            {INBOX_TRIAGE_COPY.externalRemoval.actions.moveNow}
          </button>
          <button
            ref={pauseRef}
            data-triage-role="external-removal-secondary-action"
            type="button"
            onClick={handlePause}
            onFocus={(event) => {
              lastFocusedRef.current = event.currentTarget;
            }}
          >
            {paused
              ? INBOX_TRIAGE_COPY.externalRemoval.actions.resume
              : INBOX_TRIAGE_COPY.externalRemoval.actions.pause}
          </button>
        </div>
      </div>
    </div>
  );
}

// Positions the compact drag token center at the cursor rather than the
// original draggable element's top-left. Without this, grabbing a staged
// Node card or Bit row away from the top-left leaves the token visually
// detached from the pointer (ISSUE-18-10).
const snapDragTokenToCursor: Modifier = ({
  activatorEvent,
  draggingNodeRect,
  overlayNodeRect,
  transform,
}) => {
  if (!draggingNodeRect || !activatorEvent) return transform;

  let clientX: number | undefined;
  let clientY: number | undefined;

  if ("touches" in activatorEvent) {
    const { touches } = activatorEvent as TouchEvent;
    if (touches.length > 0) {
      clientX = touches[0].clientX;
      clientY = touches[0].clientY;
    }
  } else if ("clientX" in activatorEvent) {
    clientX = (activatorEvent as MouseEvent).clientX;
    clientY = (activatorEvent as MouseEvent).clientY;
  }

  if (clientX === undefined || clientY === undefined) return transform;

  const tokenWidth = overlayNodeRect?.width ?? 0;
  const tokenHeight = overlayNodeRect?.height ?? 0;

  return {
    ...transform,
    x: transform.x + clientX - draggingNodeRect.left - tokenWidth / 2,
    y: transform.y + clientY - draggingNodeRect.top - tokenHeight / 2,
  };
};

function TriageRemoveDropTarget({
  activeDragItem,
  overTargetId,
}: {
  activeDragItem: TriageDragItem;
  overTargetId: string | null;
}) {
  const id = getTriageRemoveDropId();
  const dropData = { kind: "triage-remove-drop" } satisfies TriageDropData;
  const { setNodeRef } = useDroppable({
    id,
    data: dropData,
  });
  const isStagedDrag =
    activeDragItem?.kind === "triage-staged-node" ||
    activeDragItem?.kind === "triage-staged-bit";
  const isOver = overTargetId === id;

  if (!isStagedDrag) return null;

  return (
    <div
      ref={setNodeRef}
      aria-label="Drop staged item here to remove from staging"
      className={cn(
        "flex h-12 w-full items-center justify-center gap-2 border-t bg-transparent px-3 text-xs font-medium transition-[background-color,border-color,color] motion-reduce:transition-none",
        isOver
          ? "border-solid border-border bg-muted text-foreground"
          : "border-dashed border-border text-muted-foreground motion-safe:animate-jiggle",
      )}
    >
      <X aria-hidden="true" className="h-4 w-4 flex-shrink-0" />
      <span>Remove from staging</span>
    </div>
  );
}

export function TriageWorkspace({ node }: { node: Node }) {
  const operationLock = useTriageOperationLock();
  const departure = useTriageDeparture(operationLock);
  const [titleBlockerHandle] = useState(createScratchTitleBlockerHandle);
  const externalScratchRemoval = useTriageStore(
    (state) => state.externalScratchRemoval,
  );
  const selectedScratchId = useTriageStore((state) => state.selectedScratchId);
  const setExternalScratchRemovalLifecycle = useTriageStore(
    (state) => state.setExternalScratchRemovalLifecycle,
  );
  const { observation, readTerminalSnapshot } =
    useExternalScratchRemovalData({
      activeRemovalScratchId: externalScratchRemoval?.scratchId ?? null,
      selectedScratchId,
      unresolvedRemovalContext:
        externalScratchRemoval?.lifecycle === null
          ? externalScratchRemoval
          : null,
      unresolvedScratchId:
        externalScratchRemoval?.lifecycle === null
          ? externalScratchRemoval.scratchId
          : null,
    });

  useEffect(() => {
    return registerActiveTriageDeparture(departure);
  }, [departure]);

  useEffect(() => {
    if (
      observation === null ||
      externalScratchRemoval?.scratchId !== observation.scratchId
    ) {
      return;
    }
    setExternalScratchRemovalLifecycle(
      observation.scratchId,
      observation.lifecycle,
    );
  }, [
    externalScratchRemoval?.scratchId,
    observation,
    setExternalScratchRemovalLifecycle,
  ]);

  return (
    <TriageOperationLockContext.Provider value={operationLock}>
      <TriageDepartureContext.Provider value={departure}>
        <ScratchTitleBlockerContext.Provider value={titleBlockerHandle}>
          <TriageWorkspaceContent
            departure={departure}
            isDepartureDecision={departure.pendingDestination !== null}
            node={node}
            operationLock={operationLock}
            readTerminalSnapshot={readTerminalSnapshot}
          />
        </ScratchTitleBlockerContext.Provider>
      </TriageDepartureContext.Provider>
    </TriageOperationLockContext.Provider>
  );
}

function TriageWorkspaceContent({
  departure,
  isDepartureDecision,
  node,
  operationLock,
  readTerminalSnapshot,
}: {
  departure: ReturnType<typeof useTriageDeparture>;
  isDepartureDecision: boolean;
  node: Node;
  operationLock: ReturnType<typeof useTriageOperationLock>;
  readTerminalSnapshot: ReturnType<
    typeof useExternalScratchRemovalData
  >["readTerminalSnapshot"];
}) {
  const selectedScratchId = useTriageStore((state) => state.selectedScratchId);
  const externalScratchRemoval = useTriageStore(
    (state) => state.externalScratchRemoval,
  );
  const finishExternalScratchRemoval = useTriageStore(
    (state) => state.finishExternalScratchRemoval,
  );
  const scratchPoolQuery = useTriageStore((state) => state.scratchPoolQuery);
  const poolCreatedAtSort = useTriagePreferencesStore(
    (state) => state.poolCreatedAtSort,
  );
  const { activeScratchBits } = useInbox();
  const workspaceRef = useRef<HTMLElement>(null);
  const preTransitionFocusRef = useRef<HTMLElement | null>(null);
  const previousRemovalIdRef = useRef<string | null>(null);
  const pendingTerminalFocusRef = useRef<
    "scratch" | "search-empty" | "inbox-empty" | null
  >(null);
  const draftSnapshotRef = useRef<ExternalRemovalDraft[]>([]);
  const [externalRemovalDrafts, setExternalRemovalDrafts] = useState<
    ExternalRemovalDraft[]
  >([]);
  const stagedCandidates = useStagedCandidates(selectedScratchId);
  const {
    candidates: authoritativeStagedCandidates = [],
    counts: stagedCandidateCounts,
    reconcileStageCandidate: runReconcileStageCandidate,
    reconcileUnstageCandidate: runReconcileUnstageCandidate,
    stageCandidate: runStageCandidate,
    unstageCandidate: runUnstageCandidate,
  } = stagedCandidates;
  const [stagingAlert, setStagingAlert] = useState<StagingAlertState | null>(null);
  const breakdownSuccessScopeToken = useMemo(
    () => ({ scratchId: selectedScratchId }),
    [selectedScratchId],
  );
  const [breakdownSuccessScope, setBreakdownSuccessScope] = useState<{
    scratchId: string;
    token: { scratchId: string | null };
    signal: UnstageSuccessProjection;
  } | null>(null);
  const [newCandidateIds, setNewCandidateIds] = useState<{
    node: Set<string>;
    bit: Set<string>;
  }>({ node: new Set(), bit: new Set() });
  const stagingHeadingRef = useRef<HTMLHeadingElement>(null);
  const [operationMeta, setOperationMeta] = useState(
    new Map<string, StagingOperationMeta>(),
  );
  const operationMetaRef = useRef(operationMeta);
  const localStageCandidateIdsRef = useRef(new Set<string>());
  const [localStageCandidateIds, setLocalStageCandidateIds] = useState(
    new Set<string>(),
  );
  const activeDragItemRef = useRef<TriageDragItem>(null);
  const arrivalBaselineRef = useRef<{
    scratchId: string | null;
    ready: boolean;
    ids: Set<string>;
  }>({ scratchId: null, ready: false, ids: new Set() });
  const invalidatedDragRef = useRef<StagingAlertState | null>(null);
  const removeStagedCandidate = useTriageStore(
    (state) => state.removeStagedCandidate,
  );
  const focusUnstagedSource = useCallback((sourceBreakdownId: string) => {
    const focusWhenReady = (remainingFrames: number) => {
      const row = Array.from(
        workspaceRef.current?.querySelectorAll<HTMLElement>(
          "[data-breakdown-id]",
        ) ?? [],
      ).find(
        (candidate) =>
          candidate.dataset.breakdownId === sourceBreakdownId,
      );
      const grip = row?.querySelector<HTMLButtonElement>(
        'button[aria-label="Drag breakdown"]',
      );
      if (grip !== undefined && grip !== null && !grip.disabled) {
        grip.focus();
        return;
      }
      if (remainingFrames > 0) {
        requestAnimationFrame(() => focusWhenReady(remainingFrames - 1));
      }
    };
    requestAnimationFrame(() => focusWhenReady(2));
  }, []);
  const rememberOperation = useCallback(
    (
      command: StageCandidateCommand | UnstageCandidateCommand,
      kind: "stage" | "unstage",
    ): StagingOperationMeta => {
      const dragItem = activeDragItemRef.current;
      const candidate = authoritativeStagedCandidates.find(
        ({ id }) => id === command.candidateId,
      );
      const previous = operationMetaRef.current.get(command.operationId);
      const resultType =
        "resultType" in command
          ? command.resultType
          : candidate?.resultType ??
            previous?.resultType ??
            (dragItem?.kind === "triage-staged-node" ? "node" : "bit");
      const meta = {
        title: candidate?.content ?? dragItem?.label ?? previous?.title ?? "Item",
        resultType,
        candidateId: command.candidateId,
        sourceBreakdownId: command.sourceBreakdownId,
      } satisfies StagingOperationMeta;
      operationMetaRef.current.set(command.operationId, meta);
      setOperationMeta(new Map(operationMetaRef.current));
      if (kind === "stage") {
        localStageCandidateIdsRef.current.add(command.candidateId);
        setLocalStageCandidateIds((current) =>
          new Set(current).add(command.candidateId),
        );
      }
      setStagingAlert((current) =>
        current?.candidateId === command.candidateId ? null : current,
      );
      return meta;
    },
    [authoritativeStagedCandidates],
  );
  const projectTerminalOutcome = useCallback(
    (
      kind: "stage" | "unstage",
      meta: StagingOperationMeta,
      outcome:
        | CandidateCommandOutcome<StageCandidateResult>
        | CandidateCommandOutcome<UnstageCandidateResult>,
    ) => {
      if ("outcome" in outcome) return;
      if (
        kind === "unstage" &&
        selectedScratchId !== null &&
        (outcome.status === "applied" || outcome.status === "already_applied")
      ) {
        setBreakdownSuccessScope({
          scratchId: selectedScratchId,
          token: breakdownSuccessScopeToken,
          signal: {
            kind: "unstage",
            operationId: outcome.operationId,
            sourceBreakdownId: meta.sourceBreakdownId,
          },
        });
      }
      const alert = stagingTerminalAlert(kind, outcome.status, meta);
      if (alert !== null) {
        localStageCandidateIdsRef.current.delete(meta.candidateId);
        setLocalStageCandidateIds((current) => {
          const next = new Set(current);
          next.delete(meta.candidateId);
          return next;
        });
      }
      setStagingAlert((current) =>
        alert ?? (current?.candidateId === meta.candidateId ? null : current),
      );
    },
    [breakdownSuccessScopeToken, selectedScratchId],
  );
  const stageCandidate = useCallback(
    async (command: StageCandidateCommand) => {
      const meta = rememberOperation(command, "stage");
      const outcome = await runStageCandidate(command);
      projectTerminalOutcome("stage", meta, outcome);
      return outcome;
    },
    [projectTerminalOutcome, rememberOperation, runStageCandidate],
  );
  const reconcileStageCandidate = useCallback(
    async (command: StageCandidateCommand) => {
      const meta = rememberOperation(command, "stage");
      const outcome = await runReconcileStageCandidate(command);
      projectTerminalOutcome("stage", meta, outcome);
      return outcome;
    },
    [
      projectTerminalOutcome,
      rememberOperation,
      runReconcileStageCandidate,
    ],
  );
  const unstageCandidate = useCallback(
    async (command: UnstageCandidateCommand) => {
      const meta = rememberOperation(command, "unstage");
      const outcome = await runUnstageCandidate(command);
      projectTerminalOutcome("unstage", meta, outcome);
      return outcome;
    },
    [projectTerminalOutcome, rememberOperation, runUnstageCandidate],
  );
  const reconcileUnstageCandidate = useCallback(
    async (command: UnstageCandidateCommand) => {
      const meta = rememberOperation(command, "unstage");
      const outcome = await runReconcileUnstageCandidate(command);
      projectTerminalOutcome("unstage", meta, outcome);
      return outcome;
    },
    [
      projectTerminalOutcome,
      rememberOperation,
      runReconcileUnstageCandidate,
    ],
  );
  const {
    activeDragItem,
    collisionDetection,
    handleDragCancel,
    handleDragEnd,
    handleDragOver,
    handlePlacementCancel,
    handlePlacementConfirm,
    handleDragStart,
    overTargetId,
    pendingPlacement,
    localPlacementResult,
    refreshRenderedTarget,
    sensors,
    targetFeedback,
  } = useTriageDnd(selectedScratchId, {
    focusUnstagedSource,
    operationLock,
    reconcileStageCandidate,
    reconcileUnstageCandidate,
    removeStagedCandidate,
    stageCandidate,
    unstageCandidate,
  });
  useEffect(() => {
    activeDragItemRef.current = activeDragItem;
  }, [activeDragItem]);

  const stagingOperations = useMemo<StagingOperationView[]>(() => {
    const projected = [
      ...(stagedCandidates.pendingOperations ?? []),
      ...(stagedCandidates.unknownOperations ?? []),
      ...(stagedCandidates.reconcilingOperations ?? []),
    ];
    return projected.flatMap((operation) => {
      if (operation.kind === "orphan_cleanup") return [];
      const kind = operation.kind;
      const candidate = authoritativeStagedCandidates.find(
        ({ id }) => id === operation.candidateId,
      );
      const meta = operationMeta.get(operation.operationId);
      const title = candidate?.content ?? meta?.title;
      const resultType = operation.resultType ?? candidate?.resultType ?? meta?.resultType;
      if (title === undefined || resultType === undefined) return [];
      return [{ ...operation, kind, title, resultType }];
    });
  }, [
    authoritativeStagedCandidates,
    operationMeta,
    stagedCandidates.pendingOperations,
    stagedCandidates.reconcilingOperations,
    stagedCandidates.unknownOperations,
  ]);
  const stagingProjection = useMemo<StagingZoneProjection>(
    () => ({
      candidates: authoritativeStagedCandidates ?? [],
      integrityCandidates: stagedCandidates.integrityCandidates ?? [],
      operations: stagingOperations,
    }),
    [
      authoritativeStagedCandidates,
      stagedCandidates.integrityCandidates,
      stagingOperations,
    ],
  );
  const stagingProjectionByType = useMemo(
    () => ({
      node: {
        candidates: stagingProjection.candidates.filter(
          ({ resultType }) => resultType === "node",
        ),
        integrityCandidates: stagingProjection.integrityCandidates.filter(
          ({ candidate }) => candidate.resultType === "node",
        ),
        operations: stagingProjection.operations.filter(
          ({ resultType }) => resultType === "node",
        ),
      },
      bit: {
        candidates: stagingProjection.candidates.filter(
          ({ resultType }) => resultType === "bit",
        ),
        integrityCandidates: stagingProjection.integrityCandidates.filter(
          ({ candidate }) => candidate.resultType === "bit",
        ),
        operations: stagingProjection.operations.filter(
          ({ resultType }) => resultType === "bit",
        ),
      },
    }),
    [stagingProjection],
  );
  const stagingLiveSentence =
    stagingAlert?.copy ??
    (stagingOperations.length > 0
      ? stagingOperationSentence(stagingOperations[stagingOperations.length - 1])
      : "");
  const authoritativeArrivalCandidates = useMemo(
    () => [
      ...authoritativeStagedCandidates.map(({ id, resultType }) => ({
        id,
        resultType,
      })),
      ...(stagedCandidates.integrityCandidates ?? []).map(({ candidate }) => ({
        id: candidate.id,
        resultType: candidate.resultType,
      })),
    ],
    [authoritativeStagedCandidates, stagedCandidates.integrityCandidates],
  );

  useEffect(() => {
    const baseline = arrivalBaselineRef.current;
    if (baseline.scratchId !== selectedScratchId) {
      arrivalBaselineRef.current = {
        scratchId: selectedScratchId,
        ready: false,
        ids: new Set(),
      };
      operationMetaRef.current.clear();
      localStageCandidateIdsRef.current.clear();
      // This state mirrors an external live-query ownership boundary.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNewCandidateIds({ node: new Set(), bit: new Set() });
      setLocalStageCandidateIds(new Set());
      setStagingAlert(null);
    }
    if (selectedScratchId === null || !stagedCandidates.isReady) return;
    const current = arrivalBaselineRef.current;
    const currentIds = new Set(authoritativeArrivalCandidates.map(({ id }) => id));
    if (!current.ready) {
      arrivalBaselineRef.current = {
        scratchId: selectedScratchId,
        ready: true,
        ids: currentIds,
      };
      return;
    }
    const observedLocalIds = new Set(
      authoritativeArrivalCandidates
        .filter(
          ({ id }) =>
            !current.ids.has(id) &&
            (localStageCandidateIds.has(id) ||
              localStageCandidateIdsRef.current.has(id)),
        )
        .map(({ id }) => id),
    );
    for (const id of observedLocalIds) {
      localStageCandidateIdsRef.current.delete(id);
    }
    setNewCandidateIds((previous) => {
      const next = {
        node: new Set([...previous.node].filter((id) => currentIds.has(id))),
        bit: new Set([...previous.bit].filter((id) => currentIds.has(id))),
      };
      for (const candidate of authoritativeArrivalCandidates) {
        if (current.ids.has(candidate.id)) continue;
        if (observedLocalIds.has(candidate.id)) continue;
        next[candidate.resultType].add(candidate.id);
      }
      return next;
    });
    if (observedLocalIds.size > 0) {
      setLocalStageCandidateIds((currentLocalIds) => {
        const remaining = new Set(currentLocalIds);
        for (const id of observedLocalIds) remaining.delete(id);
        return remaining;
      });
    }
    arrivalBaselineRef.current = {
      scratchId: selectedScratchId,
      ready: true,
      ids: currentIds,
    };
  }, [
    authoritativeArrivalCandidates,
    localStageCandidateIds,
    selectedScratchId,
    stagedCandidates.isReady,
  ]);

  useEffect(() => {
    if (
      stagingAlert?.clearOnCandidateDisappearance &&
      !authoritativeArrivalCandidates.some(
        ({ id }) => id === stagingAlert.candidateId,
      )
    ) {
      // Authoritative disappearance is the receipt-defined alert clear signal.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStagingAlert(null);
    }
  }, [authoritativeArrivalCandidates, stagingAlert]);

  useEffect(() => {
    if (activeDragItem?.integrity === "invalidated") {
      invalidatedDragRef.current = {
        kind: "invalidated-drag",
        copy: stagingTemplate(
          INBOX_TRIAGE_COPY.stagingStatus.alert.invalidatedDrag,
          activeDragItem.label,
        ),
        candidateId: activeDragItem.id,
        sourceBreakdownId:
          "sourceBreakdownId" in activeDragItem
            ? activeDragItem.sourceBreakdownId
            : null,
        clearOnCandidateDisappearance: false,
      };
      return;
    }
    if (activeDragItem === null && invalidatedDragRef.current !== null) {
      setStagingAlert(invalidatedDragRef.current);
      invalidatedDragRef.current = null;
    }
  }, [activeDragItem]);

  const handlePendingPlacementInvalidated = useCallback(
    (dropId: string) => {
      if (pendingPlacement?.dropId === dropId) {
        setStagingAlert({
          kind: "invalidated-placement",
          copy: stagingTemplate(
            INBOX_TRIAGE_COPY.stagingStatus.alert.invalidatedPlacement,
            pendingPlacement.candidateLabel,
          ),
          candidateId: pendingPlacement.candidateId,
          sourceBreakdownId: pendingPlacement.sourceBreakdownId,
          clearOnCandidateDisappearance: false,
        });
      }
      handlePlacementCancel();
    },
    [handlePlacementCancel, pendingPlacement],
  );

  const showNewCandidates = useCallback((type: "node" | "bit") => {
    const ids = [...newCandidateIds[type]];
    const well = workspaceRef.current?.querySelector<HTMLElement>(
      `[data-triage-role="staging-${type}-well"]`,
    );
    if (well) well.scrollTop = 0;
    const target = Array.from(
      workspaceRef.current?.querySelectorAll<HTMLElement>("[data-candidate-id]") ?? [],
    ).find((element) => ids.includes(element.dataset.candidateId ?? ""));
    (target ?? stagingHeadingRef.current)?.focus();
    setNewCandidateIds((previous) => ({ ...previous, [type]: new Set() }));
  }, [newCandidateIds]);

  const dismissStagingAlert = useCallback(() => {
    const dismissed = stagingAlert;
    setStagingAlert(null);
    requestAnimationFrame(() => {
      const candidate = Array.from(
        workspaceRef.current?.querySelectorAll<HTMLElement>("[data-candidate-id]") ?? [],
      ).find(
        (element) => element.dataset.candidateId === dismissed?.candidateId,
      );
      const source =
        dismissed?.sourceBreakdownId === null ||
        dismissed?.sourceBreakdownId === undefined
          ? null
          : Array.from(
              workspaceRef.current?.querySelectorAll<HTMLElement>(
                "[data-breakdown-id]",
              ) ?? [],
            )
              .find(
                (row) => row.dataset.breakdownId === dismissed.sourceBreakdownId,
              )
              ?.querySelector<HTMLElement>('button[aria-label="Drag breakdown"]');
      (candidate ?? source ?? stagingHeadingRef.current)?.focus();
    });
  }, [stagingAlert]);

  useLayoutEffect(() => {
    const root = workspaceRef.current;
    if (root === null) return;
    const refreshDraftSnapshot = () => {
      if (useTriageStore.getState().externalScratchRemoval === null) {
        draftSnapshotRef.current = collectExternalRemovalDrafts(root);
      }
    };
    refreshDraftSnapshot();
    const observer = new MutationObserver(refreshDraftSnapshot);
    observer.observe(root, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    const unsubscribe = useTriageStore.subscribe((state, previousState) => {
      const currentRemoval = state.externalScratchRemoval;
      const previousRemoval = previousState.externalScratchRemoval;
      if (
        currentRemoval?.lifecycle !== null &&
        currentRemoval !== null &&
        (previousRemoval === null || previousRemoval.lifecycle === null)
      ) {
        previousRemovalIdRef.current = currentRemoval.scratchId;
        preTransitionFocusRef.current =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        setExternalRemovalDrafts([...draftSnapshotRef.current]);
      }
    });
    return () => {
      observer.disconnect();
      unsubscribe();
    };
  }, []);

  useLayoutEffect(() => {
    if (externalScratchRemoval !== null) return;
    const terminalFocus = pendingTerminalFocusRef.current;
    pendingTerminalFocusRef.current = null;
    if (terminalFocus !== null) {
      const selector =
        terminalFocus === "scratch"
          ? '[data-testid="selected-scratch-context"]'
          : `[data-external-removal-focus="${terminalFocus}"]`;
      workspaceRef.current?.querySelector<HTMLElement>(selector)?.focus();
      preTransitionFocusRef.current = null;
      previousRemovalIdRef.current = null;
      return;
    }
    const prior = preTransitionFocusRef.current;
    preTransitionFocusRef.current = null;
    if (prior?.isConnected) {
      prior.focus();
    } else if (previousRemovalIdRef.current !== null) {
      workspaceRef.current
        ?.querySelector<HTMLElement>(
          '[data-testid="selected-scratch-context"] button[aria-label="Edit"]',
        )
        ?.focus();
    }
    previousRemovalIdRef.current = null;
  }, [externalScratchRemoval, selectedScratchId]);

  const finishExternalRemoval = useCallback(async () => {
    const removal = useTriageStore.getState().externalScratchRemoval;
    if (removal === null) return;
    const { projectedActiveScratchBits, source } = await readTerminalSnapshot(
      node.id,
      removal.scratchId,
    );
    if (
      useTriageStore.getState().externalScratchRemoval?.scratchId !==
      removal.scratchId
    ) {
      return;
    }
    if (source?.archivedAt !== null && source?.archivedAt !== undefined) {
      useTriageStore
        .getState()
        .setExternalScratchRemovalLifecycle(removal.scratchId, "archive");
    } else if (source === undefined || source.deletedAt !== null) {
      useTriageStore
        .getState()
        .setExternalScratchRemovalLifecycle(removal.scratchId, "delete");
    }
    const sourceIsActive =
      source !== undefined &&
      source.deletedAt === null &&
      source.archivedAt === null;
    const latestActiveScratchBits = projectedActiveScratchBits.filter(
      (scratch) => scratch.id !== removal.scratchId,
    );
    if (sourceIsActive) latestActiveScratchBits.push(source);
    const latestOrderedScratchBits = latestActiveScratchBits.toSorted(
      (left, right) =>
        poolCreatedAtSort === "ASC"
          ? left.createdAt - right.createdAt
          : right.createdAt - left.createdAt,
    );
    const normalizedQuery = scratchPoolQuery.toLocaleLowerCase();
    const latestVisibleScratchBits =
      normalizedQuery.length === 0
        ? latestOrderedScratchBits
        : latestOrderedScratchBits.filter((scratch) =>
            scratch.title.toLocaleLowerCase().includes(normalizedQuery),
          );
    const latestContext = {
      activeIds: latestOrderedScratchBits.map((scratch) => scratch.id),
      visibleIds: latestVisibleScratchBits.map((scratch) => scratch.id),
    };
    useTriageStore.getState().reconcileScratchPoolContext(latestContext);
    const validatedRemoval = useTriageStore.getState().externalScratchRemoval;
    if (validatedRemoval === null) return;
    pendingTerminalFocusRef.current = validatedRemoval.destinationKind;
    const destination = finishExternalScratchRemoval(latestContext);
    if (destination === null) {
      pendingTerminalFocusRef.current = null;
      return;
    }
    departure.setAddDraft("");
  }, [
    departure,
    finishExternalScratchRemoval,
    node.id,
    poolCreatedAtSort,
    readTerminalSnapshot,
    scratchPoolQuery,
  ]);

  const destinationTitle =
    externalScratchRemoval?.destinationId === null
      ? null
      : activeScratchBits.find(
          (scratch) => scratch.id === externalScratchRemoval?.destinationId,
        )?.title ?? null;
  const isExternalRemoval =
    externalScratchRemoval !== null &&
    externalScratchRemoval.lifecycle !== null;

  return (
    <section
      ref={workspaceRef}
      aria-label={`${node.title} triage workspace`}
      className="triage-shell flex h-full min-h-0 w-full overflow-hidden bg-background"
      data-min-viewport="1024px"
      data-testid="triage-workspace"
      data-triage-operation-kind={operationLock.activeOperation?.kind}
      data-triage-role="shell-background"
      data-triage-state={
        isExternalRemoval
          ? "external-removal"
          : isDepartureDecision
            ? "departure-decision"
            : "default"
      }
      onInputCapture={() => {
        draftSnapshotRef.current = collectExternalRemovalDrafts(
          workspaceRef.current,
        );
      }}
    >
      <section
        aria-labelledby="triage-scratch-pool-heading"
        className="triage-shell__pool relative flex h-full min-h-0 shrink-0"
        data-triage-role="section-surface"
        data-triage-state="default"
        inert={isDepartureDecision || isExternalRemoval ? true : undefined}
      >
        <h2
          className="triage-shell__pool-heading"
          data-triage-role="section-header"
          id="triage-scratch-pool-heading"
          tabIndex={-1}
        >
          {INBOX_TRIAGE_COPY.sectionNames.scratchPool}
        </h2>
        <div
          className="min-h-0"
          data-triage-role="internal-scroll-viewport"
        >
          <ScratchPool />
        </div>
      </section>

      <div
        className="triage-shell__main h-full min-w-0 flex-1 bg-background"
        data-layout-ratio="60/40"
        data-testid="triage-main-work-area"
        inert={isExternalRemoval ? true : undefined}
      >
        <DndContext
          autoScroll={false}
          collisionDetection={collisionDetection}
          sensors={sensors}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
        >
          <div
            className="triage-shell__top min-h-0 border-b border-border"
            data-layout-ratio="60/40"
            data-testid="triage-top-work-area"
          >
            <section
              aria-labelledby="triage-breakdown-heading"
              className="flex min-h-0 min-w-0 flex-col border-r border-border bg-card"
              data-triage-role="section-surface"
              data-triage-state="default"
            >
              <h2
                ref={stagingHeadingRef}
                className="triage-shell__section-heading"
                data-triage-role="section-header"
                id="triage-breakdown-heading"
                tabIndex={-1}
              >
                {INBOX_TRIAGE_COPY.sectionNames.breakdown}
              </h2>
              <div
                className="min-h-0 flex-1 overflow-hidden"
                data-triage-role="internal-scroll-viewport"
              >
                <BreakdownPanel
                  key={selectedScratchId ?? "none"}
                  activeDragItem={activeDragItem}
                  overTargetId={overTargetId}
                  successSignal={
                    breakdownSuccessScope?.scratchId === selectedScratchId &&
                    breakdownSuccessScope.token === breakdownSuccessScopeToken
                      ? {
                          kind: breakdownSuccessScope.signal.kind,
                          operationId: breakdownSuccessScope.signal.operationId,
                          rowId:
                            breakdownSuccessScope.signal.sourceBreakdownId,
                        } satisfies BreakdownSuccessSignal
                      : null
                  }
                />
              </div>
            </section>

            <section
              aria-labelledby="triage-staging-heading"
              className="flex min-h-0 min-w-0 flex-col bg-card"
              data-triage-role="section-surface"
              data-triage-state="default"
              inert={isDepartureDecision ? true : undefined}
            >
              <h2
                className="triage-shell__section-heading"
                data-triage-role="section-header"
                id="triage-staging-heading"
                tabIndex={-1}
              >
                {INBOX_TRIAGE_COPY.sectionNames.staging}
              </h2>
              {stagingAlert !== null ? (
                <StagingAlertBand
                  copy={stagingAlert.copy}
                  onDismiss={dismissStagingAlert}
                />
              ) : null}
              <div
                aria-atomic="true"
                aria-live="polite"
                className="sr-only"
                data-testid="staging-live-region"
                data-triage-role="staging-live-region"
                role="status"
              >
                {stagingLiveSentence}
              </div>
              <div
                className="triage-shell__staging min-h-0 flex-1"
                data-layout-ratio="35/65"
                data-testid="triage-staging-columns"
              >
                <div className="flex min-w-0 basis-[35%] flex-col">
                  <h3 className="triage-shell__subsection-heading flex items-center justify-between gap-2">
                    <span>
                      {formatStagingHeading(
                        INBOX_TRIAGE_COPY.sectionNames.stagingNodes,
                        stagedCandidateCounts.nodes,
                      )}
                    </span>
                    {newCandidateIds.node.size > 0 ? (
                      <button
                        aria-label={INBOX_TRIAGE_COPY.stagingStatus.actions.showNodes}
                        className="staging-arrival-count"
                        type="button"
                        onClick={() => showNewCandidates("node")}
                      >
                        {newCandidateIds.node.size === 1
                          ? INBOX_TRIAGE_COPY.stagingStatus.arrival.one
                          : INBOX_TRIAGE_COPY.stagingStatus.arrival.many.replace(
                              "{count}",
                              String(newCandidateIds.node.size),
                            )}
                      </button>
                    ) : null}
                  </h3>
                  <div
                    className="flex min-h-0 flex-1 overflow-y-auto p-3"
                    data-triage-role="internal-scroll-viewport"
                  >
                    <StagingZone
                      activeDragItem={activeDragItem}
                      newCandidateIds={newCandidateIds.node}
                      overTargetId={overTargetId}
                      projection={stagingProjectionByType.node}
                      type="node"
                      onObservedTop={() =>
                        setNewCandidateIds((previous) => ({
                          ...previous,
                          node: new Set(),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex min-w-0 basis-[65%] flex-col border-l border-dashed border-border/80">
                  <h3 className="triage-shell__subsection-heading flex items-center justify-between gap-2">
                    <span>
                      {formatStagingHeading(
                        INBOX_TRIAGE_COPY.sectionNames.stagingBits,
                        stagedCandidateCounts.bits,
                      )}
                    </span>
                    {newCandidateIds.bit.size > 0 ? (
                      <button
                        aria-label={INBOX_TRIAGE_COPY.stagingStatus.actions.showBits}
                        className="staging-arrival-count"
                        type="button"
                        onClick={() => showNewCandidates("bit")}
                      >
                        {newCandidateIds.bit.size === 1
                          ? INBOX_TRIAGE_COPY.stagingStatus.arrival.one
                          : INBOX_TRIAGE_COPY.stagingStatus.arrival.many.replace(
                              "{count}",
                              String(newCandidateIds.bit.size),
                            )}
                      </button>
                    ) : null}
                  </h3>
                  <div
                    className="flex min-h-0 flex-1 overflow-y-auto p-3"
                    data-triage-role="internal-scroll-viewport"
                  >
                    <StagingZone
                      activeDragItem={activeDragItem}
                      newCandidateIds={newCandidateIds.bit}
                      overTargetId={overTargetId}
                      projection={stagingProjectionByType.bit}
                      type="bit"
                      onObservedTop={() =>
                        setNewCandidateIds((previous) => ({
                          ...previous,
                          bit: new Set(),
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              <TriageRemoveDropTarget
                activeDragItem={activeDragItem}
                overTargetId={overTargetId}
              />
            </section>
          </div>

          <DragOverlay dropAnimation={null} modifiers={[snapDragTokenToCursor]}>
            {activeDragItem ? <TriageDragToken item={activeDragItem} /> : null}
          </DragOverlay>

          <section
            aria-labelledby="triage-grid-explorer-heading"
            className="flex min-h-0 flex-col bg-background"
            data-triage-role="section-surface"
            data-triage-state="default"
            inert={isDepartureDecision ? true : undefined}
          >
            <h2
              className="triage-shell__section-heading"
              data-triage-role="section-header"
              id="triage-grid-explorer-heading"
              tabIndex={-1}
            >
              {INBOX_TRIAGE_COPY.sectionNames.gridExplorer}
            </h2>
            <div
              className="flex min-h-0 flex-1 overflow-hidden"
              data-triage-role="internal-scroll-viewport"
            >
              <HierarchyExplorer
                activeDragItem={activeDragItem}
                onPendingPlacementInvalidated={handlePendingPlacementInvalidated}
                onPointerGeometryChange={refreshRenderedTarget}
                overTargetId={overTargetId}
                pendingPlacementDropId={pendingPlacement?.dropId ?? null}
                localPlacementResult={localPlacementResult}
                targetFeedback={targetFeedback}
              />
            </div>
          </section>

          <PlacementConfirmationDialog
            key={pendingPlacement?.dropId ?? "none"}
            pendingPlacement={pendingPlacement}
            selectedScratchId={selectedScratchId}
            onCancel={handlePlacementCancel}
            onConfirm={handlePlacementConfirm}
          />
        </DndContext>
      </div>
      {isExternalRemoval ? (
        <ExternalScratchRemovalTransition
          destinationTitle={destinationTitle}
          drafts={externalRemovalDrafts}
          onFinish={finishExternalRemoval}
          removal={externalScratchRemoval}
        />
      ) : null}
    </section>
  );
}

function PlacementConfirmationDialog({
  onCancel,
  onConfirm,
  pendingPlacement,
  selectedScratchId,
}: {
  onCancel: () => void;
  onConfirm: (
    scratchId: string,
    confirmedType?: "node" | "bit",
  ) => Promise<void>;
  pendingPlacement: PendingPlacement;
  selectedScratchId: string | null;
}) {
  const [selectedType, setSelectedType] =
    useState<"node" | "bit" | null>(null);
  const destinationPath =
    pendingPlacement === null
      ? []
      : [...pendingPlacement.targetParentPath, pendingPlacement.targetTitle];
  const isDirectPlacement = pendingPlacement?.candidateType === null;
  const resultType = pendingPlacement?.candidateType ?? selectedType;
  const isNodeValid =
    pendingPlacement !== null &&
    (pendingPlacement.targetNodeLevel === null ||
      pendingPlacement.targetNodeLevel < 2);
  const isBitValid =
    pendingPlacement !== null && pendingPlacement.parentNodeId !== null;
  const confirmDisabled =
    (pendingPlacement?.isFull ?? false) ||
    selectedScratchId === null ||
    (isDirectPlacement && selectedType === null);

  return (
    <Dialog
      open={pendingPlacement !== null}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-md w-full overflow-y-hidden border border-border bg-popover p-6 rounded-lg"
      >
        <DialogHeader>
          <DialogTitle>Place item?</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="divide-y divide-border/50">
            <PlacementField label="Candidate">
              <div className="truncate text-sm font-medium text-foreground">
                {pendingPlacement?.candidateLabel}
              </div>
            </PlacementField>

            <PlacementField label="Type">
              {pendingPlacement !== null &&
              pendingPlacement.candidateType === null ? (
                <TypeChoiceSelector
                  isBitValid={isBitValid}
                  isNodeValid={isNodeValid}
                  selectedType={selectedType}
                  onSelect={setSelectedType}
                />
              ) : (
                <span
                  className={cn(
                    pendingPlacement?.candidateType === "node"
                      ? "bg-accent text-foreground border border-primary/50 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      : "bg-muted text-muted-foreground/80 border border-border/50 text-[10px] font-semibold px-2 py-0.5 rounded-md",
                  )}
                >
                  {pendingPlacement?.candidateType === "node" ? "Node" : "Bit"}
                </span>
              )}
            </PlacementField>

            <PlacementField label="Destination">
              <div className="flex min-w-0 items-center gap-1.5 truncate text-sm font-medium text-foreground">
                {destinationPath.map((segment, index) => (
                  <span
                    key={`${segment}-${index}`}
                    className="min-w-0 truncate"
                  >
                    {index > 0 ? "→ " : ""}
                    {segment}
                  </span>
                ))}
              </div>
            </PlacementField>

            <PlacementField label="Result">
              <div className="text-sm font-semibold text-foreground">
                {pendingPlacement === null
                  ? null
                  : resultType === "node"
                    ? `Create a node in ${pendingPlacement.targetTitle}`
                    : resultType === "bit"
                      ? `Create a bit in ${pendingPlacement.targetTitle}`
                      : "Choose a type"}
              </div>
            </PlacementField>
          </div>

          {pendingPlacement?.isFull && (
            <div className="flex items-center gap-2 rounded-md border border-muted-foreground/30 bg-muted/40 p-3">
              <AlertTriangle
                aria-hidden="true"
                className="h-4 w-4 flex-shrink-0 text-muted-foreground"
              />
              <p className="text-xs font-semibold text-muted-foreground">
                No available grid cell in this target
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            disabled={confirmDisabled}
            onClick={() => {
              if (selectedScratchId) {
                if (isDirectPlacement) {
                  void onConfirm(selectedScratchId, selectedType ?? undefined);
                  return;
                }

                void onConfirm(selectedScratchId);
              }
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TypeChoiceSelector({
  isBitValid,
  isNodeValid,
  onSelect,
  selectedType,
}: {
  isBitValid: boolean;
  isNodeValid: boolean;
  onSelect: (type: "node" | "bit") => void;
  selectedType: "node" | "bit" | null;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div
        aria-label="Select placement type"
        className="flex min-w-0 items-center gap-1.5 rounded-md border border-border/50 bg-muted/30 p-0.5"
        role="radiogroup"
      >
        <TypeChoiceOption
          disabled={!isNodeValid}
          icon={<Folder aria-hidden="true" className="h-4 w-4" />}
          label="Node"
          selected={selectedType === "node"}
          type="node"
          onSelect={onSelect}
        />
        <TypeChoiceOption
          disabled={!isBitValid}
          icon={<ListTodo aria-hidden="true" className="h-4 w-4" />}
          label="Bit"
          selected={selectedType === "bit"}
          type="bit"
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}

function TypeChoiceOption({
  disabled,
  icon,
  label,
  onSelect,
  selected,
  type,
}: {
  disabled: boolean;
  icon: ReactNode;
  label: string;
  onSelect: (type: "node" | "bit") => void;
  selected: boolean;
  type: "node" | "bit";
}) {
  return (
    <button
      aria-checked={selected ? "true" : "false"}
      aria-label={`Select ${label} type`}
      className={cn(
        "group flex min-w-0 items-center gap-1.5 rounded-md border border-transparent bg-transparent px-2 py-1 text-[10px] font-semibold text-muted-foreground/80 transition-opacity touch-action-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        disabled
          ? "cursor-not-allowed border-transparent text-muted-foreground/50 opacity-40"
          : selected
            ? "cursor-pointer border-primary bg-accent text-foreground ring-1 ring-primary"
            : "cursor-pointer hover:bg-muted hover:text-foreground",
      )}
      disabled={disabled}
      role="radio"
      type="button"
      onClick={() => onSelect(type)}
    >
      <span
        className={cn(
          "flex h-4 w-4 flex-shrink-0 items-center justify-center text-muted-foreground/50",
          disabled
            ? "text-muted-foreground/50"
            : selected
              ? "text-foreground"
              : "group-hover:text-muted-foreground/80",
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          "min-w-0 truncate text-muted-foreground/80",
          disabled
            ? "text-muted-foreground/50"
            : selected
              ? "text-foreground"
              : "group-hover:text-foreground",
        )}
      >
        {label}
      </span>
    </button>
  );
}

function PlacementField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="py-3">
      <div className="mb-1 font-mono text-[10px] font-medium uppercase text-muted-foreground/50">
        {label}
      </div>
      {children}
    </div>
  );
}
