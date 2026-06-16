# GridDO Handoff — Phase 18 Batch 1 (T81) Pre-Launch

> Read this first, run the Resume Sanity Check, then resume.

## Resume Point

Continue from **execute-task Step 4, Stage 1 — show Gemini launch command for explicit approval.**

Do NOT pre-approve the Gemini launch. The user must approve the launch command in the resumed session before `omc ask gemini` is called. Read `.omc/prompts/t81-gemini.md` to re-present the Gemini prompt, then ask for approval.

After Gemini completes: embed spec into `.omc/prompts/t81-codex.md` (replacing `[GEMINI_SPEC_OUTPUT]`), show Stage 2 Codex prompt preview, wait for separate approval, then launch Codex.

## Current State

- handoff_status: superseded
- Superseded by: T81 complete — resume T82 from docs/EXECUTION_PLAN.md §Phase 18 → Task 82
- Supersedes: docs/handoffs/phase-18-kickoff-to-batch1.md
- Repo: /Users/jwk/Documents/griddo2-claude
- Branch: phase-18/inbox-triage-dnd
- Phase / Batch: Phase 18, Batch 1 (T81)
- Last verified commit: f0217eb docs(phase-18): record batch plan and start batch 1
- Source code changed: no
- Working tree: clean (all planning docs committed)
- Provider artifact: none yet (Gemini not launched)

## Settled Decisions

### T81 Scope (most critical — do not re-litigate)

