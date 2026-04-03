# Bit Detail Popup — Approved Surface Recipe

> **Reference:** `references/bitdetail0.png`
> **Produced via:** `/reference-redesign references/bitdetail0.png`
> **Date:** 2026-04-03
> **Canonical promotion:** `docs/DESIGN_TOKENS.md` § Bit Detail Surface, `docs/EXECUTION_PLAN.md` § Phase 8

---

## Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  [icon]  [title input ─────────────────]  [○] [···] │  ← Header
├─────────────────────────────────────────────────────┤
│  [priority pill]  [📅 Apr 16 ×]  [🕐 00:00]  [ALL] │  ← Metadata bar
├─────────────────────────────────────────────────────┤
│  description text (inline, no border)               │  ← Description
├─────────────────────────────────────────────────────┤
│  + Add a step                            [ring 75%] │  ← Steps header row
│  ● step text                           [↕] [🗑]    │
│  ● step text                           [↕] [🗑]    │
│    └─ Apr 16, 2:00 PM                              │
│  ○ step text                           [↕] [🗑]    │
├─────────────────────────────────────────────────────┤
│  🕐 Apr 16, 2026 12:00 AM  (red)                   │  ← Deadline footer
└─────────────────────────────────────────────────────┘
```

---

## Element Inventory

### Header row

`flex items-center gap-3 px-5 pt-5 pb-0`

- **Icon picker button** — 9x9 bordered button, opens icon grid popover. Top-left.
- **Title input** — `text-lg font-semibold`, flex-1, blur-to-save. No border.
- **Status toggle** — Circle/CheckCircle2 icon, top-right. Toggles active/complete.
- **Overflow menu** — `···` button, top-right. Contains: "Promote to Node" (conditional) + "Move to trash."

Progress ring is NOT in the header. See Steps header row.

### Metadata bar

`flex flex-wrap items-center gap-2 px-5 pt-1.5 pb-0`

- **Priority pill** (leftmost) — small colored pill, cycles high/mid/low/null on click. Shows `—` when unset.
- **Date chip** (when deadline set) — `📅 Apr 16 ×` style. × clears the deadline immediately. Click text to enter edit mode.
- **Time chip** (when deadline set) — `🕐 00:00`. Hidden when `deadlineAllDay` is true. Click to edit.
- **ALL pill** — toggles all-day on/off. Active state = primary color.
- **"Add date" button** (when no deadline set) — Calendar icon + "Add date" text; opens edit state inline.

Edit state on chip click: existing date/time inputs + ALL toggle. Dismiss on blur/ESC.

### Description

`px-5 pt-3`

- Inline textarea, no border, `resize-none`. Auto-opens if `bit.description` is non-empty.
- "Add description" text button when closed and empty.
- Collapses on blur when content is empty.

### Steps header row

`flex items-center justify-between px-5 pt-3 pb-0`

- **Left:** `+ Add a step` button (Plus icon, text-xs font-medium text-muted-foreground).
- **Right:** Progress ring (SVG circular, shows `%`, hidden when no chunks).

### Unified step list (chunk area)

`px-5 pt-2 pb-5`, inner container `relative pl-6`

- **Single unified list** — all chunks regardless of `time` value. Order = manual (`chunk.order`). No separate timed-step section.
- Vertical connecting line: `absolute left-[11px] top-2 bottom-2 w-0.5 bg-border`.

Each step:

- Toggle dot (w-3.5 h-3.5): filled `bg-primary` = complete, hollow `border-2 border-muted-foreground/40` = incomplete.
- Title text (`text-sm`): `line-through text-muted-foreground` when complete. Click to edit inline.
- Time sub-label (when `chunk.time` set): `text-xs text-muted-foreground mt-0.5` below step text.
- Drag handle: hover-reveal, grip icon at left edge.
- Delete button: hover-reveal, trash icon at right.

DnD drag reordering applies to all steps.

### Deadline footer

`flex items-center gap-2 px-5 pb-5`

- Shown only when `bit.deadline` is set.
- Clock icon `h-4 w-4 text-destructive` + formatted datetime `text-sm text-destructive`.
- Format: full datetime when not all-day, date-only when all-day.

### Empty state (no steps)

- Vertical line stub: `h-8 w-0.5 bg-border`.
- Hollow dot: `h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30`.

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **Priority pill retained** in metadata bar (leftmost) | Absent from reference, but user decided to keep it. Placed left of date chips to maintain existing position. |
| **Timed steps merged** into unified list | Reference shows single list. Time data preserved as inline sub-label. Manual order maintained (no auto-sort by time). |
| **Progress ring moved** to steps header row | Reference shows ring right of "Add a step", not in header. |
| **Deadline displayed as chips** | Reference shows dismissible chip pattern with ×. Replaces old text-button display/edit split. |
| **Deadline footer in red** | Reference shows red clock + red datetime at bottom. Replaces in-timeline deadline marker. |
| **ChunkTimeline component removed** | No separate timed-step section. All rendering unified in ChunkPool. |

---

## Component Ownership

| Element | Owner |
|---|---|
| Header, metadata bar, description, steps header row, deadline footer | `BitDetailPopup` |
| Unified step list with drag/sort | `ChunkPool` |
| Individual step row (dot, text, time sub-label, reorder, delete) | `ChunkItem` |
| `ChunkTimeline` | **Removed** |
