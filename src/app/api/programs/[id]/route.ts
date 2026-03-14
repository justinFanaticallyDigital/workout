import { NextResponse } from "next/server";

// TODO: Connect to database — fetch full program detail including blocks,
// day templates, and progression rules.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({
    id,
    name: "Upper/Lower Split",
    weeks: 8,
    status: "active",
    blocks: [
      { id: "blk_1", name: "Accumulation", weeks: 4, order: 1 },
      { id: "blk_2", name: "Intensification", weeks: 4, order: 2 },
    ],
  });
}
