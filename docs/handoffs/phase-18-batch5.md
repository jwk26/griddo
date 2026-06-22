Phase 18 Batch 5 (T85) compact handoff

Repo: /Users/jwk/Documents/griddo2-claude
Branch: phase-18/inbox-triage-dnd
Phase / Batch: Phase 18, Batch 5 (T85)

## Resume Point

Continue from execute-task Step 4 — Stage 2 Codex prompt approval.
Before doing anything, read /Users/jwk/.claude/skills/execute-task/SKILL.md Step 4.
Do not rely on memory for stage gate rules, batch plan write points, or prompt launch sequencing.

## Current State

- Working tree: clean (verified at handoff time)
- HEAD: d8f14ba (chore: stamp Batch 5 (T85) In Progress in phase-18 issue doc)
- Source code changed: NO — no implementation files have been modified yet
- Gemini Stage 1: COMPLETE
  Spec artifact: /Users/jwk/.gemini/antigravity-cli/brain/6d00c8ec-f9f6-4358-ae9f-de02dd4ec8b7/t85_design_spec.md
- Codex A prompt: .omc/prompts/t85-codex.md (fence check passed: OK 12 lines)
- Codex B prompt: .omc/prompts/t85-codex-test.md (fence check passed: OK 4 lines, but see launch blocker below)
- Stage 2 preview: shown to user but NOT yet explicitly approved for launch
- next_action_approval: blocked_until_codex_b_prompt_patch

## Settled Decisions

D1: Remove-from-staging target placement → Option B: bottom strip spanning only the Staging column (right 2/5). NOT full-width across breakdown + staging. h-12, border-t border-dashed border-border, X icon + "Remove from staging" text.

D2: Archive affordance placement → Option B: replaces "Add a note" bar entirely when canArchiveScratch is true. The bar returns when the condition is no longer met.

D3: Archive affordance tone → neutral (bg-muted), no green. No green success token exists in the design system. Completion conveyed by CheckCircle2 icon + "All items processed" copy only.

D4 (conversation-only override): Gemini specified bg-accent text-foreground for the archive button. Claude resolved this to variant="outline" — the closest Button component equivalent that achieves a visible non-destructive action without inventing a custom Tailwind class. This override is embedded in .omc/prompts/t85-codex.md. Verify it survived before launching Codex.

D5: Confirmation dialog copy → title "Archive this Scratch?", description "This Scratch and its processed breakdown rows will be moved to your archive. You can access, view, or restore them at any time from the Archive View.", confirm "Archive Scratch" (neutral/default styling — NOT destructive because archiving is reversible), cancel "Cancel".

D6: ISSUE-18-03 cleanup → fix isStaged && !isDragging opacity in BreakdownRow. Covered in Codex A prompt.

D7: Batch classification → mixed + behavior-heavy. Codex A is the implementer. Codex B is the test author, but it must NOT launch in parallel in the current prompt state.

D8 (launch blocker discovered after Stage 2 preview): Do NOT approve the current "launch Codex A and Codex B in parallel" plan. The Codex B prompt repeats the T84 stale-test-author failure pattern:
- It says "Do NOT read or duplicate existing tests" while also requiring a patch to the existing `src/hooks/use-triage-dnd.test.ts` mock.
- It writes directly to the working tree.
- It risks duplicating existing hook coverage, especially after T84's duplicate describe-block incident.

Required fix before any Codex B launch:
- Patch `.omc/prompts/t85-codex-test.md` to remove "Do NOT read existing tests".
- Replace it with: "Read the current test files first to reuse existing mocks, imports, helpers, and avoid duplicate describe/test coverage."
- Keep implementation independence as: "Do not inspect Codex A implementation files for behavior."
- Run Codex B sequentially after Codex A completes and after inspecting Codex A's diff. If Codex A added T85 tests, patch Codex B to add only missing coverage.
- After Codex B integration, run a duplicate describe scan for the T85 describe names before verification.

## Open Questions

None — spec is complete, prompts are ready.

## Authority Pointers

Read:
- Execute-task skill: /Users/jwk/.claude/skills/execute-task/SKILL.md
- T85 spec: docs/EXECUTION_PLAN.md § Task 85 (lines 126–143)
- Gemini design spec (full): /Users/jwk/.gemini/antigravity-cli/brain/6d00c8ec-f9f6-4358-ae9f-de02dd4ec8b7/t85_design_spec.md
- Codex A prompt: .omc/prompts/t85-codex.md
- Codex B prompt: .omc/prompts/t85-codex-test.md
- Phase 18 issues: docs/issues/Issues_Phase_18.md
- Skill audit (local-only, gitignored): docs/reviews/phase-18-skill-audit.md

## Resume Sanity Check

Before continuing:
1. git status --short (must be clean)
2. git log --oneline -3 (verify HEAD is d8f14ba)
3. ls .omc/prompts/t85-codex.md .omc/prompts/t85-codex-test.md (both must exist)
4. ls /Users/jwk/.gemini/antigravity-cli/brain/6d00c8ec-f9f6-4358-ae9f-de02dd4ec8b7/t85_design_spec.md (must exist)
5. Fidelity check: confirm D4 (variant="outline") appears in .omc/prompts/t85-codex.md before launching Codex
6. Launch-blocker check: confirm D8 is resolved before any Codex B launch

## Immediate Next Checkpoint

Re-show Stage 2 preview, but explicitly call out D8.

Recommended next action:
1. Patch `.omc/prompts/t85-codex-test.md` per D8.
2. Run `/Users/jwk/.claude/skills/execute-task/scripts/check-prompt-fences` on the patched Codex B prompt.
3. Ask user approval to launch Codex A only.
4. Launch Codex A.
5. After Codex A completes, inspect its diff for test changes.
6. Patch Codex B again if Codex A added T85 tests.
7. Ask user approval to launch Codex B sequentially.

Do NOT launch Codex A or Codex B before explicit user approval.
Do NOT launch Codex A and Codex B in parallel from the current prompt state.

## Audit Constraints

- docs/reviews/phase-18-skill-audit.md: do not duplicate A1–A25
- A25 is already recorded locally for the T85 Codex B prompt/parallel-launch blocker. This audit file is local-only/gitignored and must not be committed.
- Next finding is A26 if a new T85 deviation occurs
- Keep audit separate from implementation issues; do not delay implementation
