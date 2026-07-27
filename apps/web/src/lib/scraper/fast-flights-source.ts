// fast-flights data source: a keyless, browserless, LLM-free Google Flights
// path served by the local Python sidecar (see `fast-flights-sidecar/`). When
// enabled it runs AHEAD of the Playwright + LLM aggregator chain; on any error
// or an empty result the caller falls back to that chain, so a sidecar outage
// or a Google Protobuf-param change never crashes a scrape.
//
// Enable with FAST_FLIGHTS_ENABLED=true. URL via FAST_FLIGHTS_URL
// (default http://127.0.0.1:8123). Timeout via FAST_FLIGHTS_TIMEOUT_MS.

import type { PriceData } from './extract-prices';
import type { FlightSearchParams } from './navigate';

export function isFastFlightsEnabled(): boolean {
  return process.env.FAST_FLIGHTS_ENABLED === 'true';
}

function sidecarUrl(): string {
  return (process.env.FAST_FLIGHTS_URL || 'http://127.0.0.1:8123').replace(/\/+$/, '');
}

interface SidecarResponse {
  source: string;
  resultsFound: boolean;
  currentPrice: string | null;
  flights: PriceData[];
}

/**
 * Query the fast-flights sidecar for one date pair. Returns normalized
 * PriceData already matching the app's fare model, or throws on any failure so
 * the caller can fall through to the Playwright path.
 */
export async function fetchFastFlights(params: FlightSearchParams): Promise<PriceData[]> {
  const timeoutMs = Number(process.env.FAST_FLIGHTS_TIMEOUT_MS || 45_000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const body = {
    origin: params.origin,
    destination: params.destination,
    outboundDate: params.dateFrom.toISOString().slice(0, 10),
    returnDate:
      (params.tripType ?? 'round_trip') === 'round_trip'
        ? params.dateTo.toISOString().slice(0, 10)
        : null,
    tripType: params.tripType ?? 'round_trip',
    cabin: params.cabinClass ?? 'economy',
    adults: 1,
    currency: params.currency ?? 'USD',
  };

  try {
    const res = await fetch(`${sidecarUrl()}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`fast-flights sidecar HTTP ${res.status}`);
    }
    const data = (await res.json()) as SidecarResponse;
    return Array.isArray(data.flights) ? data.flights : [];
  } finally {
    clearTimeout(timer);
  }
}
