---
name: "source-command-hone"
description: "Run a measurement-driven performance loop: classify, baseline, profile, test one change, remeasure, and keep only verified improvements. Use for /hone, profiling, latency reduction, memory reduction, or codebase optimization."
---

# Hone

Improve measured performance while preserving behavior.

## Inputs

- Exact target and workload
- `--mode plan|auto`
- Optional iteration or resource budget
- Optional read-only mode

## Procedure

1. **Define the metric.**
   - Name the workload, environment, metric, acceptable variance, and correctness verifier.
2. **Run the gate.**
   - Confirm the target is measurable.
   - Check whether the reported bottleneck belongs to this codebase or to the OS, browser, network, or another tool.
   - Route browser rendering and interaction work through the installed frontend optimization skill.
3. **Baseline.**
   - Run multiple samples.
   - Record central tendency, spread, resource use, revision, and environment.
4. **Profile.**
   - Use the ecosystem’s profiler to identify the dominant cost.
   - Distinguish CPU, memory, allocation, I/O, network, GPU, lock, and algorithmic bottlenecks.
5. **Rank candidates.**
   - Estimate impact, risk, implementation cost, and measurement clarity.
6. **Execute by mode.**
   - Plan: return the ranked evidence and stop.
   - Auto: test one candidate at a time in an isolated worktree or with strict reversible ownership.
7. **Verify each candidate.**
   - Rerun the same benchmark enough times to account for noise.
   - Run correctness and regression tests.
   - Keep a change only when the measured improvement is repeatable and behavior remains correct.
8. **Apply and remeasure.**
   - Apply verified candidates to the authorized target.
   - Rerun the benchmark and project verifier in the assembled system.
9. **Record.**
   - Update project `TASK.md` and durable performance evidence where the project keeps it.

## Delegation

Use product-native subagents for independent profiling hypotheses or platform research when available. Give one writer ownership of each trial.

## Constraints

- Never report a speedup from one noisy sample.
- Preserve the benchmark workload across baseline and comparison.
- Reject changes whose correctness cost exceeds the agreed tradeoff.
- Do not create tracked mirrors of skills or configuration.

## Report

Return baseline measurements, profiler evidence, trials, kept and rejected candidates, final measurements, correctness evidence, remaining bottlenecks, and exact changed files.
