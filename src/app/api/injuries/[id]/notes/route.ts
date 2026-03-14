import { NextResponse } from "next/server";

// TODO: Connect to database — add a follow-up note to an existing injury
// record, tracking pain level changes, rehab exercises, and recovery status.

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json(
    {
      id: "note_1",
      injuryId: id,
      painLevel: 3,
      note: "Feeling better after rest day. Mobility work helping.",
      createdAt: new Date().toISOString(),
    },
    { status: 201 }
  );
}
