"use client";

/**
 * Nutrition pillar — tier-branched (MIGRATION_MAP §1.2).
 *
 * Logger tier → the new local Nutrition pillar (Cluster 2, local-only).
 * Program/Gameplan tiers → the existing DB-backed food diary (preserved as
 * _legacy until its Model-Day/Week layers are rebuilt in Cluster 3).
 */
import { useTier } from "@/providers/TierProvider";
import LegacyNutritionPage from "./_legacy";
import NutritionLoggerPillar from "./_logger-pillar";

export default function NutritionPage() {
  const { tier } = useTier();
  return tier === "logger" ? <NutritionLoggerPillar /> : <LegacyNutritionPage />;
}
