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

## Summary

| # | Issue | Resolution |
|---|-------|------------|
| 1 | Missing sr-only h1 on node grid shell | Added `<h1 className="sr-only">` to shell |
| 2 | BitCard not vertically centered in GridCell | Wrapped in `<div className="flex h-full items-center">` |
| 3 | Breadcrumb overflow showed native scrollbar | Added `[scrollbar-width:none] [&::-webkit-scrollbar]:hidden` |
| 4 | execute-next-phase skill bug during execution | Skill fixed post-phase; post-review pass applied |
