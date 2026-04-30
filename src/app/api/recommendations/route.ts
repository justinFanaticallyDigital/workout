import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import type { RecommendationStatus } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

/**
 * R8 — GET /api/recommendations?status=pending&programId=...
 *
 * Lists Goal Engine recommendations for the signed-in user.
 * Default `status=pending` keeps the dashboard pulse focused on
 * un-acted recommendations; pass `status=any` to get the full feed.
 */
export async function GET(req: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (errorRes) return errorRes;

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status") ?? "pending";
  const programId = searchParams.get("programId");
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10) || 10));

  const status = statusParam === "any" ? undefined : (statusParam as RecommendationStatus);

  try {
    const recs = await prisma.recommendation.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
        ...(programId ? { programId } : {}),
      },
      orderBy: [{ createdAt: "desc" }],
      take: limit,
    });
    return NextResponse.json({ recommendations: recs });
  } catch {
    // Table may not exist yet — degrade gracefully so the dashboard
    // doesn't crash on first deploy before `prisma db push` lands.
    return NextResponse.json({ recommendations: [] }, { status: 200 });
  }
}
