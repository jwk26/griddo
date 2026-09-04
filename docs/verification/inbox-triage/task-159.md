# Task 159 — Implement Durable Completion, Cancel, And Explicit Reopen

> State: Implemented through repair cycle 2/3; awaiting user checkpoint review
> Task marker: `[ ]`
> Implementation: `68404f72aa47924ecf61dd3b14d8e4bbfbe3c631`

## Scope And Result

- `useCanArchiveScratch` now subscribes directly to the accepted Task 125
  repository eligibility for the selected Scratch: active Scratch, at least one
  consumed breakdown, zero unconsumed breakdowns, and zero staged candidates.
- The mounted workspace combines that persisted truth with the accepted Task
  136 non-empty Add-draft and Task 137 title-blocker snapshots without
  persisting, submitting, or auto-saving either editor.
- Only a mounted-page effective eligibility transition from false to true opens
  the Breakdown-scoped completion overlay. Initial route entry, reload, Scratch
  return, and same-session route re-entry onto already-eligible truth project
  complete Context and explicit `Reopen` without auto-opening the overlay.
- `Cancel` closes the overlay without undoing completion, closes an empty Add
  editor so the Add entry is restored, projects complete Context/Reopen, and
  focuses Reopen. Explicit `Reopen` restores the overlay and focuses its
  heading; Escape has the same safe Cancel behavior.
- A new active row, staged candidate, Add draft, or title blocker withdraws the
  overlay/complete/Reopen projection according to current truth. Recovery to
  eligible truth while the page remains mounted opens the overlay once.
- Existing Add-draft/title-editor ownership, surrounding Staging and Explorer
  reachability, existing flow ownership, and eligible Undo behavior remain in
  place. The overlay makes only Breakdown content and Add inert.
- The visible `Archive Scratch` action is intentionally disabled and
  non-dispatching. Task 161 owns archive mutation; Task 160 owns its separately
  planned exact blocker/withdrawal copy and realization. DP-VQ03/DP-VQ04 were
  not used as dependencies.

## Durable Ordering And Ownership

| Evidence | Value |
| --- | --- |
| Entrypoint | `fbb3bc36e1593513d5bb811de0c7c70c723137a2`; Phase 30 Gate C kickoff |
| Durable start | `4a5aa09987595bbf576854d8631be053eff88ad7`; ledger-only parent of every Task 159 product/test write |
| Implementation | `68404f72aa47924ecf61dd3b14d8e4bbfbe3c631`; exact six approved product/test paths |
| Dependencies | Accepted Tasks 125, 127, 131, 136, 137, and 145 were revalidated as ancestors before the first write; Tasks 138 and 140 were not treated as dependencies |
| Canonical impact | `None` — no product, design, copy, persistence, schema, or policy authority changed |
| Owner gate / unowned | No owner expansion, scope stop, or extra-cycle gate; `Unowned: None` |

## TDD And Repair Evidence

1. The initial RED hook run failed 12 new expectations against the old boolean
   seam. Component and workspace RED tests then proved the completion overlay,
   Cancel/complete/Reopen projection, Scratch transition, editor blockers, and
   focus behavior were absent before implementation.
2. The minimum implementation added the Task 125 live subscription, page-local
   non-persisted completion state machine, workspace blocker composition, and
   Breakdown-scoped presentation. Focused tests became green.
3. Bounded browser inspection found a concrete async focus defect: deleting the
   last row removed the focused control before the live eligibility update, so
   focus fell to `body` when the overlay arrived. Repair cycle 1 first reproduced
   the two-step order in a failing test, then focused the overlay heading when
   completion arrives from `body` or newly inert Breakdown content.
4. Target lint then found render-ref access and effect-state-update errors. The
   completion derivation was recast as a pure conditional state transition and
   the title blocker was projected through its mounted external-store owner.
5. Independent checkpoint review found four Important issues: stale completion
   focus history could steal Add focus, successful Add could flash an overlay
   while persisted eligibility was stale, equal-valued title blocker snapshots
   could be missed after a Scratch switch, and externally focused transitions
   lacked an announcement. Repair cycle 2 added four failing regressions first,
   then cleared focus history on blur, held Add blocking until persisted false
   was observed, scoped title-blocker handles per selected Scratch, and added a
   polite atomic completion announcement.
6. Direct requirement review additionally proved that Cancel from an empty Add
   editor did not restore the Add entry. A failing test was added first; the
   minimal Cancel repair closes only an empty editor and preserves a non-empty
   draft.
7. Independent re-review confirmed all four Important findings were resolved
   and reported no new Critical or Important finding. The latest focused and
   full verification reran after every product/test repair. Two of three
   authorized repair cycles were used.

## Latest Verification

| Command | Exit | Relevant result |
| --- | ---: | --- |
| `pnpm exec vitest run src/hooks/use-can-archive-scratch.test.ts src/components/triage/breakdown-panel.test.tsx src/components/triage/triage-workspace.test.tsx` | 0 | 3 selected files / 195 tests passed |
| target-path `pnpm exec eslint` | 0 | 0 errors and 0 warnings in the six Task 159 product/test paths |
| `pnpm typecheck` (focused) | 0 | `tsc --noEmit` passed before the latest full gate |
| `pnpm test` | 0 | 99 files / 1,211 tests passed |
| `pnpm lint` | 0 | 0 errors; 11 unchanged existing warnings |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; compile `4.2s`, TypeScript `4.4s`, seven pages generated |
| `git diff --check` | 0 | Whitespace verification passed after the full gate |

## Bounded Running-App Evidence

The task-local browser run used the mounted Inbox route at 1440×900 in the
GridDO light theme. It did not run or repair the deferred eight-theme,
light/dark, multi-viewport campaign.

- Initial already-eligible route entry and reload showed complete
  Context/Reopen with no overlay.
- Deleting the last active row through the visible confirmation produced the
  false-to-true overlay, scoped it to Breakdown, focused `Scratch complete`,
  and left Staging outside the inert region.
- Cancel closed the overlay, restored the Add entry, projected complete
  Context/Reopen, and focused Reopen. Explicit Reopen restored the overlay and
  focused its heading; Cancel remained enabled and safe.
- Switching to a second Scratch and returning, same-session Home-to-Inbox route
  re-entry, and reload all returned to complete/Reopen without auto-opening.
- A non-empty Add draft withdrew completion, retained the exact draft and input
  focus, and created no row. Clearing the draft recovered the overlay with
  heading focus and the polite `Scratch complete` announcement.
- A successful visible Add was observed with an overlay-addition watcher:
  `overlayAdds: 0`. The new active row stayed visible, Context remained working,
  and Add input focus was retained while the Task 125 snapshot caught up.
- Deleting that new active row recovered the overlay and heading focus.
- A clean reload of the final page reported zero browser console errors.

No screenshot, pixel, global fidelity, physical pointer/touch, or aggregate
theme claim is made. No new mismatch requiring another owner was observed.

## Relevant-Input Fingerprint

Not constructed. The Task 159 handoff explicitly forbids inventing or
backfilling a relevant-input fingerprint at this checkpoint.

## Checkpoint Buckets

- **Visible now:** source-backed mounted transition overlay, safe Cancel,
  complete Context/Reopen, explicit Reopen, withdrawal/recovery, and bounded
  focus/re-entry behavior.
- **Review now:** Task 159 implementation, tests, task-local browser evidence,
  and this checkpoint record.
- **Planned later:** Task 160 exact blocker/withdrawal realization and Task 161
  archive dispatch remain held and unstarted; Task 162 and Phase 31 are also
  unstarted.
- **Unowned:** None.
