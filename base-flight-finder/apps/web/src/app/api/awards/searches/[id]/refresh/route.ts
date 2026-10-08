import { apiError, apiSuccess } from '@/lib/api-response';
import { runAwardSearch } from '@/lib/award/run-award-search';
import { isMultiUserEnabled } from '@/lib/multi-user';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user-auth';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const search = await prisma.awardSearch.findUnique({ where: { id }, select: { id: true, userId: true } });
  if (!search) return apiError('Award search not found', 404);

  if (await isMultiUserEnabled()) {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && user.id !== search.userId)) return apiError('Unauthorized', 401);
  }

  const result = await runAwardSearch(id);
  if (result.status === 'disabled') return apiError('Award provider is disabled. Set SEATS_AERO_API_KEY to refresh this search.', 424);
  return apiSuccess({ result });
}
