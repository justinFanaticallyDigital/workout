import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";
import { SAVED_MEAL_INCLUDE } from "@/lib/api/saved-meals";
import { toMealView } from "@/lib/nutrition-view";
import MyMeals from "./_components/MyMeals";

export const dynamic = "force-dynamic";

/** My Meals — the saved-meal library with meal-type chips and frame coverage. */
export default async function MyMealsPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/signin");
  const meals = await prisma.savedMeal.findMany({ where: { userId }, include: SAVED_MEAL_INCLUDE, orderBy: { updatedAt: "desc" } });
  return <MyMeals meals={meals.map(toMealView)} />;
}
