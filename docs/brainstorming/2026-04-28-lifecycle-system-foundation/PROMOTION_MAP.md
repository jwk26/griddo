# Promotion Map: Batch 1 — Lifecycle System (multi-source)

> Sources: `2026-04-28-lifecycle-system-foundation`, `2026-04-28-archive-view-and-restore`,
> `2026-04-28-quick-capture-entry-surface`, `2026-04-28-inbox-triage-workspace` DECISION.md
> (+ `2026-05-18-quick-capture-palette` as recipe source only)
> Handoff: `.omc/plans/batch1-promotion-handoff.md`
> Date: 2026-06-02
> Status: **Draft — awaiting approval gate**

> **Location note:** This is a multi-source batch map. It is co-located at the
> dependency-root topic (`lifecycle-system-foundation`) because all other Batch 1
> sources depend on this schema foundation. Relocatable to a batch-level path on request.

---

## 1. Promotion Scope

**Promoted in this round:**

- **Lifecycle schema foundation** — `systemRole`, `archivedAt`, `hiddenFromGrid`, `scratchBreakdowns` store, new indexes, Hook 10 (Archive Cascade) / Hook 11 (Archive Restore), default system nodes (Inbox, Archive View), `archivedAt = null` query changes, Scratch Bit placement exception.
- **Archive lifecycle + Archive View surface** — `archivedAt` mechanism, Archive View portal node, restore, direct-archive context menu, completion ≠ archive.
- **Quick Capture `+` entry surface** — Ideas/Create grouping, Scratch capture modal, anchored slide/fade; Cmd+K Command Palette mapping (1 = Scratch, 2 = existing Search).
- **Inbox/Triage workspace** — 4-area structure, Scratch→Breakdown→Staging→Hierarchy interaction model, staged-candidate DnD (UI-state-only, placement confirmation, remove-from-staging), compact drag token.

**Explicitly out of scope (scope boundaries — NOT unresolved blockers):**

- **Inbox/Triage visual theme realization** → Batch 2 (`themes2-2`). Batch 1 uses existing GridDO baseline UI/tokens.
- **Archive View visual realization** → Batch 1 uses existing GridDO baseline UI/tokens. No dedicated Archive View theme source exists; future global theme system may affect it via global tokens.
- **Full Grid DnD rework** → `grid-dnd-preview` is Reference-only; Batch 1 implements only the Inbox/Triage DnD partial (see Partial Implementations).
- **Search redesign** — Command Palette key `2` opens existing Search unchanged.
- **Create-modal redesign**, **node-rollup-focus-aging**, **favorites**, **quarterly-calendar-view** — not Batch 1.

---

## 2. Source Intake

| Source | Type | Decision | Scope | Provenance |
|---|---|---|---|---|
| `2026-04-28-lifecycle-system-foundation/DECISION.md` | Product Decision | Adopt | data model + behavior (schema foundation) | `code-ready`; brainstorming working tree (untracked) |
| `2026-04-28-archive-view-and-restore/DECISION.md` | Product Decision | Adopt | Archive lifecycle + Archive View surface | `code-ready` |
| `2026-04-28-quick-capture-entry-surface/DECISION.md` | Product Decision | Adopt | `+` entry surface, Scratch capture, Cmd+K mapping | `code-ready` |
| `2026-04-28-inbox-triage-workspace/DECISION.md` | Product Decision | Adopt | Triage structure + interaction + staged DnD | `code-ready` |
| `2026-05-18-quick-capture-palette/DECISION.md` | Product Decision | Reference-only | designates Command Palette recipe source; no separate function promotion | `code-ready` |
| `prototype/future-ideas` @ `e662163`, route `/prototype/quick-capture-create-variants` (`src/app/prototype/quick-capture-create-variants/page.tsx`), **`surface(main)`** variant | Design Source | Adopt | `+` entry surface visual realization | commit `e662163` (route file verified) |
| `prototype/future-ideas` @ `e662163`, **same route/page**, **palette** variant | Design Source | Adopt | Command Palette visual/interaction realization | commit `e662163` (route file verified) |
| `2026-06-02-grid-dnd-preview-and-drop-targeting/DECISION.md` | Product Decision (future idea) | Reference-only | broader Grid DnD direction; Batch 1 partial-implements | `draft` |

