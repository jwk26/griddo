# Task 152 Atomic Pointer Placement Evidence

> Date: 2026-08-26
> Task state: `[ ]`, implemented; awaiting checkpoint acceptance
> Entry / accepted Task 151 checkpoint: `0ab994e867754db96d64c34691942d27cf9c8efc`
> Durable start commit: `2d913f633a7f08523e8db3ee10f8b06579707995`
> Fourth-repair recovery anchor: `2e4e17b95b84ae1da86692074b0b5fc7a3517498`
> Implementation commit: `7ba936147722e1e8ebb4a3fb6b9bceed9a65ca88`
> Implementation `src` tree: `8247077665a212e575faad44f20046de623b7306`

## Implemented Boundary

The mounted Task 152 coordinator captures a staged or direct pointer release as
one immutable source/candidate/target/path/version/cell snapshot. Direct
placement requires a distinct Node/Bit step; staged placement proceeds to the
same target-column confirmation with its captured type. Drop itself performs
no placement write. Confirm acquires the shared `placement` lock and invokes
the existing Task 123 direct/staged command exactly once.

Pending, unknown, and reconciling phases retain the lock and reject Cancel,
Escape, duplicate Confirm, and every competing operation without queue or
replay. Unknown reconciliation reuses the exact captured command. Only a
terminal repository result releases the lock. Full targets retain the visible
source-backed confirmation, show the existing full reason, disable Confirm,
and keep pre-dispatch Cancel working. Invalid or stale targets close without a
write and return focus to the exact source or surviving Explorer fallback.

Placement closes Task 135 headless Explorer Search before rendering its
target-column affordance. A successful result registers only its exact typed
identity and focuses the real authoritative Node/Bit card when that card is
rendered. `P28-05` replaced bounded frame polling with a render-driven,
typed-identity one-shot focus handoff that persists across delayed live-query
rendering.

## TDD, Repairs, And Review

| Evidence | Exit | Result |
| --- | ---: | --- |
| Initial placement-owner RED | 1 | The new coordinator import/module was absent, establishing the planned owner boundary before implementation. |
| First integrated focused cycle | 1 | 13 owner/migration failures exposed obsolete modal/DnD expectations and were repaired inside the approved owners. |
| Second focused cycle | 1 | Three failures identified pending-focus and full-target test/owner mismatches; the minimum owner behavior was corrected. |
| Third review cycle | 0 after repair | Review removed the dead modal owner and kept pending Confirm focus stable. The then-current focused/full gate passed, but its input was later invalidated by `P28-05`. |
| `P28-05` fourth-cycle RED | 1 | The exact mounted Explorer regression failed after the initial five RAF callbacks were exhausted and the authoritative typed card rendered later; focus remained on `body`. |
| `P28-05` targeted GREEN | 0 | The delayed-render regression passed after the render-driven typed-identity one-shot focus repair. |
| Final sole-session High-risk review | 0 findings | Re-read all nine product/test owners for release-only DnD, exact snapshot/command identity, lock lifetime, duplicate/competing no-write behavior, stale/full/search/focus lifecycle, and reconciliation. No Critical, Important, or Minor finding remains. |

The fourth cycle was performed only after the user's explicit approval of the
durable `P28-05` evidence and exact minimum hypothesis. It changed only the
existing Explorer owner/test and introduced no copy, visual, data,
persistence, policy, lifecycle, or future-task decision.

## Latest-Input Verification

No prior Task 151 gate or pre-`P28-05` Task 152 result was reused.

| Command/check | Exit | Actual result / elapsed |
| --- | ---: | --- |
| Focused five-owner gate | 0 | 5 files / 182 tests passed; `real 2.41s`. |
| `pnpm test` | 0 | 98 files / 1075 tests passed; `real 23.51s`. |
| `pnpm lint` | 0 | 0 errors and 11 unchanged warnings outside Task 152 ownership; `real 6.47s`. |
| `pnpm typecheck` | 0 | `tsc --noEmit` passed; `real 1.35s`. |
| `pnpm build` | 0 | Next.js 16.2.1 compiled, typechecked, and generated all seven routes; `real 10.05s`. |
| `git diff --check` | 0 | Product/test input and final staged implementation diff passed. |

The serial full gate's directly measured command wall time totals `41.38s`.
Runtime token/accounting was not provided: `not measured`.

## Exact Relevant Input Fingerprint

The latest successful focused/full evidence is anchored at implementation
commit `7ba936147722e1e8ebb4a3fb6b9bceed9a65ca88`, complete `src` tree
`8247077665a212e575faad44f20046de623b7306`, unchanged Adapter blob
`ab4f7c765c1b27e48c7a46b9084ce6cc0a4af60e`, and unchanged command-catalog
blob `2063146db0b8920dc8ee5805001e1541da49c2a0`.

The Task 152 relevant-input manifest is the following fixed-order list of
SHA-256 file-content lines in `/sbin/sha256sum` format, including each final
LF:

```text
e9fa9db55043a96e79cc2799d9819934ed467fc3e5a9d63c0dd594afaf4266a9  src/hooks/use-triage-placement.ts
1cbd6cf0c3466e007167170efab24885a149173841bec4dc2b37ba31f36f3708  src/hooks/use-triage-placement.test.tsx
03eee0d1f46239cdd5f7a221162542ac65145b4cf0cb4d97fd30e8f079ed2973  src/hooks/use-dnd.ts
edebbc33e324749e2e0e28a2e5adb7fa4aa461fca8dda7e6eb44d817ac3d13c6  src/hooks/use-triage-dnd.test.ts
c7d23081ea4f976a91813f28790b0075b997b89ec77c93a652e7615991f09b6d  src/hooks/use-triage-operation-lock.test.tsx
2e2f28ad68e80131a44be94dd338c139c86b9692d432b85850f72c45c145e971  src/components/triage/hierarchy-explorer.tsx
03ce56886f7f76321ec90114eb2f112071f06c60bb1da6ca80f00d8c5e246e5e  src/components/triage/hierarchy-explorer.test.tsx
e33425b747c9313b56d3eb8f9fed568012d165f739d49145cb439d5cb296fc7f  src/components/triage/triage-workspace.tsx
a23330e811be079523e4ac50fedd23465b98b75dd71dea74f8c6b7e2906771be  src/components/triage/triage-workspace.test.tsx
```

The SHA-256 of that exact manifest is
`424a4e6436a5de33ef2f033293129c172660b0769fda68d419cd64894f4e2db2`.
This supersedes the non-durable pre-repair fingerprint. Evidence reuse requires
the implementation commit/tree, all nine manifest lines, command identity,
build/config inputs, and environment requirements to remain unchanged.

## Browser Modality And Ownership

Browser evidence was not run. The newly changed invariant is directly proven
by the mounted Explorer owner: after the former five-frame window is exhausted,
an authoritative rerender adds the exact typed card and focus moves to that
actual DOM card. Existing mounted Workspace/Explorer tests also directly prove
pre-dispatch source/fallback focus, pending Escape suppression, Search close,
full Confirm disabling, and successful identity projection. No browser-only or
computed-style claim was made.

The implementation commit changes exactly the nine approved product/test
paths. Checkpoint documentation changes exactly three paths:
`docs/issues/Issues_Phase_28.md`, this evidence record, and
`docs/verification/inbox-triage/phase-28-workflow-pilot-audit.md`. Four bounded
repair cycles were used; the fourth resolved `P28-05` under explicit user
approval. Canonical impact is `None`. Task 152 remains `[ ]`, Tasks 153–154 are
unstarted, and no push, publication, integration sync, or cleanup occurred.
