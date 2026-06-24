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
| ISSUE-20-01 | Deferred/Low | no-flash script in `layout.tsx` duplicates the 8-theme id list and persistence key from `color-theme-store.ts`. Values are in sync now but could drift if themes change. Refactor to a shared non-client constants module (e.g., `src/lib/constants/color-themes.ts`) when Task 90+ is active. | Deferred — T90 complete, still not a blocker; candidate for closing-phase |
| ISSUE-20-02 | Brainstorming/Visual follow-up | BitCard currently does not consume the Batch 2 color-theme surface/font/depth treatment. This is intentional out-of-scope for T92, whose canonical owner is GridCell + NodeCard only. BitCard needs a separate design pass before implementation: decide theme font, border/radius/shadow/depth, priority badge/progress/deadline overlay treatment, and how closely BitCard should align with NodeCard while preserving its text-row/card identity. | Open — add to brainstorming before implementation |
| ISSUE-20-03 | Deferred/Low | `borderOpacity` prop in `GridCellProps` and `levelOpacityMap` in `grid-view.tsx` are now dead code — superseded by the theme CSS variable system. No build/test impact; silently ignored. Candidate for cleanup in a future phase. | Deferred — out of T92 scope |

---

## Batch Plan

| Batch | Task | Status | Commit |
|-------|------|--------|--------|
| B1 | T89 — Color theme runtime axis | `[x]` Complete (approved) | `23aa9b6` |
| B2 | T90 — Exact theme values and shared theme classes | `[x]` Complete (approved) | `80a8044` |
| B3 | T91 — Sidebar color theme picker | `[x]` Complete (approved) | `dffef82` |
| B4 | T92 — Grid theme consumption | `[i]` Implemented | `27a3143` |

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

### B2 — T90: Exact theme values and shared theme classes

**Write set:**
- `src/app/globals.css` (update) — base/default layer theme contract vars (8), calendar visual contract defaults (12), swatch tokens (8); `.dark` base shadow overrides (2); `@layer components` with `.theme-node-card` (+hover), `.theme-grid-line`, `.theme-surface` (+hover); 7 override theme blocks (tiny-desk, neumorphism, claymorphism, origami, terminal, retro-mac, graphite — each with light + dark selectors)
- `src/app/theme-transition.test.ts` (update) — added 2nd `it` block with 30 assertions: base contract exact values, `.dark` shadow overrides, swatch spot checks, shared class presence, all 7 override selectors, `griddo` override absence, per-theme exact shadow/calendar spot checks

**Key decisions:**
- `griddo` has no override block — it IS the base layer; 7 override blocks cover the remaining themes.
- `@layer components` added as top-level block after `@layer base` closing `}`, not inside it.
- All CSS values copied verbatim from recipe appendix (`64e5236:src/app/globals.css` + `themes.css`); no reconstruction from prose.
- Cascade/inheritance preserved: override blocks contain only the variables they change; omitted variables inherit from the active base light/dark layer.
- No existing tokens, selectors, or `@layer` structure modified — purely additive.

**Gates:**
- `pnpm test --run src/app/theme-transition.test.ts` ✅ 2/2
- `pnpm build` ✅ exit 0
- `git diff --check` ✅ clean

### B3 — T91: Sidebar color theme picker

**Write set:**
- `src/components/layout/color-theme-toggle.tsx` (create) — `ColorThemeToggle` component; `Palette` icon trigger, Radix Popover `side="right" align="end" sideOffset={12}`, 8 theme rows with swatch + label + `Check` icon; `aria-pressed` on each row; `useEffect` focus to selected row on open via `querySelector<HTMLButtonElement>('[aria-pressed="true"]')`
- `src/components/layout/sidebar.tsx` (update) — import `ColorThemeToggle`; insert above `ThemeToggle` in bottom control group with same `dragActiveItem` dim wrapper
- `src/components/layout/sidebar.test.tsx` (update) — `setColorThemeMock` + `vi.mock("@/stores/color-theme-store")`; 7 new tests in nested `describe("ColorThemeToggle in sidebar")`

**Key decisions:**
- `SidebarIconButton` is not exported; trigger replicates its Tailwind classes directly on a raw `<button>` — no refactor.
- `PopoverContent className` explicitly overrides shadcn defaults (`w-56 p-1 bg-popover border border-border shadow-md rounded-lg`); no shadcn internals patched.
- Check icon conditionally rendered (not `invisible`) — DOM absence is the selected-off signal.
- No custom Escape handler — Radix Popover returns focus to trigger natively.

**Gates:**
- `pnpm test --run src/components/layout/sidebar.test.tsx` ✅ 29/29
- `pnpm build` ✅ exit 0
- `git diff --check` ✅ clean
- `git diff --name-only HEAD -- src/components/grid` ✅ no output

### B4 — T92: Grid theme consumption

**Write set:**
- `src/components/grid/grid-cell.tsx` (update) — removed `rounded-md border border-dashed` and inline `style={borderStyle}`; replaced with `theme-grid-line` class; removed `CSSProperties` import and `borderStyle` const; removed `borderOpacity` from destructure params (prop kept in `GridCellProps` for backward compat with `grid-view.tsx`)
- `src/components/grid/node-card.tsx` (update) — added `theme-node-card` as first class; removed conflicting Tailwind utilities (`rounded-3xl`, `bg-card`, `shadow-[0_4px_14px_rgba(15,23,42,0.10)]`, `hover:shadow-[0_10px_24px_rgba(15,23,42,0.14)]`); changed `isDragging` shadow to `[box-shadow:var(--theme-shadow-hover)]`
- `src/components/grid/grid-cell.test.tsx` (update) — added `theme-grid-line` class assertion test (4th test)
- `src/components/grid/node-card.test.tsx` (update) — replaced removed shadow class assertions with `theme-node-card` class assertion

**Key decisions:**
- Tailwind v4 `@layer utilities` overrides `@layer components`: simply adding `.theme-*` classes is insufficient; conflicting utility classes must be removed for theme CSS variables to take effect.
- `borderOpacity` prop kept in `GridCellProps` (silently ignored) to avoid touching `grid-view.tsx`'s `levelOpacityMap` pattern, which is out of T92 scope.
- `hover:bg-muted/40` retained (behavioral state class, not a direct conflict with `.theme-node-card` background — accepted per DESIGN_TOKENS.md pattern).
- Phase 19 Archive dropdown guard (`node.systemRole === null`) and edit-mode delete button preserved unchanged.
- No theme-id conditional branches added.

**Deferred visual follow-up (ISSUE-20-02):**
- BitCard theme treatment intentionally not changed in T92. Smoke found that Bits do not yet match theme-specific font/shadow/border depth. This is recorded as ISSUE-20-02 and should go through brainstorming/design before implementation.

**Dead code noted (ISSUE-20-03):**
- `borderOpacity` prop in `GridCellProps` and `levelOpacityMap` in `grid-view.tsx` are now dead code — the level-opacity distinction is superseded by the theme CSS variable system. Candidate for cleanup in a future phase.

**Gates:**
- `pnpm test --run src/components/grid/grid-cell.test.tsx src/components/grid/node-card.test.tsx` ✅ 12/12
- `pnpm build` ✅ exit 0
- `git diff --check` ✅ clean
