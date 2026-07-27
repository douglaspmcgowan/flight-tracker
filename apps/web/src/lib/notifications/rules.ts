import { formatCurrency } from '@/lib/currency';
import { prisma } from '@/lib/prisma';
import { dispatchNotifications } from './notify';
import { resolveBaseUrl } from './run';

const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;

function withinDedupeWindow(lastNotifiedAt: Date | null, lastConditionKey: string | null, conditionKey: string): boolean {
  return !!lastNotifiedAt && lastConditionKey === conditionKey && Date.now() - lastNotifiedAt.getTime() < DEDUPE_WINDOW_MS;
}

function awardMessage(params: {
  origin: string;
  destination: string;
  searchId: string;
  program: string;
  cabin: string;
  travelDate: Date;
  seats: number;
  mileageCost: number | null;
  baseUrl: string | null;
}) {
  const date = params.travelDate.toISOString().slice(0, 10);
  const cost = params.mileageCost == null ? '' : ` for ${params.mileageCost.toLocaleString()} miles`;
  return {
    title: `Award seats: ${params.origin} to ${params.destination}`,
    body: `${params.seats} ${params.cabin} seat${params.seats === 1 ? '' : 's'} on ${params.program}${cost}. Travel date ${date}. Confirm availability with the airline before transferring points.`,
    url: params.baseUrl
      ? `${params.baseUrl}/awards?search=${encodeURIComponent(params.searchId)}`
      : '',
    data: { type: 'award_seats_available', searchId: params.searchId, date, program: params.program, cabin: params.cabin, seats: params.seats },
  };
}

function cashMessage(params: {
  origin: string;
  destination: string;
  queryId: string;
  price: number;
  currency: string | null;
  airline: string;
  travelDate: Date;
  baseUrl: string | null;
}) {
  const date = params.travelDate.toISOString().slice(0, 10);
  const price = formatCurrency(params.price, params.currency);
  return {
    title: `Cash fare: ${params.origin} to ${params.destination} ${price}`,
    body: `${params.airline} is available for ${price}. Travel date ${date}.`,
    url: params.baseUrl ? `${params.baseUrl}/q/${params.queryId}` : '',
    data: { type: 'cash_price_below', queryId: params.queryId, date, price: params.price, currency: params.currency, airline: params.airline },
  };
}

/** Evaluate threshold and availability rules after a scrape cycle. */
export async function notifyAlertRules(): Promise<{ evaluated: number; sent: number }> {
  const [config, rules] = await Promise.all([
    prisma.extractionConfig.findFirst({ where: { id: 'singleton' }, select: { publicBaseUrl: true } }),
    prisma.alertRule.findMany({
      where: { enabled: true },
      include: {
        query: { select: { id: true, origin: true, destination: true, currency: true, userId: true } },
        awardSearch: { select: { id: true, origin: true, destination: true, userId: true } },
      },
    }),
  ]);
  const baseUrl = resolveBaseUrl(config?.publicBaseUrl);
  let sent = 0;

  for (const rule of rules) {
    if (rule.type === 'cash_price_below' && rule.query && rule.threshold != null) {
      const snapshot = await prisma.priceSnapshot.findFirst({
        where: { queryId: rule.query.id, status: 'available', price: { lte: rule.threshold } },
        orderBy: { scrapedAt: 'desc' },
        select: { id: true, price: true, currency: true, airline: true, travelDate: true },
      });
      if (!snapshot) continue;
      const conditionKey = `cash:${snapshot.price}:${snapshot.currency}:${snapshot.travelDate.toISOString().slice(0, 10)}`;
      if (withinDedupeWindow(rule.lastNotifiedAt, rule.lastConditionKey, conditionKey)) continue;
      const outcomes = await dispatchNotifications(rule.userId ?? rule.query.userId, cashMessage({
        origin: rule.query.origin, destination: rule.query.destination, queryId: rule.query.id,
        price: snapshot.price, currency: snapshot.currency, airline: snapshot.airline,
        travelDate: snapshot.travelDate, baseUrl,
      }));
      if (outcomes.some((outcome) => outcome.ok)) {
        await prisma.alertRule.update({ where: { id: rule.id }, data: { lastNotifiedAt: new Date(), lastConditionKey: conditionKey } });
        sent += 1;
      }
      continue;
    }

    if (rule.type === 'award_seats_available' && rule.awardSearch) {
      const minSeats = Math.max(1, Math.ceil(rule.threshold ?? 1));
      const snapshot = await prisma.awardSnapshot.findFirst({
        where: {
          awardSearchId: rule.awardSearch.id,
          seatsAvailable: { gte: minSeats },
          ...(rule.program ? { program: rule.program } : {}),
          ...(rule.cabin ? { cabin: rule.cabin } : {}),
        },
        orderBy: { scrapedAt: 'desc' },
        select: { id: true, program: true, cabin: true, travelDate: true, seatsAvailable: true, mileageCost: true },
      });
      if (!snapshot || snapshot.seatsAvailable == null) continue;
      const conditionKey = `award:${snapshot.program}:${snapshot.travelDate.toISOString().slice(0, 10)}:${snapshot.cabin}:${snapshot.seatsAvailable}`;
      if (withinDedupeWindow(rule.lastNotifiedAt, rule.lastConditionKey, conditionKey)) continue;
      const outcomes = await dispatchNotifications(rule.userId ?? rule.awardSearch.userId, awardMessage({
        origin: rule.awardSearch.origin, destination: rule.awardSearch.destination, searchId: rule.awardSearch.id,
        program: snapshot.program, cabin: snapshot.cabin, travelDate: snapshot.travelDate,
        seats: snapshot.seatsAvailable, mileageCost: snapshot.mileageCost, baseUrl,
      }));
      if (outcomes.some((outcome) => outcome.ok)) {
        await prisma.alertRule.update({ where: { id: rule.id }, data: { lastNotifiedAt: new Date(), lastConditionKey: conditionKey } });
        sent += 1;
      }
    }
  }

  return { evaluated: rules.length, sent };
}
