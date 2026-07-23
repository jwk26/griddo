# Visual Recipe: Inbox / Triage Workspace Shell And Section Chrome

> Source: `griddo2-claude-themes2-3` at
> `4f39709688ceb4cac5e15d4e3502186b1f1c801b`
> Structural baseline: `DECISION.md` sections `Common Surface Contract > Layout`,
> `Section Identity`, `Scrolling`, and `Theme Realization`
> Date: 2026-07-18
> Status: Approved
>
> Scope: workspace proportions, panel surfaces, and visible section chrome. This recipe does not
> replace `DESIGN_TOKENS.md`; reusable shell and theme mappings belong there.

## Extraction Method

- Read all eight pinned prototype routes directly.
- Use the durable `1600x1000` captures listed in
  `inbox-triage-visual-recipe-index.md` to verify the assembled composition.
- Treat the four-region information architecture and visible section identity as structural facts
  from the DECISION; use prototype code only for theme realization.

## Source Files

| Alias | File | Relevant regions |
|---|---|---|
| `P-griddo` | `src/app/prototype/inbox-triage-griddo/page.tsx` | `151-195`, `996-1128` |
| `P-tiny-desk` | `src/app/prototype/inbox-triage-tiny-desk/page.tsx` | `179-236`, `1268-1403` |
| `P-neumorphism` | `src/app/prototype/inbox-triage-neumorphism/page.tsx` | `151-203`, `884-1043` |
| `P-claymorphism` | `src/app/prototype/inbox-triage-claymorphism/page.tsx` | `139-254`, `805-944` |
| `P-origami` | `src/app/prototype/inbox-triage-origami/page.tsx` | `184-346`, `1266-1405` |
| `P-terminal` | `src/app/prototype/inbox-triage-terminal/page.tsx` | `152-244`, `826-950` |
| `P-retro-mac` | `src/app/prototype/inbox-triage-retro-mac/page.tsx` | `154-230`, `824-993` |
| `P-graphite` | `src/app/prototype/inbox-triage-graphite/page.tsx` | `152-203`, `974-1104` |

## Visual Facts

### Layout Hierarchy

```text
Inbox / Triage viewport
  optional theme-level status/menu chrome
  workspace row
    Scratch Pool
    main work area
      upper row
        Breakdown
        Staging
      Grid Explorer
```

The upper row uses a `6:4` Breakdown/Staging split in the flex themes. The bottom Grid Explorer
occupies the remaining main-area band. Neumorphism expresses the same hierarchy with
`grid-cols-[3fr_2fr]` and `flex-[3.2]` above `flex-[2.8]`.

### Component Inventory

| Theme | Root and workspace | Panel chrome | Section header |
|---|---|---|---|
| GridDO | `h-screen p-4`; workspace `gap-4` | `rounded-[var(--radius)] border bg-card shadow-sm` | `h-12 border-b px-4`; `text-xs font-semibold uppercase tracking-wider` |
| Tiny Desk | `h-screen p-4 overflow-hidden`; workspace `gap-4` | paper `bg-[#fdfcf0] border-[#d2c2a4]`; `rounded-[var(--theme-radius)] border-2 shadow-md` | `h-12 border-b-2 border-[#d2c2a4]/40 px-4 font-serif`; brown uppercase label |
| Neumorphism | `px-5 pt-4 pb-1.5`; workspace `h-[calc(100vh-1.8rem)] gap-5 p-2.5 -m-2.5` | `bg-[var(--theme-card-bg)]`; outset or `shadow-[var(--theme-shadow-inset)]`; radius `var(--theme-radius)` | `h-12 px-4`; inset circular icon well; `text-[11px] uppercase tracking-[0.18em]` |
| Claymorphism | `h-screen p-6`; workspace `gap-6` | `rounded-[32px] bg-[var(--theme-card-bg)] shadow-[var(--theme-shadow)]` | `h-16 px-6`; `size-10 rounded-2xl` icon block; `text-sm font-black uppercase` |
| Origami | `h-screen p-4 font-mono`; workspace `gap-4` | clipped `PaperPanel`; light/deep/accent paper HSL fills and folded SVG overlay | `h-12 px-4 border-b border-dashed`; `linear-gradient(135deg, ...98%, ...95%)`; `text-[10px] tracking-[0.2em]` |
| Terminal | `h-screen p-4 font-mono`; workspace `gap-4` | `border-2 border-[var(--foreground)] bg-[var(--background)]`; four square corner marks | panel title row `h-10 border-b-2 px-4 text-[10px] uppercase tracking-widest`; title in brackets |
| Retro Mac | `h-screen p-4`; menu bar `h-8 mb-4` | `border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000]` plus inner double border | `h-6 border-b-2`; repeating 1px/3px title-bar stripes; centered `text-[9px]` title |
| Graphite | `h-screen bg-zinc-50 p-6`; workspace `gap-6` | `border-[0.5px]`, white/subtle/dark monochrome variants | `h-12 border-b-[0.5px] px-4`; `text-xs font-semibold uppercase tracking-tight` |

