## Phase 5: Bit Detail + Application Hooks

### Task 21: Bit Detail Popup
- **Status:** `[x]`
- **Files:** `src/components/bit-detail/bit-detail-popup.tsx`
- **Dependencies:** Task 9 (use-bit-detail), Task 2 (shadcn dialog)
- **Actions:**
  - `bit-detail-popup.tsx`: `"use client"`. Uses `useBitDetail()`. Centered modal over blurred background. Motion entry via `bitDetailPopupVariants`
    - Backdrop: `fixed inset-0 bg-background/80 backdrop-blur-sm z-50`
    - Container: `max-w-bit-detail` (640px), `max-h-[85vh]` (from `--bit-detail-max-height`), scrollable
    - Header: editable title input, icon selector (Lucide icon picker), deadline date picker with **"All day" toggle**: when enabled, sets `deadlineAllDay: true` and hides the time picker, priority toggle (cycles high→mid→low→null on click)
    - Header dropdown menu: "Promote to Node" action (visible only when Bit has 1+ Chunks). Calls `DataStore.promoteBitToNode(bitId)` (Task 25). "Move to trash" action: calls `DataStore.softDeleteBit(bitId)`
    - Description: editable textarea
    - mtime label: `text-xs text-muted-foreground` — "Last updated: X days ago" via `date-fns formatDistanceToNow`
    - Chunk pool section (Task 23)
    - Timeline section (Task 22)
  - Empty state: timeline structure visible (vertical line, dot placeholder) + "Add a step" CTA button
  - Close: click backdrop, ESC key, or browser back (removes `?bit` param)
- **Acceptance:** `?bit=[bitId]` opens popup with fade+slide. Title/description editable inline. Priority cycles. Close via backdrop/ESC/back. mtime shows relative time
- Deadline picker has "All day" toggle that hides the time component when enabled
- Header dropdown shows "Promote to Node" action when Bit has 1+ Chunks
- **Commit:** `feat: add bit detail popup with editable fields and priority toggle`

### Task 22: Chunk Timeline + Chunk Item
- **Status:** `[x]`
- **Files:** `src/components/bit-detail/chunk-timeline.tsx`, `src/components/bit-detail/chunk-item.tsx`
- **Dependencies:** Task 21, Task 4 (types)
- **Actions:**
  - `chunk-timeline.tsx`: Vertical timeline inside bit detail popup. Structure per DESIGN_TOKENS:
    - Container: `relative pl-8`
    - Vertical connecting line: `absolute left-3.5 top-0 bottom-0 w-0.5 bg-border`
    - Each chunk renders as `ChunkItem`
    - Drag-to-reorder via `@dnd-kit/sortable` — updates `order` field
    - Deadline marker at bottom: clock icon aligned vertically with dots above
    - Progress ring: circular SVG showing `completedChunks / totalChunks`
  - `chunk-item.tsx`: Single chunk in timeline. Props: `chunk: Chunk`, `onToggle`, `onEdit`, `onDelete`
    - Wrapper: `relative flex items-start gap-3 pb-6`
    - Dot: `relative z-10 w-3 h-3 rounded-full border-2 border-background mt-1.5`. Complete: `bg-primary`. Incomplete: `bg-muted-foreground/30`
    - Content card: bordered container with title `text-sm`, completed adds `line-through text-muted-foreground`
    - Time: `text-xs text-muted-foreground mt-0.5`
  - Ordering: chunks with `time` sort by time value; chunks without `time` follow `order` field
- **Acceptance:** Timeline renders vertically with connecting line and dots. Complete chunks: filled dot + strikethrough. Drag reorders. Deadline marker at bottom. Progress ring reflects ratio
- **Commit:** `feat: add chunk timeline with reorderable items, deadline marker, and progress ring`

### Task 23: Chunk Pool
- **Status:** `[x]`
- **Files:** `src/components/bit-detail/chunk-pool.tsx`
- **Dependencies:** Task 22, Task 5 (DataStore)
- **Actions:**
  - `chunk-pool.tsx`: `"use client"`. Section inside bit detail popup above the timeline. Lists unscheduled chunks (no `time` set)
    - "Add a step" button to create new chunk via DataStore (`order = chunks.length`)
    - Inline editing: click chunk title to edit in place
    - Delete: remove button per chunk — hard delete (chunks have no soft-delete per SCHEMA)
    - Drag from pool onto timeline to set order position
  - Validates via `createChunkSchema` on creation
  - Chunk activity triggers mtime cascade on parent Bit (handled by Hook 1 in Task 24)
