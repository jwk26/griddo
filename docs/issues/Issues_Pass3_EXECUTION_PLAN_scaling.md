# Issues — Pass 3: EXECUTION_PLAN Scaling

> **Scope:** Skill update pass — backward-compatible scaled-mode support for 5 shared skills + GridDO EXECUTION_PLAN.md migration.
> **Branch:** `pass-3/execution-plan-scaling`
> **PR:** #23 (merged)

---

## Issue 1: amendment-mode Step 6 sweep scope missing scaled clause

- **Problem:** Pass3_plan §3 specified two changes for amendment-mode: (1) phase numbering via guard, and (2) Step 6 sweep scope = active+Index+Next Numbers with archive frozen. Only (1) was applied during 3a-C. (2) was caught by the G (Opus independent) review.
- **Root Cause:** The amendment-mode change was recorded as "one item" but contained two distinct contract changes at different locations in the file (line 547 for numbering vs. line 612 for sweep scope). The second location was missed during implementation.
- **Solution:** Added scaled-mode archive-frozen sweep clause to Step 6 check 6 as a 3a addendum after G review.
- **Learning:** When a plan item touches multiple locations in the same file, enumerate the locations explicitly before editing. "amendment-mode EXECUTION_PLAN rules" as a single entry masked that two separate sections needed edits.

---

## Issue 2: Phase 7 Defer Notes in Cross-Cutting section required escalation decision

- **Problem:** `#### Phase 7 Defer Notes` (lines 926-935) was inside `## Cross-Cutting Concerns`, not inside the Phase 7 block. The §4.4 pre-extraction (`awk '/^## Phase 1:/{f=1}/^## Phase 15:/{f=0}f'`) captured Cross-Cutting and Phase 7 Defer Notes together, while archive extraction of Phase 7 (lines 793-904) did not.
- **Root Cause:** Historical placement decision — defer notes were added to Cross-Cutting at the time rather than Phase 7's own block. Was a known §13 escalation point.
- **Solution:** Escalated and confirmed: Defer Notes moved to phase-07.md with provenance note; Cross-Cutting body (policy) retained in main. Content-preservation verified (Task 75=75, Notes 19=19, byte-identical archive files vs git HEAD).
- **Learning:** When archiving phases that have content "leaked" into adjacent sections, flag all cross-section content in the archive mapping table before running extraction scripts.

---

## Issue 3: eval fixture uses HTML comment marker vs plain text marker

- **Problem:** `scaled-sample.md` fixture uses `<!-- Execution plan mode: scaled -->` (HTML comment) while the actual `docs/EXECUTION_PLAN.md` uses `Execution plan mode: scaled` (plain text line).
- **Root Cause:** The fixture was created in 3a-B before the migration format was finalized.
- **Solution:** No functional impact — skills do substring matching, so `<!-- Execution plan mode: scaled -->` still matches. Accepted as-is (low risk, fixture serves desk-check purpose).
- **Learning:** Future fixture updates should align the marker format to the canonical production format to avoid confusion. Update `scaled-sample.md` marker if the fixture is ever revised.

---

## Summary

| # | Issue | Resolution |
|---|-------|------------|
| 1 | amendment-mode sweep scope (2nd location) missed in 3a-C | Applied as 3a addendum post-G review |
| 2 | Phase 7 Defer Notes cross-section escalation | Confirmed and moved to phase-07.md with provenance |
| 3 | Fixture marker format (HTML comment vs plain text) | Accepted — no functional impact; note for future fixture update |
