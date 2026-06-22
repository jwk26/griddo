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
| B1 | T86 | mixed | `[x]` Complete | New archive dir + surface + hook + GridRuntime dispatch; Gemini → Codex flow. Pending user approval + commit. |
| B2a | T87 | logic-heavy | `[x]` Complete | ↩ restore — use-archive.ts + archive-group.tsx + archive-view.tsx wired; ref guard + 3 tests |
| B2b | T88 | logic-heavy | `[x]` Complete | Direct archive context menu — useArchiveActions() hook boundary; NodeCard + BitCard DropdownMenuTrigger-based menu; system Node guard hides trigger entirely. Smoke passed. ISSUE-19-01 deferred. |

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

**Gemini involvement:** Yes (mixed) — visual design spec for Archive View surface only. DataStore/API 설계는 Gemini 범위 밖. Codex가 spec + flow-review 기반으로 DataStore + hook + component 전체 구현.

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

### B1 — T86 Archive View Surface (2026-06-22)

**Provider flow:** Gemini design-spec (2nd attempt after prompt correction) → Codex implementation.

**Gemini stage:**
- 1st attempt: timed out — tried to load `web-design-guidelines` as a filesystem path.
- Prompt corrected: skill reference removed, guidelines embedded inline, filesystem rule added.
- 2nd attempt: produced full 9-section design spec (HIGH/MEDIUM/LOW ratings). Artifact adopted.

**Design spec conflicts resolved before Codex:**
- §9 [HIGH] `h-12 → 0` height exit animation → violates "transform/opacity only" rule. **Deferred to B2a.** B1 implements search/filter animation only (opacity + scale, `motionDuration.affordance`).
- §6 Toast + Undo → **Deferred to B2a.** Restore button is visual affordance only (`disabled`, no `onClick`).
- Non-standard Tailwind classes (`saturate-70`, `w-4.5 h-4.5`, `scale-115`) → converted to arbitrary values in Codex prompt.

**Codex implementation:**
- Write set matched exactly: 5 files modified + 2 new files created.
- `getArchivedItems()` filter: `archivedAt !== null && deletedAt === null && systemRole === null` (nodes); `archivedAt !== null && deletedAt === null` (bits). ✅
- Architecture rules observed: no Zustand in hook, no DataStore import in components, search state is local `useState`. ✅
- Restore button: `<button disabled aria-label="Restore">` — no `onClick`, no toast, no unarchive call. ✅
- `grid-runtime.tsx`: `isArchiveRoute = node?.systemRole === "archive_view"` dispatch branch added. ✅

**Test fix:**
- Pre-existing guard test "does not dispatch Archive View system nodes in this phase" updated to assert correct behavior (ArchiveView now renders).
- `getArchivedItems` mock added to `grid-runtime.test.tsx` `beforeEach`.

**Gates:**
- `pnpm build`: ✅ 0 TypeScript errors, compiled successfully.
- `pnpm test`: ✅ 70 files, 414 tests — all passed.

**Status:** User approved + committed (`f21eac8`).

---

### B2a — T87 Single-item unarchive (2026-06-22)

**Classification:** logic-heavy (button visual already established in B1 Gemini spec; T87 is hook wiring + prop threading only). Claude-direct — 3 files + 1 new test file, ~60 lines.

**Write set:**
- `src/hooks/use-archive.ts` — added `refreshVersion` state, `restoringIdsRef` (synchronous guard), `restoringIds` state, `unarchive(type, id)` function; updated `useEffect` deps on `refreshVersion`; expanded return type.
- `src/components/archive/archive-group.tsx` — `RestoreButton` now takes `isRestoring`/`onRestore` props, `disabled` wired to `isRestoring`, `onClick` wired to `onRestore`; `ItemRow` and `ArchiveGroup` accept and forward `onUnarchive`/`restoringIds`.
- `src/components/archive/archive-view.tsx` — destructures `unarchive`/`restoringIds` from `useArchive()`; passes to `<ArchiveGroup>`.
- `src/hooks/use-archive.test.ts` (new) — 3 tests: node/bit dispatch, ref guard double-click.

**Architecture constraints confirmed:** no DataStore import in components, no Zustand in hook, no Dexie import, parent-chain restore handled inside `indexeddb.ts unarchiveBit` (no duplication in hook).

