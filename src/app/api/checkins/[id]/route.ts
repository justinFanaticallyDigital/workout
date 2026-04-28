import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, errorRes] = await requireAuth();
  if (!userId) return errorRes!;
  const { id } = await params;

  const checkIn = await prisma.checkIn.findFirst({ where: { id, userId } });
  if (!checkIn) {
    return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
  }
  return NextResponse.json({ checkIn });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, errorRes] = await requireAuth();
  if (!userId) return errorRes!;
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  // Verify ownership before applying update
  const existing = await prisma.checkIn.findFirst({ where: { id, userId } });
  if (!existing) {
    return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if ("weekNumber" in body) data.weekNumber = numOrNull(body.weekNumber);
  if ("blockId" in body) data.blockId = typeof body.blockId === "string" ? body.blockId : null;
  if ("energy" in body) data.energy = rating(body.energy);
  if ("sleepQuality" in body) data.sleepQuality = rating(body.sleepQuality);
  if ("soreness" in body) data.soreness = rating(body.soreness);
  if ("stress" in body) data.stress = rating(body.stress);
  if ("motivation" in body) data.motivation = rating(body.motivation);
  if ("liftAdherence" in body) data.liftAdherence = percent(body.liftAdherence);
  if ("cardioAdherence" in body) data.cardioAdherence = percent(body.cardioAdherence);
  if ("nutritionAdherence" in body) data.nutritionAdherence = percent(body.nutritionAdherence);
  if ("wins" in body) data.wins = strOrNull(body.wins);
  if ("struggles" in body) data.struggles = strOrNull(body.struggles);
  if ("notes" in body) data.notes = strOrNull(body.notes);

  const checkIn = await prisma.checkIn.update({ where: { id }, data });
  return NextResponse.json({ checkIn });
}

function rating(v: unknown): number | null {
  const n = numOrNull(v);
  if (n === null) return null;
  return n < 1 || n > 5 ? null : Math.round(n);
}

function percent(v: unknown): number | null {
  const n = numOrNull(v);
  if (n === null) return null;
  return n < 0 || n > 100 ? null : Math.round(n);
}

function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function strOrNull(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length === 0 ? null : trimmed;
}
