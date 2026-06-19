"use client";

/**
 * 3.7 — Day exercise editor (block-editor.jsx · DayEditor). Per the L1 edit
 * contract, structural edits stage in a sandbox and only commit on Apply:
 *
 *   • field edits (sets / reps / RPE / progression) on existing exercises
 *   • swap an exercise for another from the library
 *   • remove an exercise
 *   • add a new exercise
 *
 * All staged client-side against a snapshot; the pending-changes footer flushes
 * them sequentially via POST / PATCH / DELETE on /api/blocks/day/[id]/exercises.
 * Discard reverts to the snapshot. Recent sessions on this template are shown
 * read-only below.
 */
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button, Chip, Stamp, SectionLabel, Stepper, TextField } from "@/components/v2";
import { useToast } from "@/components/ui/Toast";
import { EditorShell } from "../../../_editor-shell";

interface ApiExercise {
  id: string;
  name: string;
  primaryMuscle: string | null;
  equipment?: string | null;
  movementPattern?: string | null;
}
interface BlockDayExercise {
  id: string;
  exercise: { name: string };
  targetSets: number | null;
  targetRepRange: string | null;
  targetRpe: string | null;
  progressionType: string;
}
interface DayWorkout {
  id: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  exercises: { sets: { weight: number | null; reps: number | null; isWarmup: boolean }[] }[];
}
interface DayData {
  id: string;
  dayNumber: number;
  name: string;
  dayType: string;
  block: { name: string; description: string | null };
  exercises: BlockDayExercise[];
}

interface EditRow {
  id: string; // bde id, or "new-N" for staged adds
  name: string;
  sets: number;
  reps: string;
  rpe: string;
  progression: string;
  isNew: boolean;
  removed: boolean;
  edited: boolean;
  exerciseId?: string; // set for new rows + swaps (what POST/PATCH sends)
}

const PROGRESSION = ["none", "linear", "double", "wave", "rpe_based", "percentage_based"];

function toRow(bde: BlockDayExercise): EditRow {
  return {
    id: bde.id,
    name: bde.exercise.name,
    sets: bde.targetSets ?? 3,
    reps: bde.targetRepRange ?? "",
    rpe: bde.targetRpe ?? "",
    progression: bde.progressionType ?? "none",
    isNew: false,
    removed: false,
    edited: false,
  };
}

function rowPending(r: EditRow): boolean {
  if (r.isNew && r.removed) return false;
  return r.isNew || r.removed || r.edited;
}

