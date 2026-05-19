"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "./_components/Header";
import TabBar from "./_components/TabBar";
import TodayCard from "./_components/TodayCard";
import WeekStrip from "./_components/WeekStrip";
import BlockTimeline from "./_components/BlockTimeline";
import NutritionPanel from "./_components/NutritionPanel";
import LifestylePanel from "./_components/LifestylePanel";
import { SectionH } from "./_components/SectionH";
import { EditPlanBtn } from "./_components/EditPlanBtn";
import { GoalPulse } from "./_components/GoalPulse";
import { CheckInCard } from "./_components/CheckInCard";
import { NextActionLogged } from "./_components/NextActionLogged";
import { SprayDotsLayer, FreshTape } from "./_components/Ornaments";
import { buildDailySeries as engineBuildDailySeries } from "@/lib/goal-engine/series";
import { feasibilityBand as engineFeasibilityBand } from "@/lib/goal-engine/feasibility";
import type { GoalKind as EngineGoalKind } from "@/lib/goal-engine/types";
import type { GoalPlan } from "./_components/GoalCard";
import type { LoggedSummary } from "./_components/NextActionLogged";
import type { GoalIconKind } from "./_components/icons";
import type {
  HomeData,
  ProgramDetail,
  MealsData,
  NutritionTarget,
  CheckIn,
  TabId,
  ScheduleOverride,
  DailyMetricLite,
  LifestyleTargetLite,
  DailyProteinPoint,
  LifestyleLogLite,
} from "./_components/types";

export const dynamic = "force-dynamic";

/**
 * /gameplan — active program dashboard.
 *
 * Data sources (parallel fetch on mount):
 *   - GET /api/home               → active program, active block, today's
 *                                   schedule, today's workout if logged,
 *                                   stretch routine, current weight
 *   - GET /api/programs/{id}      → all program blocks (for the timeline)
 *   - GET /api/nutrition/meals?date=today
 *   - GET /api/nutrition/targets
 *   - GET /api/checkins?weeks=4
 *
 * Tabs: Training | Nutrition | Lifestyle. Tab state lives in URL hash
 * (#training / #nutrition / #lifestyle) so deep links survive reloads.
 */
interface RawGoal {
  id: string;
  type: string;
  title: string;
  metric: string | null;
  startValue: number | string | null;
  targetValue: number | string | null;
  targetUnit: string | null;
  targetDate: string | null;
  programId: string | null;
}

interface RawWorkout {
  id: string;
  date: string;
  endTime: string | null;
  blockDayId: string | null;
  exercises: { exercise: { movementPattern: string | null }; sets: { weight: number | string | null; reps: number | null }[] }[];
}

