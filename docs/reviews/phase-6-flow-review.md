# Flow-Trace Review — Phase 6: Calendar Views

**Reviewed:** 2026-03-28
**Inputs:** PRD.md (Sections 14, 16, 19, 22-25), SPEC.md (Routes, Calendar layouts), SCHEMA.md (Key Queries), EXECUTION_PLAN.md (Tasks 26-30)
**Existing code reviewed:** `use-calendar-data.ts`, `calendar-store.ts`, `calendar.ts` (animations), `datastore.ts`, `sidebar.tsx`, `use-dnd.ts`, `use-global-urgency.ts`, `deadline-conflict-overlay.tsx`, `deadline-conflict-modal.tsx`

## Flow-Trace Table

| # | User Flow | Trigger | Intended Outcome | Owning Task | Boundary Cases | Status |
|---|-----------|---------|------------------|-------------|----------------|--------|
| 1 | Sidebar calendar button → navigate to `/calendar/weekly` | Click Calendar icon in sidebar | Browser navigates to `/calendar/weekly`; calendar layout renders | Task 26 | Sidebar folded (button hidden); already on calendar route; active state styling | ✅ Owned |
| 2 | Calendar layout: two-panel structure | Route `/calendar/*` loads | Left panel (288px) with Node pool (60%) + Items pool (40%); right panel shows children | Task 26 | Narrow viewport; sidebar open vs closed affecting width | ✅ Owned |
| 3 | Node pool: L0 icons displayed | Calendar layout renders | All Level 0 Nodes shown as icon-only buttons with hover tooltip | Task 26 | Zero L0 Nodes → "No nodes yet" placeholder; many L0 Nodes (scroll); deleted Nodes excluded | ✅ Owned |
| 4 | Node pool: drill-down into Node | Click a Node icon in pool | Pool shows sub-Nodes (chevron) and Bits inside; drill-down path updates | Task 26 | Node with no children → "No items" message; deep hierarchy (L0→L1→L2) | ✅ Owned |
| 5 | Node pool: back navigation | Click `<` back arrow | `popDrillDown()` called; pool shows previous level | Task 26 | Already at root (back arrow hidden/disabled) | ✅ Owned |
| 6 | Node pool: search filter | Type in search input | Filters items in current drill-down level (case-insensitive substring) | Task 26 | Empty results; clear search behavior | ✅ Owned |
| 7 | Weekly view: 7 day columns render | `/calendar/weekly` page loads | Mon-Sun columns with items grouped by day | Task 27 | All days empty ("Drop items here"); items spanning midnight | ✅ Owned |
| 8 | Weekly view: week navigation | Click left/right arrows | `navigateWeek(-1/+1)` updates view | Task 27 | Navigate far into future/past (no items) | ✅ Owned |
| 9 | Day column: items sorted correctly | Items exist on a given day | No-time items at top; timed items sorted earliest→latest | Task 27 | All no-time; all timed; mix of Nodes/Bits/Chunks | ✅ Owned |
| 10 | Day column: single item rendering | Single item in a day | Bit→standard card; Node→icon+tooltip; Chunk→compact item | Task 27 | — | ✅ Owned |
| 11 | Day column: 2+ items compact display | Multiple items in a day | Compact list with colored left border, title, time | Task 27 → Task 28 | Different parent colors; long title truncation | ✅ Owned |
| 12 | Day column: overflow +N more | Items exceed visible space | "+N more" indicator; click expands column (Motion animation); one expanded column at a time | Task 27 | Large N (50+ items); expand while another expanded → auto-collapse | ✅ Owned |
| 13 | Day column: collapse expanded | Column is expanded | ESC or click non-item area collapses | Task 27 | ESC while Bit Detail Popup open → popup closes first (higher priority) | ✅ Owned |
| 14 | Bit click in calendar → popup | Click Bit in day column or compact list | URL updates to `?bit=[bitId]`; Bit Detail Popup opens | Task 27, Task 28 | Already have `?bit=` param; click while column expanded | ✅ Owned |
| 15 | Chunk click in calendar → parent Bit popup | Click Chunk in day column or compact list | URL updates to `?bit=[chunk.parentId]`; parent Bit's popup opens | Task 28 | — | ✅ Owned |
| 16 | Node click in day column | Click Node item in day column | Navigates to `/grid/[nodeId]` | Task 27 | — | ✅ Owned |
| 17 | Completed Bits in calendar | Completed Bit in day column | Strikethrough title + gray/opacity treatment | Task 27, Task 28 | All items completed | ✅ Owned |
| 18 | Completed Chunks in calendar | Completed Chunk in day column | Strikethrough + gray treatment (same as Bits) | Task 28 | — | ✅ Owned |
| 19 | Compact item: parentColor | Compact item renders in day column | Bit→parent Node color; Chunk→grandparent Node color (resolved via Bit.parentId→Node lookup) | Task 28 | — | ✅ Owned |
| 20 | Items pool: Bits + Chunks merged | Calendar left panel bottom renders | All active Bits + Chunks sorted: deadline first (priority rank→time), no-deadline below | Task 28 | Empty pool; large pool (scroll); scheduled items also appear in pool | ✅ Owned |
| 21 | Items pool: drag to schedule | Drag from pool to day column | Deadline/time set on item | Task 28 → Task 30 | Item already has deadline (overwrite) | ✅ Owned |
| 22 | Items pool: unschedule via drag-back | Drag item from day column back to pool | Bit: deadline=null; Chunk: time=null | Task 28 | — | ✅ Owned |
| 23 | Items pool: unschedule via ✗ button | Click ✗ on item in day column | Same as drag-back | Task 28 | — | ✅ Owned |
| 24 | Monthly view: month grid renders | `/calendar/monthly` page loads | 7-column × weeks grid; color indicators on date cells | Task 29 | 4/5/6 week months; empty month | ✅ Owned |
| 25 | Monthly view: month navigation | Click arrows | `navigateMonth(-1/+1)` updates grid | Task 29 | — | ✅ Owned |
| 26 | Monthly: date cell click → popover | Click date cell with items | Popover with all items in list view | Task 29 | Cell with no items; popover edge positioning; many items (scroll) | ✅ Owned |
| 27 | Monthly popover: item click navigates | Click item in popover | Node→`/grid/[nodeId]`; Bit→`/grid/[parentId]?bit=[bitId]`; Chunk→`/grid/[grandparentId]?bit=[parentBitId]` (grandparent resolved via Bit.parentId) | Task 29 | — | ✅ Owned |
| 28 | Monthly: drag from pool to date cell | Drag item to date cell | Deadline/time set to that date | Task 29 → Task 30 | — | ✅ Owned |
| 29 | DnD scheduling: sets deadline + mtime | Drop item on day/date | Bit/Node: updateBit/Node({ deadline, mtime }); Chunk: updateChunk({ time }) (mtime cascades via Hook 1) | Task 30 | — | ✅ Owned |
| 30 | DnD: Chunk exceeds parent deadline | Drop Chunk on day past parent Bit's deadline | `DeadlineConflictModal` mounted in calendar layout; "Update parent" extends Bit deadline; "Cancel" aborts drop | Task 30 | Chunk has no parent deadline (Bit.deadline is null → no conflict) | ✅ Owned |
| 31 | Multi-view sync: calendar ↔ grid | Schedule Bit in calendar, switch to grid | Grid reflects updated deadline; urgency/aging update reactively | Task 30 | — | ✅ Owned |
| 32 | View toggle: Weekly ↔ Monthly | Click toggle in layout header | Route changes; left panel state preserved (drill-down, search via `useCalendarStore`) | Task 26 | — | ✅ Owned |
| 33 | Urgency dot on sidebar Calendar icon | Urgent items exist (Bits or Nodes with deadline ≤3 days) | Colored dot on Calendar icon matching urgency level | Task 26 (render) + Task 30 (Node scanning) | No urgent items (dot hidden); highest urgency wins | ✅ Owned |
| 34 | DataStore facade: use-calendar-data.ts | — | No direct `indexedDBStore` import; uses DataStore interface | Task 30 | — | ✅ Owned |
| 35 | DataStore facade: use-global-urgency.ts | — | No direct `indexedDBStore` import; uses DataStore interface | Task 30 | — | ✅ Owned |
| 36 | DnD hook: calendar scheduling stubs | — | `use-dnd.ts` TODO stubs replaced with working calendar scheduling logic | Task 30 | — | ✅ Owned |
| 37 | DeadlineConflictOverlay on calendar items | Parent deadline shortened → children in conflict | Calendar items show "Modify timeline" blur overlay | — | — | ⏸️ Deferred |
| 38 | "Today" indicator in weekly/monthly | User opens calendar | Current day highlighted | — | — | ⏸️ Deferred |
| 39 | Keyboard navigation in calendar | Arrow keys, Tab, Enter | Navigate between days, items, pools | — | — | ⏸️ Deferred |

