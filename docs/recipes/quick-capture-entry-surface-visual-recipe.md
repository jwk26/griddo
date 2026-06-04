# Visual Recipe: Quick Capture `+` Entry Surface / `surface(main)`

> Source: `prototype/future-ideas` @ `e662163` — `src/app/prototype/quick-capture-create-variants/page.tsx`, variant id 1 (`"Surface (Main)"`) + `ScratchModal`
> Structural baseline: `docs/brainstorming/2026-04-28-quick-capture-entry-surface/DECISION.md`
> Date: 2026-06-02
> Status: Draft
>
> Scope: surface-specific visual realization of the anchored `+` entry surface and the Scratch capture modal. Does not replace DESIGN_TOKENS.md; reusable token contracts belong there.

## Extraction Method

- Read source code directly at commit `e662163` (`git show`). No running app required.
- One source file contains three variants; this recipe extracts **only** the `Variant1` ("Surface (Main)") region and the shared `ScratchModal`. The `Palette` variant has its own recipe (`command-palette-visual-recipe.md`); `Favorites` is Batch 3 (not extracted).
- Exact Tailwind classes only. The prototype contains duplicated `text-left` utilities (AI-generated noise) — these are **dropped** (see Improved).

## Source Files

| File | Role | Notes |
|---|---|---|
| `…/quick-capture-create-variants/page.tsx` `Variant1` | `+` entry surface popover | id 1 = `"Surface (Main)"` (confirmed via `VARIANTS` array) |
| `…/quick-capture-create-variants/page.tsx` `ScratchModal` | Scratch capture modal | shared; opened by the Scratch row |
| `…/quick-capture-create-variants/page.tsx` `PrototypeShell` | sidebar `+` anchor reference only | scaffold — NOT adopted (real app has its own sidebar) |

## Visual Facts

### Layout Hierarchy

```text
Entry Surface (anchored popover)
  group label "Ideas"
  Scratch row  [icon tile][label]          (no per-row shortcut — see Removed)
  divider
  group label "Create"
  Node row     [icon tile][label]
  Bit row      [icon tile][label]
  (optional) surface-level ⌘K palette hint  (per DECISION)

Scratch Modal (centered overlay)
  backdrop (blur)
  panel
    [Zap icon][text input "Capture your ideas..."]
```

### Component Inventory

| Component / Element | Exact classes | State / role |
|---|---|---|
| Entry surface container | `fixed left-[60px] top-[56px] z-[100] w-56 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden p-1.5` | anchored just right of the 48px (`w-12`) sidebar rail, below the `+` button |
| Group label ("Ideas" / "Create") | `px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground` | section divider label |
| Scratch row (primary) | `w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-accent transition-colors group` | Ideas group; primary capture action |
| — Scratch icon tile | `p-1.5 rounded-md bg-primary/10 text-primary` + `<Zap className="w-4 h-4 fill-primary" />` | accent-tinted (primary) |
| — Scratch label | `text-sm font-medium` ("Scratch") | |
| ⌘K badge — prototype only, on Scratch row | `text-[10px] text-muted-foreground group-hover:text-foreground bg-muted px-1.5 py-0.5 rounded` ("⌘K") | **NOT adopted** — per DECISION the Scratch row carries no dedicated shortcut; ⌘K opens the Command Palette and is hinted at **surface level** only (see Removed) |
| Divider | `h-px bg-border my-1.5 mx-2` | between Ideas and Create |
| Node / Bit row | `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors` | Create group |
| — Node/Bit icon tile | `p-1.5 rounded-md bg-secondary text-muted-foreground` + `<Box>` (Node) / `<Book>` (Bit) `w-4 h-4` | neutral (secondary), distinct from Scratch's primary tile |
| — Node/Bit label | `text-sm font-medium` | |
| Scratch modal backdrop | `absolute inset-0 bg-background/40 backdrop-blur-sm` | fade in/out |
| Scratch modal panel | `relative w-full max-w-lg bg-popover border border-border shadow-2xl rounded-2xl overflow-hidden p-4` | overlay container `fixed inset-0 z-[400] flex items-center justify-center p-4` |
| Scratch modal input row | `flex items-center gap-3` + `<Zap className="w-5 h-5 text-primary fill-primary" />` + `<input autoFocus placeholder="Capture your ideas..." class="flex-1 bg-transparent border-none outline-none text-lg" />` | single-line capture |

### Spacing and Sizing

| Element | Value |
|---|---|
| Surface width | `w-56` (224px) |
| Surface padding | `p-1.5` (6px) |
| Anchor offset | `left-[60px] top-[56px]` (sidebar rail = `w-12`/48px) |
| Row padding | `px-3 py-2.5` |
| Group label padding | `px-3 py-2` |
| Divider | `h-px … my-1.5 mx-2` |
| Scratch modal width | `max-w-lg` (512px), padding `p-4` |

### Color and Typography

