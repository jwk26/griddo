# Favorites Star Popout

## Metadata

- Created: 2026-05-18
- Readiness: draft
- Category: feature reference
- Source project: griddo2-claude
- Source topic: Quick Capture prototype exploration
- Source prototype: `origin/prototype/future-ideas`
- Archive status: candidate
- Archive branch: `prototype/future-ideas`
- Archive commit: `e662163`
- Archive route: `/prototype/quick-capture-create-variants` (favorites variant)
- Tags: favorites, sidebar, star, popout, animation

## Summary

The Favorites star popout idea emerged during Quick Capture prototype
exploration. The animation and design are promising enough to preserve, but the
Favorites feature itself is not in current Quick Capture scope.

This should be saved as a future feature reference for a later favorite-node or
sidebar interaction topic.

If promoted as Batch 3, keep the scope intentionally small: adopt the prototype's
star popout interaction/design direction as a compact sidebar affordance
reference. Do not expand this into a full Favorites system unless a separate
planning pass explicitly scopes persistence, ordering, search integration,
breadcrumb integration, and Node/Bit detail behavior.

## Use When

- designing favorite nodes
- revisiting sidebar star interactions
- exploring popout animation patterns
- designing a favorites affordance in the sidebar
- promoting a small prototype-backed Favorites interaction as an independent
  Batch 3 item

## Do Not

- treat as current Quick Capture scope
- expand into a full Favorites system without a separate planning pass
- expose pinned items directly as a long list on the narrow sidebar rail
- bundle Search, breadcrumb, grid, and Node detail integrations into the small
  Batch 3 popout scope
- treat the current worktree path as a stable pointer

## Promotion Scope

Recommended Batch 3 scope:

- Use the archived prototype route as a visual/interaction reference
- Preserve the star popout affordance and animation direction
- Treat the surface as a compact sidebar access pattern
- Keep implementation independent from lifecycle Batch 1 and theme Batch 2

Out of scope for the small Batch 3 promotion:

- Full favorite persistence model beyond what the scoped affordance requires
- Custom ordering/foldering of favorites
- Search overlay pinned section
- Breadcrumb favorite pin
- Node/Bit detail property redesign

## Prototype Source

- branch: `prototype/future-ideas`
- route: `/prototype/quick-capture-create-variants` (favorites variant)
- commit: `e662163`

## Archive Status

Archive candidate.

If preserved as runnable reference, the relevant route is available on the
project-local archive branch `prototype/future-ideas`.
