# Issues — Phase 26: Lifetime, Copy, And Base-Surface Owners

> Branch: `phase-26/lifetime-copy-base-surfaces`
> Worktree: `/Users/jwk/Documents/griddo2-codex-phase-26-lifetime-copy-base-surfaces`
> Kickoff date: 2026-08-11
> State: Tasks 127–129 accepted; Task 130 not started

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
| State | `Accepted` — explicitly accepted by the user; canonical Task 127 marker is `[x]` |
| Approved scope | Modify `src/stores/triage-store.ts` and `.test.ts`; create `src/stores/triage-preferences-store.ts` and `.test.ts`; retain the deprecated candidate compatibility API unchanged; implement no Task 128+ behavior |
| Kickoff receipt | `docs/issues/Issues_Phase_26.gate-c.json` (`gate-c`, Task 127-only first bounded batch) |
| Approved base | `f91bf0529961541d9b7fa1645ee3aded081eaea3` |
| Entrypoint / recovery anchor | `761ac9a3f676b11559ad7f9d84ca6d64d2672f91` |
| Dependency | Accepted Task 101 commit `4a7865ad9fdc88ee40d1cca5ff476a2b2dc9bbc0` is an ancestor of the approved base |
| Issues / deviations | None |
| Canonical impact | `None` — Task 127 is implementation-local against the already-reflected SPEC/SCHEMA/EXECUTION_PLAN authority |

## Task 127 Implementation Evidence

| Field | Durable value |
| --- | --- |
| Durable start commit | `677b927` — ledger-only `In Progress` signal before production changes |
| Implementation commit | `775045f535aa7d95b99c0fb2ebd24f7692767a2b` — exactly the two Task 127 stores and their tests |
| RED evidence | `pnpm test -- src/stores/triage-store.test.ts src/stores/triage-preferences-store.test.ts` exited 1: the new preference module and session actions/defaults were absent while all 679 baseline tests passed |
| Focused GREEN | `pnpm exec vitest run src/stores/triage-store.test.ts src/stores/triage-preferences-store.test.ts` exited 0: 2 files, 14 tests |
| Focused constraints | `pnpm typecheck` exited 0; `git diff --check` exited 0 |
| Full gate | Exactly one post-repair serial run: `pnpm test` exited 0 (88 files, 688 tests); `pnpm lint` exited 0 (0 errors, unchanged 11 warnings); `pnpm typecheck` exited 0; `pnpm build` exited 0 (Next.js 16.2.1, seven routes) |
| Review | One concrete medium finding: hydration discarded unknown persisted keys in memory but left them in `localStorage`; repaired by canonicalizing storage to the two validated sort keys during hydration and adding post-hydration storage evidence. No remaining concrete findings |
| Diff ownership | `src/stores/triage-store.ts`, `src/stores/triage-store.test.ts`, `src/stores/triage-preferences-store.ts`, and `src/stores/triage-preferences-store.test.ts`; no Task 128+ or unrelated path |
| Issues / deviations | None |
| Canonical impact | `None` — no canonical amendment or end-phase tag is required |
| User acceptance | `Task 127 checkpoint를 acceptance합니다.` |
| Acceptance boundary | Task 127 only; Task 128 remains `[ ]` and was not started |
| Next legal action | Stop after this acceptance-only commit and await separate user direction; do not start Task 128 |

### Task 127 Checkpoint Buckets

- **Visible now:** None — Task 127 adds base owners only; no UI consumer was in
  scope.
- **Review now:** Store API/lifetime behavior, focused/full evidence, and user
  acceptance of Task 127.
- **Planned later:** Task 130 consumes Pool session/preferences; Task 134 and
  later approved Explorer work consume Explorer session state; Task 163 removes
  the deprecated candidate compatibility API after Task 131 migration.
- **Unowned:** None.

## Task 128 Run State

