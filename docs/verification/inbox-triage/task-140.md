# Task 140 Verification — `DP-VQ03` Departure Confirmation

## Scope and provenance

- Recovery anchor and approved entrypoint: `23da87d6ac8a74c35efc425cb8cdb54e2b3246d4`.
- Approved entrypoint `src` tree: `a717e61a866fcb28c5139f19c6dab0d394733f76`.
- Durable start: `a1abd41d0ac3466960f2b9ed21f1810bd45ae1e5`.
- Implementation: `0e2abd690d315f4452750cfeaef570f28a1438ac`.
- Implementation `src` tree: `02990def33a836d0475b4d745c537d12f8d29492`.
- Approved focus-repair scope record: `de04fbb`.
- The run-phase Gate C receipt remained separate and was not passed to the
  run-task resolver. The candidate-pinned resolver ran without a receipt and
  returned `contract_ready=true` with `approval_required`; the user's explicit
  Task 140 work order supplied execution authority.

The fourth bounded repair changes only DP-VQ03 role styling and its CSS
contrast contract plus the accepted Task 139 controller's focus timing and
test. Scratch/path/route consumers, component structure, copy, global theme
tokens, native unload, unrelated confirmations, Task 143 reconciliation, Task
160 compatibility, and Task 141+ remain unchanged.

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
- `P27-04` preserves only the latest successful Discard destination's focus
  callback, performs the destination mutation synchronously once, and consumes
  the callback once in layout phase after the closed state commits. Continue,
  blocked/failed Discard, direct no-draft departure, and stale destinations do
  not create or replay a deferred focus intent.

## TDD and bounded repair evidence

| Cycle | RED | GREEN |
| --- | --- | --- |
| Initial realization | The initial wrapper invocation exercised the full suite: 94 files / 861 tests with seven expected Task 140 failures and 854 passes. Missing evidence was exact copy/receipt release, pending surface, Workspace state/inertness, action order/transitions, focus/keyboard, and destination continuity. | Selected component/copy run passed 3 files / 111 tests; the expanded Task 139 owner/controller run passed 8 files / 200 tests. |
| Inert close focus | Breakdown RED passed 86 existing tests and failed the new Add selection/focus restoration assertion after Continue. | Post-close focus restoration passed without changing the Task 139 hook. |
| Independent review repair | Review found outside-focus escape, passive focus timing, and missing real controller/sheet integration evidence. | `useLayoutEffect` focus entry, document focus containment with transition escape, and a real-controller integration harness passed; final focused evidence is 8 files / 203 tests. |
| Fourth-cycle contrast repair | The CSS contrast contract failed 1 of 90 Breakdown tests. Live RED reconstruction across 16 theme-mode surfaces measured eyebrow/description as low as `3.64:1`, Continue as low as `1.31:1`, and Discard as low as `1.44:1`. | DP-VQ03-only foreground/background role bindings passed 90/90 Breakdown tests without changing global tokens. Live GREEN minimum is `6.01:1`; every measured normal-text role is at least `4.5:1`. |
| `P27-04` focus timing | The hook RED run passed 17 of 20 tests and failed three post-commit ordering assertions: mutation ran once, but destination focus ran inside the same event before the sheet/inert DOM commit. Canonical Scratch Discard ended on `BODY`. | The final hook run passes 21/21. Destination mutation remains synchronous and once; focus is absent inside the event and executes once after sheet/inert removal. Continue, lock/no-pending failure, thrown mutation, direct no-draft, replacement, and stale-intent cases remain bounded. |

The first review also raised a possible simultaneous delete-dialog overlap. The
follow-up inspected the actual Radix modal owners and found no concrete user
interaction path from an open Delete confirmation to a Scratch, Path, Sidebar,
or Search departure request. No unapproved dismissal or queue policy was added.
Follow-up review reported no Critical or Important findings.

## Canonical Chromium evidence

