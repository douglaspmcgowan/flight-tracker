import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFindRules = vi.fn();
const mockConfig = vi.fn();
const mockCashSnapshot = vi.fn();
const mockAwardSnapshot = vi.fn();
const mockRuleUpdate = vi.fn();
const mockDispatch = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    alertRule: {
      findMany: (...args: unknown[]) => mockFindRules(...args),
      update: (...args: unknown[]) => mockRuleUpdate(...args),
    },
    extractionConfig: { findFirst: (...args: unknown[]) => mockConfig(...args) },
    priceSnapshot: { findFirst: (...args: unknown[]) => mockCashSnapshot(...args) },
    awardSnapshot: { findFirst: (...args: unknown[]) => mockAwardSnapshot(...args) },
  },
}));

vi.mock('./notify', () => ({
  dispatchNotifications: (...args: unknown[]) => mockDispatch(...args),
}));

const { notifyAlertRules } = await import('./rules');

describe('notifyAlertRules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig.mockResolvedValue({ publicBaseUrl: 'https://tracker.example' });
    mockDispatch.mockResolvedValue([{ ok: true }]);
    mockRuleUpdate.mockResolvedValue({});
  });

  it('sends an award availability alert and records its condition key', async () => {
    mockFindRules.mockResolvedValue([{
      id: 'award-rule', type: 'award_seats_available', threshold: 2, program: 'aeroplan', cabin: 'business',
      lastNotifiedAt: null, lastConditionKey: null, userId: null,
      query: null,
      awardSearch: { id: 'award-search', origin: 'ORF', destination: 'OAK', userId: null },
    }]);
    mockAwardSnapshot.mockResolvedValue({
      id: 'award-snapshot', program: 'aeroplan', cabin: 'business', travelDate: new Date('2026-08-14T00:00:00.000Z'),
      seatsAvailable: 2, mileageCost: 12000, taxesFees: '5.60', bookingProgram: 'aeroplan',
    });

    await expect(notifyAlertRules()).resolves.toEqual({ evaluated: 1, sent: 1 });
    expect(mockDispatch).toHaveBeenCalledWith(null, expect.objectContaining({
      title: expect.stringContaining('Award seats'),
      url: 'https://tracker.example/awards?search=award-search',
    }));
    expect(mockRuleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'award-rule' },
      data: expect.objectContaining({ lastConditionKey: 'award:aeroplan:2026-08-14:business:2' }),
    }));
  });

  it('does not repeat a matching condition inside the dedupe window', async () => {
    mockFindRules.mockResolvedValue([{
      id: 'award-rule', type: 'award_seats_available', threshold: 1, program: 'aeroplan', cabin: 'business',
      lastNotifiedAt: new Date(), lastConditionKey: 'award:aeroplan:2026-08-14:business:2', userId: null,
      query: null,
      awardSearch: { id: 'award-search', origin: 'ORF', destination: 'OAK', userId: null },
    }]);
    mockAwardSnapshot.mockResolvedValue({
      id: 'award-snapshot', program: 'aeroplan', cabin: 'business', travelDate: new Date('2026-08-14T00:00:00.000Z'),
      seatsAvailable: 2, mileageCost: 12000, taxesFees: '5.60', bookingProgram: 'aeroplan',
    });

    await expect(notifyAlertRules()).resolves.toEqual({ evaluated: 1, sent: 0 });
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('sends a cash threshold alert when the latest fare is at or below its rule', async () => {
    mockFindRules.mockResolvedValue([{
      id: 'cash-rule', type: 'cash_price_below', threshold: 450, program: null, cabin: null,
      lastNotifiedAt: null, lastConditionKey: null, userId: null,
      query: { id: 'cash-query', origin: 'ORF', destination: 'OAK', currency: 'USD', userId: null },
      awardSearch: null,
    }]);
    mockCashSnapshot.mockResolvedValue({
      id: 'cash-snapshot', price: 435, currency: 'USD', airline: 'Southwest',
      travelDate: new Date('2026-08-14T00:00:00.000Z'), bookingUrl: null,
    });

    await expect(notifyAlertRules()).resolves.toEqual({ evaluated: 1, sent: 1 });
    expect(mockDispatch).toHaveBeenCalledWith(null, expect.objectContaining({ title: expect.stringContaining('Cash fare') }));
  });
});
