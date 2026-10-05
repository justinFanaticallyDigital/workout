import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { SAVED_DAY_INCLUDE, normalizeSlots, overrideData } from "@/lib/api/saved-days";

export const dynamic = "force-dynamic";

async function own(userId: string, id: string) {
  return prisma.savedDay.findFirst({ where: { id, userId }, select: { id: true } });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;
  const day = await prisma.savedDay.findFirst({ where: { id, userId }, include: SAVED_DAY_INCLUDE });
  if (!day) return NextResponse.json({ error: "Day not found" }, { status: 404 });
  return NextResponse.json(day);
}

/**
 * PATCH — name, target override (send null to clear), `slots` replaces the list.
 * Switching Override → Default = PATCH { calories: null, protein: null, carbs: null, fat: null }.
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;
  if (!(await own(userId, id))) return NextResponse.json({ error: "Day not found" }, { status: 404 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const slots = body.slots !== undefined ? normalizeSlots(body.slots) : undefined;
  if (body.slots !== undefined && !slots) return NextResponse.json({ error: "slots must be [{ label?, mealId? }]" }, { status: 400 });
  if (body.name !== undefined && !String(body.name).trim()) return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });

  const day = await prisma.savedDay.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: String(body.name).trim() }),
      ...overrideData(body),
      ...(slots && { slots: { deleteMany: {}, create: slots.map((s, i) => ({ ...s, sortOrder: i })) } }),
    },
    include: SAVED_DAY_INCLUDE,
  });
  return NextResponse.json(day);
}

/** DELETE — plan rows that referenced it lose the reference (savedDayId → null). */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;
  if (!(await own(userId, id))) return NextResponse.json({ error: "Day not found" }, { status: 404 });
  await prisma.savedDay.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
