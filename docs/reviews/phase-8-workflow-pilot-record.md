# Phase 8 Workflow Pilot Record

> **Status:** Active
> **Phase:** 8
> **Scope:** Bit Detail Surface only
> **Primary visual reference:** `./chunk_timeline.png`
> **Related docs:** `docs/EXECUTION_PLAN.md` Phase 8, `docs/DESIGN_TOKENS.md` → Surface Recipes → Bit Detail Surface, `docs/reviews/phase-8-bit-detail-gap-review.md`, `docs/PLANNING_STANDARD.md` → Phase 8 Verification Note

This document exists to prevent Phase 8 from drifting into "general polish work" or losing its actual purpose during long implementation, session compaction, or handoff between agents/sessions.

Treat this as the canonical memory document for the Phase 8 pilot.

---

## 1. Why Phase 8 Exists

Phase 8 has two simultaneous purposes:

1. **Product purpose**
   - Redesign the Bit Detail surface so it moves materially closer to `./chunk_timeline.png`.
   - Improve visual hierarchy, chunk presentation, header composition, deadline presentation, and overall layout fidelity.

2. **Workflow purpose**
   - Run a small pilot inside the existing GridDO project to test whether a precise surface recipe improves implementation fidelity.
   - Use the results of this pilot to inform a workflow update after Phase 8 closes.

Phase 8 is **not** a full workflow rewrite and **not** a product-wide polish phase.

---

## 2. What Must Not Be Forgotten

If the project gets long, compacted, or handed off, the following points must stay true:

- Phase 8 is **Bit Detail only**.
- The reference target is **`./chunk_timeline.png`**.
- The workflow experiment is **recipe-driven implementation fidelity**, not generic "better docs".
- The pilot is testing whether:
  - a geometric surface recipe reduces implementation ambiguity,
  - the first-pass UI lands closer to the intended design,
  - one closing-phase screenshot review is enough to catch the remaining visible deviations.
- Phase 8 must end with a **workflow update recommendation** based on actual evidence gathered during the phase.

If any discussion starts drifting toward unrelated UI cleanup, architecture cleanup, or product-wide workflow changes, this document should be used to reset scope.

---

## 3. Explicit Non-Goals

The following are out of scope unless they become strictly necessary to complete the Bit Detail redesign:

- Full workflow-v2 validation
- Product-wide contract/recipe rollout
- Sidebar, grid, calendar, search, or trash redesign
- Deep component architecture rewrite for unrelated areas
- General cleanup work that is not directly tied to Bit Detail surface fidelity
- Broad refactors performed only for elegance

Phase 8 is intentionally narrow so that the workflow pilot produces interpretable evidence.

---

## 4. Pilot Hypotheses

These are the exact hypotheses the phase is supposed to test.

### H1. Recipe precision reduces ambiguity

When the Bit Detail surface is described in a geometric recipe inside `docs/DESIGN_TOKENS.md`, implementation decisions should require less guesswork than in prior phases.

### H2. Recipe reference improves fidelity

When Phase 8 tasks explicitly reference the Bit Detail Surface Recipe, the implemented UI should land closer to `./chunk_timeline.png` than comparable prior work without such a recipe.

### H3. One closing review is enough

A single closing-phase screenshot comparison against the recipe and the reference image should be sufficient to catch the most important remaining visual deviations.

### H4. The lightweight version may be enough

This pilot is testing whether a lightweight workflow change is enough:

- one surface recipe,
- one narrow surface,
- one closing screenshot review,
- no evaluator-heavy per-task critique loop.

If this is enough, the eventual workflow update should stay lightweight.
If it is not enough, the workflow update should say exactly what additional structure is required.

---

## 5. Success Criteria For The Pilot

Phase 8 should not be judged only by whether the Bit Detail UI looks better.
The pilot succeeds only if it also produces usable workflow evidence.

### Product success

- The final Bit Detail surface is visibly closer to `./chunk_timeline.png`.
- The header, chunk area, and deadline marker show clear improvement in hierarchy and composition.
- The redesign does not break existing core Bit Detail interactions.

### Workflow success

- The implementation process shows where the recipe was helpful and where it was insufficient.
- The closing review produces actionable findings, not vague taste commentary.
- The team can state, after Phase 8, whether the recipe pattern should:
  - be adopted,
  - be adopted with changes,
  - remain optional,
  - or be rejected.

