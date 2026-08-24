# Task 144 Verification — `DP-VQ06-POOL` Pool Statuses

## Scope and provenance

- Recovery anchor: `8022301e9d198560378ac3f9bd2e29bdf8dfd86f`.
- Approved entrypoint `src` tree: `940c5ce559c1de68bba71435d81ee4b7a3207cc9`.
- Candidate-pinned workflow: `94e89782f7fe2cdbdd035e842ca6881b4a87ce49`.
- `P27-05` durable resume/start: `18f27b790a186cbf72eb77d7560d8d7a514e1e3c`.
- Implementation: `d25ec44fe0448aea17c6b5b70eb746b2f01b03c6`.
- Reduced-motion repair chain: `0f71ceb5e8c84afeb5affdf98733ca345872f185` → `733155a17d548a55c3d5adc132a5d2fad1ce495b`.
- Theme-depth repair: `a07937f4bcb80edeb0db90441c5abe4cbacf710a`.
- Implemented `src` tree: `0f7b18f359e9c433bc217136ed0f24bd66cb74a7`.
- The run-phase Gate C receipt was not passed to the run-task resolver. The
  receipt-less pinned resolver returned `contract_ready=true` and
  `approval_required`; the user's Task 144 work order and targeted `P27-05`
  expansion supplied write authority.

Production ownership remains limited to `ScratchPool`, `useInbox`, centralized
Inbox copy, and global theme CSS with their tests. DataStore APIs, IndexedDB,
schema, persistence, timestamps, `triage-store`, Staging, Explorer, and Task
145+ remain unchanged.

## Realized contract

- `useInbox` compares authoritative active/archive/trash snapshots and exposes
  typed `remote-arrival`, `archive`, `delete`, and `restore` changes. It treats
  the initial snapshot as baseline, excludes IDs returned by this session's
  `createScratchBit`, and does not infer provenance from timestamps.
- `ScratchPool` owns mounted Inbox-page aggregation. It keeps search-hidden
  selection explicit, preserves selection/focus on remote activity, separates
  arrival review from lifecycle dismissal, and excludes selected external
  removal from the ordinary Pool line.
- The fixed band follows tools and precedes the scroll viewport. Expanded mode
  uses exact filtered/hidden/activity copy and actions; collapsed mode keeps
  all-active count plus non-control `+N` and lifecycle markers.
- `Clear search` preserves selection and returns focus to search. `Review new`
  focuses the first surviving unseen row without selecting it, with search as
  the vanished-arrival fallback. `Dismiss` clears only lifecycle aggregates and
  focuses search. Reload clears mounted activity; local creation does not add it.
- One semantic tree maps through all eight themes in light/dark. Pool status
  motion is static; the same-layer base override computes to exactly `0s` under
  reduced motion. Neumorphism and Claymorphism use existing inset band and
  raised marker shadow families rather than an undefined variable.

## TDD and bounded repairs

| Evidence | RED | GREEN |
| --- | --- | --- |
| Typed provenance | Two selected hook assertions failed before the projection existed. | Initial snapshot, local create exclusion, arrival/archive/delete/restore, and deleted-tombstone cleanup pass. |
| Pool/copy behavior | Six selected assertions failed for old counts and missing hidden/activity states/actions/copy release. | Exact copy, aggregation, independent actions, markers, selected-removal exclusion, and focus pass. |
| Test isolation | Existing reconciliation tests exposed retained Zustand `scratchPoolActiveIds` / `externalScratchRemoval`. | User-approved setup repair resets both fields; hook suite passes 14/14. |
| Reduced motion | Canonical Chrome computed `0.01ms`; the first layer-outside repair left the same signature. A new CSS owner test then failed because Pool was absent from `@layer base`. | Pool's scoped override now shares the global base layer; owner test and Chrome compute `animation-name: none`, `transition-duration: 0s`. |
| Theme depth | Review found undefined `--theme-shadow-inset`; Chrome computed `box-shadow: none` for Neumorphism/Claymorphism. | CSS owner test rejects the undefined variable; final Chrome reports concrete inset shadows in both modes. |

No remaining Critical or Important Task 144 finding was found in the final
scope/diff, interaction, accessibility, focus, motion, overflow, or visual
review.

## Hydration finding and baseline comparison

The production activity harness initially surfaced minified React `#418`.
Development/unminified comparison separated it from Task 144:

- Current Task 144 code and pre-Task-144 baseline `18f27b7` both produce zero
  errors for clean/default storage on first load and reload.
- Both produce the same error for persisted `theme=dark` plus
  `griddo-color-theme=graphite`, before any Pool activity exists: server Moon
  SVG versus client Sun SVG at `ThemeToggle` line 22.
