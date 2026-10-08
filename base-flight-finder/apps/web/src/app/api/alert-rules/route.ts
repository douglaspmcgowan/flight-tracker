import { apiError, apiSuccess } from '@/lib/api-response';
import { isMultiUserEnabled } from '@/lib/multi-user';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user-auth';

async function currentOwner() {
  if (!(await isMultiUserEnabled())) return { userId: undefined, error: null };
  const user = await getCurrentUser();
  return user ? { userId: user.id, error: null } : { userId: undefined, error: 'Unauthorized' };
}

export async function GET() {
  const owner = await currentOwner();
  if (owner.error) return apiError(owner.error, 401);
  const rules = await prisma.alertRule.findMany({
    where: owner.userId ? { userId: owner.userId } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      query: { select: { id: true, origin: true, destination: true } },
      awardSearch: { select: { id: true, origin: true, destination: true } },
    },
  });
  return apiSuccess({ rules });
}

export async function POST(request: Request) {
  const owner = await currentOwner();
  if (owner.error) return apiError(owner.error, 401);
  const body = await request.json() as Record<string, unknown>;
  const type = body.type;
  const threshold = typeof body.threshold === 'number' && Number.isFinite(body.threshold) ? body.threshold : null;
  const program = typeof body.program === 'string' && body.program.trim() ? body.program.trim().toLowerCase() : null;
  const cabin = typeof body.cabin === 'string' && body.cabin.trim() ? body.cabin.trim() : null;

  if (type !== 'cash_price_below' && type !== 'award_seats_available') return apiError('Unsupported alert rule type', 400);
  if (threshold == null || threshold <= 0) return apiError('Provide a positive threshold', 400);

  if (type === 'cash_price_below') {
    const queryId = typeof body.queryId === 'string' ? body.queryId : '';
    if (!queryId) return apiError('Cash rules require a tracker', 400);
    const query = await prisma.query.findUnique({ where: { id: queryId }, select: { id: true, userId: true } });
    if (!query || (owner.userId && query.userId !== owner.userId)) return apiError('Tracker not found', 404);
    const rule = await prisma.alertRule.create({
      data: { type, queryId, threshold, ...(owner.userId ? { userId: owner.userId } : {}) },
    });
    return apiSuccess({ rule }, 201);
  }

  const awardSearchId = typeof body.awardSearchId === 'string' ? body.awardSearchId : '';
  if (!awardSearchId) return apiError('Award rules require an award search', 400);
  const awardSearch = await prisma.awardSearch.findUnique({ where: { id: awardSearchId }, select: { id: true, userId: true } });
  if (!awardSearch || (owner.userId && awardSearch.userId !== owner.userId)) return apiError('Award search not found', 404);
  const rule = await prisma.alertRule.create({
    data: { type, awardSearchId, threshold, program, cabin, ...(owner.userId ? { userId: owner.userId } : {}) },
  });
  return apiSuccess({ rule }, 201);
}
