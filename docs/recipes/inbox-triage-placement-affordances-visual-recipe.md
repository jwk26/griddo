# Inbox/Triage Placement Affordances — Visual Recipe

> Status: **Proposed — recipe-package user gate pending**
> Verification: **source-only; no rendered route/state was checked**
> Production owner: decomposed placement state owners coordinated by `TriageWorkspace` (`LAND-PLACEMENT`)

## Authority And Source Regions

- Product authority: [`DECISION.md`](../brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/DECISION.md) lines 887–1030.
- Approved boundary: [`PROMOTION_MAP.md`](../brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/PROMOTION_MAP.md) §§10.1, 11.2, and 11.3.
- Design Source root: `/Users/jwk/Documents/griddo2-claude-themes2-3`.
- Placement subregions are inside GridDO `page.tsx:1504-1774`; Tiny Desk `:1633-1909`; Neumorphism `:1404-1679`; Claymorphism `:1323-1687`; Origami `:1715-2035`; Terminal `:1329-1710`; Retro Mac `:1370-1756`; Graphite `:1439-1743` at that root.

## Shared Adopted Contract

- Direct flow first shows a Node/Bit and destination-path selection surface, then a visually distinct target-column placement affordance. Staged flow opens the target-column placement affordance directly.
- The base affordance names source, result type, and destination. Confirm and Cancel are visually distinct. A full target keeps the affordance present, adds a direct warning, disables Confirm, and never suggests an automatic alternate target.
- Placement stays inside the target column scroll content and cannot expand or clip the column. Its visual shell does not turn into a full-screen modal merely for focus containment.
- Pointer DnD is the only entry in this promotion. No placement button/menu, keyboard DnD, destination picker, hidden shortcut, or unfinished alternative is added.
- Source confirmation mutations are mock-only. Atomicity, revalidation, pending/reconciliation, Retry, focus, and navigation guards come from product/canonical behavior authority.

## Decision-Prerequisite Boundary

- `VQ-08` — pending, reconciling, failure, Retry, and stale-source/target appearance beyond the sourced base affordance may use only the shared semantic-state envelope: state attributes, existing semantic/theme tokens, visible text/icon/non-color cues, and selected focus/accessibility behavior. Exact copy, location, layout, effect, duration, and per-theme values remain a **user-owned non-code Decision prerequisite**. Future owner: placement recipe/token owner and reliability phase; resume exact styling only after user receipt.
- `VQ-09` — staged over-limit Result Title and direct unavailable-limit content states are an absent replacement surface. They are wholly excluded; create dialogs, generic placement dialogs, and prototype type chooser are not fallbacks. **User-owned Decision prerequisite:** approve the direct Result Title/limit realization. Future owner: placement-title phase; no dependent UI task starts until matching receipt.

## Theme Realizations

### GridDO

- Observed source-only: direct choice is a card overlay with `DIRECT PLACEMENT`, source title, target path, stacked Node/Bit actions, and Cancel. Base confirmation is a bordered primary-tinted column card with type/title and Confirm/Cancel. Invalid hover declares a direct icon+message overlay.
- Adopted fact: compact technical step cards and primary target-column confirmation are supported.
- Token implication: direct-step shell, staged confirmation shell, target path, Confirm, Cancel, full-target warning, and disabled Confirm need semantic roles.

### Tiny Desk

- Observed source-only: direct choice is a cream paper slip with mono label and Folder path; Node/Bit actions read like paper controls. Confirmation is a pinned yellow paper slip with brown Confirm/Cancel; invalid state is a red-marked paper notice.
- Adopted fact: pinned stationery slips and paper warnings are supported.
- Token implication: direct slip, pinned confirmation, paper warning, and action roles need Tiny Desk aliases.

### Neumorphism

- Observed source-only: direct choice is an `18px` raised soft card with source/path and rounded actions. Confirmation is a `20px` raised plate with rounded Place/Cancel; invalid state is an inset soft status card.
- Adopted fact: raised step plates and inset warning treatment are supported.
- Token implication: use existing card/inset shadow variables; do not claim rendered depth or substitute the deferred lens.

### Claymorphism

- Observed source-only: direct choice is a blue-tinted `20px` clay plate with bold source/path and rounded actions. Confirmation is an amber `24px` capsule with explicit pending-type label and Confirm/Cancel; invalid state is a rounded clay alert.
- Adopted fact: distinct cool direct-choice and warm confirmation objects are supported as base step differentiation.
- Token implication: direct, confirmation, warning, Confirm, and Cancel roles should alias clay variables; reliability variants remain `VQ-08`.

### Origami

- Observed source-only: direct choice is a folded paper card with source/path and faceted Node/Bit actions. Confirmation is a paper tag with an amber left edge and compact actions; invalid state is a dashed cut-paper message.
- Adopted fact: folded choice sheet, tagged confirmation, and cut-paper warning are supported.
- Token implication: fold-step, tag-edge, warning seam, and action roles need Origami aliases. Keyboard-grab UI is excluded.

### Terminal

- Observed source-only: direct choice is a black console block with source/path, `[N]`/`[B]` actions, and `[ESC] Cancel`. Confirmation is `[SYS: CONFIRM PLACEMENT?]` with framed Yes/Cancel actions; invalid state is an explicit console error.
- Adopted fact: command-step and system-confirmation text frames are supported.
- Token implication: text and icon cues must accompany color; exact route copy is not canonical copy.

### Retro Mac

- Observed source-only: direct choice is a compact white system window with title strip, source/disk path, hard Node/Bit buttons, and Cancel. Confirmation is a black marquee/dotted white card; invalid state is a double-border system alert.
- Adopted fact: classic modal-like subwindow inside the column and marquee confirmation are supported.
- Token implication: title strip, hard control, marquee, and alert roles need Retro Mac aliases; the surface remains column-scoped.

### Graphite

- Observed source-only: direct choice is a dark registry card with source/scope and restrained stacked actions. Confirmation is a docked white strip with `Confirm Placement`, source title, and compact controls; invalid state is a monochrome bordered notice.
- Adopted fact: dark registry choice versus light docked confirmation is supported.
- Token implication: direct registry, docked confirmation, monochrome warning, and action roles need Graphite aliases.

## Exclusions And Verification

- Excluded: all `VQ-09`, exact `VQ-08` reliability details beyond the shared envelope, generic/global Dialog fallback, source mutation/timers, keyboard handlers, automatic target fallback, partial writes, repeated pulse/ping/spin/bounce, and source copy as product copy.
- No target-column containment, clipping, full-target state, disabled action, step distinction, focus containment, scrolling, pointer hit testing, pending/retry state, contrast, or light/dark outcome was rendered or verified.
