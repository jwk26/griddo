## Phase 17: Inbox / Triage Workspace — Routing, Layout, Scratch & Breakdown

> **Purpose:** Render the Triage workspace for the Inbox system Node, with the four-area layout, Scratch Pool, and Breakdown/Scribble. Per SPEC.md (System Node Routing, Inbox/Triage Workspace).
> **Branch:** `phase-17/inbox-triage-shell`
> **Canonical refs:** SPEC.md (System Node Routing, Inbox/Triage Workspace); SCHEMA.md (`scratchBreakdowns`, Scratch Bits); DESIGN_TOKENS.md § Inbox Badge
> **Explicit policies:**
> - System Node surfaces use `/grid/[nodeId]` (no new routes); `GridRuntime` dispatches on `systemRole`.
> - Phase 17 uses existing GridDO baseline UI/tokens; theme variants remained out of scope.
> - New component domain `src/components/triage/`.

### Task 77: System Node routing + Inbox badge
- **Status:** `[x]`
- **Files:** `src/components/layout/grid-runtime.tsx` (update — dispatch on `systemRole`), `src/components/layout/sidebar.tsx` (update — always show system nodes + badge), `src/hooks/use-inbox.ts` (update — Scratch count), `src/lib/constants.ts` (update — badge thresholds)
- **Dependencies:** Phase 15 complete
- **Actions:**
  - `GridRuntime`: when the current Node's `systemRole === 'inbox'`, render `<TriageWorkspace/>`; otherwise (including `'archive_view'` for now) render the standard grid. (The `'archive_view'` branch is added in Phase 19 once `<ArchiveView/>` exists — no forward import here.)
  - Sidebar: always list system Nodes (query `systemRole !== null`) regardless of `hiddenFromGrid`. "Remove from grid" sets `hiddenFromGrid = true` (not trash); "Show on grid" reverses it (BFS if the cell is occupied).
  - Inbox badge: active Scratch count (`parentId` = Inbox, `deletedAt = null` AND `archivedAt = null`). Tiers (DESIGN_TOKENS Inbox Badge): 0 hidden / 1–7 `bg-muted text-muted-foreground` / 8–14 `bg-priority-mid-bg text-priority-mid` / 15+ `bg-destructive text-destructive-foreground`. Thresholds in `constants.ts`.
- **Acceptance:**
  - Opening the Inbox Node renders the Triage workspace (not a normal grid).
  - System Nodes always appear in the sidebar even when hidden from the grid; "remove from grid" hides without trashing.
  - The Inbox badge shows the correct count and color tier as Scratch count crosses 8 and 15.
  - `pnpm build` passes.

### Task 78: Triage layout shell (four areas)
- **Status:** `[x]`
- **Files:** `src/components/triage/triage-workspace.tsx` (create)
- **Dependencies:** Task 77
- **Actions:**
  - Layout per SPEC: left **Scratch Pool** (full height); right **Main Work Area** split Top 60% / Bottom 40%; the top split into **Breakdown** 60% / **Staging** 40%; Staging internally Node Zone 35% / Bit Zone 65%. Baseline tokens.
- **Acceptance:**
  - The Triage workspace shows the four areas in the specified ratios and lays out sanely at ≥ 1024px.
  - `pnpm build` passes.

### Task 79: Scratch Pool
- **Status:** `[x]`
- **Files:** `src/components/triage/scratch-pool.tsx` (create), `src/hooks/use-inbox.ts` (update — active Scratch list), `src/stores/triage-store.ts` (create — selected Scratch)
- **Dependencies:** Task 78
- **Actions:**
  - List active Scratch Bits (`parentId` = Inbox, `deletedAt = null`, `archivedAt = null`) ordered by `createdAt`. Each row: title + `createdAt` display (`2h ago` / `yesterday` / `2 days ago` / `6 days ago` / `m/dd/yy`); long titles ellipsize. Expanded vs collapsed states; auto-collapse after a Scratch is selected; manual open/close. Do not force the selected title into the collapsed rail.
- **Acceptance:**
  - The Scratch Pool lists captured Scratch newest-first by `createdAt` with relative-time labels.
  - Selecting a Scratch records it in `triage-store` and auto-collapses the pool.
  - `pnpm build` passes.

### Task 80: Breakdown / Scribble
- **Status:** `[x]`
- **Files:** `src/components/triage/breakdown-panel.tsx` (create), `src/hooks/use-scratch-breakdowns.ts` (create), `src/lib/db/datastore.ts` (update — add `deleteScratchBreakdown(id: string): Promise<void>`), `src/lib/db/indexeddb.ts` (update — implement single-row delete), `src/lib/db/scratch-breakdowns.test.ts` (create or update — unit test for single-row delete); DataStore scratchBreakdowns CRUD (Phase 15)
- **Dependencies:** Task 79
- **Actions:**
  - The selected Scratch is the context. An always-active input row appends a `scratchBreakdowns` row (`content`, `order`, `createdAt`). Each row shows content + `createdAt` + an always-visible delete affordance (delete asks confirmation). Numbering optional. Rows are draggable (drag wiring lands in Phase 18).
- **Acceptance:**
  - Typing + submit adds a breakdown row persisted to `scratchBreakdowns`; rows show `createdAt`; delete asks for confirmation.
  - Switching the selected Scratch swaps the breakdown list (scoped by `scratchBitId`).
  - `pnpm build` passes.

#### Phase 17 Notes

> The Triage structure is treated as stable. Phase 17 used baseline tokens only; theme variants remained out of scope.
> The Inbox badge "warm" tier reuses the amber `--priority-mid` pair (DESIGN_TOKENS Inbox Badge) — semantic reuse, no hard-coded HSL.

> **IC-5 (T80):** `deleteScratchBreakdown(id)` was absent from DataStore at plan time — the flow review (phase-17-flow-review.md) caught it. The T80 Files list was amended before implementation (`ad12abd`). Always verify single-row vs bulk-delete semantics when the plan references CRUD operations that were added in an earlier phase.

> **Controlled AlertDialog stale-state:** A controlled `AlertDialog open={bool}` without `onOpenChange` blocks all Radix close paths (Escape, outside-click) except the explicit Cancel button. Add `onOpenChange={(open) => { if (!open) clearState(); }}` whenever using a controlled dialog. Additionally, clear confirmation state in a `useEffect` keyed to the scope identifier (e.g. `selectedScratchId`) so a pending confirmation from a previous scope cannot execute after switching context.

> **Prompt prompt-fence discipline (A12/C12):** Code fences opened in provider prompts must be explicitly closed. Unbalanced fences corrupt the provider's parsing of code vs prose. Run a fence-balance count before showing any prompt for approval. This issue recurred twice in Phase 17 (A12 original + A12r in Batch 3).

> **`order` field after deletion:** Using `array.length` as the next `order` value produces duplicates after any middle-row delete. Use `Math.max(...rows.map(r => r.order)) + 1` (with a zero guard for empty arrays). Apply this pattern for any append-ordered list that supports deletion.

> **A9/C9 — follow-up fixes route through Codex:** Post-checkpoint source/test fixes (however small) must be drafted as scoped Codex prompts and shown for approval — not edited directly by Claude. Exception: explicit user approval ("fix it directly"). This was enforced correctly in T80 follow-up (CI-4).

> **Full issue log:** `docs/issues/Issues_Phase_17.md`
