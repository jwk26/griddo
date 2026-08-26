# Task 154 Verification — Post-review Owner Gate

## Scope and identity

- Task: `154 — Render DP-VQ09 Result Title and direct-limit surfaces`
- Exact work-order entrypoint: `29bab4fe0ea2d0abcc837b070161ec0ea1ea5b4a`
- Durable start: `3d7ae3830d5063c7299d1305672128b103db4715`
- Candidate: `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`, candidate `run-task` skill SHA-256 pinned by the approved work order
- Adapter resolver: `approval_required`, `contract_ready=true`; runtime worktree, branch, and entrypoint matched the approved identity before the durable start write
- Canonical inputs: current Task 154 contract, Phase 28 Gate C, and accepted `DP-VQ09=A` receipt

## Owner-discovery evidence

The accepted contract requires authoritative source, candidate, target, or path
change to close the compact step, discard only its draft, write nothing,
announce the named change once, and use the approved safe focus fallback.

The approved seven product/test paths cannot realize that complete mounted
lifecycle:

- `src/hooks/use-triage-placement.ts` retains the release-time source,
  candidate, target, and path snapshot, but its existing invalidation input is
  only a target `dropId`; it receives no authoritative source/candidate
  projection.
- `src/components/triage/hierarchy-explorer.tsx` owns rendered target/path
  disappearance and can request target invalidation, but it receives no
  authoritative source or staged-candidate state.
- `src/components/triage/triage-workspace.tsx` owns the authoritative staged
  candidate/source projection, the once-only invalidated-placement alert, the
  direct Breakdown-grip fallback, and the staged candidate-or-Staging-heading
  fallback. Its mounted owner test is
  `src/components/triage/triage-workspace.test.tsx`.

Adding hidden module state, direct DataStore subscription, a custom DOM event,
or an unmounted hook-only API would not establish the required actual owner
lifecycle and would violate the approved architecture/scope boundary.

## Historical P28-07 stop and verification state

- `P28-07` is recorded as `Awaiting User Decision` in the Phase 28 ledger.
- No Task 154 production or test file was modified.
- No focused or full product gate was run because product/test inputs are
  unchanged and the lifecycle stopped before TDD RED.
- The documentation-only checkpoint runs `git diff --check` and a final clean
  tree ownership check.
- Browser evidence: not run; no product implementation exists, and browser
  evidence cannot resolve the missing mounted owner authority.

## Minimum disposition

Approve and canonically reflect only
`src/components/triage/triage-workspace.tsx` and
`src/components/triage/triage-workspace.test.tsx` as Task 154 owners for the
source/candidate invalidation wiring and mounted proof, or explicitly amend the
affected source/candidate invalidation acceptance. Task 154 remains `[ ]`.

## Implemented working state before the post-review gate

After the user closed `P28-07`, the current Task 154 contract was reflected in
commit `944b04b376de0810fbbe3651c39b9ca409db1d23` before product writes. The
uncommitted working state is limited to the nine approved product/test paths.
It implements the staged empty Result Title draft and exact validation/counter,
Node 100 and Bit 200 boundaries, exact-source within-limit behavior, the direct
length matrix, native unavailable controls with visible reasons, static theme
and reduced-motion mappings, Workspace callback wiring, and mounted
source/candidate invalidation/focus proof.

Initial TDD evidence established the expected RED failures before each owner
implementation. The latest focused owner suite passes 148/148 across:

- `src/hooks/use-triage-placement.test.tsx`
- `src/components/triage/hierarchy-explorer.test.tsx`
- `src/components/triage/triage-workspace.test.tsx`
- `src/lib/copy/inbox-triage.test.ts`

`pnpm typecheck` passes. `pnpm lint` passes with 0 errors and 11 pre-existing
warnings outside the Task 154 write set. Repair cycle 1 added the missing direct
source-disappearance fallback to the Breakdown heading after its mounted RED;
repair cycle 2 resolved the new authoritative-projection lint error. No full
gate, build, browser run, audit measurement, implementation commit, or Task 154
checkpoint claim has been made.

## High-risk review findings

Read-only review found no Critical issue and three Important issues:

