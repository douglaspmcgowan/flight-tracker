# Flight Finder production brief

## Executive status

Flight Finder is live at <https://flight-finder-hazel.vercel.app>. The production deployment is `dpl_APgWqgzHRq2hpWo3PZQ1vrUycShK`; Vercel reports it Ready. The health route reports PostgreSQL and Redis connected. The browser is currently open at the app’s admin-password screen.

The app combines cash-fare tracking, award search, Simple and Analyst comparisons, alert rules, scheduled refreshes, and a baggage-aware trip-cost comparison. The Berkeley workflow expands one destination choice into OAK and SFO and carries two travelers, four collective checked bags, the selected Delta benefit, and the stop ceiling through preview, persistence, and comparison.

## How the app works

### Cash tracking

1. The home screen accepts natural language or structured trip controls.
2. The parser normalizes airports, dates, cabin, travelers, collective bags, benefit preset, and maximum stops.
3. A Berkeley destination expands deterministically to Oakland (OAK) and San Francisco (SFO). The app previews both routes before creating sibling trackers.
4. Cash collection calls the deployed `fast-flights` worker first. A serverless Chromium route can read Google Flights’ visible text when the sidecar returns no usable result.
5. Each usable observation becomes a `PriceSnapshot` in PostgreSQL. The tracker page shows the current fare, history, flight details, and total-trip-cost comparison.

Google can challenge automated traffic. Cash collection is best-effort, so an empty refresh means the provider returned no usable fare or blocked the request. The app preserves the tracker and can retry on a later cycle.

### Baggage-aware total cost

The comparison uses:

`total = per-person airfare × travelers + estimated checked-bag fees in each direction`

Collective bags are distributed evenly across travelers because airlines charge by traveler and bag ordinal. The requested two-person/four-bag profile assigns two bags to each traveler.

For an eligible Delta-operated round trip priced at $459 per person:

- Delta Platinum SkyMiles AmEx preset: $918 airfare + $110 estimated bags = $1,028.
- Delta Platinum Medallion preset: $918 airfare + $0 estimated bags = $918.

The AmEx preset gives both travelers a free first checked bag on the same reservation and gives the cardmember a free second bag under the reviewed Delta terms. The Medallion preset covers up to three bags per traveler under the reviewed Medallion allowance. The app displays the selected assumption and the dated airline source.

The verified domestic fee register currently covers Delta, Southwest, Alaska, United, American Basic Economy, and JetBlue’s August 2026 peak period. An unsupported carrier or date produces “fee unavailable” and sorts after itineraries with known totals. The app never fills that gap with a guessed fee.

Sources reviewed July 26, 2026:

