# Task 134 — Explorer session columns and remote anchoring

## Scope and authority

- Route: `http://localhost:3000/grid/00000000-0000-4000-8000-000000000501`.
- Original recovery anchor: `5d8e2d317d55d599daa24a229a483fba6230b8a8`.
- Durable start: `445fd4f9d34f86207e338a49b9a6f629cfba865f`.
- Blocker record: `4a0f09f891720b68cfa007894daf06f169991bc7`.
- User-approved resumed start: `c6b2fc1b54d51c1777139e10b749467f70545cfa`.
- Production/test ownership is limited to the four canonical Task 134 files plus
  `triage-workspace.tsx` and its test only for wiring Explorer stale-target
  invalidation to the existing `handlePlacementCancel` owner.
- Canonical impact is `Tagged`: end-phase must add that bounded workspace
  callback wiring to the Task 134 file/action boundary.

## TDD and focused verification

- Initial RED: the Explorer/store selected run exited `1` with ten expected
  Task 134 failures and eleven existing store passes. Missing behavior included
  store reconciliation, full labels, search removal, shared path, re-entry,
  anchoring, fallback focus, and stale placement handling.
- Scope-expansion RED: the Explorer/workspace/store selected run exited `1`
  with two expected callback failures and 34 passes; neither the component nor
  the actual placement owner was notified when the target disappeared.
- Review RED: saved child-column scroll was cleared while its re-entry query was
  still loading and exposed a repeated null-anchor update loop. A dedicated
  test reproduced both before repair.
- Final selected GREEN:
  `pnpm exec vitest run src/components/triage/hierarchy-explorer.test.tsx src/components/triage/triage-workspace.test.tsx src/stores/triage-store.test.ts`
  exited `0`: three files and 37 tests passed.
- Target-path ESLint, `pnpm typecheck`, and `git diff --check` exited `0`.

## Runtime method

The required in-app Browser Node REPL was unavailable after tool discovery, so
the documented fallback used an isolated headless Chrome CDP target against
the local Next.js development server. Browser IndexedDB was seeded with valid
Dexie v4/physical-version-40 Inbox and four-level hierarchy records. Raw
remote mutations emitted Dexie's local storage-mutation event so the mounted
`liveQuery` subscriptions observed insert/delete/move without reload.

The two approved viewports were `1024×768` and `1920×1080`. Every captured
state retained zero document horizontal overflow and reported zero runtime
exceptions.

## Observable results

| State | Result at both viewports |
| --- | --- |
| Home | Path was exactly `Home`; headings were `Home`, `Level 1`, `Level 2`, `Level 3`; no selected item and no Explorer searchbox |
| Deep path | Full path was `Home / Personal Projects With A Complete Label / Long Running Research Program / Quarterly Evidence Review`; the exact three stable IDs were selected |
| Scratch switch | Focused component/store evidence preserved the shared Explorer path when `selectedScratchId` changed |
| Same-session re-entry | Soft route exit through Home and Inbox re-entry preserved the complete deep path, first-visible stable ID, offset `0`, and Level 1 `scrollTop 260` at both widths |
| Reload | Browser reload returned to path `Home` with no selection at both widths |
| Remote insert | Before/after first-visible ID remained `10000000-0000-4000-8000-000000000005` with offset `0`; scroll compensated `260 → 302`; deep path, three selected IDs, and focus on `Quarterly Evidence Review` remained unchanged |
| Remote delete | Deleting selected `Quarterly Evidence Review` reduced only the invalid suffix; path ended at `Long Running Research Program`, which received focus |
| Remote move | Moving selected `Long Running Research Program` under another root reduced only that suffix; path ended at `Personal Projects With A Complete Label`, which received focus; no sibling or ghost was selected |
| Stale placement | Focused Explorer/workspace tests prove one invalidation callback to the existing `handlePlacementCancel`; no repository write or `use-dnd.ts` change was introduced |

## Captures

