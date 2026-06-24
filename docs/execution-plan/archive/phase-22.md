## Phase 22: Batch 2 Inbox / Triage Visual & Interaction Polish

> **Purpose:** Align Inbox/Triage with the Batch 2 normalized recipe while preserving Phase 18/19 canonical behavior: grip-only Breakdown dragging, staging as UI state, placement confirmation, ArchiveScratchBar, and lifecycle rules.
> **Dependencies:** Phase 20 complete.
> **Canonical refs:** SPEC.md Inbox / Triage Workspace; DESIGN_TOKENS.md Inbox / Triage Batch 2 Surface Contract; `docs/recipes/inbox-triage-batch2-visual-recipe.md`
> **Policy:** Remove visible developer section labels from final UI. Internal component names, tests, `aria-label`s, and visually hidden labels may keep implementation names.

### Task 97: Scratch Pool identity, search, sort, collapsed switcher

- **Status:** `[x]`
- **Dependencies:** Phase 20 complete.
- **Files:** `src/components/triage/scratch-pool.tsx` (update), `src/stores/triage-store.ts` (update as needed), `src/components/triage/scratch-pool.test.tsx` (update)
- **Recipe:** `docs/recipes/inbox-triage-batch2-visual-recipe.md`
- **Actions:**
  - Redesign expanded Scratch Pool header so it shows inbox identity icon, exact count, and fold/unfold control without visible `Scratch Pool` heading text.
  - Add expanded-mode title search and icon-only asc/desc sort toggle. Search filters Scratch titles only; sort target is `createdAt`; default remains newest-first.
  - Redesign collapsed mode with compact inbox identity, count badge, fold/unfold control, and short vertical pill switching. Selected pill is longer/higher-contrast; inactive pills are shorter/muted; pills have accessible labels/tooltips.
  - Replace selection-immediate auto-collapse with a state model that can support first-Breakdown-keystroke collapse. Manual re-expand is respected for the current Scratch editing session and re-arms when the selected Scratch changes.
  - Preserve Scratch row details while redesigning the pool: each row keeps the restored `createdAt` relative-time label format and long titles ellipsize.
  - Tests cover search, sort, collapsed switcher, labels/tooltips, count display, and no search/sort controls in collapsed mode.
- **Acceptance:**
  - Expanded Scratch Pool has no visible `Scratch Pool` heading but clearly reads as Inbox/Scratch identity.
  - Searching `foo` shows only Scratch titles containing `foo`; clearing search restores the list.
  - Sort toggle switches newest-first / oldest-first without changing stored Scratch data.
  - Collapsed mode shows short vertical pills and allows switching active Scratch with accessible names.
  - Selecting a Scratch alone does not collapse the pool.
  - Scratch rows show restored relative-time labels (`2h ago`, `yesterday`, `2 days ago`, `6 days ago`, `m/dd/yy`) and long titles ellipsize without breaking row layout.
  - `pnpm test --run src/components/triage/scratch-pool.test.tsx` passes.
- **Commit:** `feat(phase-22): refine Scratch Pool identity and controls`

### Task 98: Breakdown selected context and first-keystroke collapse

- **Status:** `[x]`
- **Dependencies:** Task 97.
- **Files:** `src/components/triage/breakdown-panel.tsx` (update), `src/components/triage/scratch-pool.tsx` (update as needed), `src/stores/triage-store.ts` (update as needed), `src/components/triage/breakdown-panel.test.tsx` (update), `src/components/triage/scratch-pool.test.tsx` (update as needed)
- **Recipe:** `docs/recipes/inbox-triage-batch2-visual-recipe.md`
- **Actions:**
  - Add selected Scratch context at the top-left of the Breakdown section as a compact context strip with Scratch/Inbox-family icon, selected Scratch title, optional relative-time/meta, and truncation for long titles.
  - Ensure the context strip is visually distinct from Breakdown rows and never looks draggable or row-like.
  - Wire first-keystroke collapse: Scratch selection and Breakdown focus/click alone do not collapse the pool; the first typed character in the Breakdown input while a Scratch is selected collapses the pool.
  - Preserve Enter submission behavior and adopt `ISSUE-18-18`: after submitting a Breakdown row with Enter, focus remains in the add-note input for rapid entry; global commands such as `Cmd+K` still move focus to the command menu.
  - Improve Breakdown drag grip visibility and hit target while keeping the grip as the only drag activator.
  - Style `ArchiveScratchBar` as an intentional completion affordance when all Breakdown rows are consumed.
- **Acceptance:**
  - With a Scratch selected, the Breakdown section shows a top-left context strip that is visually separate from rows below it.
  - Clicking into Breakdown does not collapse Scratch Pool; typing the first character does.
  - Manually re-expanded Scratch Pool does not auto-collapse again until the selected Scratch changes.
  - Pressing Enter after typing a Breakdown row submits the row and leaves focus in the add-note input.
  - Dragging still starts only from the grip, not the full row.
  - `pnpm test --run src/components/triage/breakdown-panel.test.tsx src/components/triage/scratch-pool.test.tsx` passes.
- **Commit:** `feat(phase-22): add Breakdown context and keystroke collapse`

### Task 99: Staging and triage DnD visual states

