import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const redisHolder = vi.hoisted(() => ({
  current: null as null | {
    incr: ReturnType<typeof vi.fn>;
    expire: ReturnType<typeof vi.fn>;
  },
}));

vi.mock('@/lib/redis', () => ({
  get redis() {
    return redisHolder.current;
  },
}));

async function freshClient() {
  vi.resetModules();
  return import('./seats-aero-client');
}

describe('seats-aero-client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    redisHolder.current = null;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.SEATS_AERO_API_KEY;
  });

  it('keeps award search disabled without a key', async () => {
    const { isAwardEnabled } = await freshClient();

    expect(isAwardEnabled()).toBe(false);
  });

  it('maps the documented cached-search shape and includes the required header', async () => {
    process.env.SEATS_AERO_API_KEY = 'fixture';
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'X-RateLimit-Remaining': '999' }),
      json: async () => ({
        data: [{
          Source: 'aeroplan',
          Route: { OriginAirport: 'ORF', DestinationAirport: 'OAK' },
          Date: '2026-08-14',
          JAvailable: true,
          JRemainingSeats: 2,
          JMileageCost: '12000',
          UpdatedAt: '2026-07-24T00:00:00Z',
        }],
      }),
    } as Response);
    const { searchAward } = await freshClient();

    await expect(searchAward({ origin: 'ORF', destination: 'OAK', date: '2026-08-14', cabin: 'business' })).resolves.toEqual([{
      program: 'aeroplan', origin: 'ORF', destination: 'OAK', date: '2026-08-14', cabin: 'business',
      seatsAvailable: 2, mileageCost: 12000, taxesFees: null, lastSeen: '2026-07-24T00:00:00Z', bookingProgram: 'aeroplan',
    }]);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/\/search\?.*cabins=business/), expect.objectContaining({
      headers: expect.objectContaining({ 'Partner-Authorization': 'fixture' }),
    }));
  });

  it('drops unavailable rows and treats a zero remaining-seat count as unknown', async () => {
    process.env.SEATS_AERO_API_KEY = 'fixture';
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      headers: new Headers(),
      json: async () => ({
        data: [
          { Source: 'american', Date: '2026-08-14', YAvailable: false, YMileageCost: '12500' },
          { Source: 'alaska', Date: '2026-08-14', YAvailable: true, YRemainingSeats: 0, YMileageCost: '20000' },
        ],
      }),
    } as Response);
    const { searchAward } = await freshClient();

    await expect(searchAward({
      origin: 'ORF',
      destination: 'OAK',
      date: '2026-08-14',
      cabin: 'economy',
      programs: ['alaska'],
    })).resolves.toEqual([expect.objectContaining({
      program: 'alaska',
      seatsAvailable: null,
      mileageCost: 20000,
    })]);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/sources=alaska/), expect.any(Object));
  });

  it('refuses the 1,001st request before it reaches the network', async () => {
    process.env.SEATS_AERO_API_KEY = 'fixture';
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue({ ok: true, headers: new Headers(), json: async () => ({ data: [] }) } as Response);
    const { searchAward, awardCallsRemaining } = await freshClient();
    const request = { origin: 'ORF', destination: 'OAK', date: '2026-08-14' };

    for (let i = 0; i < 1000; i += 1) await searchAward(request);

    expect(awardCallsRemaining()).toBe(0);
    await expect(searchAward(request)).rejects.toThrow('daily call cap reached');
    expect(mockFetch).toHaveBeenCalledTimes(1000);
  });

  it('uses the shared Redis counter to enforce the daily cap across workers', async () => {
    process.env.SEATS_AERO_API_KEY = 'fixture';
    redisHolder.current = {
      incr: vi.fn().mockResolvedValue(1001),
      expire: vi.fn(),
    };
    const { searchAward } = await freshClient();

    await expect(searchAward({
      origin: 'ORF',
      destination: 'OAK',
      date: '2026-08-14',
    })).rejects.toThrow('daily call cap reached');
    expect(fetch).not.toHaveBeenCalled();
  });
});
