# Flow-Trace Review — Phase 13: Weekly Redesign

**Reviewed:** 2026-04-18
**Inputs:** SPEC.md, EXECUTION_PLAN.md §Phase 13, current source (day-column.tsx, weekly/page.tsx, calendar-store.ts, use-dnd.ts, compact-bit-item.tsx, items-pool.tsx)

## Flow-Trace Table

| # | User Flow | Trigger | Intended Outcome | Owning Task | Boundary Cases | Status |
|---|-----------|---------|------------------|-------------|----------------|--------|
| F1 | Open weekly view on a week containing today | Navigate to `/calendar/weekly` | Today's column is wider (expanded) by default | T64 | Week containing today vs. not | ✅ |
| F2 | Open weekly view on a week NOT containing today | Navigate to past/future week | Monday (index 0) column is wider by default | T64 | Must check whether today is in the displayed week range | ✅ |
| F3 | Click a non-expanded day header | Click date number/label in a collapsed column | That column expands with smooth `motion.div layout` animation; previous column contracts | T64 | Single expanded column invariant | ✅ |
| F4 | Click the already-expanded day header | Click date number/label in expanded column | No effect | T64 | Prevents unnecessary state churn | ✅ |
| F5 | Content overflows in a day column | Many items placed in one day | Column does NOT grow wider; content scrolls internally (`overflow-y-auto`) | T64 | Today's column with many items must still constrain width | ✅ |
| F6 | Drag a placed Bit/Node from one day column to another | useDraggable on placed item + drop on different day column | Deadline updates to the new target day | T65 | Placed items in day columns currently NOT draggable — requires adding useDraggable | ⚠️ |
| F7 | Drag a placed item back to the Items Pool | useDraggable on placed item + drop on pool | Deadline cleared (item unscheduled, returns to pool) | T65 | `calendar-unschedule` drop kind already handled in use-dnd.ts; works once items are draggable | ✅ |
| F8 | Hover a placed calendar item | Mouse over placed item in day column | `cursor-grab` shown | T65 | CSS-only affordance; no drag handle icon | ✅ |
| F9 | Pool item unschedule button | Click right-side icon on pool item | Trash2 icon shown (not ✕); same unschedule action | T65 | CompactBitItem is shared between pool and day columns — see Gap G1 | ⚠️ |
| F10 | Pool item drag handle | Visual scan of pool item left side | No GripVertical icon visible | T65 | CompactBitItem is shared — same concern as G1 | ⚠️ |

---

## Gaps Found

| # | Flow | Gap Type | Description | Recommended Resolution |
|---|------|----------|-------------|----------------------|
| G1 | F9, F10 | Weak ownership — shared component | `CompactBitItem` is used both in ItemsPool and in DayColumn (for Chunks). T65 says to remove the GripVertical drag icon and replace ✕ with Trash2 **on pool items**. Applying these changes globally would break day-column chunk rendering (placed chunks should have cursor affordance, not a trash icon). The task does not specify how to differentiate pool vs placed rendering. | Add a `variant` prop to `CompactBitItem` (`"pool" \| "placed"`), or extract a dedicated pool row component. The plan's acceptance criteria (`pool items have Trash2`, `no left-side drag icon`) implicitly require this distinction. Amend T65 acceptance criteria to explicitly call out the solution. |
| G2 | F6 | Weak ownership — placed item draggability | Placed Bits and Nodes in DayColumn use `renderSingleItem()` which does NOT call `useDraggable`. Only pool-sourced items via `CompactBitItem` are currently draggable. T65 says "wrap each placed item with `useDraggable`" but doesn't specify the `DragActiveItem` data shape for placed items (which already have a deadline). The existing `handleDragEnd` in `use-dnd.ts` already handles `calendar-date` drops for bits/nodes (sets deadline) — so the handler works as-is once items are draggable. The only concern is that `DragActiveItem` needs `type: "bit" \| "node" \| "chunk"` which the placed items must supply correctly in `data`. | Explicitly note in T65 that `renderSingleItem` in DayColumn must pass correct `data: { id, type, parentId? }` to `useDraggable`. No change to `use-dnd.ts` required for the core reschedule path — the existing calendar-date handler already covers it. |

---

## Implementation Notes (non-blocking)

- **T64 store vs. page state:** The plan adds `expandedDay: number | null` (day index 0–6) to `calendar-store.ts`. The current page uses local `expandedDateKey` (date string). After migration, the page must compute the *resolved* expanded day as: `expandedDay ?? (isCurrentWeek ? todayDayIndex : 0)`. This resolution logic belongs in the page, not the store (store only tracks the explicit user override). This is architecturally sound — no gap, just worth noting for the implementer.
- **T65 rescheduling detection:** The Phase 13 Note says `use-dnd.ts` must detect "pool item vs placed item." In practice, `handleDragEnd` doesn't need explicit detection — both cases produce a `calendar-date` drop and both update `deadline`. The distinction is only relevant for the unschedule path (pool drop), which already works. No extra detection logic is required.

---

## Summary

- Flows traced: 10
- Fully owned: 8
- Weak: 2 (G1, G2)
- Gaps: 0
- Deferred: 0
- **Status: PASS** — two weak points require pre-implementation clarification (G1 on CompactBitItem variant, G2 on placed-item draggable data shape), but neither blocks T64.
