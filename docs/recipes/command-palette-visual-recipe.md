# Visual Recipe: Command Palette (Cmd+K) / `palette` variant

> Source: `prototype/future-ideas` @ `e662163` — `src/app/prototype/quick-capture-create-variants/page.tsx`, variant id 3 (`"Palette"`)
> Structural baseline: `docs/brainstorming/2026-04-28-quick-capture-entry-surface/DECISION.md` (palette **function**: key 1 = Scratch, key 2 = Search)
> Recipe-source designation: `docs/brainstorming/2026-05-18-quick-capture-palette/DECISION.md` (visual/interaction only)
> Date: 2026-06-02
> Status: Draft
>
> Scope: surface-specific **visual/interaction shell** of the Cmd+K Command Palette. The palette's command content and key mapping come from the quick-capture DECISION, **not** from the prototype's command rows. Does not replace DESIGN_TOKENS.md.

## Extraction Method

- Read source directly at `e662163`. Extracts **only** the `Variant3` ("Palette") region of the shared `page.tsx`.
- The prototype's command list (Scratch / Node / Bit + free-text search) is a **visual demo**, not the adopted command set. Adopt the *shell + interaction*; the command set/keys follow the product DECISION (fixed — see Realization Decisions).
- Drop duplicated `text-left` noise.

## Source Files

| File | Role | Notes |
|---|---|---|
| `…/quick-capture-create-variants/page.tsx` `Variant3` | command palette overlay | id 3 = `"Palette"` (confirmed via `VARIANTS`) |

## Visual Facts

### Layout Hierarchy

```text
Palette (centered, top-anchored overlay)
  backdrop (blur)
  panel
    search input row  [Search icon][text input]
    command list
      command row (primary)  [icon][label][shortcut]
      command row            [icon tile][label][shortcut]
      command row            [icon tile][label][shortcut]
```

### Component Inventory

| Component / Element | Exact classes | State / role |
|---|---|---|
| Overlay wrapper | `fixed inset-0 z-50 flex items-start justify-center pt-[15vh]` | top-anchored, 15vh from top |
| Backdrop | `absolute inset-0 bg-background/20 backdrop-blur-md` | fade in/out |
| Panel | `relative w-full max-w-xl bg-popover border border-border shadow-2xl rounded-2xl overflow-hidden` + inner `p-2` | command container |
| Search input row | `flex items-center gap-3 px-3 py-3 border-b border-border mb-2` | + `<Search className="w-5 h-5 text-muted-foreground" />` + `<input autoFocus placeholder="What would you like to do?" class="flex-1 bg-transparent border-none outline-none text-base placeholder:text-muted-foreground" />` |
| Command list | `space-y-1` | |
| Command row — primary | `w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all group` | **primary highlight = full primary fill on hover** + `<Zap className="w-4 h-4"/>` + `text-sm font-medium`; shortcut `text-[10px] opacity-60` |
| Command row — secondary | `w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-accent transition-all group` | icon tile `p-1.5 rounded-md bg-secondary text-muted-foreground` + `<Box>`/`<Book>` `w-4 h-4`; label `text-sm font-medium text-foreground`; shortcut `text-[10px] text-muted-foreground` |

### Spacing and Sizing

| Element | Value |
|---|---|
| Vertical anchor | `pt-[15vh]` |
| Panel width | `max-w-xl` (576px) |
| Panel inner padding | `p-2` |
| Search row | `px-3 py-3`, `border-b`, `mb-2` |
| Command row | `px-3 py-2.5`, list gap `space-y-1` |

### Color and Typography

| Element | Color token | Typography |
|---|---|---|
| Backdrop | `bg-background/20 backdrop-blur-md` | — |
| Panel | `bg-popover border-border` | — |
| Search placeholder | `text-muted-foreground` | `text-base` |
| Primary command hover | `hover:bg-primary hover:text-primary-foreground` | `text-sm font-medium` |
| Secondary command | `text-foreground`, tile `bg-secondary text-muted-foreground` | `text-sm font-medium` |
| Shortcut hint | primary row `opacity-60`; secondary `text-muted-foreground` | `text-[10px]` |

### Borders, Radius, Shadows

| Element | Border | Radius | Shadow |
|---|---|---|---|
| Panel | `border border-border` | `rounded-2xl` | `shadow-2xl` |
| Command rows | — | `rounded-lg` | — |
| Secondary icon tile | — | `rounded-md` | — |

### Interaction and Motion

| State / interaction | Behavior | Duration / easing |
|---|---|---|
| Palette open/close | backdrop `opacity` fade; panel `initial={{opacity:0, scale:0.95, y:-20}} animate={{opacity:1, scale:1, y:0}} exit={{…}}` in `AnimatePresence` | **no explicit transition** → motion/react defaults |
| Primary command hover | full primary fill (`hover:bg-primary hover:text-primary-foreground`) | `transition-all` default |
| Secondary command hover | `hover:bg-accent` | `transition-all` default |
| Backdrop click | closes | — |

## Realization Decisions

### Adopted

- Top-anchored (`pt-[15vh]`) centered overlay; `max-w-xl` `rounded-2xl` `shadow-2xl` panel over `bg-background/20 backdrop-blur-md` backdrop; scale(0.95)+fade+y(-20) entrance.
- Search/prompt input row at top: `Search` icon + borderless input, `border-b` separating it from the command list.
- Command-row pattern with **primary command highlighted by full primary fill on hover**; right-aligned shortcut hint.

### Removed / Improved (command content is NOT adopted from prototype)

- The prototype's command set — `Quick Capture Scratch` (⌘K), `Create new Node` (N), `Create new Bit` (B) — and its free-text input are **visual-shell demo content**. The adopted palette **command set is fixed by the quick-capture DECISION** and is not reopened here: **key `1` = Scratch capture, key `2` = open the existing Search overlay (no Search redesign)**. The prototype's prompt/search input is a **visual reference only** — it must **not** be interpreted or implemented as an app-wide search/filter feature.
- Drop duplicated `text-left` classes.
- Define explicit motion values per DESIGN_TOKENS § Motion Language.
- Reuse the project overlay/blur token rather than literal `bg-background/20 backdrop-blur-md`.

## Token Contract Implications

| Token / contract area | Required rule | Source evidence |
|---|---|---|
| Overlay/backdrop | Shared blur-overlay token (consistent with entry surface + Search overlay) | Variant3 backdrop |
| Primary command emphasis | Selected/primary command = full `bg-primary text-primary-foreground` fill (distinct from `hover:bg-accent` for secondary) | primary vs secondary rows |
| Palette panel | `max-w-xl rounded-2xl shadow-2xl bg-popover` — aligns with other modal surfaces | Variant3 panel |

## Execution Handoff

EXECUTION_PLAN tasks for the Command Palette must reference this recipe and assert:

- visual shell: top-anchored `max-w-xl` palette, blur backdrop, prompt input row, command list with primary-fill highlight
- **command set/keys from the DECISION** (1 = Scratch, 2 = existing Search), not the prototype's Scratch/Node/Bit rows
- key `2` opens the **existing** Search overlay unchanged (no Search redesign — handoff §6)
- explicit motion values from DESIGN_TOKENS § Motion Language

## Open Questions

- Motion duration/easing not specified in source — phase-local; derive from DESIGN_TOKENS § Motion Language.
