# Issues — Phase 28: Explorer Search And Pointer Placement

> Branch: `phase-28/explorer-search-pointer-placement`
> Worktree: `/Users/jwk/Documents/griddo2-codex-phase-28-explorer-search-pointer-placement`
> Kickoff date: 2026-08-24
> State: Task 149 `[x]`, Accepted; Task 150 pre-start blocker awaiting user
> disposition; Tasks 150–154 remain unstarted

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
| Gate | `gate-c`, explicitly approved by the user on 2026-08-24 |
| Phase scope | Phase 28, Tasks 149–154 |
| First bounded batch | Task 149 only; sequential execution |
| Task state | Tasks 149–154 remain `[ ]`; Task 149 has not started |
| Integration | `origin/main` at `8cb2d904a55c136ca319e7bdf619d8e5d962fce8`, local divergence `0/0` after fetch |
| Approved base | `8cb2d904a55c136ca319e7bdf619d8e5d962fce8`; no base exception |
| Feature branch | `phase-28/explorer-search-pointer-placement` |
| Worktree choice | New linked feature worktree; no reuse |
| Whole-file receipt | `docs/issues/Issues_Phase_28.gate-c.json` |
| Next legal action | Fresh candidate-pinned `$run-task` session for Task 149 only |

## Readiness And Clean-Start Evidence

- The pinned workflow candidate is branch
  `post-v1/workflow-candidate-low-cost` at
  `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`. Global lifecycle skills under
  `/Users/jwk/Documents/codex-workflow/skills/**` were not used.
- Before approval, the synchronized Adapter v2 resolver returned
  `approval_required`, `contract_ready=true`, and `writes_allowed=false`.
- After `git fetch origin`, local `main` and `origin/main` both resolved to the
  approved base with divergence `0/0`; Phase 27 receipt B and merge commit are
  contained, and `origin/main:src` is
  `7b831a941d40631c2212d07a010f3c6b4a00e01a`.
- All accepted prerequisites for Tasks 149–154 and the approved
  `DP-VQ06-EXPLORER`, `DP-VQ07`, `DP-VQ08`, and `DP-VQ09` receipts are
  contained in the approved base. Tasks 152–154 remain subject to their
  in-phase dependency rechecks.
- Task 149's named DnD, Explorer, Workspace, and test owners exist. Existing
  `autoScroll={false}` is a preserved condition; release-time DOM hit testing
  and valid-column edge scrolling remain unimplemented as planned. No blocking
  plan/code drift or active issue applies to the first batch.
- Immediately after worktree creation, `HEAD` equaled the approved base, the
  tree was clean, and `approved-base..HEAD` contained zero commits.

## Baseline Full Gate

- `pnpm install --frozen-lockfile` exited 0; the lockfile was unchanged and
  537 packages were linked.
