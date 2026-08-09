# Inbox/Triage Breakdown Rows And Empty States — Visual Recipe

> Status: **Proposed — recipe-package user gate pending**
> Verification: **source-only; no rendered route/state was checked**
> Production owner: `BreakdownPanel` row list and Add surface (`LAND-BREAKDOWN`, `LAND-THEME`)

## Authority And Source Regions

- Product authority: [`DECISION.md`](../brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/DECISION.md) lines 298–361 and 467–519.
- Approved boundary: [`PROMOTION_MAP.md`](../brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/PROMOTION_MAP.md) §§10.1, 11.2, and 11.3.
- Design Source root: `/Users/jwk/Documents/griddo2-claude-themes2-3`.
- Row/input/empty subregions are inside GridDO `page.tsx:1128-1380`; Tiny Desk `:1402-1550`; Neumorphism `:1040-1280`; Claymorphism `:943-1189`; Origami `:1402-1601`; Terminal `:944-1204`; Retro Mac `:992-1241`; Graphite `:1103-1350` at that root.

## Shared Adopted Contract

- Active rows show content, grip-only drag, and always-visible Edit/Trash. Row numbering and date/time text are absent.
- Staged rows remain in place, de-emphasized and disabled without a strike-through. Placed/consumed rows leave the active list; durable consumed truth remains outside this visual recipe.
- Add has an explicit control plus Enter path and a stable input surface. Blur behavior, persistence, focus, and mutation reliability remain product/SPEC concerns.
- Distinguish never-had-a-row, all-deleted-without-consumption, and consumed completion. An ordinary empty list is not a blank canvas and is not archive completion.
- Scrollbar chrome is hidden while ordinary input scrolling remains.

## Decision-Prerequisite Boundary

- `VQ-02` — **resolved by `DP-VQ02` on 2026-08-09.** The user selected Choice A, the row-attached confirmation wash/check/text signal specified below. Task 148 is its only realization edge; successful Unstage still has no toast.
- `VQ-05` — Add/Delete pending, reconciling, failure, and in-place deleting may use only semantic state attributes, existing theme tokens, visible text/icon/non-color cues, and selected focus/accessibility behavior. Exact copy, location, layout, effect, duration, and per-theme values are a **user-owned non-code Decision prerequisite**. Future owner: Breakdown reliability phase; resume exact state realization after receipt.
- `VQ-11` — completion-blocker status uses the same limited envelope. Exact why/where/how remains a **user-owned non-code Decision prerequisite** owned by the Breakdown/archive phase.
- `VQ-03` — Add-draft departure confirmation is an absent replacement surface. It is wholly excluded; generic delete/archive confirmation and native unload UI are not app-internal fallbacks. Future owner: Add-draft phase; resume after a user realization receipt.
- `VQ-04` — row inline editor/conflict/lifecycle-invalid UI is an absent replacement surface and wholly excluded. Source Edit buttons do not source it. Future owner: editing phase; resume after user receipt.

## `DP-VQ02` Approved Add/Unstage Success Signal

`DP-VQ02` gives authoritative Add and Unstage success one shared, non-repeating
row signal. It never substitutes a toast, Newly marker, repeated animation, or
generic global status.

### Trigger And Identity

- Trigger only when the mounted Inbox page first observes terminal success for
  a locally initiated Add or Unstage operation. Direct `applied` and the first
  `already_applied` confirmation of that still-current operation qualify.
- The signal identity is `{operation kind, operationId, target Breakdown row
  ID}`. Add targets the newly committed row; Unstage targets the restored
  source row. Remember signaled identities only for the current Inbox page
  mount.
- Do not trigger from hydration, reload, a remote/other-tab row, rerender, a
  previously observed terminal result, or `already_applied` without the
  current local operation identity. Reconciliation may trigger once when it
  first supplies authority; replay of that result never repeats it.

### Placement, Copy, And Timeline

- Keep the target row's height, content, grip, and Edit/Trash positions stable.
  Apply `success` to the complete row surface and use one non-interactive
  trailing status slot immediately before the action cluster. The slot is
  reserved in the row grid so its appearance creates no layout shift.
- At `0ms`, show an `aria-hidden="true"` `✓` followed by exact visible copy:
  `Added.` for Add or `Returned to Breakdown.` for Unstage. The same text is
  the sole polite, atomic status announcement.
- At `0ms`, place the row background and border at the theme's approved success
  emphasis, then transition both back to the ordinary active-row values over
  `600ms` with CSS `ease-out`. Do not transform, scale, sparkle, pulse, blink,
  bounce, spin, flicker, or move any content.
- Keep `✓ Added.` or `✓ Returned to Breakdown.` statically visible through
  `1600ms`, then remove the status and `success` state without an exit
  animation. The wash and status do not replay after rerender.

### Interruption, Retrigger, Focus, And Reduced Motion

- If a different qualifying success arrives before `1600ms`, clear the prior
  row immediately and start one fresh `0ms` timeline on the new target. The
  same identity is ignored.
- Scratch switch, Inbox route exit, or page unmount clears the active signal
  and its remembered identities; reload never reconstructs or replays it.
  Theme/light-dark changes preserve the current target and remaining time and
  never retrigger the signal.
- Add keeps focus in the Add input. Unstage keeps the canonical restored-source
  focus. The status is not focusable, never steals focus, and uses
  `role="status"`, `aria-live="polite"`, and `aria-atomic="true"` once per new
  identity.
