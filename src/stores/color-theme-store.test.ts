import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  COLOR_THEMES,
  COLOR_THEME_PERSISTENCE_KEY,
  isValidColorTheme,
  validateColorTheme,
  useColorThemeStore,
} from "./color-theme-store";

// Node.js 26 defines localStorage as undefined, preventing jsdom from overriding it.
// We install a mock via beforeAll so the persist subscriber (wired at store creation)
// can write to localStorage for subsequent setColorTheme calls.
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => { store[key] = value; },
    removeItem: (key: string): void => { delete store[key]; },
    clear: (): void => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number): string | null => Object.keys(store)[index] ?? null,
  };
})();

beforeAll(() => {
  vi.stubGlobal("localStorage", localStorageMock);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  localStorageMock.clear();
  useColorThemeStore.setState({ colorTheme: "griddo" });
});

afterEach(() => {
  localStorageMock.clear();
});

describe("color-theme-store", () => {
  describe("COLOR_THEMES", () => {
    it("contains exactly 8 theme ids", () => {
      expect(COLOR_THEMES).toHaveLength(8);
    });

    it("includes all required theme ids", () => {
      const expected = [
        "griddo",
        "tiny-desk",
        "neumorphism",
        "claymorphism",
        "origami",
        "terminal",
        "retro-mac",
        "graphite",
      ];
      for (const id of expected) {
        expect(COLOR_THEMES).toContain(id);
      }
    });
  });

  describe("COLOR_THEME_PERSISTENCE_KEY", () => {
    it("is griddo-color-theme", () => {
      expect(COLOR_THEME_PERSISTENCE_KEY).toBe("griddo-color-theme");
    });
  });

  describe("isValidColorTheme", () => {
    it("returns true for every allowed theme id", () => {
      for (const theme of COLOR_THEMES) {
        expect(isValidColorTheme(theme)).toBe(true);
      }
    });

    it("returns false for an unknown string", () => {
      expect(isValidColorTheme("unknown-theme")).toBe(false);
    });

    it("returns false for null, undefined, and number", () => {
      expect(isValidColorTheme(null)).toBe(false);
      expect(isValidColorTheme(undefined)).toBe(false);
      expect(isValidColorTheme(42)).toBe(false);
    });
  });

  describe("validateColorTheme", () => {
    it("returns the value when it is a valid theme id", () => {
      expect(validateColorTheme("griddo")).toBe("griddo");
      expect(validateColorTheme("terminal")).toBe("terminal");
      expect(validateColorTheme("retro-mac")).toBe("retro-mac");
    });

    it("falls back to griddo for an invalid string", () => {
      expect(validateColorTheme("not-a-theme")).toBe("griddo");
    });

    it("falls back to griddo for null, undefined, and number", () => {
      expect(validateColorTheme(null)).toBe("griddo");
      expect(validateColorTheme(undefined)).toBe("griddo");
      expect(validateColorTheme(42)).toBe("griddo");
    });
  });

  describe("useColorThemeStore", () => {
    it("has griddo as the default colorTheme", () => {
      expect(useColorThemeStore.getState().colorTheme).toBe("griddo");
    });

    it("updates colorTheme when setColorTheme is called with a valid theme", () => {
      useColorThemeStore.getState().setColorTheme("terminal");
      expect(useColorThemeStore.getState().colorTheme).toBe("terminal");
    });

    it("accepts every allowed theme id without error", () => {
      for (const theme of COLOR_THEMES) {
        useColorThemeStore.getState().setColorTheme(theme);
        expect(useColorThemeStore.getState().colorTheme).toBe(theme);
      }
    });

    it("falls back to griddo in store state when an invalid value is set", () => {
      useColorThemeStore.getState().setColorTheme("not-a-theme" as never);
      expect(useColorThemeStore.getState().colorTheme).toBe("griddo");
    });

    it("persists the selected theme id as a plain string at the correct key", () => {
      useColorThemeStore.getState().setColorTheme("origami");
      expect(localStorage.getItem(COLOR_THEME_PERSISTENCE_KEY)).toBe("origami");
    });

    it("persists griddo to localStorage when an invalid value is set", () => {
      useColorThemeStore.getState().setColorTheme("bad-theme" as never);
      expect(localStorage.getItem(COLOR_THEME_PERSISTENCE_KEY)).toBe("griddo");
    });

    it("updates the persisted value on each theme change", () => {
      useColorThemeStore.getState().setColorTheme("terminal");
      expect(localStorage.getItem(COLOR_THEME_PERSISTENCE_KEY)).toBe("terminal");

      useColorThemeStore.getState().setColorTheme("graphite");
      expect(localStorage.getItem(COLOR_THEME_PERSISTENCE_KEY)).toBe("graphite");
    });

    it("hydrates from a valid persisted theme id (simulates page refresh)", async () => {
      localStorage.setItem(COLOR_THEME_PERSISTENCE_KEY, "graphite");
      await useColorThemeStore.persist.rehydrate();
      expect(useColorThemeStore.getState().colorTheme).toBe("graphite");
    });

    it("falls back to griddo when localStorage contains an invalid value at hydration", async () => {
      localStorage.setItem(COLOR_THEME_PERSISTENCE_KEY, "not-a-theme");
      await useColorThemeStore.persist.rehydrate();
      expect(useColorThemeStore.getState().colorTheme).toBe("griddo");
    });
  });
});
