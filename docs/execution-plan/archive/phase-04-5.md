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

#### Phase 4.5 Bootstrap Notes (Pre-Phase-5 Prep)

> **Audit docs without close-out steps become debt:** `OMISSION_AUDIT.md` was written but never applied. Treat audit action items as plan tasks — status + owner before the session ends.

> **Conformance deviations compound across phases:** 5 Tier 5 architectural deviations (non-reactive fetches, DataStore facade bypass, dead context, unused variant) accumulated across Phases 1–4 with no conformance gate. `PLANNING_STANDARD.md §6` checklist now runs at every phase close.

> **DataStore API gap exposed by Fix 1:** `getNodes(null)` returns only L0 nodes. The calendar hook's original `db.nodes.toArray()` returned all levels. Facade is now clean; the functional gap (L1/L2 nodes missing from calendar) is a pre-existing DataStore design issue for Phase 6.

> **3 open decisions before Phase 5 starts:** (1) Inline edit save strategy (blur vs. debounce) — affects Tasks 21/22/23/25c. (2) Hook 3 force-complete reversal rule — affects Task 24. (3) Edit-mode / chooser integration ownership — affects Tasks 20 & 25b.

> **Full bootstrap issue log:** `docs/issues/Issues_Phase_4_Bootstrap.md`

---

