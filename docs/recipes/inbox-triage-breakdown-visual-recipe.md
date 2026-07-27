# Visual Recipe: Inbox / Triage Breakdown

> Source: `griddo2-claude-themes2-3` at
> `4f39709688ceb4cac5e15d4e3502186b1f1c801b`
> Structural baseline: `DECISION.md` sections `Breakdown > Breakdown Row`,
> `Scratch And Row Editing`, `Row Lifecycle`, and `Empty Prompt`
> Date: 2026-07-18
> Status: **Superseded — historical/reference-only; not direct execution**
> Replacement: `inbox-triage-breakdown-row-empty-visual-recipe.md`
> Authority boundary: exact effect and timing values below are preserved only
> as historical evidence and are not current visual authority.
>
> Scope: Breakdown row, staged de-emphasis, input, empty prompt, and one-time add/restore signal.

## Extraction Method

- Compare the confirmed row markup in all eight routes.
- Preserve row-level theme identity while applying DECISION lifecycle and persistence rules.
- Treat the prototype's mock handlers as non-production; only visual realization is extracted.

## Source Files

| Alias | Shared/card region | Breakdown region |
|---|---|---|
| `P-griddo` | `198-285` | `1194-1380` |
| `P-tiny-desk` | `1096-1168` | `1440-1550` |
| `P-neumorphism` | `1138-1218` | `1109-1280` |
| `P-claymorphism` | inline | `1003-1189` |
| `P-origami` | `350-455` | `1466-1601` |
| `P-terminal` | inline | `1018-1204` |
| `P-retro-mac` | inline | `1076-1241` |
| `P-graphite` | inline | `1166-1350` |

## Visual Facts

### Layout Hierarchy

```text
Breakdown
  Selected Scratch Context
  scrollable row list
    active, deleting, or staged rows
    empty/completion prompt when no visible rows remain
  fixed add-input footer
```

Placed/consumed rows are filtered from the visible list. Staged rows remain in place with disabled
actions and a theme-specific de-emphasis treatment.

### Row Inventory

| Theme | Active row | Staged row | Edit / Trash |
|---|---|---|---|
| GridDO | `rounded-lg border p-3 shadow-sm`; card fill; hover border/shadow | `bg-muted/15 border-primary/10 shadow-[inset_0_2px_4px_rgba(var(--primary-rgb),0.03)] opacity-55` | `Edit2` and `Trash2`, circular `size-7` controls |
| Tiny Desk | warm paper row, `p-3`, subtle brown border/shadow | `opacity-40 bg-[#fdfcf0]/20 border-[#d2c2a4]/40 shadow-none rotate-0` | `Feather` and `Trash2`, warm brown hover states |
| Neumorphism | `p-3`, radius `18px`, `shadow-[var(--theme-shadow-card)]` | `opacity-35 shadow-[var(--theme-shadow-inset-sm)] bg-zinc-100/30 scale-95` | raised circular `PenLine` and `Trash2` controls |
| Claymorphism | `rounded-[24px] p-4 shadow-[var(--clay-card-shadow)]` | `opacity-40 bg-zinc-200/50 shadow-none border-2 border-zinc-300 scale-[0.97]` | `Wand2` and `Trash2` in `ClayButton` shells |
| Origami | asymmetric paper radius, `border p-3`, one-pixel paper shadow | `opacity-40 border-dashed ... bg-[hsl(40_10%_98%)] shadow-none scale-[0.98]` | `Scissors` and `Trash2`, `size-6` paper controls |
| Terminal | square one-line border row, foreground-variable mono type | `opacity-60 border-zinc-800 bg-neutral-900/40`; italic zinc title with `# [staged]` prefix | `Terminal` and red `Trash`, square `size-6` controls |
| Retro Mac | compact black-border System 7 row | dotted/ghosted low-contrast row with no lift | `Paintbrush` and `Trash2`, black/white invert controls |
| Graphite | `border-[0.5px]`, `p-3`, zinc editorial surface | `opacity-50 border-zinc-200 bg-zinc-50/20 shadow-none scale-[0.99]` | `Eraser` and `Trash2`, `size-8` monochrome controls |

All confirmed rows omit visible numbering and created-time text. Internal `createdAt` still owns
newest/oldest sorting.

### Empty Prompts

