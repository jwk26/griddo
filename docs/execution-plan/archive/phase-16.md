## Phase 16: Quick Capture — `+` Entry Surface & Command Palette

> **Purpose:** The fast capture path that feeds Scratch into the Inbox, plus the Cmd+K Command Palette. Per SPEC.md (Quick Capture `+` Entry Surface, Command Palette) and the two visual recipes.
> **Branch:** `phase-16/quick-capture`
> **Canonical refs:** SPEC.md (Quick Capture `+` Entry Surface, Command Palette, Routes note); DESIGN_TOKENS.md § Surface Recipes
> **Explicit policies:**
> - Create-modal redesign is OUT of scope: Node/Bit creation opens the EXISTING `create-node-dialog.tsx` / `create-bit-dialog.tsx`.
> - Command Palette key `2` opens the EXISTING Search overlay unchanged (no Search redesign).
> - New component domain `src/components/quick-capture/` (follows SPEC File Organization "shared components by domain").

### Task 73: `+` entry surface (anchored popover)
- **Status:** `[x]`
- **Files:** `src/components/quick-capture/entry-surface.tsx` (create), `src/components/layout/sidebar.tsx` (update — conditional: grid routes open entry surface; calendar/trash keep existing behavior), `src/stores/quick-capture-store.ts` (create — open state), `src/components/layout/add-flow-context.tsx` (update if needed)
- **Recipe:** `docs/recipes/quick-capture-entry-surface-visual-recipe.md`
- **Dependencies:** Phase 15 complete
- **Actions:**
  - Anchored slide/fade popover from the sidebar `+` (left-anchored per recipe; not a centered modal). Two groups: **Ideas** (Scratch, primary, primary-tinted icon tile) and **Create** (Node, Bit). Optional surface-level `Cmd+K` hint; **no per-row ⌘K badge** on the Scratch row (per DECISION/recipe).
  - Context rules (SPEC): L0/global `Bit` opens a parent selector (no direct L0 Bit); inside a Node, `Bit` uses the current Node; Level 3 is Bit-only.
  - **Route scope (G4 decision):** Entry surface activates on `/` and `/grid/[nodeId]` only. On `/calendar/*`, the existing `+` chooser/create wiring stays unchanged. On `/trash`, the `+` remains disabled.
  - Use exact classes from the recipe; Batch 1 baseline tokens only.
- **Acceptance:**
  - On `/` and `/grid/[nodeId]`: clicking the sidebar `+` opens the anchored popover with Ideas/Create groups; Scratch is visually primary; the Scratch row has no ⌘K badge.
  - On `/calendar/*`: existing Calendar `+` create wiring is unchanged.
  - On `/trash`: `+` remains disabled (no regression).
  - Esc / outside click closes the popover.
  - At Level 3, the Create group shows only the Bit row (Node row hidden).
  - `pnpm build` passes.

### Task 74: Scratch capture modal
- **Status:** `[x]`
- **Files:** `src/components/quick-capture/scratch-modal.tsx` (create), `src/hooks/use-inbox.ts` (create), reuse DataStore `createBit`
- **Recipe:** `docs/recipes/quick-capture-entry-surface-visual-recipe.md` (Scratch Modal)
- **Dependencies:** Task 73, Phase 15
- **Actions:**
  - Clicking Scratch (or palette key `1`) opens a centered one-line modal ("Capture your ideas..."). On submit, create a Bit with `parentId` = Inbox Node id, `icon` "sparkles", `x = 0, y = 0` sentinel (uniqueness-exempt per Hook 8), `title` = input. Show a lightweight confirmation + a path to open the Inbox.
- **Acceptance:**
  - Submitting creates a Scratch Bit parented to the Inbox Node with `sparkles`/`(0,0)`, regardless of the current grid location; no parent/cell selection is required. Verify by navigating to the Inbox Node page and confirming the Bit appears (browser DevTools > Application > IndexedDB > griddo > bits is an acceptable alternative).
  - `pnpm build` passes.

### Task 75: Command Palette (Cmd+K)
- **Status:** `[x]`
- **Files:** `src/components/quick-capture/command-palette.tsx` (create), `src/stores/quick-capture-store.ts` (update — palette open state), global key handler in `src/app/providers.tsx` or `grid-runtime.tsx`
- **Recipe:** `docs/recipes/command-palette-visual-recipe.md`
- **Dependencies:** Task 74
- **Actions:**
  - `Cmd+K` opens the palette (top-anchored `max-w-xl` overlay, blur backdrop, prompt input row, command rows with primary-fill highlight, per recipe). **Command set is fixed:** key `1` = Scratch capture (opens the Scratch modal), key `2` = open the EXISTING Search overlay (reuse `search-store` / `search-overlay.tsx`; no redesign). The prompt input is visual-shell only — not an app-wide search/filter.
- **Acceptance:**
  - `Cmd+K` opens the palette; `1` triggers Scratch capture; `2` opens the existing Search overlay unchanged.
  - `pnpm build` passes.

### Task 76: Create Node/Bit from `+` surface (existing dialogs)
- **Status:** `[x]`
- **Files:** `src/components/quick-capture/entry-surface.tsx` (update — wire Create rows); reuse `src/components/grid/create-node-dialog.tsx`, `src/components/grid/create-bit-dialog.tsx`
- **Dependencies:** Task 73
- **Actions:**
  - The Node/Bit rows open the EXISTING create dialogs (NOT the prototype's redesigned modals). Apply the context rules (L0 `Bit` → parent selector first).
- **Acceptance:**
  - From the `+` surface, Node opens the existing `create-node-dialog`; Bit opens the existing `create-bit-dialog` (with a parent selector at L0). No new/redesigned create modal is introduced.
  - `pnpm build` passes.

#### Phase 16 Notes

> Visual realization is governed entirely by the two recipe files; Batch 1 uses existing GridDO baseline tokens (theme variants are Batch 2).
> Create-modal redesign and Search redesign are explicitly out of scope.

> **Global mount pattern:** Components that must be accessible from any route (e.g., CommandPalette, ScratchModal via key `1`) belong in `providers.tsx` via a wrapper component (`QuickCaptureOverlays`), not inside a route-specific runtime component (`GridRuntime`). Moving a component from route-scope to global scope requires a dedicated wrapper — don't inline directly in Providers.

> **Dual-store mutual exclusion:** When two independent Zustand stores manage overlapping overlay visibility (`quick-capture-store` + `search-store`), `closeAll()` from one store does not close the other. Explicit cross-store close calls are required — e.g., `useSearchStore.getState().close()` inside the palette open handler. Always identify store boundaries before implementing "close everything" logic.

> **Global keydown handler ownership transfer:** When a new global handler supersedes an existing one (CommandPalette taking Cmd+K from SearchOverlay), remove the old handler from its original file in the same batch. Double-handler presence causes race conditions and incorrect event priority.

> **GridDO IndexedDB schema version 3 upgrade test (ISSUE-15-01):** The `version(3).upgrade()` backfill path is unreachable by the `FakeTable` in-memory harness (which is a plain Map, not an IDB engine). Runtime verification requires `fake-indexeddb` with per-test `IDBFactory` injection via `DexieOptions`. Seed rows must physically omit the new fields (don't use factory helpers that pre-fill them). Pass one shared `options` object to both the v2 seeder and the production `GridDODatabase` — both must operate against the same backing store for the 2→3 transition to fire.

> **Full issue log:** `docs/issues/Issues_Phase_16.md`
