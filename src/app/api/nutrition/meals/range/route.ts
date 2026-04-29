import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/nutrition/meals/range?from=YYYY-MM-DD&to=YYYY-MM-DD
 *   Returns daily protein totals for the signed-in user across the
 *   range. Drives the /gameplan ProteinHitCard daily-grid roll-up.
 *
 *   Response shape:
 *     {
 *       days: [
 *         { date: "2026-04-01", totalProtein: 145, totalCalories: 2200 },
 *         ...
 *       ]
 *     }
 *
 *   Days with no logged meals are still included with zero totals so
 *   the consumer can render the full grid without separate
 *   has-data/missing logic. Range is clamped to 200 days max.
 */
export async function GET(request: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (errorRes) return errorRes;

  const { searchParams } = new URL(request.url);
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");

  if (!fromStr || !toStr) {
    return NextResponse.json(
      { error: "from and to are required (YYYY-MM-DD)" },
      { status: 400 },
    );
  }

  const from = new Date(fromStr);
  const to = new Date(toStr);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return NextResponse.json({ error: "from/to must be parseable dates" }, { status: 400 });
  }
  if (to < from) {
    return NextResponse.json({ error: "to must be >= from" }, { status: 400 });
  }
  const dayCount = Math.floor((to.getTime() - from.getTime()) / 86400000) + 1;
  if (dayCount > 200) {
    return NextResponse.json({ error: "range cannot exceed 200 days" }, { status: 400 });
  }

  const meals = await prisma.meal.findMany({
    where: { userId, date: { gte: from, lte: to } },
    include: {
      items: {
        include: {
          foodItem: { select: { protein: true, calories: true } },
        },
      },
    },
  });

  // Bucket meals by date string.
  const byDate = new Map<string, { totalProtein: number; totalCalories: number }>();
  for (const meal of meals) {
    const key = meal.date.toISOString().slice(0, 10);
    const acc = byDate.get(key) ?? { totalProtein: 0, totalCalories: 0 };
    for (const item of meal.items) {
      const qty = Number(item.quantity);
      acc.totalProtein += Number(item.foodItem.protein) * qty;
      acc.totalCalories += Number(item.foodItem.calories) * qty;
    }
    byDate.set(key, acc);
  }

  // Fill the date range so consumers don't need to handle gaps.
  const days: { date: string; totalProtein: number; totalCalories: number }[] = [];
  for (let i = 0; i < dayCount; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const v = byDate.get(key);
    days.push({
      date: key,
      totalProtein: Math.round(v?.totalProtein ?? 0),
      totalCalories: Math.round(v?.totalCalories ?? 0),
    });
  }

  return NextResponse.json({ days });
}
