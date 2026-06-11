# Compaction Guide

Use this guide when context is nearly full and the next session must resume the same implementation work.

`/compact <instructions>` is best treated as guidance for the summary that will hand off to the next session. It is not a reliable place to freeze a full implementation design. Preserve the state and decisions that are hard to reconstruct, then point the resumed session back to the authoritative workflow files.

## How To Use This Guide

When asked to prepare a compaction handoff, do this:

1. Scan the current state: branch, phase, batch, changed files, completed gates, untracked handoff/audit files.
2. Collect settled decisions: user decisions, accepted overrides, provider outputs that should not be re-litigated.
3. Identify authority pointers: skill steps, prompt templates, execution plan sections, issue logs, review docs, provider artifacts.
4. Write the handoff to a durable file using the template below — this is the default path. The full structure belongs in a **file**, not in `/compact` instructions.
5. Put only a SHORT preservation note + a pointer to that file into the `/compact` instructions (or the next-session prompt) — typically 3–5 lines.
6. Run the review checklist and show both (file + short note) for approval before the user compacts or clears.

**Why a file, not the instructions:** `/compact <instructions>` should be treated as guidance to the summarizer — not verbatim handoff content, and not executable instructions. The exact summarization mechanics may change, so do not rely on the instructions being preserved literally. A lossy summary paraphrases or drops precise tokens (commit hashes, line numbers, sentinels) and — worse — silently loses conversation-only facts (e.g. "Gemini recommended disabled but the user chose hidden") that have no external ground truth to restore from. A durable file preserves both verbatim.

**Write the file early.** If auto-compaction is likely (context nearly full), create the durable handoff file *before* continuing work — do not wait until the final turn. Automatic compaction can fire before the handoff is written, and recent versions do not pass your `/compact` instructions to the auto-triggered summary.

## Handoff File Template

This is the structure for the durable handoff **file** — not the text pasted into `/compact`. The `/compact` instructions only point to this file (see "Compact vs Clear" below).

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

Copy into the handoff file (verbatim) when the information exists only in conversation:

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

**The file is the default, not a "long handoff" exception.** The trigger is not length — it is whether the handoff carries precise tokens (commit hashes, line numbers, sentinels) OR conversation-only facts (decisions/overrides with no external ground truth). A one-line handoff with a single critical commit or override still goes to a file. Inline-only is the rare exception: no precise tokens and no conversation-only decisions.

Good candidates:

- `.omc/notepad.md`
- `.omc/handoffs/phase-16-batch-1.md`
- `docs/reviews/phase-N-skill-audit.md` for audit-only observations
- a temporary `docs/handoff-phase-N-batch-M.md` if the handoff should be visible in repo docs

The `/compact` instructions (or the next-session prompt) should then say:

```text
Read `.omc/handoffs/phase-16-batch-1.md` first.
It contains the detailed preserved state and settled decisions.
Then run the resume sanity check below before continuing.
```

This keeps `/compact` short and gives the next session a stable source to re-read.

## Compact vs Clear

Once a complete durable handoff file exists, prefer `/clear` over `/compact`:

- **`/clear` + "read <handoff file>, resume from <step>"** — skips the lossy summary entirely; the file is the exact, deterministic context. Best when the file is complete.
- **`/compact <short note>`** — keeps a lossy summary of in-flight nuance not captured in the file. Use when you are not confident the file is complete. Trade-off: some `/compact` versions keep the pre-boundary transcript recoverable on disk; `/clear` truly discards it.

Rule of thumb: file complete → `/clear`. Unsure something conversation-only is uncaptured → `/compact`, then run the summary-fidelity check.

Copy-paste shapes:

```text
/compact short note:
Preserve the path `<handoff file>`.
Next session must read that file, run its sanity check, and resume from <skill> <step>.
Discard detailed implementation debate not captured in the file.
```

```text
/clear next prompt:
Read `<handoff file>`, run the sanity check, then resume from <skill> <step>.
Do not launch providers or edit source before the next checkpoint approval.
```

**Neither executes the resume.** Compaction only records the next step in the summary; it does not run it. `/clear` records nothing. The actual resume is triggered by the next session's first prompt ("read <file>, resume from <step>") — so that prompt, not the compact instructions, is what carries you into the work.

## Resume Sanity Check

Every handoff should include a small sanity check. Its job is to catch drift after compaction, not to redo the whole phase.

**External-state checks** (verify the world):

```text
- `git status --short`
- read the current Batch Plan section
- verify the provider artifact path exists, then read it
- re-read the source files that own the behavior being modified
```

**Summary-fidelity check** (verify the summary itself — the check most often missing):

```text
- spot-check that conversation-only decisions/overrides (e.g. "user chose hidden over Gemini's disabled") survived the compaction
- if any are missing or distorted, restore them verbatim from the durable handoff file before continuing
```

External-state checks catch drift in the world; the fidelity check catches drift in the summary. Conversation-only facts have no git or source file to restore from — only the handoff file. That is why the file must exist and must be complete.

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

Use this when asking an agent to prepare a compaction handoff:

```text
Context is nearly full. Read docs/compaction-guide.md and prepare the handoff: write the durable handoff file, then give me the short /compact-or-/clear note that points to it.
Keep it focused on state, settled decisions, open questions, authority pointers, sanity checks, and the next approval checkpoint.
```

## Review Checklist

Before using a handoff (file + short note), check:

- Does it preserve user decisions that are not already in tracked docs?
- Does it preserve open questions without presenting them as settled?
- Does it point to the authoritative skill/template files for the next step?
- Does it require a sanity check before continuing?
- Does it avoid freezing an unverified implementation design?
- Does it state where the resumed session must stop?
- Does it avoid copying information that can be re-read from files?
