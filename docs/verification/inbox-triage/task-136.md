# Task 136 Verification — Headless Add And Delete

## Scope and implementation

- Implemented the Workspace-mounted synchronous operation owner for
  `add|delete|edit|stage|unstage|placement|undo|archive` with one active
  operation identity, complete mutual exclusion, no queue/replay, and
  identity-matched terminal release.
- Replaced the legacy Breakdown create/delete hook surface with Task 120's
  authoritative Add/Delete command and reconciliation APIs. Page-local typed
  slots retain `pending|unknown|reconciling|terminal` state; an unresolved
  Delete retains its exact source snapshot even when reactive truth arrives
  before the transport result.
- Wired synchronous Add/Delete acquisition, duplicate/competing denial,
  protected Add draft and Delete row behavior, Breakdown Cancel/Escape gating,
  and expanded/collapsed Pool Scratch-switch gating.
- Confirmed Add clears only on `applied|already_applied`, keeps input focus,
  and scrolls the confirmed row according to the active sort. Confirmed Delete
  focuses next row, previous row, Add, then Context.
- Removed only the retired `deleteScratchBreakdownsByScratch` test mock and its
  vacuous no-call assertion (`P23-02`). No `DP-VQ05` appearance/copy or Task
  137+ behavior was added.

Implementation commit: `cf0b08db8d9be2a8c8653fa773c969b35d034569`.

## Failing evidence and repair loop

| Cycle | Command / observation | Exit | Result |
| --- | --- | ---: | --- |
| Reproduce | `pnpm test -- src/hooks/use-triage-operation-lock.test.tsx` | 1 | New owner import was absent; the existing 92 files / 743 tests still passed. The package wrapper did not prove selected-only execution, so later focused evidence used direct Vitest selection. |
| Repair 1 | Direct focused component/hook suite | 1 | One Delete unknown-state assertion observed the mock before a provider-equivalent rerender; the harness was repaired and the failure set shrank to zero. |
| Review repair | Diff and changed-file ESLint review | 1, then 0 | Fixed unresolved Delete source retention after a reactive removal and replaced selection/reset effects that synchronously called `setState`. No repeated failure signature or no-progress condition occurred. |

