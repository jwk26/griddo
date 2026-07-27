# Inbox/Triage 2-3 to Main — Promotion Map

> Route: `$craft-docs` — Brainstorming Route, visual-prototype intake
> Pass: production-adoption, map-only re-approval pass
> Status: **Proposed**
> Approval: **Pending user decision**
> Selected product authority: `DECISION.md` (`Readiness: code-ready`)
> Frozen repository write boundary: this file only
> Downstream state: existing production canonical documents, recipes, reviews, and Phase 23-33 plan remain unchanged; re-derivation from this candidate has not started

## 1. Gate, Scope, And Frozen Boundary

This map promotes the mature Inbox/Triage topic at
`docs/brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/`.
The authoritative input class is the selected `DECISION.md`, so the selected
Route is the Brainstorming Route. This pass does not reopen the brainstorming
interview and does not infer product behavior from the Design Source.

The downstream target order retained from the hash-pinned Fresh map is:

1. `docs/SCHEMA.md`
2. `docs/SPEC.md`
3. `docs/DESIGN_TOKENS.md`
4. `docs/EXECUTION_PLAN.md`
5. `docs/PLANNING_STANDARD.md`
6. `docs/WORKFLOW.md`

Production base `a3c679cf7ca09559ecc5e1690fd2a3707d40916c` has no project
`AGENTS.md` or Codex workflow adapter. For this map-only pass, the user
explicitly fixed the repository root, base commit, selected topic, output
path, and one-file write boundary. That is sufficient to draft this
co-located candidate without guessing another path. The order above remains
a proposed downstream target order; map approval alone does not authorize
canonical writes or silently onboard missing verification and receipt paths.
The selected topic decision has product authority only inside its declared
Inbox/Triage scope.

### In scope for this map

- The retained four-area Inbox/Triage workspace and the selected decision's
  changed behavior, state, data, accessibility, and lifecycle contracts.
- Current production reality and exact production landing owners.
- The selected eight-route Design Source as visual evidence only.
- Exact future canonical landing regions and a surface-first recipe proposal.
- Superseded current-canonical rules and affected future plan state.
- A consolidated queue for visual authority gaps, phase-local naming, deferred
  work, and non-blocking follow-up.

### Explicit exclusions

- No canonical, recipe, recipe-index, execution-plan, planning-standard,
  workflow, issue-ledger, production-source, test, design-archive, entrypoint,
  adapter, `DECISION.md`, or `NOTES.md` edit.
- No source reuse from prototype route duplication, local mock mutations,
  inline architecture, review controls, or route-specific production design.
- No adoption of Fresh downstream canonical documents, recipes, plans,
  receipts, implementation, expected answers, or oracle material. The only
  Fresh artifact used as transfer authority is the hash-pinned approved map
  content named in §2.
- No server, browser, screenshot, or recording in this pass.
- No branch, commit, publication, merge, tag, release, or other lifecycle
  invocation.

The only allowed repository diff is this `PROMOTION_MAP.md`. Canonical and
recipe diffs remain zero until the user approves a complete map disposition.
This path already contained the production map approved in commit
`1f51ebbe062a057a68b0de98b02b2bb40df99af4` (SHA-256
`9463039827df2a4617f15c805b65278a3e883dc7b0847fe793a13da7c2ac75c6`).
That version remains recoverable from Git. This branch replaces its working-tree
content only with a `Proposed` production re-approval candidate.

## 2. Source Intake And Provenance

### 2.1 Selected-source classification

`User-instructed` below records the user-fixed rationale without inventing
a new rationale.

| Source | Type | Disposition | Allowed scope | Rationale / authority boundary | Provenance actually established |
|---|---|---|---|---|---|
| `$craft-docs` router and its directly selected Brainstorming/visual-intake references | Lifecycle/process authority | Reference-only | Route selection, source classification, map contract, source-only verification labels, and user gate | Governs this pass but supplies no Inbox/Triage product or visual facts | `codex-workflow` commit `b91d2f94f099fb12f430a07882ec843f5552b911`; `skills/craft-docs` tree `6affbf9fef123241e96be8af3886470c97170c03` |
| Hash-pinned Fresh promotion map | Promotion evidence / transfer source | Adopt map semantics only | Obligation index, inventories, reconciliation, constraints, dispositions, landings, VQ queue, canonical targets, and recipe proposal | User selected this artifact as the next production authority candidate; it carries no Fresh downstream receipt or implementation authority | SHA-256 `8780df4bd4dcbdd8ef32224b5c7829c2865e5a9e08cebb8e952de66809f288d3` |
| Prior production `PROMOTION_MAP.md` | Superseded-candidate baseline | Reference-only | Recovery and semantic-delta comparison only | Remains prior approved history until this candidate receives production user approval | Commit `1f51ebbe062a057a68b0de98b02b2bb40df99af4`; blob `a4cdbc34d097337f6c6a143bc024e06dd930fa17`; SHA-256 `9463039827df2a4617f15c805b65278a3e883dc7b0847fe793a13da7c2ac75c6` |
| `package.json` | Command registry | Reference-only | Declared build/test/lint/typecheck/development commands | Command source only; no documentation-specific check is declared | Current repository source |
| Selected `DECISION.md` | Product Decision | Adopt | Product behavior, structure, lifecycle, prohibitions, deferrals, architecture boundaries, recipe organization | User-instructed; authoritative within topic scope | Production blob `627b1ca22b3e91dca9ef70f36fa95e4dc4ad0429`; last authority commit `40764c233070d591f500d5b9e059cb186cc5c07e` |
| Selected `NOTES.md` | Supporting / recovery context | Reference-only | Audit context, source comparison, discarded prototype mechanics, and recovery history | Notes-only or historical claims are not promotable | Production blob `d8abd83c83eb72a3280438b2eeb00770fe8069fd`; last file commit `0467a3ca444aa314519d1b0f6ed0b16daf62decb` |
| Current repository production source | Functional Source | Adopt | Implementation reality, retained production behavior, tempting adjacent capabilities, and landing owners | User-instructed; does not override the selected decision | Base `a3c679cf7ca09559ecc5e1690fd2a3707d40916c`; tree `e5b8b61035ad2f1cafbb39178574c67508f6bd78`; `src` tree `11e9c0f7ca226fdeee59a23ef164d3baa6823294`; clean before this map write |
| `docs/SCHEMA.md` | Canonical baseline | Adopt | Existing data contracts and downstream amendment target | Existing authority; not a source of new product intent | Current repository source |
| `docs/SPEC.md` | Canonical baseline | Adopt | Existing behavior/architecture and downstream amendment target | Existing authority; superseded only where the selected decision says so | Current repository source |
| `docs/DESIGN_TOKENS.md` | Canonical baseline | Adopt | Existing token/surface contract and downstream amendment target | Existing authority; not a substitute for missing direct visual evidence | Current repository source |
| `docs/EXECUTION_PLAN.md` | Canonical baseline | Reference-only in this pass | Existing open Phase 23-33 / Tasks 101-154 and future re-derivation target | Map-only pass; no task acceptance or implementation authority is imported from Fresh | Production blob `1e882ca7b5e33236f5288c5352ad5702445331a2` at base `a3c679c` |
| `docs/PLANNING_STANDARD.md` | Canonical process baseline | Reference-only in this pass | Future planning/conformance landing | Map-only pass | Current repository source |
| `docs/WORKFLOW.md` | Process authority | Reference-only | Topic promotion and durable process rules | No workflow amendment is currently indicated | Current repository source |
| Eight selected prototype routes | Design Source | Adopt visual / Reference-only behavior / Skip implementation | Theme realization, composition, affordance treatment, supported state appearance, and corroborating interaction sequences | User-instructed; never product or production-architecture authority | Clean design repository commit `4f39709688ceb4cac5e15d4e3502186b1f1c801b`, tree `7b8eb8766a9b57fe2174a948de09cfb7646cf7de`; route blobs in §2.3 |
| Design Source `src/app/themes.css` | Design Source | Adopt visual | Shared source-only theme values that apply to selected routes | Visual evidence only | Blob `9ba3c9032d953a310cc9f763363d492e0cf28819` at design commit `4f39709` |
| Design Source `src/components/layout/color-theme-provider.tsx` | Functional/visual support source | Reference-only | Evidence that source routes apply a shared theme attribute | Prototype runtime mechanic, not a production landing | Blob `df285dd48874f114ef9256603ace461e8180bbb8` at design commit `4f39709` |

### 2.2 Production identity and Fresh semantic equivalence

The production evidence and transfer artifact were checked independently:

- **Production base:** commit `a3c679cf7ca09559ecc5e1690fd2a3707d40916c`
  resolves locally with tree `e5b8b610...` and `src` tree `11e9c0f7...`.
- **Exact semantic-input match:** production `DECISION.md`, `NOTES.md`, and
  `src` resolve to the same blobs/trees used by the Fresh map:
  `627b1ca2...`, `d8abd83c...`, and `11e9c0f7...`. The approved obligation,
  production-inventory, and citation semantics therefore transfer without
  reinterpretation against a changed product or code baseline.
- **Exact transfer artifact:** the only Fresh content authority is the
  1157-line map with SHA-256 `8780df4b...`. Fresh SCHEMA, SPEC,
  DESIGN_TOKENS, recipes, planning, receipts, and Task 101 code are excluded.
- **Design Source:** the clean live repository resolves commit `4f397096...`,
  tree `7b8eb876...`, and the same selected route/shared-source blobs used by
  the Fresh map.
- **Prior production state:** the previous approved map and its downstream
  canonical/recipe/plan artifacts exist at base `a3c679c`; this candidate
  changes none of those downstream files.

### 2.3 Design Source Git identity

| Theme | Route | Selected source path | Verified blob at `4f39709` |
|---|---|---|---|
| GridDO | `/prototype/inbox-triage-griddo` | `src/app/prototype/inbox-triage-griddo/page.tsx` | `d5003b22c4b78b611492815a11dfe6fd12985dbe` |
| Tiny Desk | `/prototype/inbox-triage-tiny-desk` | `src/app/prototype/inbox-triage-tiny-desk/page.tsx` | `3c30cf3d209bbaf0ecf046c168cd9f467cf6a491` |
| Neumorphism | `/prototype/inbox-triage-neumorphism` | `src/app/prototype/inbox-triage-neumorphism/page.tsx` | `a1de178bff660bbdc4538d30ba7946ce8e7cb6d3` |
| Claymorphism | `/prototype/inbox-triage-claymorphism` | `src/app/prototype/inbox-triage-claymorphism/page.tsx` | `48335414d2c44c9c6f6ded97d5945da09697900d` |
| Origami | `/prototype/inbox-triage-origami` | `src/app/prototype/inbox-triage-origami/page.tsx` | `2282ada7f060d1333b1dbe60eacf696840d428ce` |
| Terminal | `/prototype/inbox-triage-terminal` | `src/app/prototype/inbox-triage-terminal/page.tsx` | `8615fc799ef584c8a41d4fe2e76d897b131065f5` |
| Retro Mac | `/prototype/inbox-triage-retro-mac` | `src/app/prototype/inbox-triage-retro-mac/page.tsx` | `efe3448e9a8ad4596a72e5f60887232de2c7ad89` |
| Graphite | `/prototype/inbox-triage-graphite` | `src/app/prototype/inbox-triage-graphite/page.tsx` | `ecd38e448539d0ee72688239ad5e9f0451cd30be` |

`NOTES.md:69-76` records a historical 1600×1000 topic-author render audit.
No render, screenshot, or viewport fidelity check was performed in this
production-adoption pass, and that historical audit is not upgraded to new
rendered evidence here.

## 3. Production Landing Registry

Every adopted obligation below resolves to one or more of these owners. A row
whose required owner does not exist uses the mandated phrase exactly.

| Landing ID | Production landing and placement rationale |
|---|---|
| `LAND-SCHEMA-VERSION` | `docs/SCHEMA.md` → `bits` (Scratch title concurrency) and `scratchBreakdowns` (row concurrency), Zod schemas, indexes/migrations, and key mutations; production files `src/lib/db/schema.ts`, `src/lib/db/datastore.ts`, `src/lib/db/indexeddb.ts`. Current monotonic version fields are absent: **target absent — structural prerequisite required**. |
| `LAND-SCHEMA-CANDIDATE` | `docs/SCHEMA.md` → a Scratch-scoped staged-candidate entity, lifecycle/version fields, unique `sourceBreakdownId`, orphan cleanup/audit ownership, Zod/migration/query sections; repository/DataStore and a reactive hook. The current entity/store is absent: **target absent — structural prerequisite required**. |
| `LAND-SCHEMA-OP` | `docs/SCHEMA.md` → idempotency/operation-result lookup and atomic mutation contracts for add/edit/delete/stage/unstage/place/undo/archive. The exact durable receipt/journal shape is not present: **target absent — structural prerequisite required**. |
| `LAND-SESSION` | `src/stores/triage-store.ts` split by lifetime: app-session selection/pool/query/path state, page-session newly-placed/Undo state, and device-local sort preferences. Persist only the two selected sort preferences across reload; do not persist session selection, drafts, placement UI, or page-session markers. |
| `LAND-POOL` | `src/components/triage/scratch-pool.tsx`, `src/hooks/use-inbox.ts`, and `LAND-SESSION`; owns selection, expanded/collapsed tools/list, search/sort/count, external removal transition, and focus restoration. |
| `LAND-BREAKDOWN` | `src/components/triage/breakdown-panel.tsx`, `src/hooks/use-scratch-breakdowns.ts`, `LAND-SCHEMA-VERSION`, and `LAND-SCHEMA-OP`; owns signature Context, rows, add/edit/delete, local blockers, empty/completion presentation, and focus. |
| `LAND-STAGING` | `src/components/triage/staging-zone.tsx`, a new reactive candidate hook/repository backed by `LAND-SCHEMA-CANDIDATE`, and `src/components/triage/triage-drag-token.tsx`; owns durable candidates, Node/Bit subsections, pending states, arrival indicators, unstage targets, and feedback. |
| `LAND-EXPLORER` | `src/components/triage/hierarchy-explorer.tsx` plus a dedicated Explorer query/hook/result panel. The current full-hierarchy query/result owner is absent: **target absent — structural prerequisite required**. Do not extend global `useSearch()`/`searchAll()`. |
| `LAND-PLACEMENT` | `src/hooks/use-dnd.ts` triage responsibility must be decomposed into direct-type selection, optional staged Result Title, target-column placement state, and atomic repository commands; `src/components/triage/triage-workspace.tsx` coordinates without owning persistence. New decomposed owners are absent: **target absent — structural prerequisite required**. |
| `LAND-NEWLY` | A page-session owner under the triage domain plus actual `NodeCard`/`BitCard` projections inside `HierarchyExplorer`; source-aware Undo calls one atomic repository command. The page-session operation/dependency owner is absent: **target absent — structural prerequisite required**. |
| `LAND-ARCHIVE` | `src/hooks/use-can-archive-scratch.ts`, `src/hooks/use-archive-scratch.ts`, `BreakdownPanel`, the archive transaction in `LAND-SCHEMA-OP`, and existing Archive View restore behavior. |
| `LAND-THEME` | `src/components/triage/triage-workspace.tsx`, theme-aware triage components, shared semantic state attributes/tokens in `src/app/globals.css`, `docs/DESIGN_TOKENS.md`, and surface-first recipes. No route duplication or component branch on theme ID. |
| `LAND-COPY` | Core English user-facing strings move behind an Inbox/Triage copy/resource boundary during core promotion. The resource boundary is absent: **target absent — structural prerequisite required**. Shared locale provider/resources/toggle remain deferred. |
| `LAND-A11Y` | Existing Radix primitives, component focus owners, live regions/statuses, reduced-motion CSS, pointer sensors, and explicit future accessibility scope. No keyboard-placement command is added in this promotion. |

## 4. Selected-Decision Obligation Coverage Index

Each line is intended to be independently verifiable. `Reconcile` IDs link to
the bilateral matrix in §8; negative obligations also link to §9.

### 4.1 Authority, boundary, shell, and theme

| ID | Atomic obligation | Exact authority | Discharge |
|---|---|---|---|
| `OB-F01` | Preserve the four-area workspace. | `DECISION.md:31-33`, `94-96` | `R-SHELL`, `LAND-THEME` |
| `OB-F02` | Preserve main-work vertical `60/40`. | `DECISION.md:94-96` | `R-SHELL`, `LAND-THEME` |
| `OB-F03` | Preserve Breakdown/Staging horizontal `60/40`. | `DECISION.md:94-96` | `R-SHELL`, `LAND-THEME` |
| `OB-F04` | Preserve Staging Node/Bit `35/65`. | `DECISION.md:94-96` | `R-STAGE`, `LAND-STAGING` |
| `OB-F05` | Do not redesign the whole panel merely to add selected features. | `DECISION.md:97-98` | `NEG-02`, `LAND-THEME` |
| `OB-F06` | Restore visible Scratch Pool, Breakdown, Staging, and Grid section identity/chrome. | `DECISION.md:100-105` | `R-CHROME`, `LAND-THEME` |
| `OB-F07` | Use `Grid Explorer` as the semantic/default name. | `DECISION.md:106-110` | `R-CHROME`, `LAND-EXPLORER` |
| `OB-F08` | Use `Library Index`, `Finder`, and `GRID EXPLORER` only for the selected Tiny Desk, Retro Mac, and Terminal realizations. | `DECISION.md:106-110` | `R-CHROME`, `LAND-THEME` |
| `OB-F09` | Do not expose abbreviated `L1/L2/L3/Home-L3/H1-L3` copy. | `DECISION.md:110-111` | `NEG-03`, `LAND-EXPLORER` |
| `OB-F10` | Retain wheel, trackpad/touch, and keyboard scrolling while hiding scrollbar chrome on the five named list/column regions. | `DECISION.md:113-121` | `R-SCROLL`, `LAND-POOL`, `LAND-BREAKDOWN`, `LAND-STAGING`, `LAND-EXPLORER` |
| `OB-F11` | Share one information/interaction contract across all eight themes. | `DECISION.md:123-129` | `R-THEME`, `LAND-THEME` |
| `OB-F12` | Realize surface, type, border, radius, shadow, texture, control, and motion in each theme's language. | `DECISION.md:125-127` | `R-THEME`, `LAND-THEME` |
| `OB-F13` | Keep selected, staged, invalid, pending-confirmation, newly placed, and completed meanings visually distinct. | `DECISION.md:128-129` | `R-STATE`, `LAND-THEME` |
| `OB-F14` | Do not use repeated blink/flicker for newly placed state. | `DECISION.md:130` | `NEG-11`, `LAND-THEME` |
| `OB-F15` | Treat theme/locale switching as presentation, not navigation, cancel, save, or a new session. | `DECISION.md:132-140` | `R-PRESENTATION`, `LAND-SESSION` |
| `OB-F16` | Preserve every enumerated Inbox transient/pending state and operation ID across theme/locale switching. | `DECISION.md:136-146` | `R-PRESENTATION`, `LAND-SESSION`, `LAND-SCHEMA-OP` |
| `OB-F17` | Do not translate user-authored content or drafts during locale switching. | `DECISION.md:139-140` | `R-PRESENTATION`, `LAND-COPY` |
| `OB-F18` | A theme/locale toggle must not trigger valid-blur auto-save; focus remains on the activated toggle. | `DECISION.md:141-143` | `R-PRESENTATION`, `LAND-BREAKDOWN`, `LAND-A11Y` |

### 4.2 Scratch Pool

