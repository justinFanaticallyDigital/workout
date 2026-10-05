"use client";

/**
 * Workout logger — /log/[workoutId]
 *
 * workoutId is a BlockDay id (a plan day) or "new-blank" (an improv workout,
 * or a frame start that pre-filled the draft). Lanes of tappable set cells;
 * a set sheet logs weight × reps (× RPE) and starts the rest timer; the
 * draft autosaves to localStorage every 2 s (24 h TTL); Finish writes the
 * Workout → WorkoutExercises → Sets (PRs detected server-side), then offers
 * Save as frame. Offline, the finished session is queued and synced later.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Btn, Card, ConfirmSheet, ExercisePickerSheet, Orbit, Stamp, type PickedExercise } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { addToQueue } from "@/lib/offline-queue";
import { fmtHeaderDate } from "@/lib/dates";
import Lane from "./_logger/Lane";
import SetSheet from "./_logger/SetSheet";
import FinishBar from "./_logger/FinishBar";
import FinishSheet from "./_logger/FinishSheet";
import LaneMenuSheet from "./_logger/LaneMenuSheet";
import { DRAFT_TTL_MS, EMPTY_PROGRESSION, draftKey, makeExercise, normalizeDraftExercise, type ActiveCell, type ExerciseData, type LastSet, type ProgressionInfo, type Suggestion, type WorkoutDraft } from "./_logger/types";

const DEFAULT_REST_SECONDS = 90;

interface BlockDayData {
  id: string;
  blockId: string;
  name: string;
  block: { name: string; program?: { id: string; name: string; blocks?: { id: string }[] } | null };
  exercises: {
    id: string;
    exerciseId: string;
    exercise: { name: string; movementPattern: string | null; primaryMuscle: string | null };
    targetSets: number | null;
    targetRepRange: string | null;
    targetRpe: number | string | null;
    progressionType: string;
    progressionIncrement: number | string | null;
    notes?: string | null;
  }[];
}

/** Last session, estimated 1RM and stall status for one exercise — best effort. */
async function fetchProgression(exerciseId: string): Promise<{ lastSets: LastSet[]; progressionInfo: ProgressionInfo }> {
  const get = (url: string) => fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const [perf, e1rm, status] = await Promise.all([
    get(`/api/exercises/${exerciseId}/last-performance`),
    get(`/api/exercises/${exerciseId}/estimated-1rm`),
    get(`/api/exercises/${exerciseId}/progression-status`),
  ]);
  return {
    lastSets: (perf?.lastPerformance?.sets as LastSet[] | undefined) ?? [],
    progressionInfo: { estimated1RM: e1rm?.estimated1RM ?? null, progressionStatus: status?.status ?? null, stalledSessions: status?.sessions ?? 0 },
  };
}

function calcSuggestion(progressionType: string, increment: number | null, lastSets: LastSet[], targetRepRange: string, info: ProgressionInfo): Suggestion | null {
  if (lastSets.length === 0) return null;
  const lastWeight = lastSets[0]?.weight;
  if (!lastWeight) return null;
  if (progressionType === "linear" && increment) return { weight: lastWeight + increment, hint: `+${increment}` };
  if (progressionType === "double") {
    const topReps = parseInt(targetRepRange.split(/[-–]/).pop() ?? "12", 10);
    if (lastSets.every((s) => s.reps && s.reps >= topReps)) {
      const inc = increment ?? 5;
      return { weight: lastWeight + inc, hint: `+${inc} (hit top reps)` };
    }
    return { weight: lastWeight, hint: "Same weight, try +1 rep" };
  }
  if (progressionType === "rpe_based") {
    const lastRpe = lastSets[0]?.rir != null ? 10 - lastSets[0].rir : null;
    if (lastRpe && lastRpe < 7) {
      const inc = increment ?? 5;
      return { weight: lastWeight + inc, hint: `+${inc} (RPE was ${lastRpe})` };
    }
    return { weight: lastWeight, hint: "RPE on target" };
  }
  if (progressionType === "wave") {
    const base = info.estimated1RM ?? lastWeight;
    const cycle = (increment ? Math.round(increment) : 0) % 4;
    const mult = [0.75, 0.82, 0.9, 0.6][cycle];
    const scheme = [{ sets: 3, reps: 10 }, { sets: 4, reps: 8 }, { sets: 5, reps: 5 }, { sets: 3, reps: 10 }][cycle];
    return { weight: Math.round(base * mult), hint: `${["Accumulation", "Intensify", "Peak", "Deload"][cycle]} (${Math.round(mult * 100)}% of 1RM)`, ...scheme };
  }
  if (progressionType === "percentage_based" && info.estimated1RM) {
    const pct = increment ?? 75;
    return { weight: Math.round(info.estimated1RM * (pct / 100)), hint: `${pct}% of e1RM (${info.estimated1RM})` };
  }
  return null;
}

