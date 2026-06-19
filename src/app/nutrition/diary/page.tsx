"use client";

/**
 * /nutrition/diary — the DB-backed food diary (the former /nutrition legacy
 * page). On Program/Gameplan tiers the Nutrition pillar's meal-logging links
 * here so writes stay on the cloud DB (the rollup reads the same source).
 */
import LegacyNutritionPage from "../_legacy";

export default function NutritionDiaryPage() {
  return <LegacyNutritionPage />;
}
