# Inbox/Triage Theme Variants

## Metadata

- Created: 2026-05-28
- Readiness: draft
- Category: visual reference
- Source project: griddo2-claude
- Source topic: consolidated from griddo2-claude-themes2-2 prototype work
- Source prototype: `origin/prototype/future-ideas`
- Archive branch: `prototype/future-ideas`
- Archive commit: `d963807`
- Archive routes: see list below
- Tags: inbox, triage, themes, visual-exploration, design-variants
- Dependencies: 2026-04-28-inbox-triage-workspace, 2026-05-28-theme-system-and-calendar-theming

## Summary

Visual exploration of the settled Inbox/Triage workspace structure under 8
different visual themes. Each variant implements the same screen structure
(Scratch Pool + Breakdown/Scribble + Node/Bit Staging + Hierarchy Explorer)
with a distinct visual language.

These are design explorations, not implementation candidates. The final visual
direction should be chosen during promotion based on which theme best serves
the Triage workflow.

## Variants

| Theme | Route | Character |
|-------|-------|-----------|
| griddo | `/prototype/inbox-triage-griddo` | Default GridDO identity |
| tiny-desk | `/prototype/inbox-triage-tiny-desk` | Wooden planner / corkboard |
| neumorphism | `/prototype/inbox-triage-neumorphism` | Soft extrusion |
| claymorphism | `/prototype/inbox-triage-claymorphism` | Glossy clay |
| origami | `/prototype/inbox-triage-origami` | Paper fold |
| terminal | `/prototype/inbox-triage-terminal` | Monochrome terminal |
| retro-mac | `/prototype/inbox-triage-retro-mac` | Classic Mac OS |
| graphite | `/prototype/inbox-triage-graphite` | Neutral dark/light |

## What Each Variant Shows

Each variant implements the settled Inbox/Triage structure from
`2026-04-28-inbox-triage-workspace`:

- Scratch Pool (left panel, collapsible)
- Breakdown/Scribble (top-right, idea decomposition)
- Node/Bit Staging (top-right, candidate conversion)
- Hierarchy Explorer (bottom-right, Home-L3 placement)

The structural layout and user flow are identical across variants. Only visual
treatment (colors, shapes, shadows, typography, spacing, borders) differs.

## Use When

- Choosing the visual direction for Inbox/Triage implementation
- Exploring how different visual languages affect the Triage workflow feel
- Comparing information density and readability across themes

## Do Not

- Treat any single variant as the adopted implementation source
- Mix visual elements from different variants without a deliberate design pass
- Assume these prototypes have production-quality code structure

## Prototype Source

- Branch: `prototype/future-ideas`
- Remote: `origin/prototype/future-ideas`
- Commit: `d963807`
- All 8 routes under `/prototype/inbox-triage-*`

The prototype branch is a reference/source archive, not canonical implementation.

## Promotion Intake Decisions — 2026-06-23

These decisions were confirmed during Batch 2 promotion intake after Phase 19
completion.

### Source Authority

- The 8 Inbox/Triage prototype variants remain visual reference material only.
- Do not copy any variant directly into the current implementation.
- Batch 2 must use `docs/recipes/inbox-triage-batch2-visual-recipe.md` as the
  promoted visual/interaction recipe for Inbox/Triage.
- Current Phase 17-19 behavior is the implementation baseline.

### Scratch Pool

- Expanded Scratch Pool needs inbox identity, count, fold/unfold control, title
  search, and an icon-only asc/desc sort toggle.
- The visible label `Scratch Pool` should not appear in the final UI.
- Search filters scratch titles only.
- Sort target is scratch `createdAt`; modes are newest-first and oldest-first.
- Sort control appears only when expanded; collapsed mode does not need sort.
- Collapsed Scratch Pool needs compact scratch switching, with selected scratch
  visibly distinct and accessible names/tooltips for switch targets.

### Breakdown

- Add selected Scratch context to the Breakdown area.
- Do not copy the prototype's context treatment as-is; it is too small and too
  weak for the current surface.
- Keep Breakdown row dragging grip-only. Full-row dragging from the prototype is
  rejected.
- Improve drag grip visibility and targetability.
- Preserve and visually integrate `ArchiveScratchBar` for all-consumed
  Breakdown states.

### Staging

- Remove visible developer-facing section labels from the final UI, including
  `Staging: Nodes` and `Staging: Bits`.
- Preserve separate Node and Bit staging zones.
- If remove-from-staging controls are touched during Batch 2, align their
  treatment with the new visual language.

### Hierarchy Explorer

- Remove the visible `Hierarchy Explorer` heading from the final UI.
- Remove the unnecessary gap between the hierarchy shell and the Home/L1/L2/L3
  columns.
- Add hierarchy search scoped to the active hierarchy section only.
- The active hierarchy section is the deepest currently opened section.
- The search query persists when the active section changes.
- If the active section changes while a query remains, flash or highlight the
  search input/query to show that filtering is still active.
- Search filters Node/Bit titles only.
- Global app search is out of scope.

### Labels

- Visible developer labels should be removed from the final Inbox UI:
  `Scratch Pool`, `Breakdown / Scribble`, `Node Staging`, `Bit Staging`, and
  `Hierarchy Explorer`.
- These names may remain in internal component names, tests, docs,
  `aria-label`s, or visually hidden labels.
- `Home`, `L1`, `L2`, and `L3` may remain only as subtle navigation/depth
  context, not as prominent section headings.
