## Phase 20: Batch 2 Theme System & Themed Grid

> **Purpose:** Add the Batch 2 color-theme axis, exact theme tokens, theme picker, and grid theme consumption. This phase lays the CSS/runtime foundation that Calendar and Inbox/Triage polish consume in Phases 21–22.
> **Canonical refs:** SPEC.md Architecture Decision 17; DESIGN_TOKENS.md Color Theme System; `docs/recipes/theme-system-and-grid-batch2-visual-recipe.md`
> **Policy:** Patch the current Phase 19 app. Do not wholesale-copy prototype files. Dark/light remains owned by `next-themes`; color theme is an orthogonal `data-color-theme` axis.

### Task 89: Color theme runtime axis

- **Status:** `[x]`
- **Dependencies:** Phase 19 complete; Batch 2 canonical docs and recipes approved.
- **Files:** `src/stores/color-theme-store.ts` (create), `src/components/layout/color-theme-provider.tsx` (create), `src/app/providers.tsx` (update), `src/app/layout.tsx` (update), `src/stores/color-theme-store.test.ts` (create)
- **Recipe:** `docs/recipes/theme-system-and-grid-batch2-visual-recipe.md`
- **Actions:**
  - `src/stores/color-theme-store.ts`: export `COLOR_THEMES`, `ColorThemeId`, default `griddo`, persistence key `griddo-color-theme`, validation helper, and Zustand persisted state for the selected color theme.
  - `src/components/layout/color-theme-provider.tsx`: client component that reads the color-theme store and sets `document.documentElement.dataset.colorTheme`; it must not replace `ThemeProvider` from `next-themes`.
  - `src/app/providers.tsx`: mount `ColorThemeProvider` inside the existing `ThemeProvider` so the dark/light class and color-theme attribute can coexist.
  - `src/app/layout.tsx`: add the no-flash initialization script that validates `localStorage["griddo-color-theme"]` and sets `<html data-color-theme>` before hydration; load/register Inter, Playfair Display, Space Mono, and VT323 through the current font-loading approach. If a font cannot be added without build/network risk, record the conflict and documented fallback in the task handoff instead of silently collapsing all themes to the default font.
  - `src/stores/color-theme-store.test.ts`: cover validation fallback to `griddo`, allowed theme ids, persistence key, and store setter behavior.
- **Acceptance:**
  - On first load, `<html>` has `data-color-theme="griddo"` before React hydration.
  - Selecting another color theme persists `griddo-color-theme` and survives refresh.
  - Switching dark/light mode still works through `next-themes`; it does not overwrite `data-color-theme`.
  - Invalid persisted values fall back to `griddo`.
  - Theme font fidelity is verified: `terminal` uses VT323, `tiny-desk` uses Playfair Display, `origami` / `retro-mac` use Space Mono, and `neumorphism` / `claymorphism` / `graphite` use Inter, or the task handoff records the exact blocker and fallback.
  - `pnpm test --run src/stores/color-theme-store.test.ts` passes.
- **Commit:** `feat(phase-20): add color theme runtime axis`

### Task 90: Exact theme values and shared theme classes

- **Status:** `[x]`
- **Dependencies:** Task 89.
- **Files:** `src/app/globals.css` (update), `src/app/theme-transition.test.ts` (update as needed)
- **Recipe:** `docs/recipes/theme-system-and-grid-batch2-visual-recipe.md`
- **Actions:**
  - `src/app/globals.css`: add the Batch 2 base/default layer from the recipe's `Exact Theme Values` section, including `--theme-*`, `--calendar-*`, swatches, `.dark` base shadows, and shared `.theme-*` component classes.
  - `src/app/globals.css`: add the 7 non-default override theme blocks exactly from the recipe; preserve cascade/inheritance and do not expand omitted variables by guessing.
  - `src/app/globals.css`: define `.theme-node-card`, `.theme-grid-line`, `.theme-surface`, and hover styles using CSS variables only.
  - `src/app/theme-transition.test.ts`: adjust or add assertions so theme-related global CSS and transition assumptions still pass with `data-color-theme`.
- **Acceptance:**
  - All 8 user-facing theme ids are represented: `griddo` through the base layer, plus 7 override themes.
  - `--theme-shadow`, `--theme-shadow-hover`, `--calendar-today-*`, and swatch values match the recipe's exact source-of-record values.
  - No component-specific hardcoded per-theme colors are introduced outside `globals.css`.
  - `pnpm test --run src/app/theme-transition.test.ts` passes.
