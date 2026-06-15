# GridDO Phase 17 Batch 2 — Handoff

> Durable handoff file. Read this first, run the Resume Sanity Check, then resume.
> Created at the Batch 1→2 boundary via compaction-advisor (verdict: Handoff + Clear).

## Resume Point

Continue from `execute-task` **Step 2 (Read Context)** for Batch 2 (T79 only).
Before writing any provider prompt, read `execute-task` SKILL.md — do NOT reconstruct prompt structure from memory.
Batch 2 is **mixed** → Gemini Stage 1 design-spec first, then Codex Stage 2; two-stage preview, both require explicit approval before launch.

## Current State

- `handoff_status: current`
- Repo: `/Users/jwk/Documents/griddo2-claude`
- Branch: `phase-17/inbox-triage-shell`
- Base: `main`
- Last verified commits (verify latest with `git log`):
  - `07ba41b` docs(phase-17): add batch 2 handoff and record A10/C10 path-fidelity finding
  - `5a7ff71` docs(phase-17): record batch 1 follow-up workflow notes
  - `4dec7d2` feat(phase-17): add inbox routing and triage shell
- Source code changed: yes (Batch 1 — committed). Working tree: untracked docs only —
  - `docs/reviews/phase-15-skill-audit.md` (prior-phase carry-over; unrelated to Batch 2)
  - `docs/reviews/phase-16-skill-audit.md` (prior-phase carry-over; unrelated to Batch 2)

## Settled Decisions / Carryover

**T79 scope boundary (critical):**
- Batch 2 = T79 only (Scratch Pool). T80 (Breakdown Panel) is Batch 3 — separate checkpoint.
- T79 does NOT include Staging Zone, Breakdown Panel, or delete affordance — those are T80+.

**IC-4 — Relative time helper required for T79:**
- T79 row display format: `2h ago` / `yesterday` / `2 days ago` / `6 days ago` / `m/dd/yy`
- Must be a pure helper function (no side effects, no hooks). Suggested location: `src/lib/utils/` or Codex-justified co-location.
- Codex must implement this helper, not inline the logic in the component.

**Existing patterns (must use, do not reimplement):**
- `liveQuery` from `"dexie"` + `useEffect/useState` subscription cleanup — NOT `useLiveQuery` from `dexie-react-hooks` (package not installed).
- Note: `docs/reviews/phase-17-flow-review.md` may contain stale `useLiveQuery` references — the settled project pattern is `liveQuery` from `"dexie"`. Codex prompt must name the correct pattern explicitly.
- `systemNodes` and `scratchCount` are already exported from `src/hooks/use-inbox.ts` (Batch 1). T79 adds the active Scratch list (`activeScratchBits`) to the same hook — no new hook file.
- `TriageWorkspace` static shell already exists at `src/components/triage/triage-workspace.tsx`.

**Gemini Stage 1 no-write constraints (learned from Entry 4 / A6):**
- Gemini prompt MUST include at BOTH top and bottom: "Output design specification text only. Do not edit files. Do not write to working tree. Do not create components, hooks, tests, or code."
- After Gemini completes: run `git status --short` before reading the artifact. If any source files modified, STOP — do not launch Codex. Report to user and revert.

**Role boundary — A9/C9 (recorded in `docs/reviews/phase-17-skill-audit.md` Entry 6):**
- Post-Codex follow-up source/test fixes must be drafted as a scoped Codex prompt and shown for approval — never edited directly by Claude.
- Exception: user explicitly approves direct Claude edit ("fix it directly" or equivalent).
- This applies to Batch 2 and all subsequent batches.

## Open Questions

None.

## Authority Pointers

- `docs/EXECUTION_PLAN.md` § Task 79 — full spec, files, acceptance criteria
- `docs/issues/Issues_Phase_17.md` — live issue record (CI-1/CI-2 closed; Batch Plan: Batch 2 Pending)
- `docs/reviews/phase-17-skill-audit.md` — live audit (latest entries: A9/C9 Entry 6, A10/C10 Entry 7)
- `docs/reviews/phase-17-flow-review.md` — flow review already complete (no re-run needed for T79); note stale `useLiveQuery` wording — ignore it, use `liveQuery` from `"dexie"`
- `CLAUDE.md` — architecture rules (Client-first, Two-layer Data, Optimistic UI)

## Live Audit / Process Tracks

- File: `docs/reviews/phase-17-skill-audit.md`
- Role: live parallel audit track — not subordinate to implementation
- PR surface: untracked, not PR surface
- Next recording point: after Batch 2 checkpoint (post-Codex integration and verification)
- Dedup constraint: do not duplicate A1–A10 / P1–P9 / C8–C10; add only new Batch 2 observations

## Resume Sanity Check

External-state:
- `git status --short` — expected: only `docs/reviews/phase-15-skill-audit.md` and `docs/reviews/phase-16-skill-audit.md` untracked; nothing modified or staged
- `git log --oneline -3` — verify: `07ba41b` docs(phase-17) on top, `5a7ff71` below it, `4dec7d2` below that

Summary-fidelity:
- Confirm A9/C9 role-boundary rule survived: Claude must not edit source/test files directly post-Codex without explicit user approval
- Confirm T79 scope boundary survived: Batch 2 = T79 only; T80 is Batch 3
- Confirm IC-4 helper requirement survived: relative time helper (pure fn, `src/lib/utils/`) must be in Codex prompt
- Confirm `liveQuery` from `"dexie"` pattern (not `useLiveQuery`) survived

## Immediate Next Checkpoint

Run `execute-task` Step 2 (read context) for Batch 2, then build Gemini Stage 1 design-spec prompt from `docs/EXECUTION_PLAN.md` § Task 79. Show prompt for approval before launching Gemini.

STOP: do not launch Gemini/Codex or edit source before showing the prompt preview and getting explicit approval.

- `next_action_approval: ready_for_approval`
