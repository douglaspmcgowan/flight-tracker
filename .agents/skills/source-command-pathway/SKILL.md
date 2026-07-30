---
name: "source-command-pathway"
description: "Run a named, ordered chain of installed skills against one target with resumable step state. Use for /pathway, 'run the harden-tail pathway,' or 'resume the pathway.'"
---

# Pathway

Execute an existing skill chain in order. The chain composes canonical skills; it does not copy their procedures.

## Inputs

- Chain name
- Target
- Optional limits passed to compatible steps

## Chain discovery

1. Search the project and shared skill manifests for the named chain.
2. Confirm every referenced skill exists under a discoverable `.agents/skills` location.
3. If the chain is unknown, list the available chain names and stop.

## State

Use the active project `TASK.md` as the durable record:

```markdown
## Pathway: <chain> → <target>
- [x] <skill>: <evidence>
- [~] <skill>: active
- [ ] <skill>: pending
- [!] <skill>: blocked — <reason>
```

Resume from the first unchecked or in-progress step. Recheck the evidence path before skipping a completed step.

## Execution

1. Resolve the target to an exact path or URL.
2. Seed or reconcile the pathway section in `TASK.md`.
3. Run each skill sequentially because later steps consume earlier evidence.
4. Use the active product’s native subagent mechanism when a step benefits from isolated context. Run the step in the main agent when delegation is unavailable.
5. After each step:
   - verify its claimed artifact or result;
   - update the checkbox and evidence;
   - stop on a safety or authority blocker;
   - continue past a non-fatal finding when the next skill can still run safely.
6. Run the project completion verifier after the final step.

## Idempotence

- A checked step may be skipped only when its evidence still exists and remains valid for the current target revision.
- Changed inputs, target revision, or missing evidence reopen the step.
- Never rely solely on a provider run identifier or transient chat state.

## Report

Return the chain, target, completed steps, reopened steps, blockers, verification evidence, and exact files changed.
