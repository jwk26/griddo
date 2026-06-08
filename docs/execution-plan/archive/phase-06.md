## Phase 6: Calendar Views

### Task 26: Calendar Layout + Node Pool
- **Status:** `[x]`
- **Files:** `src/app/calendar/layout.tsx`, `src/components/calendar/node-pool.tsx`, `src/components/layout/sidebar.tsx` (update)
- **Dependencies:** Task 5, Task 7 (calendar-store), Task 24 (use-global-urgency)
- **Actions:**
  - `layout.tsx`: Shared layout for `/calendar/weekly` and `/calendar/monthly`. Two-panel: left panel `w-calendar-pool` (288px, `--calendar-pool-width`) + right content area (`{children}`). Left panel split: Node pool top (60%, `--calendar-node-pool-ratio`) + Items pool bottom (40%)
    - View toggle in layout header: switches between `/calendar/weekly` and `/calendar/monthly` routes
  - `node-pool.tsx`: `"use client"`. Top section of left panel. Uses `useCalendarStore` for drill-down
    - Level 0 Nodes: icon only (tooltip on hover for title)
    - Click Node → drill down: show sub-Nodes (with `>` chevron) + Bits inside
    - Back arrow `<` to navigate up drill-down stack (`popDrillDown()`)
    - Search input within pool to filter items (case-insensitive substring match)
    - Nodes and Bits draggable to the schedule (DnD source)
    - Empty states: no L0 Nodes → "No nodes yet" placeholder. Drill-down into Node with no children → "No items" message
  - `sidebar.tsx` (update): Wire Calendar button `onClick` → `router.push("/calendar/weekly")`. Render urgency dot on Calendar icon using `useGlobalUrgency()` — small colored circle (top-right of icon, matching `--urgency-1/2/3`). Active state styling when on any `/calendar/*` route
- **Acceptance:** Calendar layout renders two-panel at correct widths. Node pool shows Level 0 icons. Drill-down navigates into Nodes. Search filters pool
- Calendar sidebar button navigates to `/calendar/weekly` and shows active state on calendar routes
- Urgency dot renders on Calendar button when any active item has deadline within 3 days
- Layout header includes a Weekly/Monthly view toggle
- Empty Node pool shows placeholder. Drill-down into empty Node shows "No items"
- **Commit:** `feat: add calendar layout with node pool and drill-down navigation`

### Task 27: Calendar:Weekly Page + Day Columns
- **Status:** `[x]`
- **Files:** `src/app/calendar/weekly/page.tsx`, `src/components/calendar/day-column.tsx`
- **Dependencies:** Task 26, Task 10 (use-calendar-data)
- **Actions:**
  - `weekly/page.tsx`: `"use client"`. Right panel: 7 day columns (Mon–Sun). Uses `useCalendarData()` with `weeklyItems(weekStart)`. Week navigation arrows + current week label. Uses `useCalendarStore` for `currentWeekStart`
  - `day-column.tsx`: Single vertical day column. Props: `date: Date`, `items: (Node | Bit | Chunk)[]`
    - Min width: `--calendar-day-min-width` (128px). Tall and scrollable
    - Empty: "Drop items here" placeholder
    - 1 item: Bit → standard Bit card. Node → Node icon with title tooltip. Chunk → compact item (same as 2+ view, since Chunks have no "standard card" design)
    - 2+ items: compact list (Task 28)
    - No-time items at top. Timed items below, sorted earliest → latest
    - Drop zone by item type: Bit → `DataStore.updateBit({ deadline: date })`, Node → `DataStore.updateNode({ deadline: date })`, Chunk → `DataStore.updateChunk({ time: date })`
    - Bit items are clickable: click appends `?bit=[bitId]` to the current URL to open Bit Detail Popup
    - Node items are clickable: click navigates to `/grid/[nodeId]`
    - Completed Bits render with strikethrough title + gray/opacity treatment (consistent with grid BitCard)
    - Overflow `+N more`: click → column expands vertically with Motion layout animation + vignette, hiding adjacent columns. Only one column can be expanded at a time — expanding one auto-collapses any other
    - Collapse: ESC or click non-item area. ESC priority: calendar column collapse is lower than Bit Detail Popup (if popup is open, ESC closes popup first)
