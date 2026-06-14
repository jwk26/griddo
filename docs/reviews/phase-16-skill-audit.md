# Phase 16 Skill Audit — Workflow Dry-Run #2 (Live)

**Started:** 2026-06-10
**Auditors:** Claude (self-audit, live this session) + Codex (co-audit)
**Subject:** The full implementation skill chain as exercised in Phase 16 — `execute-next-phase → execute-task → closing-phase`, plus provider routing (Codex/Gemini), checkpoint / issue-log / canonical-reconciliation, and the planning / readiness / verification gates. Phase 16 is the first **UI** phase audited end-to-end (Phase 15 was data-layer).
**Relationship to implementation:** **Parallel and co-equal.** This audit must never gate, delay, or dilute Phase 16 implementation; implementation must never be an excuse to skip an audit entry. Neither track is subordinate.
**Status:** Live (open).

---

## Why this audit exists

Phase 15 audited the skill chain on a *data-layer* phase. Phase 16 is the first *user-facing UI* phase to run the same chain end-to-end, following a short post-Phase-15 skill reinforcement. The question is not "do the skills work" (assumed) but:

- **Did each skill keep its own responsibility boundary?** (`execute-next-phase` = lifecycle only; `execute-task` = plan/impl/verify/checkpoint; `closing-phase` = phase close only.)
- **Was the handoff between skills clean?**
- **Was anything heavy, duplicated, or over-gated?** (repeated reads / reviews / checkpoints)
- **Did the safety gates catch real risk — and did any gate over-block?**
- **Was Codex/Gemini usage appropriate?**
- **Did the Phase-15 reinforcements actually help?**

This is candidate-collection, not change-confirmation. Every finding is later triaged `adopt / adapt / reject / already-exists` at the next skill-update session. **An audit entry is not a committed skill change.**

## Scope (skills / workflow observed)

`execute-next-phase` · `execute-task` · `closing-phase` · provider routing (Codex / Gemini orchestration) · checkpoint / issue-log / canonical reconciliation · planning gate / readiness scan / verification gate · inter-skill responsibility split & handoff.

## Severity legend

🔴 Blocking · 🟠 Medium · 🟡 Low · ⚪ Info / Positive

## Recording discipline

- **One Entry per skill stage**, written at that stage's checkpoint. Entry 1 = `execute-next-phase` kickoff / preflight; later entries = each batch's prompt-prep and execution→checkpoint; final = closing.
- **Findings** carry an `A#` id (severity-rated); **Positives** carry a `P#` id; each actionable finding maps to a **candidate `C#`** for the end-of-phase harvest.
- **Each finding is bucketed:** `skill-side` (a skill should change) vs `Claude-side` (my execution, not a skill defect) vs `project-side` (GridDO docs/config, not a skill). The user explicitly required this separation.
- **Untracked / not PR surface** (mirrors the Phase 15 audit convention). The file persists on disk; it is not added to any PR.

---

## Entry 1 — `execute-next-phase` (Phase 16 kickoff / preflight)

### What went right