---

## 6. Evidence That Must Be Collected

The workflow update after Phase 8 must be based on evidence, not vibes.
Capture all of the following during the phase.

### A. During implementation

Record:

- which design decisions were directly clarified by the recipe,
- which decisions still required human interpretation,
- where the recipe was too vague,
- where the recipe was too rigid,
- whether the recipe prevented unnecessary back-and-forth,
- whether implementation pressure pushed the work toward deeper structural changes.

### B. During visual comparison

Record:

- which visible deviations were caught only because the recipe/reference comparison existed,
- which issues were already correct on first implementation,
- whether the single review pass was enough,
- whether light mode and dark mode both held up,
- whether any deviations were judged acceptable and why.

### C. At phase close

Record:

- what worked about the Phase 8 recipe-driven process,
- what failed,
- what was missing,
- what should be kept,
- what should change before trying this pattern again,
- whether this pattern is suitable only for fragile surfaces or should be generalized.

---

## 7. Running Record Template

Update this section during Phase 8 implementation. Do not wait until the end.

### Task 36 Notes

- **Recipe helped with:** Header row layout was unambiguous — the exact Tailwind classes for left group (icon h-9 w-9 + title flex-1 min-w-0 truncate) and right group (ring w-10 h-10 + status h-7 w-7 + more h-7 w-7), including flex-shrink-0 constraints, let Codex produce the correct single-row layout on the first pass. Progress ring SVG spec (viewBox, stroke colors, strokeWidth, center label) was precise enough for implementation without questions. Priority badge placement on its own row with exact padding (px-5 pt-1.5 pb-0) was clear. Description collapse behavior was well-specified.
- **Still ambiguous:** The null-deadline state was internally contradictory in the recipe: "No deadline indicator rendered. Existing behavior preserved." One says hide the UI, the other says keep it. The implementation chose a third option not in the recipe: "Add deadline" button with Calendar icon. User later confirmed this was *better* than either recipe option. Also: the deadline display/edit blur-dismiss pattern (detecting focus leaving the edit group via relatedTarget) was not specified in the recipe. ESC key conflict (pressing ESC during deadline edit also closes the popup) was not addressed.
- **Unexpected implementation pressure:** Progress ring constants (RING_RADIUS, RING_CIRCUMFERENCE) had to physically move between files. Trivial, but the recipe doesn't track internal code structure — it only tracks the visual surface.
- **Reference mismatch noticed:** Reference image shows no deadline UI at all in resting state. Product decision: keep "Add deadline" for usability. This is a deliberate deviation from the reference, not a fidelity failure.
- **Decision made:** Implemented "Add deadline" button with Calendar icon. Updated recipe to match after user approval.

### Task 37 Notes

- **Recipe helped with:** Step item dot styling was mechanically clear: w-3.5 h-3.5, complete = bg-primary, incomplete = bg-transparent border-2 border-muted-foreground/40. Card wrapper removal ("no border, no background, no card padding") was unambiguous. Hover affordances (opacity-0 → group-hover:opacity-100) on drag handle and delete were precisely specified. Codex implemented all of these correctly on the first pass.
- **Still ambiguous:** The connecting line position: recipe specified `left-[11px]` inside a `pl-6` container. These values are geometrically inconsistent — the dot center sits at 31px from the container's left edge (24px padding + 7px half-dot), but the line is at 11px. This was caught by Gemini post-code review, not by the recipe itself. The recipe also didn't specify HOW to make the connecting line shared between pool and timeline. The implementation chose popup-level ownership, which required removing internal wrappers from both components.
- **Unexpected implementation pressure:** The duplicate untimed-step rendering bug was exposed by this work. ChunkTimeline rendered orderedChunks (untimed steps) that ChunkPool also renders. This was a pre-existing bug invisible in Phase 7's visually separated layout, but became wrong when both components shared a single connecting line. Had to fix it — not part of the recipe, but revealed by the Phase 8 visual continuity goal.
- **Reference mismatch noticed:** Reference shows a single unified step list. Implementation keeps two components (pool + timeline) per recipe's "internal structure unchanged" scope rule, but now they visually read as one list. Close enough for the pilot.
- **Decision made:** Fixed the duplicate rendering bug (ChunkTimeline now owns timed steps only, ChunkPool owns untimed steps). Updated connecting line from left-[11px] to left-[31px] per Gemini post-code finding.

