# Promotion Map: Batch 2 — Theme System, Calendar, Grid, Inbox/Triage Polish

> Sources:
> - `docs/brainstorming/2026-05-28-theme-system-and-calendar-theming/DECISION.md`
> - `docs/brainstorming/2026-05-28-inbox-triage-theme-variants/DECISION.md`
> - `docs/recipes/inbox-triage-batch2-visual-recipe.md`
> - `docs/issues/Issues_Deferred.md`
> Date: 2026-06-23
> Status: Amendment complete (Steps 0–7); ready for `/execute-next-phase`. Amendment flow review PASS: `docs/reviews/amendment-batch2-theme-calendar-inbox-flow-review.md`.
>
> Workflow note: This is a workflow correction — future promotion-map approval should be explicit before canonical edits begin. Existing edits are being reconciled through this checkpoint.

## Promotion Scope

Promoted in this round:

- 8-theme color system: runtime theme axis, theme values, theme-aware font/radius/border/shadow contracts, and theme picker behavior.
- Themed grid visuals: grid cells and card visuals should consume the theme system with high visual fidelity to the prototype.
- Calendar redesign: shared calendar header, theme-aware monthly/weekly visuals, tighter monthly grid, today indicator, first-of-month label treatment, and popup/focus-visible polish.
- Inbox/Triage Batch 2 visual and interaction polish: Scratch Pool expanded/collapsed redesign, selected Scratch context, scoped hierarchy search, section-label removal, hierarchy gap removal, invalid drop-state softening, and `ArchiveScratchBar` visual integration.
- Relevant deferred issues from Phases 14 and 18 that align with this visual/theme pass.

Explicitly out of scope:

- Archive `⋯` trigger UX follow-up (`ISSUE-19-01`) — user wants to reconsider the interaction model separately.
- Global app search — hierarchy search is scoped to the active hierarchy section only.
- Full-row Breakdown dragging — rejected; grip-only dragging remains canonical.
- Scratch modal focus-trap / hover-race issues — dedicated a11y/modal follow-up, not Batch 2.
- DataStore architecture cleanup and global duplicate title policy — unrelated to this visual/theme promotion.
- Direct wholesale replacement from prototype files — implementation must patch current Phase 19 code.

## Source Intake

| Source | Type | Decision | Scope | Provenance |
|---|---|---|---|---|
| `2026-05-28-theme-system-and-calendar-theming/DECISION.md` | Product Decision | Adopt | 8-theme system, theme runtime direction, calendar redesign direction | `Readiness: draft`; user approved promotion intake on 2026-06-23 |
| `prototype/future-ideas` commit `64e5236` | Design Source (+ runtime pattern reference) | Partial Adopt | color theme runtime pattern, theme values, theme picker pattern — **patch/reimplement into current app; no prototype code merge dependency** | `git show --name-only 64e5236` verified files: `themes.css`, theme store/provider/toggle, layout/provider/sidebar integration |
| `prototype/future-ideas` commit `5b3d3c0` | Design Source | Adopt | themed grid visual treatment | `git show --name-only 5b3d3c0` verified grid-cell/node-card files |
| `prototype/future-ideas` commit `59ee937` | Design Source (+ shared-header component reference) | Partial Adopt | calendar shared header and themed monthly/weekly visual redesign — **patch/reimplement into current app; no prototype code merge dependency** | `git show --name-only 59ee937` verified calendar layout/monthly/weekly/header/day-column/store files |
| `2026-05-28-inbox-triage-theme-variants/DECISION.md` | Product Decision | Reference-only | 8 Inbox/Triage visual explorations; source facts only | `Readiness: draft`; promotion intake decisions appended 2026-06-23 |
| `prototype/future-ideas` commit `d963807` | Exploratory Source | Reference-only | raw Inbox/Triage visual variants | `git show --name-only d963807` verified 8 prototype routes under `src/app/prototype/(inbox-triage)/` |
| `docs/recipes/inbox-triage-batch2-visual-recipe.md` | Design Source | Adopt | normalized Inbox/Triage visual and interaction recipe | drafted from prototype/current/deferred issue review; user-approved decisions on 2026-06-23 |
| `docs/issues/Issues_Deferred.md` | Issue Index | Partial Adopt | Batch-aligned deferred visual/a11y/search items | active deferred index after Phase 19 |

