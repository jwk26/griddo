# Workflow Document Contracts

## Metadata

- Created: 2026-05-20
- Readiness: draft
- Category: workflow idea
- Source project: Cross-project
- Source topic: writing-documents amendment dry-test / future ideas workflow
- Source prototype: n/a
- Tags: workflow, documentation, recipes, future-ideas, historical-sources, skill-design

## Trigger

This entry started from the following concern:

> At least one recipe file is the output of the `reference-redesign` skill, but it shares the `docs/recipes/` output path with writing-documents amendment mode Step 0.75. Step 0.75 was based on the `extract-design` skill. Does `extract-design` also use the same output path? If all three skills share the same output path and intent, then having very different formats seems like a problem.

The discussion then expanded into a broader documentation-role issue:

- `docs/recipes/` contains artifacts produced by different workflows.
- `docs/brainstorming/` stores deferred ideas and future references.
- `docs/outofphase/*` historical plans contain many unexecuted ideas.
- These are related because all three expose the same underlying problem: workflow documents need clear roles, authority, and promotion paths.

## Current Finding

`extract-design` does **not** currently share the `docs/recipes/` output path.

Its outputs are:

- `docs/extract-design/DESIGN_AUDIT.md`
- `docs/extract-design/DESIGN_TOKENS.md`
- `docs/extract-design/DESIGN_ALIGNMENT.md`
- final updates to `docs/DESIGN_TOKENS.md`

`reference-redesign` and writing-documents amendment mode Step 0.75 **do** share the `docs/recipes/` family:

- `reference-redesign` writes `docs/recipes/{surface-name}-recipe.md`
- writing-documents Step 0.75 writes `docs/recipes/<surface>-visual-recipe.md` or `docs/recipes/<surface>-<realization>-visual-recipe.md`

So the conflict is not among all three skills. The main overlap is between `reference-redesign` and writing-documents Step 0.75.

## Core Risk

The risk is not merely that two files live in the same folder.

The risk is that multiple skills use the word "recipe" and the `docs/recipes/` path for artifacts that are close in intent but different in format and authority.

This can confuse later agents or workflows:

- Is a recipe an approved design authority?
- Is it an extracted source-code fact sheet?
- Is it a reference-image redesign record?
- Is it a direct execution input?
- Has it already been promoted into canonical docs?

If these questions are not answerable from the file itself, `execute-next-phase` or a future agent may treat unlike documents as equivalent.

## Working Distinction

| Skill | Output | Role |
|---|---|---|
| `extract-design` | `docs/extract-design/*`, `docs/DESIGN_TOKENS.md` | Extract whole-reference design facts, tokens, and alignment decisions |
| `reference-redesign` | `docs/recipes/<surface>-recipe.md` | Approved surface recipe from a reference image plus retained product controls |
| writing-documents Step 0.75 | `docs/recipes/<surface>-visual-recipe.md` | Visual/motion realization recipe extracted from an adopted prototype or worktree |

`extract-design` can inform recipes, but it should remain a separate artifact family.

`reference-redesign` and Step 0.75 should share a common recipe contract.

## Recommended Direction

Do not force every recipe into an identical full template. That would make the workflow rigid.

Instead, define a common recipe contract and allow skill-specific sections.

Minimum common header:

```markdown
# Recipe: <Surface>

> Recipe type: visual-recipe | reference-redesign-recipe
> Produced by: writing-documents Step 0.75 | reference-redesign
> Source: <worktree / route / image / file>
> Date:
> Status:
> Canonical promotion:
> Consumer: EXECUTION_PLAN / DESIGN_TOKENS / SPEC
```

Common required sections:

- Source / provenance
- Scope
- Exact visual facts
- Adopted / Removed / Improved decisions
- Token implications
- Component ownership
- Execution handoff

Skill-specific sections may still exist:

- `reference-redesign`: Reference Facts, Reintegrated Controls, Placement Rationale
- Step 0.75: Source Files, Visual Facts, Interaction and Motion, Token Contract Implications

Existing files such as `bit-detail-recipe.md` and `node-card-recipe.md` do not need immediate migration. They can be treated as legacy-compatible recipes and receive the common header later when touched.

## Related Documentation Role Issue

Historical documents such as the original out-of-phase idea pool contain many valuable but unexecuted plans. These documents are useful, but they are not implementation authority.

The needed distinction:

| Document role | Meaning |
|---|---|
| Historical source | Past ideation or planning source; not directly executable |
| Future idea | A deferred idea worth rediscovery later |
| Backlog candidate | More concrete than an idea, but not yet canonical |
| Decision | Current topic decision |
| Promotion map | Maps decisions/sources into canonical docs |
| Canonical docs | Implementation authority |
| Recipe | Surface realization authority for visual/interaction execution |

## Proposed Authority Flow

```text
historical source
  -> selected future idea
  -> DECISION.md / PROMOTION_MAP.md
  -> canonical docs
  -> execute-next-phase / execute-task
```

Historical source documents should not be merged directly into canonical docs.

Future idea entries should not become implementation instructions by themselves.

Canonical docs remain the implementation authority.

Recipes provide surface realization evidence, but execution tasks should still reference them through canonical planning.

## Use When

- standardizing `docs/recipes/`
- updating `reference-redesign`
- updating writing-documents Step 0.75
- deciding whether `extract-design` should feed recipe creation
- refining brainstorming readme
- triaging historical planning docs
- designing a cross-project documentation workflow

## Do Not

- Do not migrate every old recipe immediately just to normalize format.
- Do not treat historical planning docs as direct implementation input.
- Do not dump all historical plans into brainstorming; only extract ideas with future retrieval value.
- Do not make skill files a collection of one-off exceptions. Capture reusable artifact contracts instead.

## Possible Follow-Up

1. Add a shared recipe contract reference used by both `reference-redesign` and writing-documents Step 0.75.
2. Update new recipe templates to include `Recipe type`, `Produced by`, `Source`, `Canonical promotion`, and `Consumer`.
3. Consider a separate `backlog_candidates/` convention only if future ideas become too concrete for brainstorming but not yet canonical.
