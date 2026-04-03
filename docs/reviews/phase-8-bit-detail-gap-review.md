# Bit Detail Surface — Gap Review

> Reference: `references/bitdetail0.png`
> Baseline: Phase 7 (`775ebcc`) — `src/components/bit-detail/`
> Date: 2026-03-31

## Reference Image Summary

What the image literally shows:

- Title text at top, large and bold
- Circular progress ring (50%) to the right of the title, on the same line
- Priority badge "HIGH" below the title, standalone row
- No other controls visible in the header at rest
- Vertical timeline as the hero content — connected dots with text and time labels
- Chunk items rendered without card wrappers — dot + text + time directly
- Completed chunks: solid blue dots. Incomplete chunks: hollow outlined circles
- Deadline at bottom: large clock icon + "Today, 14:00" in bold text
- No description field, mtime label, or editing controls visible at rest
- No date/time input elements visible — deadline appears as read-only text

## Product Decisions (Phase 8 Pilot)

These are retained or adjusted behaviors that differ from the reference. They are product decisions, not reference facts:

- **Icon picker** — Retained visible to the left of the title. Not present in reference.
- **Status toggle** — Retained visible in the header row. Not present in reference.
- **More menu** — Retained in header row. Not present in reference.
- **Completed chunk text** — Keep line-through + muted styling. Reference does not clearly show strikethrough, but existing behavior is preserved.
- **Deadline inputs** — Current implementation shows native date/time inputs always visible. Phase 8 changes default to read-only display text; inputs appear on click-to-edit. Aligns with reference's clean resting state.
- **Description** — Retained in the product, collapsed by default. Not visible in reference.
- **Left accent border** — Ambiguous in reference. Optional design choice for Phase 8.

## Gap Table

| Element | Reference | Current (Phase 7) | Gap | Severity |
|---------|-----------|-------------------|-----|----------|
| **Progress ring position** | Inline with title, top-right | Separate row above timeline with "X/Y steps" label | Structural | High |
| **Priority badge position** | Below title, standalone row | Inline in header row | Layout | High |
| **Chunk item styling** | Dot + text + time, no wrapper | Bordered card around each chunk | Visual | High |
| **Header density** | Title + ring only at rest | Icon + title + priority + status + more, all inline | Layout | Medium |
| **Deadline display** | Read-only text ("Today, 14:00") | Always-visible native date/time input elements | Layout | Medium |
| **Deadline marker** | Clock icon (~20px) + semibold text | Clock icon (12px) + text-xs text-muted-foreground | Visual | Medium |
| **Description field** | Not visible at rest | Always-visible textarea (80px min-height) | Layout | Medium |
| **Chunk area visual split** | Single continuous vertical list | Pool and timeline render as visually separate sections | Visual | Medium |
| **mtime label** | Not visible | Always-visible "Last updated: X ago" text | Layout | Low |
| **Complete dots** | Solid filled blue, no border | bg-primary with border-2 border-background | Minor | Low |
| **Incomplete dots** | Hollow outlined circle | bg-muted-foreground/30 solid fill | Minor | Low |
| **Left accent border** | Possibly present (ambiguous) | Not present | Visual | Low |
| **Timeline connecting line** | Continuous vertical line | Present, same pattern | Match | — |
| **Rounded corners** | ~12px | rounded-xl (~12px) | Match | — |

## Phase 8 Pilot Scope

### In scope (surface-level redesign)

1. **Header restructure** — Move progress ring to header-right. Move priority badge to own row. Rebalance retained controls (icon picker, status toggle, more menu) in header.
2. **Chunk item visual simplification** — Remove card wrapper. Render as dot + text + time. Adjust dot styling. Hover-reveal drag/delete.
3. **Visual continuity across chunk area** — Pool and timeline sections adopt the same visual pattern (dots, line, spacing) so they read as one continuous step list.
4. **Deadline display/edit separation** — Default shows read-only text; inputs appear on click-to-edit.
5. **Deadline marker enhancement** — Larger icon, semibold text.
6. **Description collapse** — Hidden by default, expand on click.
7. **mtime removal from default view.**
8. **Spacing and density** — Adjust padding/gaps to match reference rhythm.

### Deferred (not Phase 8)

- Deep structural merge of chunk area components — visual continuity only, not component architecture.
- Left accent border — optional, test during polish if time permits.
- Deadline interaction model redesign beyond display/edit split.

## Items Retained in Place (Not Relocated)

These features are present in the current implementation and are NOT moved in Phase 8:

- **Icon picker** — Stays visible to the left of the title
- **Status toggle** — Stays visible in the header row
- **More menu** — Stays in header (contains promote, trash)
- **"Add a step" button** — Stays at bottom of chunk area
- **Deadline date/time inputs** — Accessible via click-to-edit on deadline display text

## Scope Boundary

This gap review covers the Bit Detail surface only. Grid view, sidebar, calendar, search, and trash are out of scope for Phase 8.
