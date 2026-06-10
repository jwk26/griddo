## Phase 15: Lifecycle Schema Foundation

> **Purpose:** Implement the data-layer foundation for the lifecycle system (archive, system nodes, Scratch breakdown storage) per SCHEMA.md. No user-facing UI — this unblocks Quick Capture, Inbox/Triage, and Archive View.
> **Branch:** `phase-15/lifecycle-foundation`
> **Canonical refs:** SCHEMA.md (nodes/bits fields, `scratchBreakdowns` store, indexes, Zod, Hooks 10/11, Key Queries archive sweep, Default System Nodes); SPEC.md AD #15
> **Explicit policies:**
> - Additive, non-destructive migration: existing rows gain defaults (`archivedAt = null`, `systemRole = null`, `hiddenFromGrid = false`). No data loss.
> - System-managed fields (`systemRole`, `hiddenFromGrid`, `archivedAt`) are excluded from `createNodeSchema`; system nodes are seeded via an internal full-`nodeSchema` path.
> - Completion stays purely computed and never auto-archives.

### Task 68: Schema fields + Zod (lifecycle)
- **Status:** `[x]`
- **Files:** `src/lib/db/schema.ts` (update)
- **Dependencies:** Phase 14 complete
- **Actions:**
  - `nodes`: add `archivedAt: number | null` (default `null`), `systemRole: 'inbox' | 'archive_view' | null` (default `null`), `hiddenFromGrid: boolean` (default `false`). `bits`: add `archivedAt: number | null` (default `null`).
  - Zod: `nodeSchema` gains the three fields; `bitSchema` gains `archivedAt`. `createNodeSchema.omit` adds `systemRole`, `hiddenFromGrid`, `archivedAt`; `createBitSchema.omit` adds `archivedAt`.
  - New `scratchBreakdownSchema` (`id`, `scratchBitId` FK→`bits.id`, `content` min 1 max 1000, `order` int ≥ 0, `createdAt`, `consumedAt` nullable default `null`) + `createScratchBreakdownSchema` (omit `id`/`createdAt`/`consumedAt`). Export `ScratchBreakdown` / `CreateScratchBreakdown` types.
- **Acceptance:**
  - `schema.ts` type-checks; `Node` includes `systemRole`/`hiddenFromGrid`/`archivedAt`, `Bit` includes `archivedAt`.
  - `createNodeSchema.parse()` strips system-managed fields (`systemRole`/`hiddenFromGrid`/`archivedAt`) from its parsed output — Zod strip semantics (no `.strict()`), so they cannot enter through the create path.
  - `ScratchBreakdown` / `CreateScratchBreakdown` exported.
  - `pnpm build` passes.

### Task 69: Dexie store version + indexes + migration
- **Status:** `[x]`
- **Files:** `src/lib/db/indexeddb.ts` (update)
- **Dependencies:** Task 68
- **Actions:**
  - Bump the Dexie version. Add the `scratchBreakdowns` object store. Add indexes: `idx_nodes_systemRole`, `idx_nodes_archivedAt`, `idx_nodes_active_full` `[parentId,deletedAt,archivedAt]`, `idx_bits_archivedAt`, `idx_bits_active_full` `[parentId,deletedAt,archivedAt]`, and `scratchBreakdowns` `[scratchBitId,order]` + `scratchBitId`.
  - Upgrade function: backfill `archivedAt = null`, `systemRole = null`, `hiddenFromGrid = false` on existing `nodes`/`bits` rows so the new indexes are correct.
- **Acceptance:**
  - DB opens at the new version without error; `version(3)` declares the lifecycle indexes + `scratchBreakdowns` store + backfill `upgrade`. Runtime verification of the backfill against existing IndexedDB data is tracked in `docs/issues/Issues_Phase_15.md` (ISSUE-15-01) — no `debug-indexeddb` route exists.
  - Existing rows remain readable with the lifecycle fields defaulted.
  - `pnpm build` passes.

### Task 70: DataStore archive/restore + scratchBreakdown CRUD (Hooks 10/11)
- **Status:** `[x]`
- **Files:** `src/lib/db/datastore.ts` (update interface), `src/lib/db/indexeddb.ts` (implement)
- **Dependencies:** Task 69
- **Actions:**
  - **Hook 10 (Archive Cascade):** `archiveNode(id)` — create one shared timestamp, set `archivedAt` on the Node + all descendant Nodes/Bits (reuse the soft-delete cascade traversal pattern). `archiveNode(id)` rejects when the target Node has `systemRole !== null`; `archiveBit(id)` archives only the target Bit (Bits have no `systemRole`).
  - **Hook 11 (Archive Restore):** `unarchiveNode(id)` / `unarchiveBit(id)` — restore only descendants within ±5s of the parent's `archivedAt` (reuse `isWithinRestoreWindow`), and only Bits whose parent Node is itself restored (mirrors trash `restoreNode`'s parent guard); BFS reposition if the original cell is occupied; restoring a Bit whose parent is archived restores the parent chain. (Named `unarchive*` to avoid collision with the existing trash-restore `restoreNode`/`restoreBit`.)
  - **scratchBreakdowns CRUD:** create / list-by-scratch (ordered) / update content+order / `markConsumed` (set `consumedAt`) / `unconsume` (`null`) / bulk-delete-by-scratch. Scratch Bit **hard-delete** also hard-deletes its `scratchBreakdowns` rows; **archive** does not.
