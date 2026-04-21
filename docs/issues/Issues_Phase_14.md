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
| Batch 2 — T66B+T67 | T66 (partial) + T67 | Implemented |

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

### Batch 2 — T66B+T67 execution notes

- **Draggable items inside button (prompt fix, HIGH):** Initial Codex prompt would have placed draggable preview items inside the date-header `<button>`, creating nested interactive semantics. Fixed in prompt: outer cell is a `<div>`, `DateCellPopover` wraps only the date-header button, preview items row is a sibling `<div>`.
- **Scale + dnd-kit transform conflict (prompt fix, MEDIUM):** Added `getDragTransform` helper that merges `translate3d` and `scale(0.95)` into a single transform string to avoid dnd-kit override.
- **UX intent corrected — preview items open popup on click:** Initial Batch 2 implementation made only the date header button open the popup. User review clarified this hid item details from preview tiles/dots. Final behavior: clicking preview items opens the date details popup; dragging preview items reschedules them. `event.stopPropagation()` still isolates preview interactions from the date header trigger.
- **`transition` → `transition-[opacity,box-shadow,filter]` (Claude quality pass):** Both `DraggableNodeTile` and `DraggableDot` used `transition` class which expands to `transition-all` (violates project no-transition-all rule). Replaced with specific properties.
- **`useDraggable` in loop (architecture):** dnd-kit requires hooks at component level, not in loops. Codex correctly created `DraggableNodeTile` and `DraggableDot` sub-components.
- **Gemini post-code HIGH — false positive:** Gemini flagged missing preview render logic as HIGH non-compliant, but was shown a truncated snippet with a comment placeholder. Actual implementation has full `previewItems.map` logic with `getPreviewItems` (nodes-first, sliced to 4). All 6 spec items confirmed compliant.
- **Nav button aria-label missing (Codex reviewer MEDIUM, pre-existing → fixed):** ChevronLeft/ChevronRight nav buttons had no `aria-label`. Pre-existing before this batch; fixed post-checkpoint with `aria-label="Previous month"` / `"Next month"`.
- **Node-first ordering displaces earlier bits (Codex reviewer LOW, intentional):** `getPreviewItems` prioritizes nodes before bits/chunks in the overflow slot. This is per spec (Gemini design: "nodes first"). Intentional behavior.
- **Preview item click opened no details (user review MEDIUM):** Batch 2 intentionally made the date header the exclusive popup trigger, but preview node/bit/chunk clicks only stopped propagation and exposed no detail path. Fixed by opening the date details popover from preview tile/dot clicks while preserving draggable surfaces. Added regression tests for node tile and bit dot clicks.
- **Checkpoint wording correction — "Independent tests" line:** The checkpoint said "Skipped — not behavior-heavy." This was imprecise. Correct framing: this batch is mixed with DnD runtime-identity trigger; behavioral smoke test (DnD identity correctness) cannot be proven by unit tests and requires manual runtime verification, which was covered by the "Review now" checks in the checkpoint. The "not behavior-heavy" label should not be applied to batches with DnD runtime-identity triggers.
- **T67 parent path missing from popup (post-checkpoint gap):** T67's action spec lists "icon, title, time if any, parent path" for the popup detail view. Batch 2 did not update `date-cell-popover.tsx` to include parent path. Fixed post-checkpoint: `nodeMap` now passed through `MonthGrid` → `MonthDateCell` → `DateCellPopover`; `getParentLabel` helper shows parent Node title for Bits, parent Bit title for Chunks, and parent Node title for child Nodes.
- **Preview item aria-label update (post-checkpoint):** Changed from `"${title} — drag to reschedule, click for details"` to `"Open ${title} details or drag to reschedule"` — better reflects primary action for keyboard users.
- **Whole-cell click added (post-checkpoint UX improvement):** Outer cell div gets `onClick={() => onOpenChange(true)}` so clicking any empty area opens the popup. Date header button gets `onClick={(e) => e.stopPropagation()}` to prevent double-fire with outer div.
- **React portal bubble bug — PopoverContent X button reopens popup (close-out fix):** React portals bubble click events through the React component tree (not the DOM tree). Without `stopPropagation` on `PopoverContent`, the X button click (inside the portal) bubbled to the outer cell div's `onClick` and immediately reopened the popup. Fixed by adding `onClick={(e) => e.stopPropagation()}` to `PopoverContent`.
