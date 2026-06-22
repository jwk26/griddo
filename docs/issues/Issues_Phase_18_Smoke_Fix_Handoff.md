# Phase 18 Smoke Fix Handoff

Use this document as the first-read handoff for a new Claude session that will continue Phase 18 blocker work.

## Current State

- **Repo:** `/Users/jwk/Documents/griddo2-claude`
- **Branch:** `phase-18/inbox-triage-dnd`
- **Do not create a new branch.**
- **Do not run `closing-phase` yet.**

Phase 18 implementation was previously marked complete (`T81` through `T85` are `[x]`), but manual smoke testing found close blockers. Smoke Fix A, Smoke Fix B, and Smoke Fix C are now implemented and manually confirmed. The phase is not ready to close until the remaining blocker `ISSUE-18-10` is fixed and manually confirmed.

Smoke Fix A (`ISSUE-18-11`, `ISSUE-18-12`, `ISSUE-18-13`), Smoke Fix B (`ISSUE-18-23`), and Smoke Fix C (`ISSUE-18-14`, `ISSUE-18-15`) are `Closed` in `docs/issues/Issues_Phase_18.md` after user manual-smoke confirmation on 2026-06-22.

`ISSUE-18-16` through `ISSUE-18-22` are deferred follow-ups and are indexed in `docs/issues/Issues_Deferred.md`. Do not include them in the current smoke-fix work.

## Source Documents to Read First

Read these before planning or editing:

1. `CLAUDE.md`
   - Project rules, verification gate, doc map, git expectations.
2. `docs/WORKFLOW.md`
   - Issue statuses, Deferred index rules, issue closure rule.
3. `docs/issues/Issues_Phase_18.md`
   - Full source of truth for the remaining close blocker `ISSUE-18-10`.
   - Confirm `ISSUE-18-11`, `ISSUE-18-12`, `ISSUE-18-13`, `ISSUE-18-14`, `ISSUE-18-15`, and `ISSUE-18-23` are Closed.
   - Confirm `ISSUE-18-16` through `ISSUE-18-22` are Deferred.
4. `docs/issues/Issues_Deferred.md`
   - Confirm deferred issues are indexed and out of current scope.
5. `docs/EXECUTION_PLAN.md`
   - Phase 18 task context (`T81` through `T85`).

Likely implementation/test files to inspect after reading the docs:

- `src/components/triage/*`
- `src/hooks/use-dnd.ts`
- `src/hooks/use-triage-dnd.test.ts`
- `src/components/triage/triage-workspace.test.tsx`
- `src/components/triage/breakdown-panel.test.tsx`
- `src/lib/grid-dnd.ts`
- `src/lib/db/datastore.ts`
- related DataStore implementations/tests

## Smoke Fix A Known Mechanism

The consumed-state mechanism already has concrete names:

- DataStore API: `markScratchBreakdownConsumed(id)`
- Data field: `scratchBreakdowns.consumedAt`
- Unconsumed row: `consumedAt === null`
- Consumed row: `consumedAt` is a timestamp

These hypotheses are now **RESOLVED by read-only diagnosis** — see "Confirmed root cause" under Smoke Fix A below. Summary: the hook correctly calls `markScratchBreakdownConsumed` (`use-triage-dnd.test.ts` already asserts this across staged/direct paths — **do not duplicate it**), and the DB write is correct, but `breakdown-panel.tsx` never reads `row.consumedAt`, so the consumed state is persisted yet never rendered. Do not re-run open-ended diagnosis; go straight to the confirmed fix.

## Overall Smoke-Fix Structure

Do not fix all blockers in one broad pass. Smoke Fix A, Smoke Fix B, and Smoke Fix C are complete. One smoke-fix pass remains:

1. **Smoke Fix D** — `ISSUE-18-10` (staged drag token pointer offset)

### Smoke Fix A — Consumed-State / Archive Verification Unblock

**Issues:**
- `ISSUE-18-11` — staged placement confirm does not leave source breakdown consumed.
- `ISSUE-18-12` — direct breakdown placement does not consume source row.
- `ISSUE-18-13` — Archive Scratch affordance cannot be verified until 11/12 are fixed.

