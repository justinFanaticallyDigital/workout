import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { SAVED_MEAL_INCLUDE, normalizeItems, normalizeMealType } from "@/lib/api/saved-meals";

export const dynamic = "force-dynamic";

async function own(userId: string, id: string) {
  return prisma.savedMeal.findFirst({ where: { id, userId }, select: { id: true } });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;
  const meal = await prisma.savedMeal.findFirst({ where: { id, userId }, include: SAVED_MEAL_INCLUDE });
  if (!meal) return NextResponse.json({ error: "Meal not found" }, { status: 404 });
  return NextResponse.json(meal);
}

/** PATCH — name / mealType / templateId / notes; `items` replaces the whole list. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;
  if (!(await own(userId, id))) return NextResponse.json({ error: "Meal not found" }, { status: 404 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const items = body.items !== undefined ? normalizeItems(body.items) : undefined;
  if (body.items !== undefined && !items) return NextResponse.json({ error: "items must be [{ foodItemId, quantity, role? }]" }, { status: 400 });
  const mealType = normalizeMealType(body.mealType);
  if (mealType === undefined && body.mealType !== undefined) return NextResponse.json({ error: "Invalid mealType" }, { status: 400 });
  if (body.name !== undefined && !String(body.name).trim()) return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });

  const meal = await prisma.savedMeal.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: String(body.name).trim() }),
      ...(mealType !== undefined && { mealType }),
      ...(body.templateId !== undefined && { templateId: body.templateId ? String(body.templateId) : null }),
      ...(body.notes !== undefined && { notes: body.notes ? String(body.notes).trim() : null }),
      ...(items && { items: { deleteMany: {}, create: items.map((it, i) => ({ ...it, sortOrder: i })) } }),
    },
    include: SAVED_MEAL_INCLUDE,
  });
  return NextResponse.json(meal);
}

/** DELETE — day slots that used it are emptied (mealId → null), not removed. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;
  if (!(await own(userId, id))) return NextResponse.json({ error: "Meal not found" }, { status: 404 });
  await prisma.savedMeal.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
