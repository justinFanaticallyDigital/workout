"use client";

/**
 * 2.6 Workout History Detail (Cluster 2 reskin). DB-backed session replay —
 * data wiring unchanged (GET /api/workouts/[id], POST .../replay). Presentation
 * rebuilt on the v2 primitives: full-screen Header → summary stats → per-
 * exercise set chips → footer (Repeat / Save as frame).
 */
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { Header, Card, Button, Chip, Stamp } from "@/components/v2";
import { saveFrame } from "@/lib/logger-store";

interface SetDetail {
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rir: number | null;
  rpe: number | null;
  isWarmup: boolean;
  isPr: boolean;
}

interface WorkoutExercise {
  id: string;
  exercise: { name: string; equipment: string | null; movementPattern: string | null };
  sets: SetDetail[];
  notes: string | null;
}

interface WorkoutDetail {
  id: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  notes: string | null;
  rating: number | null;
  blockDay: { name: string } | null;
  exercises: WorkoutExercise[];
}

function formatDuration(start: string | null, end: string | null): string {
  if (!start || !end) return "—";
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  if (mins < 60) return `${mins}`;
  return `${Math.floor(mins / 60)}h ${mins % 60}`;
}

export default function WorkoutDetailPage({ params }: { params: { workoutId: string } }) {
  const { workoutId } = params;
  const router = useRouter();
  const toast = useToast();
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replaying, setReplaying] = useState(false);

  useEffect(() => {
    fetch(`/api/workouts/${workoutId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setWorkout(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [workoutId]);

  const handleRepeat = async () => {
    setReplaying(true);
    try {
      const res = await fetch(`/api/workouts/${workoutId}/replay`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to replay workout");
      const data = await res.json();
      toast.success(`Workout created with ${data.exerciseCount} exercises`);
      router.push(`/log/${data.workoutId}`);
    } catch {
      toast.error("Failed to create workout. Please try again.");
      setReplaying(false);
    }
  };

  const handleSaveFrame = async () => {
    if (!workout) return;
    const name = workout.blockDay?.name || "Saved workout";
    await saveFrame({
      name,
      exercises: workout.exercises.map((ex) => ({
        name: ex.exercise.name,
        targetSets: ex.sets.filter((s) => !s.isWarmup).length,
      })),
    });
    toast.success("Saved as frame");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-ft-bg">
        <p className="font-body text-sm text-ft-dim">Loading…</p>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="fixed inset-0 bg-ft-bg p-6">
        <Link href="/history" className="font-body text-sm text-ft-on-bg-ter">
          ← History
        </Link>
        <p className="ft-on-bg mt-8 font-body text-ft-on-bg-sec">Workout not found.</p>
      </div>
    );
  }

  // Stats
  let totalVolume = 0;
  let totalSets = 0;
  let prCount = 0;
  for (const ex of workout.exercises) {
    for (const s of ex.sets) {
      if (s.isWarmup) continue;
      totalSets++;
      if (s.weight && s.reps) totalVolume += Number(s.weight) * s.reps;
      if (s.isPr) prCount++;
    }
  }

  const title =
    workout.blockDay?.name ||
    new Date(workout.date).toLocaleDateString("en-US", { weekday: "long" });
  const subtitle =
    new Date(workout.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " · logged";

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-ft-bg">
      <Header kind="sub" title={title} subtitle={subtitle} right={null} onBack={() => router.push("/history")} />

      <div className="min-w-0 flex-1 overflow-y-auto px-4 pb-[92px] pt-1">
        {/* summary */}
        <Card raised className="px-4 py-3.5">
          <div className="mb-3 flex items-center justify-between">
            <Stamp>Session summary</Stamp>
            <Chip tone="success" size="sm">
              Logged
            </Chip>
          </div>
          <div className="flex gap-1.5">
            <Stat label="Duration" value={formatDuration(workout.startTime, workout.endTime)} unit="min" />
            <Stat label="Volume" value={totalVolume > 0 ? (totalVolume / 1000).toFixed(1) : "—"} unit="k lb" />
            <Stat label="Sets" value={String(totalSets)} />
            <Stat label="PRs" value={String(prCount)} />
          </div>
        </Card>

        <div className="ft-on-bg px-0.5 pb-2 pt-[18px] font-data text-[10.5px] font-bold uppercase tracking-[0.1em] text-ft-on-bg-sec">
          {workout.exercises.length} exercise{workout.exercises.length === 1 ? "" : "s"}
        </div>
        <div className="flex flex-col gap-2.5">
          {workout.exercises.map((ex) => {
            const workSets = ex.sets.filter((s) => !s.isWarmup);
            const isPRLane = workSets.some((s) => s.isPr);
            return (
              <Card key={ex.id} className="px-3.5 pb-3.5 pt-3">
                <div className="flex items-start gap-2.5">
                  <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-[3px] bg-ft-push" />
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-[14.5px] font-bold leading-tight tracking-[-0.01em] text-ft-white">
                      {ex.exercise.name}
                    </div>
                    {ex.exercise.movementPattern && (
                      <div className="mt-0.5 font-data text-[10.5px] tracking-[0.04em] text-ft-dim">
                        {ex.exercise.movementPattern}
                      </div>
                    )}
                  </div>
                  {isPRLane && (
                    <Chip tone="accent" size="sm">
                      PR
                    </Chip>
                  )}
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {workSets.map((s) => (
                    <SetChip key={s.setNumber} set={s} />
                  ))}
                </div>
                {ex.notes && (
                  <div className="mt-2.5 border-t border-ft-border-faint pt-2.5 font-body text-xs italic leading-snug text-ft-light">
                    “{ex.notes}”
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {workout.notes && (
          <Card className="mt-2.5 px-3.5 py-3">
            <Stamp>Session notes</Stamp>
            <p className="mt-1.5 font-body text-sm leading-snug text-ft-light">{workout.notes}</p>
          </Card>
        )}
      </div>

      {/* footer */}
      <div className="absolute inset-x-0 bottom-0 flex gap-2 border-t border-ft-border-faint bg-ft-surface px-4 pb-4 pt-3">
        <Button kind="secondary" size="lg" onClick={handleSaveFrame}>
          Save as frame
        </Button>
        <Button kind="primary" size="lg" fullWidth disabled={replaying} onClick={handleRepeat}>
          {replaying ? "Creating…" : "Repeat workout →"}
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="font-data text-[9.5px] uppercase tracking-[0.08em] text-ft-dim">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="font-number text-[21px] font-bold tracking-[0.01em] text-ft-white">{value}</span>
        {unit && <span className="font-body text-[11px] text-ft-dim">{unit}</span>}
      </div>
    </div>
  );
}

function SetChip({ set }: { set: SetDetail }) {
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
