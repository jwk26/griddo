# Phase 28 Post-close Smoke Repair

## Durable start

- Status: `In Progress`
- Authority: one-off Control Tower-approved manual implementation authority; this is not a lifecycle receipt, product authority, Phase issue ledger, Task marker, or Phase 29 audit evidence.
- Base: `3b2782287bc12fa6595427254cd4c698d60e5105`
- Branch: `phase-28/post-close-smoke-repair`
- Worktree: `/Users/jwk/Documents/griddo2-codex-phase-28-post-close-smoke-repair`
- Phase 28 Final Close: `docs/issues/Final_Close_Phase_28.json`, SHA-256 `d9b844a4ec666c9de759ca439f22cf1f2d3e51e9829ca07ffc82bf0882b46cbb`, merge/base `3b2782287bc12fa6595427254cd4c698d60e5105`.
- Phase 29: inactive; Tasks 155–158 remain `[ ]`; audit `docs/verification/inbox-triage/phase-29-workflow-pilot-audit.md` remains read-only at blob `21a1a8b6e23c4aef22bf360961bf7b4235563aa2`.
- Repair budget: three bounded implementation/repair cycles. A fourth cycle or any new path, owner, product/design/copy decision, tooling/config change, or unresolved Unowned item requires a user gate.
- Next legal action: implementation within the exact write set below.

## Exact write set

Create:

- `docs/verification/inbox-triage/phase-28-post-close-smoke-repair.md`

Modify:

- `src/hooks/use-dnd.ts`
- `src/hooks/use-triage-dnd.test.ts`
- `src/components/triage/hierarchy-explorer.tsx`
- `src/components/triage/hierarchy-explorer.test.tsx`
- `src/components/triage/triage-workspace.tsx`
- `src/components/triage/triage-workspace.test.tsx`

No other tracked path is authorized.

## Corrected diagnostic findings

- Generated-output root cause: the six Breakdown, Scratch Context, edit-control, Save/Cancel, dirty Save emphasis, and Search layout symptoms came from stale hybrid `.next/dev` Turbopack/PostCSS output. Tracked `globals.css` was correct, the retained generated module omitted selectors, served CSS and CSSOM therefore omitted them, and computed layout broke. The user removed `.next`; regeneration recovered the symptoms. No quarantine copy exists.
- DnD root cause: with a pointer present, `handleDragOver` returns after hierarchy DOM resolution. Over Remove and Node/Bit staging wells, that resolver clears the target and suppresses the valid non-hierarchy `event.over.id` fallback.
- Placement opening root cause: direct/staged affordances are inserted at the Explorer column top while phase focus uses `preventScroll: true`, so the affordance can remain outside the owning visible viewport.
- Placement success root cause: successful placement retains only `{id,type}` and does not reveal the confirmed destination ancestry/path, so the authoritative card may never render or receive focus.
- Empty reliability rail: ordinary confirmation has no copy or live/status semantics but still reserves 48 px; the approved visual-only correction is conditional omission in the existing JSX owner.

## Scope and exclusions

The approved scope is limited to DnD non-hierarchy feedback fallback, minimum-scroll placement opening, exact typed result/path reveal and one-shot authoritative-card focus, and conditional omission of the empty reliability rail. Preserve hierarchy ownership, no-write hover behavior, Stage/Unstage and placement command semantics, shared lock, ordering, persistence, and all real reliability states.

Excluded: permanent `.next` invalidation tooling; Next/Turbopack, PostCSS, package, lockfile, script, command-catalog, or config changes; Breakdown/Scratch/Search repairs; Search metadata advisory; keyboard DnD; global Search; broader placement redesign; theme-specific UI; Tasks 155–158; persistence/schema/DataStore changes; unrelated warnings.

## Implementation checkpoint

Awaiting implementation and verification evidence.
