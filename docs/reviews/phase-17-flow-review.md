# Flow-Trace Review — Phase 17

**Reviewed:** 2026-06-15  
**Method:** Targeted in-context review (Claude-led). SPEC.md authority sections traced against T77–T80 specs and current implementation.  
**Inputs:** EXECUTION_PLAN.md § Phase 17, SPEC.md (System Node Routing, Inbox/Triage Workspace), SCHEMA.md (systemRole, hiddenFromGrid, scratchBreakdowns, Scratch Bits, Hooks 8/10/11), current implementation: `grid-runtime.tsx`, `sidebar.tsx`, `use-inbox.ts`, `indexeddb.ts`, `constants.ts`

---

## Flow-Trace Table

| # | User Flow | Trigger | Intended Outcome | Owning Task | Boundary Cases | Status |
|---|-----------|---------|------------------|-------------|----------------|--------|
| F1 | Navigate to Inbox Node | User clicks Inbox in sidebar → `/grid/[nodeId]` | `GridRuntime` dispatches `systemRole === 'inbox'` → renders `<TriageWorkspace/>` instead of standard grid | T77 | `'archive_view'` branch NOT added (Phase 19); `systemRole === null` still renders standard grid | ✅ Owned |
| F2 | System Nodes always visible in sidebar | Any app state, even when `hiddenFromGrid: true` | Sidebar queries `systemRole !== null`; system nodes always listed regardless of grid visibility | T77 | Sidebar currently has no reactive node-list hook — T77 must add one | ⚠️ Weak |
| F3 | "Remove from grid" on system Node | User action in sidebar | `updateNode(id, { hiddenFromGrid: true })`; node stays in sidebar, disappears from L0 grid; `x/y` retained | T77 | System nodes cannot be trashed or archived (guard already in `indexeddb.ts` `archiveNode`) | ✅ Owned |
| F4 | "Show on Grid" on system Node | User action in sidebar (node is `hiddenFromGrid: true`) | `hiddenFromGrid: false`; BFS re-placement if original `(x, y)` occupied | T77 | `findFirstAvailableCell` is internal to `indexeddb.ts` (not exported on DataStore interface); BFS requires either new DataStore method or client-side occupancy check | ⚠️ Weak |
| F5 | Inbox badge — count and color tier | Scratch Bits added / archived / deleted | Badge: 0→hidden; 1–7→`bg-muted text-muted-foreground`; 8–14→`bg-priority-mid-bg text-priority-mid`; 15+→`bg-destructive text-destructive-foreground` | T77 | Thresholds must live in `constants.ts`; semantic tokens only (no hard-coded HSL per DESIGN_TOKENS Inbox Badge) | ✅ Owned |
| F6 | Inbox badge — live reactive count | Any Scratch Bit create / archive / delete | Badge count updates without page refresh | T77 | `use-inbox.ts` currently uses one-shot `getAllActiveNodes()` + retry — not a live subscription. Needs `useLiveQuery` pattern for reactive Scratch count. Badge correctness depends on this. | ⚠️ Weak |
| F7 | Triage workspace layout renders | `<TriageWorkspace/>` mounts | Four areas: Scratch Pool (left, full height) + Main Work Area (right); Main top 60%/bottom 40%; top: Breakdown 60% / Staging 40%; Staging: Node Zone 35% / Bit Zone 65% | T78 | Staging content is Phase 18 scope (T81); T78 renders placeholder zones | ✅ Owned |
| F8 | Scratch Pool — active list ordered by `createdAt` | Triage workspace visible | Live list of active Scratch Bits (`parentId` = Inbox, `deletedAt = null`, `archivedAt = null`) newest-first; relative-time labels | T79 | Relative-time labels (`2h ago` / `yesterday` / `2 days ago` / `6 days ago` / `m/dd/yy`) — no utility exists yet; Codex must author or inline | ⚠️ Weak |
| F9 | Selecting a Scratch — pool collapses | User clicks Scratch row | Selected Scratch stored in `triage-store`; pool auto-collapses; Breakdown panel updates to selected context | T79 | Do not force selected title into collapsed rail (spec explicit) | ✅ Owned |
| F10 | Scratch Pool — manual open/close | User interaction | Expanded/collapsed toggle independent of auto-collapse | T79 | Auto-collapse after select; manual override supported | ✅ Owned |
| F11 | Breakdown — input row always active | Scratch selected | Always-visible input; submit → `createScratchBreakdown` persists row with `content`, `order`, `createdAt` | T80 | DataStore CRUD confirmed: `createScratchBreakdown` ✅ in Phase 15 | ✅ Owned |
| F12 | Breakdown — delete row with confirmation | User clicks delete affordance | Confirmation dialog → confirm → single-row delete (`deleteScratchBreakdown(id)`) | T80 | `deleteScratchBreakdown(id)` does NOT exist in DataStore — only `deleteScratchBreakdownsByScratch(scratchBitId)` (bulk). T80 Files list omits `datastore.ts` / `indexeddb.ts`. See IC-5. | ⚠️ Weak |
| F13 | Switching selected Scratch → breakdown list swaps | User selects different Scratch | `use-scratch-breakdowns` scoped by `scratchBitId`; list updates to new Scratch's rows | T80 | No persisted data loss on switch (rows stay unconsumed); `triage-store` drives the scope | ✅ Owned |
| F14 | Breakdown rows — drag handle visual | Phase 17 render | Rows have drag handle UI; actual DnD wiring is Phase 18 scope | T80 | Deferred by spec: "drag wiring lands in Phase 18". Phase 17 must NOT wire DnD — static handle only | ⏸️ Deferred |
| F15 | Scratch sentinel exemption (Hook 8) | Scratch Bit created with `x=0, y=0` | Cell uniqueness check skipped for Inbox-parented Bits (`(0,0)` sentinel) | T77 (via `useInbox` / existing Phase 16 logic) | Already implemented in Phase 16 (Inbox `(0,0)` sentinel exemption confirmed) | ✅ Owned |
| F16 | Scratch count badge excludes deleted/archived | Badge computation | Only Bits where `deletedAt = null` AND `archivedAt = null` AND `parentId` = Inbox count toward badge | T77 | SCHEMA Hook lifecycle filter explicitly requires both guards | ✅ Owned |

