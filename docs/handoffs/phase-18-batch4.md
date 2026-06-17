# GridDO Handoff — Phase 18 Batch 4 (T84)

> Read this first, run the Resume Sanity Check, then resume.
> Do not launch Codex A or edit source before the next checkpoint approval.

## Resume Point

Continue Phase 18 Batch 4 (T84) at **execute-task Step 4, Stage 2 — Codex A prompt preview**.

Codex A launch is **not yet approved**. The prompt is ready and fully patched at
`.omc/prompts/t84-codex.md`. Show a clean Codex A prompt preview to the user and
wait for explicit approval before launching.

After Codex A completes:
- Run clean-tree gate (`git status --short`)
- Integrate and quality pass (Step 6)
- Verification gate: `pnpm build && pnpm test` (Step 7)
- Launch **Codex B sequentially** (not in parallel) — see A20 below
- Regression reviewer pass (Step 7b) — see Reviewer Plan below

## Current State

- Repo: `/Users/jwk/Documents/griddo2-claude`
- Branch: `phase-18/inbox-triage-dnd`
- Phase / Batch: Phase 18 / Batch 4 — T84 only
- Working tree: clean
- Last commit: `d9c5514` — stamp Batch 4 In Progress
- Source code changed: no (not yet — awaiting Codex A)
- Gemini Stage 1: complete — spec embedded verbatim in `.omc/prompts/t84-codex.md`
- Gemini artifact: `.omc/artifacts/ask/gemini-artifact-only-output-only-the-design-spec-artifact-no-code-n-2026-06-17T06-44-47-040Z.md`
- All 3 prompts fence-checked (official script): balanced

## Settled Decisions

**D1 — `PendingPlacement` type extension:**
Add `candidateType: "node" | "bit" | null` (null = T84 direct path) and `isDirectBreakdown: boolean`.

**D2 — `effectiveType` guard (A21):**
ALL type-dependent checks inside `handlePlacementConfirm` must use `effectiveType`, not
`placement.candidateType`. Three specific checks must be updated:
- Node max-level guard: `effectiveType === "node" && ...`
- Node create branch: `if (effectiveType === "node")`
- Bit root guard + create: `if (effectiveType === "bit")`

**D3 — Early-return before `try/finally` (A21 related):**
The `if (effectiveType === undefined) return;` guard must be placed BEFORE the `try` block,
not inside it. The existing `finally` block calls `setPendingPlacement(null)`, which would
close the dialog if the guard fires inside `try`.

**D4 — Breakdown drag acceptance at hierarchy cells:**
`acceptsCandidate` returns `true` for all `"breakdown"` drag items unconditionally.
Type restrictions (Node disabled at level ≥ 2, Bit disabled at Home) are enforced in
the dialog's type-choice selector (disabled option), NOT at the drop cell.

**D5 — Dialog type-choice selector:**
See the Gemini spec embedded in `.omc/prompts/t84-codex.md` (## Design Specification).
Key: `role="radiogroup"` wrapper, `role="radio"` per option, `rounded-md` for Node option
(NOT `rounded-full` — distinguishes from the T83 fixed badge), `border-primary + ring-1 ring-primary`
for selected state.

**D6 — Codex B sequential after Codex A (A20):**
Codex A and Codex B both touch `src/hooks/use-triage-dnd.test.ts`. To avoid merge
conflict, Codex B must run AFTER Codex A completes. Use sequential labeled markers
(`codex-impl-marker` → Codex A complete → `codex-test-marker` → Codex B). The B prompt
instructs Codex B to read the file's current state before appending.

## Reviewer Plan

**Step 7b: Regression reviewer — triggered** (DnD blast radius + shared state).

After verification gate passes, launch a Codex regression reviewer with:
- Scope: `src/hooks/use-dnd.ts`, `src/components/triage/triage-workspace.tsx`
- Mandate: verify T83 staged-item placement path is unchanged; check that `isDirectBreakdown: false`
  is correctly set in the existing `setPendingPlacement` call; verify `removeStagedCandidate`
  is still called for T83 path and NOT called for T84 path
- Evidence standard: specific code path + triggering condition + concrete consequence

## Open Questions

None at handoff time. All blockers (A19–A21) resolved.

## Authority Pointers

```
Read before resuming:
  docs/EXECUTION_PLAN.md          — T84 spec (Task 84, line 116)
  docs/issues/Issues_Phase_18.md  — Batch Plan (Batch 4: In Progress)
  .omc/prompts/t84-codex.md       — Codex A prompt (Gemini spec already embedded, all patches applied)
  .omc/prompts/t84-codex-test.md  — Codex B prompt (sequential constraint included)

Do NOT read (local-only, do not commit):
  docs/reviews/phase-18-skill-audit.md  — audit A19–A21 live here

Fence check script (not in project root):
  /Users/jwk/.claude/skills/execute-task/scripts/check-prompt-fences
```

## Resume Sanity Check

Before continuing:
1. `git status --short` — must be clean
2. `git log --oneline -3` — last commit must be `d9c5514` or later
3. Verify `.omc/prompts/t84-codex.md` exists and contains `## Design Specification` with the Gemini spec
4. Verify `.omc/prompts/t84-codex-test.md` exists and contains "Execution note" about sequential run
5. Confirm Batch 4 shows `In Progress` in `docs/issues/Issues_Phase_18.md`
6. Re-read `src/hooks/use-dnd.ts`, `src/components/triage/hierarchy-explorer.tsx`,
   `src/components/triage/triage-workspace.tsx` to verify source is still unmodified

## Immediate Next Checkpoint

Show the Codex A prompt (`.omc/prompts/t84-codex.md`) for user approval.
Do NOT launch Codex A without explicit approval.
On approval: touch `.omc/tmp/codex-impl-marker`, then launch:
```
omc ask codex --prompt "$(cat .omc/prompts/t84-codex.md)"
```
Wait for completion. Check exit code. Run clean-tree gate.

## Audit Constraints

- `docs/reviews/phase-18-skill-audit.md` is local-only — do NOT commit it
- Audit entries A19 (fence script location), A20 (Codex A/B same-file conflict), A21 (effectiveType guard) are already recorded
- Do not duplicate these entries in the next session
