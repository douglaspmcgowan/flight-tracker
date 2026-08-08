<!-- agent-harness:universal-design:v1:start -->
## Universal interface rules

The authority is `~/.agents/DESIGN.md`, and it is fuller than this. What follows is
carried here rather than only linked because a cloud or container session has no
`~/.agents` to reach — so the rules that actually change what gets built have to survive
in the repository itself.

### Anti-default discipline

Quoted verbatim from the authority rather than paraphrased, because this is the section an
agent most needs and a paraphrase is a second copy that drifts.

The model's house style is recognizable, and reaching for it reads as machine-made. Never
default to: purple-blue gradients, a centered hero over a dark mesh background, three equal
feature cards, ubiquitous glassmorphism, or Inter with slate everywhere. The
beige-brass-espresso "premium consumer" palette is the same tell; rotate off it.

- Lock one accent color page-wide, and one gray family per project.
- Lock one corner-radius system per page. Mix radii only under a rule you can state.
- Keep one theme per page. Sections do not invert light and dark mid-scroll except as a single deliberate composition device.
- A section layout family appears at most once per page. At most two consecutive image-text zigzag splits. At most one small uppercase eyebrow label per three sections.
- Where a brief reads as an established design system, use that system's official package rather than approximating it. One system per project.
- The brief wins. Honor a pinned aesthetic even when it is not the choice you would make; redirecting a clear brief toward your own taste is failure, not judgment.

### Everything else

- Never use IBM Plex Mono.
- Default to a sans display face. Use serif only with an articulated reason; `Fraunces` and `Instrument Serif` are banned as defaults specifically because they are the common machine-made choice.
- Hero discipline: the hero fits the first viewport, the headline runs at most two lines, subtext stays under roughly twenty words, and no more than four text elements sit inside it. Trust marks and logo walls go below the hero, never in it.
- A grid has exactly as many cells as there is content for. Reshape the grid rather than pasting in a blank tile.
- Every animation names what it communicates — hierarchy, sequence, feedback, or state change. An animation that names nothing gets cut.
- Reread every visible string before shipping. Never invent a precise-sounding number.
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

### Design libraries

Concrete things to reach for — animation packages and working skeletons, icon kits, typeface pools, design-system install commands and canonical documentation. Read the leaf you need; each one loads on its own.

- **Index** `~/.agents/design/LIBRARIES.md`
- **Motion** `~/.agents/design/animation/` — `libraries.md`, `sticky-stack.md`, `horizontal-pan.md`, `scroll-reveal.md`, `liquid-glass.md` (frosted glass), `forbidden.md`
- **Icons** `~/.agents/design/icons/libraries.md`
- **Type** `~/.agents/design/type/families.md`
- **Design systems** `~/.agents/design/systems/install.md` and `sources.md`
- **Design languages** `~/.agents/design/languages/registry.md` — read it before committing a visual world or generating a new design language, and register the world committed for this project there in the same work unit
- **Surface craft** `~/.agents/design/craft/` — `high-end.md` (surface construction), `from-reference.md` (building faithfully from a reference image), `device-mockups.md`
- **Pre-ship matrix** `~/.agents/design/preflight.md` — the mechanical finish check for landing, marketing and portfolio surfaces; not dashboards, not product UI
- **Dashboards and data-dense product UI** — this tree does not own them yet, and the gap is easy to miss because everything above *sounds* general. The pre-ship matrix disclaims them in its own scope line, and the universal rules below contain no rule about chart form, tile hierarchy, table craft or metric emphasis. The nearest real guidance is the ten-dimension rubric inside the `/design-review` command — tile prominence, one-accent discipline, elevation over borders, chart form matched to the data's meaning, tables built as tools — which is written to critique a running app rather than to generate one. A blind probe on 2026-08-08 reached it only by grepping the word "dashboard", and reported it would otherwise have "proceeded confidently and wrongly". Read it before designing a dashboard, and treat the rest of this section as not yet covering you

The full universal rules are `~/.agents/DESIGN.md`. Where a library entry and a rule disagree, the rule wins.

**This list is enumerated because it has to be.** A cloud or container session has no `~/.agents` to walk, so this block is the only routing it gets — which also means a leaf missing here is a leaf that session cannot reach at all. `craft/` and `preflight.md` were absent until 2026-08-07 and every project copy inherited the gap. `Test-DesignLibraryIndex.ps1` now fails the build when this list falls behind the tree.
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