Maturity note:

- Both 2026-05-28 DECISION files are marked `Readiness: draft`.
- User explicitly confirmed the Batch 2 promotion decisions on 2026-06-23 after detailed source/current-code review.
- Draft maturity is accepted for this promotion map, but canonical amendments must preserve traceability to the confirmed intake decisions.

## Prototype Variant Area Selection

| Area | Adopt from / Signal | Type | Target | Status / Notes |
|---|---|---|---|---|
| 8-theme visual identity | Prototype theme values in `64e5236` plus user confirmation that the 8 themes are visually mature | Token implication + Visual recipe | `DESIGN_TOKENS.md`; recipe required | Adopt. Preserve fonts, colors, radius, borders, shadows, and theme character as closely as practical. |
| Theme runtime | Prototype store/provider/toggle in `64e5236` | Runtime pattern reference (no merge dependency) | `SPEC.md`; later `EXECUTION_PLAN.md` | Partial Adopt. Patch/reimplement into current app; do not wholesale-copy. |
| Themed grid visuals | `5b3d3c0` grid-cell/node-card changes | Visual recipe | recipe required; `DESIGN_TOKENS.md` token contracts | Adopt. High visual fidelity is acceptable. |
| Calendar redesign | `59ee937` calendar header/monthly/weekly changes | Visual recipe + shared-header component reference (no merge dependency) | recipe required; `SPEC.md`; `DESIGN_TOKENS.md` | Partial Adopt. Use as visual target and patch current calendar code. |
| Inbox/Triage variants | `d963807` 8 static prototype routes | Reference only | `docs/recipes/inbox-triage-batch2-visual-recipe.md` already normalizes accepted facts | Raw variants are not implementation sources. |
| Scratch Pool expanded search + icon-only sort | User-confirmed intake decision | Interaction decision | `SPEC.md`; later `EXECUTION_PLAN.md` | Resolved. Expanded only; search title-only; sort by `createdAt`; icon-only control with aria-label and tooltip. |
| Scratch Pool collapsed switcher | Prototype signal + user-confirmed intake decision | Interaction decision | `SPEC.md`; later `EXECUTION_PLAN.md` | Resolved. Compact scratch switching in collapsed mode; no search/sort in collapsed mode. |
| Selected Scratch context | Prototype signal + deferred `ISSUE-18-19` + user correction | Interaction + Visual recipe | `SPEC.md`; Inbox/Triage recipe | Adopt improved treatment. Prototype treatment is too small and is not copied. |
| Breakdown full-row drag | Prototype signal | Discard | Non-Promoted | Rejected. Grip-only drag remains canonical; improve grip visibility/hit target only. |
| Visible developer section labels | Prototype and current implementation both contain labels | Discard / Removal instruction | `SPEC.md`; Inbox/Triage recipe | Remove visible labels from final Inbox UI. Internal names and a11y labels may remain. |
| Hierarchy active-section search | User-confirmed intake decision | Interaction decision | `SPEC.md`; later `EXECUTION_PLAN.md` | Resolved. Query persists; **persistent filter indicator (query + scoped section + result count + clear) is primary, flash/highlight secondary** on active-section change. |
| Invalid drop state too destructive | Deferred `ISSUE-18-20` | Visual recipe | `DESIGN_TOKENS.md` or `SPEC.md` state guidance | Adopt. Replace destructive red with muted/unavailable visual language. |
| Calendar focus-visible polish | Deferred Phase 14 note | Accessibility polish | `SPEC.md`; later `EXECUTION_PLAN.md` | Adopt into calendar/a11y polish. |
| Calendar `toSorted` / `useMemo` recheck | Deferred Phase 14 note | Performance review | later `EXECUTION_PLAN.md` | Adopt as a recheck item only if calendar list/render cost is relevant during implementation. |

