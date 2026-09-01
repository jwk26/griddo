# Task 160 — Realize Completion Blockers And Eligibility Withdrawal

> State: Implemented through repair cycle 3/3; awaiting user checkpoint review
> Task marker: `[ ]`
> Durable start / C1 reflection: `7aa2b6e6784acc935bcea4f785ca88ff5d05b8d1`
> Implementation: `8f46ba31aab223ed6a150f2723eefc5abe5c376d`

## Scope And Result

- The Task 159 completion owner now exposes a non-persisted Add/title blocker
  projection only while persisted Archive eligibility is otherwise true.
- A non-empty mounted Add draft renders the exact completion blocker directly
  below the existing Add field/control row. Existing reliability copy remains
  first, and the draft, input, Add action, reliability state, and focus remain
  owned by their existing source.
- Scratch-title `open`, `dirty`, `saving`, and `reconciling` blockers replace
  only `Selected Scratch` in the fixed Context eyebrow/meta line. Visual
  `offline`, `not_applied`, and `conflict` states append the blocker inside the
  existing source-bound issue-overlay status column. Clearing the blocker
  restores `Selected Scratch` without moving focus.
- After completion has previously been presented in the mounted page, loss of
  persisted eligibility removes overlay, complete Context, and Reopen before
  showing the exact active Breakdown, Staging, or combined withdrawal reason in
  the vacated Breakdown completion locus. An inactive, archived, or deleted
  Scratch produces no withdrawal status.
- Local source actions retain their canonical focus. If removed completion
  controls owned focus, the Breakdown heading receives it. Remote recovery
  restores current Task 159 truth without stealing the heading's focus.
- No toast, dialog, detached surface, adjacent fallback, ordinary status row,
  completion action, auto-add, auto-clear, auto-save, auto-cancel, persistence
  mutation, Task 159 predicate/transition change, or Task 137 headless-model
  change was introduced.

## Authority, Ordering, And Canonical Reflection

| Evidence | Value |
| --- | --- |
| Entrypoint | Accepted Task 159 commit `b742538bc1f72300912d8d6f2a310e7328deed5b` |
| Task authority | Exact Control Tower handoff plus the user's C1 `승인` statement dated 2026-09-01; the Phase 30 Gate C `run-phase` receipt was not represented as a Task 160 receipt |
| Resolver | Pinned candidate `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`, pinned run-task SHA-256 `614631c56866549feb298d995ea0cf1311caa1cacaaefc2ba2ca753e43910531`, explicit adapter `docs/CODEX_WORKFLOW_ADAPTER.json`; expected `approval_required`, `contract_ready=true`, `writes_allowed=false` |
| Durable start | `7aa2b6e6784acc935bcea4f785ca88ff5d05b8d1`; documentation-only C1 reflection and parent of every Task 160 product/test write |
| Implementation | `8f46ba31aab223ed6a150f2723eefc5abe5c376d`; exact Task 160 product/test paths that required a change |
| Dependencies | Accepted Tasks 118, 128, 137, and 159 were revalidated as ancestors; accepted Task 138 was used only as fixed-editor compatibility evidence |
| Canonical impact | `Reflected` — only the stale persistent Scratch-title blocker placement was superseded in the execution plan, design tokens, and selected Context recipe |
| Owner gate / unowned | No owner expansion or unresolved scope stop; `Unowned: None` |

The historical DP-VQ11 receipt and Phase 29 records were not modified. All
other DP-VQ11 copy, behavior, focus, lifetime, theme, and prohibition contracts
remain unchanged.

## TDD, Review, And Repair Evidence

1. The initial focused RED run executed 228 tests: 210 existing expectations
   passed and 18 new Task 160 expectations failed against the Task 159 surface.
   The failures covered blocker projection, all title placements/copies,
   withdrawal causes and recovery, exact copy ownership, and workspace
   forwarding.
2. The minimum hook, Breakdown, copy, workspace-test, and CSS implementation
   made the focused owner suite green. A separate CSS owner test was also
   observed failing with the Task 160 rules removed, then passed after those
   rules were restored.
3. Repair cycle 1 corrected test assumptions about the existing issue-overlay
   live region and removed Task 160 from the receipt-dependent copy list. It did
   not expand product scope.
4. Review cycle 2 found missing field-to-blocker descriptions and a concrete
   fixed-Context truncation risk. Six failing regressions were added first,
   then stable description IDs, `aria-describedby`, and Context-only wrapping
   cleared them while preserving the 104px/9.5rem geometry.
