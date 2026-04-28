import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/checkins?weeks=8
 *   List check-ins for the signed-in user, most recent first.
 *   `weeks` (optional, default 8) clamps the lookback window.
 */
export async function GET(req: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (!userId) return errorRes!;

  const { searchParams } = new URL(req.url);
  const weeks = Math.max(1, Math.min(52, parseInt(searchParams.get("weeks") ?? "8", 10) || 8));
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);

  try {
    const checkIns = await prisma.checkIn.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ checkIns });
  } catch {
    return NextResponse.json({ checkIns: [] }, { status: 200 });
  }
}

/**
 * POST /api/checkins
 *   Upsert a check-in by (userId, date). Body fields are all optional except `date`.
 */
export async function POST(req: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (!userId) return errorRes!;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (!body.date || typeof body.date !== "string") {
    return NextResponse.json({ error: "`date` is required (ISO yyyy-mm-dd)" }, { status: 400 });
  }
  const date = new Date(body.date);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "`date` is invalid" }, { status: 400 });
  }

  const data = {
    weekNumber: numOrNull(body.weekNumber),
    blockId: typeof body.blockId === "string" ? body.blockId : null,
    energy: rating(body.energy),
    sleepQuality: rating(body.sleepQuality),
    soreness: rating(body.soreness),
    stress: rating(body.stress),
    motivation: rating(body.motivation),
    liftAdherence: percent(body.liftAdherence),
    cardioAdherence: percent(body.cardioAdherence),
    nutritionAdherence: percent(body.nutritionAdherence),
    wins: strOrNull(body.wins),
    struggles: strOrNull(body.struggles),
    notes: strOrNull(body.notes),
  };

  try {
    const checkIn = await prisma.checkIn.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, ...data },
      update: data,
    });
    return NextResponse.json({ checkIn }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `failed to save check-in: ${msg}` }, { status: 500 });
  }
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
