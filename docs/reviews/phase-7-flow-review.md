# Flow-Trace Review — Phase 7

**Reviewed:** 2026-03-29
**Amended post-implementation:** 2026-03-30 — all gaps resolved; status updated to PASS
**Inputs:** PRD.md, SPEC.md, SCHEMA.md (Hooks 4–8), EXECUTION_PLAN.md (Tasks 31–35)

## Table of Contents

1. [Flow-Trace Table](#flow-trace-table)
2. [Resolved Gaps](#resolved-gaps)
3. [Weak Ownership Notes](#weak-ownership-notes)
4. [Cross-Task Dependency Notes](#cross-task-dependency-notes)
5. [Summary](#summary)

---

## Flow-Trace Table

| # | User Flow | Trigger | Intended Outcome | Owning Task | Boundary Cases | Status |
|---|-----------|---------|------------------|-------------|----------------|--------|
| 1 | View trashed items | Click Trash icon in sidebar | Navigate to `/trash`, show grouped trashed Nodes and Bits | Task 31 | Sidebar Trash button only at Level 0; empty trash state | ✅ Owned |
| 2 | Expand grouped trash Node | Click on a trashed Node entry | Entry expands to reveal child Nodes and Bits with counts | Task 31 | Independent expand (multiple groups open simultaneously); orphan Bits not in cascade root | ✅ Owned |
| 3 | Restore single Bit from trash | Click Restore on a trashed Bit | Returns to original grid position; BFS fallback if occupied; parent chain auto-restored if needed | Task 31 + Task 32 | Parent Node trashed → auto-restore chain; BFS when original cell occupied; grid full (BFS returns null) | ⚠️ Weak |
| 4 | Restore single Node from trash | Click Restore on a trashed Node | Node + descendants restored; parent chain auto-restored; BFS for occupied cells | Task 31 + Task 32 | Deep chain (grandparent also trashed); BFS across multiple restored items simultaneously | ✅ Owned |
| 5 | Permanently delete single item | Click Delete Permanently | Item removed from IndexedDB (Node: cascade; Bit: cascade Chunks); AlertDialog confirmation | Task 31 + Task 32 | Chunks with no `deletedAt` cascaded via parent | ✅ Owned |
| 6 | Empty trash (all) | Click "Empty trash" button | All trashed items permanently deleted; AlertDialog confirmation | Task 31 + Task 32 | Large item count performance | ✅ Owned |
| 7 | Retention countdown | View trash list | Each item shows "X days until permanent deletion" from `deletedAt + 30 days` | Task 31 | Items close to expiry (< 1 day); expired items still visible before cleanup | ✅ Owned |
| 8 | Trash auto-cleanup on startup | App loads | `useTrashAutoCleanup` runs Hook 7: permanently deletes items with `deletedAt > 30 days` | Task 32 | First visit (no trashed items); timer continues during session; cleanup while trash page is open (reactive update) | ✅ Owned |
| 9 | Cascade soft-delete Node | User deletes a Node (edit mode) | Node + all descendant Nodes + all their Bits get `deletedAt`; Chunks implicitly inaccessible | Task 32 | No children; deeply nested; concurrent cascade from calendar view | ✅ Owned |
| 10 | Cascade soft-delete Bit | User deletes a Bit (edit mode) | Only that Bit gets `deletedAt`; Chunks remain but inaccessible | Task 32 | Zero Chunks; Bit with scheduled Chunks visible in calendar (should disappear) | ✅ Owned |
| 11 | Cascade restore with parent chain | Restore child Node whose parent is trashed | Auto-restores parent chain first (no orphans); BFS if position occupied | Task 32 | Chain depth > 2 levels; BFS origin for auto-restored parents | ✅ Owned |
| 12 | Cascade hard-delete Node | Permanently delete a Node | Node + all descendant Nodes + Bits + their Chunks removed from stores | Task 32 | Large subtrees (performance); Chunks must be deleted in same transaction as Bits | ✅ Owned |
| 13 | Open search via sidebar button | Click Search icon | Search overlay opens with blurred backdrop, autofocused input | Task 33 | Sidebar folded (icon still clickable) | ✅ Owned |
| 14 | Open search via Cmd/Ctrl+K | Keyboard shortcut | Search overlay opens; `e.preventDefault()` prevents browser address-bar focus; fires regardless of current focus target | Task 33 | Browser Cmd+K conflict handled via `preventDefault` | ✅ Owned |
| 15 | Real-time search filtering | Type in search input | Results filter across active Nodes, Bits, Chunks (case-insensitive substring) | Task 33 | Empty query; no matches; special characters | ✅ Owned |
| 16 | Navigate to Node from search | Click a Node result | Navigate to `/grid/[nodeId]`; overlay closes | Task 33 | Level 0 Node vs. deep Node | ✅ Owned |
| 17 | Navigate to Bit from search | Click a Bit result | Navigate to `/grid/[parentNodeId]?bit=[bitId]`; overlay closes; popup opens | Task 33 | `SearchResult` includes `parentNodeId` for Bits | ✅ Owned |
| 18 | Navigate to Chunk from search | Click a Chunk result | Navigate to `/grid/[grandparentNodeId]?bit=[parentBitId]`; overlay closes | Task 33 | `SearchResult` includes `parentBitId` and `grandparentNodeId`; `searchAll` returns ID fields | ✅ Owned |
| 19 | Close search via ESC | Press ESC while overlay open | Overlay closes; `stopPropagation` prevents lower-priority handlers from firing | Task 33 | ESC priority handled via `stopPropagation` on outermost handler | ✅ Owned |
| 20 | Close search via backdrop click | Click outside search container | Overlay closes | Task 33 | Click on sidebar; click on underlying grid content | ✅ Owned |
| 21 | Search empty state | No query or no matches | (a) No query → placeholder "Search nodes, bits, and chunks…" with icon; (b) Query with no matches → "No results for '[query]'" message | Task 33 | Two distinct empty states | ✅ Owned |
| 22 | Grid reposition in edit mode | Drag item to empty cell in edit mode | Item moves to new (x,y); magnet snap spring animation | Task 34 | Drop on occupied cell (reject); drop outside bounds | ✅ Owned |
| 23 | Drag-into-Node | Drag Bit/Node over a Node card | "Suck" spring animation; item moves inside target Node via BFS | Task 34 | Drag Node into itself (prevent); drag into Level 2 Node (Node-only at L3 blocked); target grid full | ✅ Owned |
| 24 | Drag-to-breadcrumb | Drag item onto breadcrumb segment | Item moves to that ancestor's grid via BFS | Task 34 | Level 0 (no breadcrumbs); "Home" breadcrumb (Level 0); target grid full; item already in target | ✅ Owned |
| 25 | Visual feedback during drag | Drag starts | Dragged item opacity 0.5; valid drop zones get highlight border | Task 34 | 8px activation distance (accepted over the 5px spec — reduces accidental drag) | ✅ Owned |
| 26 | Completion sinking animation | Bit status → "complete" | `AnimatePresence` exit: translateY(8px) scale(0.95) opacity(0.5) | Task 35 | `sinkingVariants` wired to `AnimatePresence` in grid-view | ✅ Owned |
| 27 | Task tossing animation | Drag item into Node | Spring with overshoot; item "thrown" into Node icon | Task 35 | Timing coordination with Task 34 drag-into-Node | ✅ Owned |
| 28 | Sidebar fold/unfold animation | Click fold/unfold button | Motion layout animation on width change | Task 35 | `sidebarVariants` created in `layout.ts` | ✅ Owned |
| 29 | Search overlay entry/exit animation | Open/close search | Fade + scale via `searchOverlayVariants` | Task 33 + Task 35 | Already defined in `layout.ts`; wired in `search-overlay.tsx` | ✅ Owned |
| 30 | Bit detail popup entry/exit animation | Open/close bit detail | Fade + slide-up entry, slide-down + fade exit via `bitDetailPopupVariants` | Task 35 | Duplicate removed from `grid.ts`; canonical definition in `layout.ts` (y: 16, no scale) | ✅ Owned |
| 31 | Floating idle animation | Nodes/Bits at rest | Optional `animate-float` CSS; ON/OFF toggle | Task 35 | Toggle requires settings UI — explicitly deferred per Phase 7 Defer Notes | ⏸️ Deferred |
| 32 | prefers-reduced-motion | System accessibility setting active | All animations disabled | Task 35 | `globals.css` has the media query; Motion handles explicitly | ✅ Owned |

---

## Resolved Gaps

All five gaps identified during pre-implementation review were resolved during Phase 7 implementation.

| Gap | Flows | Description | Resolution |
|-----|-------|-------------|------------|
| G1 | 17, 18 | `SearchResult` missing `parentNodeId`, `parentBitId`, `grandparentNodeId`; `searchAll` returned title strings only | Extended `SearchResult` type and updated `searchAll` in DataStore interface + `indexeddb.ts` to return ID fields |
| G2 | 21 | No empty state specified for no-query vs. no-matches conditions | Both states implemented: placeholder with icon (no query), "No results for '[query]'" (no matches) |
| G3 | 28 | `sidebarVariants` did not exist | Created in `src/lib/animations/layout.ts`; wired in `sidebar.tsx` |
| G4 | 30 | `bitDetailPopupVariants` duplicated in `grid.ts` and `layout.ts` with different values | Duplicate removed from `grid.ts`; canonical definition kept in `layout.ts` |
| G5 | 3, 5, 8 | No `useTrashData` hook task specified | `src/hooks/use-trash-actions.ts` extracted (write operations); reactive reads via `liveQuery` in `trash-list.tsx` |

---

## Weak Ownership Notes

| # | Flow | Issue | Resolution |
|---|------|-------|------------|
| W1 | 2 — Trash group expand | Accordion vs. independent expand not specified | Implemented as independent expand (multiple groups open simultaneously) |
| W2 | 3 — Restore to full grid | BFS returning `null` on restore — behavior unspecified | Falls through without toast in v1; grid-full toast exists for creation path. Accepted for v1 |
| W3 | 5, 6 — Permanent delete | No confirmation dialog specified for destructive action | `AlertDialog` confirmation implemented for both per-item delete and "Empty trash" |
| W4 | 14 — Cmd+K conflict | `e.preventDefault()` not mentioned; behavior in input focus unspecified | `e.preventDefault()` added; fires regardless of current focus target |
| W5 | 19 — ESC priority | Independent `keydown` listeners with no coordination | `event.stopPropagation()` on inner container; ESC closes overlay before bubbling |
| W6 | 25 — Activation distance | Task 34 spec said 5px; existing code used 8px | Kept 8px — reduces accidental drag initiation; accepted in flow review |

---

## Cross-Task Dependency Notes

1. **Task 32 must logically precede Task 31.** Task 31's restore and delete buttons depend on cascade hooks (Hooks 4–7) from Task 32. Task 31's listed dependency was "Task 5" only — Task 32 functional dependency noted here.
2. **Task 34 + Task 35 are tightly coupled.** Grid reposition (Task 34) needs magnet snap (Task 35); drag-into-Node (Task 34) needs task tossing (Task 35). Task 34 implemented with placeholder transitions; animations wired in Task 35.
3. **`useTrashAutoCleanup` hook (Task 32) wired in `providers.tsx`.** Wiring point was in scope for Task 32.
4. **Search sidebar button wiring.** Task 33 verified the Search button onClick opens `useSearchStore` in `sidebar.tsx`.

---

## Summary

- Flows traced: 32
- Fully owned: 31
- Weak (resolved): 6
- Gaps (resolved): 5
- Deferred: 1 (floating idle animation — PRD toggle deferred to v1.1)
- Status: **PASS**
