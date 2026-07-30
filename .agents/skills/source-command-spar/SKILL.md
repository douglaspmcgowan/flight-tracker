---
name: "source-command-spar"
description: "Run an adversarial break-fix loop with independent attack lenses, verified fixes, and fresh retesting. Use for /spar, 'break it and fix it,' or requests to keep attacking a target until it holds."
---

# Spar

Attack one target from distinct angles, fix every reproduced defect, and repeat with fresh reviewers.

## Inputs

- Exact target
- `--max-iterations N` (default 10)
- `--fast` (two rounds)

## Attack lenses

1. Input boundaries, malformed data, and fuzzing
2. State transitions, ordering, races, and retries
3. Resource use, load, latency, and cleanup
4. Specification contradictions and user-journey failures
5. Security and trust boundaries when applicable

## Procedure

1. Resolve the target revision, rules, baseline tests, and success oracle.
2. Seed the active loop in project `TASK.md`.
3. Dispatch independent lenses in parallel through product-native subagents when available. Each lens must return a reproduction, consequence, and verifier.
4. Reproduce every candidate finding in the main context.
5. For each real defect:
   - write a failing regression test when practical;
   - diagnose the root cause;
   - apply the smallest safe fix;
   - rerun the focused and assembled-system verifiers.
6. Start a fresh attack round against the patched target.
7. Stop after two consecutive rounds produce no new reproduced defect, the iteration limit is reached, or a safety/authority blocker prevents a fix.
8. Reconcile `TASK.md` and report remaining risk honestly.

## Isolation

Use distinct worktrees or strict one-writer ownership when concurrent fixers would touch the same repository. Review workers remain read-only.

## Constraints

- Unsupported findings do not count.
- A passing unit test does not replace assembled-system verification.
- Preserve unrelated changes and canonical file ownership.
- Do not create tracked configuration or skill mirrors.

## Report

Return each round’s lenses, reproduced defects, fixes, regression evidence, rejected hypotheses, clean-round count, remaining risk, and exact changed files.
