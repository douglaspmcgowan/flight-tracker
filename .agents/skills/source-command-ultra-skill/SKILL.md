---
name: "source-command-ultra-skill"
description: "Research, build, or improve one reusable agent skill for a requested capability. Use for /ultra-skill, 'build me a skill for X,' or 'improve this skill with current practitioner evidence.'"
---

# Ultra Skill

Create or improve one durable skill from evidence. Keep the result portable across agent products.

## Work Scope routing

Before recording skill work, check the exact project path `.agents/work/state.json`. When it exists, the structured state is authoritative and generated `PROJECT.md`, `TRACKS.md`, `TASK.md`, `BACKBURNER.md`, and `LOG.md` views are read-only.

- Load and follow the `work-scope` skill, including its guard, ownership, evidence, and handoff rules. Resolve tools from the package containing that loaded skill.
- Validate, resume, and reconcile with the canonical `Test-WorkState.ps1`, `Get-WorkResume.ps1`, and `Reconcile-WorkState.ps1` tools.
- Record current-cell skill work through `Update-WorkState.ps1`, guard writes with `Test-WorkScopeGuard.ps1`, and bind completion to executed receipts from `Invoke-WorkScopeEvidence.ps1`.
- Route adjacent skills, deferred improvements, and new capability ideas through `Capture-WorkDiscovery.ps1`; use `New-WorkHandoff.ps1` for an independently owned outcome.
- A present but invalid state fails closed. Never edit generated views or fall back to legacy files.

References to direct `TASK.md` updates below apply only to unenrolled legacy projects.

## Inputs

- Capability or existing skill
- Intended trigger phrases
- Real targets available for testing
- Constraints from the nearest `AGENTS.md`, project `DESIGN.md`, and project `TASK.md`

## Procedure

1. **Classify the request.**
   - Build mode: no suitable installed skill exists.
   - Improve mode: an installed skill already owns the capability.
2. **Inspect before creating.**
   - Search `.agents/skills`, the project skills, manifests, and adapters.
   - Extend the current owner when that produces one clear canonical workflow.
3. **Research the mechanism.**
   - Use current primary sources and practitioner evidence.
   - Inspect the source or full instructions of the strongest two or three candidates.
   - Record the mechanism, evidence, limitations, and license or reuse constraints.
4. **Design the skill.**
   - Give it narrow triggers, explicit inputs, a bounded procedure, failure handling, verification, and a concise report.
   - Put canonical portable skills under `.agents/skills/<skill-name>/SKILL.md`.
   - Keep product adapters thin and free of duplicated procedure text.
5. **Build or improve it.**
   - Preserve proven behavior from an existing skill.
   - Remove stale provider, model, path, and tool assumptions.
   - Use product-native subagents for independent research or tests when available; run the same work locally when they are unavailable.
6. **Test on real targets.**
   - Run at least one normal case and one adversarial or failure case.
   - Verify actual files and effects directly.
7. **Adversarial review.**
   - Check trigger precision, portability, safety, path correctness, idempotence, and whether the skill duplicates an existing owner.
   - Fix concrete failures and rerun the relevant test.
8. **Record the result.**
   - Update the relevant manifest and project `TASK.md` when the work is part of an active task.
   - Report evidence, remaining limits, and exact changed files.

## Constraints

- Never invent sources, test results, or installed capabilities.
- Never embed credentials or machine-specific secrets.
- Avoid mandatory assumptions about a particular agent product, model, orchestration API, or background executor.
- Do not add a second tracked copy of the skill.
- Keep research notes out of the skill unless they are required to execute it.

## Completion gate

The skill is complete when its trigger selects the right work, its canonical file is discoverable, its normal and adversarial tests pass, and no stale duplicate remains.
