# Antigravity Prompt - Inbox/Triage 2-4 Prototype Update

## Goal

Create a new Inbox/Triage 2-4 prototype worktree from the 8 Inbox/Triage
prototypes in `griddo2-claude-themes2-2`.

This is not production code work. The task is to represent the latest
Inbox/Triage functionality and UX states from main inside the visual language of
the 2-2 prototypes, producing updated prototypes for all 8 themes.

The 2-2 prototypes are the design baseline. Main is the functional/UX reference.
Do not copy main's visual styling.

## Core Principles

- This is an update, not a recreation.
- Preserve the visual quality, theme identity, and design points of the 2-2
  prototypes.
- Improve the requested areas inside the existing 2-2 design language.
- You do not need production-level functional implementation.
- Static, mocked, or lightly interactive states are enough when they communicate
  the UX.
- Do not damage the structure or constraints of the existing prototypes.
- Do not break each theme's existing composition, density, texture, typography,
  color language, decorative language, or motion feel in order to add new
  features.
- Show Antigravity's Design/UX creativity in unresolved UX areas.
- Do not use emoji. Use lucide icons as a prototype-project-wide rule.

Before editing each theme, inspect how it already treats headers, surfaces,
buttons, badges, rows, cards, and icons, then extend that language. Avoid copying
main's styling or attaching the same generic component to all 8 themes.

## Repo / Worktrees

### Production Reference

- Repo: `/Users/jwk/Documents/griddo2-claude`
- Purpose: understand current Inbox/Triage functionality and UX
- Do not modify production code.

### Prototype Source

- Worktree: `/Users/jwk/Documents/griddo2-claude-themes2-2`
- Purpose: design source for the 2-2 prototypes
- Do not modify this worktree directly.

### Prototype Target

- New worktree: `/Users/jwk/Documents/griddo2-claude-themes2-4`
- New branch: `griddo2-claude-themes2-4`
- Create it from `griddo2-claude-themes2-2`.
- If the target worktree or branch already exists, stop and report before
  overwriting anything.

## Required Reading

Primary brief:

- `/Users/jwk/Documents/griddo2-claude/docs/brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/PROTOTYPE_FUNCTION_GAP_2_4.en.md`

This is the primary decision document for this task. It explains the gaps
between the 2-2 prototypes and main, the UX/functionality that must be shown in
2-4, and the areas where Antigravity creativity is expected.

## Production Behavior Reference

Read these files as read-only reference only. Do not modify production code.

- `/Users/jwk/Documents/griddo2-claude/src/components/triage/triage-workspace.tsx`
- `/Users/jwk/Documents/griddo2-claude/src/components/triage/scratch-pool.tsx`
- `/Users/jwk/Documents/griddo2-claude/src/components/triage/breakdown-panel.tsx`
- `/Users/jwk/Documents/griddo2-claude/src/components/triage/staging-zone.tsx`
- `/Users/jwk/Documents/griddo2-claude/src/components/triage/hierarchy-explorer.tsx`

## Prototype Design Source

These 8 files are the design source. Read them first to understand each theme's
visual language.

- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-griddo/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-tiny-desk/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-neumorphism/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-claymorphism/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-origami/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-terminal/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-retro-mac/page.tsx`
- `/Users/jwk/Documents/griddo2-claude-themes2-2/src/app/prototype/inbox-triage-graphite/page.tsx`

## Files To Update

Update all 8 prototype routes in the 2-4 worktree:

- `src/app/prototype/inbox-triage-griddo/page.tsx`
- `src/app/prototype/inbox-triage-tiny-desk/page.tsx`
- `src/app/prototype/inbox-triage-neumorphism/page.tsx`
- `src/app/prototype/inbox-triage-claymorphism/page.tsx`
- `src/app/prototype/inbox-triage-origami/page.tsx`
- `src/app/prototype/inbox-triage-terminal/page.tsx`
- `src/app/prototype/inbox-triage-retro-mac/page.tsx`
- `src/app/prototype/inbox-triage-graphite/page.tsx`

Shared helpers or preview UI files may be edited only if they are inside the
2-4 worktree.

## Workflow

1. Read `PROTOTYPE_FUNCTION_GAP_2_4.en.md`.
2. Read the 5 production behavior reference files as read-only reference.
3. Inspect all 8 2-2 prototype routes.
4. Present an update plan to the user first.
5. After user approval, create the 2-4 worktree/branch.
6. Modify only the 2-4 worktree.
7. Report the result by route and by section.

## Update Plan Required Before Editing

Before creating the worktree or modifying files, present a plan in this shape:

- Common structure update summary
- Existing 2-2 design preservation strategy
- Preview UI plan
- EN/KR toggle plan
- Section-by-section plan:
  - Scratch Pool
  - Breakdown
  - Staging
  - Hierarchy/Grid
- Design points to preserve by theme:
  - griddo
  - tiny-desk
  - neumorphism
  - claymorphism
  - origami
  - terminal
  - retro-mac
  - graphite
- How each theme will absorb the new requirements into its existing design
  language
- Areas needing Antigravity creativity:
  - Archive Scratch completion affordance
  - Staging invalid/unavailable drop tone
  - Remove-from-staging affordance
  - Hierarchy placement affordance
  - Direct row placement affordance

## Required Shared Updates

Terminology:

- `Preview heading`: the title at the top of the preview shell/body that wraps
  the theme prototype.
- `Section label/header/chrome`: theme-internal area labels and chrome around
  `Scratch Pool`, `Breakdown`, `Staging`, and `Grid`.
- Remove the preview heading.
- Keep theme-internal section label/header/chrome.

- Add a sidebar with numbered theme switcher buttons from 1 to 8.
- Add an EN/KR toggle in the sidebar.
- Add Korean versions for all themes.
- Korean versions need a different font treatment from English.
- Remove the preview heading at the top of the body.
- Keep the retro mac theme's existing heading/chrome.
- For terminal, absorb only the heading's design elements into the theme and
  remove the preview heading.
- For origami, reuse the scissors motif as an edit button icon if it is not
  emoji. If the existing motif is emoji, use lucide `Scissors`.
- Hide visible scrollbar chrome in all major lists/sections.
- Do not use emoji. Use lucide icons.

## Required UX Updates

### Scratch Pool

- Keep the existing label/header.
- Use a top tools section and lower Scratch list section.
- Integrate identity/count/collapse/search/sort inside the tools section.
- Put search bar and sort button on one row.
- Make the sort button theme-specific.
- The sort button must clearly show clicked/unclicked or asc/desc state.
- In collapsed mode, arrange all elements vertically.

### Breakdown

- Keep the existing label/header.
- Add a desc/asc toggle button.
- Add a Submit button to the right of the scribble input.
- Make selected Scratch context stronger than normal rows.
- Add an always-visible edit button to Scratch context.
- Always show edit/trash icons on Breakdown rows.
- Remove row numbering.
- Remove visible row time text.
- Staged rows should remain visible with state-specific treatment.
- Actually placed rows should be consumed and disappear.
- When there are no Breakdown rows and the archive alert is not covering the
  section, show a theme-specific prompt in the Breakdown section background.
  Do not hard-code a generic phrase; express it in each theme's language.
- When every row is consumed, blur the whole Breakdown section and show an
  archive affordance above it.
- Archive affordance must include Cancel/OK.
- After Cancel, show an in-section archive affordance opener.
- In that state, Scratch context should become a theme-specific "Scratch
  complete" state.

### Staging

- Keep section label/header.
- If a Node/Bit staging section has no item, do not show an empty placeholder
  label inside it.
- Keep Node as card/icon/grid-like and Bit as row/list-like.
- Make remove-from-staging creative and theme-specific.
- Dragging a staged Node/Bit to Breakdown should represent the same meaning as
  remove-from-staging.
- Do not copy main's invalid drop styling. Propose a theme-specific
  invalid/unavailable tone.

### Hierarchy / Grid

- Keep the search bar in the 2-2 prototype's position.
- Use `Home`, `Level 1`, `Level 2`, `Level 3` / `홈`, `레벨 1`, `레벨 2`, `레벨 3`.
- Remove repeated selected node title text under section labels.
- Express selected node through item color/surface/emphasis.
- Search clear uses only an X affordance. Do not use visible `Clear` text.
- Show Node-only / Bit-only drop signals in the hierarchy while dragging staged
  items.
- When a staged Node/Bit is dropped, keep the existing Placement Affordance and
  Confirm/Yes step.
- After Confirm/Yes, render the actual Node/Bit card in the target path, not a
  checkbox + `Node: ...` placed indicator card.
- Show an Undo button on the right side of the actual placed Node/Bit card. Undo
  restores staged Node/Bit items back to the Staging section.
- If a row itself is dropped directly, first show a modal-like affordance where
  the user chooses Node/Bit and sees the target path.
- The direct row affordance's Node/Bit choices must follow the target column
  constraint. Home should show Node only; Level 3 should show Bit only.
- After that first affordance, keep the existing Placement Affordance/Confirm
  step, and after Confirm render the actual Node/Bit card in the target path.
- Direct row placements also show an Undo button on the right side of the actual
  placed Node/Bit card. Undo restores the original Breakdown row.

## Do Not

- Do not modify production code.
- Do not modify `griddo2-claude-themes2-2` directly.
- Do not copy main's visual styling.
- Do not flatten all 8 themes into one common style.
- Do not damage the existing 2-2 theme identities.
- Do not use emoji.
- Do not use visible `L1`, `L2`, `L3`, `Home-L3`, or `H1-L3`.
- Do not use visible `Clear` text in search.
- Do not replace the final Confirm result with a checkbox + `Node: ...` placed
  indicator card.
- Do not implement production persistence/hooks/store.

## Final Report

Report:

- New worktree/branch
- Changed files
- Work summary for all 8 routes
- EN/KR toggle check result
- Preview sidebar theme switching check result
- Section-by-section visible changes:
  - Scratch Pool
  - Breakdown
  - Staging
  - Hierarchy/Grid
- Theme-by-theme notes:
  - griddo
  - tiny-desk
  - neumorphism
  - claymorphism
  - origami
  - terminal
  - retro-mac
  - graphite

## Expected Result

The new `griddo2-claude-themes2-4` worktree contains 8 updated Inbox/Triage 2-4
prototypes. Each prototype preserves its 2-2 theme identity while making the
latest Inbox/Triage functionality and UX states understandable.