| Element | Color token | Typography |
|---|---|---|
| Surface | `bg-popover` / `border-border` | — |
| Group label | `text-muted-foreground` | `text-[10px] font-bold uppercase tracking-wider` |
| Scratch icon tile | `bg-primary/10 text-primary` (icon `fill-primary`) | — |
| Node/Bit icon tile | `bg-secondary text-muted-foreground` | — |
| Row label | `text-foreground` (inherit) | `text-sm font-medium` |
| Prototype-only / optional surface-level ⌘K hint | `bg-muted text-muted-foreground` → `group-hover:text-foreground` | `text-[10px]` |

### Borders, Radius, Shadows

| Element | Border | Radius | Shadow |
|---|---|---|---|
| Entry surface | `border border-border` | `rounded-xl` | `shadow-2xl` |
| Icon tiles | — | `rounded-md` | — |
| Rows | — | `rounded-lg` | — |
| Scratch modal panel | `border border-border` | `rounded-2xl` | `shadow-2xl` |

### Interaction and Motion

| State / interaction | Behavior | Duration / easing |
|---|---|---|
| Surface open/close | `initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}` (slide-from-left + fade), wrapped in `AnimatePresence` | **no explicit transition** → motion/react defaults (spring for `x`, tween for `opacity`) |
| Row hover | `hover:bg-accent transition-colors` | default |
| Scratch modal open | backdrop `opacity` fade; panel `initial={{opacity:0, scale:0.98, y:10}} animate={{opacity:1, scale:1, y:0}}` | no explicit transition → motion defaults |
| Open trigger | sidebar `+` button toggles surface; `Esc` closes | — |

## Realization Decisions

### Adopted

- Anchored slide-from-left + fade popover: `fixed … z-[100] w-56 bg-popover border border-border rounded-xl shadow-2xl p-1.5`, `initial/animate/exit` x:-20 + opacity.
- Ideas/Create two-group structure with `text-[10px] font-bold uppercase tracking-wider text-muted-foreground` labels and `h-px bg-border my-1.5 mx-2` divider.
- Scratch as primary: primary-tinted icon tile (`bg-primary/10 text-primary`, `fill-primary`); Node/Bit secondary-tinted (`bg-secondary text-muted-foreground`). The Scratch row carries **no** dedicated shortcut badge (per DECISION).
- Scratch capture modal: centered `max-w-lg` `rounded-2xl` panel, `backdrop-blur-sm` backdrop, single-line `Capture your ideas...` input, scale+fade entrance.

### Removed (not adopted in Batch 1)

- `CreateNodeModal`, `CreateBitModal` (prototype's redesigned create modals) — **Create-modal redesign is out of scope** (handoff §6; `2026-05-26-create-modal-design` not promoted). Batch 1 keeps the existing `create-node-dialog.tsx` / `create-bit-dialog.tsx`. The entry surface's Node/Bit rows open those **existing** dialogs.
- `PrototypeShell` sidebar + `Toolbar` variant switcher — prototype scaffold.
- `Favorites` variant — Batch 3.
- Per-row `⌘K` badge on the Scratch row (prototype) — **not adopted**. Per DECISION, `Cmd+K` opens the Command Palette (where Scratch is key `1`); the Scratch row itself has no dedicated shortcut. The `+` surface may instead show an optional **surface-level** Cmd+K palette hint.

### Improved (change from source)

- Drop all duplicated `text-left` utility classes (prototype noise).
- Replace hard-coded prototype backdrop `bg-background/40` with the project's established overlay token/pattern (see DESIGN_TOKENS § Blur + Overlay Pattern) for consistency.
- `Box`/`Book` are prototype placeholder icons; the real surface uses GridDO's Node/Bit iconography conventions.
- Define explicit motion duration/easing per DESIGN_TOKENS § Motion Language rather than relying on motion defaults.

## Token Contract Implications

| Token / contract area | Required rule | Source evidence |
|---|---|---|
| Section label | Reusable "group label": `text-[10px] font-bold uppercase tracking-wider text-muted-foreground` (recurs in modals too) | Variant1, modals |
| Overlay/backdrop | Entry/Scratch modals must use the shared blur-overlay token, not per-component `bg-background/40 backdrop-blur-sm` | ScratchModal |
| Primary-vs-secondary affordance | Primary action = `bg-primary/10 text-primary` tile; secondary = `bg-secondary text-muted-foreground` tile | Scratch vs Node/Bit |

## Execution Handoff

EXECUTION_PLAN tasks for the `+` entry surface must reference this recipe and assert:

- anchored slide+fade popover (`w-56`, anchored to sidebar `+`), Ideas/Create grouping, Scratch primary (no per-row shortcut; optional surface-level ⌘K palette hint per DECISION)
- Node/Bit rows open the **existing** create dialogs (not the prototype's new modals)
- Scratch modal: centered `max-w-lg` single-line capture, blur backdrop
- explicit motion values from DESIGN_TOKENS § Motion Language

## Open Questions

- Exact anchor coordinates depend on the real sidebar geometry — phase-local (the prototype's `left-[60px] top-[56px]` assumes a `w-12` rail).
- Motion duration/easing not specified in source — phase-local; derive from DESIGN_TOKENS § Motion Language.
