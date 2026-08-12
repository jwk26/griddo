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
the existing `GridRuntime` system-Inbox route dispatch coverage. Interaction
and focus claims above are exercised headlessly against that production
Workspace/Breakdown/Pool component tree without selecting `DP-VQ05` visuals.

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
- Remaining blocking, medium, or low concrete findings: None.
- Issues / deviations: None.
- Canonical impact: `None` — implementation-local.

## Checkpoint buckets

- Visible now: Headless Add/Delete behavior is active in the existing Inbox
  Workspace; duplicate/competing work and Scratch switches are denied while
  locked, successful Add/Delete perform the verified scroll/focus handoffs.
- Review now: Task 136 implementation and this evidence; user acceptance is
  still required and Task 136 remains `[ ]`.
- Planned later: `DP-VQ05` appearance/copy (Task 143) and the remaining exact
  lock consumers owned by Tasks 137, 139, 145, 152, 156, and 161.
- Unowned: None.
