# Task 150 Pre-Start Blocker Evidence

> Date: 2026-08-24
> Task state: `[ ]`, unstarted; no production or test write
> Recovery anchor: `9b26412fe4df90119e67d95efafa43c7332f0b05`
> Accepted source tree: `e83086e1044bb2deebc6837f997bebc06b316146`

## Scope Reconciled

Task 150 must realize the accepted `DP-VQ06-EXPLORER` affected-column status
family only. In particular, it must distinguish deleted, archived, moved, and
unreachable path fallbacks; exclude initial hydration, local placement, and an
existing item moving between columns from remote-arrival counts; and render
selected-Bit disappearance from an authoritative selection/reveal owner.

The exact approved product/test write set is limited to Explorer, triage-store,
copy, CSS, and their tests. Search, Pool, Staging, Task 151, and changes to
Workspace, DnD, data hooks, DataStore, schema, or repository behavior are not
authorized.

## `P28-04` Owner Gap

1. `src/hooks/use-grid-data.ts` returns only active per-parent
   `{nodes, bits, isLoading}` snapshots from `getActiveGridContents()`. Removed
   records are absent, so Explorer has no authoritative field or event that
   distinguishes delete/unreachable from archive or move.
2. Local placement creates the result in `src/hooks/use-dnd.ts` and clears its
   pending placement after the write. `HierarchyExplorer` receives only the
   pending target `dropId`; it receives neither the created stable result ID
   nor an authoritative local-operation identity. Snapshot differencing would
   therefore count a local placement as remote, or suppress a concurrent real
   remote insertion if it guessed by timing.
3. No production selected-Bit/reveal owner is connected to Explorer or
   `triage-store` before the separately planned Task 151 search realization.
   A test-only seeded value or an unused setter would not make the required
   disappearance behavior observable.
4. Direct component DataStore reads are not an allowed workaround. The
   Blocking rules in `docs/PLANNING_STANDARD.md` require reactive reads behind
   hook APIs and restrict `triage-store.ts` to declared app-session state; the
   accepted `P27-11` repair removed the same class of component-level direct
   data access.

## Commands And Results

| Command/check | Exit | Relevant result |
| --- | ---: | --- |
| Candidate synchronized adapter resolver, receipt-less `run-task` | 3 | `approval_required`, `contract_ready=true`; policy/runtime paths resolved read-only |
| Candidate synchronized adapter resolver with Phase 28 Gate C receipt as `run-phase` | 0 | `ready`; exact Gate C receipt and current feature worktree validated |
| `git rev-parse HEAD HEAD^ HEAD^{tree}:src` | 0 | `9b26412…`, `80bd704…`, `e83086e…` matched the supplied recovery identity |
| Owner and symbol inspection with `rg`/`sed` | 0 | Confirmed the three missing producer projections above |

No focused or full product gate was run because the lifecycle stopped before a
durable Task 150 start or any product/test modification. Existing Task 149
evidence was not reused as proof of Task 150 behavior.

## Required Disposition

Approve an exact minimum owner expansion that supplies authoritative read-only
cause, local-placement-result, and selected-Bit/reveal projections with named
files/tests, or revise the affected Task 150 observable requirements. Until
then, Task 150 remains `[ ]`, no implementation checkpoint exists, and Task 151
must not start.
