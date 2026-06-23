# Batch 2 Pre-Promotion Work Report

> Date: 2026-06-23
> Branch: `docs/batch-2-pre-promotion`
> Context: Batch 2 planning before implementation phases

## Background

This work started after Phase 19 completion. The user wanted Batch 2 planning to be reconciled before any implementation phase was added to `EXECUTION_PLAN.md`.

The starting concern was that the older `themes2-2` prototype and Batch 2 brainstorming material were created before several current app features existed or changed. The main mismatch area was Inbox/Triage:

- current implementation has `ArchiveScratchBar`, but the prototype did not account for it
- prototype Breakdown rows were full-row draggable, while current implementation uses a drag grip
- prototype included selected Scratch context, while current implementation did not
- prototype included Hierarchy search, while current implementation did not
- current Inbox/Triage shows visible development labels such as `Scratch Pool`, `Breakdown / Scribble`, `Staging`, and `Hierarchy Explorer`, which the user said should not appear in the final Inbox UI

The user also clarified that `EXECUTION_PLAN.md` phases should stay implementation-only.

## Additional Context and Discussion Flow

### Initial Batch Split

This work sits behind an earlier high-level batch split. The Phase 14 archive note records **Batch 1 - Lifecycle System (Phases 15-19)**, promoted from `docs/brainstorming/2026-04-28-lifecycle-system-foundation/PROMOTION_MAP.md`. The Batch 1 dependency order was Phase 15 foundation, Phase 16 quick capture, Phase 17 inbox/triage, Phase 18 inbox/triage DnD, and Phase 19 archive.

That Batch 1 note also recorded scope guards: no Batch 2 theme work, no Search redesign, no Create-modal redesign, and only partial Grid DnD work limited to Inbox/Triage compact-token DnD. Because of that, after Phases 15-19 were completed, theme, calendar, and inbox/triage visual alignment remained as a separate Batch 2 planning concern.

In `docs/brainstorming/2026-04-28-lifecycle-system-foundation/PROMOTION_MAP.md`, the Non-Promoted Items table records `2026-05-28-inbox-triage-theme-variants` and `2026-05-28-theme-system-and-calendar-theming` as **Batch 2 (`themes2-2`)**. The same table leaves the favorites variant as a Batch 3 candidate. This pre-promotion work therefore started as a reconciliation step after Batch 1 completion and before Batch 2 implementation planning.

### Starting Question and Direction Change

The user first asked for a Phase 20 preview, then recalled that the work had previously been divided into Batch 1, Batch 2, and Batch 3. The user remembered Batch 1 as Phases 15-19 and Batch 2 as themes, and asked to confirm that from the brainstorming documents.

The document scan confirmed that Batch 1 was the Lifecycle System covering Phases 15-19, while Batch 2 connected to `themes2-2`: theme system, calendar theming, and inbox/triage theme variants. The user then asked to review Batch 2 together with the deferred issues document and proceed with Batch 2 planning.

Before writing implementation phases, the user wanted to capture and document concerns first. The user clarified that phases written into `EXECUTION_PLAN.md` should be implementation-only. Source interpretation, prototype/current-app mismatch, and design direction needed to be settled before phase authoring.

### Prototype and Current-App Mismatches Raised by the User

The first mismatch list focused on four Inbox/Triage differences:

- The current implementation has `ArchiveScratchBar`, which did not exist when the prototype was made. This is the affordance shown when all Breakdown rows are consumed.
- Prototype Breakdown rows were full-row draggable, while the current Phase 19 implementation only drags from the left drag-grip area.
- The prototype showed selected Scratch context in the Breakdown section, while the current implementation did not. This need was also present in deferred issues.
- The prototype included search, while the current implementation did not. Search was also recorded in deferred issues.

The user then gave more concrete Inbox/Triage model concerns:

