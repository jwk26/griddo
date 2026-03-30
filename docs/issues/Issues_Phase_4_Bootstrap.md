# Issues — Phase 4 Bootstrap (Pre-Phase-5 Prep)

> **Scope:** Bootstrap work executed after Phase 4.5 close. Covers omission audit application,
> Tier 5 code fixes, and Phase 5 flow-trace review.
> **Branch:** `phase-4/grid-navigation-bit-cards` (commits 64890c5 → 8d89282)

---

## Issue 1: Audit amendments written but never applied

- **Problem:** `docs/OMISSION_AUDIT.md` (2026-03-26) documented 20 amendment actions to
  `EXECUTION_PLAN.md` and `SCHEMA.md`. None were applied before this session — the file existed
  as a report, not an actioned checklist.
- **Root Cause:** No enforcement mechanism tied the audit to a concrete next action. It was written
  in a planning session and left as reference material.
- **Solution:** Applied all 20 amendments in the bootstrap session via subagent dispatch.
- **Learning:** An audit without a close-out step is documentation debt. Treat audit action items
  the same as plan tasks — they need a status and an owner before the session ends.

---

## Issue 2: Tier 5 architectural deviations accumulated across 4 phases

- **Problem:** Five implementation deviations from the architecture rules built up across Phases 1–4
  without being caught:
  - `useCalendarData` imported `db` directly (bypassed DataStore facade)
  - `node-grid-shell.tsx` fetched parent node with a one-time async call (non-reactive)
  - `breadcrumbs.tsx` fetched ancestor chain with a one-time async call (non-reactive)
  - `providers.tsx` exported a `DataStoreContext`/`useDataStore()` that nothing consumed
  - `sidebarVariants` defined in `layout.ts` but never imported
- **Root Cause:** No architecture conformance review at phase close. `PLANNING_STANDARD.md` didn't
  exist until Phase 4.5 close, so the conformance gate was never run.
- **Solution:** Applied all 5 fixes in bootstrap commit `4dff166`. `PLANNING_STANDARD.md`
  architecture checklist now runs at every phase close.
- **Learning:** Deviations compound. Catching them per-phase (one fix) is far cheaper than
  catching them in bulk (audit + retrofit). The conformance checklist in `PLANNING_STANDARD.md §6`
  is the prevention mechanism going forward.

---

## Issue 3: `useCalendarData` Fix 1 exposed a DataStore API gap

- **Problem:** When fixing the direct `db` import in `useCalendarData`, the DataStore interface
  had no method to fetch *all* active nodes with deadlines across all levels. `getNodes(null)`
  only returns Level 0 (root) nodes. The original `db.nodes.toArray()` returned all levels.
- **Root Cause:** The DataStore interface was designed for per-parent queries, not cross-hierarchy
  aggregation queries needed by the calendar.
- **Solution:** Fixed the import violation (highest priority). The functional limitation
  (L1/L2 nodes missing from calendar) is a pre-existing gap in the DataStore API design,
  not introduced by the fix.
- **Learning:** When fixing a facade violation, check whether the DataStore method you're
  substituting is semantically equivalent. If not, note the gap explicitly — don't silently
  narrow the behavior.

---

## Issue 4: Flow review found 2 hard gaps and 21 weak flows

- **Problem:** The Phase 5 flow-trace review (49 flows traced) found:
  - **G1:** `promoteBitToNode()` had no max-depth guard — a Level 3 Bit promotion would create
    an invalid Level 4 Node.
  - **G2:** Bit completion sinking animation (PRD Section 7) had no Phase 5 owner.
  - **21 weak flows:** Tasks owned the behavior but acceptance criteria were underspecified.
- **Root Cause:** G1 was a plan oversight (formula written without checking the depth constraint).
  G2 was a cross-phase ownership gap (animation deferred to Phase 7 Task 35 but not cross-referenced
  in Task 25a). The 21 weak flows reflect that the plan was amended quickly from the audit, without
  going back through each task with observable acceptance criteria.
- **Solution:** G1 amended (max-depth guard added to Task 25). G2 resolved (explicit defer note
  to Task 35 added in Task 25a). Review status: PASS.
- **Learning:** The inline edit save strategy (blur vs. debounce) affects Tasks 21, 22, 23, and 25c
  and must be decided before Task 21 begins. The Hook 3 force-complete reversal rule must be
  decided before Task 24. The edit-mode / chooser integration (Tasks 20 & 25b) must be decided
  before Task 25b. These are the 3 open decisions going into Phase 5.

---

## Summary

| # | Issue | Resolution |
|---|-------|------------|
| 1 | Audit amendments never applied | Applied all 20 in bootstrap; treat audit items as tasks with owners |
| 2 | 5 Tier 5 deviations accumulated | Fixed in `4dff166`; conformance gate now runs at every phase close |
| 3 | DataStore API gap (L1/L2 nodes in calendar) | Facade fixed; functional gap noted for Phase 6 DataStore work |
| 4 | Flow review: 2 hard gaps + 21 weak flows | Gaps resolved; 3 decisions remain open for Phase 5 start |
