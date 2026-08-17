---
name: task
description: "Turn a mixed prompt into complete, ordered work while separating durable intent from current task changes."
when_to_use: "Use for a substantive mixed prompt, correction, preference, ruling, or unclear request: 'break this prompt down', 'triage this', 'what did I ask for', 'plan this out', '/task', 'record that preference', 'is this a standing rule', or 'check my intent'. It accounts for every clause, queues actionable work, identifies decisions, and classifies task adjustments versus project intent."
---

# /task [prompt or reference] [--collaborate|--delegate]

Task is the routing seam between a user message and durable project work. It decomposes the full
message, answers direct questions first, and leaves no actionable clause silently unclassified.

## Detect the mode once, first

`.agents/work/state.json` exists → **enrolled**. Otherwise → **light**. Everything below branches
on that one answer.

## One model, two backends

**Intent** is prose: why this project exists and what good looks like. **Specs** are testable
statements of what must be true. **Tasks** are the steps that make a spec true.

Closure is graded against the specs, not against an empty queue. A drained queue with an unmet spec
is unfinished work, and both backends keep going rather than stopping.

There is deliberately **no third "requirements" list**. A requirement and a specification are the
same testable statement at two altitudes; kept as two artifacts the copies drift. Do not add one.

At the execution seam, product or feature work starts from a current specification; refresh the
existing owner or route through `spec` before implementation. Personal systems and one-off work may
proceed from project intent plus observable task acceptance. At closure, re-read the resulting
project state against the original intent and route any divergence back to the earliest stale stage.

| | Enrolled | Light |
|---|---|---|
| Intent | `Update-WorkState.ps1 -Action set-intent -Intent <prose>` | `## Intent` prose in `TASK.md` |
| Spec | `-Action add-spec -SpecId <id> -Statement <testable>` | `- [ ]` under `## Specs` |
| Spec is met | **derived** — a closed task naming it in `-Satisfies` carries evidence | **manual** — you tick the box |
| Step to do | `-Action add-task` in the active cell | `- [ ]` under `## Queue` |
| In progress | task status | `- [~]` under `## Active` |
| Adjacent or deferred item (a **discovery**) | `Capture-WorkDiscovery.ps1` | a line in `BACKBURNER.md` |
| Waits on prior work | discovery or cell `blocked`, with `-Blockers` | `- [!]` under `## Blocked`, with `blocked on:` |
| Waits on Douglas | blocked, naming an open decision id | `- [?]` under `## Needs decision`, quoting that id |
| Evidence | `Invoke-WorkScopeEvidence.ps1` receipt | `done when:` or a backticked command |
| Durable history | event chain; `LOG.md` is generated | append one line to `LOG.md` |

**Discovery** is the word for the item in both modes; "backburner" names the file, never the item.

Derived-versus-manual is the one real asymmetry. Enrolled, a spec cannot be marked met by assertion —
only a closed task that named it produces the status, and retiring that task takes the spec back to
unmet. Light, the checkbox is the whole record, so tick it only against the same observable proof a
task would have had to produce.

## Enrolled mechanics

`Work Scope is authoritative`, and `PROJECT.md`, `TRACKS.md`, `TASK.md`, `BACKBURNER.md`, and `LOG.md`
are `generated read-only views` — never hand-edit them. Load `work-scope`, which owns the full
procedure, and resolve its tools from the package containing that loaded skill. Validate and resume
with `Test-WorkState.ps1`, `Get-WorkResume.ps1`, and `Reconcile-WorkState.ps1`; check writes with
`Test-WorkScopeGuard.ps1`; record executed checks through `Invoke-WorkScopeEvidence.ps1`; route
adjacent findings through `Capture-WorkDiscovery.ps1`; hand independent outcomes to
`New-WorkHandoff.ps1`. Invalid state `fails closed` and never falls back to the `legacy` files.

