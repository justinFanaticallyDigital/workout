// src/lib/goal-engine/rules/refeed-due.ts
// ============================================================================
// Refeed due — spec §8.4 (Lean Out gameplan).
//
// Trigger: Program.gameplanKind === "lean_out" AND the user is in a
// sustained calorie deficit (NutritionTarget.calories < User.maintenanceCalories
// minus 100 kcal threshold) AND the most recent scheduled refeed
// week ended ≥4 weeks ago (or no refeed has happened yet and the
// block is past 4 weeks in).
//
// Output: severity info, body suggests scheduling a refeed week.
// `suggestedField` is "nutrition.refeedSchedule" — not in the apply
// dispatcher, so the UI falls back to Open in Planning Mode where
// the refeed cadence editor lives.
// ============================================================================

import type { EngineState, RecommendationDraft } from "../types";

const DEFICIT_THRESHOLD_KCAL = 100;
const REFEED_WINDOW_DAYS = 28;

export function refeedDue(state: EngineState): RecommendationDraft | null {
  if (state.gameplanKind !== "lean_out") return null;

  const { caloriesPerDay, maintenanceCalories, daysSinceLastRefeed } = state.deficit;
  if (caloriesPerDay == null || maintenanceCalories == null) return null;

  const inDeficit = caloriesPerDay < maintenanceCalories - DEFICIT_THRESHOLD_KCAL;
  if (!inDeficit) return null;

  // No refeeds scheduled at all → engine still nudges once the user
  // has been on the plan ≥28 days. daysSinceLastRefeed is null in
  // that case; we treat null as "infinitely long ago" for gating
  // purposes (the hydrator only sets null when the program has any
  // refeed schedule at all but no week has hit yet).
  if (daysSinceLastRefeed != null && daysSinceLastRefeed < REFEED_WINDOW_DAYS) return null;

  const deficitKcal = Math.round(maintenanceCalories - caloriesPerDay);
  const weeksSince =
    daysSinceLastRefeed != null ? Math.floor(daysSinceLastRefeed / 7) : null;

  return {
    kind: "refeed_due",
    severity: "info",
    title: weeksSince != null ? `Refeed due — ${weeksSince}+ weeks since last` : "Refeed due",
    body: [
      `You're running ~${deficitKcal} kcal under maintenance and the calendar's been clean of refeeds for at least 4 weeks.`,
      `Schedule a refeed week to protect leptin / training output before pushing further.`,
    ].join(" "),
    suggestedField: "nutrition.refeedSchedule",
    suggestedValue: JSON.stringify({
      addRefeedWeek: true,
      reason: "lean_out_4w_deficit",
    }),
    snapshotData: {
      gameplanKind: state.gameplanKind,
      caloriesPerDay,
      maintenanceCalories,
      deficitKcal,
      daysSinceLastRefeed,
    },
  };
}
