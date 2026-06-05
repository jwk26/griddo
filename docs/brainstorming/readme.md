# Brainstorming — Future Ideas Index

Project-level index for deferred ideas, visual references, and cross-topic
concepts that should be discoverable after the original brainstorming topic is
complete.

This directory is the durable memory and the single consolidation point for all
ideation output. Runnable prototype archives, when they exist, are secondary
evidence and should be referenced by branch, commit, and route.

## Core Principle

Use document-first memory and archive-second preservation.

- `docs/brainstorming/` is the durable index.
- Topic `DECISION.md` keeps current topic decisions only.
- Topic `NOTES.md` keeps raw review, detailed local reasoning, open planning
  questions, and discarded alternatives.
- Runnable prototype archives are optional and should be referenced by branch,
  commit, and route.
- Worktree paths may be recorded as current checkout locations, but they are not
  stable pointers.

## Stable Pointer Rule

Stable pointer:

- branch
- commit
- route

Optional convenience pointer:

- current worktree path

Worktree paths are temporary. They are useful for the current review session,
but they should not be the only way to recover an idea later.

Do not record ports as durable idea metadata. Local dev ports change easily and
are usually not kept running.

## Project-Local Runnable Reference

For GridDO project-local runnable references, use:

- branch: `prototype/future-ideas`
- remote: `origin/prototype/future-ideas`
- stable pointer format: branch + commit + route

## Entry Structure

Each future idea lives in its own dated folder:

```text
docs/brainstorming/
  YYYY-MM-DD-topic/
    DECISION.md
    NOTES.md        # optional
```

`DECISION.md` is the primary document. It contains the current topic decision
and is the default source when building a PROMOTION_MAP.

`NOTES.md` is optional. It contains open planning questions, raw history,
discarded alternatives, reasoning, and long prototype observations. It should
only be used for provenance or extra context during promotion.

### Metadata

Each `DECISION.md` uses a metadata block. The minimum required fields are:

```markdown
## Metadata

- Created: <YYYY-MM-DD>
- Readiness: <draft | code-ready>
- Category: <visual reference | feature reference | workflow idea | deferred task | ...>
- Source project: <project name>
- Source topic: <topic folder or n/a>
- Source prototype: <prototype/worktree or n/a>
- Tags: <comma-separated tags>
```

Additional fields may be added when relevant:

- `Archive status`, `Archive branch`, `Archive commit`, `Archive route` — for
  entries with a single runnable prototype reference.
- `Archive commits`, `Archive routes` — for entries that consolidate multiple
  prototype commits or routes.
- `Dependencies` — for entries that depend on other future ideas.

**Readiness values:**

- `draft` — idea or deferred work that needs further design, decision, or
  specification before it can be scheduled
- `code-ready` — fully specified and implementable, just not currently
  prioritized. Treat as a promotion hint, not a guarantee — re-verify against
  current canonical docs before pulling into the active execution plan

### Date Convention

The folder date (`YYYY-MM-DD`) should reflect when the idea originated, not when
it was migrated or normalized. This supports workflows such as "review the oldest
unscheduled ideas first."

Use the entry folder when:

- the idea is outside current implementation scope
- the idea may be useful for a future topic
- the idea carries visual, layout, animation, or interaction reference value
- the idea should be discoverable after the original topic is complete

Do not use this directory for:

- current implementation decisions
- raw brainstorming transcripts that only matter inside one topic
- discarded ideas with no future retrieval value
- canonical product documentation
