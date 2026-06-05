# Node Health Rollup + Focus + Aging Revision

## Metadata

- Created: 2026-04-28
- Readiness: draft
- Category: deferred task
- Source project: griddo2-claude
- Source topic: migrated from out_of_phase ideation
- Source prototype: n/a
- Tags: rollup, focus, aging, attention-signal, hover-hold, progressive-disclosure
- Dependencies: 2026-04-28-lifecycle-system-foundation

## Summary

Three conceptual layers that transform L0 Node cards from folder directories
into health dashboards. Shipped as one feature. Also includes an aging system
revision (saturation + opacity).

This feature depends on the lifecycle foundation but is independent of Quick
Capture, Inbox/Triage, and Archive. It can be built in parallel.

## Layer 1: Attention Signal (at rest)

Always visible on the Node card at L0:

| Signal | Trigger | Visual |
|--------|---------|--------|
| Overdue dot | Any child Bit has `deadline < now` and `status !== 'complete'` | Small red dot on card corner |
| Neglected fade | Aging system (saturation + opacity reduction) | Desaturated/transparent card |

**Not at rest:** Completion ring, bit count, health summary — these appear in
hover-hold only.

## Layer 2: Rollup Preview (hover hold ~800ms)

After cursor stays still on a Node card for ~800ms:

| Content | Detail |
|---------|--------|
| Title | Node title |
| Status badge | Active / Completed |
| Total bits | Count of active child Bits |
| Active / completed | Breakdown (e.g., "8 active · 4 completed") |
| Overdue count | With urgency indicator |
| Completion % | Computed at render time |
| Last updated | Relative time (e.g., "3 days ago") |
| Bit preview | Top 3 overdue or active Bits (title only) |
| Child node count | If the Node contains sub-Nodes |

## Layer 3: Focus Overlay

Activates simultaneously with Rollup Preview:

| Behavior | Detail |
|----------|--------|
| Dim surrounding cells | Reuses existing vignette/breadcrumb-zone dimming |
| Expand hovered card | Grows in-place to fit Rollup Preview content |
| Focus entry indicator | Thin ring or underline along the Node card edge |
| Mouse leave | 200–300ms fade-out, card returns to normal |

## Interaction Timing

| Event | Response |
|-------|----------|
| Hover (instant) | Attention Signal already visible — no change |
| Hover hold ~800ms | Cursor must stay still. Moving away cancels |
| Focus active | Rollup Preview + dimming visible |
| Click | Navigate into Node (`/grid/[nodeId]`) |
| Mouse leave | 200–300ms fade-out transition |

## Actions

**Open Node** only in v1 (click = navigate). "Start Review" deferred to
`2026-04-28-review-mode`.

## Aging Revision

### Current System (reference)

| State | Threshold | Visual |
|-------|-----------|--------|
| Fresh | 0–5 days | Saturation 1.0 |
| Stagnant | 6–11 days | Saturation 0.5 |
| Neglected | 12+ days | Saturation 0.2 |

### Proposed Revision

| State | Threshold | Saturation | Opacity |
|-------|-----------|-----------|---------|
| Fresh | 0–3 days | 1.0 | 1.0 |
| Cooling | 3–7 days | 0.75 | 0.92 |
| Stagnant | 7–14 days | 0.45 | 0.78 |
| Neglected | 14+ days | 0.2 | 0.6 |

Opacity lower bound: 0.6 — text readability must be verified against all
backgrounds and themes.

Transitions: No animation. Changes happen silently between sessions.

### Urgency Override

| Condition | Visual |
|-----------|--------|
| Overdue (deadline passed, not completed) | Full saturation, full opacity, red indicator. Aging suppressed |
| Non-urgent | Aging treatment applied normally |

In Rollup Preview, both signals coexist: an urgent item shows urgency visuals,
but the preview can note aging context (e.g., "also untouched for 14 days").

### Aging in Inbox

Scratch items age normally. This provides passive pressure: Scratch left in
Inbox for weeks becomes visually faded, nudging the user to process it.
