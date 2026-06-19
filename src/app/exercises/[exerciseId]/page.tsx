"use client";

/**
 * 2.3 Exercise Detail (Cluster 2 reskin). Data wiring unchanged (exercise +
 * history + estimated-1rm + progression-status). Presentation rebuilt on the
 * v2 primitives: full-screen Header → key-stats card w/ trend chart →
 * progression suggestion → set history → tier-locked customize → footer.
 */
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { chartTheme } from "@/lib/theme";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Header, Card, Button, Chip, Stamp } from "@/components/v2";
import { useTier } from "@/providers/TierProvider";

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

export default function ExerciseDetailPage({ params }: { params: { exerciseId: string } }) {
  const { exerciseId } = params;
  const router = useRouter();
  const { tier } = useTier();
  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);
  const [prs, setPrs] = useState<PR[]>([]);
  const [history, setHistory] = useState<HistorySession[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [est1RM, setEst1RM] = useState<number | null>(null);
  const [progressionStatus, setProgressionStatus] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/exercises/${exerciseId}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/exercises/${exerciseId}/history`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/exercises/${exerciseId}/estimated-1rm`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/exercises/${exerciseId}/progression-status`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([exData, histData, e1rmData, progData]) => {
        if (exData) setExercise(exData);
        if (histData?.history) {
          setHistory(histData.history);
          setSessionCount(histData.history.length);
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
          if (bestWeight > 0) setPrs([{ weight: bestWeight, reps: bestReps, date: bestDate }]);
        }
        if (e1rmData?.estimated1RM) setEst1RM(e1rmData.estimated1RM);
        if (progData?.status) setProgressionStatus(progData.status);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [exerciseId]);

  const volumeData = useMemo<VolumePoint[]>(
    () =>
      history
        .map((session) => {
          const workSets = session.sets.filter((s) => !s.isWarmup && s.weight && s.reps);
          const volume = workSets.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0);
          const topWeight = Math.max(...workSets.map((s) => s.weight ?? 0), 0);
          return { date: session.date, volume, topWeight };
        })
        .filter((d) => d.volume > 0)
        .reverse(),
    [history],
  );
  const ct = useMemo(() => chartTheme(), []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-ft-bg">
        <p className="font-body text-sm text-ft-dim">Loading…</p>
      </div>
    );
  }
  if (!exercise) {
    return (
      <div className="fixed inset-0 bg-ft-bg p-6">
        <Link href="/exercises" className="font-body text-sm text-ft-on-bg-ter">
          ← Exercises
        </Link>
        <p className="ft-on-bg mt-8 font-body text-ft-on-bg-sec">Exercise not found.</p>
      </div>
    );
  }

  const bestPR = prs[0] ?? null;
  const adj = exercise.adjacent;
  const progLabel = progressionStatus
    ? progressionStatus.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-ft-bg">
      <Header
        kind="sub"
        title={exercise.name}
        subtitle={[exercise.movementPattern, exercise.primaryMuscle].filter(Boolean).join(" · ") || undefined}
        right={null}
        onBack={() => router.push("/exercises")}
      />

      <div className="min-w-0 flex-1 overflow-y-auto px-4 pb-[92px] pt-1">
        {/* prev / next */}
        {(adj?.prev || adj?.next) && (
          <div className="ft-on-bg mb-1 flex items-center justify-between font-body text-xs text-ft-on-bg-ter">
            {adj?.prev ? (
              <Link href={`/exercises/${adj.prev.id}`} className="truncate">
                ← {adj.prev.name}
              </Link>
            ) : (
              <span />
            )}
            {adj?.next ? (
              <Link href={`/exercises/${adj.next.id}`} className="truncate text-right">
                {adj.next.name} →
              </Link>
            ) : (
              <span />
            )}
          </div>
        )}

        {/* key stats + trend */}
        <Card raised className="px-4 py-3.5">
          <div className="mb-3 flex items-center justify-between">
            <Stamp>Estimated 1RM</Stamp>
            {progLabel && (
              <Chip tone={progressionStatus === "stalled" ? "warn" : "success"} size="sm">
                {progLabel}
              </Chip>
            )}
          </div>
          <div className="flex gap-2">
            <Stat label="Current" value={est1RM != null ? String(est1RM) : "—"} unit="lb" sub="e1RM" />
            <Stat
              label="Best set"
              value={bestPR ? `${bestPR.weight}×${bestPR.reps ?? "—"}` : "—"}
              sub={bestPR ? new Date(bestPR.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : undefined}
            />
            <Stat label="Sessions" value={String(sessionCount)} sub="logged" />
          </div>

          {volumeData.length > 1 && (
            <div className="mt-3 border-t border-ft-border-faint pt-3">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={volumeData} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                  <XAxis dataKey="date" tick={ct.tick} axisLine={ct.axisLine} tickFormatter={(d) => new Date(d).toLocaleDateString("en-US", { month: "numeric", day: "numeric" })} />
                  <YAxis tick={ct.tick} axisLine={ct.axisLine} width={36} />
                  <Tooltip contentStyle={ct.tooltipStyle} labelStyle={ct.labelStyle} />
                  <Line type="monotone" dataKey="topWeight" name="Top weight" stroke="rgb(var(--ft-accent))" strokeWidth={2} dot={ct.dot} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* progression suggestion */}
        {progLabel && (
          <Card className="mt-3 px-4 py-3.5" style={{ borderColor: "rgb(var(--ft-accent-border))" }}>
            <div className="flex items-start gap-3">
              <span className="inline-flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-ft-md bg-ft-accent-faint text-ft-accent">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 17l6-6 4 4 8-8" />
                  <path d="M17 7h4v4" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <Stamp>Progression</Stamp>
                <div className="mt-1 font-display text-[17px] font-bold tracking-[-0.01em] text-ft-white">{progLabel}</div>
                <div className="mt-1 font-body text-xs leading-snug text-ft-light">
                  {progressionStatus === "stalled"
                    ? "Top set has stalled across recent sessions — consider a deload or a rep/tempo change."
                    : "Trending up — keep adding load or reps while RPE stays in range."}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* set history */}
        {history.length > 0 && (
          <>
            <div className="ft-on-bg px-0.5 pb-1 pt-[18px] font-data text-[10.5px] font-bold uppercase tracking-[0.1em] text-ft-on-bg-sec">
              Set history
            </div>
            <div className="flex flex-col gap-2.5">
              {history.slice(0, 6).map((session, i) => {
                const work = session.sets.filter((s) => !s.isWarmup);
                return (
                  <Card key={i} className="px-3.5 py-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-data text-[10.5px] uppercase tracking-[0.06em] text-ft-light">
                        {new Date(session.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {work.map((s, si) => (
                        <SetChip key={si} set={s} />
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* customize — tier-locked for Logger */}
        <div className="ft-on-bg px-0.5 pb-2 pt-5 font-data text-[10.5px] font-bold uppercase tracking-[0.1em] text-ft-on-bg-sec">
          Customize
        </div>
        <Card className={["flex items-center gap-3 px-3.5 py-3", tier === "logger" ? "opacity-[0.62]" : ""].join(" ")}>
          <span className="inline-flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-ft-md bg-ft-surface-alt text-ft-dim">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-body text-[13.5px] font-semibold text-ft-white">Edit exercise</div>
            <div className="mt-px font-body text-[11.5px] text-ft-dim">
              {tier === "logger" ? "Custom exercises unlock with Program" : "Rename · tags · default loads · notes"}
            </div>
          </div>
          {tier === "logger" ? (
            <Chip tone="neutral" size="sm">
              Locked
            </Chip>
          ) : (
            <span className="font-body text-base text-ft-dim">›</span>
          )}
        </Card>
      </div>

      {/* footer */}
      <div className="absolute inset-x-0 bottom-0 flex gap-2 border-t border-ft-border-faint bg-ft-surface px-4 pb-4 pt-3">
        <Button kind="secondary" size="lg" onClick={() => router.push("/exercises")}>
          Library
        </Button>
        <Button kind="primary" size="lg" fullWidth onClick={() => router.push("/log/new-blank")}>
          Add to workout →
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value, unit, sub }: { label: string; value: string; unit?: string; sub?: string }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="font-data text-[9.5px] uppercase tracking-[0.08em] text-ft-dim">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="font-number text-xl font-bold tracking-[0.01em] text-ft-white">{value}</span>
        {unit && <span className="font-body text-[11px] text-ft-dim">{unit}</span>}
      </div>
      {sub && <div className="mt-0.5 font-body text-[10px] text-ft-dim">{sub}</div>}
    </div>
  );
}

function SetChip({ set }: { set: HistorySet }) {
  const bw = !set.weight;
  const rpe = set.rpe ?? set.rir;
  return (
    <span
      className={[
        "inline-flex items-baseline gap-[3px] rounded-ft-sm border px-2.5 py-[5px] font-number text-[12.5px] font-bold tracking-[0.01em] text-ft-white",
        set.isPr ? "border-ft-accent-border bg-ft-accent-faint" : "border-ft-border-faint bg-ft-surface-alt",
      ].join(" ")}
    >
      {set.isPr && <span className="text-[11px] text-ft-accent">★</span>}
      <span>
        {bw ? "BW" : set.weight}
        {!bw && <span className="text-[10px] font-normal text-ft-dim">lb</span>}
      </span>
      <span className="text-ft-border-strong">×</span>
      <span>{set.reps ?? "—"}</span>
      {rpe != null && <span className="ml-px text-[9.5px] font-normal text-ft-dim">@{rpe}</span>}
    </span>
  );
}
