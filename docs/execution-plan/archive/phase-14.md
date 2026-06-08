## Phase 14: Monthly Redesign

> **Purpose:** Redesign the calendar monthly view with horizontally wider date cells, a floating day detail popup instead of a fixed side panel, and draggable placed items for rescheduling.
> **Branch:** `phase-14/monthly-redesign`
> **Canonical refs:** SPEC.md § Routes (calendar routes), DESIGN_TOKENS.md
>
> **Explicit policies:**
> - Monthly: horizontally wider rounded-rectangle cells (not square); day detail = popup overlay (not fixed column)
> - Monthly popup: one popup at a time; X to close; positioned near click
> - Placed calendar items = draggable for rescheduling; cursor affordance only (no drag handles)

### Task 66: Monthly Cell Redesign + Day Detail Popup
- **Status:** `[x]`
- **Files:** `src/app/calendar/monthly/_components/month-grid.tsx` (update), `src/app/calendar/monthly/_components/date-cell-popover.tsx` (rewrite), `src/app/calendar/monthly/page.tsx` (update)
- **Dependencies:** Phase 13 complete
- **Actions:**
  - In `month-grid.tsx`: update date cells from their current shape to **horizontally wider rounded rectangles** (`rounded-xl`, wider aspect ratio). Do not use square cells. Reason: typical viewport is wider than tall, and square cells waste horizontal space in the 2-column (pool + calendar) layout. Reference: `references/monthly.jpg`
  - **Day detail popup:** Replace the current `date-cell-popover.tsx` (if it uses a fixed side panel) with a Radix `Popover` or floating overlay:
    - Clicking a date cell opens a popup overlay **near the clicked cell** (use Radix Popover with `side="bottom"` or `side="right"` and viewport collision handling)
    - Popup shows all items for that day in a list view. Items are clickable → navigate to their grid location (same behavior as current implementation)
    - Popup has an `X` button in the top-right corner to close
    - **One popup at a time:** clicking a different date closes the current popup and opens the new one. Manage via `selectedDate` state on the monthly page
  - In monthly page: remove any fixed 3-column layout (Pool | Calendar | Today Detail). The calendar grid should use the full available width alongside the pool. The popup is an overlay, not a space-consuming panel
  - Placed items in monthly cells must be draggable to other date cells (rescheduling). Use cursor affordance, no drag handles. When an item is dropped on a different date cell, update its deadline to that date
- **Acceptance:**
  - Monthly date cells are horizontally wider rounded rectangles (not square)
  - Clicking a date opens a popup overlay near the cell, not a fixed side panel
  - Popup has an X close button
  - Only one popup is open at a time; clicking another date swaps it
  - Calendar grid uses full available width (no fixed third column)
  - Placed items are draggable between date cells for rescheduling
  - `pnpm build` passes

### Task 67: Monthly Item Representation
- **Status:** `[x]`
- **Files:** `src/app/calendar/monthly/_components/month-grid.tsx` (update), `src/app/calendar/monthly/_components/date-cell-popover.tsx` (update)
- **Dependencies:** Task 66
- **Actions:**
  - In `month-grid.tsx` date cells:
    - Bits: render as small colored **dots** (circle indicator, `h-2 w-2 rounded-full`). Color derived from parent Node's color. Multiple dots stack horizontally; overflow shows a count badge (e.g., `+3`)
    - Nodes: render as small versions of the Node tile (miniature icon + title or icon only) using the Node's color. Consistent with the new Phase 9 square/rounded-square Node design language, but smaller (e.g., `h-6 w-6` icon only)
  - In the popup day detail view: show full item details (icon, title, time if any, parent path) — same richness as the current implementation
  - Reference: `references/monthly.jpg`
  - Keep the entire month visible on one screen. The popup is an overlay; the calendar itself should not scroll vertically for a standard 5-week month
- **Acceptance:**
  - Bits appear as colored dots in monthly cells
  - Nodes appear as small tile icons in monthly cells
  - Popup detail view shows full item information
  - Entire month is visible on one screen (no vertical scroll for the calendar grid)
  - `pnpm build` passes

#### Phase 14 Notes

> **Monthly popup positioning:** Use Radix Popover's built-in viewport collision handling. If the clicked cell is near the bottom-right corner, the popup should flip/shift to remain visible. Test with edge cells explicitly.

> **Placed item drag rescheduling (monthly):** `use-dnd.ts` must detect whether the drag source is a pool item (new scheduling) or a placed item (rescheduling). Same detection pattern as Phase 13's weekly rescheduling.

> **React portal event bubbling:** Radix `PopoverContent` (and any portal) bubbles clicks through the React component tree, not the DOM tree. If an ancestor div has `onClick`, clicks inside the portal will reach it — including the X button and item clicks. Fix: add `onClick={(e) => e.stopPropagation()}` to `PopoverContent`.

> **Whole-cell click + controlled Popover:** When making an outer div clickable to open a popup, the inner `PopoverTrigger` button needs `onClick={(e) => e.stopPropagation()}` to prevent the cell div's `onClick` from double-firing. Otherwise, clicking the trigger button calls both Radix's toggle handler and the outer div's open handler.

> **`useDraggable` requires component-level hooks:** dnd-kit hooks cannot be called in a loop. Create sub-components (`DraggableNodeTile`, `DraggableDot`) to call `useDraggable` once per item type.

> **dnd-kit scale + translate conflict:** Applying `scale(0.95)` as a separate CSS class while dnd-kit controls `transform` causes conflicts. Merge both into a single string via a helper: `translate3d(x, y, 0) scale(0.95)`.

> **Draggable items inside `<button>`:** Nested interactive semantics (draggable button inside a date-header button) are invalid HTML and break keyboard/screen-reader behavior. Outer cell must be a `<div>`; `PopoverTrigger` wraps only the date-header button; preview items row is a sibling div.

> **`transition` class expands to `transition-all`:** Bare `transition` violates the project no-transition-all rule. Use `transition-[property1,property2,...]` with explicit properties.

> **Full issue log:** `docs/issues/Issues_Phase_14.md`

---

> **Batch 1 — Lifecycle System (Phases 15–19).** Promoted from `docs/brainstorming/2026-04-28-lifecycle-system-foundation/PROMOTION_MAP.md` (approved). Derived from amended SCHEMA.md / SPEC.md / DESIGN_TOKENS.md. Visual realization for Quick Capture / Command Palette is governed by `docs/recipes/*-visual-recipe.md`. Dependency order: 15 (foundation) → 16 (quick capture) → 17 → 18 (inbox/triage) → 19 (archive). **Scope guards (all phases):** no quarterly-calendar-view; no Batch 2 theme work; no Search redesign (palette key `2` opens the existing Search overlay); no Create-modal redesign (reuse existing create dialogs); Grid DnD is partial only (Inbox/Triage compact-token DnD; no full grid rework).