- **Acceptance:**
  - Archiving a Node sets one shared `archivedAt` across descendants; restore brings back only same-window members; archiving a system node is blocked.
  - scratchBreakdowns rows can be created, consumed, unconsumed, and bulk-deleted; hard-deleting a Scratch Bit removes its rows, archiving does not.
  - `pnpm build` passes.

### Task 71: Active-item query archive sweep
- **Status:** `[x]`
- **Files (planned):** `src/hooks/use-grid-data.ts`, `src/hooks/use-calendar-data.ts`, `src/hooks/use-search.ts` (update); `src/lib/utils/completion.ts`, `src/lib/utils/bfs.ts`, `src/lib/utils/urgency.ts` (update as needed)
- **Files (actual):** `src/lib/db/indexeddb.ts` (PRIMARY — 14 changes, 11 methods; the planned list omitted it), `src/hooks/use-calendar-data.ts`, `src/hooks/use-global-urgency.ts`, `src/hooks/use-node-urgency.ts`; new `src/lib/db/archive-sweep.test.ts` (13 cases). The codebase centralizes active-item queries in the `indexeddb.ts` DataStore layer, so the sweep lands there as one choke point rather than scattered across hooks/utils; `completion.ts`/`bfs.ts`/`urgency.ts`/`aging.ts` are pure functions over pre-filtered arrays and needed no edits. See `docs/issues/Issues_Phase_15.md` Batch C + skill-audit A15.
- **Dependencies:** Task 69
- **Actions:**
  - Add `archivedAt = null` alongside `deletedAt = null` to every active-item query per SCHEMA.md Key Queries: grid contents (+ L0 also excludes `hiddenFromGrid = true`), node completion, calendar items (+ non-archived parents for Chunks), items pool, badge computation, global urgency, text search, grid occupancy, aging.
  - Use the compound index `[parentId,deletedAt,archivedAt]` for grid contents.
- **Acceptance:**
  - Archiving an item removes it from grid, calendar, search, badge, and BFS occupancy; restoring brings it back.
  - L0 grid hides `hiddenFromGrid` system nodes (sidebar still shows them — Phase 17).
  - `pnpm build` passes.

### Task 72: Default system node seeding
- **Status:** `[x]`
- **Files (planned):** `src/lib/db/indexeddb.ts` (seed), `src/app/providers.tsx` or a startup hook (update)
- **Files (actual):** `src/lib/db/datastore.ts` (interface), `src/lib/db/indexeddb.ts` (implementation), `src/hooks/use-system-node-seeding.ts` (new hook), `src/app/providers.tsx` (wiring), `src/lib/db/system-nodes.test.ts` (new, 13 tests)
- **Dependencies:** Task 70
- **Actions:**
  - On first launch / migration: if no Node has `systemRole = 'inbox'`, create the Inbox Node (`title` "Inbox", `icon` "inbox", `color` `hsl(221, 83%, 53%)`, `parentId` null, `level` 0). Same for `'archive_view'` (Archive, "layers", `hsl(240, 4%, 46%)`). Use the internal full-`nodeSchema` path (not `createNodeSchema`). App-level uniqueness check before insert.
  - On every startup, re-check and offer to recreate a required system Node if it is missing.
- **Acceptance:**
  - A fresh DB seeds exactly one Inbox + one Archive View Node at L0.
  - Restarting does not duplicate system Nodes.
  - `pnpm build` passes.

#### Phase 15 Notes

> **Migration defaults are load-bearing:** Migration is additive/non-destructive, but defaults must be explicit (not relied on implicitly). Dexie silently stores `undefined` as absent from the index — rows without `archivedAt = null` backfill would be excluded from the new `[parentId+deletedAt+archivedAt]` compound index and treated as archived by `=== null` guards.

> **System Nodes use the full-schema path:** System Nodes are created via `nodeSchema.parse()` (not `createNodeSchema`), deliberately bypassing the create-path omit guard. See SCHEMA.md Default System Nodes + Hook 4 (trash) and Hook 10 (archive) exclusion guards.

> **Schema-field additions break pre-existing test factories silently under Vitest:** Vitest transpile-only mode passes even when factory functions are missing required fields; `tsc --noEmit` catches the real type errors. Run `pnpm typecheck` as part of every phase gate, not just `pnpm test`. Phase 15 required backfilling 19 test files.

> **Archive restore needs a parent guard (same invariant as trash restore):** `unarchiveNode` must check that a Bit's parent Node is itself restored before restoring the Bit — mirrors `restoreNode`'s parent guard in trash. This gap was not in the pre-written test invariants; it surfaced during the Codex implementation review.

> **DataStore is the correct active-item filter choke point:** The T71 archive sweep landed almost entirely in `indexeddb.ts`, not scattered across hooks/utils. Pure functions (`completion.ts`, `bfs.ts`, `urgency.ts`) operate on pre-filtered arrays and needed no changes. Future active-query changes should target the DataStore layer first.

> **Dexie migration has no automated runtime verification path:** `version(N).upgrade()` is unreachable by the in-memory FakeTable harness. Any plan task that cites a verification route must verify the route exists before the task is written. ISSUE-15-01 resolution: add a `fake-indexeddb`-based real-Dexie migration test in Phase 16.

> **Browser smoke on isolated context is the right T72 verification:** `chrome-devtools` `isolatedContext` option gives a fully fresh IndexedDB origin without touching user data. Confirmed: on first load, exactly Inbox + Archive appear on the L0 grid. Recommended pattern for data-layer tasks that produce visible startup behavior.

> **Full issue log:** `docs/issues/Issues_Phase_15.md`

---
