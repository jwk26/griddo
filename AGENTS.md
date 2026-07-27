# GridDO Codex entrypoint

This is the Codex entrypoint. It coexists with, and does not replace or modify,
`CLAUDE.md`.

## Authority and discovery

- Read `docs/CODEX_WORKFLOW_ADAPTER.md` before a project-specific write.
- Read `docs/EXECUTION_PLAN.md` first when an approved execution lifecycle is
  active. In scaled mode, use its Phase Index and active phase detail; archive
  files are historical rather than default instructions.
- Canonical authority and exact paths are declared only by the adapter.
- `docs/WORKFLOW.md` owns durable direction-change and issue-recording rules.
  `docs/prd.md` is historical, non-authoritative context.
- Use `package.json` as the command source for application test, lint,
  typecheck, build, and development scripts. Do not copy command definitions
  here.

## Current Codex lifecycle scope

- Only `$craft-docs` is onboarded in the current Fresh-map adoption pass.
- `$run-phase`, `$run-task`, and `$end-phase` remain unavailable until their
  Git, branch/worktree, publication, archive, and cleanup fields are refreshed
  and separately approved.
- One onboarding commit is allowed for the user-approved `AGENTS.md` and
  `docs/CODEX_WORKFLOW_ADAPTER.md` port. Afterward, commits are allowed only
  for the current approved `$craft-docs` artifact and its durable receipt. Do
  not create or switch branches, push, merge, publish, or clean up.
- After each canonical artifact is approved, commit it immediately with its
  receipt and verify a clean worktree before deriving the next artifact.
- A task or phase receives `[x]` only after explicit user acceptance.
- Recover from committed documents, receipts, Git state, and rerun checks—not
  from chat memory or external evidence alone.

External Task 14 evidence is SHA-pinned as read-only reference material in the
adapter. It is not canonical authority and may not be copied without
production reconciliation and the owning document gate.

Claude/OMC/provider worker instructions are not Codex execution rules. Codex
must not invoke Claude, OMC, provider workers, or tmux workers. Their existing
files remain a separate, protected runtime entrypoint.
