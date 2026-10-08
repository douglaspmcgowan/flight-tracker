import { prisma } from '@/lib/prisma';
import { isAwardEnabled, searchAward } from './seats-aero-client';

export interface AwardSearchRunResult {
  awardSearchId: string;
  status: 'success' | 'disabled' | 'inactive';
  snapshotsCount: number;
}

function datesInclusive(from: Date, to: Date): string[] {
  const start = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()));
  const dates: string[] = [];
  for (const cursor = start; cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    dates.push(cursor.toISOString().slice(0, 10));
  }
  return dates;
}

function parseOptionalDate(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Pull one tracked award search and persist every returned availability row. */
export async function runAwardSearch(awardSearchId: string): Promise<AwardSearchRunResult> {
  if (!isAwardEnabled()) {
    return { awardSearchId, status: 'disabled', snapshotsCount: 0 };
  }

  const search = await prisma.awardSearch.findUnique({ where: { id: awardSearchId } });
  if (!search || !search.active) {
    return { awardSearchId, status: 'inactive', snapshotsCount: 0 };
  }

  const snapshots = [];
  for (const date of datesInclusive(search.dateFrom, search.dateTo)) {
    const results = await searchAward({
      origin: search.origin,
      destination: search.destination,
      date,
      cabin: search.cabin,
      programs: search.programs,
    });
    for (const result of results) {
      if (search.programs.length > 0 && !search.programs.includes(result.program)) continue;
      snapshots.push({
        awardSearchId: search.id,
        program: result.program,
        origin: result.origin,
        destination: result.destination,
        travelDate: new Date(`${result.date}T00:00:00.000Z`),
        cabin: result.cabin,
        seatsAvailable: result.seatsAvailable,
        mileageCost: result.mileageCost,
        taxesFees: result.taxesFees,
        lastSeen: parseOptionalDate(result.lastSeen),
        bookingProgram: result.bookingProgram,
      });
    }
  }

  if (snapshots.length > 0) {
    await prisma.awardSnapshot.createMany({ data: snapshots });
  }
  await prisma.awardSearch.update({ where: { id: search.id }, data: { lastCheckedAt: new Date() } });

  return { awardSearchId, status: 'success', snapshotsCount: snapshots.length };
}

/** Run every due active award search. Disabled providers remain a no-op. */
export async function runAwardSearchAll(): Promise<AwardSearchRunResult[]> {
  if (!isAwardEnabled()) return [];

  const config = await prisma.extractionConfig.findFirst({
    where: { id: 'singleton' },
    select: { scrapeInterval: true },
  });
  const searches = await prisma.awardSearch.findMany({
    where: { active: true },
    select: { id: true, lastCheckedAt: true, scrapeInterval: true },
  });
  const now = Date.now();
  const due = searches.filter((search) => {
    if (!search.lastCheckedAt) return true;
    const hoursSince = (now - search.lastCheckedAt.getTime()) / (60 * 60 * 1000);
    return hoursSince >= (search.scrapeInterval ?? config?.scrapeInterval ?? 3);
  });

  const results: AwardSearchRunResult[] = [];
  for (const search of due) results.push(await runAwardSearch(search.id));
  return results;
}
