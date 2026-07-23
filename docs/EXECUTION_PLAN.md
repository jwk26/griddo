# EXECUTION PLAN — GridDO

Execution plan mode: scaled

> **Guideline:** Check this file first to see the current task before looking into other docs.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete

---

## Phase Index

| Phase | Status | Title | Archive |
|-------|--------|-------|---------|
| 1 | ✅ done | Foundation | [archive](execution-plan/archive/phase-01.md) |
| 2 | ✅ done | Core Logic | [archive](execution-plan/archive/phase-02.md) |
| 3 | ✅ done | Layout Shell + Level 0 Grid | [archive](execution-plan/archive/phase-03.md) |
| 4 | ✅ done | Grid Navigation + Bit Cards | [archive](execution-plan/archive/phase-04.md) |
| 4.5 | ✅ done | Design Alignment | [archive](execution-plan/archive/phase-04-5.md) |
| 5 | ✅ done | Bit Detail + Application Hooks | [archive](execution-plan/archive/phase-05.md) |
| 5.5 | ✅ done | DataStore Facade Cleanup | [archive](execution-plan/archive/phase-05-5.md) |
| 6 | ✅ done | Calendar Views | [archive](execution-plan/archive/phase-06.md) |
| 6.5 | ✅ done | DataStore Facade Migration | [archive](execution-plan/archive/phase-06-5.md) |
| 7 | ✅ done | Trash, Search + Polish | [archive](execution-plan/archive/phase-07.md) |
| 8 | ✅ done | Bit Detail Surface Refinement (Pilot) | [archive](execution-plan/archive/phase-08.md) |
| 9 | ✅ done | Grid UX Improvements | [archive](execution-plan/archive/phase-09.md) |
| 10 | ✅ done | Breadcrumb + Deadline UX | [archive](execution-plan/archive/phase-10.md) |
| 11 | ✅ done | Calendar Shell | [archive](execution-plan/archive/phase-11.md) |
| 12 | ✅ done | Calendar Creation Flows | [archive](execution-plan/archive/phase-12.md) |
| 13 | ✅ done | Weekly Redesign | [archive](execution-plan/archive/phase-13.md) |
| 14 | ✅ done | Monthly Redesign | [archive](execution-plan/archive/phase-14.md) |
| 15 | ✅ done | Lifecycle Schema Foundation | [archive](execution-plan/archive/phase-15.md) |
| 16 | ✅ done | Quick Capture — `+` Entry Surface & Command Palette | [archive](execution-plan/archive/phase-16.md) |
| 17 | ✅ done | Inbox / Triage Workspace — Routing, Layout, Scratch & Breakdown | [archive](execution-plan/archive/phase-17.md) |
| 18 | ✅ done | Inbox / Triage — Staging & Placement DnD (compact-token, partial Grid DnD) | [archive](execution-plan/archive/phase-18.md) |
| 19 | ✅ done | Archive View & Direct Archive | [archive](execution-plan/archive/phase-19.md) |
| 20 | ✅ done | Batch 2 Theme System & Themed Grid | [archive](execution-plan/archive/phase-20.md) |
| 21 | ✅ done | Batch 2 Calendar Visual Alignment | [archive](execution-plan/archive/phase-21.md) |
| 22 | ✅ done | Batch 2 Inbox / Triage Visual & Interaction Polish | [archive](execution-plan/archive/phase-22.md) |
| 23 | active | Inbox / Triage Persistence & Atomic Command Foundation | — |
| 24 | active | Inbox / Triage Shell, Scratch Pool & Selected Context | — |
| 25 | active | Breakdown Lifecycle & Mutation Reliability | — |
| 26 | active | Durable Staging & Candidate DnD | — |
| 27 | active | Whole-Hierarchy Grid Explorer Search | — |
| 28 | active | Staged & Direct Placement Flows | — |
| 29 | active | Newly Placed Projection & Source-Aware Undo | — |
| 30 | active | Breakdown Completion & Archive | — |
| 31 | active | Eight-Theme Realization — Shell Through Staging | — |
| 32 | active | Eight-Theme Realization — Grid Through Archive | — |
| 33 | active | Inbox / Triage Promotion Verification | — |

### Inbox / Triage Promotion Baseline

Phases 15, 17, 18, and 22 remain frozen historical records. They supplied lifecycle, workspace,
DnD, and Batch 2 baselines, but their archived assumptions are not current implementation
instructions where they conflict with SCHEMA.md, SPEC.md, DESIGN_TOKENS.md, or Phases 23–33.
In particular, the active plan supersedes UI-only Staging, hidden section labels, compact Selected
Scratch Context, active-column Grid search, consumed-row line-through, and global archive-dialog
behavior. Archive files are not rewritten.

## Next Numbers

Next phase: 34 · Next task: 155

---

## Phase 23: Inbox / Triage Persistence & Atomic Command Foundation

> **Purpose:** Establish the schema revisions, durable candidate store, optimistic-concurrency primitives, and authoritative command result contract required by every later Inbox/Triage phase.
> **Dependencies:** Phase 15 complete; approved Inbox/Triage promotion amendments in SCHEMA.md and SPEC.md.
> **Canonical refs:** SCHEMA.md §§ Bits, ScratchBreakdowns, TriageStagedCandidates, Mutation Contracts; SPEC.md Architecture Decisions 19–20 and Key File Paths.
> **Historical boundary:** Phase 15 remains the lifecycle baseline. This phase adds revision and Triage transaction contracts without adding `version` to Nodes.

### Task 101: Dexie v4 revision and durable candidate migration

- **Status:** `[ ]`
- **Dependencies:** Phase 15 complete.
- **Files:** `src/lib/db/schema.ts` (update domain/Zod schemas), `src/lib/db/schema.test.ts` (update), `src/lib/db/indexeddb.ts` (add Dexie v4 store/index migration), `src/lib/db/indexeddb.migration.test.ts` (update), `src/lib/db/indexeddb.schema-v4-upgrade.test.ts` (create)
- **Actions:**
  - `src/lib/db/schema.ts`: add system-managed monotonic `version` to Bit and ScratchBreakdown records; add `TriageStagedCandidate` and its create/input schemas with stable IDs, source linkage, type, lifecycle, timestamps, and revision.
  - `src/lib/db/indexeddb.ts`: add Dexie v4 with `triageStagedCandidates` primary/query indexes and source-uniqueness enforcement; backfill missing Bit and Breakdown versions to `1` while preserving all existing records and indexes.
  - Tests: open a real v3 database fixture through v4, prove backfill and data preservation, and reject duplicate active candidates for one source row.
- **Acceptance:**
  - A v3 database containing Nodes, Bits, and Breakdown rows upgrades without data loss; every existing Bit and Breakdown has `version = 1` afterward.
  - Fresh Bit, Breakdown, and candidate records start at `version = 1`; user-facing create/update inputs cannot set revision fields.
  - Nodes have no new `version` field.
  - `pnpm test --run src/lib/db/schema.test.ts src/lib/db/indexeddb.migration.test.ts src/lib/db/indexeddb.schema-v4-upgrade.test.ts` passes.
- **Commit:** `feat(phase-23): add triage revision and candidate schema`

### Task 102: Shared command, result, and reconciliation types

- **Status:** `[ ]`
- **Dependencies:** Task 101.
- **Files:** `src/types/triage.ts` (create), `src/types/index.ts` (export), `src/lib/db/datastore.ts` (add shared command/result contracts), `src/lib/db/schema.test.ts` (update type/schema boundary tests as needed)
- **Actions:**
  - `src/types/triage.ts`: define stable operation metadata, captured revision/lifecycle predicates, preallocated result IDs, authoritative command result variants (`applied`, `already_applied`, `conflict`, `invalid`, `not_found`), and reconciliation payloads.
  - `src/lib/db/datastore.ts`: export the shared command/result types used by repository methods without leaking Dexie types. Add each concrete command method only together with its IndexedDB implementation in the owning later task, so this task remains buildable.
  - Keep presentation-only drafts, pending intents, interrupted search, and Newly Placed metadata out of persistent domain schemas.
- **Acceptance:**
  - Every command result requires a stable operation ID and enough authoritative records/versions to reconcile an unknown outcome.
  - Components can consume command types without importing Dexie or IndexedDB implementation details.
  - Type checking rejects UI-owned Newly Placed or draft fields on persisted Node, Bit, Breakdown, or candidate records.
  - `pnpm build` passes.
- **Commit:** `feat(phase-23): define triage command result contracts`

### Task 103: Conditional Scratch and Breakdown repository mutations

- **Status:** `[ ]`
- **Dependencies:** Tasks 101 and 102.
- **Files:** `src/lib/db/datastore.ts` (add conditional APIs), `src/lib/db/indexeddb.ts` (implement one-transaction compare-and-set), `src/lib/db/scratch-breakdowns.test.ts` (extend), `src/lib/db/triage-commands.test.ts` (create)
- **Actions:**
  - `src/lib/db/indexeddb.ts`: implement idempotent Scratch-title and Breakdown Add/Edit/Delete commands that re-read ID, version, lifecycle, candidate relation, and stable operation/result ID in one read-write transaction.
  - Increment the successfully changed Bit or Breakdown revision exactly once; return the shared result family rather than throwing expected conflict/invalid outcomes.
  - Add authoritative postcondition lookup so a retry can distinguish `already_applied` from non-execution without a separate operation-log store.
- **Acceptance:**
  - Matching base versions apply once and return authoritative records; repeated stable operation IDs return `already_applied` without a duplicate write or revision increase.
  - Stale versions, consumed rows, staged rows, and archived/deleted Scratches reject mutation with no partial write.
  - Unknown-outcome reconciliation can prove whether an Add/Edit/Delete committed from stable IDs and postconditions.
  - `pnpm test --run src/lib/db/scratch-breakdowns.test.ts src/lib/db/triage-commands.test.ts` passes.
- **Commit:** `feat(phase-23): add conditional triage edit commands`

### Task 104: Enforce Bit revision on every write path

- **Status:** `[ ]`
- **Dependencies:** Task 101.
- **Files:** `src/lib/db/indexeddb.ts` (audit/update every Bit create and mutation path), `src/lib/db/indexeddb.test.ts`, `src/lib/db/mtime-cascade.test.ts`, `src/lib/db/auto-completion.test.ts`, `src/lib/db/archive.test.ts`, `src/lib/db/cascade-delete.test.ts`, `src/lib/db/cascade-restore.test.ts`, `src/lib/db/promotion.test.ts` (update focused assertions)
- **Actions:**
  - Set `version = 1` on every Bit creation path, including promotion and placement-ready internal creation helpers.
  - Increment an existing Bit exactly once for each successful logical content, position, completion, or lifecycle mutation across direct update/move, Hook 1 ancestor/deadline cascades, Hook 3 auto-completion, soft-delete/restore, and Hook 10/11 archive/restore cascades.
  - Ensure one transaction changing several fields on one Bit produces one revision increment, while separately mutated Bits in a cascade each increment once.
- **Acceptance:**
  - Focused tests cover every create and direct/cascade mutation path named above and fail on both missing and double increments.
  - `mtime` behavior remains intact and is not used as a compare-and-set token.
  - Node writes remain unchanged and no Node revision field is introduced.
  - `pnpm test --run src/lib/db/indexeddb.test.ts src/lib/db/mtime-cascade.test.ts src/lib/db/auto-completion.test.ts src/lib/db/archive.test.ts src/lib/db/cascade-delete.test.ts src/lib/db/cascade-restore.test.ts src/lib/db/promotion.test.ts` passes.
- **Commit:** `feat(phase-23): enforce bit revision invariants`

### Task 105: Persistence foundation integration gate

- **Status:** `[ ]`
- **Dependencies:** Tasks 101–104.
- **Files:** `src/lib/db/triage-commands.test.ts` (extend), `src/lib/db/indexeddb.schema-v4-upgrade.test.ts` (extend), `src/lib/db/datastore.ts` (final contract audit), `src/lib/db/indexeddb.ts` (final implementation audit)
- **Actions:**
  - Add a table-driven contract suite for migration, version monotonicity, source uniqueness, idempotent retry, no-partial-success, and authoritative postcondition reads.
  - Verify the DataStore interface and IndexedDB implementation remain substitutable for a future BaaS while preserving command/result semantics.
  - Run the complete database test group and production build before allowing UI phases to consume the new contract.
- **Acceptance:**
  - No schema or repository test depends on UI/Zustand state.
  - A failed or conflicting command leaves every participating store unchanged.
  - `pnpm test --run src/lib/db` and `pnpm build` pass.
- **Commit:** `test(phase-23): verify triage persistence contracts`

#### Phase 23 Notes

- This phase owns persistence primitives, not user-facing Triage flows.
- General Node-title optimistic concurrency is outside this promotion; placement-created Nodes use preallocated-ID idempotency.

## Phase 24: Inbox / Triage Shell, Scratch Pool & Selected Context

> **Purpose:** Rebuild the shared production shell, Scratch selection lifecycle, and signature Selected Scratch Context on top of the Phase 23 repository contract.
> **Dependencies:** Phase 23 complete.
> **Canonical refs:** SPEC.md § Inbox / Triage Workspace through Selected Scratch Context; DESIGN_TOKENS.md §§ Visible Section Identity And Shell, Scratch Pool, Selected Scratch Context And Breakdown.
> **Recipes:** `docs/recipes/inbox-triage-shell-section-chrome-visual-recipe.md`, `docs/recipes/inbox-triage-scratch-pool-visual-recipe.md`, `docs/recipes/inbox-triage-selected-scratch-context-visual-recipe.md`

### Task 106: Central English copy and disposable session state