## Adoption Slot Map

```
System: Color Theme Runtime
  theme axis          → theme-system DECISION (Adopt)
  runtime pattern     → prototype commit 64e5236 (Partial Adopt)
  theme picker        → prototype commit 64e5236 (Partial Adopt)
  persistence model   → prototype commit 64e5236 (Partial Adopt; current-app compatibility required)

Design Tokens: 8 Theme Values
  color values        → prototype commit 64e5236 (Adopt as visual target)
  typography          → prototype commit 64e5236 (Adopt as visual target)
  radius/border       → prototype commit 64e5236 (Adopt as visual target)
  depth/shadow        → prototype commit 64e5236 (Adopt as visual target)
  conflict handling   → user intake decision (explicit conflict recording; no silent normalization)

Surface: Grid
  visual style        → prototype commit 5b3d3c0 (Adopt)
  structure/behavior  → current Phase 19 app (Retain)

Surface: Calendar
  structural baseline → current Phase 19 calendar (Retain)
  visual target       → prototype commit 59ee937 (Adopt)
  shared header       → prototype commit 59ee937 (Partial Adopt)
  popup/a11y polish   → Phase 14 deferred issue (Partial Adopt)
  performance recheck → Phase 14 deferred issue (Conditional)

Surface: Inbox / Triage
  structural baseline → current Phase 19 implementation (Retain)
  visual recipe       → docs/recipes/inbox-triage-batch2-visual-recipe.md (Adopt)
  prototype variants  → d963807 routes (Reference-only)
  Scratch Pool        → intake decisions + recipe (Adopt)
  Breakdown context   → ISSUE-18-19 + recipe (Adopt)
  drag model          → current grip-only model (Retain)
  Hierarchy search    → intake decisions + recipe (Adopt)
  invalid drop state  → ISSUE-18-20 + recipe (Adopt)

  realization (Resolved 2026-06-23):
    selected Scratch context visual treatment → top-left compact context strip, visually distinct from Breakdown rows
    collapsed Scratch switcher shape → short vertical pills (selected longer/higher-contrast, inactive shorter/muted)
```

No unresolved true slot conflicts remain.

The main reconciliation rule is: prototype visual targets must be patched onto the current Phase 19 implementation baseline. Prototype structure does not override current canonical functionality unless explicitly listed above.

## Visual Recipe Artifacts

| Source | Realization | Recipe Path | Status | Notes |
|---|---|---|---|---|
| `64e5236` + `5b3d3c0` | 8-theme system + themed grid visuals | `docs/recipes/theme-system-and-grid-batch2-visual-recipe.md` | drafted (Step 0.75) | Extracts theme ids, runtime axis, font/radius/border/shadow/color contracts, grid visual mapping, and conflict-reporting rule. Visual evidence may still be useful during implementation smoke. |
| `59ee937` | Theme-aware calendar redesign | `docs/recipes/calendar-batch2-visual-recipe.md` | drafted (Step 0.75) | Extracts shared header, monthly/weekly layout, today marker, first-of-month labels, calendar token usage, retained current behavior, and calendar deferred issue intake. Visual evidence may still be useful during implementation smoke. |
| `d963807` + current Phase 19 triage + user intake decisions | Inbox/Triage polish | `docs/recipes/inbox-triage-batch2-visual-recipe.md` | drafted (Step 0.75) | Drafted before this map to resolve source/current-code mismatches; retained as the normalized Inbox/Triage recipe. |

## Decision Mapping