- Both conditions show zero Pool status bands/actions before activity.
- `src/app/layout.tsx` and `src/components/layout/theme-toggle.tsx` have identical
  hashes at the baseline and current commits.
- Production repeats the same clean-versus-persisted distinction. The final
  Task 144 run hydrates clean/light, exercises all 16 theme-mode presentations,
  normalizes storage before the lifetime reload, and reports zero console/page
  errors.

Machine-readable comparison:
`captures/task-144-hydration-baseline.json`. The pre-existing ThemeToggle issue
is outside Task 144 and was not modified.

## Canonical Chrome evidence

- Local Playwright Core with system Google Chrome `151.0.7922.140` at
  `1440×900` on
  `http://localhost:3001/grid/11111111-1111-4111-8111-111111111111`.
- The actual GridDO IndexedDB schema was seeded with active, archived, and
  deleted Scratches. A second real app tab created the remote arrival through
  Quick Capture while the first tab observed authoritative snapshot changes.
- Hidden selection showed `1 of 4 Scratches` and exact hidden-selection copy;
  Clear search retained `aria-pressed=true` and focused search.
- Mixed activity rendered exact fixed-order
  `1 new, 1 archived, 1 deleted, 1 restored`; it preserved selection and search
  focus with polite/atomic semantics.
- Collapse/expand preserved `+1`, the separate non-control lifecycle marker,
  and the exact aggregate. Review new focused `Remote arrival` without changing
  selection; Dismiss focused search. Reload and a local Quick Capture left no
  activity action.
- All 16 theme/mode runs retained exact copy, had zero document overflow, and
  preserved the same semantic tree. Representative captures were visually
  inspected for GridDO light, Tiny Desk dark, and Terminal dark.
- Reduced motion computed `animation-name: none` and
  `transition-duration: 0s`. Browser console/page errors: none.
- Machine-readable report:
  `captures/task-144-browser-report.json` — SHA-256
  `7b7a7c5c4de20604bde6df406e371270e1c4924c97f82af446eaf65dd812b14d`.
- Representative captures:
  - `captures/task-144-pool-mixed-griddo-light.png` — SHA-256
    `89b06b63569a5dcbc630ceaf7addc991626bc4c3c797d838c50b9a5c0d60fdf0`.
  - `captures/task-144-pool-mixed-neumorphism-light.png` — SHA-256
    `eb9c62b95f458aa2372ccc9905d2562ff86d18746db89abf46c4ef2424064bd4`.
  - `captures/task-144-pool-mixed-terminal-dark.png` — SHA-256
    `127cf8764b031ea861c140ca8fbdb5605b982cf2aefc2993e0623a9b8ffc76cd`.
- Theme captures follow
  `captures/task-144-pool-mixed-{griddo,tiny-desk,neumorphism,claymorphism,origami,terminal,retro-mac,graphite}-{light,dark}.png`.

## Verification commands

| Command | Exit | Relevant result |
| --- | ---: | --- |
| Focused `pnpm exec vitest run` | 0 | Final fresh run: 3 files / 58 tests passed |
| Changed-file `pnpm exec eslint` | 0 | No errors or warnings in Task 144 TypeScript/TSX paths |
| `pnpm typecheck` | 0 | TypeScript passed |
| `git diff --check` | 0 | No whitespace errors |
| `pnpm test` | 0 | Final fresh full run: 94 files / 919 tests passed |
| `pnpm lint` | 0 | 0 errors; the same 11 existing warnings outside Task 144 paths |
| `pnpm typecheck` | 0 | Fresh full-gate typecheck passed |
| `pnpm build` | 0 | Next.js 16.2.1 production build passed; seven routes generated |
| Local Playwright/system Chrome | 0 | Hidden selection, provenance/lifecycle, focus/actions/lifetime, reduced motion, and 16 theme-mode runs passed |

## Checkpoint buckets

- Visible now: exact Pool filtered/hidden status, remote/lifecycle aggregate,
  collapsed markers, independent Review new/Dismiss actions, focus/lifetime,
  typed authoritative provenance, static reduced motion, and eight-theme
  light/dark mappings.
- Review now: Task 144 implementation and evidence acceptance. Task 144 remains
  `[ ]` until explicit user acceptance.
- Planned later: Task 145 Stage/Unstage adapters under its existing canonical
  ownership.
- Unowned: the pre-existing persisted-dark `ThemeToggle` hydration mismatch;
  the user directed this Task 144 cycle to record baseline evidence and make no
  product-code change.