- **Status:** `[ ]`
- **Dependencies:** Phase 23 complete.
- **Files:** `src/lib/copy/inbox-triage.ts` (create), `src/stores/triage-store.ts` (replace persistent-domain assumptions with UI-only state), `src/stores/triage-store.test.ts` (update), `src/types/triage.ts` (add presentation types only where shared)
- **Actions:**
  - `src/lib/copy/inbox-triage.ts`: own every new English label, status, validation, failure, focus announcement, and accessible description introduced by Phases 24–30; expose semantic `Grid Explorer` naming separately from theme display aliases.
  - `src/stores/triage-store.ts`: own only selected Scratch, Pool query/collapse/scroll session state, two independent device-local Pool/Breakdown sort preferences, Grid path/search session context, drafts, pending affordance presentation, and page-session placement metadata; remove staged candidates as UI-only truth.
  - Keep future locale resources replaceable without duplicating components or theme routes.
- **Acceptance:**
  - New Inbox/Triage components can obtain visible and accessibility copy from one feature-owned module.
  - Reload clears disposable presentation state but retains only the two device-local sort preferences; no durable candidate or domain lifecycle is stored in Zustand.
  - `pnpm test --run src/stores/triage-store.test.ts` passes.
- **Commit:** `refactor(phase-24): establish triage copy and session state`

### Task 107: Shared four-region workspace and visible section ownership

- **Status:** `[ ]`
- **Dependencies:** Task 106.
- **Files:** `src/components/triage/triage-workspace.tsx` (recompose shared shell), `src/components/layout/grid-runtime.tsx` (preserve Inbox system-node dispatch), `src/components/triage/triage-workspace.test.tsx` (update), `src/components/layout/grid-runtime.test.tsx` (update)
- **Recipe:** `docs/recipes/inbox-triage-shell-section-chrome-visual-recipe.md`
- **Actions:**
  - Preserve one shared production component tree with Scratch Pool, Breakdown, Staging, and Grid Explorer regions at `60/40`, upper `60/40`, and Staging `35/65` ratios.
  - Restore visible semantic section labels/chrome and stable `min-h-0` overflow ownership without introducing nested cards or prototype theme/test controls.
  - Add `data-triage-surface` hooks for later theme realization while keeping the existing `/grid/[nodeId]` Inbox system-node route.
  - When the selected Scratch is externally archived/deleted, stop stale interaction and show the non-dismissible five-second lifecycle modal with `Move now` and pause/resume controls; recompute next/previous visible destination against the latest Pool filter/order before moving. This timer belongs only to external-removal navigation, never Archive confirmation.
- **Acceptance:**
  - Open the Inbox system Node: all four named regions are visible in one viewport and resizing dynamic content does not push Grid Explorer off-screen.
  - External Scratch removal cannot leave a stale editable surface; the lifecycle modal moves to the latest valid visible fallback or Inbox empty state and cancels if the same archived Scratch is restored before navigation.
  - Every scrollable region still scrolls by wheel, trackpad, touch, and keyboard while visible scrollbar chrome is absent.
  - No prototype theme switcher, fold lock, test mode, or numbered variant control appears.
  - `pnpm test --run src/components/triage/triage-workspace.test.tsx src/components/layout/grid-runtime.test.tsx` passes.
- **Commit:** `feat(phase-24): restore triage workspace section structure`

### Task 108: Scratch Pool tools, collapse, search, and selection lifecycle

- **Status:** `[ ]`
- **Dependencies:** Tasks 106 and 107.
- **Files:** `src/components/triage/scratch-pool.tsx` (rebuild expanded/collapsed structure), `src/hooks/use-inbox.ts` (retain reactive Scratch query/actions), `src/stores/triage-store.ts` (session restoration and collapse suppression), `src/components/triage/scratch-pool.test.tsx`, `src/hooks/use-inbox.test.tsx` (update)
- **Recipe:** `docs/recipes/inbox-triage-scratch-pool-visual-recipe.md`
- **Actions:**
  - Compose one upper tools section (identity/count/toggle plus one-row title search and sort) and one lower list/switcher section separated by a divider.
  - In collapsed mode vertically order identity/count, explicit expand/collapse, and Scratch conversion switcher; preserve selected-state visibility and stable control dimensions.
  - Keep Scratch selection expanded. Only the first printable key entered into Breakdown collapses the Pool; manual re-expand suppresses repeat collapse for that Scratch until selection changes.
  - Preserve query/results across collapse and same-session route re-entry; reset query/collapse/scroll on reload. Persist Pool and Breakdown `createdAt` sort preferences under independent device-local keys, default invalid/missing values to DESC, and never let one control overwrite the other.
  - Keep the header count equal to all active Scratches and expose filtered count separately while search is active. Hide `0`; treat `1–7` as neutral, `8–14` as warm pressure, and `15+` as high pressure based on the unfiltered active total.
  - If the query excludes the selected Scratch, keep its selection and Context active and show concise selected-hidden-from-results status; a title save that stops matching follows the same rule.
- **Acceptance:**
  - Selecting or focusing a Scratch does not collapse the Pool; typing the first printable Breakdown character does.
  - Search and sort share one row when expanded, disappear when collapsed, and return with the same query/result state after re-expansion.
  - At active counts `0`, `1`, `8`, and `15`, total and pressure treatment use the specified bands and do not change when search filters the visible list.
  - A filtered-out selected Scratch keeps its Context and exposes selected-hidden status; Pool and Breakdown sort preferences survive reload independently and fall back to DESC when invalid.
  - Collapsed controls form a legible vertical stack and every Scratch switcher has an accessible title.
  - Long lists scroll without visible scrollbar chrome and selection remains stable under live updates.
  - `pnpm test --run src/components/triage/scratch-pool.test.tsx src/hooks/use-inbox.test.tsx` passes.
- **Commit:** `feat(phase-24): implement scratch pool session behavior`

### Task 109: Signature Selected Scratch Context and conditional title editing

- **Status:** `[ ]`
- **Dependencies:** Tasks 103, 106–108.
- **Files:** `src/components/triage/selected-scratch-context.tsx` (create), `src/components/triage/breakdown-panel.tsx` (mount above row list), `src/hooks/use-inbox.ts` (conditional title command/reconciliation), `src/components/triage/selected-scratch-context.test.tsx` (create), `src/components/triage/breakdown-panel.test.tsx` (update)
- **Recipe:** `docs/recipes/inbox-triage-selected-scratch-context-visual-recipe.md`
- **Actions:**
  - Render Context below Breakdown chrome and above rows with title, created date/time, always-visible Edit, and Breakdown ASC/DESC controls; keep it about `2–2.5` row heights and never draggable/row-like. Read/write the Breakdown preference independently from the Pool sort key.
  - Transform the same surface into an inline title editor. Save conditionally against the captured Bit version; valid blur saves, unchanged closes, empty stays open, and conflict shows latest-value resolution inline.
  - Implement one save-before-action pending intent for Scratch switch/internal navigation; theme changes preserve the editor without blur-save.
- **Acceptance:**
  - The Context is visibly larger and separate from rows while preserving the recipe's title/time/control hierarchy.
  - Save closes only after authoritative success; offline/failure/conflict preserves the draft and focus without last-write-wins overwrite.
  - Requesting Scratch switch during a dirty edit first resolves Save or Cancel and never queues multiple actions.
  - Edit and sort controls have stable accessible names and no repeated pulse/blink.
  - `pnpm test --run src/components/triage/selected-scratch-context.test.tsx src/components/triage/breakdown-panel.test.tsx src/hooks/use-inbox.test.tsx` passes.
- **Commit:** `feat(phase-24): add selected scratch context editing`

### Task 110: Shell, Scratch, and Context integration gate

- **Status:** `[ ]`
- **Dependencies:** Tasks 106–109.
- **Files:** `package.json` (add repeatable E2E script), `pnpm-lock.yaml` (update), `playwright.config.ts` (create), `tests/e2e/inbox-triage-workspace.spec.ts` (create), `src/components/triage/triage-workspace.test.tsx` (extend), `src/components/triage/scratch-pool.test.tsx` (extend), `src/components/triage/selected-scratch-context.test.tsx` (extend), `src/components/layout/grid-runtime.test.tsx` (extend)
- **Recipes:** the three Phase 24 recipe files.
- **Actions:**
  - Add flow-cluster tests for selection fallback, no-Scratch empty state, query/no-results, selected-hidden status, pressure thresholds, independent sort persistence, same-session restoration, first-key collapse, dirty-title navigation, focus fallback, and reduced motion.
  - Add the project's first Playwright harness with a deterministic local web-server configuration and `test:e2e` script; keep the initial spec limited to the Phase 24 shell/Scratch/Context flow so later phases can extend the same harness.
  - On same-session route re-entry restore valid selection/query/collapse/scroll and focus the page heading or main landmark rather than a stale deep control. On reload reset those session fields, select the current first valid Scratch, and retain only the two device-local sort preferences.
  - Verify visible labels remain semantic even where a later theme supplies a display alias.
  - Run focused tests and production build before Breakdown mutation work begins.
- **Acceptance:**
  - Browser back/re-entry restores selection/query/collapse/scroll and focuses the page heading or main landmark; reload resets those session fields while both independent sort preferences remain.
  - Keyboard focus remains usable through collapse, selection changes, title conflict, and empty-state transitions.
  - `pnpm test --run src/components/triage src/components/layout/grid-runtime.test.tsx src/hooks/use-inbox.test.tsx`, `pnpm test:e2e -- tests/e2e/inbox-triage-workspace.spec.ts`, and `pnpm build` pass.
- **Commit:** `test(phase-24): verify scratch and context flows`

#### Phase 24 Notes

- This phase establishes shared structure and behavior. Exact eight-theme fidelity is completed in Phases 31–32.
- EN/KR resources, locale toggle, Korean copy, and Korean typography remain deferred; only the copy ownership boundary ships here.

## Phase 25: Breakdown Lifecycle & Mutation Reliability

> **Purpose:** Implement authoritative Breakdown Add/Edit/Delete behavior, row lifecycle projection, sorting, empty prompts, and navigation guards without optimistic disappearance.
> **Dependencies:** Phase 24 complete.
> **Canonical refs:** SCHEMA.md §§ Conditional Edit And Concurrency, Breakdown Commands; SPEC.md §§ Selected Scratch Context And Breakdown Rows, Inline Editing And Concurrent Conflict, Breakdown Lifecycle And Delete Reliability.
> **Recipe:** `docs/recipes/inbox-triage-breakdown-visual-recipe.md`

### Task 111: Authoritative Breakdown hook and mutation state model

- **Status:** `[ ]`
- **Dependencies:** Phase 24 complete.
- **Files:** `src/hooks/use-scratch-breakdowns.ts` (consume Phase 23 commands and expose reactive rows/status), `src/hooks/use-scratch-breakdowns.test.tsx` (update), `src/types/triage.ts` (extend UI-facing command state types), `src/stores/triage-store.ts` (draft/pending intent only)
- **Actions:**
  - Expose active rows plus per-operation pending, reconciling, conflict, invalid, and failure state from authoritative command results.
  - Keep Add draft and one inline edit draft in page memory; capture ID/value/version/lifecycle base snapshots and one save-before-action pending intent.
  - Sort rows by selected `createdAt` direction, then `order`, then stable ID without mutating persisted order.
- **Acceptance:**
  - Hooks never remove or add a visible row merely because a command promise started.
  - Same-Scratch theme changes preserve drafts; Scratch/route changes invoke the specified continue/discard or save-before-action boundary.
  - `pnpm test --run src/hooks/use-scratch-breakdowns.test.tsx` passes.
- **Commit:** `feat(phase-25): add authoritative breakdown mutations`

### Task 112: Idempotent Add input and one-time success signal

- **Status:** `[ ]`
- **Dependencies:** Task 111.
- **Files:** `src/components/triage/breakdown-panel.tsx` (implement Add footer), `src/hooks/use-scratch-breakdowns.ts` (stable-ID Add command), `src/components/triage/breakdown-panel.test.tsx` (update), `src/hooks/use-scratch-breakdowns.test.tsx` (update)
- **Recipe:** `docs/recipes/inbox-triage-breakdown-visual-recipe.md`
- **Actions:**
  - Provide explicit Add and Enter submission; blur neither submits nor clears. Snapshot one draft, lock duplicate submission, and reconcile unknown outcomes by stable row ID.
  - On success clear the input, retain focus, scroll only the row list to the current sort insertion edge, announce politely, and apply one short semantic success treatment with a reduced-motion static equivalent.
  - Preserve text/focus on failure or offline and expose the contract-defined retry/reconciliation action without an optimistic row.
- **Acceptance:**
  - Enter and Add create exactly one row even under rapid repeat activation; a retry after unknown success does not duplicate it.
  - Successful Add keeps input focus, scrolls only the row list, announces addition, and runs one non-repeating signal.
  - Blur, Scratch switch, and route exit never auto-submit a draft.
  - `pnpm test --run src/components/triage/breakdown-panel.test.tsx src/hooks/use-scratch-breakdowns.test.tsx` passes.
- **Commit:** `feat(phase-25): make breakdown add authoritative`

### Task 113: Inline row edit, delete, conflict, and focus recovery

- **Status:** `[ ]`
- **Dependencies:** Tasks 111 and 112.
- **Files:** `src/components/triage/breakdown-panel.tsx` (inline editor and delete states), `src/hooks/use-scratch-breakdowns.ts` (conditional Edit/Delete commands), `src/components/triage/breakdown-panel.test.tsx` (extend), `src/hooks/use-scratch-breakdowns.test.tsx` (extend)
- **Recipe:** `docs/recipes/inbox-triage-breakdown-visual-recipe.md`
- **Actions:**
  - Keep Edit and Trash always visible. Preserve explicit Trash confirmation. Transform one row into an inline editor with Save, Cancel/Escape, valid blur-save, unchanged close, and inline latest-value conflict resolution.
  - Keep deleting/reconciling rows in the same visible position with actions/DnD locked. Failure restores Active without a dedicated Retry; unknown outcome exposes `Check again` and retains navigation guard.
  - After confirmed deletion or invalidation, move focus by visible sort order, then section heading/Add input fallback. If final-row Delete creates the completion transition, preserve a completion-focus handoff instead of applying that normal fallback; Task 140 owns the eventual Archive-heading focus. Explicit delete failure restores the Trash control and exposes a dismissible Breakdown-local alert with an accessible `X` but no dedicated Retry button.
