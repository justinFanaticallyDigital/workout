import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";
import { SAVED_MEAL_INCLUDE } from "@/lib/api/saved-meals";
import { toMealView, toTemplateView } from "@/lib/nutrition-view";
import MealBuilder from "./_components/MealBuilder";

export const dynamic = "force-dynamic";

/** Meal Builder — frame tiles or a free ingredient list, search, scan, sticky totals. */
export default async function MealBuilderPage({ params, searchParams }: { params: Promise<{ mealId: string }>; searchParams: Promise<{ back?: string }> }) {
  const userId = await getAuthUserId();
  if (!userId) redirect("/signin");
  const { mealId } = await params;
  const { back } = await searchParams;

  const [meal, templates] = await Promise.all([
    prisma.savedMeal.findFirst({ where: { id: mealId, userId }, include: SAVED_MEAL_INCLUDE }),
    prisma.mealTemplate.findMany({ include: { slots: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } }),
  ]);
  if (!meal) notFound();

  // Only same-origin paths are honoured as a return target.
  const backHref = back && back.startsWith("/") && !back.startsWith("//") ? back : "/nutrition/meals";
  const backLabel = backHref.startsWith("/nutrition/days/") ? "Day" : backHref === "/nutrition" ? "Nutrition" : "My Meals";

  return <MealBuilder meal={toMealView(meal)} templates={templates.map(toTemplateView)} backHref={backHref} backLabel={backLabel} />;
}
