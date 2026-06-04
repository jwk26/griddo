# Amendment Flow Review — Batch 1 (Lifecycle System)

**Reviewed:** 2026-06-03
**Scope:** `amendment` (writing-documents amendment mode, Step 6)
**Inputs:** `docs/brainstorming/2026-04-28-lifecycle-system-foundation/PROMOTION_MAP.md` (approved); the four source DECISION.md (lifecycle-system-foundation, archive-view-and-restore, quick-capture-entry-surface, inbox-triage-workspace) + quick-capture-palette (recipe); amended `SCHEMA.md`, `SPEC.md`, `DESIGN_TOKENS.md`, `EXECUTION_PLAN.md` (Phases 15–19), `PLANNING_STANDARD.md`; recipes `docs/recipes/quick-capture-entry-surface-visual-recipe.md`, `docs/recipes/command-palette-visual-recipe.md`.

---

## 0. Review method (deliberate deviation from default)

Step 6 was performed **inline** (by the amending agent in a verifier posture), not via an independent reviewer subagent. amendment-mode normally recommends a subagent for a non-trivial amendment; this run consciously deviates, for these reasons:

- **Independent review already occurred.** Codex independently cross-checked Steps 4–5 (`EXECUTION_PLAN`, `PLANNING_STANDARD`, `SPEC`) and caught real issues (stale Quarterly note, archive-sweep table gap, system-node trash exception, badge token vagueness, Surface-Recipes prose, SPEC/Visibility mismatch). So this is not pure self-review.
- **Step 6 here is traceability-centric, mechanical review** — the eight checks below are verifiable by document/line reference, not creative judgment.
- **Subagent cost.** A fresh subagent would re-read PROMOTION_MAP / DECISIONs / SCHEMA / SPEC / DESIGN_TOKENS / EXECUTION_PLAN — the exact token-waste concern raised this session.

**Compensating control:** this Step 6 artifact is handed to **Codex for an additional independent review** before Step 7. The subagent omission is logged as a **workflow-test observation** (see §5).

---

## 1. Traceability — promoted decision → canonical target → execution owner

Evidence is cited as `FILE:line` (current working tree).

