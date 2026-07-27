# Inbox/Triage Newly Placed And Undo — Visual Recipe

> Status: **Proposed — recipe-package user gate pending**
> Verification: **source-only; no rendered route/state was checked**
> Production owner: page-session placement projection over actual `NodeCard`/`BitCard` (`LAND-NEWLY`)

## Authority And Source Regions

- Product authority: [`DECISION.md`](../brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/DECISION.md) lines 1032–1124.
- Approved boundary: [`PROMOTION_MAP.md`](../brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/PROMOTION_MAP.md) §§10.1, 11.2, and 11.3.
- Design Source root: `/Users/jwk/Documents/griddo2-claude-themes2-3`.
- Marker helpers/Explorer ranges: GridDO `page.tsx:362-478,1504-1774`; Tiny Desk `:340-465,1633-1909`; Neumorphism `:275-392,1404-1679`; Claymorphism `:1323-1687`; Origami `:554-673,1715-2035`; Terminal `:1329-1710`; Retro Mac `:1370-1756`; Graphite `:298-414,1439-1743` at that root.

## Shared Adopted Contract

- The result is the actual existing Node/Bit card grammar. Newly Placed is a layered marker/treatment plus a separate Undo control, never a duplicate card model or transient indicator card.
- Preserve Node/Bit base differences. Marker provenance is page-session state; actual records remain at their stored coordinates even while the current page temporarily pins new cards by type.
- Undo remains visually separate from card navigation. Marker and Undo can coexist, but marker provenance does not imply rollback eligibility.
- Static or one-shot source candidates may be proposed. Every repeated `animate-pulse`, blink, ping, or flicker declaration is excluded.

## Decision-Prerequisite Boundary

- `VQ-10` — selected+newly overlap, unavailable Undo reasons, dependency recovery, undoing/retry/conflict, and other unsupported exact states may use only the shared semantic-state envelope: state attributes, existing semantic/theme tokens, visible text/icon/non-color cues, and selected focus/accessibility behavior. Exact marker overlap, reason placement/copy, effect, duration, and per-theme values remain a **user-owned non-code Decision prerequisite**. Future owner: card marker/Undo recipe owner and rollback phase; resume exact state realization only after user receipt.
- `D-CARD` — future common eight-theme Node/Bit card redesign remains deferred. This recipe layers only marker/control roles over the current common cards.

## Theme Realizations

### GridDO

- Observed source-only: Node and Bit helpers declare a sky dot, technical `NEW` badge, primary/sky border-shadow accents, a separate Undo icon button, and bracket accents when selected+newly overlap. Pulse-free static parts are directly identifiable; source helper itself does not pulse the base marker.
- Adopted fact: compact blue technical marker + `NEW` label + separate Undo is supported for the base state.
- Token implication: marker dot, NEW badge, newly border/shadow, and Undo action need semantic roles; selected overlap remains `VQ-10`.

### Tiny Desk

- Observed source-only: helpers declare a yellow paper edge, amber dot, brown Undo, and paper-card treatment. The amber dot and card include `animate-pulse`.
- Adopted fact: the static yellow paper edge, amber pin/dot, and stationery Undo placement are supported; all pulse declarations are removed.
- Token implication: paper-edge marker and pin roles need Tiny Desk aliases.

### Neumorphism

- Observed source-only: helpers declare a violet-blue dot, `NEW` capsule, raised circular Undo, and combined card/glow shadow; dot/card also declare pulse.
- Adopted fact: the static dot, label capsule, raised Undo control, and non-repeating shadow candidate are supported.
- Token implication: newly shadow must compose through a semantic layer without overriding selected state; exact overlap remains `VQ-10`.

### Claymorphism

- Observed source-only: in-route cards declare a sky dot, small `NEW` capsule, rose Undo in an inset circular control, and clay border/shadow. Repeated pulse appears on marker/card.
- Adopted fact: static clay marker/badge and tactile Undo placement are supported.
- Token implication: newly badge, marker, and Undo roles should consume clay variables; pulse is excluded.

### Origami

- Observed source-only: helpers declare an amber folded-corner triangle, paper border/opacity treatment, and rose Undo. The source includes `animate-gentle-pulse` on the card.
- Adopted fact: the static folded-corner marker and separate Undo are supported.
- Token implication: corner-fold marker is the primary Origami newly role; animation is not adopted.

### Terminal

- Observed source-only: cards declare a textual green `[new]` badge, framed card treatment, and red bordered Undo command. Card/badge source includes pulse.
- Adopted fact: static `[new]` text and separate command Undo provide an approved non-color cue.
- Token implication: terminal marker/status/action must remain text-led and variable-driven; glow/pulse is excluded.

### Retro Mac

- Observed source-only: cards declare black `[NEW]` badges, inverted selected/new formatting, and a hard-border Undo button. The card source includes pulse.
- Adopted fact: static 1-bit badge and hard Undo control are supported.
- Token implication: `[NEW]` badge and Undo button roles need Retro Mac aliases; selected overlap remains unresolved under `VQ-10`.

### Graphite

- Observed source-only: helpers declare a black `NEW` badge, thin border/shadow candidate, explicit text `Undo`, and bracket accents for selected+newly. The helper includes pulse on the card.
- Adopted fact: static editorial badge, thin outline, and labeled Undo are supported.
- Token implication: Graphite marker/outline/Undo roles should remain restrained and non-repeating.

## Exclusions And Verification

- Excluded: exact `VQ-10` states beyond the shared envelope, `D-CARD`, all pulse/blink/flicker, mock `PlacedItem` data, source Undo mutation, Scratch-switch reset, permanent provenance, route-local ordering, and source accessibility behavior as evidence.
- No actual-card composition, selected+new overlap, pinned order, marker visibility, Undo hit target/reason, focus restoration, contrast, dependency recovery, retry, motion, or reduced-motion equivalence was rendered or verified.
