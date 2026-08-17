---
provenance: "douglas-core"
name: spec
description: "Write a concise technology-neutral product specification with testable acceptance criteria."
when_to_use: "Use when asked for a spec, PRD, requirements, acceptance criteria, or a ground-truth definition of what a product or feature must do."
---

# Spec

`SPEC.md` owns the intended product behavior. Architecture, implementation tasks, and delivery sequencing belong to `writing-plans` and the project's task state.

## Resolve the brief

Inspect existing product docs, code, and task state before writing. Establish user, problem, scope, constraints, non-goals, and known decisions. Ask only for material ambiguities; otherwise record conservative assumptions.

## Write the three layers

1. **Product:** purpose, users, jobs, outcomes, non-goals, and constraints.
2. **Functional:** behavior and user flows in plain language, including relevant permissions, failure, empty, loading, and boundary states.
3. **Acceptance:** uniquely identified, observable criteria. Each criterion names setup, action, expected result, and verification method; use scenarios where that improves clarity.

## Quality gate

Check that every requirement is necessary, testable, consistent, traceable to the problem, and free of implementation prescription unless the constraint genuinely requires it. Reconcile it with existing `DESIGN.md`, security/data boundaries, and durable documentation.

## Handoff

Place the specification at the project owner selected by its existing conventions, link rather than duplicate it, and update task state through the active owner. On implementation, refresh the spec to show shipped, deferred, or superseded requirements rather than leaving a competing status document.
