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

