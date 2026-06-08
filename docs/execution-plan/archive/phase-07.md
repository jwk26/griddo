## Phase 7: Trash, Search + Polish

### Task 31: Trash Page
- **Status:** `[x]`
- **Files:** `src/app/trash/page.tsx`, `src/components/trash/trash-list.tsx`, `src/components/trash/trash-group.tsx`, `src/hooks/use-trash-data.ts` (new)
- **Dependencies:** Task 5 (DataStore). **Note:** Task 31 UI (restore/delete buttons) functionally depends on Task 32's cascade hooks being implemented. Build Task 32 first or implement Task 31 and Task 32 together.
- **Actions:**
  - Wire Trash sidebar button in `sidebar.tsx` → navigates to `/trash`
  - `src/hooks/use-trash-data.ts`: New reactive hook. Internally wraps `liveQuery(() => getDataStore().getTrashedItems())`. Returns `{ items: { nodes: Node[], bits: Bit[] }, isLoading: boolean }`. Items are returned flat; grouping is done in `trash-list.tsx`. Follows the same hook boundary rules as all other hooks — no direct DataStore or Dexie imports in the component
  - `trash/page.tsx`: `"use client"`. List view with sidebar (no grid). Uses `useTrashData()`
  - `trash-list.tsx`: Renders all trashed items grouped by top-level parent Node. Global "Empty trash" button → shadcn `AlertDialog` confirmation ("This will permanently delete all trashed items. This cannot be undone.") → on confirm, permanently delete all trashed items. Groups expand independently (not accordion — multiple groups can be open simultaneously)
  - `trash-group.tsx`: Deleted Node shows as single entry with child count indicator ("Work — 3 Nodes, 8 Bits"). Click to expand/collapse children (independent — expanding one does not collapse others)
    - Per-item actions: Restore button, Delete permanently button
    - "Delete permanently" → shadcn `AlertDialog` confirmation before calling hard-delete. "This cannot be undone."
    - Retention label: `text-xs text-muted-foreground` — "X days until permanent deletion" from `deletedAt + 30 days - Date.now()`
  - Restore behavior: returns to original parent grid. BFS nearest-empty-cell if position occupied. Auto-restores parent chain if parent also trashed. **BFS-null edge case:** if BFS returns `null` (parent grid is full), show toast "Parent grid is full. Free up space first." and abort the restore — do not move the item
- **Acceptance:** `/trash` shows trashed items grouped by parent. Expand reveals children. Multiple groups can be open simultaneously. Restore returns to grid with BFS fallback. BFS-null shows toast and aborts. Permanent delete shows AlertDialog confirmation before executing. "Empty trash" shows AlertDialog confirmation before executing. Retention countdown shows
- Trash sidebar button navigates to `/trash`
- **Commit:** `feat: add trash page with grouped view, restore, and permanent delete`

### Task 32: Cascade Delete/Restore/Cleanup Hooks
- **Status:** `[x]`
- **Files:** `src/lib/db/indexeddb.ts` (update), `src/hooks/use-trash-auto-cleanup.ts` (new)
- **Dependencies:** Task 24, Task 6 (BFS)
- **Actions:**
  - **Hook 4 — Cascade soft-delete:** Node trashed → recursively find all descendant Nodes + their Bits, set `deletedAt = Date.now()` on all. Bit trashed → trash Bit only (Chunks implicitly inaccessible via trashed parent)
  - **Hook 5 — Cascade restore:** Node restored → if parent trashed, auto-restore parent chain first (no orphans). Restore all descendants trashed in same cascade. Each restored item: BFS if original `(x, y)` occupied. Bit restored → auto-restore parent Node chain if needed. **BFS-null guard:** if BFS returns `null` for any item during restore (grid full), return an error for that item — do not silently drop it. Caller (Task 31 UI) surfaces this as a toast
  - **Hook 6 — Cascade hard-delete:** Node permanently deleted → delete Node + all descendant Nodes + all descendant Bits + all Chunks of those Bits. Bit deleted → delete Bit + all Chunks
  - **Hook 7 — Trash auto-cleanup:** On app startup and periodically (e.g., every hour): query `deletedAt < Date.now() - 30 * 86400000`. Apply Hook 6 to each match
  - **Auto-cleanup trigger:** Add `useTrashAutoCleanup` hook in `src/hooks/use-trash-auto-cleanup.ts`. Hook runs Hook 7 cleanup once on mount, then on a `setInterval` every 60 minutes. Hook is called from `providers.tsx`.
- **Acceptance:** Unit tests pass:
  - `cascade-delete.test.ts`: trash Node → all descendant Nodes + Bits get `deletedAt`; trash Bit → only that Bit trashed, Chunks untouched
  - `cascade-restore.test.ts`: restore Node with trashed parent → parent chain auto-restored; restored item at occupied cell → BFS fallback
  - `cascade-hard-delete.test.ts`: permanently delete Node → all descendants + their Chunks removed from store
  - `auto-cleanup.test.ts`: items trashed >30 days → permanently deleted on cleanup run