- **Acceptance:** Can add new chunks inline. Edit title by clicking. Delete removes permanently. Drag to timeline sets position
- **Commit:** `feat: add chunk pool with inline create, edit, delete, and drag-to-timeline`

### Task 24: Core Application Hooks
- **Status:** `[x]`
- **Files:** `src/lib/db/indexeddb.ts` (update), `src/hooks/use-global-urgency.ts` (new), `src/hooks/use-node-urgency.ts` (new), `src/components/shared/deadline-conflict-overlay.tsx` (new), `src/components/shared/deadline-conflict-modal.tsx` (new)
- **Dependencies:** Task 5 (DataStore), Task 6 (utilities)
- **Actions:**
  - Implement inside DataStore write methods (enforced at data layer, not in components):
  - **Hook 1 — mtime cascade:** Per SCHEMA.md table. Chunk changes cascade `mtime = Date.now()` to parent Bit AND parent Node. Bit changes cascade to parent Node. Does NOT cascade on open/view or grid reposition
  - **Hook 2 — Deadline hierarchy:** `child.deadline <= parent.deadline`. Block violation and return conflict info for UI modal ("Child cannot exceed parent's deadline. Update parent too?"). When parent deadline shortened: find conflicting children, return list for blur+overlay
  - **Hook 3 — Bit auto-completion:** On chunk status → `"complete"`, check all sibling chunks. All complete → `bit.status = "complete"`. Reverse: chunk uncompleted + bit was complete → `bit.status = "active"`. Both directions cascade mtime
  - **Hook 8 — Grid cell uniqueness:** Before insert/move, query active items at `(parentId, x, y)`. If occupied → reject or trigger BFS auto-placement
  - **`useGlobalUrgency()` hook:** New hook in `src/hooks/use-global-urgency.ts`. Reactive query across all active Bits project-wide. Returns `UrgencyLevel` (1|2|3|null) — the most urgent level of any active Bit with an approaching deadline. Consumed by Task 12 (sidebar Calendar button urgency dot).
  - **`useNodeUrgency(nodeId: string)` hook:** New hook in `src/hooks/use-node-urgency.ts`. Reactive query for child Bits of a specific Node. Returns `UrgencyLevel` of the most urgent child. Consumed by Task 14 (NodeCard urgency badge).
  - **`DeadlineConflictOverlay` component:** `src/components/shared/deadline-conflict-overlay.tsx`. Renders "Modify timeline" overlay on child items whose deadlines exceed a newly-shortened parent deadline. Consumed by Tasks 21 (Bit Detail), 25c (Node Edit Dialog), and Calendar tasks.
  - **`DeadlineConflictModal` component:** `src/components/shared/deadline-conflict-modal.tsx`. "Update parent's deadline too?" modal surfaced when a child deadline would exceed the parent. Consumed by Tasks 21 and 25c.
  - **Grid-full feedback:** When BFS returns `null` in any creation flow, surface a toast: "Grid is full. Reorganize or move items to make space." Do not open any creation dialog.
- **Acceptance:** Unit tests pass:
  - `mtime-cascade.test.ts`: chunk complete → parent Bit mtime updated → parent Node mtime updated; grid reposition does NOT update mtime
  - `deadline-hierarchy.test.ts`: child deadline past parent → blocked with conflict info; parent shortened → conflicting children identified
  - `auto-completion.test.ts`: last chunk completed → bit status flips to "complete"; chunk uncompleted → bit reverts to "active"
  - `grid-uniqueness.test.ts`: insert at occupied cell → rejected; BFS fallback finds nearest empty
  - `use-global-urgency.test.ts`: returns correct max urgency level across all active Bits
  - `use-node-urgency.test.ts`: returns correct urgency for child Bits of a given Node
- **Commit:** `feat: implement mtime cascade, deadline hierarchy, auto-completion, and grid uniqueness hooks`

