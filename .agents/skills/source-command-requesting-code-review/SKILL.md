---
name: "source-command-requesting-code-review"
description: "Use when completing tasks, implementing major features, or before merging to verify work meets requirements"
---

# source-command-requesting-code-review

Use this skill when the user asks to run the migrated source command `requesting-code-review`.

## Command Template

# Requesting Code Review

Dispatch a code reviewer subagent to catch issues before they cascade. Give the reviewer precisely crafted evaluation context without the full session history. This keeps the reviewer focused on the work product and preserves the primary context for continued work.

**Core principle:** Review early, review often.

## When to Request Review

**Mandatory:**
- After each task in subagent-driven development
- After completing major feature
- Before merge to main

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

## How to Request

**1. Get git SHAs:**
```powershell
$baseSha = git.exe rev-parse HEAD~1  # or origin/main
$headSha = git.exe rev-parse HEAD
```

**2. Dispatch code reviewer subagent:**

Use the product's available subagent mechanism with the description, requirements, base SHA, head SHA, scope boundaries, and requested severity format listed below. Review inline when no subagent mechanism exists.

**Placeholders:**
- `{DESCRIPTION}` - Brief summary of what you built
- `{PLAN_OR_REQUIREMENTS}` - What it should do
- `{BASE_SHA}` - Starting commit
- `{HEAD_SHA}` - Ending commit

**3. Act on feedback:**
- Fix Critical issues immediately
- Fix Important issues before proceeding
- Note Minor issues for later
- Push back if reviewer is wrong (with reasoning)

## Example

```
[Just completed Task 2: Add verification function]

You: Let me request code review before proceeding.

$baseSha = git.exe rev-parse HEAD~1
$headSha = git.exe rev-parse HEAD

[Dispatch code reviewer subagent]
  DESCRIPTION: Added verifyIndex() and repairIndex() with 4 issue types
  PLAN_OR_REQUIREMENTS: Task 2 from docs/superpowers/plans/deployment-plan.md
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661

[Subagent returns]:
  Strengths: Clean architecture, real tests
  Issues:
    Important: Missing progress indicators
    Minor: Magic number (100) for reporting interval
  Assessment: Ready to proceed

You: [Fix progress indicators]
[Continue to Task 3]
```

## Integration with Workflows

**Subagent-Driven Development:**
- Review after EACH task
- Catch issues before they compound
- Fix before moving to next task

**Executing Plans:**
- Review after each task or at natural checkpoints
- Get feedback, apply, continue

**Ad-Hoc Development:**
- Review before merge
- Review when stuck

## Red Flags

**Never:**
- Skip review because "it's simple"
- Ignore Critical issues
- Proceed with unfixed Important issues
- Argue with valid technical feedback

**If reviewer wrong:**
- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification
