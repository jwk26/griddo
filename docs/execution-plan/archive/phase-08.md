## Phase 8: Bit Detail Surface Refinement (Pilot)

> **Purpose:** Redesign the Bit Detail surface toward `references/bitdetail0.png` via the `/reference-redesign` skill. Test whether a recipe-driven approach improves implementation fidelity.
> **Recipe:** `docs/DESIGN_TOKENS.md` § Surface Recipes → Bit Detail Surface
> **Approved recipe session:** produced via `/reference-redesign references/bitdetail0.png` — see `docs/reviews/phase-8-workflow-pilot-record.md`
> **Gap review:** `docs/reviews/phase-8-bit-detail-gap-review.md`
> **Pilot record:** `docs/reviews/phase-8-workflow-pilot-record.md`
> **Pilot scope:** Bit Detail popup only. No other surfaces.
> **Pilot question:** Does a recipe-driven approach reduce visual ambiguity and improve layout fidelity compared to previous phases?

### Task 36: Header + Metadata Bar Restructure
- **Status:** `[x]`
- **Files:** `src/components/bit-detail/bit-detail-popup.tsx`
- **Dependencies:** Phase 7 complete
- **Recipe:** `docs/DESIGN_TOKENS.md` § Bit Detail Surface → Header Row, Priority + Meta Row, Description (Collapsed by Default)
- **Actions:**
  - Restructure header row per recipe:
    - Left: icon picker (h-9 w-9, existing popover, flex-shrink-0) + title (text-lg font-semibold, flex-1 min-w-0 truncate)
    - Right: status toggle (h-7 w-7) + more menu (h-7 w-7) only — no progress ring here
    - Header remains single-line. Title truncates; right controls do not shrink.
  - Replace metadata bar with chip-based layout (px-5 pt-1.5):
    - Priority pill leftmost (existing cycling behavior, existing styles)
    - When deadline is set: date chip (Calendar icon + date text + × to clear) + time chip (hidden if all-day) + ALL toggle pill
    - When deadline is null: "Add date" button (Calendar icon + text)
    - Edit state on chip click: existing date/time inputs + ALL toggle, dismiss on blur/ESC
  - Description: collapsed by default (existing behavior — no change needed)
- **Acceptance:**
  - Header: icon picker left of title; status toggle and more menu right; no progress ring in header
  - Title truncates at tight widths; right controls do not shrink
  - Metadata bar: priority pill leftmost, then deadline chips when set
  - Date chip has × button that clears deadline immediately
  - Time chip hidden when all-day is active
  - ALL pill toggles all-day; active state uses primary color
  - "Add date" button shown when no deadline set
  - Chip click → edit state; blur/ESC → returns to chip display
  - Priority cycling, status toggle, icon picker, promote, trash all still work
  - `pnpm build` passes

### Task 37: Steps Section Unification + ChunkTimeline Removal + Deadline Footer
- **Status:** `[x]`
- **Files:** `src/components/bit-detail/chunk-item.tsx` (update), `src/components/bit-detail/chunk-pool.tsx` (update), `src/components/bit-detail/chunk-timeline.tsx` (delete), `src/components/bit-detail/bit-detail-popup.tsx` (update integration)
- **Dependencies:** Task 36
- **Recipe:** `docs/DESIGN_TOKENS.md` § Bit Detail Surface → Steps Header Row, Chunk Area, Step Item, Deadline Footer, Empty State
- **Actions:**
  - Add steps header row above chunk area in `bit-detail-popup.tsx`:
    - `flex items-center justify-between px-5 pt-3 pb-0`
    - Left: "Add a step" button (Plus icon, existing styling from ChunkPool) — move trigger here
    - Right: progress ring SVG (moved from header, hidden when totalChunks === 0)
  - Update `chunk-pool.tsx` to render all chunks as a unified list:
    - Remove the `time === null` filter — all chunks render in ChunkPool
    - Sort by `chunk.order` (manual order) — no time-based sorting
    - Remove the "Add a step" button from ChunkPool's own render (it moves to steps header row)
    - DnD context wraps all chunks
  - Update `chunk-item.tsx` step item visual:
    - Remove bordered card wrapper (no border, no bg-background, no px-3 py-2)
    - Render: dot + text + optional time sub-label (gap-3, pb-5)
    - Dot: w-3.5 h-3.5. Complete: bg-primary. Incomplete: border-2 border-muted-foreground/40
    - Title: text-sm. Complete: line-through text-muted-foreground
    - Time sub-label (when chunk.time set): text-xs text-muted-foreground mt-0.5
    - Drag handle + delete: opacity-0, opacity-100 on parent hover
  - Delete `chunk-timeline.tsx` — remove all imports and usage from `bit-detail-popup.tsx`
  - Add deadline footer in `bit-detail-popup.tsx` below chunk area:
    - `flex items-center gap-2 px-5 pb-5`
    - Clock h-4 w-4 text-destructive + formatted deadline text-sm text-destructive
    - Hidden when `bit.deadline === null`
  - Adjust chunk area container: pl-6, connecting line at `left-[11px]`
