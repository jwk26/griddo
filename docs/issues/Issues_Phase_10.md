# Issues — Phase 10

> Live execution record for Phase 10: Breadcrumb + Deadline UX (Tasks 54-59).

---

## Batch Plan

### Original Proposal (locked — do not edit)
- **Batch 1:** Task 58 (ui-heavy) — DateFirstDeadlinePicker
- **Batch 2:** Task 54 (ui-heavy) — Compact Breadcrumb Redesign
- **Batch 3:** Tasks 56 + 57 (mixed) — Parent deadline display + L0 deadline enforcement
- **Batch 4:** Task 55 (ui-heavy) — Node Deadline Quick-Edit Surface

Dependency order at phase open: 58 → 54 → 56 → 57 → 55. Task 59 did not exist at phase open.

### Execution Status

| Batch | Tasks | Status |
|-------|-------|--------|
| 1 | Task 58 | Implemented |
| 2 | Task 54 | Implemented |
| 3a | Task 56 | Implemented |
| 3b | Task 57 | Implemented |
| 4 | Task 55 | Implemented |
| 5 | Task 59 | Implemented |
| 6 | Task 59b | Implemented |

### Deviations
- **Batch 3 split into 3a (Task 56) and 3b (Task 57).** Task 56 went through enough revision rounds to justify its own checkpoint; the split was handled implicitly during execution rather than being surfaced to the user at the time. Recorded retroactively.
- **Task 59 added from mi-5 promotion.** Not in the original proposal; slotted after Batch 4 per dependency on Tasks 54 and 55.
- **Task 59 scope narrowed; Task 59b created.** Migration removed from Task 59 (forward-only protection). Legacy overlap cleanup tracked as Task 59b. See ED-3.

---

## Main Issues
*(Execution issues discovered by the agent, architecture issues, structural changes beyond planned scope)*

### close-1: Hook API boundary violations found at conformance review

- **Status:** Closed
- **Discovered:** Conformance review at phase close-out
- **Violations:**
  - `breadcrumb-deadline.tsx` imported `getDataStore` directly for `getChildDeadlineConflicts` (a validation read in a user event handler — not a reactive read, but still outside the hook boundary)
  - `grid-runtime.tsx` imported `getDataStore` directly for `runBreadcrumbZoneMigration` (a write in a ResizeObserver callback)
  - `use-dnd.ts` imported `useBreadcrumbZoneStore` from Zustand (hook importing a Zustand store — blocked by the state-separation rule)
- **Root cause:** Task 59/59b were implemented under deadline pressure with the migration call landing in the component layer. The `getChildDeadlineConflicts` call was similarly written directly in `breadcrumb-deadline.tsx` rather than being routed through a hook. `use-dnd.ts` needed blocked-cell state at drop time and reached for the store directly inside the hook rather than receiving it as a parameter.
- **Fix:** `getChildDeadlineConflicts` added to `useNodeActions`; `runBreadcrumbZoneMigration` added to `useGridActions`; `useDnd` refactored to accept a `getBlockedCells: () => Set<string>` parameter — store access stays in the component layer where Zustand imports are permitted. All test mocks updated.
- **Files changed:** `use-node-actions.ts`, `use-grid-actions.ts`, `use-dnd.ts`, `breadcrumb-deadline.tsx`, `grid-runtime.tsx`, `calendar/layout.tsx`, plus test files.

---

## Minor Issues
*(Small fixes, quality corrections, non-blocking observations)*

### mi-1: useEffect dependency regression in edit-node-dialog.tsx
- **Status:** Closed
- **Discovered:** During Batch 1 code quality pass (Task 58)
- **Root cause:** Codex changed useEffect dependency from `[open, node?.id]` to `[open, node]`, which would cause unnecessary state resets when the node object reference changes without the ID changing.
- **Changes:** Reverted to `[open, node?.id]` with eslint-disable comment
- **Resolution:** Fixed during quality pass.

---

## User-Reported Issues
*(Issues flagged by the user during review or testing)*

