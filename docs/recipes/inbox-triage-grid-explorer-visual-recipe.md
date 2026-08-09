# Inbox/Triage Grid Explorer — Visual Recipe

> Status: **Proposed — recipe-package user gate pending**
> Verification: **source-only; no rendered route/state was checked**
> Production owner: `HierarchyExplorer` plus dedicated future query/result owners (`LAND-EXPLORER`)

## Authority And Source Regions

- Product authority: [`DECISION.md`](../brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/DECISION.md) lines 754–885.
- Approved boundary: [`PROMOTION_MAP.md`](../brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/PROMOTION_MAP.md) §§10.1, 11.2, and 11.3.
- Design Source root: `/Users/jwk/Documents/griddo2-claude-themes2-3`.
- Explorer ranges: GridDO `page.tsx:1504-1774`; Tiny Desk `:1633-1909`; Neumorphism `:1404-1679`; Claymorphism `:1323-1687`; Origami `:1715-2035`; Terminal `:1329-1710`; Retro Mac `:1370-1756`; Graphite `:1439-1743` at that root.

## Shared Adopted Contract

- The sourced base body is four progressive columns with visible section chrome and full `Home`, `Level 1`, `Level 2`, `Level 3` labels. Do not expose `L1/L2/L3` or repeat selected titles below headers.
- Nodes and Bits retain native, shape-distinct rows/cards. Columns hide scrollbar chrome while preserving ordinary input scrolling.
- Supported target grammar includes idle, eligible, hovered eligible, unavailable/invalid, and base placement anchoring without changing path or column size.
- Grid semantic/default name is `Grid Explorer`; Tiny Desk may show `Library Index`, Retro Mac `Finder`, and Terminal `GRID EXPLORER`.
- Source active-column search inputs and filtered columns are observations only and are superseded; they do not source the selected replacement search mode.

## Decision-Prerequisite Boundary

- `VQ-07` — the full-hierarchy Explorer replacement search body (pre-search, results, loading/error, duplicates, reveal, and Undo feedback) is an absent replacement surface and is wholly excluded. The source/current active-column search, global Search overlay, and four-column chrome are prohibited fallbacks. **User-owned Decision prerequisite:** approve direct replacement-mode visual/content authority. Future owner: Explorer search phase; no dependent search UI task starts until a matching receipt.
- Explorer subset of `VQ-06` — **resolved by `DP-VQ06-EXPLORER` on 2026-08-10.** The user selected Choice A, the affected-column-attached remote/path status family specified below. Task 150 is its only realization edge. Pool and Staging remain governed by their own receipts; the separate `VQ-07` search body remains unresolved and supplies no fallback authority here.

## `DP-VQ06-EXPLORER` Approved Affected-Column Status Family

`DP-VQ06-EXPLORER` places each remote-arrival count beside its affected full
column label and places the one current remote/path status directly below the
surviving destination column label, outside that column's scrolling rows. It
never creates an Explorer-wide rail, ghost column, toast, dialog, event
history, Search-mode substitute, or Pool/Staging presentation.

### Placement, Count, And Anchoring

- Each visible `Home`, `Level 1`, `Level 2`, or `Level 3` heading may own one
  separate actionable remote-insertion indicator: exact `1 new` or `{count}
  new`, accessible as `Show new in {full level label}`. Counts are independent
  per currently open column and never replace or abbreviate the full label.
- The count includes only ordinary remote insertions first appearing in that
  visible column after the mounted-page snapshot or its last clear. Initial
  hydration, local placement, and an existing item merely moving between
  columns do not increment it.
- Ordinary insertion preserves Explorer path, selection, focus, and the
  column's first visible stable ID plus viewport offset. It never restores a
  raw `scrollTop`, jumps to the insertion, or changes the path automatically.
- Invalid-path status belongs to the nearest surviving destination column. It
  sits immediately below that column's full label and above its internally
  scrolling rows. Removed suffix columns leave no status placeholder, sibling,
  ghost row, ghost column, or duplicated label.
- Selected Bit disappearance keeps the valid parent path and places status in
  its current parent column. A stale placement status uses the same surviving
  destination-column strip. Only one path/fallback strip exists; a later
  fallback replaces it without creating history.