- **Acceptance:**
  - Hover is not required to discover Edit or Trash; numbering and row time remain absent.
  - Conflict never overwrites unseen content and keeps the local draft available to inspect/copy.
  - A failed delete leaves the row and data intact; a confirmed delete removes it once and restores deterministic focus.
  - `pnpm test --run src/components/triage/breakdown-panel.test.tsx src/hooks/use-scratch-breakdowns.test.tsx` passes.
- **Commit:** `feat(phase-25): add reliable breakdown edit and delete`

### Task 114: Row lifecycle, sort, and empty-entry projection

- **Status:** `[ ]`
- **Dependencies:** Tasks 111–113.
- **Files:** `src/components/triage/breakdown-panel.tsx` (active/deleting/consumed/empty projection), `src/hooks/use-scratch-breakdowns.ts` (consumed evidence and active list selectors), `src/components/triage/breakdown-panel.test.tsx` (extend)
- **Recipe:** `docs/recipes/inbox-triage-breakdown-visual-recipe.md`
- **Actions:**
  - Remove consumed rows from the active list while retaining persisted evidence; never render the old line-through placed state.
  - Distinguish no-history idea-entry prompt from all-consumed completion eligibility and delete-only emptiness.
  - Keep row list and Add footer independently stable while sort changes; reserve staged de-emphasis wiring for Phase 26's durable candidate projection.
- **Acceptance:**
  - A consumed row disappears from the active list; deleting every row shows the entry prompt rather than completion.
  - Switching ASC/DESC reorders active rows without changing stored data or moving Context/Add footer.
  - Empty prompts are theme-ready, locale-owned, non-draggable surfaces and contain no decorative emoji.
  - `pnpm test --run src/components/triage/breakdown-panel.test.tsx src/hooks/use-scratch-breakdowns.test.tsx` passes.
- **Commit:** `feat(phase-25): project breakdown lifecycle states`

### Task 115: Breakdown flow integration gate

- **Status:** `[ ]`
- **Dependencies:** Tasks 111–114.
- **Files:** `src/components/triage/triage-workspace.test.tsx` (extend), `src/components/triage/breakdown-panel.test.tsx` (extend), `src/hooks/use-scratch-breakdowns.test.tsx` (extend), `src/lib/db/triage-commands.test.ts` (extend), `tests/e2e/inbox-triage-workspace.spec.ts` (extend)
- **Recipe:** `docs/recipes/inbox-triage-breakdown-visual-recipe.md`
- **Actions:**
  - Trace Add, Edit, conflict, Delete, sorting, consumed filtering, draft navigation, focus fallback, `aria-live`, and reload/unload guards through component, hook, and repository boundaries. Cover pristine remote adoption, dirty/IME conflict, repeated remote edits, and lifecycle invalidation with inspect/copy/close and safe focus fallback.
  - Own one table-driven save-before-action matrix for another Edit, Trash, Scratch switch, Archive, Undo, and internal route navigation: retain only one named intent, Save/resolve the inline edit first, then resolve any Add-draft Continue/Discard confirmation, execute once, and keep failure/conflict or intent-only Cancel in the editor. Theme toggle remains the non-saving exception.
  - Own selected-Scratch external-removal end to end: zero/one/multiple source-labelled Add/Edit drafts, full-text copy success/failure without restarting the paused countdown, Move now, pause/resume, latest filtered destination recalculation, no-results/empty fallback, archive-restore cancellation, and hard-delete non-restoration.
  - Verify successful final-row Delete exposes the completion-focus handoff without targeting a removed control; Task 140 consumes it when the Archive overlay opens. Preserve the normal visible-row/heading/Add fallback for non-completion deletion.
  - Prove every successful logical row mutation increments its revision once and every rejected mutation leaves records untouched.
  - Run focused tests and production build.
- **Acceptance:**
  - For every guarded action, one dirty editor resolves before exactly one intent; Save failure/conflict and Add-draft confirmation block that intent, intent-only Cancel clears it, and dirty-editor Undo revalidates eligibility before execution.
  - External archive/delete with zero, one, or multiple drafts shows the correct running/paused modal, preserves copy text and focus, follows the latest valid destination once, and cancels only on authoritative archive restore.
  - Pristine versus dirty/IME remote updates and lifecycle invalidation preserve the specified draft, status, and focus outcomes without last-write-wins overwrite.
  - Final-row Delete exposes one deterministic completion-focus handoff; all other Breakdown actions remain keyboard-usable except documented pointer-only Placement entry.
  - Pending/conflict/failure/success status is visible and announced without stealing surviving focus.
  - `pnpm test --run src/components/triage/breakdown-panel.test.tsx src/components/triage/triage-workspace.test.tsx src/hooks/use-scratch-breakdowns.test.tsx src/lib/db/triage-commands.test.ts`, `pnpm test:e2e -- tests/e2e/inbox-triage-workspace.spec.ts`, and `pnpm build` pass.
- **Commit:** `test(phase-25): verify breakdown reliability flows`

#### Phase 25 Notes

- Cross-surface line count, wrapping, ellipsis, and Korean IME behavior remain owned by their separate brainstorming topic.

## Phase 26: Durable Staging & Candidate DnD

> **Purpose:** Replace UI-only Staging with durable source-linked candidates and implement authoritative Stage/Unstage, full-card candidate drag, drop-back, and recovery states.
> **Dependencies:** Phases 23 and 25 complete.
> **Canonical refs:** SCHEMA.md §§ TriageStagedCandidates, Stage/Unstage Commands; SPEC.md §§ Staging, Reliability And Reconciliation, Focus And Accessibility.
> **Recipes:** `docs/recipes/inbox-triage-staging-visual-recipe.md`, `docs/recipes/inbox-triage-breakdown-visual-recipe.md`

### Task 116: Candidate repository query and atomic Stage/Unstage commands

- **Status:** `[ ]`
- **Dependencies:** Phases 23 and 25 complete.
- **Files:** `src/lib/db/datastore.ts` (candidate query/command APIs), `src/lib/db/indexeddb.ts` (implement atomic Stage/Unstage), `src/lib/db/triage-commands.test.ts` (extend), `src/lib/db/scratch-breakdowns.test.ts` (extend)
- **Actions:**
  - Query active candidates by Scratch and type while joining authoritative source-row lifecycle/content; do not persist duplicate labels.
  - Stage revalidates Scratch/source version, active lifecycle, unconsumed state, and source uniqueness before inserting one candidate at version `1`.
  - Unstage revalidates candidate/source relation and deletes only the candidate; the source row remains active with original creation/order data. Both commands are idempotent and reconcile unknown outcomes.
- **Acceptance:**
  - Reloading or leaving/re-entering Inbox preserves staged candidates.
  - Concurrent or repeated Stage for one source yields one candidate; failed Stage/Unstage has no partial write.
  - `pnpm test --run src/lib/db/triage-commands.test.ts src/lib/db/scratch-breakdowns.test.ts` passes.
- **Commit:** `feat(phase-26): persist triage staged candidates`

### Task 117: Reactive candidate hook and authoritative projections

- **Status:** `[ ]`
- **Dependencies:** Task 116.
- **Files:** `src/hooks/use-triage-candidates.ts` (create), `src/hooks/use-triage-candidates.test.tsx` (create), `src/hooks/use-scratch-breakdowns.ts` (join staged row IDs), `src/types/triage.ts` (candidate presentation/result types)
- **Actions:**
  - Expose Scratch-scoped Node/Bit candidates, newest-first with stable-ID tie-break, pending/reconciling operations, missing-source cleanup status, and a separate per-subsection remote-arrival count. Exclude initial hydration and Scratch switch; clear remote count when the user reaches the top or activates the indicator.
  - Project staged source IDs into Breakdown without copying candidate domain state into Zustand.
  - Keep remote additions from stealing focus or changing local drag state.
- **Acceptance:**
  - Candidate edits from another subscription update Staging reactively and the source row's staged state follows the same authoritative record.
  - Remote additions preserve focus/scroll, announce politely, and show `New items N` only when that subsection is not already at the top.
  - Missing source is not silently deleted; a section-local status precedes authoritative cleanup.
  - `pnpm test --run src/hooks/use-triage-candidates.test.tsx src/hooks/use-scratch-breakdowns.test.tsx` passes.
- **Commit:** `feat(phase-26): add reactive triage candidate projection`

### Task 118: Dedicated Triage DnD ownership and Stage/Unstage interactions

- **Status:** `[ ]`
- **Dependencies:** Tasks 116 and 117.
- **Files:** `src/hooks/use-triage-dnd.ts` (create from Triage responsibilities), `src/hooks/use-dnd.ts` (remove Inbox-specific persistence/intent only), `src/lib/grid-dnd.ts` (preserve shared payload guards), `src/hooks/use-triage-dnd.test.ts` (replace stale import/coverage), `src/lib/grid-dnd.test.ts` (update)
- **Actions:**
  - Own Mouse/Touch sensors, Breakdown grip drag, full-card candidate drag, compact `TriageDragToken`, valid/invalid Stage and drop-back targets, and DnD interruption state in the dedicated hook.
  - Stage/Unstage dispatch repository commands through owning hooks; the DnD hook itself performs no direct Dexie or sequential multi-store writes.
  - Support both the temporary dedicated unstage overlay and drop anywhere on Breakdown; same-subsection drops cancel without mutation.
- **Acceptance:**
  - Breakdown starts drag only from its Grip; staged Node/Bit starts from any card point. Both show the same type-specific compact drag pill regardless of grab point.
  - Dropping a staged item anywhere on Breakdown and using the unstage overlay invoke the same command.
  - `src/hooks/use-dnd.ts` continues to own non-Triage Grid/Calendar behavior with no regression.
  - `pnpm test --run src/hooks/use-triage-dnd.test.ts src/lib/grid-dnd.test.ts` passes.
- **Commit:** `refactor(phase-26): isolate durable triage dnd`

### Task 119: Staging sections, pending candidates, and Breakdown staged state

- **Status:** `[ ]`
- **Dependencies:** Tasks 117 and 118.
- **Files:** `src/components/triage/staging-zone.tsx` (render durable Node/Bit sections), `src/components/triage/breakdown-panel.tsx` (staged projection/disabled controls/drop-back signal), `src/components/triage/triage-workspace.tsx` (wire hook/DnD), `src/components/triage/triage-drag-token.tsx` (shared token), `src/components/triage/staging-zone.test.tsx`, `src/components/triage/breakdown-panel.test.tsx`, `src/components/triage/triage-drag-token.test.tsx` (update)
- **Recipe:** `docs/recipes/inbox-triage-staging-visual-recipe.md`
- **Actions:**
  - Keep visible Staging/Nodes/Bits chrome, `35/65` split, independently scrolling Node grid and Bit list, count only for two or more, and hidden scrollbar chrome.
  - Render pending Stage with the same candidate grammar plus static theme-ready pending treatment; lock source/candidate actions until authoritative result.
  - Render staged Breakdown rows de-emphasized with Edit/Trash/DnD disabled and no strike-through; expose dismissible non-expiring section-local orphan/Stage/Unstage failures with an accessible `X`, no automatic retry, and no candidate/source mutation when dismissed.
  - Keep the unstage overlay absolute and temporary, add scroll padding, and never resize/blur Staging.
  - Local Stage scrolls only the target subsection to its top without moving focus. Successful Unstage scrolls only the Breakdown list to the restored row, restores focus there, and reuses the Add success signal once.
- **Acceptance:**
  - Node candidates read as grid/object cards and Bits as list rows without relying on color alone.
  - Activating `New items N` scrolls only that candidate subsection to the top and clears the remote count; normal `Nodes`/`Bits` count remains a separate label.
  - A pending candidate does not make its source disappear; success changes both surfaces together, while failure restores Active and removes only pending projection.
  - Overlay controls and the final candidate remain reachable by scrolling with no visible scrollbar.
  - `pnpm test --run src/components/triage/staging-zone.test.tsx src/components/triage/breakdown-panel.test.tsx src/components/triage/triage-drag-token.test.tsx` passes.
- **Commit:** `feat(phase-26): render durable staging states`

### Task 120: Durable Staging integration and recovery gate

- **Status:** `[ ]`
- **Dependencies:** Tasks 116–119.
- **Files:** `src/components/triage/triage-workspace.test.tsx` (extend), `src/components/triage/staging-zone.test.tsx` (extend), `src/hooks/use-triage-candidates.test.tsx` (extend), `src/hooks/use-triage-dnd.test.ts` (extend), `src/lib/db/triage-commands.test.ts` (extend), `tests/e2e/inbox-triage-workspace.spec.ts` (extend)
- **Recipes:** `docs/recipes/inbox-triage-staging-visual-recipe.md`, `docs/recipes/inbox-triage-breakdown-visual-recipe.md`
- **Actions:**
  - Trace Stage, duplicate Stage, reload/re-entry, remote arrival, Unstage by both targets, unknown outcome, source invalidation, focus retention, and pending navigation guards end to end.
  - Verify stale Edit/Trash and duplicate/cross-type Stage refuse mutation, refresh the authoritative staged state, and expose a direct Unstage-first reason without changing candidate type.
  - Verify same-subsection hover/drop is neutral, opposite-subsection hover/drop shows the type-invalid reason, and no-target release, Escape, or browser cancellation clears token/signals/overlay without mutation or error alert.
  - During remote invalidation, preserve the visual drag token until release/cancel, then apply latest authoritative state without executing the stale drop.
  - Verify candidate root cards have no inner Grip and every drag point yields the same token.
  - Run focused tests and production build.
