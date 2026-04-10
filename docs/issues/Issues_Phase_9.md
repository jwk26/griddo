# Issues — Phase 9

> Phase 9 produced significant corrective work beyond the planned task scope. This document is the live execution record for all out-of-plan fixes, architectural adjustments, and user-reported issues from Phase 9.

---

## Main Issues
*(Execution issues discovered by the agent, architecture issues, structural changes beyond planned scope)*

### MI-1: Node card height chain break
- **Status:** Closed
- **Discovered:** During Batch 1 visual verification (Task 52 sign-off)
- **Root cause:** `GridCell` only applied `h-full` when `showEmptyAffordance` was true. Non-empty cells had no `h-full`, so the height chain `GridDropCell(h-full) → GridCell(no h-full) → NodeCard(h-full=0)` was broken.
- **Beyond scope because:** Task 52 specified "card as square tile" and "centered in cell" but did not diagnose the height delivery path. The tile sizing was correct in isolation; the container chain was broken.
- **Changes:** `grid-cell.tsx` — moved `h-full` to base classes (always present, not conditional on `showEmptyAffordance`)
- **Resolution:** Fixed during Batch 1 execution; confirmed working.

### MI-2: Dotted-area and node footprint alignment
- **Status:** Closed
- **Discovered:** After MI-1 and mi-2 — dotted add-target and drag-over indicator did not match the new node card footprint
- **Root cause:** Dotted area used fixed dimensions while node card had been resized. Visual mismatch between empty and filled cells.
- **Beyond scope because:** Original tasks treated node card and empty cell affordance as separate concerns. Footprint alignment emerged as a cross-cutting requirement after both were modified.
- **Changes:** `grid-cell.tsx` — dotted area and drag indicator now use `h-[var(--grid-node-size)] w-[var(--grid-node-size)]`
- **Resolution:** Fixed after node card size was stabilized; footprint now stays in sync via shared CSS var.

### MI-3: Grid-aware sizing introduction
- **Status:** Closed
- **Discovered:** After mi-2 and MI-2 — fixed rem-based node sizing created unequal horizontal/vertical spacing because a 15×8 grid produces rectangular cells, not square
- **Root cause:** `--grid-node-size: 6.15rem` was a static value. Nodes filled cell height (zero vertical inset) while horizontal inset was aspect-ratio-dependent.
- **Beyond scope because:** No task addressed the fundamental sizing model. All tasks assumed fixed-size nodes.
- **Changes:**
  - `src/lib/grid-layout.ts` (new) — `computeGridNodeMeasurements()`: computes `min(cellWidth, cellHeight) - inset` with proportional derived values (icon, title, padding) and readability floors
  - `src/components/grid/grid-view.tsx` — measures grid container via `ResizeObserver`, computes measurements, injects as CSS vars via inline style
  - `src/app/globals.css` — existing `:root` vars kept as fallbacks, runtime JS overrides at render time
- **Resolution:** Implemented; nodes render as squares regardless of cell aspect ratio.

### MI-4: Container-query removal / JS runtime sizing unification
- **Status:** Closed
- **Discovered:** During MI-3 implementation — CSS container queries were added first, then removed in favor of JS-only approach
- **Root cause:** User evaluation: JS runtime sizing is already implemented, easier to test, easier to debug, and easier to add caps/floors than layered CSS math.
- **Beyond scope because:** Architectural decision made during corrective work, not part of any planned task.
- **Changes:**
  - `src/app/globals.css` — removed `[data-grid-container]` / container-query block added in MI-3
  - `src/components/grid/grid-view.tsx` — removed `data-grid-container` attribute; JS runtime via `grid-layout.ts` became sole sizing authority
- **Resolution:** JS-only path confirmed as working approach; container queries deferred (later revisited in AI-1).

### MI-5: Max node-size cap for large displays
- **Status:** Closed
- **Discovered:** After MI-3 and mi-4 — on QHD/UHD displays, uncapped `min(cellW, cellH)` produces oversized nodes
- **Root cause:** No upper bound on computed node size in `grid-layout.ts`.
- **Beyond scope because:** Sizing system was introduced during corrective work (MI-3), not planned.
- **Changes:** `src/lib/grid-layout.ts` — `MAX_NODE_SIZE_PX = 96` cap applied after inset subtraction
- **Resolution:** Cap in place; nodes do not exceed 96px on large displays.

