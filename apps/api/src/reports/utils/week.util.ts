import { SUBMISSION_GRACE_DAYS, WEEK_LENGTH_DAYS } from '../reports.constants';

function addUtcDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/** weekEndDate = weekStartDate + WEEK_LENGTH_DAYS, a fixed 7-day inclusive week. */
export function computeWeekEndDate(weekStartDate: Date): Date {
  return addUtcDays(weekStartDate, WEEK_LENGTH_DAYS);
}

/**
 * DATABASE.md §5: deadline = end of week_end_date (23:59:59) + SUBMISSION_GRACE_DAYS.
 * Implemented as "now is on/after the start of the day following the grace period" —
 * equivalent, but avoids constructing an exact 23:59:59.999 instant.
 */
export function isPastDeadline(weekEndDate: Date, now: Date): boolean {
  const deadlineExclusive = addUtcDays(weekEndDate, 1 + SUBMISSION_GRACE_DAYS);
  return now.getTime() >= deadlineExclusive.getTime();
}
