## Phase 9: Grid UX Improvements

> **Purpose:** Fix broken delete buttons, restructure grid layout architecture with route-group + GridRuntime, fix DnD collision resolution, enable DnD outside edit mode, improve create dialogs, add visual polish, close-out DnD reliability + visual polish refinements, and amend grid interaction/visual policy per the consolidated UX proposal (Tasks 48–53).
> **Branch:** `phase-9/grid-ux-improvements`
> **Canonical refs:** SPEC.md § Phase 9 PRD Departures, § Page Layouts, § Routes; DESIGN_TOKENS.md § Level Depth Backgrounds, § Sidebar
> **PRD departures:** 4 intentional departures from the PRD documented in SPEC.md § Phase 9 PRD Departures

### Task 39: Delete Buttons + Confirmation Modal
- **Status:** `[x]`
- **Files:** `src/hooks/use-grid-actions.ts` (update), `src/components/grid/delete-confirm-dialog.tsx` (create), `src/components/grid/node-card.tsx` (update), `src/components/grid/bit-card.tsx` (update), `src/components/grid/grid-view.tsx` (update)
- **Dependencies:** Phase 8 complete
- **Actions:**
  - Add `softDeleteNode` and `softDeleteBit` callbacks to `use-grid-actions.ts`, calling through to `DataStore.softDeleteNode` / `DataStore.softDeleteBit`
  - Create `delete-confirm-dialog.tsx` using shadcn `AlertDialog`. Accepts `pendingDelete: { id: string; type: "node" | "bit"; title: string } | null`, `onConfirm`, `onCancel`. Node delete copy warns about cascade ("and all its child nodes and bits"). Destructive variant on confirm button
  - Add `onDelete` callback prop to `NodeCard` and `BitCard`. X button calls `onDelete(item)` with `event.stopPropagation()` preserved
  - In `GridView`: add `pendingDelete` state, `handleDeleteRequest` (stages the pending delete from any grid item), `handleDeleteConfirm` (calls appropriate soft-delete action). Pass `onDelete={handleDeleteRequest}` through `DraggableNodeCard` and `DraggableBitCard` to the card components. Render `DeleteConfirmDialog` at the end of the component
- **Acceptance:**
  - In edit mode, clicking X on a node shows confirmation dialog with cascade warning text
  - In edit mode, clicking X on a bit shows confirmation dialog with simple warning text
  - Confirming deletes the item (disappears from grid via `useLiveQuery` reactivity)
  - Cancelling closes the dialog, item stays
  - Clicking X does not trigger card click/navigation
  - `pnpm build` passes

### Task 40: Route-Group Grid Layout + GridRuntime
- **Status:** `[x]`
- **Files:** `src/lib/utils/color.ts` (create), `src/components/layout/add-flow-context.tsx` (create), `src/components/layout/grid-runtime.tsx` (create), `src/app/(grid)/layout.tsx` (create), `src/app/(grid)/page.tsx` (create), `src/app/(grid)/grid/[nodeId]/page.tsx` (create), `src/app/page.tsx` (delete), `src/app/grid/[nodeId]/page.tsx` (delete), `src/components/layout/level-0-shell.tsx` (delete), `src/app/grid/[nodeId]/_components/node-grid-shell.tsx` (delete)
- **Dependencies:** Task 39
- **Actions:**
  - Extract `hexToHsl` from `level-0-shell.tsx` (duplicated in `node-grid-shell.tsx`) to `src/lib/utils/color.ts` as a shared utility
  - Create `add-flow-context.tsx` with minimal context: `AddFlowProvider` and `useAddFlow()` hook exposing `openAddAtCell(x: number, y: number)`
  - Create `grid-runtime.tsx` — single client component that consolidates logic from both shell components:
    - Route state: `nodeId = useParams().nodeId ?? null`. Call `useNode(nodeId)` only when non-null. `displayLevel = nodeId === null ? 0 : (node?.level ?? 0) + 1`. `isLeafLevel = displayLevel >= 3`
    - Renders `Sidebar` (passes `onAddClick` and `level`), `Breadcrumbs` (passes `nodeId`), `AddFlowProvider`, `DndContext` boundary, `EditModeOverlay`, all create dialogs (chooser, node, bit)
    - Add-flow orchestration: sidebar + calls `openAdd({ mode: "auto" })`. Pages call `openAddAtCell(x, y)` via context. Level-based rules: L0 → node only, L1-2 → chooser, L3 → bit only
    - BFS origin inset: nodes from `(1, 1)`, bits from `(GRID_COLS - 2, 1)` instead of `(0, 0)` / `(GRID_COLS - 1, 0)`
    - No `p-4` on content wrapper (padding gap removed per design spec)
  - Create `src/app/(grid)/layout.tsx` — server layout that renders `GridRuntime`
  - Create `src/app/(grid)/page.tsx` — thin Level 0 page: renders `GridView` + `OnboardingHints`, calls `useAddFlow().openAddAtCell`
  - Create `src/app/(grid)/grid/[nodeId]/page.tsx` — thin Node grid page: renders `GridView` + `EditNodeDialog`, calls `useAddFlow().openAddAtCell`
  - Delete `src/app/page.tsx`, `src/app/grid/[nodeId]/page.tsx`, `src/components/layout/level-0-shell.tsx`, `src/app/grid/[nodeId]/_components/node-grid-shell.tsx` (and `_components/` directory if empty)
