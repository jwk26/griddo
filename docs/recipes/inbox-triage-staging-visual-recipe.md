# Visual Recipe: Inbox / Triage Staging

> Source: `griddo2-claude-themes2-3` at
> `4f39709688ceb4cac5e15d4e3502186b1f1c801b`
> Structural baseline: `DECISION.md` sections `Staging > Node And Bit Structure`,
> `Candidate Drag Surface And Preview`, `Candidate Lifecycle`, `Stage Reliability`,
> `Unstage Reliability`, and `Drag Feedback`
> Date: 2026-07-18
> Status: Approved
>
> Scope: Node/Bit subsections, candidate card realization, pending state, counts, and unstage targets.

## Extraction Method

- Extract candidate shapes, subsection ratios, scroll behavior, and theme motion from the pinned
  prototype.
- Resolve structural conflicts toward the DECISION: full-card drag, durable candidates, and an
  overlay unstage target that does not resize Staging.
- Defer the separate production BitCard redesign; this recipe covers the confirmed Staging visual
  surface only.

## Source Files

| Alias | Card helpers | Staging region |
|---|---|---|
| `P-griddo` | `198-279` | `1381-1503` |
| `P-tiny-desk` | `237-339` | `1551-1632` |
| `P-neumorphism` | `207-270` | `1281-1403` |
| `P-claymorphism` | inline | `1190-1322` |
| `P-origami` | `457-550` | `1602-1714` |
| `P-terminal` | inline | `1205-1329` |
| `P-retro-mac` | inline | `1242-1378` |
| `P-graphite` | `219-291` | `1351-1438` |

## Visual Facts

### Layout Hierarchy

```text
Staging
  visible section chrome
  candidate body
    Nodes subsection (35%)
      independent hidden-chrome scroll container
    Bits subsection (65%)
      independent hidden-chrome scroll container
  drag-only absolute unstage overlay
  section-local failure alert overlay
```

### Candidate Realizations

| Theme | Node | Bit | Subsection surface |
|---|---|---|---|
| GridDO | square `aspect-square rounded-lg border p-2 shadow-sm`; parent-color translucent fill and `Box` well | `rounded-md border px-3 py-2 shadow-sm`; `FileText` and parent-color tint | thin rounded zones; source is `38fr/62fr`, normalized to structural `35fr/65fr` |
| Tiny Desk | square yellow paper, torn tape, brown type, physical shadow | yellow paper strip with smaller torn tape and `FileText` | warm paper zones; rotation fixed at `0` |
| Neumorphism | raised token with inset icon well | raised/inset horizontal token | two radius-`20px` inset wells; no hard border required |
| Claymorphism | `aspect-square rounded-[20px]` raised clay card | `rounded-[16px] p-3` raised clay row | `rounded-[24px]` tinted Node/Bit zones |
| Origami | asymmetric square paper with dashed icon well and gradient fold | asymmetric paper row with `FileText` | angular paper wells; Node/Bit cards enter with `rotateY` spring |
| Terminal | square CLI directory block | horizontal command/executable row | square `border-2` Node/Bit panes with monospace labels |
| Retro Mac | square System 7 file/folder tile | compact bordered document row | hard black-bordered panes with bitmap-like contrast |
| Graphite | `aspect-square rounded-lg border-[0.5px] p-2` | `rounded-md border-[0.5px] px-3 py-2.5` | `rounded-lg border-[0.5px] p-3` monochrome zones |

### Sizing And Scroll

| Contract | Exact realization |
|---|---|
| Split | `grid-cols-[35fr_65fr]` or `flex-[35]` / `flex-[65]` |
| Node list | two-column grid with `gap-3` |
| Bit list | vertical flex list with `gap-2` or `gap-3` |
| Scroll | each list has `overflow-y-auto` and hidden scrollbar chrome utilities |
| Label | `Nodes` / `Bits`; prepend count only when count is at least two |
| Parent panel | `min-h-0 overflow-hidden`; candidate growth never expands the section |

### Pending Candidate Treatment

