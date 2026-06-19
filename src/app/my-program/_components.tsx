"use client";

/**
 * Shared Program-tier presentational helpers (Cluster 3). Used by My Program
 * (3.1) and the Training-program tab (3.2). Theme-agnostic ft-* tokens.
 */
import Link from "next/link";
import { Card, Button, Stamp } from "@/components/v2";

// ── data shapes from /api/home ──
export interface HomeExercise {
  name: string;
  movementPattern: string | null;
  targetSets: number;
  targetRepRange: string;
}
export interface HomeDay {
  id: string;
  name: string;
  dayNumber: number;
  dayType: string;
  exercises: HomeExercise[];
}
export interface HomeData {
  activeProgram: { id: string; name: string; durationWeeks: number | null; startDate: string | null; gameplanKind: string | null } | null;
  activeBlock: { id: string; name: string; blockNumber: number; durationWeeks: number | null; days: HomeDay[] } | null;
  scheduledDay: HomeDay | null;
  todayCompleted: boolean;
}

const DAY_TONE: Record<string, string> = {
  lifting: "bg-ft-push",
  cardio: "bg-ft-core",
  conditioning: "bg-ft-legs",
  mobility: "bg-ft-pull",
  rest: "bg-ft-surface-alt",
};

export function weekOf(startDate: string | null, durationWeeks: number | null): number {
  if (!startDate) return 1;
  const elapsed = Math.floor((Date.now() - new Date(startDate).getTime()) / (7 * 86_400_000)) + 1;
  const w = Math.max(1, elapsed);
  return durationWeeks ? Math.min(w, durationWeeks) : w;
}

export function setLine(e: HomeExercise): string {
  return `${e.targetSets} × ${e.targetRepRange}`;
}

/** Today card — the scheduled session for the active block day. */
export function TodayCard({
  day,
  completed,
  startHref,
}: {
  day: HomeDay;
  completed: boolean;
  startHref: string;
}) {
  return (
    <Card raised className="px-4 pb-4 pt-4">
      <div className="flex items-start gap-3">
        <div className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-ft-md bg-ft-accent-faint font-display text-xl font-bold text-ft-accent">
          {completed ? "✓" : "◐"}
        </div>
        <div className="min-w-0 flex-1">
          <Stamp>{completed ? "Today · done" : "Today"}</Stamp>
          <div className="mt-1 font-display text-xl font-bold leading-tight tracking-[-0.01em] text-ft-white">{day.name}</div>
          <div className="mt-1 font-body text-xs text-ft-dim">
            {day.exercises.length} exercise{day.exercises.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {day.exercises.length > 0 && (
        <div className="mt-3.5 flex flex-col gap-[7px] rounded-ft-md bg-ft-surface-alt px-3 py-2.5">
          {day.exercises.map((e, i) => (
            <div key={i} className="flex items-center justify-between gap-2.5">
              <span className="min-w-0 truncate font-body text-[12.5px] text-ft-white">{e.name}</span>
              <span className="flex-shrink-0 font-data text-[11.5px] tracking-[0.02em] text-ft-dim">{setLine(e)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3.5">
        <Link href={startHref} className="block">
          <Button kind="primary" size="lg" fullWidth>
            {completed ? "Log again →" : "Start workout →"}
          </Button>
        </Link>
      </div>
    </Card>
  );
}

/** Week strip — the active block's training days; today highlighted. */
export function WeekStrip({ days, todayId }: { days: HomeDay[]; todayId: string | null }) {
  return (
    <div className="flex gap-1.5">
      {days.map((d) => {
        const isToday = d.id === todayId;
        const rest = d.dayType === "rest";
        const tone = DAY_TONE[d.dayType] || "bg-ft-surface-alt";
        return (
          <Link
            key={d.id}
            href={rest ? "#" : `/log/${d.id}`}
            className={[
              "flex h-16 flex-1 flex-col items-center justify-between rounded-ft-sm py-1.5",
              rest ? "border border-ft-border-faint bg-ft-surface-alt" : tone,
              isToday ? "ring-2 ring-ft-accent" : "",
            ].join(" ")}
          >
            <span
              className={[
                "font-data text-[9px] font-semibold uppercase tracking-[0.06em]",
                rest ? "text-ft-dim" : "text-ft-on-accent",
              ].join(" ")}
            >
              D{d.dayNumber}
            </span>
            <span
              className={[
                "px-0.5 text-center font-body text-[10px] font-bold leading-tight",
                rest ? "text-ft-dim" : "text-ft-on-accent",
              ].join(" ")}
            >
              {d.dayType === "rest" ? "Rest" : d.name.split(/[-·]/)[0].trim().slice(0, 6)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function ProgramToolRow({
  glyph,
  title,
  sub,
  href,
}: {
  glyph: string;
  title: string;
  sub: string;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="flex items-center gap-3 px-3.5 py-3">
        <span className="font-display text-lg text-ft-accent">{glyph}</span>
        <div className="min-w-0 flex-1">
          <div className="font-body text-[13px] font-semibold text-ft-white">{title}</div>
          <div className="mt-px font-body text-[11.5px] text-ft-dim">{sub}</div>
        </div>
        <span className="font-body text-base text-ft-dim">›</span>
      </Card>
    </Link>
  );
}

export function ShelfMiniCard({ stamp, copy, href }: { stamp: string; copy: string; href: string }) {
  return (
    <Link href={href} className="block">
      <Card className="flex h-full flex-col gap-1 px-3 py-3">
        <Stamp>{stamp}</Stamp>
        <div className="font-body text-[13px] font-semibold leading-tight text-ft-white">{copy}</div>
        <span className="mt-0.5 font-body text-[11.5px] font-semibold text-ft-accent">Browse →</span>
      </Card>
    </Link>
  );
}

export function EmptyProgram() {
  return (
    <div className="flex flex-col items-center gap-3.5 px-6 pt-9 text-center">
      <div className="inline-flex h-24 w-24 items-center justify-center rounded-ft-lg border border-dashed border-ft-border bg-ft-surface-alt font-display text-2xl text-ft-dim">
        ◇
      </div>
      <div>
        <div className="ft-on-bg font-display text-[19px] font-bold tracking-[-0.01em] text-ft-on-bg">No active program</div>
        <div className="ft-on-bg mx-auto mt-1 max-w-[280px] font-body text-[13px] leading-relaxed text-ft-on-bg-sec">
          Activate one of your programs, or browse the shelf for something new.
        </div>
      </div>
      <div className="flex w-full max-w-[260px] flex-col gap-2">
        <Link href="/programs" className="block">
          <Button kind="primary" size="lg" fullWidth>
            Activate a program
          </Button>
        </Link>
        <Link href="/shelf" className="block">
          <Button kind="ghost" size="md" fullWidth onBg>
            Browse the shelf →
          </Button>
        </Link>
      </div>
    </div>
  );
}