- **Acceptance:**
  - Routes `/` and `/grid/[nodeId]` resolve correctly under `(grid)` route group
  - GridRuntime mounts once — no remount flash when navigating between grid levels
  - Sidebar + button opens correct dialog based on level (L0: node, L1-2: chooser, L3: bit)
  - Empty cell + button opens correct dialog at the clicked cell position
  - Grid content fills available space with no padding gap
  - Old shell files (`level-0-shell.tsx`, `node-grid-shell.tsx`) and old page files deleted, no import errors
  - `pnpm build` passes

### Task 41: Sidebar Redesign + Breadcrumb Cleanup
- **Status:** `[x]`
- **Files:** `src/components/layout/sidebar.tsx` (update), `src/components/layout/breadcrumbs.tsx` (update), `src/stores/sidebar-store.ts` (delete)
- **Dependencies:** Task 40
- **Actions:**
  - Rewrite `sidebar.tsx` as a fixed icon rail (`w-12` / 48px). Remove all fold/unfold logic, `useSidebarStore` usage, and `motion` expand/collapse animations
    - Icons top: + (add), Pencil (edit mode toggle), Search, Calendar
    - Icons bottom (mt-auto): Trash, Theme toggle (moon/sun)
    - Each button: `w-10 h-10 flex items-center justify-center rounded-lg`
    - Active state: highlighted when on route (calendar, trash) or mode active (edit)
    - Trash icon visible on all levels (PRD departure #4)
    - Accept `onAddClick` prop (from GridRuntime) and `level` prop
    - Keep `useEditModeStore`, `useSearchStore`, `usePathname`, `globalUrgency` calendar badge
  - Update `breadcrumbs.tsx` to accept `nodeId: string | null`. When `nodeId === null`, render root-only state showing "Home" with no navigation segments. Guard `useBreadcrumbChain` call — only call when `nodeId` is not null
  - Delete `src/stores/sidebar-store.ts` (only imported by `sidebar.tsx`, no longer needed)
  - Update `main` content margin from `ml-[14rem]` to `ml-12` (3rem) wherever the sidebar margin is applied
- **Acceptance:**
  - Sidebar renders as narrow icon rail on all pages, identical across all levels
  - No fold/unfold mechanism exists
  - Trash icon visible at all grid levels
  - Breadcrumb shows "Home" at Level 0, full chain at deeper levels
  - Edit mode toggle, calendar/trash navigation, search all still work from sidebar
  - No TypeScript errors referencing `sidebar-store.ts` or `useSidebarStore`
  - `pnpm build` passes

### Task 42: DnD Collision Resolution + Drag-to-Child Confirmation
- **Status:** `[x]`
- **Files:** `src/lib/grid-dnd.ts` (update), `src/components/layout/grid-runtime.tsx` (update), `src/hooks/use-dnd.ts` (update), `src/components/grid/grid-view.tsx` (update)
- **Dependencies:** Task 40
- **Actions:**
  - Add `gridCollisionDetection` to `grid-dnd.ts`: runs `closestCenter`, then if any candidate has `kind === "grid-node-drop"`, filter out all `grid-cell` candidates. Otherwise fall back to `closestCenter` default
  - Update `grid-runtime.tsx` to use `gridCollisionDetection` as `DndContext` collision detection
  - Extend `DragActiveItem` type in `use-dnd.ts` to include `title: string`. Set from `event.active.data.current` in `handleDragStart`
  - Update `useDraggable` data payloads in `DraggableNodeCard` and `DraggableBitCard` (in `grid-view.tsx`) to include `title` in drag data
  - Add cycle prevention in `use-dnd.ts`: before staging a node-to-node move, walk the target node's ancestor chain via `parentId`. If the dragged node's ID appears, block with `toast.error("Cannot move a node into its own descendant.")`
  - Add `pendingNodeMove` state to `use-dnd.ts`: `{ itemId, itemType, itemTitle, targetNodeId, targetNodeTitle } | null`. On `grid-node-drop`, stage confirmation instead of executing mutation directly. Add `handleNodeMoveConfirm` (executes existing BFS placement + parentId update logic) and `handleNodeMoveCancel`
  - Render move confirmation dialog in `grid-runtime.tsx` using the exposed `pendingNodeMove` state. Title: "Move into '{targetNodeTitle}'?", Body: "'{itemTitle}' will be moved into this node.", Actions: Cancel / Move
- **Acceptance:**
  - Dragging an item onto a node card reliably triggers the node-drop flow (not the grid-cell flow)
  - Confirmation dialog appears before executing drag-to-child move
  - Cycle prevention blocks moving a node into its own descendant with a toast error
  - Confirming the move places the item in the target node's grid via BFS
  - Cancelling clears the pending state, item returns to original position
  - `pnpm build` passes

### Task 43: Enable DnD Outside Edit Mode
- **Status:** `[x]`
- **Files:** `src/components/grid/grid-view.tsx` (update)
- **Dependencies:** Task 42
- **Actions:**
  - Merge `EditableGridDropCell` and `StaticGridCell` into a single `GridDropCell` that is always droppable. Visual edit-mode affordances (dotted borders, jiggle, X buttons, + icon) remain edit-mode-only
  - Remove `disabled: !isEditMode` from `useDraggable` in both `DraggableNodeCard` and `DraggableBitCard`. Activation constraints already exist (`distance: 8` mouse, `delay: 250` touch)
  - Remove `disabled: !isEditMode` from `useDroppable` in `DraggableNodeCard` (node-card drop target)
  - Confirm `breadcrumbs.tsx` still has `disabled: !isEditMode` on its droppable — breadcrumb drops remain edit-mode-only (no change needed)
  - Delete the `EditableGridDropCell` and `StaticGridCell` function definitions
- **Acceptance:**
  - Without edit mode: drag a node/bit to reposition on grid → works
  - Without edit mode: drag a node/bit onto another node → confirmation dialog appears
  - Without edit mode: drag onto breadcrumb → does NOT work (edit-mode gate preserved)
  - In edit mode: jiggle, X buttons, dotted borders, + icons all still render
  - `pnpm build` passes

### Task 44: Create Dialog Improvements
- **Status:** `[x]`
- **Files:** `src/components/ui/textarea.tsx` (create via shadcn), `src/lib/constants/color-palette.ts` (create), `src/lib/constants/node-icons.ts` (update), `src/components/grid/create-node-dialog.tsx` (update), `src/components/grid/create-bit-dialog.tsx` (update), `src/components/layout/grid-runtime.tsx` (update if types change)
- **Dependencies:** Task 40
- **Actions:**
  - Add shadcn textarea: `pnpm dlx shadcn@latest add textarea`. If command fails, create `textarea.tsx` manually matching shadcn conventions
  - Create `src/lib/constants/color-palette.ts` with 10 curated hex colors (`COLOR_PALETTE` array) and `getRandomColor()` helper. Colors: blue, red, green, amber, violet, pink, cyan, orange, indigo, teal
  - Expand `src/lib/constants/node-icons.ts` from ~25 to ~40 curated icons. Add task/project-relevant icons from Lucide: `ClipboardList`, `ListTodo`, `CalendarDays`, `Timer`, `Alarm`, `PenTool`, `Image`, `Video`, `Headphones`, `BookOpen`, `Archive`, `FolderOpen`, `Layers`, `Tag`, `Pin`
  - Update `create-node-dialog.tsx`: on closed→open transition, randomize icon (`NODE_ICON_NAMES[random]`) and color (`getRandomColor()`). Add `description` state + `<Textarea>` field below title (placeholder "Description (optional)", maxLength 500). Wire `description` through `onSubmit`. Validation errors must not reshuffle selections
  - Update `create-bit-dialog.tsx`: on closed→open transition, randomize icon. Add `description` state + `<Textarea>` (maxLength 1000). Wire `description` through `onSubmit` (update `CreateBitDialogValues` type to include `description`)
  - Update `grid-runtime.tsx` submit handlers if types changed — both already accept `description` from Task 40
- **Acceptance:**
  - Opening create node dialog shows random icon and random color (different on each open)
  - Opening create bit dialog shows random icon
  - Validation error does not reshuffle icon/color
  - Description field present and optional in both dialogs
  - Created items have description persisted (visible in edit dialog / bit detail)
  - Expanded icon grid shows ~40 icons
  - `pnpm build` passes

### Task 45: Visual Polish
- **Status:** `[x]`
- **Files:** `src/components/grid/bit-card.tsx` (update), `src/app/globals.css` (update), `src/components/grid/grid-view.tsx` (update), `src/lib/animations/grid.ts` (update), `src/components/grid/grid-cell.tsx` (update)
- **Dependencies:** Task 40
- **Actions:**
  - Bit card line-clamp-2: in `bit-card.tsx`, replace `truncate` with `line-clamp-2` on the title `<p>`. Change parent flex from `items-center` to `items-start` so icon and priority badge align to top of multi-line text
  - Level background colors: add CSS variables `--grid-bg-l0` through `--grid-bg-l3` to `globals.css` `:root` and `.dark` (values per DESIGN_TOKENS.md). In `grid-view.tsx`, apply level-aware `backgroundColor` via inline style using `hsl(var(--grid-bg-lN))`
  - Remove vignette overlay: delete the vignette `motion.div` from `grid-view.tsx`. Remove `vignetteVariants` import. Delete `vignetteVariants` export from `src/lib/animations/grid.ts`
  - Creation animation: add `creationVariants` to `grid.ts` — `initial: { scale: 0.85, opacity: 0 }`, `animate: { scale: 1, opacity: 1 }` with spring transition (`stiffness: 400, damping: 25`). Wrap node/bit cards in `AnimatePresence` + `motion.div` with these variants
  - Deletion animation: add `exit` to `creationVariants` — `{ scale: 0.9, opacity: 0, y: 8 }` with `duration: 0.2, ease: "easeIn"`
  - Square add-target: in `grid-cell.tsx`, update empty edit-mode cell affordance: wrap + button in `aspect-square w-full max-w-[4rem] m-auto` container within the cell
- **Acceptance:**
  - Bit titles wrap to 2 lines before clipping
  - Grid background color changes subtly with each level (lighter/darker progression)
  - No vignette overlay renders at any level
  - New nodes/bits animate in with a spring scale+fade
  - Deleted items animate out with a shrink+fade
  - Empty cells in edit mode show a square dotted + target centered within the rectangular cell
  - `pnpm build` passes

### Task 46: DnD Close-out
- **Status:** `[x]`
- **Files:** `src/lib/grid-dnd.ts` (modify), `src/hooks/use-dnd.ts` (modify), `src/components/grid/grid-view.tsx` (modify), `src/components/grid/grid-cell.tsx` (modify), `src/components/layout/grid-runtime.tsx` (modify), `src/lib/grid-dnd.test.ts` (test), `src/components/grid/grid-view.test.tsx` (test)
- **Dependencies:** Task 42, Task 43, Task 45
- **Actions:**
  - Replace collision detection strategy in `grid-dnd.ts`: use `pointerWithin` for `grid-node-drop` targets (pointer must be inside the node rect) and `closestCenter` for `grid-cell` targets. The current `closestCenter`-only approach over-aggressively prefers node-drop candidates from adjacent cells — this is an algorithm swap, not a threshold tuning exercise
  - Fix non-edit-mode reposition so dropping onto a valid grid cell actually moves the dragged node/bit (currently broken because collision detection routes most drops to `grid-node-drop` instead of `grid-cell`)
  - Make node-drop hover/outline appear only when the pointer is meaningfully inside the target node area
  - Preserve correct move-into confirmation when the pointer is truly over a node
  - Prevent drag interaction from expanding grid width or producing horizontal overflow during drag near the viewport edge. Start with the smallest fix: apply `overflow-x-hidden` and `min-w-0` on the grid scroll/container path. If needed, force `overflow-hidden` while a drag is active. Do not use `DragOverlay` unless container overflow clipping cannot solve the horizontal scrollbar issue without breaking drag UX
  - Show square add-target hover affordance during non-edit drag over valid empty cells
  - Add regression tests for: reposition to empty cell, move-into-node confirmation, adjacent false-positive node hover, no horizontal overflow side effects during drag where testable
- **Acceptance:**
  - Outside edit mode, dragging a node/bit to an empty cell repositions it successfully
  - Dragging near a node does not trigger node-drop outline unless the pointer is actually over the node target area
  - Dragging onto a node still opens the correct "Move into …?" confirmation
  - Dragging near the right edge does not create horizontal scroll or expand the grid container
  - Empty-cell drag hover shows the approved square add-target affordance outside edit mode
  - `pnpm test` and `pnpm build` pass

### Task 47: Visual Polish Close-out
- **Status:** `[x]`
- **Files:** `src/components/grid/grid-cell.tsx` (modify), `src/components/layout/breadcrumbs.tsx` (modify), `src/components/layout/grid-runtime.tsx` (modify if needed), `src/components/grid/node-card.tsx` (modify), `src/components/grid/create-node-dialog.tsx` (modify), `src/components/grid/create-bit-dialog.tsx` (modify), `src/lib/constants/node-icons.ts` (modify), `src/app/globals.css` (modify), `src/lib/utils/bfs.ts` (modify)
- **Dependencies:** Task 41, Task 44, Task 45, Task 46
- **Actions:**
  - Adjust BFS auto-placement origins: nodes from `(1, 1)` → `(2, 2)`; bits from `(GRID_COLS - 2, 1)` → `(GRID_COLS - 3, 2)`
  - Update grid background color to newly approved values/direction in `globals.css`
  - Remove breadcrumb subtitle rendering for node description in `breadcrumbs.tsx`. Keep node description in schema and persistence paths — this is display-only removal, not schema removal
  - Expand icon picker set to 64 curated icons in `node-icons.ts`. Keep create dialog picker layouts usable with the larger set
  - Apply visual-only node card redesign per `references/editmode.png` direction. Replace the current "colored icon box + external label" feel with a contained tile card: white/card-surface tile, softer radius and shadow, icon rendered in node color instead of inside a large solid color block, title placed inside the tile under the icon, compact single-line label treatment. Keep one-cell footprint and all existing interactions unchanged. No structural, behavioral, routing, or sizing changes
  - Refine square add-target visuals to match approved direction cleanly
  - Do not change bit long-text behavior in this task
- **Acceptance:**
  - Auto-created nodes appear at `(2, 2)` origin; bits at `(GRID_COLS - 3, 2)` origin
  - Breadcrumbs show navigation only; no node description subtitle is rendered
  - Node description still persists in data and remains editable where already supported
  - Grid background reflects the newly approved visual tuning
  - Node cards render as contained tile cards (card-surface bg, softer radius/shadow, colored icon without solid block, title inside tile) per `references/editmode.png` direction, with no changes to structure, interactions, or sizing
  - Both create dialogs expose a 64-icon picker
  - No bit long-text behavior changes
  - `pnpm test` and `pnpm build` pass

### Phase 9 Amendment: Grid Interaction + Visual Policy

> **Scope amendment:** The following tasks extend Phase 9 with grid interaction policy changes, visual language updates, and a schema-level Node description removal. These tasks continue on the existing `phase-9/grid-ux-improvements` branch and were agreed as part of the consolidated UX proposal.
>
> **Execution issues:** Work that went beyond planned task scope during Phase 9 execution is tracked in [`docs/issues/Issues_Phase_9.md`](issues/Issues_Phase_9.md). That document is the live phase execution record — root causes, changes, active architecture issues (e.g., design-token workflow vs. JS runtime sizing authority), and user-reported issues.
>
> **Explicit policies:**
> - Per-card `X` button = edit mode only (already the case after Tasks 39–47)
> - Breadcrumb ancestor move = always-on + confirmation (policy change from edit-mode-only)
> - Drag-to-delete = left sidebar center `X` target + confirmation (secondary path, does not replace Task 39)
> - Persistent edit-mode dotted overlays = removed; empty-cell creation affordance = hover-only faint plus
> - Dotted target = drag-hover only, redesigned per `references/dotted2`
> - Keep `autoScroll={false}` (confirmed direct fix for drag-right overflow)
> - Node `description` = remove from schema, forms, and persistence model (data-destructive — orphaned fields persist in IndexedDB but become inaccessible)
> - Bit card text = single-line `truncate` only; no `line-clamp-2`; text overlap not solved in this phase

### Task 48: Drag-to-Delete Target + Motion
- **Status:** `[x]`
- **Files:** `src/components/layout/sidebar.tsx` (update), `src/hooks/use-dnd.ts` (update), `src/components/layout/grid-runtime.tsx` (update), `src/lib/grid-dnd.ts` (update)
- **Dependencies:** Task 39, Task 42
- **Actions:**
  - Add `getGridDeleteDropId` helper to `grid-dnd.ts` returning a stable droppable ID string (e.g., `"grid-delete-drop"`)
  - Extend `grid-runtime.tsx` to pass `dragActiveItem` (from `useDnd`) to `Sidebar` as a new prop
  - In `sidebar.tsx`: accept optional `dragActiveItem` prop. When non-null, render a contextual `X` delete target centered vertically between the top icon group (add, pencil) and the bottom icon group (trash, theme). The target replaces/overlays the middle icons (search, calendar) during drag
    - Target sizing: same as other sidebar buttons (`flex h-10 w-10 items-center justify-center rounded-lg`)
    - Target styling: `text-destructive` with `motion-safe:animate-jiggle` (reuses existing edit-mode wiggle animation)
    - Icon: `X` from lucide-react (not `Trash2` — matches the card X delete affordance)
    - Make the target a `@dnd-kit` `useDroppable` with `id: getGridDeleteDropId()` and `data: { kind: "grid-delete-drop" }`
  - In `use-dnd.ts` `handleDragEnd`: detect `grid-delete-drop` kind. Extract `{ id, type, title }` from `event.active.data.current`. Do **not** delete directly — instead, return the pending delete data so `grid-runtime.tsx` can stage it into the existing `DeleteConfirmDialog` via `requestDelete`
  - In `grid-runtime.tsx`: when `handleDragEnd` returns a delete request from drag-to-delete, call `requestDelete({ id, type, title })` to open the existing `DeleteConfirmDialog`. No new dialog needed
- **Acceptance:**
  - While dragging a Node/Bit, sidebar shows a wiggling `X` target in the middle zone
  - `X` target does not appear when no drag is active
  - Dropping on the `X` target opens the existing delete confirmation dialog (cascade warning for Nodes, simple warning for Bits)
  - Confirming deletes the item; cancelling returns it to its original position
  - Sidebar does not widen during drag — target stays within the `w-12` rail
  - `pnpm test` and `pnpm build` pass

### Task 49: Ancestor Move Policy Change
- **Status:** `[x]`
- **Files:** `src/components/layout/breadcrumbs.tsx` (update), `src/hooks/use-dnd.ts` (update), `src/components/layout/grid-runtime.tsx` (update)
- **Dependencies:** Task 43, Task 48
- **Actions:**
  - In `breadcrumbs.tsx`: remove `disabled: !isEditMode` from `useDroppable` in `BreadcrumbSegmentButton`. Breadcrumb drops are now always-on regardless of edit mode
  - Add Bit-at-root rejection: when `nodeId` is `null` (Home segment), set `disabled: true` if the currently dragged item is a Bit. Read `dragActiveItem` from `useDnd` or accept it as a prop from `grid-runtime.tsx`. Bits cannot exist at root (`parentId` is required on Bits per schema)
  - In `use-dnd.ts` `handleDragEnd`: when a `grid-breadcrumb-drop` is detected, do **not** execute the move immediately. Instead, stage a `pendingAncestorMove` state (same pattern as `pendingNodeMove`): `{ itemId, itemType, itemTitle, targetNodeId, targetNodeTitle } | null`. Add `handleAncestorMoveConfirm` (executes BFS placement + `parentId` update) and `handleAncestorMoveCancel`
  - In `grid-runtime.tsx`: render an ancestor move confirmation dialog using `pendingAncestorMove` state. Title: `"Move to '{targetNodeTitle}'?"`. Body: `"'{itemTitle}' will be moved to this location."`. Actions: Cancel / Move. For Home target, use title `"Home"`
  - Confirmation is required for **all** ancestor moves regardless of edit mode
- **Acceptance:**
  - Without edit mode: dragging a Node/Bit onto a breadcrumb segment shows confirmation dialog
  - In edit mode: same behavior — confirmation always required
  - Confirming moves the item to the target ancestor's grid via BFS nearest empty cell
  - Cancelling clears the pending state, item returns to original position
  - Dragging a Bit onto the Home breadcrumb segment is rejected (disabled drop target)
  - Dragging a Node onto Home works and shows confirmation
  - `pnpm test` and `pnpm build` pass

### Task 50: Dotted Area Redesign + Hover-only Plus
- **Status:** `[x]`
- **Files:** `src/components/grid/grid-cell.tsx` (update), `src/components/grid/grid-view.tsx` (update)
- **Dependencies:** Task 46, Task 47
- **Actions:**
  - In `grid-cell.tsx`: remove the persistent `border-2 border-dashed border-muted-foreground/30` that renders on all empty cells in edit mode. Replace with:
    - **Edit mode, no drag active:** empty cells show no border. On hover, show a faint `+` icon (`text-muted-foreground/30` → `text-muted-foreground/60` on hover). Use CSS `:hover` pseudo-class, not React state, to avoid re-renders
    - **Drag active (edit mode or not):** on the hovered valid target cell, show the dotted area styled per `references/dotted2` — rounded-square dashed border with `+` icon. Only the currently hovered target shows this treatment, not all empty cells. Use `isDragOver` prop (already exists from `GridDropCell`) to trigger
  - Remove the `isEditMode` conditional on `border-dashed` — edit mode no longer drives persistent dotted styling
  - Keep the square add-target container (`aspect-square w-full max-w-[4rem] m-auto`) for both hover-only `+` and drag-over dotted target
  - In `grid-view.tsx`: ensure `GridDropCell` passes `isDragOver` correctly to `GridCell` for drag-hover dotted rendering
- **Acceptance:**
  - In edit mode with no drag: empty cells show no dotted border; hovering an empty cell reveals a faint `+`
  - In edit mode during drag: only the hovered target cell shows the `references/dotted2`-style dotted area
  - Outside edit mode during drag: same dotted target on hovered valid cell (unchanged from Task 46)
  - Clicking the hover-revealed `+` in edit mode still opens the create dialog at that cell position
  - `pnpm build` passes

### Task 51: Drag Focus Hierarchy
- **Status:** `[x]`
- **Files:** `src/components/grid/grid-view.tsx` (update), `src/components/layout/sidebar.tsx` (update), `src/app/globals.css` (update)
- **Dependencies:** Task 48, Task 50
- **Actions:**
  - In `grid-view.tsx`: add `data-dragging="true"` attribute on the grid container `div` when a drag is active (use `dragActiveItem` from `useDnd`)
  - In `globals.css`: add CSS rules using `[data-dragging="true"]` ancestor selector:
    - `[data-dragging="true"] [data-grid-item]:not([data-drag-active="true"]) { opacity: 0.4; filter: saturate(0.5); transition: opacity 0.15s, filter 0.15s; }` — all non-active grid items desaturate
    - The actively dragged item should have `data-drag-active="true"` attribute set in `DraggableNodeCard` / `DraggableBitCard` when `isDragging` is true
  - In `sidebar.tsx`: accept `dragActiveItem` prop (already passed in Task 48). When non-null, apply `opacity-40 saturate-50` classes to the search, calendar, trash, and darkmode buttons. Keep `+` and pencil at full opacity
  - **Implementation constraint:** all desaturation via CSS classes/data attributes — no per-item React state changes during drag
- **Acceptance:**
  - During drag: all non-active Nodes/Bits on the grid appear desaturated and dimmed
  - The actively dragged item remains at full color/opacity
  - Sidebar search, calendar, trash, darkmode icons desaturate during drag
  - Sidebar `+` and pencil icons remain at full opacity during drag
  - When drag ends, all items return to normal immediately
  - No perceptible performance degradation during drag (CSS-only, no React re-renders)
  - `pnpm build` passes

### Task 52: Visual Language — L0 Background + Node Card Square
- **Status:** `[x]`
- **Files:** `src/app/globals.css` (update), `src/components/grid/node-card.tsx` (update)
- **Dependencies:** Task 47
- **Actions:**
  - In `globals.css` `:root`: update `--grid-bg-l0` to `48 38% 91%` (≈ `#F1F0E1`). Derive deeper levels by reducing lightness from this base:
    - `--grid-bg-l0: 48 38% 91%;`
    - `--grid-bg-l1: 48 30% 88%;`
    - `--grid-bg-l2: 48 22% 85%;`
    - `--grid-bg-l3: 48 14% 82%;`
  - In `globals.css` `.dark`: update dark-mode equivalents preserving the same hue progression with appropriate dark values
  - In `node-card.tsx`: update the card button to render as a true square / rounded-square tile. Ensure the card container uses `aspect-square` so the tile is visually square within the rectangular grid cell. The tile should be centered in the cell. Keep `rounded-2xl`, shadow, and all existing interactions
  - Reference: `references/editmode.png` for tile card direction, `references/dotted2` for dotted target
- **Acceptance:**
  - L0 grid background is warm beige (`#F1F0E1` equivalent)
  - Each deeper level is visibly cooler/darker while maintaining the warm tone
  - Node cards render as square tiles centered within their rectangular grid cells
  - All existing Node card interactions (click, drag, edit-mode X, jiggle) remain functional
  - `pnpm build` passes
- **Visual recipe:** `docs/recipes/node-card-recipe.md` — finalized values: icon `h-8 w-8`, padding `p-3`, title `text-xs` / title zone `h-5`, shadow `shadow`

### Task 53: Node Description Schema Removal + Bit Single-line
- **Status:** `[x]`
- **Files:** `src/lib/db/schema.ts` (update), `src/lib/db/indexeddb.ts` (update), `src/components/grid/edit-node-dialog.tsx` (update), `src/components/grid/create-node-dialog.tsx` (update), `src/components/layout/breadcrumbs.tsx` (update if needed), `src/components/grid/bit-card.tsx` (update), `src/types/index.ts` (update if needed), `src/lib/db/deadline-hierarchy.test.ts` (update), `src/lib/db/grid-uniqueness.test.ts` (update), `src/lib/db/auto-completion.test.ts` (update), `src/lib/db/mtime-cascade.test.ts` (update), `src/lib/db/promotion.test.ts` (update), `src/lib/db/indexeddb.test.ts` (update)
- **Dependencies:** Task 47
- **Actions:**
  - **Node description removal (data-destructive):**
    - In `schema.ts`: remove `description` field from `nodeSchema` and `createNodeSchema`. The `Node` and `CreateNode` inferred types will no longer include `description`
    - In `indexeddb.ts`: remove any `description` references in Node create/update paths. Existing IndexedDB rows with `description` fields are unaffected (reads are trusted, extra fields ignored by Dexie), but new writes will not include it
    - In `edit-node-dialog.tsx`: remove the `description` state, the description input field, and the `description` value from the submit payload
    - In `create-node-dialog.tsx`: remove the `description` state, the `<Textarea>` field, and `description` from `onSubmit` values type
    - In `breadcrumbs.tsx`: confirm no description rendering remains (Task 47 removed subtitle display — verify no residual code)
    - In `grid-runtime.tsx`: update `handleCreateNode` if it passes `description` to `createNode`
    - In all test fixtures (`deadline-hierarchy.test.ts`, `grid-uniqueness.test.ts`, `auto-completion.test.ts`, `mtime-cascade.test.ts`, `promotion.test.ts`): remove `description: ""` from `makeNode` helper functions
    - In `indexeddb.test.ts`: remove assertion on `promotedNode.description` and any other description references
  - **Bit single-line policy:**
    - In `bit-card.tsx`: ensure the title uses `truncate` (single-line ellipsis). If `line-clamp-2` was applied in Task 45, revert to `truncate`. Do not use `line-clamp-2`
    - Keep the one-cell x/y model. Do not attempt to solve text overlap
    - Do not create a follow-up task for overlap
  - **Docs:** Update all canonical documentation to remove Node `description`:
    - `docs/SCHEMA.md`: remove `description` from the nodes table. Add a note: "Removed in Phase 9 amendment. Existing IndexedDB rows may retain orphaned `description` fields."
    - `docs/SPEC.md`: remove any references to Node description display (e.g., breadcrumb subtitle, grid descriptions). Ensure no layout or component spec references a Node description field
    - `docs/DESIGN_TOKENS.md`: remove any component usage references that mention Node description rendering or breadcrumb subtitle styling
- **Acceptance:**
  - `nodeSchema` and `createNodeSchema` do not include `description`
  - `Node` and `CreateNode` TypeScript types do not include `description`
  - Edit Node dialog has no description field
  - Create Node dialog has no description field or `<Textarea>`
  - No `description` references in test fixture `makeNode` helpers
  - `promoteBitToNode` test does not assert on `description`
  - Bit card titles render as single line with ellipsis truncation
  - `pnpm tsc --noEmit` passes (no type errors from removed field)
  - `pnpm test` passes
  - `pnpm build` passes

#### Phase 9 Notes (Amendment)

> **Data-destructive change:** Node `description` removal is a one-way schema change. Existing IndexedDB rows retain orphaned `description` fields that Dexie silently ignores on read. No migration is needed, but the data is permanently inaccessible once the UI and schema stop referencing it.

> **Drag-to-delete is a secondary path:** It supplements, not replaces, the per-card X button in edit mode. Both paths converge on the same `DeleteConfirmDialog`.

> **Ancestor move confirmation:** All ancestor moves via breadcrumb now require confirmation regardless of edit mode. This replaces the previous edit-mode-only gate, which existed to prevent accidental hierarchy changes.

> **Grid-aware sizing:** Fixed rem-based node sizing breaks across resolutions (FHD vs QHD vs UHD). Container queries with `min(100cqw, 100cqh)` and a 96px cap solved this without JS runtime measurement. See MI-3 through MI-6 in Issues_Phase_9.md.

> **Grid dimension iteration:** Density at higher resolutions drove three grid-dimension changes (12×8 → 15×8 → 18×9). When sizing feels sparse at one resolution, increasing grid density is a better fix than resolution-dependent branching or max-width constraints.

> **Scope drift at phase close:** Phase 10 deadline-conflict code (bit-detail-popup, use-bit-detail-actions) accumulated in the working tree during Phase 9. At close-out, it was misclassified as Phase 9 source by path proximity. Prevention: classify dirty files by diff content + plan cross-reference, not file path. Skill updated.

> **Full issue log:** `docs/issues/Issues_Phase_9.md`

---

