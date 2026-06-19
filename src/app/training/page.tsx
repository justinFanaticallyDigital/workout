"use client";

/**
 * Training pillar — tier-branched (MIGRATION_MAP §1.2).
 *
 * Logger tier → the local-first logger training pillar (Cluster 2).
 * Program/Gameplan tiers → the plan-driven program Training tab with rail
 * layers (Today / Block / Program / Gameplan-locked), Cluster 3.
 */
import { useTier } from "@/providers/TierProvider";
import LoggerTrainingPillar from "./_logger";
import ProgramTrainingTab from "./_program";

export default function TrainingPage() {
  const { tier } = useTier();
  return tier === "logger" ? <LoggerTrainingPillar /> : <ProgramTrainingTab />;
}