**Expected behavior:**
- Confirming staged Node placement creates the Node, removes the staged candidate, and leaves the source breakdown row consumed/processed.
- Confirming staged Bit placement creates the Bit, removes the staged candidate, and leaves the source breakdown row consumed/processed.
- Confirming direct breakdown placement as Node creates the Node and marks the original breakdown row consumed/processed.
- Confirming direct breakdown placement as Bit creates the Bit and marks the original breakdown row consumed/processed.
- Once every breakdown row is consumed and staged candidates are zero, the Archive Scratch affordance becomes verifiable.

**Confirmed root cause (diagnosed 2026-06-22, read-only):**
This was diagnosed by reading the code. `ISSUE-18-11` and `ISSUE-18-12` are the **same single bug**, and it is in the **render layer, not the handler**:

- `src/hooks/use-dnd.ts:368` — the confirm handler **does** call `dataStore.markScratchBreakdownConsumed(placement.sourceBreakdownId)` for every path (node/bit, staged/direct). The DB write is correct (`indexeddb.ts:869` sets `consumedAt = Date.now()`; covered by `scratch-breakdowns.test.ts`).
- `use-dnd.ts:371-373` — for staged placement (`!isDirectBreakdown`) it then calls `removeStagedCandidate(...)`, flipping the row's `isStaged` back to `false`.
- `src/components/triage/breakdown-panel.tsx` — `BreakdownRow` (lines ~31-116) and the row map (lines ~286-297) drive all de-emphasis from `isStaged`/`isDragging` only. **They never read `row.consumedAt`.** There is no "consumed/processed" rendering branch at all.

Consequence: after confirm, the staged row loses `isStaged` (→ renders active again = `ISSUE-18-11`); the direct row was never staged (→ renders active throughout = `ISSUE-18-12`). `consumedAt` is persisted but never displayed. This is a **missing feature in the view**, not a regression.

`ISSUE-18-13` is effectively already working: `src/hooks/use-can-archive-scratch.ts:12` reads `consumedAt` correctly, so the Archive Scratch bar already appears once all rows are consumed. It was only **un-observable** because the rows still looked active. **`ISSUE-18-13` needs no code change — re-verify only** after the render fix.

**The fix (single, small, direct — no Codex):**
- In `breakdown-panel.tsx`, add a consumed/processed visual branch to `BreakdownRow` driven by `row.consumedAt !== null` (e.g. line-through + de-emphasis, plus a stable `data-testid` for the test). Confirm `useScratchBreakdowns` still returns consumed rows (the row stays visible-but-processed until Archive; the ArchiveScratchBar copy confirms this intent).
- Scope is ~5-15 lines in one file. Implement directly; do not run the Codex prompt cycle for a change this small.

**Why this is first:**
`ISSUE-18-13` is gated by `ISSUE-18-11` and `ISSUE-18-12`. Archive Scratch cannot be reliably smoke-tested until consumed state renders correctly.

`ISSUE-18-13` may require no independent implementation. Treat it first as a re-verification item after `ISSUE-18-11` and `ISSUE-18-12` are fixed.

**Current status:** Closed after user manual-smoke confirmation on 2026-06-22.

### Smoke Fix B — Archive Scratch Affordance Placement / Add-note Availability

**Issue:**
- `ISSUE-18-23` — Archive Scratch affordance replaces the Add note input and blocks further breakdown entry.

**Observed behavior:**
- When all breakdown rows are consumed and no staged candidates remain, the Archive Scratch affordance appears in the bottom input area.
- The affordance replaces `Add a note...`.
- Canceling the archive confirmation dialog does not hide the affordance because the archive-ready condition remains true.
- The user cannot add more breakdown rows after reaching archive-ready state.

**Expected behavior:**
- Keep the `Add a note...` input available at the bottom of the Breakdown panel.
- Render the Archive Scratch affordance inside the breakdown rows/list area instead of replacing the input.
- If the user adds a new breakdown row, it starts with `consumedAt === null`; therefore `canArchiveScratch` becomes false and the affordance disappears automatically.
- Archive confirm/cancel behavior remains otherwise unchanged.

**Archive View note:**
Do not create a separate issue for Archive View visibility. Phase 18 owns archiving the Scratch out of the active Inbox/Triage flow. Phase 19 (`T86`) owns the Archive View surface/routing where archived Scratches become visible.

**Why this is second:**
This was discovered while manually verifying Smoke Fix A and blocks the T85 completion UX. It is smaller and more local than the Hierarchy Explorer model fixes, so handle it before the larger hierarchy pass.