- **Status:** `[x]`
- **Dependencies:** Task 97.
- **Files:** `src/components/triage/staging-zone.tsx` (update), `src/components/triage/triage-workspace.tsx` (update), `src/components/triage/triage-drag-token.tsx` (update as needed), `src/components/triage/staging-zone.test.tsx` (update), `src/hooks/use-triage-dnd.test.ts` (update as needed)
- **Recipe:** `docs/recipes/inbox-triage-batch2-visual-recipe.md`
- **Actions:**
  - Remove visible `Staging: Nodes` and `Staging: Bits` labels from final UI while preserving separate Node and Bit staging zones.
  - Keep Node candidates as icon-centered objects and Bit candidates as text-centered rows/cards; do not rely on color alone for distinction.
  - Replace invalid staging/hierarchy drop red styling with muted/unavailable visual language for non-destructive invalid targets.
  - Align `Remove from staging` drop target with the Batch 2 visual language if touched: non-destructive copy, no toast, no destructive-red treatment unless the target is truly destructive.
  - Preserve existing `Remove from staging` target behavior only. Do not implement deferred `ISSUE-18-16` drop-back-to-Breakdown removal in this task.
  - Preserve placement confirmation and staging UI-state-only behavior.
- **Acceptance:**
  - No visible `Staging: Nodes` or `Staging: Bits` headings appear in the final Inbox UI.
  - Node staging remains an icon-centered object grid; Bit staging remains a text row/list.
  - Invalid non-destructive drops read as unavailable/muted, not destructive.
  - Dropping staged candidates on `Remove from staging` removes only the staged candidate and leaves the source Breakdown row active; this is existing target behavior, not the deferred `ISSUE-18-16` drop-back-to-Breakdown interaction.
  - `pnpm test --run src/components/triage/staging-zone.test.tsx src/hooks/use-triage-dnd.test.ts` passes.
- **Commit:** `feat(phase-22): polish staging and triage DnD states`

### Task 100: Hierarchy search, label removal, and workspace integration

- **Status:** `[x]`
- **Dependencies:** Tasks 97, 98, and 99.
- **Files:** `src/components/triage/hierarchy-explorer.tsx` (update), `src/components/triage/triage-workspace.tsx` (update), `src/components/triage/triage-workspace.test.tsx` (update), `src/components/triage/hierarchy-explorer.test.tsx` (create if needed)
- **Recipe:** `docs/recipes/inbox-triage-batch2-visual-recipe.md`
- **Actions:**
  - Remove visible `Hierarchy Explorer`, `Breakdown / Scribble`, and other developer section headings from final UI while preserving useful `aria-label`s or visually hidden labels.
  - Remove the unnecessary visual gap between the hierarchy shell and Home/L1/L2/L3 columns.
  - Add hierarchy search at the top of the hierarchy area. Search filters only the active hierarchy section: Home/Grid0 when no deeper level is open; otherwise the deepest opened level.
  - Persist search query when the active hierarchy section changes.
  - Add a persistent filter indicator with active query, scoped section, result count, and clear affordance. Flash/highlight is secondary on active-section change with a non-empty query and must respect reduced-motion preferences.
  - Preserve existing hierarchy DnD targets, placement confirmation, Nodes-before-Bits order, and Level 0 system-node exclusion.
- **Acceptance:**
  - Final Inbox UI has no visible `Scratch Pool`, `Breakdown / Scribble`, `Staging: Nodes`, `Staging: Bits`, or `Hierarchy Explorer` headings.
  - Searching while only Home is open filters Home/Grid0 Nodes/Bits only.
  - Searching while Level 2 is active filters Level 2 Nodes/Bits only.
  - When the active section changes with a non-empty query, a persistent filter indicator remains visible and the query can be cleared.
  - Existing hierarchy drop targets and placement confirmation behavior still work.
  - `pnpm test --run src/components/triage/triage-workspace.test.tsx src/components/triage/hierarchy-explorer.test.tsx` passes.
- **Commit:** `feat(phase-22): add scoped hierarchy search and remove visible labels`

#### Phase 22 Notes

> **Scope boundary at file-ownership edge:** T99's action item said "replace invalid staging/hierarchy drop red styling" but `hierarchy-explorer.tsx` is T100-owned. T99 was scoped to staging-zone and triage-workspace only; hierarchy invalid styling was left for T100. When a task's stated action overlaps another task's file boundary, honor the file-ownership boundary — do not cross it even when the action wording implies otherwise.

> **Parallel test-author single-writer rule:** In T100, Codex A (implementer) created `hierarchy-explorer.test.tsx` in addition to its implementation targets, violating the single-writer rule. Codex B's independently-authored test file took precedence (last writer wins). To prevent this: implementer must not create test files in the test author's scope; if both write to the same file, designate a tie-breaker role before launching.

> **ISSUE-22-D03 — no visible scope text in filter pills:** Hierarchy search filter pills must NOT show visible scope labels (Home / L1 / L2 / L3). Scope is communicated through active-column visual emphasis and de-emphasis of inactive columns. Accessibility and test contracts use `aria-label` + `sr-only` text. This is the design standard for all future scoped-search filter indicators.

> **grid-runtime.test.tsx mock contract:** When new hooks are added to the component render tree, their datastore method dependencies must be added to the shared `beforeEach` mock. Missing methods cause unhandled rejections at teardown even when all test assertions pass — these rejections fail the test suite with exit code 1 but do not appear as named test failures.

> **`title` + `aria-label` over Radix Tooltip in tests:** For icon-only controls in components where tests run in jsdom, `title` + `aria-label` is the correct tooltip pattern. Radix `<Tooltip>` renders into a portal that is hard to query in jsdom and adds DOM complexity that breaks assertion counts. Upgrading to Radix Tooltip in a later polish pass is straightforward.

> **Full issue log:** `docs/issues/Issues_Phase_22.md`
