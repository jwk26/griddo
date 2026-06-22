# EXECUTION PLAN — GridDO

Execution plan mode: scaled

> **Guideline:** Check this file first to see the current task before looking into other docs.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete

---

## Phase Index

| Phase | Status | Title | Archive |
|-------|--------|-------|---------|
| 1 | ✅ done | Foundation | [archive](execution-plan/archive/phase-01.md) |
| 2 | ✅ done | Core Logic | [archive](execution-plan/archive/phase-02.md) |
| 3 | ✅ done | Layout Shell + Level 0 Grid | [archive](execution-plan/archive/phase-03.md) |
| 4 | ✅ done | Grid Navigation + Bit Cards | [archive](execution-plan/archive/phase-04.md) |
| 4.5 | ✅ done | Design Alignment | [archive](execution-plan/archive/phase-04-5.md) |
| 5 | ✅ done | Bit Detail + Application Hooks | [archive](execution-plan/archive/phase-05.md) |
| 5.5 | ✅ done | DataStore Facade Cleanup | [archive](execution-plan/archive/phase-05-5.md) |
| 6 | ✅ done | Calendar Views | [archive](execution-plan/archive/phase-06.md) |
| 6.5 | ✅ done | DataStore Facade Migration | [archive](execution-plan/archive/phase-06-5.md) |
| 7 | ✅ done | Trash, Search + Polish | [archive](execution-plan/archive/phase-07.md) |
| 8 | ✅ done | Bit Detail Surface Refinement (Pilot) | [archive](execution-plan/archive/phase-08.md) |
| 9 | ✅ done | Grid UX Improvements | [archive](execution-plan/archive/phase-09.md) |
| 10 | ✅ done | Breadcrumb + Deadline UX | [archive](execution-plan/archive/phase-10.md) |
| 11 | ✅ done | Calendar Shell | [archive](execution-plan/archive/phase-11.md) |
| 12 | ✅ done | Calendar Creation Flows | [archive](execution-plan/archive/phase-12.md) |
| 13 | ✅ done | Weekly Redesign | [archive](execution-plan/archive/phase-13.md) |
| 14 | ✅ done | Monthly Redesign | [archive](execution-plan/archive/phase-14.md) |
| 15 | ✅ done | Lifecycle Schema Foundation | [archive](execution-plan/archive/phase-15.md) |
| 16 | ✅ done | Quick Capture — `+` Entry Surface & Command Palette | [archive](execution-plan/archive/phase-16.md) |
| 17 | ✅ done | Inbox / Triage Workspace — Routing, Layout, Scratch & Breakdown | [archive](execution-plan/archive/phase-17.md) |
| 18 | ✅ done | Inbox / Triage — Staging & Placement DnD (compact-token, partial Grid DnD) | [archive](execution-plan/archive/phase-18.md) |
| 19 | 🔲 active | Archive View & Direct Archive | — |

## Next Numbers

Next phase: 20 · Next task: 89

---

## Cross-Cutting Concerns

These apply across all phases:

- **Two-layer data abstraction (critical PRD constraint):** Data access has two independent abstraction boundaries, both replaceable for v2 cloud sync:
  1. **CRUD layer — DataStore interface** (`src/lib/db/datastore.ts`): All write operations (create, update, delete) go through this interface. v1 implementation: `src/lib/db/indexeddb.ts`.
  2. **Reactive layer — custom hooks** (`src/hooks/use-*.ts`): All read subscriptions go through these hooks. v1 implementation uses Dexie `useLiveQuery` internally. Components never import DataStore or Dexie directly — they import hooks only.
  - For v2 migration: swap the DataStore implementation (e.g., to Supabase) AND swap the reactive internals (e.g., `useLiveQuery` → React Query). Component code stays unchanged.