```
8-theme runtime and theme picker
  → SPEC.md § Architecture Decisions (Decision 17 — color theme axis) + Routes (sidebar Color Theme toggle)
  → DESIGN_TOKENS.md § Color Theme System (Runtime Tokens, Theme Picker)
  → EXECUTION_PLAN.md (implementation phase only after canonical approval)

Theme token values and theme character
  → DESIGN_TOKENS.md § Color Theme System (Theme IDs table, Theme Variable Groups)
  → DESIGN_TOKENS.md § Color Theme System / Required Theme Classes
  → DESIGN_TOKENS.md § Color Theme System / Exact Theme Values (source of record)

Themed grid visuals
  → SPEC.md § Routes / `/` (Level 0 Grid) — grid visual
  → DESIGN_TOKENS.md § Color Theme System / Required Theme Classes (.theme-grid-line, .theme-node-card)
  → EXECUTION_PLAN.md (grid theme implementation task)

Calendar redesign
  → SPEC.md § Routes / `/calendar/weekly` + `/calendar/monthly`
  → DESIGN_TOKENS.md § Calendar Visual Theme Contract
  → EXECUTION_PLAN.md (calendar header/monthly/weekly implementation tasks)

Calendar popup focus-visible styling
  → SPEC.md § Routes / `/calendar/monthly` (popup focus-visible)
  → EXECUTION_PLAN.md (calendar polish/a11y task)

Calendar performance recheck
  → EXECUTION_PLAN.md (conditional implementation/review task)

Scratch Pool expanded/collapsed redesign
  → SPEC.md § Inbox / Triage Workspace (Scratch Pool)
  → DESIGN_TOKENS.md § Inbox / Triage Batch 2 Surface Contract (Scratch Pool)
  → EXECUTION_PLAN.md (Scratch Pool implementation task)

Scratch Pool search and sort
  → SPEC.md § Inbox / Triage Workspace (Scratch Pool)
  → EXECUTION_PLAN.md (Scratch Pool interaction task)

Selected Scratch context
  → SPEC.md § Inbox / Triage Workspace (Breakdown)
  → EXECUTION_PLAN.md (Breakdown context task)

ArchiveScratchBar visual integration
  → SPEC.md § Inbox / Triage Workspace (Breakdown)
  → DESIGN_TOKENS.md § Inbox / Triage Batch 2 Surface Contract (Breakdown)
  → EXECUTION_PLAN.md (Breakdown visual task)

Hierarchy active-section search
  → SPEC.md § Inbox / Triage Workspace (Hierarchy Explorer)
  → EXECUTION_PLAN.md (Hierarchy search implementation task)

Visible developer-label removal
  → SPEC.md § Inbox / Triage Workspace (Visible labels)
  → DESIGN_TOKENS.md § Inbox / Triage Batch 2 Surface Contract (Removed Visible Labels)
  → EXECUTION_PLAN.md (Inbox/Triage polish task)

Invalid drop state softening
  → SPEC.md § Inbox / Triage Workspace (DnD states)
  → DESIGN_TOKENS.md § Inbox / Triage Batch 2 Surface Contract (DnD States)
  → EXECUTION_PLAN.md (DnD visual state task)
```

## Open Question Disposition

| Question | Classification | Notes |
|---|---|---|
| Whether to use prototype code directly or patch current app | Resolved | Patch current Phase 19 code. No wholesale replacement. |
| Whether 8 theme visuals should be redesigned | Resolved | Preserve prototype theme visuals as closely as practical. |
| Whether Inbox/Triage raw variants are implementation source | Resolved | Reference-only. Use normalized recipe and current implementation baseline. |
| Whether Breakdown rows become full-row draggable | Resolved | No. Grip-only remains canonical. |
| Whether visible developer labels remain | Resolved | Remove visible labels from final Inbox UI; internal/a11y labels may remain. |
| Whether hierarchy search is global | Resolved | No. Active hierarchy section only. |
| Whether search query clears on hierarchy section change | Resolved | No. Query persists; **persistent filter indicator (query + scoped section + result count + clear) is primary**, flash/highlight secondary when active section changes. |
| Whether Scratch sort appears in collapsed mode | Resolved | No. Expanded only. Icon-only control. |
| Scratch Pool auto-collapse trigger | Resolved | Adopt `ISSUE-18-17` (restores original design intent): Scratch selection and Breakdown focus/click alone do not collapse; collapse fires on the first Breakdown keystroke while a Scratch is selected; manual re-expand respected for the current Scratch session (auto-collapse re-arms when the selected Scratch changes). Recorded as the one deliberate Phase 19 behavior exception (SPEC Decision 18). |
| Selected Scratch context — visual treatment | Resolved | Top-left compact context strip inside the Breakdown section: Scratch/Inbox-family icon + selected Scratch title + optional relative-time/meta, visually distinct from rows through surface tone, border or left accent, smaller type, and spacing; not draggable or row-like. |
| Collapsed Scratch switcher shape | Resolved | Use short vertical pills, not dots. Each pill represents one active Scratch; selected pill is longer/higher-contrast, inactive pills are shorter/muted, no visible text, accessible labels/tooltips expose Scratch titles. |
| Archive `⋯` trigger UX | Deferred | `ISSUE-19-01`; user wants separate reconsideration. |
| Scratch modal focus trap / hover race | Deferred | Out of Batch 2 unless explicitly added later. |
| Duplicate title policy | Deferred | Product policy, unrelated to this visual/theme pass. |

