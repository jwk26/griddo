# Design Audit — GridDO

> **Source:** `docs/design-system-preview.html`
> **Target:** `src/app/globals.css`, `src/components/grid/bit-card.tsx`, `src/components/grid/node-card.tsx`, `src/components/layout/sidebar.tsx`
> **Screenshots:** `docs/design-archaeology/screenshot-light.png`, `docs/design-archaeology/screenshot-dark.png`

---

## 1. CSS Tokens

### Light Mode — Matching values (no change needed)

| Token | HTML value | globals.css value |
|-------|-----------|-------------------|
| `--background` | `0 0% 100%` | `0 0% 100%` ✓ |
| `--foreground` | `240 10% 3.9%` | `240 10% 3.9%` ✓ |
| `--card` | `0 0% 100%` | `0 0% 100%` ✓ |
| `--primary` | `221 83% 53%` | `221 83% 53%` ✓ |
| `--secondary` | `240 5% 96%` | `240 5% 96%` ✓ |
| `--muted` | `240 5% 96%` | `240 5% 96%` ✓ |
| `--muted-foreground` | `240 4% 46%` | `240 4% 46%` ✓ |
| `--destructive` | `0 84% 60%` | `0 84% 60%` ✓ |
| `--border` | `240 6% 90%` | `240 6% 90%` ✓ |
| `--radius` | `0.625rem` | `0.625rem` ✓ |
| `--priority-high` | `0 84% 60%` | `0 84% 60%` ✓ |
| `--priority-mid` | `45 93% 47%` | `45 93% 47%` ✓ |
| `--priority-low` | `217 91% 60%` | `217 91% 60%` ✓ |
| `--urgency-1` | `0 72% 70%` | `0 72% 70%` ✓ |
| `--urgency-2` | `0 84% 60%` | `0 84% 60%` ✓ |
| `--urgency-3` | `0 72% 45%` | `0 72% 45%` ✓ |

### Light Mode — Divergences

| Token | HTML value | globals.css value | Impact |
|-------|-----------|-------------------|--------|
| `--page-bg` | `hsl(38 28% 91%)` (warm beige) | **MISSING** — body uses `bg-background` (white) | **HIGH** — most visible difference |

### Dark Mode — Divergences

| Token | HTML value | globals.css value | Impact |
|-------|-----------|-------------------|--------|
| `--card` | `240 6% 8%` | `240 10% 3.9%` (= same as background) | **HIGH** — cards have no elevation |
| `--popover` | `240 6% 8%` (implied) | `240 10% 3.9%` | Medium |

---

## 2. Body / Page Background

| | HTML | Implementation |
|---|---|---|
| `body background` | `var(--page-bg)` = `hsl(38 28% 91%)` warm beige | `bg-background` = white `#ffffff` |

---

## 3. Font

| | HTML | Implementation |
|---|---|---|
| Font family | `Inter` (Google Fonts) | `GeistSans` (geist package) |
| Note | Preview predates Geist decision | DESIGN_TOKENS.md explicitly specifies Geist — **intentional** |

---

## 4. Node Card

| Property | HTML | Implementation |
|---|---|---|
| Icon container size | `52×52px` | `w-14 h-14` = `56×56px` |
| Icon container radius | `14px` | `rounded-2xl` = `16px` |
| Icon size | `26×26px` | `w-7 h-7` = `28×28px` |
| Label font | `11px 500` | `text-xs font-medium` = `12px 500` |
| Card padding | `12px` | `p-3` = `12px` ✓ |
| Card radius | `12px` | `rounded-xl` = `12px` ✓ |
| Gap | `6px` | `gap-1.5` = `6px` ✓ |

**Verdict:** Minor size discrepancies (52px vs 56px icon). Visually subtle.

---

## 5. Bit Card — MAJOR STRUCTURAL DIFFERENCE

### Layout

| | HTML | Implementation |
|---|---|---|
| Structure | **Two-row** (top: content, bottom: progress) | **Single-row** (everything horizontal) |
| Top row | color bar + icon + title/meta + priority badge | same elements in one row |
| Bottom row | progress bar (80% width) + chunk count | progress bar (w-16 = 64px fixed) inline |
| Bottom row trigger | only when `chunkStats.total > 0` | same ✓ |

### Dimensions

