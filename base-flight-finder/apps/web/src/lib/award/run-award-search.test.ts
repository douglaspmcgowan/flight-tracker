import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();
const mockCreateMany = vi.fn();
const mockFindMany = vi.fn();
const mockConfigFindFirst = vi.fn();
const mockIsAwardEnabled = vi.fn();
const mockSearchAward = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    awardSearch: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
    awardSnapshot: { createMany: (...args: unknown[]) => mockCreateMany(...args) },
    extractionConfig: { findFirst: (...args: unknown[]) => mockConfigFindFirst(...args) },
  },
}));

vi.mock('./seats-aero-client', () => ({
  isAwardEnabled: () => mockIsAwardEnabled(),
  searchAward: (...args: unknown[]) => mockSearchAward(...args),
}));

const { runAwardSearch, runAwardSearchAll } = await import('./run-award-search');

describe('runAwardSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate.mockResolvedValue({});
    mockCreateMany.mockResolvedValue({ count: 0 });
  });

  it('skips safely when the paid provider is disabled', async () => {
    mockIsAwardEnabled.mockReturnValue(false);

    await expect(runAwardSearch('award-1')).resolves.toEqual({
      awardSearchId: 'award-1', status: 'disabled', snapshotsCount: 0,
    });
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it('stores normalized snapshots for every date in the search range', async () => {
    mockIsAwardEnabled.mockReturnValue(true);
    mockFindUnique.mockResolvedValue({
      id: 'award-1', origin: 'ORF', destination: 'OAK',
      dateFrom: new Date('2026-08-14T00:00:00.000Z'),
      dateTo: new Date('2026-08-15T00:00:00.000Z'),
      cabin: 'business', programs: ['aeroplan'], active: true,
    });
    mockSearchAward.mockResolvedValue([{
      program: 'aeroplan', origin: 'ORF', destination: 'OAK', date: '2026-08-14', cabin: 'business',
      seatsAvailable: 2, mileageCost: 12000, taxesFees: '5.60', lastSeen: '2026-08-13T17:00:00.000Z', bookingProgram: 'aeroplan',
    }]);

    await expect(runAwardSearch('award-1')).resolves.toEqual({
      awardSearchId: 'award-1', status: 'success', snapshotsCount: 2,
    });
    expect(mockSearchAward).toHaveBeenCalledTimes(2);
    expect(mockSearchAward).toHaveBeenNthCalledWith(1, {
      origin: 'ORF', destination: 'OAK', date: '2026-08-14', cabin: 'business', programs: ['aeroplan'],
    });
    expect(mockCreateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.arrayContaining([expect.objectContaining({
        awardSearchId: 'award-1', program: 'aeroplan', travelDate: new Date('2026-08-14T00:00:00.000Z'),
        seatsAvailable: 2, mileageCost: 12000, bookingProgram: 'aeroplan',
      })]),
    }));
    expect(mockUpdate).toHaveBeenCalledWith({ where: { id: 'award-1' }, data: { lastCheckedAt: expect.any(Date) } });
  });

  it('only runs searches that are due for their configured interval', async () => {
    mockIsAwardEnabled.mockReturnValue(true);
    mockConfigFindFirst.mockResolvedValue({ scrapeInterval: 3 });
    mockFindMany.mockResolvedValue([
      { id: 'due', lastCheckedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), scrapeInterval: null },
      { id: 'fresh', lastCheckedAt: new Date(), scrapeInterval: null },
    ]);
    mockFindUnique.mockResolvedValue({
      id: 'due', origin: 'ORF', destination: 'OAK', dateFrom: new Date('2026-08-14T00:00:00.000Z'),
      dateTo: new Date('2026-08-14T00:00:00.000Z'), cabin: 'economy', programs: [], active: true,
    });
    mockSearchAward.mockResolvedValue([]);

    await expect(runAwardSearchAll()).resolves.toEqual([
      { awardSearchId: 'due', status: 'success', snapshotsCount: 0 },
    ]);
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'due' } });
  });
});
