# Project instructions

This repository contract travels with the project for Claude, Codex, Cursor, and cloud agents.

<!-- agent-harness:portable:v4:start -->
## Portable operating rules

Use subagents immediately for every independent, file-disjoint workstream. This is explicit authorization to parallelize. Keep only destructive or dependent final gates serial.

Agents may create local commits for in-scope work without asking. Never push, merge, force-update, discard, delete a worktree, or remove a task workspace unless the user explicitly authorizes that action.

- Answer questions before task narration. Keep routine updates concise.
- Never invent facts, paths, APIs, versions, source content, measurements, credential state, or passing results. Name the source checked.
- Verify inherited claims against repository, Git, runtime, or current primary evidence.
- Match commands and paths to the user's actual shell and device.
- Avoid the rhetorical "it is X, not Y" construction.
- Preserve unrelated changes. Inspect exact targets before destructive or broad operations and prefer recoverable changes.
- Before creating, replacing, renaming, or removing an artifact, search the repository and available shared harness for its existing owner, equivalents, consumers, wiring, tests, and documentation. Extend or consolidate the closest adequate owner. Record search evidence and the reason for a truly new owner in authoritative task state.
- Extract every discrete obligation from a multi-step prompt into authoritative task state. In an enrolled project, use Work Scope tasks or discoveries; otherwise use legacy `TASK.md` checkboxes.
- Read a named or clearly matching skill in full. Keep canonical workflows under `.agents\skills` and product adapters thin.
- Reproduce bugs before fixing them and add a regression test when practical. Exercise the assembled system under the condition that exposed the failure.
- For browser-visible changes, run the repository browser or end-to-end verifier.
- When a correction requests permanent prevention, use the `correct` skill and implement a durable, narrowly scoped artifact.
- Treat `MEMORY.md` as a lean index. Keep behavior in instructions, skills, hooks, permissions, tests, or verifiers.
- Before claiming non-trivial work complete, run the verification recorded in authoritative task state, relevant tests, and an adversarial pass.

**This project's `skills-manifest.json` is not the catalogue.** It binds the few skills this repository requires, and it is deliberately small — most of the harness is installed on the machine and bound to no project at all, so a capability being absent from that manifest says nothing about whether it exists. The catalogue is `~/.agents/INDEX.md`, generated, listing every canonical skill and command with its purpose and per-product visibility; the design material is `~/.agents/design/LIBRARIES.md` and the `design/` tree beside it, which owns animation packages, icon kits, typefaces, design systems, the registry of committed design languages, surface-construction craft, the pre-ship matrix, and the slide and poster medium. Read the index before hand-rolling a workflow, choosing a package, or concluding a capability is missing.

When `~/.agents` does not exist — a cloud container, a fresh machine, any session with no installed harness — that material is not gone; it is in the private harness repository `pyrgos-ai/doug-harness` under `.agents/`, and pulling the file you need from there is the intended route rather than a workaround. Clone or fetch it read-only, use what you need, and never vendor a copy into this repository: a second copy drifts, and the existing-system-first rule above applies to skills and design material exactly as it applies to code.

**Read what other projects' agents filed against this one, at the start, before deciding what to work on.** An agent that finds something wrong here while working somewhere else records it and does not fix it — that is the standing rule, and the record lands in one of two places depending on this project's mode. When `.agents/work/state.json` exists, filed items are ordinary discoveries in the Work Scope queue and `Get-WorkResume.ps1` surfaces them like any other. Otherwise they are in the `agent-harness:intake:v1` managed block in this project's `BACKBURNER.md`, and **nothing surfaces that block automatically**, so reading it is yours to do. Triage what is there, promote what you take into `TASK.md`, and delete nothing to make a count look smaller; an item you reject stays with the reason.

To file one **against another project**, from wherever you are, use the one command that works in both modes rather than editing that project's files by hand:

```
pwsh -File ~/.agents/tools/Add-ProjectIntake.ps1 -Project <name-or-path> -Id <slug> \
  -Title "<what is wrong, in one line>" -From "<the project and task you were doing>" \
  -Relationship <adjacent|prerequisite|follow-up|defect|opportunity> \
  -Value <low|medium|high> -Risk <low|medium|high> \
  -Evidence "verifier=inspection; subject=<what you saw>; result=verified; reference=<path>"
```

Add `-List` to read a project's intake instead of writing to it. A bare project name resolves under the projects root, which is what the folder-name-equals-repo-name convention buys; set `AGENT_PROJECTS_ROOT` where that root differs, as it does in a container.

## Start and resume

1. Read this file, `TASK.md`, and recent `LOG.md`.
2. Run `git status --short --branch` and inspect worktrees before editing.
3. Read `MAP.md` for architecture, data, ownership, integrations, or important paths.
4. Read `DESIGN.md` for interface work and `PRODUCT.md` when present.

