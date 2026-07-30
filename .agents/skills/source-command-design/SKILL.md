---
name: "source-command-design"
description: "Design an app or major feature from problem definition through build-ready requirements, interaction design, visual direction, and verification. Use for /design, senior product-design requests, or whole-feature design planning."
---

# Design

Design the product end to end while preserving one canonical set of universal rules in `DESIGN.md`.

## Modes

- `--plan`: produce the design and implementation plan, then stop.
- `--auto`: continue through implementation when authorized.
- `--collaborate`: batch material questions before committing to a direction.
- `--delegate`: state bounded assumptions and proceed.

## Procedure

1. **Inspect the existing system.**
   - Search for the current app, components, routes, product docs, design system, assets, `SPEC.md`, project `DESIGN.md`, `MAP.md`, and `TASK.md`.
   - Modify the current owner before adding a new module or rule.
2. **Define the product.**
   - Problem, users, jobs, outcomes, scope, constraints, and non-goals.
3. **Research the domain.**
   - Use current product patterns and practitioner evidence relevant to this product type.
4. **Develop concepts.**
   - Produce a small set of materially distinct structures.
   - Compare information architecture, interaction cost, clarity, and implementation risk.
   - Select one direction with explicit rationale.
5. **Specify the experience.**
   - User journeys, routes, states, empty/loading/error cases, content hierarchy, keyboard behavior, responsive behavior, and accessibility.
6. **Apply design rules.**
   - Read the nearest project `DESIGN.md`; fall back to the shared `.agents/DESIGN.md`.
   - Keep typography, interface fonts, spacing, color, motion, and component principles there.
7. **Prepare execution.**
   - Reconcile requirements with `SPEC.md`.
   - Add discrete build and verification items to `TASK.md`.
   - Use installed design and frontend skills that match the surface.
8. **Execute by mode.**
   - Plan mode: stop after the build-ready artifact.
   - Auto mode: implement with the active product’s native subagent mechanism where independent streams are safe.
9. **Verify.**
   - Exercise the real app with browser/end-to-end tests.
   - Review the assembled experience against `DESIGN.md`, `SPEC.md`, and accessibility requirements.

## Deliverables

- Product definition
- Chosen concept and rejected alternatives
- Information architecture and flows
- State and interaction specification
- Visual direction tied to `DESIGN.md`
- Build sequence and acceptance evidence
- Current functionality/status summary

## Constraints

- Avoid duplicating universal design rules inside the skill.
- Do not create a new component, file, or design rule before searching for its existing owner.
- Never invent product facts or user research.
