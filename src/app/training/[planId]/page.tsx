import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";
import { DAY_EXERCISE_SELECT, mapPlan } from "@/lib/training";
import PlanEditor from "./_components/PlanEditor";

export const dynamic = "force-dynamic";

/** Plan editor — the one creation and editing path. */
export default async function PlanEditorPage({ params, searchParams }: { params: Promise<{ planId: string }>; searchParams: Promise<{ day?: string }> }) {
  const userId = await getAuthUserId();
  if (!userId) redirect("/signin");
  const { planId } = await params;
  const { day } = await searchParams;

  const program = await prisma.program.findFirst({
    where: { id: planId, userId },
    include: {
      blocks: {
        orderBy: { blockNumber: "asc" },
        include: { days: { orderBy: { sortOrder: "asc" }, include: { exercises: { orderBy: { sortOrder: "asc" }, select: DAY_EXERCISE_SELECT } } } },
      },
    },
  });
  if (!program) notFound();

  return <PlanEditor plan={mapPlan(program)} initialDayId={day ?? null} />;
}
