# Task 149 Verification — Implementation Checkpoint

> State: `Implemented — awaiting user review`. Task 149 remains `[ ]`; this is
> implementation checkpoint evidence, not acceptance evidence.

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
| `pnpm exec vitest run src/hooks/use-triage-dnd.test.ts src/components/triage/hierarchy-explorer.test.tsx src/components/triage/triage-workspace.test.tsx` | 0 | Intermediate focused GREEN after the third repair: 3 files, 103 tests passed. |
| `pnpm exec vitest run src/hooks/use-triage-dnd.test.ts src/components/triage/hierarchy-explorer.test.tsx` | 1 | Fourth-cycle RED: 4 failures among 65 tests reproduced no-post-activation mouse release, stationary-touch activation, same-coordinate geometry refresh, and multi-frame stationary-pointer row change. |
| `pnpm exec vitest run src/hooks/use-triage-dnd.test.ts src/components/triage/hierarchy-explorer.test.tsx src/components/triage/triage-workspace.test.tsx` | 0 | Latest focused GREEN: 3 files, 107 tests passed. |
| `pnpm test` | 0 | Superseded intermediate input: 95 files, 990 tests passed; not reused after the fourth production repair. |
| `pnpm test` | 0 | Latest-input complete test gate: 95 files, 995 tests passed. |
| `pnpm lint` | 1 | Intermediate full lint found one new React ref error and one new hook-dependency warning. |
| `pnpm lint` | 0 | Latest input: zero errors and 11 unchanged pre-existing warnings. |
| `pnpm typecheck` | 0 | Latest input: `tsc --noEmit` passed. |
| `git diff --check` | 0 | Latest input passed. |
| `pnpm build` | 0 | Latest-input Next.js 16.2.1 production build compiled, typechecked, and generated all 7 routes. |
| `pnpm exec vitest run src/hooks/use-triage-dnd.test.ts` | 1 | Fifth-cycle harness setup run: 6 component-render errors exposed a missing partial mock export; corrected before claiming behavioral RED. |
| `pnpm exec vitest run src/hooks/use-triage-dnd.test.ts` | 1 | Fifth-cycle behavioral RED after harness setup was corrected: 6 failures among 58 tests reproduced same-ID `valid` feedback retention and post-cancellation Explorer frame work for document exit, window blur, remote invalidation, Escape, and drag end. |
| `pnpm exec vitest run src/hooks/use-triage-dnd.test.ts` | 0 | Fifth-cycle owner GREEN: 1 file, 58 tests passed. |
| `pnpm exec vitest run src/hooks/use-triage-dnd.test.ts src/components/triage/hierarchy-explorer.test.tsx src/components/triage/triage-workspace.test.tsx` | 0 | Fifth-cycle latest focused GREEN: 3 files, 113 tests passed. |
| `pnpm test` | 0 | Fifth-cycle intermediate full test: 95 files, 1001 tests passed; a later test-harness purity repair invalidated this exact test input. |
| `pnpm lint` | 1 | Fifth-cycle intermediate lint rejected one render-time external assignment in the new integration harness; product behavior was unchanged. |
| `pnpm test` | 0 | Fifth-cycle final latest-input complete test gate: 95 files, 1001 tests passed. |
| `pnpm lint` | 0 | Fifth-cycle final input: zero errors and 11 unchanged pre-existing warnings. |
| `pnpm typecheck` | 0 | Fifth-cycle final input: `tsc --noEmit` passed. |
| `pnpm build` | 0 | Fifth-cycle final input: Next.js 16.2.1 compiled, typechecked, and generated all 7 routes. |
| `git diff --check` | 0 | Fifth-cycle final input passed before documentation-only checkpoint updates. |

## Browser Modality

