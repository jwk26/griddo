import { create } from "zustand";

type BreadcrumbZoneState = {
  blockedCells: Set<string>;
  setBlockedCells: (cells: Set<string>) => void;
};

export const useBreadcrumbZoneStore = create<BreadcrumbZoneState>((set) => ({
  blockedCells: new Set(),
  setBlockedCells: (cells) => set({ blockedCells: cells }),
}));
