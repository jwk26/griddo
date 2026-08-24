# Task 143 Verification — `DP-VQ05` Add/Delete Reliability

## Scope and provenance

- Recovery anchor: `e323a4ab2c3d5932bc65ec99d4c9755073c5f0ae`.
- Approved entrypoint `src` tree: `9a4ca20e70de4925e1aa1be889dad4c677252136`.
- Candidate-pinned workflow: `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`.
- Durable start: `43e1bea6b1608a187eb1ceea236cc33287089f39`.
- Implementation: `593656908584358ca3bd77ff5f7983fca9f0335c`.
- Implemented `src` tree: `940c5ce559c1de68bba71435d81ee4b7a3207cc9`.
- The Gate C run-phase receipt was not passed to the run-task resolver. The
  receipt-less pinned resolver returned `contract_ready=true` and
  `approval_required`; the user's explicit Task 143-only work order supplied
  write authority.

The implementation is limited to the canonical Breakdown component and test,
global theme CSS, Inbox triage copy and test, and Task 143 evidence/ledger.
Pool `VQ-06`, Task 144 status UI, Task 145 adapters, generic dialog behavior,
and unrelated behavior remain unchanged.

## Realized contract

- Add renders source-attached `Adding…`, unknown, reconciling, and terminal
  failure states from Task 136 operation projections. Pending, unknown, and
  reconciling preserve the draft in a read-only field.
- Add exposes `Retry Add` only for authoritative terminal `not_applied`.
  Changing the retained draft withdraws that terminal recovery surface. Retry
  reacquires the preserved command identity and focuses the Add field before
  dispatch.
- Delete closes its confirmation after authoritative acquisition and keeps the
  source row attached for deleting, unknown, reconciling, `not_applied`,
  rejected, and conflict states. It never exposes a dedicated Retry or resend.
- Delete `Check again` calls only the reconciliation adapter with the preserved
  command and operation identity. An interrupted reconciliation remains
  unknown and can be checked again; terminal failure releases the lock and
  focuses the row Trash action. Terminal success uses the existing deterministic
  next/previous/Add/Context focus order.
- Reliability copy is a polite, atomic status region. The recovery button stays
  focusable with `aria-disabled=true` while reconciling, so focus does not
  disappear during an authoritative read.
- A new source interaction or Scratch exit withdraws terminal reliability
  projections. The operation lookup is keyed by Breakdown identity rather than
  scanning the projection list for every row.
- One semantic tree maps across GridDO, Tiny Desk, Neumorphism, Claymorphism,
  Origami, Terminal, Retro Mac, and Graphite in light and dark modes. Reliability
  motion is static, including a scoped override of the global reduced-motion
  minimum duration.

## TDD and review evidence

| Cycle | RED | GREEN |
| --- | --- | --- |
| Canonical state/action matrix | New DP-VQ05 assertions produced 18 expected failures before copy, states, actions, and focus existed. | The initial focused component/copy run passed 113 tests. |
| Scoped accessibility/lifecycle review | New tests reproduced terminal Delete persistence after a new row interaction and terminal projection restoration after leaving and returning to a Scratch. The review also found that the live region initially contained its action. | The status-only live region and terminal-withdrawal lifecycle passed the expanded focused run: 2 files / 115 tests. |
| Canonical browser reduced motion | Chrome computed `transition-duration: 0.01ms` because the existing base-layer reduced-motion rule outranked the new unlayered reliability rule. | A scoped same-layer reliability override produced computed `animation-name: none` and `transition-duration: 0s`; focused and full gates remained green. |

The latest Web Interface Guidelines were fetched for a scoped review of the
Task 143 component and CSS. The final review found no remaining Task 143
accessibility, focus, reduced-motion, overflow, or theme-semantic issue.

## Canonical Chrome evidence

- Modality: local Playwright Core with system Google Chrome
  `151.0.7922.138`; the in-app Node REPL was not a prerequisite.
