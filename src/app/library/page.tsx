"use client";

/**
 * 2.1 Workouts Library — the Logger-tier slot-1 home (Cluster 2).
 *
 * Lists locally-saved Frames (named workout shells) and recent local Sessions
 * from the Logger store (localStorage today, Drive later — see lib/logger-store).
 * The free tier never touches the DB here. Hosts the primary Shelf affordance
 * (the main upsell channel) and the View-as-Gameplan card once enough workouts
 * accumulate. Renders through the shared HomeShell + v2 BottomNav.
 */
import { useEffect, useState } from "react";
import { HomeShell, Header, SectionLabel } from "@/components/v2";
import { listFrames, listSessions, type Frame, type LocalSession } from "@/lib/logger-store";
import {
  ShelfAffordance,
  ViewAsGameplanCard,
  RecentWorkoutCard,
  FrameTile,
  EmptyLibrary,
} from "./_components";

export default function WorkoutsLibraryPage() {
  const [frames, setFrames] = useState<Frame[] | null>(null);
  const [sessions, setSessions] = useState<LocalSession[]>([]);

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

  const loading = frames === null;
  const isEmpty = !loading && frames.length === 0 && sessions.length === 0;
  const recent = sessions.slice(0, 8);

  return (
    <HomeShell header={<Header kind="home" title="Workouts" subtitle="Logger" right="gear" />}>
      <div className="px-4 pt-1">
        <ShelfAffordance copy="Browse Programs & Gameplans" sub="Pre-built blocks and coached plans" />
      </div>

      {isEmpty ? (
        <EmptyLibrary />
      ) : loading ? (
        <div className="px-4 pt-6 font-body text-sm text-ft-dim">Loading…</div>
      ) : (
        <>
          {sessions.length >= 5 && (
            <div className="px-4 pt-3">
              <ViewAsGameplanCard count={sessions.length} />
            </div>
          )}

          {recent.length > 0 && (
            <>
              <SectionLabel right="Recent sessions">Recent</SectionLabel>
              <div className="flex gap-2.5 overflow-x-auto px-4 pb-1">
                {recent.map((s) => (
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

          <SectionLabel right={`${frames.length} frame${frames.length === 1 ? "" : "s"}`}>
            Saved frames
          </SectionLabel>
          {frames.length === 0 ? (
            <p className="px-4 pb-4 font-body text-xs text-ft-dim">
              Finish a workout and save it as a frame to repeat it in two taps.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 px-4">
              {frames.map((f) => (
                <FrameTile
                  key={f.id}
                  label={f.name}
                  sets={`${f.exercises.length} lift${f.exercises.length === 1 ? "" : "s"}`}
                  equip={relativeDay(f.updatedAt)}
                  count={sessions.filter((s) => s.frameId === f.id).length}
                  href={`/log/frame-${f.id}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </HomeShell>
  );
}

// ── local formatting ──
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
  const min = Math.round((s.finishedAt - s.startedAt) / 60_000);
  return `${min} MIN`;
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