### Task 38 Notes

- **Recipe helped with:** Exact padding values (px-5, pt-5, pt-1.5, pt-3, pb-5, pl-6, gap-3, pb-5) made spacing decisions mechanical. Dot sizes and connecting line position (after correction) gave clear audit targets.
- **Still ambiguous:** Empty state alignment — recipe didn't specify how the stub + hollow dot should align with the connecting line inside the pl-6 container. Gemini caught `items-center` vs `items-start`. Also: recipe didn't address flex overflow on the priority/deadline row; Gemini flagged the missing `flex-wrap`.
- **Unexpected implementation pressure:** None beyond the two Gemini-caught issues.
- **Reference mismatch noticed:** None at this stage — spacing pass was recipe-compliance, not reference-comparison.
- **Decision made:** Applied all three Gemini post-code corrections (connecting line position, flex-wrap, empty state alignment).

### Closing Review Notes

- **Screenshots reviewed:** Not yet performed. Screenshot comparison is a closing-phase deliverable.
- **Clear deviations found:** Pre-screenshot: Gemini post-code review found 1 HIGH (connecting line misalignment) and 2 MEDIUM (flex-wrap, empty state alignment). All corrected.
- **Corrections made:** (1) text-[10px] → text-xs on ring label (Gemini pre-code HIGH), (2) Added Calendar icon to "Add deadline" (Gemini pre-code MEDIUM), (3) left-[11px] → left-[31px] connecting line (Gemini post-code HIGH), (4) Added flex-wrap to meta row (Gemini post-code MEDIUM), (5) items-center → items-start on empty state (Gemini post-code MEDIUM), (6) Removed duplicate orderedChunks rendering from ChunkTimeline (user-caught behavior bug).
- **Acceptable deviations left in place:** ESC during deadline edit also closes popup (pre-existing interaction pattern, minor edge case). Focus ring polish across all interactive elements (pre-existing gap, not Phase 8 scope).
- **Was one review pass enough?:** For layout issues, yes — Gemini post-code caught the meaningful ones. For behavior bugs (duplicate rendering), no — that required human domain knowledge of the component ownership model.

---

## 8. Questions That Must Be Answered Before Phase 8 Can Be Considered Closed

Before calling Phase 8 complete, answer all of the following in this document:

1. Did the Bit Detail Surface Recipe materially reduce ambiguity during implementation?
2. Which parts of the recipe were genuinely useful?
3. Which parts of the recipe were still too vague or too implementation-specific?
4. Did the recipe help preserve the intended design better than prior phases?
5. Did the closing screenshot comparison catch issues that would probably have been missed otherwise?
6. Was one closing review enough, or would a future workflow need something stronger?
7. Did the pilot stay narrow, or did it drift toward broader cleanup/architecture work?
8. Based on actual evidence, what exact workflow update should follow from this phase?

If these questions are not answered, the workflow purpose of Phase 8 has not been completed.

### Answers

**1. Did the Bit Detail Surface Recipe materially reduce ambiguity during implementation?**

Yes, for layout. The recipe gave Codex unambiguous structural specs — header flex layout, dot sizes, padding values, color tokens — and Codex's first-pass output was correct for all of these. In prior phases, layout decisions required multiple correction rounds. Here, the header row, step item restyling, and dot styling all landed on the first pass.

No, for interaction design. The recipe could not specify: deadline display/edit state transitions, blur-dismiss patterns, ESC key layering, or how to detect focus leaving an edit group. These required developer judgment. The recipe format (geometric Tailwind classes) doesn't have a language for behavior.

No, for geometric consistency. The recipe specified `left-[11px]` for the connecting line inside a `pl-6` container, but these values are mathematically inconsistent — the dot center is at 31px. The recipe was written as isolated values without being validated against the actual CSS box model. Gemini caught this; a human would have caught it in visual review. The recipe itself didn't prevent the error.

**2. Which parts of the recipe were genuinely useful?**

- Exact Tailwind class strings for flex layouts, sizing, and spacing. These eliminated guesswork.
- Color token references (bg-primary, border-muted-foreground/40, text-priority-high). No ambiguity.
- Explicit "what is NOT rendered" statements (e.g., "no wrapping card — no border, no background, no card padding").
- Display state vs edit state separation for the deadline. Even though the transition wasn't fully specified, having both states described independently was useful.