| Field | Durable value |
| --- | --- |
| Task | `128` — create the single core-English copy owner |
| State | `Accepted` — explicitly accepted by the user; canonical Task 128 marker is `[x]` |
| Approved scope | Create `src/lib/copy/inbox-triage.ts` and `.test.ts`; provide typed source-approved base copy and explicitly unavailable receipt-dependent keys; add no component consumer, locale provider/toggle, Task 129 shell, or later-task behavior |
| Work order | User-approved Task 128-only ad-hoc work order; the Gate C Task 127 first-batch receipt remains historical authority and is not widened |
| Approved base | `f91bf0529961541d9b7fa1645ee3aded081eaea3` |
| Entrypoint / recovery anchor | `8d2cde00c4383baa0dcc446c0ae3186a096b6af8` |
| Dependency | Plan approval/lifecycle only; Task 127 is accepted at the recovery anchor and Task 129 remains unstarted |
| Issues / deviations | None |
| Canonical impact | `None` — Task 128 implements the already-reflected SPEC/EXECUTION_PLAN copy boundary |

## Task 128 Implementation Evidence

| Field | Durable value |
| --- | --- |
| Durable start commit | `6cc02885867ef8e603824e43ee1270897eb1b9eb` — ledger-only `In Progress` signal before production changes |
| Implementation commit | `f57d1d5ca7666e501707fbab1638718214f4c845` — exactly the Task 128 copy resource and test |
| RED evidence | `pnpm exec vitest run src/lib/copy/inbox-triage.test.ts` exited 1 with the expected missing `./inbox-triage` import; no production module existed |
| Focused GREEN | `pnpm exec vitest run src/lib/copy/inbox-triage.test.ts` exited 0: 1 file, 4 tests |
| Focused constraints | `pnpm typecheck` exited 0; `git diff --check` exited 0; receipt-string `rg` over `src/components/triage` found no newly distributed receipt copy and no component path changed |
| Full gate | Exactly one post-repair serial run: `pnpm test` exited 0 (89 files, 692 tests); `pnpm lint` exited 0 (0 errors, unchanged 11 warnings); `pnpm typecheck` exited 0; `pnpm build` exited 0 (Next.js 16.2.1, seven routes) |
| Review | Two concrete findings were repaired before the full gate: an invented expanded clear-search accessible name was narrowed to canonical `Clear search`; receipt-owned category types now admit a later approved string while every current value remains the non-string unavailable sentinel. No remaining concrete findings |
| Diff ownership | `src/lib/copy/inbox-triage.ts` and `src/lib/copy/inbox-triage.test.ts`; no component, locale, Task 129+, or unrelated path |
| Issues / deviations | None |
| Canonical impact | `None` — no canonical amendment or end-phase tag is required |
| User acceptance | `Task 128 checkpoint를 acceptance합니다.` |
| Acceptance boundary | Task 128 only; Task 129 remains `[ ]` and was not started |
| Next legal action | Stop after this acceptance-only commit and await separate user direction; do not start Task 129 |

### Task 128 Checkpoint Buckets

- **Visible now:** None — Task 128 adds a typed nonvisual owner and no component
  consumer is in scope.
- **Review now:** Copy API, unavailable-sentinel boundary, focused/full evidence,
  and user acceptance of Task 128.
- **Planned later:** Task 129 consumes base shell copy; Tasks 138, 140, 141,
  143, 144, 147, 148, 150, 151, 153, 154, 157, 160, and 162 populate only
  their approved receipt-owned copy keys.
- **Unowned:** None.

## Task 129 Run State

