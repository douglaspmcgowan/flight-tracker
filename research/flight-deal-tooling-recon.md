# Flight-deal tooling recon (mid-2026)

Research date: 2026-07-19. US-departure assumption unless noted. Pricing is time-sensitive — re-verify before committing money. Every claim traces to a source; vendor-only and single-source claims are flagged inline.

Method: a 108-agent deep-research pass (5 angles, 26 sources fetched, 25 claims put through 3-vote adversarial verification) plus four follow-up research agents on reputation, consumer apps, repo internals, and MCP-vs-API.

---

## Q1 — Do the "lower" repos have anything flight-finder doesn't?

Yes. `affromero/flight-finder` is the broadest **cash-fare tracker**, but each other repo does something it can't:

| Repo | What it adds over flight-finder | What it lacks that flight-finder has |
|---|---|---|
| **AWeirdDev/flights (fast-flights)** | Keyless Google Flights extraction via Base64/Protobuf decode — no browser, no LLM, much faster/cheaper. Biggest community (~1.2k★). Clean typed Python API. | Everything above the data layer: no UI, tracking, alerts, storage, award search. It is a data library. |
| **punitarani/flights-tracker (GrayPane)** | **Award-seat search via seats.aero** + a real **alerting engine** (user rules, thresholds, Cloudflare Workers 6h cron, email via Resend). Apple MapKit route viz. | VPN multi-country compare, desktop/PWA, built-in LLM NL parsing, shareable no-login links. **No LICENSE file — treat as all-rights-reserved.** |
| **pfei-sa/seats-aero-viz** | **Multi-segment award visualization** — plots award seat availability across several legs at once. flight-finder has zero award capability. | Cash fares, tracking, alerting, everything else. Single-purpose viewer. **Semi-stale (last commit May 2024).** |
| **jeancsil/flight-spy** | **Slack alerts** + budget-threshold model + Elasticsearch/Kibana price dashboards. | Award search, keyless scraping, modern UI, LLM. **Abandoned (last commit Apr 2017); its Skyscanner API dependency is now partner-gated.** |

**What flight-finder still owns:** VPN price comparison across 19 countries, desktop app + PWA, LLM natural-language query parsing, Plotly price-evolution charts, shareable no-login public links, multi-user household mode, and a REST API explicitly built for agents. It is the most complete self-hosted **cash-fare** app; it just has no award/points side. Active (release Jul 11 2026), MIT, ~114★.

**The gap none of them fill:** award search in flight-finder, and mistake-fare *detection* anywhere (see Q5).

---

## Q2 — ErrorFareAlerts: do people actually use it?

**Verdict: legitimate but obscure — no independent user footprint to justify relying on it.** (Confidence: medium-high on "no meaningful community reputation" — absence was consistent across every channel.)

- **Real, not a scam.** Run by MyActivities GmbH (Waiblingen, Germany), domain ~10 yrs old, valid SSL, "very likely safe" per Scamadviser. Free (email + push); a "premium deals" tier is mentioned but undocumented.
- **No independent voices anywhere.** Zero substantive Reddit (r/travel, r/awardtravel, r/churning), zero FlyerTalk, no Trustpilot listing, no HN. Every positive "review" traces to the vendor's own site. iOS listing shows 1.0/5 from a *single* rating (AppBrain — single-source) — i.e., no real user base, not a bad product. App last updated ~Jan 2025.
- **"Instant/real-time" is unproven.** Error fares die in minutes, so latency is decisive, and no third party confirms this service is fast enough to beat Reddit/FlyerTalk/Secret Flying.

**Bottom line:** fine as a free supplementary signal; weak as a primary dependency. Confirm its notification speed yourself before trusting it.

### Who practitioners actually trust (ranked)
1. **FlyerTalk + Reddit (r/awardtravel, r/churning)** — free; where the hardcore find fares *first*, often hours ahead of aggregators.
2. **Secret Flying** — free, the most-recommended dedicated *error-fare* site.
3. **Thrifty Traveler Premium** (~$130/yr) — the one with **instant SMS mistake-fare alerts** ("Unicorn" alerts). The feature that matters for error fares.
4. **Jack's Flight Club** (~$49/yr) — strongest independent reputation of paid tools (Trustpilot 4.8/5, 300+ reviews, ~1.6M members).
5. **Going / Scott's Cheap Flights** (free / $49 / $199) — highest deal *volume*, but no SMS and weaker on true mistake fares.