| ID | Atomic obligation | Exact authority | Discharge |
|---|---|---|---|
| `OB-P01` | Restore the last still-active Scratch on same-app-session route re-entry. | `DECISION.md:150-153` | `R-POOL-SELECT`, `LAND-SESSION` |
| `OB-P02` | On first entry or invalid prior selection, select the first active Scratch in current Pool sort order. | `DECISION.md:153-156` | `R-POOL-SELECT`, `LAND-POOL` |
| `OB-P03` | Do not select a hidden search-filter mismatch as fallback. | `DECISION.md:157-159` | `R-POOL-SELECT`, `LAND-POOL` |
| `OB-P04` | With no active Scratch, keep selection `null` and show Inbox empty state. | `DECISION.md:160` | `R-POOL-SELECT`, `LAND-POOL` |
| `OB-P05` | Automatic selection changes data context without stealing focus. | `DECISION.md:161-162` | `R-POOL-SELECT`, `LAND-A11Y` |
| `OB-P06` | Do not persist selected Scratch in a record, localStorage, IndexedDB, or remote DB; reload starts from fallback. | `DECISION.md:163-165` | `R-POOL-SELECT`, `LAND-SESSION`, `NEG-17` |
| `OB-P07` | An externally archived/deleted selected Scratch blocks stale editing and opens lifecycle-specific transition UI. | `DECISION.md:169-178` | `R-POOL-EXTERNAL`, `LAND-POOL` |
| `OB-P08` | External-removal transition offers a five-second countdown, move-now, pause/resume, and no Cancel back to stale content. | `DECISION.md:179-188` | `R-POOL-EXTERNAL`, `LAND-POOL`, `VQ-01` |
| `OB-P09` | Unsaved Add/Edit text starts external-removal countdown paused and offers full source-separated copy. | `DECISION.md:189-199` | `R-POOL-EXTERNAL`, `LAND-POOL`, `VQ-01` |
| `OB-P10` | Copy feedback is non-blocking and copying never resumes countdown or persists drafts. | `DECISION.md:193-199` | `R-POOL-EXTERNAL`, `LAND-A11Y`, `NEG-17` |
| `OB-P11` | External archive restore cancels transition and retains client-memory drafts; hard delete never uses that restoration shortcut. | `DECISION.md:200-204` | `R-POOL-EXTERNAL`, `LAND-POOL` |
| `OB-P12` | Recompute a changed destination from latest visible Pool order and revalidate immediately before moving. | `DECISION.md:205-210` | `R-POOL-EXTERNAL`, `LAND-POOL` |
| `OB-P13` | Expanded Pool is a cohesive tools region above a Scratch list; search and sort share one row. | `DECISION.md:212-217` | `R-POOL-STRUCT`, `LAND-POOL` |
| `OB-P14` | Header/collapsed count always means all active Scratches; filtered count is separate and appears only during search. | `DECISION.md:218-222` | `R-POOL-STRUCT`, `LAND-POOL` |
| `OB-P15` | Pool sort is created-at newest/oldest and exposes current direction. | `DECISION.md:223-226` | `R-POOL-STRUCT`, `LAND-SESSION` |
| `OB-P16` | Keep title and created-at metadata on Scratch rows. | `DECISION.md:227-228` | `R-POOL-STRUCT`, `LAND-POOL` |
| `OB-P17` | Collapsed controls are vertical in identity/count → toggle → switcher order. | `DECISION.md:230-236` | `R-POOL-COLLAPSED`, `LAND-POOL` |
| `OB-P18` | Every compact Scratch switcher has an accessible name and selected state has non-color-only distinction. | `DECISION.md:237-239` | `R-POOL-COLLAPSED`, `LAND-A11Y` |
| `OB-P19` | Collapsed Pool shows neither search nor sort and applies no hidden query to switchers/count. | `DECISION.md:240-243` | `R-POOL-COLLAPSED`, `LAND-POOL` |
| `OB-P20` | Selection or mere Breakdown focus never auto-collapses; first printable Breakdown key does. | `DECISION.md:245-248` | `R-POOL-COLLAPSE`, `LAND-BREAKDOWN` |
| `OB-P21` | Manual re-expand suppresses repeated auto-collapse for that Scratch session and resets on Scratch change. | `DECISION.md:249-255` | `R-POOL-COLLAPSE`, `LAND-SESSION` |
| `OB-P22` | Expanded/collapsed state survives same-app-session route re-entry but resets expanded on reload/new session. | `DECISION.md:251-258` | `R-POOL-COLLAPSE`, `LAND-SESSION` |
| `OB-P23` | Collapse preserves Pool query/result/scroll context; expand retains focus on its toggle. | `DECISION.md:259-263` | `R-POOL-COLLAPSE`, `LAND-SESSION`, `LAND-A11Y` |
| `OB-P24` | Remove the prototype fold lock and do not replace it with a preference. | `DECISION.md:264-265` | `NEG-05`, `LAND-POOL` |
| `OB-P25` | Pool query/result/scroll survive same-app-session route re-entry and recompute against current data. | `DECISION.md:267-273` | `R-POOL-SEARCH`, `LAND-SESSION` |
| `OB-P26` | Keep a selected Scratch hidden by the restored query and show concise hidden-selection status. | `DECISION.md:274-276` | `R-POOL-SEARCH`, `LAND-POOL` |
| `OB-P27` | Reset Pool search/scroll on reload/new session; never persist it to content/local/remote storage. | `DECISION.md:277-278` | `R-POOL-SEARCH`, `LAND-SESSION`, `NEG-17` |

### 4.3 Breakdown context, rows, add, edit, and delete

| ID | Atomic obligation | Exact authority | Discharge |
|---|---|---|---|
| `OB-B01` | Selected Scratch Context is a standalone signature section above rows, not heading metadata or a row-like strip. | `DECISION.md:282-288` | `R-CONTEXT`, `LAND-BREAKDOWN` |
| `OB-B02` | Context targets roughly `2–2.5×` row height without breaking section ratios. | `DECISION.md:287-288` | `R-CONTEXT`, `LAND-THEME` |
| `OB-B03` | Context contains title, creation date/time, always-visible Scratch Edit, and Breakdown sort. | `DECISION.md:289-295` | `R-CONTEXT`, `LAND-BREAKDOWN` |
| `OB-B04` | Remove duplicate selected title/meta from the Breakdown heading. | `DECISION.md:294` | `R-CONTEXT`, `LAND-BREAKDOWN` |
| `OB-B05` | Context changes to theme-specific `Scratch complete` presentation only in completion state. | `DECISION.md:296` | `R-ARCHIVE-CANCEL`, `LAND-BREAKDOWN` |
| `OB-B06` | Breakdown rows show neither numbering nor date/time text. | `DECISION.md:298-300` | `R-ROW`, `LAND-BREAKDOWN` |
| `OB-B07` | Row drag remains grip-only. | `DECISION.md:301` | `R-ROW`, `LAND-BREAKDOWN` |
| `OB-B08` | Row Edit and Trash remain visible without hover. | `DECISION.md:302` | `R-ROW`, `LAND-BREAKDOWN` |
| `OB-B09` | Context sort orders by internal `createdAt`, default DESC, with `order` then stable `id` tie-breakers. | `DECISION.md:303-308` | `R-ROW-SORT`, `LAND-SESSION` |
| `OB-B10` | Pool and Breakdown sorts are independent device-local preferences shared across Scratches and preserved across reload. | `DECISION.md:309-313` | `R-ROW-SORT`, `LAND-SESSION` |
| `OB-B11` | Sort preferences never enter Scratch/row content or future BaaS data. | `DECISION.md:309-313` | `R-ROW-SORT`, `NEG-17` |
| `OB-B12` | Add supports Enter and an explicit control and retains focus for rapid entry. | `DECISION.md:314-317` | `R-ADD`, `LAND-BREAKDOWN` |
| `OB-B13` | Successful Add scrolls only the internal row list to the new row based on current sort. | `DECISION.md:316-317` | `R-ADD`, `LAND-BREAKDOWN` |
| `OB-B14` | Successful Add/Unstage uses one short theme-specific, non-repeating signal plus polite announcement. | `DECISION.md:318-324`, `674-676` | `R-ADD`, `LAND-THEME`, `VQ-02` |
| `OB-B15` | Reduced motion removes movement/sparkle while preserving a static state distinction. | `DECISION.md:322-324` | `R-ADD`, `LAND-A11Y`, `VQ-02` |
| `OB-B16` | Add failure retains draft/focus and emits no success scroll/signal. | `DECISION.md:325` | `R-ADD`, `LAND-BREAKDOWN` |
| `OB-B17` | Add is one idempotent snapshotted operation; pending locks input/Add and suppresses duplicate Enter/Add/blur. | `DECISION.md:326-328`, `352-361` | `R-ADD-RELIABILITY`, `LAND-SCHEMA-OP` |
| `OB-B18` | Blur never creates or discards a new Breakdown row; only Enter or explicit Add creates it. | `DECISION.md:329-333` | `R-ADD`, `NEG-09` |
| `OB-B19` | Add draft coexists independently with same-Scratch work and inline Edit. | `DECISION.md:334-341` | `R-DRAFT`, `LAND-SESSION` |
| `OB-B20` | Scratch/route departure with Add draft asks continue-writing versus discard-and-move. | `DECISION.md:342-349` | `R-DRAFT`, `LAND-BREAKDOWN`, `VQ-03` |
| `OB-B21` | If both drafts exist, inline Save resolves before the Add-draft departure decision; no intent queue accumulates. | `DECISION.md:345-349` | `R-DRAFT`, `LAND-BREAKDOWN` |
| `OB-B22` | Reload/tab close with Add draft uses native unload confirmation and no durable draft recovery. | `DECISION.md:350-351` | `R-DRAFT`, `NEG-17` |
| `OB-B23` | Dexie Add atomically verifies Scratch lifecycle, computes order, and creates; BaaS later preserves idempotency. | `DECISION.md:352-361` | `R-ADD-RELIABILITY`, `LAND-SCHEMA-OP` |
| `OB-E01` | Scratch Context Edit changes title only; row Edit changes content only. | `DECISION.md:363-367` | `R-EDIT`, `LAND-BREAKDOWN` |
| `OB-E02` | Both editors are inline in their source surfaces, never copied prototype buttons or a generic dialog. | `DECISION.md:368-369` | `R-EDIT`, `NEG-14`, `VQ-04` |
| `OB-E03` | Save persists; Cancel/Escape restores; valid blur saves; empty stays in validation; unchanged exits without write. | `DECISION.md:370-373` | `R-EDIT`, `LAND-BREAKDOWN` |
| `OB-E04` | Pending Save retains editor/draft, exposes saving, locks conflicting controls, and closes only after confirmed success. | `DECISION.md:374-383` | `R-EDIT-RELIABILITY`, `LAND-SCHEMA-OP`, `VQ-04` |
| `OB-E05` | Timeout/reconnection reconciles latest record/version before success, Retry, or conflict; never blind-resends. | `DECISION.md:378-389` | `R-EDIT-RELIABILITY`, `LAND-SCHEMA-VERSION`, `LAND-SCHEMA-OP` |
| `OB-E06` | Scratch switch, another Edit, Archive, and route departure are save-before-action with at most one visible pending intent. | `DECISION.md:390-397` | `R-EDIT-INTENT`, `LAND-BREAKDOWN` |
| `OB-E07` | Editing disables that row's DnD/Trash; deleting another row first resolves the active editor. | `DECISION.md:398-403` | `R-EDIT`, `LAND-BREAKDOWN` |
| `OB-E08` | Staged rows cannot edit; unstage first. Archive overlay blocks Scratch Edit, while cancelled complete Context permits it. | `DECISION.md:404-406` | `R-EDIT`, `LAND-BREAKDOWN`, `LAND-STAGING` |
| `OB-E09` | Duplicate Scratch titles remain valid and Pool filtering stays strict after title change. | `DECISION.md:407-410` | `R-EDIT`, `LAND-POOL` |
| `OB-E10` | Scratch and row edits use optimistic concurrency, a client-memory base snapshot, and monotonic persisted version. | `DECISION.md:412-420` | `R-CONCURRENCY`, `LAND-SCHEMA-VERSION` |
| `OB-E11` | Conditional save detects conflict and offers inline `use mine`/`use latest`; no last-write-wins overwrite. | `DECISION.md:421-435` | `R-CONCURRENCY`, `LAND-BREAKDOWN`, `VQ-04` |
| `OB-E12` | Pristine non-IME editors may accept external value; dirty/IME editors protect draft. | `DECISION.md:424-430` | `R-CONCURRENCY`, `LAND-BREAKDOWN` |
| `OB-E13` | External staged/consumed/deleted/archive lifecycle invalidates Save without resurrecting data and preserves draft view/copy. | `DECISION.md:436-443` | `R-CONCURRENCY`, `LAND-BREAKDOWN`, `VQ-04` |
| `OB-E14` | Explicit focus destinations cover editor entry, Save/Cancel, conflict, pending-intent success, invalidated-source removal, and status announcements. | `DECISION.md:444-452` | `R-EDIT-FOCUS`, `LAND-A11Y` |
| `OB-E15` | Dexie and future BaaS preserve compare-and-set semantics; snapshots are not crash recovery. | `DECISION.md:453-458` | `R-CONCURRENCY`, `LAND-SCHEMA-VERSION` |
| `OB-E16` | Dirty/save-pending browser exit uses native beforeunload, with no asynchronous-save assumption or durable recovery. | `DECISION.md:459-465` | `R-EDIT-RELIABILITY`, `NEG-17` |
| `OB-R01` | Active rows permit Edit/Delete/drag. | `DECISION.md:467-470` | `R-ROW-LIFECYCLE`, `LAND-BREAKDOWN` |
| `OB-R02` | Deleting rows stay in place with visible/accessibly conveyed pending state and locked actions. | `DECISION.md:469-482` | `R-ROW-DELETE`, `LAND-BREAKDOWN`, `VQ-05` |
| `OB-R03` | Staged rows remain visible, de-emphasized, disabled, and never struck through. | `DECISION.md:483-484` | `R-ROW-LIFECYCLE`, `LAND-BREAKDOWN` |
| `OB-R04` | Placed/consumed rows leave the active list while durable consumed truth remains. | `DECISION.md:485-486` | `R-ROW-LIFECYCLE`, `LAND-BREAKDOWN` |
| `OB-R05` | Unstage or Undo restores the source row active. | `DECISION.md:487` | `R-ROW-LIFECYCLE`, `LAND-STAGING`, `LAND-NEWLY` |
| `OB-R06` | Delete is idempotent; explicit failure restores Active without a new Retry button; timeout reconciles before removal or resend. | `DECISION.md:489-503` | `R-ROW-DELETE`, `LAND-SCHEMA-OP` |
| `OB-R07` | Delete success/failure/recheck has deterministic focus destinations, including Archive overlay on last-row completion. | `DECISION.md:504-510` | `R-ROW-DELETE`, `LAND-A11Y` |
| `OB-R08` | Distinguish never-had-a-row, all-deleted-without-consumption, and consumed completion empty states. | `DECISION.md:512-519` | `R-EMPTY`, `LAND-BREAKDOWN` |

### 4.4 Staging

| ID | Atomic obligation | Exact authority | Discharge |
|---|---|---|---|
| `OB-S01` | Keep visible Staging and Nodes/Bits subsection labels. | `DECISION.md:523-527` | `R-STAGE`, `LAND-STAGING` |
| `OB-S02` | Node candidates remain grid/cards and Bit candidates remain list/rows, distinguished by shape/information. | `DECISION.md:525-527` | `R-STAGE`, `LAND-STAGING` |
| `OB-S03` | Remove large/repeated empty placeholder cards. | `DECISION.md:528` | `R-STAGE`, `NEG-08` |
| `OB-S04` | Candidates sort by `createdAt` DESC with stable `id`; there is no manual reorder or count cap. | `DECISION.md:529-536` | `R-STAGE-LIST`, `LAND-STAGING` |
| `OB-S05` | Each subsection scrolls independently without changing 35/65 or panel height; scrollbar chrome stays hidden. | `DECISION.md:533-536` | `R-STAGE-LIST`, `LAND-STAGING` |
| `OB-S06` | Local stage scrolls only its subsection to top; remote arrivals preserve scroll and expose a scoped new-item indicator. | `DECISION.md:537-546` | `R-STAGE-REMOTE`, `LAND-STAGING`, `VQ-06` |
| `OB-S07` | `Nodes`/`Bits` labels prefix count only at 2+ and do not conflate total count with remote-arrival count. | `DECISION.md:547-550` | `R-STAGE-LIST`, `LAND-STAGING` |
| `OB-S08` | Staged cards have no primary click/menu; the full root surface is the drag activator. | `DECISION.md:552-558` | `R-STAGE-DRAG`, `LAND-STAGING` |
| `OB-S09` | Remove prototype internal handles and always use the shared compact, pointer-centered, type-specific drag token. | `DECISION.md:556-568` | `R-STAGE-DRAG`, `NEG-06`, `LAND-STAGING` |
| `OB-S10` | Preserve Mouse 8px and Touch 250ms/5px activation; themes may not vary it. | `DECISION.md:564-566` | `R-STAGE-DRAG`, `LAND-A11Y` |
| `OB-S11` | Candidates are Scratch-scoped synchronized domain data in Dexie/future BaaS, surviving route/reload/device. | `DECISION.md:570-577` | `R-CANDIDATE-DATA`, `LAND-SCHEMA-CANDIDATE` |
| `OB-S12` | Candidate text derives from authoritative source row by `sourceBreakdownId`; no title snapshot or duplicate `isStaged`. | `DECISION.md:576-591` | `R-CANDIDATE-DATA`, `LAND-SCHEMA-CANDIDATE` |
| `OB-S13` | Confirmed orphan cleanup is atomic, audited, announced, and recalculates counts/archive eligibility; cache miss is not orphan proof. | `DECISION.md:580-589` | `R-CANDIDATE-DATA`, `LAND-SCHEMA-CANDIDATE`, `VQ-06` |
| `OB-S14` | Staging never consumes the source row. | `DECISION.md:590-592` | `R-CANDIDATE-DATA`, `LAND-SCHEMA-CANDIDATE` |
| `OB-S15` | One source row has at most one candidate by stable ID; same-title rows remain independent. | `DECISION.md:593-596` | `R-CANDIDATE-UNIQUE`, `LAND-SCHEMA-CANDIDATE` |
| `OB-S16` | Duplicate stage is no-op; type change requires unstage then restage. | `DECISION.md:597-600` | `R-CANDIDATE-UNIQUE`, `LAND-STAGING` |
| `OB-S17` | Repository/BaaS blocks staged-source Edit/Trash; never auto-unstage, propagate edits, or cascade-delete candidates. | `DECISION.md:601-608` | `R-CANDIDATE-GUARD`, `LAND-SCHEMA-CANDIDATE`, `NEG-15` |
| `OB-S18` | Dedicated unstage target and Breakdown-section drop-back invoke one shared command. | `DECISION.md:609-617` | `R-UNSTAGE`, `LAND-STAGING` |
| `OB-S19` | Do not add a permanent unstage button; dedicated target exists only during staged drag. | `DECISION.md:618-619` | `R-UNSTAGE`, `NEG-12` |
| `OB-S20` | Unstage overlay and temporary scroll padding must not resize/blur/move Staging content and disappear after drag. | `DECISION.md:620-626` | `R-UNSTAGE`, `LAND-STAGING` |
| `OB-S21` | Remove/unstage immediately restores eligibility; uniqueness is enforced at repository mutation boundary, never by a page-lifetime Set. | `DECISION.md:627-632` | `R-CANDIDATE-UNIQUE`, `LAND-SCHEMA-CANDIDATE`, `NEG-16` |
| `OB-S22` | Stage revalidates source ID/version/lifecycle/uniqueness before one idempotent durable create. | `DECISION.md:634-646` | `R-STAGE-WRITE`, `LAND-SCHEMA-OP` |
| `OB-S23` | Stage pending uses the final card shape but is non-draggable/non-placeable and visually/accessibly pending without pulse/layout motion. | `DECISION.md:647-657` | `R-STAGE-WRITE`, `LAND-STAGING`, `VQ-06` |
| `OB-S24` | Stage failure restores source and removes pending candidate; timeout reconciles before restaging. | `DECISION.md:658-663` | `R-STAGE-WRITE`, `LAND-SCHEMA-OP`, `VQ-06` |
| `OB-S25` | Unstage keeps candidate/source staged until confirmed success, then restores original sort position, internal scroll, focus, and shared one-shot signal. | `DECISION.md:664-676` | `R-UNSTAGE-WRITE`, `LAND-SCHEMA-OP` |
| `OB-S26` | Unstage failure keeps state, has no dedicated Retry button, and uses a non-auto-dismiss section-local alert with accessible X. | `DECISION.md:677-695` | `R-UNSTAGE-WRITE`, `LAND-STAGING`, `VQ-06` |
| `OB-S27` | Successful routine unstage has no success toast; future toast work may move only failure feedback. | `DECISION.md:680-693` | `R-UNSTAGE-WRITE`, `NEG-13` |
| `OB-S28` | Pending/reconciling Stage/Unstage locks Scratch/route navigation without queuing intent, while unrelated same-Scratch work remains usable. | `DECISION.md:697-706` | `R-STAGE-NAV`, `LAND-SESSION` |
| `OB-S29` | Drag start signals invalid Grid columns; actual invalid hover adds a direct warning. | `DECISION.md:708-715` | `R-DRAG-FEEDBACK`, `LAND-STAGING`, `LAND-EXPLORER` |
| `OB-S30` | Staged drag softly marks Breakdown as unstage target and strengthens it on entry without obscuring/reflowing content. | `DECISION.md:716-724` | `R-DRAG-FEEDBACK`, `LAND-BREAKDOWN` |
| `OB-S31` | Same-type subsection drop is neutral cancel; opposite-type drop is invalid with unstage-first reason; other cancel is mutation-free and silent. | `DECISION.md:725-734` | `R-DRAG-FEEDBACK`, `LAND-STAGING` |
| `OB-S32` | Remote candidate invalidation preserves an active pointer snapshot only through release, then suppresses local mutation and applies authority. | `DECISION.md:736-744` | `R-STAGE-REMOTE`, `LAND-STAGING` |
| `OB-S33` | Remote invalidation closes stale placement, discards invalid Result Title draft, announces without stealing focus, and moves focus only if source vanished. | `DECISION.md:745-750` | `R-STAGE-REMOTE`, `LAND-PLACEMENT`, `VQ-06` |