**Current status:** Closed after user manual-smoke confirmation on 2026-06-22.

### Smoke Fix C — Hierarchy Explorer Section/Grid Model

**Issues:**
- `ISSUE-18-14` — Hierarchy Explorer section/grid mapping is shifted by a synthetic Home item.
- `ISSUE-18-15` — hierarchy section body should be the primary placement target.

**Expected behavior:**
- Remove the synthetic `Home` item/drop cell from the Home section.
- The Home section shows actual root-grid contents directly.
- Selecting a node in Home opens that node's grid in L1.
- Selecting a node in L1 opens that node's grid in L2.
- Selecting a node in L2 opens that node's grid in L3.
- A deep path such as `Home -> g -> 121221 -> 32ㄴ -> Bit-only grid` remains navigable and placeable.
- Section body drop is the primary placement action for the represented grid.
- Direct node-row drop remains available as a shortcut.

**Why this is third:**
`ISSUE-18-14` and `ISSUE-18-15` are the same mental-model problem. The section mapping and section-body placement target should be designed and tested together.

**Current status:** Closed after user manual-smoke confirmation on 2026-06-22.

### Smoke Fix D — Staged Drag Token Pointer Offset

**Issue:**
- `ISSUE-18-10` — staged Node/Bit drag token is offset from the pointer.

**Expected behavior:**
- Dragging a staged Node from any point on the item creates the compact token at the mouse pointer.
- Dragging a staged Bit from any point on the item creates the compact token at the mouse pointer.
- Breakdown-row drag behavior does not regress.

**Why this is fourth:**
This is a DnD overlay/preview positioning issue and is mostly independent from consumed-state and hierarchy-section behavior.

## Start With Smoke Fix D Only

The next session should begin with **Smoke Fix D only** (`ISSUE-18-10`).

Do not modify Deferred issues `ISSUE-18-16` through `ISSUE-18-22`.

## Workload / Provider Guidance for Smoke Fix D

Smoke Fix D is likely smaller than Smoke Fix C but harder to verify automatically. It is a staged Node/Bit drag-overlay pointer alignment issue:

- The compact drag token appears anchored to the staged item top-left origin rather than the active mouse pointer.
- The problem affects staged Node and staged Bit items because their whole item surface is draggable.
- Breakdown row drag is less affected because it has a dedicated left grip/handle.

**Recommendation:** start with direct Claude diagnosis before using OMC/Codex. If the fix is localized to the drag overlay or staged candidate drag handle/activator, direct editing is appropriate. Use OMC/Codex only if diagnosis shows broader DnD architecture changes. Browser/manual verification is important because pointer offset is difficult to prove with unit tests alone.

## Required Workflow for Smoke Fix D

Use the `execute-task` workflow.

1. Confirm branch and clean/dirty state.
2. Read the source documents listed above.
3. Inspect staged candidate drag rendering and overlay code, likely:
   - `src/components/triage/staging-zone.tsx`
   - `src/components/triage/triage-workspace.tsx`
   - `src/hooks/use-dnd.ts`
   - `src/lib/grid-dnd.ts`
   - existing triage DnD tests
4. Confirm the documented current behavior:
   - staged Node/Bit drag token is offset from the pointer when drag starts away from the item's top-left.
   - breakdown-row drag should not regress.
5. Prepare a focused implementation plan before editing. Use Codex only if the required change spans multiple DnD layers.
6. Expected implementation direction:
   - Make the compact drag token align to the active pointer regardless of where the staged Node/Bit item is grabbed.
   - Preserve staged Node and staged Bit DnD behavior.
   - Preserve breakdown-row drag behavior and its grip affordance.
7. Add focused automated coverage only where practical. Do not force brittle pixel-position unit tests if the behavior is only verifiable in browser/manual smoke. Prefer a minimal regression test around any changed helper or component contract.
8. Re-read your own diff before running tests.
9. Run focused triage/DnD tests touched by the change.
10. Run browser/manual smoke for staged Node and staged Bit pointer alignment if a local dev server is used.
11. Run the actual project verification gate from `CLAUDE.md` / package scripts.
    - Do not assume `pnpm typecheck` exists.
12. Update `docs/issues/Issues_Phase_18.md`.
13. Commit implementation and issue-doc updates.
14. Emit a checkpoint.

## Issue Status Rules

Do not mark `ISSUE-18-10` as `Closed` after implementation.

