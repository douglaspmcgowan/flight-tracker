import { apiError, apiSuccess } from '@/lib/api-response';
import { isMultiUserEnabled } from '@/lib/multi-user';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user-auth';

async function canRead(search: { userId: string | null }): Promise<boolean> {
  if (!(await isMultiUserEnabled())) return true;
  const user = await getCurrentUser();
  return !!user && (user.isAdmin || user.id === search.userId);
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const search = await prisma.awardSearch.findUnique({
    where: { id },
    include: {
      snapshots: { orderBy: { scrapedAt: 'desc' }, take: 500 },
      alertRules: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!search) return apiError('Award search not found', 404);
  if (!(await canRead(search))) return apiError('Unauthorized', 401);

  const cashComparison = await prisma.priceSnapshot.findFirst({
    where: {
      status: 'available',
      query: {
        origin: search.origin,
        destination: search.destination,
        dateFrom: { lte: search.dateTo },
        dateTo: { gte: search.dateFrom },
        ...(search.userId ? { userId: search.userId } : {}),
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

  return apiSuccess({
    search: { ...search, snapshots: search.snapshots.reverse() },
    cashComparison,
  });
}
