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

- `VQ-10` — **resolved by `DP-VQ10` Choice A on 2026-08-11.** The card-attached always-visible status rail specified below preserves the actual common card, keeps selection, Newly provenance, and Undo eligibility independent, and owns exact available/ineligible/re-enabled, pending, unknown/reconciling, not-applied, conflict, focus, lifetime, motion, and eight-theme treatment. Task 157 is its only realization edge after Task 117 checkpoint acceptance.
- `D-CARD` — future common eight-theme Node/Bit card redesign remains deferred. This recipe layers only marker/control roles over the current common cards.

## `DP-VQ10` Approved Card-Attached Always-Visible Status Rail

Choice A keeps the existing actual `NodeCard` or `BitCard` as the sole card.
The card's existing selection, navigation, padding, radius, base color, and
internal content remain unchanged. One page-session Newly layer supplies a
static marker at the card's leading corner, a separate trailing Undo action,
and one compact status rail immediately below the card inside the same
Explorer item wrapper. The rail is an accessory to the actual card, not a
second card, card footer, menu, toast, dialog, or common-card redesign.

### Independent State And Overlap

- `selected`, `newly-placed`, and Undo eligibility are independent semantic
  states. The existing selected treatment and focus ring remain authoritative;
  Newly never replaces or recolors them. When both apply, the selected card
  keeps that treatment while the static marker, visible `NEW`/theme-equivalent
  non-color cue, Undo action, and status rail remain present.
- Losing Undo eligibility changes only the action/rail state. It never clears
  the marker, unselects the card, changes stored coordinates/order, blocks
  ordinary navigation, or creates a replacement result card.
- Undo handles its own pointer and keyboard activation without bubbling into
  selection/navigation. An unavailable action stays in the same trailing slot,
  remains keyboard-focusable with `aria-disabled="true"`, suppresses mutation,
  and references the always-visible rail reason. Hover is never required.

### Exact Eligibility Copy And Actions

The rail always reserves one compact text line and the stable trailing action
slot; long copy wraps inside the Explorer item's width without changing common
card internals or overlapping another card. Only the current authoritative
reason is shown.

| Eligibility state | Exact visible rail copy | Trailing action |
|---|---|---|
| Available | `Undo this placement.` | `Undo` |
| Re-enabled after dependencies clear | `Undo is available again.` | `Undo` |
| Result mutated or lifecycle changed | `This item changed after placement. Undo is unavailable.` | Unavailable `Undo` |
| Surviving descendants | `Undo newly placed items below this one first.` | Unavailable `Undo` |
| Open placement flow | `Finish or cancel the placement in progress first.` | Unavailable `Undo` |
| Archive or another operation owns the shared lock | `Wait for the current action to finish.` | Unavailable `Undo` |
| Dirty/saving Edit owns save-before-action | `Save or cancel the current edit before undoing.` | Unavailable `Undo` |
| Unknown mutation or authoritative conflict | `This item or its source changed. Undo is unavailable.` | Unavailable `Undo` |

Selection, navigation, Search reveal, theme/light-dark change, and Scratch/path
change do not produce an unavailable reason because they do not revoke
eligibility. When same-session reversible descendants are undone child-first
and no other blocker survives, the parent rail changes to the re-enabled row,
announces it once, and exposes `Undo` without moving focus.

### Exact Operation And Recovery Copy

Undo is non-optimistic: the actual result card, marker, source truth, and rail
remain rendered until authoritative success.

| Operation state | Exact visible rail copy / announcement | Action |
|---|---|---|
| Request pending | `Undoing “{title}”…` | Unavailable `Undo` in its stable slot |
| Outcome unknown | `We couldn’t confirm whether “{title}” was undone.` | `Check again` |
| Read-only reconciliation | `Checking whether “{title}” was undone…` | Unavailable `Check again` |
| Authoritative `not_applied` | `“{title}” wasn’t undone. Nothing changed.` | `Retry` |
| Authoritative `rejected` / `conflict` | Use the exact current eligibility reason above; if returned authority proves no narrower reason, use `This item or its source changed. Undo is unavailable.` | Unavailable `Undo`; no Retry |
| Authoritative `applied` / `already_applied` | `Restored “{source}”.` | None; remove only the result card after commit |