## Gaps Found

| # | Flow | Gap Type | Resolution |
|---|------|----------|-----------|
| G1 | Sidebar Calendar button wiring | Plan Omission | **Resolved** — Task 26 amended: `sidebar.tsx` added to Files, action + acceptance criteria added |
| G2 | Chunk deadline conflict modal in DnD | Plan Omission | **Resolved** — Task 30 amended: `DeadlineConflictModal` mounted in `layout.tsx`, conflict detection in `handleDragEnd` |
| G3 | DeadlineConflictOverlay on calendar items | Plan Omission | **Deferred** to Phase 7 — overlay works in grid views; calendar items update reactively. Added to Phase 7 defer notes |
| G4 | `use-calendar-data.ts` facade violation | Architecture | **Resolved** — Task 30 amended: facade cleanup action added |
| G5 | `use-dnd.ts` TODO stubs for calendar | Plan Omission | **Resolved** — Task 30 amended: `use-dnd.ts` added to Files, DnD implementation action added |
| G6 | Calendar urgency dot + Node scanning | Plan Omission | **Resolved** — Split: Task 26 (render dot) + Task 30 (Node scanning + facade fix) |

## Weak Ownership Strengthened

| # | Issue | Resolution |
|---|-------|-----------|
| W1 | Node pool empty states | Task 26: empty state placeholders specified |
| W4 | Single Chunk in day column | Task 27: Chunk→compact item (no "standard card" design) |
| W5 | ESC priority + single expansion | Task 27: ESC priority and auto-collapse specified |
| W6 | Chunk parentColor resolution | Task 28: grandparent Node color via Bit.parentId→Node lookup |
| W7 | Chunk click behavior | Task 28: click opens parent Bit popup via `?bit=[chunk.parentId]` |
| W9 | Chunk navigation from monthly popover | Task 29: grandparentId resolved via chunk.parentId→Bit.parentId |
| W11 | mtime cascade on DnD scheduling | Task 30: mtime included in DnD update payloads |
| W12 | Completed Chunk rendering | Task 28: strikethrough + gray for completed Chunks |
| W13 | Node click in day column | Task 27: click navigates to `/grid/[nodeId]` |

## Summary

- Flows traced: 39
- Fully owned: 36
- Weak: 0 (all strengthened)
- Gaps: 0 (all resolved or deferred)
- Deferred: 3 (conflict overlay, today indicator, keyboard nav)
- Status: **PASS**

All 6 original gaps have been resolved via execution plan amendments (G1-G2, G4-G6) or explicit deferral with rationale (G3). All 9 weak-ownership items have been strengthened with specific acceptance criteria. The plan is ready for implementation.
