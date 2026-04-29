import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/profile
 *   Returns the signed-in user's profile fields (currently just
 *   `maintenanceCalories` — added in R6 for the picker NutritionCard
 *   delta-vs-maintenance read).
 *
 * PATCH /api/profile
 *   Updates the signed-in user's profile fields. Currently accepts
 *   `maintenanceCalories: number | null`.
 */
export async function GET() {
  const [userId, errorRes] = await requireAuth();
  if (errorRes) return errorRes;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, maintenanceCalories: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (errorRes) return errorRes;

  let body: { maintenanceCalories?: number | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate maintenanceCalories — null clears, integer 0..10000 accepts.
  if (body.maintenanceCalories !== undefined && body.maintenanceCalories !== null) {
    const n = Number(body.maintenanceCalories);
    if (!Number.isInteger(n) || n < 0 || n > 10000) {
      return NextResponse.json(
        { error: "maintenanceCalories must be an integer 0..10000 or null" },
        { status: 400 },
      );
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(body.maintenanceCalories !== undefined && {
        maintenanceCalories: body.maintenanceCalories,
      }),
    },
    select: { id: true, name: true, email: true, maintenanceCalories: true },
  });

  return NextResponse.json(user);
}