`Check again` performs read-only reconciliation with the same operation ID and
never resends Undo. `Retry` appears only for authoritative `not_applied`, reuses
that logical operation ID, and returns to pending. Unknown, reconciling,
rejected, conflict, mutation, and dependency states never Retry automatically,
cascade, overwrite, compensate, or infer success.

### Focus, Lifetime, Accessibility, And Motion

- Undo activation retains focus at its still-rendered action slot while
  pending. Unknown focuses `Check again`; reconciliation retains that position;
  not-applied focuses `Retry`. A conflict returns the same slot to the
  focusable unavailable `Undo` with its associated visible reason. Re-enabled
  state never moves focus.
- Terminal success removes the actual result only after the atomic repository
  result, announces `Restored “{source}”.` once without moving to the restored
  source, and focuses the next card, then previous card, then column heading.
  Search-result composition remains Task 158-owned and uses its approved next
  result, otherwise search-input handoff.
- Marker and ordinary available/ineligible rail last until authority changes
  or Inbox route exit/reload. Pending/unknown/reconciling/not-applied last until
  their named result/action. The re-enabled sentence lasts until Undo is
  activated, eligibility changes again, the user next activates that card, or
  route exit/reload; it has no timer. Scratch/path/theme/light-dark changes do
  not clear page-session provenance.
- The rail is visible text with a static non-color state mark and an associated
  polite atomic status. Announce each changed sentence once, never per rerender.
  Color, tooltip, hover, pulse, or motion never carries the only meaning.
- Every marker/rail/action/state change, card removal, and focus handoff is
  immediate and static. No fade, slide, scale, skeleton, shimmer, spinner,
  progress loop, pulse, ping, bounce, blink, flicker, or layout-transition
  animation is allowed. Reduced motion keeps identical geometry, copy,
  controls, focus, timing, and lifetime.

### Eight-Theme Marker And Rail Mapping

All themes use the same semantic state, copy, DOM order, action, and focus
contract. They bind only source-supported marker/control families and existing
semantic variables; product components never branch on theme ID.

| Theme | Card-attached realization |
|---|---|
| GridDO | Static sky dot plus technical `NEW`; compact ruled status rail and separate canonical Undo action |
| Tiny Desk | Static yellow paper edge and amber pin; narrow stationery note rail with brown Undo |
| Neumorphism | Static violet-blue dot/`NEW` capsule; shallow inset reason trough and raised Undo without pulse |
| Claymorphism | Static sky badge; compact sculpted reason ribbon and tactile rose Undo control |
| Origami | Static amber folded-corner marker; seam-attached paper rail and separate rose Undo with no animated fold |
| Terminal | Textual `[new]`; variable-driven `[UNDO]` action and one-line status record with no blink/glow loop |
| Retro Mac | Static 1-bit `[NEW]`; hard Undo button and in-item system line, preserving the existing selected inversion |
| Graphite | Restrained black `NEW` badge; strengthened-rule caption and labeled Undo with precise focus outline |

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

- Excluded: every `VQ-10` realization outside the approved card-attached always-visible rail; `D-CARD`; common-card internal/layout redesign; current main-card menu, generic disabled-button, toast/dialog, disclosure-only or hover-only reason fallback; all pulse/blink/flicker; mock `PlacedItem` data; source Undo mutation; Scratch-switch reset; permanent provenance; route-local ordering; and source accessibility behavior as evidence.
- No actual-card composition, selected+new overlap, pinned order, marker visibility, Undo hit target/reason, focus restoration, contrast, dependency recovery, retry, motion, or reduced-motion equivalence was rendered or verified.
