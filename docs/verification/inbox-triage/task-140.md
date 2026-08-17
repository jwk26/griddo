# Task 140 Verification — `DP-VQ03` Departure Confirmation

## Scope and provenance

- Recovery anchor and approved entrypoint: `23da87d6ac8a74c35efc425cb8cdb54e2b3246d4`.
- Approved entrypoint `src` tree: `a717e61a866fcb28c5139f19c6dab0d394733f76`.
- Durable start: `a1abd41d0ac3466960f2b9ed21f1810bd45ae1e5`.
- Implementation: `0e2abd690d315f4452750cfeaef570f28a1438ac`.
- Implementation `src` tree: `02990def33a836d0475b4d745c537d12f8d29492`.
- The run-phase Gate C receipt remained separate and was not passed to the
  run-task resolver. The candidate-pinned resolver ran without a receipt and
  returned `contract_ready=true` with `approval_required`; the user's explicit
  Task 140 work order supplied execution authority.

The implementation changes only the canonical Task 140 Workspace, Breakdown,
global styles, and copy owners with their tests. Task 139's controller and
Scratch/path/route owners, native unload, delete/placement confirmations, Task
143 reconciliation, Task 160 compatibility, and Task 141+ remain unchanged.

## Realized contract

- A pending Task 139 destination alone selects
  `data-triage-state="departure-decision"` and renders one labelled/described
  inline `alertdialog` immediately below the complete Add row. No pending
  destination renders no `DP-VQ03` DOM.
- Exact copy comes only from `INBOX_TRIAGE_COPY.departure`: `Unsaved Add draft`,
  `Keep writing?`, `Continue writing here, or discard this draft and move.`,
  `Continue writing`, and `Discard and move`. No destination is interpolated.
- Continue is first/default, Discard is destructive secondary, and there is no
  close, backdrop, outside-click, portal, third action, or animation.
- Pool, Staging, Explorer, Breakdown content, and the Add row are inert while
  the decision is open. Pre-paint focus enters Continue; Tab/Shift+Tab cycle
  between the two actions; attempted outside focus returns to the last action.
- Continue calls the Task 139 transition, preserves the draft, and restores the
  Add input and its selection after inert is removed. Discard calls the Task 139
  transition and allows the latest destination's focus owner to win.
- The real controller/sheet integration test proves Scratch capture replaced by
  a later Path, Discard consumes only that latest destination once and clears
  only the Add draft, and Route Continue performs no route while preserving and
  refocusing the draft. Replacement keeps the same static sheet and action
  focus.
- One semantic tree uses the base GridDO treatment and named Tiny Desk,
  Neumorphism, Claymorphism, Origami, Terminal, Retro Mac, and Graphite CSS
  bindings. Theme IDs do not branch component copy or behavior.
- Task 139's `beforeunload` listener and all unrelated confirmation components
  are unchanged; native unload never renders this surface.

## TDD and bounded repair evidence

| Cycle | RED | GREEN |
| --- | --- | --- |
| Initial realization | The initial wrapper invocation exercised the full suite: 94 files / 861 tests with seven expected Task 140 failures and 854 passes. Missing evidence was exact copy/receipt release, pending surface, Workspace state/inertness, action order/transitions, focus/keyboard, and destination continuity. | Selected component/copy run passed 3 files / 111 tests; the expanded Task 139 owner/controller run passed 8 files / 200 tests. |
| Inert close focus | Breakdown RED passed 86 existing tests and failed the new Add selection/focus restoration assertion after Continue. | Post-close focus restoration passed without changing the Task 139 hook. |
| Independent review repair | Review found outside-focus escape, passive focus timing, and missing real controller/sheet integration evidence. | `useLayoutEffect` focus entry, document focus containment with transition escape, and a real-controller integration harness passed; final focused evidence is 8 files / 203 tests. |

The first review also raised a possible simultaneous delete-dialog overlap. The
follow-up inspected the actual Radix modal owners and found no concrete user
interaction path from an open Delete confirmation to a Scratch, Path, Sidebar,
or Search departure request. No unapproved dismissal or queue policy was added.
Follow-up review reported no Critical or Important findings.

## Verification commands

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm exec vitest run` over copy, Workspace, Breakdown, departure hook, Scratch Pool, Hierarchy Explorer, Sidebar, and Search Overlay tests | 0 | 8 selected files / 203 tests passed |
| Changed-file `pnpm exec eslint` over the six TypeScript/TSX implementation and test paths | 0 | No errors or warnings |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| `git diff --check` | 0 | No whitespace errors |
| `pnpm test` | 0 | 94 files / 864 tests passed |
| `pnpm lint` | 0 | 0 errors; the same 11 existing warnings outside Task 140 files |
| `pnpm typecheck` | 0 | Fresh full-gate typecheck passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |
| Dev-server HTTP smoke on `/` and `/grid/eab62b76-64d7-4410-b089-6bbdf33e3a11` | 0 | Both returned HTTP 200 |

The in-app browser skill could not run because this session exposed no Node
REPL `js` execution tool required by its `iab` backend. No alternate browser
server or injected fixture data was used. Exact interaction semantics and all
three destination kinds are covered by the focused real-controller and owner
tests; live theme appearance remains user-visible review evidence rather than a
fabricated browser claim.

## Checkpoint buckets

- Visible now: the accepted Add-adjacent `DP-VQ03` sheet and Task 139-backed
  Continue/Discard behavior for internal Scratch/path/route departure.
- Review now: Task 140 implementation acceptance and live visual judgment of
  the eight theme-family bindings.
- Planned later: Task 141+ surfaces, Task 143 reconciliation UI, and Task 160
  compatibility, all under their existing canonical task ownership.
- Unowned: None.
