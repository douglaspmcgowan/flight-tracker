---
name: "source-command-recon"
description: "Map the current landscape for an approach, tool, or process and compare it with the user's actual setup. Use for /recon, landscape questions, adoption decisions, or improvement research."
---

# Recon

Produce an evidence-backed comparison between current practice and the actual local system.

## Modes

- `--babysit`: map the field, identify decision points, and surface focused follow-up questions.
- `--auto`: map the field, choose the highest-leverage supported moves, and provide concrete next actions.

## Procedure

1. **Define the decision.** State the topic, scope, constraints, and what the research must help decide.
2. **Inspect the existing system.**
   - Search the repository, `.agents/skills`, project `MEMORY.md`, `MAP.md`, `DESIGN.md`, `TASK.md`, manifests, settings, and relevant integrations.
   - Treat inherited descriptions as leads and verify them against files.
3. **Research the landscape.**
   - Use current primary sources for capabilities and limits.
   - Add practitioner evidence for workflow quality, reliability, and friction.
   - Read deeper than product landing pages for shortlisted candidates.
4. **Build the comparison.**

| Approach | Proven mechanism | Evidence | Fit with current setup | Verdict |
|---|---|---|---|---|
| … | … | … | path or source | Have / Partial / Gap |

5. **Synthesize.**
   - Separate established facts, practitioner reports, and inferences.
   - Identify overlaps, missing capabilities, migration cost, and likely simplifications.
6. **Finish by mode.**
   - Babysit: ask only the questions that materially change the next investigation.
   - Auto: rank the supported moves by value, effort, reversibility, and dependency.

## Delegation

Parallelize independent source families or local-system inspection with product-native subagents when available. Give each worker a distinct scope and require citations or file evidence.

## Output

Return the decision summary, landscape map, current-system mirror, comparison table, recommendation, uncertainties, and source links. Save a durable brief only when the user asks for one or the project contract requires it.