- **Commit:** `feat(phase-20): add exact Batch 2 theme values`

### Task 91: Sidebar color theme picker

- **Status:** `[x]`
- **Dependencies:** Task 89.
- **Files:** `src/components/layout/color-theme-toggle.tsx` (create), `src/components/layout/sidebar.tsx` (update), `src/components/layout/sidebar.test.tsx` (update)
- **Recipe:** `docs/recipes/theme-system-and-grid-batch2-visual-recipe.md`
- **Actions:**
  - `src/components/layout/color-theme-toggle.tsx`: create an icon-only `Palette` trigger with `aria-label="Change color theme"`, `PopoverContent align="end" side="right" sideOffset={12}`, swatch + label + selected check rows, and accessible keyboard/focus behavior.
  - `src/components/layout/sidebar.tsx`: render the color theme picker in the sidebar without disturbing existing sidebar actions, system Node buttons, Quick Capture, Search, Calendar, Trash, Inbox badge, or existing dark/light `ThemeToggle`.
  - `src/components/layout/sidebar.test.tsx`: verify picker trigger visibility, opening behavior, selected check, and store update when a theme is selected.
- **Acceptance:**
  - Opening the sidebar theme picker shows all 8 labels and swatches.
  - Selecting `terminal` changes `<html data-color-theme>` to `terminal`; selecting `griddo` returns to the base theme.
  - Existing sidebar buttons and Inbox badge still render and navigate as before.
  - `pnpm test --run src/components/layout/sidebar.test.tsx` passes.
- **Commit:** `feat(phase-20): add color theme picker`

### Task 92: Grid theme consumption

- **Status:** `[x]`
- **Dependencies:** Task 90.
- **Files:** `src/components/grid/grid-cell.tsx` (update), `src/components/grid/node-card.tsx` (update), `src/components/grid/grid-cell.test.tsx` (update), `src/components/grid/node-card.test.tsx` (update)
- **Recipe:** `docs/recipes/theme-system-and-grid-batch2-visual-recipe.md`
- **Actions:**
  - `src/components/grid/grid-cell.tsx`: add `theme-grid-line` to grid cell borders without changing grid dimensions, DnD drop indicators, edit-mode add affordance, or lifecycle filtering behavior.
  - `src/components/grid/node-card.tsx`: add `theme-node-card` to NodeCard while preserving Phase 19 Archive menu trigger, system-node guard, drag behavior, and icon/title layout.
  - Tests: assert theme classes are present and existing grid/node-card behavior remains intact.
- **Acceptance:**
  - Grid lines visually respond to active color theme through `.theme-grid-line`.
  - Node cards visually respond through `.theme-node-card` while the Archive `⋯` menu still appears only for non-system Nodes.
  - No theme id conditional branches are added to grid components.
  - `pnpm test --run src/components/grid/grid-cell.test.tsx src/components/grid/node-card.test.tsx` passes.
- **Commit:** `feat(phase-20): apply theme classes to grid surfaces`

---

#### Phase 20 Notes

> **Tailwind v4 layer order is the key insight for theme class adoption:** Simply adding `.theme-*` classes to components is not enough — Tailwind utility classes in `@layer utilities` override `@layer components` where the `.theme-*` classes live. Conflicting utilities (`rounded-3xl`, `bg-card`, `shadow-[...]`, `border border-dashed`) must be removed for CSS variable–driven theme values to take effect.

> **`borderOpacity` dead code (ISSUE-20-03):** After replacing grid cell borders with `.theme-grid-line`, the `borderOpacity` prop in `GridCellProps` and `levelOpacityMap` in `grid-view.tsx` became dead code. The prop was kept in the type definition for backward compatibility (no TypeScript error) but is silently ignored. Candidate for cleanup in a future phase.

> **BitCard theme treatment deferred (ISSUE-20-02):** BitCard does not yet consume Batch 2 color-theme surface/font/depth treatment. This is intentionally out of T92 scope — BitCard has different information density, priority badges, deadline overlays, and progress indicators that need a separate design pass before implementation. Do not add `.theme-node-card` to BitCard without a design decision first.

> **Pre-existing lint error fixed at close:** `archive-group.tsx` had a `react-hooks/static-components` error (`const ItemIcon = getIcon(...)` inside render). Fixed with `createElement(getIcon(item.icon), {...})` — same visual output, satisfies the linter.

> **Full issue log:** `docs/issues/Issues_Phase_20.md`
