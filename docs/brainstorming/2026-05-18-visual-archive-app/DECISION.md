# Visual Idea Archive App

## Metadata

- Created: 2026-05-18
- Readiness: draft
- Category: workflow idea
- Source project: Cross-project
- Source topic: Quick Capture prototype review workflow
- Source prototype: n/a
- Tags: visual-archive, workflow, prototype-gallery, cross-project

## Raw Notes

1. future-ideas worktree와 branch 개념은 현재 project scope를 위해 만든 것이 아니야. 앞으로의 여러 project에서도 두루 사용될 예정이야.
  2. 문서만이 아닌 실제 animation, layout, design등 시각적 Reference가 필요한 경우 별도의 Worktree를 만들어서 보존하기로 했는데, 이 idea 저장소는 어떤 형태로 만들지 생각하지 않았어. 지금 같은 경우는 시안 작업을 진
  행하던 qc worktree에서 /prototype/quick-capture-create-variants 라는 route를 만들어서 gemini가 임의로 만든 layout으로 진행했는데, 앞으로 1의 개념이 내 workflow 내부에서 반복적으로 사용된다면 정해진 template이 필
  요해. idea들을 모아서 section별로 볼 수 있는 그런 idea. 예전에 storybook이나 chromatic, figma의 dev mode로 그런 시안을 모아두는 동료를 본 적이 있는데, 지금 내가 도입하려는 것도 그것과 유사한 개념이야.
  3. 2의 개념이 도입된다면 Worktree로 관리할 필요는 없어지는 것 같아. 다만, 이런 시안 시각화 도구가 여러 project 공통으로 만들어져야 할지, 또는 매 project마다 존재해야할지, 어떤 기능이 들어가야할지 등의 자세한 개
  념들은 아직 잘 모르겠어.

## Analysis

The underlying need is a cross-project visual idea archive, distinct from
project-local runnable prototype archives.

| Concept | Purpose | Scope |
|---------|---------|-------|
| project-local archive branch | Preserve runnable prototypes tied to a specific project's code | One project |
| cross-project visual idea archive | Store visual/interaction references reusable across projects | Multiple projects |

### Recommended Hybrid Approach

1. **Common archive repo/app** — collects palette, animation, layout, and
   interaction references from multiple projects with screenshots, recordings,
   descriptions, source pointers, and tags.
2. **Project-local runnable reference** — prototypes tightly coupled to a
   specific project's components and tokens stay on the project's archive branch.
   The common archive holds a pointer (branch + commit + route).

### Staged Delivery

- v0: `idea.md` + screenshot + screen recording + source pointer + tags
- v1: Card gallery UI with tag/project/status filters
- v2: Runnable embed (iframe for project prototype routes where possible)

### Operating Rules

- Text-only ideas → DECISION.md in brainstorming
- Ideas needing visual review → include screenshot/video
- Ideas needing interaction review → preserve project-local branch/commit/route
- Do not archive everything → only ideas with keep value
