"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

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
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    fetch("/api/stretch-routines")
      .then((r) => (r.ok ? r.json() : []))
      .then((routines) => {
        if (routines.length > 0) {
          setRoutine(routines[0]);
          setSecondsRemaining(routines[0].items[0]?.durationSeconds || 30);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const advanceToNext = useCallback(() => {
    if (!routine) return;

    const currentItem = routine.items[currentIndex];

    // If bilateral and currently on left, switch to right
    if (currentItem.bilateral && side === "left") {
      setSide("right");
      setSecondsRemaining(currentItem.durationSeconds);
      return;
    }

    // Move to next exercise
    const nextIndex = currentIndex + 1;
    if (nextIndex >= routine.items.length) {
      // Routine complete
      setIsComplete(true);
      setIsRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);

      // Log the activity
      fetch("/api/activity-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString(),
          activityType: "STRETCH",
          durationMin: Math.ceil(totalElapsed / 60),
          notes: `Completed ${routine.name}: ${routine.items.length} stretches`,
        }),
      }).catch(() => {});
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

  const toggleRunning = () => {
    if (!isRunning && !startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
    setIsRunning(!isRunning);
  };

  const skip = () => {
    advanceToNext();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-16 w-16 bg-ft-surface rounded-full animate-pulse" />
      </div>
    );
  }

  if (!routine || routine.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-xl text-ft-white mb-2">No Stretch Routine</p>
        <p className="text-secondary font-body text-sm mb-4">
          Set up a morning stretch routine to get started.
        </p>
        <button
          onClick={() => router.push("/")}
          className="cta-underline text-ft-white font-display text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center tab-enter">
        <p className="font-display text-2xl text-ft-white mb-2">Done!</p>
        <p className="font-handwritten text-4xl text-ft-success mb-4">
          {Math.floor(totalElapsed / 60)}:{String(totalElapsed % 60).padStart(2, "0")}
        </p>
        <p className="text-secondary font-body text-sm mb-6">
          {routine.items.length} stretches completed
        </p>
        <button
          onClick={() => router.push("/")}
          className="cta-underline text-ft-white font-display text-base"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const currentItem = routine.items[currentIndex];
  const nextItem = routine.items[currentIndex + 1];
  const progress = ((currentIndex + (side === "right" ? 0.5 : 0)) / routine.items.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-8">
      {/* Progress bar */}
      <div className="w-full max-w-sm">
        <div className="w-full h-1 bg-ft-card rounded-full overflow-hidden">
          <div
            className="h-full bg-ft-accent rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-tertiary font-body text-[10px] text-center mt-1">
          {currentIndex + 1} / {routine.items.length}
        </p>
      </div>

      {/* Main timer area */}
      <div className="flex flex-col items-center text-center">
        <p className="font-display text-xl text-ft-white mb-1">{currentItem.name}</p>
        {currentItem.bilateral && (
          <p className="font-body text-sm text-ft-core uppercase tracking-wider mb-4">
            {side} side
          </p>
        )}

        {/* Circular timer */}
        <div className="relative w-48 h-48 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="rgb(var(--ft-card))"
              strokeWidth="4"
            />
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="rgb(var(--ft-accent))"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - secondsRemaining / currentItem.durationSeconds)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-handwritten text-5xl text-ft-white">
              {secondsRemaining}
            </span>
          </div>
        </div>

        {nextItem && (
          <p className="text-tertiary font-body text-xs">
            Next: {nextItem.name}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-8">
        <button
          onClick={() => router.push("/")}
          className="text-tertiary font-body text-sm hover:text-ft-light"
        >
          Quit
        </button>
        <button
          onClick={toggleRunning}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgb(var(--ft-accent))" }}
        >
          <span className="text-white font-display text-lg">
            {isRunning ? "❚❚" : "▶"}
          </span>
        </button>
        <button
          onClick={skip}
          className="text-tertiary font-body text-sm hover:text-ft-light"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
