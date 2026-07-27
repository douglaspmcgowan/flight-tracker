export const BAGGAGE_BENEFITS = [
  'none',
  'delta_platinum_amex',
  'delta_platinum_medallion',
] as const;

export type BaggageBenefit = (typeof BAGGAGE_BENEFITS)[number];

export interface BaggageSource {
  label: string;
  url: string;
  reviewedOn: string;
  assumption: string;
}

interface FeeSchedule {
  aliases: RegExp[];
  firstBag: number;
  secondBag: number;
  appliesTo?: (travelDate: string) => boolean;
  source: BaggageSource;
}

export interface TripCostSnapshot {
  id: string;
  airline: string;
  price: number;
  currency: string;
  status?: string;
  flightId?: string | null;
  flightNumber?: string | null;
  departureTime?: string | null;
  arrivalTime?: string | null;
  scrapedAt?: string;
}

export interface TripCostSettings {
  travelerCount: number;
  checkedBagCount: number;
  baggageBenefit: BaggageBenefit;
  tripType: string;
  travelDate: string;
  returnDate?: string;
}

export interface TripCostBreakdown {
  airfareTotal: number;
  baggageTotal: number | null;
  total: number | null;
  feeStatus: 'known' | 'unavailable';
  source: BaggageSource | null;
  reason: string | null;
  bagsByTraveler: number[];
}

const REVIEWED_ON = '2026-07-26';

const DOMESTIC_FEE_SCHEDULES: FeeSchedule[] = [
  {
    aliases: [/\bdelta\b/i],
    firstBag: 45,
    secondBag: 55,
    source: {
      label: 'Delta checked-baggage terms',
      url: 'https://www.delta.com/us/en/baggage/checked-baggage/first-checked-bag-free',
      reviewedOn: REVIEWED_ON,
      assumption: 'Domestic, Delta-operated economy itinerary; standard-size bags.',
    },
  },
  {
    aliases: [/\bsouthwest\b/i],
    firstBag: 45,
    secondBag: 55,
    source: {
      label: 'Southwest travel fees',
      url: 'https://www.southwest.com/html/customer-service/travel-fees.html',
      reviewedOn: REVIEWED_ON,
      assumption: 'Mainland Basic, Choice, or Choice Preferred fare; standard-size bags.',
    },
  },
  {
    aliases: [/\balaska\b/i],
    firstBag: 45,
    secondBag: 55,
    source: {
      label: 'Alaska Airlines bag-fee update',
      url: 'https://news.alaskaair.com/page/6/?_hsmi=12877383&edition=starter&gh_jid=648106&term=monthly',
      reviewedOn: REVIEWED_ON,
      assumption: 'Standard domestic economy allowance; standard-size bags.',
    },
  },
  {
    aliases: [/\bunited\b/i],
    firstBag: 50,
    secondBag: 60,
    source: {
      label: 'United current card benefit disclosure',
      url: 'https://cardmembers.united.com/Quest',
      reviewedOn: REVIEWED_ON,
      assumption: 'Uses the current maximum disclosed standard first- and second-bag values.',
    },
  },
  {
    aliases: [/\bjetblue\b/i],
    firstBag: 49,
    secondBag: 69,
    appliesTo: (travelDate) => /^2026-08-\d{2}$/.test(travelDate),
    source: {
      label: 'JetBlue optional fees',
      url: 'https://www.jetblue.com/legal/fees',
      reviewedOn: REVIEWED_ON,
      assumption: 'August 2026 peak pricing, paid within 24 hours; standard Blue-family fare.',
    },
  },
  {
    aliases: [/\bamerican\b/i],
    firstBag: 55,
    secondBag: 65,
    source: {
      label: 'American Airlines 2026 baggage update',
      url: 'https://news.aa.com/news/news-details/2026/American-Airlines-updates-bag-fees-and-Basic-Economy-fares-OPS-POL-04/default.aspx',
      reviewedOn: REVIEWED_ON,
      assumption: 'Domestic Basic Economy booked after May 18, 2026 and paid at the airport.',
    },
  },
];

function findSchedule(airline: string): FeeSchedule | null {
  return DOMESTIC_FEE_SCHEDULES.find((schedule) =>
    schedule.aliases.some((alias) => alias.test(airline))
  ) ?? null;
}

function distributeBags(travelerCount: number, checkedBagCount: number): number[] {
  const travelers = Math.max(1, Math.trunc(travelerCount));
  const bags = Math.max(0, Math.trunc(checkedBagCount));
  const distribution = Array.from({ length: travelers }, () => 0);
  for (let index = 0; index < bags; index += 1) {
    const travelerIndex = index % travelers;
    distribution[travelerIndex] = (distribution[travelerIndex] ?? 0) + 1;
  }
  return distribution;
}

function chargeForTraveler(
  bagCount: number,
  travelerIndex: number,
  schedule: FeeSchedule,
  benefit: BaggageBenefit,
  isDelta: boolean,
): number | null {
  const maximumCoveredBags =
    isDelta && benefit === 'delta_platinum_medallion' ? 3 : 2;
  if (bagCount > maximumCoveredBags) return null;

  let total = 0;
  for (let ordinal = 1; ordinal <= bagCount; ordinal += 1) {
    const deltaAmexFree =
      isDelta &&
      benefit === 'delta_platinum_amex' &&
      (ordinal === 1 || (travelerIndex === 0 && ordinal === 2));
    const deltaMedallionFree =
      isDelta &&
      benefit === 'delta_platinum_medallion' &&
      ordinal <= 3;

    if (deltaAmexFree || deltaMedallionFree) continue;
    total += ordinal === 1 ? schedule.firstBag : schedule.secondBag;
  }
  return total;
}

