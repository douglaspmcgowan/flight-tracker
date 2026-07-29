# Flight Finder: operating brief

**Status: 2026-07-25.** Flight Finder runs locally as a cash-fare and award-search tracker with Simple and Analyst award comparison modes, unified alerts, and a seats.aero Pro-key gate. The production app is live at `http://localhost:3003`.

## How it works

| Layer | Component | Role |
|---|---|---|
| Web app | `C:\Users\dougl\projects\base-flight-finder` | Next.js UI, tracker and award APIs, PostgreSQL persistence, charts, settings, and notifications. |
| Cash data | `fast-flights-sidecar/` | Local FastAPI wrapper around `fast-flights`, returning normalized Google Flights fares. |
| Award data | `seats-aero-client.ts` | Cached Search client, guarded by `SEATS_AERO_API_KEY` and a 1,000-call/day in-memory limit. |
| Storage | PostgreSQL 16 | Cash queries and snapshots, award searches and snapshots, and unified alert rules. |
| Scheduler | Built-in cron | Runs due cash scrapes, due award searches, and alert-rule evaluation on a three-hour base interval with jitter. |

Cash tracking starts with a route and travel window. The app asks the local fast-flights sidecar for fares, stores each observation, shows history, and can send a cash alert when a rule threshold is reached. The inherited Playwright-plus-LLM extractor remains the fallback path when the sidecar cannot supply fares.

Award searches persist a route, date range, cabin, and optional loyalty programs. Once a Pro key is configured, each run stores availability snapshots. Award rules can trigger when a program has at least the configured number of seats. Every award notification tells the traveler to confirm availability with the airline before transferring points.

The `/awards` route now provides two views over those observations. Simple mode promotes the best observed award, overlapping stored cash fare, cents per point, freshness, and next action. Analyst mode shows the full date/program/cabin/seats/miles/taxes/cash/CPP/observed ledger. A saved ORF → OAK award search covers Aug 14–17, 2026.

## Live local findings

- ORF → OAK, Aug 14–17, 2026 has an existing tracker with a stored best of **USD 435** on Southwest.
- A fresh July 24 sidecar search returned seven fares; the lowest was **USD 373** on Southwest, two stops, 11h 20m.
- The local preview reports web and sidecar health, and `GET /api/awards/searches` returns a successful empty collection when no award search exists.

## Recon used

- `affromero/flight-finder` (MIT) provided the app foundation: tracking UI, snapshots, notification channels, REST patterns, and fallback extractor.
- `AWeirdDev/fast-flights` provided the keyless structured Google Flights data layer, wrapped here by a local sidecar.
- The integration plan guided the cash, award, alerting, and monitoring phases.

## Recon deliberately left out

- `punitarani/flights-tracker` remained a conceptual reference because its license did not support code reuse.
- SerpApi price insights and mistake-fare detection remain out of scope because they add paid dependencies.
- Booking and point transfers remain outside the tracker’s responsibility.
- Seats.aero live mapping and real award availability remain pending because a Pro key is unavailable.

## Verified

- Prisma schema migration and generated client include award searches, award snapshots, and alert rules.
- Award search, refresh, and alert-rule APIs enforce input validation and user ownership in multi-user mode.
- Cron and the authenticated monitor endpoint run cash work, award work, and unified alert evaluation in one pass.
- Alert rules are deduplicated for 24 hours per unchanged condition.
- Automated suite: **1,419 passed, 2 skipped** across the web and CLI projects; lint, TypeScript, the production web build, and the CLI bundle pass.
- Production app: health, the saved award search, both comparison modes, provider-paused recovery, attribution, responsive reflow, and home-page navigation pass on port 3003.

## Open items

| Item | Needed |
|---|---|
| Award provider verification | A seats.aero Pro key and a live cached-search response to confirm the field mapping. |
| Build output | Next now uses `.next-local`, isolating generated output from the legacy OneDrive-locked `.next` directory. |
| Scheduler elapsed-time proof | Observe one scheduled run after its roughly three-hour interval. |
| Notification delivery | Configure a real email, ntfy, Telegram, or webhook channel before relying on alerts. |
| Award-search lifecycle | Rename, pause, and delete controls remain future work; create and select are implemented. |
| Duplicate tracker | Douglas should decide whether to remove `cmruqcc1m00003ou71nhcm5jy` (3 snapshots) and retain `cmruqcpwc00063ou7zb61i4an` (7 snapshots). |

See `AWARD-WORKSPACE-BRIEF.md` for the full capability/source audit, `RUNBOOK.md` for local startup, and `FORK-CHANGES.md` for implementation detail.
