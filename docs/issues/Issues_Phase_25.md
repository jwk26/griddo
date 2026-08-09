# Issues — Phase 25: Authoritative Command DAG

> Branch: `phase-25/authoritative-command-dag`
> Worktree: `/Users/jwk/Documents/griddo2-codex-phase-25-authoritative-command-dag`
> Kickoff date: 2026-08-09
> State: Tasks 120–123 accepted; Task 124 Gate C approved but not started; Tasks 125–126 are not approved

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

### P25-122-R1 — Candidate audit lookup scans indefinite history

| Field | Durable value |
| --- | --- |
| Status | Closed — targeted repair accepted by the user on 2026-08-10 |
| Source | User targeted rejection of the Task 122 checkpoint after implementation commit `6c4920414e7aceeb50a5df0eec6fb2c656845f7e` |
| Affected paths | `readConfirmedCandidateOrphanState` in `src/lib/db/indexeddb.ts`; production-index invariant coverage in `src/lib/db/candidate-orphan-cleanup.test.ts` |
| Trigger / consequence | Every cleanup and reconciliation calls `candidateOrphanAuditEvents.toArray().find(...)`; because SCHEMA retains the append-only audit indefinitely, lookup cost and memory grow with the complete audit history despite the existing unique `candidateId` index |
| Approved repair | On the production `GridDODatabase` path, query the existing `&candidateId` index with `where("candidateId").equals(candidateId).first()` inside the same read-only/write transaction; retain a separately bounded compatibility fallback only for non-production `DatabaseLike` implementations; prove production never invokes the audit table's full `toArray()` scan |
| Repair evidence | Production `GridDODatabase` now uses the unique `candidateId` index inside the existing transaction; the real-Dexie invariant fails immediately on any audit `toArray()` call and asserts `where("candidateId")`; the non-production `DatabaseLike` fallback remains isolated behind the `GridDODatabase` branch |
| User acceptance | Task 122 repaired checkpoint explicitly accepted on 2026-08-10; repair commit `5d3fb54b2bc5452e6bc2cb3b7932c92119712248` and its focused/full verification evidence are the durable closure basis |
| Canonical impact | None — this is an implementation-local performance/scalability correction using the already-approved unique index and retention contract |

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

## Accepted Task 122

