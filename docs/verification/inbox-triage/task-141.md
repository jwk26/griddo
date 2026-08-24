# Task 141 Verification — `DP-VQ01` External Scratch Removal

## Scope and provenance

- Recovery anchor: `8015a986da743fbdff8ccc49edabeb44fcc15cfb`.
- Approved entrypoint `src` tree: `e84c5967f5fba8dfc3c8625fb644516dcc3673ce`.
- Candidate-pinned workflow: `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`.
- Durable start: `c483b049568c6fdb97372a74fb073ca9fd27c9cf`.
- Initial implementation and raster evidence: `9a804f6`.
- Review repair and regenerated raster evidence:
  `df085f65c41b2345f54fa863727788b03fedc91c`.
- Repaired implementation `src` tree:
  `a4db699808f6c63018fe608ec2d6d88846cd0957`.
- The Gate C run-phase receipt was not passed to the run-task resolver. The
  receipt-less resolver returned `contract_ready=true` and
  `approval_required`; the user's explicit Task 141 work order supplied write
  authority.

The implementation is limited to the canonical Task 141 component, store,
copy, CSS, test, and evidence paths. Task 138 editor visuals, Task 140 departure
sheet, Archive/dialog/Pool chrome, Task 142+, Task 143 reconciliation, Task 160
compatibility, experiment cleanup, and unrelated code remain unchanged.

## Realized contract

- An externally archived or deleted selected Scratch opens one dedicated,
  central, workspace-blocking `alertdialog`. The source selection remains held
  during the transition; background Pool and Workspace content are inert.
- A clean transition begins a 5-second countdown with Pause, Resume, and Move
  now. Pause freezes the exact remainder. A running destination replacement
  restarts at 5 seconds; a paused replacement changes destination copy without
  changing the frozen timer. Escape and attempted outside focus do not dismiss
  or escape the transition.
- Destination resolution revalidates the latest active and search-visible
  context, preferring the next visible Scratch and then the previous visible
  Scratch under the current order. Search-empty and Inbox-empty destinations
  use their dedicated terminal status/focus targets.
- Any non-pristine page-local Add, Scratch-title, or Breakdown-row draft starts
  the transition paused. Every captured draft is rendered in full with its
  source label and a Copy full draft action. Successful copy changes only that
  action to Copied, retains action focus, leaves the timer untouched, and does
  not clear the draft; clipboard failure leaves full selectable text.
- Authoritative archive restoration cancels the transition and retains the
  source selection, page-local drafts, and pre-transition focus. A hard-delete
  identity reappearance never restores or dismisses the delete transition.
- Countdown completion or Move now atomically revalidates the destination,
  selects it or clears selection, removes page-local drafts, closes the
  transition, and focuses the selected context, search-empty status, or
  Inbox-empty heading.
- Terminal validation reads the latest Inbox projection first and the source
  lifecycle last, then normalizes source membership against that final source
  read before handoff. A stale projection cannot masquerade as archive restore
  or retain an already removed source.
- The component uses one semantic tree and exact canonical copy across GridDO,
  Tiny Desk, Neumorphism, Claymorphism, Origami, Terminal, Retro Mac, and
  Graphite in light and dark modes. Theme selection does not branch behavior.

## TDD evidence

| Cycle | RED | GREEN |
| --- | --- | --- |
| Copy/store ownership | New assertions failed for unreleased Task 141 copy, external lifecycle state, ordered destination fallback, terminal selection, and restore/delete distinction. | Canonical copy and the store coordinator passed, including hard-delete no-restore and initial invalid-selection compatibility. |
| Pool/Workspace surface | New assertions failed for the three terminal focus targets, dedicated alertdialog, full draft capture/copy, exact countdown, destination replacement, archive restore, and terminal focus. | The final scoped run passed the four Task 141 files: 77/77 tests. |
| Adjacent headless owners | Task 137/139 behavior was retained as the integration base rather than copied into a new owner. | Final expanded focused run passed 8 files / 226 tests across Task 141 plus Inbox, Breakdown, departure, and scratch-breakdown owners. |
| Independent review repairs | Review identified unclassified delete restoration, render-time/inconsistent terminal reads, and incomplete explicit theme-role mappings. | Lifecycle `null` can no longer restore; exact selected-source observation begins before removal; terminal projection is normalized by a final source read with inconsistent-snapshot tests in both directions; every recipe theme family is explicitly bound and its raster regenerated. Final re-review reported no Critical or Important findings. |