- In the prototype, collapsed Scratch Pool has a count badge above the inbox icon, a fold/unfold button below it, and compact Scratch item switching below that. In the current implementation, the count badge sits above the fold/unfold arrow, the inbox icon floats awkwardly in the column middle, and there is no Scratch switching.
- In the prototype, expanded Scratch Pool shows the inbox icon, count, and fold/unfold button together. In the current implementation, expanded mode has no inbox icon.
- The prototype has Scratch context for Breakdown items, while current code does not. The user asked how this would have been handled by the document-writing workflow if it had not been explicitly mentioned.
- The prototype does not show the unnecessary gap between the Hierarchy Explorer shell and the Home/L1/L2/L3 containers that exists in current code. The user noted that in normal collaboration this would likely be discussed as "the mockup has no gap; should we remove it while matching the mockup?"
- Scratch Pool also needs Scratch item search and desc/asc filtering.

The response was that the workflow would not automatically catch every fine-grained mockup/current-code mismatch. The promotion map and canonical document process help classify source authority and promoted scope, but they do not automatically infer every detailed UI reconciliation. The user-raised differences therefore needed to be written explicitly into the recipe and canonical documents.

### Skill Documents and Workflow Adjustment

The user asked to read the `writing-documents` skill under `~/.claude/skills`. That skill described the process of moving a promotion map into canonical documents. The user wanted to add more detail before writing the promotion map and then proceed through that process.

The user later asked to inspect `reference-redesign` and `extract-design` as well. The resulting approach was not to copy the prototype directly, but to classify sources, expose mismatches with current implementation, normalize the promoted direction into recipes, and then carry those decisions into canonical documents.

### Proposed Approach and User Confirmations

The proposed approach was to patch the current Phase 19 app using the `themes2-2` prototype as source material, rather than copying the prototype wholesale. The reason was that Batch 1 had already added lifecycle, archive, inbox/triage DnD, and Scratch flow behavior that the prototype did not fully reflect.

The user asked whether the theme system and calendar were really weak enough to justify redesigning or rewriting them, since the user remembered them as close to implementation-ready. The response was that the theme system and calendar had strong source value, especially the 8 visual themes, but should still be applied as patches over the current app code. Inbox/Triage variants had visual reference value but required a normalized recipe because they diverged more from the current implementation. The user confirmed this direction.

For themes, the user said the 8 prototype themes might be functionally out of date but were visually close to complete, and wanted fonts, colors, and design preserved as closely as possible. "Apply the diff" was clarified to mean transferring prototype values and visual contracts into the current app's token/provider/component structure, not wholesale-copying prototype files. The user confirmed the patch-current-app approach.

For calendar, the prototype was also treated as close to implementation-ready visually. The settled direction was to use it as the visual target while preserving current calendar behavior and current code structure, bringing over the shared header, monthly grid-line model, today badge, first-of-month labels, compact preview item treatment, and theme-aware styling.

For Inbox/Triage, the user explicitly said the prototype should not be copied as-is. The prototype Scratch context was too small and weak for the current surface. The user also said current visible section names such as `Scratch Pool`, `Breakdown/Scribble`, `Staging`, and `Hierarchy Explorer` were development labels and should be removed from the real Inbox UI. These decisions were recorded in the Inbox/Triage recipe, `SPEC.md`, and `DESIGN_TOKENS.md`.

### Search Discussion

The user first said the intended search was global search, but noted that implementation would require many decisions. The user then proposed that search should operate only inside the active hierarchy section. For example, if only Home is open, search filters Home's nodes/bits; if an L2 grid is active, search filters only that L2 section's nodes/bits.

This became active-hierarchy-section scoped search. Because the query persists when the active section changes, the user wanted a visible cue showing that a query remains active. The resulting decision was to flash or highlight the search input/query when the hierarchy menu changes while a search query is still present.

### Scratch Pool Search and Sort Discussion

The user wanted Scratch Pool search and desc/asc filtering. The user preferred icon-only controls over text. The user also said this feature is not needed in collapsed mode.

The recipe therefore records title search and an icon-only asc/desc sort toggle for expanded Scratch Pool only. The sort target is Scratch `createdAt`, switching between newest-first and oldest-first. Collapsed Scratch Pool keeps compact Scratch switching only, without search or sort.

