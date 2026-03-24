# GridDO (Local-first Task Management)

12×8 Grid | Node(L0) → Bit(L1) → Chunk(L2) hierarchy.

**Always check docs/EXECUTION_PLAN.md first to see the current task before starting work.**

## Documentation (Priority: SCHEMA > SPEC > DESIGN > PLAN)

- `docs/SCHEMA.md`: Data model, Object stores, Zod (Authoritative)
- `docs/SPEC.md`: Architecture, Routing, Layouts
- `docs/DESIGN_TOKENS.md`: CSS vars, Tailwind v4, Components
- `docs/EXECUTION_PLAN.md`: Phased task specs
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
