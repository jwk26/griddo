# Visual Recipe: Inbox / Triage Batch 2

> Source references:
> - `prototype/future-ideas` — `src/app/prototype/(inbox-triage)/inbox-triage-*/page.tsx`
> - Current implementation after Phase 19 — `src/components/triage/*`, `src/hooks/use-archive-scratch.ts`, `src/stores/triage-store.ts`
> - Deferred issues — `docs/issues/Issues_Deferred.md`, `docs/issues/Issues_Phase_18.md`
> Date: 2026-06-23
> Status: Approved pre-promotion recipe input
>
> Scope: Batch 2 Inbox / Triage visual and interaction alignment before promotion into canonical docs. This recipe is **not** an implementation phase and does **not** amend `SPEC.md`, `SCHEMA.md`, `DESIGN_TOKENS.md`, or `EXECUTION_PLAN.md` by itself.

## Purpose

Batch 2 should adopt the visual direction of the `themes2-2` / Inbox-Triage prototypes where it improves the current Inbox surface, while preserving canonical behavior already implemented in Phases 17-19.

The goal is not to copy prototype files. The goal is to extract a precise surface recipe that can be promoted through the writing-documents flow:

1. `PROMOTION_MAP.md`
2. canonical docs
3. implementation-only `EXECUTION_PLAN.md` phases

## Source Facts

### Prototype Facts

- Scratch Pool has a strong icon/count/fold control treatment.
- Collapsed Scratch Pool shows a compact inbox icon, count badge, fold/unfold control, and compact scratch item switching affordance.
- Expanded Scratch Pool shows inbox identity, count, and fold/unfold control.
- Breakdown rows in the prototype are full-row draggable.
- Breakdown area includes selected Scratch context, but the context treatment is visually too small and too weak for the current product.
- Hierarchy area includes search.
- Hierarchy columns are visually packed; there is no large visual gap between the hierarchy shell and the Home/L1/L2/L3 column set.
- Prototype variants still contain visible developer-facing section labels such as "Scratch Pool", "Breakdown / Scribble", "Staging", and "Hierarchy Explorer".

### Current Implementation Facts

- Current Scratch Pool expanded state has a visible `Scratch Pool` title and no inbox icon in the header.
- Current Scratch Pool collapsed state places the count badge over the fold control and leaves the inbox icon floating in the middle of the column.
- Current Scratch Pool has no scratch item switching control in collapsed state.
- Current Scratch Pool sorts active scratches by `createdAt` descending.
- Current Breakdown panel has no selected Scratch context.
- Current Breakdown panel already has `ArchiveScratchBar`; this is canonical and must be visually integrated.
- Current Breakdown row drag is grip-only, not full-row drag.
- Current triage layout renders visible developer section labels: `Breakdown / Scribble`, `Staging: Nodes`, `Staging: Bits`, `Hierarchy Explorer`.
- Current Hierarchy shell has extra visual padding/gap between the explorer container and the Home/L1/L2/L3 columns.
- Current Hierarchy has no search.
- Current invalid drop state can read as destructive.

## Adopted

- Use the prototype as visual direction for a denser, more polished Inbox/Triage surface.
- Adopt a stronger Scratch Pool identity in both expanded and collapsed states.
- Adopt collapsed Scratch Pool scratch switching.
- Adopt selected Scratch context in the Breakdown area, but improve its visibility instead of copying the prototype's small context text.
- Adopt Hierarchy search, scoped to the active hierarchy section.
- Adopt the prototype's tighter hierarchy column packing by removing the current unnecessary gap.
- Preserve Phase 18/19 canonical behaviors that the prototype does not know about.

## Retained

- Keep grip-only Breakdown dragging. Do **not** adopt full-row dragging from the prototype.
- Keep `ArchiveScratchBar` for the all-consumed Breakdown state.
- Keep Node/Bit staging and hierarchy DnD behavior from current implementation.
- Keep system/lifecycle rules from Phase 19.
- Keep active grid and Archive View behavior out of this recipe.

## Improved

- Scratch Pool collapsed layout must be redesigned from the current implementation: icon, count, fold/unfold control, and scratch switching should read as one intentional compact control stack.
- Scratch Pool expanded layout should include inbox identity and count without showing the literal heading "Scratch Pool".
- Selected Scratch context must be clear enough to answer "what scratch am I breaking down right now?" at a glance.
- Breakdown drag grip should become easier to notice and target, while remaining the only drag activator.
- Invalid drop states should be visually cautionary or unavailable, not destructive-red.
- Hierarchy search should visibly persist across active-section changes via a **persistent filter indicator (primary)** — active query, scoped section, result count, and a clear affordance — with a flash/highlight as a **secondary** cue when the active section changes with a non-empty query.

