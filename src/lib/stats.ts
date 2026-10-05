/**
 * Stats helpers — descriptive only (what happened), never judged against a plan.
 */
import { estimated1RM } from "./progression";

export interface Bucket {
  label: string;
  /** Inclusive start, exclusive end — UTC midnights to match `@db.Date` columns. */
  start: Date;
  end: Date;
}

/** Calendar-month buckets of 7 days from the 1st (W1 = 1–7 … W5 = 29–31), built in UTC for a local year/month. */
export function monthBuckets(now: Date = new Date()): Bucket[] {
  const y = now.getFullYear();
  const m = now.getMonth();
  const monthEnd = new Date(Date.UTC(y, m + 1, 1));
  const out: Bucket[] = [];
  for (let day = 1, i = 1; ; day += 7, i++) {
    const start = new Date(Date.UTC(y, m, day));
    if (start >= monthEnd) break;
    const end = new Date(Math.min(Date.UTC(y, m, day + 7), monthEnd.getTime()));
    out.push({ label: `W${i}`, start, end });
  }
  return out;
}

export function bucketIndex(date: Date, buckets: Bucket[]): number {
  const t = date.getTime();
  return buckets.findIndex((b) => t >= b.start.getTime() && t < b.end.getTime());
}

/** "2026-09-21" for a date-only column (UTC midnight). */
export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** "182,400" */
export function fmtLb(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/** 182.25 → "182.3", 180 → "180" */
export function fmtNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, "");
}

/** Bodyweight movements show loads as "BW+10". */
export function isBodyweight(equipment: string | null | undefined, name: string): boolean {
  return /bodyweight|body weight/i.test(equipment ?? "") || /pull-?ups?|chin-?ups?|\bdips?\b|push-?ups?|muscle-?ups?/i.test(name);
}

/** "275 × 5" · "BW+10 × 8" · "BW × 12" */
export function fmtBestSet(weight: number | null | undefined, reps: number | null | undefined, bodyweight = false): string {
  const w = weight ?? 0;
  const r = reps ?? 0;
  const load = w > 0 ? (bodyweight ? `BW+${fmtNum(w)}` : fmtNum(w)) : "BW";
  return r > 0 ? `${load} × ${r}` : load;
}

export interface PrLike {
  prType: string;
  value: number;
  repsAtWeight: number | null;
  set: { weight: number | null; reps: number | null } | null;
}

/** One line per PR type: weight / reps as a set, e1RM and volume as a number. */
export function fmtPr(pr: PrLike, bodyweight = false): string {
  switch (pr.prType) {
    case "weight":
      return fmtBestSet(pr.value, pr.repsAtWeight ?? pr.set?.reps ?? null, bodyweight);
    case "reps":
      return fmtBestSet(pr.set?.weight ?? null, pr.value, bodyweight);
    case "e1rm":
      return `${fmtLb(pr.value)} e1RM`;
    case "volume":
      return `${fmtLb(pr.value)} vol`;
    default:
      return fmtNum(pr.value);
  }
}

export interface SetLike {
  weight: number | null;
  reps: number | null;
}

/** Best set of a session: highest estimated 1RM, falling back to most reps for bodyweight work. */
export function bestSet(sets: SetLike[]): SetLike | null {
  let best: SetLike | null = null;
  let bestScore = -1;
  for (const s of sets) {
    const score = (s.weight ?? 0) > 0 ? estimated1RM(s.weight ?? 0, s.reps ?? 0) * 1000 + (s.reps ?? 0) : s.reps ?? 0;
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return best;
}

export function sessionVolume(sets: SetLike[]): number {
  return sets.reduce((acc, s) => acc + (s.weight ?? 0) * (s.reps ?? 0), 0);
}

export function sessionE1rm(sets: SetLike[]): number {
  return sets.reduce((acc, s) => Math.max(acc, estimated1RM(s.weight ?? 0, s.reps ?? 0)), 0);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Up to three evenly spaced month labels for a date series (ascending). */
export function monthLabels(dates: Date[]): string[] {
  if (dates.length === 0) return [];
  const pick = dates.length < 3 ? dates : [dates[0], dates[Math.floor((dates.length - 1) / 2)], dates[dates.length - 1]];
  return pick.map((d) => MONTHS[d.getUTCMonth()].toUpperCase());
}
