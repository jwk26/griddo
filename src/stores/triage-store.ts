"use client";

import { create } from "zustand";

interface TriageState {
  selectedScratchId: string | null;
  selectScratch: (id: string) => void;
  clearSelection: () => void;
}

export const useTriageStore = create<TriageState>((set) => ({
  selectedScratchId: null,
  selectScratch: (id) => set({ selectedScratchId: id }),
  clearSelection: () => set({ selectedScratchId: null }),
}));
