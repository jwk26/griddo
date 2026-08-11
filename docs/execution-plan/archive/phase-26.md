# Phase 26 — Lifetime, Copy, And Base-Surface Owners

## Completion Summary

Tasks 127–135 were explicitly accepted on the isolated
`phase-26/lifetime-copy-base-surfaces` branch. The phase establishes the
canonical lifetime and copy owners and the source-backed Inbox/Triage base
surfaces without starting Task 136 or any later interaction/realization work.

| Task | Accepted deliverable | Implementation / evidence | Acceptance |
| --- | --- | --- | --- |
| 127 | App-session triage state and two validated device preferences | `775045f` → `c5a1f65` | `8d2cde0` |
| 128 | Typed single core-English Inbox/Triage copy owner | `f57d1d5` → `beb63a2` | `0079dc3` |
| 129 | Semantic four-area Inbox shell and stable geometry | `78f6f97` → `2f2b8c5` | `dcced04` |
| 130 | Pool base flow and defensive Scratch promotion visibility guard | `3eed3a9` → `817432d` | `3ba4d72` |
| 131 | Durable candidate reactive boundary | `6ee8d4a` → `c927045` | `05d1e39` |
| 132 | Source-backed Context and Breakdown base lifecycle | `e18a18b` → `5236400` | `7dd0b2e` |
| 133 | Source-backed Staging base and authoritative count headings | `bf872fe` → `6e26326` | `5d8e2d3` |
| 134 | Full-label Explorer session columns and remote anchoring | `bc12c2d` → `29e0b61` | `2a4dabc` |
| 135 | Dedicated headless whole-hierarchy Explorer query lifecycle | `d3f7726` → `5f731d6` | `cb09da0` |

## Accepted Foundation

- Session state, device preferences, durable repository truth, and
  mounted-page query state remain with their declared lifetime owners.
- Components consume reactive hooks rather than sequencing repository writes.
  Durable candidates are joined to authoritative source rows; deprecated
  Zustand candidate compatibility state remains temporary and non-authoritative
  for Task 163 removal.
- The canonical route renders one shared semantic Inbox tree with source-backed
  Pool, Context/Breakdown, Staging, and full-label Explorer base surfaces.
- Dedicated Explorer search traversal/ranking/request state remains separate
  from global Search and has no UI body before Task 151.
- Task 130 resolves deferred `P23-03`; `P23-02` remains exactly owned by Task
  136. No Task 136 or Phase 27 behavior was introduced.

## Verification And Acceptance

Every task has a durable start, implementation/evidence boundary, explicit
user acceptance, and separate acceptance commit in
[`docs/issues/Issues_Phase_26.md`](../../issues/Issues_Phase_26.md). Accepted
route evidence for Tasks 129, 130, 132, 133, and 134 remains applicable.

The fresh end-phase serial full gate ran at pre-close
`cb09da04557bad3b253b87581a70d7ee24e630b6`:

| Command | Exit | Result |
| --- | ---: | --- |
| `pnpm test` | 0 | 92 test files / 743 tests passed |
| `pnpm lint` | 0 | 0 errors; 11 pre-existing warnings |
| `pnpm typecheck` | 0 | TypeScript check passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven static and one dynamic route |
| `git diff --check` | 0 | No whitespace errors at pre-close and detached preview |

## Canonical Reconciliation And Handoff

- Task 133 `Tagged` → `Reflected`: canonical Task 133 now includes
  `triage-workspace.tsx` and its test for Task 131 authoritative count headings.
- Task 134 `Tagged` → `Reflected`: canonical Task 134 now includes
  `triage-workspace.tsx` and its test for stale-placement callback wiring.
- Task 135 canonical impact remains `None`.
- Blocking conformance violations: 0. Advisory conformance violations: 0.
- Active Phase 26 issues: 0. Phase Notes: not used by adapter policy.
- Pinned pre-close SHA: `cb09da04557bad3b253b87581a70d7ee24e630b6`.
- Approved base and fetched integration `main`:
  `f91bf0529961541d9b7fa1645ee3aded081eaea3`.
- Phase 26 completion starts neither Task 136 nor Phase 27; both require their
  own explicit lifecycle authority.

**Full issue log:**
[`docs/issues/Issues_Phase_26.md`](../../issues/Issues_Phase_26.md)
