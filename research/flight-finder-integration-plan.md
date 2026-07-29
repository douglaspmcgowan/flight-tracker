# Plan — flight-finder as the core, + fast-flights + seats.aero + alerting

Status: PLAN (not implemented). Date: 2026-07-19. Target branch: `claude/flight-price-optimization-sz0eth`.

## Goal
Stand up `affromero/flight-finder` as the base app, give it a faster keyless Google Flights data path via `fast-flights`, add award/points availability via the seats.aero API, and wire alerting across both cash and award. One self-hosted app that tracks cash fares **and** award seats and notifies on both.

## Why this shape (from the recon)
- flight-finder is the most complete self-hosted **cash-fare** app (tracking, charts, LLM query parsing, desktop/PWA, REST agent API) but has **zero award capability**.
- fast-flights is a keyless Google Flights scraper (Protobuf, no browser) — faster/cheaper than flight-finder's Playwright path.
- seats.aero is the sanctioned programmatic **award** source (API requires Pro; personal/non-commercial ≤1,000 calls/day with attribution).
- flights-tracker proves the award+alerting pattern but has **no license file** — reference its approach, copy none of its code.

Reference: `research/flight-deal-tooling-recon.md`.

## Known stack facts (verified in recon)
- **flight-finder:** TypeScript / Next.js 15, PostgreSQL 16 + Prisma, Redis, Playwright headless Chromium + bring-your-own-LLM, curl/Docker install, built-in cron price monitoring, REST API + headless CLI. MIT. Active (release Jul 11 2026).
- **fast-flights:** Python library, decodes Google Flights Base64/Protobuf `tfs` param. No API key for core. Active (Jun 2026).
- **seats.aero API:** Pro key required ($9.99/mo or $99.99/yr). Cached Search / Bulk Availability / Routes endpoints. 1,000 calls/day (resets midnight UTC), `X-RateLimit-Remaining` header. Live Search = approved partners only. Personal/non-commercial with attribution.

## Assumptions (flagged — confirm in Phase 0)
1. flight-finder exposes a **provider/source abstraction** for fare data that a new source can plug into. Unconfirmed until its code is read.
2. Its cron monitor + notification path can be extended to a second data type (award) and new delivery channels. Unconfirmed.
3. A Python sidecar (fast-flights) called over localhost HTTP is acceptable operationally (the app is already Docker-based). Reasonable given the Docker install.

If assumption 1 is false (data source is hardcoded, no seam), Phase 2/3 shift from "add a provider" to "add an adapter layer," roughly +2-3 days.

---

## Phase 0 — Read the base, confirm the seams (½–1 day)
Do this before writing any integration code.
- Clone flight-finder; run its stock Docker install; get a cash-fare search working end-to-end locally.
- Map the code: where Google Flights is queried, the internal **fare data model**, the provider abstraction (if any), the cron/monitor loop, the notification/delivery code, the Prisma schema, and the REST API surface.
- Confirm or kill Assumptions 1 & 2. Write findings into this doc.
- **Verify:** stock app returns a real cash-fare search + one tracked route with a price chart, running locally.

## Phase 1 — Bring flight-finder up cleanly (½ day)
- Fork into our control (so we can commit changes); pin the version; document env vars (LLM key or Claude Code/Codex auto-detect, Postgres, Redis).
- Reproducible `docker compose up` from our fork.
- **Verify:** fresh clone → one command → working app; a tracked route persists across a restart (Postgres wired).

## Phase 2 — fast-flights as a Google Flights data source (2–3 days)
Goal: a faster, keyless GF path selectable alongside (or ahead of) the Playwright path.
- Build a thin **Python FastAPI sidecar** wrapping fast-flights: `POST /search` (origin, destination, dates, pax, cabin) → normalized JSON matching flight-finder's fare model. Add to docker-compose on an internal port.
- In flight-finder, register fast-flights as a **provider** (per the seam found in Phase 0); config flag to choose primary/fallback vs the Playwright scraper.
- Normalize fast-flights output → flight-finder's fare shape in one adapter module.
- Handle breakage: GF Protobuf param can change without notice — on sidecar error, fall back to the existing Playwright path.
- **Verify:** same route queried through both paths returns consistent fares; killing the sidecar falls back to Playwright with no app crash; fast-flights path is measurably faster on a fixed benchmark route.

