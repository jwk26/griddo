# Flow-Trace Review — Phase 16: Quick Capture

**Reviewed:** 2026-06-10
**Inputs:** SPEC.md, EXECUTION_PLAN.md Phase 16, `docs/recipes/quick-capture-entry-surface-visual-recipe.md`, `docs/recipes/command-palette-visual-recipe.md`, SCHEMA.md
**Status: GAPS FOUND — G4 (Calendar route scope) requires user decision before implementation; G6 resolved (Command Palette owns Cmd+K); G2/G3/G8 are implementation policies, not blockers**

---

## Flow-Trace Table

| # | User Flow | Trigger | Intended Outcome | Owning Task | Boundary Cases | Status |
|---|-----------|---------|------------------|-------------|----------------|--------|
| F1 | Click sidebar `+` → popover opens → close via Esc/outside click | Sidebar `+` | Anchored slide/fade popover with Ideas/Create groups | T73 | Esc vs outside click; popover already open (toggle?) | ✅ Owned |
| F2 | Click Scratch in popover → modal opens → submit → Bit created in Inbox | Scratch row | Centered modal; Bit with `parentId`=Inbox, `sparkles`, `(0,0)` | T74 | Inbox Node missing; empty input; popover auto-close on modal open | ⚠️ Weak |
| F3 | Submit empty input in Scratch modal | Enter/submit with blank | Rejected — no Bit created | T74 | Whitespace-only; validation messaging | ❌ Gap |
| F4 | `Cmd+K` → palette opens → key `1` → Scratch modal | `Cmd+K` global | Palette opens; `1` opens Scratch modal | T75 | Palette already open (toggle?); `Cmd+K` while popover open | ⚠️ Weak |
| F5 | `Cmd+K` → palette opens → key `2` → existing Search overlay | `Cmd+K` then `2` | Palette closes; Search overlay opens unchanged | T75 | Search already open; palette state after Search closes | ⚠️ Weak |
| F6 | `Cmd+K` → Esc → palette closes | Esc while palette open | Palette closes, no side effects | T75 | ESC chain priority with other overlays | ⚠️ Weak |
| F7 | L0 `+` → Create → Bit → parent selector appears | `+` → Bit row at L0 | Parent selector shown (no direct L0 Bit creation) | T76 | No nodes exist; `create-bit-dialog` `requireParent` wiring | ⚠️ Weak |
| F8 | Inside Node `+` → Create → Bit → uses current Node | `+` → Bit row inside Node | `create-bit-dialog` opens with current Node as parent | T76 | Node trashed/archived between click and dialog open (edge) | ✅ Owned |
| F9 | L3 (Chunk level) `+` → Bit-only surface | `+` at Level 3 | Node row hidden; only Bit creation available | T73, T76 | Entry surface must hide Node row at L3 | ⚠️ Weak |
| F10 | `+` → Create → Node → existing create-node-dialog | `+` → Node row | `create-node-dialog` opens | T76 | L3: Node row hidden | ✅ Owned |
| F11 | Scratch capture success → confirmation + Inbox path | Successful submit | Lightweight confirmation; path to open Inbox | T74 | Format (toast/banner/inline?); auto-dismiss; whether modal stays open | ⚠️ Weak |
| F12 | `Cmd+K` while `+` popover is open | `Cmd+K` with popover visible | One must close; mutual exclusion needed | T73, T75 | Both open simultaneously; no ownership defined | ❌ Gap |
| F13 | ESC priority: Phase 16 overlays vs existing ESC chain | Esc keydown | Correct overlay closes per priority | T73, T75 | Palette + Scratch modal + popover not in documented ESC chain | ❌ Gap |
| F14 | `+` popover on Calendar routes | Sidebar `+` on `/calendar/*` | Unclear: new entry surface or existing chooser? | T73 | Calendar has own `onNodeCreate`/`onBitCreate` wiring — architectural conflict | ❌ Gap |
| F15 | `+` popover on Trash route | Sidebar `+` on `/trash` | Currently disabled; Phase 16 behavior undefined | T73 | Should remain disabled or adopt entry surface? | ❌ Gap |
| F16 | `Cmd+K` on non-grid routes (Calendar, Trash) | `Cmd+K` any route | Palette opens globally — conflicts with existing Search `Cmd+K` handler | T75 | `search-overlay.tsx` already owns `Cmd+K`; both handlers will fire | ❌ Gap |
| F17 | Scratch from palette key `1` vs from `+` popover | Two entry points | Identical Scratch modal behavior | T74, T75 | Palette must close before/when Scratch modal opens | ⚠️ Weak |

---

## Gaps Found

