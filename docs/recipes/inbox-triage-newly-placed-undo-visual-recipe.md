# Visual Recipe: Inbox / Triage Newly Placed And Undo

> Source: `griddo2-claude-themes2-3` at
> `4f39709688ceb4cac5e15d4e3502186b1f1c801b`
> Structural baseline: `DECISION.md` sections `Grid Explorer And Placement > Newly Placed State`
> and `Undo`
> Date: 2026-07-18
> Status: Approved
>
> Scope: static Newly Placed marker layered onto existing Node/Bit cards and its trailing Undo
> control.

## Extraction Method

- Read the confirmed Node and Bit branches in all eight Grid renderers.
- Preserve each base card exactly; extract only marker, outline/background, shadow, and Undo layers.
- Remove all repeating pulse/blink effects while retaining non-motion cues.

## Source Files

| Alias | Relevant component / region |
|---|---|
| `P-griddo` | `HierarchyItem`, `362-479` |
| `P-tiny-desk` | `HierarchyItem`, `340-462` |
| `P-neumorphism` | `HierarchyNodeRow` / `HierarchyBitRow`, `275-390` |
| `P-claymorphism` | Grid Node/Bit branches, `1490-1625` |
| `P-origami` | `HierarchyItem`, `554-670` |
| `P-terminal` | Grid Node/Bit branches, `1501-1604` |
| `P-retro-mac` | Grid Node/Bit branches, `1573-1679` |
| `P-graphite` | `HierarchyItem`, `298-410` |

## Visual Facts

### Layout Hierarchy

```text
existing Node or Bit card
  existing icon and title structure
  static Newly Placed marker/treatment
  trailing Undo control
```

No wrapper card, checkbox indicator, `Node: ...` text card, or duplicate record is introduced.

### Theme Realizations

| Theme | Static marker/treatment | Undo |
|---|---|---|
| GridDO | sky `size-1.5` dot, `NEW` tag, `border-sky-400`, low blue glow | `RotateCcw size={12}` in compact neutral hover button |
| Tiny Desk | amber `size-2` fastener plus full-height yellow right paper tab | brown `RotateCcw size={12}` with paper hover, before tab margin |
| Neumorphism | blue `size-2` soft bulb, `NEW` badge, combined raised/blue glow shadow | raised circular `RotateCcw` button that presses inward on hover/active |
| Claymorphism | sky `size-2` LED, small `NEW` tag, primary border and soft blue-violet glow | rose circular `RotateCcw size={10}` in inset-xs well |
| Origami | amber top-left triangular folded corner and strengthened paper border | rose `RotateCcw size={10}` paper control |
| Terminal | green `[new]` tag, green border and static terminal glow | red `[UNDO]` command button |
| Retro Mac | black `[NEW]` tag, hard border/shadow or dithered edge | bordered `[UNDO]` System 7 button with `1px` hard shadow |
| Graphite | black `NEW` tag, thin zinc border and restrained shadow | `RotateCcw size={8}` plus `Undo` text in thin editorial button |

Node and Bit receive the same semantic marker family while retaining their original card geometry,
padding, radius, color, icon, and internal Node/Bit differences.

### Selected Plus Newly Placed

| State | Realization |
|---|---|
| Selected only | existing filled/inset/inverted selected treatment |
| Newly Placed only | base card plus marker, static outline/background/shadow, and Undo |
| Selected + Newly Placed | selected treatment remains dominant; marker and Undo remain visible above it |

Bracket decorations present in some source branches are optional theme detail; they may not replace
the persistent marker and Undo distinction.

### Interaction And Lifecycle

| Interaction | Required behavior |
|---|---|
| Placement success | actual Node/Bit card appears at top of its type group and receives focus |
| Column or Scratch switch | state remains Newly Placed |
| Search mode | item appears in results with marker and Undo when the search realization is built |
| Route exit | marker and Undo end; actual record remains as a normal card |
| Undo from Staging source | remove result and restore candidate/source row to Staging state |
| Undo from direct row | remove result and restore source row to active Breakdown |
| Node click | navigation/select remains separate from Undo through event isolation |

## Realization Decisions

### Adopted

- Keep the existing Node/Bit card component and layer only the theme treatment above.
- Keep marker and Undo visible for every locally confirmed placement during the mounted
  Inbox/Triage page session.
- Keep multiple Newly Placed items simultaneously and pin them above ordinary items within their
  Node or Bit group, newest placement first.
- Preserve the source-specific marker language in the table.

### Removed

- Every source `animate-pulse` and `animate-gentle-pulse` class is removed.
- Tiny Desk's pencil glyph and any emoji-like marker are removed; the paper tab and fastener are
  sufficient non-text cues.
- Temporary placed indicator cards, checkboxes, and duplicate wrapper cards are removed.
- Scratch-switch reset, reload restoration, and persistent DB flags are removed.
- Prototype test-mode mock injection and numbered variants are removed.

### Improved

- All marker treatments are static: keep source border, glow, tab, fold, tag, or shadow without
  repeating animation.
- Undo receives an accessible name that includes item type/title and source restoration outcome.
- Actual record ID and placement operation ID back the page-level transient projection; title
  matching is not used.
- Remote/session-external records render as normal cards and never receive local Undo.

## Token Contract Implications

| Token / contract area | Required rule | Source evidence |
|---|---|---|
| Newly Placed marker | static per-theme marker independent from selected fill | eight source branches |
| Newly Placed surface | outline/background/shadow may vary, but base card geometry cannot | DECISION and card components |
| Undo slot | trailing control has stable dimensions and theme surface | eight Undo controls |
| State composition | selected, newly placed, and selected+newly placed remain distinguishable | selected/new branches |
| Attention motion | no repeat pulse/blink; focus/reveal motion respects reduced motion | DECISION `Theme Realization` |

## Execution Handoff

Tasks must test Node and Bit, selected overlap, multiple placements, Scratch/column switching,
search projection, route exit, both Undo source paths, and event isolation. Visual checks must prove
that the base Node/Bit card did not change shape.

## Open Questions

- None.
