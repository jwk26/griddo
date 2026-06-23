## Phase 19: Archive View & Direct Archive

> **Purpose:** The Archive View surface (rendered for the Archive system Node) + single-item restore + direct archive from the context menu. Per SPEC.md (Archive View Surface, Direct Archive).
> **Branch:** `phase-19/archive-view`
> **Canonical refs:** SPEC.md (Archive View Surface, Direct Archive); SCHEMA.md (Hooks 10/11, `archivedAt`)
> **Explicit policies:**
> - Archive View is a portal, not a container (archived items keep their original `parentId`).
> - System Nodes cannot be archived; completion never auto-archives.
> - Baseline UI/tokens (no dedicated Archive theme source; the future global theme system may influence it later).

### Task 86: Archive View surface + routing branch
- **Status:** `[x]`
- **Files:** `src/components/archive/archive-view.tsx` (create), `src/components/archive/archive-group.tsx` (create), `src/hooks/use-archive.ts` (create), `src/components/layout/grid-runtime.tsx` (update — add the `'archive_view'` dispatch branch), `src/lib/db/datastore.ts` (update — add `getArchivedItems()`), `src/lib/db/indexeddb.ts` (update — implement `getArchivedItems()`)
- **Dependencies:** Phase 17 complete (routing dispatch point), Phase 15
- **Actions:**
  - Add `getArchivedItems(): Promise<{ nodes: Node[]; bits: Bit[] }>` to the DataStore interface and implement in `indexeddb.ts` (mirrors `getTrashedItems` pattern — filter `archivedAt !== null`). Add the `systemRole === 'archive_view'` branch to `GridRuntime` to render `<ArchiveView/>`. `use-archive.ts` calls `getArchivedItems()` via the DataStore facade. Group by original parent Node (archived L0 Nodes form their own top-level group); sort `archivedAt` descending within each group; search filters by title. Warm/dignified tone; completed items show ✓. Baseline tokens.
- **Acceptance:**
  - Opening the Archive Node shows archived items grouped by original parent, newest-archived first; search filters by title.
  - `pnpm build` passes.

### Task 87: Single-item restore
- **Status:** `[x]`
- **Files:** `src/components/archive/archive-group.tsx` (update — ↩ action); `src/hooks/use-archive.ts` (update — wire `unarchiveNode`/`unarchiveBit`)
- **Dependencies:** Task 86
- **Actions:**
  - The ↩ action clears `archivedAt` via `unarchiveNode`/`unarchiveBit` (Hook 11). Both methods are already implemented in `indexeddb.ts` — no DataStore layer changes needed; wire them through `use-archive.ts`. BFS reposition if the original `(x, y)` is occupied. Restoring a Bit whose parent is archived restores the parent chain (±5s window). Single-item only (no bulk restore in v1).
- **Acceptance:**
  - Restoring an item clears `archivedAt` and it reappears at its original grid location (or the nearest free cell); if its parent was archived in the same cascade, the parent chain restores too.
  - `pnpm build` passes.

### Task 88: Direct archive (context menu)
- **Status:** `[x]`
- **Files:** `src/components/grid/node-card.tsx` (update — create context menu, add Archive option), `src/components/grid/bit-card.tsx` (update — create context menu, add Archive option), `src/hooks/use-archive.ts` (update — expose `archiveNode`/`archiveBit`)
- **Dependencies:** Phase 15 complete, Task 86
- **Actions:**
  - Added `useArchiveActions()` export to `use-archive.ts` (lightweight hook, no state/effects). Added `DropdownMenuTrigger`-based icon-only `⋯` button to NodeCard/BitCard. System Nodes (`systemRole !== null`) hide the trigger entirely. Archive item calls `archiveNode`/`archiveBit` through hook boundary; `liveQuery` in `useGridData` removes item from active grid automatically. Completion does NOT auto-archive.
- **Acceptance:**
  - Non-system Node/Bit shows `⋯` trigger → Archive option; archiving removes from grid and appears in Archive View. ✅ Smoke confirmed.
  - System Nodes show no trigger. ✅
  - Completing a Bit does not remove it from the grid. ✅

#### Phase 19 Notes

> Archive uses a single shared cascade timestamp (Hook 10) so restore (Hook 11) can identify cascade members within ±5s — mirroring the trash restore window.

> Archive tone is warm/dignified, distinct from Trash; Batch 1 uses baseline tokens, and the global theme system may influence it later.

> **hook split pattern:** `useArchiveActions()` (lightweight, no state — for write-only callers like grid cards) and `useArchive()` (full state — for the Archive View surface) are both exported from `use-archive.ts`. Use `useArchiveActions` when a component only needs to trigger archive/unarchive without reading archived items.

> **DropdownMenu trigger affordance:** The `⋯` trigger on NodeCard/BitCard is opacity-0 by default and appears on hover. Smoke confirmed functional, but the affordance was noted as too subtle for production (ISSUE-19-01). UX reconsideration deferred to user direction.

> **Radix DropdownMenu in tests:** Mock `@/components/ui/dropdown-menu` with pass-through components (DropdownMenuContent always rendered, DropdownMenuItem as `<button>`). This avoids portal/pointer-event issues in jsdom while still letting you assert trigger presence and menu item click behavior.

> **Full issue log:** `docs/issues/Issues_Phase_19.md`