Chromium mouse evidence used route
`/grid/294c56ab-df43-4020-9aa7-24dbc61a1a32`. The original edge run moved the
Home column from `scrollTop 0` to `348`, released on the final rendered
`Explorer Root 14`, stopped after exit, and cancelled on Escape/end. The
fourth-cycle stationary-pointer run sampled seven frames at scroll positions
`50, 190, 330, 430, 570, 690, 830`; all seven pointer-under rows were distinct
and `valid`, and release selected the seventh rendered row
`Home → Cycle 4 Root 02`.

For release-time geometry, a mouse drag remained fixed at viewport point
`(534.375, 776.086)`. Programmatic Explorer scrolling changed the rendered
pointer-under row from `Explorer Root 11` at `scrollTop 0` to
`Explorer Root 05` at `scrollTop 350`; without another pointer move, release
opened destination `Home → Explorer Root 05`. Browser console had zero errors;
the placement dialog emitted its known missing-description warning. No
unrelated theme, route, reduced-motion, or cross-tab matrix was repeated.
Stationary touch activation is owner-test evidence, not claimed as a
touch-browser run.

Fifth-cycle Chromium mouse lifecycle evidence held a valid drag at the Home
column bottom edge. Four 90 ms samples progressed through scroll positions
`110, 176, 308, 451`. After `window blur`, four 100 ms samples remained at
`451`, the pointer-under row returned to `idle-valid`, and Escape/release
opened no placement dialog. Browser console contained zero errors. The
same-ID payload replacement and remote-invalidation boundaries are covered by
the mounted Explorer-to-hook owner tests rather than a repeated browser data
matrix.

## Repair Cycles And Review

1. Replaced stale hierarchy release targeting, added feedback and explicit
   scrolling/cancel owners; repaired a per-column RAF recursion/ownership flaw.
2. Repaired React ref and listener dependency findings from lint.
3. Reproduced and repaired document-exit target retention with a failing
   `mouseleave` test.
4. Preserved pre-activation mouse/touch coordinates and refreshed rendered
   classification on stationary frames; final review exposed same-ID and
   cancellation integration gaps.
5. Keyed feedback by the complete relevant rendered identity, made late frame
   refresh inert across every cancellation boundary, and replaced isolated
   coverage with mounted Explorer-to-hook regressions.

The first read-only High-risk review reported two Important findings:

- `P28-01`: no-post-activation-move release can lack pointer coordinates and
  fall back to stale `event.over`.
- `P28-02`: stationary-pointer scrolling can stop when a new row moves beneath
  the edge pointer because feedback remains tied to the prior row ID.

The user approved one fourth bounded repair cycle. `P28-01` now retains mouse
and touch coordinates before and after activation, and release uses current
rendered geometry whenever coordinates exist. The attempted `P28-02` repair
refreshes the same pointer coordinate on every Explorer animation frame while
preserving the existing occupancy request generation and source stale guards.
The focused and complete gates above are from that repaired input.

The fourth-cycle final read-only High-risk re-review found two Important issues
and no Critical issues:

- `P28-02` remains incomplete because feedback identity is cached only by
  `dropId`. A section target can keep the same ID while its rendered parent,
  level, title/path, or occupancy payload changes, so stationary-frame
  classification can retain the old feedback until release.
- `P28-03` is a new cancellation integration defect: Explorer retains its
  closure-local pointer and calls the refresh owner after document exit,
  window blur, or remote invalidation. Because the classifier remains active,
  the next frame can restore feedback and edge scrolling even though mutation
  remains cancelled.

The user approved one fifth bounded repair cycle. Mounted owner tests now
prove same-ID `parent-a → parent-b` payload replacement reissues occupancy and
changes `valid → full`. The same harness proves queued frames after document
exit, window blur, remote invalidation, Escape, and drag end cannot restore
feedback, requery occupancy, invoke refresh, or move scroll. P28-01's immediate
mouse/touch release tests remain green.

Final read-only High-risk re-review found no Critical or Important issues and
independently reran the focused 3 files / 113 tests green. `P28-01`, `P28-02`,
and `P28-03` remain repaired awaiting the Task 149 checkpoint; none is marked
Closed or Accepted.
