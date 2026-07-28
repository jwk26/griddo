# Issues — Phase 23: Model, Migration, Transactions, And Retention

> Branch: `phase-23/inbox-triage-model-foundation`  
> Worktree: `/Users/jwk/Documents/griddo2-codex-phase-23-model-foundation`  
> Kickoff date: 2026-07-28  
> State: Tasks 101–102 accepted; Task 103 authorized but not started

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
| Gate | Gate C, user-approved 2026-07-28 by the instruction `좋아 진행` after the exact kickoff packet and lifecycle clarification |
| Source mode | Approved clean canonical plan and flow review merged to `main` by PR #36 |
| Phase scope | Phase 23, Tasks 101–105 |
| First bounded batch | Task 101 only — authoritative model and typecheck-compatible constructors |
| Task state | Not started; `docs/EXECUTION_PLAN.md` remains open |
| Issue ledger | `docs/issues/Issues_Phase_23.md` |
| Integration branch | `main` |
| Post-fetch remote | `origin/main` at `a532d9e3becd5b333da8bb9ae7e1d0c6f442666f` |
| Approved base | `a532d9e3becd5b333da8bb9ae7e1d0c6f442666f` |
| Feature branch | `phase-23/inbox-triage-model-foundation` |
| Worktree | `/Users/jwk/Documents/griddo2-codex-phase-23-model-foundation` |
| Entrypoint commit | `5b43539986b2f857570f77b1ee153ff6b2341845` |
| Entrypoint diff SHA-256 | `a2f2cfc2c3c2c1e36ce9ca7cd7819ecc91f2ce093db21039cbb5fa2b126923ce` |
| Next legal action | A fresh `$run-task` session executes Task 101 only after revalidating this receipt |

## Readiness Evidence

- The approved plan names Task 101 as the first code root. It depends only on
  plan approval and execution-lifecycle onboarding and has no `VQ-*` or visual
  recipe dependency.
- The approved flow review reports 39/39 flows `Owned`, `Weak: 0`, `Gap: 0`.
  Its former lifecycle-blocked status is resolved only by the entrypoint commit
  above; its fourteen visual Decision receipts remain open and unaffected.
- Post-fetch local `main` and `origin/main` both equaled the approved base.
  Phase 22 merge `23efe5b` and every approved canonical receipt are contained
  in that base.
- The new feature branch and worktree were absent before Gate C. Initial
  `HEAD` equaled the approved base, the worktree was clean, and
  `approved-base..HEAD` contained zero commits.
- Current production matches Task 101's expected prestate: Dexie ends at v3;
  Node, Bit, and ScratchBreakdown lack `version`; the new durable candidate,
  orphan-audit, operation, and recovery types are absent; all named code/test
  paths exist.
- The plan's factory discovery command returns exactly 36 declared test files.
  `src/hooks/use-can-archive-scratch.test.ts` separately contains the planned
  incomplete cast cleanup.
- The superseded Golden pilot was verified clean at
  `52a385d601a6394f2e140078be1ca7b5242e5ca9`, compared read-only, and yielded
  no code or test transplant. Its local branch and worktree were retired on
  2026-07-28; the SHA remains historical audit identity only.

