# GridDO Handoff — Phase 18 Kickoff → Batch 1

> Read this first, run the Resume Sanity Check, then resume.

## Resume Point

Continue from **execute-task Step 1 — batch proposal approval**. Present the 5-batch proposal to the user and get explicit approval before entering Batch 1 Step 2. Do not assume prior verbal review constitutes approval. Read `docs/reviews/phase-18-flow-review.md` and `docs/EXECUTION_PLAN.md § Phase 18` before proceeding.

Do not rely on memory for IC notes, DnD ownership boundaries, or DataStore API gaps — all are in the flow-review.

## Current State

- handoff_status: current
- Repo: /Users/jwk/Documents/griddo2-claude
- Branch: phase-18/inbox-triage-dnd
- Base: main (origin/main @ 330cf87)
- Last verified commits (verify with `git log` — this handoff is committed on top of a202be7):
  - [handoff commit] docs(phase-18): add kickoff-to-batch1 handoff
  - a202be7 docs(phase-18): add flow-review and amend T83 consumedAt API
  - 330cf87 chore: make skill-audit files local-only (.gitignore + untrack)
- Source code changed: no
- Working tree (untracked/uncommitted): clean

## Settled Decisions / Carryover

- **execute-next-phase routing (A1):** The Skill tool invocation for `execute-next-phase` loaded `execute-task` instead. The correct fallback is to read `/Users/jwk/.claude/skills/execute-next-phase/SKILL.md` directly. The skill exists at that path.
- **Phase 18 planning gate recovered:** `docs/reviews/phase-18-flow-review.md` was missing at branch creation. The branch was created before the gate was satisfied (A2 audit finding). Both findings are recorded in the local audit file (see Live Audit track below). Gate was retroactively satisfied before any implementation.
- **G1 resolved:** `consumedAt` write gap in DataStore was found during flow-review. Resolved by T83 plan amendment — `consumeScratchBreakdown(id: string): Promise<void>` added to T83 Files (`datastore.ts`, `indexeddb.ts`, `scratch-breakdowns.test.ts`). Actions and Acceptance updated. Committed in `a202be7`.
- **IC-2 (T83 prompt note):** "Reuse create-node/bit-dialog" means calling `createNode`/`createBit` DataStore APIs on confirm — NOT rendering the create dialogs again. The placement confirmation dialog is purpose-built (uses `dialog.tsx` structure + move-confirmation pattern). Must be stated explicitly in Batch 3 Codex prompt.
- **IC-3 (T85 prompt note):** `DeleteDropTarget` in `sidebar.tsx` is private (not exported). T85 must either (A) extract it to a shared component or (B) create a Triage-specific remove target with a new DnD kind. Codex decides; flag in Batch 5 prompt.
- **IC-4 (T81 prompt note):** triage-store staged candidates must track `sourceBreakdownId` to enable breakdown-panel de-emphasis. Suggested shape: `{ id: string, type: "node" | "bit", sourceBreakdownId: string, label: string }`. Flag in Batch 1 prompt.
- **IC-5 (T85 prompt note):** Archive Scratch condition is cross-store (`scratchBreakdowns.consumedAt` + triage-store staged candidates). Needs a derived hook, e.g. `useCanArchiveScratch(scratchId)`. Flag in Batch 5 prompt.
- **Preflight gate passed:** `pnpm test` (343 passed, 65 files) and `pnpm build` (exit 0) verified clean on `a202be7` before any implementation.

## Open Questions

- **5-batch proposal: PENDING USER APPROVAL.** The proposal was reviewed but not explicitly approved. Next session must present it and get approval before Batch 1 Step 2.

  Proposed batches:
  | Batch | Tasks | Key Outputs | IC Notes |
  |-------|-------|-------------|----------|
  | 1 | T81 | `staging-zone.tsx` (create), `triage-store.ts` (staged candidates + `sourceBreakdownId`) | IC-4 |
  | 2 | T82 | compact drag token, Triage DnD kinds in `use-dnd.ts` / `grid-dnd.ts` | — |
  | 3 | T83 | `hierarchy-explorer.tsx` (create), placement dialog, `consumeScratchBreakdown` + test | IC-2 |
  | 4 | T84 | fast path (breakdown row → hierarchy), explicit type-choice dialog | — |
  | 5 | T85 | remove-from-staging drop target, Archive Scratch, cross-store condition | IC-3, IC-5 |

  Rationale for T84/T85 split: T85 carries IC-3 (DeleteDropTarget architecture decision) and IC-5 (cross-store condition). DnD phase blast radius justifies smaller batches.

## Authority Pointers

- `docs/EXECUTION_PLAN.md § Phase 18` — T81–T85 task specs (T83 amended, `consumeScratchBreakdown` in Files)
- `docs/reviews/phase-18-flow-review.md` — 17 flows traced, G1 resolved, IC-2–IC-5 noted
- `/Users/jwk/.claude/skills/execute-task/SKILL.md` — batch execution workflow
- `/Users/jwk/.claude/skills/execute-next-phase/SKILL.md` — phase kickoff workflow (for reference)
- `BATCH_PLAN_CONTRACT.md` (in execute-task skill dir) — continuity engine; Issues_Phase_18.md does NOT exist yet; it is created at Step 4 of Batch 1

## Live Audit / Process Tracks

- File: `docs/reviews/phase-18-skill-audit.md`
- Role: live parallel observation track — Phase 18 only; not subordinate to implementation; records skill/workflow behavior for post-phase skill-update review
- PR surface: untracked, not PR surface (gitignored via `docs/reviews/phase-*-skill-audit.md`)
- Current findings: A1 (execute-next-phase routing failure), A2 (branch created before planning gate)
- Next recording point: Batch 1 Step 4 (provider launch gate), any notable workflow deviations
- Dedup constraint: do not duplicate A1/A2; add only new Phase 18 observations; no Phase 15/16/17 items unless recurrence

## Resume Sanity Check

External-state:
- `git status --short` → expected: (empty — clean working tree)
- `git log --oneline -3` → verify: `a202be7` at top (docs(phase-18): add flow-review and amend T83 consumedAt API)
- `git rev-parse --abbrev-ref HEAD` → verify: `phase-18/inbox-triage-dnd`

Summary-fidelity:
- Confirm IC-2 / IC-3 / IC-4 / IC-5 prompt notes survived (verbatim in Settled Decisions above)
- Confirm 5-batch proposal is marked PENDING USER APPROVAL (not pre-approved)
- Confirm audit file exists at `docs/reviews/phase-18-skill-audit.md` and is gitignored

## Immediate Next Checkpoint

Present the 5-batch proposal to the user for explicit approval. After approval, announce Batch 1 entry and proceed to execute-task Step 2 (context read for T81). Stop for user approval before any provider launch (Step 4).

- next_action_approval: ready_for_approval