## Phase 3 — seats.aero award availability (3–4 days)
Goal: add an award-search path and store results, mirroring the cash side.
- Add a **seats.aero API client** (Cached Search + Routes endpoints). Pro key in env/secret. Respect the **1,000 calls/day** cap (counter + `X-RateLimit-Remaining`), include **attribution** in the UI per their terms. Use the app-native REST client (not the MCP — the MCP is for agentic/Claude use, out of scope here).
- Extend the Prisma schema for award results: program, cabin, seats, mileage cost, **"Last Seen" timestamp** (surface it — cache can be hours-to-days stale).
- Add an award search UI/route alongside cash search; show a phantom-availability warning ("confirm on the airline site before transferring points").
- **Verify:** an award search returns real availability across multiple programs with correct "Last Seen"; the daily-cap guard blocks the 1,001st call and logs it rather than erroring; attribution renders.

## Phase 4 — unified alerting (2–3 days)
Goal: threshold + availability alerts across cash and award, on top of the existing monitor.
- Define an **alert rule** model: type (cash-price-below-X | award-seats-available), route, dates, cabin, program (award), threshold, channel.
- Extend flight-finder's cron monitor to evaluate award rules against fresh seats.aero pulls (batch within the daily cap) alongside existing cash checks.
- Delivery: reuse flight-finder's notification path if it has one (confirm in Phase 0); otherwise add email via SMTP/Resend. De-dupe so a persistent condition doesn't spam (e.g., one alert per condition per 24h, matching flights-tracker's pattern).
- **Verify:** a synthetic cash rule (price below an absurd threshold) fires an alert; an award rule fires when seats.aero shows space; a persistent condition does **not** re-fire within the de-dupe window.

## Phase 5 — verify assembled, document (1 day)
- Run the **full assembled system live** (per the "don't mock away the race" rule): cash tracking (both GF paths) + award search + alerting all running together, one real route each, alerts delivered.
- README/runbook: env vars, the seats.aero Pro requirement + attribution + daily cap, the fast-flights breakage/fallback behavior, and how to add a provider.
- **Verify:** a new person can stand the whole thing up from the runbook and get one cash alert + one award alert end-to-end.

---

## Rough effort
~9–14 working days total. Phase 3 (seats.aero) and Phase 2 (sidecar + normalization) are the load-bearing work; Phase 0 gates everything.

## Risks
- **Google Flights fragility** — both GF paths ride undocumented behavior; the Playwright fallback is the mitigation. Expect periodic breakage.
- **seats.aero terms** — personal/non-commercial only, ≤1,000 calls/day, attribution required, website automation prohibited (use the API). If this ever goes commercial, written approval needed (support@seats.aero).
- **License hygiene** — copy no code from flights-tracker (no license). flight-finder is MIT and safe to fork.
- **Stale award data** — phantom availability is inherent to seats.aero's cache; surface "Last Seen," never present it as bookable-guaranteed.
- **Seam risk** — if flight-finder has no provider abstraction (Assumption 1 fails), Phases 2–3 grow by ~2–3 days.

## Out of scope (this plan)
- Booking (would be a separate Duffel integration).
- Mistake-fare **detection** engine (separate build on SerpApi `price_insights` — flagged as the real gap in the recon, but a distinct project).
- The seats.aero **MCP** / agentic surface (this plan is the app, not the Claude-agent path).

## Open questions to resolve in Phase 0
1. Does flight-finder have a pluggable provider/source seam, or is Google Flights hardcoded?
2. Does it already have a notification/delivery channel we can reuse, or do we add one?
3. Does its cron monitor generalize to a second data type (award), or is it cash-specific?
