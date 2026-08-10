# Phase 25 — Authoritative Command DAG

## Completion Summary

Tasks 120–126 were explicitly accepted on the isolated
`phase-25/authoritative-command-dag` branch. The phase adds eleven typed
authoritative repository commands and one read-only Archive recovery
classifier. It changes no UI, hook, store, route, theme, copy, mounted-session,
or future-task owner.

| Task | Accepted deliverable | Implementation / repair | Acceptance |
| --- | --- | --- | --- |
| 120 | Atomic Breakdown Add, Scratch Save, row Save, and row Delete with exact reconciliation | `785b9d0` → `6a4523e` | `9d7a636` |
| 121 | Durable Stage and Unstage with ABA-2 no-resurrection | `d37d5cf` | `a01c854` |
| 122 | Confirmed-orphan cleanup with unique durable audit and indexed reconciliation | `6c49204` → `5d3fb54` | `dea3d09` |
| 123 | Atomic staged/direct Node and Bit Placement | `c1b62ef` | `54405de` |
| 124 | Source-aware staged/direct Undo with candidate-version ABA-3 protection | `19dc391` | `06344a7` |
| 125 | Exact Archive eligibility and guarded Scratch Archive | `a28ea53` | `4a02fc0` |
| 126 | Exact read-only Archive recovery classification | `4eb8df3` | `adb9cc3` |

## Accepted Command Foundation

- Breakdown Add/Edit/Delete, Stage/Unstage, confirmed-orphan cleanup,
  staged/direct Placement, source-aware Undo, and guarded Scratch Archive each
  validate and write a complete postcondition in one repository transaction.
- Reconciliation recognizes only the exact complete precondition, complete
  postcondition, or conflict. Multi-store authority reads share one read-only
  transaction snapshot and never retry, compensate, or select a heuristic
  target.
- Node, Bit, Breakdown, and candidate revisions remain monotonic. ABA-1/2/3
  coverage proves late or duplicated reconciliation cannot resurrect a row,
  candidate, source consumption, or placement result.
- Candidate orphan cleanup requires authoritative deletion/tombstone proof,
  appends one unique integrity audit, preserves prior audit history, and uses
  the existing unique `candidateId` index on the production path.
- Scratch Archive independently requires an active Inbox owner, consumed ≥1,
  unconsumed 0, staged 0, exact version, and explicit caller confirmation that
  Add-draft/title blockers are clear. Generic `archiveBit` cannot bypass it.
- Archive recovery validates `PendingOperationRecovery`, reads the exact
  Scratch/owner/Breakdown/candidate authority in one snapshot, and returns
  `applied`, `not_applied`, `conflict`, or `unknown` without any write.
- No general operation log, journal, outbox, queue, persisted recovery owner,
  UI sequencing, or Task 127+ behavior was introduced.

## Verification And Acceptance

Every task has a durable start, implementation/evidence commit, explicit user
acceptance, and separate acceptance commit in
[`docs/issues/Issues_Phase_25.md`](../../issues/Issues_Phase_25.md). The phase's
only execution-time repairs—`P25-120-R1`, `P25-122-R1`, and `P25-125-R1`—are
Closed under their exact accepted boundaries. Canonical impact is `None` for
every task and repair.

The final fresh serial full gate ran at Task 126 implementation commit
`4eb8df3c50455588e4ebd880d72d5e366f50d0cd`:

| Command | Exit | Result |
| --- | ---: | --- |
| `pnpm test` | 0 | 87 test files / 679 tests passed |
| `pnpm lint` | 0 | 0 errors; 11 pre-existing warnings |
| `pnpm typecheck` | 0 | TypeScript check passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |

The Task 126 acceptance commit changed only the execution plan and phase
ledger. Its `src` tree equals the implementation commit's `src` tree at
`483c7756667335b502105dfa4a712b128a7a117b`, so end-phase reused the valid gate
without rerunning test/lint/typecheck/build. The data/nonvisual task checkpoints
and real-Dexie evidence are the applicable observable verification; Tasks
136–162 own later rendered interaction and presentation.

## Close Handoff

- Pinned pre-close SHA:
  `adb9cc35ba611521915373fa5876665dedb2fc98`.
- Approved base: `7b79a97b56a7023c5f3e803ab646fc3bb7f6be28` on `main`.
- Blocking conformance violations: 0.
- Advisory conformance violations: 0.
- Active issues: 0.
- Deferred Phase 25 issues: 0.
- Phase Notes: not used by adapter policy.
- Downstream work consumes this completed foundation only through the exact
  dependencies in the active execution plan. Phase 25 completion does not
  start Task 127, Phase 26, or any other lifecycle.

**Full issue log:**
[`docs/issues/Issues_Phase_25.md`](../../issues/Issues_Phase_25.md)
