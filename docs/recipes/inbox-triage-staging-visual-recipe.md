# Inbox/Triage Staging — Visual Recipe

> Status: **Proposed — recipe-package user gate pending**
> Verification: **source-only; no rendered route/state was checked**
> Production owner: `StagingZone`, candidate hook/repository, and `TriageDragToken` (`LAND-STAGING`)

## Authority And Source Regions

- Product authority: [`DECISION.md`](../brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/DECISION.md) lines 523–750.
- Approved boundary: [`PROMOTION_MAP.md`](../brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/PROMOTION_MAP.md) §§10.1, 11.2, and 11.3.
- Design Source root: `/Users/jwk/Documents/griddo2-claude-themes2-3`.
- Staging regions: GridDO `page.tsx:1381-1503`; Tiny Desk `:1551-1632`; Neumorphism `:1281-1403`; Claymorphism `:1190-1322`; Origami `:1602-1714`; Terminal `:1205-1328`; Retro Mac `:1242-1369`; Graphite `:1351-1438` at that root.

## Shared Adopted Contract

- Keep visible `Staging`, `Nodes`, and `Bits` identity. Nodes are a two-column grid of icon-centered cards; Bits are a vertical list of text rows. Shape/information, not color alone, carries type.
- Preserve the selected Node/Bit `35/65` split, independent internal scroll containers, hidden scrollbar chrome, stable section height, and quiet empty state with no large placeholder cards.
- The candidate root is the full drag activator. Production retains the shared compact pointer-centered `TriageDragToken`; no internal handle, native snapshot, primary click, detail, or menu is adopted.
- During staged drag, the dedicated lower unstage overlay and Breakdown drop-back share one meaning. The overlay must not resize, blur, or move the lists.
- Base pending, invalid, same-type neutral, opposite-type unavailable, and drop-back meanings remain semantic states. Source mock mutations do not define their lifecycle.

## Decision-Prerequisite Boundary

- `VQ-06` — remote-arrival indicator, orphan/stale alerts, pending/failure details, navigation status, and related section-local statuses may use only the shared semantic-state envelope: state attributes, existing semantic/theme tokens, visible text/icon/non-color cues, and the selected focus/accessibility contract. Exact copy, count placement, alert placement/layout, effect, duration, and per-theme values are a **user-owned non-code Decision prerequisite**. Future owner: Staging recipe/token owner and durable-candidate/reliability phase; resume exact realization only after user receipt.
- `D-CARD` — common Node/Bit eight-theme card redesign and later Staging reuse are deferred. Current recipe covers Staging shapes without preselecting that future redesign.

## Theme Realizations

### GridDO

- Observed source-only: source declares `grid-cols-[38fr_62fr]`, which is not adopted over the selected `35/65`; Nodes use a two-column grid, Bits a vertical list, both with hidden scrollbars. Drop zones use primary/invalid state classes, and a bottom return target is declared.
- Adopted fact: clean technical zones, compact type cards, and a direct return-to-Breakdown target are supported.
- Token implication: staging panel, Node well/card, Bit well/row, pending, neutral, invalid, and unstage-target roles are needed.

### Tiny Desk

- Observed source-only: cork/paper Staging uses centered brown `Nodes`/`Bits`, two-column paper objects versus text slips, and a wood-wastebasket return target. Internal list scrollbars are hidden.
- Adopted fact: corkboard regions, paper candidate shapes, and a wastebasket-like transient return affordance are supported.
- Token implication: cork zone, Node note, Bit slip, and unstage target need Tiny Desk aliases; destructive delete semantics are not implied.

### Neumorphism

- Observed source-only: source declares exact `grid-cols-[35fr_65fr]`; both wells use `20px` radius and inset shadows; candidates use raised card shadows. A rounded bottom return target is declared.
- Adopted fact: inset Node/Bit wells and raised candidate objects are supported.
- Token implication: reuse named inset/card shadows for zone/candidate roles; source internal handles are excluded.

### Claymorphism

- Observed source-only: Staging consumes `--clay-staging-bg`; Nodes are square rounded clay objects and Bits rounded list objects. The bottom source target is a `Jelly Basket`; zone and card declarations use clay shadow variables.
- Adopted fact: tactile type-specific objects and a transient soft basket target are supported.
- Token implication: clay Node/Bit well and candidate roles should alias existing variables; keyboard activation text in source is not adopted.

### Origami

- Observed source-only: folded paper wells keep Node grid/Bit list shape; dashed/faceted borders and a lower scissors/slit target are declared. The source includes keyboard drop handlers and repeated pulse classes.
- Adopted fact: paper compartments and a transient slit/cut return affordance are supported.
- Token implication: paper well/candidate/slit roles are valid; keyboard mechanics and pulse are explicitly removed.

### Terminal

- Observed source-only: `Candidate Staging` contains framed `Nodes` and `Bits`; Node candidates appear as directory-like blocks and Bits as `EXEC_` rows. The lower source target is `/DEV/NULL`-like. Internal grip/keyboard handlers are present.
- Adopted fact: directory/executable shape distinction and a transient console return target are supported.
- Token implication: terminal status text provides a non-color cue; internal handles and keyboard placement are excluded.

### Retro Mac

- Observed source-only: `Staging Area` uses black/white folder-like Node tiles and document-like Bit rows, with a lower Trash target labeled as unstage. Hard borders and source drop patterns distinguish states.
- Adopted fact: classic file/folder shapes and transient Trash-like return target are supported as non-destructive unstage semantics.
- Token implication: Mac Node/Bit/target roles need explicit semantic naming so Trash imagery does not imply deletion.

### Graphite

- Observed source-only: a subtle panel contains line-separated Node grid and Bit list; a thin lower strip reads `Release Candidate from Staging`. The design uses grayscale borders with a compact X marker.
- Adopted fact: drafting compartments and an ultra-thin release strip are supported.
- Token implication: graphite zone/candidate/release roles should use shared grayscale variables plus visible text/icon state.

## Exclusions And Verification

- Excluded: exact `VQ-06` realization beyond the shared envelope, `D-CARD`, internal handles, keyboard-grab/drop mechanics, candidate label snapshots, local mock persistence, large empty placeholders, permanent unstage buttons, repeated pulse/blink/bounce/spin, and route-specific mutations.
- No drag target, pending candidate, scroll padding, last-item reachability, type distinction, remote arrival, alert, focus, contrast, or light/dark state was rendered or verified.
