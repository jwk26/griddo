# Issues — Phase 7

## Issue 1: react-hooks/set-state-in-effect lint violation in SearchOverlay

- **Problem:** `setSelectedIndex(-1)` was called synchronously inside a `useEffect` body, triggering the `react-hooks/set-state-in-effect` rule. The effect was used to reset selection whenever `normalizedQuery` or `isOpen` changed.
- **Root Cause:** setState-in-effect is unnecessary when the value can be derived directly from existing state at render time. The original approach treated `selectedIndex` as independent state rather than derived state.
- **Solution:** Replaced `useState<number>` + `useEffect` with a single `useState<{ query: string; index: number }>` object. `selectedIndex` is now computed inline: `selection.query === normalizedQuery && isOpen ? selection.index : -1`. The effect was removed entirely.
- **Learning:** When a state value is always computed from other state/props, derive it at render rather than sync it via effect. The object-keyed pattern (`{ query, index }`) is a clean idiom for "selection is only valid when the query matches."

## Issue 2: getDataStore() called directly in trash components

- **Problem:** `trash-list.tsx` and `trash-group.tsx` called `getDataStore()` directly for write operations (restore, hard-delete, empty trash). This violated the Hook API boundary architectural rule: components must not import DataStore.
- **Root Cause:** Codex implemented write operations in components without extracting a hook, bypassing the two-layer data abstraction.
- **Solution:** Extracted `src/hooks/use-trash-actions.ts` wrapping all trash write operations. Components now only call hook functions.
- **Learning:** Always check that Codex-written components are importing from `@/hooks/` for data access, not from `@/lib/db/`. The conformance checklist catches this at close-out, but a quick grep during integration saves a separate fix pass.

## Issue 3: Child-node grouping missing from trash (Task 31 incomplete)

- **Problem:** After Codex implementation, trash only grouped bits under their deleted parent nodes. Child nodes nested under deleted nodes were not grouped — they appeared as independent top-level entries rather than inside the parent node's expand section.
- **Root Cause:** Task 31 spec described "X nodes, Y bits" count and expand-to-reveal behavior, but Codex only implemented bit grouping. Node-under-node grouping was missed.
- **Solution:** Added `groupedChildNodes` map in `TrashList` (nodes whose `parentId` is in `deletedNodeIds`). `TrashGroup` now accepts a `childNodes` prop and renders both child nodes and bits in the expand section, with "X nodes, Y bits" in the summary count.
- **Learning:** For tree-structured data with multiple child types, explicitly list each child type in the Codex prompt spec. "Group children under parent" is ambiguous — "group child nodes AND bits separately under their deleted parent" is not.

## Issue 4: Drag-and-drop not gated to edit mode

- **Problem:** `DraggableNodeCard`, `DraggableBitCard`, and `BreadcrumbSegmentButton` attached dnd-kit listeners unconditionally, allowing drag initiation and drop targeting even when edit mode was off.
- **Root Cause:** `disabled` prop on `useDraggable`/`useDroppable` was not wired. Codex implemented the hooks without reading `isEditMode`.
- **Solution:** Added `disabled: !isEditMode` to all `useDraggable` and `useDroppable` hook calls in the affected components. `BreadcrumbSegmentButton` was already importing `useEditModeStore` for its button state — used the same value.
- **Learning:** dnd-kit's `disabled` option is the correct gating mechanism. When DnD is introduced in the same phase as edit-mode gating, add the `disabled` wiring to the Codex prompt explicitly — it is not inferred from "only works in edit mode."

## Issue 5: use-search.ts imported useSearchStore (pre-existing boundary violation)

- **Problem:** `use-search.ts` imported `useSearchStore` from Zustand to read the query internally, violating the State Separation rule: hooks must not import Zustand stores.
- **Root Cause:** Pre-existing since Phase 2. The hook was originally designed as self-contained, pulling its own query from the store.
- **Solution:** Refactored `useSearch` to accept `query: string` as a parameter. The call site in `search-overlay.tsx` passes `normalizedQuery` directly. The hook no longer imports any store.
- **Learning:** The "hooks don't import Zustand" rule is easy to miss when writing hooks that feel self-contained. Flag this pattern in Codex prompts: "hooks accept data as parameters; they do not read Zustand stores."

## Issue 6: Architecture conformance standard too strict on liveQuery imports

- **Problem:** The DataStore facade checklist item blocked `liveQuery` imports from `dexie` in `src/hooks/*.ts`, but the reactive hooks layer is explicitly designed to use `liveQuery` as its internal reactive mechanism.
- **Root Cause:** The standard was written to prevent direct Dexie usage from components, but the wording inadvertently covered hooks too, which are the intended home for `liveQuery`.
- **Solution:** Amended `docs/PLANNING_STANDARD.md` to explicitly allow `liveQuery` imports in `src/hooks/*.ts`: "Only `src/lib/db/indexeddb.ts` imports Dexie — exception: `src/hooks/*.ts` may import `liveQuery` from `dexie` for reactive subscriptions (this is the intended reactive-layer pattern)."
- **Learning:** Architecture standards should distinguish between "structural imports" (e.g., `new Dexie(...)`) and "reactive primitives" (e.g., `liveQuery`) when the reactive primitive is the intended integration point for a whole layer. Write the exception into the standard at authoring time.

---

## Summary

| # | Issue | Resolution |
|---|-------|------------|
| 1 | react-hooks/set-state-in-effect in SearchOverlay | Replaced effect with derived state (`{ query, index }` object) |
| 2 | getDataStore() called in trash components | Extracted `use-trash-actions.ts` hook |
| 3 | Child-node grouping missing from trash | Added `groupedChildNodes` map + `childNodes` prop to TrashGroup |
| 4 | DnD not gated to edit mode | Added `disabled: !isEditMode` to all useDraggable/useDroppable calls |
| 5 | use-search.ts imported useSearchStore (pre-existing) | Refactored to accept `query: string` parameter |
| 6 | Conformance standard too strict on liveQuery | Amended PLANNING_STANDARD.md to allow liveQuery in hooks |
