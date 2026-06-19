"use client";

/**
 * Nutrition pillar — tier-branched (MIGRATION_MAP §1.2).
 *
 * Logger tier → the new local Nutrition pillar (Cluster 2, local-only).
 * Program/Gameplan tiers → the program Nutrition pillar (Cluster 3, rail
 * layers, DB-backed). The DB food diary lives at /nutrition/diary.
 */
import { useTier } from "@/providers/TierProvider";
import NutritionLoggerPillar from "./_logger-pillar";
import ProgramNutritionTab from "./_program";

export default function NutritionPage() {
  const { tier } = useTier();
  return tier === "logger" ? <NutritionLoggerPillar /> : <ProgramNutritionTab />;
}
