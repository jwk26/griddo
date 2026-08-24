# Task 139 Verification — Headless Add-draft Departure

## Scope and provenance

- Required recovery anchor: `17babba46969b4b1981fca91c57acc85f1eaf62a`.
- Durable start: `97129620cdf0e08f015c4c95734bf7946ae105c8`.
- Scope-conflict record: `e854e75597f47ceddeb50c44fac0df3dab863a42`.
- User-approved `P27-03` canonical expansion:
  `3d96e6e83bd6c1e8076b22c48c12912ac2ebd5dd`.
- Implementation: `d987ed2e221999dd27f3050c5352b1771fa4458f`.
- Implementation `src` tree: `a717e61a866fcb28c5139f19c6dab0d394733f76`.
- The Gate C file remained a run-phase receipt and was not passed to the
  run-task resolver. The resolver ran without a receipt and returned
  `contract_ready=true` with `approval_required`, serving as compatibility
  evidence only; the user's prompt supplied execution approval.

The implementation is limited to the canonical hook/Workspace/Breakdown/shared
lock files and the approved actual Scratch Pool, Hierarchy Explorer, Sidebar,
and global Search owners with their tests. It adds no copy, styles, decision
surface, or other `DP-VQ03` realization.

## TDD and review repair evidence

| Cycle | RED | GREEN |
| --- | --- | --- |
| Preserved controller prototype | The preserved seven-file prototype began from the previously recorded controller/component RED cycles | Focused controller/Workspace/Breakdown/lock suite passed 4 files / 145 tests before owner review |
| `P27-03` owner expansion | Review demonstrated post-mutation Scratch rollback, bypassed Explorer/route owners, and absent destination focus | Actual Pool, Explorer, Sidebar, and Search owners moved coordination before mutation; focused expanded suite passed |
| Same destination and route focus | Focused 5-file run exited 1 with six expected failures for same-Scratch/current-path decisions, missing production route focus, and the new handoff contract | Same Scratch/current path became no-ops; full-route destination focus was captured and handed to the destination `main`; 5 files / 88 tests passed |
| Same-path query and stale focus | Hook run exited 1 with the expected same-path query focus failure | Full pathname+query identity and mismatched-navigation cleanup passed; local Sidebar Suspense isolated `useSearchParams` without hiding navigation controls |

The initial independent review reported three Important gaps: actual route/path
owners bypassed coordination, Scratch used post-mutation rollback, and
destination focus was absent. After the approved canonical expansion, the
follow-up review found same-location false departures and missing production
route focus, then identified the same-path query/stale-focus edge. All were
repaired inside the approved owner set. Final independent review reported no
Critical or Important findings.

## Contract evidence

- Add draft state is published synchronously by the real Add input owner;
  whitespace is non-empty.
- Different Scratch and Explorer destinations are captured before selection or
  path/open-column mutation; current Scratch/current path are no-ops.
- Sidebar and global Search capture SPA route destinations before `router.push`.
  Full pathname/query identity drives a destination `main` focus handoff and a
  mismatched settled route drops stale focus intent.
- A new destination replaces the prior pending destination. Continue clears
  only that intent, preserves the Add draft, performs no destination, and
  restores Add focus. Discard clears only the Add draft and performs/focuses
  the latest destination exactly once.
- Every `add|delete|edit|stage|unstage|placement|undo|archive` shared-lock kind
  blocks internal and native exit without mutation, draft clear, queue, or
  replay. Standard `beforeunload` prevention remains active for dirty draft or
  lock state.
- No Workspace state subscriber or post-mutation rollback remains. No Task 140
  DOM, copy, style, generic dialog, or reconciliation UI was added.

## Verification commands

| Command | Exit | Relevant result |
| --- | ---: | --- |
| Task 139 focused Vitest command over the eight named test files | 0 | 8 files / 213 tests passed |
| `pnpm test` | 0 | 94 files / 855 tests passed |
| `pnpm lint` | 0 | 0 errors; the same 11 existing warnings outside Task 139 files |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |
| `git diff --check` | 0 | No whitespace errors |

## Checkpoint buckets

- Visible now: native browser exit prevention and the headless preservation,
  blocking, destination replacement, and focus behavior behind actual Inbox
  interactions; no Task 140 decision surface is rendered.
- Review now: Task 139 implementation acceptance.
- Planned later: Task 140 `DP-VQ03` DOM/copy/style, Task 143 reconciliation UI,
  and Task 160 compatibility.
- Unowned: None.
