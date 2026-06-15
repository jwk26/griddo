# GridDO Phase 16 Batch 2 — Handoff

> Durable handoff file. Read this first, run the Resume Sanity Check, then resume.
> Created at the Batch 1→2 boundary via compaction-advisor (verdict: Handoff + Clear).

## Resume Point
Continue from execute-task **Step 2 (Read Context)** for Batch 2.
Before writing any provider prompt, read execute-task SKILL.md + PROMPT_TEMPLATES.md — do NOT reconstruct prompt structure from memory (caused a miss earlier this phase).
Batch 2 is **mixed** → Gemini design-spec first, then Codex; two-stage preview, both require explicit approval.

## Current State
- Branch: phase-16/quick-capture
- Base: origin/main @ 17a6e7a (PR #26, phase-15 close)
- Batch 1 complete (3 commits):
  - 4081d10 feat(quick-capture): add + entry surface and wire create dialogs (T73, T76)
  - 47e62b1 docs: compaction guide + CLAUDE.md pointer
  - 6cf5921 docs: mark T73, T76 [x]
- Plus this session (process docs, not Batch 1 code):
  - 0f1e375 docs: revise compaction-guide (file-default handoff, clear-vs-compact, summary-fidelity, auto-compact)
  - fb3f1df docs: mark Phase 16 Batch 1 complete in issue log
- T73/T76 = [x]; T74 = [ ] (Batch 2); T75 = [ ] (Batch 3)
- Source code changed: no (Batch 1 already committed). Working tree: untracked docs only (none are Batch 2 code) —
  - docs/reviews/phase-15-skill-audit.md (live audit)
  - docs/reviews/phase-16-skill-audit.md (live audit)
  - docs/Claude_Skill_Authoring_Best_Practices (reference for the compaction-advisor skill work; unrelated to Batch 2)

## Settled Decisions / Carryover
- Batch 1 EntrySurface exists; `onScratch` is a PLACEHOLDER (closes panel only via closeAll).
- Batch 2 connects `onScratch` to the real Scratch modal + capture flow (T74).
- T74 spec (EXECUTION_PLAN Task 74): centered one-line modal ("Capture your ideas..."); submit → Bit with parentId=Inbox Node id, icon "sparkles", x=0/y=0 sentinel (Hook 8 uniqueness-exempt), title=input; lightweight confirmation + a path to open the Inbox.
- G8 (prior decision): use-inbox.ts queries the Inbox Node via the DataStore abstraction (getAllActiveNodes + filter; no direct Dexie index exposure). Confirm the existing toArray+filter pattern before deciding whether to add getNodeBySystemRole.
- T74 Scratch behavior is SEPARATE from ISSUE-15-01.
- ISSUE-15-01 = Dexie v3 migration runtime verification; resolve via a fake-indexeddb real-Dexie migration test, tracked separately. Must resolve before Phase 16 close.
- Do NOT re-open Batch 1 design decisions unless a regression is found.

## Open Questions
- ISSUE-15-01 timing: resolve within Batch 2 or as a separate step? (separate concern — decide at Batch 2 scope lock, do not auto-fold into T74.)
- Inbox Node existence: does an 'inbox' systemRole Node already exist / get auto-created, and where? Verify before wiring Scratch parentId (use-inbox.ts).
- T74 has a behavioral acceptance (Scratch creates a Bit) → consider parallel test authoring (Codex B) if it qualifies as behavior-heavy.
- **Separate track — DONE (not Batch 2):** the `compaction-advisor` global skill is now INSTALLED at `~/.claude/skills/compaction-advisor/` (SKILL.md + reference/compaction-principles.md + reference/handoff-template.md), and WORKFLOW.md Skill Map is updated. `docs/compaction-guide.md` is kept as-is for now (stub conversion deferred until the skill is exercised a few times). The `.omc/handoffs/compaction-advisor-skill-draft.md` draft is now obsolete (the installed skill supersedes it).

## Authority Pointers
- docs/compaction-guide.md — handoff pattern (now revised: file-default, clear-vs-compact, fidelity check).
- execute-task SKILL.md + PROMPT_TEMPLATES.md — prompt structure (read before prompt-writing; do not rely on memory).
- docs/issues/Issues_Phase_16.md — Batch Plan + ISSUE-15-01 + ISSUE-16-01.
- docs/EXECUTION_PLAN.md Task 74 (lines ~99–108).
- docs/recipes/quick-capture-entry-surface-visual-recipe.md (Scratch Modal section).
- Batch 1 implementation to integrate against:
  - src/components/quick-capture/entry-surface.tsx
  - src/stores/quick-capture-store.ts (activeOverlay includes 'scratch')
  - src/components/layout/grid-runtime.tsx (onScratch wiring point)
- Read existing dialog + DataStore/createBit patterns before prompt-writing (create-bit-dialog.tsx, src/lib/db/datastore.ts, indexeddb.ts).

## Resume Sanity Check
External-state checks:
- `git status --short`  (expect 3 untracked docs: 2 audit + Claude_Skill_Authoring_Best_Practices; no Batch 2 code)
- `git log --oneline -6`  (verify compaction-guide revise commit atop 6cf5921 / 47e62b1 / 4081d10 / 17a6e7a)
- verify EXECUTION_PLAN: Task 73/76 Status [x], Task 74 Status [ ]
- verify the two audit docs are still untracked
- verify `onScratch` is still a placeholder (closeAll) in GridRuntime + EntrySurface

Summary-fidelity check (verify nothing conversation-only was lost):
- confirm the D2 (Level 3 Node row hidden, not disabled) and D3 (⌘K hint non-interactive) decisions are reflected in code/tests — these were user overrides of Gemini's recommendation.

## Immediate Next Checkpoint
Run execute-task Step 2 (read context) + Step 1 batch confirm for Batch 2, then prepare prompts.
Because Batch 2 is mixed: Gemini design-spec prompt → preview → approval → Gemini → Codex prompt → preview → approval.
STOP: do not launch Gemini/Codex or edit source before showing the prompt preview and getting explicit approval.

## Audit Constraints
- Do NOT duplicate A1–A8 / C1–C10 in phase-16-skill-audit.md.
- Add only genuinely new observations, briefly.
- Separate skill/process audit (skill-audit.md) from product issues (Issues_Phase_16.md).
