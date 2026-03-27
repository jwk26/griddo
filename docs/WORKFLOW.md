# Document-Driven Development Workflow

> Recorded: 2026-03-27
> Evolution: ANALYSIS_design_archaeology.md (2026-03-18) → Planning Standard (2026-03-26) → this document

## Table of Contents

1. [Overall Workflow](#overall-workflow)
2. [Two Parallel Tracks](#two-parallel-tracks)
3. [Three Failure Modes](#three-failure-modes)
4. [Document Hierarchy](#document-hierarchy)
5. [Skill Map](#skill-map)
6. [Document Role Boundaries](#document-role-boundaries)

---

## Overall Workflow

### 1. Ideation

Deliverables:

Low-fidelity prototype (Vite/React or equivalent)

Role:

Explore the product concept visually before committing to structure.
This stage is user-driven. No AI agents, no documents.

Key Questions:

What does this look like?
What interactions feel right?
Does the visual direction hold up?

Summary: Ideation is visual exploration. The output is a throwaway prototype, not production code.

### 2. Product Definition

Deliverables:

`docs/PRD.md`

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

### 3. Design Extraction (conditional)

Deliverables:

`docs/DESIGN_AUDIT.md`
`docs/DESIGN_TOKENS.md` (draft)
`docs/DESIGN_ALIGNMENT.md`
`docs/DESIGN_TOKENS.md` (final)

Skill: `/design-archaeology`

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

Source code, tests, commits

Skill: `/execute-next-phase`

Role:

Translate the finalized execution plan into code using CCG orchestration:

- **Claude:** orchestrates — reads the plan, writes prompts, reviews output, runs verification.
- **Codex:** writes all implementation code.
- **Gemini:** audits UI/UX pre-code and post-code (skipped for non-UI phases).

Claude does not originate implementation code — but refines and fixes quality issues in Codex's output during integration (naming, dead code, unnecessary abstractions, project conventions).

**User-visible verification** happens during this stage. When a task is tagged `Visibility: User-facing`, its observable acceptance criteria are verified per task or per small flow cluster — confirming that the change actually works as intended.

Key Questions:

Does the code match the plan's per-file specifications?
Do user-facing acceptance criteria pass when observed in the running app?
Does the build pass?

Summary: Implementation focuses purely on translating defined tasks into code. No new product decisions are made here.

Important Note:

User-visible verification is not a standalone process. It happens close to implementation time and is confirmed (not duplicated) during closing.

### 7. Closing (per phase)

Deliverables:

`docs/issues/Issues_Phase_N.md`
Updated `docs/EXECUTION_PLAN.md` (task status + phase notes)
Pull request to main

Skill: `/closing-phase`

Role:

Final gate before integration. Verifies three pillars:

1. **Automated checks** pass (lint, typecheck, build).
2. **User-visible verification** was completed for applicable tasks (confirmation, not duplication).
3. **Architecture conformance review** satisfied — tiered:
   - Blocking violations must be fixed or the standard explicitly amended.
   - Advisory violations are surfaced, acknowledged, and recorded.

Then: documents issues and learnings, marks tasks complete in EXECUTION_PLAN.md, commits docs, pushes, creates PR.

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

---

## Three Failure Modes

The workflow distinguishes three failure modes. Each is caught by a different mechanism at a different stage:

| Failure Mode             | Mechanism                       | Stage                 | Skill Step                    |
| ------------------------ | ------------------------------- | --------------------- | ----------------------------- |
| Plan Omission            | Flow Ownership Review           | 5. Execution Planning | writing-documents 5b          |
| False Completion         | User-Visible Verification       | 6. Implementation     | execute-next-phase (per task) |
| Implementation Deviation | Architecture Conformance Review | 7. Closing            | closing-phase 2.75            |

**Plan Omission:** A user-visible flow exists in PRD/SPEC but no task owns it clearly enough. Caught by the reviewer subagent tracing flows end-to-end.

**False Completion:** A task is marked done but its acceptance criteria were not actually satisfied. Prevented by observable acceptance criteria verified close to implementation time.

**Implementation Deviation:** Code contradicts the intended architecture, abstraction, or reactive model. Caught by the architecture conformance checklist (Blocking / Advisory tiers) during phase closure.

These are not handled by the same mechanism. The distinction is deliberate.

---

## Document Hierarchy

### Canonical Documents

Define what to build and how it should behave.

| Document                | Stage                     | Written By | Required |
| ----------------------- | ------------------------- | ---------- | -------- |
| `docs/PRD.md`           | 2. Product Definition     | User       | Always   |
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
| `docs/issues/Issues_Phase_N.md` | 7. Closing            | Issues and learnings per phase          |

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
| `/design-archaeology` | 3. Design Extraction         | Reference exists; "inherit design", "match reference" |
| `/writing-documents`  | 4–5. System Rules → Planning | "PRD is ready", "generate docs", "create spec"        |
| `/execute-next-phase` | 6. Implementation            | "start phase N", "execute phase"                      |
| `/closing-phase`      | 7. Closing                   | "phase done", "close phase"                           |

Stages 1–2 are user-driven (no skill).
Stage 8 is handled by closing-phase's final steps (push + PR).

---

## Document Role Boundaries

Each document has a specific role. Confusion about scope causes drift.

| Document                     | Is NOT                                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------------------------- |
| `DESIGN_AUDIT.md`            | A decisions document. Reports what exists, not what to do.                                     |
| `DESIGN_TOKENS.md`           | A decisions document. Specifies values. Decisions live in ALIGNMENT.                           |
| `DESIGN_ALIGNMENT.md`        | A values document. Records decisions. Values live in TOKENS.                                   |
| `EXECUTION_PLAN.md`          | A design document. Architecture + task specs, not design philosophy.                           |
| `SPEC.md`                    | A design document. Architecture and routes, not visual values.                                 |
| `design-system-preview.html` | A source of truth. Verification artifact only. Corrections must be promoted to canonical docs. |
| `PLANNING_STANDARD.md`       | A historical document. Active operational standard.                                            |
| `OMISSION_AUDIT.md`          | An operational document. Historical remediation record.                                        |