Recurring caveat: no paid service has fares you can't find free — you're buying curation and speed, not exclusivity.

---

## Q3 — Consumer apps, checked (incl. seats.aero)

### Cash-fare aggregators (all free to the user)
- **Google Flights** — the default. Best date-grid, "cheapest month," Price Insights (low/typical/high + history), free price tracking. Weak on ultra-low-cost carriers and Southwest. **No official public API since 2018** — every "Google Flights API" is a third-party scraper.
- **Skyscanner** — widest inventory incl. budget/regional carriers; "Everywhere" discovery search. Routes you to variable-quality OTAs. Best as a cross-check, not a booking endpoint.
- **Kayak** — power-user filters, **Hacker Fares** (stitches two one-ways), buy/wait forecast. Overlaps heavily with Google.
- **Momondo** — shares Kayak's inventory (same parent), cleaner UI. Largely redundant; a marginal cross-check.
- **Kiwi.com** — genuinely differentiated: **virtual interlining** builds self-transfer itineraries across non-partner carriers that no one else shows. The catch (heavily documented): separate tickets, **no airline-side protection**; a missed self-transfer is on you unless you buy the Kiwi Guarantee (and its remedies draw frequent complaints). Use as price-discovery, carry-on only, pad your connections.

**Cash-fare verdict:** Google Flights + Skyscanner covers ~90%. Kayak adds filters/Hacker Fares. Momondo is marginal. Kiwi is a specialist tool with real risk.

### Curated deal / error-fare services
- **Going** — free / **$49 Premium** / **$199 Elite** (verified Jul 2026). Best all-around "push me deals from my home airport." Elite ($199) is contested — only worth it if you chase business/first.
- **Jack's Flight Club** — free + **~$49/yr** (confirm on official site). Cheapest premium service; strong Europe/transatlantic + error fares. Less customizable than Going.
- **Skiplagged** — the only mainstream **hidden-city** finder (~50% claimed savings). Legal status: a federal jury upheld the practice as legal (re-affirmed May 6 2025), but American Airlines won **$9.4M** against Skiplagged for copyright; airlines still prohibit it in their contracts. One-way + carry-on only; repeat use risks forfeited miles/bans. Use as a fare-finder, not on a mileage account you value.
- **Hopper** — consumer price-prediction + Price Freeze. The "95% accuracy" claim is self-reported and unverified; repeated documented complaints about carrier-fee markups, pre-selected tip toggles, and refunds (Trustpilot 2025 + Tripadvisor). Points/churning crowd is skeptical-to-negative; aimed at casual leisure travelers.

