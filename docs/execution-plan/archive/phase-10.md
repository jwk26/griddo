## Phase 10: Breadcrumb + Deadline UX

> **Purpose:** Redesign the breadcrumb as a compact contextual surface, add deadline quick-edit, surface parent Node deadlines in Bit Detail, enforce L0 no-deadline policy, add optional deadline to Node creation, and redesign deadline input around a date-first interaction model.
> **Branch:** `phase-10/breadcrumb-deadline-ux`
> **Canonical refs:** SCHEMA.md (deadline fields, deadlineAllDay), DESIGN_TOKENS.md
>
> **Explicit policies:**
> - L0 Node = no deadline (UI + read-surface enforcement — hide deadline field in L0 create/edit, exclude L0 Nodes from calendar/urgency read paths)
> - `Week` pill = 7 days later from today
> - No explicit time selected = `deadlineAllDay = true`
> - All-day hierarchy comparison = `23:59:59.999` in local timezone for the selected date
> - Deadline quick-edit = deadline-only shortcut, does not replace full `EditNodeDialog`
> - Parent deadline label = `"Parent deadline"` (tooltip: `"Child deadline cannot exceed this"`)

### Task 54: Compact Breadcrumb Redesign
- **Status:** `[x]`
- **Files:** `src/components/layout/breadcrumbs.tsx` (rewrite), `src/app/globals.css` (update), `src/components/layout/grid-runtime.tsx` (update)
- **Dependencies:** Phase 9 complete
- **Actions:**
  - Redesign `breadcrumbs.tsx` from a full-width `border-b` navigation strip to a compact contextual block embedded into the grid surface. With max 4 levels (Home > L0 > L1 > L2), the breadcrumb should be a small floating/inline element, not a full-width bar
  - Remove the `h-breadcrumb` fixed height and `border-b border-border` styling. The breadcrumb should sit within the grid content area, not above it as a separate strip
  - Position the breadcrumb in the top-left of the grid area, overlaid on the grid surface with appropriate padding and a subtle background (e.g., `bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5`)
  - Keep all existing functionality: navigation via click, droppable segments for ancestor move, segment highlighting on drag-over
  - In `grid-runtime.tsx`: update the layout so the breadcrumb floats within the grid content area rather than occupying a dedicated layout row above it
  - In `globals.css`: remove `--breadcrumb-height` if it exists, or any `h-breadcrumb` utility. Update content margin calculations that depended on the breadcrumb strip height
- **Acceptance:**
  - Breadcrumb renders as a compact floating element in the top-left of the grid area
  - No full-width navigation strip visible
  - Navigation, drag-drop onto segments, and ancestor move confirmation all still work
  - Grid content occupies the full vertical space (no dedicated breadcrumb row)
  - `pnpm build` passes

### Task 55: Node Deadline Quick-Edit Surface
- **Status:** `[x]`
- **Files:** `src/components/layout/breadcrumb-deadline.tsx` (create), `src/components/layout/breadcrumbs.tsx` (update), `src/hooks/use-node-actions.ts` (update if needed)
- **Dependencies:** Task 54, Task 58 (date-first input component)
- **Actions:**
  - Create `breadcrumb-deadline.tsx`: a small component rendered below the compact breadcrumb. Accepts `nodeId` and reads the current Node via `useNode`
  - When the Node has no deadline, render nothing
  - When the Node has a deadline, render the formatted deadline as clickable text (e.g., `"Due Apr 15"` or `"Due Apr 15, 3:00 PM"`)
  - On click, open a Popover containing the `DateFirstDeadlinePicker` component (from Task 58). Pre-populate with the current deadline
  - On date selection: validate against child Bits via deadline hierarchy check. If shortening creates a conflict with any child Bit deadline, show `DeadlineConflictModal` (existing component). On confirm, update the Node deadline via `useNodeActions.updateNode`
  - On clear: remove the deadline (`deadline: null, deadlineAllDay: false`)
  - In `breadcrumbs.tsx`: render `<BreadcrumbDeadline nodeId={nodeId} />` below the breadcrumb block when `nodeId` is not null
