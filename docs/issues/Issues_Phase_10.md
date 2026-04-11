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

*None so far.*

---

## Execution Decisions
*(Non-issue decisions made during execution that affect implementation)*

### ED-1: Time display variant — Option 1
- **Batch:** 1 (Task 58)
- **Context:** Codex Run 1 stopped with a question: when a time is set, should the Clock icon be (1) paired with time text in one control, (2) separate icon + time pill, or (3) replaced by time pill?
- **Decision:** Option 1 — Clock + time text inside one highlighted control. Rationale: Gemini spec says "Clock icon is highlighted" (stays visible, not replaced); most compact; preserves clock affordance for discoverability.
- **Asymmetry:** Calendar icon IS replaced by a date pill for custom dates (per Gemini spec section 6). Clock is NOT replaced. This is intentional — date values are longer ("Oct 24") and need readable text; time values ("2:30 PM") are short enough to pair with the icon.