- **Acceptance:**
  - Durable Staging survives reload while all presentation-only pending/error state resets or reconciles correctly.
  - Unknown outcomes never show both active and staged authoritative states incorrectly or delete either side prematurely.
  - Stale or cross-type actions never convert/duplicate a candidate, and every neutral/cancel path ends with no mutation, no alert, and no lingering drag UI.
  - `pnpm test --run src/components/triage src/hooks/use-triage-candidates.test.tsx src/hooks/use-triage-dnd.test.ts src/lib/db/triage-commands.test.ts`, `pnpm test:e2e -- tests/e2e/inbox-triage-workspace.spec.ts`, and `pnpm build` pass.
- **Commit:** `test(phase-26): verify durable staging flows`

#### Phase 26 Notes

- The shared main Node/Bit visual redesign remains a later BitCard workstream. This phase preserves current shared card grammar and only adds semantic Staging states.

## Phase 27: Whole-Hierarchy Grid Explorer Search

> **Purpose:** Replace active-column filtering with a dedicated whole-hierarchy Grid Explorer search mode, including an explicit user gate for the phase-local result-screen realization.
> **Dependencies:** Phases 24 and 26 complete.
> **Canonical refs:** SPEC.md Architecture Decision 21 and § Grid Explorer Search; DESIGN_TOKENS.md § Grid Explorer And Search; PROMOTION_MAP.md Open Question Disposition.
> **Normal-mode recipe:** `docs/recipes/inbox-triage-grid-explorer-visual-recipe.md`

### Task 121: Decision prerequisite — approve search-result realization

- **Status:** `[ ]`
- **Dependencies:** Phases 24 and 26 complete.
- **Disposition:** **Decision prerequisite.** Task 124 must not begin until the user explicitly approves the user-facing result realization captured here.
- **Files:** `docs/recipes/inbox-triage-grid-explorer-search-results-visual-recipe.md` (create after review), `docs/recipes/inbox-triage-visual-recipe-index.md` (add approved recipe), `docs/DESIGN_TOKENS.md` (amend only if the approved realization introduces reusable contracts)
- **Actions:**
  - Present concrete search-result candidates that satisfy the fixed behavior/information contract: one replacement body, input/close, empty guidance, no-results, flat Node/Bit results, title, native icon/color, full breadcrumb, duplicate-item text, loading, stale/error, keyboard selection, and theme mapping.
  - Review row density, duplicate indicator placement, loading/error surfaces, focus behavior, and eight-theme realization with the user. Existing Grid card/chrome is context, not an automatic fallback.
  - Record only the approved realization as a new recipe and mark it `Approved`; do not implement UI or silently choose a candidate before approval.
- **Acceptance:**
  - The user explicitly approves one complete realization covering normal, empty, no-results, duplicate, loading, stale, and error states across the eight theme families.
  - The approved recipe has exact source/decision provenance, records every user-visible choice needed by Task 124, and is linked from the recipe index.
  - No production search-result component is changed before this task is approved.
- **Commit:** `docs(phase-27): approve grid explorer search results`

### Task 122: Dedicated hierarchy query model and relevance engine

- **Status:** `[ ]`
- **Dependencies:** Phase 23 complete.
- **Files:** `src/lib/triage/grid-explorer-search.ts` (create query model/ranker), `src/lib/triage/grid-explorer-search.test.ts` (create), `src/lib/db/datastore.ts` (add Inbox search corpus query), `src/lib/db/indexeddb.ts` (implement active/reachable corpus query), `src/lib/db/triage-grid-search.test.ts` (create)
- **Actions:**
  - Query all active Nodes/Bits reachable from visible Home roots while excluding Chunks, system/hidden roots, archived/trashed items, and unreachable orphans; return stable ancestor ID chains and full breadcrumbs.
  - Tokenize trimmed whitespace and require every token to match title/breadcrumb. Rank exact title, prefix, substring, split title/breadcrumb, then breadcrumb-only, using hierarchy order as tie-break.
  - Produce direct duplicate labels such as `Duplicate item 1/2` without opaque coordinates. Do not call or adapt global `searchAll()`.
- **Acceptance:**
  - Tests prove scope exclusions, complete ancestor paths, deterministic relevance order, duplicate labels, and stale/missing ancestor handling.
  - No Inbox search code imports or reshapes global `searchAll()` results.
  - `pnpm test --run src/lib/triage/grid-explorer-search.test.ts src/lib/db/triage-grid-search.test.ts` passes.
- **Commit:** `feat(phase-27): add whole-hierarchy triage search`

### Task 123: Search session hook, navigation, and DnD interruption recovery

- **Status:** `[ ]`
- **Dependencies:** Task 122.
- **Files:** `src/hooks/use-grid-explorer-search.ts` (create), `src/hooks/use-grid-explorer-search.test.tsx` (create), `src/stores/triage-store.ts` (Grid path/scroll plus active/interrupted query and reveal state), `src/hooks/use-triage-dnd.ts` (close search on drag start), `src/components/triage/hierarchy-explorer.tsx` (stable path/scroll anchors), `src/components/triage/triage-workspace.tsx` (coordinate mode ownership)
- **Actions:**
  - Own open/close/focus, live query refresh, keyboard result selection, ancestor-path reconstruction, Node selection, temporary Bit reveal, stale-result rejection, and route/session clearing.
  - Starting Breakdown/candidate DnD closes search and preserves only the interrupted query. The next explicit search restores it; result selection, `X`, Escape, reload, or route exit clears it. Placement completion/cancel never auto-reopens search.
  - Preserve current query while data refreshes without auto-scroll/focus or extra remote-sync alert; keep search results as navigation surfaces, never drag sources. Bit reveal has no timer and ends only on another selection, path change, DnD, new search, or route exit.
  - Preserve the normal four-column path, selected Node chain, and per-column scroll offsets across Scratch switches and same-session route re-entry. On remote insertion preserve the first-visible stable-ID anchor; on path invalidation fall back to the nearest valid ancestor and move focus/status accordingly.
- **Acceptance:**
  - A DnD interruption closes search so columns are usable; reopening restores the last interrupted query only.
  - Clicking/pressing Enter on a valid result clears history, restores four columns, reconstructs the exact path, and selects/reveals the item without changing route.
  - A stale result is rejected after revalidation and never navigates to a look-alike sibling.
  - Reload/new session starts normal Grid at Home, while same-session route re-entry restores only valid path/scroll context and never auto-restores search mode.
  - `pnpm test --run src/hooks/use-grid-explorer-search.test.tsx src/hooks/use-triage-dnd.test.ts` passes.
- **Commit:** `feat(phase-27): coordinate grid explorer search state`

### Task 124: Approved search-result surface and Grid mode integration

- **Status:** `[ ]`
- **Dependencies:** Tasks 121–123; Task 121 user approval is mandatory.
- **Files:** `src/components/triage/grid-explorer-search.tsx` (create approved result surface), `src/components/triage/hierarchy-explorer.tsx` (switch normal/search body), `src/components/triage/triage-workspace.tsx` (wire mode), `src/components/triage/grid-explorer-search.test.tsx` (create), `src/components/triage/hierarchy-explorer.test.tsx` (update)
- **Recipe:** `docs/recipes/inbox-triage-grid-explorer-search-results-visual-recipe.md` (must exist and be approved by Task 121)
- **Actions:**
  - Replace all four columns with the approved single search body while open; retain one semantic Grid Explorer region and restore unchanged normal columns/path/scroll on close.
  - Implement approved empty guidance, no-results, result, duplicate, loading, stale, failure, close, and keyboard-focus visuals using centralized copy and semantic `data-triage-*` state hooks.
  - Keep Newly Placed marker/Undo available when an eligible local result is present, without making results draggable.
- **Acceptance:**
  - Opening search hides the four columns and focuses the input; closing restores the same path and scroll anchors.
  - The running shared surface matches the approved Task 121 layout, density, and state hierarchy in the base theme and exposes the semantic hooks needed for Phase 32's eight-theme realization.
  - Empty query and no-results are visibly different; duplicate entries use direct text instead of coordinates.
  - `pnpm test --run src/components/triage/grid-explorer-search.test.tsx src/components/triage/hierarchy-explorer.test.tsx` passes.
- **Commit:** `feat(phase-27): implement grid explorer search results`

### Task 125: Grid search accessibility and integration gate

- **Status:** `[ ]`
- **Dependencies:** Tasks 121–124.
- **Files:** `src/components/triage/triage-workspace.test.tsx`, `src/components/triage/grid-explorer-search.test.tsx`, `src/components/triage/hierarchy-explorer.test.tsx`, `src/hooks/use-grid-explorer-search.test.tsx` (extend), `tests/e2e/inbox-triage-search.spec.ts` (create)
- **Recipe:** approved Task 121 recipe plus `docs/recipes/inbox-triage-grid-explorer-visual-recipe.md`
- **Actions:**
  - Cover focus entry/return, Arrow/Home/End/Enter/Escape, current-query refresh, duplicate selection, stale rejection, Node select, Bit reveal lifecycle, DnD interruption, route/reload clearing, and reduced motion.
  - Verify semantic name remains `Grid Explorer` even when later themes display `Library Index`, `Finder`, or terminal aliases.
  - Run focused tests, E2E flow, and production build.
- **Acceptance:**
  - Keyboard users can search and navigate results; pointer users can interrupt with DnD without losing an accidental query.
  - Search never mutates the normal Grid route or uses global Search Overlay state.
  - `pnpm test --run src/components/triage/grid-explorer-search.test.tsx src/components/triage/hierarchy-explorer.test.tsx src/hooks/use-grid-explorer-search.test.tsx`, `pnpm test:e2e -- tests/e2e/inbox-triage-search.spec.ts`, and `pnpm build` pass.
- **Commit:** `test(phase-27): verify grid explorer search flows`

#### Phase 27 Notes

- Task 121 is an executable design-decision task, not a hidden prerequisite. Dependent UI work stays blocked until its approval artifact exists.

## Phase 28: Staged & Direct Placement Flows

> **Purpose:** Implement valid/invalid Grid targets, column-scoped staged/direct affordances, title rules, and atomic confirmed placement without component-composed writes.
> **Dependencies:** Phases 26 and 27 complete.
> **Canonical refs:** SCHEMA.md §§ Placement Commands, Idempotency And Recovery; SPEC.md §§ Placement Targets And Flow, Reliability And Reconciliation.
> **Recipes:** `docs/recipes/inbox-triage-grid-explorer-visual-recipe.md`, `docs/recipes/inbox-triage-placement-affordances-visual-recipe.md`

### Task 126: Grid target registry, invalid signals, and column auto-scroll

- **Status:** `[ ]`
- **Dependencies:** Phases 26 and 27 complete.
- **Files:** `src/hooks/use-triage-dnd.ts` (target hit testing/drag state), `src/components/triage/hierarchy-explorer.tsx` (column and active-Node targets), `src/lib/grid-dnd.ts` (typed target payloads), `src/hooks/use-triage-dnd.test.ts`, `src/components/triage/hierarchy-explorer.test.tsx`, `src/lib/grid-dnd.test.ts` (update)
- **Recipe:** `docs/recipes/inbox-triage-placement-affordances-visual-recipe.md`
- **Actions:**
  - Register column bodies and active Node cards as targets with current parent/path/level/full metadata. Enforce Home Node-only, Level 3 Bit-only, hierarchy limits, reachability, and exact pointer-release destination.
  - On drag start apply a static theme-ready invalid-column background/depth signal; on pointer entry add a separate sharp warning above it without replacing `Home`/`Level 1–3` labels.
  - Auto-scroll only the valid hovered column edge, continuously update hit testing, retain ordinary scrolling, and keep scrollbar chrome hidden.
- **Acceptance:**
  - Invalid/locked targets never write or redirect; drag start and pointer entry produce two distinct non-blinking signals.
  - Retro Mac labels remain visible during warning, and Clay/blurred backgrounds never blur warning text.
  - Edge dragging scrolls only the target column and all ordinary input scrolling still works.
  - `pnpm test --run src/hooks/use-triage-dnd.test.ts src/components/triage/hierarchy-explorer.test.tsx src/lib/grid-dnd.test.ts` passes.
- **Commit:** `feat(phase-28): add triage grid drop targeting`

### Task 127: Atomic staged and direct placement commands

- **Status:** `[ ]`
- **Dependencies:** Phase 23 and Task 126.
- **Files:** `src/lib/db/datastore.ts` (placement command APIs), `src/lib/db/indexeddb.ts` (single-transaction implementation), `src/lib/db/triage-commands.test.ts` (extend), `src/lib/db/grid-uniqueness.test.ts` (extend)
- **Actions:**
  - Staged Confirm atomically revalidates Scratch/source/candidate/target/title/cell, creates the preallocated Node/Bit, consumes and revisions the row once, and removes the candidate.
  - Direct Confirm atomically revalidates Scratch/source/no-candidate/target/type/title/cell, creates the preallocated Node/Bit, and consumes/revisions the row once.
  - Return `applied`/`already_applied` with authoritative result and source records; full/stale/invalid/conflict paths perform no writes and never auto-select another cell or parent.
- **Acceptance:**
  - Repeating Confirm with the same operation/result IDs creates one item and increments the source row once.
  - A transaction fault at any write point leaves result, source, and candidate stores unchanged.
  - Full target and stale target produce direct invalid reasons with no fallback placement.
  - `pnpm test --run src/lib/db/triage-commands.test.ts src/lib/db/grid-uniqueness.test.ts` passes.
