---
provenance: promoted-from-command:v1
name: design
description: "Plan a product or feature from user problem through an implementable, testable design."
when_to_use: "Use for product or feature design before a substantial interface build or a brownfield feature that must fit an existing app. Use design-review to critique a built surface."
disable-model-invocation: true
---

# Design

## Orient

Read the target's `AGENTS.md`, `INTENT.md` when present, `PRODUCT.md`, `MAP.md`, and `DESIGN.md`. Inspect the running product and real code before proposing a change. For a new visual language, follow the shared design-language registry and `~/.agents/design/LIBRARIES.md`.

Resolve the user, their primary job, success signal, constraints, and scope. Ask a single batch of only the unanswered questions when collaboration is requested; otherwise record conservative assumptions in project task state.

## Produce the design package

1. State the problem, target user, non-goals, and measurable outcomes.
2. For a new product, compare a small number of materially different interaction models. For a brownfield feature, map existing navigation, components, tokens, data flow, and regression boundaries before choosing the smallest conforming addition.
3. Specify the primary flow, supporting states (loading, empty, error, permissions), information hierarchy, responsive behavior, accessibility, and content requirements.
4. Write or refresh the technology-agnostic acceptance specification with `spec`; leave implementation planning to `writing-plans`.
5. Name the touch list, test strategy, and rollout/rollback boundary. Route interface implementation through `impeccable`; route an existing built surface through `design-review`.

## Execute or hand off

With `--plan`, present the package and stop. With explicit implementation authority, execute the agreed plan in small verified slices. Use the repository's task-state system, preserve existing behavior, and update durable docs in the same work unit.

## Quality bar

The design must give an implementer a clear primary flow, boundaries, and acceptance evidence without inventing architecture or claiming untested polish. Verify browser-visible work in the assembled app.
