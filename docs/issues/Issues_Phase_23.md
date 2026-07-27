# Issues — Phase 23: Model, Migration, Transactions, And Retention

> Branch: `phase-23/inbox-triage-model-foundation`  
> Worktree: `/Users/jwk/Documents/griddo2-codex-phase-23-model-foundation`  
> Kickoff date: 2026-07-28  
> State: Ready for `$run-task`; Task 101 remains open and not started

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
- Historical branch `phase-23/inbox-triage-persistence` and worktree
  `/Users/jwk/Documents/griddo2-codex-phase-23-pilot` remain clean at
  `52a385d601a6394f2e140078be1ca7b5242e5ca9`. They are recovery-only and were
  not reused, cherry-picked, reset, deleted, or modified.

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

## Run-Task Boundary

The next lifecycle may execute Task 101 only. Before its first production
write, `$run-task` must verify this branch/worktree/receipt and commit an
`In Progress` start signal. It must observe the planned schema/fixture failure
before implementation, then repair only evidence-backed Task 101 scope. It may
not pre-emptively bulk-edit all factories, remove the transitional Zustand
`StagedCandidate`, write a task acceptance marker, begin Task 102, push,
publish, merge, or invoke `end-phase`.