### Deferred Issue Clarifications

The user asked what `ISSUE-18-20 invalid drop state too destructive` meant. It was explained as an Inbox/Triage DnD issue where invalid drop-target feedback reads too harshly or destructively. It was then carried into the Batch 2 recipe as softened/muted invalid drop-state treatment.

The user also asked for a concise explanation of the Phase 14 popup item focus-visible styling issue. It was explained as a deferred accessibility polish item for missing keyboard focus-visible styling on calendar monthly popup item buttons. It may relate to Batch 2 Calendar visual work, but was not expanded into a separate item in this pre-promotion report.

### Preview Flow

The user asked whether a lightweight mockup could be shown once the recipe existed, or whether design tokens had to be written first. The user wanted something quick and design-focused, with almost no feature implementation.

A temporary static HTML preview was created under `docs/previews/` to quickly inspect the recipe direction. It mocked theme switching, Inbox/Triage, Calendar, and Grid treatment. The user later said mobile/tablet did not need to be considered, then stopped the preview work. Afterward, the user deleted `docs/previews`, so the preview artifact is no longer in the working tree.

### Report Creation

The user asked for a work report that Claude Opus could read freely. The report was therefore written as a factual account of sources used, decisions made, and documents added or changed.

The first version of the report focused mostly on output. It did not sufficiently capture the Batch 1/2/3 background, the actual discussion flow, the proposed approach, or the user's confirmations. This section was added in response to the user's request for more complete context.

## Source Material Used

The work used these local sources:

- `docs/brainstorming/2026-05-28-theme-system-and-calendar-theming/DECISION.md`
- `docs/brainstorming/2026-05-28-inbox-triage-theme-variants/DECISION.md`
- prototype commits on `prototype/future-ideas`:
  - `64e5236` — color theme runtime
  - `5b3d3c0` — themed grid visuals
  - `59ee937` — calendar redesign
  - `d963807` — Inbox/Triage theme variants
- current Phase 19 app implementation
- `docs/issues/Issues_Deferred.md`
- the local `writing-documents`, `reference-redesign`, and `extract-design` skill documents

## User Decisions Captured

The following decisions were discussed and then recorded into the planning documents:

- Batch 2 should proceed through a multi-source promotion map.
- `theme-system-and-calendar-theming` is adopted for theme runtime, theme values, grid visual treatment, and calendar visual direction.
- The 8 existing prototype themes are considered visually mature and should be preserved as closely as practical.
- Calendar should use the prototype as the visual target, but implementation should patch current app code rather than replace files wholesale.
- `inbox-triage-theme-variants` is reference-only as raw source.
- Inbox/Triage should use a normalized recipe based on prototype facts, current implementation, deferred issues, and user corrections.
- `ArchiveScratchBar` remains part of Inbox/Triage.
- Breakdown drag remains grip-only.
- Selected Scratch context is added, but the prototype's small treatment is not copied directly.
- Scratch Pool gets title search and an icon-only asc/desc sort toggle in expanded mode.
- Collapsed Scratch Pool gets compact Scratch switching; collapsed mode does not include search or sort.
- Hierarchy search is scoped to the active hierarchy section, not global app search.
- Hierarchy search query persists across active-section changes, with a visible cue when the query remains active.
- Visible developer-facing section labels should be removed from final Inbox UI.
- `ISSUE-19-01` archive `⋯` trigger UX remains deferred for separate reconsideration.

## Files Added

### `docs/brainstorming/2026-05-28-theme-system-and-calendar-theming/PROMOTION_MAP.md`

Added a multi-source promotion map for Batch 2. It records:

- promoted scope
- source intake
- prototype area selection
- adoption slot map
- visual recipe artifacts
- decision mapping
- open question disposition
- canonical document edit plan
- non-promoted items

The map currently records:

- `SCHEMA.md` skipped
- `SPEC.md` done
- `DESIGN_TOKENS.md` done
- `EXECUTION_PLAN.md` pending
- `PLANNING_STANDARD.md` skipped

