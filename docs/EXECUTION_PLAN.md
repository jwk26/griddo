# GridDO Inbox/Triage Implementation Execution Plan

> **Status:** **User-approved 2026-07-28 — planning authority only**
> **Approval receipt:** the user approved the exact pre-receipt plan committed at
> `c9a2112f8554026510ac1135cfb7c3243d337151`, whose SHA-256 is
> `052ca15b137fbbc3e9f89d926b4afd0a8eef60c08aa135985f005e6c944eb9db`.
> This receipt accepts the clean Phase 23–31 / Task 101–165 planning graph and
> its supersession rules. It accepts no phase, task, implementation, branch,
> publication, or completion state.
> **Task markers:** Tasks 101–105A were explicitly accepted and are archived as
> Phase 23. Tasks 106–165 remain open (`[ ]`) and may be checked only after
> their own observable acceptance and verification evidence is explicitly
> accepted by the user.
> **Execution lifecycle:** Phase 23 execution is complete. Phase 24 still
> requires its own approved kickoff; this planning receipt alone does not
> authorize later implementation, Git lifecycle work, or publication.

## Goal

Implement the approved Inbox/Triage workspace as one production component tree with a validated Dexie v4 model, monotonic revisions, real all-or-nothing transactions, durable candidates, lifetime-correct UI state, dedicated Explorer search, pointer placement, source-aware Undo, guarded Archive recovery, and source-backed eight-theme presentation without inventing any unresolved visual or content decision.

## Execution Plan Approval Receipt

- **Gate:** the complete clean-room execution graph in this document.
- **User disposition:** approved on 2026-07-28 after Ultra clean-context
  derivation and consolidated review.
- **Approved artifact:** content commit
  `c9a2112f8554026510ac1135cfb7c3243d337151`, containing the exact
  pre-receipt `docs/EXECUTION_PLAN.md` whose SHA-256 is
  `052ca15b137fbbc3e9f89d926b4afd0a8eef60c08aa135985f005e6c944eb9db`.
- **Approved scope:** active Phases 23–31, open Tasks 101–165, reserved Phases
  32–33, next numbers Phase 34 / Task 166, fourteen Decision-prerequisite
  receipts for twelve VQs, and the declared writer/mutex and evidence rules.
- **Supersession:** the prior open Phase 23–33 / Task 101–154 planning graph is
  wholly superseded; none of its task meanings remains independently active.
- **Preserved boundary:** all task markers remain open. This receipt does not
  onboard `run-phase`, `run-task`, or `end-phase`, authorize code or Git
  lifecycle work, resolve any `VQ-*`, or mark implementation complete.
- **Next legal action:** derive a fresh flow review from this approved plan and
  the approved canonical authority chain, then stop at its user gate.

## Architecture

The DataStore/Dexie repository owns durable truth, Zod write validation, complete atomic postconditions, and reconciliation. Reactive hooks project repository truth into the UI; app-session, mounted-page, forced-reload, and device-preference state remain with their canonical lifetime owners. Components compose semantic roles and interactions but do not sequence repository writes, persist candidates, reuse global Search for Explorer, or branch on theme ID.

Phase grouping is organizational, never a blanket dependency chain. Each task names its exact prerequisites. Decision-prerequisite tasks block only their listed receipt edge; unrelated data, headless behavior, and source-backed UI remain independently schedulable.

## Clean-Room Provenance

This proposal was derived only from:

- [`AGENTS.md`](../AGENTS.md);
- [`docs/CODEX_WORKFLOW_ADAPTER.md`](CODEX_WORKFLOW_ADAPTER.md);
- the approved [`PROMOTION_MAP.md`](brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/PROMOTION_MAP.md);
- [`docs/SCHEMA.md`](SCHEMA.md), including its completed 2026-07-28 grid-dimension correction receipt at `07bef1e`, [`docs/SPEC.md`](SPEC.md), [`docs/DESIGN_TOKENS.md`](DESIGN_TOKENS.md), and [`docs/PLANNING_STANDARD.md`](PLANNING_STANDARD.md);
- the approved [`Inbox/Triage visual recipe index`](recipes/inbox-triage-visual-recipe-index.md) and exactly these nine approved recipes:
  1. [`Shell and section chrome`](recipes/inbox-triage-shell-section-chrome-visual-recipe.md);
  2. [`Scratch Pool`](recipes/inbox-triage-scratch-pool-visual-recipe.md);
  3. [`Selected Scratch Context`](recipes/inbox-triage-selected-scratch-context-visual-recipe.md);
  4. [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md);
  5. [`Staging`](recipes/inbox-triage-staging-visual-recipe.md);
  6. [`Grid Explorer`](recipes/inbox-triage-grid-explorer-visual-recipe.md);
  7. [`Placement affordances`](recipes/inbox-triage-placement-affordances-visual-recipe.md);
  8. [`Newly placed and Undo`](recipes/inbox-triage-newly-placed-undo-visual-recipe.md);
  9. [`Archive completion`](recipes/inbox-triage-archive-completion-visual-recipe.md); and
- current production source solely to validate landing owners, public boundaries, tests, and the typed-fixture impact surface.

The old `docs/EXECUTION_PLAN.md` and every file under `docs/reviews/` were excluded as derivation inputs.

## Supersession And Number Reconciliation

