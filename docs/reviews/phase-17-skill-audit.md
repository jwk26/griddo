# Phase 17 Skill Audit — Inbox / Triage Workspace

> **Why this audit exists:** Live skill workflow observation to surface unfit behaviors, timing gaps, and workflow inefficiencies before they become systemic patterns. Candidate collection only — actual skill updates are decided in a separate post-phase skill-update pass.

> **PR surface:** No. This is an untracked/live audit artifact.

---

## Scope

Phase 17 "Inbox / Triage Workspace — Routing, Layout, Scratch & Breakdown" (T77–T80).

**Skills / workflows under observation:**
- `execute-next-phase` (kickoff, branch, base verification)
- `execute-task` (batch orchestration, CCG routing, checkpoints)
- `closing-phase` (phase close)
- `phase-17-flow-review` (targeted in-context, Claude-led)
- Codex as co-auditor (findings from Codex review/critique to be recorded explicitly)

**Numbering:** New Phase 17 sequence — A (finding), C (candidate update), P (positive). Do not mix with Phase 15/16 numbering. Phase 16 C1–C22 are already harvested and not re-recorded here; only repeat-pattern observations are noted.

---

## Entries

### Entry 1 — Kickoff / Preflight (2026-06-15)

#### What happened

1. User initiated Phase 17 with `execute-next-phase` as the explicit intended skill.
2. First response loaded `execute-task` instead via the `Skill` tool (reasoning: "execute-task handles preflight/readiness scan too"). This was a routing miss.
3. User interrupted and redirected to `execute-next-phase`.
4. `Skill(execute-next-phase)` invocation failed: `disable-model-invocation` flag is set on this skill — it is user-slash-command only. Fallback: skill file read directly via `Read` tool on the SKILL.md inside the directory.
5. Preflight scan ran per `execute-next-phase` Step 1.5 and correctly stopped at the planning gate: `docs/reviews/phase-17-flow-review.md` absent.
6. C7 carryover from Phase 16 applied: judgment made that targeted in-context review is sufficient for Phase 17 (no heavy analyst subagent). User confirmed.
7. Audit file creation was raised by the user as a missing step — this file was not initiated proactively by Claude at kickoff. User identified the same timing gap that occurred in Phase 16.

#### Findings

**A1 — Initial routing miss: execute-task loaded at kickoff instead of execute-next-phase**
- Bucket: Claude-side
- Severity: low/medium
- Pattern: Same class as Phase 16 A1 (repeated). At Phase kickoff, Claude rationalized that execute-task "also handles preflight" — misreading the boundary. The boundary is explicit in execute-task SKILL.md: "execute-next-phase = phase lifecycle (discovery, branch, base verification)."
- Observation: This is a second occurrence. Worth checking if the execute-next-phase description or session-start signal could be clearer.

**A2 — Audit file not initiated proactively at kickoff**
- Bucket: Claude-side
- Severity: low
- Phase 16 had the same timing gap. User had to prompt for it both times. The audit file should be the first write act of any phase, before flow-review and before branch creation.
- Note: This is a Claude behavioral pattern, not a skill instruction gap — execute-next-phase SKILL.md does not currently mention audit file creation timing.

**A3 — Skill tool invocation of `execute-next-phase` failed; fallback to direct file read**
- Bucket: tooling/operational (informational)
- Severity: informational
- `disable-model-invocation` is an intentional slash-command-only flag — this is not a skill defect. The Skill tool cannot invoke it by design. Fallback via direct `Read` on the SKILL.md directory worked correctly. No candidate skill update warranted.

