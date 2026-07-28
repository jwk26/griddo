# Issues — Phase 23: Model, Migration, Transactions, And Retention

> Branch: `phase-23/inbox-triage-model-foundation`  
> Worktree: `/Users/jwk/Documents/griddo2-codex-phase-23-model-foundation`  
> Kickoff date: 2026-07-28  
> State: Tasks 101–105 accepted; Task 105A `Implemented` awaiting user acceptance

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

## Phase 23 Findings And Decisions

| ID | Finding | State | Disposition |
| --- | --- | --- | --- |
| `P23-01` | SCHEMA Hook 9 predates the dedicated Scratch Breakdown store and does not state whether Inbox-parented Scratch Bits may use Bit-to-Node promotion. | `Promoted to Execution Plan` | The issue was surfaced as `Awaiting User Decision`; on 2026-07-28 the user approved the identity rule that any Bit parented to the Inbox system Node is a Scratch and cannot be promoted. Task 105 remains unchanged. Task 105A owns the separate SCHEMA gate and later repository regression. |
| `P23-02` | `src/hooks/use-scratch-breakdowns.test.tsx` retains a test-only mock and no-call assertion for the retired `deleteScratchBreakdownsByScratch` API. | `Deferred` | Production interface and implementation are already removed; the stale mock has no runtime effect and is outside Task 105's exact file contract. Task 120's planned hook/command replacement owns its removal. |

### Task 105 / Task 105A Boundary Decision Receipt

- **Observed canonical state:** SCHEMA Hook 9 already defines ordinary
  Bit-to-Node promotion through Chunks, but it predates the dedicated
  `scratchBreakdowns` store. This is stale canonical scope, not an absent
  product policy.
- **Identity decision:** `parentNode.systemRole === "inbox"` determines a
  Scratch. Promotion is forbidden for that identity regardless of current
  Breakdown, candidate, or Chunk presence. Empty Scratch is not promotable.
- **Rejected alternatives:** Task 105 does not silently delete Breakdown/
  candidate data during promotion and does not invent a migration of that data
  into the promoted Node.
- **Task boundary:** Task 105 retains its exact approved hard-delete and trash-
  cleanup contract. Task 105A follows it as a separate canonical amendment and
  implementation gate; neither commit may be folded into Task 105.
- **Checkpoint seam:** Task 105 actual deletion methods may invoke the existing
  private synchronous checkpoint emitter after named store mutations. The
  protected Task 104 probe and public API surface are not widened.
- **User disposition:** approved explicitly on 2026-07-28 by `go ahead` after
  the alternatives and recommended boundary were presented.
- **Next legal action:** commit this plan amendment, then begin Task 105 only
  through its own bounded `$run-task` start receipt.

## Active Task

