import { navigateGoogleFlights } from '../src/lib/scraper/navigate';
import { parseGoogleFlightsText } from '../src/lib/scraper/google-flights-text';

async function main() {
  const result = await navigateGoogleFlights({
    origin: 'ORF',
    destination: 'OAK',
    dateFrom: new Date('2026-08-14T12:00:00Z'),
    dateTo: new Date('2026-08-17T12:00:00Z'),
    cabinClass: 'economy',
    tripType: 'round_trip',
    currency: 'USD',
    country: 'US',
  });

  const lines = result.html
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const evidence = lines.filter((line, index) => {
    if (/\$\s?\d|USD\s?\d/.test(line)) return true;
    return index > 0 && /\$\s?\d|USD\s?\d/.test(lines[index - 1] ?? '');
  }).slice(0, 40);
  const evidenceWindows = lines.flatMap((line, index) => {
    if (!/\$\s?\d|USD\s?\d/.test(line)) return [];
    return [{
      index,
      lines: lines.slice(Math.max(0, index - 5), index + 4),
    }];
  }).slice(0, 12);
  const parsedFares = parseGoogleFlightsText(
    result.html,
    {
      origin: 'ORF',
      destination: 'OAK',
      dateFrom: new Date('2026-08-14T12:00:00Z'),
      dateTo: new Date('2026-08-17T12:00:00Z'),
      currency: 'USD',
    },
    {
      maxPrice: null,
      maxStops: 2,
      maxDurationHours: null,
      preferredAirlines: [],
      timePreference: 'any',
      cabinClass: 'economy',
    },
    result.url,
  );

  console.log(JSON.stringify({
    resultsFound: result.resultsFound,
    source: result.source,
    textLength: result.html.length,
    evidence,
    evidenceWindows,
    firstFlightRows: lines.slice(25, 95),
    parsedFares,
  }, null, 2));

  if (!result.resultsFound) {
    process.exitCode = 1;
  }
}

void main();
