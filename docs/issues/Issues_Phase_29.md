# Issues — Phase 29: Mounted-Page Newly Placed And Undo

> Branch: `phase-29/mounted-page-newly-placed-undo`
> Worktree: `/Users/jwk/Documents/griddo2-codex-phase-29-mounted-page-newly-placed-undo`
> Kickoff date: 2026-08-28
> State: Task 155 Accepted; Tasks 156–158 remain `[ ]`

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

## Gate C Kickoff

| Field | Durable value |
| --- | --- |
| Gate | `gate-c`, explicitly approved by the user on 2026-08-28 with statement `내 승인합니다` |
| Phase scope | Phase 29, Tasks 155–158, equal-weight product and workflow-audit tracks |
| First bounded batch | Task 155 only; sequential execution; Tasks 156–158 held for fresh dependency/readiness recheck |
| Task state | Task 155 is `[x]`, Accepted; Tasks 156–158 remain `[ ]`, held |
| Source mode | Merged canonical Phase 29 plan plus accepted Task 123/152 foundations, approved nine-recipe package and DP-VQ10 receipt, and unchanged-candidate Track B audit continuity |
| Integration | `origin/main` at `f3c2be6b2afa2da51cde39d22c13eabf2286f296`, local divergence `0/0` after fetch |
| Approved base | `f3c2be6b2afa2da51cde39d22c13eabf2286f296`; no base exception |
| Feature branch | `phase-29/mounted-page-newly-placed-undo` |
| Worktree choice | New linked feature worktree at `/Users/jwk/Documents/griddo2-codex-phase-29-mounted-page-newly-placed-undo`; no reuse |
| Whole-file receipt | `docs/issues/Issues_Phase_29.gate-c.json` |
| Next legal action | Control Tower reviews the Task 155 acceptance-only checkpoint; Task 156 remains unstarted and may begin only with a fresh `run-task` prompt |

## Readiness And Clean-Start Evidence

- The synchronized Adapter resolver returned `approval_required`,
  `contract_ready=true`, and `writes_allowed=false` before Gate C. The user's
  exact Gate C disposition is the write authority.
- The pinned workflow candidate is clean on branch
  `post-v1/workflow-candidate-low-cost` at
  `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`. The Adapter blob is
  `7903892c04c4eb6fcd694712d5a01fdb608e183f`. Both remain read-only.
- Immediately before mutation, integration `HEAD` and `origin/main` both
  equaled the approved base, the integration tree was clean with divergence
  `0/0`, and the approved feature branch and worktree path were absent.
- Immediately after worktree creation, `HEAD` equaled the approved base, the
  tree was clean, and `approved-base..HEAD` contained zero commits.
- Task 155 dependencies Tasks 123 and 152 are `[x]`, Accepted. Their
  implementation, checkpoint, and acceptance commits are ancestors of the
  approved base.
- The Task 152 mounted Workspace callback exposes stable result/type,
  operation/result IDs, source/candidate versions, and destination/path
  provenance. The Task 155 hook/test/evidence files are correctly absent, and
  the named Workspace, Explorer, NodeCard, BitCard, placement hook, and test
  owners exist. No blocking plan/code drift was found.
- The leaf Newly/Undo recipe's historical `Proposed` header is a resolved
  false blocker: the nine-recipe package is approved at `7a1545126bab755184adf356dcca761c8db74a43`,
  the current recipe index says `User-approved production recipe package`, and
  DP-VQ10 receipt blob `401b8d84ee95d4c09b1466c9a7800e2b39e33599`
  is accepted by Task 117 commit `d4bd591aa3e0cdd540156c95f306c274c215ca26`.

## Baseline Full Gate

- Dependency setup: `pnpm install --frozen-lockfile` exited 0 in `3.43s`;
  the lockfile was unchanged and 537 packages were linked. Tracked state
  remained clean.
- The Adapter-declared full gate ran serially at the exact approved base:

| Command | Exit | Elapsed | Relevant result |
| --- | ---: | ---: | --- |
| `pnpm test` | 0 | `29.47s` | 98 test files and 1,146 tests passed; Vitest duration `27.91s`; Node emitted the existing `module.register()` deprecation and worker `localStorage` experimental warnings |
| `pnpm lint` | 0 | `7.56s` | 0 errors; 11 existing warnings |
| `pnpm typecheck` | 0 | `4.09s` | `tsc --noEmit` passed |
| `pnpm build` | 0 | `12.39s` | Next.js 16.2.1 production build passed; compile `5.1s`, TypeScript `4.0s`, seven pages generated; existing Node deprecation and `localStorage` experimental warnings were emitted |

No production or test implementation, Task 155 measurement row, relevant-input
fingerprint, downstream lifecycle, push, publication, integration, or cleanup
occurred during kickoff.

## Active Issues

