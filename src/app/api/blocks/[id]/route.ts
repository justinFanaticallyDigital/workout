import { NextResponse } from "next/server";

// TODO: Connect to database — fetch block detail with day templates
// and prescribed exercises.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({
    id,
    name: "Accumulation",
    weeks: 4,
    days: [
      { id: "day_1", name: "Upper A", order: 1 },
      { id: "day_2", name: "Lower A", order: 2 },
      { id: "day_3", name: "Upper B", order: 3 },
      { id: "day_4", name: "Lower B", order: 4 },
    ],
  });
}