### 4.5 Grid Explorer and search

| ID | Atomic obligation | Exact authority | Discharge |
|---|---|---|---|
| `OB-G01` | Grid path/open columns are page-shared across Scratch switches, not a per-Scratch map and not reset to Home. | `DECISION.md:754-760` | `R-GRID-CONTEXT`, `LAND-SESSION` |
| `OB-G02` | Scratch switch preserves active Grid search/query/results/scroll without forcing search focus. | `DECISION.md:761-766` | `R-GRID-CONTEXT`, `LAND-SESSION` |
| `OB-G03` | Scratch switch preserves column scroll and reveal highlight; only enumerated Grid actions/route exit end reveal. | `DECISION.md:767-774` | `R-GRID-CONTEXT`, `LAND-SESSION` |
| `OB-G04` | Same-app-session route re-entry restores path/open columns/scroll after active/reachable validation and nearest-ancestor fallback. | `DECISION.md:776-783` | `R-GRID-REENTRY`, `LAND-SESSION` |
| `OB-G05` | Reload/new session starts Home and never persists path/scroll in localStorage/IndexedDB/remote DB. | `DECISION.md:782-783` | `R-GRID-REENTRY`, `NEG-17` |
| `OB-G06` | Route exit clears reveal, active/interrupted Explorer search, and page-session Newly Placed/Undo, while actual records remain. | `DECISION.md:784-790` | `R-GRID-REENTRY`, `LAND-SESSION`, `LAND-NEWLY` |
| `OB-G07` | Route re-entry restores visual/data context but sends focus to page heading/main landmark, never stale controls. | `DECISION.md:791-794` | `R-GRID-REENTRY`, `LAND-A11Y` |
| `OB-G08` | Explorer has visible theme chrome and full `Home`, `Level 1`, `Level 2`, `Level 3` labels with no repeated selected-title headers. | `DECISION.md:796-801` | `R-GRID-CHROME`, `LAND-EXPLORER` |
| `OB-G09` | Search is a dedicated Explorer mode replacing four columns inside the same section and focusing its input. | `DECISION.md:802-804` | `R-GRID-SEARCH`, `LAND-EXPLORER`, `VQ-07` |
| `OB-G10` | Empty-query pre-search and no-results are distinct; clear is an in-input X. | `DECISION.md:805-807` | `R-GRID-SEARCH`, `LAND-EXPLORER`, `VQ-07` |
| `OB-G11` | Search is disabled while direct-type or placement affordance is open. | `DECISION.md:808-809` | `R-GRID-SEARCH`, `LAND-PLACEMENT` |
| `OB-G12` | Search traverses all active/reachable visible Home roots and descendants, not active column. | `DECISION.md:811-816` | `R-GRID-SEARCH`, `LAND-EXPLORER`, `NEG-10` |
| `OB-G13` | Search excludes Chunks, archived/trashed/system/hidden/unreachable-orphan items. | `DECISION.md:813-816` | `R-GRID-SEARCH`, `LAND-EXPLORER` |
| `OB-G14` | Search tokenizes whitespace and requires all tokens across title/full breadcrumb; no fuzzy/semantic correction. | `DECISION.md:817-820` | `R-GRID-SEARCH`, `LAND-EXPLORER` |
| `OB-G15` | Rank exact → prefix → substring → split title/breadcrumb → breadcrumb-only, then hierarchy order. | `DECISION.md:821-827` | `R-GRID-SEARCH`, `LAND-EXPLORER` |
| `OB-G16` | Results are one flat Node/Bit list with type/title/full breadcrumb/native identity and textual duplicate disambiguation. | `DECISION.md:828-831` | `R-GRID-SEARCH`, `LAND-EXPLORER`, `VQ-07` |
| `OB-G17` | Loading/no-results/stale-refresh/failure are distinct and all results remain reachable by scroll/virtualization. | `DECISION.md:832-833` | `R-GRID-SEARCH`, `LAND-EXPLORER`, `VQ-07` |
| `OB-G18` | Live data updates preserve query/focus/scroll without remote alert; removal of focused result returns focus to input. | `DECISION.md:834-838` | `R-GRID-SEARCH`, `LAND-EXPLORER` |
| `OB-G19` | Results support click, Enter, arrows, Escape; selection reconstructs ancestor chain inside Inbox. | `DECISION.md:840-849` | `R-GRID-SEARCH`, `LAND-EXPLORER`, `LAND-A11Y` |
| `OB-G20` | Bit reveal is event-ended, never timer-ended; result rows are not DnD sources. | `DECISION.md:848-853` | `R-GRID-SEARCH`, `LAND-EXPLORER` |
| `OB-G21` | Starting triage DnD closes search to columns, preserves query only as interrupted state, and never auto-returns to search. | `DECISION.md:855-864` | `R-GRID-INTERRUPT`, `LAND-EXPLORER` |
| `OB-G22` | Newly placed items enter results immediately and source-aware Undo from results preserves search with inline feedback. | `DECISION.md:865-870` | `R-GRID-INTERRUPT`, `LAND-NEWLY`, `VQ-07` |
| `OB-G23` | Remote Grid insertions preserve path/selection/focus and anchor scroll by first visible stable ID/offset. | `DECISION.md:872-879` | `R-GRID-REMOTE`, `LAND-EXPLORER` |
| `OB-G24` | Invalidated path falls to nearest valid ancestor without sibling/ghost substitution, restores focus, reports status, and cancels stale placement. | `DECISION.md:880-885` | `R-GRID-REMOTE`, `LAND-EXPLORER`, `LAND-PLACEMENT` |

### 4.6 Placement, newly placed, and Undo

| ID | Atomic obligation | Exact authority | Discharge |
|---|---|---|---|
| `OB-PL01` | Preserve production hierarchy column/Node targets and compute path/type validity before drop; invalid never writes. | `DECISION.md:887-891` | `R-PLACE-TARGET`, `LAND-PLACEMENT` |
| `OB-PL02` | Edge auto-scroll is progressive and limited to the hovered valid column; it never scrolls invalid/other/page surfaces or changes path. | `DECISION.md:892-902` | `R-PLACE-SCROLL`, `LAND-EXPLORER` |
| `OB-PL03` | Final pointer-under target at release owns destination; no stale pre-scroll target. | `DECISION.md:900-904` | `R-PLACE-SCROLL`, `LAND-PLACEMENT` |
| `OB-PL04` | Placement affordance lives in target column scroll content and cannot expand/clip its column. | `DECISION.md:905-906` | `R-PLACE-AFFORDANCE`, `LAND-PLACEMENT` |
| `OB-PL05` | Full target still opens affordance with warning and disabled Confirm; there is no automatic alternate parent/sibling/cell. | `DECISION.md:907-912` | `R-PLACE-AFFORDANCE`, `NEG-18` |
| `OB-PL06` | Confirm revalidates source lifecycle/version/candidate, target reachability/type, and capacity. | `DECISION.md:913-924` | `R-PLACE-VALIDATE`, `LAND-SCHEMA-OP` |
| `OB-PL07` | Failed revalidation performs no write, partial success, auto-correction, best-effort compensation, or silent retry. | `DECISION.md:916-926` | `R-PLACE-VALIDATE`, `NEG-18` |
| `OB-PL08` | Direct selection/Result Title/placement is one foreground flow that locks context-changing actions without queuing them. | `DECISION.md:927-934` | `R-PLACE-FLOW`, `LAND-PLACEMENT` |
| `OB-PL09` | Cancel/Escape keeps source and discards only result-title draft; reload restores no unconfirmed flow. | `DECISION.md:930-937` | `R-PLACE-FLOW`, `LAND-SESSION` |
| `OB-PL10` | Placement entry is Mouse/Touch pointer DnD only; do not add a visible placement action, keyboard DnD, picker, hidden shortcut, or unfinished action. | `DECISION.md:939-948` | `R-PLACE-INPUT`, `NEG-07`, `LAND-A11Y` |
| `OB-PL11` | Each placement step owns focus containment; Cancel returns to source and success focuses actual created card. | `DECISION.md:949-965` | `R-PLACE-FOCUS`, `LAND-A11Y` |
| `OB-PL12` | Staged placement opens a distinct target-column affordance; Confirm creates, consumes, and removes candidate; Cancel mutates nothing. | `DECISION.md:967-976` | `R-PLACE-STAGED`, `LAND-PLACEMENT` |
| `OB-PL13` | Direct row first opens Node/Bit + path selection, then a visually distinct placement affordance; Confirm creates/consumes and Cancel keeps active row. | `DECISION.md:978-986` | `R-PLACE-DIRECT`, `LAND-PLACEMENT` |
| `OB-PL14` | Staged create+consume+candidate removal and direct create+consume are atomic, idempotent operations. | `DECISION.md:988-995` | `R-PLACE-COMMIT`, `LAND-SCHEMA-OP` |
| `OB-PL15` | Pending keeps affordance/source visible, locks conflicts, and never optimistically hides/adds. | `DECISION.md:996-998` | `R-PLACE-COMMIT`, `LAND-PLACEMENT`, `VQ-08` |
| `OB-PL16` | Explicit failure rolls back and offers manual Retry/Cancel; ambiguous result reconciles by operation ID before retry. | `DECISION.md:999-1010` | `R-PLACE-COMMIT`, `LAND-SCHEMA-OP`, `VQ-08` |
| `OB-PL17` | Preserve Breakdown 1000, Node 100, and Bit 200 limits without truncation or schema expansion. | `DECISION.md:1012-1016` | `R-PLACE-TITLE`, `LAND-PLACEMENT` |
| `OB-PL18` | Over-limit staged source gets a separate Result Title editor before placement and preserves original source/Undo text. | `DECISION.md:1017-1022` | `R-PLACE-TITLE`, `LAND-PLACEMENT`, `VQ-09` |
| `OB-PL19` | Direct placement has no Result Title editor: 1–100 permits Node/Bit, 101–200 Bit only, 201–1000 neither, with direct reasons and Cancel. | `DECISION.md:1023-1030` | `R-PLACE-TITLE`, `LAND-PLACEMENT` |
| `OB-N01` | Placement result is an actual existing Node/Bit card, never an indicator or separate card design. | `DECISION.md:1032-1039` | `R-NEWLY`, `LAND-NEWLY` |
| `OB-N02` | Newly Placed is a marker/treatment layered over base card and remains distinct when combined with selected state. | `DECISION.md:1037-1042` | `R-NEWLY`, `LAND-THEME`, `VQ-10` |
| `OB-N03` | Only operations started by the mounted page receive local marker/Undo; remote/reloaded records render normally at real coordinates. | `DECISION.md:1042-1048` | `R-NEWLY-LIFETIME`, `LAND-NEWLY` |
| `OB-N04` | Newly placed Nodes immediately support normal navigation/selection/child placement. | `DECISION.md:1049-1051` | `R-NEWLY`, `LAND-EXPLORER` |
| `OB-N05` | Keep stored coordinates but page-session-pin newly placed Nodes/Bits by type and latest completed operation; ordinary items retain Grid order. | `DECISION.md:1052-1060` | `R-NEWLY-PROJECTION`, `LAND-NEWLY` |
| `OB-N06` | Scratch/column switch preserves marker; Inbox route exit ends marker/Undo but not created record. | `DECISION.md:1061-1063` | `R-NEWLY-LIFETIME`, `LAND-SESSION` |
| `OB-U01` | Undo atomically removes result and restores candidate+row for staged source or active row for direct source. | `DECISION.md:1065-1073` | `R-UNDO`, `LAND-SCHEMA-OP` |
| `OB-U02` | Undo is separate from card navigation and exists only during the page session. | `DECISION.md:1073-1075` | `R-UNDO`, `LAND-NEWLY` |
| `OB-U03` | Result mutation or surviving descendants block Undo; same-session reversible children may be undone child-first and eligibility may recover. | `DECISION.md:1076-1094` | `R-UNDO-ELIGIBILITY`, `LAND-NEWLY` |
| `OB-U04` | Ineligible Undo stays visible with an accessible exact reason; marker provenance survives independently. | `DECISION.md:1088-1094` | `R-UNDO-ELIGIBILITY`, `LAND-THEME`, `VQ-10` |
| `OB-U05` | Eligible Undo may run before Archive mutation and cancels completion presentation if it restores work. | `DECISION.md:1095-1100` | `R-UNDO-ARCHIVE`, `LAND-NEWLY`, `LAND-ARCHIVE` |
| `OB-U06` | Archive mutation and an open placement flow disable Undo with a direct reason and no implicit cancel/retarget. | `DECISION.md:1100-1106` | `R-UNDO-ARCHIVE`, `LAND-NEWLY` |
| `OB-U07` | Undo has deterministic Grid/search focus restoration and announces restored source without cross-section scroll/focus theft. | `DECISION.md:1107-1111` | `R-UNDO-FOCUS`, `LAND-A11Y` |
| `OB-U08` | Undo is non-optimistic, atomic, retry/reconcile capable, save-before-action aware, and navigation-guarded. | `DECISION.md:1112-1124` | `R-UNDO-COMMIT`, `LAND-SCHEMA-OP` |

### 4.7 Completion, archive, localization, and architecture

| ID | Atomic obligation | Exact authority | Discharge |
|---|---|---|---|
| `OB-A01` | Archive eligibility requires an active selected Scratch, at least one consumed row, all rows consumed, and zero staged candidates. | `DECISION.md:1128-1139` | `R-ARCHIVE-ELIGIBILITY`, `LAND-ARCHIVE` |
| `OB-A02` | All-staged and all-deleted-with-no-consumed are ineligible; consumed-plus-deleted-remainder may be eligible. | `DECISION.md:1137-1139` | `R-ARCHIVE-ELIGIBILITY`, `LAND-ARCHIVE` |
| `OB-A03` | Non-empty Add draft blocks completion presentation without changing persisted eligibility or auto-submitting/discarding. | `DECISION.md:1141-1148` | `R-ARCHIVE-BLOCKER`, `LAND-BREAKDOWN`, `VQ-11` |
| `OB-A04` | Dirty/save/conflict Scratch title editor blocks completion until Save/Cancel; failure keeps blocker. | `DECISION.md:1149-1156` | `R-ARCHIVE-BLOCKER`, `LAND-BREAKDOWN`, `VQ-11` |
| `OB-A05` | Eligibility loss immediately removes overlay/blur/complete/reopen state and reports why. | `DECISION.md:1157-1162` | `R-ARCHIVE-ELIGIBILITY`, `LAND-ARCHIVE` |
| `OB-A06` | Archive transaction revalidates eligibility/lifecycle and never auto-archives or waits on stale snapshots. | `DECISION.md:1163-1167` | `R-ARCHIVE-COMMIT`, `LAND-SCHEMA-OP` |
| `OB-A07` | First current-page false→true eligibility transition opens a Breakdown-only blur/dim overlay with Cancel and Archive. | `DECISION.md:1169-1174` | `R-ARCHIVE-OVERLAY`, `LAND-BREAKDOWN` |
| `OB-A08` | Auto-open preserves current focus, announces readiness, is non-modal before mutation, and blocks only blurred Breakdown controls. | `DECISION.md:1175-1183` | `R-ARCHIVE-OVERLAY`, `LAND-A11Y` |
| `OB-A09` | Escape cancels only from inside the overlay. | `DECISION.md:1180-1183` | `R-ARCHIVE-OVERLAY`, `LAND-A11Y` |
| `OB-A10` | Cancel closes overlay, changes Context to complete, exposes reopen, and immediately permits the existing Add flow. | `DECISION.md:1185-1196` | `R-ARCHIVE-CANCEL`, `LAND-BREAKDOWN` |
| `OB-A11` | New persisted row withdraws complete/reopen state; typing only a draft uses blocker status instead. | `DECISION.md:1190-1195` | `R-ARCHIVE-CANCEL`, `LAND-BREAKDOWN` |
| `OB-A12` | Cancel/reopen has explicit focus destinations and no global focus trap before mutation. | `DECISION.md:1196-1199` | `R-ARCHIVE-CANCEL`, `LAND-A11Y` |
| `OB-A13` | Scratch switch before mutation defers the decision without write; return restores complete/reopen, never auto-opens. | `DECISION.md:1200-1209` | `R-ARCHIVE-REENTRY`, `LAND-SESSION` |
| `OB-A14` | Route exit/reload stores no overlay dismissal/open state; already-ready entry shows complete/reopen only. | `DECISION.md:1210-1216` | `R-ARCHIVE-REENTRY`, `LAND-SESSION`, `NEG-17` |
| `OB-A15` | Confirm sets `archivedAt`, removes Scratch only after confirmed success, and preserves Archive View restore. | `DECISION.md:1218-1228` | `R-ARCHIVE-COMMIT`, `LAND-ARCHIVE` |
| `OB-A16` | Archive is idempotent/atomic, pending/reconciling stays in overlay, locks conflicts, and uses native unload guard. | `DECISION.md:1223-1243` | `R-ARCHIVE-COMMIT`, `LAND-SCHEMA-OP`, `VQ-12` |
| `OB-A17` | Archive explicit failure offers manual Retry/Cancel; ambiguous/reloaded operation reconciles before a new operation. | `DECISION.md:1233-1246` | `R-ARCHIVE-COMMIT`, `LAND-SCHEMA-OP`, `VQ-12` |
| `OB-A18` | Success selects next-visible then previous-visible, respects filtered no-results, and otherwise focuses true Inbox empty primary action. | `DECISION.md:1247-1255` | `R-ARCHIVE-SUCCESS`, `LAND-POOL`, `LAND-A11Y` |
| `OB-L01` | Korean support is selected direction but deferred from core promotion. | `DECISION.md:1257-1264` | `D-LOCALE`, `LAND-COPY` |
| `OB-L02` | Core English copy has one Inbox resource/copy owner rather than scattered strings. | `DECISION.md:1264-1268` | `R-COPY-FOUNDATION`, `LAND-COPY` |
| `OB-L03` | Shared locale/provider/resources/toggle/date/status/a11y copy follows core; theme-specific Korean type/text-fit QA follows card redesign. | `DECISION.md:1267-1270` | `D-LOCALE`, `D-CARD`, `LAND-COPY` |
| `OB-L04` | Locale switching is shared-state, non-route, non-reload, and preserves all named work state. | `DECISION.md:1271-1272` | `D-LOCALE`, `R-PRESENTATION`, `LAND-SESSION` |
| `OB-L05` | Text capacity/overflow/IME visual detail remains owned by its separate deferred topic. | `DECISION.md:1273-1274` | `D-TEXT` |
| `OB-AR01` | Do not copy local mock state/duplicated handlers; restructure current main owners by responsibility. | `DECISION.md:1276-1280` | `NEG-01`, `LAND-POOL` through `LAND-ARCHIVE` |
| `OB-AR02` | Actual Node/Bit + consumedAt own placed truth; only operation/Undo metadata is page/session state. | `DECISION.md:1281-1282` | `R-DATA-BOUNDARY`, `LAND-SCHEMA-OP`, `LAND-NEWLY` |
| `OB-AR03` | Direct type, placement confirmation, mutation, and rollback are distinct states. | `DECISION.md:1283-1284` | `R-PLACE-FLOW`, `LAND-PLACEMENT` |
| `OB-AR04` | Dedicated Explorer query/result model owns traversal, ancestor chain, tokens, relevance, hierarchy order, async identity/loading/error/stale response. | `DECISION.md:1285-1293` | `R-GRID-SEARCH`, `LAND-EXPLORER`, `NEG-10` |
| `OB-AR05` | Theme differences use shared semantic state/tokens/realization components, never duplicated routes. | `DECISION.md:1294-1297` | `R-THEME`, `NEG-01`, `LAND-THEME` |
| `OB-VR01` | Recipes are surface-first hybrid, with shared contract plus eight realization sections. | `DECISION.md:1299-1305` | §11 recipe set |
| `OB-VR02` | Recipe index is navigation only; tokens own shared semantics, SPEC behavior, recipes exact source values. | `DECISION.md:1305-1309` | §11.1 canonical plan, §11.3 recipe set |
| `OB-VR03` | Initial recipe set covers the nine named production surfaces and may split/merge only by actual production owner, never by theme. | `DECISION.md:1310-1315` | §11 recipe set |
| `OB-VR04` | Do not extend the superseded Batch 2 recipe as the direct execution recipe. | `DECISION.md:1316-1319` | `NEG-04`, §11 recipe set |
| `OB-D01` | Defer common BitCard eight-theme enhancement. | `DECISION.md:58-67`, `1336` | `D-CARD` |
| `OB-D02` | Defer Staging/placed reuse of redesigned cards until that common-card work. | `DECISION.md:60-67` | `D-CARD` |
| `OB-D03` | Defer shared Korean realization and theme-specific Korean QA. | `DECISION.md:62`, `1257-1274` | `D-LOCALE` |
| `OB-D04` | Defer Neumorphism water-lens sort polish. | `DECISION.md:63`, `1337` | `D-LENS` |
| `OB-D05` | Defer keyboard/drag-alternative placement entry and add no placeholder UI now. | `DECISION.md:939-948`, `1345-1347` | `D-KEYBOARD`, `NEG-07` |

