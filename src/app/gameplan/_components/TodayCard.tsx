"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import type { ScheduledDay } from "./types";

interface Props {
  scheduledDay: ScheduledDay | null;
  todayCompleted: boolean;
  todaysWorkoutId: string | null;
}

const MOVE_COLOR: Record<string, string> = {
  push: "rgb(var(--ft-push))",
  pull: "rgb(var(--ft-pull))",
  legs: "rgb(var(--ft-legs))",
  core: "rgb(var(--ft-core))",
};

/**
 * Today's workout preview + start CTA.
 *
 * - Already logged → "Done" badge + "Review" link.
 * - Scheduled day exists → exercise list + "Start" CTA (creates workout).
 * - Rest day / no schedule → rest-day card.
 */
export default function TodayCard({ scheduledDay, todayCompleted, todaysWorkoutId }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [starting, setStarting] = useState(false);

  if (todayCompleted && todaysWorkoutId) {
    return (
      <div className="ft-card bg-ft-surface border border-ft-border p-4">
        <div className="flex justify-between items-baseline gap-3">
          <div>
            <div className="font-body text-[9px] uppercase tracking-[0.2em] text-ft-success">
              TODAY · DONE
            </div>
            <div className="font-display text-2xl text-ft-white leading-none mt-1">
              {scheduledDay?.name ?? "Workout"}
            </div>
          </div>
          <Link
            href={`/history/${todaysWorkoutId}`}
            className="font-body text-[11px] uppercase tracking-[0.15em] text-ft-accent border border-ft-accent px-3 py-1.5"
          >
            Review →
          </Link>
        </div>
      </div>
    );
  }

  if (!scheduledDay || scheduledDay.dayType === "rest") {
    return (
      <div className="ft-card bg-ft-surface border border-ft-border p-4">
        <div className="font-body text-[9px] uppercase tracking-[0.2em] text-ft-dim">TODAY</div>
        <div className="font-display text-2xl text-ft-white leading-none mt-1">Rest day</div>
        <p className="font-body text-xs text-ft-light mt-2">
          No training scheduled. Recover well — sleep, stretch, eat to your targets.
        </p>
      </div>
    );
  }

  const moves = new Set(scheduledDay.exercises.map((e) => e.movementPattern).filter(Boolean) as string[]);
  const accentColor =
    moves.has("pull") ? MOVE_COLOR.pull
    : moves.has("push") ? MOVE_COLOR.push
    : moves.has("legs") ? MOVE_COLOR.legs
    : "rgb(var(--ft-accent))";

  const start = async () => {
    setStarting(true);
    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockDayId: scheduledDay.id,
          date: new Date().toISOString().split("T")[0],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const w = await res.json();
      router.push(`/log/${w.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start workout");
      setStarting(false);
    }
  };

  return (
    <div
      className="ft-card bg-ft-surface border border-ft-border p-4 border-l-4"
      style={{ borderLeftColor: accentColor }}
    >
      <div className="flex justify-between items-start gap-3">
        <div>
          <div
            className="font-body text-[9px] uppercase tracking-[0.2em]"
            style={{ color: accentColor }}
          >
            TODAY · {scheduledDay.dayType.toUpperCase()}
          </div>
          <div className="font-display text-2xl text-ft-white leading-none mt-1">
            {scheduledDay.name}
          </div>
        </div>
        <div className="text-right">
          <span className="font-data text-2xl text-ft-white">{scheduledDay.exercises.length}</span>
          <div className="font-body text-[8px] uppercase tracking-[0.18em] text-ft-dim mt-0.5">
            EXERCISES
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-dashed border-ft-border flex flex-col gap-1.5">
        {scheduledDay.exercises.slice(0, 5).map((ex, i) => (
          <div key={i} className="flex justify-between items-baseline">
            <span className="font-body text-[12px] text-ft-white truncate pr-2">{ex.name}</span>
            <span className="font-data text-sm text-ft-light shrink-0">
              {ex.targetSets ?? "?"} × {ex.targetRepRange ?? "?"}
            </span>
          </div>
        ))}
        {scheduledDay.exercises.length > 5 && (
          <div className="font-body text-[10px] uppercase tracking-[0.15em] text-ft-dim mt-1">
            + {scheduledDay.exercises.length - 5} more
          </div>
        )}
      </div>

      <button
        onClick={start}
        disabled={starting}
        className="cta-underline mt-4 w-full text-center font-display text-base text-ft-accent py-2 disabled:opacity-50"
      >
        {starting ? "Starting…" : "Start workout"}
      </button>
    </div>
  );
}
