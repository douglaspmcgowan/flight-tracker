import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockFindMany = vi.fn();
const mockCreate = vi.fn();
const mockQuery = vi.fn();
const mockAwardSearch = vi.fn();
const mockMulti = vi.fn();
const mockUser = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    alertRule: { findMany: (...args: unknown[]) => mockFindMany(...args), create: (...args: unknown[]) => mockCreate(...args) },
    query: { findUnique: (...args: unknown[]) => mockQuery(...args) },
    awardSearch: { findUnique: (...args: unknown[]) => mockAwardSearch(...args) },
  },
}));
vi.mock('@/lib/multi-user', () => ({ isMultiUserEnabled: () => mockMulti() }));
vi.mock('@/lib/user-auth', () => ({ getCurrentUser: () => mockUser() }));

const { POST } = await import('./route');

function request(body: unknown) {
  return new NextRequest('http://localhost/api/alert-rules', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
}

describe('/api/alert-rules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMulti.mockResolvedValue(false);
    mockUser.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: 'rule-1' });
  });

  it('creates a cash threshold rule for an existing cash tracker', async () => {
    mockQuery.mockResolvedValue({ id: 'cash-1', userId: null });

    const res = await POST(request({ type: 'cash_price_below', queryId: 'cash-1', threshold: 400 }));

    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ type: 'cash_price_below', queryId: 'cash-1', threshold: 400 }),
    }));
  });

  it('creates an award availability rule with a minimum seat count', async () => {
    mockAwardSearch.mockResolvedValue({ id: 'award-1', userId: null });

    const res = await POST(request({ type: 'award_seats_available', awardSearchId: 'award-1', threshold: 2, program: 'aeroplan', cabin: 'business' }));

    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ type: 'award_seats_available', awardSearchId: 'award-1', threshold: 2, program: 'aeroplan', cabin: 'business' }),
    }));
  });

  it('rejects a rule with no target tracker', async () => {
    const res = await POST(request({ type: 'cash_price_below', threshold: 400 }));

    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
