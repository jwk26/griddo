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

- `VQ-08` — **resolved by `DP-VQ08` Choice A on 2026-08-10.** The fixed reliability rail specified below stays inside the captured target-column Placement Affordance, retains its source/type/destination identity, and owns exact pending, unknown/reconciling, not-applied, stale-source/target, Retry/Cancel, success-announcement, focus, lifetime, motion, and eight-theme treatment. Task 153 is its only realization edge after Task 115 checkpoint acceptance.
- `VQ-09` — **resolved by `DP-VQ09` Choice A on 2026-08-11.** The compact step card specified below owns the staged over-limit Result Title step and direct Node/Bit availability rows inside the captured Placement Affordance. It preserves the source, exposes exact non-truncating validation and unavailable reasons, and supplies the only Task 154 realization after Task 116 checkpoint acceptance.

## `DP-VQ08` Approved Fixed Reliability Rail

Choice A adds one fixed two-line reliability rail directly below the retained
source, result type, and destination summary and directly above one fixed
action row. The rail and action row reserve their final geometry before
Confirm, so state/copy changes neither expand the target column nor clip its
controls. The target column's existing scroll content remains the only scroll
owner. No state leaves this captured affordance for a toast, dialog, global
alert, detached panel, or adjacent surface.

### Exact State Copy And Actions

| State | Exact rail copy / announcement | Available action |
|---|---|---|
| Confirmed request pending | `Placing “{title}” in {destination}…` | None |
| Outcome unknown | `We couldn’t confirm whether “{title}” was placed.` | `Check again` |
| Read-only reconciliation | `Checking whether “{title}” was placed…` | None |
| Authoritative `not_applied` | `“{title}” wasn’t placed. Your source is unchanged.` | `Retry`, `Cancel` |
| Stale source | `The source changed. Nothing was placed. Cancel and drag it again.` | `Cancel` |
| Stale target | `The destination changed. Nothing was placed. Cancel and drag to the current destination.` | `Cancel` |
| Authoritative `applied` / `already_applied` | `Placed “{title}” in {destination}.` | None; transition to the actual card |

`applied` and `already_applied` map only to success; `not_applied` maps only to
the retryable not-applied row. `rejected` or `conflict` maps to stale source or
stale target from the returned authoritative source/target facts; it never
creates a generic fallback state or guesses which side changed.

`Check again` performs read-only reconciliation with the same operation ID; it
never resends the placement. `Retry` appears only after authoritative
`not_applied`, reuses that logical operation and its preallocated result ID,
and returns the rail to pending. Rejected/conflict or stale source/target never
offers Retry. Cancel closes the flow without a write and never queues or
automatically replays a blocked navigation request.

### Focus, Locking, And Result Handoff

- Confirm activation retains focus on the still-rendered Confirm control while
  pending. The control and visible Cancel remain in their fixed locations but
  are unavailable with programmatic activation suppressed; all conflicting
  DnD, Scratch, Grid path/search, route, Archive, and Undo actions remain
  locked. Pending never removes the source/candidate or creates a projected
  result.
- An unknown outcome replaces the fixed action row with `Check again` and
  focuses it. Activating it retains focus at that same position while the
  unavailable action reconciles. Repeated activation cannot start another
  read or mutation.
- Authoritative `not_applied` exposes `Retry` followed by `Cancel` and focuses
  `Retry`. Returned authority classifies rejected/conflict as stale source or
  stale target; that rail exposes only `Cancel` and focuses it. The
  source still exists only when authoritative state says it does; no stale
  snapshot is restored or used to infer a result.
- Cancel/Escape after a terminal non-success returns focus to the surviving
  Breakdown grip or staged candidate surface; if that source no longer exists,
  it focuses the owning Breakdown or Staging section heading. Escape is locked
  during pending/reconciliation just like visible Cancel.
- Authoritative success announces the exact success sentence once, removes the
  affordance without an intermediate success timer or decorative success
  card, renders the actual repository Node/Bit, and focuses that card. The
  actual card is the sole visible result; Newly Placed/Undo appearance remains
  owned by `DP-VQ10` and is not invented here.

### Lifetime, Accessibility, And Motion

- Pending lasts from Confirm until an authoritative result or unknown outcome.
  Unknown lasts until `Check again`; reconciliation lasts until its
  authoritative result or another unknown outcome. Not-applied and stale
  states persist until their named action. None auto-dismisses.
- The rail is one visible, polite, atomic status. Announce each changed
  sentence once, never on a rerender, and never move focus merely because copy
  changed. Text plus the rail's static non-color state mark carries meaning;
  color alone never does.
- Every rail/action replacement, affordance removal, actual-card insertion,
  and focus handoff is immediate and static. No fade, slide, scale, skeleton,
  shimmer, spinner, progress loop, pulse, ping, bounce, blink, flicker, or
  layout-transition animation is allowed. Reduced motion keeps identical
  geometry, copy, controls, focus, timing, and lifetime.

### Eight-Theme Reliability-Rail Mapping

All themes bind the same semantic state, copy, DOM order, actions, and focus
contract through existing theme roles. Product components never branch on
theme ID and no literal observed source value becomes reliability authority.

| Theme | Fixed-rail realization |
|---|---|
| GridDO | Restrained technical status rail with canonical semantic border, text, action, and focus roles |
| Tiny Desk | Narrow pinned status slip beneath the retained placement summary |
| Neumorphism | Shallow inset status trough inside the existing shadow family |
| Claymorphism | Compact sculpted status ribbon whose static shape carries state without motion |
| Origami | Seam-attached status strip with a fixed paper edge and no animated fold |
| Terminal | Variable-driven one-line `[SYS]` status record with text/non-color state cue and no blink |
| Retro Mac | In-pane 1-bit system line with hard action controls and no new window or dialog |
| Graphite | Strengthened-rule status caption with restrained monochrome action and precise focus outline |

