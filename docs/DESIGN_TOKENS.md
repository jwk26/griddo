# GridDO — Design Tokens

> **Scope:** Exact visual values — colors, typography, spacing, animations. Architecture lives in SPEC.md.
> **All values are exact (HSL, px, rem). No prose descriptions.**

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
    --aging-fresh-saturation: 1;
    --aging-stagnant-saturation: 0.5;
    --aging-neglected-saturation: 0.2;
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

    /* Vignette (inner shadow at screen edges, per depth level) */
    --vignette-intensity-l0: 0;            /* No vignette at Level 0 */
    --vignette-intensity-l1: 0.15;
    --vignette-intensity-l2: 0.3;
    --vignette-intensity-l3: 0.45;

    /* Layout Dimensions */
    --sidebar-width: 14rem;                /* 224px — expanded sidebar */
    --sidebar-width-collapsed: 0rem;       /* 0px — fully hidden when folded */
    --breadcrumb-height: 3rem;             /* 48px */
    --bit-detail-max-width: 40rem;         /* 640px — Bit detail popup */
    --bit-detail-max-height: 85vh;
    --search-overlay-width: 36rem;         /* 576px — search modal */

    /* Calendar Layout */
    --calendar-pool-width: 18rem;          /* 288px — left panel (Node + Items pool) */
    --calendar-node-pool-ratio: 0.6;       /* 60% of left panel for Node pool */
    --calendar-day-min-width: 8rem;        /* 128px — minimum day column width */
}

.dark {
    /* ── Shadcn Core Tokens (Dark Mode) ── */
    --background: 240 10% 3.9%;            /* #09090b */
    --foreground: 0 0% 98%;               /* #fafafa */

    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;

    --popover: 240 10% 3.9%;
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

    /* Vignette uses darker shadow on dark mode */
    --vignette-intensity-l1: 0.2;
    --vignette-intensity-l2: 0.4;
    --vignette-intensity-l3: 0.55;
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground antialiased;
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
  --spacing-sidebar-collapsed: var(--sidebar-width-collapsed);
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
| `--aging-*-saturation`, `--aging-dust-opacity` | Applied as CSS filter values |
| `--grid-cols`, `--grid-rows`, `--grid-gap`, `--grid-cell-min` | Consumed by CSS Grid template or inline styles |
| `--grid-line-color`, `--grid-line-opacity-l*` | Per-level logic via inline styles |
| `--vignette-intensity-l*` | Consumed by Motion animation values |
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
| Task tossing (drag into Node) | Motion spring transition | `src/lib/animations/grid.ts` |
| Magnet snap (grid/calendar) | Motion spring with damping | `src/lib/animations/grid.ts` |
| Vignette depth transition | Motion `animate` on opacity | `src/lib/animations/grid.ts` |
| Day column expand (calendar) | Motion layout animation + vignette | `src/lib/animations/calendar.ts` |
| Sidebar fold/unfold | Motion layout animation | `src/lib/animations/layout.ts` |
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
    className="flex items-center justify-center w-14 h-14 rounded-2xl"
    style={{ backgroundColor: nodeColor }}
  >
    <Icon className="w-7 h-7 text-white" />
  </div>
  {/* Title */}
  <span className="text-xs font-medium text-foreground truncate max-w-[5rem]">
    {title}
  </span>
</div>
```

### Bit Card (Grid View)

```tsx
{/* Bit — horizontal rectangle. Color propagation: parent Node color at low saturation */}
<div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-card shadow-sm border border-border">
  {/* Color accent — light mode: bg tint; dark mode: left border */}
  <div className="w-1 self-stretch rounded-full dark:block hidden" style={{ backgroundColor: parentColor }} />
  {/* Icon */}
  <div className="flex-shrink-0">
    <Icon className="w-5 h-5 text-muted-foreground" />
  </div>
  {/* Content */}
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium text-foreground truncate">{title}</p>
    {deadline && (
      <p className="text-xs text-muted-foreground mt-0.5">{formattedDeadline}</p>
    )}
  </div>
  {/* Priority badge */}
  {priority && (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
      priority === "high" && "bg-priority-high-bg text-priority-high",
      priority === "mid" && "bg-priority-mid-bg text-priority-mid",
      priority === "low" && "bg-priority-low-bg text-priority-low",
    )}>
      {priority}
    </span>
  )}
  {/* Progress bar — hidden when zero chunks */}
  {totalChunks > 0 && (
    <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${(completedChunks / totalChunks) * 100}%` }}
      />
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
{/* Sidebar — foldable, fixed left */}
<aside className={cn(
  "fixed left-0 top-0 h-full bg-background border-r border-border",
  "flex flex-col items-center gap-1 py-4 px-2 z-40 transition-all",
  isOpen ? "w-sidebar" : "w-sidebar-collapsed",
)}>
  {/* Sidebar buttons: +, Pencil, Search, Theme, Calendar, Trash, Labs */}
  <SidebarButton icon={Plus} label="New" />
  <SidebarButton icon={Pencil} label="Edit" />
  <SidebarButton icon={Search} label="Search" />
  <SidebarButton icon={theme === "dark" ? Sun : Moon} label="Theme" />
  <div className="relative">
    <SidebarButton icon={Calendar} label="Calendar" />
    {/* Urgency notification dot */}
    {urgencyLevel && (
      <span className={cn(
        "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full",
        urgencyLevel === 1 && "bg-urgency-1",
        urgencyLevel === 2 && "bg-urgency-2",
        urgencyLevel === 3 && "bg-urgency-3",
      )} />
    )}
  </div>
</aside>
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

```tsx
{/* Blur + overlay — consistent "needs attention" pattern */}
<div className="relative">
  {/* Blurred item */}
  <div className="blur-sm pointer-events-none">
    <BitCard {...bitProps} />
  </div>
  {/* Overlay */}
  <div className="absolute inset-0 flex items-center justify-center gap-3 bg-background/40 rounded-lg">
    <span className="text-sm font-medium text-foreground">{overlayText}</span>
    <button className="p-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
      <Check className="w-4 h-4" />
    </button>
    <button className="p-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
      <X className="w-4 h-4" />
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
