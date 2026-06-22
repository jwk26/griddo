# GridDO Handoff — Phase 18 T83 Codex Prompt Blockers

> Read this first, run the Resume Sanity Check, then resume. Do not launch Codex before the blockers below are patched and re-reviewed.

## Resume Point

Continue Phase 18 Batch 3 (T83) at **execute-task Step 4, Stage 2 — Codex prompt patch review**.

Codex Stage 2 is **not approved**. The saved prompt exists at `.omc/prompts/t83-codex.md`, but it still has schema-level blockers recorded below. Patch the prompt, rerun the fence check, show the changed sections for review, and only then ask for Codex launch approval.

## Current State

- handoff_status: current
- Repo: `/Users/jwk/Documents/griddo2-claude`
- Branch: `phase-18/inbox-triage-dnd`
- Last tracked phase commit before this handoff: `068bd0e docs(phase-18): stamp batch 3 In Progress`
- Batch status: Phase 18 Batch 3 / T83 is `In Progress`
- Provider state: Gemini Stage 1 completed; Codex Stage 2 has **not** launched
- Working tree before this handoff: clean
- Local-only audit: `docs/reviews/phase-18-skill-audit.md` is gitignored and must not be committed

## What Is Already Settled

- T82 is complete and committed.
- T83 docs/API correction is committed in `5baaa38`.
- Batch 3 status stamp is committed in `068bd0e`.
- Gemini Stage 1 prompt passed official fence check and launched.
- Gemini wrote no source files; only the batch status stamp had been dirty before it was committed.
- `.omc/prompts/t83-codex.md` has already been patched for:
  - `Next.js 16.2.1`
  - DataStore root handling via `parentNodeId: null`
  - `dropId` as UI-only pending-confirmation id
  - `markScratchBreakdownConsumed(id)` existing API
  - Bit rows display-only, not droppables
  - `check-prompt-fences` currently passes with `OK: 0 fence lines (balanced)`

## Remaining Blockers

### B1 — Node level schema violation

`nodeSchema.level` is constrained to `0..2`.

The current Codex prompt still allows staged Node candidates to drop onto L3/level-2 Node cells and instructs Node creation with:

`level: targetNodeLevel === null ? 0 : targetNodeLevel + 1`

If the target is an L3 Node with `level === 2`, this creates a level-3 Node and fails schema validation.

Patch `.omc/prompts/t83-codex.md`:

- staged Node valid targets: Home, L1 Node, L2 Node only
- staged Node over L3 Node: invalid / no Node placement
- `handleDragEnd` must not create `pendingPlacement` for a staged Node when `dropData.targetNodeLevel >= 2`
- `handlePlacementConfirm` must keep a race-condition guard for the same case before `createNode`
- staged Bit valid targets: L1, L2, and L3 Node cells

### B2 — Icon defaults use invalid render keys

The current prompt uses lowercase icon values:

- Node: `icon: "folder"`
- Bit: `icon: "circle"`

The UI renders icons through `NODE_ICON_MAP`, whose keys are PascalCase (for example `Folder`, `ListTodo`, `Box`). Lowercase strings pass the loose schema but render as fallback icons.

Patch `.omc/prompts/t83-codex.md`:

- Node icon: `DEFAULT_ICON` or `"Folder"`; if using `DEFAULT_ICON`, import it from `@/lib/constants/node-icons`
- Bit icon: `"ListTodo"` or another valid `NODE_ICON_MAP` key
- Do not use lowercase icon keys in create payload examples

### B3 — Hook usage wording must not imply conditional hooks

The prompt says to "skip fetch if `selectedL1Id === null`" / "skip fetch if `selectedL2Id === null`" around `useGridData`.

Do not conditionally call React hooks. Patch the wording:

- call `useGridData(selectedL1Id)` and `useGridData(selectedL2Id)` consistently
- hide or ignore L2/L3 data when the relevant selection is `null`
- do not wrap `useGridData` calls in conditionals

## Required Resume Commands

Run these before editing:

```bash
git status --short
git log --oneline -5
rg -n "targetNodeLevel|createNode\\(|icon:|skip fetch|useGridData|triage-staged-node|L3" .omc/prompts/t83-codex.md
```

Expected:

- `git status --short` is clean
- recent history includes this handoff commit and `068bd0e`
- `.omc/prompts/t83-codex.md` exists

## Patch Then Verify

After patching `.omc/prompts/t83-codex.md`, run:

```bash
/Users/jwk/.claude/skills/execute-task/scripts/check-prompt-fences .omc/prompts/t83-codex.md
rg -n "targetNodeLevel|level:|icon:|skip fetch|useGridData|triage-staged-node|triage-staged-bit|L3" .omc/prompts/t83-codex.md
```

Then present only the changed sections for review. Do not launch Codex until the user approves the revised prompt.

## Audit Continuity

Keep the Phase 18 skill-audit track active:

- File: `docs/reviews/phase-18-skill-audit.md`
- Status: local-only / gitignored
- Current relevant findings: A13-A16
- Do not commit the audit file
- Add a new audit entry only if a genuinely new workflow/process failure occurs; do not duplicate A13-A16

## Next Session Prompt

Use this after `/clear`:

```text
Resume Phase 18 Batch 3 (T83).

Repo: /Users/jwk/Documents/griddo2-claude
Branch: phase-18/inbox-triage-dnd

Read docs/handoffs/phase-18-t83-codex-prompt-blockers.md first and run its Resume Sanity Check.

Then patch .omc/prompts/t83-codex.md. Do NOT launch Codex yet.

Patch blockers:
1. Node.level is 0..2. staged Node drops are valid only on Home, L1 Node, and L2 Node; staged Node over L3/level-2 Node is invalid.
2. Use valid NODE_ICON_MAP keys: Node "Folder"/DEFAULT_ICON, Bit "ListTodo" or another valid key; no lowercase "folder"/"circle".
3. Do not conditionally call useGridData; call hooks consistently and ignore hidden column data as needed.

After patching, run:
/Users/jwk/.claude/skills/execute-task/scripts/check-prompt-fences .omc/prompts/t83-codex.md

Show changed sections for review and ask for Codex Stage 2 launch approval.
Keep docs/reviews/phase-18-skill-audit.md local-only and do not commit it.
```
