import { describe, expect, it } from 'vitest';
import {
  centsPerPoint,
  formatDateOnly,
  freshnessLabel,
  parseProgramList,
  rankSnapshots,
  taxesAsNumber,
  type AwardSnapshotView,
} from './award-view-model';

function snapshot(overrides: Partial<AwardSnapshotView>): AwardSnapshotView {
  return {
    id: 'row',
    program: 'aeroplan',
    origin: 'ORF',
    destination: 'OAK',
    travelDate: '2026-08-14T00:00:00.000Z',
    cabin: 'business',
    seatsAvailable: 1,
    mileageCost: 55_000,
    taxesFees: '$74.00',
    lastSeen: '2026-07-25T08:00:00.000Z',
    bookingProgram: 'aeroplan',
    scrapedAt: '2026-07-25T08:00:00.000Z',
    ...overrides,
  };
}

describe('award view model', () => {
  it('calculates cents per point after subtracting award taxes', () => {
    expect(centsPerPoint({ cashPrice: 435, mileageCost: 20_000, taxesFees: '$35.00' })).toBe(2);
  });

  it('omits cents per point when the required evidence is missing', () => {
    expect(centsPerPoint({ cashPrice: null, mileageCost: 20_000, taxesFees: '$35.00' })).toBeNull();
    expect(centsPerPoint({ cashPrice: 435, mileageCost: null, taxesFees: '$35.00' })).toBeNull();
  });

  it('normalizes tax strings and program filters', () => {
    expect(taxesAsNumber('USD 74.20')).toBe(74.2);
    expect(taxesAsNumber(null)).toBe(0);
    expect(parseProgramList('Aeroplan, United, aeroplan')).toEqual(['aeroplan', 'united']);
  });

  it('ranks complete, lower-mileage availability first', () => {
    const rows = [
      snapshot({ id: 'unknown', mileageCost: null, seatsAvailable: 4 }),
      snapshot({ id: 'no-seats', mileageCost: 15_000, seatsAvailable: 0 }),
      snapshot({ id: 'best-complete-row', mileageCost: 20_000, taxesFees: '$35', seatsAvailable: 2 }),
      snapshot({ id: 'higher', mileageCost: 55_000, seatsAvailable: 2 }),
    ];

    expect(rankSnapshots(rows).map((row) => row.id)).toEqual([
      'best-complete-row',
      'higher',
      'no-seats',
      'unknown',
    ]);
  });

  it('labels fresh and stale observations against a supplied clock', () => {
    expect(freshnessLabel('2026-07-25T08:00:00Z', new Date('2026-07-25T10:00:00Z'))).toEqual({
      label: 'Observed 2h ago',
      stale: false,
    });
    expect(freshnessLabel('2026-07-23T08:00:00Z', new Date('2026-07-25T10:00:00Z'))).toEqual({
      label: 'Observed 2d ago',
      stale: true,
    });
  });

  it('formats date-only values in UTC', () => {
    expect(formatDateOnly('2026-08-14T00:00:00.000Z')).toBe('Aug 14, 2026');
  });
});
