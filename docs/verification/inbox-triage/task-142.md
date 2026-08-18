# Task 142 Verification — Triage Pointer Sources and Lifecycle Snapshots

## Scope and provenance

- Recovery anchor: `310b575738710178151423b6df11dc34611bdb1e`.
- Approved entrypoint `src` tree: `a4db699808f6c63018fe608ec2d6d88846cd0957`.
- Candidate-pinned workflow: `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`.
- Durable start: `2896f95a74e3ecb972a5a7ea78e612872d104cc9`.
- Implementation: `a851f35f6499d8a64f930da2b675e9b1e2e532f1`.
- The Gate C run-phase receipt was not passed to the run-task resolver. The
  receipt-less resolver returned `contract_ready=true` and
  `approval_required`; the user's explicit Task 142 work order supplied write
  authority.

The implementation is limited to the existing triage DnD owner, Breakdown and
staged source adapters, compact drag token, their tests, and this evidence. It
does not add a second DnD owner, reliability UI, Stage/Unstage command adapters,
auto-scroll, Placement execution, new copy/styles, or unrelated behavior.

## Realized contract

- The existing `useTriageDnd` owner uses Mouse `distance: 8` and Touch
  `delay: 250, tolerance: 5`; general Grid and Calendar DnD owners are
  unchanged.
- Activation captures one immutable source snapshot. Breakdown snapshots carry
  the selected Scratch, source identity/version/lifecycle, label, and kind;
  staged snapshots additionally carry candidate version/lifecycle and result
  type.
- Breakdown activation remains grip-only. The entire staged candidate root is
  the staged source.
- Stage, Unstage, and Placement are classified as distinct intents inside the
  existing owner. Task 145 command adapters and Task 152 Placement execution
  remain outside this task.
- The existing compact drag token renders from the activation snapshot and is
  centered on mouse and touch pointers.
- Escape clears the active visual lifecycle immediately and suppresses its
  later drop.
- Remote source invalidation latches cancellation without retargeting: the
  activation token remains visually stable through pointer release, the later
  mutation is suppressed, and authoritative source state remains in control.
- A drop without a valid activation snapshot is a noop even if release-time
  data is valid. A changed release snapshot cannot replace the activation
  identity or version.

## TDD evidence

| Cycle | RED | GREEN |
| --- | --- | --- |
| Activation and cancellation | New tests failed for stable activation data, remote Breakdown and staged version changes, source invalidation, and Escape cancellation while the prior drop matrix remained green. | Exact sensor constraints, stable snapshots, cancellation, and intent classification passed in the focused owner tests. |
| Review repair: invalidation visual lifetime | The source-unmount test failed because invalidation immediately removed `activeDragItem`. | Invalidation now retains the activation snapshot through release, then clears it and suppresses mutation. |
| Review repair: activation authority | A new invalid-scratch activation followed by valid release data incorrectly staged a candidate through the release-data fallback. | `handleDragEnd` now requires the captured activation snapshot; legacy drop-matrix tests execute the real `start → end` lifecycle. |

## Canonical Chromium evidence

- Modality: local Playwright Core with system Google Chrome, using the
  user-approved external browser modality; the in-app Node REPL was not a
  prerequisite.
- Route: `http://localhost:3001/grid/87bf4371-dbdd-40cc-ab78-7de2038b4705` at
  `1440×900`, with one direct Breakdown source and one staged Node source.
- Breakdown content did not activate after a 12px mouse move; its grip did.
  Mouse motion at 7px produced no token and 9px produced one token.
- Staged whole-root touch remained idle at 200ms and activated at 290ms. A
  20px pre-delay move exceeded the 5px tolerance and never activated.
- Mouse overlay center error was `dx=0.453125`, `dy=0.5`; touch overlay center
  error was `dx=0.140625`, `dy=0.140625`.
- Escape detached the token. During remote candidate invalidation from v1 to
  v2, the token remained attached with `data-candidate-version="1"` through
  release, detached on release, and authoritative candidate v2 remained.
- Browser console/page errors: none.
- Captures:
  - `captures/task-142-mouse-token-1440x900.png` — SHA-256
    `3a7dc50cd041cfdea6d790d578a9419693b86da8a59ba05a6e01c3aa61f3a5ef`.
  - `captures/task-142-touch-token-1440x900.png` — SHA-256
    `6e22616262ab19cf3209e1d1868892cae16d712c0cf5f46b16a91f1dc533ad80`.

## Review evidence

Independent read-only review initially reported two Important findings and no
Critical or Minor findings: invalidation removed the visual snapshot before
release, and drag end could fall back to release-time data. Both findings were
reproduced with failing tests, repaired, and included in the fresh focused,
full, and browser verification below. No finding expanded Task 142 scope.

## Verification commands

| Command | Exit | Relevant result |
| --- | ---: | --- |
| Focused `pnpm exec vitest run` over the four Task 142 test files | 0 | 4 files / 141 tests passed |
| Changed-file `pnpm exec eslint` | 0 | No errors or warnings in Task 142 paths |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| `git diff --check` | 0 | No whitespace errors |
| `pnpm test` | 0 | Fresh full run: 94 files / 891 tests passed |
| `pnpm lint` | 0 | 0 errors; the same 11 existing warnings outside Task 142 paths |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |
| Local Playwright/system Chrome on the canonical route | 0 | Grip/root ownership, Mouse/Touch thresholds, pointer alignment, Escape, and retain-through-release remote invalidation passed |

## Checkpoint buckets

- Visible now: exact triage pointer activation, canonical source ownership,
  stable compact token, intent distinction, Escape cancellation, and remote
  invalidation cancellation in the existing DnD owner.
- Review now: Task 142 implementation and evidence acceptance. Task 142 remains
  `[ ]` until explicit user acceptance.
- Planned later: Task 143 reliability UI, Task 145 Stage/Unstage command
  adapters, Task 149 auto-scroll, and Task 152 Placement execution under their
  existing canonical ownership.
- Unowned: None.