### Task 25: Bit-to-Node Promotion
- **Status:** `[x]`
- **Files:** `src/lib/db/indexeddb.ts` (update)
- **Dependencies:** Task 24
- **Actions:**
  - Implement Hook 9 from SCHEMA.md as `promoteBitToNode(bitId)` on DataStore:
    - **Max-depth guard:** Before promotion, check `parentNode.level >= 3` (Nodes only exist at levels 0–3; a Bit inside a Level 3 Node cannot be promoted because the resulting Node would be Level 4, which is invalid). If guard triggers: return an error, show a toast "Cannot promote — maximum nesting depth reached.", and abort. Hide the "Promote to Node" dropdown action entirely when the Bit's parent Node is at Level 3.
    1. Create new Node: copy Bit's `title`, `icon`, `deadline`, `description`. Assign default `color`. Set `level = parentNode.level + 1` (SCHEMA.md is authoritative: Node level = parent level + 1)
    2. For each Chunk: create new Bit inside new Node. Map `chunk.title → bit.title`, `chunk.time → bit.deadline`, `chunk.timeAllDay → bit.deadlineAllDay`. Auto-place via BFS
    3. Delete original Bit and all its Chunks
  - Surface in UI: "Promote to Node" action in the Bit Detail Popup header dropdown menu (Task 21). Action is only visible when the Bit has 1+ Chunks.
- **Acceptance:** Unit tests pass:
  - `promotion.test.ts`: Bit with 3 chunks → new Node created with 3 child Bits; original Bit+Chunks deleted; child Bit deadlines match chunk times; BFS places children on grid
  - `promotion.test.ts`: Bit inside Level-3 Node → promotion blocked with error; "Promote to Node" action hidden at max depth
- **Commit:** `feat: implement bit-to-node promotion with chunk-to-bit conversion`

### Task 25a: Bit Status Toggle + Completion UI
- **Status:** `[x]`
- **Files:** `src/components/bit-detail/bit-detail-popup.tsx` (update), `src/components/grid/bit-card.tsx` (update)
- **Dependencies:** Task 21 (Bit Detail Popup), Task 24 (Hook 3 — auto-completion)
- **Actions:**
  - **Bit Detail Popup header:** Add a status toggle button (checkmark icon). Click cycles: active → complete → active. When completing: apply Hook 3 mtime cascade. When undoing: revert Bit status to `"active"`, cascade mtime
  - **Zero-Chunk Bits:** Status toggle is the only completion mechanism (no auto-completion possible). Same checkmark button
  - **Force-complete:** Toggle to complete even with incomplete Chunks. All Chunk statuses remain unchanged — only the Bit flips
  - **Undo-complete:** Toggle back to active. If Bit was auto-completed (all Chunks done), uncompleting the Bit sets `status = "active"` but does not change Chunk statuses
  - **Remove-to-trash:** "Move to trash" action in Bit Detail Popup header dropdown. Calls `DataStore.softDeleteBit(bitId)`
  - **BitCard visual:** Completed Bits show strikethrough title + gray treatment + `opacity-50`. In edit mode, completed Bits still jiggle and show delete overlay
  - **Sinking animation:** Deferred to Task 35 (Phase 7 Motion Animations). Task 35 owns `bitCompleteVariant` — a `translateY(8px) scale(0.95) opacity(0.5)` AnimatePresence exit animation on BitCard status change. Task 25a only handles the static visual state (strikethrough, gray, opacity-50).
  - **Calendar consistency:** Completed Bits in Calendar day columns (Task 27/28) render with the same gray/strikethrough treatment
- **Acceptance:**
  - Bit Detail Popup has a completion toggle button. Click completes/uncompletes
  - Zero-Chunk Bits can be completed via toggle
  - Force-complete works with incomplete Chunks (Chunk statuses unchanged)
  - Undo-complete reverts Bit to active
  - "Move to trash" action works from popup header dropdown
  - Completed BitCard shows strikethrough + gray + `opacity-50`
- **Commit:** `feat: add bit status toggle, force-complete, undo, and remove-to-trash`

