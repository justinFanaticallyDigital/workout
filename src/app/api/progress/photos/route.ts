import { NextResponse } from "next/server";

// TODO: Connect to database and file storage — fetch progress photo
// metadata/URLs, and handle photo uploads with date tagging.

export async function GET() {
  return NextResponse.json({
    photos: [
      { id: "ph_1", date: "2026-01-01", url: "/placeholder/photo1.jpg" },
      { id: "ph_2", date: "2026-02-01", url: "/placeholder/photo2.jpg" },
      { id: "ph_3", date: "2026-03-01", url: "/placeholder/photo3.jpg" },
      { id: "ph_4", date: "2026-03-14", url: "/placeholder/photo4.jpg" },
    ],
  });
}

export async function POST() {
  return NextResponse.json(
    { id: "ph_5", date: "2026-03-14", url: "/placeholder/photo5.jpg" },
    { status: 201 }
  );
}
