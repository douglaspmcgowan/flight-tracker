/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AwardWorkspace } from './AwardWorkspace';

const summary = {
  id: 'award-1',
  origin: 'ORF',
  destination: 'OAK',
  dateFrom: '2026-08-14T00:00:00.000Z',
  dateTo: '2026-08-17T00:00:00.000Z',
  cabin: 'business',
  programs: ['aeroplan'],
  active: true,
  lastCheckedAt: '2026-07-25T08:00:00.000Z',
  createdAt: '2026-07-25T08:00:00.000Z',
  updatedAt: '2026-07-25T08:00:00.000Z',
  _count: { snapshots: 1, alertRules: 0 },
};

const detail = {
  search: {
    ...summary,
    snapshots: [{
      id: 'snapshot-1',
      program: 'aeroplan',
      origin: 'ORF',
      destination: 'OAK',
      travelDate: '2026-08-14T00:00:00.000Z',
      cabin: 'business',
      seatsAvailable: 2,
      mileageCost: 20_000,
      taxesFees: '$35',
      lastSeen: '2026-07-25T08:00:00.000Z',
      bookingProgram: 'aeroplan',
      scrapedAt: '2026-07-25T08:00:00.000Z',
    }],
    alertRules: [],
  },
  cashComparison: {
    queryId: 'cash-1',
    price: 435,
    currency: 'USD',
    airline: 'Southwest',
    travelDate: '2026-08-14T00:00:00.000Z',
    scrapedAt: '2026-07-24T00:00:00.000Z',
  },
};

function response(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as Response;
}

function installPopulatedApi(options?: { refreshStatus?: number }) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url === '/api/awards/searches' && (!init?.method || init.method === 'GET')) {
      return response({ ok: true, data: { searches: [summary] } });
    }
    if (url === '/api/awards/searches/award-1' && (!init?.method || init.method === 'GET')) {
      return response({ ok: true, data: detail });
    }
    if (url === '/api/awards/searches/award-1/refresh') {
      if (options?.refreshStatus === 424) {
        return response({ ok: false, error: 'Award provider is disabled. Set SEATS_AERO_API_KEY to refresh this search.' }, 424);
      }
      return response({ ok: true, data: { result: { status: 'success', snapshotsCount: 1 } } });
    }
    if (url === '/api/alert-rules') {
      return response({ ok: true, data: { rule: { id: 'rule-1' } } }, 201);
    }
    throw new Error(`Unexpected fetch ${init?.method ?? 'GET'} ${url}`);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('AwardWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('shows the best observed award with provenance in Simple mode', async () => {
    installPopulatedApi();
    render(<AwardWorkspace />);

    expect(await screen.findByRole('heading', { name: 'ORF to OAK' })).toBeInTheDocument();
    expect(screen.getByText('20,000 mi + $35')).toBeInTheDocument();
    expect(screen.getByText('2 seats')).toBeInTheDocument();
    expect(screen.getByLabelText('Award availability data from seats.aero')).toBeInTheDocument();
    expect(screen.getByText('Confirm availability with the airline before transferring points.')).toBeInTheDocument();
  });

  it('switches to the Analyst ledger and preserves the mode for the session', async () => {
    installPopulatedApi();
    const user = userEvent.setup();
    render(<AwardWorkspace />);
    await screen.findByRole('heading', { name: 'ORF to OAK' });

    await user.click(screen.getByRole('button', { name: 'Analyst' }));

    const table = screen.getByRole('table', { name: 'Cash and award comparison' });
    expect(within(table).getByText('20,000')).toBeInTheDocument();
    expect(within(table).getByText('$435')).toBeInTheDocument();
    expect(within(table).getByText('2.00¢')).toBeInTheDocument();
    expect(sessionStorage.getItem('flight-finder-award-mode')).toBe('analyst');
  });

  it('keeps observations visible when a provider-disabled refresh is rejected', async () => {
    installPopulatedApi({ refreshStatus: 424 });
    const user = userEvent.setup();
    render(<AwardWorkspace />);
    await screen.findByText('20,000 mi + $35');

    await user.click(screen.getByRole('button', { name: 'Refresh results' }));

    expect(await screen.findByText(/Award search is paused/)).toBeInTheDocument();
    expect(screen.getAllByText(/Award search is paused/)).toHaveLength(1);
    expect(screen.getByText('20,000 mi + $35')).toBeInTheDocument();
  });

  it('creates a normalized search from the empty state', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === '/api/awards/searches' && (!init?.method || init.method === 'GET')) {
        return response({ ok: true, data: { searches: [] } });
      }
      if (url === '/api/awards/searches' && init?.method === 'POST') {
        return response({ ok: true, data: { search: summary } }, 201);
      }
      if (url === '/api/awards/searches/award-1') {
        return response({ ok: true, data: detail });
      }
      throw new Error(`Unexpected fetch ${init?.method ?? 'GET'} ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<AwardWorkspace />);

    await user.type(await screen.findByLabelText('Origin'), 'orf');
    await user.type(screen.getByLabelText('Destination'), 'oak');
    await user.type(screen.getByLabelText('Start date'), '2026-08-14');
    await user.type(screen.getByLabelText('End date'), '2026-08-17');
    await user.selectOptions(screen.getByLabelText('Cabin'), 'business');
    await user.type(screen.getByLabelText('Programs'), 'Aeroplan, United, aeroplan');
    await user.click(screen.getByRole('button', { name: 'Save award search' }));

    expect(fetchMock).toHaveBeenCalledWith('/api/awards/searches', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        origin: 'ORF',
        destination: 'OAK',
        dateFrom: '2026-08-14',
        dateTo: '2026-08-17',
        cabin: 'business',
        programs: ['aeroplan', 'united'],
      }),
    }));
    expect(await screen.findByRole('heading', { name: 'ORF to OAK' })).toBeInTheDocument();
  });

  it('creates an availability alert from the current search', async () => {
    const fetchMock = installPopulatedApi();
    const user = userEvent.setup();
    render(<AwardWorkspace />);
    await screen.findByRole('heading', { name: 'ORF to OAK' });

    await user.clear(screen.getByLabelText('Minimum seats'));
    await user.type(screen.getByLabelText('Minimum seats'), '2');
    await user.click(screen.getByRole('button', { name: 'Save alert' }));

    expect(fetchMock).toHaveBeenCalledWith('/api/alert-rules', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        type: 'award_seats_available',
        awardSearchId: 'award-1',
        threshold: 2,
        program: 'aeroplan',
        cabin: 'business',
      }),
    }));
    expect(await screen.findByText('Alert saved.')).toBeInTheDocument();
  });

  it('opens the search selected by an award-alert deep link', async () => {
    const linkedSummary = {
      ...summary,
      id: 'award-2',
      origin: 'IAD',
      destination: 'SFO',
    };
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === '/api/awards/searches') {
        return response({ ok: true, data: { searches: [summary, linkedSummary] } });
      }
      if (url === '/api/awards/searches/award-2') {
        return response({
          ok: true,
          data: {
            search: { ...linkedSummary, snapshots: [], alertRules: [] },
            cashComparison: null,
          },
        });
      }
      throw new Error(`Unexpected fetch GET ${url}`);
    }));

    render(<AwardWorkspace initialSearchId="award-2" />);

    expect(await screen.findByRole('heading', { name: 'IAD to SFO' })).toBeInTheDocument();
  });
});