### Task 25b: Level 1-2 Creation Chooser + Bit Creation Dialog
- **Status:** `[x]`
- **Files:** `src/components/grid/create-item-chooser.tsx` (new), `src/components/grid/create-bit-dialog.tsx` (new or update), `src/app/grid/[nodeId]/_components/node-grid-shell.tsx` (update)
- **Dependencies:** Task 18 (Level 1-3 Grid Page), Task 5 (DataStore)
- **Actions:**
  - `create-item-chooser.tsx`: `"use client"`. Small popover triggered by `+` button at Level 1-2. Two options: "Node" (folder icon) and "Bit" (check-square icon). Selecting "Node" opens existing `CreateNodeDialog`. Selecting "Bit" opens `CreateBitDialog`
  - `create-bit-dialog.tsx`: shadcn Dialog. Fields: title (required), icon picker (reuse `NODE_ICON_MAP`), deadline (optional date picker with "All day" toggle), priority (optional: high/mid/low/none toggle). No color field — Bit inherits parent Node color. No description — added later via Bit Detail Popup
  - `node-grid-shell.tsx` update: At Level 1-2, both sidebar `+` and empty-cell `+` open the chooser. At Level 3, `+` opens `CreateBitDialog` directly (existing behavior). At Level 0, `+` opens `CreateNodeDialog` directly (unchanged)
  - **BFS origin rule:** Node placement: BFS from `(0, 0)` (top-left). Bit placement: BFS from `(GRID_COLS-1, 0)` (top-right). Empty-cell `+` click: BFS from `(clickedX, clickedY)` regardless of type
  - **Grid-full feedback:** When BFS returns `null`, show toast: "Grid is full. Reorganize or move items to make space." Do not open the creation dialog
- **Acceptance:**
  - Level 1-2 `+` (sidebar and empty-cell) opens Node/Bit chooser popover with two options
  - Selecting "Node" → `CreateNodeDialog` → places Node via BFS from top-left
  - Selecting "Bit" → `CreateBitDialog` → places Bit via BFS from top-right
  - Level 3 `+` opens `CreateBitDialog` directly (unchanged)
  - Level 0 `+` opens `CreateNodeDialog` directly (unchanged)
  - Grid-full condition shows toast instead of opening dialog
- **Commit:** `feat: add Level 1-2 creation chooser, Bit creation dialog, and grid-full feedback`

### Task 25c: Node Property Edit Dialog
- **Status:** `[x]`
- **Files:** `src/components/grid/edit-node-dialog.tsx` (new), `src/components/grid/node-card.tsx` (update), `src/components/grid/edit-mode-overlay.tsx` (update)
- **Dependencies:** Task 14 (NodeCard), Task 20 (Edit Mode Overlay)
- **Actions:**
  - `edit-node-dialog.tsx`: `"use client"`. shadcn Dialog. Pre-populated with existing Node data. Editable fields: title, icon (icon picker), color (color input), description (textarea), deadline (date picker with "All day" toggle). Save calls `DataStore.updateNode(nodeId, changes)`
  - `node-card.tsx` update: Accept an `isEditMode` prop. When `isEditMode === true`, click opens `EditNodeDialog` instead of navigating to `/grid/[nodeId]`
  - `edit-mode-overlay.tsx` update: Pass `isEditMode={true}` to NodeCard when edit mode is active
  - **Click precedence rule:** Normal mode: click Node → navigate to `/grid/[nodeId]`. Edit mode: click Node → open `EditNodeDialog`. Bit click behavior is unchanged in both modes (popup opens regardless)
- **Acceptance:**
  - In edit mode, clicking a Node opens `EditNodeDialog` with pre-populated title, icon, color, description, deadline
  - Save persists changes via DataStore
  - In normal mode, clicking a Node still navigates (unchanged)
  - Edit-mode click on a Bit still opens the Bit Detail Popup (unchanged)
- **Commit:** `feat: add node property edit dialog with edit-mode click routing`

#### Phase 5 Notes

> **Branch verification:** Always verify branch base before writing any code. `git log --oneline origin/main..HEAD` must be empty at phase start. A branch repair was needed this phase — the `execute-next-phase` skill now enforces this check explicitly.

> **Cherry-pick repairs:** After any cherry-pick repair, verify the full expected file set against the execution plan. Tests and build passing is not sufficient — missing files may not cause immediate failures.

> **Test fakes and type casts:** When writing test fakes, verify the fake already satisfies the target interface before adding `as any`. Redundant casts become lint errors.

> **Urgency hooks — DataStore facade:** `use-node-urgency` and `use-global-urgency` were implemented with direct `{ db }` access inside `liveQuery`. The correct pattern is `liveQuery(() => indexedDBStore.method())`. Deferred to Phase 5.5.

> **Full issue log:** `docs/issues/Issues_Phase_5.md`

---