- Route/state: `http://localhost:3001/grid/11111111-1111-4111-8111-111111111111`
  at `1440×900`, seeded through the actual `GridDO` IndexedDB schema.
  Authoritative result uncertainty was injected at the datastore's
  `scratchBreakdowns.get` boundary, not by replacing the UI hook.
- Add traversed unknown → reconciling → authoritative `not_applied`. The
  `Check again` action retained focus with `aria-disabled=true` while reading;
  terminal focus moved to `Retry Add`. UUID calls remained `2 → 2` across both
  an interrupted and terminal reconciliation, proving no replacement identity
  was allocated.
- Delete traversed unknown → reconciling → authoritative `not_applied`. The
  source row and authoritative IndexedDB row remained present, `Check again`
  was the only recovery action, and terminal focus returned to Trash. UUID
  calls remained `3 → 3` across both reconciliation reads.
- All 16 theme/mode runs retained exact Delete copy and `Check again`, produced
  zero horizontal document overflow, and preserved the focused recovery action.
  Theme-specific row height ranged from 80px to 83px without clipping.
- Reduced motion retained the same terminal copy/action/83px geometry with
  computed `animation-name: none` and `transition-duration: 0s`.
- Browser console and page errors: none.
- Machine-readable evidence:
  `captures/task-143-browser-report.json` — SHA-256
  `fcb809fa50edcbcc187ed0339f385652fcff1cee3cc38c6a5bacfc009c0835a4`.
- Representative captures:
  - `captures/task-143-add-reconciling-griddo-light.png` — SHA-256
    `e7d998dfc3ec311e18ac78e7ef62ea2f36d753c68f3d237f4ec3fd3eab232b2a`.
  - `captures/task-143-delete-reconciling-graphite-dark.png` — SHA-256
    `ed624f01a72e8a9b92f7db56de19939749013cb26cd9adaa126b07e99beedf59`.
  - `captures/task-143-delete-not-applied-reduced-motion.png` — SHA-256
    `c7ce5bf5571074286112874f3e7b53bc13a425d79e49a880e3c36e7bb05c4c2d`.
- Theme captures follow
  `captures/task-143-delete-unknown-{griddo,tiny-desk,neumorphism,claymorphism,origami,terminal,retro-mac,graphite}-{light,dark}.png`;
  all 16 are retained in the evidence commit and enumerated in the JSON report.

## Verification commands

| Command | Exit | Relevant result |
| --- | ---: | --- |
| Focused component/copy `pnpm exec vitest run` | 0 | Fresh final run: 2 files / 115 tests passed |
| Changed-file `pnpm exec eslint` | 0 | No errors or warnings in Task 143 TypeScript/TSX paths |
| `pnpm exec tsc --noEmit` | 0 | TypeScript passed |
| `git diff --check` | 0 | No whitespace errors |
| `pnpm test` | 0 | Fresh full run: 94 files / 909 tests passed |
| `pnpm lint` | 0 | 0 errors; the same 11 existing warnings outside Task 143 paths |
| `pnpm exec tsc --noEmit` | 0 | Fresh full-gate typecheck passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |
| Local Playwright/system Chrome on the canonical Inbox route | 0 | Authoritative Add/Delete uncertainty, preserved-identity reconciliation, terminal release/focus, reduced motion, and 16 theme-mode runs passed |

## Checkpoint buckets

- Visible now: the Task 136-backed Add/Delete reliability states, Add-only
  authoritative `not_applied` Retry, Delete retained-row `Check again`,
  production reconciliation, terminal release/focus, static reduced motion,
  and eight-theme light/dark mappings.
- Review now: Task 143 implementation and evidence acceptance. Task 143 remains
  `[ ]` until explicit user acceptance.
- Planned later: Task 144 Pool `VQ-06` and Task 145 adapters under their
  existing canonical ownership.
- Unowned: None.
