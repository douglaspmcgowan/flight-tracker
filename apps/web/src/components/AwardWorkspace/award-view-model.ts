export type AwardMode = 'simple' | 'analyst';

export interface AwardSearchSummary {
  id: string;
  origin: string;
  destination: string;
  dateFrom: string;
  dateTo: string;
  cabin: string;
  programs: string[];
  active: boolean;
  lastCheckedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    snapshots: number;
    alertRules: number;
  };
}

export interface AwardSnapshotView {
  id: string;
  program: string;
  origin: string;
  destination: string;
  travelDate: string;
  cabin: string;
  seatsAvailable: number | null;
  mileageCost: number | null;
  taxesFees: string | null;
  lastSeen: string | null;
  bookingProgram: string | null;
  scrapedAt: string;
}

export interface AwardAlertRuleView {
  id: string;
  threshold: number | null;
  program: string | null;
  cabin: string | null;
  enabled: boolean;
}

export interface CashComparison {
  queryId: string;
  price: number;
  currency: string;
  airline: string;
  travelDate: string;
  scrapedAt: string;
}

export interface AwardSearchDetail extends Omit<AwardSearchSummary, '_count'> {
  snapshots: AwardSnapshotView[];
  alertRules: AwardAlertRuleView[];
}

export function taxesAsNumber(value: string | null): number {
  if (!value) return 0;
  const normalized = value.replace(/[^0-9.,-]/g, '').replace(/,/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function centsPerPoint(input: {
  cashPrice: number | null;
  mileageCost: number | null;
  taxesFees: string | null;
}): number | null {
  if (input.cashPrice == null || input.mileageCost == null || input.mileageCost <= 0) return null;
  const netCashValue = input.cashPrice - taxesAsNumber(input.taxesFees);
  if (netCashValue <= 0) return null;
  return Math.round((netCashValue / input.mileageCost) * 10_000) / 100;
}

function rankGroup(snapshot: AwardSnapshotView): number {
  if ((snapshot.seatsAvailable ?? 0) <= 0) return 2;
  if (snapshot.mileageCost == null) return 3;
  return 0;
}

export function rankSnapshots(rows: AwardSnapshotView[]): AwardSnapshotView[] {
  return [...rows].sort((left, right) => {
    const groupDifference = rankGroup(left) - rankGroup(right);
    if (groupDifference !== 0) return groupDifference;

    const milesDifference = (left.mileageCost ?? Number.POSITIVE_INFINITY)
      - (right.mileageCost ?? Number.POSITIVE_INFINITY);
    if (milesDifference !== 0) return milesDifference;

    const taxesDifference = taxesAsNumber(left.taxesFees) - taxesAsNumber(right.taxesFees);
    if (taxesDifference !== 0) return taxesDifference;

    const seatsDifference = (right.seatsAvailable ?? 0) - (left.seatsAvailable ?? 0);
    if (seatsDifference !== 0) return seatsDifference;

    return Date.parse(right.lastSeen ?? right.scrapedAt) - Date.parse(left.lastSeen ?? left.scrapedAt);
  });
}

export function freshnessLabel(
  value: string | null,
  now = new Date(),
): { label: string; stale: boolean } {
  if (!value) return { label: 'Observation time unavailable', stale: true };
  const observedAt = new Date(value);
  if (Number.isNaN(observedAt.getTime())) return { label: 'Observation time unavailable', stale: true };

  const hours = Math.max(0, Math.floor((now.getTime() - observedAt.getTime()) / 3_600_000));
  if (hours < 1) return { label: 'Observed just now', stale: false };
  if (hours < 24) return { label: `Observed ${hours}h ago`, stale: false };

  const days = Math.floor(hours / 24);
  return { label: `Observed ${days}d ago`, stale: true };
}

export function formatDateOnly(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function parseProgramList(value: string): string[] {
  return [...new Set(
    value
      .split(',')
      .map((program) => program.trim().toLowerCase())
      .filter(Boolean),
  )];
}
