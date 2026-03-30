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

- Tasks that change user-visible behavior are tagged `Visibility: User-facing` in the execution plan (internal tasks left untagged)
- Acceptance criteria for user-facing tasks are written as **observable verification questions** that can be confirmed by looking at the running app
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

- [ ] **DataStore facade:** No component or hook imports `dexie` directly for data access. All data access goes through `DataStore` interface methods. Only `src/lib/db/indexeddb.ts` imports Dexie — exception: `src/hooks/*.ts` may import `liveQuery` from `dexie` for reactive subscriptions (this is the intended reactive-layer pattern).
- [ ] **Reactive reads:** All data reads that feed UI use `liveQuery` for reactivity. No one-time fetches for data that should be live (parent nodes, breadcrumbs, calendar items).
- [ ] **URL-driven navigation:** Routes follow canonical pattern: `/` (L0), `/grid/[id]` (L1+), `?bit=[id]` (popup). No programmatic state-based routing that bypasses URL.
- [ ] **Zod write-boundary:** Zod validation at write boundary only (`createNodeSchema.parse()`, `createBitSchema.parse()`, etc.). No read-path validation.
- [ ] **State separation:** UI state in Zustand stores (`src/stores/`). Data state in hooks (`src/hooks/`). No mixing — hooks don't import Zustand, stores don't import DataStore.
- [ ] **Hook API boundary:** UI components import hooks, not DataStore. Hooks are the reactive data boundary.

### Tier: Advisory

Important issues that should be surfaced and recorded, but do not automatically block closing. Closing continues with explicit acknowledgement.

- [ ] **Optimistic UI:** No loading states, spinners, or skeleton screens for local data operations. Local-first means zero-latency.
- [ ] **File organization:** New files follow key path conventions from CLAUDE.md (utils in `src/lib/utils/`, hooks in `src/hooks/`, stores in `src/stores/`).

### Updating this checklist

When SPEC or CLAUDE.md architecture rules change, update this checklist to match. The checklist should always reflect the current intended architecture. When adding new items, explicitly assign them to Blocking or Advisory.

---

## Origin

This standard was developed from a comprehensive omission audit of the GridDO project (2026-03-26). The audit identified 20 items across five tiers, including plan omissions, false completions, and implementation deviations. See `docs/OMISSION_AUDIT.md` for the full remediation record.

The key lesson: the biggest risk in document-driven development is not missing implementation — it is that behaviors promised in PRD/SPEC often do not get strong enough ownership in EXECUTION_PLAN.md, especially around interaction details that look inferable but are not safe to leave implicit.
