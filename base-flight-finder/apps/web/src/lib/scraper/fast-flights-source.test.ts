import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const originalEnv = {
  enabled: process.env.FAST_FLIGHTS_ENABLED,
  url: process.env.FAST_FLIGHTS_URL,
  timeout: process.env.FAST_FLIGHTS_TIMEOUT_MS,
};

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

describe('fast-flights-source', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    restoreEnv('FAST_FLIGHTS_ENABLED', originalEnv.enabled);
    restoreEnv('FAST_FLIGHTS_URL', originalEnv.url);
    restoreEnv('FAST_FLIGHTS_TIMEOUT_MS', originalEnv.timeout);
  });

  it('stays disabled until explicitly enabled', async () => {
    delete process.env.FAST_FLIGHTS_ENABLED;
    const { isFastFlightsEnabled } = await import('./fast-flights-source');

    expect(isFastFlightsEnabled()).toBe(false);
  });

  it('normalizes a round-trip request for the sidecar', async () => {
    process.env.FAST_FLIGHTS_ENABLED = 'true';
    process.env.FAST_FLIGHTS_URL = 'http://sidecar.test/';
    const flight = {
      travelDate: '2026-08-14', price: 435, currency: 'USD', airline: 'Example Air',
      bookingUrl: null, stops: 1, duration: '7h 10m', departureTime: '8:00 AM',
      arrivalTime: '3:10 PM', seatsLeft: null, flightNumber: null,
    };
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ flights: [flight] }) } as Response);
    const { fetchFastFlights } = await import('./fast-flights-source');

    await expect(fetchFastFlights({
      origin: 'ORF', destination: 'OAK', dateFrom: new Date('2026-08-14T00:00:00.000Z'),
      dateTo: new Date('2026-08-17T00:00:00.000Z'), tripType: 'round_trip', cabinClass: 'economy', currency: 'USD',
    })).resolves.toEqual([flight]);

    expect(mockFetch).toHaveBeenCalledWith('http://sidecar.test/search', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        origin: 'ORF', destination: 'OAK', outboundDate: '2026-08-14', returnDate: '2026-08-17',
        tripType: 'round_trip', cabin: 'economy', adults: 1, currency: 'USD',
      }),
    }));
  });

  it('throws on a sidecar failure so the scraper can use its fallback', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 503 } as Response);
    const { fetchFastFlights } = await import('./fast-flights-source');

    await expect(fetchFastFlights({
      origin: 'ORF', destination: 'OAK', dateFrom: new Date('2026-08-14T00:00:00.000Z'),
      dateTo: new Date('2026-08-14T00:00:00.000Z'), tripType: 'one_way',
    })).rejects.toThrow('HTTP 503');
  });
});
