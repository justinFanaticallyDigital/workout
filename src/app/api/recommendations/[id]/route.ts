import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import type { RecommendationStatus } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

/**
 * R8 — GET /api/recommendations/[id]
 *
 * Returns a single Recommendation. Used by R7 RecommendationBanner
 * to hydrate from a `?recommendationId=` URL param when a check-in
 * recommendation card deep-links into Planning Mode.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const [userId, errorRes] = await requireAuth();
  if (errorRes) return errorRes;
  const { id } = await params;

  const rec = await prisma.recommendation.findFirst({
    where: { id, userId },
  });
  if (!rec) return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
  return NextResponse.json(rec);
}

/**
 * R8 — PATCH /api/recommendations/[id]
 *
 * Update status (apply / dismiss / expire). Sets `resolvedAt` on
 * status transitions off `pending`.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const [userId, errorRes] = await requireAuth();
  if (errorRes) return errorRes;
  const { id } = await params;

  const existing = await prisma.recommendation.findFirst({
    where: { id, userId },
    select: { id: true, status: true },
  });
  if (!existing) return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });

  let body: { status?: RecommendationStatus; dismissedReason?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validStatuses: RecommendationStatus[] = ["pending", "applied", "dismissed", "expired"];
  if (body.status && !validStatuses.includes(body.status)) {
    return NextResponse.json(
      { error: `status must be one of ${validStatuses.join(", ")}` },
      { status: 400 },
    );
  }

  const movingOffPending =
    existing.status === "pending" && body.status && body.status !== "pending";

  const updated = await prisma.recommendation.update({
    where: { id },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.dismissedReason !== undefined && { dismissedReason: body.dismissedReason }),
      ...(movingOffPending && { resolvedAt: new Date() }),
    },
  });
  return NextResponse.json(updated);
}