| Field | Durable value |
| --- | --- |
| Task | Task 122 — Implement confirmed-orphan cleanup with exact reconciliation |
| Approved scope | Add typed confirmed-orphan cleanup command/reconcile inputs and results in `src/lib/db/datastore.ts` and `src/lib/db/indexeddb.ts`; create `src/lib/db/candidate-orphan-cleanup.test.ts` on Task 104's real seven-store database; implement only authoritative `source_deleted`/`source_tombstoned` proof, exact candidate/audit reconciliation, unique audit append, and rollback between candidate deletion and audit append; no UI and no Task 123 work |
| State | Accepted by the user on 2026-08-10; Task 122 marker is `[x]` |
| Approval | Explicit user approval of the Task 122 next-batch packet on 2026-08-09; approved task is Task 122 only and the existing Phase 25 branch/worktree is explicitly reused |
| Lifecycle evidence | Candidate-pinned `run-task` resolver at workflow candidate `94e89782f7fe2cdbdd035e842ca6881b4a87ce49` returned the expected receipt-less compatibility result `approval_required`, `contract_ready=true`; write authority comes from the explicit user-approved bounded work order |
| Branch / worktree | `phase-25/authoritative-command-dag` / `/Users/jwk/Documents/griddo2-codex-phase-25-authoritative-command-dag` |
| Start base / entrypoint | Phase approved base `7b79a97b56a7023c5f3e803ab646fc3bb7f6be28`; Task 122 continuation entrypoint and Task 121 acceptance commit `a01c854aa82e1303550e19b915dd09af1acd9d81` |
| Remote freshness | User-authorized `git fetch origin` on 2026-08-09 left `origin/main` at `7b79a97b56a7023c5f3e803ab646fc3bb7f6be28`; no rebase, merge, cherry-pick, or reset was performed |
| Recovery anchor | Task 122 durable start commit `f6d118f1e1d1f481a75ff9ffe2c0c964c29fc589`; targeted audit-index repair start commit `ef4b219b1f4f2a72f16732125cd105b098d2b4d8`, whose parent is the original implementation commit `6c4920414e7aceeb50a5df0eec6fb2c656845f7e` |
| Dependencies | Tasks 104, 105, and 121 are accepted at `bc9d2d7e037cda7f4a3901185b0e805cf308b01b`, `0faaa70302928a28521e49b7e9c3747033d58cdd`, and `a01c854aa82e1303550e19b915dd09af1acd9d81`; all are ancestors of this start point |
| Authority | `docs/SCHEMA.md` Confirmed candidate orphan cleanup matrix and Staged Candidate Integrity; `docs/SPEC.md` `UF-16`, `AF-04`, `AF-07`, and `AF-08`; `docs/EXECUTION_PLAN.md` Task 122 |
| Issues / deviations | `P25-122-R1` Closed by explicit user acceptance; no scope deviation or new product decision |
| Canonical impact | None — implementation-local conformance to the already-approved SCHEMA/SPEC/execution contract |
| Production changes | Added typed confirmed/unresolved/planned-aggregate proof, cleanup command/result, execute, and reconcile APIs; confirmed cleanup revalidates exact candidate/version/source/Scratch/type and authoritative source absence before atomically deleting the candidate and appending one schema-parsed unique audit event; unresolved/local-miss and planned-aggregate evidence reject without writes; execute uses the existing real seven-store write transaction and reconcile reads candidate/source/audit from one three-store read-only snapshot. Targeted repair replaces the production audit-history scan with `where("candidateId").equals(candidateId).first()` while preserving the isolated non-production `DatabaseLike` fallback. |
| TDD evidence | Initial RED exited 1 with 17 expected missing-method failures and the existing planned-aggregate invariant passing; the first minimal implementation reduced that set to zero. Targeted-repair RED exited 1 with exactly one production-scan invariant failure and 17 passes; the error was `production candidate audit full scan` at the former `audits.toArray()` call. The minimal indexed lookup reduced the failure set to zero with no repeated error signature or repair cycle. |
| Focused verification | Final direct selected-target `pnpm exec vitest run src/lib/db/candidate-orphan-cleanup.test.ts` exit 0 (1 file, 18 tests); `pnpm typecheck` exit 0; `git diff --check` exit 0 |
| Full gate | Fresh serial run after the production indexed-lookup repair: `pnpm test` exit 0 (83 files, 603 tests); `pnpm lint` exit 0 (0 errors, 11 pre-existing warnings); `pnpm typecheck` exit 0; `pnpm build` exit 0 (Next.js production build and seven routes) |
| Review | Accepted after the targeted repair. Functional contracts remain unchanged; production execute/reconcile use the existing transaction and unique `candidateId` index without materializing audit history, while the full-scan compatibility fallback is reachable only for a non-`GridDODatabase` implementation. Diff ownership is limited to `src/lib/db/indexeddb.ts`, `src/lib/db/candidate-orphan-cleanup.test.ts`, and this ledger; no Task 123 or UI path is owned. |
| Targeted rejection | Resolved and accepted: the production `auditByCandidate` lookup no longer calls `toArray().find`; repair commit `5d3fb54b2bc5452e6bc2cb3b7932c92119712248` passed the recorded focused and fresh full gates |
| User acceptance | Task 122 repaired checkpoint explicitly accepted on 2026-08-10, including confirmed-orphan correctness, exact reconciliation/rollback, retained audit history, and the indexed production audit lookup |
| Task markers | Tasks 120–122 are `[x]`; Tasks 123–126 remain `[ ]` |
| Next legal action | End the current Task 122 session; Task 123 remains not started and this acceptance creates no Task 123 write authority |
| Forbidden here | Do not start Task 123, write Task 123 `[x]`, push, create a PR, merge, rebase, cherry-pick, reset, switch or clean up a branch/worktree, or modify Phase 24 scope |

## Task 123 Gate C Handoff

