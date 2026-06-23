# Phase 19 Flow-Trace Review

> **Reviewer:** Independent subagent (oh-my-claudecode:code-reviewer)
> **Date:** 2026-06-22
> **Scope:** T86, T87, T88
> **Sources:** SPEC.md, SCHEMA.md, EXECUTION_PLAN.md (Phase 19 section), `grid-runtime.tsx`, `datastore.ts`, `indexeddb.ts`, `use-archive-scratch.ts`, `node-card.tsx`, `bit-card.tsx`

## Summary

**Pass with findings**

The plan is well-structured and correctly references the right API names and architecture patterns. Three WARNING-level gaps require resolution before implementation starts: (1) T86 is missing DataStore query methods for archived items, (2) T88 understates its scope — no context menu exists on grid cards yet, and (3) T88's dependency on T86 is not recorded.

---

## Flow Trace Results

### Flow 1: Navigate to Archive Node → Archive View renders

**Status:** ✅ PASS
**Owner task:** T86
**Finding:** T86 clearly owns this flow. The action spec says: "Add the `systemRole === 'archive_view'` branch to `GridRuntime` to render `<ArchiveView/>`." Pattern is verified — `grid-runtime.tsx:70` already dispatches `isInboxRoute` (`systemRole === 'inbox'`) to `<TriageWorkspace/>`. Adding a parallel `archive_view` branch is straightforward. Uses `/grid/[nodeId]` — no new routes. Matches SPEC.md (System Node Routing table).

Acceptance criterion ("Opening the Archive Node shows archived items grouped by original parent, newest-archived first; search filters by title") is specific and testable.

---

### Flow 2: Archive View grouping + sort

**Status:** ⚠️ WARNING — missing DataStore query method
**Owner task:** T86
**Finding:** T86 owns the grouping/sort logic. The action spec correctly describes the portal semantics, grouping by `parentId`, `archivedAt` DESC sort, and title search.

However, **no DataStore query method for retrieving archived items exists**. `getAllActiveNodes()` and `getAllActiveBits()` explicitly filter OUT archived items (`archivedAt === null`). The `use-archive.ts` hook T86 creates needs to query `archivedAt !== null`, but no suitable DataStore method is available.

Precedent: `getTrashedItems()` exists in `datastore.ts` for the Trash view — the same pattern applies here.

**Required action:** Add `getArchivedItems(): Promise<{ nodes: Node[]; bits: Bit[] }>` to `datastore.ts` interface and implement in `indexeddb.ts`. Update T86 file list to include both files.

---

### Flow 3: Single-item restore (↩)

**Status:** ✅ PASS
**Owner task:** T87
**Finding:** T87 correctly uses `unarchiveNode`/`unarchiveBit` (not `restoreNode`/`restoreBit`). Verified in code:

| Method | Location | Implements |
|--------|----------|-----------|
| `unarchiveNode` | `indexeddb.ts:607` | ±5s window, BFS re-placement, `restorableNodeIds` guard, parent chain |
| `unarchiveBit` | `indexeddb.ts:686` | parent Node archived → `unarchiveNode(parentId)` first; BFS re-placement |

Both methods are fully implemented from Phase 15. T87 only needs hook wiring — no DataStore layer changes. Single-item constraint is specified. Acceptance criterion is testable.

---

### Flow 4: Direct archive from context menu

**Status:** ⚠️ WARNING — task scope understated; dependency missing
**Owner task:** T88
**Finding:** T88 owns this flow. API reference is correct (`archiveNode`/`archiveBit`, Hook 10 cascade). Acceptance criteria are testable.

Two issues:

**a) No context menu exists on grid cards.** T88 says "(update)" for `node-card.tsx` and `bit-card.tsx`, but neither file has a `DropdownMenu`, `ContextMenu`, or `onContextMenu` handler — only `onClick` and an edit-mode delete button. T88 needs to **create** context menu infrastructure on grid cards, not just update it. The sidebar has a `DropdownMenu` pattern (sidebar.tsx:225–285) that can serve as a reference.

