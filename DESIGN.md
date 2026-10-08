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

### Names that appear here only to be forbidden

The rules above and below name specific typefaces in order to ban them. A project that
scans its own source for banned font names will find those names *here* and report this
file as the violation — measured on `base-flight-finder`, 2026-08-07, whose typography
policy test failed against text whose whole purpose is to forbid the thing it names.

**If you write such a scan, exclude the region between the two `agent-harness:universal-design`
marker comments.** That region is generated and is replaced wholesale on every sync, so
nothing a project owns ever lives inside it. The names are also declared machine-readably
on the next line, so a scanner can subtract them without parsing prose. `Test-DesignBlockScanSafety.ps1`
fails the build if any of them appears outside the markers, which is what makes the
exclusion sufficient rather than merely conventional.

**Match on word boundaries, not substrings.** `Inter` is a prefix of interaction,
interface, internal and interval, so a bare substring scan reports a violation on ordinary
English. That is a second, independent cause of the same false positive, and it lives on
your side of the line rather than in this block — the check above hit it on its own first
run, against the heading "Interaction and accessibility" a few sections down.

<!-- agent-harness:design-prohibited-names: IBM Plex Mono, Inter, Fraunces, Instrument Serif -->

### Everything else

- Never use IBM Plex Mono.
- **Never set anything in a monospace typeface unless it is code.** Not numbers, not labels, not reference tags, not captions, not credits, not timestamps. Monospace outside a code block is a costume that says "technical" and reads as machine output. Numerals that need to line up get `font-variant-numeric: tabular-nums` on the normal face instead.
- **Never use the middle dot as a separator.** No `·`, and no bullet character standing in for it. Separate with an en dash, a slash, a comma, or plain whitespace with a rule. The middle dot reads as machine-assembled metadata everywhere it appears, which is why it is out on every surface, not just decks.
- **Never write a line that is only "The" plus a noun.** "The transfer function", "The result", "The problem" — a bare definite noun phrase standing alone is the most common shape in machine-written copy and carries no more information than the noun alone. A title may open with "The"; a label, a bullet or a caption may not be one.
- **Never title anything as a noun followed by a rhythmic tag.** "The argument, rung by rung", "The story, piece by piece", "Design, from the ground up". The tag adds cadence, not meaning, and it is the tell that a title was composed rather than named. Title the thing by what it is.
- **A reference shown to a reader must be identifiable without the source document.** A bare bracket number or a bare superscript means nothing to someone who does not have the bibliography open, which on a slide or a poster is everyone. Name the author and year, and put the numbering in a source line if the numbering itself matters.
- Default to a sans display face. Use serif only with an articulated reason; `Fraunces` and `Instrument Serif` are banned as defaults specifically because they are the common machine-made choice.
- Hero discipline: the hero fits the first viewport, the headline runs at most two lines, subtext stays under roughly twenty words, and no more than four text elements sit inside it. Trust marks and logo walls go below the hero, never in it.
- A grid has exactly as many cells as there is content for. Reshape the grid rather than pasting in a blank tile.
- Every animation names what it communicates — hierarchy, sequence, feedback, or state change. An animation that names nothing gets cut.
- Reread every visible string before shipping. Never invent a precise-sounding number.
- Use a proportional body face for prose, navigation, labels, dates, names, and human-readable metadata.
- Reserve monospace for code and commands only, and set it in a code block. Identifiers, timestamps and numeric columns take the proportional face.
- Define explicit body and display roles, and a monospace role only where the surface actually renders code. Use tabular numerals on the proportional face for aligned quantities.
- Establish hierarchy through size, weight, spacing, and placement before decoration.
- Give each screen a clear primary action or reading path. Use spacing and alignment to show relationships.
- Reuse existing tokens and components before adding variants.
- Cover relevant default, hover, focus, active, disabled, loading, empty, error, and success states.
- Use semantic structure and native controls, visible keyboard focus, logical tab order, accessible names, sufficient contrast, and non-color state cues.
- Support narrow, medium, and wide layouts, zoom, text resizing, touch targets, and reduced motion.
- A design skill's silence on accessibility is not an exemption. Seven of the sixteen design-adjacent skill packages carry no accessibility content at all, so the two bullets above are the floor whichever skill is driving.
- A visual world is chosen, not accumulated. Template packs, style presets, and named aesthetics contradict each other by construction — `retro-windows` bans every rounded corner where `capsule` requires a 9999px radius. Commit to one, take its taste entire, and treat the others as unread. The rules here apply to all of them.
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
- **Surface craft** `~/.agents/design/craft/` — `high-end.md` (surface construction), `from-reference.md` (building faithfully from a reference image), `from-code.md` (reading a design system out of a live product's own CSS), `device-mockups.md`
- **Fundamentals** `~/.agents/design/fundamentals.md` — the arithmetic under a decision: palette construction (60-30-10, one accent, warm neutrals, the colourblind-safe sets and the grayscale test), type-scale ratios with a worked scale and measure, and grid selection. Read it when the palette or scale is not already decided
- **Slides and posters** `~/.agents/design/slides-and-posters.md` — the only leaf addressing a non-web medium: deck frameworks, PowerPoint craft, HTML deck frameworks, and the academic poster including A0 sizing and the ≥24pt body floor
- **Pre-ship matrix** `~/.agents/design/preflight.md` — the mechanical finish check for landing, marketing and portfolio surfaces; not dashboards, not product UI
- **Dashboards and data-dense product UI** `~/.agents/design/dashboards.md` — the full system for the surface this tree used to leave uncovered: the three dashboard kinds and why building one while thinking of another causes most of the mistakes, information architecture and the three reading distances, density targets set against marketing spacing, typography and colour for data (sequential, diverging, categorical and semantic scales), chart selection ordered by the Cleveland-McGill perceptual ranking, chart and table craft, the six states every data region has, filters and URL state, interaction, real-time cadence, renderer choice by point count, the charting-library table, the anti-patterns, and a §18 pre-ship matrix that is the entry above's equivalent for this medium. This line used to say the tree did not own dashboards and pointed at the `/design-review` rubric, which critiques a running app rather than generating one; that gap closed on 2026-08-09
- **Mobile, touch and responsive** `~/.agents/design/mobile.md` — the medium, not a surface type: the three kinds of mobile thing and why a responsive site should not get a bottom tab bar, the viewport and its moving parts (`svh`/`lvh`/`dvh`, `viewport-fit=cover`, `env(safe-area-inset-*)` with the `max()` fallback that is the part people omit), the three touch-target floors — WCAG 2.2's 24px, Material's 48dp, Apple's 44pt — and which to design to, thumb reach and what it decides, mobile type including the 16px threshold below which iOS zooms a focused input, breakpoints and container queries, navigation patterns, forms with `inputmode`/`autocomplete`/`enterkeyhint` and the keyboard that covers your action bar, the gestures the OS has already reserved, the states that do not exist without a pointer, scrolling, the motion budget on a mid-tier device, images, offline, touch accessibility, the anti-patterns, a §18 pre-ship matrix, and §19 on the four checks emulation cannot answer. It does not restate `impeccable`'s `reference/adapt.md`, which owns converting an existing surface between contexts
- **Design-space explorer** `~/.agents/design/design-space-explorer/README.md` — the reusable two-axis combination explorer, its intent, specification, design rules, and inspection record
- **Design-space manifests** `~/.agents/design/design-spaces/README.md` — the reusable schema for design-space axes, entries, palettes, templates, and generated-axis sources
- **Mission-control design studies** `~/.agents/design/mission-control/AESTHETIC-OPTIONS.md` and `REPRESENTATIONS.md` — visual-world and information-representation options for that surface

The full universal rules are `~/.agents/DESIGN.md`. Where a library entry and a rule disagree, the rule wins.

**This list is enumerated because it has to be.** A cloud or container session has no `~/.agents` to walk, so this block is the only routing it gets — which also means a leaf missing here is a leaf that session cannot reach at all. `craft/` and `preflight.md` were absent until 2026-08-07 and every project copy inherited the gap. `Test-DesignLibraryIndex.ps1` now fails the build when this list falls behind the tree.
<!-- agent-harness:universal-design:v1:end -->

---
name: Flight Finder
description: A calm departure board for cash fares and award availability.
colors:
  midnight-teal: "#031820"
  cabin-teal: "#072530"
  elevated-teal: "#0e3640"
  route-line: "#1a4a52"
  sea-glass: "#80a8a5"
  timetable-cream: "#ecdfc0"
  muted-gold: "#d4a574"
  fare-rise-scarlet: "#c1272d"
  fare-drop-green: "#10b981"
typography:
  display:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  data:
    fontFamily: "Geist Mono, Cascadia Mono, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.sea-glass}"
    textColor: "{colors.midnight-teal}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  input:
    backgroundColor: "{colors.cabin-teal}"
    textColor: "{colors.timetable-cream}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
---

# Design System: Flight Finder

## Overview

**Creative North Star: "The Calm Departure Board"**

Flight Finder combines a quiet operational surface with the character of a mid-century airline timetable. Information arrives in a strong reading order: route, decision, evidence, action. Simple mode keeps the runway clear. Analyst mode increases density through aligned columns and comparison controls while preserving the same component vocabulary.

The interface rejects interchangeable dashboard cards and decorative travel motifs. Tonal layers, measured spacing, and monospaced fare data establish structure. Motion confirms a state change and then gets out of the way.

**Key Characteristics:**

- Route-first hierarchy
- Restrained Altitude palette
- Monospaced numeric evidence
- Progressive disclosure between Simple and Analyst modes
- Visible source and freshness

## Colors

The Altitude palette uses deep teal surfaces, warm cream text, sea-glass controls, muted-gold metadata, and two semantic fare colors.

### Primary

- **Sea Glass:** Primary actions, selected mode, links, and focus treatment.

### Secondary

- **Muted Gold:** Dates, supporting metadata, and secondary emphasis.

### Tertiary

- **Fare-rise Scarlet:** Price increases, destructive warnings, and unavailable states.
- **Fare-drop Green:** Favorable price movement and confirmed availability.

### Neutral

- **Midnight Teal:** Page background.
- **Cabin Teal:** Controls and grouped content surfaces.
- **Elevated Teal:** Active rows and secondary layers.
- **Route Line:** Dividers and control outlines.
- **Timetable Cream:** Primary text.

**The Signal Rarity Rule.** Semantic colors appear only where they convey fare direction, availability, warning, or success.

## Typography

**Display Font:** Bricolage Grotesque (with sans-serif fallback)
**Body Font:** Outfit (with sans-serif fallback)
**Data Font:** Geist Mono (with Cascadia Mono and monospace fallbacks)

**Character:** Bricolage provides the timetable identity, Outfit carries task text and travel metadata, and Geist Mono keeps numeric evidence scannable.

### Hierarchy

- **Display** (700, 2rem, 1.1): Route codes and page title.
- **Headline** (700, 1.5rem, 1.2): Decision summary and section titles.
- **Title** (600, 1.125rem, 1.3): Result groups and controls.
- **Body** (400, 1rem, 1.5): Explanations and status copy, capped at 70ch.
- **Label** (500, 0.875rem, normal case): Form labels, table headers, dates, cabins, programs, and metadata.

**The Numeric Alignment Rule.** Prices, points, taxes, seat counts, timestamps, commands, and identifiers use the data face with tabular alignment. Dates and quantities embedded in human-readable metadata use Outfit with tabular numerals.

## Elevation

Altitude is tonal and largely flat. Cabin teal groups controls; elevated teal marks active content. One-pixel route-line dividers and whitespace carry most separation. Shadows are reserved for floating menus and focus recovery.

**The Grounded Surface Rule.** At-rest content remains flat; elevation appears only when interaction or layering requires it.

## Components

### Buttons

- **Shape:** Compact corners (4px radius).
- **Primary:** Sea-glass fill, midnight-teal text, 10px × 16px padding.
- **Hover / Focus:** Lighter sea-glass hover and a visible two-pixel focus ring.
- **Secondary:** Cabin-teal fill with a route-line outline.

### Chips

- **Style:** Compact mono labels on cabin-teal or transparent backgrounds.
- **State:** Selected filters use sea-glass text and an accent outline; availability includes a text label beside the color signal.

### Cards / Containers

- **Corner Style:** Gently curved (8px radius).
- **Background:** Cabin teal for groups and elevated teal for active rows.
- **Shadow Strategy:** Flat by default.
- **Border:** One-pixel route-line border only where controls need a clear boundary.
- **Internal Padding:** 16px or 24px according to density.

### Inputs / Fields

- **Style:** Cabin-teal background, route-line outline, 8px radius, and mono airport-code values.
- **Focus:** Sea-glass outline plus subtle accent glow.
- **Error / Disabled:** Error text and icon accompany scarlet; disabled fields reduce contrast while preserving legibility.

### Navigation

The page header uses a compact Flight Finder home link, route context, theme control, and an Awards entry. The Simple/Analyst switch is a two-option segmented control with explicit selected state and keyboard operation.

### Comparison Ledger

Analyst mode uses a responsive ledger: aligned desktop columns, sticky column labels when useful, and stacked labeled rows on narrow screens. Cash, miles, taxes, seat count, freshness, and derived value remain visible.

## Do's and Don'ts

### Do:

- **Do** place route, dates, and cabin before derived recommendations.
- **Do** show source, observation time, and cached status beside each result.
- **Do** preserve cash, miles, and taxes as separate values.
- **Do** use semantic color with text or icon labels.
- **Do** let users switch modes without losing their search or filters.

### Don't:

- **Don't** assemble the page from interchangeable dashboard cards.
- **Don't** hide taxes, freshness, or the booking program behind a deal score.
- **Don't** expose every analyst filter before the user chooses Analyst mode.
- **Don't** use purple gradients, amber-primary palettes, glass panels, gradient text, or colored side-stripe borders.
- **Don't** imply cached award availability is guaranteed; direct users to confirm with the airline before transferring points.
