# Visual Recipe: Inbox / Triage Placement Affordances

> Source: `griddo2-claude-themes2-3` at
> `4f39709688ceb4cac5e15d4e3502186b1f1c801b`
> Structural baseline: `DECISION.md` sections `Grid Explorer And Placement > Placement Targets`,
> `Placement Keyboard And Focus`, `Staged Candidate Placement`, `Direct Breakdown Row Placement`,
> `Placement Commit Reliability`, and `Placement Result Title Validation`
> Date: 2026-07-18
> Status: Approved
>
> Scope: drag-start invalid cues, invalid-hover warnings, direct type choice, and Confirm/Cancel
> placement surfaces inside a target column.

## Extraction Method

- Trace staged and direct-row DnD from drag start through type selection and confirmation.
- Preserve the final two-stage direct flow and theme-specific affordance surfaces.
- Reconcile source pulses, icon emoji, glass prelayers, and clipped column content toward explicit
  user decisions and the DECISION.

## Source Files

All pinned route Grid regions listed in `inbox-triage-visual-recipe-index.md` are source. Key
realization ranges are the `isDropUnavailable`, `directRowDrop`, and `pendingPlacement` branches in
each route.

## Visual Facts

### Layout Hierarchy

```text
drag starts
  invalid columns receive immediate theme-specific background/depth signal
pointer enters invalid column
  clear warning surface appears above that signal

staged candidate dropped on valid target
  Placement Affordance: source + result type + destination + Confirm/Cancel

direct Breakdown row dropped on valid target
  modal-like type/path choice
  then separate Placement Affordance: source + chosen type + destination + Confirm/Cancel
```

All affordances remain inside the target column and its scrollable content. They do not become a
page-level dialog.

### Invalid Target Realizations

| Theme | Drag-start signal | Pointer-inside warning |
|---|---|---|
| GridDO | red tint `bg-red-500/[0.03]` with `backdrop-blur-[4px]` | `z-30` card `bg-background/95 border-red-500/80`, `AlertCircle`, direct blocked text |
| Tiny Desk | faint red paper tint plus `backdrop-blur-[4px]` | red stamped paper, `border-2 border-red-400`, `AlertOctagon`, `STAMP: ... REJECTED` |
| Neumorphism | flatten to `shadow-none bg-transparent` plus transparent `backdrop-blur-[4px]` | inset soft alert well, red icon and direct `Bit not allowed at L0` / `Node not allowed at L3` text |
| Claymorphism | red inner clay shadow with radius `24px` and `blur(4px)` | puffy red alert `rounded-[20px] shadow-[var(--clay-card-shadow)]` |
| Origami | transparent `backdrop-blur-[4px]` over paper | clear white dashed red paper warning with `Scissors` icon |
| Terminal | `bg-red-950/70`, red glow, red foreground | square `bg-zinc-950 border-red-500` fatal message |
| Retro Mac | `dither-grayed-out`; no blur | clear System Error dialog, `border-4 border-double`, hard `4px` shadow |
| Graphite | transparent `backdrop-blur-[4px]` | white thin-line alert, mono uppercase blocked text |

The warning layer is always above the background treatment and must not inherit blur or dimming.
Column labels remain `Home` / `Level 1-3` while the warning is visible.

### Direct Type Choice

| Theme | Opaque column-scoped surface |
|---|---|
| GridDO | `bg-card/95 p-4 border border-stone-200`; primary Node and bordered Bit actions |
| Tiny Desk | `bg-[#fdfcf5] border-2 border-[#8b5e3c]/30 p-4`; paper folder/path copy |
| Neumorphism | `bg-[var(--page-bg)] p-4 shadow-[var(--theme-shadow-card)]`; radius `18px` |
| Claymorphism | puffy clay choice surface with rounded Node/Bit controls |
| Origami | angular paper choice surface with dashed/creased actions |
| Terminal | opaque black ASCII-framed choice surface |
| Retro Mac | opaque white `border-2 border-black` Finder dialog with hard shadow |
| Graphite | opaque white editorial choice surface with thin black divisions |

