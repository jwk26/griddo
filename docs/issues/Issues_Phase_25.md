# Issues — Phase 25: Authoritative Command DAG

> Branch: `phase-25/authoritative-command-dag`
> Worktree: `/Users/jwk/Documents/griddo2-codex-phase-25-authoritative-command-dag`
> Kickoff date: 2026-08-09
> State: Task 120 In Progress; durable start signal committed before product changes

## Status Legend

| Status | Meaning |
| --- | --- |
| Open | Identified and unresolved |
| In Progress | Actively owned by the current task |
| Awaiting User Decision | Blocked on an explicit user-owned choice |
| Closed | Resolved with durable user-confirmed evidence |
| Deferred | Moved to declared future ownership with rationale |
| Dropped | Explicitly rejected or no longer applicable |
| Promoted to Execution Plan | Reflected in canonical task ownership |

## Gate C Kickoff Receipt

| Field | Durable value |
| --- | --- |
| Gate | `gate-c`, explicitly approved by the user on 2026-08-09 |
| Source mode | `approved canonical plan + archived/merged Phase 23 foundation on fetched origin/main` |
| Phase scope | Phase 25, Tasks 120–126 |
| First sequential batch | Task 120 → Task 121; never concurrent |
| First next task | Task 120 only, in a fresh `$run-task` session |
| Issue ledger | `docs/issues/Issues_Phase_25.md` |
| Whole-file receipt | `docs/issues/Issues_Phase_25.gate-c.json` |
| Integration branch | `main` |
| Post-fetch remote | `origin/main` at `7b79a97b56a7023c5f3e803ab646fc3bb7f6be28` |
| Approved base | `7b79a97b56a7023c5f3e803ab646fc3bb7f6be28` |
| Feature branch | `phase-25/authoritative-command-dag` |
| Worktree | `/Users/jwk/Documents/griddo2-codex-phase-25-authoritative-command-dag` |
| Worktree choice | New linked feature worktree; no reuse and no base exception |
| Next legal action | Fresh candidate-pinned `$run-task` session for Task 120 |

## Readiness Evidence

- Task 120 and Task 121 each depend directly on accepted Tasks 103 and 104.
  Their acceptance commits are respectively
  `169ffa525a4fc50ecf2b73af21c4976d8d45387c` and
  `bc9d2d7e037cda7f4a3901185b0e805cf308b01b`; both are ancestors of the
  approved base.
- The Phase 23 feature tip
  `e5da17d4f988908611d0c63ddb39589fb252aaf3` and merge commit
  `8977ffc741abab2707a1c6632cca50324d3101ae` are contained in the approved
  base. The Phase 23 archive records Tasks 101–105A as accepted.
- Phase 25 has no dependency on Phase 24 completion. Tasks 120 and 121 have no
  open `VQ-*` or Decision-prerequisite receipt edge.
- Tasks 120 and 121 share `db-implementation`, `db-interface`, and
  `db-command-harness` writer mutexes. Task 121 starts only after Task 120's
  narrow commit/checkpoint is available; the mutex order creates no semantic
  dependency and grants no concurrent write authority.
- Tasks 122–126 remain held until each task's declared Phase 25 dependencies
  are satisfied.
- Fresh source inspection found the Task 103 revision boundary, v4 candidate
  stores and operation types, Task 104 real seven-store transaction/checkpoint
  harness, and current legacy Breakdown CRUD at their declared paths. The two
  Task-owned new tests are absent as expected. No plan/code drift was found.
- The historical flow review's lifecycle-unavailable result is superseded only
  at runtime by merged Adapter v2 PR #38 and the fresh candidate resolver
  result below; it grants no product write authority by itself.

## Full Base Gate

Environment setup was `pnpm install --frozen-lockfile` (exit 0, lockfile
unchanged, 537 packages linked). The Adapter v2 full gate then ran serially:

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm test` | 0 | 80 test files passed; 554 tests passed |
| `pnpm lint` | 0 | 0 errors; 11 pre-existing warnings |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |

Before the gate, `HEAD` equaled the approved base, the tree was clean, and
`approved-base..HEAD` contained zero commits. After the gate, the tree remained
clean and the production `src` tree remained
`ecad26328bf8a8b798193e61fe54c4afee4478b0` with no staged or unstaged diff.

## Adapter v2 Fresh-Session Evidence

- Workflow candidate worktree:
  `/Users/jwk/Documents/codex-workflow-clean-design-mode-implementation`
- Candidate identity: branch `post-v1/workflow-candidate-low-cost`, commit
  `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`, clean.
- Run Phase used the candidate's exact `skills/run-phase/SKILL.md`, references,
  and `skills/run-phase/scripts/resolve-project-adapter-v2.py`; no global live
  skill link was changed or substituted.
- Pre-Gate resolver result was `status=approval_required`,
  `contract_ready=true`, `writes_allowed=false`, with runtime identity
  `main` at `7b79a97b56a7023c5f3e803ab646fc3bb7f6be28` in the single integration-role
  worktree.
- The follow-up session must explicitly use candidate
  `skills/run-task/SKILL.md` at the same candidate commit. It must not use
  `/Users/jwk/Documents/codex-workflow/skills/run-task`.

## Active Issues

None at kickoff.

## Active Task

| Field | Durable value |
| --- | --- |
| Task | Task 120 — Implement Add, Scratch Save, row Save, and row Delete commands |
| Approved scope | Typed command/reconcile inputs and results in `src/lib/db/datastore.ts` and `src/lib/db/indexeddb.ts`; Task-owned real-transaction evidence in `src/lib/db/scratch-breakdowns.test.ts` and new `src/lib/db/inbox-operations.test.ts`; no UI and no Task 121 work |
| State | In Progress; distinct from user acceptance |
| Kickoff receipt | `docs/issues/Issues_Phase_25.gate-c.json` (`run-phase`, `gate-c`) |
| Start base | Approved base `7b79a97b56a7023c5f3e803ab646fc3bb7f6be28`; run-task entrypoint `93d5d9dbcf71d4b8a7268683f9b892902bfcb037` |
| Recovery anchor | Resume from the committed Task 120 durable start signal whose parent is the run-task entrypoint above; reconcile Git status/diff before any continuation |
| Issues / deviations | None |
| Canonical impact | None — Task 120 is implementation-local to the already-approved SCHEMA/SPEC/execution contract |
| Production changes | None |
| Task markers | Tasks 120–126 remain `[ ]` |
| Next legal action | Add and run the failing Task 120 command/reconciliation tests, then implement Task 120 only |
| Forbidden here | Do not start Task 121, write `[x]`, push, create a PR, merge, rebase, cherry-pick, clean up, or modify Phase 24 scope |