- **Commit:** `feat(phase-28): add atomic triage placement commands`

### Task 128: Placement workflow hook and reconciliation state

- **Status:** `[ ]`
- **Dependencies:** Tasks 126 and 127.
- **Files:** `src/hooks/use-triage-placement.ts` (create), `src/hooks/use-triage-placement.test.tsx` (create), `src/hooks/use-triage-dnd.ts` (emit placement intent only), `src/stores/triage-store.ts` (pending presentation), `src/types/triage.ts` (placement view types)
- **Actions:**
  - Own staged/direct steps, selected type, target path, optional staged Result Title, stable operation/result IDs, pending/reconciling/failure state, Cancel/Escape, and authoritative Confirm.
  - Block Scratch switch, Grid path/search, new DnD, conflicting Undo, and internal route navigation with a direct reason while a flow is open; do not queue blocked intents.
  - Preserve source/target context during unknown outcomes and reconcile before success, retry, or a second command.
- **Acceptance:**
  - Staged drop opens confirmation; direct row drop opens type/path choice first and a visually separate confirmation second.
  - Cancel changes no domain record. Confirm cannot run twice while pending or before type/title/target validity.
  - Unknown outcomes retain one flow and resolve through stable postconditions rather than optimistic success.
  - `pnpm test --run src/hooks/use-triage-placement.test.tsx src/hooks/use-triage-dnd.test.ts` passes.
- **Commit:** `feat(phase-28): coordinate triage placement workflow`

### Task 129: Column-scoped direct choice and Placement affordances

- **Status:** `[ ]`
- **Dependencies:** Tasks 126–128.
- **Files:** `src/components/triage/placement-affordance.tsx` (create direct-choice/title/confirmation surfaces), `src/components/triage/hierarchy-explorer.tsx` (mount in target scroll content), `src/components/triage/triage-workspace.tsx` (wire focus/locks), `src/components/triage/placement-affordance.test.tsx` (create), `src/components/triage/hierarchy-explorer.test.tsx` (extend)
- **Recipe:** `docs/recipes/inbox-triage-placement-affordances-visual-recipe.md`
- **Actions:**
  - Render opaque, column-scoped direct Node/Bit/path choice followed by a separate confirmation; render staged confirmation directly. Show source, result type, full destination, Confirm/Yes, and Cancel/Escape.
  - Direct placement has no title editor: `1–100` enables Node/Bit, `101–200` Bit only, `201–1000` neither. Staged over-limit title inserts the explicit Result Title step and never truncates source text.
  - Keep the affordance inside `data-placement-scroll` with enough bottom padding for warnings and controls. Full target uses the same surface, disables Confirm, and keeps Cancel.
  - Contain focus within the active column-scoped step, return focus on Cancel, and move it to the actual result card on success.
- **Acceptance:**
  - Direct type choice and confirmation are visibly different surfaces; no translucent Glassmorphism prelayer or full-screen modal appears.
  - Scrolling exposes every action without increasing column height; warning/Confirm/Cancel never clip below the viewport.
  - Terminal displays red Cancel/No and foreground Confirm/Yes in the decided order; all themes use static pending state with no blink/pulse.
  - `pnpm test --run src/components/triage/placement-affordance.test.tsx src/components/triage/hierarchy-explorer.test.tsx` passes.
- **Commit:** `feat(phase-28): render triage placement affordances`

### Task 130: Placement flow integration gate

- **Status:** `[ ]`
- **Dependencies:** Tasks 126–129.
- **Files:** `src/components/triage/triage-workspace.test.tsx`, `src/components/triage/placement-affordance.test.tsx`, `src/components/triage/hierarchy-explorer.test.tsx`, `src/hooks/use-triage-placement.test.tsx`, `src/hooks/use-triage-dnd.test.ts`, `src/lib/db/triage-commands.test.ts` (extend), `tests/e2e/inbox-triage-placement.spec.ts` (create)
- **Recipes:** both Phase 28 recipe files.
- **Actions:**
  - Cover staged/direct paths, title limits, Node/Bit target rules, active Node target, full/stale target, pending/retry/reconciliation, blocked navigation, search interruption, Cancel focus, and Confirm result focus. Full targets always keep the ordinary affordance with a direct reason, disabled Confirm, and no BFS redirect.
  - While direct choice, Result Title, or confirmation is open, inject remote candidate removal, source consume/delete, and target remove/reparent. Close or invalidate immediately, discard invalid Result Title draft, return safe focus, and perform no partial write.
  - Verify native unload confirmation appears only for a changed staged Result Title draft before Confirm. Clean choice/confirmation exits discard volatile flow without a custom guard or restoration; a pending command follows authoritative reconciliation after reload.
  - Verify no domain write occurs before explicit Confirm and result rendering uses actual Node/Bit data.
  - Run focused tests, E2E flows, and production build.
- **Acceptance:**
  - Every successful flow produces one actual Node/Bit and consumes one source row; staged success also removes one candidate.
  - Every Cancel, invalid, full, stale, remote-invalidated, conflict, and injected transaction-failure flow leaves authoritative records unchanged; full target never invokes BFS fallback.
  - Dirty Result Title alone triggers the pre-confirm unload guard; clean volatile steps are discarded on exit/re-entry, while pending mutation reload reconciles before reporting an outcome.
  - `pnpm test --run src/components/triage src/hooks/use-triage-placement.test.tsx src/hooks/use-triage-dnd.test.ts src/lib/db/triage-commands.test.ts`, `pnpm test:e2e -- tests/e2e/inbox-triage-placement.spec.ts`, and `pnpm build` pass.
- **Commit:** `test(phase-28): verify triage placement flows`

#### Phase 28 Notes

- Placement entry remains pointer drag only. Do not add a row action-menu command, keyboard destination picker, or hidden auto-placement shortcut.

## Phase 29: Newly Placed Projection & Source-Aware Undo

> **Purpose:** Show confirmed results as ordinary Node/Bit cards with page-session Newly Placed treatment and implement atomic source-aware Undo.
> **Dependencies:** Phase 28 complete.
> **Canonical refs:** SCHEMA.md § Undo Commands; SPEC.md Architecture Decision 22 and § Newly Placed And Undo; DESIGN_TOKENS.md § Newly Placed And Undo.
> **Recipe:** `docs/recipes/inbox-triage-newly-placed-undo-visual-recipe.md`

### Task 131: Page-session placement provenance and lifecycle

- **Status:** `[ ]`
- **Dependencies:** Phase 28 complete.
- **Files:** `src/stores/triage-store.ts` (operation/result-keyed transient projection), `src/stores/triage-store.test.ts` (extend), `src/hooks/use-triage-placement.ts` (publish confirmed local result), `src/types/triage.ts` (projection types)
- **Actions:**
  - Record only placements started and confirmed by the mounted Inbox page, keyed by operation/result IDs with source kind, candidate/source IDs, placement timestamp, and current rollback eligibility.
  - Preserve projection across Scratch, Grid column/path, search, theme, and locale changes. Clear it on Inbox route exit or reload without deleting created records.
  - Keep remote/session-external results ordinary and never derive provenance from title matching.
- **Acceptance:**
  - Multiple local placements remain marked while navigating within Inbox; reload or route exit removes markers/Undo but keeps actual records.
  - Scratch switching alone does not clear Newly Placed state.
  - `pnpm test --run src/stores/triage-store.test.ts src/hooks/use-triage-placement.test.tsx` passes.
- **Commit:** `feat(phase-29): track newly placed page session state`

### Task 132: Actual Node/Bit card projection, pinning, and reveal

- **Status:** `[ ]`
- **Dependencies:** Task 131.
- **Files:** `src/components/triage/hierarchy-explorer.tsx` (merge actual records with transient ordering), `src/components/grid/node-card.tsx` (optional semantic marker/action slot without geometry change), `src/components/grid/bit-card.tsx` (optional semantic marker/action slot without geometry change), `src/components/triage/hierarchy-explorer.test.tsx`, `src/components/grid/node-card.test.tsx`, `src/components/grid/bit-card.test.tsx` (update)
- **Recipe:** `docs/recipes/inbox-triage-newly-placed-undo-visual-recipe.md`
- **Actions:**
  - Render placement results through existing Node/Bit card components with their dimensions, radius, base color, icon, padding, and internal Node/Bit differences unchanged; add semantic marker/Undo slots only.
  - Pin Newly Placed Nodes above ordinary Nodes and Bits above ordinary Bits, newest placement first, without changing persisted Grid coordinates.
  - Scroll the target column to reveal/focus the actual card after Confirm. Selected and Newly Placed states must compose without either becoming ambiguous.
- **Acceptance:**
  - No checkbox, `Node: ...` indicator, wrapper card, or duplicate placement row is rendered.
  - Node and Bit keep their existing distinct card grammar; Newly Placed changes only approved marker/outline/background/corner/shadow treatment.
  - Multiple results pin within their own type group and return to ordinary Grid order after route exit/reload.
  - `pnpm test --run src/components/triage/hierarchy-explorer.test.tsx src/components/grid/node-card.test.tsx src/components/grid/bit-card.test.tsx` passes.
- **Commit:** `feat(phase-29): project newly placed grid cards`

### Task 133: Atomic source-aware Undo command

- **Status:** `[ ]`
- **Dependencies:** Tasks 127 and 131.
- **Files:** `src/lib/db/datastore.ts` (Undo command API), `src/lib/db/indexeddb.ts` (single-transaction source restore), `src/lib/db/triage-commands.test.ts` (extend), `src/hooks/use-triage-placement.ts` (invoke/reconcile Undo), `src/hooks/use-triage-placement.test.tsx` (extend)
- **Actions:**
  - Staging-source Undo removes the created result, recreates/restores the candidate with a new revision, and reactivates/revisions the source row in one transaction.
  - Direct-source Undo removes the result and reactivates/revisions the source row without creating a candidate.
  - Revalidate operation/result IDs, source lineage, current result lifecycle/version, descendants/dependencies, and conflicting mutation state; return authoritative result variants and reconcile unknown outcomes.
- **Acceptance:**
  - Successful staged Undo restores one candidate plus active source row; direct Undo restores only the active row.
  - Result mutation, archive/delete, or surviving dependency disables rollback and no partial restoration occurs.
  - Retry with the same operation metadata does not duplicate candidate/row or double-increment revision.
  - `pnpm test --run src/lib/db/triage-commands.test.ts src/hooks/use-triage-placement.test.tsx` passes.
- **Commit:** `feat(phase-29): add source-aware placement undo`

### Task 134: Theme-ready Undo control, availability, and recovery feedback

- **Status:** `[ ]`
- **Dependencies:** Tasks 132 and 133.
- **Files:** `src/components/triage/hierarchy-explorer.tsx` (Undo presentation/event isolation), `src/components/grid/node-card.tsx`, `src/components/grid/bit-card.tsx` (stable trailing action slot), `src/components/triage/triage-workspace.tsx` (locks/announcements), `src/components/triage/hierarchy-explorer.test.tsx`, `src/components/grid/node-card.test.tsx`, `src/components/grid/bit-card.test.tsx` (extend)
- **Recipe:** `docs/recipes/inbox-triage-newly-placed-undo-visual-recipe.md`
- **Actions:**
  - Keep Undo visible on each local Newly Placed card; isolate it from Node selection/navigation and name it with type/title plus restoration outcome.
  - Keep marker visible when Undo is unavailable; disable the same control with an accessible reason and allow it to re-enable if reversible local child operations are undone in reverse order.
  - Lock Undo during Placement/Archive mutation. On success preserve Grid focus and announce source restoration without auto-scrolling another section; on failure keep authoritative records and expose Retry.
- **Acceptance:**
  - Clicking Undo never also opens/selects the Node; selecting the card never triggers Undo.
  - Search reveal and selection preserve Undo, while route exit removes it.
  - Marker and Undo are static and remain distinguishable from selected state with reduced motion.
  - `pnpm test --run src/components/triage/hierarchy-explorer.test.tsx src/components/grid/node-card.test.tsx src/components/grid/bit-card.test.tsx` passes.
- **Commit:** `feat(phase-29): add newly placed undo controls`

### Task 135: Newly Placed and Undo integration gate

- **Status:** `[ ]`
- **Dependencies:** Tasks 131–134.
- **Files:** `src/components/triage/triage-workspace.test.tsx`, `src/components/triage/hierarchy-explorer.test.tsx`, `src/hooks/use-triage-placement.test.tsx`, `src/lib/db/triage-commands.test.ts`, `tests/e2e/inbox-triage-placement.spec.ts`, `tests/e2e/inbox-triage-search.spec.ts` (extend)
- **Recipe:** `docs/recipes/inbox-triage-newly-placed-undo-visual-recipe.md`
- **Actions:**
  - Cover Node/Bit, staged/direct source, selected overlap, multiple placements, pinning, Scratch/column/theme changes, search projection, route exit, unavailable/re-enabled Undo, event isolation, failure, reconciliation, and focus/announcement.
  - Navigate into a Newly Placed Node and place a child under it as an ordinary target; verify the surviving child disables parent Undo and undoing the reversible child re-enables the parent in reverse order.
  - From search results, Undo one eligible result without closing search: preserve query, remove only that result, announce staging/direct restoration, and focus the next result or search input. If an editor is dirty, reuse Task 115's single pending intent and revalidate Undo after Save/conflict resolution.
  - Verify no permanent Newly Placed field reaches Node/Bit schema or IndexedDB.
  - Run focused tests, E2E flow, and production build.