| Field | Durable value |
| --- | --- |
| Task | Task 123 only — Implement staged and direct Placement commands |
| State | Gate C approved by the user on 2026-08-10; Task 123 is not started and its marker remains `[ ]` |
| Approved scope | Modify `src/lib/db/datastore.ts` and `src/lib/db/indexeddb.ts`; create `src/lib/db/triage-placement.test.ts`; extend `src/lib/db/inbox-operations.test.ts`; implement only the staged/direct typed Placement command, transaction, schema-default, rollback, and exact reconciliation contract; no UI and no Task 124 work |
| Whole-file receipt | `docs/issues/Issues_Phase_25.gate-c.json`, updated to `task_batch` / `task_order` `[123]` |
| Branch / worktree | Reuse explicitly approved for `phase-25/authoritative-command-dag` / `/Users/jwk/Documents/griddo2-codex-phase-25-authoritative-command-dag` |
| Integration / remote | `main`; post-fetch `origin/main` `7b79a97b56a7023c5f3e803ab646fc3bb7f6be28`; local `main` matched at Gate C |
| Continuation approved base | `dea3d094ae060db17bc1a5870d68267c27f2a3c7` (`docs: accept Task 122`) |
| Base exception | User explicitly approved preserving the existing 14-commit same-phase continuation above `origin/main`; no reset, rebase, merge, or cherry-pick |
| Dependencies | Tasks 120 and 121 are accepted at `9d7a6361fb0bdb52891f8253757d8088abbd3aac` and `a01c854aa82e1303550e19b915dd09af1acd9d81`; both are ancestors of the continuation base |
| Authority / readiness | SCHEMA staged/direct placement matrix; SPEC pointer-placement and commit-reliability contract; `docs/EXECUTION_PLAN.md` Task 123; no recipe, open Decision prerequisite, active issue, or plan/code drift |
| Writer mutex | Acquire `db-implementation`, `db-interface`, and `db-command-harness`; Task 123 is the only approved writer and Tasks 124–126 remain held |
| Baseline gate reuse | User approved reuse of the fresh serial full gate recorded after Task 122 repair commit `5d3fb54b2bc5452e6bc2cb3b7932c92119712248`; its `src` tree and the continuation base `src` tree are both `7a4b365b5bbd2fc595edb7ce318cd4ef7f896a65`; the later changes are only the Task 122 plan marker and ledger acceptance evidence |
| Task 123 verification | Start from direct selected-target RED; focused `pnpm exec vitest run src/lib/db/triage-placement.test.ts src/lib/db/inbox-operations.test.ts`; mutex regression `pnpm exec vitest run src/lib/db/candidate-orphan-cleanup.test.ts src/lib/db/staged-candidates.test.ts src/lib/db/triage-placement.test.ts src/lib/db/inbox-operations.test.ts`; then `pnpm typecheck` and `git diff --check`; after implementation run exactly one fresh serial full gate: `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build` |
| Workflow candidate | Use candidate commit `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`; next lifecycle skill is `skills/run-task/SKILL.md`; the global live `$run-task` is forbidden |
| Canonical impact | None at kickoff; Task 123 remains implementation-local to the approved SCHEMA/SPEC/execution contract unless run-task discovers and records otherwise |
| Next legal action | In a fresh session, invoke only the pinned candidate `$run-task`; it must first validate this committed Gate C receipt and create a separate durable Task 123 start commit before any test or production-code write |
| Forbidden here | Do not start Task 123 or Task 124, modify product/test files, write any task marker, run downstream lifecycle work, push, create a PR, merge, rebase, or modify Phase 24 or Shelf |

## Accepted Task 123

