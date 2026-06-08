## Phase 12: Calendar Creation Flows

> **Purpose:** Wire the calendar sidebar creation entry point (introduced in Phase 11) to actual creation dialogs. Implement Node creation from calendar (unscheduled, `parentId = null`) and Bit creation from calendar with a tree-browsing parent Node selector.
> **Branch:** `phase-12/calendar-creation`
> **Canonical refs:** SPEC.md § Routes (calendar routes), SCHEMA.md (Node/Bit fields)
>
> **Explicit policies:**
> - Calendar-created Nodes = `parentId = null`, visible in Grid L0, no deadline assigned
> - Calendar-created Bits = require explicit parent Node selection via Node browser; created with no date assigned
> - Selected parent in Create Bit must be visibly shown in the dialog (title + path)
> - Create Bit button disabled until a parent Node is selected

### Task 62: Calendar Pool Node Creation
- **Status:** `[x]`
- **Files:** `src/app/calendar/layout.tsx` (update), `src/hooks/use-grid-actions.ts` (update if needed)
- **Dependencies:** Phase 11 complete
- **Actions:**
  - When the sidebar `+` is clicked in calendar mode and the user selects "Node" from the chooser:
    - Open `CreateNodeDialog` (reuse existing component)
    - On submit: create the Node with `parentId = null`, `level = 0`, and BFS auto-placement at the L0 grid. No deadline is set
    - The new Node appears in Grid L0 and (if it has a deadline later) in the calendar pool
  - This is a lightweight reuse of existing creation infrastructure — the only difference from grid creation is the entry point (calendar sidebar vs grid cell `+`)
- **Acceptance:**
  - From calendar, sidebar `+` → Node → opens CreateNodeDialog
  - Created Node appears in Grid L0 with BFS auto-placement
  - Created Node has no deadline (unscheduled)
  - `pnpm build` passes

### Task 63: Calendar Pool Bit Creation + Parent Selector
- **Status:** `[x]`
- **Files:** `src/components/calendar/parent-node-selector.tsx` (create), `src/components/grid/create-bit-dialog.tsx` (update), `src/app/calendar/layout.tsx` (update)
- **Dependencies:** Phase 11 complete
- **Actions:**
  - Create `parent-node-selector.tsx`: a tree-browsing Node selector component. Props: `value: string | null` (selected Node ID), `onChange: (nodeId: string) => void`
    - On open, show all L0 Nodes. Clicking a Node either selects it (if it's the desired parent) or drills into its children (if it has child Nodes)
    - Show each Node with its icon and title. Indicate Nodes that contain child Nodes (e.g., chevron or folder indicator)
    - Breadcrumb-style path at the top of the selector showing the current browsing location
    - "Select" button to confirm the currently viewed Node as the parent, or allow clicking a "Select this node" action on each Node row
    - The selector should be rendered inside a Popover or Dialog
  - Update `create-bit-dialog.tsx`: accept an optional `requireParent?: boolean` prop and optional `defaultParentId?: string | null` prop
    - When `requireParent` is true: show the `ParentNodeSelector` in the dialog. Display the selected parent's title and path. Disable the "Create" button until a parent is selected
    - When `requireParent` is false (default, grid usage): behavior unchanged
  - In calendar layout: when sidebar `+` → Bit is selected, open `CreateBitDialog` with `requireParent={true}`. If the calendar is drilled into a specific Node context, pass that Node as `defaultParentId`
  - Created Bit: `parentId = selected Node`, BFS auto-placement in that Node's grid, no deadline (unscheduled)
- **Acceptance:**
  - From calendar, sidebar `+` → Bit → opens CreateBitDialog with parent selector
  - Parent selector shows L0 Nodes, allows browsing deeper, shows path
  - Create button is disabled until a parent Node is selected
  - Selected parent is visibly displayed (title + path)
  - Created Bit appears in the selected parent's grid with no deadline
  - From grid, CreateBitDialog behavior is unchanged (no parent selector shown)
  - `pnpm build` passes

#### Phase 12 Notes

> **Calendar creation is not scheduling.** Items created from the calendar sidebar `+` are unscheduled by default. The user creates first, then drags onto a date to schedule. This keeps the creation flow lightweight and consistent regardless of entry point.

> **Parent Node selector is the most complex new component.** The tree-browsing Node selector (Task 63) requires a browse-and-select interaction pattern. Consider implementing it as a standalone component reusable for future "pick a Node" interactions (e.g., move-to, reparent).

> **Async-load confirmed-view pattern.** When a component shows a "confirmed" state that depends on async-loaded data (liveQuery), gate the view mode on the stable id and gate the rendered content on the loaded record. `isConfirmed && value` controls the view; `selectedNode` controls the content inside it. Coupling both to the same condition causes a visible flash to the unconfirmed state on mount.

> **`useCalendarData` called unconditionally in `CreateBitDialog`.** React hook rules require unconditional calls, so `useCalendarData()` runs even when `requireParent=false`. The nodes array is only consumed in the selector branch. Acceptable overhead; do not work around it with conditional rendering tricks that move the hook call.

> **Full issue log:** `docs/issues/Issues_Phase_12.md`

---