1. Edited staged Result Titles are dispatched exactly, but Task 153 reliability
   copy still substitutes the original source title and confirmation no longer
   displays source truth separately. This can produce a false result
   announcement and hide the retained source snapshot. The repair belongs to
   the already approved Explorer/test paths.
2. The added Workspace `useScratchBreakdowns` instance returns `[]` before its
   first live-query snapshot as well as for an authoritative empty snapshot.
   Treating absence as authoritative can falsely invalidate a valid direct
   placement before this subscription becomes ready.
3. Existing target/path invalidation can emit both Explorer and Staging live
   messages and retain the old destination fallback instead of the Task 154
   source/candidate/owning-section fallback. The repair belongs to the already
   approved Explorer/Workspace tests and product paths.

The first and third findings are held for repair cycle 3. The second cannot be
repaired exactly inside the current owner set: timing delays, hidden state,
custom DOM events, and direct DataStore subscriptions are prohibited, and the
current hook return has no readiness bit.

## P28-08 minimum disposition

Approve only `src/hooks/use-scratch-breakdowns.ts` and
`src/hooks/use-scratch-breakdowns.test.tsx` as additional Task 154 owners to
expose and directly test a read-only `isReady` projection from the hook's
existing current snapshot. No query, editor, command, DataStore, persistence,
schema, or other Breakdown behavior is included. After approval, the contract
must be reflected before those two product/test writes, then repair cycle 3 can
cover all three review findings and rerun every invalidated gate.

Canonical impact is `Tagged` while `P28-08` awaits user disposition. Browser
evidence remains omitted: mounted owner tests establish the current exact focus
and lifecycle claims, while a browser run cannot distinguish the missing
authoritative readiness state or grant owner authority. The audit status header
remains unchanged because it is outside the existing Task 154 row-writer
authority.

## P28-08 approval

On 2026-08-26 the user approved the minimum owner expansion exactly as
recommended. `src/hooks/use-scratch-breakdowns.ts` and
`src/hooks/use-scratch-breakdowns.test.tsx` are added only for a read-only
`isReady` projection derived from the existing current selected-Scratch
live-query snapshot: false before the first current snapshot and true after it,
including authoritative empty. Query, editor, command, DataStore, persistence,
schema, and every other Breakdown behavior remain unchanged. Canonical impact
is `Reflected`; repair cycle 3 may now address all three recorded review
findings while Task 154 remains `[ ]`.

## Repair cycle 3 and P28-09 stop

Repair cycle 3 implemented the approved read-only `isReady` projection, gated
direct placement invalidation until the first current authoritative snapshot,
kept edited result titles distinct from visible source truth and reliability
copy, and routed successful pre-dispatch target/path invalidation through one
Staging live announcement plus the source/candidate focus fallback.

The latest focused suite passed 176/176 across five owner test files. Measured
full gates then passed: `pnpm test` 98 files/1121 tests in 21.72 seconds,
`pnpm lint` with 0 errors and 11 pre-existing warnings in 6.32 seconds,
`pnpm typecheck` in 1.62 seconds, and `pnpm build` in 9.53 seconds with seven
static pages generated and the dynamic Grid route retained. `git diff --check`
also passed.

Post-gate read-only review confirmed the readiness and edited-title findings
resolved, but found one Important locked-state regression. Explorer currently
makes every `stale-placement` strip non-live. When target/path loss occurs in
Task 153 `pending`, `unknown`, or `reconciling`, the coordinator correctly
refuses cancellation and Workspace emits no replacement live message, so the
existing path-change status becomes silent.

The pilot repair budget is now 3/3. `P28-09` requests one additional cycle with
one bounded hypothesis: make the existing Explorer-to-Workspace invalidation
callback report whether Workspace actually closed and emitted the Task 154
replacement announcement; suppress Explorer live semantics only for that
successful pre-dispatch case, while retaining existing live stale-placement
semantics when locked cancellation is refused. Add direct regression coverage
for `pending`, `unknown`, and `reconciling`, then rerun every invalidated gate
and High-risk review. This needs no owner or product-scope expansion, so
canonical impact is `None`.

No implementation checkpoint is claimed, no audit row/header is written, and
browser evidence remains omitted because mounted owner tests establish the
exact focus/live-region lifecycle; the remaining defect is a React ownership
branch that browser evidence cannot authorize or repair. Task 154 remains
`[ ]`.