**b) T88 depends on T86.** T88 must call `archiveNode`/`archiveBit` through `use-archive.ts` (architecture rule: no DataStore import in components). But `use-archive.ts` is created by T86. T88's dependency field says "Phase 15 complete" — it should also list T86.

**Required actions:** Update T88 file list to reflect context menu creation; add T86 as a dependency.

---

### Flow 5: Active item queries remain unbroken (regression)

**Status:** ✅ PASS
**Owner task:** Cross-cutting invariant
**Finding:** All active-item query paths already filter `archivedAt === null`. Verified across:
`getNodes`, `getBits`, `getBitsForNode`, `getAllActiveNodes`, `getAllActiveBits`, `getActiveGridContents`, `getCalendarItems`, `searchAll`, `getGridOccupancy`, `getChildDeadlineConflicts`, `use-calendar-data.ts`, `use-node-urgency.ts`, `use-global-urgency.ts`, `use-inbox.ts`.

Phase 19 introduces no new active-item query paths. `use-archive.ts` queries `archivedAt !== null` (inverse), which does not affect any active query. `pnpm build` gate in each task's acceptance provides a mechanical check.

---

### Flow 6: Architecture invariants

**Status:** ✅ PASS
**Owner task:** All three tasks (cross-cutting)

| Invariant | Plan compliance | Evidence |
|---|---|---|
| `archiveNode`/`archiveBit` called through hook only | T88 routes through `use-archive.ts` | `use-archive-scratch.ts` (Phase 18) shows correct pattern |
| `unarchiveNode`/`unarchiveBit` called through hook only | T87 wires through `use-archive.ts` | Same pattern |
| No DataStore import in archive components | T86 components consume `use-archive.ts` | Mirrors `TriageWorkspace` → `useInbox` pattern |
| No Dexie import in hooks | Not explicitly stated but implied by existing pattern | All existing hooks use DataStore facade only |
| `systemRole !== null` → no Archive option | T88 action spec: "any non-system Node/Bit" | DataStore-level guard also exists as safety net (`archiveNode` throws for system nodes) |

---

## Gaps / Risks

### GAP-1 ⚠️ Missing DataStore query for archived items

T86 creates `use-archive.ts` which must query `archivedAt !== null`, but no `getArchivedItems()` method exists on the DataStore interface. T86's file list omits `datastore.ts` and `indexeddb.ts`.

**Fix:** Add `getArchivedItems(): Promise<{ nodes: Node[]; bits: Bit[] }>` to `datastore.ts`; implement in `indexeddb.ts`; add both files to T86's file list.

### GAP-2 ⚠️ T88 understates scope — context menus must be created, not updated

Neither `node-card.tsx` nor `bit-card.tsx` has any context menu infrastructure. T88 is creating context menus from scratch on grid cards.

**Fix:** Update T88 file list description from "(update)" to "(update — create context menu)"; acknowledge that a new Radix `DropdownMenu` or `ContextMenu` wrapper is needed. Consider adding `grid-view.tsx` to the file list (it renders the card components).

### GAP-3 ⚠️ T88 implicit dependency on T86

T88 must call `archiveNode`/`archiveBit` through `use-archive.ts`, which T86 creates. Current dependency field: "Phase 15 complete" — missing T86.

**Fix:** Add T86 to T88's `Dependencies` field.

### GAP-4 ℹ️ systemRole guard location (low risk)

T88 implies the `systemRole` guard is at the component render level ("any non-system Node/Bit"), which is correct. The DataStore-level guard (`archiveNode` throws for system nodes) is a safety net. No action needed — noting for implementer awareness.

---

## Verdict

**PASS with findings** — implementation may proceed after resolving GAP-1, GAP-2, GAP-3.

| Gap | Severity | Required before implementation? |
|-----|----------|--------------------------------|
| GAP-1: Missing DataStore query | ⚠️ | Yes — T86 cannot be implemented without it |
| GAP-2: T88 scope understated | ⚠️ | Yes — task spec misleads provider |
| GAP-3: T88 missing dependency | ⚠️ | Yes — prevents batch ordering mistake |
| GAP-4: systemRole guard location | ℹ️ | No — implementer note only |
