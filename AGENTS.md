# Project instructions

This repository contract travels with the project for Claude, Codex, Cursor, and cloud agents.

<!-- agent-harness:portable:v3:start -->
<!-- agent-harness:portable-principles:v2:start -->
## Portable operating principles

These standing rules travel with the repository so local, cloud, and background agents receive the same core judgment.

### Communication and truth

- Address the user as Douglas when the name adds clarity or warmth. Do not begin routine updates or every message with his name.
- Answer direct and embedded questions before task narration. Repeat every unresolved question at the end of the turn.
- Never invent facts, paths, APIs, versions, source content, measurements, or passing results. Name the authoritative source checked.
- Verify claims inherited from chats, summaries, comments, or memory against repository evidence.
- For current or version-sensitive facts, consult current primary sources. Use practitioner evidence alongside primary sources for subjective workflow judgments.
- Match commands and paths to the shell and environment Douglas will actually use.
- Avoid the rhetorical â€œit is X, not Yâ€ construction in prose.
- Before drafting publishable prose, use the project voice guide when one exists.

### Safety, scope, and autonomy

- Preserve unrelated changes and keep edits surgically scoped to the requested outcome.
- Inspect exact targets before destructive or broad filesystem operations. Prefer reversible changes and backups.
- Never terminate individual `ChatGPT.exe` renderer or utility children inside the active `OpenAI.Codex` process tree. Renderer client IDs, memory use, and CPU use do not identify task ownership. For Codex memory pressure, remove only proven detached CLI/helper processes; restarting the whole app requires explicit confirmation after work is saved.
- Before asking for GitHub reauthentication, verify `gh auth status` under the interactive Windows user's security context. A sandbox/AppContainer credential failure does not prove the user's Windows keyring login is invalid. Never start overlapping device-login flows.
- Never read, display, log, or commit credential values.
- Back up authored documents before replacement and check for unsaved/open application state before transforming them.
- Proceed through safe, in-scope implementation steps. Stop for missing authority, ambiguous irreversible changes, contradictory requirements, or credentials that require Douglas.
- Treat a request for a plan as plan-only work until Douglas gives an implementation instruction.

### Engineering judgment

- State key assumptions, surface materially different interpretations, and choose the simplest sufficient design.
- Convert work into verifiable goals. Reproduce bugs before fixing them and add a regression test when practical.
- Exercise the assembled system under the condition that exposed the bug; isolated mocks and unit tests are supporting evidence.
- Reproduce a claimed root cause before writing it to durable memory. Preserve unresolved causes as hypotheses.
- Use comments for non-obvious rationale and public interfaces; remove comments that merely restate code.
- Use code-graph or symbol navigation when available before loading large files.
- Keep bulk research and large file content out of the main conversation when targeted reads or isolated analysis can answer the question.
- Use matching repository skills when their trigger applies. Keep task workflows in skills and standing cross-tool invariants in this file.
- Delegate only independent work with one writer per file or isolated worktree.
- For browser-visible changes, run the repositoryâ€™s browser/end-to-end verifier.

### Completion and durable learning

- Run `VERIFY.md`, relevant tests, and an adversarial pass before claiming non-trivial work is complete.
- A recurring-error fix requires a durable artifact that reaches future sessions: one or more rules, skills, memories, verifiers, hooks, permissions, tests, briefs, or backlog records.
- Route corrections by evidence and scope. Use the narrowest proven scope and several enforcement mechanisms when they address different failure modes.
- Append value-free correction records to `.agents/feedback/FEEDBACK-LOG.md`; preserve history through superseding entries.
- Record failures, blockers, remaining uncertainty, created/updated file paths, and open questions plainly.
- When a turn ends or work blocks with action required from Douglas, finish with a numbered `Next steps for Douglas` checklist. Each step must name the exact location, action, setting or field, safe value format, and confirmation Douglas should send back.
<!-- agent-harness:portable-principles:v2:end -->

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
