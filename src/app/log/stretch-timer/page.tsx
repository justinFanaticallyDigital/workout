"use client";

/** Stretch timer — the first saved routine, one stretch at a time (bilateral = left then right); logs an ActivityLog on completion. */
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Btn, Card, ScreenHeader, Stamp } from "@/components/kit";

interface StretchItem {
  name: string;
  durationSeconds: number;
  bilateral: boolean;
}
interface StretchRoutine {
  id: string;
  name: string;
  items: StretchItem[];
}

export default function StretchTimerPage() {
  const router = useRouter();
  const [routine, setRoutine] = useState<StretchRoutine | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [side, setSide] = useState<"left" | "right">("left");
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/stretch-routines")
      .then((r) => (r.ok ? r.json() : []))
      .then((routines) => {
        const list = Array.isArray(routines) ? routines : routines.routines ?? [];
        if (list.length > 0) {
          setRoutine(list[0]);
          setSecondsRemaining(list[0].items[0]?.durationSeconds || 30);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const advanceToNext = useCallback(() => {
    if (!routine) return;
    const currentItem = routine.items[currentIndex];
    if (currentItem.bilateral && side === "left") {
      setSide("right");
      setSecondsRemaining(currentItem.durationSeconds);
      return;
    }
    const nextIndex = currentIndex + 1;
    if (nextIndex >= routine.items.length) {
      setIsComplete(true);
      setIsRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      fetch("/api/activity-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: new Date().toISOString(), activityType: "STRETCH", durationMin: Math.max(1, Math.ceil(totalElapsed / 60)), notes: `Completed ${routine.name}: ${routine.items.length} stretches` }),
      }).catch(() => undefined);
      return;
    }
    setCurrentIndex(nextIndex);
    setSide("left");
    setSecondsRemaining(routine.items[nextIndex].durationSeconds);
  }, [routine, currentIndex, side, totalElapsed]);

  useEffect(() => {
    if (isRunning && !isComplete) {
      intervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            advanceToNext();
            return 0;
          }
          return prev - 1;
        });
        setTotalElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isComplete, advanceToNext]);

  const header = <ScreenHeader title="Stretch" back={{ href: "/training", label: "Training" }} sub={routine?.name} />;

  if (loading) {
    return (
      <div className="pb-8">
        {header}
        <div className="py-16 text-center font-body text-[13px] text-ft-dim">Loading…</div>
      </div>
    );
  }
  if (!routine || routine.items.length === 0) {
    return (
      <div className="pb-8">
        {header}
        <div className="px-5">
          <Card className="px-4 py-4">
            <div className="font-data text-[14.5px] font-bold text-ft-white">No stretch routine yet</div>
            <p className="mt-1 font-body text-[13px] text-ft-light">Routines are created through the stretch-routines API; the first one saved runs here.</p>
            <Btn small href="/training" className="mt-3">
              Back to Training
            </Btn>
          </Card>
        </div>
      </div>
    );
  }
  if (isComplete) {
    return (
      <div className="pb-8">
        {header}
        <div className="px-5">
          <Card className="px-4 py-6 text-center">
            <Stamp tone="success">Done</Stamp>
            <div className="mt-3 font-data text-[44px] font-bold leading-none tabular-nums text-ft-white">
              {Math.floor(totalElapsed / 60)}:{String(totalElapsed % 60).padStart(2, "0")}
            </div>
            <p className="mt-2 font-body text-[13px] text-ft-light">{routine.items.length} stretches · logged as an activity</p>
            <Btn href="/training" className="mt-4">
              Back to Training
            </Btn>
          </Card>
        </div>
      </div>
    );
  }

  const currentItem = routine.items[currentIndex];
  const nextItem = routine.items[currentIndex + 1];
  const progress = ((currentIndex + (side === "right" ? 0.5 : 0)) / routine.items.length) * 100;

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col pb-8">
      {header}
      <div className="px-5">
        <div className="h-1 overflow-hidden rounded-full bg-ft-border-faint">
          <div className="h-full rounded-full bg-ft-accent transition-[width]" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-1 text-center font-data text-[10px] uppercase tracking-[0.14em] text-ft-dim">
          {currentIndex + 1} / {routine.items.length}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
        <div className="font-data text-[18px] font-bold text-ft-white">{currentItem.name}</div>
        {currentItem.bilateral && (
          <Stamp tone="gold" className="mt-1.5">
            {side} side
          </Stamp>
        )}
        <RingTimer progress={secondsRemaining / currentItem.durationSeconds} remainingSeconds={secondsRemaining} />
        <div className="font-body text-[12.5px] text-ft-dim">{nextItem ? `Next: ${nextItem.name}` : "Last one"}</div>
      </div>

      <div className="flex items-center justify-center gap-6 px-5 pt-4">
        <Btn kind="quiet" small onClick={() => router.push("/training")}>
          Quit
        </Btn>
        <button type="button" onClick={() => setIsRunning((r) => !r)} aria-label={isRunning ? "Pause" : "Start"} className="flex h-16 w-16 items-center justify-center rounded-full bg-ft-accent font-data text-[18px] text-ft-on-accent shadow-ft-sm">
          {isRunning ? "❚❚" : "▶"}
        </button>
        <Btn kind="quiet" small onClick={advanceToNext}>
          Skip
        </Btn>
      </div>
    </div>
  );
}

/** Radial countdown: teal arc over a faint track, Oxanium time in the centre. */
function RingTimer({ progress, remainingSeconds }: { progress: number; remainingSeconds: number }) {
  const size = 192;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  const min = Math.floor(remainingSeconds / 60);
  const sec = remainingSeconds % 60;
  return (
    <div className="relative my-5 flex h-48 w-48 items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--ft-border-faint))" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--ft-accent))" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - clamped)} style={{ transition: "stroke-dashoffset 1s linear" }} />
      </svg>
      <div className="absolute font-data text-[44px] font-bold tabular-nums text-ft-white">
        {min}:{sec.toString().padStart(2, "0")}
      </div>
    </div>
  );
}
