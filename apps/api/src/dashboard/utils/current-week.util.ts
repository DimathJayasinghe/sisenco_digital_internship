const MONDAY = 1;
const DAYS_PER_WEEK = 7;

/**
 * The canonical "current week" boundary used across all dashboard endpoints:
 * the most recent Monday on/before `now`, at UTC midnight. Reports are
 * required to start on a Monday (see IsMonday validator on CreateReportDto),
 * so this always lines up with an actual possible weekStartDate.
 */
export function getCurrentWeekStart(now: Date): Date {
  const day = now.getUTCDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  const daysSinceMonday = (day + DAYS_PER_WEEK - MONDAY) % DAYS_PER_WEEK;
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);
  return start;
}