T81 owns: zone structure + triage-store StagedCandidate shape + breakdown-panel de-emphasis.  
T82 owns: ALL drag wiring (DnD kinds in use-dnd.ts / grid-dnd.ts, onDrop handlers in triage/*).  
EXECUTION_PLAN.md T81 acceptance was amended accordingly (commit f6f5e5e). flow-review F1/F2 Owning Task updated to "T81 (zone + store + de-emphasis) / T82 (drag wiring)".

### triage-workspace.tsx IS modified in T81

The Codex prompt includes `triage-workspace.tsx` as a file to produce. The two Staging Placeholder divs (Node Zone + Bit Zone) are replaced with `<StagingZone>` components. The "do NOT modify triage-workspace.tsx" instruction from an earlier draft was wrong and is corrected.

### Hierarchy Explorer placeholder stays in T81

The Hierarchy Explorer `<Placeholder heading="HIERARCHY EXPLORER" />` at the bottom of `triage-workspace.tsx` is NOT replaced by T81. T83 replaces it. The `Placeholder` helper function must NOT be removed in T81 because Hierarchy Explorer still uses it.

### Gemini Prompt Structure (approved)

Prompt at `.omc/prompts/t81-gemini.md` (local-only, not git-tracked). Includes:
- Artifact-only guard at top AND bottom (verbatim: "Output design-specification text only. Do not edit files. Do not write to the working tree. Do not create components, hooks, tests, or code. Do not run builds, tests, or shell commands.")
- "Apply your locally installed `web-design-guidelines` skill"
- "Rate each recommendation: HIGH / MEDIUM / LOW priority"
- Token names only — no raw hex values
- Next.js 16.2.1 (not 15)
- Fence check: OK (0 fence lines, balanced)

### Codex Prompt Structure (approved template)

Prompt template at `.omc/prompts/t81-codex.md` (local-only, not git-tracked). `[GEMINI_SPEC_OUTPUT]` placeholder must be replaced with Gemini spec before showing Stage 2 preview.

Confirmed correct:
- 8 files in scope (staging-zone.tsx create, triage-workspace.tsx update, triage-store.ts update, breakdown-panel.tsx update, + 4 test files)
- Placeholder helper function: "Do not remove the Placeholder helper function in T81; the Hierarchy Explorer placeholder still uses it."
- Fence check: OK (22 fence lines, balanced)

### IC-4 StagedCandidate Shape (locked)

```ts
export interface StagedCandidate {
  id: string               // crypto.randomUUID() — local UUID, NOT a DB record
  type: "node" | "bit"
  sourceBreakdownId: string
  label: string
}
stagedCandidates: Record<string, StagedCandidate[]>  // keyed by scratchId
```

### Framework Version

Next.js 16.2.1, React 19.2.4. Both prompts reflect this.

### Batch Plan Artifact

`docs/issues/Issues_Phase_18.md` committed at f0217eb. Batch 1 is stamped `In Progress`.

## Open Questions

None. All 6 pre-launch issues raised by user review were resolved:

| # | Issue | Resolution |
|---|-------|------------|
| 1 | T81 DnD acceptance vs "T81 has no DnD" contradiction | T81 acceptance amended in EXECUTION_PLAN.md; scope split documented in flow-review |
| 2 | triage-workspace.tsx "do NOT modify" was wrong | Added to Codex file list; instruction corrected |
| 3 | Gemini artifact-only guard too weak | Strengthened top+bottom; web-design-guidelines + rating added |
| 4 | Next.js version wrong (15 vs 16.2.1) | Corrected in both prompts |
| 5 | Tests missing from Codex scope | 4 test files added with specific test cases |
| 6 | check-prompt-fences not run | Run on both files; both passed |

## Authority Pointers

- `/Users/jwk/.claude/skills/execute-task/SKILL.md` — Step 4 (prompt preview + launch) and Step 5 onward
- `/Users/jwk/.claude/skills/execute-task/PROMPT_TEMPLATES.md` — `omc ask` mechanics, launch markers, artifact finding
- `/Users/jwk/.claude/skills/execute-task/BATCH_PLAN_CONTRACT.md` — continuity engine, write points
- `docs/EXECUTION_PLAN.md § Phase 18` — T81–T85 task specs (T81 acceptance amended)
- `docs/reviews/phase-18-flow-review.md` — IC-2–IC-5 notes, F1/F2 ownership split
- `docs/issues/Issues_Phase_18.md` — batch plan artifact (Batch 1 In Progress)
- `.omc/prompts/t81-gemini.md` — approved Gemini design-spec prompt (local-only)
- `.omc/prompts/t81-codex.md` — approved Codex implementation prompt template (local-only)

## Resume Sanity Check

External-state:
- `git status --short` → expected: empty (clean working tree)
- `git log --oneline -3` → verify top commit is `f0217eb docs(phase-18): record batch plan and start batch 1` (or the handoff commit on top of it)
- `git rev-parse --abbrev-ref HEAD` → verify: `phase-18/inbox-triage-dnd`

File-state:
- `ls .omc/prompts/t81-gemini.md .omc/prompts/t81-codex.md` → both must exist
- `cat docs/issues/Issues_Phase_18.md | grep "Batch 1"` → must show `In Progress`

Summary-fidelity:
- Confirm Gemini launch is NOT pre-approved (next_action_approval: ready_for_approval)
- Confirm T81 scope: zone + store + de-emphasis only, no DnD wiring
- Confirm triage-workspace.tsx IS in Codex file list
- Confirm Hierarchy Explorer placeholder stays in T81

## Immediate Next Checkpoint

Re-present the Gemini prompt from `.omc/prompts/t81-gemini.md` and ask for Stage 1 launch approval.

Do not launch providers, edit source files, or run builds before explicit approval.

- next_action_approval: ready_for_approval

## Audit Constraints

- Phase 18 skill audit: `docs/reviews/phase-18-skill-audit.md` (local-only, gitignored)
- Current findings: A1 (execute-next-phase routing failure), A2 (branch created before planning gate)
- Next recording point: Batch 1 Step 4 (provider launch gate — record any workflow deviations during this launch sequence); any notable deviations during Gemini/Codex runs
- Dedup: do not re-record A1/A2; add only new Phase 18 observations
- Audit must NOT delay implementation
