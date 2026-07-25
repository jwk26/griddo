# Visual Recipe: Inbox / Triage Completion And Archive

> Source: `griddo2-claude-themes2-3` at
> `4f39709688ceb4cac5e15d4e3502186b1f1c801b`
> Structural baseline: `DECISION.md` section `Completion And Archive`, especially
> `Archive Eligibility`, `Initial Completion Moment`, `Cancel And Reopen`, and `Confirm Archive`
> Date: 2026-07-18
> Status: Approved
>
> Scope: Breakdown-scoped completion overlay, archive confirmation, Cancel/reopen state, and
> theme-specific completed Selected Scratch Context.

## Extraction Method

- Read every `isTriaged` and `showArchiveAffordance` branch in the pinned routes.
- Preserve theme-specific surfaces while replacing prototype eligibility shortcuts with the
  authoritative lifecycle contract.
- Remove repeating attention motion and decorative emoji.

## Source Files

| Alias | Completion / overlay region |
|---|---|
| `P-griddo` | `1194-1220`, `1341-1380` |
| `P-tiny-desk` | `1438-1478`, `1508-1549` |
| `P-neumorphism` | `1060-1108`, `1240-1279` |
| `P-claymorphism` | `1003-1030`, `1137-1189` |
| `P-origami` | `1420-1465`, `1558-1600` |
| `P-terminal` | `955-1010`, `1164-1203` |
| `P-retro-mac` | `1010-1070`, `1196-1239` |
| `P-graphite` | `1110-1148`, `1311-1349` |

## Visual Facts

### Layout Hierarchy

```text
archive-ready transition
  Breakdown section content becomes dimmed/blurred and non-interactive
  Breakdown-scoped archive region appears above it
    theme-specific heading and explanation
    Archive action
    Cancel action

Cancel
  overlay closes
  Selected Scratch Context becomes theme-specific Scratch complete state
  Breakdown shows one reopen archive control
```

The overlay never covers Scratch Pool, Staging, Grid Explorer, or the full viewport.

### Initial Overlay Realizations

| Theme | Breakdown veil | Archive surface |
|---|---|---|
| GridDO | `bg-background/50 backdrop-blur-[2px]` | `border border-primary/30 rounded-2xl p-6 bg-card shadow-xl` |
| Tiny Desk | `bg-black/35 backdrop-blur-[1px]` | pinned `bg-[#fffbeb] border-[#ebdca5] p-6` paper with brass head |
| Neumorphism | `bg-[#f5f6fa]/60 backdrop-blur-[2px]` | radius `28px`, `bg-[#f5f6fa] shadow-[var(--theme-shadow-card-hover)]` |
| Claymorphism | `bg-white/60 backdrop-blur-[2px]` | `rounded-[36px] p-6 border-4 border-white shadow-[var(--clay-card-shadow-hover)]` |
| Origami | `bg-black/25 backdrop-blur-[1px]` | dashed paper, asymmetric radius, `p-6 bg-[hsl(40_20%_98%)]` |
| Terminal | opaque `bg-black/60` | square black `border-2 border-[var(--foreground)] p-6` command dialog |
| Retro Mac | `bg-white/70 backdrop-blur-[1px]` | white `border-4 double-border-mac p-6 shadow-[6px_6px_0px_#000]` dialog |
| Graphite | `bg-black/40 backdrop-blur-[2px]` | white `border-[0.5px] border-zinc-900 rounded-lg p-6`, long restrained shadow |

### Cancelled Completion Realizations

| Theme | Completed context / prompt cue | Reopen control language family |
|---|---|---|
| GridDO | technical buffer-cleared stamp and dimmed context title | outlined archive-container action |
| Tiny Desk | `PROCESSED` paper stamp and filed-notepad context | warm paper filing action |
| Neumorphism | inset completed context with soft status badge | raised soft archive button |
| Claymorphism | `DOUGH_NODE // FINISHED`, lower-saturation title, green clay completion | puffy green archive action |
| Origami | folded hanging-tag status and flattened-sheet prompt | angular paper archive action |
| Terminal | static `SUCCESS` editor status and all-triaged ASCII block | command-line archive action |
| Retro Mac | `DISK: TRIAGED`, completed folder/path metadata | classic bordered file/archive action |
| Graphite | dark `INDEX ARCHIVED` context and editorial completion prompt | dark registry archive action |

### Controls And Motion

| State | Required control behavior |
|---|---|
| Auto-open | announce politely without stealing current Grid/placement focus |
| Initial overlay | visible Archive and Cancel; no separate reopen control |
| Cancel/Escape | close overlay, move focus to newly visible reopen control |
| Reopen | same Breakdown-scoped overlay; focus heading or safe Cancel |
| Archive pending | keep surface mounted; lock Archive, Cancel, Undo, Edit, placement, navigation |
| Archive failure | same surface shows reason, Retry, and Cancel; no automatic retry |
| Archive success | remove archived Scratch only after confirmation, then focus decided next destination |

## Realization Decisions

### Adopted

- Keep the eight Breakdown-scoped veil and archive-surface constructions above.
- Keep Cancel and Archive actions together in the initial overlay.
- Keep theme-specific completed Context and reopen control after Cancel.
- Keep the existing Breakdown Add footer available after Cancel; a successfully added row returns
  the section to normal state.

### Removed

- Prototype `isTriaged` or empty-array shortcuts are removed as eligibility sources.
- Full-screen/global archive dialogs are removed.
- Any five-second auto-archive timer is removed.
- Repeating `animate-pulse`, `animate-bounce`, blinking ASCII, and decorative emoji are removed.
- The reopen control is hidden while the archive overlay is open.

### Improved

- Eligibility requires an active selected Scratch, at least one consumed row, all rows consumed,
  and zero staged candidates; delete-only or stage-only emptiness is not completion.
- Non-empty Add draft and dirty Context Edit block the overlay without being auto-submitted or
  discarded.
- Losing eligibility immediately removes veil, overlay, completed Context, and reopen control.
- Overlay semantics are a named non-modal Breakdown region before mutation; no page-level focus
  trap is introduced.
- Pending/failure/reconciliation states remain inside the same theme surface and use visible status
  plus `aria-live` without premature Scratch removal.

## Token Contract Implications

| Token / contract area | Required rule | Source evidence |
|---|---|---|
| Completion veil | theme maps one Breakdown-only dim/blur treatment | eight overlay backdrops |
| Archive surface | theme maps panel, border/radius, shadow, typography, and action treatment | eight overlay cards |
| Completed Context | same Selected Context changes status without a generic replacement card | eight `isTriaged` branches |
| Reopen action | one stable control appears only after Cancel/reentry-ready state | completion prompts |
| Attention motion | completion is static; announcement carries urgency without repeated motion | DECISION and removed source classes |

## Execution Handoff

Tasks must test eligibility, draft/edit blockers, first-transition auto-open, Cancel/Escape, Scratch
switch after Cancel, route/reload behavior, reopen, eligibility loss, archive pending/failure/
reconciliation, successful removal, search-filter edge cases, focus, and `aria-live` status.

## Open Questions

- None.
