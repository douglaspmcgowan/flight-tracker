# Fork changes to `base-flight-finder` (affromero/flight-finder, MIT)

Changes we made to the cloned base app. Kept minimal and surgical.

## New files
- `apps/web/src/lib/scraper/fast-flights-source.ts` — client for the fast-flights sidecar; returns `PriceData[]`, throws on failure so the caller falls back to Playwright.
- `apps/web/src/lib/award/seats-aero-client.ts` — seats.aero award client **SCAFFOLD (untested, gated on `SEATS_AERO_API_KEY`)**.

## Edited files
- `apps/web/src/lib/scraper/run-scrape.ts`
  - Added import of the fast-flights source.
  - In `scrapeOneDatePair`, added a **Step 0** that calls the sidecar first (when `FAST_FLIGHTS_ENABLED=true` and non-VPN pass). On results it stores them and returns, skipping the Playwright+LLM path; on error/empty it falls through to the existing path.
- `apps/web/src/lib/scraper/ai-registry.ts`
  - **Bug fix (version skew):** the `claude-code` provider passed `--disallowedTools ...,MultiEdit,...`, but the current `claude` CLI removed the `MultiEdit` tool and rejects the whole invocation ("Permission deny rule MultiEdit matches no known tool"). Removed the dead `MultiEdit` entry (`Edit` still covers the capability).

## Config / infra (not code)
- `.env` + `apps/web/.env.local` created for a no-Docker run: `DATABASE_URL` -> local Postgres, `FAST_FLIGHTS_ENABLED/URL`, `CRON_ENABLED=false`, admin/cron secrets, `SELF_HOSTED=true`. Redis intentionally unset.
- Provider set to `ollama` / `phi4-mini:latest` in `ExtractionConfig` (free local LLM for NL query parsing).

## Not changed
- No changes to the notification system (`lib/notifications/*`) — the existing multi-channel dispatch + new-low detection were reused as-is for cash alerting.
- No Prisma schema changes yet (award model deferred with the rest of the keyed seats.aero work).
