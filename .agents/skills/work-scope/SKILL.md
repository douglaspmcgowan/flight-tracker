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

Use Work Scope guards for consequential writes and record its evidence after the direct reproduction, owner edit, focused test, and user-surface check are stable. This is timing discipline only: it never waives required mutation paths, closure evidence, or safety gates.

Before each write or consequential action:

1. Run the scope guard — `Test-WorkScopeGuard.ps1` — with the action, artifact, session, and capability.
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

The project's root `INTENT.md` is the one artifact the guard does not scope to
a cell, because the contract defines it as the thing that outlives every cell.
A `modify` or `create` there is allowed with no active cell and with no
capability that would be the right one to cite — scoping it to a cell meant a
finished project could never record another binding intent. Nothing else is
relaxed: ownership collisions, artifacts outside the project, deletion,
publication, and credential access still refuse, a nested `INTENT.md` is
ordinary work product, and every other post-closure write still returns
`cell_not_active`.

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

## Session modes

Session posture is event-only rather than another mutable state field. Record conductor mode through `Update-WorkState.ps1 -Action set-session-mode -SessionId <session> -Mode conductor -ModeStatus on|off -Goal <governing goal>`; `TASK.md` renders the latest mode event for each session above the active work. This never changes the active cell goal.

For a bounded simple task or sidequest in an enrolled project, a session may create
`.no-workscope.<session-id>` at the project root (or in the session state directory). This is a
hook-only lightweight mode: it suppresses Work Scope continuation/context for that session so the
agent can keep an in-chat checklist. It does not switch authority to legacy `TASK.md`, permit edits
to generated views or `.agents/work/state.json`, or waive guards, ownership, security, or other
project permissions. Remove the marker before returning to normal project work.

Send adjacent, follow-up, defect, prerequisite, and opportunity work to `Capture-WorkDiscovery.ps1`. Do not change the active cell while capturing it.

The backburner is a discovery queue. Select from it only after the active cell closes.

Change a discovery's status with `Update-WorkState.ps1 -Action retire-discovery`. **Blocking one requires naming what it waits on**, through `-Blockers` — a prerequisite id, or an open decision id from the owning project's `05 Decisions\<Project> - Open Decisions.md`. `-Reason` alone does not satisfy this and cannot: it goes to the event log and never lands on the item, while `Test-TaskStateFormat.ps1` grades the item. An item that already names a prerequisite in `dependencies` or `blockers` has made the record and needs no `-Blockers`. Moving a discovery *out* of blocked clears them, so task state never carries a stale reason beside a new status.

A dependency name resolves to a discovery first; otherwise an exact capability id satisfies it only after that capability is closed.

Correct a discovery with `Update-WorkState.ps1 -Action amend-discovery`, which takes `-Reason` plus optional `-Title`, `-DiscoveryValue` and `-DiscoveryRisk`. It never changes status, so retirement keeps exactly one writer, and it is legal on a **closed** item — which is the case it exists for. Retirement refuses the status an item already holds, so before this a wrong fact in a closure reason could only be written down outside the state file. The correction appends: the previous value of every field it touches stays on the item, and the generated `BACKBURNER.md` carries a **Corrections** section, because a correction only the state file knows about is invisible to the reader it was written for. Recapturing the same finding under a new id is not the correction path and loses the thread between the two records.

## Close and transition

1. Ensure every task in the active cell is closed.
2. Run the defined acceptance checks.
3. Close the cell with `Update-WorkState.ps1 -Action close-cell -Evidence <evidence>`.
4. Run `Test-WorkState.ps1` and `Reconcile-WorkState.ps1`.
5. If automatic frontier work is enabled, run `Select-FrontierWork.ps1`.

