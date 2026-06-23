# Visual Recipe: Batch 2 Calendar Redesign

> Source: `prototype/future-ideas` commit `59ee937` — calendar redesign
> Current baseline: Phase 19 calendar implementation
> Date: 2026-06-23
> Status: Drafted in writing-documents Step 0.75
>
> Scope: calendar visual/layout recipe only. Implementation must patch the current calendar code and preserve current behavior, tests, DnD, and popup wiring.

## Extraction Method

- Read source files directly with `git show`.
- Compared prototype calendar files against current Phase 19 calendar files.
- Extracted visual target from:
  - `59ee937:src/components/calendar/calendar-view-header.tsx`
  - `59ee937:src/app/calendar/monthly/_components/month-grid.tsx`
  - `59ee937:src/app/calendar/weekly/page.tsx`
  - `59ee937:src/components/calendar/day-column.tsx`
- Current implementation remains the structural/behavioral baseline.

## Source Files

| Source file | Role | Adoption |
|---|---|---|
| `calendar-view-header.tsx` | Shared weekly/monthly header | Partial Adopt |
| `monthly/_components/month-grid.tsx` | Tighter monthly grid, theme-aware cells, today/date treatment | Adopt visual target |
| `weekly/page.tsx` | Uses shared header | Partial Adopt |
| `components/calendar/day-column.tsx` | Theme-aware weekly column styling | Adopt visual target |
| Current `date-cell-popover.tsx` | Popover behavior and details | Retain |
| Current calendar tests | Behavior regression guard | Retain and expand |

## Current Baseline to Preserve

- Calendar routes: `/calendar/weekly`, `/calendar/monthly`.
- Existing calendar DnD:
  - `useDraggable`
  - `useDroppable`
  - `getCalendarDateDropId`
  - reschedule/unschedule actions
- Existing `DateCellPopover` behavior.
- Current Node/Bit/Chunk item rendering semantics.
- Current store/data hooks unless implementation finds a direct compatibility need.
- Calendar creation tests, navigation tests, pool collapse tests, day-column tests, and compact-bit item tests.

## Shared Calendar Header

Prototype introduces `CalendarViewHeader`.

### Layout

```text
Header row, h-16, border-b, px-6
  left: title + muted subtitle
  center: view segmented control
  right: previous / Today / next controls
```

### Exact Visual Facts

| Element | Source treatment |
|---|---|
| Header root | `flex h-16 shrink-0 items-center justify-between border-b border-border px-6` |
| Title group | `flex min-w-0 items-baseline gap-2` |
| Title | `truncate text-xl font-bold tracking-tight text-foreground` |
| Subtitle | `text-lg font-medium text-muted-foreground/50` |
| View control shell | `flex items-center rounded-lg border border-border bg-muted/30 p-1` |
| Active view button | `bg-background text-foreground shadow-sm` |
| Inactive view button | `text-muted-foreground hover:bg-transparent hover:text-foreground` |
| Previous/next buttons | `h-8 w-8 text-muted-foreground hover:text-foreground` |
| Today button | `h-8 px-3 text-xs font-semibold text-foreground hover:bg-accent` |

### Adopted Behavior

- Weekly and monthly views should use the same header component or equivalent shared header pattern.
- Header title/subtitle examples:
  - Monthly: title `MMMM`, subtitle `yyyy`
  - Weekly: title `MMMM`, subtitle `yyyy`
- Keep previous/today/next navigation.
- Prototype includes disabled Day/Year options. Canonical docs should decide whether to show disabled future views or omit them; implementation should not invent new Day/Year views.

## Monthly Grid

### Layout Target

- Replace current separated card grid (`gap-3`, `px-6`) with tighter calendar-like grid lines.
- Weekday header spans full width above the date grid.
- Date grid uses `gap-px` and `--calendar-grid-line-color` as the line background.

### Exact Visual Facts

| Element | Source treatment |
|---|---|
| Weekday header row | `grid grid-cols-7 border-b border-border transition-colors` |
| Weekday header background | `style={{ background: "var(--calendar-header-bg)" }}` |
| Weekday label | `py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70` |
| Date grid | `grid min-h-0 flex-1 grid-cols-7 gap-px overflow-y-auto pb-px transition-colors` |
| Date grid background | `style={{ backgroundColor: "var(--calendar-grid-line-color)" }}` |
| Date cell | `flex min-h-32 cursor-pointer flex-col p-2 text-left backdrop-blur-sm transition-all hover:brightness-105` |
| Out-of-month cell | `opacity-40 grayscale-[0.5]` |
| Drag-over cell | `ring-2 ring-primary/40` |
| Selected cell | `z-10 ring-2 ring-primary` |

### Theme-Aware Cell Style

