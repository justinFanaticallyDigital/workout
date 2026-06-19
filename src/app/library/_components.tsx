"use client";

/**
 * Presentational helpers for the Workouts Library (2.1). Ported from the
 * prototype tier-homes screens; theme-agnostic (ft-* tokens), Blueprint-safe.
 */
import Link from "next/link";
import { Card, Stamp, Button } from "@/components/v2";

/** Striped SVG placeholder for program/gameplan art (no real assets yet). */
export function Thumb({ kind = "program" }: { kind?: "program" | "gameplan" }) {
  if (kind === "gameplan") {
    return (
      <svg viewBox="0 0 200 80" className="block h-full w-full">
        <rect x="0" y="0" width="200" height="80" className="fill-ft-surface-alt" />
        <path d="M 12 60 Q 100 5 188 50" className="stroke-ft-accent" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="12" cy="60" r="4" className="fill-ft-border-strong" />
        <circle cx="135" cy="28" r="3" className="fill-ft-accent" opacity="0.7" />
        <circle cx="188" cy="50" r="5" className="fill-ft-accent" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 80" className="block h-full w-full">
      <rect x="0" y="0" width="200" height="80" className="fill-ft-surface-alt" />
      {Array.from({ length: 7 }).map((_, i) => (
        <rect
          key={i}
          x={10 + i * 26}
          y={10}
          width="22"
          height="40"
          className={i === 2 ? "fill-ft-accent" : "fill-ft-border-faint"}
          opacity={i === 2 ? 1 : 0.6}
        />
      ))}
    </svg>
  );
}

export function ShelfAffordance({
  copy,
  sub,
  href = "/shelf",
  kind = "program",
}: {
  copy: string;
  sub: string;
  href?: string;
  kind?: "program" | "gameplan";
}) {
  return (
    <Link href={href} className="block">
      <Card className="flex items-center gap-3 px-4 py-3.5">
        <div className="h-14 w-[72px] flex-shrink-0 overflow-hidden rounded-ft-sm">
          <Thumb kind={kind} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-body text-[13.5px] font-semibold leading-tight text-ft-white">{copy}</div>
          <div className="mt-0.5 font-body text-[11.5px] leading-snug text-ft-dim">{sub}</div>
        </div>
        <span className="whitespace-nowrap font-body text-xs font-bold text-ft-accent">Browse →</span>
      </Card>
    </Link>
  );
}

export function ViewAsGameplanCard({ count, href = "/library/as-gameplan" }: { count: number; href?: string }) {
  return (
    <Link href={href} className="block">
      <Card className="flex items-center gap-3 px-4 py-3.5" style={{ borderColor: "rgb(var(--ft-accent-border))" }}>
        <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-ft-accent-faint font-display text-lg font-bold text-ft-accent">
          ↗
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-body text-[13px] font-semibold leading-tight text-ft-white">
            See your <span className="text-ft-accent">{count} workouts</span> as a Gameplan
          </div>
          <div className="mt-0.5 font-body text-[11px] leading-snug text-ft-dim">
            Preview adherence, week strip, and recommendations.
          </div>
        </div>
        <span className="font-body text-base text-ft-accent">›</span>
      </Card>
    </Link>
  );
}

export function RecentWorkoutCard({
  day,
  name,
  lifts,
  dur,
  href,
}: {
  day: string;
  name: string;
  lifts: string;
  dur: string;
  href?: string;
}) {
  const inner = (
    <Card className="flex w-[168px] flex-shrink-0 flex-col gap-1.5 px-3 py-3">
      <Stamp>{day}</Stamp>
      <div className="font-display text-[14.5px] font-semibold leading-tight text-ft-white">{name}</div>
      <div className="font-body text-[11px] leading-snug text-ft-dim">{lifts}</div>
      <div className="mt-auto flex items-center justify-between border-t border-ft-border-faint pt-1.5">
        <span className="font-data text-[10.5px] tracking-[0.04em] text-ft-dim">{dur}</span>
        <span className="font-body text-[11px] font-semibold text-ft-accent">Repeat →</span>
      </div>
    </Card>
  );
  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export function FrameTile({
  label,
  sets,
  equip,
  count,
  pinned,
  href,
}: {
  label: string;
  sets: string;
  equip: string;
  count: number;
  pinned?: boolean;
  href?: string;
}) {
  const inner = (
    <Card className="relative px-3 py-3">
      {pinned && <span className="absolute right-2.5 top-2.5 text-[11px] text-ft-accent">★</span>}
      <div className={["mb-1 font-display text-[13.5px] font-bold leading-tight text-ft-white", pinned ? "pr-4" : ""].join(" ")}>
        {label}
      </div>
      <div className="mb-2 font-body text-[11px] leading-snug text-ft-dim">
        {sets} · {equip}
      </div>
      <div className="font-data text-[10px] uppercase tracking-[0.06em] text-ft-dim">Used {count}×</div>
    </Card>
  );
  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export function EmptyLibrary() {
  return (
    <div className="flex flex-col items-center gap-3.5 px-6 pt-10 text-center">
      <div className="inline-flex h-24 w-24 items-center justify-center rounded-ft-lg border border-dashed border-ft-border bg-ft-surface-alt font-display text-3xl text-ft-dim">
        +
      </div>
      <div>
        <div className="ft-on-bg font-display text-[19px] font-bold tracking-[-0.01em] text-ft-on-bg">
          No workouts yet
        </div>
        <div className="ft-on-bg mx-auto mt-1 max-w-[280px] font-body text-[13px] leading-relaxed text-ft-on-bg-sec">
          Log one and the logger remembers it. Save it as a frame and repeat it in two taps.
        </div>
      </div>
      <div className="flex w-full max-w-[260px] flex-col gap-2">
        <Link href="/log/new-blank" className="block">
          <Button kind="primary" size="lg" fullWidth>
            Log your first workout
          </Button>
        </Link>
        <Link href="/log/library" className="block">
          <Button kind="ghost" size="md" fullWidth onBg>
            Pick from the single-workout library
          </Button>
        </Link>
      </div>
    </div>
  );
}