export default function GameplanPage() {
  const [home, setHome] = useState<HomeData | null>(null);
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [meals, setMeals] = useState<MealsData | null>(null);
  const [nutritionTarget, setNutritionTarget] = useState<NutritionTarget | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [goals, setGoals] = useState<RawGoal[]>([]);
  const [weekWorkouts, setWeekWorkouts] = useState<RawWorkout[]>([]);
  const [overrides, setOverrides] = useState<ScheduleOverride[]>([]);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetricLite[]>([]);
  const [lifestyleTargets, setLifestyleTargets] = useState<LifestyleTargetLite[]>([]);
  const [lifestyleLogs, setLifestyleLogs] = useState<LifestyleLogLite[]>([]);
  const [dailyProtein, setDailyProtein] = useState<DailyProteinPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>(() => readHashTab());

  /* Hash sync — keep tab state in URL for shareable deep links. */
  useEffect(() => {
    const onHash = () => setTab(readHashTab());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const updateTab = (t: TabId) => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${t}`);
    }
    setTab(t);
  };

  /* Initial data fetch. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const homeRes = await fetch("/api/home");
        if (homeRes.status === 401) {
          if (!cancelled) {
            setError("auth");
            setLoading(false);
          }
          return;
        }
        const homeData: HomeData = await homeRes.json();
        if (cancelled) return;
        setHome(homeData);

        const today = new Date().toISOString().split("T")[0];
        // Compute Mon..Sun range for this week's workouts fetch.
        const todayDow = (new Date().getDay() + 6) % 7;
        const monday = new Date();
        monday.setDate(monday.getDate() - todayDow);
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 7);
        const fromIso = monday.toISOString().slice(0, 10);
        const toIso = sunday.toISOString().slice(0, 10);

        const programId = homeData.activeProgram?.id;
        // R6 — daily-vitals window covers the program's full duration
        // (default 16 weeks if not set) so SleepCard/StressCard/
        // ProteinHitCard can render the full canvas.
        const durationWeeks = homeData.activeProgram?.durationWeeks ?? 16;
        const days = Math.min(200, durationWeeks * 7);
        const programStartIso = homeData.activeProgram?.startDate ?? null;
        const proteinFrom =
          programStartIso ?? new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
        const proteinTo = new Date().toISOString().slice(0, 10);

        const [
          programRes,
          mealsRes,
          targetRes,
          checkInsRes,
          goalsRes,
          weekWorkoutsRes,
          overridesRes,
          dailyMetricsRes,
          lifestyleTargetsRes,
          lifestyleLogsRes,
          dailyProteinRes,
        ] = await Promise.all([
          programId ? fetch(`/api/programs/${programId}`) : Promise.resolve(null),
          fetch(`/api/nutrition/meals?date=${today}`),
          fetch("/api/nutrition/targets"),
          fetch("/api/checkins?weeks=16"),
          fetch("/api/goals"),
          fetch(`/api/workouts?from=${fromIso}&to=${toIso}&limit=20`),
          programId
            ? fetch(`/api/schedule-overrides?programId=${programId}`)
            : Promise.resolve(null),
          fetch(`/api/integrations/fitbit/daily?days=${days}`),
          fetch(programId ? `/api/lifestyle-targets?programId=${programId}` : "/api/lifestyle-targets"),
          // R9 — fetch the same window the cards render so manual
          // logs can override the Fitbit daily-metric value when both
          // exist for a date.
          fetch(`/api/lifestyle-logs?from=${proteinFrom}&to=${proteinTo}`),
          fetch(`/api/nutrition/meals/range?from=${proteinFrom}&to=${proteinTo}`),
        ]);

        const [
          programDataRaw,
          mealsData,
          targetData,
          checkInsData,
          goalsData,
          weekWorkoutsData,
          overridesData,
          dailyMetricsData,
          lifestyleTargetsData,
          lifestyleLogsData,
          dailyProteinData,
        ] = await Promise.all([
          programRes?.ok ? programRes.json() : null,
          mealsRes.ok ? mealsRes.json() : null,
          targetRes.ok ? targetRes.json() : null,
          checkInsRes.ok ? checkInsRes.json() : { checkIns: [] },
          goalsRes.ok ? goalsRes.json() : { goals: [] },
          weekWorkoutsRes.ok ? weekWorkoutsRes.json() : { workouts: [] },
          overridesRes?.ok ? overridesRes.json() : [],
          dailyMetricsRes.ok ? dailyMetricsRes.json() : [],
          lifestyleTargetsRes.ok ? lifestyleTargetsRes.json() : [],
          lifestyleLogsRes.ok ? lifestyleLogsRes.json() : { logs: [] },
          dailyProteinRes.ok ? dailyProteinRes.json() : { days: [] },
        ]);

        if (cancelled) return;
        setProgram(programDataRaw ? normalizeProgram(programDataRaw) : null);
        setMeals(mealsData ? normalizeMeals(mealsData) : null);
        setNutritionTarget(targetData ? normalizeTarget(targetData) : null);
        setCheckIns(checkInsData?.checkIns ?? []);
        setGoals(Array.isArray(goalsData?.goals) ? goalsData.goals : Array.isArray(goalsData) ? goalsData : []);
        setWeekWorkouts(Array.isArray(weekWorkoutsData?.workouts) ? weekWorkoutsData.workouts : []);
        setOverrides(Array.isArray(overridesData) ? overridesData : []);
        setDailyMetrics(normalizeDailyMetrics(dailyMetricsData));
        setLifestyleTargets(Array.isArray(lifestyleTargetsData) ? lifestyleTargetsData : []);
        setLifestyleLogs(Array.isArray(lifestyleLogsData?.logs) ? lifestyleLogsData.logs : []);
        setDailyProtein(Array.isArray(dailyProteinData?.days) ? dailyProteinData.days : []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-ft-bg text-ft-white min-h-screen flex items-center justify-center">
        <div className="font-body text-sm text-ft-dim uppercase tracking-[0.15em]">Loading…</div>
      </div>
    );
  }

  if (error === "auth") {
    return (
      <div className="bg-ft-bg text-ft-white min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-body text-sm text-ft-dim mb-4">You need to sign in to see your gameplan.</p>
          <Link
            href="/signin"
            className="font-body text-[12px] uppercase tracking-[0.15em] text-ft-accent border border-ft-accent px-4 py-2"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (!home?.activeProgram) {
    return (
      <div className="bg-ft-bg text-ft-white min-h-screen px-6 py-10 max-w-xl mx-auto">
        <h1 className="font-display text-3xl text-ft-white mb-3">No active gameplan.</h1>
        <p className="font-body text-sm text-ft-light mb-6">
          Pick or build a program to start training. The picker walks you through goals, schedule,
          and equipment in five quick steps.
        </p>
        <Link
          href="/programs/new"
          className="inline-block cta-underline font-display text-base text-ft-accent"
        >
          Pick a Gameplan →
        </Link>
      </div>
    );
  }

  const todayDow = (new Date().getDay() + 6) % 7; // 0=Mon

  // Derive done/today/future state for the WeekStrip from week-workouts.
  const workoutsByDow: Record<number, boolean> = {};
  for (const w of weekWorkouts) {
    if (!w.endTime) continue; // incomplete sessions don't count as "done"
    const dow = (new Date(w.date).getDay() + 6) % 7;
    workoutsByDow[dow] = true;
  }

  // Compute current week-in-active-block for the BlockTimeline marker.
  const currentWeekInActiveBlock = computeWeekInActiveBlock(
    program,
    home.activeBlock?.id ?? null,
  );

  // Build NextActionLogged summary if today's workout is logged.
  const loggedSummary = buildLoggedSummary(home, weekWorkouts, todayDow);

  // Map live Goal records → GoalPlan payloads for GoalPulse. Body
  // weight + strength goals get rich icons; everything else falls back
  // to the "weight" stencil so the pulse strip never crashes.
  // R8: feed BodyMetric history (from /api/home weeklyVolume + bodyWeights8w)
  // into goalToPlan so the trajectory series uses real rows.
  const bodyHistory = (home?.bodyWeights ?? []).map((p) => ({ date: p.date, weight: p.weight }));
  const goalPlans: GoalPlan[] = goals
    .map((g) => goalToPlan(g, bodyHistory))
    .filter((p): p is GoalPlan => p != null)
    .slice(0, 3);

  return (
    <div className="bg-ft-bg text-ft-white -mx-4 -my-4 -mb-24 min-h-screen relative">
      {/* SprayDotsLayer — graffiti-only decorative dot field. No-op
          on every other chrome via internal gating. */}
      <SprayDotsLayer seed={3} />

      {/* Floating FRESH stamp — verbatim port of gameplan-active.jsx
          ScreenMain (lines 2040–2042). Pinned top-right of the
          training-content strip. */}
      <div style={{ position: "absolute", top: 102, right: 14, zIndex: 5 }}>
        <FreshTape rotate={8} size="sm" />
      </div>

      <Header program={home.activeProgram} block={home.activeBlock} />
      <TabBar active={tab} onChange={updateTab} />

      <div className="px-5 py-5 space-y-5">
        {tab === "training" && (
          <>
            <SectionH kicker="UP NEXT" sprayWidth={120}>
              {home.todayCompleted ? "DONE TODAY" : "NEXT ACTION"}
            </SectionH>

            {home.todayCompleted && loggedSummary ? (
              <NextActionLogged summary={loggedSummary} tilt={-0.3} />
            ) : (
              <TodayCard
                scheduledDay={home.scheduledDay}
                todayCompleted={home.todayCompleted}
                todaysWorkoutId={home.todaysWorkout?.id ?? null}
              />
            )}

            <CheckInCard recentCheckIns={checkIns} tilt={0.3} />

            <SectionH kicker="TARGETS" sprayWidth={130}>
              GOAL PULSE
            </SectionH>
            <GoalPulse goals={goalPlans} />

            {home.activeBlock && (
              <section>
                <SectionH kicker="THIS WEEK" sprayWidth={140}>
                  SCHEDULE
                </SectionH>
                <WeekStrip
                  block={home.activeBlock}
                  todayDayOfWeek={todayDow}
                  workoutsByDow={workoutsByDow}
                  overrides={overrides.filter(
                    (o) => o.weekNumber == null || o.weekNumber === weekOfProgram(home.activeProgram?.startDate ?? null),
                  )}
                />
              </section>
            )}
            {program && (
              <section>
                <SectionH kicker="STRUCTURE" sprayWidth={130}>
                  PROGRAM MAP
                </SectionH>
                <BlockTimeline
                  blocks={program.blocks}
                  activeBlockId={home.activeBlock?.id ?? null}
                  currentWeekInActiveBlock={currentWeekInActiveBlock}
                />
              </section>
            )}
            {home.activeProgram?.id && (
              <EditPlanBtn
                align="flex-end"
                href={`/programs/${home.activeProgram.id}`}
                label="EDIT TRAINING"
              />
            )}
          </>
        )}

        {tab === "nutrition" && (
          <NutritionPanel
            meals={meals}
            target={nutritionTarget}
            programId={home.activeProgram?.id ?? null}
            activeBlock={
              home.activeBlock
                ? {
                    startDate: program?.blocks.find((b) => b.id === home.activeBlock!.id)?.startDate
                      ?? home.activeProgram?.startDate ?? null,
                    refeedWeeks: home.activeBlock.refeedWeeks ?? [],
                  }
                : null
            }
          />
        )}

        {tab === "lifestyle" && (
          <LifestylePanel
            stretchRoutine={home.stretchRoutine}
            recentCheckIns={checkIns}
            programId={home.activeProgram?.id ?? null}
            programStartDate={home.activeProgram?.startDate ?? null}
            programDurationWeeks={home.activeProgram?.durationWeeks ?? null}
            dailyMetrics={dailyMetrics}
            lifestyleTargets={lifestyleTargets}
            lifestyleLogs={lifestyleLogs}
            dailyProtein={dailyProtein}
            onLogged={(log) => {
              setLifestyleLogs((prev) => {
                const without = prev.filter(
                  (p) => !(p.variableKey === log.variableKey && p.date === log.date),
                );
                return [...without, log].sort((a, b) => a.date.localeCompare(b.date));
              });
            }}
          />
        )}
      </div>
    </div>
  );
}


/** ISO-week-of-program (1-indexed). Returns 1 when startDate is null. */
function weekOfProgram(startDate: string | null): number {
  if (!startDate) return 1;
  const ms = Date.now() - new Date(startDate).getTime();
  return Math.max(1, Math.floor(ms / (7 * 86400000)) + 1);
}

/**
 * Compute current week-of-active-block for the BlockTimeline marker.
 * Returns 0-indexed week within the active block, or null if the
 * active block isn't in the timeline yet.
 */
function computeWeekInActiveBlock(program: ProgramDetail | null, activeBlockId: string | null): number | null {
  if (!program || !program.startDate || !activeBlockId) return null;
  const start = new Date(program.startDate).getTime();
  const totalWeeks = Math.floor((Date.now() - start) / (7 * 86400000));
  let weeksBefore = 0;
  for (const b of program.blocks) {
    const dur = b.durationWeeks ?? 4;
    if (b.id === activeBlockId) {
      const inBlock = totalWeeks - weeksBefore;
      return Math.max(0, Math.min(dur - 1, inBlock));
    }
    weeksBefore += dur;
  }
  return null;
}

/**
 * Build a `LoggedSummary` for `NextActionLogged` from today's logged
 * workout. Pulls volume / top-set / duration from the live Workout.
 */
function buildLoggedSummary(
  home: HomeData,
  weekWorkouts: RawWorkout[],
  todayDow: number,
): LoggedSummary | null {
  const today = home.todaysWorkout;
  if (!today || !home.todayCompleted) return null;
  const w = weekWorkouts.find((x) => x.id === today.id);
  let volume = 0;
  let topSet: { weight: number; reps: number } | null = null;
  let movement: "push" | "pull" | "legs" | "core" = "core";
  if (w) {
    for (const ex of w.exercises ?? []) {
      const mp = ex.exercise?.movementPattern;
      if (mp === "push" || mp === "pull" || mp === "legs") movement = mp;
      for (const s of ex.sets ?? []) {
        const wt = s.weight != null ? Number(s.weight) : 0;
        const reps = s.reps ?? 0;
        if (wt && reps) {
          volume += wt * reps;
          if (!topSet || wt > topSet.weight) topSet = { weight: wt, reps };
        }
      }
    }
  }
  // Tomorrow preview from the active block's day cycle.
  let tomorrow: LoggedSummary["tomorrow"] = null;
  const days = home.activeBlock?.days ?? [];
  const tomorrowIdx = (todayDow + 1) % Math.max(1, days.length || 7);
  const tomorrowDay = days[tomorrowIdx];
  if (tomorrowDay) {
    const mp = tomorrowDay.exercises?.[0]?.movementPattern;
    const tmove: "push" | "pull" | "legs" | "core" =
      mp === "push" ? "push" : mp === "pull" ? "pull" : mp === "legs" ? "legs" : "core";
    tomorrow = {
      name: tomorrowDay.name,
      moveKind: tmove,
      dayNumber: tomorrowDay.dayNumber,
    };
  }
  return {
    moveKind: movement,
    shortName: home.scheduledDay?.name?.split(" ")[0] ?? "Workout",
    volumeLbs: volume,
    topSet,
    minutes: 0,
    workoutId: today.id,
    tomorrow,
  };
}

/**
 * Map a live `Goal` record → `GoalPlan` shape consumed by GoalPulse.
 *
 * R8: implemented in goal-engine. The trajectory series + tone now
 * derive from `goal-engine/series.buildDailySeries()` +
 * `goal-engine/feasibility.feasibilityBand()` reading
 * `bodyMetrics` already fetched by /api/home (when available).
 *
 * For body-weight goals with no live `BodyMetric` history yet, the
 * series falls back to the prescribed expected line + empty daily/
 * rolling7 arrays — the chart renders the prescribed line + an empty-
 * state callout. Strength goals don't get history-from-page reads
 * (would require an exercise-id specific fetch); the engine's
 * server-side run inside POST /api/checkins persists Recommendation
 * rows that the dashboard reads separately via /api/recommendations.
 */
function goalToPlan(
  g: RawGoal,
  bodyHistory?: { date: string; weight: number }[],
): GoalPlan | null {
  const start = g.startValue != null ? Number(g.startValue) : null;
  const target = g.targetValue != null ? Number(g.targetValue) : null;
  if (start == null || target == null || start === target) return null;
  const icon: GoalIconKind =
    g.type === "bodyweight" || g.type === "weight"
      ? "weight"
      : g.type === "strength" || g.type === "powerlifting"
      ? "bench"
      : g.type === "frequency"
      ? "bolt"
      : "weight";
  const unit = (g.targetUnit ?? "").toUpperCase() || "—";

  // Today + a default 16-week window when the goal lacks a target date.
  const today = new Date();
  const targetIso =
    g.targetDate ?? new Date(today.getTime() + 112 * 86400000).toISOString().slice(0, 10);
  const startIso = today.toISOString().slice(0, 10);
  const isBodyWeight = g.type === "bodyweight" || g.type === "weight";
  const history = isBodyWeight
    ? (bodyHistory ?? []).map((p) => ({ date: p.date, value: p.weight }))
    : [];
  const series = engineBuildDailySeries({
    kind: g.type as EngineGoalKind,
    startValue: start,
    targetValue: target,
    startDate: startIso,
    targetDate: targetIso,
    today,
    history,
  });
  const currentValue =
    series.daily.length > 0
      ? series.rolling7[series.rolling7.length - 1] ?? series.daily[series.daily.length - 1]
      : start;

  // Feasibility band → tone tier. sustainable=green, aggressive=yellow,
  // unrealistic=red. When no live history exists yet, default to
  // sustainable rather than misleading the user.
  const band = engineFeasibilityBand({
    kind: g.type as EngineGoalKind,
    startValue: start,
    targetValue: target,
    startDate: startIso,
    targetDate: targetIso,
  });
  const tone: "green" | "yellow" | "red" =
    band.status === "unrealistic"
      ? "red"
      : band.status === "aggressive"
      ? "yellow"
      : "green";

  return {
    label: g.title.toUpperCase(),
    icon,
    value: currentValue.toFixed(1),
    unit,
    target: target.toFixed(0),
    tone,
    series: {
      start,
      target,
      currentValue,
      unit,
      decimals: 1,
      // noise / seed kept for caller-API stability — ignored by R8 engine.
      noise: 0,
      seed: 1,
    },
  };
}

function readHashTab(): TabId {
  if (typeof window === "undefined") return "training";
  const h = window.location.hash.replace("#", "");
  if (h === "nutrition" || h === "lifestyle") return h;
  return "training";
}

/* ─── Normalization helpers (API responses → component types) ──── */

interface RawProgramBlock {
  id: string;
  name: string;
  blockNumber: number;
  durationWeeks: number | null;
  phase: string | null;
  status: string;
  refeedWeeks?: number[];
  startDate?: string | null;
}
interface RawProgram {
  id: string;
  name: string;
  durationWeeks: number | null;
  startDate: string | null;
  blocks: RawProgramBlock[];
}

function normalizeProgram(raw: RawProgram): ProgramDetail {
  return {
    id: raw.id,
    name: raw.name,
    durationWeeks: raw.durationWeeks,
    startDate: raw.startDate,
    blocks: (raw.blocks ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      blockNumber: b.blockNumber,
      durationWeeks: b.durationWeeks,
      phase: b.phase,
      status: b.status,
      refeedWeeks: b.refeedWeeks ?? [],
      startDate: b.startDate ?? null,
    })),
  };
}

interface RawMealItem {
  quantity: number | string;
  foodItem: { name: string; calories: number | string; protein: number | string; carbs: number | string; fat: number | string };
}
interface RawMeals {
  meals: { id: string; mealType: string; items: RawMealItem[] }[];
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFat?: number;
}

function normalizeMeals(raw: RawMeals): MealsData {
  return {
    meals: (raw.meals ?? []).map((m) => ({
      id: m.id,
      mealType: m.mealType,
      items: (m.items ?? []).map((it) => ({
        quantity: Number(it.quantity),
        foodItem: {
          name: it.foodItem.name,
          calories: Number(it.foodItem.calories),
          protein: Number(it.foodItem.protein),
          carbs: Number(it.foodItem.carbs),
          fat: Number(it.foodItem.fat),
        },
      })),
    })),
    totals: {
      calories: Number(raw.totalCalories ?? 0),
      protein: Number(raw.totalProtein ?? 0),
      carbs: Number(raw.totalCarbs ?? 0),
      fat: Number(raw.totalFat ?? 0),
    },
  };
}

interface RawTarget {
  calories: number | string | null;
  protein: number | string | null;
  carbs: number | string | null;
  fat: number | string | null;
}

/**
 * R6 — normalize `/api/integrations/fitbit/daily` response to the
 * `DailyMetricLite` subset consumed by SleepCard / StressCard.
 */
interface RawDailyMetric {
  id: string;
  date: string;
  sleepMinutes: number | null;
  stress: number | null;
}
function normalizeDailyMetrics(raw: unknown): DailyMetricLite[] {
  if (!Array.isArray(raw)) return [];
  return (raw as RawDailyMetric[]).map((m) => ({
    id: m.id,
    date: m.date,
    sleepMinutes: m.sleepMinutes,
    stress: m.stress ?? null,
  }));
}

function normalizeTarget(raw: RawTarget | null): NutritionTarget | null {
  if (!raw) return null;
  const has =
    raw.calories != null || raw.protein != null || raw.carbs != null || raw.fat != null;
  if (!has) return null;
  return {
    calories: raw.calories != null ? Number(raw.calories) : null,
    protein: raw.protein != null ? Number(raw.protein) : null,
    carbs: raw.carbs != null ? Number(raw.carbs) : null,
    fat: raw.fat != null ? Number(raw.fat) : null,
  };
}
