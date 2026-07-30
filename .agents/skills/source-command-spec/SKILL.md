---
name: "source-command-spec"
description: "Create or update a technology-neutral SPEC.md containing product intent, functional requirements, and testable acceptance criteria. Use for /spec, PRD requests, requirements work, or acceptance-oracle creation."
---

# Spec

Create the authoritative description of what the product must do. Keep implementation architecture in the engineering plan.

## Inputs

- Brief or existing product
- Optional `--prd-only`
- Optional `--collaborate` or `--delegate`

## Procedure

1. **Inspect first.**
   - Find an existing `SPEC.md`, product brief, tests, current UI, `DESIGN.md`, `MAP.md`, and `TASK.md`.
   - For an existing product, treat observed behavior and approved documents as evidence; surface contradictions.
2. **Resolve material ambiguity.**
   - Collaborate mode: ask one batched set of questions that changes scope or acceptance.
   - Delegate mode: state bounded assumptions and proceed.
3. **Write the product layer.**
   - Root problem
   - Users and jobs
   - Desired outcomes and measurable signals
   - Scope and non-goals
4. **Write the functional layer unless `--prd-only`.**
   - Prioritized user stories
   - Stable `FR-###` requirements
   - Key entities and externally visible rules
5. **Write the acceptance layer unless `--prd-only`.**
   - Stable `AC-###` scenarios in Given/When/Then form
   - Each scenario names a practical verifier
   - NFR thresholds are measurable or explicitly marked unresolved
6. **Validate independently.**
   - Use a fresh product-native subagent when available, or perform a separate second pass.
   - Check completeness, consistency, necessity, feasibility, traceability, and testability.
7. **Reconcile task state.**
   - Add implementation work and unresolved decisions to project `TASK.md`.

## Required shape

```markdown
# SPEC

## Product
### Problem
### Users and jobs
### Outcomes
### Scope
### Non-goals

## Functional
### User stories
### Requirements
### Entities and rules

## Acceptance
### Scenarios
### Non-functional requirements
### Open decisions
```

## Quality rules

- Use one atomic, unambiguous requirement per ID.
- Avoid prescribing libraries, frameworks, or internal architecture unless they are genuine product constraints.
- Bind every acceptance criterion to a requirement or outcome.
- Mark unknown values for decision; never fabricate thresholds.
- Preserve valid IDs when updating an existing spec.

## Completion

Report the spec path, assumptions, open decisions, validation findings, task-state updates, and exact verifier.