| Field | Durable value |
| --- | --- |
| Task | Task 123 only — Implement staged and direct Placement commands |
| State | Accepted by the user on 2026-08-10; Task 123 marker is `[x]` |
| Approved scope | Modify `src/lib/db/datastore.ts` and `src/lib/db/indexeddb.ts`; create `src/lib/db/triage-placement.test.ts`; extend `src/lib/db/inbox-operations.test.ts`; no other product/test file, UI, hook, Task 124, Phase 24, or Shelf work |
| Kickoff receipt | `docs/issues/Issues_Phase_25.gate-c.json` (`run-phase`, `gate-c`, Task 123 only), explicitly approved by the user |
| Start base / entrypoint | Continuation approved base `dea3d094ae060db17bc1a5870d68267c27f2a3c7`; run-task entrypoint and Gate C kickoff commit `aa28e01dc46280fee58117044fefb292482e409b` |
| Recovery anchor | Durable-start commit `1188e3959206182b8b2ca37e96f52eedcc4ef513`; its parent is `aa28e01dc46280fee58117044fefb292482e409b` and it precedes every Task 123 product/test write |
| Branch / worktree | `phase-25/authoritative-command-dag` / `/Users/jwk/Documents/griddo2-codex-phase-25-authoritative-command-dag`; existing same-phase reuse approved; clean at start |
| Dependencies / mutex | Tasks 120 and 121 accepted; `P25-122-R1` Closed; Task 123 exclusively owns `db-implementation`, `db-interface`, and `db-command-harness`; Tasks 124–126 remain held |
| Lifecycle evidence | Candidate `94e89782f7fe2cdbdd035e842ca6881b4a87ce49` run-phase resolver validated the committed Gate C receipt as `ready`; receipt-less run-task resolver returned the expected compatibility state `approval_required`, `contract_ready=true`, `writes_allowed=false`; write authority remains the user-approved Gate C receipt |
| Issues / deviations | None |
| Canonical impact | None — implementation-local conformance to the approved SCHEMA/SPEC/Task 123 contract |
| Verification contract | Selected-target RED; focused placement/inbox tests; four-file mutex regression; `pnpm typecheck`; `git diff --check`; then exactly one fresh serial full gate after focused green and final repair |
| Production changes | Added separate typed staged/direct Placement execute and reconcile APIs. Both carry stable operation/result identity, exact source/candidate revisions, intended type/title, target parent/path, and exact cell; revalidate Scratch/source/candidate lifecycle, hierarchy/reachability/type, title limits, capacity/cell, and versions inside one transaction; construct all four Node/Bit variants with explicit `version: 1` and `pastDeadlineDismissed: false` before full schema parsing; atomically create/touch parent/consume source and, for staged placement, delete the candidate. Reconcile accepts only complete postcondition, exact untouched precondition, or conflict. |
| TDD evidence | Initial selected-target RED exited 1 with 24 expected missing-method failures and 27 existing passes. The first implementation reduced the failure set to 10 transaction-lifetime failures, the synchronous snapshot validation repair reduced it to one mislabeled test fixture, and the corrected fixture reached 2 files / 51 tests. Review RED then reproduced missing parent `mtime` cascade and committed-Node reconcile drift with three exact failures / 50 passes; the targeted repair reached 2 files / 53 tests. No identical unchanged failure set persisted twice. |
| Focused verification | Final direct selected-target `pnpm exec vitest run src/lib/db/triage-placement.test.ts src/lib/db/inbox-operations.test.ts` exit 0 (2 files, 53 tests); mutex regression exit 0 (4 files, 75 tests); `pnpm typecheck` exit 0; `git diff --check` exit 0 |
| Full gate | Exactly one fresh serial post-implementation run: `pnpm test` exit 0 (84 files, 629 tests); `pnpm lint` exit 0 (0 errors, 11 pre-existing warnings); `pnpm typecheck` exit 0; `pnpm build` exit 0 (Next.js 16.2.1 production build, successful TypeScript/static generation, seven routes) |
| Review | No remaining blocking finding. Real-Dexie evidence covers four schema-parsed constructors, complete/untouched/conflict reconciliation, one-snapshot reconcile reads, stale lifecycle/version/path/cell/title rejection, source-candidate exclusion, every staged/direct checkpoint rollback, stable-ID replay, no compensation/alternate target/truncation/heuristic/silent resend, parent `mtime` cascade, and post-commit reconcile independence from later target movement. Diff ownership is exactly the four approved product/test paths plus this ledger. |
| User acceptance | Task 123 checkpoint explicitly accepted on 2026-08-10; implementation commit `c1b62eff6e35b740bc693b48ad080380cdd0241f` and its recorded focused/mutex/full verification evidence are the durable acceptance basis |
| Acceptance verification | Reused the recorded Task 123 full gate exactly as instructed; acceptance-only verification is exact two-file write-set inspection plus `git diff --check` |
| Task markers | Tasks 120–123 are `[x]`; Tasks 124–126 remain `[ ]` |
| Next legal action | Stop after the Task 123 acceptance commit; Task 124 and any next Gate C packet remain unapproved |
| Forbidden here | Do not start Task 124, prepare a next Gate C packet, modify product/test code, push, create a PR, merge, rebase, or perform branch/worktree cleanup |