- **Acceptance:**
  - Newly Placed cards behave as ordinary navigable/targetable Node/Bit records; child placement disables parent Undo until reversible dependencies are undone.
  - Search-result Undo preserves search context and reports/focuses the exact restoration outcome; dirty-editor Undo executes only after the single pending intent resolves.
  - Both Undo paths restore exactly the intended source state and preserve all unrelated Grid records.
  - `pnpm test --run src/components/triage src/components/grid/node-card.test.tsx src/components/grid/bit-card.test.tsx src/hooks/use-triage-placement.test.tsx src/lib/db/triage-commands.test.ts`, `pnpm test:e2e -- tests/e2e/inbox-triage-placement.spec.ts tests/e2e/inbox-triage-search.spec.ts`, and `pnpm build` pass.
- **Commit:** `test(phase-29): verify newly placed undo flows`

#### Phase 29 Notes

- Newly Placed is page-session UI state, not an IndexedDB or future BaaS field.

## Phase 30: Breakdown Completion & Archive

> **Purpose:** Derive completion from persisted consumed evidence and durable candidates, then implement the Breakdown-scoped Cancel/reopen/archive lifecycle and authoritative Archive command.
> **Dependencies:** Phases 26 and 29 complete.
> **Canonical refs:** SCHEMA.md §§ Archive Eligibility, Archive Command; SPEC.md § Completion And Archive; DESIGN_TOKENS.md § Completion And Archive.
> **Recipes:** `docs/recipes/inbox-triage-archive-completion-visual-recipe.md`, `docs/recipes/inbox-triage-selected-scratch-context-visual-recipe.md`

### Task 136: Persisted completion eligibility and page-local blockers

- **Status:** `[ ]`
- **Dependencies:** Phases 26 and 29 complete.
- **Files:** `src/hooks/use-can-archive-scratch.ts` (replace empty-list shortcut with persisted query contract), `src/hooks/use-can-archive-scratch.test.ts` (extend), `src/lib/db/datastore.ts` (eligibility query API), `src/lib/db/indexeddb.ts` (implement consumed/candidate evidence query), `src/lib/db/triage-commands.test.ts` (extend)
- **Actions:**
  - Require active selected Scratch, at least one consumed row, no unconsumed row, and zero candidates. Guard empty history explicitly instead of relying on empty-array `every()`.
  - Expose persisted eligibility separately from page-local Add draft/dirty Context blockers.
  - Recompute reactively after Add, Stage/Unstage, Placement, Undo, Delete, archive/restore, and remote updates.
- **Acceptance:**
  - All-staged, delete-only empty, fresh empty, archived/deleted Scratch, or any active/candidate row is not eligible.
  - At least one consumed row with no active rows/candidates is eligible; a non-empty draft or dirty title blocks UI without changing persisted eligibility.
  - `pnpm test --run src/hooks/use-can-archive-scratch.test.ts src/lib/db/triage-commands.test.ts` passes.
- **Commit:** `feat(phase-30): derive triage archive eligibility`

### Task 137: Completion transition, completed Context, and reopen state

- **Status:** `[ ]`
- **Dependencies:** Task 136.
- **Files:** `src/components/triage/selected-scratch-context.tsx` (same-surface completed state), `src/components/triage/breakdown-panel.tsx` (completion prompt/reopen control), `src/stores/triage-store.ts` (mounted-session transition/dismissal state), `src/components/triage/selected-scratch-context.test.tsx`, `src/components/triage/breakdown-panel.test.tsx` (extend)
- **Recipes:** both Phase 30 recipe files.
- **Actions:**
  - Auto-open only on the first false-to-true eligible transition in the mounted session. Cancel/Escape converts the same Context to theme-ready `Scratch complete` state and reveals one in-Breakdown reopen control.
  - On Scratch switch/re-entry/reload recompute eligibility and show completed Context/reopen instead of auto-opening; do not persist a dismissal flag.
  - Immediately withdraw overlay/completed/reopen state when a new row, restored row, candidate, Add draft, or dirty Context makes the flow ineligible/blocked.
- **Acceptance:**
  - Cancel hides the overlay, changes the existing Context rather than inserting a generic card, and moves focus to the newly visible reopen control.
  - While the overlay is open no separate reopen control is rendered.
  - A new saved row returns Context and Breakdown to normal immediately.
  - `pnpm test --run src/components/triage/selected-scratch-context.test.tsx src/components/triage/breakdown-panel.test.tsx` passes.
- **Commit:** `feat(phase-30): add scratch completion state`

### Task 138: Idempotent Archive command and reconciliation hook

- **Status:** `[ ]`
- **Dependencies:** Tasks 104 and 136.
- **Files:** `src/lib/db/datastore.ts` (Inbox Archive command), `src/lib/db/indexeddb.ts` (one-transaction eligibility/version revalidation), `src/hooks/use-archive-scratch.ts` (authoritative command/pending/retry/reconciliation), `src/hooks/use-archive.test.ts`, `src/lib/db/archive.test.ts`, `src/lib/db/triage-commands.test.ts` (extend)
- **Actions:**
  - Revalidate persisted eligibility and Scratch Bit version in the same transaction that sets `archivedAt` and increments Bit version exactly once.
  - Keep operation idempotent and distinguish `already_applied`, conflict, invalid, and not-found. Unknown outcomes reconcile archive postconditions before selection changes.
  - Preserve Archive View restore semantics and never auto-navigate there.
- **Acceptance:**
  - Repeated Archive Confirm archives once and increments Scratch version once.
  - A candidate/active row/version change before commit rejects Archive with no partial lifecycle write.
  - `pnpm test --run src/hooks/use-archive.test.ts src/lib/db/archive.test.ts src/lib/db/triage-commands.test.ts` passes.
- **Commit:** `feat(phase-30): make scratch archive authoritative`

### Task 139: Breakdown-scoped Archive overlay and success selection

- **Status:** `[ ]`
- **Dependencies:** Tasks 137 and 138.
- **Files:** `src/components/triage/archive-completion-affordance.tsx` (create), `src/components/triage/breakdown-panel.tsx` (Breakdown-only veil/mount), `src/components/triage/triage-workspace.tsx` (selection/navigation locks), `src/components/triage/archive-completion-affordance.test.tsx` (create), `src/components/triage/triage-workspace.test.tsx` (extend)
- **Recipe:** `docs/recipes/inbox-triage-archive-completion-visual-recipe.md`
- **Actions:**
  - Dim/blur and disable only Breakdown content, then layer a named non-modal Archive region over it with Archive and Cancel. Never cover Scratch Pool, Staging, Grid Explorer, or the viewport.
  - Keep the same surface mounted for pending/reconciling/failure; lock Cancel/Undo/Edit/Placement/navigation while pending, and expose Retry plus Cancel on explicit failure.
  - On success remove the Scratch only after authoritative confirmation, then select next visible, previous visible, filtered no-results, or Inbox empty state in that order without navigating to Archive View.
  - Announce auto-open politely without stealing current Grid/placement focus; reopen focuses heading or safe Cancel.
- **Acceptance:**
  - The running overlay matches the recipe's Breakdown-only veil and panel hierarchy; Graphite visibly blurs/dims Breakdown and no full-screen modal appears.
  - Cancel/Escape, reopen, pending, failure, reconciliation, eligibility loss, and success all keep the expected focus and controls.
  - No five-second timer, auto-archive, decorative emoji, or repeating pulse/blink exists.
  - `pnpm test --run src/components/triage/archive-completion-affordance.test.tsx src/components/triage/triage-workspace.test.tsx` passes.
- **Commit:** `feat(phase-30): render breakdown archive flow`

### Task 140: Completion and Archive integration gate

- **Status:** `[ ]`
- **Dependencies:** Tasks 136–139.
- **Files:** `src/components/triage/triage-workspace.test.tsx`, `src/components/triage/archive-completion-affordance.test.tsx`, `src/hooks/use-can-archive-scratch.test.ts`, `src/hooks/use-archive.test.ts`, `src/lib/db/triage-commands.test.ts`, `tests/e2e/inbox-triage-archive.spec.ts` (create)
- **Recipe:** `docs/recipes/inbox-triage-archive-completion-visual-recipe.md`
- **Actions:**
  - Trace false-to-true transition, blockers, Cancel/Escape, Scratch switch/re-entry/reload, reopen, Undo-driven eligibility loss, pending/failure/reconciliation, filter-sensitive next selection, last-Scratch empty state, and Archive View restoration.
  - Verify Escape outside the named Archive region is a no-op; Escape from inside cancels and focuses reopen. When final-row Delete opened the overlay from a removed focused control, focus its heading instead of preserving stale focus.
  - Force reload during pending Archive and reconcile to exactly one of: authoritative success destination, completed/reopen when execution did not occur, or a Breakdown-scoped recovery overlay while outcome remains unresolved.
  - Verify completion is never inferred from empty arrays alone and no status is announced twice for `already_applied`.
  - Run focused tests, E2E flow, and production build.
- **Acceptance:**
  - Stage-only and delete-only emptiness never show Archive; consumed evidence with no active/candidate rows does.
  - Archive success removes only the confirmed Scratch from active Inbox and leaves restorable data in Archive View.
  - Escape is focus-scoped, final-row Delete focuses the Archive heading, and forced reload never duplicates Archive or loses the recoverable destination/state.
  - `pnpm test --run src/components/triage src/hooks/use-can-archive-scratch.test.ts src/hooks/use-archive.test.ts src/lib/db/triage-commands.test.ts`, `pnpm test:e2e -- tests/e2e/inbox-triage-archive.spec.ts`, and `pnpm build` pass.
- **Commit:** `test(phase-30): verify triage completion archive flows`

#### Phase 30 Notes

- The generic DESIGN_TOKENS Blur + Overlay pattern is not authority for this surface; the approved Breakdown-scoped archive recipe is.

## Phase 31: Eight-Theme Realization — Shell Through Staging

> **Purpose:** Apply the approved 2-3 visual evidence to the shared production shell, Scratch Pool, Selected Context, Breakdown, and Staging without copying prototype architecture.
> **Dependencies:** Phases 24–26 and 30 complete.
> **Canonical refs:** DESIGN_TOKENS.md §§ Inbox / Triage Batch 2 Surface Contract, Inbox / Triage Motion Mapping; SPEC.md Architecture Decision 23.
> **Recipe index:** `docs/recipes/inbox-triage-visual-recipe-index.md`

### Task 141: Shared theme hooks, state matrix, and copy aliases

- **Status:** `[ ]`
- **Dependencies:** Phases 24–26 and 30 complete.
- **Files:** `src/app/globals.css` (add shared Inbox theme selectors/variables), `src/components/triage/triage-workspace.tsx` (ensure semantic surface/state hooks), `src/lib/copy/inbox-triage.ts` (theme display-alias resolver), `src/app/theme-transition.test.ts` (extend), `src/components/triage/triage-workspace.test.tsx` (extend)
- **Recipes:** all recipes listed by `docs/recipes/inbox-triage-visual-recipe-index.md`.
- **Actions:**
  - Establish reusable selectors for `data-triage-surface` and `data-triage-state` across all eight color themes. Keep selected, staged, invalid, pending, newly placed, and completed as six distinguishable semantic states rather than one opacity/color treatment.
  - Map theme-specific display aliases through the copy resolver while preserving stable semantic/accessibility names; components do not branch into eight route implementations.
  - Keep ambient semantic treatment static. Direct manipulation may use each theme's approved motion; reduced motion removes non-essential transition.
- **Acceptance:**
  - One shared component tree renders all themes; no production theme route or duplicated mutation handler is introduced.
  - A test matrix proves every theme has mappings for all required surfaces/states and that the six states do not collapse into one shared rule.
  - `Library Index`, `Finder`, and terminal aliases never replace the accessible name `Grid Explorer`.
  - `pnpm test --run src/app/theme-transition.test.ts src/components/triage/triage-workspace.test.tsx` passes.
- **Commit:** `feat(phase-31): add triage theme state contracts`

### Task 142: Workspace shell and visible section chrome realization

- **Status:** `[ ]`
- **Dependencies:** Task 141.
- **Files:** `src/app/globals.css` (theme shell/panel/chrome rules), `src/components/triage/triage-workspace.tsx` (shared structural hooks only), `src/components/triage/triage-workspace.test.tsx` (extend)
- **Recipe:** `docs/recipes/inbox-triage-shell-section-chrome-visual-recipe.md`
- **Actions:**
  - Realize GridDO thin technical panels, Tiny Desk paper, Neumorphism soft depth, Clay puffy surfaces, Origami folds, Terminal CLI frames, Retro Mac System 7 windows, and Graphite half-pixel editorial lines through shared selectors/tokens.
  - Preserve visible labels, fixed ratios, theme width/gap mappings, stable overflow containment, and hidden scrollbar chrome.
  - Verify a theme-switch continuity matrix for selected Scratch, Pool query/collapse/scroll, Add/Edit draft, Grid path/search/reveal/interrupted query, open Placement/Archive, pending/reconciling operation ID, Newly Placed/Undo, and completion. Keep focus on the theme toggle, do not blur-save/cancel/navigate, and issue no additional mutation.
  - Remove every prototype-only switcher, lock/test control, duplicate Terminal Grid title row, and decorative metadata that replaces a semantic label.
- **Acceptance:**
  - Switching among all eight themes preserves every named continuity-matrix state and operation ID, keeps focus on the toggle, and produces no blur-save, cancellation, navigation, or duplicate mutation.
  - GridDO/Tiny/Origami/Terminal/Retro use compact `16px`-family gaps while tactile/editorial themes preserve approved `20–24px` mapping without breaking the viewport.
  - Every section label remains visible, readable, and non-overlapping in light/dark variants.
  - `pnpm test --run src/app/theme-transition.test.ts src/components/triage/triage-workspace.test.tsx` passes.
- **Commit:** `feat(phase-31): realize triage shell across themes`

