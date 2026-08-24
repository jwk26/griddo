# Issues — Phase 28: Explorer Search And Pointer Placement

> Branch: `phase-28/explorer-search-pointer-placement`
> Worktree: `/Users/jwk/Documents/griddo2-codex-phase-28-explorer-search-pointer-placement`
> Kickoff date: 2026-08-24
> State: Gate C preparation complete; Tasks 149–154 remain unstarted

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

None at kickoff. Phase 27 items `P27-06` and `P27-08` remain Deferred under
their Phase 27 owner and are outside Phase 28 scope.

## Task 149 Durable Start

| Field | Durable value |
| --- | --- |
| Task | `149 — Implement release-time targets and valid-column edge auto-scroll` |
| State | `Blocked — Control Tower review required`; Task 149 remains `[ ]` |
| Exact scope | Existing DnD target/auto-scroll mechanics in `src/hooks/use-dnd.ts`, `src/components/triage/hierarchy-explorer.tsx`, and `src/components/triage/triage-workspace.tsx`; their three approved test files; Task 149 verification evidence; Phase 28 workflow-pilot measurement row |
| Approval | Exact Task 149 fresh-session user instruction on 2026-08-24, bounded by `docs/issues/Issues_Phase_28.gate-c.json` |
| Approved base | `8cb2d904a55c136ca319e7bdf619d8e5d962fce8` |
| Kickoff recovery anchor | `fcafd49def7334299972e99d675db025d0598a79` |
| Baseline audit anchor | `4c526f0` (`docs: preserve Phase 28 workflow pilot baseline`) |
| Dependencies | Tasks 134 and 142 accepted; no unresolved Task 149 prerequisite |
| Issues / deviations | None at start |
| Canonical impact | `None` — Task 149 implements the existing approved contract without changing canonical product, design, policy, or plan authority |
| Next legal action | Control Tower review of the durable fourth-cycle blockers; a fifth repair cycle is not authorized |

### Task 149 Review Blockers

| ID | State | Evidence | Exact minimum repair | Canonical impact |
| --- | --- | --- | --- | --- |
| `P28-01` | `Repaired — awaiting Task 149 checkpoint` | Fourth-cycle RED reproduced no-post-activation mouse release and stationary-touch activation; focused owner tests now prove retained coordinates and release-time rendered target selection. | Implemented inside the existing DnD owner; latest focused and complete gates are green. | `None` — implementation-local correction to the existing Task 149 contract. |
| `P28-02` | `Repair incomplete — awaiting Control Tower review` | Fourth-cycle RED and browser evidence prove per-frame reclassification across changing row IDs, but final High-risk review found that the classifier cache keys only `dropId`. A section target can retain that ID while its rendered parent/level/title/path/occupancy payload changes, leaving stale feedback until release. | Evidence-confirmed minimum repair: key classification by the complete relevant rendered identity and add same-ID payload replacement coverage through the actual Explorer-to-hook frame loop. No fifth cycle is authorized. | `None` — implementation-local correction to the existing Task 149 contract. |
| `P28-03` | `Open — awaiting Control Tower review` | Final High-risk review found that Explorer retains its local pointer after document exit/window blur/remote invalidation and can call frame refresh while the hook classifier remains active, restoring feedback and edge scrolling after cancellation. Mutation remains suppressed. | Evidence-confirmed minimum repair: make refresh inert after cancellation/invalidation and make the Explorer frame owner forget its local pointer or stop its loop; add mounted Explorer-to-hook cancellation coverage. No fifth cycle is authorized. | `None` — implementation-local correction to the existing Task 149 contract. |

Task 149 remains `[ ]` at a durable blocker checkpoint. The fourth bounded
repair cycle resumed from recovery anchor
`435668f74f96bb7b7275d30765a6650f3de5dbb7`; final review found the remaining
`P28-02` defect and new Important `P28-03`, so a fifth cycle was not started.
No Task 150 work, canonical direction change, or scope expansion occurred.
