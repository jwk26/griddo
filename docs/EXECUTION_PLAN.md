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
| 20 | ✅ done | Batch 2 Theme System & Themed Grid | [archive](execution-plan/archive/phase-20.md) |
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

## Phase 21: Batch 2 Calendar Visual Alignment

> **Purpose:** Apply the Batch 2 calendar visual recipe over the current Phase 19 calendar implementation while preserving existing DnD, popover, unschedule, and navigation behavior.
> **Dependencies:** Phase 20 complete.
> **Canonical refs:** SPEC.md `/calendar/weekly` and `/calendar/monthly`; DESIGN_TOKENS.md Calendar Visual Theme Contract; `docs/recipes/calendar-batch2-visual-recipe.md`
> **Policy:** Patch current calendar files. Do not add Day/Year views. Do not remove current popover or DnD behavior to match prototype visuals.

### Task 93: Shared calendar view header

- **Status:** `[x]`
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
