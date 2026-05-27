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

export type ColorTheme = (typeof COLOR_THEMES)[number];

type ThemeState = {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
};

function isColorTheme(value: unknown): value is ColorTheme {
  return typeof value === "string" && COLOR_THEMES.includes(value as ColorTheme);
}

export const useColorThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      colorTheme: "griddo",
      setColorTheme: (theme) => set({ colorTheme: theme }),
    }),
    {
      name: "griddo-color-theme",
      partialize: (state) => ({ colorTheme: state.colorTheme }),
      merge: (persisted, current) => {
        const persistedTheme =
          typeof persisted === "object" && persisted !== null && "colorTheme" in persisted
            ? (persisted as { colorTheme?: unknown }).colorTheme
            : null;

        return {
          ...current,
          colorTheme: isColorTheme(persistedTheme) ? persistedTheme : current.colorTheme,
        };
      },
    },
  ),
);
