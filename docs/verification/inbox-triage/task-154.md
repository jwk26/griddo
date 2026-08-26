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
