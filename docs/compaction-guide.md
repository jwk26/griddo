# Compaction Guide

Use this guide when context is nearly full and the next session must resume the same implementation work.

`/compact <instructions>` is best treated as guidance for the summary that will hand off to the next session. It is not a reliable place to freeze a full implementation design. Preserve the state and decisions that are hard to reconstruct, then point the resumed session back to the authoritative workflow files.

## How To Use This Guide

When asked to prepare a compact prompt, do this:

1. Scan the current state: branch, phase, batch, changed files, completed gates, untracked handoff/audit files.
2. Collect settled decisions: user decisions, accepted overrides, provider outputs that should not be re-litigated.
3. Identify authority pointers: skill steps, prompt templates, execution plan sections, issue logs, review docs, provider artifacts.
4. Draft the compact prompt with the template below.
5. Run the review checklist and show the prompt for approval before the user compacts.

If the handoff is long, create or update a durable handoff file first, then point to that file from the compact prompt. Do not force a full handoff into `/compact` instructions.

## Compact Prompt Template

Use this shape by default.

```text
[Project / Phase] compact handoff

Repo:
Branch:
Phase / Batch:

## Resume Point

Continue from [skill name] [step name].
Before doing the next action, read [authoritative skill/template file].
Do not rely on memory for [prompt structure / source ownership / gate rules].

## Current State

- ...
- Source code changed: yes/no
- Provider artifact: [path]

## Settled Decisions

- ...
- ...

## Open Questions

- ...
- ...

## Authority Pointers

Read:
- [path]
- [path]

## Resume Sanity Check

Before continuing:
- `git status --short`
- read [current plan / issue section]
- verify [artifact path] exists, then read it
- re-read [source ownership files]

## Immediate Next Checkpoint

Do [next workflow action] and show a preview/report.
Stop for approval before [provider execution / code edits / commit].

## Audit Constraints

- Do not duplicate existing audit entries.
- Record only new observations.
- Keep audit separate from implementation issues.
```

## What To Preserve

Preserve facts that cannot be reliably reconstructed:

- current branch, phase, batch, and workflow step;
- source-code change status;
- created or modified docs;
- provider artifact paths;
- user decisions and accepted overrides;
- open questions that still need a user or implementation decision;
- the next approval checkpoint.

Do not paste long content when a file path is available. Point to the file instead.

## Copy Vs Pointer

Copy into the compact prompt when the information exists only in conversation:

```text
D2: Level 3 uses Bit-only state. Node row is hidden, not disabled.
D3: Cmd+K hint is visual only. It is not clickable, focusable, or wired to Search.
```

Use a pointer when the information lives in a file:

```text
Read the Gemini spec from:
/path/to/quick_capture_design_spec.md

Read the execute-task prompt template before writing the Codex prompt.
Do not rely on memory for prompt structure.
```

If a conversation decision overrides a file or provider recommendation, copy the override:

```text
Gemini recommended disabled Node row, but the user chose hidden Node row. Follow the user decision.
```

## Handoff File Pattern

Use a durable handoff file when the state is too long for a clean compact prompt.

Good candidates:

- `.omc/notepad.md`
- `.omc/handoffs/phase-16-batch-1.md`
- `docs/reviews/phase-N-skill-audit.md` for audit-only observations
- a temporary `docs/handoff-phase-N-batch-M.md` if the handoff should be visible in repo docs

The compact prompt should then say:

```text
Read `.omc/handoffs/phase-16-batch-1.md` first.
It contains the detailed preserved state and settled decisions.
Then run the resume sanity check below before continuing.
```

This keeps `/compact` short and gives the next session a stable source to re-read.

## Resume Sanity Check

Every compact prompt should include a small sanity check. Its job is to catch drift after compaction, not to redo the whole phase.

Useful checks:

```text
- `git status --short`
- read the current Batch Plan section
- verify the provider artifact path exists, then read it
- re-read the source files that own the behavior being modified
```

For prompt-generation work, include the governing template:

```text
Before writing the Codex implementation prompt, read the execute-task prompt template.
Do not reconstruct the prompt from memory.
```

## Immediate Next Checkpoint

Define the next stop, not a full implementation script.

Good:

```text
Write the Codex implementation prompt using the official prompt template.
Show the prompt preview and wait for approval.
Do not run Codex or edit source code before approval.
```

Risky:

```text
Create these four files and call DataStore from the new component.
```

The risky version turns an unverified implementation idea into an apparent instruction.

## What To Avoid

Avoid:

- freezing unverified implementation details;
- saying "modify only these files" before source ownership has been re-checked;
- pasting full recipes or provider specs when a path is available;
- repeating the same state block multiple times;
- omitting the skill/template file that governs the next action;
- making "waive the gate" a normal option unless the user explicitly asks for it;
- carrying forward stale assumptions after a branch, PR, merge, or provider run.

## Audit Notes

If the phase includes skill or workflow auditing, keep audit instructions minimal:

- do not duplicate already recorded audit entries;
- add new observations briefly;
- separate skill/process observations from product issues;
- do not let audit work delay implementation.

## Example Request

Use this when asking an agent to prepare a compact prompt:

```text
Context is nearly full. Read docs/compaction-guide.md and propose a compact prompt for the current handoff.
Keep it focused on state, settled decisions, open questions, authority pointers, sanity checks, and the next approval checkpoint.
```

## Review Checklist

Before using a compact prompt, check:

- Does it preserve user decisions that are not already in tracked docs?
- Does it preserve open questions without presenting them as settled?
- Does it point to the authoritative skill/template files for the next step?
- Does it require a sanity check before continuing?
- Does it avoid freezing an unverified implementation design?
- Does it state where the resumed session must stop?
- Does it avoid copying information that can be re-read from files?
