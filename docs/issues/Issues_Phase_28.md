# Issues — Phase 28: Explorer Search And Pointer Placement

> Branch: `phase-28/explorer-search-pointer-placement`
> Worktree: `/Users/jwk/Documents/griddo2-codex-phase-28-explorer-search-pointer-placement`
> Kickoff date: 2026-08-24
> State: Task 149 `[x]`, Accepted; Task 150 scope amendment reflected and
> awaiting docs-only checkpoint review; Tasks 150–154 remain unstarted

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

## Gate C Kickoff

| Field | Durable value |
| --- | --- |
| Gate | `gate-c`, explicitly approved by the user on 2026-08-24 |
| Phase scope | Phase 28, Tasks 149–154 |
| First bounded batch | Task 149 only; sequential execution |
| Task state | Tasks 149–154 remain `[ ]`; Task 149 has not started |
| Integration | `origin/main` at `8cb2d904a55c136ca319e7bdf619d8e5d962fce8`, local divergence `0/0` after fetch |
| Approved base | `8cb2d904a55c136ca319e7bdf619d8e5d962fce8`; no base exception |
| Feature branch | `phase-28/explorer-search-pointer-placement` |
| Worktree choice | New linked feature worktree; no reuse |
| Whole-file receipt | `docs/issues/Issues_Phase_28.gate-c.json` |
| Next legal action | Fresh candidate-pinned `$run-task` session for Task 149 only |

## Readiness And Clean-Start Evidence

- The pinned workflow candidate is branch
  `post-v1/workflow-candidate-low-cost` at
  `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`. Global lifecycle skills under
  `/Users/jwk/Documents/codex-workflow/skills/**` were not used.
- Before approval, the synchronized Adapter v2 resolver returned
  `approval_required`, `contract_ready=true`, and `writes_allowed=false`.
- After `git fetch origin`, local `main` and `origin/main` both resolved to the
  approved base with divergence `0/0`; Phase 27 receipt B and merge commit are
  contained, and `origin/main:src` is
  `7b831a941d40631c2212d07a010f3c6b4a00e01a`.
- All accepted prerequisites for Tasks 149–154 and the approved
  `DP-VQ06-EXPLORER`, `DP-VQ07`, `DP-VQ08`, and `DP-VQ09` receipts are
  contained in the approved base. Tasks 152–154 remain subject to their
  in-phase dependency rechecks.
- Task 149's named DnD, Explorer, Workspace, and test owners exist. Existing
  `autoScroll={false}` is a preserved condition; release-time DOM hit testing
  and valid-column edge scrolling remain unimplemented as planned. No blocking
  plan/code drift or active issue applies to the first batch.
- Immediately after worktree creation, `HEAD` equaled the approved base, the
  tree was clean, and `approved-base..HEAD` contained zero commits.

## Baseline Full Gate

- `pnpm install --frozen-lockfile` exited 0; the lockfile was unchanged and
  537 packages were linked.
