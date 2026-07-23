# GridDO — Design Tokens

> **Scope:** Exact visual values — colors, typography, spacing, animations. Architecture lives in SPEC.md.
> **All values are exact (HSL, px, rem). No prose descriptions.**
> **Reference:** `docs/design-system-preview.html` | **Audit:** `docs/design-archaeology/DESIGN_AUDIT.md`

---

## Intentional Departures

Values that differ from `docs/design-system-preview.html` **on purpose**:

| # | Token / Component | HTML reference | This file | Reason |
|---|-------------------|---------------|-----------|--------|
| 1 | Base font family | Inter (Google Fonts) | Geist Sans by default; Batch 2 color themes may override via `--theme-font` | Geist remains the default app/system font; color themes may opt into their own display fonts |
| 2 | Sidebar model | `52px` icon strip | `3rem` (48px) fixed icon rail, always visible | Phase 9: sidebar is now a permanent icon rail — no fold/unfold. Closest to the reference's icon strip model |

---

## Table of Contents

- [CSS Variables](#css-variables)
- [Color Theme System](#color-theme-system)
- [Calendar Visual Theme Contract](#calendar-visual-theme-contract)
- [Inbox / Triage Batch 2 Surface Contract](#inbox--triage-batch-2-surface-contract)
- [Responsive Grid Node Tokens](#responsive-grid-node-tokens)
- [Tailwind v4 Theme Bridge](#tailwind-v4-theme-bridge)
- [Motion Language](#motion-language)
- [Font Loading](#font-loading)
- [Component Usage Quick Reference](#component-usage-quick-reference)

---

## CSS Variables

> Variables are defined at the top level (not in `@layer base`). Tailwind v4 handles layer ordering internally.
>
> **Format:** Raw HSL channels without `hsl()` wrapper. The `@theme inline` block applies `hsl()` when mapping to utility classes.

Colors in HSL without `hsl()` wrapper (shadcn convention). Shadcn core tokens first, then GridDO extensions.

```css
:root {
    /* ── Shadcn Core Tokens (Light Mode) ── */
    --background: 0 0% 100%;              /* #ffffff — main surface */
    --foreground: 240 10% 3.9%;            /* #09090b — primary text */

    --card: 0 0% 100%;                     /* #ffffff — Node/Bit card surface */
    --card-foreground: 240 10% 3.9%;

    --popover: 0 0% 100%;                  /* #ffffff — Bit detail, search overlay */
    --popover-foreground: 240 10% 3.9%;

    --primary: 221 83% 53%;                /* #3b82f6 — interactive blue */
    --primary-foreground: 210 40% 98%;     /* #f8fafc — text on primary */

    --secondary: 240 5% 96%;              /* #f4f4f5 — subtle surface */
    --secondary-foreground: 240 6% 10%;    /* #18181b */

    --muted: 240 5% 96%;                  /* #f4f4f5 — disabled, placeholder */
    --muted-foreground: 240 4% 46%;        /* #71717a — secondary text */

    --accent: 240 5% 96%;                 /* #f4f4f5 — hover state surface */
    --accent-foreground: 240 6% 10%;

    --destructive: 0 84% 60%;             /* #ef4444 — delete, danger actions */
    --destructive-foreground: 0 0% 98%;

    --border: 240 6% 90%;                 /* #e4e4e7 — card/cell borders */
    --input: 240 6% 90%;                  /* #e4e4e7 — input borders */
    --ring: 221 83% 53%;                  /* matches primary — focus ring */

    --radius: 0.625rem;                    /* 10px — base border-radius */

    /* ── GridDO Extension Tokens ── */

    /* Priority Colors */
    --priority-high: 0 84% 60%;            /* #ef4444 — red */
    --priority-high-bg: 0 84% 97%;         /* #fef2f2 — light mode background tint */
    --priority-mid: 45 93% 47%;            /* #eab308 — amber */
    --priority-mid-bg: 45 93% 97%;         /* #fefce8 */
    --priority-low: 217 91% 60%;           /* #3b82f6 — blue */
    --priority-low-bg: 217 91% 97%;        /* #eff6ff */

    /* Urgency Colors (deadline blinking) */
    --urgency-1: 0 72% 70%;               /* #e88a8a — light red, 3 days */
    --urgency-2: 0 84% 60%;               /* #ef4444 — medium red, 2 days */
    --urgency-3: 0 72% 45%;               /* #c53030 — deep red, 1 day / D-day */
    --urgency-badge: 0 84% 60%;           /* #ef4444 — badge on Nodes */

    /* Aging System (filter values, not colors) */
    --aging-fresh-filter: saturate(1);
    --aging-stagnant-filter: saturate(0.5) brightness(0.9);
    --aging-neglected-filter: saturate(0.2) brightness(0.75);
    --aging-dust-opacity: 0.3;

    /* Motion */
    --motion-duration-affordance: 150ms;
    --motion-duration-theme: 300ms;

    /* Grid Layout — input tokens / policy knobs */
    --grid-cols: 18;                       /* ← 12 (original) → 15 → 18 during Phase 9 density tuning */
    --grid-rows: 9;
    --grid-gap: 0.5rem;                    /* 8px — gap between cells */
    --grid-cell-min: 5rem;                 /* 80px — minimum cell dimension */
    --grid-inset: 0.75rem;                 /* 12px — spacing within cell; used in node sizing formula */
    --grid-node-max-size: 96px;            /* cap — node squares do not exceed this on large displays */
    --grid-line-color: 240 6% 90%;         /* same as --border */
    --grid-line-opacity-l0: 0.15;          /* Level 0 — standard density */
    --grid-line-opacity-l1: 0.12;
    --grid-line-opacity-l2: 0.08;
    --grid-line-opacity-l3: 0.05;          /* Level 3 — thinnest, densest */
    /* Node sizing — static fallbacks; overridden by cell-scoped container query rules in globals.css */
    --grid-node-size: 6.15rem;
    --grid-node-icon-size: 2rem;
    --grid-node-title-height: 1.4rem;
    --grid-node-padding-x: 0.7rem;
    --grid-node-padding-top: 0.7rem;
    --grid-node-padding-bottom: 0.6rem;
    --grid-node-icon-lift: 0.65rem;

    /* Level Depth Backgrounds — warm beige scale (Phase 9) */
    --grid-bg-l0: 48 38% 91%;             /* warm beige — L0 */
    --grid-bg-l1: 48 30% 88%;             /* slightly deeper */
    --grid-bg-l2: 48 22% 85%;             /* deeper */
    --grid-bg-l3: 48 14% 82%;             /* deepest */

    /* Layout Dimensions */
    --sidebar-width: 3rem;                 /* 48px — fixed icon rail (Phase 9: was 14rem foldable) */
    --breadcrumb-height: 3rem;             /* 48px */
    --bit-detail-max-width: 40rem;         /* 640px — Bit detail popup */
    --bit-detail-max-height: 85vh;
    --search-overlay-width: 36rem;         /* 576px — search modal */

    /* Page Background (distinct from --background card surface) */
    --page-bg: hsl(38 28% 91%);            /* warm beige — body background in light mode */

    /* Calendar Layout */
    --calendar-pool-width: 18rem;          /* 288px — left panel (Node + Items pool) */
    --calendar-node-pool-ratio: 0.6;       /* 60% of left panel for Node pool */
    --calendar-day-min-width: 8rem;        /* 128px — minimum day column width */
}

.dark {
    /* ── Shadcn Core Tokens (Dark Mode) ── */
    --background: 240 10% 3.9%;            /* #09090b */
    --foreground: 0 0% 98%;               /* #fafafa */

    --card: 240 6% 8%;                     /* elevated surface — distinct from background */
    --card-foreground: 0 0% 98%;

    --popover: 240 6% 8%;                  /* same elevation as card */
    --popover-foreground: 0 0% 98%;

    --primary: 217 91% 60%;               /* #3b82f6 — brighter blue on dark */
    --primary-foreground: 222 47% 11%;

    --secondary: 240 4% 16%;              /* #27272a */
    --secondary-foreground: 0 0% 98%;

    --muted: 240 4% 16%;
    --muted-foreground: 240 5% 65%;        /* #a1a1aa */

    --accent: 240 4% 16%;
    --accent-foreground: 0 0% 98%;

    --destructive: 0 63% 31%;             /* #7f1d1d */
    --destructive-foreground: 0 0% 98%;

    --border: 240 4% 16%;                 /* #27272a */
    --input: 240 4% 16%;
    --ring: 217 91% 60%;

    /* ── GridDO Extension Overrides (Dark Mode) ── */

    /* Priority backgrounds darken for dark mode */
    --priority-high-bg: 0 84% 10%;        /* dark red tint */
    --priority-mid-bg: 45 93% 10%;        /* dark amber tint */
    --priority-low-bg: 217 91% 10%;       /* dark blue tint */

    /* Grid lines lighten on dark background */
    --grid-line-color: 240 5% 65%;

    /* Level Depth Backgrounds — dark mode, warm tones (Phase 9) */
    --grid-bg-l0: 48 15% 12%;
    --grid-bg-l1: 48 12% 10%;
    --grid-bg-l2: 48 9% 8%;
    --grid-bg-l3: 48 6% 6%;

    /* Page background — dark mode */
    --page-bg: hsl(240 10% 6%);            /* near-black, slightly lighter than --background */
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    background: var(--page-bg);
    @apply text-foreground antialiased;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}
```

---

## Color Theme System

> Batch 2 source recipe: `docs/recipes/theme-system-and-grid-batch2-visual-recipe.md`
>
> Color theme is a second visual axis layered on top of dark/light mode. Dark/light remains controlled by `next-themes` (`.dark`). Color theme is applied through `<html data-color-theme="...">`.

### Theme IDs

```ts
export const COLOR_THEMES = [
  "griddo",
  "tiny-desk",
  "neumorphism",
  "claymorphism",
  "origami",
  "terminal",
  "retro-mac",
  "graphite",
] as const;
```

| Theme | Label | Character | Font | Shape / border | Depth |
|---|---|---|---|---|---|
| `griddo` | GridDO | warm default GridDO identity | `var(--font-geist-sans)` | `--theme-radius: 1.5rem`; `--theme-border-width: 1px` | soft app shadow |
| `tiny-desk` | Tiny Desk | wooden planner / corkboard | `var(--font-playfair), serif` | `8px`; `3px` | natural offset shadow |
| `neumorphism` | New Morphism | soft grey extrusion | `var(--font-inter), sans-serif` | `20px`; `0px` | paired light/dark extrusion shadow |
| `claymorphism` | 3D Clay | glossy tactile clay | `var(--font-inter), sans-serif` | `32px`; `0px` | outer + inset clay shadow |
| `origami` | Origami | folded/faceted paper | `var(--font-space-mono), monospace` | `2px 12px 2px 12px / 12px 2px 12px 2px`; `1px` | folded paper shadow |
| `terminal` | Terminal | retro console | `var(--font-vt323), monospace` | `0px`; `2px` | no base shadow; hover glow |
| `retro-mac` | Retro Mac | classic Mac OS | `var(--font-space-mono), monospace` | `4px`; `2px` | hard offset shadow |
| `graphite` | Graphite | neutral architectural | `var(--font-inter), sans-serif` | `8px`; `2px` | restrained neutral shadow |

### Runtime Tokens

| Token / rule | Value / requirement |
|---|---|
| Runtime attribute | `<html data-color-theme="...">` |
| Default theme | `griddo` |
| Persistence key | `griddo-color-theme` |
| Validation | persisted value must be one of `COLOR_THEMES`; otherwise fall back to `griddo` |
| No-flash init | root layout sets `data-color-theme` before hydration using the persisted value |
| Theme picker | icon-only Palette trigger, `aria-label="Change color theme"`, swatch + label + selected check |

### Theme Variable Groups

Each color theme may override these variable groups. Components consume these variables through semantic classes or component-level theme classes; components must not branch on theme id except inside the theme picker.

| Group | Variables |
|---|---|
| Core shadcn | `--background`, `--foreground`, `--card`, `--primary`, `--border` |
| Page | `--page-bg` |
| Grid | `--grid-line-color`, `--grid-bg-l0`, `--grid-bg-l1`, `--grid-bg-l2`, `--grid-bg-l3` |
| Typography | `--theme-font` |
| Shape | `--theme-radius`, `--theme-border-width`, `--theme-border-style`, `--theme-line-style` |
| Depth | `--theme-card-bg`, `--theme-shadow`, `--theme-shadow-hover` |
| Calendar | `--calendar-cell-bg`, `--calendar-header-bg`, `--calendar-border-color`, `--calendar-grid-line-color`, `--calendar-cell-radius`, `--calendar-cell-shadow`, `--calendar-today-*` |

Inbox/Triage adds no display-label or theme-name tokens. Its components expose shared semantic
surface and state slots, then each `[data-color-theme]` realization maps those slots through the
Typography, Shape, and Depth groups above. Exact per-theme dimensions, ornament, fold, dither,
shadow stack, and interaction timing remain in
`docs/recipes/inbox-triage-visual-recipe-index.md` and its linked surface recipes. Components must
not branch on theme id to reproduce those mappings.

### Required Theme Classes

```css
.theme-node-card {
  background: var(--theme-card-bg);
  border-color: hsl(var(--border));
  border-radius: var(--theme-radius);
  border-style: var(--theme-border-style);
  border-width: var(--theme-border-width);
  box-shadow: var(--theme-shadow);
  font-family: var(--theme-font);
}

.theme-node-card:hover {
  box-shadow: var(--theme-shadow-hover);
}

.theme-grid-line {
  border-color: hsl(var(--border));
  border-radius: var(--theme-radius);
  border-style: var(--theme-line-style);
  border-width: var(--theme-border-width);
}

.theme-surface {
  background: var(--theme-card-bg);
  border-color: hsl(var(--border));
  border-radius: var(--theme-radius);
  border-style: var(--theme-border-style);
  border-width: var(--theme-border-width);
  box-shadow: var(--theme-shadow);
}

.theme-surface:hover {
  box-shadow: var(--theme-shadow-hover);
}
```

**Fidelity rule:** The **exact** per-theme values — all variable groups × 8 themes × light/dark, including the full `--theme-shadow` / `--theme-shadow-hover` / `--calendar-today-*` box-shadow strings — are the **source of record** in `docs/recipes/theme-system-and-grid-batch2-visual-recipe.md` § *Exact Theme Values (source of record)* — a verbatim copy of the prototype **base layer (`globals.css`: theme/calendar contract defaults, swatches, shared `.theme-*` classes) + the 7 override themes (`themes.css`)**, with the cascade/inheritance model documented. Implementation must copy those exact values; the summary tables in this section are navigational only and must not be used to reconstruct values from prose. If an exact value conflicts with accessibility, build constraints, or current app behavior, record the conflict explicitly instead of silently normalizing the theme.

### Font Loading

Batch 2 themes require these additional font variables in addition to Geist Sans/Mono:

| Font | CSS variable | Used by |
|---|---|---|
| Inter | `--font-inter` | `griddo` fallback-aligned variants, `neumorphism`, `claymorphism`, `graphite` |
| Playfair Display | `--font-playfair` | `tiny-desk` |
| Space Mono | `--font-space-mono` | `origami`, `retro-mac` |
| VT323 | `--font-vt323` | `terminal` |

Do not silently collapse all themes to Geist. If a font cannot be loaded, document the fallback and the reason.

---

## Calendar Visual Theme Contract

> Batch 2 source recipe: `docs/recipes/calendar-batch2-visual-recipe.md`

Calendar weekly and monthly views consume the color theme system through calendar-specific variables. These variables are theme-dependent and should be set by the active color theme.

| Token | Role |
|---|---|
| `--calendar-cell-bg` | Monthly date cell / weekly day column background |
| `--calendar-header-bg` | Weekday header row and weekly day header background |
| `--calendar-border-width` | Calendar cell border width |
| `--calendar-border-style` | Calendar cell border style |
| `--calendar-border-color` | Calendar non-today cell border |
| `--calendar-grid-line-color` | Monthly `gap-px` grid line background |
| `--calendar-cell-radius` | Date cell / day column radius |
| `--calendar-cell-shadow` | Non-today cell shadow |
| `--calendar-today-border-width` | Today cell border width |
| `--calendar-today-border-style` | Today cell border style |
| `--calendar-today-border-color` | Today cell border color |
| `--calendar-today-shadow` | Today cell shadow |

### Monthly Grid Contract

| Element | Required treatment |
|---|---|
| Weekday header row | 7-column row using `--calendar-header-bg` |
| Date grid | 7-column grid with `gap-px`; grid background uses `--calendar-grid-line-color` |
| Date cell | background/border/radius/shadow from calendar variables |
| Today date label | circular `bg-primary text-primary-foreground` badge |
| First of month | `MMM d` label, for example `May 1` |
| Other days | `d` label |
| Preview Node | compact square tile, background `node.color`, radius `var(--theme-radius, 6px)` |
| Preview Bit/Chunk | compact dot using parent color |

### Weekly Contract

| Element | Required treatment |
|---|---|
| Shared header | same header pattern as Monthly |
| Day column | background/border/radius/shadow from calendar variables |
| Today column | uses `--calendar-today-*` variables |
| Empty column | non-destructive dashed/empty drop affordance |

Calendar popup item controls must have visible `focus-visible` styling. Recheck `toSorted()` / `useMemo` only if implementation touches relevant list rendering or measurable render cost appears.

---

## Inbox / Triage Batch 2 Surface Contract

> Canonical surface index: `docs/recipes/inbox-triage-visual-recipe-index.md`
>
> The prior `docs/recipes/inbox-triage-batch2-visual-recipe.md` is superseded history. It remains
> reference-only because its hidden-label, compact-context, and active-column-search assumptions
> conflict with the current SPEC.

This section owns reusable Inbox/Triage visual contracts. SPEC.md owns behavior and accessibility;
the surface-first recipes own exact per-theme classes, values, ornament, and fidelity evidence.

### Shared Theme Mapping Hooks

Production markup exposes semantic role and state hooks; theme CSS owns their realization. Exact
selector organization may follow the existing component stylesheet conventions, but it must retain
these shared meanings:

| Hook | Contract |
|---|---|
| `data-triage-surface` | Identifies reusable roles such as panel, section chrome, Scratch item, Context, Breakdown row, candidate Node/Bit, Grid column, Node/Bit card, Placement, and Archive surface |
| `data-triage-state` | Space-separated state tokens: `selected`, `staged`, `invalid`, `pending`, `newly-placed`, and `completed` |

Using a token list allows composition such as `data-triage-state="selected newly-placed"`. Shared
components set role/state only; they do not select theme-specific class strings. Per-theme literal
colors, shadows, radii, clip paths, dither patterns, and ornaments live in theme CSS or recipe-backed
helpers, never repeated across React branches.

### Visible Section Identity And Shell

| Contract area | Required treatment |
|---|---|
| Workspace hierarchy | Preserve the four-area shell and its stable `60/40`, `60/40`, and Staging `35/65` divisions; dynamic status and placement surfaces do not resize it |
| Workspace spacing | Theme maps a stable shell inset and region gap; exact source values are `16px`, `20px`, or `24px` as recorded in the shell recipe |
| Panel material | Border, radius, fill, shadow/depth, and ornament form one coherent theme mapping; do not mix isolated values from another theme |
| Section chrome | `Scratch Pool`, `Breakdown`, `Staging`, and Grid identity remain visible through theme-specific header height, icon treatment, label typography, and divider |
| Hierarchy labels | Use `Home`, `Level 1`, `Level 2`, and `Level 3`; abbreviated `L1`, `L2`, `L3`, `Home-L3`, and similar metadata are not visual tokens |
| Scroll regions | Preserve wheel, trackpad, touch, keyboard, and drag-edge scrolling while hiding visible scrollbar chrome in every designated list/column |
| Overflow containment | Panels and child tracks retain stable dimensions with `min-h-0` and owned overflow; warnings, overlays, and confirmation controls remain reachable without parent growth |

Theme display aliases such as Tiny Desk `Library Index`, Retro Mac `Finder`, and Terminal
`GRID EXPLORER` are copy realizations, not token names. Their semantic and accessible identity is
always `Grid Explorer`.

### Semantic State Mapping

The shared component tree exposes six distinct semantic states. Theme CSS maps each state to the
existing material language; a generic opacity-only treatment is non-conforming.

| State | Required non-color cue | Owning recipe |
|---|---|---|
| Selected | Fill/depth change plus border, marker, or inversion; selection remains card/path focus | Grid Explorer, Scratch Pool |
| Staged | Material de-emphasis such as inset, flattening, ghosting, comment treatment, or dashed paper; no strike-through | Breakdown, Staging |
| Invalid target | Column background/depth signal plus a separate sharp warning layer; warning must not inherit blur or dimming | Placement Affordances |
| Pending confirmation | Static theme surface with stable status, source/path context, and fixed Confirm/Cancel slots | Staging, Placement Affordances |
| Newly Placed | Static marker/outline/background/corner/shadow on the actual Node/Bit card plus a stable Undo slot | Newly Placed And Undo |
| Completed | Theme-specific completion treatment on the existing Context plus a Breakdown-scoped veil/archive surface | Selected Scratch Context, Completion And Archive |

Selected and Newly Placed may coexist on one card and must remain distinguishable. Status styling
may use color, but also requires shape, text, marker, depth, line, or control cues. Repeating pulse,
blink, flicker, bounce, spin, and ambient shake are not semantic-state tokens.

### Scratch Pool

| Contract area | Required treatment |
|---|---|
| Structure | One upper tools region and one lower list/switcher region separated by the theme divider; search and sort share one expanded row |
| Width | Expanded/collapsed width is a theme mapping with a stable collapsed control column; exact pairs are recorded in the Scratch Pool recipe |
| Tool density | Search/sort controls use the theme's `24px`, `28px`, or `36px` control height |
| Selected Scratch | Map surface, foreground, border/depth, and a stable marker together; hover alone and opacity alone are insufficient |
| Collapsed switcher | Identity/count, expand control, and Scratch switchers stack vertically; marker dimensions cannot shift or obscure their inner dot/bar |
| Sort state | ASC/DESC modes have a persistent non-hover distinction; icon/text realization follows the theme recipe |
| Scroll | The list owns overflow and hides scrollbar chrome without hiding content or compact switchers |

Collapse trigger, preserved query, sorting behavior, and focus lifecycle belong to SPEC.md. The
recipe supplies exact widths, tool geometry, selected cues, and theme-specific transition timing.

### Selected Scratch Context And Breakdown

| Contract area | Required treatment |
|---|---|
| Signature Context scale | Context remains visibly larger than a row, approximately `2-2.5x` row prominence; source realizations use `min-height: 110px` or equivalent `28px` vertical padding |
| Context surface | Theme maps fill, border/radius, shadow/depth, and ornament as one unit; Context is a section between chrome and rows, not a row variant |
| Context type | Label, title, and created time use distinct levels; title is dominant; Edit and sort form one stable trailing control group |
| Context completion | Completed styling layers onto the same Context instead of replacing it with a generic card; repeated attention motion is removed |
| Breakdown row | Active and staged treatments use the same row geometry; staged adds a theme-specific non-color cue and never uses strike-through |
| Row action slot | Always-visible Edit/Trash controls reserve a stable trailing slot (`24px`, `28px`, or `32px` source sizes) so title width does not shift |
| Drag activator | Breakdown remains grip-only; the entire row is not a drag surface |
| Added/restored signal | Add, Unstage, and Undo restoration share one brief theme-specific signal with a reduced-motion static equivalent |
| Empty prompt | Normal idea-entry prompt and completion/reopen treatment are separate from row cards and remain quieter than active rows |
| List | The row list scrolls independently above a stable Add footer with hidden scrollbar chrome |

### Staging

| Contract area | Required treatment |
|---|---|
| Node/Bit geometry | Node is a square/object card and Bit is a horizontal/list row; both use one theme material family while retaining type-specific shape |
| Subsection split | Node and Bit tracks use the shared `35/65` structure and independent hidden-scrollbar overflow |
| Candidate drag | Candidate root is the full drag surface with no inner Grip; every grab point produces the same type-specific compact drag token |
| Pending candidate | Reuse the existing candidate card with one static pending layer; do not create a replacement card or repeating animation |
| Unstage overlay | Absolute temporary overlay with fixed height and matching scroll padding; it never changes Staging track height or blurs the section |
| Section alert | Theme-local, non-expiring status surface with item title, direct reason, accessible close control, and no built-in Retry button |

Final production BitCard typography/icon redesign is deferred. This promotion uses the approved
candidate geometry and current shared card surface rather than inventing a new Bit card system.

### Grid Explorer And Search

| Contract area | Required treatment |
|---|---|
| Normal mode | Preserve one theme-mapped header and four column surfaces with full labels, Nodes before Bits, and no duplicate selected-node title metadata |
| Column state | Selected treatment remains independent from Newly Placed; invalid treatment does not replace or dim the column title beyond legibility |
| Column scroll | Each column owns a fixed viewport, hidden scrollbar chrome, and stable bottom padding for placement controls |
| Search mode | Whole-hierarchy search replaces all four columns with one dedicated body; the old active-column filter, inline scoped input, and magnifier decoration are not promoted |
| Search realization | Exact result layout, density, duplicate indicator placement, loading, and error surfaces remain a phase-local Decision prerequisite requiring user approval |

Normal Explorer chrome and card grammar may inform the future result design, but they are not an
approved fallback. Display aliases remain locale/copy data rather than theme tokens.

### DnD States

| Contract area | Required treatment |
|---|---|
| Compact drag token | Breakdown Grip and full-card staged candidate both render the same pointer-centered, type-specific token instead of a native row/card snapshot |
| Invalid background | Theme maps denied state through column fill/depth/material; color may support the state but cannot be its only signal |
| Invalid warning | Separate high-contrast static layer remains sharp above any blur/dim treatment and names the denied type/path rule directly |
| Direct type choice | Opaque, column-scoped theme surface with visible disabled type and reason; no translucent Glassmorphism prelayer |
| Confirmation | Stable source/type/path/status and Confirm/Cancel slots; pending state keeps the same surface mounted |
| Placement scrolling | Affordance participates in the target column's scroll content and reserves enough bottom space for all actions without column growth |

Full-screen placement dialogs, automatic target correction, emoji type markers, hidden keyboard
commands, and repeating warning animations are not part of the token contract.

### Newly Placed And Undo

| Contract area | Required treatment |
|---|---|
| Base card | Use the existing Node/Bit dimensions, padding, radius, color, icon, and internal grammar; no placed-indicator or wrapper-card geometry |
| Newly Placed marker | Static per-theme marker independent from selected fill; outline/background/shadow/corner ornament may vary by recipe |
| Undo slot | Stable trailing control with the same theme material and a clear accessible label; it does not replace card selection/navigation semantics |
| State composition | Selected, Newly Placed, and selected-plus-Newly-Placed remain visually distinct on both Node and Bit cards |
| Motion | Focus/reveal may use one direct transition; no repeat pulse or blink, and reduced motion uses the static marker |

### Completion And Archive

| Contract area | Required treatment |
|---|---|
| Completion veil | Theme maps one Breakdown-only dim/blur treatment behind a sharp Archive surface; the rest of Inbox remains sharp and usable |
| Archive surface | Theme maps panel, border/radius, shadow/depth, typography, status, and Cancel/Archive controls as one section-scoped construction |
| Completed Context | The existing Selected Scratch Context changes status through a static theme treatment; it is not replaced by a generic completion card |
| Reopen action | One stable `Show archive dialog` control appears only after Cancel or eligible re-entry and is hidden while the overlay is open |
| Pending/recovery | Archive pending, failure, and reconciliation stay inside the same surface with visible status and accessible announcement |
| Attention motion | Completion is static; urgency is carried by hierarchy, contrast, copy, and announcement rather than repeating animation |

---

## Responsive Grid Node Tokens

Grid node sizing uses a **three-layer token model** to keep the design-token workflow as the authority while adapting node dimensions to actual cell size at runtime.

### Layer 1 — `:root` input tokens / policy knobs

Defined in `globals.css` `:root` and documented here. Tunable by design.

| Token | Value | Role |
|-------|-------|------|
| `--grid-inset` | `0.75rem` | Spacing subtracted from cell dimension to get node size |
| `--grid-node-max-size` | `96px` | Cap — nodes do not exceed this on large displays |
| `--grid-cols` | `18` | Grid column count |
| `--grid-rows` | `9` | Grid row count |
| `--grid-gap` | `0.5rem` | Gap between cells |

### Layer 2 — Cell-scoped derived tokens

Set on children of each `.grid-cell-container` div via CSS container queries. `cqw`/`cqh` units resolve against the cell container — no JS required.

**Container rule (in `globals.css`):**

```css
.grid-cell-container {
  container-type: size;
  container-name: grid-cell;
}

@container grid-cell (min-width: 0px) {
  .grid-cell-container > * {
    --grid-node-size: min(
      calc(min(100cqw, 100cqh) - var(--grid-inset)),
      var(--grid-node-max-size, 96px)
    );
    --grid-node-icon-size:      max(calc(var(--grid-node-size) * 0.325), 1.5rem);
    --grid-node-title-height:   max(calc(var(--grid-node-size) * 0.23),  1.125rem);
    --grid-node-padding-x:      max(calc(var(--grid-node-size) * 0.11),  0.5rem);
    --grid-node-padding-top:    max(calc(var(--grid-node-size) * 0.11),  0.5rem);
    --grid-node-padding-bottom: max(calc(var(--grid-node-size) * 0.1),   0.4375rem);
    --grid-node-icon-lift:      max(calc(var(--grid-node-size) * 0.1),   0.375rem);
  }
}
```

**Proportional ratios and readability floors:**

| Token | Ratio | Floor |
|-------|-------|-------|
| `--grid-node-icon-size` | `nodeSz × 0.325` | `1.5rem` (24px) |
| `--grid-node-title-height` | `nodeSz × 0.23` | `1.125rem` (18px) |
| `--grid-node-padding-x` | `nodeSz × 0.11` | `0.5rem` (8px) |
| `--grid-node-padding-top` | `nodeSz × 0.11` | `0.5rem` (8px) |
| `--grid-node-padding-bottom` | `nodeSz × 0.10` | `0.4375rem` (7px) |
| `--grid-node-icon-lift` | `nodeSz × 0.10` | `0.375rem` (6px) |

**CSS scope note:** An element with `container-type: size` cannot use `cqw`/`cqh` to query its own dimensions — those units resolve against the nearest *ancestor* container. The derived token vars are therefore set on `.grid-cell-container > *` (children), not on the container element itself.

### Layer 3 — Component consumers

Components consume `--grid-node-*` vars unchanged. No component edits are needed when tuning Layer 1 policy knobs.

| Component | Tokens consumed |
|-----------|----------------|
| `node-card.tsx` | `--grid-node-size`, `--grid-node-icon-size`, `--grid-node-title-height`, `--grid-node-padding-*`, `--grid-node-icon-lift` |
| `grid-cell.tsx` | `--grid-node-size` (dotted area and drag indicator footprint) |

---

## Tailwind v4 Theme Bridge

> This block replaces `tailwind.config.ts`. Tailwind v4 uses CSS-first configuration — all theme extensions live in `globals.css`.

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  /* ── Colors (shadcn core) — generates bg-*, text-*, border-* utilities ── */
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-page-bg: var(--page-bg);         /* body background surface */

  /* ── Colors (GridDO priority) ── */
  --color-priority-high: hsl(var(--priority-high));
  --color-priority-high-bg: hsl(var(--priority-high-bg));
  --color-priority-mid: hsl(var(--priority-mid));
  --color-priority-mid-bg: hsl(var(--priority-mid-bg));
  --color-priority-low: hsl(var(--priority-low));
  --color-priority-low-bg: hsl(var(--priority-low-bg));

  /* ── Colors (GridDO urgency) ── */
  --color-urgency-1: hsl(var(--urgency-1));
  --color-urgency-2: hsl(var(--urgency-2));
  --color-urgency-3: hsl(var(--urgency-3));
  --color-urgency-badge: hsl(var(--urgency-badge));

  /* ── Fonts — generates font-sans, font-mono utilities ── */
  --font-sans: var(--font-geist-sans), -apple-system, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), monospace;

  /* ── Spacing — generates w-*, p-*, m-*, gap-* utilities ── */
  --spacing-sidebar: var(--sidebar-width);
  --spacing-breadcrumb: var(--breadcrumb-height);

  /* ── Container — generates max-w-* utilities ── */
  --container-bit-detail: var(--bit-detail-max-width);
  --container-search-overlay: var(--search-overlay-width);
  --container-calendar-pool: var(--calendar-pool-width);

  /* ── Border Radius — generates rounded-* utilities ── */
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);

  /* ── GridDO Custom Animations (not from tw-animate-css) ── */
  --animate-jiggle: jiggle 0.3s ease-in-out infinite;
  --animate-urgency-blink-1: urgency-blink 3s ease-in-out infinite;
  --animate-urgency-blink-2: urgency-blink 2s ease-in-out infinite;
  --animate-urgency-blink-3: urgency-blink 1s ease-in-out infinite;
  --animate-float: float 4s ease-in-out infinite;

  @keyframes jiggle {
    0%, 100% { transform: rotate(-1.5deg); }
    50% { transform: rotate(1.5deg); }
  }
  @keyframes urgency-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
}
```

**Token scope — what is NOT in `@theme inline`:**

The following CSS variables are consumed via `var()` in component styles or JavaScript, not as Tailwind utility classes. They remain as plain CSS variables in `:root` / `.dark`:

| Variable group | Reason |
|---|---|
| `--aging-fresh-filter`, `--aging-stagnant-filter`, `--aging-neglected-filter`, `--aging-dust-opacity` | Applied as `filter:` values — stagnant includes `brightness(0.9)`, neglected `brightness(0.75)` |
| `--motion-duration-affordance`, `--motion-duration-theme` | CSS-native transition durations; Motion runtime uses `src/lib/animations/motion-language.ts` |
| `--grid-cols`, `--grid-rows`, `--grid-gap`, `--grid-cell-min` | Consumed by CSS Grid template or inline styles |
| `--grid-inset`, `--grid-node-max-size` | Layer 1 policy knobs for cell-scoped node sizing |
| `--grid-node-size`, `--grid-node-icon-size`, `--grid-node-title-height`, `--grid-node-padding-*`, `--grid-node-icon-lift` | Layer 2 derived sizing tokens — computed via `@container grid-cell` rules; `:root` values are static fallbacks only |
| `--grid-line-color`, `--grid-line-opacity-l*` | Per-level logic via inline styles |
| `--grid-bg-l0` through `--grid-bg-l3` | Per-level background via inline styles |
| `--calendar-node-pool-ratio`, `--calendar-day-min-width` | CSS flexbox/grid or inline styles |
| `--theme-font`, `--theme-radius`, `--theme-border-width`, `--theme-border-style`, `--theme-line-style`, `--theme-card-bg`, `--theme-shadow`, `--theme-shadow-hover` | Batch 2 color theme surface contract; consumed by `.theme-node-card`, `.theme-grid-line`, `.theme-surface` |
| `--calendar-cell-bg`, `--calendar-header-bg`, `--calendar-border-*`, `--calendar-grid-line-color`, `--calendar-cell-radius`, `--calendar-cell-shadow`, `--calendar-today-*` | Batch 2 calendar visual theme contract; consumed by calendar cell/day-column inline styles |
| `--bit-detail-max-height` | Inline style or direct CSS `max-height` |

**Structural constraints for `globals.css`:**

- `@import` statements come first (`"tailwindcss"`, then `"tw-animate-css"`)
- `@custom-variant dark` precedes `@theme inline`
- `@theme inline` contains all utility-generating tokens, including `--animate-*` values and their nested `@keyframes`
- `:root` and `.dark` blocks are top-level (not inside `@layer base`)
- `@layer base` contains only reset styles (`border-border`, `bg-background text-foreground`, `prefers-reduced-motion`)
- No ordering constraint between `@theme inline` and `:root`/`.dark`

**Note on animations:** GridDO custom keyframes (jiggle, blink, float) are defined inside `@theme inline` above. `tw-animate-css` is a separate package that provides animation utilities used by shadcn components (accordion, collapsible, etc.). The two sources are independent. Complex interaction-driven animations are handled by Motion in `src/lib/animations/`:

| Animation | Method | File |
|-----------|--------|------|
| Jiggle (edit mode) | CSS `animate-jiggle` | `@theme inline` keyframe |
| Urgency blink | CSS `animate-urgency-blink-{1,2,3}` | `@theme inline` keyframe |
| Floating idle | CSS `animate-float` | `@theme inline` keyframe |
| Sinking (completion) | Motion `AnimatePresence` + exit variant | `src/lib/animations/grid.ts` |
| Creation (node/bit appear) | Motion spring scale+fade (`stiffness: 400, damping: 25`) | `src/lib/animations/grid.ts` |
| Deletion (node/bit remove) | Motion exit shrink+fade (`duration: 0.2, easeIn`) | `src/lib/animations/grid.ts` |
| Task tossing (drag into Node) | Motion spring transition | `src/lib/animations/grid.ts` |
| Magnet snap (grid/calendar) | Motion spring with damping | `src/lib/animations/grid.ts` |
| Day column expand (calendar) | Motion layout animation with vignette effect (column expands vertically, adjacent columns hidden) | `src/lib/animations/calendar.ts` |
| Search overlay open/close | Motion fade + scale | `src/lib/animations/layout.ts` |
| Bit detail popup | Motion fade + slide-up | `src/lib/animations/layout.ts` |

---

## Motion Language

GridDO source extraction targets:

| Interaction | Source behavior | GridDO2 token |
|-------------|-----------------|---------------|
| Node hover | `whileHover={{ scale: 1.05, zIndex: 40 }}` | `motionScale.nodeHover = 1.05`, `motionZIndex.nodeHover = 40` |
| Node drag lift | `whileDrag={{ scale: 1.1, zIndex: 50 }}` | `motionScale.nodeDrag = 1.1`, `motionZIndex.nodeDrag = 50` |
| Sidebar pencil drag target | `animate={{ scale: 1.2, boxShadow: "0 0 20px var(--accent-muted)" }}` | `motionScale.sidebarDragTarget = 1.2`, `motionShadow.sidebarDragTarget = 0 0 20px hsl(var(--primary) / 0.45)` |
| Dark mode transition | `background-color 0.3s, color 0.3s` | `--motion-duration-theme: 300ms`, `motionDuration.theme = 0.3` |

Runtime motion values live in `src/lib/animations/motion-language.ts`. Component and domain animation files must import named tokens from that file instead of defining raw duration, scale, spring, shadow, or z-index values inline.

| Category | Token | Value |
|----------|-------|-------|
| Fast affordance | `motionDuration.affordance` / `--motion-duration-affordance` | `0.15s` / `150ms` |
| Normal layout | `motionDuration.layout` | `0.25s` |
| Modal enter | `motionDuration.modalEnter` | `0.2s` |
| Modal exit | `motionDuration.modalExit` | `0.15s` |
| Search exit | `motionDuration.searchExit` | `0.1s` |
| Item exit | `motionDuration.itemExit` | `0.2s` |
| Completion exit | `motionDuration.completionExit` | `0.3s` |
| Theme transition | `motionDuration.theme` / `--motion-duration-theme` | `0.3s` / `300ms` |
| Completion sink offset | `motionDistance.sink` | `8px` |
| Item exit y-offset | `motionDistance.itemExitY` | `8px` |
| Node hover scale | `motionScale.nodeHover` | `1.05` |
| Node drag scale | `motionScale.nodeDrag` | `1.1` |
| Sidebar drag target scale | `motionScale.sidebarDragTarget` | `1.2` |
| Motion scale spring | `motionSpring.scale` | `type: "spring"`, `stiffness: 550`, `damping: 30`, `restSpeed: 10` |
| Creation spring | `motionSpring.creation` | `type: "spring"`, `stiffness: 400`, `damping: 25` |
| Grid snap spring | `motionSpring.gridSnap` | `type: "spring"`, `stiffness: 200`, `damping: 15` |

### Inbox / Triage Motion Mapping

- Scratch Pool width transitions and direct-manipulation lift/press behavior use the exact per-theme
  timings in the owning surface recipe. Implementation exposes them through named runtime mappings
  in `src/lib/animations/motion-language.ts`; components do not inline raw spring or duration values.
- Added/restored Breakdown rows use the recipe's single `500-700ms` transition and `800ms` static
  reduced-motion equivalent without changing row geometry.
- Selected, staged, invalid, pending, Newly Placed, and completed status remain legible as static
  states. Repeating attention animation is prohibited even when the prototype source contains it.
- Focus/reveal and affordance enter/exit may use direct transitions, but reduced motion resolves
  immediately to the same final marker, outline, depth, or status surface.

---

## Font Loading

| Font | Loading Method | CSS Variable | Tailwind Class |
|------|---------------|-------------|----------------|
| Geist Sans | `next/font/local` via `geist` package | `--font-geist-sans` | `font-sans` |
| Geist Mono | `next/font/local` via `geist` package | `--font-geist-mono` | `font-mono` |
| Inter | `next/font/google` | `--font-inter` | consumed through `--theme-font` |
| Playfair Display | `next/font/google` | `--font-playfair` | consumed through `--theme-font` |
| Space Mono | `next/font/google` | `--font-space-mono` | consumed through `--theme-font` |
| VT323 | `next/font/google` | `--font-vt323` | consumed through `--theme-font` |

**Wiring chain:**

```
Geist Sans: geist/font (next/font) → --font-geist-sans (on <html>) → font-sans (Tailwind) → className="font-sans"
Geist Mono: geist/font/mono (next/font) → --font-geist-mono (on <html>) → font-mono (Tailwind) → className="font-mono"
Batch 2 display fonts: next/font/google → --font-* variables (on <html>) → --theme-font → theme-aware surfaces
```

**Root layout font loading:**

```tsx
// src/app/layout.tsx
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Inter, Playfair_Display, Space_Mono, VT323 } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono" });
const vt323 = VT323({ subsets: ["latin"], weight: "400", variable: "--font-vt323" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${inter.variable} ${playfairDisplay.variable} ${spaceMono.variable} ${vt323.variable}`}
    >
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
```

---

## Component Usage Quick Reference

All classes reference CSS variables + Tailwind config above. No hardcoded hex or arbitrary values.

### Node Card

```tsx
{/* Node — Motion hover/drag scale; sizing comes from grid-node tokens */}
<motion.button
  animate={isDragging ? "dragging" : "rest"}
  className="theme-node-card grid h-[var(--grid-node-size)] w-[var(--grid-node-size)]
             grid-rows-[1fr_var(--grid-node-title-height)] rounded-3xl bg-card
             transition-[box-shadow,background-color] hover:bg-muted/40"
  transition={nodeCardTransition}
  variants={nodeCardVariants}
  whileHover={isDragging ? undefined : "hover"}
>
  {/* Icon — color from Node.color */}
  <div className="flex min-h-0 items-center justify-center pb-[var(--grid-node-icon-lift)]">
    <Icon
      className="h-[var(--grid-node-icon-size)] w-[var(--grid-node-icon-size)] shrink-0"
      style={{ color: node.color }}
    />
  </div>
  {/* Title */}
  <div className="h-[var(--grid-node-title-height)] w-full overflow-hidden">
    <p className="truncate whitespace-nowrap text-center text-[11px] font-semibold">
      {node.title}
    </p>
  </div>
</motion.button>
```

### Bit Card (Grid View)

Two-row layout: top row has content, bottom row has progress (only when chunks exist).

```tsx
{/* Bit — two-row rectangle. padding: 10px 14px 10px 12px */}
<div className="flex flex-col rounded-[var(--radius)] bg-card shadow-sm border border-border overflow-hidden
                pt-[10px] pr-[14px] pb-[10px] pl-3">
  {/* ── Top row ── */}
  <div className="flex items-center gap-[10px]">
    {/* Color bar */}
    <div className="w-[3px] self-stretch rounded-[2px] flex-shrink-0"
         style={{ backgroundColor: parentColor }} />
    {/* Icon */}
    <Icon className="w-[18px] h-[18px] text-muted-foreground flex-shrink-0" />
    {/* Content */}
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-medium text-foreground truncate">{title}</p>
      {deadline && (
        <p className="text-[11px] text-muted-foreground mt-px">{formattedDeadline}</p>
      )}
    </div>
    {/* Priority badge */}
    {priority && (
      <span className={cn(
        "inline-flex items-center py-[2px] px-[7px] rounded-full flex-shrink-0",
        "text-[10px] font-semibold uppercase tracking-[0.05em]",
        priority === "high" && "bg-priority-high-bg text-priority-high",
        priority === "mid" && "bg-priority-mid-bg text-priority-mid",
        priority === "low" && "bg-priority-low-bg text-priority-low",
      )}>
        {priority}
      </span>
    )}
  </div>
  {/* ── Bottom row — only when chunks exist ── */}
  {totalChunks > 0 && (
    <div className="flex items-center gap-2 mt-2 pl-[3px]">
      <div className="flex-[0_0_80%] h-[5px] rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${(completedChunks / totalChunks) * 100}%` }}
        />
      </div>
      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
        {completedChunks} / {totalChunks}
      </span>
    </div>
  )}
</div>
```

### Compact Bit (Calendar Day Column — 2+ items)

```tsx
{/* Compact list item — colored left border, title, time */}
<div className="flex items-center gap-2 px-3 py-1.5 border-l-4 text-sm" style={{ borderLeftColor: parentColor }}>
  <span className="flex-1 truncate text-foreground">{title}</span>
  {time && <span className="text-xs text-muted-foreground flex-shrink-0">{formattedTime}</span>}
</div>
```

### Grid Cell

```tsx
{/* Grid cell — aspect ratio adapts to grid, theme-aware line treatment */}
<div className={cn(
  "theme-grid-line relative rounded-md transition-all",
  isEditMode && "border-2 border-dashed border-muted-foreground/30",
  isEmpty && isEditMode && "flex items-center justify-center",
)}>
  {isEmpty && isEditMode && (
    <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
      <PlusIcon className="w-5 h-5" />
    </button>
  )}
</div>
```

### Sidebar

```tsx
{/* Sidebar — fixed icon rail, always visible (Phase 9: was foldable) */}
<nav className="fixed left-0 top-0 h-full w-sidebar bg-background border-r border-border flex flex-col items-center gap-1 py-4 px-1 z-40">
  {/* Top icons */}
  <SidebarButton icon={Plus} label="New" />        {/* triggers add-flow */}
  <SidebarButton icon={Pencil} label="Edit" />     {/* edit mode toggle */}
  <SidebarButton icon={Search} label="Search" />
  <div className="relative">
    <SidebarButton icon={Calendar} label="Calendar" />
    {urgencyLevel && (
      <span className={cn(
        "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full",
        urgencyLevel === 1 && "bg-urgency-1",
        urgencyLevel === 2 && "bg-urgency-2",
        urgencyLevel === 3 && "bg-urgency-3",
      )} />
    )}
  </div>

  {/* Bottom icons — mt-auto pushes to bottom */}
  <div className="mt-auto flex flex-col items-center gap-1">
    <SidebarButton icon={Trash2} label="Trash" />  {/* visible on all levels */}
    <SidebarButton icon={theme === "dark" ? Sun : Moon} label="Theme" />
  </div>
</nav>
```

### Search Overlay

```tsx
{/* Search — centered overlay on blurred background */}
<div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]">
  <div className="w-full max-w-search-overlay bg-popover rounded-xl border border-border shadow-2xl overflow-hidden">
    {/* Search input */}
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
      <Search className="w-5 h-5 text-muted-foreground" />
      <input
        className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
        placeholder="Search nodes, bits, chunks..."
        autoFocus
      />
    </div>
    {/* Results */}
    <div className="max-h-[50vh] overflow-y-auto py-2">
      {results.map((item) => (
        <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent cursor-pointer transition-colors">
          <TypeIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground truncate">{item.parentPath}</p>
          </div>
          {item.deadline && (
            <span className="text-xs text-muted-foreground flex-shrink-0">{item.formattedDeadline}</span>
          )}
        </div>
      ))}
    </div>
  </div>
</div>
```

### Breadcrumbs

```tsx
{/* Breadcrumb — top of grid */}
<nav className="flex flex-col gap-0.5 h-breadcrumb px-4 justify-center">
  <div className="flex items-center gap-1.5 text-sm">
    <button className="text-muted-foreground hover:text-foreground transition-colors">Home</button>
    {segments.map((seg) => (
      <>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <button className="text-muted-foreground hover:text-foreground transition-colors last:text-foreground last:font-medium">
          {seg.title}
        </button>
      </>
    ))}
  </div>
</nav>
```

### Ghost Placeholder (Onboarding)

```tsx
{/* Ghost placeholder — dashed outline, disappears after first item creation */}
<div className="border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center gap-2 p-4">
  <span className="text-sm text-muted-foreground/50">Try: Work</span>
</div>
```

### Blur + Overlay Pattern (Past Deadline / Conflict)

Blur is applied **to the card content** (`filter: blur(3px)`), not via `backdrop-filter`.
Buttons are `28×28px` (w-7 h-7). "Done?" text is foreground (not muted), semibold.

This generic card pattern does not define Inbox/Triage completion. The Archive flow uses the
Breakdown-scoped veil and sharp theme surface in the Completion And Archive recipe.

```tsx
{/* Blur + overlay — consistent "needs attention" pattern */}
<div className="relative">
  {/* Blurred item — filter on the content, not backdrop */}
  <div className="[filter:blur(3px)] pointer-events-none">
    <BitCard {...bitProps} />
  </div>
  {/* Overlay */}
  <div className="absolute inset-0 flex items-center justify-center gap-[10px] bg-background/50 rounded-[var(--radius)]">
    <span className="text-[13px] font-semibold text-foreground">{overlayText}</span>
    <button className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground">
      <Check className="w-3.5 h-3.5" />
    </button>
    <button className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-secondary-foreground">
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
</div>
```

### Timeline (Bit Detail — Chunk Timeline)

```tsx
{/* Vertical timeline with dots and connecting line */}
<div className="relative pl-8">
  {/* Vertical line */}
  <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-border" />
  {chunks.map((chunk) => (
    <div className="relative flex items-start gap-3 pb-6">
      {/* Dot */}
      <div className={cn(
        "relative z-10 w-3 h-3 rounded-full border-2 border-background mt-1.5",
        chunk.status === "complete" ? "bg-primary" : "bg-muted-foreground/30",
      )} />
      {/* Content */}
      <div className="flex-1">
        <p className={cn(
          "text-sm",
          chunk.status === "complete" && "line-through text-muted-foreground",
        )}>
          {chunk.title}
        </p>
        {chunk.time && (
          <p className="text-xs text-muted-foreground mt-0.5">{formattedTime}</p>
        )}
      </div>
    </div>
  ))}
</div>
```

### Inbox Badge (Triage)

Active-Scratch count badge on the Inbox system Node. Three-level pressure model (exact count; thresholds in `src/lib/constants.ts`). Colors use **semantic tokens — no hard-coded HSL**:

| Count | Level | Token mapping (Batch 1 baseline) |
|-------|-------|----------------------------------|
| 0 | hidden | no badge |
| 1–7 | neutral | `bg-muted text-muted-foreground` |
| 8–14 | warm | `bg-priority-mid-bg text-priority-mid` |
| 15+ | high-pressure | `bg-destructive text-destructive-foreground` |

> **Semantic reuse, not a new token:** the "warm" tier reuses the existing amber `--priority-mid` pair (`45 93% 47%`; medium-priority = caution), already wired in the theme bridge as `--color-priority-mid(-bg)`. This satisfies the "semantic tokens, no hard-coded HSL" rule without inventing a value. If the count-pressure scale later needs to diverge from task priority, a dedicated pressure token can be introduced in Batch 2 — Batch 1 does not require it.

### Compact Drag Token (Inbox/Triage)

Inbox/Triage drag previews use a **compact type-specific token**, not the native row/card snapshot
(SPEC Decision 16; pointer-centered targeting; valid / invalid / pending-confirmation target
states). Breakdown rows remain Grip-activated, while staged Node/Bit candidate roots are fully
draggable and have no inner Grip. Every valid grab point renders the same `TriageDragToken` for its
type. The existing calendar `compact-bit-item.tsx` full-surface preview remains the anti-pattern to
avoid. Exact theme realization and target-state treatment live in the Staging and Placement visual
recipes; no component may substitute a theme-specific native-card preview.

---

## Surface Recipes

> Surface recipes specify the compositional structure of visually sensitive surfaces.
> They combine atomic tokens (from CSS Variables above) with layout rules.
> All values are geometric — no prose descriptions.
> Reference for verification: the source image listed in each recipe header.
>
> Surface recipes are referenced by execution plan tasks via a `Recipe:` field.
> Larger surface recipes may live as standalone files under `docs/recipes/` and are linked below.

### Quick Capture `+` Entry Surface

> Recipe file: `docs/recipes/quick-capture-entry-surface-visual-recipe.md`
> Source: `prototype/future-ideas` @ `e662163` (`surface(main)` variant).
> Scope: anchored `+` entry-surface popover + Scratch capture modal. Geometric detail (classes, spacing, motion) lives in the recipe file; product behavior is in SPEC § Quick Capture `+` Entry Surface.

### Command Palette (Cmd+K)

> Recipe file: `docs/recipes/command-palette-visual-recipe.md`
> Source: `prototype/future-ideas` @ `e662163` (palette variant).
> Scope: Cmd+K command-palette visual shell. Command set/keys are a product rule (SPEC § Command Palette), not part of this visual recipe. Geometric detail lives in the recipe file.

### Batch 2 Theme System + Grid

> Recipe file: `docs/recipes/theme-system-and-grid-batch2-visual-recipe.md`
> Source: `prototype/future-ideas` @ `64e5236` and `5b3d3c0`.
> Scope: 8-theme runtime, theme variable contract, font/radius/border/shadow identity, color-theme picker, and theme-aware grid/node-card treatment.

### Batch 2 Calendar

> Recipe file: `docs/recipes/calendar-batch2-visual-recipe.md`
> Source: `prototype/future-ideas` @ `59ee937`.
> Scope: shared weekly/monthly header, theme-aware monthly grid, theme-aware weekly day columns, today marker, first-of-month label treatment, and calendar focus-visible polish.

### Batch 2 Inbox / Triage

> Canonical index: `docs/recipes/inbox-triage-visual-recipe-index.md`
> Source: `griddo2-claude-themes2-3` at `4f39709688ceb4cac5e15d4e3502186b1f1c801b`, reconciled with the current DECISION and production behavior contracts.
>
> The former `docs/recipes/inbox-triage-batch2-visual-recipe.md` is superseded and must not be used
> as an execution recipe.

| Surface | Recipe |
|---|---|
| Workspace shell and visible section chrome | `docs/recipes/inbox-triage-shell-section-chrome-visual-recipe.md` |
| Scratch Pool | `docs/recipes/inbox-triage-scratch-pool-visual-recipe.md` |
| Selected Scratch Context | `docs/recipes/inbox-triage-selected-scratch-context-visual-recipe.md` |
| Breakdown rows, lifecycle, and empty prompt | `docs/recipes/inbox-triage-breakdown-visual-recipe.md` |
| Staging candidates and unstage surfaces | `docs/recipes/inbox-triage-staging-visual-recipe.md` |
| Grid Explorer normal mode | `docs/recipes/inbox-triage-grid-explorer-visual-recipe.md` |
| Direct/staged placement affordances | `docs/recipes/inbox-triage-placement-affordances-visual-recipe.md` |
| Newly Placed and Undo | `docs/recipes/inbox-triage-newly-placed-undo-visual-recipe.md` |
| Completion and Archive | `docs/recipes/inbox-triage-archive-completion-visual-recipe.md` |

Execution tasks reference the smallest owning surface recipe plus the index's semantic-state matrix.
The exact whole-hierarchy search-result screen is intentionally absent until its user-approved
Decision prerequisite is complete.

### Bit Detail Surface

> Reference: `references/bitdetail0.png`

#### Overlay

```
fixed inset-0 z-50
Backdrop: bg-background/80 backdrop-blur-sm
Centering: flex items-center justify-center p-4
```

#### Container

```
max-w-[var(--bit-detail-max-width)]   /* 640px */
max-h-[var(--bit-detail-max-height)]  /* 85vh */
bg-popover rounded-xl border border-border shadow-xl
overflow-hidden

Optional — left accent border:
  border-l-[3px] colored by priority
  Not confirmed by reference. Include only if design review justifies it.
```

#### Header Row

```
Layout: flex items-center gap-3
Padding: px-5 pt-5 pb-0
Constraint: single-line. Title truncates. Right-side controls do not shrink.

Left group:
  Icon picker: h-9 w-9 flex-shrink-0, rounded-lg border border-input bg-background
    Contains: current Lucide icon h-5 w-5
    Click opens icon grid popover

  Title: flex-1 min-w-0 truncate
    text-lg font-semibold text-foreground
    bg-transparent, no visible border
    Editable inline (blur to save)

Right group: flex items-center gap-1 flex-shrink-0
  Status toggle: h-7 w-7 flex-shrink-0 rounded-md
    Active: Circle icon, text-muted-foreground
    Complete: CheckCircle2 icon, text-primary

  More menu: h-7 w-7 flex-shrink-0 rounded-md, MoreHorizontal icon
    Contains: Promote to Node (conditional), Move to trash

Note: Progress ring is no longer in the header. See Steps Header Row.
```

#### Priority + Meta Row

```
Layout: flex flex-wrap items-center gap-2
Padding: px-5 pt-1.5 pb-0

Priority badge (leftmost):
  rounded-full px-[7px] py-[2px]
  text-[10px] font-semibold uppercase tracking-[0.05em]
  high: bg-priority-high-bg text-priority-high
  mid:  bg-priority-mid-bg text-priority-mid
  low:  bg-priority-low-bg text-priority-low
  When null: bg-secondary text-muted-foreground, displays "—"
  Click cycles priority (existing behavior)

Deadline chips (when deadline is set):
  Date chip: Calendar h-3.5 w-3.5 icon + formatted date text + × button
    × click: clears deadline (sets to null)
    Date text click: opens edit state
  Time chip: Clock h-3.5 w-3.5 icon + formatted time text
    Hidden when deadlineAllDay is true
    Click: opens edit state
  ALL pill: rounded px-2 py-0.5 text-xs font-medium
    Active (all-day on): bg-primary text-primary-foreground
    Inactive: bg-secondary text-muted-foreground

  Edit state (on chip click):
    Native date input + time input (existing controls)
    ALL toggle (existing behavior)
    Dismiss on blur or ESC → returns to chip display

Deadline (when null):
  Button: flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground
  Icon: Calendar h-3.5 w-3.5 prefix
  Text: "Add date"
  Click: opens edit state (date/time inputs + ALL toggle)
```

#### Description (Collapsed by Default)

```
Padding: px-5
Default: not rendered when bit.description is empty
Auto-expand: rendered when bit.description is non-empty on load
Trigger (when empty): "Add description" — text-xs text-muted-foreground

When expanded:
  textarea min-h-[60px] w-full resize-none
  text-sm text-foreground bg-transparent
  placeholder: "Add a description…"
  Collapses when empty on blur
```

#### Steps Header Row

```
Layout: flex items-center justify-between
Padding: px-5 pt-3 pb-0

Left: "Add a step" button
  flex items-center gap-1.5 rounded-md px-2 py-1
  text-xs font-medium text-muted-foreground
  hover:bg-accent hover:text-foreground
  Icon: Plus h-3.5 w-3.5

Right: Progress ring (moved from header)
  w-10 h-10 flex-shrink-0
  SVG viewBox="0 0 40 40"
  Track: stroke hsl(var(--secondary)), strokeWidth 3
  Fill: stroke hsl(var(--primary)), strokeWidth 3, strokeLinecap round
  Center label: text-[10px] font-medium text-muted-foreground, "{pct}%"
  Hidden when totalChunks === 0
```

#### Chunk Area

```
Padding: px-5 pt-2 pb-5
Layout: relative pl-6

Vertical connecting line:
  absolute left-[11px] top-2 bottom-2 w-0.5 bg-border

Rendering order:
  Single unified list of all chunks, sorted by chunk.order (manual order).
  No separate timed-step section. Timed steps render inline with a time
  sub-label (see Step Item). Drag reordering applies to all steps.
```

#### Step Item

```
Layout: relative flex items-start gap-3 pb-5
No wrapping card — no border, no background, no card padding

Dot: relative z-10 mt-1 flex-shrink-0
  Size: w-3.5 h-3.5 rounded-full
  Complete:   bg-primary (solid fill, no border)
  Incomplete: bg-transparent border-2 border-muted-foreground/40

Content: flex-1 min-w-0
  Title: text-sm
    Default: text-foreground
    Complete: line-through text-muted-foreground
    Click to edit inline (input replaces text)
  Time (when set): text-xs text-muted-foreground mt-0.5
    Format: "Mon, 9:00 AM" / "Wed, 2:00 PM"

Hover affordances (opacity-0 → opacity-100 on parent hover):
  Drag handle: absolute -left-5 top-0.5, GripVertical h-3.5 w-3.5
  Delete: absolute right-0, Trash2 h-3.5 w-3.5
```

#### Deadline Footer

```
Position: below chunk area (outside chunk container)
Padding: px-5 pb-5
Layout: flex items-center gap-2

Icon: Clock h-4 w-4 text-destructive flex-shrink-0
Text: text-sm text-destructive
  Format: "Apr 16, 2026 12:00 AM" (full datetime)
         "Apr 16, 2026" (all-day)

Hidden when bit.deadline === null
```

#### Empty State (No Steps)

```
Centered within chunk area:
  Vertical line stub: h-8 w-0.5 bg-border
  Hollow dot: h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30
  "Add a step" button below
```
