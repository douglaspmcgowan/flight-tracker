# Phase 0 FINDINGS (this session — code-verified)

Base app read at `C:\Users\dougl\projects\base-flight-finder` (affromero/flight-finder, MIT, Next.js 15 monorepo `apps/web` + `packages/cli`).

## Seam 1 — fare data source: PARTIAL (Assumption 1 partially true)
- There IS a source seam: `NavigationSource = 'google_flights' | 'skyscanner' | 'kayak'`, chosen by `resolveAggregatorChain()` in `apps/web/src/lib/scraper/run-scrape.ts:52`. Each `navigate*()` returns `NavigationResult { html, url, source }`.
- BUT the pipeline is navigate -> HTML -> **LLM extract** (`extractPrices`) -> `PriceData` -> `PriceSnapshot`. fast-flights returns structured JSON, so it can't ride the HTML/LLM-extract path.
- Integration shape: add fast-flights as a source that produces `PriceData[]` directly (adapter), plus a branch in `scrapeOneDatePair` to skip `extractFromNav` when the source is fast-flights. Bounded adapter work (the plan's "+adapter" case, not the free-plugin case). Target normalized type = `PriceData` (from `extract-prices.ts`); DB model = `PriceSnapshot`.

## Seam 2 — notifications: STRONG (Assumption 2 true)
- `apps/web/src/lib/notifications/` — channels: email, ntfy, telegram, webhook (`channels/`), dispatched by `dispatchNotifications(ownerUserId, ChannelMessage)` in `notify.ts`. Per-channel failures isolated. Dedupe via `Query.lastNotifiedLowPrice`.
- Award alerting reuses `dispatchNotifications` with a new `ChannelMessage`; no new delivery infra needed.

## Seam 3 — cron monitor: STRONG (Assumption 3 true)
- `apps/web/src/app/api/cron/scrape/route.ts` (CRON_SECRET Bearer auth) runs `runScrapeAll()` then `notifyNewLows()`. Iterates `Query` rows. An award pull + award-detect pass slots in alongside `notifyNewLows`.

## Stack/run facts
- Node >=22 (have 24). DB: Postgres 16 + Prisma (`apps/web/prisma/schema.prisma`; models Query, PriceSnapshot, FetchRun, ExtractionConfig, User, NotificationChannel, ...). Redis 7 (rate-limit + cache). Playwright headless Chromium.
- LLM: supports a **`claude-code` CLI provider at cost 0** (also codex, ollama, etc.) — extraction needs NO API key on this machine.
- Secrets: repo uses Doppler, but keys fall back to env / encrypted DB values; self-host can set env directly.
- Dev run (no Docker needed for the app itself): `npm install` -> point `DATABASE_URL`+`REDIS_URL` at Postgres+Redis -> `prisma db push` + `generate` -> `npm run dev` (web on :3003).

## ENVIRONMENT BLOCKER
No Docker on this machine. flight-finder's stock install is docker-compose (db+redis+web+chromium). To run without Docker we need Postgres 16 + Redis reachable (native install, WSL, or managed cloud like Neon+Upstash) and `npx playwright install chromium`.

## Decision needed before Phase 1
- (a) hosting path for Postgres+Redis
- (b) whether to include the seats.aero award side now (needs Pro key $99/yr) or defer to cash-only first