`NOTES.md` for each topic = supporting provenance / recovery context only (not promotion source of truth).

**Maturity:** All Adopt sources are `Readiness: code-ready` → no maturity warning gate. `grid-dnd-preview` is `draft` but Reference-only.

**Provenance note:** `docs/brainstorming/` is currently untracked on branch `out-of-phase`; sources read from working tree. The prototype route `src/app/prototype/quick-capture-create-variants/page.tsx` was verified to exist at commit `e662163`.

---

## 3. Prototype Variant Area Selection

> Applies because **one** prototype source file (`page.tsx` @ `e662163`) carries **multiple variants targeting different surfaces** — mixed area-level signal, so source-level Adopt/Skip is too coarse.
> See `~/.claude/skills/_shared/prototype-area-selection.md` for type definitions and routing.

| Area | Adopt from / Signal | Type | Target | Status / Notes |
|---|---|---|---|---|
| Quick Capture `+` entry surface | `surface(main)` region of `page.tsx` | Visual recipe | Recipe → `docs/recipes/quick-capture-entry-surface-visual-recipe.md` | Adopt. Step 0.75 extracts the `surface(main)` region only. |
| Command Palette (Cmd+K) | palette region of **same** `page.tsx` | Visual recipe | Recipe → `docs/recipes/command-palette-visual-recipe.md` | Adopt. Step 0.75 extracts the palette region of the **same file**. |
| Favorites affordance | favorites variant region of `page.tsx` | Reference only | Non-Promoted for Batch 1 | Batch 3 candidate (favorites). Not extracted in Batch 1 — retains future value, **not discarded**. |

**Core extraction task (Step 0.75):** the two adopted recipes come from a **single source file**. The critical work is identifying *which code region of `page.tsx` corresponds to which variant/surface* before extracting each into its own recipe. Flagged as a candidate skill improvement (see Workflow-Test Observations).

---

## 4. Adoption Slot Map

```
Capability: Lifecycle Foundation
  data model         → lifecycle DECISION (Adopt)   [systemRole, archivedAt, hiddenFromGrid, scratchBreakdowns, indexes]
  behavior           → lifecycle DECISION (Adopt)   [Hook 10 Archive Cascade, Hook 11 Archive Restore, query archivedAt=null, Scratch perma-delete cleanup]
  default data       → lifecycle DECISION (Adopt)   [Inbox + Archive View system nodes, first-launch/migration seeding]
  migration strategy → lifecycle DECISION (Adopt)   [additive fields with defaults; non-destructive (Dexie ignores orphans)]

Surface: Inbox / Triage Workspace
  structural baseline → inbox-triage DECISION (Adopt)   [4 areas, layout ratios]
  interaction model   → inbox-triage DECISION (Adopt)   [Scratch→Breakdown→Staging→Hierarchy; staging UI-state-only; placement confirm; remove-from-staging]
  DnD realization     → inbox-triage DECISION (Adopt) + grid-dnd (Reference-only)  — PARTIAL implementation
  visual realization  → NOT adopted in Batch 1 — use existing GridDO baseline UI/tokens until Batch 2 (theme variants). Scope boundary, not unresolved.

Surface: Archive View
  structural baseline → archive DECISION (Adopt)   [grouped-by-original-parent list, ✓ markers]
  interaction model   → archive DECISION (Adopt)   [single-item restore, BFS re-placement, warm/dignified tone]
  visual realization  → NOT adopted in Batch 1 — use existing GridDO baseline UI/tokens. No dedicated Archive View theme source exists; the future global theme system (theme-system-and-calendar-theming) may influence it via global tokens. Scope boundary, not unresolved.

Surface: Quick Capture `+` Entry Surface
  structural baseline → quick-capture DECISION (Adopt)   [Ideas/Create grouping]
  interaction model   → quick-capture DECISION (Adopt)   [anchored slide/fade; Scratch capture modal; context behavior per level]
  visual realization  → surface(main) Design Source (Adopt) → recipe

Surface: Command Palette (Cmd+K)
  interaction model   → quick-capture DECISION (Adopt)   [key 1 = Scratch, key 2 = existing Search overlay]
  visual realization  → palette Design Source (Adopt) → recipe
```

