# Amendment Flow Review — Batch 2 (Theme System, Calendar, Grid, Inbox/Triage Polish)

**Reviewed:** 2026-06-24
**Scope:** `amendment` (writing-documents amendment mode, Step 6)
**Inputs:** `docs/brainstorming/2026-05-28-theme-system-and-calendar-theming/PROMOTION_MAP.md` (approved); source DECISION.md (theme-system-and-calendar-theming, inbox-triage-theme-variants); amended `SPEC.md`, `DESIGN_TOKENS.md`, `EXECUTION_PLAN.md` (Phases 20–22 / Tasks 89–100), `PLANNING_STANDARD.md`; recipes `theme-system-and-grid-batch2-visual-recipe.md`, `calendar-batch2-visual-recipe.md`, `inbox-triage-batch2-visual-recipe.md`. `SCHEMA.md` skipped (no data-model change).

---

## 0. Review method

Step 6 performed **inline by Claude in a reviewer posture**, which satisfies amendment-mode's independence requirement here:

- **Reviewer ≠ plan author.** The EXECUTION_PLAN (Steps 4–5) was authored by **Codex**; this review is by **Claude**. This is the inverse of the Batch 1 run (where the amending agent self-reviewed inline and Codex re-reviewed after) — independence is structural, not a deviation.
- **Step 6 is traceability-centric, mechanical review** — the eight checks are verifiable by `FILE:line` reference.
- **Pre-review reconciliation already happened.** Claude ran a pre-Step-6 review; Codex applied F1–F4 fixes; this pass independently **verified** those fixes against the working tree (see §4) and then ran the full mandatory-check sweep, which surfaced one new finding (NF1).

Evidence is cited as `FILE:line` (current working tree, uncommitted).

---

## 1. Traceability — promoted decision → canonical target → execution owner