- The Adapter full gate ran serially:

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm test` | 0 | 95 test files and 982 tests passed |
| `pnpm lint` | 0 | 0 errors; 11 pre-existing warnings |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |

No production implementation or Task 149 execution occurred.

## Workflow-Cost Pilot Handoff

- External baseline:
  `/Users/jwk/Documents/GridDO_Codex_Workflow_Phase_28_Audit.md`, SHA-256
  `13c47986ebbb9c3b098943132cb61b1fd9355476c86a7969fab70d61a5a33fda`.
- Approved tracked target:
  `docs/verification/inbox-triage/phase-28-workflow-pilot-audit.md`.
- This `run-phase` lifecycle did not copy or promote the external audit. A
  fresh Task 149 `$run-task` session owns the exact verified baseline copy in
  a baseline-only documentation commit after validating the green kickoff
  receipt and before production/test changes.
- Each Task 149–154 `$run-task` writer, or an explicitly approved repair
  writer, owns its compact measured experiment row at the corresponding task
  or cluster checkpoint. Estimates must not be recorded as measured facts.
- Phase 28 `$end-phase` may finalize measured findings and the handoff manifest
  only. Candidate skill or Adapter changes require a separate post-publication
  lifecycle and explicit user approval.

## Active Issues

| ID | State | Evidence | User disposition | Canonical impact |
| --- | --- | --- | --- | --- |
| `P28-04` | `Promoted to Execution Plan` | Task 150 owner discovery found that the existing per-parent active snapshots could not distinguish deleted/archived/moved/unreachable causes or initial/local/moved provenance; the local placement result identity stopped inside `use-dnd.ts`/Workspace; and the selected-Bit/reveal production owner does not exist until Task 151. Checkpoint review found stale `Task 150 only` current-edge declarations in the VQ Gate Register, Executable DP Receipt Edges, and completed Task 113 section; a subsequent evidence check found Task 113's Verification sentence still stated an unqualified Task-150-only release. Detailed evidence is in `docs/verification/inbox-triage/task-150.md`. | On 2026-08-24 the user approved: one new dedicated reactive Explorer provenance hook and direct test; the minimum existing DnD/Workspace producer handoff and direct tests for the created stable result identity; no placement semantic change; and movement of only selected-Bit disappearance realization to Task 151's existing reveal owner. On 2026-08-25 the user authorized both targeted docs-only repairs: first the three stale edge declarations, then the remaining Task 113 Verification qualifier. Search realization and all other Task 151 behavior remain unstarted. | `Reflected` in `docs/EXECUTION_PLAN.md` at the VQ-06 Gate Register row, `DP-VQ06-EXPLORER` Executable DP Receipt Edge, completed Task 113 historical/current supersession and Verification text, and the exact Task 150/151 contracts. The historical JSON receipt and its 2026-08-10 Task-150-only acceptance remain unchanged; `P28-04` corrects only the current selected-Bit disappearance edge. |

Phase 27 items `P27-06` and `P27-08` remain Deferred under their Phase 27 owner
and are outside Phase 28 scope.

## Task 150 Canonical Amendment Checkpoint

| Field | Durable value |
| --- | --- |
| Task | `150 — Render DP-VQ06-EXPLORER remote/path statuses` |
| State | `In Progress` — Task 150 implementation authorized; Tasks 150 and 151 remain `[ ]`, and Task 151 product work remains unstarted |
| Approval | Exact fresh candidate-pinned Task 150 work order on 2026-08-24, accepted `P28-04` docs-only checkpoint `15e117ecfa477d8a458499b1515ebb4cd8447e70`, and the 2026-08-25 continuation authorizing Task 150 implementation only; bounded by `docs/issues/Issues_Phase_28.gate-c.json` and the accepted `DP-VQ06-EXPLORER` receipt |
| Start base / recovery anchor | `15e117ecfa477d8a458499b1515ebb4cd8447e70`; accepted `src` tree `e83086e1044bb2deebc6837f997bebc06b316146` |
| User disposition | The user accepted the complete `P28-04` docs-only checkpoint and authorized only the current canonical Task 150 implementation, retaining selected-Bit disappearance exclusively for unstarted Task 151 |
| Exact added Task 150 scope | Create `src/hooks/use-explorer-remote-status.ts` and `.test.tsx`; modify `src/hooks/use-dnd.ts` and `src/hooks/use-triage-dnd.test.ts`, plus `src/components/triage/triage-workspace.tsx` and `.test.tsx`, only for the authoritative provenance and stable local-result identity flow now recorded in Task 150 |
| Task 151 correction | Move only selected-Bit disappearance realization to Task 151's existing search-reveal owner; add Task 150 as its dependency; do not start Search or any Task 151 product behavior |
| Durable amendment mechanism | `docs/WORKFLOW.md` assigns execution corrections to the phase issue ledger and promotes executable ownership into `docs/EXECUTION_PLAN.md`; Adapter v2 declares no separate amendment receipt kind/path, so no new JSON was invented and no historical receipt was modified |
| Canonical alignment repairs | The first 2026-08-25 checkpoint finding corrected the VQ-06 Gate Register, `DP-VQ06-EXPLORER` Executable DP Receipt Edge, and completed Task 113 section to distinguish the unchanged 2026-08-10 Task-150-only history from the `P28-04` current split edge. The second evidence-confirmed finding qualified Task 113's remaining Verification sentence with that same historical/current distinction |
| Product/test writes | None at this durable start; implementation follows only the exact Task 150 owner/test paths recorded above and in `docs/EXECUTION_PLAN.md` |
| Canonical impact | `Reflected` — exact owner paths and the selected-Bit release-edge correction are now canonical; product/design semantics are unchanged |
| Next legal action | Implement and verify Task 150 only under the reflected `P28-04` contract, then stop at a clean committed implementation checkpoint with Task 150 still `[ ]`; do not start Task 151 product work |

## Task 149 Durable Start

| Field | Durable value |
| --- | --- |
| Task | `149 — Implement release-time targets and valid-column edge auto-scroll` |
| State | `Accepted`; Task 149 `[x]` |
| Exact scope | Existing DnD target/auto-scroll mechanics in `src/hooks/use-dnd.ts`, `src/components/triage/hierarchy-explorer.tsx`, and `src/components/triage/triage-workspace.tsx`; their three approved test files; Task 149 verification evidence; Phase 28 workflow-pilot measurement row |
| Approval | Exact Task 149 fresh-session user instruction on 2026-08-24, bounded by `docs/issues/Issues_Phase_28.gate-c.json` |
| Approved base | `8cb2d904a55c136ca319e7bdf619d8e5d962fce8` |
| Kickoff recovery anchor | `fcafd49def7334299972e99d675db025d0598a79` |
| Baseline audit anchor | `4c526f0` (`docs: preserve Phase 28 workflow pilot baseline`) |
| Accepted checkpoints | Implementation `1830cc37ff913bd1d4ad4b62ddd9f7b2319b4dca`; evidence alignment/current recovery anchor `80bd7041e9db2849d9eab1d9f8d5d08c38e84549`; WF28-02 composite `a2da7ab6f49ba50d9fba9d3ea5e3fb568990e05f264891844e2534e2e00dfdd8` |
| Dependencies | Tasks 134 and 142 accepted; no unresolved Task 149 prerequisite |
| Issues / deviations | None at start |
| Canonical impact | `None` — Task 149 implements the existing approved contract without changing canonical product, design, policy, or plan authority |
| Next legal action | Fresh candidate-pinned `$run-task` lifecycle for Task 150; Task 150 remains `[ ]` and unstarted |

### Task 149 Review Blockers

| ID | State | Evidence | Exact minimum repair | Canonical impact |
| --- | --- | --- | --- | --- |
| `P28-01` | `Closed` | Fourth-cycle RED reproduced no-post-activation mouse release and stationary-touch activation; focused owner tests now prove retained coordinates and release-time rendered target selection. | Accepted with Task 149 at the recorded implementation and evidence-alignment checkpoints. | `None` — implementation-local correction to the existing Task 149 contract. |
| `P28-02` | `Closed` | Fifth-cycle mounted Explorer-to-hook RED reproduced same-ID payload staleness; complete rendered identity now includes drop ID, parent, level, title, and path, and changed identity reissues the stale-guarded occupancy classification. | Accepted with Task 149; WF28-02 preserves the accepted product-input identity. | `None` — implementation-local correction to the existing Task 149 contract. |
| `P28-03` | `Closed` | Fifth-cycle mounted Explorer-to-hook RED reproduced late frame work after exit, blur, remote invalidation, Escape, and end. Hook refresh is now inert after pointer/cancellation loss; Explorer clears its local pointer and canceled callbacks return before work. | Accepted with Task 149 at the recorded implementation and evidence-alignment checkpoints. | `None` — implementation-local correction to the existing Task 149 contract. |

Task 149 is `[x]` and Accepted by the user's explicit checkpoint disposition.
The fifth bounded repair cycle resumed from recovery anchor
`77b762e15a3fea8c80ced07ba8fdaf16679593c3`; final review found no Critical or
Important issue, so no sixth cycle was started. Task 150 remains `[ ]` and
unstarted; no canonical direction change or scope expansion occurred.