### Task 143: Scratch Pool eight-theme realization

- **Status:** `[ ]`
- **Dependencies:** Tasks 141 and 142.
- **Files:** `src/app/globals.css` (Scratch theme rules), `src/components/triage/scratch-pool.tsx` (semantic hooks/ornament slots only), `src/components/triage/scratch-pool.test.tsx` (extend)
- **Recipe:** `docs/recipes/inbox-triage-scratch-pool-visual-recipe.md`
- **Actions:**
  - Implement each recipe's expanded/collapsed width, tool density, search/sort treatment, selected Scratch grammar, and stable vertical switcher marker through theme CSS and shared markup.
  - Preserve persistent non-hover sort distinction, selected contrast, one-row search/sort, and query-preserving collapse behavior.
  - Ensure Tiny Desk inner dot remains visible, Neumorphism uses fixed dots plus one raised slider, and no full-width selected strip or repeating active-marker animation causes layout shift.
- **Acceptance:**
  - Each theme's expanded and collapsed Pool matches its approved surface/marker family while all controls retain identical behavior and accessible names.
  - The longest current title/count/control copy fits without overlap at every approved collapsed width.
  - No scrollbar chrome, numbered variant UI, Sidebar fold lock, or test mode appears.
  - `pnpm test --run src/components/triage/scratch-pool.test.tsx src/app/theme-transition.test.ts` passes.
- **Commit:** `feat(phase-31): theme scratch pool surfaces`

### Task 144: Selected Context and Breakdown eight-theme realization

- **Status:** `[ ]`
- **Dependencies:** Tasks 141 and 142; Phases 25 and 30 complete.
- **Files:** `src/app/globals.css` (Context/Breakdown theme rules), `src/components/triage/selected-scratch-context.tsx`, `src/components/triage/breakdown-panel.tsx` (semantic hooks/ornament slots only), `src/components/triage/selected-scratch-context.test.tsx`, `src/components/triage/breakdown-panel.test.tsx` (extend)
- **Recipes:** `docs/recipes/inbox-triage-selected-scratch-context-visual-recipe.md`, `docs/recipes/inbox-triage-breakdown-visual-recipe.md`
- **Actions:**
  - Realize all eight signature Context surfaces at the approved `2–2.5x` row prominence with dominant title, secondary time, stable Edit/sort group, and same-surface completed treatment.
  - Realize active/deleting/staged Breakdown rows, always-visible theme-specific Edit/Trash controls, entry/completion prompts, fixed Add footer, and one-time Add/Unstage success signal.
  - Keep row numbering/time absent, consumed rows absent, staged rows de-emphasized without strike-through, and all pulse/bounce/blink removed.
- **Acceptance:**
  - Context never reads as a draggable row and preserves at least one exact recipe construction per theme (paper rules, inset well, editor frame, double dialog border, or editorial line family).
  - Staged, pending/deleting, and active rows remain distinguishable without color alone; controls do not jump on hover.
  - Context normal/completed states stay within one component and all new copy comes from the feature copy module.
  - `pnpm test --run src/components/triage/selected-scratch-context.test.tsx src/components/triage/breakdown-panel.test.tsx` passes.
- **Commit:** `feat(phase-31): theme context and breakdown surfaces`

### Task 145: Staging eight-theme realization and Batch A visual gate

- **Status:** `[ ]`
- **Dependencies:** Tasks 141–144.
- **Files:** `src/app/globals.css` (Staging/candidate/pending/error theme rules), `src/components/triage/staging-zone.tsx`, `src/components/triage/triage-drag-token.tsx` (semantic hooks only), `src/components/triage/staging-zone.test.tsx`, `src/components/triage/triage-drag-token.test.tsx`, `docs/reviews/phase-31-inbox-triage-visual-review.md` (create evidence record)
- **Recipe:** `docs/recipes/inbox-triage-staging-visual-recipe.md`
- **Actions:**
  - Realize theme-specific Node object cards, Bit rows, pending candidate treatment, section-local alert, drop-back signal, unstage overlay, and compact drag token while retaining shared current Node/Bit grammar.
  - Keep candidate cards full-surface draggable with no Grip; prevent Clay vertical squash/delay and Tiny Desk default rotation.
  - Capture and review all eight themes in expanded/collapsed Scratch and normal/pending/staged states; record meaningful deviations and one correction pass.
- **Acceptance:**
  - Node/Bit remain structurally distinct across all themes and pending state uses the same candidate card grammar rather than a new card.
  - Full-card drag from any point yields one stable type-specific pill; no blink/flicker or repeated pulse appears.
  - The Phase 31 review records all eight theme checks, light/dark contrast exceptions, reduced-motion behavior, and recipe deviations.
  - `pnpm test --run src/components/triage/staging-zone.test.tsx src/components/triage/triage-drag-token.test.tsx src/app/theme-transition.test.ts` and `pnpm build` pass.
- **Commit:** `feat(phase-31): theme staging and verify batch a`

#### Phase 31 Notes

- Prototype CSS values are evidence, not code to copy. Shared production selectors and tokens own the realization.
- The future shared BitCard redesign and Neumorphism water-lens sort treatment remain outside this phase.

## Phase 32: Eight-Theme Realization — Grid Through Archive

> **Purpose:** Complete normal Grid, placement, Newly Placed/Undo, and Archive theme realization, then verify the six semantic states across all eight themes.
> **Dependencies:** Phases 27–31 complete.
> **Canonical refs:** DESIGN_TOKENS.md §§ Grid Explorer And Search, DnD States, Newly Placed And Undo, Completion And Archive.
> **Recipe index:** `docs/recipes/inbox-triage-visual-recipe-index.md`

### Task 146: Grid Explorer chrome, cards, and drop-signal realization

- **Status:** `[ ]`
- **Dependencies:** Phases 27, 28, and 31 complete.
- **Files:** `src/app/globals.css` (Grid/column/search-result/selected/invalid theme rules), `src/components/triage/hierarchy-explorer.tsx` (semantic hooks/alias slot only), `src/components/triage/grid-explorer-search.tsx` (theme hooks only), `src/lib/copy/inbox-triage.ts` (approved display aliases), `src/components/triage/hierarchy-explorer.test.tsx`, `src/components/triage/grid-explorer-search.test.tsx`, `src/app/theme-transition.test.ts` (extend)
- **Recipes:** `docs/recipes/inbox-triage-grid-explorer-visual-recipe.md` and the approved `docs/recipes/inbox-triage-grid-explorer-search-results-visual-recipe.md`
- **Actions:**
  - Realize one header and four stable column surfaces per theme with full labels, Node-before-Bits structure, selected treatment, hidden scrollbar chrome, and placement scroll padding.
  - Display `Grid Explorer` by default, Tiny Desk `Library Index`, Retro Mac `Finder`, and terminal display alias through centralized copy while semantic name remains `Grid Explorer`.
  - Apply the Task 121-approved empty guidance, no-results, result, duplicate, loading, stale, and error realization to all eight themes without changing the shared search component's behavior or information hierarchy.
  - Remove magnifier decoration from normal Grid menu, Origami `H1-L4`, Terminal's duplicate upper row, active-column dim/filter, numbered variants, and test mode.
  - Apply immediate invalid background/depth signals and sharp pointer-entry warnings without changing column titles or blurring/dimming the warning layer.
- **Acceptance:**
  - Four columns remain fixed and independently scrollable through Level 3; normal selection is distinct from invalid and Newly Placed states.
  - Retro Mac warning leaves `Home`/`Level 1–3` visible; Clay and all blurred themes keep warning text sharp.
  - Visible aliases and semantic names meet the recipe/SPEC split.
  - Every search state matches its approved theme family and remains visually distinct from normal four-column mode.
  - `pnpm test --run src/components/triage/hierarchy-explorer.test.tsx src/components/triage/grid-explorer-search.test.tsx src/app/theme-transition.test.ts` passes.
- **Commit:** `feat(phase-32): theme grid explorer states`

### Task 147: Placement affordance eight-theme realization

- **Status:** `[ ]`
- **Dependencies:** Task 146.
- **Files:** `src/app/globals.css` (direct-choice/confirmation/warning theme rules), `src/components/triage/placement-affordance.tsx` (semantic hooks/ornament slots only), `src/components/triage/placement-affordance.test.tsx` (extend)
- **Recipe:** `docs/recipes/inbox-triage-placement-affordances-visual-recipe.md`
- **Actions:**
  - Realize all eight opaque direct-choice surfaces and confirmation surfaces using the recipe's technical card, paper memo, soft well, clay capsule, folded strip, ASCII block, System 7 dialog, and editorial strip families.
  - Keep pending treatment static, warning readable above background effects, explicit Confirm/Cancel order, full-target reason, and column scroll ownership.
  - Do not restore Glassmorphism H10 layers, emoji, rotating borders, pulse/ping/bounce/blink, full-screen dialogs, or automatic target correction.
- **Acceptance:**
  - Direct choice is visually separate from confirmation in every theme, while staged flow opens confirmation directly.
  - Confirm/Cancel remain reachable at the bottom of an overflowing column in all eight themes.
  - Terminal uses the approved red No/Cancel and foreground Yes/Confirm treatment; Retro Mac uses the approved opaque bordered dialog.
  - `pnpm test --run src/components/triage/placement-affordance.test.tsx src/components/triage/hierarchy-explorer.test.tsx` passes.
- **Commit:** `feat(phase-32): theme placement affordances`

### Task 148: Newly Placed and Undo eight-theme realization

- **Status:** `[ ]`
- **Dependencies:** Tasks 146 and 147; Phase 29 complete.
- **Files:** `src/app/globals.css` (marker/Undo theme rules), `src/components/grid/node-card.tsx`, `src/components/grid/bit-card.tsx`, `src/components/triage/hierarchy-explorer.tsx` (semantic hooks only), `src/components/grid/node-card.test.tsx`, `src/components/grid/bit-card.test.tsx`, `src/components/triage/hierarchy-explorer.test.tsx` (extend)
- **Recipe:** `docs/recipes/inbox-triage-newly-placed-undo-visual-recipe.md`
- **Actions:**
  - Implement each static marker family: GridDO dot/tag, Tiny fastener/tab, Neumorphism bulb/raised depth, Clay LED/tag, Origami folded corner, Terminal `[new]`, Retro Mac `[NEW]`, Graphite editorial tag.
  - Theme the stable trailing Undo slot without changing existing Node/Bit geometry or internal distinction; preserve selected + newly placed composition.
  - Remove every pulse, temporary indicator card, checkbox, title-matching projection, and test mock injection.
- **Acceptance:**
  - Node and Bit retain identical base padding/radius/color rules to their ordinary counterparts while their existing internal Node/Bit differences remain.
  - Marker and Undo remain visible over selected treatment and are clearly different from selected-only cards in every theme.
  - No repeating attention animation runs; reduced motion still reveals/focuses the result accessibly.
  - `pnpm test --run src/components/grid/node-card.test.tsx src/components/grid/bit-card.test.tsx src/components/triage/hierarchy-explorer.test.tsx` passes.
- **Commit:** `feat(phase-32): theme newly placed undo states`

### Task 149: Completion and Archive eight-theme realization

- **Status:** `[ ]`
- **Dependencies:** Task 146; Phase 30 complete.
- **Files:** `src/app/globals.css` (Breakdown veil/archive/completed Context/reopen theme rules), `src/components/triage/archive-completion-affordance.tsx`, `src/components/triage/selected-scratch-context.tsx`, `src/components/triage/breakdown-panel.tsx` (semantic hooks only), `src/components/triage/archive-completion-affordance.test.tsx`, `src/components/triage/selected-scratch-context.test.tsx` (extend)
- **Recipes:** `docs/recipes/inbox-triage-archive-completion-visual-recipe.md`, `docs/recipes/inbox-triage-selected-scratch-context-visual-recipe.md`
- **Actions:**
  - Apply each approved Breakdown-only veil, archive panel, completed Context, and reopen action family while leaving Scratch Pool, Staging, Grid, and viewport untouched.
  - Keep overlay open/pending/failure/reconciliation states in the same themed surface and preserve sharp readable status/focus.
  - Remove global dialogs, five-second timers, emoji, auto-archive, repeat pulse/bounce/blink, and any reopen control while overlay is open.
- **Acceptance:**
  - All eight themes visibly dim/blur only Breakdown as specified; Terminal may use its approved opaque veil while Graphite must show its approved veil.
  - Cancel produces the theme-specific completed Context/reopen state and a new row returns to normal without style residue.
  - Archive pending/failure remains readable and controls do not overlap or escape the section.
  - `pnpm test --run src/components/triage/archive-completion-affordance.test.tsx src/components/triage/selected-scratch-context.test.tsx src/components/triage/breakdown-panel.test.tsx` passes.
- **Commit:** `feat(phase-32): theme completion archive surfaces`

### Task 150: Eight-theme six-state visual and accessibility gate

- **Status:** `[ ]`
- **Dependencies:** Tasks 146–149.
- **Files:** `tests/e2e/inbox-triage-theme-matrix.spec.ts` (create), `docs/reviews/phase-32-inbox-triage-theme-matrix.md` (create), `docs/reviews/assets/phase-32/` (create durable screenshots), `src/app/theme-transition.test.ts` (final selector audit)
- **Recipes:** all nine approved Inbox/Triage surface recipes plus the approved Phase 27 search-result recipe.
- **Actions:**
  - Capture all eight themes at stable desktop viewport(s), light/dark where supported, across selected, staged, invalid, pending confirmation, newly placed, and completed states. Compare against durable source screenshots and recipe facts, not prototype code structure.
  - Check nonblank rendering, region framing, overflow/scroll reachability, no overlap, text fit, focus-visible, contrast, semantic names, and reduced motion. Run one focused correction pass for meaningful deviations.
  - Record fidelity escalation where source evidence cannot establish animation/depth; do not invent missing effects.
