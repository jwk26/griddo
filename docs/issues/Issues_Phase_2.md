# Issues — Phase 2

## Issue 1: Dexie v4 removed `useLiveQuery` — no reactive hook built in

- **Problem:** `docs/EXECUTION_PLAN.md` and `docs/SPEC.md` both reference `useLiveQuery` (from `dexie-react-hooks`) as the reactive pattern for data hooks. Dexie v4 does not export `useLiveQuery` — neither from `dexie` directly nor via a bundled `dexie-react-hooks` package. The package is not in `node_modules`.
- **Root Cause:** The plan was written against Dexie v3 conventions. Dexie v4 replaced the React-specific hook with a framework-agnostic `liveQuery()` observable API.
- **Solution:** All data hooks (`useGridData`, `useBitDetail`, `useCalendarData`) use `liveQuery` from `dexie` combined with `useState` + `useEffect` to subscribe to the observable:
  ```typescript
  import { liveQuery } from 'dexie';
  useEffect(() => {
    const subscription = liveQuery(querier).subscribe({
      next: (value) => setState(value),
      error: (err) => console.error('liveQuery error:', err),
    });
    return () => subscription.unsubscribe();
  }, [deps]);
  ```
- **Learning:** Any future plan referencing `useLiveQuery` should be updated to `liveQuery` + subscribe. Do not install `dexie-react-hooks` — it is Dexie v3 only. The observable pattern is more flexible and works identically.

---

## Issue 2: `useBitDetail.close()` wiped all query params

- **Problem:** The initial implementation called `router.replace(pathname)`, which removes the entire query string — not just `?bit=`. Any unrelated query params on the current URL would be silently dropped.
- **Root Cause:** Simple oversight — the execution plan says "removes `?bit` param via `router.replace`" but doesn't specify that other params should be preserved.
- **Solution:** Use `URLSearchParams` to delete only the `bit` key and reconstruct the URL:
  ```typescript
  const params = new URLSearchParams(searchParams.toString());
  params.delete("bit");
  const query = params.toString();
  router.replace(query ? `${pathname}?${query}` : pathname);
  ```
- **Learning:** When removing a specific query param, always use `URLSearchParams.delete(key)` and reconstruct rather than replacing with bare `pathname`. A component that clears params it doesn't own is a latent bug waiting for the first other param to appear.

---

## Issue 3: DnD hook acceptance criteria overstated for Phase 2

- **Problem:** Task 10's acceptance criteria states "DnD hook provides unified drag coordination across all contexts" — implying full drag logic for grid reposition, drag-into-Node, calendar scheduling, chunk reorder, and breadcrumb moves. These behaviors can't be implemented in Phase 2.
- **Root Cause:** The acceptance criteria describes the *final* hook, not the Phase 2 deliverable. All drag dispatch logic depends on `useDroppable()` drop zones inside UI components (GridCell, NodeCard, BreadcrumbSegment, CalendarDayColumn) that are built in Phases 3–5.
- **Solution:** Phase 2 delivers the shared infrastructure: sensor setup, `activeItem` tracking, and typed handler signatures. TODO comments in `handleDragEnd` map each behavior to its owning phase. Dispatch logic fills in incrementally as UI components are built.
- **Learning:** When a hook's behavior depends on UI components that don't exist yet, scope the acceptance criteria to the infrastructure deliverable (sensors, state, types) and note which phases own the dispatch logic. Overstated criteria causes false completeness flags.

---

## Summary

| # | Issue | Resolution |
|---|-------|------------|
| 1 | Dexie v4 has no `useLiveQuery` | Use `liveQuery` observable + `useState`/`useEffect` throughout |
| 2 | `close()` wiped all query params | `URLSearchParams.delete("bit")` + reconstruct URL |
| 3 | DnD acceptance criteria overstated | Phase 2 delivers infrastructure; dispatch logic fills in Phases 3–5 |
