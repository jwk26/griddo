# Review Mode

## Metadata

- Created: 2026-04-28
- Readiness: draft
- Category: deferred task
- Source project: griddo2-claude
- Source topic: migrated from out_of_phase ideation
- Source prototype: n/a
- Tags: review, aging, triage, cleanup, ritual
- Dependencies: 2026-04-28-inbox-triage-workspace, 2026-04-28-archive-view-and-restore, 2026-04-28-node-rollup-focus-aging

## Summary

Review Mode is a processing mode for reviewing accumulated work — not for
creating it. It is the active counterpart to the passive Aging system.

Design is fully deferred. It depends on real usage of Triage, Rollup, and
Archive to inform requirements.

## Concept

Aging whispers — items desaturate. Review Mode is where the user hears those
whispers and acts on them.

The pairing creates a weekly ritual:

- Open Review Mode
- See everything that is stagnant or neglected (aging already computed)
- See Bits without deadlines, orphan Bits, completed Nodes still on the grid
- For each: keep, archive, reschedule, trash, or promote
- When done, the grid is clean

## Data Sources

Review Mode processes items from multiple sources using a unified interaction:

- Aging-flagged items (stagnant, neglected)
- Inbox items (unprocessed Scratch — overlaps with Triage)
- Bits without deadlines
- Completed but unarchived Nodes/Bits
- Orphan Bits (no clear parent context)
- Past-deadline unresolved items

## Hidden Dependency: Archive

Without Archive, Review Mode creates decisions but has no "done" destination.
The user reviews a completed Node, decides "this is finished," and has nowhere
to put it except leave it on the grid or delete it.

Archive must exist before Review Mode can feel complete.

## Design Status

Design TBD. Do not design in isolation — wait for real usage patterns from
Triage, Rollup, and Archive to emerge.
