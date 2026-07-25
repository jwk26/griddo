# Visual Recipe: Inbox / Triage Grid Explorer

> Source: `griddo2-claude-themes2-3` at
> `4f39709688ceb4cac5e15d4e3502186b1f1c801b`
> Structural baseline: `DECISION.md` section `Grid Explorer And Placement`, especially
> `Scratch Switch Grid Context`, `Route And Reload Grid Context`, and `Header And Search Mode`
> Date: 2026-07-18
> Status: Approved
>
> Scope: normal four-column Explorer shell, column chrome, selected state, and scroll containment.
> Search-result realization is deliberately excluded.

## Extraction Method

- Extract the normal four-column mode and theme-specific Explorer chrome from the pinned source.
- Do not adopt the prototype's active-column filtering; the decided search is a whole-hierarchy
  mode whose result UI remains a phase-local decision prerequisite.
- Keep theme display names as copy realization, not reusable tokens.

## Source Files

| Alias | Region |
|---|---|
| `P-griddo` | `1504-1774` |
| `P-tiny-desk` | `1633-1909` |
| `P-neumorphism` | `1404-1679` |
| `P-claymorphism` | `1323-1687` |
| `P-origami` | `1715-2035` |
| `P-terminal` | `1330-1710` |
| `P-retro-mac` | `1379-1756` |
| `P-graphite` | `1439-1743` |

## Visual Facts

### Layout Hierarchy

```text
Grid Explorer
  one visible header row
    theme display label
    path / search-mode entry region
  four equal-width columns
    Home
    Level 1
    Level 2
    Level 3
  each column
    column heading
    independently scrollable Node list and Bits subsection
```

### Theme Realizations

| Theme | Display label | Header / columns | Selected Node |
|---|---|---|---|
| GridDO | `Grid Explorer` | compact `h-12`-class header; four `bg-card p-4` columns with thin dividers | `border-primary bg-primary/10 text-primary font-bold` |
| Tiny Desk | `Library Index` | paper/wood index header; four `bg-[#fdfcf0] p-3` columns | brown `border-[#8b5e3c] bg-[#8b5e3c]/10` treatment |
| Neumorphism | `Grid Explorer` | raised header and four radius-`20px` inset column wells | `shadow-[var(--theme-shadow-inset)]` rather than a filled rectangle |
| Claymorphism | `Grid Explorer` | `h-16` puffy header; four radius-`24px` clay columns | clay primary fill, primary shadow, and stable Chevron slot |
| Origami | `Grid Explorer` | dashed paper header and four faceted paper columns | paper inset/fold treatment with asymmetric radius |
| Terminal | `GRID EXPLORER` | one monospace path/search row; four square columns separated by foreground lines | foreground/background inversion and command marker |
| Retro Mac | `Finder` | striped System 7 title bar and four Finder-like panes | black/white invert block |
| Graphite | `Grid Explorer` | `border-[0.5px]` header and four white `p-5` editorial columns | `bg-zinc-900 text-white` |

The accessible and semantic name is always `Grid Explorer`, even when the visible theme alias is
`Library Index`, `Finder`, or uppercase terminal copy.

### Column Labels And Content

| Element | Required value |
|---|---|
| Column labels | `Home`, `Level 1`, `Level 2`, `Level 3` |
| Selected title duplication | none below the column heading |
| Node row | existing theme Node card/row with selection and Chevron/navigation slot |
| Bit row | existing theme Bit row in its Bits subsection |
| Column scroll | `min-h-0 flex-1 overflow-y-auto pb-4` with hidden scrollbar chrome |
| Locked column | dimmed/recessed using theme surface; label remains unchanged |

### Spacing And Sizing

| Theme | Column padding | Typical list gap |
|---|---:|---:|
| GridDO | `p-4` | `gap-1.5` |
| Tiny Desk | `p-3` | `gap-1` |
| Neumorphism | `p-3`, list `p-2` | `space-y-3` |
| Claymorphism | theme column padding and list `pr-1` | `gap-2` |
| Origami | paper column padding | compact paper rows |
| Terminal | `p-2` | `space-y-1` |
| Retro Mac | `p-2` | `gap-1` |
| Graphite | `p-5` | `gap-1` |

### Interaction And Motion

| Interaction | Required realization |
|---|---|
| Node click | updates the selected path and opens the next column without leaving Inbox/Triage |
| Bit reveal | scrolls inside its owning column and uses a non-timed reveal highlight |
| Scratch switch | preserves path, selected chain, open columns, and column scroll |
| Route return | restores valid page-session path/scroll; reload starts at Home |
| Realtime data | preserves first visible-card anchor and focus where possible |
| Search open | replaces all four columns with a dedicated body; no columns remain visible beneath it |

## Realization Decisions

### Adopted

- Keep the four-column normal-mode composition and the eight theme-specific column materials.
- Keep full column labels and remove duplicate selected-node metadata.
- Keep per-column scrolling and hidden scrollbar chrome.
- Keep visible display aliases above while preserving `Grid Explorer` as semantic/a11y identity.
- Keep selected treatment distinct from Newly Placed treatment.

### Removed

- The prototype's active-column-only filtering and dimming are removed.
- The current inline scoped-search input, its magnifier decoration, and any prototype search result
  rows are not promoted as the whole-hierarchy search realization.
- Origami's `H1-L4` tag and other abbreviated hierarchy labels are removed.
- Terminal's extra upper `[grid] node:nav/write` row is removed; only one header/path/search row
  remains.
- Numbered visual-variant switchers and test mode are removed.

### Improved

- Search becomes a dedicated full-body mode with whole-hierarchy scope, but its exact user-facing
  result layout must be approved before implementation and is not invented in this recipe.
- Locked and invalid states keep original column labels visible; no warning replaces `Home` or
  `Level 1-3`.
- Column scroll anchoring and route-session restoration use stable IDs rather than prototype local
  array position.

## Token Contract Implications

| Token / contract area | Required rule | Source evidence |
|---|---|---|
| Explorer chrome | theme maps one header and one column surface grammar | eight Grid regions |
| Column label | full-name typography and divider treatment map per theme | column headers |
| Selected Node | selected background/depth is independent from Newly Placed marker | hierarchy item components |
| Column scroll | fixed viewport with hidden chrome and stable bottom padding | `data-placement-scroll` containers |
| Visible alias | copy realization belongs to SPEC/locale, not token names | `Library Index`, `Finder`, terminal label |

## Execution Handoff

Normal-mode tasks must match this recipe. The execution plan must include a separate, user-gated
task for whole-hierarchy search-result realization before implementing search UI.

## Open Questions

- Whole-hierarchy search-result visual layout, row density, duplicate indicator placement, and
  loading/error realization remain a phase-local decision prerequisite.
