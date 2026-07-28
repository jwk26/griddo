# Issues — Phase 23: Model, Migration, Transactions, And Retention

> Branch: `phase-23/inbox-triage-model-foundation`  
> Worktree: `/Users/jwk/Documents/griddo2-codex-phase-23-model-foundation`  
> Kickoff date: 2026-07-28  
> State: Task 101 `Implemented`; awaiting explicit user review and acceptance

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
| Task | Task 101 — Land the authoritative model and typecheck-compatible constructors |
| State | `Accepted` by explicit user disposition on 2026-07-28; execution-plan marker closed |
| Approved scope | Exact Task 101 batch from the Gate C kickoff receipt; schema/type exports, repository create constructors, schema/constructor tests, and enumerated typed-fixture compatibility only |
| Kickoff receipt | [`Gate C Kickoff Receipt`](#gate-c-kickoff-receipt) at commit `b22c7a421bf0087e8f0649e66a51ed22bc022259` |
| Approved base | `a532d9e3becd5b333da8bb9ae7e1d0c6f442666f` |
| Entrypoint SHA | `5b43539986b2f857570f77b1ee153ff6b2341845` |
| Recovery anchor | Pre-production Task 101 start at `b22c7a421bf0087e8f0649e66a51ed22bc022259` on `phase-23/inbox-triage-model-foundation` |
| Implementation commit | `b6bbed8` — `feat(triage): define versioned inbox domain model` |
| Canonical impact | `Reflected` — Task 101 implements the already-approved `docs/SCHEMA.md` model and `docs/EXECUTION_PLAN.md` scope; no new canonical decision is introduced |
| Issues / deviations | None open. Read-only review found two defects in the initial generic operation types; compile-time RED evidence reproduced both and the implementation commit repairs them without changing canonical scope. |
| Next legal action | Start Task 102 only from the accepted Task 101 boundary; do not begin Task 103. |

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

## Run-Task Boundary

The next lifecycle may execute Task 102 only. Before its first production
write, `$run-task` must verify this branch/worktree/receipt and commit an
`In Progress` start signal. It must observe the planned v4 migration failures
before implementation, then repair only evidence-backed Task 102 scope. It may
not begin Task 103, remove the transitional Zustand `StagedCandidate`, push,
publish, merge, or invoke `end-phase`.