### 4.8 Broad-span atomization audit

The rows above are stable reconciliation anchors. Where one anchor cites a
long compound authority passage, the independently testable clauses are made
explicit below; none is discharged merely by implication.

#### Presentation, external removal, Add, Edit, and Delete

| Clause ID | Independently testable obligation | Exact authority | Anchor / discharge |
|---|---|---|---|
| `OB-F16-A` | Theme/locale switching preserves selected Scratch plus Pool expansion and search. | `DECISION.md:136-138` | `OB-F16`; `LAND-SESSION` |
| `OB-F16-B` | Theme/locale switching preserves Add and inline Edit drafts. | `DECISION.md:136-138` | `OB-F16`; `LAND-BREAKDOWN` |
| `OB-F16-C` | Theme/locale switching preserves Grid path, search, reveal, and interrupted query. | `DECISION.md:136-145` | `OB-F16`; `LAND-SESSION`, `LAND-EXPLORER` |
| `OB-F16-D` | Open Placement/Archive surfaces retain the same state and pending operation ID while new tokens/copy apply. | `DECISION.md:137-145` | `OB-F16`; `LAND-PLACEMENT`, `LAND-ARCHIVE`, `LAND-SCHEMA-OP` |
| `OB-F16-E` | Theme/locale switching does not end Newly Placed marker or Undo page-session state. | `DECISION.md:137-145` | `OB-F16`; `LAND-NEWLY` |
| `OB-F16-F` | Presentation switching triggers no automatic save, cancel, refetch, navigation, or duplicate mutation. | `DECISION.md:138-146` | `OB-F16`; `NEG-17`, `LAND-SCHEMA-OP` |
| `OB-P07-A` | External archive/delete immediately blocks stale-Scratch interaction and opens lifecycle-specific modal copy. | `DECISION.md:171-173` | `OB-P07`; `LAND-POOL`, `VQ-01` |
| `OB-P07-B` | Countdown destination is latest next-visible then previous-visible under preserved Pool search/sort, never a hidden mismatch. | `DECISION.md:174-176` | `OB-P07`; `LAND-POOL` |
| `OB-P07-C` | If no active Scratch remains, external removal leaves selection null and shows the Inbox empty state. | `DECISION.md:177-178` | `OB-P07`; `LAND-POOL` |
| `OB-P08-A` | External-removal UI provides five-second countdown, move-now, pause, and resume. | `DECISION.md:179-180` | `OB-P08`; `LAND-POOL`, `VQ-01` |
| `OB-P08-B` | The modal has no Cancel to stale work and blocks Edit/Add/Stage/Place/Archive on the removed Scratch. | `DECISION.md:181-182` | `OB-P08`; `LAND-POOL` |
| `OB-P08-C` | Modal message names lifecycle and current destination, including no-results/empty destination. | `DECISION.md:183-185` | `OB-P08`; `VQ-01`, `LAND-COPY` |
| `OB-P08-D` | Countdown seconds do not announce every tick; lifecycle/timing announces once and pause is a stable initial action. | `DECISION.md:186-188` | `OB-P08`; `LAND-A11Y`, `VQ-01` |
| `OB-P09-A` | Any non-empty Add or dirty Scratch/row Edit draft opens external removal initially paused. | `DECISION.md:189-192` | `OB-P09`; `LAND-POOL` |
| `OB-P09-B` | Each draft is source-labeled and independently exposes full-text copy unaffected by visual truncation. | `DECISION.md:193-195` | `OB-P09`; `VQ-01`, `LAND-COPY` |
| `OB-P09-C` | Copy status is non-blocking and focus-preserving; success neither resumes countdown nor persists drafts. | `DECISION.md:196-197` | `OB-P09`; `LAND-A11Y`, `NEG-17` |
| `OB-P09-D` | Moving clears stale page-local drafts only after copy opportunity and never saves them to the deleted record or another Scratch. | `DECISION.md:198-199` | `OB-P09`; `LAND-SESSION`, `NEG-17` |
| `OB-B23-A` | Only one Add operation runs; no optimistic input clear/row or in-memory draft queue. | `DECISION.md:352-353` | `OB-B23`; `LAND-SCHEMA-OP` |
| `OB-B23-B` | Dexie atomically validates Scratch lifecycle, computes order, and creates the row. | `DECISION.md:354-356` | `OB-B23`; `LAND-SCHEMA-OP` |
| `OB-B23-C` | Future BaaS uses operation ID plus unique idempotency key to prevent duplicate Add. | `DECISION.md:355-356` | `OB-B23`; `LAND-SCHEMA-OP` |
| `OB-B23-D` | Explicit/offline Add failure preserves draft and logical focus and offers Retry. | `DECISION.md:357` | `OB-B23`; `LAND-BREAKDOWN` |
| `OB-B23-E` | Ambiguous Add reconciles operation/result before exactly-once clear/scroll/signal or enabling Retry. | `DECISION.md:358-361` | `OB-B23`; `LAND-SCHEMA-OP` |
| `OB-E04-A` | Async Save keeps editor/draft visible, shows saving in-place, and locks conflicting controls. | `DECISION.md:374-375` | `OB-E04`; `LAND-BREAKDOWN`, `VQ-04` |
| `OB-E04-B` | Editor closes/pending intent runs only after confirmed success; failure restores logical focus without optimistic close/recreate. | `DECISION.md:376-377` | `OB-E04`; `LAND-BREAKDOWN`, `LAND-A11Y` |
| `OB-E04-C` | Ambiguous Save enters result-checking while retaining editor and draft. | `DECISION.md:378-379` | `OB-E04`; `LAND-SCHEMA-OP`, `VQ-04` |
| `OB-E05-A` | Reconciliation maps intended value plus incremented version to success, unchanged base to Retry, and other value/lifecycle to conflict. | `DECISION.md:380-382` | `OB-E05`; `LAND-SCHEMA-VERSION`, `LAND-SCHEMA-OP` |
| `OB-E05-B` | Save never blind-resends and never leaves the editor indefinitely saving. | `DECISION.md:383` | `OB-E05`; `LAND-SCHEMA-OP` |
| `OB-E05-C` | Known offline/unqueryable Save unlocks editing, labels unsaved state, preserves draft, and exposes explicit Retry. | `DECISION.md:384-386` | `OB-E05`; `LAND-BREAKDOWN`, `VQ-04` |
| `OB-E05-D` | Reconnection announces Retry availability but does not auto-save, auto-run pending intent, or create a durable offline queue. | `DECISION.md:387-389` | `OB-E05`; `LAND-SCHEMA-OP`, `NEG-17` |
| `OB-E11-A` | External value conflict offers inline `use mine`/`use latest`; use-mine conditionally saves against the acknowledged latest version. | `DECISION.md:421-423` | `OB-E11`; `LAND-SCHEMA-VERSION`, `VQ-04` |
| `OB-E11-B` | External-change notice preserves local draft/focus and conditional Save remains final conflict authority without realtime delivery. | `DECISION.md:424-427` | `OB-E11`; `LAND-BREAKDOWN` |
| `OB-E11-C` | Conflict resolution stays in the source editor with latest preview/actions, never a global or Breakdown-wide modal. | `DECISION.md:431-433` | `OB-E11`; `NEG-14`, `LAND-BREAKDOWN` |
| `OB-E11-D` | Further external change updates one inline latest/base view without nesting resolvers or resetting draft. | `DECISION.md:434-435` | `OB-E11`; `LAND-BREAKDOWN` |
| `OB-R02-A` | Deleting row stays at the same list position and base surface with a theme-specific in-place status. | `DECISION.md:470-472` | `OB-R02`; `LAND-BREAKDOWN`, `VQ-05` |
| `OB-R02-B` | Deleting locks Edit/Trash/grip/DnD and communicates pending with visible, non-color-only accessible state. | `DECISION.md:473-474` | `OB-R02`; `LAND-BREAKDOWN`, `LAND-A11Y` |
| `OB-R02-C` | Row removal, Empty Prompt, and Archive eligibility do not update before confirmed Delete success. | `DECISION.md:475-476` | `OB-R02`; `LAND-SCHEMA-OP` |
| `OB-R02-D` | Pending/reconciling Delete locks Scratch/route navigation without queuing or auto-running an intent. | `DECISION.md:477-479` | `OB-R02`; `LAND-SESSION` |
| `OB-R02-E` | Browser exit during unresolved Delete uses native unload; staying continues the same pending row/operation check. | `DECISION.md:480-482` | `OB-R02`; `LAND-SCHEMA-OP` |
| `OB-R06-A` | Confirmed Delete has one operation ID and blocks a second Delete while pending/reconciling. | `DECISION.md:491-492` | `OB-R06`; `LAND-SCHEMA-OP` |
| `OB-R06-B` | Explicit Delete failure restores Active at the same position, unlocks controls, and uses existing Trash/confirmation for a new attempt. | `DECISION.md:493-495` | `OB-R06`; `LAND-BREAKDOWN` |
| `OB-R06-C` | Ambiguous Delete keeps reconciling, queries operation plus authoritative row, and neither resends nor optimistically restores. | `DECISION.md:496-498` | `OB-R06`; `LAND-SCHEMA-OP` |
| `OB-R06-D` | Confirmed success removes once/recomputes; confirmed non-execution restores Active with failure notice. | `DECISION.md:499-501` | `OB-R06`; `LAND-SCHEMA-OP` |
| `OB-R06-E` | If reconciliation remains unavailable, `check again` replaces mutation Retry and locks/guards remain. | `DECISION.md:502-503` | `OB-R06`; `LAND-BREAKDOWN`, `VQ-05` |

#### Staging, search, and placement

