"use client";

/**
 * 3.1 My Program — the Program-tier slot-1 home (Cluster 3).
 *
 * Active program → active block → today's scheduled session, all from
 * /api/home (cloud DB — Program/Gameplan tiers are DB-backed). Hosts the
 * Shelf/upgrade affordances, today card, week strip, and Planning/Switch
 * tools. Renders through the shared HomeShell + v2 BottomNav (slot 1 routes
 * here on the program tier).
 */
import { useEffect, useState } from "react";
import { HomeShell, Header, SectionLabel, Chip } from "@/components/v2";
import {
  TodayCard,
  WeekStrip,
  ProgramToolRow,
  ShelfMiniCard,
  EmptyProgram,
  weekOf,
  type HomeData,
} from "./_components";

export default function MyProgramPage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    fetch("/api/home")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: HomeData | null) => {
        if (!live) return;
        setData(d);
        setLoading(false);
      })
      .catch(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, []);

  const program = data?.activeProgram ?? null;
  const block = data?.activeBlock ?? null;
  const today = data?.scheduledDay ?? null;

  return (
    <HomeShell header={<Header kind="home" title="My Program" subtitle="Program" right="gear" />}>
      {/* Shelf affordances */}
      <div className="grid grid-cols-2 gap-2.5 px-4 pt-1">
        <ShelfMiniCard stamp="Shelf" copy="Browse more programs" href="/shelf" />
        <ShelfMiniCard stamp="Upgrade" copy="Add coaching with Gameplan" href="/shelf" />
      </div>

      {loading ? (
        <div className="px-4 pt-6 font-body text-sm text-ft-dim">Loading…</div>
      ) : !program ? (
        <EmptyProgram />
      ) : (
        <>
          {/* Active program header */}
          <div className="ft-on-bg flex items-baseline justify-between px-4 pb-1 pt-4">
            <div className="min-w-0">
              <div className="truncate font-display text-lg font-bold tracking-[-0.01em] text-ft-on-bg">{program.name}</div>
              <div className="mt-0.5 font-body text-xs text-ft-on-bg-sec">
                Week {weekOf(program.startDate, program.durationWeeks)}
                {program.durationWeeks ? ` of ${program.durationWeeks}` : ""}
                {block ? ` · ${block.name}` : ""}
              </div>
            </div>
            {block && (
              <Chip tone="accent" size="sm" onBg>
                Block {block.blockNumber}
              </Chip>
            )}
          </div>

          {/* Today card */}
          {today ? (
            <div className="px-4 pt-1">
              <TodayCard day={today} completed={!!data?.todayCompleted} startHref={`/log/${today.id}`} />
            </div>
          ) : (
            <div className="px-4 pt-1">
              <p className="rounded-ft-lg border border-dashed border-ft-border px-4 py-5 text-center font-body text-xs text-ft-dim">
                No session scheduled today — rest or log a one-off.
              </p>
            </div>
          )}

          {/* Week strip */}
          {block && block.days.length > 0 && (
            <>
              <SectionLabel right="Tap a day">This block</SectionLabel>
              <div className="px-4">
                <WeekStrip days={block.days} todayId={today?.id ?? null} />
              </div>
            </>
          )}

          {/* Tools */}
          <SectionLabel>Tools</SectionLabel>
          <div className="flex flex-col gap-2 px-4">
            <ProgramToolRow
              glyph="◇"
              title="Planning Mode"
              sub="Edit your program · sandbox · diff · undo"
              href={`/programs/${program.id}/planning`}
            />
            <ProgramToolRow glyph="⇄" title="Switch active program" sub="Your owned programs" href="/programs" />
          </div>
        </>
      )}
    </HomeShell>
  );
}
