# Inbox/Triage Rendered Fidelity — Task 164 Stage A

## Checkpoint status

- Iteration: `T164-CA-I01`, first canonical Stage A implementation.
- Scope: Neumorphism and Retro Mac only; all nine canonical Inbox/Triage recipes.
- User disposition: `Rejected`; functional, accessibility, and state-preservation results acknowledged, actual Neumorphism/Retro Mac fidelity rejected.
- Working session: `phase-31-task-164-stage-a-run-task-01`, `closed/archive-only`.
- Task markers: Task 164 remains `[ ]`; Task 165 remains `[ ]` and unstarted.
- Start: HEAD `68ea320ed1c12e2edf6d9dd671ac87c48fb13769`, tree `98a4a05edb0caa5f8da14c2bf71959442a213682`.
- Implementation: commit `904589737bf0d02a1dee58805f60c82d1eda688f`,
  tree `cd713a9380fd334029d42679e84d83c34c0193d7`, exact durable-start
  parent and pinned message verified; no user acceptance is inferred.

The checkpoint implementation attempted to promote the pinned theme grammar
without replacing canonical behavior. Its functional and accessibility
coverage is preserved as historical evidence, but the user's actual-screen
review supersedes the implementer fidelity conclusion below.

## Post-checkpoint user disposition

`T164-CA-I01` is rejected and preserved as the second implementation
experiment, distinct from `T164-NC-I01`. It is not accepted, repair-authorized,
or eligible as a code/byte source for a third attempt.

Improved in this experiment:

- The first experiment findings became explicit starting inputs.
- Save/Cancel, attached Add status, non-occluding Placement, Level 3, and Newly/Undo preservation decisions became explicit.
- CSS and selected component-local visual-role bindings expanded.
- Light/dark, 1024/1920, hover, focus, DnD, Placement, Edit, Add, Newly/Undo, and Archive evidence expanded.
- Fixture isolation, production-build capture, touch-target checks, and reduced-motion checks improved.
- 704 artifacts and append-only run history were durably preserved.

Why visual fidelity still failed:

1. Known surface gaps were not converted into element-to-element implementation obligations.
2. The implementation remained weighted toward global theme CSS over the existing generic component tree.
3. Core composition owners such as `triage-workspace.tsx`, `scratch-pool.tsx`, and `breakdown-panel.tsx` did not change.
4. Prototype and production comparisons did not match data, state, and viewport.
5. Direct comparison was effectively limited to four light/base-centered sheets.
6. The 200 PNGs and interaction measurements prove coverage, function, and accessibility—not prototype fidelity.
7. Direct-render tests prove semantic attributes/state presence, not computed visual similarity.
8. The checkpoint claim that no material difference was hidden by automation contradicted the user's actual-screen review and the comparison images.
9. Automated verification and implementer self-review cannot replace user-owned visual acceptance.

### User-observed theme gaps

| Surface | Neumorphism gap | Retro Mac gap |
| --- | --- | --- |
| Shell/section | Soft shadow exists, but raised-panel hierarchy and circular section identity are insufficient. | Stripes and hard borders exist, but nested Mac windows, title bands, and pane hierarchy are insufficient. |
| Scratch Pool | Raised rows, inset search, count capsule, segmented ASC/DESC, and circular controls are not reproduced. | Selected-row text visibility is defective; FIND/list header, OLD FIRST, and window hierarchy are not reproduced. |
| Context | Source/status marker, circular Edit/action hierarchy, and sufficient inset depth are missing. | File-properties window, title strip, folder/reference block, and metadata composition are missing. |
| Breakdown | Raised row objects, circular grip/actions, and circular Add composition are insufficient. | A wide generic list remains instead of compact 1-bit row controls. |
| Staging | Inset wells and raised Node/compact Bit composition are insufficient. | Large empty panes and generic cards remain instead of Finder folder/document grammar. |
| Explorer | Large square Node cards and generic columns remain instead of the compact soft-row hierarchy. | Modern square/cube cards remain instead of compact Finder rows. |
| DnD/Placement | Generic bordered regions/forms remain instead of theme-native inset/raised targets and action composition. | Dithered target, system-dialog, and marquee grammar are insufficient. |
| Newly/Undo | A generic badge/status rail remains instead of the colored marker/capsule and integrated raised Undo. | The state remains a separate generic status block instead of integration into a Finder row. |
| Archive | Closest result, but theme-specific archive/check identity and resolved context remain weak. | Double-border system alert and completed-file presentation are insufficient. |

These intentional production differences are preserved and are not visual
failures: Save/Cancel, attached Add status, reliability notifications,
non-occluding Placement, Explorer Level 3, Newly/Undo behavior, omission of the
Retro Mac prototype-only faux global menu, and common Node/Bit-card internal
redesign owned by `P29-01 / D-CARD`.

### Abstract lesson for a possible third attempt