- [Delta cardmember checked-bag terms](https://www.delta.com/us/en/baggage/checked-baggage/first-checked-bag-free)
- [Delta Medallion baggage allowance](https://www.delta.com/us/en/baggage/checked-baggage/medallion-baggage-allowance)
- [Southwest travel fees](https://www.southwest.com/html/customer-service/travel-fees.html)
- [Alaska Airlines bag-fee update](https://news.alaskaair.com/page/6/?_hsmi=12877383&edition=starter&gh_jid=648106&term=monthly)
- [American Airlines 2026 baggage update](https://news.aa.com/news/news-details/2026/American-Airlines-updates-bag-fees-and-Basic-Economy-fares-OPS-POL-04/default.aspx)
- [JetBlue optional fees](https://www.jetblue.com/legal/fees)
- [United current card-benefit disclosure](https://cardmembers.united.com/Quest)

### Award search and analysis

Award searches persist separately from cash trackers. When a seats.aero API key is configured, a refresh stores program, mileage, taxes, cabin, seat count, and freshness. Simple mode promotes the strongest observed redemption. Analyst mode exposes the full comparison and calculates cents per point from the stored cash fare, award taxes, and miles.

The live seats.aero provider remains dormant because its API key has not been configured. The interface, persistence, mapping, tests, and alert path are present.

### Alerts and scheduling

Alert rules can evaluate cash-price and award thresholds. The scheduler refreshes due searches, uses Redis for shared coordination, and suppresses unchanged duplicate notifications for 24 hours. An ntfy path was configured and live-tested. Email, Telegram, and webhook adapters remain available when their destinations are configured.

### Authentication and infrastructure

The deployed surface uses Flight Finder’s own admin password and session cookie. A Google or Vercel browser login does not satisfy this application-level prompt.

The production stack contains:

- Next.js web application and serverless routes on Vercel.
- Managed PostgreSQL for users, trackers, snapshots, award searches, rules, and events.
- Managed Redis for coordination.
- A separate Vercel Python `fast-flights` worker.
- Bundled serverless Chromium for the fallback scraper.
- Vercel Cron for scheduled refreshes.

## What the build pulled from

- The existing `affromero/flight-finder` application: Next.js interface, Prisma data model, CLI, authentication, scraping pipeline, scheduler, and notification adapters.
- `research/flight-finder-integration-plan.md` from the Claude global-config research branch: phased cash core, `fast-flights`, seats.aero, and alerting direction.
- The existing fast-flights Python integration and its provider contract.
- seats.aero’s cached-search schema and the research plan’s award-comparison model.
- The project’s existing cash history, saved-query model, browser behavior, and test harness.
- Official airline baggage pages for every fee implemented in the optimizer.
- The Superpowers design and implementation plans under `docs/superpowers/`.
- Impeccable’s typography and layout checks for the app surface.

## Research and recon held back

- Live seats.aero data was not pulled because the provider key is absent.
- SJC was excluded from the Berkeley preset. The requested nearby-airport scope named OAK and SFO, and the implementation keeps that expansion explicit.
- VPN-based regional fare comparisons remain outside this trip workflow.
- Military allowances, partner-airline policies, oversize or overweight bags, fare-brand exceptions beyond the documented American assumption, and unrelated credit-card benefits remain outside the fee engine.
- The app does not book or purchase travel. Every total is an estimate until the airline checkout confirms fare, operating carrier, bag size, and benefit eligibility.
- A provider price is not guaranteed. Google can return an empty result or challenge the automated request.
- The award request cap remains process-local; Redis coordination currently covers the scheduled cash workflow.

## Verification record

- Web and CLI lint passed.
- Web and CLI TypeScript checks passed.
- 1,478 unit and API tests passed; 2 tests were skipped.
- Ten Playwright scenarios passed across desktop Chrome and an iPhone 13 viewport. The database-backed scenario creates an OAK/SFO group, renders the $1,028 result, exposes the bookable winning flight, cascades a Medallion edit to both routes, waits for live Google refreshes, and deletes its test records.
- The Playwright accessibility check reported zero critical or serious Axe findings.
- The Next.js production build passed.
- The CLI production bundle passed with the filesystem access its bundler requires.
- The production serverless smoke proved database connectivity, Chromium launch and rendering, extraction sanitation, and database write/read cleanup.
- The production health route currently reports PostgreSQL and Redis connected.
- The focused baggage regression suite has 12 passing tests, including outbound/return date boundaries, identity fallback, and three-bag Delta Medallion coverage.
- `npm audit --omit=dev --audit-level=critical` found zero critical production advisories. The full Vercel install still reports transitive advisories that require upstream or breaking dependency changes.

## Open items

1. Enter the Flight Finder admin password in the open production tab. This unlocks the final authenticated production walkthrough.
2. Add a seats.aero API key to activate live award results.
3. Watch the first complete scheduled cash refresh in production and confirm the provider returns usable fares for the requested dates.
4. Expand the verified baggage source table when another carrier or travel period matters.
5. Resolve the upstream dependency advisories through a tested dependency-upgrade branch.
6. Push the local release commit to a repository Douglas can administer; the configured `origin` points to the upstream `affromero/flight-finder` repository.

## Exact Berkeley workflow

Open <https://flight-finder-hazel.vercel.app>, sign in, and choose the structured cash search. Set Norfolk (ORF), Berkeley area (OAK + SFO), August 14–17, 2026, economy, two travelers, four collective checked bags, and a maximum of two stops. Select the Delta Platinum preset that matches the actual benefit. The app creates OAK and SFO sibling trackers and ranks known itineraries by total trip cost.
