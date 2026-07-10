const MONDAY = 1;
const DAYS_PER_WEEK = 7;

function addUtcDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/** Most recent Monday on/before `date`, at UTC midnight — mirrors the backend's week boundary. */
export function getMondayOf(date: Date): Date {
  const day = date.getUTCDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  const daysSinceMonday = (day + DAYS_PER_WEEK - MONDAY) % DAYS_PER_WEEK;
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  return addUtcDays(start, -daysSinceMonday);
}

/** Adds `days` (may be negative) to a YYYY-MM-DD date string, returning another YYYY-MM-DD string. */
export function shiftIsoDate(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return toIsoDate(addUtcDays(date, days));
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** "Jul 6 – Jul 12" for the 7-day (inclusive) week starting on `weekStartIso`. */
export function formatWeekRange(weekStartIso: string): string {
  const start = new Date(`${weekStartIso}T00:00:00Z`);
  const end = addUtcDays(start, DAYS_PER_WEEK - 1);
  const format = (date: Date): string =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  return `${format(start)} – ${format(end)}`;
}
