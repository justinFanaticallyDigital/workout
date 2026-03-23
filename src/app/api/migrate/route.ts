import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// One-time migration to add new columns. DELETE THIS FILE after running.
export async function POST() {
  const [, authError] = await requireAuth();
  if (authError) return authError;

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

    // DailyMetric: activity, sleep, HR data from Fitbit
    `CREATE TABLE IF NOT EXISTS daily_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      steps INT,
      active_minutes INT,
      calories_burned INT,
      sleep_minutes INT,
      sleep_deep INT,
      sleep_light INT,
      sleep_rem INT,
      sleep_wake INT,
      resting_hr INT,
      source TEXT NOT NULL DEFAULT 'fitbit',
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, date, source)
    )`,
    `CREATE INDEX IF NOT EXISTS daily_metrics_user_id_idx ON daily_metrics(user_id)`,
    `CREATE INDEX IF NOT EXISTS daily_metrics_user_id_date_idx ON daily_metrics(user_id, date)`,
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
