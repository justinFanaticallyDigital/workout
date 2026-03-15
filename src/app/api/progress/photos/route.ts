import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await requireAuthUserId();

  const photos = await prisma.progressPhoto.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({
    photos: photos.map((p) => ({
      id: p.id,
      date: p.date.toISOString().split("T")[0],
      url: p.imageUrl,
      poseType: p.poseType,
      notes: p.notes,
      programId: p.programId,
    })),
  });
}

export async function POST(request: NextRequest) {
  const userId = await requireAuthUserId();
  const body = await request.json();

  const photo = await prisma.progressPhoto.create({
    data: {
      userId,
      date: new Date(body.date ?? new Date()),
      imageUrl: body.url ?? body.imageUrl,
      poseType: body.poseType ?? "front",
      notes: body.notes ?? null,
      programId: body.programId ?? null,
    },
  });

  return NextResponse.json(
    {
      id: photo.id,
      date: photo.date.toISOString().split("T")[0],
      url: photo.imageUrl,
      poseType: photo.poseType,
    },
    { status: 201 }
  );
}
