# GridDO Phase 17 Batch 2 — Handoff

> Durable handoff file. Read this first, run the Resume Sanity Check, then resume.
> Updated at the Gemini Stage 1 → Codex Stage 2 boundary (context compaction).

## Resume Point

Continue from `execute-task` **Step 4 Stage 2** — launch Codex with the saved prompt.

- Gemini Stage 1 is **complete**. Design spec is clean (working tree was verified post-Gemini).
- Codex Stage 2 prompt is **approved and saved** at `.omc/prompts/batch2-t79-codex.md`.
- Before launching Codex, read `execute-task` SKILL.md Step 4 for launch mechanics.
- Do NOT reconstruct or rewrite the Codex prompt — use the saved file exactly.
- **Approval condition:** `next_action_approval: approved_for_launch` applies only to
  the exact content of `.omc/prompts/batch2-t79-codex.md`. If the file is missing,
  modified, or rewritten for any reason, approval is void — show a new preview and
  get explicit approval before launching.

## Current State

- `handoff_status: current`
- Repo: `/Users/jwk/Documents/griddo2-claude`
- Branch: `phase-17/inbox-triage-shell`
- Base: `main`
- Source code changed: yes (Batch 1 — committed). Working tree: untracked docs only.
  - `docs/reviews/phase-15-skill-audit.md` (prior-phase carry-over; unrelated to Batch 2)
  - `docs/reviews/phase-16-skill-audit.md` (prior-phase carry-over; unrelated to Batch 2)
- Provider artifacts:
  - Gemini design spec: `.omc/artifacts/ask/gemini-output-design-specification-text-only-do-not-edit-files-do-n-2026-06-15T20-25-36-988Z.md`
  - Codex prompt (approved): `.omc/prompts/batch2-t79-codex.md`

## Settled Decisions / Carryover

**T79 scope boundary (critical):**
- Batch 2 = T79 only (Scratch Pool). T80 (Breakdown Panel) is Batch 3 — separate checkpoint.
- T79 does NOT include Staging Zone, Breakdown Panel, or delete affordance — those are T80+.

**IC-4 — Relative time helper required for T79:**
- T79 row display format: `2h ago` / `yesterday` / `2 days ago` / `6 days ago` / `m/dd/yy`
- Must be a pure helper function (no side effects, no hooks). Location: `src/lib/utils/relative-time.ts`.
- Codex must implement this helper; it is specified in the approved Codex prompt.

**Existing patterns (must use, do not reimplement):**
- `liveQuery` from `"dexie"` + `useEffect/useState` subscription cleanup — NOT `useLiveQuery` from `dexie-react-hooks` (package not installed).
- `systemNodes` and `scratchCount` are already exported from `src/hooks/use-inbox.ts` (Batch 1). T79 adds `activeScratchBits` to the same hook — no new hook file.
- `TriageWorkspace` static shell already exists at `src/components/triage/triage-workspace.tsx`.

**Gemini Stage 1 no-write constraints (learned from Entry 4 / A6):**
- Gemini ran cleanly (text-only spec, working tree untouched). Gate passed.
- Post-Codex: run `git status --short` immediately. If any source files outside approved scope are modified, STOP — report to user before integration.

**Post-Codex integration requirements (A9/C9 role boundary):**
- After Codex completes: run `git status --short`, review diff of all changed files, verify focused tests, run full verification gate (`pnpm test && pnpm build`).
- If source/test follow-up fixes are needed: draft a scoped Codex prompt and show for approval. Claude must NOT edit source or test files directly unless the user explicitly approves ("fix it directly" or equivalent).
- Exception: user explicitly approves direct Claude edit.

**bg-accent confirmed:** `bg-accent` is defined in `src/app/globals.css`. Use directly — no fallback needed.

## Open Questions

None.

## Authority Pointers

- `docs/EXECUTION_PLAN.md` § Task 79 — full spec, files, acceptance criteria
- `docs/issues/Issues_Phase_17.md` — live issue record (Batch 2: In Progress)
- `docs/reviews/phase-17-skill-audit.md` — live audit (latest: Entry 8 / A11, A12, P10)
- `docs/reviews/phase-17-flow-review.md` — flow review complete; note stale `useLiveQuery` wording — ignore it, use `liveQuery` from `"dexie"`
- `CLAUDE.md` — architecture rules (Client-first, Two-layer Data, Optimistic UI)
- `.omc/prompts/batch2-t79-codex.md` — approved Codex Stage 2 prompt (do not modify)
- `.omc/prompts/batch2-t79-gemini.md` — Gemini Stage 1 prompt (reference only)

## Live Audit / Process Tracks

- File: `docs/reviews/phase-17-skill-audit.md`
- Role: live parallel audit track — not subordinate to implementation
- PR surface: untracked, not PR surface
- Next recording point: after Batch 2 checkpoint (post-Codex integration and verification)
- Dedup constraint: do not duplicate A1–A12 / P1–P10 / C8–C10; add only new Batch 2 observations

## Resume Sanity Check

External-state:
- `git status --short` — expected: only `docs/reviews/phase-15-skill-audit.md` and `docs/reviews/phase-16-skill-audit.md` untracked; nothing modified or staged
- `git log --oneline -5` — verify latest commits include the Batch 2 handoff/docs commits above the Batch 1 source commit (`4dec7d2 feat(phase-17): add inbox routing and triage shell`)
- Verify Codex prompt file exists: `test -f .omc/prompts/batch2-t79-codex.md && echo "OK"`
- Verify Gemini artifact exists: `test -f ".omc/artifacts/ask/gemini-output-design-specification-text-only-do-not-edit-files-do-n-2026-06-15T20-25-36-988Z.md" && echo "OK"`

Summary-fidelity:
- Confirm A9/C9 role-boundary rule survived: Claude must not edit source/test files directly post-Codex without explicit user approval
- Confirm T79 scope boundary survived: Batch 2 = T79 only; T80 is Batch 3
- Confirm IC-4 helper requirement survived: relative time helper (pure fn, `src/lib/utils/relative-time.ts`) is in the saved Codex prompt
- Confirm `liveQuery` from `"dexie"` pattern (not `useLiveQuery`) survived
- Confirm `next_action_approval: approved_for_launch` is conditional on `.omc/prompts/batch2-t79-codex.md` being unmodified

## Immediate Next Checkpoint

1. Verify resume sanity check above passes.
2. Touch codex launch marker: `touch .omc/tmp/codex-launch-marker`
3. Launch Codex: `omc ask codex --prompt "$(cat .omc/prompts/batch2-t79-codex.md)"` (background)
4. On completion: `git status --short` first. Review diff. Run focused tests. Run full gate: `pnpm test && pnpm build`.
5. Proceed to Step 5 (question handling), Step 6 (integrate + refine), Step 7 (verify), Step 9 (issue doc update), Step 10 (commit), Step 11 (checkpoint).

STOP: do not modify `.omc/prompts/batch2-t79-codex.md`. Do not launch Gemini/Codex again before the sanity check. Do not edit source/test files directly.

- `next_action_approval: approved_for_launch`
