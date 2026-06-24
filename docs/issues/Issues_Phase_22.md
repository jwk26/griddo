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
| B2 | T98 | Breakdown selected context and first-keystroke collapse | In Progress 🔄 |
| B3 | T99 | Staging and triage DnD visual states | Pending |
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

_No execution issues yet. Populated as they arise during implementation._
