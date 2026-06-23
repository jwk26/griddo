# Batch 2 Execution Plan Rationale Report

Date: 2026-06-24
Branch context: `docs/batch-2-pre-promotion`
Scope: Writing-documents amendment mode Step 4 — derive implementation-only execution phases from approved canonical docs and recipes.

## Summary

The execution plan now adds three implementation phases:

- Phase 20: Batch 2 Theme System & Themed Grid
- Phase 21: Batch 2 Calendar Visual Alignment
- Phase 22: Batch 2 Inbox / Triage Visual & Interaction Polish

The phases are derived from `SPEC.md`, `DESIGN_TOKENS.md`, `PROMOTION_MAP.md`, and the three visual recipes. They do not copy source batch labels or prototype structure directly.

## Why Three Phases

The split follows dependency order, not source-document order.

Phase 20 comes first because it creates the color-theme runtime, exact CSS variable layer, shared theme classes, and grid consumption. Calendar and later visual work depend on those variables and classes existing. Putting grid in the same phase is intentional: grid is the lowest-risk first consumer of `.theme-grid-line` and `.theme-node-card`, and it verifies the theme contract before Calendar uses the same variable layer more heavily.

Phase 21 follows because Calendar consumes both the shared theme runtime and the calendar-specific variables. The calendar recipe also has strong current-behavior preservation requirements: existing DnD, popovers, unschedule actions, and expanded weekly columns must remain intact. A separate phase keeps those regression checks focused.

Phase 22 comes after the theme foundation because Inbox/Triage is a broader surface polish pass with interaction changes. It does not need Calendar implementation, but it benefits from the theme contract and planning-standard checks being in place. It also contains the most user-facing interaction risk, so it stays isolated from theme/runtime work.

## Why Not Copy Prototype Code

The promotion map explicitly classifies prototype commits as design sources or runtime-pattern references, not functional dependencies. The plan therefore references recipes and current app files, not prototype worktree paths.

This avoids three failure modes:

- Regressing Phase 17-19 behavior that did not exist when the prototypes were built.
- Treating unmerged prototype code as a prerequisite dependency.
- Losing traceability if the prototype branch or worktree disappears.

Each task uses the recipe path as durable visual input and patches current Phase 19 files.

## Why SCHEMA Is Not Touched

Batch 2 changes visual/runtime presentation and interaction behavior. It does not introduce new IndexedDB stores, persisted fields, indexes, or lifecycle markers. `SCHEMA.md` remains skipped in the promotion map for that reason.

Runtime theme selection uses client-side persisted UI state (`griddo-color-theme`) and an HTML attribute, not the app data model.

## Phase 20 Rationale

Phase 20 is split into four tasks:

1. Runtime axis
2. Exact CSS values and shared classes
3. Sidebar theme picker
4. Grid theme consumption

This order separates data/control flow from visual values. The store/provider/no-flash script must exist before the picker can change theme state. Exact values and shared classes must exist before grid components can consume `.theme-grid-line` and `.theme-node-card`.

The exact values are deliberately sourced from the recipe appendix, not reconstructed from summary tables. This preserves high-fidelity shadows, calendar variables, and the `griddo` base-layer model.

## Phase 21 Rationale

Calendar is isolated because it has dense behavior that must not regress:

- Weekly/monthly routing
- Drag-to-schedule
- Unschedule
- Date cell popovers
- Expanded weekly day columns
- Existing calendar tests

The shared header is first because both weekly and monthly depend on it. Monthly and weekly visual work are separate because they touch different component paths and have different acceptance criteria. Focus-visible and theme smoke are last because those checks need the visual surfaces in place first.

The calendar phase intentionally omits Day/Year views. The recipe treats those prototype disabled controls as context only, and SPEC does not promote those views.

## Phase 22 Rationale

Inbox/Triage is split by user-facing workflow area:

1. Scratch Pool
2. Breakdown
3. Staging / DnD states
4. Hierarchy Explorer / workspace integration

This mirrors how a user works through the surface while keeping each task under a coherent ownership boundary.

Scratch Pool is first because collapsed switching, search, sort, and the new auto-collapse state model affect how a Scratch is selected. Breakdown follows because first-keystroke collapse requires coordination with Scratch Pool state and because the selected Scratch context now has a resolved visual treatment. Staging and DnD state polish follow because they preserve existing placement behavior while removing developer labels and destructive-looking invalid states. Hierarchy search is last because it affects the bottom workspace area and has its own scoped-search contract.

The two previously open realization questions are no longer propagated as Phase-local OQs. They are resolved in canonical docs:

- selected Scratch context = top-left compact context strip
- collapsed Scratch switcher = short vertical pills

## Acceptance Criteria Shape

The tasks use observable acceptance criteria because Batch 2 is user-facing visual and interaction work. Examples:

- opening the theme picker shows all 8 labels and swatches
- selecting `terminal` updates `<html data-color-theme>`
- monthly today is visible as a circular date badge
- collapsed Scratch Pool shows short vertical pills
- hierarchy search filters only the active hierarchy section

The plan also preserves targeted test commands per task. This lets execution batches close with focused verification before running the broader suite.

## Intentional Deferrals

The plan does not include:

- Archive `⋯` trigger UX reconsideration (`ISSUE-19-01`)
- Scratch modal focus trap / hover race
- global app search
- full-row Breakdown dragging
- duplicate title policy
- staged candidate drop-back-to-Breakdown interaction (`ISSUE-18-16`)

These are either explicitly out of scope in the promotion map or deferred product/interaction follow-ups.

## Review Reconciliation Rationale

After Step 4 review, the plan reconciles three execution-readiness gaps before amendment flow review.

First, `src/stores/color-theme-store.ts` is the canonical store path. `SPEC.md` previously used `theme-store.ts`, while `EXECUTION_PLAN.md` used `color-theme-store.ts`. The plan keeps the more specific name because existing stores use domain prefixes (`calendar-store`, `triage-store`, `quick-capture-store`) and because the provider/toggle pair already uses `color-theme-*`. This avoids confusing the color-theme axis with `next-themes` dark/light ownership.

Second, font fidelity is now an explicit Task 89 acceptance point. The theme system does not preserve the prototype design if Terminal, Tiny Desk, Origami, Retro Mac, Neumorphism, Claymorphism, and Graphite silently collapse to one default font. The task still allows documented fallback when font loading creates build or network risk, but the fallback must be recorded instead of hidden.

Third, each task now carries a `Dependencies` line. The phases already imply order, but per-task dependencies make execution batches safer when tasks are delegated or resumed independently. This follows the older phase archive format and keeps sequence-critical work explicit.

The `Remove from staging` acceptance in Task 99 also names `ISSUE-18-16` as out of scope. That text is not a new product decision; it prevents executor confusion between the existing remove target and the deferred drop-back-to-Breakdown interaction.

## Remaining Pipeline Step

Step 6 (amendment flow review) is **complete — PASS**, recorded at `docs/reviews/amendment-batch2-theme-calendar-inbox-flow-review.md` (8/8 mandatory checks; F1–F4 fixed, F5 accepted, NF1 fixed; 0 Blocking). The flow review confirmed every promoted SPEC/DESIGN_TOKENS behavior has an execution owner, no deferred item leaked into the plan, and recipe-backed tasks reference recipe paths rather than prototype worktree paths. The next writing-documents step is **Step 7 — Summary & CLAUDE.md diff** (CLAUDE.md additions restricted to standing invariants: SPEC AD#17 color-theme axis, AD#18 Batch 2 behavior preservation).
