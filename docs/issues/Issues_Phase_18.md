# Issues — Phase 18: Inbox / Triage — Staging & Placement DnD

## Batch Plan

### Original Proposal

5-batch plan approved before Batch 1 launch.

| Batch | Tasks | Classification | Key Outputs |
|-------|-------|----------------|-------------|
| 1 | T81 | mixed | `staging-zone.tsx` (create), `triage-store.ts` (StagedCandidate + stagedCandidates), `breakdown-panel.tsx` (de-emphasis) |
| 2 | T82 | mixed | Compact drag token, Triage DnD kinds in `use-dnd.ts` / `grid-dnd.ts`, drag wiring in `triage/*` |
| 3 | T83 | mixed | `hierarchy-explorer.tsx` (create), placement confirmation dialog, `consumeScratchBreakdown` + unit test |
| 4 | T84 | mixed | Fast path (breakdown row → hierarchy), explicit type-choice dialog |
| 5 | T85 | mixed | Remove-from-staging drop target, Archive Scratch affordance, `useCanArchiveScratch` hook |

Rationale: T84/T85 split keeps IC-3 (DeleteDropTarget architecture decision) and IC-5 (cross-store condition hook) in a smaller, isolated batch given DnD blast radius.

### Execution Status

| Batch | Tasks | Status |
|-------|-------|--------|
| 1 | T81 | Complete |
| 2 | T82 | Pending |
| 3 | T83 | Pending |
| 4 | T84 | Pending |
| 5 | T85 | Pending |

### Deviations

_None yet._

---

## Execution Issues

_No issues recorded yet._