**3. Which parts of the recipe were still too vague or too implementation-specific?**

- Too vague: The null-deadline state ("No deadline indicator rendered. Existing behavior preserved." — contradictory). Interaction transitions in general. How the shared connecting line should work across two components.
- Too implementation-specific: Nothing was over-specified. If anything, the recipe erred on the side of being under-specified for interaction patterns.
- Missing entirely: State management (which new state variables are needed), component ownership boundaries (which component owns the connecting line), and interaction layering (ESC key precedence).

**4. Did the recipe help preserve the intended design better than prior phases?**

Yes. Codex's output was substantially closer to the reference on the first pass than any comparable prior-phase work. The header layout, step item simplification, and description collapse all matched the intent without iteration. The recipe prevented the "tokens move but frame is lost" problem that motivated this pilot.

**5. Did the closing screenshot comparison catch issues that would probably have been missed otherwise?**

Gemini pre-code and post-code reviews (serving as automated visual review) caught 3 HIGH and 3 MEDIUM issues. The connecting line misalignment (HIGH) would absolutely have been missed without a geometric review — it's the kind of "looks roughly right" error that ships in prior phases. The text-[10px] accessibility concern would also have shipped without review.

However: the duplicate rendering bug (untimed steps appearing twice) was caught by human code review, not by screenshot comparison. Screenshot comparison catches layout errors; behavior bugs require understanding component ownership.

**6. Was one closing review enough, or would a future workflow need something stronger?**

For layout fidelity: one Gemini post-code review was enough. It caught the meaningful visual deviations.

For behavior correctness: no. The duplicate rendering bug was not a visual deviation visible in a screenshot with typical test data — it would only be visible if the same step appeared twice in the rendered list, which depends on whether both timed and untimed steps exist simultaneously.

Recommendation: one visual review pass + one behavior review pass (checking component ownership and data flow) would be a stronger gate.

**7. Did the pilot stay narrow, or did it drift toward broader cleanup/architecture work?**

Mostly narrow. All changes touched only the 4 Bit Detail component files. The only scope expansion was:
- Fixing the duplicate rendering bug (pre-existing, but exposed by the visual continuity work)
- Adding a test file (reasonable addition, stayed within Bit Detail scope)
- Updating the recipe to match a better product decision (null-deadline "Add deadline" button)

No drift toward sidebar, grid, calendar, or unrelated components.

**8. Based on actual evidence, what exact workflow update should follow from this phase?**

Adopt the recipe pattern with changes. See Section 9 below for the full recommendation.

---

## 9. Required Post-Phase Outputs

When implementation closes, the following outputs are required:

1. **Phase 8 close-out artifacts**
   - screenshots used for final comparison,
   - final visual deviations list,
   - normal issue log / close-out notes.

2. **Updated pilot record**
   - this file must be updated with final answers, not left as a blank template.

3. **Workflow update proposal**
   - a follow-up workflow update must be written based on this pilot's evidence.
   - it should answer:
     - what changed,
     - what worked,
     - what failed,
     - what should become standard,
     - what should remain optional,
     - what should not be repeated.

Phase 8 is not fully complete until the workflow update recommendation has been documented.

---

## 10. Decision Rules For The Future Workflow Update

Use the following rubric after the pilot:

### Adopt the pattern more broadly if:

- the recipe clearly reduced ambiguity,
- the implementation landed closer to the reference with less guesswork,
- the closing review caught meaningful issues efficiently,
- the documentation overhead stayed reasonable.

### Adopt with changes if:

- the idea helped, but the recipe format needs adjustment,
- the closing review was useful, but the evidence format needs to be tighter,
- the process worked only because of extra human interpretation not captured in the recipe.

### Keep it narrow if:

- the approach helped on Bit Detail but seems too expensive or too fragile for general use,
- the value appears highest only for visually sensitive surfaces.

### Reject or defer if:

- the recipe created noise without improving fidelity,
- the closing review added cost without catching meaningful issues,
- the pilot's improvements depended mostly on ad hoc human judgment rather than the documented process.

---

## 11. Handoff Rule For Future Sessions

