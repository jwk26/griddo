# Planning & Verification Standard

> **Purpose:** Prevent the three failure modes that cause document-driven development to break down:
> plan omission, false completion, and implementation deviation.
>
> **Consumed by:** `writing-documents` (Step 5b), `closing-phase` (Steps 2.5, 2.75)
> **Owned by:** The project — skills execute the process, this document defines it.

## Table of Contents

1. [Three Failure Modes](#1-three-failure-modes)
2. [Inference Boundary Rules](#2-inference-boundary-rules)
3. [Flow-Trace Review](#3-flow-trace-review)
4. [Gap Resolution Protocol](#4-gap-resolution-protocol)
5. [User-Visible Verification](#5-user-visible-verification)
6. [Architecture Conformance Checklist](#6-architecture-conformance-checklist)

---

## 1. Three Failure Modes

### 1. Plan Omission

A user-visible flow exists in PRD/SPEC but no task owns it clearly enough in EXECUTION_PLAN.md.

- **Phase:** Document phase (writing-documents Step 5b)
- **Mechanism:** Flow Ownership Review
- **Goal:** Prevent gaps before implementation starts

### 2. False Completion

A task is marked done but its acceptance criteria were not actually satisfied.

- **Phase:** Implementation phase (per-task/flow-cluster verification)
- **Mechanism:** Observable acceptance criteria + user-visible verification
- **Goal:** Make "done" harder to claim without evidence

### 3. Implementation Deviation

Code contradicts the intended architecture, abstraction, or reactive model.

- **Phase:** Closing/merge phase (closing-phase Step 2.75)
- **Mechanism:** Architecture Conformance Review
- **Goal:** Catch structural violations before merge

---

## 2. Inference Boundary Rules

Three tiers:

- **User-visible decisions** — MUST be explicit in the plan. What the user clicks, what opens, what route/state changes, what happens at boundaries.
- **Architectural invariants** — MUST be explicit in the plan OR checked by conformance review. Abstraction boundaries, reactive model guarantees, data flow patterns, migration-sensitive rules.
- **Developer-visible implementation details** — MAY be left to implementer judgment. React patterns, hook internals, CSS details within a token system, error handling for impossible states.

**Rule of thumb:** if a user would notice the decision, it must be explicit. If only a developer would notice, it can be inferred — unless it's an architectural invariant.

### Code-Readiness Invariant

Four rules govern what may appear in an active execution plan:

1. **Code-ready by default.** Every implementation task in EXECUTION_PLAN.md must be implementable from the task spec alone, without requiring additional product, design, or policy decisions.

2. **Decision prerequisites are narrow, owned gates.** An active plan may include a non-code `Decision prerequisite` only when product scope and behavior are already fixed but one user-visible realization still requires explicit approval. The prerequisite must name its output artifact and approval gate, precede every dependent implementation task, and be listed as their dependency. No dependent implementation may start before approval. A prerequisite may not hide unresolved product policy, architecture, persistence, or scope.

3. **No unowned unresolved blockers.** Open questions, design dependencies, and policy choices may not remain implicit in implementation tasks. Resolve them before planning, express the permitted case as an owned `Decision prerequisite`, or move the work out of the active plan.

4. **Future work lives in future_ideas.** Deferred features, blocked tasks, and unscheduled work live in `docs/brainstorming/future_ideas/`, not in the execution plan. The plan contains only active, schedulable work.

**Enforcement:** The `execute-next-phase` skill runs a mechanical readiness scan before branch creation. The `execute-task` skill runs a batch-level readiness check before prompt preparation. Both halt on violations.

---

## 3. Flow-Trace Review

### Purpose

Trace every user-visible flow from PRD/SPEC through the execution plan and verify task ownership.

### When it runs

After EXECUTION_PLAN.md is generated (writing-documents Step 5b). Max effort. Performed by a dedicated reviewer subagent independent from the plan author.

### Flow-trace table template

```markdown
# Flow-Trace Review — [Phase/Scope]

**Reviewed:** YYYY-MM-DD
**Inputs:** PRD.md, SPEC.md, EXECUTION_PLAN.md

## Flow-Trace Table

| # | User Flow | Trigger | Intended Outcome | Owning Task | Boundary Cases | Status |
|---|-----------|---------|------------------|-------------|----------------|--------|

Status: ✅ Owned | ⚠️ Weak | ❌ Gap | ⏸️ Deferred

## Gaps Found (if any)

| # | Flow | Gap Type | Description | Recommended Resolution |
|---|------|----------|-------------|----------------------|

## Summary

- Flows traced: N
- Fully owned: N
- Weak: N
- Gaps: N
- Deferred: N
- Status: PASS / GAPS FOUND
```

### Review artifact location

`docs/reviews/phase-N-flow-review.md` (or `docs/reviews/scope-description-flow-review.md` for non-phase-based reviews)

---

## 4. Gap Resolution Protocol

When the flow-trace review identifies a gap, the resolution must be one of:

1. **Amend the execution plan** — add or strengthen task ownership, acceptance criteria, or boundary case handling
2. **Revise upstream document** — if the gap reveals a SPEC/SCHEMA ambiguity, resolve it in the upstream document first, then amend the plan
3. **Add an explicit defer note** — if the flow is intentionally out of scope, add a defer note with rationale to Cross-Cutting Concerns or the relevant task

**Never proceed to implementation with known unresolved gaps.** Re-run the review on affected sections after amendments. Surface to user if review loop exceeds 3 iterations.

---

## 5. User-Visible Verification

### Purpose

Reduce false completion by making "done" concretely verifiable for user-facing tasks.

### How it works

- User-facing tasks (those that change user-visible behavior) are identified by their **acceptance criteria** — written as verification questions describing **user-visible outcomes confirmable in the running app**. This is the load-bearing convention in this project.
- The `Visibility: User-facing` tag is **optional** here: the execution plan has historically relied on these observable acceptance criteria rather than the tag, and closing-phase Step 2.5 identifies user-facing tasks by them. Add the tag only if the project later adopts tagging as a convention.
- Verification happens close to implementation time — per task or per small flow cluster (2-3 tightly related tasks completing one user-visible flow)
- The closing-phase skill confirms verification was completed, but does not duplicate it

### Observable acceptance criteria examples

**Good (observable):**
- "Click + at Level 1-2 → Node/Bit chooser popover appears with two options"
- "In edit mode, click a Node → EditNodeDialog opens with pre-populated title, icon, color"
- "When grid has 96 items (full), click + → toast appears: 'Grid is full'"
- "Calendar button displays a colored dot when any active item has a deadline within 3 days"

**Bad (not observable):**
- "Urgency dot appears on Calendar button" (when? what triggers it? what does it look like?)
- "BitCard shows completion state" (what does completion look like? strikethrough? gray? both?)
- "Creation flow works at all levels" (what specifically happens at each level?)

---

## 6. Architecture Conformance Checklist

This checklist is **project-specific**. It is derived from the project's SPEC and CLAUDE.md architecture rules. The closing-phase skill reads this section and enforces checks at two levels.

### Tier: Blocking

Violations of core architectural invariants. **Must be fixed before close-out / merge**, or the standard itself must be explicitly amended/deferred by the user.

#### Core Project Architecture

- [ ] **DataStore facade:** No component or hook imports `dexie` directly for data access. All data access goes through `DataStore` interface methods. Only `src/lib/db/indexeddb.ts` imports Dexie — exception: `src/hooks/*.ts` may import `liveQuery` from `dexie` for reactive subscriptions (this is the intended reactive-layer pattern).
- [ ] **Reactive reads:** All data reads that feed UI use `liveQuery` for reactivity. No one-time fetches for data that should be live (parent nodes, breadcrumbs, calendar items).
- [ ] **URL-driven navigation:** Routes follow canonical pattern: `/` (L0), `/grid/[id]` (L1+), `?bit=[id]` (popup). No programmatic state-based routing that bypasses URL.
- [ ] **Zod write-boundary:** Zod validation at write boundary only (`createNodeSchema.parse()`, `createBitSchema.parse()`, etc.). No read-path validation.
- [ ] **State separation:** UI state in Zustand stores (`src/stores/`). Data state in hooks (`src/hooks/`). No mixing — hooks don't import Zustand, stores don't import DataStore.
- [ ] **Hook API boundary:** UI components import hooks, not DataStore. Hooks are the reactive data boundary.
- [ ] **Lifecycle active-filter (archive sweep):** Every "active items" query filters `archivedAt = null` alongside `deletedAt = null` (L0 grid rendering also excludes `hiddenFromGrid = true`). Covers grid contents, node completion, calendar items, items pool, badge, global urgency, text search, grid occupancy, aging. Trash queries key off `deletedAt` only. (Added Batch 1 — SCHEMA.md Key Queries.)
- [ ] **System-managed field guard:** `createNodeSchema` / `createBitSchema` never accept `systemRole`, `hiddenFromGrid`, or `archivedAt`. These are set only by system seeding (internal full-schema path) or the archive hooks — never from a user-facing create path. (Added Batch 1.)
- [ ] **System node lifecycle exclusion:** System nodes (`systemRole !== null`) are never soft-deleted/trashed or archived (Hooks 4 and 10). "Remove from grid" uses `hiddenFromGrid = true`; the sidebar still lists them. (Added Batch 1.)

#### Inbox/Triage Data And Mutation Conformance

- [ ] **Durable candidate boundary:** Breakdown rows live in `scratchBreakdowns`; staged Node/Bit candidates live in `triageStagedCandidates`. Zustand may hold disposable selection, pending presentation, search interruption, and page-session placement metadata, but it must not duplicate durable candidate lifecycle. Breakdown rows and candidates do not participate in Bit auto-completion.
- [ ] **Bit revision coverage:** Every Bit create path initializes `version = 1`. Every repository write that changes an existing Bit's content, position, completion, or lifecycle increments `version` exactly once for the logical mutation, including direct writes and Hook 1, Hook 3, Hook 10, Hook 11, or other cascade-driven writes. Closing review must detect both missing and double increments. User-facing schemas cannot set `version`; general Node records remain outside this revision scope.
- [ ] **Conditional-write contract:** Scratch-title, Breakdown-row, and candidate mutations compare the captured `version` and required lifecycle predicates inside the authoritative transaction. `mtime` is presentation data, not a concurrency token. Commands return the shared `applied` / `already_applied` / `conflict` / `invalid` / `not_found` result family with authoritative records or state needed for reconciliation.
- [ ] **Atomic Triage commands:** Stage, Unstage, staged/direct Placement, source-aware Undo, and Archive are repository-owned atomic commands. Components and hooks must not compose partial domain writes. Stable operation and target IDs make retries idempotent; an unknown outcome is resolved from authoritative postconditions before the UI reports success or failure.
- [ ] **Archive evidence guard:** Inbox/Triage completion and Archive eligibility require an active Scratch, at least one persisted consumed row (`consumedAt !== null`), zero unconsumed rows, and zero staged candidates. Empty history, all-staged rows, or rows removed without consumption never satisfy completion; do not rely on empty-array `every()` behavior.

#### Inbox/Triage Search And Session Projection

- [ ] **Dedicated Explorer query:** Whole-hierarchy Inbox/Triage search uses the dedicated ancestor-chain/breadcrumb result contract. It must not reuse global `searchAll()` or mutate the normal Grid route/path model. Search interruption, result reveal, stale-result handling, and normal-column restoration follow SPEC.md.
- [ ] **Page-session Newly Placed boundary:** Newly Placed styling, pinning, provenance, and Undo eligibility are transient projections owned by the mounted Inbox/Triage page. Scratch, Grid-column, theme, and locale changes preserve them; route exit or reload ends them. No `newlyPlaced` field is persisted on Node, Bit, Breakdown, or candidate records.
- [ ] **Source-aware Undo:** Undo validates the created result and dependencies before mutation. A staging-source Undo atomically restores the durable candidate and source row; a direct-source Undo restores only the source row. Non-reversible results remain ordinary records and lose only the temporary Undo affordance.

#### Theme Realization And Prototype Promotion

- [ ] **Shared production ownership:** Inbox/Triage uses shared production components and one semantic state contract. Do not promote duplicated prototype routes, mock stores, variant switchers, test toggles, separate candidate drag handles, or route-local mutation logic.
- [ ] **Theme id non-branching:** Components do not branch on `data-color-theme` except the theme picker. Theme differences flow through semantic CSS variables, shared `.theme-*` classes, and documented surface hooks; display aliases remain centralized copy rather than design tokens.
- [ ] **Recipe and token fidelity:** Theme-aware surfaces consume `DESIGN_TOKENS.md` and the approved Inbox/Triage surface recipe for their owned state. Prototype magic values are not copied into component branches. Selected, staged, invalid, pending confirmation, Newly Placed, and completed remain visually distinguishable through non-color cues; repeated blink, pulse, or flicker is prohibited.
- [ ] **Eight-theme verification:** User-visible Inbox/Triage work is checked in all eight themes at the required desktop/mobile and light/dark coverage, including contrast, `focus-visible`, reduced motion, hidden-scrollbar keyboard scrolling, section-scoped overlays, and recipe-specific visual facts. Browser evidence and flow tests use the repeatable paths defined in SPEC.md and EXECUTION_PLAN.md.
- [ ] **Centralized copy boundary:** Shared English product labels, status text, accessible names, and theme-specific display aliases are owned centrally rather than duplicated across theme realizations. KR resources, the EN/KR toggle, and Korean typography remain separate deferred work until their own approved plan.

### Tier: Advisory

Important issues that should be surfaced and recorded, but do not automatically block closing. Closing continues with explicit acknowledgement.

- [ ] **Optimistic UI:** No loading states, spinners, or skeleton screens for local data operations. Local-first means zero-latency.
- [ ] **File organization:** New files follow key path conventions from CLAUDE.md (utils in `src/lib/utils/`, hooks in `src/hooks/`, stores in `src/stores/`). New Batch 1 component domains: `src/components/quick-capture/`, `src/components/triage/`, `src/components/archive/`.
- [ ] **Local-first presentation:** Pending and reconciliation states should preserve usable local content rather than replace whole surfaces with generic loading UI. Any waiting indicator must correspond to a real unresolved command, not routine Dexie latency.

### Updating this checklist

When SPEC or CLAUDE.md architecture rules change, update this checklist to match. The checklist should always reflect the current intended architecture. When adding new items, explicitly assign them to Blocking or Advisory.

---

## Phase 8 Verification Note

Phase 8 is a pilot for surface recipe-based implementation fidelity. At closing:
- Take screenshot(s) of the Bit Detail surface in light and dark mode
- Compare against `docs/DESIGN_TOKENS.md` § Surface Recipes → Bit Detail Surface
- Compare against `references/bitdetail0.png`
- Fix clear, meaningful deviations only — do not iterate beyond one correction pass
- Record the implementation/verification findings in `docs/reviews/phase-8-workflow-pilot-record.md`
- Before considering Phase 8 fully closed, write a workflow update recommendation based on the pilot evidence

---

## Origin

This standard was developed from a comprehensive omission audit of the GridDO project (2026-03-26). The audit identified 20 items across five tiers, including plan omissions, false completions, and implementation deviations. See `docs/OMISSION_AUDIT.md` for the full remediation record.

The key lesson: the biggest risk in document-driven development is not missing implementation — it is that behaviors promised in PRD/SPEC often do not get strong enough ownership in EXECUTION_PLAN.md, especially around interaction details that look inferable but are not safe to leave implicit.
