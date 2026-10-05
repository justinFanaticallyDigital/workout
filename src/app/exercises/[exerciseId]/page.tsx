"use client";

/**
 * Exercise detail — estimated 1RM, top-weight trend, recent sets, rename and
 * category edits (PATCH /api/exercises/[id]). Full history lives at /stats/exercise/[id].
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Btn, Card, CategoryChip, CategoryPickerSheet, PromptSheet, ScreenHeader, SectionHeader, Stamp, StatCard, TrendLine } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { categoryFor } from "@/lib/categories";
import { fmtMonthDay } from "@/lib/dates";
import { fmtNum, monthLabels } from "@/lib/stats";

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
  equipment?: string | null;
  isCustom?: boolean;
  adjacent?: { prev: AdjacentExercise | null; next: AdjacentExercise | null };
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

export default function ExerciseDetailPage({ params }: { params: { exerciseId: string } }) {
  const { exerciseId } = params;
  const router = useRouter();
  const toast = useToast();
  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);
  const [history, setHistory] = useState<HistorySession[]>([]);
  const [est1RM, setEst1RM] = useState<number | null>(null);
  const [progression, setProgression] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [renameOpen, setRenameOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/exercises/${exerciseId}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/exercises/${exerciseId}/history`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/exercises/${exerciseId}/estimated-1rm`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/exercises/${exerciseId}/progression-status`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([ex, hist, e1rm, prog]) => {
        if (ex) setExercise(ex);
        if (hist?.history) setHistory(hist.history);
        if (e1rm?.estimated1RM) setEst1RM(Number(e1rm.estimated1RM));
        if (prog?.status) setProgression(prog.status);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [exerciseId]);

  const patch = async (body: Record<string, unknown>, okMsg: string) => {
    const res = await fetch(`/api/exercises/${exerciseId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) {
      toast.error((await res.json().catch(() => ({}))).error || "Couldn't save the change.");
      return false;
    }
    const updated = await res.json();
    setExercise((e) => (e ? { ...e, ...updated, adjacent: e.adjacent } : e));
    toast.success(okMsg);
    return true;
  };

  const sessions = useMemo(
    () =>
      history
        .map((s) => {
          const work = s.sets.filter((x) => !x.isWarmup && x.reps);
          const top = Math.max(0, ...work.map((x) => Number(x.weight ?? 0)));
          const best = work.reduce<HistorySet | null>((b, x) => (!b || Number(x.weight ?? 0) > Number(b.weight ?? 0) || (Number(x.weight ?? 0) === Number(b.weight ?? 0) && (x.reps ?? 0) > (b.reps ?? 0)) ? x : b), null);
          return { date: s.date, work, top, best, pr: work.some((x) => x.isPr) };
        })
        .filter((s) => s.work.length > 0),
    [history],
  );
  const trend = useMemo(() => {
    const asc = [...sessions].reverse().filter((s) => s.top > 0).slice(-12);
    return { pts: asc.map((s) => s.top), labels: monthLabels(asc.map((s) => new Date(s.date))) };
  }, [sessions]);
  const bestEver = sessions.reduce<{ weight: number; reps: number | null; date: string } | null>((b, s) => (s.best && (!b || s.top > b.weight) ? { weight: s.top, reps: s.best.reps, date: s.date } : b), null);

  if (loading) return <div className="py-16 text-center font-body text-[13px] text-ft-dim">Loading…</div>;
  if (!exercise) {
    return (
      <div className="pb-8">
        <ScreenHeader title="Exercise" back={{ href: "/exercises", label: "Exercises" }} />
        <div className="px-5 font-body text-[13px] text-ft-light">Exercise not found.</div>
      </div>
    );
  }

  const cat = categoryFor(exercise.movementPattern, exercise.primaryMuscle);
  const adj = exercise.adjacent;
  const stalled = progression === "stalled";

  return (
    <div className="pb-10">
      <ScreenHeader
        title={exercise.name}
        back={{ href: "/exercises", label: "Exercises" }}
        sub={[cat.label, exercise.primaryMuscle, exercise.equipment].filter(Boolean).join(" · ")}
        right={progression ? <Stamp tone={stalled ? "gold" : "success"}>{stalled ? "Stalled" : "Progressing"}</Stamp> : exercise.isCustom ? <Stamp tone="muted">Custom</Stamp> : undefined}
      />
      {(adj?.prev || adj?.next) && (
        <div className="mb-3 flex items-center justify-between gap-3 px-5 font-data text-[11px] text-ft-dim">
          {adj?.prev ? (
            <Link href={`/exercises/${adj.prev.id}`} className="truncate text-ft-accent">
              ‹ {adj.prev.name}
            </Link>
          ) : (
            <span />
          )}
          {adj?.next ? (
            <Link href={`/exercises/${adj.next.id}`} className="truncate text-right text-ft-accent">
              {adj.next.name} ›
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 px-5">
        <StatCard
          label="Estimated 1RM"
          right={
            est1RM ? (
              <span className="font-data text-[12px] font-bold text-ft-white">
                {fmtNum(est1RM)} <span className="font-medium text-ft-dim">LB</span>
              </span>
            ) : undefined
          }
        >
          <div className="flex gap-2">
            <Stat label="Current" value={est1RM ? fmtNum(est1RM) : "—"} unit={est1RM ? "lb" : undefined} />
            <Stat label="Top set" value={bestEver ? `${fmtNum(bestEver.weight)} × ${bestEver.reps ?? "—"}` : "—"} sub={bestEver ? fmtMonthDay(bestEver.date) : undefined} />
            <Stat label="Sessions" value={String(sessions.length)} sub="logged" />
          </div>
          {trend.pts.length > 1 && (
            <div className="mt-3 border-t border-ft-border-faint pt-3">
              <div className="t-eyebrow mb-1 !text-[9px]">Top weight per session</div>
              <TrendLine pts={trend.pts} w={330} h={60} labels={trend.labels} fmt={(v) => `${fmtNum(v)} lb`} title="Top weight per session" />
            </div>
          )}
        </StatCard>

        {progression && (
          <Card band={false} className="px-4 py-3.5">
            <div className="t-eyebrow">Progression</div>
            <div className="mt-1 font-data text-[15px] font-bold text-ft-white">{stalled ? "Top set has stalled" : "Trending up"}</div>
            <p className="mt-1 font-body text-[12.5px] leading-snug text-ft-light">{stalled ? "The same top set across recent sessions — try a rep, tempo or load change, or a lighter week." : "Keep adding load or reps while the effort stays in range."}</p>
          </Card>
        )}

        {sessions.length > 0 && (
          <>
            <SectionHeader title="Recent sets" className="!px-0" action={{ label: "Full history", href: `/stats/exercise/${exercise.id}` }} />
            {sessions.slice(0, 6).map((s, i) => (
              <Card key={`${s.date}-${i}`} band={false} className="px-3.5 py-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-data text-[11px] uppercase tracking-[0.08em] text-ft-light">{fmtMonthDay(s.date)}</span>
                  {s.pr && <Stamp tone="coral">PR</Stamp>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {s.work.map((x, si) => (
                    <SetChip key={si} set={x} />
                  ))}
                </div>
              </Card>
            ))}
          </>
        )}

        <SectionHeader title="Edit" className="!px-0" />
        <Card band={false} className="px-4 py-1">
          <button type="button" onClick={() => setRenameOpen(true)} className="flex w-full items-center gap-3 border-b border-ft-border-faint py-3 text-left">
            <div className="min-w-0 flex-1">
              <div className="font-data text-[13.5px] font-semibold text-ft-white">Rename</div>
              <div className="truncate font-body text-[11.5px] text-ft-dim">{exercise.name}</div>
            </div>
            <span className="font-data text-[14px] text-ft-accent">›</span>
          </button>
          <button type="button" onClick={() => setCategoryOpen(true)} className="flex w-full items-center gap-3 py-3 text-left">
            <div className="min-w-0 flex-1">
              <div className="font-data text-[13.5px] font-semibold text-ft-white">Category</div>
              <div className="mt-1">
                <CategoryChip variant="pill" movementPattern={exercise.movementPattern} primaryMuscle={exercise.primaryMuscle} />
              </div>
            </div>
            <span className="font-data text-[14px] text-ft-accent">›</span>
          </button>
        </Card>

        <div className="mt-2 flex gap-2.5">
          <Btn kind="quiet" href="/exercises" className="flex-1">
            Library
          </Btn>
          <Btn href="/log/new-blank" className="flex-[1.4]">
            Start a workout
          </Btn>
        </div>
      </div>

      <PromptSheet
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="Rename exercise"
        label="Name"
        initial={exercise.name}
        onSubmit={async (name) => {
          if (await patch({ name }, "Renamed")) {
            setRenameOpen(false);
            router.refresh();
          }
        }}
      />
      <CategoryPickerSheet
        open={categoryOpen}
        onClose={() => setCategoryOpen(false)}
        current={exercise.movementPattern}
        onPick={async (movementPattern) => {
          setCategoryOpen(false);
          await patch({ movementPattern }, "Category updated");
        }}
      />
    </div>
  );
}

function Stat({ label, value, unit, sub }: { label: string; value: string; unit?: string; sub?: string }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="font-data text-[9.5px] uppercase tracking-[0.12em] text-ft-dim">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="font-data text-[19px] font-bold tabular-nums text-ft-white">{value}</span>
        {unit && <span className="font-data text-[10.5px] text-ft-dim">{unit}</span>}
      </div>
      {sub && <div className="mt-0.5 font-body text-[10.5px] text-ft-dim">{sub}</div>}
    </div>
  );
}

function SetChip({ set }: { set: HistorySet }) {
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