| Clause ID | Independently testable obligation | Exact authority | Anchor / discharge |
|---|---|---|---|
| `OB-S06-A` | Local Stage scrolls only the affected subsection to top without moving focus. | `DECISION.md:537-538` | `OB-S06`; `LAND-STAGING` |
| `OB-S06-B` | Remote candidate arrival preserves scroll and shows subsection-local new-count only when the user is not already at top. | `DECISION.md:539-541` | `OB-S06`; `LAND-STAGING`, `VQ-06` |
| `OB-S06-C` | Indicator clears on activation/manual top observation and excludes hydration/Scratch-switch candidates. | `DECISION.md:542-544` | `OB-S06`; `LAND-STAGING` |
| `OB-S06-D` | Remote arrival does not steal focus and uses polite live announcement; theme recipes may realize only its surface. | `DECISION.md:545-546` | `OB-S06`; `LAND-A11Y`, `VQ-06` |
| `OB-S09-A` | Candidate root has no primary click/detail/menu and is the full drag activator; prototype internal grip is removed. | `DECISION.md:554-557` | `OB-S09`; `NEG-06`, `LAND-STAGING` |
| `OB-S09-B` | Every grab point uses shared DragOverlay/TriageDragToken with invariant shape, offset, and content. | `DECISION.md:558-560` | `OB-S09`; `LAND-STAGING` |
| `OB-S09-C` | Token remains pointer-centered; Node/Bit content differs by type but not by grab point. | `DECISION.md:561-563` | `OB-S09`; `LAND-STAGING` |
| `OB-S09-D` | Recipes may not reintroduce the prototype grip as a handle or hit target. | `DECISION.md:567-568` | `OB-S09`; `NEG-06` |
| `OB-S12-A` | Candidate owns stable ID, Scratch/source/type/lifecycle/version metadata and survives route/reload/login/device. | `DECISION.md:576-577` | `OB-S12`; `LAND-SCHEMA-CANDIDATE` |
| `OB-S12-B` | Candidate stores no title/content snapshot; display text resolves from authoritative source row. | `DECISION.md:578-579` | `OB-S12`; `LAND-SCHEMA-CANDIDATE` |
| `OB-S12-C` | Candidate query resolves source and never renders an unresolved orphan as a normal card. | `DECISION.md:580-581` | `OB-S12`; `LAND-SCHEMA-CANDIDATE` |
| `OB-S12-D` | Source staged presentation derives from candidate existence; no duplicate persisted `isStaged`. | `DECISION.md:590-591` | `OB-S12`; `LAND-SCHEMA-CANDIDATE` |
| `OB-S13-A` | Cache miss/offline/subscription delay is insufficient orphan proof; authority must confirm deletion/tombstone. | `DECISION.md:582-583` | `OB-S13`; `LAND-SCHEMA-CANDIDATE` |
| `OB-S13-B` | Confirmed orphan is atomically removed/audited and counts/archive eligibility recompute; no broken/hidden orphan remains. | `DECISION.md:584-586` | `OB-S13`; `LAND-SCHEMA-CANDIDATE` |
| `OB-S13-C` | Current-Scratch orphan cleanup emits a non-focus-stealing Staging-local alert with selected dismissal lifecycle. | `DECISION.md:587-589` | `OB-S13`; `LAND-STAGING`, `VQ-06` |
| `OB-S22-A` | Stage starts one idempotent durable candidate-create operation. | `DECISION.md:636-637` | `OB-S22`; `LAND-SCHEMA-OP` |
| `OB-S22-B` | Immediately before write, Stage revalidates stable ID, version, active lifecycle, and candidate absence. | `DECISION.md:638-639` | `OB-S22`; `LAND-SCHEMA-OP` |
| `OB-S22-C` | Source changed after drag start causes no candidate and no auto-stage of latest or stale snapshot. | `DECISION.md:640-642` | `OB-S22`; `LAND-SCHEMA-OP` |
| `OB-S22-D` | Validation failure projects authoritative modified/staged/deleted state and gives local guidance without a Retry button. | `DECISION.md:643-646` | `OB-S22`; `LAND-STAGING`, `VQ-06` |
| `OB-S23-A` | Before confirmed Stage, pending candidate appears and source row locks against duplicate/conflicting actions. | `DECISION.md:647-648` | `OB-S23`; `LAND-STAGING` |
| `OB-S23-B` | Pending candidate uses final theme card shape/information, never a generic wrapper/card. | `DECISION.md:649-650` | `OB-S23`; `LAND-STAGING` |
| `OB-S23-C` | Pending distinction preserves type and forbids blink, repeated pulse, and layout-changing motion. | `DECISION.md:651-653` | `OB-S23`; `NEG-11`, `LAND-THEME` |
| `OB-S23-D` | Pending candidate is not draggable, unstageable, or placeable and exposes saving state accessibly. | `DECISION.md:654-655` | `OB-S23`; `LAND-STAGING`, `LAND-A11Y` |
| `OB-S23-E` | Confirmed Stage removes pending treatment and changes source row to staged de-emphasis. | `DECISION.md:656-657` | `OB-S23`; `LAND-STAGING` |
| `OB-S25-A` | Either unstage target starts one idempotent unstage operation. | `DECISION.md:666-667` | `OB-S25`; `LAND-SCHEMA-OP` |
| `OB-S25-B` | Until success, candidate/source retain staged truth and candidate drag/duplicate/conflicting actions stay locked. | `DECISION.md:668-670` | `OB-S25`; `LAND-STAGING` |
| `OB-S25-C` | Success preserves createdAt/sort, scrolls only Breakdown list nearest as needed, and focuses restored source. | `DECISION.md:671-673` | `OB-S25`; `LAND-BREAKDOWN`, `LAND-A11Y` |
| `OB-S25-D` | Restored row reuses Add's one-shot theme signal and reduced-motion alternative, not a new unstage animation. | `DECISION.md:674-676` | `OB-S25`; `LAND-THEME`, `VQ-02` |
| `OB-S26-A` | Explicit Unstage failure keeps candidate/source, unlocks pending, adds no Retry button, and retries only through another drag. | `DECISION.md:677-679` | `OB-S26`; `LAND-STAGING` |
| `OB-S26-B` | Failure alert is a Staging-header-local overlay that does not resize lists/cards and names item plus direct reason. | `DECISION.md:680-682` | `OB-S26`; `LAND-STAGING`, `VQ-06` |
| `OB-S26-C` | Failure alert does not take focus, uses `role="alert"`, and successful unstage adds no success alert. | `DECISION.md:683-684` | `OB-S26`; `LAND-A11Y`, `NEG-13` |
| `OB-S26-D` | Accessible X closes only the alert and never mutates/retries candidate, source, or operation. | `DECISION.md:685-686` | `OB-S26`; `LAND-STAGING` |
| `OB-S26-E` | Alert never times out; selected state events remove it and a new failure replaces its content. | `DECISION.md:687-689` | `OB-S26`; `LAND-STAGING` |
| `OB-S26-F` | Ambiguous Unstage queries operation authority before candidate removal/source activation. | `DECISION.md:694-695` | `OB-S26`; `LAND-SCHEMA-OP` |
| `OB-S27-A` | Routine successful Unstage has no success toast. | `DECISION.md:683-684` | `OB-S27`; `NEG-13` |
| `OB-S27-B` | Future workspace toast work may move failure feedback only and cannot reinterpret the success rule. | `DECISION.md:690-693` | `OB-S27`; §10.4 follow-up |
| `OB-S28-A` | Pending/reconciling Stage/Unstage locks Scratch selection and route exit, stores no intent, and displays retry-later status. | `DECISION.md:699-701` | `OB-S28`; `LAND-SESSION` |
| `OB-S28-B` | Only dependent same-Scratch actions lock; unrelated row review, Pool use, and Grid exploration remain usable. | `DECISION.md:702-703` | `OB-S28`; `LAND-SESSION` |
| `OB-S28-C` | Browser exit uses native unload; staying preserves pending presentation and result check. | `DECISION.md:704-705` | `OB-S28`; `LAND-SCHEMA-OP` |
| `OB-S28-D` | On settled success/failure, navigation unlocks without auto-running the earlier request. | `DECISION.md:706` | `OB-S28`; `LAND-SESSION` |
| `OB-S31-A` | Dragging a staged item back over its same-type subsection is neutral and drop is mutation-free cancel. | `DECISION.md:725-726` | `OB-S31`; `LAND-STAGING` |
| `OB-S31-B` | Opposite subsection is invalid with unstage-first reason and never auto-converts candidate type. | `DECISION.md:727-729` | `OB-S31`; `LAND-STAGING` |
| `OB-S31-C` | Pointer release/Escape/browser cancel outside a valid target keeps candidate at original place/state. | `DECISION.md:730-732` | `OB-S31`; `LAND-STAGING` |
| `OB-S31-D` | Neutral cancel removes all drag feedback immediately and emits no failure alert, toast, or cancellation message. | `DECISION.md:733-734` | `OB-S31`; `LAND-STAGING` |
| `OB-G19-A` | Search results support click, Enter, Arrow Up/Down, and Escape. | `DECISION.md:842` | `OB-G19`; `LAND-EXPLORER`, `LAND-A11Y` |
| `OB-G19-B` | Selecting a result closes search, clears current/interrupted query, and restores four columns. | `DECISION.md:843-844` | `OB-G19`; `LAND-EXPLORER` |
| `OB-G19-C` | Selection reconstructs ancestor path inside Inbox rather than navigating the general Grid route. | `DECISION.md:845-846` | `OB-G19`; `LAND-EXPLORER` |
| `OB-G19-D` | Node becomes selected; Bit opens parent, scrolls into view, and receives reveal highlight. | `DECISION.md:847-849` | `OB-G19`; `LAND-EXPLORER` |
| `OB-G21-A` | Starting triage DnD closes search and immediately restores columns/drop/placement affordances. | `DECISION.md:857-858` | `OB-G21`; `LAND-EXPLORER` |
| `OB-G21-B` | Only DnD interruption stores the query as page-level interrupted search. | `DECISION.md:859` | `OB-G21`; `LAND-SESSION` |
| `OB-G21-C` | Drop/Cancel never auto-returns to search; explicit reopen restores interrupted query/results. | `DECISION.md:860-861` | `OB-G21`; `LAND-EXPLORER` |
| `OB-G21-D` | Result selection/X/Escape/route exit clear interrupted state; route exit also clears current results/scroll and re-entry restores no search mode. | `DECISION.md:862-864` | `OB-G21`; `LAND-SESSION` |
| `OB-PL02-A` | Edge auto-scroll affects only the hovered valid column and accelerates progressively without jumps. | `DECISION.md:892-894` | `OB-PL02`; `LAND-EXPLORER` |
| `OB-PL02-B` | Invalid/other/Explorer/page never auto-scroll; leaving edge/ending drag stops it and it never changes path/selection. | `DECISION.md:895-897` | `OB-PL02`; `LAND-EXPLORER` |
| `OB-PL02-C` | Ordinary input scrolling and drag auto-scroll remain while scrollbar chrome stays hidden. | `DECISION.md:898-899` | `OB-PL02`; `LAND-EXPLORER` |
| `OB-PL02-D` | During auto-scroll, pointer-under target is continuously hit-tested; no stale target waits for pointer movement. | `DECISION.md:900-902` | `OB-PL02`; `LAND-PLACEMENT` |
| `OB-PL06-A` | Confirm-time validation checks source lifecycle/candidate plus target reachability/type/path. | `DECISION.md:913-915` | `OB-PL06`; `LAND-SCHEMA-OP` |
| `OB-PL06-B` | Invalid/moved target causes zero create/consume/candidate writes and no fallback or stale snapshot. | `DECISION.md:916-918` | `OB-PL06`; `NEG-18` |
| `OB-PL06-C` | Target failure projects latest Grid, preserves source, closes/invalidates stale affordance, and requires a new drag. | `DECISION.md:919-921` | `OB-PL06`; `LAND-PLACEMENT`, `VQ-08` |
| `OB-PL06-D` | Invalid source causes no write/resurrection/duplicate and closes after latest state applies. | `DECISION.md:922-924` | `OB-PL06`; `LAND-SCHEMA-OP` |
| `OB-PL07-A` | Revalidation failure never becomes partial success, auto-correction, silent retry, or one-sided best effort. | `DECISION.md:925-926` | `OB-PL07`; `NEG-18` |
| `OB-PL10-A` | Placement entry is pointer DnD only with no placement button/menu, keyboard drag, or destination picker. | `DECISION.md:941-943` | `OB-PL10`; `NEG-07` |
| `OB-PL10-B` | Mouse/Touch share production activation constraints, drag pill, drop signal, and placement affordance. | `DECISION.md:944-946` | `OB-PL10`; `LAND-A11Y` |
| `OB-PL10-C` | Keyboard/alternative entry remains deferred and contributes no hidden shortcut or unfinished action now. | `DECISION.md:947-948` | `OB-PL10`; `D-KEYBOARD`, `NEG-07` |
| `OB-PL11-A` | Initial focus is flow-specific: staged placement heading/Cancel, Result Title input, or direct-type heading. | `DECISION.md:949-951` | `OB-PL11`; `LAND-A11Y` |
| `OB-PL11-B` | Advancing a step moves focus to the new heading/Cancel, never a removed control. | `DECISION.md:952-953` | `OB-PL11`; `LAND-A11Y` |
| `OB-PL11-C` | Tab stays within the current affordance without converting column-scoped UI to full-screen modal. | `DECISION.md:954-955` | `OB-PL11`; `LAND-A11Y`, `LAND-PLACEMENT` |
| `OB-PL11-D` | Unavailable type exposes disabled reason; validation/stale/failure retains focus in current step. | `DECISION.md:956-957` | `OB-PL11`; `LAND-A11Y`, `VQ-08`, `VQ-09` |
| `OB-PL11-E` | Cancel returns focus to source grip/card or, if source vanished, its section heading. | `DECISION.md:958-960` | `OB-PL11`; `LAND-A11Y` |
| `OB-PL11-F` | Success focuses the actual created card and announces marker/Undo without taking focus again. | `DECISION.md:961-963` | `OB-PL11`; `LAND-A11Y`, `LAND-NEWLY` |
| `OB-PL11-G` | Pending/reconciling keeps focus in affordance and moves only after outcome to card/Retry/Cancel. | `DECISION.md:964-965` | `OB-PL11`; `LAND-A11Y`, `VQ-08` |
| `OB-PL12-A` | Staged drop opens a target-column affordance naming source, result type, and destination path. | `DECISION.md:969-971` | `OB-PL12`; `LAND-PLACEMENT` |
| `OB-PL12-B` | Staged Cancel/Escape mutates nothing and retains candidate. | `DECISION.md:972` | `OB-PL12`; `LAND-PLACEMENT` |
| `OB-PL12-C` | Staged Confirm creates the actual result, consumes source row, and removes candidate. | `DECISION.md:973-976` | `OB-PL12`; `LAND-SCHEMA-OP`, `LAND-NEWLY` |
| `OB-PL16-A` | Explicit/offline placement failure rolls back all writes, preserves source/candidate, offers Retry/Cancel, and never auto-retries. | `DECISION.md:999-1001` | `OB-PL16`; `LAND-SCHEMA-OP`, `VQ-08` |
| `OB-PL16-B` | Ambiguous placement queries durable operation result and converges to success display or re-enabled Retry/Cancel. | `DECISION.md:1002-1004` | `OB-PL16`; `LAND-SCHEMA-OP` |
| `OB-PL16-C` | While unresolved, it retains reconciling and starts no new operation or heuristic duplicate. | `DECISION.md:1005-1007` | `OB-PL16`; `LAND-SCHEMA-OP` |
| `OB-PL16-D` | Placement status is visible/live without focus theft; failure targets Retry and success targets actual card. | `DECISION.md:1008-1010` | `OB-PL16`; `LAND-A11Y`, `VQ-08` |

#### Undo and archive

| Clause ID | Independently testable obligation | Exact authority | Anchor / discharge |
|---|---|---|---|
| `OB-U03-A` | Selection/navigation/search reveal do not affect Undo eligibility because they do not mutate data. | `DECISION.md:1076-1077` | `OB-U03`; `LAND-NEWLY` |
| `OB-U03-B` | Any later mutation of result fields/path/lifecycle blocks Undo and cannot be overwritten by the creation snapshot. | `DECISION.md:1078-1079` | `OB-U03`; `LAND-NEWLY` |
| `OB-U03-C` | Surviving descendants block parent Undo; same-session reversible descendants may be undone child-first. | `DECISION.md:1080-1082` | `OB-U03`; `LAND-NEWLY` |
| `OB-U03-D` | Eligibility may recover and repository atomically rechecks result, lifecycle, descendants, and unknown mutations before Undo. | `DECISION.md:1083-1085` | `OB-U03`; `LAND-NEWLY`, `LAND-SCHEMA-OP` |
| `OB-U03-E` | Ineligible Undo performs no cascade, orphan creation, or best-effort source restoration. | `DECISION.md:1086-1087` | `OB-U03`; `LAND-SCHEMA-OP` |
| `OB-U03-F` | Marker provenance remains until route exit independently from rollback eligibility. | `DECISION.md:1088-1089` | `OB-U03`; `LAND-NEWLY` |
| `OB-U03-G` | Unavailable Undo remains in place with specific non-hover-only reason accessible to keyboard/AT. | `DECISION.md:1090-1092` | `OB-U03`; `LAND-A11Y`, `VQ-10` |
| `OB-U03-H` | Undo re-enables when dependencies clear; the user need not invoke a late-error action to learn eligibility. | `DECISION.md:1093-1094` | `OB-U03`; `LAND-NEWLY` |
| `OB-U08-A` | Undo is non-optimistic: card/source stay visible and locked until rollback success. | `DECISION.md:1112-1113` | `OB-U08`; `LAND-NEWLY`, `VQ-10` |
| `OB-U08-B` | Dexie/BaaS rollback removes result and restores source/candidate atomically with no partial success. | `DECISION.md:1114-1116` | `OB-U08`; `LAND-SCHEMA-OP` |
| `OB-U08-C` | Failure preserves state and Retry; ambiguity reconciles operation/result/source before resend and converges to success/non-execution/conflict. | `DECISION.md:1117-1119` | `OB-U08`; `LAND-SCHEMA-OP`, `VQ-10` |
| `OB-U08-D` | Dirty editor holds Undo as one save-before-action intent and revalidates eligibility after Save; failure/conflict/ineligibility prevents Undo. | `DECISION.md:1120-1122` | `OB-U08`; `LAND-BREAKDOWN`, `LAND-NEWLY` |
| `OB-U08-E` | Running Undo locks Scratch switch/placement/Archive/route exit and uses native unload for browser exit. | `DECISION.md:1123-1124` | `OB-U08`; `LAND-SESSION` |
| `OB-A01-A` | Archive eligibility requires an existing active selected Scratch. | `DECISION.md:1130-1132` | `OB-A01`; `LAND-ARCHIVE` |
| `OB-A01-B` | Archive eligibility requires at least one durable consumed row. | `DECISION.md:1130-1133` | `OB-A01`; `LAND-ARCHIVE` |
| `OB-A01-C` | Archive eligibility requires every Breakdown row consumed. | `DECISION.md:1130-1134` | `OB-A01`; `LAND-ARCHIVE` |
| `OB-A01-D` | Archive eligibility requires zero staged Node/Bit candidates. | `DECISION.md:1130-1135` | `OB-A01`; `LAND-SCHEMA-CANDIDATE`, `LAND-ARCHIVE` |
| `OB-A10-A` | Completion Cancel closes the overlay. | `DECISION.md:1187` | `OB-A10`; `LAND-ARCHIVE` |
| `OB-A10-B` | Completion Cancel changes Context to theme-specific `Scratch complete`. | `DECISION.md:1188` | `OB-A10`; `LAND-BREAKDOWN` |
| `OB-A10-C` | Completion Cancel exposes a Breakdown-local reopen control. | `DECISION.md:1189` | `OB-A10`; `LAND-BREAKDOWN` |
| `OB-A10-D` | Existing Add is immediately usable after Cancel; no Continue Breakdown/unlock step is added. | `DECISION.md:1190-1191` | `OB-A10`; `LAND-BREAKDOWN` |
| `OB-A10-E` | Persisted new row withdraws completion; typing draft alone uses the blocker without changing persisted completion. | `DECISION.md:1192-1195` | `OB-A10`; `LAND-BREAKDOWN`, `VQ-11` |
| `OB-A10-F` | Reopen presents the same section-scoped archive overlay. | `DECISION.md:1196` | `OB-A10`; `LAND-ARCHIVE` |
| `OB-A13-A` | Pre-mutation Scratch switch closes only the overlay and defers, rather than cancels/writes Archive. | `DECISION.md:1200-1201` | `OB-A13`; `LAND-SESSION` |
| `OB-A13-B` | Returning in-session restores complete Context/reopen without auto-opening overlay. | `DECISION.md:1202-1204` | `OB-A13`; `LAND-SESSION` |
| `OB-A13-C` | If eligibility changed while away, return shows latest ordinary work state, not stale completion. | `DECISION.md:1205-1206` | `OB-A13`; `LAND-ARCHIVE` |
| `OB-A13-D` | Scratch switching writes no archive/dismissal flag and is disallowed while Archive is pending/reconciling. | `DECISION.md:1207-1209` | `OB-A13`; `NEG-17`, `LAND-SCHEMA-OP` |
| `OB-A15-A` | Archive Confirm sets selected Scratch `archivedAt`. | `DECISION.md:1220` | `OB-A15`; `LAND-ARCHIVE` |
| `OB-A15-B` | Archived Scratch leaves active Inbox/Pool only after confirmed success. | `DECISION.md:1221`, `1227-1228` | `OB-A15`; `LAND-POOL` |
| `OB-A15-C` | Inbox Archive is not hard delete and preserves Archive View restore policy. | `DECISION.md:1222` | `OB-A15`; `LAND-ARCHIVE` |
| `OB-A16-A` | Archive is operation-ID idempotent and atomically revalidates eligibility/latest state plus writes `archivedAt`; BaaS preserves it conditionally. | `DECISION.md:1223-1226` | `OB-A16`; `LAND-SCHEMA-OP` |
| `OB-A16-B` | Archive pending remains in the existing Breakdown overlay and never removes/selects early. | `DECISION.md:1227-1228` | `OB-A16`; `LAND-ARCHIVE`, `VQ-12` |
| `OB-A16-C` | Pending locks duplicate Confirm, Cancel/Escape, Undo, Edit, Placement, Scratch/route navigation and uses native unload. | `DECISION.md:1229-1230` | `OB-A16`; `LAND-SESSION`, `LAND-SCHEMA-OP` |
| `OB-A16-D` | Pending/reconciling keeps focus inside overlay on a stable status/current-action target. | `DECISION.md:1231-1232` | `OB-A16`; `LAND-A11Y`, `VQ-12` |
| `OB-A17-A` | Explicit/offline Archive failure preserves active Scratch and offers in-overlay Retry/Cancel with no automatic retry. | `DECISION.md:1233-1234` | `OB-A17`; `LAND-ARCHIVE`, `VQ-12` |
| `OB-A17-B` | Ambiguous Archive queries operation ID plus latest `archivedAt`; only confirmed success removes, confirmed non-execution enables Retry/Cancel. | `DECISION.md:1235-1237` | `OB-A17`; `LAND-SCHEMA-OP` |
| `OB-A17-C` | Forced reload reconciles before initial screen and converges to removed, completion/reopen, or recovery overlay. | `DECISION.md:1238-1240` | `OB-A17`; `LAND-SCHEMA-OP`, `VQ-12` |
| `OB-A17-D` | Unknown result retains reconciling and starts no new operation or heuristic resend. | `DECISION.md:1241-1243` | `OB-A17`; `LAND-SCHEMA-OP` |
| `OB-A17-E` | Archive statuses are visible/live; failure focuses Retry and success explicitly focuses confirmed destination. | `DECISION.md:1244-1246` | `OB-A17`; `LAND-A11Y`, `VQ-12` |
| `OB-A18-A` | Archive success preserves current search/sort/visible order, selects next then previous, and focuses selected Context. | `DECISION.md:1247-1249` | `OB-A18`; `LAND-POOL`, `LAND-A11Y` |
| `OB-A18-B` | Archiving the last filtered result keeps query/no-selection/no-results, selects no hidden Scratch, and focuses search input/clear. | `DECISION.md:1250-1252` | `OB-A18`; `LAND-POOL`, `LAND-A11Y` |
| `OB-A18-C` | With no search and no active Scratch, show true Inbox empty/focus its primary action and do not navigate Archive View/reselect. | `DECISION.md:1253-1255` | `OB-A18`; `LAND-POOL`, `LAND-A11Y` |

## 5. Independent Production Inventory

This inventory was built from the production baseline before comparing it to
the Design Source.

### 5.1 User-observable production controls, states, and surfaces

| Production item | Current reality | Evidence |
|---|---|---|
| System-node dispatch | Inbox remains `/grid/[nodeId]`; `GridRuntime` dispatches to `TriageWorkspace` | `docs/SPEC.md:70`, `100`; `src/components/layout/grid-runtime.tsx:69-72`, `408-416` |
| Workspace shell | Four regions with `60/40`, `60/40`, and `35/65`, but anonymous top spacers instead of visible headers | `src/components/triage/triage-workspace.tsx:131-208` |
| Scratch Pool expanded | Identity/count/toggle row, search+sort row, Scratch list, empty/no-match states | `src/components/triage/scratch-pool.tsx:164-283` |
| Scratch Pool collapsed | Expand control, Inbox/count, vertical no-text Scratch pills | `src/components/triage/scratch-pool.tsx:286-368` |
| Pool state | Search/sort are component-local; selection/pool/manual-reopen are Zustand; selection begins null | `src/components/triage/scratch-pool.tsx:87-118`; `src/stores/triage-store.ts:12-47` |
| Current first-key behavior | Printable Breakdown key collapses Pool; selection/focus alone does not | `src/components/triage/breakdown-panel.tsx:258-266`, `296-320` |
| No-selection Breakdown | Text prompt asks user to select a Scratch | `src/components/triage/breakdown-panel.tsx:335-343` |
| Selected Context | Compact one-line-ish strip with title/time only | `src/components/triage/breakdown-panel.tsx:345-366` |
| Breakdown rows | Grip-only drag, content, visible time, Trash; consumed rows remain struck through; staged rows dim | `src/components/triage/breakdown-panel.tsx:38-129` |
| Breakdown Add | Click-to-open input; Enter adds and keeps focus; blur currently submits; Escape discards; maxLength is 500 | `src/components/triage/breakdown-panel.tsx:268-321`, `386-416` |
| Row Delete | Global AlertDialog then direct delete; no pending row presentation or reconciliation | `src/components/triage/breakdown-panel.tsx:329-333`, `418-443` |
| Archive Scratch | Bottom Archive bar plus global AlertDialog; clears selection after `archiveBit` | `src/components/triage/breakdown-panel.tsx:131-208`; `src/hooks/use-archive-scratch.ts:1-12` |
| Archive eligibility | Requires nonempty all-consumed rows and no in-memory staged candidates | `src/hooks/use-can-archive-scratch.ts:6-14` |
| Staging zones | Node grid, Bit list, explicit large empty placeholders, valid/invalid/pending classes | `src/components/triage/staging-zone.tsx:20-171`, `252-278` |
| Candidate cards | Whole Node/Bit card surface is draggable and candidates display copied `label` | `src/components/triage/staging-zone.tsx:173-250` |
| Candidate storage | Zustand-only record keyed by Scratch, with label snapshot and no durable lifecycle/version | `src/stores/triage-store.ts:5-76` |
| Drag preview | Shared compact token, pointer-centered modifier, Mouse/Touch activation constraints | `src/components/triage/triage-workspace.tsx:33-69`, `196-198`; `src/components/triage/triage-drag-token.tsx:11-43`; `src/hooks/use-dnd.ts:156-163` |
| Unstage | Staging-bottom removal drop target appears during staged drag; no Breakdown-wide drop-back | `src/components/triage/triage-workspace.tsx:71-106`, `189-193` |
| Explorer baseline | Four columns, current-path local state, active/deepest-section title filtering and persistent scope indicator | `src/components/triage/hierarchy-explorer.tsx:99-183`, `300-465` |
| Explorer column labels | `Home/L1/L2/L3` plus repeated selected title | `src/components/triage/hierarchy-explorer.tsx:349-463`, `469-528` |
| Explorer items | Node rows selectable/drop targets; Bits are passive context rows | `src/components/triage/hierarchy-explorer.tsx:530-692` |
| Explorer drop states | Default, idle-valid, valid, pending-confirmation pulse, invalid | `src/components/triage/hierarchy-explorer.tsx:21-42`, `79-97` |
| Placement | One global Dialog combines direct type choice and confirmation; staged/direct creation then `consumedAt` are sequential, non-atomic writes | `src/components/triage/triage-workspace.tsx:223-480`; `src/hooks/use-dnd.ts:203-380` |
| Full target | Dialog warning and disabled Confirm; occupancy rechecked on confirm | `src/components/triage/triage-workspace.tsx:251-254`, `328-337`; `src/hooks/use-dnd.ts:308-325` |
| Actual result | DataStore creates real Node/Bit, so it enters reactive Grid data; there is no newly-placed/Undo state | `src/hooks/use-dnd.ts:336-376` |
| Breakdown data | Dedicated durable `scratchBreakdowns`; no version field; update is read then put, not compare-and-set | `src/lib/db/schema.ts:77-95`; `src/lib/db/indexeddb.ts:832-903` |
| Scratch data | Scratch is a Bit in Inbox and remains reactive/archivable/restorable | `docs/SCHEMA.md:116-120`, `431-433`; `src/hooks/use-inbox.ts:85-149` |
| Theme axes | Production has dark/light plus eight color themes through shared variables/classes | `docs/SPEC.md:60`, `74-76`; `docs/DESIGN_TOKENS.md:219-314` |

