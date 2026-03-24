# GridDO — Technical Specification

> **Scope:** Architecture, routing, file organization, and page layouts. Data model lives in SCHEMA.md. Design values live in DESIGN_TOKENS.md.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Decisions](#architecture-decisions)
- [Routes](#routes)
- [File Organization Conventions](#file-organization-conventions)
- [Page Layouts](#page-layouts)
- [Responsive Breakpoints](#responsive-breakpoints)
- [Key File Paths](#key-file-paths)

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js (App Router) | 16 | Routing, layouts, static shell |
| Language | TypeScript | 5.x strict | Type safety across the codebase |
| UI Runtime | React | 19 | Component model, hooks, concurrent features |
| Styling | Tailwind CSS | 4.x | Utility-first styling |
| Component Library | shadcn/ui (Radix primitives) | latest | Accessible, composable UI primitives |
| Icons | Lucide React | latest | Icon library for Nodes, Bits, sidebar, and UI elements |
| Validation | Zod | 3.x | Runtime schema validation at data boundaries |
| Storage | Dexie.js (IndexedDB) | 4.x | Type-safe IndexedDB wrapper with reactive queries (`useLiveQuery`) |
| Theming | next-themes | latest | Dark/Light mode with system preference detection |
| Dates | date-fns | 4.x | Date arithmetic — aging, urgency, calendar rendering |
| State Management | Zustand | 5.x | Lightweight client state — edit mode, sidebar, drag state, calendar view |
| Animation | Motion (Framer Motion) | latest | Jiggle mode, sinking effects, floating animation, vignette, magnet snap |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable | latest | Grid reordering, calendar scheduling, timeline ordering |
| Package Manager | pnpm | latest | Fast, disk-efficient dependency management |

---

## Architecture Decisions

1. **Client Components by default** — GridDO is local-first. All data lives in IndexedDB, accessed from the browser. Server Components are used only for static layout shells (root layout, page skeletons). Any component that reads data or handles interaction is a Client Component.

2. **DataStore abstraction (two-layer)** — Data access has two independent abstraction boundaries. **CRUD layer:** All write operations go through a `DataStore` interface (`src/lib/db/datastore.ts`). v1 implements with Dexie.js/IndexedDB (`src/lib/db/indexeddb.ts`). **Reactive layer:** All read subscriptions go through custom hooks (`src/hooks/use-*.ts`), which internally use Dexie `useLiveQuery` in v1. Components never import DataStore or Dexie directly — they import hooks only. Both layers are independently replaceable for v2 cloud sync. This is a **critical PRD constraint**. See PRD Section 1: Storage Strategy.

3. **Reactive data via custom hooks** — Components subscribe to data through custom hooks (`useGridData`, `useBitDetail`, `useCalendarData`, `useSearch`), which internally use Dexie's `useLiveQuery` in v1. This eliminates manual cache invalidation — write to the store, and all subscribed components update automatically. The hooks are the abstraction boundary; swapping `useLiveQuery` for React Query or SWR in v2 requires no component changes.

4. **URL-driven grid navigation** — The current grid position is encoded in the URL (`/` for Level 0, `/grid/[nodeId]` for deeper levels). This enables browser back/forward navigation through the grid hierarchy. Breadcrumbs and URL stay in sync.

5. **Bit detail via query parameter** — Opening a Bit detail popup appends `?bit=[bitId]` to the current URL. Browser back closes the popup. This works from both grid and calendar views.

6. **Computed values at render time** — Aging state, Node completion, badge urgency, and Bit progress are computed during rendering from stored data (see SCHEMA.md). Never stored. This avoids stale derived state and simplifies the write path.

7. **Zod validation at write boundary** — Data is validated with Zod schemas (SCHEMA.md) when entering the DataStore (create/update operations). Data read from the store is trusted — no runtime validation on reads. This keeps read paths fast.

8. **Domain-grouped shared components** — Shared components are organized by domain (`grid/`, `calendar/`, `bit-detail/`, `layout/`, `trash/`) under `src/components/`. Page-specific components live in `_components/` within their route folder.

9. **Zustand for client state** — GridDO has complex UI state (edit mode, sidebar fold, drag operations, calendar drill-down, search query). React Context alone doesn't scale for cross-cutting interactive state. Zustand stores in `src/stores/` provide lightweight, boilerplate-free state management. Data state stays in Dexie (`useLiveQuery`); UI state stays in Zustand. Clean separation.

10. **next-themes for theming** — Dark/Light mode via `next-themes` provider in root layout. Theme token switching is handled through CSS custom properties in `globals.css`, referenced by Tailwind classes. No conditional class logic in components.

11. **Optimistic UI everywhere** — Local-first means zero network latency. All mutations (create, update, delete, move, complete) apply instantly to IndexedDB and reflect immediately via `useLiveQuery`. No loading spinners, no optimistic rollback, no error states for data operations.

12. **@dnd-kit for all drag interactions** — Unified drag-and-drop across: grid cell repositioning (edit mode), drag-into-Node (move), calendar pool-to-day scheduling, Chunk timeline reordering, and drag-to-breadcrumb. Single library, consistent interaction model.

13. **Motion for all animations** — The PRD specifies jiggle mode, sinking effects, floating animation, vignette transitions, magnet snap, and task-tossing. Motion (Framer Motion) handles all of these declaratively. CSS-only would be insufficient for the interaction-driven animations GridDO requires. Animation variants defined per domain in `src/lib/animations/`.

14. **Pure utility functions for algorithms** — BFS auto-placement, aging state computation, urgency level computation, and Node completion check are pure functions in `src/lib/utils/`. No side effects, independently testable.

---

## Routes

| Route | Purpose | Rendering | File |
|-------|---------|-----------|------|
| `/` | Level 0 grid — root Nodes | Server shell + Client grid | `src/app/page.tsx` |
| `/grid/[nodeId]` | Grid view inside a Node (Level 1-3) | Server shell + Client grid | `src/app/grid/[nodeId]/page.tsx` |
| `/calendar/weekly` | Calendar:Weekly — global weekly schedule | Client | `src/app/calendar/weekly/page.tsx` |
| `/calendar/monthly` | Calendar:Monthly — global monthly overview | Client | `src/app/calendar/monthly/page.tsx` |
| `/trash` | Trash zone — soft-deleted items | Client | `src/app/trash/page.tsx` |

**No auth.** All routes are public. No middleware for route protection. No login/callback routes.

**Bit detail popup:** Not a route. Triggered by `?bit=[bitId]` query parameter on any grid or calendar page. The popup component reads the query param and renders accordingly.

**Search overlay:** Not a route. Triggered by sidebar Search button or keyboard shortcut. Rendered as a portal overlay on any page.

**Edit mode:** Not a route. Toggled via sidebar Pencil button or keyboard shortcut. Visual overlay on the current grid page.

---

## File Organization Conventions

| Category | Location Pattern | Example |
|----------|-----------------|---------|
| Pages | `src/app/{route}/page.tsx` | `src/app/grid/[nodeId]/page.tsx` |
| Layouts | `src/app/{route}/layout.tsx` | `src/app/layout.tsx` |
| Page Components | `src/app/{route}/_components/{name}.tsx` | `src/app/trash/_components/trash-group.tsx` |
| Shared Components (by domain) | `src/components/{domain}/{name}.tsx` | `src/components/grid/node-card.tsx` |
| UI Primitives (shadcn) | `src/components/ui/{name}.tsx` | `src/components/ui/button.tsx` |
| Hooks | `src/hooks/use-{name}.ts` | `src/hooks/use-grid-data.ts` |
| DataStore Interface | `src/lib/db/datastore.ts` | — |
| DataStore Implementation | `src/lib/db/indexeddb.ts` | — |
| Validation Schemas | `src/lib/db/schema.ts` | — |
| Pure Utilities | `src/lib/utils/{name}.ts` | `src/lib/utils/bfs.ts` |
| Constants | `src/lib/constants.ts` | — |
| Animation Variants | `src/lib/animations/{domain}.ts` | `src/lib/animations/grid.ts` |
| Types | `src/types/{domain}.ts` | `src/types/index.ts` |
| Zustand Stores | `src/stores/{name}-store.ts` | `src/stores/sidebar-store.ts` |
| Providers | `src/app/providers.tsx` | — |

**Component location rule:** Used by one page only → co-locate under `_components/` in that route folder. Used by 2+ pages → `src/components/{domain}/`.

**Shared component domains:**

| Domain | Contents | Used by |
|--------|----------|---------|
| `grid/` | `grid-view.tsx`, `grid-cell.tsx`, `node-card.tsx`, `bit-card.tsx`, `edit-mode-overlay.tsx`, `onboarding-hints.tsx` | Grid pages |
| `bit-detail/` | `bit-detail-popup.tsx`, `chunk-timeline.tsx`, `chunk-pool.tsx`, `chunk-item.tsx` | Grid + Calendar (popup opens from both) |
| `calendar/` | `node-pool.tsx`, `items-pool.tsx`, `day-column.tsx`, `compact-bit-item.tsx` | Both calendar views |
| `layout/` | `sidebar.tsx`, `breadcrumbs.tsx`, `search-overlay.tsx`, `theme-toggle.tsx` | All pages |
| `trash/` | `trash-list.tsx`, `trash-group.tsx` | Trash page only (but may move to shared if trash preview is added elsewhere) |

---

## Page Layouts

### Route: `/` (Level 0 Grid)

- **Structure:** Full-width 12x8 grid occupying the main content area. Left sidebar (foldable). No breadcrumbs — "Home" is implicit.
- **Content:** Nodes only. No Bits at Level 0.
- **Sidebar:** All functions visible. Trashbin icon visible. Labs icon visible (deferred).
- **Onboarding:** On first visit (no Nodes exist), show ghost placeholder Nodes with dashed outlines and hint labels ("Try: Work, Personal, Hobbies"). Disappear after first Node creation.
- **Interactions:** Click Node → navigate to `/grid/[nodeId]`. Sidebar toggle, theme toggle, search overlay, edit mode.
- **Visual:** No vignette effect. Standard grid line density. No depth effects at Level 0.

### Route: `/grid/[nodeId]` (Level 1-3 Grid)

- **Structure:** 12x8 grid with breadcrumb bar at top. Node description subtitle below breadcrumb (if description exists). Left sidebar (foldable).
- **Level 1-2 content:** Nodes (left zone, ~5-6 columns) + Bits (right zone, ~6-7 columns). 2-way split is a soft guide — items can be placed anywhere.
- **Level 3 content:** Bits only, full-width grid. No Node creation allowed.
- **Onboarding (Level 1, first visit):** Ghost hints for 2-way split ("Nodes here" on left, "Bits here" on right). Disappear after first item creation.
- **Sidebar:** Trashbin icon hidden (Level 0 only). "+" context-aware: Level 1-2 shows Node/Bit menu, Level 3 creates Bit directly.
- **Depth visual effects:**
  - Grid line density increases with level (thinner, denser lines).
  - Vignette: faint inner shadow at screen edges, intensity increases with level.
- **Bit detail:** Click a Bit → URL updates to `?bit=[bitId]` → popup opens (see Bit Detail Popup below).
- **Edit mode:** Toggle via sidebar Pencil → jiggle animation, dashed cell outlines, "+" on empty cells, drag-to-reposition, delete buttons.

### Bit Detail Popup (Modal — not a route)

- **Trigger:** `?bit=[bitId]` query parameter. Opens from grid or calendar.
- **Structure:** Centered modal over blurred background.
  - **Header:** Editable title, icon selector, deadline picker, priority toggle (high/mid/low cycle).
  - **Description:** Editable text area.
  - **mtime label:** Subtle "Last updated: X days ago" text.
  - **Chunk pool:** List of unscheduled Chunks. Add/edit/delete Chunks here.
  - **Timeline:** Vertical timeline with connected dots. Drag Chunks from pool onto timeline to set order.
- **Empty state:** Timeline structure visible (vertical line, dot placeholder) + "Add a step" CTA button.
- **Timeline behavior:** Order-based by default. Chunks with `time` sort by time within the timeline; chunks without `time` follow user-defined `order`.
- **Close:** Click outside, press ESC, or browser back (removes `?bit` param).

### Route: `/calendar/weekly` (Calendar:Weekly)

- **Structure:** Two-panel layout. Left panel + right schedule area. Sidebar on left.
- **Left panel — Node Pool (top, larger section):**
  - Level 0 Nodes shown as icons only (hover for title tooltip).
  - Click a Node → drill down to show sub-Nodes (with `>` chevron) and Bits inside.
  - Back arrow (`<`) to navigate up.
  - Search input within pool.
  - Both Nodes and Bits are draggable to the schedule.
- **Left panel — Items Pool (bottom, smaller section):**
  - Merged pool of all Bits and Chunks across the project.
  - Sort: Deadline items first (sorted by priority rank, then time), no-deadline items below.
  - Scrollable with search input.
- **Right — Weekly Schedule:**
  - 7 vertical day columns (Mon–Sun), tall and scrollable.
  - "Drop items here" placeholder in empty columns.
  - Drag item from pool to day column → sets deadline to that day ("on a day").
  - **1 item in a day:** Standard Bit component.
  - **2+ items:** Compact list (colored left border, title, time on right, date badge in corner).
  - **No-time items** at the top of the day column. Timed items below, sorted earliest→latest.
  - **Overflow:** "+N more" indicator. Click → column expands vertically with vignette effect, hiding adjacent columns.
  - **Collapse expanded:** ESC key or click any area in the column except on Bits.
- **Unschedule:** Drag item back to Items Pool, or ✗ button on hover. Clears deadline.

### Route: `/calendar/monthly` (Calendar:Monthly)

- **Structure:** Two-panel layout. Same left panel as Weekly. Right = calendar grid. Sidebar on left.
- **Left panel:** Identical to Weekly — Node Pool (top) + Items Pool (bottom). Same drill-down, search, and drag behavior.
- **Right — Monthly Grid:**
  - Standard calendar grid: 7 columns (Mon–Sun), rows for weeks of the month.
  - Left/right arrow navigation between months. Month label displayed.
  - Items appear as color indicators on date cells with highlight color.
  - Drag items from pools to date cells (same deadline-setting behavior as Weekly).
  - Click a date cell → popover showing all items scheduled for that day in a list view. Items in the popover are clickable → navigates to item's grid location.

### Route: `/trash` (Trash Zone)

- **Structure:** List view with sidebar. No grid.
- **Grouped view:** A deleted Node appears as a single entry with child count indicator (e.g., "Work — 3 Nodes, 8 Bits"). Click to expand and reveal children.
- **Per-item actions:** Restore, Delete permanently.
- **Global actions:** "Empty trash" button to permanently delete all.
- **Retention label:** Each item shows "X days until permanent deletion" based on `deletedAt` + 30 days.
- **Restore behavior:** Returns to original parent grid. BFS nearest-empty-cell if original position occupied. Auto-restores parent chain if parent was also trashed.

### Search Overlay (Modal — not a route)

- **Trigger:** Sidebar Search button or keyboard shortcut.
- **Structure:** Centered overlay on blurred background. Search input at top with real-time filtering.
- **Results:** Each result shows: item name, type icon (Node/Bit/Chunk), parent path (e.g., "Work > Project A > Frontend"), deadline if present.
- **Action:** Click result → navigate to item's grid location. Search overlay closes.
- **Scope:** Vanilla text search across all active (non-trashed) Nodes, Bits, and Chunks. Case-insensitive substring matching.

---

## Responsive Breakpoints

> GridDO is **web-first, desktop-focused** for v1. Responsive design is deferred (see PRD Section 26). Tailwind default breakpoints are configured but not actively designed for. Minimum supported width: 1024px.

| Token | Width | Behavior |
|-------|-------|----------|
| `sm` | 640px | Not targeted for v1 |
| `md` | 768px | Not targeted for v1 |
| `lg` | 1024px | Minimum supported width. Full grid visible. Sidebar open by default |
| `xl` | 1280px | Comfortable grid spacing. Default development target |
| `2xl` | 1536px | Extra grid spacing, larger day columns in Calendar |

---

## Key File Paths

Infrastructure files that don't follow the File Organization Conventions above.

| Path | Purpose |
|------|---------|
| `src/app/globals.css` | CSS custom properties, Tailwind v4 `@theme` bridge, dark mode variant — single source of truth for all design tokens |
| `src/app/layout.tsx` | Root layout — ThemeProvider, Sidebar, DataStore provider |
| `src/app/providers.tsx` | Client-side providers wrapper — ThemeProvider, DndContext, DataStoreProvider. Zustand stores require no provider. |
| `src/lib/db/datastore.ts` | `DataStore` interface — the abstraction boundary between app code and storage |
| `src/lib/db/indexeddb.ts` | Dexie.js IndexedDB implementation of `DataStore` — v1 storage backend |
| `src/lib/db/schema.ts` | Zod validation schemas and TypeScript types (from SCHEMA.md) |
| `src/lib/constants.ts` | Grid dimensions (12×8), aging thresholds (5/11 days), urgency thresholds (3/2/1 days), trash retention (30 days) |
| `src/lib/utils/bfs.ts` | BFS auto-placement algorithm — finds nearest empty cell from a starting position |
| `src/lib/utils/aging.ts` | Aging state computation — Fresh/Stagnant/Neglected from mtime |
| `src/lib/utils/urgency.ts` | Deadline urgency level computation — Level 1/2/3/Past from deadline |
| `src/lib/utils/completion.ts` | Node completion check — are all child Bits complete? |
| `src/stores/sidebar-store.ts` | Sidebar open/closed state, foldable behavior |
| `src/stores/edit-mode-store.ts` | Edit mode toggle, jiggle state |
| `src/stores/search-store.ts` | Search query, open/closed state |
| `src/stores/calendar-store.ts` | Calendar drill-down navigation, pool state |
| `src/lib/animations/grid.ts` | Grid animation variants — jiggle, sinking, floating, depth transitions |
| `src/lib/animations/calendar.ts` | Calendar animation variants — vignette expand, magnet snap |
| `src/hooks/use-grid-data.ts` | Reactive hook — subscribes to Nodes + Bits for a given parentId via `useLiveQuery` |
| `src/hooks/use-bit-detail.ts` | Bit detail popup state — reads `?bit` param, fetches Bit + Chunks |
| `src/hooks/use-search.ts` | Search state — query string, filtered results across all stores |
| `src/hooks/use-calendar-data.ts` | Calendar data — all items with deadlines, pool items, drill-down state |
| `src/hooks/use-dnd.ts` | Drag-and-drop coordination — grid moves, calendar scheduling, timeline reorder |
| `components.json` | shadcn/ui configuration — component output path, Tailwind CSS variables, icon library |
| `tsconfig.json` | TypeScript config — `@` path alias mapping to `src/` |