| Field | Durable value |
| --- | --- |
| Task | Task 105A — reject Inbox-parented Scratch promotion |
| State | `Implemented` at `45cfec5`; awaiting user acceptance while the Task 105A marker remains open |
| Approved scope | No current production write. Review only the exact `src/lib/db/indexeddb.ts` and `src/lib/db/promotion.test.ts` Task 105A implementation plus its evidence. |
| Kickoff receipt | [`Gate C Kickoff Receipt`](#gate-c-kickoff-receipt) at commit `b22c7a421bf0087e8f0649e66a51ed22bc022259` |
| Approved base | `a532d9e3becd5b333da8bb9ae7e1d0c6f442666f` |
| Entrypoint SHA | `5b43539986b2f857570f77b1ee153ff6b2341845` |
| Recovery anchor | Approved SCHEMA content `67dbe521c875d5b7f0f870de39fe840e91977ccc` on `phase-23/inbox-triage-model-foundation` |
| Implementation commit | `45cfec5b26d1dca38c0a5588f359116ca57b29c7` (`fix(db): reject Scratch bit promotion`) |
| Canonical impact | `Reflected`: `P23-01` is now explicit in approved SCHEMA Hook 9 at `67dbe52` |
| Issues / deviations | `P23-01` is the exact amendment owner; `P23-02` remains deferred to Task 120. No other issue or deviation is open. |
| Next legal action | Present the Task 105A checkpoint and wait for explicit user acceptance or targeted rejection. Do not write `[x]` or begin Phase 23 close. |

## Task 105 Start Receipt

- **Authorized predecessor:** Task 104 acceptance at `bc9d2d7`; approved
  Task 105/105A scope split at `f193233`.
- **Started:** `2026-07-28T15:36:46+0900`; Task 105 remains `[ ]`.
- **Named-skill path:** the installed `$run-task` symlink resolves to the live
  `codex-workflow/skills/run-task` package. Its full contract and required
  references were loaded earlier in this same Phase 23 session and remain the
  active execution boundary.
- **Write scope:** modify `src/lib/db/datastore.ts` and
  `src/lib/db/indexeddb.ts`; create
  `src/lib/db/scratch-aggregate-hard-delete.test.ts`; update only
  `src/lib/db/cascade-hard-delete.test.ts`,
  `src/lib/db/auto-cleanup.test.ts`, and
  `src/lib/db/scratch-breakdowns.test.ts` for the exact Task 105 behavior.
- **Atomic boundary:** compute and validate each complete delete closure inside
  one real seven-store `rw` transaction before the first write. A pre-existing
  candidate/source integrity gap returns the typed
  `integrity_cleanup_required` result and writes nothing. Planned aggregate
  deletion removes present source/candidate pairs without creating audit rows;
  every pre-existing audit and unrelated aggregate remains byte-for-byte.
- **Checkpoint boundary:** actual hard-delete and trash-cleanup methods invoke
  the existing private synchronous checkpoint emitter after named mutations.
  The protected Task 104 probe and public transaction surface are not widened.
- **RED order:** first use the real Task 104 database/snapshot harness to show
  current hard-delete leaves candidates or partial state and cannot roll back
  after injected failures. Then prove the orphan precondition, audit retention,
  unrelated retention, Archive exclusion, and one-transaction cleanup before
  the minimal production repair.
- **Forbidden scope:** SCHEMA Hook 9, `promoteBitToNode`, Task 105A, Task 120/
  122 command or reconciliation APIs, UI, operation log/journal/outbox/queue,
  push, merge, publication, and `end-phase`.
- **Verification:** run the four Task 105 focused test files through
  `pnpm exec vitest run`, then `pnpm typecheck`, `pnpm lint`,
  `git diff --check`, and only full gates invalidated by the shared repository
  change. This task is data/nonvisual, so rendered evidence is `None`.
- **Next legal action:** commit this start signal, then write the failing real-
  IDB aggregate tests before production behavior.

## Task 105 Implementation Evidence

### RED and repair sequence

1. `scratch-aggregate-hard-delete.test.ts` first produced seven expected
   failures: hard delete returned no typed result, retained the staged
   candidate, did not stop for a missing source, and never reached any actual-
   method rollback checkpoint.
2. The expanded four-file RED set produced fourteen behavior failures. One
   real-IDB cleanup case initially timed out because Vitest fake timers paused
   IndexedDB scheduling; the test was corrected to use a real clock with an
   already-expired timestamp, after which it failed for the intended reason
   (the checkpoint was not reached and cleanup resolved).
3. One repository repair introduced a typed aggregate result and one private
   planned-delete executor. Focused verification then passed without a second
   production repair cycle.

### Implemented scope

- `AggregateHardDeleteResult` distinguishes `{ status: "deleted" }` from
  `integrity_cleanup_required` carrying the exact affected candidate records.
  Node delete, Bit delete, and trash cleanup now expose that result; existing
  UI callers remain unchanged and Task 122 retains ownership of confirmed-
  orphan command consumption.
- Every closure read, candidate/source validation, delete plan, and write runs
  inside one seven-store `rw` transaction. Trash cleanup unions and deduplicates
  all expired Node/Bit roots before its first mutation rather than committing
  one expired item at a time.
- A candidate is deleted only with its still-present source in the planned
  closure. A targeted missing source, or a source/Scratch owner mismatch that
  violates SCHEMA Staged Candidate Integrity rule 1, returns
  `integrity_cleanup_required` before any write. An unrelated pre-existing
  orphan neither blocks nor changes the target aggregate.
- Successful aggregate deletion removes candidates, Breakdown rows, Chunks,
  Bits, and Nodes child-first, then performs one version-neutral surviving-
  parent `mtime` touch. The actual methods emit private synchronous checkpoints
  after each non-empty store mutation. Existing audit rows and settings are
  never mutated.
- The public `deleteScratchBreakdownsByScratch` sequencing escape hatch was
  removed from both `DataStore` and `IndexedDBDataStore`. Single-row Breakdown
  deletion remains available under its existing owner/version contract.
- Real-IDB tests cover Bit and Node closure success, byte-for-byte audit and
  unrelated retention, targeted and unrelated orphan states, every actual Bit
  mutation checkpoint, Node-store rollback, whole-cleanup rollback across two
  expired roots, and Archive retention of source/candidate/audit truth.

### GREEN evidence

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm exec vitest run src/lib/db/scratch-aggregate-hard-delete.test.ts src/lib/db/cascade-hard-delete.test.ts src/lib/db/auto-cleanup.test.ts src/lib/db/scratch-breakdowns.test.ts` | 0 | 4 files, 26 tests passed |
| `pnpm exec eslint` on the six Task 105 implementation/test paths | 0 | No warnings or errors in the changed paths |
| `pnpm test` | 0 | 80 files, 552 tests passed |
| `pnpm lint` | 0 | 0 errors; the same 11 pre-existing warnings |
| `pnpm typecheck` | 0 | TypeScript check passed |
| `pnpm build` | 0 | Next.js production build and seven routes completed |
| `git diff --check` | 0 | No whitespace errors before the implementation commit |

### Review disposition and `$run-task` pilot trace

- Pre-implementation read-only review identified the previously untested
  surviving-parent checkpoint, whole-cleanup transaction boundary, unrelated-
  orphan retention, Archive candidate retention, and stale public bulk-delete
  escape hatch. Each became focused evidence in the exact approved files.
- Diff review found no Task 105A promotion work, Task 120/122 command API,
  audit append, UI change, general transaction API, operation log, journal,
  outbox, or queue. `candidateOrphanAuditEvents` remains transaction-scoped for
  rollback but is never written by aggregate deletion.
- Named `$run-task` scope/start/checkpoint rules were loaded from the installed
  project skill. The task used RED before production, one focused GREEN set,
  one final full gate, one implementation commit, and a separate evidence
  receipt; no repeated full gate was needed.
- Two parallel final-review workers did not return within the bounded review
  window and were interrupted to avoid further cost. Their output is not
  claimed as completion evidence; the recorded disposition is based on direct
  contract/diff review plus the real-IDB and full-gate evidence above. This is
  retained as Phase-close input for bounded reviewer timing in `run-task`.
- Start `f0ca69b` to implementation `9c078d4` took 13m 42s. Task 105 remains
  `[ ]`; Task 105A and its SCHEMA gate remain unavailable until explicit user
  acceptance.

## Task 105 Acceptance Receipt

- **Disposition:** accepted explicitly by the user on 2026-07-28 with
  `승인합니다 넘어가세요` after independent read-only review reported PASS
  and blocker count zero.
- **Accepted implementation:** `9c078d4` (`feat(db): delete scratch aggregates
  atomically`).
- **Evidence receipt:** `4f6d416` (`docs: record Task 105 implementation
  evidence`), including the real-IDB aggregate/rollback matrix, 26 focused
  tests, 80 files / 552 full tests, typecheck, lint, build, and diff checks.
- **Independent review:** re-ran the focused tests, full tests, and typecheck;
  confirmed the exact six-file implementation contract, one-transaction Node/
  Bit/cleanup convergence, candidate/source integrity stop before the first
  write, audit-store immutability, public bulk-delete retirement, and unchanged
  promotion code.
- **Accepted advisory:** `P23-02` is test-only stale mock residue outside this
  task's file contract. It changes no production surface and is deferred to
  Task 120's hook/command replacement rather than expanding Task 105.
- **Boundary:** this accepts only Task 105 aggregate hard-delete/cleanup and
  writes its `[x]`. It does not approve the Task 105A SCHEMA draft or code,
  Task 120/122 commands, push, merge, publication, phase close, or skill
  rollout.
- **Next legal action:** commit this receipt. Task 105A may then open a
  SCHEMA-only start receipt and present the Hook 9 amendment for separate user
  approval before any implementation.

## Task 105A SCHEMA Gate Start Receipt

- **Authorized predecessor:** Task 105 acceptance at `0faaa70`.
- **Started:** `2026-07-28T16:02:29+09:00`; Task 105A remains `[ ]`.
- **User authority:** the user approved the identity rule and separate-gate
  sequence with `go ahead`, then instructed the workflow to move on after
  accepting Task 105. This authorizes drafting, not approving, the SCHEMA
  amendment.
- **Exact draft scope:** amend only SCHEMA Hook 9 to state that a Bit whose
  parent Node has `systemRole: "inbox"` is a Scratch and cannot be promoted,
  regardless of Breakdown, candidate, or Chunk presence. Explain that Scratch
  uses the dedicated Breakdown store rather than Hook 9's Chunk-based ordinary
  promotion meaning.
- **Forbidden scope:** `src/lib/db/indexeddb.ts`, `promotion.test.ts`, any other
  code/test/UI file, inferred Breakdown/candidate deletion or migration,
  `[x]`, push, merge, publication, and `end-phase`.
- **Verification:** `git diff --check`; inspect the exact Hook 9 diff; compare
  the current `systemRole`/Scratch and `promoteBitToNode` production facts;
  require `git diff --name-only 0faaa70 -- docs/SCHEMA.md` to identify only the
  canonical draft before its gate.
- **Next legal action:** commit this start signal, draft `docs/SCHEMA.md`, then
  stop for explicit user approval before any promotion implementation.

## Task 105A SCHEMA Approval And Implementation Start Receipt

- **User disposition:** the user approved the unchanged Hook 9 draft on
  2026-07-28 with `go ahead` after independent review and Codex's scope
  recommendation.
- **Approved canonical artifact:** `67dbe521c875d5b7f0f870de39fe840e91977ccc`
  (`docs: amend scratch promotion boundary`), containing the exact reviewed
  pre-receipt SCHEMA SHA-256
  `d0307b0cea114a7708b9149ff31525cc4cc527e1ae2c3b13d3a73a3dd245cd`.
- **Started:** `2026-07-28T16:28:16+0900`; Task 105A remains `[ ]`.
- **Exact production scope:** modify only `src/lib/db/promotion.test.ts` and
  `src/lib/db/indexeddb.ts`. First prove that an Inbox-parented Bit is rejected
  even with defensive Chunk data and that all stores remain unchanged; then
  add the minimum identity guard immediately after resolving the parent and
  before grid checks, result-ID allocation, or any store write.
- **Preserved behavior:** ordinary non-Inbox Bit promotion retains its current
  behavior. Breakdown, candidate, and Chunk presence never toggles the rule.
- **Explicitly unadopted review suggestion:** no UI-hiding rule or visual
  change enters this batch. That would require a separately owned UI surface
  and is not implied by repository safety.
- **Forbidden scope:** every other code/test/UI file, Breakdown/candidate
  deletion or migration, Task 120/122 commands, `[x]`, push, publication,
  merge, phase close, and skill modification.
- **Verification:** `pnpm exec vitest run src/lib/db/promotion.test.ts`,
  `pnpm typecheck`, `pnpm lint`, and `git diff --check`; run any additionally
  invalidated gate only with a recorded reason.
- **Next legal action:** commit this approval/start receipt before the first
  production write, then execute RED → minimum implementation → focused
  and relevant full verification.

## Task 105A Implementation Evidence

- **Implementation commit:** `45cfec5b26d1dca38c0a5588f359116ca57b29c7`
  (`fix(db): reject Scratch bit promotion`). The commit changes exactly
  `src/lib/db/indexeddb.ts` and `src/lib/db/promotion.test.ts`.
- **Implemented behavior:** after resolving the source Bit's parent and before
  grid checks or result construction, `promoteBitToNode` rejects when
  `parent.systemRole === "inbox"`. Ordinary non-Inbox promotion is unchanged.
- **RED evidence:** the first focused run executed seven promotion tests and
  failed exactly the two new Scratch cases. Both promises resolved to newly
  created Nodes instead of rejecting; the five existing ordinary/depth tests
  passed. This directly reproduced the stale Hook 9 behavior.
- **GREEN evidence:** one real-IDB regression removes all related
  Chunk/Breakdown/candidate/audit data from the fixture to prove empty Scratch
  remains blocked. A second retains the complete defensive seven-store
  aggregate, asserts `crypto.randomUUID` is never called, and compares all
  seven stores byte-for-byte before and after rejection.
- **Verification results:**

| Command | Exit | Result |
| --- | ---: | --- |
| `pnpm exec vitest run src/lib/db/promotion.test.ts` (RED) | 1 | 1 file; 2 expected failures, 5 passes; both failures were missing Scratch rejection |
| `pnpm exec vitest run src/lib/db/promotion.test.ts` (GREEN) | 0 | 1 file; 7/7 tests passed |
| `pnpm test` | 0 | 80 files; 554/554 tests passed |
| `pnpm typecheck` | 0 | TypeScript completed with no error |
| `pnpm lint` | 0 | 0 errors; unchanged baseline of 11 warnings in unrelated files |
| `git diff --check` | 0 | No whitespace error |

- **Gate selection:** the exact Task 105A plan requires focused promotion
  tests, typecheck, lint, and diff checks. The shared repository mutation also
  invalidated the full test suite, so it was run once. `pnpm build` was not
  rerun because this data-only guard changes no route, bundle, generated type,
  or UI surface and the approved task does not require that gate.
- **Diff review:** the guard precedes `ensureGridCellAvailable`, timestamp and
  UUID creation, and the transaction write. No UI file, schema type, command
  API, candidate/Breakdown policy, Task 120/122 scope, or acceptance marker
  changed. No scope deviation or unowned product decision was found.
- **Workflow audit:** this session's skill catalog again did not expose the
  installed `$run-task` name even though the live package exists at the project
  symlink target. The full local contract and references were loaded directly,
  so scope/receipt/TDD/checkpoint behavior was exercised, but native named-skill
  discovery was not. Preserve this as evidence for the post-Phase-23 bootstrap
  improvement rather than modifying the skill during the phase.
- **Checkpoint buckets:** `Visible now: None` (repository-only guard under a UI
  state that normally has no promotion action); `Review now: Task 105A exact
  repository behavior and evidence`; `Planned later: P23-02 at Task 120 plus
  post-Phase-23 skill/bootstrap audit`; `Unowned: None`.
- **State:** `Implemented`; Task 105A remains `[ ]`. No push, merge,
  publication, phase close, or next task has started.

## Task 104 Start Receipt

- **Authorized predecessor:** Task 103 acceptance at `169ffa5`.
- **Started:** `2026-07-28T15:03:51+0900`; Task 104 remains `[ ]`.
- **Named-skill path:** `$run-task` and all required workflow, adapter, task,
  verification, checkpoint, and domain-routing references were loaded before
  this start signal.
- **Write scope:** create `src/lib/db/indexeddb.test-utils.ts` and
  `src/lib/db/indexeddb.transaction.test.ts`; modify
  `src/lib/db/indexeddb.ts` only for the smallest injectable named-checkpoint
  seam and the seven-store `rw` scope required by the approved task.
- **Existing-helper reconciliation:** `src/lib/db/revision.test.ts` remains
  unchanged in this batch. Its local real-IDB helper may inform the new shared
  utility, but extracting or rewriting that accepted Task 103 test requires a
  separately surfaced deviation.
- **Seven-store contract:** every real transaction and snapshot covers
  `nodes`, `bits`, `chunks`, `settings`, `scratchBreakdowns`,
  `stagedCandidates`, and `candidateOrphanAuditEvents`.
- **RED order:** first prove the current five-store scope and absent checkpoint
  seam cannot satisfy rollback across all seven stores; then add a control
  showing the same first-write/throw sequence exposes partial state outside a
  transaction. Implement only enough seam/scope to turn those exact failures
  GREEN.
- **Forbidden scope:** Task 105 aggregate deletion, Task 120 command/result or
  reconciliation APIs, operation log/journal/outbox/queue, UI, canonical
  policy changes, push, merge, publication, and `end-phase`.
- **Verification:** run `pnpm exec vitest run
  src/lib/db/indexeddb.transaction.test.ts`, `pnpm typecheck`, and
  `git diff --check`; rerun only additionally invalidated gates. This is a
  data/nonvisual task, so rendered evidence is not used.
- **Canonical impact:** `Reflected`; this implements the existing SCHEMA
  transaction and complete-postcondition boundary without changing policy.
- **Recovery anchor:** Task 103 acceptance commit `169ffa5` on
  `phase-23/inbox-triage-model-foundation`.

## Task 104 Implementation Evidence

### Observed RED and repair sequence

1. The initial real-IDB test had eight failures and one passing control. The
   five-store production transaction omitted `stagedCandidates` and
   `candidateOrphanAuditEvents`, so the exact seven-store scope assertion and
   rollback cases could not pass. The same first-write/throw sequence outside
   a transaction already exposed the intended partial `conflict` state.
2. After adding the missing stores and checkpoint injection, seven tests still
   failed because an asynchronous test hook lost Dexie's ambient transaction
   context after the first checkpoint. The fault hook was restricted to a
   synchronous throw-only contract; all nine Task 104 tests then passed.
3. The first invalidated full suite caught two Task 103 concurrency regressions
   with `PrematureCommitError`. A generic non-async wrapper had hidden the
   original async mutation scope from Dexie's transaction-lifetime detection.
   The accepted private production `write()` shape was restored, and the
   separate protected test probe now enters through an explicit async scope.
   Task 103 revision tests and Task 104 rollback tests both returned GREEN.

### Implemented scope

- `indexeddb.test-utils.ts` supplies a deterministic valid UUID factory, a
  fresh `GridDODatabase` backed by `fake-indexeddb`, valid seven-store seed
  data, one-transaction seven-store snapshots, and complete
  precondition/postcondition/conflict classification.
- `indexeddb.transaction.test.ts` mutates all seven stores through one exact
  sequence. It injects a synchronous throw after each named store mutation,
  verifies the real `rw` store set at every checkpoint, and proves byte-for-byte
  rollback to the complete prestate. The audit ID and unique candidate
  preconditions are read inside that transaction.
- The successful path asserts the complete postcondition. The identical
  sequence outside a transaction stops after its first write and is classified
  as `conflict`, proving that the control can expose partial persistence.
- `IndexedDBDataStore` retains its private production `write()` boundary,
  expands that transaction to the required seven stores, and adds only a
  protected, synchronous-fault named-checkpoint probe. No generic public
  transaction API, operation log, journal, outbox, queue, Task 105 aggregate
  behavior, or Task 120 command/reconciliation behavior was added.
- `revision.test.ts` and all other accepted Task 103 files remain unchanged.

### GREEN evidence

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm exec vitest run src/lib/db/indexeddb.transaction.test.ts src/lib/db/revision.test.ts` | 0 | 2 files, 16 tests passed; Task 104 atomicity and Task 103 concurrency both GREEN |
| `pnpm test` | 0 | 79 files, 540 tests passed |
| `pnpm lint` | 0 | 0 errors; the same 11 pre-existing warnings |
| `pnpm typecheck` | 0 | Serial final run passed |
| `pnpm build` | 0 | Production build and seven routes completed |
| `git diff --check` | 0 | No whitespace errors before the implementation commit |

### Review disposition and workflow trace

- Read-only review found one literal contract gap (no reusable deterministic
  UUID factory) and three harness advisories (non-atomic snapshots, missing
  audit precondition read, and unnecessary hook-type export). All were repaired
  within the exact three-file contract before commit.
- A second read-only review traced the Task 103 regression to Dexie's
  async-function detection rather than to the seven-store scope. The repair
  preserved the accepted production path and isolated the test seam.
- Start `6b036f5` to implementation `055bff0` took 12m 12s. One focused repair
  cycle and one full-gate repair cycle were required; no user decision or
  adapter rewrite was needed.
- Running `pnpm build` and `pnpm typecheck` concurrently caused a transient
  `.next/types` race. Build passed, and the required final typecheck passed when
  rerun serially. Post-Phase-23 gate scheduling should encode this shared-output
  serialization constraint rather than treating all verification commands as
  safely parallel.

## Task 104 Acceptance Receipt

- **Disposition:** accepted explicitly by the user on 2026-07-28 with the
  instruction `승인` after independent read-only review reported blocker count
  zero.
- **Accepted implementation:** `055bff0` (`test(db): prove real indexeddb
  rollback`).
- **Evidence receipt:** `88bc19a` (`docs: record Task 104 implementation
  evidence`), including the real seven-store rollback matrix, outside-
  transaction partial-state control, 16 focused tests, 79 files / 540 tests,
  typecheck, lint, build, and diff checks.
- **Independent review:** re-ran the focused tests, full tests, and typecheck;
  confirmed the exact three-file commit contract, unchanged Task 103 tests,
  the narrow protected test seam, and no Task 105/120 behavior.
- **Boundary:** this accepts the Task 104 probe harness and seven-store
  transaction scope only. It does not claim that existing repository methods
  are all atomic; Task 105 must apply named checkpoints to the actual Scratch
  aggregate deletion paths. No push, merge, publication, phase acceptance, or
  visual Decision receipt is granted.
- **Operational note:** every current production write transaction includes
  all seven stores as required by Task 104. This is accepted for the local
  single-tab phase and remains an explicit Phase-close observation.
- **Next legal action:** commit this receipt. Task 105 may start only through a
  separate bounded `$run-task` start receipt that resolves promotion-path
  ownership before implementation.

## Task 103 Start Receipt

- **Authorized predecessor:** Task 102 acceptance at `c28ea90`.
- **Started:** `2026-07-28T13:59:00+0900`; Task 103 remains `[ ]`.
- **Named-skill path:** `$run-task` is present in this session and its full
  skill plus required references were loaded before this start signal. This is
  the first Phase 23 task that can measure the named-skill discovery/loading
  path rather than a manual contract emulation.
- **Write scope:** `src/lib/db/datastore.ts`, `src/lib/db/indexeddb.ts`, the
  three named public-action hooks and their new tests, `revision.test.ts`, and
  only the exact existing database regression owners listed by Task 103.
- **RED order:** first add compile-time public-boundary failures and focused
  direct revision assertions; then add one failing behavior cluster at a time
  for no-op/rejection, mtime-only touches, cascades, restore, archive,
  normalization, relocation, promotion, and legacy Breakdown mutation before
  each matching production repair.
- **Forbidden scope:** Task 104 transaction checkpoint seams, Task 105
  aggregate hard-delete behavior, command behavior, UI realization, canonical
  policy changes, push, merge, publication, and `end-phase`.
- **Verification:** run the three new action tests and the exact database tests
  listed by Task 103, then `pnpm typecheck`, `pnpm lint`, and
  `git diff --check`. Broader gates are rerun only when invalidated and the
  reason is recorded.

## Task 103 Implementation Evidence

### Observed RED and repair sequence

1. Compile-time public-action assertions initially reported unused
   `@ts-expect-error` directives because the hooks still exposed broad
   `Partial<Node>` / `Partial<Bit>` inputs. The public repository and hook
   inputs were narrowed to the approved update schemas.
2. Direct Node and Bit revision tests showed unchanged versions after durable
   patches. Later clusters exposed no-op delta handling, Chunk-driven status
   transitions, lifecycle cascades/restores, system-node normalization,
   breadcrumb relocation, and legacy Breakdown row transitions.
3. The first focused implementation reached 18 files / 91 tests GREEN, but
   independent review found that Node, Bit, and Breakdown read/version/write
   sequences began outside the Dexie transaction. Deterministic real IndexedDB
   tests then reproduced three lost-update failures: two concurrent disjoint
   patches ended at `vN+1` and lost one field instead of retaining both at
   `vN+2`.
4. Independent review also found that legacy Breakdown Add/Delete changed
   collection membership without advancing the surviving Scratch Bit. RED
   tests reproduced Add→Delete with no owner revision advance and non-empty
   bulk delete with no owner advance.
5. The repair moves every surviving-record read, delta/no-op decision, version
   derivation, and write owned by Task 103 into the same Dexie `rw`
   transaction. Breakdown Add/Delete changes the owner revision without
   changing its `mtime`; missing/empty repeats remain no-ops. Task 104's fault
   injection and Task 120's `expectedVersion`/operation-result APIs remain
   unimplemented.

### Scope reconciliation and deviation awaiting checkpoint disposition

- `src/hooks/use-grid-actions.ts` already accepted only `CreateNode` and
  `CreateBit` at Task 103 start, so no production edit was needed; its new test
  records that pre-existing narrow boundary rather than creating a dummy diff.
- Narrowing `DataStore.updateNode` / `updateBit` made nine caller-owned
  `mtime` properties in `src/hooks/use-dnd.ts` invalid. Removing them is a
  derived compatibility repair: the Task 101 update schemas already stripped
  `mtime`, and the repository remains the sole owner of whether each patch
  updates it. This path was not named in the start receipt and entered the
  implementation commit before receiving a file-specific user approval. The
  prior instruction to continue Task 103 was not itself a precise approval of
  this deviation. The current checkpoint therefore asks the user to accept or
  reject Task 103 with this single derived path stated explicitly; no broader
  write-set expansion is implied.
- No `schema.ts`, Task 104 checkpoint seam/harness, Task 105 aggregate
  candidate/audit behavior, or Task 120 command/reconciliation behavior is in
  the Task 103 diff.

### `run-task` pilot findings from the sweep

- Named-skill discovery/loading succeeded for Task 103, unlike Tasks 101–102.
- A sweep-style invariant task can touch a small production surface but a wide
  regression surface. Task 103 reached 23 changed paths before its final
  review, so one late concurrency defect left the whole batch unconfirmed.
  Future `run-task` planning should offer internal acceptance checkpoints for
  sweep tasks without turning each checkpoint into a separate user gate.
- The dependency graph made Tasks 103 and 104 parallel after Task 102, but the
  numeric next-task path did not surface that choice. Task 104 first would have
  provided a reusable real-IDB harness, while switching after Task 103 became
  dirty would have mixed two commit contracts. Future task selection should
  present all dependency-ready siblings before work begins.
- Sequential FakeTable tests proved arithmetic but could not prove Dexie
  serialization. The late real-IDB RED is a concrete signal that verification
  selection must follow the claimed invariant, not only the named file list.

### Verification evidence

| Command | Exit | Relevant result |
| --- | ---: | --- |
| Exact Task 103 focused set | 0 | 18 files, 91 tests passed after both blocker repairs |
| `pnpm typecheck` | 0 | Public update boundaries and production types passed |
| `pnpm lint` | 0 | 0 errors; the same 11 pre-existing warnings |
| `pnpm test` | 0 | 78 files, 531 tests passed |
| `pnpm build` | 0 | Production build completed; seven routes generated |
| `git diff --check` | 0 | No whitespace errors |

The checkpointed implementation is committed at
`6b04c61bd8e739494cd3d30db3c0e27d6a71d49a`. The acceptance receipt below
records the later user-owned disposition and is the only authority for the
Task 103 `[x]` marker.

## Task 103 Acceptance Receipt

- **Disposition:** accepted explicitly by the user on 2026-07-28 with the
  instruction `승인` after the corrected checkpoint made the derived
  `src/hooks/use-dnd.ts` write-set deviation explicit.
- **Accepted implementation:** `6b04c61` (`feat(db): enforce monotonic record
  revisions`).
- **Evidence receipts:** `df7d0d1` (`docs: record Task 103 implementation
  evidence`) and `791a6dd` (`docs: correct Task 103 deviation disposition`).
- **Verification:** 18 focused files / 91 tests, 78 full files / 531 tests,
  typecheck, lint with 0 errors and the same 11 warnings, production build,
  and `git diff --check` all exited 0.
- **Independent review:** blocker count zero. The reviewer directly reran the
  focused and full tests plus typecheck, confirmed real IndexedDB concurrent
  update coverage, and verified no Task 104, Task 105, Task 120, or
  `schema.ts` scope leakage.
- **Deviation disposition:** this acceptance includes the necessary removal of
  nine caller-owned `mtime` values from `src/hooks/use-dnd.ts`. No broader
  write-set expansion is accepted.
- **Checkpoint buckets:** `Visible now: None — data/repository-only behavior`;
  `Review now: None`; `Planned later: Task 104 fault-injection harness and Task
  120 expected-version command/reconciliation behavior`; `Unowned: None`.
- **Boundary:** this accepts Task 103 only. Task 104 may begin only through its
  separate committed start signal. No Task 105 work, push, merge, publication,
  phase acceptance, or visual Decision receipt is granted.
- **Next legal action:** commit this receipt, then begin Task 104 through the
  named `$run-task` path with a separate `In Progress` start signal and
  observed real-transaction rollback RED.

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

### Coverage status

- The custom `$run-task` skill is installed through the project skill symlink,
  but it was not exposed in this session's available-skill catalog. Tasks 101
  and 102 therefore exercised the approved local `run-task` contract manually,
  not the named-skill discovery/loading path.
- Consequently, these tasks are valid tests of scope control, receipts, TDD,
  verification, acceptance markers, and stop boundaries, but they are **not**
  a complete test of `$run-task` invocation or its native context cost.
- Tasks 103–105 executed from sessions where the installed `$run-task`
  contract was available or already loaded and continued the native evidence
  series. Task 105A's implementation session again lacked the named skill in
  its available-skill catalog; the live package and every required reference
  were loaded directly, so lifecycle behavior was exercised but native
  discovery was not.

### Observed task data

| Task | Start → evidence | Elapsed wall time | Workflow result | Cost / friction signal |
| --- | --- | ---: | --- | --- |
| 101 | `ee42ff8` → `5fdf9aa` | 18m 37s | Exact commit scope, RED/repair, 505-test full gate, explicit checkpoint | Declared `pnpm test -- <file>` ran the full suite; focused-command normalization is required. Two generic type defects were caught by review after the initial implementation. |
| 102 | `2e77b46` → `ff56d82` | 9m 06s | Four observed RED clusters, exact three-file scope, atomic rollback proof, 517-test full gate | Advancing one task required a sizable adapter/ledger rewrite. Named-skill loading was unavailable. A second full test was justified only because the final preservation fixture invalidated the first test result; build was not repeated after test-only evidence changes. |
| 103 | `6bce8ae` → `df7d0d1` | 50m 12s | Named `$run-task` loaded; 23 implementation paths; real-IDB concurrency RED; 91 focused and 531 full tests; explicit checkpoint | A wide invariant sweep lacked internal checkpoints, so late lost-update and Scratch-owner defects reopened the whole batch. Dependency-ready Task 104 was hidden by numeric ordering. One necessary `use-dnd.ts` deviation entered before file-specific approval and required a corrective receipt. |
| 104 | `6b036f5` → `88bc19a` | 13m 17s | Named `$run-task` loaded; exact three-file scope; seven real-IDB rollback checkpoints; 540-test full gate | Review caught the UUID/snapshot/audit gaps before commit. One production regression exposed Dexie's async-scope sensitivity. Parallel build/typecheck shared-output contention required one serial typecheck rerun. |
| 105 | `f0ca69b` → `4f6d416` | 14m 30s | Loaded `$run-task` contract; exact six-file scope; real aggregate rollback/retention coverage; 552-test full gate | The task stayed bounded when review found stale Hook 9 promotion authority; the decision became separate Task 105A instead of leaking into aggregate deletion. |
| 105A | `0bbc902` → `45cfec5` | 28m 46s | Separate canonical approval, two expected RED failures, exact two-file implementation, and 554-test full gate | Most wall time was the user-owned SCHEMA/review gate. Named-skill discovery disappeared again, and the adapter still contained a stale Task-104-only runtime sentence that had to be corrected during the receipt update. |

### What the pilot has validated

- Exact task scope and commit contracts prevented Task 104 fault injection,
  Task 105 aggregate deletion, and Task 120 command/reconciliation behavior
  from leaking into Task 103.
- `[x]` remained user-owned; implementation evidence did not silently accept a
  task or start the next one.
- RED-first testing caught missing versioning, migration, validation, and Zod
  default masking before production code was accepted.
- Independent review found real type/evidence gaps and repairs stayed within
  the active task.
- Focused tests plus invalidated full gates produced useful confidence without
  rerunning every gate after documentation-only commits.
- Task 103 produced the first native named-skill trace and exposed concrete
  checkpoint-granularity, dependency-ordering, and scope-deviation findings
  for the post-Phase-23 improvement pass.

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
6. Encode verification-output conflicts: commands that share generated state
   such as `next build` and `tsc` reading `.next/types` must run serially even
   when their logical checks are independent.

### Required observations for Tasks 103–105

Record named-skill availability, start/evidence timestamps, files changed,
observed RED clusters, verification commands and invalidation reasons, review
defects, user decision count, adapter/receipt churn, and any repeated canonical
reads. Do not modify `run-task` until the Phase 23 trace is complete.

## Run-Task Boundary

Task 105A is `Implemented` at `45cfec5` and remains `[ ]` pending explicit user
acceptance. No production write is active. UI changes, Tasks 106–165, push,
publication, merge, and `end-phase` remain forbidden.