## Task-state authority

If the exact project path `.agents/work/state.json` exists, Work Scope is enrolled and that structured file is authoritative. Load and follow the `work-scope` skill, including its scope-guard, ownership, evidence, and handoff rules. Resolve tools from the package containing the loaded skill, then run `Test-WorkState.ps1`, `Get-WorkResume.ps1`, and `Reconcile-WorkState.ps1` with `-Root <project-root>` before changing task state. Treat `PROJECT.md`, `TRACKS.md`, `TASK.md`, `BACKBURNER.md`, and `LOG.md` as generated, read-only views. Route active-cell changes through `Update-WorkState.ps1`, executed checks through `Invoke-WorkScopeEvidence.ps1`, and pre-write ownership checks through `Test-WorkScopeGuard.ps1`. Route adjacent or deferred work through `Capture-WorkDiscovery.ps1`; use `New-WorkHandoff.ps1` for independent outcomes. A present but invalid state file fails closed and never falls back to legacy task files.

When `.agents/work/state.json` is absent, the legacy `TASK.md`, `BACKBURNER.md`, and `LOG.md` files retain their documented ownership. In either mode, durable capability state belongs in `MAP.md`, not in a task file. `STATUS.md` is retired; do not create one.

## Project files

- `TASK.md`: generated Work Scope view when enrolled; otherwise the legacy current goal, actionable queue, blockers, completed evidence, and next verifier.
- `LOG.md`: generated Work Scope view when enrolled; otherwise the legacy append-only completed-work record.
- `BACKBURNER.md`: generated Work Scope discovery view when enrolled; otherwise legacy parked ideas.
- `MAP.md`: architecture, paths, data flow, integrations, and ownership.
- `DESIGN.md`: universal interface rules plus project-specific design rules.
- `PRODUCT.md`: optional product intent for an app or product repository.
- `MEMORY.md`: lean links to durable references.
- `skills-manifest.json`: canonical baseline and project skill bindings.
- `data-manifest.yaml`: external-data authorities, adapters, restore rules, and verifiers.
- `secret-manifest.json`: value-free secret names, providers, trust boundaries, and consumers.
- `.gitignore`: carries a managed `agent-harness:project-gitignore:v1` block covering the task hooks' own runtime state. Put project-owned rules outside the markers; anything inside them is regenerated.
- `.gitattributes`: carries a managed `agent-harness:project-gitattributes:v1` block exempting vendored third-party skills from whitespace linting, since their bytes are referenced and never edited. Project-owned attributes go outside the markers.

## What is managed here, and what is yours

Everything above the closing marker is generated from the shared harness and is replaced on every project sync. Edit it in `.agents/templates/AGENTS.md` in the harness repository, not here. Everything below the marker is this project's own and is never rewritten -- put project identity, real commands, and repository-specific rules there.

The block covered only the portable operating rules until 2026-08-09. The startup procedure, the task-state authority and the project-files list sat outside it, so a correction to any of the three had to be re-applied by hand in every project and drifted the moment one was missed. Douglas ruled (`ahp-project-block-scope`) to widen it to cover all three.
<!-- agent-harness:portable:v4:end -->

## Project identity

- Name: `flight-tracker`
- Purpose: Coordinate the Flight Finder application, its local fast-flights sidecar, operating briefs, and durable research while the application remains in the separate `base-flight-finder` repository.
- Default branch: `master`

## Commands

- Setup: `py -3.12 -m venv fast-flights-sidecar\venv`, then `fast-flights-sidecar\venv\Scripts\python.exe -m pip install -r fast-flights-sidecar\requirements.txt`
- Test: `py -3.12 -m py_compile fast-flights-sidecar\catcher.py fast-flights-sidecar\main.py fast-flights-sidecar\probe.py`
- Lint: `git diff --check`
- Build: `N/A — coordination documents and a Python sidecar`
- End-to-end: `C:\Users\dougl\.agents\tools\Test-AgentProjectState.cmd -Repository .`

Record the actual command or observable proof in `TASK.md` and `LOG.md`.

## Project-specific rules

- Keep the Flight Finder application and its Git history in the sibling `C:\Users\dougl\projects\base-flight-finder` repository.
- Do not commit Python virtual environments, caches, runtime logs, task-hook runtime state, or `.env` files.
- Treat `fast-flights-sidecar\probe.py` as an explicit live network probe; run it only when current fare lookup is intended.

## Product adapters

- Claude loads `CLAUDE.md`, which imports this file.
- Codex loads this file.
- Cursor loads `.cursor\rules\00-project-contract.mdc`, which points here.

When the local shared harness exists, also follow `~/.agents/AGENTS.md`. Repository rules supply the portable fallback for cloud sessions.