### Exact Copy And Actions

| State | Exact visible copy | Action |
|---|---|---|
| Remote insertion | `1 new` or `{count} new` | `Show new in {Home|Level 1|Level 2|Level 3}` |
| Deleted/unreachable selected path item | `“{title}” is no longer available. Returned to {destination}.` | `Dismiss` |
| Archived selected path item | `“{title}” was archived. Returned to {destination}.` | `Dismiss` |
| Moved selected path item | `“{title}” moved elsewhere. Returned to {destination}.` | `Dismiss` |
| Invalid suffix without safe item title | `This path is no longer available. Returned to {destination}.` | `Dismiss` |
| Selected Bit disappearance | `“{title}” is no longer available. Selection cleared.` | `Dismiss` |
| Stale placement | `Placement closed because this Explorer path changed.` | `Dismiss` |

`{destination}` is the visible full label/title of the exact nearest valid
ancestor, or `Home`; it never names a sibling, ghost, removed suffix, or
abbreviated level. `Show new` and `Dismiss` are the only actions. This status
family exposes no Retry, restore, reveal, Search, navigation, sibling-choice,
undo, or mutation action.

### Path Fallback, Focus, And Accessibility

- Ordinary remote insertion and count/status appearance never move focus or
  selection. Each changed visible path sentence is announced once through one
  polite atomic status without announcing rerender, sort, viewport movement,
  theme change, or elapsed time.
- If an ancestor is deleted, archived, unreachable, or moved, remove only the
  invalid suffix, keep the longest valid prefix, and close stale placement
  without a write. Never select a sibling or manufacture a ghost substitute.
- After authoritative fallback, focus the surviving nearest-valid ancestor row
  when it is present and focusable in the destination column; otherwise focus
  that destination column's full-label heading. The status strip itself does
  not take focus.
- Selected Bit disappearance clears only that Bit selection/reveal, preserves
  the valid parent path, and focuses the surviving parent row when present,
  otherwise its current column heading.
- Activating `Show new in {level}` revalidates that column's remote insertions,
  scrolls only that column to top, clears its count, and focuses the first
  surviving new row without selecting it or changing path. If none survives,
  focus the full-label heading. Merely observing the authoritative top clears
  the count without moving focus.
- Activating `Dismiss` removes only the path strip and returns focus to the
  surviving fallback ancestor/parent row, otherwise the destination column
  heading. It never reverses fallback or reopens placement.

### Dismissal, Lifetime, And Motion

- Per-column new counts last until their own `Show new`, authoritative top
  observation, that column closes/path changes, or Inbox route exit/reload.
  Scratch, theme, and light/dark changes preserve counts for columns that stay
  open. There is no timer or shared cross-column count.
- A fallback/selection/stale-placement strip lasts until `Dismiss`, the next
  authoritative fallback, an explicit user path selection/change, or Inbox
  route exit/reload. Scratch, theme, and light/dark changes preserve it. It
  never auto-dismisses.
- Indicator, strip, column removal, fallback, scroll anchoring, scroll request,
  and focus handoff are immediate. There is no fade, slide, scale, spinner,
  pulse, ping, bounce, blink, flicker, or layout-transition animation. Reduced
  motion uses identical geometry, copy, controls, timing, focus, and lifetime.

### Eight-Theme Mapping

All themes preserve the same full labels, semantic tree, count meaning, exact
copy, fallback, actions, focus, lifetime, anchoring, and static motion. Only
Explorer-owned role realization changes:

| Theme | Exact realization mapping |
|---|---|
| GridDO | Compact column-label count chip and restrained technical strip using canonical border, muted, primary, text, action, and focus roles. |
| Tiny Desk | Library-index count tab and catalog-paper status slip attached below the destination column label. |
| Neumorphism | Named raised count control and shallow inset column notice within the existing column-shadow family. |
| Claymorphism | Puffy non-color marker and shape-preserving soft ribbon attached to the destination clay column. |
| Origami | Folded count tab and seam-attached paper strip with no ghost fold or repeated motion. |
| Terminal | Variable-driven text count command and static destination-column status record; no fixed JSX color or blink. |
| Retro Mac | Hard counter control and in-pane 1-bit system message below the full label; no new window or ghost pane. |
| Graphite | Compact editorial index and strengthened-rule column note with restrained monochrome action. |

