// src/lib/goal-engine/index.ts
// ============================================================================
// Goal Engine — Entry point.
//
// runEngine({ userId, programId, prisma, checkInId? }) → drafts[]
//
// Stages:
//   1. Hydrate goals + body-metric history + workout adherence + e1RM
//   2. Build per-goal DailySeries via series.buildDailySeries()
//   3. Compute feasibility band per goal
//   4. Build EngineState
//   5. Run RULE_REGISTRY → drafts
//   6. Persist drafts as Recommendation rows (via persistRecommendations)
//
// Pure-math modules (rate-math, feasibility, series, rules) don't
// touch Prisma directly — only this file does. Math is browser-safe,
// orchestration is server-side.
// ============================================================================

import type { PrismaClient } from "@/generated/prisma/client";
import type {
  DeficitSlice,
  EngineState,
  GoalKind,
  GoalSnapshot,
  LifestyleLogPoint,
  LifestyleSnapshot,
  MetricPoint,
  NextBlockSlice,
  RecentRecommendation,
  RecommendationDraft,
  RecommendationKind,
} from "./types";
import { buildDailySeries, setsToE1RMSeries } from "./series";
import { feasibilityBand } from "./feasibility";
import { applyRules } from "./rules";
import { lifestyleVariable, logValueAsNumber } from "./lifestyle-variables";

// Re-exports for callers (UI files reading buildSeries-style series + feasibility):
export type {
  GoalKind,
  GoalSnapshot,
  EngineState,
  EngineRunResult,
  RecommendationDraft,
  DailySeries,
  FeasibilityBand,
  FeasibilityStatus,
  MetricPoint,
  RecommendationKind,
  RecommendationSeverity,
  LifestyleSnapshot,
  LifestyleLogPoint,
  RecentRecommendation,
  NextBlockSlice,
  DeficitSlice,
} from "./types";
export {
  LIFESTYLE_VARIABLES,
  lifestyleVariable,
  logValueAsNumber,
  meetsTarget,
} from "./lifestyle-variables";
export type {
  LifestyleVariable,
  LifestyleGroup,
  LifestyleType,
  LifestyleCadence,
  LifestyleSource,
} from "./lifestyle-variables";
// R13 — gameplan template registry now lives in @/lib/program-templates
// (spec §3.1, full template content). The R12 thin registry was folded
// into this module; the GAMEPLAN_TEMPLATES / gameplanTemplate /
// isValidGameplanKind names stay re-exported here so engine consumers
// (and engine-aware UI files) can import everything from one place.
export {
  GAMEPLAN_TEMPLATES,
  gameplanTemplate,
  inferGameplanKindFromTemplate,
  isValidGameplanKind,
} from "@/lib/program-templates";
export type {
  GameplanTemplate,
  GameplanKind,
  GameplanLifestylePick,
} from "@/lib/program-templates";
export { buildDailySeries, setsToE1RMSeries } from "./series";
export { feasibilityBand, warningFor } from "./feasibility";
export {
  rollingAvg,
  weeklyRate,
  actualWeeklyRate,
  projectedHitDate,
  aheadOfPlan,
  driftFromExpected,
  epley1RM,
} from "./rate-math";
export { applyRules, RULE_REGISTRY } from "./rules";

interface RunEngineInput {
  userId: string;
  programId: string | null;
  /** Optional triggering CheckIn id (when called from POST /api/checkins). */
  checkInId?: string | null;
  prisma: PrismaClient;
  /** Today — passed in for determinism. Defaults to new Date(). */
  today?: Date;
}

/**
 * Hydrate state from Prisma + run rules + persist drafts as
 * Recommendation rows. Returns the persisted rows (with ids).
 */
export async function runEngine(
  input: RunEngineInput,
): Promise<{ drafts: RecommendationDraft[]; state: EngineState }> {
  const today = input.today ?? new Date();
  const state = await hydrateState(input, today);
  const drafts = applyRules(state);
  return { drafts, state };
}

/**
 * Persist drafts as Recommendation rows. Separated from `runEngine`
 * so callers can choose to compute-without-persist (e.g. preview /
 * refresh-without-CheckIn).
 */
