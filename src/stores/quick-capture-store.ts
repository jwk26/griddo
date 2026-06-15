"use client";

import { create } from "zustand";

type Overlay = "entry" | "palette" | "scratch" | null;

interface QuickCaptureState {
  activeOverlay: Overlay;
  setActiveOverlay: (overlay: Overlay) => void;
  closeAll: () => void;
}

export const useQuickCaptureStore = create<QuickCaptureState>((set) => ({
  activeOverlay: null,
  setActiveOverlay: (overlay) => set({ activeOverlay: overlay }),
  closeAll: () => set({ activeOverlay: null }),
}));
