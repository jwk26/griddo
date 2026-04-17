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
| Batch 2 | T63 | Pending |

### Deviations

None.

---

## Issues

No significant issues in Batch 1 (T62). Implementation was a clean reuse of existing infrastructure.
