# Issues — Phase 25: Authoritative Command DAG

> Branch: `phase-25/authoritative-command-dag`
> Worktree: `/Users/jwk/Documents/griddo2-codex-phase-25-authoritative-command-dag`
> Kickoff date: 2026-08-09
> State: Tasks 120–121 accepted; Gate C first batch complete; Task 122 not started

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

### P25-120-R1 — Authoritative reconcile reads lack one snapshot

| Field | Durable value |
| --- | --- |
| Status | Closed — targeted repair accepted by the user on 2026-08-09 |
| Source | User targeted rejection of Task 120 checkpoint after implementation commit `785b9d09b45f25ad50089c00c1f5539a7c4e44de` |
| Affected paths | `reconcileAddBreakdown`, `reconcileSaveScratchTitle`, `reconcileSaveBreakdown`, and `reconcileDeleteBreakdown` in `src/lib/db/indexeddb.ts`; focused invariant coverage in `src/lib/db/inbox-operations.test.ts` |
| Trigger / consequence | A concurrent Stage/Unstage/archive/delete transaction may commit between independently opened table reads, mixing Breakdown/Candidate/Scratch/Inbox-parent states and allowing an incorrect authoritative `not_applied` or `already_applied` presentation |
| Approved repair | Run every reconcile method's authoritative reads inside one Dexie read-only transaction snapshot; add a real-Dexie invariant test and rerun invalidated gates |
| User acceptance | Task 120 targeted repair checkpoint explicitly accepted on 2026-08-09; Task 120 may receive `[x]` and the Gate C sequential batch may advance to Task 121 |
| Canonical impact | None — this repairs implementation conformance to the existing SCHEMA reconciliation contract |

## Accepted Task 120

| Field | Durable value |
| --- | --- |
| Task | Task 120 — Implement Add, Scratch Save, row Save, and row Delete commands |
| Approved scope | Typed command/reconcile inputs and results in `src/lib/db/datastore.ts` and `src/lib/db/indexeddb.ts`; Task-owned real-transaction evidence in `src/lib/db/scratch-breakdowns.test.ts` and new `src/lib/db/inbox-operations.test.ts`; no UI and no Task 121 work |
| State | Accepted by the user on 2026-08-09; Task 120 marker is `[x]` |
| Kickoff receipt | `docs/issues/Issues_Phase_25.gate-c.json` (`run-phase`, `gate-c`) |
| Start base | Approved base `7b79a97b56a7023c5f3e803ab646fc3bb7f6be28`; run-task entrypoint `93d5d9dbcf71d4b8a7268683f9b892902bfcb037` |
| Recovery anchor | Original implementation commit `785b9d09b45f25ad50089c00c1f5539a7c4e44de`; targeted-repair start commit `7077cd19910f5dedc307eca52f3e82e5cf067490` |
| Issues / deviations | `P25-120-R1` Closed by explicit user acceptance; no scope deviation |
| Canonical impact | None — Task 120 is implementation-local to the already-approved SCHEMA/SPEC/execution contract |
| Production changes | Typed Add, Scratch Save, row Save, row Delete command/reconcile APIs in `src/lib/db/datastore.ts`; atomic Dexie implementation in `src/lib/db/indexeddb.ts`, including one read-only four-store snapshot for every authoritative reconcile; compile-time command fixtures in `src/lib/db/scratch-breakdowns.test.ts`; real-transaction, rollback, CAS, candidate-guard, ABA-1, and reconcile-snapshot coverage in `src/lib/db/inbox-operations.test.ts` |
| TDD / repair evidence | Initial RED: focused command exit 1 with 13 expected missing-method failures while 554 existing tests passed. First implementation reduced the set to two identical ABA fixture conflicts; correcting the fixture's row precondition from legacy v2 to Add v1 reduced the set to zero. Targeted-repair RED: direct selected command exited 1 with four new snapshot-invariant failures and 26 existing selected tests passing; every observed authoritative read had a null transaction. Targeted-repair GREEN: the same command exited 0 with 2 files and 30 tests passing. No production repair cycle repeated the same unchanged failure set. |
| Focused verification | Direct selected-target `pnpm exec vitest run src/lib/db/scratch-breakdowns.test.ts src/lib/db/inbox-operations.test.ts` exit 0 (2 files, 30 tests); `pnpm typecheck` exit 0; `git diff --check` exit 0. The previous `pnpm test -- ...` result (81 files, 567 tests) remains classified as full-suite rather than focused evidence. |
| Full gate | Fresh serial rerun after the repair: `pnpm test` exit 0 (81 files, 571 tests); `pnpm lint` exit 0 (0 errors, 11 pre-existing warnings); `pnpm typecheck` exit 0; `pnpm build` exit 0 (Next.js production build and seven routes). |
| Review | User accepted the targeted repair checkpoint after all four reconcile methods were verified to enter one read-only Dexie transaction over `nodes`, `bits`, `scratchBreakdowns`, and `stagedCandidates`. |
| Task markers | Task 120 is `[x]`; Tasks 121–126 remain `[ ]` |
| Next legal action | Create a separate durable Task 121 start commit before any Task 121 production write, then implement only Stage/Unstage and ABA-2 no-resurrection |
| Forbidden here | Do not start Task 122, write Task 121 `[x]` without later explicit acceptance, push, create a PR, merge, rebase, cherry-pick, clean up, or modify Phase 24 scope |

