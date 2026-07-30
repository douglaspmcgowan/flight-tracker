# CURRENT TASK — Production-ready combined Flight Finder

Goal: Make the combined cash, awards, analyst, alerts, and scheduling application operational and verified in production.

## Done

1. Deployed and live-verified the isolated fast-flights worker at `https://flight-finder-fast-flights.vercel.app`.
2. Provisioned Prisma Postgres, added the baseline migration, and proved database health.
3. Added a password-protected hosted application surface and verified anonymous redirects and API rejection.
4. Corrected the seats.aero Cached Search mapping against the provider OpenAPI schema.
5. Completed managed setup and verified the database-backed admin account in the protected preview.
6. Provisioned Vercel Redis on the free 30 MB plan and connected it to preview and production.
7. Configured an enabled ntfy channel, delivered a live test alert, and set production alert deep links.

## Remaining

1. Redeploy the combined app with Redis and verify database/Redis health.
2. Configure and live-verify a seats.aero credential if one is available.
3. Run final CI, browser, and security gates; promote production; refresh durable documentation.

## Queued after production completion

1. Expand Berkeley searches to OAK and SFO.
2. Add two-traveler/four-checked-bag trip parameters and Delta Platinum benefit presets.
3. Rank airfare plus estimated bag charges with a maximum of two stops.
4. Test the Aug 14–17, 2026 Norfolk-to-Berkeley scenario headlessly and through the deployed UI.

## Next verifier

`npx.cmd vercel deploy --yes`
