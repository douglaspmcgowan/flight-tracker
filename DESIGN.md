<!-- agent-harness:universal-design:v1:start -->
## Universal interface rules

- Never use IBM Plex Mono.
- Use a proportional body face for prose, navigation, labels, dates, names, and human-readable metadata.
- Reserve monospace for code, commands, identifiers, timestamps, and genuinely tabular numeric data.
- Define explicit body, display, and monospace roles. Use tabular numerals on the proportional face for aligned quantities.
- Establish hierarchy through size, weight, spacing, and placement before decoration.
- Give each screen a clear primary action or reading path. Use spacing and alignment to show relationships.
- Reuse existing tokens and components before adding variants.
- Cover relevant default, hover, focus, active, disabled, loading, empty, error, and success states.
- Use semantic structure and native controls, visible keyboard focus, logical tab order, accessible names, sufficient contrast, and non-color state cues.
- Support narrow, medium, and wide layouts, zoom, text resizing, touch targets, and reduced motion.
- Inspect the existing design system, screenshots, and implementation before proposing a new rule or component.
- Verify browser-visible work with browser or end-to-end tests across responsive, keyboard, loading, empty, and error behavior.
<!-- agent-harness:universal-design:v1:end -->

# Design record

## Goals

- Keep human-facing operating material readable in Markdown.
- Keep the coordination surface clearly separated from the Flight Finder application repository.

## Constraints

- Universal interface rules come from the shared harness.
- Application interface decisions live in `base-flight-finder`.

## Decisions

- This repository carries coordination documents and the local fast-flights sidecar.
- The Flight Finder application remains an independently versioned repository.
