# Inbox / Triage 2-3 Visual Recipe Index

> Source: `griddo2-claude-themes2-3` commit
> `4f39709688ceb4cac5e15d4e3502186b1f1c801b`
> Structural baseline:
> `docs/brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/DECISION.md`
> Promotion map:
> `docs/brainstorming/2026-06-25-inbox-triage-theme-surface-redesign/PROMOTION_MAP.md`
> Date: 2026-07-18
> Status: Approved

This index fixes the prototype provenance, maps source regions to surface recipes, and audits
the six semantic states across all eight themes. The prototype is a visual and interaction
reference only; its duplicated state, handlers, mock persistence, and route architecture are not
production sources.

## Extraction Method

- Read the pinned source files directly and record exact Tailwind classes, CSS variables, inline
  values, motion transitions, and component hierarchy.
- Reconcile every extracted fact against the structural baseline. The decision wins on conflict.
- Use the durable `1600x1000` captures as visual evidence, not as a substitute for exact source
  values.
- Keep whole-hierarchy search-result realization out of recipes. It remains a phase-local
  `Decision prerequisite` because no final prototype realization exists.
- Record reusable styling implications for Step 3 `DESIGN_TOKENS.md`; do not turn theme display
  strings into tokens.

## Source Region Inventory

All line ranges refer to the pinned commit above.

| Theme | Alias | Shared helpers / cards | Scratch Pool | Breakdown + archive | Staging | Grid / placement |
|---|---|---|---|---|---|---|
| GridDO | `P-griddo` | `page.tsx:151-479` | `page.tsx:1001-1120` | `page.tsx:1128-1380` | `page.tsx:1381-1503` | `page.tsx:1504-1774` |
| Tiny Desk | `P-tiny-desk` | `page.tsx:179-465` | `page.tsx:1274-1401` | `page.tsx:1402-1550` | `page.tsx:1551-1632` | `page.tsx:1633-1909` |
| Neumorphism | `P-neumorphism` | `page.tsx:151-392` | `page.tsx:887-1039` | `page.tsx:1040-1280` | `page.tsx:1281-1403` | `page.tsx:1404-1679` |
| Claymorphism | `P-claymorphism` | `page.tsx:139-254` | `page.tsx:810-942` | `page.tsx:943-1189` | `page.tsx:1190-1322` | `page.tsx:1323-1687` |
| Origami | `P-origami` | `page.tsx:184-673` | `page.tsx:1279-1404` | `page.tsx:1405-1601` | `page.tsx:1602-1714` | `page.tsx:1715-2035` |
| Terminal | `P-terminal` | `page.tsx:152-244` | `page.tsx:844-940` | `page.tsx:941-1204` | `page.tsx:1205-1329` | `page.tsx:1330-1710` |
| Retro Mac | `P-retro-mac` | `page.tsx:154-267` | `page.tsx:856-991` | `page.tsx:992-1241` | `page.tsx:1242-1378` | `page.tsx:1379-1756` |
| Graphite | `P-graphite` | `page.tsx:152-414` | `page.tsx:979-1102` | `page.tsx:1103-1350` | `page.tsx:1351-1438` | `page.tsx:1439-1743` |

Route prefix for every source file:
`src/app/prototype/inbox-triage-<theme>/page.tsx`.

## Durable Baseline Evidence

Each image was rendered from the pinned clean worktree at `1600x1000`, device scale factor `1`,
with visible browser scrollbars hidden. Chrome console/service warnings did not affect page output.