- Proposed identity only: `T164-CA-I02`; not started or prepared.
- Use Neumorphism and Retro Mac only.
- Before code, create a 2-theme × 9-surface element-level conformance map.
- Classify each element as `reproduce`, `preserve-and-blend`, `deferred owner`, or `user decision`.
- Separate prototype-fidelity and production-preservation fixtures.
- Compare crops with identical data, state, and viewport.
- Work as vertical slices: Shell/Pool/Context → Breakdown/Staging → Explorer → interactions.
- Do not advance past a slice before its user visual disposition.
- Use approved semantic visual-structure component owners when CSS is insufficient.
- Automation must not declare visual acceptance or `Resolved`.
- Run dark/responsive/full-interaction matrices only after base composition approval.

This lesson is future post-Phase-31 skill-audit input only. No installed skill,
resolver, shared contract, or workflow test changed.

## Historical checkpoint comparisons

- [Neumorphism prototype ↔ production light](task-164-stage-a-assets/T164-CA-I01-run-10/comparisons/neumorphism-prototype-production-light.png)
- [Retro Mac prototype ↔ production light](task-164-stage-a-assets/T164-CA-I01-run-10/comparisons/retro-mac-prototype-production-light.png)
- [Neumorphism light ↔ dark at 1024](task-164-stage-a-assets/T164-CA-I01-run-10/comparisons/neumorphism-light-dark-1024.png)
- [Retro Mac light ↔ dark at 1024](task-164-stage-a-assets/T164-CA-I01-run-10/comparisons/retro-mac-light-dark-1024.png)
- [Historical run-10 browser manifest](task-164-stage-a-assets/T164-CA-I01-run-10/browser-evidence-manifest.json)
- [Comparison manifest](task-164-stage-a-assets/T164-CA-I01-run-10/comparisons/comparison-manifest.json)
- [Append-only iteration record](task-164-stage-a-assets/T164-CA-I01-iteration-record.json)
- [Complete asset inventory](task-164-stage-a-assets/asset-inventory.sha256)

The prototype is reference evidence, not a pixel-identical oracle. Production intentionally retains the canonical sidebar, current copy/data, sparse audit fixture, Save/Cancel, Add status, Level 3 content, and non-occluding Placement behavior.

## Coverage

| Dimension | Production evidence |
| --- | --- |
| Theme / mode / viewport | Both themes; light/dark; `1024x768` and `1920x1080` |
| Nine recipes | Shell/chrome, Pool, Context, rows/empty, Staging, Explorer, Placement, Newly/Undo, Archive; numbered `1`–`9` in every combination |
| Explorer | Clicked through Home, Level 1, Level 2, and Level 3 in every combination |
| Hover / focus | Physical pointer hover and actual Tab traversal to `:focus-visible` in every combination |
| DnD | Physical source movement, eligible peers, `valid` active drop, `idle-invalid`, and asserted Escape interruption in every combination |
| Placement | Direct and staged in every combination; remains in-column while existing cards stay visible |
| Canonical controls | Dirty Edit then Save/Cancel restoration, Add active/result, Newly/Undo before/active/after, Archive ready/completion in every combination |
| Motion | Two-point drag-token movement of 400.18–1020.80px, interruption assertions, and zero effective reduced-motion transitions in every combination |
| Touch | Five dynamic coarse-pointer scenarios in every combination; 128 interactive instances sampled per combination, including `[role=button]` and `[role=link]`; zero below `44x44` |

Representative states:

- [Neumorphism dark 1024 Level 3](task-164-stage-a-assets/T164-CA-I01-run-10/neumorphism-dark-1024-01-populated-level3.png)
- [Retro Mac direct Placement](task-164-stage-a-assets/T164-CA-I01-run-10/retro-mac-light-1920-04-direct-placement.png)
- [Neumorphism valid DnD](task-164-stage-a-assets/T164-CA-I01-run-10/neumorphism-light-1920-03-dnd-source-eligible-active.png)
- [Retro Mac invalid DnD](task-164-stage-a-assets/T164-CA-I01-run-10/retro-mac-light-1920-05-dnd-invalid.png)
- [Neumorphism staged Placement](task-164-stage-a-assets/T164-CA-I01-run-10/neumorphism-light-1920-06-staged-placement.png)
- [Retro Mac dirty Edit before Cancel](task-164-stage-a-assets/T164-CA-I01-run-10/retro-mac-light-1920-09-edit-cancel-dirty.png)
- [Neumorphism Newly before](task-164-stage-a-assets/T164-CA-I01-run-10/neumorphism-light-1920-12-newly-undo-before.png)
- [Neumorphism Newly/Undo active](task-164-stage-a-assets/T164-CA-I01-run-10/neumorphism-light-1920-12-newly-undo-active.png)
- [Retro Mac Archive completion](task-164-stage-a-assets/T164-CA-I01-run-10/retro-mac-dark-1024-15-archive-completion.png)
- [Neumorphism touch Placement](task-164-stage-a-assets/T164-CA-I01-run-10/neumorphism-dark-1024-18c-touch-placement.png)

## Actual visible findings