## `DP-VQ09` Approved Compact Result-Title And Direct-Limit Steps

Choice A keeps both replacement surfaces inside the captured target-column
Placement Affordance as compact, visually distinct steps. The existing target
column scroll content remains the only scroll owner; neither step expands the
column, opens a dialog, edits the source, truncates text, or supplies an
automatic type fallback.

### Staged Over-Limit Result Title

This step appears only when a staged candidate's source title exceeds the
chosen result type's SCHEMA limit: 100 characters for Node or 200 for Bit. A
within-limit staged title proceeds without this step and keeps the exact source
title. An over-limit step starts with an empty draft rather than a truncated or
normalized source copy.

| Element | Exact contract |
|---|---|
| Eyebrow / heading | `RESULT TITLE` / `Name this {Node|Bit}` |
| Explanation | `The source is {count} characters. A {Node|Bit} title can be up to {limit}. The source won’t change.` |
| Field / counter | Label `Result title`; visible counter `{count} / {limit}` |
| Empty error | `Enter a result title.` |
| Over-limit error | `Use {limit} characters or fewer.` |
| Actions | `Continue`, then `Cancel`; Continue is unavailable while the canonical non-empty/length validation fails |

The input accepts the draft without silently clipping, truncating, or
substituting the source. Its associated error and counter update without
moving focus or announcing each keystroke. `Continue` advances only with the
exact valid draft and focuses the next placement-step heading. It changes no
source content; that source remains the Undo/restoration truth.

Entry focuses `Result title`. Cancel or Escape discards only this uncommitted
draft and returns focus to the surviving staged candidate, otherwise the
Staging heading. A source, candidate, target, or reachable-path invalidation
closes the flow, discards the draft, performs no write, announces the named
authoritative change once, and uses the same safe focus fallback. Only a dirty
Result Title draft may use the native browser-unload guard; no internal intent
is queued or replayed.

### Direct Type Availability

Direct placement never shows a Result Title input. Its compact step uses exact
eyebrow `DIRECT PLACEMENT`, heading `Choose a result type`, the retained source
and destination path, one `Node` row, one `Bit` row, and `Cancel`.

| Direct source length | Node row | Bit row | Additional exact copy |
|---|---|---|---|
| `1–100` | Available | Available | None |
| `101–200` | Unavailable: `Node titles can be up to 100 characters. This source has {count}.` | Available | None |
| `201–1000` | Unavailable: `Node titles can be up to 100 characters. This source has {count}.` | Unavailable: `Bit titles can be up to 200 characters. This source has {count}.` | `This source is too long for direct placement. Cancel and stage it first.` |

Each unavailable row remains visible, uses native unavailable semantics, and
references its reason through an accessible description; color or hover never
carries the reason alone. Entry focuses the step heading, then the normal tab
order reaches only available type actions and Cancel. Activating an available
type preserves the source/target snapshot, advances to the distinct placement
step, and focuses its heading. Cancel/Escape writes nothing and returns to the
surviving Breakdown grip, otherwise the Breakdown heading. Source/target/path
invalidation closes the step with the same no-write and focus rules.

### Lifetime, Motion, And Eight Themes

Both steps last until valid advance, Cancel/Escape, invalidation, or route
exit. Every step swap, validation-state change, close, and focus handoff is
immediate and static. There is no fade, slide, scale, spinner, shimmer, pulse,
ping, bounce, blink, flicker, or layout-transition animation; reduced motion
keeps identical geometry, copy, controls, focus, and lifetime.

All themes bind one semantic DOM order and contract through Placement-native
roles; product components never branch on theme ID:

| Theme | Compact-step realization |
|---|---|
| GridDO | Compact technical form card and ruled Node/Bit eligibility rows with canonical error/action/focus roles |
| Tiny Desk | Pinned paper form slip and two-line library-index type rows inside the target column |
| Neumorphism | Raised compact step with inset title field, counter, reason trough, and existing shadow variables |
| Claymorphism | Sculpted compact form plate and tactile type rows whose static shape carries availability |
| Origami | Folded label sheet, seam-bound field/error, and cut-paper type rows with no animated fold |
| Terminal | Variable-driven prompt field, static count/error record, and `[N]`/`[B]` rows with textual unavailable reasons |
| Retro Mac | In-pane compact system form with hard field/buttons and disabled type rows; no new window or dialog |
| Graphite | Restrained registry form and strengthened-rule eligibility rows with monochrome reason and precise focus outline |

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
- Token implication: direct, confirmation, warning, Confirm, and Cancel roles should alias clay variables; reliability variants use the approved `DP-VQ08` fixed rail without changing the base clay object.

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

- Excluded: every placement-reliability realization outside the approved `DP-VQ08` fixed rail; every Result Title/direct-limit realization outside the approved `DP-VQ09` compact steps; generic/global Dialog fallback, source mutation/truncation/timers, direct hidden editor, keyboard handlers, automatic type/target fallback, partial writes, repeated pulse/ping/spin/bounce, and source copy as product copy.
- No target-column containment, clipping, full-target state, disabled action, step distinction, focus containment, scrolling, pointer hit testing, pending/retry state, contrast, or light/dark outcome was rendered or verified.
