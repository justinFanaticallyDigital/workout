import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";
import { PLAN_INCLUDE } from "@/lib/api/nutrition-plans";
import { toPlanDayViews } from "@/lib/nutrition-view";
import NutritionPlanEditor from "./_components/NutritionPlanEditor";

export const dynamic = "force-dynamic";

/** Nutrition plan editor — name, active / archived, the ordered days. */
export default async function NutritionPlanPage({ params }: { params: Promise<{ planId: string }> }) {
  const userId = await getAuthUserId();
  if (!userId) redirect("/signin");
  const { planId } = await params;
  const plan = await prisma.mealPlan.findFirst({ where: { id: planId, userId }, include: PLAN_INCLUDE });
  if (!plan) notFound();
  const days = toPlanDayViews(plan.planDays);
  return <NutritionPlanEditor plan={{ id: plan.id, name: plan.name, isActive: plan.isActive }} days={days} />;
}
