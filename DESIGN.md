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
