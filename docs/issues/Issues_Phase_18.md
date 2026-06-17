# Issues — Phase 18: Inbox / Triage — Staging & Placement DnD

## Batch Plan

### Original Proposal

5-batch plan approved before Batch 1 launch.

| Batch | Tasks | Classification | Key Outputs |
|-------|-------|----------------|-------------|
| 1 | T81 | mixed | `staging-zone.tsx` (create), `triage-store.ts` (StagedCandidate + stagedCandidates), `breakdown-panel.tsx` (de-emphasis) |
| 2 | T82 | mixed | Compact drag token, Triage DnD kinds in `use-dnd.ts` / `grid-dnd.ts`, drag wiring in `triage/*` |
| 3 | T83 | mixed | `hierarchy-explorer.tsx` (create), placement confirmation dialog, `markScratchBreakdownConsumed` (existing API) + content/order unit test |
| 4 | T84 | mixed | Fast path (breakdown row → hierarchy), explicit type-choice dialog |
| 5 | T85 | mixed | Remove-from-staging drop target, Archive Scratch affordance, `useCanArchiveScratch` hook |

Rationale: T84/T85 split keeps IC-3 (DeleteDropTarget architecture decision) and IC-5 (cross-store condition hook) in a smaller, isolated batch given DnD blast radius.

### Execution Status

| Batch | Tasks | Status |
|-------|-------|--------|
| 1 | T81 | Complete |
| 2 | T82 | Complete |
| 3 | T83 | Implemented |
| 4 | T84 | Pending |
| 5 | T85 | Pending |

### Deviations

_None yet._

---

## Execution Issues

### ISSUE-18-01 — Test mock missing `useTriageDnd` export
- **Batch:** 2 (T82)
- **Category:** Test fix
- **Severity:** Low (CI would have caught; not a runtime regression)
- **Description:** `grid-runtime.test.tsx` mocks `@/hooks/use-dnd` with only `{ useDnd }`. Adding `useTriageDnd` to the module caused the existing "renders TriageWorkspace for Inbox" test to fail with "No `useTriageDnd` export is defined on the mock." Added a stub `useTriageDnd: () => ({ sensors: [], activeDragItem: null, overTargetId: null, handleDragStart: vi.fn(), handleDragEnd: vi.fn(), handleDragOver: vi.fn() })` to the mock factory.
- **Status:** Fixed (357 tests passing)

### ISSUE-18-02 — T83 will need to extend DndContext boundary
- **Batch:** 2 (T82) — noted for T83
- **Category:** Architecture note
- **Severity:** Info
- **Description:** The nested `DndContext` in `triage-workspace.tsx` wraps only the Breakdown + Staging panels (upper 3/5). The Hierarchy Explorer (lower 2/5) is outside the context, which is correct for T82. T83 must extend the DndContext to wrap the full inner column (or the Hierarchy Explorer section) so staged candidates can be dragged onto hierarchy column targets.
- **Status:** Resolved — T83 extended `DndContext` to wrap both the upper 3/5 and the new `HierarchyExplorer` lower 2/5; `PlacementConfirmationDialog` also rendered inside the context boundary

### ISSUE-18-04 — Codex prompt pre-launch schema blockers (B1/B2/B3)
- **Batch:** 3 (T83) — fixed before Codex launch
- **Category:** Prompt correction
- **Severity:** Medium (would have produced incorrect or non-compiling code if left in)
- **Description:** Three blockers were patched in `.omc/prompts/t83-codex.md` before launching Codex Stage 2: (B1) staged Node drops onto L3 targets would create level-3 Nodes, violating `nodeSchema.level ≤ 2`; (B2) icon defaults used lowercase keys (`"folder"`, `"circle"`) which are not valid `NODE_ICON_MAP` keys — corrected to `"Folder"` and `"ListTodo"`; (B3) prompt wording implied conditional `useGridData` calls ("skip fetch if null") which would violate React hook rules.
- **Status:** Fixed — prompt patched, fence check passed, Codex implemented correctly

### ISSUE-18-05 — Codex added extra test file coverage beyond spec scope
- **Batch:** 3 (T83)
- **Category:** Out-of-plan addition
- **Severity:** Info (additive, no regression)
- **Description:** Codex wrote three additional test file changes beyond the single test specified in the T83 spec: (1) `use-triage-dnd.test.ts` — added 4 new behavioral tests for pending placement creation, confirm, cancel, and Bit-to-Home guard; (2) `triage-workspace.test.tsx` — updated assertion from `HIERARCHY EXPLORER` placeholder text to `data-testid="hierarchy-explorer"`; (3) `grid-runtime.test.tsx` — updated `useTriageDnd` mock to include new return values (`pendingPlacement`, `handlePlacementConfirm`, `handlePlacementCancel`). All changes are additive and necessary for the tests to pass.
- **Status:** Accepted — improvements kept; all tests pass

### ISSUE-18-03 — Staged+dragging row opacity conflict (cosmetic)
- **Batch:** 2 (T82)
- **Category:** Visual edge case
- **Severity:** Low (cosmetic only, no functional impact)
- **Description:** When a breakdown row is both `isStaged` (opacity-50) and `isDragging` (opacity-30), both Tailwind utilities are applied. Tailwind v4 stylesheet generation order determines which wins. In practice `opacity-30` is desired during drag. No user-visible defect observed; fix deferred to avoid scope creep.
- **Status:** Open — defer to T85 cleanup pass if still observable
