# Document-Driven Development Workflow

> Recorded: 2026-03-27
> Evolution: ANALYSIS_design_archaeology.md (2026-03-18) → Planning Standard (2026-03-26) → this document

## Table of Contents

1. [Overall Workflow](#overall-workflow)
2. [Post-PRD Ideation Topics](#post-prd-ideation-topics)
3. [Two Parallel Tracks](#two-parallel-tracks)
4. [Three Failure Modes](#three-failure-modes)
5. [Phase Execution Record](#phase-execution-record)
6. [Document Hierarchy](#document-hierarchy)
7. [Skill Map](#skill-map)
8. [Document Role Boundaries](#document-role-boundaries)

---

## Overall Workflow

### 1. Initial Ideation

Deliverables:

Low-fidelity prototype (Vite/React or equivalent)

Role:

Explore the product concept visually before committing to structure.
This stage is user-driven. No AI agents, no documents.

Key Questions:

What does this look like?
What interactions feel right?
Does the visual direction hold up?

Summary: Initial ideation is pre-PRD visual exploration. The output is a throwaway prototype, not production code.

Important Note:

This stage is intentionally document-light. It does not cover product-direction changes that emerge after the PRD, after an execution plan, or during implementation. Those are handled by **Post-PRD Ideation Topics**.

### 2. Product Definition

Deliverables:

`docs/prd.md`

Role:

Define what the product should achieve from the user's perspective.
Scope, non-features, design direction, data requirements, auth model.

Key Questions:

What must the user be able to do?
What is explicitly out of scope?
What are the data entities and their relationships?

Summary: The PRD is the product promise. Everything downstream derives from it.

Important Note:

The PRD is the only document the user must write. All other documents are generated from it.

### 2.5 Product Direction Changes (as needed)

Deliverables:

`docs/brainstorming/YYYY-MM-DD-<topic>/DECISION.md`
`docs/brainstorming/YYYY-MM-DD-<topic>/NOTES.md`

Role:

Capture product-direction changes that emerge after the initial PRD or during later planning/implementation. This includes new ideas, reversals, rejected assumptions, prototype-driven decisions, and feature structures that are not yet ready for execution planning.

Key Questions:

What changed from the previous direction?
What is the current decision that future work should follow?
Where did this topic originate — PRD, phase, task, parent document, prototype, or user observation?
What was discarded, and why?

Summary: Post-PRD ideation topics preserve evolving product judgment without scattering notes across unrelated documents. `DECISION.md` is the current source of truth for the topic. `NOTES.md` preserves only the compact history needed to understand the decision.

Important Note:

This stage is reusable across projects. The folder/date/template convention should remain stable even when the project-specific document names differ.

### 3. Design Extraction (conditional)

Deliverables:

`docs/DESIGN_AUDIT.md`
`docs/DESIGN_TOKENS.md` (draft)
`docs/DESIGN_ALIGNMENT.md`
`docs/DESIGN_TOKENS.md` (final)

Skill: `/extract-design`

Role:

When a reference implementation or prototype exists, extract design as geometric data — exact Tailwind classes, HSL values, pixel measurements — rather than aesthetic prose.

Phases: screenshot capture → codebase forensics (AUDIT) → raw token extraction (TOKENS draft) → per-page design decisions (ALIGNMENT) → user gate → finalized tokens (TOKENS final).

Key Questions:

What exists in the reference and in what state?
What are the exact token values?
For each element: adopt, remove, or improve — and why?

Summary: Design extraction treats design as data, not description. Skip if greenfield (no reference exists).

Important Note:

Requires source code access and chrome-devtools MCP. User approves design decisions (Intentional Departures, Removed items, Improved items) before tokens are finalized.

### 4. System Rule Definition

Deliverables:

`docs/SCHEMA.md`
`docs/SPEC.md`
`docs/DESIGN_TOKENS.md` (greenfield only)
`docs/design-system-preview.html`

Skill: `/writing-documents` (Steps 1–4c)

Role:

Translate the PRD into implementable rules.

- SCHEMA.md: data structures, constraints, RLS policies.
- SPEC.md: routes, architecture decisions, file organization conventions.
- DESIGN_TOKENS.md (greenfield): visual system when no reference exists.
- design-system-preview.html: visual verification of tokens before planning.

If the preview review produces corrections, canonical documents are reconciled before planning begins (Step 4c).

Key Questions:

What entities exist and how do they relate?
How are routes, state, and URLs structured?
Which architectural invariants must be maintained?
Do the design tokens render correctly in the browser?

Summary: System rules translate intent into constraints. SCHEMA = data rules. SPEC = behavioral rules. DESIGN_TOKENS = visual rules.

Important Note:

Can run in parallel with Stage 3 (Design Extraction). Both tracks converge at Stage 5 (Execution Planning).

### 5. Execution Planning

Deliverables:

`docs/EXECUTION_PLAN.md`
`docs/reviews/[scope]-flow-review.md`
`docs/PLANNING_STANDARD.md`

Skill: `/writing-documents` (Steps 5–5c)

Role:

Break down all upstream documents into phased implementation tasks. Each task has file paths derived from SPEC, per-file actions with exact values, and verifiable acceptance criteria. User-facing tasks are tagged `Visibility: User-facing` with observable acceptance criteria.

After the plan draft, a dedicated reviewer subagent runs a **Flow Ownership Review**: tracing every user-visible flow from PRD/SPEC through the plan to verify end-to-end task ownership. Gaps are resolved before implementation begins (amend plan, revise upstream docs, or add explicit defer notes). Max 3 review iterations.

`PLANNING_STANDARD.md` is generated or updated to define the project's architecture conformance checklist and verification guidance. Both `writing-documents` and `closing-phase` consume it.

Key Questions:

Which task owns this user-visible flow end-to-end?
Are boundary cases assigned?
Are any omissions explicit deferrals or silent gaps?
Does the architecture conformance checklist reflect current rules?

Summary: The execution plan is the implementation roadmap. Plan hardening (flow ownership review) ensures no user-visible flow falls between tasks.

Important Note:

The flow ownership review is the strongest quality gate in the workflow. It prevents plan omission — the failure mode where PRD/SPEC promises a behavior but no task owns it. The reviewer subagent approaches the plan independently, not as a self-review.

### 6. Implementation (per phase)

Deliverables:

Source code, tests, issue-doc updates, commits, checkpoints

Skills: `/execute-next-phase` (kickoff) → `/execute-task` (execution)

Role:

Translate the finalized execution plan into code using CCG orchestration:

- **`/execute-next-phase`:** phase kickoff wrapper — reads the plan, verifies branch/base state, and hands off.
- **`/execute-task`:** primary execution skill — batches tasks, prepares prompts, orchestrates providers, runs verification, updates the issue doc, commits implementation, and presents checkpoints.

Each batch is classified before implementation (`logic-heavy` / `mixed` / `ui-heavy`). Classification determines Gemini authority, prompt structure, and whether optional subagent enhancement applies.

- **Claude:** orchestrates — reads the plan, writes prompts, reviews output, runs verification.
- **Codex:** writes all implementation code.
- **Gemini:** audits UI/UX pre-code and post-code (skipped for non-UI phases).

Claude does not originate implementation code — but refines and fixes quality issues in Codex's output during integration (naming, dead code, unnecessary abstractions, project conventions).

`/execute-task` may also add classification-driven quality layers:
- **Behavior-heavy batches:** parallel independent test authoring
- **High blast-radius / weak-coverage batches:** optional reviewer subagents before checkpoint

**User-visible verification** happens during this stage. When a task is tagged `Visibility: User-facing`, its observable acceptance criteria are verified per task or per small flow cluster — confirming that the change actually works as intended.

Key Questions:

Does the code match the plan's per-file specifications?
Do user-facing acceptance criteria pass when observed in the running app?
Does the full verification gate pass?

Summary: Implementation translates defined tasks into code. No new product decisions are made here — except when a phase involves reference-inspired redesign, which requires structured design decisions with user approval before code is written (see Reference-Inspired Redesign section).

Important Note:

User-visible verification is not a standalone process. It happens close to implementation time and is confirmed (not duplicated) during closing.

> Branch/base verification is enforced by `/execute-next-phase`. Prompt preview, provider routing, per-batch verification, checkpoint format, issue tracking, and implementation commits are enforced by `/execute-task`. Final close-out gates are enforced by `/closing-phase`.

### 7. Closing (per phase)

Deliverables:

Updated `docs/issues/Issues_Phase_N.md` (if changed during close-out)
Updated `docs/EXECUTION_PLAN.md` (phase notes; task statuses if not already committed)
Pull request to main

Skill: `/closing-phase`

Role:

Final gate before integration. First performs a scope audit if dirty files remain, forcing mixed-scope work into separate commits before close-out. Then verifies three pillars:

1. **Automated checks** pass (test, lint, typecheck, build).
2. **User-visible verification** was completed for applicable tasks (confirmation, not duplication).
3. **Architecture conformance review** satisfied — tiered:
   - Blocking violations must be fixed or the standard explicitly amended.
   - Advisory violations are surfaced, acknowledged, and recorded.

Then: finalizes any remaining close-out issue updates and phase learnings, updates `EXECUTION_PLAN.md` as needed, makes the docs-only closing commit, pushes, and creates the PR.

Key Questions:

Do all automated checks pass?
Were user-facing acceptance criteria verified?
Does the code conform to architectural invariants?
What issues were encountered and what was learned?

Summary: Closing is the completion gate. It catches implementation deviation and ensures no verification was missed.

Important Note:

If `docs/PLANNING_STANDARD.md` does not exist, architecture conformance review is explicitly skipped with a guidance message — never silently.

### 8. Integration

Deliverables:

Merged branch on main

Role:

PR review and merge. The branch is ready: implementation committed, docs committed, verification complete, PR created.

After merge, the next phase begins from a clean main.

Key Questions:

Is the PR description accurate?
Are there any concerns from review?

Summary: Integration is the final hand-off. Stages 6–8 repeat per phase until all phases complete.

---

## Post-PRD Ideation Topics

Post-PRD ideation topics handle product thinking that emerges after the PRD, during execution planning, or while implementation/prototyping reveals that an earlier assumption is incomplete.

This mechanism exists because product direction often changes after initial documents are written. Without a structured place for these changes, decisions become scattered across chat history, prototype prompts, old planning documents, and temporary worktrees.

### When To Use

Create or update a brainstorming topic when any of the following happens:

- A new idea appears after the PRD or execution plan.
- An existing PRD/plan decision is challenged or reversed.
- A prototype reveals that a feature needs a different structure.
- A feature is not ready for implementation because product logic is still unclear.
- A previous phase is deferred and a new product direction branches from that decision.
- The user asks to preserve ideation so future agents can continue from the current judgment.

Do not use this for small implementation bugs or phase execution corrections. Those belong in `docs/issues/Issues_Phase_N.md`.

### Folder Convention

Each topic gets one dated folder:

```text
docs/brainstorming/YYYY-MM-DD-<topic>/
  DECISION.md
  NOTES.md
```

Rules:

- `YYYY-MM-DD` is the date the topic became an independent ideation topic.
- `<topic>` is lowercase, stable, and filesystem-safe.
- Use underscores for multi-word topics, e.g. `quick_capture`, `inbox_triage`.
- The date is part of the folder name so the topic can be traced to the phase/context where it emerged.

Examples:

```text
docs/brainstorming/2026-06-12-search_routing/
docs/brainstorming/2026-07-03-billing_flows/
```

When one broad product-direction branch creates several related child topics, use a dated parent topic folder and nest child topics below it:

```text
docs/brainstorming/YYYY-MM-DD-<parent_topic>/
  DECISION.md
  NOTES.md
  child_topic/
    DECISION.md
    NOTES.md
  references/
    <historical-or-source-material>.md
```

Nested child topic folders do not need another date in the folder name. Preserve the child topic's own start date in its metadata instead.

Example:

```text
docs/brainstorming/2026-04-28-out_of_phase/
  DECISION.md
  NOTES.md
  quick_capture/
    DECISION.md
    NOTES.md
  inbox_triage/
    DECISION.md
    NOTES.md
  references/
    original_out_of_phase_plan_eng.md
```

### Document Roles

#### `DECISION.md`

`DECISION.md` is the topic's current execution baseline.

It answers:

- What is the current direction?
- What should future agents follow?
- What is stable enough to plan or implement?
- What remains open?

`DECISION.md` should not preserve every step of the conversation. It should be concise enough that a future agent can read it and continue work without replaying the ideation history.

#### `NOTES.md`

`NOTES.md` preserves only the context needed to understand why the decision exists.

It contains:

- `History & Prompt Notes`
- `Discarded Ideas`
- `References`

Do not store every prompt verbatim. Store the prompt's purpose and outcome when it materially affected the decision.

Do not treat disposable worktrees as durable references. If a prototype worktree is expected to be deleted, extract its useful decision into `DECISION.md` or summarize the role it played in `NOTES.md`.

### Required Metadata

Both `DECISION.md` and `NOTES.md` should start with metadata. `DECISION.md` includes status because it is the current execution baseline. `NOTES.md` may repeat the same status when useful, but its required fields are date, origin, related phase/context, and parent document.

```markdown
# <Topic> Decision

> Started: YYYY-MM-DD
> Status: <current status>
> Origin: <why this topic started>
> Related phase: <phase/task/context>
> Parent document: <source document, if any>
```

`Parent document` matters when a topic branches from an existing planning document. For example:

```text
Phase 15 / Task 68 defer
-> docs/brainstorming/2026-04-28-out_of_phase/DECISION.md
-> docs/brainstorming/2026-04-28-out_of_phase/inbox_triage/DECISION.md
```

This makes the document lineage explicit.

### `DECISION.md` Template

```markdown
# <Topic> Decision

> Started: YYYY-MM-DD
> Status: <current status>
> Origin: <why this topic started>
> Related phase: <phase/task/context>
> Parent document: <source document, if any>

## Status

<One or two paragraphs describing whether this is settled, in ideation, blocked, or ready for planning.>

## Current Decision

<The current product direction that future work should follow.>

## Product Language

<Terms and definitions introduced or changed by this topic.>

## Final Structure

<Stable structure, layout, data model, or interaction model. Use diagrams/tables when useful.>

## User Flow

<The intended user path through the feature or decision.>

## Implementation Notes

<Constraints future implementation must respect. Keep this product-level unless concrete implementation details are already settled.>

## Open Questions

<Only unresolved questions that block planning or implementation. If none, say so.>
```

Section names can be adapted to the topic, but the document must still answer the same questions.

### `NOTES.md` Template

```markdown
# <Topic> Notes

> Started: YYYY-MM-DD
> Status: <current status, optional but recommended>
> Origin: <why this topic started>
> Related phase: <phase/task/context>
> Parent document: <source document, if any>

## History & Prompt Notes

<Summarize the core direction changes. Include prompt intent and outcome only when it shaped the decision. Do not paste every prompt.>

## Discarded Ideas

- <Idea>: <brief reason it was dropped>

## References

- <durable document or artifact> — <why it matters>
```

References should be stable artifacts, not temporary worktree paths. If a worktree generated the final direction, summarize that in History & Prompt Notes instead.

### Promotion Rule

When a topic becomes stable enough to implement, promote its decision into the normal planning chain:

```text
DECISION.md
  -> update PRD/SPEC/SCHEMA/DESIGN_TOKENS as needed
  -> update or create EXECUTION_PLAN.md tasks
```

The brainstorming folder remains as the decision history, but implementation should not depend on reading chat logs or deleted prototype worktrees.

### Relationship To Skills

This topic-folder structure is implemented as a reusable personal workflow skill: `/recording-ideas`.

The skill:

- Creates the dated topic folder.
- Generates or updates `DECISION.md`.
- Generates or updates `NOTES.md`.
- Keeps `DECISION.md` focused on current decisions.
- Keeps `NOTES.md` compact: history, prompt intent, discarded ideas, durable references.
- Asks for or infers `Started`, `Origin`, `Related phase`, and `Parent document`.

If the skill is not available, agents should follow this section directly.

---

## Two Parallel Tracks

The document chain has two independent tracks that merge at the execution plan:

```
TRACK A: Architecture              TRACK B: Design (conditional)
───────────────────────           ──────────────────────────────
PRD.md (user-written)             Reference / Prototype
    │                                   │
    ├──→ SCHEMA.md                 DESIGN_AUDIT.md
    │    (data model)              (codebase forensics)
    │                                   │
    ├──→ SPEC.md                   DESIGN_TOKENS.md (draft)
    │    (routes, architecture)    (raw extracted values)
    │                                   │
    │                              DESIGN_ALIGNMENT.md
    │                              (adopt / remove / improve)
    │                                   │
    │                              DESIGN_TOKENS.md (final)
    │                                   │
    └──────────────┬────────────────────┘
                   │
                   ▼
            EXECUTION_PLAN.md
            (architecture + design → phased tasks)
                   │
                   ▼
            Flow Ownership Review
                   │
                   ▼
            Implementation → Closing → Integration
```

Track A derives from the PRD. Track B derives from the reference prototype. They are independent until the execution plan merges them.

Track B is conditional. Greenfield projects skip it entirely — DESIGN_TOKENS.md is generated during Track A (writing-documents Step 4).

**Parallelism:** SCHEMA + DESIGN_AUDIT can run in parallel (independent inputs). SPEC + DESIGN_TOKENS draft can run in parallel (after their respective prerequisites). Everything converges at EXECUTION_PLAN.

**Post-PRD topic branches:** A brainstorming topic can branch from PRD, SPEC, EXECUTION_PLAN, a deferred phase, or a parent design document. Once stable, its `DECISION.md` is promoted back into the canonical document chain before implementation planning continues.

---

## Three Failure Modes

The workflow distinguishes three failure modes. Each is caught by a different mechanism at a different stage:

| Failure Mode             | Mechanism                       | Stage                 | Skill Step                    |
| ------------------------ | ------------------------------- | --------------------- | ----------------------------- |
| Plan Omission            | Flow Ownership Review           | 5. Execution Planning | writing-documents 5b          |
| False Completion         | User-Visible Verification       | 6. Implementation     | execute-task (per batch/task), confirmed by closing-phase 2.5 |
| Implementation Deviation | Architecture Conformance Review | 7. Closing            | closing-phase 2.75            |

**Plan Omission:** A user-visible flow exists in PRD/SPEC but no task owns it clearly enough. Caught by the reviewer subagent tracing flows end-to-end.

**False Completion:** A task is marked done but its acceptance criteria were not actually satisfied. Prevented by observable acceptance criteria verified close to implementation time.

**Implementation Deviation:** Code contradicts the intended architecture, abstraction, or reactive model. Caught by the architecture conformance checklist (Blocking / Advisory tiers) during phase closure.

These are not handled by the same mechanism. The distinction is deliberate.

---

## Phase Execution Record

During implementation, work often emerges that was not pre-written in the execution plan — bug fixes, corrective adjustments, policy changes, or structural changes beyond planned scope. This section defines how to track and close that work.

### Issue Document

Record execution-time issues in the **phase issue document**:

```
docs/issues/Issues_Phase_N.md
```

This document is a **live execution record**, not a closing artifact. It is updated as work emerges during the phase — entries are opened during execution, statuses change during execution, and closure/disposition is finalized only when the user confirms or explicitly decides.

### Issue-Recording Trigger Rule

**Any execution-time issue, bug fix, corrective adjustment, or out-of-plan change must be recorded in the current phase issue document while the phase is in progress.**

- Do not defer recording to phase close. The issue document must be updated as the work emerges, not reconstructed after the fact.
- If work was done that is not described by any planned task in `EXECUTION_PLAN.md`, it must appear in the issue document.
- Recording an issue is not the same as blocking on it — the agent can continue working while the issue is open. But the issue must exist in the document.

### Issue Structure

```markdown
# Issues — Phase N

## Main Issues
(execution issues discovered by the agent, architecture issues,
structural changes beyond planned scope)

### MI-1: [Title]
- **Status:** [status]
- **Discovered:** [when/how]
- **Root cause:** [what]
- **Beyond scope because:** [why no planned task covers this]
- **Changes:** [files modified]
- **Resolution:** [summary, when closed]

## Minor Issues
(issues reported directly by the user, or surfaced through
user questioning or validation)

### mi-1: [Title]
- **Status:** [status]
- **Reported:** [when/how]
- **Changes:** [files modified, if any]
- **Resolution:** [summary, when closed]
```

### Main Issues vs. Minor Issues

**Main Issues** — execution issues discovered by the agent, architecture issues, and structural changes beyond planned scope.

**Minor Issues** — issues reported directly by the user, or issues surfaced through user questioning or validation during execution. Minor issues are not limited to "small bugs." They include any issue that originates from user observation or feedback.

Minor issues that grow in scope, become structural, or prove too complex for the Minor category are promotable to Main Issues.

**Minor Issue trigger examples** (representative, not exhaustive):

| Trigger | Example |
|---------|---------|
| User reports a runtime failure | Bit creation fails with a validation error |
| User requests a corrective visual adjustment | Background color needs to change |
| User points out a design/reference mismatch | Node card differs from the intended reference image |
| User questions workflow/documentation completeness | "The workflow proposal doesn't explain the two-track model" |
| User identifies a workflow/policy contradiction | "If the rollback restores design-token authority, why does this still conflict with the workflow?" |
| User identifies execution-process drift | Work advanced without documentation; recovery must happen before continuing |

### Issue Statuses

| Status | Meaning |
|--------|---------|
| `Open` | Identified, not yet worked on |
| `In Progress` | Actively being worked on |
| `Awaiting User Decision` | Agent cannot proceed without user input |
| `Closed` | Resolved and confirmed by user |
| `Deferred` | Acknowledged, intentionally postponed to a later phase |
| `Dropped` | Acknowledged, intentionally abandoned |
| `Promoted to Execution Plan` | Grew large enough to become a planned task |

### Issue Close Rule

**Issue closure requires user decision.** Even if a fix appears code-complete, the agent must not mark it `Closed` until the user has explicitly indicated closure — e.g., "this is good now," "let's move on," "this issue can end here."

Without that signal, the correct state is one of:
- `In Progress` (work ongoing)
- `Awaiting User Decision` (agent needs direction)
- `Deferred` (acknowledged but postponed)

### Unresolved Issues Block Phase Close

The closing-phase workflow is blocked if any of the following remain in the phase issue document:
- `Open` issues
- `In Progress` issues
- `Awaiting User Decision` issues

Every issue must reach a terminal disposition before the phase can close:
- `Closed`, `Deferred`, `Dropped`, or `Promoted to Execution Plan`

"The code runs and tests pass" is not sufficient to close a phase. There must be either resolution or an explicit disposition for every tracked issue.

### Task Completion Gate

**Task completion in `docs/EXECUTION_PLAN.md` requires user approval.** The `[x]` status marker means user-accepted completion, not merely implementation-complete or verification-passing.

During active-phase execution:

- **Do not** mark a task `[x]` immediately after implementation, even if internal verification (build, test, typecheck) passes
- **Do not** mark a batch or phase complete based only on code completion or internal verification
- Before marking `[x]`, stop at the batch checkpoint and present the structured checkpoint contract:
  - What was implemented
  - Key changes made
  - Verification results (the full gate from `CLAUDE.md`, e.g. test, lint, typecheck, build)
  - Review findings (Gemini, self-review, or other)
  - Visible now / Review now / Planned for later / Unowned items
- Wait for explicit user approval
- Only after that approval may the relevant task status be updated to `[x]`

The checkpoint is a structured contract, not an abbreviated progress summary.

During a batch, in-progress tasks may be described as "implemented" or "awaiting review" — but the execution plan status stays `[ ]` until the user approves.

This aligns with the Issue Close Rule: just as issues are not closed because code is complete, tasks are not marked done because code is written and tests pass. Both require explicit user acceptance.

**Exception:** The `closing-phase` skill does not need this gate, because by the time it is invoked, the user has already explicitly indicated that the phase is ready to close.

### Issue-Level Sync

The agent does not need approval for every small fix. But at the **issue level**, the agent syncs with the user on:

1. **What the problem is** — before starting work, describe the issue clearly enough that the user understands what's being addressed
2. **What direction is being taken** — if the fix involves a non-obvious approach, state the approach before executing
3. **Whether the issue is ready to close** — present the result and wait for the user's disposition

This prevents two failure modes: the agent silently closing issues the user hasn't validated, and the agent blocking on trivial fixes that don't need approval.

### Document Role Clarification

The phase issue document does **not** replace canonical product/spec documents:

| Document | Role |
|----------|------|
| `SPEC.md` | Architecture, routing, behavioral rules |
| `SCHEMA.md` | Data model, constraints, validation |
| `DESIGN_TOKENS.md` | Visual values, CSS variables, token authority |
| `WORKFLOW.md` | Process stages, skill map, failure modes, issue tracking rules |
| `EXECUTION_PLAN.md` | Phased task specs, acceptance criteria |
| `PLANNING_STANDARD.md` | Planning / verification / conformance guardrails |
| **`docs/issues/Issues_Phase_N.md`** | **Live phase execution record** — updated during execution, not just at close. Tracks what actually happened, what went beyond plan, what was opened / closed / deferred |

Large issues are promotable to a new task in `EXECUTION_PLAN.md` or updates to canonical docs.

---

## Reference-Inspired Redesign

When a phase redesigns an existing surface toward a reference image, a structured design sub-process runs before code is written. This applies when:

- A phase targets a reference image or prototype for a specific surface
- The surface already has working product controls
- Some existing controls may not appear in the reference

### The Problem

A reference image shows what the target looks like but doesn't show what was intentionally excluded. When an existing product control is absent from the reference, two questions arise:

1. **Should this control be retained?** (product decision)
2. **Where should it go in the new layout, and why?** (design decision)

Both require user input, but they are different conversations. Skipping question 2 means placement decisions are made without design rationale — the gap identified during the Phase 8 workflow pilot.

### Process

| Step | Action | Who | Output |
|------|--------|-----|--------|
| 1. Visual Extraction | Read reference, extract layout, elements, spacing, hierarchy | Agent | Element inventory |
| 2. Current Surface Analysis | Read the existing component code | Agent | Current surface inventory |
| 3. Delta Analysis + Retain/Remove Gate | Categorize elements (new / preserved / restructured / absent entirely), user decides what stays | User decides | Retained set |
| 4. Reintegration Proposal | For each retained element: placement, rationale, visibility, fidelity impact | Agent proposes, User approves | Approved placements |
| 5. Durable Recipe | Write approved recipe to `docs/recipes/<surface>-recipe.md` | Agent | Durable recipe file |
| 6. Canonical Promotion | Promote recipe into `docs/DESIGN_TOKENS.md` (Surface Recipes section) and update `docs/EXECUTION_PLAN.md` task specs to reference the recipe | Agent | Updated canonical docs |
| 7. Cascade Check | Verify no conflicts between recipe and existing tokens, layouts, or component ownership | Agent | Conflict report (if any) |

Step 4 is the critical addition. For each retained control, the agent proposes where it goes, why, how visible it should be, and whether the placement preserves or weakens the reference's design fidelity. The user approves before the recipe is written.

Steps 5–7 were added based on Phase 8 pilot evidence. Writing the recipe durably before canonical promotion prevents conversation-only recipes from being lost across sessions. The cascade check catches conflicts between the new recipe and existing design tokens or component ownership.

### Relationship to Other Stages

- **Stage 3 (Design Extraction)** handles adopt/remove/improve at project inception. Reference-inspired redesign handles similar decisions at phase level for individual surfaces.
- **Stage 6 (Implementation)** normally makes no new product decisions. Reference-inspired redesign is the exception — structured design decisions with user approval, before code.

### Entry Points

- **Primary:** User invokes `/reference-redesign <image-path>` directly.
- **Ad-hoc:** User invokes `/reference-redesign` without arguments; the skill asks which reference to use.

> The reintegration process is defined by the `/reference-redesign` skill. See skill definition for enforcement details.

---

## Document Hierarchy

### Brainstorming Decision Documents

Capture product-direction changes after the PRD or during later phases.

| Document | Stage | Role |
| -------- | ----- | ---- |
| `docs/brainstorming/YYYY-MM-DD-<topic>/DECISION.md` | 2.5 Product Direction Changes | Current source of truth for a post-PRD ideation topic |
| `docs/brainstorming/YYYY-MM-DD-<topic>/NOTES.md` | 2.5 Product Direction Changes | Compact history, prompt intent, discarded ideas, and durable references |

These documents are not a substitute for PRD/SPEC/SCHEMA/EXECUTION_PLAN. When a decision stabilizes, promote it into the canonical planning chain.

### Canonical Documents

Define what to build and how it should behave.

| Document                | Stage                     | Written By | Required |
| ----------------------- | ------------------------- | ---------- | -------- |
| `docs/prd.md`           | 2. Product Definition     | User       | Always   |
| `docs/SCHEMA.md`        | 4. System Rule Definition | Claude     | Always   |
| `docs/SPEC.md`          | 4. System Rule Definition | Claude     | Always   |
| `docs/DESIGN_TOKENS.md` | 3 or 4 (track-dependent)  | Claude     | Always   |

### Design Decision Documents

Present only when inheriting a reference implementation.

| Document                   | Stage                | Role During Planning       | Role During Implementation       |
| -------------------------- | -------------------- | -------------------------- | -------------------------------- |
| `docs/DESIGN_AUDIT.md`     | 3. Design Extraction | Input for tokens/alignment | Archive                          |
| `docs/DESIGN_ALIGNMENT.md` | 3. Design Extraction | Input for execution plan   | Gemini reads as review guardrail |

Without ALIGNMENT during implementation, a reviewer would flag intentional removals as bugs.

### Execution Documents

Drive implementation and phase completion.

| Document                        | Stage                 | Role                                    |
| ------------------------------- | --------------------- | --------------------------------------- |
| `docs/EXECUTION_PLAN.md`        | 5. Execution Planning | Phased task specs with geometric values |
| `docs/issues/Issues_Phase_N.md` | 6–7. Implementation → Closing | Live phase execution record — captures issues during execution, finalized at close |

### Standard & Review Documents

Ensure process quality and provide evidence.

| Document                              | Stage                 | Role                                         |
| ------------------------------------- | --------------------- | -------------------------------------------- |
| `docs/PLANNING_STANDARD.md`           | 5. Execution Planning | Conformance checklist, verification guidance |
| `docs/reviews/[scope]-flow-review.md` | 5. Execution Planning | Evidence of flow ownership verification      |
| `docs/OMISSION_AUDIT.md`              | Historical            | Background record justifying the standard    |

### Verification Artifacts

Non-authoritative. Used for visual review, not as source of truth.

| Document                          | Stage                     | Role                      |
| --------------------------------- | ------------------------- | ------------------------- |
| `docs/design-system-preview.html` | 4. System Rule Definition | Visual token verification |

---

## Skill Map

| Skill                 | Stages                       | Trigger                                               |
| --------------------- | ---------------------------- | ----------------------------------------------------- |
| `/recording-ideas` | 2.5 Product Direction Changes | "record this idea", "create brainstorming topic", "update topic decision", "document direction change" |
| `/extract-design` | 3. Design Extraction         | Reference exists; "inherit design", "match reference" |
| `/reference-redesign` | 6. Implementation (pre-code) | "redesign toward", "match this mockup", reference-driven surface redesign |
| `/writing-documents`  | 4–5. System Rules → Planning | "PRD is ready", "generate docs", "create spec"        |
| `/execute-next-phase` | 6. Implementation kickoff    | "start phase N", "execute phase"                      |
| `/execute-task`       | 6. Implementation execution  | "execute tasks", "run batch", task-level or ad-hoc implementation |
| `/closing-phase`      | 7. Closing                   | "phase done", "close phase"                           |
| `/compaction-advisor` | Any (session / context mgmt) | "should I compact?", "is it time to clear?", a context %, "context is nearly full" |

Stages 1–2 are user-driven (no skill).
Stage 2.5 can be done with `/recording-ideas`, or manually from this document if the skill is unavailable.
Stage 8 is handled by closing-phase's final steps (push + PR).

**Compaction handoffs:** Phase/batch handoff records live in `docs/handoffs/`, named
`phase-N-batch-M.md`. Use the global `compaction-advisor` skill to decide
keep-going / clean-clear / handoff-clear / handoff-compact and to generate handoffs.
`docs/compaction-guide.md` is project-local background only — the skill is the active workflow.

---

## Document Role Boundaries

Each document has a specific role. Confusion about scope causes drift.

| Document                     | Is NOT                                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------------------------- |
| `brainstorming/.../DECISION.md` | A raw notes dump. It is the current topic decision baseline, not a transcript.               |
| `brainstorming/.../NOTES.md` | A full conversation archive. It stores compact history, prompt intent, discarded ideas, and durable references only. |
| `DESIGN_AUDIT.md`            | A decisions document. Reports what exists, not what to do.                                     |
| `DESIGN_TOKENS.md`           | A decisions document. Specifies values. Decisions live in ALIGNMENT.                           |
| `DESIGN_ALIGNMENT.md`        | A values document. Records decisions. Values live in TOKENS.                                   |
| `EXECUTION_PLAN.md`          | A design document. Architecture + task specs, not design philosophy.                           |
| `SPEC.md`                    | A design document. Architecture and routes, not visual values.                                 |
| `design-system-preview.html` | A source of truth. Verification artifact only. Corrections must be promoted to canonical docs. |
| `PLANNING_STANDARD.md`       | A historical document. Active operational standard.                                            |
| `OMISSION_AUDIT.md`          | An operational document. Historical remediation record.                                        |