export default function DayEditorPage({
  params,
}: {
  params: { programId: string; blockId: string; dayId: string };
}) {
  const { programId, blockId, dayId } = params;
  const router = useRouter();
  const toast = useToast();
  const [day, setDay] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<EditRow[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [workouts, setWorkouts] = useState<DayWorkout[]>([]);
  const [applying, setApplying] = useState(false);
  const [tempSeq, setTempSeq] = useState(0);
  // sheet: { mode: "add" } | { mode: "swap", rowId }
  const [sheet, setSheet] = useState<{ mode: "add" } | { mode: "swap"; rowId: string } | null>(null);

  const load = useCallback(() => {
    fetch(`/api/blocks/day/${dayId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: DayData | null) => {
        setDay(data);
        setRows(data ? data.exercises.map(toRow) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [dayId]);

  useEffect(() => {
    load();
    fetch(`/api/workouts?blockDayId=${dayId}&limit=5`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.workouts && setWorkouts(data.workouts))
      .catch(() => {});
  }, [dayId, load]);

  const setField = (id: string, patch: Partial<EditRow>) =>
    setRows((L) => L.map((r) => (r.id === id ? { ...r, ...patch, edited: r.isNew ? r.edited : true } : r)));

  const removeRow = (id: string) => setRows((L) => L.map((r) => (r.id === id ? { ...r, removed: true } : r)));

  const onPick = (ex: ApiExercise) => {
    if (!sheet) return;
    if (sheet.mode === "add") {
      const tempId = `new-${tempSeq}`;
      setTempSeq((n) => n + 1);
      setRows((L) => [
        ...L,
        { id: tempId, name: ex.name, sets: 3, reps: "8-12", rpe: "", progression: "none", isNew: true, removed: false, edited: false, exerciseId: ex.id },
      ]);
      setOpenId(tempId);
    } else {
      setRows((L) =>
        L.map((r) => (r.id === sheet.rowId ? { ...r, name: ex.name, exerciseId: ex.id, edited: r.isNew ? r.edited : true } : r)),
      );
    }
    setSheet(null);
  };

  const pendingCount = rows.filter(rowPending).length;

  const discard = () => {
    setRows(day ? day.exercises.map(toRow) : []);
    setOpenId(null);
  };

  const apply = async () => {
    setApplying(true);
    try {
      for (const r of rows) {
        if (!rowPending(r)) continue;
        if (r.isNew && !r.removed) {
          await fetch(`/api/blocks/day/${dayId}/exercises`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              exerciseId: r.exerciseId,
              targetSets: r.sets,
              targetRepRange: r.reps.trim() || null,
              targetRpe: r.rpe.trim() || null,
              progressionType: r.progression,
            }),
          });
        } else if (r.removed && !r.isNew) {
          await fetch(`/api/blocks/day/${dayId}/exercises/${r.id}`, { method: "DELETE" });
        } else if (r.edited) {
          await fetch(`/api/blocks/day/${dayId}/exercises/${r.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...(r.exerciseId ? { exerciseId: r.exerciseId } : {}),
              targetSets: r.sets,
              targetRepRange: r.reps.trim() || null,
              targetRpe: r.rpe.trim() || null,
              progressionType: r.progression,
            }),
          });
        }
      }
      toast.success("Changes applied.");
      load();
    } catch {
      toast.error("Some changes failed to apply.");
    }
    setApplying(false);
  };

  const back = () => router.push(`/programs/${programId}/blocks/${blockId}`);

  if (loading) {
    return (
      <EditorShell title="Day editor" onBack={back}>
        <p className="px-4 pt-6 font-body text-sm text-ft-dim">Loading…</p>
      </EditorShell>
    );
  }
  if (!day) {
    return (
      <EditorShell title="Day editor" onBack={back}>
        <p className="px-4 pt-6 font-body text-sm text-ft-light">Day not found.</p>
      </EditorShell>
    );
  }

  const visible = rows.filter((r) => !r.removed);

  const footer =
    pendingCount > 0 ? (
      <div className="flex items-center gap-2.5 border-t border-ft-border bg-ft-surface px-4 pb-4 pt-3">
        <div className="min-w-0 flex-1">
          <div className="font-body text-[12.5px] font-bold text-ft-white">
            {pendingCount} change{pendingCount > 1 ? "s" : ""} pending
          </div>
          <div className="mt-px font-body text-[11px] text-ft-dim">Sandbox · not yet applied</div>
        </div>
        <Button kind="ghost" size="md" disabled={applying} onClick={discard}>
          Discard
        </Button>
        <Button kind="primary" size="md" disabled={applying} onClick={apply}>
          {applying ? "Applying…" : "Apply →"}
        </Button>
      </div>
    ) : undefined;

  return (
    <EditorShell title={day.name} subtitle="Day editor" onBack={back} footer={footer} contentPad={pendingCount > 0 ? 96 : 24}>
      <SectionLabel right={`${visible.length} exercises`}>Exercises</SectionLabel>
      <div className="flex flex-col gap-2.5 px-4">
        {visible.map((r) => {
          const expanded = openId === r.id;
          const summary = `${r.sets} × ${r.reps || "—"}${r.rpe ? ` · RPE ${r.rpe}` : ""}`;
          return (
            <Card
              key={r.id}
              className="px-3.5 py-3"
              style={r.isNew || r.edited ? { borderColor: "rgb(var(--ft-accent-border))" } : undefined}
            >
              <button
                type="button"
                className="flex w-full items-center gap-2.5 text-left"
                onClick={() => setOpenId(expanded ? null : r.id)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-body text-[13.5px] font-bold text-ft-white">{r.name}</span>
                    {(r.isNew || r.edited) && (
                      <Chip tone="accent" size="sm">
                        {r.isNew ? "New" : "Edited"}
                      </Chip>
                    )}
                  </div>
                  <div className="mt-0.5 font-data text-[11px] tracking-[0.03em] text-ft-dim">{summary}</div>
                </div>
                <span
                  className="font-body text-sm text-ft-dim transition-transform"
                  style={{ transform: expanded ? "rotate(90deg)" : "none" }}
                >
                  ›
                </span>
              </button>

              {expanded && (
                <div className="mt-2 pt-1">
                  <FieldRow label="Sets">
                    <Stepper value={r.sets} step={1} min={1} max={20} onChange={(v) => setField(r.id, { sets: v })} />
                  </FieldRow>
                  <FieldRow label="Reps">
                    <TextField value={r.reps} onChange={(v) => setField(r.id, { reps: v })} placeholder="8-12" className="w-[120px]" />
                  </FieldRow>
                  <FieldRow label="RPE">
                    <TextField value={r.rpe} onChange={(v) => setField(r.id, { rpe: v })} placeholder="7-8" className="w-[120px]" />
                  </FieldRow>
                  <FieldRow label="Progression" last>
                    <select
                      value={r.progression}
                      onChange={(e) => setField(r.id, { progression: e.target.value })}
                      className="rounded-ft-md border border-ft-border bg-ft-surface-alt px-2.5 py-2 font-body text-[12.5px] text-ft-white outline-none"
                    >
                      {PROGRESSION.map((p) => (
                        <option key={p} value={p}>
                          {p.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </FieldRow>
                  <div className="mt-2.5 flex gap-2">
                    <Button kind="ghost" size="sm" className="flex-1" onClick={() => setSheet({ mode: "swap", rowId: r.id })}>
                      Swap
                    </Button>
                    <Button
                      kind="ghost"
                      size="sm"
                      className="flex-1 !text-ft-danger"
                      onClick={() => {
                        removeRow(r.id);
                        setOpenId(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        <button
          type="button"
          onClick={() => setSheet({ mode: "add" })}
          className="ft-on-bg mt-0.5 w-full rounded-ft-lg border-[1.5px] border-dashed border-ft-border-strong py-3 font-body text-[13px] font-semibold text-ft-accent-on-bg"
        >
          + Add exercise
        </button>
      </div>

      {workouts.length > 0 && (
        <>
          <SectionLabel right={`${workouts.length} session${workouts.length === 1 ? "" : "s"}`}>Recent on this template</SectionLabel>
          <div className="px-4">
            <Card className="overflow-hidden p-0">
              {workouts.map((w, i) => {
                const vol = w.exercises.reduce(
                  (s, ex) => s + ex.sets.reduce((a, st) => (st.weight && st.reps && !st.isWarmup ? a + Number(st.weight) * st.reps : a), 0),
                  0,
                );
                const dur =
                  w.startTime && w.endTime
                    ? `${Math.round((new Date(w.endTime).getTime() - new Date(w.startTime).getTime()) / 60000)} min`
                    : null;
                return (
                  <Link
                    key={w.id}
                    href={`/history/${w.id}`}
                    className={["flex items-center justify-between px-3.5 py-2.5", i === 0 ? "" : "border-t border-ft-border-faint"].join(" ")}
                  >
                    <span className="font-body text-[13px] font-semibold text-ft-white">
                      {new Date(w.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    <span className="font-data text-[11px] tracking-[0.03em] text-ft-dim">
                      {dur ? `${dur} · ` : ""}
                      {vol > 0 ? `${(vol / 1000).toFixed(1)}k lb` : "—"}
                    </span>
                  </Link>
                );
              })}
            </Card>
          </div>
        </>
      )}

      {sheet && (
        <AddExerciseSheet mode={sheet.mode} onPick={onPick} onClose={() => setSheet(null)} />
      )}
    </EditorShell>
  );
}

function FieldRow({ label, last, children }: { label: string; last?: boolean; children: React.ReactNode }) {
  return (
    <div className={["flex items-center justify-between py-2", last ? "" : "border-b border-ft-border-faint"].join(" ")}>
      <span className="font-data text-[10.5px] font-bold uppercase tracking-[0.08em] text-ft-dim">{label}</span>
      {children}
    </div>
  );
}

// ── add / swap exercise sheet ──────────────────────────────────────────────
function AddExerciseSheet({
  mode,
  onPick,
  onClose,
}: {
  mode: "add" | "swap";
  onPick: (ex: ApiExercise) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ApiExercise[]>([]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/exercises?search=${encodeURIComponent(q.trim())}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setResults(d?.exercises ?? []))
        .catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative max-h-[80%] overflow-y-auto rounded-t-ft-lg border-t border-ft-border bg-ft-surface px-4 pb-6 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <Stamp>{mode === "swap" ? "Swap exercise" : "Add exercise"}</Stamp>
            <div className="mt-0.5 font-display text-lg font-bold tracking-[-0.01em] text-ft-white">Library</div>
          </div>
          <button type="button" onClick={onClose} className="font-body text-sm text-ft-dim">
            Close
          </button>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search exercises"
          autoFocus
          className="mb-3 w-full rounded-ft-md border border-ft-border bg-ft-surface-alt px-3.5 py-2.5 font-body text-sm text-ft-white outline-none placeholder:text-ft-dim"
        />
        <div className="flex flex-col gap-2">
          {q.trim().length >= 2 && results.length === 0 && (
            <p className="px-1 py-2 font-body text-xs text-ft-dim">No matches.</p>
          )}
          {results.map((ex) => (
            <button key={ex.id} type="button" onClick={() => onPick(ex)} className="text-left">
              <Card className="flex items-center gap-3 px-3.5 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="font-body text-[13.5px] font-semibold text-ft-white">{ex.name}</div>
                  {(ex.primaryMuscle || ex.equipment) && (
                    <div className="mt-0.5 font-data text-[10.5px] tracking-[0.03em] text-ft-dim">
                      {[ex.primaryMuscle, ex.equipment].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </div>
                <span
                  className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-lg leading-none"
                  style={{ background: "rgb(var(--ft-accent-faint))", color: "rgb(var(--ft-accent))" }}
                >
                  +
                </span>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
