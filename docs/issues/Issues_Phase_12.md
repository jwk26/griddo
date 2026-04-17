# Issues — Phase 12: Calendar Creation Flows

## Batch Plan

### Original Proposal

| Batch | Tasks | Classification |
|-------|-------|----------------|
| Batch 1 | T62 — Calendar Pool Node Creation | logic-heavy |
| Batch 2 | T63 — Calendar Pool Bit Creation + Parent Selector | ui-heavy |

**Rationale:** T62 is pure wiring — reuses existing `CreateNodeDialog` with no new visual design. T63 creates a new `ParentNodeSelector` component with tree-browsing interaction that requires a Gemini design spec. Different classifications and natural sequential dependency (T62 establishes the creation wiring pattern that T63 extends) justify separate batches. Both batches touch `calendar/layout.tsx`; the split is clean because T62 owns Node state/handler and T63 will own Bit state/handler.

**User adjustment at Step 1:** Finalize the full Sidebar callback surface (`onNodeCreate` + `onBitCreate`) in Batch 1 rather than the minimum needed for Node wiring. The `onBitCreate` stub is reserved no-op for T63.

### Execution Status

| Batch | Tasks | Status |
|-------|-------|--------|
| Batch 1 | T62 | Implemented |
| Batch 2 | T63 | Implemented |

### Deviations

None.

---

## Issues

### Batch 1 (T62)

No significant issues. Implementation was a clean reuse of existing infrastructure.

### Batch 2 (T63)

#### Issue 1: `defaultParentId` confirmed-view flash on async node load

- **Problem:** `ParentNodeSelector` initialized `isConfirmed = true` when `defaultParentId` was provided, but the confirmed-view render was gated on `isConfirmed && selectedNode`. Because `useCalendarData().nodes` starts empty (async liveQuery), `selectedNode` was undefined on first render, causing a brief flash to the browsing view even though a default parent was set.
- **Root Cause:** `selectedNode` derives from `nodes.find(n => n.id === value)` — nodes are empty until the liveQuery resolves, so `selectedNode` is undefined at mount even when `value` is correctly set.
- **Solution:** Changed the confirmed-view gate from `isConfirmed && selectedNode` to `isConfirmed && value`. The confirmed card container renders as soon as a value is committed; the card's inner content (icon, title, path) only renders once `selectedNode` is available. This prevents the browsing-view flash.
- **Learning:** When a confirmed state depends on async-loaded data, gate the *view mode* on the id (stable, synchronous) and gate the *content* on the loaded record (async). Don't couple both to the same condition.

#### Issue 2: Lint warnings from `_`-prefixed intentional params

- **Problem:** `_deadline` and `_deadlineAllDay` params in `calendar/layout.tsx` handlers generate `@typescript-eslint/no-unused-vars` warnings even though `_` prefix is the project convention for accepted-but-ignored params.
- **Root Cause:** ESLint's `no-unused-vars` rule sees the `_`-prefixed destructured params as unused. The rule is configured as `warning` not `error`, so the gate passes.
- **Solution:** No fix needed — warnings are acceptable and this is the intended pattern. The `_` prefix signals intent clearly to readers.
- **Learning:** Accept this warning class as a known project trade-off. Do not suppress with eslint-disable comments unless it becomes a distraction.

#### Issue 3: `useEffect` missing `defaultParentId` dependency in `CreateBitDialog`

- **Problem:** ESLint `react-hooks/exhaustive-deps` warns that `defaultParentId` is missing from the `useEffect` dependency array in `create-bit-dialog.tsx`.
- **Root Cause:** The effect runs on `open` transitions and resets `selectedParentId` to `defaultParentId`. Including `defaultParentId` in deps would re-run the reset effect whenever the parent component re-renders with a new `defaultParentId`, which is not the intended behavior.
- **Solution:** Warning accepted. The current deps (`[open]`) are intentionally narrower than the exhaustive set. No fix needed.
- **Learning:** `react-hooks/exhaustive-deps` is sometimes wrong for state-reset effects that should only fire on explicit event transitions (open/close). Document the intent with a comment if this pattern appears again.
