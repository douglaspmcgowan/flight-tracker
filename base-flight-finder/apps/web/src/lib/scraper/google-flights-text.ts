import { parseDurationToMinutes } from './duration';
import type { PriceData, QueryFilters } from './extract-prices';
import type { FlightSearchParams } from './navigate';

function normalizeTime(value: string | undefined): string | null {
  if (!value) return null;
  const normalized = value.replace(/[\u202f\u00a0]/g, ' ').trim();
  return /^\d{1,2}:\d{2}\s(?:AM|PM)$/i.test(normalized) ? normalized : null;
}

function departureMinutes(value: string | null): number | null {
  if (!value) return null;
  const match = value.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/i);
  if (!match) return null;
  const hour = Number(match[1]) % 12 + (match[3]?.toUpperCase() === 'PM' ? 12 : 0);
  return hour * 60 + Number(match[2]);
}

function matchesTimePreference(value: string | null, preference: string): boolean {
  if (preference === 'any') return true;
  const minutes = departureMinutes(value);
  if (minutes === null) return true;
  if (preference === 'morning') return minutes >= 5 * 60 && minutes < 12 * 60;
  if (preference === 'afternoon') return minutes >= 12 * 60 && minutes < 17 * 60;
  if (preference === 'evening') return minutes >= 17 * 60 && minutes < 21 * 60;
  if (preference === 'redeye') return minutes >= 21 * 60 || minutes < 5 * 60;
  return true;
}

function matchesFilters(price: PriceData, filters: QueryFilters): boolean {
  if (filters.maxPrice !== null && price.price > filters.maxPrice) return false;
  if (filters.maxStops !== null && price.stops > filters.maxStops) return false;
  if (filters.maxDurationHours !== null) {
    const duration = parseDurationToMinutes(price.duration);
    if (duration !== null && duration > filters.maxDurationHours * 60) return false;
  }
  if (
    filters.preferredAirlines.length > 0
    && !filters.preferredAirlines.some((airline) =>
      price.airline.toLowerCase().includes(airline.toLowerCase()))
  ) {
    return false;
  }
  return matchesTimePreference(price.departureTime, filters.timePreference);
}

export function parseGoogleFlightsText(
  text: string,
  params: FlightSearchParams,
  filters: QueryFilters,
  searchUrl: string,
): PriceData[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const routePattern = new RegExp(
    `^${params.origin}\\s*[–—-]\\s*${params.destination}$`,
    'i',
  );
  const travelDate = params.dateFrom.toISOString().slice(0, 10);
  const currency = params.currency ?? 'USD';
  const prices: PriceData[] = [];
  const seen = new Set<string>();

  for (let priceIndex = 0; priceIndex < lines.length; priceIndex++) {
    const priceMatch = lines[priceIndex]?.match(/^\$\s?([\d,]+)(?:\.(\d{2}))?$/);
    if (!priceMatch) continue;

    let routeIndex = -1;
    for (let index = priceIndex - 1; index >= Math.max(0, priceIndex - 12); index--) {
      if (routePattern.test(lines[index] ?? '')) {
        routeIndex = index;
        break;
      }
    }
    if (routeIndex < 5) continue;

    const airline = lines[routeIndex - 2] ?? '';
    const duration = lines[routeIndex - 1] ?? null;
    const stopsLine = lines[routeIndex + 1] ?? '';
    const stopsMatch = stopsLine.match(/^(\d+)\s+stops?$/i);
    const stops = /^nonstop$/i.test(stopsLine) ? 0 : Number(stopsMatch?.[1]);
    const departureTime = normalizeTime(lines[routeIndex - 5]);
    const arrivalTime = normalizeTime(lines[routeIndex - 3]);
    if (!airline || !Number.isFinite(stops) || !departureTime || !arrivalTime) continue;

    const whole = Number(priceMatch[1]?.replace(/,/g, ''));
    const fraction = priceMatch[2] ? Number(priceMatch[2]) / 100 : 0;
    const price = whole + fraction;
    if (!Number.isFinite(price) || price <= 0) continue;

    const parsed: PriceData = {
      travelDate,
      price,
      currency,
      airline,
      bookingUrl: searchUrl,
      stops,
      duration,
      departureTime,
      arrivalTime,
      seatsLeft: null,
      flightNumber: null,
    };
    const key = [
      parsed.airline,
      parsed.departureTime,
      parsed.arrivalTime,
      parsed.price,
      parsed.stops,
    ].join('|');
    if (seen.has(key) || !matchesFilters(parsed, filters)) continue;
    seen.add(key);
    prices.push(parsed);
  }

  return prices;
}