Date cells use CSS variables:

```tsx
style={{
  background: "var(--calendar-cell-bg)",
  borderColor: isToday
    ? "var(--calendar-today-border-color)"
    : "var(--calendar-border-color)",
  borderRadius: "var(--calendar-cell-radius)",
  borderStyle: isToday
    ? "var(--calendar-today-border-style)"
    : "var(--calendar-border-style)",
  borderWidth: isToday
    ? "var(--calendar-today-border-width)"
    : "var(--calendar-border-width)",
  boxShadow: isToday
    ? "var(--calendar-today-shadow)"
    : "var(--calendar-cell-shadow)",
}}
```

### Date Label Treatment

- Date button is right-aligned: `flex w-full items-start justify-end gap-1 rounded-sm text-right`.
- Today is a circular badge:
  - `flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground`
- Non-today date text is muted.
- First of month uses `MMM d`, e.g. `May 1`.
- Other days use `d`.

### Preview Items

- Preview item limit remains `4`.
- Nodes render as compact colored square tiles:
  - `h-6 w-6`
  - background `node.color`
  - border radius `var(--theme-radius, 6px)`
  - icon `h-3.5 w-3.5 text-white`
- Bits/Chunks render as dots:
  - `h-2.5 w-2.5 rounded-full`
  - color resolved from parent color map
- Overflow count:
  - `h-5 min-w-5 rounded-sm bg-muted px-1 text-[10px] font-bold text-muted-foreground`

## Weekly View

### Layout Target

- Weekly page uses shared `CalendarViewHeader`.
- Day columns retain current expandable column behavior.
- Day columns become theme-aware surfaces using calendar variables.

### Day Column Theme Style

Weekly day columns use the same calendar variable set as monthly cells:

```tsx
style={{
  background: "var(--calendar-cell-bg)",
  borderColor: isToday
    ? "var(--calendar-today-border-color)"
    : "var(--calendar-border-color)",
  borderRadius: "var(--calendar-cell-radius)",
  borderStyle: isToday
    ? "var(--calendar-today-border-style)"
    : "var(--calendar-border-style)",
  borderWidth: isToday
    ? "var(--calendar-today-border-width)"
    : "var(--calendar-border-width)",
  boxShadow: isToday
    ? "var(--calendar-today-shadow)"
    : "var(--calendar-cell-shadow)",
}}
```

### Day Column Header

- Header button uses `var(--calendar-header-bg)`.
- Header radius uses `calc(var(--calendar-cell-radius) * 0.8)`.
- Expanded day has stronger foreground text.
- Today uses primary color.

## Calendar Token Contract

Batch 2 canonical docs must add calendar visual tokens:

- `--calendar-cell-bg`
- `--calendar-header-bg`
- `--calendar-border-width`
- `--calendar-border-style`
- `--calendar-border-color`
- `--calendar-grid-line-color`
- `--calendar-cell-radius`
- `--calendar-cell-shadow`
- `--calendar-today-border-width`
- `--calendar-today-border-style`
- `--calendar-today-border-color`
- `--calendar-today-shadow`

These are theme-dependent. Values come from the theme recipe / prototype `themes.css`.

## Adopted

- Shared header pattern for weekly and monthly views.
- Tighter monthly `gap-px` grid line model.
- Theme-aware calendar cells.
- Today circular badge in monthly date label.
- First-of-month `MMM d` label.
- Right-aligned monthly date label.
- Theme-aware node tile radius in monthly preview items.
- Weekly day column theme-variable styling.

## Retained

- Current calendar route structure.
- Current DnD behavior and drop IDs.
- Current `DateCellPopover`.
- Current calendar item data model and hooks.
- Current unschedule actions and item interactions.
- Existing tests as regression guard.

## Improved / Required During Canonical Promotion

- Add popup item `focus-visible` styling from Phase 14 deferred issue.
- Recheck `toSorted()` / `useMemo` calendar performance only if the implementation touches the relevant list rendering or if measurable list size/render cost appears.
- Preserve keyboard access for date cell popovers and item controls.
- Verify contrast for all 8 themes after applying calendar variables.

## Non-Adopted

- Wholesale replacement of current calendar files.
- New Day/Year calendar views; prototype disabled buttons are visual context only unless canonical scope later adds those views.
- Removing existing DnD or popover behavior to match prototype visuals.

## Execution Handoff

Future implementation tasks should reference this recipe and assert:

- patch current calendar code
- preserve current tests and add coverage for shared header / theme-aware monthly cells where appropriate
- use recipe tokens, not hardcoded per-component colors
- verify focus-visible styling for popup item buttons
- run visual smoke in light/dark and at least one high-contrast theme such as terminal or retro-mac
