"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, SectionHeader, Stat, Tag } from "@/components/ui";
import { chartTheme } from "@/lib/theme";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AdjacentExercise {
  id: string;
  name: string;
}

interface ExerciseDetail {
  id: string;
  name: string;
  movementPattern: string | null;
  primaryMuscle: string | null;
  secondaryMuscle1: string | null;
  secondaryMuscle2: string | null;
  adjacent?: { prev: AdjacentExercise | null; next: AdjacentExercise | null };
}

interface PR {
  weight: number;
  reps: number | null;
  date: string;
}

interface HistorySet {
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  rir: number | null;
  isWarmup: boolean;
  isPr: boolean;
}

interface HistorySession {
  date: string;
  sets: HistorySet[];
}

interface VolumePoint {
  date: string;
  volume: number;
  topWeight: number;
}


export default function ExerciseDetailPage({
  params,
}: {
  params: { exerciseId: string };
}) {
  const { exerciseId } = params;
  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);
  const [prs, setPrs] = useState<PR[]>([]);
  const [history, setHistory] = useState<HistorySession[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [est1RM, setEst1RM] = useState<number | null>(null);
  const [progressionStatus, setProgressionStatus] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/exercises/${exerciseId}`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/exercises/${exerciseId}/history`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/exercises/${exerciseId}/estimated-1rm`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/exercises/${exerciseId}/progression-status`).then((r) => r.ok ? r.json() : null),
    ]).then(([exData, histData, e1rmData, progData]) => {
      if (exData) setExercise(exData);
      if (histData?.history) {
        setHistory(histData.history);
        setSessionCount(histData.history.length);
        // Derive best PR from history
        let bestWeight = 0;
        let bestReps: number | null = null;
        let bestDate = "";
        for (const session of histData.history) {
          for (const s of session.sets) {
            if (!s.isWarmup && s.weight && s.weight > bestWeight) {
              bestWeight = s.weight;
              bestReps = s.reps;
              bestDate = session.date;
            }
          }
        }
        if (bestWeight > 0) {
          setPrs([{ weight: bestWeight, reps: bestReps, date: bestDate }]);
        }
      }
      if (e1rmData?.estimated1RM) setEst1RM(e1rmData.estimated1RM);
      if (progData?.status) setProgressionStatus(progData.status);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [exerciseId]);

  // Build volume chart data (must be before early returns per Rules of Hooks)
  const volumeData = useMemo<VolumePoint[]>(() =>
    history
      .map((session) => {
        const workSets = session.sets.filter((s) => !s.isWarmup && s.weight && s.reps);
        const volume = workSets.reduce(
          (sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0),
          0
        );
        const topWeight = Math.max(...workSets.map((s) => s.weight ?? 0), 0);
        return { date: session.date, volume, topWeight };
      })
      .filter((d) => d.volume > 0)
      .reverse(),
    [history]
  );

  const ct = useMemo(() => chartTheme(), []);

  if (loading) {
    return (
      <div className="min-h-screen bg-ft-bg p-6 flex items-center justify-center">
        <p className="text-ft-dim font-body text-sm">Loading...</p>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-ft-bg p-6">
        <Link
          href="/exercises"
          className="text-ft-dim font-body text-xs uppercase tracking-wider hover:text-ft-light transition-colors"
        >
          &larr; Exercises
        </Link>
        <p className="text-ft-light font-body mt-8">Exercise not found.</p>
      </div>
    );
  }

  const bestPR = prs[0] ?? null;
  const secondary = [exercise.secondaryMuscle1, exercise.secondaryMuscle2]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-ft-bg p-6">
      {/* Breadcrumb + Prev/Next */}
      <div className="flex items-center justify-between">
        <Link
          href="/exercises"
          className="text-ft-dim font-body text-xs uppercase tracking-wider hover:text-ft-light transition-colors"
        >
          &larr; Exercises
        </Link>
        <div className="flex items-center gap-3">
          {exercise.adjacent?.prev ? (
            <Link
              href={`/exercises/${exercise.adjacent.prev.id}`}
              className="text-ft-dim font-body text-xs hover:text-ft-light transition-colors"
              title={exercise.adjacent.prev.name}
            >
              &larr; Prev
            </Link>
          ) : (
            <span className="text-ft-muted/40 font-body text-xs">&larr; Prev</span>
          )}
          <span className="text-ft-border text-xs">|</span>
          {exercise.adjacent?.next ? (
            <Link
              href={`/exercises/${exercise.adjacent.next.id}`}
              className="text-ft-dim font-body text-xs hover:text-ft-light transition-colors"
              title={exercise.adjacent.next.name}
            >
              Next &rarr;
            </Link>
          ) : (
            <span className="text-ft-muted/40 font-body text-xs">Next &rarr;</span>
          )}
        </div>
      </div>

      {/* Exercise Header */}
      <div className="mt-4 mb-6">
        <h1 className="text-ft-white font-body font-bold text-2xl uppercase tracking-wider">
          {exercise.name}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          {exercise.movementPattern && <Tag>{exercise.movementPattern}</Tag>}
          {exercise.primaryMuscle && (
            <span className="text-ft-dim font-body text-xs">
              {exercise.primaryMuscle}
            </span>
          )}
          {secondary && (
            <>
              <span className="text-ft-muted font-body text-xs">&middot;</span>
              <span className="text-ft-muted font-body text-xs">
                {secondary}
              </span>
            </>
          )}
        </div>
      </div>

      {/* PR Section */}
      <div className="mb-8">
        <SectionHeader title="Personal Records" />
        <Card>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <Stat
              label="Best Set"
              value={
                bestPR
                  ? `${bestPR.weight}${bestPR.reps ? `×${bestPR.reps}` : ""}`
                  : "—"
              }
              sub={bestPR?.date}
            />
            <Stat label="Est. 1RM" value={est1RM ? `${est1RM}` : "—"} sub={est1RM ? "Epley" : undefined} />
            <Stat label="Total Sessions" value={sessionCount} />
            <Stat
              label="Progression"
              value={
                progressionStatus === "stalled"
                  ? "Stalled"
                  : progressionStatus === "progressing"
                  ? "On Track"
                  : "—"
              }
              sub={
                progressionStatus === "stalled"
                  ? "Consider changing weight/reps"
                  : progressionStatus === "progressing"
                  ? "Keep it up"
                  : undefined
              }
            />
          </div>
          {progressionStatus === "stalled" && (
            <div className="mt-4 p-3 bg-ft-warn/10 border border-ft-warn/20 rounded">
              <p className="text-ft-warn text-xs font-body font-bold mb-2">
                Stalled — weight unchanged for 3+ sessions
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const deloadWeight = bestPR ? Math.round(bestPR.weight * 0.9) : null;
                    alert(
                      deloadWeight
                        ? `Deload suggestion: Drop to ${deloadWeight} lbs (90% of best) for 1-2 weeks, then rebuild.`
                        : "Reduce weight by 10% for 1-2 weeks, focus on form, then rebuild."
                    );
                  }}
                  className="px-2.5 py-1 text-[10px] font-body font-bold bg-ft-warn/20 text-ft-warn rounded hover:bg-ft-warn/30 transition-colors"
                >
                  Deload (-10%)
                </button>
                <button
                  onClick={() => {
                    alert(
                      "Rep scheme change: If doing 3×5, try 4×8 at a lighter weight. " +
                      "If doing 3×8-12, try 5×5 heavier. Varying rep ranges breaks plateaus."
                    );
                  }}
                  className="px-2.5 py-1 text-[10px] font-body font-bold bg-ft-warn/20 text-ft-warn rounded hover:bg-ft-warn/30 transition-colors"
                >
                  Change Rep Scheme
                </button>
                {exercise.movementPattern && (
                  <Link
                    href={`/exercises?pattern=${encodeURIComponent(exercise.movementPattern)}`}
                    className="px-2.5 py-1 text-[10px] font-body font-bold bg-ft-warn/20 text-ft-warn rounded hover:bg-ft-warn/30 transition-colors"
                  >
                    Find Alternative
                  </Link>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Volume & Top Weight Chart */}
      <div className="mb-8 section-divider pt-6">
        <SectionHeader title="Performance Over Time" />
        <Card>
          {volumeData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={volumeData}>
                  <XAxis
                    dataKey="date"
                    tick={ct.tick}
                    tickLine={false}
                    axisLine={ct.axisLine}
                  />
                  <YAxis
                    yAxisId="volume"
                    tick={ct.tick}
                    tickLine={false}
                    axisLine={ct.axisLine}
                    width={50}
                  />
                  <YAxis
                    yAxisId="weight"
                    orientation="right"
                    tick={ct.tick}
                    tickLine={false}
                    axisLine={ct.axisLine}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={ct.tooltipStyle}
                    labelStyle={ct.labelStyle}
                  />
                  <Line
                    yAxisId="volume"
                    type="monotone"
                    dataKey="volume"
                    stroke={ct.lineStroke}
                    strokeWidth={2}
                    dot={ct.dot}
                    name="Volume (lbs)"
                  />
                  <Line
                    yAxisId="weight"
                    type="monotone"
                    dataKey="topWeight"
                    stroke="rgb(var(--ft-data-2))"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="4 2"
                    name="Top Weight (lbs)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <span className="text-ft-muted font-body text-xs uppercase tracking-wider">
                Log workouts to see performance trends
              </span>
            </div>
          )}
        </Card>
      </div>

      {/* Session-over-Session Comparison */}
      {volumeData.length >= 2 && (
        <div className="mb-8 section-divider pt-6">
          <SectionHeader title="Session Comparison" />
          <Card>
            <div className="grid grid-cols-[1fr_80px_80px_80px] gap-1.5 text-[10px] font-body uppercase tracking-wider text-ft-muted mb-2">
              <span>Date</span>
              <span className="text-right">Top Wt</span>
              <span className="text-right">Volume</span>
              <span className="text-right">Change</span>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {volumeData.map((d, i) => {
                const prev = i > 0 ? volumeData[i - 1] : null;
                const volChange = prev ? d.volume - prev.volume : 0;
                const pct = prev && prev.volume > 0 ? Math.round((volChange / prev.volume) * 100) : 0;
                return (
                  <div key={i} className="grid grid-cols-[1fr_80px_80px_80px] gap-1.5 items-center py-0.5">
                    <span className="text-ft-dim text-xs font-body">{d.date}</span>
                    <span className="text-ft-light text-xs font-body text-right">{d.topWeight}</span>
                    <span className="text-ft-light text-xs font-body text-right">{d.volume.toLocaleString()}</span>
                    <span className={`text-xs font-body text-right ${
                      volChange > 0 ? "text-ft-success" : volChange < 0 ? "text-ft-danger" : "text-ft-muted"
                    }`}>
                      {i === 0 ? "—" : `${volChange > 0 ? "+" : ""}${pct}%`}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Session History */}
      <div className="section-divider pt-6">
        <SectionHeader title="Session History" />
        <Card>
          {history.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {history.map((session, idx) => {
                const workSets = session.sets.filter((s) => !s.isWarmup);
                return (
                  <div key={idx} className="border-b border-ft-border pb-3 last:border-0 last:pb-0">
                    <p className="text-ft-dim text-xs font-body mb-2">
                      {session.date}
                    </p>
                    <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-1.5">
                      <span className="text-ft-muted text-[10px] font-body uppercase">Set</span>
                      <span className="text-ft-muted text-[10px] font-body uppercase">Weight</span>
                      <span className="text-ft-muted text-[10px] font-body uppercase">Reps</span>
                      <span className="text-ft-muted text-[10px] font-body uppercase">RIR</span>
                      {workSets.map((s, si) => (
                        <div key={si} className="contents">
                          <span className="text-ft-dim text-xs font-body">{si + 1}</span>
                          <span className={`text-xs font-body ${s.isPr ? "text-ft-success font-bold" : "text-ft-light"}`}>
                            {s.weight ?? "—"}
                            {s.isPr && " PR"}
                          </span>
                          <span className="text-ft-light text-xs font-body">{s.reps ?? "—"}</span>
                          <span className="text-ft-dim text-xs font-body">{s.rir ?? "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <span className="text-ft-muted font-body text-xs uppercase tracking-wider">
                No sessions logged yet
              </span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
