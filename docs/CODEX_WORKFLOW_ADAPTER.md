# GridDO Codex Workflow Adapter

This profile binds the approved GridDO canonical documents to the Phase 23
execution worktree. The Fresh-map `$craft-docs` campaign is complete and was
published by PR #36. Gate C authorized Phase 23 preparation and the first
bounded batch; committed task-acceptance receipts advance later batches. All
relative paths resolve from `repository_root`.

```yaml
repository_root: /Users/jwk/Documents/griddo2-codex-phase-23-model-foundation

lifecycle_scope:
  active: [run-phase, run-task]
  craft_docs_state: complete and merged by PR #36 at main a532d9e3becd5b333da8bb9ae7e1d0c6f442666f
  run_phase: Gate C-approved Phase 23 preparation is complete
  run_task: Tasks 101–105 accepted; no production-code batch active pending the Task 105A SCHEMA gate
  end_phase: fields refreshed below but lifecycle unavailable until a separate user Final Close
  expired_authority: the one-time docs-publication close is complete and may not be reused
  onboarding_commit_policy: one post-base-green commit containing only AGENTS.md and docs/CODEX_WORKFLOW_ADAPTER.md
  commit_policy: run-phase may commit the approved entrypoint and kickoff receipt; run-task follows its exact task and ledger commit contracts
  checkpoint_policy: require a committed clean receipt before each lifecycle handoff
  task_acceptance_policy: Tasks 101–105 accepted; Task 105A and Tasks 106–165 remain open; only explicit user acceptance may write `[x]`

canonical_documents:
  authority_order: [schema, spec, design, execution, planning_standard, workflow]
  product: docs/prd.md (historical context; non-authoritative)
  schema: docs/SCHEMA.md
  spec: docs/SPEC.md
  design: docs/DESIGN_TOKENS.md
  execution: docs/EXECUTION_PLAN.md
  planning_standard: docs/PLANNING_STANDARD.md
  workflow: docs/WORKFLOW.md
  decision_roots: [docs/brainstorming]

planning_layout:
  mode: scaled
  active_plan: docs/EXECUTION_PLAN.md
  scaled_index: docs/EXECUTION_PLAN.md#phase-index
  archive: docs/execution-plan/archive/phase-{NN}.md
  numbering_source: docs/EXECUTION_PLAN.md#next-numbers

issue_ledger:
  path: docs/issues/Issues_Phase_{N}.md
  active_phase_path: docs/issues/Issues_Phase_23.md
  create_policy: create during an approved phase kickoff when absent
  active_states: [Open, In Progress, Awaiting User Decision]
  terminal_states: [Closed, Deferred, Dropped, Promoted to Execution Plan]
  user_acceptance_marker: "[x]"
  direction_change_record: docs/brainstorming/YYYY-MM-DD-<topic>/DECISION.md
  direction_change_history: docs/brainstorming/YYYY-MM-DD-<topic>/NOTES.md

verification_gates:
  authoritative_source: package.json scripts plus docs/PLANNING_STANDARD.md
  focused:
    - git diff --check
    - "Task 105: pnpm exec vitest run src/lib/db/scratch-aggregate-hard-delete.test.ts src/lib/db/cascade-hard-delete.test.ts src/lib/db/auto-cleanup.test.ts src/lib/db/scratch-breakdowns.test.ts"
    - "Task 105: pnpm typecheck"
  full:
    - pnpm test
    - pnpm lint
    - pnpm typecheck
    - pnpm build
  document_validator: not configured; craft-docs owns citation, provenance, traceability, contradiction, link, and flow checks
  application_gate_scope: full gate at run-phase base; focused plus every invalidated full gate during run-task
  user_visible_evidence: required for user-facing implementation tasks per docs/PLANNING_STANDARD.md; not used for Phase 23 data-only Tasks 101–105
  conformance_tiers: Blocking violations stop close; Advisory findings are surfaced and recorded, per docs/PLANNING_STANDARD.md
  readiness_review: docs/reviews/inbox-triage-promotion-flow-review.md

phase_execution:
  phase: 23
  phase_tasks: [101, 102, 103, 104, 105, "105A"]
  accepted_tasks: [101, 102, 103, 104, 105]
  current_batch: []
  next_gate: Task 105A SCHEMA Hook 9 amendment
  unavailable_followup: ["Task 105A implementation"]
  source_mode: approved clean canonical plan and flow review merged by PR #36
  kickoff_receipt: docs/issues/Issues_Phase_23.md#gate-c-kickoff-receipt
  approved_base: a532d9e3becd5b333da8bb9ae7e1d0c6f442666f
  feature_branch: phase-23/inbox-triage-model-foundation
  worktree: /Users/jwk/Documents/griddo2-codex-phase-23-model-foundation
  historical_pilot: retired on 2026-07-28 at 52a385d601a6394f2e140078be1ca7b5242e5ca9; audit identity only and not an input

craft_docs:
  selected_route: Brainstorming Route with visual-prototype intake
  selected_topic: docs/brainstorming/2026-06-25-inbox-triage-theme-surface-redesign
  promotion_map: docs/brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/PROMOTION_MAP.md
  approved_map_content_commit: 114b032e7c958ca722a56842253874f5e363c6e2
  approved_map_content_sha256: 06bfaff9982f59435a112d51a71309803d3c3933dae965a97819f7de9c9aecc8
  approval_receipt_commit: 90022e73666857dd6f7906087d8386a85aa73e08
  approval_receipt_path: docs/brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/PROMOTION_MAP.md#approval-receipt
  artifact_order: [recipe_package, schema, spec, design, execution, planning_standard, flow_review]
  recipe_index: docs/recipes/inbox-triage-visual-recipe-index.md
  flow_review: docs/reviews/inbox-triage-promotion-flow-review.md
  receipt_policy: embed the gate, approved pre-receipt content SHA-256, receipt commit, user disposition, and next legal action in each owning artifact
  external_evidence_mode: read-only reference; never canonical authority; reconcile with production and the approved map before adoption
  external_evidence_root: /Users/jwk/Documents/task14-capstone-restart-20260727-evidence
  external_evidence:
    recipe_manifest: recipe/SHA256SUMS@3dc101cd6d6a610815807e072ea4b29deb0487759b3bdd155121044f0af7f049
    schema: schema/SCHEMA.operator-reviewed-9338ecee.md@9338ecee14adb1f5d7b131391ad8a808db438e9b633c1cb3dfc2cb37a4a62a6b
    spec: spec/SPEC.reviewed-ec1ee6ac.md@ec1ee6ac1d4781f332eeab66bcf2a24355c32936f4608c866ed43f651df5ed89
    design: design-tokens/DESIGN_TOKENS.reviewed-e07015e9.md@e07015e9df7e761173fa2547406637854fb0d63b323e3499e3379337740f3574
    execution: planning/EXECUTION_PLAN.reviewed-0cd16ab3.md@0cd16ab3daf4b0fbce5a014bae055acb48db8f70d19f9dcd5fa2ca043c1b6b00
    planning_standard: planning/PLANNING_STANDARD.reviewed-24c2e879.md@24c2e879bfd006c04da23d80830108a0f85d4693e3367e3825e9841b5bc05119
    flow_review: flow-review/phase-23-flow-review.reviewed-418b613d.md@418b613d45685ecaf9fae374b49b370813042e73ecdc71e2ae92bea08ed1e625

git:
  scope: Gate C-approved Phase 23 branch/worktree preparation and receipt-gated task execution; no publication authority
  remote: origin
  remote_url: https://github.com/jwk26/griddo.git
  default_branch: main
  protected_branch: main (workflow-protected; no direct writes)
  integration_branch: main
  branch_naming: phase-{N}/<lowercase-kebab-description>
  active_phase_branch: phase-23/inbox-triage-model-foundation
  active_phase_worktree: /Users/jwk/Documents/griddo2-codex-phase-23-model-foundation
  approved_base: origin/main at a532d9e3becd5b333da8bb9ae7e1d0c6f442666f
  pilot_branch: not used; the superseded phase-23/inbox-triage-persistence branch was retired at 52a385d
  reuse_policy: reuse only the exact Gate C branch/worktree when receipt, ancestry, and cleanliness match; never reconstruct or import the retired pilot
  worktree_root: /Users/jwk/Documents
  pilot_worktree: not used; retired on 2026-07-28
  primary_integration_worktree: /Users/jwk/Documents/griddo2-codex-integration
  primary_integration_policy: keep clean on main and refresh origin/main before integration or close; never repurpose another worktree

publication:
  scope: refreshed for the current feature branch but inactive until a separate end-phase Final Close
  provider: GitHub repository jwk26/griddo
  command_or_adapter: gh CLI
  status_evidence: refresh fetched refs and GitHub PR/check policy during future end-phase; Gate C observed no remote feature ref
  pr_create_or_reuse: after Final Close, reuse exactly one matching open PR only when approved head/base match; otherwise create one and stop on ambiguity
  pr_base: main
  pr_head: phase-23/inbox-triage-model-foundation at the future receipt-pinned head
  title_body_draft: exact future Final Close-approved title and body
  merge_method: merge
  expected_head_pinning: verify PR headRefOid equals future receipt commit B and merge with `--match-head-commit`; never use force, admin, auto, or implicit branch deletion
  required_checks_and_queue: refresh at Final Close and require every reported required check to reach terminal success
  bounded_wait_retry: at most 20 status reads at 15-second intervals; then record publication pending without changing the receipt

archive:
  scope: inactive during craft-docs; paths retained from ff84ac8
  phase_archive: docs/execution-plan/archive/phase-{NN}.md
  central_deferred_index: docs/issues/Issues_Deferred.md
  phase_notes: docs/EXECUTION_PLAN.md phase notes before archival
  reusable_learnings: docs/execution-plan/LEARNINGS.md

cleanup:
  scope: refreshed for future end-phase but inactive until merge and integration proofs
  remote_branch: after Final Close and proven merge, delete only phase-23/inbox-triage-model-foundation without force
  local_branch: from the clean integration worktree, delete only the proven merged active phase branch with `git branch -d`
  worktree: remove only /Users/jwk/Documents/griddo2-codex-phase-23-model-foundation when clean and proven merged; preserve it on any guard failure
  final_close_receipt: docs/issues/Issues_Phase_23.md#final-close-receipt
  recovery: preserve successful merge and all unsafe cleanup targets if any cleanup proof fails
```

## Runtime boundaries

- Gate C authorized the exact branch/worktree preparation and kickoff receipt;
  later task execution requires the committed prior-task acceptance boundary.
- `$run-task` requires the committed kickoff and Task 103 acceptance receipts,
  may execute only Task 104, and never owns branch topology or publication.
- `$end-phase` is not active. Its refreshed fields are future inputs only and
  require their own close audit and user Final Close approval.
- The completed one-time docs-publication authority is expired and cannot be
  treated as Phase 23 publication permission.
- The historical pilot is retired and is not an implementation input.
- External evidence is read-only and SHA-pinned. Its prior approvals do not
  replace production document gates.
