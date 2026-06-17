# Flow-Trace Review — Phase 18

**Reviewed:** 2026-06-17
**Method:** Targeted in-context review (Claude-led). SPEC.md authority sections traced against T81–T85 specs and current implementation.
**Inputs:** EXECUTION_PLAN.md § Phase 18, SPEC.md (AD #16, Inbox/Triage Workspace, Compact-token DnD), SCHEMA.md (`scratchBreakdowns.consumedAt`, Hook 10), DESIGN_TOKENS.md § Compact Drag Token, current implementation: `triage-store.ts`, `grid-dnd.ts`, `use-dnd.ts`, `grid-runtime.tsx`, `sidebar.tsx`, `datastore.ts`, `create-node-dialog.tsx`, `create-bit-dialog.tsx`

---

## Flow-Trace Table

| # | User Flow | Trigger | Intended Outcome | Owning Task | Boundary Cases | Status |
|---|-----------|---------|------------------|-------------|----------------|--------|
| F1 | Drag breakdown row into Node Zone | User drags row onto Node staging area | Staged Node candidate created in triage-store (UI only); source row de-emphasized; `consumedAt` stays `null` | T81 (zone + store + de-emphasis) / T82 (drag wiring) | Candidates scoped to selected Scratch — must not bleed across Scratches; de-emphasis requires staged candidate to track `sourceBreakdownId` | ✅ Owned |
| F2 | Drag breakdown row into Bit Zone | User drags row onto Bit staging area | Staged Bit candidate created in triage-store (UI only); source row de-emphasized; `consumedAt` stays `null` | T81 (zone + store + de-emphasis) / T82 (drag wiring) | Same scoping constraint as F1 | ✅ Owned |
| F3 | Switch selected Scratch mid-flow | User clicks different Scratch in pool | Staged candidates for current Scratch are preserved; breakdown rows for new Scratch shown; no data loss | T81 | triage-store staged candidates are keyed by Scratch (or cleared per Scratch on selection); SPEC: "switching Scratch loses no breakdown data because source rows stay unconsumed" | ⚠️ Weak |
| F4 | Drag shows compact token | User begins drag of any Triage draggable (breakdown row, staged Node, staged Bit) | Compact icon token follows cursor; full row/card does NOT drag; pointer-centered targeting | T82 | DESIGN_TOKENS § Compact Drag Token: "existing calendar `compact-bit-item.tsx` full drag surface is the anti-pattern to avoid" | ✅ Owned |
| F5 | Drop target states | Draggable over various targets | Targets display: valid (can accept), invalid (cannot accept), pending-confirmation (will open dialog) | T82 | Pending-confirmation target is distinct from valid — it opens a dialog rather than directly performing the action | ✅ Owned |
| F6 | Existing grid / calendar / pool DnD unchanged | Any existing grid or calendar drag interaction | Grid/calendar/pool DnD behavior identical to pre-Phase-18 | T82 | EXECUTION_PLAN explicit policy: "do NOT rework main-grid / calendar / pool DnD"; grid-dnd.ts must be additive-only | ✅ Owned |
| F7 | Hierarchy Explorer renders | Triage workspace visible with staged candidates | Home / L1 / L2 / L3 columns with progressive reveal; Nodes before Bits; long Bit titles ellipsize | T83 | Columns must be reactive to actual hierarchy data (live Nodes/Bits at each level); empty columns are valid | ✅ Owned |
| F8 | Drop staged candidate onto hierarchy target | User drops onto a column/parent in Hierarchy Explorer | Pending-confirmation dialog opens with: source content, candidate type, destination hierarchy path, result summary | T83 | Dialog must show all four fields; confirmation is the write gate; cancel must be a no-op | ✅ Owned |
| F9 | Confirm placement | User clicks Confirm in placement dialog | `createNode`/`createBit` called at target; source `scratchBreakdowns` row `consumedAt` set to timestamp; row line-throughs | T83 | `markScratchBreakdownConsumed(id)` — already implemented in `datastore.ts` + `indexeddb.ts`; T83 calls existing API | ✅ Owned |
| F10 | Cancel / Esc placement | User cancels or escapes the placement dialog | No record created; `consumedAt` stays `null`; staged candidate persists in triage-store | T83 | Must be a clean no-op — no partial writes | ✅ Owned |
| F11 | Full target grid — confirm disabled | Staged candidate dropped on a full hierarchy target | Confirm button disabled; visible reason displayed ("No available grid cell in this target") | T83 | Grid occupancy check must run before enabling confirm; occupancy is per-target-parent | ✅ Owned |
| F12 | Fast path: drag breakdown row directly to Hierarchy | User drags row past staging and onto hierarchy target | Same pending-confirmation dialog, but requires explicit Node/Bit type choice — no default preselected | T84 | Staged candidate is NOT created first; type choice is mandatory (contrast to F8 where type is already determined by zone) | ✅ Owned |
| F13 | Fast path confirm | User confirms with explicit type choice | `createNode`/`createBit` called; same `consumedAt` write as F9; row consumed | T84 | `markScratchBreakdownConsumed(id)` — same existing API as F9 | ✅ Owned |
| F14 | Remove from staging | User drags staged candidate onto Remove target | Staged candidate removed from triage-store; source breakdown row de-emphasis cleared; `consumedAt` stays `null`; non-destructive (no toast) | T85 | Remove target should only appear while a staged candidate is being dragged (not permanent UI); de-emphasis of source row must also clear | ⚠️ Weak |
| F15 | Archive Scratch affordance appearance | All breakdown rows `consumedAt != null` AND no staged candidates remain for selected Scratch | Archive Scratch affordance becomes visible | T85 | Condition is cross-store: `scratchBreakdowns` (consumedAt state) + triage-store (staged candidates) — see IC-3 | ⚠️ Weak |
| F16 | Archive Scratch confirm | User confirms Archive Scratch | `archiveBit(scratchId)` called; `archivedAt` set; Scratch leaves active Scratch Pool; appears in Archive View | T85 | `archiveBit` exists in DataStore ✅; Scratch must no longer appear in the active pool; Archive affordance should not trigger auto-archive | ✅ Owned |
| F17 | Archive Scratch decline | User declines Archive Scratch affordance | Scratch stays active in pool; no write occurs | T85 | Must be a clean no-op | ✅ Owned |

---

## Implementation Complexity Flags

These flows are owned but carry non-trivial integration complexity. Not blockers, but Codex prompts should call them out explicitly.

### IC-1 (Resolved — T83 plan amendment) — `consumedAt` write

`datastore.ts` line 54: `updateScratchBreakdown` originally excluded `consumedAt`. T83 and T84 both require setting `consumedAt = Date.now()` on confirmed placement.

**Resolved by T83 amendment (2026-06-17); API name corrected (2026-06-17):**
- `datastore.ts` + `indexeddb.ts` already implement `markScratchBreakdownConsumed(id: string): Promise<void>` — no new method needed
- `src/lib/db/scratch-breakdowns.test.ts` — unit test added to Files list (verifies `content`/`order` unchanged)
- T83 Actions + Acceptance updated to reference `markScratchBreakdownConsumed(id)` (corrected from `consumeScratchBreakdown`)
- T83 Files list updated: `datastore.ts` and `indexeddb.ts` removed (already implemented); `use-dnd.ts`, `grid-dnd.ts`, `triage-workspace.tsx` added

F9 and F13 are now ✅ Owned.

### IC-2 — "Reuse create-node/bit-dialog" wording ambiguity (T83 Files) ⚠️

T83 Files lists `create-node-dialog.tsx / create-bit-dialog.tsx` as reuse targets. Neither dialog accepts an `initialTitle` prop (both start with `useState("")`). SPEC describes the placement dialog as showing "source content / candidate type / destination hierarchy path / result summary" — this is the *confirmation* dialog (grid-runtime move-confirmation Dialog pattern), not the create dialogs.

**Interpretation:** "Reuse the create paths" means calling `createNode`/`createBit` DataStore APIs on confirm — not rendering the create dialogs again. The create dialogs are not shown during the placement flow.

**Action:** Codex prompt should clarify this boundary explicitly: the placement confirmation dialog is a new purpose-built dialog (reusing `src/components/ui/dialog.tsx` for structure and `handleNodeMoveConfirm`/`handleAncestorMoveConfirm` patterns); creation is via direct DataStore `createNode`/`createBit` calls on confirm, not via dialog re-render.

### IC-3 — `DeleteDropTarget` reuse architecture (T85) ⚠️

`DeleteDropTarget` in `sidebar.tsx` is a private (non-exported) function component scoped to the sidebar. T85 says "reuse sidebar.tsx DeleteDropTarget + grid-dnd.ts grid-delete-drop". Two valid implementations:

- **Option A:** Extract `DeleteDropTarget` from sidebar.tsx to a shared component (`src/components/ui/delete-drop-target.tsx`) and import in both sidebar and triage workspace.
- **Option B:** Create a Triage-specific remove target that follows the same visual pattern but uses a new DnD kind (e.g., `triage-remove-staging-drop`) — avoids coupling sidebar + triage but adds a new kind.

**Action:** Flag this in the Codex prompt. Either option is valid; Codex should choose A if the component is visually identical (to avoid duplication) or B if triage remove target needs distinct appearance/behavior.

### IC-4 — De-emphasis linking: staged candidates must track `sourceBreakdownId` (T81) ⚠️

triage-store staged candidates need to record the `sourceBreakdownId` so `breakdown-panel.tsx` can compute "is this row currently staged?" for de-emphasis rendering. If not tracked, there's no way to revert de-emphasis on remove-from-staging (F14). Current triage-store has no staged candidates structure at all — T81 must define this shape explicitly.

**Suggested store shape (for Codex prompt):**
```ts
interface StagedCandidate {
  id: string               // local UUID, not a DB record
  type: "node" | "bit"
  sourceBreakdownId: string
  label: string            // from breakdown row content
}
```

### IC-5 — Archive Scratch condition is cross-store (T85) ⚠️

"All breakdown rows consumed AND no staged candidates remain" requires:
1. Live query of `scratchBreakdowns` for selected Scratch where `consumedAt = null` → count must be 0
2. triage-store staged candidates for selected Scratch → count must be 0

This needs a hook or derived selector (e.g., `useCanArchiveScratch(scratchId)`). Codex should author this in `triage-workspace.tsx` or extract to `use-triage-archive.ts`.

---

## Gaps Found

| # | Flow | Gap Type | Description | Resolution |
|---|------|----------|-------------|----------------------|
| G1 | F9, F13 | Missing DataStore API | `consumedAt` cannot be written — `updateScratchBreakdown` excludes it | ✅ Resolved — `markScratchBreakdownConsumed(id)` already implemented in `datastore.ts` + `indexeddb.ts`; T83 amended to call existing API; unit test (content/order invariant) added to Files |

---

## Phase 17 Follow-up — Phase 18 Blocker Assessment

*(from Phase 17 flow-review open items)*

| Issue | Status | Phase 18 blocker? |
|-------|--------|-------------------|
| ISSUE-17: `use-inbox.ts` reactive pattern | Resolved in Phase 17 | ❌ No |
| IC-5 (Phase 17): T80 single-row breakdown delete — `deleteScratchBreakdown(id)` absent | Resolved in Phase 17 implementation | ❌ No — confirmed in indexeddb.ts |

---

## Summary

- Flows traced: 17
- Fully owned: 12 (F9, F13 promoted from Weak after G1/IC-1 resolved)
- Weak (complexity flags): 3 (F3, F14, F15 — IC-3, IC-4, IC-5)
- Gaps: 1 → 0 (G1 resolved via T83 amendment 2026-06-17)
- Deferred: 0
- **Status: PASS** — all gaps resolved; IC items embedded in Codex prompt scope

---

## Resolution Log

| Gap | Resolved | Action Taken |
|-----|----------|--------------|
| G1 | 2026-06-17 | T83 amended: `markScratchBreakdownConsumed(id)` already implemented — no new DataStore method needed; `scratch-breakdowns.test.ts` unit test added (content/order invariant); Actions + Acceptance corrected from `consumeScratchBreakdown` → `markScratchBreakdownConsumed` |

IC-2, IC-3, IC-4, IC-5 are implementation notes — they must be embedded in the relevant Codex batch prompts, but they are not plan blockers.
