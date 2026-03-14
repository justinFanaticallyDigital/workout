import { NextResponse } from "next/server";

// TODO: Connect to database — add or edit a day template within a block,
// including prescribed exercises, sets, rep ranges, and RPE targets.

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json(
    {
      id: "day_5",
      blockId: id,
      name: "New Day Template",
      order: 5,
      exercises: [],
    },
    { status: 201 }
  );
}
