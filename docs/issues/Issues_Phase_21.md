# Phase 21 — Batch 2 Calendar Visual Alignment

> **Branch:** `phase-21/calendar-visual-alignment`
> **Tasks:** T93, T94, T95, T96

---

## Planning Gate Note

`docs/reviews/amendment-batch2-theme-calendar-inbox-flow-review.md` (Phases 20–22 combined) satisfies the Phase 21 flow-review gate per amendment-mode Step 6 PASS declaration. No per-phase review doc required.

---

## Phase-local Question Resolution

| # | Question | Resolution | Status |
|---|----------|------------|--------|
| Q1 | T93 plan listed `monthly/page.tsx` in Files but actual implementation touched `monthly/_components/month-grid.tsx` (header lives in MonthGrid, not the page shell). `calendar-store.ts` / `calendar-store.test.ts` also added out-of-plan for `goToToday`. | EXECUTION_PLAN.md T93 Files corrected post-approval to match actual write set. Implementation was correct; plan entry was imprecise. | Reflected |

---

## Open Items

| ID | Category | Description | Status |
|----|----------|-------------|--------|
| ISSUE-21-01 | Process/Low | Sequential Codex A→B execution: B's scope verification relied on `git status` alone after A left uncommitted changes — cannot distinguish B's writes from A's. Future batches: save `git diff --name-only` baseline before B launches, or commit A before B. | Deferred — process improvement for B2 onwards |
| ISSUE-21-02 | Test/Low | Monthly Today button test verifies `goToToday` is called but does not assert `setSelectedDate(null)` side-effect (open popover should close). Non-blocking; current implementation is correct. T96 focus polish pass could add this regression guard. | Deferred — T96 candidate |
| ISSUE-21-03 | UX/Low | Weekly header now shows `"April / 2026"` instead of `"Apr 27 – May 3, 2026"`. Recipe canonical, intentional tradeoff. Cross-month weeks lose date-range information. Track for UX review after T96 visual smoke. | Deferred — post-T96 UX review candidate |

---

## Batch Plan

| Batch | Tasks | Status | Commit |
|-------|-------|--------|--------|
| B1 | T93 — Shared calendar view header | `[x]` Complete (approved) | `bffb0c8` |
| B2 | T94 + T95 — Monthly grid + weekly day column theme visuals | `Implemented` | T94: `7a2e9ae`, T95: TBD |
| B3 | T96 — Calendar a11y polish and theme smoke | `Pending` | — |

### B2b — T95: Weekly day column theme-aware visual target

**Classification:** logic-heavy (complete spec from user prompt + recipe)

**Write set:**
- `src/components/calendar/day-column.tsx` (patch)
- `src/components/calendar/day-column.test.tsx` (update)

**Changes applied:**
- `motion.div` container: removed `rounded-3xl border shadow-sm` and all conditional border/bg/shadow/today-ring Tailwind utilities. Drop feedback changed from `border-primary bg-primary/5` to `ring-2 ring-primary/40`. Added inline `style` with full `--calendar-cell-*` / `--calendar-today-*` variable set (background, borderColor, borderRadius, borderStyle, borderWidth, boxShadow).
- Header `button`: removed `rounded-xl`. Added inline `style` with `background: var(--calendar-header-bg)` and `borderRadius: calc(var(--calendar-cell-radius) * 0.8)`.
- Tests: replaced `toHaveClass("ring-primary/40")` and `toHaveClass("ring-primary")` today-emphasis assertions with `toHaveAttribute("style", expect.stringContaining("var(--calendar-today-shadow)"))`. Added non-today `var(--calendar-cell-bg)` assertion in the existing items test.

**Verification:**
- `day-column.test.tsx`: 5/5 passed
- `calendar-navigation.test.tsx`: 14/14 passed
- `pnpm build`: clean (TypeScript + static pages)
- `git diff --check`: clean

**No deviations from spec.**

---

### B1 — T93: Shared calendar view header

**Classification:** logic-heavy + behavior-heavy (parallel test authoring: Codex A impl → Codex B tests sequentially)

**Write set (Codex A — implementer):**
- `src/components/calendar/calendar-view-header.tsx` (create)
- `src/stores/calendar-store.ts` (update — add `goToToday` action)
- `src/app/calendar/weekly/page.tsx` (update — replace inline header)
- `src/app/calendar/monthly/_components/month-grid.tsx` (update — replace embedded header)

**Write set (Codex B — test author):**
- `src/app/calendar/calendar-navigation.test.tsx` (update — shared header assertions, Today button, title/subtitle)
- `src/stores/calendar-store.test.ts` (update — add `goToToday` test)

**Key decisions:**
- `goToToday` added to calendar-store (no existing absolute-date setter)
- Header root uses `<header aria-label="Calendar navigation">` (semantic, no data-testid needed for findNavRow)
- Props include `previousLabel`/`nextLabel` to preserve "Previous week/month" a11y labels
- `setSelectedDate(null)` preserved in MonthGrid's onPrev/onNext/onToday callbacks (local state, not store)
- Sequential execution (A → B) chosen over parallel to avoid working-tree race on shared repo
