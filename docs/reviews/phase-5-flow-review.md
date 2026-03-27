# Flow-Trace Review — Phase 5

**Reviewed:** 2026-03-27
**Inputs:** PRD.md, SPEC.md, EXECUTION_PLAN.md (Phase 5: Tasks 21–25c)

---

## Table of Contents

- [Flow-Trace Table](#flow-trace-table)
- [Gaps Found](#gaps-found)
- [Detailed Gap Analysis](#detailed-gap-analysis)
- [Summary](#summary)

---

## Flow-Trace Table

| # | User Flow | Trigger | Intended Outcome | Owning Task | Boundary Cases | Status |
|---|-----------|---------|------------------|-------------|----------------|--------|
| 1 | Click a Bit card on the grid → Bit Detail Popup opens | Click BitCard | Popup opens via `?bit=[bitId]` query param; fade+slide entry animation | Task 21 | Bit not found (deleted/trashed); clicking while popup already open | ✅ Owned |
| 2 | Edit Bit title inline | Focus title input in popup header | Title saved to DataStore on blur/enter; mtime cascade triggers | Task 21 | Empty title (should be prevented); very long titles | ⚠️ Weak |
| 3 | Edit Bit description inline | Focus description textarea | Description saved on blur; mtime cascade triggers | Task 21 | No explicit save trigger specified (blur vs. auto-save debounce not defined) | ⚠️ Weak |
| 4 | Toggle priority (high → mid → low → null) | Click priority toggle in header | Priority cycles through states, persisted to DataStore | Task 21 | Null/none state display in BitCard after toggle | ✅ Owned |
| 5 | Set deadline + all-day toggle | Interact with deadline date picker in header | `deadline` field set; `deadlineAllDay: true` hides time picker | Task 21 | Deadline hierarchy check (child vs. parent Node deadline) must fire here — owned by Task 24; clearing a deadline; past-deadline immediate state | ⚠️ Weak |
| 6 | Close popup via backdrop click | Click `fixed inset-0` backdrop overlay | `?bit` param removed from URL; popup unmounts | Task 21 | Unsaved changes on title/description — no explicit discard/save-on-close policy stated | ⚠️ Weak |
| 7 | Close popup via ESC key | Press ESC | `?bit` param removed; popup unmounts | Task 21 | ESC while a nested dropdown/datepicker is open — should close the child first, not the popup | ⚠️ Weak |
| 8 | Close popup via browser back | Browser back button | `?bit` param removed; popup unmounts (URL-driven, no route change) | Task 21 | Forward navigation after back — popup should not re-open via forward unless `?bit` is re-added | ✅ Owned |
| 9 | mtime label shows "Last updated: X days ago" | Popup renders | Renders `formatDistanceToNow(bit.mtime)` as `text-xs text-muted-foreground` | Task 21 | mtime = now (just created/updated): should show "just now" or similar; mtime far in past: large number display | ✅ Owned |
| 10 | Popup opens from `?bit=[bitId]` URL directly (deep-link) | Direct URL access or page refresh | `useBitDetail()` reads param on mount; popup opens with correct data | Task 21 (uses `useBitDetail` from Task 9) | Bit ID that doesn't exist → graceful error or silent close; Bit is trashed → should not open | ⚠️ Weak |
| 11 | Chunk displays in vertical timeline with connecting line | Chunks exist for a Bit | Vertical line (`absolute left-3.5`), dots per chunk, content cards | Task 22 | Empty state (0 chunks): line + placeholder dot still visible per PRD Section 9; single chunk: no drag needed | ✅ Owned |
| 12 | Check chunk → filled dot + strikethrough | Click chunk toggle | `chunk.status = "complete"`, dot fills (`bg-primary`), title gets `line-through text-muted-foreground` | Task 22 | Auto-completion cascade to parent Bit (owned by Task 24 Hook 3) — boundary is Task 22 triggers the toggle, Task 24 handles side-effects | ✅ Owned |
| 13 | Uncheck chunk → unfilled dot, text restored | Click completed chunk toggle | `chunk.status = "active"`, dot reverts, strikethrough removed | Task 22 | Bit was auto-completed; unchecking chunk → Bit reverts to active (Task 24 Hook 3) | ✅ Owned |
| 14 | Drag chunk to reorder in timeline | `@dnd-kit/sortable` drag on chunk | `order` field updated on DataStore; timeline re-renders in new order | Task 22 | Drag onto itself (no-op); drag while chunk has a `time` value (time-sorted chunks should not be reorderable by drag? — ambiguous) | ⚠️ Weak |
| 15 | Deadline marker visible at bottom of timeline | Bit has a deadline set | Clock icon with deadline date rendered at bottom of timeline, vertically aligned with dots | Task 22 | Bit has no deadline: marker hidden; multiple deadline formats (all-day vs. timed) | ⚠️ Weak |
| 16 | Progress ring updates as chunks complete | Chunk toggled complete/incomplete | Circular SVG progress ring reflects `completedChunks / totalChunks` | Task 22 | 0 chunks (no ring per PRD Section 7: "Hidden when Bit has zero Chunks"); all complete (ring fully filled) | ✅ Owned |
| 17 | Click "Add a step" → new chunk created inline | Click "Add a step" button | New `Chunk` created via DataStore with `order = chunks.length`; inline edit field appears | Task 23 | Grid full equivalent not relevant; empty title prevention; chunk created while Bit has no prior chunks (first chunk) | ✅ Owned |
| 18 | Click chunk title → edit inline | Click chunk title text | Title becomes an editable input in place | Task 23 | Blur without change (no DataStore call); blur with empty string (should revert or be blocked) | ⚠️ Weak |
| 19 | Delete chunk permanently | Click delete/remove button per chunk | `DataStore.deleteChunk(chunkId)` called; chunk removed; mtime cascade triggers | Task 23 | Deleting last chunk: progress ring should disappear; auto-completion reversal if chunk was complete | ⚠️ Weak |
| 20 | Drag chunk from pool onto timeline (position it) | Drag chunk item from pool section to timeline section | Chunk gains an `order` position in timeline; pool and timeline re-render | Task 23 | The distinction between "pool" and "timeline" is implementation-defined: SPEC says chunks without `time` follow `order`, those with `time` sort by time. The drag-from-pool behavior is under-specified: does setting `order` move it from "pool" to "timeline"? | ⚠️ Weak |
| 21 | Edit chunk → parent Bit mtime updates → parent Node mtime updates | Any chunk write operation | Both parent Bit and parent Node `mtime = Date.now()` | Task 24 (Hook 1) | Chunk delete also cascades (stated in Task 23: "Chunk activity triggers mtime cascade on parent Bit (handled by Hook 1 in Task 24)") | ✅ Owned |
| 22 | Grid reposition does NOT update mtime | Drag item to new grid cell | `mtime` unchanged after reposition | Task 24 (Hook 1 exclusion) | Confirmed in PRD Section 10 mtime table and Task 24 unit test | ✅ Owned |
| 23 | Set child deadline past parent deadline → blocked with conflict info | Set Bit deadline past parent Node deadline, or Chunk time past parent Bit deadline | Operation blocked; `DeadlineConflictModal` surfaces "Update parent too? ✓/✗" | Task 24 (Hook 2) | Orphan Bits (no parent Node deadline): no constraint to enforce; null parent deadline: no constraint | ✅ Owned |
| 24 | Shorten parent deadline → conflicting children identified | Update Node deadline to date earlier than existing child Bit deadlines | Conflicting children blurred with `DeadlineConflictOverlay` "Modify timeline" + ✓/✗ | Task 24 (Hook 2) | ✓ opens child for date editing — which component handles that edit? (Task 21 for Bits, Task 25c for Nodes); ✗ keeps conflict state persisted indefinitely — no resolution tracking | ⚠️ Weak |
| 25 | Complete last chunk → Bit auto-completes | Toggle final incomplete chunk to complete | `bit.status = "complete"` set automatically; mtime cascade fires | Task 24 (Hook 3) | Bit already force-completed: toggling last chunk is a no-op on bit status; all chunks complete via bulk operation (not a UI flow in scope) | ✅ Owned |
| 26 | Uncomplete a chunk → Bit reverts to active | Toggle a complete chunk back to incomplete when Bit was auto-completed | `bit.status = "active"` reverted; mtime cascade | Task 24 (Hook 3) | Bit was force-completed (not auto): unchecking a chunk should NOT revert the Bit — this distinction is not explicit in Task 24 Hook 3 spec | ⚠️ Weak |
| 27 | Insert item at occupied cell → rejected with BFS fallback | Create or move item to already-occupied `(parentId, x, y)` | Operation rejected; BFS finds nearest empty cell and places there | Task 24 (Hook 8) | BFS returns null (grid full) → flows into grid-full toast (covered); BFS finds a cell the user didn't intend → no user confirmation, silent placement | ⚠️ Weak |
| 28 | Grid full → toast shown, creation dialog does NOT open | Any item creation when grid has no empty cells | Toast: "Grid is full. Reorganize or move items to make space." Dialog does not open | Task 24 (Hook 8) + Task 25b | Task 24 defines the toast; Task 25b enforces it in creation chooser. Task 25c (Node edit) doesn't create new items, not applicable | ✅ Owned |
| 29 | Global urgency dot on Calendar button | Any active Bit with an approaching or past deadline exists | Calendar sidebar button shows urgency notification dot in urgency color | Task 24 (`useGlobalUrgency`) | No urgent Bits: dot hidden; most urgent is past-deadline: dot shows "Past" color; sidebar folded: dot still visible on reopen button? — unspecified | ⚠️ Weak |
| 30 | "Promote to Node" action → Node created with child Bits from Chunks | Click "Promote to Node" in Bit Detail header dropdown | New Node created from Bit fields; each Chunk becomes a child Bit via BFS; original Bit + Chunks deleted | Task 25 | New Node's `level` must be `parentNode.level + 1` — if already at Level 3, promotion would exceed max depth (Level 4 is invalid); this boundary case is not addressed | ❌ Gap |
| 31 | Original Bit + Chunks deleted after promotion | Successful promotion | `DataStore.softDeleteBit(bitId)` or hard-delete + `deleteChunk` for each chunk | Task 25 | Partial failure (Node created but chunk-to-Bit conversion fails midway) — no rollback/transaction mentioned | ⚠️ Weak |
| 32 | "Promote to Node" only visible when Bit has 1+ Chunks | Bit Detail header dropdown renders | Action conditionally rendered based on `chunks.length > 0` | Task 21 + Task 25 | Zero-chunk Bit: action hidden (stated in Task 21 acceptance criteria) | ✅ Owned |
| 33 | Toggle Bit to complete in Bit Detail Popup | Click checkmark toggle button in popup header | `bit.status = "complete"`; mtime cascade; BitCard shows strikethrough + gray + opacity-50 | Task 25a | Bit already complete (toggle → active); no confirmation required per spec | ✅ Owned |
| 34 | Force-complete a Bit with incomplete Chunks | Click complete toggle when some chunks are incomplete | Bit flips to complete; Chunk statuses unchanged | Task 25a | Distinction from auto-complete: chunks remain as-is; progress bar still shows partial completion even though Bit is "complete" — visual inconsistency not addressed | ⚠️ Weak |
| 35 | Undo-complete (toggle back to active) | Click complete toggle on already-complete Bit | `bit.status = "active"`; mtime cascade | Task 25a | If Bit was auto-completed (all chunks done), undoing does NOT change chunk statuses — stated | ✅ Owned |
| 36 | Zero-Chunk Bit can be completed via toggle | Click complete toggle on Bit with no chunks | `bit.status = "complete"` without any Hook 3 trigger (no chunks to auto-complete) | Task 25a | Zero-chunk Bit has no progress bar; toggle is the sole completion path — stated | ✅ Owned |
| 37 | "Move to trash" from Bit Detail Popup header | Click "Move to trash" in header dropdown menu | `DataStore.softDeleteBit(bitId)` called; popup closes; BitCard disappears from grid | Task 25a | Popup should close after trash action — not explicitly stated; navigating back to same URL with `?bit=[deletedBitId]` should handle gracefully (deep-link boundary from Flow 10) | ⚠️ Weak |
| 38 | Completed BitCard shows strikethrough + gray + opacity-50 | Bit status becomes "complete" | BitCard title: `line-through`; card color: gray; `opacity-50` class applied | Task 25a | "Sinking effect" mentioned in PRD Section 7 ("sinking animation") — Task 25a only mentions visual styling, not the sinking animation. Sinking on completion not owned by any Phase 5 task | ❌ Gap |
| 39 | Click `+` at Level 1-2 → chooser popover appears | Click sidebar `+` or empty-cell `+` on Level 1-2 grid | Small popover with "Node" and "Bit" options appears | Task 25b | Already-open chooser clicked again — should close; clicking `+` in edit mode — behavior unspecified (jiggle mode has its own empty-cell `+`) | ⚠️ Weak |
| 40 | Select "Node" in chooser → CreateNodeDialog opens → Node placed BFS from top-left | Click "Node" in chooser popover | `CreateNodeDialog` opens; on submit, Node placed via BFS from `(0, 0)` | Task 25b | Existing CreateNodeDialog (from Task 19) used unchanged; no new dialog needed | ✅ Owned |
| 41 | Select "Bit" in chooser → CreateBitDialog opens → Bit placed BFS from top-right | Click "Bit" in chooser popover | `CreateBitDialog` opens; on submit, Bit placed via BFS from `(GRID_COLS-1, 0)` | Task 25b | Empty-cell `+` overrides BFS origin to `(clickedX, clickedY)` regardless of type — stated in Task 25b | ✅ Owned |
| 42 | Empty-cell `+` click at Level 1-2 → chooser appears | Click `+` shown on empty cell in edit mode at Level 1-2 | Chooser popover opens anchored to that cell; BFS origin = `(clickedX, clickedY)` | Task 25b | Empty-cell `+` is an edit-mode feature — Task 25b should integrate with edit-mode overlay (Task 20) for consistency; integration point not described | ⚠️ Weak |
| 43 | Level 3 `+` opens CreateBitDialog directly (no chooser) | Click `+` at Level 3 grid | `CreateBitDialog` opens without chooser step | Task 25b | No change from existing behavior — "unchanged" per task | ✅ Owned |
| 44 | Level 0 `+` opens CreateNodeDialog directly (unchanged) | Click `+` at Level 0 grid | `CreateNodeDialog` opens without chooser step | Task 25b | No change from existing behavior — "unchanged" per task | ✅ Owned |
| 45 | Grid full → toast shown instead of opening dialog | Create attempt at any level when grid is full | Toast shown; dialog not opened | Task 25b (+ Task 24 Hook 8) | Level 0 grid-full case: handled by existing Task 19 / Task 25b coordination; covered | ✅ Owned |
| 46 | Click Node in edit mode → EditNodeDialog opens | Click NodeCard while `isEditMode === true` | `EditNodeDialog` opens pre-populated with Node's title, icon, color, description, deadline | Task 25c | Edit mode is not currently active when popup is open — no conflict; Level 0 Nodes: never complete, can still have deadline edited | ✅ Owned |
| 47 | Edit title, icon, color, description, deadline in dialog → Save persists | Fill fields and click Save in `EditNodeDialog` | `DataStore.updateNode(nodeId, changes)` called; NodeCard re-renders with new data | Task 25c | Deadline hierarchy check must fire here (shortened deadline → conflicting child Bits) — owned by Task 24 `DeadlineConflictOverlay`, but integration point in EditNodeDialog not mentioned in Task 25c acceptance criteria | ⚠️ Weak |
| 48 | Click Node in normal mode → navigates (unchanged behavior) | Click NodeCard while not in edit mode | `router.push('/grid/[nodeId]')` | Task 25c | Unchanged behavior confirmed | ✅ Owned |
| 49 | Click Bit in edit mode → Bit Detail Popup opens (unchanged) | Click BitCard while `isEditMode === true` | `?bit=[bitId]` appended to URL; Bit Detail Popup opens | Task 25c | Unchanged behavior confirmed in task acceptance criteria | ✅ Owned |

**Status legend:** ✅ Owned | ⚠️ Weak | ❌ Gap | ⏸️ Deferred

---

## Gaps Found

| # | Flow | Gap Type | Description | Recommended Resolution |
|---|------|----------|-------------|----------------------|
| G1 | Flow 30 — Promote to Node | Missing boundary | Bit at Level 3 parent: promotion creates a Node at Level 4, which exceeds the maximum hierarchy depth. | **RESOLVED (2026-03-27):** Task 25 amended with max-depth guard: check `parentNode.level >= 3`, block with toast "Cannot promote — maximum nesting depth reached.", hide action at Level 3, unit test added. |
| G2 | Flow 38 — Completed BitCard sinking animation | Missing owner | PRD Section 7 specifies a sinking effect on completion. No Phase 5 task originally owned it. | **RESOLVED (2026-03-27):** Task 35 (Phase 7 Motion Animations) already owns `bitCompleteVariant` — confirmed in EXECUTION_PLAN.md. Task 25a amended with explicit defer note pointing to Task 35. Status: ⏸️ Deferred. |

---

## Detailed Gap Analysis

### G1 — Promotion at Maximum Depth (Flow 30)

**Context:** PRD Section 21 defines the promotion mapping. The hierarchy has a hard cap at Level 3 (PRD Section 3: "Maximum 4 levels, Level 0 through Level 3"). When a Bit lives inside a Level 3 Node (its parent is at Level 3), promoting it would create a Node at Level 4 — an illegal state.

**Task 25 spec says:** `level = parentNode.level + 1`. This formula is applied without a guard. If `parentNode.level === 3`, the result is `level = 4`, which violates the schema constraint (`level` must be 0–3 per SCHEMA.md).

**Impact:** High. This is a data integrity issue that could corrupt the hierarchy silently or produce a schema validation error without user-facing feedback. Level 3 Bits are the most action-oriented items and are prime promotion candidates (user has been decomposing tasks deep in the tree). This boundary will be hit.

**Resolution:** Add a pre-condition check in `promoteBitToNode()`:
```
if (parentNode.level >= 3) {
  // Cannot create a Node at level 4
  throw ConflictError or return { success: false, reason: "max_depth" }
}
```
Surface as toast in the UI. Add test case: `promotion-max-depth.test.ts`. Hide the "Promote to Node" dropdown action when the Bit's parent is at Level 3 (no-op prevention).

---

### G2 — Bit Completion Sinking Animation (Flow 38)

**Context:** PRD Section 7 states under "Completion Effects": "Sinking effect — the card visually sinks below the grid surface and fades." PRD Section 25 (Design Direction) reinforces: "Completion Satisfaction: Cards sink below the grid and fade to show an 'organized state.'"

**Task 25a spec says:** "Completed Bits show strikethrough title + gray treatment + `opacity-50`." It does not mention the sinking animation. The Motion animation variants file (`src/lib/animations/grid.ts`) from Task 11 (Edit Mode Animation) handles jiggle/floating but has no completion animation variant defined.

**Impact:** Medium-Low for Phase 5 functional completeness, but the PRD frames this as a distinguishing UX moment ("completion satisfaction"). Without it, the completion interaction feels flat compared to the design intent. Since Task 25a is the only task that triggers the visual completion state on BitCard, it is the natural owner.

**Resolution options:**
- **Option A (preferred):** Amend Task 25a to add `bitSinkVariant` to `src/lib/animations/grid.ts`. Apply a short `y: 4, opacity: 0.5, scale: 0.98` transition on BitCard when `status === "complete"`. Minimal implementation, high fidelity to PRD.
- **Option B (defer):** Add a note to the plan deferring to Phase 7 or a "polish" task. Mark as `⏸️ Deferred` explicitly.

---

## Weak Coverage Summary

The following ⚠️ Weak flows are owned by a task but have underspecified acceptance criteria. These do not require new tasks but should have their criteria tightened before implementation:

| Flow | Task | What's Underspecified |
|------|------|-----------------------|
| 2 — Edit title inline | Task 21 | Save trigger not defined (blur? enter? auto-save with debounce?). Empty title prevention not mentioned. |
| 3 — Edit description inline | Task 21 | Same save-trigger ambiguity as title. No mention of debounce or explicit save action. |
| 5 — Set deadline | Task 21 | Deadline hierarchy check integration with Task 24 Hook 2 not mentioned in Task 21 acceptance criteria. |
| 6 — Close via backdrop | Task 21 | No policy on unsaved in-flight edits (title being typed). Should close-on-backdrop auto-save or discard? |
| 7 — Close via ESC | Task 21 | ESC should close nested pickers first, then popup. Order of ESC precedence not specified. |
| 10 — Deep-link to missing/trashed Bit | Task 21 | Graceful handling when Bit ID is invalid — silent close vs. 404 toast vs. redirect. |
| 14 — Drag reorder with timed chunks | Task 22 | Chunks with `time` are sorted by time value, not `order`. Can a timed chunk be drag-reordered? Spec is silent. |
| 15 — Deadline marker visibility | Task 22 | No Bit deadline: marker should be hidden, but not stated in acceptance criteria. |
| 18 — Edit chunk title inline | Task 23 | Blur without change: no-op. Blur with empty string: revert or block? Not stated. |
| 19 — Delete last chunk | Task 23 | Auto-completion reversal and progress ring removal not covered in Task 23's acceptance criteria (Task 24 covers cascade but deletion-specific case is implied, not stated). |
| 20 — Drag chunk pool → timeline | Task 23 | "Pool" vs. "timeline" distinction is purely conceptual — chunks without `time` and `order = null` vs. chunks with `order` set. Drag mechanics for establishing this distinction are underspecified. |
| 24 — Shorten parent deadline | Task 24 | After user sees "Modify timeline" overlay and clicks ✓ — which component handles the subsequent date edit? Integration with Task 21 (Bit) or Task 25c (Node) not wired in Task 24's spec. |
| 26 — Uncomplete chunk, Bit force-completed | Task 24 | Hook 3 reversal spec does not distinguish between auto-completed Bit (all chunks done) and force-completed Bit (manually completed). Unchecking a chunk should only revert a Bit that was auto-completed, not one that was force-completed. |
| 27 — BFS silent placement | Task 24 | BFS fallback places item silently. No user confirmation that placement location differs from intent. Acceptable for most cases but unspecified. |
| 29 — Urgency dot, folded sidebar | Task 24 | When sidebar is folded, the urgency dot location on the re-open button is unspecified. |
| 31 — Promotion partial failure | Task 25 | No atomicity guarantee for the multi-step promotion operation. Partial state (Node created, some Bits created, original Bit not yet deleted) on error is unaddressed. |
| 34 — Force-complete visual with partial chunks | Task 25a | Progress bar shows partial completion even though Bit is "complete". This visual inconsistency is not addressed. PRD does not clarify expected behavior. |
| 37 — Popup close after trash action | Task 25a | Popup should close after "Move to trash" — not stated explicitly. |
| 39 — Chooser in edit mode | Task 25b | Interaction between Level 1-2 empty-cell `+` (edit mode) and the chooser popover — both Task 20 (edit-mode overlay) and Task 25b own overlapping interaction territory. Integration not described. |
| 42 — Empty-cell `+` and edit-mode integration | Task 25b | Empty-cell `+` is rendered by the edit-mode overlay (Task 20). Task 25b must coordinate with Task 20 to route click to the chooser. This wiring is not described. |
| 47 — Node edit deadline + conflict detection | Task 25c | Task 25c acceptance criteria do not mention that shortening a Node's deadline should trigger `DeadlineConflictOverlay` on conflicting child Bits. Task 24 owns the overlay component but Task 25c must wire it into `EditNodeDialog`. |

---

## Summary

- **Flows traced:** 49
- **Fully owned (✅):** 26
- **Weak (⚠️):** 21
- **Gaps (❌):** 0 (2 found, both resolved 2026-03-27)
- **Deferred (⏸️):** 1 (G2 — sinking animation owned by Task 35)
- **Status: PASS**

### Gap Resolutions

1. **G1 (Promotion max-depth)** — RESOLVED: Task 25 amended with max-depth guard, user-facing toast, hide-at-Level-3 rule, and unit test.
2. **G2 (Sinking animation)** — RESOLVED: Task 35 confirmed as owner. Task 25a amended with explicit defer note.

### Recommended Criteria Tightening (Pre-Implementation)

Before starting Task 21, clarify the inline edit save strategy (blur auto-save vs. debounce) — this pattern affects Task 21, 22, 23, and 25c. A single shared decision should be documented and referenced across all four tasks to ensure consistent behavior.

Before starting Task 24, clarify the Hook 3 reversal rule for force-completed Bits. The current spec only describes auto-completion reversal. This distinction determines a correctness boundary in the data layer.

Before starting Task 25b, clarify the edit-mode / chooser integration (Flows 39 and 42). Task 20 (Edit Mode Overlay) and Task 25b both define behavior for empty-cell `+` at Level 1-2. Confirm that Task 25b update to `node-grid-shell.tsx` supersedes Task 20's current `+` routing, or that they remain separate code paths.
