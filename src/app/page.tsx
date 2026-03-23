"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";

const MOVEMENT_COLORS: Record<string, string> = {
  push: "rgb(var(--ft-push))",
  pull: "rgb(var(--ft-pull))",
  legs: "rgb(var(--ft-legs))",
  core: "rgb(var(--ft-core))",
  stretch: "rgb(var(--ft-core))",
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MUSCLE_GROUPS = [
  "shoulders", "chest", "back", "biceps", "triceps",
  "forearms", "core", "quads", "hamstrings", "glutes", "calves",
];

const HEAT_TIERS = [
  { min: 0, label: "None", opacity: 0.06 },
  { min: 1, label: "Low", opacity: 0.3 },
  { min: 6, label: "Med", opacity: 0.55 },
  { min: 12, label: "High", opacity: 0.85 },
];

function getHeatTier(sets: number) {
  for (let i = HEAT_TIERS.length - 1; i >= 0; i--) {
    if (sets >= HEAT_TIERS[i].min) return HEAT_TIERS[i];
  }
  return HEAT_TIERS[0];
}

interface HomeData {
  activeProgram: { id: string; name: string; durationWeeks: number | null; startDate: string | null } | null;
  activeBlock: {
    id: string; name: string; blockNumber: number; durationWeeks: number | null;
    days: { id: string; name: string; dayNumber: number; dayType: string;
      exercises: { name: string; movementPattern: string | null; targetSets: number | null; targetRepRange: string | null }[];
    }[];
  } | null;
  scheduledDay: {
    id: string; name: string; dayType: string;
    exercises: { name: string; movementPattern: string | null; targetSets: number | null; targetRepRange: string | null }[];
  } | null;
  todayCompleted: boolean;
  todaysWorkout: { id: string; exercises: number; sets: number } | null;
  muscleHeatmap: Record<string, number>;
  weeklyVolume: { week: string; volume: number }[];
  bodyWeights: { date: string; weight: number }[];
  recentPR: { exercise: string; value: number; reps: number | null; date: string; type: string } | null;
  goalPulse: { metricKey: string; target: number; unit: string; current: number | null }[];
  stretchRoutine: { id: string; name: string; items: { name: string; durationSeconds: number; bilateral: boolean }[] } | null;
  currentWeight: number | null;
}

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"week" | "heatmap" | "progress">("week");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    fetch("/api/home")
      .then((r) => {
        if (r.status === 401) {
          setAuthError(true);
          return null;
        }
        if (!r.ok) {
          // API error but user may be authenticated — show empty state, not sign-in
          return null;
        }
        return r.json();
      })
      .then((d) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-ft-surface rounded animate-pulse" />
        <div className="h-40 bg-ft-surface rounded-lg animate-pulse" />
        <div className="h-24 bg-ft-surface rounded-lg animate-pulse" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl text-ft-white">Today</h1>
        <Card>
          <p className="text-secondary font-body text-sm">Sign in to see your daily plan.</p>
          <Link href="/signin" className="cta-underline text-ft-white font-display text-sm mt-3 inline-block">
            Sign In
          </Link>
        </Card>
      </div>
    );
  }

  // Authenticated but API returned no data (e.g. server error or empty state)
  if (!data) {
    return (
      <div className="space-y-6 tab-enter">
        <h1 className="font-display text-2xl text-ft-white tracking-wide">Today</h1>
        <Card>
          <p className="font-display text-lg text-ft-white mb-2">Welcome to FitTrack</p>
          <p className="text-secondary font-body text-sm mb-3">
            Get started by creating a training program or logging a workout.
          </p>
          <div className="flex gap-4">
            <Link href="/programs/new" className="cta-underline text-ft-white font-display text-sm">
              Create Program
            </Link>
            <Link href="/log" className="cta-underline text-ft-white font-display text-sm">
              Quick Log
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const hour = new Date().getHours();
  const showStretch = hour < 10 && !data.todayCompleted && data.stretchRoutine;
  const scheduledDay = data.scheduledDay;

  // Determine movement pattern color for the next action card
  const movementPattern = scheduledDay?.exercises[0]?.movementPattern?.toLowerCase() || "push";
  const borderColor = MOVEMENT_COLORS[movementPattern] || MOVEMENT_COLORS.push;

  // Week days with completion
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // 0=Mon

  return (
    <div className="space-y-5 tab-enter">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-ft-white tracking-wide">Today</h1>
        {data.activeProgram && data.activeBlock && (
          <p className="text-secondary font-body text-sm mt-0.5">
            {data.activeBlock.name} &middot; {data.activeProgram.name}
          </p>
        )}
      </div>

      {/* Priority Zone */}
      <div className="space-y-3">
        {/* Next Action Card */}
        <div
          className="bg-ft-surface rounded-lg p-4 border border-ft-border"
          style={{ borderLeftWidth: 4, borderLeftColor: showStretch ? MOVEMENT_COLORS.stretch : borderColor }}
        >
          {data.todayCompleted ? (
            // Post-workout state
            <div>
              <p className="font-display text-lg text-ft-white">Done for today</p>
              <p className="text-secondary font-body text-sm mt-1">
                {data.todaysWorkout
                  ? `${data.todaysWorkout.exercises} exercises \u00b7 ${data.todaysWorkout.sets} sets`
                  : "Great work!"}
              </p>
              {scheduledDay && data.activeBlock && data.activeBlock.days.length > 0 && (
                <p className="text-tertiary font-body text-xs mt-2">
                  Tomorrow: {data.activeBlock.days[(dayOfWeek + 1) % data.activeBlock.days.length]?.name || "Rest"}
                </p>
              )}
            </div>
          ) : showStretch ? (
            // Morning stretch state
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-display text-lg text-ft-white">{data.stretchRoutine!.name}</p>
                <Link href="/" className="text-tertiary font-body text-xs hover:text-ft-light">
                  Show workout →
                </Link>
              </div>
              <div className="space-y-1 mb-3">
                {data.stretchRoutine!.items.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm font-body">
                    <span className="text-secondary">{item.name}</span>
                    <span className="text-tertiary">{item.durationSeconds}s{item.bilateral ? " /side" : ""}</span>
                  </div>
                ))}
                {data.stretchRoutine!.items.length > 4 && (
                  <p className="text-tertiary font-body text-xs">+{data.stretchRoutine!.items.length - 4} more</p>
                )}
              </div>
              <Link href="/stretch-timer" className="cta-underline text-ft-white font-display text-sm">
                Start Timer
              </Link>
            </div>
          ) : scheduledDay ? (
            // Pre-workout state
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-display text-lg text-ft-white">{scheduledDay.name}</p>
                {data.stretchRoutine && (
                  <Link href="/stretch-timer" className="text-tertiary font-body text-xs hover:text-ft-light">
                    Stretch first →
                  </Link>
                )}
              </div>
              <div className="space-y-1 mb-3">
                {scheduledDay.exercises.slice(0, 5).map((ex, i) => (
                  <div key={i} className="flex justify-between text-sm font-body">
                    <span className="text-secondary">{ex.name}</span>
                    <span className="text-tertiary">
                      {ex.targetSets && ex.targetRepRange ? `${ex.targetSets}×${ex.targetRepRange}` : "—"}
                    </span>
                  </div>
                ))}
                {scheduledDay.exercises.length > 5 && (
                  <p className="text-tertiary font-body text-xs">+{scheduledDay.exercises.length - 5} more</p>
                )}
              </div>
              <Link href="/log" className="cta-underline text-ft-white font-display text-sm">
                Start Workout
              </Link>
            </div>
          ) : (
            // No program
            <div>
              <p className="font-display text-lg text-ft-white">No workout scheduled</p>
              <p className="text-secondary font-body text-sm mt-1">
                Create a program or log a freeform workout.
              </p>
              <div className="flex gap-4 mt-3">
                <Link href="/programs/new" className="cta-underline text-ft-white font-display text-sm">
                  Create Program
                </Link>
                <Link href="/log" className="cta-underline text-ft-white font-display text-sm">
                  Quick Log
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Goal Pulse Row */}
        {data.goalPulse.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {data.goalPulse.slice(0, 3).map((g) => {
              const pct = g.current && g.target ? (g.current / g.target) * 100 : 0;
              const status = pct >= 80 ? "on-track" : pct >= 50 ? "behind" : "off-track";
              const statusColor = status === "on-track" ? "rgb(var(--ft-success))" : status === "behind" ? "rgb(var(--ft-warn))" : "rgb(var(--ft-danger))";
              return (
                <div key={g.metricKey} className="bg-ft-surface rounded-lg p-3 border border-ft-border">
                  <p className="text-tertiary font-body text-[10px] uppercase tracking-wider">
                    {g.metricKey.replace(/_/g, " ")}
                  </p>
                  <p className="font-handwritten text-2xl text-ft-white mt-0.5">
                    {g.current ?? "—"}
                  </p>
                  <div className="w-full h-1.5 bg-ft-card rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: statusColor }}
                    />
                  </div>
                  <p className="font-body text-[9px] mt-1" style={{ color: statusColor }}>
                    {status === "on-track" ? "On track" : status === "behind" ? "Behind" : "Off track"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="section-divider pt-4">
        <div className="flex gap-1 mb-4">
          {(["week", "heatmap", "progress"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-3 py-1.5 font-body text-sm font-semibold rounded-md transition-colors ${
                activeSubTab === tab
                  ? "bg-ft-card text-ft-white"
                  : "text-tertiary hover:text-secondary"
              }`}
            >
              {tab === "week" ? "Week Plan" : tab === "heatmap" ? "Heatmap" : "Progress"}
            </button>
          ))}
        </div>

        <div className="tab-enter" key={activeSubTab}>
          {activeSubTab === "week" && (
            <WeekPlan
              days={data.activeBlock?.days || []}
              currentDay={dayOfWeek}
              todayCompleted={data.todayCompleted}
            />
          )}

          {activeSubTab === "heatmap" && (
            <MuscleHeatmap heatmap={data.muscleHeatmap} />
          )}

          {activeSubTab === "progress" && (
            <ProgressView
              weeklyVolume={data.weeklyVolume}
              bodyWeights={data.bodyWeights}
              recentPR={data.recentPR}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function WeekPlan({
  days,
  currentDay,
  todayCompleted,
}: {
  days: { id: string; name: string; dayNumber: number; dayType: string }[];
  currentDay: number;
  todayCompleted: boolean;
}) {
  return (
    <div>
      {/* Day cards */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {DAY_LABELS.map((label, i) => {
          const day = days[i % (days.length || 1)];
          const isToday = i === currentDay;
          const isPast = i < currentDay;
          const movementColor = day
            ? MOVEMENT_COLORS[day.dayType === "rest" ? "core" : "push"] || MOVEMENT_COLORS.push
            : "rgb(var(--ft-muted))";

          return (
            <div
              key={label}
              className={`flex flex-col items-center min-w-[52px] py-2.5 px-2 rounded-lg border transition-colors ${
                isToday
                  ? "border-ft-accent/50 bg-ft-card"
                  : "border-ft-border bg-ft-surface"
              }`}
            >
              <span className="text-tertiary font-body text-[10px] uppercase">{label}</span>
              <span
                className="w-2.5 h-2.5 rounded-full mt-1.5 mb-1"
                style={{ backgroundColor: day ? movementColor : "transparent" }}
              />
              <span className="text-secondary font-body text-[10px] text-center leading-tight">
                {day?.name?.split(" ")[0] || "Rest"}
              </span>
              {isPast && todayCompleted && (
                <span className="text-ft-success text-xs mt-0.5">✓</span>
              )}
              {isToday && (
                <span className="w-1 h-1 rounded-full bg-ft-accent mt-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Edit scope buttons */}
      <div className="flex gap-2 mt-3">
        {["Today Only", "This Week", "This Week Forward"].map((label) => (
          <button
            key={label}
            className="flex-1 py-2 px-2 text-[10px] font-body font-semibold text-tertiary border border-ft-border rounded-md hover:border-ft-dim hover:text-secondary transition-colors"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MuscleHeatmap({ heatmap }: { heatmap: Record<string, number> }) {
  return (
    <div className="space-y-3">
      {/* Body map + list side by side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Abstract body map */}
        <div className="flex flex-col items-center gap-1">
          {[
            { label: "Shoulders", key: "shoulders", w: "w-16" },
            { label: "Chest", key: "chest", w: "w-14" },
            { label: "Back", key: "back", w: "w-14" },
            { label: "Arms", key: "biceps", w: "w-12" },
            { label: "Core", key: "core", w: "w-10" },
            { label: "Quads", key: "quads", w: "w-12" },
            { label: "Hams", key: "hamstrings", w: "w-12" },
            { label: "Glutes", key: "glutes", w: "w-10" },
            { label: "Calves", key: "calves", w: "w-8" },
          ].map((part) => {
            const sets = heatmap[part.key] || 0;
            const tier = getHeatTier(sets);
            return (
              <div
                key={part.key}
                className={`${part.w} h-5 rounded-sm flex items-center justify-center`}
                style={{ backgroundColor: `rgba(var(--ft-accent) / ${tier.opacity})` }}
              >
                <span className="text-[8px] font-body text-ft-white/70">{part.label}</span>
              </div>
            );
          })}
        </div>

        {/* List view */}
        <div className="space-y-1">
          {MUSCLE_GROUPS.map((muscle) => {
            const sets = heatmap[muscle] || 0;
            const tier = getHeatTier(sets);
            return (
              <div key={muscle} className="flex items-center justify-between">
                <span className="text-secondary font-body text-xs capitalize">{muscle}</span>
                <div className="flex items-center gap-2">
                  <span className="text-tertiary font-body text-[10px]">{sets}s</span>
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: `rgba(var(--ft-accent) / ${tier.opacity})` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 pt-2 section-divider">
        {HEAT_TIERS.map((tier) => (
          <div key={tier.label} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: `rgba(var(--ft-accent) / ${tier.opacity})` }}
            />
            <span className="text-tertiary font-body text-[9px]">{tier.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressView({
  weeklyVolume,
  bodyWeights,
  recentPR,
}: {
  weeklyVolume: { week: string; volume: number }[];
  bodyWeights: { date: string; weight: number }[];
  recentPR: { exercise: string; value: number; reps: number | null; date: string; type: string } | null;
}) {
  const maxVol = Math.max(...weeklyVolume.map((w) => w.volume), 1);
  const currentWeek = weeklyVolume.length - 1;

  return (
    <div className="space-y-4">
      {/* Weekly Volume Chart */}
      <div>
        <p className="text-tertiary font-body text-[10px] uppercase tracking-wider mb-2">Weekly Volume</p>
        <div className="flex items-end gap-1 h-24">
          {weeklyVolume.map((w, i) => (
            <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${Math.max((w.volume / maxVol) * 80, 4)}px`,
                  backgroundColor: i === currentWeek ? "rgb(var(--ft-accent))" : "rgb(var(--ft-card))",
                }}
              />
              <span className="text-tertiary font-body text-[8px]">W{i + 1}</span>
            </div>
          ))}
          {weeklyVolume.length === 0 && (
            <p className="text-tertiary font-body text-xs">No volume data yet</p>
          )}
        </div>
      </div>

      {/* Body Weight Chart */}
      {bodyWeights.length > 0 && (
        <div className="section-divider pt-3">
          <p className="text-tertiary font-body text-[10px] uppercase tracking-wider mb-2">Body Weight</p>
          <div className="flex items-end gap-1 h-16">
            {bodyWeights.slice(-8).map((bw, i, arr) => {
              const min = Math.min(...arr.map((b) => b.weight));
              const max = Math.max(...arr.map((b) => b.weight));
              const range = max - min || 1;
              const height = ((bw.weight - min) / range) * 48 + 8;
              return (
                <div key={bw.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="relative w-full flex justify-center">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: i === arr.length - 1 ? "rgb(var(--ft-accent))" : "rgb(var(--ft-dim))",
                        marginTop: `${56 - height}px`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-tertiary font-body text-[8px]">{bodyWeights[0]?.date.slice(5)}</span>
            <span className="text-tertiary font-body text-[8px]">{bodyWeights[bodyWeights.length - 1]?.date.slice(5)}</span>
          </div>
        </div>
      )}

      {/* Recent PR */}
      {recentPR && (
        <div className="section-divider pt-3">
          <p className="text-tertiary font-body text-[10px] uppercase tracking-wider mb-2">Latest PR</p>
          <div className="bg-ft-card rounded-lg p-3 border border-ft-border">
            <p className="font-display text-sm text-ft-white">{recentPR.exercise}</p>
            <p className="font-handwritten text-2xl text-ft-white mt-1">
              {recentPR.value} × {recentPR.reps ?? "—"}
            </p>
            <p className="text-tertiary font-body text-xs mt-1">{recentPR.date}</p>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="section-divider pt-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "History", href: "/history", icon: "📖" },
            { label: "Progress", href: "/progress", icon: "📈" },
            { label: "Exercises", href: "/exercises", icon: "💪" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-ft-surface rounded-lg p-3 border border-ft-border text-center hover:border-ft-dim transition-colors"
            >
              <span className="text-lg block">{link.icon}</span>
              <span className="text-ft-light font-body text-xs mt-1 block">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