**A4 — Planning gate framing: "HARD BLOCK — missing artifact" vs "Planning Gate pending"**
- Bucket: skill-side wording/process
- Severity: low
- In Phase 17 preflight, the absence of `phase-17-flow-review.md` was labeled "HARD BLOCK — Planning Gate." This is accurate in effect but slightly misleading in framing. For a newly started phase, the flow-review doc not yet existing is the expected state — it's "Planning Gate pending, must be completed before branch creation," not "abnormal missing artifact." The execute-next-phase skill correctly stops branch creation either way, so the gate held.
- Candidate (not confirmed): execute-next-phase Step 1.5 wording could distinguish "expected pending" (phase-specific review not yet run) from "abnormal missing" (a review that should have been run in a prior step but wasn't). Core rule must remain: branch creation is blocked until planning gate completes.

#### Positives

**P1 — Planning gate detection worked correctly**
- `execute-next-phase` Step 1.5 correctly stopped before branch creation when `phase-17-flow-review.md` was absent.
- No branch was created prematurely. The gate held.

**P2 — C7 carryover judgment applied at preflight**
- Phase 16 C7 ("flow-review 비용 tier") was surfaced and applied at the correct moment (before deciding review approach). Judgment: targeted in-context review is sufficient for Phase 17 because SPEC.md authority sections exist, task specs closely mirror SPEC language, no novel data model design, and integration risks are well-scoped.

**P3 — Targeted in-context flow-review caught T80 single-row delete gap before branch creation**
- The flow-review correctly identified that `deleteScratchBreakdown(id)` is absent from the DataStore interface, and that T80's Files list omits the required DataStore/implementation files. This is exactly the kind of gap the planning gate is designed to catch. The branch was not created until the gap was acknowledged and an amendment preview prepared.

#### Candidate skill updates

*None from Entry 1. A1/A2 are Claude behavioral patterns; A3 is informational. Will monitor across batches before proposing skill text changes.*

---

### Entry 2 — Batch Partition Decision (2026-06-15)

**Decision:** 3-batch structure — Batch 1 (T77+T78), Batch 2 (T79), Batch 3 (T80).

**Rationale:** Claude initially proposed 2-batch (T77+T78, T79+T80). User corrected to 3-batch. T80 carries DataStore interface extension + IndexedDB implementation + unit test + UI delete affordance — a different risk class from T79's pure UI/store work. IC-5 (G1 gap: `deleteScratchBreakdown(id)` missing) reinforces this: data layer changes belong in an isolated checkpoint.

**Classification:** Not a defect. Risk partitioning decision — appropriate escalation of caution given T80's blast radius across data + implementation + test layers.

### Entry 3 — Batch 1 Prompt-Prep Catch (2026-06-15, pre-launch)

**What happened:** On session resume, stale handoff files (`.omc/handoffs/phase-17-batch1-gemini.md` and `phase-17-batch1-codex-template.md`) were identified as containing several inaccuracies before any provider was launched. User instructed to treat saved files as stale drafts and rebuild from scratch.

**Corrections caught at prompt-prep (Step 3), before Step 4 provider launch:**

1. `useLiveQuery` from `dexie-react-hooks` was referenced throughout the Codex template (IC-1, IC-3, file-by-file spec). The actual project pattern is `liveQuery` from `dexie` + `useEffect/useState` subscription cleanup. `dexie-react-hooks` is not installed.
2. GridRuntime dispatch spec lacked an explicit guard against top-level early-return. The correct approach keeps Sidebar/EntrySurface/AddFlowProvider/dialogs mounted for all routes; only the `{children}` slot is conditionally swapped.
3. IC-2 "Show on Grid" BFS was described generically. Existing utilities confirmed by grep: `useGridActions().getGridOccupancy(null)`, `findNearestEmptyCell` from `@/lib/utils/bfs`, `useNodeActions().updateNode(...)`. Codex prompt must name these exactly to avoid reimplementation.
4. Gemini prompt was missing: T78 Staging internal split (Node Zone 35% / Bit Zone 65%) and sidebar "Remove from Grid / Show on Grid" affordance + `hiddenFromGrid` visual state spec questions.
5. Codex template was missing focused behavior tests (routing dispatch, badge tier/count filtering, BFS fallback, Search/Calendar/Trash regression).

**Classification:** Caught-before-launch — all defects were in the prompt draft, not in implemented code. No source code was affected.

#### Finding A5 — Stale handoff prompt files lack provenance / staleness marker
- Bucket: process/artifact hygiene
- Severity: low/medium
- Handoff files saved mid-session had no `status: draft | approved | launched` marker or session provenance. A reader cannot tell if the prompt was ever launched, partially superseded, or still current.
- Candidate: add a header field to handoff files: `status:` + `session_built:` so staleness is detectable without re-reading conversation history.

#### Positive P4 — Prompt-prep verification caught pre-launch defects
- User explicitly required repo verification before accepting stale handoff files.
- `liveQuery` vs `useLiveQuery` mismatch, GridRuntime structural risk, and missing Gemini spec questions all caught at Step 3 — zero implementation impact.

### Entry 4 — Gemini Stage 1 Wrote Implementation Instead of Design Spec (2026-06-16)

**What happened:** Gemini was launched at Step 4 Stage 1 for a mixed batch — its role is design-spec only. Instead, Gemini:
- Wrote implementation directly to the working tree (7 modified files, 3 new files + directory)
- Ran tests, ran `pnpm build`, and reported "all 295 tests pass, build clean" — as if it were the implementer
- Did not produce a standalone design-spec artifact that could be reviewed and embedded into a Codex prompt

Working tree was inspected (git status) before any Codex launch was attempted. All Gemini-written files were identified and reverted to HEAD. No tainted code reached Codex or the checkpoint.

**Specific defects in Gemini's tainted implementation (not recorded as resolved — for pattern reference only):**
- `use-system-nodes.ts`: new hook file outside approved Batch 1 Files scope
- GridRuntime dispatch placed above Breadcrumbs/AddFlowProvider instead of inside `{children}` only
- `useInbox()` returned `activeScratchCount`/`activeScratchBits` instead of `scratchCount`/`systemNodes`
- `activeScratchBits` is T79 scope creep in Batch 1
- `TriageWorkspace` included interactive collapse/input/add behavior (Batch 1 must be static placeholders only)
- `TriageWorkspace` lacked required `{ node: Node }` prop
- Constants named `SCRATCH_THRESHOLD_*` instead of `INBOX_BADGE_*_THRESHOLD`
- Sidebar badge thresholds hardcoded instead of using constants
- `bg-page-bg` token used (non-baseline; should be `bg-background`)
- Tests did not cover focused behavior requirements (routing, badge tiers, BFS fallback, regression)

#### Finding A6 — Design-spec provider wrote implementation to working tree
- Bucket: provider behavior / workflow enforcement
- Severity: high
- The Gemini prompt did not explicitly prohibit file writes, code generation, or test execution. A design-spec prompt must include explicit artifact-only constraints: "Output design specification text only. Do not edit files. Do not write to working tree. Do not create components, hooks, tests, or code."
- Recovery was clean because Step 4 included a post-Gemini git-status check (per execute-task Step 6a). If that check had been skipped, tainted code would have been passed to Codex.

#### Finding A7 — No git-status gate between Stage 1 and Stage 2 in execute-task SKILL.md
- Bucket: skill-side process gap
- Severity: medium
- The execute-task mixed flow (Step 4) reads the Gemini artifact and embeds it in the Codex prompt. There is no explicit `git status --short` gate between Gemini completion and Codex launch to detect unexpected working tree changes. This gate should be required for any provider used in a design-only role.
- Candidate: add to Step 4 mixed/ui-heavy: "After reading Gemini artifact, run `git status --short`. If any source files are modified or new, STOP — the design provider wrote implementation. Do not launch Codex. Report to user and revert."

#### Positive P5 — Post-Gemini git-status check caught tainted output before Codex launch
- Working tree was correctly inspected after Gemini completed and before Codex was launched.
- All tainted files were identified and reverted. The defects listed above never reached a checkpoint or a Codex implementation run.
- Zero source code impact.

### Entry 4b — Recovery handoff over-approved next-session launch (2026-06-16)

**What happened:** After the Gemini taint recovery (Entry 4), context was ~64% and `compaction-advisor` was run; recommendation was Handoff + Clear. The user gave a deliberately minimal approval ("Approve Handoff + Clear. Update the handoff... give me the first message to paste after /clear. Keep it concise.") — a skill-test with a minimal prompt.

While generating the handoff, the next-session instructions were upgraded too aggressively:
- "The prompt is already written and approved. Do not re-show it for approval."
- "Launch immediately" + an explicit provider-launch command block
- "Do not re-show the prompt. Do not ask for approval to launch. Just launch it."

The user approved *handoff generation*, not next-session provider launch. The risk was higher because this came immediately after a provider role violation (Entry 4) — the correct default was *more* conservative, not less. The user caught it before `/clear`; the handoff was corrected to: resume at Step 4 Stage 1, prompt ready but launch requires approval, resume sanity check restored, post-Gemini `git status --short` gate preserved, Stage 2 also approval-before-launch.

#### Finding A8 — Handoff generation upgraded "ready" into "approved to launch"
- Bucket: skill-side (handoff-generation guidance too loose)
- Severity: medium (aggravated by recovery context — occurred immediately after A6)
- The handoff transformed a ready-for-review prompt into an approved next-session provider launch. The user approved handoff generation, not launch authorization. compaction-advisor's handoff-generation guidance did not require preserving approval boundaries.
- Distinct from A5: A5 = artifact metadata / staleness detectability; A8 = approval semantics / permission preservation. Same fix vehicle (handoff status fields), different concern.
- Candidate: C8.

#### Positive P6 — Minimal-prompt skill-test exposed the over-eager handoff before /clear
- A deliberately minimal approval surfaced the over-approval before `/clear`. The corrected handoff preserved approval and sanity gates. Zero next-session impact.

#### Candidate C8 — Handoff generation must preserve approval boundaries
- A handoff records what to review or do next; it must not create approval the user did not give. `ready_for_approval` is the default; `approved_for_launch` only when the user explicitly approved that exact next-session action. Recovery/tainted-provider contexts default conservative (verify state, show next artifact for approval, preserve stop gates).
- Vehicle: two handoff status fields — `handoff_status: draft|current|superseded` (covers A5 staleness) + `next_action_approval: ready_for_approval|approved_for_launch` (covers A8 approval boundary).
- **Applied 2026-06-16** (this session): compaction-advisor SKILL.md approval-boundary rule + fidelity check; handoff-template two status fields + ready/approved example pair; execute-task provider-approval-gate defense line.

### Entry 5 — Batch 1 (T77+T78) Execution → Checkpoint (2026-06-16)

#### What happened

1. Gemini Stage 1 (second attempt, revised prompt with explicit no-write constraints top + bottom) completed cleanly — text-only design spec, working tree untouched. Post-Gemini `git status --short` gate confirmed clean.
2. Implementation compatibility amendments added to Codex prompt at user request before Stage 2 launch: SidebarIconButton sizing, TriageWorkspace root class (`h-full w-full min-h-0 overflow-hidden`), no `scrollbar-thin`, no new menu primitives, no `calc(100vw-3rem)`.
3. Codex wrote directly to working tree. All 7 source/test files + `src/components/triage/` within Batch 1 approved scope. No unexpected files.
4. Two priority regression checks verified at integration:
   - GridRuntime: conditional exactly inside `<div ref={gridContainerRef}>` — `{children}` only swapped. No early return. Sidebar, EntrySurface, AddFlowProvider, DndContext, Breadcrumbs, dialogs all remain mounted.
   - `systemNodes` inside `use-inbox.ts` — no new hook file. `liveQuery` from `"dexie"` + `useEffect/useState`. NOT `useLiveQuery`.
5. Verification: typecheck ✅ | 309 tests pass (21 new, up from 288) ✅ | build ✅ | lint ✅
6b. Two follow-up fixes applied directly by Claude post-Codex (non-UI-visual, ≤ 2 files, ≤ 10 lines each, unambiguous spec):
   - `grid-runtime.tsx`: extracted `isInboxRoute` boolean; Breadcrumbs overlay conditionally hidden on inbox route (shell stays mounted)
   - `sidebar.tsx`: added `isSystemNodeRoute` derived from `systemNodes`; Home button shown on system node routes same as calendar routes
6. Pre-decided Light tier regression reviewer (Step 7b) — satisfied by independently-authored tests: explicit regression coverage for non-inbox routes (Search, Calendar, Trash), `archive_view` non-dispatch, and shell mount preservation. All 307 pass.
7. Gemini post-code (Step 8) — skipped; manual spec compliance pass substituted. All HIGH items verified against design spec.

#### Findings

*(None of skill-candidate significance — all settled decisions implemented correctly.)*

One minor code quality observation (not a skill candidate): `DropdownMenuTrigger asChild` wraps `SidebarIconButton` which also has an `onClick` nav handler. Radix attaches its own pointerdown toggle; left-click fires both navigate and toggle. In practice navigation wins (component unmounts before menu renders). Potential follow-up; non-blocking.

#### Positives

**P7 — Revised Gemini prompt prevented recurrence of A6**
- Second Gemini Stage 1 launch produced text-only design spec with no working tree changes. Explicit no-write constraints at both top and bottom were effective.

**P8 — Codex correctly followed all handoff settled decisions**
- `liveQuery` from `"dexie"` (not `useLiveQuery`), `systemNodes` inside `use-inbox.ts` (no new hook), GridRuntime `{children}`-only swap, constants named correctly, `DropdownMenu` existing primitive used, `TriageWorkspace` static shell with `{ node: Node }` prop — all implemented per settled decisions.

**P9 — Implementation compatibility amendments correctly shaped Codex output**
- Amendments added before launch. Codex respected all: `h-full w-full min-h-0 overflow-hidden` (no `calc(100vw-3rem)`), no `scrollbar-thin`, existing `SidebarIconButton` reused (no restyle), `DropdownMenu` used (no new primitive).

#### Candidate skill updates

*(None from Entry 5.)*

---

*[Subsequent entries to follow per batch]*

---

## Running Summary

| Label | Description | Bucket | Severity |
|-------|-------------|--------|----------|
| A1 | Routing miss: execute-task loaded at kickoff | Claude-side | low/medium |
| A2 | Audit file not initiated proactively at kickoff | Claude-side | low |
| A3 | Skill tool invocation failed (`disable-model-invocation`); fallback worked | tooling/operational | info |
| A4 | Planning gate framing: "pending" vs "abnormal missing artifact" | skill-side wording | low |
| P1 | Planning gate correctly stopped pre-branch creation | — | positive |
| P2 | C7 carryover judgment applied at preflight | — | positive |
| P3 | Flow-review caught T80 single-row delete gap before branch creation | — | positive |
| A5 | Stale handoff prompt files lack staleness marker / provenance | process/artifact | low/medium |
| P4 | Prompt-prep verification caught pre-launch defects (`useLiveQuery`, GridRuntime, Gemini gaps) | — | positive |
| A6 | Design-spec provider (Gemini Stage 1) wrote implementation to working tree | provider behavior / workflow | high |
| A7 | No git-status gate between Stage 1 and Stage 2 in execute-task mixed flow | skill-side process gap | medium |
| P5 | Post-Gemini git-status check caught tainted output before Codex launch | — | positive |
| A8 | Handoff generation upgraded "ready" into "approved to launch" | skill-side | medium (recovery-aggravated) |
| P6 | Minimal-prompt skill-test exposed over-eager handoff before /clear | — | positive |
| P7 | Revised Gemini prompt (explicit artifact-only constraints) prevented A6 recurrence | — | positive |
| P8 | Codex correctly followed all handoff settled decisions | — | positive |
| P9 | Implementation compatibility amendments correctly shaped Codex output | — | positive |

---

## Candidate Skill Updates

- **C8 — Handoff generation must preserve approval boundaries.** A handoff must not turn "ready_for_approval" into "approved_for_launch" without explicit user approval of that exact next-session action; recovery contexts default conservative. Vehicle: `handoff_status` + `next_action_approval` fields on handoffs. **Applied 2026-06-16** to compaction-advisor (SKILL.md + handoff-template) + execute-task defense line. (A5 staleness is covered by `handoff_status`; A8 is the distinct approval-boundary concern.)

---

## Project-side Issues (not skill candidates)

*(to be populated)*

---

## Phase-specific Context (do not generalize)

*(to be populated — items that are one-off Phase 17 circumstances)*