1. `New → Resolved`, cause `implementation`: bounded row tracks and normal-flow text prevent Context/Breakdown squeezing at 1024.
2. `New → Resolved`, cause `implementation`: both themes style the actual incompatible `idle-invalid` state with a non-color pattern.
3. `New / Repeated → Resolved`, cause `browser evidence`: final runs clear non-system fixture rows and use the production build.
4. `New → Resolved`, cause `automated verification`: reduced motion is measured by effective property/duration, accounting for Chrome's clamp.
5. `New / Repeated → Resolved`, cause `browser evidence`: runs 03 and 05–08 exposed live-query, operation-lock, selector, settlement, and reload races; run-10 stabilizes and asserts each result.
6. `New → Resolved`, cause `browser evidence`: Cancel begins from a genuinely dirty title. In all eight combinations the dirty image differs, while the post-Cancel selected-title hash equals the saved-title hash.
7. `New → Resolved`, cause `implementation`: shared Node/Bit cards no longer receive Inbox visual-role attributes globally; `HierarchyExplorer` applies them only inside Inbox.

The checkpoint implementer inspection stated that run-10 had no material
difference hidden by automation. The user rejected that conclusion after
actual-screen review; the comparison construction was insufficient to establish
fidelity. Retro Mac's prototype-only faux menu remains intentionally omitted,
and canonical controls remain intentionally preserved.

## Append-only run history

| Run | Result | Distinct evidence |
| --- | --- | --- |
| `run-01` | Insufficient | 58 PNGs; fixture and reduced-motion findings |
| `run-02` | Insufficient | 66 PNGs; `idle-invalid`, Escape, repeated fixture/dev-overlay finding |
| `run-03` | Failed | 29 PNGs; Archive live-query timeout |
| `run-04` | Insufficient | 68 PNGs/four comparisons; production isolation resolved, matrix incomplete |
| `run-05` | Failed | 8 PNGs; Edit/Placement cancellation lock |
| `run-06` | Failed | 8 PNGs; unrelated inline field match |
| `run-07` | Failed | 14 PNGs; Placement/DnD settlement race |
| `run-08` | Failed | 20 PNGs; document replacement/touch reload race |
| `run-09` | Insufficient | Complete state matrix, but ordinary DnD recorded only one token position |
| `run-10` | Mechanically complete; fidelity rejected | 200 PNGs, 40 interaction records, four comparisons, and two-point token movement; all eight combinations |

No prior result was overwritten. The complete inventory excludes only itself
and hashes all 704 retained artifacts. Its SHA-256 is
`f9bb384c308a006030359311b38937715388f4921759d90bbe0c4c30c0bb29da`.
Run-10 browser manifest SHA-256 is
`ae5e63813f9ba9c91212455e006c18c543e423c0d663f594bdbdb4d6b44b30ab`;
comparison manifest SHA-256 is
`fa99d99a26ca0ddc6935b500181bb8fe01dbab85f6e9d79255739c00d99e86f2`.

## Automated verification, separate from browser result

| Check | Fresh result |
| --- | --- |
| Full tests | `101 files / 1,273 tests` passed |
| TypeScript | `pnpm typecheck` passed |
| ESLint | exit `0`; 11 pre-existing warnings and no Stage A warning |
| Production build | `pnpm build` passed; seven routes generated |
| Diff hygiene | `git diff --check` passed |
| Lifecycle resolver | exact receipt/gate/action returned `status=ready`, `contract_ready=true` |

Direct-render tests prove semantic role/state bindings; they do not prove
rendered fidelity. Only the production Chrome assets support visible styling,
focus, geometry, non-occlusion, motion, and touch-size claims.

## Omitted or insufficient evidence

- Runs 01–09 are retained history, not final acceptance evidence.
- There is no physical-device or non-Chrome run; touch uses Chrome coarse-pointer emulation at both approved viewports.
- No fresh repository-fault injection was added. Existing canonical tests remain the source for reliability failure behavior.
- User visual disposition is `Rejected`. Automation does not accept Stage A,
  mark Task 164 `[x]`, or authorize repair or six-theme expansion.

## Lifecycle closure

- `T164-CA-I01`: `Rejected / historical experiment evidence`.
- Working session `phase-31-task-164-stage-a-run-task-01`: `closed/archive-only`.
- Control Tower `phase-31-control-tower`: `active`.
- Duplicate-session count: `0`.
- Task 164: `[ ]`; Task 165: `[ ]`.
- Third attempt and remaining six themes: not started.
- Push, PR, integration, publication, cleanup: none.
- Full gates were not rerun or reused as acceptance evidence because this
  closure changes only ledger/evidence metadata, not product, test, or config
  inputs. Historical gate output remains attributed only to the rejected
  checkpoint.
- Exactly one next legal action: Control Tower prepares fresh isolated
  legality/readiness and an exact user gate for `T164-CA-I02`.

Future skill-improvement hypothesis only: a post-Phase-31 audit could evaluate a standard production-browser fixture reset and append-only capture manifest. No installed skill, resolver, shared workflow contract, or workflow test changed.