- Under `prefers-reduced-motion: reduce`, skip the 600ms transition entirely.
  Apply the theme's static success border/surface distinction immediately and
  keep it with the same `✓` and copy for `1600ms`; then remove all success
  treatment in one step. This is the equivalent success state, not a shorter
  or color-only fallback.

### Eight-Theme Mapping

All themes keep the same row geometry, `✓`, exact copy, `600ms`/`1600ms`
timeline, focus, and announcement contract:

| Theme | Exact realization mapping |
|---|---|
| GridDO | Primary-tinted semantic row surface and border wash with canonical text/focus roles. |
| Tiny Desk | Paper-row highlight and stationery check-stamp treatment, returning to the ordinary paper row. |
| Neumorphism | Named raised success surface/shadow emphasis returning to the ordinary row shadow; reduced motion uses a static raised border/surface distinction. |
| Claymorphism | Shape-preserving glossy success wash and raised check treatment with no scale or bounce. |
| Origami | Paper highlight plus emphasized seam/fold edge returning to the ordinary row paper. |
| Terminal | Variable-driven record/background and border emphasis with the same literal `✓` and copy; no fixed terminal color in JSX. |
| Retro Mac | 1-bit selected-style surface/border emphasis and hard check treatment, without blink or inversion cycling. |
| Graphite | Restrained grayscale row wash and strengthened editorial rule returning to the ordinary row. |

Theme IDs never branch trigger logic or copy, and successful Unstage remains
row-local with no toast.

## Theme Realizations

### GridDO

- Observed source-only: rows are clean product cards with grip, content, circular Edit/Trash controls, muted staged treatment, and a `p-4` list. Add declares a bordered rounded input with left Plus and a primary uppercase `Add` button. Empty source states use mono technical messages.
- Adopted fact: restrained card rows, visible technical actions, and compact system-style empty prompts are supported.
- Token implication: active/staged row, row action, Add field/control, ordinary empty, and consumed-completion prompt need distinct semantic roles.

### Tiny Desk

- Observed source-only: rows and Add use white/cream paper, brown ink, `#d2c2a4` borders, and stationery controls; Add is a bordered paper field plus brown button. Empty is an `EMPTY STICKY`/memo object, while completion uses a filed/stamped paper message.
- Adopted fact: paper slips and stationery actions are supported; source wording is not canonical copy.
- Token implication: paper row, staged paper, stationery action, sticky empty, and filed completion need Tiny Desk aliases.

### Neumorphism

- Observed source-only: rows declare `18px` radius with card/inset shadows and circular raised actions; Add is a round inset field with a raised circular add control. Ordinary empty uses a large inset well; completion uses a separate checked/status surface.
- Adopted fact: raised rows/actions and inset input/empty wells are supported.
- Token implication: reuse `--theme-shadow-card`, `--theme-shadow-inset*`, and semantic row/empty roles; rendered depth is unverified.

### Claymorphism

- Observed source-only: rows are rounded clay objects with visible Wand/Trash actions; staged state is visually de-emphasized; Add uses a `20px` inset field and clay button. Empty declares balloon/jelly imagery; completion declares a separate green completion prompt.
- Adopted fact: tactile rows, distinct shape-led actions, and playful but semantically separate empty/completion objects are supported.
- Token implication: active/staged/deleting envelope must not collapse to color alone; exact reliability states remain `VQ-05`.

### Origami

- Observed source-only: rows use paper/fold geometry; Add uses a dashed paper field and dark folded button. Ordinary empty is a cleared-sheet/fold composition; completion is a crossed/folded folder composition.
- Adopted fact: paper seams, folds, and faceted prompts are supported.
- Token implication: row paper, staged paper, dashed input, ordinary empty, and completed fold roles should be aliases. Keyboard-grab and pulse declarations are excluded.

### Terminal

- Observed source-only: rows are console records with grip, content, Edit/Trash commands, and a textual `# [staged]` non-color cue. Add is a `C:\>` command input plus `Execute`. Empty is a debugger/buffer-empty readout; completion is an `[INFO]` result.
- Adopted fact: text status, command actions, and explicit non-color staged labeling are supported.
- Token implication: terminal row state must keep visible text/icon semantics; pulsing completion commands are not adopted.

### Retro Mac

- Observed source-only: rows are compact 1-bit file/list items with grip and square Edit/Trash buttons; Add is an inverted-on-focus field plus `Add` button. Ordinary empty uses a Sad Mac/error object; completion uses an empty-system/file state.
- Adopted fact: black/white row inversion, hard controls, and distinct system objects for empty versus completion are supported.
- Token implication: row/action/input/empty/completion aliases should consume Retro Mac border and hard-shadow tokens.

### Graphite

- Observed source-only: rows use fine editorial rules, bold text, grip, and square monochrome Edit/Trash controls; Add uses a `0.5px` field and dark button. Ordinary empty uses calligraphy guides; completion uses a restrained check/headline.
- Adopted fact: drafting-line rows and editorial empty/completion hierarchy are supported.
- Token implication: thin row rule, staged opacity plus non-color cue, editorial Add field, guideline empty, and completion headline need roles.

## Exclusions And Verification

- Excluded: `VQ-03/04` surfaces, unsupported exact `VQ-05/11` details, source mutation behavior, Add-on-blur, mock delete/placement, row dates/numbers, consumed strike-through, repeated pulse/bounce, and route copy as authority.
- No row height, list density, staged distinction, empty/completion distinction, focus-visible action, overflow, scroll, contrast, success effect, deletion state, or reduced-motion equivalence was rendered or verified.
