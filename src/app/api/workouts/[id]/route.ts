import { NextResponse } from "next/server";

// TODO: Connect to database — update workout status (complete, cancel),
// end time, notes, and overall RPE.

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({
    id,
    status: "completed",
    completedAt: new Date().toISOString(),
  });
}
