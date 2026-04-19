# Issues — Phase 13: Weekly Redesign

## Batch Plan

### Original Proposal

| Batch | Tasks | Classification | Notes |
|-------|-------|----------------|-------|
| Batch 1 | T64 | ui-heavy | Stable day sizing, today emphasis, motion.div layout animation. State/interaction rules locked; visual decisions owned by Gemini. |
| Batch 2 | T65 | mixed | Placed-item drag rescheduling (logic) + pool row cleanup (visual). Regression reviewer triggered for use-dnd.ts. Files: day-column.tsx, items-pool.tsx, compact-bit-item.tsx, use-dnd.ts. |

### Execution Status

| Batch | Tasks | Status |
|-------|-------|--------|
| Batch 1 | T64 | Implemented |
| Batch 2 | T65 | Implemented |

### Deviations

_None._

---

## Execution Issues

### B1-I1 — calendar-navigation.test.tsx updated by Codex (In Progress)
**Category:** Out-of-plan change (necessary)
**Batch:** 1 (T64)
Codex correctly updated the existing `calendar-navigation.test.tsx` DayColumn mock to match renamed props (`expanded` → `isExpanded`, `onExpandedChange` → `onExpand`) and added 3 behavioral tests for the expansion logic. This was necessary to keep existing tests green after the API rename.

### B1-I2 — Gemini HIGH accessibility fixes applied (In Progress)
**Category:** Post-review fix
**Batch:** 1 (T64)
Gemini post-code review flagged two HIGH accessibility issues:
1. Nav buttons (Previous/Next week) missing `aria-label` — fixed directly (non-visual mechanical fix)
2. Day header button missing keyboard focus ring — added `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1`

### B1-I3 — Gemini MEDIUM items not fixed (In Progress)
**Category:** Advisory / pre-existing
**Batch:** 1 (T64)
Two MEDIUM items flagged but not fixed: (1) date range `<span>` should be `<h2>` — pre-existing issue not introduced by this batch; (2) `isMonthlyRoute` duplication across view switcher buttons — pre-existing pattern, unchanged.

### B2-I1 — Gemini MEDIUM accessibility fixes applied (In Progress)
**Category:** Post-review fix
**Batch:** 2 (T65)
Gemini post-code review flagged MEDIUM accessibility issue: `PlacedNodeCard`, `PlacedBitCard`, and `CompactNodeItem` open buttons were missing `aria-label`. Added `aria-label={\`Open ${title}\`}` to all three surfaces. Non-visual, applied directly.

### B2-I2 — Test queries updated after aria-label addition (In Progress)
**Category:** Out-of-plan change (necessary)
**Batch:** 2 (T65)
Three `day-column.test.tsx` queries used `{ name: "Roadmap" }` / `{ name: "Ship Phase 4" }` (raw title). After aria-labels were added, queries now expect `"Open Roadmap"` / `"Open Ship Phase 4"`. Updated to keep tests green.

### B2-I3 — Gemini MEDIUM contrast risk advisory (In Progress)
**Category:** Advisory / pre-existing
**Batch:** 2 (T65)
Gemini flagged `text-white` hardcoded on node icon inside colored circle — may fail contrast for light node colors. Pre-existing pattern unchanged by T65; not introduced by this batch. Not fixed.

### B2-I4 — Gemini LOW focus-visible rings advisory (In Progress)
**Category:** Advisory / pre-existing
**Batch:** 2 (T65)
Gemini flagged missing `focus-visible` rings on inner buttons across placed item surfaces. Pre-existing pattern in the calendar component; not introduced by this batch. Not fixed.