### 5.2 Tempting adjacent production capabilities

These are inventory entries, not automatically approved landings.

| Adjacent capability | Existing contract | Product disposition |
|---|---|---|
| Global Search overlay and `searchAll()` | Searches Nodes/Bits/Chunks and navigates ordinary routes | Retain globally; forbidden as Explorer-search fallback because it lacks selected traversal/exclusion/ranking/reveal contract (`src/hooks/use-search.ts:6-88`; `src/components/layout/search-overlay.tsx:25-169`) |
| Main-grid KeyboardSensor | Main DnD includes sortable keyboard coordinates | Retain for main Grid; forbidden as evidence/automatic implementation for triage placement, which is explicitly pointer-only (`src/hooks/use-dnd.ts:399-430`) |
| Main NodeCard/BitCard | Real persistent cards with navigation, menu/archive, urgency/completion state | Retain as actual placement-result base; do not treat current cross-route card appearance as direct visual authority for missing Inbox replacement states (`src/components/grid/node-card.tsx:21-105`; `src/components/grid/bit-card.tsx:21-215`) |
| Generic Dialog/AlertDialog | Existing accessible primitives and move/delete confirmations | Reuse as primitives only where the selected surface contract permits; not an automatic visual fallback for column-scoped placement, inline conflict, Result Title, or external-removal designs |
| Sonner toast | Existing global feedback mechanism | Retain elsewhere; do not replace selected Staging-local failure feedback until the separate toast direction executes |
| Direct archive context menu | Generic non-system Node/Bit archive | Retain for ordinary Grid items; Scratch completion remains the selected Breakdown-scoped archive flow |
| Archive View restore | Restores archived items with existing lifecycle/BFS rules | Retain unchanged as the destination/restore owner for archived Scratch |
| Color-theme/local preference stores | Existing persistence pattern for a selected user preference | Reuse pattern only for the two selected sort preferences; never broaden it to session selection/drafts/path |

## 6. Independent Design Source Inventory

### 6.1 Source-only structural and visual inventory

All eight routes contain a populated four-area mock workspace; visible themed
section identity; expanded/collapsed Scratch UI; a large Selected Scratch
Context; Breakdown rows/actions; Node/Bit staging; a four-column explorer;
direct/staged placement affordances; newly-placed actual-card-like rows with
Undo; and section-scoped archive completion presentation. The exact selected
source regions are in §11.2.

Theme roles observed in source (not rendered in this pass) are:

| Theme | Source-only visual role | Shared token region |
|---|---|---|
| GridDO | polished product/dashboard/ticket grammar with blue technical state markers | Route source; no separate selected shared-source GridDO override block |
| Tiny Desk | wood, paper, stationery, `Library Index` | Design Source `themes.css:1-46` plus route |
| Neumorphism | raised/inset soft plates and shadow-led depth | `themes.css:47-112` plus route |
| Claymorphism | puffy tactile surfaces and soft 3D wells | `themes.css:113-253` plus route |
| Origami | faceted paper/fold geometry | `themes.css:254-297` plus route |
| Terminal | console frames and `GRID EXPLORER` | `themes.css:298-347` plus route |
| Retro Mac | 1-bit windows/controls and `Finder` | `themes.css:348-395` plus route |
| Graphite | editorial/drafting lines and restrained grayscale | `themes.css:396-439` plus route |

### 6.2 Prototype-functional controls and states

The route source implements local interactions for Scratch selection,
search/sort/collapse, mock Breakdown addition, mock stage/unstage, path
navigation, active-column search, native drag/drop feedback, mock placement,
mock newly-placed/Undo, and mock archive removal. These interactions are
`prototype-functional` only: they corroborate visual sequences but acquire
product meaning solely from the selected decision.

### 6.3 Mock-only and review mechanics

| Prototype mechanism | Classification | Disposition |
|---|---|---|
| Per-route `scratches`, `ideas`, candidate maps, `placedItemsByScratch` | mock-only | Skip implementation; reimplement against production data/repositories |
| Local `triagedScratches` completion latch | mock-only | Skip; eligibility derives from durable consumed rows + durable candidates |
| Candidate label snapshots | mock-only | Skip; production derives from authoritative source row |
| Sequential/local placement and Undo mutations | mock-only | Skip; production uses atomic idempotent operations |
| `poolLock` + `scratch-pool-fold-lock` localStorage listener | prototype review mechanic | Remove; no production replacement |
| `activeEmptyVariant` / `activeScratchContextVariant` and variant comments | prototype review mechanic | Skip selection UI/history; only the final source region may inform source-only extraction |
| Per-theme internal candidate grip handles | prototype detail | Remove; production whole-card drag + compact overlay is retained |
| Prototype keyboard-grab/drop handlers present in some routes | prototype exploration | Remove from this promotion; not product behavior |
| Breakdown-focus collapse handlers | prototype behavior conflict | Remove; production first-printable-key behavior is retained |
| Scratch-switch reset of newly placed | prototype behavior conflict | Remove; page-session marker survives Scratch switch |
| `animate-pulse`/repeating markers | prototype visual conflict | Remove from adopted newly-placed/warning/completion recipes |
| Route-specific magic values and duplicated markup | prototype architecture | Visual facts may be extracted; code/architecture is never reused |

No prototype route or shared source establishes actual persistence,
concurrency, idempotency, server/repository authority, external mutation,
reload reconciliation, or production accessibility behavior.

## 7. Main-Only Behavior Disposition

Prototype omission is not removal authority. Every relevant production-only
behavior receives an explicit disposition and placement rationale.

| Main-only behavior | Disposition | Exact production placement rationale |
|---|---|---|
| `/grid/[nodeId]` system-role dispatch | Retain | `GridRuntime` remains route owner; the redesign replaces only the rendered Inbox body, not routing |
| Reactive hooks + DataStore write boundary | Retain | New candidate/search/operation owners must obey existing two-layer architecture; prototype local arrays cannot replace it |
| Scratch as Inbox-parented Bit and breakdowns as dedicated durable records | Retain | These are actual lifecycle sources; amend with version/candidate/operation prerequisites rather than create prototype types |
| First-printable-key collapse and manual-reopen exception | Retain | Already matches selected authority; keep in Breakdown input lifecycle rather than prototype focus handler |
| Compact pointer-centered triage drag token and Mouse/Touch constraints | Retain | Already owns production drag preview/input semantics; route-specific native snapshots/handles are removed |
| Grip-only Breakdown drag | Retain | Stays on row grip; selected whole-card drag applies only to staged candidates |
| Actual DataStore Node/Bit creation + BFS occupancy | Reintegrate | Move into one placement transaction with source/candidate/target revalidation; do not leave sequential writes in `use-dnd.ts` |
| Current full-target warning | Reintegrate | Keep in target-column placement affordance, with confirm disabled and no fallback target |
| Current global placement Dialog | Remove from triage placement; retain unrelated dialogs | Replace combined/full-screen triage flow with direct-type → optional Result Title → column-scoped placement owners |
| Active-column Explorer search | Remove | Selected full-hierarchy replacement mode supersedes it; current implementation cannot remain as hidden fallback |
| Global app Search | Retain separately | Its Node/Bit/Chunk + route-navigation contract is unrelated and must not be extended for Explorer |
| Compact Selected Context | Remove | Superseded by standalone signature Context in the same Breakdown placement |
| Consumed line-through row | Remove | Consumed rows leave active list; durable consumed data remains queryable for eligibility/Undo |
| Visible Breakdown row time | Remove | Selected rows omit time; Scratch Pool row time is retained independently |
| Add-on-blur submission | Remove | Blur retains draft; only Enter/explicit Add creates |
| Existing row Delete confirmation | Reintegrate | Keep confirmation entry but add in-place pending/reconcile/focus lifecycle |
| Zustand-only staged candidates | Remove | Replace with reactive durable candidate repository; `triage-store` retains UI/session state only |
| Whole staged-card drag surface | Retain | Correct production behavior; preserve shared overlay and remove prototype internal handles |
| Large Staging empty placeholders | Remove | Selected empty Staging remains structurally quiet under visible subsection labels |
| Staging-bottom unstage target | Reintegrate | Keep as overlay and add Breakdown-section drop-back to the same command |
| Visible scrollbar chrome | Remove chrome / Retain scrolling | Apply hidden-scrollbar treatment to exact listed internal containers, preserving all input scrolling |
| Archive bottom bar + global AlertDialog | Remove from Scratch completion | Replace with Breakdown-scoped auto overlay and complete/reopen lifecycle; keep generic AlertDialog elsewhere |
| Existing archive mutation and Archive View restore | Reintegrate | Put archive eligibility/revalidation/idempotency around the existing lifecycle; restore semantics remain unchanged |
| Main NodeCard/BitCard actual records | Reintegrate | Use as placed/newly-placed base inside Explorer; add page projection/marker/Undo without a duplicate card model |
| Current common BitCard theme expression | Retain for core | The explicitly deferred eight-theme BitCard redesign must not block core placement behavior |
| Dark/light and color-theme switching | Reintegrate | Keep shared providers/tokens, adding the selected no-reset/no-blur-save Inbox state contract |
| Existing global toast capability | Retain separately | Unstage success stays silent and current failure stays Staging-local until its separate toast work |

## 8. Bilateral Semantic-Union Reconciliation

Implementation reality and product disposition are separate from visual-source
coverage. `Source absent` rows point to §9 and are excluded from extraction.
Section 6.3 is the prototype-only portion of the union and §7 is the
production-only portion; both already carry dispositions. The matrix below
reconciles shared, conflicting, and authority-selected-but-absent semantics.
Together those three sections form the complete semantic union; prototype
omission never removes a §7 production item.

