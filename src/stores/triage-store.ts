"use client";

import { create } from "zustand";

export interface StagedCandidate {
  id: string;
  type: "node" | "bit";
  sourceBreakdownId: string;
  label: string;
}

interface TriageState {
  selectedScratchId: string | null;
  scratchPoolExpanded: boolean;
  scratchPoolManualExpandedForId: string | null;
  stagedCandidates: Record<string, StagedCandidate[]>;
  selectScratch: (id: string) => void;
  clearSelection: () => void;
  setScratchPoolExpanded: (expanded: boolean) => void;
  setScratchPoolManualExpandedForId: (id: string | null) => void;
  addStagedCandidate: (
    scratchId: string,
    candidate: StagedCandidate,
  ) => void;
  removeStagedCandidate: (scratchId: string, candidateId: string) => void;
  clearScratchCandidates: (scratchId: string) => void;
}

export const useTriageStore = create<TriageState>((set) => ({
  selectedScratchId: null,
  scratchPoolExpanded: true,
  scratchPoolManualExpandedForId: null,
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