## Canonical Chromium evidence

- Modality: local Playwright Core with system Google Chrome, using the
  user-approved external browser modality; the in-app Node REPL was not a
  prerequisite.
- Route/state: `http://localhost:3001/grid/c4bb3c47-7531-48f2-802e-79ea44b2e978`,
  viewport `1440×900`, with three active Inbox Scratches, one committed
  breakdown, and one full unsaved Add draft. IndexedDB changes plus Dexie's
  storage-mutation signal modeled authoritative changes from another owner.
- All 16 theme-mode captures retained a centered `560px` panel. Heights ranged
  from `293.6875px` to `330.484375px`; every panel stayed inside the viewport,
  horizontal document overflow remained `0`, the countdown track remained
  `4px`, and only the draft list exposed `overflow-y:auto` with contained
  overscroll.
- Every raster contains the archive title, paused destination, complete draft
  explanation, full Add draft, Copy full draft, Move now, and Resume. The
  committed breakdown was not mislabeled as a page-local draft. No Cancel or
  borrowed departure/dialog chrome appeared.
- Initial focus entered the first copy action. Tab remained contained, Escape
  did not dismiss, and attempted outside focus returned inside. Theme changes
  left the paused countdown transform unchanged.
- Removing the current destination while paused replaced it with the latest
  third-Scratch destination without restarting the timer. Authoritative archive
  restore closed the panel and retained Add value/focus. Hard-delete identity
  reappearance did not close the delete panel; Move now selected and focused
  the latest third-Scratch context and cleared the page-local Add draft.
- Final rasters:
  `docs/verification/inbox-triage/captures/task-141-external-removal-{griddo,tiny-desk,neumorphism,claymorphism,origami,terminal,retro-mac,graphite}-{light,dark}-1440x900.png`.

## UI guideline review

The latest Vercel Web Interface Guidelines were fetched before reviewing the
Task 141 Workspace/CSS paths. The review changed the countdown from layout
width animation to an interruptible transform with explicit origin, added a
reduced-motion variant, modal overscroll containment, visible hover/focus
states, touch manipulation, and balanced title wrapping. The final scoped
review has no remaining Task 141 findings.

## Verification commands

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm exec vitest run` over Task 141 and adjacent Task 137/139 owners | 0 | Fresh final run: 8 files / 226 tests passed |
| Changed-file `pnpm exec eslint` | 0 | No errors or warnings in Task 141 TypeScript/TSX paths |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| `git diff --check` | 0 | No whitespace errors |
| `pnpm test` | 0 | Fresh full run: 94 files / 884 tests passed |
| `pnpm lint` | 0 | 0 errors; the same 11 existing warnings outside Task 141 paths |
| `pnpm typecheck` | 0 | Fresh full-gate typecheck passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |
| Local Playwright/system Chrome on the canonical Inbox route | 0 | 16 theme-mode capture/geometry runs plus focus containment, paused destination replacement, archive restore, delete no-restore, terminal selection/focus, and draft clearing passed |

## Checkpoint buckets

- Visible now: the accepted `DP-VQ01` external archive/delete transition,
  countdown controls, full draft recovery copy, restoration, terminal
  selection, and focus behavior.
- Review now: Task 141 implementation and evidence acceptance. Task 141 remains
  `[ ]` until explicit user acceptance.
- Planned later: Task 142+, Task 143 reconciliation UI, and Task 160
  compatibility under their existing canonical ownership.
- Unowned: None.
