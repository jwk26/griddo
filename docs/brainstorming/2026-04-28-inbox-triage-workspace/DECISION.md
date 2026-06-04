# Inbox / Triage Workspace

## Metadata

- Created: 2026-04-28
- Readiness: code-ready
- Category: deferred task
- Source project: griddo2-claude
- Source topic: migrated from out_of_phase ideation
- Source prototype: n/a
- Tags: inbox, triage, scratch-pool, breakdown, staging, hierarchy-explorer
- Dependencies: 2026-04-28-lifecycle-system-foundation, 2026-04-28-quick-capture-entry-surface

## Summary

The Inbox is a system Node at L0 with `systemRole: 'inbox'`. Opening it renders
the Triage workspace — a processing surface that turns unstructured Scratch
items into GridDO Node/Bit hierarchy.

This is not a simple inbox list. It is a structured workspace with four areas.

## Core Interpretation

```text
Inbox/Triage is not a simple Inbox list.
It is a processing workspace that turns Scratch items into GridDO Node/Bit
hierarchy.
```

## Screen Structure

```text
[ Scratch Pool ] [ Main Work Area                                      ]
                 [ Breakdown/Scribble ] [ Node/Bit Staging             ]
                 [ Hierarchy Explorer / Placement across Home-L3        ]
```

- Left: Scratch Pool (full height)
- Right: Main Work Area
- Top-right: Breakdown/Scribble + Node/Bit Staging
- Bottom-right: Hierarchy Explorer / Placement

## Layout Ratios

| Split | Ratio | Reason |
|-------|-------|--------|
| Main Work Area vertical | Top 60% / Bottom 40% | Breakdown + staging need primary space while hierarchy remains visible |
| Top Work Area horizontal | Breakdown 60% / Staging 40% | Staging is a core work area, not a narrow side panel |
| Staging internal | Node 35% / Bit 65% | Node candidates are compact; Bit candidates need more text width |

Staging has two separate layout requirements:

- Outer split: the Staging section is horizontally split into Node Zone (35%)
  and Bit Zone (65%).
- Inner Node layout: Node candidates inside the Node Zone use a two-column
  grid. This is not the same requirement as the outer Node/Bit split.

## Scratch Pool

Full-height panel on the left side.

Expanded state: Header (icon + label + count) + Scratch item list.

Collapsed state: Icon + count + open affordance only.

Rules:
- Each item shows title and `createdAt` display
- Display format: `2h ago`, `yesterday`, `2 days ago`, `6 days ago`, `m/dd/yy`
- Long titles use ellipsis
- After selecting a Scratch and focusing Breakdown, Scratch Pool auto-collapses
- Manual open/close remains available
- Do not force the selected Scratch title into the collapsed rail

### Inbox Badge

Badge shows active Scratch count. Three-level visual model:

| Count | State | Treatment |
|-------|-------|-----------|
| 0 | Hidden | No badge |
| 1–7 | Neutral | Standard badge color |
| 8–14 | Warm | Elevated attention color |
| 15+ | High-pressure | Urgent color |

Count = exact number of active Scratch Bits in the Inbox (`deletedAt = null`
and `archivedAt = null`).
Threshold values are defined as constants in `constants.ts`. Badge colors use
semantic tokens; do not hard-code HSL values.

## Breakdown / Scribble

The selected Scratch becomes the context for free-form idea breakdown.

- Always-active input row
- Idea rows are draggable
- Each row shows: content, `createdAt`, always-visible delete affordance
- Numbering is optional
- Delete requires confirmation
- Dragging an idea into Node/Bit Staging creates a UI candidate and temporarily
  de-emphasizes the source row in Breakdown — the `scratchBreakdowns` row is not
  consumed at this point

Idea rows are persisted in the dedicated `scratchBreakdowns` store (see
`2026-04-28-lifecycle-system-foundation`), not as Chunks. Dragging a row into
Staging creates a UI candidate only — `consumedAt` is not set at this point.
`consumedAt` is set only when the candidate is successfully placed into the
Hierarchy Explorer.

Dragging a Breakdown row directly into the Hierarchy Explorer is also allowed as
a fast placement path. It opens the same placement confirmation dialog used by
staged candidates, but the dialog must require an explicit Node/Bit type
selection before confirmation. No type is preselected by default.

## Node / Bit Staging

Staging converts Breakdown ideas into Node or Bit candidates.

Staging is scoped to the currently selected Scratch. Candidates from different
Scratches are never mixed in Staging. Because staged candidates are UI state only
and their source `scratchBreakdowns` rows stay unconsumed until placement,
switching the selected Scratch loses no persisted data — un-placed candidates can
be re-staged from their Breakdown rows.

```text
[ Node Zone | Bit Zone ]
```

Each zone is both a drop target and a candidate display area. Do not split a
zone into separate "drop area" and "candidate area."

### Node Zone

The Node Zone MUST render its Node candidates in a two-column grid.

```text
Node Zone
| Node | Node |
| Node | Node |
```

This requirement applies inside the Node Zone itself. It is separate from the
outer `[ Node Zone | Bit Zone ]` staging split.

Do not render Node candidates as a single vertical list. Do not reuse the Bit
Zone list/card layout for Node candidates.

Node candidates are compact icon-centered cards, connected to the real GridDO
Node design. Title is short and truncates.

### Bit Zone

Vertical list or compact card stack. Show icon + text only. Do not show priority
or deadline in staging — it makes the zone too noisy.

### Candidate Commit Timing

Node/Bit records are created when a candidate is placed into the Hierarchy
Explorer — not when dropped into Staging. Staging is UI state only.