- Route/state: `http://localhost:3001/grid/62cd7d6a-f2b0-4125-8408-0934df5dd31d`
  with two active Scratch rows and one root Explorer path target in the local
  Task 140 Playwright profile; viewport `1440×900`.
- Placement and geometry: the sheet stayed in flow immediately below the full
  Add row with an `8px` gap, `637.39px` width, and fixed `531px` bottom in all
  16 theme-mode combinations. Theme typography/borders produced only the
  expected `130–136px` height range. Horizontal/vertical overflow and clipped
  descendants were `0` throughout.
- Copy and hierarchy: every raster contains exactly `Unsaved Add draft`, `Keep
  writing?`, `Continue writing here, or discard this draft and move.`, then
  `Continue writing` before `Discard and move`. Continue retains the filled
  foreground treatment; Discard retains the destructive inset marker without
  becoming the primary action.
- Contrast: live GREEN values ranged from `6.01:1` to `21:1`. The prior RED
  role bindings ranged from `3.64–8.19:1` for eyebrow/description,
  `1.31–20.07:1` for Continue, and `1.44–5.14:1` for Discard, exposing failures
  across theme families rather than changing any theme token.
- Focus: initial focus was Continue; `Tab` moved to Discard, another `Tab`
  wrapped to Continue, and `Shift+Tab` returned to Discard. Attempted outside
  focus returned to the last action. Both actions exposed a `2px solid`
  `:focus-visible` outline in every theme-mode combination.
- Continue: Scratch remained selected, Explorer path and app route stayed put,
  the draft/selection remained, and the Add input regained focus.
- Discard: Scratch selected and focused the target Scratch row after commit;
  Path selected `Home / Task 140 path target` and focused that Explorer button;
  Route reached `/calendar/weekly` and focused its `main` landmark. The sheet
  and draft were gone in each case.
- Replacement/scope-out: a pending Scratch destination was replaced by the
  later Calendar destination while one unchanged sheet remained; Discard used
  the latest destination and reached Calendar. With no pending destination,
  both the clean state and a draft-only state contained no sheet. Dispatching
  cancelable `beforeunload` with the draft was prevented but rendered no sheet.
- Final rasters: `docs/verification/inbox-triage/captures/task-140-departure-{griddo,tiny-desk,neumorphism,claymorphism,origami,terminal,retro-mac,graphite}-{light,dark}-1440x900.png`.

## Verification commands

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm exec vitest run` over copy, Workspace, Breakdown, departure hook, Scratch Pool, Hierarchy Explorer, Sidebar, and Search Overlay tests | 0 | Fresh final run: 8 selected files / 208 tests passed |
| Changed-file `pnpm exec eslint` over the three changed TypeScript/TSX product/test paths | 0 | No errors or warnings |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| `git diff --check` | 0 | No whitespace errors |
| `pnpm test` | 0 | Fresh final run: 94 files / 869 tests passed |
| `pnpm lint` | 0 | 0 errors; the same 11 existing warnings outside Task 140 files |
| `pnpm typecheck` | 0 | Fresh full-gate typecheck passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |
| Local Playwright/Google Chrome on the canonical Inbox route | 0 | 16 theme-mode raster/contrast/geometry runs plus Scratch/path/route, focus containment, replacement, scope-out, and native-unload separation passed |

The user explicitly authorized external MCP Playwright or equivalent local
Playwright/Chromium as a separate evidence modality for this Task 140 repair.
The checks above used the actual app route and browser DOM/CSS/focus behavior;
the in-app Node REPL was not treated as a prerequisite.

## Checkpoint buckets

- Visible now: the accepted Add-adjacent `DP-VQ03` sheet and Task 139-backed
  Continue/Discard behavior for internal Scratch/path/route departure.
- Review now: Task 140 repaired implementation/evidence acceptance. Task 140
  remains `[ ]` until that explicit user acceptance.
- Planned later: Task 141+ surfaces, Task 143 reconciliation UI, and Task 160
  compatibility, all under their existing canonical task ownership.
- Unowned: None.
