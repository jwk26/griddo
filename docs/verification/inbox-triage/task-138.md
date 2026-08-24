# Task 138 Verification — `DP-VQ04` Inline Editors

## Targeted Fixed-Geometry Repair — 2026-08-18

This section is the current canonical verification evidence for reopened Task
138. The later sections in this file document the prior accepted realization
and remain historical evidence only where their geometry or raster judgment
conflicts with this repair.

### Approved scope and provenance

- Durable start/canonical reflection: `6c2e5095e87f77d8f3c2d4e9ee9814ffb9227503`.
- Implementation: `68534d00217230529b1988d251a48f66ab6d1ed4`.
- Approved clean TDD input: `8eb0aec73965d0dd477bdefc7975026a43aa1c5e`.
- Canonical implementation `src` tree:
  `9375974b616ae6d6b891937ad04dc6a99d5fbb88`, exactly equal to the approved
  input tree and reached by changing only `src/components/triage/breakdown-panel.tsx`,
  its test, and `src/app/globals.css` from the required start.
- The experiment changed the earlier no-horizontal-movement stop condition at
  `4c22b8c`; the user subsequently smoke-reviewed and approved browser-managed
  caret-following horizontal movement. That smoke is approved design/input
  compatibility evidence, not acceptance of this canonical checkpoint.

### Bounded RED / GREEN evidence

| Step | Command | Exit | Relevant result |
| --- | --- | ---: | --- |
| RED | `pnpm test src/components/triage/breakdown-panel.test.tsx` after applying only the approved test diff | 1 | 1 file / 81 tests selected; 33 expected failures exposed missing permanent slots, ordinary status rows, uncapped/multiline fields, and absent source-bound overlays |
| GREEN | Same focused command after applying the two approved production diffs | 0 | 1 file / 81 tests passed |
| Exact input check | `git diff --exit-code 8eb0aec73965d0dd477bdefc7975026a43aa1c5e -- <three approved src paths>` | 0 | Canonical working files were byte-for-byte equal to the approved input |
| Focused lint | `pnpm exec eslint src/components/triage/breakdown-panel.tsx src/components/triage/breakdown-panel.test.tsx` | 0 | No findings |
| Focused typecheck | `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| Focused diff check | `git diff --check` | 0 | No whitespace errors |

No repair cycle was needed after GREEN, and no failure signature repeated.

### Adapter full gate

The adapter-declared gate ran once, serially, after focused GREEN:

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm test` | 0 | 93 files / 820 tests passed |
| `pnpm lint` | 0 | 0 errors; the same 11 existing warnings |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |

### Interaction and visual evidence boundary

The focused DOM interaction suite directly proves the fixed Context and row
slots, stable drag/content/action anchors, single-line input elements and
60/120 limits, absent ordinary status rows, read-only progress states, blurred
content/source-bound overlays, conflict actions, and keyboard/IME behavior.
Exact-input comparison and diff review confirm the `9.5rem` action-region CSS
contract and the absence of custom `Home`/`End` interception; the approved
experiment smoke is the direct interaction evidence for browser-managed
caret-following movement.

The in-app browser runtime could not be started by Codex because its required
Node REPL execution tool was unavailable, and the Web Interface Guidelines
helper source returned timeout/HTTP 429. The user subsequently supplied the
exact-source browser measurements and smoke results recorded below. The 36
existing capture files remain unchanged and describe the prior realization;
the measurements below, not those old rasters, are the current fixed-geometry
browser evidence. They do not mark Task 138 accepted.

### Exact-Source Browser Evidence

- Source tree: `9375974b616ae6d6b891937ad04dc6a99d5fbb88`.
- Route: `/grid/eab62b76-64d7-4410-b089-6bbdf33e3a11`.
- Viewport: `1440×900`.
- View/edit transition: no geometry value below changed.

| Region | x | y | width | height |
| --- | ---: | ---: | ---: | ---: |
| Context | 348 | 48 | 637.39 | 104 |
| Context content | 397 | 65 | 407.39 | 70 |
| Context actions | 816.39 | 65 | 152 | 70 |
| Row | 348 | 160 | 637.39 | 48 |
| Row drag | 348 | 160 | 28 | 48 |
| Row content | 376 | 160 | 457.39 | 48 |
| Row actions | 833.39 | 160 | 152 | 48 |

