# Task 151 Explorer Search And Reveal Evidence

> Date: 2026-08-26
> Task state: `[ ]`, implemented; awaiting checkpoint acceptance
> Durable start commit: `b6cce05`
> Start-base / entrypoint: `b13bcf0964d7113d7fcf701f3476f055fa818789`
> Accepted Task 150 `src` tree: `73a1d973263f92d97580927063f27651482d18d3`
> Implementation commit: `ab3637ac20eca545e273a5566730464ec8af9f26`
> Third-repair recovery anchor / `src` tree: `7ff75b1bd167de124c303cc487ecbe7c9f1237d3` / `0d78415800c18bfb80f8b13c6f5c5d1af9d984a6`
> Third-repair durable start / implementation commits: `11d38d2` / `7028d50ffd0b4a2700d57318847a4e91ef2c1139`

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
- Selection revalidation is bound to a mounted operation generation. Query
  edit, close, DnD start, retry/new authoritative request, synchronous Scratch
  switch observation, or route unmount invalidates an outstanding read before
  it can alter search/reveal/focus or return a selected outcome. Explorer also
  checks mounted ownership before the selected outcome can write Zustand path.
- A valid result clears active/interrupted search, restores the real ancestor
  path, marks and focuses the actual Node/Bit DOM row, and exposes the exact
  reveal sentence. Reveal has no timer and ends only through the approved
  selection/path/DnD/search/route lifecycle.
- DnD start alone changes active search to interrupted state while preserving
  query/results/scroll. Drop and Cancel do not reopen it; explicit Search
  activation restores it. X/Escape clear active/interrupted search and reveal
  and return focus to `Search Explorer`. Component unmount owns Inbox route
  exit; Scratch changes retain mounted search/reveal without forcing focus.
- Explorer-root Escape handling covers input, result, X, Try again, Search
  Explorer, and interrupted ordinary-column focus. It clears the whole active
  or interrupted session and reveal, returns focus to the entry when Explorer
  owns that handoff, and leaves an active DnD interaction's focus ownership and
  bubbling Escape lifecycle intact.
- Stale-selection feedback is subordinate to and ended by its receipt-owned
  query/request/refresh/error/retry/selection/close events. Results render the
  stored `result.icon` through the existing icon map and the stored color;
  Arrow navigation changes native button focus without manufacturing
  `aria-selected`.
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
| Third-repair initial RED | 1 | 17 focused failures/errors: 16 expected behavior assertions reproduced missing selection-operation invalidation, owner-wide Escape, feedback precedence/lifetime, stored icon identity, canonical input focus role, non-selecting Arrow focus, complete theme roles, and post-unmount path protection; one jsdom `scrollIntoView` spy setup error was corrected so the internal-only-scroll regression could join the GREEN gate. |
| Third-repair synchronous Scratch RED | 1 | The strengthened same-call-stack assertion proved a React layout effect could invalidate after a pending completion; the repair moved Scratch identity observation to synchronous Zustand subscription without changing preserved search/reveal or focus. |
| Third-repair lint repair evidence | 0 with one new warning | Removing focus-derived `aria-selected` exposed `role=option`'s required-selection warning. The result collection now uses a named native-button `role=list`, retaining result-count semantics without inventing selection; the rerun returned to the unchanged 11 out-of-scope warnings. |
| Focused Task 151 gate | 0 | `pnpm vitest run` on utility, hook, results, Explorer, and copy tests: 5 files / 82 tests passed. |
| Full test gate | 0 | `pnpm test`: 97 files / 1060 tests passed. |
| Lint | 0 | 0 errors; 11 unchanged warnings in files outside Task 151 ownership. |
| Typecheck | 0 | `pnpm typecheck` / `tsc --noEmit` passed. |
| Build | 0 | Next.js 16.2.1 production build compiled, typechecked, and generated all seven routes. |
| Diff checks | 0 | `git diff --check` passed; the repair production/test diff is exactly the seven approved Task 151 owners and adds no `useSearch()`, `searchAll()`, timer, result DnD, Undo, DataStore API/schema, or Task 152+ owner. |

### Third-Repair Chromium Evidence

Fresh Chrome `151.0.7922.174` ran the current production build with a dedicated
Task 151 temporary profile and 22 browser-only Node fixtures; no Task 150
product/full/browser evidence was reused. Opening Search focused the canonical
`explorer-search-field`: `:focus-visible=true`, solid `2px`
`rgb(36, 99, 235)` outline, and the field surface's matching `2px` focus shadow.
The custom `Star` result rendered `lucide-star` and its stored color as
`rgb(18, 51, 84)`.

Arrow Up moved focus from the input to the last native result button with no
`aria-selected`. The results viewport alone changed `scrollTop` from `0` to
`1354`; window, document, Explorer hierarchy, and shell scroll positions all
remained `0`. Computed entry/field/status/result signatures were distinct for
all eight themes (`8/8` for each role family), and after valid selection the
exact reveal sentence focused the real Node row while the reveal role also had
eight distinct computed signatures.

With `prefers-reduced-motion: reduce`, entry/field/status/result geometry
exactly matched ordinary mode; all reported `animation-name: none`,
`transition-property: none`, and `scroll-behavior: auto`. Reveal reported the
same static values with `418px × 32px` geometry. Browser console errors: `0`.
The temporary profile was moved to Trash after measurement and is recoverable;
it is not repository or product data.

## Review And Ownership

Self-review was used because the work order requires this to be the sole fresh
Working session. Earlier review constrained `selection-cleared` to an exact
still-valid original parent chain. The third repair review additionally found
and repaired the synchronous Scratch invalidation race and the focus-only
`role=option` accessibility collision described above. Final line-by-line
review found no remaining Critical or Important finding and no fourth cycle is
started.

The production/test diff is limited to the nine planned Task 151 owners. This
record, the minimum Phase 28 ledger state, and the actual measured workflow
pilot row are the only lifecycle-evidence writes. Global Search and all future
task owners are untouched.

Canonical impact is `Reflected` for the already-approved `P28-04` release-edge
correction and `None` for implementation of the existing accepted contracts.
There is no issue, deviation, unowned material, push, publication, or topology
change. Task 151 remains `[ ]`; Tasks 152–154 remain unstarted.