| ID | Semantic item | Production evidence | Prototype evidence | Implementation reality | Product disposition | Production landing | Visual-source coverage |
|---|---|---|---|---|---|---|---|
| `R-SHELL` | Four-area ratios | Present | Present in all eight | production + prototype-functional | Retain | `LAND-THEME` / `TriageWorkspace` | Direct source regions `*-SHELL` |
| `R-CHROME` | Visible themed section identity | Anonymous production spacers | Present | prototype-functional | Adopt visual / reimplement | `LAND-THEME` | Direct source regions `*-POOL`, `*-BREAK`, `*-STAGE`, `*-GRID` |
| `R-SCROLL` | Internal scroll with hidden chrome | Scroll present, chrome not uniformly hidden | Hidden-chrome classes in routes | production + prototype-functional | Reintegrate | `LAND-POOL`, `LAND-BREAKDOWN`, `LAND-STAGING`, `LAND-EXPLORER` | Source-only direct coverage; runtime scrolling unverified |
| `R-THEME` | Eight realizations with one semantic contract | Shared production themes exist | Eight separate visual routes | production + prototype-functional | Adopt visual, reimplement shared | `LAND-THEME` | Direct source plus `themes.css`; no route reuse |
| `R-STATE` | Selected/staged/invalid/pending/new/completed distinction | Partial | Broad visual candidates | mixed | Reintegrate | `LAND-THEME` | Supported base states only; reliability/overlap gaps in §9 |
| `R-PRESENTATION` | Theme/locale no-reset | Theme switching exists; locale absent | Theme review switching only | production / prototype review | Adopt behavior / reimplement | `LAND-SESSION`, `LAND-COPY` | Behavior needs no recipe fallback; locale realization deferred |
| `R-POOL-SELECT` | Selection fallback/session lifetime | Selection starts null; no full lifecycle | First mock Scratch selected | production partial + mock-only | Reintegrate | `LAND-POOL`, `LAND-SESSION` | Pool base covered; lifecycle transition states partly absent |
| `R-POOL-EXTERNAL` | External removal countdown/copy/restore | Absent | Absent | absent | Adopt behavior / reimplement | `LAND-POOL` | **source absent — user decision prerequisite** (`VQ-01`) |
| `R-POOL-STRUCT` | Expanded tools/list/count/search/sort | Present, less cohesive | Present | production + prototype-functional | Reintegrate | `LAND-POOL` | Direct `*-POOL` regions |
| `R-POOL-COLLAPSED` | Vertical compact switching | Present | Present with theme variants | production + prototype-functional | Reintegrate | `LAND-POOL` | Direct `*-POOL` regions |
| `R-POOL-COLLAPSE` | First key/manual reopen/session | Correct first-key main; session re-entry partial | Mostly focus-collapse conflict + review lock | production | Retain/reintegrate | `LAND-SESSION` | No prototype behavior adoption; visual expanded/collapsed covered |
| `R-POOL-SEARCH` | Session search/hidden selected | Component-local only | Local mock search | production partial + prototype-functional | Reintegrate | `LAND-POOL`, `LAND-SESSION` | Search base covered; hidden-selected status not directly covered (`VQ-06`) |
| `R-CONTEXT` | Signature Context | Compact strip | Large signature surface in all themes | production + prototype-functional | Remove compact / adopt visual / reimplement | `LAND-BREAKDOWN` | Direct `*-BREAK` regions |
| `R-ROW` | Row info/actions/drag | Grip, time, Trash, no Edit | No numbering/time, Edit/Trash, grip | mixed | Reintegrate | `LAND-BREAKDOWN` | Direct `*-BREAK` regions; editor itself absent |
| `R-ROW-SORT` | created-at sort + preference | Absent | Control present; some mock sorting unreliable | prototype-functional/mock-only | Adopt behavior / reimplement | `LAND-SESSION` | Control appearance covered; exact operation from decision |
| `R-ADD` | Explicit/Enter add + signal | Enter, focus; no explicit Add; blur submits | Explicit controls and mock Add | mixed | Reintegrate | `LAND-BREAKDOWN` | Add control covered; one-shot signal absent (`VQ-02`) |
| `R-ADD-RELIABILITY` | Idempotent Add/reconcile | Absent | Absent | absent | Adopt behavior / reimplement | `LAND-SCHEMA-OP` | Feedback/source absent (`VQ-05`) |
| `R-DRAFT` | Independent draft/leave guard | Absent | Absent | absent | Adopt behavior / reimplement | `LAND-SESSION`, `LAND-BREAKDOWN` | **source absent — user decision prerequisite** (`VQ-03`) |
| `R-EDIT` | Inline Scratch/row edits | No actual editing | Visual Edit buttons, no authoritative editor | mock-only | Adopt behavior / reimplement | `LAND-BREAKDOWN` | **source absent — user decision prerequisite** (`VQ-04`) |
| `R-EDIT-RELIABILITY` | Saving/offline/reconcile | Absent | Absent | absent | Adopt behavior / reimplement | `LAND-SCHEMA-OP` | `VQ-04` |
| `R-EDIT-INTENT` | Save-before-action | Absent | Absent | absent | Adopt behavior / reimplement | `LAND-BREAKDOWN` | `VQ-04` |
| `R-CONCURRENCY` | Version/CAS/conflict/invalidation | Version absent | Absent | absent | Adopt behavior / reimplement | `LAND-SCHEMA-VERSION` | `VQ-04` |
| `R-EDIT-FOCUS` | Editor/conflict focus | Absent | Absent | absent | Adopt behavior / reimplement | `LAND-A11Y` | `VQ-04` |
| `R-ROW-LIFECYCLE` | Active/staged/consumed | Production staged dim + consumed strike | Staged dim + placed filtered | mixed | Reintegrate; remove strike | `LAND-BREAKDOWN` | Direct base states; reliability states absent |
| `R-ROW-DELETE` | In-place idempotent delete | Dialog + immediate removal | Local mock removal | production partial + mock-only | Reintegrate | `LAND-SCHEMA-OP` | **source absent — user decision prerequisite** (`VQ-05`) |
| `R-EMPTY` | Never-had/deleted/consumed prompts | Limited | Theme empty/completion source branches | mixed | Reintegrate | `LAND-BREAKDOWN` | Source-only coverage; selected route source was populated and empty-state rendering remains unverified |
| `R-STAGE` | Labels/Node-grid/Bit-list/no placeholders | Shapes present, headings absent, placeholders present | Shapes + headings | production + prototype-functional | Reintegrate | `LAND-STAGING` | Direct `*-STAGE` regions |
| `R-STAGE-LIST` | Sort/count/internal scroll | Array order, no count/remote | Local arrays + scroll | mixed | Adopt behavior / reimplement | `LAND-STAGING` | Base lists covered; remote indicator absent (`VQ-06`) |
| `R-STAGE-DRAG` | Whole-card + compact token | Present | Many routes use internal handles/native snapshots | production | Retain main | `LAND-STAGING` | Prototype handles explicitly excluded |
| `R-CANDIDATE-DATA` | Durable synchronized candidates | Zustand-only label snapshot | Local mock maps | mock-only/absent | Adopt behavior / reimplement | `LAND-SCHEMA-CANDIDATE` | No visual authority needed for data; orphan alert in `VQ-06` |
| `R-CANDIDATE-UNIQUE` | One candidate/source, restage after unstage | Not enforced authoritatively | Local arrays | absent/mock-only | Adopt behavior / reimplement | `LAND-SCHEMA-CANDIDATE` | No separate visual fallback |
| `R-CANDIDATE-GUARD` | Staged source mutation guard | UI dim only | Mock disabled action | prototype-functional only | Adopt behavior / reimplement | `LAND-SCHEMA-CANDIDATE` | Staged disabled base covered; stale rejection feedback `VQ-06` |
| `R-UNSTAGE` | Dedicated + Breakdown drop-back | Dedicated only | Both concepts in source | mixed | Reintegrate | `LAND-STAGING` | Direct Staging/Breakdown drop signals, source-only |
| `R-STAGE-WRITE` | Pending durable stage | Instant local add | Instant mock add | absent/mock-only | Adopt behavior / reimplement | `LAND-SCHEMA-OP` | Pending/failed states `VQ-06` |
| `R-UNSTAGE-WRITE` | Confirmed unstage + alert | Instant local remove | Instant mock remove | absent/mock-only | Adopt behavior / reimplement | `LAND-SCHEMA-OP` | Failure alert `VQ-06` |
| `R-STAGE-NAV` | Pending operation nav guard | Absent | Absent | absent | Adopt behavior / reimplement | `LAND-SESSION` | Status surface `VQ-06` |
| `R-DRAG-FEEDBACK` | Invalid/drop-back/type/cancel states | Generic semantic classes | Theme-specific signals | production + prototype-functional | Adopt visual / reimplement | `LAND-THEME` | Direct source; pulse/destructive conflicts excluded |
| `R-STAGE-REMOTE` | Remote arrival/invalidation | No durable remote candidate | Absent | absent | Adopt behavior / reimplement | `LAND-STAGING` | **source absent — user decision prerequisite** (`VQ-06`) |
| `R-GRID-CONTEXT` | Scratch-shared path/search/reveal | Component-local path; switching parent does not remount immediately | Local path state | production partial + prototype-functional | Reintegrate | `LAND-SESSION` | Existing columns covered |
| `R-GRID-REENTRY` | Session re-entry/reload/focus | Unmount resets local state | No authority | absent | Adopt behavior / reimplement | `LAND-SESSION` | No new direct visual required except statuses (`VQ-06`) |
| `R-GRID-CHROME` | Full labels/path | Abbreviations/repeated selected title | Full labels/theme header | mixed | Adopt visual / reimplement | `LAND-EXPLORER` | Direct `*-GRID` regions |
| `R-GRID-SEARCH` | Full-hierarchy replacement mode | Active-column search | Active-column search | conflicting existing implementations | Remove/reimplement | `LAND-EXPLORER` | **source absent — user decision prerequisite** (`VQ-07`) |
| `R-GRID-INTERRUPT` | DnD interrupted query + search Undo | Absent | Partial local flow | absent/mock-only | Adopt behavior / reimplement | `LAND-EXPLORER`, `LAND-NEWLY` | Replacement result mode remains `VQ-07` |
| `R-GRID-REMOTE` | Live result/grid anchoring/path fallback | Reactive data but no full lifecycle | Absent | production partial | Adopt behavior / reimplement | `LAND-EXPLORER` | Status surface `VQ-06` |
| `R-PLACE-TARGET` | Hierarchy constraints | Present | Present | production + prototype-functional | Retain production semantics | `LAND-PLACEMENT` | Direct visual signals |
| `R-PLACE-SCROLL` | Edge auto-scroll/final hit test | Triage DnD autoScroll false | Some source scroll padding, no selected exact contract | absent/partial | Adopt behavior / reimplement | `LAND-EXPLORER` | Motion/runtime unverified; no recipe claim yet |
| `R-PLACE-AFFORDANCE` | Column-scoped/full-target state | Global Dialog | Column-local source affordances | mixed | Remove global/reimplement | `LAND-PLACEMENT` | Direct `*-GRID` placement regions |
| `R-PLACE-VALIDATE` | Confirm-time authority | Occupancy only | Mock-only | absent/partial | Adopt behavior / reimplement | `LAND-SCHEMA-OP` | Failure surface `VQ-08` |
| `R-PLACE-FLOW` | Separated states + nav guard | Combined Dialog | Direct/staged states separated visually | mixed | Reintegrate | `LAND-PLACEMENT` | Direct base affordances; guards/statuses `VQ-08` |
| `R-PLACE-INPUT` | Pointer-only | Triage sensors pointer-only | Some prototype keyboard mechanics | production | Retain main/remove prototype | `LAND-A11Y` | No adjacent keyboard UI fallback |
| `R-PLACE-FOCUS` | Step containment/restoration | Radix global Dialog only | Not production evidence | absent | Adopt behavior / reimplement | `LAND-A11Y` | Visual shell partly covered; focus not rendered |
| `R-PLACE-STAGED` | Staged placement flow | Combined dialog + sequential writes | Mock column affordance | mixed | Reintegrate | `LAND-PLACEMENT` | Direct base visual source |
| `R-PLACE-DIRECT` | Two-stage direct flow | Combined dialog | Two source affordances | mixed | Reintegrate | `LAND-PLACEMENT` | Direct base visual source |
| `R-PLACE-COMMIT` | Atomic/pending/retry/reconcile | Sequential, non-atomic | Mock-only | absent | Adopt behavior / reimplement | `LAND-SCHEMA-OP` | **source absent — user decision prerequisite** for reliability states (`VQ-08`) |
| `R-PLACE-TITLE` | Staged editor/direct gates | Current write can violate schema | Prototype mocks ignore limits | absent | Adopt behavior / reimplement | `LAND-PLACEMENT` | **source absent — user decision prerequisite** for Result Title (`VQ-09`) |
| `R-NEWLY` | Actual cards + marker/Undo | Actual cards, no marker/Undo | Card-like mock results + marker/Undo | mixed | Reintegrate | `LAND-NEWLY` | Direct base source; pulse excluded |
| `R-NEWLY-LIFETIME` | Local-only page-session provenance | Absent | Wrong Scratch-switch reset | absent/mock conflict | Adopt behavior / reimplement | `LAND-NEWLY` | No separate visual source needed |
| `R-NEWLY-PROJECTION` | Type pin/order/reveal | Grid order only | Mock merge | absent/mock-only | Adopt behavior / reimplement | `LAND-NEWLY` | Base card visual source only |
| `R-UNDO` | Source-aware rollback | Absent | Local mock Undo | mock-only | Adopt behavior / reimplement | `LAND-SCHEMA-OP` | Base Undo control source-only |
| `R-UNDO-ELIGIBILITY` | Dependency/reason/re-enable | Absent | Absent | absent | Adopt behavior / reimplement | `LAND-NEWLY` | **source absent — user decision prerequisite** (`VQ-10`) |
| `R-UNDO-ARCHIVE` | Locks/recalculate completion | Absent | Absent | absent | Adopt behavior / reimplement | `LAND-NEWLY`, `LAND-ARCHIVE` | State overlap `VQ-10` |
| `R-UNDO-FOCUS` | Post-Undo focus/announcement | Absent | Absent | absent | Adopt behavior / reimplement | `LAND-A11Y` | No visual fallback approved |
| `R-UNDO-COMMIT` | Atomic non-optimistic retry/reconcile | Absent | Local mock | absent/mock-only | Adopt behavior / reimplement | `LAND-SCHEMA-OP` | Reliability state `VQ-10` |
| `R-ARCHIVE-ELIGIBILITY` | Exact persisted formula | Nonempty/all consumed + in-memory candidates | Local latch shortcuts | production partial/mock conflict | Reintegrate | `LAND-ARCHIVE`, `LAND-SCHEMA-CANDIDATE` | No separate visual requirement |
| `R-ARCHIVE-BLOCKER` | Add/title blockers | Absent | Absent | absent | Adopt behavior / reimplement | `LAND-BREAKDOWN` | **source absent — user decision prerequisite** (`VQ-11`) |
| `R-ARCHIVE-OVERLAY` | First-completion section overlay | Bottom bar/global dialog | Section overlay | mixed | Remove/reimplement/adopt visual | `LAND-ARCHIVE` | Direct `*-BREAK` archive regions |
| `R-ARCHIVE-CANCEL` | Complete Context/reopen/resume | Absent | Present as local source state | prototype-functional | Adopt behavior/visual, reimplement | `LAND-ARCHIVE` | Direct source base state |
| `R-ARCHIVE-REENTRY` | Defer across switch/reentry | Absent | Absent | absent | Adopt behavior / reimplement | `LAND-SESSION` | No automatic fallback |
| `R-ARCHIVE-COMMIT` | Atomic pending/recovery | Simple archive + clear selection | Mock removal | absent/partial | Adopt behavior / reimplement | `LAND-SCHEMA-OP` | **source absent — user decision prerequisite** (`VQ-12`) |
| `R-ARCHIVE-SUCCESS` | Visible-order selection/focus | Clears selection | Mock first selection | conflicting | Remove/reimplement | `LAND-POOL` | No new direct visual required beyond empty/no-results states |
| `R-COPY-FOUNDATION` | Core English copy owner | Strings distributed across components | Route-local English strings | absent | Adopt foundation / reimplement | `LAND-COPY` | Structural prerequisite, not a locale UI fallback |
| `R-DATA-BOUNDARY` | Persistent truth vs session metadata | Partial | Local mock conflation | mixed | Reintegrate | `LAND-SCHEMA-CANDIDATE`, `LAND-SCHEMA-OP`, `LAND-SESSION` | No visual authority role |

## 9. Negative-Constraint Register

| ID | Tempting shortcut/capability | Exact mismatch | Required disposition / linked owner |
|---|---|---|---|
| `NEG-01` | Copy eight prototype routes, local states, handlers, or inline architecture | Prototype is visual evidence only; selected decision requires shared production owners (`DECISION.md:18-24`, `1276-1297`) | Skip/reimplement through `LAND-*`; routes never become production |
| `NEG-02` | Unify all themes under one generic card/panel layout | Selected themes share semantics, not identical structure/treatment (`DECISION.md:97-98`, `123-129`) | Retain shared state; adopt eight surface realizations in `LAND-THEME` |
| `NEG-03` | Keep current abbreviated Explorer labels | Selected decision forbids them and restores full level names (`DECISION.md:106-111`, `796-801`) | Remove in `LAND-EXPLORER` |
| `NEG-04` | Extend `inbox-triage-batch2-visual-recipe.md` as execution recipe | It owns superseded label removal/compact Context (`DECISION.md:31-38`, `1316-1319`) | Historical/reference-only; replace with §11 recipe set |
| `NEG-05` | Promote prototype Scratch Pool fold lock to preference | Explicitly review-only and must have no production replacement (`DECISION.md:264-265`) | Remove |
| `NEG-06` | Copy prototype staged-card internal grip/native snapshot | Selected whole-card activation + shared compact overlay conflicts (`DECISION.md:552-568`) | Remove; retain main `TriageDragToken` |
| `NEG-07` | Reuse prototype/main KeyboardSensor or add placement buttons/picker | Current promotion is explicitly Mouse/Touch pointer-only (`DECISION.md:939-948`) | Retain main-grid keyboard elsewhere; exclude triage alternative to `D-KEYBOARD` |
| `NEG-08` | Keep large Staging empty cards | Selected decision explicitly removes them (`DECISION.md:528`) | Remove from `LAND-STAGING` |
| `NEG-09` | Apply inline Edit blur-save to Add input | Add creates new records only through Enter/explicit Add (`DECISION.md:329-333`) | Remove Add-on-blur; keep valid Edit blur-save only |
| `NEG-10` | Extend active-column Explorer search or global `searchAll()` | Neither satisfies all-hierarchy traversal, exclusions, tokens, rank, ancestor reveal (`DECISION.md:811-853`, `1285-1293`) | Remove active-column mode; retain global search separately; build `LAND-EXPLORER` |
| `NEG-11` | Adopt prototype `animate-pulse`/blink for newly placed, warning, or completion | Repetition/flicker is explicitly forbidden (`DECISION.md:128-130`) | Exclude those source declarations from recipe extraction; use static/one-shot only after authority |
| `NEG-12` | Add permanent candidate unstage button | Selected flow exposes drag-time dedicated target + Breakdown drop-back only (`DECISION.md:609-626`) | Do not add; `LAND-STAGING` owns transient targets |
| `NEG-13` | Use existing toast for successful unstage or immediately move failure feedback globally | Success is silent; current error is Staging-local until separate toast work (`DECISION.md:677-693`) | Retain toast capability elsewhere; no fallback |
| `NEG-14` | Use generic Dialog/AlertDialog for inline Edit/conflict | Selected editors/conflicts remain in Context/row surfaces (`DECISION.md:363-443`) | No automatic fallback; `VQ-04` |
| `NEG-15` | Auto-unstage or cascade candidate when staged source is edited/deleted | Repository must reject mutation and preserve authoritative staged state (`DECISION.md:601-608`) | Block in `LAND-SCHEMA-CANDIDATE` |
| `NEG-16` | Use a page-lifetime Set or label equality for uniqueness | Stable `sourceBreakdownId` and authoritative mutation boundary own uniqueness (`DECISION.md:593-632`) | Remove guard shortcut; add schema constraint |
| `NEG-17` | Persist session selection, query, draft, path, overlay, or newly-placed state because localStorage exists | Decision assigns exact distinct lifetimes; only two sort preferences cross reload (`DECISION.md:163-165`, `251-278`, `309-313`, `782-790`, `1061-1063`, `1210-1216`) | `LAND-SESSION` must separate lifetimes |
| `NEG-18` | Auto-select an alternate placement target or perform partial/best-effort writes | Full/stale target requires disabled/no-write/cancel and exact revalidation (`DECISION.md:907-926`) | Prohibit in `LAND-PLACEMENT`/`LAND-SCHEMA-OP` |
| `NEG-19` | Treat mtime as edit concurrency token | Selected decision requires monotonic version; current mtime/update lacks CAS (`DECISION.md:412-456`) | `LAND-SCHEMA-VERSION` |
| `NEG-20` | Treat prototype mock mutation success as lifecycle or persistence evidence | Timers/local arrays cannot imply commit/reconciliation (`DECISION.md:988-1010`, `1218-1246`) | Reimplement operation authority in repository |
| `NEG-21` | Use surrounding theme chrome, main global search, legacy active-column view, current cards, or generic dialogs as visual fallback for an unsupported replacement region | Visual intake requires direct coverage for each distinct replacement surface/mode | Every §9.1 gap remains excluded until its user decision |

### 9.1 Direct visual-authority gaps — consolidated user-decision queue

For every row below the disposition is exactly
**source absent — user decision prerequisite**. Adjacent UI named in the last
column is prohibited as an automatic fallback, and the unsupported region is
excluded from all recipe extraction until the user supplies visual authority
or explicitly scopes the region out/deferred.

| ID | Unsupported user-facing realization | Product authority remains selected | Visual-source disposition | Adjacent UI that is not an approved fallback | Owner / resume condition |
|---|---|---|---|---|---|
| `VQ-01` | External Scratch removal modal: lifecycle copy, countdown/pause, multi-draft copy/status, destination changes, restore | `DECISION.md:169-210` | **source absent — user decision prerequisite** | Generic Dialog, Archive dialog, Pool chrome | User; resume recipe/planning for this surface after a source/realization decision or explicit visual scope-out |
| `VQ-02` | Theme-specific one-shot Add/Unstage success signal and reduced-motion static alternative | `DECISION.md:318-324`, `674-676` | **source absent — user decision prerequisite** | Prototype repeated pulse, generic toast, newly-placed marker | User; decide exact source/effect or explicitly scope visual extraction out |
| `VQ-03` | Add-draft departure confirmation and its coexistence/order with inline Edit | `DECISION.md:342-351` | **source absent — user decision prerequisite** | Generic delete/archive confirmation, browser native unload UI | User; supply/choose app-internal realization or scope it out; native unload remains only the browser-exit behavior |
| `VQ-04` | Scratch/row inline editor, saving/offline/conflict/lifecycle-invalid/copy states | `DECISION.md:363-465` | **source absent — user decision prerequisite** | Prototype no-op Edit buttons, generic Dialog/AlertDialog, compact Context | User; resolve direct visual/content realization before related recipe extraction |
| `VQ-05` | Add/delete pending/reconciling/failure/in-place deleting statuses and focus-visible action states | `DECISION.md:326-361`, `467-510` | **source absent — user decision prerequisite** | Prototype instant mutation, global toast, generic placeholder row | User; approve direct realization or explicitly exclude these states from visual promotion |
| `VQ-06` | Pool hidden-selection status; Staging remote-arrival/orphan/stale/pending/failure alerts; Grid remote/path statuses | `DECISION.md:274-276`, `537-546`, `580-589`, `634-750`, `872-885` | **source absent — user decision prerequisite** | Existing global toast/search indicator, surrounding section header | User; resolve each section-local status family or explicitly scope it out |
| `VQ-07` | Full-hierarchy Explorer replacement search mode: pre-search/results/loading/error/duplicates/reveal/Undo feedback | `DECISION.md:796-870` | **source absent — user decision prerequisite** | Prototype/main active-column search, global SearchOverlay, ordinary four-column chrome | User; direct visual-source decision required; entire replacement body excluded from Grid Explorer recipe until resolved |
| `VQ-08` | Placement pending/reconciling/failure/Retry and stale-source/target states beyond base affordances | `DECISION.md:913-1010` | **source absent — user decision prerequisite** | Global placement Dialog, generic AlertDialog/toast, prototype instant confirmation | User; decide direct reliability-state realization or scope those states out |
| `VQ-09` | Over-limit staged Result Title modal and direct unavailable-limit content states | `DECISION.md:1012-1030` | **source absent — user decision prerequisite** | Create Node/Bit dialogs, generic placement Dialog, prototype type chooser | User; decide direct source/realization; Result Title region excluded |
| `VQ-10` | Selected+newly-placed overlap, ineligible Undo reasons, dependency recovery, undoing/retry/conflict states | `DECISION.md:1032-1124` | **source absent — user decision prerequisite** | Current main card menu, prototype pulse marker, disabled generic button treatment | User; base marker/control may be extracted, but these unsupported states remain excluded |
| `VQ-11` | Completion blockers for Add draft/title editor and why-completion-was-withdrawn status | `DECISION.md:1141-1167` | **source absent — user decision prerequisite** | Empty prompt, archive overlay, generic validation toast | User; decide direct section-local realization or scope it out |
| `VQ-12` | Archive pending/reconciling/failure/reload-recovery overlay variants | `DECISION.md:1218-1246` | **source absent — user decision prerequisite** | Prototype instant mock archive, production global AlertDialog, generic spinner/toast | User; base archive overlay is sourced, reliability variants are excluded |

## 10. Consolidated Questions, Deferrals, And Follow-Up

No active product-policy question remains in the selected decision
(`DECISION.md:1339-1347`). This map does not reopen those settled behaviors.
The queue below distinguishes unresolved visual authority, implementation-shape
naming, selected deferrals, and non-blocking follow-up.

### 10.1 Unresolved authority

- `VQ-01` through `VQ-12` are user-owned visual/content realization decisions.
  They block only their named recipe regions and any implementation that would
  silently decide those visuals. Data/behavior work may proceed later only if
  it does not make those choices implicitly.
- Section 15's whole-map gate governs all pre-approval progression. The
  per-region scope above describes the residual constraint after the user has
  explicitly scoped a `VQ-*` region out; it does not permit any recipe,
  canonical, planning, or implementation write before map approval.

#### Proposed gate disposition for the visual-source gaps

This disposition records how a scope-out remains actionable instead of
silently transferring visual authority to an implementer. It remains Proposed
until the user approves this exact map artifact.

| Class | Included gaps | Proposed disposition at this gate | Required downstream owner / lock |
|---|---|---|---|
| Existing-surface state realization | `VQ-02`, `VQ-05`, `VQ-06`, `VQ-08`, `VQ-10`, `VQ-11`, `VQ-12` | Keep every selected behavior and state. Canonicalize one shared semantic-state envelope using state attributes, existing semantic/theme tokens, visible text or icon/non-color cues, and the selected accessibility/focus contract. Do not claim or extract unsupported per-theme values. | `DESIGN_TOKENS.md`, the owning surface recipe, and the owning execution phase. Any exact effect, duration, copy, or placement not derivable from approved authority becomes a named non-code `Decision prerequisite`; its dependent implementation task remains blocked. |
| Absent replacement surface | `VQ-01`, `VQ-03`, `VQ-04`, `VQ-07`, `VQ-09` | Keep the product behavior, but explicitly scope the unsupported surface out of current recipe extraction. Do not substitute a nearby dialog, editor, card, search view, or theme chrome. | The owning execution phase must contain a named non-code `Decision prerequisite` for the missing realization. No dependent UI implementation task may start until that decision has a matching user receipt. |

For `VQ-02`, the shared success-state envelope may be documented, but the
exact theme effect and timing remain a Decision prerequisite because the
selected decision assigns them to the visual recipe and no selected source
supplies them. The same rule applies to exact copy or placement details inside
the other existing-surface state gaps: shared tokens do not authorize an
invented layout.

