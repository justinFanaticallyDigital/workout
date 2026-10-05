"use client";

/** Session replay — summary · per-exercise set chips · Save as frame · Repeat. Data from GET /api/workouts/[id]. */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Btn, Card, CategoryChip, ScreenHeader, Stamp } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { fmtMonthDay } from "@/lib/dates";
import { fmtNum } from "@/lib/stats";

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
  exercise: { id: string; name: string; equipment: string | null; movementPattern: string | null; primaryMuscle?: string | null };
  sets: SetDetail[];
  notes: string | null;
}
interface WorkoutDetail {
  id: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  notes: string | null;
  blockDay: { name: string } | null;
  frame: { id: string; name: string } | null;
  exercises: WorkoutExercise[];
}

function durationMin(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  return Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));
}

export default function WorkoutDetailPage({ params }: { params: { workoutId: string } }) {
  const { workoutId } = params;
  const router = useRouter();
  const toast = useToast();
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replaying, setReplaying] = useState(false);
  const [savingFrame, setSavingFrame] = useState(false);

  useEffect(() => {
    fetch(`/api/workouts/${workoutId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setWorkout(data))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [workoutId]);

  const handleRepeat = async () => {
    setReplaying(true);
    try {
      const res = await fetch(`/api/workouts/${workoutId}/replay`, { method: "POST" });
      if (!res.ok) throw new Error("Couldn't start the workout.");
      const data = await res.json();
      toast.success(`Workout created with ${data.exerciseCount} exercises`);
      router.push(`/log/${data.workoutId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't start the workout.");
      setReplaying(false);
    }
  };

  const handleSaveFrame = async () => {
    if (!workout || savingFrame) return;
    setSavingFrame(true);
    try {
      const exercises = workout.exercises
        .filter((ex) => ex.exercise.id)
        .map((ex) => {
          const work = ex.sets.filter((s) => !s.isWarmup && s.reps != null);
          const reps = work.map((s) => s.reps as number);
          const lo = reps.length ? Math.min(...reps) : null;
          const hi = reps.length ? Math.max(...reps) : null;
          return { exerciseId: ex.exercise.id, targetSets: work.length || 3, targetRepRange: lo == null ? "8-12" : lo === hi ? String(lo) : `${lo}-${hi}` };
        });
      const res = await fetch("/api/frames", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: workout.frame?.name ?? workout.blockDay?.name ?? "Saved workout", exercises }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `HTTP ${res.status}`);
      toast.success("Saved as frame");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save the frame.");
    } finally {
      setSavingFrame(false);
    }
  };

  if (loading) return <div className="py-16 text-center font-body text-[13px] text-ft-dim">Loading…</div>;
  if (!workout) {
    return (
      <div className="pb-8">
        <ScreenHeader title="Session" back={{ href: "/history", label: "History" }} />
        <div className="px-5 font-body text-[13px] text-ft-light">Workout not found.</div>
      </div>
    );
  }

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
  const mins = durationMin(workout.startTime, workout.endTime);
  const title = workout.blockDay?.name ?? workout.frame?.name ?? "Workout";

  return (
    <div className="pb-8">
      <ScreenHeader title={title} back={{ href: "/history", label: "History" }} sub={`${fmtMonthDay(workout.date)}${mins !== null ? ` · ${mins} min` : ""}${workout.frame ? ` · frame ${workout.frame.name}` : ""}`} right={workout.endTime ? <Stamp tone="success">Logged</Stamp> : <Stamp tone="gold">Open</Stamp>} />

      <div className="px-5">
        <Card className="px-4 py-3.5">
          <div className="t-eyebrow mb-2">Session summary</div>
          <div className="flex gap-2">
            <Stat label="Duration" value={mins !== null ? String(mins) : "—"} unit="min" />
            <Stat label="Volume" value={totalVolume > 0 ? (totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : fmtNum(totalVolume)) : "—"} unit="lb" />
            <Stat label="Sets" value={String(totalSets)} />
            <Stat label="PRs" value={String(prCount)} />
          </div>
        </Card>
      </div>

      <div className="px-5 pb-2 pt-[18px] font-data text-[10.5px] font-bold uppercase tracking-[0.1em] text-ft-light">
        {workout.exercises.length} exercise{workout.exercises.length === 1 ? "" : "s"}
      </div>
      <div className="flex flex-col gap-2.5 px-5">
        {workout.exercises.map((ex) => {
          const workSets = ex.sets.filter((s) => !s.isWarmup);
          const hasPr = workSets.some((s) => s.isPr);
          return (
            <Card key={ex.id} band={false} className="px-3.5 pb-3.5 pt-3">
              <div className="flex items-center gap-2">
                <CategoryChip variant="solid" movementPattern={ex.exercise.movementPattern} primaryMuscle={ex.exercise.primaryMuscle ?? null} />
                <div className="min-w-0 flex-1 truncate font-data text-[14px] font-bold text-ft-white">{ex.exercise.name}</div>
                {hasPr && <Stamp tone="coral">PR</Stamp>}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {workSets.length === 0 && <span className="font-body text-[12px] text-ft-dim">No working sets</span>}
                {workSets.map((s) => (
                  <SetChip key={s.setNumber} set={s} />
                ))}
              </div>
              {ex.notes && <div className="mt-2.5 border-t border-ft-border-faint pt-2.5 font-body text-[12.5px] italic leading-snug text-ft-light">“{ex.notes}”</div>}
            </Card>
          );
        })}
      </div>

      {workout.notes && (
        <div className="mt-2.5 px-5">
          <Card band={false} className="px-3.5 py-3">
            <div className="t-eyebrow mb-1">Session notes</div>
            <p className="font-body text-[13px] leading-snug text-ft-light">{workout.notes}</p>
          </Card>
        </div>
      )}

      <div className="mt-5 flex gap-2.5 px-5">
        <Btn kind="quiet" className="flex-1" disabled={savingFrame} onClick={handleSaveFrame}>
          {savingFrame ? "Saving…" : "Save as frame"}
        </Btn>
        <Btn className="flex-[1.4]" disabled={replaying} onClick={handleRepeat}>
          {replaying ? "Creating…" : "Repeat workout"}
        </Btn>
      </div>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="font-data text-[9.5px] uppercase tracking-[0.12em] text-ft-dim">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="font-data text-[20px] font-bold tabular-nums text-ft-white">{value}</span>
        {unit && <span className="font-data text-[10.5px] text-ft-dim">{unit}</span>}
      </div>
    </div>
  );
}

function SetChip({ set }: { set: SetDetail }) {
  const bw = !set.weight;
  const rpe = set.rpe ?? (set.rir != null ? 10 - set.rir : null);
  return (
    <span className={["inline-flex items-baseline gap-[3px] rounded-ft-sm border px-2.5 py-[5px] font-data text-[12.5px] font-bold tabular-nums", set.isPr ? "border-ft-coral/50 bg-ft-coral-bg text-ft-coral" : "border-ft-border-faint bg-ft-surface-alt text-ft-white"].join(" ")}>
      <span>{bw ? "BW" : fmtNum(Number(set.weight))}</span>
      <span className="text-ft-dim">×</span>
      <span>{set.reps ?? "—"}</span>
      {rpe != null && <span className="ml-px text-[9.5px] font-normal text-ft-dim">@{rpe}</span>}
    </span>
  );
}