**No true slot conflicts.** The two `visual realization → NOT adopted` slots are explicitly closed by user-authorized baseline fallback (Batch 1 = existing GridDO baseline UI/tokens; theme visual = Batch 2). They are **scope boundaries**, not unresolved realization gaps, and do not require a phase-local design decision before implementation.

---

## 5. Visual Recipe Artifacts

> Required because two Adopt Design Source variants affect visual realization. Both come from the **same** source file.

| Source | Realization | Recipe Path | Status | Notes |
|---|---|---|---|---|
| `e662163` `page.tsx` — `surface(main)` region | Quick Capture `+` entry surface | `docs/recipes/quick-capture-entry-surface-visual-recipe.md` | drafted (Step 0.75) | Extract slide/fade-anchored `+` surface, Ideas/Create grouping. Read source directly; visual evidence optional. |
| `e662163` `page.tsx` — palette region | Command Palette (Cmd+K) | `docs/recipes/command-palette-visual-recipe.md` | drafted (Step 0.75) | Extract palette visual/interaction from the **same file**; region identification is the key step. |

Rules honored: recipe paths recorded before EXECUTION_PLAN amendment; EXECUTION_PLAN tasks reference recipe paths (not the worktree); recipes do not replace DESIGN_TOKENS.md (token contract still amended at Step 3).

---

## 6. Decision Mapping (section-level canonical targets)

