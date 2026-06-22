# Phase 18 Smoke Fix Handoff

Use this document as the first-read handoff for a new Claude session that will continue Phase 18 blocker work.

## Current State

- **Repo:** `/Users/jwk/Documents/griddo2-claude`
- **Branch:** `phase-18/inbox-triage-dnd`
- **Do not create a new branch.**
- **Do not run `closing-phase` yet.**

Phase 18 implementation was previously marked complete (`T81` through `T85` are `[x]`), but manual smoke testing found close blockers. The phase is not ready to close until `ISSUE-18-10` through `ISSUE-18-15` are fixed and manually confirmed.

`ISSUE-18-16` through `ISSUE-18-22` are deferred follow-ups and are indexed in `docs/issues/Issues_Deferred.md`. Do not include them in the current smoke-fix work.

## Source Documents to Read First

Read these before planning or editing:

1. `CLAUDE.md`
   - Project rules, verification gate, doc map, git expectations.
2. `docs/WORKFLOW.md`
   - Issue statuses, Deferred index rules, issue closure rule.
3. `docs/issues/Issues_Phase_18.md`
   - Full source of truth for `ISSUE-18-10` through `ISSUE-18-15`.
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

## Overall Smoke-Fix Structure

Do not fix all blockers in one broad pass. Use three sequential passes.

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

**Why this is first:**
`ISSUE-18-13` is blocked by `ISSUE-18-11` and `ISSUE-18-12`. Archive Scratch cannot be reliably smoke-tested until consumed state is correct.

### Smoke Fix B — Hierarchy Explorer Section/Grid Model

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

**Why this is second:**
`ISSUE-18-14` and `ISSUE-18-15` are the same mental-model problem. The section mapping and section-body placement target should be designed and tested together.

### Smoke Fix C — Staged Drag Token Pointer Offset

**Issue:**
- `ISSUE-18-10` — staged Node/Bit drag token is offset from the pointer.

**Expected behavior:**
- Dragging a staged Node from any point on the item creates the compact token at the mouse pointer.
- Dragging a staged Bit from any point on the item creates the compact token at the mouse pointer.
- Breakdown-row drag behavior does not regress.

**Why this is third:**
This is a DnD overlay/preview positioning issue and is mostly independent from consumed-state and hierarchy-section behavior.

## Start With Smoke Fix A Only

The next session should begin with **Smoke Fix A only**.

Do not modify `ISSUE-18-14`, `ISSUE-18-15`, or `ISSUE-18-10` unless diagnosis proves a direct dependency. If such a dependency appears, stop and ask the user before expanding scope.

Do not modify Deferred issues `ISSUE-18-16` through `ISSUE-18-22`.

## Required Workflow for Smoke Fix A

Use the `execute-task` workflow.

1. Confirm branch and clean/dirty state.
2. Read the source documents listed above.
3. Read relevant implementation and test files.
4. Diagnose why previous automated tests passed while manual smoke failed.
5. Prepare a small implementation plan.
6. Show the Codex prompt preview and wait for explicit user approval.
7. Launch Codex only after approval.
8. Inspect the diff before running tests.
9. Add or update focused regression tests that would have caught the manual-smoke failure.
10. Run focused tests first.
11. Run the actual project verification gate from `CLAUDE.md` / package scripts.
    - Do not assume `pnpm typecheck` exists.
12. Update `docs/issues/Issues_Phase_18.md`.
13. Commit implementation and issue-doc updates.
14. Emit a checkpoint.

## Issue Status Rules

Do not mark `ISSUE-18-11`, `ISSUE-18-12`, or `ISSUE-18-13` as `Closed` after implementation.

Issue closure requires explicit user manual-smoke confirmation. Until then, use wording equivalent to:

- `Implemented — awaiting manual smoke confirmation`

The same applies later to `ISSUE-18-14`, `ISSUE-18-15`, and `ISSUE-18-10`.

## Smoke Fix A Verification Checklist

Minimum verification for Smoke Fix A:

- staged Node placement confirm leaves source breakdown row consumed.
- staged Bit placement confirm leaves source breakdown row consumed.
- direct breakdown -> Node confirm marks source breakdown row consumed.
- direct breakdown -> Bit confirm marks source breakdown row consumed.
- all rows consumed + no staged candidates shows Archive Scratch affordance.
- Archive Scratch cancel keeps state unchanged.
- Archive Scratch confirm archives/clears selection as previously implemented.
- Existing T83/T84/T85 placement paths do not regress.

## Checkpoint Requirements

The checkpoint for Smoke Fix A must report:

- That this pass was **Smoke Fix A**.
- Which of `ISSUE-18-11`, `ISSUE-18-12`, and `ISSUE-18-13` were implemented.
- Files changed.
- Tests added or updated.
- Verification commands and results.
- `docs/issues/Issues_Phase_18.md` status updates.
- Which items still need user manual-smoke confirmation.
- Recommended next pass:
  - Smoke Fix B: `ISSUE-18-14` / `ISSUE-18-15`
  - Smoke Fix C: `ISSUE-18-10`

## New Session Prompt

Paste this into the new Claude session:

```md
Base repo: /Users/jwk/Documents/griddo2-claude
Branch: phase-18/inbox-triage-dnd

Read docs/issues/Issues_Phase_18_Smoke_Fix_Handoff.md first, then follow it.

Stay on the current branch. Do not create a new branch.
Do not run closing-phase.

Phase 18 has manual-smoke close blockers ISSUE-18-10 through ISSUE-18-15.
ISSUE-18-16 through ISSUE-18-22 are Deferred and indexed in docs/issues/Issues_Deferred.md; do not include them.

Start with Smoke Fix A only:
- ISSUE-18-11
- ISSUE-18-12
- ISSUE-18-13

Use execute-task workflow:
- read the required docs,
- diagnose before patching,
- show a focused Codex prompt preview and wait for explicit approval,
- add regression tests that catch the manual-smoke failure,
- run focused tests and the actual project gate,
- update docs/issues/Issues_Phase_18.md,
- commit implementation + issue doc,
- do not mark issues Closed until user manual-smoke confirmation.
```

