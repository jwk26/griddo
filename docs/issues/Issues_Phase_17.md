# Issues — Phase 17: Inbox / Triage Workspace

> **Branch:** `phase-17/inbox-triage-shell`
> **Issue doc:** live record of execution-time issues, fixes, and out-of-plan changes.
> **Batch Plan:** added at Step 4 of Batch 1 (first provider launch).

---

## Open Issues

*(none)*

---

## Closed Issues

### CI-3 — Codex added mock for ScratchPool to grid-runtime.test.tsx (out-of-spec file)

- **Category:** test infrastructure / cascading dependency fix
- **Detected:** Post-Codex, `git status --porcelain` scan at Step 6
- **Description:** Codex modified `src/components/layout/grid-runtime.test.tsx` — outside the approved T79 file list. The change is a 4-line `vi.mock()` addition for `@/components/triage/scratch-pool`. This is a necessary cascading fix: `grid-runtime.test.tsx` renders through a component tree that now includes `TriageWorkspace → ScratchPool`; without the mock, `useInbox()` and `useTriageStore()` would be called in an uncontrolled test context.
- **Fix:** No corrective action needed. Change is correct and benign (test-only, no production impact). Accepted after reporting to user per handoff protocol.
- **Verification:** All 63 test files / 324 tests pass. Build clean.
- **Status:** Closed — accepted in Batch 2 commit.

### CI-1 — Breadcrumbs overlay covered TriageWorkspace header on Inbox route

- **Category:** product-side execution deviation / unexpected visual behavior
- **Detected:** Post-Codex integration, during browser smoke pass (Batch 1 checkpoint)
- **Description:** On the Inbox/Triage route, the Breadcrumbs component rendered on top of the TriageWorkspace header area. The approved spec did not include a Breadcrumbs visibility rule for the Inbox route.
- **Fix:** `grid-runtime.tsx` — conditionally hide Breadcrumbs when `node?.systemRole === "inbox"`. Shell kept mounted; no top-level early return introduced.
- **Verification:** Browser smoke pass confirmed (user-verified). `pnpm typecheck` / `pnpm test` (309 tests) / `pnpm build` / `pnpm lint` — all PASS.
- **Status:** Closed — resolved in commit `4dec7d2`.

### CI-2 — Missing Home escape hatch on Inbox/Archive system node routes

- **Category:** product-side execution deviation / missing navigation affordance
- **Detected:** Post-Codex integration, during browser smoke pass (Batch 1 checkpoint)
- **Description:** Navigating to the Inbox (or Archive View) system node route left the user with no way to return to the main grid. Breadcrumbs were hidden (CI-1 fix) and no Home button was shown on system node routes.
- **Fix:** `sidebar.tsx` — derived `isSystemNodeRoute` from `systemNodes`; existing Home button now shown when `isCalendarRoute || isSystemNodeRoute`.
- **Verification:** Browser smoke pass confirmed (user-verified). `pnpm typecheck` / `pnpm test` (309 tests) / `pnpm build` / `pnpm lint` — all PASS.
- **Status:** Closed — resolved in commit `4dec7d2`.

---

## Phase-local Question Resolution

*(populated during execution when Decision prerequisite or Provisional default paths fire)*

---

## Batch Plan

### Original Proposal

| Batch | Tasks | Classification |
|-------|-------|----------------|
| Batch 1 | T77, T78 | mixed |
| Batch 2 | T79 | mixed |
| Batch 3 | T80 | logic-heavy |

### Execution Status

| Batch | Tasks | Status |
|-------|-------|--------|
| Batch 1 | T77, T78 | Implemented |
| Batch 2 | T79 | Implemented |
| Batch 3 | T80 | Implemented |

### Deviations

- **Batch 1 follow-up (CI-1, CI-2):** Two out-of-plan fixes applied after the Codex implementation pass — Breadcrumbs conditional hide on Inbox route and Home button shown on system node routes. Both were within Batch 1 approved file scope (`grid-runtime.tsx`, `sidebar.tsx`), verified by browser smoke pass + full verification suite, and committed in `4dec7d2`. See phase-17-skill-audit.md A9 for workflow boundary note.
- **Batch 2 cascading test fix (CI-3):** Codex added a `vi.mock()` for `ScratchPool` in `grid-runtime.test.tsx` — outside the T79 approved file list. Accepted as a necessary test infrastructure fix (no production code changed). Reported to user per handoff protocol before acceptance.