Pending create/unstage uses the same Node or Bit card markup, dimensions, padding, radius,
typography, and icon as the normal candidate. Add only a static state layer:

| Theme | Pending layer |
|---|---|
| GridDO | reduce color saturation and add `border-dashed border-primary/30` |
| Tiny Desk | flatten to `shadow-none`, keep paper/tape, add `border-[#8b5e3c]/30` |
| Neumorphism | replace raised shadow with `shadow-[var(--theme-shadow-inset-sm)]` |
| Claymorphism | lower saturation and use `shadow-[var(--theme-shadow-inset-sm)]` |
| Origami | keep folds, use dashed outer crease and lower paper contrast |
| Terminal | keep exact CLI card, add static `[SAVING]` status and dim foreground |
| Retro Mac | keep exact tile/row, add 50% dither overlay and static `SAVING` label |
| Graphite | keep exact card, add `border-dashed border-zinc-400 bg-zinc-50` |

No pending layer may blink, pulse, change card geometry, or permit drag/placement.

### Interaction And Motion

| Interaction | Required realization |
|---|---|
| Candidate drag | entire root card is the activator; every grab point yields the same shared `TriageDragToken` |
| Mouse / touch | retain main sensors: `8px` mouse activation; `250ms` touch delay and `5px` tolerance |
| Unstage target | appears only during candidate drag as an absolute bottom overlay; scroll content receives temporary bottom padding |
| Breakdown drop-back | whole Breakdown section is a second target; it does not blur or shift its content |
| Remote arrival | preserve scroll; show section-label `새 항목 N개` only when user is not at top |
| Invalid sibling type | keep neutral for same-type subsection; opposite type shows static invalid reason without auto-conversion |

## Realization Decisions

### Adopted

- Preserve the eight Node/Bit card realizations and their intentional shape difference.
- Preserve the `35/65` semantic split, independent scroll containers, and hidden scrollbar chrome.
- Preserve theme-specific depth/material cues and direct-manipulation motion where it does not alter
  layout.
- Use the same candidate card for pending create/unstage, with only the static pending layer above.

### Removed

- The prototype's separate Grip/drag handle is removed. It is explicitly a wrong prototype detail.
- Permanent unstage buttons are not added.
- Layout-growing unstage rows such as source `animate({ height: 40/44/60/72 })` are removed.
- Repeating pulse, bounce, shake, spin, or blinking on zones, pending cards, and unstage targets is
  removed.
- Prototype keyboard placement shortcuts are not promoted in this pointer-drag-only phase.

### Improved

- GridDO source `38fr/62fr` is normalized to the decided `35fr/65fr` contract.
- The unstage target becomes an absolute overlay that does not alter subsection height or scroll
  offset.
- Candidate counts and remote-arrival counts remain separate signals.
- Stage/unstage failure uses a Staging-header-local overlay with item title, direct reason, `role`
  `alert`, and an accessible `X`; it has no retry button and no timed dismissal.
- Prototype title-based candidate matching becomes stable `sourceBreakdownId` projection.

## Token Contract Implications

| Token / contract area | Required rule | Source evidence |
|---|---|---|
| Candidate geometry | Node square and Bit row share material language but keep type-specific shape | eight card pairs |
| Subsection split | common `35/65` structure with per-theme well/pane surface | Staging regions and DECISION |
| Pending candidate | theme maps one static pending treatment onto the existing card | table above |
| Drag preview | one shared type-specific pill, independent of grab point | main `DragOverlay` / `TriageDragToken` contract |
| Unstage overlay | fixed overlay height and temporary scroll padding; no parent reflow | DECISION lifecycle contract |
| Section alert | theme-local surface with fixed semantic status and close action | `Unstage Reliability` |

## Execution Handoff

Tasks must test full-card drag, identical drag pill from every grab point, Node/Bit scroll
independence, pending card lock, successful stage/unstage, failed unstage alert, dedicated unstage
overlay, Breakdown drop-back, and no section growth.

## Open Questions

- Theme-specific production BitCard typography and icon redesign are deferred to the separate
  post-promotion BitCard worktree.
