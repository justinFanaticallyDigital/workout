import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";
import { SAVED_DAY_INCLUDE } from "@/lib/api/saved-days";
import { num, type Macros } from "@/lib/nutrition-math";
import { toDayView } from "@/lib/nutrition-view";
import DayBuilder from "./_components/DayBuilder";

export const dynamic = "force-dynamic";

/** Day Builder — targets (default / override), meal slots, sticky totals. */
export default async function DayBuilderPage({ params, searchParams }: { params: Promise<{ dayId: string }>; searchParams: Promise<{ plan?: string }> }) {
  const userId = await getAuthUserId();
  if (!userId) redirect("/signin");
  const { dayId } = await params;
  const { plan: planParam } = await searchParams;

  const [day, target] = await Promise.all([
    prisma.savedDay.findFirst({ where: { id: dayId, userId }, include: SAVED_DAY_INCLUDE }),
    prisma.nutritionTarget.findFirst({ where: { userId, isActive: true, blockId: null, goalId: null }, orderBy: { createdAt: "desc" } }),
  ]);
  if (!day) notFound();

  const view = toDayView(day);
  let index: number | null = null;
  const planId = planParam ?? view.planId;
  if (planId) {
    const pd = await prisma.mealPlanDay.findFirst({ where: { planId, savedDayId: day.id }, select: { dayNumber: true } });
    index = pd?.dayNumber ?? null;
  }
  const defaults: Macros | null = target ? { calories: num(target.calories), protein: num(target.protein), carbs: num(target.carbs), fat: num(target.fat) } : null;

  return <DayBuilder day={view} index={index} defaults={defaults} backHref={planId ? "/nutrition" : "/nutrition/days"} backLabel={view.planName ?? "My Days"} />;
}
