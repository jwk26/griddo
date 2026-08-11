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

interface TriageState {
  selectedScratchId: string | null;
  scratchPoolExpanded: boolean;
  scratchPoolManualExpandedForId: string | null;
  scratchPoolQuery: string;
  scratchPoolResultIds: string[];
  scratchPoolScroll: TriageSessionScrollPosition;
  explorerPathIds: string[];
  explorerOpenColumnIds: string[];
  explorerColumnScroll: Record<string, TriageSessionScrollPosition>;
  /** @deprecated Non-authoritative compatibility state. Task 163 removes it. */
  stagedCandidates: Record<string, StagedCandidate[]>;
  selectScratch: (id: string) => void;
  clearSelection: () => void;
  setScratchPoolExpanded: (expanded: boolean) => void;
  setScratchPoolManualExpandedForId: (id: string | null) => void;
  setScratchPoolQuery: (query: string) => void;
  setScratchPoolResultIds: (ids: string[]) => void;
  setScratchPoolScroll: (position: TriageSessionScrollPosition) => void;
  reconcileScratchPoolContext: (context: {
    activeIds: string[];
    visibleIds: string[];
  }) => void;
  setExplorerPathIds: (ids: string[]) => void;
  setExplorerOpenColumnIds: (ids: string[]) => void;
  setExplorerColumnScroll: (
    columnId: string,
    position: TriageSessionScrollPosition,
  ) => void;
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
  scratchPoolResultIds: [],
  scratchPoolScroll: { anchorId: null, offset: 0 },
  explorerPathIds: [],
  explorerOpenColumnIds: [],
  explorerColumnScroll: {},
  stagedCandidates: {},
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
      const selectedScratchId = selectionIsActive
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

      if (
        !selectionChanged &&
        resultsUnchanged &&
        scratchPoolScroll === state.scratchPoolScroll
      ) {
        return state;
      }

      return {
        selectedScratchId,
        scratchPoolManualExpandedForId: selectionChanged
          ? null
          : state.scratchPoolManualExpandedForId,
        scratchPoolResultIds: resultsUnchanged
          ? state.scratchPoolResultIds
          : visibleIds,
        scratchPoolScroll,
      };
    }),
  setExplorerPathIds: (ids) => set({ explorerPathIds: ids }),
  setExplorerOpenColumnIds: (ids) => set({ explorerOpenColumnIds: ids }),
  setExplorerColumnScroll: (columnId, position) =>
    set((state) => ({
      explorerColumnScroll: {
        ...state.explorerColumnScroll,
        [columnId]: position,
      },
    })),
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

      if (pathUnchanged && columnsUnchanged && scrollUnchanged) return state;

      return {
        explorerPathIds,
        explorerOpenColumnIds,
        explorerColumnScroll,
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
