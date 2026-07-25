# Visual Recipe: Inbox / Triage Selected Scratch Context

> Source: `griddo2-claude-themes2-3` at
> `4f39709688ceb4cac5e15d4e3502186b1f1c801b`
> Structural baseline: `DECISION.md` section `Breakdown > Selected Scratch Context` and
> `Completion And Archive > Cancel And Reopen`
> Date: 2026-07-18
> Status: Approved
>
> Scope: the signature context section above Breakdown rows, including title, time, Edit, sort,
> and its completed-state handoff.

## Extraction Method

- Extract the confirmed context realization from each route, not discarded variant concepts.
- Separate the normal selected context from the completed-state treatment; completed details are
  cross-referenced to the archive recipe.
- Preserve the section as a sibling above rows, never as decoration inside a Breakdown row.

## Source Files

| Alias | Region |
|---|---|
| `P-griddo` | `1135-1192` |
| `P-tiny-desk` | `1419-1442` |
| `P-neumorphism` | `1047-1108` |
| `P-claymorphism` | `950-1002` |
| `P-origami` | `1412-1464` |
| `P-terminal` | `950-1017` |
| `P-retro-mac` | `1000-1075` |
| `P-graphite` | `1110-1165` |

## Visual Facts

### Layout Hierarchy

```text
Breakdown section header
Selected Scratch Context
  identity / theme-specific ornament
  selected Scratch title
  created time
  Edit control
  row sort control
Breakdown row list
```

The context is deliberately larger than a row and visually separated from the list. Its source
heights are generally `min-h-[110px]` or equivalent `py-7` composition.

### Theme Realizations

| Theme | Context surface | Identity and type | Controls |
|---|---|---|---|
| GridDO | `mx-3 my-2 py-7 px-1 min-h-[110px] rounded-lg border border-primary/10`; left-to-right primary tint and `shadow-[0_4px_20px_rgba(var(--primary-rgb),0.03)]` | compact technical label; bold title and created time | right-aligned `size-7` Edit and sort controls |
| Tiny Desk | `py-7 pr-4 pl-8 bg-[#fdfcf5] border-2 border-[#8b5e3c]/40`; paper shadow | repeating top strip, blue `20px` rule grid, red vertical margin line; italic `text-lg font-black` title; mono date | enlarged desk-themed Edit and sort controls |
| Neumorphism | `mx-3 my-3 px-4 py-7 min-h-[110px] bg-[var(--page-bg)] shadow-[var(--theme-shadow-inset)]`; radius `30px` | inset identity well; `text-base font-extrabold`; time `text-[10px] uppercase tracking-[0.14em]` | raised circular Edit; `h-8 w-[64px]` inset sort track with raised inner control |
| Claymorphism | wrapper `px-6 py-3`; inner `p-7`, radius `36px`, pale blue fill, white `border-2`, three-part inset/outset shadow | top white sheen arc; `text-[9px] tracking-[0.25em]`; `text-base font-black` title; mono sculpted time | ghost `Wand2` Edit and `h-9 rounded-[20px]` puffy sort |
| Origami | `mx-3 my-2 py-7 px-3`; square `borderRadius: 0`; paper border plus dashed lower edge | hanging-tag label, `text-[17px] font-black` title, `FILE_TIME` mono line | asymmetric paper Edit and `h-7` crease-line sort |
| Terminal | wrapper `p-3`; inner black editor `min-h-[110px] border border-[var(--foreground)]/40 p-3` | numbered source lines, blue comment, yellow title assignment `text-[13.5px]`, purple stamp; editor status row | `[F2_EDIT]` and persistently yellow `[F3_SORT]` command controls |
| Retro Mac | wrapper `p-4.5`; inner white dialog `p-5 border-[4px] border-black` with `borderStyle: double` | black mini title bar, folder icon, path, `text-[13px]` title, `LAST_STAMP` | `size-5` bordered Paintbrush and yellow classic sort button |
| Graphite | `mx-3 my-2 p-7 rounded-md border-[0.5px] bg-zinc-50 border-zinc-200` | mono registry label, `font-serif text-base font-black` title, `text-[9px]` timestamp | `size-8` Eraser and `h-6` dark sort with red crosshair |

### Borders, Radius, Shadows

| Theme family | Distinguishing construction |
|---|---|
| GridDO / Graphite | thin technical border, restrained radius, low-amplitude shadow |
| Tiny Desk / Retro Mac | physical paper or dialog border with printed rules/stripes |
| Neumorphism | inset context body plus raised controls; border is subordinate to depth |
| Claymorphism | `36px` puffy body, white edge, inner highlight and soft outer lift |
| Origami | square silhouette, asymmetric paper control radii, dashed crease edge |
| Terminal | zero-radius editor frame and color-coded monospace syntax |

### Interaction And Motion

| State / interaction | Exact source behavior | Adoption note |
|---|---|---|
| Edit | theme-specific icon button remains visible | retain; production adds real inline-edit behavior from DECISION |
| Sort | persistent asc/desc state, not hover-only | retain |
| Completion | source changes title/meta, dims or strikes title, and adds theme marker | visual mechanism retained; repeated pulse/bounce removed |
| Context size | fixed padding/minimum height prevents row-like appearance | retain |

## Realization Decisions

### Adopted

- Render Selected Scratch Context immediately below the Breakdown chrome and above the row list.
- Always include selected title, created time, Edit, and row asc/desc control.
- Preserve each confirmed theme realization and its approximately `2-2.5x` row-level visual
  prominence.
- Keep normal and completed states in the same context surface; completed state changes its
  treatment rather than replacing it with a new generic card.

### Removed

- Remove selected Scratch title/meta duplicated in the Breakdown section heading.
- Remove prototype variant switchers and labels such as `V1`, `V2`, or internal ticket IDs.
- Do not promote decorative emoji from prototype empty/completion states.

### Improved

- Source `animate-pulse`, `animate-bounce`, and repeated status animation in completed contexts are
  replaced by static stamps, labels, line treatment, depth, or contrast from the same theme.
- Edit controls receive production inline-edit state, validation, save-before-next-action, and
  accessible names without changing the confirmed visual shell.
- Context copy is locale-owned; source English strings are evidence, not hard-coded production
  copy.

## Token Contract Implications

| Token / contract area | Required rule | Source evidence |
|---|---|---|
| Signature context scale | context padding/min-height must remain visibly larger than a row | `py-7`, `p-7`, `min-h-[110px]` across routes |
| Context surface | each theme maps fill, border/radius, shadow/depth, and ornament as one recipe | eight confirmed variants |
| Context typography | label, title, and time use distinct levels; title is the dominant line | source title/meta classes |
| Context controls | Edit and sort align as one stable right-side control group | all eight contexts |
| Completion treatment | static theme-specific completion marker layers onto the same context | completed branches in all routes |

## Execution Handoff

Tasks must reference this recipe plus the archive recipe. Acceptance criteria include section
separation from rows, title/time presence, functional Edit and sort, locale-owned copy, completed
state continuity, and no repeating attention animation.

## Open Questions

- None. Neumorphism's proposed water-lens sort control has no final source and remains outside this
  promotion.
