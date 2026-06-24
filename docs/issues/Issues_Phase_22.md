# Issues — Phase 22: Batch 2 Inbox / Triage Visual & Interaction Polish

> Branch: `phase-22/inbox-triage-polish`
> Started: 2026-06-24

## Status Legend

| Status | Meaning |
|--------|---------|
| Open | Identified, not yet resolved |
| In Progress | Actively being worked |
| Resolved | Fixed within the phase |
| Deferred | Moved to Issues_Deferred.md with rationale |
| Closed | Explicitly closed by user decision |

---

## Batch Structure

| Batch | Task | Scope | Status |
|-------|------|-------|--------|
| B1 | T97 | Scratch Pool identity, search, sort, collapsed switcher | Complete ✅ |
| B2 | T98 | Breakdown selected context and first-keystroke collapse | Implemented ✅ |
| B3 | T99 | Staging and triage DnD visual states | Complete ✅ |
| B4 | T100 | Hierarchy search, label removal, workspace integration | Pending |

---

## Deferred Issue Carryover Mapping

Issues deferred from Phase 18/19 that are resolved by this phase:

| Issue | Resolution in Phase 22 |
|-------|------------------------|
| `ISSUE-18-17` first-keystroke collapse | T97: state model (no auto-collapse on select; `scratchPoolManualExpandedForId` infrastructure) + T98: wires first-keystroke trigger |
| `ISSUE-18-18` Enter keeps focus in add-note | T98: adopt behavior after Breakdown submit |
| `ISSUE-18-19` selected-Scratch context | T98: compact context strip at top-left of Breakdown section |
| `ISSUE-18-20` invalid drop reads as destructive | T99: replace red styling with muted/unavailable visual language |
| `ISSUE-18-21` hierarchy search missing | T100: scoped active-section search |
| `ISSUE-18-16` drop-back-to-Breakdown removal | **Explicitly out of scope for T99.** T99 preserves only the existing `Remove from staging` target behavior. `ISSUE-18-16` remains deferred. |

---

## Implementation Decisions

### ISSUE-22-D01: Tooltip implementation (T97)
- **Decision:** Use `title` attribute + `aria-label` for pill and icon-only control tooltips in T97. Radix `<Tooltip>` is not used in T97 to keep tests lightweight and avoid DOM complexity from portal rendering.
- **Status:** Closed (user-approved approach)
- **If revisited:** Upgrading pills to Radix Tooltip in a later pass is straightforward; `aria-label` + `title` already satisfies the recipe's "accessible labels/tooltips" requirement.

### ISSUE-22-D02: Visual classification (T97)
- **Decision:** T97 is ui-heavy (ScratchPool surface redesign). Gemini skip is justified because the recipe fully constrains structural direction and pill sizing constants (selected `h-8` / inactive `h-2.5`) are user-approved. Not "logic-heavy" — skipping Gemini on the basis of recipe-bound + user-approved constants.
- **Status:** Closed

---

## Issues

### B3/T99 Execution Log

**Classification:** logic-heavy (Gemini skipped — recipe fully constrains all visual decisions: "muted/unavailable, not destructive-red" + "no visible staging headers"; no design judgment needed beyond existing semantic tokens)

**Scope note — T99 vs T100 hierarchy styling boundary:**
EXECUTION_PLAN T99 action says "Replace invalid staging/hierarchy drop red styling." However, `hierarchy-explorer.tsx` is T100-owned. T99 is scoped to:
- `staging-zone.tsx`: invalid drop state styling (was `border-destructive`; replaced with muted language)
- `triage-workspace.tsx`: remove target hover state (was `border-destructive/bg-destructive`; replaced with neutral)

Hierarchy invalid drop styling (in `hierarchy-explorer.tsx`) is deferred to T100. This is a deliberate split to preserve T100's file ownership boundary.

**Changes delivered:**
- `staging-zone.tsx`: `invalid` drop state class changed from `border-destructive` to `border-muted bg-muted/10 text-muted-foreground/50 cursor-not-allowed` — muted/unavailable language, not destructive-red
- `triage-workspace.tsx`: `<PanelHeader title="Staging: Nodes" />` and `<PanelHeader title="Staging: Bits" />` replaced with `aria-hidden` structural spacer divs (preserves 32px vertical rhythm)
- `triage-workspace.tsx`: `TriageRemoveDropTarget` hover state changed from `border-destructive bg-destructive/10 text-destructive` to `border-border bg-muted text-foreground`
- `staging-zone.test.tsx`: 3 assertion updates (destructive → muted class checks)
- `triage-workspace.test.tsx`: removed 2 stale label assertions, renamed hover test, updated class assertion

**Scope note recorded above** — hierarchy invalid styling left for T100.

**Deferred issue resolved:** `ISSUE-18-20` invalid drop reads as destructive → muted/unavailable visual language delivered.

**Follow-up (code review finding):** `PlacementConfirmationDialog` `isFull` warning box in `triage-workspace.tsx` also used `border-destructive`/`text-destructive`. Fixed in the same commit — replaced with `border-muted-foreground/30 bg-muted/40 text-muted-foreground`. Added `isFull` assertion to `triage-workspace.test.tsx`.

**Verification:** 45 tests passed (staging-zone.test.tsx + triage-workspace.test.tsx + use-triage-dnd.test.ts), build passed, no whitespace errors.

---

### B2/T98 Execution Log

**Classification:** logic-heavy + behavior-heavy (Gemini skipped — all visual decisions pre-specified in task prompt and recipe)

**Parallel test authoring:** Codex A (implementer) and Codex B (test author) ran in parallel on disjoint files.

**Changes delivered:**
- `breakdown-panel.tsx`: context strip, first-keystroke collapse, Enter-keeps-focus, grip hit-target polish, ArchiveScratchBar completion affordance
- `breakdown-panel.test.tsx`: useInbox mock + triageStore mock extension + 10 new behavioral tests

**Verification:** 53 tests passed (31 in breakdown-panel.test.tsx + 22 in scratch-pool.test.tsx), build passed, no whitespace errors.

**Observation — context strip double indent:** The context strip uses `mx-3 mt-2` inside a parent div that has `px-3`, resulting in 24px horizontal inset instead of 12px. Spec explicitly specified `mx-3 mt-2`; visual judgment deferred to user review at checkpoint. Not blocking.

**Deferred issues resolved this batch:**
- `ISSUE-18-17` first-keystroke collapse: fully wired (T97 provided state model; T98 wires the trigger)
- `ISSUE-18-18` Enter keeps focus: adopted
- `ISSUE-18-19` selected-Scratch context: compact context strip delivered
