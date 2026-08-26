# Task 153 Placement Reliability Evidence

> Date: 2026-08-26
> Task state: `[ ]`, implemented; awaiting checkpoint acceptance
> Entry / accepted Task 152 checkpoint: `12fd2a9dedd282a784e0f9113950cb1a7646477c`
> Durable start commit: `3a5b4e5e8a247c3fa1d39a953a9cf965bb687675`
> Fourth-repair durable stop: `7c7a6857d43c68db42f6382f601007c004d576b1`
> Implementation commit: `b73dc2505c30a132e7d9fbbfcd02bf09a2aef188`
> Implementation `src` tree: `bcdcc5f2ed9c5ece9780a6f5ea0ccf261d5044a5`

## Implemented Boundary

Task 153 realizes the accepted `DP-VQ08=A` reliability rail only inside Task
152's captured target-column Placement Affordance. Pending, unknown,
reconciling, authoritative not-applied, returned-fact stale-source and
stale-target states retain the captured source/type/destination truth and show
the exact receipt-owned copy, action, and current-action focus. Check again is
read-only reconciliation of the exact command. Retry is available only after
authoritative `not_applied` and reuses the same logical operation ID,
preallocated result ID, command, and placement lock owner.

Authoritative `applied` and `already_applied` results enter success only. The
visible affordance is removed without a timer, the actual authoritative card
receives focus, and the operation-ID effect exposes the exact success sentence
once in a polite atomic status before acknowledging the operation. Its empty
node is semantic-neutral; success semantics survive acknowledgement and are
cleared only when a later placement operation starts. All eight accepted theme
families use the fixed rail geometry, and ordinary and reduced-motion modes
have the same static behavior with no placement animation or transition.

## TDD, Repairs, And Review

| Evidence | Exit | Actual result |
| --- | ---: | --- |
| Initial Task 153 RED | 1 | 13 expected owner failures; 61/74 tests passed before implementation. |
| First repair | 1 | Focused input reached 72/74. |
| Second repair | 1 | Focused input reached 73/74; full lint found a new React `set-state-in-effect` error. |
| Third repair / durable stop | 1 | The lint-invalid designs were removed, but an always-semantic empty live region produced five ambiguous pre-existing status queries; 69/74 passed. `P28-06` was durably recorded at `7c7a6857d43c68db42f6382f601007c004d576b1`. |
| Explicitly approved fourth repair | 0 | The exact bounded semantic-neutral-node hypothesis passed 3 files / 74 tests and required no new owner, scope, or product decision. |
| Final sole-session High-risk review | 0 findings | Re-read all seven product/test owners for status mapping, returned-fact stale classification, command/ID reuse, operation-lock lifetime, focus, one-shot success acknowledgement, static motion, copy, and theme realization. No Critical, Important, or Minor finding remains. |

The fourth cycle changed only the existing Explorer success live-region
semantics approved by the user. Canonical impact is `None`.

## Latest-Input Verification

No Task 152 gate, earlier Task 153 repair gate, or overlapping product-gate
result was reused.

| Command/check | Exit | Actual result / elapsed |
| --- | ---: | --- |
| Focused three-owner gate | 0 | 3 files / 74 tests passed; `real 2.19s`. |
| `pnpm test` | 0 | 98 files / 1086 tests passed; `real 21.17s`. |
| `pnpm lint` | 0 | 0 errors and 11 unchanged warnings outside Task 153 ownership; `real 6.46s`. |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed; `real 1.75s`. |
| `pnpm build` | 0 | Next.js 16.2.1 compiled, typechecked, and generated all seven routes; `real 10.77s`. |
| `git diff --check` | 0 | Latest seven-path product/test diff passed before commit. |

The serial full gate's directly measured command wall time totals `40.15s`.
Runtime token/accounting was unavailable: `not measured`.

## Exact Relevant Input Fingerprint

The latest successful focused/full evidence is anchored at implementation
commit `b73dc2505c30a132e7d9fbbfcd02bf09a2aef188`, complete `src` tree
`bcdcc5f2ed9c5ece9780a6f5ea0ccf261d5044a5`, unchanged Adapter blob
`ab4f7c765c1b27e48c7a46b9084ce6cc0a4af60e`, unchanged command-catalog blob
`2063146db0b8920dc8ee5805001e1541da49c2a0`, and accepted `DP-VQ08` receipt
blob `1b24863c1063a1091a8cfefa71da801a3e8ae7ba`.

The Task 153 relevant-input manifest is the following fixed-order list of
SHA-256 file-content lines in `/sbin/sha256sum` format, including each final
LF:

```text
2e09721cd799cd7c8085ea54b42a61b3c327b5960167fd41b23eca51f104c01a  src/hooks/use-triage-placement.ts
43b3a7d1b78c6667c2e52c03837742d4eed7ac9fb4b79e11d48203106fbc0688  src/hooks/use-triage-placement.test.tsx
96d532d194ea1e4efb862dbe51b5eaca1fe3d7f6f01ce323950ec6da9ee07768  src/components/triage/hierarchy-explorer.tsx
b05eb9fa0e2fbce910b41ff3ba8dc970e6d30528f1d262c37356d5f90b4b0fcd  src/components/triage/hierarchy-explorer.test.tsx
2ee90a1b86ffa25418bf06c1c1f95435c41cd859e857480fba270c72db973511  src/app/globals.css
7d673c3a7a0fa871bfb19023e53ffa1418ff749ed9795f38df372aafb0edd884  src/lib/copy/inbox-triage.ts
4b2761aeb89adf449b3e6fad5e46a802f3ebcd788293cc981ae0758301804a99  src/lib/copy/inbox-triage.test.ts
```

The SHA-256 of that exact manifest is
`df60d40a5beb3d130d1446a32ca6cd8c4743a50f601cecdbcd4357359ca07ee8`.
Evidence reuse requires the implementation commit/tree, all seven manifest
lines, command identity, build/config inputs, and environment requirements to
remain unchanged. Because every overlapping Task 153 product/test input
changed after Task 152, the reuse decision for this checkpoint is `no reuse`.

## Browser Modality And Ownership

Browser evidence was not run. Mounted owner tests directly exercise DOM focus,
live-region lifecycle, exact accessible names, one-shot acknowledgement, and
visible-affordance removal. CSS source tests enumerate the default plus seven
named theme mappings, fixed geometry, the reduced-motion media rule, and reject
any placement animation or transition value other than `none`. No
browser-computed visual value or browser-only invariant is claimed, so a
browser run would not establish an uncovered Task 153 contract.

The implementation commit changes exactly the seven approved product/test
paths. Checkpoint documentation changes exactly three paths:
`docs/issues/Issues_Phase_28.md`, this evidence record, and
`docs/verification/inbox-triage/phase-28-workflow-pilot-audit.md`. One durable
scope stop and four bounded repair cycles occurred; the user explicitly
approved the fourth. Task 153 remains `[ ]`, Task 154 remains unstarted, and no
acceptance, push, publication, integration sync, or cleanup occurred.
