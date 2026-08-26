# Phase 28 — Explorer Search And Pointer Placement

## Completion Summary

Tasks 149–154 were explicitly accepted on the isolated
`phase-28/explorer-search-pointer-placement` branch. The phase completes
release-time Explorer targeting, remote/path state, dedicated search,
direct/staged atomic placement, placement reliability, and Result Title/direct
limits without starting Task 155 or Phase 29.

| Task | Accepted deliverable | Implementation / evidence | Acceptance |
| --- | --- | --- | --- |
| 149 | Release-time targets and valid-column edge auto-scroll | `1830cc3` → `80bd704` | `9b26412` |
| 150 | `DP-VQ06-EXPLORER` remote/path statuses | `32237f4` → `14ade3c` | `b13bcf0` |
| 151 | `DP-VQ07` dedicated Explorer search and close semantics | `c2749b6` → `11a84c7` | `0ab994e` |
| 152 | Direct/staged placement selection and confirmation | `7ba9361` → `e25b1eb` | `12fd2a9` |
| 153 | `DP-VQ08` placement reliability states | `b73dc25` → `8110c6e` | `29bab4f` |
| 154 | `DP-VQ09` Result Title and direct-limit surfaces | `28ba551` → `643da81` | `0df3a0f` |

The final accepted `src` tree is
`e0e911a758363df677ed32eeef64910351a58478`.

## Accepted Foundation

- Pointer release uses final rendered DOM geometry, preserves full targets for
  confirmation, and scrolls only the valid active Explorer column.
- Explorer remote/path status distinguishes authoritative arrivals and path
  invalidation without counting initial hydration, local placement results, or
  existing-record moves as remote arrivals.
- Dedicated whole-hierarchy search retains its own query/path/reveal owner,
  exact close matrix, stale-selection behavior, native list semantics, and
  event-ended reveal lifetime.
- Direct and staged placement share one mounted-page coordinator, immutable
  source/target snapshot, foreground operation lock, exact Task 123 dispatch,
  authoritative reconciliation, and no-write invalidation behavior.
- Placement reliability and Result Title/direct-limit surfaces preserve source
  truth, exact disabled reasons, native focus/announcement lifetimes,
  reduced-motion parity, and eight-theme mappings.

## Verification And Acceptance

Every task has durable implementation/evidence and explicit user acceptance in
[`docs/issues/Issues_Phase_28.md`](../../issues/Issues_Phase_28.md). Accepted
task-level browser and mounted-owner evidence remains reusable without
inventing additional Phase 28 comparison results.

The fresh adapter-declared end-phase terminal gate ran serially at pre-close
`0df3a0fbb7170d66f47a199ffb398056e4e16c1e`:

| Command | Exit | Result |
| --- | ---: | --- |
| `pnpm test` | 0 | 98 test files / 1124 tests passed |
| `pnpm lint` | 0 | 0 errors; 11 unchanged warnings |
| `pnpm typecheck` | 0 | TypeScript check passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |
| `git diff --check` | 0 | No whitespace errors at pre-close |

## Canonical Reconciliation And Handoff

- `P28-01`–`P28-09` are Closed or Promoted to Execution Plan with actual
  `Reflected` or implementation-local `None` canonical impact.
- `P28-10` records the user-approved terminal disposition: Phase 28 preserves
  a measurement baseline and transfers comparative workflow audit to Phase 29.
- Active unresolved Phase 28 issues: 0.
- Blocking conformance violations: 0. Advisory conformance violations: 0.
- Phase Notes are not used by Adapter policy.
- The terminal Phase 28 workflow audit preserves all historical measured rows,
  records no final workflow verdict, and transfers `WF28-01`–`WF28-11` plus
  the seven decision questions to
  `docs/verification/inbox-triage/phase-29-workflow-pilot-audit.md`.
- Phase 29 must use unchanged candidate
  `94e89782f7fe2cdbdd035e842ca6881b4a87ce49` under its own Gate C and fresh
  branch/worktree. Task 155 and Phase 29 remain unstarted.
- Candidate skill or Adapter improvement is prohibited until after Phase 29
  publication and cleanup and requires a separate approval lifecycle pinned to
  the exact merged Phase 29 audit blob and Final Close receipt.
- No speculative workflow learning is added to `docs/execution-plan/LEARNINGS.md`.

**Full issue log:**
[`docs/issues/Issues_Phase_28.md`](../../issues/Issues_Phase_28.md)
