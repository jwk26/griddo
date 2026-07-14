# Gemini Prompt - Inbox/Triage 2-3 Prototype Update

## Task

Create a new Inbox/Triage 2-3 prototype set from the existing 2-2 prototype
worktree.

This is prototype/design work only.

Do not edit production Inbox/Triage components.
Do not edit the existing 2-2 prototype in place.

## Repositories / Worktrees

Production behavior reference:

- Repo: `/Users/jwk/Documents/griddo2-claude`
- Phase 22 is complete and merged.
- Use production only to understand behavior.
- Do not modify production code.

Prototype source:

- Worktree: `/Users/jwk/Documents/griddo2-claude-themes2-2`
- Branch: `griddo2-claude-themes2-2`
- Use this as the source for the current 2-2 designs.

Prototype target:

- Create a new 2-3 worktree/branch from the 2-2 worktree.
- Suggested worktree: `/Users/jwk/Documents/griddo2-claude-themes2-3`
- Suggested branch: `griddo2-claude-themes2-3`
- If a target worktree or branch already exists, stop and report before
  overwriting anything.

## Required Context

Before changing prototype files, read:

- `docs/brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/PROTOTYPE_FUNCTION_GAP.md`

That document lists production behavior that is missing, outdated, or unclear in
the 2-2 prototypes. The goal of this task is to reflect those elements in the
2-3 prototypes.

## Routes To Update

Update all 8 Inbox/Triage prototype theme routes:

- `src/app/prototype/(inbox-triage)/inbox-triage-griddo/page.tsx`
- `src/app/prototype/(inbox-triage)/inbox-triage-tiny-desk/page.tsx`
- `src/app/prototype/(inbox-triage)/inbox-triage-neumorphism/page.tsx`
- `src/app/prototype/(inbox-triage)/inbox-triage-claymorphism/page.tsx`
- `src/app/prototype/(inbox-triage)/inbox-triage-origami/page.tsx`
- `src/app/prototype/(inbox-triage)/inbox-triage-terminal/page.tsx`
- `src/app/prototype/(inbox-triage)/inbox-triage-retro-mac/page.tsx`
- `src/app/prototype/(inbox-triage)/inbox-triage-graphite/page.tsx`

Shared prototype helpers/styles may be edited only if they are part of the
prototype worktree and support these routes.

## Design Direction

The 2-2 prototypes are the design source. Production is only the behavior
reference.

Do not make the prototypes look like production.
Preserve each theme's visual language.
Represent missing production behavior using each theme's own design style.

## Required Updates

For every theme:

- Add or clarify Scratch Pool search.
- Add or clarify Scratch created-at sorting.
- Make sort state/mode visibly understandable.
- Preserve collapsed Scratch switching and make the selected target prominent.
- Strengthen selected Scratch context in Breakdown.
- Preserve existing theme-specific input-side submit affordance when present.
- Show Breakdown as grip-only draggable, not full-row draggable.
- Show Archive Scratch as an intentional completion affordance.
- Keep Node and Bit staging separate without visible developer labels.
- Make remove-from-staging intentional and theme-specific.
- Keep invalid drops muted/unavailable, not destructive-red.
- Add or clarify active-section-scoped hierarchy search.
- Put hierarchy search inside the hierarchy surface.
- Show query, result count, and X clear affordance.
- Show search scope through active/inactive section treatment, not visible text
  inside the pill.
- Use `Home`, `Level 1`, `Level 2`, `Level 3` in visible hierarchy UI.
- Replace immediate/modal placement presentation with inline pending placement
  card inside the target hierarchy column.

## Do Not Do

- Do not modify production components.
- Do not make the prototypes visually match production.
- Do not bring back full-row Breakdown dragging.
- Do not show visible developer labels:
  - `Scratch Pool`
  - `Breakdown / Scribble`
  - `Staging: Nodes`
  - `Staging: Bits`
  - `Hierarchy Explorer`
- Do not use visible `L1`, `L2`, `L3`.
- Do not show hierarchy search scope as visible text inside the search pill.
- Do not use a modal confirmation for hierarchy placement in the 2-3 prototype.
- Do not implement production persistence or production hooks.

## Verification

After updating the prototype worktree:

- Confirm all 8 prototype routes still render.
- Run the local build/check command used by the prototype worktree.
- Report changed files.
- Summarize visible changes by theme and by section:
  - Scratch Pool
  - Breakdown
  - Staging
  - Hierarchy

## Expected Result

A new 2-3 prototype worktree/branch where all 8 Inbox/Triage theme routes retain
their theme-specific visual character while representing the post-Phase-22
Inbox/Triage behavior listed in `PROTOTYPE_FUNCTION_GAP.md`.

