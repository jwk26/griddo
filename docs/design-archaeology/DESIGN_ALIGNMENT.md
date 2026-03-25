# Design Alignment — Phase 2 Decisions

> **Purpose:** Per-element decisions — Adopted, Removed, or Improved — with rationale.
> **Used during execution as:** review guardrail (so intentional removals aren't flagged as bugs).
> **Source audit:** `DESIGN_AUDIT.md` | **Token values:** `DESIGN_TOKENS.md` (draft)

---

## Table of Contents

- [Intentional Departures Summary](#intentional-departures-summary)
- [CSS Variables](#css-variables)
- [Body / Page Background](#body--page-background)
- [BitCard](#bitcard)
- [Node Card](#node-card)
- [Priority Badge](#priority-badge)
- [Aging Filter](#aging-filter)
- [Past-Deadline Overlay](#past-deadline-overlay)
- [Sidebar](#sidebar)
- [Typography](#typography)

---

## Intentional Departures Summary

These are values that will **differ from the HTML reference on purpose**.

| # | Item | HTML | Implementation | Reason |
|---|------|------|---------------|--------|
| 1 | Font | Inter | Geist Sans | Geist is the explicit project decision per DESIGN_TOKENS.md |
| 2 | Sidebar collapsed width | `52px` icon strip | `0rem` hidden | Our sidebar folds away completely; icon strip is a different interaction model |

---

## CSS Variables

### `--page-bg` — **Adopted**

Add to `:root` and `.dark`. Wire `body` background.

```css
/* :root */
--page-bg: hsl(38 28% 91%);   /* warm beige */

/* .dark */
--page-bg: hsl(240 10% 6%);   /* near-black, slightly lighter than --background */
```

**Why:** The most visible missing token. White body vs warm beige is the first thing seen in a side-by-side comparison. The beige reads as depth — cards "float" on a surface.

**How to apply:** In `globals.css` `@layer base`, change `body` from `bg-background` to `[background:var(--page-bg)]` or a custom Tailwind token. Also add `--color-page-bg: var(--page-bg)` to `@theme inline` if using as a Tailwind utility.

---

### Dark mode `--card` — **Adopted**

```css
/* .dark */
--card: 240 6% 8%;     /* was: 240 10% 3.9% (same as --background — no elevation) */
--popover: 240 6% 8%;  /* same correction */
```

**Why:** Without this, dark mode cards have no visual separation from the page background. Cards disappear into the background. The HTML intentionally separates `--card` from `--background` in dark mode.

---

## Body / Page Background

**Adopted** — `body { background: var(--page-bg) }` instead of `bg-background`.

---

## BitCard

### Layout — **Adopted (two-row)**

Switch from single-row to two-row layout.

**Top row:** color bar → icon → title/meta → priority badge
**Bottom row:** progress bar (80% width) + chunk count (only when `total > 0`)

**Why:** The single-row layout squashes everything together. The two-row design gives title/meta the full width it needs while progress bar reads as a secondary metric below.

### Padding — **Adopted**

`pt-[10px] pr-[14px] pb-[10px] pl-3` (from `10px 14px 10px 12px`)

**Why:** Asymmetric padding is intentional — slightly more right padding frames the priority badge, slightly less left gives room for the color bar without pushing content too far.

### Title font — **Adopted**

`text-[13px] font-medium` (from `13px 500`)

**Why:** Current `text-sm` = 14px is one step larger than the reference. At 13px the title fits more comfortably in a horizontal card.

### Meta font — **Adopted**

`text-[11px] text-muted-foreground` (from `11px 400 muted-foreground`)

**Why:** Current `text-xs` = 12px. The reference uses 11px throughout for secondary metadata. Consistent with timestamp/caption tier in typography scale.

### Color bar — **Adopted**

`w-[3px] self-stretch rounded-[2px]` (from `width: 3px; align-self: stretch; border-radius: 2px`)

**Why:** Current `w-1` = 4px. 3px is subtler — accent not divider.

### Icon — **Adopted**

`w-[18px] h-[18px]` (from `18×18px`)

**Why:** Current `w-5 h-5` = 20px. Reference is 18px — slightly more compact within the content area.

### Progress bar — **Adopted**

`flex-[0_0_80%] h-[5px] rounded-full` (from `flex: 0 0 80%; height: 5px`)

**Why:** Current `w-16` = 64px fixed. The reference's `80%` of the bottom row width scales proportionally with cell size. More reliable across grid zoom levels. Height 5px vs 6px is a minor refinement.

### Border radius — **Improved**

`rounded-[var(--radius)]` = `rounded-[0.625rem]` ≈ 10px (from HTML `var(--radius)` = `0.625rem`).

Current uses `rounded-lg` = 8px. Use the CSS variable directly to stay token-consistent.

---

## Node Card

### Icon container — **Adopted**

`w-[52px] h-[52px] rounded-[14px]` (from `52×52px; border-radius: 14px`)

**Why:** Current `w-14 h-14` = 56px / `rounded-2xl` = 16px. The 52/14 combination produces a slightly more compact icon with tighter corner feel. Matches the HTML exactly.

### Icon size — **Adopted**

`w-[26px] h-[26px]` (from `26×26px`)

**Why:** Current `w-7 h-7` = 28px. Proportional to the container correction above.

### Label font — **Adopted**

`text-[11px] font-medium` (from `11px 500`)

**Why:** Current `text-xs` = 12px. 11px is the correct caption tier.

---

## Priority Badge

### All properties — **Adopted**

| Property | Value |
|----------|-------|
| Font size | `text-[10px]` |
| Font weight | `font-semibold` (600) |
| Text transform | `uppercase` |
| Letter spacing | `tracking-[0.05em]` |
| Padding | `py-[2px] px-[7px]` |
| Border radius | `rounded-full` ✓ (no change) |

**Why:** Current badge is `text-xs` (12px), lowercase, no tracking. The reference uses 10px uppercase with weight 600 — this reads as a compact label chip, not body text. The visual weight difference is significant at small sizes.

---

## Aging Filter

### Stagnant — **Adopted**

`filter: saturate(0.5) brightness(0.9)` (from `saturate(0.5) brightness(0.9)`)

**Why:** Brightness 0.9 darkens slightly — the card "fades" in both saturation and luminance. Current implementation only desaturates; the card looks grey but not dim.

### Neglected — **Adopted**

`filter: saturate(0.2) brightness(0.75)` (from `saturate(0.2) brightness(0.75)`)

**Why:** Brightness 0.75 is a noticeable dimming. Neglected items should feel visually retreated, not just grey. The brightness multiplier reinforces the "this hasn't been touched in a long time" signal.

---

## Past-Deadline Overlay

### Blur method — **Adopted**

`[filter:blur(3px)]` applied **directly to the card element** (not `backdrop-filter`).

**Why:** `filter: blur(3px)` on the element itself blurs the card content cleanly. `backdrop-blur` blurs what is *behind* the overlay, not the card content. These produce different visual results. The reference intent is to blur the card text.

**How to apply:** Add `[filter:blur(3px)]` class to the inner card content wrapper, not to an overlay `backdrop-blur`. Or apply to the role="button" wrapper when `pastDeadline` is true.

### Overlay background — **Adopted**

`bg-background/50` (from `hsl(var(--background) / 0.5)`)

Current uses `bg-background/60`. Change to `bg-background/50`.

### Overlay text — **Adopted**

`text-[13px] font-semibold text-foreground` (from `13px 600 color: foreground`)

Current uses `text-xs font-medium text-muted-foreground`. Reference uses foreground (high contrast), semibold, and 13px. The "Done?" prompt should be prominent, not muted.

### Buttons — **Adopted**

`w-7 h-7 rounded-full` (from `28×28px border-radius: 50%`)

Current uses `h-5 w-5` = 20px. 28px (w-7) is more tappable and matches the reference.

Confirm: `bg-primary text-primary-foreground` ✓ (no change)
Cancel: `bg-secondary text-secondary-foreground` (current uses `bg-muted text-muted-foreground` — adopt secondary)

---

## Sidebar

### Collapsed width — **Intentional Departure (kept at 0rem)**

HTML shows a `52px` icon-strip sidebar. Our implementation collapses to `0rem` (fully hidden).

**Why this is intentional:** GridDO's sidebar folds completely off-screen — it's a deliberate interaction pattern. The icon strip model would require different navigation affordances. This is an architecture decision, not a visual bug.

**Not changed.**

### Collapsed button/icon sizes — **Adopted for consistency**

Even though collapsed width is 0rem (fully hidden), when the sidebar IS visible in expanded state, the button/icon sizes from the HTML apply:
- Sidebar button: `w-9 h-9` = `36×36px`
- Button radius: `rounded-lg` = `8px`
- Icon size: `w-[18px] h-[18px]`

The audit found these "need verification" — applying HTML values as the reference.

---

## Typography

### Arbitrary size classes — **Adopted where reference differs**

| Role | Change |
|------|--------|
| Bit title | `text-sm` → `text-[13px]` |
| Bit meta/timestamp | `text-xs` → `text-[11px]` |
| Node label | `text-xs` → `text-[11px]` |
| Priority badge | `text-xs` → `text-[10px]` |
| Overlay prompt | `text-xs` → `text-[13px]` |
| Chunk count | `text-xs` → `text-[11px]` |

All other type uses (`text-sm`, `text-xs`, `text-base`) are unchanged.

### Font — **Intentional Departure (Geist, not Inter)**

HTML uses Inter (Google Fonts). Implementation uses Geist Sans.

**Why:** Geist was explicitly chosen for GridDO per `docs/DESIGN_TOKENS.md`. This predates the HTML prototype. Geist is a superior system font for code-adjacent UIs. **Do not change.**
