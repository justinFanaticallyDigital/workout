"use client";

/** Workout history — finished and open sessions, newest first, with an optional date range. */
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Btn, Card, ScreenHeader, Stamp } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { authCheck, toastError } from "@/lib/fetch-helpers";
import { fmtMonthDay } from "@/lib/dates";
import { fmtLb } from "@/lib/stats";

interface WorkoutSummary {
  id: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  notes: string | null;
  blockDay: { name: string } | null;
  frame?: { name: string } | null;
  exercises: { exercise: { name: string }; sets: { weight: number | null; reps: number | null; isWarmup: boolean }[] }[];
}

const LIMIT = 20;

function formatDuration(start: string | null, end: string | null): string {
  if (!start || !end) return "—";
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function calcVolume(exercises: WorkoutSummary["exercises"]): number {
  let vol = 0;
  for (const ex of exercises) for (const s of ex.sets) if (s.weight && s.reps && !s.isWarmup) vol += Number(s.weight) * s.reps;
  return vol;
}

export default function HistoryPage() {
  const toast = useToast();
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchWorkouts = useCallback(
    (off: number, append: boolean, from?: string, to?: string) => {
      const params = new URLSearchParams({ limit: String(LIMIT), offset: String(off) });
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      fetch(`/api/workouts?${params}`)
        .then(authCheck)
        .then((res) => res.json())
        .then((data) => {
          const fetched: WorkoutSummary[] = data.workouts ?? [];
          setWorkouts((prev) => (append ? [...prev, ...fetched] : fetched));
          setHasMore(fetched.length === LIMIT);
          setLoading(false);
        })
        .catch((err: unknown) => {
          toastError(toast, "Couldn't load the history")(err);
          setLoading(false);
        });
    },
    [toast],
  );

  useEffect(() => {
    fetchWorkouts(0, false);
  }, [fetchWorkouts]);

  const applyDateFilter = () => {
    setOffset(0);
    setLoading(true);
    fetchWorkouts(0, false, dateFrom || undefined, dateTo || undefined);
  };
  const clearDateFilter = () => {
    setDateFrom("");
    setDateTo("");
    setOffset(0);
    setLoading(true);
    fetchWorkouts(0, false);
  };
  const loadMore = () => {
    const next = offset + LIMIT;
    setOffset(next);
    fetchWorkouts(next, true, dateFrom || undefined, dateTo || undefined);
  };

  const filtered = !!(dateFrom || dateTo);
  const inputCls = "w-full rounded-ft-sm border border-ft-border bg-ft-surface-raised px-2.5 py-2 font-data text-[12.5px] text-ft-white outline-none focus:border-ft-accent";

  return (
    <div className="pb-8">
      <ScreenHeader title="History" back={{ href: "/stats", label: "Stats" }} right={!loading ? <Stamp>{workouts.length}{hasMore ? "+" : ""} sessions</Stamp> : undefined} />
      <div className="px-5 pb-3.5">
        <Card band={false} className="flex items-end gap-2 px-3.5 py-3">
          <label className="min-w-0 flex-1">
            <span className="t-eyebrow !text-[9px]">From</span>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={`mt-1 ${inputCls}`} />
          </label>
          <label className="min-w-0 flex-1">
            <span className="t-eyebrow !text-[9px]">To</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={`mt-1 ${inputCls}`} />
          </label>
          <Btn small onClick={applyDateFilter} disabled={!dateFrom && !dateTo}>
            Filter
          </Btn>
          {filtered && (
            <Btn kind="quiet" small onClick={clearDateFilter}>
              Clear
            </Btn>
          )}
        </Card>
      </div>

      <div className="flex flex-col gap-2.5 px-5">
        {loading && <div className="py-6 text-center font-body text-[13px] text-ft-dim">Loading…</div>}
        {!loading && workouts.length === 0 && (
          <Card className="px-4 py-4">
            <div className="font-data text-[14.5px] font-bold text-ft-white">{filtered ? "No sessions in this range" : "No sessions yet"}</div>
            <p className="mt-1 font-body text-[13px] text-ft-light">{filtered ? "Try a wider date range." : "Finish a workout from the Training tab and it shows up here."}</p>
            {!filtered && (
              <Btn small href="/training" className="mt-3">
                Go to Training
              </Btn>
            )}
          </Card>
        )}
        {!loading &&
          workouts.map((w) => {
            const volume = calcVolume(w.exercises);
            const names = w.exercises.slice(0, 4).map((e) => e.exercise.name);
            const setCount = w.exercises.reduce((sum, e) => sum + e.sets.filter((s) => !s.isWarmup).length, 0);
            const title = w.blockDay?.name ?? w.frame?.name ?? "Workout";
            return (
              <Link key={w.id} href={`/history/${w.id}`} className="block">
                <Card className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-data text-[13px] font-bold text-ft-white">{fmtMonthDay(w.date)}</span>
                    <span className="min-w-0 flex-1 truncate font-data text-[12px] text-ft-light">{title}</span>
                    {!w.endTime && <Stamp tone="gold">Open</Stamp>}
                    <span className="font-data text-[14px] text-ft-accent">›</span>
                  </div>
                  <p className="mt-1 truncate font-body text-[12px] text-ft-dim">
                    {names.join(", ")}
                    {w.exercises.length > 4 ? ` +${w.exercises.length - 4} more` : ""}
                    {w.exercises.length === 0 ? "No exercises" : ""}
                  </p>
                  <div className="mt-2 flex gap-5">
                    <Mini label="lb vol" value={volume > 0 ? fmtLb(volume) : "—"} />
                    <Mini label="Sets" value={String(setCount)} />
                    <Mini label="Time" value={formatDuration(w.startTime, w.endTime)} />
                  </div>
                </Card>
              </Link>
            );
          })}
        {!loading && hasMore && workouts.length > 0 && (
          <button type="button" onClick={loadMore} className="w-full rounded-ft-lg border-[1.6px] border-dashed border-ft-border px-4 py-[11px] text-center font-data text-[11.5px] font-bold uppercase tracking-[0.12em] text-ft-light">
            Load more
          </button>
        )}
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="leading-none">
      <div className="font-data text-[13px] font-bold tabular-nums text-ft-white">{value}</div>
      <div className="mt-[3px] font-data text-[9px] uppercase tracking-[0.14em] text-ft-dim">{label}</div>
    </div>
  );
}
