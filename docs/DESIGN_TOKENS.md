# GridDO — Design Tokens

> **Scope:** Exact visual values where explicitly listed, plus canonical shared
> semantic visual roles and approved theme mappings. Architecture and product
> behavior live in SPEC.md.
> **Value honesty:** A numeric value is exact only when this document lists it
> and approved authority supports it. Semantic role requirements and `VQ-*`
> placeholders do not imply an absent color, opacity, shadow, size, duration,
> easing, delay, keyframe, copy string, icon, or layout value.
> **Inbox/Triage amendment status:** **User-approved 2026-07-28.** It
> derives only the approved `docs/DESIGN_TOKENS.md` row in the selected topic's
> [promotion map](brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/PROMOTION_MAP.md),
> after the approved [SCHEMA](SCHEMA.md) and [SPEC](SPEC.md) receipts, and does
> not authorize planning or production changes. The selected
> [decision](brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/DECISION.md)
> remains product authority within its declared scope.
> **Production derivation evidence:** Fresh reviewed DESIGN_TOKENS SHA-256
> `e07015e9df7e761173fa2547406637854fb0d63b323e3499e3379337740f3574`
> is read-only evidence, not canonical authority. Production authority is the
> approved map receipt `90022e7`, recipe receipt `7a15451`, SCHEMA receipt
> `250a1b5`, and SPEC content at `285e848` / SHA-256
> `f1157dbba76ad53fc5c6a5d524b7ad74a02099c93ab53b218ae755ebe1024778`
> with receipt `53c3fe9`.
> **Baseline locator note:** promotion-map citations into the prior token file
> refer to production base `a3c679c` (SHA-256 `b99df518...`). The production
> source tree remains `11e9c0f7ca226fdeee59a23ef164d3baa6823294`.
> **Reference:** `docs/design-system-preview.html` is a historical/global
> baseline only; it is not Inbox/Triage rendered authority.

---

## Inbox/Triage DESIGN_TOKENS Approval Receipt

- **Gate:** the production-adapted Inbox/Triage role/state contract, selected
  source-backed geometry, theme-family mappings, motion boundary, recipe
  package table, VQ register, and fidelity disclosure in this document.
- **User disposition:** approved through the prior detailed Fresh token review
  and the user's 2026-07-28 instruction to carry every canonical document
  through the final flow review.
- **Approved artifact:** commit
  `80b811ed94b1e28d1e09be5391aa303ca58aa8cd`, containing the exact
  pre-receipt `docs/DESIGN_TOKENS.md` whose SHA-256 is
  `ad8cec8b5b353879f613eb554bd370183af00a46664c717d8b143fa68b9d56e2`.
- **Parent receipts:** promotion map `90022e7`, recipe package `7a15451`,
  SCHEMA `250a1b5`, and SPEC `53c3fe9`.
- **Preserved boundary:** the amendment adopts no unsupported Inbox/Triage
  literal, no rendered-fidelity claim, and no automatic visual fallback for a
  `VQ-*` gap. The five selected deferrals remain outside this promotion. This
  receipt accepts no implementation, task, or phase.
- **Next legal action:** derive the complete replacement
  `docs/EXECUTION_PLAN.md` across Phase 23–33, then stop at its own durable gate
  before changing `docs/PLANNING_STANDARD.md`.

---

## Intentional Departures

Values that differ from `docs/design-system-preview.html` **on purpose**:

| # | Token / Component | HTML reference | This file | Reason |
|---|-------------------|---------------|-----------|--------|
| 1 | Base font family | Inter (Google Fonts) | Geist Sans by default; Batch 2 color themes may override via `--theme-font` | Geist remains the default app/system font; color themes may opt into their own display fonts |
| 2 | Sidebar model | `52px` icon strip | `3rem` (48px) fixed icon rail, always visible | Phase 9: sidebar is now a permanent icon rail — no fold/unfold. Closest to the reference's icon strip model |
| 3 | Inbox/Triage Batch 2 labels, Context, and search | Removed visible section labels; compact Context strip; active-column search | Visible theme chrome; standalone signature Context; `DP-VQ07` Choice A dedicated full-hierarchy replacement body | The approved mature-topic decision and Task 114 choice supersede the old Batch 2 direction; active-column/global search and ordinary columns remain prohibited substitutes |

---

## Table of Contents

