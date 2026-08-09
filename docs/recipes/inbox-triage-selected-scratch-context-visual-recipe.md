# Inbox/Triage Selected Scratch Context — Visual Recipe

> Status: **Proposed — recipe-package user gate pending**
> Verification: **source-only; no rendered route/state was checked**
> Production owner: `BreakdownPanel` Context surface (`LAND-BREAKDOWN`, `LAND-THEME`)

## Authority And Source Regions

- Product authority: [`DECISION.md`](../brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/DECISION.md) lines 282–296 and 1149–1156.
- Approved boundary: [`PROMOTION_MAP.md`](../brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/PROMOTION_MAP.md) §§10.1, 11.2, and 11.3.
- Design Source root: `/Users/jwk/Documents/griddo2-claude-themes2-3`.
- Context subregions are inside GridDO `page.tsx:1128-1380`; Tiny Desk `:1402-1550`; Neumorphism `:1040-1280`; Claymorphism `:943-1189`; Origami `:1402-1601`; Terminal `:944-1204`; Retro Mac `:992-1241`; Graphite `:1103-1350` at that root.
- Shared theme values: Design Source `src/app/themes.css:1-439`.

## Shared Adopted Contract

- The Context is a standalone signature section above rows, not heading metadata and not a row-like strip.
- Target roughly `2–2.5×` ordinary row height without breaking section ratios.
- Always include Scratch title, creation date/time, visible Scratch Edit entry, and Breakdown ASC/DESC sort. Remove duplicate selected title/meta from the Breakdown heading.
- Working and `Scratch complete` are distinct base presentations of the same semantic surface.
- Exact source copy is not product authority. Theme labels may express the selected working/complete meaning only after copy ownership is canonical.

## Decision-Prerequisite Boundary

- `VQ-04` — **resolved by `DP-VQ04` on 2026-08-09.** The user selected Choice A, the direct in-place Scratch-title and Breakdown-content editor system. This recipe owns the Context half specified below; Task 138 is the only realization edge and Task 137 remains headless.
- Context subset of `VQ-11` — title-editor completion blocker may use only the approved shared semantic-state envelope. Exact blocker copy, position, layout, effect, and per-theme values remain a **user-owned non-code Decision prerequisite**. Future owner: Context recipe/token owner and archive phase; exact UI resumes only after receipt.
- `D-LENS` — Neumorphism water-lens sort treatment is deferred and excluded.

## `DP-VQ04` Approved Scratch-Title Inline Editor

The Scratch-title editor replaces only the title region inside the existing
Context signature surface. It never opens a Dialog/AlertDialog, popover,
detached card, or global conflict surface. Creation metadata and Breakdown sort
remain visible; controls that conflict with the edit state are disabled by the
Task 137 lock rather than removed or visually repurposed.

### In-Place Structure And Entry

- The visible Scratch title becomes a labelled `Scratch title` text control in
  the same title slot. The Context retains its width and theme identity and may
  grow vertically for status, conflict comparison, or invalidated-draft review.
- Place the field first, one persistent editor status line second, and the
  action row third. `Save` is primary and `Cancel` secondary. On Edit entry,
  focus the field with the caret at the end; do not select or replace text
  automatically.
- `Save` commits, valid blur saves, and an unchanged value exits without a
  write. `Cancel` or `Escape` restores current authoritative truth and returns
  focus to the surviving Context Edit control. Theme/locale-toggle activation
  and IME composition never trigger blur Save or discard the draft.

### Exact State And Copy Matrix

| State | Exact visible treatment and copy | Available actions |
|---|---|---|
| Pristine | Field contains the base title; status `No changes.` | Disabled `Save`; `Cancel` |
| Dirty | Field contains the protected draft; status `Unsaved changes.` | `Save`; `Cancel` |
| Validation | Empty field remains open with inline error `Enter a Scratch title.` linked to the field | Disabled `Save`; `Cancel` |
| Saving | Draft remains visible/read-only; status and disabled primary label `Saving…` | Other edit actions locked; optional pending-intent `Stay here` remains available |
| Offline | Draft remains editable; status `Offline. Your draft is still here.` | Disabled `Retry save` until reconnect; `Cancel` |
| Not applied | Draft remains editable; status `Not saved. Your draft is still here.` | `Retry save`; `Cancel` |
| Reconciling | Draft remains visible/read-only; status `Checking whether your changes were saved…` | All mutation/dismiss actions locked; optional pending-intent `Stay here` remains available |
| Conflict | Field keeps the user's draft; inline comparison heading `This changed elsewhere.` with `Latest version` and `Your draft` full-value regions | `Use mine`; `Use latest`; `Copy draft` |
| Lifecycle invalidated | Context title slot becomes an inline recovery block: `Draft not saved`, `This Scratch is no longer editable.`, `Review or copy your draft before closing.`, and full `Your draft` value | `Copy draft`; `Close` |

`Copy draft` never changes editor state or focus and reports `Copied.` once in
the editor's polite atomic status line. A newer remote value updates only the
`Latest version` region and announces `Latest version updated.` once; it never
stacks a second resolver, resets the draft, or steals field focus.

### Conflict, Pending Intent, Focus, And Motion

- `Use mine` is the primary conflict action and starts one new conditional Save
  against only the latest version the user has acknowledged. `Use latest` is
  secondary, performs no write, adopts current truth, closes the editor, and
  returns to the surviving Edit control. `Copy draft` is tertiary.
