"use client";

import { DndContext, DragOverlay, useDroppable, type Modifier } from "@dnd-kit/core";
import { liveQuery } from "dexie";
import { AlertTriangle, Folder, ListTodo, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
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
import { BreakdownPanel } from "@/components/triage/breakdown-panel";
import { HierarchyExplorer } from "@/components/triage/hierarchy-explorer";
import { ScratchPool } from "@/components/triage/scratch-pool";
import { TriageDragToken } from "@/components/triage/triage-drag-token";
import { StagingZone } from "@/components/triage/staging-zone";
import {
  useTriageDnd,
  type PendingPlacement,
  type TriageDragItem,
} from "@/hooks/use-dnd";
import { useStagedCandidates } from "@/hooks/use-staged-candidates";
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
  triageCollisionDetection,
  type TriageDropData,
} from "@/lib/grid-dnd";
import { INBOX_TRIAGE_COPY } from "@/lib/copy/inbox-triage";
import { getDataStore } from "@/lib/db/datastore";
import { cn } from "@/lib/utils";
import { useTriagePreferencesStore } from "@/stores/triage-preferences-store";
import { useTriageStore } from "@/stores/triage-store";
import type { ExternalScratchRemovalState } from "@/stores/triage-store";
import type { Node } from "@/types";

function formatStagingHeading(label: string, count: number) {
  return count >= 2 ? `${count} ${label}` : label;
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
  const observedLifecycleRef = useRef<{
    scratchId: string;
    lifecycle: "archive" | "delete";
  } | null>(null);

  useEffect(() => {
    return registerActiveTriageDeparture(departure);
  }, [departure]);

  useEffect(() => {
    if (selectedScratchId === null) return;
    const scratchId = selectedScratchId;
    const subscription = liveQuery(async () => {
      const dataStore = await getDataStore();
      return dataStore.getBit(scratchId);
    }).subscribe({
      next: (scratch) => {
        const lifecycle =
          scratch?.archivedAt !== null && scratch?.archivedAt !== undefined
            ? "archive"
            : scratch === undefined || scratch.deletedAt !== null
              ? "delete"
              : null;
        if (lifecycle === null) return;
        observedLifecycleRef.current = { scratchId, lifecycle };
        if (
          useTriageStore.getState().externalScratchRemoval?.scratchId ===
          scratchId
        ) {
          setExternalScratchRemovalLifecycle(scratchId, lifecycle);
        }
      },
      error: (error) =>
        console.error("selected Scratch lifecycle error:", error),
    });
    return () => subscription.unsubscribe();
  }, [selectedScratchId, setExternalScratchRemovalLifecycle]);

  useEffect(() => {
    if (externalScratchRemoval === null) {
      observedLifecycleRef.current = null;
      return;
    }
    if (externalScratchRemoval.lifecycle !== null) {
      return;
    }
    const scratchId = externalScratchRemoval.scratchId;
    const observed = observedLifecycleRef.current;
    if (observed?.scratchId === scratchId) {
      setExternalScratchRemovalLifecycle(scratchId, observed.lifecycle);
      return;
    }
    let cancelled = false;
    void (async () => {
      const dataStore = await getDataStore();
      const scratch = await dataStore.getBit(scratchId);
      if (cancelled) return;
      const lifecycle =
        scratch?.archivedAt !== null && scratch?.archivedAt !== undefined
          ? "archive"
          : "delete";
      observedLifecycleRef.current = { scratchId, lifecycle };
      setExternalScratchRemovalLifecycle(scratchId, lifecycle);
    })().catch((error) =>
      console.error("external Scratch lifecycle error:", error),
    );
    return () => {
      cancelled = true;
    };
  }, [externalScratchRemoval, setExternalScratchRemovalLifecycle]);

  return (
    <TriageOperationLockContext.Provider value={operationLock}>
      <TriageDepartureContext.Provider value={departure}>
        <ScratchTitleBlockerContext.Provider value={titleBlockerHandle}>
          <TriageWorkspaceContent
            departure={departure}
            isDepartureDecision={departure.pendingDestination !== null}
            node={node}
            operationLock={operationLock}
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
}: {
  departure: ReturnType<typeof useTriageDeparture>;
  isDepartureDecision: boolean;
  node: Node;
  operationLock: ReturnType<typeof useTriageOperationLock>;
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
  const { counts: stagedCandidateCounts } =
    useStagedCandidates(selectedScratchId);
  const addStagedCandidate = useTriageStore(
    (state) => state.addStagedCandidate,
  );
  const removeStagedCandidate = useTriageStore(
    (state) => state.removeStagedCandidate,
  );
  const {
    activeDragItem,
    handleDragEnd,
    handleDragOver,
    handlePlacementCancel,
    handlePlacementConfirm,
    handleDragStart,
    overTargetId,
    pendingPlacement,
    sensors,
  } = useTriageDnd(selectedScratchId, {
    addStagedCandidate,
    removeStagedCandidate,
  });

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
    const dataStore = await getDataStore();
    const projectedActiveScratchBits = await dataStore.getBits(node.id);
    const source = await dataStore.getBit(removal.scratchId);
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
          collisionDetection={triageCollisionDetection}
          sensors={sensors}
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
                <BreakdownPanel key={selectedScratchId ?? "none"} />
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
              <div
                className="triage-shell__staging min-h-0 flex-1"
                data-layout-ratio="35/65"
                data-testid="triage-staging-columns"
              >
                <div className="flex min-w-0 basis-[35%] flex-col">
                  <h3 className="triage-shell__subsection-heading">
                    {formatStagingHeading(
                      INBOX_TRIAGE_COPY.sectionNames.stagingNodes,
                      stagedCandidateCounts.nodes,
                    )}
                  </h3>
                  <div
                    className="flex min-h-0 flex-1 overflow-y-auto p-3"
                    data-triage-role="internal-scroll-viewport"
                  >
                    <StagingZone
                      activeDragItem={activeDragItem}
                      overTargetId={overTargetId}
                      type="node"
                    />
                  </div>
                </div>

                <div className="flex min-w-0 basis-[65%] flex-col border-l border-dashed border-border/80">
                  <h3 className="triage-shell__subsection-heading">
                    {formatStagingHeading(
                      INBOX_TRIAGE_COPY.sectionNames.stagingBits,
                      stagedCandidateCounts.bits,
                    )}
                  </h3>
                  <div
                    className="flex min-h-0 flex-1 overflow-y-auto p-3"
                    data-triage-role="internal-scroll-viewport"
                  >
                    <StagingZone
                      activeDragItem={activeDragItem}
                      overTargetId={overTargetId}
                      type="bit"
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
                onPendingPlacementInvalidated={handlePlacementCancel}
                overTargetId={overTargetId}
                pendingPlacementDropId={pendingPlacement?.dropId ?? null}
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