## Task 124 Gate C Handoff

| Field | Durable value |
| --- | --- |
| Task | Task 124 only — Implement source-aware Undo with candidate-version ABA protection |
| State | Gate C approved by the user on 2026-08-10; Task 124 is not started and its marker remains `[ ]` |
| Approved scope | Modify `src/lib/db/datastore.ts` and `src/lib/db/indexeddb.ts`; create `src/lib/db/triage-undo.test.ts`; extend `src/lib/db/inbox-operations.test.ts`; implement only typed staged/direct source-aware Undo execute/reconcile, exact atomic inverse, dependency rejection, candidate v+1 restoration, ABA-3 conflict/no-resurrection, and ambiguous-Undo/new-placement protection; no UI and no Task 125/126, Phase 24, or Shelf work |
| Whole-file receipt | `docs/issues/Issues_Phase_25.gate-c.json`, updated to `task_batch` / `task_order` `[124]` |
| Branch / worktree | Reuse explicitly approved for `phase-25/authoritative-command-dag` / `/Users/jwk/Documents/griddo2-codex-phase-25-authoritative-command-dag` |
| Integration / remote | `main`; post-fetch `origin/main` `7b79a97b56a7023c5f3e803ab646fc3bb7f6be28`; local `main` matches |
| Continuation approved base | `54405de6aa9d1b42d1b58b19cbb68ee45a6a900e` (`docs: accept Task 123`) |
| Base exception | User explicitly approved preserving the existing 18-commit same-phase continuation above `origin/main`; no reset, rebase, merge, or cherry-pick |
| Dependency | Task 123 accepted at `54405de6aa9d1b42d1b58b19cbb68ee45a6a900e`; implementation commit `c1b62eff6e35b740bc693b48ad080380cdd0241f` and acceptance commit are ancestors of the continuation base |
| Authority / readiness | SCHEMA Undo matrix, staged-candidate v+1 restoration, and atomic reconciliation; `docs/EXECUTION_PLAN.md` Task 124, `UF-25`, `AF-06`, `AF-07`, `NEG-18`, and `NEG-20`; no recipe, open Decision prerequisite, active issue, or plan/code drift |
| Writer mutex | Acquire `db-implementation`, `db-interface`, and `db-command-harness`; Task 124 is the only approved writer and Tasks 125–126 remain held |
| Baseline gate reuse | User approved reuse of Task 123's fresh serial full gate at implementation commit `c1b62eff6e35b740bc693b48ad080380cdd0241f`; its `src` tree and the continuation base `src` tree are both `5feb3fae627d0a7e6c0adf2b770f289c6a6978c1`; the later changes are only Task 123 plan-marker and ledger acceptance evidence |
| Task 124 verification | Start from direct selected-target RED; focused `pnpm exec vitest run src/lib/db/triage-undo.test.ts src/lib/db/inbox-operations.test.ts`; mutex regression `pnpm exec vitest run src/lib/db/triage-placement.test.ts src/lib/db/triage-undo.test.ts src/lib/db/inbox-operations.test.ts`; then `pnpm typecheck` and `git diff --check`; after implementation run exactly one fresh serial full gate: `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build` |
| Workflow candidate | Use candidate commit `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`; next lifecycle skill is `/Users/jwk/Documents/codex-workflow-clean-design-mode-implementation/skills/run-task/SKILL.md` with SHA-256 `614631c56866549feb298d995ea0cf1311caa1cacaaefc2ba2ca753e43910531`; the global live `$run-task` is forbidden |
| Canonical impact | None at kickoff; Task 124 remains implementation-local to the approved SCHEMA/execution contract unless run-task discovers and records otherwise |
| Next legal action | Close this run-phase session after its receipt-only kickoff commit; in a fresh session invoke only the pinned candidate `$run-task`, using that kickoff commit as the recovery anchor; run-task must create a separate durable Task 124 start commit before any test or production-code write |
| Forbidden here | Do not start Task 124 or Task 125/126, modify product/test files, write any task marker, run test/lint/typecheck/build, invoke downstream lifecycle work, push, create a PR, merge, rebase, or modify Phase 24 or Shelf |