| Boundary | clientWidth | scrollWidth | Home `scrollLeft` | End `scrollLeft` | Vertical result |
| --- | ---: | ---: | ---: | ---: | --- |
| Scratch title, 60 characters | 401 | 453 | 0 | 52 | `clientHeight === scrollHeight` |
| Breakdown content, 120 characters | 451 | 933 | 0 | 482 | `clientHeight === scrollHeight` |

Both fields had no visible scrollbar and no text/caret/action overlap. Browser
review covered GridDO light/dark, Tiny Desk light, Claymorphism dark, Terminal
dark, Retro Mac light, and Graphite dark. It also confirmed the offline
source-bound overlay and the offline → saving transition. User smoke passed.

### Review and checkpoint buckets

- Blocking findings: None in the exact diff, focused behavior evidence, React
  implementation review, or adapter full gate.
- Remaining risk: None identified within the approved Task 138 repair scope;
  Task 138 acceptance remains separately user-owned.
- Canonical impact: `Reflected` in `docs/DESIGN_TOKENS.md`, the reopened Task
  138 and Task 160 compatibility contracts in `docs/EXECUTION_PLAN.md`, both
  active `DP-VQ04` recipes, this evidence, and the Phase 27 ledger. No archived
  Phase 24 receipt was changed.
- Visible now: fixed Scratch-title and Breakdown-content editor geometry,
  limits, text-style actions, progress action, and source-bound issue overlays.
- Review now: Task 138 acceptance.
- Planned later: Task 139+, Task 143 route reconciliation UI, and Task 160's
  fixed-geometry-compatible `DP-VQ11` completion-blocker expression.
- Unowned: None.

## Scope

- Rendered the accepted `DP-VQ04` Scratch-title and Breakdown-content editors
  only, consuming the Task 137 conditional-editor state machine.
- Populated only the approved editor wording in the centralized Inbox/Triage
  copy owner.
- Kept the Scratch editor inside Context and the Breakdown editor in the exact
  source row, with the shared semantic state/role vocabulary and no theme-ID
  logic.
- Did not add a generic Dialog/AlertDialog editor, detached fallback, Task 139+
  behavior, or Task 143 `Check again` route reconciliation UI. The pre-existing
  Delete confirmation AlertDialog is unchanged and is not an editor surface.

## Bounded RED / GREEN Evidence

| Cycle | RED | Repair and result |
| --- | --- | --- |
| 1 | Focused copy/component run exited 1 with six expected missing-feature failures: Task 138 copy remained unavailable, both Edit triggers were disabled, and neither inline surface existed | Added centralized `DP-VQ04` copy, common in-place renderer, two source bindings, semantic styles, and initial focus/actions; the new surface tests passed |
| 2 | Focused component run exited 1 with two expected failures: applied Save had no surviving announcement and an invalidated removed row lost its review surface | Added confirmed-Save announcement/focus return and source-index-owned invalidated recovery; both behaviors passed after replacing effect-derived render state with activation/result ownership required by React Compiler lint |
| 3 | Focused reconnect test exited 1 because Offline `Retry save` remained disabled after the browser returned online | Added `useSyncExternalStore` connectivity projection; Retry remains disabled offline and becomes enabled only after reconnect |

No error/assertion signature persisted for two cycles without a shrinking
failure set. The three-cycle budget was not exceeded.

## Interaction And State Capture

Automated interaction capture in
`src/components/triage/breakdown-panel.test.tsx` covers:

- both `scratch-title` and `breakdown-content` surfaces across all nine
  `pristine|dirty|validation|saving|offline|not-applied|reconciling|conflict|invalidated`
  states, for 18 explicit surface/state cases;
- exact status, validation, comparison, recovery, action order, read-only, and
  disabled-state mappings;
- field-end entry focus, change dispatch, IME-protected Escape, theme-toggle
  no-blur-save, ordinary blur Save, and Escape Cancel;
- applied `Saved.` announcement with surviving Edit focus, conflict
  Use-mine/Use-latest/Copy-draft dispatch, copied status, pending-intent
  `Stay here`, and reconnect-gated Retry save;
- removed-row invalidation at the captured former list position with full draft
  review, and absence of Task 143 `Check again`;
