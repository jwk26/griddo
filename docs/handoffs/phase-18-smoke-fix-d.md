# Phase 18 Smoke Fix D handoff

Repo: `/Users/jwk/Documents/griddo2-claude`  
Branch: `phase-18/inbox-triage-dnd`  
Baseline commit before this handoff: `58e77a9 fix(triage): smoke fix C — remove synthetic Home item and add section-body drop targets`

## Resume Point

Smoke Fix D is now implemented and manually confirmed:

- `ISSUE-18-10` — staged Node/Bit drag token is offset from the pointer.

Smoke Fix A, Smoke Fix B, Smoke Fix C, and Smoke Fix D are implemented and manually confirmed. Do not redo them unless the user reports a regression.

Phase 18 is ready for `closing-phase` after this documentation update is committed. Do not create a new branch.

## Current State

Closed after manual smoke confirmation:

- `ISSUE-18-11`
- `ISSUE-18-12`
- `ISSUE-18-13`
- `ISSUE-18-14`
- `ISSUE-18-15`
- `ISSUE-18-23`

Remaining Phase 18 close blocker: none.

Deferred issues:

- `ISSUE-18-16` through `ISSUE-18-22` are deferred and indexed in `docs/issues/Issues_Deferred.md`.

## Problem Summary

When dragging a staged Node or staged Bit, the compact drag token appears anchored to the staged item's top-left origin rather than the active mouse pointer. If the user starts dragging from anywhere other than the top-left, the token appears visually detached from the pointer.

Breakdown-row drag is less affected because breakdown rows have a dedicated left grip/handle. Staged Node/Bit items are draggable from the full item surface, so the offset is much more visible.

Expected behavior:

- Dragging a staged Node from any point on the item creates the compact token at the mouse pointer.
- Dragging a staged Bit from any point on the item creates the compact token at the mouse pointer.
- Breakdown-row drag behavior does not regress.

## Smoke Fix D Result

Smoke Fix D added `snapDragTokenToCursor` in `src/components/triage/triage-workspace.tsx` and passed it to `DragOverlay` via `modifiers={[snapDragTokenToCursor]}`. The modifier adjusts the overlay transform from the original draggable element origin to the actual pointer position, centering the compact drag token on the cursor.

Manual smoke confirmed:

- staged Node token aligns to the pointer when grabbed away from top-left.
- staged Bit token aligns to the pointer when grabbed away from top-left.
- breakdown-row drag has no visible regression.
- hierarchy placement and remove-from-staging still work.

## Required Workflow

Use the `closing-phase` workflow.

1. Confirm branch and clean/dirty state.
2. Read:
   - `CLAUDE.md`
   - `docs/issues/Issues_Phase_18.md`
   - `docs/issues/Issues_Phase_18_Smoke_Fix_Handoff.md`
   - this handoff
3. Confirm all Phase 18 planned tasks are `[x]` in `docs/EXECUTION_PLAN.md`.
4. Confirm all manual-smoke close blockers are `Closed` in `docs/issues/Issues_Phase_18.md`.
5. Confirm `ISSUE-18-16` through `ISSUE-18-22` remain deferred and indexed in `docs/issues/Issues_Deferred.md`.
6. Run required closing verification.
7. Emit the Phase 18 closing checkpoint.

## Closing Checkpoint Must Include

- All Phase 18 tasks are complete.
- All manual-smoke close blockers are closed.
- Deferred issues remain deferred and indexed.
- Verification commands and results.
- Merge/PR readiness per closing-phase.

## New Session Prompt

```md
Base repo: /Users/jwk/Documents/griddo2-claude
Branch: phase-18/inbox-triage-dnd

Read docs/handoffs/phase-18-smoke-fix-d.md first, then run closing-phase for Phase 18.

Stay on the current branch. Do not create a new branch.

Phase 18 has no remaining manual-smoke close blockers.

Smoke Fix A/B/C/D are already implemented and manually confirmed:
- ISSUE-18-11
- ISSUE-18-12
- ISSUE-18-13
- ISSUE-18-14
- ISSUE-18-15
- ISSUE-18-10
- ISSUE-18-23

ISSUE-18-16 through ISSUE-18-22 are Deferred and indexed in docs/issues/Issues_Deferred.md; do not include them.

Use closing-phase workflow:
- read the required docs,
- confirm all Phase 18 tasks are [x],
- confirm all manual-smoke close blockers are Closed,
- confirm deferred issues remain indexed,
- run required closing verification,
- emit the Phase 18 closing checkpoint.
```
