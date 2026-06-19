"use client";

import { PlanningExperience } from "./_components/PlanningExperience";

export const dynamic = "force-dynamic";

/**
 * R7 — Planning Mode sandbox at /gameplan/[id]/planning (Gameplan tier).
 *
 * Thin route wrapper around the shared PlanningExperience. The Program-tier
 * entry point is /programs/[programId]/planning (3.5); both render the same
 * sandbox and branch on the global tier. See PlanningExperience for the flow.
 */
export default function PlanningPage({ params }: { params: { id: string } }) {
  return <PlanningExperience programId={params.id} />;
}