- **Acceptance:**
  - When viewing a Node with a deadline, the deadline text appears below the compact breadcrumb
  - Clicking the deadline opens a popover with the date-first picker
  - Selecting a new date updates the Node deadline
  - Shortening the deadline triggers conflict validation against child Bits
  - Clearing the deadline removes it from the Node
  - When viewing a Node without a deadline, no deadline text appears
  - At L0 (Home), no deadline quick-edit appears (no nodeId)
  - `pnpm build` passes

### Task 56: Parent Node Deadline in Bit Detail
- **Status:** `[x]`
- **Files:** `src/components/bit-detail/bit-detail-popup.tsx` (update), `src/hooks/use-bit-detail.ts` (update if `parentNode` is not already exposed)
- **Dependencies:** Phase 9 complete
- **Actions:**
  - In `bit-detail-popup.tsx`: after the Bit's own deadline section, add a parent deadline display. `parentNode` is already resolved via `useBitDetail` (the hook reads the parent Node for hierarchy validation)
  - Render only when `parentNode?.deadline` is not null
  - Display at the very bottom of deadline-related content (below Bit deadline, above chunks/actions). Layout hierarchy: Bit deadline first (child), parent deadline last (final constraint)
  - Label: `"Parent deadline"` in `text-xs text-muted-foreground`
  - Format the deadline using `date-fns` `format` (same format as Bit deadline display)
  - Add a title/tooltip attribute: `"Child deadline cannot exceed this"`
  - Read-only display — no editing from this surface (editing is via the breadcrumb quick-edit in Task 55 or the full `EditNodeDialog`)
- **Acceptance:**
  - When a Bit's parent Node has a deadline, it appears labeled `"Parent deadline"` below the Bit's own deadline
  - When the parent Node has no deadline, nothing extra renders
  - The parent deadline is formatted consistently with the Bit's own deadline
  - Tooltip on hover shows `"Child deadline cannot exceed this"`
  - `pnpm build` passes