| # | Promoted decision (PROMOTION_MAP §Decision Mapping) | Canonical target(s) | Execution owner | Status |
|---|---|---|---|---|
| 1 | 8-theme runtime + theme picker | SPEC AD#17; SPEC Key File Paths `color-theme-store/provider/toggle` (SPEC:342 + File Org SPEC:123); DESIGN_TOKENS Color Theme System (DT:219), Theme IDs (DT:225) | Task 89 (runtime), Task 91 (picker) | ✅ |
| 2 | Theme token values & character | DESIGN_TOKENS Theme IDs (DT:225), Variable Groups (DT:262), Required Theme Classes (DT:276), Fidelity rule (DT:314 → recipe *Exact Theme Values* source-of-record) | Task 90 | ✅ |
| 3 | Themed grid visuals | SPEC Routes `/` (L0 grid); DESIGN_TOKENS `.theme-grid-line`/`.theme-node-card` (DT:293/:279) | Task 92 | ✅ |
| 4 | Calendar redesign (header + monthly/weekly) | SPEC `/calendar/weekly` (Header + Batch 2 visual contract), `/calendar/monthly`; DESIGN_TOKENS Calendar Visual Theme Contract (DT:331), Monthly Grid Contract (DT:352) | Task 93 (header), 94 (monthly), 95 (weekly) | ✅ |
| 5 | Calendar popup focus-visible | SPEC `/calendar/monthly` (popup focus-visible) | Task 96 | ✅ |
| 6 | Calendar performance recheck | EXECUTION_PLAN conditional review | Task 96 (conditional — matches MAP "Conditional recheck") | ✅ |
| 7 | Scratch Pool expanded/collapsed redesign | SPEC Inbox/Triage (Scratch Pool); DESIGN_TOKENS Scratch Pool (DT:396) | Task 97 | ✅ (NF1 fixed) |
| 8 | Scratch Pool search & sort | SPEC Inbox/Triage (Scratch Pool); SCHEMA `createdAt` (SCHEMA:166) | Task 97 | ✅ |
| 9 | Selected Scratch context | SPEC Inbox/Triage (Breakdown); DESIGN_TOKENS Breakdown (DT:406) | Task 98 | ✅ |
| 10 | ArchiveScratchBar visual integration | SPEC Breakdown; SCHEMA `archivedAt` (SCHEMA:42/:100) | Task 98 | ✅ |
| 11 | Hierarchy active-section search | SPEC Inbox/Triage (Hierarchy Explorer); DESIGN_TOKENS Hierarchy Search (DT:415) | Task 100 | ✅ |
| 12 | Visible developer-label removal | SPEC Inbox/Triage (Visible labels); DESIGN_TOKENS Removed Visible Labels (DT:384) | Task 99 (staging) + Task 100 (final sweep — acceptance #1 verifies all 5 headings absent) | ✅ |
| 13 | Invalid drop-state softening | SPEC Inbox/Triage (DnD states); DESIGN_TOKENS DnD States (DT:426) | Task 99 | ✅ |

**Adopted deferred issues (PROMOTION_MAP §Deferred Issue Disposition → owner):**

| Issue | Reflected in | Owner | Status |
|---|---|---|---|
| `ISSUE-18-17` first-keystroke collapse | SPEC AD#18 + Scratch Pool | Task 97 (state model) + Task 98 (wire) | ✅ |
| `ISSUE-18-18` Enter keeps focus | SPEC Breakdown | Task 98 | ✅ |
| `ISSUE-18-19` selected-Scratch context | = decision #9 | Task 98 | ✅ |
| `ISSUE-18-20` invalid drop too destructive | = decision #13 | Task 99 | ✅ |
| `ISSUE-18-21` hierarchy search missing | resolved by decision #11 | Task 100 | ✅ |
| Phase 14 popup `focus-visible` | = decision #5 | Task 96 | ✅ |
| Phase 14 `toSorted`/`useMemo` | = decision #6 | Task 96 (conditional) | ✅ |

All 13 promoted decisions + 7 adopted deferred issues have a canonical target **and** an execution owner. One ownership detail is incomplete within decision #7 (NF1, §4).

---

## 2. Mandatory checks (amendment-mode Step 6)

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Every promoted decision has a canonical target | ✅ | §1 (13/13 + 7 adopted issues) |
| 2 | Every canonical target has an execution owner | ✅ | §1; Tasks 89–100 |
| 3 | SCHEMA fields referenced by SPEC/PLAN actually exist | ✅ | `createdAt` SCHEMA:36/:95/:166; `archivedAt` SCHEMA:42/:100; `consumedAt` SCHEMA:167; `scratchBreakdowns` SCHEMA:156; Scratch order-by-`createdAt` SCHEMA:120. **No new field introduced** → SCHEMA skip valid |
| 4 | SPEC behavior represented in EXECUTION_PLAN tasks | ✅ | AD#17/#18→T89–92/97–98; `/calendar/*` header+visual→T93–95; popup focus-visible→T96; Inbox/Triage (Scratch Pool/Breakdown/Staging/Hierarchy/DnD/labels)→T97–100 |
| 5 | New phases don't depend on deferred/unpromoted decisions | ✅ | Theme prototype commits are **Design Source, patch-not-merge** (PROMOTION_MAP Source Intake) — not dependencies. No task depends on `ISSUE-19-01`, `ISSUE-18-16`, modal focus-trap, duplicate-title, global-search, or Day/Year views. Full-row drag rejected; plan keeps grip-only (T98). T99 now explicitly excludes deferred `ISSUE-18-16` |
| 6 | Existing active phases not silently invalidated (scaled-mode sweep) | ✅ | Promotion is **additive only**. Phase Index 1–19 untouched (EXECUTION_PLAN:19–40); Phases 20–22 appended (:41–43); `## Next Numbers` 20→**23** / 89→**101** (:47). No remove/rename/renumber → no stale-reference grep target. Plan-wide read shows no dangling phase/task reference |
| 7 | Skipped docs: `skip-if` valid | ✅ | Only SCHEMA skipped; `skip-if: n/a — no IndexedDB schema/store changes`. Confirmed valid by check #3 (zero new persisted fields; color theme is client/localStorage UI state, not data model) |
| 8 | Open questions correctly classified | ✅ | PROMOTION_MAP §Open Question Disposition uses only standard classifications (all `Resolved`/`Deferred`); **0 Blocking, 0 unresolved Phase-local**; no Step-4 task-disposition labels leaked into the OQ table |

**Mandatory dependency check (functional sources):** No source is adopted under a `functional dependency` slot. Prototype commits `64e5236`/`5b3d3c0`/`59ee937` are **Design Source (patch/reimplement, no merge dependency)**; `d963807` is Exploratory/Reference-only; recipes are Design Source; the inbox-triage DECISION is Reference-only (PROMOTION_MAP Source Intake). The merge-prerequisite check does not apply. **No architecture/dependency blocker.**

---

## 3. Flow-trace — key user-visible Batch 2 flows

Batch 2 is almost entirely user-facing, so flows are traced trigger → outcome for end-to-end ownership.

| # | User flow | Trigger | Outcome | Owner | Boundary cases | Status |
|---|---|---|---|---|---|---|
| 1 | Pick color theme | click sidebar Palette → select | `<html data-color-theme>` changes + persists | T91 (+T89 runtime) | invalid persisted value → `griddo` fallback (T89); dark/light orthogonal, not overwritten (T89) | ✅ |
| 2 | Theme repaints grid | theme change | grid lines + node cards restyle via `.theme-grid-line`/`.theme-node-card` | T92 | no theme-id branching (T92 + PLANNING_STANDARD:181); Archive `⋯` still non-system-only (T92) | ✅ |
| 3 | Theme repaints calendar | theme change | monthly cells / weekly columns / today badge consume `--calendar-*` | T94/T95 | DnD, popover, unschedule preserved (T94/T95); no Day/Year views (T93) | ✅ |
| 4 | Calendar header nav | prev/today/next, view switch | weekly⇄monthly via shared header | T93 | keyboard focus rings (T93); month/year subtitle split (T93) | ✅ |
| 5 | Theme font identity | theme change | per-theme font renders (VT323/Playfair/Space Mono/Inter) | T89 | font-load failure → **documented fallback recorded, no silent collapse** (T89 action + acceptance) | ✅ |
| 6 | Scratch Pool search/sort | type query / toggle sort | filter by title; reorder by `createdAt` | T97 | collapsed mode has no search/sort (T97); data model unchanged (T97) | ✅ |
| 7 | Collapsed Scratch switch | click pill | switch active Scratch | T97 | short vertical pills; accessible name/tooltip (T97) | ✅ |
| 8 | Breakdown context + collapse | select Scratch → type first char | context strip shown; pool auto-collapses on first keystroke | T98 (+T97 state) | selection/click alone ≠ collapse; manual re-expand respected until Scratch changes (T97/T98) | ✅ |
| 9 | Rapid breakdown entry | Enter in add-note | row submits, focus stays for next entry | T98 | `Cmd+K` still moves to command menu (T98); grip-only drag preserved (T98) | ✅ |
| 10 | Hierarchy scoped search | type in hierarchy search | filters active section only; persistent indicator | T100 | query persists across section change; flash respects reduced-motion; not global search (T100) | ✅ |
| 11 | Invalid staging/hierarchy drop | drag to invalid target | muted/unavailable, not destructive-red | T99 | Node=icon-centered / Bit=text-centered shape distinction, not color-only (T99) | ✅ |
| 12 | Developer labels hidden | render Inbox/Triage | no visible section headings | T99 + T100 | `aria-label`/visually-hidden names retained (T99/T100); T100 acceptance #1 verifies all 5 absent | ✅ |

---

## 4. Findings & dispositions

Terminal disposition required per finding. Review passes when zero `Blocking` remain.

| # | Finding | Severity | Disposition |
|---|---|---|---|
| F1 | **Store filename drift.** SPEC named `theme-store.ts` while EXECUTION_PLAN used `color-theme-store.ts` — canonical identifier mismatch (amendment-mode Pre-Review Gate: identifiers match exactly). | Mechanical | **Fixed & verified.** SPEC:123 + SPEC:342 now `color-theme-store.ts`; plan unchanged (all `color-theme-store`). Recipe (`64e5236:src/stores/theme-store.ts`, lines 16/26) and DECISION:42 correctly **retain** the prototype name as provenance. Zero `theme-store.ts` in canonical execution paths. |
| F2 | **Per-task `Dependencies` omitted.** New tasks lacked the field that existing phases (phase-19 T86–88) use. | Minor (format) | **Fixed & verified.** 12/12 tasks (89–100) carry `Dependencies`; DAG sound (89→90/91, 90→92, 93→94/95, 94·95→96, 97→98/99, 97·98·99→100); each phase builds at its own end. |
| F3 | **Font fidelity unowned + hedged.** Task 89 said "if available"; no acceptance verified per-theme fonts. | Minor→High (silent visual regression) | **Fixed & verified.** Hedge removed; action requires loading Inter/Playfair/Space Mono/VT323 with **documented-fallback-not-silent-collapse**; acceptance verifies the 7 theme→font mappings. Consistent with DESIGN_TOKENS:322–325 and the theme recipe Inventory. |
| F4 | **Task 99 wording adjacent to deferred `ISSUE-18-16`.** "Remove from staging … leaves source row active" risked conflation. | Low (clarity) | **Fixed & verified.** Action + acceptance now state this is existing-target preservation, **not** the deferred drop-back-to-Breakdown interaction. |
| F5 | **Phase Index marks 20/21/22 all `active`** though 21/22 depend on 20. | Low | **Accepted.** Functionally correct (execute-next-phase selects lowest open phase = 20). Changing the marker would cascade into the undocumented Phase-Index status vocabulary / Status Legend — out of proportion to a non-blocker. |
| **NF1** | **Scratch row relative-time label has no explicit execution owner.** SPEC restored (F1 restoration) that each Scratch row shows a relative-time `createdAt` label in an **exact format** (`2h ago` / `yesterday` / `2 days ago` / `6 days ago` / `m/dd/yy`) and that long titles ellipsize (SPEC Inbox/Triage → Scratch Pool; canonical per SCHEMA:120). **Task 97 redesigns the Scratch Pool** (header, search, sort, collapsed pills, auto-collapse) but neither its Actions nor Acceptance mention preserving/verifying the per-row relative-time label or title ellipsis. Because this detail was *already dropped once* and re-restored via PROMOTION_MAP F1, silence here is a genuine (if small) re-drop risk. | Minor (non-blocking) | **Fixed & verified (applied 2026-06-24).** Task 97 Actions now include "Preserve Scratch row details while redesigning the pool: each row keeps the restored `createdAt` relative-time label format and long titles ellipsize"; Acceptance now includes "Scratch rows show restored relative-time labels (`2h ago`, `yesterday`, `2 days ago`, `6 days ago`, `m/dd/yy`) and long titles ellipsize without breaking row layout." Closes the restored-canonical-detail gap class that F1/F3 restorations exist to prevent. |

**No `Blocking` findings.** F1–F4 fixed & independently verified; F5 accepted; NF1 minor recommendation.

---

## 5. Acceptance criteria quality

Acceptance criteria across Tasks 89–100 are observable verification questions (e.g., "Opening the theme picker shows all 8 labels and swatches"; "Monthly today is a circular date badge"; "Collapsed mode shows short vertical pills"; "Searching while Level 2 is active filters Level 2 only"). Recipe-backed tasks include at least one recipe-derived visual fact (`gap-px`, `MMM d`, `var(--theme-radius, 6px)`, `.theme-grid-line`). NF1 (per-row relative-time label) is now closed in Task 97; no remaining acceptance gap.

---

## 6. Summary

- Promoted decisions traced: **13** + **7** adopted deferred issues — owned: **all** (NF1 closed).
- Mandatory checks: **8/8 pass.** Dependency check: **no functional-source blocker.**
- Flow-trace: **12 key user-visible flows, all ✅ owned** with boundary cases assigned.
- Findings: F1–F4 **Fixed & verified**, F5 **Accepted**, **NF1 Fixed & verified**. **0 Blocking.**
- **Status: PASS.**

Per amendment-mode, PASS clears Step 6. NF1 applied to Task 97 (2026-06-24). Remaining pipeline: **Step 7 — Summary & CLAUDE.md diff** (CLAUDE.md additions restricted to standing invariants / canonical pointers: e.g., AD#17 color-theme axis, AD#18 Batch 2 behavior preservation; Phase Summary 20–22).