## Full Base Gate

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm install --frozen-lockfile` | 0 | Lockfile unchanged; 537 packages linked |
| `pnpm test` | 0 | 73 files passed; 499 tests passed |
| `pnpm lint` | 0 | 0 errors; 11 pre-existing warnings |
| `pnpm typecheck` | 0 | TypeScript check passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build and seven routes completed |

## Adapter Onboarding Evidence

- `AGENTS.md` and `docs/CODEX_WORKFLOW_ADAPTER.md` are the only files in the
  entrypoint commit.
- `repository_root` is the exact Phase 23 worktree.
- `lifecycle_scope.active` contains only `run-phase` and `run-task`.
- `end-phase` publication/archive/cleanup fields are refreshed for the current
  branch but the lifecycle remains unavailable until a separate Final Close.
- The completed one-time docs-publication authority is explicitly expired and
  cannot authorize Phase 23 push, PR, merge, or cleanup.
- Task 101 focused commands are the two named database test files,
  `pnpm typecheck`, `git diff --check`, and the exact 36-file factory discovery
  sweep. Data-only Tasks 101–105 require no rendered evidence.

## Active Issues

None at kickoff.

## Active Task

| Field | Durable value |
| --- | --- |
| Task | Task 103 — Enforce revisions across every public and repository mutation path |
| State | `Not started`; authorized by explicit Task 102 acceptance; requires a committed `In Progress` start signal before production writes |
| Approved scope | Exact Task 103 batch from `docs/EXECUTION_PLAN.md`: revision/public-boundary code and the named mutation-path tests only |
| Kickoff receipt | [`Gate C Kickoff Receipt`](#gate-c-kickoff-receipt) at commit `b22c7a421bf0087e8f0649e66a51ed22bc022259` |
| Approved base | `a532d9e3becd5b333da8bb9ae7e1d0c6f442666f` |
| Entrypoint SHA | `5b43539986b2f857570f77b1ee153ff6b2341845` |
| Recovery anchor | Accepted Task 102 implementation `dcdc74d` and evidence `ff56d82` on `phase-23/inbox-triage-model-foundation` |
| Implementation commit | Not created |
| Canonical impact | `Reflected` — implement the already-approved SCHEMA monotonic revision/CAS boundary without changing canonical policy |
| Issues / deviations | None open at authorization. |
| Next legal action | Commit this acceptance boundary, then record a separate Task 103 `In Progress` start signal and observe the planned revision/public-boundary RED before production writes. |

## Task 102 Start Receipt

- **Authorized predecessor:** Task 101 acceptance at `4a7865a`.
- **State:** `In Progress` on 2026-07-28; Task 102 remains `[ ]`.
- **Write scope:** modify `src/lib/db/indexeddb.ts` and
  `src/lib/db/indexeddb.schema-v3-upgrade.test.ts`; create
  `src/lib/db/indexeddb.schema-v4-upgrade.test.ts`. No other production or
  test file is authorized.
- **RED order:** first keep the corrected v3 fixture GREEN; then observe v4
  schema/index/empty-store RED, successful v1/v2/v3 preservation/backfill RED,
  and structured invalid-row/reference rollback RED before each matching
  production change.
- **Forbidden scope:** revision increments/CAS, transaction checkpoint seams,
  aggregate hard delete, command behavior, UI/hooks, candidate manufacture,
  operation log/journal/outbox/offline queue, Task 103, and publication.
- **Focused gate:** `pnpm exec vitest run
  src/lib/db/indexeddb.schema-v3-upgrade.test.ts
  src/lib/db/indexeddb.schema-v4-upgrade.test.ts`, then `pnpm typecheck` and
  `git diff --check`.

## Task 102 Implementation Evidence

### RED and repair history

1. The first v4 schema test failed with `expected 3 to be 4`; the minimal
   repair added only the exact v4 stores, indexes, and typed tables.
2. The v1/v2/v3 preservation matrix then failed because Bit `version` and
   `pastDeadlineDismissed` were absent; the repair added only the allowed
   undefined-only Node/Bit/Breakdown backfills.
3. Five invalid row/reference cases then failed because migration incorrectly
   succeeded; the repair added structured `IndexedDBMigrationError` failures,
   raw-row Zod validation, and Inbox Scratch-owner validation inside the same
   Dexie upgrade transaction.
4. Three persisted fields with Zod defaults then exposed false success. The
   repair requires every persisted key after the two authorized backfills, so
   defaults cannot silently manufacture other missing data.

### Implemented scope

- v4 declares the exact seven-store schema, including both new unique indexes;
  both new stores start empty and no candidate or audit row is inferred.
- v1/v2/v3 upgrades backfill only missing versions and missing Node/Bit
  `pastDeadlineDismissed`; existing revisions, booleans, unknown fields, IDs,
  content, order, timestamps, chunks, and settings remain unchanged.
- Node, Bit, and Breakdown rows are validated without writing parsed output.
  Every Breakdown must resolve to a Bit whose parent is the Inbox system Node.
- Invalid rows and ownership references throw `{name, store, id, reason}` from
  the upgrade transaction. Reopening through a v3 inspector proves the failed
  upgrade leaves byte/row-equivalent legacy snapshots and no v4 stores.
- No Task 103 revision increment, CAS, command, UI, or publication scope was
  implemented.

### GREEN evidence

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm exec vitest run src/lib/db/indexeddb.schema-v3-upgrade.test.ts src/lib/db/indexeddb.schema-v4-upgrade.test.ts` | 0 | 2 files, 16 tests passed |
| `pnpm test` | 0 | 74 files, 517 tests passed |
| `pnpm typecheck` | 0 | TypeScript check passed after the final preservation fixture |
| Focused ESLint on all three Task 102 files | 0 | No warnings or errors |
| `pnpm lint` | 0 | 0 errors; the same 11 pre-existing warnings |
| `pnpm build` | 0 | Production build and seven routes completed; production code was unchanged after this run |
| `git diff --check` | 0 | No whitespace errors before the implementation commit |

