---
name: "source-command-design-review"
description: "Review the UX, information architecture, accessibility, and visual system of an existing built surface. Use for /design-review or requests to critique an app's structure and interface. Review only."
---

# Design Review

Evaluate the running product and return prioritized, evidence-backed design findings. Do not edit the target.

## Procedure

1. Resolve the exact app, route, viewport set, and review scope.
2. Read the nearest `SPEC.md`, project `DESIGN.md`, `MAP.md`, and relevant task state.
3. Launch or connect to the real app.
4. Use Playwright or the available browser-testing tool to inspect:
   - primary journeys;
   - desktop and mobile layouts;
   - loading, empty, error, and success states;
   - keyboard navigation and focus;
   - content hierarchy and overflow.
5. Review independent dimensions:
   - information architecture and task flow;
   - hierarchy, density, and progressive disclosure;
   - interaction clarity and feedback;
   - accessibility;
   - responsive behavior;
   - typography, spacing, color, motion, and component consistency;
   - alignment with `DESIGN.md` and `SPEC.md`.
6. Use product-native subagents for independent dimensions when available, with no shared write ownership.
7. Consolidate findings and verify each against the running surface.

## Finding format

```markdown
### [Severity] Short finding
- Evidence: <route, viewport, state, screenshot, or DOM behavior>
- Impact: <user consequence>
- Principle: <design rule, accessibility criterion, or product requirement>
- Correction: <specific structural or visual change>
- Verify: <browser action or assertion>
```

Severity is `Blocker`, `Major`, or `Minor`.

## Review rules

- Recommend structural changes when evidence shows the current hierarchy or flow fails.
- Tie each recommendation to a product requirement, universal design rule, accessibility standard, or observed user cost.
- Keep aesthetic preference separate from confirmed usability defects.
- Hand major re-architecture to the design skill and visual execution to the installed frontend/design skill.

## Output

Return the tested routes and states, prioritized findings, strengths worth preserving, unresolved evidence gaps, and recommended handoffs.
