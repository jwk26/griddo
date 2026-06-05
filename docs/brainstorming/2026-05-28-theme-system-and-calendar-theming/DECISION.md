# Theme System and Calendar Theming

## Metadata

- Created: 2026-05-28
- Readiness: draft
- Category: feature reference
- Source project: griddo2-claude
- Source topic: consolidated from griddo2-claude-themes2-2 prototype work
- Source prototype: `origin/prototype/future-ideas`
- Archive branch: `prototype/future-ideas`
- Archive commits: `64e5236`, `5b3d3c0`, `59ee937`
- Archive routes: `/calendar/weekly`, `/calendar/monthly`
- Tags: themes, color-themes, calendar, redesign, tokens, toggle

## Summary

A color theme system for GridDO with 8 visual themes and theme-aware calendar
redesign. The prototype demonstrates runtime theme switching via CSS custom
properties and a Zustand store, plus a shared calendar view header component
and theme-aware monthly/weekly layouts.

## Theme System

### Available Themes

8 color themes, each with light and dark mode variants:

1. **griddo** — default GridDO identity
2. **tiny-desk** — wooden planner / corkboard
3. **neumorphism** — soft extrusion
4. **claymorphism** — glossy clay
5. **origami** — paper fold
6. **terminal** — monochrome terminal
7. **retro-mac** — classic Mac OS
8. **graphite** — neutral dark/light

### Implementation Pattern (prototype)

- `themes.css` — CSS custom property definitions per theme via
  `[data-color-theme="<name>"]` selectors, including calendar-specific tokens
- `theme-store.ts` — Zustand store with persistence
  (`useColorThemeStore`, `ColorTheme` type, `COLOR_THEMES` array)
- `color-theme-provider.tsx` — applies `data-color-theme` attribute to `<html>`
- `color-theme-toggle.tsx` — theme picker UI

### Theme Token Structure

Each theme defines:

- Core: `--background`, `--foreground`, `--card`, `--primary`, `--border`
- Grid: `--grid-line-color`, `--grid-bg-l0` through `--grid-bg-l3`
- Typography: `--theme-font`
- Shape: `--theme-radius`, `--theme-border-width`
- Depth: `--theme-shadow`, `--theme-shadow-hover`
- Calendar: `--calendar-cell-bg`, `--calendar-header-bg`,
  `--calendar-border-color`, `--calendar-grid-line-color`,
  `--calendar-cell-radius`

## Calendar Redesign

The prototype branch includes calendar visual changes that are theme-aware:

### Shared Calendar View Header

New `CalendarViewHeader` component replacing duplicated header logic in weekly
and monthly views:

- Title + subtitle layout (e.g., "May" + "2026")
- Weekly/Monthly toggle
- Previous/Today/Next navigation
- Consistent across both views

### Monthly Grid Changes

- Gap-px grid lines instead of gap-3 spacing (tighter, more calendar-like)
- Theme-aware cell backgrounds via `--calendar-cell-bg`
- Today indicator: circular badge instead of border highlight
- First-of-month labels: "May 1" format instead of just "1"
- Date display: right-aligned, smaller text
- Node tiles use `--theme-radius` for shape consistency

### Weekly Changes

- Uses shared `CalendarViewHeader`
- Layout structure preserved, header unified

## Prototype Source

All changes available on:

- Branch: `prototype/future-ideas`
- Remote: `origin/prototype/future-ideas`
- Commits:
  - `64e5236` — color theme runtime (store, provider, toggle)
  - `5b3d3c0` — themed grid visuals
  - `59ee937` — calendar redesign (shared header, monthly/weekly changes)
- Routes: `/calendar/weekly`, `/calendar/monthly`

The prototype branch is a reference/source archive, not canonical
implementation. Theme values, component structure, and calendar layout should
be re-evaluated during promotion.