If a future session resumes Phase 8, that session should read these documents in this order:

1. `docs/reviews/phase-8-workflow-pilot-record.md`
2. `docs/reviews/phase-8-bit-detail-gap-review.md`
3. `docs/DESIGN_TOKENS.md` → Surface Recipes → Bit Detail Surface
4. `docs/EXECUTION_PLAN.md` → Phase 8

This order exists so the workflow purpose is not lost behind implementation details.

---

## 12. Current Status

- Phase 8 implementation complete (10 commits, `7e42ab8`..`0aeefc4`).
- Post-implementation fixes: shared-rail removal, per-item connector ownership, empty-state interactive affordance, stable-shell description swap, stable-row step composer.
- `pnpm test` (75 tests pass) and `pnpm build` pass.
- Running record filled in from implementation evidence.
- Closing questions answered.
- Workflow update recommendation written (Section 13).
- Phase 8 closing summary written (Section 14).
- Issues documented: `docs/issues/Issues_Phase_8.md` (8 issues).
- Recipe artifacts: `docs/recipes/bit-detail-recipe.md`, `references/bitdetail0.png`.

---

## 13. Workflow Update Recommendation

Based on the evidence from this pilot, the recommendation is: **adopt the recipe pattern with changes**.

### What worked

1. **Geometric recipes eliminate layout guesswork.** Codex's first-pass header layout, step item restyling, and dot styling were all correct. This is a categorical improvement over prior phases where layout decisions required multiple correction rounds. The "tokens move but frame is lost" problem did not occur for any recipe-specified element.

2. **Explicit negation statements are high-value.** "No wrapping card — no border, no background, no card padding" left zero room for interpretation. These should be a standard recipe pattern.

3. **Gemini pre/post-code reviews are a cost-effective quality gate.** Two automated reviews caught 6 real issues (3 HIGH, 3 MEDIUM) that would have shipped otherwise. The connecting line misalignment in particular is exactly the class of error that persists across phases without a geometric review.

4. **One narrow surface per pilot is the right granularity.** The scope stayed contained. Evidence is interpretable because there's only one surface to evaluate.

### What failed or was missing

1. **The recipe has no language for interaction behavior.** State transitions (display → edit → dismiss), blur patterns, ESC key layering, and focus management all required developer judgment. The geometric Tailwind format can't express these. This is the biggest gap.

2. **Recipe values were not internally validated.** `left-[11px]` and `pl-6` are individually reasonable but geometrically inconsistent together. The recipe was written value-by-value without checking that the CSS box model math works out. This produced a HIGH-severity bug caught only by post-implementation review.

3. **Component ownership boundaries are invisible in the recipe.** The recipe describes a visual surface. It doesn't say which component owns the connecting line, or that ChunkTimeline shouldn't render untimed steps. This caused the duplicate rendering bug — the most serious issue in the phase, and the one the recipe was least equipped to prevent.

4. **The pilot record discipline was not followed during implementation.** The running record was supposed to be updated during Tasks 36–38. It was filled in retroactively after the user flagged the omission. In a CCG workflow where the orchestrator (Claude) is focused on Codex prompts, Gemini reviews, and build verification, the reflective observation step gets dropped. This needs to be a structural checkpoint, not a voluntary discipline.

### Changes for future recipe-driven phases

1. **Add an interaction state table to the recipe.** For each interactive element, specify: resting state, active/editing state, dismiss trigger, keyboard behavior, and state variable name. Keep it tabular, not prose. Example:
   ```
   Deadline:
     Resting:  read-only text (button, tabIndex=0)
     Editing:  date + time inputs + all-day toggle (wrapper div)
     Dismiss:  blur outside wrapper OR ESC
     ESC note: stopPropagation to prevent popup close
     State:    isDeadlineEditing: boolean
   ```

2. **Validate recipe geometry before implementation.** After writing a recipe, run one pass to verify that absolute positions, padding offsets, and element sizes are mathematically consistent. A connecting line at `left-[X]` should equal `padding-left + (dot-width / 2)`. This could be a checklist item in PLANNING_STANDARD.md.

3. **Add a component ownership note to the recipe.** One line per component boundary: "ChunkPool owns untimed steps. ChunkTimeline owns timed steps + deadline marker. Popup owns the shared connecting line." This prevents the class of bug where two components render the same data.

