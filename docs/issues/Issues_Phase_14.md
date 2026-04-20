# Issues — Phase 14: Monthly Redesign

## Batch Plan

### Original Proposal

| Batch | Tasks | Classification | Scope |
|-------|-------|----------------|-------|
| Batch 1 — T66A | T66 (partial) | ui-heavy | Monthly Layout + Popup Foundation: wider cells, full-width grid, popup overlay, one popup at a time, X close, edge-cell collision |
| Batch 2 — T66B+T67 | T66 (partial) + T67 | mixed (DnD runtime-identity trigger) | Item Representation + DnD Rescheduling: bit dots, node mini tiles, popup detail view, draggable placed items between date cells |

### Execution Status

| Batch | Tasks | Status |
|-------|-------|--------|
| Batch 1 — T66A | T66 (partial) | Implemented |
| Batch 2 — T66B+T67 | T66 (partial) + T67 | Pending |

### Deviations

T66 was split across two batches (T66A and T66B) at Step 1 before the Original Proposal was written. User rationale: popup foundation can be reviewed independently before item representation and DnD complexity; DnD identity risk deserves its own verification/review path. No deviation to record post-creation — this was the initial approved structure.

---

## Execution Log

### Batch 1 — T66A execution notes

- **X button icon centering (Claude quality pass):** Codex omitted `flex items-center justify-center` from the X button. Applied directly — non-visual structural fix.
- **Accessibility fixes (Gemini post-code HIGH/MEDIUM):** Added `aria-label` to date cell buttons (full date + item count) and `aria-label` on `PopoverContent`. Both applied directly as non-visual accessibility attributes.
- **`toSorted()` + `useMemo` (Gemini MEDIUM, deferred):** `toSorted()` already existed pre-phase 14; list is small. Noted but not blocking.
- **Stale popup on month navigation (checkpoint review MEDIUM):** `selectedDate` was not cleared when navigating months, leaving popup open on out-of-month cells. Fixed by calling `setSelectedDate(null)` before `navigateMonth(-1/1)` in both nav button handlers.
- **Popup item focus-visible styling (checkpoint review LOW):** Pre-existing; item buttons inside the popup lack `focus-visible` ring. Not introduced by T66A; deferred.
