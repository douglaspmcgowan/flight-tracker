---
provenance: "douglas-core"
name: work-scope
description: "Run project work as one capability-by-depth scope cell with structured state, guards, and evidence gates."
when_to_use: "Control project work as one explicit capability-by-depth scope cell, with authoritative structured state, ownership guards, evidence-gated closure, bounded drilldown or expansion, durable discovery capture, resumable state, and independent-track handoffs. Use when starting, resuming, scoping, expanding, drilling down, handing off, or recording adjacent work in a project that contains .agents/work/state.json or is adopting the work-scope system."
---

# Work scope

Keep `.agents/work/state.json` as the authoritative structured state. Treat `PROJECT.md`, `TRACKS.md`, `TASK.md`, `BACKBURNER.md`, and `LOG.md` as generated views.

Enrolled state is bound to its project, and a moved or copied project must fail validation until it is deliberately re-enrolled through a reviewed migration. Never edit or automatically repair `project.root` to make relocated state appear valid.

What identifies the project is `project.remote` when it is set — the repository this state belongs to, so the same checkout is writable from a container or a second device at any path. When it is not set the state stays **location-bound** to its canonical absolute `project.root`, exactly as before, and a checkout at any other path is read-only. `Reconcile-WorkState.ps1 -BindRemote` is the only way `project.remote` is written: it runs only at the canonical root, reads the value from that checkout's own git origin, and commits through the normal event chain. A project with no remote by design keeps the location bind exactly as before, and a different repository carrying a copy of this state file is still rejected.

## Locate tools

The Work Scope tools live in the **harness tools directory** — `.agents/tools/` — not inside
this package. Resolve it three levels above this `SKILL.md` (`.agents/skills/work-scope/` →
`.agents/tools/`), and invoke them by that path. Pass the target project path through `-Root`.
Never edit generated views directly.

```powershell
$tools = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) 'tools'
```