- [CSS Variables](#css-variables)
- [Color Theme System](#color-theme-system)
- [Calendar Visual Theme Contract](#calendar-visual-theme-contract)
- [Inbox / Triage Surface Contract](#inbox--triage-surface-contract)
- [Responsive Grid Node Tokens](#responsive-grid-node-tokens)
- [Tailwind v4 Theme Bridge](#tailwind-v4-theme-bridge)
- [Motion Language](#motion-language)
- [Font Loading](#font-loading)
- [Component Usage Quick Reference](#component-usage-quick-reference)
- [Surface Recipes](#surface-recipes)

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
| Inbox/Triage | Proposed `data-triage-role` bindings and optional `--triage-<role>-*` aliases defined below; this amendment adopts role names and theme-family mappings, not missing values |

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

#### Proposed Inbox/Triage role and state targets

The generic `.theme-*` classes and eight-theme variables above exist in current
production. The Inbox/Triage bindings below are proposed canonical targets;
they are not claims that matching selectors, variables, or realization
components already exist. Product JSX supplies semantic role and state only.
It must not branch on theme ID or copy recipe literals into components.

The canonical role binding is `data-triage-role="<role>"`. A theme layer may
realize a role through an existing semantic token, a future
`--triage-<role>-*` alias, a shared class, or a theme realization component.
The `*` suffix is a namespace convention, not permission to invent a property
or value. Each role traces to the approved source-only recipe identified below
or to promotion-map §11.4's shared implication.

| Family | Canonical `<role>` values | Approved trace |
|---|---|---|
| Shell / chrome | `shell-background`, `section-surface`, `section-header`, `section-divider`, `internal-scroll-viewport`, `section-state-overlay` | `R-SHELL` |
| Scratch Pool | `pool-tools`, `pool-search-field`, `pool-total-count`, `pool-filtered-count`, `pool-selected-row`, `pool-compact-switcher`, `pool-compact-marker`, `pool-scroll-viewport`, `pool-status-band`, `pool-status-line`, `pool-status-action`, `pool-activity-marker` | `R-POOL`; status roles from `DP-VQ06-POOL` / Task 144 only |
| External Scratch removal | `external-removal-scrim`, `external-removal-panel`, `external-removal-title`, `external-removal-destination`, `external-removal-countdown-track`, `external-removal-countdown-fill`, `external-removal-draft-card`, `external-removal-copy-status`, `external-removal-primary-action`, `external-removal-secondary-action` | `DP-VQ01`; Task 141 only |
| Selected Context | `context-signature-plate`, `context-eyebrow-meta`, `context-title`, `context-action-cluster`, `context-complete-marker` | `R-CONTEXT` |
| Breakdown | `breakdown-active-row`, `breakdown-staged-row`, `breakdown-row-action`, `breakdown-add-field`, `breakdown-add-control`, `breakdown-ordinary-empty`, `breakdown-consumed-completion`, `breakdown-success-wash`, `breakdown-success-status`, `breakdown-success-check` | `R-BREAKDOWN`; success roles from `DP-VQ02` / Task 148 only |
| Staging | `staging-panel`, `staging-node-well`, `staging-node-card`, `staging-bit-well`, `staging-bit-row`, `staging-neutral`, `staging-unavailable`, `staging-invalid`, `staging-pending`, `staging-unstage-target`, `staging-operation-status`, `staging-arrival-count`, `staging-local-alert`, `staging-alert-action`, `staging-target-reason`, `staging-integrity-status` | `R-STAGING`; status roles from `DP-VQ06-STAGING` / Task 147 only |
| Grid Explorer base | `explorer-header`, `explorer-column`, `explorer-full-level-label`, `explorer-node-row`, `explorer-bit-row`, `explorer-eligible-target`, `explorer-hovered-target`, `explorer-invalid-target`, `explorer-unavailable-target`, `explorer-remote-count`, `explorer-path-status`, `explorer-status-action` | `R-EXPLORER`; status roles from `DP-VQ06-EXPLORER` / Task 150 only |
| Grid Explorer search | `explorer-search-entry`, `explorer-search-body`, `explorer-search-field`, `explorer-search-close`, `explorer-search-status`, `explorer-search-results`, `explorer-search-result`, `explorer-search-type`, `explorer-search-breadcrumb`, `explorer-search-duplicate`, `explorer-search-retry`, `explorer-search-undo`, `explorer-reveal-status`, `explorer-revealed-row` | `DP-VQ07`; complete body Task 151 and search-result Undo composition Task 158 only |
| Placement base | `placement-direct-shell`, `placement-staged-shell`, `placement-target-path`, `placement-confirm`, `placement-cancel`, `placement-full-target-warning`, `placement-confirm-disabled` | `R-PLACEMENT`; excludes `VQ-08` reliability realization and all `VQ-09` surfaces |
| Newly Placed / Undo | `newly-marker`, `newly-dot`, `newly-new-badge`, `newly-undo-action` | `R-NEWLY`; composes over the actual Node/Bit card and never replaces it |
| Archive / completion base | `archive-section-scrim`, `archive-card`, `archive-complete-context`, `archive-reopen`, `archive-action`, `archive-cancel` | `R-ARCHIVE`; excludes `VQ-11/12` gap realization |

The shared state binding is a whitespace-delimited
`data-triage-state="<state> …"` token list so independent states can coexist.
Native semantics (`disabled`, `aria-disabled`, `aria-current`,
`aria-selected`, live-region roles, and focus ownership) remain required where
appropriate; the data attribute never replaces them.

| `<state>` | Theme-independent meaning and minimum non-color contract |
|---|---|
| `working` | The active working presentation; it remains distinguishable from `completed` without inventing a VQ effect |
| `selected` | Current user selection; pair with the appropriate native selection/current semantic and a visible shape, marker, text, or icon cue |
| `staged` | Source retained but staged; expose a visible text/icon/shape cue and applicable interaction availability rather than opacity alone |
| `invalid` | The attempted target cannot accept the operation; keep it distinct from destructive meaning and provide a visible non-color cue |
| `unavailable` | The affordance is unavailable before a valid attempt; expose an accessible reason when SPEC requires one and do not collapse it into `invalid` |
| `pending-confirmation` | A valid intent awaits user confirmation before mutation; distinguish it from `pending` |
| `pending` | An authoritative result is outstanding; preserve the SPEC-owned stable focus target and lock only the conflicting actions named there |
| `reconciling` | An uncertain outcome is being checked; visible text/icon semantics distinguish it from both `pending` and success |
| `external-removal` | The selected Scratch is authoritatively archived or deleted elsewhere; stale work is inert and the dedicated `DP-VQ01` transition owns the workspace until restore or terminal handoff |
| `paused` | The `DP-VQ01` countdown is frozen at its exact remainder; destination changes update content without resuming it |
| `draft-copy-ready` | One full source-labeled page-memory draft remains available for copying before the external-removal handoff |
| `copied` | The matching full draft was copied once; preserve button focus and never infer persistence, countdown resume, or movement |
| `success` | Authoritative, non-repeating Add/Unstage success; `DP-VQ02` binds the exact row wash/check/text, polite status, focus preservation, and static reduced-motion equivalent consumed only by Task 148 |
| `hidden-selection` | The selected Scratch remains active but its row does not match the current Pool query; retain selection/Context and expose the `DP-VQ06-POOL` search-context line without a proxy row |
| `remote-arrival` | One or more active Scratches arrived remotely during the mounted Inbox page; expose the exact aggregate count without auto-selection or focus theft |
| `lifecycle-update` | One or more non-selected Scratches were externally archived, deleted, or restored; keep lifecycle categories distinct in the exact Pool-local aggregate copy |
| `source-unresolved` | A durable staged candidate's source join is temporarily unavailable without authoritative orphan proof; render only the type-shaped integrity status and never a normal draggable candidate |
| `orphan-cleanup` | Authoritative source deletion/tombstone proof completed the atomic candidate cleanup; announce the exact Staging-local result without inventing a missing title snapshot |
| `stale` | Current authority invalidated a drag, placement, candidate, or source snapshot; suppress stale mutation and expose the exact section-local reason after the applicable visual snapshot release |
| `explorer-remote-arrival` | One or more ordinary remote insertions first appeared in a currently open Explorer column; preserve path/selection/focus and stable-ID/offset anchoring while exposing only that column's exact count |
| `path-fallback` | Authority invalidated an Explorer suffix; remove only that suffix, use the nearest valid ancestor/Home without sibling or ghost substitution, and expose the exact affected-column status/focus contract |
| `selection-cleared` | A selected/revealed Bit disappeared while its parent path remained valid; clear only that selection/reveal and retain the parent path with the exact column-local status |
| `newly-placed` | Page-session provenance layered on the actual card; use `newly-*` roles and keep Undo separate |
| `completed` | Complete Context or completion presentation; do not treat it as Archive mutation success |
| `local-alert` | A section-local status with visible text/icon semantics and the SPEC-selected live/status behavior; it does not become a global toast by default |

Focus-visible treatment continues to use the canonical focus ring and the
SPEC-owned logical focus destination. Theme or future locale changes may swap
role realization and copy presentation only: they do not add/remove state
tokens, reset semantic state, move work to a different lifecycle, or start a
new mutation.

| Theme family | Approved Inbox/Triage realization mapping; no new literal values |
|---|---|
| GridDO | Reuse existing canonical semantic card, border, primary, muted, focus, and text tokens when they support the role. No absent exact GridDO value is inferred from prose or another theme. |
| Tiny Desk | Map roles through wood, cork, paper, and stationery aliases. |
| Neumorphism | Reuse the existing named inset/card shadow family for well, plate, card, and control roles. |
| Claymorphism | Map roles through panel, well, candidate, and action aliases backed by the existing clay family. |
| Origami | Map roles through paper, fold, facet, seam, and cut/tag aliases. |
| Terminal | Keep text/icon/non-color status roles variable-driven; product JSX carries no fixed terminal color. |
| Retro Mac | Map roles through stripe/title-bar, hard-shadow, pane, control, and dither aliases. |
| Graphite | Map roles through dark/subtle surfaces and restrained grayscale field, rule, and action aliases. |

**Fidelity rule:** For the existing Batch 2 core, page, Grid, typography,
shape, depth, and Calendar groups, the **exact** per-theme values — all 8
themes × light/dark, including the full `--theme-shadow` /
`--theme-shadow-hover` / `--calendar-today-*` strings — remain sourced by
`docs/recipes/theme-system-and-grid-batch2-visual-recipe.md` § *Exact Theme
Values (source of record)*. The proposed Inbox/Triage role/state targets above
have no newly adopted exact values in this amendment. Summary prose and one
theme's literals must never be used to reconstruct a missing value for another
theme. If an exact value conflicts with accessibility, build constraints, or
current app behavior, record the conflict explicitly instead of silently
normalizing it.

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

## Inbox / Triage Surface Contract

> **Amendment status:** **User-approved 2026-07-28**
>
> Product behavior, ownership, focus destinations, and lifecycle remain in
> approved SPEC. The approved nine-recipe package is source-only visual
> evidence. This document owns only the shared role/state vocabulary, selected
> source-backed geometry, and approved theme-family mappings.

Current production at base `a3c679c` has the generic `.theme-*`
classes, eight-theme variable runtime, compact pointer-centered
`TriageDragToken`, and older Inbox/Triage components. It does not yet implement
the proposed `data-triage-role` / `data-triage-state` contract or the complete
surface target below.

### Shared shell and surface meaning

| Surface | Canonical visual contract | Trace |
|---|---|---|
| Layout | Preserve main work versus Explorer `60/40`, Breakdown versus Staging `60/40`, and Staging Nodes versus Bits `35/65`. These selected ratios are source-backed product geometry, not VQ realization. | `R-SHELL`, `R-STAGING` |
| Visible identity | Theme chrome visibly identifies `Scratch Pool`, `Breakdown`, `Staging`, and semantic `Grid Explorer`. Only Tiny Desk `Library Index`, Retro Mac `Finder`, and Terminal `GRID EXPLORER` are approved alternate visible Explorer labels. Do not expose `L1`, `L2`, or `L3`; Explorer columns use full `Home`, `Level 1`, `Level 2`, and `Level 3` labels. | `R-SHELL`, `R-EXPLORER` |
| Internal scrolling | Pool list, Breakdown list, both Staging subsections, and every Explorer column scroll internally with scrollbar chrome hidden while ordinary pointer, touch, and keyboard scrolling remains available. | `R-SHELL`, surface recipes |
| Scratch Pool | Use the Pool role family for the tools/search region, total count, selected row, compact switcher/marker, and hidden-scroll viewport. Exact product behavior remains in SPEC. | `R-POOL` |
| Selected Scratch Context | Use the standalone signature plate above ordinary rows, never a compact context strip or heading metadata. Working and complete presentations share the Context role family but remain semantically distinct. | `R-CONTEXT` |
| Breakdown | Keep active and staged rows distinct, with grip/action, Add, ordinary-empty, and consumed-completion roles. Staged is not strike-through completion, and empty is not an Archive surface. | `R-BREAKDOWN` |
| Staging | Keep visible `Staging`, `Nodes`, and `Bits`; Node cards and Bit rows use distinct shapes and independent wells. Neutral, unavailable, invalid, pending, and transient unstage-target meanings stay separate and non-destructive. | `R-STAGING` |
| Explorer base | Use four ordinary progressive columns, full level labels, native Node/Bit row shapes, and eligible/hovered/invalid/unavailable target roles. This base excludes the absent replacement search body. | `R-EXPLORER` |
| Placement base | Direct and staged shells, target path, Confirm/Cancel, full-target warning, and disabled Confirm use the Placement base roles. The affordance stays inside the target column; unsupported reliability and Result Title/direct-limit bodies remain excluded. | `R-PLACEMENT` |
| Newly Placed / Undo | Compose a marker/dot or visible `NEW` badge over the actual Node/Bit card and expose Undo as a separate action. Never introduce a replacement indicator card. | `R-NEWLY` |
| Archive / completion base | Use a Breakdown-scoped scrim/card, complete Context, reopen, Archive, and Cancel base roles. Do not promote the surface into a page-wide overlay or infer its unresolved blocker/reliability variants. | `R-ARCHIVE` |

The shared compact drag preview remains pointer-centered and type-aware rather
than copying the full source row/card. Invalid and unavailable targets mean a
non-destructive operation cannot proceed; they must not inherit destructive
delete styling merely because the current drop is rejected.

The old active-section/active-column search is superseded and is not fallback
authority. `DP-VQ07` Choice A supplies the full-hierarchy replacement body;
global Search, the old active-column search, ordinary Explorer columns, and
Explorer chrome alone remain prohibited substitutes for that body.

### Approved external-removal realization — `DP-VQ01`

**User-approved 2026-08-09:** Choice A establishes one dedicated central
blocking transition panel for externally archived/deleted selected Scratches.
This removes `VQ-01` from the open absent-surface list without authorizing any
other VQ. The exact copy, geometry, state matrix, timing, controls, focus, and
theme mapping are owned by the Scratch Pool recipe and consumed only by Task
141.

| Contract | Exact token requirement |
|---|---|
| Geometry | `external-removal-scrim` covers and inerts the Inbox workspace; `external-removal-panel` is centered at `min(35rem, calc(100% - 2rem))` width and `calc(100% - 2rem)` maximum height; only the draft list scrolls |
| Countdown | `external-removal-countdown-track` is 4px high; `external-removal-countdown-fill` runs once, linearly, from full to empty over `5000ms`, freezes on `paused`, and restarts only when a running destination changes |
| Actions | Primary `Move now`; secondary `Pause`/`Resume`; text-only controls with the canonical focus ring; no Cancel and no Escape dismissal |
| Draft state | Source-labeled, selectable, untruncated `external-removal-draft-card`; `Copy full draft` becomes `Copied` in `external-removal-copy-status` without focus movement or countdown change |
| Accessibility | Dedicated `alertdialog`/modal semantics, inert stale workspace, one polite lifecycle/timing/destination announcement on entry plus one for a changed destination, no tick announcements, and the recipe-owned initial/terminal focus destinations |
| Theme invariance | Color theme or light/dark changes swap aliases only and never restart, pause, resume, dismiss, or mutate the transition |

The external-removal roles map through existing families without product JSX
theme branches or copied source literals:

| Theme | Role-family binding |
|---|---|
| GridDO | Semantic card/border/primary/muted/text/focus roles |
| Tiny Desk | Wood frame, paper notice, ruled draft, and stationery action roles |
| Neumorphism | Named inset track/panel and raised card/control shadow roles |
| Claymorphism | Panel, inset groove, raised action, and shape-led draft roles |
| Origami | Paper, fold, seam, facet, and asymmetric control roles |
| Terminal | Variable-driven editor/frame/block-progress/record/command roles |
| Retro Mac | Stripe/title-bar, 1-bit double-frame, segmented-progress, pane, and hard-control roles |
| Graphite | Dark/subtle editorial surface, fine rule, ruled block, and monochrome action roles |

### Approved Add/Unstage success realization — `DP-VQ02`

**User-approved 2026-08-09:** Choice A establishes one shared row-attached
success signal for Add and Unstage. This removes `VQ-02` from the open
existing-surface state gaps without authorizing another reliability state or
task. Task 148 consumes the exact recipe realization.

| Contract | Exact token requirement |
|---|---|
| Trigger identity | One newly observed local `{operation kind, operationId, target Breakdown row ID}`; direct `applied` or the current operation's first authoritative `already_applied` may trigger once |
| State binding | `data-triage-state="success"` on the exact target row and `data-triage-success-kind="add"` or `"unstage"`; no theme-ID or copy branch |
| Placement | `breakdown-success-wash` covers the unchanged row surface; the reserved non-interactive `breakdown-success-status` slot sits immediately before the stable action cluster; `breakdown-success-check` is literal `✓` and `aria-hidden` |
| Copy / announcement | `Added.` or `Returned to Breakdown.` is visible and announced once through a polite atomic status without focus theft |
| Motion | `--triage-success-wash-duration: 600ms`; `--triage-success-wash-easing: ease-out`; background and border return from success emphasis to active-row values with no transform or layout motion |
| Visibility | `--triage-success-status-duration: 1600ms`; check/copy remain static for the full interval and disappear without exit animation |
| Reduced motion | Skip the transition; retain an immediate static success border/surface plus the same check/copy for `1600ms`, then clear in one step |
| Retrigger / interruption | A different new success replaces the prior target and restarts once; same identity, rerender, hydration, reload, remote arrival, and replay do not trigger; Scratch/route exit clears it |
| Focus | Add remains in the Add input; Unstage remains on the restored source row; the signal has no focusable control |

The success roles map through the existing theme families while keeping one
semantic tree and exact copy:

| Theme | Role-family binding |
|---|---|
| GridDO | Primary-tinted semantic row surface/border/text roles |
| Tiny Desk | Paper-row highlight and stationery check-stamp roles |
| Neumorphism | Named raised success surface/shadow returning to ordinary row depth |
| Claymorphism | Shape-preserving glossy success surface and raised check roles |
| Origami | Paper highlight and emphasized seam/fold-edge roles |
| Terminal | Variable-driven record/background/border/check roles with no fixed JSX color |
| Retro Mac | 1-bit surface/border and hard-check roles without cycling inversion |
| Graphite | Restrained grayscale surface and strengthened editorial-rule roles |

### Approved Add-draft departure realization — `DP-VQ03`

**User-approved 2026-08-09:** Choice A establishes one Add-adjacent inline
decision sheet for app-internal departure with a non-empty Add draft. This
removes `VQ-03` from the open absent-surface list without changing Task 139,
native unload, or any other confirmation. Task 140 alone consumes the exact
recipe realization.

| Contract | Exact token requirement |
|---|---|
| Trigger / order | `data-triage-state="departure-decision"` exists only after an internal Scratch/path/route intent meets a non-empty Add draft and any required inline Save has resolved; native unload never binds it |
| Placement | `breakdown-departure-sheet` is an in-flow surface immediately below and edge-aligned with the complete Add input/control row; no portal, scrim, centered modal, toast lane, or row-action placement |
| Content roles | `breakdown-departure-eyebrow`, `breakdown-departure-heading`, and `breakdown-departure-description` render exact `Unsaved Add draft`, `Keep writing?`, and `Continue writing here, or discard this draft and move.` copy without dynamic destination text |
| Actions | `breakdown-departure-actions` orders primary/default `breakdown-departure-continue` (`Continue writing`) before destructive secondary `breakdown-departure-discard` (`Discard and move`); no close, backdrop, or third action |
| Focus / semantics | Labelled and described alert-dialog semantics; initial focus on Continue, sequential focus contained to two actions; Continue/Escape restore the Add caret while Discard hands focus to the performed destination |
| State continuity | A replacement headless destination preserves one sheet and static copy; theme/light-dark changes swap aliases only; no queued destination, stale destination copy, retrigger, or focus movement |
| Motion | Appearance and removal are immediate with no animation; reduced motion keeps the identical static surface, copy, hierarchy, focus, and lifecycle |
| Scope boundary | Generic Dialog/AlertDialog chrome, delete/archive confirmation, native unload UI, prototype literals, adjacent cards, and theme-ID behavior/copy branches are prohibited |

The departure roles map through the existing theme families while preserving
one semantic tree and exact copy:

| Theme | Role-family binding |
|---|---|
| GridDO | Restrained semantic panel/border/technical-label/primary/destructive-secondary roles |
| Tiny Desk | Attached paper-slip, ruled-divider, and stationery-action roles |
| Neumorphism | Inset decision-well and raised-primary roles with separate destructive secondary treatment |
| Claymorphism | Shape-preserving inset-sheet, raised-primary, and restrained destructive-secondary roles |
| Origami | In-flow paper-strip, seam, and asymmetric action-fold roles |
| Terminal | Variable-driven command-block and bracketed-action roles with no blink |
| Retro Mac | In-flow 1-bit pane, hard-border, and default-button roles without window chrome |
| Graphite | Editorial-note, strengthened-rule, solid-primary, and text-destructive roles |

### Approved dual inline-editor realization — `DP-VQ04`

**User-approved 2026-08-09:** Choice A replaces the Scratch title and active
Breakdown content directly inside their source Context/title and row/content
regions. One common state vocabulary drives both surfaces; Task 137 remains the
headless owner and Task 138 alone consumes this visual/copy contract.

| Contract | Exact token requirement |
|---|---|
| Surface binding | `data-triage-editor-surface="scratch-title"` or `"breakdown-content"`; `context-inline-editor` stays inside Context and `breakdown-inline-editor` inside the exact source/former row position |
| State binding | `data-triage-editor-state="pristine|dirty|validation|saving|offline|not-applied|reconciling|conflict|invalidated"`; no theme-ID or copy branch |
| Common roles | `inline-editor-field`, `inline-editor-status`, `inline-editor-actions`, `inline-editor-compare`, `inline-editor-latest`, `inline-editor-draft`, `inline-editor-recovery`, and `inline-editor-copy-status` |
| Base actions | Primary `Save`, secondary `Cancel`; pristine/validation Save disabled; unchanged Save/valid blur exits without a write; theme/locale activation and IME composition do not blur-save |
| State copy | `No changes.`, `Unsaved changes.`, surface-specific empty validation, `Saving…`, `Offline. Your draft is still here.`, `Not saved. Your draft is still here.`, and `Checking whether your changes were saved…` |
| Conflict | `This changed elsewhere.`, full labelled `Latest version` / `Your draft`, primary `Use mine`, secondary `Use latest`, tertiary `Copy draft`; latest refresh copy `Latest version updated.` |
| Recovery | `Draft not saved`, surface-specific no-longer-editable reason, `Review or copy your draft before closing.`, full `Your draft`, primary `Copy draft`, secondary `Close`; copy status `Copied.` |
| Pending intent | `Saving before continuing…` replaces ordinary saving copy; `Stay here` cancels only the pending intent, never the in-flight Save or draft |
| Completion / focus | Applied copy `Saved.` once; surviving Save/Cancel/Use latest returns to Edit; validation/conflict/offline/not-applied retain field focus; invalid row uses next-visible then Add fallback; invalid Scratch uses canonical Pool/selection fallback |
| Motion / lifetime | Static transitions only; no spinner rotation, pulse, bounce, blink, scale, or layout-transition animation; reduced motion is identical; all drafts/resolvers/recovery are mounted-page memory only |
| Scope boundary | No generic Dialog/AlertDialog, popover, detached conflict card, toast, prototype literal, adjacent editor, or theme-specific behavior/copy branch |

The two surfaces share one semantic state tree while consuming their existing
theme families:

| Theme | Shared editor-family binding |
|---|---|
| GridDO | In-place semantic fields, technical status rules, labelled comparison blocks, and canonical primary/secondary roles |
| Tiny Desk | Same-sheet ruled fields, paper status annotations, and labelled paper comparison/recovery sections |
| Neumorphism | Inset fields/comparison wells inside existing Context/row depth with raised actions |
| Claymorphism | Shape-preserving inset text channels, restrained seams, and raised actions within source silhouettes |
| Origami | Inline field, comparison, and recovery folds inside the same source paper geometry |
| Terminal | Variable-driven editable record lines and static status/diff blocks with no blink |
| Retro Mac | In-place 1-bit fields, hard status/comparison panes, and default-button hierarchy without new windows |
| Graphite | Editorial fields, strengthened status rules, and labelled manuscript comparison/recovery blocks |

### Approved Add/Delete attached reliability realization — `DP-VQ05`

**User-approved 2026-08-09:** Choice A binds Add reliability to the Add region
and Delete reliability to the exact source row. Task 136 remains headless;
Task 143 alone consumes this copy/visual contract.

| Contract | Exact token requirement |
|---|---|
| Surface binding | `data-triage-reliability-surface="add|delete"` with headless-authoritative `pending|unknown|reconciling|not-applied|rejected|conflict`; no theme-ID or copy branch |
| Add placement | `breakdown-add-reliability` is a reserved full-width second line inside the Add input/control grid; `breakdown-reliability-status` precedes one trailing `breakdown-reliability-action`; `DP-VQ03` stays below the complete Add region |
| Delete placement | `breakdown-delete-reliability` is a full-width second line inside the exact source row below its ordinary content/action line; width, identity, order, content, grip, Edit, and Trash positions stay stable |
| Add copy | `Adding…`; `We couldn’t confirm whether it was added.`; `Checking whether it was added…`; `Not added. Your draft is still here.`; `Add unavailable. Your draft is still here.`; `This Scratch changed. Your draft is still here.` |
| Add recovery | `Check again` only for unknown/reconciling; primary `Retry Add` only for authoritative `not_applied` with the same operation/row identity and snapshotted content; editing withdraws Retry; rejected/conflict return to a new ordinary Add path |
| Delete copy | `Deleting…`; `We couldn’t confirm whether it was deleted.`; `Checking whether it was deleted…`; `Not deleted. This breakdown is still here.`; `Delete unavailable. This breakdown is still here.`; `This breakdown changed. Delete was not completed.` |
| Delete recovery | `Check again` is the sole reliability action and performs read-only reconciliation; no `Retry`, `Retry Delete`, or `Delete again`; a later ordinary Trash activation is a new attempt |
| Confirmed result | Add clears once and delegates visible success to `DP-VQ02`'s row `Added.` signal; Delete removes once with SPEC focus/empty/completion handoff and no placeholder or toast |
| Timing / lifetime | Pending appears synchronously before the first async gap; all changes are immediate; unknown/failure persist without auto-dismiss until new source interaction, exit, or terminal authority replaces them |
| Focus / accessibility | One polite atomic announcement per new state; Add input stays logically focused, `Check again` stays mounted/focused through reconcile, `not_applied` may replace it with focused `Retry Add`; Delete retains Trash then uses focused Check again and returns terminal failure to Trash |
| Motion | Static only; no spinner rotation, pulse, ping, bounce, blink, flicker, scale, transform, or layout-transition animation; reduced motion is identical |
| Scope boundary | No toast, placeholder row, generic card/dialog, global status rail, prototype literal, adjacent-surface fallback, blind Retry, or theme-specific behavior/copy |

The same semantic tree consumes existing theme families:

| Theme | Reliability-family binding |
|---|---|
| GridDO | Compact technical rule, semantic status text, canonical action/focus roles |
| Tiny Desk | Attached ruled-paper annotation and stationery recovery controls |
| Neumorphism | Shallow inset status channel and named raised recovery control inside existing depth |
| Claymorphism | Shape-preserving inset status seam and restrained raised recovery control |
| Origami | Attached status seam/fold and fixed recovery fold inside source paper |
| Terminal | Variable-driven static status line and bracketed recovery action with no blink |
| Retro Mac | In-place 1-bit status pane and hard recovery control with no new window |
| Graphite | Editorial status caption, strengthened rule, monochrome action, and persistent focus cue |

### Approved Pool fixed-status realization — `DP-VQ06-POOL`

**User-approved 2026-08-10:** Choice A establishes one fixed Pool-local status
band directly below the expanded search/sort row and outside the scrolling
Scratch list. It resolves only the Pool slice of `VQ-06`; Task 144 alone
consumes it, while the Staging and Explorer slices remain unresolved.

| Contract | Exact token requirement |
|---|---|
| Placement | `pool-status-band` follows the complete search/sort row and precedes `pool-scroll-viewport`; it has at most one search-context `pool-status-line` and one aggregate activity line and never becomes a list row, toast, panel, event history, or adjacent-surface status |
| Count meaning | `pool-total-count` always means all active Scratches; non-empty search alone renders exact `{visible} of {total} Scratches` in `pool-filtered-count`; `pool-activity-marker` means mounted-page unseen remote arrivals or non-selected lifecycle activity and never replaces either count |
| Hidden selection | Bind `hidden-selection`; render exact `Selected Scratch is hidden by this search.` plus `Clear search`; retain selection/Context, clear only the query, and keep focus in the search field |
| Remote arrival | Bind `remote-arrival`; render `1 new Scratch arrived.` or `{count} new Scratches arrived.` plus `Review new`; revalidate, scroll/focus the first surviving unseen row without selecting it, and otherwise return focus to the search field |
| Lifecycle | Bind `lifecycle-update`; render exact archive/delete/restore singular or plural copy from the Pool recipe plus `Dismiss`; selected external archive/delete bypasses this ordinary line and remains owned by `DP-VQ01` |
| Mixed activity | Use the recipe's one `Pool updated elsewhere: {nonzero clauses}.` sentence in fixed new/archive/delete/restore order; expose `Review new` only for arrivals and `Dismiss` only for lifecycle aggregates; no disclosure or Mark-reviewed state |
| Compact mode | Search is not applied, so show no hidden/filtered line; keep the all-active count and use literal `+{count}` plus a separate non-color lifecycle marker named `Pool updated elsewhere.`; markers are not controls and the existing expand control reveals the band |
| Lifetime | Hidden/filter status is condition-bound; arrival/lifecycle aggregates are mounted Inbox-page state, preserved by selection/sort/collapse/theme/light-dark changes, independently cleared by `Review new` / `Dismiss`, and cleared together only by route exit or reload; no timer or auto-dismiss |
| Accessibility / focus | One polite atomic announcement per newly changed activity sentence, never per rerender; arrival/lifecycle never steals focus or selection; user actions use the exact recipe focus destinations; `DP-VQ01` alone owns blocking selected-disappearance focus |
| Motion | Every entry, replacement, clear, marker, band-size, scroll, and focus change is immediate; no fade, slide, scale, spinner, pulse, ping, bounce, blink, flicker, or layout-transition animation; reduced motion is identical |
| Scope | No selection/query meaning/persistence mutation, no repository or lifecycle command, no `DP-VQ01` duplication, and no Staging/Explorer role, copy, action, state, or theme authority |

The fixed status band maps through Pool-native theme families with no product
JSX theme branch or copied adjacent-surface literal:

| Theme | Role-family binding |
|---|---|
| GridDO | Restrained semantic band/marker using canonical border, muted, primary, text, action, and focus roles |
| Tiny Desk | Ruled-paper strip below wood tools, stationery text/actions, and pin/bar-like compact marker |
| Neumorphism | Shallow inset status well, named raised action, and raised compact marker within the existing shadow family |
| Claymorphism | Shape-preserving soft inset ribbon, restrained raised text action, and puffy non-color compact marker |
| Origami | Attached folded-paper strip, seam-separated lines/actions, and folded-tab compact marker |
| Terminal | Variable-driven static bordered line, bracketed text action, and text/shape marker with no fixed JSX color or blink |
| Retro Mac | In-place 1-bit pane below FIND/tools, hard text control, and hard-outline marker with no new window |
| Graphite | Editorial caption band, strengthened rules, restrained monochrome text action, and index-like compact marker |

### Approved Staging attached-status realization — `DP-VQ06-STAGING`

**User-approved 2026-08-10:** Choice A establishes candidate-attached
pending/unknown/reconciling status, subsection-local remote-arrival indicators,
and one Staging-title-attached terminal/integrity alert. It resolves only the
Staging slice of `VQ-06`; Task 147 alone consumes it. Pool remains owned by
`DP-VQ06-POOL`, and Explorer remains unresolved.

| Contract | Exact token requirement |
|---|---|
| Operation placement | `staging-operation-status` is one fixed line inside the affected final-type Node card or Bit row; Stage pending uses a non-draggable projection, Unstage retains the durable candidate, and pending/unknown/reconciling never replace or resize the Staging panel |
| Base and remote count | `Nodes` / `Bits` remain bare at zero or one and receive the durable total prefix only at two or more; `staging-arrival-count` separately renders exact `1 new` / `{count} new` beside only the affected heading with accessible action name `Show new {Nodes|Bits}` |
| Terminal alert | `staging-local-alert` is one static band directly below `Staging` and above both wells; `staging-alert-action` is visible `X` named `Dismiss Staging alert`; later failure replaces earlier and no stack/history/rail/toast/dialog exists |
| Pending/reconcile copy | Use the Staging recipe's exact `Staging “{title}”…`, `Returning “{title}” to Breakdown…`, unknown, and checking sentences; no action or Retry exists before authority |
| Failure copy | Use the recipe's exact Stage/Unstage `not_applied`, rejected, and conflict sentences; alert `X` dismisses presentation only and a permitted retry is a new drag, never a status action |
| Integrity/stale copy | Bind `source-unresolved`, `orphan-cleanup`, or `stale` and use the exact type-only unresolved/orphan, changed-elsewhere drop cancellation, and placement-closed copy; cache/offline/delay never uses orphan copy and no missing candidate title is reconstructed |
| Neutral/invalid | `staging-target-reason` attaches exact `Already in Nodes.`, `Already in Bits.`, `Return to Breakdown before changing type.`, or `This item is no longer available.` only to the active well/target and clears on exit/end |
| Remote focus | Arrival preserves focus/scroll; activating the count revalidates, scrolls its subsection to top, clears its count, and focuses the first surviving new candidate without mutation, or the subsection heading when none survives; observing top clears without focus movement |
| Alert lifetime/focus | No timer; clear on `X`, new operation for that candidate, authoritative candidate disappearance, or Scratch switch; `X` returns focus to surviving candidate, related Breakdown source, then Staging heading |
| Motion | Every status/count/alert/reason/scroll/focus transition is immediate; no fade, slide, scale, spinner, pulse, ping, bounce, blink, flicker, or layout-transition animation; reduced motion is identical |
| Scope | No repository/lock/reconciliation change, candidate label snapshot, permanent Unstage/Retry, `DP-VQ02` change, `D-CARD`, Pool role, Explorer role, or theme-ID behavior/copy branch |

The attached family maps through Staging-native theme roles:

| Theme | Role-family binding |
|---|---|
| GridDO | Candidate technical rule, compact subsection count chip, restrained semantic alert band, and canonical action/focus roles |
| Tiny Desk | Paper-object annotation, stationery count tab, and ruled-paper notice below the wood/cork title |
| Neumorphism | Shallow inset candidate line, named raised count action, and wide inset alert well within the existing shadow family |
| Claymorphism | Shape-preserving candidate seam, puffy non-color count, and soft sculpted alert ribbon |
| Origami | Candidate fold-edge status, folded count tab, and attached alert strip with seam-separated action |
| Terminal | Variable-driven inline record status, text count command, and static framed alert with no fixed JSX color or blink |
| Retro Mac | In-place 1-bit candidate footer, hard counter control, and full-width alert pane below the title with no new window |
| Graphite | Candidate editorial caption, compact index count, and strengthened-rule alert band with restrained monochrome action |

### Approved Explorer affected-column status realization — `DP-VQ06-EXPLORER`

**User-approved 2026-08-10:** Choice A establishes per-column remote-insertion
counts and one affected surviving-column path/fallback strip. It resolves the
final Explorer slice of `VQ-06`; Task 150 alone consumes it. Pool and Staging
remain owned by their receipts, and the separately approved `DP-VQ07` search
body does not alter this status family.

| Contract | Exact token requirement |
|---|---|
| Remote count | `explorer-remote-count` sits beside only the affected full `Home` / `Level 1` / `Level 2` / `Level 3` label and renders exact `1 new` / `{count} new` with accessible action `Show new in {full level label}`; initial hydration, local placement, and move-between-column do not count |
| Stable anchoring | Ordinary insertion binds `explorer-remote-arrival` and preserves path, selection, focus, first-visible stable ID, and viewport offset; never restore raw `scrollTop`, jump, select, or change path automatically |
| Path placement | `explorer-path-status` follows the surviving destination column's full label and precedes only that column's scrolling rows; removed suffix columns leave no ghost status/row/column/label; one later fallback replaces the prior strip |
| Path copy | Bind `path-fallback` and use the recipe's exact deleted/unavailable, archived, moved, generic invalid-path, and stale-placement sentences with `{destination}` equal to the nearest valid ancestor's visible title/full label or `Home` |
| Bit disappearance | Bind `selection-cleared`; render exact `“{title}” is no longer available. Selection cleared.` in the valid parent column and clear only Bit selection/reveal |
| Actions | `explorer-status-action` is only `Dismiss`; remote count is only `Show new in {level}`; no Retry, restore, reveal, Search, sibling choice, undo, navigation, or mutation action |
| Fallback/focus | Remove only invalid suffix, close stale placement without write, never choose sibling/ghost, then focus surviving nearest-valid ancestor row or destination full-label heading; ordinary arrival/status appearance never steals focus |
| Show new | Revalidate, scroll only that column to top, clear only its count, and focus the first surviving new row without selection/path change, otherwise its full-label heading; observing top clears without focus movement |
| Lifetime | Per-column count clears on its action/top observation/column close or path change/route exit or reload; path strip clears on Dismiss/next fallback/explicit user path change/route exit or reload; Scratch/theme/light-dark changes preserve open-column state; no timer or auto-dismiss |
| Motion | Indicator, strip, suffix removal, fallback, anchoring, scroll, and focus changes are immediate; no fade, slide, scale, spinner, pulse, ping, bounce, blink, flicker, or layout-transition animation; reduced motion is identical |
| Scope | No path semantics or anchoring algorithm change, product mutation, placement implementation, `VQ-07` search body, Pool/Staging role, abbreviated label, or theme-ID behavior/copy branch |

The affected-column family maps through Explorer-native theme roles:

| Theme | Role-family binding |
|---|---|
| GridDO | Compact column-label count chip and restrained technical strip using canonical border, muted, primary, text, action, and focus roles |
| Tiny Desk | Library-index count tab and catalog-paper status slip below the destination column label |
| Neumorphism | Named raised count control and shallow inset column notice within the existing shadow family |
| Claymorphism | Puffy non-color marker and shape-preserving soft ribbon attached to the destination clay column |
| Origami | Folded count tab and seam-attached paper strip with no ghost fold or repeated motion |
| Terminal | Variable-driven text count command and static destination-column status record with no fixed JSX color or blink |
| Retro Mac | Hard counter control and in-pane 1-bit system message below the full label with no new window or ghost pane |
| Graphite | Compact editorial index and strengthened-rule column note with restrained monochrome action |

### Approved Explorer replacement-search realization — `DP-VQ07`

**User-selected 2026-08-10:** Choice A retains theme-native Explorer chrome
and replaces only its four-column body with one dedicated whole-hierarchy
search body. Task 151 consumes the complete body after checkpoint acceptance;
Task 158 consumes only its result-Undo composition after `DP-VQ10` and Tasks
156–157. Ordinary-card Undo Task 156 remains independent.

| Contract | Exact token requirement |
|---|---|
| Entry and body | `explorer-search-entry` is exact `Search Explorer`; activation swaps only the body. `explorer-search-body` contains one fixed top `explorer-search-field`, its in-input `explorer-search-close`, one fixed `explorer-search-status`, and one internally scrolling `explorer-search-results` viewport; no overlay, dialog, fifth column, detached panel, or page scroll response |
| Input and close copy | Placeholder is exact `Search all Nodes and Bits`; `X` accessible name is exact `Clear and close Explorer search`; X and Escape clear active/interrupted query, results, scroll, and reveal, restore columns, and focus the entry action |
| Result grammar | Each `explorer-search-result` preserves Node/Bit icon/color identity and adds visible `explorer-search-type`, title, full `explorer-search-breadcrumb`, and when required exact `explorer-search-duplicate` text `Duplicate {index} of {count}` in stable hierarchy order; no result is a drag source and no ID/coordinate/hidden root is exposed |
| State copy | Use exact `Search the entire Grid Explorer.`, `Searching Grid Explorer…`, `Updating results…`, `No results for “{query}”.`, `Search couldn’t be updated.`, `That item is no longer available. Results were updated.`, `Revealed “{title}” in {breadcrumb}.`, and `Restored “{title}” to {source}.`; request failure alone exposes exact `Try again` |
| Loading/stale/error | Initial loading has an empty result viewport; stale refresh retains prior rows, scroll, and focus; error retains prior successful rows when available; `aria-busy` and one-time state announcements replace spinner/shimmer or row-by-row announcements |
| Navigation/focus | Open focuses input; Arrow Down/Up moves result focus; Enter/pointer revalidates before selection; valid selection restores columns and focuses the actual revealed row; stale selection changes no path/selection/route and returns to input when the focused result disappears; Scratch switch preserves state without forcing focus |
| Reveal | `explorer-revealed-row` is a static non-color marker on the actual row and `explorer-reveal-status` sits directly below the Explorer header; it ends only on another item selection, path change, DnD start, search restart, route exit, or reload, never a timer |
| DnD interruption | DnD start alone closes the body and preserves query/results/scroll as mounted-page interrupted state; Drop/Cancel never auto-reopens; explicit entry activation restores it and focuses input; result selection, X, Escape, route exit, or reload clears it |
| Result Undo boundary | `explorer-search-undo` is a trailing exact `Undo` action only when later `DP-VQ10` allows it; operation-specific reason/pending/failure/conflict treatment is imported from Tasks 156–157. Terminal success keeps query/scroll, removes only that result, reports source restoration, and focuses the next result at the removed position or otherwise the input, never the previous result |
| Lifetime and motion | Request/status lines are request/event-owned and end on their specified next request, status, selection, clear/close, route exit, or reload; none auto-dismisses. Every swap, status, result removal, reveal, scroll, and focus handoff is immediate; no fade, slide, scale, skeleton shimmer, spinner, pulse, ping, bounce, blink, flicker, or layout-transition animation; reduced motion is identical |
| Scope | No query traversal/rank/exclusion change, global Search import, active-column search, ordinary-column fallback, placement mutation, `DP-VQ06-EXPLORER` change, `DP-VQ10` state invention, product implementation in Task 114, or theme-ID behavior/copy branch |

The replacement body maps through Explorer-search-native theme roles:

| Theme | Role-family binding |
|---|---|
| GridDO | Full-width technical search field, restrained state rule, compact typed result rows, and canonical primary/action/focus roles |
| Tiny Desk | Library-index search tab, catalog-paper status slip, and stacked catalog result cards inside the Explorer body |
| Neumorphism | Inset search field and state trough with shallow raised result rows inside the existing shadow family |
| Claymorphism | Soft sculpted search field, shape-preserving status ribbon, and tactile typed result tiles without motion-led state |
| Origami | Folded search sheet, seam-attached state strip, and cut-paper result rows with no animated fold or ghost column |
| Terminal | Variable-driven command-line search, static status record, and text-led result records with no fixed JSX color, spinner, or blink |
| Retro Mac | In-pane Finder `Find` strip, 1-bit system status line, and hard bordered result list with no new window/dialog/ghost pane |
| Graphite | Editorial index field, strengthened-rule status caption, and restrained monochrome result rows with precise focus outline |

### Existing-surface state gaps — 4 open Decision prerequisites

The shared role/state envelope above is the maximum current authority for
these gaps. It authorizes semantic state binding, existing supported tokens,
visible text/icon/non-color cues, and approved accessibility/focus semantics
only. A matching user-owned non-code Decision receipt is required before any
dependent exact realization.

| ID | Unresolved boundary; no implied realization | Future owner | Resume condition |
|---|---|---|---|
| `VQ-08` | No placement pending, failure, reconcile, Retry, stale, success, control placement, layout, timing, copy, or per-theme realization is chosen. | User Decision → Placement recipe/token owner and reliability phase | Receipt resolves the dependent placement-state UI |
| `VQ-10` | No selected+new overlap, unavailable reason, dependency-reenabled, undoing, failure, Undo/retry/conflict treatment, copy, placement, timing, or per-theme realization is chosen; repeated motion is forbidden. | User Decision → Newly Placed/Undo recipe/token owner and rollback phase | Receipt resolves the dependent marker/reliability UI |
| `VQ-11` | No completion blocker or eligibility-withdrawal copy, effect, placement, layout, timing, or per-theme realization is chosen. | User Decision → Context/Breakdown/Archive recipe/token owner and completion phase | Receipt resolves the dependent blocker UI |
| `VQ-12` | No Archive pending, reconcile, failure, recovery, check-again, Retry/Cancel visual, copy, control/status placement, layout, timing, or per-theme realization is chosen. | User Decision → Archive recipe/token owner and reliability phase | Receipt resolves the dependent Archive variants |

Existing global color and motion values do not automatically realize any row
in this table.

### Absent replacement surfaces — 1 open Decision prerequisite

These surfaces remain completely outside token realization. Assign no role,
value, layout, theme mapping, copy, icon, control arrangement, or adjacent
fallback until a matching user receipt approves the missing surface.

| ID | Missing surface and prohibited fallback | Future owner | Resume condition |
|---|---|---|---|
| `VQ-09` | Staged Result Title and direct-limit/reason surfaces; create dialogs and generic placement UI are prohibited substitutes | User Decision → Placement recipe and title/limit phase | Receipt supplies both replacement surfaces |

### Selected deferrals

These selected boundaries remain outside this amendment. They authorize no
token, value, recipe fallback, placeholder control, or implementation task.

| ID | Preserved boundary | Future owner / resume condition |
|---|---|---|
| `D-CARD` | The common BitCard eight-theme redesign, later Staging/placed-card reuse, and final Korean card QA remain deferred. Current actual cards are retained; no current Inbox recipe is a redesign fallback. | Future brainstorming and separately approved execution work |
| `D-LENS` | Neumorphism ASC/DESC water-lens polish remains deferred because its source is absent. | Future user visual decision before any realization |
| `D-LOCALE` | Shared locale resources/provider/toggle, localized date/status/accessibility copy, and Korean typography/text-fit QA remain deferred. The core English copy foundation stays in scope. | Future canonical amendment |
| `D-KEYBOARD` | Keyboard or other drag-alternative placement entry remains deferred; add no placeholder button, shortcut, command, or hidden action now. | Future accessibility brainstorming and approval |
| `D-TEXT` | Cross-surface wrapping, line counts, expansion, and editor IME visual details remain with their separate topic. | Resume only through that named topic and its approval |

### Evidence and fidelity boundary

The nine current recipes were inspected as source only. This amendment claims
no server/browser run, screenshot comparison, rendered contrast, depth,
layering, clipping, overflow, responsive behavior, motion behavior,
light/dark parity, or combined eight-theme verification. Recipe declarations
support the role/mapping candidates above; they do not create behavior or turn
an observed literal into a canonical value without an approved adoption trace.

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

### Inbox/Triage Motion Boundary

**Amendment status:** **User-approved 2026-07-28; `DP-VQ02` supplement approved
2026-08-09.** The original amendment adopted no new Inbox/Triage motion value.
`DP-VQ02` now adds only the named `600ms` `ease-out` Add/Unstage row wash and
`1600ms` status visibility with the exact static reduced-motion equivalent
above. The unrelated global motion tokens remain exact and unchanged and are
not automatic fallbacks for another `VQ-*` state or missing replacement
surface.

Repeated pulse, blink, ping, bounce, spin, and flicker are excluded from the
Inbox/Triage target. Newly Placed may use only recipe-supported static or
one-shot candidates after its remaining `VQ-10` decisions are approved; no
repeating motion token is adopted. `DP-VQ02` owns the exact Add/Unstage
`success` appearance, trigger, timing, placement, interruption, and theme
mapping above; no other success or reliability surface inherits it.

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

Inbox/Triage drag previews (Breakdown row, staged Node, staged Bit) use a **compact token**, not the full row/card (SPEC Decision 16; pointer-centered targeting; valid / invalid / pending-confirmation target states). The existing calendar `compact-bit-item.tsx` "full drag surface" is the **anti-pattern** to avoid. Batch 1 uses existing GridDO baseline tokens; exact drag-token classes are an implementation detail within the Inbox/Triage phase (no dedicated theme tokens in Batch 1).

---

## Surface Recipes

> Surface recipes own source-extracted composition and supported visual
> declarations for sensitive surfaces. Product behavior remains in SPEC;
> shared role/state vocabulary and approved mappings remain in this document.
> Each recipe states its own provenance and verification level. A source-only
> recipe is not evidence of a rendered result.
>
> Surface recipes are referenced by execution plan tasks via a `Recipe:` field.
> Larger surface recipes may live as standalone files under `docs/recipes/` and are linked below.

### Current Inbox / Triage Surface Package

The current package is approved as source-only evidence and navigation. The
index creates no behavior, token, layout, or implementation authority. Each
current file is linked exactly once here; trace IDs are used by the proposed
role tables above.

| Trace ID | Navigation target | Source-backed scope |
|---|---|---|
| `R-INDEX` | [Inbox/Triage visual recipe navigation index](recipes/inbox-triage-visual-recipe-index.md) | Navigation only across source regions, surfaces, production owners, and future task placeholders |
| `R-SHELL` | [Shell and section chrome](recipes/inbox-triage-shell-section-chrome-visual-recipe.md) | Four-area composition, visible identity/chrome, hidden-scroll viewports |
| `R-POOL` | [Scratch Pool](recipes/inbox-triage-scratch-pool-visual-recipe.md) | Tools, count, selected/collapsed base states, and Pool viewport roles |
| `R-CONTEXT` | [Selected Scratch Context](recipes/inbox-triage-selected-scratch-context-visual-recipe.md) | Standalone signature Context and working/complete base roles |
| `R-BREAKDOWN` | [Breakdown rows and empty states](recipes/inbox-triage-breakdown-row-empty-visual-recipe.md) | Base row, action, Add, ordinary-empty, and completion-prompt roles |
| `R-STAGING` | [Staging](recipes/inbox-triage-staging-visual-recipe.md) | Node/Bit wells and shapes, base state grammar, transient unstage target |
| `R-EXPLORER` | [Grid Explorer](recipes/inbox-triage-grid-explorer-visual-recipe.md) | Base chrome/columns/full labels/rows/target grammar plus separately receipt-owned `DP-VQ07` search roles |
| `R-PLACEMENT` | [Placement affordances](recipes/inbox-triage-placement-affordances-visual-recipe.md) | Direct/staged base shells, target-column affordance, and full-target warning |
| `R-NEWLY` | [Newly Placed and Undo](recipes/inbox-triage-newly-placed-undo-visual-recipe.md) | Actual-card marker and separate Undo base; static/one-shot candidates only |
| `R-ARCHIVE` | [Archive and completion](recipes/inbox-triage-archive-completion-visual-recipe.md) | Breakdown-scoped base scrim/card, complete Context, reopen, Archive/Cancel |

The old [Batch 2 Inbox/Triage recipe](recipes/inbox-triage-batch2-visual-recipe.md)
is historical/reference-only for this topic. It is not part of the current
package and is not a direct execution recipe.

No current package file was rendered in this pass. Server/browser output,
screenshots, contrast, depth, layering, clipping, overflow, responsive
behavior, motion, light/dark parity, and combined eight-theme fidelity remain
unverified.

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
