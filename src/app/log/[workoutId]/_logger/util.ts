/**
 * Shared logger helpers ported verbatim from
 * design-prototypes/logger-app.jsx + logger-skeletons.jsx.
 */

/** "M:SS" formatter for the rest timer + countdown ring. */
export function formatSec(s: number): string {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
}

/** Weight formatter — integer when whole, single decimal otherwise. */
export function fmtWeight(w: number | null | undefined): string {
  if (w == null) return "—";
  if (Number.isInteger(w)) return String(w);
  return w.toFixed(1).replace(/\.0$/, "");
}

/** Volume formatter — "12.4k" or "847". */
export function fmtVolume(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return `${Math.round(v)}`;
}

/** Compact "MM/DD" date for the WeekStrip kicker. */
export function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}`;
}