| Property | HTML | Implementation |
|---|---|---|
| Card padding | `10px 14px 10px 12px` | `px-4 py-3` = `16px top/bottom, 12px left/right` |
| Card border-radius | `var(--radius)` = `10px` | `rounded-lg` = `8px` |
| Card shadow | `0 1px 3px rgba(0,0,0,0.05)` | `shadow-sm` |
| Color bar width | `3px` | `w-1` = `4px` |
| Color bar radius | `2px` | `rounded-full` |
| Icon size | `18×18px` | `w-5 h-5` = `20×20px` |
| Title font | `13px 500` | `text-sm font-medium` = `14px 500` |
| Meta/deadline font | `11px 400 muted-foreground` | `text-xs` = `12px 400 muted-foreground` |
| Progress bar width | `flex: 0 0 80%` (flexible) | `w-16` = `64px` (fixed) |
| Progress bar height | `5px` | `h-1.5` = `6px` |
| Chunk count font | `11px muted-foreground` | `text-xs` = `12px` |

---

## 6. Priority Badge

| Property | HTML | Implementation |
|---|---|---|
| Font size | `10px` | `text-xs` = `12px` |
| Font weight | `600` | `font-medium` = `500` |
| Text transform | `uppercase` | none (lowercase) |
| Letter spacing | `0.05em` | none |
| Padding | `2px 7px` | `px-2 py-0.5` = `8px 2px` |
| Border radius | `999px` | `rounded-full` ✓ |

---

## 7. Aging Filter

| State | HTML filter | Implementation filter |
|---|---|---|
| Fresh | `saturate(1)` | `saturate(1)` ✓ |
| Stagnant | `saturate(0.5) brightness(0.9)` | `saturate(0.5)` — missing brightness |
| Neglected | `saturate(0.2) brightness(0.75)` | `saturate(0.2)` — missing brightness |

---

## 8. Past-Deadline Blur Overlay

| Property | HTML | Implementation |
|---|---|---|
| Blur | `filter: blur(3px)` on `.blur-target` | `backdrop-blur-[2px]` |
| Overlay background | `hsl(var(--background) / 0.5)` | `bg-background/60` |
| "Done?" text | `13px font-weight: 600 text-foreground` | `text-xs font-medium text-muted-foreground` |
| Button size | `28×28px border-radius: 50%` | `h-5 w-5` = `20×20px rounded-full` |
| Confirm button | `bg-primary text-primary-foreground` | `bg-primary text-primary-foreground` ✓ |
| Cancel button | `bg-secondary text-secondary-foreground` | `bg-muted text-muted-foreground` |

---

## 9. Sidebar (Collapsed State)

| Property | HTML | Implementation (to verify) |
|---|---|---|
| Width | `52px` | `w-sidebar-collapsed` |
| Button size | `36×36px` | needs verification |
| Button radius | `8px` | needs verification |
| Icon size | `18×18px` | needs verification |
| Urgency dot | `8×8px border: 1.5px solid bg` | `w-2.5 h-2.5` = `10px` |

---

## 10. Typography Scale (Reference)

From HTML preview — the intended type scale:

| Role | Size | Weight | Notes |
|---|---|---|---|
| Node Title / Page Heading | `24px` | `700` | `letter-spacing: -0.02em` |
| Section Heading | `16px` | `600` | — |
| Bit Title / Body Emphasis | `14px` | `500` | — |
| Body / Chunk title | `13px` | `400` | Not a Tailwind default — needs `text-[13px]` |
| Secondary / Metadata | `12px` | `400` | `muted-foreground` |
| Timestamp / Caption | `11px` | `400` | `muted-foreground` |
| Section Label | `10px` | `600` | `uppercase tracking-[0.1em]` |

---

## 11. Components Not Yet Built (reference only)

These exist in the HTML preview but have no implementation yet. Values captured for Phase 5+:

- **Compact Bit (Calendar):** `padding: 6px 10px`, `border-left: 3px solid`, `font-size: 12px`, `border-radius: 0 5px 5px 0`
- **Chunk Timeline:** vertical line `left: 5px top: 9px bottom: 9px width: 2px`, dot `12×12px border: 2px solid bg`, chunk card `padding: 5px 10px bg-secondary border border-border`
- **Progress ring:** `r=15 stroke-width=3` SVG circle, label `9px 600`
- **Grid cells (in grid-preview):** `gap: 5px`, cells `aspect-ratio: 1 border-radius: 7px bg-card border border-border`

---

## Token Adoption Rate

| File | Design system tokens used | Assessment |
|---|---|---|
| `globals.css` | All shadcn tokens + GridDO extensions | Complete — missing `--page-bg` only |
| `bit-card.tsx` | Uses Tailwind utilities mapped to tokens | Structural layout differs from reference |
| `node-card.tsx` | Uses Tailwind utilities | Minor size discrepancies only |
| Future components | — | Reference values captured above |
