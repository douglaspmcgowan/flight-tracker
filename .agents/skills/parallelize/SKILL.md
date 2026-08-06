---
name: parallelize
description: Decompose a multi-part task into parallel sub-agent dispatches with explicit objectives, output contracts, and scope boundaries. Trigger when the user says "parallelize", "split this up", "do these in parallel", or when a task obviously has 3+ independent sub-parts.
---

# /parallelize procedure

1. **Restate** the task as a bullet list of candidate sub-parts.

2. **Classify** each sub-part:
   - INDEPENDENT (no shared files, no data dependency) → parallel worker
   - DEPENDS ON another sub-part's output → sequential, after its dependency
   - SHARES a write target with another sub-part → merge into one worker

3. **Reject parallelization** and do it yourself if any is true:
   - Fewer than 3 independent sub-parts remain after classification
   - The total work fits comfortably in the current context window
   - It's a high-stakes refactor the user will need to review line-by-line

4. For each worker, draft a **dispatch packet** before using the product's available subagent mechanism:
   - Objective (one imperative sentence)
   - Output format (exact schema the parent will consume, e.g. `"return markdown: ## Findings\n- <file:line>: <observation>"`)
   - Read-first: `<paths>`
   - Scope boundary: "Do NOT touch `<X>`. Do NOT run `<Y>`."
   - Key rules repeated inline (do NOT rely on AGENTS.md inheritance — sub-agents don't reliably load it)
   - Stop condition: "Return after `<N>` tool calls or when you have `<result>`."

5. **Present** the plan to the user in one block: N workers, their objectives, estimated total tokens. Wait for go-ahead UNLESS the user already said "just do it."

6. **Dispatch** all independent workers together when the product supports concurrent subagents. Use the maximum safe available concurrency, and run any overflow in the next wave. When no subagent mechanism exists, execute the packets sequentially and preserve their scope boundaries.

7. **Synthesize** on return: cite each finding back to its worker and source. Flag conflicts between workers explicitly. Do not silently merge conflicting results.

8. **Post-mortem**: if two workers returned overlapping findings, note it for the user — next run, merge those roles.