### Award / points tools (the deep dive)
- **seats.aero** — **cached** availability across ~24-25 programs; instant, scans huge date ranges. The tradeoff: cache can be **hours-to-days stale** ("phantom availability" — a seat shows bookable but isn't; documented and inherent to the model). Always check "Last Seen" and confirm on the airline site before transferring points. Free = 60-day window; **Pro $9.99/mo or $99.99/yr** = full year, faster refresh, fare-class + seat-map viewers, United PlusPoints finder, alerts. Best for wide-range premium-cabin hunting.
- **PointsYeah** — **best free tier** (NerdWallet's 2026 pick). ~22 airline + 6 hotel + 6 transfer-partner programs (broadest coverage), live-ish search (fresher than seats.aero's cache), seat maps. Free = 4-day window; **Premium $11.99/mo or $99.99/yr** = 8-day, multi-airport, 32 alerts.
- **Roame** — real-time search + **SkyView** discovery view (aggregates deals from the prior ~48h). Free = 3-day window; **Friends of Roame $12.99/mo or $109.99/yr** (TPG code → ~$9.74/mo) = 7-day + alerts. Business tier $399.99/mo. Narrower window than PointsYeah; avoids cache staleness.
- **Also named by 2026 experts (not on the original list but repeatedly outranking the trio for serious bookings):** **AwardFares** (live data, deep filters, seat maps — "trusted when the booking actually matters") and **Point.me** (tells you *how* to book, not just where space is).

**Award verdict:** the consumer trio (seats.aero / PointsYeah / Roame) meaningfully overlap; serious users run 2 of 3. Start free with PointsYeah + Roame; add seats.aero Pro for long-range premium scanning and its personal API.

---

## Q4 — MCPs vs APIs: how they differ

**The core distinction:** an **API** is the raw data/booking source you call from code. An **MCP server** is a thin wrapper that exposes an API's operations as *tools an LLM agent can call directly* (in Claude Code, Claude Desktop, etc.). Almost every flight MCP sits on top of one of the APIs below. You use an **API** when you're writing a program that controls the flow; you use an **MCP** when you want Claude itself to do the searching conversationally. For a build, you often want both: MCP for the interactive/agent surface, the API underneath for scheduled jobs and detection logic.

### MCP servers

| MCP | Wraps | Exposes | Book? | Cash/Award | Key | Status |
|---|---|---|---|---|---|---|
| **ravinahp/flights-mcp** | **Duffel API** | search one-way / round-trip / multi-city, offer details, multi-day price optimization | No (search only) | Cash | Duffel key (`duffel_test` or live) | Aging (last commit Jun 2025) |
| **gavgrego/seats.aero-mcp-server** | **seats.aero API** | `get_flights`, `get_bulk_avail`, `get_routes` per mileage program, natural-language award search | No | **Award** | seats.aero Pro key | Active (Jul 2026); multiple repackagings on npm/lobehub |
| **Kiwi.com MCP** | Kiwi (per a vendor blog by alpic.ai) | agentic flight booking (claimed) | Claimed | Cash | — | **Existence not independently verified — treat as unconfirmed** |

**What each MCP has that the others don't:** flights-mcp is the only one on a **bookable** cash-fare backend (Duffel); seats.aero-mcp is the only **award/points** agent surface. They're complementary, not competitors — one for cash, one for miles.

### APIs

| API | Book? | Price history/insights | Coverage | Free tier | Automated-use | Status (2026-07-19) |
|---|---|---|---|---|---|---|
| **Duffel** | **Yes (book+ticket)** | No | 300+ (NDC+GDS+LCC) | Sandbox free, unlimited test | Built for it; no explicit agent clause (verify) | Active |
| **Amadeus Self-Service** | Yes | **Yes** (Flight Price Analysis) | 400+ (GDS) | Was free test quota/API | Built for it | **Reportedly decommissioned ~17 Jul 2026** (PhocusWire + vendor blogs; Amadeus pages wouldn't render — verify) |
| **SerpApi Google Flights** | No (search) | **Yes — richest** (`price_insights`: lowest_price, price_level, typical_price_range, price_history) | Whatever Google shows | 250 searches/mo | **Explicitly allowed** + "US Legal Shield" | Active |
| **Kiwi Tequila** | Historically yes | — | Kiwi virtual-interline | — | — | **CLOSED to new devs — invitation-only since May 30 2024** (Kiwi primary source) |
| **FlightAPI.io** | No ("only tracks prices") | No | 700+ claimed | 20 trial calls only | Unverified | Active. LITE $49/mo, STANDARD $99/mo, PLUS $199/mo |
| **Skyscanner API** | Referral/redirect | — | 100s airlines+OTAs | No public tier | — | **Partner-only, application-gated; no self-serve** |
| **seats.aero API** | No | — | ~20-25 programs, 70k+ routes | Pro required | **Personal/non-commercial only**; up to **1,000 calls/day**; Live Search = approved partners only; commercial needs written approval | Active |
| **Roame API** | — | — | — | — | **No public developer API found** (don't confuse with unrelated "Travel Roam" / "Roam") | — |

**Pricing note:** Duffel = **$3.00/confirmed order + 1% managed content** (+ $2/ancillary, $0.005/excess search beyond a 1500:1 ratio, 2% FX), zero upfront, sandbox key in ~1 minute; live requires KYC. SerpApi pricing tiers: Free 250 / Starter $25 (1k) / Developer $75 (5k) / Production $150 (15k) / Big Data $275 (30k). All vendor-page single-source unless noted.

### Best API for each job
- **Real booking:** **Duffel** (only actively-available self-serve booking API now that Amadeus Self-Service is reportedly gone). Lowest barrier too.
- **Mistake-fare / anomaly detection:** **SerpApi Google Flights** — its `price_insights` (typical range + price history + level) is exactly what you diff a live fare against. Best-fit of all four data APIs.
- **Award optimization:** **seats.aero API** (personal, non-commercial, ≤1,000 calls/day, with attribution) — the only sanctioned programmatic award source. Roame has no public API.
- **Lowest barrier to start:** **Duffel** (sandbox in a minute) for booking; **SerpApi** (free 250/mo) for data.

---

## Q5 — Which APIs/MCPs each GitHub repo pulls from

| Repo / MCP | Data source | Access method | Key? |
|---|---|---|---|
| **affromero/flight-finder** | Google Flights (primary); Skyscanner/Kayak/airline-direct experimental | Scrape public GF UI via Playwright headless Chromium (stealth, 3-URL rotation) + BYO-LLM extraction; avoids GF internal API | No key for GF; needs an LLM (free via Claude Code/Codex or your own key) |
| **AWeirdDev/flights (fast-flights)** | Google Flights; optional BrightData, SearchApi | Reverse-engineered request via GF **Base64/Protobuf** params (no browser) | No key for core |
| **punitarani/flights-tracker (GrayPane)** | **seats.aero** (award) + Google Flights (cash) | seats.aero official API; cash via reverse-engineered GF API (author's internal `fli` lib — *inferred from `src/lib/fli`, not stated in README*) | seats.aero key; GF path keyless |
| **pfei-sa/seats-aero-viz** | **seats.aero** only | Official seats.aero API | Yes (user's own Pro key) |
| **jeancsil/flight-spy** | **Skyscanner** only | Official Skyscanner API | Yes (now partner-gated → likely won't work) |
| **ravinahp/flights-mcp** | **Duffel** | Official Duffel API, read-only search | Yes (Duffel) |
| **gavgrego/seats.aero-mcp-server** | **seats.aero** | Official seats.aero API | Yes (seats.aero Pro) |

**One-line landscape:**
- Google Flights, keyless → flight-finder (browser scrape), fast-flights (protobuf), flights-tracker cash side
- seats.aero (award, key) → flights-tracker, seats-aero-viz, gavgrego MCP
- Skyscanner (key, gated) → flight-spy
- Duffel (key) → ravinahp MCP

---

## Recommended build (technical, self-host)

The gap analysis points to a clean stack:

1. **Core cash tracker:** run/fork `affromero/flight-finder` — it already is the self-hosted, BYO-Claude, agent-exposed price tracker, and its keyless Google Flights scrape means no per-call API cost. For a lighter data layer, `fast-flights` (protobuf, no browser) is faster/cheaper.
2. **Award side (the gap):** add `gavgrego/seats.aero-mcp-server` + a seats.aero Pro key ($99.99/yr, ≤1,000 calls/day, personal use). This is the piece flight-finder lacks entirely.
3. **Booking, when needed:** `ravinahp/flights-mcp` on a Duffel sandbox key (free to prototype).
4. **Mistake-fare detector (nothing off-the-shelf does this):** build it yourself on **SerpApi's `price_insights`** — a statistical anomaly check of a candidate fare vs `typical_price_range` + `price_history`. This is the highest-leverage original code; no mature open-source detector exists.

**Standing caveats:** all pricing is mid-2026, re-verify. Scrapers ride undocumented Google params and break periodically. Amadeus Self-Service and Kiwi Tequila are both effectively closed to new devs now — Duffel + SerpApi are the durable sanctioned pair. Hidden-city (Skiplagged) and Pro-website scraping carry real ToS exposure if run continuously; seats.aero's *API* is the sanctioned path, its website automation is prohibited.

## Open items
- Kiwi.com MCP server — existence/maintenance not independently verified.
- seats.aero commercial/agentic terms if you ever productize (personal ≤1,000/day is clear; commercial needs written approval).
- AwardFares / Point.me — not researched in depth here but consistently outrank the award trio for serious bookings in 2026 roundups.
