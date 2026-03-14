import { NextResponse } from "next/server";

// TODO: Connect to database — log a completed set with weight, reps, RPE.
// Automatically check against PR records and flag new PRs.

export async function POST() {
  return NextResponse.json(
    {
      id: "set_1",
      weight: 225,
      reps: 5,
      rpe: 8,
      isPR: false,
      e1rm: 253,
    },
    { status: 201 }
  );
}
