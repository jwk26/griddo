# GridDO Codex Workflow Adapter

This profile ports the Gate C-approved adapter from commit `ff84ac8` into the
Fresh-map adoption worktree. It preserves the validated project roles while
limiting the current pass to `$craft-docs`. All relative paths resolve from
`repository_root`.

```yaml
repository_root: /Users/jwk/Documents/griddo2-codex-fresh-map-adoption

lifecycle_scope:
  active: [craft-docs]
  unavailable_until_separate_onboarding: [run-phase, run-task, end-phase]
  onboarding_commit_policy: one user-approved commit containing only AGENTS.md and docs/CODEX_WORKFLOW_ADAPTER.md
  commit_policy: commit only a user-approved craft-docs artifact together with its durable receipt; no branch creation, branch switch, push, merge, publication, or cleanup
  checkpoint_policy: after each artifact approval, commit immediately and require a clean worktree before deriving the next artifact

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
  active_phase_path: not used during craft-docs; derive from the approved replacement execution plan before run-phase onboarding
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
  full:
    - pnpm test
    - pnpm lint
    - pnpm typecheck
    - pnpm build
  document_validator: not configured; craft-docs owns citation, provenance, traceability, contradiction, link, and flow checks
  application_gate_scope: retained for later implementation lifecycles; not required merely because a Markdown-only craft-docs artifact changed
  user_visible_evidence: required for user-facing implementation tasks per docs/PLANNING_STANDARD.md; source-only disclosure is required for the current recipe pass
  conformance_tiers: Blocking violations stop close; Advisory findings are surfaced and recorded, per docs/PLANNING_STANDARD.md
  readiness_review: docs/reviews/inbox-triage-promotion-flow-review.md

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
    preserved_repository: git-preservation/task14-fresh-repository.bundle@c84cf189b7954caecf787e9551bf6026be77e7f8b5b99cdede68e397702c8af9

git:
  scope: branch/worktree/publication lifecycle inactive during craft-docs; current-branch onboarding and artifact checkpoint commits follow lifecycle_scope policies
  remote: origin
  remote_url: https://github.com/jwk26/griddo.git
  default_branch: main
  protected_branch: main (workflow-protected; provider policy must be refreshed before reuse)
  integration_branch: main
  branch_naming: phase-{N}/<lowercase-kebab-description>
  pilot_branch: historical phase-23/inbox-triage-persistence at 52a385d; recovery-only and not an input to this pass
  reuse_policy: no branch or worktree lifecycle action is authorized in this pass
  worktree_root: /Users/jwk/Documents
  pilot_worktree: /Users/jwk/Documents/griddo2-codex-phase-23-pilot (historical; inactive)
  primary_integration_worktree: /Users/jwk/Documents/griddo2-codex-integration (unverified; inactive)
  primary_integration_policy: refresh and obtain a separate lifecycle approval before use

publication:
  scope: inactive during craft-docs; retained from ff84ac8 for future re-onboarding
  provider: GitHub repository jwk26/griddo
  command_or_adapter: gh CLI
  status_evidence: refresh before any future publication gate
  pr_create_or_reuse: no action authorized in this pass
  pr_base: main
  pr_head: future separately approved feature branch
  title_body_draft: future Final Close-approved title and body
  merge_method: merge
  expected_head_pinning: future Final Close receipt
  required_checks_and_queue: refresh provider evidence before reuse
  bounded_wait_retry: at most 20 status reads at 15-second intervals after separate approval

archive:
  scope: inactive during craft-docs; paths retained from ff84ac8
  phase_archive: docs/execution-plan/archive/phase-{NN}.md
  central_deferred_index: docs/issues/Issues_Deferred.md
  phase_notes: docs/EXECUTION_PLAN.md phase notes before archival
  reusable_learnings: docs/execution-plan/LEARNINGS.md

cleanup:
  scope: inactive during craft-docs; retained from ff84ac8 for future re-onboarding
  remote_branch: no action authorized in this pass
  local_branch: no action authorized in this pass
  worktree: no action authorized in this pass
  final_close_receipt: docs/issues/Issues_Phase_{N}.md#final-close-receipt
```

## Runtime boundaries

- This adapter authorizes no fetch, branch/worktree mutation, push,
  publication, merge, or cleanup.
- A `$craft-docs` commit must contain only the user-approved artifact and its
  receipt. A changed approval hash, scope, source, target, or dirty worktree
  invalidates the next-step receipt.
- External evidence is read-only and SHA-pinned. Its prior approvals do not
  replace production document gates.
- Before another lifecycle begins, refresh its current fields and obtain the
  owning user approval rather than treating the inactive `ff84ac8` values as
  current authority.