export default function ActiveWorkoutPage({ params }: { params: { workoutId: string } }) {
  const { workoutId } = params;
  const router = useRouter();
  const toast = useToast();
  const isBlank = workoutId === "new-blank";
  const key = draftKey(workoutId);

  const [blockDayId, setBlockDayId] = useState<string>("");
  const [blockId, setBlockId] = useState<string>("");
  const [dayName, setDayName] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const [frameId, setFrameId] = useState<string | null>(null);
  const [frameName, setFrameName] = useState<string | null>(null);
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [restored, setRestored] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const [menuIdx, setMenuIdx] = useState<number | null>(null);
  const [picker, setPicker] = useState<{ mode: "add" } | { mode: "swap"; index: number } | null>(null);
  const [removeIdx, setRemoveIdx] = useState<number | null>(null);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [finished, setFinished] = useState<{ sets: number; volume: number; seconds: number; prs: number } | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── draft autosave (2 s debounce) ──
  const saveDraft = useCallback(() => {
    const draft: WorkoutDraft = { exercises, workoutNotes, savedAt: Date.now(), frameId, frameName };
    try {
      localStorage.setItem(key, JSON.stringify(draft));
      setLastSavedAt(draft.savedAt);
    } catch {
      /* storage full or unavailable */
    }
  }, [key, exercises, workoutNotes, frameId, frameName]);

  useEffect(() => {
    if (loading || exercises.length === 0) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(saveDraft, 2000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [exercises, workoutNotes, loading, saveDraft]);

  useEffect(() => {
    const flush = () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
        saveDraft();
      }
    };
    window.addEventListener("beforeunload", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("pagehide", flush);
    };
  }, [saveDraft]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  // ── load: draft first, else the plan day ──
  const hydrate = useCallback((list: ExerciseData[]) => {
    list.forEach((ex) => {
      if (!ex.exerciseId) return;
      fetchProgression(ex.exerciseId).then(({ lastSets, progressionInfo }) => {
        setExercises((prev) =>
          prev.map((e) => (e.id === ex.id ? { ...e, lastSets, progressionInfo, suggestedWeight: calcSuggestion(e.progressionType, e.progressionIncrement, lastSets, e.targetRepRange, progressionInfo) } : e)),
        );
      });
    });
  }, []);

  useEffect(() => {
    const readDraft = (): WorkoutDraft | null => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const draft = JSON.parse(raw) as WorkoutDraft;
        if (!draft.savedAt || Date.now() - draft.savedAt > DRAFT_TTL_MS) return null;
        return draft;
      } catch {
        return null;
      }
    };
    const applyDraft = (draft: WorkoutDraft, fromFrame: boolean) => {
      const list = (draft.exercises ?? []).map((e) => normalizeDraftExercise(e as ExerciseData & { category?: string }));
      setExercises(list);
      setWorkoutNotes(draft.workoutNotes ?? "");
      setFrameId(draft.frameId ?? null);
      setFrameName(draft.frameName ?? null);
      // A frame start is a fresh pre-fill, not a restored session.
      setRestored(!fromFrame && list.some((e) => e.sets.some((s) => s.done)));
      hydrate(list.filter((e) => e.lastSets.length === 0));
    };

    if (isBlank) {
      const draft = readDraft();
      if (draft) applyDraft(draft, !!draft.frameId && !draft.exercises.some((e) => e.sets.some((s) => s.done)));
      setLoading(false);
      return;
    }

    fetch(`/api/blocks/day/${workoutId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: BlockDayData | null) => {
        if (!data) {
          setLoading(false);
          return;
        }
        setBlockDayId(data.id);
        setBlockId(data.blockId);
        setDayName(data.name);
        setPlanName(data.block.program?.name ?? data.block.name);
        const draft = readDraft();
        if (draft) {
          applyDraft(draft, false);
          setLoading(false);
          return;
        }
        const list = data.exercises.map((bde) =>
          makeExercise({
            id: bde.id,
            exerciseId: bde.exerciseId,
            name: bde.exercise.name,
            movementPattern: bde.exercise.movementPattern,
            primaryMuscle: bde.exercise.primaryMuscle,
            targetSets: bde.targetSets,
            targetRepRange: bde.targetRepRange,
            targetRpe: bde.targetRpe,
            progressionType: bde.progressionType,
            progressionIncrement: bde.progressionIncrement != null ? Number(bde.progressionIncrement) : null,
            notes: bde.notes ?? null,
          }),
        );
        setExercises(list);
        setLoading(false);
        hydrate(list);
      })
      .catch(() => setLoading(false));
  }, [workoutId, isBlank, key, hydrate]);

  // ── set + exercise handlers ──
  const commitSet = useCallback((exIdx: number, setIdx: number, v: { weight: number; reps: number; rir: number | null }) => {
    setExercises((prev) =>
      prev.map((ex, ei) => {
        if (ei !== exIdx) return ex;
        const sets = ex.sets.map((s, si) => (si === setIdx ? { ...s, weight: v.weight, reps: v.reps, rir: v.rir, done: true } : s));
        for (let i = setIdx + 1; i < sets.length; i++) if (sets[i].weight === null) sets[i] = { ...sets[i], weight: v.weight };
        return { ...ex, sets };
      }),
    );
    setRestEndsAt(Date.now() + DEFAULT_REST_SECONDS * 1000);
  }, []);

  const addSet = useCallback((exIdx: number) => {
    setExercises((prev) => prev.map((ex, ei) => (ei === exIdx ? { ...ex, sets: [...ex.sets, { set: ex.sets.length + 1, weight: null, reps: null, rir: null, done: false }] } : ex)));
  }, []);

  const addExercise = useCallback(
    (ex: PickedExercise) => {
      const row = makeExercise({ id: `added-${Date.now()}`, exerciseId: ex.id, name: ex.name, movementPattern: ex.movementPattern, primaryMuscle: ex.primaryMuscle });
      setExercises((prev) => [...prev, row]);
      setPicker(null);
      hydrate([row]);
    },
    [hydrate],
  );

  const swapExercise = useCallback(
    (index: number, ex: PickedExercise) => {
      let swapped: ExerciseData | null = null;
      setExercises((prev) =>
        prev.map((e, i) => {
          if (i !== index) return e;
          swapped = { ...e, exerciseId: ex.id, name: ex.name, movementPattern: ex.movementPattern, primaryMuscle: ex.primaryMuscle, lastSets: [], suggestedWeight: null, progressionInfo: EMPTY_PROGRESSION };
          return swapped;
        }),
      );
      setPicker(null);
      if (swapped) hydrate([swapped]);
    },
    [hydrate],
  );

  const removeExercise = (index: number) => setExercises((prev) => prev.filter((_, i) => i !== index));

  // ── totals ──
  const totals = useMemo(() => {
    let setsDone = 0;
    let setsTotal = 0;
    let volume = 0;
    let exDone = 0;
    for (const ex of exercises) {
      let all = ex.sets.length > 0;
      for (const s of ex.sets) {
        setsTotal++;
        if (s.done) {
          setsDone++;
          if (s.weight != null && s.reps != null) volume += s.weight * s.reps;
        } else all = false;
      }
      if (all) exDone++;
    }
    return { setsDone, setsTotal, volume, exDone };
  }, [exercises]);

  // ── finish ──
  const handleFinish = async () => {
    setConfirmFinish(false);
    const logged = exercises.filter((ex) => ex.exerciseId && ex.sets.some((s) => s.done && s.weight !== null && s.reps !== null));
    if (logged.length === 0) {
      toast.warn("Log at least one set before finishing.");
      return;
    }
    setFinishing(true);
    const endTime = new Date();
    try {
      const workoutRes = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: endTime.toISOString(), startTime: new Date(startTime).toISOString(), blockId: blockId || null, blockDayId: blockDayId || null, frameId, notes: workoutNotes || null }),
      });
      if (!workoutRes.ok) throw new Error(`Create workout failed (${workoutRes.status})`);
      const workout = await workoutRes.json();
      let prs = 0;
      for (const ex of logged) {
        const weRes = await fetch(`/api/workouts/${workout.id}/exercises`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ exerciseId: ex.exerciseId, notes: ex.notes || null }) });
        if (!weRes.ok) throw new Error(`Add exercise "${ex.name}" failed (${weRes.status})`);
        const we = await weRes.json();
        for (const s of ex.sets.filter((s) => s.done && s.weight !== null && s.reps !== null)) {
          const setRes = await fetch("/api/sets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workoutExerciseId: we.id, weight: s.weight, reps: s.reps, rir: s.rir }) });
          if (!setRes.ok) throw new Error(`Log set failed for "${ex.name}" (${setRes.status})`);
          const data = await setRes.json();
          if (data.isPr) {
            prs++;
            toast.success(`PR · ${ex.name} ${s.weight} × ${s.reps}`);
          }
        }
      }
      const patch = await fetch(`/api/workouts/${workout.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endTime: endTime.toISOString(), notes: workoutNotes || null }) });
      if (!patch.ok) throw new Error(`Finalize workout failed (${patch.status})`);
      localStorage.removeItem(key);
      setFinishing(false);
      setFinished({ sets: totals.setsDone, volume: totals.volume, seconds: Math.floor((endTime.getTime() - startTime) / 1000), prs });
    } catch (err) {
      const offline = !navigator.onLine || (err instanceof TypeError && err.message === "Failed to fetch");
      if (offline) {
        addToQueue({
          id: `offline-${Date.now()}`,
          queuedAt: Date.now(),
          payload: {
            date: endTime.toISOString(),
            startTime: new Date(startTime).toISOString(),
            blockId: blockId || null,
            blockDayId: blockDayId || null,
            frameId,
            notes: workoutNotes || null,
            exercises: logged.map((ex) => ({ exerciseId: ex.exerciseId, notes: ex.notes || null, sets: ex.sets.filter((s) => s.done && s.weight !== null && s.reps !== null).map((s) => ({ weight: s.weight!, reps: s.reps!, rir: s.rir })) })),
          },
        });
        localStorage.removeItem(key);
        toast.info("Offline — saved on this device, syncs when you reconnect.");
        router.push("/training");
        return;
      }
      console.error("Workout save failed:", err);
      toast.error(err instanceof Error ? err.message : "Couldn't save the workout.");
      setFinishing(false);
    }
  };

  const saveFrame = async (name: string): Promise<boolean> => {
    const rows = exercises.filter((e) => e.exerciseId);
    try {
      const res = await fetch("/api/frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          focus: planName ?? frameName ?? null,
          exercises: rows.map((e) => ({ exerciseId: e.exerciseId, targetSets: e.sets.length || e.targetSets, targetRepRange: e.targetRepRange, targetRpe: e.targetRpe })),
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `HTTP ${res.status}`);
      toast.success("Saved as frame");
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save the frame.");
      return false;
    }
  };

  // ── render ──
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="font-body text-sm text-ft-dim">Loading workout…</p>
      </div>
    );
  }

  const title = dayName ?? frameName ?? "Blank workout";
  const context = planName ?? (frameName ? "Frame" : "Blank");
  const savedAgo = lastSavedAt ? Math.max(0, Math.round((Date.now() - lastSavedAt) / 1000)) : null;
  void tick;
  const active = activeCell && exercises[activeCell.exerciseIdx] ? exercises[activeCell.exerciseIdx] : null;
  const activeSet = active && activeCell ? active.sets[activeCell.setIdx] : null;

  return (
    <div className="pb-40">
      <div className="px-5 pt-2">
        <Link href="/training" className="t-link inline-flex items-center gap-1">
          <span className="text-[13px] leading-none">‹</span> Training
        </Link>
      </div>
      <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-1.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Orbit size={16} />
            <h1 className="t-title truncate !text-[16px]">{title}</h1>
          </div>
          <div className="mt-[3px] font-data text-[12px] uppercase tracking-[0.06em] text-ft-light">
            {context} · {fmtHeaderDate()}
          </div>
        </div>
        <Stamp className="mt-1 flex-shrink-0">
          {totals.exDone} of {exercises.length} done
        </Stamp>
      </div>

      {restored && (
        <div className="mx-5 mb-3 flex items-center justify-between rounded-ft-md border border-ft-border bg-ft-surface px-3 py-2">
          <span className="font-body text-[12px] text-ft-light">Draft restored</span>
          <button type="button" onClick={() => setRestored(false)} className="t-link">
            Dismiss
          </button>
        </div>
      )}

      {exercises.length === 0 ? (
        <div className="px-5">
          <Card className="flex flex-col items-center gap-3 px-4 py-6">
            <p className="text-center font-body text-[13.5px] text-ft-light">No exercises yet.</p>
            <Btn kind="ghost" small onClick={() => setPicker({ mode: "add" })}>
              + Add exercise
            </Btn>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 px-5">
          {exercises.map((ex, i) => (
            <Lane
              key={ex.id}
              exercise={ex}
              activeSetIdx={activeCell?.exerciseIdx === i ? activeCell.setIdx : null}
              onTapSet={(setIdx) => setActiveCell({ exerciseIdx: i, setIdx })}
              onAddSet={() => addSet(i)}
              onMenu={() => setMenuIdx(i)}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between px-5 pt-2.5">
        <button type="button" onClick={() => setPicker({ mode: "add" })} className="font-data text-[11px] uppercase tracking-[0.12em] text-ft-accent">
          + Add exercise
        </button>
        <span className="font-data text-[11px] uppercase tracking-[0.12em] text-ft-dim">{savedAgo != null ? `Draft saved · ${savedAgo}s` : exercises.length ? "Unsaved" : ""}</span>
      </div>

      {exercises.length > 0 && (
        <div className="mt-4 px-5">
          <Card band={false} className="px-3.5 py-3">
            <div className="t-eyebrow mb-1">Notes</div>
            <textarea
              rows={2}
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              placeholder="Session notes"
              className="w-full resize-none bg-transparent font-body text-[13.5px] text-ft-white outline-none placeholder:text-ft-muted"
            />
          </Card>
        </div>
      )}

      {active && activeCell && activeSet && (
        <SetSheet
          exerciseName={active.name}
          movementPattern={active.movementPattern}
          primaryMuscle={active.primaryMuscle}
          setIdx={activeCell.setIdx}
          targetReps={active.targetRepRange}
          targetRpe={active.targetRpe}
          initial={{ weight: activeSet.weight, reps: activeSet.reps, rir: activeSet.rir }}
          last={active.lastSets[activeCell.setIdx] ? { weight: active.lastSets[activeCell.setIdx].weight, reps: active.lastSets[activeCell.setIdx].reps } : null}
          suggestion={active.suggestedWeight}
          onCommit={(v) => {
            commitSet(activeCell.exerciseIdx, activeCell.setIdx, v);
            setActiveCell(null);
          }}
          onCancel={() => setActiveCell(null)}
        />
      )}

      <ExercisePickerSheet
        open={picker !== null}
        onClose={() => setPicker(null)}
        title={picker?.mode === "swap" ? "Swap exercise" : "Add exercise"}
        onPick={(ex) => {
          if (picker?.mode === "swap") swapExercise(picker.index, ex);
          else addExercise(ex);
        }}
      />
      <LaneMenuSheet
        open={menuIdx !== null}
        name={menuIdx !== null ? exercises[menuIdx]?.name ?? null : null}
        onClose={() => setMenuIdx(null)}
        onSwap={() => {
          if (menuIdx === null) return;
          setPicker({ mode: "swap", index: menuIdx });
          setMenuIdx(null);
        }}
        onRemove={() => {
          if (menuIdx === null) return;
          const ex = exercises[menuIdx];
          const logged = ex.sets.some((s) => s.done);
          setMenuIdx(null);
          if (logged) setRemoveIdx(menuIdx);
          else removeExercise(menuIdx);
        }}
      />
      <ConfirmSheet
        open={removeIdx !== null}
        onClose={() => setRemoveIdx(null)}
        title="Remove exercise"
        body={removeIdx !== null ? `${exercises[removeIdx]?.name} has logged sets. Remove it and discard them?` : null}
        confirmLabel="Remove"
        danger
        onConfirm={() => {
          if (removeIdx !== null) removeExercise(removeIdx);
          setRemoveIdx(null);
        }}
      />
      <ConfirmSheet
        open={confirmFinish}
        onClose={() => setConfirmFinish(false)}
        title="Finish workout"
        body={`${totals.setsDone} of ${totals.setsTotal} sets logged. Finish and save this session?`}
        confirmLabel="Finish"
        onConfirm={handleFinish}
      />

      {exercises.length > 0 && !finished && (
        <FinishBar
          setsDone={totals.setsDone}
          setsTotal={totals.setsTotal}
          totalVolume={totals.volume}
          startTime={startTime}
          restEndsAt={restEndsAt}
          restTotalSec={DEFAULT_REST_SECONDS}
          onClearRest={() => setRestEndsAt(null)}
          finishing={finishing}
          onFinish={() => setConfirmFinish(true)}
        />
      )}

      {finished && (
        <FinishSheet
          open
          stats={finished}
          defaultFrameName={frameName ?? dayName ?? "Saved workout"}
          exerciseCount={exercises.filter((e) => e.exerciseId).length}
          canSaveFrame={exercises.some((e) => e.exerciseId)}
          onSaveFrame={saveFrame}
          onDone={() => {
            router.push("/training");
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
