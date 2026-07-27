# Status

## Production

- URL: https://flight-finder-hazel.vercel.app
- Vercel deployment: `dpl_APgWqgzHRq2hpWo3PZQ1vrUycShK`
- State: Ready
- PostgreSQL: connected
- Redis: connected
- Scheduled scrape: Vercel Cron configured
- Cash sidecar: https://flight-finder-fast-flights.vercel.app

## Working capabilities

- Authenticated combined cash and award application.
- Natural-language and structured cash search.
- Cash tracker persistence, price history, scheduled refresh, and alerts.
- Award-search persistence, Simple/Analyst comparison, alert rules, and duplicate suppression.
- Berkeley area expansion to OAK and SFO.
- Persisted traveler count, collective checked bags, Delta benefit preset, and maximum stops.
- Source-backed total-trip-cost ranking with explicit unknown-fee states.
- Delta Platinum SkyMiles AmEx and Platinum Medallion assumptions.
- ntfy notification delivery path.

## Verification

- Web and CLI lint and typecheck passed.
- 1,478 unit/API tests passed; 2 skipped.
- 10 Playwright tests passed across desktop Chrome and iPhone 13, including a real-database tracker lifecycle and live Google Flights refresh.
- Axe reported zero critical or serious findings in the tested cash and award surfaces.
- Next.js production build and CLI bundle passed.
- Production smoke passed database, Chromium, sanitation, and write/read checks.
- Production health reports database and Redis connected.
- Critical production dependency audit gate passed; 9 lower-severity production advisories remain.

## Open

- Douglas must enter the app admin password before the final authenticated production walkthrough.
- Live seats.aero results require a provider API key.
- Google Flights collection remains subject to provider challenges and empty responses.
- Transitive dependency advisories need an isolated upgrade branch.
- The release source needs a local commit and a user-owned Git remote before it can be pushed safely.
