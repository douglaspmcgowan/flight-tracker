---
name: "source-command-solo-review"
description: "Run an independent multi-lens review of a target and return evidence-backed findings or apply approved fixes. Use for /solo-review or a broad pre-merge review."
---

# Solo Review

Review the assembled target from independent perspectives, then consolidate duplicates and verify every actionable claim.

## Inputs

- Exact target and revision
- Review-only or fix mode
- Applicable `AGENTS.md`, `SPEC.md`, `DESIGN.md`, `MAP.md`, project `TASK.md`, and executable project verifiers

## Review lenses

1. Correctness and edge cases
2. Security and data handling
3. Reliability, state, ordering, and concurrency
4. Performance and resource use
5. Maintainability and needless complexity
6. Product, UX, accessibility, and specification fit when relevant
7. Test quality and verification gaps

## Procedure

1. Resolve the exact target, dirty state, and required rules.
2. Run existing tests and verifiers to establish a baseline.
3. Assign independent lenses to product-native subagents when available. Give each reviewer the exact target, rules, and evidence format. Review locally when delegation is unavailable.
4. Require each finding to include:
   - severity;
   - exact file, symbol, route, or behavior;
   - reproduction or evidence;
   - consequence;
   - smallest safe correction;
   - verifier.
5. Reproduce findings before accepting them.
6. Merge duplicates and discard unsupported observations.
7. In review-only mode, return the prioritized list and stop.
8. In fix mode:
   - record accepted work in project `TASK.md`;
   - apply surgical fixes with regression tests when practical;
   - rerun the relevant lens and assembled-system verifier.
9. Run one fresh final pass against the changed target.

## Severity

- `Blocker`: unsafe to ship or causes data/security loss.
- `Major`: user-visible failure, material correctness defect, or serious maintainability risk.
- `Minor`: bounded defect or friction with a clear correction.

## Constraints

- Never report a speculative concern as a confirmed defect.
- Preserve unrelated changes.
- Keep canonical skills and configuration in their current owners; do not create tracked mirrors.
- Use project `TASK.md` for actionable state and project `STATUS.md` only for durable system state.

## Completion

Return the baseline, verified findings, rejected hypotheses, fixes applied, test evidence, remaining risk, and exact changed files.