```
systemRole (Node)
  → SCHEMA.md § Object Stores / nodes (Fields table)
  → SCHEMA.md § Object Stores / nodes (Indexes: idx_nodes_systemRole)
  → SCHEMA.md § Zod Validation Schemas (nodeSchema; NOT createNodeSchema — system-managed)
  → SPEC.md § Architecture Decisions (new AD #15: System Nodes)
  → SPEC.md § Page Layouts (new: System Node routing — /grid/[nodeId] renders Triage | Archive View by systemRole)

archivedAt (Node + Bit)
  → SCHEMA.md § Object Stores / nodes (Fields) + bits (Fields)
  → SCHEMA.md § Indexes (idx_nodes_archivedAt, idx_bits_archivedAt, compound [parentId, deletedAt, archivedAt])
  → SCHEMA.md § Zod Validation Schemas (nodeSchema, bitSchema)
  → SCHEMA.md § Application Hooks (new Hook 10 Archive Cascade, Hook 11 Archive Restore)
  → SCHEMA.md § Key Queries (consistency sweep: add archivedAt=null to ALL active-item queries)

hiddenFromGrid (Node)
  → SCHEMA.md § Object Stores / nodes (Fields)
  → SCHEMA.md § Zod Validation Schemas (nodeSchema; excluded from createNodeSchema — authority-controlled)
  → SCHEMA.md § Key Queries (L0 grid render adds hiddenFromGrid=false)
  → SPEC.md § Architecture Decisions (System Nodes AD: sidebar always shows system nodes regardless of hiddenFromGrid)

scratchBreakdowns (new store)
  → SCHEMA.md § Object Stores (new store + indexes section)
  → SCHEMA.md § Zod Validation Schemas (new scratchBreakdownSchema)
  → SCHEMA.md § Application Hooks (Hook 3 non-participation note; Scratch perma-delete cleanup)
  → SCHEMA.md § Key Queries (by-scratch ordered; bulk delete on Scratch removal)

default system nodes (Inbox, Archive View)
  → SCHEMA.md § (new "Default System Nodes" subsection)
  → SPEC.md § Architecture Decisions (System Nodes AD: first-launch/migration seeding, re-create offer)

Scratch Bit placement (x=0,y=0 sentinel; uniqueness exception)
  → SCHEMA.md § Object Stores / bits (placement note)
  → SCHEMA.md § Application Hooks (Hook 8 Grid Cell Uniqueness — exception for Inbox-parent Bits)

Staged candidate lifecycle / placement confirmation / fast path / remove-from-staging (Scope #1–#4)
  → SPEC.md § Page Layouts (new: Inbox/Triage workspace — Scratch Pool, Breakdown, Staging, Hierarchy Explorer, confirmation dialog, remove target)
  → SPEC.md § Architecture Decisions (AD #12 @dnd-kit — extend: compact token + pending-confirmation targets)
  → EXECUTION_PLAN.md (new phases; reference Reuse Targets §)
  → DESIGN_TOKENS.md § Component Usage Quick Reference (Triage components — baseline; compact drag token)

Compact drag token (Scope #5)
  → SPEC.md § Architecture Decisions (AD #12 dnd extension)
  → DESIGN_TOKENS.md § Component Usage Quick Reference (new: Compact Drag Token; compact-bit-item full-drag-surface = anti-pattern ref)

Completion → Archive (Scope #6)
  → SCHEMA.md § Application Hooks (Hook 10/11; note: completion stays computed, never auto-archives)
  → SPEC.md § Page Layouts (Archive View surface; direct-archive context menu; system nodes excluded; Scratch narrow archive exception)

Cmd+K / Command Palette + `+` entry surface (Scope #7)
  → SPEC.md § Page Layouts (new: Quick Capture `+` entry surface; Command Palette modal; Search overlay reuse)
  → SPEC.md § Routes (note: no new routes — modals + systemRole-dispatched /grid/[id])
  → DESIGN_TOKENS.md § Surface Recipes (Quick Capture Entry Surface recipe ref; Command Palette recipe ref)
  → DESIGN_TOKENS.md § Component Usage Quick Reference (Command Palette)

scratchBreakdowns vs Chunk (Scope #8)
  → SCHEMA.md § Object Stores (scratchBreakdowns rationale: Hook 3 non-participation, createdAt requirement)
  → SCHEMA.md § Application Hooks (Hook 3 Bit Auto-Completion — note breakdown rows excluded)

Inbox badge (3-level pressure)
  → SPEC.md § Page Layouts (Inbox system node badge)
  → DESIGN_TOKENS.md § Color Theme System (semantic badge tokens — neutral / warm / high-pressure; no hard-coded HSL)
  → EXECUTION_PLAN.md (thresholds → src/lib/constants.ts; constant, not doc)
```

---

## 7. Open Question Disposition

