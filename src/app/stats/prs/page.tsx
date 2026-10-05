import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";
import { num } from "@/lib/nutrition-math";
import { fmtPr, isBodyweight } from "@/lib/stats";
import PrList, { type PrRowData } from "./_components/PrList";

export const dynamic = "force-dynamic";

/** All PRs — newest first, filterable by type. */
export default async function PrsPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/signin");
  const prs = await prisma.exercisePr.findMany({
    where: { userId },
    orderBy: { achievedAt: "desc" },
    take: 300,
    include: { exercise: { select: { id: true, name: true, equipment: true } }, set: { select: { weight: true, reps: true } } },
  });
  const rows: PrRowData[] = prs.map((pr) => ({
    id: pr.id,
    exerciseId: pr.exercise.id,
    name: pr.exercise.name,
    type: pr.prType,
    value: fmtPr({ prType: pr.prType, value: num(pr.value), repsAtWeight: pr.repsAtWeight, set: pr.set ? { weight: pr.set.weight == null ? null : num(pr.set.weight), reps: pr.set.reps } : null }, isBodyweight(pr.exercise.equipment, pr.exercise.name)),
    date: pr.achievedAt.toISOString(),
  }));
  return <PrList rows={rows} />;
}
