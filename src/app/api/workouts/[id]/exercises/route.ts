import { NextResponse } from "next/server";

// TODO: Connect to database — add an exercise entry to an active workout
// session. Links to exercise definition and tracks order.

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json(
    {
      id: "wex_1",
      workoutId: id,
      exerciseId: "ex_1",
      exerciseName: "Bench Press",
      order: 1,
      sets: [],
    },
    { status: 201 }
  );
}