- **Commit:** `feat: implement cascade soft-delete, restore, hard-delete, and trash auto-cleanup`

### Task 33: Search Overlay
- **Status:** `[x]`
- **Files:** `src/components/layout/search-overlay.tsx`
- **Dependencies:** Task 10 (use-search), Task 7 (search-store)
- **Actions:**
  - `search-overlay.tsx`: `"use client"`. Uses `useSearchStore` + `useSearch()`. Motion entry via `searchOverlayVariants`. Per DESIGN_TOKENS:
    - Backdrop: `fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]`
    - Container: `w-full max-w-search-overlay bg-popover rounded-xl border border-border shadow-2xl overflow-hidden`
    - Input: `flex items-center gap-3 px-4 py-3 border-b border-border`. Search icon `w-5 h-5 text-muted-foreground`. Input field `flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base` with `autoFocus`
    - Results: `max-h-[50vh] overflow-y-auto py-2`. Each: `flex items-center gap-3 px-4 py-2.5 hover:bg-accent cursor-pointer transition-colors`. Type icon `w-4 h-4 text-muted-foreground`, title `text-sm font-medium text-foreground truncate`, path `text-xs text-muted-foreground truncate`, deadline
  - Trigger: sidebar Search button or `Cmd/Ctrl+K` shortcut. Keyboard handler calls `e.preventDefault()` to prevent browser address-bar focus; fires regardless of current focus target
  - Click result → navigate to item's grid location and close overlay:
    - Node result: navigate to `/grid/[nodeId]`
    - Bit result: navigate to `/grid/[parentNodeId]?bit=[bitId]`
    - Chunk result: navigate to `/grid/[grandparentNodeId]?bit=[parentBitId]`
  - **`SearchResult` type update** (in `use-search.ts` AND `datastore.ts` AND `indexeddb.ts`): Added `parentNodeId: string` for Bit results; added `parentBitId: string` and `grandparentNodeId: string` for Chunk results. `searchAll` returns these ID fields alongside `parentPath: string[]`
  - **Empty states:** (a) No query entered → show placeholder text "Search nodes, bits, and chunks…" with a search icon; no results list rendered. (b) Query entered but no matches → show "No results for '[query]'" message centered in the results area
  - **ESC implementation:** Search overlay's ESC handler calls `e.stopPropagation()` after closing, preventing the event from reaching lower-priority handlers (bit detail popup, calendar column expand, edit mode). This is the mechanism for the ESC priority rule in Cross-Cutting Concerns
  - Scope: case-insensitive substring across active nodes, bits, chunks titles
- **Acceptance:** Search opens via sidebar button or Cmd+K. `e.preventDefault()` prevents browser focus steal. Real-time filtering. Empty state shows placeholder when no query; "No results" message when query has no matches. Results show type + parent path. Click navigates and closes. ESC/backdrop closes
- ESC closes overlay (highest priority — before bit detail popup, calendar expand, edit mode); `stopPropagation` prevents lower handlers from firing
- Chunk results navigate to correct grandparent grid with bit popup open
- **Commit:** `feat: add search overlay with real-time filtering and keyboard shortcut`

### Task 34: DnD Grid Interactions
- **Status:** `[x]`
- **Files:** `src/hooks/use-dnd.ts` (update), `src/components/grid/grid-view.tsx` (update)
- **Dependencies:** Task 10, Task 13, Task 20
- **Actions:**
  - Finalize `use-dnd.ts` with full interaction handlers:
    - **Grid reposition (edit mode):** Drag item to empty cell → `DataStore.updateNode/Bit({ x, y })`. Magnet snap via `magnetSnapTransition` (spring: damping ~15, stiffness ~200)
    - **Drag-into-Node:** Drag Bit/Node over a Node card → "suck" spring animation → move item to child grid of target Node with BFS auto-placement
    - **Drag-to-breadcrumb:** Drag item onto breadcrumb segment → move item to that ancestor's grid with BFS
  - Visual feedback: dragged item opacity 0.5, valid drop zones get highlight border
  - @dnd-kit pointer sensor with 8px activation distance (prevents click interference)
- **Acceptance:** Items repositionable in edit mode with snap animation. Drag-into-Node moves to child grid. Drag-to-breadcrumb moves to ancestor. Visual feedback during drag
- **Deferred:** "Move to..." tree browser menu (PRD Section 20.3) — explicitly deferred to v1.1 / PRD Section 26 scope. Not part of this task.
- **Commit:** `feat: implement grid drag interactions with magnet snap and node drop`

