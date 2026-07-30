---
name: "source-command-probe"
description: "Measure test-suite quality with coverage gaps, property-based tests, mutation testing, and red-green additions. Use for /probe, mutation-test requests, property-test requests, or questions about whether tests catch real defects."
---

# Probe

Measure what the current tests detect, then add the highest-value missing tests.

## Gate

Classify the target before expensive work:

- No meaningful test suite: route to test-driven setup and establish a baseline first.
- No stable invariants or executable logic: explain why property or mutation testing has low value.
- Browser-visible behavior: include end-to-end coverage in the plan.
- Suitable target: continue.

## Procedure

1. Resolve the target, test command, rules, dirty state, and current revision.
2. Run the existing suite and collect branch or line coverage where supported.
3. Rank uncovered behavior by business risk, state complexity, and failure impact.
4. Infer a small set of real invariants and add property-based tests with the ecosystem’s established library.
5. Run mutation testing on a bounded high-risk scope.
6. Classify surviving mutants:
   - missing assertion;
   - untested branch;
   - equivalent or irrelevant mutation;
   - tooling limitation.
7. Add focused tests for the highest-value gaps with red-green evidence.
8. Rerun coverage, mutation, focused tests, and the project verifier.
9. Record actionable remaining gaps in project `TASK.md`.

## Delegation

Coverage analysis, invariant discovery, and mutation triage may run in parallel through product-native subagents when scopes are independent. Keep test-file ownership distinct and integrate verified changes centrally.

## Safety

- Use an isolated worktree or reversible sandbox for mutation tools that modify source.
- Confirm the original source is restored before reporting.
- Avoid arbitrary percentage targets without a project requirement.
- Never claim complete coverage or complete correctness.

## Report

Return the baseline suite result, coverage scope, properties tested, mutation score with tool and scope, tests added, surviving risks, restoration check, and exact changed files.
