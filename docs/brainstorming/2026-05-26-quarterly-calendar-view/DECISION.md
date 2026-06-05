# Quarterly Calendar View

## Metadata

- Created: 2026-05-26
- Readiness: draft
- Category: deferred task
- Source project: griddo2-claude
- Source topic: out_of_phase planning amendment
- Source prototype: n/a
- Tags: calendar, quarterly, planning surface, nodes-only

## Summary

A new Quarterly calendar view showing Nodes (only) placed across quarters.
Provides a high-level planning surface for longer-term work. Originally Phase 15
in the active execution plan, deferred because the daily interaction model needs
to mature before a strategic planning surface makes sense.

## Task Spec (formerly Task 68)

**Files:** `src/app/calendar/quarterly/page.tsx` (create), `src/app/calendar/quarterly/_components/quarter-grid.tsx` (create), `src/app/calendar/quarterly/_components/quarter-column.tsx` (create), `src/app/calendar/layout.tsx` (update), `src/stores/calendar-store.ts` (update), `src/hooks/use-calendar-data.ts` (update), `src/hooks/use-dnd.ts` (update)

**Actions:**
- In `calendar-store.ts`: add `currentYear: number` state, `navigateYear` action, and extend the calendar view type to include `"quarterly"`
- In `calendar/layout.tsx`: add `Quarterly` to the Weekly/Monthly toggle (becomes a 3-way toggle). Route to `/calendar/quarterly`
- Create `quarterly/page.tsx`: `"use client"`. Same pool panel as weekly/monthly (shared via calendar layout). Right panel: quarter grid. Only Nodes from the pool can be dragged onto quarters — Bits and Chunks are not droppable
- Create `quarter-grid.tsx`: 4-column layout, one per quarter (Q1, Q2, Q3, Q4). Each column shows Nodes with deadlines falling within that quarter. Year navigation arrows + year label at the top
- Create `quarter-column.tsx`: column component for a single quarter. Header shows `Q1 (Jan–Mar)` etc. Body lists Nodes placed in that quarter. Column is a `useDroppable` target
- **Placement semantics:** dragging a Node onto a quarter column sets `deadline` to the last calendar day of that quarter (`deadlineAllDay = true`). Q1 → March 31, Q2 → June 30, Q3 → September 30, Q4 → December 31
- **Drag validation:** Bit/Chunk drops onto quarter columns are rejected
- In `use-calendar-data.ts`: add `quarterlyItems` query — all active Nodes with deadlines, grouped by quarter
- In `use-dnd.ts`: handle `quarterly-column-drop` kind
- Node placement section uses full height of available calendar area

**Acceptance:**
- `/calendar/quarterly` route resolves and renders
- 3-way toggle (Weekly / Monthly / Quarterly) works in calendar header
- 4-column quarter grid shows Nodes by quarter
- Dragging a Node onto a quarter sets its deadline to the last day of that quarter (all-day)
- Dragging a Bit/Chunk onto a quarter is rejected
- Year navigation arrows update the displayed year
- Quarter columns use full available height
- `pnpm build` passes

## Implementation Notes

- Quarter end-date computation: hard-code month/day pairs (Mar 31, Jun 30, Sep 30, Dec 31)
- Quarterly is Nodes-only by design — strategic planning surface, not tactical task scheduling
- Canonical refs: SCHEMA.md (Node deadline, deadlineAllDay)
