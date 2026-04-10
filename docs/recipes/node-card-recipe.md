---
surface: node-card
reference: references/dotted.png, references/dotted2.png
approved: 2026-04-07
---

# Node Card Recipe

## Reference Facts (from dotted.png / dotted2.png)

- White/off-white rounded-square tile, centered in its grid cell
- Corners: `rounded-2xl` (~16px radius)
- Subtle drop shadow (slightly more than `shadow-sm`)
- Icon: centered in upper ~65–70% of card; large (~32px); colored per node
- Title: short label centered below icon; ~12px; dark foreground
- Card fills ~80–90% of cell dimensions (height-driven square via `aspect-square h-full max-w-full`)
- Internal padding: generous (~`p-3`)
- No border on filled cards — clean tile surface only
- Grid background: warm off-white (already handled by `--grid-bg-l*` CSS vars)

## Layout Structure

```
[outer wrapper]  relative flex h-full items-center justify-center
  └── [card button]  flex aspect-square h-full max-w-full flex-col
                     rounded-2xl bg-card p-3 shadow transition-colors
                     hover:bg-muted/40 active:bg-muted/60
      ├── [icon slot]   flex flex-1 items-center justify-center
      │     └── <Icon>  h-8 w-8 shrink-0  (colored via node.color)
      └── [title slot]  flex h-5 items-center justify-center
            └── <span>  w-full min-w-0 truncate text-center
                        text-xs font-medium text-foreground
  └── [delete badge]   absolute -right-1 -top-1  (edit mode only)
                       flex h-5 w-5 items-center justify-center
                       rounded-full bg-destructive text-destructive-foreground
```

## Element Inventory

| Element | Source | Tailwind Classes |
|---------|--------|-----------------|
| Outer wrapper | Preserved | `relative flex h-full items-center justify-center` |
| Card button | Restructured (padding, shadow, icon size) | `flex aspect-square h-full max-w-full flex-col rounded-2xl bg-card p-3 shadow transition-colors hover:bg-muted/40 active:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring` |
| Icon | Restructured (size: 28px → 32px) | `h-8 w-8 shrink-0` |
| Icon slot | Preserved | `flex flex-1 items-center justify-center` |
| Title span | Restructured (font: 11px → 12px) | `w-full min-w-0 truncate text-center text-xs font-medium text-foreground` |
| Title slot | Restructured (height: h-4 → h-5) | `flex h-5 items-center justify-center` |
| Delete badge | Reintegrated | `absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground` |

## Reintegrated Controls

### Delete button
- **Placement:** `absolute -right-1 -top-1` on outer wrapper (`relative`); visible only when `isEditMode`
- **Rationale:** iOS-style badge-on-icon pattern; matches the app-icon tile aesthetic of the reference
- **Visibility:** Edit mode only (hidden at rest — no conflict with reference resting state)

### Aging filter
- **Placement:** CSS `filter` on the card button element (not the outer wrapper)
- **Rationale:** Dims the card tile for stale nodes; applying to button (not wrapper) keeps delete badge unaffected
- **Visibility:** Only visually active on aged nodes; fresh nodes (reference state) are unfiltered

## Interaction States

| State | Behavior |
|-------|---------|
| Rest | Clean white tile, shadow visible |
| Hover | `bg-muted/40` tint |
| Active/Press | `bg-muted/60` tint |
| Edit mode | `animate-jiggle` on card; delete badge appears at top-right |
| Dragging | `opacity-50` (applied by DraggableNodeCard wrapper) |
| Aged node | CSS `filter` dims card (handled by `getAgingFilter`) |

## Component Ownership

- **`node-card.tsx`**: All visual structure — card tile, icon, title, delete badge, aging filter, jiggle
- **`grid-view.tsx` > `DraggableNodeCard`**: Drag wrapper (`h-full cursor-grab`), opacity on drag
- **`grid-view.tsx` > `GridDropCell` > `GridCell`**: Cell boundary, dashed border, drag-over indicator

## Key Sizing Notes

- Height chain: CSS Grid row → `GridDropCell (h-full)` → `GridCell (h-full)` → `motion.div (h-full)` → `DraggableNodeCard (h-full)` → `NodeCard outer (h-full)` → `button (h-full aspect-square max-w-full)`
- In a landscape 18×9 grid, cells are wider than tall — `h-full aspect-square` produces a height-constrained square, `max-w-full` prevents overflow in portrait/tall cells