5. The first running-app pass found that a background-tab blur cleared Reopen
   focus ownership before a remote eligibility withdrawal, leaving focus on
   `body`. Repair cycle 3 added a failing background-tab regression first, then
   retained ownership only for a null-related-target blur while the document
   lacks focus. The final browser pass moved the removed Reopen focus to
   `#triage-breakdown-heading` and remote recovery did not steal it.
6. The latest focused and full gates reran after the last product change. All
   three authorized repair cycles were used; there is no open mismatch and no
   fourth cycle was attempted.

## Latest Verification

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm exec vitest run src/hooks/use-can-archive-scratch.test.ts src/components/triage/breakdown-panel.test.tsx src/components/triage/triage-workspace.test.tsx src/lib/copy/inbox-triage.test.ts` | 0 | 4 selected files / 230 tests passed |
| target-path `pnpm exec eslint` for the eight changed TypeScript source/test paths | 0 | 0 errors and 0 warnings |
| `pnpm typecheck` (focused) | 0 | `tsc --noEmit` passed before the latest full gate |
| `pnpm test` | 0 | 99 files / 1,230 tests passed; Vitest duration `21.41s` |
| `pnpm lint` | 0 | 0 errors; 11 unchanged existing warnings |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; compile `4.1s`, TypeScript `4.0s`, seven pages generated |
| `git diff --check` | 0 | Whitespace verification passed after the final product change |

The test/build commands emitted only the already-known Node deprecation and
worker `localStorage` experimental warnings. An earlier 1,229-test full gate
preceded repair cycle 3 and is not used as final evidence.

## Representative Running-App Evidence

The one fresh final run used the canonical Inbox route at 1440×900, GridDO
theme, light mode. The browser fixture was ephemeral and task-local.

- The selected Context measured `637.390625 × 104px`. Its existing action
  region measured exactly `152px` (`9.5rem`).
- The open title blocker was fully visible in the eyebrow/meta line. The title
  field and timestamp did not overlap the fixed action region, and focus stayed
  in the title field.
- During a captured save transition, the visible `Saving…` progress action did
  not overlap the title field or timestamp.
- A fresh offline title-save outcome reused exactly one existing issue overlay.
  Its status column displayed `Offline. Your draft is still here.` followed by
  the exact title completion blocker; the combined copy was fully visible,
  neither Retry save nor Cancel overlapped it, and title-field focus remained
  stable.
- The exact Add blocker was fully visible immediately below the Add row. The
  draft value and Add input focus were retained. Adding the item removed the
  blocker and completion presentation, showed the exact Breakdown-only
  withdrawal in the completion locus, and retained Add-input focus.
- Deleting the local row removed only the withdrawal and restored the Task 159
  completion overlay with `Scratch complete` heading focus.
- In a second same-origin tab, adding a remote active Breakdown item removed
  Reopen/complete/overlay in the observed tab, rendered the current withdrawal,
  and moved the removed Reopen focus to the Breakdown heading. Remote deletion
  removed the withdrawal and restored the completion overlay without stealing
  that heading focus.

The exact Staging-only and combined withdrawal reasons, all title blocker
states, eight theme roles, and reduced-motion-identical static behavior are
covered by owner tests. Per the task boundary, no eight-theme × light/dark ×
multi-viewport browser matrix, screenshot/pixel claim, or aggregate visual
conformance claim is made; Task 164 retains aggregate visual ownership.

## Relevant-Input Fingerprint

The final fingerprint is SHA-256
`1b226b09eecac2138fbca465fc77da7a0f429c3d0da8ec7b4aef5faaa57416f0`.
It hashes a newline-delimited manifest in path order containing the Git blob
IDs for the Adapter, Gate C and Phase 29 receipts, DP-VQ11 receipt, reflected
execution plan/design tokens/selected Context recipe, unchanged Breakdown and
Archive recipes, Task 138 and Task 159 evidence, all nine canonical Task 160
product/test paths, plus the exact entrypoint, implementation commit, pinned
candidate commit, and pinned run-task SHA-256. The evidence file and mutable
ledger are excluded to avoid a self-referential fingerprint.

## Checkpoint Buckets

- **Visible now:** exact Add/title blockers, C1 fixed-Context and issue-overlay
  placement, post-presentation withdrawal/recovery, current-truth focus, and
  immediate static presentation.
- **Review now:** implementation `8f46ba31aab223ed6a150f2723eefc5abe5c376d`,
  focused/full verification, representative browser evidence, and this Task
  160 checkpoint.
- **Planned later:** Tasks 161–162 remain held and unstarted. Phase 31 remains
  prohibited. Task 164 retains aggregate visual conformance.
- **Unowned:** None.
