import { describe, expect, it } from 'vitest';
import {
  calculateTripCost,
  latestSnapshotsByFlight,
  rankSnapshotsByTripCost,
  type TripCostSnapshot,
} from './baggage-cost';

const delta: TripCostSnapshot = {
  id: 'dl-1',
  airline: 'Delta Air Lines',
  price: 459,
  currency: 'USD',
  status: 'available',
};

describe('calculateTripCost', () => {
  it('calculates the exact two-traveler Delta Platinum AmEx scenario', () => {
    const result = calculateTripCost(delta, {
      travelerCount: 2,
      checkedBagCount: 4,
      baggageBenefit: 'delta_platinum_amex',
      tripType: 'round_trip',
      travelDate: '2026-08-14',
    });

    expect(result).toMatchObject({
      airfareTotal: 918,
      baggageTotal: 110,
      total: 1028,
      feeStatus: 'known',
    });
  });

  it('makes all four bags free with the Delta Platinum Medallion preset', () => {
    const result = calculateTripCost(delta, {
      travelerCount: 2,
      checkedBagCount: 4,
      baggageBenefit: 'delta_platinum_medallion',
      tripType: 'round_trip',
      travelDate: '2026-08-14',
    });

    expect(result.baggageTotal).toBe(0);
    expect(result.total).toBe(918);
  });

  it('covers three bags per traveler with the Delta Platinum Medallion preset', () => {
    const result = calculateTripCost(delta, {
      travelerCount: 2,
      checkedBagCount: 6,
      baggageBenefit: 'delta_platinum_medallion',
      tripType: 'round_trip',
      travelDate: '2026-08-14',
    });

    expect(result.feeStatus).toBe('known');
    expect(result.baggageTotal).toBe(0);
    expect(result.total).toBe(918);
  });

  it('uses peak August JetBlue fees in both directions', () => {
    const result = calculateTripCost(
      { ...delta, id: 'b6-1', airline: 'JetBlue', price: 400 },
      {
        travelerCount: 2,
        checkedBagCount: 4,
        baggageBenefit: 'none',
        tripType: 'round_trip',
        travelDate: '2026-08-14',
      },
    );

    expect(result.baggageTotal).toBe((49 + 69) * 2 * 2);
    expect(result.total).toBe(1272);
    expect(result.source?.label).toContain('JetBlue');
  });

  it('does not apply the verified August JetBlue schedule to another month', () => {
    const result = calculateTripCost(
      { ...delta, id: 'b6-2', airline: 'JetBlue', price: 400 },
      {
        travelerCount: 2,
        checkedBagCount: 4,
        baggageBenefit: 'none',
        tripType: 'round_trip',
        travelDate: '2026-10-01',
      },
    );

    expect(result.feeStatus).toBe('unavailable');
    expect(result.total).toBeNull();
    expect(result.reason).toContain('2026-10-01');
  });

  it('does not apply the August JetBlue schedule to an uncovered return date', () => {
    const result = calculateTripCost(
      { ...delta, id: 'b6-3', airline: 'JetBlue', price: 400 },
      {
        travelerCount: 2,
        checkedBagCount: 4,
        baggageBenefit: 'none',
        tripType: 'round_trip',
        travelDate: '2026-08-31',
        returnDate: '2026-10-01',
      },
    );

    expect(result.feeStatus).toBe('unavailable');
    expect(result.reason).toContain('2026-10-01');
  });

  it('charges a single direction for a one-way itinerary', () => {
    const result = calculateTripCost(delta, {
      travelerCount: 2,
      checkedBagCount: 4,
      baggageBenefit: 'none',
      tripType: 'one_way',
      travelDate: '2026-08-14',
    });

    expect(result.baggageTotal).toBe((45 + 55) * 2);
  });

  it('returns an explicit unavailable result for a carrier without a reliable schedule', () => {
    const result = calculateTripCost(
      { ...delta, airline: 'Frontier Airlines' },
      {
        travelerCount: 2,
        checkedBagCount: 4,
        baggageBenefit: 'none',
        tripType: 'round_trip',
        travelDate: '2026-08-14',
      },
    );

    expect(result.feeStatus).toBe('unavailable');
    expect(result.baggageTotal).toBeNull();
    expect(result.total).toBeNull();
  });

  it('returns unavailable when a traveler would check more than two bags', () => {
    const result = calculateTripCost(delta, {
      travelerCount: 1,
      checkedBagCount: 3,
      baggageBenefit: 'none',
      tripType: 'round_trip',
      travelDate: '2026-08-14',
    });

    expect(result.feeStatus).toBe('unavailable');
    expect(result.reason).toContain('third');
  });
});

describe('rankSnapshotsByTripCost', () => {
  it('ranks by known total and puts unknown bag totals last', () => {
    const ranked = rankSnapshotsByTripCost(
      [
        { ...delta, id: 'delta', price: 500 },
        { ...delta, id: 'jetblue', airline: 'JetBlue', price: 450 },
        { ...delta, id: 'unknown', airline: 'Frontier', price: 200 },
      ],
      {
        travelerCount: 2,
        checkedBagCount: 4,
        baggageBenefit: 'delta_platinum_amex',
        tripType: 'round_trip',
        travelDate: '2026-08-14',
      },
    );

    expect(ranked.map((item) => item.snapshot.id)).toEqual(['delta', 'jetblue', 'unknown']);
  });

  it('keeps only the latest observation of each flight before ranking', () => {
    const snapshots = latestSnapshotsByFlight([
      { ...delta, id: 'old', flightId: 'DL100', scrapedAt: '2026-07-25T12:00:00Z', price: 500 },
      { ...delta, id: 'new', flightId: 'DL100', scrapedAt: '2026-07-26T12:00:00Z', price: 450 },
      { ...delta, id: 'other', flightId: 'DL200', scrapedAt: '2026-07-26T12:00:00Z', price: 475 },
    ]);

    expect(snapshots.map((snapshot) => snapshot.id).sort()).toEqual(['new', 'other']);
  });

  it('keeps distinct snapshots when the provider supplied no stable flight fields', () => {
    const snapshots = latestSnapshotsByFlight([
      { ...delta, id: 'first', price: 450 },
      { ...delta, id: 'second', price: 475 },
    ]);

    expect(snapshots.map((snapshot) => snapshot.id).sort()).toEqual(['first', 'second']);
  });
});