For a small, explicitly confirmed continuation of the just-closed capability, use
`Update-WorkState.ps1 -Action start-followup -TrackId <same-track> -CapabilityId <same-capability> -PriorCellId <closed-cell> -PriorClosureEventId <exact-closure-event> -Reason <reason> -Confirmed`.
It opens a fresh, uniquely identified active cell at the same depth and preserves the closed cell's
task receipts in immutable history. It refuses an active or blocked cell, any other track or
capability, mismatched closure provenance, or selected discovery; use normal frontier selection for
anything broader. Claim or transfer ownership through the existing ownership actions before writes.

To select one ready discovery intentionally rather than by ranking, use `Select-FrontierWork.ps1 -DiscoveryId <id> -Confirmed`; it remains subject to dependency, ownership, and breadth guards.

When external authority, authentication, or another named prerequisite blocks the cell after every executable task is closed or retired, park it with `Update-WorkState.ps1 -Action block-cell -Reason <reason> -Blockers <ids-or-prerequisites>`. This marks the selected discovery and capability blocked, preserves the cell in the event chain, and releases frontier selection without inventing completion evidence. Never use it to skip an open task or an inconvenient failing verifier.

A blocked cell whose named blocker has genuinely lifted resumes only through `Update-WorkState.ps1 -Action resume-cell -Reason <reason>`; it restores the cell to `active`, restores a backing discovery to `selected` when the cell had one, clears the capability's blockers, and records a typed event. This is the *only* exit from `blocked`, so it accepts every blocked cell: one that was never discovery-bound (the initial cell, and any follow-up cell), and one already holding closed or retired tasks. A blocked cell cannot be closed — `close-cell` refuses anything but an active cell, because a capability that reaches `closed` while still naming an unresolved blocker is a false completion that `Test-WorkState.ps1` cannot see. Resume first, then close on the cell's own receipts.

Historical selected residue is repaired only through `Update-WorkState.ps1 -Action recover-selected-discovery`. Supply the selected discovery id, target `closed` or `ready` status, fresh evidence, and the exact historical selection event id. Closing additionally requires its matching closure event id; returning a handoff-selected item to ready requires its matching handoff event id. The command refuses a live cell, mismatched event pair, or an interval with another selection, so it cannot turn an ambiguous history into completion.

For `drilldown`, open only the next depth for the same capability and stop at the lower of target depth or depth ceiling.

For `expand`, select only ready work allowed by the breadth boundary and selection strategy. Do not bypass blockers, dependencies, conflicts, or ownership.

## Independent outcomes

When work has distinct ownership, artifacts, deployment, or a different primary outcome:

1. Capture it as a backburner item.
2. Generate a handoff with `New-WorkHandoff.ps1`.
3. Give the handoff to an independent session.
4. Keep the coordinating session's active cell unchanged.

Use safe IDs containing only letters, digits, dots, underscores, and hyphens. Handoffs refuse path separators and existing-file replacement. Pass `-Overwrite` only after explicit authorization.

Handoff is automatic while `frontier.handoff_independent_tracks` is true, which is what initialization sets. The selector then routes every discovery whose suggested track differs from the active track — and every capability owned by another session — into a handoff and leaves the active cell closed. The receiving session hits the same branch, so a genuinely new track cannot be started anywhere while the flag is on. To take one such item into this session, prefer `Select-FrontierWork.ps1 -TakeIndependentTrack -Confirmed`. It applies for that single selection: the persisted frontier is untouched, the breadth boundary is widened to project scope for the call when it was `capability` or `track`, and the event records `took_independent_track` so the reason a foreign track opened stays legible. It waives the track guard only — a capability another session owns is still handed over, because that guard protects someone else's artifacts rather than this session's convenience.

Change the setting itself only when the project's standing policy is wrong, with `Set-WorkFrontier.ps1 -HandoffIndependentTracks $false -Confirmed`; omit the parameter and the current setting is left alone. Two things to know before flipping it. The breadth boundary must be wider than `track`, or a foreign-track item is filtered out of the candidate set before the handoff branch is reached at all. And the flag gates the foreign-*owner* case too: with it off, the selector will open a capability another session owns instead of handing it over.

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