| Question | Classification | Notes |
|---|---|---|
| Original source OQs (#3, #4, #5, #6, #7, #8, #9, #12) | Resolved | Resolved in source NOTES.md (2026-05-29); reflected in DECISION.md |
| Inbox/Triage visual realization | Resolved (scope boundary) | Batch 1 = existing GridDO baseline UI/tokens; theme visual = Batch 2. User-authorized baseline fallback. **Not blocking, not a phase-local design prerequisite.** |
| Archive View visual realization | Resolved (scope boundary) | Baseline UI/tokens in Batch 1. No dedicated Archive View theme source; future global theme system may affect it via global tokens. Not blocking. |
| Compound index `[parentId, deletedAt, archivedAt]` sufficiency for L0 + `hiddenFromGrid` | Non-blocking | Implementation choice during the SCHEMA amendment; system nodes are few, app-level filtering is acceptable. Does not affect promotion. |
| Inbox badge thresholds (1–7 / 8–14 / 15+) | Resolved | Decided default (from DECISION); defined in `src/lib/constants.ts`. Post-launch tuning possible. |
| Archive auto-cleanup retention period | Deferred | `2026-05-26-archive-auto-cleanup`; not Batch 1. |
| Command Palette command set | Resolved | Fixed by quick-capture DECISION: Cmd+K → palette, key 1 = Scratch, key 2 = existing Search overlay; no Search redesign. Prototype's search input is visual-shell reference only, not an app-wide search/filter. |

**No Blocking questions.** All items are Resolved, Non-blocking, or Deferred (template-standard classifications).

---

## 8. Canonical Doc Edit Plan

```
Document              Action   Status    Notes
SCHEMA.md             edit     done      systemRole, archivedAt, hiddenFromGrid; new scratchBreakdowns store + indexes;
                                         Hook 10 (Archive Cascade) + Hook 11 (Archive Restore); default system nodes;
                                         Scratch placement + Hook 8 uniqueness exception; Hook 3 non-participation note.
                                         Consistency sweep: ALL active-item Key Queries add archivedAt=null; createNodeSchema
                                         must not set system-managed fields.
SPEC.md               edit     done      New AD #15 (System Nodes); extend AD #12 (@dnd-kit: compact token + pending-confirmation);
                                         Page Layouts: System Node routing (Triage/Archive View via systemRole), Quick Capture +
                                         entry surface, Command Palette (modal), Inbox/Triage workspace, Archive View surface.
                                         Routes: no new routes (note).
DESIGN_TOKENS.md      edit     done      Surface Recipes: Quick Capture Entry Surface + Command Palette (reference recipe paths).
                                         Component Usage Quick Reference: Command Palette, Compact Drag Token. Color Theme System:
                                         semantic Inbox badge tokens. Triage/Archive = baseline (NO new theme tokens in Batch 1).
                                         Amended at Step 3 AFTER Step 0.75 recipes (pipeline ordering, not a skip).
EXECUTION_PLAN.md     edit     done      New phases derived at Step 4 from amended SCHEMA/SPEC (numbers NOT presumed from source).
                                         Reference Reuse Targets + recipe paths in task specs. quarterly-calendar-view stays
                                         Non-Promoted (no active Phase 15 section exists → no reclassification).
PLANNING_STANDARD.md  edit     done      Candidate new conformance items: archivedAt active-filter invariant; system-managed
                                         fields (systemRole/hiddenFromGrid/archivedAt) not settable via create schemas;
                                         scratchBreakdowns Hook 3 non-participation. Confirm at Step 5 whether items are needed.
```

All rows `edit / pending` — no skips. DESIGN_TOKENS.md is `edit / pending` (amended after Step 0.75 recipe extraction), which is **pipeline ordering, not a skip**.

---

## 9. Non-Promoted Items

| Item | Type | Reason |
|---|---|---|
| `2026-05-18-quick-capture-palette` (as a function) | brainstorming topic | Recipe source only — visual/interaction adopted into DESIGN_TOKENS/recipe; the Command Palette **function** is promoted from `quick-capture-entry-surface` DECISION, not from this entry. |
| `2026-06-02-grid-dnd-preview-and-drop-targeting` (full) | future idea (`draft`) | Reference-only. Batch 1 partial-implements Inbox/Triage DnD (see Partial Implementations). Full Grid DnD rework not promoted. |
| `2026-05-26-create-modal-design` | brainstorming topic | qc modal code not adopted; Batch 1 uses existing create modals. |
| favorites variant (in `e662163` `page.tsx`) + `2026-05-18-favorites` | prototype variant + topic | Batch 3 candidate; not Batch 1. |
| `2026-04-28-node-rollup-focus-aging` | future idea | Intentionally excluded (rollup undefined; touches `src/lib/utils/aging.ts`). |
| `2026-04-28-triage-scheduling` | future idea | Related extension to Triage; not Batch 1. |
| `2026-05-28-inbox-triage-theme-variants`, `2026-05-28-theme-system-and-calendar-theming` | visual / feature reference | Batch 2 (`themes2-2`). |
| `2026-05-26-quarterly-calendar-view` | future idea | Only a historical "Phase 15 / Task 68 defer" note exists; **no active `## Phase 15` section in EXECUTION_PLAN** (verified). Stays a future idea — no reclassification. |
| `2026-05-18-visual-archive-app` | brainstorming topic | Dropped by user decision (prior handoff). |

**Scope rule:** Excluding these prototype/topic artifacts does **not** exclude any already-promoted Batch 1 surface or decision. The four selected sources remain Adopt; existing product decisions remain intact.

---

## Experimental Extensions (non-standard sections)

> ⚠️ The two sections below are **not part of the standard PROMOTION_MAP template**. They are added as a deliberate traceability extension for this workflow test (handoff §7-2, §7-3). The Step 6 amendment flow-reviewer should treat them as **intentional**, not a structural error.

### Partial Implementations

| Promoted partial | Source (non-promoted full) | What Batch 1 implements | What is deferred |
|---|---|---|---|
| Inbox/Triage DnD | `grid-dnd-preview` (Reference-only, `draft`) | compact drag token; pointer-centered targeting; valid / invalid / pending-confirmation target states; sidebar-style "Remove from staging" action target | full Grid DnD rework (main grid, calendar, pool); Node density mode; multi-select drag; Grid Frames |

When `grid-dnd-preview` is later promoted in full, that work must reconcile the Inbox/Triage DnD behavior implemented here with the main grid, calendar, and pool DnD.

### Reuse Targets (existing app code — NOT a Functional Source)

> These are **existing committed components** to reference during implementation. They are **not** unmerged Functional Sources and must **not** trigger the Step 6 mandatory dependency-merge check. Recorded here and carried into EXECUTION_PLAN task notes.

| Decision | Reuse target (path) |
|---|---|
| #2 placement confirmation | `src/components/layout/grid-runtime.tsx` `handleNodeMoveConfirm` / `handleAncestorMoveConfirm`; `src/components/ui/dialog.tsx`; `src/components/grid/delete-confirm-dialog.tsx` |
| #3 type-select creation | `src/components/grid/create-node-dialog.tsx`, `create-bit-dialog.tsx` |
| #4 remove-from-staging | `src/components/layout/sidebar.tsx` `DeleteDropTarget`; `src/lib/grid-dnd.ts` `grid-delete-drop`; `src/hooks/use-dnd.ts:250` |
| #5 compact token (anti-pattern ref) | `src/components/calendar/compact-bit-item.tsx` (its "full drag surface" is the improvement target) |

---

## Workflow-Test Observations (handoff §7 / skill feedback)

1. **Multi-source (4 DECISION → 1 MAP):** section-level provenance is maintained in Decision Mapping. Cross-references (inbox-triage→lifecycle, archive→lifecycle, quick-capture→palette) traced. ✓
2. **Single prototype FILE → 2 recipes (different surfaces):** handled via Prototype Variant Area Selection + two recipe paths. **User-raised candidate skill improvement** — formalize "one source file / one worktree → N variant/source classification → N recipes" mapping (e.g. `themes2-2` carrying theme + calendar + inbox-triage). Detailed proposal to follow.
3. **Non-standard sections used** (Partial Implementations, Reuse Targets) — recommend evaluating whether these graduate into the standard template, or remain ad-hoc per promotion.
4. **`Check deferred ideas` guard** (post-edit) correctly prevented the 4 sources from being reclassified as Non-Promoted, and deferred to the handoff's Known Exclusions. ✓
