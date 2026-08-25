"use client";

import { create } from "zustand";

export interface StagedCandidate {
  id: string;
  type: "node" | "bit";
  sourceBreakdownId: string;
  label: string;
}

export interface TriageSessionScrollPosition {
  anchorId: string | null;
  offset: number;
}

export type ExplorerPathStatusKind = "unavailable" | "archived" | "moved" | "stale-placement";

export interface ExplorerPathStatusState {
  kind: ExplorerPathStatusKind;
  title: string | null;
  destination: string;
  columnId: string;
  fallbackPathIds: string[];
}

export type ExternalScratchRemovalLifecycle = "archive" | "delete";
export type ExternalScratchRemovalDestinationKind =
  | "scratch"
  | "search-empty"
  | "inbox-empty";

export interface ExternalScratchRemovalState {
  scratchId: string;
  lifecycle: ExternalScratchRemovalLifecycle | null;
  destinationId: string | null;
  destinationKind: ExternalScratchRemovalDestinationKind;
  removalOrder: string[];
}

export type ExternalScratchRemovalDestination = Readonly<{
  id: string | null;
  kind: ExternalScratchRemovalDestinationKind;
}>;

type ScratchPoolContext = {
  activeIds: string[];
  visibleIds: string[];
};

function resolveExternalRemovalDestination(
  removalOrder: string[],
  scratchId: string,
  { activeIds, visibleIds }: ScratchPoolContext,
): ExternalScratchRemovalDestination {
  const visibleIdSet = new Set(visibleIds);
  const sourceIndex = removalOrder.indexOf(scratchId);
  if (sourceIndex >= 0) {
    for (let index = sourceIndex + 1; index < removalOrder.length; index += 1) {
      const id = removalOrder[index];
      if (id !== undefined && visibleIdSet.has(id)) return { id, kind: "scratch" };
    }
    for (let index = sourceIndex - 1; index >= 0; index -= 1) {
      const id = removalOrder[index];
      if (id !== undefined && visibleIdSet.has(id)) return { id, kind: "scratch" };
    }
  }

  const replacement = visibleIds[0];
  if (replacement !== undefined) return { id: replacement, kind: "scratch" };
  return {
    id: null,
    kind: activeIds.length > 0 ? "search-empty" : "inbox-empty",
  };
}

interface TriageState {
  selectedScratchId: string | null;
  scratchPoolExpanded: boolean;
  scratchPoolManualExpandedForId: string | null;
  scratchPoolQuery: string;
  scratchPoolActiveIds: string[];
  scratchPoolResultIds: string[];
  scratchPoolScroll: TriageSessionScrollPosition;
  explorerPathIds: string[];
  explorerOpenColumnIds: string[];
  explorerColumnScroll: Record<string, TriageSessionScrollPosition>;
  explorerRemoteArrivalIds: Record<string, string[]>;
  explorerPathStatus: ExplorerPathStatusState | null;
  /** @deprecated Non-authoritative compatibility state. Task 163 removes it. */
  stagedCandidates: Record<string, StagedCandidate[]>;
  externalScratchRemoval: ExternalScratchRemovalState | null;
  selectScratch: (id: string) => void;
  clearSelection: () => void;
  setScratchPoolExpanded: (expanded: boolean) => void;
  setScratchPoolManualExpandedForId: (id: string | null) => void;
  setScratchPoolQuery: (query: string) => void;
  setScratchPoolResultIds: (ids: string[]) => void;
  setScratchPoolScroll: (position: TriageSessionScrollPosition) => void;
  reconcileScratchPoolContext: (context: ScratchPoolContext) => void;
  setExternalScratchRemovalLifecycle: (
    scratchId: string,
    lifecycle: ExternalScratchRemovalLifecycle,
  ) => void;
  finishExternalScratchRemoval: (
    context: ScratchPoolContext,
  ) => ExternalScratchRemovalDestination | null;
  setExplorerPathIds: (ids: string[]) => void;
  setExplorerOpenColumnIds: (ids: string[]) => void;
  setExplorerColumnScroll: (
    columnId: string,
    position: TriageSessionScrollPosition,
  ) => void;
  recordExplorerRemoteArrivals: (columnId: string, ids: string[]) => void;
  removeExplorerRemoteArrival: (identity: { id: string; type: "node" | "bit" }) => void;
  clearExplorerRemoteArrivals: (columnId: string) => void;
  setExplorerPathStatus: (status: ExplorerPathStatusState) => void;
  clearExplorerPathStatus: () => void;
  clearExplorerRemotePresentation: () => void;
  reconcileExplorerContext: (context: {
    validPathIds: string[];
    visibleItemIdsByColumn: Record<string, string[]>;
  }) => void;
  /** @deprecated Non-authoritative compatibility action. Task 163 removes it. */
  addStagedCandidate: (
    scratchId: string,
    candidate: StagedCandidate,
  ) => void;
  /** @deprecated Non-authoritative compatibility action. Task 163 removes it. */
  removeStagedCandidate: (scratchId: string, candidateId: string) => void;
  /** @deprecated Non-authoritative compatibility action. Task 163 removes it. */
  clearScratchCandidates: (scratchId: string) => void;
}