Unavailable type actions stay visible but disabled and include a direct reason. Home allows Node
only; Level 3 allows Bit only; title limits can disable additional types.

### Placement Confirmation

| Theme | Confirm/Cancel surface |
|---|---|
| GridDO | compact primary-bordered tag, static status dot, primary Confirm, bordered Cancel |
| Tiny Desk | pinned memo slip with brass pin, warm Confirm and paper Cancel |
| Neumorphism | radius-`20px` raised panel; raised Place and Cancel controls |
| Claymorphism | radius-`24px` amber jelly capsule with rounded actions |
| Origami | angular folded paper slip with dashed edge |
| Terminal | square `[SYS: CONFIRM PLACEMENT?]` block; red `[N]`, foreground `[Y]` |
| Retro Mac | marquee/double-border `OK TO PLACE?` dialog; Cancel and `OK` |
| Graphite | docked thin-line strip with title and compact actions |

### Interaction And Motion

| State | Required behavior |
|---|---|
| Invalid | no write; pointer release cannot auto-correct to another target |
| Direct type choice | first step only; type selection opens a visually separate confirmation step |
| Confirm pending | surface stays mounted, controls lock, visible pending status remains in place |
| Full target | same affordance shows warning, disables Confirm, leaves Cancel available |
| Cancel/Escape | source remains unchanged; focus returns to source or section fallback |
| Success | focus moves to the actual newly created Node/Bit card |
| Column overflow | affordance participates in column scroll; it must not increase column height or clip actions |

## Realization Decisions

### Adopted

- Preserve the two-level invalid signal: immediate column treatment, then clear warning on entry.
- Preserve eight theme-specific warning, direct-choice, and confirmation visual languages.
- Preserve a two-step direct flow and one-step staged confirmation flow.
- Keep every placement surface scoped to the target column.
- Keep Confirm/Yes and Cancel/Escape explicit; no write occurs before confirmation.

### Removed

- Source translucent H10 prelayers such as `bg-white/20 backdrop-blur-[3px]` are removed. The type
  choice itself remains opaque and column-scoped; Glassmorphism is not part of the approved H10
  realization.
- Source `animate-pulse`, `animate-ping`, bounce, blink, and rotating borders are removed.
- Source folder/document emoji in pending rows are removed; use the existing Node/Bit icon language.
- Prototype keyboard drop shortcuts and hidden placement commands are not promoted in this phase.
- Full-screen placement dialogs and automatic target correction are not allowed.

### Improved

- Pending indicators become static while retaining each theme's border, depth, marker, and control
  arrangement.
- `data-placement-scroll` owns vertical overflow and enough bottom padding to keep Confirm/Cancel
  reachable without expanding the column.
- Warning text is locale-owned and remains sharp above any invalid-target background blur.
- Confirm-time stale/full validation updates the existing affordance rather than replacing it with
  a generic error dialog.
- Staged over-limit titles insert the decided Result Title step; direct placement never inserts a
  hidden title editor.

## Token Contract Implications

| Token / contract area | Required rule | Source evidence |
|---|---|---|
| Invalid target | each theme maps background/depth signal separately from the warning surface | eight invalid branches |
| Column warning | high-contrast static message layer must remain readable above background treatment | `z-30` warning branches |
| Direct choice | one opaque theme surface with disabled-type treatment | eight `directRowDrop` branches |
| Confirmation | one theme surface with stable status, Confirm, and Cancel slots | eight `pendingPlacement` branches |
| Placement scroll | affordance lives in a fixed column scroll viewport | `data-placement-scroll` containers |

## Execution Handoff

Acceptance criteria must cover Home/Level 3 constraints, invalid drag-start and pointer-entry
states, two-stage direct flow, staged confirmation, full target, stale target, pending, retry,
Cancel/Escape, focus containment, and reachable actions at every column height.

## Open Questions

- None.
