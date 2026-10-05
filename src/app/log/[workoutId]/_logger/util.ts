/** Logger formatting helpers. */

/** "M:SS" */
export function formatSec(s: number): string {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
}

/** Integer when whole, one decimal otherwise. */
export function fmtWeight(w: number | null | undefined): string {
  if (w == null) return "—";
  if (Number.isInteger(w)) return String(w);
  return w.toFixed(1).replace(/\.0$/, "");
}

/** "8,420" */
export function fmtVolume(v: number): string {
  return Math.round(v).toLocaleString("en-US");
}

/** Reps-in-reserve stored on Set ↔ RPE shown to the user. */
export function rirToRpe(rir: number | null | undefined): number | null {
  return rir == null ? null : 10 - rir;
}
