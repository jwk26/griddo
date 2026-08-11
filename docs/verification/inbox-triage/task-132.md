# Task 132 — Context and Breakdown base lifecycle

## Scope and authority

- Route: `http://localhost:3000/grid/8bcae1f1-f141-4f75-8e2a-35c8659cba88`
- Work order: Phase 26 Task 132 only, from the canonical
  `docs/EXECUTION_PLAN.md` section at the recovery anchor
  `05d1e39fa77588b0b90d66422eedffdd5586e00a`.
- Product authority checked: `UF-06`, `UF-12`, `AF-02`, `NEG-16`, the
  Selected Scratch Context recipe, and the Breakdown rows and empty states
  recipe.
- The component consumes Task 131's durable `useStagedCandidates` projection.
  It does not read the deprecated Zustand candidate compatibility state.
- `src/stores/triage-preferences-store.ts` is an intentional source no-op:
  accepted Task 127 already supplies the exact independent persisted
  `breakdownCreatedAtSort` value and setter. Its Task 132 test was extended and
  the component now consumes that existing API.

## TDD and focused verification

- Initial RED:
  `pnpm exec vitest run src/components/triage/breakdown-panel.test.tsx src/hooks/use-scratch-breakdowns.test.tsx src/stores/triage-preferences-store.test.ts`
  exited `1` with `15` expected failures and `38` passes. The failures named
  the absent Context/sort/row-state/empty-history projections.
- Review RED for full-title preservation:
  `pnpm exec vitest run src/components/triage/breakdown-panel.test.tsx -t "renders the selected Scratch Context with title and full time"`
  exited `1` because the Context title still used `truncate`.
- Independent review RED: the three selected files exited `1` with `11`
  failures and `41` passes after tests added fail-closed repository eligibility,
  missing-selected-Scratch, per-Scratch history, canonical-role, and exact-ID
  tie-break expectations.
- Final focused GREEN: the three selected files exited `0` with `52/52`
  tests passing.
- Task-path ESLint exited `0`; `pnpm typecheck` exited `0`; and
  `git diff --check` exited `0`.

## Runtime method

The in-app browser skill's required Node REPL was unavailable in this session,
so the documented fallback used a local headless Chrome CDP target against the
running Next.js development server. Browser IndexedDB was seeded with valid
Scratch, Breakdown, and Task 131 staged-candidate records. The all-deleted
state was reached through the visible Trash confirmation flow, rather than by
mutating IndexedDB behind the mounted subscription.

All captures use a `1440×900` viewport. Each state was checked in default
GridDO light and dark modes after color transitions settled. Direct inspection
confirmed no document-level horizontal overflow. A separate fresh browser
target, initialized with the persisted light theme, exercised Breakdown sort
and a light → dark → light ThemeToggle round trip with zero console errors.

## Observable results

| Seed / action | Result |
| --- | --- |
| Never used | Standalone working Context measured `104px`; no rows; idea prompt exposed `data-triage-state="never-used"`; no completion claim |
| Active | Two `48px` active rows; newest-first order was `Newer`, `Older`; sort changed it to `Older`, `Newer` and retained keyboard focus; no row numbering or time |
| Staged | Source row remained visible at `48px`, non-struck and de-emphasized; grip, Edit, and Trash were disabled; authoritative state came from Task 131 |
| Consumed removal | Consumed content was absent from the active list while the remaining active row stayed visible |
| Completed | One durable consumed row, zero active rows, and zero authoritative staged candidates produced the distinct `consumed-completion` / `breakdown-consumed-completion` state and `All items processed` |
| All deleted | Deleting the only active row through Trash produced `all-deleted` / `breakdown-ordinary-empty` in the mounted repository lifecycle; it did not claim completion |
| Ordinary | Consumed history with remaining authoritative staged-candidate truth produced `ordinary`, not completion |

The never-used/all-deleted distinction is deliberately mounted-lifecycle
evidence from repository subscription delivery: an initial empty repository
snapshot is never-used, while a non-empty snapshot followed by authoritative
deletion is all-deleted. Because deletion physically removes the row and the
approved schema has no persisted deletion-history record, a fresh mount onto
that empty repository truth correctly falls back to the shared ordinary idea
prompt and never invents completion history.

The Context exposes the complete, wrapping Scratch title, full creation date
and time, visible disabled Edit slot, and interactive ASC/DESC sort. Active and
staged rows expose stable grip/Edit/Trash geometry. Consumed rows are not
struck or retained. No VQ editor, VQ status realization, Archive control, or
Task 133 behavior was introduced.

