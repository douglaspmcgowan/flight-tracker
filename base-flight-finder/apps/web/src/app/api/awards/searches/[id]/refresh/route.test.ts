import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFindUnique = vi.fn();
const mockRunAwardSearch = vi.fn();
const mockMultiUser = vi.fn();
const mockCurrentUser = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: { awardSearch: { findUnique: (...args: unknown[]) => mockFindUnique(...args) } },
}));
vi.mock('@/lib/award/run-award-search', () => ({ runAwardSearch: (...args: unknown[]) => mockRunAwardSearch(...args) }));
vi.mock('@/lib/multi-user', () => ({ isMultiUserEnabled: () => mockMultiUser() }));
vi.mock('@/lib/user-auth', () => ({ getCurrentUser: () => mockCurrentUser() }));

const { POST } = await import('./route');

describe('/api/awards/searches/[id]/refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMultiUser.mockResolvedValue(false);
    mockFindUnique.mockResolvedValue({ id: 'award-1', userId: null });
  });

  it('reports a clear dependency status when the award provider is unavailable', async () => {
    mockRunAwardSearch.mockResolvedValue({ status: 'disabled', snapshots: 0 });

    const res = await POST(new Request('http://localhost'), { params: Promise.resolve({ id: 'award-1' }) });

    expect(res.status).toBe(424);
  });

  it('returns a completed refresh result', async () => {
    mockRunAwardSearch.mockResolvedValue({ status: 'completed', snapshots: 2 });

    const res = await POST(new Request('http://localhost'), { params: Promise.resolve({ id: 'award-1' }) });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(expect.objectContaining({ data: { result: { status: 'completed', snapshots: 2 } } }));
  });
});
