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
  EngineState,
  GoalKind,
  GoalSnapshot,
  LifestyleLogPoint,
  LifestyleSnapshot,
  MetricPoint,
  RecommendationDraft,
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

  return {
    userId,
    programId,
    goals,
    adherence,
    lifestyle,
    checkInId: checkInId ?? null,
    today,
  };
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
