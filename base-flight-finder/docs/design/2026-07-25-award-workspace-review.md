# Award workspace design and implementation review

Date: 2026-07-25
Target: `apps/web/src/components/AwardWorkspace/AwardWorkspace.tsx`
Live route: `http://localhost:3003/awards`

## Outcome

The award workspace extends the existing Flight Finder application with two views over the same saved search and data:

- **Simple** promotes the best observed redemption, seats, mileage, taxes, stored cash fare, calculated cents per point, freshness, and the airline-confirmation warning.
- **Analyst** presents a sortable reading surface with date, program, cabin, seats, miles, taxes, cash fare, cents per point, and observation time.

The interface follows the existing Altitude theme, uses the application’s typography and tokens, retains the application shell, and exposes the route from the home page.

## Design health

| # | Nielsen heuristic | Score | Evidence |
|---|---|---:|---|
| 1 | Visibility of system status | 4 | Loading, refresh, success, provider-paused, and empty states are explicit. |
| 2 | Match with the real world | 3 | Route, cabin, seats, miles, taxes, and cash terms are direct; cents per point assumes points familiarity. |
| 3 | User control and freedom | 2 | Searches can be created and selected; rename and delete controls are absent. |
| 4 | Consistency and standards | 4 | Existing shell, tokens, typography, controls, footer, and route language are reused. |
| 5 | Error prevention | 3 | Airport length, date inputs, cabin options, seat bounds, and API validation constrain common errors. |
| 6 | Recognition over recall | 3 | Saved searches and current route context stay visible; program names still require user knowledge. |
| 7 | Flexibility and efficiency | 3 | Persistent Simple/Analyst modes support novice and expert reading patterns. |
| 8 | Aesthetic and minimalist design | 4 | One primary route, progressive search disclosure, restrained borders, and a single accent hierarchy. |
| 9 | Error recovery | 3 | Provider-paused copy gives the accurate server-config/restart recovery path and preserves stored observations. |
| 10 | Help and documentation | 2 | Inline guidance covers stale availability and empty states; full setup guidance lives in the runbook. |
| **Total** |  | **31/40** | **Good** |

## Anti-pattern verdict

The surface reads as a deliberate extension of Flight Finder. It avoids gradient text, glass effects, generic metric-card grids, ornamental hero statistics, and decorative motion. The route-led hierarchy and monospaced data treatment fit the product.

The Impeccable deterministic scan returned zero findings for `AwardWorkspace.tsx`. Browser overlay injection was unavailable because the connected browser exposes read-only page evaluation; live screenshots, DOM snapshots, control measurements, and interaction checks supplied the browser evidence.

## Technical audit

| Dimension | Score | Evidence |
|---|---:|---|
| Accessibility | 4 | Semantic headings/forms/table, labeled controls, live status region, pressed-state mode group, visible focus, and 44px primary targets. |
| Performance | 4 | Small client component, no images, bounded result rendering, pure view-model helpers, and no layout animation. |
| Responsive design | 4 | 390px verification showed no horizontal overflow; controls stack and the analyst table converts to labeled rows. |
| Theming | 3 | Existing color and typography tokens are used throughout; automated contrast measurement was unavailable. |
| Anti-patterns | 4 | Deterministic detector clean; visual inspection found no material AI-design tells. |
| **Total** | **19/20** | **Excellent** |

## Browser evidence

- Desktop production route rendered the existing app shell, saved ORF → OAK search, mode control, route header, empty state, monitor form, and seats.aero attribution.
- At 390 × 844, `scrollWidth` was 375px against a 390px viewport.
- Search inputs, saved-search selector, refresh, and alert controls measured 44px high.
- The Simple and Analyst selection persists in session storage.
- A provider-disabled refresh leaves the saved search visible and shows one recovery message.
- The global wordmark is suppressed on `/awards`, preventing the duplicate brand seen in the first review.

## Remaining design items

### P2 — Search lifecycle controls

Saved award searches cannot be renamed, paused, or deleted from this route. A user who creates test searches must keep them in the selector. Add lifecycle controls when multiple-search management becomes a real use case.

### P2 — Program discovery

The optional program field accepts comma-separated names. It provides an example, while valid program discovery still depends on outside knowledge. A provider-backed multiselect becomes useful once the live seats.aero schema is verified.

### P3 — Empty Analyst state

With zero observations, Simple and Analyst intentionally share the same empty state. A compact preview of the analyst columns could teach the denser mode before the first provider result arrives.

## Positive findings

- Progressive disclosure keeps the search form subordinate to the active route.
- Provenance, observation freshness, and the airline-confirmation warning prevent cached award data from reading as guaranteed inventory.
- The cash comparison formula is isolated, tested, and omitted when required inputs are missing.
- Provider failure preserves previously stored observations and the selected mode.

## Sources used

- Existing product conventions: `PRODUCT.md`, `DESIGN.md`, `apps/web/src/styles/globals.css`, and neighboring application components.
- Product behavior references: Google Flights help for best/cheapest and date comparison; point.me help for cash/points comparison; seats.aero documentation for cached search, freshness, API access, limits, and attribution.
- Implementation plan: `..\..\..\research\flight-finder-integration-plan.md`.