- If the user approves this exact proposal, it **wholly replaces** the prior open Phase 23–33 / Task 101–154 planning range; no prior open task survives beside it.
- The prior meanings assigned to Phase 32 and Phase 33 retire on approval. Their contents were not inputs to this proposal.
- This independently derived graph uses active Phases 23–31. Phase numbers 32 and 33 remain intentionally reserved with no tasks so canonical handoff advances beyond the replaced range.
- Task numbers are reassigned sequentially from Task 101 only after this corrected graph is complete. The authoritative continuation is recorded at [`## Next Numbers`](#next-numbers).

## Planning, Completion, And Evidence Rules

- **No phase-wide inference:** a phase number never substitutes for a listed dependency.
- **Code-ready or gated:** a code task is runnable only when all listed dependencies and exact DP receipts exist. Silence never selects a fallback.
- **TDD:** first add the focused failing test and observe the intended failure; then implement the smallest slice, rerun focused tests, and run the task's broader checks.
- **Authoritative results:** pending or unknown transport outcome is not success. Source truth remains visible until a complete repository postcondition is proven.
- **One narrow commit:** a task commit contains only its declared implementation, tests, and task-local evidence. Shared-file writers obey the mutex register below.
- **Running-app evidence near the change:** every task that changes user-visible behavior creates its exact `docs/verification/inbox-triage/task-NNN.md` record before completion. The record names route, seed/state, viewport, theme/mode, interaction, focus, capture identifier, result, and relevant UF/recipe. A small cluster may share one running session, but every task retains its own record; Task 164 aggregates rather than becoming first render evidence.
- **Source/render separation:** recipe declarations are source authority. A task record is rendered/interaction evidence and never changes recipe authority.
- **Preserve unrelated behavior:** ordinary Grid routing/DnD, Calendar, Trash, Quick Capture, global Search, Bit Detail, Direct Archive, Archive View restore, and system-node lifecycle change only where an explicit task names a compatibility assertion.

## Readiness Summary

| Area | Current status | Smallest blocker / next condition |
|---|---|---|
| Document approval | `APPROVED` | The approval receipt above remains the planning authority. |
| Execution lifecycle | Phase 23 complete; Phase 24 not started | Phase 24 requires a separate `run-phase` kickoff after the post-Phase-23 workflow rollout. |
| Data foundations | `COMPLETED` | Tasks 101–105A are accepted and recorded in the Phase 23 archive. |
| Decision prerequisites | Runnable non-code lane after plan approval | Tasks 106–119 collect 14 independently executable DP receipts for 12 VQs. |
| Headless/base UI | Dependency-ready after document and lifecycle gates | Tasks 127–137, 139, 142, 145–146, 149, 152, 155–156, 159, and 161 follow only their named data/headless prerequisites. |
| VQ realization | `BLOCKED_PENDING_USER_DECISIONS` | Each realization task resumes only from its exact DP receipt. |
| Full close | Not ready | Tasks 106–164 complete, all required DP receipts accepted, then Task 165 passes on top of the archived Phase 23 foundation. |

## Dependency Graph

```text
101 MODEL
  └─102 MIGRATION
      ├─103 REVISION
      └─104 REAL-TX-HARNESS

102 + 103 + 104 ──105 AGGREGATE-HARD-DELETE
103 + 104 ─────────120 BREAKDOWN-CMDS
103 + 104 ─────────121 STAGING-CMDS
105 + 121 ─────────122 INTEGRITY
120 + 121 ─────────123 PLACEMENT ─124 UNDO
120 + 121 ─────────125 ARCHIVE ─126 ARCHIVE-RECOVERY

106–119 DP Decision tasks: logically parallel, document-write mutex serialized
  └─only the exact realization tasks in the executable DP edge table

127–135 shared owners and base surfaces
  └─136–148 Breakdown/Pool/Staging behavior and realizations
      └─149–154 Explorer/placement behavior and realizations
          └─155–158 Newly/Undo and search-result integration
              └─159–162 completion/Archive behavior and realizations
                  └─163 integration ─164 conformance ─165 full gate

Every node above, including 105 and every accepted DP edge, feeds Task 165.
```

## Phase Index

| Phase | Status | Scope | Tasks | Dependency-aware readiness |
|---|---|---|---|---|
| Phase 23 | Completed | [Model, v4 migration, revisions, real transaction harness, aggregate deletion, and Scratch-promotion guard](execution-plan/archive/phase-23.md) | 101–105 + 105A | Accepted and archived; downstream tasks consume this completed foundation. |
| Phase 24 | Proposed | Fourteen user-owned DP receipts covering twelve VQs | 106–119 | Logical parallelism; shared document writes use one mutex and create no cross-VQ dependency. |
| Phase 25 | Proposed | Eleven authoritative commands plus Archive recovery | 120–126 | Follows the exact independent data DAG, not Phase 24 completion. |
| Phase 26 | Proposed | Lifetime/copy/theme foundations and source-backed base surfaces | 127–135 | Individual data dependencies only. |
| Phase 27 | Proposed | Breakdown, Pool, and Staging headless adapters and exact realizations | 136–148 | Headless tasks remain independent from their VQ presentation slices. |
| Phase 28 | Proposed | Explorer status/search and pointer placement | 149–154 | Search, status, reliability, and title slices have distinct receipt edges. |
| Phase 29 | Proposed | Mounted-page Newly Placed, ordinary Undo, and search-result Undo integration | 155–158 | Ordinary-card Undo does not depend on `VQ-07`. |
| Phase 30 | Proposed | Completion and Archive coordinator/recovery | 159–162 | Completion foundation does not depend on `VQ-03`/`VQ-04` realization. |
| Phase 31 | Proposed | Route integration, nine-recipe conformance, full gate | 163–165 | Requires all named predecessors and task-local evidence. |
| Phase 32 | Reserved | Retired-number reservation | none | No tasks may be assigned. |
| Phase 33 | Reserved | Retired-number reservation | none | No tasks may be assigned. |

## User Flow Inventory

| ID | User-visible flow | Owning task(s) |
|---|---|---|
| `UF-01` | Enter Inbox through `/grid/[nodeId]` and see the four named areas. | 129, 163 |
| `UF-02` | Initial/re-entry/reload Scratch selection, invalid prior selection, and true empty state. | 127, 130 |
| `UF-03` | Expanded Pool search, sort, total/filtered counts, selection, and hidden-selected state. | 127, 130, 144 |
| `UF-04` | Collapsed switching, first-printable-key collapse, manual reopen, and session restoration. | 127, 130 |
| `UF-05` | External archive/delete transition, destination changes, draft copy, and restore. | 106, 141 |
| `UF-06` | Context, Breakdown sort, rows/actions, and ordinary/completion empty distinctions. | 132 |
| `UF-07` | Add by Enter/explicit Add with authoritative pending/reconcile/failure/success/focus. | 120, 136, 143, 148 |
| `UF-08` | Leave with an Add draft through continue-writing or discard-and-move. | 108, 139, 140 |
| `UF-09` | Edit Scratch title with conditional Save/Cancel/validation/offline/conflict/invalidation. | 109, 120, 137, 138 |
| `UF-10` | Edit Breakdown content with lifecycle guards and deterministic focus. | 109, 120, 137, 138 |
| `UF-11` | Delete non-optimistically with confirmation, recovery, and focus handoff. | 120, 136, 143 |
| `UF-12` | Active, staged, consumed-removal, never-used, all-deleted, and completion row lifecycle. | 132, 136, 142, 145 |
| `UF-13` | Durable Node/Bit candidates, counts, sort, quiet empty state, and full-card drag. | 121, 131, 133 |
| `UF-14` | Stage with source validation, pending projection, result, and navigation guard. | 121, 145, 147 |
| `UF-15` | Unstage through transient targets, restoring order/focus without success toast. | 121, 145, 148 |
| `UF-16` | Remote candidate arrival, orphan proof/cleanup, invalidation, alert, and drag release. | 122, 146, 147 |
| `UF-17` | Explorer navigation/re-entry, full labels, anchoring, and valid fallback. | 127, 134, 150 |
| `UF-18` | Dedicated whole-hierarchy search with pre-search/results/loading/stale/error/duplicates. | 114, 135, 151 |
| `UF-19` | Search result reveal/navigation/close semantics, DnD interruption, and result Undo. | 151, 158 |
| `UF-20` | Staged placement through target-column confirmation and atomic mutation. | 123, 152, 153 |
| `UF-21` | Direct type plus path selection and atomic placement. | 123, 152, 153 |
| `UF-22` | Valid/invalid/full feedback, visible full reason, and valid-column edge scroll. | 149, 152 |
| `UF-23` | Staged Result Title and direct type-limit surfaces without truncation/fallback. | 116, 154 |
| `UF-24` | Actual-card Newly marker, type pinning, normal navigation, mounted-page lifetime. | 155, 157 |
| `UF-25` | Ordinary/search Undo, dependency reasons, child-first recovery, reconcile, focus. | 124, 156–158 |
| `UF-26` | Exact durable completion plus Add/title blocker reporting. | 125, 159, 160 |
| `UF-27` | Section-scoped overlay, Cancel, complete Context, explicit reopen, switch/re-entry. | 159, 160 |
| `UF-28` | Archive pending/recovery/retry and next→previous→filtered-null/true-empty handoff. | 125, 126, 161, 162 |
| `UF-29` | Theme/mode change preserves all work state and causes no mutation/navigation. | 164 |

## Architecture Flow Inventory

| ID | Architecture flow | Owning task(s) |
|---|---|---|
| `AF-01` | DataStore and Zod write boundary remain the only command/storage boundary. | 101–105, 105A, 120–126, 163 |
| `AF-02` | UI reads stay reactive; components do not import Dexie. | 131, 135, 163 |
| `AF-03` | Canonical URL/system-node routing is retained; only Inbox body dispatch changes. | 129, 163, 164 |
| `AF-04` | Lifecycle filters, retention, and unrelated Archive/Trash behavior remain intact. | 102, 105, 122, 125, 165 |
| `AF-05` | Durable, app-session, mounted-page, recovery, and preference state use correct owners. | 101, 127, 131, 137, 139, 155, 159, 161, 163 |
| `AF-06` | Node/Bit/Breakdown/Candidate mutations use monotonic CAS/ABA protection. | 103, 120–125 |
| `AF-07` | Commands use complete atomic postconditions and real transaction rollback, without a general log. | 104, 120–126 |
| `AF-08` | Candidates join source truth; uniqueness, aggregate deletion, orphan audit, and Archive integrity stay repository-owned. | 101, 105, 121, 122, 131 |
| `AF-09` | Dedicated Explorer query, existing triage DnD owner, placement, Newly, and Archive coordinators own distinct slices. | 135, 142, 149, 151, 152, 155, 161, 163 |
| `AF-10` | One semantic production tree, centralized copy, task-local render evidence, and no theme-ID branching. | 128, 129, 164, 165 |

## Atomic Command Inventory

| Command | Repository task | UI adapter/realization task(s) |
|---|---|---|
| Add Breakdown | 120 | 136, 143, 148 |
| Save Scratch title | 120 | 137, 138 |
| Save Breakdown content | 120 | 137, 138 |
| Delete Breakdown | 120 | 136, 143 |
| Stage candidate | 121 | 145, 147 |
| Unstage candidate | 121 | 145, 147, 148 |
| Confirmed-orphan cleanup | 122 | 146, 147 |
| Place staged source | 123 | 152–154 |
| Place direct source | 123 | 152–154 |
| Source-aware Undo | 124 | 156–158 |
| Archive Scratch | 125 | 161, 162 |

## Recipe Surface Inventory

| Recipe surface | Production implementation owner(s) |
|---|---|
| Shell and section chrome | 129, 164 |
| Scratch Pool | 130, 141, 144, 164 |
| Selected Scratch Context | 132, 138, 160, 164 |
| Breakdown rows and empty states | 132, 136–140, 143, 148, 159–160, 164 |
| Staging | 133, 142, 145–148, 164 |
| Grid Explorer | 134–135, 149–151, 158, 164 |
| Placement affordances | 149, 152–154, 164 |
| Newly placed and Undo | 155–158, 164 |
| Archive completion | 159–162, 164 |

## VQ Gate Register

| VQ | Decision task / receipt | Directly blocked realization only |
|---|---|---|
| `VQ-01` | 106 / `DP-VQ01` | 141 external-removal realization |
| `VQ-02` | 107 / `DP-VQ02` | 148 Add/Unstage success realization |
| `VQ-03` | 108 / `DP-VQ03` | 140 departure confirmation realization; Task 139 remains headless |
| `VQ-04` | 109 / `DP-VQ04` | 138 inline-editor realization; Task 137 remains headless |
| `VQ-05` | 110 / `DP-VQ05` | 143 Add/Delete reliability realization |
| `VQ-06` | 111–113 / three receipts below | 144 Pool, 147 Staging, and 150 Explorer realizations independently |
| `VQ-07` | 114 / `DP-VQ07` | 151 search result body and 158 search-result Undo integration; ordinary Undo 156 remains independent |
| `VQ-08` | 115 / `DP-VQ08` | 153 placement reliability realization |
| `VQ-09` | 116 / `DP-VQ09` | 154 Result Title/direct-limit realization |
| `VQ-10` | 117 / `DP-VQ10` | 157 Newly/Undo realization |
| `VQ-11` | 118 / `DP-VQ11` | 160 completion blocker/withdrawal realization |
| `VQ-12` | 119 / `DP-VQ12` | 162 Archive reliability/recovery realization |

### Executable DP Receipt Edges

| Receipt | VQ | Decision task | Exact implementation edge | Resume condition |
|---|---|---|---|---|
| `DP-VQ01` | `VQ-01` | 106 | 141 only | Choice A central blocking panel recorded at `docs/issues/Issues_Phase_24.Task_106.dp-vq01.json`; Task 106 remains `[ ]` pending its user checkpoint. |
| `DP-VQ02` | `VQ-02` | 107 | 148 only | Accepted receipt defines complete one-shot/reduced-motion success realization. |
| `DP-VQ03` | `VQ-03` | 108 | 140 only | Accepted receipt supplies or scopes out the internal departure surface. |
| `DP-VQ04` | `VQ-04` | 109 | 138 only | Accepted receipt supplies both complete inline-editor surfaces. |
| `DP-VQ05` | `VQ-05` | 110 | 143 only | Accepted receipt defines Add/Delete reliability states. |
| `DP-VQ06-POOL` | `VQ-06` | 111 | 144 only | Accepted Pool-specific status receipt. |
| `DP-VQ06-STAGING` | `VQ-06` | 112 | 147 only | Accepted Staging-specific status receipt. |
| `DP-VQ06-EXPLORER` | `VQ-06` | 113 | 150 only | Accepted Explorer-specific status receipt. |
| `DP-VQ07` | `VQ-07` | 114 | 151 and search-only integration 158 | Accepted receipt supplies or scopes out the complete replacement search body. |
| `DP-VQ08` | `VQ-08` | 115 | 153 only | Accepted receipt defines placement reliability states. |
| `DP-VQ09` | `VQ-09` | 116 | 154 only | Accepted receipt supplies both title/limit surfaces. |
| `DP-VQ10` | `VQ-10` | 117 | 157 only | Accepted receipt defines Newly/Undo overlap, reasons, and reliability. |
| `DP-VQ11` | `VQ-11` | 118 | 160 only | Accepted receipt defines blocker/withdrawal realization. |
| `DP-VQ12` | `VQ-12` | 119 | 162 only | Accepted receipt defines Archive reliability/recovery realization. |

## Cross-Cutting Exclusions And Negative Coverage

| ID | Prohibited shortcut | Enforced by |
|---|---|---|
| `NEG-01` | Copy prototype routes, mock state, handlers, or inline architecture. | 129, 163, 164 |
| `NEG-02` | Flatten eight themes into one generic surface. | 129, 164 |
| `NEG-03` | Retain abbreviated Explorer labels. | 134 |
| `NEG-04` | Use a recipe outside the approved nine-file package as execution authority. | Provenance, 164 |
| `NEG-05` | Promote the prototype Pool fold lock. | 127, 130 |
| `NEG-06` | Copy staged internal handles or native drag snapshots. | 133, 142, 149 |
| `NEG-07` | Add keyboard placement, placement button, picker, or hidden shortcut. | 149, 152, `D-KEYBOARD` |
| `NEG-08` | Keep large Staging empty cards. | 133 |
| `NEG-09` | Submit Add on blur. | 136 |
| `NEG-10` | Extend active-column or global Search for Explorer. | 135, 151, 163 |
| `NEG-11` | Use repeated blink/pulse/ping/bounce/spin/flicker for status. | 129, 148, 157, 160, 162, 164 |
| `NEG-12` | Add a permanent candidate Unstage button. | 145 |
| `NEG-13` | Toast successful Unstage or prematurely globalize its failure. | 145, 148 |
| `NEG-14` | Use generic Dialog/AlertDialog for inline edit/conflict. | 138 |
| `NEG-15` | Auto-unstage/cascade candidate on staged-source edit/delete. | 121, 137 |
| `NEG-16` | Use page Set or label equality for candidate uniqueness. | 101, 121, 132 |
| `NEG-17` | Persist selection/query/draft/path/overlay/Newly beyond its canonical lifetime; only two Inbox sorts persist. | 127, 155, 159, 161 |
| `NEG-18` | Auto-pick another placement target or perform partial/best-effort writes. | 123, 152, 153 |
| `NEG-19` | Use `mtime` as edit concurrency authority. | 103, 120 |
| `NEG-20` | Treat mock success as persistence/lifecycle evidence. | 104, 120–126 |
| `NEG-21` | Use adjacent chrome, cards, dialogs, or Search as visual fallback. | 106–119 and exact realization edges |

## Selected Deferrals — Excluded From Active Tasks

| ID | Deferred scope | Resume owner |
|---|---|---|
| `D-CARD` | Common BitCard eight-theme redesign, later reuse, and final Korean card QA. | Future brainstorming and separately approved plan. |
| `D-LOCALE` | Locale provider/resources, EN/KR toggle, localized copy, and Korean QA. | Future canonical amendment; core English owner remains in scope. |
| `D-LENS` | Neumorphism ASC/DESC water-lens polish. | Future user visual decision. |
| `D-KEYBOARD` | Keyboard or other drag-alternative placement entry. | Future accessibility brainstorming; no placeholder now. |
| `D-TEXT` | Cross-surface wrapping, line count, expansion, and IME visual design. | Named separate topic. |

Responsive/mobile redesign remains excluded; active implementation targets the declared desktop surface with 1024px minimum and stable 1920×1080 evidence. A future Staging-failure toast migration remains a separate follow-up, not an active task.

---

## Phase 23 — Model, Migration, Transactions, And Retention (Completed)

> **Archived:** completion-time truth is recorded in
> [`docs/execution-plan/archive/phase-23.md`](execution-plan/archive/phase-23.md).
> The accepted task detail remains inline in this approved multi-phase plan for
> receipt continuity and is historical, not an active task surface.

### Task 101: [x] Land the authoritative model and typecheck-compatible constructors

**Files and actions**

- Modify `src/lib/db/schema.ts`, `src/types/index.ts`, and `src/lib/db/schema.test.ts`: make `version` a required integer ≥1 on Node, Bit, and ScratchBreakdown; add `pastDeadlineDismissed` to Node/Bit with canonical `false` schema default; add/export `RepositoryOperationId`, exact `StagedCandidate`, exact `CandidateOrphanAuditEvent`, exact `PendingOperationRecovery`, command/result types, and public create/update schemas that omit IDs, creation metadata, lifecycle system fields, and `version`.
- Modify `src/lib/db/indexeddb.ts` and `src/lib/db/indexeddb.test.ts`: make every repository create constructor explicitly write `version: 1`, and every Node/Bit constructor explicitly write `pastDeadlineDismissed: false`, including ordinary create, system-node seed, Scratch Breakdown create, Bit→Node promotion result, and promoted child Bits. Do not rely on a Zod output default to hide a missing repository initializer.
- Update the concrete typed factories found by `rg -l 'function (create|make)(Node|Bit)|function createScratchBreakdown' src --glob '*.test.ts' --glob '*.test.tsx'`, namely: `src/app/calendar/calendar-navigation.test.tsx`; `src/components/bit-detail/bit-detail-popup.test.tsx`; `src/components/calendar/compact-bit-item.test.tsx`; `src/components/calendar/day-column.test.tsx`; `src/components/calendar/parent-node-selector.test.tsx`; `src/components/grid/bit-card.test.tsx`; `src/components/grid/edit-node-dialog.test.tsx`; `src/components/grid/grid-view.test.tsx`; `src/components/grid/node-card.test.tsx`; `src/components/layout/breadcrumb-deadline.test.tsx`; `src/components/layout/breadcrumbs.test.tsx`; `src/components/layout/grid-runtime.test.tsx`; `src/components/layout/sidebar.test.tsx`; `src/components/triage/breakdown-panel.test.tsx`; `src/components/triage/hierarchy-explorer.test.tsx`; `src/components/triage/scratch-pool.test.tsx`; `src/components/triage/triage-workspace.test.tsx`; `src/hooks/use-calendar-data.test.ts`; `src/hooks/use-inbox.test.tsx`; `src/hooks/use-scratch-breakdowns.test.tsx`; `src/lib/db/archive-sweep.test.ts`; `src/lib/db/archive.test.ts`; `src/lib/db/auto-cleanup.test.ts`; `src/lib/db/auto-completion.test.ts`; `src/lib/db/cascade-delete.test.ts`; `src/lib/db/cascade-hard-delete.test.ts`; `src/lib/db/cascade-restore.test.ts`; `src/lib/db/deadline-hierarchy.test.ts`; `src/lib/db/grid-uniqueness.test.ts`; `src/lib/db/indexeddb.migration.test.ts`; `src/lib/db/mtime-cascade.test.ts`; `src/lib/db/promotion.test.ts`; `src/lib/db/scratch-breakdowns.test.ts`; `src/lib/db/system-nodes.test.ts`; and `src/lib/utils/completion.test.ts`. Each factory explicitly defaults `version: 1`; Node/Bit factories also default `pastDeadlineDismissed: false`. Update `src/hooks/use-can-archive-scratch.test.ts` so its asserted ScratchBreakdown fixture is complete rather than hiding missing fields behind a cast. Intentional legacy-migration rows remain `Record<string, unknown>`.

**Dependencies:** plan approval and separately approved execution lifecycle.

**Authority / flows:** SCHEMA object stores, Zod schemas, and operation identities; `AF-01`, `AF-05`–`AF-08`; `NEG-16`.

**Recipe:** Not applicable — data/nonvisual.

**Observable acceptance:** every file changed by the new required fields compiles in this task; public payloads cannot supply/reset versions or system metadata; all repository-created Node/Bit/Breakdown records begin at version 1, Node/Bit records begin with `pastDeadlineDismissed: false`, candidates contain no label/target/pending snapshot, and recovery contains no draft/payload/queue.

**Verification:** first observe fixture/type failures after the schema test change; then run `pnpm test -- src/lib/db/schema.test.ts src/lib/db/indexeddb.test.ts` and `pnpm typecheck`, both with zero failures/errors; rerun the discovery command and inspect every matching concrete factory.

**Commit contract:** only the schema/type exports, repository constructors, schema/constructor tests, and enumerated typed-fixture compatibility edits; `feat(triage): define versioned inbox domain model`.

### Task 102: [x] Install the exact atomic Dexie v4 migration

**Files and actions:** modify `src/lib/db/indexeddb.ts` and `src/lib/db/indexeddb.schema-v3-upgrade.test.ts`; create `src/lib/db/indexeddb.schema-v4-upgrade.test.ts`. Preserve every v3 assertion while converting its intended-success legacy IDs to valid UUIDs (or isolating its v3-only opener) so canonical v4 validation does not turn a v3 fixture artifact into a false migration failure. Declare v4 after v1→v2→v3 with exact stores/indexes: `nodes: "id,parentId,deletedAt,[parentId+deletedAt],level,systemRole,archivedAt,[parentId+deletedAt+archivedAt]"`; `bits: "id,parentId,deletedAt,[parentId+deletedAt],status,deadline,[parentId+status],archivedAt,[parentId+deletedAt+archivedAt]"`; `scratchBreakdowns: "id,scratchBitId,[scratchBitId+order],[scratchBitId+createdAt]"`; `stagedCandidates: "id,&sourceBreakdownId,scratchBitId,lifecycle,[scratchBitId+lifecycle],[scratchBitId+resultType+createdAt]"`; and `candidateOrphanAuditEvents: "id,&candidateId,sourceBreakdownId,scratchBitId,occurredAt,[scratchBitId+occurredAt]"`; retain chunks/settings declarations. In one upgrade transaction, start both new stores empty with no inference; backfill only missing versions to 1 and missing `pastDeadlineDismissed` to false; preserve valid ≥1 revisions, booleans, IDs/content/order/timestamps/lifecycle, and tolerated unknown fields; validate target Zod fields and that each Breakdown owner is a Bit parented by the Inbox system Node. Throw a structured store/id/reason migration error for any invalid required row/reference so the whole upgrade rolls back and reopens at v3 without quarantine, deletion, guessed value, consumption, or candidate manufacture.

**Dependencies:** Task 101.

**Authority / flows:** SCHEMA Dexie Migration Target and invalid-row rollback; `AF-01`, `AF-04`, `AF-08`; `NEG-16`, `NEG-17`.

**Recipe:** Not applicable — data/nonvisual.

**Observable acceptance:** fresh/open-from-v1/v2/v3 databases expose the exact v4 indexes and empty new stores; valid prior revisions/booleans and every unrelated value remain unchanged; each invalid Node, Bit, Breakdown, or non-Inbox owner aborts with structured identity and a byte-for-byte pre-upgrade snapshot after reopening at v3; reopening a successful v4 database is idempotent.

**Verification:** with real `GridDODatabase`, `IDBFactory`, and `IDBKeyRange`, run `pnpm test -- src/lib/db/indexeddb.schema-v3-upgrade.test.ts src/lib/db/indexeddb.schema-v4-upgrade.test.ts`; inspect `db.verno`, store/index schemas, unique-index rejection, empty stores, preservation, and rollback; then `pnpm typecheck`.

**Commit contract:** v4 declaration/upgrade plus the v3 preservation and dedicated v4 tests only; `feat(triage): migrate indexeddb atomically to v4`.

### Task 103: [x] Enforce revisions across every public and repository mutation path

**Files and actions**

- Modify `src/lib/db/datastore.ts` and `src/lib/db/indexeddb.ts`: replace broad `Partial<Node>`/`Partial<Bit>` public patches with repository-owned update inputs excluding IDs, creation metadata, lifecycle-only fields, and `version`; increment a surviving record exactly once for direct title/property/deadline/position/status/lifecycle mutation; never increment on rejection/no-op or parent `mtime`-only touch. Explicitly sweep `createNode`/`createBit`, `updateNode`/`updateBit`, `createChunk`/`updateChunk`/`deleteChunk` under Hooks 1/3, Node/Bit soft delete, restore, hard-delete closure, trash cleanup, archive/unarchive under Hooks 10/11, system-node drift normalization, breadcrumb relocation, Bit→Node promotion, and legacy Breakdown mutations; new records start at v1, hard-deleted records have no surviving revision, and every indirectly touched parent stays revision-neutral unless it is itself directly lifecycle/status mutated.
- Modify `src/hooks/use-grid-actions.ts`, `src/hooks/use-node-actions.ts`, and `src/hooks/use-bit-detail-actions.ts`; create `src/hooks/use-grid-actions.test.ts`, `src/hooks/use-node-actions.test.ts`, and `src/hooks/use-bit-detail-actions.test.ts` with compile-time `@ts-expect-error` and runtime forwarding assertions so public actions cannot set/reset revision/system fields.
- Create `src/lib/db/revision.test.ts` and update these exact regression owners: `src/lib/db/indexeddb.test.ts` (direct Node/Bit create/update and child add/remove); `src/lib/db/mtime-cascade.test.ts` (Hook 1); `src/lib/db/auto-completion.test.ts` (Hook 3); `src/lib/db/cascade-delete.test.ts` and `src/lib/db/cascade-restore.test.ts` (Hooks 4/5); `src/lib/db/cascade-hard-delete.test.ts` and `src/lib/db/auto-cleanup.test.ts` (Hook 6 target absence and revision-neutral parent touch); `src/lib/db/indexeddb.migration.test.ts` (breadcrumb relocation); `src/lib/db/archive.test.ts` (Hooks 10/11 Node cascades and Bit paths); `src/lib/db/system-nodes.test.ts` (drift normalization); `src/lib/db/promotion.test.ts` (source deletion plus new v1 results); `src/lib/db/grid-uniqueness.test.ts` and `src/lib/db/deadline-hierarchy.test.ts` (rejected/accepted moves and deadline writes); and `src/lib/db/scratch-breakdowns.test.ts` (legacy Breakdown direct paths until Task 120 replaces them).
- Assert a restore that changes lifecycle and cell is one logical increment; an archive/soft-delete cascade increments each directly lifecycle-mutated descendant once; Hook 1 parent touches do not increment; Hook 3 increments the Bit only when status actually changes; promotion results begin at v1; no test uses `mtime` as CAS.

**Dependencies:** Task 102.

**Authority / flows:** SCHEMA monotonic version/CAS and Hooks 1, 3, 4–6, 10, 11; `AF-01`, `AF-06`; `NEG-19`.

**Recipe:** Not applicable — data/nonvisual.

**Observable acceptance:** every current direct, breadcrumb, auto-completion, cascade, restore, Archive, system normalization, promotion, and public-action path has an exact version assertion; stale version cannot overwrite a later value even through A→B→A; mtime-only parent refresh remains revision-neutral; Task 103 does not modify `schema.ts`.

**Verification:** run the three new action tests and all exact database tests listed above, then `pnpm typecheck` and `pnpm lint`; expected zero failures/errors and expected compile errors only at annotated forbidden public inputs.

**Commit contract:** revision/public-boundary code and the exact mutation-path tests above only; `feat(db): enforce monotonic record revisions`.

### Task 104: [x] Build a real IndexedDB transaction and fault-injection harness

**Files and actions:** create `src/lib/db/indexeddb.test-utils.ts` and `src/lib/db/indexeddb.transaction.test.ts`; modify `src/lib/db/indexeddb.ts` only for a narrow injectable named-checkpoint test seam. Each test uses a fresh real `GridDODatabase` backed by `fake-indexeddb` `IDBFactory`/`IDBKeyRange`, valid UUID factories, and snapshots of nodes, bits, chunks, settings, scratchBreakdowns, stagedCandidates, and candidateOrphanAuditEvents. Inject a throw after each named store mutation inside the real `rw` Dexie transaction and prove every store matches the prestate. Require every validation and closure read to occur inside the same transaction. Structural FakeTable/FakeDatabase tests may remain unit coverage but cannot satisfy atomic acceptance.

**Dependencies:** Task 102.

**Authority / flows:** SCHEMA Repository Operation Contract and complete-postcondition rule; `AF-01`, `AF-07`; `NEG-18`, `NEG-20`.

**Recipe:** Not applicable — data/nonvisual.

**Observable acceptance:** a real first write followed by an injected failure rolls back all seven domain/integrity stores; the harness can assert complete precondition, complete postcondition, and conflict using stable IDs and versions; transaction scope includes every store required by later commands and introduces no production operation log, outbox, or queue.

**Verification:** `pnpm test -- src/lib/db/indexeddb.transaction.test.ts`; expected zero failures with a control proving the same injected sequence would expose a partial state outside the real transaction; then `pnpm typecheck`.

**Commit contract:** real IndexedDB test utility, transaction test, and smallest named-checkpoint seam only; `test(db): prove real indexeddb rollback`.

### Task 105: [x] Make Scratch aggregate hard-delete atomic and audit-preserving

**Files and actions:** modify `src/lib/db/datastore.ts` and `src/lib/db/indexeddb.ts` to make Node/Bit permanent-delete closures and `cleanupExpiredTrash` use one planned aggregate transaction. When a closure owns a Scratch Bit, delete the Scratch, its Chunks, all owned Breakdown rows, and candidates whose still-present source belongs to the closure; retire/restrict `deleteScratchBreakdownsByScratch` as a public sequencing escape hatch. Never create an orphan event for planned aggregate deletion; retain every pre-existing `candidateOrphanAuditEvents` row indefinitely, including rows naming that Scratch; leave unrelated aggregates untouched. If a candidate already lacks its source before planning, abort the aggregate with a typed integrity-cleanup-required result and leave every store unchanged; Task 122 later consumes that condition through the separately audited confirmed-orphan contract. Create `src/lib/db/scratch-aggregate-hard-delete.test.ts`; update `src/lib/db/cascade-hard-delete.test.ts`, `src/lib/db/auto-cleanup.test.ts`, and `src/lib/db/scratch-breakdowns.test.ts` with real Task 104 checkpoint injection after each store mutation.

**Dependencies:** Tasks 102–104.

**Authority / flows:** SCHEMA Hook 6, Scratch Bit Permanent Deletion, and indefinite orphan-audit retention; `AF-04`, `AF-07`, `AF-08`; `NEG-20`.

**Recipe:** Not applicable — data/nonvisual.

**Observable acceptance:** normal Scratch purge leaves neither Scratch/Chunk/row/candidate nor a new audit event; every prior audit remains byte-for-byte; archive leaves rows/candidates untouched; pre-existing orphans are not disguised as aggregate cleanup; any injected failure restores the entire aggregate and audit store.

**Verification:** `pnpm test -- src/lib/db/scratch-aggregate-hard-delete.test.ts src/lib/db/cascade-hard-delete.test.ts src/lib/db/auto-cleanup.test.ts src/lib/db/scratch-breakdowns.test.ts`; expected zero failures, then `pnpm typecheck`.

**Commit contract:** aggregate hard-delete/cleanup owners and their exact rollback/retention tests only; `feat(db): delete scratch aggregates atomically`.

### Task 105A: [x] Amend the stale Scratch promotion boundary

**Files and actions:** first amend `docs/SCHEMA.md` Hook 9 through a separate
canonical-document gate: a Bit whose parent Node has `systemRole: "inbox"` is
a Scratch and cannot be promoted to a Node, regardless of whether it currently
has Breakdown rows, staged candidates, or Chunks. After that amendment is
explicitly approved, modify `src/lib/db/indexeddb.ts` and
`src/lib/db/promotion.test.ts` so `promoteBitToNode` rejects the Inbox-parented
Bit before allocating IDs or writing any store. Do not infer a Breakdown/
candidate deletion or migration policy, and do not change the visual surface.

**Dependencies:** Task 105 and explicit approval of the Task 105A SCHEMA
amendment. Task 105 must not absorb this work.

**Authority / flows:** SCHEMA dedicated `scratchBreakdowns` ownership and the
stale Hook 9 Bit-to-Node Promotion contract; the explicit 2026-07-28 user
decision recorded in `docs/issues/Issues_Phase_23.md`.

**Recipe:** Not applicable — repository constraint; the intended Scratch UI
already exposes no promotion action under its normal no-Chunk state.

**Observable acceptance:** Inbox-parented Bits reject promotion before any
Node/Bit/Chunk/Breakdown/candidate/audit write, including a defensive fixture
that contains Chunks; ordinary non-Inbox Bits preserve current promotion
behavior. Data presence never toggles the rule.

**Verification:** run `pnpm exec vitest run src/lib/db/promotion.test.ts`,
`pnpm typecheck`, `pnpm lint`, and `git diff --check`; expected zero failures
or errors and no new warning.

**Commit contract:** the approved Hook 9 amendment/receipt is one documentation
commit; the repository guard and exact promotion regression are a later narrow
code commit; `fix(db): reject Scratch bit promotion`.

#### Phase 23 Notes

- Integrate Tasks 101–105A as one phase unit; Task 102 closes Task 101's
  temporary legacy-row migration risk, so intermediate cherry-picks are not a
  supported release state.
- `P23-02` is deferred to exact Task 136 hook/test ownership; `P23-03` is
  promoted to Task 130's defensive Bit-detail visibility guard.
- The real-project lifecycle trace is retained for the post-merge workflow-v2
  pass. Phase 24 must not start until that rollout and GridDO adapter migration
  are verified.

---

## Phase 24 — User-Owned Decision Prerequisites

Tasks 106–119 are non-code Decision tasks. They have no dependencies on one another; their shared document edits are serialized by the `decision-docs` mutex without creating a semantic VQ dependency.

### Task 106: [ ] Record `DP-VQ01` external-removal decision

**Files and actions:** modify `docs/recipes/inbox-triage-scratch-pool-visual-recipe.md`, `docs/DESIGN_TOKENS.md`, and `docs/EXECUTION_PLAN.md` to record the user-approved complete external archive/delete transition realization or explicit scope-out: exact copy, layout, controls, countdown treatment, pause/resume, destination change, draft-copy status, restore, focus, and eight-theme mapping. Record the durable receipt and change no code.

**Dependencies:** user decision only; no code prerequisite and no other DP task.

**Decision owner:** User. **Receipt:** `DP-VQ01`. **Exact edge:** Task 141 only. **Resume:** receipt completely supplies or scopes out the named surface; silence or a nearby dialog does not resume it.

**Authority / flows:** `VQ-01`, `UF-05`, `NEG-21`.

**Recipe:** [`Scratch Pool`](recipes/inbox-triage-scratch-pool-visual-recipe.md).

**Recorded decision — `DP-VQ01`, Choice A (2026-08-09):** use one dedicated
central blocking `alertdialog` over an inert Inbox workspace, never a generic
Dialog/AlertDialog, Archive surface, or Pool-chrome fallback. The panel is
`min(35rem, calc(100% - 2rem))` wide with only its draft list scrollable. It
uses the exact lifecycle titles `This Scratch was archived elsewhere` and
`This Scratch was deleted elsewhere`, destination-aware running/paused copy,
a 4px `5000ms` linear countdown, and text-only `Move now`, `Pause`, and
`Resume` controls with no Cancel/Escape dismissal. Dirty Add/Scratch-title/row
drafts start paused in source-labeled full-text cards; `Copy full draft`
becomes `Copied` without focus movement or countdown resume. A running
destination change restarts five seconds, a paused change stays paused,
authoritative archive restore alone cancels the transition, and terminal
focus moves to the destination Context or the named no-selection/empty status.
All eight themes keep this semantic tree/copy/timing/focus and consume the
exact recipe/token role-family mapping. The durable receipt is
`docs/issues/Issues_Phase_24.Task_106.dp-vq01.json`; it releases no task other
than Task 141 and does not accept Task 106's `[ ]` marker.

**Observable acceptance:** the receipt lets Task 141 implement every external-removal state without choosing wording, geometry, controls, timing treatment, or theme values.

**Verification:** `git diff --check`; inspect exact receipt ID, full state list, no fallback, and only Task 141 release.

**Commit contract:** the three named documents and `DP-VQ01` receipt only; `docs(triage): record DP-VQ01`.

### Task 107: [ ] Record `DP-VQ02` success-signal decision

**Files and actions:** modify `docs/recipes/inbox-triage-breakdown-row-empty-visual-recipe.md`, `docs/DESIGN_TOKENS.md`, and `docs/EXECUTION_PLAN.md` to record exact shared Add/Unstage one-shot effect, trigger, duration/easing, copy, placement, interruption/retrigger, announcement, static reduced-motion treatment, and eight-theme mapping; change no code.

**Dependencies:** user decision only; no code prerequisite and no other DP task.

**Decision owner:** User. **Receipt:** `DP-VQ02`. **Exact edge:** Task 148 only. **Resume:** complete success realization accepted.

**Authority / flows:** `VQ-02`, `UF-07`, `UF-15`, `NEG-11`, `NEG-13`.

**Recipe:** [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md).

**Observable acceptance:** Add and Unstage share one fully specified, non-repeating realization and an equally meaningful reduced-motion state.

**Verification:** `git diff --check`; trace every value/copy/effect to the receipt and only Task 148 release.

**Commit contract:** the three named documents and `DP-VQ02` receipt only; `docs(triage): record DP-VQ02`.

### Task 108: [ ] Record `DP-VQ03` Add-draft departure decision

**Files and actions:** modify `docs/recipes/inbox-triage-breakdown-row-empty-visual-recipe.md`, `docs/DESIGN_TOKENS.md`, and `docs/EXECUTION_PLAN.md` to specify or scope out the app-internal Continue writing / Discard and move surface, exact copy, placement, action hierarchy, focus entry/return, and eight-theme treatment; change no code or Task 139 headless behavior.

**Dependencies:** user decision only; no code prerequisite and no other DP task.

**Decision owner:** User. **Receipt:** `DP-VQ03`. **Exact edge:** Task 140 only. **Resume:** complete internal departure surface accepted or explicitly scoped out.

**Authority / flows:** `VQ-03`, `UF-08`, `NEG-21`.

**Recipe:** [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md).

**Observable acceptance:** Task 140 needs no inference from delete/archive dialogs or native unload UI, while Task 139 remains independently runnable.

**Verification:** `git diff --check`; confirm native unload remains browser-exit-only and only Task 140 releases.

**Commit contract:** the three named documents and `DP-VQ03` receipt only; `docs(triage): record DP-VQ03`.

### Task 109: [ ] Record `DP-VQ04` inline-editor decision

**Files and actions:** modify `docs/recipes/inbox-triage-selected-scratch-context-visual-recipe.md`, `docs/recipes/inbox-triage-breakdown-row-empty-visual-recipe.md`, `docs/DESIGN_TOKENS.md`, and `docs/EXECUTION_PLAN.md` to specify Scratch-title and row-content editor realization across pristine, dirty, validation, saving, offline/not-applied, reconcile, conflict/use-mine/use-latest, lifecycle invalidation, draft review/copy, focus, and themes; change no code or Task 137 headless state.

**Dependencies:** user decision only; no code prerequisite and no other DP task.

**Decision owner:** User. **Receipt:** `DP-VQ04`. **Exact edge:** Task 138 only. **Resume:** one accepted receipt completely defines both editor surfaces.

**Authority / flows:** `VQ-04`, `UF-09`, `UF-10`, `NEG-14`, `NEG-21`.

**Recipe:** [`Selected Scratch Context`](recipes/inbox-triage-selected-scratch-context-visual-recipe.md) and [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md).

**Observable acceptance:** Task 138 can implement both complete editors without generic dialogs or invented conflict/offline/copy presentation; Task 137 remains independently runnable.

**Verification:** `git diff --check`; trace every state/focus destination and only Task 138 release.

**Commit contract:** the four named documents and `DP-VQ04` receipt only; `docs(triage): record DP-VQ04`.

### Task 110: [ ] Record `DP-VQ05` Add/Delete reliability decision

**Files and actions:** modify `docs/recipes/inbox-triage-breakdown-row-empty-visual-recipe.md`, `docs/DESIGN_TOKENS.md`, and `docs/EXECUTION_PLAN.md` to specify Add pending/failure/reconcile and **Add-only Retry** treatment plus Delete deleting/failure/check-again treatment with no dedicated Delete Retry, exact wording, action placement, timing, focus-visible behavior, and eight-theme mappings; change no code.

**Dependencies:** user decision only; no code prerequisite and no other DP task.

**Decision owner:** User. **Receipt:** `DP-VQ05`. **Exact edge:** Task 143 only. **Resume:** complete Add/Delete reliability realization accepted.

**Authority / flows:** `VQ-05`, `UF-07`, `UF-11`, `NEG-21`.

**Recipe:** [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md).

**Observable acceptance:** Add pending, unknown, known failure, Check again, Add-only Retry, and confirmed result remain distinct; Delete failure/unknown keeps the row and exposes Check again/reconciliation with no dedicated Retry, toast, or placeholder fallback.

**Verification:** `git diff --check`; verify the complete state matrix, Add-only Retry wording, explicit absence of Delete Retry, and only Task 143 release.

**Commit contract:** the three named documents and `DP-VQ05` receipt only; `docs(triage): record DP-VQ05`.

### Task 111: [ ] Record `DP-VQ06-POOL` Pool-status decision

**Files and actions:** modify `docs/recipes/inbox-triage-scratch-pool-visual-recipe.md`, `docs/DESIGN_TOKENS.md`, and `docs/EXECUTION_PLAN.md` to specify only Pool hidden-selection, count/indicator, remote/lifecycle status, copy, action, focus, dismissal, and eight-theme treatments; change no Staging/Explorer authority and no code.

**Dependencies:** user decision only; no code prerequisite and no other DP task.

**Decision owner:** User. **Receipt:** `DP-VQ06-POOL`. **Exact edge:** Task 144 only. **Resume:** accepted Pool-specific receipt.

**Authority / flows:** Pool slice of `VQ-06`, `UF-03`, `NEG-21`.

**Recipe:** [`Scratch Pool`](recipes/inbox-triage-scratch-pool-visual-recipe.md).

**Observable acceptance:** Pool status can be implemented independently without borrowing Staging/Explorer or changing selection.

**Verification:** `git diff --check`; verify Pool-only scope and only Task 144 release.

**Commit contract:** the three named documents and `DP-VQ06-POOL` receipt only; `docs(triage): record DP-VQ06 Pool`.

### Task 112: [ ] Record `DP-VQ06-STAGING` Staging-status decision

**Files and actions:** modify `docs/recipes/inbox-triage-staging-visual-recipe.md`, `docs/DESIGN_TOKENS.md`, and `docs/EXECUTION_PLAN.md` to specify only Staging pending/invalid/remote-arrival/orphan/stale/failure/alert/count/action/focus/dismissal and eight-theme treatments; change no Pool/Explorer authority and no code.

**Dependencies:** user decision only; no code prerequisite and no other DP task.

**Decision owner:** User. **Receipt:** `DP-VQ06-STAGING`. **Exact edge:** Task 147 only. **Resume:** accepted Staging-specific receipt.

**Authority / flows:** Staging slice of `VQ-06`, `UF-14`, `UF-16`, `NEG-21`.

**Recipe:** [`Staging`](recipes/inbox-triage-staging-visual-recipe.md).

**Observable acceptance:** Staging statuses have direct section-local authority, including alert lifetime and non-focus-stealing remote arrival.

**Verification:** `git diff --check`; verify Staging-only scope and only Task 147 release.

**Commit contract:** the three named documents and `DP-VQ06-STAGING` receipt only; `docs(triage): record DP-VQ06 Staging`.

### Task 113: [ ] Record `DP-VQ06-EXPLORER` Explorer-status decision

**Files and actions:** modify `docs/recipes/inbox-triage-grid-explorer-visual-recipe.md`, `docs/DESIGN_TOKENS.md`, and `docs/EXECUTION_PLAN.md` to specify only Explorer remote-path/invalid-suffix/selection-disappearance/status/count/alert/action/focus/dismissal and eight-theme treatments; change no Pool/Staging authority and no code.

**Dependencies:** user decision only; no code prerequisite and no other DP task.

**Decision owner:** User. **Receipt:** `DP-VQ06-EXPLORER`. **Exact edge:** Task 150 only. **Resume:** accepted Explorer-specific receipt.

**Authority / flows:** Explorer slice of `VQ-06`, `UF-17`, `NEG-21`.

**Recipe:** [`Grid Explorer`](recipes/inbox-triage-grid-explorer-visual-recipe.md).

**Observable acceptance:** remote-path statuses can be implemented independently without Search/Pool/Staging fallback or focus theft.

**Verification:** `git diff --check`; verify Explorer-only scope and only Task 150 release.

**Commit contract:** the three named documents and `DP-VQ06-EXPLORER` receipt only; `docs(triage): record DP-VQ06 Explorer`.

### Task 114: [ ] Record `DP-VQ07` Explorer replacement-search decision

**Files and actions:** modify `docs/recipes/inbox-triage-grid-explorer-visual-recipe.md`, `docs/DESIGN_TOKENS.md`, and `docs/EXECUTION_PLAN.md` to specify or scope out the complete replacement body for pre-search, results, loading, stale refresh, error, duplicates, reveal, result focus, DnD interruption/reopen, close semantics, and result Undo; change no query behavior/code.

**Dependencies:** user decision only; no code prerequisite and no other DP task.

**Decision owner:** User. **Receipt:** `DP-VQ07`. **Exact edge:** Task 151 and search-only integration Task 158; ordinary-card Undo Task 156 is not blocked. **Resume:** accepted complete search body or explicit scope-out.

**Authority / flows:** `VQ-07`, `UF-18`, `UF-19`, `NEG-10`, `NEG-21`.

**Recipe:** [`Grid Explorer`](recipes/inbox-triage-grid-explorer-visual-recipe.md).

**Observable acceptance:** no active-column/global Search or ordinary columns are needed as body fallback; unrelated ordinary Undo remains runnable.

**Verification:** `git diff --check`; verify complete close/interruption matrix and only search tasks release.

**Commit contract:** the three named documents and `DP-VQ07` receipt only; `docs(triage): record DP-VQ07`.

### Task 115: [ ] Record `DP-VQ08` placement-reliability decision

**Files and actions:** modify `docs/recipes/inbox-triage-placement-affordances-visual-recipe.md`, `docs/DESIGN_TOKENS.md`, and `docs/EXECUTION_PLAN.md` to specify pending, reconciling, explicit failure, stale source/target, Retry/Cancel, success, current-action focus, copy, timing, and eight-theme treatments; change no code.

**Dependencies:** user decision only; no code prerequisite and no other DP task.

**Decision owner:** User. **Receipt:** `DP-VQ08`. **Exact edge:** Task 153 only. **Resume:** accepted complete placement reliability realization.

**Authority / flows:** `VQ-08`, `UF-20`, `UF-21`, `NEG-18`, `NEG-21`.

**Recipe:** [`Placement affordances`](recipes/inbox-triage-placement-affordances-visual-recipe.md).

**Observable acceptance:** every nonterminal outcome stays in the captured placement affordance with an exact focus target and no toast/dialog fallback.

**Verification:** `git diff --check`; confirm no optimistic result/alternate-target implication and only Task 153 release.

**Commit contract:** the three named documents and `DP-VQ08` receipt only; `docs(triage): record DP-VQ08`.

### Task 116: [ ] Record `DP-VQ09` Result Title/direct-limit decision

**Files and actions:** modify `docs/recipes/inbox-triage-placement-affordances-visual-recipe.md`, `docs/DESIGN_TOKENS.md`, and `docs/EXECUTION_PLAN.md` to specify or scope out staged Result Title and direct Node/Bit unavailable-limit bodies, exact reasons, validation, Cancel, focus, and eight-theme treatment; change no code.

**Dependencies:** user decision only; no code prerequisite and no other DP task.

**Decision owner:** User. **Receipt:** `DP-VQ09`. **Exact edge:** Task 154 only. **Resume:** one accepted receipt resolves both staged and direct surfaces.

**Authority / flows:** `VQ-09`, `UF-23`, `NEG-21`.

**Recipe:** [`Placement affordances`](recipes/inbox-triage-placement-affordances-visual-recipe.md).

**Observable acceptance:** Task 154 can handle over-limit staged/direct text without source edits, truncation, create dialogs, or a hidden editor.

**Verification:** `git diff --check`; verify both surfaces and only Task 154 release.

**Commit contract:** the three named documents and `DP-VQ09` receipt only; `docs(triage): record DP-VQ09`.

### Task 117: [ ] Record `DP-VQ10` Newly/Undo decision

**Files and actions:** modify `docs/recipes/inbox-triage-newly-placed-undo-visual-recipe.md`, `docs/DESIGN_TOKENS.md`, and `docs/EXECUTION_PLAN.md` to specify selected+newly overlap, available/ineligible/re-enabled Undo, accessible reasons, undoing/failure/reconcile/retry/conflict, placement, copy, timing, reduced motion, and eight-theme mappings; change no common-card design or code.

**Dependencies:** user decision only; no code prerequisite and no other DP task.

**Decision owner:** User. **Receipt:** `DP-VQ10`. **Exact edge:** Task 157 only. **Resume:** accepted complete Newly/Undo realization.

**Authority / flows:** `VQ-10`, `UF-24`, `UF-25`, `NEG-11`, `NEG-21`, `D-CARD`.

**Recipe:** [`Newly placed and Undo`](recipes/inbox-triage-newly-placed-undo-visual-recipe.md).

**Observable acceptance:** marker, selection, and eligibility remain distinct; reasons are non-hover-only; no repeated motion or card redesign is required.

**Verification:** `git diff --check`; confirm `D-CARD` remains excluded and only Task 157 release.

**Commit contract:** the three named documents and `DP-VQ10` receipt only; `docs(triage): record DP-VQ10`.

### Task 118: [ ] Record `DP-VQ11` completion-blocker decision

**Files and actions:** modify `docs/recipes/inbox-triage-selected-scratch-context-visual-recipe.md`, `docs/recipes/inbox-triage-breakdown-row-empty-visual-recipe.md`, `docs/recipes/inbox-triage-archive-completion-visual-recipe.md`, `docs/DESIGN_TOKENS.md`, and `docs/EXECUTION_PLAN.md` to specify Add/title blockers and eligibility-withdrawal copy, placement, layout, action, effect, focus, and eight-theme mappings; change no completion predicate/headless behavior.

**Dependencies:** user decision only; no code prerequisite and no other DP task.

**Decision owner:** User. **Receipt:** `DP-VQ11`. **Exact edge:** Task 160 only. **Resume:** accepted complete blocker/withdrawal realization.

**Authority / flows:** `VQ-11`, `UF-26`, `UF-27`, `NEG-21`.

**Recipe:** [`Selected Scratch Context`](recipes/inbox-triage-selected-scratch-context-visual-recipe.md), [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md), and [`Archive completion`](recipes/inbox-triage-archive-completion-visual-recipe.md).

**Observable acceptance:** blockers preserve drafts/editors and eligibility loss has exact section-local reporting without auto-save/submit.

**Verification:** `git diff --check`; trace both blocker sources/withdrawal and only Task 160 release.

**Commit contract:** the five named documents and `DP-VQ11` receipt only; `docs(triage): record DP-VQ11`.

### Task 119: [ ] Record `DP-VQ12` Archive-recovery decision

**Files and actions:** modify `docs/recipes/inbox-triage-archive-completion-visual-recipe.md`, `docs/DESIGN_TOKENS.md`, and `docs/EXECUTION_PLAN.md` to specify pending, reconciling, explicit failure, forced-reload recovery, check-again, Retry/Cancel, terminal handoff, current-action focus, copy, timing, and eight-theme variants; change no code.

**Dependencies:** user decision only; no code prerequisite and no other DP task.

**Decision owner:** User. **Receipt:** `DP-VQ12`. **Exact edge:** Task 162 only. **Resume:** accepted complete Archive reliability/recovery realization.

**Authority / flows:** `VQ-12`, `UF-28`, `NEG-17`, `NEG-20`, `NEG-21`.

**Recipe:** [`Archive completion`](recipes/inbox-triage-archive-completion-visual-recipe.md).

**Observable acceptance:** known failure, unknown outcome, recovery, Retry, Cancel, and success are fully specified inside the Breakdown-scoped flow.

**Verification:** `git diff --check`; verify reload/unknown/terminal distinctions and only Task 162 release.

**Commit contract:** the three named documents and `DP-VQ12` receipt only; `docs(triage): record DP-VQ12`.

---

## Phase 25 — Authoritative Command DAG

### Task 120: [ ] Implement Add, Scratch Save, row Save, and row Delete commands

**Files and actions:** modify `src/lib/db/datastore.ts` and `src/lib/db/indexeddb.ts` with typed command/reconcile inputs and results; modify `src/lib/db/scratch-breakdowns.test.ts` and **create** `src/lib/db/inbox-operations.test.ts` using Task 104's real database. Each command validates lifecycle/version inside one transaction, uses preallocated record/operation identity, increments each required surviving owner exactly once, parses writes/results, and classifies complete precondition/postcondition/conflict. Add the explicit **ABA-1 Add→Delete sequence**: an ambiguous Add commits row v1 and Scratch v+1; a later confirmed Delete removes it and advances Scratch again; late Add reconciliation must return `conflict`, leave the row absent, retain the later Scratch revision, and never recreate/resurrect the row. Delete's inverse checks must likewise never report the original Add as not-applied.

**Dependencies:** Tasks 103 and 104.

**Authority / flows:** SCHEMA Add/Save/Delete matrix; `UF-07`, `UF-09`–`UF-12`; `AF-01`, `AF-06`, `AF-07`; `NEG-09`, `NEG-15`, `NEG-19`, `NEG-20`.

**Recipe:** Not applicable — data/nonvisual.

**Observable acceptance:** Add creates one stable row and advances Scratch; saves are conditional with no last-write-wins; Delete retains no partial state; retry is possible only from exact not-applied; ABA-1 produces conflict and no resurrection under every delayed/duplicate reconciliation order.

**Verification:** `pnpm test -- src/lib/db/scratch-breakdowns.test.ts src/lib/db/inbox-operations.test.ts`; include a named ABA-1 assertion for result status, row absence, final Scratch version, and no extra write; then `pnpm typecheck`.

**Commit contract:** four Breakdown commands, real transaction/reconcile tests, and no UI; `feat(triage): add authoritative breakdown commands`.

### Task 121: [ ] Implement Stage and Unstage commands

**Files and actions:** modify `src/lib/db/datastore.ts` and `src/lib/db/indexeddb.ts`; create `src/lib/db/staged-candidates.test.ts`; extend `src/lib/db/inbox-operations.test.ts`. Stage requires active Inbox Scratch, exact unconsumed source/version, absent preallocated candidate ID, and unique source; inserts candidate v1 and advances source. Unstage requires exact candidate/source; deletes only candidate and advances source. Add **ABA-2 Stage→Unstage**: ambiguous Stage commits candidate v1/source v+1; confirmed Unstage deletes candidate/source v+2; late Stage reconcile returns `conflict`, leaves candidate absent/source at later version, and never recreates/restages it. Type change remains Unstage then a new candidate ID/operation.

**Dependencies:** Tasks 103 and 104.

**Authority / flows:** SCHEMA Stage/Unstage matrix; `UF-13`–`UF-15`; `AF-06`–`AF-08`; `NEG-15`, `NEG-16`, `NEG-20`.

**Recipe:** Not applicable — data/nonvisual.

**Observable acceptance:** candidate truth survives route/reload and stores no label; source/candidate changes are atomic; same postcondition replay is idempotent; ABA-2 is conflict with no resurrection; Unstage never consumes source or creates an audit event.

**Verification:** `pnpm test -- src/lib/db/staged-candidates.test.ts src/lib/db/inbox-operations.test.ts`; include exact ABA-2 status/absence/source-version/no-write assertions; then `pnpm typecheck`.

**Commit contract:** Stage/Unstage repository contracts and real transaction tests only; `feat(triage): add durable staging commands`.

### Task 122: [ ] Implement confirmed-orphan cleanup with exact reconciliation

**Files and actions:** modify `src/lib/db/datastore.ts` and `src/lib/db/indexeddb.ts`; create `src/lib/db/candidate-orphan-cleanup.test.ts` on Task 104's real database. Request contains operation ID, preallocated audit ID, exact candidate ID/version/source/Scratch/type, and authoritative `source_deleted`/`source_tombstoned` proof. In one transaction delete the exact candidate and append the exact unique-candidate audit. Define and test: exact audit plus candidate absence = `applied`/`already_applied`; untouched exact candidate/source precondition and no audit = `not_applied`; changed candidate, different audit, partial state, or mismatched proof = `conflict`; cache/offline/delayed/unproved source = `rejected`/unresolved with no write. Inject failure between delete/append and prove rollback; assert aggregate deletion Task 105 remains audit-free and prior audit rows remain indefinitely.

**Dependencies:** Tasks 104, 105, and 121.

**Authority / flows:** SCHEMA Confirmed candidate orphan cleanup and Staged Candidate Integrity; `UF-16`; `AF-04`, `AF-07`, `AF-08`.

**Recipe:** Not applicable — data/nonvisual.

**Observable acceptance:** a local source miss cannot clean anything; confirmed cleanup produces exactly one matching durable event and no candidate; every complete/untouched/partial/mismatched state has the exact authoritative result above; retry cannot append twice.

**Verification:** `pnpm test -- src/lib/db/candidate-orphan-cleanup.test.ts`; inspect every result/status/postcondition, planned-aggregate rejection, and fault checkpoint; then `pnpm typecheck`.

**Commit contract:** confirmed-orphan query/command and exact postcondition/conflict tests only; `feat(triage): audit confirmed candidate orphans`.

### Task 123: [ ] Implement staged and direct Placement commands

**Files and actions:** modify `src/lib/db/datastore.ts` and `src/lib/db/indexeddb.ts`; create `src/lib/db/triage-placement.test.ts`; extend `src/lib/db/inbox-operations.test.ts`. Separate staged/direct typed commands carry preallocated result ID, exact source/candidate versions, intended type/title, target parent, expected ancestor IDs/path, and exact cell. Revalidate active reachability, hierarchy/type, title limits, capacity, candidate/source lifecycle, and cell immediately inside one transaction. Each of the four result constructors—staged Node, staged Bit, direct Node, and direct Bit—explicitly initializes `version: 1` and `pastDeadlineDismissed: false`, then parses the complete record with `nodeSchema` or `bitSchema` before any write. Staged atomically creates result, consumes/advances source, and deletes candidate; direct creates result and consumes/advances source. Reconciliation recognizes only complete all-sides postcondition, exact untouched precondition, or conflict; never alternate target, partial compensation, truncation, title heuristic, or silent resend.

**Dependencies:** Tasks 120 and 121.

**Authority / flows:** SCHEMA staged/direct placement matrix; `UF-20`–`UF-23`; `AF-06`, `AF-07`; `NEG-18`, `NEG-20`.

**Recipe:** Not applicable — data/nonvisual.

**Observable acceptance:** Confirm can yield exactly one actual Node/Bit and complete source/candidate postcondition; all four staged/direct Node/Bit outputs initialize the two required defaults and pass their full schema; stale/full/moved/invalid/over-limit input writes nothing; every injected checkpoint rolls back; unknown result reconciles by IDs/versions only.

**Verification:** `pnpm test -- src/lib/db/triage-placement.test.ts src/lib/db/inbox-operations.test.ts`; for staged Node, staged Bit, direct Node, and direct Bit, assert `version: 1`, `pastDeadlineDismissed: false`, and successful full `nodeSchema`/`bitSchema` parsing; cover every invalidity and checkpoint; then `pnpm typecheck`.

**Commit contract:** two placement commands and real transaction tests only; `feat(triage): add atomic placement commands`.

### Task 124: [ ] Implement source-aware Undo with candidate-version ABA protection

**Files and actions:** modify `src/lib/db/datastore.ts` and `src/lib/db/indexeddb.ts`; create `src/lib/db/triage-undo.test.ts`; extend `src/lib/db/inbox-operations.test.ts`. Undo carries exact result/source/candidate identities, placement post-state versions/timestamps, creation snapshot, and staged/direct provenance. Inside one transaction validate unchanged result lifecycle/direct revision/creation fields, exact consumed source, candidate uniqueness, and zero surviving descendants/unknown mutation; delete exact result and restore/advance source. Staged Undo recreates the **same candidate ID/type/createdAt** at **prior candidate version + 1** with `updatedAt = now`; direct Undo creates none. Add **ABA-3 Place→Undo**: Stage candidate v1, place it, then confirmed Undo recreates that ID at v2; late original Placement and Stage reconciliation both return `conflict`, keep source restored and candidate v2, keep result absent, and never reconsume source, delete/downgrade/recreate candidate v1, or resurrect result. Also test ambiguous Undo followed by a new confirmed placement: late Undo reconciliation conflicts and cannot remove the new result or restore old source state.

**Dependencies:** Task 123.

**Authority / flows:** SCHEMA Undo matrix and ABA conformance; `UF-25`; `AF-06`, `AF-07`; `NEG-18`, `NEG-20`.

**Recipe:** Not applicable — data/nonvisual.

**Observable acceptance:** eligible Undo performs the exact inverse atomically; dependency/mutation blocks all writes; child-first recovery can re-enable; staged provenance returns the same candidate identity at v+1; every ABA-3 late reconcile conflicts with the exact no-resurrection/no-downgrade assertions.

**Verification:** `pnpm test -- src/lib/db/triage-undo.test.ts src/lib/db/inbox-operations.test.ts`; assert ABA-3 final records/versions/timestamps/status and every checkpoint; then `pnpm typecheck`.

**Commit contract:** Undo command and exact staged/direct/dependency/ABA tests only; `feat(triage): add source aware undo command`.

### Task 125: [ ] Implement exact Archive eligibility and guarded Archive command

**Files and actions:** modify `src/lib/db/datastore.ts` and `src/lib/db/indexeddb.ts`; create `src/lib/db/archive-scratch-command.test.ts`; update `src/lib/db/archive.test.ts`. Add authoritative eligibility query and typed Archive request containing Scratch ID/expectedVersion plus an explicit caller assertion that Add-draft and Scratch-title blockers are clear. Repository transaction independently requires active Inbox-owned Scratch, consumed count ≥1, unconsumed count 0, candidate count 0, and exact version, then changes only Scratch `archivedAt`/`mtime`/version. Make generic `archiveBit` reject an Inbox-parented Scratch so no caller can bypass the guarded command; retain generic Direct Archive for ordinary Bits and existing Archive View restore. Test missing/false blocker assertion, durable races, same-ID replay, and rollback.

**Dependencies:** Tasks 120 and 121.

**Authority / flows:** SCHEMA Archive Scratch matrix/eligibility and SPEC coordinator boundary; `UF-26`, `UF-28`; `AF-04`, `AF-06`–`AF-08`.

**Recipe:** Not applicable — data/nonvisual.

**Observable acceptance:** empty/all-deleted/all-staged never qualify; page blocker assertion is required but never substitutes for durable transaction checks; generic `archiveBit(scratchId)` fails without mutation; ordinary Direct Archive/restore remain unchanged; rows/candidates remain retained for restore.

**Verification:** `pnpm test -- src/lib/db/archive-scratch-command.test.ts src/lib/db/archive.test.ts`; include blocker assertion, generic bypass, durable race, same operation, rollback, ordinary Bit, and restore cases; then `pnpm typecheck`.

**Commit contract:** eligibility/guarded Archive command, generic-bypass guard, and exact repository tests only; `feat(triage): guard scratch archive command`.

### Task 126: [ ] Implement Archive recovery classification

**Files and actions:** modify `src/lib/db/datastore.ts` and `src/lib/db/indexeddb.ts`; create `src/lib/db/archive-scratch-recovery.test.ts`. Add read-only classification for a schema-validated `PendingOperationRecovery` using exact current Scratch ID/version/archivedAt plus Breakdown/candidate pre/postconditions: complete Archive postcondition = applied; complete eligible active precondition = not-applied; changed lifecycle/version/eligibility or partial state = conflict; authority unavailable = unknown. Invalid/foreign/stale descriptors fail closed and never invoke mutation. No operation-ID index/log is added; current-tab sessionStorage ownership remains Task 161.

**Dependencies:** Task 125.

**Authority / flows:** SCHEMA forced-Archive recovery and no-journal reconciliation; `UF-28`; `AF-05`, `AF-07`; `NEG-17`, `NEG-20`.

**Recipe:** Not applicable — data/nonvisual.

**Observable acceptance:** classification is read-only, exact, and closed over complete pre/postconditions; invalid identity cannot archive/select/retry; no draft, payload, queue, or general history is persisted.

**Verification:** `pnpm test -- src/lib/db/archive-scratch-recovery.test.ts`; cover applied/not-applied/conflict/unknown/invalid/foreign/stale descriptors and zero writes; then `pnpm typecheck`.

**Commit contract:** recovery read contract/classifier and its dedicated tests only; `feat(triage): classify archive recovery`.

---

## Phase 26 — Lifetime, Copy, And Base-Surface Owners

### Task 127: [ ] Establish canonical session and two-preference ownership

**Files and actions:** modify `src/stores/triage-store.ts` and `.test.ts`; create `src/stores/triage-preferences-store.ts` and `.test.ts`. Add app-session selected Scratch, Pool expanded/manual-reopen/query/result/scroll, and Explorer path/open-columns/column-scroll ownership without removing or renaming the candidate fields/actions that current consumers still call. Retain those candidate fields/actions unchanged as explicitly deprecated, non-authoritative compatibility state; no new consumer may adopt them, and they must not become persisted candidate truth. Task 163 alone removes the compatibility API after every consumer has migrated to the Task 131 durable candidate boundary. Prohibit adding Newly, drafts, active/interrupted Explorer search, placement, completion, or recovery state. Persist and validate exactly Pool created-at sort and Breakdown created-at sort in the preference store, default each independently to DESC, and expose no other persistence.

**Dependencies:** Task 101.

**Authority / flows:** SPEC Inbox/Triage State Ownership; `UF-02`–`UF-04`, `UF-17`; `AF-05`; `NEG-05`, `NEG-17`.

**Recipe:** Not applicable — data/nonvisual.

**Observable acceptance:** same-session route re-entry can restore allowed selection/Pool/Explorer context, reload resets it, and only the two sorts survive. The deprecated candidate fields/actions remain callable with their pre-Task-127 names and behavior while staying non-authoritative and unpersisted; aside from that temporary compatibility surface, neither API can store durable/page/recovery/Newly state.

**Verification:** focused store tests for valid/invalid persisted values, route/reload reset, state-shape exclusions, preserved candidate field/action compatibility plus deprecation, no persisted candidate keys, and no Newly keys; `pnpm typecheck`.

**Commit contract:** the two state owners and tests only; `feat(triage): establish inbox state lifetimes`.

### Task 128: [ ] Create the single core-English copy owner

**Files and actions:** create `src/lib/copy/inbox-triage.ts` and `.test.ts` with typed keys for source-approved section names, base actions, validation, lifecycle reasons, live regions, and accessible names. Represent each unresolved receipt-dependent key as explicitly unavailable—never inferred text. Components may import only this owner for new Inbox/Triage system wording. Tasks 138, 140, 141, 143, 144, 147, 148, 150, 151, 153, 154, 157, 160, and 162 populate only their accepted receipt keys under the `copy` mutex.

**Dependencies:** plan approval/lifecycle only.

**Authority / flows:** SPEC Copy and Localization; `AF-10`; `D-LOCALE` remains excluded.

**Recipe:** Not applicable — data/nonvisual.

**Observable acceptance:** base copy is typed and complete; unresolved VQ strings cannot be accidentally rendered; no component adds a second core-English owner; no locale provider/toggle is introduced.

**Verification:** `pnpm test -- src/lib/copy/inbox-triage.test.ts`; `rg` the triage component directory for newly distributed receipt strings; `pnpm typecheck`.

**Commit contract:** copy resource and its test only; `feat(triage): centralize inbox copy`.

### Task 129: [ ] Build the semantic four-area Inbox shell

**Files and actions:** modify `src/components/triage/triage-workspace.tsx` and `.test.tsx` plus `src/app/globals.css` to implement one semantic tree with visible Scratch Pool, Breakdown, Staging, and Grid Explorer section identities; exact 60/40 main and 60/40 top ratios; theme envelope/data-state roles; desktop 1024px minimum; hidden-scrollbar treatment; and stable focus landmarks. Do not own Explorer item labels, which belong to Task 134, and do not copy prototype state/handlers.

**Dependencies:** Tasks 128 and existing canonical route dispatch.

**Authority / flows:** `UF-01`; `AF-03`, `AF-10`; `NEG-01`, `NEG-02`, `NEG-11`.

**Recipe:** [`Shell and section chrome`](recipes/inbox-triage-shell-section-chrome-visual-recipe.md).

**Observable acceptance:** open the canonical Inbox route and identify all four regions by sight and accessibility tree at 1024px and 1920×1080; theme/mode changes preserve the same component tree and focus.

**Verification:** focused Workspace test, `pnpm lint`, `pnpm typecheck`; run the route in default light/dark at both widths and record landmarks, ratios, focus, captures, and overflow in `docs/verification/inbox-triage/task-129.md`.

**Commit contract:** Workspace shell/test, semantic shell CSS, and Task 129 evidence only; `feat(triage): add semantic inbox shell`.

### Task 130: [ ] Implement Pool selection, tools, collapse, and re-entry

**Files and actions:** modify `src/components/triage/scratch-pool.tsx` and `.test.tsx`, `src/hooks/use-inbox.ts` and `.test.tsx`, `src/stores/triage-store.ts` and `.test.ts`, and `src/stores/triage-preferences-store.ts` and `.test.ts`. Implement active fallback/null, expanded tools/list, total versus filtered counts, base selected/empty states, persisted sort, session query/scroll, vertical collapsed switchers, hidden-query independence, first-printable Breakdown key collapse once, per-Scratch manual-reopen exception, same-session re-entry, and deterministic focus restoration using Task 128 copy. Also modify `src/components/bit-detail/bit-detail-popup.tsx` and `.test.tsx` so the globally mounted detail surface never offers Promote to Node for an Inbox-parented Scratch, even when defensive Chunk data exists; the Task 105A repository guard remains the safety backstop and ordinary Chunk-backed Bit promotion remains available. Do not implement `VQ-01` or Pool `VQ-06` states.

**Dependencies:** Task 105A and Tasks 127–129.

**Authority / flows:** `P23-03`, SCHEMA Hook 9; `UF-02`–`UF-04`; `NEG-05`, `NEG-17`.

**Recipe:** [`Scratch Pool`](recipes/inbox-triage-scratch-pool-visual-recipe.md).

**Observable acceptance:** auto-selection never chooses a hidden mismatch or steals focus; counts differ correctly; collapsed controls ignore hidden query; first-printable collapse/manual reopen/re-entry/reload follow the exact lifetime contract. A defensive Inbox-parented Scratch with Chunks exposes no Promote action, while an ordinary eligible Bit with Chunks still does.

**Verification:** focused Pool/Inbox/store and `bit-detail-popup.test.tsx` tests; run canonical route with populated/filtered/collapsed/re-entry/true-empty seeds and record keyboard/focus/count/capture evidence at 1024px and 1920×1080 in `docs/verification/inbox-triage/task-130.md`; `pnpm typecheck`.

**Commit contract:** Pool/Inbox/state-owner integration, the exact P23-03 popup visibility guard, tests, and Task 130 evidence only; `feat(triage): implement scratch pool base flow`.

### Task 131: [ ] Add the durable candidate reactive boundary

**Files and actions:** create `src/hooks/use-staged-candidates.ts` and `.test.tsx` to subscribe to durable candidates, join authoritative Breakdown content, dispatch Task 121 Stage/Unstage and Task 122 confirmed-orphan commands, project pending/unknown separately from durable truth, and expose authoritative count/eligibility inputs. A cache/offline/delayed miss remains unresolved; it is neither a renderable candidate nor orphan proof. Import no candidate state from Zustand and sequence no component writes.

**Dependencies:** Tasks 121 and 122.

**Authority / flows:** `UF-13`, `UF-16`; `AF-02`, `AF-05`, `AF-08`; `NEG-15`, `NEG-16`.

**Recipe:** Not applicable — data/nonvisual.

**Observable acceptance:** route/reload subscription reconstructs candidates and current source text; remote source edits update labels; unresolved source miss causes no cleanup; components need no Dexie/DataStore import.

**Verification:** `pnpm test -- src/hooks/use-staged-candidates.test.tsx`; cover delayed source, confirmed proof, command result families, counts, and subscription cleanup; `pnpm typecheck`.

**Commit contract:** candidate hook/test only; `feat(triage): add reactive staged candidates`.

### Task 132: [ ] Implement Context and Breakdown base lifecycle

**Files and actions:** modify `src/components/triage/breakdown-panel.tsx` and `.test.tsx`, `src/hooks/use-scratch-breakdowns.ts` and `.test.tsx`, and `src/stores/triage-preferences-store.ts` and `.test.ts`. Render standalone signature Context, full title/time/sort, active/staged/consumed-removal rows, grip/actions, and distinct never-used/all-deleted/ordinary/completion states from repository data and Task 131 projections. Staged rows remain disabled/non-struck; consumed rows leave active Breakdown; preserve visible Edit/Trash slots without implementing VQ editors/statuses.

**Dependencies:** Tasks 120, 127–131.

**Authority / flows:** `UF-06`, `UF-12`; `AF-02`; `NEG-16`.

**Recipe:** [`Selected Scratch Context`](recipes/inbox-triage-selected-scratch-context-visual-recipe.md) and [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md).

**Observable acceptance:** Context is standalone and roughly 2–2.5 rows high; Breakdown sorting is stable; rows omit numbering/time; active/staged/consumed and all empty histories are visibly/semantically distinct without implying completion incorrectly.

**Verification:** focused Breakdown/hook/preference tests; run never-used, all-deleted, active, staged, consumed-removal, and completed seeds in default light/dark and record captures, sorting, focus, and accessibility in `docs/verification/inbox-triage/task-132.md`; `pnpm typecheck`.

**Commit contract:** Context/Breakdown base, tests, and Task 132 evidence only; `feat(triage): build breakdown base surfaces`.

### Task 133: [ ] Implement source-backed Staging base

**Files and actions:** modify `src/components/triage/staging-zone.tsx` and `.test.tsx`, `src/components/triage/triage-drag-token.tsx` and `.test.tsx`. Render Task 131 candidates with visible Staging/Nodes/Bits identity, exact 35/65 split, stable createdAt DESC then ID order, count prefixes at 2+, quiet empty wells, independent hidden-scroll lists, distinct Node-card/Bit-row shapes, whole-root activation semantics, and compact pointer-centered overlay. No large empty cards, internal handles, primary click, permanent Unstage, or `VQ-06` state appearance.

**Dependencies:** Tasks 129 and 131.

**Authority / flows:** `UF-13`; `NEG-06`, `NEG-08`, `NEG-12`.

**Recipe:** [`Staging`](recipes/inbox-triage-staging-visual-recipe.md).

**Observable acceptance:** Nodes/Bits retain distinct shapes and correct split/order/counts; whole roots expose drag semantics without internal grip; last items remain reachable without panel resize or visible scrollbar chrome.

**Verification:** focused Staging/token tests; run empty, one-item, multi-item, overflow, Node/Bit, and pointer-token states at both widths and record captures/interaction/focus in `docs/verification/inbox-triage/task-133.md`; `pnpm typecheck`.

**Commit contract:** Staging/token base, tests, and Task 133 evidence only; `feat(triage): render durable staging base`.

### Task 134: [ ] Implement Explorer columns, full labels, session restoration, and remote anchoring

**Files and actions:** modify `src/components/triage/hierarchy-explorer.tsx` and `.test.tsx`, `src/stores/triage-store.ts` and `.test.ts`. Move hierarchy path/open columns/column scroll to app-session ownership; render Home plus full ancestor/column labels; validate re-entry; anchor remote insertions by first visible stable ID plus offset; fall to nearest valid ancestor without sibling/ghost substitution; restore deterministic heading/ancestor focus; and close stale placement without write. Remove component-local abbreviated labels and active-column filtering, leaving the dedicated search body absent until Task 151.

**Dependencies:** Tasks 127–129 and current reactive grid reads.

**Authority / flows:** `UF-17`; `AF-05`, `AF-09`; `NEG-03`, `NEG-10`.

**Recipe:** [`Grid Explorer`](recipes/inbox-triage-grid-explorer-visual-recipe.md).

**Observable acceptance:** all column/path labels are full; Scratch switch preserves Explorer context; same-session re-entry validates it while reload starts Home; remote inserts preserve anchor/selection/focus and invalid suffix falls only to the nearest valid ancestor.

**Verification:** focused Explorer/store tests; run Home/deep path/re-entry/reload/remote insert/delete/move at both widths and record full-label, anchor, fallback, focus, and capture evidence in `docs/verification/inbox-triage/task-134.md`; `pnpm typecheck`.

**Commit contract:** Explorer base/state ownership, tests, and Task 134 evidence only; `feat(triage): build explorer session columns`.

### Task 135: [ ] Build dedicated whole-hierarchy Explorer query lifecycle

**Files and actions:** create `src/lib/utils/grid-explorer-search.ts` and `.test.ts`; create `src/hooks/use-grid-explorer-search.ts` and `.test.tsx`. The pure utility traverses all active reachable Node/Bit descendants from every visible Home root; excludes Chunks, archived/trashed/system/hidden/unreachable items; uses whitespace AND matching and exact canonical rank/tie order; preserves type/path/ancestor identity for duplicates. The mounted-page hook owns request identity, cancellation, loading/error/stale response, reactive updates, active/interrupted query, result scroll/focus, and result disappearance. It never imports/extends `useSearch()` or `searchAll()` and renders no unsupported body.

**Dependencies:** Task 101 and existing reactive grid reads.

**Authority / flows:** `UF-18`, `UF-19`; `AF-02`, `AF-09`; `NEG-10`.

**Recipe:** [`Grid Explorer`](recipes/inbox-triage-grid-explorer-visual-recipe.md).

**Observable acceptance:** query/ranking/exclusions/duplicates are deterministic; stale requests cannot replace current results; the hook distinguishes active and DnD-interrupted search without persisting either across route exit/reload; global Search code remains untouched.

**Verification:** focused utility/hook tests for traversal, rank, duplicates, request races, reactive updates, disappearance, interruption, and reset; `pnpm typecheck`; `rg` proves no global Search dependency.

**Commit contract:** dedicated search utility/hook and tests only; `feat(triage): add explorer search model`.

---

## Phase 27 — Breakdown, Pool, And Staging Interactions

### Task 136: [ ] Connect headless Add and Delete interaction behavior

**Files and actions:** create mounted-page `src/hooks/use-triage-operation-lock.ts` and `.test.tsx`; modify `src/components/triage/breakdown-panel.tsx` and `.test.tsx`, `src/components/triage/triage-workspace.tsx` and `.test.tsx`, `src/components/triage/scratch-pool.tsx` and `.test.tsx`, and `src/hooks/use-scratch-breakdowns.ts` and `.test.tsx`. Remove the retired test-only `deleteScratchBreakdownsByScratch` mock and its now-vacuous no-call assertion from `src/hooks/use-scratch-breakdowns.test.tsx` (`P23-02`) while replacing that hook's legacy mutation surface. The Workspace-mounted owner exposes synchronous `acquire(kind, operationId)`, `activeOperation`, and terminal `release` for `add|delete|edit|stage|unstage|placement|undo|archive`; acquisition occurs before any asynchronous gap, rejects a duplicate or competing owner, queues nothing, survives pending/unknown/reconciling, and releases only on terminal `applied|not_applied|rejected|conflict`. Its single signal locks Scratch switch, internal route/browser exit, Edit, Placement, Undo, Archive, Cancel/Escape, and duplicate action. Wire Add/Delete acquisition plus base Breakdown Cancel/Escape/duplicate gating and Pool Scratch-switch gating here; Tasks 137, 139, 145, 152, 156, and 161 wire the remaining exact consumers. Dispatch Task 120 Add/Delete commands, retain authoritative rows/drafts through pending or unknown outcomes, submit Add only by Enter or explicit Add, scroll a confirmed row into view, and restore focus after confirmed Delete in the order next row → previous row → Add input → Context. Expose typed operation state slots without choosing `VQ-05` appearance.

**Dependencies:** Tasks 120, 128, 130, and 132.

**Authority / flows:** `P23-02`; `UF-07`, `UF-11`, `UF-12`; `AF-02`, `AF-07`; `NEG-09`.

**Recipe:** [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md).

**Observable acceptance:** blur never submits; duplicate Enter/click or a competing operation produces one command total; unknown Add keeps draft, operation identity, and the complete shared lock; Delete keeps row until terminal success; terminal results release once; Scratch switch and Cancel/Escape are denied while locked without mutation or queued replay; focus/scroll handoff follows the exact order.

**Verification:** focused operation-lock/Breakdown/Workspace/Pool/hook tests; assert every operation kind against the complete mutual-exclusion matrix and terminal release contract, then run Enter/Add, blur, duplicate/competing intent, Scratch switch, Cancel/Escape, unknown reconcile, failed Delete, and confirmed focus paths in the canonical route and record interactions/focus in `docs/verification/inbox-triage/task-136.md`; `pnpm typecheck`.

**Commit contract:** mounted-page operation lock, headless Add/Delete adapter, the exact `P23-02` stale-test cleanup, owner tests, and Task 136 evidence only; `feat(triage): connect locked breakdown commands`.

### Task 137: [ ] Build headless conditional editor and blocker state

**Files and actions:** modify `src/hooks/use-scratch-breakdowns.ts` and `.test.tsx`, `src/components/triage/breakdown-panel.tsx` and `.test.tsx`, and `src/components/triage/triage-workspace.tsx` and `.test.tsx`; extend `src/hooks/use-triage-operation-lock.test.tsx`. Model mounted-page Scratch-title/row base snapshot, draft, pristine/dirty/validation/saving/offline/not-applied/reconciling/conflict/invalidation, acknowledged latest version, copyable invalidated draft, and save-before-action intent over Task 120. Consume Task 136's shared signal: another active operation blocks opening/saving Edit, while an Edit save synchronously acquires `edit` before dispatch and retains the full matrix through unknown/reconciling until terminal release. Expose a synchronous typed Scratch-title blocker snapshot (`open|dirty|saving|conflicted|reconciling`) to external-removal/completion/Archive coordinators. Implement conditional command/focus semantics in tests but render no missing VQ-04 surface and no generic dialog.

**Dependencies:** Tasks 120, 132, and 136.

**Authority / flows:** `UF-09`, `UF-10`; `AF-05`, `AF-06`; `NEG-14`, `NEG-15`, `NEG-19`.

**Recipe:** [`Selected Scratch Context`](recipes/inbox-triage-selected-scratch-context-visual-recipe.md) and [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md).

**Observable acceptance:** the state machine distinguishes every authoritative result, `use mine` targets only acknowledged latest version, `use latest` writes nothing, staged/lifecycle-invalid rows cannot save, and blocker reads are synchronous without requiring Task 138 visuals.

**Verification:** focused operation-lock/hook/Breakdown/Workspace state-machine tests for blocked Edit open/save, Edit acquisition, duplicate/competing action, terminal release, ABA, offline, reconciliation, conflicts, invalidation, save-before-action, blocker snapshots, and deterministic focus intents; `pnpm typecheck`.

**Commit contract:** headless editor/blocker model and tests only; `feat(triage): model conditional inline edits`.

### Task 138: [ ] Render `DP-VQ04` inline editors

**Files and actions:** after `DP-VQ04`, modify `src/components/triage/breakdown-panel.tsx` and `.test.tsx`, `src/app/globals.css`, `src/lib/copy/inbox-triage.ts` and `.test.ts` to populate only approved editor wording and render the Task 137 Scratch/row state machines exactly across validation, saving, offline/not-applied, reconcile, conflict/use-mine/use-latest, invalidation, draft review/copy, actions, focus, reduced motion, and all themes. Never use generic Dialog/AlertDialog.

**Dependencies:** Tasks 109, 128, and 137.

**Authority / flows:** `DP-VQ04`, `UF-09`, `UF-10`; `NEG-14`, `NEG-21`.

**Recipe:** [`Selected Scratch Context`](recipes/inbox-triage-selected-scratch-context-visual-recipe.md) and [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md).

**Observable acceptance:** both editors match every accepted state/copy/focus mapping; Cancel restores current truth; invalidation preserves review/copy; no inline literal or adjacent fallback appears.

**Verification:** focused editor/copy tests; run both editors through every receipt state, keyboard/IME boundary, focus, light/dark, and eight color themes, recording captures/interactions in `docs/verification/inbox-triage/task-138.md`; `pnpm lint`; `pnpm typecheck`.

**Commit contract:** DP-VQ04 copy, realization, tests, styles, and Task 138 evidence only; `feat(triage): render conditional inline editors`.

### Task 139: [ ] Build headless Add-draft departure coordination

**Files and actions:** create `src/hooks/use-triage-departure.ts` and `.test.tsx`; modify `src/components/triage/triage-workspace.tsx` and `.test.tsx` plus `src/components/triage/breakdown-panel.tsx` and `.test.tsx`; extend `src/hooks/use-triage-operation-lock.test.tsx`. Detect non-empty Add draft synchronously; capture one app-internal Scratch/path/route destination; expose Continue writing and Discard and move transitions; replace a stale destination deterministically; clear only the Add draft on discard. Consume Task 136's shared signal before draft handling: any active operation rejects internal Scratch/path/route exit, and the browser/native exit owner installs the standard `beforeunload` prevention while locked; neither path clears, cancels, queues, or replays an intent. Keep browser/native unload presentation separate and render no VQ-03 surface.

**Dependencies:** Tasks 136 and 137.

**Authority / flows:** `UF-08`; `AF-05`; `NEG-17`, `NEG-21`.

**Recipe:** [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md).

**Observable acceptance:** Continue returns focus to intact draft; Discard clears only that draft and performs the latest captured destination once; every shared-lock kind blocks internal and browser exit without clearing state or queuing navigation; competing/stale destinations never leak; external-removal/completion logic can query the headless controller without Task 140.

**Verification:** focused operation-lock/controller/Workspace/Breakdown tests for every lock kind against internal route and `beforeunload` exit, mouse/keyboard destinations, replacement, cancellation, focus intent, no queued replay, and no VQ DOM; `pnpm typecheck`.

**Commit contract:** headless departure controller and tests only; `feat(triage): coordinate add draft departure`.

### Task 140: [ ] Render `DP-VQ03` departure confirmation

**Files and actions:** after `DP-VQ03`, modify `src/components/triage/triage-workspace.tsx` and `.test.tsx`, `src/components/triage/breakdown-panel.tsx` and `.test.tsx`, `src/app/globals.css`, `src/lib/copy/inbox-triage.ts` and `.test.ts` to populate approved wording and render Task 139's Continue writing / Discard and move surface, hierarchy, focus containment/return, theme mapping, and scope-out behavior exactly.

**Dependencies:** Tasks 108, 128, and 139.

**Authority / flows:** `DP-VQ03`, `UF-08`; `NEG-17`, `NEG-21`.

**Recipe:** [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md).

**Observable acceptance:** the approved internal surface is used only for Add-draft departure; actions produce Task 139 transitions exactly; native unload and unrelated confirmations remain separate.

**Verification:** focused component/copy tests; run Scratch/path/route departure with both actions, competing destinations, keyboard/focus, themes, and scope-out case, recording `docs/verification/inbox-triage/task-140.md`; `pnpm typecheck`.

**Commit contract:** DP-VQ03 copy/realization, tests, styles, and Task 140 evidence only; `feat(triage): render add draft departure`.

### Task 141: [ ] Render `DP-VQ01` external Scratch-removal transition

**Files and actions:** after `DP-VQ01`, modify `src/components/triage/scratch-pool.tsx` and `.test.tsx`, `src/components/triage/triage-workspace.tsx` and `.test.tsx`, `src/stores/triage-store.ts` and `.test.ts`, `src/app/globals.css`, `src/lib/copy/inbox-triage.ts` and `.test.ts`. Use headless Tasks 137/139—not VQ-03/04 visuals—to realize external archive/delete countdown, pause/resume, destination revalidation/replacement, full draft copy/status, authoritative restore, terminal removal, selection, and focus exactly. Do not borrow Archive/dialog/Pool chrome.

**Dependencies:** Tasks 106, 128, 130, 136, 137, and 139; deliberately not Tasks 138 or 140.

**Authority / flows:** `DP-VQ01`, `UF-05`; `AF-05`; `NEG-21`.

**Recipe:** [`Scratch Pool`](recipes/inbox-triage-scratch-pool-visual-recipe.md).

**Observable acceptance:** external removal cannot silently lose Add/editor draft or use a stale destination; pause/resume/changed destination/copy/restore/terminal handoff match receipt; unresolved VQ-03/04 appearance does not block this task.

**Verification:** focused Pool/Workspace/store/copy tests with fake timers; run removal with Add draft, each editor headless state, pause/resume, destination mutation, copy, restore, and terminal removal in all themes, recording `docs/verification/inbox-triage/task-141.md`; `pnpm typecheck`.

**Commit contract:** DP-VQ01 copy/transition, tests, styles, and Task 141 evidence only; `feat(triage): handle external scratch removal`.

### Task 142: [ ] Define triage pointer sources and lifecycle snapshots in existing DnD owner

**Files and actions:** modify existing `src/hooks/use-dnd.ts` and `src/hooks/use-triage-dnd.test.ts`, `src/components/triage/breakdown-panel.tsx` and `.test.tsx`, `src/components/triage/staging-zone.tsx` and `.test.tsx`, and `src/components/triage/triage-drag-token.tsx` and `.test.tsx`. Keep general Grid/Calendar DnD behavior separate. `useTriageDnd` uses Mouse 8px and Touch 250ms/5px, captures stable source/candidate/version/type at activation, starts Breakdown only from grip and staged items from whole root, distinguishes Stage/Unstage/Placement intent, keeps a compact pointer-centered token, and cancels mutation on remote invalidation. Add no second triage DnD hook owner.

**Dependencies:** Tasks 131–133.

**Authority / flows:** `UF-12`, `UF-13`; `AF-09`; `NEG-06`, `NEG-12`.

**Recipe:** [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md), [`Staging`](recipes/inbox-triage-staging-visual-recipe.md), and [`Placement affordances`](recipes/inbox-triage-placement-affordances-visual-recipe.md).

**Observable acceptance:** rows never drag outside grip; whole staged roots do; exact sensor thresholds hold; remote change cannot retarget a snapshot; general Grid keyboard DnD remains unchanged.

**Verification:** focused existing DnD/Breakdown/Staging/token tests; run mouse/touch activation, invalidation, Escape, and overlay alignment in canonical route, recording interaction/captures in `docs/verification/inbox-triage/task-142.md`; `pnpm typecheck`.

**Commit contract:** existing DnD triage intent slice, source adapters/tests, and Task 142 evidence only; `feat(triage): define triage pointer sources`.

### Task 143: [ ] Render `DP-VQ05` Add/Delete reliability states

**Files and actions:** after `DP-VQ05`, modify `src/components/triage/breakdown-panel.tsx` and `.test.tsx`, `src/app/globals.css`, `src/lib/copy/inbox-triage.ts` and `.test.ts` to populate approved wording and render Add pending/failure/reconcile states plus Delete deleting/failure/check-again states over Task 136 authoritative operation identities, with exact timing/actions/focus/theme mappings. Add may expose Retry only from authoritative `not_applied` when the receipt specifies it. Delete failure or unknown keeps the row in place and exposes only Check again/reconciliation; Delete has no dedicated Retry action. Do not include Pool `VQ-06`.

**Dependencies:** Tasks 110, 128, and 136.

**Authority / flows:** `DP-VQ05`, `UF-07`, `UF-11`; `NEG-11`, `NEG-21`.

**Recipe:** [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md).

**Observable acceptance:** Add/Delete states are section-local and distinct; any Add Retry exists only for authoritative `not_applied`; every Delete failure/unknown leaves the row in place and offers Check again/reconciliation without a dedicated Retry or resend; focus/copy/theme exactly match receipt.

**Verification:** focused Breakdown/copy state-table tests, including row retention and the absence of a Delete Retry action for every Delete failure/unknown result; run every authoritative result, focus, reduced motion, and theme mapping, recording `docs/verification/inbox-triage/task-143.md`; `pnpm typecheck`.

**Commit contract:** DP-VQ05 copy/realization, tests, styles, and Task 143 evidence only; `feat(triage): render breakdown reliability states`.

### Task 144: [ ] Render `DP-VQ06-POOL` Pool statuses

**Files and actions:** after `DP-VQ06-POOL`, modify `src/components/triage/scratch-pool.tsx` and `.test.tsx`, `src/app/globals.css`, `src/lib/copy/inbox-triage.ts` and `.test.ts` to populate Pool-only approved wording and render hidden-selection, remote/lifecycle, count/indicator, action, focus, dismissal, and all-theme states without changing selection or borrowing Staging/Explorer presentation.

**Dependencies:** Tasks 111, 128, and 130.

**Authority / flows:** `DP-VQ06-POOL`, `UF-03`; `NEG-21`.

**Recipe:** [`Scratch Pool`](recipes/inbox-triage-scratch-pool-visual-recipe.md).

**Observable acceptance:** a filtered selected Scratch remains explicit without auto-selecting another; every Pool receipt state/action/lifetime is exact and section-local.

**Verification:** focused Pool/copy tests; run hidden-selected, remote/lifecycle, dismiss/re-entry, focus, reduced motion, and all themes, recording `docs/verification/inbox-triage/task-144.md`; `pnpm typecheck`.

**Commit contract:** DP-VQ06-POOL copy/realization, tests, styles, and Task 144 evidence only; `feat(triage): render pool statuses`.

### Task 145: [ ] Connect Stage and Unstage interaction adapters

**Files and actions:** modify `src/components/triage/breakdown-panel.tsx`, `src/components/triage/staging-zone.tsx`, `src/components/triage/triage-workspace.tsx`, and their tests; modify `src/hooks/use-staged-candidates.ts` and `.test.tsx` plus existing `src/hooks/use-dnd.ts` and `src/hooks/use-triage-dnd.test.ts`; extend `src/hooks/use-triage-operation-lock.test.tsx`. Dispatch Task 121 commands only from current compatible drops after synchronously acquiring Task 136's shared `stage`/`unstage` lock. Retain that lock and source-backed truth through pending/unknown/reconciling; reject duplicate/competing action, Scratch switch, internal/browser exit, Edit, Placement, Undo, Archive, and Cancel/Escape with no queue or replay; release only on terminal result. Expose transient Staging/Breakdown Unstage targets during matching drags; restore original created-at sort position/source focus after confirmed Unstage; reconcile unknown before Retry; add no permanent Unstage button or success toast.

**Dependencies:** Tasks 121, 131–133, 136, 139, and 142.

**Authority / flows:** `UF-12`, `UF-14`, `UF-15`; `AF-02`, `AF-07`, `AF-09`; `NEG-12`, `NEG-13`, `NEG-15`.

**Recipe:** [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md) and [`Staging`](recipes/inbox-triage-staging-visual-recipe.md).

**Observable acceptance:** Stage/Unstage start only from valid current snapshots/targets and a successful synchronous lock acquisition; durable representations and the complete lock matrix remain through unknown/reconciliation; blocked intents produce no command/navigation/replay; terminal release is exact; confirmed Unstage restores order/focus and has no permanent control/toast.

**Verification:** focused operation-lock/Breakdown/Staging/Workspace/candidate/DnD/departure tests; for Stage and Unstage run the complete matrix, duplicate/competing acquisition, pending/unknown/reconciling/terminal release, success/reject/conflict, navigation, order, and focus flows and record `docs/verification/inbox-triage/task-145.md`; `pnpm typecheck`.

**Commit contract:** headless Stage/Unstage adapters, tests, and Task 145 evidence only; `feat(triage): connect stage and unstage flows`.

### Task 146: [ ] Reconcile remote candidates and confirmed-orphan cleanup

**Files and actions:** modify `src/hooks/use-staged-candidates.ts` and `.test.tsx`, `src/components/triage/staging-zone.tsx` and `.test.tsx`, and existing `src/hooks/use-dnd.ts` and `src/hooks/use-triage-dnd.test.ts`. Separate unresolved subscription miss from authoritative orphan proof; invoke Task 122 only with exact proof/identity; update counts/Archive facts reactively; cancel affected drags after visual snapshot release; preserve selection/focus on remote arrival/removal. Expose typed slots for Task 147 but choose no `VQ-06` appearance.

**Dependencies:** Tasks 122, 131, 133, 142, and 145.

**Authority / flows:** `UF-16`; `AF-02`, `AF-08`; `NEG-16`.

**Recipe:** [`Staging`](recipes/inbox-triage-staging-visual-recipe.md).

**Observable acceptance:** cache/offline/delay never renders/cleans as orphan; confirmed cleanup converges to exact audit-backed state; remote addition never steals focus; invalid drag writes nothing; counts and completion update from truth.

**Verification:** focused hook/Staging/DnD tests; run delayed source, proof cleanup, remote arrival/removal, focus, count, Archive eligibility, and active drag, recording `docs/verification/inbox-triage/task-146.md`; `pnpm typecheck`.

**Commit contract:** remote/integrity adapters, tests, and Task 146 evidence only; `feat(triage): reconcile candidate integrity`.

### Task 147: [ ] Render `DP-VQ06-STAGING` Staging statuses

**Files and actions:** after `DP-VQ06-STAGING`, modify `src/components/triage/staging-zone.tsx` and `.test.tsx`, `src/components/triage/breakdown-panel.tsx` and `.test.tsx`, `src/app/globals.css`, `src/lib/copy/inbox-triage.ts` and `.test.ts` to populate Staging-only wording and render Stage/Unstage pending/invalid/stale/failure, remote arrival, orphan, alert/count/indicator, dismissal/action/focus, reduced-motion, and all-theme states over Tasks 145–146.

**Dependencies:** Tasks 112, 128, 145, and 146.

**Authority / flows:** `DP-VQ06-STAGING`, `UF-14`, `UF-16`; `NEG-11`, `NEG-13`, `NEG-21`.

**Recipe:** [`Staging`](recipes/inbox-triage-staging-visual-recipe.md).

**Observable acceptance:** every receipt state is section-local/distinct, remote arrival never steals focus, alert lifetime is exact, and only terminal success removes/restores durable representations.

**Verification:** focused Staging/Breakdown/copy state-table tests; run each state/dismissal/focus/reduced-motion/theme mapping and record `docs/verification/inbox-triage/task-147.md`; `pnpm typecheck`.

**Commit contract:** DP-VQ06-STAGING copy/realization, tests, styles, and Task 147 evidence only; `feat(triage): render staging statuses`.

### Task 148: [ ] Render `DP-VQ02` Add/Unstage success signal

**Files and actions:** after `DP-VQ02`, modify `src/components/triage/breakdown-panel.tsx` and `.test.tsx`, `src/components/triage/staging-zone.tsx` and `.test.tsx`, `src/app/globals.css`, `src/lib/copy/inbox-triage.ts` and `.test.ts`. Trigger the approved shared one-shot signal only from a newly observed authoritative Add/Unstage success identity, with exact duration/easing/copy/placement/interruption/retrigger, polite announcement, and static reduced-motion distinction. Re-render/reload/reconcile replay never repeats it; Unstage still has no toast.

**Dependencies:** Tasks 107, 128, 136, and 145.

**Authority / flows:** `DP-VQ02`, `UF-07`, `UF-15`; `NEG-11`, `NEG-13`.

**Recipe:** [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md) and [`Staging`](recipes/inbox-triage-staging-visual-recipe.md).

**Observable acceptance:** one operation identity triggers once, later identities retrigger once, interruption follows receipt, focus stays put, reduced motion remains perceivable, and routine Unstage produces no toast.

**Verification:** focused fake-timer/motion/copy tests; run Add and Unstage success, replay, interruption, focus, announcement, reduced motion, and themes, recording `docs/verification/inbox-triage/task-148.md`; `pnpm typecheck`.

**Commit contract:** DP-VQ02 copy/signal, tests, styles, and Task 148 evidence only; `feat(triage): render authoritative success signal`.

---

## Phase 28 — Explorer Search And Pointer Placement

### Task 149: [ ] Implement release-time targets and valid-column edge auto-scroll

**Files and actions:** modify existing `src/hooks/use-dnd.ts` and `src/hooks/use-triage-dnd.test.ts`, `src/components/triage/hierarchy-explorer.tsx` and `.test.tsx`, and `src/components/triage/triage-workspace.tsx` and `.test.tsx`. Disable DndContext/library auto-scroll for triage; compute valid/invalid/full target feedback; progressively scroll only the currently valid Explorer column near its top/bottom edge without jumps/path changes; continuously hit-test pointer-under geometry and use the final rendered release target; stop on exit/end; never scroll invalid columns, shell, or page. A full target remains a selected release target for Task 152 rather than being discarded.

**Dependencies:** Tasks 134 and 142.

**Authority / flows:** `UF-22`; `AF-09`; `NEG-06`, `NEG-07`.

**Recipe:** [`Grid Explorer`](recipes/inbox-triage-grid-explorer-visual-recipe.md) and [`Placement affordances`](recipes/inbox-triage-placement-affordances-visual-recipe.md).

**Observable acceptance:** invalid targets never scroll/confirm; valid-column edge motion is progressive and isolated; full target advances as a full target; release-time DOM geometry—not stale hover—wins; Escape/remote invalidation cancels.

**Verification:** focused DnD/Explorer/Workspace tests with mocked rectangles/scroll; run mouse/touch edge entry/exit, column crossing, full/invalid, DOM move before release, Escape, and remote invalidation, recording `docs/verification/inbox-triage/task-149.md`; `pnpm typecheck`.

**Commit contract:** existing DnD target/auto-scroll mechanics, tests, and Task 149 evidence only; `feat(triage): add explorer drag targeting`.

### Task 150: [ ] Render `DP-VQ06-EXPLORER` remote/path statuses

**Files and actions:** after `DP-VQ06-EXPLORER`, modify `src/components/triage/hierarchy-explorer.tsx` and `.test.tsx`, `src/stores/triage-store.ts` and `.test.ts`, `src/app/globals.css`, `src/lib/copy/inbox-triage.ts` and `.test.ts` to populate Explorer-only wording and render remote path change, invalid suffix fallback, selected-item disappearance, count/indicator, alert/dismissal, action/focus, reduced-motion, and theme states while preserving stable-ID/offset anchoring. Do not borrow Search, Pool, or Staging realization.

**Dependencies:** Tasks 113, 128, and 134.

**Authority / flows:** `DP-VQ06-EXPLORER`, `UF-17`; `AF-05`, `AF-09`; `NEG-03`, `NEG-21`.

**Recipe:** [`Grid Explorer`](recipes/inbox-triage-grid-explorer-visual-recipe.md).

**Observable acceptance:** remote change never substitutes a sibling/ghost; nearest valid ancestor/focus/status/dismissal match receipt and never steal focus; full labels remain intact.

**Verification:** focused Explorer/store/copy tests; run remote insert/delete/move, selected disappearance, fallback, dismiss/re-entry, focus, reduced motion, and all themes, recording `docs/verification/inbox-triage/task-150.md`; `pnpm typecheck`.

**Commit contract:** DP-VQ06-EXPLORER copy/realization, tests, styles, and Task 150 evidence only; `feat(triage): render explorer remote states`.

### Task 151: [ ] Render `DP-VQ07` dedicated Explorer search body and close semantics

**Files and actions:** after `DP-VQ07`, create `src/components/triage/grid-explorer-search-results.tsx` and `.test.tsx`; modify `src/components/triage/hierarchy-explorer.tsx` and `.test.tsx`, `src/hooks/use-grid-explorer-search.ts` and `.test.tsx`, `src/app/globals.css`, `src/lib/copy/inbox-triage.ts` and `.test.ts`. Render the approved complete replacement body over Task 135 with pre-search/results/loading/stale/error/duplicates, scrolling, Arrow/Enter selection, stale revalidation, reveal, and focus. Implement the exact close matrix: **DnD start is the only close that preserves query/results/scroll as interrupted state**; Drop/Cancel never auto-return and explicit reopen restores it. A valid reachable result selection closes the search body and clears active/interrupted search state, reconstructs the real item path, selects/reveals that item, and starts an event-ended—never timer-ended—reveal. If selection-time revalidation finds the result stale, removed, hidden, or unreachable, keep the search body/query/results/scroll, refresh the result set, report the stale status, and perform no path reconstruction, selection, reveal, or navigation. A successful reveal ends on another item selection, path change, DnD start, search restart, or route exit. X, Escape, and Inbox route exit clear active/interrupted query/results/scroll and any reveal; Scratch switch preserves current search and reveal without forcing focus. Results are not DnD sources and global Search remains untouched.

**Dependencies:** Tasks 114, 128, 134, and 135.

**Authority / flows:** `DP-VQ07`, `UF-18`, `UF-19`; `AF-02`, `AF-09`; `NEG-10`, `NEG-21`.

**Recipe:** [`Grid Explorer`](recipes/inbox-triage-grid-explorer-visual-recipe.md).

**Observable acceptance:** whole-hierarchy results/ranking/duplicates render in the dedicated component; valid selection closes search, reconstructs the path, and starts the real item's event-ended reveal; a stale selection retains search, refreshes/reports status, and performs no reveal/navigation; DnD interruption alone preserves query/results/scroll; X/Escape/route exit clear search and reveal; focused disappearance returns input; every reopen/Scratch-switch path matches the close matrix exactly.

**Verification:** focused utility/hook/results/Explorer/copy tests; assert valid selection closes the body, reconstructs the path, starts reveal, and ends reveal only on each named lifecycle event; assert each stale/removed/hidden/unreachable selection retains body/query/results/scroll, refreshes and reports status, and changes no path/selection/reveal/navigation; run every close path, DnD reopen, Scratch switch, focus, themes, and global Search preservation, recording `docs/verification/inbox-triage/task-151.md`; `pnpm typecheck`.

**Commit contract:** DP-VQ07 copy/search body, integration, tests, styles, and Task 151 evidence only; `feat(triage): render explorer hierarchy search`.

### Task 152: [ ] Connect direct/staged placement selection and confirmation

**Files and actions:** create `src/hooks/use-triage-placement.ts` and `.test.tsx`; modify existing `src/hooks/use-dnd.ts` and `src/hooks/use-triage-dnd.test.ts`, `src/components/triage/hierarchy-explorer.tsx` and `.test.tsx`, and `src/components/triage/triage-workspace.tsx` and `.test.tsx`; extend `src/hooks/use-triage-operation-lock.test.tsx`. Own the complete mounted-page foreground state machine: staged release target; direct **Node/Bit type plus destination/path selection**; target-column confirmation; source/target/version snapshot; focus/locks; explicit Confirm/Cancel; one Task 123 dispatch; reconcile unknown. Before dispatch, synchronously acquire Task 136's shared `placement` lock; retain it through pending/unknown/reconciling, deny the complete matrix including placement Cancel/Escape and duplicate Confirm without queue/replay, and release only on terminal result. Another active owner blocks placement start/Confirm. A full destination must open the same target-column affordance with a **visible full-target reason, disabled Confirm, and working Cancel**. Drop alone writes nothing; no alternate parent/sibling/cell, keyboard placement, picker, or hidden shortcut. Integrate with Task 135 headless search so placement can close/lock it without requiring VQ-07 UI.

**Dependencies:** Tasks 123, 128, 134, 135, 136, 139, 145, and 149.

**Authority / flows:** `UF-20`–`UF-22`; `AF-06`, `AF-07`, `AF-09`; `NEG-07`, `NEG-18`.

**Recipe:** [`Placement affordances`](recipes/inbox-triage-placement-affordances-visual-recipe.md).

**Observable acceptance:** direct placement cannot skip type+path; staged/direct each reach a distinct target-column confirmation; full target shows exact source-backed base reason with disabled Confirm and Cancel; valid Confirm acquires once, revalidates, and dispatches once; pending/unknown retains the complete lock, Cancel/Escape/duplicates/competing actions write nothing, and terminal release is exact; pre-dispatch Cancel returns source; every invalid/stale state writes nothing.

**Verification:** focused operation-lock/placement/DnD/Explorer/Workspace/departure tests; run staged/direct Node/Bit type+path, full target, valid/invalid/stale/moved, the complete pending matrix, pre-dispatch versus pending Confirm/Cancel/Escape, duplicate/competing intent, terminal release, focus, and unknown reconciliation, recording `docs/verification/inbox-triage/task-152.md`; `pnpm typecheck`.

**Commit contract:** base placement coordinator/adapters, tests, and Task 152 evidence only; `feat(triage): connect atomic pointer placement`.

### Task 153: [ ] Render `DP-VQ08` placement reliability states

**Files and actions:** after `DP-VQ08`, modify `src/hooks/use-triage-placement.ts` and `.test.tsx`, `src/components/triage/hierarchy-explorer.tsx` and `.test.tsx`, `src/app/globals.css`, `src/lib/copy/inbox-triage.ts` and `.test.ts` to populate approved wording and render pending, reconciling, explicit failure, stale source/target, Retry/Cancel, success, timing, focus, reduced-motion, and theme states within Task 152's captured affordance. Source truth/destination remain visible until authoritative resolution; Retry only from not-applied; unknown offers Check again. Share no dependency with Task 154; the writer mutex serializes their common files.

**Dependencies:** Tasks 115, 128, and 152.

**Authority / flows:** `DP-VQ08`, `UF-20`, `UF-21`; `AF-07`; `NEG-18`, `NEG-21`.

**Recipe:** [`Placement affordances`](recipes/inbox-triage-placement-affordances-visual-recipe.md).

**Observable acceptance:** every result family and receipt state is distinct; no optimistic result, blind resend, or alternate target occurs; current-action focus is stable.

**Verification:** focused placement/Explorer/copy state-table tests; run every authoritative result, Retry/Check again/Cancel, focus, reduced motion, and all themes, recording `docs/verification/inbox-triage/task-153.md`; `pnpm typecheck`.

**Commit contract:** DP-VQ08 copy/realization, tests, styles, and Task 153 evidence only; `feat(triage): render placement reliability states`.

### Task 154: [ ] Render `DP-VQ09` Result Title and direct-limit surfaces

**Files and actions:** after `DP-VQ09`, modify `src/hooks/use-triage-placement.ts` and `.test.tsx`, `src/components/triage/hierarchy-explorer.tsx` and `.test.tsx`, `src/app/globals.css`, `src/lib/copy/inbox-triage.ts` and `.test.ts` to populate approved wording and render staged over-limit Result Title without editing source plus direct Node/Bit availability/reason states, validation, Cancel, focus, reduced motion, and themes. Preserve source/target snapshot; direct `1–100` permits Node/Bit, `101–200` Bit only, `201–1000` neither; never truncate, expose hidden direct editor, or reuse create dialogs. Share no dependency with Task 153; the writer mutex serializes common files.

**Dependencies:** Tasks 116, 128, and 152.

**Authority / flows:** `DP-VQ09`, `UF-23`; `NEG-18`, `NEG-21`.

**Recipe:** [`Placement affordances`](recipes/inbox-triage-placement-affordances-visual-recipe.md).

**Observable acceptance:** staged title can be valid/untruncated while original text remains; direct unavailable types expose exact reasons and no write/editor; Cancel/source change clears only this draft and restores focus.

**Verification:** focused placement/Explorer/copy tests for boundary lengths, whitespace, staged/direct difference, preservation, invalidation, focus, reduced motion, and themes, recording `docs/verification/inbox-triage/task-154.md`; `pnpm typecheck`.

**Commit contract:** DP-VQ09 copy/realization, tests, styles, and Task 154 evidence only; `feat(triage): render placement title limits`.

---

## Phase 29 — Mounted-Page Newly Placed And Undo

### Task 155: [ ] Project Newly Placed provenance over actual cards

**Files and actions:** create canonical `src/hooks/use-triage-newly-placed.ts` and `.test.tsx`; modify `src/components/triage/triage-workspace.tsx` and `.test.tsx`, `src/components/triage/hierarchy-explorer.tsx` and `.test.tsx`, `src/components/grid/node-card.tsx` and `.test.tsx`, and `src/components/grid/bit-card.tsx` and `.test.tsx`. Instantiate the hook at the mounted Inbox page/workspace, never in `triage-store`; register only Task 152 placements started/confirmed by that mounted page using stable result/type/source/candidate/operation provenance; layer a semantic marker slot on actual NodeCard/BitCard; pin locally new Nodes/Bits newest-first within their type projection without changing stored x/y; preserve marker across Scratch/path/theme changes; clear marker/pinning/Undo provenance on Inbox route exit/reload/unmount, not Scratch switch. Remote/other-tab records remain ordinary. Add no second Newly owner and do not redesign cards.

**Dependencies:** Tasks 123 and 152.

**Authority / flows:** `UF-24`; `AF-05`, `AF-09`; `NEG-11`, `NEG-17`; `D-CARD`.

**Recipe:** [`Newly placed and Undo`](recipes/inbox-triage-newly-placed-undo-visual-recipe.md).

**Observable acceptance:** marker is on the real card, independent from selection, and appears only for local mounted-page results; x/y remains unchanged; multiple markers/type pinning survive Scratch/path/theme change; route exit/reload clears; no Zustand/Newly persistence or duplicate card model exists.

**Verification:** focused hook/Workspace/Explorer/NodeCard/BitCard tests; run local/remote Node/Bit, multiple results, selection overlap semantics, pinning, Scratch/path/theme, route exit, and reload, recording `docs/verification/inbox-triage/task-155.md`; `pnpm typecheck`.

**Commit contract:** canonical mounted-page Newly owner, actual-card semantic slots, tests, and Task 155 evidence only; `feat(triage): project newly placed cards`.

### Task 156: [ ] Connect ordinary-card source-aware Undo independently of search

**Files and actions:** modify `src/hooks/use-triage-newly-placed.ts` and `.test.tsx`, `src/components/triage/hierarchy-explorer.tsx` and `.test.tsx`, `src/components/grid/node-card.tsx` and `.test.tsx`, and `src/components/grid/bit-card.tsx` and `.test.tsx`; extend `src/hooks/use-triage-operation-lock.test.tsx`. Derive ordinary-card Undo availability/reason from exact current result/source/candidate/dependency truth; keep marker and eligibility separate; stop Undo activation from bubbling into card navigation. Before dispatch, synchronously acquire Task 136's shared `undo` lock; retain actual card/source and the complete matrix through pending/unknown/reconciling, reject duplicate/competing action without queue/replay, and release only on terminal result. Another active owner, result mutation, descendants, open placement, or dirty Edit intent disables Undo; re-enable after terminal release or child-first Undo. Restore staged/direct source/candidate/path and focus. Do not import or depend on Explorer search or `DP-VQ07`.

**Dependencies:** Tasks 124, 136, 137, 139, 152, and 155; deliberately not Tasks 114 or 151.

**Authority / flows:** ordinary-column portion of `UF-25`; `AF-02`, `AF-07`, `AF-09`; `NEG-18`, `NEG-20`.

**Recipe:** [`Newly placed and Undo`](recipes/inbox-triage-newly-placed-undo-visual-recipe.md).

**Observable acceptance:** ordinary cards expose base Undo placement/semantics without Search; selection/navigation never revokes eligibility; Undo acquires once, keeps the full matrix through unknown/reconciliation, and releases only at terminal; blocked intents write/navigate/replay nothing; child-first recovery re-enables; staged restores same candidate provenance, direct does not invent one; success focuses next card → previous → column heading.

**Verification:** focused operation-lock/hook/Explorer/card/departure tests for staged/direct, the complete pending matrix, duplicate/competing acquisition, mutation, descendants, child-first, dirty Edit, pending/unknown/reconcile/terminal release, event propagation, and focus; run ordinary-card flows and record `docs/verification/inbox-triage/task-156.md`; `pnpm typecheck`.

**Commit contract:** ordinary-card Undo model/adapter, tests, and Task 156 evidence only; `feat(triage): connect ordinary card undo`.

### Task 157: [ ] Render `DP-VQ10` Newly and Undo states

**Files and actions:** after `DP-VQ10`, modify `src/hooks/use-triage-newly-placed.ts` and `.test.tsx`, `src/components/triage/hierarchy-explorer.tsx` and `.test.tsx`, `src/components/grid/node-card.tsx` and `.test.tsx`, `src/components/grid/bit-card.tsx` and `.test.tsx`, `src/app/globals.css`, `src/lib/copy/inbox-triage.ts` and `.test.ts`. Populate approved wording and render selected+newly overlap, available/ineligible/re-enabled reasons, undoing/failure/reconcile/retry/conflict, marker/control placement, timing, focus, reduced motion, and themes without repeated motion or common-card redesign.

**Dependencies:** Tasks 117, 128, 155, and 156.

**Authority / flows:** `DP-VQ10`, `UF-24`, `UF-25`; `NEG-11`, `NEG-21`; `D-CARD`.

**Recipe:** [`Newly placed and Undo`](recipes/inbox-triage-newly-placed-undo-visual-recipe.md).

**Observable acceptance:** marker, selection, and eligibility are independently perceivable; reasons work by keyboard/touch without hover; all result states are exact; no pulse/flicker or card redesign occurs.

**Verification:** focused hook/Explorer/card/copy state tests; run overlap, every reason/result, child-first re-enable, keyboard/touch, focus, reduced motion, and themes, recording `docs/verification/inbox-triage/task-157.md`; `pnpm typecheck`.

**Commit contract:** DP-VQ10 copy/realization, tests, styles, and Task 157 evidence only; `feat(triage): render newly placed undo states`.

### Task 158: [ ] Integrate Undo into Explorer search results only

**Files and actions:** modify `src/components/triage/grid-explorer-search-results.tsx` and `.test.tsx`, `src/components/triage/hierarchy-explorer.tsx` and `.test.tsx`, `src/hooks/use-grid-explorer-search.ts` and `.test.tsx`, and `src/hooks/use-triage-newly-placed.ts` and `.test.tsx`. Reuse Tasks 156–157 Undo model/realization in the `DP-VQ07` body without making search rows DnD sources. Locally placed records enter matching results immediately. Undo from a result retains active query/scroll, removes only the undone result after terminal success, announces source restoration, and focuses the next surviving result at the removed row's position when one exists; otherwise it focuses the search input, with no previous-result fallback. Unknown/failure keeps the result. Do not change ordinary-column Undo dependencies or behavior.

**Dependencies:** Tasks 114, 151, 156, and 157.

**Authority / flows:** search-only portions of `UF-19`, `UF-25`; `AF-02`, `AF-09`; `NEG-10`, `NEG-18`.

**Recipe:** [`Grid Explorer`](recipes/inbox-triage-grid-explorer-visual-recipe.md) and [`Newly placed and Undo`](recipes/inbox-triage-newly-placed-undo-visual-recipe.md).

**Observable acceptance:** result Undo preserves query, removes only the terminally undone result, focuses the next result or otherwise the search input with no previous-result fallback, and never becomes a drag source; ordinary Undo remains usable even if `DP-VQ07`/Task 151 was delayed before this search-only task.

**Verification:** focused results/search/Newly/Explorer tests; run matching/nonmatching local result, pending/failure/unknown/success, list-edge focus, query retention, route exit, and ordinary-column regression, recording `docs/verification/inbox-triage/task-158.md`; `pnpm typecheck`.

**Commit contract:** search-result Undo integration, tests, and Task 158 evidence only; `feat(triage): integrate undo in explorer search`.

---

## Phase 30 — Completion And Archive Recovery

### Task 159: [ ] Implement durable completion, Cancel, and explicit reopen

**Files and actions:** modify `src/hooks/use-can-archive-scratch.ts` and `.test.ts`, `src/components/triage/breakdown-panel.tsx` and `.test.tsx`, and `src/components/triage/triage-workspace.tsx` and `.test.tsx`. Subscribe to Task 125 eligibility: active Scratch, consumed≥1, unconsumed=0, staged=0; combine but do not persist Task 136 non-empty Add-draft and Task 137 Scratch-title blocker snapshots. Only a mounted-page false→true transition auto-opens the source-backed Breakdown-scoped completion overlay. Cancel closes it, restores Add entry, changes Context to complete, and exposes an explicit Reopen control. Scratch return, same-session re-entry, route entry, or reload onto already eligible truth shows complete Context/Reopen and **never auto-reopens**. Reopen is explicit and restores heading/safe-Cancel focus; new active row/candidate withdraws overlay/complete/reopen. Do not depend on VQ-03/04 realization.

**Dependencies:** Tasks 125, 127, 131, 136, 137, and 145; deliberately not Tasks 138 or 140.

**Authority / flows:** `UF-26`, `UF-27`; `AF-02`, `AF-05`, `AF-08`; `NEG-17`.

**Recipe:** [`Selected Scratch Context`](recipes/inbox-triage-selected-scratch-context-visual-recipe.md), [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md), and [`Archive completion`](recipes/inbox-triage-archive-completion-visual-recipe.md).

**Observable acceptance:** never-used/all-deleted/all-staged are ineligible; first false→true opens once; Cancel yields complete/Reopen; every return/re-entry/reload requires explicit Reopen; Context remains visible, other sections/eligible Undo remain reachable, and no draft/editor auto-saves or submits.

**Verification:** focused eligibility/Breakdown/Workspace tests; run every count combination, blocker state, first transition, Cancel/Reopen focus, Scratch switch/return, route re-entry/reload, and eligibility withdrawal/recovery, recording `docs/verification/inbox-triage/task-159.md`; `pnpm typecheck`.

**Commit contract:** completion projection/base overlay, tests, and Task 159 evidence only; `feat(triage): build durable completion flow`.

### Task 160: [ ] Render `DP-VQ11` completion blockers and withdrawal

**Files and actions:** after `DP-VQ11`, modify `src/hooks/use-can-archive-scratch.ts` and `.test.ts`, `src/components/triage/breakdown-panel.tsx` and `.test.tsx`, `src/components/triage/triage-workspace.tsx` and `.test.tsx`, `src/app/globals.css`, `src/lib/copy/inbox-triage.ts` and `.test.ts`. Populate approved wording and render non-empty Add-draft and each Scratch-title blocker plus remote eligibility-withdrawal realization, exact actions/focus/effects/reduced-motion/themes, without altering text or falling back to toast/empty state.

**Dependencies:** Tasks 118, 128, 137, and 159.

**Authority / flows:** `DP-VQ11`, `UF-26`, `UF-27`; `NEG-11`, `NEG-17`, `NEG-21`.

**Recipe:** [`Selected Scratch Context`](recipes/inbox-triage-selected-scratch-context-visual-recipe.md), [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md), and [`Archive completion`](recipes/inbox-triage-archive-completion-visual-recipe.md).

**Observable acceptance:** blocker actions preserve draft/editor and logical focus; loss of eligibility withdraws overlay/complete/reopen with exact reason; recovery follows truth; no blocker auto-saves/submits/persists.

**Verification:** focused hook/Breakdown/Workspace/copy state tests; run both blocker families, every editor state, remote candidate/row change, withdrawal/recovery, focus, reduced motion, and themes, recording `docs/verification/inbox-triage/task-160.md`; `pnpm typecheck`.

**Commit contract:** DP-VQ11 copy/realization, tests, styles, and Task 160 evidence only; `feat(triage): render completion blockers`.

### Task 161: [ ] Coordinate guarded Archive, current-tab recovery, and exact handoff

**Files and actions:** modify `src/hooks/use-archive-scratch.ts` and create `src/hooks/use-archive-scratch.test.ts`; modify `src/components/triage/breakdown-panel.tsx` and `.test.tsx`, `src/components/triage/triage-workspace.tsx` and `.test.tsx`, `src/components/triage/scratch-pool.tsx` and `.test.tsx`, `src/stores/triage-store.ts` and `.test.ts`, `src/hooks/use-triage-placement.ts` and `.test.tsx`, and `src/hooks/use-triage-newly-placed.ts` and `.test.tsx`; extend `src/hooks/use-triage-operation-lock.test.tsx`. Immediately before Archive dispatch, synchronously recheck Task 136 Add-draft plus Task 137 title-editor blockers; if clear, acquire the Task 136 shared `archive` lock before any asynchronous gap, create one Task 125 request, and create the schema-validated Task 126 recovery descriptor. The already-wired shared signal reaches Task 137 Edit, Task 139 internal/browser exit, Task 145 Stage/Unstage, Task 152 Placement, Task 156 Undo, Breakdown Cancel/Escape/duplicate Archive, and Pool Scratch switch; retain it through pending/unknown/reconciling until terminal `applied`, `not_applied`, `rejected`, or `conflict`, rejecting every competing intent without queue/replay. Successfully write the descriptor to **current-tab `sessionStorage` before dispatch**; unavailable, denied, quota, serialization, or readback failure must fail closed with no command and release the unstarted lock. Retain descriptor through pending/unknown and until terminal reconciliation; clear only terminal applied/not-applied/rejected/conflict. On reload, read/validate/discard-invalid and reconcile before initial Inbox projection or any new dispatch. On confirmed success preserve Pool query/sort and select next-visible, then previous-visible; whenever either visible Scratch is selected, focus its newly selected Scratch Context. If a filter leaves no visible Scratch, select `null` and focus search input/clear; if no active Scratch and no filter, show true empty and focus primary action. Never choose hidden Scratch or navigate to Archive View.

**Dependencies:** Tasks 126, 127, 130, 136, 137, 139, 145, 152, 156, and 159.

**Authority / flows:** `UF-28`; `AF-04`, `AF-05`, `AF-07`; `NEG-17`, `NEG-20`.

**Recipe:** [`Archive completion`](recipes/inbox-triage-archive-completion-visual-recipe.md).

**Observable acceptance:** blocker race after clicking Archive prevents dispatch; descriptor storage always precedes command and every storage failure invokes zero commands; reload reconciliation precedes normal projection; pending/unknown/reconciling keeps selected Scratch, descriptor, and the complete shared lock matrix; each blocked intent is rejected without mutation or queued replay; terminal applied/not-applied/rejected/conflict clears the lock and descriptor; success selects exact next-visible then previous-visible and focuses the newly selected Scratch Context, otherwise performs the filtered-null/true-empty focus handoff.

**Verification:** focused operation-lock/Archive hook/Breakdown/Workspace/Pool/store/departure/placement/Newly tests for synchronous blocker race, every storage exception/readback failure, write-before-dispatch order, valid/invalid reload, applied/not-applied/**rejected**/conflict/unknown/reconciling, descriptor retention/clear, and every Scratch-switch/internal-route/browser-exit/Edit/Placement/Undo/Archive/Cancel/Escape/duplicate-action edge with no mutation or replay; run all four handoffs, assert Context focus after next/previous-visible selection, Direct Archive/restore regression, and the full forced-reload flow in the canonical route, recording `docs/verification/inbox-triage/task-161.md`; `pnpm typecheck`.

**Commit contract:** Archive coordinator/storage/handoff, tests, and Task 161 evidence only; `feat(triage): coordinate recoverable scratch archive`.

### Task 162: [ ] Render `DP-VQ12` Archive reliability and recovery states

**Files and actions:** after `DP-VQ12`, modify `src/hooks/use-archive-scratch.ts` and `.test.ts`, `src/components/triage/breakdown-panel.tsx` and `.test.tsx`, `src/app/globals.css`, `src/lib/copy/inbox-triage.ts` and `.test.ts` to populate approved wording and render pending, reconciling, explicit failure, forced-reload recovery, Check again, Retry/Cancel, terminal handoff, current-action focus, timing, reduced-motion, and theme variants inside the Breakdown-scoped flow. Retry is unavailable until authoritative not-applied; unknown retains same descriptor/operation; no global spinner/toast/dialog.

**Dependencies:** Tasks 119, 128, and 161.

**Authority / flows:** `DP-VQ12`, `UF-28`; `AF-05`, `AF-07`; `NEG-11`, `NEG-20`, `NEG-21`.

**Recipe:** [`Archive completion`](recipes/inbox-triage-archive-completion-visual-recipe.md).

**Observable acceptance:** known not-applied, still unknown, rejected/conflict, and success are distinct; current-action focus survives; reload recovery uses exact receipt state; no blind resend or fallback surface occurs.

**Verification:** focused Archive/copy state-table/storage tests; run every result/reload/check-again/Retry/Cancel/focus/reduced-motion/theme variant and record `docs/verification/inbox-triage/task-162.md`; `pnpm typecheck`.

**Commit contract:** DP-VQ12 copy/realization, tests, styles, and Task 162 evidence only; `feat(triage): render archive recovery states`.

---

## Phase 31 — Integration, Conformance, And Full Gate

### Task 163: [ ] Integrate the canonical route and remove superseded owners

**Files and actions:** modify `src/app/(grid)/grid/[nodeId]/page.tsx`, `src/components/layout/grid-runtime.tsx` and `.test.tsx`, `src/components/triage/triage-workspace.tsx` and `.test.tsx`, existing `src/hooks/use-dnd.ts` and `src/hooks/use-triage-dnd.test.ts`, and `src/stores/triage-store.ts` and `.test.ts`. Dispatch the canonical Inbox system Node to the single production workspace; compose completed lifetime/hooks/adapters; read Archive recovery before initial Inbox projection. After verifying every consumer uses Task 131 durable candidate truth, remove the deprecated candidate fields/actions retained by Task 127; Task 163 is the sole removal owner. Also remove superseded component mock writes, UI candidate arrays/Sets/labels, sequential create→consume→remove placement, active-column Explorer filtering, duplicate selection/path/overlay owners, and prototype-only handlers from these integration owners. Preserve general Grid DnD keyboard behavior, non-Inbox Grid/runtime, Calendar, Trash, Quick Capture, global Search, Bit Detail, Direct Archive, Archive View restore, and system Nodes.

**Dependencies:** Tasks 127–162.

**Authority / flows:** `UF-01`–`UF-28`; `AF-01`–`AF-09`; `NEG-01`, `NEG-10`, `NEG-16`, `NEG-17`.

**Recipe:** [`Shell and section chrome`](recipes/inbox-triage-shell-section-chrome-visual-recipe.md), [`Scratch Pool`](recipes/inbox-triage-scratch-pool-visual-recipe.md), [`Selected Scratch Context`](recipes/inbox-triage-selected-scratch-context-visual-recipe.md), [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md), [`Staging`](recipes/inbox-triage-staging-visual-recipe.md), [`Grid Explorer`](recipes/inbox-triage-grid-explorer-visual-recipe.md), [`Placement affordances`](recipes/inbox-triage-placement-affordances-visual-recipe.md), [`Newly placed and Undo`](recipes/inbox-triage-newly-placed-undo-visual-recipe.md), and [`Archive completion`](recipes/inbox-triage-archive-completion-visual-recipe.md).

**Observable acceptance:** `/grid/[nodeId]` resolves one Inbox body; every command flows component→canonical hook→DataStore→reactive return; no parallel truth/mock path survives; every listed unrelated surface behaves as before.

**Verification:** focused route/runtime/Workspace/store/DnD tests and `rg` audit proving no deprecated candidate compatibility API or other named superseded owner remains; run canonical route navigation plus the unrelated-surface preservation smoke and record route/state/focus results in `docs/verification/inbox-triage/task-163.md`; `pnpm lint`; `pnpm typecheck`.

**Commit contract:** route/runtime/workspace integration, removal of only named superseded owners, tests, and Task 163 evidence; `refactor(triage): integrate authoritative inbox workspace`.

### Task 164: [ ] Complete nine-recipe, eight-theme, motion, and accessibility conformance

**Files and actions:** modify `src/app/globals.css`; create `src/components/triage/inbox-triage-conformance.test.tsx`; create `docs/verification/inbox-triage/rendered-fidelity.md`. Complete semantic role/state mappings across eight color themes in light/dark without theme-ID component branches; test landmarks/headings/names/focus-visible/non-color state/reduced motion/touch targets/theme-state preservation; aggregate—not replace—Tasks 129–163 evidence into a 16 theme/mode matrix with route, seed/state, 1024px and 1920×1080 viewports, capture identifiers, pointer/keyboard/focus results, and recipe-to-production comparisons. Reopen the owning task for any visual/behavior failure rather than hiding it here.

**Dependencies:** Task 163 and every task-local user-visible evidence record from Tasks 129–162.

**Authority / flows:** `UF-29`, `AF-03`, `AF-10`; `NEG-01`, `NEG-02`, `NEG-04`, `NEG-11`; all five deferrals remain excluded.

**Recipe:** [`Shell and section chrome`](recipes/inbox-triage-shell-section-chrome-visual-recipe.md), [`Scratch Pool`](recipes/inbox-triage-scratch-pool-visual-recipe.md), [`Selected Scratch Context`](recipes/inbox-triage-selected-scratch-context-visual-recipe.md), [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md), [`Staging`](recipes/inbox-triage-staging-visual-recipe.md), [`Grid Explorer`](recipes/inbox-triage-grid-explorer-visual-recipe.md), [`Placement affordances`](recipes/inbox-triage-placement-affordances-visual-recipe.md), [`Newly placed and Undo`](recipes/inbox-triage-newly-placed-undo-visual-recipe.md), and [`Archive completion`](recipes/inbox-triage-archive-completion-visual-recipe.md).

**Observable acceptance:** one semantic tree is usable and materially recipe-correct in all 16 theme/mode combinations; theme/mode changes never save/cancel/navigate/refetch or lose any workflow state; focus/status/reduced-motion/contrast roles pass; no deferred feature appears; every underlying visible task already has its own running-app record.

**Verification:** `pnpm test -- src/components/triage/inbox-triage-conformance.test.tsx src/app/theme-transition.test.ts`; `pnpm lint`; `pnpm typecheck`; execute and inspect the full evidence matrix at both viewports, including every recipe surface and representative reliability state.

**Commit contract:** semantic theme CSS, conformance test, aggregate rendered-fidelity record only; `feat(triage): conform inbox themes and accessibility`.

### Task 165: [ ] Run the complete implementation and preservation gate

**Files and actions:** create `docs/verification/inbox-triage/full-gate.md` with exact commands/exits/environment/commit, the approved SCHEMA grid-dimension correction receipt, all 29 UF outcomes, 10 AF checks, 21 negative checks, 9 recipe-surface evidence links, 14 accepted DP receipt links covering 12 VQs, migration/rollback/ABA/aggregate-retention/recovery evidence, every task-local rendered record, and unrelated-surface preservation. Make no production change; any failure reopens its owner.

**Dependencies:** Tasks 101–164 and the approved SCHEMA grid-dimension correction receipt; this is the explicit all-nodes sink.

**Authority / flows:** `UF-01`–`UF-29`, `AF-01`–`AF-10`, `NEG-01`–`NEG-21`, `VQ-01`–`VQ-12`, all fourteen DP receipts, all nine recipes, and the full independent command/data graph.

**Recipe:** [`Shell and section chrome`](recipes/inbox-triage-shell-section-chrome-visual-recipe.md), [`Scratch Pool`](recipes/inbox-triage-scratch-pool-visual-recipe.md), [`Selected Scratch Context`](recipes/inbox-triage-selected-scratch-context-visual-recipe.md), [`Breakdown rows and empty states`](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md), [`Staging`](recipes/inbox-triage-staging-visual-recipe.md), [`Grid Explorer`](recipes/inbox-triage-grid-explorer-visual-recipe.md), [`Placement affordances`](recipes/inbox-triage-placement-affordances-visual-recipe.md), [`Newly placed and Undo`](recipes/inbox-triage-newly-placed-undo-visual-recipe.md), and [`Archive completion`](recipes/inbox-triage-archive-completion-visual-recipe.md).

**Observable acceptance:** one clean migrated production build passes every flow; real fault injection exposes no partial state; all three ABA sequences conflict without resurrection; aggregate deletion retains audits; Archive storage/reload/handoff cases pass; all five deferrals remain absent; no unresolved receipt/skipped check/known failure is represented as completion.

**Verification:** from a clean dependency state run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`; run v3→v4 migration/rollback, real transaction checkpoints, ABA-1/2/3, aggregate retention, 29-flow, accessibility, 16-theme/mode, 1024px/1920×1080, route/reload/remote/concurrent/focus, and unrelated-surface matrices; finish with `git diff --check` and approved-commit scope inspection.

**Commit contract:** full-gate record only after every command/matrix passes; `docs(triage): record full inbox gate`.

---

## Shared-File Writer Register And Mutex Policy

This register is complete for every exact path declared by two or more tasks. Every other declared implementation/test/evidence path is single-writer. A component/hook row that names its co-located test means both files have the same writers unless the row explicitly adds Task 101 for typed-fixture compatibility.

**Mutex policy**

1. A task must acquire every listed path mutex before editing, rebase/read the latest committed form of those files, run the prior writer's focused tests plus its own, make one narrow commit, and release the mutex. Two tasks that share any registered file may not edit or commit concurrently.
2. Numeric order below is the default serialization order, but it is not a product dependency. A later ready VQ slice may take the free mutex while an earlier unrelated receipt is blocked; the eventually resumed task rebases after the committed writer. No VQ completion is inferred from mutex order.
3. Tasks 106–119 may collect user decisions logically in parallel, but the single `decision-docs` mutex serializes `DESIGN_TOKENS.md`, `EXECUTION_PLAN.md`, and overlapping recipe writes one receipt commit at a time. No Decision task depends on another.
4. The `copy` and `global-theme` mutexes likewise serialize receipt-dependent UI tasks. In particular, sibling Tasks 153/154 and every other same-file sibling cannot be concurrently committed even though their DP receipts are independent.
5. Task 101 is the first writer for each enumerated typed-fixture test. Where a test row below says “plus 101,” Task 101 changes only factory compatibility; later tasks own behavior.

| Mutex | Exact shared file(s) | Writer tasks |
|---|---|---|
| `decision-docs` | `docs/DESIGN_TOKENS.md`; `docs/EXECUTION_PLAN.md` | 106–119 |
| `decision-pool-recipe` | `docs/recipes/inbox-triage-scratch-pool-visual-recipe.md` | 106, 111 |
| `decision-context-recipe` | `docs/recipes/inbox-triage-selected-scratch-context-visual-recipe.md` | 109, 118 |
| `decision-breakdown-recipe` | `docs/recipes/inbox-triage-breakdown-row-empty-visual-recipe.md` | 107, 108, 109, 110, 118 |
| `decision-explorer-recipe` | `docs/recipes/inbox-triage-grid-explorer-visual-recipe.md` | 113, 114 |
| `decision-placement-recipe` | `docs/recipes/inbox-triage-placement-affordances-visual-recipe.md` | 115, 116 |
| `decision-archive-recipe` | `docs/recipes/inbox-triage-archive-completion-visual-recipe.md` | 118, 119 |
| `db-implementation` | `src/lib/db/indexeddb.ts` | 101, 102, 103, 104, 105, 120–126 |
| `db-interface` | `src/lib/db/datastore.ts` | 103, 105, 120–126 |
| `db-revision-fixtures` | `src/lib/db/auto-completion.test.ts`; `src/lib/db/cascade-delete.test.ts`; `src/lib/db/cascade-restore.test.ts`; `src/lib/db/deadline-hierarchy.test.ts`; `src/lib/db/grid-uniqueness.test.ts`; `src/lib/db/indexeddb.migration.test.ts`; `src/lib/db/indexeddb.test.ts`; `src/lib/db/mtime-cascade.test.ts`; `src/lib/db/promotion.test.ts`; `src/lib/db/system-nodes.test.ts` | 101, 103 |
| `db-archive-regression` | `src/lib/db/archive.test.ts` | 101, 103, 125 |
| `db-hard-delete-regression` | `src/lib/db/auto-cleanup.test.ts`; `src/lib/db/cascade-hard-delete.test.ts` | 101, 103, 105 |
| `db-breakdown-regression` | `src/lib/db/scratch-breakdowns.test.ts` | 101, 103, 105, 120 |
| `db-command-harness` | `src/lib/db/inbox-operations.test.ts` | 120 creates; 121, 123, 124 extend |
| `copy` | `src/lib/copy/inbox-triage.ts`; `src/lib/copy/inbox-triage.test.ts` | 128, 138, 140, 141, 143, 144, 147, 148, 150, 151, 153, 154, 157, 160, 162 |
| `global-theme` | `src/app/globals.css` | 129, 138, 140, 141, 143, 144, 147, 148, 150, 151, 153, 154, 157, 160, 162, 164 |
| `triage-state` | `src/stores/triage-store.ts`; `src/stores/triage-store.test.ts` | 127, 130, 134, 141, 150, 161, 163 |
| `triage-preferences` | `src/stores/triage-preferences-store.ts`; `src/stores/triage-preferences-store.test.ts` | 127, 130, 132 |
| `breakdown-component` | `src/components/triage/breakdown-panel.tsx` | 132, 136, 137, 138, 139, 140, 142, 143, 145, 147, 148, 159, 160, 161, 162 |
| `breakdown-component-test` | `src/components/triage/breakdown-panel.test.tsx` | 101 plus every `breakdown-component` writer |
| `workspace-component` | `src/components/triage/triage-workspace.tsx` | 129, 136, 137, 139, 140, 141, 145, 149, 152, 155, 159, 160, 161, 163 |
| `workspace-component-test` | `src/components/triage/triage-workspace.test.tsx` | 101 plus every `workspace-component` writer |
| `pool-component` | `src/components/triage/scratch-pool.tsx` | 130, 136, 141, 144, 161 |
| `pool-component-test` | `src/components/triage/scratch-pool.test.tsx` | 101 plus every `pool-component` writer |
| `staging-component` | `src/components/triage/staging-zone.tsx`; `src/components/triage/staging-zone.test.tsx` | 133, 142, 145, 146, 147, 148 |
| `drag-token` | `src/components/triage/triage-drag-token.tsx`; `src/components/triage/triage-drag-token.test.tsx` | 133, 142 |
| `explorer-component` | `src/components/triage/hierarchy-explorer.tsx` | 134, 149–158 |
| `explorer-component-test` | `src/components/triage/hierarchy-explorer.test.tsx` | 101, 134, 149–158 |
| `explorer-results` | `src/components/triage/grid-explorer-search-results.tsx`; `src/components/triage/grid-explorer-search-results.test.tsx` | 151, 158 |
| `actual-node-card` | `src/components/grid/node-card.tsx` | 155, 156, 157 |
| `actual-node-card-test` | `src/components/grid/node-card.test.tsx` | 101, 155, 156, 157 |
| `actual-bit-card` | `src/components/grid/bit-card.tsx` | 155, 156, 157 |
| `actual-bit-card-test` | `src/components/grid/bit-card.test.tsx` | 101, 155, 156, 157 |
| `breakdown-hook` | `src/hooks/use-scratch-breakdowns.ts` | 132, 136, 137 |
| `breakdown-hook-test` | `src/hooks/use-scratch-breakdowns.test.tsx` | 101, 132, 136, 137 |
| `operation-lock-test` | `src/hooks/use-triage-operation-lock.test.tsx` | 136, 137, 139, 145, 152, 156, 161 |
| `inbox-hook-test` | `src/hooks/use-inbox.test.tsx` | 101, 130 |
| `candidate-hook` | `src/hooks/use-staged-candidates.ts`; `src/hooks/use-staged-candidates.test.tsx` | 131, 145, 146 |
| `triage-dnd` | `src/hooks/use-dnd.ts`; `src/hooks/use-triage-dnd.test.ts` | 142, 145, 146, 149, 152, 163 |
| `explorer-search-hook` | `src/hooks/use-grid-explorer-search.ts`; `src/hooks/use-grid-explorer-search.test.tsx` | 135, 151, 158 |
| `placement-hook` | `src/hooks/use-triage-placement.ts`; `src/hooks/use-triage-placement.test.tsx` | 152, 153, 154, 161 |
| `newly-hook` | `src/hooks/use-triage-newly-placed.ts`; `src/hooks/use-triage-newly-placed.test.tsx` | 155, 156, 157, 158, 161 |
| `completion-hook` | `src/hooks/use-can-archive-scratch.ts` | 159, 160 |
| `completion-hook-test` | `src/hooks/use-can-archive-scratch.test.ts` | 101, 159, 160 |
| `archive-coordinator` | `src/hooks/use-archive-scratch.ts`; `src/hooks/use-archive-scratch.test.ts` | 161, 162 |
| `runtime-fixture-test` | `src/components/layout/grid-runtime.test.tsx` | 101, 163 |

## Next Numbers

- **Next planned phase:** Phase 34. Phases 32 and 33 are reserved and receive no tasks.
- **Next planned task:** Task 166.
- Active graph count: 8 open implementation phases (24–31), 60 open tasks
  (106–165), 1 completed archive (Phase 23 with Tasks 101–105A), and 2
  reserved phase numbers (32–33).
- The document is **user-approved for planning authority** under the receipt at
  the top of this file; Tasks 101–105A are accepted and archived, while Tasks
  106–165 remain open.
