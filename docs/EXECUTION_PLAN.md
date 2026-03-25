# EXECUTION PLAN — GridDO

> **Guideline:** Check this file first to see the current task before looking into other docs.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete

---

## Phase 1: Foundation

### Task 1: Scaffold Next.js Project
- **Status:** `[x]`
- **Files:** `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`
- **Actions:**
  - `pnpm create next-app@latest` with TypeScript strict, Tailwind 4.x, App Router, `src/` directory
  - Install all dependencies per SPEC.md tech stack: `dexie@^4`, `next-themes`, `date-fns@^4`, `zustand@^5`, `motion`, `@dnd-kit/core`, `@dnd-kit/sortable`, `zod@^3`, `lucide-react`, `geist`
  - Install dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
  - Configure `@/` path alias in `tsconfig.json` mapping to `src/`
  - Add `vitest.config.ts` with jsdom environment, `@/` alias, and `src/` include
- **Acceptance:** `pnpm build` passes, dev server starts, `pnpm test` runs (zero tests is OK at this stage)
- **Commit:** `feat: scaffold Next.js 16 project with dependencies`

### Task 2: Initialize shadcn/ui
- **Status:** `[x]`
- **Files:** `components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`
- **Actions:**
  - `pnpm dlx shadcn@latest init -t next` — configure: style `new-york`, base color `zinc`, Tailwind CSS config blank (leave empty for v4), Tailwind CSS path `src/app/globals.css`, CSS variables `yes`, icon library `lucide`
  - Confirm `components.json` aliases: `@/components`, `@/components/ui`, `@/lib/utils`, `@/hooks`, `@/lib`
  - Add components: `pnpm dlx shadcn@latest add button dialog popover input scroll-area tooltip dropdown-menu separator`
  - **Note:** shadcn init generates a base `globals.css` with `@import "tailwindcss"`, shadcn CSS variables, and a `@theme inline` block. Task 3 reconciles this with GridDO tokens
- **Acceptance:** `components.json` has `tailwind.config: ""`, `tailwind.css: "src/app/globals.css"`, `tailwind.baseColor: "zinc"`, `tailwind.cssVariables: true`. Button renders. `cn()` available from `@/lib/utils`
- **Commit:** `feat: initialize shadcn/ui with base components`

### Task 3: Configure Tailwind v4 Token Bridge + Fonts
- **Status:** `[x]`
- **Files:** `src/app/globals.css`, `src/app/layout.tsx`
- **Dependencies:** Task 2 (shadcn init must complete first)
- **Actions:**
  - Reconcile `src/app/globals.css` with GridDO tokens from `docs/DESIGN_TOKENS.md`:
    - Keep `@import "tailwindcss"` and add `@import "tw-animate-css"` (shadcn component animations)
    - Add `@custom-variant dark (&:where(.dark, .dark *));` (replaces Tailwind v3 `darkMode: "class"`)
    - Expand `@theme inline` block: keep shadcn-generated tokens, add all GridDO color, spacing, container, and animation tokens per DESIGN_TOKENS.md Tailwind v4 Theme Bridge section. GridDO custom `@keyframes` nest inside `@theme inline` alongside their `--animate-*` values
    - Add `:root` block with all CSS variables from DESIGN_TOKENS.md (shadcn core + GridDO extensions) — top-level, NOT inside `@layer base`
    - Add `.dark` block with dark mode overrides — also top-level
    - Keep `@layer base` only for: `* { @apply border-border }`, `body { @apply bg-background text-foreground antialiased }`, and `prefers-reduced-motion` query
  - Wire fonts per DESIGN_TOKENS.md Font Loading section: `GeistSans` and `GeistMono` on `<html>`, `font-sans` on `<body>`
  - Verify `--radius: 0.625rem` (10px) in `:root`
  - Delete `tailwind.config.ts` if it exists (Tailwind v4 uses CSS-first configuration)
