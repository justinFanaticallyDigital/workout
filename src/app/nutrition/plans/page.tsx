import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";
import NutritionPlans from "./_components/NutritionPlans";

export const dynamic = "force-dynamic";

/** Nutrition plans — create, and every plan by state. */
export default async function NutritionPlansPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/signin");
  const plans = await prisma.mealPlan.findMany({
    where: { userId },
    select: { id: true, name: true, isActive: true, createdAt: true, _count: { select: { planDays: true } } },
    orderBy: { createdAt: "desc" },
  });
  return <NutritionPlans plans={plans.map((p) => ({ id: p.id, name: p.name, isActive: p.isActive, days: p._count.planDays, createdAt: p.createdAt.toISOString() }))} />;
}
