## Phase 18: Inbox / Triage — Staging & Placement DnD (compact-token, partial Grid DnD)

> **Purpose:** The conversion + placement flow — Node/Bit Staging, compact-token DnD, pending-confirmation placement into the Hierarchy Explorer, the fast path, remove-from-staging, and Archive Scratch. Per SPEC.md (AD #16, Inbox/Triage Workspace).
> **Branch:** `phase-18/inbox-triage-dnd`
> **Canonical refs:** SPEC.md (AD #16, Hierarchy Explorer / Staging / Remove from staging / Archive Scratch); SCHEMA.md (`scratchBreakdowns.consumedAt`, Hook 10); DESIGN_TOKENS.md § Compact Drag Token
> **Explicit policies:**
> - **Grid DnD is PARTIAL only:** implemented Inbox/Triage compact-token DnD; main-grid / calendar / pool DnD untouched.
> - Staging is UI state only; real Node/Bit records are created only on confirmed placement.
> - Reused: `grid-runtime.tsx` move-confirmation `Dialog`, `sidebar.tsx` `DeleteDropTarget`, `grid-dnd.ts` `grid-delete-drop`, `use-dnd.ts`.

### Task 81: Node/Bit Staging zones
- **Status:** `[x]`
- **Files:** `src/components/triage/staging-zone.tsx` (created), `src/stores/triage-store.ts` (updated — staged candidates, UI only)
- **Dependencies:** Phase 17 complete
- **Actions:**
  - Two zones: **Node Zone** (two-column grid of compact, icon-centered candidates) + **Bit Zone** (vertical list of text rows). Shape distinction enforced. Candidates keyed by `scratchId` in `triage-store`; switching Scratch preserves other scratches' candidates.
- **Acceptance:** Met — staging zones render correctly; `triage-store` keys by `scratchId`; de-emphasis styling applied to staged source rows.

### Task 82: Compact-token DnD (Inbox/Triage, partial)
- **Status:** `[x]`
- **Files:** `src/hooks/use-dnd.ts` (updated — Triage drag kinds), `src/lib/grid-dnd.ts` (updated — token/targeting helpers), `src/components/triage/*` (drag wiring)
- **Dependencies:** Task 81
- **Actions:**
  - Compact drag token for breakdown rows, staged Nodes, and staged Bits. Pointer-centered targeting. Drop-target states: valid / invalid / pending-confirmation. Grid/calendar/pool DnD untouched.
- **Acceptance:** Met — compact token renders during drag; drop targets distinguish states; existing DnD unchanged.

### Task 83: Hierarchy Explorer + placement confirmation
- **Status:** `[x]`
- **Files:** `src/components/triage/hierarchy-explorer.tsx` (created); `src/hooks/use-dnd.ts` (updated `useTriageDnd`); `src/lib/grid-dnd.ts` (hierarchy drop kinds added); `src/components/triage/triage-workspace.tsx` (DndContext extended + dialog added); `src/lib/db/scratch-breakdowns.test.ts` (unit test added)
- **Dependencies:** Task 82
- **Actions:**
  - Home / L1 / L2 / L3 columns with progressive reveal. Pending-confirmation placement dialog. Confirm calls `createNode`/`createBit` and `markScratchBreakdownConsumed`. Cancel leaves no record.
- **Acceptance:** Met — placement dialog shows all four fields; confirm creates item and sets `consumedAt`; cancel creates nothing; full-grid disables confirm.

### Task 84: Fast path (Breakdown row → Hierarchy)
- **Status:** `[x]`
- **Files:** `src/components/triage/breakdown-panel.tsx` + `hierarchy-explorer.tsx` (updated), `src/hooks/use-dnd.ts` (updated)
- **Dependencies:** Task 83
- **Actions:**
  - Breakdown row dragged directly onto Hierarchy Explorer opens confirmation dialog with explicit Node/Bit type choice. Confirm creates chosen type and marks source row `consumedAt`.
- **Acceptance:** Met — type choice required; confirm creates item and consumes row.

### Task 85: Remove-from-staging + Archive Scratch affordance
- **Status:** `[x]`
- **Files:** `src/components/triage/*` (updated); `src/hooks/use-archive-scratch.ts` (created); DataStore `archiveBit` (Hook 10)
- **Dependencies:** Task 83
- **Actions:**
  - Remove-from-staging drop target (non-destructive; source row returns to active; `consumedAt` stays null). Archive Scratch affordance when all rows consumed and no staged candidates remain; requires confirmation; calls `archiveBit`.
- **Acceptance:** Met — remove-from-staging restores row non-destructively; Archive Scratch affordance appears and archives on confirm.

#### Phase 18 Notes

> **Partial DnD scope:** This is a partial implementation of the `2026-06-02-grid-dnd-preview-and-drop-targeting` idea, scoped to Inbox/Triage only. When that idea is later promoted in full, reconcile this behavior with main-grid / calendar / pool DnD.

> **Staging is UI-state-only:** `triage-store` holds staged candidates; real Node/Bit records are created only on confirmed placement, and `scratchBreakdowns.consumedAt` is set at that moment (per SCHEMA.md).

> **DnD overlay pointer alignment:** `DragOverlay` anchors to the draggable element's top-left origin by default. For full-surface-draggable items (staged Node cards, Bit rows), this detaches the token from the cursor. Fix: add a `snapDragTokenToCursor` modifier using `activatorEvent` + `overlayNodeRect` to center the token on the pointer at drag start (ISSUE-18-10).

> **Consumed-state is a render-layer concern:** The DataStore write (`markScratchBreakdownConsumed`) and hook logic were correct from T83/T84. The consumed visual (line-through) was missing only in the `BreakdownRow` render branch — `row.consumedAt` was never read in the view. Always wire `consumedAt` in the render layer when the data model specifies it (ISSUE-18-11, ISSUE-18-12).

> **Archive affordance placement:** An affordance that replaces an input (rather than appearing alongside it) blocks continued interaction when the condition remains true. Render the affordance as a conditional sibling above the input, not as a ternary that swaps the input out (ISSUE-18-23).

> **Hierarchy model: section-first, not row-first:** The Hierarchy Explorer mental model is that each section body represents a grid context. The synthetic Home row shifted the entire section mapping by one level. Remove synthetic rows; make section-body drop the primary placement path; row drops are shortcuts (ISSUE-18-14, ISSUE-18-15).

> **Architecture conformance — hook/store boundary:** Hooks must not import Zustand stores at runtime. When a hook needs to mutate UI state (staged candidates), inject the store actions as parameters from the calling component. The component reads from `useTriageStore`; the hook receives plain functions (ISSUE-18-24).

> **Architecture conformance — component/DataStore boundary:** Components must not call `getDataStore()` directly. Extract DataStore writes into a dedicated hook (e.g., `useArchiveScratch`) that the component calls. This keeps the DataStore behind the hook boundary (ISSUE-18-25).

> **`vi.fn()` mock return type:** A bare `vi.fn()` has return type `never`. Any helper that derives types via `ReturnType<typeof mockFn>` or `Partial<ReturnType<typeof mockFn>>` will produce `never`, breaking spread and `Partial` usage. Import and use the actual hook types directly in test helpers (triage-workspace.test.tsx typecheck fix).

> **Full issue log:** `docs/issues/Issues_Phase_18.md`
