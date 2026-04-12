# Issues — Phase 10

> Live execution record for Phase 10: Breadcrumb + Deadline UX (Tasks 54-58).

---

## Main Issues
*(Execution issues discovered by the agent, architecture issues, structural changes beyond planned scope)*

*None so far.*

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
- **Status:** Open (approval blocker for Task 54)
- **Discovered:** User testing after Batch 2 commit (1d14f96)
- **Reproduction:** Load `/` (L0) or any single-level grid (`/grid/<id>` with no ancestors). The breadcrumb pill is visibly narrower than the text it contains — "Home" / node title is clipped before `overflow-x-auto` even activates.
- **Root cause (hypothesis, strong):** In `src/components/layout/grid-runtime.tsx:269` the absolute wrapper is:
  ```tsx
  <div className="pointer-events-none absolute top-3 left-3 z-30 flex flex-col items-start gap-1.5">
  ```
  It has `left-3` but no `right-3`. With `items-start` on the flex column and no right anchor, the wrapper collapses to shrink-to-fit (content-width). Inside, `<nav>` declares `max-w-[calc(100%-2rem)]`. Because the wrapper's width is already the content width, `100%` resolves against the already-shrunk content, so the max-width becomes a circular constraint that clips rather than permits growth.
- **Proposed fix:** Add `right-3` to the absolute wrapper so it stretches across the full `main` width. The inner nav's `max-w-[calc(100%-2rem)]` then resolves against the real available width and `overflow-x-auto` takes over when content exceeds it.
- **Acceptance for close:** Home segment is fully visible at L0. Long single-node titles expand the nav up to `calc(100% - 2rem)` before scrolling horizontally. No visible clipping at L0/L1.
- **Approval blocker rationale:** mi-2 is a visual-contract regression on a Task 54 surface. Task 54 cannot be marked `[x]` until this is fixed.

### mi-3: Breadcrumb text wraps — missing `whitespace-nowrap` on segments and current-page span
- **Status:** Open (approval blocker for Task 54)
- **Discovered:** User testing after Batch 2 commit (1d14f96)
- **Reproduction:** Navigate into a node with a long title. Text wraps to a second line inside the pill, breaking the `h-8` fixed height. Confirmed to affect **both CJK runs and long Latin titles** — not only Korean.
- **Root cause:** `src/components/layout/breadcrumbs.tsx`
  - Segment button className (line 33) lacks `whitespace-nowrap`:
    ```
    "rounded-md px-1.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
    ```
  - Current-page span className (line 96) lacks `whitespace-nowrap`:
    ```
    "px-1.5 text-xs font-semibold text-foreground"
    ```
  Under a constrained container (aggravated by mi-2), browsers break long word runs to fit available width. Without `whitespace-nowrap` the text wraps; with it, overflow falls through to the nav's `overflow-x-auto` horizontal scroll — which is the intended behavior.
- **Proposed fix:** Add `whitespace-nowrap` to both the segment button className and the current-page span className. Depends on mi-2 being fixed first — otherwise no-wrap text in a shrunk container will simply overflow without a scrollable parent.
- **Acceptance for close:** No vertical wrap in the breadcrumb regardless of language or title length. Overlong chains become horizontally scrollable inside the nav pill while preserving `h-8`.
- **Approval blocker rationale:** Same contract regression as mi-2. Task 54 cannot be marked `[x]` until resolved.

### mi-4: Vertical scrollbar appears on main content area when dragging bits near the bottom of the grid
- **Status:** Open (provisional Task 54 approval blocker)
- **Discovered:** User testing after Batch 2 commit (1d14f96)
- **Reproduction:** Enter a grid (any non-empty L1/L2). Begin dragging a bit card and move the drag cursor toward the lower rows of the grid. A vertical scrollbar appears on the `main` scroll container for the duration of the drag and may persist briefly after drop.
- **Prior art — drag-induced overflow class (not framed as a Task 54-only issue):**
  - **Task 46 (DnD Close-out)** explicitly addressed the **drag-induced overflow class** on the horizontal axis: *"Prevent drag interaction from expanding grid width or producing horizontal overflow during drag near the viewport edge. Start with the smallest fix: apply `overflow-x-hidden` and `min-w-0` on the grid scroll/container path. If needed, force `overflow-hidden` while a drag is active. Do not use `DragOverlay` unless container overflow clipping cannot solve the horizontal scrollbar issue without breaking drag UX."* (docs/EXECUTION_PLAN.md:1231)
  - **Phase 9 Amendment policy (docs/EXECUTION_PLAN.md:1276):** *"Keep `autoScroll={false}` (confirmed direct fix for drag-right overflow)."* This is already applied in `grid-runtime.tsx` (DndContext `autoScroll={false}`) and must be preserved.
  - **Phase 4 Issue 3** is a different class — scrollbar **suppression** on a fixed-height `overflow-x-auto` breadcrumb bar, solved with `[scrollbar-width:none] [&::-webkit-scrollbar]:hidden`. Still useful reference for scrollbar-UI handling, but **not** the same root cause as mi-4.
