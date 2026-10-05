/** Date formatting for the UI. Plans have no dates; records and headers do. */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function toDate(v: Date | string | number): Date {
  return v instanceof Date ? v : new Date(v);
}

/** Monday 00:00 of the ISO week containing `d`. */
export function startOfIsoWeek(d: Date = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const offset = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - offset);
  return x;
}

/** "SEP 21" — the completed-this-week badge, PR dates. */
export function fmtStamp(v: Date | string): string {
  const d = toDate(v);
  return `${MONTHS[d.getUTCMonth()].toUpperCase()} ${d.getUTCDate()}`;
}

/** "Sep 18" — body copy dates. */
export function fmtMonthDay(v: Date | string): string {
  const d = toDate(v);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/** "Mon · Sep 22" — the informational date stamp in tab headers (local time). */
export function fmtHeaderDate(d: Date = new Date()): string {
  return `${DAYS[d.getDay()]} · ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** "Sep 2026" */
export function fmtMonthYear(d: Date = new Date()): string {
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "Aug 12" from a date-only column stored as UTC midnight. */
export function fmtStarted(v: Date | string | null | undefined): string | null {
  if (!v) return null;
  return fmtMonthDay(v);
}