## Captures

| Capture | SHA-256 |
| --- | --- |
| [`task-132-never-used-light-1440x900.png`](captures/task-132-never-used-light-1440x900.png) | `34fd47b5731aa8f00efcf3558e6a3d16e9968656d9fd99e7172bbe7382497ccd` |
| [`task-132-never-used-dark-1440x900.png`](captures/task-132-never-used-dark-1440x900.png) | `42bdc95d18ff934e6a4a2e8b4e36211491a9b2dfbc7d7e83e8399dece6a831eb` |
| [`task-132-active-light-1440x900.png`](captures/task-132-active-light-1440x900.png) | `2e501cce2060690638718447fa1a080f4a355b2937ea8f72e7f8bdb54aab29dd` |
| [`task-132-active-dark-1440x900.png`](captures/task-132-active-dark-1440x900.png) | `36ed3f00c23b4981fcac254c766ac1c264391096e4be89b18188ec13c01ae60e` |
| [`task-132-staged-light-1440x900.png`](captures/task-132-staged-light-1440x900.png) | `cc2844a857d104974b1b70556217346ef52cc0200c9414e8db5aebfe731fb10e` |
| [`task-132-staged-dark-1440x900.png`](captures/task-132-staged-dark-1440x900.png) | `c0a63022c78cb309f5b5d020e40632e3bcf1c67d247b92a93820df1c4d4a7566` |
| [`task-132-consumed-removal-light-1440x900.png`](captures/task-132-consumed-removal-light-1440x900.png) | `bdead485b129f66629a4af54dc267f36d68d1ff2f01cf4d522649762b32b0262` |
| [`task-132-consumed-removal-dark-1440x900.png`](captures/task-132-consumed-removal-dark-1440x900.png) | `e1744b5996de2bc1aaac6c2535549d9a87f9f0203e172f34566955ce45cb6282` |
| [`task-132-completed-light-1440x900.png`](captures/task-132-completed-light-1440x900.png) | `ac01f78636cd10f8796854d3c927b450dd92e673d0dba0bb7a7650d6253ba6b5` |
| [`task-132-completed-dark-1440x900.png`](captures/task-132-completed-dark-1440x900.png) | `c79510e27d46707053e8492143e534f3e9d37f37e66c39562d7ac264db32545c` |
| [`task-132-all-deleted-light-1440x900.png`](captures/task-132-all-deleted-light-1440x900.png) | `562f661a1d62c0930ae985893b6e511e24d6766ca6280d4b935fc659bd579080` |
| [`task-132-all-deleted-dark-1440x900.png`](captures/task-132-all-deleted-dark-1440x900.png) | `8f348ac17aefa20a71c9ae23bd9c7bcfb9bc0f8aed245a6b1fcd0d41435ecc37` |

## Full gate

Exactly one post-final-repair serial sequence ran with no relevant code/test
input change afterward:

| Command | Exit | Result |
| --- | --- | --- |
| `pnpm test` | `0` | `90` files, `728` tests passed |
| `pnpm lint` | `0` | `0` errors; `11` unchanged pre-existing warnings |
| `pnpm typecheck` | `0` | `tsc --noEmit` passed |
| `pnpm build` | `0` | Next.js `16.2.1`; production build completed with seven routes |

## Review and deviations

- Visual review found one concrete issue before the full gate: Context used
  truncation despite the full-title contract. A focused RED captured it, then
  the title was changed to wrap with preserved whitespace and the focused
  suite returned green.
- Independent code review found two Important and three Minor issues before
  the full gate. Completion now fails closed until Task 125's repository
  eligibility snapshot proves the active Scratch has consumed history, no
  active row, and no staged candidate; a missing selected Scratch cannot
  complete. Mounted deletion history is retained per Scratch across A → B → A.
  Context/Add semantic roles were corrected and the stable-ID tie-break is
  directly covered.
- The first all-deleted evidence attempt timed out because direct native
  IndexedDB deletion does not notify an already-mounted Dexie `liveQuery`.
  The evidence harness was repaired to use the visible Trash flow; this did
  not change product code or consume an additional full gate.
- No premature or additional full-gate sequence has run.
- Final independent re-review found no remaining Critical or Important Task
  132 issue. The ref-based mounted-history draft briefly failed focused lint;
  it was replaced before the full gate with immutable `ReadonlySet` React
  state, after which focused ESLint and the `52/52` tests passed.
