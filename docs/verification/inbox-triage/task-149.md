# Task 149 Verification — In-Progress Recovery Evidence

> State: `In Progress`; blocked before a fourth repair cycle. Task 149 remains
> `[ ]` and this record is not acceptance evidence.

## Scope Exercised

- Release-time rendered hierarchy target selection over stale DnD hover data.
- Valid, invalid, and full feedback; full targets remain release selections.
- Valid Explorer-column edge scrolling and exit/end/Escape/remote-invalidation
  cancellation while `DndContext autoScroll={false}` remains unchanged.
- Mouse and touch coordinate owner tests plus focused browser mouse evidence.

## TDD And Gate Evidence

| Command / modality | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm test -- src/hooks/use-triage-dnd.test.ts src/components/triage/hierarchy-explorer.test.tsx src/components/triage/triage-workspace.test.tsx` | 1 | Initial RED: six new Task 149 assertions failed; existing release selected the stale target. This package-script form also ran the full suite, so it is not claimed as focused selected-target evidence. |
| `pnpm exec vitest run src/hooks/use-triage-dnd.test.ts src/components/triage/hierarchy-explorer.test.tsx src/components/triage/triage-workspace.test.tsx` | 0 | Focused GREEN after the latest repair: 3 files, 103 tests passed. |
| `pnpm test` | 0 | Intermediate full test input: 95 files, 990 tests passed. A later production repair invalidated this full-test fingerprint, so a fresh full test remains required. |
| `pnpm lint` | 1 | Intermediate full lint found one new React ref error and one new hook-dependency warning. |
| `pnpm lint` | 0 | Latest input: zero errors and 11 unchanged pre-existing warnings. |
| `pnpm typecheck` | 0 | Latest input: `tsc --noEmit` passed. |
| `git diff --check` | 0 | Latest input passed. |
| `pnpm build` | — | Not yet run on the latest input; full gate is incomplete. |

## Browser Modality

On Chromium at `1200 × 868`, route
`/grid/294c56ab-df43-4020-9aa7-24dbc61a1a32` used one Scratch Breakdown and
fourteen root Explorer targets. Holding a mouse drag at the Home-column bottom
edge moved `scrollTop` from `0` to `348`. The final rendered pointer-under
target was `Explorer Root 14`; release opened confirmation with destination
`Home → Explorer Root 14`. Moving outside Explorer held `scrollTop` at `348`
for another 400 ms; Escape/end opened no confirmation. No unrelated theme,
route, reduced-motion, or cross-tab matrix was repeated. Touch coordinate and
full/invalid outcomes are currently owner-test evidence, not claimed as a
touch-browser run.

## Repair Cycles And Review

1. Replaced stale hierarchy release targeting, added feedback and explicit
   scrolling/cancel owners; repaired a per-column RAF recursion/ownership flaw.
2. Repaired React ref and listener dependency findings from lint.
3. Reproduced and repaired document-exit target retention with a failing
   `mouseleave` test.

Read-only High-risk review then reported two Important findings:

- `P28-01`: no-post-activation-move release can lack pointer coordinates and
  fall back to stale `event.over`.
- `P28-02`: stationary-pointer scrolling can stop when a new row moves beneath
  the edge pointer because feedback remains tied to the prior row ID.

No Critical or Minor findings were reported. The minimum next hypothesis is
one additional bounded repair cycle that preserves latest pre-activation
coordinates and refreshes rendered target classification during scrolling,
then reruns focused and complete adapter gates plus High-risk review.