| # | Promoted decision (PROMOTION_MAP §Decision Mapping) | Canonical target(s) | Execution owner | Status |
|---|---|---|---|---|
| 1 | `systemRole` (Node) | SCHEMA:43 (field), SCHEMA:214 (`createNodeSchema` omit), SCHEMA:65 (Default System Nodes); SPEC:70 (AD#15), SPEC:226 (System Node Routing) | Phase 15 T68 (schema), T72 (seeding); Phase 17 T77 (routing) | ✅ |
| 2 | `archivedAt` (Node+Bit) | SCHEMA:42, SCHEMA:100 (fields), SCHEMA:404/418 (Hooks 10/11), SCHEMA:439 (Key Queries sweep); SPEC:269/278 | Phase 15 T68/T70/T71; Phase 19 T86–88 | ✅ |
| 3 | `hiddenFromGrid` (Node) | SCHEMA:44; SPEC:226 (sidebar always-show / remove-from-grid) | Phase 15 T68/T71; Phase 17 T77 | ✅ |
| 4 | `scratchBreakdowns` store | SCHEMA:156 (store), SCHEMA:214/Zod; SPEC:250 (Breakdown) | Phase 15 T68/T69/T70; Phase 17 T80; Phase 18 | ✅ |
| 5 | Hook 10 Archive Cascade / Hook 11 Archive Restore | SCHEMA:404 / SCHEMA:418 | Phase 15 T70; Phase 19 T86–88 | ✅ |
| 6 | Default system nodes (Inbox, Archive View) | SCHEMA:65; SPEC:70 (seeding) | Phase 15 T72 | ✅ |
| 7 | Scratch placement (x=0,y=0; Hook 8 exception) | SCHEMA:395 (Hook 8 exception); SCHEMA bits note | Phase 16 T74 (capture); Phase 15 | ✅ |
| 8 | Staged-candidate lifecycle / placement confirm / fast path / remove-from-staging (Scope #1–#4) | SPEC:250 (Inbox/Triage), SPEC:72 (AD#16) | Phase 18 T81–85 | ✅ |
| 9 | Compact drag token (Scope #5) | SPEC:72 (AD#16); DESIGN_TOKENS:840 | Phase 18 T82 | ✅ |
| 10 | Completion ≠ Archive (Scope #6) | SCHEMA:404 (Hook 10 note); SPEC:278 (Direct Archive) | Phase 19 T88 | ✅ |
| 11 | Cmd+K Command Palette + `+` entry surface (Scope #7) | SPEC:238 / SPEC:245; DESIGN_TOKENS:862 (+ Quick Capture recipe pointer); recipes | Phase 16 T73–76 | ✅ |
| 12 | `scratchBreakdowns` vs Chunk (Scope #8) | SCHEMA:156 (rationale + Hook 3 non-participation note); PLANNING_STANDARD:182 | Phase 15 T68 | ✅ |
| 13 | Inbox badge (3-level pressure) | DESIGN_TOKENS:827; SPEC:250 (badge) | Phase 17 T77 | ✅ |

All 13 promoted decisions have a canonical target **and** an execution owner.

---

## 2. Mandatory checks (amendment-mode Step 6)

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Every promoted decision has a canonical target | ✅ | §1 table (13/13) |
| 2 | Every canonical target has an execution owner (implementation needed) | ✅ | §1 table; foundation Phase 15, surfaces Phases 16–19 |
| 3 | SCHEMA fields referenced by SPEC/PLAN actually exist | ✅ | SPEC:70 cites `systemRole`/`hiddenFromGrid`/`archivedAt` → SCHEMA:42–44. EXECUTION_PLAN T77 cites `bg-priority-mid-bg`/`text-priority-mid`/`bg-destructive` → DESIGN_TOKENS `--priority-mid`(:79–80), `--destructive`(:65–66). Hooks 3/4/8/10/11 cited by SPEC/PLAN → SCHEMA:404/418/355/395 + Hook 3 note |
| 4 | SPEC behavior represented in EXECUTION_PLAN tasks | ✅ | System Node Routing SPEC:226→T77; Quick Capture SPEC:238→T73/74/76; Command Palette SPEC:245→T75; Inbox/Triage SPEC:250→T78–85; Archive View SPEC:269→T86/87; Direct Archive SPEC:278→T88 |
| 5 | New phases do not depend on deferred/unpromoted decisions | ✅ | Phase 18 implements only the Inbox/Triage **subset** of grid-dnd (Reference-only), not the full promotion (SPEC:72; EXECUTION_PLAN:2109 policy). No phase depends on quarterly / favorites / Batch 2 theme / create-modal / Search-redesign |
| 6 | Existing active phases not silently invalidated | ✅ (after fix) | Phases 1–14 untouched; new phases start at 15, no collision; recorded Non-Promoted in PROMOTION_MAP §9. The old Quarterly Phase 15 **header** was already removed (`Quarterly Calendar View` count = 0). **The initial inline check looked at headers only and missed a stale renumber note in Phase 10 Notes — caught by Codex re-review (F4) and corrected.** |
| 7 | Skipped docs: `skip-if` valid | ✅ (n/a) | No docs skipped — all five canonical docs are `edit/done` in PROMOTION_MAP §8 |
| 8 | Open questions correctly classified | ✅ | PROMOTION_MAP §7 uses only the five standard classifications; 0 Blocking, 0 unresolved Phase-local |

**Mandatory dependency check (functional sources):** No source was adopted under a `functional dependency` slot — the only "reuse" entries are existing committed components (PROMOTION_MAP §Reuse Targets), explicitly **not** Functional Sources, so the merge-prerequisite check does not apply. No architecture/dependency blocker.

---

## 3. User-requested verification (7 items)

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | Every promoted DECISION → appropriate canonical target | ✅ | §1 (13/13) |
| 2 | Each canonical target → Phase/Task owner | ✅ | §1; §2 check 2 |
| 3 | deferred / non-promoted items not mixed into execution tasks | ✅ | EXECUTION_PLAN Phases 15–19 contain no quarterly/favorites/theme/create-modal/search-redesign task; PROMOTION_MAP §9 Non-Promoted list intact |
| 4 | quarterly-calendar-view not revived in the active plan | ✅ (after fix) | No active Quarterly phase/task (`Quarterly Calendar View` count = 0); scope-guard header EXECUTION_PLAN:1901. **A stale historical renumber note ("Phase 12 / Task 68 Quarterly renumbered to Phase 15") was found by Codex re-review (F4) and corrected** — it now marks Quarterly deferred (`docs/brainstorming/2026-05-26-quarterly-calendar-view`) and clarifies Phase 15 / Task 68 = Lifecycle |
| 5 | Quick Capture recipe does not reopen Search redesign or prototype create-modal redesign | ✅ | command-palette recipe:98 + :117 (key 2 = existing Search, no redesign; search input visual-only); entry-surface recipe:114 + :139 (Create modals NOT adopted → existing dialogs). Enforced in EXECUTION_PLAN Phase 16 policies + T75/T76 |
| 6 | Grid DnD remains Inbox/Triage partial scope only | ✅ | SPEC:72 (AD#16: "partial… existing main-grid/calendar/pool unchanged"); EXECUTION_PLAN:2109 policy + T82 ("do NOT modify main-grid/calendar/pool DnD") |
| 7 | PLANNING_STANDARD conformance items catch the Batch 1 invariants | ✅ | PLANNING_STANDARD:172 (archive active-filter — catches the §5 archive-leak class directly), :173 (system-managed field guard), :174 (system-node lifecycle exclusion), :182 (scratchBreakdowns boundary) |

---

## 4. Findings & dispositions

Every issue has a terminal disposition. Review passes when zero issues are `Blocking`.

| # | Finding | Severity | Disposition |
|---|---|---|---|
| F1 | **`Visibility: User-facing` tags absent.** EXECUTION_PLAN has never used `Visibility:` tags (0 across Phases 1–14); Batch 1 phases match that format and rely on observable Acceptance criteria. But PLANNING_STANDARD §5 + amendment-mode Output Contract assume the tags exist. | Advisory | **Accepted (deliberate deviation).** Matched existing plan format; observable Acceptance criteria serve closing-phase verification. Flagged for the user: either (a) keep as-is and amend PLANNING_STANDARD §5 to match reality, or (b) retrofit tags. Recorded as **Skill_Update_plan candidate J** (preferred direction: realign PLANNING_STANDARD §5 to observable Acceptance criteria; keep the existing no-tag plan convention). Not blocking. |
| F2 | **SPEC "Shared component domains" table not updated.** Batch 1 introduces new domains `src/components/quick-capture/`, `triage/`, `archive/` (used in EXECUTION_PLAN file paths and noted in PLANNING_STANDARD:181), but SPEC §File Organization "Shared component domains" table still listed only grid/bit-detail/calendar/layout/trash. The *pattern* (`src/components/{domain}/`) is defined, so no path was invented — but the table was behind. | Minor (mechanical) | **Fixed.** Added `quick-capture/`, `triage/`, `archive/` to SPEC AD #8 (SPEC:56) and the Shared component domains table (SPEC:133–135). |
| F3 | **Phase 19 depends on Phase 17.** Archive View conceptually needs only the Phase 15 foundation, but its `GridRuntime` dispatch branch (`archive_view → ArchiveView`) is added in Phase 19 T86 on top of Phase 17's dispatch point — to avoid a forward import (Phase 17 must build without Phase 19 code). | Info | **Accepted.** Documented in EXECUTION_PLAN T77 ("`archive_view` branch added in Phase 19") and T86 dependencies. Intentional, keeps each phase independently buildable. |

| F4 | **Quarterly stale renumber note.** EXECUTION_PLAN Phase 10 Notes read "the original Phase 12 (Task 68, Quarterly) was renumbered to Phase 15" — stale now that Phase 15 / Task 68 is Batch 1 Lifecycle. The initial inline review's "quarterly not revived" PASS checked only the active phase header, not historical notes (same class as the F-H "sweep all references" lesson). | Minor (correctness/clarity) | **Fixed** (caught by Codex re-review). The note now marks Quarterly deferred (`docs/brainstorming/2026-05-26-quarterly-calendar-view`, Non-Promoted) and clarifies Phase 15 / Task 68 = Lifecycle (EXECUTION_PLAN:1613). |

No `Blocking` findings.

---

## 5. Workflow-test observations

- **Subagent review intentionally omitted** for Step 6 (rationale §0). Recorded as a conscious efficiency deviation from amendment-mode's "non-trivial → subagent" guidance; compensated by prior Codex review of Steps 4–5 and a planned Codex re-review of this artifact.
- F1 (Visibility-tag mismatch → candidate **J**) and the EXECUTION_PLAN scaling concern (candidate **I**) are workflow-level items for the post-Batch-1 skill pass, not Batch 1 blockers.
- **Review-method lesson.** The inline "quarterly not revived" check (check 6 / item 4) initially verified only the active phase header, not stale historical notes — the same "sweep every reference, not one place" lesson as candidate **H**. F4 was the result. Future amendment flow reviews of a removed/renumbered item must grep the whole plan (notes included), not just headers. (Reinforces candidate H.)

---

## 6. Summary

- Promoted decisions traced: **13** — fully owned: **13**, weak: 0, gaps: 0, deferred: 0.
- Mandatory checks: **8/8 pass.** User-requested checks: **7/7 pass.**
- Findings: F1 Advisory (→ Skill_Update_plan candidate **J**), F2 Minor-mechanical (**fixed**), F3 Info (accepted), F4 Minor-correctness (**fixed**, via Codex re-review). **0 Blocking.**
- **Status: PASS.** F2 and F4 fixed; F1 recorded as candidate J for the skill pass. Codex re-review incorporated. Ready for Step 7.
