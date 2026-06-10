# Flow-Trace Review — Phase 15: Lifecycle Schema Foundation (Data-Layer Adaptation)

**Reviewed:** 2026-06-09
**Reviewer:** Claude (inline; see Method note)
**Inputs:** SCHEMA.md, SPEC.md (AD #15), EXECUTION_PLAN.md §Phase 15 (T68–T72), amendment-batch1-lifecycle-flow-review.md, current source (`src/lib/db/schema.ts`, `indexeddb.ts`, `datastore.ts`; `src/hooks/use-grid-data.ts`, `use-calendar-data.ts`, `use-search.ts`; `src/lib/utils/completion.ts`, `bfs.ts`, `urgency.ts`).

---

## Method note — why this is not a standard flow-trace

`PLANNING_STANDARD §3` flow-trace traces **user-visible flows** from PRD/SPEC. Phase 15 is explicitly **data-layer only** (EXECUTION_PLAN §Phase 15: *"No user-facing UI"*). There are zero user flows to trace — running §3 verbatim yields an empty table.

This review therefore substitutes the correct instrument for a UI-less phase: a **data-layer dependency / buildability trace** of T68→T72. It verifies the task chain composes into a working migration + archive + sweep + seeding flow with no missing step. (Logged as Planning-Gate adaptation candidate **C4** in `phase-15-skill-audit.md`.)

## User-visible flow table

| # | User Flow | Status |
|---|-----------|--------|
| — | None — Phase 15 ships no user-facing UI. | N/A |

## Data-layer dependency / buildability trace

Dependency chain: **T68 → T69 → {T70, T71}; T70 → T72.**

| ID | Risk | Owner | Disposition | Status |
|----|------|-------|-------------|--------|
| D1 | T69 upgrade must `backfill` `archivedAt=null` / `systemRole=null` / `hiddenFromGrid=false` on existing `nodes`/`bits`, or the new compound index `idx_*_active_full` `[parentId,deletedAt,archivedAt]` indexes `undefined` and active-item queries silently miss rows. | T69 | T69 actions specify the backfill. Verify at Batch A checkpoint: DB opens at new version, existing rows readable with defaults. | ✅ Owned |
| D2 | T70: a Scratch Bit **hard-delete** must cascade-delete its `scratchBreakdowns` rows; **archive** must **not**. Conflating the two paths causes data loss (archive deletes breakdowns) or orphans (hard-delete leaves them). | T70 | Implement as two distinct paths; assert both directions with explicit tests in Batch B. | ✅ Owned, subtle |
| D3 | T71: `archivedAt = null` must be added to **every** active-item query — grid contents, node completion, calendar items, items pool, badge, global urgency, text search, grid occupancy, aging. Miss one and archived items leak into that surface or BFS occupancy. The amendment review already caught an "archive-sweep table gap" during planning, so this surface is demonstrably easy to under-cover. | T71 | **Highest residual risk.** Enumerate all active-item queries explicitly during Batch C; `PLANNING_STANDARD §6` Blocking item (Lifecycle active-filter) enforces it at closing. Isolated as its own batch for focused review. | ⚠️ Watch |
| D4 | T72: seeded Inbox / Archive nodes default `hiddenFromGrid=false`, and the L0 grid query only hides `hiddenFromGrid=true`. So **after Phase 15 the two system nodes appear on the L0 grid** (their real surfaces arrive in Phase 17/19; until then they are inert). | T72 | Intended per T72 acceptance ("seeds … at L0"). Surfaced for conscious sign-off — nodes are reachable-but-inert during Phases 15–16, which is acceptable for incremental build. No change unless the user wants them seeded hidden. | ⚠️ Intended, surfaced |
| D5 | T72: "re-check on every startup" must not duplicate system nodes. | T72 | App-level uniqueness check (`systemRole` query) before insert; verify restart produces no duplicates at Batch D checkpoint. | ✅ Owned |
| D6 | T72: seeding at L0 must assign `x`/`y` so `(parentId,x,y)` uniqueness (Hook 8) holds — the plan lists `title`/`icon`/`color`/`parentId`/`level` but not coordinates. | T72 | BFS placement from `(0,0)` (Node origin rule) or explicit coords; covered by the existing Hook 8 occupancy check. | 🟡 Minor |

## Summary

- User flows traced: **0** (UI-less phase — N/A).
- Data-layer risks traced: **6** (D1–D6).
- Owned by plan: D1, D2, D5 · Watch-items: D3, D4 · Minor: D6.
- **Blocking: 0.**
- **Status: PASS — Proceed.** Batch C (T71, archive-sweep completeness) carries the highest residual risk and is isolated for focused review; `PLANNING_STANDARD §6` enforces the sweep at closing. D4 is intended behavior, surfaced for sign-off.
