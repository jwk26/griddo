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

- The Fresh-map `$craft-docs` campaign is complete through its approved flow
  review and canonical-production parity maintenance at
  `041497c6b14f08998c4e8ef0bfb784f0285628aa`.
- A one-time **docs-only publication close candidate** is declared in
  `docs/CODEX_WORKFLOW_ADAPTER.md`. It applies only to
  `docs/inbox-triage-fresh-map-adoption` at the pinned heads in that profile;
  it is not reusable lifecycle onboarding.
- `$run-phase`, `$run-task`, and standard `$end-phase` remain unavailable.
  This close does not accept or execute Tasks 101–165 and does not convert
  their open markers to `[x]`.
- Candidate A may contain only this entrypoint and the adapter. Push, PR
  creation, merge, publication, branch deletion, and worktree cleanup remain
  forbidden until a separate user Final Close approval is recorded in the
  declared receipt.
- After proven merge and main synchronization, retire the one-time close and
  separately onboard `$run-phase` and `$run-task` from updated `main`.
- A task or phase receives `[x]` only after explicit user acceptance.
- Recover from committed documents, receipts, Git state, and rerun checks—not
  from chat memory or external evidence alone.

External Task 14 evidence is SHA-pinned as read-only reference material in the
adapter. It is not canonical authority and may not be copied without
production reconciliation and the owning document gate.

Claude/OMC/provider worker instructions are not Codex execution rules. Codex
must not invoke Claude, OMC, provider workers, or tmux workers. Their existing
files remain a separate, protected runtime entrypoint.
