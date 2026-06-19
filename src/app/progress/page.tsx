/**
 * 3.6 / 4.6 — Progress (Program · Gameplan). Server data layer for the v2
 * reskin: computes the shared metric series + month adherence calendar +
 * workout history, plus the Gameplan-superset rings / check-in history /
 * recommendation ledger. Tier branching lives in the client `ProgressView`
 * (it reads useTier()); the server fetches everything and lets the view pick.
 *
 * Gameplan-only tables (CheckIn, Recommendation, Meal, LifestyleLog) are read
 * defensively so the page degrades gracefully before those tables exist
 * (CLAUDE.md API-resilience pattern).
 */
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import ProgressView, {
  type ProgressData,
  type CalStatus,
  type HistoryRow,
  type Ring,
  type CheckinRow,
  type RecRow,
  type MetricSeries,
} from "./_view";

export const dynamic = "force-dynamic";

const DAY = 86_400_000;

function dayKey(d: Date) {
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}
function mondayOfUTC(d: Date): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = x.getUTCDay();
  x.setUTCDate(x.getUTCDate() + (day === 0 ? -6 : 1 - day));
  return x;
}
function utcDate(d: string | Date) {
  const x = new Date(d);
  return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()));
}

/** Compress a per-week value array (8 weeks) into a display series starting at
 *  the first populated week. LOCF carries gaps forward when `locf`. */
function buildSeries(weekVals: (number | null)[], locf: boolean, scale = 1): number[] {
  const firstIdx = weekVals.findIndex((v) => v != null);
  if (firstIdx < 0) return [];
  const out: number[] = [];
  let last = 0;
  for (let i = firstIdx; i < weekVals.length; i++) {
    const v = weekVals[i];
    if (v != null) {
      last = v;
      out.push(v * scale);
    } else {
      out.push((locf ? last : 0) * scale);
    }
  }
  return out.map((n) => Math.round(n * 10) / 10);
}

function deltaStr(series: number[], unit: string): string {
  if (series.length < 2) return `${series.length} wk`;
  const d = series[series.length - 1] - series[0];
  const sign = d >= 0 ? "+" : "−";
  const abs = Math.round(Math.abs(d) * 10) / 10;
  return `${sign}${abs} ${unit} · ${series.length} wk`;
}

