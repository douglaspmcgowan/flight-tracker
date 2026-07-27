import { describe, expect, it } from 'vitest';
import { formatFlightDate } from './format-flight-date';

describe('formatFlightDate', () => {
  it('preserves a UTC date-only value in an Eastern-time runtime', () => {
    expect(formatFlightDate(new Date('2026-08-14T00:00:00.000Z'))).toBe('Aug 14, 2026');
  });
});
