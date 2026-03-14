import { NextResponse } from "next/server";

// TODO: Connect to database — fetch exercise history including all logged
// sets, PRs, volume trends, and e1RM progression over time.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({
    exerciseId: id,
    history: [
      { date: "2026-03-12", sets: [{ weight: 245, reps: 3, rpe: 9 }], e1rm: 260 },
      { date: "2026-03-05", sets: [{ weight: 235, reps: 4, rpe: 8.5 }], e1rm: 255 },
      { date: "2026-02-26", sets: [{ weight: 230, reps: 5, rpe: 8 }], e1rm: 253 },
    ],
  });
}
