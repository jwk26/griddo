"use client";

import { create } from "zustand";

interface EditModeState {
  isEditMode: boolean;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
}

export const useEditModeStore = create<EditModeState>((set) => ({
  isEditMode: false,
  toggle: () => set((state) => ({ isEditMode: !state.isEditMode })),
  enable: () => set({ isEditMode: true }),
  disable: () => set({ isEditMode: false }),
}));
