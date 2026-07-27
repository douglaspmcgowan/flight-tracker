import { prisma } from '../src/lib/prisma';
import { runScrapeForQuery } from '../src/lib/scraper/run-scrape';

async function main() {
  const query = await prisma.query.create({
    data: {
      rawInput: 'ORF Norfolk to OAK Oakland 2026-08-14 to 2026-08-17 round trip',
      origin: 'ORF',
      originName: 'Norfolk International Airport',
      destination: 'OAK',
      destinationName: 'Metropolitan Oakland International Airport',
      dateFrom: new Date('2026-08-14T00:00:00.000Z'),
      dateTo: new Date('2026-08-17T00:00:00.000Z'),
      maxStops: 2,
      cabinClass: 'economy',
      tripType: 'round_trip',
      currency: 'USD',
      expiresAt: new Date('2026-08-18T00:00:00.000Z'),
      label: 'Norfolk to Oakland · Aug 14–17',
    },
  });

  const scrape = await runScrapeForQuery(query.id);
  const snapshots = await prisma.priceSnapshot.findMany({
    where: { queryId: query.id },
    select: { airline: true, price: true, stops: true },
    orderBy: { price: 'asc' },
  });

  console.log(JSON.stringify({
    queryId: query.id,
    scrapeStatus: scrape.status,
    snapshotsCount: snapshots.length,
    cheapest: snapshots[0] ?? null,
  }));
}

main()
  .finally(() => prisma.$disconnect());