| Theme | Evidence | SHA-256 |
|---|---|---|
| GridDO | `assets/inbox-triage-2-3/griddo-1600x1000.png` | `dd6bac3f330539d81eff7388608c8a902be80553299232ba2f934b517fbbb392` |
| Tiny Desk | `assets/inbox-triage-2-3/tiny-desk-1600x1000.png` | `a488ee5d59e43024523d59b714551a02f609ecd55da2e6862f6afabc70237c8c` |
| Neumorphism | `assets/inbox-triage-2-3/neumorphism-1600x1000.png` | `e5588c1fa362f4eaa253e8da9fb7453af3659364d7da7789916e472fcb674475` |
| Claymorphism | `assets/inbox-triage-2-3/claymorphism-1600x1000.png` | `7ffc4c11c62c674434f633cd8c5be07de7e22053678b4fa54411d047ffa9a9df` |
| Origami | `assets/inbox-triage-2-3/origami-1600x1000.png` | `26eb01882b0eb4be268576976c29eb1058b4dda8ff7c148e88709593a09ffc24` |
| Terminal | `assets/inbox-triage-2-3/terminal-1600x1000.png` | `0cbd70add2c96398dabd62f80ce1fa590caada73f09ac937c9576877b64817aa` |
| Retro Mac | `assets/inbox-triage-2-3/retro-mac-1600x1000.png` | `0707060609a0335c1181c922ead4179ed7170044e52d1df1d86a493edad7fea7` |
| Graphite | `assets/inbox-triage-2-3/graphite-1600x1000.png` | `2d8d5ffbf7cbb19d626724487ecf778c835e8d3977c669cac75c8be8e7d4a32f` |

## Surface Recipe Set

| Surface | Recipe | Structural baseline |
|---|---|---|
| Workspace shell and section chrome | `inbox-triage-shell-section-chrome-visual-recipe.md` | `Common Surface Contract` |
| Scratch Pool | `inbox-triage-scratch-pool-visual-recipe.md` | `Scratch Pool` |
| Selected Scratch Context | `inbox-triage-selected-scratch-context-visual-recipe.md` | `Breakdown > Selected Scratch Context` |
| Breakdown | `inbox-triage-breakdown-visual-recipe.md` | `Breakdown` |
| Staging | `inbox-triage-staging-visual-recipe.md` | `Staging` |
| Grid Explorer | `inbox-triage-grid-explorer-visual-recipe.md` | `Grid Explorer And Placement` |
| Placement affordances | `inbox-triage-placement-affordances-visual-recipe.md` | `Grid Explorer And Placement > Placement Targets / Staged Candidate Placement / Direct Breakdown Row Placement` |
| Newly Placed and Undo | `inbox-triage-newly-placed-undo-visual-recipe.md` | `Grid Explorer And Placement > Newly Placed State / Undo` |
| Completion and archive | `inbox-triage-archive-completion-visual-recipe.md` | `Completion And Archive` |

## Semantic-State Distinctness Matrix

Cells are populated during each extraction batch. Every final cell must identify the owning recipe,
the primary non-color cue, and the theme-specific visual mechanism. A state is not conforming when
it differs from another state only by a shared opacity value.

Legend: `G` = Grid Explorer recipe, `B` = Breakdown recipe, `P` = Placement recipe,
`N` = Newly Placed recipe, `A` = Archive recipe. Each cell names its primary non-color cue.

