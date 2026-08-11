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
  setExplorerPathIds: (ids: string[]) => void;
  setExplorerOpenColumnIds: (ids: string[]) => void;
  setExplorerColumnScroll: (
    columnId: string,
    position: TriageSessionScrollPosition,
  ) => void;
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
  selectScratch: (id) => set({ selectedScratchId: id }),
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
  setExplorerPathIds: (ids) => set({ explorerPathIds: ids }),
  setExplorerOpenColumnIds: (ids) => set({ explorerOpenColumnIds: ids }),
  setExplorerColumnScroll: (columnId, position) =>
    set((state) => ({
      explorerColumnScroll: {
        ...state.explorerColumnScroll,
        [columnId]: position,
      },
    })),
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