### Task 57: L0 Deadline Enforcement + Create Node Deadline
- **Status:** `[x]`
- **Files:** `src/components/grid/edit-node-dialog.tsx` (update), `src/components/grid/create-node-dialog.tsx` (update), `src/components/layout/grid-runtime.tsx` (update)
- **Dependencies:** Phase 9 complete
- **Actions:**
  - **L0 enforcement (UI + read surfaces):**
    - In `edit-node-dialog.tsx`: accept `level` as a prop (or derive from the Node's `level` field). When `level === 0`, hide the entire deadline section. Existing L0 Nodes with deadlines set before this change will not have their deadlines shown or editable — effectively hidden
    - In `create-node-dialog.tsx`: accept `level` as a prop from `grid-runtime.tsx`. At L0 (`level === 0`), do not render the deadline input. At L1+ (`level >= 1`), render the optional deadline input (see below)
    - **Read-surface exclusion:** L0 Node deadlines must also be excluded from read surfaces so they cannot create hidden-but-active state. Specifically:
      - `use-calendar-data.ts`: filter out Nodes with `level === 0` from calendar deadline queries (weekly items, monthly items, pool items)
      - `use-global-urgency.ts`: exclude Nodes with `level === 0` from urgency scanning
      - Any other deadline-driven read surface that displays or acts on Node deadlines must skip L0 Nodes
    - No schema-level Zod rejection. The schema still allows `deadline` on any Node. Enforcement is at the UI write layer + read-surface filtering layer
  - **Optional deadline in Create Node (L1+ only):**
    - In `create-node-dialog.tsx`: add an optional deadline section below the icon/color picker when `level >= 1`. Use the `DateFirstDeadlinePicker` component (from Task 58). Default: no deadline selected
    - Update `onSubmit` values type to include `deadline: number | null` and `deadlineAllDay: boolean`
    - In `grid-runtime.tsx` `handleCreateNode`: pass `deadline` and `deadlineAllDay` through to `createNode`. Default both to `null` / `false` when not set
  - **Level prop threading:** `grid-runtime.tsx` already computes `displayLevel`. Pass it to the create/edit dialog components
- **Acceptance:**
  - At L0: Create Node dialog has no deadline input; Edit Node dialog hides deadline section
  - At L1+: Create Node dialog shows optional deadline input with date-first picker
  - Creating a Node with a deadline persists it correctly
  - Creating a Node without a deadline works the same as before
  - Existing L0 Nodes with deadlines: deadline is hidden in edit dialog and ignored by calendar/urgency read surfaces
  - L0 Nodes do not appear in calendar deadline queries (weekly, monthly, pool)
  - L0 Nodes do not contribute to global urgency badge
  - Creating a child Node with a deadline exceeding its parent Node's deadline is prevented — enforced at both UI level (`CreateNodeDialog` validation) and datastore level (`createNode` path in `indexeddb.ts`)
  - `pnpm tsc --noEmit` passes
  - `pnpm build` passes

### Task 58: Date-First Deadline Input
- **Status:** `[x]`
- **Files:** `src/components/shared/date-first-deadline-picker.tsx` (create), `src/components/bit-detail/bit-detail-popup.tsx` (update), `src/components/grid/edit-node-dialog.tsx` (update)
- **Dependencies:** Phase 9 complete
- **Actions:**
  - Create `date-first-deadline-picker.tsx` as a shared component. Props: `value: { deadline: number | null; deadlineAllDay: boolean }`, `onChange: (value: { deadline: number | null; deadlineAllDay: boolean }) => void`, `onClear?: () => void`
  - Visible structure (horizontal row of pill buttons + icons):
    - `Today` pill: sets deadline to today. No time → `deadlineAllDay = true`
    - `Week` pill: sets deadline to 7 days from today (same time-of-day or all-day). No time → `deadlineAllDay = true`
    - `Calendar` icon button: opens a date picker (shadcn `Calendar` component in a `Popover`). Selecting a date sets the deadline. No time → `deadlineAllDay = true`
    - `Clock` icon button: opens a time picker (hour/minute inputs or a time select). Selecting a time sets `deadlineAllDay = false` and combines with the current date. If no date is set yet, use today
  - **All-day rule:** if the user selects only a date (via Today, Week, or Calendar) without explicitly setting a time via the Clock icon, the deadline is stored as `deadlineAllDay = true`. The timestamp is set to `00:00:00.000` local time on that date. For hierarchy comparison purposes, all-day deadlines are treated as `23:59:59.999` local time — this logic lives in the comparison/validation code, not in the picker component
  - Remove the current `"All day"` toggle from any deadline input surfaces. The concept is handled implicitly by whether the user sets a time
  - Replace existing deadline inputs in `bit-detail-popup.tsx` and `edit-node-dialog.tsx` with `DateFirstDeadlinePicker`
  - Preserve the existing `deadline` and `deadlineAllDay` schema fields — no schema changes
- **Acceptance:**
  - `Today` pill sets deadline to today (all-day)
  - `Week` pill sets deadline to today + 7 days (all-day)
  - `Calendar` icon opens date picker; selecting a date sets an all-day deadline
  - `Clock` icon opens time picker; selecting a time makes the deadline time-specific
  - No visible "All day" toggle in the UI
  - Existing deadline editing surfaces (Bit Detail, Edit Node) use the new picker
  - Deadline hierarchy validation treats all-day deadlines as `23:59:59.999` local
  - A shared all-day deadline comparison utility/rule exists (normalizes `deadlineAllDay` timestamps to `23:59:59.999` local before comparison)
  - All hierarchy validation paths use the shared rule consistently — UI conflict checks (`DeadlineConflictModal` trigger) and datastore-level validation (`assertBitDeadlineFitsParent`, `assertChunkTimeFitsBit`) agree on the same normalization
  - `pnpm build` passes

### Task 59: Dynamic Protected Breadcrumb Zone
- **Status:** `[x]`
- **Files:** `src/lib/utils/breadcrumb-zone.ts` (create), `src/lib/utils/bfs.ts` (update), `src/components/grid/grid-view.tsx` (update — suppress `+` on blocked cells), `src/hooks/use-dnd.ts` (update), `src/lib/grid-dnd.ts` (update — collision filtering), `src/components/layout/grid-runtime.tsx` (update — expose zone via context)
- **Dependencies:** Task 54, Task 55 (the deadline line contributes to the cluster footprint)
- **Origin:** `docs/issues/Issues_Phase_10.md` mi-5 — breadcrumb cluster overlaps top-row grid items. Promoted from user-reported issue because the fix requires a new layout rule affecting all placement paths and its own acceptance criteria. Migration split to Task 59b per ED-3.
- **Actions:**
  - **Dynamic zone derivation (not a fixed cell count):** Compute the blocked cell set from the actual rendered breadcrumb cluster footprint (breadcrumb pill + optional deadline line from Task 55) at placement time. Measure the cluster via `ResizeObserver` or `useLayoutEffect` + `getBoundingClientRect` on the cluster wrapper in `breadcrumbs.tsx`. Translate pixel rect to `{x, y}` cell coordinates using the same cell-size math used by `GridView` (grid cols, grid gap, inset). Expose the blocked cells as a `Set<string>` keyed by `"x,y"` via React context (preferred — passes through `AddFlowProvider`) or a Zustand slice
  - Create `src/lib/utils/breadcrumb-zone.ts` with pure helpers: `rectToBlockedCells(rect, gridMetrics) → Set<string>`, `isCellBlocked(x, y, blocked) → boolean`, and a hook-free pixel-to-cell projection that can be unit tested
  - **BFS auto-placement exclusion:** `findNearestEmptyCell(occupied, originX, originY)` must treat blocked cells as occupied. Option A (recommended): accept an optional `blocked: Set<string>` parameter and merge with `occupied` at the top of the function. Thread the blocked set through create paths so auto-placement never lands in the zone. `grid-runtime.tsx` exposes the blocked set via context; `grid-view.tsx` consumes it for cell affordance and passes it to BFS callers
  - **Manual drag-drop rejection:** In `use-dnd.ts` grid-cell drop handler, reject drops onto cells inside the blocked set (no move, optional toast `"Cell reserved by breadcrumb"`). In `gridCollisionDetection`, exclude blocked cells from collision candidates so the drop indicator never highlights them during drag
  - **Click-to-add rejection:** `AddFlowProvider.openAddAtCell` must skip blocked cells. Suppress the `+` affordance on blocked cells — do not silently create elsewhere via BFS (silent relocation reads as a bug)
  - **No live reflow on edit:** When the user edits a node/bit title and the breadcrumb visual width changes, existing items **do not reposition**. Only new placements and drag targets respect the updated zone. This prevents disorienting reflow during typing
  - **Cross-parent landing:** When an item is moved to a different parent (via breadcrumb drop or node drop), BFS placement in the target grid must also respect blocked cells. For target grids that are not currently rendered, use a static conservative estimate (`BREADCRUMB_ZONE_COLS` constant covering top-left cells) rather than DOM measurement
  - **Scope: forward-only protection.** This task protects new placements only. Existing items that already overlap the breadcrumb zone are not relocated. Legacy overlap cleanup is tracked separately as Task 59b
  - **Breadcrumb width absorption (unchanged from Task 54 fixes):** Overflow is absorbed inside the breadcrumb pill via `max-w` + `whitespace-nowrap` + horizontal scroll. Task 59 does not change the breadcrumb's own width behavior; it only uses the rendered footprint to compute the blocked zone
- **Acceptance:**
  - At every level (L0/L1/L2/L3), new items created via sidebar `+` never land in the breadcrumb footprint (BFS skips blocked cells)
  - Cell-level `+` affordance is suppressed on blocked cells (no `+` button rendered); clicking a blocked cell does not silently create elsewhere via BFS
  - BFS auto-placement correctly skips blocked cells at all levels
  - Dragging a bit/node onto a blocked cell is rejected (no move; optional toast)
  - Drop indicator during drag never highlights a blocked cell
  - Cross-parent moves (breadcrumb drop, node drop) place items outside the target grid's blocked zone using a static conservative estimate
  - Existing items that already overlap the breadcrumb zone remain in place (no migration — see Task 59b)
  - Existing placements remain stable regardless of subsequent title/deadline edits (no live reflow)
  - Zone shape updates when the deadline line (Task 55) appears or disappears, or when the breadcrumb cluster width changes on navigation
  - At L0, the zone covers the Home pill footprint (small); at L3 with long titles, the zone expands to match
  - `pnpm tsc --noEmit` passes
  - `pnpm build` passes

### Task 59b: Breadcrumb Zone Legacy Overlap Cleanup
- **Status:** `[x]`
- **Files:** `src/lib/utils/breadcrumb-zone.ts` (update), `src/lib/db/indexeddb.ts` (update), `src/lib/db/datastore.ts` (update if needed), `src/components/layout/grid-runtime.tsx` (update — trigger remediation on first grid view per parent)
- **Dependencies:** Task 59
- **Origin:** Split from Task 59 scope narrowing — migration removed from Task 59 to reduce implementation risk. See `docs/issues/Issues_Phase_10.md` for the decision record.
- **Actions:**
  - **Per-parent deferred remediation:** On first grid view per parent, scan existing Nodes/Bits whose `{x, y}` falls inside the current blocked zone. Relocate via BFS to nearest empty cell outside the zone
  - **Per-parent migration marker:** Store migration state per parent (not a single global flag). Use durable meta/settings storage. Atomic write of relocated items + marker
  - **Deterministic processing:** Use combined occupancy across Nodes and Bits. Exclude relocating items from initial occupancy. Process in row-major order. Reserve chosen fallback cells immediately. Fail without setting marker if no legal cell exists
  - **Dev logging:** Log relocations to console in dev mode
- **Acceptance:**
  - On first view of a grid after Task 59b lands, existing items overlapping the breadcrumb zone are relocated to nearest empty cells
  - Migration runs exactly once per parent (marker persisted)
  - Relocations are deterministic (same input → same output)
  - Items already outside the zone are unaffected
  - `pnpm tsc --noEmit` passes
  - `pnpm build` passes

#### Phase 10 Notes

> **Task dependency order:** Task 58 (Date-First Deadline Input) should be implemented early in Phase 10 as Tasks 55 and 57 depend on the `DateFirstDeadlinePicker` component. Task 59 (Dynamic Protected Breadcrumb Zone) depends on Task 54 and Task 55 because the zone is derived from the rendered breadcrumb + deadline cluster. Task 59b (Legacy Overlap Cleanup) depends on Task 59. Recommended order: 58 → 54 → 56 → 57 → 55 → 59 → 59b.

> **Task 59 was promoted from user-reported issue mi-5** during Batch 2 (Task 54 review). See `docs/issues/Issues_Phase_10.md` for the original observation and promotion rationale. Task numbers were shifted by +1 as a result: Tasks 59–66 became 60–67, and Task 67 became Task 68. Subsequently, the original 8-task Phase 11 (Tasks 60–67) was split into four focused phases: Phase 11 (T60–T61, Calendar Shell), Phase 12 (T62–T63, Creation Flows), Phase 13 (T64–T65, Weekly Redesign), Phase 14 (T66–T67, Monthly Redesign). The Quarterly view was at one point slated to become a renumbered Phase 15 (Task 68); it was subsequently **removed from the active plan** and now lives as a deferred idea in `docs/brainstorming/2026-05-26-quarterly-calendar-view` (Non-Promoted in Batch 1). **Phase 15 / Task 68 is now the Batch 1 Lifecycle work** (see "Batch 1 — Lifecycle System" below), not Quarterly.

> **All-day timestamp storage:** The picker stores all-day deadlines with `00:00:00.000` local time. The `23:59:59.999` interpretation is applied only at comparison time (hierarchy validation, urgency calculation, calendar display). This keeps the storage clean while preserving correct end-of-day semantics.

> **L0 deadline enforcement covers UI + read surfaces.** Write surfaces (create/edit dialogs) hide the deadline field at L0. Read surfaces (calendar queries, urgency scanning) filter out L0 Nodes. This prevents hidden-but-active deadline state. Schema-level Zod rejection is deferred — if needed later, add a `refine` on `createNodeSchema` that checks `level === 0 → deadline must be null`.

> **Hook API boundary: validation reads and ResizeObserver writes must go through hooks.** Found at close-out: `breadcrumb-deadline.tsx` called `getChildDeadlineConflicts` directly on DataStore (a read in an event handler), and `grid-runtime.tsx` called `runBreadcrumbZoneMigration` directly (a write in a ResizeObserver callback). Both are violations — the rule "UI components import hooks, not DataStore" applies to reads and writes alike. Fix: add the methods to `useNodeActions` / `useGridActions` and call from there. Also: hooks must not import Zustand — `use-dnd.ts` read `useBreadcrumbZoneStore` directly inside the hook. Fix: pass a `getBlockedCells: () => Set<string>` getter from the component layer instead. Full issue log: `docs/issues/Issues_Phase_10.md` close-1.

> **Full issue log:** `docs/issues/Issues_Phase_10.md`

---