- **Design tokens:** Use semantic classes from DESIGN_TOKENS.md. All colors via CSS variables — no hardcoded hex. Reference: `bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`, `bg-priority-{high,mid,low}-bg`, `text-priority-{high,mid,low}`, `bg-urgency-{1,2,3}`.
- **Computed values:** Aging state, urgency level, node completion, bit progress — computed at render time via pure utility functions. Never stored in the database (SPEC decision #6).
- **URL-driven state:** Grid level via route (`/`, `/grid/[nodeId]`). Bit detail via query param (`?bit=[bitId]`). Browser back/forward navigation works naturally.
- **Reactive updates:** All data reads via custom hooks (internally `useLiveQuery` in v1). Write to store → all subscribed components auto-update. No manual cache invalidation, no optimistic rollback (SPEC decision #11).
- **Zod at write boundary:** Validate data with Zod schemas on create/update operations. Data read from the store is trusted — no runtime validation on reads (SPEC decision #7).
- **Grid cell uniqueness (Hook 8):** Always check `(parentId, x, y)` occupancy before insert or move. BFS auto-placement as fallback when position is occupied.
- **Testing:** Vitest for unit tests. Pure utility functions (T6) and application hooks (T24, T25, T32) require passing unit tests as acceptance criteria. Test files co-located with source: `src/lib/utils/*.test.ts`, `src/lib/db/*.test.ts`.
- **Accessibility:** `prefers-reduced-motion` disables all animations. Focus management on modals (search overlay, bit detail, dialogs). `aria-labels` on icon-only sidebar buttons. Keyboard navigation for search results.
- **ESC key priority (innermost-first):** Search overlay > Bit detail popup > Calendar column expand > Edit mode. **Implementation:** The search overlay handler (highest priority) calls `e.stopPropagation()` after closing, preventing the event from reaching lower handlers. Each lower handler checks its own open state before consuming the event. Owned by Task 33 (search overlay) — the stopPropagation pattern must be in place before lower-priority handlers can be considered correct.
- **BFS origin rule:** Node creation: BFS from `(0, 0)` (top-left corner). Bit creation: BFS from `(GRID_COLS-1, 0)` (top-right corner). Empty-cell `+` click: BFS from `(clickedX, clickedY)` regardless of type — returns the clicked cell if empty, nearest fallback if occupied.
- **Non-features (PRD Section 26):** Do NOT implement: Mascot System, Labs, AI-Powered Search, Responsive Design, Onboarding Enhancement. These are explicitly deferred.
- **Doc authority:** SCHEMA.md = data model source of truth. SPEC.md = architecture/routes/components. DESIGN_TOKENS.md = visual values. This file = execution order. PRD = historical context, non-authoritative for implementation.

---

## Phase 19: Archive View & Direct Archive

> **Purpose:** The Archive View surface (rendered for the Archive system Node) + single-item restore + direct archive from the context menu. Per SPEC.md (Archive View Surface, Direct Archive).
> **Branch:** `phase-19/archive-view`
> **Canonical refs:** SPEC.md (Archive View Surface, Direct Archive); SCHEMA.md (Hooks 10/11, `archivedAt`)
> **Explicit policies:**
> - Archive View is a portal, not a container (archived items keep their original `parentId`).
> - System Nodes cannot be archived; completion never auto-archives.
> - Baseline UI/tokens (no dedicated Archive theme source; the future global theme system may influence it later).

### Task 86: Archive View surface + routing branch
- **Status:** `[ ]`
- **Files:** `src/components/archive/archive-view.tsx` (create), `src/components/archive/archive-group.tsx` (create), `src/hooks/use-archive.ts` (create), `src/components/layout/grid-runtime.tsx` (update — add the `'archive_view'` dispatch branch)
- **Dependencies:** Phase 17 complete (routing dispatch point), Phase 15
- **Actions:**
  - Add the `systemRole === 'archive_view'` branch to `GridRuntime` to render `<ArchiveView/>`. Query all items where `archivedAt` is set; group by original parent Node (archived L0 Nodes form their own top-level group); sort `archivedAt` descending within each group; search filters by title. Warm/dignified tone; completed items show ✓. Baseline tokens.
- **Acceptance:**
  - Opening the Archive Node shows archived items grouped by original parent, newest-archived first; search filters by title.
  - `pnpm build` passes.

### Task 87: Single-item restore
- **Status:** `[ ]`
- **Files:** `src/components/archive/archive-group.tsx` (update — ↩ action); DataStore `restoreNode`/`restoreBit` (Hook 11)
- **Dependencies:** Task 86
- **Actions:**
  - The ↩ action clears `archivedAt` (`restoreNode`/`restoreBit`). BFS reposition if the original `(x, y)` is occupied. Restoring a Bit whose parent is archived restores the parent chain (±5s window). Single-item only (no bulk restore in v1).
- **Acceptance:**
  - Restoring an item clears `archivedAt` and it reappears at its original grid location (or the nearest free cell); if its parent was archived in the same cascade, the parent chain restores too.
  - `pnpm build` passes.

### Task 88: Direct archive (context menu)
- **Status:** `[ ]`
- **Files:** `src/components/grid/*` context menu (update); DataStore `archiveNode`/`archiveBit` (Hook 10)
- **Dependencies:** Phase 15 complete
- **Actions:**
  - Add "Archive" to the context menu of any non-system Node/Bit. It sets `archivedAt` with cascade (Hook 10). System Nodes are excluded (no Archive option). Completion does NOT auto-archive — completed-but-unarchived items stay on the grid.
- **Acceptance:**
  - The context menu of a non-system Node/Bit shows Archive; archiving removes it from the grid (cascading to descendants) and it appears in Archive View.
  - System Nodes show no Archive option; completing a Bit does not remove it from the grid.
  - `pnpm build` passes.

#### Phase 19 Notes

> Archive uses a single shared cascade timestamp (Hook 10) so restore (Hook 11) can identify cascade members within ±5s — mirroring the trash restore window.
> Archive tone is warm/dignified, distinct from Trash; Batch 1 uses baseline tokens, and the global theme system may influence it later.