## Removed

- Remove visible developer-facing section headings from the final Inbox UI:
  - `Scratch Pool`
  - `Breakdown / Scribble`
  - `Node Staging`
  - `Bit Staging`
  - `Hierarchy Explorer`
- These names may remain in component names, tests, internal documentation, `aria-label`s, or visually hidden labels.
- `Home`, `L1`, `L2`, and `L3` may remain only as subtle navigation/depth context, not as prominent section headings.

## Surface Contract

### Scratch Pool — Expanded

- Show inbox identity with an icon, scratch count, and fold/unfold control.
- Do not show the literal title `Scratch Pool` as visible UI text.
- Add scratch item search in expanded mode.
- Add an icon-only asc/desc sort toggle in expanded mode.
- Sort target: scratch `createdAt`.
- Sort modes: newest-first and oldest-first.
- The sort button must have an `aria-label` and tooltip that communicate the current order and the action.
- Search target: scratch title only.
- Search and sort must not change the active Scratch data model; they only affect Scratch Pool display.

### Scratch Pool — Collapsed

- Show compact inbox identity, count badge, fold/unfold control, and scratch switching affordance.
- Provide scratch item switching through **short vertical pills**, not dots.
- Each pill represents one active Scratch. The selected Scratch pill is longer and higher-contrast; inactive pills are shorter and muted.
- Pills have no visible text. Each compact switch target needs an accessible name and tooltip with the Scratch title.
- Do not show search in collapsed mode.
- Do not show sort in collapsed mode.

### Breakdown Area

- Add selected Scratch context at the top-left of the Breakdown section.
- Render it as a compact context strip with a small Scratch/Inbox-family icon, selected Scratch title, and optional relative-time/meta in one line.
- The context strip must be visually distinct from the Breakdown rows below it through surface tone, border or left accent, smaller type scale, and spacing/separation.
- The context strip must not look draggable, row-like, or share row hover/drag affordances.
- Long Scratch titles truncate/ellipsize.
- Do not use the visible heading `Breakdown / Scribble`.
- Keep Breakdown row drag grip-only.
- Improve grip visibility and hit area.
- Keep `ArchiveScratchBar` and style it as an intentional completion affordance.
- When all breakdown rows are consumed, the archive scratch affordance should remain visible and understandable.

### Staging

- Do not show visible headings `Staging: Nodes` or `Staging: Bits`.
- Preserve separate Node and Bit staging zones.
- Use icons, subtle badges, layout, or empty-state copy to distinguish Node vs Bit staging without developer-style section labels.
- If remove-from-staging controls are touched in Batch 2, align their hover and exit treatment with the new visual language.

### Hierarchy Explorer

- Do not show visible heading `Hierarchy Explorer`.
- Remove the unnecessary gap between the explorer shell and the Home/L1/L2/L3 columns.
- Add search at the top of the hierarchy area.
- Search scope is the active hierarchy section only.
- Active hierarchy section means the deepest currently opened hierarchy section.
- If only Home/Grid0 is open, search filters Home/Grid0 Nodes/Bits only.
- If Level 2 is active, search filters Level 2 Nodes/Bits only.
- Search query persists when the active hierarchy section changes.
- A persistent filter indicator (active query + scoped section + result count + clear affordance) is the primary cue that filtering is active; when the active section changes while a query remains, a flash/highlight is a secondary cue.
- Search filters Node/Bit titles only.
- Global app search is out of scope.

### Focus, Motion, and Accessibility

- Icon-only controls require `aria-label`s and tooltips when the icon alone is not self-evident.
- All interactive controls require visible `focus-visible` styling.
- Search-query flash/highlight must respect reduced-motion preferences.
- Drag affordance improvements must not make non-draggable regions appear draggable.

## Non-Adopted Prototype Behavior

- Full-row Breakdown dragging is rejected for Batch 2.
- Visible prototype section headings are rejected.
- Prototype selected Scratch context is not copied as-is because it is too small and too weak.
- Prototype static/mock data structure is not an implementation source.

## Deferred / Out of Scope

- Archive `⋯` trigger UX follow-up (`ISSUE-19-01`) remains deferred until the interaction model is reconsidered separately.
- Scratch modal focus-trap / hover-race issues remain out of this Batch 2 recipe unless explicitly brought into scope.
- DataStore architecture cleanup remains out of scope.
- Global search remains out of scope.

## Promotion Notes

- The PROMOTION_MAP should promote this recipe as Inbox/Triage visual-contract input, not as direct implementation instructions.
- Canonical docs should capture the resulting product rules, not prototype implementation details.
- `EXECUTION_PLAN.md` should receive only implementation tasks after canonical docs are amended and approved.
