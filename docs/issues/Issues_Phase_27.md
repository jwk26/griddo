# Issues — Phase 27: Breakdown, Pool, And Staging Interactions

> Branch: `phase-27/breakdown-pool-staging-interactions`
> Worktree: `/Users/jwk/Documents/griddo2-codex-phase-27-breakdown-pool-staging-interactions`
> Kickoff date: 2026-08-12
> State: Tasks 136–138 accepted; Task 139 awaiting user decision

## Status Legend

| Status | Meaning |
| --- | --- |
| Open | Identified and unresolved |
| In Progress | Actively owned by the current task |
| Awaiting User Decision | Blocked on an explicit user-owned choice |
| Closed | Resolved with durable evidence |
| Deferred | Moved to declared future ownership with rationale |
| Dropped | Explicitly rejected or no longer applicable |
| Promoted to Execution Plan | Reflected in canonical task ownership |

## Gate C Kickoff Receipt

| Field | Durable value |
| --- | --- |
| Gate | `gate-c`, explicitly approved by the user on 2026-08-12 with `Approve Gate C exactly as presented.` |
| Source mode | `approved canonical plan + archived/merged Phase 23–26 foundations on fetched origin/main` |
| Phase scope | Phase 27, Tasks 136–148 |
| First bounded batch | Task 136 only, sequential |
| Task state | Task 136 not started; Tasks 136–165 remain `[ ]` |
| Issue ledger | `docs/issues/Issues_Phase_27.md` |
| Whole-file receipt | `docs/issues/Issues_Phase_27.gate-c.json` |
| Integration branch | `main` |
| Post-fetch remote | `origin/main` at `3829a789e5666778267070cf830c022cbe447e57` |
| Approved base | `3829a789e5666778267070cf830c022cbe447e57` |
| Feature branch | `phase-27/breakdown-pool-staging-interactions` |
| Worktree | `/Users/jwk/Documents/griddo2-codex-phase-27-breakdown-pool-staging-interactions` |
| Worktree choice | New linked feature worktree; no reuse and no base exception |
| Next legal action | Fresh candidate-pinned `$run-task` session for Task 136 only |

## Readiness Evidence

- Candidate `run-phase` authority was branch
  `post-v1/workflow-candidate-low-cost` at
  `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`; the global live lifecycle
  skills were not used.
- The Adapter v2 resolver returned `approval_required`,
  `contract_ready=true`, and `writes_allowed=false` before Gate C.
- After `git fetch origin`, local `main` and `origin/main` both resolved to the
  approved base with ahead/behind `0/0` and a clean integration worktree.
- The Phase 26 publication tip, approved canonical-document commits, and Task
  136 dependency acceptance commits for Tasks 120, 128, 130, and 132 are
  ancestors of the approved base.
- The canonical plan declares Phase 27 Tasks 136–148 and a sequential first
  batch of Task 136 only. Flow ownership remains `PASS` with Weak 0 and Gap 0.
- Task 136's prescribed existing component/hook/test paths and Task 120
  authoritative Add/Delete APIs are present. The new operation-lock hook and
  test are absent as expected. The exact retired
  `deleteScratchBreakdownsByScratch` test mock/no-call assertion remains for
  Task 136-owned `P23-02` cleanup. No plan/code drift was found.
- Task 136 is headless and chooses no `VQ-05` appearance. No open typed
  decision receipt, active issue, or blocker applies to the first batch.
- Before Gate C, the proposed branch was absent locally/remotely and the
  proposed worktree path was absent and unregistered.

## Clean Start And Full Base Gate

- Immediately after creation, `HEAD` equaled the approved base, the worktree
  was clean, `approved-base..HEAD` contained zero commits, and the base tree
  matched exactly.
- `pnpm install --frozen-lockfile` exited 0; the lockfile was unchanged and
  537 packages were linked with pnpm 10.22.0 on Node 26.0.0.
