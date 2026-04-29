import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/lifestyle-targets?programId=<uuid>
 *   Returns the signed-in user's lifestyle targets, optionally
 *   scoped to a specific program. Drives the /gameplan/new picker
 *   LifestylePicksCard and the /gameplan dashboard SleepCard /
 *   StressCard / ProteinHitCard target bands.
 *
 * POST /api/lifestyle-targets
 *   Upsert by (userId, programId, key). Body:
 *     { programId?: string, key: string, value: number, unit: string,
 *       comparator: "gte"|"lte"|"eq" }
 */
export async function GET(req: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (errorRes) return errorRes;

  try {
    const { searchParams } = new URL(req.url);
    const programId = searchParams.get("programId");

    const targets = await prisma.lifestyleTarget.findMany({
      where: {
        userId,
        ...(programId ? { programId } : {}),
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(targets);
  } catch {
    // Table may not exist yet — degrade gracefully so the dashboard
    // doesn't crash on first deploy before `prisma db push` lands.
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (errorRes) return errorRes;

  let body: {
    programId?: string | null;
    key?: string;
    value?: number;
    unit?: string;
    comparator?: "gte" | "lte" | "eq";
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.key?.trim()) {
    return NextResponse.json({ error: "key is required" }, { status: 400 });
  }
  if (typeof body.value !== "number" || !Number.isFinite(body.value)) {
    return NextResponse.json({ error: "value must be a finite number" }, { status: 400 });
  }
  if (!body.unit?.trim()) {
    return NextResponse.json({ error: "unit is required" }, { status: 400 });
  }
  if (body.comparator !== "gte" && body.comparator !== "lte" && body.comparator !== "eq") {
    return NextResponse.json(
      { error: 'comparator must be "gte" | "lte" | "eq"' },
      { status: 400 },
    );
  }

  try {
    // Manual upsert — Prisma's compound-unique findUnique can't take a
    // nullable programId in TS, so we look up + update or create.
    const existing = await prisma.lifestyleTarget.findFirst({
      where: { userId, programId: body.programId ?? null, key: body.key },
      select: { id: true },
    });
    const target = existing
      ? await prisma.lifestyleTarget.update({
          where: { id: existing.id },
          data: {
            value: body.value,
            unit: body.unit,
            comparator: body.comparator,
          },
        })
      : await prisma.lifestyleTarget.create({
          data: {
            userId,
            programId: body.programId ?? null,
            key: body.key,
            value: body.value,
            unit: body.unit,
            comparator: body.comparator,
          },
        });
    return NextResponse.json(target);
  } catch {
    return NextResponse.json(
      { error: "lifestyle_targets table may not exist yet" },
      { status: 500 },
    );
  }
}