## Accepted Task 121

| Field | Durable value |
| --- | --- |
| Task | Task 121 — Implement Stage and Unstage commands |
| Approved scope | Typed Stage/Unstage command and reconcile inputs/results in `src/lib/db/datastore.ts` and `src/lib/db/indexeddb.ts`; create `src/lib/db/staged-candidates.test.ts`; extend `src/lib/db/inbox-operations.test.ts`; implement ABA-2 Stage→Unstage no-resurrection only; no UI and no Task 122 work |
| State | Accepted by the user on 2026-08-09; Task 121 marker is `[x]` |
| Kickoff receipt | `docs/issues/Issues_Phase_25.gate-c.json` (`run-phase`, `gate-c`, sequential batch Task 120 → Task 121), plus explicit user authorization after Task 120 acceptance |
| Start base / entrypoint | Approved base `7b79a97b56a7023c5f3e803ab646fc3bb7f6be28`; Task 121 entrypoint and Task 120 acceptance commit `9d7a6361fb0bdb52891f8253757d8088abbd3aac` |
| Recovery anchor | Task 121 durable start commit `28fe8dbef84794596f02da21bf8f32677173e339`; its parent is the Task 120 acceptance commit `9d7a6361fb0bdb52891f8253757d8088abbd3aac` |
| Dependencies | Tasks 103 and 104 accepted at `169ffa525a4fc50ecf2b73af21c4976d8d45387c` and `bc9d2d7e037cda7f4a3901185b0e805cf308b01b`; both are ancestors of the approved base |
| Issues / deviations | None |
| Canonical impact | None — implementation-local conformance to the approved SCHEMA Stage/Unstage matrix and SPEC durable-staging contract |
| Production changes | Added typed `StageCandidate`/`UnstageCandidate` command, result, execute, and reconcile APIs; Stage validates active Inbox Scratch, source lifecycle/version, stable candidate ID, and unique source before atomically creating candidate v1 and advancing the source once; Unstage atomically deletes only the exact candidate and advances only the unconsumed source once; both reconcile from one authoritative four-store read snapshot and never write an operation log or orphan audit |
| TDD evidence | Initial RED direct selected command exited 1: 2 files, 30 tests, 13 missing-API failures and 17 existing passes. Initial GREEN was 2 files / 30 tests. Repair 1 fixed only two test-fixture `TS7024` inference errors. Review then found later placement/consume was classified `rejected` instead of SCHEMA-required `conflict`; its focused RED exited 1 with 1 failure / 30 passes, then GREEN reached 2 files / 31 tests. The resulting `TS2345` source-narrowing error was fixed with an explicit no-source conflict guard. Repair 3 removed one new lint-only unused-parameter warning. No error signature persisted twice and every failure set shrank to zero. |
| Focused verification | Final direct selected-target `pnpm exec vitest run src/lib/db/staged-candidates.test.ts src/lib/db/inbox-operations.test.ts` exit 0 (2 files, 31 tests); `pnpm typecheck` exit 0; `git diff --check` exit 0 |
| Full gate | Final serial rerun after the last test-only repair: `pnpm test` exit 0 (82 files, 585 tests); `pnpm lint` exit 0 (0 errors, 11 pre-existing warnings); `pnpm typecheck` exit 0; `pnpm build` exit 0 (Next.js production build and seven routes) |
| Review | No remaining blocking finding. Real-Dexie evidence covers commit/reconcile preconditions and postconditions, unique-source/type-change rejection, durable reopen without copied label, Stage and Unstage rollback, one-snapshot reconciliation, no orphan-audit write, later-placement conflict, and ABA-2 delayed/duplicate orders with exact candidate absence, final source version, and no extra write. Diff ownership is exactly `src/lib/db/datastore.ts`, `src/lib/db/indexeddb.ts`, `src/lib/db/staged-candidates.test.ts`, and `src/lib/db/inbox-operations.test.ts`; no Task 122 or UI path is owned. |
| User acceptance | Task 121 checkpoint explicitly accepted on 2026-08-09 after direct confirmation of atomic Stage/Unstage, durable candidate truth, one-snapshot reconciliation, and ABA-2 no-resurrection evidence |
| Task markers | Tasks 120–121 are `[x]`; Tasks 122–126 remain `[ ]` |
| Batch status | Approved Gate C first batch Task 120 → Task 121 is complete; this acceptance grants no Task 122 write authority |
| Next legal action | Read-only verification of Task 122 dependencies, exact scope, files, verification, and existing branch/worktree reuse conditions; present a next-batch approval packet and stop |
| Forbidden here | Do not start Task 122, write Task 122 `[x]`, push, create a PR, merge, rebase, switch or clean up a branch/worktree, or modify Phase 24 scope |
