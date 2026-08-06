---
name: correct
description: "Turn Douglas's correction into durable, scoped prevention. Use when he reports an agent mistake, says never to repeat something, asks to remember feedback, invokes /correct, or requests a rule, hook, test, verifier, permission, memory, skill, adapter, or workflow change based on observed behavior."
---

# Correct

Convert an observed failure into value-free evidence, the narrowest supported enforcement, and proof that a future session will encounter the fix.

## Boundaries

Use this skill for a correction or recurrence-prevention request. Use `TASK.md` for unfinished work, `STATUS.md` or `MAP.md` for project facts, and the existing human guide for explanation without enforcement.

The feedback log records decisions and evidence for audit. It does not teach the procedure and does not load every session.

## Procedure

1. Answer the correction directly and stop the failing path.
2. Run the existing-owner gate before proposing an artifact:
   - Search the repository, `~/.agents`, relevant product configuration, manifests, hooks, skills, scripts, tests, and human guide for the current owner and equivalents.
   - Find consumers, imports, hook wiring, adapters, tests, and documentation links before renaming, replacing, or removing anything.
   - Record exact paths and searches inspected.
3. Choose the artifact decision in this order:
   - `extend`: add the behavior to the closest adequate owner;
   - `consolidate`: merge overlapping owners and leave a thin compatibility pointer when discovery requires one;
   - `replace` or `remove`: preserve a backup and update verified consumers;
   - `create`: use only when the search shows no existing owner can responsibly hold the behavior, and record why.
4. Preserve value-free evidence. Record file, test, screenshot, or transcript locations without credential values, protected content, or private source data.
5. Classify root-cause status as `hypothesis`, `supported`, or `reproduced`. Reproduce safely before recording a cause as durable fact or building a load-bearing guard around it.
6. Select every supported scope:
   - `path`
   - `project`
   - `shared`
   - `platform`
   - `provider-model`
   - `human`
7. Select each enforcement mechanism that covers a distinct recurrence path:
   - stable judgment or style: `rule`
   - repeatable procedure: `skill`
   - reusable fact: `memory`
   - completion evidence: `verifier`
   - detectable unsafe action: `hook` or `permission`
   - reproduced behavior: `test`
   - human rationale: `brief`
   - deferred authorized work: `backlog`
8. Prefer the narrowest proven scope. Stable cross-project behavior belongs in the shared contract. Product mechanics stay in thin adapters. Cloud-required behavior travels in committed repository files.
9. Append the decision with `scripts/Record-Correction.ps1`. Use the repository log for path/project scope and the shared log for shared/platform/provider scope. Preserve history through superseding or retirement entries.
10. Implement every safe, authorized enforcement artifact. Update `MAP.md` when ownership, loading, paths, or integrations change.
11. Verify every mechanism independently. Then exercise the assembled repository or harness under the condition that exposed the failure.
12. Report the scope, artifact decision, mechanisms, full paths, verification, unresolved cause, and review trigger.

## Record contract

Each append-only entry contains:

- stable ID and UTC timestamp;
- value-free incident, consequence, and evidence references;
- root-cause status;
- existing-owner search evidence and artifact decision;
- scopes, surfaces, and enforcement mechanisms;
- artifact paths, verification, owner, status, and review trigger.

## Stop conditions

- Stop before any credential value, protected content, or private source data could enter a record.
- Keep an unresolved cause labeled `hypothesis`.
- Stop before broadening an ordinary one-project preference to shared scope without cross-project evidence.
- Stop before replacement, removal, or renaming when a consumer remains unresolved.

## Verification

- Run `scripts\Record-Correction.test.ps1`.
- Re-read this file and the compatibility alias for trigger overlap and contradictory routing.
- For each real correction, run the tests or verifiers attached to its enforcement artifacts.

## Final report

State what was verified this pass and what remains. Include all created or updated paths and repeat open questions only when Douglas must answer them.

## Provenance

This workflow consolidates the former `feedback` skill, `FEEDBACK-ROUTER.md`, and `Record-Feedback.ps1`. The `feedback` skill remains a discovery alias.
