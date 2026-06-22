# Phase 19 B1 Gemini Design-Spec Handoff

Repo: `/Users/jwk/Documents/griddo2-claude`
Branch: `phase-19/archive-view`
Status: B1 Gemini design-spec prompt is prepared and readiness-checked. Gemini has **not** been launched.

## Resume Point

Resume Phase 19 from the B1 Stage 1 approval point.

Before launching any provider:
1. Read this handoff.
2. Confirm branch/status.
3. Re-run the prompt readiness check.
4. Re-show the Gemini prompt preview or summary.
5. Wait for explicit user approval before launching Gemini.

## Current Phase Context

Phase 19 scope:
- B1 / T86: Archive View surface + routing branch.
- B2a / T87: Single-item unarchive.
- B2b / T88: Direct archive context menu.

Recent commits on this branch:
- `6642acd` — `docs(phase-19): kickoff — T87 naming correction + Issues_Phase_19 batch plan`
- `8b53e5c` — `docs(phase-19): deferred index sync + batch plan B2a/B2b split`
- `2547271` — `docs(phase-19): flow-trace review + GAP-1/2/3 plan corrections`

Additional local doc update included with this handoff:
- `docs/issues/Issues_Phase_19.md` B1 classification changed from `ui-heavy` to `mixed`.
- Gemini involvement clarified: Gemini owns the Archive View visual design spec only; Codex owns DataStore + hook + component implementation.

## Planning Gate State

`docs/reviews/phase-19-flow-review.md` exists and was committed in `2547271`.

Flow-review findings were reflected:
- GAP-1: B1 needs `getArchivedItems()` on the DataStore facade and `indexeddb.ts` implementation.
- GAP-2: T88 context menu does not currently exist on grid cards and must be created.
- GAP-3: T88 depends on T86 because archive actions must go through `use-archive.ts`.

## B1 Final Shape

B1 classification: `mixed`.

B1 implementation write set after Gemini:
- `src/lib/db/datastore.ts` — add `getArchivedItems(): Promise<{ nodes: Node[]; bits: Bit[] }>`
- `src/lib/db/indexeddb.ts` — implement `getArchivedItems()` using the `getTrashedItems` pattern, filtering `archivedAt !== null`
- `src/hooks/use-archive.ts` — create Archive View hook boundary
- `src/components/archive/archive-view.tsx` — create
- `src/components/archive/archive-group.tsx` — create
- `src/components/layout/grid-runtime.tsx` — add `systemRole === "archive_view"` dispatch branch

Gemini's current task is visual design only. It must not decide API shape, hook interface, file structure, or DataStore method signatures.

## Gemini Prompt

Prompt path:

`.omc/prompts/phase-19-b1-gemini-design-spec.md`

Important: `.omc/` is gitignored. The prompt file should still exist in the working tree after `/clear`; do not expect it in `git status`.

Prompt readiness was checked:

```bash
~/.claude/skills/execute-task/scripts/check-prompt-ready --profile design-spec /Users/jwk/Documents/griddo2-claude/.omc/prompts/phase-19-b1-gemini-design-spec.md
```

Last known result:

```text
OK: 0 fence lines (balanced)
OK: prompt ready (profile: design-spec)
```

Prompt corrections already applied:
- `web-design-guidelines` is described as an installed provider-side skill, **not** a repository file path.
- `docs/DESIGN_TOKENS.md` is described as the repository token reference.
- Animation refers to the installed Motion package (`motion`) and says not to add a new animation dependency.
- HIGH-rated visual items that conflict with existing tokens, shadcn/ui component constraints, or accessibility requirements must be reported by Codex instead of silently overridden.

## Sanity Checks

Run before continuing:

```bash
cd /Users/jwk/Documents/griddo2-claude
git branch --show-current
git status --short
git log --oneline -5
~/.claude/skills/execute-task/scripts/check-prompt-ready --profile design-spec /Users/jwk/Documents/griddo2-claude/.omc/prompts/phase-19-b1-gemini-design-spec.md
```

Expected:
- Branch is `phase-19/archive-view`.
- Working tree is clean after the handoff commit.
- Recent history includes `2547271` and the handoff commit.
- Prompt readiness passes.

## Next Action

Ask the user for explicit approval to launch Gemini with:

```bash
omc ask gemini "$(cat .omc/prompts/phase-19-b1-gemini-design-spec.md)"
```

After Gemini completes:
1. Read the Gemini artifact.
2. Classify HIGH/MEDIUM/LOW decisions.
3. Check for token/component/a11y conflicts.
4. Use the resulting design spec plus `docs/reviews/phase-19-flow-review.md` to prepare the B1 Codex implementation prompt.
5. Do not start Codex until the user approves the B1 Codex prompt preview.

## Do Not Do

- Do not launch Gemini before explicit approval.
- Do not let Gemini decide DataStore or hook API shape.
- Do not treat `web-design-guidelines` as a repo file.
- Do not start B1 implementation before the Gemini design spec is reviewed and the Codex prompt is approved.
