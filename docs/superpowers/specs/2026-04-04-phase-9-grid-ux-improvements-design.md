# Phase 9: Grid UX Improvements — Design Spec

> **Branch:** `phase-9/grid-ux-improvements`
> **Scope:** Single phase covering layout architecture, bug fixes, interaction improvements, creation UX, and visual polish.

---

## Table of Contents

- [PRD Departures](#prd-departures)
- [Priority Overview](#priority-overview)
- [P1: Wire Delete Buttons + Confirmation Modal](#p1-wire-delete-buttons--confirmation-modal)
- [P2: Route-Group Layout + Sidebar Redesign](#p2-route-group-layout--sidebar-redesign)
- [P3: Fix DnD Collision Resolution](#p3-fix-dnd-collision-resolution)
- [P4: Enable DnD Outside Edit Mode](#p4-enable-dnd-outside-edit-mode)
- [P5: Create Dialog Improvements](#p5-create-dialog-improvements)
- [P6: Visual Polish](#p6-visual-polish)
- [Files Summary](#files-summary)

---

## PRD Departures

Phase 9 intentionally departs from the PRD in four areas:

| # | PRD Rule | Phase 9 Change | Reason |
|---|----------|----------------|--------|
| 1 | Sidebar is foldable; when folded, no icon strip (Section 16) | Permanent narrow icon rail, always visible, no fold/unfold | Reduces cognitive overhead; all functions always one click away |
| 2 | Drag-to-reposition and drag-onto-Node are edit-mode-only (Sections 17, 20) | Grid DnD enabled outside edit mode | Repositioning is a frequent action; gating behind edit mode adds friction |
| 3 | Deeper levels apply vignette effect (Section 5) | Vignette removed; background color changes per level instead | Background color is a stronger, more immediate depth signal |
| 4 | Trash icon available on Level 0 only (Section 19) | Trash icon visible on all levels | Sidebar is identical across all levels for consistency |

---

## Priority Overview

| Priority | Area | Summary |
|----------|------|---------|
| P1 | Bug fix | Wire dead X delete buttons + confirmation modal |
| P2 | Architecture | Route-group `(grid)` layout, `GridRuntime` client wrapper (route state, sidebar, breadcrumb, shared DnD boundary, add-flow orchestration), sidebar redesign (icon rail), remove padding gap |
| P3 | DnD fix | Fix grid-cell vs grid-node-drop collision, drag-to-child confirmation, cycle prevention |
| P4 | DnD enhancement | Enable DnD outside edit mode, keep breadcrumb drops edit-mode-only |
| P5 | Creation UX | Random icon/color, expanded icon set, description field for both node and bit |
| P6 | Visual polish | Bit card line-clamp-2, level background colors, creation/deletion animations, BFS origin inset, square add-target |

---

## P1: Wire Delete Buttons + Confirmation Modal

### Problem

The X buttons on `node-card.tsx:147-155` and `bit-card.tsx:145-155` have `onClick` handlers that only call `e.stopPropagation()` with no delete logic. The bit-detail popup has a working trash action at `bit-detail-popup.tsx:163`, but the grid-card X buttons are dead.

### Solution

- Add `onDelete` callback prop to both `BitCard` and `NodeCard`.
- X button calls `onDelete(item)` on click. `event.stopPropagation()` is preserved to prevent card click/navigation.
- `GridView` receives `onDelete` and manages a single `pendingDelete: { id: string; type: "node" | "bit"; title: string } | null` state.
- One shared `DeleteConfirmDialog` renders in `GridView`, driven by `pendingDelete` state.

### Confirmation Dialog

- Component: shadcn `AlertDialog`
- **Node delete copy:**
  - Title: "Move to Trash?"
  - Body: "'{title}' and all its child nodes and bits will be moved to trash. You can restore them within 30 days."
- **Bit delete copy:**
  - Title: "Move to Trash?"
  - Body: "'{title}' will be moved to trash. You can restore it within 30 days."
- Actions: Cancel / Move to Trash (destructive variant)

### Delete Action

- Do not call DataStore directly from UI. Use hook-layer actions.
- Add `softDeleteNode` to `use-grid-actions.ts` (alongside existing `createNode`, `createBit`).
- Add `softDeleteBit` to `use-grid-actions.ts` if not already present.
- On confirm, call the appropriate soft-delete hook action. Items disappear from the grid immediately via `useLiveQuery` reactivity.

### Components Touched

- `src/components/grid/node-card.tsx` — add `onDelete` prop
- `src/components/grid/bit-card.tsx` — add `onDelete` prop
- `src/components/grid/grid-view.tsx` — wire `onDelete`, manage `pendingDelete` state, render `DeleteConfirmDialog`
- New: `src/components/grid/delete-confirm-dialog.tsx` — reusable confirmation dialog
- `src/hooks/use-grid-actions.ts` — add `softDeleteNode` and `softDeleteBit` actions

No schema changes. No new dependencies.

---

## P2: Route-Group Layout + Sidebar Redesign

The largest structural change in Phase 9.

### Route-Group Migration

**Current structure:**
```
src/app/page.tsx              → Level0Shell (sidebar + grid + dialogs)
src/app/grid/[nodeId]/page.tsx → NodeGridShell (sidebar + breadcrumb + grid + dialogs)
```

**New structure:**
```
src/app/(grid)/layout.tsx                  ← Server layout, renders GridRuntime
src/app/(grid)/page.tsx                    ← Level 0 grid content only
src/app/(grid)/grid/[nodeId]/page.tsx      ← Node grid content only

src/app/calendar/layout.tsx                ← Unchanged (route structure)
src/app/trash/page.tsx                     ← Unchanged (route structure)
```

Calendar and trash route structures are unchanged, but sidebar visual presentation changes globally since the same `sidebar.tsx` component is shared.

### GridRuntime

A single client component that owns all shared chrome and orchestration:

```
<GridRuntime>                    ← reads useParams(), derives nodeId/level/isLeafLevel
  <Sidebar />                    ← icon rail, + calls add-flow internally
  <Breadcrumbs nodeId={nodeId} /> ← prop-based, derives chain from nodeId
  <AddFlowContext.Provider>
    <DndContext>                 ← shared DnD boundary (grid cells, node drops, breadcrumb drops)
      {children}                 ← page content (GridView + page-specific UI)
    </DndContext>
  </AddFlowContext.Provider>
  <CreateDialogs />              ← chooser + node dialog + bit dialog
</GridRuntime>
```

**Responsibilities:**
- **Route state:** `nodeId = useParams().nodeId ?? null`. Derive `level` conditionally: call `useNode(nodeId)` only when `nodeId` is non-null (the current hook at `use-node.ts:8` accepts `string`, not `string | null`). When `nodeId === null`, `node` is `null`, `displayLevel` is `0`. When `nodeId` exists, `displayLevel = (node?.level ?? 0) + 1`. Compute `isLeafLevel = displayLevel >= 3`.
- **Sidebar:** Renders icon rail. + button calls internal add-flow state. Level-aware rules applied internally (no context exposure needed for sidebar).
- **Breadcrumb:** Receives `nodeId` as a prop. Renders `useBreadcrumbChain(nodeId)`. When `nodeId === null`, renders root-only state showing "Home". Drop targets remain edit-mode-only.
- **DnD:** Owns `useDnd()` hook, sensors, all handlers. One shared boundary for grid cells, node-card drops, and breadcrumb drops.
- **Add-flow:** Owns all dialog state (chooser, node dialog, bit dialog). Exposes `openAddAtCell(x: number, y: number)` via `AddFlowContext`. Sidebar + calls internal state directly (not via context).
- **Level-based + rules:**
  - Level 0: node creation only
  - Level 1-2: chooser (node or bit)
  - Level 3: bit creation only

**AddFlowContext (minimal):**
```ts
type AddFlowContextValue = {
  openAddAtCell: (x: number, y: number) => void;
};
```
Pages call `useAddFlow().openAddAtCell(x, y)` when the user clicks a grid cell + icon.

### Sidebar Redesign

**Current:** 14rem wide, fold/unfold, conditionally visible.

**New (per reference `references/leftsidebar2.png`):** Fixed icon rail, always visible, identical across all levels.

- Width: `3rem` (48px)
- Icons top-to-bottom: **+** (add), **Pencil** (edit mode toggle), **Search**, **Calendar**
- Icons bottom-anchored: **Trash**, **Theme toggle** (moon/sun)
- No fold/unfold mechanism
- Active state: icon highlighted when on that route (calendar, trash) or mode is active (edit)
- `ml-[14rem]` on main content changes to `ml-12` (3rem)
- Trash icon visible on all levels (PRD departure #4)

### Remove Padding Gap

GridRuntime and page wrappers must not add extra padding around the grid content. Grid fills the available space edge-to-edge (per reference `references/gridsection.png`). The current `p-4` on main content wrappers in `level-0-shell.tsx:141` and `node-grid-shell.tsx:189` is not carried forward.

### hexToHsl Deduplication

Currently duplicated in `level-0-shell.tsx:16-58` and `node-grid-shell.tsx:24-45`. Move to `src/lib/utils/color.ts` as a shared utility.

### Files Affected

**New files:**
- `src/app/(grid)/layout.tsx` — server layout
- `src/components/layout/grid-runtime.tsx` — client wrapper
- `src/components/layout/add-flow-context.tsx` — tiny context
- `src/lib/utils/color.ts` — shared `hexToHsl`

**Modified:**
- `src/app/page.tsx` → move to `src/app/(grid)/page.tsx`, strip to grid content only
- `src/app/grid/[nodeId]/page.tsx` → move to `src/app/(grid)/grid/[nodeId]/page.tsx`, strip to grid content only
- `src/components/layout/sidebar.tsx` — redesign to icon rail, remove fold/unfold
- `src/components/layout/breadcrumbs.tsx` — keeps `nodeId` prop, add root-only state for `nodeId === null`

**Deleted:**
- `src/components/layout/level-0-shell.tsx` — absorbed into GridRuntime
- `src/app/grid/[nodeId]/_components/node-grid-shell.tsx` — absorbed into GridRuntime
- Sidebar fold/unfold logic and `useSidebarStore` (if no longer referenced elsewhere)

---

## P3: Fix DnD Collision Resolution

### Problem

When dragging an item onto a node card, two droppables overlap in the same DOM area:
- `grid-cell` droppable (wrapping the cell)
- `grid-node-drop` droppable (on the node card itself)

With `closestCenter` collision detection, `grid-cell` sometimes wins. The `handleDragEnd` handler at `use-dnd.ts:90` then hits the `(dragItem.parentId ?? null) !== dropData.parentId` guard and silently returns — the drop lands on an occupied cell instead of triggering the move-into-node flow.

### Solution: Custom Collision Detection

Write a `gridCollisionDetection` function that prioritizes `grid-node-drop` over `grid-cell`:
1. Run `closestCenter` to get candidates
2. If any candidate has `kind === "grid-node-drop"`, rank it above all `grid-cell` candidates
3. Otherwise fall back to `closestCenter` default

Place in `src/lib/grid-dnd.ts` alongside existing `isGridDropData`.

### Drag-to-Child Confirmation

When `grid-node-drop` resolves, do not execute the mutation immediately. Stage a pending state:
```ts
pendingNodeMove: {
  itemId: string;
  itemType: "node" | "bit";
  itemTitle: string;
  targetNodeId: string;
  targetNodeTitle: string;
} | null
```

Show a confirmation dialog:
- Title: "Move into '{targetNodeTitle}'?"
- Body: "'{itemTitle}' will be moved into this node."
- Actions: Cancel / Move
- On confirm, execute the existing `use-dnd.ts:114-146` logic (update parentId + BFS placement in target grid)
- On cancel, clear `pendingNodeMove`

### Cycle Prevention

Before staging `pendingNodeMove`, walk the target node's ancestor chain (via `parentId` up to root). If the dragged node's ID appears anywhere in that chain, block the move and show a toast: "Cannot move a node into its own descendant."

This check goes in `use-dnd.ts` at the `grid-node-drop` handler, before staging the confirmation.

### DragActiveItem Title

Extend `DragActiveItem` in `use-dnd.ts` to include `title: string`. Set it from `event.active.data.current` in `handleDragStart`. The `useDraggable` data payloads in `grid-view.tsx` (both `DraggableNodeCard` and `DraggableBitCard`) must also be updated to include `title` in the drag data so it's available at drag start. Both item title and target node title are needed for confirmation dialog copy.

### Components Touched

- `src/lib/grid-dnd.ts` — add `gridCollisionDetection`
- `src/components/layout/grid-runtime.tsx` — use `gridCollisionDetection` instead of `closestCenter`
- `src/hooks/use-dnd.ts` — extend `DragActiveItem` with title, add `pendingNodeMove` state + handlers, add cycle prevention check
- `src/components/grid/grid-view.tsx` — update `useDraggable` data payloads to include `title` in both `DraggableNodeCard` and `DraggableBitCard`

---

## P4: Enable DnD Outside Edit Mode

### Problem

DnD is gated behind edit mode in multiple places:
- **Draggables:** `disabled: !isEditMode` on `useDraggable` in `DraggableNodeCard` (`grid-view.tsx:126`) and `DraggableBitCard` (`grid-view.tsx:169`)
- **Grid cell droppables:** Only `EditableGridDropCell` (edit mode) has drop targets; `StaticGridCell` (non-edit mode) does not
- **Node-card droppables:** `disabled: !isEditMode` on `useDroppable` inside `DraggableNodeCard`
- **Breadcrumb droppables:** `disabled: !isEditMode` at `breadcrumbs.tsx:24`

### Solution

| Target | Change |
|--------|--------|
| Draggables (node + bit cards) | Remove `disabled: !isEditMode`. Activation constraints already exist (`distance: 8` mouse, `delay: 250` touch at `use-dnd.ts:61-65`). |
| Grid cell droppables | Unify `EditableGridDropCell` and `StaticGridCell` into a single `GridDropCell` that is always droppable. Visual distinction stays (dotted borders, jiggle, X buttons in edit mode only). |
| Node-card drop targets (`grid-node-drop`) | Remove `disabled: !isEditMode`. Always active so drag-to-child works outside edit mode. |
| Breadcrumb drop zones | **Keep `disabled: !isEditMode`.** Breadcrumb drops are structural (move item to ancestor node) and warrant the edit-mode gate. |

### Edit-Mode-Only Visuals Preserved

- Jiggle animation (`motion-safe:animate-jiggle`)
- X delete buttons
- Dotted cell borders
- + icon in empty cells

These remain edit-mode-only. DnD becomes always-on but the visual affordances do not change.

### No Drag Handle in First Pass

Existing activation constraints prevent most accidental drags. Test real misdrag rate first. Add a grip handle only if misdrag proves problematic in practice.

### Touch Validation Risk

`delay: 250` touch activation needs testing against scroll behavior on mobile. Acceptable risk for first pass; flag for verification.

### Components Touched

- `src/components/grid/grid-view.tsx` — unify cell components, remove `disabled` from draggables and node-card droppables
- `src/components/layout/breadcrumbs.tsx` — no change (keeps edit-mode gate)

---

## P5: Create Dialog Improvements

### Problem

Both create dialogs have UX gaps:
- Icon always defaults to "Folder" — no randomization
- Color always defaults to `DEFAULT_COLOR_HEX` — no randomization
- Only 25 icons available
- No description field in either `create-node-dialog.tsx` or `create-bit-dialog.tsx`
- Both submit handlers hardcode `description: ""`

### Random Icon on Open

When the dialog transitions from closed to open, select a random icon:
```ts
useEffect(() => {
  if (open) {
    setIcon(NODE_ICON_NAMES[Math.floor(Math.random() * NODE_ICON_NAMES.length)]);
    // ... other randomization
    return;
  }
  // reset state on close
}, [open]);
```

Randomization happens once on the closed-to-open transition only. Rerenders and validation errors must not reshuffle the selection.

Applied to both node and bit create dialogs.

### Random Color on Open (Nodes Only)

Curated palette of 10 visually distinct colors. When the node create dialog opens, pick one at random. User can still override with the color picker.

```ts
const COLOR_PALETTE = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#22c55e", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#6366f1", // indigo
  "#14b8a6", // teal
];
```

Stored in `src/lib/constants/color-palette.ts` (separate from icon constants).

### Expanded Icon Set

Increase from 25 to ~40 curated icons. Add task/project-relevant icons from Lucide:
- Productivity: `ClipboardList`, `ListTodo`, `CalendarDays`, `Timer`, `Alarm`
- Content: `PenTool`, `Image`, `Video`, `Headphones`, `BookOpen`
- Organization: `Archive`, `FolderOpen`, `Layers`, `Tag`, `Pin`

Final list curated during implementation. Goal is breadth without decision paralysis.

### Description Field

Add a textarea field to both `create-node-dialog.tsx` and `create-bit-dialog.tsx`:
- Position: directly below Title
- Element: `<Textarea>` from shadcn (add via `pnpm dlx shadcn@latest add textarea`). If shadcn does not provide one, create a minimal styled `src/components/ui/textarea.tsx`.
- Placeholder: "Description (optional)"
- Max length: 500 characters for nodes, 1000 characters for bits (matches existing schema — `schema.ts:13` node `max(500)`, `schema.ts:42` bit `max(1000)`)
- Optional — no validation required, empty string default
- Wire through to `createNode`/`createBit` calls (replace hardcoded `description: ""`)

### Components Touched

- `src/components/grid/create-node-dialog.tsx` — random icon, random color, description field
- `src/components/grid/create-bit-dialog.tsx` — random icon, description field
- `src/lib/constants/node-icons.ts` — expanded icon list
- New: `src/lib/constants/color-palette.ts` — curated color palette
- New (if needed): `src/components/ui/textarea.tsx` — shadcn textarea primitive

---

## P6: Visual Polish

Six items grouped as low-dependency visual improvements.

### Bit Card Text-Wrap

- `bit-card.tsx:65` — remove `truncate`, add `line-clamp-2`
- Applies to the bit title (`bit.title` element) only. Deadline text, priority badge, and progress bar are unaffected.
- Switch card layout from `items-center` to `items-start` at `bit-card.tsx:60` so icon and priority badge align to the top of multi-line text.
- Start with `line-clamp-2`. Increase to 3 only if visual testing shows sufficient room within the fixed grid row height.

### Level Background Colors

Replace the vignette overlay with actual background color changes per level.

**Light mode:**
- L0: `hsl(0, 0%, 100%)` — white (current)
- L1: `hsl(220, 15%, 97%)` — cool gray tint
- L2: `hsl(220, 15%, 94%)` — deeper
- L3: `hsl(220, 15%, 91%)` — deepest

**Dark mode (progressively darker):**
- L0: current dark background (`--background` dark value)
- L1: `hsl(220, 15%, 6%)`
- L2: `hsl(220, 15%, 5%)`
- L3: `hsl(220, 15%, 4%)`

Exact values finalized during implementation with visual testing. These are starting points.

Remove vignette overlay entirely: delete `grid-view.tsx:295-301` and `vignetteVariants` from `src/lib/animations/grid.ts`.

### Creation Animation

When a node or bit appears in the grid after creation:
- `motion.div` wrapper with `initial={{ scale: 0.85, opacity: 0 }}`, `animate={{ scale: 1, opacity: 1 }}`
- Spring transition: `type: "spring", stiffness: 400, damping: 25`
- Duration: ~200-300ms perceived
- Applies to both nodes and bits

### Deletion Animation

When a node or bit is removed (soft delete confirmed):
- `AnimatePresence` wrapper on the grid item list
- `exit={{ scale: 0.9, opacity: 0, y: 8 }}`
- Transition: `duration: 0.2, ease: "easeIn"`
- Builds on existing `sinkingVariants` concept in `src/lib/animations/grid.ts`
- Applies to both nodes and bits

### BFS Origin Inset

Auto-placement starts one cell inward from the grid edges:
- Nodes: BFS starts from `(1, 1)` instead of `(0, 0)`
- Bits: BFS starts from `(GRID_COLS - 2, 1)` instead of `(GRID_COLS - 1, 0)`

Since add-flow moves to GridRuntime in P2, the BFS origin values change there.

### Square Add-Target in Edit Mode

The dotted-border + icon area inside empty grid cells currently stretches to fill the rectangular cell.
- Add `aspect-square` + `m-auto` to the inner dotted container
- The cell itself stays rectangular (grid layout unchanged)
- Only the visual affordance (dotted border + icon) becomes a centered square within the cell
- Applied in the unified `GridDropCell` component (after P4 unification)

### Components Touched

- `src/components/grid/bit-card.tsx` — line-clamp-2, items-start
- `src/components/grid/grid-view.tsx` — level background colors, remove vignette overlay, square add-target
- `src/lib/animations/grid.ts` — creation/deletion animation variants, remove `vignetteVariants`
- `src/components/layout/grid-runtime.tsx` — BFS origin inset in add-flow
- `src/app/globals.css` — level background CSS variables (if using design tokens)

---

## Files Summary

### New Files

| File | Purpose |
|------|---------|
| `src/app/(grid)/layout.tsx` | Server layout for grid route group |
| `src/components/layout/grid-runtime.tsx` | Client wrapper: route state, sidebar, breadcrumb, DnD, add-flow |
| `src/components/layout/add-flow-context.tsx` | Minimal context for page-to-runtime add-flow communication |
| `src/components/grid/delete-confirm-dialog.tsx` | Reusable delete confirmation dialog |
| `src/lib/utils/color.ts` | Shared `hexToHsl` utility |
| `src/lib/constants/color-palette.ts` | Curated node color palette |
| `src/components/ui/textarea.tsx` | Shadcn textarea primitive (if not provided by shadcn add) |

### Modified Files

| File | Changes |
|------|---------|
| `src/app/page.tsx` | Move to `(grid)/page.tsx`, strip to grid content only |
| `src/app/grid/[nodeId]/page.tsx` | Move to `(grid)/grid/[nodeId]/page.tsx`, strip to grid content only |
| `src/components/layout/sidebar.tsx` | Redesign to icon rail, remove fold/unfold, trash on all levels |
| `src/components/layout/breadcrumbs.tsx` | Add root-only state for `nodeId === null` |
| `src/components/grid/grid-view.tsx` | Delete-flow, unify cell components, level backgrounds, remove vignette, square add-target |
| `src/components/grid/node-card.tsx` | Add `onDelete` prop |
| `src/components/grid/bit-card.tsx` | Add `onDelete` prop, line-clamp-2, items-start |
| `src/components/grid/create-node-dialog.tsx` | Random icon/color, description field |
| `src/components/grid/create-bit-dialog.tsx` | Random icon, description field |
| `src/hooks/use-dnd.ts` | Extend DragActiveItem with title, pendingNodeMove state, cycle prevention |
| `src/hooks/use-grid-actions.ts` | Add `softDeleteNode` and `softDeleteBit` actions |
| `src/lib/grid-dnd.ts` | Add `gridCollisionDetection` |
| `src/lib/constants/node-icons.ts` | Expanded icon list (~40) |
| `src/lib/animations/grid.ts` | Creation/deletion variants, remove vignetteVariants |
| `src/app/globals.css` | Level background CSS variables |

### Deleted Files

| File | Reason |
|------|--------|
| `src/components/layout/level-0-shell.tsx` | Absorbed into GridRuntime |
| `src/app/grid/[nodeId]/_components/node-grid-shell.tsx` | Absorbed into GridRuntime |
| `src/stores/sidebar-store.ts` | Fold/unfold no longer needed (verify no other references first) |