export const useTriageStore = create<TriageState>((set) => ({
  selectedScratchId: null,
  scratchPoolExpanded: true,
  scratchPoolManualExpandedForId: null,
  scratchPoolQuery: "",
  scratchPoolActiveIds: [],
  scratchPoolResultIds: [],
  scratchPoolScroll: { anchorId: null, offset: 0 },
  explorerPathIds: [],
  explorerOpenColumnIds: [],
  explorerColumnScroll: {},
  explorerRemoteArrivalIds: {},
  explorerPathStatus: null,
  stagedCandidates: {},
  externalScratchRemoval: null,
  selectScratch: (id) =>
    set((state) => ({
      selectedScratchId: id,
      scratchPoolManualExpandedForId:
        state.selectedScratchId === id
          ? state.scratchPoolManualExpandedForId
          : null,
    })),
  clearSelection: () =>
    set({ selectedScratchId: null, scratchPoolManualExpandedForId: null }),
  setScratchPoolExpanded: (expanded) =>
    set(
      expanded
        ? { scratchPoolExpanded: true }
        : {
            scratchPoolExpanded: false,
            scratchPoolManualExpandedForId: null,
          },
    ),
  setScratchPoolManualExpandedForId: (id) =>
    set({ scratchPoolManualExpandedForId: id }),
  setScratchPoolQuery: (query) => set({ scratchPoolQuery: query }),
  setScratchPoolResultIds: (ids) => set({ scratchPoolResultIds: ids }),
  setScratchPoolScroll: (position) => set({ scratchPoolScroll: position }),
  reconcileScratchPoolContext: ({ activeIds, visibleIds }) =>
    set((state) => {
      const selectionIsActive =
        state.selectedScratchId !== null &&
        activeIds.includes(state.selectedScratchId);
      const selectedWasObservedActive =
        state.selectedScratchId !== null &&
        state.scratchPoolActiveIds.includes(state.selectedScratchId);
      const restoredExternalSelection =
        selectionIsActive &&
        state.externalScratchRemoval?.scratchId === state.selectedScratchId &&
        state.externalScratchRemoval.lifecycle === "archive";
      const shouldHoldExternalRemoval =
        state.selectedScratchId !== null &&
        !restoredExternalSelection &&
        (state.externalScratchRemoval !== null ||
          (!selectionIsActive && selectedWasObservedActive));
      const destinationContext = shouldHoldExternalRemoval
        ? {
            activeIds: activeIds.filter((id) => id !== state.selectedScratchId),
            visibleIds: visibleIds.filter((id) => id !== state.selectedScratchId),
          }
        : { activeIds, visibleIds };
      const removalOrder =
        state.externalScratchRemoval?.removalOrder ??
        (state.scratchPoolResultIds.includes(state.selectedScratchId ?? "")
          ? state.scratchPoolResultIds
          : [state.selectedScratchId, ...state.scratchPoolResultIds].filter(
              (id): id is string => id !== null,
            ));
      const destination =
        shouldHoldExternalRemoval && state.selectedScratchId !== null
          ? resolveExternalRemovalDestination(
              removalOrder,
              state.selectedScratchId,
              destinationContext,
            )
          : null;
      const externalScratchRemoval = restoredExternalSelection
        ? null
        : destination === null || state.selectedScratchId === null
          ? state.externalScratchRemoval
          : {
              scratchId: state.selectedScratchId,
              lifecycle: state.externalScratchRemoval?.lifecycle ?? null,
              destinationId: destination.id,
              destinationKind: destination.kind,
              removalOrder,
            };
      const selectedScratchId =
        selectionIsActive || shouldHoldExternalRemoval
          ? state.selectedScratchId
          : (visibleIds[0] ?? null);
      const selectionChanged = selectedScratchId !== state.selectedScratchId;
      const scrollAnchorIsVisible =
        state.scratchPoolScroll.anchorId !== null &&
        visibleIds.includes(state.scratchPoolScroll.anchorId);
      const scratchPoolScroll = scrollAnchorIsVisible
        ? state.scratchPoolScroll
        : { anchorId: visibleIds[0] ?? null, offset: 0 };
      const resultsUnchanged =
        state.scratchPoolResultIds.length === visibleIds.length &&
            state.scratchPoolResultIds.every((id, index) => id === visibleIds[index]);
      const activeIdsUnchanged =
        state.scratchPoolActiveIds.length === activeIds.length &&
        state.scratchPoolActiveIds.every((id, index) => id === activeIds[index]);

      if (
        !selectionChanged &&
        externalScratchRemoval === state.externalScratchRemoval &&
        activeIdsUnchanged &&
        resultsUnchanged &&
        scratchPoolScroll === state.scratchPoolScroll
      ) {
        return state;
      }

      return {
        selectedScratchId,
        externalScratchRemoval,
        scratchPoolActiveIds: activeIdsUnchanged
          ? state.scratchPoolActiveIds
          : activeIds,
        scratchPoolManualExpandedForId: selectionChanged
          ? null
          : state.scratchPoolManualExpandedForId,
        scratchPoolResultIds: resultsUnchanged
          ? state.scratchPoolResultIds
          : visibleIds,
        scratchPoolScroll,
      };
    }),
  setExternalScratchRemovalLifecycle: (scratchId, lifecycle) =>
    set((state) =>
      state.externalScratchRemoval?.scratchId === scratchId
        ? {
            externalScratchRemoval: {
              ...state.externalScratchRemoval,
              lifecycle,
            },
          }
        : state,
    ),
  finishExternalScratchRemoval: (context) => {
    let terminalDestination: ExternalScratchRemovalDestination | null = null;
    set((state) => {
      const removal = state.externalScratchRemoval;
      if (removal === null) return state;
      terminalDestination = resolveExternalRemovalDestination(
        removal.removalOrder,
        removal.scratchId,
        {
          activeIds: context.activeIds.filter((id) => id !== removal.scratchId),
          visibleIds: context.visibleIds.filter((id) => id !== removal.scratchId),
        },
      );
      return {
        selectedScratchId: terminalDestination.id,
        scratchPoolManualExpandedForId: null,
        externalScratchRemoval: null,
      };
    });
    return terminalDestination;
  },
  setExplorerPathIds: (ids) =>
    set((state) => {
      const unchanged =
        ids.length === state.explorerPathIds.length &&
        ids.every((id, index) => id === state.explorerPathIds[index]);
      return unchanged
        ? state
        : {
            explorerPathIds: ids,
            explorerRemoteArrivalIds: {},
            explorerPathStatus: null,
          };
    }),
  setExplorerOpenColumnIds: (ids) => set({ explorerOpenColumnIds: ids }),
  setExplorerColumnScroll: (columnId, position) =>
    set((state) => ({
      explorerColumnScroll: {
        ...state.explorerColumnScroll,
        [columnId]: position,
      },
    })),
  recordExplorerRemoteArrivals: (columnId, ids) =>
    set((state) => {
      if (ids.length === 0) return state;
      const previous = state.explorerRemoteArrivalIds[columnId] ?? [];
      const next = [...new Set([...previous, ...ids])];
      if (next.length === previous.length) return state;
      return {
        explorerRemoteArrivalIds: {
          ...state.explorerRemoteArrivalIds,
          [columnId]: next,
        },
      };
    }),
  removeExplorerRemoteArrival: ({ id }) =>
    set((state) => {
      let changed = false;
      const next: Record<string, string[]> = {};
      for (const [columnId, ids] of Object.entries(
        state.explorerRemoteArrivalIds,
      )) {
        const filtered = ids.filter((arrivalId) => arrivalId !== id);
        if (filtered.length !== ids.length) changed = true;
        if (filtered.length > 0) next[columnId] = filtered;
      }
      return changed ? { explorerRemoteArrivalIds: next } : state;
    }),
  clearExplorerRemoteArrivals: (columnId) =>
    set((state) => {
      if (state.explorerRemoteArrivalIds[columnId] === undefined) return state;
      const next = { ...state.explorerRemoteArrivalIds };
      delete next[columnId];
      return { explorerRemoteArrivalIds: next };
    }),
  setExplorerPathStatus: (status) => set({ explorerPathStatus: status }),
  clearExplorerPathStatus: () => set({ explorerPathStatus: null }),
  clearExplorerRemotePresentation: () =>
    set({ explorerRemoteArrivalIds: {}, explorerPathStatus: null }),
  reconcileExplorerContext: ({ validPathIds, visibleItemIdsByColumn }) =>
    set((state) => {
      let validPrefixLength = 0;
      while (
        validPrefixLength < state.explorerPathIds.length &&
        validPrefixLength < validPathIds.length &&
        state.explorerPathIds[validPrefixLength] ===
          validPathIds[validPrefixLength]
      ) {
        validPrefixLength += 1;
      }

      const explorerPathIds = state.explorerPathIds.slice(0, validPrefixLength);
      const explorerOpenColumnIds = ["home", ...explorerPathIds];
      const explorerColumnScroll: Record<
        string,
        TriageSessionScrollPosition
      > = {};

      for (const columnId of explorerOpenColumnIds) {
        const previous = state.explorerColumnScroll[columnId];
        if (previous === undefined) continue;

        const visibleIds = visibleItemIdsByColumn[columnId];
        explorerColumnScroll[columnId] =
          previous.anchorId === null && previous.offset === 0
            ? previous
            : previous.anchorId !== null &&
                visibleIds?.includes(previous.anchorId)
              ? previous
              : { anchorId: null, offset: 0 };
      }

      const explorerRemoteArrivalIds = Object.fromEntries(
        Object.entries(state.explorerRemoteArrivalIds).filter(([columnId]) =>
          explorerOpenColumnIds.includes(columnId),
        ),
      );
      const explorerPathStatus =
        state.explorerPathStatus === null ||
        explorerOpenColumnIds.includes(state.explorerPathStatus.columnId)
          ? state.explorerPathStatus
          : null;

      const pathUnchanged =
        explorerPathIds.length === state.explorerPathIds.length;
      const columnsUnchanged =
        explorerOpenColumnIds.length === state.explorerOpenColumnIds.length &&
        explorerOpenColumnIds.every(
          (columnId, index) => columnId === state.explorerOpenColumnIds[index],
        );
      const previousScrollKeys = Object.keys(state.explorerColumnScroll);
      const nextScrollKeys = Object.keys(explorerColumnScroll);
      const scrollUnchanged =
        previousScrollKeys.length === nextScrollKeys.length &&
        nextScrollKeys.every(
          (columnId) =>
            explorerColumnScroll[columnId] ===
            state.explorerColumnScroll[columnId],
        );

      const previousArrivalColumns = Object.keys(
        state.explorerRemoteArrivalIds,
      );
      const nextArrivalColumns = Object.keys(explorerRemoteArrivalIds);
      const arrivalsUnchanged =
        previousArrivalColumns.length === nextArrivalColumns.length &&
        nextArrivalColumns.every(
          (columnId) =>
            explorerRemoteArrivalIds[columnId] ===
            state.explorerRemoteArrivalIds[columnId],
        );

      if (
        pathUnchanged &&
        columnsUnchanged &&
        scrollUnchanged &&
        arrivalsUnchanged &&
        explorerPathStatus === state.explorerPathStatus
      ) {
        return state;
      }

      return {
        explorerPathIds,
        explorerOpenColumnIds,
        explorerColumnScroll,
        explorerRemoteArrivalIds,
        explorerPathStatus,
      };
    }),
  addStagedCandidate: (scratchId, candidate) =>
    set((state) => ({
      stagedCandidates: {
        ...state.stagedCandidates,
        [scratchId]: [...(state.stagedCandidates[scratchId] ?? []), candidate],
      },
    })),
  removeStagedCandidate: (scratchId, candidateId) =>
    set((state) => {
      const candidates = state.stagedCandidates[scratchId];
      if (candidates === undefined) {
        return { stagedCandidates: state.stagedCandidates };
      }

      return {
        stagedCandidates: {
          ...state.stagedCandidates,
          [scratchId]: candidates.filter(
            (candidate) => candidate.id !== candidateId,
          ),
        },
      };
    }),
  clearScratchCandidates: (scratchId) =>
    set((state) => {
      const remainingCandidates = { ...state.stagedCandidates };
      delete remainingCandidates[scratchId];
      return { stagedCandidates: remainingCandidates };
    }),
}));
