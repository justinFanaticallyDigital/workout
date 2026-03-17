import { Card, SectionHeader, ProgressBar, Tag } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

function BarChart({
  data,
  labelKey,
  valueKey,
  maxValue,
  formatLabel,
}: {
  data: Record<string, unknown>[];
  labelKey: string;
  valueKey: string;
  maxValue: number;
  formatLabel?: (v: number) => string;
}) {
  const lastIndex = data.length - 1;
  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((item, i) => {
        const value = item[valueKey] as number;
        const label = item[labelKey] as string;
        const heightPct = maxValue > 0 ? (value / maxValue) * 100 : 0;
        const isLatest = i === lastIndex;
        return (
          <div key={label} className="flex flex-col items-center flex-1 gap-1">
            <span className="text-xs font-mono text-ft-dim">
              {formatLabel ? formatLabel(value) : value}
            </span>
            <div
              className={`w-full rounded-sm transition-colors ${
                isLatest ? "bg-ft-white" : "bg-ft-muted"
              }`}
              style={{ height: `${heightPct}%` }}
            />
            <span className="text-xs font-mono text-ft-dim">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default async function ProgressPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/signin");

  const [bodyMetrics, prs, recentWorkouts, goals, totalWorkoutCount] = await Promise.all([
    prisma.bodyMetric.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      select: { date: true, weight: true },
    }),
    prisma.exercisePr.findMany({
      where: { userId },
      include: { exercise: { select: { name: true } } },
      orderBy: { achievedAt: "desc" },
      take: 10,
    }),
    // Get last 6 weeks of workouts for volume trend
    prisma.workout.findMany({
      where: {
        userId,
        date: {
          gte: (() => {
            const d = new Date();
            d.setDate(d.getDate() - 42);
            return d;
          })(),
        },
      },
      include: {
        exercises: { include: { sets: true } },
      },
      orderBy: { date: "asc" },
    }),
    // Active goals with linked program info
    prisma.goal.findMany({
      where: { userId, status: "active" },
      include: {
        program: { select: { id: true, name: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    // Total workout count (for frequency goals)
    prisma.workout.count({ where: { userId } }),
  ]);

  // Calculate current value for each goal based on type
  const latestWeight = bodyMetrics.length > 0 ? Number(bodyMetrics[bodyMetrics.length - 1].weight) : null;
  const goalProgressData = goals.map((goal) => {
    const startVal = goal.startValue ? Number(goal.startValue) : 0;
    const targetVal = goal.targetValue ? Number(goal.targetValue) : 0;
    let currentVal = startVal;

    switch (goal.type) {
      case "bodyweight":
      case "weight":
      case "bodycomp":
        currentVal = latestWeight ?? startVal;
        break;
      case "strength":
      case "powerlifting": {
        // Find best PR value for this goal's metric (or any PR if no metric specified)
        const relevantPr = prs.find((pr) =>
          goal.metric ? pr.exercise.name.toLowerCase().includes(goal.metric.toLowerCase()) : true
        );
        currentVal = relevantPr ? Number(relevantPr.value) : startVal;
        break;
      }
      case "frequency":
        currentVal = totalWorkoutCount;
        break;
      default:
        break;
    }

    // Calculate progress percentage
    const range = targetVal - startVal;
    const progress = range !== 0 ? ((currentVal - startVal) / range) * 100 : 0;
    const pct = Math.max(0, Math.min(100, progress));

    return {
      ...goal,
      currentVal,
      startVal,
      targetVal,
      pct,
    };
  });

  // Build body weight chart data (last 6 entries)
  const weightData = bodyMetrics
    .filter((m) => m.weight)
    .slice(-6)
    .map((m) => ({
      month: m.date.toLocaleDateString("en-US", { month: "short" }),
      value: Number(m.weight),
    }));

  const weightMax = weightData.length > 0
    ? Math.max(...weightData.map((d) => d.value)) + 5
    : 210;

  // Build weekly volume data (last 6 weeks)
  const weeklyVolumes: Record<string, number> = {};
  for (const w of recentWorkouts) {
    const weekStart = new Date(w.date);
    const dayOfWeek = weekStart.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    weekStart.setDate(weekStart.getDate() + mondayOffset);
    const key = weekStart.toISOString().split("T")[0];

    let vol = 0;
    for (const ex of w.exercises) {
      for (const s of ex.sets) {
        if (s.weight && s.reps && !s.isWarmup) {
          vol += Number(s.weight) * s.reps;
        }
      }
    }
    weeklyVolumes[key] = (weeklyVolumes[key] || 0) + vol;
  }

  const volumeEntries = Object.entries(weeklyVolumes)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6);

  const volumeData = volumeEntries.map(([, val], i) => ({
    week: `W${i + 1}`,
    value: val,
  }));

  const volumeMax = volumeData.length > 0
    ? Math.max(...volumeData.map((d) => d.value)) * 1.1
    : 45000;

  // Weight trend
  let weightTrend = "";
  if (weightData.length >= 2) {
    const diff = weightData[weightData.length - 1].value - weightData[0].value;
    const sign = diff > 0 ? "Up" : "Down";
    weightTrend = `${sign} ${Math.abs(diff).toFixed(1)} lbs over ${weightData.length} entries`;
  }

  return (
    <div className="min-h-screen bg-ft-bg p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-mono font-bold text-ft-white tracking-wide">
          Progress
        </h1>
        <p className="text-ft-dim text-sm font-mono mt-1">
          Track body metrics, training volume, and strength
        </p>
      </div>

      {/* Active Goals */}
      {goalProgressData.length > 0 && (
        <Card>
          <SectionHeader title="Active Goals" subtitle={`${goalProgressData.length} goal${goalProgressData.length !== 1 ? "s" : ""}`} />
          <div className="space-y-4">
            {goalProgressData.map((g) => (
              <div key={g.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-ft-white text-sm font-mono font-bold">{g.title}</span>
                    <Tag>{g.type}</Tag>
                    {g.priority === "primary" && <Tag variant="success">Primary</Tag>}
                  </div>
                  <span className="text-ft-dim text-xs font-mono">
                    {g.currentVal.toFixed(g.currentVal % 1 !== 0 ? 1 : 0)} / {g.targetVal} {g.targetUnit ?? ""}
                  </span>
                </div>
                <ProgressBar
                  value={g.pct}
                  max={100}
                />
                <div className="flex items-center justify-between">
                  <span className="text-ft-muted text-[10px] font-mono">
                    Start: {g.startVal} {g.targetUnit ?? ""}
                  </span>
                  <span className="text-ft-dim text-[10px] font-mono">
                    {Math.round(g.pct)}% complete
                  </span>
                  {g.program && (
                    <Link
                      href={`/programs/${g.program.id}`}
                      className="text-ft-muted text-[10px] font-mono hover:text-ft-light"
                    >
                      {g.program.name} &rarr;
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Body Weight Chart */}
      <Card>
        <SectionHeader title="Body Weight" subtitle={weightData.length > 0 ? `${weightData.length} entries` : "No data yet"} />
        {weightData.length > 0 ? (
          <>
            <BarChart
              data={weightData}
              labelKey="month"
              valueKey="value"
              maxValue={weightMax}
            />
            {weightTrend && (
              <p className="text-ft-success text-sm font-mono mt-3">
                {weightTrend}
              </p>
            )}
          </>
        ) : (
          <p className="text-ft-muted font-mono text-sm py-8 text-center">
            Log body weight to see trends
          </p>
        )}
      </Card>

      {/* Weekly Volume Trend */}
      <Card>
        <SectionHeader title="Weekly Volume" subtitle={volumeData.length > 0 ? `Last ${volumeData.length} weeks` : "No data yet"} />
        {volumeData.length > 0 ? (
          <BarChart
            data={volumeData}
            labelKey="week"
            valueKey="value"
            maxValue={volumeMax}
            formatLabel={(v) => `${(v / 1000).toFixed(0)}k`}
          />
        ) : (
          <p className="text-ft-muted font-mono text-sm py-8 text-center">
            Log workouts to see volume trends
          </p>
        )}
      </Card>

      {/* Strength Milestones */}
      <Card>
        <SectionHeader title="Strength Milestones" subtitle={prs.length > 0 ? "Recent PRs" : "No PRs yet"} />
        {prs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="text-ft-dim text-left text-xs uppercase tracking-wider">
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2 pr-4">Exercise</th>
                  <th className="pb-2 pr-4">Weight</th>
                  <th className="pb-2">Reps</th>
                </tr>
              </thead>
              <tbody className="text-ft-light">
                {prs.map((pr) => (
                  <tr
                    key={pr.id}
                    className="border-t border-ft-border"
                  >
                    <td className="py-2 pr-4 text-ft-dim">
                      {pr.achievedAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-2 pr-4">{pr.exercise.name}</td>
                    <td className="py-2 pr-4">{Number(pr.value)}</td>
                    <td className="py-2">{pr.repsAtWeight ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-ft-muted font-mono text-sm py-8 text-center">
            Set PRs to see milestones
          </p>
        )}
      </Card>

      {/* Progress Photos */}
      <Card>
        <SectionHeader
          title="Progress Photos"
          action={
            <Link
              href="/progress/photos"
              className="text-ft-dim text-xs font-mono hover:text-ft-light transition-colors border border-ft-border rounded px-3 py-1"
            >
              View All &rarr;
            </Link>
          }
        />
        <Link href="/progress/photos">
          <p className="text-ft-muted font-mono text-sm py-8 text-center hover:text-ft-light transition-colors">
            View and upload progress photos
          </p>
        </Link>
      </Card>
    </div>
  );
}
