# GridDO — Design Tokens

> **Scope:** Exact visual values — colors, typography, spacing, animations. Architecture lives in SPEC.md.
> **All values are exact (HSL, px, rem). No prose descriptions.**
> **Reference:** `docs/design-system-preview.html` | **Audit:** `docs/design-archaeology/DESIGN_AUDIT.md`

---

## Intentional Departures

Values that differ from `docs/design-system-preview.html` **on purpose**:

| # | Token / Component | HTML reference | This file | Reason |
|---|-------------------|---------------|-----------|--------|
| 1 | Font family | Inter (Google Fonts) | Geist Sans | Explicit project decision — Geist is the chosen system font |
| 2 | Sidebar model | `52px` icon strip | `3rem` (48px) fixed icon rail, always visible | Phase 9: sidebar is now a permanent icon rail — no fold/unfold. Closest to the reference's icon strip model |

---

## Table of Contents

- [CSS Variables](#css-variables)
- [Tailwind v4 Theme Bridge](#tailwind-v4-theme-bridge)
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

    /* Grid Layout */
    --grid-cols: 12;
    --grid-rows: 8;
    --grid-gap: 0.5rem;                    /* 8px — gap between cells */
    --grid-cell-min: 5rem;                 /* 80px — minimum cell dimension */
    --grid-line-color: 240 6% 90%;         /* same as --border */
    --grid-line-opacity-l0: 0.15;          /* Level 0 — standard density */
    --grid-line-opacity-l1: 0.12;
    --grid-line-opacity-l2: 0.08;
    --grid-line-opacity-l3: 0.05;          /* Level 3 — thinnest, densest */

    /* Level Depth Backgrounds (replaces vignette — Phase 9) */
    --grid-bg-l0: 0 0% 100%;              /* white — same as --background */
    --grid-bg-l1: 220 15% 97%;            /* cool gray tint */
    --grid-bg-l2: 220 15% 94%;            /* deeper */
    --grid-bg-l3: 220 15% 91%;            /* deepest */

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

    /* Level Depth Backgrounds — dark mode (progressively darker) */
    --grid-bg-l0: 240 10% 3.9%;           /* same as --background dark */
    --grid-bg-l1: 220 15% 6%;
    --grid-bg-l2: 220 15% 5%;
    --grid-bg-l3: 220 15% 4%;

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
| `--grid-cols`, `--grid-rows`, `--grid-gap`, `--grid-cell-min` | Consumed by CSS Grid template or inline styles |
| `--grid-line-color`, `--grid-line-opacity-l*` | Per-level logic via inline styles |
| `--grid-bg-l0` through `--grid-bg-l3` | Per-level background via inline styles |
| `--calendar-node-pool-ratio`, `--calendar-day-min-width` | CSS flexbox/grid or inline styles |
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
| Day column expand (calendar) | Motion layout animation | `src/lib/animations/calendar.ts` |
| Search overlay open/close | Motion fade + scale | `src/lib/animations/layout.ts` |
| Bit detail popup | Motion fade + slide-up | `src/lib/animations/layout.ts` |

---

## Font Loading

| Font | Loading Method | CSS Variable | Tailwind Class |
|------|---------------|-------------|----------------|
| Geist Sans | `next/font/local` via `geist` package | `--font-geist-sans` | `font-sans` |
| Geist Mono | `next/font/local` via `geist` package | `--font-geist-mono` | `font-mono` |

**Wiring chain:**

```
Geist Sans: geist/font (next/font) → --font-geist-sans (on <html>) → font-sans (Tailwind) → className="font-sans"
Geist Mono: geist/font/mono (next/font) → --font-geist-mono (on <html>) → font-mono (Tailwind) → className="font-mono"
```

**Root layout font loading:**

```tsx
// src/app/layout.tsx
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
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
{/* Node — mobile app icon design, no border */}
<div className="flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-pointer transition-transform hover:scale-105">
  {/* Icon container — color from Node.color */}
  <div
    className="flex items-center justify-center w-[52px] h-[52px] rounded-[14px]"
    style={{ backgroundColor: nodeColor }}
  >
    <Icon className="w-[26px] h-[26px] text-white" />
  </div>
  {/* Title */}
  <span className="text-[11px] font-medium text-foreground truncate max-w-[5rem]">
    {title}
  </span>
</div>
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
{/* Grid cell — aspect ratio adapts to grid, dashed outline in edit mode */}
<div className={cn(
  "relative rounded-md transition-all",
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
{/* Breadcrumb — top of grid, with Node description subtitle */}
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
  {description && (
    <p className="text-xs text-muted-foreground truncate pl-0.5">{description}</p>
  )}
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

---

## Surface Recipes

> Surface recipes specify the compositional structure of visually sensitive surfaces.
> They combine atomic tokens (from CSS Variables above) with layout rules.
> All values are geometric — no prose descriptions.
> Reference for verification: the source image listed in each recipe header.
>
> Surface recipes are referenced by execution plan tasks via a `Recipe:` field.

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