This package contains only `SKILL.md` and `agents/`. It once shipped its own `tools/`, and the
instruction here still said "two directories above", which resolves to `.agents/skills/` — a
directory with no `tools/` in it. Every invocation below was written as a bare relative
`tools/...` path against that root, so all of them failed as written. The package-local copies
now live in `~\.agents\archive\work-scope-pilot-20260806\tools\`, which dates the breakage to
that move.

## Start or resume

1. If `.agents/work/state.json` exists, run:

   ```powershell
   pwsh -NoProfile -File $tools/Test-WorkState.ps1 -Root <project-root>
   pwsh -NoProfile -File $tools/Get-WorkResume.ps1 -Root <project-root>
   pwsh -NoProfile -File $tools/Reconcile-WorkState.ps1 -Root <project-root>
   ```

2. If state does not exist, classify the request into:

   - project and project kind;
   - initiative;
   - one outcome-oriented primary track;
   - one capability;
   - starting depth and target depth;
   - frontier mode, depth ceiling, breadth boundary, and selection strategy;
   - current session owner.

3. Initialize with `$tools/Initialize-WorkScope.ps1`.
4. Materialize only the tasks needed for the active scope cell. Each task must
   declare its exact executable, value-free argv, immutable verifier inputs,
   result artifact set, timeout, and output ceiling through the `Check*`
   parameters of
   `Update-WorkState.ps1 -Action add-task`.

Use `computer-operations` for machine-level work, `agent-harness` for shared agent behavior, and the application project for product behavior.

## Execute one cell

Before each write or consequential action:

1. Run the scope guard with the action, artifact, session, and capability.
2. Stop on a rejected guard result. Resolve ownership collisions rather than overwriting.
3. Claim artifact ownership with `Update-WorkState.ps1 -Action set-ownership`.
4. Execute a ready task.
5. Produce executed verification evidence through `Invoke-WorkScopeEvidence.ps1`.
6. Complete the task using only the returned receipt ID.

These pre-action steps govern work inside an active cell. The frontier selector
is internally guarded as a post-closure state-machine transition: do not
preflight `Select-FrontierWork.ps1` as an ordinary `modify` or `create`, and do
not claim its generated handoff file. The selector itself requires a closed
cell, checks automatic mode, boundaries, dependencies, blockers, conflicts,
and ownership, and serializes its state, event, and handoff commit.

Never close a task or cell based on an agent assertion or a caller-written
`result=pass` string. Run the task's exact declared, value-free test or command
as an argv array. `Subject` must be the task ID:

```powershell
$check = @{
  Root = "<project-root>"
  CheckId = "<declared-check-id>"
  Verifier = "test"
  Subject = "<task-id>"
  Executable = "<executable-path>"
  Arguments = @("<arg-1>", "<arg-2>")
  Artifacts = @("<project-local-artifact>")
}
& $tools/Invoke-WorkScopeEvidence.ps1 @check
```

Invoke wrappers in-process with PowerShell splatting so array boundaries are
preserved. Do not pass array-valued parameters through a nested native
`pwsh -File` call.

The task state retains the exact value-free argv so `Get-WorkResume.ps1` can
return an executable invocation to another process. Never place tokens,
passwords, keys, credentials, or other secret values in check arguments; use
named environment/secret handles managed outside work-scope state.

The runner accepts native `.exe` processes only, executes in the canonical
project root without holding the state lock, passes arguments through
`ProcessStartInfo.ArgumentList`, validates declaration-time hashes for
verifier inputs such as a PowerShell `-File` script, enforces the declared
timeout and output
ceiling, and terminates the process tree on either limit. Invoke `.ps1` scripts
through a declared `pwsh.exe`; never pass `.cmd` or `.bat` as the executable.
It records exit status, timestamps, value-free output and argument digests, and
project-local artifact snapshots without storing raw command output or
argument values. A zero exit produces a receipt ID atomically bound into the
hashed event chain. Complete a task with:

```text
receipt=<receipt-id>
```

Cell closure must receive exactly the receipts already bound to all of its
closed tasks; a receipt cannot satisfy another task or scope cell.

Referenced artifacts must resolve physically inside the project across Windows
junctions or symbolic links. Later receipt or artifact drift invalidates
reconciliation. Manual inspection alone is not closure evidence; create and
run an executable check for its acceptance condition.

Discovery capture (which does not close work) still accepts this descriptive
form:

```text
verifier=<test|command|inspection|artifact|source>; subject=<subject>; result=<pass|verified>; reference=<existing project-local relative artifact path>
```

Materialize at least one task with explicit acceptance criteria before closing a cell.

## Capture discoveries

Send adjacent, follow-up, defect, prerequisite, and opportunity work to `Capture-WorkDiscovery.ps1`. Do not change the active cell while capturing it.

The backburner is a discovery queue. Select from it only after the active cell closes.

## Close and transition

1. Ensure every task in the active cell is closed.
2. Run the defined acceptance checks.
3. Close the cell with `Update-WorkState.ps1 -Action close-cell -Evidence <evidence>`.
4. Run `Test-WorkState.ps1` and `Reconcile-WorkState.ps1`.
5. If automatic frontier work is enabled, run `Select-FrontierWork.ps1`.

For `drilldown`, open only the next depth for the same capability and stop at the lower of target depth or depth ceiling.

For `expand`, select only ready work allowed by the breadth boundary and selection strategy. Do not bypass blockers, dependencies, conflicts, or ownership.

## Independent outcomes

When work has distinct ownership, artifacts, deployment, or a different primary outcome:

1. Capture it as a backburner item.
2. Generate a handoff with `New-WorkHandoff.ps1`.
3. Give the handoff to an independent session.
4. Keep the coordinating session's active cell unchanged.

Use safe IDs containing only letters, digits, dots, underscores, and hyphens. Handoffs refuse path separators and existing-file replacement. Pass `-Overwrite` only after explicit authorization.

## Consequential changes

Show a concise interpretation before changing frontier mode, ceiling, breadth boundary, project boundary, or ownership. Apply an approved frontier change with `Set-WorkFrontier.ps1 -Confirmed`. Stop for destructive action, external publishing, unresolved collision, missing credential, or any boundary change that lacks explicit authority.

Ownership is exclusive. Never claim an artifact owned by another session. Transfer ownership only with `Update-WorkState.ps1 -Action transfer-ownership ... -Confirmed`.

## Required finish

Before reporting completion:

1. Validate state.
2. Repair any pending transaction with `Reconcile-WorkState.ps1 -Repair`, then revalidate.
3. Reconcile generated views, the full event payload hash chain, closure
   receipts, ownership collisions, and evidence artifact hashes.
4. Confirm the event log contains typed, evidence-bearing closure transitions.
5. Report the active or closed cell, evidence, captured discoveries, generated handoffs, and exact next valid action.
