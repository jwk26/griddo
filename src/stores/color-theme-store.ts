"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const COLOR_THEMES = [
  "griddo",
  "tiny-desk",
  "neumorphism",
  "claymorphism",
  "origami",
  "terminal",
  "retro-mac",
  "graphite",
] as const;

export type ColorThemeId = (typeof COLOR_THEMES)[number];

const DEFAULT_THEME: ColorThemeId = "griddo";

export const COLOR_THEME_PERSISTENCE_KEY = "griddo-color-theme";

export function isValidColorTheme(value: unknown): value is ColorThemeId {
  return (COLOR_THEMES as ReadonlyArray<unknown>).includes(value);
}

export function validateColorTheme(value: unknown): ColorThemeId {
  return isValidColorTheme(value) ? value : DEFAULT_THEME;
}

interface ColorThemeState {
  colorTheme: ColorThemeId;
  setColorTheme: (theme: ColorThemeId) => void;
}

export const useColorThemeStore = create<ColorThemeState>()(
  persist(
    (set) => ({
      colorTheme: DEFAULT_THEME,
      setColorTheme: (theme) => set({ colorTheme: validateColorTheme(theme) }),
    }),
    {
      name: COLOR_THEME_PERSISTENCE_KEY,
      partialize: (state) => ({ colorTheme: state.colorTheme }),
      // Store just the theme id string so the no-flash init script can read it directly.
      // Each accessor guards against SSR / Node.js environments where localStorage
      // may be undefined or restricted.
      storage: {
        getItem(name) {
          try {
            if (typeof localStorage === "undefined") return null;
            const raw = localStorage.getItem(name);
            if (!raw) return null;
            return { state: { colorTheme: validateColorTheme(raw) } };
          } catch {
            return null;
          }
        },
        setItem(name, value) {
          try {
            if (typeof localStorage === "undefined") return;
            localStorage.setItem(name, value.state.colorTheme);
          } catch {
            // no-op in SSR or restricted environments
          }
        },
        removeItem(name) {
          try {
            if (typeof localStorage === "undefined") return;
            localStorage.removeItem(name);
          } catch {
            // no-op
          }
        },
      },
    }
  )
);