### Task 35: Motion Animations
- **Status:** `[x]`
- **Files:** `src/lib/animations/grid.ts` (update), `src/lib/animations/layout.ts` (update), `src/components/grid/grid-view.tsx` (update), `src/components/layout/sidebar.tsx` (update), `src/components/bit-detail/bit-detail-popup.tsx` (update)
- **Dependencies:** Task 8, Task 19
- **Actions:**
  - **Sinking completion:** Bit status → `"complete"` → Motion `AnimatePresence` exit variant: `translateY(8px) scale(0.95) opacity(0.5)` (`sink-fade 0.5s ease-out forwards`). Card sinks below grid and fades
  - **Task tossing:** Drag into Node → spring animation with overshoot. Item visually "thrown" into Node icon
  - **Magnet snap:** Grid and calendar drops snap with spring transition
  - **Sidebar fold/unfold:** Motion layout animation on width change (`w-sidebar` ↔ `w-sidebar-collapsed`). `sidebarVariants` defined in `src/lib/animations/layout.ts`: width transition between `var(--sidebar-width)` (224px) and `var(--sidebar-collapsed-width)` (56px)
  - **Search overlay:** Fade + scale entry/exit via `searchOverlayVariants` (already defined in `layout.ts` — wire it in `search-overlay.tsx`)
  - **Bit detail popup:** Fade + slide-up entry, slide-down + fade exit via `bitDetailPopupVariants`. Canonical definition in `layout.ts` (y: 16, no scale — bit detail is a layout-level overlay). `sinkingVariants`, `taskTossVariants`, `magnetSnapTransition`, and `vignetteVariants` remain in `grid.ts`
  - **Floating idle:** Optional CSS `animate-float` on idle nodes (PRD mentions ON/OFF toggle)
  - All animations respect `prefers-reduced-motion` media query
- **Acceptance:** Completion sinks card. Drag-into-Node tosses. Sidebar animates fold. Popups animate. `prefers-reduced-motion` disables all
- **Commit:** `feat: add Motion animations for completion, tossing, sidebar, and popups`

#### Phase 7 Notes

> **Derived state over effect:** When a selected-index needs to reset on query/open changes, compute it inline from `{ query, index }` state rather than syncing via `useEffect`. Avoids `react-hooks/set-state-in-effect` and removes a render cycle.

> **Codex hook boundary check:** After each Codex run, grep for `getDataStore()` in `src/components/`. Any hit is a boundary violation — extract a hook before integration.

> **Trash child-type grouping:** dnd-kit and multi-child-type trees require explicit per-type grouping in the prompt. "Group children" is ambiguous — write "group child nodes AND bits under deleted parent nodes separately."

> **dnd-kit edit-mode gating:** Always include `disabled: !isEditMode` in Codex prompts for `useDraggable`/`useDroppable`. It is not inferred from "edit mode only."

> **Hook parameter vs. store import:** Hooks must not read Zustand stores. Pass data as parameters instead. Flag this in Codex prompts: "hooks accept data as parameters; they do not import stores."

> **liveQuery is allowed in hooks:** The conformance standard was amended to explicitly permit `liveQuery` imports in `src/hooks/*.ts`. This is the intended reactive-layer pattern — only structural Dexie usage (table access, schema) is blocked outside `indexeddb.ts`.

> **liveQuery initialization guard vs. loading UX:** `isLoading` flags used to suppress premature empty-state renders while `liveQuery` hydrates are not optimistic-UI violations. The conformance checklist should distinguish initialization guards (`isLoading ? null : <Component />`) from user-visible loading UX (spinners, skeletons). The former is acceptable; the latter is not.

> **Full issue log:** `docs/issues/Issues_Phase_7.md`

---


---

#### Phase 7 Defer Notes

> *(Moved from Cross-Cutting section during Pass 3 migration — these are Phase 7 scoped defer items, not cross-cutting policy.)*

> **Explicitly deferred polish items (not in Phase 7 scope):**
> - Folded sidebar red highlight + scale animation (PRD Section 16, line 494-495) — Phase 7 if time permits
> - Breadcrumb subtitle expand option (PRD Section 6, line 197) — Phase 7 if time permits
> - Floating animation ON/OFF toggle settings (PRD Section 25, line 2130) — settings UI is out of scope for v1
> - "Neglected" dust/noise texture (PRD Section 10, line 306) — Phase 7 if time permits or defer to Section 26
> - NodeCard icon container minor size discrepancy (52px vs 56px spec) — Phase 7 Polish
> - Sidebar button/icon sizing discrepancies — Phase 7 Polish
> - DeadlineConflictOverlay integration in calendar compact items — overlay exists and works in grid views; calendar items update reactively but don't show the in-context "Modify timeline" prompt. Phase 7 if time permits.