| Theme | Selected | Staged | Invalid target | Pending confirmation | Newly placed | Completed |
|---|---|---|---|---|---|---|
| GridDO | `G`: primary fill + border | `B`: muted inset row | `P`: veiled column + alert card | `P`: primary confirm tag | `N`: sky dot + `NEW` + Undo | `A`: buffer-cleared stamp |
| Tiny Desk | `G`: brown paper border/fill | `B`: flattened paper | `P`: veiled paper + rejection stamp | `P`: pinned memo slip | `N`: brass fastener + yellow tab + Undo | `A`: `PROCESSED` paper stamp |
| Neumorphism | `G`: inset selected well | `B`: sunken row | `P`: flattened column + inset alert | `P`: raised confirmation plate | `N`: blue bulb + raised `NEW` + Undo | `A`: inset completed context |
| Claymorphism | `G`: primary puffy fill | `B`: squashed low-depth row | `P`: red inner clay surface + alert | `P`: amber jelly capsule | `N`: blue LED + glow + Undo | `A`: finished dough/green clay state |
| Origami | `G`: folded/inset paper | `B`: flattened dashed paper | `P`: veiled paper + dashed warning | `P`: folded confirmation slip | `N`: folded amber corner + Undo | `A`: folded tag / cleared sheet |
| Terminal | `G`: foreground inversion | `B`: commented-out row | `P`: red console + fatal block | `P`: `[SYS]` Y/N block | `N`: green `[new]` + `[UNDO]` | `A`: static `SUCCESS` / CLI complete |
| Retro Mac | `G`: black/white inversion | `B`: ghost/dither row | `P`: dithered column + System Error | `P`: `OK TO PLACE?` dialog | `N`: black `[NEW]` + hard-shadow Undo | `A`: `DISK: TRIAGED` dialog state |
| Graphite | `G`: black filled row | `B`: faded sketch row | `P`: veiled column + thin-line alert | `P`: docked confirmation strip | `N`: black `NEW` + thin outline + Undo | `A`: dark archived index |

Matrix result: all six states have at least one non-color cue in every theme. No theme collapses
Staged, Invalid, Pending, Newly Placed, and Completed into a shared opacity-only treatment.

## Known Removed / Improved Seeds

| Surface | Prototype detail | Disposition |
|---|---|---|
| Scratch Pool | focus/click immediately collapses the pool | Removed; first printable key and explicit toggle own collapse |
| Staging | separate candidate Grip/drag handle | Removed; the entire card is the drag activator and uses the shared drag token |
| Newly Placed | Scratch switch clears the state | Removed; state lasts until Inbox route exit |
| Newly Placed / warnings | repeated `animate-pulse`, blink, or flicker | Improved to a static theme-specific signal |
| Sidebar / headers | theme switchers, fold lock, test mode, numbered variant switchers | Removed as prototype review controls |
| Grid search | prototype active-column search realization | Removed; whole-hierarchy result UI remains a phase-local decision prerequisite |

## Fidelity Escalation Register

| Surface / theme | Status | Reason / required evidence |
|---|---|---|
| Neumorphism soft-shadow depth | source-backed; live comparison required in implementation | Exact inset/outset variables and durable baseline agree; implementation must preserve hierarchy when mapped to production tokens |
| Claymorphism puffy depth and motion | fidelity escalation flag | Shadow stacks are source-backed, but tactile spring feel cannot be proven by a static capture; compare live and do not restore delayed vertical squash |
| Origami fold geometry | source-backed; browser verification required | Clip-path, SVG fold, and asymmetric radii are exact; verify rasterized seams and z-order in the production browser |

## Extraction Completion

- Batch A: shell, Scratch Pool, Selected Scratch Context — complete.
- Batch B: Breakdown and Staging — complete.
- Batch C: Grid Explorer, Placement, Newly Placed/Undo — complete.
- Batch D: Completion/Archive, semantic-state matrix, fidelity register — complete.
- Search-result realization remains intentionally absent and is not a missing recipe.

## Canonical Handoff

- Step 1 `SCHEMA.md`: data and persistence implications only.
- Step 2 `SPEC.md`: surface behavior, ownership, interaction, and accessibility contracts.
- Step 3 `DESIGN_TOKENS.md`: reusable state, typography, spacing, surface, and motion implications.
- Step 4 `EXECUTION_PLAN.md`: tasks reference these recipe paths, not prototype route paths.
- Step 5 `PLANNING_STANDARD.md`: promotion and multi-theme conformance rules.

## Open Questions Guard

Recipe open questions may cover only layout anchor, spacing, motion, or fidelity evidence. They must
not reopen product policy, command scope, persistence, whole-hierarchy search-result realization,
the deferred BitCard redesign, EN/KR work, or the Neumorphism water-lens idea.
