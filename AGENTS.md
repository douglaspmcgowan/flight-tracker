# Project instructions

This repository contract travels with the project for Claude, Codex, Cursor, and cloud agents.

<!-- agent-harness:portable:v4:start -->
## Portable operating rules

If your role can brief, use subagents immediately for every independent, file-disjoint workstream — that is explicit authorization to parallelize. Keep only destructive or dependent final gates serial. A role carrying no `spawns:` does the work itself.

Agents may create local commits for in-scope work without asking. Never push, merge, force-update, discard, delete a worktree, or remove a task workspace unless the user explicitly authorizes that action.

- Answer questions before task narration. Keep routine updates concise. Durable reader-facing results follow `.agents/DOCKET-PROTOCOL.md` → **Brief quality**.
- Never invent facts, paths, APIs, versions, measurements, source content, credential state, or passing results. Verify inherited claims against repository, Git, runtime, or current primary evidence.
- Preserve unrelated changes. Inspect exact targets before destructive work. Never read, display, log, export, or commit credential values.
- Before creating, replacing, renaming, or removing an artifact, search the repository and available shared harness for its owner, equivalents, consumers, wiring, tests, and documentation. Extend the closest adequate owner, make the touch list, and record the result in authoritative task state.
- Resolve `~` and `$HOME` at runtime. Use the repository's tracked `.agents/` material when a fresh machine or cloud container has no `~/.agents`; do not vendor another copy. `INDEX.md` is the canonical skills catalogue, `WORKTREE-PROTOCOL.md` owns isolated worktrees, `VAULT-PROTOCOL.md` owns vault work, and `DOCKET-PROTOCOL.md` owns briefs and decisions.
- Read a named or matching skill in full. Use `brainstorming` for creative or underspecified work, `test-driven-development` for implementation, `systematic-debugging` for bugs, and `requesting-code-review` plus `verification-before-completion` before completion. Route independent, file-disjoint work through `dispatching-parallel-agents`; use the `correct` skill for durable prevention after a recurring correction.
- Use one build loop: product or feature work starts from current specification; personal systems and one-off work use project intent plus observable acceptance. Materialize work, verify it, then re-read the resulting project state against the original intent; when they diverge, re-enter the loop at the earliest stale stage.

## Start and task state

1. Read this file, current task state, recent `LOG.md`, and `INTENT.md` when present.
2. Run `git status --short --branch`, inspect worktrees, then read `MAP.md` and `DESIGN.md` when relevant.

These sit at the project root, not under `.agents/`; an empty read is a failed step, not an absent file. A task that writes nothing runs step 1 only, plus `MAP.md`, and says so in its report. The sequence guards writes; the moment the task acquires one, all of it is owed first.

A project's remote is its truth. Pull before editing and treat work as unfinished while `git status` is dirty or `git log origin/master..HEAD` is non-empty.

3. Read what other agents filed against this project before choosing work. Enrolled: `Add-ProjectIntake.ps1 -List`, or the generated `BACKBURNER.md` — nothing injects these, so reading is yours. Legacy: the `agent-harness:intake:v1` block, which the session-start hook surfaces where the hooks are installed. `Get-WorkResume.ps1` never enumerates the queue. Reject an item with its reason; delete nothing to shrink a count.

If the exact project path `.agents/work/state.json` exists, Work Scope is enrolled and that structured file is authoritative. Load and follow the `work-scope` skill, which owns the tools, guards, evidence, and handoffs; its tools live in `.agents/tools/`, never in the skill package. Never edit the generated views. Invalid state fails closed.

When `.agents/work/state.json` is absent, legacy `TASK.md`, `BACKBURNER.md`, and `LOG.md` retain their owners. Durable capability state belongs in `MAP.md`; `STATUS.md` is retired. To file a finding against another project, use `Add-ProjectIntake.ps1`; the target project owns the repair unless it blocks assigned work or Douglas explicitly redirects it.

## Safety and boundaries

- Do not infer authority for pushes, merges, force updates, deletions, credential use, spending, or publishing. On unattended work, record reversible assumptions and batch approvals rather than stopping safe work.
- Before vault work, read `VAULT-PROTOCOL.md` and the active vault's `IA.md`. Exclude vault-root `AI Reference\`, `40_Reference\AI Reference.md`, vault-root `26_Sensitive\`, `31_Business\Other People Reference.md`, and `Actual Documents\Identity` under the Google Drive root from reads, searches, globs, edits, links, mirrors, and delegated work. Only with Douglas's explicit authorization may a file move one way into `26_Sensitive\`; never read, open, list, enumerate, glob, grep, preview, diff, hash, link, mirror, back up, commit, copy, export, rename, restore, extract, or move anything out.
- For interface work, use `impeccable`, follow `DESIGN.md` and `.agents/design/LIBRARIES.md`, and consult the design-language registry before creating a visual language. Verify browser-visible changes in a browser.
- Update affected routing documents in the same work unit; a deferred documentation update is an unfinished change. Nothing is complete before its tests, the repository verifier, and an adversarial pass are green. When files change, finish with a Files list marking each logical document `NEW` or `UPDATED`, a short summary, and absolute paths.

## What is managed here, and what is yours

Everything above the closing marker is generated from `.agents/templates/AGENTS.md` in the harness repository. Everything below it is project-owned: identity, real commands, local boundaries, and product adapters.
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