**Ref guard design:** `restoringIdsRef` (`useRef<Set<string>>`) checked synchronously before any `await` inside `unarchive()`. The React state copy (`restoringIds`) is derived from the ref for UI rendering. `finally` block clears both.

**Gates:**
- `pnpm test`: ✅ 71 files, 417 tests — all passed (3 new).
- `pnpm build`: ✅ 0 TypeScript errors, compiled successfully.

**Manual smoke (2026-06-22):**
- Restore flow for Phase 18 archived Scratch Bit: ✅ confirmed (Bit restore covers `unarchiveBit` path including parent-chain logic inside `indexeddb.ts`).
- Arbitrary Bit/Node archive fixture creation: ⏭ not possible — Direct Archive UI (B2b) not yet implemented; no way to archive a regular Node/Bit from the UI.
- Node archive / parent-chain restore smoke: 🔜 deferred to after B2b completion (UI prerequisite).

**Status:** ✅ Complete — committed `7d239ba`. T87 marked `[x]` in EXECUTION_PLAN.md.

---

### B2b — T88 Direct archive context menu (2026-06-23)

**Classification:** logic-heavy / Claude-direct (3 implementation files + tests added to 2 existing files; ~50 lines; established DropdownMenu pattern).

**Plan clarifications applied before implementation:**
- `onContextMenu`-based trigger rejected → DropdownMenuTrigger-based icon-only button (correct Radix usage, accessible)
- System Node guard: entire trigger hidden when `node.systemRole !== null` (not just Archive menu item)
- Test files existed → B2b describe blocks added to existing `node-card.test.tsx` / `bit-card.test.tsx`

**Write set:**
- `src/hooks/use-archive.ts` — added `useArchiveActions()` export: lightweight hook (no state/effects), calls `dataStore.archiveNode` / `dataStore.archiveBit` via DataStore facade
- `src/components/grid/node-card.tsx` — added `group/card` outer class; `MoreHorizontal` icon-only trigger button + DropdownMenu; shown only when `!isEditMode && node.systemRole === null`; `stopPropagation` on trigger click; `archive("node", node.id)` on Archive item
- `src/components/grid/bit-card.tsx` — added `group/bit` outer class; same pattern; shown only when `!isEditMode`; `stopPropagation` required (outer div has `onClick`); `archive("bit", bit.id)` on Archive item
- `src/components/grid/node-card.test.tsx` — added `describe("B2b — archive context menu (NodeCard)")` with 5 tests; added mocks for `@/hooks/use-archive` and `@/components/ui/dropdown-menu`
- `src/components/grid/bit-card.test.tsx` — added `describe("B2b — archive context menu (BitCard)")` with 4 tests; added same mocks

**Architecture constraints confirmed:**
- No DataStore import in cards — `useArchiveActions` hook boundary only ✅
- No Zustand import in `use-archive.ts` ✅
- No new dependencies ✅
- `archivedAt === null` active filter untouched — liveQuery in `useGridData` removes item automatically post-archive ✅
- `grid-view.tsx` unchanged ✅

**Event propagation:**
- NodeCard: trigger is sibling of `motion.button`; outer div has no onClick → no collision; `stopPropagation` added defensively
- BitCard: outer div has `onClick` → `stopPropagation` on trigger is required and applied

**Gates:**
- `pnpm test`: ✅ 71 files, 426 tests — all passed (9 new: 5 NodeCard B2b + 4 BitCard B2b)
- `pnpm build`: ✅ 0 TypeScript errors, compiled successfully

**Status:** ✅ Complete — committed `506a88a`. T88 marked `[x]` in EXECUTION_PLAN.md. Smoke passed.

---

## Open Issues

### ISSUE-19-01 — Archive menu trigger is too subtle / hard to target

- **Category:** UX follow-up
- **Severity:** Medium
- **Status:** Deferred — user wants to rethink the interaction before implementation

**Description:**
B2b smoke confirmed direct archive works functionally, but the `⋯` trigger on NodeCard / BitCard is too subtle on hover and hard to click. Since this is the main entry point for Direct Archive, the affordance needs design reconsideration before it can be considered production-ready.

**Options to explore (user-driven):**
- Always-visible trigger (not opacity-0 by default)
- Larger hit target or different positioning
- Different interaction model entirely (e.g., long-press, swipe, or right-click alongside trigger)

**Canonical impact:** None yet — implementation decision pending user direction.
