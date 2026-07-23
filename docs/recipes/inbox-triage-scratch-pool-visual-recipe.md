# Visual Recipe: Inbox / Triage Scratch Pool

> Source: `griddo2-claude-themes2-3` at
> `4f39709688ceb4cac5e15d4e3502186b1f1c801b`
> Structural baseline: `DECISION.md` section `Scratch Pool`, especially `Expanded Structure`,
> `Collapsed Structure`, `Collapse Interaction`, and `Search Lifecycle`
> Date: 2026-07-18
> Status: Approved
>
> Scope: Scratch tools, list, selection, and collapsed switcher realization.

## Extraction Method

- Extract exact widths, tool-row dimensions, list spacing, selection treatments, and motion values.
- Keep main's selection/collapse lifecycle when it conflicts with prototype focus behavior.
- Treat search and sort as one tools row above the list; the icon/count/toggle and tools remain one
  coherent upper section separated from the list by a divider.

## Source Files

All paths use `src/app/prototype/inbox-triage-<theme>/page.tsx` at the pinned commit.

| Alias | Region |
|---|---|
| `P-griddo` | `1001-1120` |
| `P-tiny-desk` | `1274-1401` |
| `P-neumorphism` | `887-1039` |
| `P-claymorphism` | `810-942` |
| `P-origami` | `1279-1404` |
| `P-terminal` | `844-940` |
| `P-retro-mac` | `856-991` |
| `P-graphite` | `979-1102` |

## Visual Facts

### Layout Hierarchy

```text
Scratch Pool
  upper tools section
    icon + visible count + explicit collapse/expand control
    expanded only: search + sort on one row
  divider
  scratch list / collapsed vertical switcher
```

### Theme Realizations

| Theme | Header and tools | List / selected item | Collapsed realization |
|---|---|---|---|
| GridDO | `p-3 border-b bg-muted/10`; search and sort `h-7`; sort uses `ArrowUpDown` active/inactive treatment | list `p-2 gap-2`; item `rounded-md p-3`; selected `bg-primary/5 border border-primary/20 shadow-sm` | `64px`; icon/count, toggle, then switcher vertically; active bar `h-8 w-1.5` |
| Tiny Desk | warm paper/wood header; search `h-7`; serif `A-Z` / `Z-A` sort | paper items; selected `bg-[#fdfcf0] shadow-md` | `64px`; `size-8 rounded-full` paper pin control and inner dot `bg-[#8b5e3c]` |
| Neumorphism | icon/count in inset wells; search `h-9 rounded-full shadow-[var(--theme-shadow-inset)]`; sort track `h-9 w-[112px]` | item radius `18px`; selected is inset, inactive is raised | `w-16`; fixed `size-3` inset dots and one `w-2 h-8` raised active slider |
| Claymorphism | `p-4 border-b`; search `h-9 rounded-2xl`; puffy sort `h-9 px-4 rounded-[20px]` | list `p-4 gap-4`; items `rounded-[24px] p-4`; selected uses clay primary fill/shadow | `100px`; icon/count and `ClayButton` stack vertically; dot remains inside the existing card |
| Origami | dashed divider, paper gradient; search `h-7`; asymmetric sort button with text `ASC/DESC` | list `p-2 gap-1.5`; selected white dashed paper with `shadow-sm` | `64px`; icon/count and toggle stack; selected switcher is a rotated square marker |
| Terminal | bracketed panel header; tool area `p-3`; sort prompt and regex input both `h-6` | list `p-2`; monochrome rows | `80px`; `IN` panel title, icon/count, and `[>]` control form a vertical stack |
| Retro Mac | striped title bar, `FIND:` input `h-5`; separate `Date Created` sort row `h-6` | list `p-2 gap-1`; selected row is black with white text | `48px`; Inbox/count and bordered Chevron control stack vertically |
| Graphite | dark header `p-4`; filter `h-6`; sort is `h-6` with red crosshair and `ASC/DESC` | list `p-3 gap-2`; selected `bg-zinc-800 border-zinc-700` | `72px`; icon/count and toggle stack; selected dot `size-1.5 bg-white` |

### Color And Typography

| Theme | Label / count | Search / sort typography |
|---|---|---|
| GridDO | `text-sm font-black uppercase tracking-wider`; compact count | search and sort `text-[10px]` to `text-xs` |
| Tiny Desk | brown `#5d3a1a` / `#8b5e3c`, serif label | compact warm serif/mono controls |
| Neumorphism | zinc scale, circular inset count | uppercase `text-[9px]` to `text-[10px]` |
| Claymorphism | black uppercase label, clay token count | `text-[10px] font-black uppercase` sort |
| Origami | HSL paper neutrals, `tracking-widest` | `text-[9.5px] font-bold` |
| Terminal | foreground variable on black | `text-[8.5px]` prompt sort, `text-[10px]` regex input |
| Retro Mac | black/white System 7 contrast | `text-[9px] font-bold uppercase` |
| Graphite | zinc monochrome, tight tracking | `text-[8.5px] font-mono` sort |

### Interaction And Motion

| Interaction | Exact source behavior | Adoption note |
|---|---|---|
| Width transition | GridDO spring `300/30`; Neumorphism `duration-300 ease-out`; Clay `580/38`; Terminal/Retro/Graphite `duration: 0` | retain theme motion character within shared collapse contract |
| Sort | one explicit click toggles asc/desc and exposes a visible active mode | retain; selected/unselected must not rely only on hover |
| Search | clear control appears only with a non-empty query | retain |
| Selection | each theme changes at least background/surface plus a marker, border, or depth cue | retain; do not reduce to one shared opacity |
| Scroll | every list has `overflow-y-auto` plus hidden scrollbar chrome utilities | retain |

## Realization Decisions

### Adopted

- Keep tools and list as two structural regions: one upper tools section and one lower list section.
- Keep search and sort on the same expanded row.
- Keep icon, item count, explicit open/close control, and conversion switcher vertically ordered in
  collapsed mode.
- Preserve theme-specific selected cues and compact counts.
- Preserve per-theme width and interaction timing values above unless canonical responsive work
  requires a narrower breakpoint adaptation.

### Removed

- `onFocus` or generic click that immediately collapses the pool is removed. Collapse belongs to
  the explicit control and the DECISION's first-printable-key ownership rule.
- Sidebar fold-lock/unlock and test controls are development-only and are not promoted.
- Numbered prototype variant switchers are not promoted.

### Improved

- Collapsed layouts must keep all controls legible and vertically separated; no full-width selected
  strip may obscure the inner dot or marker.
- Repeating pulse or blink on the active collapsed marker is replaced by the same static marker,
  border, or depth treatment.
- Search collapse preserves query/result state according to the DECISION instead of clearing it as
  a presentation side effect.

## Token Contract Implications

| Token / contract area | Required rule | Source evidence |
|---|---|---|
| Scratch width | expanded and collapsed widths are theme mappings with a stable collapsed control column | eight width pairs above |
| Tool sizing | compact search/sort heights map to theme density (`24px`, `28px`, or `36px`) | source tool rows |
| Selected scratch | each theme maps surface, marker, border/depth, and foreground together | selected list classes |
| Collapsed switcher | stable marker dimensions prevent layout shift | GridDO bar, Tiny pin, Neumorphism slider, theme dots |
| Sort state | active and inactive states require persistent non-hover distinction | all eight sort controls |

## Execution Handoff

Acceptance criteria must cover expanded and collapsed modes, preserved query state, explicit
collapse ownership, selected-state visibility, one-row search/sort, hidden scrollbar chrome, and
keyboard/focus equivalence.

## Open Questions

- None.
