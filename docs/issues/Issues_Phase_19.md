# Phase 19 — Archive View & Direct Archive

> **Branch:** `phase-19/archive-view`
> **Tasks:** T86, T87, T88

---

## Phase-local Question Resolution

| # | Question | Resolution | Canonical Impact | Status |
|---|----------|------------|-----------------|--------|
| Q1 | T87 referenced `restoreNode`/`restoreBit` — Trash restore API. Archive restore API is `unarchiveNode`/`unarchiveBit`. | Corrected. Both methods are already declared in `datastore.ts` and fully implemented in `indexeddb.ts` (Phase 15). T87 only needs to wire them through `use-archive.ts` hook — no DataStore layer changes. | `EXECUTION_PLAN.md` T87 Files + Actions updated to `unarchiveNode`/`unarchiveBit`. Source deferred item `Issues_Phase_15.md` Phase-local Q6 → Resolved. | Reflected |

---

## Deferred Index Sync

The deferred item `Issues_Phase_15.md` Phase-local Q6 ("Phase 19 still references `restoreNode`/`restoreBit` wording") is now **Resolved** by the T87 correction above. Update `Issues_Deferred.md` at phase close.

---

## Planning Gate Note

`docs/reviews/phase-19-flow-review.md` does not exist.
Per CLAUDE.md: flow-trace review is required before implementation starts.
This gate must be satisfied before any provider prompt (Codex/Gemini) runs for T86/T87/T88.
Options: run flow-trace review now, or explicit user waiver.

---

## Batch Plan

| Batch | Tasks | Classification | Status | Notes |
|-------|-------|----------------|--------|-------|
| B1 | T86 | ui-heavy | `[ ]` Not started | New archive dir + surface + hook + GridRuntime dispatch |
| B2 | T87, T88 | mixed | `[ ]` Not started | T87: ↩ restore wiring; T88: context menu archive. Disjoint write sets — can batch together. |

### Batch B1 — T86: Archive View surface + routing branch

**Write set:**
- `src/components/archive/archive-view.tsx` (create)
- `src/components/archive/archive-group.tsx` (create)
- `src/hooks/use-archive.ts` (create)
- `src/components/layout/grid-runtime.tsx` (update — add `archive_view` dispatch branch)

**Key constraints:**
- Archive View is a portal — queries ALL items where `archivedAt !== null`, not the system Node's own children
- `use-archive.ts` must be the hook boundary: no DataStore import in components
- GridRuntime already has `isInboxRoute` pattern (line 70) — mirror this for `isArchiveViewRoute`
- Active item queries throughout the app already filter `archivedAt === null` (SCHEMA.md Key Queries) — do not break this

**Gemini involvement:** Yes — visual design for Archive View surface (grouping layout, warm/dignified tone, ✓ on completed items, search bar, ↩ restore button)

### Batch B2 — T87 + T88: Restore + Direct Archive

**Write set (T87):**
- `src/components/archive/archive-group.tsx` (update — add ↩ action button)
- `src/hooks/use-archive.ts` (update — expose `unarchiveNode`/`unarchiveBit`)

**Write set (T88):**
- `src/components/grid/node-card.tsx` (update — add Archive to context menu)
- `src/components/grid/bit-card.tsx` (update — add Archive to context menu)
- (check: context menu may be in a shared component; adjust on discovery)

**Key constraints (T87):**
- Call `unarchiveNode` / `unarchiveBit` — NOT `restoreNode`/`restoreBit`
- DataStore methods already exist; hook wiring only
- Restoring archived Bit whose parent is also archived → `unarchiveNode` parent chain (already handled inside `indexeddb.ts` `unarchiveBit`)
- Single-item only — no bulk restore UI

**Key constraints (T88):**
- Archive option hidden for `systemRole !== null` nodes
- Completion does NOT trigger archive — no auto-archive logic
- Calls `archiveNode` / `archiveBit` (Hook 10) — same API used in T85 `useArchiveScratch`

**Gemini involvement:** Low — context menu additions are established pattern; minor visual confirmation if needed

---

## Execution Log

*(populated during implementation)*
