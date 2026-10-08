import { describe, expect, it } from 'vitest';
import { buildFlightId } from './flight-identity';

describe('buildFlightId', () => {
  it('uses a normalized flight number when available', () => {
    expect(buildFlightId({
      airline: 'Delta Air Lines',
      flightNumber: 'DL 345',
      departureTime: '10:25 AM',
      origin: 'ORF',
      destination: 'OAK',
      travelDate: '2026-08-14',
    })).toBe('DeltaAirLines-DL345-ORF-OAK-2026-08-14');
  });

  it('returns null when the provider supplied no stable identity fields', () => {
    expect(buildFlightId({
      airline: 'Delta Air Lines',
      origin: 'ORF',
      destination: 'OAK',
      travelDate: '2026-08-14',
    })).toBeNull();
  });
});
