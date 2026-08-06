# Project map

## Core documents

| File | Owns |
|---|---|
| `AGENTS.md` | Portable project behavior |
| `CLAUDE.md` | Claude import |
| `.cursor/rules/00-project-contract.mdc` | Cursor project pointer |
| `CURRENT-TASK.md` | Active goal, completed evidence, remaining steps, next verifier |
| `WORK_QUEUE.md` | Actionable work queue |
| `LOG.md` | Append-only completed work |
| This file's `## State` section | Durable capability state (folded from the retired `STATUS.md`, 2026-08-06) |
| `BACKBURNER.md` | Parked work |
| `MAP.md` | This architecture and navigation map |
| `DESIGN.md` | Universal and project interface rules |
| `PRODUCT.md` | Optional product intent |
| `MEMORY.md` | Lean durable-reference index |
| `skills-manifest.json` | Canonical skill bindings |

## Architecture

| Component | Purpose | Entry point | Owner |
|---|---|---|---|
| Coordination documents | Durable operating state, research, and handoff material | Repository root and `research/` | This repository |
| Fast-flights sidecar | Normalizes keyless Google Flights results for the Flight Finder application | `fast-flights-sidecar/main.py` | This repository |
| Flight Finder application | Next.js application, persistence, alerts, and deployment | `C:\Users\dougl\projects\base-flight-finder` | Separate Git repository |

## Important paths

| Path | Purpose | Generated | Committed |
|---|---|---|---|
| `research/` | Durable research and integration planning | no | yes |
| `fast-flights-sidecar/*.py` | Sidecar source and explicit probe utilities | no | yes |
| `fast-flights-sidecar/requirements.txt` | Reproducible direct dependencies | no | yes |
| `fast-flights-sidecar/venv/` | Local Python environment | yes | no |
| `fast-flights-sidecar/runtime.*.log` | Local service output | yes | no |
| `taskstate/` | Hook/runtime task telemetry | yes | no |
| `C:\Users\dougl\Data\Projects\flight-tracker` | External mutable project-data root | no | no |
| `C:\Users\dougl\projects\base-flight-finder` | Separate application repository | no | no |

## Data flow

The Flight Finder application sends a normalized search request to the local sidecar. `fast-flights` retrieves current Google Flights results, and `main.py` converts them to the application price-data shape. Runtime application state and credentials remain in the separate application repository or its external services. This repository stores documentation, research, and the sidecar source.

## Integrations

| System | Direction | Credential name | Failure behavior |
|---|---|---|---|
| `base-flight-finder` | both | names documented in the application repository | The application handles failures according to its own runbook; this repository does not copy its credentials or runtime data. |
| Google Flights via `fast-flights` | inbound | none | Sidecar returns an HTTP error when the upstream query fails. |

## Ownership and concurrency

The coordination repository and `base-flight-finder` are independent Git repositories. The sidecar uses local port `8123`; do not run parallel sidecar instances on the same port. Application worktrees, databases, deployment targets, and credentials are owned by `base-flight-finder`.

## State

Folded from the retired STATUS.md (2026-08-06 decision).

**App:** A local cash-fare and award-search tracker runs on `affromero/flight-finder` (MIT) with a keyless `fast-flights` data path (Simple/Analyst award views, cash/points comparison, scheduled award searches, unified alert rules behind the seats.aero Pro-key gate).

**Working and verified:**
- PostgreSQL 16 stores cash queries/snapshots, award searches/snapshots, and alert rules.
- The fast-flights sidecar on port 8123 returns Google Flights fares and maps them to `PriceSnapshot` records without a paid fare-data account.
- Cash tracking supports natural-language parsing, immediate/scheduled collection, chart history, and notification channels.
- Date-only tracker travel dates render in UTC, preserving selected calendar dates in Eastern time.
- Award-search list/create/detail/refresh APIs validate input and enforce ownership in multi-user mode.
- `/awards` saves and selects award searches, shows Simple and Analyst comparisons, renders seats.aero attribution, and preserves cached observations during provider failure.
- The ORF → OAK Aug 14–17, 2026 economy award search is saved locally.
- Cron and `/api/cron/scrape` run cash collection, due award searches, and unified alert evaluation together; alert rules dedupe an unchanged condition for 24 hours.
- Current test baseline: **1,483 passed, 2 skipped** (1,440 web + 43 CLI) via `npm run ci` in `base-flight-finder`, as of 2026-08-06; earlier counts (1,419/1,420/1,469/1,478/1,491) are superseded. Run `npm run db:generate` before `typecheck` in a fresh checkout — the Prisma 7 client is untracked.
- The production app on port 3003 passes health, award API, desktop, and narrow-browser checks; `/awards` shares the cash tracker's 900px route-first spine, responsive control rhythm, and Altitude typefaces. The sidecar also passes health.
- Deployment: Ready Vercel production build at `https://flight-finder-hazel.vercel.app`; `/api/health` returns `status: ok` with database and Redis both connected (as of 2026-08-06). Route/cabin/program/alert metadata use Outfit; Geist Mono is reserved for data, enforced by a policy test blocking IBM Plex Mono and the retired typography token.
- Coordination repo public authority: `https://github.com/douglaspmcgowan/flight-tracker`. It carries the portable agent contract, durable coordination documents, research, and pinned fast-flights sidecar source; generated environments, Python caches, runtime logs, hook task state, and local env files are excluded (`.env.example` is the value-free exception). GitHub Actions verify Python 3.12 compilation, pinned dependency installation, the publication boundary, Gitleaks, and dependency-graph submission.

**Awaiting external input:**
- seats.aero cached-search responses: a Pro key is needed to confirm the live endpoint and field mapping.
- Build output: Next uses `.next-local`, isolating current builds from the legacy OneDrive-locked `.next` directory.
- Scheduler proof: observe one elapsed scheduled run after its roughly three-hour interval.
- Notification delivery: configure a real email, ntfy, Telegram, or webhook destination before relying on alerts.
- Award-search rename, pause, and delete controls remain future lifecycle work.
- Automatic Git deployment on Vercel remains disconnected because the Vercel account cannot administer the upstream repository.
- Vercel's install audit reported 14 dependency findings, including 9 high severity (unresolved).
- Operational hosted searches require PostgreSQL plus Prisma migration; reliable scheduled collection requires an external worker or scheduler.

**Open decision / notes:**
- The retained Playwright-plus-LLM extractor provides a fallback when the fast-flights protocol changes.
- The local Claude CLI provider has an expired OAuth session; Ollama handles query parsing.
- Two ORF–OAK trackers exist; Douglas's decision is needed before removing the older one: `cmruqcc1m00003ou71nhcm5jy` (3 snapshots) or `cmruqcpwc00063ou7zb61i4an` (7 snapshots). Recommendation: keep the 7-snapshot row. Prevention shipped 2026-08-06 (`Query_route_daterange_user_key` plus migration `20260806120000_add_tracker_route_uniqueness` and 5 regression tests in `base-flight-finder`), but the rows are not confirmed/removed and the migration is unapplied — this machine has no local PostgreSQL, Docker Desktop, or Doppler CLI, so no database was reachable. Resolve with `scripts/resolve-duplicate-trackers.mjs` (`--report`, `--export <id>`, `--delete <id>`; refuses to delete anything unexported).
- Full architecture and deployment brief: `C:\Users\dougl\projects\base-flight-finder\docs\flight-finder-handoff-2026-07-26.md`.

## Update rule

Update this file when a component boundary, data flow, owner, integration, core document, or important path changes.
