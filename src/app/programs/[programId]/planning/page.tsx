"use client";

/**
 * 3.5 — Planning Mode (Program tier) · /programs/[programId]/planning.
 *
 * The Program-tier entry point into the shared Planning Mode sandbox. It
 * renders the same PlanningExperience as the Gameplan route; the global tier
 * (program) drives the refactor branch (MIGRATION_MAP §C3): no check-in audit
 * layer, no recommendation banner / recent-changes panel / gameplan-kind
 * editor / Lifestyle tab, and Apply / Discard route home to /my-program.
 */
import { PlanningExperience } from "@/app/gameplan/[id]/planning/_components/PlanningExperience";

export const dynamic = "force-dynamic";

export default function ProgramPlanningPage({ params }: { params: { programId: string } }) {
  return <PlanningExperience programId={params.programId} />;
}
