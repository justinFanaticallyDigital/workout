import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

// One-time migration to add new columns. DELETE THIS FILE after running.
export async function POST() {
  await requireAuthUserId(); // must be logged in

  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const results: string[] = [];

  const migrations = [
    // Goal: add programId, priority, metric, startValue
    `ALTER TABLE goals ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES programs(id) ON DELETE SET NULL`,
    `ALTER TABLE goals ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'primary'`,
    `ALTER TABLE goals ADD COLUMN IF NOT EXISTS metric TEXT`,
    `ALTER TABLE goals ADD COLUMN IF NOT EXISTS start_value NUMERIC`,
    `CREATE INDEX IF NOT EXISTS goals_program_id_idx ON goals(program_id)`,

    // Block: add phase
    `ALTER TABLE blocks ADD COLUMN IF NOT EXISTS phase TEXT`,

    // ProgramBenchmark: add blockId
    `ALTER TABLE program_benchmarks ADD COLUMN IF NOT EXISTS block_id UUID REFERENCES blocks(id) ON DELETE SET NULL`,
    `CREATE INDEX IF NOT EXISTS program_benchmarks_block_id_idx ON program_benchmarks(block_id)`,
  ];

  for (const sql of migrations) {
    try {
      await prisma.$executeRawUnsafe(sql);
      results.push(`OK: ${sql.substring(0, 60)}...`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push(`ERR: ${sql.substring(0, 60)}... → ${msg}`);
    }
  }

  return NextResponse.json({ results });
}
