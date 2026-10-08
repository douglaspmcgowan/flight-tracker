# Typography and Vercel Deployment Design

## Goal

Remove IBM Plex Mono from Flight Finder, make ordinary travel metadata read naturally, preserve numeric scanability, enforce the rule in Douglas's global harness, and publish the Next.js web surface to Vercel with its worker boundary documented honestly.

## Typography system

- Bricolage Grotesque remains the display face for route codes and headings.
- Outfit remains the body face and becomes the metadata face for dates, cabins, programs, labels, and explanatory copy.
- Geist Mono becomes the data face for prices, points, taxes, timestamps, commands, and aligned numeric tables.
- IBM Plex Mono is removed from CSS tokens, chart configuration, font delivery, and design documentation.
- Human-readable metadata uses Outfit with `font-variant-numeric: tabular-nums` where dates or quantities benefit from stable widths.

## Global harness rule

The machine-global Codex instructions will prohibit IBM Plex Mono and prohibit monospace for prose, navigation, ordinary labels, dates, cabins, and program names. Monospace remains available for code, commands, identifiers, timestamps, and genuinely tabular numeric data. Outfit and Geist Mono are the preferred Flight Finder treatment; future projects may choose other faces while preserving the semantic rule.

## Deployment architecture

Vercel hosts the Next.js application and request-driven API routes. PostgreSQL and optional Redis use external managed services. A continuously running external worker owns fast-flights, Playwright fallback scraping, scheduled refreshes, and alert evaluation. The Vercel deployment must disable the in-process cron loop.

The first deployment may expose a healthy web surface before the external worker is provisioned. Its handoff must label cash refresh, scheduled monitoring, and live award refresh as operational only after their provider and worker dependencies are connected.

## Verification

- Repository search returns no IBM Plex Mono references.
- Impeccable's typography detector has no unexplained findings.
- Focused UI tests, full lint, full typecheck, full tests, web build, and CLI build pass.
- Browser checks confirm the route metadata and alert metadata resolve to Outfit and numeric data resolves to Geist Mono.
- Vercel returns a production URL and its health endpoint is checked.
