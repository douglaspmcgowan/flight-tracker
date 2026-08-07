# Project instructions

This repository contract travels with the project for Claude, Codex, Cursor, and cloud agents.

<!-- agent-harness:portable:v3:start -->
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
<!-- agent-harness:portable:v3:end -->

## Project identity

- Name: `flight-tracker`
- Purpose: Coordinate the Flight Finder application, its local fast-flights sidecar, operating briefs, and durable research while the application remains in the separate `base-flight-finder` repository.
- Default branch: `master`

## Start and resume

1. Read this file, `CURRENT-TASK.md`, `WORK_QUEUE.md`, `STATUS.md`, and recent `LOG.md`.
2. Run `git status --short --branch` and inspect worktrees before editing.
3. Read `MAP.md` for architecture, data, ownership, integrations, or important paths.
4. Read `DESIGN.md` for interface work and `PRODUCT.md` when present.

## Commands

- Setup: `py -3.12 -m venv fast-flights-sidecar\venv`, then `fast-flights-sidecar\venv\Scripts\python.exe -m pip install -r fast-flights-sidecar\requirements.txt`
- Test: `py -3.12 -m py_compile fast-flights-sidecar\catcher.py fast-flights-sidecar\main.py fast-flights-sidecar\probe.py`
- Lint: `git diff --check`
- Build: `N/A — coordination documents and a Python sidecar`
- End-to-end: `C:\Users\dougl\.agents\tools\Test-AgentProjectState.cmd -Repository .`

Record the actual command or observable proof in `CURRENT-TASK.md` and `LOG.md`.

## Project-specific rules

- Keep the Flight Finder application and its Git history in the sibling `C:\Users\dougl\projects\base-flight-finder` repository.
- Do not commit Python virtual environments, caches, runtime logs, task-hook runtime state, or `.env` files.
- Treat `fast-flights-sidecar\probe.py` as an explicit live network probe; run it only when current fare lookup is intended.

## Project files

- `CURRENT-TASK.md`: active goal, completed evidence, remaining steps, and next verifier.
- `WORK_QUEUE.md`: actionable queue.
- `STATUS.md`: durable capability state.
- `LOG.md`: append-only completed-work record.
- `BACKBURNER.md`: parked ideas.
- `MAP.md`: architecture, paths, data flow, integrations, and ownership.
- `DESIGN.md`: universal interface rules plus project-specific design rules.
- `PRODUCT.md`: optional product intent for an app or product repository.
- `MEMORY.md`: lean links to durable references.
- `skills-manifest.json`: canonical baseline and project skill bindings.

## Product adapters

- Claude loads `CLAUDE.md`, which imports this file.
- Codex loads this file.
- Cursor loads `.cursor\rules\00-project-contract.mdc`, which points here.

When the local shared harness exists, also follow `~/.agents/AGENTS.md`. Repository rules supply the portable fallback for cloud sessions.
