# Inbox/Triage 2-4 Prototype - Functional And UX Gap Notes

## Purpose

This document summarizes which Inbox/Triage functionality and UX states exist in
the current `griddo2-claude` implementation but are not yet represented in the
8 Inbox/Triage 2-2 prototypes in `griddo2-claude-themes2-2`.

This is not production code work. The goal is to preserve the design quality and
theme identity of the 2-2 prototypes while blending the latest Inbox/Triage
functionality into a new 2-4 prototype set.

Core premises:

- The work target is prototype code.
- The 2-2 prototypes are the design baseline.
- The current main implementation is the functional/UX reference.
- Do not copy the weaker visual styling of the main implementation.
- The prototypes do not need real persistence, production hooks, or exact DnD
  state-machine behavior.
- The prototypes are design artifacts that show how the current Inbox/Triage UX
  should feel, not fully functional production screens.

## Reference

### Production Reference

Read these files only to understand functionality and UX. Do not copy their
visual styling.

- `/Users/jwk/Documents/griddo2-claude/src/components/triage/triage-workspace.tsx`
- `/Users/jwk/Documents/griddo2-claude/src/components/triage/scratch-pool.tsx`
- `/Users/jwk/Documents/griddo2-claude/src/components/triage/breakdown-panel.tsx`
- `/Users/jwk/Documents/griddo2-claude/src/components/triage/staging-zone.tsx`
- `/Users/jwk/Documents/griddo2-claude/src/components/triage/hierarchy-explorer.tsx`

### Prototype Source

These 8 files are the design source. Do not modify them directly. Create a 2-4
worktree and update the copies there.

- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-griddo/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-tiny-desk/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-neumorphism/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-claymorphism/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-origami/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-terminal/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-retro-mac/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-graphite/page.tsx`

## Short Context

The 2-2 prototypes were created to explore the design of the four-area
Inbox/Triage workspace:

- Scratch Pool
- Breakdown
- Staging
- Hierarchy/Grid

At that time, the prototypes focused on UX direction and theme-specific visual
language, not full production behavior. Since then, main has added or clarified
Scratch search/sort, collapsed Scratch switching, selected Scratch context,
remove-from-staging, scoped hierarchy search, and placement confirmation.

Therefore, the 2-4 task is not "copy main." It is a design update: preserve the
2-2 visual language and reinterpret the newer functional states inside it.

## Shared Decisions

| Topic | Decision |
| --- | --- |
| Work target | New 2-4 prototype worktree |
| Source worktree | `griddo2-claude-themes2-2` |
| Target worktree | `griddo2-claude-themes2-4` |
| Production code | Do not modify |
| 2-2 worktree | Do not modify directly |
| Work type | Update, not redesign |
| Design baseline | Theme identity from the 2-2 prototypes |
| Functional reference | Current Inbox/Triage functionality from main |
| Implementation depth | Prefer visual/UX representation over production behavior |
| Icons | No emoji. Use lucide icons as a prototype-project-wide rule |

## Design Preservation Priority

This task does not replace or recreate the 2-2 prototype designs. Even when new
features and states are added, preserve each theme's existing composition,
density, texture, typography, color language, decorative language, and motion
feel first.

The requested updates must be absorbed into the existing 2-2 design language. If
new UI is needed, do not import main's styling and do not attach the same generic
component to every theme. First inspect how each theme already treats headers,
surfaces, buttons, badges, rows, cards, and icons, then extend that language.

When in doubt, prefer preserving the polish and identity of the existing
prototype over making the new function more visually dominant.

## Preview UI Decisions

The preview UI is a temporary review tool for the 2-4 prototypes. It may be
removed after the design is approved.

Terminology:

- `Preview heading`: the title at the top of the preview shell/body that wraps
  the theme prototype.
- `Section label/header/chrome`: theme-internal area labels and chrome around
  `Scratch Pool`, `Breakdown`, `Staging`, and `Grid`.
- Remove the preview heading.
- Keep theme-internal section label/header/chrome.

- Add a sidebar with the 8 themes numbered from `1` to `8`.
- Add theme-switching buttons in the sidebar. Hover switching is acceptable, but
  click/focus operation should also work.
- Add an EN/KR toggle in the sidebar.
- Remove the preview heading at the top of the body.
- Exceptions:
  - Keep the retro mac theme's existing heading/chrome.
  - For the terminal theme, absorb only the heading's design language into the
    theme and remove the preview heading itself.
  - For the origami theme, reuse the scissors motif as an edit button icon if it
    is not emoji. If the existing motif is emoji, use lucide `Scissors`.
- Do not use emoji in the preview UI. Use lucide icons where icons are needed.

## Language / Label Decisions

All 8 themes need English and Korean versions. The sidebar EN/KR toggle switches
between them.

The Korean version needs a different font treatment from the English version.
Do not simply paste translated strings; make Korean typography feel native to
each theme.

The main implementation removed visible section labels, but the 2-4 prototype
direction is to restore/keep labels. The 2-2 prototypes already have
label/header/chrome, so keep that structure as the design basis.

| Section | English | Korean |
| --- | --- | --- |
| Scratch Pool | Scratch Pool | 스크래치 모음 |
| Breakdown | Breakdown | 아이디어 분해 |
| Staging | Staging | 대기열 |
| Staging subsection | Node | 노드 |
| Staging subsection | Bit | 비트 |
| Hierarchy/Grid | Grid | 프로젝트 탐색기 |
| Hierarchy level | Home | 홈 |
| Hierarchy level | Level 1 | 레벨 1 |
| Hierarchy level | Level 2 | 레벨 2 |
| Hierarchy level | Level 3 | 레벨 3 |

## Scrollbar Decision

Hide visible scrollbar chrome in all major areas. Keep scrolling if the content
needs it, but the scrollbar itself should not be visually prominent.

- Scratch Pool list
- Breakdown row list
- Staging Node
- Staging Bit
- Each Hierarchy/Grid section

## Gap Table

### Scratch Pool

| Item | 2-2 Prototype State | Main Implementation / New Requirement | 2-4 Prototype Target |
| --- | --- | --- | --- |
| Tools structure | Theme-specific header/chrome plus list; no Scratch search/sort. | Main split icon/count/collapse and search/sort into separate strips, which feels fragmented. | Use a top tools section and lower Scratch list section. Integrate identity/count/collapse/search/sort into one tools section. |
| Scratch search | Missing. | Main has Scratch title search. | Add search inside the tools section. Full filtering behavior is less important than making the title-search UX visible. |
| Created-at sort | Rows may show time, but there is no sort control. | Main can sort by created-at asc/desc. | Put search and sort on one row. Make the sort button theme-specific and show clicked/unclicked or asc/desc state clearly. |
| Collapsed switcher | Some themes have dot/mark-like collapsed affordances. | Main has collapsed Scratch switching. | In collapsed mode, arrange all elements vertically. The selected item must read clearly stronger than inactive items. |
| Label | 2-2 keeps label/header. | Main removed labels. | Keep labels in 2-4. |

### Breakdown

| Item | 2-2 Prototype State | Main Implementation / New Requirement | 2-4 Prototype Target |
| --- | --- | --- | --- |
| Section label/header | Theme-specific labels such as `Breakdown / Scribble`, `Breakdown`, or `Scribble / Fold`. | Main removed labels. | Keep the 2-2 label/header. |
| Sort toggle | Missing or unclear. | Breakdown rows need desc/asc toggle. | Add a desc/asc toggle button. |
| Input submit | Many 2-2 themes already have an input-side submit button. | Main is mostly Enter-submit oriented. | Keep and strengthen the explicit submit button to the right of the input. |
| Scratch context | Often small header meta. | Main has row-top context, but it can look too similar to normal rows. | Make the active Scratch context larger and more visually distinct from rows. This is an important creative theme-specific area. |
| Scratch context edit | Missing. | The context needs an edit affordance. | Add an always-visible edit button to Scratch context. |
| Breakdown row actions | Hover/actions may be weak. | Row edit/trash affordances are needed. | Always show edit and trash icons. Use lucide icons and express them in each theme's language. |
| Row numbering | Some prototypes use numbering. | Remove. | Remove row numbering. |
| Row time | Some rows show time. | Hide time in UI, though sorting still implies time exists in data. | Do not show row time text. |
| Staged state | Staged rows may disappear or lack state. | Main de-emphasizes staged rows. | Keep staged rows visible with a state treatment. Do not copy main styling; propose theme-specific expression. |
| Placed state | Main uses de-emphasis and line-through-like treatment. | Prototype direction is that rows are consumed when actually placed. | Once placed through staging or direct hierarchy placement, remove the Breakdown row. |
| Breakdown empty background prompt | Empty row lists may look blank or show generic empty text. | An empty Breakdown list should still invite the next action. | When there are no Breakdown rows and the archive alert is not covering the section, show a theme-specific prompt in the Breakdown section background. `Breakdown your Ideas` is only an example; express it in each theme's own language. |
| Archive affordance | Not consistently represented. | Archive becomes relevant when all rows are consumed. | Blur the entire Breakdown section and show an archive affordance above it. Include Cancel/OK. If cancelled, show an in-section affordance opener; the Scratch context should become a theme-specific "Scratch complete" state. OK represents archiving the Scratch so it no longer appears in Inbox. |

### Staging

| Item | 2-2 Prototype State | Main Implementation / New Requirement | 2-4 Prototype Target |
| --- | --- | --- | --- |
| Empty state | Some themes show empty labels/placeholders. | Empty Node/Bit staging should not show empty placeholder labels. | Keep section label/header. When a Node/Bit staging section has no item, do not show an empty placeholder label inside it. |
| Node/Bit distinction | Themes already use different card/grid/list forms. | Node/Bit distinction must remain clear. | Keep Node as card/icon/grid-like and Bit as row/list-like. |
| Remove from staging | Weak or not theme-specific. | Main has remove-from-staging during staged-item drag. | Add a creative theme-specific remove-from-staging affordance. Do not make it a generic neutral bar. |
| Drag back to Breakdown | Unclear. | Dragging a staged Node/Bit to Breakdown should behave like remove-from-staging. | Represent Breakdown drop-back as the same meaning as remove-from-staging. Visual state matters more than real DnD behavior. |
| Invalid drop tone | Some themes use strong warning/rings or unclear states. | Main's muted invalid tone is not visually satisfying. | Antigravity should propose each theme's invalid/unavailable tone. Do not copy main styling. |

### Hierarchy / Grid

| Item | 2-2 Prototype State | Main Implementation / New Requirement | 2-4 Prototype Target |
| --- | --- | --- | --- |
| Search position | Current 2-2 search placement is good. | Main has scoped hierarchy search. | Keep the search bar in the prototype's current position. |
| Level labels | Abbreviations such as `L1/L2/L3`. | User-facing labels should be clearer. | Use `Home`, `Level 1`, `Level 2`, `Level 3` / `홈`, `레벨 1`, `레벨 2`, `레벨 3`. |
| Selected node meta | Some designs repeat selected node text under column labels. | Active item styling is enough. | Remove repeated selected node text under section labels. Express selection through item color/surface/emphasis. |
| Search clear | Clear model may be missing or use both X and clear text. | X plus Clear text is unnecessary. | Use only an X clear affordance. No visible `Clear` text. |
| Home/Level constraints | Not always signaled. | Home accepts Nodes only; Level 3 grid accepts Bits only. | Show Node-only / Bit-only drop signals in the hierarchy when staged items are dragged. Make this theme-specific. |
| Staged Node/Bit placement | After Confirm, it may appear as a `Node: ...` / `Bit: ...` placed indicator card. | In main, after Confirm the actual Node/Bit is placed into the target path. | When a staged Node/Bit is dropped into a hierarchy column, keep the existing Placement Affordance and Confirm/Yes step. After Confirm, render the actual Node/Bit card in the target path. Do not replace the final result with a checkbox + `Node: ...` indicator card. |
| Direct Breakdown row placement | Missing or simplified. | Direct row drop still needs Node/Bit choice, target path confirmation, and actual Node/Bit placement after Confirm. | If a row itself is dropped, first show a modal-like affordance where the user chooses Node/Bit and sees the target path. The choices must follow the target column constraint: Home allows Node only, and Level 3 allows Bit only. Then keep the existing Placement Affordance/Confirm step, and after Confirm render the actual Node/Bit card in the target path. |
| Placed item undo | Not clearly represented in 2-2. | Fast placement mistakes must be reversible. | Actual Node/Bit cards placed through the hierarchy menu must include an Undo button on the right side. Undo from staged Node/Bit placement restores the item to Staging; Undo from direct row drop restores the original Breakdown row. |

## What Does Not Need Real Prototype Implementation

The following production behaviors matter, but the 2-4 prototype does not need
to implement them fully. Static, lightly interactive, or mocked states are fine.

| Item | Reason |
| --- | --- |
| Scratch Pool collapse on first typed Breakdown character | Production interaction mechanics. Showing expanded/collapsed states and intent is enough. |
| Full search filtering state machine | Query/result/scope/clear representation is enough. |
| Real desc/asc sorting logic | Showing the sort mode/state is enough. |
| Exact DnD collision/state machine | Showing valid/invalid/remove/pending states is enough. |
| Archive persistence | A mocked "OK archives and removes from Inbox" UX is enough. |
| Production hooks/store integration | Out of prototype scope. |

## Antigravity Creative Focus

Preserve the constraints and structure. Do not damage the design identity of the
2-2 prototypes. Within that boundary, Antigravity's Design/UX creativity is
expected in these areas:

Creativity should enrich the existing theme language, not replace it. Keep the
parts that the 2-2 prototypes already solve well, and layer only the newly needed
affordances into the existing design system.

- Scratch tools section integration
- Selected Scratch context treatment
- Theme-specific edit/trash icon treatment
- Archive Scratch completion affordance
- Staging invalid/unavailable drop tone
- Remove-from-staging affordance
- Hierarchy Node-only / Bit-only drop signals
- Hierarchy placement result as real Node/Bit card + Undo recovery
- Direct row placement Node/Bit choice + path confirmation affordance

## Success Criteria

- All 8 themes preserve their 2-2 design identities.
- All 8 themes support EN/KR toggle.
- Current Inbox/Triage functionality is visible in the prototypes.
- New functionality feels absorbed into each theme rather than bolted on.
- The weaker visual style of main is not copied.
- The preview UI is useful for review and remains removable after approval.
