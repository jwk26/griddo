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
| 4 | T84 | Implemented |
| 5 | T85 | Implemented |

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

### ISSUE-18-06 — L3 terminal Node cells rendered as no-op interactive buttons
- **Batch:** 3 (T83) — found at checkpoint review
- **Category:** Accessibility defect
- **Severity:** Medium
- **Description:** `NodeDropCell` always rendered a `<button aria-label="Select Node: ...">` even in the L3 terminal column where `onSelectNode` is absent, producing a focusable "Select Node" control with a no-op click handler. Also, `HomeDropCell` used `CELL_BASE_CLASS` which includes `cursor-pointer` and focus-ring classes on a non-interactive `<div>`. Fixed: `NodeDropCell` now conditionally renders `<button>` with full interactive styling when `onSelectNode` is defined, and a plain `<div>` (drop-only, no aria-label, no cursor/focus classes) when absent. `HomeDropCell` switched to new `CELL_DROP_ONLY_CLASS`.
- **Status:** Fixed — patch committed in same session; all tests pass

### ISSUE-18-03 — Staged+dragging row opacity conflict (cosmetic)
- **Batch:** 2 (T82)
- **Category:** Visual edge case
- **Severity:** Low (cosmetic only, no functional impact)
- **Description:** When a breakdown row is both `isStaged` (opacity-50) and `isDragging` (opacity-30), both Tailwind utilities are applied. Tailwind v4 stylesheet generation order determines which wins. In practice `opacity-30` is desired during drag. No user-visible defect observed; fix deferred to avoid scope creep.
- **Status:** Fixed — T85 (D6): `isStaged && !isDragging && "opacity-50 ..."` added to `BreakdownRow` in `breakdown-panel.tsx`

### ISSUE-18-07 — Codex B prompt carried T84 stale-test-author pattern (D8 launch blocker)
- **Batch:** 5 (T85)
- **Category:** Prompt correction
- **Severity:** Medium (would have caused duplicate describe blocks and mock duplication if unpatched)
- **Description:** The Codex B (test author) prompt still contained "Do NOT read or duplicate existing tests" while simultaneously requiring a patch to the existing `use-triage-dnd.test.ts` mock — the same contradiction that caused T84's duplicate describe-block incident (A25 in local skill audit). Patched before any launch: replaced the forbidden phrase with "Read the current test files first to reuse existing mocks, imports, helpers, and avoid duplicate describe/test coverage." Independence preserved as "Do not inspect Codex A implementation files for behavior."
- **Status:** Fixed — prompt patched and fence-checked before Codex B launch; sequential launch enforced

