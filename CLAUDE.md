# GridDO (Local-first Task Management)

18×9 Grid | Node(L0) → Bit(L1) → Chunk(L2) hierarchy.

**Always check docs/EXECUTION_PLAN.md first to see the current task before starting work.**

## Documentation (Priority: SCHEMA > SPEC > DESIGN > PLAN > STANDARD)

- `docs/SCHEMA.md`: Data model, Object stores, Zod (Authoritative)
- `docs/SPEC.md`: Architecture, Routing, Layouts
- `docs/DESIGN_TOKENS.md`: CSS vars, Tailwind v4, Components
- `docs/EXECUTION_PLAN.md`: Phased task specs
- `docs/PLANNING_STANDARD.md`: Flow ownership, verification, conformance gates
- `docs/WORKFLOW.md`: Full 8-stage process (ideation → integration)
- `docs/prd.md`: Historical context (Non-authoritative)

## Key Paths & Roles

- `src/app/`: `globals.css` (Design tokens), `layout.tsx` (Shell), `providers.tsx` (Contexts)
- `src/lib/db/`: `datastore.ts` (Interface), `indexeddb.ts` (Dexie), `schema.ts` (Zod/Types)
- `src/lib/utils/`: Pure functions (BFS, Aging, Urgency) - Side-effect free
- `src/hooks/`: Reactive data boundary (`useGridData`, `useBitDetail`) - Main API for UI
- `src/stores/`: Zustand (UI state: Sidebar, Search, Edit-mode)
- `src/lib/constants.ts`: Grid dims, thresholds, retention

## Architecture Rules

1. **Client-first:** Interactive/data components = Client Components.
2. **Two-layer Data:** `DataStore` (CRUD) → `Hooks` (Reactive). UI only imports hooks.
3. **URL-driven:** `/` (L0), `/grid/[id]` (Nodes), `?bit=[id]` (Popup).
4. **Render-time Compute:** Aging/Urgency/Completion calculated on the fly.
5. **Validation:** Zod at write boundary only. Reads are trusted.
6. **Optimistic UI:** Local-first = Zero latency. No loading states.

## Workflow

- **Start:** `/execute-next-phase` (via EXECUTION_PLAN.md)
- **Finish:** `/closing-phase`
- **Branch:** `phase-N/<desc>` → `main` via PR
- **Gates:** Branch verification + build + test enforced by skills. See skill definitions.
- **Redesign:** Reference-inspired phases use `/reference-redesign`. See WORKFLOW.md.
- **Issue tracking:** Execution-time issues, fixes, and out-of-plan changes must be recorded in `docs/issues/Issues_Phase_N.md` during execution — not deferred to phase close. Unresolved issues block phase close. Issues may not be marked Closed without explicit user decision. See `docs/WORKFLOW.md` §Phase Execution Record for statuses, categories, and trigger examples.
- **Task completion gate:** During an active phase, do not mark tasks or phases `[x]` in `docs/EXECUTION_PLAN.md` based only on implementation or internal verification. Update completion status only after checkpoint review and explicit user approval. See `docs/WORKFLOW.md` §Task Completion Gate.

## Planning Gate

- **Before implementation:** Check `docs/reviews/phase-N-flow-review.md` exists for the phase you're about to start. If missing, run flow-trace review per `docs/PLANNING_STANDARD.md` §3 before writing code. Resolve any ❌ gaps first.
- **During closing:** Run architecture conformance review (Blocking/Advisory tiers) from `docs/PLANNING_STANDARD.md` §6. Confirm user-visible verification per §5.