- **Acceptance:**
  - Steps header row renders above the step list: "Add a step" left, progress ring right
  - All chunks (timed and untimed) appear in a single unified list ordered by `chunk.order`
  - No separate timed-step section exists
  - Timed steps show time as sub-label below their text
  - Step items: no card wrapper, dot + text + optional sub-label only
  - Complete steps: line-through + muted; incomplete dots: hollow outline
  - Drag reorder, inline edit, toggle complete, delete all still work for all steps
  - `chunk-timeline.tsx` is deleted; no import errors
  - Deadline footer renders in red below chunk area when deadline is set; hidden when null
  - Empty state renders correctly (line stub + hollow dot)
  - `pnpm test && pnpm build` pass

### Task 38: Bit Detail Spacing + Visual Polish
- **Status:** `[x]`
- **Files:** `src/components/bit-detail/bit-detail-popup.tsx`, `src/components/bit-detail/chunk-pool.tsx`, `src/components/bit-detail/chunk-item.tsx`
- **Dependencies:** Task 37
- **Recipe:** `docs/DESIGN_TOKENS.md` § Bit Detail Surface (all subsections — final pass)
- **Actions:**
  - Audit all padding, gaps, and spacing against recipe values:
    - Header: px-5 pt-5 pb-0
    - Metadata bar: px-5 pt-1.5 pb-0
    - Steps header row: px-5 pt-3 pb-0
    - Chunk area: px-5 pt-2 pb-5, pl-6 internal offset
    - Step items: pb-5 between items, gap-3 between dot and content
    - Deadline footer: px-5 pb-5
    - Connecting line: left-[11px] (centered on 14px dot)
  - Verify dot sizes (w-3.5 h-3.5 = 14px) and connecting line alignment
  - Verify dark mode: all recipe elements use semantic tokens, no hardcoded values
  - Run visual comparison against `references/bitdetail0.png` for layout fidelity
- **Acceptance:**
  - Padding and spacing match recipe values across all zones
  - Step dot centers align with connecting line
  - Dark mode renders correctly with token-based colors
  - Overall visual density and hierarchy approximate `references/bitdetail0.png`
  - `pnpm test && pnpm build` pass

#### Phase 8 Pilot Notes

> **Pilot context:** Phase 8 tests whether adding a precise surface recipe to DESIGN_TOKENS.md improves implementation fidelity for the Bit Detail surface.
>
> **What this pilot measures:**
> - Did the recipe reduce ambiguity during implementation?
> - Did implementation fidelity improve compared to previous phases?
> - Was one closing-phase screenshot review sufficient to catch visual deviations?
>
> **Verification approach:** No per-task evaluator loop. At closing, screenshot the Bit Detail surface and compare against the recipe and `references/bitdetail0.png`. Fix clear deviations only.
>
> **Structural decisions deferred:** Component-level merge of the chunk area is not part of this pilot. If visual continuity reveals that a structural merge is needed, that decision is revisited post-pilot.
>
> **Required post-phase output:** Before Phase 8 is considered fully complete, update `docs/reviews/phase-8-workflow-pilot-record.md` with final findings and write a workflow update recommendation based on the evidence gathered during this pilot.
>
> **Pilot verdict:** Adopt the recipe pattern with changes. Geometric recipes eliminate layout guesswork. Gemini pre/post-code reviews caught 6 real issues (3 HIGH, 3 MEDIUM). Key gaps: no interaction state table, no geometry validation step, no component ownership notes.
>
> **Recipe geometry rule:** `left-[X]` inside a `pl-N` container must satisfy `X = padding-left + (dot-width / 2)`. Validate before implementation.
>
> **Component ownership:** Put a one-line ownership note in the recipe for each component boundary. Prevents duplicate-render bugs invisible to screenshot review.
>
> **Pilot record update discipline:** The running record must be updated after each task commit — not retroactively. Make it a structural CCG checkpoint.
>
> **Full issue log:** `docs/issues/Issues_Phase_8.md`
> **Workflow update recommendation:** `docs/reviews/phase-8-workflow-pilot-record.md` §13

---

