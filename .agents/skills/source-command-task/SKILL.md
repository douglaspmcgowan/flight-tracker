---
name: "source-command-task"
description: "Extract every discrete task, question, investigation, decision, constraint, and excluded item from a structured or messy prompt; reconcile them with project task state; and produce an executable, parallel-aware queue. Use for /task, long multi-intent prompts, or requests to track everything asked."
---

# Task Intake

Turn the full request into durable, verifiable task state without losing embedded questions.

## Procedure

1. Read the entire prompt and any attached text.
2. Inspect the existing project `TASK.md` before creating task state.
3. Extract each discrete item once:
   - `TASK`
   - `QUESTION`
   - `INVESTIGATE`
   - `DECISION`
   - `CONSTRAINT`
   - `OUT-OF-SCOPE`
4. Reconcile with current entries:
   - merge duplicates;
   - preserve completed evidence;
   - reopen an item when new evidence invalidates it;
   - carry forward unresolved items explicitly.
5. Give every actionable item:
   - a short verb-led title;
   - success evidence;
   - dependencies;
   - ownership or target file area;
   - status;
   - parallelization class.
6. Answer direct and embedded questions in chat before execution narration, and record answering each one as an actionable queue task with success evidence.
7. Write only the actionable queue to `TASK.md`; keep answer prose in chat or the relevant durable topic document.
8. Dispatch independent, file-disjoint clusters through product-native subagents when available. Keep dependent or tightly coupled work in order.
9. Update task status only after verifying the stated evidence.

## Parallelization classes

- `PARALLEL`: independent scope and distinct write ownership.
- `SEQUENTIAL`: consumes another item’s output.
- `MAIN`: small, coupled, or coordination-heavy.
- `BLOCKED`: needs authority, credentials, or a material decision.

## `TASK.md` shape

```markdown
# Task

Goal: <one sentence>

## Queue
- [~] T1 — <action> | evidence: <check> | owner: <area>
- [ ] T2 — <action> | after: T1 | evidence: <check>
- [ ] Q1 — Answer <question> | evidence: direct answer delivered with sources when needed
- [?] D1 — Resolve <decision and why it matters>

## Next verifier
`<exact command or check>`
```

## Constraints

- Do not invent missing intent.
- Do not create a second task system when `TASK.md` exists.
- Do not create an `Answers` section or duplicate answer ledger in `TASK.md`.
- Keep task entries concise; link durable detail from `MAP.md`, `DESIGN.md`, or `MEMORY.md`.
- Preserve explicitly rejected ideas as constraints so another agent does not reintroduce them.

## Completion

Report every extracted item, what entered `TASK.md`, what can run in parallel, dependencies, blockers, and the exact next verifier.
