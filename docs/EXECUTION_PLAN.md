# EXECUTION PLAN — GridDO

Execution plan mode: scaled

> **Guideline:** Check this file first to see the current task before looking into other docs.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete

---

## Phase Index

| Phase | Status | Title | Archive |
|-------|--------|-------|---------|
| 1 | ✅ done | Foundation | [archive](execution-plan/archive/phase-01.md) |
| 2 | ✅ done | Core Logic | [archive](execution-plan/archive/phase-02.md) |
| 3 | ✅ done | Layout Shell + Level 0 Grid | [archive](execution-plan/archive/phase-03.md) |
| 4 | ✅ done | Grid Navigation + Bit Cards | [archive](execution-plan/archive/phase-04.md) |
| 4.5 | ✅ done | Design Alignment | [archive](execution-plan/archive/phase-04-5.md) |
| 5 | ✅ done | Bit Detail + Application Hooks | [archive](execution-plan/archive/phase-05.md) |
| 5.5 | ✅ done | DataStore Facade Cleanup | [archive](execution-plan/archive/phase-05-5.md) |
| 6 | ✅ done | Calendar Views | [archive](execution-plan/archive/phase-06.md) |
| 6.5 | ✅ done | DataStore Facade Migration | [archive](execution-plan/archive/phase-06-5.md) |
| 7 | ✅ done | Trash, Search + Polish | [archive](execution-plan/archive/phase-07.md) |
| 8 | ✅ done | Bit Detail Surface Refinement (Pilot) | [archive](execution-plan/archive/phase-08.md) |
| 9 | ✅ done | Grid UX Improvements | [archive](execution-plan/archive/phase-09.md) |
| 10 | ✅ done | Breadcrumb + Deadline UX | [archive](execution-plan/archive/phase-10.md) |
| 11 | ✅ done | Calendar Shell | [archive](execution-plan/archive/phase-11.md) |
| 12 | ✅ done | Calendar Creation Flows | [archive](execution-plan/archive/phase-12.md) |
| 13 | ✅ done | Weekly Redesign | [archive](execution-plan/archive/phase-13.md) |
| 14 | ✅ done | Monthly Redesign | [archive](execution-plan/archive/phase-14.md) |
| 15 | ✅ done | Lifecycle Schema Foundation | [archive](execution-plan/archive/phase-15.md) |
| 16 | ✅ done | Quick Capture — `+` Entry Surface & Command Palette | [archive](execution-plan/archive/phase-16.md) |
| 17 | ✅ done | Inbox / Triage Workspace — Routing, Layout, Scratch & Breakdown | [archive](execution-plan/archive/phase-17.md) |
| 18 | ✅ done | Inbox / Triage — Staging & Placement DnD (compact-token, partial Grid DnD) | [archive](execution-plan/archive/phase-18.md) |
| 19 | ✅ done | Archive View & Direct Archive | [archive](execution-plan/archive/phase-19.md) |
| 20 | 🔲 active | Batch 2 Theme System & Themed Grid | — |
| 21 | 🔲 active | Batch 2 Calendar Visual Alignment | — |
| 22 | 🔲 active | Batch 2 Inbox / Triage Visual & Interaction Polish | — |

## Next Numbers

Next phase: 23 · Next task: 101

---

## Cross-Cutting Concerns

These apply across all phases:

- **Two-layer data abstraction (critical PRD constraint):** Data access has two independent abstraction boundaries, both replaceable for v2 cloud sync:
  1. **CRUD layer — DataStore interface** (`src/lib/db/datastore.ts`): All write operations (create, update, delete) go through this interface. v1 implementation: `src/lib/db/indexeddb.ts`.
  2. **Reactive layer — custom hooks** (`src/hooks/use-*.ts`): All read subscriptions go through these hooks. v1 implementation uses Dexie `useLiveQuery` internally. Components never import DataStore or Dexie directly — they import hooks only.
  - For v2 migration: swap the DataStore implementation (e.g., to Supabase) AND swap the reactive internals (e.g., `useLiveQuery` → React Query). Component code stays unchanged.