- The Adapter full gate ran serially:

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm test` | 0 | 95 test files and 982 tests passed |
| `pnpm lint` | 0 | 0 errors; 11 pre-existing warnings |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |

No production implementation or Task 149 execution occurred.

## Workflow-Cost Pilot Handoff

- External baseline:
  `/Users/jwk/Documents/GridDO_Codex_Workflow_Phase_28_Audit.md`, SHA-256
  `13c47986ebbb9c3b098943132cb61b1fd9355476c86a7969fab70d61a5a33fda`.
- Approved tracked target:
  `docs/verification/inbox-triage/phase-28-workflow-pilot-audit.md`.
- This `run-phase` lifecycle did not copy or promote the external audit. A
  fresh Task 149 `$run-task` session owns the exact verified baseline copy in
  a baseline-only documentation commit after validating the green kickoff
  receipt and before production/test changes.
- Each Task 149–154 `$run-task` writer, or an explicitly approved repair
  writer, owns its compact measured experiment row at the corresponding task
  or cluster checkpoint. Estimates must not be recorded as measured facts.
- Phase 28 `$end-phase` may finalize measured findings and the handoff manifest
  only. Candidate skill or Adapter changes require a separate post-publication
  lifecycle and explicit user approval.

## Active Issues

| ID | State | Evidence | Exact minimum unblock | Canonical impact |
| --- | --- | --- | --- | --- |
| `P28-04` | `Awaiting User Decision` | Task 150 owner discovery found that `useGridData()` exposes only active per-parent snapshots, so Explorer cannot distinguish deleted/archived/moved/unreachable fallback causes. Local placement creates its result inside `use-dnd.ts`/Workspace but passes Explorer only a target `dropId`, so the approved Task 150 files cannot authoritatively exclude that new result from remote-arrival counts. The selected-Bit/reveal producer is likewise not connected before Task 151. Detailed evidence is in `docs/verification/inbox-triage/task-150.md`. | Approve the smallest producer/read projection and exact added owner/test paths, or revise the Task 150 observable contract. No product/test write or durable start may occur under the current exact file boundary. | `Tagged` — the Task 150 plan/receipt meaning is unchanged; an implementation-owner gap requires user disposition before any canonical reflection. |

Phase 27 items `P27-06` and `P27-08` remain Deferred under their Phase 27 owner
and are outside Phase 28 scope.

## Task 150 Pre-Start Blocker

| Field | Durable value |
| --- | --- |
| Task | `150 — Render DP-VQ06-EXPLORER remote/path statuses` |
| State | `Awaiting User Decision`; Task 150 remains `[ ]` and no durable `In Progress` start signal was written |
| Approval | Exact fresh candidate-pinned Task 150 work order on 2026-08-24, bounded by `docs/issues/Issues_Phase_28.gate-c.json` and the accepted `DP-VQ06-EXPLORER` receipt |
| Start base / recovery anchor | `9b26412fe4df90119e67d95efafa43c7332f0b05`; accepted `src` tree `e83086e1044bb2deebc6837f997bebc06b316146` |
| Blocker | `P28-04` — the approved product surfaces lack authoritative cause and local-placement producer signals required by the exact receipt |
| Product/test writes | None |
| Canonical impact | `Tagged` — user disposition is required before reflecting any owner expansion or contract change |
| Next legal action | User disposition of `P28-04`; do not start Task 150 implementation, Task 151, or acceptance-only work |

## Task 149 Durable Start

| Field | Durable value |
| --- | --- |
| Task | `149 — Implement release-time targets and valid-column edge auto-scroll` |
| State | `Accepted`; Task 149 `[x]` |
| Exact scope | Existing DnD target/auto-scroll mechanics in `src/hooks/use-dnd.ts`, `src/components/triage/hierarchy-explorer.tsx`, and `src/components/triage/triage-workspace.tsx`; their three approved test files; Task 149 verification evidence; Phase 28 workflow-pilot measurement row |
| Approval | Exact Task 149 fresh-session user instruction on 2026-08-24, bounded by `docs/issues/Issues_Phase_28.gate-c.json` |
| Approved base | `8cb2d904a55c136ca319e7bdf619d8e5d962fce8` |
| Kickoff recovery anchor | `fcafd49def7334299972e99d675db025d0598a79` |
| Baseline audit anchor | `4c526f0` (`docs: preserve Phase 28 workflow pilot baseline`) |
| Accepted checkpoints | Implementation `1830cc37ff913bd1d4ad4b62ddd9f7b2319b4dca`; evidence alignment/current recovery anchor `80bd7041e9db2849d9eab1d9f8d5d08c38e84549`; WF28-02 composite `a2da7ab6f49ba50d9fba9d3ea5e3fb568990e05f264891844e2534e2e00dfdd8` |
| Dependencies | Tasks 134 and 142 accepted; no unresolved Task 149 prerequisite |
| Issues / deviations | None at start |
| Canonical impact | `None` — Task 149 implements the existing approved contract without changing canonical product, design, policy, or plan authority |
| Next legal action | Fresh candidate-pinned `$run-task` lifecycle for Task 150; Task 150 remains `[ ]` and unstarted |

### Task 149 Review Blockers

| ID | State | Evidence | Exact minimum repair | Canonical impact |
| --- | --- | --- | --- | --- |
| `P28-01` | `Closed` | Fourth-cycle RED reproduced no-post-activation mouse release and stationary-touch activation; focused owner tests now prove retained coordinates and release-time rendered target selection. | Accepted with Task 149 at the recorded implementation and evidence-alignment checkpoints. | `None` — implementation-local correction to the existing Task 149 contract. |
| `P28-02` | `Closed` | Fifth-cycle mounted Explorer-to-hook RED reproduced same-ID payload staleness; complete rendered identity now includes drop ID, parent, level, title, and path, and changed identity reissues the stale-guarded occupancy classification. | Accepted with Task 149; WF28-02 preserves the accepted product-input identity. | `None` — implementation-local correction to the existing Task 149 contract. |
| `P28-03` | `Closed` | Fifth-cycle mounted Explorer-to-hook RED reproduced late frame work after exit, blur, remote invalidation, Escape, and end. Hook refresh is now inert after pointer/cancellation loss; Explorer clears its local pointer and canceled callbacks return before work. | Accepted with Task 149 at the recorded implementation and evidence-alignment checkpoints. | `None` — implementation-local correction to the existing Task 149 contract. |

Task 149 is `[x]` and Accepted by the user's explicit checkpoint disposition.
The fifth bounded repair cycle resumed from recovery anchor
`77b762e15a3fea8c80ced07ba8fdaf16679593c3`; final review found no Critical or
Important issue, so no sixth cycle was started. Task 150 remains `[ ]` and
unstarted; no canonical direction change or scope expansion occurred.
