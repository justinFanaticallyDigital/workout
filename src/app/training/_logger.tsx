"use client";

/**
 * 2.2 Training pillar (Logger) — the first true PillarShell screen (Cluster 2).
 *
 * Pillar landing, L3 "Today" default. On the Logger tier the rail's
 * Block/Program/Gameplan slots are locked (preview, not gated). Content is
 * driven by the local logger-store (Frames + Sessions) — free tier, local only.
 * The Structure card previews the Program/Gameplan tiers (upsell, never a gate).
 */
import { useEffect, useState } from "react";
import { PillarShell, Header, SectionLabel } from "@/components/v2";
import { listFrames, listSessions, type Frame, type LocalSession } from "@/lib/logger-store";
import { RecentWorkoutCard } from "../library/_components";
import {
  ResumeCard,
  StartHero,
  WaysToLog,
  FrameRow,
  HistoryPlaceholder,
  StructureUpsell,
} from "./_components";

export default function TrainingPillarPage() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [sessions, setSessions] = useState<LocalSession[] | null>(null);

  useEffect(() => {
    let live = true;
    Promise.all([listFrames(), listSessions()]).then(([f, s]) => {
      if (!live) return;
      setFrames(f);
      setSessions(s);
    });
    return () => {
      live = false;
    };
  }, []);

  const loading = sessions === null;
  const all = sessions ?? [];
  const inProgress = all.find((s) => s.kind === "workout" && !s.finishedAt);
  const finished = all.filter((s) => s.finishedAt);
  const isEmpty = !loading && finished.length === 0 && frames.length === 0 && !inProgress;

  const lastLine = finished[0]
    ? `Last workout · ${sessionName(finished[0])} · ${relativeDay(finished[0].startedAt)}`
    : "Add lifts as you go · saved on this device";

  return (
    <PillarShell
      pillar="training"
      activeKey="today"
      header={<Header kind="home" title="Training" subtitle="Logger" right="gear" />}
    >
      {inProgress && (
        <ResumeCard
          name={sessionName(inProgress)}
          meta={`Started ${relativeDay(inProgress.startedAt).toLowerCase()}`}
          href="/log/new-blank"
        />
      )}

      <StartHero lastLine={lastLine} />

      {isEmpty ? (
        <>
          <WaysToLog />
          <HistoryPlaceholder />
        </>
      ) : loading ? (
        <div className="px-4 pt-6 font-body text-sm text-ft-dim">Loading…</div>
      ) : (
        <>
          {finished.length > 0 && (
            <>
              <SectionLabel right="Recent">Repeat</SectionLabel>
              <div className="flex gap-2.5 overflow-x-auto px-4 pb-1">
                {finished.slice(0, 6).map((s) => (
                  <RecentWorkoutCard
                    key={s.id}
                    day={relativeDay(s.startedAt)}
                    name={sessionName(s)}
                    lifts={sessionSummary(s)}
                    dur={duration(s)}
                  />
                ))}
              </div>
            </>
          )}

          <WaysToLog />

          {frames.length > 0 && (
            <>
              <SectionLabel right="All →">Saved frames</SectionLabel>
              <div className="flex flex-col gap-2 px-4">
                {frames.slice(0, 3).map((f) => (
                  <FrameRow
                    key={f.id}
                    label={f.name}
                    meta={`${f.exercises.length} lift${f.exercises.length === 1 ? "" : "s"} · used ${all.filter((s) => s.frameId === f.id).length}×`}
                    href={`/log/frame/${f.id}`}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <StructureUpsell />
    </PillarShell>
  );
}

// ── local formatting (shared shape with /library) ──
function relativeDay(ts: number): string {
  const days = Math.floor((Date.now() - ts) / 86_400_000);
  if (days <= 0) return "TODAY";
  if (days === 1) return "YESTERDAY";
  if (days < 7) return `${days} DAYS AGO`;
  const weeks = Math.floor(days / 7);
  return `${weeks} WK${weeks === 1 ? "" : "S"} AGO`;
}
function duration(s: LocalSession): string {
  if (!s.finishedAt) return "IN PROGRESS";
  return `${Math.round((s.finishedAt - s.startedAt) / 60_000)} MIN`;
}
function sessionName(s: LocalSession): string {
  const d = s.data as { name?: string } | null;
  if (d?.name) return d.name;
  return s.kind === "workout" ? "Workout" : s.kind === "meal" ? "Meal" : "Activity";
}
function sessionSummary(s: LocalSession): string {
  const d = s.data as { exercises?: { name: string }[] } | null;
  if (d?.exercises?.length) return d.exercises.map((e) => e.name).slice(0, 3).join(" · ");
  return "—";
}