- **Acceptance:** `pnpm build` passes. Utility classes resolve: `bg-background` (#ffffff), `text-foreground` (#09090b), `text-muted-foreground` (#71717a), `bg-primary` (#3b82f6), `bg-priority-high` (#ef4444), `text-urgency-3` (deep red), `font-sans` (Geist Sans), `font-mono` (Geist Mono), `animate-jiggle`, `w-sidebar` (224px), `max-w-bit-detail` (640px). Dark mode toggles correctly via `.dark` class on `<html>`
- **Commit:** `feat: configure Tailwind v4 token bridge, design tokens, and Geist fonts`

### Task 4: Zod Schemas + TypeScript Types
- **Status:** `[x]`
- **Files:** `src/lib/db/schema.ts`, `src/types/index.ts`
- **Dependencies:** Task 1
- **Actions:**
  - `src/lib/db/schema.ts`: Copy Zod schemas from SCHEMA.md — `nodeSchema`, `createNodeSchema`, `bitSchema`, `createBitSchema`, `chunkSchema`, `createChunkSchema` with all field validations, constraints, and defaults
  - Export inferred TypeScript types: `Node`, `CreateNode`, `Bit`, `CreateBit`, `Chunk`, `CreateChunk`
  - `src/types/index.ts`: Re-export all schema types. Add computed types: `AgingState` (`"fresh" | "stagnant" | "neglected"`), `UrgencyLevel` (`1 | 2 | 3 | null`), `Priority` (`"high" | "mid" | "low"`), `GridPosition` (`{ x: number; y: number }`), `BreadcrumbSegment` (`{ id: string; title: string; level: number }`)
- **Acceptance:** `pnpm tsc --noEmit` passes. All Zod schemas validate sample data. Types importable via `@/types` and `@/lib/db/schema`
- **Commit:** `feat: add Zod validation schemas and TypeScript types`

### Task 5: DataStore Abstraction + IndexedDB Implementation
- **Status:** `[x]`
- **Files:** `src/lib/db/datastore.ts`, `src/lib/db/indexeddb.ts`, `src/lib/constants.ts`
- **Dependencies:** Task 4
- **Actions:**
  - `src/lib/db/datastore.ts`: Define `DataStore` interface — CRUD for nodes, bits, chunks. Methods: `getNode`, `getNodes(parentId)`, `createNode`, `updateNode`, `softDeleteNode`, `restoreNode`, `hardDeleteNode`, `getBit`, `getBits(parentId)`, `createBit`, `updateBit`, `softDeleteBit`, `restoreBit`, `hardDeleteBit`, `getChunks(bitId)`, `createChunk`, `updateChunk`, `deleteChunk`, `getActiveGridContents(parentId)`, `getCalendarItems()`, `getTrashedItems()`, `searchAll(query)`, `getGridOccupancy(parentId)`, `promoteBitToNode(bitId)`
  - `src/lib/db/indexeddb.ts`: Dexie.js implementation. `class GridDODatabase extends Dexie` with 3 object stores. Configure all indexes from SCHEMA.md (compound indexes: `[parentId, deletedAt]`, `[parentId, order]`, `[parentId, status]`). Implement all interface methods. Zod validation on writes via `createNodeSchema.parse()` etc
  - `src/lib/constants.ts`: `GRID_COLS: 12`, `GRID_ROWS: 8`, `AGING_FRESH_DAYS: 5`, `AGING_STAGNANT_DAYS: 11`, `URGENCY_LEVEL_1_DAYS: 3`, `URGENCY_LEVEL_2_DAYS: 2`, `URGENCY_LEVEL_3_DAYS: 1`, `TRASH_RETENTION_DAYS: 30`
  - **Critical PRD constraint:** No component imports `dexie` or `DataStore` directly. Components use custom hooks (`src/hooks/`) for reads. Hooks are the only files that import `useLiveQuery`; DataStore write methods are called from hooks and event handlers only
- **Acceptance:** DataStore interface exports cleanly. IndexedDB implementation opens database and creates stores with correct indexes. Constants importable via `@/lib/constants`. `pnpm tsc --noEmit` passes
- **Commit:** `feat: add DataStore interface, IndexedDB implementation, and constants`

#### Phase 1 Notes

> **Scaffold non-empty dirs:** `create-next-app` refuses non-empty directories. Scaffold into a sibling temp dir (`../scaffold-tmp`), rsync over, delete temp.

> **shadcn init automation:** CLI flags don't cover style/base-color. Create `components.json` manually — the format is stable. Also manually install `class-variance-authority` after `shadcn add`.

> **Spec ambiguities break delegation:** Codex follows formulas literally. The `promoteBitToNode` level bug came from an ambiguous spec formula. Resolve contradictions in docs before delegating.

> **Stub correct algorithm shapes:** Even when deferring a utility (BFS), implement the same algorithm shape in the stub. A linear scan from (0,0) is not equivalent to BFS from the original position.

> **Full issue log:** `docs/issues/Issues_Phase_1.md`

---

## Phase 2: Core Logic

### Task 6: Pure Utility Functions
- **Status:** `[x]`
- **Files:** `src/lib/utils/bfs.ts`, `src/lib/utils/aging.ts`, `src/lib/utils/urgency.ts`, `src/lib/utils/completion.ts`
- **Dependencies:** Task 4 (types), Task 5 (constants)
- **Actions:**
  - `bfs.ts`: Export `findNearestEmptyCell(occupied: Set<string>, startX: number, startY: number): GridPosition | null`. BFS from start position across 12×8 grid. Returns first unoccupied cell or `null` if grid is full. Key format: `"x,y"`
  - `aging.ts`: Export `getAgingState(mtime: number): AgingState`. Compute days since mtime. Return: 0–5 = `"fresh"`, 6–11 = `"stagnant"`, 12+ = `"neglected"`. Export `getAgingSaturation(state: AgingState): number` returning `1`, `0.5`, `0.2` per DESIGN_TOKENS
  - `urgency.ts`: Export `getUrgencyLevel(deadline: number | null): UrgencyLevel`. Return `null` if no deadline or > 3 days away. Return `1` (3 days), `2` (2 days), `3` (1 day or D-day). Export `isPastDeadline(deadline: number | null): boolean`
  - `completion.ts`: Export `isNodeComplete(bits: Bit[]): boolean`. Returns `true` when `bits.length > 0` AND every bit has `status === "complete"`. Empty node = never complete
- **Acceptance:** All functions are pure — no side effects, no imports of DataStore or Dexie. Unit tests pass:
  - `bfs.test.ts`: finds nearest cell, handles full grid, wraps around edges
  - `aging.test.ts`: boundary values at 5/6/11/12 days
  - `urgency.test.ts`: null deadline, >3d, 3d/2d/1d/past
  - `completion.test.ts`: empty bits array, partial, all complete
- **Commit:** `feat: add pure utility functions for BFS, aging, urgency, and completion`

### Task 7: Zustand Stores
- **Status:** `[x]`
- **Files:** `src/stores/sidebar-store.ts`, `src/stores/edit-mode-store.ts`, `src/stores/search-store.ts`, `src/stores/calendar-store.ts`
- **Dependencies:** Task 1
- **Actions:**
  - `sidebar-store.ts`: State: `isOpen: boolean`. Actions: `toggle()`, `open()`, `close()`. Default: `isOpen: true`. Export `useSidebarStore`
  - `edit-mode-store.ts`: State: `isEditMode: boolean`. Actions: `toggle()`, `enable()`, `disable()`. Default: `isEditMode: false`. Export `useEditModeStore`
  - `search-store.ts`: State: `isOpen: boolean`, `query: string`. Actions: `setQuery(q)`, `open()`, `close()`, `toggle()`. Default: `isOpen: false`, `query: ""`. Export `useSearchStore`
  - `calendar-store.ts`: State: `drillDownPath: string[]`, `currentWeekStart: Date`, `currentMonth: Date`. Actions: `pushDrillDown(nodeId)`, `popDrillDown()`, `resetDrillDown()`, `navigateWeek(direction: 1 | -1)`, `navigateMonth(direction: 1 | -1)`. Export `useCalendarStore`
  - All stores use Zustand `create()` — no provider needed (SPEC decision #9)
- **Acceptance:** Each store exports a typed hook. State updates trigger re-renders only in consuming components. Stores importable via `@/stores/`
- **Commit:** `feat: add Zustand stores for sidebar, edit mode, search, and calendar`

### Task 8: Animation Variant Definitions
- **Status:** `[x]`
- **Files:** `src/lib/animations/grid.ts`, `src/lib/animations/calendar.ts`, `src/lib/animations/layout.ts`
- **Dependencies:** Task 1
- **Actions:**
  - `grid.ts`: Export Motion variants — `sinkingVariants` (exit: translateY 8px, scale 0.95, opacity 0.5, duration 0.5s), `taskTossVariants` (spring with overshoot for drag-into-Node), `magnetSnapTransition` (spring: damping ~15, stiffness ~200), `vignetteVariants` (opacity keyed by level: l0=0, l1=0.15, l2=0.3, l3=0.45)
  - `calendar.ts`: Export `dayColumnExpandVariants` (layout animation + vignette), `magnetSnapCalendarTransition` (spring for day column snap)
  - `layout.ts`: Export `sidebarVariants` (width transition for fold/unfold), `searchOverlayVariants` (fade + scale entry/exit), `bitDetailPopupVariants` (fade + slide-up entry, slide-down + fade exit)
- **Acceptance:** All variants export as plain objects — no runtime side effects. Importable via `@/lib/animations/`
- **Commit:** `feat: add Motion animation variants for grid, calendar, and layout`

### Task 9: Data Hooks — Grid + Bit Detail
- **Status:** `[x]`
- **Files:** `src/hooks/use-grid-data.ts`, `src/hooks/use-bit-detail.ts`
- **Dependencies:** Task 5 (DataStore)
- **Actions:**
  - `use-grid-data.ts`: Export `useGridData(parentId: string | null)`. The reactive subscription layer — internally uses Dexie `useLiveQuery` (v1 implementation detail, replaceable for v2 cloud sync). Returns `{ nodes: Node[], bits: Bit[], isLoading: boolean }`. Queries use compound index `[parentId, deletedAt]`
  - `use-bit-detail.ts`: Export `useBitDetail()`. Reads `?bit=` query param from URL via `useSearchParams`. When present, fetches Bit + ordered Chunks via the reactive layer. Returns `{ bit: Bit | null, chunks: Chunk[], isOpen: boolean, close: () => void }`. `close()` removes `?bit` param via `router.replace`
  - **Abstraction boundary:** Components import these hooks only — never DataStore or Dexie directly. The hooks are the reactive abstraction; DataStore is the CRUD abstraction. Both are replaceable independently for v2
- **Acceptance:** Grid data auto-updates when IndexedDB changes. Bit detail state driven by URL query param. No manual cache invalidation. No component imports `dexie` — only these hooks do
- **Commit:** `feat: add reactive data hooks for grid and bit detail`

### Task 10: Data Hooks — Calendar, Search + DnD
- **Status:** `[x]`
- **Files:** `src/hooks/use-calendar-data.ts`, `src/hooks/use-search.ts`, `src/hooks/use-dnd.ts`
- **Dependencies:** Task 5 (DataStore), Task 7 (stores)
- **Actions:**
  - `use-calendar-data.ts`: Export `useCalendarData()`. Reactive layer (internally `useLiveQuery`). Fetches: active Nodes with deadlines + Bits with deadlines + Chunks with times. Returns `{ weeklyItems(weekStart: Date): Map<string, (Node | Bit | Chunk)[]>, monthlyItems(month: Date): Map<string, (Node | Bit | Chunk)[]>, poolItems: (Bit | Chunk)[], isLoading: boolean }`. Schedule collections include all three types; `poolItems` is `Bit | Chunk` only (Nodes live in the separate Node Pool component). Pool sort: deadline items first (by priority rank → time), no-deadline below
  - `use-search.ts`: Export `useSearch()`. Reads query from `useSearchStore`. Client-side filters all active nodes, bits, chunks by title (case-insensitive substring). Returns `{ results: SearchResult[], isLoading: boolean }`. `SearchResult`: `{ id, type, title, parentPath, deadline }`
  - `use-dnd.ts`: Export `useDnd()`. Coordinates @dnd-kit sensors + collision detection. Returns `{ sensors, handleDragStart, handleDragEnd, handleDragOver, activeItem }`. Handles: grid reposition, drag-into-Node, calendar scheduling, chunk timeline reorder, drag-to-breadcrumb
- **Acceptance:** Calendar data groups items by day/date. Search filters in real-time. DnD hook provides unified drag coordination across all contexts
- **Commit:** `feat: add hooks for calendar data, search, and drag-and-drop`

#### Phase 2 Notes

> **Dexie v4 reactive pattern:** `useLiveQuery` does not exist in Dexie v4. Use `liveQuery` from `dexie` with `useState` + `useEffect` subscribe/unsubscribe. The SPEC and plan references to `useLiveQuery` are v3 conventions — ignore them. `dexie-react-hooks` is not installed and should not be added.

> **URL query param removal:** When removing a specific param (e.g., `?bit=`), use `URLSearchParams.delete(key)` and reconstruct the URL. Never use bare `router.replace(pathname)` — it silently wipes all other params.

> **DnD hook is infrastructure, not behavior:** `useDnd()` in Phase 2 provides sensors, `activeItem` tracking, and handler signatures only. Drag dispatch logic (grid reposition, drag-into-Node, calendar scheduling, chunk reorder, breadcrumb drop) requires UI drop zone components built in Phases 3–5. TODO comments in `handleDragEnd` map each behavior to its owning phase.

> **Full issue log:** `docs/issues/Issues_Phase_2.md`

---

## Phase 3: Layout Shell + Level 0 Grid

### Task 11: Client Providers Wrapper
- **Status:** `[x]`
- **Files:** `src/app/providers.tsx`, `src/app/layout.tsx`
- **Dependencies:** Task 3 (tokens), Task 5 (DataStore)
- **Actions:**
  - `providers.tsx`: `"use client"` wrapping children with: `ThemeProvider` (from `next-themes`, `attribute="class"`, `defaultTheme="system"`), `DndContext` (from `@dnd-kit/core`), DataStore provider (React context providing the IndexedDB `DataStore` instance). Zustand stores require no provider (SPEC decision #9)
  - `layout.tsx`: Update root layout. Import `GeistSans` and `GeistMono` from `geist/font`. Apply font variables to `<html className={...}>`. Wrap `{children}` in `<Providers>`. Set `<body className="font-sans">`. Metadata: `title: "GridDO"`, `description: "Local-first task management"`
- **Acceptance:** ThemeProvider toggles `.dark` class on `<html>`. DndContext available to all pages. DataStore accessible via context hook. Fonts render correctly
- **Commit:** `feat: add client providers and root layout with font loading`

### Task 12: Sidebar + Theme Toggle
- **Status:** `[x]`
- **Files:** `src/components/layout/sidebar.tsx`, `src/components/layout/theme-toggle.tsx`
- **Dependencies:** Task 7 (sidebar-store), Task 2 (shadcn)
- **Actions:**
  - `sidebar.tsx`: `"use client"`. Fixed left sidebar. Uses `useSidebarStore`. Classes per DESIGN_TOKENS: `fixed left-0 top-0 h-full bg-background border-r border-border flex flex-col items-center gap-1 py-4 px-2 z-40 transition-all`. Width: `w-sidebar` (open) / `w-sidebar-collapsed` (closed). Sidebar buttons with Lucide icons: `Plus` (+), `Pencil` (edit mode), `Search`, Theme toggle, `Calendar` (with urgency dot), `Trash` (Level 0 only). Fold/unfold button at bottom
  - `theme-toggle.tsx`: `"use client"`. Uses `useTheme()` from `next-themes` with `resolvedTheme` for correct icon. Toggles between `Sun`/`Moon` Lucide icons
  - Urgency notification dot on Calendar: `absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full` with `bg-urgency-{1,2,3}` based on global urgency query
- **Acceptance:** Sidebar folds/unfolds. Theme toggle switches light/dark. Urgency dot appears on Calendar button. Width matches `--sidebar-width` tokens
- **Commit:** `feat: add foldable sidebar with theme toggle and urgency indicator`

### Task 13: Grid View + Grid Cell
- **Status:** `[x]`
- **Files:** `src/components/grid/grid-view.tsx`, `src/components/grid/grid-cell.tsx`
- **Dependencies:** Task 9 (use-grid-data), Task 7 (edit-mode-store)
- **Actions:**
  - `grid-view.tsx`: `"use client"`. Props: `parentId: string | null`, `level: number`. Uses `useGridData(parentId)`. Renders 12×8 CSS Grid: `grid grid-cols-12 gap-[var(--grid-gap)]`. Maps nodes and bits onto cells by `(x, y)`. Empty cells render `GridCell` in edit mode. Grid line opacity per level: `--grid-line-opacity-l{n}` tokens
  - `grid-cell.tsx`: Container for a single grid position. Props: `x, y, isEditMode, isEmpty, children`. Classes per DESIGN_TOKENS: `relative rounded-md transition-all`. Edit mode adds: `border-2 border-dashed border-muted-foreground/30`. Empty + edit: centered `+` button (`text-muted-foreground/50 hover:text-muted-foreground`)
- **Acceptance:** 12×8 grid renders. Grid lines at correct opacity per level. Empty cells show `+` in edit mode. Items at correct `(x, y)` positions
- **Commit:** `feat: add grid view and grid cell components`

### Task 14: Node Card
- **Status:** `[x]`
- **Files:** `src/components/grid/node-card.tsx`
- **Dependencies:** Task 4 (types), Task 6 (aging, urgency)
- **Actions:**
  - `node-card.tsx`: `"use client"`. Mobile app icon design per DESIGN_TOKENS Component Quick Reference. Props: `node: Node`, `onClick: () => void`
    - Outer: `flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-pointer transition-transform hover:scale-105`
    - Icon container: `flex items-center justify-center w-14 h-14 rounded-2xl` with `style={{ backgroundColor: node.color }}`
    - Lucide icon: `w-7 h-7 text-white` — dynamically resolved from `node.icon` string
    - Title: `text-xs font-medium text-foreground truncate max-w-[5rem]`
  - Aging: apply `filter: saturate(...)` from `getAgingSaturation(getAgingState(node.mtime))`
  - Urgency badge on icon corner when child Bits have approaching deadlines
  - Edit mode: add `animate-jiggle` class + delete button overlay
- **Acceptance:** Node renders as icon + label. Color from `node.color`. Aging desaturates. Click navigates to `/grid/[nodeId]`
- **Commit:** `feat: add node card with aging and urgency indicators`

### Task 15: Level 0 Page + Onboarding
- **Status:** `[x]`
- **Files:** `src/app/page.tsx`, `src/components/grid/onboarding-hints.tsx`, `src/components/layout/level-0-shell.tsx`, `src/components/grid/create-node-dialog.tsx`, `src/lib/constants/node-icons.ts`
- **Dependencies:** Task 11, Task 12, Task 13, Task 14
- **Actions:**
  - `page.tsx`: Thin server component shell — delegates to `Level0Shell`
  - `level-0-shell.tsx`: `"use client"`. Owns creation state (dialog open/close, placement context, error). Renders Sidebar, GridView, OnboardingHints, CreateNodeDialog. Wires both creation entry points to the shared dialog.
  - `create-node-dialog.tsx`: shadcn Dialog. Fields: title (required), icon picker (25 Lucide icons, `role="radiogroup"`), color (native `input type=color`). Defaults: Folder / #308ce8. Placement resolved in shell via BFS before `createNode()` call.
  - `onboarding-hints.tsx`: `"use client"`. Ghost placeholders. Disappear after first node creation (reactive via `useGridData` hook).
  - `node-icons.ts`: Shared icon constants (`NODE_ICON_MAP`, `NODE_ICON_NAMES`, `DEFAULT_ICON`, `DEFAULT_COLOR_HEX`) used by both NodeCard and CreateNodeDialog.
- **Creation flow clarification:**
  - Level 0 `+` uses a **Create Node dialog** (not instant creation — user selects title, icon, color)
  - Sidebar `+` and empty-cell `+` share the same dialog; placement context differs only in BFS origin
  - Sidebar placement: BFS from `(0, 0)`
  - Empty-cell placement: BFS from `(clickedX, clickedY)` — returns clicked cell if empty, nearest fallback if occupied
  - Level 1–2 Node/Bit menu and Level 3 direct Bit creation remain out of scope for this phase
- **Acceptance:** `/` renders Level 0 grid with sidebar. First visit shows ghost hints. Creating first node (via sidebar `+` or cell `+`) opens dialog, places node, and removes hints. No vignette.
- **Commit:** `feat: wire Level 0 node creation — dialog, shell, shared icon constants`

#### Phase 3 Notes

> **Plan status vs. implementation:** Tasks 11–14 were committed in a single phase commit before statuses were updated. The `EXECUTION_PLAN.md` showed `[ ]` even though the code existed. Always update task statuses in the same session that produces the commit — don't let them drift.

> **Level 0 creation was a Phase 3 omission:** The sidebar `+` and empty-cell `+` were wired to `noop`. The execution plan acceptance criteria said "creating first node removes hints" but never specified the creation UI. Treat any acceptance criterion that implies user action as requiring a complete UI path — not just a data layer.

> **`typecheck` script does not exist:** There is no separate `pnpm typecheck` command. TypeScript checking runs as part of `pnpm build` (`next build`). The pre-PR gate is `pnpm lint && pnpm build`.

> **Lint has 2 pre-existing warnings:** `src/hooks/use-dnd.ts` lines 46 and 55 have `_event is defined but never used`. These are not errors and are not introduced by Phase 3. Lint exits 0. Correct phrasing: "lint passes with 2 pre-existing warnings."

> **Radiogroup keyboard navigation deferred:** The icon picker uses `role="radiogroup"` + `role="radio"` semantics but individual tab stops rather than the ARIA-standard single-tab-stop + arrow-key navigation. Full keyboard implementation requires either custom `onKeyDown` arrow handlers or adopting the Radix `RadioGroup` primitive. Deferred to a future a11y pass.

> **DataStore context exists but hooks use direct imports:** `providers.tsx` exports `useDataStore()` with a full context implementation. However, all existing hooks (`use-grid-data`, `use-search`, `use-bit-detail`) import `indexedDBStore` directly. New write paths (e.g., `level-0-shell.tsx`) should follow the existing direct-import pattern for consistency until a deliberate migration is planned.

> **Full issue log:** `docs/issues/Issues_Phase_3.md`

---

## Phase 4: Grid Navigation + Bit Cards

### Task 16: Breadcrumbs
- **Status:** `[x]`
- **Files:** `src/components/layout/breadcrumbs.tsx`
- **Dependencies:** Task 5 (DataStore)
- **Actions:**
  - `breadcrumbs.tsx`: `"use client"`. Props: `nodeId: string`. Fetches parent chain from DataStore. Structure per DESIGN_TOKENS:
    - Nav: `flex flex-col gap-0.5 h-breadcrumb px-4 justify-center`
    - Path: `flex items-center gap-1.5 text-sm`
    - "Home" button: `text-muted-foreground hover:text-foreground transition-colors` → navigates to `/`
    - Chevron: `ChevronRight` `w-3.5 h-3.5 text-muted-foreground`
    - Segment: `text-muted-foreground hover:text-foreground transition-colors`. Last segment: `text-foreground font-medium`
    - Description subtitle: `text-xs text-muted-foreground truncate pl-0.5` (when node has description)
  - Click segment → navigate to `/grid/[nodeId]` or `/` for Home
  - Drop zone structure present; active drag highlighting deferred to Task 34 (DnD Grid Interactions)
- **Acceptance:** Breadcrumbs show full path. Click navigates. Last segment bold. Description subtitle when present.
- **Commit:** `feat: add breadcrumbs with navigation and drag-to-breadcrumb drop zone`

### Task 17: Bit Card
- **Status:** `[x]`
- **Files:** `src/components/grid/bit-card.tsx`
- **Dependencies:** Task 4 (types), Task 6 (aging, urgency)
- **Actions:**
  - `bit-card.tsx`: `"use client"`. Horizontal rectangle per DESIGN_TOKENS. Props: `bit: Bit`, `parentColor: string`, `chunkStats: { completed: number; total: number }`, `onClick: () => void`
    - Outer: `flex items-center gap-3 px-4 py-3 rounded-lg bg-card shadow-sm border border-border`
    - Color accent: `w-1 self-stretch rounded-full` with `style={{ backgroundColor: parentColor }}` (dark mode visible, light mode bg tint)
    - Icon: `flex-shrink-0` → Lucide icon `w-5 h-5 text-muted-foreground`
    - Content: `flex-1 min-w-0` → title `text-sm font-medium text-foreground truncate`, deadline `text-xs text-muted-foreground mt-0.5`
    - Priority badge: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium` with `bg-priority-{high,mid,low}-bg text-priority-{high,mid,low}`
    - Progress bar (chunks > 0): track `w-16 h-1.5 rounded-full bg-secondary overflow-hidden`, fill `h-full rounded-full bg-primary transition-all`
  - Aging saturation filter. Urgency blink: `animate-urgency-blink-{1,2,3}`
  - Past deadline: blur + overlay pattern per DESIGN_TOKENS ("Done?" with check/x buttons)
  - Click → appends `?bit=[bitId]` to URL
- **Acceptance:** Bit renders as horizontal card. Priority badge correct color. Progress reflects chunks. Urgency blinks near deadline. Past-deadline shows blur+overlay
- **Commit:** `feat: add bit card with priority, progress, urgency, and past-deadline overlay`

### Task 18: Level 1-3 Grid Page
- **Status:** `[x]`
- **Files:** `src/app/grid/[nodeId]/page.tsx`
- **Dependencies:** Task 13, Task 16, Task 17
- **Actions:**
  - `page.tsx`: Server component shell. Extracts `nodeId` from params. Renders client grid with `parentId={nodeId}`. Layout: sidebar + breadcrumbs bar at top + grid view
  - Level detection: fetch node → pass `node.level + 1` to GridView (display level is one deeper than parent)
  - Level 1-2: Nodes (left zone ~5-6 cols) + Bits (right zone ~6-7 cols). Soft guide — items can go anywhere
  - Level 3 (`node.level === 2`): Bits only, full grid. Block Node creation. `+` creates Bit directly
  - Level 1 first visit: ghost hints for 2-way split ("Nodes here" left, "Bits here" right)
- **Acceptance:** `/grid/[nodeId]` renders grid at correct level. Breadcrumbs show path. Level 3 blocks Node creation. Browser back navigates to parent
- **Commit:** `feat: add Level 1-3 grid page with breadcrumbs and level constraints`

### Task 19: Vignette + Depth Effects
- **Status:** `[x]`
- **Files:** `src/components/grid/grid-view.tsx` (update), `src/lib/animations/grid.ts` (update)
- **Dependencies:** Task 13, Task 8
- **Actions:**
  - Update `grid-view.tsx`: Add vignette overlay element. Inner shadow via `box-shadow: inset 0 0 120px rgba(0,0,0, intensity)`. Intensity from `--vignette-intensity-l{level}` tokens: l0=0, l1=0.15, l2=0.3, l3=0.45. Animate opacity via Motion on level change
  - Grid line density: set CSS variable `--grid-line-opacity` per level (l0=0.15, l1=0.12, l2=0.08, l3=0.05)
  - Depth transition animation on navigation between levels
- **Acceptance:** No vignette at Level 0. Vignette visible at Level 1+ with increasing intensity. Grid lines thinner with depth. Transition plays on level change
- **Commit:** `feat: add vignette and grid depth effects per hierarchy level`

### Task 20: Edit Mode Overlay
- **Status:** `[x]`
- **Files:** `src/components/grid/edit-mode-overlay.tsx`
- **Dependencies:** Task 7 (edit-mode-store), Task 13
- **Actions:**
  - `edit-mode-overlay.tsx`: `"use client"`. Uses `useEditModeStore`. When edit mode active:
    - All cards get `animate-jiggle` class (`jiggle 0.3s ease-in-out infinite` from Tailwind keyframes)
    - Grid cells get `border-2 border-dashed border-muted-foreground/30`
    - Empty cells show `+` button for item creation
    - Each item gets delete button overlay (top-right corner, `bg-destructive text-destructive-foreground` rounded)
    - Drag-to-reposition deferred to Task 34 (DnD Grid Interactions)
  - Toggle via sidebar Pencil button or keyboard shortcut
  - Exit on navigation or ESC key
- **Acceptance:** Pencil toggles edit mode. Cards jiggle. Delete overlays appear on all item types. Dashed cell borders visible. ESC exits. Drag reposition owned by Task 34.
- **Commit:** `feat: add edit mode with jiggle animation and delete overlays`

#### Phase 4 Notes

> **Always add a visually-hidden h1 per page:** `node-grid-shell.tsx` was missing a page heading for screen readers. Every major page shell needs `<h1 className="sr-only">{title}</h1>` even when the visual design omits a visible heading.

> **BitCard in GridCell requires a flex wrapper:** BitCard placed directly inside GridCell is not vertically centered. Wrap with `<div className="flex h-full items-center">` to fill the cell and center the card.

> **Hide overflow scrollbars with Tailwind arbitrary values:** Long breadcrumb paths show a native browser scrollbar. Suppress with `[scrollbar-width:none] [&::-webkit-scrollbar]:hidden` on the overflow-x-auto container — covers both Firefox and WebKit.

> **execute-next-phase skill had a bug during this phase:** The skill was updated post-execution. If planning or task scoping felt off during this phase, that's the likely cause. Verify the skill is current before starting the next phase.

> **At leaf level, switch creation type — never block it:** The `isLeafLevel` guard was applied too broadly, hiding all creation affordances instead of routing `+` to `CreateBitDialog`. Any leaf-level guard on a creation entry point should substitute Bit creation, not remove the affordance entirely.

> **Verify acceptance criteria against running code, not code existence:** Tasks 17, 18, and 20 were marked complete with code committed, but several acceptance items were undelivered (missing overlay buttons, missing delete overlay on BitCard, leaf-level creation blocked). Code existing ≠ acceptance criteria met. Check each acceptance line against the live behavior before closing.

> **Separate edit-mode affordances from DnD interactions across phases:** Task 20 = visual affordances (jiggle, dashed cells, delete overlays). Task 34 = DnD interaction logic (drag reposition, drag-into-Node, drag-to-breadcrumb). Never let acceptance criteria from one bleed into the other. Resolve ownership before closing any task that touches shared behavior.

> **Full issue log:** `docs/issues/Issues_Phase_4.md`

---

## Phase 4.5: Design Alignment

> **Context:** Design archaeology against `docs/design-system-preview.html` revealed accumulated drift between the canonical design reference and runtime code. This phase closes that drift before Phase 5 builds on top of it.
> **Branch:** `phase-4/grid-navigation-bit-cards` (same branch, separate tracking unit)
> **Audit source:** `docs/design-archaeology/DESIGN_AUDIT.md`

### Task A: Foundation Token Alignment

- **Status:** `[x]`
- **Files:** `src/app/globals.css`, `src/lib/utils/aging.ts`, `src/components/grid/bit-card.tsx`, `src/components/grid/node-card.tsx`, `src/lib/utils/aging.test.ts`, `src/components/grid/bit-card.test.tsx`
- **Actions:**
  - `globals.css` — `:root`:
    - Add `--page-bg: hsl(38 28% 91%)` (warm beige body background)
  - `globals.css` — `@theme inline`:
    - Add `--color-page-bg: hsl(var(--page-bg))` so `bg-page-bg` utility is available
  - `globals.css` — `@layer base`:
    - Change `body` from `@apply bg-background` to `background: hsl(var(--page-bg))` in light mode. Dark mode body background stays `--background`; add a `.dark body` override to keep dark background
  - `globals.css` — `.dark`:
    - Change `--card: 240 6% 8%` (elevated surface, distinct from `--background`)
    - Change `--popover: 240 6% 8%` (same elevation as card)
    - Update aging token names: rename `--aging-fresh-saturation` → `--aging-fresh-filter`, etc. with compound values: fresh = `saturate(1)`, stagnant = `saturate(0.5) brightness(0.9)`, neglected = `saturate(0.2) brightness(0.75)`
  - `aging.ts`:
    - Rename `getAgingSaturation(state)` → `getAgingFilter(state): string`
    - Return full CSS filter strings: `"saturate(1)"`, `"saturate(0.5) brightness(0.9)"`, `"saturate(0.2) brightness(0.75)"`
    - Export old name as deprecated alias if needed for test migration, or update all callsites directly
  - `bit-card.tsx` + `node-card.tsx`:
    - Update import: `getAgingFilter` instead of `getAgingSaturation`
    - Change `style={{ filter: \`saturate(${saturation})\` }}` → `style={{ filter: getAgingFilter(getAgingState(...)) }}`
  - `aging.test.ts` + `bit-card.test.tsx`:
    - Update assertions to expect full filter strings (e.g. `"saturate(0.5) brightness(0.9)"` not `"saturate(0.5)"`)
- **Acceptance:**
  - `pnpm test` passes — aging tests assert full filter strings; bit-card aging test matches new signature
  - `pnpm build` passes — no TypeScript errors from renamed export
  - Dark mode: BitCard and NodeCard backgrounds are visibly elevated against page background
  - Light mode: body background is warm beige (`hsl(38 28% 91%)`), not pure white
  - Stagnant/neglected items visibly darker (brightness applied), not just desaturated
- **Commit:** `fix: foundation token alignment — page-bg, dark card elevation, aging filter`

### Task B: BitCard Design Alignment

- **Status:** `[x]`
- **Files:** `src/components/grid/bit-card.tsx`, `src/components/grid/bit-card.test.tsx`
- **Dependencies:** Task A
- **Actions:**
  - **Restructure to two-row layout** per `docs/design-archaeology/DESIGN_AUDIT.md` section 5:
    - Row 1 (top): color accent bar + icon + title + meta/deadline + priority badge
    - Row 2 (bottom, conditional on `chunkStats.total > 0`): progress bar (`flex: 0 0 80%`, not `w-16`) + chunk count label
    - Card padding: `py-[10px] pr-[14px] pl-[12px]` to match `10px 14px 10px 12px` spec
    - Card border-radius: `rounded-[10px]` (spec is `var(--radius)` = 10px; `rounded-lg` = 8px, off by 2px)
  - **Priority badge** per audit section 6:
    - Font size: `text-[10px]` (not `text-xs` = 12px)
    - Font weight: `font-semibold` (600, not `font-medium` = 500)
    - Text transform: `uppercase`
    - Letter spacing: `tracking-[0.05em]`
    - Padding: `px-[7px] py-[2px]`
  - **Past-deadline overlay** per audit section 8:
    - "Done?" text: `text-[13px] font-semibold text-foreground` (not `text-xs font-medium text-muted-foreground`)
    - Action buttons: `w-7 h-7 rounded-full` (28px, not `h-5 w-5` = 20px)
    - Cancel button: `bg-secondary text-secondary-foreground` (not `bg-muted text-muted-foreground`)
- **Acceptance:**
  - BitCard visually matches the two-row layout in `docs/design-archaeology/screenshot-light.png`
  - Priority badge is uppercase with correct size and weight
  - Past-deadline overlay buttons are 28px circles with correct tokens
  - `pnpm build` passes
- **Commit:** `fix: BitCard design alignment — two-row layout, badge typography, overlay`

#### Phase 4.5 Notes

> **Aging tokens in globals.css were dead code:** `--aging-fresh-saturation` etc. were never consumed by components. Aging was hardcoded in `aging.ts`. Updating only the CSS tokens would have had zero visual effect. Always trace the full call path before categorising a change as "token-only."

> **Explicitly deferred (known remaining gaps):** NodeCard icon container size (52px vs 56px) and Sidebar button/icon sizing are minor visual discrepancies. Deferred to Phase 7 Polish — not structural, "visually subtle" per audit verdict.

> **Full audit:** `docs/design-archaeology/DESIGN_AUDIT.md`

---

## Phase 5: Bit Detail + Application Hooks

### Task 21: Bit Detail Popup
- **Status:** `[ ]`
- **Files:** `src/components/bit-detail/bit-detail-popup.tsx`
- **Dependencies:** Task 9 (use-bit-detail), Task 2 (shadcn dialog)
- **Actions:**
  - `bit-detail-popup.tsx`: `"use client"`. Uses `useBitDetail()`. Centered modal over blurred background. Motion entry via `bitDetailPopupVariants`
    - Backdrop: `fixed inset-0 bg-background/80 backdrop-blur-sm z-50`
    - Container: `max-w-bit-detail` (640px), `max-h-[85vh]` (from `--bit-detail-max-height`), scrollable
    - Header: editable title input, icon selector (Lucide icon picker), deadline date picker, priority toggle (cycles high→mid→low→null on click)
    - Description: editable textarea
    - mtime label: `text-xs text-muted-foreground` — "Last updated: X days ago" via `date-fns formatDistanceToNow`
    - Chunk pool section (Task 23)
    - Timeline section (Task 22)
  - Empty state: timeline structure visible (vertical line, dot placeholder) + "Add a step" CTA button
  - Close: click backdrop, ESC key, or browser back (removes `?bit` param)
- **Acceptance:** `?bit=[bitId]` opens popup with fade+slide. Title/description editable inline. Priority cycles. Close via backdrop/ESC/back. mtime shows relative time
- **Commit:** `feat: add bit detail popup with editable fields and priority toggle`

### Task 22: Chunk Timeline + Chunk Item
- **Status:** `[ ]`
- **Files:** `src/components/bit-detail/chunk-timeline.tsx`, `src/components/bit-detail/chunk-item.tsx`
- **Dependencies:** Task 21, Task 4 (types)
- **Actions:**
  - `chunk-timeline.tsx`: Vertical timeline inside bit detail popup. Structure per DESIGN_TOKENS:
    - Container: `relative pl-8`
    - Vertical connecting line: `absolute left-3.5 top-0 bottom-0 w-0.5 bg-border`
    - Each chunk renders as `ChunkItem`
    - Drag-to-reorder via `@dnd-kit/sortable` — updates `order` field
    - Deadline marker at bottom: clock icon aligned vertically with dots above
    - Progress ring: circular SVG showing `completedChunks / totalChunks`
  - `chunk-item.tsx`: Single chunk in timeline. Props: `chunk: Chunk`, `onToggle`, `onEdit`, `onDelete`
    - Wrapper: `relative flex items-start gap-3 pb-6`
    - Dot: `relative z-10 w-3 h-3 rounded-full border-2 border-background mt-1.5`. Complete: `bg-primary`. Incomplete: `bg-muted-foreground/30`
    - Content card: bordered container with title `text-sm`, completed adds `line-through text-muted-foreground`
    - Time: `text-xs text-muted-foreground mt-0.5`
  - Ordering: chunks with `time` sort by time value; chunks without `time` follow `order` field
- **Acceptance:** Timeline renders vertically with connecting line and dots. Complete chunks: filled dot + strikethrough. Drag reorders. Deadline marker at bottom. Progress ring reflects ratio
- **Commit:** `feat: add chunk timeline with reorderable items, deadline marker, and progress ring`

### Task 23: Chunk Pool
- **Status:** `[ ]`
- **Files:** `src/components/bit-detail/chunk-pool.tsx`
- **Dependencies:** Task 22, Task 5 (DataStore)
- **Actions:**
  - `chunk-pool.tsx`: `"use client"`. Section inside bit detail popup above the timeline. Lists unscheduled chunks (no `time` set)
    - "Add a step" button to create new chunk via DataStore (`order = chunks.length`)
    - Inline editing: click chunk title to edit in place
    - Delete: remove button per chunk — hard delete (chunks have no soft-delete per SCHEMA)
    - Drag from pool onto timeline to set order position
  - Validates via `createChunkSchema` on creation
  - Chunk activity triggers mtime cascade on parent Bit (handled by Hook 1 in Task 24)
- **Acceptance:** Can add new chunks inline. Edit title by clicking. Delete removes permanently. Drag to timeline sets position
- **Commit:** `feat: add chunk pool with inline create, edit, delete, and drag-to-timeline`

### Task 24: Core Application Hooks
- **Status:** `[ ]`
- **Files:** `src/lib/db/indexeddb.ts` (update)
- **Dependencies:** Task 5 (DataStore), Task 6 (utilities)
- **Actions:**
  - Implement inside DataStore write methods (enforced at data layer, not in components):
  - **Hook 1 — mtime cascade:** Per SCHEMA.md table. Chunk changes cascade `mtime = Date.now()` to parent Bit AND parent Node. Bit changes cascade to parent Node. Does NOT cascade on open/view or grid reposition
  - **Hook 2 — Deadline hierarchy:** `child.deadline <= parent.deadline`. Block violation and return conflict info for UI modal ("Child cannot exceed parent's deadline. Update parent too?"). When parent deadline shortened: find conflicting children, return list for blur+overlay
  - **Hook 3 — Bit auto-completion:** On chunk status → `"complete"`, check all sibling chunks. All complete → `bit.status = "complete"`. Reverse: chunk uncompleted + bit was complete → `bit.status = "active"`. Both directions cascade mtime
  - **Hook 8 — Grid cell uniqueness:** Before insert/move, query active items at `(parentId, x, y)`. If occupied → reject or trigger BFS auto-placement
- **Acceptance:** Unit tests pass:
  - `mtime-cascade.test.ts`: chunk complete → parent Bit mtime updated → parent Node mtime updated; grid reposition does NOT update mtime
  - `deadline-hierarchy.test.ts`: child deadline past parent → blocked with conflict info; parent shortened → conflicting children identified
  - `auto-completion.test.ts`: last chunk completed → bit status flips to "complete"; chunk uncompleted → bit reverts to "active"
  - `grid-uniqueness.test.ts`: insert at occupied cell → rejected; BFS fallback finds nearest empty
- **Commit:** `feat: implement mtime cascade, deadline hierarchy, auto-completion, and grid uniqueness hooks`

### Task 25: Bit-to-Node Promotion
- **Status:** `[ ]`
- **Files:** `src/lib/db/indexeddb.ts` (update)
- **Dependencies:** Task 24
- **Actions:**
  - Implement Hook 9 from SCHEMA.md as `promoteBitToNode(bitId)` on DataStore:
    1. Create new Node: copy Bit's `title`, `icon`, `deadline`, `description`. Assign default `color`. Set `level = parentNode.level` (same grid level)
    2. For each Chunk: create new Bit inside new Node. Map `chunk.title → bit.title`, `chunk.time → bit.deadline`, `chunk.timeAllDay → bit.deadlineAllDay`. Auto-place via BFS
    3. Delete original Bit and all its Chunks
  - Surface in UI: context menu or edit mode action on Bit cards
- **Acceptance:** Unit tests pass:
  - `promotion.test.ts`: Bit with 3 chunks → new Node created with 3 child Bits; original Bit+Chunks deleted; child Bit deadlines match chunk times; BFS places children on grid
- **Commit:** `feat: implement bit-to-node promotion with chunk-to-bit conversion`

---

## Phase 6: Calendar Views

### Task 26: Calendar Layout + Node Pool
- **Status:** `[ ]`
- **Files:** `src/app/calendar/layout.tsx`, `src/components/calendar/node-pool.tsx`
- **Dependencies:** Task 5, Task 7 (calendar-store)
- **Actions:**
  - `layout.tsx`: Shared layout for `/calendar/weekly` and `/calendar/monthly`. Two-panel: left panel `w-calendar-pool` (288px, `--calendar-pool-width`) + right content area (`{children}`). Left panel split: Node pool top (60%, `--calendar-node-pool-ratio`) + Items pool bottom (40%)
  - `node-pool.tsx`: `"use client"`. Top section of left panel. Uses `useCalendarStore` for drill-down
    - Level 0 Nodes: icon only (tooltip on hover for title)
    - Click Node → drill down: show sub-Nodes (with `>` chevron) + Bits inside
    - Back arrow `<` to navigate up drill-down stack (`popDrillDown()`)
    - Search input within pool to filter items
    - Nodes and Bits draggable to the schedule (DnD source)
- **Acceptance:** Calendar layout renders two-panel at correct widths. Node pool shows Level 0 icons. Drill-down navigates into Nodes. Search filters pool
- **Commit:** `feat: add calendar layout with node pool and drill-down navigation`

### Task 27: Calendar:Weekly Page + Day Columns
- **Status:** `[ ]`
- **Files:** `src/app/calendar/weekly/page.tsx`, `src/components/calendar/day-column.tsx`
- **Dependencies:** Task 26, Task 10 (use-calendar-data)
- **Actions:**
  - `weekly/page.tsx`: `"use client"`. Right panel: 7 day columns (Mon–Sun). Uses `useCalendarData()` with `weeklyItems(weekStart)`. Week navigation arrows + current week label. Uses `useCalendarStore` for `currentWeekStart`
  - `day-column.tsx`: Single vertical day column. Props: `date: Date`, `items: (Node | Bit | Chunk)[]`
    - Min width: `--calendar-day-min-width` (128px). Tall and scrollable
    - Empty: "Drop items here" placeholder
    - 1 item: standard Bit card (or Node icon for Nodes with deadlines)
    - 2+ items: compact list (Task 28)
    - No-time items at top. Timed items below, sorted earliest → latest
    - Drop zone by item type: Bit → `DataStore.updateBit({ deadline: date })`, Node → `DataStore.updateNode({ deadline: date })`, Chunk → `DataStore.updateChunk({ time: date })`
    - Overflow `+N more`: click → column expands vertically with Motion layout animation + vignette, hiding adjacent columns
    - Collapse: ESC or click non-item area
- **Acceptance:** 7 day columns render. Items on correct days. Drop sets deadline. Overflow expands/collapses. Week navigation works
- **Commit:** `feat: add weekly calendar page with day columns and drag scheduling`

### Task 28: Compact Bit + Items Pool
- **Status:** `[ ]`
- **Files:** `src/components/calendar/compact-bit-item.tsx`, `src/components/calendar/items-pool.tsx`
- **Dependencies:** Task 27, Task 10 (use-calendar-data)
- **Actions:**
  - `compact-bit-item.tsx`: Compact design for 2+ items in a day column. Per DESIGN_TOKENS:
    - `flex items-center gap-2 px-3 py-1.5 border-l-4 text-sm` with `style={{ borderLeftColor: parentColor }}`
    - Title: `flex-1 truncate text-foreground`
    - Time: `text-xs text-muted-foreground flex-shrink-0`
    - Date badge in corner when applicable
  - `items-pool.tsx`: `"use client"`. Bottom section of calendar left panel. Merged pool of Bits + Chunks only (Nodes are in the separate Node Pool above)
    - Sort: deadline items first (by priority rank → time), no-deadline below
    - Scrollable with search input
    - Items draggable to schedule
    - Unschedule: drag back to pool or ✗ button → Bit: `DataStore.updateBit({ deadline: null })`, Chunk: `DataStore.updateChunk({ time: null })`
- **Acceptance:** Compact items: colored left border + title + time. Pool sorts correctly. Drag to schedule works. Unschedule clears deadline
- **Commit:** `feat: add compact bit items and calendar items pool with scheduling`

### Task 29: Calendar:Monthly Page
- **Status:** `[ ]`
- **Files:** `src/app/calendar/monthly/page.tsx`, `src/app/calendar/monthly/_components/month-grid.tsx`, `src/app/calendar/monthly/_components/date-cell-popover.tsx`
- **Dependencies:** Task 26, Task 10
- **Actions:**
  - `monthly/page.tsx`: `"use client"`. Same left panel as weekly (shared via calendar layout). Right panel: month calendar grid
  - `month-grid.tsx`: Standard 7-column (Mon–Sun) × weeks grid. Left/right arrows for month navigation. Month label. Uses `useCalendarStore` for `currentMonth`
    - Date cells: color indicators for scheduled items (highlight color from parent Node)
    - Drag from pools to date cells → sets deadline to that date
  - `date-cell-popover.tsx`: Click date cell → shadcn `Popover` with all items for that day in list view. Items clickable → navigate by type: Node → `/grid/[nodeId]`, Bit → `/grid/[parentId]?bit=[bitId]`, Chunk → `/grid/[grandparentId]?bit=[parentBitId]`
- **Acceptance:** Month grid renders with correct day layout. Items as color indicators. Click date shows popover. Month navigation works. Drag to date sets deadline
- **Commit:** `feat: add monthly calendar page with date grid and item popovers`

### Task 30: Calendar Data Integration
- **Status:** `[ ]`
- **Files:** `src/hooks/use-calendar-data.ts` (update), `src/stores/calendar-store.ts` (update)
- **Dependencies:** Task 27, Task 28, Task 29
- **Actions:**
  - Finalize `use-calendar-data.ts`: Ensure `weeklyItems` and `monthlyItems` filter active items only (`deletedAt === null`). Verify pool sort order matches SPEC (deadline first by priority rank, then no-deadline)
  - Finalize `calendar-store.ts`: Wire `navigateWeek` / `navigateMonth` to update `currentWeekStart` / `currentMonth` using `date-fns` (`addWeeks`, `addMonths`)
  - Wire DnD by item type: Bit drop → `DataStore.updateBit({ deadline: targetTimestamp })`, Node drop → `DataStore.updateNode({ deadline: targetTimestamp })`, Chunk drop → `DataStore.updateChunk({ time: targetTimestamp })`. Unschedule reverses: Bit/Node → clear `deadline`, Chunk → clear `time`
  - Verify multi-view consistency (PRD Section 23): changes from calendar reflect on grid via reactive hooks
- **Acceptance:** Calendar data groups correctly. Navigation updates view. Scheduling persists to IndexedDB. Changes sync across calendar and grid views automatically
- **Commit:** `feat: integrate calendar data hooks with navigation and multi-view sync`

---

## Phase 7: Trash, Search + Polish

### Task 31: Trash Page
- **Status:** `[ ]`
- **Files:** `src/app/trash/page.tsx`, `src/components/trash/trash-list.tsx`, `src/components/trash/trash-group.tsx`
- **Dependencies:** Task 5 (DataStore)
- **Actions:**
  - `trash/page.tsx`: `"use client"`. List view with sidebar (no grid). Uses a dedicated `useTrashData` hook (reactive, internally `useLiveQuery`) for trashed items
  - `trash-list.tsx`: Renders all trashed items. Global "Empty trash" button → permanently deletes all trashed items
  - `trash-group.tsx`: Deleted Node shows as single entry with child count indicator ("Work — 3 Nodes, 8 Bits"). Click to expand children
    - Per-item actions: Restore button, Delete permanently button
    - Retention label: `text-xs text-muted-foreground` — "X days until permanent deletion" from `deletedAt + 30 days - Date.now()`
  - Restore behavior: returns to original parent grid. BFS nearest-empty-cell if position occupied. Auto-restores parent chain if parent also trashed
- **Acceptance:** `/trash` shows trashed items grouped by parent. Expand reveals children. Restore returns to grid with BFS fallback. Permanent delete removes completely. Retention countdown shows
- **Commit:** `feat: add trash page with grouped view, restore, and permanent delete`

### Task 32: Cascade Delete/Restore/Cleanup Hooks
- **Status:** `[ ]`
- **Files:** `src/lib/db/indexeddb.ts` (update)
- **Dependencies:** Task 24, Task 6 (BFS)
- **Actions:**
  - **Hook 4 — Cascade soft-delete:** Node trashed → recursively find all descendant Nodes + their Bits, set `deletedAt = Date.now()` on all. Bit trashed → trash Bit only (Chunks implicitly inaccessible via trashed parent)
  - **Hook 5 — Cascade restore:** Node restored → if parent trashed, auto-restore parent chain first (no orphans). Restore all descendants trashed in same cascade. Each restored item: BFS if original `(x, y)` occupied. Bit restored → auto-restore parent Node chain if needed
  - **Hook 6 — Cascade hard-delete:** Node permanently deleted → delete Node + all descendant Nodes + all descendant Bits + all Chunks of those Bits. Bit deleted → delete Bit + all Chunks
  - **Hook 7 — Trash auto-cleanup:** On app startup and periodically (e.g., every hour): query `deletedAt < Date.now() - 30 * 86400000`. Apply Hook 6 to each match
- **Acceptance:** Unit tests pass:
  - `cascade-delete.test.ts`: trash Node → all descendant Nodes + Bits get `deletedAt`; trash Bit → only that Bit trashed, Chunks untouched
  - `cascade-restore.test.ts`: restore Node with trashed parent → parent chain auto-restored; restored item at occupied cell → BFS fallback
  - `cascade-hard-delete.test.ts`: permanently delete Node → all descendants + their Chunks removed from store
  - `auto-cleanup.test.ts`: items trashed >30 days → permanently deleted on cleanup run
- **Commit:** `feat: implement cascade soft-delete, restore, hard-delete, and trash auto-cleanup`

### Task 33: Search Overlay
- **Status:** `[ ]`
- **Files:** `src/components/layout/search-overlay.tsx`
- **Dependencies:** Task 10 (use-search), Task 7 (search-store)
- **Actions:**
  - `search-overlay.tsx`: `"use client"`. Uses `useSearchStore` + `useSearch()`. Motion entry via `searchOverlayVariants`. Per DESIGN_TOKENS:
    - Backdrop: `fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]`
    - Container: `w-full max-w-search-overlay bg-popover rounded-xl border border-border shadow-2xl overflow-hidden`
    - Input: `flex items-center gap-3 px-4 py-3 border-b border-border`. Search icon `w-5 h-5 text-muted-foreground`. Input field `flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base` with `autoFocus`
    - Results: `max-h-[50vh] overflow-y-auto py-2`. Each: `flex items-center gap-3 px-4 py-2.5 hover:bg-accent cursor-pointer transition-colors`. Type icon `w-4 h-4 text-muted-foreground`, title `text-sm font-medium text-foreground truncate`, path `text-xs text-muted-foreground truncate`, deadline
  - Trigger: sidebar Search button or `Cmd/Ctrl+K` shortcut
  - Click result → navigate to item's grid location. Overlay closes
  - Scope: case-insensitive substring across active nodes, bits, chunks titles
- **Acceptance:** Search opens via sidebar button or Cmd+K. Real-time filtering. Results show type + parent path. Click navigates and closes. ESC/backdrop closes
- **Commit:** `feat: add search overlay with real-time filtering and keyboard shortcut`

### Task 34: DnD Grid Interactions
- **Status:** `[ ]`
- **Files:** `src/hooks/use-dnd.ts` (update), `src/components/grid/grid-view.tsx` (update)
- **Dependencies:** Task 10, Task 13, Task 20
- **Actions:**
  - Finalize `use-dnd.ts` with full interaction handlers:
    - **Grid reposition (edit mode):** Drag item to empty cell → `DataStore.updateNode/Bit({ x, y })`. Magnet snap via `magnetSnapTransition` (spring: damping ~15, stiffness ~200)
    - **Drag-into-Node:** Drag Bit/Node over a Node card → "suck" spring animation → move item to child grid of target Node with BFS auto-placement
    - **Drag-to-breadcrumb:** Drag item onto breadcrumb segment → move item to that ancestor's grid with BFS
  - Visual feedback: dragged item opacity 0.5, valid drop zones get highlight border
  - @dnd-kit pointer sensor with 5px activation distance (prevents click interference)
- **Acceptance:** Items repositionable in edit mode with snap animation. Drag-into-Node moves to child grid. Drag-to-breadcrumb moves to ancestor. Visual feedback during drag
- **Commit:** `feat: implement grid drag interactions with magnet snap and node drop`

### Task 35: Motion Animations
- **Status:** `[ ]`
- **Files:** `src/lib/animations/grid.ts` (update), `src/lib/animations/layout.ts` (update), `src/components/grid/grid-view.tsx` (update), `src/components/layout/sidebar.tsx` (update), `src/components/bit-detail/bit-detail-popup.tsx` (update)
- **Dependencies:** Task 8, Task 19
- **Actions:**
  - **Sinking completion:** Bit status → `"complete"` → Motion `AnimatePresence` exit variant: `translateY(8px) scale(0.95) opacity(0.5)` (`sink-fade 0.5s ease-out forwards`). Card sinks below grid and fades
  - **Task tossing:** Drag into Node → spring animation with overshoot. Item visually "thrown" into Node icon
  - **Magnet snap:** Grid and calendar drops snap with spring transition
  - **Sidebar fold/unfold:** Motion layout animation on width change (`w-sidebar` ↔ `w-sidebar-collapsed`)
  - **Search overlay:** Fade + scale entry/exit via `searchOverlayVariants`
  - **Bit detail popup:** Fade + slide-up entry, slide-down + fade exit via `bitDetailPopupVariants`
  - **Floating idle:** Optional CSS `animate-float` on idle nodes (PRD mentions ON/OFF toggle)
  - All animations respect `prefers-reduced-motion` media query
- **Acceptance:** Completion sinks card. Drag-into-Node tosses. Sidebar animates fold. Popups animate. `prefers-reduced-motion` disables all
- **Commit:** `feat: add Motion animations for completion, tossing, sidebar, and popups`

---

## Cross-Cutting Concerns

These apply across all phases:

- **Two-layer data abstraction (critical PRD constraint):** Data access has two independent abstraction boundaries, both replaceable for v2 cloud sync:
  1. **CRUD layer — DataStore interface** (`src/lib/db/datastore.ts`): All write operations (create, update, delete) go through this interface. v1 implementation: `src/lib/db/indexeddb.ts`.
  2. **Reactive layer — custom hooks** (`src/hooks/use-*.ts`): All read subscriptions go through these hooks. v1 implementation uses Dexie `useLiveQuery` internally. Components never import DataStore or Dexie directly — they import hooks only.
  - For v2 migration: swap the DataStore implementation (e.g., to Supabase) AND swap the reactive internals (e.g., `useLiveQuery` → React Query). Component code stays unchanged.
- **Design tokens:** Use semantic classes from DESIGN_TOKENS.md. All colors via CSS variables — no hardcoded hex. Reference: `bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`, `bg-priority-{high,mid,low}-bg`, `text-priority-{high,mid,low}`, `bg-urgency-{1,2,3}`.
- **Computed values:** Aging state, urgency level, node completion, bit progress — computed at render time via pure utility functions. Never stored in the database (SPEC decision #6).
- **URL-driven state:** Grid level via route (`/`, `/grid/[nodeId]`). Bit detail via query param (`?bit=[bitId]`). Browser back/forward navigation works naturally.
- **Reactive updates:** All data reads via custom hooks (internally `useLiveQuery` in v1). Write to store → all subscribed components auto-update. No manual cache invalidation, no optimistic rollback (SPEC decision #11).
- **Zod at write boundary:** Validate data with Zod schemas on create/update operations. Data read from the store is trusted — no runtime validation on reads (SPEC decision #7).
- **Grid cell uniqueness (Hook 8):** Always check `(parentId, x, y)` occupancy before insert or move. BFS auto-placement as fallback when position is occupied.
- **Testing:** Vitest for unit tests. Pure utility functions (T6) and application hooks (T24, T25, T32) require passing unit tests as acceptance criteria. Test files co-located with source: `src/lib/utils/*.test.ts`, `src/lib/db/*.test.ts`.
- **Accessibility:** `prefers-reduced-motion` disables all animations. Focus management on modals (search overlay, bit detail, dialogs). `aria-labels` on icon-only sidebar buttons. Keyboard navigation for search results.
- **Non-features (PRD Section 26):** Do NOT implement: Mascot System, Labs, AI-Powered Search, Responsive Design, Onboarding Enhancement. These are explicitly deferred.
- **Doc authority:** SCHEMA.md = data model source of truth. SPEC.md = architecture/routes/components. DESIGN_TOKENS.md = visual values. This file = execution order. PRD = historical context, non-authoritative for implementation.
