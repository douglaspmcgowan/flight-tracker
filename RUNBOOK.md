# Flight Finder runbook

## Services

| Service | Address | Purpose |
|---|---|---|
| Web app | `http://localhost:3003` | Cash trackers, price history, the `/awards` workspace, APIs, and settings. |
| fast-flights sidecar | `http://127.0.0.1:8123` | Structured Google Flights cash-fare results. |
| PostgreSQL | Local service | Application persistence. |
| Ollama | Local service | Natural-language route parsing. |

The web app loads local configuration from `C:\Users\dougl\projects\base-flight-finder\.env` and `C:\Users\dougl\projects\base-flight-finder\apps\web\.env.local`. Keep those files private.

## Start

```powershell
Set-Location 'C:\Users\dougl\projects\flight-tracker\fast-flights-sidecar'
.\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8123
```

In a second PowerShell window:

```powershell
Set-Location 'C:\Users\dougl\projects\base-flight-finder'
npm.cmd run build
npm.cmd run start
```

The Next configuration writes generated output to `apps/web/.next-local`. This avoids a legacy OneDrive lock in `.next`.

## Verify

```powershell
Invoke-RestMethod http://127.0.0.1:3003/api/health
Invoke-RestMethod http://127.0.0.1:8123/health
Invoke-WebRequest http://127.0.0.1:3003/api/awards/searches -UseBasicParsing
```

## Cash fare flow

Create a tracker through the web UI. Each collection uses the fast-flights sidecar first and stores normalized `PriceSnapshot` records. The inherited Playwright-plus-LLM path remains available when the fast-flights source cannot return fares.

Use **Refresh prices now** on an existing tracker for an immediate collection. The built-in scheduler runs due work on a three-hour base interval with jitter when `CRON_ENABLED=true`.

## Award flow

Open `http://localhost:3003/awards`. Save an airport pair, inclusive date range, cabin, and optional comma-separated loyalty programs. Simple mode summarizes the best observed award and overlapping cash fare. Analyst mode exposes the full comparison ledger.

Set `SEATS_AERO_API_KEY` in the server environment only after obtaining a seats.aero Pro key, then restart the app. The provider is limited in code to 1,000 calls per day and uses Cached Search. Confirm carrier availability before transferring points.

The API routes are:

- `GET` / `POST` `/api/awards/searches`
- `GET` `/api/awards/searches/<id>`
- `POST` `/api/awards/searches/<id>/refresh`
- `GET` / `POST` `/api/alert-rules`

## Alerts

Cash rules trigger when a price falls below a configured threshold. Award rules trigger when availability reaches the configured seat count, with optional program and cabin filters. A successful alert condition is deduplicated for 24 hours. Configure an email, ntfy, Telegram, or webhook channel in the app before relying on delivery.

## Verification suite

```powershell
Set-Location 'C:\Users\dougl\projects\base-flight-finder\apps\web'
npx.cmd vitest run
npx.cmd tsc --noEmit -p tsconfig.json
```

The latest run completed with 1,419 passing tests and 2 skipped tests across web and CLI. Lint, both TypeScript projects, the production web build, and the CLI bundle pass.