`Get-WorkResume.ps1` returns `spec_gap` naming the unmet spec once the cell is closed. It ranks
below frontier work and above `stop`: do queued work first, but never stop on an unmet spec.

## Light mechanics: the `TASK.md` shape

`TASK.md` is the task state, `BACKBURNER.md` the discovery queue, `LOG.md` the append-only history.
You edit them directly. `.agents/templates/TASK.md` is the template; the shape is:

```markdown
# Task
## Intent
Why this project exists and what good looks like. Durable across requests.
## Specs
- [ ] A testable statement of what must be true when the request is met.
## Goal
The active outcome.
## Active
- [~] The one item being worked.
## Queue
- [ ] The next step — done when: <observable check>, or a `verifier command`.
## Blocked
- [!] The item — blocked on: <prerequisite, owner, or @name>.
## Needs decision
- [?] The question — <open-decision-id quoted verbatim>.
## Completed
- [x] Current completion evidence only; durable history goes to LOG.md.
## Verification
- Next: the exact command or observable proof.
```

Markers: space queued, `~` active, `x` complete, `!` blocked, `?` decision. The Stop hook reads
`[ ]` and `[~]` as actionable, `[!]` and `[?]` as parked.

`Test-TaskStateFormat.ps1 -Root <project-root>` grades this file. The failures you will hit: a
missing running/queue/blocked/completed area, completed work under the running area, a queue item
with no observable done-check, a blocked item naming no owner, one item in two state sections, and a
`[?]` item quoting no open decision id from `05 Decisions\<Project> - Open Decisions.md`.

Two honest limits. `## Intent` and `## Specs` are invisible to that grader — it neither requires nor
checks them. And an unmet spec is enforced only by the Stop hook, which continues the session while
any `## Specs` box is unticked — except that parked-only work wins, because an unmet spec is not a
reason to prod someone waiting on Douglas. A folder with no harness hooks has no enforcement at all.

## Procedure

1. **Collect context.** Read the project contract, current task state, recent work log, and root
   `INTENT.md` when present. For an empty argument, compare recent requests with task state and
   report any unresolved discrepancy from evidence in the current environment.
2. **Classify every clause once.** Use `TASK`, `QUESTION`, `INVESTIGATE`, `DECISION-NEEDED`, `COMMENT`,
   or `OUT-OF-SCOPE`. Answer `QUESTION` items before narration. Mark an ambiguous or irreversible
   clause as a decision instead of guessing it.
3. **Separate current work from durable intent.** A statement changing scope, target, priority, or
   sequence belongs in task state. One that would govern later work belongs in project intent only
   when its wording and evidence meet the project's intent standard; otherwise keep it provisional
   and surface it at the next checkpoint.
4. **State what must be true before what to do.** Turn the request into specs, then into tasks, each
   with a class, dependencies, exclusive write target, and a `done when` check. Enrolled, name the
   spec each task answers. Route three or more file-disjoint items to `dispatching-parallel-agents`;
   feature design to `design`; creative underspecification to `brainstorming`; known failures to
   `systematic-debugging`.
5. **Order and record.** Sequence prerequisites before dependents. Write through the mode's owner
   from the table. Capture adjacent work as a discovery instead of folding it into the request.
6. **Report compactly.** List queued tasks, investigations, decisions, assumptions, and out-of-scope
   items, each with a reason or observable next step. Reconcile the component count to the source
   prompt, and name any spec still unmet.

## Close by routing, not by duplicating procedures

Substantial results meant to be read later follow the owning Docket and vault brief protocol. An open
decision gets the project's concise decision block, paired with task state by quoting its id. Use
`documentation-unit` for every routing surface a shape, ownership, state, or deliverable change
touches, then `verification-before-completion` and `requesting-code-review`.

## Safety

Never hand-edit generated task views, tick a spec you have no proof for, make hidden assumptions for
an irreversible action, or replace an existing owner with a new queue or summary. Preserve unrelated
requests as explicit out-of-scope items or discoveries.