- When save-before-action owns one pending intent, use `Saving before
  continuing…` instead of `Saving…`. `Stay here` cancels only that intent; it
  does not cancel an in-flight Save or clear the draft. Success runs the still-
  pending intent once; every non-success keeps the user in the matching editor
  state and runs no intent.
- Validation, offline, not-applied, and conflict retain logical field focus.
  Saving/reconciling keep the focused read-only field mounted. Applied Save
  announces `Saved.` once, closes, and returns to surviving Edit unless a
  pending intent owns the next destination.
- Scratch lifecycle invalidation preserves the recovery block until `Close`;
  closing hands focus to the canonical active-Scratch/Pool fallback. The draft
  is mounted-page memory only and is never persisted or reconstructed.
- All state changes are static and immediate. No spinner rotation, pulse,
  bounce, blink, scale, or layout-transition animation is used. Reduced motion
  has the identical copy, hierarchy, focus, and lifecycle.

### Eight-Theme Mapping

All themes preserve the same Context geometry ownership, exact copy, action
order, and state machine using canonical family roles only:

| Theme | Exact Context editor mapping |
|---|---|
| GridDO | Signature-plate title slot becomes a restrained semantic field; status/comparison use technical rules and canonical primary/secondary roles. |
| Tiny Desk | The title is edited on the same ruled memo sheet; status and comparison use margin annotations and paper sections, never a loose note. |
| Neumorphism | The title slot becomes an inset field inside the existing Context well; actions remain raised within that well. |
| Claymorphism | The sculpted Context keeps its silhouette while the title becomes an inset text channel with restrained state seams. |
| Origami | The title region becomes an inline paper field; comparison/recovery use additional seams within the same folded document. |
| Terminal | The Context buffer exposes one variable-driven editable title line plus static status/diff blocks; no modal terminal window or blinking status. |
| Retro Mac | The file-properties title line becomes an in-place 1-bit field with hard inline panes; no new window or draggable dialog. |
| Graphite | The headline becomes an editorial field; status and comparison use strengthened rules and labelled manuscript blocks. |

## Theme Realizations

### GridDO

- Observed source-only: a `min-h-[110px]` rounded signature plate uses a low primary gradient, primary border, and wide horizontal title/meta/actions layout. It declares a circular Edit control and a distinct sort control.
- Adopted fact: spacious product/ticket-like Context with technical primary accents is supported.
- Token implication: Context plate, eyebrow/meta, title, action cluster, and complete-state marker need semantic roles.

### Tiny Desk

- Observed source-only: a paper sheet declares `py-7`, left ruled margin, repeating top binding, blue horizontal rules, a red margin line, paper shadow, title/date, and Edit/sort controls. Complete source state adds a dog-ear/stamp treatment.
- Adopted fact: ruled-paper memo as the signature work surface is supported; exact source copy and stamp wording are not adopted.
- Token implication: paper sheet, rule/margin, binding, and complete stamp/dog-ear require Tiny Desk aliases.

### Neumorphism

- Observed source-only: a `min-h-[110px]` plate with `px-4 py-7`, `30px` radius, inset shadow, title/meta, circular raised controls, and source status marker is declared.
- Adopted fact: a broad inset identity plate with raised action controls is supported.
- Token implication: Context well and action button consume named inset/card shadows; the deferred lens is not inferred from the capsule sort.

### Claymorphism

- Observed source-only: a blue-tinted `p-7` Context uses `36px` radius, white border, compound inset/outer shadows, a top highlight, bold title/meta, Wand Edit, and rounded sort.
- Adopted fact: a large sculpted clay identity object is supported.
- Token implication: Context-specific clay surface/highlight/action roles should alias shared clay variables rather than preserve literals in JSX.

### Origami

- Observed source-only: `py-7` paper Context uses dashed/bottom borders, faceted metadata, fold/stamp geometry, mono title/time, and asymmetric Edit/sort controls.
- Adopted fact: a folded document/hang-tag signature surface is supported.
- Token implication: folded Context plate, dashed seam, and tag metadata need Origami aliases.

### Terminal

- Observed source-only: a `min-h-[110px]` black editor frame presents line-number-like metadata, title and stamp fields, a status line, Edit trigger, and sort control. The route also declares a pulsing completion stamp.
- Adopted fact: editor/buffer metadata framing is supported.
- Token implication: terminal Context editor frame, syntax-role text, status bar, and command actions should be variable-driven. Pulse is excluded.

### Retro Mac

- Observed source-only: a white double-border file window uses a black title strip, folder icon block, mono title/time, compact square Edit and sort controls, and a source complete stamp.
- Adopted fact: classic file-properties window grammar is supported.
- Token implication: double frame, title strip, folder identity, hard control, and complete stamp require Retro Mac aliases.

### Graphite

- Observed source-only: a wide editorial/poster Context uses a white or dark field, fine lines, mono timestamp, bold headline, square Edit, and a compact `⊕ ASC/DESC` sort control.
- Adopted fact: editorial metadata plate and drafting hierarchy are supported.
- Token implication: headline plate, timestamp, drafting rule, and action cluster need Graphite semantic roles.

## Exclusions And Verification

- Excluded: unsupported `VQ-11` blocker details, `D-LENS`, no-op prototype handlers, review variants, route-local complete latch, repeated pulse/bounce, and source copy as canonical copy.
- No Context height relative to actual rows, text fit, visual depth, complete/working distinction, focus behavior, light/dark parity, or motion was rendered or verified. Exact declarations remain source-only until this package is approved and later rendered checks occur.