- identical surface roles/state/copy for light and dark across all eight color
  themes (`griddo`, `tiny-desk`, `neumorphism`, `claymorphism`, `origami`,
  `terminal`, `retro-mac`, `graphite`).

## Browser Visual And Interaction Evidence

The user explicitly approved external `mcp__playwright__*` for this Task 138
verification-only repair as a separate evidence modality, not as a
`browser-client` fallback. The production consumer was exercised at
`/grid/887acc49-6441-4ba6-b2e5-851a0d9d8c3f` with a 1440 x 900 viewport, a
real Quick Capture Scratch named `Phase 27 visual review scratch`, and a real
Breakdown row named `Confirm venue, budget, and launch checklist`.

Durable raster artifacts are under
`docs/verification/inbox-triage/captures/`:

- `task-138-title-dirty-{theme}-{light|dark}-1440x900.png`: 16 captures;
- `task-138-row-dirty-{theme}-{light|dark}-1440x900.png`: 16 captures;
- `task-138-title-{pristine|validation}-griddo-light-1440x900.png`: two
  representative state captures;
- `task-138-row-{pristine|validation}-griddo-light-1440x900.png`: two
  representative state captures.

For both editors, every dirty-state raster was inspected in light and dark for
all eight themes (`griddo`, `tiny-desk`, `neumorphism`, `claymorphism`,
`origami`, `terminal`, `retro-mac`, `graphite`). The inline source placement,
field and focus-ring visibility, status/action hierarchy, disabled surrounding
controls, typography, contrast, and container geometry remained legible and
coherent. No clipping, overflow, detached editor, obscured action, or visual
product defect was found. The representative pristine and validation captures
also show disabled Save for unchanged input and the inline error with disabled
Save for empty input.

The same production session confirmed actual interaction behavior:

- title Escape restored the authoritative title and returned focus to its
  Context Edit trigger;
- row Cancel restored the authoritative content and returned focus to the
  exact row Edit trigger;
- the real color-theme control and light/dark control were each activated
  while the row editor was dirty; the draft and `Unsaved changes.` remained,
  with no blur-save or editor dismissal;
- the title and row empty-input Save attempts exposed the expected invalid
  field and validation copy without dispatching a save.

Keyboard composition/IME protection and the remaining asynchronous state
matrix are covered by the committed automated interaction evidence above;
external Playwright was used to add raster judgment and production-route
interaction evidence, not to replace those deterministic tests.

## Verification Commands

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm test src/lib/copy/inbox-triage.test.ts src/components/triage/breakdown-panel.test.tsx` | 0 | 2 files, 77 tests passed |
| `pnpm exec eslint src/components/triage/breakdown-panel.tsx src/components/triage/breakdown-panel.test.tsx src/lib/copy/inbox-triage.ts src/lib/copy/inbox-triage.test.ts` | 0 | Changed-file lint passed with no findings |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| `git diff --check` | 0 | No whitespace errors |
| `pnpm test` | 0 | 93 files, 811 tests passed |
| `pnpm lint` | 0 | 0 errors; the same 11 pre-existing warnings |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed in the serial full gate |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |

The successful gates above were not rerun during the verification-only repair:
their product/test inputs did not change, and `HEAD:src` remained
`ff50e3e769543faca79b15e3fcc115895ccf0f28` before the evidence commit.

## Review

- Blocking findings: None.
- Repaired findings: removed an unapproved invented live-region label; enabled
  Offline Retry only after reconnect; replaced effect-derived render state that
  caused duplicate invalidation and React Compiler lint errors.
- Remaining risk: None identified within the canonical Task 138 visual and
  interaction scope.
- Canonical impact: `None`; implementation consumes already-approved
  `DP-VQ04` without changing product, design, schema, or policy authority.

## Checkpoint Buckets

- Visible now: Both approved inline editors, their complete state/copy/action
  treatments, focus behavior, recovery surfaces, static reduced-motion styling,
  and theme-variable realization.
- Review now: None; both editors were raster-reviewed across all eight themes
  in light and dark, with representative pristine and validation states plus
  production-route focus and theme-switch interactions.
- Planned later: Task 139+ coordinators and Task 143 route `Check again` →
  reconciliation → terminal focus/release UI.
- Unowned: None.
