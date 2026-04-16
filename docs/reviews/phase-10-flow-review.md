# Flow-Trace Review — Phase 10: Breadcrumb + Deadline UX

**Reviewed:** 2026-04-11
**Inputs:** SPEC.md, SCHEMA.md, DESIGN_TOKENS.md, EXECUTION_PLAN.md (Phase 10 tasks 54-58)
**Source files inspected:** breadcrumbs.tsx, grid-runtime.tsx, globals.css, bit-detail-popup.tsx, edit-node-dialog.tsx, create-node-dialog.tsx, use-bit-detail.ts, use-global-urgency.ts, use-calendar-data.ts, use-bit-detail-actions.ts

## Flow-Trace Table

| # | User Flow | Trigger | Intended Outcome | Owning Task | Boundary Cases | Status |
|---|-----------|---------|------------------|-------------|----------------|--------|
| 1 | Breadcrumb renders as compact floating element | Navigate to any grid page | Small rounded element overlaid on grid surface, not a full-width strip | 54 | L0 shows "Home" only; L1+ shows full chain | ✅ Owned |
| 2 | Navigate via breadcrumb click | Click breadcrumb segment | Router navigates to that Node's grid page | 54 | All existing click behavior preserved | ✅ Owned |
| 3 | Drag item onto breadcrumb segment (ancestor move) | Drag over breadcrumb while DnD active | Segment highlights; drop triggers ancestor move confirmation | 54 | Bit cannot drop on L0 root (existing logic) | ✅ Owned |
| 4 | Grid uses full vertical space | Navigate to any grid page | No dedicated breadcrumb row; breadcrumb floats within grid area | 54 | `--breadcrumb-height` and `h-breadcrumb` removed from globals.css; content margin recalculated | ✅ Owned |
| 5 | Deadline visible below breadcrumb | View a Node with a deadline set | Formatted deadline text appears below compact breadcrumb (e.g., "Due Apr 15") | 55 | Node without deadline = nothing rendered; L0 (no nodeId) = no deadline surface | ✅ Owned |
| 6 | Deadline quick-edit via popover | Click deadline text below breadcrumb | Popover opens with DateFirstDeadlinePicker, pre-populated | 55 | Depends on Task 58 (picker component) | ✅ Owned |
| 7 | Deadline shortening triggers conflict check | Select earlier deadline in quick-edit | Hierarchy check against child Bits; DeadlineConflictModal if conflict | 55 | Uses existing DeadlineConflictModal; validates all active child Bits | ✅ Owned |
| 8 | Clear deadline via quick-edit | Click clear in popover | Node deadline set to null, deadlineAllDay to false | 55 | — | ✅ Owned |
| 9 | Parent deadline shown in Bit Detail | Open Bit whose parent Node has a deadline | "Parent deadline" label with formatted date below Bit's own deadline | 56 | Parent without deadline = nothing renders; parentNode already exposed by useBitDetail | ✅ Owned |
| 10 | Parent deadline tooltip | Hover "Parent deadline" label | Tooltip: "Child deadline cannot exceed this" | 56 | Read-only — no editing from this surface | ✅ Owned |
| 11 | L0 Create Node — no deadline | Click + at L0, create Node | CreateNodeDialog has no deadline input | 57 | level prop threaded from grid-runtime.tsx displayLevel | ✅ Owned |
| 12 | L0 Edit Node — deadline hidden | Edit a Node at L0 | EditNodeDialog hides entire deadline section | 57 | Existing L0 Nodes with deadlines: hidden, not deleted | ✅ Owned |
| 13 | L1+ Create Node — optional deadline | Click + at L1+, choose Node, fill dialog | Optional deadline section with DateFirstDeadlinePicker | 57 | Default: no deadline; depends on Task 58 | ✅ Owned |
| 14 | L0 Nodes excluded from calendar | View calendar weekly/monthly | L0 Nodes with deadlines do not appear in calendar items | 57 | Filter in use-calendar-data.ts: `node.level !== 0` | ✅ Owned |
| 15 | L0 Nodes excluded from urgency | Sidebar urgency dot computation | L0 Nodes do not contribute to global urgency badge | 57 | Filter in use-global-urgency.ts: `node.level !== 0` | ✅ Owned |
| 16 | "Today" pill sets deadline | Click "Today" in DateFirstDeadlinePicker | Deadline = today, deadlineAllDay = true | 58 | Timestamp stored as 00:00:00.000 local | ✅ Owned |
| 17 | "Week" pill sets deadline | Click "Week" in DateFirstDeadlinePicker | Deadline = today + 7 days, deadlineAllDay = true | 58 | — | ✅ Owned |
| 18 | Calendar icon opens date picker | Click Calendar icon in picker | shadcn Calendar in Popover; selecting date sets all-day deadline | 58 | — | ✅ Owned |
| 19 | Clock icon opens time picker | Click Clock icon in picker | Hour/minute inputs; sets deadlineAllDay = false | 58 | If no date set yet, uses today | ✅ Owned |
| 20 | No "All day" toggle in UI | View any deadline input surface | Toggle is absent; all-day is implicit (no time = all-day) | 58 | Removed from bit-detail-popup.tsx and edit-node-dialog.tsx | ✅ Owned |
| 21 | Existing surfaces use new picker | Edit deadline in Bit Detail or Edit Node | DateFirstDeadlinePicker replaces current date/time/all-day inputs | 58 | — | ✅ Owned |
| 22 | All-day hierarchy comparison | Set Bit deadline equal to parent's all-day deadline | All-day deadlines treated as 23:59:59.999 local for comparison | 58 | Shared utility; UI + datastore paths agree | ✅ Owned (amended) |
| 23 | Create Node deadline hierarchy validation | Create Node at L1+ with deadline exceeding parent's deadline | Prevented at UI + datastore level | 57 | Both CreateNodeDialog and indexeddb.ts createNode enforce | ✅ Owned (amended) |

## Gaps Found (Resolved)

| # | Flow | Gap Type | Description | Resolution |
|---|------|----------|-------------|------------|
| 1 | All-day hierarchy comparison (#22) | Weak ownership → **Resolved** | No task owned the all-day normalization utility. Raw timestamp comparison at `indexeddb.ts:817` does not account for `deadlineAllDay`. | Task 58 acceptance criteria amended: shared all-day comparison utility; UI + datastore validation paths agree on normalization. |
| 2 | Create Node deadline hierarchy (#23) | Weak ownership → **Resolved** | `createNode` at `indexeddb.ts:102` does not validate child deadline against parent. `CreateNodeDialog` had no deadline input at all. | Task 57 acceptance criteria amended: create-path validation at both UI (`CreateNodeDialog`) and datastore (`createNode`) levels. |

## WIP Commit Assessment

Cherry-picked commit `d50a7e1` adds:
- `updateNode()` in `use-bit-detail-actions.ts` — needed for Task 56 (parent deadline resolution from bit-detail context)
- Deadline conflict handling in `bit-detail-popup.tsx` — partially addresses Task 56 flow; must be reconciled when Task 58 replaces the deadline input surfaces

**Risk:** The WIP's deadline input code in `bit-detail-popup.tsx` will be replaced by Task 58's `DateFirstDeadlinePicker`. The conflict-handling logic (attempt, detect, show modal) should survive the replacement, but the input UI will change. Implementation order 58 → 56 mitigates this — Task 58 replaces the inputs first, then Task 56 adds parent deadline display.

## Summary

- Flows traced: 23
- Fully owned: 23 (2 amended)
- Weak: 0
- Gaps: 0
- Deferred: 0
- Status: **PASS**
