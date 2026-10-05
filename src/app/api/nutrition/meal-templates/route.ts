import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

/** GET /api/nutrition/meal-templates — the archetypes with their slots. */
export async function GET() {
  const [, authError] = await requireAuth();
  if (authError) return authError;
  const templates = await prisma.mealTemplate.findMany({
    include: { slots: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ templates });
}
