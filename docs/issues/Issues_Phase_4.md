# Issues — Phase 4

## Issue 1: Missing accessible h1 on node grid shell

- **Problem:** `node-grid-shell.tsx` had no `<h1>` element, failing basic accessibility requirements for page structure.
- **Root Cause:** The visual design uses breadcrumbs + grid as the primary orientation — no visible heading was designed. The a11y requirement for a page-level heading was overlooked.
- **Solution:** Added `<h1 className="sr-only">{node?.title ?? "Grid"}</h1>` inside the shell, visually hidden but present for screen readers.
- **Learning:** Every page shell needs a visually-hidden h1 even when the visual design omits one. Add it by default whenever building a new page shell.

## Issue 2: BitCard not vertically centered inside GridCell

- **Problem:** BitCard rendered directly as a child of GridCell, causing incorrect vertical positioning — card floated to the top of the cell instead of centering.
- **Root Cause:** GridCell uses `relative` positioning but not flex. BitCard, being a horizontal rectangle, needs an explicit flex container to center within the cell's full height.
- **Solution:** Wrapped BitCard in `<div className="flex h-full items-center">` inside the grid mapping.
- **Learning:** When placing fixed-height cards inside grid cells, always wrap with a flex centering div. Do not rely on the cell container to center children.

## Issue 3: Breadcrumb horizontal overflow showed native scrollbar

- **Problem:** When a breadcrumb path was long enough to overflow, a native browser scrollbar appeared below the breadcrumb bar — visible in both light and dark mode.
- **Root Cause:** `overflow-x-auto` was applied without suppressing the scrollbar UI. The breadcrumb height is fixed (`h-breadcrumb`) so there's no room for a scrollbar without breaking layout.
- **Solution:** Added `[scrollbar-width:none] [&::-webkit-scrollbar]:hidden` to the overflow container — covers Firefox (`scrollbar-width`) and WebKit (`-webkit-scrollbar`).
- **Learning:** Any `overflow-x-auto` container with a fixed height should have scrollbar suppression applied by default in this design system.

## Issue 4: execute-next-phase skill bug during phase execution

- **Problem:** The `execute-next-phase` skill had a bug when this phase was run, which may have affected how tasks were planned or scoped.
- **Root Cause:** Skill implementation error (details in the skill's own history). The bug was identified and fixed after phase execution completed.
- **Solution:** Skill was updated post-execution. Phase output was reviewed and post-review fixes were applied.
- **Learning:** Before starting any phase, confirm the `execute-next-phase` skill is at its latest version. If a skill is updated mid-phase, consider whether a re-plan step is needed before continuing.

## Issue 5: Level 3 blocked all creation instead of switching to Bit creation

- **Problem:** Task 18 specified that Level 3 should block Node creation and wire `+` to direct Bit creation. The implementation blocked all creation — sidebar `+` was hidden and `CreateNodeDialog` was not rendered at leaf level.
- **Root Cause:** The `isLeafLevel` guard was added to prevent Node creation but was applied too broadly, removing all creation affordances rather than substituting a Bit creation path.
- **Solution:** Added `CreateBitDialog`, wired sidebar `+` and cell `+` at leaf level to open it. Submit calls `indexedDBStore.createBit()` with an explicit full payload.
- **Learning:** At leaf level, switch the creation type — never block creation entirely. Any `isLeafLevel` guard on a creation affordance should route to Bit creation, not `undefined`.

## Issue 6: BitCard past-deadline overlay was missing action buttons

- **Problem:** Task 17 specified the past-deadline pattern as blur + "Done?" + check/x buttons. The overlay rendered only the "Done?" text.
- **Root Cause:** Acceptance criteria not verified against running code before closing the phase.
- **Solution:** Added `Check` (mark as done) and `X` (dismiss) buttons as visual stubs alongside "Done?", matching NodeCard's stub pattern.
- **Learning:** Past-deadline overlay without action buttons is not acceptance-complete per Task 17. Any blur overlay on an interactive card must include the documented CTA buttons, even as stubs.

## Issue 7: BitCard was missing edit-mode delete overlay

- **Problem:** Task 20 states each item gets a delete button overlay in edit mode. NodeCard had it; BitCard did not.
- **Root Cause:** Edit mode implementation in Phase 4 added the delete overlay only to NodeCard. BitCard's edit mode state was used only for the jiggle animation.
- **Solution:** Added the same top-right `bg-destructive` X button overlay to BitCard, consistent with NodeCard's stub (stopPropagation, no DataStore call yet).
- **Learning:** When implementing edit mode affordances, enumerate all item types explicitly. "All cards get delete overlay" is not complete until both NodeCard and BitCard have it.

## Issue 8: Phase ownership conflict between Task 20 and Task 34 for drag reposition

- **Problem:** Task 20 (Phase 4) claimed "drag-to-reposition enabled via @dnd-kit" in its actions and "items repositionable by drag" in acceptance. Task 34 (Phase 7) also planned grid reposition as its first action. Both tasks claimed the same behavior.
- **Root Cause:** Task 20 was scoped as "edit mode overlay" but its acceptance criteria leaked into DnD interaction territory that belongs to Task 34.
- **Solution:** Narrowed Task 20 to edit mode *affordances* only (jiggle, dashed cells, delete overlays). Narrowed Task 16 similarly (breadcrumb drop-zone structure present; active drag highlight deferred to Task 34). Task 34 remains the sole owner of all DnD interaction logic.
- **Learning:** When a behavior spans multiple tasks, resolve ownership before marking any task complete. "Edit mode affordances" (Task 20) and "DnD grid interactions" (Task 34) are distinct layers — do not let acceptance criteria from one bleed into the other.

## Summary

| # | Issue | Resolution |
|---|-------|------------|
| 1 | Missing sr-only h1 on node grid shell | Added `<h1 className="sr-only">` to shell |
| 2 | BitCard not vertically centered in GridCell | Wrapped in `<div className="flex h-full items-center">` |
| 3 | Breadcrumb overflow showed native scrollbar | Added `[scrollbar-width:none] [&::-webkit-scrollbar]:hidden` |
| 4 | execute-next-phase skill bug during execution | Skill fixed post-phase; post-review pass applied |
| 5 | Level 3 blocked all creation instead of switching to Bit creation | Added `CreateBitDialog`; wired leaf-level `+` to Bit creation |
| 6 | BitCard past-deadline overlay missing check/x buttons | Added stub Check/Dismiss buttons to overlay |
| 7 | BitCard missing edit-mode delete overlay | Added top-right X overlay matching NodeCard pattern |
| 8 | Task 20 / Task 34 phase ownership conflict for drag reposition | Narrowed Task 20 to affordances; Task 34 owns all DnD interactions |