---

## Implementation Complexity Flags (not plan gaps)

These are flows where the WHAT is clear but the HOW carries non-trivial integration complexity. Not blockers, but Codex prompt should call them out explicitly.

### IC-1: Sidebar reactive node-list hook (T77)

`sidebar.tsx` currently has no dynamic node-list hook — only static nav links and store-based state. T77 must add a reactive query for system nodes (`systemRole !== null`). The DataStore has `getAllActiveNodes()` but it's one-shot; for reactivity, a `useLiveQuery` binding (like other hooks in this project) is needed. T77's Files list includes `sidebar.tsx` but not a new hook file — Codex should author a minimal inline Dexie `useLiveQuery` inside `use-inbox.ts` update or extract a `use-system-nodes.ts` hook.

**Recommendation:** Extend `use-inbox.ts` to also return the system node list (reactive), keeping changes scoped to the file already in T77's Files list.

### IC-2: "Show on Grid" BFS not in DataStore interface (T77)

`findFirstAvailableCell` is private to `IndexedDBDataStore` and not exposed on the `DataStore` interface. For the "Show on Grid" action, two paths:
- **Option A (client-side):** Read current L0 nodes in sidebar, compute BFS in the component, call `updateNode(id, { hiddenFromGrid: false, x: newX, y: newY })` — duplicates BFS logic.
- **Option B (DataStore method):** Add `showSystemNodeOnGrid(id)` to the DataStore interface and implementation — cleaner, but adds interface surface.

This is an implementer decision (not a product decision), so it falls within Codex's judgment scope. Flag it explicitly in the Codex prompt.

### IC-3: `use-inbox.ts` reactive pattern (T77)

Current implementation uses a one-shot effect + retry loop. For live Scratch count (badge), this is insufficient — the count must update reactively when Scratches are created/archived/deleted. T77's Files list includes `use-inbox.ts (update — Scratch count)`, implying a conversion to a reactive pattern. The standard pattern in this project is `useLiveQuery` from Dexie (see `use-grid-data.ts`, `use-bit-detail.ts`). Codex should convert the Scratch count query (not necessarily the `inboxNodeId` lookup) to `useLiveQuery`.

### IC-4: Relative-time formatting for Scratch Pool (T79)

SPEC specifies: `2h ago` / `yesterday` / `2 days ago` / `6 days ago` / `m/dd/yy`. No shared utility exists for this pattern in `src/lib/utils/`. Codex must inline or author a `formatRelativeTime(date: Date): string` helper. Should be a pure function co-located with the component or placed in `src/lib/utils/` per the project convention for pure utilities.

### IC-5: T80 requires single-row breakdown deletion — `deleteScratchBreakdown(id)` absent from DataStore (T80)

T80 acceptance: "each row shows content + `createdAt` + an always-visible delete affordance (delete asks confirmation)." This requires deleting a single targeted row by its `id`.

