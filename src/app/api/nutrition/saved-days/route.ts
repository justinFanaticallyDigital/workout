import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { SAVED_DAY_INCLUDE, normalizeSlots, overrideData } from "@/lib/api/saved-days";

export const dynamic = "force-dynamic";

/** GET /api/nutrition/saved-days — My Days with slots → meals → items, and the plan each belongs to. */

export async function GET() {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const days = await prisma.savedDay.findMany({ where: { userId }, include: SAVED_DAY_INCLUDE, orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ days });
}

/**

 * POST /api/nutrition/saved-days

 * { name, calories?, protein?, carbs?, fat?, slots?: [{ label?, mealId? }], slotCount? }

 * `slotCount` (no `slots`) creates that many empty slots.

 */

export async function POST(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  let slots = body.slots !== undefined ? normalizeSlots(body.slots) : null;
  if (body.slots !== undefined && !slots) return NextResponse.json({ error: "slots must be [{ label?, mealId? }]" }, { status: 400 });
  if (!slots) {
    const n = Math.min(8, Math.max(0, Number(body.slotCount ?? 3) || 0));
    slots = Array.from({ length: n }, () => ({ label: null, mealId: null }));
  }

  const day = await prisma.savedDay.create({
    data: {
      userId,
      name,
      ...overrideData(body),
      slots: { create: slots.map((s, i) => ({ ...s, sortOrder: i })) },
    },
    include: SAVED_DAY_INCLUDE,
  });
  return NextResponse.json(day, { status: 201 });
}
