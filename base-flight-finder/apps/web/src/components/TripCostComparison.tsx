'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/currency';
import { getDeleteToken } from '@/lib/tracker-storage';
import { safeHttpUrl } from '@/lib/safe-url';
import {
  BAGGAGE_BENEFITS,
  latestSnapshotsByFlight,
  rankSnapshotsByTripCost,
  type BaggageBenefit,
  type TripCostSnapshot,
} from '@/lib/baggage-cost';
import styles from './TripCostComparison.module.css';

export interface TripCostComparisonSnapshot extends TripCostSnapshot {
  stops: number;
  duration: string | null;
  bookingUrl: string | null;
}

interface Props {
  queryId: string;
  snapshots: TripCostComparisonSnapshot[];
  travelerCount: number;
  checkedBagCount: number;
  baggageBenefit: BaggageBenefit;
  tripType: string;
  travelDate: string;
  returnDate?: string;
  canEdit?: boolean;
}

function benefitLabel(benefit: BaggageBenefit, t: ReturnType<typeof useTranslations>): string {
  if (benefit === 'delta_platinum_amex') return t('deltaPlatinumAmex');
  if (benefit === 'delta_platinum_medallion') return t('deltaPlatinumMedallion');
  return t('standardFees');
}

export function TripCostComparison({
  queryId,
  snapshots,
  travelerCount,
  checkedBagCount,
  baggageBenefit,
  tripType,
  travelDate,
  returnDate,
  canEdit = false,
}: Props) {
  const t = useTranslations('TripCostComparison');
  const router = useRouter();
  const token = typeof window !== 'undefined' ? getDeleteToken(queryId) : null;
  const [editing, setEditing] = useState(false);
  const [draftTravelers, setDraftTravelers] = useState(travelerCount);
  const [draftBags, setDraftBags] = useState(checkedBagCount);
  const [draftBenefit, setDraftBenefit] = useState<BaggageBenefit>(baggageBenefit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ranked = useMemo(
    () => rankSnapshotsByTripCost(
      latestSnapshotsByFlight(snapshots),
      {
        travelerCount,
        checkedBagCount,
        baggageBenefit,
        tripType,
        travelDate,
        returnDate,
      },
    ),
    [baggageBenefit, checkedBagCount, returnDate, snapshots, travelDate, travelerCount, tripType],
  );

  if (snapshots.length === 0) return null;

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/queries/${queryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deleteToken: token,
          travelerCount: draftTravelers,
          checkedBagCount: draftBags,
          baggageBenefit: draftBenefit,
        }),
      });
      const data = await response.json();
      if (!data.ok) {
        setError(data.error || t('updateFailed'));
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError(t('networkError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.root} aria-labelledby={`trip-cost-${queryId}`}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{t('optimizer')}</p>
          <h3 id={`trip-cost-${queryId}`} className={styles.title}>{t('title')}</h3>
          <p className={styles.summary}>
            {t('summary', { travelers: travelerCount, bags: checkedBagCount })}
            <span aria-hidden="true"> · </span>
            {benefitLabel(baggageBenefit, t)}
          </p>
        </div>
        {(token || canEdit) && (
          <button
            type="button"
            className={styles.editButton}
            onClick={() => setEditing((value) => !value)}
            aria-expanded={editing}
          >
            {t('editAssumptions')}
          </button>
        )}
      </header>

      {editing && (
        <div className={styles.editor}>
          <label className={styles.field}>
            <span>{t('travelers')}</span>
            <input
              type="number"
              min={1}
              max={9}
              value={draftTravelers}
              onChange={(event) => setDraftTravelers(Math.max(1, Math.min(9, Number(event.target.value) || 1)))}
            />
          </label>
          <label className={styles.field}>
            <span>{t('checkedBags')}</span>
            <input
              type="number"
              min={0}
              max={18}
              value={draftBags}
              onChange={(event) => setDraftBags(Math.max(0, Math.min(18, Number(event.target.value) || 0)))}
            />
          </label>
          <label className={`${styles.field} ${styles.benefitField}`}>
            <span>{t('baggageBenefit')}</span>
            <select
              value={draftBenefit}
              onChange={(event) => {
                const benefit = event.target.value as BaggageBenefit;
                if (BAGGAGE_BENEFITS.includes(benefit)) setDraftBenefit(benefit);
              }}
            >
              <option value="none">{t('standardFees')}</option>
              <option value="delta_platinum_amex">{t('deltaPlatinumAmex')}</option>
              <option value="delta_platinum_medallion">{t('deltaPlatinumMedallion')}</option>
            </select>
          </label>
          <div className={styles.editorActions}>
            <button type="button" className={styles.cancelButton} onClick={() => setEditing(false)} disabled={saving}>
              {t('cancel')}
            </button>
            <button type="button" className={styles.saveButton} onClick={save} disabled={saving}>
              {saving ? t('saving') : t('save')}
            </button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">{t('flight')}</th>
              <th scope="col">{t('airfare')}</th>
              <th scope="col">{t('bags')}</th>
              <th scope="col">{t('total')}</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map(({ snapshot, breakdown }, index) => {
              const bookingUrl = safeHttpUrl(snapshot.bookingUrl);
              return (
              <tr key={snapshot.id} className={index === 0 && breakdown.total !== null ? styles.bestRow : undefined}>
                <td>
                  <span className={styles.airline}>{snapshot.airline}</span>
                  <span className={styles.flightMeta}>
                    {snapshot.stops === 0 ? t('nonstop') : t('stops', { count: snapshot.stops })}
                    {snapshot.duration ? ` · ${snapshot.duration}` : ''}
                  </span>
                  {(snapshot.flightNumber || snapshot.departureTime || snapshot.arrivalTime) && (
                    <span className={styles.flightMeta}>
                      {snapshot.flightNumber ?? ''}
                      {snapshot.flightNumber && (snapshot.departureTime || snapshot.arrivalTime) ? ' · ' : ''}
                      {(snapshot.departureTime || snapshot.arrivalTime)
                        ? `${snapshot.departureTime ?? '?'} – ${snapshot.arrivalTime ?? '?'}`
                        : ''}
                    </span>
                  )}
                </td>
                <td className={styles.money}>{formatCurrency(breakdown.airfareTotal, snapshot.currency)}</td>
                <td className={styles.money}>
                  {breakdown.baggageTotal === null ? (
                    <>
                      <span className={styles.unavailable}>{t('confirmFee')}</span>
                      {breakdown.reason && <span className={styles.reason}>{breakdown.reason}</span>}
                    </>
                  ) : formatCurrency(breakdown.baggageTotal, snapshot.currency)}
                </td>
                <td className={styles.total}>
                  {breakdown.total === null
                    ? <span className={styles.unavailable}>{t('pending')}</span>
                    : formatCurrency(breakdown.total, snapshot.currency)}
                  {breakdown.source && (
                    <a
                      className={styles.source}
                      href={breakdown.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('source', { date: breakdown.source.reviewedOn })}
                    </a>
                  )}
                  {bookingUrl && (
                    <a
                      className={styles.bookLink}
                      href={bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('bookFlight')}
                    </a>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className={styles.caveat}>{t('caveat')}</p>
    </section>
  );
}
