import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";
import ScanScreen from "./_components/ScanScreen";

export const dynamic = "force-dynamic";

/** Label scan — camera viewfinder (dark). ?mealId=&role=&back= say which slot the saved food fills. */
export default async function ScanPage({ searchParams }: { searchParams: Promise<{ mealId?: string; role?: string; back?: string }> }) {
  const userId = await getAuthUserId();
  if (!userId) redirect("/signin");
  const { mealId, role, back } = await searchParams;
  const meal = mealId ? await prisma.savedMeal.findFirst({ where: { id: mealId, userId }, select: { id: true, name: true } }) : null;
  const safeBack = back && back.startsWith("/") && !back.startsWith("//") ? back : meal ? `/nutrition/meals/${meal.id}` : "/nutrition/foods";
  return <ScanScreen mealId={meal?.id ?? null} mealName={meal?.name ?? null} role={role ?? null} back={safeBack} />;
}