When a candidate is placed, the source `scratchBreakdowns` row is marked
`consumedAt` (renders with line-through; not deleted).

Dropping a staged candidate into the Hierarchy Explorer opens a confirmation
dialog before any record is created. Use the existing GridDO `Dialog` pattern
used for DnD move confirmations. The dialog must show:

- Source content
- Candidate type (`Node` or `Bit`)
- Destination hierarchy path (for example, `Home / Product / Inbox Improvements`)
- Result summary

Confirm creates the Node/Bit in the selected hierarchy target and marks the
source row `consumedAt`. Cancel, Escape, or closing the dialog leaves the staged
candidate in Staging; no DB record is created and `consumedAt` remains `null`.

If the selected hierarchy target has no available grid cell, the confirmation
dialog remains visible but the confirm action is disabled with a clear reason
such as `No available grid cell in this target`.

Staged candidates are not edited inline in v1. To revise content, remove the
candidate from Staging, edit the source Breakdown row, then stage it again.

To remove a staged candidate before placement, drag it to the shared `Remove
from staging` target that appears while dragging staged candidates. This uses
the same interaction language as the existing grid drag deletion affordance: an
`X` target appears during drag and accepts both Node and Bit staged candidates.
Dropping on the target removes only the staged candidate; the source
`scratchBreakdowns` row returns to active display and `consumedAt` remains
`null`.

When all breakdowns are consumed and no staged candidates remain, the user is
prompted to archive the Scratch:
- Confirm → sets `archivedAt = now` on the Scratch Bit
- Decline → Scratch remains in Inbox, active

The Scratch Bit is never hard-deleted through this path.

## Layout Requirements

- Staging is split horizontally into Node Zone and Bit Zone.
- Node Zone width ratio: 35%.
- Bit Zone width ratio: 65%.
- Inside Node Zone, Node candidates render as a two-column grid.
- Inside Bit Zone, Bit candidates render as a vertical list or compact stack.

### Shape Distinction

Node and Bit candidates must not be the same card with only a different color.
Node: icon-centered object. Bit: text-centered row/card.

## Hierarchy Explorer / Placement

Both navigation and placement. GridDO has four visible hierarchy levels:

```text
[ Home ] [ L1 ] [ L2 ] [ L3 ]
```

| Level | Meaning |
|-------|---------|
| Home | Root grid, L0 Nodes |
| L1 | Inside a level 0 Node |
| L2 | Inside a level 1 Node |
| L3 | Inside a level 2 Node, leaf grid |

Rules:
- Home shows Nodes only
- L1+ may contain Nodes and Bits
- Nodes appear before Bits inside each column
- Selecting a Node opens the next level column (progressive reveal)
- Long Bit titles must ellipsize correctly
- Four columns use available width without large empty space
- Staged candidates can be dragged into a hierarchy column or parent target
- Production implementation must create/move real Nodes/Bits into the selected
  hierarchy target
- Hierarchy drops for Breakdown rows and staged candidates are `pending
  confirmation` targets, not immediate write targets
- Drop target states must distinguish valid, invalid, and pending-confirmation
  targets

## DnD Preview / Targeting

Inbox/Triage drag interactions use compact drag tokens rather than dragging the
full row/card:

- Breakdown row drag: compact icon token, source row stays in place
- Staged Node candidate drag: compact Node token
- Staged Bit candidate drag: compact Bit token

This is a local Batch 1 implementation of the broader Grid DnD direction tracked
in `2026-06-02-grid-dnd-preview-and-drop-targeting`. The broader issue also
affects existing grid Bit drag behavior because Bit cards are horizontal strips
whose full-card drag preview can obscure the intended drop point.

## Confirmed User Flow

```text
1. User selects a Scratch from the Scratch Pool.
2. The selected Scratch becomes the context for Breakdown/Scribble.
3. User writes smaller ideas based on that Scratch.
4. User drags an idea row into Node Zone or Bit Zone.
5. The idea becomes a Node candidate or Bit candidate.
6. User drags the candidate into the Hierarchy Explorer.
7. The candidate is placed into the intended GridDO hierarchy location.
```

Fast path:

```text
1. User drags a Breakdown row directly into the Hierarchy Explorer.
2. Placement confirmation opens.
3. User explicitly chooses Node or Bit and confirms the destination path.
4. The Node/Bit is created and the source Breakdown row is marked consumed.
```

## Scratch Schema Direction

`Scratch` is product language, not a mandatory database type.

Scratch is represented as a Bit parented to the Inbox Node:

| Required field | How satisfied |
|---------------|---------------|
| `title` | User-provided (required) |
| `icon` | `"sparkles"` (system default) |
| `parentId` | Inbox Node ID (auto) |
| `x`, `y` | `0, 0` sentinel (all Scratch Bits) |
| `description` | Schema default: `""` |
| `priority` | Schema default: `null` |
| `deadline` | Schema default: `null` |

The grid-cell uniqueness / placement validation rule is excepted for Bits whose
`parentId` is the Inbox Node. The Triage layout renders Scratch items sorted by
`createdAt`, ignoring grid coordinates.

## Related Future Ideas

- `2026-04-28-quick-capture-entry-surface` — the capture path that feeds Scratch
  items into this workspace
- `2026-05-28-inbox-triage-theme-variants` — visual theme exploration for this
  workspace
- `2026-06-02-grid-dnd-preview-and-drop-targeting` — broader Grid DnD preview
  and drop-targeting direction that this workspace partially implements
- `2026-04-28-triage-scheduling` — potential extension to add scheduling
