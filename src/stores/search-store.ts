"use client";

import { create } from "zustand";

interface SearchState {
  isOpen: boolean;
  query: string;
  setQuery: (q: string) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  query: "",
  setQuery: (q) => set({ query: q }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, query: "" }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
