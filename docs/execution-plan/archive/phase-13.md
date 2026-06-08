## Phase 13: Weekly Redesign

> **Purpose:** Redesign the calendar weekly view with stable day column sizing, today emphasis via expanded width, and drag rescheduling of already-placed items.
> **Branch:** `phase-13/weekly-redesign`
> **Canonical refs:** SPEC.md § Routes (calendar routes), DESIGN_TOKENS.md
>
> **Explicit policies:**
> - Stable day section footprint with internal scroll; today section wider by default; click-to-expand other days
> - Placed calendar items = draggable for rescheduling; cursor affordance only (no drag handles)

### Task 64: Weekly Stable Day Sizing + Today Emphasis
- **Status:** `[x]`
- **Files:** `src/components/calendar/day-column.tsx` (update), `src/app/calendar/weekly/page.tsx` (update), `src/stores/calendar-store.ts` (update)
- **Dependencies:** Phase 12 complete
- **Actions:**
  - In `calendar-store.ts`: add `expandedDay: number | null` state (day index 0–6, `null` = use default rule) and `setExpandedDay` action
  - **Default expanded-day rule:**
    - If the displayed week includes today: today's column is expanded by default (`expandedDay` resolves to today's day index when `null`)
    - If the displayed week does not include today: the first visible day column (index 0, Monday) is expanded by default
    - This ensures exactly one column is always expanded, providing a stable layout regardless of navigation
  - In `day-column.tsx` / weekly page: replace content-driven column width with a fixed layout model:
    - Each day column has a fixed base width (e.g., `flex-1`)
    - The expanded column (today or selected) gets a wider allocation (e.g., `flex-[2]` or `flex-[1.5]`)
    - Content overflow within a day column scrolls internally (`overflow-y-auto`) rather than expanding the column
  - Remove the current border-color-only today emphasis. The expanded column should be visually distinct via width and subtle surface color (e.g., slightly lighter/warmer background)
  - Clicking a non-expanded date header expands that day (animates width increase) and contracts the previously expanded day. Use `motion.div` `layout` animation for smooth width transition
  - Only one day can be expanded at a time. Clicking the already-expanded day has no effect
- **Acceptance:**
  - Day columns have stable widths that don't fluctuate with content
  - When the displayed week includes today: today's column is wider by default
  - When the displayed week does not include today: the first day column (Monday) is wider by default
  - Exactly one column is always expanded
  - Content-heavy days scroll internally rather than expanding
  - Clicking another day header expands it with smooth animation
  - Only one day is expanded at a time
  - `pnpm build` passes

### Task 65: Weekly Drag Rescheduling + Pool Cleanup
- **Status:** `[x]`
- **Files:** `src/components/calendar/day-column.tsx` (update), `src/components/calendar/items-pool.tsx` (update), `src/hooks/use-dnd.ts` (update)
- **Dependencies:** Task 64
- **Actions:**
  - **Placed items draggable:** Items already placed in a day column must be draggable. Wrap each placed item with `useDraggable`. On drag-end to a different day column: update the item's deadline to the target day. On drag-end back to the pool: clear the deadline (unschedule)
  - **Cursor affordance:** Set `cursor-grab` on placed items, `cursor-grabbing` during drag. Do not add visible drag-handle icons
  - **Pool row cleanup:**
    - Remove the left-side drag icon from each pool item
    - Replace the right-side `X` (unschedule) icon with `Trash2` icon from lucide-react (matching Bit Detail's delete/trash affordance)
  - In `use-dnd.ts`: ensure `handleDragEnd` handles the case where a placed calendar item (not just a pool item) is dropped on a different day column — update deadline to the new day
- **Acceptance:**
  - Items placed in a weekly day column are draggable to other day columns (rescheduling)
  - Dragging a placed item to the pool unschedules it (clears deadline)
  - Placed items show `cursor-grab` on hover, `cursor-grabbing` while dragging
  - No drag-handle icons on placed items
  - Pool items have no left-side drag icon
  - Pool items have `Trash2` icon instead of `X` for unschedule action
  - `pnpm build` passes

#### Phase 13 Notes

> **Placed item drag rescheduling (weekly):** `use-dnd.ts` must detect whether the drag source is a pool item (new scheduling) or a placed item (rescheduling). Pool items have no deadline; placed items have a deadline that needs to be updated to the new target day.

> **dnd-kit duplicate ID conflict:** `poolItems` includes ALL active items regardless of deadline, so scheduled items register in both the pool and day column under the same `item.id`. Any phase that adds `useDraggable` to a second surface for the same item must namespace the registration ID (e.g., `` `placed:${item.id}` ``). Keep `data: { id: item.id }` unchanged so `handleDragEnd` reads the real ID from event data, not the namespaced key.

> **react/display-name in icon factories:** Arrow functions returned from factory helpers have no display name and fail the `react/display-name` lint rule. Pattern: `const Icon = (...) => <svg/>; Icon.displayName = name;` before returning.

> **Full issue log:** `docs/issues/Issues_Phase_13.md`

---