Issue closure requires explicit user manual-smoke confirmation. Until then, use wording equivalent to:

- `Implemented — awaiting manual smoke confirmation`

## Smoke Fix A/B/C Status

Smoke Fix A, Smoke Fix B, and Smoke Fix C have already been implemented and manually confirmed. Keep this section as context only; do not redo them unless the user reports a regression.

### Completed Automated Verification

Because 11 and 12 share one render-layer root cause, the missing assertion is **a single render test**, not four. Do not re-inflate this into a per-path test matrix.

Completed automated assertions:

- A `breakdown-panel.tsx` render test now covers a row with `consumedAt !== null` and no staged candidate rendering the consumed/processed treatment.
- The test was confirmed RED before implementation and GREEN after the fix.
- Do **not** add more hook-level `markScratchBreakdownConsumed` call assertions — `use-triage-dnd.test.ts` already covers them.
- Existing T83/T84/T85 placement paths do not regress.

### Manual Smoke Confirmed

- Use shallow placement targets first, such as Home/L1, so Smoke Fix A does not get blocked by known Hierarchy Explorer blockers `ISSUE-18-14` and `ISSUE-18-15`.
- staged Node placement confirm leaves the visible source breakdown row consumed/processed.
- staged Bit placement confirm leaves the visible source breakdown row consumed/processed.
- direct breakdown -> Node confirm leaves the visible source breakdown row consumed/processed.
- direct breakdown -> Bit confirm leaves the visible source breakdown row consumed/processed.
- all rows consumed + no staged candidates shows Archive Scratch affordance.
- Archive Scratch affordance no longer replaces the add-note input.
- adding a new breakdown row after archive-ready state hides the Archive Scratch affordance.
- Archive Scratch confirm archives/clears selection as previously implemented.
- Home section shows root-grid nodes directly.
- Selecting nodes advances child grids into the next section correctly.
- Section body drop is the primary placement path.
- Node-row drop still works as a shortcut.

## Checkpoint Requirements

The checkpoint for Smoke Fix D must report:

- That this pass was **Smoke Fix D**.
- Whether `ISSUE-18-10` was implemented.
- What caused the pointer offset.
- Whether staged Node and staged Bit drag tokens align to the pointer when grabbed away from top-left.
- Whether breakdown-row drag behavior still works.
- Files changed.
- Tests added or updated.
- Verification commands and results.
- `docs/issues/Issues_Phase_18.md` status updates.
- Which items still need user manual-smoke confirmation.
- Whether Phase 18 is ready for final manual confirmation / closing-phase after `ISSUE-18-10` is manually confirmed.

## New Session Prompt

Paste this into the new Claude session:

```md
Base repo: /Users/jwk/Documents/griddo2-claude
Branch: phase-18/inbox-triage-dnd

Read docs/issues/Issues_Phase_18_Smoke_Fix_Handoff.md first, then follow it.

Stay on the current branch. Do not create a new branch.
Do not run closing-phase.

Phase 18 has one remaining manual-smoke close blocker: ISSUE-18-10.
ISSUE-18-16 through ISSUE-18-22 are Deferred and indexed in docs/issues/Issues_Deferred.md; do not include them.

Smoke Fix A (ISSUE-18-11, ISSUE-18-12, ISSUE-18-13), Smoke Fix B (ISSUE-18-23), and Smoke Fix C (ISSUE-18-14, ISSUE-18-15) have already been implemented and manually confirmed. Do not redo them unless the user reports a regression.

Start with Smoke Fix D only:
- ISSUE-18-10

Use execute-task workflow:
- read the required docs,
- inspect staged candidate drag rendering and overlay code, likely staging-zone.tsx, triage-workspace.tsx, use-dnd.ts, grid-dnd.ts, and existing triage DnD tests,
- confirm the documented behavior before patching: staged Node/Bit compact drag token is offset from the pointer when grabbed away from top-left,
- start with direct Claude diagnosis; use OMC/Codex only if the required change spans multiple DnD layers,
- implement pointer-centered drag token behavior for staged Node/Bit while preserving breakdown-row drag behavior,
- add focused automated coverage where practical, but do not force brittle pixel-position tests,
- run focused triage/DnD tests, browser/manual smoke if a dev server is used, and the actual project gate,
- update docs/issues/Issues_Phase_18.md,
- commit implementation + issue doc,
- do not mark issues Closed until user manual-smoke confirmation.
```
