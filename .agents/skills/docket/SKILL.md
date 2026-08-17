---
name: docket
when_to_use: "Use to route a brief, review, or decision through the configured Docket protocol."
description: Route a brief, review item, or multi-option decision through the configured Docket review surface.
disable-model-invocation: true
provenance: promoted-from-command:v1
---

# /docket [brief|review|decision|sync] [what to send]

`~/.agents/DOCKET-PROTOCOL.md` is the authority for Docket’s data model, source-of-truth rules, sensitivity handling, card schemas, mirror placement, CLI location, and verification. Read its current version before creating, syncing, or reporting a Docket item.

## Work Scope routing

When the exact project path `.agents/work/state.json` exists, Work Scope is authoritative and its
generated project, track, task, queue, and log views are read-only. Load and follow the `work-scope` skill, including its guard, ownership, evidence, and handoff rules. The tools live in `.agents/tools/`, not inside the skill package, which carries only its `SKILL.md`. Validate and resume with `Test-WorkState.ps1`, `Get-WorkResume.ps1`, and `Reconcile-WorkState.ps1`; use `Update-WorkState.ps1` for active-cell work, `Capture-WorkDiscovery.ps1` for adjacent or deferred work, and `New-WorkHandoff.ps1` for independent outcomes. A present but invalid state fails closed; use legacy task routing only when that state file is absent.

A blocking decision inside the active capability becomes a structured task through `Update-WorkState.ps1`, with acceptance criteria requiring the stable Docket decision record.
Add dependent work with `-Dependencies <decision-task-id>`.
A decision outside the active cell becomes a `prerequisite` or `adjacent` item through `Capture-WorkDiscovery.ps1`.

## Route

1. Classify the request as a brief, review item, decision, or sync.
2. Follow the protocol’s sensitivity gate and use its supported CLI or sync command. Do not revive retired wrappers, local-server assumptions, hard-coded paths, scheduled tasks, or credential mechanics from this skill.
3. For a decision, write the authoritative open-decision record in the owning vault and task state as required by the protocol; Docket is the review surface, not a competing record.
4. For a substantial brief, maintain the required three surfaces: authored vault note, Docket brief card under its stable id, and generated Docket-mirror record. `DOCKET-PROTOCOL.md` → **Brief quality** owns the required form; read it before drafting.
5. Capture the returned identifier and run the protocol’s named verification before reporting success.

If the supported CLI, protocol, or required authority is unavailable, stop with the missing capability. Do not hand-roll HTTP calls, copy credentials, or create an alternate Docket client.