- **Acceptance:**
  - The 8×6 matrix has no missing or visually conflated state and contains no blink/flicker/repeated pulse.
  - Every screenshot shows the four-region shell correctly framed and every column/overlay action reachable without visible scrollbar chrome.
  - The review records pass/deviation/correction evidence and preserves source/implementation screenshot provenance.
  - `pnpm test:e2e -- tests/e2e/inbox-triage-theme-matrix.spec.ts`, `pnpm test --run src/app/theme-transition.test.ts`, and `pnpm build` pass.
- **Commit:** `test(phase-32): verify triage theme matrix`

#### Phase 32 Notes

- Theme fidelity never overrides functional, accessibility, or lifecycle authority in SCHEMA.md/SPEC.md.

## Phase 33: Inbox / Triage Promotion Verification

> **Purpose:** Prove the promoted persistence, user flows, accessibility, theme realization, and deferred-scope boundaries as one production-quality Inbox/Triage system.
> **Dependencies:** Phases 23–32 complete.
> **Canonical refs:** SCHEMA.md, SPEC.md, DESIGN_TOKENS.md, PLANNING_STANDARD.md, and all Inbox/Triage surface recipes.

### Task 151: Persistence and atomic-command conformance sweep

- **Status:** `[ ]`
- **Dependencies:** Phases 23–30 complete.
- **Files:** `src/lib/db/triage-commands.test.ts`, `src/lib/db/indexeddb.schema-v4-upgrade.test.ts`, `src/lib/db/indexeddb.migration.test.ts`, `src/lib/db/indexeddb.test.ts`, all Bit cascade/archive/restore tests (extend as gaps require), `docs/reviews/phase-33-triage-conformance.md` (create)
- **Actions:**
  - Audit every Bit create/write path for `version = 1` and exactly-one logical increment, including all named direct and Hook 1/3/10/11 cascade paths.
  - Fault-inject Add/Edit/Delete, Stage/Unstage, staged/direct Placement, Undo, and Archive transactions to prove no partial success, stable-ID idempotency, CAS, and authoritative reconciliation.
  - Prove candidate source uniqueness, route/reload durability, consumed-evidence archive guard, and absence of persistent Newly Placed fields.
- **Acceptance:**
  - The conformance report maps every SCHEMA mutation contract to passing tests and lists no unowned write path.
  - Both missing and duplicate Bit revision increments are mechanically caught.
  - `pnpm test --run src/lib/db` passes.
- **Commit:** `test(phase-33): audit triage persistence conformance`

### Task 152: End-to-end Inbox user-flow verification

- **Status:** `[ ]`
- **Dependencies:** Phases 24–30 complete.
- **Files:** `tests/e2e/inbox-triage-workspace.spec.ts` (create), `tests/e2e/inbox-triage-search.spec.ts`, `tests/e2e/inbox-triage-placement.spec.ts`, `tests/e2e/inbox-triage-archive.spec.ts` (extend), `docs/reviews/phase-33-triage-flow-review.md` (create)
- **Actions:**
  - Trace Scratch selection/search/collapse, Context edit/conflict, Breakdown Add/Edit/Delete, durable Stage/Unstage/drop-back, whole-hierarchy search/reveal/interruption, staged/direct Placement, Newly Placed/Undo, and Completion/Archive.
  - Cover dirty/pending navigation guards, filter-sensitive selection fallback, reload/re-entry, full/stale target, injected command failure, unknown-outcome reconciliation, and Archive View restore.
  - Map every SPEC user flow and boundary case to an owning phase/task and E2E assertion, including route focus, Pool pressure/hidden selection/sort persistence, external Scratch removal, edit guard matrix, DnD cancellation, open-flow remote invalidation, full target, dirty-title unload, follow-up child placement, search Undo, and Archive reload/focus.
- **Acceptance:**
  - The flow review reports no unowned user-visible path and no active dependency on deferred scope.
  - Every flow-review row has an E2E assertion for trigger, visible outcome, focus destination, and unchanged-record guarantee where applicable; no meta-only coverage substitutes for those observations.
  - `pnpm test:e2e -- tests/e2e/inbox-triage-workspace.spec.ts tests/e2e/inbox-triage-search.spec.ts tests/e2e/inbox-triage-placement.spec.ts tests/e2e/inbox-triage-archive.spec.ts` passes.
- **Commit:** `test(phase-33): verify inbox triage user flows`

### Task 153: Accessibility, focus, motion, and theme conformance

- **Status:** `[ ]`
- **Dependencies:** Phases 31 and 32 complete.
- **Files:** `tests/e2e/inbox-triage-theme-matrix.spec.ts` (extend), `src/components/triage/triage-workspace.test.tsx`, `src/components/triage/scratch-pool.test.tsx`, `src/components/triage/selected-scratch-context.test.tsx`, `src/components/triage/breakdown-panel.test.tsx`, `src/components/triage/staging-zone.test.tsx`, `src/components/triage/grid-explorer-search.test.tsx`, `src/components/triage/hierarchy-explorer.test.tsx`, `src/components/triage/placement-affordance.test.tsx`, `src/components/triage/archive-completion-affordance.test.tsx` (extend only where gaps are found), `docs/reviews/phase-33-triage-accessibility.md` (create), `src/app/theme-transition.test.ts` (final audit)
- **Actions:**
  - Verify keyboard operation for every non-DnD control, explicit pointer-only Placement boundary, focus entry/return/fallback, modal/region semantics, polite/assertive announcements, icon names, error reasons, and interrupted search.
  - Verify all eight themes in light/dark and reduced motion for contrast, selected/staged/invalid/pending/newly/completed distinction, static attention treatment, hidden scrollbar chrome with functional scrolling, and no overlap.
  - Repeat Task 142's theme-switch continuity matrix in browser coverage and assert the focused toggle, operation ID, draft/search/affordance/session state, and mutation count remain unchanged across all eight themes.
  - Confirm theme aliases preserve semantic names and component logic does not branch into eight implementations.
- **Acceptance:**
  - No focus trap, inaccessible icon-only control, color-only status, blurred warning, or repeated attention animation remains.
  - Theme switching during each named transient/pending state preserves focus and state and issues zero additional domain mutations.
  - Pointer-only placement is documented and no nonfunctional keyboard shortcut/action is exposed.
  - `pnpm test:e2e -- tests/e2e/inbox-triage-theme-matrix.spec.ts` and `pnpm test --run src/components/triage src/app/theme-transition.test.ts` pass.
- **Commit:** `test(phase-33): verify triage accessibility and themes`

### Task 154: Final build, scope, and handoff gate

- **Status:** `[ ]`
- **Dependencies:** Tasks 151–153.
- **Files:** `docs/reviews/phase-33-triage-conformance.md`, `docs/reviews/phase-33-triage-flow-review.md`, `docs/reviews/phase-33-triage-accessibility.md` (finalize), `docs/EXECUTION_PLAN.md` (Phase 33 status/archive update only during closing-phase)
- **Actions:**
  - Run formatting/linting if configured, full Vitest, all Inbox E2E, and production build; record exact commands and results.
  - Run architecture conformance against PLANNING_STANDARD: DataStore/reactive boundaries, version rules, durable candidates, atomic commands, dedicated search, transient Newly Placed, recipe/theme ownership, and centralized copy.
  - Confirm excluded work remains absent: shared BitCard redesign, EN/KR implementation, water-lens, text-capacity/IME policy, keyboard Placement entry, prototype routes/test controls, and copied spaghetti state.
  - Prepare closing-phase evidence and archive only after every prior task and user-visible verification is complete.
- **Acceptance:**
  - `pnpm test`, all Inbox/Triage E2E specs, and `pnpm build` pass from a clean implementation worktree.
  - Review artifacts contain no blocking gaps or false-completion claims.
  - Phase 33 can close and archive through the scaled workflow without rewriting prior Phase archives or frozen Phase 15/17/18/22 history.
- **Commit:** `chore(phase-33): close inbox triage promotion`

#### Phase 33 Notes

- This gate verifies the promoted scope only. Deferred topics return through their own DECISION/promotion workflow.

---

## Cross-Cutting Concerns

These apply across all phases:

- **Two-layer data abstraction (critical PRD constraint):** Data access has two independent abstraction boundaries, both replaceable for v2 cloud sync:
  1. **CRUD layer — DataStore interface** (`src/lib/db/datastore.ts`): All write operations (create, update, delete) go through this interface. v1 implementation: `src/lib/db/indexeddb.ts`.
  2. **Reactive layer — custom hooks** (`src/hooks/use-*.ts`): All read subscriptions go through these hooks. v1 implementation uses Dexie `useLiveQuery` internally. Components never import DataStore or Dexie directly — they import hooks only.
  - For v2 migration: swap the DataStore implementation (e.g., to Supabase) AND swap the reactive internals (e.g., `useLiveQuery` → React Query). Component code stays unchanged.
- **Design tokens:** Use semantic classes from DESIGN_TOKENS.md. All colors via CSS variables — no hardcoded hex. Reference: `bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`, `bg-priority-{high,mid,low}-bg`, `text-priority-{high,mid,low}`, `bg-urgency-{1,2,3}`.
- **Computed values:** Aging state, urgency level, node completion, bit progress — computed at render time via pure utility functions. Never stored in the database (SPEC decision #6).
- **URL-driven state:** Grid level via route (`/`, `/grid/[nodeId]`). Bit detail via query param (`?bit=[bitId]`). Browser back/forward navigation works naturally.
- **Reactive updates and command completion:** All data reads that feed UI use custom reactive hooks. Ordinary local writes remain fast, but Inbox/Triage Add/Edit/Delete, Stage/Unstage, Placement, Undo, and Archive expose pending/reconciling state and commit UI outcomes only after an authoritative command result or postcondition read. Components do not infer success from Dexie latency or compose multi-record writes.
- **Zod at write boundary:** Validate data with Zod schemas on create/update operations. Data read from the store is trusted — no runtime validation on reads (SPEC decision #7).
- **Bit revision contract:** Every Bit create path starts at `version = 1`. Every successful logical content, position, completion, or lifecycle mutation of an existing Bit increments `version` exactly once, including direct writes and Hook 1/3/10/11 cascades. Nodes intentionally remain outside this revision scope in this promotion.
- **Durable Triage candidates:** Staged Node/Bit candidates are persisted, Scratch-scoped domain records behind DataStore commands and reactive hooks. `triage-store` owns disposable presentation state only; it never becomes a second candidate truth.
- **Atomic Triage commands:** Stage, Unstage, staged/direct Placement, source-aware Undo, and Archive are single repository transactions with stable operation/result IDs, compare-and-set predicates, idempotent retry, and authoritative reconciliation. Partial success is forbidden.
- **Dedicated Grid Explorer search:** Inbox search traverses the reachable active hierarchy through its own query model and hook. Do not reuse the global `searchAll()` result shape. The user-facing result realization must complete Phase 27's Decision prerequisite before result UI implementation begins.
- **Page-session placement projection:** Newly Placed markers, pinning, and Undo provenance are transient Inbox page-session metadata keyed by operation/result IDs. They survive Scratch, column, theme, and locale changes, but end on route exit or reload without changing the created Node/Bit.
- **Theme realization:** Production uses one shared Triage component tree and semantic `data-triage-*` hooks. Theme differences flow through CSS variables, shared theme classes, approved visual recipes, and locale/copy resolvers rather than duplicated routes or per-theme mutation handlers.
- **Grid cell uniqueness (Hook 8):** Always check `(parentId, x, y)` occupancy before insert or move. Ordinary Grid create/move flows may use BFS auto-placement when the requested position is occupied. Inbox/Triage Placement is the explicit exception: a full destination keeps the Placement affordance open with a direct reason and disabled Confirm; it never redirects through BFS.
- **Testing:** Vitest for unit tests. Pure utility functions (T6) and application hooks (T24, T25, T32) require passing unit tests as acceptance criteria. Test files co-located with source: `src/lib/utils/*.test.ts`, `src/lib/db/*.test.ts`.
- **Accessibility:** `prefers-reduced-motion` disables all animations. Focus management on modals (search overlay, bit detail, dialogs). `aria-labels` on icon-only sidebar buttons. Keyboard navigation for search results.
- **ESC key priority (innermost-first):** Search overlay > Bit detail popup > Calendar column expand > Edit mode. **Implementation:** The search overlay handler (highest priority) calls `e.stopPropagation()` after closing, preventing the event from reaching lower handlers. Each lower handler checks its own open state before consuming the event. Owned by Task 33 (search overlay) — the stopPropagation pattern must be in place before lower-priority handlers can be considered correct.
- **BFS origin rule:** For ordinary Grid creation, Node BFS starts at `(0, 0)` and Bit BFS at `(GRID_COLS-1, 0)`. Empty-cell `+` starts at `(clickedX, clickedY)` regardless of type and uses nearest fallback if occupied. Inbox/Triage Placement does not use this fallback when its confirmed target is full.
- **Non-features (PRD Section 26):** Do NOT implement: Mascot System, Labs, AI-Powered Search, Responsive Design, Onboarding Enhancement. These are explicitly deferred.
- **Promotion exclusions:** Do not add the deferred shared BitCard redesign, EN/KR resources or locale toggle, Neumorphism water-lens sort treatment, cross-surface text-capacity/IME policy, keyboard Placement picker, prototype theme/test switchers, numbered variant controls, or copied prototype state/mutation architecture.
- **Doc authority:** SCHEMA.md = data model source of truth. SPEC.md = architecture/routes/components. DESIGN_TOKENS.md = visual values. This file = execution order. PRD = historical context, non-authoritative for implementation.
