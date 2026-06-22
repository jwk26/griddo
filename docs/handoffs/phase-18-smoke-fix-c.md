# Phase 18 Smoke Fix C handoff

Repo: `/Users/jwk/Documents/griddo2-claude`  
Branch: `phase-18/inbox-triage-dnd`  
Baseline commit before this handoff: `6f5a455 docs: close smoke fixes a and b and prepare hierarchy handoff`

## Resume Point

Resume Phase 18 manual-smoke blocker work from **Smoke Fix C**:

- `ISSUE-18-14` — Hierarchy Explorer section/grid mapping is shifted by a synthetic Home item.
- `ISSUE-18-15` — hierarchy section body should be the primary placement target.

The Codex prompt has already been written, reviewed, patched, and approved in the prior session. **Codex has not been launched yet.**

Approved prompt path:

```text
.omc/prompts/smoke-fix-c-codex.md
```

This prompt file is local workflow state and may be gitignored. Do not recreate it from memory if it is missing; stop and report that the local prompt file is missing.

## Current State

- Smoke Fix A is complete and manually confirmed:
  - `ISSUE-18-11`
  - `ISSUE-18-12`
  - `ISSUE-18-13`
- Smoke Fix B is complete and manually confirmed:
  - `ISSUE-18-23`
- Remaining Phase 18 close blockers:
  - `ISSUE-18-14`
  - `ISSUE-18-15`
  - `ISSUE-18-10`
- Deferred issues:
  - `ISSUE-18-16` through `ISSUE-18-22` are deferred and indexed in `docs/issues/Issues_Deferred.md`.

Do not run `closing-phase` yet. Do not create a new branch.

## Approved Prompt Decisions

The approved Codex prompt includes these decisions:

1. Expected edit files:
   - `src/components/triage/hierarchy-explorer.tsx`
   - `src/components/triage/triage-workspace.test.tsx`
   - `src/hooks/use-triage-dnd.test.ts`
2. If another DnD/collision file is required, Codex must stop and report before expanding scope.
3. `ISSUE-18-14` fix direction:
   - Remove the synthetic `HomeDropCell`.
   - Render root-grid nodes directly in the Home section.
   - Shift child-grid columns so Home -> L1 -> L2 -> L3 represent actual grid depth.
4. `ISSUE-18-15` fix direction:
   - Add section-body droppable targets.
   - Keep direct node-row drop as a shortcut.
   - Add a section-body payload test in `use-triage-dnd.test.ts`.
5. Node-row collision shortcut guard:
   - Do not assume section-body and node-row collision priority without checking `triageCollisionDetection`.
   - `NodeDropCell` must retain its own `useDroppable` registration.
   - Existing node-row drop tests must still pass.
   - If node-row drops are swallowed by section-body drops, stop and report before expanding scope.
6. No Gemini/design review is needed unless a new visual design decision appears.

## Sanity Check Before Launch

Run these checks before launching Codex:

```bash
git branch --show-current
git status --short
~/.claude/skills/execute-task/scripts/check-prompt-ready /Users/jwk/Documents/griddo2-claude/.omc/prompts/smoke-fix-c-codex.md
rg -n 'Do not assume section-body|body-l1|Expected files to edit|NodeDropCell must retain' .omc/prompts/smoke-fix-c-codex.md
```

Expected:

- Branch is `phase-18/inbox-triage-dnd`.
- Working tree is clean except this handoff commit if it has just been created in the previous session.
- `check-prompt-ready` passes.
- The prompt contains the patched node-row collision wording and `body-l1` payload test requirement.

## Launch Step

After the sanity check passes, launch Codex with the approved prompt:

```bash
omc ask codex "$(cat .omc/prompts/smoke-fix-c-codex.md)"
```

Do not launch Gemini. Do not rewrite the prompt unless a sanity check fails.

## After Codex Completes

1. Inspect `git status --short`.
2. Inspect the full diff before running tests.
3. If files outside the expected three were modified, classify why:
   - If Codex stopped and reported scope expansion need, decide with the user.
   - If Codex silently edited unrelated files, do not proceed blindly; report and resolve.
4. Run focused verification first:
   - `pnpm vitest run src/components/triage/triage-workspace.test.tsx src/hooks/use-triage-dnd.test.ts`
5. Run the project gate:
   - `pnpm test`
   - `pnpm build`
6. Update `docs/issues/Issues_Phase_18.md`:
   - `ISSUE-18-14`: `Implemented — awaiting manual smoke confirmation`
   - `ISSUE-18-15`: `Implemented — awaiting manual smoke confirmation`
7. Commit implementation, tests, and issue doc together.
8. Emit a Smoke Fix C checkpoint.

Do not mark `ISSUE-18-14` or `ISSUE-18-15` as `Closed` until the user manually confirms the smoke behavior.

## Checkpoint Must Include

- Files changed.
- Whether `ISSUE-18-14` and `ISSUE-18-15` were implemented.
- Whether Home now shows root-grid nodes directly.
- Whether selecting a node advances its child grid into the next section.
- Whether section-body drop is the primary placement path.
- Whether node-row drop still works as a shortcut.
- Focused test results.
- Full `pnpm test` and `pnpm build` results.
- Issue doc status updates.
- Recommended next pass:
  - Smoke Fix D: `ISSUE-18-10`

## `/clear` Next-Session Prompt

```md
Base repo: /Users/jwk/Documents/griddo2-claude
Branch: phase-18/inbox-triage-dnd

Read docs/handoffs/phase-18-smoke-fix-c.md first.
Then run its sanity check and resume Smoke Fix C from the approved Codex prompt.

Important:
- Codex has not been launched yet.
- The approved prompt is at .omc/prompts/smoke-fix-c-codex.md.
- Do not recreate the prompt from memory if it is missing; stop and report.
- Do not create a new branch.
- Do not run closing-phase.
- Do not launch Gemini unless a new visual design decision appears.

If sanity checks pass, launch:
omc ask codex "$(cat .omc/prompts/smoke-fix-c-codex.md)"

After Codex completes, inspect the diff, run focused tests, run pnpm test and pnpm build, update Issues_Phase_18.md for ISSUE-18-14 and ISSUE-18-15, commit, and emit the Smoke Fix C checkpoint.
```