| # | Observation | Axis |
|---|-------------|------|
| P1 | `git fetch origin` **before** any validation; confirmed the Phase 15 merge on `origin/main` (`1546ff2`, PR #25) with post-fetch evidence before claiming "merged." | Safety |
| P2 | Detected `scaled` mode and loaded **only** the active-phase detail; did not pull `execution-plan/archive/*`. | Boundary / Token |
| P3 | Mechanical readiness scan ran: blocker-pattern grep, recipe-existence check (both recipes present), dependency-task status (T68–T72 all `[x]`), conditional-acceptance scan. | Safety |
| P4 | **Planning-Gate miss caught as blocking** — `docs/reviews/phase-16-flow-review.md` absent; correctly flagged as a CLAUDE.md gate that must clear *before* branch/code, not waved through. | Safety gate |
| P5 | **Stale `debug-indexeddb` reference caught** in T74 acceptance — the exact carryover Phase 15 deliberately deferred (ISSUE-15-01). The plan was not trusted blindly. | Safety / plan-vs-reality |
| P6 | Wrote no code, prepared no Codex/Gemini prompts; stopped at preflight and requested approval. | Boundary |

### Findings

| ID | Axis | Sev | Bucket | Finding | Disposition |
|----|------|-----|--------|---------|-------------|
| **A1** | Boundary / routing | 🟡 | **Claude-side** | **Reached for a discovery tool when the skill was named.** The user said *"execute-next-phase 흐름으로 진행하세요"*; I first invoked `find-skills`. Worse, `find-skills` searches the *external* marketplace (`npx skills`) — it is not a router for *installed* skills, so it was the wrong tool entirely, not just an unnecessary step. No harm (the user then invoked `/execute-next-phase`), but the routing reflex is exactly the discipline this audit watches. | Recorded. Norm: a *named, installed* skill is invoked directly; `find-skills` is only for discovering *new external* skills. → candidate **C1**. Not a skill defect. |
| **A2** | Process / instruction-fidelity | 🟡 | **Claude-side** | **Audit doc not created at the instructed step.** The kickoff prompt's step 4 said create `phase-16-skill-audit.md` *before* reporting preflight; I reported findings first and skipped the file. (This file is the remediation.) | Resolved by creating this document. An execution miss against an explicit instruction, not a skill defect. → candidate **C2** (weak: an `execute-next-phase` reminder to materialize a requested audit artifact). |
| **A3** | Analysis / plan-vs-reality | 🟠 | **Claude-side** | **Conflated two distinct verifications in the preflight write-up.** I proposed replacing T74's stale `debug-indexeddb` acceptance with "a `fake-indexeddb` migration test **or** a unit test." That `or` is a category error: the **migration test (ISSUE-15-01)** verifies the v3 `upgrade()` backfill path; **T74** verifies the *Scratch-modal-creates-a-Bit* behavior. The migration test never exercises the scratch path, so it cannot substitute for the T74 check. The shared tool (`fake-indexeddb`) is *why* they were easy to merge. Caught by Codex + the user. | Corrected split (to be applied on the Phase 16 branch after the cleanup PR): **T74** → drop `debug-indexeddb`, verify via unit/integration test against the DataStore (+ optional browser smoke); **ISSUE-15-01** → a separate Phase 16 carry-in for the `fake-indexeddb` real-Dexie migration test. → candidate **C3**. |
| **A4** | Canonical state / closeout | 🟠 | **Skill-side** | **Phase 15 left `🔲 active` in the Phase Index despite being fully implemented + merged (PR #25), with no `archive/phase-15.md`.** A real `closing-phase` gap: phase-level canonical cleanup (Index status flip + archive file) did not complete — the Phase 15 close logged issues/learnings (`e4771bc`) but stopped short of the archive/index step. **Consequence:** `execute-next-phase` Step 0 (scaled) selects *"the first Phase-Index entry not yet marked done"* — mechanically that is **Phase 15**, not Phase 16. The correct phase was identified here *only* because the user named "Phase 16" in the prompt; the skill's own discovery logic would have re-selected the completed phase. Immediate risk this session: Low (user override). Latent severity: Medium (discovery misfire on a canonical contradiction). | **Detected** by `execute-next-phase` preflight; **not auto-fixed** (auto-fixing would mask the `closing-phase` gap and blur the boundary). Remediation routed by user decision to a dedicated `chore/close-phase-15` cleanup PR (this session). → candidates **C4** + **C5**. |

### Bucketing summary (per the user's required separation)

| Finding | Bucket | One-liner |
|---|---|---|
| A1 find-skills routing | **Claude-side** | Named skill → invoke directly; `find-skills` is external-discovery only. |
| A2 audit doc not created on time | **Claude-side** | Skipped an explicit instruction step (remediated by this file). |
| A3 T74 ↔ ISSUE-15-01 conflation | **Claude-side** | Loose verification reasoning; two tests share a tool, not a target. |
| **A4 Phase 15 stale index** | **Skill-side** | `closing-phase` didn't finish canonical cleanup; `execute-next-phase` should *detect* (not auto-fix) the contradiction. |

**3 of 4 preflight findings are Claude-side execution, not skill defects.** The single skill-side finding is **A4**.

### Project-side items (not skill findings — carried from the kickoff brief, deferred)

- **C4/C14 carryover (project-side):** (1) a Planning-Gate tier for UI-less / data-layer phases — **N/A for Phase 16** (a UI phase; the normal §3 flow-trace applies); (2) whether GridDO's gate should include `pnpm typecheck` — a CLAUDE.md/project-config question, handled separately from the skill audit, not blocking Phase 16.

### Do NOT over-generalize (Phase-16-specific context)

- A4's *specific* stale state arose partly from an atypical Phase 15 closeout sequence (batch work → skill-audit → skill-update inserted before a clean `closing-phase` run). Do **not** generalize to "every active phase is mis-closed." The generalizable part is only the gap itself: `closing-phase` should verify Index/archive at close, and `execute-next-phase` should detect a status contradiction.

### Verdict — Entry 1

**PASS with findings — correct STOP before implementation.** Preflight caught both real blockers (Planning-Gate absent, `debug-indexeddb` stale) and surfaced a skill-side canonical-cleanup gap (A4). The three Claude-side misses (A1–A3) are recorded honestly and require no skill change. No code, no provider prompts — the gate held.

### Entry 1 Addendum — resumed kickoff

| ID | Axis | Sev | Bucket | Finding | Disposition |
|----|------|-----|--------|---------|-------------|
| **A5** | Planning gate / framing | 🟡 | **Claude-side** | **Planning Gate was caught but branch + build/test ran first; waiver framed as co-equal option.** P4 correctly logged the gate miss as blocking. However, execution order was: fetch → readiness scan → branch create → build → test → *then* stop for the gate. The gate should have blocked branch creation, not been checked post-hoc. Compounding this, the stop was presented as "A) run flow-review (recommended) / B) waive" — treating waiver as a normal peer option rather than an explicit user override. Harm was low (no code written), but the default framing should be "the gate runs now" with waiver only on explicit user push. | Recorded. Norm: `execute-next-phase` Step 1.5 readiness scan must check for the `phase-N-flow-review.md` gate **before** branch creation; if absent, stop and run it — don't defer to post-branch. Waiver is a user-override, not a co-equal option. → candidate **C6**. |

---

## Entry 2 — `execute-task` Batch 1 (T73 + T76 prompt-prep)

### Findings

| ID | Axis | Sev | Bucket | Finding | Disposition |
|----|------|-----|--------|---------|-------------|
| **A6** | Prompt quality / source ownership | 🟠 | **Claude-side** | **Codex prompt preview carried a trigger-ownership conflict.** The Batch 1 prompt had Sidebar read the quick-capture store and toggle `activeOverlay` on `+` click while GridRuntime still passed `onAddClick` — making `onAddClick` a dead path on grid routes and risking Codex blending two trigger flows. Caught at prompt preview (Codex co-review + user) **before** launch: the provider-prompt quality gate worked. Root cause: I drafted the prompt before the Sidebar↔GridRuntime ownership boundary was settled. | Fixed: Sidebar reverts to a dumb trigger (`isAddActive` prop only, no store import); GridRuntime is the single owner of overlay state and wires `onAddClick → setActiveOverlay`. → candidate **C8**. |
| **A7** | Provider self-report / test deltas | 🟡 | **Claude-side** | **Codex changed/added tests without the prompt-required change report.** The prompt said "if a test must change, report which and why — do not silently rewrite." Codex adapted mocks (Sidebar `isAddActive`, CreateBitDialog `parentId`) and added new tests (D2/D3 omit, L0/L3 placement) but surfaced no change summary in its artifact. The deltas were sound — mock adaptation + new coverage, no assertion weakening — but I confirmed that by diffing the `^-` test lines myself, not from a provider report. | Recorded. Norm: Claude independently classifies provider test deltas (assertion-weakening vs mock-adaptation); never rely on provider self-report. → candidate **C9**. |
| **A8** | Edge-case guard / refine | 🟠 | **Claude-side** | **A UI-layer guard weakened because my prompt simplified it.** My `handleBitSubmit` spec replaced `if (!nodeId \|\| !node)` with `if (!effectiveParentId)`, dropping the check that a `/grid/[nodeId]` parent actually exists — `/grid/[missing-node]` would reach `getGridOccupancy`/`createBit` instead of failing fast. Codex faithfully implemented the flawed spec; the user caught it at Step 6. | Fixed in Step 6 refine: restored `if (nodeId !== null && !node) → "Unable to find parent node."` before `effectiveParentId`, plus a regression test (`/grid/missing-node` → no `createBit`, error set). → candidate **C10**. |

---

## Entry 3 — `execute-task` Batch 2 (T74 prompt-prep + handoff/resume dogfood)

### Positives

| ID | Axis | Finding |
|----|------|---------|
| **P7** | Handoff fidelity / Step 2 gap detection | Batch 2 handoff preserved `x=0/y=0 sentinel (Hook 8 uniqueness-exempt)` verbatim. This allowed `execute-task` Step 2 to catch the `ensureGridCellAvailable` exemption gap **before** implementation — a structural issue that a looser handoff summary would have dropped. Precision token → caught real blocker. |
| **P8** | Resume point accuracy | The `Resume Point: execute-task Step 2` in the handoff was honoured exactly. Phase kickoff was not re-entered; the correct execution stage was resumed without redundant lifecycle steps. Handoff → resume continuity held. |
| **P9** | T74 / ISSUE-15-01 separation maintained | Entry 1 A3 flagged conflation risk between T74 Scratch behavior and Dexie v3 migration verification as a recurring pattern. Batch 2 prompt-prep maintained the separation: Hook 8 exemption is tested via `FakeTable + IndexedDBDataStore`; fake-indexeddb real-Dexie migration remains ISSUE-15-01 scope. C3 reinforcement held in practice. |

### Findings

| ID | Axis | Sev | Bucket | Finding | Disposition |
|----|------|-----|--------|---------|-------------|
| **A9** | Handoff / repo path | 🟡 | **Skill-side** | **Handoff contained no repo absolute path.** New session had to discover the repo (`griddo2-claude`) via `find` before reading the handoff. The handoff Resume Sanity Check ran `git status` without a working directory context, implying the reader already knew where to `cd`. For a cross-session resume, the repo path should be explicit. | Recorded. Candidate **C11**. |
| **A10** | Handoff / commit state staleness | 🟡 | **Skill-side** | **Handoff `Current State` was outdated by one commit (`73d2438`) by the time it was read.** The handoff was written, then relocated+committed — making its own commit hash stale before first use. This is not a one-off error; it is structural: any handoff that is itself part of a commit will be stale the moment the commit lands. The sanity check `git log -6` caught it cleanly, but only because the extra commit was doc-only and recognizable. Riskier if the extra commit touched implementation files. | Recorded. Candidate **C12**. |
| **A11** | Handoff / audit track | 🟡 | **Skill-side** | **Handoff did not surface the live audit track's next recording point or dedup constraint.** The entry said `docs/reviews/phase-16-skill-audit.md (live audit)` under untracked files, but gave no signal that it was a co-equal parallel track, that Entry 3 was the next recording point, or that A1–A8 / C1–C10 must not be duplicated. A reader without prior session context would not know how to continue the audit track. | Recorded. Candidate **C11**. |
| **A12** | Parallel test authoring / output isolation | 🟠 | **Claude-side** | **Codex B was initially drafted to write directly to the working tree while running in parallel with Codex A.** Parallel providers writing to the same worktree risk merge conflicts on shared files (e.g., both touching `src/lib/db/`). The skill (execute-task Principle #7 Single writer) covers *implementation* writers but does not explicitly address the test-authoring provider in a parallel behavior-heavy flow. Caught at prompt preview before launch; fixed by restricting Codex B to artifact/fenced-block output only. | Fixed in prompt. Candidate **C13**. |

### Candidates (from Entry 3)

| ID | Candidate | Source | Target | Weight |
|----|-----------|--------|--------|--------|
| C11 | `compaction-advisor` handoff-template v0.2: add (a) repo absolute path field, (b) `Live Tracks` section listing each parallel track with its next recording point and dedup constraint, (c) sanity-check note that `git log` may show commits newer than the handoff's `Current State`. | A9, A11 | compaction-advisor `handoff-template.md` | **High** |
| C12 | Handoff `Current State` is a snapshot at write-time; its commit list may be stale by the time the handoff is committed and read. Sanity check `git log` is the authoritative state source — not the handoff's commit list. Note this asymmetry in the handoff template and in execute-task resume instructions. | A10 | compaction-advisor template + execute-task resume note | Med |
| C13 | In behavior-heavy batches using parallel test authoring, the test-authoring provider (Codex B) must be restricted to artifact/fenced-block output only when it runs in parallel with the implementation provider (Codex A). Add this constraint to `execute-task` § Parallel Test Authoring (Step 4 mixed+behavior-heavy). | A12 | execute-task Step 4 | **High** |

---

## Skill-improvement candidates (running)

| ID | Candidate | Source | Target / bucket | Weight |
|----|-----------|--------|-----------------|--------|
| C1 | A *named, installed* skill is invoked directly; reserve `find-skills` for discovering *new external* skills. | A1 | Claude-side norm | Low |
| C2 | When a kickoff prompt requests an audit/artifact file, `execute-next-phase` should materialize it before the preflight report (or explicitly note deferral). | A2 | execute-next-phase | Low |
| C3 | Readiness scan should treat *behavioral* acceptance and *migration/infra* verification as **non-substitutable** — never let a shared tool collapse two different verification targets. | A3 | execute-task Step 2 | Med |
| C4 | `closing-phase` terminal check: a phase is not "closed" until its Phase-Index row is flipped to ✅ done **and** `archive/phase-N.md` exists. | A4 | closing-phase | **High** |
| C5 | `execute-next-phase` scaled discovery: if the first non-done Phase-Index entry has all tasks `[x]` + a merged PR, that is a **status contradiction → stop and report, do not auto-fix**. | A4 | execute-next-phase | **High** |
| C6 | `execute-next-phase` Step 1.5 must check `phase-N-flow-review.md` existence **before** branch creation; if absent, stop and run it. Waiver is an explicit user override, not a default option. | A5 | execute-next-phase Step 1.5 | Med |
| C7 | Flow-trace review via `analyst` subagent was high-value for Phase 16 (first UI phase post-data-layer), but cost ~71k tokens for a 74-row review. For standard phases, a lighter approach (targeted Sonnet prompt or in-context review) may preserve coverage at lower cost. Reserve `analyst` subagent for genuinely ambiguous scopes. | flow-review process | planning gate | Low |
| C8 | Before showing a Codex prompt preview, confirm each modified surface has a **single owner**. An existing "store directly subscribed" pattern (e.g. Sidebar reads `useSearchStore`/`useEditModeStore`) does **not** justify a new direct subscription when the feature's flow ownership lives elsewhere — GridRuntime owns Quick Capture's level/placement/submit, so a prop boundary (`isAddActive`) is safer than Sidebar reading the store. | A6 | execute-task Step 3/4 (prompt-prep) | Med |
| C9 | When a provider modifies or adds tests, Claude diffs the removed (`^-`) lines and classifies each as assertion-weakening vs mock-adaptation — test changes are never accepted on provider self-report alone. | A7 | execute-task Step 6 | Med |
| C10 | Step 6 refine must check whether the provider replaced/simplified an existing guard or early-return such that a prior defense weakened (e.g. `!node` → `!effectiveParentId`); diff the changed function's guards against the original. | A8 | execute-task Step 6 | Med |
| C11 | `compaction-advisor` handoff-template v0.2: add (a) repo absolute path field, (b) `Live Tracks` section listing each parallel track with its next recording point and dedup constraint, (c) sanity-check note that `git log` may show commits newer than the handoff's `Current State`. | A9, A11 | compaction-advisor `handoff-template.md` | **High** |
| C12 | Handoff `Current State` is a snapshot at write-time; its commit list may be stale by the time the handoff is committed and read. Sanity check `git log` is the authoritative state source — not the handoff's commit list. Note this asymmetry in the handoff template and in execute-task resume instructions. | A10 | compaction-advisor template + execute-task resume note | Med |
| C13 | In behavior-heavy batches using parallel test authoring, the test-authoring provider (Codex B) must be restricted to artifact/fenced-block output only when it runs in parallel with the implementation provider (Codex A). Add this constraint to `execute-task` § Parallel Test Authoring (Step 4 mixed+behavior-heavy). | A12 | execute-task Step 4 | **High** |
| C14 | When reviewing Codex B test artifacts (Step 6d), explicitly verify each test call's argument count and types against the API surface defined in the spec — not just the test's behavioral intent. A test that passes wrong arg counts may compile (JS duck-typing) but silently misrepresents the contract. | A13 | execute-task Step 6d (merge test artifacts) | Med |
| C15 | Step 6b spec-compliance check for mixed/ui-heavy batches must include a pass over user-visible string literals — placeholder text, button labels, confirmation copy, aria-labels — against spec wording. Visual/structural compliance alone misses copy drift. | A14 | execute-task Step 6b | Med |

---

## Entry 4 — `execute-task` Batch 2 (Step 6–11: integration, verification, checkpoint)

### Positives

| ID | Axis | Finding |
|----|------|---------|
| **P10** | Parallel test authoring — adopt decision | Codex B artifact reviewed independently before touching the working tree. B5 (wrong API-shape) rejected; B's A2 (`inboxNodeId === undefined` state) adopted selectively. The Codex B output isolation constraint (C13) held: no merge conflicts. |
| **P11** | Hook 8 scope verification | Three-condition guard verified line-by-line against spec (`x===0 && y===0 && systemRole==="inbox"`) before integrating — general uniqueness paths confirmed unchanged. User-requested check handled at integration step, not deferred. |

### Findings

| ID | Axis | Sev | Bucket | Finding | Disposition |
|----|------|-----|--------|---------|-------------|
| **A13** | Parallel test authoring / API-shape | 🟡 | **Claude-side** | **Codex B invented a 2-arg API shape despite explicit "do NOT assume" prompt instruction.** B5 called `createScratchBit("idea", { nodeId, parentId })` — a 2-arg signature the spec never defined. The test's *intent* (inbox is always used regardless of context) was sound, but the *mechanism* assumed extra args that `(title: string)` doesn't accept. TypeScript strict would reject the call. Caught in Step 6d review by checking each test call's arg pattern against the spec export signature. | Rejected. Claude's Step 6d review should explicitly verify test call argument count/types against the spec-defined API surface, not just test intent. → candidate **C14**. |
| **A14** | Spec compliance / verbatim string | 🟠 | **Skill-side** | **Codex A used `"Jot down a thought"` instead of the spec-locked `"Capture your ideas..."`.** The Gemini design spec embedded in the Codex A prompt did not explicitly name the placeholder string — it was present only in the recipe/handoff context. Codex A filled the gap with its own copy. This was a spec gap (not a Codex defection from an explicit spec line), but it still resulted in a user-visible string diverging from the locked intent. Caught by user at checkpoint review, not during Step 6b spec-compliance check. **Consequence for skill:** Step 6b currently focuses on visual/structural compliance; it has no explicit step to audit verbatim string literals (placeholder text, button labels, confirmation copy). | Corrected in fix commit. Step 6b should include a pass over user-visible string literals against spec wording — placeholder, button text, copy. → candidate **C15**. |

### Candidates (from Entry 4)

| ID | Candidate | Source | Target | Weight |
|----|-----------|--------|--------|--------|
| C14 | When reviewing Codex B test artifacts (Step 6d), explicitly verify each test call's argument count and types against the API surface defined in the spec — not just the test's behavioral intent. A test that passes wrong arg counts may compile (JS duck-typing) but silently misrepresents the contract. | A13 | execute-task Step 6d (merge test artifacts) | Med |
| C15 | Step 6b spec-compliance check for mixed/ui-heavy batches must include a pass over user-visible string literals — placeholder text, button labels, confirmation copy, aria-labels — against spec wording. Visual/structural compliance alone misses copy drift. | A14 | execute-task Step 6b | Med |

---

*This document is maintained live, one entry per skill action, through Phase 16. Untracked; not PR surface.*
