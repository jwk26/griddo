# Task 151 Explorer Search And Reveal Evidence

> Date: 2026-08-26
> Task state: `[ ]`, implemented; awaiting checkpoint acceptance
> Durable start commit: `b6cce05`
> Start-base / entrypoint: `b13bcf0964d7113d7fcf701f3476f055fa818789`
> Accepted Task 150 `src` tree: `73a1d973263f92d97580927063f27651482d18d3`

## Scope Reconciled

Task 151 realizes the accepted `DP-VQ07` fixed-input Explorer replacement body
over the existing Task 135 whole-hierarchy search lifecycle. It also consumes
only the `P28-04`-moved `DP-VQ06-EXPLORER` selected-Bit disappearance slice in
the same hook/Explorer reveal owner. Task 151 does not change traversal,
ranking, global Search, DataStore APIs, persistence, placement, result-row DnD,
Undo, or Task 152+ behavior.

The implementation retains Explorer path chrome and swaps only the complete
four-column body while search is active. The body has one fixed full-width
input, one fixed polite atomic state line, and one internally scrolling flat
typed result list. It renders exact pre-search, initial-loading,
stale-refresh, no-results, request-error/retry, duplicate, stale-selection,
reveal, and focus states with static reduced-motion parity and the approved
eight-theme role family.

## Selection, Close, Reveal, And Disappearance

- Arrow Up/Down, Enter, and pointer activation operate on non-draggable typed
  results. Active-result focus scrolls only the internal result viewport.
- Selection rereads all active Nodes/Bits, reruns the Task 135 hierarchy query,
  and compares the current typed title/path identity before navigation. A
  stale, removed, hidden, moved, or unreachable row retains the body, query,
  results, scroll, and path/selection/reveal state; the refreshed result set
  and exact stale status replace only search feedback. A disappeared focused
  result returns focus to the input.
- A valid result clears active/interrupted search, restores the real ancestor
  path, marks and focuses the actual Node/Bit DOM row, and exposes the exact
  reveal sentence. Reveal has no timer and ends only through the approved
  selection/path/DnD/search/route lifecycle.
- DnD start alone changes active search to interrupted state while preserving
  query/results/scroll. Drop and Cancel do not reopen it; explicit Search
  activation restores it. X/Escape clear active/interrupted search and reveal
  and return focus to `Search Explorer`. Component unmount owns Inbox route
  exit; Scratch changes retain mounted search/reveal without forcing focus.
- When a revealed Bit alone disappears or moves away while its original parent
  chain stays valid, the hook changes the single reveal presentation to the
  exact parent-column `selection-cleared` state. Explorer preserves the parent
  path, focuses the surviving parent row or full-label heading, and implements
  Dismiss/path-lifetime behavior. If the parent chain is also invalid, the
  reveal clears and the existing Task 150 path-fallback owner remains solely
  responsible.

## TDD And Verification

| Command/check | Exit | Relevant result |
| --- | ---: | --- |
| Pinned candidate Adapter v2 resolver, receipt-less `run-task` | 3 | `approval_required`, `contract_ready=true`; exact repository, feature branch, HEAD `b13bcf0…`, linked worktree, Adapter, and verification catalog resolved. The exact user work order supplied ad-hoc Task 151 authority. |
| Receipt/Git identity checks | 0 | Adapter, Gate C, DP-VQ07, and DP-VQ06-EXPLORER blobs matched their pins; `HEAD`, parent, `HEAD:src`, clean worktree, and approved-base ancestry matched the work order. |
| Initial results/copy RED | 1 | Missing result component import and missing DP-VQ07 copy failed as expected. |
| Hook selection RED | 1 | Six cases failed because `selectResult` did not exist: valid Node/Bit plus removed, hidden, unreachable, and moved selection. |
| Explorer integration RED | 1 | Five cases failed because the dedicated body, result selection/reveal, DnD interruption, and selected-Bit realization were absent. |
| First lint repair evidence | 1 | Four `react-hooks/set-state-in-effect` errors identified duplicated effect-derived reveal/disappearance state in Explorer. The repair consolidated the single reveal presentation into the existing search hook's authoritative live snapshot callback. |
| Review repair RED | 1 | Two tests proved invalid parent deletion incorrectly emitted Bit-only selection-cleared status and a Bit moved from a still-valid parent incorrectly retained reveal. |
| Focused Task 151 gate | 0 | `pnpm vitest run` on utility, hook, results, Explorer, and copy tests: 5 files / 65 tests passed. |
| Full test gate | 0 | `pnpm test`: 97 files / 1043 tests passed. |
| Lint | 0 | 0 errors; 11 unchanged warnings in files outside Task 151 ownership. |
| Typecheck | 0 | `pnpm typecheck` / `tsc --noEmit` passed. |
| Build | 0 | Next.js 16.2.1 production build compiled, typechecked, and generated all seven routes. |
| Diff checks | 0 | `git diff --check` passed; no `useSearch()`, `searchAll()`, timer, result DnD, Undo, DataStore API/schema, or Task 152+ owner was added. |

No browser run was performed. Mounted component/hook tests directly exercised
the required keyboard, pointer, focus, DnD, Scratch, state, reduced-motion, and
theme-role modality. No Task 150 product/full/browser result is claimed as
Task 151 evidence.

## Review And Ownership

Self-review was used because the work order requires this to be the sole fresh
Working session. It found one Important issue: simultaneous parent-path
invalidation could be mislabeled as Bit-only disappearance and target a
non-surviving parent column. The two-case RED and repair above constrain
`selection-cleared` to an exact still-valid original parent chain. No Critical
or Important finding remains.

The production/test diff is limited to the nine planned Task 151 owners. This
record, the minimum Phase 28 ledger state, and the actual measured workflow
pilot row are the only lifecycle-evidence writes. Global Search and all future
task owners are untouched.

Canonical impact is `Reflected` for the already-approved `P28-04` release-edge
correction and `None` for implementation of the existing accepted contracts.
There is no issue, deviation, unowned material, push, publication, or topology
change. Task 151 remains `[ ]`; Tasks 152–154 remain unstarted.