| # | Flow | Gap Type | Description | Recommended Resolution |
|---|------|----------|-------------|----------------------|
| **G1** | F3 | Missing acceptance criterion | T74 acceptance: "On submit, create Bit with... title = input" — no behavior specified for empty/whitespace-only input. Zod `bitSchema` requires `min(1)` so the data layer rejects it, but the UI treatment (disabled submit? inline error? silent rejection?) is unspecified. | Add to T74 acceptance: "Submit button disabled when input is empty or whitespace-only." The `min(1)` constraint makes this a hard requirement at the data layer — the UI must handle it visibly. |
| **G2** | F12 | Missing mutual exclusion spec | No task defines what happens when `Cmd+K` fires while the `+` popover is open (or vice versa). Both are Phase 16 overlays in the same store file (`quick-capture-store.ts`). | Add to T73 + T75: "Opening the Command Palette closes the `+` popover, and vice versa." Store design should use a single `activeOverlay: 'entry' \| 'palette' \| 'scratch' \| null` discriminated union to enforce this. |
| **G3** | F13 | ESC chain not updated | Cross-Cutting Concerns documents the ESC chain as: Search overlay > Bit detail > Calendar column expand > Edit mode. Phase 16 adds 3 new dismissible surfaces (Command Palette, Scratch modal, `+` popover) with no defined insertion point. Without this, ESC will either swallow events incorrectly or fail to close the right surface. | Define extended chain: **Command Palette > Scratch modal > `+` popover > Search overlay > Bit detail > Calendar column expand > Edit mode.** Add `stopPropagation` in each Phase 16 handler per the existing pattern. Update Cross-Cutting Concerns in EXECUTION_PLAN.md. |
| **G4** ✅ | F14 | Architectural conflict on Calendar routes | Current sidebar `+` on `/calendar/*` routes uses a `Popover` with `onNodeCreate`/`onBitCreate` props (sidebar.tsx lines 132–166). Phase 16 replaces the sidebar `+` with the entry surface. T73 did not address whether Calendar's existing `+` behavior is replaced, preserved, or migrated. | **Resolved (2026-06-10):** Entry surface is **grid-only** (`/` and `/grid/[nodeId]`). Calendar `+` wiring stays unchanged; Trash `+` stays disabled. T73 amended to reflect conditional render. |
| **G5** | F15 | Unspecified Trash route behavior | On Trash routes, the sidebar `+` is currently disabled (`pointer-events-none opacity-40`). Phase 16 does not specify whether the entry surface activates here. | Specify: "Entry surface is disabled on Trash route (`+` remains greyed out)." Or: "Entry surface is global but Create group is hidden on Trash route; Scratch remains accessible." Either is acceptable; just needs to be stated. |
| **G6** | F16 | `Cmd+K` handler conflict | `search-overlay.tsx` already registers a global `window` `keydown` handler for `Cmd+K` that opens Search. T75 adds a new global handler for `Cmd+K` that opens the Command Palette. Both will fire on the same keystroke. | T75 must explicitly remove or disable the `search-overlay.tsx` `Cmd+K` handler. The Command Palette owns `Cmd+K`; Search is accessed via palette key `2`. Add to T75 acceptance: "Existing `Cmd+K` → Search shortcut is replaced by `Cmd+K` → Command Palette. Sidebar Search button still opens Search directly." |
| **G7** | F2 | Stale acceptance criterion | T74 acceptance says "verify via `debug-indexeddb`" — this tool does not exist in the project. (Known carryover: ISSUE-15-01.) | Replace with a real verification method: "Verify Scratch Bit creation by navigating to `/grid/[inboxNodeId]` and confirming the Bit appears, or via browser DevTools > Application > IndexedDB > griddo > bits." Keep separate from ISSUE-15-01 (Dexie migration verification). |
| **G8** | F2 | Missing DataStore method | `use-inbox.ts` (to be created) needs the Inbox Node id to set as `parentId`. The `DataStore` interface has no `getNodeBySystemRole(role)` method. The only current path is `getAllActiveNodes()` then filter by `systemRole === 'inbox'` — which breaks the two-layer abstraction or loads all nodes unnecessarily. | Add `getNodeBySystemRole(role: string): Promise<Node \| undefined>` to the `DataStore` interface and implement in `indexeddb.ts` using the `systemRole` index. This is a prerequisite sub-step for T74 — flag it as an action item. |
| **G9** | F9 | Weak L3 acceptance | T73 actions mention "Level 3 is Bit-only" but the acceptance criterion does not assert this. The behavior could be silently missing without failing the acceptance check. | Add to T73 acceptance: "At Level 3, the Create group shows only the Bit row (Node row is hidden)." |
| **G10** | F11 | Underspecified confirmation UX | T74 says "Show lightweight confirmation + path to open Inbox" — no format specified: toast? inline banner? modal state change? auto-dismiss timing? whether modal closes on submit? | Specify: Toast notification via existing `sonner` integration (already used in `grid-runtime.tsx`) with a clickable "Open Inbox" action navigating to `/grid/[inboxNodeId]`. Scratch modal closes on submit; toast auto-dismisses (~5s). |

---

## Open Questions (require user decision before implementation)

| # | Question | Blocks | Priority |
|---|----------|--------|----------|
| OQ1 | Does the Phase 16 entry surface replace `+` on **all routes** (including Calendar) or **grid routes only**? | G4, T73 scope | 🔴 Critical |
| OQ2 | Should a `getNodeBySystemRole(role)` method be added to the `DataStore` interface as a T74 prerequisite? | G8, T74 | 🔴 Critical |
| OQ3 | What is the extended ESC priority chain including Command Palette, Scratch modal, and `+` popover? | G3, T73/T75 | 🟠 High |
| OQ4 | What happens when `Cmd+K` fires while the `+` popover is open? (Mutual exclusion policy) | G2, store design | 🟠 High |
| OQ5 | Is the `+` entry surface enabled on the Trash route? | G5, T73 | 🟡 Medium |
| OQ6 | Empty Scratch input UX: disabled submit button, inline error, or silent rejection? | G1, T74 | 🟡 Medium |
| OQ7 | Post-capture confirmation: toast (sonner), inline banner, or modal state change? | G10, T74 | 🟡 Medium |

---

## Summary

- Flows traced: 17
- Fully owned: 3
- Weak: 7
- Gaps: 10 (G1–G10)
- Deferred: 0
- **Status: GAPS FOUND**

**Blocking gaps (must resolve before implementation):** G2, G3, G4, G6, G8
**Advisory gaps (can be clarified during T73/T74 implementation):** G1, G5, G7, G9, G10
