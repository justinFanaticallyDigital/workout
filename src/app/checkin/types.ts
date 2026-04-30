/**
 * Live CheckIn shape — matches the API response from
 * GET /api/checkins?weeks=N (returns { checkIns: CheckIn[] }) and
 * GET /api/checkins/[id] (returns { checkIn: CheckIn }).
 *
 * Mirrors the Prisma CheckIn model exactly. R8: implemented in
 * goal-engine. Recommendations are surfaced via /api/recommendations
 * and rendered by the RecommendationStub component (consumed by
 * /checkin and /checkin/[id]).
 */
export interface CheckIn {
  id: string;
  userId: string;
  date: string;
  weekNumber: number | null;
  blockId: string | null;
  energy: number | null;
  sleepQuality: number | null;
  soreness: number | null;
  stress: number | null;
  motivation: number | null;
  liftAdherence: number | null;
  cardioAdherence: number | null;
  nutritionAdherence: number | null;
  wins: string | null;
  struggles: string | null;
  notes: string | null;
  createdAt: string;
}

/**
 * Compute a rough "tone" for a check-in summary — used by
 * PastCheckInRow / HistoryTrajectory to color-code a row without
 * a Goal Engine.
 *
 * Higher rating sum (energy + sleep + motivation - soreness - stress)
 * yields green. The math is intentionally simple — the v2 spec says
 * actual recommendations come from rule-based engine, not from
 * averaging self-reports.
 */
export function deriveTone(c: CheckIn): "green" | "yellow" | "red" | "neutral" {
  const positive = (c.energy ?? 0) + (c.sleepQuality ?? 0) + (c.motivation ?? 0);
  const negative = (c.soreness ?? 0) + (c.stress ?? 0);
  const filled = [c.energy, c.sleepQuality, c.motivation, c.soreness, c.stress].filter((v) => v != null).length;
  if (filled === 0) return "neutral";
  const score = (positive - negative) / filled;
  if (score >= 0.8) return "green";
  if (score >= -0.2) return "yellow";
  return "red";
}

/**
 * ISO week + year pair. Two CheckIns are "same week" iff their
 * `(year, week)` tuples match. Used to detect whether the user has
 * already submitted this week's check-in.
 */
export function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

/**
 * "Apr 19 – Apr 25" style range from a date inside the week.
 * Week is treated as Mon–Sun.
 */
export function weekDateRange(dateStr: string): string {
  const d = new Date(dateStr);
  // Anchor to Monday of the same ISO week
  const day = d.getUTCDay();
  const mondayOffset = (day + 6) % 7;
  const mon = new Date(d);
  mon.setUTCDate(d.getUTCDate() - mondayOffset);
  const sun = new Date(mon);
  sun.setUTCDate(mon.getUTCDate() + 6);
  const fmt = (x: Date) => x.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${fmt(mon)} – ${fmt(sun)}`;
}

/** "2026-W17-AB42" pseudo-specimen-id — purely decorative. */
export function pseudoSpecimenId(c: CheckIn): string {
  const d = new Date(c.date);
  const { year, week } = isoWeek(d);
  const tail = c.id.slice(0, 4).toUpperCase();
  return `SPECIMEN # ${year}-W${String(week).padStart(2, "0")}-${tail}`;
}