## Focused evidence

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm exec vitest run src/components/triage/breakdown-panel.test.tsx src/components/triage/scratch-pool.test.tsx src/components/triage/triage-workspace.test.tsx src/hooks/use-scratch-breakdowns.test.tsx src/hooks/use-triage-operation-lock.test.tsx` | 0 | 5 files / 110 tests passed. Covers the 8×8 lock matrix, identity release, authoritative dispatch/reconcile, duplicate Enter/click, unknown draft/row retention, Cancel/Escape, both Pool modes, Add scroll, and Delete next → previous → Add → Context focus. |
| `pnpm exec eslint <the 10 changed source/test paths>` | 0 | 0 errors and 0 warnings in the Task 136 code/test write set. |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed. |
| `git diff --check` | 0 | No whitespace errors. |

The canonical Inbox route continues to mount `TriageWorkspace`; its focused
test proves the idle mounted owner/composition, while the full suite retains
the existing `GridRuntime` system-Inbox route dispatch coverage. Task 136's
reconciliation APIs and terminal release remain covered at hook/owner level:
Task 143 owns the planned production `Check again` trigger and its route-level
reconciliation/focus evidence.

## Canonical-route interaction evidence

On 2026-08-14, the production development app was mounted in a fresh temporary
Chrome profile at its generated system-Inbox `/grid/<inbox-id>` route. The app
created the system nodes and first Scratch through production flows; a second
Scratch and bounded Breakdown rows were inserted into that temporary profile
as same-schema route fixtures. Chrome DevTools Protocol drove the production
Workspace/Breakdown/Pool DOM. No product component, hook, or test mock was
substituted. The temporary server, browser, profile, and fixture data were
removed after observation.

| Intent | Canonical-route action | Observed result |
| --- | --- | --- |
| Blur / Escape | Opened Add, blurred the empty field, then entered a non-empty draft and pressed Escape. | Blur dispatched no command; Escape cleared the draft and restored the Add placeholder; the selected Scratch still had zero rows. |
| Enter Add / focus / scroll | Submitted `Enter route addition` with Enter while wrapping the native `scrollIntoView` only to record its production call. | Exactly one authoritative row appeared, the Add field stayed focused with an empty value, and the confirmed row received `scrollIntoView({ block: "start" })` under `DESC`. |
| Duplicate / competing intent | In one synchronous interaction cluster, dispatched Enter, clicked explicit Add, and clicked the other Scratch before the first asynchronous gap. | Exactly one row with the submitted content existed, the competing Add was not replayed, selection remained on the source Scratch, and Add focus returned after terminal success. |
| Scratch switch | Clicked the other Scratch after the Add reached terminal success. | Selection changed and its 14 fixture rows rendered, proving switch denial ended with terminal lock release. |
| Delete Cancel / Escape | Opened Delete confirmation for the newest row, closed once with Escape and once with Cancel. | The dialog moved to `data-state="closed"` both times and the row count/content did not change. |
| Confirmed Delete focus | Confirmed deletion of the newest visible row. | The row disappeared and focus moved to the next visible row's Delete button. |
| Failed Delete | Advanced the selected row's authoritative version between opening confirmation and confirming Delete. | The terminal conflict retained the row, closed the dialog, released the lock, and returned focus to that row's Delete button. |
| Unknown lock / blocked actions | Injected one browser IndexedDB Delete transport exception before confirmation, then attempted Escape and the other Scratch. | Workspace reported operation kind `delete`; the exact row and open dialog remained; Cancel/Delete were disabled; Escape and Scratch switch were denied without replay or mutation. No `Check again`, reconcile, or retry production control existed. |

The last observation exposed `P27-01`: Task 136 can enter and preserve unknown
route state but cannot initiate reconciliation from that route. The planned
production reconciliation trigger is the `Check again` control owned by Task
143. The user approved a canonical ownership repair: Task 136 retains its
focused hook-level Add/Delete reconciliation and terminal-release proof and
route evidence through unknown retention/blocking; Task 143 retains
`Check again` → reconciliation with the preserved identity → terminal
release/focus in the canonical route.

## Adapter full gate

The adapter full gate was run serially exactly once after final focused repair:

`pnpm test && pnpm lint && pnpm typecheck && pnpm build`

| Target | Exit | Relevant result |
| --- | ---: | --- |
| Test | 0 | 93 files / 769 tests passed. |
| Lint | 0 | 0 errors; the same 11 pre-existing warnings. |
| Typecheck | 0 | `tsc --noEmit` passed. |
| Build | 0 | Next.js 16.2.1 production build passed; seven static routes and one dynamic route generated. |

## Review and ownership

- Concrete review finding repaired: `useScratchBreakdowns` could otherwise
  lose a Delete source row if liveQuery observed the commit before a transport
  exception established the unknown outcome. The operation slot now retains
  the exact source snapshot through pending/unknown/reconciling only.
- Concrete preflight findings repaired: synchronous reset effects in
  `BreakdownPanel` and `useScratchBreakdowns` were replaced by Scratch-keyed
  ownership/filtering.
- Remaining blocking, medium, or low concrete implementation findings: None.
- Issues / deviations: `P27-01` verification-staging conflict, user-approved
  and promoted to the execution plan; no product-scope deviation.
- Canonical impact: `Reflected` — Task 136 owns route evidence through unknown
  retention/blocking plus hook-level reconciliation; Task 143 owns route
  `Check again` → reconciliation → terminal/focus.

## Checkpoint buckets

- Visible now: Headless Add/Delete behavior is active in the existing Inbox
  Workspace; duplicate/competing work and Scratch switches are denied while
  locked, successful Add/Delete perform the verified scroll/focus handoffs.
- Review now: Task 136 implementation and this evidence; user acceptance is
  still required and Task 136 remains `[ ]`.
- Planned later: `DP-VQ05` appearance/copy and route `Check again` →
  reconciliation → terminal/focus (Task 143), plus the remaining exact lock
  consumers owned by Tasks 137, 139, 145, 152, 156, and 161.
- Unowned: None.
