# Inbox/Triage Scratch Pool — Visual Recipe

> Status: **Proposed — recipe-package user gate pending**
> Verification: **source-only; no rendered route/state was checked**
> Production owner: `ScratchPool`, `useInbox`, and session-state owner (`LAND-POOL`, `LAND-SESSION`)

## Authority And Source Regions

- Product authority: [`DECISION.md`](../brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/DECISION.md) lines 150–278.
- Approved boundary: [`PROMOTION_MAP.md`](../brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/PROMOTION_MAP.md) §§10.1, 11.2, and 11.3.
- Design Source root: `/Users/jwk/Documents/griddo2-claude-themes2-3`.
- Pool regions: GridDO `page.tsx:998-1121`; Tiny Desk `:1271-1395`; Neumorphism `:887-1036`; Claymorphism `:807-936`; Origami `:1276-1398`; Terminal `:841-937`; Retro Mac `:853-985`; Graphite `:976-1096` in their respective Design Source route directories.
- Shared theme values: Design Source `src/app/themes.css:1-439`.

## Shared Adopted Contract

- Expanded Pool reads as one tools region above one list. Identity, all-active count, collapse, title search, and created-at sort belong together; search and sort share a row.
- The header/collapsed count always means all active Scratches. Filtered result count is separate and only appears while searching.
- Expanded rows keep title and created-at metadata. Collapsed controls are vertical in identity/count → toggle → switchers order, with accessible names and non-color-only selected distinction.
- Search and sort are absent from collapsed presentation, and no hidden filter is applied to compact switchers or total count.
- Scrollbar chrome is hidden while wheel, trackpad/touch, and keyboard scrolling remain.
- Pool labels observed as `Scratches` in Claymorphism and Origami are source facts only; the adopted semantic visible identity remains `Scratch Pool` because no alternate Pool name was selected.

## Decision-Prerequisite Boundary

- `VQ-01` — external Scratch removal modal is an absent replacement surface. It is wholly excluded: generic dialogs, archive UI, and Pool chrome are not fallbacks. **User-owned Decision prerequisite:** supply or approve that realization, or explicitly scope it out. Future owner: the Pool execution phase; resume its dependent UI task only after a matching user receipt.
- Pool subset of `VQ-06` — hidden-selection and remote/path status appearance may use only the shared semantic-state envelope: state attributes, existing semantic/theme tokens, visible text/icon/non-color cues, and selected focus/accessibility behavior. Exact copy, placement, layout, effect, duration, and per-theme values remain a **user-owned non-code Decision prerequisite**. Future owner: Pool recipe/canonical token owner and Pool execution phase; resume exact styling only after a matching receipt.

## Theme Realizations

### GridDO

- Observed source-only: expanded width is `w-72`, collapsed `w-16`; header uses a primary count badge; the search input is `h-7` with joined sort control, and the list hides scrollbar chrome. Selected rows declare a primary-tinted surface and compact collapsed markers.
- Adopted fact: clean dashboard tools, exact total count, title/time rows, and primary technical selection are supported.
- Token implication: Pool tool field, count badge, selected row, compact switcher, and hidden-scroll viewport need semantic roles.

### Tiny Desk

- Observed source-only: a dark wood header uses `#5d3a1a`/`#fdfcf0`; search is an inset dark-wood field, rows switch between light paper and wood, and the selected compact marker uses `#8b5e3c`. The route declares title/date rows and scrollbar hiding.
- Adopted fact: wood-header plus paper-list grammar and pin/bar-like compact selection are supported.
- Token implication: consume Tiny Desk base variables and add wood-header/paper-row aliases; literal copy and route state are not adopted.

### Neumorphism

- Observed source-only: width transitions between `w-72` and `w-16`; search uses `h-9 rounded-full` with `--theme-shadow-inset`; sort is a two-position `112px` inset capsule with a `50px` raised thumb; rows use `18px` radius and card/inset shadows.
- Adopted fact: inset tools and raised selected list/switcher surfaces are supported.
- Token implication: Pool search well, segmented sort, selected row, and compact indicator should consume the existing neumorphic shadow variants.

### Claymorphism

- Observed source-only: source heading text is `Scratches` (not adopted); search uses `h-9 rounded-2xl`, `--clay-search-bg`, and inset shadow; selected rows use `--clay-primary-*`, unselected rows use `--clay-unselected-*`; the list hides scrollbar chrome.
- Adopted fact: puffy count badge, soft search well, and shape/weight-based selected distinction are supported.
- Token implication: use clay primary/unselected roles while retaining canonical `Scratch Pool` semantics.

### Origami

- Observed source-only: source heading text is `Scratches` (not adopted); header is a paper gradient; search uses a white dashed field, asymmetric fold radius, and the sort control declares `▴ ASC`/`▾ DESC`; rows use asymmetric folded rectangles.
- Adopted fact: dashed paper controls and folded row/switcher geometry are supported.
- Token implication: paper field, dashed divider, folded selected row, and compact fold marker need theme aliases.

### Terminal

- Observed source-only: `TerminalPanel` title is `Scratch Pool` when expanded and `IN` when collapsed; search is a bordered transparent command field; sort is `/O:S ▲` or `/O:-S ▼`; rows are framed terminal records with title/time.
- Adopted fact: console command/record grammar is supported, while `IN` is only compact source copy and not a new semantic name.
- Token implication: terminal Pool states should consume foreground/border variables; no hard-coded green/orange is placed in product components.

### Retro Mac

- Observed source-only: striped Finder-style title bar reads `Scratch Pool`; `FIND:` precedes a `h-5` inverted-on-focus field; a classic column/button row exposes sort; rows use black/white selected inversion and a hard marker.
- Adopted fact: 1-bit window tools and non-color-only inversion/marker selection are supported.
- Token implication: striped chrome, field inversion, and hard switcher indicator belong in Retro Mac theme CSS.

### Graphite

- Observed source-only: a dark Pool surface reads `Scratch Pool`; `FLTR:` precedes a zinc field; sort displays a red `⊕` plus `ASC`/`DESC`; selected rows use white-on-dark and compact markers.
- Adopted fact: dense editorial tools, drafting labels, and monochrome selected rows are supported.
- Token implication: dark Pool header/list, graphite field, and selected marker require shared semantic roles.

## Exclusions And Verification

- Excluded: `VQ-01`, unsupported Pool statuses beyond the shared `VQ-06` envelope, fold-lock review control, source selection persistence, route-local search/sort behavior, copied strings, and any source behavior conflicting with the selected session lifecycle.
- No rendered selected/hidden/empty/collapsed state, count meaning, focus path, text fit, contrast, scrolling, or transition was verified. All exact class/color/size statements above are source declarations only.
