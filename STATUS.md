# STATUS — Flight Tracker

**Where it stands (2026-07-25):** A local cash-fare and award-search tracker runs on `affromero/flight-finder` (MIT) with a keyless `fast-flights` data path. The existing app now includes Simple and Analyst award views, cash/points comparison, scheduled award searches, and unified alert rules behind the seats.aero Pro-key gate.

## Working and verified

- PostgreSQL 16 stores cash queries and snapshots, award searches and snapshots, and alert rules.
- The fast-flights sidecar on port 8123 returns Google Flights fares and maps them to `PriceSnapshot` records without a paid fare-data account.
- Cash tracking supports natural-language parsing, immediate or scheduled collection, chart history, and notification channels.
- Date-only tracker travel dates render in UTC, preserving the selected calendar dates in Eastern time.
- Award-search list/create/detail/refresh APIs validate input and enforce ownership in multi-user mode.
- `/awards` saves and selects award searches, shows Simple and Analyst comparisons, renders seats.aero attribution, and preserves cached observations during provider failure.
- The ORF → OAK Aug 14–17, 2026 economy award search is saved locally.
- Cron and `/api/cron/scrape` run cash collection, due award searches, and unified alert evaluation together.
- Alert rules deduplicate an unchanged condition for 24 hours.
- Automated suite: **1,483 passed, 2 skipped — run 2026-08-06** (1,440 web + 43 CLI) via `npm run ci` in `base-flight-finder`. Web/CLI lint, TypeScript, web build, and CLI bundle pass. This is the only current figure; 1,419, 1,420, 1,469, 1,478 and 1,491 all appeared in earlier records and are superseded. Run `npm run db:generate` before `typecheck` in a fresh checkout — the Prisma 7 client is untracked and its absence fails the build.
- The production app on port 3003 passes health, award API, desktop, and narrow-browser checks; `/awards` now shares the cash tracker's 900px route-first spine, responsive control rhythm, and delivered Altitude typefaces. The sidecar also passes health.

## Awaiting external input

- seats.aero cached-search responses: a Pro key is needed to confirm the live endpoint and field mapping.
- Build output: Next uses `.next-local`, isolating current builds from the legacy OneDrive-locked `.next` directory.
- Scheduler proof: observe one elapsed scheduled run after its roughly three-hour interval.
- Notification delivery: configure a real email, ntfy, Telegram, or webhook destination before relying on alerts.
- Award-search rename, pause, and delete controls remain future lifecycle work.

## Notes

- The retained Playwright-plus-LLM extractor provides a fallback when the fast-flights protocol changes.
- The local Claude CLI provider has an expired OAuth session; Ollama handles query parsing.
- Two ORF–OAK trackers exist. Douglas’s decision is needed before removing the older one: `cmruqcc1m00003ou71nhcm5jy` (3 snapshots) or `cmruqcpwc00063ou7zb61i4an` (7 snapshots). Recommendation: keep the 7-snapshot row for its longer price history. **Prevention shipped 2026-08-06** — `Query_route_daterange_user_key` plus migration `20260806120000_add_tracker_route_uniqueness` and 5 regression tests in `base-flight-finder`. **The rows were not confirmed or removed and the migration is unapplied**: this machine has no local PostgreSQL, no Docker Desktop and no Doppler CLI, so no database was reachable. Resolve with `scripts/resolve-duplicate-trackers.mjs` (`--report`, `--export <id>`, `--delete <id>`; it refuses to delete anything unexported).

## Deployment update — 2026-07-26

- The web surface has a Ready Vercel production build at `https://flight-finder-hazel.vercel.app`.
- Production health is degraded because managed PostgreSQL is absent and Redis is disabled. *(Superseded — as of 2026-08-06 `/api/health` returns `status: ok` with database and Redis both connected.)*
- Operational hosted searches require PostgreSQL plus Prisma migration. Reliable scheduled collection requires an external worker or scheduler.
- Ordinary route, cabin, program, and alert metadata now use Outfit. Geist Mono is reserved for data, and a policy test blocks IBM Plex Mono and the retired typography token.
- Fresh verification passed: 1,420 tests, 2 skipped, web and CLI lint/typecheck, Next.js build, CLI bundle, and desktop/mobile browser checks. *(Historical figure — superseded by the 1,483 / 2 skipped run of 2026-08-06.)*
- Automatic Git deployment remains disconnected because the Vercel account cannot administer the upstream repository.
- Vercel's install audit reported 14 dependency findings, including 9 high severity.
- Full architecture and deployment brief: `C:\Users\dougl\projects\base-flight-finder\docs\flight-finder-handoff-2026-07-26.md`.

## Coordination repository — 2026-07-29

- Public authority: `https://github.com/douglaspmcgowan/flight-tracker`.
- The repository contains the portable agent contract, durable coordination documents, research, and pinned fast-flights sidecar source.
- Generated environments, Python caches, runtime logs, hook task state, and local environment files are excluded. `.env.example` is the value-free portable-baseline exception.
- The Flight Finder application remains in the separate `C:\Users\dougl\projects\base-flight-finder` repository.
- GitHub Actions verify Python 3.12 compilation, pinned dependency installation, the publication boundary, Gitleaks, and dependency-graph submission.