### Spacing And Sizing

| Theme | Scratch expanded / collapsed | Main gap | Upper gap |
|---|---:|---:|---:|
| GridDO | `280px / 64px` | `16px` | `16px` |
| Tiny Desk | `280px / 64px` | `16px` | `16px` |
| Neumorphism | `w-72 / w-16` | `20px` | `20px` |
| Claymorphism | `320px / 100px` | `24px` | `24px` |
| Origami | `260px / 64px` | `16px` | `16px` |
| Terminal | `300px / 80px` | `16px` | `16px` |
| Retro Mac | `260px / 48px` | `16px` | `16px` |
| Graphite | `300px / 72px` | `24px` | `24px` |

### Interaction And Motion

| Theme | Shell motion fact | Source |
|---|---|---|
| GridDO | width spring `stiffness: 300`, `damping: 30` | `P-griddo` |
| Tiny Desk | Scratch width is animated; card hover uses small lift with rotation fixed at `0` | `P-tiny-desk` |
| Neumorphism | width `duration-300 ease-out`; layout isolated with `[contain:layout_paint]` | `P-neumorphism` |
| Claymorphism | `TACTILE_SPRING = { stiffness: 580, damping: 38 }` | `P-claymorphism` |
| Origami | paper elements use spring folds; shell width has no independent timing override | `P-origami` |
| Terminal | width transition `duration: 0` | `P-terminal` |
| Retro Mac | width transition `duration: 0` | `P-retro-mac` |
| Graphite | width transition `duration: 0` | `P-graphite` |

## Realization Decisions

### Adopted

- Preserve one visible workspace with four identifiable regions rather than cardifying subparts.
- Preserve each theme's panel construction: thin GridDO border, desk paper, soft shadow, puffy clay,
  folded paper, CLI frame, System 7 window, and half-pixel editorial line.
- Keep section labels visible inside theme-specific chrome.
- Hide visible scrollbar chrome while retaining wheel, trackpad, touch, keyboard, and drag-edge
  scrolling.
- Preserve stable region sizing and `min-h-0`/overflow containment so dynamic affordances do not
  resize the workspace.

### Removed

- Prototype-only theme switchers, numbered variant controls, fold-lock controls, and test-mode
  controls are not part of the production shell.
- Decorative metadata that replaces or duplicates a section's semantic label is not promoted.
- Terminal's repeated upper Grid title row is not promoted; the final Grid Explorer keeps one row
  containing path and search context.

### Improved

- Any source pulse, blink, or flicker used as ambient shell status becomes a static theme-specific
  status treatment. No repeating attention animation is allowed.
- Theme display aliases such as `Library Index`, `Finder`, and terminal `GRID EXPLORER` remain copy
  realization in the Grid recipe and SPEC. Their semantic/accessibility name remains
  `Grid Explorer`; they are not design tokens.

## Token Contract Implications

| Token / contract area | Required rule | Source evidence |
|---|---|---|
| Workspace spacing | Theme maps a stable shell inset and region gap; compact themes use `16px`, tactile/editorial themes use `20-24px` | root and workspace classes above |
| Panel surface | Each theme maps border, radius, fill, and shadow as one coherent surface contract | panel helpers in all eight routes |
| Section chrome | Header height, icon treatment, label typography, and divider belong to a theme mapping, not ad hoc page values | `SectionHeader`, `FacetedHeader`, `TerminalPanel`, `MacHeader` |
| Scroll chrome | scrolling remains functional while scrollbar chrome is visually hidden | all list and Grid column containers |
| Attention motion | ambient semantic states are static; motion is reserved for direct manipulation and state transition | DECISION `Theme Realization` |

## Execution Handoff

Execution tasks must preserve the hierarchy, region proportions, visible labels, theme panel
grammar, stable overflow containment, and removed prototype controls above. Token implications feed
Step 3 `DESIGN_TOKENS.md`.

## Open Questions

- None. Theme-specific fidelity exceptions are tracked in the recipe index.