export default async function ProgressPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/signin");

  const today = utcDate(new Date());
  const thisMon = mondayOfUTC(today);
  // Eight weekly Monday buckets, oldest → current.
  const weekMondays: string[] = [];
  for (let i = 7; i >= 0; i--) {
    weekMondays.push(dayKey(new Date(thisMon.getTime() - i * 7 * DAY)));
  }
  const windowStart = new Date(thisMon.getTime() - 7 * 7 * DAY);
  const weekIndex = (d: Date) => weekMondays.indexOf(dayKey(mondayOfUTC(d)));

  const [workouts, bodyMetrics] = await Promise.all([
    prisma.workout.findMany({
      where: { userId, date: { gte: windowStart } },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        blockDay: { select: { name: true } },
        exercises: { select: { sets: { select: { weight: true, reps: true, isWarmup: true, isPr: true } } } },
      },
      orderBy: { date: "asc" },
    }),
    prisma.bodyMetric.findMany({
      where: { userId, date: { gte: windowStart }, weight: { not: null } },
      select: { date: true, weight: true },
      orderBy: { date: "asc" },
    }),
  ]);

  // ── weekly series ──
  const volByWeek: (number | null)[] = Array(8).fill(null);
  const e1rmByWeek: (number | null)[] = Array(8).fill(null);
  const wtByWeek: (number | null)[] = Array(8).fill(null);
  const workoutDays = new Set<string>();

  for (const w of workouts) {
    workoutDays.add(dayKey(utcDate(w.date)));
    const wi = weekIndex(w.date);
    if (wi < 0) continue;
    let vol = 0;
    let bestE1rm = 0;
    for (const ex of w.exercises) {
      for (const s of ex.sets) {
        if (s.weight == null || !s.reps || s.isWarmup) continue;
        const weight = Number(s.weight);
        vol += weight * s.reps;
        const e1rm = weight * (1 + s.reps / 30); // Epley
        if (e1rm > bestE1rm) bestE1rm = e1rm;
      }
    }
    volByWeek[wi] = (volByWeek[wi] ?? 0) + vol;
    if (bestE1rm > (e1rmByWeek[wi] ?? 0)) e1rmByWeek[wi] = Math.round(bestE1rm);
  }
  for (const m of bodyMetrics) {
    const wi = weekIndex(m.date);
    if (wi >= 0 && m.weight != null) wtByWeek[wi] = Number(m.weight);
  }

  const eSeries = buildSeries(e1rmByWeek, true);
  const vSeries = buildSeries(volByWeek, false, 1 / 1000);
  const wSeries = buildSeries(wtByWeek, true);

  const metrics: Record<"e1rm" | "volume" | "weight", MetricSeries> = {
    e1rm: { label: "Top e1RM", unit: "lb", up: true, series: eSeries, delta: deltaStr(eSeries, "lb") },
    volume: { label: "Weekly volume", unit: "k lb", up: true, series: vSeries, delta: deltaStr(vSeries, "k") },
    weight: { label: "Bodyweight", unit: "lb", up: false, series: wSeries, delta: deltaStr(wSeries, "lb") },
  };

  // ── adherence calendar (current month) ──
  const y = today.getUTCFullYear();
  const mo = today.getUTCMonth();
  const firstOfMonth = new Date(Date.UTC(y, mo, 1));
  const daysInMonth = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate();
  const lead = (firstOfMonth.getUTCDay() + 6) % 7; // Mon-start offset
  const cells: CalStatus[] = Array(lead).fill("none");
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(Date.UTC(y, mo, d));
    if (date.getTime() > today.getTime()) cells.push("future");
    else if (workoutDays.has(dayKey(date))) cells.push("full");
    else cells.push("rest");
  }
  while (cells.length % 7 !== 0) cells.push("none");
  const calendar: CalStatus[][] = [];
  for (let i = 0; i < cells.length; i += 7) calendar.push(cells.slice(i, i + 7));
  const calendarMonth = firstOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

  // ── history (most recent 5) ──
  const history: HistoryRow[] = [...workouts]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5)
    .map((w) => {
      let vol = 0;
      let pr = false;
      for (const ex of w.exercises)
        for (const s of ex.sets) {
          if (s.isPr) pr = true;
          if (s.weight != null && s.reps && !s.isWarmup) vol += Number(s.weight) * s.reps;
        }
      const dur = w.startTime && w.endTime ? Math.round((w.endTime.getTime() - w.startTime.getTime()) / 60000) : null;
      const parts: string[] = [];
      if (dur && dur > 0) parts.push(`${dur} min`);
      parts.push(`${(vol / 1000).toFixed(1)}k lb`);
      return {
        id: w.id,
        date: w.date
          .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })
          .replace(", ", " · "),
        name: w.blockDay?.name || "Workout",
        stat: parts.join(" · "),
        pr,
      };
    });

  const loggedCount = workouts.length;
  const enough = loggedCount >= 6;

  // ── gameplan superset (defensive: new tables may not exist yet) ──
  let rings: Ring[] = [
    { label: "Training", pct: 0, sub: "0 of 5" },
    { label: "Nutrition", pct: 0, sub: "0 of 7" },
    { label: "Lifestyle", pct: 0, sub: "0 of 7" },
  ];
  let checkins: CheckinRow[] = [];
  let recs: RecRow[] = [];

  const inThisWeek = (d: Date) => d.getTime() >= thisMon.getTime() && d.getTime() <= today.getTime();

  try {
    const trainedThisWeek = new Set(
      workouts.filter((w) => inThisWeek(utcDate(w.date))).map((w) => dayKey(utcDate(w.date)))
    ).size;

    const activeBlock = await prisma.block.findFirst({
      where: { program: { userId, status: "active" }, status: "active" },
      include: { days: { select: { dayType: true } } },
    });
    const planned = activeBlock ? activeBlock.days.filter((d) => d.dayType !== "rest").length || 5 : 5;

    let nutDays = 0;
    let lifeDays = 0;
    try {
      const meals = await prisma.meal.findMany({ where: { userId, date: { gte: thisMon } }, select: { date: true } });
      nutDays = new Set(meals.map((m) => dayKey(utcDate(m.date)))).size;
    } catch {
      /* meals table unavailable */
    }
    try {
      const logs = await prisma.lifestyleLog.findMany({ where: { userId, date: { gte: thisMon } }, select: { date: true } });
      lifeDays = new Set(logs.map((l) => dayKey(utcDate(l.date)))).size;
    } catch {
      /* lifestyle logs table unavailable */
    }

    const pct = (done: number, total: number) => (total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0);
    rings = [
      { label: "Training", pct: pct(trainedThisWeek, planned), sub: `${trainedThisWeek} of ${planned}` },
      { label: "Nutrition", pct: pct(nutDays, 7), sub: `${nutDays} of 7` },
      { label: "Lifestyle", pct: pct(lifeDays, 7), sub: `${lifeDays} of 7` },
    ];
  } catch {
    /* keep defaults */
  }

  try {
    const existing = await prisma.checkIn.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 4 });
    const wkLabel = (d: Date) => `Week of ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}`;
    const hasThisWeek = existing.some((c) => dayKey(mondayOfUTC(c.date)) === dayKey(thisMon));
    if (!hasThisWeek) {
      const sun = new Date(thisMon.getTime() + 6 * DAY);
      checkins.push({
        id: null,
        week: wkLabel(thisMon),
        status: "ready",
        note: `Due ${sun.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })}`,
      });
    }
    for (const c of existing) {
      const note =
        c.wins?.trim() ||
        (c.energy != null ? `Energy ${c.energy}/5${c.sleepQuality != null ? ` · sleep ${c.sleepQuality}/5` : ""}` : "Logged");
      checkins.push({
        id: c.id,
        week: wkLabel(mondayOfUTC(c.date)),
        status: "applied",
        note: note.length > 42 ? `${note.slice(0, 40)}…` : note,
      });
    }
    checkins = checkins.slice(0, 4);
  } catch {
    checkins = [];
  }

  try {
    const recRows = await prisma.recommendation.findMany({
      where: { userId, status: { in: ["applied", "dismissed"] } },
      orderBy: { createdAt: "desc" },
      take: 4,
    });
    recs = recRows.map((r): RecRow => {
      const when = r.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
      const reason = r.dismissedReason?.trim() || r.kind.replace(/_/g, " ");
      return {
        id: r.id,
        rec: r.title,
        status: r.status === "applied" ? "applied" : "dismissed",
        meta: `${reason} · ${when}`,
      };
    });
  } catch {
    recs = [];
  }

  const data: ProgressData = { metrics, calendar, calendarMonth, history, loggedCount, enough, rings, checkins, recs };

  return <ProgressView {...data} />;
}
