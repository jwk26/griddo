# Issues — Phase 26: Lifetime, Copy, And Base-Surface Owners

> Branch: `phase-26/lifetime-copy-base-surfaces`
> Worktree: `/Users/jwk/Documents/griddo2-codex-phase-26-lifetime-copy-base-surfaces`
> Kickoff date: 2026-08-11
> State: Task 127 in progress; durable start recorded before production changes

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
| Gate | `gate-c`, explicitly approved by the user on 2026-08-11 with `Approve Gate C exactly as presented.` |
| Source mode | `approved canonical plan + archived/merged Phase 23–25 foundations on fetched origin/main` |
| Phase scope | Phase 26, Tasks 127–135 |
| First bounded batch | Task 127 only |
| Task state | Task 127 not started; Tasks 127–165 remain `[ ]` |
| Issue ledger | `docs/issues/Issues_Phase_26.md` |
| Whole-file receipt | `docs/issues/Issues_Phase_26.gate-c.json` |
| Integration branch | `main` |
| Post-fetch remote | `origin/main` at `f91bf0529961541d9b7fa1645ee3aded081eaea3` |
| Approved base | `f91bf0529961541d9b7fa1645ee3aded081eaea3` |
| Feature branch | `phase-26/lifetime-copy-base-surfaces` |
| Worktree | `/Users/jwk/Documents/griddo2-codex-phase-26-lifetime-copy-base-surfaces` |
| Worktree choice | New linked feature worktree; no reuse and no base exception |
| Next legal action | Fresh candidate-pinned `$run-task` session for Task 127 only |

## Readiness Evidence

- Candidate `run-phase` authority was branch
  `post-v1/workflow-candidate-low-cost` at
  `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`; the global live lifecycle
  skills were not used.
- The Adapter v2 resolver returned `approval_required`,
  `contract_ready=true`, and `writes_allowed=false` before Gate C.
- After `git fetch origin`, local `main` and `origin/main` both resolved to the
  approved base with ahead/behind `0/0` and a clean integration worktree.
- Phase 24 tip `d16b43d2328c411c045648611adc7aa7f861aa1e`, Phase 25 tip
  `14d76ad17fa8b889a785549ab44dd976beafe4f4`, Task 101 acceptance
  `4a7865ad9fdc88ee40d1cca5ff476a2b2dc9bbc0`, and the approved canonical
  document commits checked at kickoff are ancestors of the approved base.
- Task 127 depends only on accepted Task 101 and has no recipe or Decision
  prerequisite. The historical flow review remains ownership `PASS` with no
  weak or gap result; its old lifecycle-unavailable result is superseded by
  the current Adapter v2 resolver and merged receipts.
- Fresh source inspection found `src/stores/triage-store.ts` and its test,
  including the compatibility candidate fields/actions used by current
  consumers. The Task-owned `triage-preferences-store.ts` and test were absent
  as expected. No task path, API, or symbol drift was found.
- Before Gate C, the proposed branch was absent locally/remotely and the
  proposed worktree path was absent and unregistered. No active issue or
  blocker was found.

## Clean Start And Full Base Gate

- Immediately after creation, `HEAD` equaled the approved base, the worktree
  was clean, and `approved-base..HEAD` contained zero commits.
- `pnpm install --frozen-lockfile` exited 0; the lockfile was unchanged and
  537 packages were linked.
- The Adapter v2 full gate ran serially:

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm test` | 0 | 87 test files and 679 tests passed |
| `pnpm lint` | 0 | 0 errors; 11 pre-existing warnings |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |

The baseline `src` tree is
`483c7756667335b502105dfa4a712b128a7a117b`. No product implementation was
started and `$run-task` was not invoked.

## Active Issues

None at kickoff.

## Task 127 Run State

| Field | Durable value |
| --- | --- |
| Task | `127` — establish canonical session and two-preference ownership |
| State | `In Progress` — implementation is not user acceptance and the canonical marker remains `[ ]` |
| Approved scope | Modify `src/stores/triage-store.ts` and `.test.ts`; create `src/stores/triage-preferences-store.ts` and `.test.ts`; retain the deprecated candidate compatibility API unchanged; implement no Task 128+ behavior |
| Kickoff receipt | `docs/issues/Issues_Phase_26.gate-c.json` (`gate-c`, Task 127-only first bounded batch) |
| Approved base | `f91bf0529961541d9b7fa1645ee3aded081eaea3` |
| Entrypoint / recovery anchor | `761ac9a3f676b11559ad7f9d84ca6d64d2672f91` |
| Dependency | Accepted Task 101 commit `4a7865ad9fdc88ee40d1cca5ff476a2b2dc9bbc0` is an ancestor of the approved base |
| Issues / deviations | None |
| Canonical impact | `None` — Task 127 is implementation-local against the already-reflected SPEC/SCHEMA/EXECUTION_PLAN authority |
