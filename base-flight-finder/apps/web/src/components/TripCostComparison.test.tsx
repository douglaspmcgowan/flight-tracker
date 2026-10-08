/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TripCostComparison } from './TripCostComparison';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe('TripCostComparison', () => {
  it('shows airfare, bag fees, total, and source for the exact Delta AmEx scenario', () => {
    render(
      <TripCostComparison
        queryId="q1"
        snapshots={[{
          id: 'dl-1',
          airline: 'Delta Air Lines',
          price: 459,
          currency: 'USD',
          status: 'available',
          stops: 1,
          duration: '9 hr',
          bookingUrl: 'https://delta.com',
          flightId: 'DL100',
          flightNumber: 'DL 100',
          departureTime: '10:25 AM',
          arrivalTime: '6:35 PM',
          scrapedAt: '2026-07-26T12:00:00Z',
        }]}
        travelerCount={2}
        checkedBagCount={4}
        baggageBenefit="delta_platinum_amex"
        tripType="round_trip"
        travelDate="2026-08-14"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Total trip cost' })).toBeInTheDocument();
    expect(screen.getByText(/USD.*918/)).toBeInTheDocument();
    expect(screen.getByText(/USD.*110/)).toBeInTheDocument();
    expect(screen.getByText(/USD.*1,028/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /source/i })).toHaveAttribute('href', expect.stringContaining('delta.com'));
    expect(screen.getByText(/DL 100.*10:25 AM.*6:35 PM/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Book this flight' })).toHaveAttribute('href', 'https://delta.com');
  });

  it('keeps an unsupported carrier visible with a fee-confirmation state', () => {
    render(
      <TripCostComparison
        queryId="q1"
        snapshots={[{
          id: 'f9-1',
          airline: 'Frontier Airlines',
          price: 200,
          currency: 'USD',
          status: 'available',
          stops: 1,
          duration: null,
          bookingUrl: null,
        }]}
        travelerCount={2}
        checkedBagCount={4}
        baggageBenefit="none"
        tripType="round_trip"
        travelDate="2026-08-14"
      />,
    );

    expect(screen.getByText('Confirm with airline')).toBeInTheDocument();
    expect(screen.getByText('Pending fee')).toBeInTheDocument();
    expect(screen.getByText(/No verified checked-bag schedule/)).toBeInTheDocument();
  });
});
