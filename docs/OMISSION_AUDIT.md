# Execution Plan Omission Audit — Consolidated Report

> **Date:** 2026-03-26
> **Sources:** User first-pass audit, Claude independent audit (3 parallel agents), Codex review
> **Scope:** PRD, SPEC, SCHEMA.md, EXECUTION_PLAN.md, sampled implementation (Phases 1-4.5)
> **Purpose:** Identify mismatches between document promises and execution-plan ownership, classify them, and propose amendments

---

## Table of Contents

- [Audit Standard](#audit-standard)
- [Tier 1 — Blocks Core User Flows](#tier-1--blocks-core-user-flows)
- [Tier 2 — Significant Functional Gaps](#tier-2--significant-functional-gaps)
- [Tier 3 — Boundary Details That Should Be Explicit](#tier-3--boundary-details-that-should-be-explicit)
- [Tier 4 — Explicit Defer Notes](#tier-4--explicit-defer-notes)
- [Tier 5 — Code-Level Fixes](#tier-5--code-level-fixes)
- [Amendment Actions Summary](#amendment-actions-summary)
- [New Tasks Specification](#new-tasks-specification)
- [Existing Task Amendments](#existing-task-amendments)
- [Cross-Cutting Concerns Additions](#cross-cutting-concerns-additions)
- [Defer Notes to Add](#defer-notes-to-add)

---

## Audit Standard

This audit evaluates three dimensions, not just one:

1. **Plan omission** — a PRD/SPEC behavior has no task ownership
2. **False completion** — a task marked `[x]` did not deliver its acceptance criteria
3. **Implementation deviation** — implemented code contradicts the spec's intended abstraction

The standard going forward:

> Do not only ask whether a feature exists. Ask which task owns it, which component owns it, and what the exact user flow is.

Categories that must always have explicit plan ownership:
- User entrypoints (buttons, clicks, navigation)
- Mode-specific click behavior (normal mode vs edit mode)
- Chooser/menu existence
- Route/navigation ownership
- Cross-view consistency rules
- Conflict UI ownership
- Explicit defer decisions

---

## Tier 1 — Blocks Core User Flows

Priority order within Tier 1 follows the later Claude critique:
1. Bit completion UI
2. Task 25 formula correction
3. Task 12 false completion
4. Node property editing
5. Level 1-2 chooser creation

### 1.1 Bit Manual-Complete / Undo-Complete / Remove UI

| Aspect | Detail |
|--------|--------|
| Classification | **Execution Plan Omission** |
| Source | Both Claude and Codex independently identified |
| PRD reference | Section 13 (Completion Flow), lines 393-403 |
| Priority | Most fundamental gap — core user action in a task manager |

**The problem:**
PRD specifies three Bit completion triggers:
- Auto-complete (all Chunks done) — covered by Task 24 Hook 3
- Force-complete (user manually completes at any point) — **no UI task**
- Zero-Chunk simple manual toggle — **no UI task**

Post-completion: "User can undo (toggle back to active) or remove (to trash)." — **no UI task**

Neither BitCard (Task 17) nor Bit Detail Popup (Task 21) has a completion toggle in their acceptance criteria.

**Action:** New task (Task 25a). See [New Tasks Specification](#new-tasks-specification).

---

### 1.2 Task 25 Level Formula Error

| Aspect | Detail |
|--------|--------|
| Classification | **Plan error** |
| Source | Plan-internal audit |
| Priority | Fix immediately — factual error |

**The problem:**
- Task 25 says: `level = parentNode.level` (same grid level)
- SCHEMA.md says: `level = parentNode.level + 1`
- A Bit at Level 2 (inside a Level 1 Node) promoted to a Node should become Level 1 (display level = parent + 1). Task 25 would incorrectly set it to Level 0.

**Action:** Fix Task 25 in place. Change `parentNode.level` to `parentNode.level + 1`. SCHEMA.md is authoritative.

---

### 1.3 Task 12 Urgency Dot — False Completion

| Aspect | Detail |
|--------|--------|
| Classification | **False completion** |
| Source | Spec-impl audit (code inspection) |
| Priority | Regression-grade issue on a closed task — reopen before Phase 5 |

**The problem:**
- Task 12 is marked `[x]` complete
- Acceptance criterion: "Urgency dot appears on Calendar button"
- Implementation: Calendar button in `sidebar.tsx` has no dot element, no urgency import, no global urgency query. Button is wired to `noop`

The underlying issue is deeper: the **global urgency query** (computing the most urgent item across all levels) does not exist as a hook or utility anywhere. `useGridData` only fetches for one `parentId`. No hook computes cross-project urgency.

**Action:** Do not preserve Task 12 as `[x]` with a note only. Re-open Task 12 (recommended), or split a Task 12a remediation task if status preservation is required. Task 12 must explicitly regain ownership of the urgency dot acceptance criterion, while Task 26 and Task 31 keep ownership of Calendar/Trash routing.

---

### 1.4 Node Property Editing

| Aspect | Detail |
|--------|--------|
| Classification | **Execution Plan Omission** |
| Source | User first-pass, confirmed by both Claude and Codex |
| PRD reference | Section 17 (Edit Mode), line 509 |
| Priority | No post-creation editing path for Nodes |

**The problem:**
- PRD: "Click an item to edit its properties (title, icon, color, deadline, etc.)"
- Task 21 covers Bit editing via the popup
- No task covers Node property editing — users can create Nodes but never edit title, icon, color, or description
- Click-conflict: normal-mode click navigates into the Node; edit-mode click should open an edit dialog instead

**Action:** New task (Task 25c). See [New Tasks Specification](#new-tasks-specification).

---

### 1.5 Level 1-2 Node/Bit Chooser Creation Menu

| Aspect | Detail |
|--------|--------|
| Classification | **Execution Plan Omission** |
| Source | User first-pass, confirmed by all reviewers |
| PRD reference | Section 16 (Sidebar), line 482; SPEC line 143 |
| Priority | Creation flow gap at Level 1-2 |

**The problem:**
- PRD/SPEC: `+` at Level 1-2 shows a Node/Bit chooser menu
- Task 15 explicitly deferred this from Phase 3
- Task 18 picked up Level 3 direct Bit creation but never reintroduced the L1-2 menu
- No subsequent task (19-35) mentions it
- Current behavior: L1-2 creates Nodes only

Evidence chain: PRD line 482 → SPEC line 143 → Task 15 defers → Task 18 picks up half → other half lost.

**Action:** New task (Task 25b). See [New Tasks Specification](#new-tasks-specification).

---

## Tier 2 — Significant Functional Gaps

### 2.1 Past-Deadline "Never Prompts Again" Persistence

| Aspect | Detail |
|--------|--------|
| Classification | **Omission** (schema + UI) |
| Source | PRD audit agent |
| PRD reference | Section 11, lines 339-340 |

**The problem:**
- PRD: After user clicks X on "Done?" overlay → "Never prompts again. User can manually complete later."
- No schema field (`pastDeadlineDismissed`) or client-state mechanism persists this dismissal
- Without it, the overlay re-renders on every mount because the deadline is still in the past

**Action:** This requires a design decision before it can become a task:
- Option A: Add `pastDeadlineDismissed: boolean` to both Node and Bit schemas in SCHEMA.md
- Option B: Use a Zustand store with localStorage persistence (lost on browser clear)
- Recommendation: Option A (schema field) — consistent with local-first approach, survives page refresh

Amend Task 17 (BitCard) with dismiss persistence. Add schema field.

---

### 2.2 Parent Deadline Conflict UI Ownership

| Aspect | Detail |
|--------|--------|
| Classification | **Weak Omission** |
| Source | User first-pass, confirmed by all reviewers |
| PRD reference | Section 11, lines 357-362; Section 25, lines 2140-2143 |

**The problem:**
- Task 24 Hook 2 returns conflict info when a parent deadline is shortened — data layer exists
- Task 17 BitCard implements blur + overlay for past-deadline ("Done?") — visual pattern exists
- No task assigns the **rendering of "Modify timeline" overlays** on conflicting children
- No task creates the **"Update parent's deadline too?" modal** for upward violations
- Two distinct UI components are needed, neither has a task

**Action:** Amend Task 24 to define a shared `DeadlineConflictOverlay` component and a `DeadlineConflictModal`. Specify that Tasks 21, 27/30, and 25c consume them.

---

### 2.3 Node Completion Visual Indicator

| Aspect | Detail |
|--------|--------|
| Classification | **Weak Omission** |
| Source | Both plan-internal and PRD audit agents |
| PRD reference | Section 6, lines 200-202; Section 13, lines 406-409 |

**The problem:**
- PRD: "Level 1-2 Nodes auto-reflect completion with a visual indicator when all internal Bits are done. Passive."
- `isNodeComplete()` utility exists (Task 6)
- Task 14 (NodeCard) has no acceptance criteria for rendering a completion state
- The computation exists but is invisible

**Action:** Amend Task 14 — add completion indicator rendering + acceptance criterion.

---

### 2.4 Bit Detail Popup from Calendar Views

| Aspect | Detail |
|--------|--------|
| Classification | **Omission** |
| Source | PRD audit agent |
| SPEC reference | Line 152: "Triggered by `?bit=[bitId]` on any grid or calendar page" |

**The problem:**
- SPEC says `?bit=[bitId]` works on "any grid or calendar page"
- No Calendar task (26-30) specifies click-to-open behavior for Bits
- Day columns and compact items need click handlers that append `?bit=[bitId]`

**Action:** Amend Tasks 27 and 28 acceptance criteria.

---

### 2.5 Calendar / Trash Sidebar Button Wiring

| Aspect | Detail |
|--------|--------|
| Classification | **Weak Omission** |
| Source | Spec-impl audit |

**The problem:**
- Calendar and Trash sidebar buttons are wired to `noop` in `sidebar.tsx`
- No task explicitly assigns the click → navigate behavior
- Task 33 wires Search. Calendar and Trash routing is orphaned.

**Action:** Amend Task 26 (Calendar button → `/calendar/weekly`) and Task 31 (Trash button → `/trash`).

---

### 2.6 Global Urgency Query / Hook

| Aspect | Detail |
|--------|--------|
| Classification | **Omission** |
| Source | Plan-internal audit |

**The problem:**
- Task 12 acceptance says "Urgency dot appears on Calendar button"
- Task 14 says "Urgency badge on icon corner when child Bits have approaching deadlines"
- No hook or utility computes **global urgency** for the Calendar button or **per-Node child urgency** for NodeCard
- `useGridData` only fetches for one parentId

**Action:** Add two explicit selectors to Task 24 scope:
- `useGlobalUrgency()` for project-wide maximum urgency (Task 12 consumes this)
- `useNodeUrgency(parentNodeId)` or equivalent per-Node selector for child-Bit urgency (Task 14 consumes this)

Do not collapse both requirements into one `{ maxUrgencyLevel }` return value.

---

### 2.7 Grid-Full User Prompt

| Aspect | Detail |
|--------|--------|
| Classification | **Omission** |
| Source | Both Claude and Codex raised it as a user-facing dead-end |

**The problem:**
- PRD Section 5 says "If no empty cell exists, the user is prompted to reorganize."
- BFS returns `null`
- No task implements a toast/dialog for this
- This is not just a boundary detail; it is a user-facing dead-end in the creation flow

**Action:** Amend creation-flow tasks (Task 25b for L1-2, Task 15 for L0) and Task 24 error plumbing: when BFS returns `null`, surface a toast such as "Grid is full. Reorganize or move items to make space."

---

## Tier 3 — Boundary Details That Should Be Explicit

### 3.1 Edit-Mode Click Precedence

**The problem:** In normal mode, clicking a Node navigates. In edit mode, it should open a property editor. For Bits, clicking already opens the popup in both modes. The execution plan does not specify this routing.

**Action:** Specify in the Node Edit task (25c) that edit-mode intercepts Node clicks. Clarify that Bit edit-mode click behavior is unchanged (popup opens as in normal mode).

---

### 3.2 BFS Origin Rule (Node vs Bit)

**The problem:** PRD Section 5 says Node creation BFS starts from top-left `(0,0)`, Bit creation from top-right `(GRID_COLS-1, 0)`. The plan only mentions `(0,0)` for sidebar placement. When Bit creation at L1-2 is added, the origin distinction matters.

**Action:** Add to Task 25b (L1-2 chooser): "Bit placement: BFS from `(GRID_COLS-1, 0)` (top-right). Node placement: BFS from `(0, 0)` (top-left)."

---

### 3.3 Calendar Completed-State Rendering

**The problem:** PRD Section 13 says "Completed Bits in Calendar views appear grayed/completed." Phase 6 tasks do not describe this visual treatment.

**Action:** Amend Task 27 and Task 28 acceptance criteria: "Completed items render with strikethrough + gray treatment consistent with grid view."

---

### 3.4 ESC Key Priority Order

**The problem:** Four ESC handlers exist: edit mode (Task 20), search overlay (Task 33), bit detail popup (Task 21), calendar column expand (Task 27). No priority order defined.

**Action:** Add to Cross-Cutting Concerns: "ESC key priority (innermost first): Search overlay > Bit detail popup > Calendar column expand > Edit mode."

---

### 3.5 Calendar Weekly/Monthly Switching UI

**The problem:** No task defines how users switch between `/calendar/weekly` and `/calendar/monthly`. No tab, toggle, or submenu exists.

**Action:** Amend Task 26 (Calendar Layout): add a view toggle in the calendar layout header.

---

### 3.6 "On a Day" (All-Day) UI Toggle

**The problem:** Schema has `deadlineAllDay` on Nodes/Bits and `timeAllDay` on Chunks. No task specifies a UI control to set this. Task 21 says "deadline date picker" but not the all-day option.

**Action:** Amend Task 21: "Deadline picker includes an 'All day' toggle. When enabled, sets `deadlineAllDay: true` and hides the time picker."

---

### 3.7 Chunk Search Result Navigation

**The problem:** Clicking a Chunk search result needs triple navigation: `/grid/[grandparentNodeId]?bit=[parentBitId]`. Task 29 (monthly popover) specifies this pattern. Task 33 (Search Overlay) does not. The `SearchResult` type lacks `parentBitId` and `grandparentNodeId` fields.

**Action:** Amend Task 33: "Chunk results navigate to `/grid/[grandparentId]?bit=[parentBitId]`. Update `SearchResult` type to include these fields."

---

### 3.8 Bit-to-Node Promotion UI Entry Point

**The problem:** Task 25 says "Surface in UI: context menu or edit mode action on Bit cards." Not committed to a specific implementation. No component creates this entry point.

**Action:** Amend Task 25: "Add a 'Promote to Node' action in the Bit Detail Popup (Task 21) header dropdown menu. Available when the Bit has 1+ Chunks."

---

### 3.9 Trash Auto-Cleanup Trigger Mechanism

**The problem:** Task 32 Hook 7 says "on app startup and periodically." WHERE the timer runs is unspecified.

**Action:** Amend Task 32: "Wire cleanup in a `useTrashAutoCleanup` hook called from `providers.tsx`. Run once on mount + `setInterval` every 60 minutes."

---

## Tier 4 — Explicit Defer Notes

These items exist in the PRD but should be explicitly deferred, not silently omitted.

| Item | PRD Reference | Action |
|------|--------------|--------|
| "Move to..." tree browser menu | Section 20.3, line 2053 | Add defer note to Task 34. Move to PRD Section 26 or v1.1 bucket |
| Folded sidebar red highlight + scale animation | Section 16, line 494-495 | Phase 7 polish note |
| Breadcrumb subtitle expand option | Section 6, line 197 | Phase 7 polish note |
| Floating animation ON/OFF toggle settings | Section 25, line 2130 | Defer — Task 35 has animation, settings UI is out of scope for v1 |
| "Neglected" dust/noise texture | Section 10, line 306 | Phase 7 polish or defer to Section 26 |
| "Highlight Node in focus" design principle | Section 25, line 2129 | Defer to Section 26 (aspirational) |
| Multi-layered background | Section 25, line 2132 | Defer to Section 26 (aspirational) |
| Export/Import (v1.5) | Section 1, lines 60-61 | Add to Section 26 with note: "Planned for v1.5" |

---

## Tier 5 — Code-Level Fixes

These are implementation deviations that do not need execution-plan amendments. They should be fixed as a pre-Phase-5 cleanup.

| Item | File | Fix |
|------|------|-----|
| `useCalendarData` bypasses DataStore | `src/hooks/use-calendar-data.ts` | Change `import { db }` to `import { indexedDBStore }` and use DataStore methods |
| Non-reactive parent node fetch | `src/app/grid/[nodeId]/_components/node-grid-shell.tsx` | Wrap parent node fetch in `liveQuery` subscription |
| Non-reactive breadcrumb fetch | `src/components/layout/breadcrumbs.tsx` | Wrap ancestor chain fetch in `liveQuery` subscription |
| Dead `useDataStore()` context | `src/app/providers.tsx` | Remove `DataStoreContext` and `useDataStore` export (all hooks use direct imports) |
| Unused `sidebarVariants` | `src/lib/animations/layout.ts` | Either consume in sidebar or remove definition |

---

## Amendment Actions Summary

| # | Action Type | Target | Description |
|---|------------|--------|-------------|
| 1 | **New task** | Task 25a | Bit Status Toggle + Completion UI |
| 2 | **Fix** | Task 25 | Level formula: `parentNode.level` → `parentNode.level + 1` |
| 3 | **Re-open / amend** | Task 12 | False completion fix: urgency dot returns to active scope; sidebar wiring coordinated with Tasks 26/31 |
| 4 | **New task** | Task 25c | Node Property Edit Dialog |
| 5 | **New task** | Task 25b | Level 1-2 Creation Chooser + Bit Creation Dialog |
| 6 | **Amend** | Task 14 | Add Node completion visual indicator |
| 7 | **Amend** | Task 17 | Add past-deadline dismiss persistence |
| 8 | **Amend** | Task 21 | Add "All day" toggle, Bit-to-Node promotion action |
| 9 | **Amend** | Task 24 | Add `DeadlineConflictOverlay`, `DeadlineConflictModal`, `useGlobalUrgency`, `useNodeUrgency`, grid-full feedback |
| 10 | **Amend** | Task 25 | Fix level formula, commit to promotion UI surface |
| 11 | **Amend** | Task 26 | Add Calendar/Monthly view toggle, wire Calendar sidebar button |
| 12 | **Amend** | Task 27 | Add Bit Detail click, completed-state rendering |
| 13 | **Amend** | Task 28 | Add Bit Detail click, completed-state rendering |
| 14 | **Amend** | Task 31 | Wire Trash sidebar button |
| 15 | **Amend** | Task 32 | Specify auto-cleanup trigger mechanism |
| 16 | **Amend** | Task 33 | Add Chunk search navigation, ESC priority |
| 17 | **Amend** | Task 34 | Add "Move to..." defer note |
| 18 | **Add** | Cross-Cutting | ESC priority order, BFS origin rule |
| 19 | **Add** | Phase 7 Notes | Defer notes for polish items |
| 20 | **Update** | SCHEMA.md | Add `pastDeadlineDismissed` field to Node and Bit schemas |

---

## New Tasks Specification

### Task 25a: Bit Status Toggle + Completion UI

- **Status:** `[ ]`
- **Files:** `src/components/bit-detail/bit-detail-popup.tsx` (update), `src/components/grid/bit-card.tsx` (update)
- **Dependencies:** Task 21 (Bit Detail Popup), Task 24 (Hook 3 — auto-completion)
- **Actions:**
  - **Bit Detail Popup header:** Add a status toggle button (checkmark icon). Click cycles: active → complete → active. When completing: apply Hook 3 mtime cascade. When undoing: revert Bit status to `"active"`, cascade mtime
  - **Zero-Chunk Bits:** Status toggle is the only completion mechanism (no auto-completion possible). Same checkmark button
  - **Force-complete:** Toggle to complete even with incomplete Chunks. All Chunk statuses remain unchanged — only the Bit flips
  - **Undo-complete:** Toggle back to active. If Bit was auto-completed (all Chunks done), uncompleting the Bit sets `status = "active"` but does not change Chunk statuses
  - **Remove-to-trash:** Add a "Move to trash" action in the Bit Detail Popup header (trash icon or dropdown menu). Calls `DataStore.softDeleteBit(bitId)`
  - **BitCard visual:** Completed Bits show strikethrough title + gray treatment + `opacity-50`. In edit mode, completed Bits still jiggle and show delete overlay
  - **Calendar consistency:** Completed Bits in Calendar day columns (Task 27/28) render with the same gray/strikethrough treatment
- **Acceptance:**
  - Bit Detail Popup has a completion toggle button. Click completes/uncompletes
  - Zero-Chunk Bits can be completed via toggle
  - Force-complete works with incomplete Chunks
  - Undo-complete reverts to active
  - "Move to trash" action works from popup
  - Completed BitCard shows strikethrough + gray
- **Commit:** `feat: add bit status toggle, force-complete, undo, and remove-to-trash`

---

### Task 25b: Level 1-2 Creation Chooser + Bit Creation Dialog

- **Status:** `[ ]`
- **Files:** `src/components/grid/create-item-chooser.tsx` (new), `src/components/grid/create-bit-dialog.tsx` (update existing), `src/app/grid/[nodeId]/_components/node-grid-shell.tsx` (update)
- **Dependencies:** Task 18 (Level 1-3 Grid Page), Task 5 (DataStore)
- **Actions:**
  - `create-item-chooser.tsx`: `"use client"`. Small popover triggered by `+` button at Level 1-2. Two options: "Node" (folder icon) and "Bit" (check-square icon). Selecting "Node" opens existing `CreateNodeDialog`. Selecting "Bit" opens the existing `CreateBitDialog`
  - `create-bit-dialog.tsx`: reuse and extend the existing Bit creation dialog already used for Level 3 direct Bit creation. Expand fields as needed for the Level 1-2 flow: title (required), icon picker (reuse `NODE_ICON_MAP` pattern), deadline (optional date picker), priority (optional: high/mid/low/none toggle). No color field — Bit inherits parent Node color. No description — can be added later via Bit Detail Popup (Task 21)
  - `node-grid-shell.tsx` update: At Level 1-2, both sidebar `+` and empty-cell `+` open the chooser. At Level 3, `+` opens `CreateBitDialog` directly (existing behavior)
  - **BFS origin rule:** Node placement: BFS from `(0, 0)` (top-left). Bit placement: BFS from `(GRID_COLS-1, 0)` (top-right). Empty-cell `+`: BFS from `(clickedX, clickedY)` regardless of type
  - **Grid-full feedback:** When BFS returns `null`, show a toast: "Grid is full. Reorganize or move items to make space." Do not open the creation dialog
- **Acceptance:**
  - Level 1-2 `+` (sidebar and empty-cell) opens a Node/Bit chooser popover
  - Selecting "Node" → `CreateNodeDialog` → places Node via BFS from top-left
  - Selecting "Bit" → `CreateBitDialog` → places Bit via BFS from top-right
  - Level 3 `+` opens `CreateBitDialog` directly (unchanged)
  - Level 0 `+` opens `CreateNodeDialog` directly (unchanged)
  - Grid-full condition shows toast instead of opening dialog
- **Commit:** `feat: add Level 1-2 creation chooser, Bit creation dialog, and grid-full feedback`

---

### Task 25c: Node Property Edit Dialog

- **Status:** `[ ]`
- **Files:** `src/components/grid/edit-node-dialog.tsx` (new), `src/components/grid/node-card.tsx` (update), `src/components/grid/edit-mode-overlay.tsx` (update)
- **Dependencies:** Task 14 (NodeCard), Task 20 (Edit Mode Overlay)
- **Actions:**
  - `edit-node-dialog.tsx`: `"use client"`. shadcn Dialog. Pre-populated with existing Node data. Editable fields: title, icon (icon picker), color (color input), description (textarea), deadline (date picker with "All day" toggle). Save calls `DataStore.updateNode(nodeId, changes)`
  - `node-card.tsx` update: Accept an `isEditMode` prop. When `isEditMode === true`, click opens `EditNodeDialog` instead of navigating to `/grid/[nodeId]`
  - `edit-mode-overlay.tsx` update: Pass `isEditMode={true}` to NodeCard when edit mode is active
  - **Click precedence rule:** Normal mode: click Node → navigate to `/grid/[nodeId]`. Edit mode: click Node → open `EditNodeDialog`. For Bits: click behavior is unchanged in both modes (opens Bit Detail Popup)
- **Acceptance:**
  - In edit mode, clicking a Node opens `EditNodeDialog` with pre-populated fields
  - Title, icon, color, description, deadline are all editable
  - Save persists changes via DataStore
  - In normal mode, clicking a Node still navigates (unchanged)
  - Edit-mode click on a Bit still opens the Bit Detail Popup (unchanged)
- **Commit:** `feat: add node property edit dialog with edit-mode click routing`

---

## Existing Task Amendments

### Task 12: Sidebar (re-open false completion)

Change status:

```
[x] → [ ]
```

Add to Actions:

```
  - Calendar urgency dot: consume `useGlobalUrgency()` from Task 24 and render a badge/dot
    on the Calendar button when any active item in the project has non-null urgency
  - Coordination note: Calendar button routing remains owned by Task 26. Trash button routing
    remains owned by Task 31. Task 12 only regains ownership of the urgency-dot acceptance
    criterion that was previously marked complete without being delivered
```

Add to Acceptance:

```
  - Calendar button displays an urgency dot when `useGlobalUrgency()` reports an active urgent item
  - Task 12 must not be marked complete until the urgency dot is visible in the implemented sidebar
```

---

### Task 14: NodeCard (add completion indicator)

Add to Actions:

```
  - Completion indicator: use `isNodeComplete(childBits)` from Task 6. When all child Bits
    are complete, render a subtle checkmark overlay on the icon container (e.g.,
    `absolute bottom-0 right-0 w-4 h-4 bg-primary text-white rounded-full` with Check icon).
    Level 0 Nodes never show completion (per PRD — permanent domains)
```

Add to Acceptance:

```
  - Level 1-2 Node with all child Bits complete shows completion indicator. Level 0 Nodes never show it
```

---

### Task 17: BitCard (add past-deadline dismiss persistence)

Add to Actions:

```
  - Past-deadline dismiss: When user clicks X on "Done?" overlay, call
    `DataStore.updateBit(bitId, { pastDeadlineDismissed: true })`. On render, skip the
    blur+overlay if `bit.pastDeadlineDismissed === true`. Item enters Level 3 urgency state
    (deep red blinking) instead. Never prompts again (PRD Section 11)
```

Add to Acceptance:

```
  - Clicking X on past-deadline overlay dismisses it permanently. Item blinks deep red. Re-renders do not re-show the overlay
```

**Prerequisite:** Add `pastDeadlineDismissed: boolean` (default `false`) to both Node and Bit schemas in SCHEMA.md.

---

### Task 21: Bit Detail Popup (add all-day toggle, promotion action)

Add to Actions after "deadline date picker":

```
    - Deadline picker includes an "All day" toggle. When enabled, sets deadlineAllDay: true
      and hides the time input. When disabled, shows time input and sets deadlineAllDay: false
    - Header actions dropdown (three-dot menu or icon row): includes "Promote to Node"
      (available when Bit has 1+ Chunks, calls Task 25 promoteBitToNode), and status
      toggle (Task 25a)
```

Add to Acceptance:

```
  - "All day" toggle sets deadlineAllDay correctly. Promotion action visible when Chunks exist
```

---

### Task 24: Core Application Hooks (add conflict UI, urgency hook, grid-full)

Add to Actions:

```
  - **Hook 2 UI components:** Create shared `DeadlineConflictModal` ("Child cannot exceed
    parent's deadline. Update parent's deadline too? Check/X") and
    `DeadlineConflictOverlay` (blur + "Modify timeline" + check/x on conflicting children).
    These components are consumed by Task 21, Tasks 27/30, and Task 25c
  - **Global urgency hook:** Export `useGlobalUrgency()` from `src/hooks/use-global-urgency.ts`.
    Queries all active Nodes and Bits with deadlines across the entire project. Returns
    `{ maxUrgencyLevel: UrgencyLevel | null }` — the most urgent item globally.
    Consumed by Task 12 (Calendar button dot)
  - **Per-Node urgency selector:** Export `useNodeUrgency(parentNodeId)` (or an equivalent
    selector utility) that computes urgency from a specific Node's child Bits. Returns
    `{ urgencyLevel: UrgencyLevel | null }`.
    Consumed by Task 14 (Node badge) so NodeCard urgency is not coupled to global urgency
  - **Grid-full feedback:** When Hook 8 (grid cell uniqueness) determines BFS returns null,
    the calling component should show a toast notification. Define a `GridFullError` type
    that creation flows can catch and display
```

Add to Files:

```
  `src/hooks/use-global-urgency.ts` (new), `src/hooks/use-node-urgency.ts` (new), `src/components/shared/deadline-conflict-modal.tsx` (new), `src/components/shared/deadline-conflict-overlay.tsx` (new)
```

Add to Acceptance:

```
  - `global-urgency.test.ts`: returns correct urgency level across multiple nodes/bits; null when no deadlines
  - `node-urgency.test.ts`: returns correct urgency level for a Node's child Bits only
  - Conflict modal blocks child deadline past parent; overlay renders on conflicting children when parent shortened
```

---

### Task 25: Bit-to-Node Promotion (fix formula, specify UI)

Change:
```
Set `level = parentNode.level` (same grid level)
```
To:
```
Set `level = parentNode.level + 1` (same level as the Bit's display position — SCHEMA.md is authoritative)
```

Change:
```
  - Surface in UI: context menu or edit mode action on Bit cards
```
To:
```
  - Surface in UI: "Promote to Node" action in the Bit Detail Popup header dropdown (added by Task 21 amendment). Available when the Bit has 1+ Chunks
```

---

### Task 26: Calendar Layout (add view toggle, wire sidebar)

Add to Actions:

```
  - Calendar view toggle: header or tab bar with "Weekly" / "Monthly" options.
    Active view highlighted. Click navigates to `/calendar/weekly` or `/calendar/monthly`
  - Wire Calendar sidebar button: update `sidebar.tsx` to navigate to `/calendar/weekly`
    (default view) on Calendar button click. Replace noop handler
```

Add to Acceptance:

```
  - View toggle switches between Weekly and Monthly. Calendar sidebar button navigates to weekly view
```

---

### Task 27: Calendar:Weekly (add Bit Detail click, completed-state)

Add to Actions:

```
  - Click Bit/Chunk in day column → append `?bit=[bitId]` (or `?bit=[parentBitId]` for
    Chunks) to URL, opening Bit Detail Popup. Consistent with grid view behavior (SPEC)
  - Completed items in day columns render with strikethrough title + gray treatment + reduced
    opacity, consistent with grid view (PRD Section 13)
```

Add to Acceptance:

```
  - Clicking a Bit in a day column opens Bit Detail Popup. Completed items appear grayed
```

---

### Task 28: Compact Bit (add Bit Detail click, completed-state)

Add to `compact-bit-item.tsx` Actions:

```
  - Click compact item → append `?bit=[bitId]` to URL for Bits, `?bit=[parentBitId]` for
    Chunks. Opens Bit Detail Popup
  - Completed compact items: title has `line-through text-muted-foreground` treatment
```

Add to Acceptance:

```
  - Clicking a compact item opens Bit Detail Popup. Completed compact items show strikethrough
```

---

### Task 31: Trash Page (add sidebar wiring, file listing)

Add to Actions:

```
  - Wire Trash sidebar button: update `sidebar.tsx` to navigate to `/trash` on Trash button
    click. Replace noop handler
```

Add to Files:

```
  `src/hooks/use-trash-data.ts` (new)
```

Add to Acceptance:

```
  - Trash sidebar button navigates to /trash page
```

---

### Task 32: Cascade Delete/Restore/Cleanup (add trigger mechanism)

Add to Hook 7 action:

```
  - Trigger mechanism: Create `useTrashAutoCleanup` hook in `src/hooks/use-trash-auto-cleanup.ts`.
    Call from `providers.tsx` (or trash page). Run cleanup once on mount + `setInterval`
    every 60 minutes. Cleanup queries `deletedAt < Date.now() - 30 * 86400000` and applies
    Hook 6 (cascade hard-delete) to each match
```

---

### Task 33: Search Overlay (add Chunk navigation, ESC note)

Add to Actions:

```
  - Chunk result navigation: Chunk results navigate to `/grid/[grandparentId]?bit=[parentBitId]`,
    opening the Bit Detail Popup at the Chunk's parent Bit. Update `SearchResult` type to include
    `parentBitId` and `grandparentNodeId` fields for Chunk results
  - ESC priority: Search overlay ESC handler takes highest priority. If search is open, ESC
    closes search only (does not also exit edit mode or close other layers)
```

Add to Acceptance:

```
  - Clicking a Chunk result navigates to parent Bit's grid and opens Bit Detail Popup
```

---

### Task 34: DnD Grid Interactions (add "Move to..." defer note)

Add after Acceptance:

```
- **Deferred (audit):** "Move to..." tree browser menu (PRD Section 20.3) is deferred to
  post-v1. v1 move coverage: drag-onto-Node (same grid) + drag-to-breadcrumb (ancestors).
  The tree browser for distant targets (cousin/uncle Nodes not reachable by the first two
  mechanisms) is non-trivial scope for a convenience feature. Added to PRD Section 26.
```

---

## Cross-Cutting Concerns Additions

Add to the Cross-Cutting Concerns section:

```
- **ESC key priority (innermost first):** When multiple closeable layers are open simultaneously,
  ESC closes the innermost one only. Priority order: Search overlay > Bit detail popup >
  Calendar column expand > Edit mode. Each handler checks whether a higher-priority layer is
  open before acting.
- **BFS origin by item type:** Node creation: BFS starts from `(0, 0)` (top-left). Bit creation:
  BFS starts from `(GRID_COLS-1, 0)` (top-right). This respects the 2-way split naturally.
  Empty-cell `+` creation: BFS from `(clickedX, clickedY)` regardless of type.
- **Edit-mode click precedence:** Normal mode: click Node → navigate, click Bit → popup. Edit
  mode: click Node → edit dialog, click Bit → popup (unchanged). Edit mode intercepts Node
  clicks only.
- **Grid-full feedback:** When BFS returns null (no empty cells), show a toast notification
  rather than silently failing. All creation paths must handle this case.
```

---

## Defer Notes to Add

### Phase 7 Notes section (add)

```
> **Deferred polish items (audit):**
> - Folded sidebar reopen hover affordance (PRD Section 16, line 494): red highlight + scale animation on mouse enter. Cosmetic.
> - Breadcrumb subtitle expand option (PRD Section 6, line 197): expandable description below breadcrumb. Cosmetic.
> - NodeCard icon container size (52px vs 56px) and Sidebar button sizing — deferred from Phase 4.5. Cosmetic.
> - "Neglected" aging dust/noise texture (PRD Section 10, line 306): currently filter-only. Full texture effect deferred.
> - Floating animation ON/OFF toggle settings surface: Task 35 has the animation, but no settings UI. Settings deferred.
```

### PRD Section 26 / Non-features (add)

Add to the Non-features bullet in Cross-Cutting Concerns:

```
- **Non-features (PRD Section 26):** Do NOT implement: Mascot System, Labs, AI-Powered Search,
  Responsive Design, Onboarding Enhancement, "Move to..." tree browser menu, "Highlight Node
  in focus" grayscale treatment, multi-layered background patterns, Export/Import (planned
  for v1.5). These are explicitly deferred.
```

---

## Pre-Phase-5 Code Cleanup Checklist

These are implementation fixes that do not need plan amendments. Fix before starting Phase 5:

- [ ] `src/hooks/use-calendar-data.ts` — Change `import { db }` to `import { indexedDBStore }` and use DataStore methods instead of raw Dexie queries
- [ ] `src/app/grid/[nodeId]/_components/node-grid-shell.tsx` — Wrap parent node fetch in `liveQuery` subscription for reactivity
- [ ] `src/components/layout/breadcrumbs.tsx` — Wrap ancestor chain fetch in `liveQuery` subscription for reactivity
- [ ] `src/app/providers.tsx` — Remove dead `DataStoreContext` and `useDataStore()` export
- [ ] `src/lib/animations/layout.ts` — Either consume `sidebarVariants` in sidebar or remove the definition

---

## SCHEMA.md Update Required

Add `pastDeadlineDismissed` field to both Node and Bit schemas:

**Node Schema addition:**
```
| pastDeadlineDismissed | boolean | Auto | Default false. Set true when user dismisses the past-deadline "Done?" overlay |
```

**Bit Schema addition:**
```
| pastDeadlineDismissed | boolean | Auto | Default false. Set true when user dismisses the past-deadline "Done?" overlay |
```

**Zod schema updates** (`src/lib/db/schema.ts`):
- Add `pastDeadlineDismissed: z.boolean().default(false)` to both `nodeSchema` and `bitSchema`
- Add to `createNodeSchema` and `createBitSchema` as optional with default
