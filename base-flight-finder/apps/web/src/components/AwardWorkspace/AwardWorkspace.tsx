'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import styles from './AwardWorkspace.module.css';
import {
  centsPerPoint,
  formatDateOnly,
  freshnessLabel,
  parseProgramList,
  rankSnapshots,
  type AwardMode,
  type AwardSearchDetail,
  type AwardSearchSummary,
  type AwardSnapshotView,
  type CashComparison,
} from './award-view-model';

const MODE_STORAGE_KEY = 'flight-finder-award-mode';

interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

interface SearchDetailResponse {
  search: AwardSearchDetail;
  cashComparison: CashComparison | null;
}

interface SearchFormState {
  origin: string;
  destination: string;
  dateFrom: string;
  dateTo: string;
  cabin: string;
  programs: string;
}

const EMPTY_FORM: SearchFormState = {
  origin: '',
  destination: '',
  dateFrom: '',
  dateTo: '',
  cabin: 'economy',
  programs: '',
};

function formatMiles(value: number | null): string {
  return value == null ? 'Mileage unavailable' : `${value.toLocaleString('en-US')} mi`;
}

function formatCash(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

async function readApi<T>(response: Response): Promise<T> {
  const payload = await response.json() as ApiEnvelope<T>;
  if (!response.ok || !payload.ok || payload.data === undefined) {
    throw new Error(payload.error || `Request failed with HTTP ${response.status}`);
  }
  return payload.data;
}

function ModeSwitch({
  mode,
  onChange,
}: {
  mode: AwardMode;
  onChange: (mode: AwardMode) => void;
}) {
  return (
    <div className={styles.modeSwitch} role="group" aria-label="Award view mode">
      {(['simple', 'analyst'] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={mode === option}
          className={mode === option ? styles.modeActive : styles.modeButton}
          onClick={() => onChange(option)}
        >
          {option === 'simple' ? 'Simple' : 'Analyst'}
        </button>
      ))}
    </div>
  );
}

function SearchForm({
  busy,
  initiallyOpen,
  onCreate,
}: {
  busy: boolean;
  initiallyOpen: boolean;
  onCreate: (form: SearchFormState) => Promise<void>;
}) {
  const [form, setForm] = useState<SearchFormState>(EMPTY_FORM);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreate(form);
  }

  function set<K extends keyof SearchFormState>(key: K, value: SearchFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <details className={styles.searchPanel} open={initiallyOpen || undefined}>
      <summary>New award search</summary>
      <form className={styles.searchForm} onSubmit={submit}>
        <div className={styles.routeFields}>
          <label>
            <span>Origin</span>
            <input
              value={form.origin}
              onChange={(event) => set('origin', event.target.value.toUpperCase().slice(0, 3))}
              maxLength={3}
              inputMode="text"
              autoComplete="off"
              placeholder="ORF"
              required
            />
          </label>
          <span className={styles.routeArrow} aria-hidden="true">→</span>
          <label>
            <span>Destination</span>
            <input
              value={form.destination}
              onChange={(event) => set('destination', event.target.value.toUpperCase().slice(0, 3))}
              maxLength={3}
              inputMode="text"
              autoComplete="off"
              placeholder="OAK"
              required
            />
          </label>
        </div>
        <div className={styles.formGrid}>
          <label>
            <span>Start date</span>
            <input
              type="date"
              value={form.dateFrom}
              onChange={(event) => set('dateFrom', event.target.value)}
              required
            />
          </label>
          <label>
            <span>End date</span>
            <input
              type="date"
              value={form.dateTo}
              onChange={(event) => set('dateTo', event.target.value)}
              required
            />
          </label>
          <label>
            <span>Cabin</span>
            <select value={form.cabin} onChange={(event) => set('cabin', event.target.value)}>
              <option value="economy">Economy</option>
              <option value="premium_economy">Premium economy</option>
              <option value="business">Business</option>
              <option value="first">First</option>
            </select>
          </label>
          <label className={styles.programField}>
            <span>Programs</span>
            <input
              aria-label="Programs"
              value={form.programs}
              onChange={(event) => set('programs', event.target.value)}
              placeholder="Aeroplan, United"
              autoComplete="off"
            />
            <small>Optional, comma separated</small>
          </label>
        </div>
        <button className={styles.primaryButton} type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save award search'}
        </button>
      </form>
    </details>
  );
}