- **Reframing:** mi-4 may be a **reintroduction of the Task 46 drag-overflow class on the vertical axis** after Task 54's layout change — the old `main` was a flex column with a breadcrumb row + flex-1 grid child; Task 54 replaced that with a single relative `main` containing an absolute breadcrumb cluster and an `h-full overflow-y-auto overflow-x-hidden` scroll child. The smallest-fix pattern from Task 46 (overflow clipping + axis-appropriate `min-*-0`, optional `overflow-hidden` while dragging) applies here on the vertical axis.
- **Investigation plan (Track B — use Task 46 as direct prior art):**
  1. Confirm `autoScroll={false}` is still set on the `DndContext` in `grid-runtime.tsx` (Phase 9 Amendment policy preservation check).
  2. Inspect the new layout: `main` = `relative ml-12 flex-1 overflow-hidden`; scroll child = `h-full overflow-y-auto overflow-x-hidden`. Classic flex-child height escape suspects: missing `min-h-0` on `main` or on the grid child; grid content's intrinsic height exceeding `main`'s available height; `@dnd-kit` drop placeholder or transform creating a temporary vertical layout overflow inside the scroll container.
  3. Apply the smallest-fix pattern from Task 46, translated to the vertical axis:
     - Try adding `min-h-0` to `main` first.
     - If that's insufficient, add `min-h-0` to the scroll child or wrap with an overflow-constrained positioning parent.
     - Last resort: force `overflow-hidden` on the scroll container while a drag is active (matches Task 46's conditional-clipping suggestion).
  4. **Do not** introduce `DragOverlay` unless all container-clipping options fail (Task 46 explicit policy).
- **Provisional blocker rationale:** mi-4 is the drag-overflow class showing up again on the vertical axis in the post-Task 54 layout. Until the Task-46-pattern fix is applied and verified, Task 54 cannot be approved. If post-fix evidence shows mi-4 reproduces pre-Phase-10 as well, it can be detached from Task 54 as pre-existing; for now it remains a blocker.

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

### mi-6: Cursor affordance fails across most of Bit card body (icon area OK)
- **Status:** Open (likely pre-existing Phase 9 gap — NOT a Task 54 regression)
- **Discovered:** User testing after Batch 2 commit (1d14f96), but diagnosis suggests it predates this batch.
- **Reproduction:** Hover any Bit card. The **left icon area** shows the expected pointer/grab cursor. The rest of the Bit card body (title text, description preview, deadline row, the majority of the visible surface) shows the **text I-beam cursor**, not pointer/grab.
- **Root cause:** `src/components/grid/bit-card.tsx` — the outer `<div role="button" onClick={onClick}>` does not set an explicit cursor class. The drag wrapper in `grid-view.tsx` (`DraggableBitCard`) sets `cursor-grab` + `active:cursor-grabbing`, but that is overridden on child text elements: browsers default `<p>` to the text I-beam. The left icon area escapes the override because `<Icon>` renders as an SVG, which does not trigger the text-cursor default. Everywhere else (title `<p>`, deadline text), the default text cursor wins over the parent's `cursor-grab`.
- **Cross-reference:** Phase 9 mi-5 (`docs/issues/Issues_Phase_9.md`) fixed a related cursor issue on Node tiles (`node-card.tsx`) but did not apply the same fix to `bit-card.tsx`. This is a gap in Phase 9's scope, not a Batch 2 regression.
- **Proposed fix:** Add `cursor-pointer select-none` to the BitCard outer div. `select-none` prevents text-selection feedback on drag initiation; `cursor-pointer` restores the button affordance. Hover state inherits from parent drag wrapper so the grab cursor still appears on the drag-enabled surface during drag via the wrapper's `active:cursor-grabbing`.
- **Classification note:** Because this is pre-existing (not caused by Task 54), it does not block Task 54 approval. It will be fixed in the same parallel fix track as mi-2 / mi-3 because the fix is trivial and the batch is already in a fix loop.

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
