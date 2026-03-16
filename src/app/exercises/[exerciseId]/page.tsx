"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, SectionHeader, Stat, Tag } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ExerciseDetail {
  id: string;
  name: string;
  movementPattern: string | null;
  primaryMuscle: string | null;
  secondaryMuscle1: string | null;
  secondaryMuscle2: string | null;
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

const CHART_TICK = { fontSize: 10, fill: "#888888", fontFamily: "monospace" } as const;
const CHART_AXIS_LINE = { stroke: "#555555" };
const CHART_TOOLTIP_STYLE = {
  backgroundColor: "#2e2e2e",
  border: "1px solid #555555",
  borderRadius: 4,
  fontFamily: "monospace",
  fontSize: 12,
};
const CHART_LABEL_STYLE = { color: "#cccccc" };
const CHART_DOT = { fill: "#ffffff", r: 3 };

export default function ExerciseDetailPage({
  params,
}: {
  params: { exerciseId: string };
}) {
  const { exerciseId } = params;
  const toast = useToast();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-ft-bg p-6 flex items-center justify-center">
        <p className="text-ft-dim font-mono text-sm">Loading...</p>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-ft-bg p-6">
        <Link
          href="/exercises"
          className="text-ft-dim font-mono text-xs uppercase tracking-wider hover:text-ft-light transition-colors"
        >
          &larr; Exercises
        </Link>
        <p className="text-ft-light font-mono mt-8">Exercise not found.</p>
      </div>
    );
  }

  const bestPR = prs[0] ?? null;
  const secondary = [exercise.secondaryMuscle1, exercise.secondaryMuscle2]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-ft-bg p-6">
      {/* Breadcrumb */}
      <Link
        href="/exercises"
        className="text-ft-dim font-mono text-xs uppercase tracking-wider hover:text-ft-light transition-colors"
      >
        &larr; Exercises
      </Link>

      {/* Exercise Header */}
      <div className="mt-4 mb-6">
        <h1 className="text-ft-white font-mono font-bold text-2xl uppercase tracking-wider">
          {exercise.name}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          {exercise.movementPattern && <Tag>{exercise.movementPattern}</Tag>}
          {exercise.primaryMuscle && (
            <span className="text-ft-dim font-mono text-xs">
              {exercise.primaryMuscle}
            </span>
          )}
          {secondary && (
            <>
              <span className="text-ft-muted font-mono text-xs">&middot;</span>
              <span className="text-ft-muted font-mono text-xs">
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
              <p className="text-ft-warn text-xs font-mono">
                Weight has been the same for 3+ sessions. Consider increasing weight, adding reps, or trying an alternative exercise.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Volume Chart */}
      <div className="mb-8">
        <SectionHeader title="Volume Over Time" />
        <Card>
          {volumeData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={volumeData}>
                  <XAxis
                    dataKey="date"
                    tick={CHART_TICK}
                    tickLine={false}
                    axisLine={CHART_AXIS_LINE}
                  />
                  <YAxis
                    tick={CHART_TICK}
                    tickLine={false}
                    axisLine={CHART_AXIS_LINE}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    labelStyle={CHART_LABEL_STYLE}
                  />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="#ffffff"
                    strokeWidth={2}
                    dot={CHART_DOT}
                    name="Volume (lbs)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <span className="text-ft-muted font-mono text-xs uppercase tracking-wider">
                Log workouts to see volume trends
              </span>
            </div>
          )}
        </Card>
      </div>

      {/* Session History */}
      <div>
        <SectionHeader title="Session History" />
        <Card>
          {history.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {history.map((session, idx) => {
                const workSets = session.sets.filter((s) => !s.isWarmup);
                return (
                  <div key={idx} className="border-b border-ft-border pb-3 last:border-0 last:pb-0">
                    <p className="text-ft-dim text-xs font-mono mb-2">
                      {session.date}
                    </p>
                    <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-1.5">
                      <span className="text-ft-muted text-[10px] font-mono uppercase">Set</span>
                      <span className="text-ft-muted text-[10px] font-mono uppercase">Weight</span>
                      <span className="text-ft-muted text-[10px] font-mono uppercase">Reps</span>
                      <span className="text-ft-muted text-[10px] font-mono uppercase">RIR</span>
                      {workSets.map((s, si) => (
                        <div key={si} className="contents">
                          <span className="text-ft-dim text-xs font-mono">{si + 1}</span>
                          <span className={`text-xs font-mono ${s.isPr ? "text-ft-success font-bold" : "text-ft-light"}`}>
                            {s.weight ?? "—"}
                            {s.isPr && " PR"}
                          </span>
                          <span className="text-ft-light text-xs font-mono">{s.reps ?? "—"}</span>
                          <span className="text-ft-dim text-xs font-mono">{s.rir ?? "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <span className="text-ft-muted font-mono text-xs uppercase tracking-wider">
                No sessions logged yet
              </span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