function EmptyObservation() {
  return (
    <section className={styles.emptyState}>
      <h2>No award observations yet</h2>
      <p>
        This search is saved. Refresh when the award provider is connected, or let the scheduled
        monitor collect availability.
      </p>
    </section>
  );
}

function SimpleView({
  snapshot,
  cash,
}: {
  snapshot: AwardSnapshotView;
  cash: CashComparison | null;
}) {
  const observed = freshnessLabel(snapshot.lastSeen ?? snapshot.scrapedAt);
  const cashValue = cash ? formatCash(cash.price, cash.currency) : null;
  const pointValue = centsPerPoint({
    cashPrice: cash?.price ?? null,
    mileageCost: snapshot.mileageCost,
    taxesFees: snapshot.taxesFees,
  });

  return (
    <section className={styles.simpleView} aria-labelledby="best-award-heading">
      <div className={styles.bestAward}>
        <div>
          <p className={styles.sectionLabel}>Best observed award</p>
          <h2 id="best-award-heading">
            {formatMiles(snapshot.mileageCost)}
            {snapshot.taxesFees ? ` + ${snapshot.taxesFees}` : ''}
          </h2>
          <div className={styles.availabilityLine}>
            <span className={styles.availableBadge}>
              {snapshot.seatsAvailable == null
                ? 'Seat count unavailable'
                : `${snapshot.seatsAvailable} ${snapshot.seatsAvailable === 1 ? 'seat' : 'seats'}`}
            </span>
            <span>{snapshot.program}</span>
            <span>{snapshot.cabin.replace('_', ' ')}</span>
          </div>
          <p className={observed.stale ? styles.staleText : styles.freshText}>
            {observed.label}{observed.stale ? ' · cached result' : ''}
          </p>
        </div>
        <dl className={styles.quickCompare}>
          <div>
            <dt>Travel date</dt>
            <dd>{formatDateOnly(snapshot.travelDate)}</dd>
          </div>
          <div>
            <dt>Best stored cash</dt>
            <dd>{cashValue ?? 'No matching cash tracker'}</dd>
          </div>
          <div>
            <dt>Value after taxes</dt>
            <dd>{pointValue == null ? 'Insufficient evidence' : `${pointValue.toFixed(2)}¢ per point`}</dd>
          </div>
        </dl>
      </div>
      <div className={styles.confirmationNotice}>
        <span aria-hidden="true">ⓘ</span>
        <p>Confirm availability with the airline before transferring points.</p>
      </div>
    </section>
  );
}

