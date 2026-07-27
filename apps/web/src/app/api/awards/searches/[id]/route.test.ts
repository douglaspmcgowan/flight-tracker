import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFindUnique = vi.fn();
const mockFindCash = vi.fn();
const mockMultiUser = vi.fn();
const mockCurrentUser = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    awardSearch: { findUnique: (...args: unknown[]) => mockFindUnique(...args) },
    priceSnapshot: { findFirst: (...args: unknown[]) => mockFindCash(...args) },
  },
}));
vi.mock('@/lib/multi-user', () => ({ isMultiUserEnabled: () => mockMultiUser() }));
vi.mock('@/lib/user-auth', () => ({ getCurrentUser: () => mockCurrentUser() }));

const { GET } = await import('./route');

describe('/api/awards/searches/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMultiUser.mockResolvedValue(false);
    mockFindCash.mockResolvedValue(null);
  });

  it('returns snapshots in chronological order for charting', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'award-1', userId: null, alertRules: [],
      snapshots: [{ id: 'new', scrapedAt: new Date('2026-08-02') }, { id: 'old', scrapedAt: new Date('2026-08-01') }],
    });

    const res = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'award-1' }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.search.snapshots.map((snapshot: { id: string }) => snapshot.id)).toEqual(['old', 'new']);
  });

  it('requires the owner when multi-user mode is enabled', async () => {
    mockMultiUser.mockResolvedValue(true);
    mockCurrentUser.mockResolvedValue({ id: 'other-user', isAdmin: false });
    mockFindUnique.mockResolvedValue({ id: 'award-1', userId: 'owner', alertRules: [], snapshots: [] });

    const res = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'award-1' }) });

    expect(res.status).toBe(401);
  });

  it('returns the best stored cash observation for the same route and overlapping dates', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'award-1',
      userId: 'owner',
      origin: 'ORF',
      destination: 'OAK',
      dateFrom: new Date('2026-08-14T00:00:00.000Z'),
      dateTo: new Date('2026-08-17T00:00:00.000Z'),
      alertRules: [],
      snapshots: [],
    });
    mockFindCash.mockResolvedValue({
      queryId: 'cash-1',
      price: 435,
      currency: 'USD',
      airline: 'Southwest',
      travelDate: new Date('2026-08-14T00:00:00.000Z'),
      scrapedAt: new Date('2026-07-24T00:00:00.000Z'),
    });

    const res = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'award-1' }) });

    expect(res.status).toBe(200);
    expect(mockFindCash).toHaveBeenCalledWith({
      where: {
        status: 'available',
        query: {
          origin: 'ORF',
          destination: 'OAK',
          dateFrom: { lte: new Date('2026-08-17T00:00:00.000Z') },
          dateTo: { gte: new Date('2026-08-14T00:00:00.000Z') },
          userId: 'owner',
        },
      },
      orderBy: { price: 'asc' },
      select: {
        queryId: true,
        price: true,
        currency: true,
        airline: true,
        travelDate: true,
        scrapedAt: true,
      },
    });
    expect((await res.json()).data.cashComparison).toEqual({
      queryId: 'cash-1',
      price: 435,
      currency: 'USD',
      airline: 'Southwest',
      travelDate: '2026-08-14T00:00:00.000Z',
      scrapedAt: '2026-07-24T00:00:00.000Z',
    });
  });
});