- The Adapter v2 full gate ran serially:

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm test` | 0 | 92 test files and 743 tests passed |
| `pnpm lint` | 0 | 0 errors; 11 pre-existing warnings |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |

The baseline `src` tree is
`dba57c9e4da8639e98b4d966750835cb3895102c`. No product implementation was
started and `$run-task`, relay, and Control Tower were not invoked.

## Active Issues

Task 139 discovered one active canonical-scope conflict. The ledger also retains
the terminal Task 136 verification-staging conflict and accepted Task 138
targeted canonical repair:

| ID | Status | Finding | Approved disposition | Canonical impact |
| --- | --- | --- | --- | --- |
| `P27-01` | Promoted to Execution Plan | Task 136 required canonical-route `unknown reconcile`, but its production route can only enter and retain unknown state; Task 143 owns the `Check again` production trigger that starts reconciliation. A test-only trigger would not prove a production consumer. | On 2026-08-14 the user approved route verification through unknown row/lock/focus and blocked actions in Task 136, retained Add/Delete reconciliation and terminal-release verification at hook level in Task 136, and kept route `Check again` → reconciliation → terminal/focus in Task 143. | `Reflected` in the Task 136 and Task 143 verification clauses of `docs/EXECUTION_PLAN.md`; no product/test/marker change. |
| `P27-02` | Closed | The accepted Task 138 realization and its two active visual recipes allowed editor state content to expand the source geometry; the experiment also initially imposed a no-horizontal-movement stop condition. | On 2026-08-18 the user approved the bounded fixed-geometry repair, disclosed caret-following result, recipe correction, exact-source browser evidence, Task 160 compatibility deferral, and repaired checkpoint `a7ab647d3b6733c9452979bac4a9ef5cbba9a9b4`; experiment commit `4c22b8c` records the stop-condition change. | `Reflected` in `DP-VQ04` in `docs/DESIGN_TOKENS.md`, accepted Task 138 and the retained Task 160 compatibility tag in `docs/EXECUTION_PLAN.md`, both active visual recipes, Task 138 evidence, and this ledger. |
| `P27-03` | Awaiting User Decision | Task 139 requires synchronous pre-mutation capture/blocking for Scratch, Explorer path, and app-route destinations plus destination focus handoff, but its canonical file list names only the new hook, Workspace, Breakdown, and operation-lock tests. The actual pre-mutation owners are Scratch Pool/store selection, Hierarchy Explorer path actions, and route-navigation owners above the Workspace. A Workspace Zustand subscriber can only roll back after forbidden state was observable, while the generic controller alone cannot block real path/route exits. | Choose either a targeted Task 139 canonical scope expansion to the actual consumer owners and tests, or narrow/defer the affected observable acceptance in a canonical amendment. Do not ship the post-mutation rollback or claim path/route coverage from controller-only tests. | `Tagged` for the Task 139 files/actions and observable-acceptance clauses in `docs/EXECUTION_PLAN.md`; no canonical amendment or later-task implementation has been made. |

## Task 136 Run State

| Field | Durable value |
| --- | --- |
| Task | `136` — connect headless Add and Delete interaction behavior |
| State | `Accepted`; user-approved and marked `[x]` |
| Approved scope | Gate C `task_scope.task_136` plus the explicit Task 136-only user approval and the 2026-08-14 targeted canonical-repair approval; implementation remains limited to the listed Breakdown, Workspace, Pool, scratch-breakdown hook/tests, new operation-lock hook/tests, and Task 136 evidence, while this repair changes only `docs/EXECUTION_PLAN.md`, this ledger, and Task 136 evidence |
| Kickoff receipt | `docs/issues/Issues_Phase_27.gate-c.json` at Git blob `08c7a5e524f7a89bd10adc5cea71963f54870d38` |
| Start base / recovery anchor | `f10638ce84c4503c88dc8212c46431f91f709e34` |
| Dependencies | Accepted Tasks 120, 128, 130, and 132 are ancestors of the approved base |
| Deferred ownership | `P23-02` is included only in Task 136 hook/test replacement scope |
| Visual boundary | Headless only; Task 143 owns `DP-VQ05` Add/Delete reliability realization |
| Issues / deviations | `P27-01` — verification-staging conflict, user-approved and `Promoted to Execution Plan`; no product-scope deviation |
| Canonical impact | `Reflected` — Task 136 now owns route evidence through retained unknown/blocked actions plus hook-level reconciliation, while Task 143 retains route `Check again` → reconciliation → terminal/focus |
| Implementation | `cf0b08db8d9be2a8c8653fa773c969b35d034569` — `feat(triage): connect locked breakdown commands` |
| Verification | `docs/verification/inbox-triage/task-136.md`; focused 5 files / 110 tests, changed-file lint pass, typecheck and diff-check pass; canonical-route Add/Delete/lock/focus/scroll observations recorded; single adapter full gate passed 93 files / 769 tests, lint with 0 errors and 11 existing warnings, typecheck, and build and was not rerun for the documentation-only repair |
| Acceptance | On 2026-08-14 the user explicitly accepted checkpoint `318739fe1a528b2b8e62153bdd9b77905142b919` and approved this acceptance-only marker/ledger update; existing successful verification evidence was reused |
| Next legal action | Stop at the clean Task 136 acceptance checkpoint; do not start Task 137 without a separate user-approved run-task scope |

## Task 137 Run State

| Field | Durable value |
| --- | --- |
| Task | `137` — build headless conditional editor and blocker state |
| State | `Accepted`; user-approved and marked `[x]` |
| Approved scope | The committed canonical Task 137 contract in `docs/EXECUTION_PLAN.md` plus the explicit 2026-08-14 Task 137-only user approval: modify only the named scratch-breakdown hook/tests, Breakdown/Workspace component/tests, extend the operation-lock test, and record Task 137 verification evidence; consume Task 136's shared operation lock for the headless conditional Scratch-title/row editor and synchronous blocker state |
| Kickoff receipt | Run-phase Gate C receipt `docs/issues/Issues_Phase_27.gate-c.json` at Git blob `08c7a5e524f7a89bd10adc5cea71963f54870d38`; intentionally not passed to the run-task resolver |
| Start base / entrypoint / recovery anchor | `02675c3c2c44939bb71506eb64dd1904d8e0bfa7` |
| Dependencies | Accepted Tasks 120, 132, and 136 are ancestors of the approved Task 137 entrypoint |
| Excluded | `DP-VQ04` visual/copy realization, generic dialog, Task 139+, and Task 143 route `Check again` reconciliation UI |
| Issues / deviations | None |
| Canonical impact | `None` — Task 137 executes the already-reflected canonical contract without changing product/design/policy authority |
| Implementation | `bba0da00e5191364592931f612e016d2765acca6` — `feat(triage): model conditional inline edits` |
| Verification | `docs/verification/inbox-triage/task-137.md`; initial missing-editor RED plus duplicate-open RED; final focused 4 files / 98 tests, changed-file lint and diff-check, typecheck; post-repair adapter full gate passed 93 files / 783 tests, lint with 0 errors and 11 existing warnings, typecheck, and build |
| Acceptance | On 2026-08-14 the user explicitly accepted checkpoint `d0bc011383b40c382b2ca46cd78653397f9b1e64` and approved this acceptance-only marker/ledger update; existing successful verification evidence was reused without rerunning tests |
| Next legal action | Stop at the clean Task 137 acceptance checkpoint; do not start Task 138 without a separate user-approved run-task scope |

## Task 138 Run State

| Field | Durable value |
| --- | --- |
| Task | `138` — render `DP-VQ04` inline editors |
| State | `Accepted`; repaired checkpoint user-approved and marked `[x]` |
| Approved scope | The explicit 2026-08-18 ad-hoc work orders: replace only the Scratch-title and Breakdown-content visual realization in `src/components/triage/breakdown-panel.tsx`, its test, and `src/app/globals.css` with the approved fixed geometry; reflect the revised `DP-VQ04`/Task 138 contract and, in the docs-only follow-up, correct only the two active recipes, add the minimum Task 160 compatibility tag, update this ledger, and durably record exact-source Task 138 browser evidence without changing captures |
| Kickoff receipt | Run-phase Gate C receipt `docs/issues/Issues_Phase_27.gate-c.json` at Git blob `08c7a5e524f7a89bd10adc5cea71963f54870d38`; intentionally not passed to the run-task resolver |
| Start base / entrypoint / recovery anchor | Required start `b3d6a8b6be45faa67756e8a698f292f53c3d7e08`; accepted input `8eb0aec73965d0dd477bdefc7975026a43aa1c5e` with exact `src` tree `9375974b616ae6d6b891937ad04dc6a99d5fbb88` |
| Dependencies | Accepted Tasks 109, 128, and 137 are ancestors of the approved Task 138 entrypoint |
| Excluded | Generic Dialog/AlertDialog or detached fallback surfaces, Task 139+, and Task 143 route `Check again` reconciliation UI |
| Issues / deviations | `P27-02` — user-approved targeted canonical repair; no unowned scope deviation |
| Canonical impact | `Reflected` — revised fixed geometry and the approved caret-following exception are present in `docs/DESIGN_TOKENS.md`, `docs/EXECUTION_PLAN.md`, both active `DP-VQ04` recipes, Task 138 evidence, and this ledger; no archived Phase 24 receipt is mutated |
| Implementation | `68534d00217230529b1988d251a48f66ab6d1ed4` — `fix(triage): preserve fixed inline editor geometry`; exact canonical `src` tree `9375974b616ae6d6b891937ad04dc6a99d5fbb88` matches approved input `8eb0aec73965d0dd477bdefc7975026a43aa1c5e` |
| Checkpoint chain | `6c2e5095e87f77d8f3c2d4e9ee9814ffb9227503` durable reopen/canonical start → `68534d00217230529b1988d251a48f66ab6d1ed4` implementation → `67f06965180ab1bd6f38de4192515893ecf4608f` verification/ledger evidence → `a7ab647d3b6733c9452979bac4a9ef5cbba9a9b4` recipe/exact-source evidence repair accepted by the user |
| Verification | `docs/verification/inbox-triage/task-138.md`; RED 1 file / 81 selected with 33 expected failures, GREEN 1 file / 81 passed, exact-input check plus focused lint/typecheck/diff-check exit 0; adapter full gate passed 93 files / 820 tests, lint with 0 errors and 11 existing warnings, typecheck, and build; exact-source browser evidence at `/grid/eab62b76-64d7-4410-b089-6bbdf33e3a11`, 1440×900 records unchanged view/edit geometry, 60/120-character caret-following boundaries, representative themes, offline overlay → saving, and passed user smoke; the successful code gate was reused for this docs-only repair |
| Planned later | `DP-VQ11` Scratch-title completion-blocker compatibility belongs only to Task 160: choose and obtain authority for an expression that preserves the fixed Context/action/progress/overlay geometry; no Task 160 UI or product code started here |
| Acceptance | On 2026-08-18 the user explicitly accepted repaired checkpoint `a7ab647d3b6733c9452979bac4a9ef5cbba9a9b4`, including the exact-source browser evidence and passed user smoke, and directly approved this acceptance-only `[x]`/ledger commit; existing focused/full verification and browser evidence were reused without rerunning gates |
| Next legal action | Stop at the clean Task 138 acceptance checkpoint; Task 139 remains `[ ]` and may start only through a separate user-approved run-task scope, while `DP-VQ11` fixed-geometry compatibility remains Planned later under Task 160 |

## Task 139 Run State

| Field | Durable value |
| --- | --- |
| Task | `139` — build headless Add-draft departure coordination |
| State | `Awaiting User Decision`; implementation is not user-accepted and Task 139 remains `[ ]` |
| Approved scope | The committed canonical Task 139 contract in `docs/EXECUTION_PLAN.md` plus the explicit 2026-08-18 Task 139-only user approval: create the headless departure coordinator and tests, modify only the named Workspace/Breakdown component tests and wiring, extend shared operation-lock coverage, and record Task 139 verification evidence |
| Kickoff receipt | Run-phase Gate C receipt `docs/issues/Issues_Phase_27.gate-c.json` at Git blob `08c7a5e524f7a89bd10adc5cea71963f54870d38`; intentionally not passed to the run-task resolver |
| Start base / entrypoint / recovery anchor | `17babba46969b4b1981fca91c57acc85f1eaf62a`; exact entrypoint `src` tree `9375974b616ae6d6b891937ad04dc6a99d5fbb88` |
| Dependencies | Accepted Tasks 136 and 137 are ancestors of the approved Task 139 entrypoint |
| Excluded | Any `DP-VQ03` or other VQ DOM/copy/style realization, Task 138 repair, Task 140+, Task 143 reconciliation UI, and Task 160 compatibility work |
| Issues / deviations | `P27-03` — actual synchronous Scratch/path/route and focus consumers fall outside the canonical Task 139 file list; user disposition is required before affected writes |
| Canonical impact | `Tagged` — reconcile Task 139's files/actions and observable acceptance in `docs/EXECUTION_PLAN.md` after the user chooses expansion or deferral |
| Implementation | Uncommitted TDD work is preserved in the worktree for inspection; independent review found three blocking Important gaps, so no implementation commit exists |
| Verification | RED/GREEN controller and component cycles completed; focused 4 files / 145 tests, full 94 files / 852 tests, lint with 0 errors and 11 existing warnings, typecheck, build, and diff-check passed before blocking review; passing checks do not satisfy the missing real-consumer contract |
| Next legal action | User disposition of `P27-03`; do not continue affected production writes, mark Task 139 `[x]`, or start Task 140 |