| Theme | Normal empty identity | Completion/reopen identity |
|---|---|---|
| GridDO | vertical `GRIDDO` watermark and `WAITING FOR INCOMING SLIPS` | `// BUFFER CLEARED //` plus archive reopen control |
| Tiny Desk | muted empty sticky and `// NO MEMOS LOGGED //` | `PROCESSED` stamp and filing language |
| Neumorphism | recessed quiet well | soft completed status and raised reopen action |
| Claymorphism | pale empty clay field | green completed copy and puffy archive action |
| Origami | page-curl watermark and `SHEET CLEARED` | folded/flattened paper language |
| Terminal | GDB-style empty output | command-line completion and archive command |
| Retro Mac | faint checker paper | System 7 completion/file action |
| Graphite | calligraphy/grid guideline field | editorial `Triage Complete` treatment |

### Add Input And One-Time Signal

The input remains a fixed footer with a text field and explicit Add/Execute/Fold action. Exact
button language is locale-owned. On confirmed add or successful unstage, use the following single,
non-repeating row signal without changing row geometry:

| Theme | One-time signal | Duration | Reduced motion |
|---|---|---:|---|
| GridDO | add `ring-1 ring-primary/30 shadow-md`, then return to active row | `600ms ease-out` | static ring for `800ms` |
| Tiny Desk | temporarily use `bg-[#fffbeb] border-[#8b5e3c]/40 shadow-md` | `700ms ease-out` | static paper contrast for `800ms` |
| Neumorphism | transition from `shadow-[var(--theme-shadow-card-hover)]` to normal raised shadow | `650ms ease-out` | stronger static raised shadow for `800ms` |
| Claymorphism | use `shadow-[var(--clay-card-shadow-hover)]` and a white edge highlight | `650ms ease-out` | static stronger shadow for `800ms` |
| Origami | temporarily strengthen to `border-[hsl(40_10%_60%)] shadow-sm` | `600ms ease-out` | static border for `800ms` |
| Terminal | foreground border and `bg-[hsl(var(--foreground))]/10`, no cursor blink | `500ms linear` | same static contrast for `800ms` |
| Retro Mac | temporary inner `outline outline-1 outline-black` with existing hard shadow | `500ms linear` | same outline for `800ms` |
| Graphite | temporary `border-zinc-900 bg-white shadow-sm` | `600ms ease-out` | same static contrast for `800ms` |

### Interaction And Motion

| Interaction | Required realization |
|---|---|
| Row drag | grip-only activator; the row itself remains the editing/selection surface |
| Edit / Trash | always visible; disabled in staged, deleting, or saving states |
| New row | one signal above plus polite `aria-live`; input retains focus |
| Unstage restore | reuse the exact same one-time signal; reveal within the row list only |
| Scroll | row list scrolls independently with no visible scrollbar chrome |

## Realization Decisions

### Adopted

- Keep the eight active-row designs and theme-specific staged de-emphasis treatments above.
- Keep Edit and Trash permanently visible and preserve the selected theme icons.
- Keep the add footer and explicit submit control.
- Keep normal-empty and completion/reopen prompts theme-specific and visually quieter than rows.
- Remove a row from rendering only after placement consumption succeeds.

### Removed

- Row numbering and row time metadata are not rendered.
- Placed rows with strike-through are not rendered; consumed rows leave the active list.
- Prototype-only numbered variant selectors and hover icon test surfaces are not promoted.
- Emoji-based empty/completion decoration is removed.

### Improved

- Prototype mock `isStaged` matching by title becomes stable candidate/source-ID projection.
- New-row and restored-row feedback uses the exact one-time table above, never repeated pulse,
  bounce, or blink.
- Inline Edit, deleting, saving, conflict, and failure states reuse the existing row shell instead
  of introducing generic cards or global dialogs.
- Empty and completion prompts are gated by authoritative lifecycle, not an empty-array shortcut.

## Token Contract Implications

| Token / contract area | Required rule | Source evidence |
|---|---|---|
| Breakdown row surface | active and staged states map per theme with more than opacity alone | confirmed row classes |
| Row action slot | stable trailing control dimensions prevent title and row width shift | `size-6`, `size-7`, or `size-8` controls |
| Added/restored signal | one semantic signal maps to theme surface tokens and reduced-motion fallback | table above |
| Empty prompt | quiet background treatment and completion action are separate from row cards | eight empty branches |
| List scroll | fixed footer plus independently scrolling list with hidden chrome | Breakdown containers |

## Execution Handoff

Acceptance criteria must test active, staged, deleting/saving, consumed, empty, add-success, add-
failure, and unstage-restore flows without row geometry changes. Functional persistence and conflict
handling come from main contracts, not prototype handlers.

## Open Questions

- None. Text wrapping and capacity remain in the separate cross-surface text-capacity
  brainstorming item.