No Blocking questions remain for PROMOTION_MAP approval.

## Canonical Drift Restorations (2026-06-23 remediation)

These pre-existing canonical details were dropped or weakened by the initial Batch 2 amendment **without** a recorded replacement decision. They are restored because amendment mode preserves existing content unless the map says it is being replaced. Source authority cited per row.

| Restored item | Original value | Source | What happened |
|---|---|---|---|
| Scratch relative-time label | `2h ago` / `yesterday` / `2 days ago` / `6 days ago` / `m/dd/yy` | `phase-17.md:40`, `phase-17-flow-review.md:20`, `2026-04-28-inbox-triage-workspace/DECISION.md:68` | dropped in SPEC Scratch Pool rewrite (F1 restores) |
| Scratch Pool default order | newest-first by `createdAt` | `phase-17.md:42`, `phase-17-flow-review.md:20` | only the sort toggle survived; default order left unstated (F1 restores) |
| Node/Bit staging shape distinction | `Node = icon-centered object`; `Bit = text-centered row/card` | `2026-04-28-inbox-triage-workspace/DECISION.md:206-209` | weakened to "remain visually distinct"; contradicted the still-present Layout-ratios line. **Restored 2026-06-23 (F3)** — SPEC Node/Bit Staging now states `Node = icon-centered object`, `Bit = text-centered row/card`, consistent with Layout-ratios. |

The Node/Bit row is applied in the F3 step; listed here for a single restoration ledger.

## Canonical Doc Edit Plan

```
Document              Action   Status    Notes
SCHEMA.md             skip     skipped   skip-if: n/a — no IndexedDB schema/store changes are promoted in Batch 2.
SPEC.md               edit     done      Add theme runtime/user setting behavior; calendar redesign contract; Inbox/Triage
                                         Batch 2 surface rules; scoped hierarchy search; selected Scratch context;
                                         visible-label removal; focus-visible/accessibility notes.
DESIGN_TOKENS.md      edit     done      Add/normalize 8-theme token contracts, theme axis, typography/radius/border/shadow
                                         mappings, grid theme usage, calendar tokens, Inbox/Triage state/token guidance.
EXECUTION_PLAN.md     edit     done      Added implementation-only Phases 20-22 derived from SPEC/DESIGN_TOKENS/recipes;
                                         tasks must reference recipe paths, not prototype worktree paths.
PLANNING_STANDARD.md  edit     done      Added 3 Batch 2+ theme-implementation Advisory conformance items (theme-id non-branching, CSS-var consumption, 8-theme smoke).
```

## Deferred Issue Disposition

Explicit disposition for every theme / calendar / Inbox-Triage-adjacent deferred or follow-up issue in `docs/issues/Issues_Deferred.md` (closes the "neither adopted nor excluded" gap). Non-adjacent deferred items on other surfaces (e.g., `Issues_Phase_3` Issue 5 — `CreateNodeDialog` icon-picker a11y) are out of this promotion's surface and unchanged. Detail lives in the cited canonical/recipe locations.