### mi-2: Breadcrumb clips at root (L0) and L1 — floating container never reaches full width
- **Status:** Closed (user-confirmed via runtime verification after commit d47b54a)
- **Discovered:** User testing after Batch 2 commit (1d14f96)
- **Reproduction:** Load `/` (L0) or any single-level grid (`/grid/<id>` with no ancestors). The breadcrumb pill is visibly narrower than the text it contains — "Home" / node title is clipped before `overflow-x-auto` even activates.
- **Root cause:** In `src/components/layout/grid-runtime.tsx` the absolute wrapper had `left-3` but no `right-3`. With `items-start` on the flex column and no right anchor, the wrapper collapsed to shrink-to-fit (content width). Inside, `<nav>` declared `max-w-[calc(100%-2rem)]`, which resolved against the already-shrunk content — a circular constraint that clipped rather than permitting growth.
- **Fix (Track A stage 2 — Gemini design spec, Codex implementation):** Added `right-3` to the absolute wrapper in `src/components/layout/grid-runtime.tsx:270`. The wrapper now stretches across the full `main` width; the inner nav's `max-w-[calc(100%-2rem)]` resolves against the real available width and `overflow-x-auto` takes over when content exceeds it. `items-start`, `pointer-events-none`, and the inner `pointer-events-auto` wrapper are all preserved.
- **Files changed:** `src/components/layout/grid-runtime.tsx` (line 270, one class add)
- **Verification:** `pnpm test` (30 files, 106 tests) and `pnpm build` pass. Existing `grid-runtime.test.tsx` wrapper class assertion still passes because `toHaveClass` checks individual class presence, not full-string match.
- **Acceptance for close:** Home segment is fully visible at L0. Long single-node titles expand the nav up to `calc(100% - 2rem)` before scrolling horizontally. No visible clipping at L0/L1. **Awaits user visual confirmation.**

