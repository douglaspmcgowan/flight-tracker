---
name: probe
when_to_use: "Use to assess whether an existing test suite detects important defects."
description: Measure test effectiveness through risk-led coverage gaps, properties, and mutation testing where applicable.
disable-model-invocation: true
provenance: promoted-from-command:v1
---

# /probe [target]

Probe measures whether a suite catches meaningful defects. Passing tests are evidence of execution, not sufficient evidence of effectiveness.

## Scope and classification

Resolve the target's documented test, coverage, and mutation commands before changing anything. Map public behavior, risky branches, boundary-sensitive calculations, parsers, state transitions, and permission or data-loss paths. Choose only applicable techniques:

- coverage-gap analysis for unexercised risk;
- property-based tests for broad invariant or boundary spaces;
- mutation testing for whether existing assertions detect representative faults; and
- focused regression tests for an identified gap.

Do not run costly mutation campaigns against a target with no practical test command, an unbuildable baseline, or an unresolved scope. Record the constraint and address the smallest prerequisite first.

## Procedure

1. Run the baseline suite and retain its command and result.
2. Rank gaps by user impact, likelihood, and blast radius; inspect only the highest-risk paths.
3. State the expected invariant or defect model before adding a test.
4. Add focused tests with red-green proof where the task authorizes edits. Keep fixtures deterministic and preserve existing conventions.
5. Run the relevant suite, coverage or mutation tool, and a focused behavioral check. Compare results to the baseline rather than reporting a raw percentage without context.

Use current product capabilities to parallelize independent analysis only when they are available. Do not embed worker tool names, subagent types, workflow syntax, or model tiers in the canonical procedure.

## Report

Report baseline status, risks examined, properties or mutants attempted, gaps closed, remaining blind spots, commands run, and evidence that each new test fails for the intended defect. Route a known failing behavior to `systematic-debugging`; route implementation work to `test-driven-development`.