Task 150 alone consumes this realization in `HierarchyExplorer`, app-session
Explorer state, centralized copy, tests, theme CSS, and its verification
artifact over Tasks 128 and 134. It changes no path/fallback semantics,
stable-ID/offset algorithm, product mutation, Pool/Staging family, placement
implementation, or `VQ-07` search body.

## Theme Realizations

### GridDO

- Observed source-only: Explorer header is `h-12`; four columns use `grid-cols-4 gap-[1px] bg-border p-[1px]`; column headers use full labels and bordered separators; target states declare subtle primary and unavailable overlays.
- Adopted fact: crisp product grid, technical headers, and primary target cues are supported.
- Token implication: Explorer header, column, level label, Node row, Bit row, eligible target, and invalid target need semantic roles.

### Tiny Desk

- Observed source-only: header reads `Library Index`; columns use paper backgrounds and thin warm separators; level labels use brown mono/serif treatment; invalid targets declare a paper warning card.
- Adopted fact: library index cards and paper columns are supported.
- Token implication: index header, paper column, level tab, and warning-paper roles need Tiny Desk aliases.

### Neumorphism

- Observed source-only: header reads `Grid Explorer`; columns are four separated `20px` soft plates with inset/raised shadow variants; full labels are uppercase tracked text; invalid overlays use a soft inset status card.
- Adopted fact: discrete soft columns with shadow-led hierarchy are supported.
- Token implication: column plate, selected level, card rows, and invalid inset status consume existing shadow variables; rendered depth is unverified.

### Claymorphism

- Observed source-only: `h-16` header and padded four-column body consume `--clay-hierarchy-bg`; columns use rounded clay surfaces, bold full-level labels, and shape-led Node/Bit rows. Invalid source overlays use a rounded clay alert.
- Adopted fact: large tactile columns and bold level identity are supported.
- Token implication: hierarchy well, column object, level label, type rows, and invalid state need clay aliases.

### Origami

- Observed source-only: dashed paper header and one-pixel four-column seams use folded/faceted paper; level labels are small uppercase mono; a dashed cut-paper warning is declared.
- Adopted fact: folded columns, dashed seams, and paper warnings are supported.
- Token implication: paper column/seam/label/warning roles are valid; keyboard-grab bar and pulses are excluded.

### Terminal

- Observed source-only: header reads `GRID EXPLORER`; four console columns are separated by foreground-tinted lines; level labels and target statuses are text-led; invalid state declares a red-framed console error.
- Adopted fact: framed console columns with explicit textual status are supported.
- Token implication: terminal column/label/target/error roles must be variable-driven and include non-color cues.

### Retro Mac

- Observed source-only: striped title bar reads `Finder`; four columns are one-pixel black-separated white panes; full level names are declared; invalid state uses dither plus a double-border system message.
- Adopted fact: Finder panes, striped chrome, dithered unavailable state, and hard system alert are supported.
- Token implication: pane, level header, dither state, and alert roles need Retro Mac aliases.

### Graphite

- Observed source-only: `h-14` header reads `Grid Explorer`; columns use fine `0.5px`/one-pixel grayscale rules, bold full labels, restrained rows, and a monochrome bordered invalid message.
- Adopted fact: precise drafting columns and restrained monochrome targeting are supported.
- Token implication: graphite header/column/rule/label/invalid roles should consume semantic grayscale variables.

## Exclusions And Verification

- Excluded: the entire `VQ-07` replacement body, any Explorer status outside `DP-VQ06-EXPLORER`, active-column search behavior/visual body, global Search fallback, route-local filtering, mock placement, keyboard-grab UI, repeated pulse/blink, abbreviated labels, and Pool/Staging realization.
- No four-column composition, column clipping, scroll behavior, invalid distinction, card density, focus-visible state, search mode, reveal, contrast, or responsive behavior was rendered or verified.