### mi-3: Breadcrumb text wraps and compresses — missing `whitespace-nowrap` and `shrink-0`
- **Status:** Closed (user-confirmed via runtime verification after commit d47b54a)
- **Discovered:** User testing after Batch 2 commit (1d14f96)
- **Reproduction:** Navigate into a node with a long title. Text wraps to a second line inside the pill, breaking the `h-8` fixed height. Confirmed to affect **both CJK runs and long Latin titles** — not only Korean.
- **Root cause:** Segment button and current-page span in `src/components/layout/breadcrumbs.tsx` lacked `whitespace-nowrap`. Under a constrained container (aggravated by mi-2), browsers broke long word runs to fit available width. Additionally, flex children had no `shrink-0`, so the breadcrumb compressed instead of triggering the nav's `overflow-x-auto` horizontal scroll.
- **Fix (Track A stage 2 — Gemini design spec, Codex implementation):**
  - Segment button: added `shrink-0 whitespace-nowrap` — prevents compression and vertical wrap.
  - Ancestor chevrons (inside the `<Fragment>`-wrapped ancestor items): added `shrink-0` directly to each `ChevronRight` (Fragment kept; no new wrapper div introduced per Gemini's spec).
  - Current-page chevron: added `shrink-0`.
  - Current-page span: added `whitespace-nowrap shrink-0`.
- **Files changed:** `src/components/layout/breadcrumbs.tsx` (four className edits)
- **Verification:** `pnpm test` (30 files, 106 tests) and `pnpm build` pass. Works for both CJK (no-space runs) and long Latin titles (word-break default overridden by `whitespace-nowrap`). Deep chains now trigger horizontal scroll in the nav without compressing individual segments.
- **Acceptance for close:** No vertical wrap in the breadcrumb regardless of language or title length. Overlong chains become horizontally scrollable inside the nav pill while preserving `h-8`. Chevrons and segments never squish. **Awaits user visual confirmation.**

### mi-4: Vertical scrollbar appears on main content area when dragging bits near the bottom of the grid
- **Status:** Closed (user-confirmed via runtime verification after commit d47b54a)
- **Discovered:** User testing after Batch 2 commit (1d14f96)
- **Reproduction:** Enter a grid (any non-empty L1/L2). Begin dragging a bit card and move the drag cursor toward the lower rows of the grid. A vertical scrollbar appears on the `main` scroll container for the duration of the drag and may persist briefly after drop.
- **Prior art used:**
  - **Task 46 (DnD Close-out, docs/EXECUTION_PLAN.md:1231)** — binding smallest-fix pattern: container overflow clipping + axis-appropriate `min-*-0`, conditional `overflow-hidden` while dragging, never introduce `DragOverlay` unless container-clipping fails.
  - **Phase 9 Amendment (docs/EXECUTION_PLAN.md:1276)** — `autoScroll={false}` on `DndContext` must be preserved.
- **Diagnosis (Track B — Codex investigation):** `autoScroll={false}` is still set and preserved. `main` itself did NOT experience height escape. The root cause was different: the inner grid scroll wrapper gained vertical overflow during drag because the `@dnd-kit`-transformed active draggable extended a few pixels below the wrapper, which made the `overflow-y-auto` container show a transient scrollbar. This is NOT a flex-child `min-h-0` problem — `main` stayed fixed-height throughout. Because the virtual overflow is created by the drag transform rather than intrinsic content height, the `min-h-0` step from the Task 46 escalation ladder would not help; the Task 46 "conditional `overflow-hidden` while dragging" step is the correct fix.
- **Fix (Track B — Codex implementation):** In `src/components/layout/grid-runtime.tsx`, the grid scroll wrapper now stays `overflow-y-auto` at rest but switches to `overflow-hidden` while `activeItem` is non-null. Added `data-dragging` attribute as a regression seam. `autoScroll={false}` left unchanged. Added regression test `clips the grid scroll wrapper while a drag is active` in `grid-runtime.test.tsx` asserting the wrapper enters the clipped overflow state during an active drag.
- **Files changed:** `src/components/layout/grid-runtime.tsx`, `src/components/layout/grid-runtime.test.tsx`
- **Verification:** `pnpm test` (30 files, 106 tests — new regression test included) and `pnpm build` pass. Codex live-repro after the fix: dragging near the bottom on both seeded L1 and L2 grids kept the wrapper at full width with `overflowY: hidden` during drag; the vertical scrollbar no longer appeared.
- **Acceptance for close:** No vertical scrollbar appears on the main scroll container during drag. Vertical scrolling still works normally when no drag is active (tall grids still scroll). `autoScroll={false}` preserved. Regression test passes. **Awaits user visual confirmation.**

### mi-5: Breadcrumb cluster overlaps top-row grid items (Nodes / Bits)
- **Status:** Promoted to Execution Plan as new **Task 59: Dynamic Protected Breadcrumb Zone**
- **Discovered:** User testing after Batch 2 commit (1d14f96)
- **Reason for promotion:** Fix requires (a) a new layout rule affecting all auto-placement and manual placement paths, (b) a one-time migration for existing items already in the zone, (c) interaction with drag/drop and click-to-add, (d) its own acceptance criteria and independent review. This exceeds Task 54 scope and earns its own task slot.
- **Direction passed to Task 59:**
  - Zone is **dynamic** — derived from the rendered breadcrumb cluster footprint (breadcrumb pill + deadline line from Task 55), not a fixed cell count
  - Applies to BFS auto-placement and manual drag-drop / click-to-add
  - One-time migration for items already in the zone on upgrade
  - **No live reflow** on breadcrumb text edits (width changes during editing do not reposition items)
  - Breadcrumb absorbs excess width via `max-w` + `whitespace-nowrap` + horizontal scroll, not by reflowing the grid

### mi-6: Bit card drag ownership and cursor affordance misaligned with visible surface
- **Status:** Closed (user-confirmed via runtime verification after commit d47b54a)
- **Discovered:** User testing after Batch 2 commit (1d14f96); diagnosis confirms the root cause predates Batch 2.
- **Reproduction:** Hover any Bit card. The **left icon area** shows the expected grab cursor. Most of the Bit card body (title text, description preview, deadline row) shows the **text I-beam cursor**. More broadly, the visible Bit surface could visually extend horizontally, but the draggable / hit-tested surface and the cursor affordance did not reliably cover the full visible card area.
- **Root cause:** In the previous architecture, the visible Bit surface, the drag owner, and the effective hit/stacking area were misaligned. `DraggableBitCard` in `src/components/grid/grid-view.tsx` attached `useDraggable`'s `setNodeRef`, `attributes`, `listeners`, drag state, and transform style to an **outer wrapper div**, while the visible `BitCard` rendered inside that wrapper as a separate element. Cursor affordance on the visible card body was inherited from the outer wrapper and got overridden by browser defaults on child text nodes (`<p>` → I-beam), while the SVG icon escaped the override because SVG does not trigger the text-cursor default. Layering broad `pointer-events-none` hacks over the inner content was not a viable fix because it would break click-through to the popup. The real fix was to make the **visible `BitCard` root itself the drag owner** and give that surface the correct cursor + stacking contract so the visible surface, the hit area, and the drag affordance are one and the same element.
- **Cross-reference:** Phase 9 mi-5 (`docs/issues/Issues_Phase_9.md`) fixed a related cursor-affordance issue on Node tiles (`node-card.tsx`), but that fix applied cursor classes only — it did not move drag ownership. The Bit-card fix here goes further: it both moves drag ownership onto the visible surface and applies the cursor contract, which is why the drag wrapper in `grid-view.tsx` also changes. This is a pre-existing Phase 9 gap, not a Task 54 regression.
- **Fix (Track C — refactor beyond the original cursor-class scope):**
  - **`src/components/grid/bit-card.tsx`:** Refactored to `forwardRef<HTMLDivElement, BitCardProps>`. Props extended with `isDragging?: boolean` and `Omit<ComponentPropsWithoutRef<"div">, "children" | "onClick">` so `DraggableBitCard` can pass `ref`, `attributes`, `listeners`, `style`, and `data-*` attributes directly onto the visible card root. The outer visible `<div role="button">` now carries the drag/cursor contract: `relative z-10 inline-flex shrink-0 cursor-grab select-none items-stretch … active:cursor-grabbing …` plus a conditional `z-20 cursor-grabbing` branch when `isDragging` is true. The card stays **content-width** via `inline-flex shrink-0` rather than being forced to fill the full cell — the visible surface can extend horizontally without the hit area or stacking context becoming stale. The fix does **not** rely on broad `pointer-events-none` hacks over inner content layers.
  - **`src/components/grid/grid-view.tsx`:** `DraggableBitCard` no longer owns the drag wrapper. `useDraggable`'s `setNodeRef`, `attributes`, `listeners`, `isDragging`, and the transform-based `style` attach directly to the `BitCard` root via the new forwarded ref + spread props. The outer element in `DraggableBitCard` is now only a layout helper (`flex h-full items-center overflow-visible`) — it vertically centers the Bit within the grid cell and allows the card to overflow horizontally out of the cell bounds without being clipped. The drag owner, the hit-tested surface, and the visible surface are now all the same element.
- **Regression coverage (new tests):**
  - `src/components/grid/bit-card.test.tsx` — "keeps the card-root drag cursor contract without forcing full-cell sizing" asserts the outer card carries `inline-flex`, `shrink-0`, `z-10`, `cursor-grab`, `active:cursor-grabbing`, `select-none` and does **not** carry `h-full`, `w-full`, or `overflow-hidden`. "keeps passive content layers pointer-enabled while the card stays the drag owner" asserts the inner content layers do **not** have `pointer-events-none`.
  - `src/components/grid/grid-view.test.tsx` — "puts the draggable contract on the visible bit-card surface" asserts the rendered `[role="button"]` is the visible Bit with `data-grid-item="true"` and the `cursor-grab`, `active:cursor-grabbing`, `select-none` classes — i.e., the drag contract is on the visible Bit element, not on a separate wrapper.
- **Files changed:** `src/components/grid/bit-card.tsx`, `src/components/grid/grid-view.tsx`, `src/components/grid/bit-card.test.tsx`, `src/components/grid/grid-view.test.tsx`
- **Verification:** `pnpm test` (30 files, 109 tests — two new Bit-card assertions and one new grid-view assertion included) and `pnpm build` pass.
- **Classification note:** Because this is a pre-existing Phase 9 gap (not caused by Task 54), it does not block Task 54 approval. It was fixed in the same parallel fix track as mi-2 / mi-3 / mi-4 because the batch was already in a fix loop and the visible-surface/drag-ownership correction was the correct path forward once the cursor-class-only fix was rejected as too narrow.
- **Acceptance for close:** The Bit card body shows `cursor-grab` across the entire visible surface (not just the icon area); `cursor-grabbing` appears while the card is actively being dragged; the visible Bit is both the drag owner and the hit-test surface (dragging anywhere on the card starts the drag); content can extend horizontally without clipping; no text-selection highlight on drag initiation. **Awaits user visual confirmation.**

### mi-7: Edit Node dialog not reachable from L0 grid in edit mode
- **Status:** Closed
- **Discovered:** User testing during Batch 4 checkpoint (Task 55)
- **Reproduction:** At L0 (`/`), enter edit mode and click a Node tile. Expected: Edit Node dialog opens. Actual: navigates to `/grid/[nodeId]`.
- **Root cause:** `src/app/(grid)/page.tsx` (L0 page) did not pass `onNodeEditClick` to `GridView` and did not render `EditNodeDialog`. In `grid-view.tsx`, the edit-mode click branch (`isEditMode && onNodeEditClick`) falls through to navigation when `onNodeEditClick` is undefined. The L1 page (`[nodeId]/page.tsx`) was wired correctly; L0 was missed.
- **Fix:** Added `useState<Node | null>` + `onNodeEditClick={setEditingNode}` to `GridView` and `<EditNodeDialog level={editingNode?.level ?? 0} ...>` to the L0 page — same pattern as the L1 page. `level={0}` means the deadline section is hidden per Task 57.
- **Files changed:** `src/app/(grid)/page.tsx`
- **Verification:** `pnpm tsc --noEmit` and `pnpm test` (34 files, 132 tests) pass.

---

## Execution Decisions
*(Non-issue decisions made during execution that affect implementation)*

### ED-1: Time display variant — Option 1
- **Batch:** 1 (Task 58)
- **Context:** Codex Run 1 stopped with a question: when a time is set, should the Clock icon be (1) paired with time text in one control, (2) separate icon + time pill, or (3) replaced by time pill?
- **Decision:** Option 1 — Clock + time text inside one highlighted control. Rationale: Gemini spec says "Clock icon is highlighted" (stays visible, not replaced); most compact; preserves clock affordance for discoverability.
- **Asymmetry:** Calendar icon IS replaced by a date pill for custom dates (per Gemini spec section 6). Clock is NOT replaced. This is intentional — date values are longer ("Oct 24") and need readable text; time values ("2:30 PM") are short enough to pair with the icon.

### ED-2: Task 59 insertion point and renumbering of Phase 11 / Phase 12
- **Batch:** 2 (Task 54)
- **Context:** Promoting mi-5 to a new task required "Task 59", but Phase 11 already had a Task 59 (Calendar Sidebar + Header Redesign). User chose to renumber Phase 11 and Phase 12 downstream rather than append or sub-number.
- **Decision:** Insert new Task 59 (Dynamic Protected Breadcrumb Zone) at the end of Phase 10. Renumber Phase 11 Tasks 59–66 → 60–67. Renumber Phase 12 Task 67 → 68. All internal dependency references in Phase 11 are updated to the new numbers. Phase 11 note that refers to Task 62 (Parent Node Selector) is updated to Task 63.
- **Rationale:** Monotonic phase ordering is preserved. The single downstream cost is a renumbering delta contained in `docs/EXECUTION_PLAN.md` (no code references to these task numbers exist).

### ED-3: Task 59 narrowed to forward-only protection; migration split to Task 59b
- **Batch:** 5 (Task 59, pre-implementation)
- **Context:** Cross-model review (Entry 8 in `docs/brainstorming/execute-task/opinion-codex.md`) identified that the one-time migration sub-task adds significant implementation risk (per-parent markers, atomic writes, deterministic row-major processing, failure handling) while the actual user-facing value of Task 59 is preventing future placement conflicts. Migration relocates items that already work fine under `pointer-events-none` overlay. A global `breadcrumbZoneMigrationDone` flag is unsound when the zone is derived from rendered footprint.
- **Decision:** Task 59 = forward-only protection only (new placements, drag/drop, click-to-add, cross-parent landing). Migration removed and tracked as Task 59b (per-parent deferred remediation). Task 59b added to Phase 10 in EXECUTION_PLAN.md immediately — not deferred as untracked work.
- **Rationale:** Implementation risk drops significantly; file surface shrinks; test matrix becomes clearer; Task 59 stays focused on actual user-facing value. Cleanup remains tracked work.

### ED-4: `docs/WORKFLOW.md` updated as out-of-plan documentation change (Batch 6)
- **Batch:** 6 (Task 59b)
- **Context:** Codex updated `docs/WORKFLOW.md` as part of its implementation pass. The changes update workflow stage descriptions to reference `/execute-task` alongside `/execute-next-phase`, clarify the issue-doc lifecycle (live during execution, not only at close), update the skill-trigger table, fix a casing inconsistency (`docs/PRD.md` → `docs/prd.md`), and align the verification gate description with the full `test + build` gate. No code was changed.
- **Decision:** Accept the documentation changes. They are accurate, consistent with how Phase 10 was actually executed, and improve the workflow doc's alignment with current skill behaviour.
- **Rationale:** The changes are additive documentation corrections with no behavioural side-effects.
