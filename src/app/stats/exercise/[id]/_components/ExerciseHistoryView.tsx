"use client";

import { BarRow, ScreenHeader, Stamp, StatCard, TrendLine } from "@/components/kit";
import { fmtLb } from "@/lib/stats";

export interface HistoryData {
  name: string;
  sub: string;
  best: string | null;
  /** Loaded work charts estimated 1RM and volume; bodyweight-only work charts reps. */
  loaded: boolean;
  trendPts: number[];
  trendLabels: string[];
  volPts: number[];
  sessions: { id: string; stamp: string; sets: number; reps: number; best: string; pr: boolean }[];
}

/** Exercise history — est. 1RM trend · volume per session · session list. */
export default function ExerciseHistoryView({ data }: { data: HistoryData }) {
  const { loaded } = data;
  const latest = data.trendPts.length ? data.trendPts[data.trendPts.length - 1] : null;
  const fmtTrend = (v: number) => (loaded ? `${fmtLb(v)} lb` : `${v} reps`);
  return (
    <div className="pb-8">
      <ScreenHeader title={data.name} back={{ href: "/stats", label: "Stats" }} sub={data.sub} right={data.best ? <Stamp tone="coral">Best {data.best}</Stamp> : undefined} />
      <div className="flex flex-col gap-3 px-5">
        <StatCard
          label={loaded ? "Est. 1RM trend" : "Best reps trend"}
          right={
            latest !== null ? (
              <span className="font-data text-[12px] font-bold text-ft-white">
                {loaded ? fmtLb(latest) : latest} <span className="font-medium text-ft-dim">{loaded ? "LB" : "REPS"}</span>
              </span>
            ) : undefined
          }
        >
          <TrendLine pts={data.trendPts} w={330} h={72} labels={data.trendLabels} fmt={fmtTrend} title={loaded ? "Estimated one-rep max per session" : "Best reps per session"} />
        </StatCard>
        <StatCard label={loaded ? "Volume per session" : "Reps per session"}>
          <BarRow bars={data.volPts} h={44} fmt={fmtTrend} title={loaded ? "Volume per session" : "Reps per session"} />
        </StatCard>
        <StatCard label="History">
          {data.sessions.length === 0 && <div className="font-body text-[12.5px] text-ft-dim">No finished sessions with this exercise yet.</div>}
          <div className="-mt-1">
            {data.sessions.map((s, i) => (
              <div key={s.id} className={["flex items-center gap-2.5 py-2.5", i < data.sessions.length - 1 ? "border-b border-ft-border-faint" : ""].join(" ")}>
                <div className="w-[52px] font-data text-[11.5px] text-ft-dim">{s.stamp}</div>
                <div className="min-w-0 flex-1 font-data text-[13px] font-semibold text-ft-white">
                  {s.sets} sets · {s.reps} reps
                </div>
                <div className={["font-data text-[12.5px] font-bold", s.pr ? "text-ft-coral" : "text-ft-white"].join(" ")}>
                  {s.best}
                  {s.pr ? " · PR" : ""}
                </div>
              </div>
            ))}
          </div>
        </StatCard>
      </div>
    </div>
  );
}
