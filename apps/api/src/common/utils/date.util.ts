/** Formats a Date (typically a Prisma @db.Date field, UTC midnight) as a YYYY-MM-DD string. */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