### ISSUE-18-08 — Gemini post-code: remove-target entry/exit animation not implemented
- **Batch:** 5 (T85)
- **Category:** Visual polish gap
- **Severity:** Low (Gemini labeled HIGH; classified follow-up — spec's own §5 rates this MEDIUM priority)
- **Description:** `TriageRemoveDropTarget` uses `if (!isStagedDrag) return null` causing immediate mount/unmount with no fade-in/scale-up animation. Spec specifies `transition-all duration-200 ease-in-out` + scale-up on drag start, fade-out on drag end. All behavioral ACs satisfied; DnD mechanics and visual states (rest/hover) correct. Implementing proper enter/exit requires AnimatePresence or CSS delayed-unmount — non-trivial change.
- **Status:** Deferred — tracked in `docs/issues/Issues_Deferred.md`; follow-up MEDIUM-priority visual polish

### ISSUE-18-09 — Gemini post-code: MEDIUM visual findings on remove target
- **Batch:** 5 (T85)
- **Category:** Visual drift
- **Severity:** Medium
- **Description:** (1) Border: spec says `border border-dashed border-border` (all sides) but Codex A prompt explicitly specified `border-t` (top only as a separator strip) — binding spec conflict, user decides. (2) Transition timing: `transition-[background-color,border-color,color]` is missing `duration-200 ease-in-out`; hover state transitions revert to browser defaults. (3) LOW: Archive Scratch button missing `focus-visible:ring-offset-2` accessibility class.
- **Status:** Deferred — tracked in `docs/issues/Issues_Deferred.md`; follow-up visual/accessibility polish

### ISSUE-18-10 — Staged Node/Bit drag token is offset from the pointer
- **Batch:** 2 (T82)
- **Category:** Manual smoke blocker
- **Severity:** High (user-visible DnD control issue)
- **Description:** When dragging a staged Node or staged Bit, the compact drag token appears anchored to the staged item's top-left origin rather than the active mouse pointer. Dragging from any point other than the top-left makes the token visually detached from the pointer. Breakdown rows are less affected because they expose a left-side grip/handle, but staged Node/Bit items are draggable from the full item surface.
- **Expected:** Dragging a staged Node or Bit from any point on the item should create the compact token at the mouse pointer, so the DnD interaction feels pointer-centered and predictable.
- **Root cause (Smoke Fix D, 2026-06-22):** `DragOverlay` in `triage-workspace.tsx` positioned the compact token at the original draggable element's top-left origin (the 80px Node card or full-width Bit row). The transform moved that anchored point, so grabbing anywhere but the top-left left the token visually detached from the cursor.
- **Fix:** Added `snapDragTokenToCursor` modifier (module-level const in `triage-workspace.tsx`) passed via `modifiers={[snapDragTokenToCursor]}` on the `DragOverlay`. The modifier adjusts the transform using `activatorEvent` (initial pointer position) and `overlayNodeRect` (actual token dimensions) so the token center tracks the cursor regardless of grab point. Touch support included. Breakdown-row drag uses the same overlay modifier and was manually smoke-tested for no visible regression.
- **Status:** Closed — implemented in Smoke Fix D and manually confirmed on 2026-06-22

### ISSUE-18-11 — Staged placement confirm does not leave source breakdown consumed
- **Batch:** 3 (T83)
- **Category:** Manual smoke blocker
- **Severity:** High (breaks the placement completion contract)
- **Description:** After a staged Node/Bit is dropped onto a hierarchy target and confirmed in the placement dialog, the source breakdown row does not remain in the consumed/processed state. During staging the row appears de-emphasized, but after confirm it returns to the original active breakdown-row state instead of showing the consumed line-through/processed state.
- **Root cause (Smoke Fix A, 2026-06-22):** `BreakdownRow` in `breakdown-panel.tsx` never read `row.consumedAt`; the handler and DB write were already correct. Missing render branch only.
- **Fix:** Added `isConsumed = row.consumedAt !== null` in `BreakdownRow`; applies `line-through text-muted-foreground/40` to content text and `data-testid="breakdown-row-consumed"` on the row container.
- **Expected:** Confirming staged placement should create the Node/Bit, call the breakdown-consumption path, remove the staged candidate, and leave the source breakdown row visibly consumed/processed.
- **Status:** Closed — implemented in Smoke Fix A and manually confirmed on 2026-06-22

### ISSUE-18-12 — Direct breakdown placement does not consume source row
- **Batch:** 4 (T84)
- **Category:** Manual smoke blocker
- **Severity:** High (breaks fast-path completion)
- **Description:** Dragging a breakdown row directly onto the Hierarchy Explorer opens the explicit Node/Bit type-choice dialog, but confirming either Node or Bit placement does not leave the original breakdown row consumed.
- **Root cause (Smoke Fix A, 2026-06-22):** Same single render-layer bug as ISSUE-18-11 — same fix resolves both.
- **Fix:** Same `breakdown-panel.tsx` render-layer change as ISSUE-18-11.
- **Expected:** Confirming direct breakdown placement should create the chosen type and mark the source breakdown row consumed/processed, matching the T84 fast-path acceptance criteria.
- **Status:** Closed — implemented in Smoke Fix A and manually confirmed on 2026-06-22

### ISSUE-18-13 — Archive Scratch affordance cannot be verified while consumed-state blockers remain
- **Batch:** 5 (T85)
- **Category:** Manual smoke blocked verification
- **Severity:** High (acceptance cannot be confirmed)
- **Description:** T85 requires the Archive Scratch affordance to appear when all breakdown rows are consumed and no staged candidates remain. Manual smoke cannot verify this reliably while ISSUE-18-11 and ISSUE-18-12 prevent placement confirmation from leaving source rows consumed.
- **Root cause (Smoke Fix A, 2026-06-22):** `use-can-archive-scratch.ts` already reads `consumedAt` correctly — no code change needed. Issue was un-observable because consumed rows rendered as active (ISSUE-18-11/12). Resolved by the same render-layer fix.
- **Expected:** After consumed-state blockers are fixed, re-run the T85 smoke path: consume all breakdown rows through placement, clear staged candidates, verify the Archive Scratch affordance appears, then verify cancel/confirm behavior.
- **Status:** Closed — re-verified after Smoke Fix A/B manual smoke on 2026-06-22; no independent code change required

### ISSUE-18-14 — Hierarchy Explorer section/grid mapping is shifted by a synthetic Home item
- **Batch:** 3 (T83), affects T84/T85 placement
- **Category:** Manual smoke blocker
- **Severity:** High (blocks deep-grid navigation and placement)
- **Description:** The Hierarchy Explorer currently renders a synthetic `Home` item/drop cell inside the Home section, so actual root-grid items appear in the L1 section. This shifts the visible hierarchy one section to the right. For a path like `Home -> g -> 121221 -> 32ㄴ -> Bit-only grid`, `32ㄴ` appears as an item in the L3 section, so its child grid cannot be viewed or used as a placement target.
- **Expected:** Remove the synthetic Home item. The Home section should show root-grid contents directly. Selecting a node in Home should open that node's grid in L1; selecting a node in L1 should open its grid in L2; selecting a node in L2 should open its grid in L3. The final Bit-only grid must remain reachable and placeable.
- **Status:** Closed — implemented in Smoke Fix C and manually confirmed on 2026-06-22

### ISSUE-18-15 — Hierarchy section body should be the primary placement target
- **Batch:** 3 (T83), affects T84/T85 placement
- **Category:** Manual smoke blocker
- **Severity:** High (placement mental model mismatch)
- **Description:** Placement currently feels centered on dropping directly onto individual node rows. The intended model is section-first: each Hierarchy Explorer section represents a grid context, and dropping onto the section body should place into that section's represented grid. Node rows should primarily navigate to the child grid in the next section.
- **Expected:** Section body drop is the primary placement action for the represented grid. Direct node-row drop remains available as a shortcut, but it should not be the main required placement path. The selected node in the parent section determines the child section's grid context.
- **Status:** Closed — implemented in Smoke Fix C and manually confirmed on 2026-06-22

### ISSUE-18-16 — Staged candidates should be removable by dropping back onto the Breakdown area
- **Batch:** 5 (T85) adjacent behavior
- **Category:** User-requested UX follow-up
- **Severity:** Medium
- **Description:** Users commonly expect a staged Node/Bit to return to the Breakdown area when dragged back there. This should behave like `Remove from staging`: remove only the staged candidate, restore the source breakdown row to active display, and keep `consumedAt` as `null`.
- **Expected:** Dropping a staged candidate onto the Breakdown area removes it from staging non-destructively, matching the remove-from-staging behavior.
- **Status:** Deferred — tracked in `docs/issues/Issues_Deferred.md`; promote to a follow-up Inbox/Triage UX task

### ISSUE-18-17 — Scratch pool sidebar folds on Scratch selection instead of Breakdown focus
- **Batch:** 1/2 adjacent UX
- **Category:** User-requested UX follow-up
- **Severity:** Medium
- **Description:** The Scratch pool sidebar currently folds immediately when a Scratch item is selected. The expected behavior is to keep the Scratch pool visible after selection and fold it when focus moves into the Breakdown item section, where the user has begun active triage work.
- **Expected:** Scratch selection alone should not force the pool closed. Focusing the Breakdown section should fold the Scratch pool to expand the work area.
- **Status:** Deferred — tracked in `docs/issues/Issues_Deferred.md`; follow-up Inbox/Triage UX task

### ISSUE-18-18 — Add-note input should keep focus after Enter
- **Batch:** 1 adjacent UX
- **Category:** User-requested UX follow-up
- **Severity:** Medium
- **Description:** After entering a note in the `Add a note...` area and pressing Enter, focus is lost and the user must click the input again to add another breakdown row. This interrupts the intended rapid `type -> Enter -> type -> Enter` workflow.
- **Expected:** After adding a breakdown row with Enter, focus should remain in the add-note input. Exception: global commands such as `Cmd+K` should still move focus to the integrated menu.
- **Status:** Deferred — tracked in `docs/issues/Issues_Deferred.md`; follow-up keyboard-flow UX task

### ISSUE-18-19 — Breakdown panel needs selected Scratch context
- **Batch:** 1 adjacent UX
- **Category:** User-requested UX follow-up
- **Severity:** Medium
- **Description:** The Breakdown section does not currently show enough context about the selected Scratch item. During triage, users need a clear indicator of which Scratch is active above the breakdown list.
- **Expected:** The top of the Breakdown section should display the selected Scratch item/context so users can confirm which Scratch they are editing.
- **Status:** Deferred — tracked in `docs/issues/Issues_Deferred.md`; follow-up Inbox/Triage context task

### ISSUE-18-20 — Invalid hierarchy/staging drop state is visually too destructive
- **Batch:** 3/5 visual follow-up
- **Category:** User-requested visual follow-up
- **Severity:** Medium
- **Description:** During Node/Bit drag, invalid sections are currently shown with a red/destructive line treatment. This reads like an error or destructive action, but the state only means the current target is not valid for that drag.
- **Expected:** Invalid drop state should use a quieter de-emphasis treatment similar to the Breakdown row staged/de-emphasized visual language, rather than destructive red.
- **Status:** Deferred — tracked in `docs/issues/Issues_Deferred.md`; follow-up visual-state polish

### ISSUE-18-21 — Hierarchy Explorer search bar may be missing
- **Batch:** 3 (T83) or follow-up, pending source check
- **Category:** Awaiting investigation
- **Severity:** Medium
- **Description:** Manual smoke noted that the Hierarchy Explorer has no search bar. It is not yet confirmed whether search was required by `DECISION.md`, `SPEC.md`, or the Phase 18 plan.
- **Expected:** Check the canonical decision/spec/planning documents. If Hierarchy Explorer search was specified, record this as a Phase 18 omission; otherwise treat it as a follow-up UX enhancement.
- **Status:** Deferred — tracked in `docs/issues/Issues_Deferred.md`; investigate canonical docs before scoping

### ISSUE-18-22 — Duplicate Node/Bit titles are allowed globally
- **Batch:** Product-wide follow-up observed during Phase 18 smoke
- **Category:** Product policy / validation follow-up
- **Severity:** Medium
- **Description:** Adding Node/Bit items through the Hierarchy Explorer allows duplicate titles. The same appears to be true when adding via the main grid `+` menu, suggesting this is not isolated to Phase 18 but reflects a broader GridDO title-uniqueness policy gap.
- **Expected:** Decide whether duplicate Node/Bit titles should be allowed globally. If not, define product-wide validation behavior and apply it consistently across Hierarchy Explorer placement and main grid creation flows.
- **Status:** Deferred — tracked in `docs/issues/Issues_Deferred.md`; product-policy follow-up

### ISSUE-18-23 — Archive Scratch affordance replaces Add note input and blocks further breakdown entry
- **Batch:** 5 (T85), discovered during Smoke Fix A manual verification
- **Category:** Manual smoke blocker / UX blocker
- **Severity:** High (archive-ready state blocks continued breakdown entry)
- **Description:** When all breakdown rows are consumed and no staged candidates remain, the Archive Scratch affordance appears in the bottom input area, replacing `Add a note...`. Canceling the archive confirmation dialog does not hide the affordance because the archive-ready condition remains true. This leaves the user unable to add more breakdown rows after reaching the archive-ready state.
- **Expected:** Keep the `Add a note...` input available at the bottom. Render the Archive Scratch affordance inside the breakdown rows/list area instead. If the user adds a new breakdown row, it starts with `consumedAt === null`, so `canArchiveScratch` becomes false and the affordance disappears automatically.
- **Fix (Smoke Fix B, 2026-06-22):** In `breakdown-panel.tsx`, converted the `canArchiveScratch` ternary (which replaced the add-note div) to a conditional sibling — `ArchiveScratchBar` renders above the add-note div when `canArchiveScratch` is true; the add-note div always renders. Updated the matching test in `breakdown-panel.test.tsx` to assert both "All items processed" and "Add a note..." are present simultaneously.
- **Status:** Closed — implemented in Smoke Fix B and manually confirmed on 2026-06-22

### ISSUE-18-24 — `useTriageDnd` hook imports Zustand store directly
- **Batch:** 2 (T82) — detected at architecture conformance review
- **Category:** Architecture conformance blocker
- **Severity:** High (violates State separation rule: hooks must not import Zustand)
- **Description:** `src/hooks/use-dnd.ts` imports `useTriageStore` from `@/stores/triage-store` to read `addStagedCandidate` and `removeStagedCandidate`. The conformance rule ("hooks don't import Zustand") was violated because the DnD orchestration hook needed to mutate staged-candidate UI state during drag events, and the Zustand import was the direct path. Fix: inject `addStagedCandidate` and `removeStagedCandidate` as parameters into `useTriageDnd`; `TriageWorkspace` (a component) reads them from `useTriageStore` and passes them in.
- **Status:** Closed — injected `addStagedCandidate`/`removeStagedCandidate` as parameters into `useTriageDnd`; `TriageWorkspace` reads them from `useTriageStore` and passes them in; store mock removed from `use-triage-dnd.test.ts`

### ISSUE-18-25 — `ArchiveScratchBar` component imports `getDataStore` directly
- **Batch:** 5 (T85) / Smoke Fix B — detected at architecture conformance review
- **Category:** Architecture conformance blocker
- **Severity:** High (violates Hook API boundary rule: UI components must not import DataStore)
- **Description:** `src/components/triage/breakdown-panel.tsx` imports `getDataStore` from `@/lib/db/datastore` inside `ArchiveScratchBar` to call `archiveBit(scratchId)`. The conformance rule ("UI components import hooks, not DataStore") was violated because the archive action was written directly in the component during Smoke Fix B. Fix: extract the DataStore write into a new `useArchiveScratch` hook; the component calls the hook.
- **Status:** Closed — extracted `archiveBit` call into new `src/hooks/use-archive-scratch.ts` hook; `ArchiveScratchBar` calls the hook; `breakdown-panel.tsx` no longer imports DataStore

### Phase-local Question Resolution

| # | Question | Resolution | Canonical Impact | Status |
|---|----------|------------|-----------------|--------|
| D4 | Archive button styling (`bg-accent` vs Button component) | `variant="outline"` approved as closest Button equivalent — no custom Tailwind | SPEC/DESIGN (button override) | None |
| D6 | ISSUE-18-03 opacity fix inclusion in T85 | Included in T85 Codex A prompt as cleanup pass | ISSUE-18-03 status | Reflected |
| D8 | Codex B prompt "do not read tests" contradiction | Patched to "read current tests first"; independence preserved as "no Codex A files" | None (prompt-only) | None |

---

## Summary

| # | Issue | Resolution |
|---|-------|------------|
| 01 | Test mock missing `useTriageDnd` export | Added stub to `grid-runtime.test.tsx` mock factory |
| 02 | T83 DndContext boundary note | Resolved — T83 extended DndContext to wrap HierarchyExplorer |
| 03 | Staged+dragging row opacity conflict | Fixed in T85 — `isStaged && !isDragging` guard added |
| 04 | Codex T83 prompt pre-launch blockers (B1/B2/B3) | Patched prompt before launch |
| 05 | Codex T83 added extra test coverage | Accepted — additive, tests pass |
| 06 | L3 terminal Node cells rendered as no-op buttons | Fixed — conditional `<button>`/`<div>` in `NodeDropCell` |
| 07 | Codex T85 B prompt "do not read tests" contradiction | Patched prompt; sequential launch enforced |
| 08 | Remove-target entry/exit animation not implemented | Deferred — MEDIUM visual polish |
| 09 | MEDIUM visual findings on remove target | Deferred — visual/a11y polish follow-up |
| 10 | Staged Node/Bit drag token offset from pointer | Closed — `snapDragTokenToCursor` modifier (Smoke Fix D) |
| 11 | Staged placement confirm doesn't leave row consumed | Closed — render-layer fix in `BreakdownRow` (Smoke Fix A) |
| 12 | Direct breakdown placement doesn't consume row | Closed — same render-layer fix (Smoke Fix A) |
| 13 | Archive Scratch couldn't be verified until 11/12 fixed | Closed — re-verified after Smoke Fix A; no code change |
| 14 | Hierarchy section/grid mapping shifted by synthetic Home | Closed — synthetic Home removed (Smoke Fix C) |
| 15 | Section body should be primary placement target | Closed — section-body drop promoted (Smoke Fix C) |
| 16 | Staged candidates not removable by drop onto Breakdown | Deferred — follow-up Inbox/Triage UX task |
| 17 | Scratch pool sidebar folds on Scratch selection | Deferred — follow-up workspace UX task |
| 18 | Add-note input loses focus after Enter | Deferred — keyboard-flow UX fix |
| 19 | Breakdown panel missing selected Scratch context | Deferred — triage context polish |
| 20 | Invalid drop state uses destructive red treatment | Deferred — visual-state polish pass |
| 21 | Hierarchy Explorer search bar may be missing | Deferred — check canonical docs before scoping |
| 22 | Duplicate Node/Bit titles allowed globally | Deferred — product-policy follow-up |
| 23 | Archive Scratch affordance replaces add-note input | Closed — ArchiveScratchBar rendered as sibling (Smoke Fix B) |
| 24 | `useTriageDnd` imports Zustand store directly | Closed — injected actions as parameters; store mock removed from test |
| 25 | `ArchiveScratchBar` imports `getDataStore` directly | Closed — extracted into `useArchiveScratch` hook |
