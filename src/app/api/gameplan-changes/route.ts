// src/app/api/gameplan-changes/route.ts
// ============================================================================
// R10 — GET /api/gameplan-changes?programId=...&limit=10
//        POST /api/gameplan-changes
//
// GET lists the most recent GameplanChange rows (audit panel input).
//
// POST appends a single row. Used by Planning Mode's apply pipeline
// to log a session-level summary after the diff finishes flushing
// through entity endpoints. Recommendation Apply has its own
// dedicated endpoint at /api/recommendations/[id]/apply that writes
// its own row inline; this POST is for sources without an Apply
// endpoint of their own (PLANNING_MODE / MANUAL_EDIT).
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import type { GameplanChangeSource } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

const VALID_SOURCES: ReadonlySet<GameplanChangeSource> = new Set([
  "CHECK_IN_APPLY",
  "PLANNING_MODE",
  "MANUAL_EDIT",
] as const);

export async function GET(req: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (errorRes) return errorRes;

  const { searchParams } = new URL(req.url);
  const programId = searchParams.get("programId");
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10) || 10));

  try {
    const rows = await prisma.gameplanChange.findMany({
      where: {
        userId,
        ...(programId ? { programId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        field: true,
        oldValue: true,
        newValue: true,
        source: true,
        reason: true,
        recommendationId: true,
        createdAt: true,
      },
    });
    return NextResponse.json({
      changes: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    });
  } catch {
    // Table may not exist yet — degrade gracefully.
    return NextResponse.json({ changes: [] }, { status: 200 });
  }
}

interface PostBody {
  programId?: string | null;
  source?: string;
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
  reason?: string | null;
  recommendationId?: string | null;
}

export async function POST(req: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (errorRes) return errorRes;

  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.field) {
    return NextResponse.json({ error: "field required" }, { status: 400 });
  }
  const sourceUpper = (body.source ?? "PLANNING_MODE").toUpperCase() as GameplanChangeSource;
  const source: GameplanChangeSource = VALID_SOURCES.has(sourceUpper) ? sourceUpper : "PLANNING_MODE";

  const row = await prisma.gameplanChange.create({
    data: {
      userId,
      programId: body.programId ?? null,
      source,
      field: body.field,
      oldValue: (body.oldValue ?? null) as never,
      newValue: (body.newValue ?? null) as never,
      reason: body.reason ?? null,
      recommendationId: body.recommendationId ?? null,
    },
    select: {
      id: true,
      field: true,
      oldValue: true,
      newValue: true,
      source: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    change: { ...row, createdAt: row.createdAt.toISOString() },
  });
}
