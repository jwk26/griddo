# Issues — Phase 8

> Phase 8 was a recipe-driven redesign pilot for the Bit Detail surface. It tested whether a precise surface recipe improves implementation fidelity and produced evidence for the reference-redesign workflow.

## Issue 1: Connecting line geometry and ownership

- **Problem:** Recipe specified `left-[11px]` for a shared connecting line inside a `pl-6` container. The dot (w-3.5 = 14px) centers at 31px from the container edge, not 11px. Additionally, there were two competing connector systems: a popup-level shared rail (absolute-positioned) and per-item connector segments in ChunkItem.
- **Root Cause:** (a) Recipe values written in isolation without CSS box model validation. (b) Connector ownership was not specified in the recipe — the popup drew a background rail while ChunkItem drew per-item segments, creating overlap risk.
- **Intermediate fix:** Updated position to `left-[31px]` (Gemini post-code review).
- **Final resolution:** Removed the popup-level shared rail entirely. Connector chain is now owned by ChunkItem (per-item `showConnector` segments) and ChunkPool (empty-state placeholder row). Single ownership, no overlap.
- **Learning:** (a) Validate recipe geometry: `left-[X]` must equal `padding-left + (element-width / 2)`. (b) Document connector/rail ownership explicitly in the recipe — "which component owns the connecting line" prevents the class of bug where two components draw the same visual element.

## Issue 2: Duplicate untimed-step rendering

- **Problem:** `ChunkTimeline` rendered `orderedChunks` (untimed steps) in addition to its timed steps. `ChunkPool` also renders untimed steps. The duplication became visible when both components shared a connecting line.
- **Root Cause:** Pre-existing bug invisible in Phase 7's visually separated layout. ChunkTimeline was intended to own timed steps only, but its implementation included untimed steps.
- **Solution:** Removed the `orderedChunks` render from ChunkTimeline. ChunkPool owns untimed steps; ChunkTimeline owns timed steps.
- **Learning:** The recipe had no language for component ownership boundaries. This class of bug is invisible to screenshot review — it requires understanding data flow.

## Issue 3: Null-deadline state contradiction in recipe

- **Problem:** Recipe had two contradictory specs: "No deadline indicator rendered" vs "Existing behavior preserved."
- **Root Cause:** Recipe written before null-deadline UX was resolved.
- **Solution:** Implemented "Add date" button (Calendar icon + text). User confirmed. Recipe updated.
- **Learning:** Recipes must make a definitive choice for every state, or explicitly flag "TBD."

## Issue 4: Ring label accessibility (text-[10px])

- **Problem:** Progress ring label used `text-[10px]`, below 12px accessible floor.
- **Root Cause:** Arbitrary pixel value without accessibility check.
- **Solution:** Changed to `text-xs` (12px). Caught by Gemini pre-code review (HIGH).
- **Learning:** Use `text-xs` as the minimum for displayed text.

## Issue 5: Missing flex-wrap on metadata row

- **Problem:** Priority pill and deadline chips overflowed at narrow widths.
- **Root Cause:** Recipe didn't mention flex overflow handling.
- **Solution:** Added `flex-wrap`. Caught by Gemini post-code review.
- **Learning:** Any flex row with variable-width chips needs `flex-wrap`. Recipe standard.

## Issue 6: Empty-state redesign

- **Problem:** Original empty state was a decorative line stub + hollow dot rendered by `BitDetailPopup`. This was disconnected from the per-item connector system and served no interactive purpose.
- **Intermediate fix:** Changed alignment from `items-center` to `items-start` (Gemini post-code review).
- **Final resolution:** Replaced decorative empty state entirely with an interactive placeholder row in `ChunkPool`: dot + "Add a step" text + visible drag/trash icons. Clicking opens inline input mode immediately. This is a functional affordance, not a decoration. Connector ownership stays fully within ChunkPool/ChunkItem.
- **Learning:** Empty states should be interactive affordances when the primary action is "add the first item." The empty state is not just a visual decoration — it should be the entry point.

## Issue 7: Pilot record not updated during implementation

- **Problem:** Running record was supposed to be updated after each task. Filled in retroactively.
- **Root Cause:** Reflective observation step dropped under implementation pressure.
- **Solution:** Filled retroactively. No information lost.
- **Learning:** Make pilot record updates a structural checkpoint, not voluntary.

## Issue 8: Layout jumps in Add description and Add a step

- **Problem:** Clicking "Add description" or "Add a step" caused visible layout shifts. The surrounding content jumped when switching from resting state to editing state.
- **Root Cause:** Two related but distinct causes:
  - **Add description:** The resting state (`<button>`) and editing state (`<textarea>`) are different DOM elements with different browser intrinsic sizing. Even with matching CSS, a `<button>` and a `<textarea>` compute to different heights due to user-agent form-control rendering rules. The element swap itself triggered layout recalculation.
  - **Add a step:** The entire row was being destroyed and recreated between resting and editing states. Additionally, the placeholder text and input had different box metrics (border, padding, line-height differences).
- **Intermediate attempts:** (a) Matched `min-h-[60px]` on button and textarea. (b) Removed `rows={3}` and added `p-0`. (c) Stripped border/background from input. These improved but did not fully resolve the jumps.
- **Final resolution:**
  - **Description:** Stable shell pattern — a `relative min-h-[60px]` wrapper stays mounted; both `<textarea>` and `<button>` are `absolute inset-0` inside it. The layout-participating box never changes size; only internal content swaps.
  - **Add a step:** Stable row pattern — one mounted row with `composerRowProps` (interactive when empty, passive when adding). Only the content area inside the row swaps between `<p>` and `<input>`. Both use explicit matching metrics: `h-[17px] text-[13px] leading-[17px]`.
- **Learning:** When swapping between a text element and a form control:
  1. Do not rely on matching CSS alone — browser intrinsic sizing for form controls differs from text elements.
  2. Stabilize the outer container first (keep it mounted, fixed size).
  3. Swap only the minimum inner content.
  4. Use explicit height + line-height on both states (not just font-size).

---

## Summary

| # | Issue | Resolution |
|---|-------|------------|
| 1 | Shared rail geometry + dual connector systems | Removed shared rail; per-item connectors in ChunkItem/ChunkPool |
| 2 | Duplicate untimed-step rendering | Removed from ChunkTimeline — human code review |
| 3 | Null-deadline recipe contradiction | "Add date" button — user confirmed |
| 4 | Ring label `text-[10px]` | Changed to `text-xs` — Gemini pre-code HIGH |
| 5 | Missing `flex-wrap` on metadata row | Added — Gemini post-code MEDIUM |
| 6 | Decorative empty state | Replaced with interactive placeholder row in ChunkPool |
| 7 | Pilot record not updated during implementation | Filled retroactively — process gap documented |
| 8 | Layout jumps (description + step-add) | Stable-shell + stable-row patterns |
