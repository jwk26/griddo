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

- `VQ-04` — the Scratch inline editor and saving/offline/conflict/lifecycle-invalid/copy states form an absent replacement surface. The no-op source Edit buttons and compact Context are not fallbacks. **User-owned Decision prerequisite:** approve a direct inline realization. Future owner: Context/row editing phase; its dependent UI task resumes only with a matching receipt.
- Context subset of `VQ-11` — title-editor completion blocker may use only the approved shared semantic-state envelope. Exact blocker copy, position, layout, effect, and per-theme values remain a **user-owned non-code Decision prerequisite**. Future owner: Context recipe/token owner and archive phase; exact UI resumes only after receipt.
- `D-LENS` — Neumorphism water-lens sort treatment is deferred and excluded.

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

- Excluded: every `VQ-04` editor surface, unsupported `VQ-11` blocker details, `D-LENS`, no-op prototype handlers, review variants, route-local complete latch, repeated pulse/bounce, and source copy as canonical copy.
- No Context height relative to actual rows, text fit, visual depth, complete/working distinction, focus behavior, light/dark parity, or motion was rendered or verified. Exact declarations remain source-only until this package is approved and later rendered checks occur.
