// seats.aero award-availability client. Request parameters and response fields
// follow the provider's published Cached Search OpenAPI schema. A live key is
// still required for an end-to-end provider verification.
//
// Terms baked in (do not remove):
//  - Personal / non-commercial use only.
//  - <= 1,000 API calls/day (resets midnight UTC). Enforced by the daily-cap
//    guard below; the 1,001st call is refused and logged, never silently sent.
//  - Attribution is REQUIRED wherever award data is shown (see ATTRIBUTION).
//  - Use the API, never website automation. Live Search is approved-partners
//    only and is deliberately NOT called here (Cached Search only).
//
// Activate by setting SEATS_AERO_API_KEY. Without it, isAwardEnabled() is false
// and callers skip the award path entirely.

import { redis } from '@/lib/redis';

const BASE_URL = 'https://seats.aero/partnerapi';
const DAILY_CAP = 1000;

export const ATTRIBUTION = 'Award availability data from seats.aero';

export function isAwardEnabled(): boolean {
  return Boolean(process.env.SEATS_AERO_API_KEY);
}

// Redis coordinates the daily cap across production workers. The in-memory
// counter remains a conservative fallback for a single process when Redis is
// intentionally disabled or temporarily unreachable.
let callDayKey = '';
let callCount = 0;

function utcDayKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/** Returns remaining calls today without consuming one. */
export function awardCallsRemaining(now = new Date()): number {
  if (utcDayKey(now) !== callDayKey) return DAILY_CAP;
  return Math.max(0, DAILY_CAP - callCount);
}

function consumeLocalCall(now: Date): boolean {
  const day = utcDayKey(now);
  if (day !== callDayKey) {
    callDayKey = day;
    callCount = 0;
  }
  if (callCount >= DAILY_CAP) return false;
  callCount += 1;
  return true;
}

async function consumeCall(now = new Date()): Promise<boolean> {
  if (redis) {
    try {
      const key = `ft:seats-aero:calls:${utcDayKey(now)}`;
      const count = await redis.incr(key);
      if (count === 1) {
        const tomorrow = new Date(Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + 1,
        ));
        await redis.expire(key, Math.max(1, Math.ceil((tomorrow.getTime() - now.getTime()) / 1000)));
      }
      return count <= DAILY_CAP;
    } catch (error) {
      console.warn(
        `[award] shared call counter unavailable: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return consumeLocalCall(now);
}

export interface AwardResult {
  program: string; // mileage program, e.g. "united", "aeroplan"
  origin: string;
  destination: string;
  date: string; // YYYY-MM-DD
  cabin: string; // 'economy' | 'premium' | 'business' | 'first'
  seatsAvailable: number | null;
  mileageCost: number | null;
  taxesFees: string | null;
  lastSeen: string | null; // ISO — surface this; the cache can be hours/days stale
  bookingProgram: string | null;
}

const CABIN_FIELDS = {
  economy: 'Y',
  premium: 'W',
  premium_economy: 'W',
  business: 'J',
  first: 'F',
} as const;

function finitePositiveInteger(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

async function seatsAeroFetch(path: string, params: Record<string, string>): Promise<unknown> {
  const key = process.env.SEATS_AERO_API_KEY;
  if (!key) throw new Error('SEATS_AERO_API_KEY not set — award path disabled');

  if (!(await consumeCall())) {
    // Refuse rather than error: the daily cap is a terms obligation, so the
    // 1,001st call is dropped and logged, and the caller degrades gracefully.
    console.warn(`[award] daily seats.aero cap (${DAILY_CAP}) reached — refusing call to ${path}`);
    throw new Error('seats.aero daily call cap reached');
  }

  const url = `${BASE_URL}${path}?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url, {
    headers: { 'Partner-Authorization': key, Accept: 'application/json' },
  });
  const remaining = res.headers.get('X-RateLimit-Remaining');
  if (remaining !== null) {
    console.log(`[award] seats.aero X-RateLimit-Remaining=${remaining}`);
  }
  if (!res.ok) {
    throw new Error(`seats.aero ${path} HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Cached award search for a route + date. Uses the Cached Search endpoint (not
 * Live Search, which is partner-gated). UNVERIFIED response mapping — confirm
 * against a live payload before relying on it.
 */
export async function searchAward(opts: {
  origin: string;
  destination: string;
  date: string;
  cabin?: string;
  programs?: string[];
}): Promise<AwardResult[]> {
  const requestedCabin = opts.cabin ?? 'economy';
  const fieldPrefix = CABIN_FIELDS[requestedCabin as keyof typeof CABIN_FIELDS] ?? 'Y';
  const raw = await seatsAeroFetch('/search', {
    origin_airport: opts.origin,
    destination_airport: opts.destination,
    start_date: opts.date,
    end_date: opts.date,
    cabins: fieldPrefix === 'W' ? 'premium' : requestedCabin,
    take: '1000',
    ...(opts.programs?.length ? { sources: opts.programs.join(',') } : {}),
  });

  const rows = (raw as { data?: unknown[] })?.data ?? [];
  return rows.flatMap((r) => {
    const o = r as Record<string, unknown>;
    if (o[`${fieldPrefix}Available`] !== true) return [];

    const route = o.Route && typeof o.Route === 'object'
      ? o.Route as Record<string, unknown>
      : {};
    const program = String(o.Source ?? route.Source ?? 'unknown');
    const date = typeof o.Date === 'string' ? o.Date : opts.date;

    return [{
      program,
      origin: typeof route.OriginAirport === 'string' ? route.OriginAirport : opts.origin,
      destination: typeof route.DestinationAirport === 'string' ? route.DestinationAirport : opts.destination,
      date,
      cabin: requestedCabin,
      seatsAvailable: finitePositiveInteger(o[`${fieldPrefix}RemainingSeats`]),
      mileageCost: finitePositiveInteger(o[`${fieldPrefix}MileageCost`]),
      taxesFees: null,
      lastSeen: o.UpdatedAt != null ? String(o.UpdatedAt) : null,
      bookingProgram: program === 'unknown' ? null : program,
    }];
  });
}
