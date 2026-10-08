# Award comparison workspace design

Status: approved for implementation through `/design --auto --delegate`.

## Problem

The current app answers the cash-fare question and has an award-search backend, but it lacks a usable surface for asking the combined booking question: “For this trip, should I pay cash or use points, and what evidence supports that choice?”

## Prior art

- Google Flights separates a quick “Best” answer from “Cheapest” tradeoffs, then reveals date grids, price graphs, and tracking. Flight Finder should preserve a quick path before exposing deeper evidence. Source: https://support.google.com/travel/answer/7664728
- point.me places cash, portal, and transfer prices beside each other and exposes cents-per-point as supporting evidence. Flight Finder should compare cash, miles, and taxes in aligned fields while labeling any derived valuation. Source: https://connect.point.me/help/anatomy-of-our-flights-results-
- seats.aero distinguishes route-specific Search from open-ended Explore, supports date ranges and program filters, and warns that cached availability may differ from airline inventory. Flight Finder should focus this surface on a known route and keep freshness visible. Sources: https://docs.seats.aero/article/37-how-to-search-with-the-explore-vs-search-tool and https://docs.seats.aero/article/47-why-are-my-search-results-empty-or-missing-airlines

## Users and jobs

Primary user: Douglas or another self-hosting traveler evaluating a known trip.

Ranked jobs:

1. Save an award search for a route, date range, cabin, and optional programs.
2. See whether useful award availability has been observed.
3. Compare the best award observation with the route’s current cash evidence.
4. Refresh results and understand provider/key status.
5. Create an availability alert without rebuilding the search.

## Success criteria

- A user can create an award search from an empty page in one form submission.
- Simple mode shows route, dates, cabin, best observed award, freshness, and next action without horizontal scrolling at 390px.
- Analyst mode shows cash, miles, taxes, seats, program, travel date, freshness, and derived cents-per-point when cash evidence exists.
- Switching modes preserves the selected search and active filters.
- Provider-disabled, empty, loading, success, stale, and API-error states are distinguishable through text and control state.
- Keyboard users can reach and operate the mode switch, form, refresh, alert action, and result selection.

## Concepts explored

### 1. Two separate pages

Simple Search and Award Lab receive separate routes. This gives each layout room, though it duplicates route context and forces users to navigate to compare the same trip.

### 2. Progressive workspace

One `/awards` route contains a persistent route workspace and a Simple/Analyst segmented switch. Simple mode presents the decision summary. Analyst mode swaps the result body for the comparison ledger while preserving the search and selected result.

### 3. Split-screen cockpit

Cash evidence stays left and award evidence stays right at all times. It enables constant comparison, though it becomes cramped on laptops and overwhelming on mobile.

## Decision

Use the progressive workspace. Criteria were continuity, mobile composition, progressive disclosure, and reuse of the existing tracker vocabulary. It keeps one route context, satisfies both requested densities, and avoids duplicate search state. Analyst mode borrows the split-screen concept’s aligned cash/points comparison. Simple mode borrows the separate-page concept’s focused summary.

## User stories

### P1 — Create and inspect a saved award search

As a traveler, I can enter route, date range, cabin, and programs, then see a clear empty or populated search summary.

### P2 — Switch between Simple and Analyst evidence

As a traveler, I can switch modes while preserving context. Simple mode gives the leading option and next step. Analyst mode exposes the comparison ledger and valuation assumptions.

### P3 — Refresh and monitor

As a traveler, I can refresh a saved award search and create a minimum-seat alert. Provider-disabled and stale states explain what action is available.

## Functional requirements

- FR-001: The page lists saved award searches and selects the newest by default.
- FR-002: The creation form validates three-letter airports, an inclusive date range, cabin, and comma-separated program filters.
- FR-003: The mode switch persists for the browser session and retains selected search state.
- FR-004: Simple mode displays best observed award, program, cabin, seats, taxes, travel date, source freshness, and confirmation warning.
- FR-005: Analyst mode displays one row per observed award snapshot and cash comparison data when a matching tracker exists.
- FR-006: Derived cents-per-point uses `(cash price - taxes) / miles × 100`, labels the assumption, and omits the value when required inputs are absent.
- FR-007: Refresh exposes loading, success, provider-disabled, and error states.
- FR-008: Alert creation accepts a minimum seat count and optional program/cabin filters.
- FR-009: The page includes seats.aero attribution when award functionality is visible.
- FR-010: Responsive rendering converts the ledger to labeled stacked rows below the table breakpoint.

## Data flow

The server page supplies the shell. A client workspace loads `/api/awards/searches`, creates searches through the same collection endpoint, loads one search’s detail route, and refreshes through its action endpoint. Cash comparison uses the existing query API or a narrow server/API adapter if the current response cannot provide a matching best cash observation safely.

## Error handling

- Provider disabled: keep saved searches available, disable refresh, and explain the Pro-key dependency.
- No observations: show that the search is saved and ready for monitoring.
- Cached or old observation: show “observed” time and a confirmation warning.
- API failure: retain the previous successful state and place an actionable inline error near the initiating control.
- Missing cash match: render award evidence and label cash comparison unavailable.

## Test plan

- Component tests cover mode persistence, empty state, populated summary, cents-per-point calculation, provider-disabled refresh, and alert payload.
- API tests cover any cash-comparison adapter added.
- Playwright verifies creation, both modes, refresh/disabled behavior, keyboard operation, 390px composition, and desktop ledger layout.
- Impeccable critique and audit inspect hierarchy, state clarity, responsive behavior, focus, contrast, and slop-detector findings.

## Assumptions

- ASSUMED: One page with a persistent two-mode switch is preferable to two routes.
- ASSUMED: Simple mode is the default on first visit.
- ASSUMED: Cash comparison uses the best stored cash snapshot for the same airport pair and overlapping dates.
- ASSUMED: Award value remains an evidence field; the interface avoids prescriptive booking claims.
- ASSUMED: Live seats.aero results remain unavailable until Douglas configures an eligible Pro API key.
