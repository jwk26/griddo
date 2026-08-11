"use client";

import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";

export const CREATED_AT_SORT_DIRECTIONS = ["ASC", "DESC"] as const;

export type CreatedAtSortDirection =
  (typeof CREATED_AT_SORT_DIRECTIONS)[number];

const DEFAULT_CREATED_AT_SORT: CreatedAtSortDirection = "DESC";

export const TRIAGE_PREFERENCES_PERSISTENCE_KEY =
  "griddo-triage-preferences";

export function validateCreatedAtSort(
  value: unknown,
): CreatedAtSortDirection {
  return value === "ASC" || value === "DESC"
    ? value
    : DEFAULT_CREATED_AT_SORT;
}

interface PersistedTriagePreferences {
  poolCreatedAtSort: CreatedAtSortDirection;
  breakdownCreatedAtSort: CreatedAtSortDirection;
}

interface TriagePreferencesState extends PersistedTriagePreferences {
  setPoolCreatedAtSort: (sort: CreatedAtSortDirection) => void;
  setBreakdownCreatedAtSort: (sort: CreatedAtSortDirection) => void;
}

function normalizePersistedPreferences(
  value: unknown,
): PersistedTriagePreferences {
  const preferences =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};

  return {
    poolCreatedAtSort: validateCreatedAtSort(preferences.poolCreatedAtSort),
    breakdownCreatedAtSort: validateCreatedAtSort(
      preferences.breakdownCreatedAtSort,
    ),
  };
}

function parsePersistedPreferences(raw: string): PersistedTriagePreferences {
  try {
    return normalizePersistedPreferences(JSON.parse(raw));
  } catch {
    return normalizePersistedPreferences(null);
  }
}

function serializePersistedPreferences(value: unknown): string {
  return JSON.stringify(normalizePersistedPreferences(value));
}

const triagePreferencesStorage: PersistStorage<PersistedTriagePreferences> = {
  getItem(name) {
    try {
      if (typeof localStorage === "undefined") return null;
      const raw = localStorage.getItem(name);
      if (raw === null) return null;
      const state = parsePersistedPreferences(raw);
      localStorage.setItem(name, serializePersistedPreferences(state));
      return { state };
    } catch {
      return null;
    }
  },
  setItem(name, value) {
    try {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem(
        name,
        serializePersistedPreferences({
          poolCreatedAtSort: validateCreatedAtSort(
            value.state.poolCreatedAtSort,
          ),
          breakdownCreatedAtSort: validateCreatedAtSort(
            value.state.breakdownCreatedAtSort,
          ),
        }),
      );
    } catch {
      // Device-local preferences are optional in restricted environments.
    }
  },
  removeItem(name) {
    try {
      if (typeof localStorage === "undefined") return;
      localStorage.removeItem(name);
    } catch {
      // Device-local preferences are optional in restricted environments.
    }
  },
};

export const useTriagePreferencesStore = create<TriagePreferencesState>()(
  persist<TriagePreferencesState, [], [], PersistedTriagePreferences>(
    (set) => ({
      poolCreatedAtSort: DEFAULT_CREATED_AT_SORT,
      breakdownCreatedAtSort: DEFAULT_CREATED_AT_SORT,
      setPoolCreatedAtSort: (sort) =>
        set({ poolCreatedAtSort: validateCreatedAtSort(sort) }),
      setBreakdownCreatedAtSort: (sort) =>
        set({ breakdownCreatedAtSort: validateCreatedAtSort(sort) }),
    }),
    {
      name: TRIAGE_PREFERENCES_PERSISTENCE_KEY,
      storage: triagePreferencesStorage,
      partialize: (state) => ({
        poolCreatedAtSort: state.poolCreatedAtSort,
        breakdownCreatedAtSort: state.breakdownCreatedAtSort,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...normalizePersistedPreferences(persistedState),
      }),
    },
  ),
);
