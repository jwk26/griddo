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
