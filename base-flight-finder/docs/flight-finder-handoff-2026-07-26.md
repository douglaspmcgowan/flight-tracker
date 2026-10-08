# Flight Finder handoff — 2026-07-26

> **Superseded later on 2026-07-26.** Production infrastructure and the Berkeley baggage optimizer were completed after this snapshot. Use `docs/flight-finder-production-brief-2026-07-26.md` and `STATUS.md` for current state.

## Executive status

The existing `affromero/flight-finder` application has been extended into a local cash-fare and award-search workspace. The local assembled system is verified. A production Vercel web deployment is Ready at <https://flight-finder-hazel.vercel.app>, with its health endpoint currently reporting `degraded` because no production PostgreSQL database is attached and Redis is disabled.

## How the app works

1. A user enters a route and travel dates through natural language or structured controls.
2. The parser normalizes airports, dates, cabin, flexibility, and passenger details, then saves the tracker to PostgreSQL.
3. Cash collection first calls the local Python `fast-flights` sidecar, which retrieves Google Flights data. A Playwright-plus-LLM extractor remains available as a fallback.
4. Normalized fare observations become `PriceSnapshot` records. The tracker view presents current best fare, historical charts, tables, and date context.
5. Award searches are stored separately. A seats.aero refresh creates cached award observations with program, mileage, taxes, cabin, and availability fields.
6. Simple mode surfaces the strongest award option. Analyst mode compares the full set and overlaps award options with cash observations. It calculates cents per point as `(cash fare - taxes) / miles`.
7. Alert rules evaluate cash and award thresholds. The scheduler refreshes due searches and suppresses unchanged duplicate notifications for 24 hours.
8. Notification adapters support email, ntfy, Telegram, and webhooks once a real destination is configured.

## Inputs used

- The existing Flight Finder repository and its current Next.js, Prisma, CLI, scraper, scheduler, authentication, and notification implementation.
- `research/flight-finder-integration-plan.md` from the Claude global-config research branch.
- The existing local PostgreSQL data, including the saved ORF–OAK search for August 14–17, 2026.
- The `fast-flights` Python integration and local sidecar.
- The seats.aero integration plan and provider contract scaffold.
- The project status, runbook, tests, and live browser behavior.

## Research retained for later

- Live seats.aero response mapping remains unverified because a Pro API key is unavailable.
- A durable cross-worker award request cap remains future work; the current cap is process-local.
- External scheduler and worker hosting have not been selected for the Vercel deployment.
- Real notification delivery has not been configured or observed.
- Award-search rename, pause, and delete controls remain future lifecycle work.
- Duplicate ORF–OAK tracker cleanup awaits Douglas’s choice.

## Deployment

- Production URL: <https://flight-finder-hazel.vercel.app>
- Vercel project: `douglas-mcgowans-projects/flight-finder`
- Production build status: Ready
- Production health: degraded (`database: error`, `redis: disabled`)
- Local app: healthy on port 3003 with PostgreSQL and the fast-flights sidecar

Vercel currently hosts the web surface and serverless routes. Operational flight search requires a managed PostgreSQL database. Reliable scheduled collection also requires an external worker or scheduler; Redis is recommended for shared rate limits and coordination.

## Verification

- Web and CLI lint passed.
- Web and CLI TypeScript checks passed.
- 1,420 tests passed; 2 were skipped.
- The Next.js production build passed.
- The CLI bundle passed when rerun with the filesystem access its bundler requires.
- Desktop and 390-pixel browser checks passed without horizontal overflow.
- The two flagged award metadata lines now render in Outfit 500 with tabular numerals where appropriate.
- A policy test rejects IBM Plex Mono and the retired `--font-mono` token.

## Completion priorities

1. Attach managed PostgreSQL to Vercel, run Prisma migrations, and recheck `/api/health`.
2. Select and deploy the long-running worker/scheduler with access to the database and scraping dependencies.
3. Configure Redis for shared coordination and a persistent award request cap.
4. Add the seats.aero Pro key and validate the live response mapping.
5. Configure one notification channel and run an end-to-end alert delivery test.
6. Observe a complete scheduled cycle and add production monitoring, backups, and restore proof.
7. Connect Vercel to a repository Douglas can administer; automatic Git deployments could not be enabled against the upstream repository.
8. Review the dependency audit report and address the nine high-severity findings reported during the Vercel install.
