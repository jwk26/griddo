# Phase 18 Smoke Fix D handoff

Repo: `/Users/jwk/Documents/griddo2-claude`  
Branch: `phase-18/inbox-triage-dnd`  
Baseline commit before this handoff: `58e77a9 fix(triage): smoke fix C — remove synthetic Home item and add section-body drop targets`

## Resume Point

Resume Phase 18 manual-smoke blocker work from **Smoke Fix D**:

- `ISSUE-18-10` — staged Node/Bit drag token is offset from the pointer.

Smoke Fix A, Smoke Fix B, and Smoke Fix C are implemented and manually confirmed. Do not redo them unless the user reports a regression.

Do not run `closing-phase` yet. Do not create a new branch.

## Current State

Closed after manual smoke confirmation:

- `ISSUE-18-11`
- `ISSUE-18-12`
- `ISSUE-18-13`
- `ISSUE-18-14`
- `ISSUE-18-15`
- `ISSUE-18-23`

Remaining Phase 18 close blocker:

- `ISSUE-18-10`

Deferred issues:

- `ISSUE-18-16` through `ISSUE-18-22` are deferred and indexed in `docs/issues/Issues_Deferred.md`.

## Problem Summary

When dragging a staged Node or staged Bit, the compact drag token appears anchored to the staged item's top-left origin rather than the active mouse pointer. If the user starts dragging from anywhere other than the top-left, the token appears visually detached from the pointer.

Breakdown-row drag is less affected because breakdown rows have a dedicated left grip/handle. Staged Node/Bit items are draggable from the full item surface, so the offset is much more visible.

Expected behavior:

- Dragging a staged Node from any point on the item creates the compact token at the mouse pointer.
- Dragging a staged Bit from any point on the item creates the compact token at the mouse pointer.
- Breakdown-row drag behavior does not regress.

## Workload / Provider Guidance

Smoke Fix D is likely smaller than Smoke Fix C, but it is harder to verify with unit tests because the issue is pointer/overlay geometry.

Recommendation:

- Start with direct Claude diagnosis.
- Use OMC/Codex only if the required change spans multiple DnD layers.
- Do not use Gemini/design review unless a new visual design decision appears.
- Browser/manual verification is important.

Likely files to inspect:

- `src/components/triage/staging-zone.tsx`
- `src/components/triage/triage-workspace.tsx`
- `src/hooks/use-dnd.ts`
- `src/lib/grid-dnd.ts`
- existing triage DnD tests

## Required Workflow

Use the `execute-task` workflow.

1. Confirm branch and clean/dirty state.
2. Read:
   - `CLAUDE.md`
   - `docs/issues/Issues_Phase_18.md`
   - `docs/issues/Issues_Phase_18_Smoke_Fix_Handoff.md`
   - this handoff
3. Inspect staged candidate drag rendering and overlay code.
4. Confirm the documented current behavior before patching:
   - staged Node/Bit compact drag token is offset from the pointer when grabbed away from top-left.
   - breakdown-row drag should not regress.
5. Prepare a concise implementation plan before editing.
6. Implement pointer-centered drag token behavior for staged Node/Bit.
7. Preserve:
   - staged Node and staged Bit DnD behavior,
   - remove-from-staging behavior,
   - hierarchy placement behavior,
   - breakdown-row drag behavior and grip affordance.
8. Add focused automated coverage where practical. Do not force brittle pixel-position tests if the behavior is only verifiable in browser/manual smoke.
9. Re-read the diff before running tests.
10. Run focused triage/DnD tests touched by the change.
11. If practical, run a local dev server and browser/manual smoke for staged Node and staged Bit pointer alignment.
12. Run the project gate:
    - `pnpm test`
    - `pnpm build`
13. Update `docs/issues/Issues_Phase_18.md`:
    - `ISSUE-18-10`: `Implemented — awaiting manual smoke confirmation`
14. Commit implementation, tests, and issue doc together.
15. Emit a Smoke Fix D checkpoint.

Do not mark `ISSUE-18-10` as `Closed` until the user manually confirms the smoke behavior.

## Checkpoint Must Include

- Files changed.
- What caused the pointer offset.
- Whether staged Node and staged Bit tokens now align to the pointer.
- Whether breakdown-row drag behavior still works.
- Focused test results.
- Browser/manual smoke result if performed.
- Full `pnpm test` and `pnpm build` results.
- Issue doc status update.
- Whether Phase 18 is ready for final manual confirmation / `closing-phase` after user confirms `ISSUE-18-10`.

## New Session Prompt

```md
Base repo: /Users/jwk/Documents/griddo2-claude
Branch: phase-18/inbox-triage-dnd

Read docs/handoffs/phase-18-smoke-fix-d.md first, then follow it.

Stay on the current branch. Do not create a new branch.
Do not run closing-phase yet.

Phase 18 has one remaining manual-smoke close blocker:
- ISSUE-18-10

Smoke Fix A/B/C are already implemented and manually confirmed:
- ISSUE-18-11
- ISSUE-18-12
- ISSUE-18-13
- ISSUE-18-14
- ISSUE-18-15
- ISSUE-18-23

ISSUE-18-16 through ISSUE-18-22 are Deferred and indexed in docs/issues/Issues_Deferred.md; do not include them.

Use execute-task workflow:
- read the required docs,
- inspect staged candidate drag rendering and overlay code, likely staging-zone.tsx, triage-workspace.tsx, use-dnd.ts, grid-dnd.ts, and existing triage DnD tests,
- confirm the documented behavior before patching: staged Node/Bit compact drag token is offset from the pointer when grabbed away from top-left,
- start with direct Claude diagnosis; use OMC/Codex only if the required change spans multiple DnD layers,
- implement pointer-centered drag token behavior for staged Node/Bit while preserving breakdown-row drag behavior,
- add focused automated coverage where practical, but do not force brittle pixel-position tests,
- run focused triage/DnD tests, browser/manual smoke if practical, and the project gate,
- update docs/issues/Issues_Phase_18.md,
- commit implementation + issue doc,
- do not mark ISSUE-18-10 Closed until user manual-smoke confirmation.
```
