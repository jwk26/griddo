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

