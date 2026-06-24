## Phase 21: Batch 2 Calendar Visual Alignment

> **Purpose:** Applied the Batch 2 calendar visual recipe over the Phase 19 calendar implementation while preserving existing DnD, popover, unschedule, and navigation behavior.
> **Dependencies:** Phase 20 complete.
> **Canonical refs:** SPEC.md `/calendar/weekly` and `/calendar/monthly`; DESIGN_TOKENS.md Calendar Visual Theme Contract; `docs/recipes/calendar-batch2-visual-recipe.md`
> **Policy:** Patch current calendar files. Do not add Day/Year views. Do not remove current popover or DnD behavior to match prototype visuals.

### Task 93: Shared calendar view header

- **Status:** `[x]`
- **Dependencies:** Phase 20 complete.
- **Files:** `src/components/calendar/calendar-view-header.tsx` (create), `src/stores/calendar-store.ts` (update), `src/app/calendar/weekly/page.tsx` (update), `src/app/calendar/monthly/_components/month-grid.tsx` (update), `src/app/calendar/calendar-navigation.test.tsx` (update), `src/stores/calendar-store.test.ts` (update)
- **Recipe:** `docs/recipes/calendar-batch2-visual-recipe.md`
- **Actions:**
  - `src/components/calendar/calendar-view-header.tsx`: create the shared header with title + muted subtitle, Weekly/Monthly segmented control, previous/today/next controls, and visible focus states.
  - `src/app/calendar/weekly/page.tsx`: replace the local weekly header with the shared header while preserving current week navigation and expanded-day behavior.
  - `src/app/calendar/monthly/_components/month-grid.tsx`: render the shared header for monthly view, passing month title and year subtitle; keep existing monthly grid behavior delegated to `MonthGrid`.
  - `src/app/calendar/calendar-navigation.test.tsx`: verify weekly/monthly navigation and view switching still work through the shared header.
- **Acceptance:**
  - Weekly and Monthly show the same header structure.
  - Weekly title/subtitle use the current week/month context; Monthly shows month title and year subtitle.
  - Previous, Today, Next, Weekly, and Monthly controls are keyboard focusable with visible focus rings.
  - No Day/Year controls are introduced.
  - `pnpm test --run src/app/calendar/calendar-navigation.test.tsx` passes.
- **Commit:** `bffb0c8`

### Task 94: Monthly grid theme-aware visual target

- **Status:** `[x]`
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
- **Commit:** `7a2e9ae`

### Task 95: Weekly day column theme-aware visual target

- **Status:** `[x]`
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
- **Commit:** `f133d58`

### Task 96: Calendar a11y polish and theme smoke

- **Status:** `[x]`
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
- **Commits:** `9497d38`, `a664cf9`

#### Phase 21 Notes

> **Codex A→B sequential execution — scope isolation:** When Codex A leaves uncommitted changes before B launches, `git status` alone cannot distinguish B's writes from A's. For future multi-agent batches: save `git diff --name-only` baseline before B launches, or commit A's output before starting B. See ISSUE-21-01.

> **Weekly header date-range tradeoff:** The Batch 2 recipe renders the weekly header title as `"Month YYYY"` rather than a date range. This is intentional per the recipe, but cross-month weeks lose date-range information. The current state is not a severe usability problem — deferred to a post-Phase 21 UX review. See ISSUE-21-03.

> **Type-safe test values for union-typed parameters:** `navigateWeek` accepts `1 | -1`. A test passing `-5` to move several weeks back compiled at runtime but failed `tsc --noEmit`. Use `-1` (repeated or chained) when a single legal step is sufficient for test intent — do not widen the type or pass out-of-union literals.

> **Plan file-list accuracy matters for B2 sequencing:** T93's original Files list named `monthly/page.tsx`; the implementation touched `month-grid.tsx` instead. The discrepancy was caught and corrected post-approval (commit `6447e6e`), but it created ambiguity for B2 scope verification. During planning, trace the header-render responsibility to the correct component before committing the file list.

> **Smoke as a live a11y gate:** ISSUE-21-04 (DayColumn internal card buttons missing `focus-visible`) was discovered during B3 smoke — not during implementation. The issue was resolved within T96 rather than deferred. Smoke is a genuine gate, not a documentation step; schedule time to act on findings within the phase.

> **Full issue log:** `docs/issues/Issues_Phase_21.md`