### 10.2 Phase-local naming / structural shape

These do not reopen selected product behavior, but downstream canonical
derivation must name them explicitly before code-ready planning:

| ID | Phase-local question | Owner | Resume condition |
|---|---|---|---|
| `Q-NAME-01` | Exact staged-candidate entity/store/type and lifecycle enum names | Future SCHEMA/SPEC editor | Canonical schema defines names preserving every `OB-S11`–`OB-S24` contract |
| `Q-NAME-02` | Exact operation-result/idempotency representation for Dexie and future BaaS; leaving this representation open does not preselect a separate operation-log, journal store, or table | Future SCHEMA/SPEC editor | Canonical data contract first tests stable target IDs and authoritative postconditions, supports atomic retry/reconcile/reload requirements, and adopts a separate log only if those contracts require it |
| `Q-NAME-03` | Exact component split for Explorer query/hook/result body and placement state machine | Future SPEC/planner | Owners satisfy `LAND-EXPLORER`/`LAND-PLACEMENT` and remain derivable under file conventions |
| `Q-NAME-04` | Exact Inbox copy/resource module name | Future SPEC/planner | One core-English owner is canonical before user-facing copy tasks |
| `Q-NAME-05` | Exact fields/nullability, lifecycle/version/timestamp representation, unique and lookup indexes, and schema-version migration/backfill/default shape | Future SCHEMA editor | Reconcile the proposed shape against current `src/lib/db/schema.ts`, `src/lib/db/datastore.ts`, and `src/lib/db/indexeddb.ts`, including existing `bits` and `scratchBreakdowns` version migration, before canonical approval |

### 10.3 Deferred work (selected, not blocking core)

| ID | Deferred item | Authority | Storage / future landing |
|---|---|---|---|
| `D-CARD` | Common BitCard eight-theme redesign, then Staging/placed reuse and final Korean QA | `DECISION.md:58-67`, `1269-1270`, `1336` | Future brainstorming/approved execution work; no current recipe fallback |
| `D-LOCALE` | Shared locale provider/resources, EN/KR toggle, localized date/status/a11y, Korean type/text fit | `DECISION.md:62`, `1257-1274` | Future canonical amendment; core `LAND-COPY` foundation remains in scope |
| `D-LENS` | Neumorphism ASC/DESC water-lens polish | `DECISION.md:63`, `1337` | Future visual exploration; **source absent — user decision prerequisite**; excluded now |
| `D-KEYBOARD` | Keyboard/drag-alternative placement entry | `DECISION.md:939-948`, `1345-1347` | Future accessibility brainstorming; no placeholder command now |
| `D-TEXT` | Cross-surface line count, wrap/ellipsis/expansion, editor IME detail | `DECISION.md:1273-1274` | Remains with the named separate topic; not silently decided here |

### 10.4 Non-blocking follow-up

- Move the temporary Staging-local unstage failure alert to a workspace-context
  error toast only when its separate approved direction executes
  (`DECISION.md:680-693`).
- Remote/BaaS presentation polish is not a core blocker, but the data and
  operation contracts must preserve the selected multi-session semantics
  (`DECISION.md:1339-1347`).

## 11. Canonical Edit Plan And Recipe Proposal

No row below is authorized to start until map approval. `Proposed` means an
exact future landing, not a current edit.

### 11.1 Canonical edit plan

| Target | Exact future landing region | Proposed action | Status | Skip/defer condition |
|---|---|---|---|---|
| `docs/SCHEMA.md` | Object Stores → `bits`, `scratchBreakdowns`, new staged-candidate/operation ownership; Zod Schemas; Application Hooks; Key Queries | Add monotonic concurrency, durable candidate, uniqueness, atomic/idempotent/reconciliation contracts; preserve no-durable newly-placed/draft/session metadata | Proposed | No skip: selected behavior requires structural prerequisites. Exact names and shapes remain `Q-NAME-01/02/05` |
| `docs/SPEC.md` | Architecture Decisions 15/16/18; System Node Routing; entire Inbox/Triage Workspace section; File Organization; Key File Paths | Replace superseded label/context/search/placement/archive rules; add state lifetimes, dedicated search, durable candidate, operation, focus, and copy boundaries | Proposed | No skip for core; explicit deferrals remain §10.3 |
| `docs/DESIGN_TOKENS.md` | Intentional Departures; Theme Variable Groups / Required Theme Classes; Inbox/Triage surface contract; Motion Language; Surface Recipes index | Replace label-removal/compact-context contract; add the approved shared state envelope and semantic token implications; link nine new recipes and navigation index; record pulse exclusions | Proposed | Existing-surface gaps may own only the shared envelope; unsupported exact values/effects/layout remain Decision prerequisites. Absent replacement surfaces stay out. |
| `docs/recipes/inbox-triage-batch2-visual-recipe.md` | Whole file status/header only, if project process permits historical marker | Mark superseded/reference-only; do not expand as direct execution recipe | Proposed | If historical files are immutable by project policy, leave unchanged and record supersession only in new index/canonical references |
| Nine new surface recipes | Exact paths in §11.3 | Extract source-only supported facts with eight realization sections, observations versus adopted facts, token implications, and exclusions | Proposed | Do not create before map approval. Existing-surface gaps may record the approved shared semantic-state envelope without inventing theme values; absent replacement surfaces and unresolved exact details remain excluded. |
| `docs/recipes/inbox-triage-visual-recipe-index.md` | New navigation artifact | Map source region → surface → theme → production owner → future task; no product/canonical authority | Proposed | Do not create before map approval |
| `docs/EXECUTION_PLAN.md` | Phase Index, current open Phase 23-33 / Tasks 101-154, Next Numbers, and Cross-Cutting Concerns | After canonical approvals, re-derive the complete implementation plan and explicitly reconcile, amend, or supersede the existing open Phase 23-33 / Tasks 101-154; do not create a duplicate Phase 23. Until that plan receives its own approval, preserve current numbering, open status, and acceptance state unchanged | Proposed | An unresolved `VQ-*` may appear only as a named non-code `Decision prerequisite` with owner, resume condition, and dependency edge; no dependent implementation task may start first. Resolve `Q-NAME-*` during canonical derivation; selected deferred work stays out. |
| `docs/PLANNING_STANDARD.md` | §6 Architecture Conformance Checklist and user-visible verification guidance | Add reusable checks for durable candidates, CAS, atomic operations, dedicated Explorer search, semantic theme states, source-only/rendered disclosure | Proposed if reusable rules survive canonical derivation | Skip if resulting rule is task-specific rather than reusable |
| `docs/WORKFLOW.md` | None | No change currently indicated | Skip | Existing process already owns topic promotion/gates |
| `docs/issues/Issues_Phase_23.md` | Future approved phase kickoff only | Not created in Craft Docs map/canonical pass | Deferred | Adapter creates only at approved phase kickoff |

`SCHEMA.md` changes are required even though the earlier notes audit initially
said none was confirmed (`NOTES.md:101-108`): the final selected decision later
made monotonic versions and durable synchronized candidates explicit
(`DECISION.md:412-456`, `570-632`). The final selected decision controls.

### 11.2 Exact selected visual source-region map

Paths below are relative to the allowed read-only Design Source. Ranges are
source-only; no rendered outcome is implied.

| Region code | Theme | Shell / pool | Breakdown + Context + archive | Staging | Explorer + placement/newly placed |
|---|---|---|---|---|---|
| `GD-*` | GridDO | `src/app/prototype/inbox-triage-griddo/page.tsx:998-1121` | `:1128-1380` | `:1381-1503` | `:1504-1774`; card/new marker helpers `:362-478` |
| `TD-*` | Tiny Desk | `src/app/prototype/inbox-triage-tiny-desk/page.tsx:1271-1395` | `:1402-1550` | `:1551-1632` | `:1633-1909`; marker helpers `:340-465` |
| `NM-*` | Neumorphism | `src/app/prototype/inbox-triage-neumorphism/page.tsx:887-1036` | `:1040-1280` | `:1281-1403` | `:1404-1679`; marker helpers `:275-392` |
| `CL-*` | Claymorphism | `src/app/prototype/inbox-triage-claymorphism/page.tsx:807-936` | `:943-1189` | `:1190-1322` | `:1323-1687` |
| `OR-*` | Origami | `src/app/prototype/inbox-triage-origami/page.tsx:1276-1398` | `:1402-1601` | `:1602-1714` | `:1715-2035`; marker helpers `:554-673` |
| `TE-*` | Terminal | `src/app/prototype/inbox-triage-terminal/page.tsx:841-937` | `:944-1204` | `:1205-1328` | `:1329-1710` |
| `RM-*` | Retro Mac | `src/app/prototype/inbox-triage-retro-mac/page.tsx:853-985` | `:992-1241` | `:1242-1369` | `:1370-1756` |
| `GR-*` | Graphite | `src/app/prototype/inbox-triage-graphite/page.tsx:976-1096` | `:1103-1350` | `:1351-1438` | `:1439-1743`; marker helpers `:298-414` |

Shared selected theme-value regions are `src/app/themes.css:1-46` (Tiny Desk),
`:47-112` (Neumorphism), `:113-253` (Claymorphism), `:254-297`
(Origami), `:298-347` (Terminal), `:348-395` (Retro Mac), and `:396-439`
(Graphite). GridDO base semantics already exist in the production canonical
theme system; route-local visual facts may be extracted, but absent exact
values may not be reconstructed from prose.

The following source declarations are explicitly outside every region's
adoptable subrange even when numerically inside it: local data mutations,
review locks/variant selectors, internal staged handles, keyboard-grab
mechanics, focus-collapse handlers, Scratch-switch newly-place reset,
`triagedScratches`, repeated pulse/blink, and route duplication.

### 11.3 Complete proposed surface-first recipe set

Every file contains one shared semantic/layout contract and eight realization
sections. It records observed source facts separately from product adoption,
production landing, token implications, exclusions, and verification level.

| Future recipe path | Supported extraction scope | Exact source regions | Excluded until decision |
|---|---|---|---|
| `docs/recipes/inbox-triage-shell-section-chrome-visual-recipe.md` | Four-area composition, visible headers/chrome, section identity, hidden-scrollbar treatments | All `*-SHELL/POOL/BREAK/STAGE/GRID` region starts plus theme blocks | No unsupported replacement body is inferred from chrome |
| `docs/recipes/inbox-triage-scratch-pool-visual-recipe.md` | Expanded tools/list, collapsed switching, counts, search/sort controls, selection/empty source states | `GD/TD/NM/CL/OR/TE/RM/GR-POOL` | `VQ-01`, Pool status subset of `VQ-06` |
| `docs/recipes/inbox-triage-selected-scratch-context-visual-recipe.md` | Signature Context, Edit/sort control placement, working/complete base states | Context subregions within all `*-BREAK` ranges | Inline editor/conflict `VQ-04`; title blocker `VQ-11`; lens `D-LENS` |
| `docs/recipes/inbox-triage-breakdown-row-empty-visual-recipe.md` | Active/staged/consumed-removal grammar, grip/actions, add control, empty/completion prompts | Row/input/empty subregions within all `*-BREAK` ranges | `VQ-02`, `VQ-03`, `VQ-04`, `VQ-05`, blocker `VQ-11` |
| `docs/recipes/inbox-triage-staging-visual-recipe.md` | Visible Staging/Nodes/Bits identity, Node-card/Bit-row shapes, quiet empty state, base pending/drop-back/invalid grammar | All `*-STAGE` ranges | Reliability/remote/status `VQ-06`; common card redesign `D-CARD`; prototype handles excluded |
| `docs/recipes/inbox-triage-grid-explorer-visual-recipe.md` | Explorer chrome/path/full labels, four-column base, Node/Bit base rows, supported target-state grammar | All `*-GRID` ranges | Entire full-hierarchy replacement search body `VQ-07`; remote statuses `VQ-06` |
| `docs/recipes/inbox-triage-placement-affordances-visual-recipe.md` | Direct type/path base affordance, staged base affordance, target-column placement, full-target warning source treatment | Placement subregions inside all `*-GRID` ranges | `VQ-08` reliability states; Result Title/direct limit states `VQ-09` |
| `docs/recipes/inbox-triage-newly-placed-undo-visual-recipe.md` | Actual-card base marker and Undo placement for Node/Bit; static/one-shot candidates only | Marker helper/Explorer subregions listed in §11.2 | All pulse declarations; overlap/ineligible/retry states `VQ-10`; future common card work `D-CARD` |
| `docs/recipes/inbox-triage-archive-completion-visual-recipe.md` | Breakdown blur/dim overlay, base Archive/Cancel, complete Context/reopen state | Archive subregions inside all `*-BREAK` ranges | Blockers `VQ-11`; pending/failure/recovery `VQ-12` |
| `docs/recipes/inbox-triage-visual-recipe-index.md` | Navigation only: source regions ↔ recipes ↔ production owners ↔ future task IDs | All selected regions | Never stores behavior or token truth |

### 11.4 Token implications (not extracted values yet)

- Extend Inbox/Triage semantic state mapping for working/selected/staged,
  invalid/unavailable, pending-confirmation, pending/reconciling, newly placed,
  completed, and local alert status without collapsing them to one color or
  opacity.
- Keep theme ID branching out of product components; express differences with
  shared state attributes, semantic variables/classes, or theme realization
  components.
- Add only values directly extractable from selected source regions. Do not
  invent exact GridDO values missing from selected shared sources.
- Motion recipes must state trigger, duration/easing/delay/keyframes,
  reduced-motion behavior, and interruption/retrigger behavior. Any source
  pulse conflicting with `OB-F14` is a removal candidate, not a motion token.
- No motion value is adopted in this pass because no matching render or motion
  behavior was checked.

## 12. Supersession And Existing Plan State

| Existing rule/state | Disposition | Future amendment effect |
|---|---|---|
| SPEC visible developer-label removal (`docs/SPEC.md:275-280`) | Superseded in selected scope | Restore themed visible section identity and full Explorer level labels |
| SPEC compact selected Context (`docs/SPEC.md:277-279`) | Superseded | Replace with standalone signature Context |
| SPEC active-section Explorer search (`docs/SPEC.md:280`) | Superseded | Replace with dedicated full-hierarchy mode |
| SPEC UI-only staged candidates (`docs/SPEC.md:279`) | Superseded | Add durable synchronized domain candidate contract |
| SPEC current combined placement confirmation (`docs/SPEC.md:281`) | Superseded in realization/atomicity | Split direct/staged/title/placement states and repository transaction |
| DESIGN_TOKENS removed labels (`docs/DESIGN_TOKENS.md:378-395`) | Superseded | Replace Inbox/Triage surface contract |
| DESIGN_TOKENS compact Context (`docs/DESIGN_TOKENS.md:406-414`) | Superseded | Replace with signature surface contract |
| DESIGN_TOKENS active-section search (`docs/DESIGN_TOKENS.md:415-424`) | Superseded | Remove as new search visual authority; `VQ-07` blocks replacement extraction |
| Existing Batch 2 recipe link (`docs/DESIGN_TOKENS.md:1026-1030`) | Historical/reference-only | Point future canonical recipe index to new surface-first set |
| Current production Phase 23-33 / Tasks 101-154 | Existing open planning baseline; no task is accepted or implemented by this map | After map and canonical approvals, re-derive the full phase plan from approved canonical state and explicitly reconcile or supersede these open rows; map approval alone changes no task status |

No task or phase is marked accepted by this map. Map approval is not task
acceptance and does not change current plan status.

## 13. Verification Disclosure

### Performed in this production-adoption pass

- Read the Craft Docs router and every directly selected Brainstorming Route
  reference, including visual-prototype intake and document contracts.
- Compared the prior production map with the hash-pinned Fresh map selected
  by the user.
- Verified production base commit/tree, selected topic blobs, canonical
  baseline blobs, current plan state, and a clean pre-write worktree.
- Verified production `DECISION.md`, `NOTES.md`, and `src` exactly match the
  semantic inputs used by the Fresh map.
- Verified the live Design Source commit/tree is clean and all eight route
  blobs plus the two shared-source blobs match the Fresh map provenance.
- Preserved the Fresh obligation/disposition/landing/VQ/NEG/recipe semantics;
  production edits are limited to adoption metadata, provenance, existing
  downstream-state disclosure, and this re-approval gate.

### Not performed / not claimed

- No server or browser was started.
- No route/state was rendered in this pass.
- No screenshot or recording was captured.
- No contrast, depth, layering, clipping, overflow, rasterized geometry, or
  combined theme outcome was checked.
- No responsive fidelity was checked. The product remains desktop-focused and
  responsive design is deferred (`docs/SPEC.md:301-311`).
- No motion timing, interruption, retrigger behavior, or reduced-motion visual
  equivalence was checked.
- No light/dark or all-eight-theme rendered smoke was checked.
- No external-removal, concurrency, offline, realtime, placement, Undo, or
  archive state was executed.
- `NOTES.md:69-76` records a historical 1600×1000 render audit by the topic
  author. It is not represented as a render performed or independently
  reverified in this pass.

All visual facts in this map are therefore labeled **source-only**. Future
recipe extraction must preserve that label until matching rendered checks are
actually performed and must name route, state, viewport, theme, and unchecked
dimensions at its gate.

## 14. Pre-Gate Audits

### 14.1 Obligation and citation audit

- The selected decision was indexed by independently testable obligation; no
  product behavior relies on a NOTES-only claim.
- Compound authority areas were split across separate IDs, including Pool
  lifetimes, Add versus Edit blur behavior, candidate durability versus UI
  state, active-column versus full-hierarchy search, base placement versus
  commit reliability, marker provenance versus Undo eligibility, archive
  eligibility versus presentation, and core copy ownership versus deferred
  localization.
- Every long compound anchor identified by the citation-span audit has its
  independently testable clauses recorded in §4.8 with narrower authority and
  discharge links.
- Broad source ranges in §11.2 are extraction locators only. Product rules use
  the narrower decision-line citations in §4.
- The retained English copy foundation is not absorbed into deferred
  localization (`OB-L02`).

### 14.2 Negative-constraint and landing audit

- Every explicit prototype non-reuse, superseded shortcut, forbidden reuse,
  persistence boundary, no-auto-fallback, pointer-only limitation, and
  repeated-motion prohibition has a `NEG-*` row.
- Every adopted item resolves through §8 to a concrete `LAND-*` owner.
- Missing owners use the exact phrase
  **target absent — structural prerequisite required**.
- Every unsupported direct visual/content realization uses the exact phrase
  **source absent — user decision prerequisite**, prohibits adjacent automatic
  fallback, and is excluded from recipe extraction.

### 14.3 Scope and status audit

- Intended repository diff: this map only.
- Canonical, recipe/index, plan, standard, ledger, source, selected topic,
  design archive, entrypoint, adapter, and protected legacy files: unchanged.
- Map status is `Proposed`; approval is `Pending user decision`.
- Transfer source is SHA-256 `8780df4b...`; the prior production map remains
  recoverable at commit `1f51ebb`. No Fresh downstream artifact or receipt is
  imported.
- No approval, task acceptance, phase acceptance, implementation completion,
  or downstream authorization is asserted.

## 15. User Gate

This is the Brainstorming Route `PROMOTION_MAP.md` gate. The next legal action
is user review of the complete map, including:

1. source classification and provenance distinction;
2. obligation coverage and negative constraints;
3. Retain/Remove/Reintegrate dispositions and production landings;
4. the two-class `VQ-01`–`VQ-12` disposition: shared semantic-state envelope
   plus residual prerequisites for existing surfaces, and recipe scope-out plus
   blocking Decision prerequisites for absent replacement surfaces;
5. canonical edit regions; and
6. the nine surface recipes plus navigation index.

Until the user approves this map and its two-class `VQ-*` disposition, no
recipe extraction or canonical/downstream file may start. After approval,
shared state contracts may proceed, but every named Decision prerequisite must
still block its dependent implementation task until a matching user receipt
resolves the missing visual authority. Before the first downstream canonical
write, production must also confirm the authority order, verification commands,
and durable receipt locations that are not declared by an `AGENTS.md` or
project adapter at base `a3c679c`.