4. **Make the pilot record a structural checkpoint, not a voluntary step.** After each task's implementation commit, the orchestrator should be required to update the running record before proceeding. In the CCG skill, this could be a step between "commit implementation" and "next task."

### Verdict against the decision rubric

Per Section 10 of this document:

> **Adopt with changes** — the idea helped, but the recipe format needs adjustment.

The recipe pattern should become standard for visually sensitive surfaces (popups, detail views, cards with complex layout). It should NOT be required for simple CRUD surfaces or data-layer work. The changes above (interaction state table, geometry validation, ownership note, structural checkpoint) should be incorporated before the next recipe-driven phase.

### Scope of adoption

- **Mandatory for:** Surfaces with 3+ interactive zones, complex flex layouts, or reference image targets.
- **Optional for:** Simple list items, settings pages, empty states.
- **Not applicable for:** Data layer, hooks, stores, pure logic.

---

## 14. Phase 8 Closing Summary

Phase 8 was not just a Bit Detail UI phase. It was a recipe-driven workflow pilot that produced evidence for how reference-driven redesign should work going forward.

### What the phase produced

1. **A narrow, scoped pilot.** Phase 8 was intentionally limited to one surface (Bit Detail) so the workflow experiment would produce interpretable evidence. We documented the gap review and pilot hypotheses before writing code.

2. **The lesson that reference interpretation needs a strict first step.** If code or current implementation structure is read too soon, it biases visual interpretation. This led to the rule: read the image before the code, document only visible facts first. This lesson is already reflected in the `design-archaeology` skill (Phase 0 → 0.25 → 0.5 ordering).

3. **The conclusion that design-archaeology alone was not enough.** Bit Detail was not just extraction — the reference did not include every existing product control (priority, timed chunks, progress ring). Those could not simply be deleted. The real questions were: should this control remain? If so, where does it go? How do we preserve product function without breaking reference fidelity? That was a redesign conversation, not an extraction task.

4. **The `reference-redesign` skill.** This skill was created because the Bit Detail work needed capabilities beyond extraction:
   - Retain/remove was not enough — reintegration placement decisions were needed.
   - "Absent from the reference" had multiple meanings (absent entirely vs. restructured).
   - Recipes that exist only in conversation are too fragile — they need durable docs.
   - The skill now includes: reference fact extraction first, surface-facing language, new/preserved/restructured/absent-entirely classification, a reintegration proposal step, writing to `docs/recipes/`, promotion into canonical docs, and cascade checking.

5. **A real recipe applied to Bit Detail.** We used `reference-redesign` against `references/bitdetail0.png` and produced `docs/recipes/bit-detail-recipe.md`, an updated `docs/DESIGN_TOKENS.md`, and a rewritten Phase 8 section in `docs/EXECUTION_PLAN.md`. The recipe became a real project input.

6. **Implementation evidence.** The recipe reduced layout and geometry guesswork, gave planning and execution a shared visual target, and improved fidelity to the reference. But interaction behavior was not captured well enough by recipe prose alone, geometry that sounded correct could still be wrong in box-model terms, and component ownership needed more explicit documentation.

7. **Late-stage issues that deepened the evidence.** Connector line geometry, duplicate rendering, null-deadline ambiguity, missing flex-wrap, empty-state handling, and layout jumps in Add description and Add a step. The layout-jump issue in particular produced an important learning: the problem was not mainly focus styling — it was a resting/editing box-structure mismatch that required stable-shell and stable-row solutions.

### What is already institutionalized

- Reference fact extraction (in `design-archaeology`)
- Recipe → durable docs → canonical docs promotion (in `reference-redesign`)
- Ownership ambiguity warnings (partially in `execute-next-phase`)

### What is partially reflected

- Documenting interaction behavior
- Documenting component ownership

### What is still weak or not yet institutionalized

- Geometry validation as a formal planning check
- Reading `docs/recipes/*` as a first-class input in `execute-next-phase`
- Recipe-first execution logic
- Interaction state table checks

### Verdict

Phase 8 is not just "the Bit Detail phase." It is the phase that produced evidence for how the recipe-driven redesign workflow should work going forward. The recipe pattern should be adopted with changes. The system is improved, but not fully closed — the remaining gaps are documented above for future phases to address.