- **Design tokens:** Use semantic classes from DESIGN_TOKENS.md. All colors via CSS variables — no hardcoded hex. Reference: `bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`, `bg-priority-{high,mid,low}-bg`, `text-priority-{high,mid,low}`, `bg-urgency-{1,2,3}`.
- **Computed values:** Aging state, urgency level, node completion, bit progress — computed at render time via pure utility functions. Never stored in the database (SPEC decision #6).
- **URL-driven state:** Grid level via route (`/`, `/grid/[nodeId]`). Bit detail via query param (`?bit=[bitId]`). Browser back/forward navigation works naturally.
- **Reactive updates:** All data reads via custom hooks (internally `useLiveQuery` in v1). Write to store → all subscribed components auto-update. No manual cache invalidation, no optimistic rollback (SPEC decision #11).
- **Zod at write boundary:** Validate data with Zod schemas on create/update operations. Data read from the store is trusted — no runtime validation on reads (SPEC decision #7).
- **Grid cell uniqueness (Hook 8):** Always check `(parentId, x, y)` occupancy before insert or move. BFS auto-placement as fallback when position is occupied.
- **Testing:** Vitest for unit tests. Pure utility functions (T6) and application hooks (T24, T25, T32) require passing unit tests as acceptance criteria. Test files co-located with source: `src/lib/utils/*.test.ts`, `src/lib/db/*.test.ts`.
- **Accessibility:** `prefers-reduced-motion` disables all animations. Focus management on modals (search overlay, bit detail, dialogs). `aria-labels` on icon-only sidebar buttons. Keyboard navigation for search results.
- **ESC key priority (innermost-first):** Search overlay > Bit detail popup > Calendar column expand > Edit mode. **Implementation:** The search overlay handler (highest priority) calls `e.stopPropagation()` after closing, preventing the event from reaching lower handlers. Each lower handler checks its own open state before consuming the event. Owned by Task 33 (search overlay) — the stopPropagation pattern must be in place before lower-priority handlers can be considered correct.
- **BFS origin rule:** Node creation: BFS from `(0, 0)` (top-left corner). Bit creation: BFS from `(GRID_COLS-1, 0)` (top-right corner). Empty-cell `+` click: BFS from `(clickedX, clickedY)` regardless of type — returns the clicked cell if empty, nearest fallback if occupied.
- **Non-features (PRD Section 26):** Do NOT implement: Mascot System, Labs, AI-Powered Search, Responsive Design, Onboarding Enhancement. These are explicitly deferred.
- **Doc authority:** SCHEMA.md = data model source of truth. SPEC.md = architecture/routes/components. DESIGN_TOKENS.md = visual values. This file = execution order. PRD = historical context, non-authoritative for implementation.

---

## Phase 20: Batch 2 Theme System & Themed Grid

> **Purpose:** Add the Batch 2 color-theme axis, exact theme tokens, theme picker, and grid theme consumption. This phase lays the CSS/runtime foundation that Calendar and Inbox/Triage polish consume later.
> **Canonical refs:** SPEC.md Architecture Decision 17; DESIGN_TOKENS.md Color Theme System; `docs/recipes/theme-system-and-grid-batch2-visual-recipe.md`
> **Policy:** Patch the current Phase 19 app. Do not wholesale-copy prototype files. Dark/light remains owned by `next-themes`; color theme is an orthogonal `data-color-theme` axis.

### Task 89: Color theme runtime axis

- **Status:** `[ ]`
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

- **Status:** `[ ]`
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

## Phase 21: Batch 2 Calendar Visual Alignment

> **Purpose:** Apply the Batch 2 calendar visual recipe over the current Phase 19 calendar implementation while preserving existing DnD, popover, unschedule, and navigation behavior.
> **Dependencies:** Phase 20 complete.
> **Canonical refs:** SPEC.md `/calendar/weekly` and `/calendar/monthly`; DESIGN_TOKENS.md Calendar Visual Theme Contract; `docs/recipes/calendar-batch2-visual-recipe.md`
> **Policy:** Patch current calendar files. Do not add Day/Year views. Do not remove current popover or DnD behavior to match prototype visuals.

### Task 93: Shared calendar view header

- **Status:** `[ ]`
- **Dependencies:** Phase 20 complete.
- **Files:** `src/components/calendar/calendar-view-header.tsx` (create), `src/app/calendar/weekly/page.tsx` (update), `src/app/calendar/monthly/page.tsx` (update), `src/app/calendar/calendar-navigation.test.tsx` (update)
- **Recipe:** `docs/recipes/calendar-batch2-visual-recipe.md`
- **Actions:**
  - `src/components/calendar/calendar-view-header.tsx`: create the shared header with title + muted subtitle, Weekly/Monthly segmented control, previous/today/next controls, and visible focus states.
  - `src/app/calendar/weekly/page.tsx`: replace the local weekly header with the shared header while preserving current week navigation and expanded-day behavior.
  - `src/app/calendar/monthly/page.tsx`: render the shared header for monthly view, passing month title and year subtitle; keep existing monthly grid behavior delegated to `MonthGrid`.
  - `src/app/calendar/calendar-navigation.test.tsx`: verify weekly/monthly navigation and view switching still work through the shared header.
- **Acceptance:**
  - Weekly and Monthly show the same header structure.
  - Weekly title/subtitle use the current week/month context; Monthly shows month title and year subtitle.
  - Previous, Today, Next, Weekly, and Monthly controls are keyboard focusable with visible focus rings.
  - No Day/Year controls are introduced.
  - `pnpm test --run src/app/calendar/calendar-navigation.test.tsx` passes.
- **Commit:** `feat(phase-21): add shared calendar view header`

### Task 94: Monthly grid theme-aware visual target

- **Status:** `[ ]`
- **Dependencies:** Task 93.
- **Files:** `src/app/calendar/monthly/_components/month-grid.tsx` (update), `src/app/calendar/monthly/_components/date-cell-popover.tsx` (update as needed), `src/app/calendar/calendar-node-creation.test.tsx` (update), `src/app/calendar/calendar-bit-creation.test.tsx` (update)
- **Recipe:** `docs/recipes/calendar-batch2-visual-recipe.md`
- **Actions:**
  - `month-grid.tsx`: apply the tight `gap-px` monthly grid model, `--calendar-grid-line-color`, `--calendar-header-bg`, and theme-aware date cell styles from the recipe.
  - `month-grid.tsx`: update date label treatment: circular today badge, `MMM d` for first-of-month labels, day number for other days.
  - `month-grid.tsx`: keep preview limit at 4; render Nodes as compact colored square tiles using `var(--theme-radius, 6px)` and Bits/Chunks as parent-color dots.
  - `date-cell-popover.tsx`: preserve current popover behavior; only adjust focus-visible styling if monthly visual changes touch popover controls.
  - Tests: preserve creation/drop behavior while covering the new visual classes or inline calendar-variable styles where practical.
- **Acceptance:**
  - Monthly grid uses tight calendar grid lines rather than separated card gaps.
  - Today is visible as a circular date badge across themes.
  - First day of each month displays `MMM d`; other days display numeric day labels.
  - Dragging items to date cells still sets deadlines and existing creation tests pass.
  - `pnpm test --run src/app/calendar/calendar-node-creation.test.tsx src/app/calendar/calendar-bit-creation.test.tsx` passes.
- **Commit:** `feat(phase-21): apply themed monthly calendar grid`

### Task 95: Weekly day column theme-aware visual target

- **Status:** `[ ]`
- **Dependencies:** Task 93.
- **Files:** `src/components/calendar/day-column.tsx` (update), `src/app/calendar/weekly/page.tsx` (update as needed), `src/components/calendar/day-column.test.tsx` (update)
- **Recipe:** `docs/recipes/calendar-batch2-visual-recipe.md`
- **Actions:**
  - `day-column.tsx`: apply calendar variable styles for background, border, radius, shadow, and today treatment.
  - `day-column.tsx`: keep current expandable-column behavior, no-time item ordering, timed item ordering, unschedule buttons, and item click behavior.
  - `weekly/page.tsx`: preserve LayoutGroup and expanded-day state while aligning spacing with the shared header.
  - `day-column.test.tsx`: extend coverage for theme-aware style variables and preserve existing expand/unschedule behavior.
- **Acceptance:**
  - Weekly day columns consume `--calendar-cell-*` and `--calendar-today-*` variables.
  - Expanded column behavior, ESC/collapse rules, and unschedule actions remain unchanged.
  - No-time items remain above timed items.
  - `pnpm test --run src/components/calendar/day-column.test.tsx` passes.
- **Commit:** `feat(phase-21): apply themed weekly day columns`

### Task 96: Calendar a11y polish and theme smoke

- **Status:** `[ ]`
- **Dependencies:** Tasks 94 and 95.
- **Files:** `src/app/calendar/monthly/_components/date-cell-popover.tsx` (update), `src/components/calendar/compact-bit-item.tsx` (update as needed), `src/components/calendar/compact-bit-item.test.tsx` (update), `src/components/calendar/day-column.test.tsx` (update as needed)
- **Recipe:** `docs/recipes/calendar-batch2-visual-recipe.md`
- **Actions:**
  - Add or verify visible `focus-visible` styling for popup item controls and compact calendar item controls.
  - Recheck `toSorted()` / `useMemo` only if implementation touched list rendering in a way that creates measurable render cost; document the outcome in code comments only if a non-obvious memoization boundary is added.
  - Add focused regression coverage for popup item controls or compact item focus behavior where existing tests do not cover it.
  - Run visual smoke manually across light/dark plus at least one high-contrast theme (`terminal` or `retro-mac`), recording any conflict for follow-up rather than silently normalizing the recipe.
- **Acceptance:**
  - Calendar popup item controls have visible keyboard focus.
  - Existing DateCellPopover click/navigation behavior remains intact.
  - Calendar remains usable in `griddo`, one high-fidelity visual theme, and one high-contrast theme in light/dark.
  - `pnpm test --run src/components/calendar/compact-bit-item.test.tsx src/components/calendar/day-column.test.tsx` passes.
- **Commit:** `fix(phase-21): polish calendar focus and theme smoke`

---

## Phase 22: Batch 2 Inbox / Triage Visual & Interaction Polish

> **Purpose:** Align Inbox/Triage with the Batch 2 normalized recipe while preserving Phase 18/19 canonical behavior: grip-only Breakdown dragging, staging as UI state, placement confirmation, ArchiveScratchBar, and lifecycle rules.
> **Dependencies:** Phase 20 complete.
> **Canonical refs:** SPEC.md Inbox / Triage Workspace; DESIGN_TOKENS.md Inbox / Triage Batch 2 Surface Contract; `docs/recipes/inbox-triage-batch2-visual-recipe.md`
> **Policy:** Remove visible developer section labels from final UI. Internal component names, tests, `aria-label`s, and visually hidden labels may keep implementation names.

### Task 97: Scratch Pool identity, search, sort, collapsed switcher

- **Status:** `[ ]`
- **Dependencies:** Phase 20 complete.
- **Files:** `src/components/triage/scratch-pool.tsx` (update), `src/stores/triage-store.ts` (update as needed), `src/components/triage/scratch-pool.test.tsx` (update)
- **Recipe:** `docs/recipes/inbox-triage-batch2-visual-recipe.md`
- **Actions:**
  - Redesign expanded Scratch Pool header so it shows inbox identity icon, exact count, and fold/unfold control without visible `Scratch Pool` heading text.
  - Add expanded-mode title search and icon-only asc/desc sort toggle. Search filters Scratch titles only; sort target is `createdAt`; default remains newest-first.
  - Redesign collapsed mode with compact inbox identity, count badge, fold/unfold control, and short vertical pill switching. Selected pill is longer/higher-contrast; inactive pills are shorter/muted; pills have accessible labels/tooltips.
  - Replace selection-immediate auto-collapse with a state model that can support first-Breakdown-keystroke collapse. Manual re-expand is respected for the current Scratch editing session and re-arms when the selected Scratch changes.
  - Preserve Scratch row details while redesigning the pool: each row keeps the restored `createdAt` relative-time label format and long titles ellipsize.
  - Tests cover search, sort, collapsed switcher, labels/tooltips, count display, and no search/sort controls in collapsed mode.
- **Acceptance:**
  - Expanded Scratch Pool has no visible `Scratch Pool` heading but clearly reads as Inbox/Scratch identity.
  - Searching `foo` shows only Scratch titles containing `foo`; clearing search restores the list.
  - Sort toggle switches newest-first / oldest-first without changing stored Scratch data.
  - Collapsed mode shows short vertical pills and allows switching active Scratch with accessible names.
  - Selecting a Scratch alone does not collapse the pool.
  - Scratch rows show restored relative-time labels (`2h ago`, `yesterday`, `2 days ago`, `6 days ago`, `m/dd/yy`) and long titles ellipsize without breaking row layout.
  - `pnpm test --run src/components/triage/scratch-pool.test.tsx` passes.
- **Commit:** `feat(phase-22): refine Scratch Pool identity and controls`

### Task 98: Breakdown selected context and first-keystroke collapse

- **Status:** `[ ]`
- **Dependencies:** Task 97.
- **Files:** `src/components/triage/breakdown-panel.tsx` (update), `src/components/triage/scratch-pool.tsx` (update as needed), `src/stores/triage-store.ts` (update as needed), `src/components/triage/breakdown-panel.test.tsx` (update), `src/components/triage/scratch-pool.test.tsx` (update as needed)
- **Recipe:** `docs/recipes/inbox-triage-batch2-visual-recipe.md`
- **Actions:**
  - Add selected Scratch context at the top-left of the Breakdown section as a compact context strip with Scratch/Inbox-family icon, selected Scratch title, optional relative-time/meta, and truncation for long titles.
  - Ensure the context strip is visually distinct from Breakdown rows and never looks draggable or row-like.
  - Wire first-keystroke collapse: Scratch selection and Breakdown focus/click alone do not collapse the pool; the first typed character in the Breakdown input while a Scratch is selected collapses the pool.
  - Preserve Enter submission behavior and adopt `ISSUE-18-18`: after submitting a Breakdown row with Enter, focus remains in the add-note input for rapid entry; global commands such as `Cmd+K` still move focus to the command menu.
  - Improve Breakdown drag grip visibility and hit target while keeping the grip as the only drag activator.
  - Style `ArchiveScratchBar` as an intentional completion affordance when all Breakdown rows are consumed.
- **Acceptance:**
  - With a Scratch selected, the Breakdown section shows a top-left context strip that is visually separate from rows below it.
  - Clicking into Breakdown does not collapse Scratch Pool; typing the first character does.
  - Manually re-expanded Scratch Pool does not auto-collapse again until the selected Scratch changes.
  - Pressing Enter after typing a Breakdown row submits the row and leaves focus in the add-note input.
  - Dragging still starts only from the grip, not the full row.
  - `pnpm test --run src/components/triage/breakdown-panel.test.tsx src/components/triage/scratch-pool.test.tsx` passes.
- **Commit:** `feat(phase-22): add Breakdown context and keystroke collapse`

### Task 99: Staging and triage DnD visual states

- **Status:** `[ ]`
- **Dependencies:** Task 97.
- **Files:** `src/components/triage/staging-zone.tsx` (update), `src/components/triage/triage-workspace.tsx` (update), `src/components/triage/triage-drag-token.tsx` (update as needed), `src/components/triage/staging-zone.test.tsx` (update), `src/hooks/use-triage-dnd.test.ts` (update as needed)
- **Recipe:** `docs/recipes/inbox-triage-batch2-visual-recipe.md`
- **Actions:**
  - Remove visible `Staging: Nodes` and `Staging: Bits` labels from final UI while preserving separate Node and Bit staging zones.
  - Keep Node candidates as icon-centered objects and Bit candidates as text-centered rows/cards; do not rely on color alone for distinction.
  - Replace invalid staging/hierarchy drop red styling with muted/unavailable visual language for non-destructive invalid targets.
  - Align `Remove from staging` drop target with the Batch 2 visual language if touched: non-destructive copy, no toast, no destructive-red treatment unless the target is truly destructive.
  - Preserve existing `Remove from staging` target behavior only. Do not implement deferred `ISSUE-18-16` drop-back-to-Breakdown removal in this task.
  - Preserve placement confirmation and staging UI-state-only behavior.
- **Acceptance:**
  - No visible `Staging: Nodes` or `Staging: Bits` headings appear in the final Inbox UI.
  - Node staging remains an icon-centered object grid; Bit staging remains a text row/list.
  - Invalid non-destructive drops read as unavailable/muted, not destructive.
  - Dropping staged candidates on `Remove from staging` removes only the staged candidate and leaves the source Breakdown row active; this is existing target behavior, not the deferred `ISSUE-18-16` drop-back-to-Breakdown interaction.
  - `pnpm test --run src/components/triage/staging-zone.test.tsx src/hooks/use-triage-dnd.test.ts` passes.
- **Commit:** `feat(phase-22): polish staging and triage DnD states`

### Task 100: Hierarchy search, label removal, and workspace integration

- **Status:** `[ ]`
- **Dependencies:** Tasks 97, 98, and 99.
- **Files:** `src/components/triage/hierarchy-explorer.tsx` (update), `src/components/triage/triage-workspace.tsx` (update), `src/components/triage/triage-workspace.test.tsx` (update), `src/components/triage/hierarchy-explorer.test.tsx` (create if needed)
- **Recipe:** `docs/recipes/inbox-triage-batch2-visual-recipe.md`
- **Actions:**
  - Remove visible `Hierarchy Explorer`, `Breakdown / Scribble`, and other developer section headings from final UI while preserving useful `aria-label`s or visually hidden labels.
  - Remove the unnecessary visual gap between the hierarchy shell and Home/L1/L2/L3 columns.
  - Add hierarchy search at the top of the hierarchy area. Search filters only the active hierarchy section: Home/Grid0 when no deeper level is open; otherwise the deepest opened level.
  - Persist search query when the active hierarchy section changes.
  - Add a persistent filter indicator with active query, scoped section, result count, and clear affordance. Flash/highlight is secondary on active-section change with a non-empty query and must respect reduced-motion preferences.
  - Preserve existing hierarchy DnD targets, placement confirmation, Nodes-before-Bits order, and Level 0 system-node exclusion.
- **Acceptance:**
  - Final Inbox UI has no visible `Scratch Pool`, `Breakdown / Scribble`, `Staging: Nodes`, `Staging: Bits`, or `Hierarchy Explorer` headings.
  - Searching while only Home is open filters Home/Grid0 Nodes/Bits only.
  - Searching while Level 2 is active filters Level 2 Nodes/Bits only.
  - When the active section changes with a non-empty query, a persistent filter indicator remains visible and the query can be cleared.
  - Existing hierarchy drop targets and placement confirmation behavior still work.
  - `pnpm test --run src/components/triage/triage-workspace.test.tsx src/components/triage/hierarchy-explorer.test.tsx` passes.
- **Commit:** `feat(phase-22): add scoped hierarchy search and remove visible labels`
