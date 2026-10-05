import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";
import { PLAN_INCLUDE } from "@/lib/api/nutrition-plans";
import { foodMacros, num, roundMacros, sumMacros, type Macros } from "@/lib/nutrition-math";
import { toPlanDayViews } from "@/lib/nutrition-view";
import NutritionHome, { type PlanView } from "./_components/NutritionHome";

export const dynamic = "force-dynamic";

/**
 * Nutrition tab — Targets card, the library grid (My Days · My Meals · Diary ·
 * Foods) and one section per active plan with its days as accordions.
 */
export default async function NutritionPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/signin");

  const today = new Date().toISOString().slice(0, 10);
  const [target, dayCount, mealCount, foodCount, todayMeals, plans, archivedCount] = await Promise.all([
    prisma.nutritionTarget.findFirst({ where: { userId, isActive: true, blockId: null, goalId: null }, orderBy: { createdAt: "desc" } }),
    prisma.savedDay.count({ where: { userId } }),
    prisma.savedMeal.count({ where: { userId } }),
    prisma.foodItem.count({ where: { OR: [{ userId }, { userId: null }] } }),
    prisma.meal.findMany({ where: { userId, date: new Date(today) }, include: { items: { include: { foodItem: true } } } }),
    prisma.mealPlan.findMany({ where: { userId, isActive: true }, include: PLAN_INCLUDE, orderBy: { createdAt: "desc" } }),
    prisma.mealPlan.count({ where: { userId, isActive: false } }),
  ]);

  const defaults: Macros | null = target ? { calories: num(target.calories), protein: num(target.protein), carbs: num(target.carbs), fat: num(target.fat) } : null;
  const todayMacros = roundMacros(sumMacros(todayMeals.flatMap((m) => m.items.map((it) => foodMacros(it.foodItem, it.quantity)))));

  const planViews: PlanView[] = plans.map((p) => ({
    id: p.id,
    name: p.name,
    days: toPlanDayViews(p.planDays),
  }));

  return (
    <NutritionHome
      defaults={defaults}
      counts={{ days: dayCount, meals: mealCount, foods: foodCount }}
      todayKcal={todayMacros.calories}
      plans={planViews}
      archivedCount={archivedCount}
    />
  );
}