| Capture | SHA-256 |
| --- | --- |
| [`task-134-home-1024x768.png`](captures/task-134-home-1024x768.png) | `cc5204184a6c0a38ef81999246f4bb13ddb8141713f6683199be64cc0c93a582` |
| [`task-134-home-1920x1080.png`](captures/task-134-home-1920x1080.png) | `4a7b6237388988623872fbe09468f0c6beddc7a8fd95e2714ab3f45c71eceae9` |
| [`task-134-deep-1024x768.png`](captures/task-134-deep-1024x768.png) | `a7ccd6d6676ce203abf446ede8085c69e093838de58f3ac64cb08d0df572a2e0` |
| [`task-134-deep-1920x1080.png`](captures/task-134-deep-1920x1080.png) | `920c7b17518c3da938b39dc9e93fe088033e237405c53ac5a1dc861767b67071` |
| [`task-134-reentry-1024x768.png`](captures/task-134-reentry-1024x768.png) | `146ff4055d388c70754878c14c0cbe23e4ecc33a7d9decc7c31aab559f5195ba` |
| [`task-134-reentry-1920x1080.png`](captures/task-134-reentry-1920x1080.png) | `5eb8da86978480fd932c5725c48fceb9727d7fdaaa270dc819257a01d8eb2047` |
| [`task-134-reload-1024x768.png`](captures/task-134-reload-1024x768.png) | `c47debb4a94cdb4c12fb27f50f9a508b1efe2b1bdcfc03f9a31f5105840db938` |
| [`task-134-reload-1920x1080.png`](captures/task-134-reload-1920x1080.png) | `acd8d3d83fbf24e8b49a515a1198685aae6c3142206e1fcefc579a50d2fba891` |
| [`task-134-remote-insert-1024x768.png`](captures/task-134-remote-insert-1024x768.png) | `b158686b4b593b01c69737fa2682745436d702eb0bee5fc1989d15d0ed1403df` |
| [`task-134-remote-insert-1920x1080.png`](captures/task-134-remote-insert-1920x1080.png) | `fee28949fbf4c48998a6bd4d18c33f34874cace812b05e55aac129eee6ff4746` |
| [`task-134-remote-delete-1024x768.png`](captures/task-134-remote-delete-1024x768.png) | `c03c3c9cc52813a118a30496ea00a57b635327e33cd8ee1079afdf5378a0fc20` |
| [`task-134-remote-delete-1920x1080.png`](captures/task-134-remote-delete-1920x1080.png) | `c09338ef938008eb2e524468c9ea7394a9e523c80045084f60ca55c89f9095e1` |
| [`task-134-remote-move-1024x768.png`](captures/task-134-remote-move-1024x768.png) | `9cb4d44f1c31f6102bac80d649bff5292507d056f364d7d20f8e9f56ee0aac14` |
| [`task-134-remote-move-1920x1080.png`](captures/task-134-remote-move-1920x1080.png) | `a48b236de63d5eaa99e47a3d9f8e8ec3a007c3a99dc7798b969c28fa54e0d878` |

## Review and full gate

- Concrete review findings repaired before the full gate: the approved scope
  initially could only hide stale pending presentation, not close the actual
  workspace-owned dialog; section-body DnD breadcrumb data was restored after
  the Explorer rewrite; re-entry loading no longer clears a saved anchor; and
  null-anchor reconciliation no longer emits an infinite update loop.
- React review kept transient DOM geometry in refs, used stable-ID lookups, and
  avoided persisted/session-incorrect state. No remaining concrete Critical or
  Important Task 134 finding was identified.
- Exactly one post-final-repair serial full gate ran, with no production/test
  input change afterward:

| Command | Exit | Result |
| --- | ---: | --- |
| `pnpm test` | `0` | 90 files and 733 tests passed |
| `pnpm lint` | `0` | 0 errors; unchanged 11 pre-existing warnings |
| `pnpm typecheck` | `0` | `tsc --noEmit` passed |
| `pnpm build` | `0` | Next.js 16.2.1 production artifacts generated; build ID `A8Oy1A3jLxkf70atESyde`, seven static routes and one dynamic route |
