# Flow-Trace Review — Phase 9: Grid UX Improvements

**Reviewed:** 2026-04-04
**Inputs:** PRD.md, SPEC.md (updated with Phase 9 PRD departures), DESIGN_TOKENS.md (updated with level backgrounds), EXECUTION_PLAN.md (Phase 9: Tasks 39-45)

---

## Flow-Trace Table

| # | User Flow | Trigger | Intended Outcome | Owning Task | Boundary Cases | Status |
|---|-----------|---------|------------------|-------------|----------------|--------|
| 1 | Delete node via edit-mode X | Click X button on NodeCard in edit mode | Confirmation dialog with cascade warning → soft-delete node + descendants | Task 39 | Node with children: cascade warning text differs from childless node. X click must not trigger card navigation. | ✅ Owned |
| 2 | Delete bit via edit-mode X | Click X button on BitCard in edit mode | Confirmation dialog with simple warning → soft-delete bit | Task 39 | Same dialog component, different copy. X click must not trigger card click. | ✅ Owned |
| 3 | Level 0 grid renders with icon rail sidebar | Navigate to `/` | Sidebar renders as fixed icon rail (w-12), "Home" breadcrumb, grid fills remaining space, no padding gap | Task 40 (layout), Task 41 (sidebar) | Sidebar must not fold/unfold. All icons visible including trash. | ✅ Owned |
| 4 | Navigation between grid levels — no sidebar remount | Click node to navigate `/` → `/grid/[nodeId]` | Sidebar stays mounted (no flash). Breadcrumb updates to show chain. Grid content swaps. | Task 40 (layout), Task 41 (breadcrumb) | Breadcrumb shows "Home" at L0, full chain at deeper levels. Back/forward browser nav works. | ✅ Owned |
| 5 | Sidebar + triggers level-appropriate create dialog | Click + in sidebar | L0: node dialog. L1-2: chooser (node or bit). L3: bit dialog. | Task 40 | BFS origin inset: nodes from (1,1), bits from (GRID_COLS-2, 1). Grid-full case shows toast. | ✅ Owned |
| 6 | Empty cell + triggers create dialog at cell position | Click + in empty cell (edit mode) | Same level-aware dialog, but placement at specific (x, y) instead of BFS auto | Task 40 (AddFlowContext), Task 43 (cell unification) | Only visible in edit mode. Must correctly pass coordinates through AddFlowContext. | ✅ Owned |
| 7 | DnD collision: drag onto node card | Drag item over a node card that overlaps a grid cell | Node-drop target wins over grid-cell target. Confirmation dialog appears. | Task 42 | Custom collision detection filters grid-cell candidates when grid-node-drop is present. | ✅ Owned |
| 8 | Drag-to-child confirmation | Drop item onto a node card | Dialog: "Move into '{targetNodeTitle}'?" with Cancel / Move. Confirm executes BFS placement in target grid. Cancel returns item to original position. | Task 42 | Target grid full → toast error. Both node title and item title shown in dialog copy. | ✅ Owned |
| 9 | Cycle prevention | Drag a node onto one of its own descendants | Toast error: "Cannot move a node into its own descendant." Move blocked. | Task 42 | Ancestor chain walk via parentId. Only applies to node→node moves, not bit→node. | ✅ Owned |
| 10 | DnD works outside edit mode — grid repositioning | Drag a node/bit to an empty cell (no edit mode) | Item moves to new cell | Task 43 | Activation constraints: distance 8px (mouse), delay 250ms (touch). Visual edit-mode affordances (jiggle, dotted borders, X buttons, + icons) remain edit-mode-only. | ✅ Owned |
| 11 | DnD works outside edit mode — drag onto node | Drag a node/bit onto another node (no edit mode) | Confirmation dialog appears (same as flow #8) | Task 43 (unlocks), Task 42 (confirmation) | Node-card drop target enabled always. | ✅ Owned |
| 12 | Breadcrumb drops remain edit-mode-only | Drag item onto breadcrumb segment (no edit mode) | Drop does not register. `disabled: !isEditMode` preserved on breadcrumb droppable. | Task 43 | Task 43 explicitly confirms no change to breadcrumb droppable. | ✅ Owned |
| 13 | Create node dialog — random icon + color | Open create node dialog | Icon randomly selected from expanded set (~40). Color randomly selected from 10-color palette. Validation errors do not reshuffle. | Task 44 | Randomization on closed→open transition only. User can still override both. | ✅ Owned |
| 14 | Create bit dialog — random icon | Open create bit dialog | Icon randomly selected. No color picker (bits inherit parent color). | Task 44 | Same randomization timing as node dialog. | ✅ Owned |
| 15 | Description field in create dialogs | Open either create dialog | Textarea field below title. Optional (empty string default). Node: maxLength 500. Bit: maxLength 1000. Wired through to DataStore. | Task 44 | Max lengths match schema constraints (SCHEMA.md). Description visible in edit dialog / bit detail after creation. | ✅ Owned |
| 16 | Expanded icon set | Open either create dialog | ~40 curated icons in grid picker (up from ~25) | Task 44 | All icons from lucide-react. Grid layout: `grid-cols-5 sm:grid-cols-6`. | ✅ Owned |
| 17 | Bit card title wraps to 2 lines | View a bit with a long title | Title shows up to 2 lines (`line-clamp-2`) instead of single-line truncation. Icon and priority badge align to top (`items-start`). | Task 45 | Deadline text, progress bar unaffected. | ✅ Owned |
| 18 | Level background colors | Navigate between grid levels | Background subtly changes per level: L0 white → L3 cool gray (light) or progressively darker (dark mode). No vignette overlay. | Task 45 | CSS variables `--grid-bg-l0` through `--grid-bg-l3`. Inline style on grid container. Dark mode uses different progression. | ✅ Owned |
| 19 | Creation animation | Create a new node or bit | Item appears with spring scale+fade animation (scale 0.85→1, opacity 0→1) | Task 45 | `AnimatePresence` + `motion.div` wrapper. Spring: stiffness 400, damping 25. | ✅ Owned |
| 20 | Deletion animation | Confirm delete in dialog | Item disappears with shrink+fade (scale 0.9, opacity 0, y +8px, 200ms easeIn) | Task 45 | Requires `AnimatePresence` with exit variants on grid item list. | ✅ Owned |
| 21 | Square add-target in edit mode | Enter edit mode with empty cells | Empty cells show a centered square dotted + target (`aspect-square max-w-[4rem]`) instead of full-cell stretch | Task 45 | Cell itself stays rectangular. Only the visual affordance becomes square. | ✅ Owned |

---

## PRD Departure Coverage

| # | PRD Departure | Owning Task | Status |
|---|---------------|-------------|--------|
| 1 | Sidebar always visible (no fold/unfold) | Task 41 | ✅ Owned |
| 2 | Grid DnD outside edit mode | Task 43 | ✅ Owned |
| 3 | Vignette → level background colors | Task 45 | ✅ Owned |
| 4 | Trash icon on all levels | Task 41 | ✅ Owned |

---

## Gaps Found

None.

---

## Summary

- Flows traced: 21
- Fully owned: 21
- Weak: 0
- Gaps: 0
- Deferred: 0
- PRD departures verified: 4/4
- Status: **PASS**