Current DataStore API (from Phase 15):
- `deleteScratchBreakdownsByScratch(scratchBitId)` — bulk delete; removes **all** rows for a given Scratch Bit
- No `deleteScratchBreakdown(id: string): Promise<void>` for single-row deletion

T80's Files list (`breakdown-panel.tsx`, `use-scratch-breakdowns.ts`) does not include DataStore or implementation files. Using the bulk delete as a substitute would destroy all breakdown rows for the selected Scratch on every single-row delete — a functional correctness defect.

**Required additions (see T80 amendment preview):**
- `src/lib/db/datastore.ts` — add `deleteScratchBreakdown(id: string): Promise<void>` to interface
- `src/lib/db/indexeddb.ts` — implement single-row delete (`database.scratchBreakdowns.delete(id)`)
- `src/lib/db/scratch-breakdowns.test.ts` (or equivalent) — unit test for single-row delete

---

## Phase 16 Follow-up — Phase 17 Blocker Assessment

| Issue | Status | Phase 17 blocker? |
|-------|--------|-------------------|
| ISSUE-16-02: ScratchModal focus trap / trigger-focus restoration | Open (accessibility, non-blocking) | ❌ No — `ScratchModal` is Phase 16 scope; Phase 17 does not modify it |
| ISSUE-16-03: ScratchModal hover-pause race condition | Open (low priority) | ❌ No — interaction-only edge case in Phase 16 component; no Phase 17 dependency |

Both issues remain open follow-ups with no Phase 17 implementation dependency. They can proceed in parallel or after Phase 17 close.

---

## C21 / C22 Carryover Assessment

| Carryover | Phase 17 overlap? | Decision |
|-----------|------------------|----------|
| C21: Schema-version terminology | No DB schema changes in Phase 17 | Non-blocking. Keep as project-side carryover. |
| C22: Migration-test harness mechanics | No new migration in Phase 17 | Non-blocking. Keep as project-side carryover. |

Neither affects Phase 17 implementation scope.

---

## Gaps Found

| # | Flow | Gap Type | Description | Recommended Resolution |
|---|------|----------|-------------|----------------------|
| G1 | F12 — Breakdown single-row delete | Missing DataStore method | `deleteScratchBreakdown(id)` absent from interface and implementation; bulk delete is not a valid substitute | Add `deleteScratchBreakdown(id)` to DataStore interface + IndexedDB implementation + unit test; add these files to T80 scope (see amendment preview) |

---

## Summary

- **Flows traced:** 16
- **Fully owned:** 11
- **Weak (implementation complexity):** 5 (F2, F4, F6, F8, F12)
- **Deferred (explicitly scoped to Phase 18):** 1 (F14)
- **Gaps:** 1 (G1 — T80 single-row delete)
- **Status: PASS with amendment** — T80 Files scope needs expansion before implementation. See amendment preview below. IC-1–IC-5 should be embedded as explicit notes in Codex prompts.

### T80 Amendment Preview (for user approval — do not apply until confirmed)

Add to T80 Files:
```
- `src/lib/db/datastore.ts` (update — add `deleteScratchBreakdown(id: string): Promise<void>`)
- `src/lib/db/indexeddb.ts` (update — implement single-row delete)
- `src/lib/db/scratch-breakdowns.test.ts` (create or update — unit test for single-row delete)
```

No changes to T80 Actions or Acceptance required — the spec already says "delete affordance (delete asks confirmation)" which implies single-row delete. The gap is only in the Files list.

### Recommended Codex prompt callouts (per task)

**T77 prompt must include:**
- IC-1: Add reactive system-node query to `use-inbox.ts` or extract minimal hook; sidebar must use it
- IC-2: "Show on Grid" BFS — choose Option A (client-side) or Option B (DataStore method); implement the chosen path consistently
- IC-3: Convert Scratch count query in `use-inbox.ts` to `useLiveQuery` pattern (same pattern as `use-grid-data.ts`)
- Do NOT add `'archive_view'` dispatch branch (Phase 19)

**T79 prompt must include:**
- IC-4: Author `formatRelativeTime(date: Date): string` as a pure utility; place in `src/lib/utils/` per project convention

**T80 prompt must include:**
- IC-5: Add `deleteScratchBreakdown(id)` to DataStore interface + IndexedDB + unit test before using it in `breakdown-panel.tsx`
- Phase 17 renders drag handle UI only — do NOT wire DnD events (Phase 18 scope)
- Delete must use existing `Dialog` primitive with confirmation