### `docs/recipes/theme-system-and-grid-batch2-visual-recipe.md`

Added a recipe for:

- 8 color theme ids
- `data-color-theme` runtime axis
- persistence key `griddo-color-theme`
- theme picker behavior
- theme variable groups
- font loading needs
- `theme-node-card`
- `theme-grid-line`
- `theme-surface`
- grid visual consumption

### `docs/recipes/calendar-batch2-visual-recipe.md`

Added a recipe for:

- shared weekly/monthly calendar header
- monthly `gap-px` grid line model
- theme-aware calendar cells
- today circular date badge
- first-of-month `MMM d` label
- compact monthly preview items
- weekly day-column theme styling
- retained current calendar behavior

### `docs/recipes/inbox-triage-batch2-visual-recipe.md`

Added a normalized Inbox/Triage recipe for:

- Scratch Pool expanded/collapsed behavior
- Scratch title search
- icon-only sort toggle
- collapsed Scratch switching
- selected Scratch context
- grip-only Breakdown drag
- `ArchiveScratchBar`
- staging label removal
- hierarchy gap removal
- active-section hierarchy search
- invalid drop-state softening

## Files Amended

### `docs/brainstorming/2026-05-28-theme-system-and-calendar-theming/DECISION.md`

Added a `Promotion Intake Decisions — 2026-06-23` section covering:

- theme fidelity
- calendar visual target
- patch-over-current-code direction
- grid theme adoption

### `docs/brainstorming/2026-05-28-inbox-triage-theme-variants/DECISION.md`

Added a `Promotion Intake Decisions — 2026-06-23` section covering:

- raw variants as reference-only
- normalized recipe as promoted source
- Scratch Pool changes
- Breakdown changes
- Staging label removal
- Hierarchy search
- visible label removal

### `docs/SPEC.md`

Added or updated:

- architecture decision for color theme axis
- architecture decision that Batch 2 visual alignment preserves Phase 19 behavior
- file organization entries for color theme provider/toggle, theme store, and shared calendar header
- sidebar description to include dark/light Theme toggle and Color Theme toggle
- calendar weekly/monthly layout rules for Batch 2
- Inbox/Triage rules for visible label removal, Scratch Pool search/sort, collapsed switcher, selected Scratch context, grip-only drag, hierarchy active-section search, and muted invalid DnD states
- key file path entries for color theme and calendar header files

### `docs/DESIGN_TOKENS.md`

Added or updated:

- table of contents entries for new Batch 2 sections
- `Color Theme System`
- `Calendar Visual Theme Contract`
- `Inbox / Triage Batch 2 Surface Contract`
- theme variable groups
- required theme classes
- additional font loading variables
- theme/grid/calendar recipe links
- Node Card and Grid Cell usage examples to reference theme classes

## Preview Artifact

A temporary static HTML preview was created under `docs/previews/` to view the recipe direction quickly. The user later deleted `docs/previews`, and the preview artifact is no longer part of the current working tree.

The preview showed:

- Inbox/Triage with expanded/collapsed Scratch Pool
- selected Scratch context
- hierarchy scoped search
- Calendar and Grid theme treatment
- theme switching mock

During preview inspection, a Terminal-theme overflow issue in a long Scratch title was found and fixed in the temporary preview before the user removed the preview directory.

## Current Working Tree

Current changed paths:

- `docs/DESIGN_TOKENS.md`
- `docs/SPEC.md`
- `docs/brainstorming/2026-05-28-inbox-triage-theme-variants/DECISION.md`
- `docs/brainstorming/2026-05-28-theme-system-and-calendar-theming/DECISION.md`
- `docs/brainstorming/2026-05-28-theme-system-and-calendar-theming/PROMOTION_MAP.md`
- `docs/handoffs/batch-2-pre-promotion-opus-report.md`
- `docs/recipes/calendar-batch2-visual-recipe.md`
- `docs/recipes/inbox-triage-batch2-visual-recipe.md`
- `docs/recipes/theme-system-and-grid-batch2-visual-recipe.md`

No app source files were changed in this work.
