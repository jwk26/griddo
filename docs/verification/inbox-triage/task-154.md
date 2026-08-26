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

## P28-09 approval

The user approved one additional repair cycle limited to the recorded exact
hypothesis and three locked-state target-loss regression tests. The existing
Explorer-to-Workspace callback may report whether Workspace actually completed
the pre-dispatch close and replacement announcement. Explorer live semantics
may be suppressed only for that successful Task 154 result; `pending`,
`unknown`, and `reconciling` cancellation refusal must retain the existing live
stale-placement status. No owner, receipt, design, copy, persistence, command,
or product scope changes. Canonical impact is `None` and Task 154 remains `[ ]`.

## Implementation checkpoint

The approved fourth repair cycle made the existing Explorer-to-Workspace
callback return whether Workspace actually completed the pre-dispatch close,
source/candidate focus handoff, and replacement Staging announcement. Explorer
binds live-region suppression to that successful result for the exact
stale-placement presentation. A refused close remains live for exactly the
three locked Task 153 states: `pending`, `unknown`, and `reconciling`.

The existing successful mounted proof was extended across later placement prop
changes without adding a fourth locked-state test. Reapplying the former
props-derived condition produced the expected RED: the successful strip regained
`role="status"`. Restoring the callback-result binding passed that proof and all
three locked-state regressions. The final focused owner gate passed 5 files / 179
tests in `2.73s`.

Latest-input full verification was run serially after the final product change:

| Command | Result | Measured real time |
| --- | --- | --- |
| `pnpm test` | 98 files / 1124 tests passed | `19.36s` |
| `pnpm lint` | 0 errors; 11 unchanged warnings outside the Task 154 write set | `6.12s` |
| `pnpm typecheck` | passed | `1.21s` |
| `pnpm build` | passed; seven static pages and the dynamic Grid route | `9.15s` |
| `git diff --check` | passed before implementation commit | not timed |

The directly measured serial full-gate total is `35.84s`. Runtime
token/accounting was unavailable: `not measured`. Final read-only High-risk
review found no remaining Critical or Important finding.

## Exact relevant input fingerprint

The successful evidence is anchored at implementation commit
`28ba551a73030800ca8933a6b4513c3802782edc`, complete `src` tree
`e0e911a758363df677ed32eeef64910351a58478`, unchanged Adapter blob
`ab4f7c765c1b27e48c7a46b9084ce6cc0a4af60e`, unchanged command-catalog blob
`2063146db0b8920dc8ee5805001e1541da49c2a0`, and accepted `DP-VQ09` receipt
blob `e85ba7bfef416b1ecf10516bb605f5a49ecc3e23`.

The Task 154 relevant-input manifest is this fixed-order SHA-256 list, including
each final LF:

```text
9a9c8c479860643da6537be502db741b1836fe24c289be3c488bafa6098dd880  src/hooks/use-triage-placement.ts
80aa6b2d1523c0f011639cc4e3de5e9014b0add1637000edc94bf26f93a054db  src/hooks/use-triage-placement.test.tsx
62d7619523fb45943710dded20fac214b26626c61fba969737811790e82b7c93  src/components/triage/hierarchy-explorer.tsx
2a78a01e9c9e2a35efa3ca2ba8d35eb13c6363f8dadaad4dc8b8b0aa02261953  src/components/triage/hierarchy-explorer.test.tsx
99b2d51d92e400d369bf395fdc71a683c5ed238c1e4ad5a4cd508d6b3cf1f1d0  src/app/globals.css
595b5ebf99915c14cd70cc764a93bb371f6949ba3eea1f15808d136f8c8a64ae  src/lib/copy/inbox-triage.ts
21f0a02af035c435ad90d47a89dbafc6840b6a7fd2385a1e909a1f54938e1e30  src/lib/copy/inbox-triage.test.ts
94a4e296888421a36c694a2741d8bf036cab18e82f2d532903add08f16e01337  src/components/triage/triage-workspace.tsx
959db58bfaf5636f690be8b2980d246e0c5829cd38a2d86aedf20da190508aba  src/components/triage/triage-workspace.test.tsx
45a774528404f156e249494fd955d9f07ab633f9d11f54087aabc2f1ff4647dc  src/hooks/use-scratch-breakdowns.ts
d198f95b83e4fac4ff47f0bbf019e821c41261b5551135c6a9b142e340dbdde4  src/hooks/use-scratch-breakdowns.test.tsx
```

The SHA-256 of that exact manifest is
`a033fb805ad4f836a25ae0023d25e142b9cac4771f49fd96f75901466b7394ae`.
No Task 153 or earlier Task 154 gate was reused for the changed final input.

## Browser modality and checkpoint boundary

No browser run was needed. Mounted owner tests directly establish input-first
and next-heading focus, source/candidate/section safe fallbacks, native disabled
semantics and tab availability, once-only live-region ownership, locked-state
refusal, and the successful stale-strip lifetime. Source assertions establish
the static ordinary/reduced-motion and eight-theme mappings; no
browser-computed invariant is claimed.

Task 154 is implemented and awaits explicit user review/acceptance. Its marker
remains `[ ]`. The audit status header remains unchanged because it is outside
the approved Task 154 row-writer authority. No acceptance, push, publication,
integration, cleanup, or later-task action was performed.