### Review disposition

- Two independent read-only reviews found no implementation blocker or Task
  103 scope leakage.
- The sole advisory requested explicit preservation coverage for existing Bit
  and Breakdown revisions/booleans. The final fixture now preserves nondefault
  values and unknown fields for Node, Bit, and Breakdown.

## Task 102 Acceptance Receipt

- **Disposition:** accepted explicitly by the user on 2026-07-28 with the
  instruction `승인. 진행해`.
- **Accepted implementation:** `dcdc74d` (`feat(triage): migrate indexeddb
  atomically to v4`).
- **Evidence receipt:** `ff56d82` (`docs: record Task 102 implementation
  evidence`), including 16 focused migration tests, 74 files / 517 tests,
  typecheck, lint, build, and diff checks.
- **Independent review:** blocker count zero. The review directly re-ran the
  focused migration tests, full tests, and typecheck and confirmed the exact
  three-file commit contract.
- **Boundary:** this accepts Task 102 only. Task 103 owns revision increments,
  CAS, and public update boundaries. No Task 104 work, push, merge,
  publication, phase acceptance, or visual Decision receipt is granted.
- **Next legal action:** commit this receipt, then begin Task 103 through the
  named `$run-task` path with its own committed `In Progress` start signal and
  observed revision/public-boundary RED.

## Task 101 Implementation Evidence

### RED and repair history

- Before production implementation, the declared focused command
  `pnpm test -- src/lib/db/schema.test.ts` exposed four intended Task 101
  failure clusters while the prior 499 tests remained green: required model
  versions, public update schemas, durable candidate schemas, and narrow
  audit/recovery schemas.
- The declared command includes `--` and therefore ran the full Vitest suite
  instead of only the named file. This is a non-blocking verification-efficiency
  finding for the post-Phase-23 workflow improvement pass; it did not broaden
  implementation scope.
- Read-only review then found that the first generic operation wrapper made
  payload-free values uninhabitable and erased discriminated-union evidence.
  Compile-time fixtures reproduced both failures. The final wrapper uses an
  empty payload without a string index signature and distributes over result
  variants, preserving status-specific evidence for later command tasks.

### Implemented scope

- Node, Bit, and Scratch Breakdown stored models require integer `version >= 1`;
  Node and Bit default `pastDeadlineDismissed` to `false`.
- Public create/update schemas omit repository-owned IDs, creation/lifecycle
  metadata, and versions while retaining current user-owned update fields.
- `StagedCandidate`, `CandidateOrphanAuditEvent`,
  `PendingOperationRecovery`, operation identity/status/base command-result
  types, and all public type exports match the approved Task 101 boundary.
- All six current production constructor sites explicitly initialize the new
  fields. The approved discovery sweep found 36 test files containing 59 typed
  factories; every one is compatible, and the incomplete Scratch Breakdown
  cast was replaced with a complete fixture.
- Command-specific request/result variants remain owned by Tasks 120–126. The
  Task 101 base types preserve future discriminated variants without choosing
  command-specific payload fields early.

