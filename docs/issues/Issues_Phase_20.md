# Phase 20 — Batch 2 Theme System & Themed Grid

> **Branch:** `phase-20/color-theme-runtime`
> **Tasks:** T89, T90, T91, T92

---

## Planning Gate Note

`docs/reviews/phase-20-flow-review.md` — per user waiver at session start, `docs/reviews/amendment-batch2-theme-calendar-inbox-flow-review.md` (Phases 20–22 combined) satisfies the Phase 20 flow-review gate. No per-phase review doc required.

---

## Docs Branch Pre-merge

`docs/batch-2-pre-promotion` was not yet merged to `main` at Phase 20 kickoff (Phase 20 task definitions and canonical references existed only on that branch). Merged via PR #31 before creating the implementation branch, so `phase-20/color-theme-runtime` is correctly based on `origin/main` with all Batch 2 canonical docs.

---

## Phase-local Question Resolution

| # | Question | Resolution | Status |
|---|----------|------------|--------|
| Q1 | Node.js v26 defines `localStorage` as `undefined` globally; vitest's jsdom cannot override it, causing `localStorage.clear()` to throw in `beforeEach`. | Introduced `localStorageMock` in test file with `vi.stubGlobal("localStorage", localStorageMock)` in `beforeAll`. Persist subscriber wires at store creation and uses the stub for subsequent writes. | Resolved |
| Q2 | Custom storage adapter called `localStorage` directly without guard; triggered warning during `pnpm build` static generation. | Added `typeof localStorage === "undefined"` guard + `try/catch` to `getItem`/`setItem`/`removeItem` so SSR/static paths return null/no-op without throwing. | Resolved |
| Q3 | Initial test suite covered setter behavior and persistence writes but not the "refresh 후 유지" (hydration) acceptance criterion. | Added two `persist.rehydrate()` tests: valid stored id hydrates correctly; invalid stored id falls back to `griddo`. | Resolved |

---

## Open Items

| ID | Category | Description | Status |
|----|----------|-------------|--------|
| ISSUE-20-01 | Deferred/Low | no-flash script in `layout.tsx` duplicates the 8-theme id list and persistence key from `color-theme-store.ts`. Values are in sync now but could drift if themes change. Refactor to a shared non-client constants module (e.g., `src/lib/constants/color-themes.ts`) when Task 90+ is active. | Open — not a Task 89 blocker |

---

## Batch Plan

| Batch | Task | Status | Commit |
|-------|------|--------|--------|
| B1 | T89 — Color theme runtime axis | `[x]` Complete (approved) | `23aa9b6` |
| B2 | T90 — Exact theme values and shared theme classes | `[~]` In Progress | — |
| B3 | T91 — Sidebar color theme picker | `[ ]` Not started | — |
| B4 | T92 — Grid theme consumption | `[ ]` Not started | — |

### B1 — T89: Color theme runtime axis

**Write set:**
- `src/stores/color-theme-store.ts` (create) — `COLOR_THEMES`, `ColorThemeId`, `validateColorTheme`, Zustand persist store with plain-string custom storage
- `src/stores/color-theme-store.test.ts` (create) — 18 tests: allowed ids, persistence key, validation fallback, setter behavior, persist write, `persist.rehydrate()` hydration path
- `src/components/layout/color-theme-provider.tsx` (create) — client component syncing store → `document.documentElement.dataset.colorTheme` via `useEffect`
- `src/app/providers.tsx` (update) — `ColorThemeProvider` mounted inside `ThemeProvider`
- `src/app/layout.tsx` (update) — `next/font/google` loading for Inter, Playfair Display, Space Mono, VT323; no-flash init script sets `data-color-theme` before hydration

**Key decisions:**
- Custom persist storage stores the theme id as a plain string (not nested JSON) so the no-flash script can read `localStorage.getItem("griddo-color-theme")` directly.
- `typeof localStorage === "undefined"` guard + `try/catch` in all storage methods ensures SSR/static generation safety.
- Font fidelity: all 4 theme display fonts loaded successfully via `next/font/google` — no blocker, no silent fallback.

**Gates:**
- `pnpm test --run src/stores/color-theme-store.test.ts` ✅ 18/18
- `pnpm build` ✅ exit 0
- `git diff --check` ✅ clean