export async function persistRecommendations(
  prisma: PrismaClient,
  userId: string,
  programId: string | null,
  checkInId: string | null,
  drafts: RecommendationDraft[],
): Promise<Array<{ id: string }>> {
  const out: Array<{ id: string }> = [];
  for (const draft of drafts) {
    const row = await prisma.recommendation.create({
      data: {
        userId,
        programId,
        goalId: draft.goalId ?? null,
        checkInId,
        kind: draft.kind,
        severity: draft.severity,
        title: draft.title,
        body: draft.body,
        suggestedField: draft.suggestedField ?? null,
        suggestedValue: draft.suggestedValue ?? null,
        snapshotData: (draft.snapshotData ?? null) as never,
      },
      select: { id: true },
    });
    out.push(row);
  }
  return out;
}

/** Mark every prior `pending` recommendation for the user as
 *  `expired` before inserting fresh ones. Keeps the dashboard pulse
 *  clean: only the latest engine run's pending rows surface. */
export async function expirePriorPending(
  prisma: PrismaClient,
  userId: string,
  programId: string | null,
): Promise<void> {
  await prisma.recommendation.updateMany({
    where: {
      userId,
      ...(programId ? { programId } : {}),
      status: "pending",
    },
    data: {
      status: "expired",
      resolvedAt: new Date(),
    },
  });
}

/* ─── Hydration ─────────────────────────────────────────────── */

async function hydrateState(input: RunEngineInput, today: Date): Promise<EngineState> {
  const { userId, programId, prisma, checkInId } = input;
  // Fetch active goals (programId-scoped + user-wide).
  const goalsRaw = await prisma.goal.findMany({
    where: {
      userId,
      status: "active",
      ...(programId ? { OR: [{ programId }, { programId: null }] } : {}),
    },
    select: {
      id: true,
      type: true,
      title: true,
      metric: true,
      startValue: true,
      targetValue: true,
      targetUnit: true,
      targetDate: true,
      createdAt: true,
    },
  });

  // Fetch body-metric history (for body-weight goals).
  const bodyMetrics = await prisma.bodyMetric.findMany({
    where: { userId, weight: { not: null } },
    orderBy: { date: "asc" },
    select: { date: true, weight: true },
  });
  const bodyHistory: MetricPoint[] = bodyMetrics.map((b) => ({
    date: b.date.toISOString().slice(0, 10),
    value: Number(b.weight),
  }));

  // Build per-goal snapshots.
  const goals: GoalSnapshot[] = [];
  for (const g of goalsRaw) {
    if (g.startValue == null || g.targetValue == null || !g.targetDate) continue;
    const startValue = Number(g.startValue);
    const targetValue = Number(g.targetValue);
    const startDate = g.createdAt.toISOString().slice(0, 10);
    const targetDate = g.targetDate.toISOString().slice(0, 10);
    const kind = g.type as GoalKind;

    // History: body-weight for weight goals; e1RM for strength goals.
    let history: MetricPoint[] = [];
    if (kind === "weight" || kind === "bodyweight") {
      history = bodyHistory;
    } else if ((kind === "strength" || kind === "powerlifting") && g.metric) {
      // Pull every Set for the linked exerciseId; fold to per-day best e1RM.
      const sets = await prisma.set.findMany({
        where: {
          workoutExercise: { exerciseId: g.metric, workout: { userId } },
          weight: { not: null },
          reps: { not: null },
          isWarmup: false,
        },
        select: {
          weight: true,
          reps: true,
          workoutExercise: { select: { workout: { select: { date: true } } } },
        },
      });
      const flat = sets
        .filter((s) => s.weight != null && s.reps != null)
        .map((s) => ({
          date: s.workoutExercise.workout.date.toISOString().slice(0, 10),
          weight: Number(s.weight),
          reps: s.reps as number,
        }));
      history = setsToE1RMSeries(flat);
    }

    const series = buildDailySeries({
      kind,
      startValue,
      targetValue,
      startDate,
      targetDate,
      today,
      history,
    });

    const feasibility = feasibilityBand({
      kind,
      startValue,
      targetValue,
      startDate,
      targetDate,
    });

    const currentValue =
      series.daily.length > 0
        ? series.rolling7[series.rolling7.length - 1] ?? series.daily[series.daily.length - 1]
        : null;

    goals.push({
      goalId: g.id,
      goalTitle: g.title,
      kind,
      unit: g.targetUnit,
      startValue,
      targetValue,
      startDate,
      targetDate,
      currentValue,
      series,
      feasibility,
    });
  }

  // Fetch adherence — scheduled vs completed lifting sessions in past 7 days.
  const sevenDaysAgo = new Date(today.getTime() - 7 * 86400000);
  let scheduled7d = 0;
  let completed7d = 0;
  if (programId) {
    const activeBlock = await prisma.block.findFirst({
      where: { programId, status: "active" },
      include: { days: { where: { dayType: "lifting" }, select: { id: true } } },
    });
    if (activeBlock) {
      // 7 days × (lifting days/week / 7) ≈ activeBlock.days.length lifting
      // sessions scheduled per week. Use that as scheduled7d.
      scheduled7d = activeBlock.days.length;
      const completedWorkouts = await prisma.workout.count({
        where: {
          userId,
          blockId: activeBlock.id,
          endTime: { not: null },
          date: { gte: sevenDaysAgo, lte: today },
        },
      });
      completed7d = completedWorkouts;
    }
  }
  const adherence = {
    scheduled7d,
    completed7d,
    ratio: scheduled7d > 0 ? completed7d / scheduled7d : 0,
  };

  // R9 — lifestyle snapshot. Build one entry per LifestyleTarget the
  // user has set (program-scoped + user-wide), populated with the
  // last 7 days of LifestyleLog rows. Variables not in the registry
  // are skipped so the rule modules don't have to defend against
  // unknown keys.
  const lifestyle = await hydrateLifestyle(prisma, userId, programId, today);

  // R10 — last 21 days of fired Recommendation rows feed
  // adherence_low_streak (and any future cross-week rule).
  const recentRecommendations = await hydrateRecentRecommendations(
    prisma,
    userId,
    programId,
    today,
  );

  // R11 — gameplanKind + nextBlock + deficit slices feed refeed_due
  // and deload_shift. Skipped when no programId.
  const { gameplanKind, nextBlock, deficit } = await hydrateGameplanContext(
    prisma,
    userId,
    programId,
    today,
  );

  return {
    userId,
    programId,
    gameplanKind,
    goals,
    adherence,
    lifestyle,
    recentRecommendations,
    nextBlock,
    deficit,
    checkInId: checkInId ?? null,
    today,
  };
}