### GREEN evidence

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm exec vitest run src/lib/db/schema.test.ts src/lib/db/indexeddb.test.ts` | 0 | 2 files, 20 tests passed |
| `pnpm test` | 0 | 73 files, 505 tests passed; baseline 499 plus six Task 101 tests |
| `pnpm typecheck` | 0 | TypeScript check passed, including base and discriminated operation-type fixtures |
| `pnpm lint` | 0 | 0 errors; the same 11 pre-existing warnings as the base gate |
| `pnpm build` | 0 | Next.js production build and seven routes completed |
| Factory ownership sweep | 0 | 36 files, 59 factory functions, zero missing changed files |
| `git diff --check` | 0 | No whitespace errors before the implementation commit |

### Remaining planned risk

- Task 102 owns Dexie v4 stores and the legacy-data backfill. Task 103 owns
  monotonic version increments and CAS enforcement. Task 101 does not claim
  either behavior early.
- There is no current user-visible surface change. No visual Decision receipt
  is consumed and no publication authority is granted.

## Task 101 Acceptance Receipt

- **Disposition:** accepted explicitly by the user on 2026-07-28, with direct
  authorization to continue to Task 102.
- **Accepted implementation:** `b6bbed8` (`feat(triage): define versioned
  inbox domain model`).
- **Evidence receipt:** `5fdf9aa` (`docs: record Task 101 implementation
  evidence`), including 73 files / 505 tests, typecheck, lint, build, factory
  ownership, and diff checks.
- **Independent review:** blocker count zero. The superseded Golden pilot and
  Task 14 Fresh implementation were compared read-only; neither contributed a
  code or test transplant to the accepted implementation.
- **Boundary:** this accepts Task 101 only. Task 102 still owns Dexie v4 and
  legacy backfill; Task 103 still owns revision increments and CAS. No push,
  merge, publication, phase acceptance, or visual Decision receipt is granted.
- **Next legal action:** commit this receipt and begin Task 102 with its own
  `In Progress` start signal and observed migration RED.

## `run-task` Live Pilot Audit

This Phase 23 implementation is also the real-project pilot for `run-task`.
Correctness evidence and workflow cost are separate axes: a task may be
correct while still exposing excessive context, repeated checks, adapter
churn, or discovery/bootstrap failure. Skill code remains frozen during Phase
23; findings are accumulated here for the post-phase improvement pass.

### Current coverage limitation

- The custom `$run-task` skill is installed through the project skill symlink,
  but it was not exposed in this session's available-skill catalog. Tasks 101
  and 102 therefore exercised the approved local `run-task` contract manually,
  not the named-skill discovery/loading path.
- Consequently, these tasks are valid tests of scope control, receipts, TDD,
  verification, acceptance markers, and stop boundaries, but they are **not**
  a complete test of `$run-task` invocation or its native context cost.
- Task 103 should start in a fresh session where `$run-task` is visibly loaded;
  inability to do so is itself a release-blocking discovery/bootstrap finding
  for the post-Phase-23 skill audit.

### Observed task data

| Task | Start → evidence | Elapsed wall time | Workflow result | Cost / friction signal |
| --- | --- | ---: | --- | --- |
| 101 | `ee42ff8` → `5fdf9aa` | 18m 37s | Exact commit scope, RED/repair, 505-test full gate, explicit checkpoint | Declared `pnpm test -- <file>` ran the full suite; focused-command normalization is required. Two generic type defects were caught by review after the initial implementation. |
| 102 | `2e77b46` → `ff56d82` | 9m 06s | Four observed RED clusters, exact three-file scope, atomic rollback proof, 517-test full gate | Advancing one task required a sizable adapter/ledger rewrite. Named-skill loading was unavailable. A second full test was justified only because the final preservation fixture invalidated the first test result; build was not repeated after test-only evidence changes. |

### What the pilot has validated

- Exact task scope and commit contracts prevented Task 103 CAS or later command
  behavior from leaking into Tasks 101–102.
- `[x]` remained user-owned; implementation evidence did not silently accept a
  task or start the next one.
- RED-first testing caught missing versioning, migration, validation, and Zod
  default masking before production code was accepted.
- Independent review found real type/evidence gaps and repairs stayed within
  the active task.
- Focused tests plus invalidated full gates produced useful confidence without
  rerunning every gate after documentation-only commits.

### Post-Phase-23 improvement candidates

1. Make explicit `$run-task` invocation discoverable from a fresh project
   session; skill invocation itself must be the bootstrap path.
2. Separate stable adapter policy from runtime-detected facts and user approval
   receipts so advancing a task does not rewrite broad project configuration.
3. Normalize runner-specific focused commands; for Vitest use `pnpm exec vitest
   run <files>` rather than `pnpm test -- <files>`.
4. Build a compact task context packet with exact authority ranges so each
   task does not rescan the full canonical chain.
5. Define a mechanical invalidation matrix for focused/full gates and record
   why each rerun is required.

### Required observations for Tasks 103–105

Record named-skill availability, start/evidence timestamps, files changed,
observed RED clusters, verification commands and invalidation reasons, review
defects, user decision count, adapter/receipt churn, and any repeated canonical
reads. Do not modify `run-task` until the Phase 23 trace is complete.

## Run-Task Boundary

Task 102 is accepted. The next lifecycle may execute Task 103 only. Before its
first production write, `$run-task` must verify this branch/worktree/receipt
and commit an `In Progress` start signal. It must observe the planned
revision/public-boundary failures before implementation. Task 104, push,
publication, merge, and `end-phase` remain forbidden.
