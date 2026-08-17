---
name: spar
description: "Use when a bounded target needs adversarial break-fix rounds with independent attack lenses and evidence gates."
when_to_use: "Use for a bounded adversarial break-fix loop after the target and acceptance signal are known."
disable-model-invocation: true
provenance: promoted-from-command:v1
---

# /spar [target] [--max-iterations N] [--fast]

Spar improves a known target through repeated independent attempts to break it, evidence-backed fixes, and fresh re-checks. It does not substitute for a project's normal test, review, or security ownership.

## Work Scope routing

When the exact project path `.agents/work/state.json` exists, Work Scope is authoritative and its generated views are read-only. Load and follow the `work-scope` skill, including its guard, ownership, evidence, and handoff rules. The tools live in `.agents/tools/`, not inside the skill package, which carries only its `SKILL.md`. Validate with `Test-WorkState.ps1`, resume with `Get-WorkResume.ps1` and `Reconcile-WorkState.ps1`, route active work through `Update-WorkState.ps1`, and route adjacent findings through `Capture-WorkDiscovery.ps1`; use `New-WorkHandoff.ps1` for independent outcomes. Invalid state fails closed; use legacy task files only when the state file is absent.

## Set the round contract

1. Resolve the target, scope boundary, baseline acceptance checks, mutable resources, and existing evidence. Establish a maximum round count (default 10; `--fast` 2).
2. Choose independent attack lenses that fit the target: malformed and boundary inputs; state, ordering, and retries; resource and performance limits; specification contradictions; and trust-boundary or secret-handling behavior. Use only lenses with a concrete observable test.
3. Isolate destructive experiments with fixtures, disposable data, or a dedicated worktree. Do not use elevated permissions, bypass safety controls, touch unrelated systems, or expose credentials.

## Run rounds

1. Give each breaker the target, acceptance contract, prior fixes, and one lens. Where the host supports independent workers, run file- and state-disjoint breakers concurrently; otherwise run them separately with fresh context.
2. A finding requires a stable ID, severity, exact reproduction or code-path trace, expected versus observed result, and the guard ruled out. Deduplicate equivalent findings and discard unsupported suspicions.
3. Reproduce each accepted finding, add or identify a focused regression check when practical, and fix the batch by root cause. Keep edits minimal and preserve unrelated work.
4. Run the target's focused checks after the batch, then send fresh breakers against the patched target. Record every result in canonical task state or the target's existing evidence owner.

## Exit and report

Stop after two consecutive rounds with no new evidence-backed findings, or at the round cap. Report the stop reason, lenses used, findings and their status, checks run, unresolved items, and the next owner. “Clean” means no new finding in the final two rounds; it never proves the target is unbreakable.
