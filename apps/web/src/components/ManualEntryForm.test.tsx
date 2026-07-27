/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ManualEntryForm, type ManualFormValues } from './ManualEntryForm';

function makeInitialValues(): ManualFormValues {
  return {
    origin: { code: 'MAN', name: 'Manchester (Manchester Airport)' },
    destination: { code: 'HRG', name: 'Hurghada (Hurghada International Airport)' },
    destinationArea: null,
    dateFrom: '2026-05-07',
    dateTo: '2026-05-21',
    tripType: 'round_trip',
    flexibility: 0,
    maxPrice: '',
    maxStops: '',
    maxDuration: '',
    airlines: '',
    timePreference: 'any',
    cabinClass: 'economy',
    currency: '',
    travelerCount: 1,
    checkedBagCount: 0,
    baggageBenefit: 'none',
  };
}

describe('ManualEntryForm — edit flow (issue #60)', () => {
  beforeEach(() => {
    // jsdom does not implement fetch; AirportCombobox calls /api/airports.
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, data: [] }),
    }));
  });

  it('keeps both origin and destination resolved when re-mounting with initialValues', () => {
    render(
      <ManualEntryForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        adminCurrency={null}
        initialValues={makeInitialValues()}
      />,
    );

    const origin = screen.getByRole('combobox', { name: /origin/i }) as HTMLInputElement;
    const destination = screen.getByRole('combobox', { name: /destination/i }) as HTMLInputElement;

    // Both fields should display the resolved IATA-prefixed value.
    expect(destination.value).toBe('HRG - Hurghada (Hurghada International Airport)');
    expect(origin.value).toBe('MAN - Manchester (Manchester Airport)');

    // Neither should be flagged invalid on mount.
    expect(origin.getAttribute('aria-invalid')).not.toBe('true');
    expect(destination.getAttribute('aria-invalid')).not.toBe('true');
  });

  it('submits the Berkeley area with two travelers, four bags, and Delta Platinum AmEx', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const initialValues: ManualFormValues = {
      ...makeInitialValues(),
      origin: { code: 'ORF', name: 'Norfolk International Airport' },
      destination: null,
      dateFrom: '2026-08-14',
      dateTo: '2026-08-17',
      maxStops: '2',
      travelerCount: 2,
      checkedBagCount: 4,
      baggageBenefit: 'delta_platinum_amex',
    };

    render(
      <ManualEntryForm
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        adminCurrency="USD"
        initialValues={initialValues}
      />,
    );

    await user.click(screen.getByRole('button', { name: /berkeley/i }));
    await user.click(screen.getByRole('button', { name: /show available flights/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: 'ORF',
        destination: 'OAK',
        destinations: [
          { code: 'OAK', name: 'Oakland International Airport' },
          { code: 'SFO', name: 'San Francisco International Airport' },
        ],
        dateFrom: '2026-08-14',
        dateTo: '2026-08-17',
        maxStops: 2,
        travelerCount: 2,
        checkedBagCount: 4,
        baggageBenefit: 'delta_platinum_amex',
      }),
      expect.any(String),
      expect.objectContaining({ destinationArea: 'berkeley-ca' }),
    );
  });
});
