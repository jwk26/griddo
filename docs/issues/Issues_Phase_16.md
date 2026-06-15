# Issues — Phase 16: Quick Capture

## Carryover from Phase 15

### ISSUE-15-01 (carried) — Dexie v3 migration: no automated runtime-verification path

- **Status:** Open (carried from Phase 15)
- **Category:** test-coverage gap / acceptance-criteria accuracy
- **Detail:** The Dexie `version(3).upgrade()` backfill path (T69) has no automated test: the `FakeTable` in-memory harness cannot exercise a real Dexie upgrade transaction. Phase 15 deferred this explicitly to Phase 16 with the resolution: add a `fake-indexeddb`-based real-Dexie migration test. This is a **separate concern** from T74 (Scratch modal behavior) — they happen to share the `fake-indexeddb` tool, but their verification targets are unrelated.
- **Resolution target:** A standalone migration test (`src/lib/db/migration.test.ts` or similar) that boots a real Dexie instance against `fake-indexeddb`, seeds v2-schema rows, runs the upgrade, and asserts the backfill results. Must not be collapsed into T74's Scratch Bit creation test.
- **Disposition:** Carried per Phase 15 explicit deferral. Resolve before Phase 16 close.

---

## Batch Plan

### Original Proposal

| Batch | Tasks | Classification |
|-------|-------|----------------|
| Batch 1 | T73, T76 | ui-heavy |
| Batch 2 | T74 | mixed |
| Batch 3 | T75 | ui-heavy |

### Execution Status

| Batch | Tasks | Status |
|-------|-------|--------|
| Batch 1 | T73, T76 | Complete (approved + committed) |
| Batch 2 | T74 | Complete (approved + committed) |
| Batch 3 | T75 | Complete (approved + committed) |

### Deviations

- **Batch 1 trigger ownership: A → B.** The original prompt had Sidebar read the quick-capture store directly. Resolved at prompt preview to **B (prop boundary)**: Sidebar stays a dumb trigger (`isAddActive` prop), GridRuntime is the single owner of overlay state. See skill-audit A6/C8.
- **Batch 1 `handleBitSubmit` guard refine.** The prompt simplified the parent-existence guard, weakening the `/grid/[missing-node]` defense. Restored in Step 6 (`if (nodeId !== null && !node)`) + regression test. See ISSUE-16-01 and skill-audit A8/C10.
- **Batch 2 Codex B test B5 rejected.** Codex B's "always uses Inbox regardless of context" test passed a second `context` argument `{ nodeId, parentId }` to `createScratchBit`. The actual implementation signature is `(title: string)` — 1-arg only. The test would cause a TypeScript compile error. Rejected; the intent (inbox always used) is already covered by Codex A's payload test. One valuable test adopted from Codex B: `inboxNodeId === undefined` state assertion (B's A2), added to `use-inbox.test.tsx`.
- **Batch 2 Codex B Hook 8 tests superseded.** Codex B produced `indexeddb.scratch-inbox.test.ts` (3 tests: sentinel exempt, non-inbox enforced, sentinel exact). Codex A's `grid-uniqueness.test.ts` covers all 3 plus 3 general-uniqueness tests. Codex B file not written to working tree.
- **Batch 3 Cmd+K ownership transferred from SearchOverlay to CommandPalette.** `search-overlay.tsx` previously registered a global `Cmd+K` handler. Ownership moved entirely to `CommandPalette`; `search-overlay.tsx` is unchanged otherwise — the existing Search UI and Sidebar Search button behavior are unaffected. Key `2` opens the existing Search via `useSearchStore.getState().open()`.
- **Batch 3 ScratchModal scope expanded to global.** ScratchModal was mounted only inside `GridRuntime` (grid-route scope). Because CommandPalette key `1` must open Scratch from any route, ScratchModal was extracted into a new `QuickCaptureOverlays` wrapper mounted in `providers.tsx`. `GridRuntime` no longer mounts ScratchModal directly.
- **Batch 3 `rounded-xl` → `rounded-lg` on command rows.** Codex applied `rounded-xl` to command row buttons; the recipe specifies `rounded-lg`. Fixed at Step 6 spec-compliance check (recipe literal class authority over Codex fill-in).

---

## Phase 16 Issues

### ISSUE-16-01 — Bit-creation parent-existence guard weakened (regression, resolved)

- **Status:** Resolved (this session, Batch 1 Step 6 refine)
- **Category:** regression / prompt-design
- **Detail:** Implementing T76 (L0 Bit creation via dialog parent selector), the `handleBitSubmit` guard was simplified from `if (!nodeId || !node)` to `if (!effectiveParentId)`. This dropped the UI-layer check that a `/grid/[nodeId]` parent node actually exists — `/grid/[missing-node]` would proceed to `getGridOccupancy`/`createBit` (DataStore would still throw `Node not found`, but the early UI defense was lost). Root cause was the Codex prompt spec (Claude-side), not the Codex implementation.
- **Resolution:** Restored `if (nodeId !== null && !node) setError("Unable to find parent node.")` ahead of the `effectiveParentId` check, preserving L0 (`nodeId === null`) Bit creation. Added a regression test in `grid-runtime.test.tsx` (`/grid/missing-node` + `useNode` null → no `createBit`, error surfaced).
- **Verification:** targeted tests 3 files / 21 passed; full suite 260 passed; build green.

### ISSUE-16-02 — Scratch Modal: no keyboard focus trap or trigger-focus restoration (follow-up)

- **Status:** Open (follow-up, non-blocking for T74)
- **Category:** accessibility
- **Detail:** `ScratchModal` is a custom modal using Framer Motion rather than an accessible primitive (e.g. Radix UI Dialog). It carries `role="dialog"` and `aria-modal="true"` per spec, but does not trap keyboard focus within the modal while it is open, and does not restore focus to the trigger element on close. Screen reader users may navigate outside the modal via Tab. T74 spec does not mandate a focus trap, so this is a follow-up a11y hardening task.
- **Resolution target:** Implement keyboard focus trapping (Tab/Shift-Tab cycle within modal) and restore focus to the quick-capture trigger on `onClose`. Can be done with a lightweight hook or by migrating to a Radix UI Dialog primitive. Must not introduce a broad modal refactor inside T74 scope.
- **Disposition:** Not blocking Phase 16 close. Resolve before a dedicated a11y pass or Phase 17.

### ISSUE-16-03 — Scratch Modal: hover-pause race condition on success transition (follow-up)

- **Status:** Open (follow-up, low priority)
- **Category:** interaction / edge case
- **Detail:** If the user's cursor is already hovering over the modal panel when `submissionState` transitions to `"success"`, `onMouseEnter` has already fired (during the capture state) and `handlePanelMouseEnter` will not re-fire. The auto-close timer therefore starts via `startAutoCloseTimer` (in the `isSuccess` effect) even though the cursor is over the panel — the hover-pause contract is violated for this entry path. Gemini post-code review rated LOW.
- **Resolution target:** On success state entry, check `isHovering` state (add a boolean ref or state) and skip `startAutoCloseTimer` if the cursor is already within the panel. Alternatively, use `onMouseMove` or `PointerEvents` to detect presence at mount time.
- **Disposition:** Low priority. Not blocking Phase 16 close.
