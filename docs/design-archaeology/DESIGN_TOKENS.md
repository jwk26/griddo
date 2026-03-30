# Design Tokens — Draft (Phase 1)

> **Source:** `docs/design-system-preview.html`
> **Status:** Draft — faithful extraction only. No decisions made here.
> **Decisions are in:** `DESIGN_ALIGNMENT.md`
> **Final tokens land in:** `docs/DESIGN_TOKENS.md` after Phase 3.

---

## Table of Contents

- [CSS Variables — Divergences](#css-variables--divergences)
- [Component Tokens — BitCard](#component-tokens--bitcard)
- [Component Tokens — Node Card](#component-tokens--node-card)
- [Component Tokens — Priority Badge](#component-tokens--priority-badge)
- [Component Tokens — Aging Filter](#component-tokens--aging-filter)
- [Component Tokens — Past-Deadline Overlay](#component-tokens--past-deadline-overlay)
- [Component Tokens — Sidebar](#component-tokens--sidebar)
- [Typography Scale](#typography-scale)

---

## CSS Variables — Divergences

Only tokens that differ from current `docs/DESIGN_TOKENS.md` are listed here. Matching tokens are omitted.

### New tokens (present in HTML, missing from implementation)

```css
:root {
  /* Page background — warm beige, distinct from card/background surfaces */
  --page-bg: hsl(38 28% 91%);
}

.dark {
  /* Page background — dark mode: slightly lighter than background */
  --page-bg: hsl(240 10% 6%);
}
```

**Body wiring in HTML:**
```css
body {
  background: var(--page-bg);  /* NOT bg-background */
}
```

### Changed tokens (HTML value differs from current implementation)

| Token | HTML value | Current value | Location |
|-------|-----------|---------------|----------|
| `.dark --card` | `240 6% 8%` | `240 10% 3.9%` | Dark mode card surface |
| `.dark --popover` | `240 6% 8%` | `240 10% 3.9%` | Dark mode popover surface |

---

## Component Tokens — BitCard

### Structure

HTML uses **two-row layout**. Current implementation uses **single-row**.

```
┌──────────────────────────────────────────────────────┐
│ [color-bar] [icon] [title + meta]    [priority-badge] │  ← top row (.bit-card-top)
│              [────── progress 80% ──────] [2/4 chunks]│  ← bottom row (.bit-card-bottom)
└──────────────────────────────────────────────────────┘
```

Bottom row renders **only when `chunkStats.total > 0`** (same as current).

### Exact values

| Property | HTML value | Tailwind equivalent |
|----------|-----------|---------------------|
| Card padding | `10px 14px 10px 12px` | `pt-[10px] pr-[14px] pb-[10px] pl-3` |
| Card border-radius | `var(--radius)` = `0.625rem` = `10px` | `rounded-[var(--radius)]` or `rounded-lg` = 8px (close, not exact) |
| Card shadow | `0 1px 3px rgba(0,0,0,0.05)` | `shadow-sm` |
| Card border | `1px solid hsl(var(--border))` | `border border-border` |
| Color bar width | `3px` | `w-[3px]` |
| Color bar align | `align-self: stretch` | `self-stretch` |
| Color bar radius | `2px` | `rounded-[2px]` |
| Top row gap | `10px` | `gap-[10px]` |
| Icon size | `18×18px` | `w-[18px] h-[18px]` |
| Title font | `13px 500` | `text-[13px] font-medium` |
| Meta font | `11px 400 muted-foreground` | `text-[11px] text-muted-foreground` |
| Meta margin-top | `1px` | `mt-px` |
| Bottom row margin-top | `8px` | `mt-2` |
| Bottom row padding-left | `3px` | `pl-[3px]` |
| Bottom row gap | `8px` | `gap-2` |
| Progress bar flex | `flex: 0 0 80%` | `flex-[0_0_80%]` |
| Progress bar height | `5px` | `h-[5px]` |
| Progress bar radius | `999px` | `rounded-full` |
| Chunk count font | `11px muted-foreground` | `text-[11px] text-muted-foreground` |

### Complete structure (from HTML)

```html
<div class="bit-card">
  <!-- Top row -->
  <div class="bit-card-top">                     <!-- flex items-center gap-[10px] -->
    <div class="bit-color-bar" />                <!-- w-[3px] self-stretch rounded-[2px] -->
    <div class="bit-icon">                       <!-- color: muted-foreground -->
      <svg width="18" height="18" />
    </div>
    <div class="bit-content">                    <!-- flex-1 min-w-0 -->
      <div class="bit-title">…</div>             <!-- 13px 500 truncate -->
      <div class="bit-meta">Mar 27</div>         <!-- 11px muted-foreground mt-px -->
    </div>
    <span class="priority-badge priority-high">HIGH</span>
  </div>
  <!-- Bottom row — only when total > 0 -->
  <div class="bit-card-bottom">                  <!-- flex items-center gap-2 mt-2 pl-[3px] -->
    <div class="progress-bar">                   <!-- flex-[0_0_80%] h-[5px] rounded-full -->
      <div class="progress-fill" style="width: 25%" />
    </div>
    <span class="chunk-count">1 / 4</span>       <!-- 11px muted-foreground -->
  </div>
</div>
```

---

## Component Tokens — Node Card

Minor discrepancies only. Structure matches.

| Property | HTML value | Tailwind equivalent |
|----------|-----------|---------------------|
| Icon container size | `52×52px` | `w-[52px] h-[52px]` |
| Icon container radius | `14px` | `rounded-[14px]` |
| Icon size | `26×26px` | `w-[26px] h-[26px]` |
| Label font | `11px 500` | `text-[11px] font-medium` |
| Card padding | `12px` | `p-3` ✓ |
| Card radius | `12px` | `rounded-xl` ✓ |
| Gap | `6px` | `gap-1.5` ✓ |

---

## Component Tokens — Priority Badge

| Property | HTML value | Tailwind equivalent |
|----------|-----------|---------------------|
| Font size | `10px` | `text-[10px]` |
| Font weight | `600` | `font-semibold` |
| Text transform | `uppercase` | `uppercase` |
| Letter spacing | `0.05em` | `tracking-[0.05em]` |
| Padding | `2px 7px` | `py-[2px] px-[7px]` |
| Border radius | `999px` | `rounded-full` |

---

## Component Tokens — Aging Filter

| State | HTML filter | CSS |
|-------|------------|-----|
| Fresh | `saturate(1)` | `filter: saturate(1)` |
| Stagnant | `saturate(0.5) brightness(0.9)` | `filter: saturate(0.5) brightness(0.9)` |
| Neglected | `saturate(0.2) brightness(0.75)` | `filter: saturate(0.2) brightness(0.75)` |

Current implementation applies only `saturate()` — missing `brightness()` for both stagnant and neglected states.

---

## Component Tokens — Past-Deadline Overlay

The HTML applies blur to the **card element itself** (`.blur-target`), not via backdrop-filter.

| Property | HTML value | Tailwind equivalent |
|----------|-----------|---------------------|
| Blur method | `filter: blur(3px)` on card | `[filter:blur(3px)]` or `blur-[3px]` (on card) |
| Overlay background | `hsl(var(--background) / 0.5)` | `bg-background/50` |
| Overlay text | `"Done?"` | same ✓ |
| Text font | `13px 600` | `text-[13px] font-semibold` |
| Text color | `color: hsl(var(--foreground))` (NOT muted) | `text-foreground` |
| Overlay gap | `10px` | `gap-[10px]` |
| Button size | `28×28px` | `w-7 h-7` |
| Button radius | `50%` | `rounded-full` |
| Confirm button | `bg-primary text-primary-foreground` | `bg-primary text-primary-foreground` ✓ |
| Cancel button | `bg-secondary text-secondary-foreground` | `bg-secondary text-secondary-foreground` |

---

## Component Tokens — Sidebar

Collapsed state (52px width):

| Property | HTML value | Tailwind equivalent |
|----------|-----------|---------------------|
| Width | `52px` | `w-[52px]` |
| Padding | `12px 8px` | `py-3 px-2` |
| Button gap | `4px` | `gap-1` |
| Button size | `36×36px` | `w-9 h-9` |
| Button radius | `8px` | `rounded-lg` |
| Icon size | `18×18px` | `w-[18px] h-[18px]` |
| Separator height | `1px` | `h-px` |
| Separator margin | `4px 0` | `my-1` |
| Urgency dot (badge) | `10px` | `w-2.5 h-2.5` |

---

## Typography Scale

Extracted directly from HTML reference:

| Role | Size | Weight | Extra | Tailwind |
|------|------|--------|-------|---------|
| Node Title / Page Heading | `24px` | `700` | `letter-spacing: -0.02em` | `text-2xl font-bold tracking-[-0.02em]` |
| Section Heading | `16px` | `600` | — | `text-base font-semibold` |
| Bit Title | `13px` | `500` | — | `text-[13px] font-medium` |
| Bit Title (no meta) | `14px` | `500` | — | `text-sm font-medium` |
| Body / Chunk title | `13px` | `400` | — | `text-[13px]` |
| Secondary / Metadata | `12px` | `400` | `muted-foreground` | `text-xs text-muted-foreground` |
| Bit Meta / Timestamp | `11px` | `400` | `muted-foreground` | `text-[11px] text-muted-foreground` |
| Section Label | `10px` | `600` | `uppercase tracking-[0.1em]` | `text-[10px] font-semibold uppercase tracking-[0.1em]` |
| Overlay text | `13px` | `600` | `foreground` | `text-[13px] font-semibold text-foreground` |
