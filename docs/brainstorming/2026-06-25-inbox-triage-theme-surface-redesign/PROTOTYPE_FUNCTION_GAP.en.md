# Inbox/Triage 2-2 Prototype vs Phase 22 Implementation - Functional Gap

## Purpose

This document lists functional elements that exist in the Phase 22 production
implementation but are missing, outdated, or not clearly represented in the 2-2
Inbox/Triage prototypes.

The 2-3 prototype update should add these elements to the prototypes while
preserving each theme's existing visual language.

Production is only the behavior reference. The 2-2 prototypes are the design
source.

## Do Not Treat These As Prototype Requirements

Some production behaviors are real implementation mechanics but do not need to
be implemented or explained in the visual prototypes.

Do not spend prototype work on:

- first-keystroke Scratch Pool collapse mechanics
- production store/state wiring
- real database persistence
- exact production hooks/components
- exact production accessibility implementation
- production blank spacer artifacts

The prototype should show the intended UX and visual states, not reproduce
production internals.

## Functional Elements To Add Or Correct In 2-3

### Scratch Pool

#### Missing or incomplete in 2-2

- Scratch title search.
- Created-at sorting.
- Sort button state/mode visibility.
- Collapsed Scratch switching may be missing or weaker than production.

#### 2-3 target

- Expanded Scratch Pool should have one designed tools area containing:
  - Inbox identity
  - Scratch count
  - collapse/expand control
  - search
  - sort button
- Tools should not look like unrelated stacked header strips.
- Scratch list remains a separate lower area.
- Sort state must be visually clear. The user should understand the current
  sort mode or active/inactive state.
- Collapsed Scratch switching should show the selected Scratch target as more
  prominent than inactive targets.
- Do not show visible label `Scratch Pool`.

### Breakdown

#### Missing or incomplete in 2-2

- Selected Scratch context exists in production but may be absent or too weak in
  prototypes.
- Production uses grip-only Breakdown dragging; some old prototypes may imply
  full-row dragging.
- Archive Scratch completion affordance may not be represented clearly.

#### 2-3 target

- Selected Scratch context should be visually strong and clearly answer:
  "What Scratch am I breaking down right now?"
- It must not look like a normal Breakdown row.
- Keep prototype input-side submit affordances if they already exist. Production
  lacks a strong submit button, but that is not a reason to remove one from the
  prototype.
- Show grip-only dragging affordance. Do not imply full-row dragging.
- Show Archive Scratch as an intentional completion affordance for the
  all-consumed state.
- Do not show visible label `Breakdown / Scribble`.

### Staging

#### Missing or incomplete in 2-2

- Remove-from-staging behavior may not be shown or may not feel intentional.
- Invalid drop states may read as destructive or unclear.
- Node/Bit separation may rely too heavily on visible labels.

#### 2-3 target

- Keep separate Node and Bit staging zones.
- Do not use visible developer labels such as:
  - `Staging: Nodes`
  - `Staging: Bits`
  - `Nodes`
  - `Bits`
- Make Node vs Bit staging understandable through design:
  - layout
  - icon
  - item shape
  - empty state
  - theme-specific affordance
- Make remove-from-staging theme-specific and intentional.
- Keep remove-from-staging non-destructive.
- Invalid drops should feel unavailable or muted, not destructive-red.

### Hierarchy

#### Missing or incomplete in 2-2

- Active-section-scoped hierarchy search may be missing or only decorative.
- Query/result indicator may be missing.
- Search clear affordance may be missing or too text-heavy.
- Search scope may be shown as text instead of visual section emphasis.
- Placement may look immediate or modal-based instead of inline pending.
- Visible `L1`, `L2`, `L3` labels are too developer-oriented.

#### 2-3 target

- Search should live inside the hierarchy menu/surface, not as a detached bar.
- Search should represent active-section-scoped filtering.
- Search indicator should show:
  - query text
  - result count
  - X clear button
- Do not show visible scope text inside the search pill.
- Show scope through active section emphasis and inactive section de-emphasis.
- Use visible labels:
  - Home
  - Level 1
  - Level 2
  - Level 3
- Do not use visible `L1`, `L2`, `L3`.
- Do not repeat selected Node titles under every section heading.
- Replace modal/direct placement presentation with an inline pending placement
  card inside the target hierarchy column.

Example:

```text
Placed Item
Node: Q3 Announcement Planning
[Cancel] [Confirm]
```

- Nothing should appear committed until Confirm.
- Cancel removes the pending card.
- The pending card should be theme-specific.

## Old Prototype Behaviors Not To Carry Forward

- Full-row Breakdown dragging.
- Focus-triggered Scratch Pool collapse.
- Visible developer labels.
- Direct hierarchy placement without confirmation.
- Modal hierarchy placement confirmation.
- Visible scope text inside the hierarchy search pill.