function AnalystView({
  snapshots,
  cash,
}: {
  snapshots: AwardSnapshotView[];
  cash: CashComparison | null;
}) {
  return (
    <section className={styles.analystView} aria-labelledby="analyst-heading">
      <div className={styles.analystHeading}>
        <div>
          <h2 id="analyst-heading">Comparison ledger</h2>
          <p>Cash evidence is the lowest stored fare for an overlapping tracker.</p>
        </div>
        {cash && (
          <a href={`/q/${cash.queryId}`} className={styles.cashLink}>
            Open cash tracker
          </a>
        )}
      </div>
      <div className={styles.tableScroller}>
        <table aria-label="Cash and award comparison">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Program</th>
              <th scope="col">Cabin</th>
              <th scope="col">Seats</th>
              <th scope="col">Miles</th>
              <th scope="col">Taxes</th>
              <th scope="col">Cash</th>
              <th scope="col">CPP</th>
              <th scope="col">Observed</th>
            </tr>
          </thead>
          <tbody>
            {snapshots.map((snapshot) => {
              const observed = freshnessLabel(snapshot.lastSeen ?? snapshot.scrapedAt);
              const cpp = centsPerPoint({
                cashPrice: cash?.price ?? null,
                mileageCost: snapshot.mileageCost,
                taxesFees: snapshot.taxesFees,
              });
              return (
                <tr key={snapshot.id}>
                  <td data-label="Date">{formatDateOnly(snapshot.travelDate)}</td>
                  <td data-label="Program">{snapshot.program}</td>
                  <td data-label="Cabin">{snapshot.cabin.replace('_', ' ')}</td>
                  <td data-label="Seats" className={(snapshot.seatsAvailable ?? 0) > 0 ? styles.goodValue : styles.unavailableValue}>
                    {snapshot.seatsAvailable ?? '—'}
                  </td>
                  <td data-label="Miles">{snapshot.mileageCost?.toLocaleString('en-US') ?? '—'}</td>
                  <td data-label="Taxes">{snapshot.taxesFees ?? '—'}</td>
                  <td data-label="Cash">{cash ? formatCash(cash.price, cash.currency) : '—'}</td>
                  <td data-label="CPP">{cpp == null ? '—' : `${cpp.toFixed(2)}¢`}</td>
                  <td data-label="Observed" className={observed.stale ? styles.staleText : styles.freshText}>
                    {observed.label.replace('Observed ', '')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className={styles.assumption}>
        CPP = (stored cash fare − award taxes) ÷ miles. It is comparison evidence, not a booking recommendation.
      </p>
    </section>
  );
}

function AlertForm({
  search,
  busy,
  onSave,
}: {
  search: AwardSearchDetail;
  busy: boolean;
  onSave: (minimumSeats: number) => Promise<void>;
}) {
  const [minimumSeats, setMinimumSeats] = useState('1');

  return (
    <form
      className={styles.alertForm}
      onSubmit={(event) => {
        event.preventDefault();
        void onSave(Number(minimumSeats));
      }}
    >
      <label>
        <span>Minimum seats</span>
        <input
          type="number"
          min={1}
          max={20}
          value={minimumSeats}
          onChange={(event) => setMinimumSeats(event.target.value)}
          required
        />
      </label>
      <p>
        {search.programs[0] ?? 'Any program'} · {search.cabin.replace('_', ' ')}
      </p>
      <button className={styles.secondaryButton} type="submit" disabled={busy}>
        {busy ? 'Saving…' : 'Save alert'}
      </button>
    </form>
  );
}

export function AwardWorkspace({ initialSearchId }: { initialSearchId?: string }) {
  const [mode, setMode] = useState<AwardMode>('simple');
  const [searches, setSearches] = useState<AwardSearchSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AwardSearchDetail | null>(null);
  const [cashComparison, setCashComparison] = useState<CashComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [savingAlert, setSavingAlert] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerMessage, setProviderMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const loadDetail = useCallback(async (id: string) => {
    const response = await fetch(`/api/awards/searches/${id}`);
    const data = await readApi<SearchDetailResponse>(response);
    setDetail(data.search);
    setCashComparison(data.cashComparison);
    setSelectedId(id);
  }, []);

  useEffect(() => {
    const storedMode = sessionStorage.getItem(MODE_STORAGE_KEY);
    if (storedMode === 'analyst' || storedMode === 'simple') setMode(storedMode);

    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch('/api/awards/searches');
        const data = await readApi<{ searches: AwardSearchSummary[] }>(response);
        if (cancelled) return;
        setSearches(data.searches);
        const initialSearch = data.searches.find((search) => search.id === initialSearchId)
          ?? data.searches[0];
        if (initialSearch) await loadDetail(initialSearch.id);
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : 'Unable to load award searches');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialSearchId, loadDetail]);

  const rankedSnapshots = useMemo(
    () => rankSnapshots(detail?.snapshots ?? []),
    [detail?.snapshots],
  );

  function changeMode(nextMode: AwardMode) {
    setMode(nextMode);
    sessionStorage.setItem(MODE_STORAGE_KEY, nextMode);
  }

  async function selectSearch(id: string) {
    setError(null);
    setStatus(null);
    setLoading(true);
    try {
      await loadDetail(id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load this award search');
    } finally {
      setLoading(false);
    }
  }

  async function createSearch(form: SearchFormState) {
    setCreating(true);
    setError(null);
    setStatus(null);
    try {
      const response = await fetch('/api/awards/searches', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          origin: form.origin.toUpperCase(),
          destination: form.destination.toUpperCase(),
          dateFrom: form.dateFrom,
          dateTo: form.dateTo,
          cabin: form.cabin,
          programs: parseProgramList(form.programs),
        }),
      });
      const data = await readApi<{ search: AwardSearchSummary }>(response);
      setSearches((current) => [data.search, ...current.filter((search) => search.id !== data.search.id)]);
      await loadDetail(data.search.id);
      setStatus('Award search saved.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save the award search');
    } finally {
      setCreating(false);
    }
  }

  async function refreshResults() {
    if (!selectedId) return;
    setRefreshing(true);
    setError(null);
    setStatus(null);
    try {
      const response = await fetch(`/api/awards/searches/${selectedId}/refresh`, { method: 'POST' });
      const payload = await response.json() as ApiEnvelope<{ result: { snapshotsCount: number } }>;
      if (!response.ok || !payload.ok) {
        const message = payload.error || `Refresh failed with HTTP ${response.status}`;
        if (response.status === 424) {
          setProviderMessage(
            'Award search is paused. Add a seats.aero API key to the server configuration, restart the app, then refresh again.',
          );
          return;
        }
        throw new Error(message);
      }
      await loadDetail(selectedId);
      setProviderMessage(null);
      setStatus(`Refresh complete. ${payload.data?.result.snapshotsCount ?? 0} observations stored.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to refresh award availability');
    } finally {
      setRefreshing(false);
    }
  }

  async function saveAlert(minimumSeats: number) {
    if (!detail) return;
    setSavingAlert(true);
    setError(null);
    setStatus(null);
    try {
      const response = await fetch('/api/alert-rules', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          type: 'award_seats_available',
          awardSearchId: detail.id,
          threshold: minimumSeats,
          program: detail.programs[0] ?? null,
          cabin: detail.cabin,
        }),
      });
      await readApi<{ rule: { id: string } }>(response);
      setStatus('Alert saved.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save the alert');
    } finally {
      setSavingAlert(false);
    }
  }

  return (
    <div className={styles.workspace}>
      <h1 className={styles.srOnly}>Award finder</h1>

      <div className={styles.statusRegion} aria-live="polite">
        {error && <p className={styles.errorMessage}>{error}</p>}
        {providerMessage && <p className={styles.providerNote}>{providerMessage}</p>}
        {status && <p className={styles.successMessage}>{status}</p>}
      </div>

      {loading && !detail && <div className={styles.loadingState}>Loading award searches…</div>}

      {!detail && (
        <div className={styles.searchTools}>
          <SearchForm
            busy={creating}
            initiallyOpen={!loading && searches.length === 0}
            onCreate={createSearch}
          />
        </div>
      )}

      {!loading && searches.length === 0 && (
        <section className={styles.firstRun}>
          <h2>Start with the trip you already know</h2>
          <p>
            Save a route above. Award observations and alerts will stay attached to that search.
          </p>
        </section>
      )}

      {detail && (
        <>
          <header className={styles.routeHeader}>
            <div>
              <h2 aria-label={`${detail.origin} to ${detail.destination}`}>
                <span>{detail.origin}</span>
                <span aria-hidden="true">→</span>
                <span>{detail.destination}</span>
              </h2>
              <p>
                {formatDateOnly(detail.dateFrom)}–{formatDateOnly(detail.dateTo)}
                <span aria-hidden="true"> · </span>
                {detail.cabin.replace('_', ' ')}
              </p>
            </div>
            <div className={styles.routeActions}>
              <ModeSwitch mode={mode} onChange={changeMode} />
              <button
                className={styles.primaryButton}
                type="button"
                onClick={() => void refreshResults()}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing…' : 'Refresh results'}
              </button>
            </div>
          </header>

          {rankedSnapshots[0]
            ? mode === 'simple'
              ? <SimpleView snapshot={rankedSnapshots[0]} cash={cashComparison} />
              : <AnalystView snapshots={rankedSnapshots} cash={cashComparison} />
            : <EmptyObservation />}

          <div className={styles.searchTools}>
            <label className={styles.savedSearchPicker}>
              <span>Saved award search</span>
              <select
                value={selectedId ?? ''}
                onChange={(event) => void selectSearch(event.target.value)}
                disabled={loading}
              >
                {searches.map((search) => (
                  <option key={search.id} value={search.id}>
                    {search.origin} → {search.destination} · {formatDateOnly(search.dateFrom)}
                  </option>
                ))}
              </select>
            </label>
            <SearchForm
              busy={creating}
              initiallyOpen={false}
              onCreate={createSearch}
            />
          </div>

          <section className={styles.actionBar} aria-labelledby="monitor-heading">
            <div>
              <h2 id="monitor-heading">Monitor this route</h2>
              <p>Receive an alert when the minimum seat count appears.</p>
            </div>
            <AlertForm
              key={detail.id}
              search={detail}
              busy={savingAlert}
              onSave={saveAlert}
            />
          </section>

          <p
            className={styles.attribution}
            aria-label="Award availability data from seats.aero"
          >
            Award availability data from{' '}
            <a href="https://seats.aero" target="_blank" rel="noopener noreferrer">
              seats.aero
            </a>
          </p>
        </>
      )}
    </div>
  );
}