| Issue | Disposition | Reflected in |
|---|---|---|
| `ISSUE-18-19` Breakdown selected-Scratch context | **Adopt** (Batch 2) | Area Selection; SPEC Breakdown; exact visual treatment resolved as top-left compact context strip |
| `ISSUE-18-20` invalid drop state too destructive | **Adopt** (Batch 2 — muted/unavailable state) | Area Selection; SPEC DnD states; DESIGN_TOKENS |
| `ISSUE-18-21` hierarchy search bar missing | **Resolved by this promotion** — scoped active-section search is now canonical | SPEC Hierarchy Explorer; recipe |
| Phase 14 popup `focus-visible` | **Adopt** (Batch 2 calendar/a11y polish) | Area Selection; SPEC Calendar; recipe |
| Phase 14 `toSorted` / `useMemo` | **Conditional recheck** (only if render cost is measurable) | Area Selection; recipe |
| `ISSUE-18-18` add-note keeps focus after Enter | **Adopt** (Batch 2 — keyboard flow; `Cmd+K` exception) | SPEC Breakdown |
| `ISSUE-18-16` staged → Breakdown drop-to-remove | **Deferred** — DnD interaction follow-up, not this visual/theme pass | Non-Promoted Items |
| `ISSUE-16-02` / `ISSUE-16-03` Scratch modal focus-trap / hover-race | **Deferred** — dedicated a11y/modal follow-up | Non-Promoted Items |
| `ISSUE-19-01` archive `⋯` trigger UX | **Deferred** — separate interaction-model reconsideration | Promotion Scope (out of scope) |
| `ISSUE-18-22` duplicate title policy | **Deferred** — product policy, unrelated | Non-Promoted Items |
| `ISSUE-18-17` Scratch pool fold trigger | **Adopt** (F1) — realigned to first-Breakdown-keystroke; see Open Question Disposition + SPEC Decision 18 | SPEC Scratch Pool |
| `ISSUE-18-08` remove-from-staging entry/exit fade/scale | **Conditional** — align with the Batch 2 visual language if the remove-from-staging controls are touched; otherwise deferred polish (recipe Staging hook) | recipe Staging; SPEC |
| `ISSUE-18-09` remove-target border/transition + Archive ring-offset | **Conditional** — align if the remove / `ArchiveScratchBar` affordance is touched in Batch 2; otherwise deferred polish | recipe Staging; SPEC DnD states |

## Non-Promoted Items

| Item | Type | Reason |
|---|---|---|
| `d963807` raw Inbox/Triage prototype routes as direct implementation source | Exploratory Source | Reference-only; current Phase 19 functionality differs and user required normalized recipe instead of direct copy. |
| Full-row Breakdown dragging from Inbox/Triage prototypes | Interaction idea | Rejected; grip-only dragging remains canonical. |
| Visible prototype/current section labels (`Scratch Pool`, `Breakdown / Scribble`, `Staging`, `Hierarchy Explorer`) | Visual text pattern | Rejected for final UI; internal/a11y naming may remain. |
| Archive `⋯` trigger UX follow-up (`ISSUE-19-01`) | UX follow-up | Deferred; user wants to rethink interaction model separately. |
| Scratch modal focus trap / trigger restoration (`ISSUE-16-02`) | Accessibility follow-up | Not part of Batch 2 theme/calendar/inbox recipe. |
| Scratch modal hover-race (`ISSUE-16-03`) | Interaction follow-up | Not part of Batch 2 theme/calendar/inbox recipe. |
| DataStore direct-import cleanup (`Issues_Phase_3.md` Issue 6) | Architecture cleanup | Not related to visual/theme promotion. |
| Duplicate title policy (`ISSUE-18-22`) | Product policy | Deferred until title uniqueness policy is decided. |
| Staged candidate → Breakdown drop-to-remove (`ISSUE-18-16`) | Interaction follow-up | Deferred; DnD interaction follow-up, not part of the Batch 2 visual/theme pass. |