| Field | Durable value |
| --- | --- |
| Task | `129` — build the semantic four-area Inbox shell |
| State | `Accepted` — explicitly accepted by the user; canonical Task 129 marker is `[x]` |
| Approved scope | Modify `src/components/triage/triage-workspace.tsx` and `.test.tsx` plus `src/app/globals.css`; create `docs/verification/inbox-triage/task-129.md`; implement one semantic tree with visible Scratch Pool, Breakdown, Staging, and Grid Explorer identities, exact 60/40 main and top ratios, 35/65 Staging ratio, theme envelope/data-state roles, 1024px desktop minimum, hidden-scrollbar treatment, and stable focus landmarks; add no Explorer item labels, prototype state/handlers, Task 130 behavior, or later-task implementation |
| Work order | User-approved Task 129-only ad-hoc work order; the Gate C Task 127 first-batch receipt remains historical authority and is not widened |
| Approved base | `f91bf0529961541d9b7fa1645ee3aded081eaea3` |
| Entrypoint / recovery anchor | `0079dc319e7f2ab16c3e9a14ff48c37c148bab4f` |
| Dependency | Tasks 127–128 are accepted at the recovery anchor; existing canonical Inbox route dispatch is covered by focused runtime evidence and remains unchanged |
| Issues / deviations | None |
| Canonical impact | `None` — Task 129 implements the already-reflected SPEC/DESIGN_TOKENS/EXECUTION_PLAN shell boundary |

## Task 129 Implementation Evidence

| Field | Durable value |
| --- | --- |
| Durable start commit | `87fb6c374723279b4523cad2a8a32862751d4b2f` — ledger-only `In Progress` signal before production changes |
| Implementation commit | `78f6f97bbe6a70fb359ada58b4dca26b1f9019fb` — Workspace shell/test, semantic shell CSS, and Task 129 route/capture evidence only |
| RED evidence | `pnpm exec vitest run src/components/triage/triage-workspace.test.tsx` exited 1 with 2 expected failures for the absent semantic role and shell ratio contracts; all 10 pre-existing Workspace tests passed |
| Focused GREEN | `pnpm exec vitest run src/components/triage/triage-workspace.test.tsx` exited 0: 1 file, 12 tests |
| Focused constraints | `pnpm typecheck` exited 0; `git diff --check` exited 0 |
| Full gate | Exactly one post-repair serial run: `pnpm test` exited 0 (89 files, 693 tests); `pnpm lint` exited 0 (0 errors, unchanged 11 warnings); `pnpm typecheck` exited 0; `pnpm build` exited 0 (Next.js 16.2.1, seven routes) |
| Visible evidence | `docs/verification/inbox-triage/task-129.md` plus four committed GridDO light/dark captures at `1024×768` and `1920×1080`; canonical Inbox route showed four named regions, exact 60/40, 60/40, and 35/65 ratios, stable heading focus, hidden-scrollbar computation, and zero horizontal overflow |
| Review | Direct scope/React/UI-guideline review found no concrete finding. Existing Explorer `L1`/`L2`/`L3` labels remain unchanged under explicit Task 134 ownership |
| Diff ownership | `src/components/triage/triage-workspace.tsx`, `.test.tsx`, `src/app/globals.css`, and `docs/verification/inbox-triage/task-129.md` plus its four captures; no route dispatcher, Explorer item-label owner, Task 130+, or unrelated path |
| Issues / deviations | None |
| Canonical impact | `None` — no canonical amendment or end-phase tag is required |
| User acceptance | `Task 129 checkpoint를 acceptance합니다.` |
| Acceptance boundary | Task 129 only; Task 130 remains `[ ]` and was not started |
| Next legal action | Stop after this acceptance-only commit and await separate user direction; do not start Task 130 |

### Task 129 Checkpoint Buckets

- **Visible now:** canonical Inbox route with a fresh empty system-node seed;
  GridDO light/dark at `1024×768` and `1920×1080`; visible and accessible
  Scratch Pool, Breakdown, Staging, and Grid Explorer; exact ratios; stable
  heading focus; hidden-scrollbar treatment; no horizontal overflow.
- **Review now:** section identity/chrome, ratio geometry, focus behavior,
  captures, focused/full evidence, and user acceptance of Task 129.
- **Planned later:** Task 130 owns Pool behavior; Task 134 owns full Explorer
  item labels; later approved tasks own their exact state and receipt surfaces.
- **Unowned:** None.
