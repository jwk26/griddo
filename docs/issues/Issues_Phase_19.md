# Phase 19 — Archive View & Direct Archive

> **Branch:** `phase-19/archive-view`
> **Tasks:** T86, T87, T88

---

## Phase-local Question Resolution

| # | Question | Resolution | Canonical Impact | Status |
|---|----------|------------|-----------------|--------|
| Q1 | T87 referenced `restoreNode`/`restoreBit` — Trash restore API. Archive restore API is `unarchiveNode`/`unarchiveBit`. | Corrected. Both methods are already declared in `datastore.ts` and fully implemented in `indexeddb.ts` (Phase 15). T87 only needs to wire them through `use-archive.ts` hook — no DataStore layer changes. | `EXECUTION_PLAN.md` T87 Files + Actions updated to `unarchiveNode`/`unarchiveBit`. Source deferred item `Issues_Phase_15.md` Phase-local Q6 → Resolved. | Reflected |
| Q2 | T86 needs to query `archivedAt !== null` globally, but no `getArchivedItems()` method exists on the DataStore interface. `getAllActiveNodes`/`getAllActiveBits` filter it OUT. | Add `getArchivedItems(): Promise<{ nodes: Node[]; bits: Bit[] }>` to DataStore interface + implement in `indexeddb.ts` (mirrors `getTrashedItems` pattern). T86 file list updated to include both files. | `EXECUTION_PLAN.md` T86 Files + Actions updated. | Reflected |
| Q3 | T88 says "(update)" context menu on grid cards, but no context menu exists on `node-card.tsx` or `bit-card.tsx` — must be created from scratch. | T88 file list corrected to "(update — create context menu)"; `grid-view.tsx` noted as possible additional file on discovery. | `EXECUTION_PLAN.md` T88 Files + Actions updated. | Reflected |
| Q4 | T88 must call `archiveNode`/`archiveBit` through `use-archive.ts` (created in T86) — but T88 dependency only listed "Phase 15 complete". | Add T86 as a dependency for T88. | `EXECUTION_PLAN.md` T88 Dependencies updated. | Reflected |

---

## Deferred Index Sync

The deferred item `Issues_Phase_15.md` Phase-local Q6` was synced at Phase 19 kickoff (not deferred to phase close):
- `Issues_Deferred.md` Active table row removed; moved to Resolved Historical Deferrals.
- `Issues_Phase_15.md` Q6 status updated to **Resolved**.

---

## Planning Gate Note

`docs/reviews/phase-19-flow-review.md` — flow-trace review run at kickoff per CLAUDE.md requirement. See `docs/reviews/phase-19-flow-review.md`.

---

## Batch Plan

| Batch | Tasks | Classification | Status | Notes |
|-------|-------|----------------|--------|-------|
| B1 | T86 | ui-heavy | `[ ]` Not started | New archive dir + surface + hook + GridRuntime dispatch |
| B2a | T87 | mixed | `[ ]` Not started | ↩ restore — updates archive-group.tsx + use-archive.ts |
| B2b | T88 | mixed | `[ ]` Not started | Direct archive context menu — archiveNode/archiveBit must go through use-archive.ts hook boundary; may also touch use-archive.ts |

### Batch B1 — T86: Archive View surface + routing branch

**Write set:**
- `src/components/archive/archive-view.tsx` (create)
- `src/components/archive/archive-group.tsx` (create)
- `src/hooks/use-archive.ts` (create)
- `src/components/layout/grid-runtime.tsx` (update — add `archive_view` dispatch branch)
- `src/lib/db/datastore.ts` (update — add `getArchivedItems()`)
- `src/lib/db/indexeddb.ts` (update — implement `getArchivedItems()`)

**Key constraints:**
- Archive View is a portal — queries ALL items where `archivedAt !== null`, not the system Node's own children
- `getArchivedItems()` follows the `getTrashedItems` pattern in indexeddb.ts
- `use-archive.ts` must be the hook boundary: no DataStore import in components
- GridRuntime already has `isInboxRoute` pattern (line 70) — mirror this for `isArchiveViewRoute`
- Active item queries throughout the app already filter `archivedAt === null` (SCHEMA.md Key Queries) — do not break this

**Gemini involvement:** Yes — visual design for Archive View surface (grouping layout, warm/dignified tone, ✓ on completed items, search bar, ↩ restore button)

### Batch B2a — T87: Single-item unarchive

**Write set:**
- `src/components/archive/archive-group.tsx` (update — add ↩ action button)
- `src/hooks/use-archive.ts` (update — expose `unarchiveNode`/`unarchiveBit`)

**Key constraints:**
- Call `unarchiveNode` / `unarchiveBit` — NOT `restoreNode`/`restoreBit`
- DataStore methods already exist; hook wiring only
- Parent-chain restore (archived Bit → archived parent Node) is already handled inside `indexeddb.ts unarchiveBit` — no extra hook-level logic needed
- Single-item only — no bulk restore UI

**Gemini involvement:** Low — ↩ button addition; brief visual spec for button placement/appearance in the group row

---

### Batch B2b — T88: Direct archive (context menu)

**Write set:**
- `src/components/grid/node-card.tsx` (update — create context menu, add Archive option)
- `src/components/grid/bit-card.tsx` (update — create context menu, add Archive option)
- `src/hooks/use-archive.ts` (update — expose `archiveNode`/`archiveBit` if not already exposed by B2a)
- `src/components/grid/grid-view.tsx` may be needed on discovery (renders card wrappers)

**Key constraints:**
- No context menu exists yet on grid cards — must be created (Radix `DropdownMenu` or `ContextMenu`); sidebar.tsx:225–285 is the reference pattern
- `archiveNode`/`archiveBit` must be called through `use-archive.ts` hook boundary — NOT direct DataStore import in components
- Guard: `node.systemRole === null` before rendering Archive option (DataStore-level guard is safety net only)
- Completion does NOT trigger archive — no auto-archive logic anywhere
- Same API (`archiveNode`/`archiveBit`, Hook 10) as Phase 18 T85 `useArchiveScratch`
- Depends on T86 (for `use-archive.ts` hook)

**Gemini involvement:** Low — context menu addition is established pattern

---

## Execution Log

*(populated during implementation)*