No Phase 29 product issue is active at kickoff. The nine carried post-close
workflow findings are owned without verdict by
`docs/verification/inbox-triage/phase-29-workflow-pilot-audit.md`.

## Task 155 Durable Start

| Field | Durable value |
| --- | --- |
| Task | `155 — Project Newly Placed provenance over actual cards` |
| State | `[x]`, Accepted; durable start `bc8f84edae7881a89cca0a9c7d78443dec0c0c54` precedes implementation `0bdd1a88e1eb3c455ff8b156318f18ab7ca3b449`; accepted evidence checkpoint `638789c572577c720724693013805d66690b9ad4` |
| Approval | Exact candidate-pinned Task 155 work order on 2026-08-28, bounded by the committed `docs/issues/Issues_Phase_29.gate-c.json` Gate C receipt and the current Task 155 contract |
| Approved base / entrypoint | Integration base `f3c2be6b2afa2da51cde39d22c13eabf2286f296`; Task 155 entrypoint and recovery anchor `d81f924e209afd1cced22fdbfdca12e2c11af11b` |
| Dependencies | Tasks 123 and 152 are `[x]`, Accepted and contained in the approved base |
| Exact scope | Create the canonical Newly hook/test and Task 155 evidence; modify only the approved Workspace/test, Explorer/test, NodeCard/test, and BitCard/test owners; update this ledger and the actual Task 155 workflow-audit row; no Task 156–158 behavior |
| Behavior | Own mounted-page-only local placement provenance; project static semantic markers and newest-first type pinning over actual NodeCard/BitCard records without changing stored `x/y`; preserve across Scratch/path/theme and clear on route exit/reload/unmount; remote/other-tab records remain ordinary; no Zustand Newly state, persistence, replacement card model, or common-card redesign |
| Issues / deviations | None; the accepted checkpoint has no material finding, scope deviation, or `Unowned` item |
| Canonical impact | `None` — Task 155 implements the existing approved product/design/data/lifetime contract without changing canonical authority |
| Verification / evidence | Latest focused 5 files / 161 tests; latest full gate 99 files / 1,154 tests, lint 0 errors with 11 unchanged warnings, typecheck and build passed; exact results, review repairs, and fingerprint `1a491bbd2bda0fb26c9af723704ed657a47399472053d8d5d9700500549e8821` are owned by `docs/verification/inbox-triage/task-155.md` |
| Audit invariant | The implementation checkpoint is incomplete until product evidence and the actual Task 155 audit measurement row are committed together; acceptance-only work does not edit the audit |
| Next action | Control Tower reviews this acceptance-only checkpoint; Task 156 remains unstarted and may begin only after a fresh `run-task` prompt |

## Task 156 Durable Start

| Field | Durable value |
| --- | --- |
| Task | `156 — Connect ordinary-card source-aware Undo independently of search` |
| State | `In Progress`; Task 156 remains `[ ]` and is not user-accepted |
| Approval | Exact candidate-pinned Task 156-only work order on 2026-08-29, bounded by the committed `docs/issues/Issues_Phase_29.gate-c.json` Gate C receipt, the completed dependency revalidation, and the current Task 156 contract |
| Approved base / entrypoint | Integration base `f3c2be6b2afa2da51cde39d22c13eabf2286f296`; exact clean Task 156 entrypoint and recovery anchor `2dfab8058e2b34ee55bab6460bbc152865434b5b` |
| Dependencies | Tasks 124, 136, 137, 139, 152, and 155 are `[x]`, Accepted and their acceptance commits are ancestors of the entrypoint; Tasks 114 and 151 are deliberately not dependencies |
| Exact scope | Modify only the approved Newly hook/test, ordinary Explorer/test, NodeCard/test, BitCard/test, and shared operation-lock test owners; create Task 156 evidence; update this ledger and the actual Task 156 workflow-audit row; no Search, `DP-VQ07`, Task 157 realization, Task 158, data/persistence/schema, or common-card redesign |
| Behavior | Connect ordinary-card source-aware Undo from exact current result/source/candidate/dependency truth; keep marker and eligibility independent; synchronously acquire the shared `undo` lock before dispatch; retain exact provenance and blockers through pending/unknown/reconciling; reject duplicate/competing intent without write/navigation/queue/replay; release only on terminal result; restore staged/direct provenance and canonical next → previous → column-heading focus |
| Issues / deviations | None at durable start; approved owner discovery found no additional product/test write path |
| Canonical impact | `None` — Task 156 implements the existing approved ordinary-card Undo contract without changing canonical authority |
| Audit invariant | The implementation checkpoint is incomplete until product evidence and the actual Task 156 audit measurement row are committed together; Task 155 evidence and its audit row remain immutable |
| Next action | Begin Task 156 TDD in the exact approved product/test paths; stop at the paired implementation/evidence and audit checkpoint with Task 156 still `[ ]` |
