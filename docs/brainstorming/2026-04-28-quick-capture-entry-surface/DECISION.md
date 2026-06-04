# Quick Capture Entry Surface

## Metadata

- Created: 2026-04-28
- Readiness: code-ready
- Category: deferred task
- Source project: griddo2-claude
- Source topic: migrated from out_of_phase ideation
- Source prototype: `origin/prototype/future-ideas`
- Archive branch: `prototype/future-ideas`
- Archive commit: `e662163`
- Archive route: `/prototype/quick-capture-create-variants`
- Tags: quick-capture, scratch, capture-vs-create, entry-surface, sidebar-plus
- Dependencies: 2026-04-28-lifecycle-system-foundation

## Summary

Quick Capture is a fast capture path for unstructured thought. It is separate
from structured Node/Bit creation.

The core product distinction:

```text
Capture = save raw thought before it is lost.
Create = intentionally create a Node or Bit in GridDO structure.
```

Quick Capture should not be treated as a flat chooser with no intent grouping.
Scratch, Node, and Bit may appear in one entry surface, but Scratch belongs to
`Ideas` while Node and Bit belong to `Create`.

## Dependents

- `2026-04-28-inbox-triage-workspace` — captured Scratch items feed into the
  Inbox/Triage workspace

## Product Language

`Scratch` is the product language for an unstructured captured thought before it
becomes a Node or Bit.

- `Scratch` is product/UI language, not a mandatory database type
- For Batch 1, Scratch is represented as a Bit parented to the Inbox Node
- To the user, Scratch means "a thought that has not been structured yet"

## Entry Surface Direction

The sidebar `+` button should open an entry surface that separates user intent
before asking for details.

### Menu Hierarchy

```text
Ideas
  Scratch

Create
  Node
  Bit
```

`Scratch` is the primary Quick Capture action by position and grouping. `Node`
and `Bit` remain nearby in the same surface under the separate `Create` intent.

### Visual Source

The `+` entry surface uses `surface(main)` from `griddo2-claude-qc` as the
visual/interaction reference. The surface slides/fades in anchored to the sidebar
`+` button (not a centered modal). It presents the Ideas/Create hierarchy
without blocking the grid.

Available on branch `prototype/future-ideas`, route
`/prototype/quick-capture-create-variants`, commit `e662163`.

### Scratch Capture Modal

Clicking `Scratch` opens a centered, one-line capture modal with placeholder:

```text
Capture your ideas...
```

`Cmd+K` opens the **Command Palette** (1 = Scratch, 2 = Search). The `+` surface
may show a `Cmd+K` palette hint at the surface level; the Scratch row itself
does not carry a dedicated shortcut (within the palette, Scratch is key `1`).

### Fast Scratch Capture Contract

- Title/text is the only required user input
- Captured Scratch goes to Inbox regardless of current grid location
- Parent selection is not part of fast capture
- Grid-cell placement is not part of fast capture
- Lightweight confirmation and a path to open Inbox

### Command Palette

`Cmd+K` opens a **Command Palette** showing two options:

| Key | Action |
|-----|--------|
| 1 | Jump to Scratch capture |
| 2 | Jump to Search |

Key mapping (1=Scratch, 2=Search) is a product interaction decision. The
visual/interaction design for the Command Palette is sourced from
`2026-05-18-quick-capture-palette` (Batch 1 partial adoption — recipe source
only). The `+` entry surface uses `surface(main)` and is unchanged.

Search (key `2`) opens the existing Search overlay without modification. This
does not redesign Search — result ranking, filtering, and UI remain out of scope
for this palette integration.

### Node/Bit Creation

Node and Bit creation remain accessible through the `+` surface but are not the
same intent as capture.

| Creation target | Required decision |
|-----------------|-------------------|
| Node | Which grid level / parent context receives the Node |
| Bit | Which parent Node receives the Bit |

Create modals use progressive steps: title first, details second.

### Context Behavior

- L0/global `+` may show `Bit` in `Create` group, but clicking it must open a
  parent selector. Must not create a Bit directly on L0
- Inside a Node, `Bit` uses the current Node as parent
- Level 1-2 may show both `Node` and `Bit`
- Level 3 is Bit-only; Node creation is unavailable
- Calendar/global creation remains unscheduled by default

## Known Decisions

- GridDO opens to L0 Grid, not Inbox/Triage
- L0 Grid remains the primary first impression
- Inbox/Triage is a processing workspace, not the app's default home
- Scratch items use `"sparkles"` as the system default icon (see
  `2026-04-28-lifecycle-system-foundation`)
