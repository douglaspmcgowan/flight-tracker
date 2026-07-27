import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockFindMany = vi.fn();
const mockCreate = vi.fn();
const mockMultiUser = vi.fn();
const mockCurrentUser = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    awardSearch: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));
vi.mock('@/lib/multi-user', () => ({ isMultiUserEnabled: () => mockMultiUser() }));
vi.mock('@/lib/user-auth', () => ({ getCurrentUser: () => mockCurrentUser() }));

const { GET, POST } = await import('./route');

function request(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/awards/searches', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
}

describe('/api/awards/searches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMultiUser.mockResolvedValue(false);
    mockCurrentUser.mockResolvedValue(null);
  });

  it('creates a saved award search with normalized route input', async () => {
    mockCreate.mockResolvedValue({ id: 'award-1', origin: 'ORF', destination: 'OAK', cabin: 'business', programs: ['aeroplan'] });

    const res = await POST(request({
      origin: 'orf', destination: 'oak', dateFrom: '2026-08-14', dateTo: '2026-08-17',
      cabin: 'business', programs: ['aeroplan'],
    }));

    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ origin: 'ORF', destination: 'OAK', cabin: 'business', programs: ['aeroplan'] }),
    }));
  });

  it('rejects malformed airport and date input', async () => {
    const res = await POST(request({ origin: 'Norfolk', destination: 'OAK', dateFrom: 'bad', dateTo: '2026-08-17' }));

    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('scopes listing to the signed-in user in multi-user mode', async () => {
    mockMultiUser.mockResolvedValue(true);
    mockCurrentUser.mockResolvedValue({ id: 'user-1' });
    mockFindMany.mockResolvedValue([]);

    const res = await GET();

    expect(res.status).toBe(200);
    expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'user-1' } }));
  });
});