- **Acceptance:** 7 day columns render. Items on correct days. Drop sets deadline. Overflow expands/collapses. Week navigation works
- Clicking a Bit in a day column opens Bit Detail Popup via `?bit=[bitId]`
- Completed items render with strikethrough + gray treatment
- **Commit:** `feat: add weekly calendar page with day columns and drag scheduling`

### Task 28: Compact Bit + Items Pool
- **Status:** `[x]`
- **Files:** `src/components/calendar/compact-bit-item.tsx`, `src/components/calendar/items-pool.tsx`
- **Dependencies:** Task 27, Task 10 (use-calendar-data)
- **Actions:**
  - `compact-bit-item.tsx`: Compact design for 2+ items in a day column. Per DESIGN_TOKENS:
    - `flex items-center gap-2 px-3 py-1.5 border-l-4 text-sm` with `style={{ borderLeftColor: parentColor }}`
    - `parentColor` resolution: Bit → parent Node's `color`. Chunk → grandparent Node's `color` (resolve via parent Bit's `parentId` → Node lookup)
    - Title: `flex-1 truncate text-foreground`
    - Time: `text-xs text-muted-foreground flex-shrink-0`
    - Date badge in corner when applicable
    - Clickable: Bit → click appends `?bit=[bitId]` to URL. Chunk → click appends `?bit=[chunk.parentId]` (opens parent Bit's popup). Completed state (Bit `status === "complete"` or Chunk `status === "complete"`): strikethrough + gray treatment
  - `items-pool.tsx`: `"use client"`. Bottom section of calendar left panel. Merged pool of Bits + Chunks only (Nodes are in the separate Node Pool above)
    - Sort: deadline items first (by priority rank → time), no-deadline below
    - Scrollable with search input
    - Items draggable to schedule
    - Unschedule: drag back to pool or ✗ button → Bit: `DataStore.updateBit({ deadline: null })`, Chunk: `DataStore.updateChunk({ time: null })`
- **Acceptance:** Compact items: colored left border + title + time. Pool sorts correctly. Drag to schedule works. Unschedule clears deadline
- Compact items clickable → opens Bit Detail Popup
- Completed items render with strikethrough + gray treatment
- **Commit:** `feat: add compact bit items and calendar items pool with scheduling`

### Task 29: Calendar:Monthly Page
- **Status:** `[x]`
- **Files:** `src/app/calendar/monthly/page.tsx`, `src/app/calendar/monthly/_components/month-grid.tsx`, `src/app/calendar/monthly/_components/date-cell-popover.tsx`
- **Dependencies:** Task 26, Task 10
- **Actions:**
  - `monthly/page.tsx`: `"use client"`. Same left panel as weekly (shared via calendar layout). Right panel: month calendar grid
  - `month-grid.tsx`: Standard 7-column (Mon–Sun) × weeks grid. Left/right arrows for month navigation. Month label. Uses `useCalendarStore` for `currentMonth`
    - Date cells: color indicators for scheduled items (highlight color from parent Node)
    - Drag from pools to date cells → sets deadline to that date
  - `date-cell-popover.tsx`: Click date cell → shadcn `Popover` with all items for that day in list view. Items clickable → navigate by type: Node → `/grid/[nodeId]`, Bit → `/grid/[parentId]?bit=[bitId]`, Chunk → `/grid/[grandparentId]?bit=[parentBitId]` (resolve `grandparentId` by looking up `chunk.parentId` → `Bit.parentId`)
- **Acceptance:** Month grid renders with correct day layout. Items as color indicators. Click date shows popover. Month navigation works. Drag to date sets deadline
- **Commit:** `feat: add monthly calendar page with date grid and item popovers`

### Task 30: Calendar Data Integration
- **Status:** `[x]`
- **Files:** `src/hooks/use-calendar-data.ts` (update), `src/stores/calendar-store.ts` (update), `src/hooks/use-dnd.ts` (update), `src/hooks/use-global-urgency.ts` (update), `src/app/calendar/layout.tsx` (update)
- **Dependencies:** Task 27, Task 28, Task 29
- **Actions:**
  - **DataStore facade cleanup:** Refactor `use-calendar-data.ts` and `use-global-urgency.ts` to use DataStore interface instead of direct `indexedDBStore` imports (same pattern as Phase 5.5 cleanup)
  - **Global urgency Node scanning:** Extend `useGlobalUrgency` to also scan Nodes with deadlines (SCHEMA.md "Global urgency" query specifies `bits, nodes`). Currently only scans Bits
  - Finalize `use-calendar-data.ts`: Ensure `weeklyItems` and `monthlyItems` filter active items only (`deletedAt === null`). Verify pool sort order matches SPEC (deadline first by priority rank, then no-deadline)
  - Finalize `calendar-store.ts`: Wire `navigateWeek` / `navigateMonth` to update `currentWeekStart` / `currentMonth` using `date-fns` (`addWeeks`, `addMonths`)
  - **DnD calendar scheduling** (`use-dnd.ts`): Implement calendar scheduling in `handleDragEnd` — detect drop target as day column or date cell. Bit drop → `DataStore.updateBit({ deadline: targetTimestamp, mtime: Date.now() })`, Node drop → `DataStore.updateNode({ deadline: targetTimestamp, mtime: Date.now() })`, Chunk drop → `DataStore.updateChunk({ time: targetTimestamp })` (Chunk mtime cascades to parent Bit via Hook 1). Unschedule reverses: Bit/Node → clear `deadline`, Chunk → clear `time`. Implement `handleDragOver` for drop-target visual feedback
  - **Deadline conflict on DnD** (`layout.tsx` update): When `handleDragEnd` detects a Chunk drop exceeding parent Bit's deadline, set conflict state. Calendar layout mounts `DeadlineConflictModal` controlled by this state. "Update parent" → extend parent Bit's deadline to the drop date; "Cancel" → abort the drop. Conflict check via `DataStore.getBit(chunk.parentId)` to compare deadlines
  - Verify multi-view consistency (PRD Section 23): changes from calendar reflect on grid via reactive hooks
- **Acceptance:** Calendar data groups correctly. Navigation updates view. Scheduling persists to IndexedDB. Changes sync across calendar and grid views automatically
- No direct `indexedDBStore` imports remain in `use-calendar-data.ts` or `use-global-urgency.ts`
- `useGlobalUrgency` returns urgency from both Bits and Nodes with deadlines
- Dropping a Chunk past parent Bit's deadline shows `DeadlineConflictModal` in calendar layout
- DnD scheduling updates mtime (aging resets on schedule action)
- **Commit:** `feat: integrate calendar data hooks with navigation and multi-view sync`

#### Phase 6 Notes

> **Codex prompt length vs Gemini file reader:** The Gemini post-code review prompt (1950 lines of inlined file contents) triggered `ENAMETOOLONG` errors in Gemini's file reader tools. For future phases with many files, split the prompt into smaller chunks or use file references instead of inline content.

> **Component→DataStore boundary:** Codex wrote unschedule mutations directly in UI components (items-pool.tsx, day-column.tsx). Caught during conformance review and extracted into `useCalendarActions` hook. Watch for this pattern — Codex defaults to the simplest call site, not the architectural boundary.

> **Chunk color resolution:** Codex's colorMap only mapped Node and Bit IDs. Chunks (which need grandparent Node color) were falling back to the border color. Added explicit chunk→parentBit→grandparentNode resolution in use-calendar-data.ts.

> **Sidebar Trash button:** Pre-existing noop visible on calendar routes (and all L0 routes). Not a Phase 6 regression — wiring is Phase 7 Task 31.

> **Full issue log:** `docs/issues/Issues_Phase_6.md`

---