### MI-6: Design-token workflow vs. JS runtime sizing authority (AI-1)
- **Status:** Closed
- **Discovered:** After MI-3/MI-4 — the intended design-token-centered workflow (DESIGN_TOKENS.md as visual rules authority) contradicts the actual state where `grid-layout.ts` is the sizing authority for all grid node measurements
- **Root cause:** Cell-aware sizing requires viewport measurement, which pure CSS tokens cannot express without container queries. Container queries were attempted (MI-4) then removed because JS is easier to test, debug, and extend.
- **Beyond scope because:** This is an architectural authority conflict, not a bug or task-level issue. No planned task addressed the sizing authority model.
- **Resolution:** Three-layer token model implemented — `:root` holds input tokens/policy knobs (including `--grid-node-max-size: 96px`); `.grid-cell-container` cells use `container-type: size`; `@container grid-cell` rule computes all derived `--grid-node-*` vars on cell children. `grid-layout.ts` deleted. `grid-view.tsx` ResizeObserver removed. Build passes, all tests pass. **Awaiting visual parity confirmation from user at FHD (1920×1080), QHD (2560×1440), and UHD (3840×2160) before closing.** Primary concern: does the 96px cap protect the layout on large displays, and do proportions hold at each resolution?
- **Changes:** `src/app/globals.css` (added container query rules), `src/components/grid/grid-view.tsx` (removed JS sizing, added `grid-cell-container` class), `src/components/grid/grid-view.test.tsx` (redesigned), `src/lib/grid-layout.ts` (deleted), `src/lib/grid-layout.test.ts` (deleted)

---

## Minor Issues
*(Issues reported directly by the user, or surfaced through user questioning or validation)*

### mi-1: Node card icon/title slot separation
- **Status:** Closed
- **Reported:** Batch 1 visual feedback — icon size appeared to change with title length
- **Root cause:** Title slot used `flex h-5 items-center justify-center` with inline `span`. The flex container did not reliably constrain span width, so `truncate` did not fire. Long titles expanded the card footprint.
- **Changes:** `src/components/grid/node-card.tsx` — replaced `div.flex > span` with `div.h-5.w-full.overflow-hidden > p.truncate.leading-5`
- **Resolution:** Block-level `<p>` fills container width naturally; `overflow-hidden` hard-clips. Confirmed fixed.

### mi-2: Node visual tuning (reference-redesign)
- **Status:** Closed
- **Reported:** User provided `references/dotted.png` and `references/node4.png` as target design
- **Changes:** `src/components/grid/node-card.tsx` — icon `h-8.5 w-8.5`, padding `p-3`, title `text-xs font-semibold`, `shadow`, `rounded-3xl`. Recipe written to `docs/recipes/node-card-recipe.md`.
- **Resolution:** Visual tuning applied; recipe documented.

### mi-3: Drag ring/border removal
- **Status:** Closed
- **Reported:** Batch 1 visual feedback — drag borders looked heavy and inconsistent with clean tile aesthetic
- **Changes:** `src/components/grid/grid-view.tsx` — removed `isOver && "ring-2 ring-primary/60 ring-offset-2"` from `GridDropCell` and `DraggableNodeCard`. Drag feedback now uses only the dotted-area indicator.
- **Resolution:** Ring highlights removed; drag visual feedback relies on dotted area only.

### mi-4: Grid dimension change (12×8 → 18×9)
- **Status:** Closed
- **Reported:** User decision during visual tuning — grid density iterated from 12×8 to 15×8 to 18×9 across Phase 9
- **Changes:**
  - `src/lib/constants.ts` — `GRID_COLS = 18`, `GRID_ROWS = 9`
  - `src/app/globals.css` — `--grid-cols: 18`, `--grid-rows: 9`
  - `docs/DESIGN_TOKENS.md` — updated to 18×9; grid-bg values updated to match globals.css
  - `docs/SPEC.md` — updated to 18×9 (routes and constants table)
  - `docs/recipes/node-card-recipe.md` — updated to 18×9
  - `docs/prd.md` — amendment note updated (12×8 → 15×8 → 18×9)
  - `CLAUDE.md` — updated to 18×9
- **Resolution:** 18×9 confirmed by user after visual review at FHD/QHD/UHD. FHD nodes render at ~84px (comfortable), QHD at 73% cell fill (materially improved density). Closed.

### mi-5: Node hover/drag cursor and drag-darken
- **Status:** Closed
- **Reported:** Batch 1 visual feedback — cursor and opacity adjustments needed for the new tile design
- **Changes:** `src/components/grid/grid-view.tsx` — `isDragging` prop threaded to `NodeCard`; `src/components/grid/node-card.tsx` — accepts `isDragging` prop for visual state
- **Resolution:** Drag visual state (cursor + opacity) confirmed working.

### mi-6: Large-display grid sparsity on QHD/UHD
- **Status:** Closed
- **Reported:** User visual review — 15×8 looks fine on FHD, but node-to-node spacing feels too sparse on QHD and worse on UHD
- **Changes:**
  - Max-width grid constraint attempted first (`--grid-max-width: 120rem`, `mx-auto` on grid surface), then rejected — GridDO must remain a full-viewport workspace
  - Root cause identified: fixed grid density causes increasing visual sparsity as resolution grows (96px node in a 163px cell on QHD → 60% fill)
  - Resolution: 18×9 global grid adopted — denser cells, no stored-coordinate issues, no resolution-dependent branching (see mi-4)
- **Resolution:** 18×9 selected after evaluating 15×8, 18×9, 20×10 candidates. 18×9 balances FHD readability (84px nodes, comfortable above floors) with QHD density (73% fill, materially improved). Confirmed by user visual review. Closed.
