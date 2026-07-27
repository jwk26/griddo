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
- Explorer subset of `VQ-06` — remote/path status appearance may use only state attributes, existing semantic/theme tokens, visible text/icon/non-color cues, and the selected focus/accessibility contract. Exact copy, placement, layout, effect, duration, and per-theme values remain a **user-owned non-code Decision prerequisite**. Future owner: Explorer recipe/token owner and realtime phase; resume exact status styling after receipt.

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

- Excluded: the entire `VQ-07` replacement body, exact `VQ-06` statuses beyond the shared envelope, active-column search behavior/visual body, global Search fallback, route-local filtering, mock placement, keyboard-grab UI, repeated pulse/blink, and abbreviated labels.
- No four-column composition, column clipping, scroll behavior, invalid distinction, card density, focus-visible state, search mode, reveal, contrast, or responsive behavior was rendered or verified.
