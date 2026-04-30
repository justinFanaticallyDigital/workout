import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { runEngine, persistRecommendations, expirePriorPending } from "@/lib/goal-engine";

export const dynamic = "force-dynamic";

/**
 * R8 — POST /api/recommendations/refresh
 *
 * Manually trigger a Goal Engine run between scheduled check-ins.
 * Useful for Settings ("re-evaluate now") or when the user makes a
 * significant Planning Mode change and wants the engine to react.
 *
 * Behavior:
 *   1. Expire prior pending recommendations for this (user, program).
 *   2. Run the engine fresh (no checkInId — these are off-cycle drafts).
 *   3. Persist drafts; return the new rows.
 */
export async function POST(request: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (errorRes) return errorRes;

  let body: { programId?: string | null };
  try {
    body = await request.json().catch(() => ({}));
  } catch {
    body = {};
  }

  // Find the active program when none specified.
  let programId = body.programId ?? null;
  if (!programId) {
    const active = await prisma.program.findFirst({
      where: { userId, status: "active" },
      select: { id: true },
    });
    programId = active?.id ?? null;
  }

  await expirePriorPending(prisma, userId, programId);

  const { drafts, state } = await runEngine({
    userId,
    programId,
    prisma,
    today: new Date(),
  });
  void state;

  const persisted = await persistRecommendations(prisma, userId, programId, null, drafts);
  // Re-fetch full rows so the client gets timestamps + ids.
  const recs = await prisma.recommendation.findMany({
    where: { id: { in: persisted.map((r) => r.id) } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ recommendations: recs });
}
