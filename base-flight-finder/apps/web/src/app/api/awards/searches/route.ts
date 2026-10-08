import { apiError, apiSuccess } from '@/lib/api-response';
import { isMultiUserEnabled } from '@/lib/multi-user';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user-auth';

function parseDateOnly(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

async function currentOwner() {
  if (!(await isMultiUserEnabled())) return { userId: undefined, error: null };
  const user = await getCurrentUser();
  return user ? { userId: user.id, error: null } : { userId: undefined, error: 'Unauthorized' };
}

export async function GET() {
  const owner = await currentOwner();
  if (owner.error) return apiError(owner.error, 401);

  const searches = await prisma.awardSearch.findMany({
    where: owner.userId ? { userId: owner.userId } : {},
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { snapshots: true, alertRules: true } } },
  });
  return apiSuccess({ searches });
}

export async function POST(request: Request) {
  const owner = await currentOwner();
  if (owner.error) return apiError(owner.error, 401);

  const body = await request.json() as Record<string, unknown>;
  const origin = typeof body.origin === 'string' ? body.origin.trim().toUpperCase() : '';
  const destination = typeof body.destination === 'string' ? body.destination.trim().toUpperCase() : '';
  const dateFrom = parseDateOnly(body.dateFrom);
  const dateTo = parseDateOnly(body.dateTo);
  const cabin = typeof body.cabin === 'string' ? body.cabin : 'economy';
  const programs = Array.isArray(body.programs)
    ? body.programs.filter((program): program is string => typeof program === 'string' && program.trim().length > 0).map((program) => program.trim().toLowerCase())
    : [];

  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination) || !dateFrom || !dateTo || dateTo < dateFrom) {
    return apiError('Provide two airport codes and a valid inclusive date range', 400);
  }
  if (!['economy', 'premium', 'premium_economy', 'business', 'first'].includes(cabin)) {
    return apiError('Unsupported cabin', 400);
  }

  const search = await prisma.awardSearch.create({
    data: { origin, destination, dateFrom, dateTo, cabin, programs, ...(owner.userId ? { userId: owner.userId } : {}) },
  });
  return apiSuccess({ search }, 201);
}