export function calculateTripCost(
  snapshot: TripCostSnapshot,
  settings: TripCostSettings,
): TripCostBreakdown {
  const travelerCount = Math.max(1, Math.trunc(settings.travelerCount));
  const bagsByTraveler = distributeBags(travelerCount, settings.checkedBagCount);
  const airfareTotal = snapshot.price * travelerCount;

  if (settings.checkedBagCount === 0) {
    return {
      airfareTotal,
      baggageTotal: 0,
      total: airfareTotal,
      feeStatus: 'known',
      source: null,
      reason: null,
      bagsByTraveler,
    };
  }

  const schedule = findSchedule(snapshot.airline);
  if (!schedule) {
    return {
      airfareTotal,
      baggageTotal: null,
      total: null,
      feeStatus: 'unavailable',
      source: null,
      reason: `No verified checked-bag schedule is available for ${snapshot.airline}.`,
      bagsByTraveler,
    };
  }

  const feeDates = settings.tripType === 'one_way'
    ? [settings.travelDate]
    : [settings.travelDate, settings.returnDate ?? settings.travelDate];
  const unsupportedDate = schedule.appliesTo
    ? feeDates.find((date) => !schedule.appliesTo!(date))
    : undefined;
  if (unsupportedDate) {
    return {
      airfareTotal,
      baggageTotal: null,
      total: null,
      feeStatus: 'unavailable',
      source: schedule.source,
      reason: `The verified ${schedule.source.label} assumption does not cover ${unsupportedDate}.`,
      bagsByTraveler,
    };
  }

  const isDelta = /\bdelta\b/i.test(snapshot.airline);
  const maximumCoveredBags =
    isDelta && settings.baggageBenefit === 'delta_platinum_medallion' ? 3 : 2;
  if (bagsByTraveler.some((count) => count > maximumCoveredBags)) {
    return {
      airfareTotal,
      baggageTotal: null,
      total: null,
      feeStatus: 'unavailable',
      source: schedule.source,
      reason: maximumCoveredBags === 3
        ? 'The verified Delta Medallion model currently covers up to three checked bags for each traveler; additional-bag fees need airline confirmation.'
        : 'The verified model currently covers the first and second checked bag for each traveler; third-bag fees need airline confirmation.',
      bagsByTraveler,
    };
  }

  const oneDirection = bagsByTraveler.reduce<number | null>((sum, bagCount, travelerIndex) => {
    if (sum === null) return null;
    const charge = chargeForTraveler(
      bagCount,
      travelerIndex,
      schedule,
      settings.baggageBenefit,
      isDelta,
    );
    return charge === null ? null : sum + charge;
  }, 0);

  if (oneDirection === null) {
    return {
      airfareTotal,
      baggageTotal: null,
      total: null,
      feeStatus: 'unavailable',
      source: schedule.source,
      reason: 'A checked-bag ordinal falls outside the verified fee schedule.',
      bagsByTraveler,
    };
  }

  const directions = settings.tripType === 'one_way' ? 1 : 2;
  const baggageTotal = oneDirection * directions;
  return {
    airfareTotal,
    baggageTotal,
    total: airfareTotal + baggageTotal,
    feeStatus: 'known',
    source: schedule.source,
    reason: null,
    bagsByTraveler,
  };
}

export function rankSnapshotsByTripCost<T extends TripCostSnapshot>(
  snapshots: T[],
  settings: TripCostSettings,
): Array<{ snapshot: T; breakdown: TripCostBreakdown }> {
  return snapshots
    .filter((snapshot) => snapshot.status !== 'sold_out')
    .map((snapshot) => ({
      snapshot,
      breakdown: calculateTripCost(snapshot, settings),
    }))
    .sort((a, b) => {
      if (a.breakdown.total === null && b.breakdown.total === null) {
        return a.snapshot.price - b.snapshot.price;
      }
      if (a.breakdown.total === null) return 1;
      if (b.breakdown.total === null) return -1;
      return a.breakdown.total - b.breakdown.total;
    });
}

export function latestSnapshotsByFlight<T extends TripCostSnapshot>(snapshots: T[]): T[] {
  const latest = new Map<string, T>();
  for (const snapshot of snapshots) {
    const hasFallbackIdentity =
      !!snapshot.flightNumber || !!snapshot.departureTime || !!snapshot.arrivalTime;
    const key = snapshot.flightId ??
      (hasFallbackIdentity
        ? [
            snapshot.airline,
            snapshot.flightNumber ?? '',
            snapshot.departureTime ?? '',
            snapshot.arrivalTime ?? '',
          ].join('|')
        : snapshot.id);
    const existing = latest.get(key);
    if (!existing || (snapshot.scrapedAt ?? '') > (existing.scrapedAt ?? '')) {
      latest.set(key, snapshot);
    }
  }
  return Array.from(latest.values());
}