/**
 * R10 — fetch the last 21 days of Recommendation rows for the user
 * (program-scoped when present). Returns plain `{ kind, createdAt }`
 * objects so rules stay decoupled from Prisma.
 */
async function hydrateRecentRecommendations(
  prisma: PrismaClient,
  userId: string,
  programId: string | null,
  today: Date,
): Promise<RecentRecommendation[]> {
  const cutoff = new Date(today.getTime() - 21 * 86400000);
  try {
    const rows = await prisma.recommendation.findMany({
      where: {
        userId,
        ...(programId ? { programId } : {}),
        createdAt: { gte: cutoff },
      },
      orderBy: { createdAt: "desc" },
      select: { kind: true, createdAt: true },
      take: 50,
    });
    return rows.map((r) => ({
      kind: r.kind as RecommendationKind,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch {
    // Table may not exist yet on first deploy.
    return [];
  }
}

/**
 * Build the engine's lifestyle slice. Reads LifestyleTarget rows
 * (program-scoped or user-wide) + the last 7 days of LifestyleLog
 * rows for those keys, then folds each (target, log[]) pair into a
 * LifestyleSnapshot the rule modules can iterate over.
 */
async function hydrateLifestyle(
  prisma: PrismaClient,
  userId: string,
  programId: string | null,
  today: Date,
): Promise<LifestyleSnapshot[]> {
  const sevenDaysAgo = new Date(today.getTime() - 6 * 86400000);
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);
  const todayMidnight = new Date(today);
  todayMidnight.setUTCHours(23, 59, 59, 999);

  const targets = await prisma.lifestyleTarget.findMany({
    where: {
      userId,
      ...(programId ? { OR: [{ programId }, { programId: null }] } : {}),
    },
    select: { key: true, value: true, unit: true, comparator: true },
  });
  if (targets.length === 0) return [];

  const trackedKeys = targets.map((t) => t.key);
  const logs = await prisma.lifestyleLog.findMany({
    where: {
      userId,
      variableKey: { in: trackedKeys },
      date: { gte: sevenDaysAgo, lte: todayMidnight },
    },
    orderBy: { date: "asc" },
    select: { date: true, variableKey: true, numValue: true, textValue: true },
  });

  const logsByKey = new Map<string, LifestyleLogPoint[]>();
  for (const l of logs) {
    const variable = lifestyleVariable(l.variableKey);
    if (!variable) continue;
    const value = logValueAsNumber(variable, l.numValue, l.textValue);
    const arr = logsByKey.get(l.variableKey) ?? [];
    arr.push({
      date: l.date.toISOString().slice(0, 10),
      value,
      textValue: l.textValue,
    });
    logsByKey.set(l.variableKey, arr);
  }

  const out: LifestyleSnapshot[] = [];
  for (const t of targets) {
    const variable = lifestyleVariable(t.key);
    if (!variable) continue;
    const cmp = (t.comparator === "gte" || t.comparator === "lte" || t.comparator === "eq")
      ? t.comparator
      : variable.defaultComparator;
    out.push({
      key: t.key,
      display: variable.display,
      targetValue: t.value,
      comparator: cmp,
      unit: t.unit,
      points: logsByKey.get(t.key) ?? [],
      cadence: variable.targetCadence,
    });
  }
  return out;
}

/**
 * R11 — fetch the program's gameplanKind, the next upcoming block's
 * phase + start (for deload_shift), and the active calorie target /
 * maintenance / last-refeed-end window (for refeed_due).
 *
 * Returns null/empty slices when there's no program; the rules
 * defend against that and just don't fire.
 */
async function hydrateGameplanContext(
  prisma: PrismaClient,
  userId: string,
  programId: string | null,
  today: Date,
): Promise<{
  gameplanKind: string | null;
  nextBlock: NextBlockSlice | null;
  deficit: DeficitSlice;
}> {
  const emptyDeficit: DeficitSlice = {
    caloriesPerDay: null,
    maintenanceCalories: null,
    daysSinceLastRefeed: null,
  };
  if (!programId) {
    return { gameplanKind: null, nextBlock: null, deficit: emptyDeficit };
  }

  const [program, user, nutritionTarget, activeBlock, upcomingBlock] = await Promise.all([
    prisma.program.findFirst({
      where: { id: programId, userId },
      select: { gameplanKind: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { maintenanceCalories: true },
    }),
    prisma.nutritionTarget.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: "desc" },
      select: { calories: true },
    }),
    prisma.block.findFirst({
      where: { programId, status: "active" },
      select: {
        id: true,
        startDate: true,
        durationWeeks: true,
        refeedWeeks: true,
      },
    }),
    prisma.block.findFirst({
      where: { programId, status: "upcoming" },
      orderBy: { blockNumber: "asc" },
      select: { phase: true, startDate: true },
    }),
  ]);

  const gameplanKind = program?.gameplanKind ?? null;

  const nextBlock: NextBlockSlice | null = upcomingBlock
    ? {
        phase: upcomingBlock.phase,
        startDate: upcomingBlock.startDate
          ? upcomingBlock.startDate.toISOString().slice(0, 10)
          : null,
      }
    : null;

  const deficit: DeficitSlice = {
    caloriesPerDay: nutritionTarget?.calories != null ? Number(nutritionTarget.calories) : null,
    maintenanceCalories: user?.maintenanceCalories ?? null,
    daysSinceLastRefeed: computeDaysSinceLastRefeed(activeBlock, today),
  };

  return { gameplanKind, nextBlock, deficit };
}

/**
 * Walk the active block's refeedWeeks (1-indexed) and find the most
 * recent week-end that's already passed. Returns days since that
 * end-of-week, or null when no refeeds were scheduled.
 */
function computeDaysSinceLastRefeed(
  activeBlock: {
    startDate: Date | null;
    durationWeeks: number | null;
    refeedWeeks: number[];
  } | null,
  today: Date,
): number | null {
  if (!activeBlock || !activeBlock.startDate) return null;
  if (!activeBlock.refeedWeeks || activeBlock.refeedWeeks.length === 0) return null;
  const startMs = activeBlock.startDate.getTime();
  const todayMs = today.getTime();
  let mostRecentEndMs: number | null = null;
  for (const w of activeBlock.refeedWeeks) {
    // Refeed week N runs from start + (N-1)*7 days through start + N*7 days.
    const endMs = startMs + w * 7 * 86400000;
    if (endMs <= todayMs && (mostRecentEndMs == null || endMs > mostRecentEndMs)) {
      mostRecentEndMs = endMs;
    }
  }
  // No refeed week has ended yet — compare against block start so
  // the rule can still fire when the user is 4+ weeks in without
  // the schedule's first refeed having landed.
  if (mostRecentEndMs == null) {
    const days = Math.floor((todayMs - startMs) / 86400000);
    return days >= 0 ? days : null;
  }
  return Math.floor((todayMs - mostRecentEndMs) / 86400000);
}
