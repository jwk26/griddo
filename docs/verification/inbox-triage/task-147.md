# Task 147 Verification — Staging Status Realization

## Scope and provenance

- Recovery anchor: `d8ba3e256b9ff7c343501a1c0e7d2c3c2bd9034c`.
- Approved entrypoint `src` tree: `45e8d4401dc35ca05bd4fb8d5953fc6030f92ed6`.
- Candidate-pinned workflow: `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`.
- Canonical readiness start: `8b153b32fd10cafe3c3bbca4c396a84e2be6d80c`.
- Implementation: `a9e02b20f37ca307cd249acc4a173cfdefd400dd`.
- Browser-found local-arrival repair: `79a3aad09ea791d5b4aa05e78f287fc6802e118f`.
- Repaired `src` tree: `a94b637c16cb407879cc7fa5736e900edb909580`.

The Gate C run-phase receipt was not passed to the run-task resolver. The
receipt-less pinned resolver result was compatibility evidence only; the
user's Task 147 work order and P27-07, P27-08, and P27-09 approvals supplied
write authority. Task 148, P27-06, Task 146 command/DnD/integrity semantics,
orphan authority, and unrelated owners remain unchanged.

## Realized contract

- The staged-candidate hook exposes only matching authoritative live-query
  readiness. Before the first matching snapshot it is not ready;
  authoritative empty is ready; null or changed Scratch state cannot reuse the
  previous readiness. Initial hydration and Scratch-switch snapshots seed the
  arrival baseline, while a later authoritative arrival after ready-empty is
  distinguishable.
- The mounted Workspace projects its existing command-bearing operation state,
  explicit drag invalidation, and explicit placement invalidation into the
  Staging/Breakdown UI. It does not infer invalidation from generic close or
  candidate disappearance.
- Pending, unknown, reconciling, terminal conflict/rejection, unresolved
  source, invalid target, remote-arrival, and confirmed-orphan headless states
  use the accepted centralized copy and section-local visual family. Terminal
  alerts dismiss with source focus restoration and no invented Retry action.
- A local Stage identity is excluded from remote-arrival counts even when its
  authoritative live-query snapshot lands after the local command resolves.
  Cross-tab authoritative arrivals produce subsection counts without stealing
  focus; activating the count moves focus to the first new candidate and
  clears the indicator.
- Confirmed-orphan copy/render remains covered by the headless state matrix.
  Per P27-08, production reachability and browser acceptance are deferred until
  a future remote-authority lifecycle supplies an authoritative proof producer
  and caller.

## TDD and bounded repair

| Cycle | RED | GREEN / result |
| --- | --- | --- |
| Readiness | Focused hook cases failed before `isReady` existed and distinguished neither pre-snapshot nor ready-empty state. | Matching-snapshot readiness, empty readiness, null/change reset, and post-empty arrival baseline cases passed without changing candidate truth or commands. |
| Status matrix | Focused Workspace/Staging/Breakdown/copy cases failed for missing receipt states, copy, focus, lifetime, and theme hooks. | The accepted headless matrix and production-reachable projections passed. Confirmed orphan remained headless-only by authority. |
| Browser repair | Actual same-tab Stage was briefly counted as a remote arrival when the command resolved before the live-query update. | Workspace retains the local identity until authoritative observation; the added focused test and a fresh two-tab browser run proved actor count `0` and receiver count `1`. |

## Verification commands

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm exec vitest run` over the five Task 147 test files | 0 | 5 files / 197 tests passed |
| `pnpm test` | 0 | 94 files / 963 tests passed |
| `pnpm lint` | 0 | 0 errors; the same 11 existing warnings outside Task 147 paths |
| `pnpm typecheck` | 0 | TypeScript passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |
| `git diff --check` | 0 | No whitespace errors |

## Browser modality evidence

Local Playwright exercised the actual `/grid/<id>` production UI at
`1440x900` with an IndexedDB fixture confined to the browser profile.

- Baseline Staging rendered authoritative Node/Bit subsections and candidates.
- In two same-origin tabs, a remote Stage rendered `1 new` only in the receiver
  tab. Existing focus stayed on its source; activating `Show new Nodes`
  cleared the count and focused the first newly arrived staged Node.
- A real pointer Stage whose source version changed before drop rendered the
  exact terminal conflict alert once visually and once through the polite,
  atomic live region, exposed no Retry control, and returned focus to the
  originating Breakdown grip after dismissal.
- A staged Node held over the Bit subsection rendered `Return to Breakdown
  before changing type.` only for the active invalid target and cleared it on
  release.
- All eight themes were exercised with simultaneous alert and subsection-count
  states: `griddo`, `tiny-desk`, `neumorphism`, `claymorphism`, `origami`,
  `terminal`, `retro-mac`, and `graphite`. Their accepted border, radius,
  shadow, surface, or rule distinctions were present in computed style.
- With `prefers-reduced-motion: reduce`, the alert, count, candidate card, and
  live region had no animation; the alert had no transition and staging scroll
  behavior was `auto`.
- Confirmed-orphan production/browser acceptance was not fabricated and is
  explicitly deferred by P27-08.

Durable PNGs:

- `task-147-griddo.png`
- `task-147-remote-arrival.png`
- `task-147-terminal-alert.png`
- `task-147-target-reason.png`
- `task-147-reduced-motion-graphite.png`
- `task-147-theme-griddo.png`
- `task-147-theme-tiny-desk.png`
- `task-147-theme-neumorphism.png`
- `task-147-theme-claymorphism.png`
- `task-147-theme-origami.png`
- `task-147-theme-terminal.png`
- `task-147-theme-retro-mac.png`
- `task-147-theme-graphite.png`

## Checkpoint buckets

- Visible now: the accepted DP-VQ06-STAGING status family, exact production
  lifetimes, remote-arrival interaction, focus behavior, eight themes, and
  reduced-motion presentation.
- Review now: Task 147 implementation and evidence acceptance. Task 147 remains
  `[ ]` until explicit user acceptance.
- Planned later: confirmed-orphan production/browser reachability awaits a
  future authoritative proof lifecycle; Task 148 remains separate and `[ ]`.
- Blocker: none.
