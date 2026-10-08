import { describe, expect, it } from 'vitest';
import { parseGoogleFlightsText } from './google-flights-text';

const visibleText = `Top departing flights
12:50 PM
–
7:20 PM
Southwest
9 hr 30 min
ORF–OAK
1 stop
2 hr 50 min DEN
292 kg CO2e
-18% emissions
1
0
$459
round trip
8:00 AM
–
2:15 PM
Southwest
9 hr 15 min
ORF–OAK
2 stops
MDW, LAS
366 kg CO2e
Avg emissions
1
0
$464
round trip
Price insights
Prices may rise by at least $70`;

const noFilters = {
  maxPrice: null,
  maxStops: null,
  maxDurationHours: null,
  preferredAirlines: [],
  timePreference: 'any',
  cabinClass: 'economy',
};

describe('parseGoogleFlightsText', () => {
  it('parses visible Google Flights rows without an LLM', () => {
    expect(parseGoogleFlightsText(
      visibleText,
      {
        origin: 'ORF',
        destination: 'OAK',
        dateFrom: new Date('2026-08-14T12:00:00Z'),
        dateTo: new Date('2026-08-17T12:00:00Z'),
        currency: 'USD',
      },
      noFilters,
      'https://google.example/flights',
    )).toEqual([
      expect.objectContaining({
        travelDate: '2026-08-14',
        price: 459,
        currency: 'USD',
        airline: 'Southwest',
        stops: 1,
        duration: '9 hr 30 min',
        departureTime: '12:50 PM',
        arrivalTime: '7:20 PM',
      }),
      expect.objectContaining({
        price: 464,
        airline: 'Southwest',
        stops: 2,
      }),
    ]);
  });

  it('applies deterministic stop, price, duration, airline, and time filters', () => {
    const parsed = parseGoogleFlightsText(
      visibleText,
      {
        origin: 'ORF',
        destination: 'OAK',
        dateFrom: new Date('2026-08-14T12:00:00Z'),
        dateTo: new Date('2026-08-17T12:00:00Z'),
        currency: 'USD',
      },
      {
        ...noFilters,
        maxPrice: 460,
        maxStops: 1,
        maxDurationHours: 10,
        preferredAirlines: ['Southwest'],
        timePreference: 'afternoon',
      },
      'https://google.example/flights',
    );

    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.price).toBe(459);
  });

  it('ignores unrelated price-insight amounts', () => {
    expect(parseGoogleFlightsText(
      'Price insights\nPrices may rise by at least $70',
      {
        origin: 'ORF',
        destination: 'OAK',
        dateFrom: new Date('2026-08-14T12:00:00Z'),
        dateTo: new Date('2026-08-17T12:00:00Z'),
      },
      noFilters,
      'https://google.example/flights',
    )).toEqual([]);
  });
});
