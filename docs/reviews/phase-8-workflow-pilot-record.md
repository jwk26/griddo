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

- **Recipe helped with:**
- **Still ambiguous:**
- **Unexpected implementation pressure:**
- **Reference mismatch noticed:**
- **Decision made:**

### Task 37 Notes

- **Recipe helped with:**
- **Still ambiguous:**
- **Unexpected implementation pressure:**
- **Reference mismatch noticed:**
- **Decision made:**

### Task 38 Notes

- **Recipe helped with:**
- **Still ambiguous:**
- **Unexpected implementation pressure:**
- **Reference mismatch noticed:**
- **Decision made:**

### Closing Review Notes

- **Screenshots reviewed:**
- **Clear deviations found:**
- **Corrections made:**
- **Acceptable deviations left in place:**
- **Was one review pass enough?:**

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

- Phase 7 baseline is preserved.
- Phase 8 planning docs exist.
- No workflow update has been made yet from this pilot.
- The workflow update is intentionally deferred until Phase 8 has real implementation evidence.
